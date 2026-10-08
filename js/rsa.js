/**
 * =========================================================================================
 *                   AEGISBOX - MANUAL RSA CRYPTOGRAPHY ENGINE
 *        Implementasi Algoritma Kriptografi Asimetris RSA Murni (Pure Native JavaScript)
 *        Dibuat Secara Mandiri Tanpa Library Eksternal untuk Tugas Besar Kriptografi
 * =========================================================================================
 * 
 * PANDUAN CEPAT PRESENTASI / DEMO KE DOSEN:
 * -----------------------------------------------------------------------------------------
 * 1. Pembangkitan Kunci (Key Generation):
 *    -> Buka fungsi: generateKeyPair(keyBits) di baris ~320
 *    -> Rumus: p & q prima acak -> n = p * q -> phi = (p-1)*(q-1) -> e (koprima) -> d = e^(-1) mod phi
 * 
 * 2. Enkripsi Pesan (Encryption):
 *    -> Buka fungsi: encryptText(plaintext, publicKey) di baris ~515
 *    -> Rumus: c = (m^e) mod n  (dilakukan per blok agar syarat m < n terpenuhi)
 * 
 * 3. Dekripsi Pesan (Decryption):
 *    -> Buka fungsi: decryptText(cipherPayload, privateKey) di baris ~575
 *    -> Rumus: m = (c^d) mod n  (mengembalikan ciphertext ke plaintext asli)
 * 
 * 4. Pemangkatan Modular Cepat:
 *    -> Buka fungsi: modPow(base, exp, mod) di baris ~115
 *    -> Menggunakan metode Square-and-Multiply agar tidak terjadi integer overflow.
 * 
 * 5. Uji Keprimaan:
 *    -> Buka fungsi: millerRabinTest(n, rounds) di baris ~245
 *    -> Menguji keprimaan probabilistik 25 putaran tanpa pembagian lambat.
 * 
 * 6. Tanda Tangan Digital (Digital Signature):
 *    -> Buka fungsi: signMessage() & verifySignature() di baris ~640
 *    -> Rumus Sign: S = H(M)^d mod n | Rumus Verifikasi: V = S^e mod n == H(M)
 * =========================================================================================
 */

const ManualRSA = (function () {

    // =====================================================================================
    // 0. DAFTAR BILANGAN PRIMA KECIL (PRE-FILTERING)
    // =====================================================================================
    // Digunakan untuk menyaring kandidat bilangan prima dengan sangat cepat sebelum
    // menjalankan uji Miller-Rabin yang lebih berat.
    const SMALL_PRIMES = [
        2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n, 43n, 47n,
        53n, 59n, 61n, 67n, 71n, 73n, 79n, 83n, 89n, 97n, 101n, 103n, 107n, 109n,
        113n, 127n, 131n, 137n, 139n, 149n, 151n, 157n, 163n, 167n, 173n, 179n,
        181n, 191n, 193n, 197n, 199n, 211n, 223n, 227n, 229n, 233n, 239n, 241n, 251n
    ];

    // =====================================================================================
    // 1. ALGORITMA EUCLIDEAN STANDAR (PBB / GCD)
    // =====================================================================================
    /**
     * Menghitung Pembagi Bersama Terbesar (PBB atau Greatest Common Divisor / GCD).
     * 
     * TUJUAN DI RSA:
     * Digunakan untuk memastikan eksponen publik 'e' RELATIF PRIMA terhadap totient 'phi',
     * yaitu syarat mutlak: gcd(e, phi) === 1.
     * 
     * CARA KERJA (Algoritma Euclidean):
     * Selama sisa bagi (y) belum 0, geser nilai x menjadi y, dan y menjadi x mod y.
     * 
     * @param {bigint} a 
     * @param {bigint} b 
     * @returns {bigint} Nilai PBB/GCD dari a dan b
     */
    function gcd(a, b) {
        let x = a < 0n ? -a : a;
        let y = b < 0n ? -b : b;
        while (y !== 0n) {
            let temp = y;
            y = x % y;
            x = temp;
        }
        return x;
    }

    // =====================================================================================
    // 2. ALGORITMA EUCLIDEAN DIPERLUAS (EXTENDED EUCLIDEAN ALGORITHM)
    // =====================================================================================
    /**
     * Algoritma Euclidean Diperluas.
     * 
     * TUJUAN DI RSA:
     * Persamaan Bézout menyatakan: a*x + b*y = gcd(a, b).
     * Jika gcd(e, phi) = 1, maka: e*x + phi*y = 1, yang berarti:
     * e*x = 1 (mod phi) -> Nilai 'x' adalah invers perkalian modular dari 'e',
     * yaitu KUNCI PRIVAT 'd'!
     * 
     * @param {bigint} a Nilai e
     * @param {bigint} b Nilai phi(n)
     * @returns {object} { gcd, x, y, steps }
     */
    function extendedEuclidean(a, b) {
        let old_r = a, r = b;
        let old_s = 1n, s = 0n;
        let old_t = 0n, t = 1n;
        const steps = [];

        while (r !== 0n) {
            const quotient = old_r / r;
            steps.push({
                old_r: old_r.toString(),
                r: r.toString(),
                q: quotient.toString(),
                rem: (old_r % r).toString()
            });

            let temp_r = r;
            r = old_r - quotient * r;
            old_r = temp_r;

            let temp_s = s;
            s = old_s - quotient * s;
            old_s = temp_s;

            let temp_t = t;
            t = old_t - quotient * t;
            old_t = temp_t;
        }

        return {
            gcd: old_r,
            x: old_s,
            y: old_t,
            steps: steps
        };
    }

    // =====================================================================================
    // 3. INVERS PERKALIAN MODULAR (MODULAR INVERSE)
    // =====================================================================================
    /**
     * Menghitung Invers Modular: d = e^(-1) mod phi(n)
     * 
     * RUMUS MATEMATIKA:
     * (e * d) mod phi(n) = 1
     * 
     * TUJUAN DI RSA:
     * Inilah rumus untuk membangkitkan KUNCI PRIVAT 'd'.
     * Fungsi ini memanggil extendedEuclidean(), lalu memastikan hasil d bernilai positif.
     * 
     * @param {bigint} e Eksponen publik
     * @param {bigint} phi Nilai Totient Euler (p-1)*(q-1)
     * @returns {object} { d, steps }
     */
    function modInverse(e, phi) {
        const result = extendedEuclidean(e, phi);
        if (result.gcd !== 1n) {
            throw new Error(`Invers modulo tidak ada karena gcd(${e}, ${phi}) = ${result.gcd} !== 1`);
        }
        // Pastikan nilai d selalu positif dalam rentang [1, phi - 1]
        let d = result.x % phi;
        if (d < 0n) {
            d += phi;
        }
        return { d, steps: result.steps };
    }

    // =====================================================================================
    // 4. PEMANGKATAN MODULAR CEPAT (SQUARE-AND-MULTIPLY / BINARY EXPONENTIATION)
    // =====================================================================================
    /**
     * Menghitung (base^exp) mod mod secara efisien tanpa overflow.
     * 
     * KENAPA FUNGSI INI SANGAT KRUSIAL?
     * Jika menghitung biasa: m^e atau c^d, angkanya bisa mencapai ribuan digit dan
     * membuat komputer crash karena kehabisan memori (integer overflow).
     * 
     * CARA KERJA ALGORITMA SQUARE-AND-MULTIPLY:
     * 1. Eksponen diubah ke representasi bit biner.
     * 2. Setiap perulangan, nilai dikuadratkan: (b = b * b mod n) -> [SQUARE].
     * 3. Jika bit saat ini bernilai 1, nilai dikalikan dengan basis: (result = result * b mod n) -> [MULTIPLY].
     * 4. Kompleksitasnya sangat mangkus: O(log exp), bukan O(exp).
     * 
     * DIGUNAKAN UNTUK:
     * - Enkripsi: c = modPow(m, e, n)
     * - Dekripsi: m = modPow(c, d, n)
     * - Tanda Tangan: S = modPow(h, d, n)
     * - Verifikasi: V = modPow(S, e, n)
     * 
     * @param {bigint} base Bilangan basis (misal pesan m atau ciphertext c)
     * @param {bigint} exp Eksponen (misal e atau d)
     * @param {bigint} mod Modulus n
     * @returns {bigint} Hasil (base^exp) mod mod
     */
    function modPow(base, exp, mod) {
        if (mod === 1n) return 0n;
        let result = 1n;
        let b = base % mod;
        let e = exp;

        while (e > 0n) {
            // Jika bit paling belakang bernilai 1 (ganjil), lakukan Multiply
            if ((e & 1n) === 1n) {
                result = (result * b) % mod;
            }
            // Geser bit eksponen ke kanan 1 posisi (e = e / 2)
            e >>= 1n;
            // Lakukan Square untuk putaran berikutnya
            b = (b * b) % mod;
        }
        return result;
    }

    /**
     * Pemangkatan Modular dengan Pencatatan Langkah Detail (Square-and-Multiply Trace).
     * Berguna untuk menunjukkan visualisasi cara kerja algoritma bit-demi-bit kepada penguji.
     */
    function modPowWithTrace(base, exp, mod, maxRecordedSteps = 30) {
        if (mod === 1n) return { result: 0n, steps: [] };
        let result = 1n;
        let b = base % mod;
        let e = exp;
        const steps = [];
        let stepCount = 0;

        const binStr = exp.toString(2);

        for (let i = 0; i < binStr.length; i++) {
            const bit = binStr[i];
            const prevRes = result;

            // Tahap Square
            if (i > 0) {
                result = (result * result) % mod;
            }

            let action = i === 0 ? "Inisialisasi" : `Square: (${prevRes}^2) mod n = ${result}`;

            // Tahap Multiply jika bit bernilai 1
            if (bit === '1') {
                const beforeMul = result;
                result = (result * b) % mod;
                action += i === 0 ? `Set bit awal 1` : ` | Multiply: (${beforeMul} * ${b}) mod n = ${result}`;
            }

            if (stepCount < maxRecordedSteps) {
                steps.push({
                    stepIndex: i + 1,
                    bit: bit,
                    action: action,
                    currentResult: result.toString()
                });
                stepCount++;
            }
        }

        return { result, steps, totalBits: binStr.length };
    }

    // =====================================================================================
    // 5. PEMBANGKIT BILANGAN ACAK BESAR (BIGINT RANDOM GENERATOR)
    // =====================================================================================
    /**
     * Menghasilkan bilangan acak BigInt dengan panjang bit tertentu.
     * Memastikan bit tertinggi bernilai 1 (agar panjang bit pas) dan
     * bit terendah bernilai 1 (agar bilangan pasti ganjil, syarat awal calon prima).
     */
    function randomBigIntBits(bits) {
        if (bits < 2) bits = 2;
        let hex = '';
        const bytesCount = Math.ceil(bits / 8);
        for (let i = 0; i < bytesCount; i++) {
            const byte = Math.floor(Math.random() * 256);
            hex += byte.toString(16).padStart(2, '0');
        }
        let n = BigInt('0x' + hex);
        const mask = (1n << BigInt(bits)) - 1n;
        n = n & mask;
        n |= (1n << BigInt(bits - 1)); // Paksa bit tertinggi bernilai 1
        n |= 1n;                      // Paksa bit terendah bernilai 1 (ganjil)
        return n;
    }

    /**
     * Menghasilkan BigInt acak dalam batas [0, maxLimit]
     */
    function randomBigIntLimit(maxLimit) {
        if (maxLimit <= 0n) return 0n;
        const bitLen = maxLimit.toString(2).length;
        const bytesCount = Math.ceil(bitLen / 8);
        const mask = (1n << BigInt(bitLen)) - 1n;
        while (true) {
            let hex = '';
            for (let i = 0; i < bytesCount; i++) {
                const byte = Math.floor(Math.random() * 256);
                hex += byte.toString(16).padStart(2, '0');
            }
            const val = BigInt('0x' + (hex || '0')) & mask;
            if (val <= maxLimit) {
                return val;
            }
        }
    }

    /**
     * Bilangan acak BigInt dalam rentang [min, max]
     */
    function randomBigIntRange(min, max) {
        if (max <= min) return min;
        const range = max - min;
        return min + randomBigIntLimit(range);
    }

    // =====================================================================================
    // 6. UJI KEPRIMAAN PROBABILISTIK MILLER-RABIN (MILLER-RABIN PRIMALITY TEST)
    // =====================================================================================
    /**
     * Uji Keprimaan Miller-Rabin.
     * 
     * TUJUAN DI RSA:
     * RSA membutuhkan dua bilangan prima besar p dan q. Untuk mengecek apakah sebuah angka
     * ratusan bit adalah bilangan prima, pengujian pembagian biasa (trial division) akan
     * membutuhkan waktu miliaran tahun. Uji Miller-Rabin menyelesaikannya dalam milidetik!
     * 
     * TEOREMA & CARA KERJA:
     * 1. Saring dulu dengan bilangan prima kecil (2, 3, 5, 7, ...).
     * 2. Nyatakan (n - 1) sebagai: (2^s) * d, di mana d adalah bilangan ganjil.
     * 3. Ambil basis acak 'a' dalam rentang [2, n - 2].
     * 4. Hitung x = (a^d) mod n.
     * 5. Jika x == 1 atau x == n - 1, maka n lolos pada putaran ini (kemungkinan prima).
     * 6. Kuadratkan x sebanyak (s - 1) kali: x = (x^2) mod n.
     *    Jika x mencapai n - 1, maka lolos.
     * 7. Jika diuji sebanyak 25 putaran dan selalu lolos, probabilitas salahnya < 4^(-25)
     *    (hampir 100% dipastikan prima).
     * 
     * @param {bigint} n Bilangan ganjil yang akan diuji
     * @param {number} rounds Jumlah putaran pengujian (default: 25)
     * @returns {boolean} true jika kemungkinan besar prima, false jika komposit (bukan prima)
     */
    function millerRabinTest(n, rounds = 25) {
        if (n < 2n) return false;
        if (n === 2n || n === 3n) return true;
        if ((n & 1n) === 0n) return false; // Bilangan genap selain 2 pasti bukan prima

        // Pre-filter cepat dengan prima kecil
        for (const sp of SMALL_PRIMES) {
            if (n === sp) return true;
            if (n % sp === 0n) return false;
        }

        // Tuliskan n - 1 = (2^s) * d
        let d = n - 1n;
        let s = 0n;
        while ((d & 1n) === 0n) {
            d >>= 1n;
            s++;
        }

        // Lakukan pengujian sebanyak 'rounds' putaran
        for (let i = 0; i < rounds; i++) {
            const a = randomBigIntRange(2n, n - 2n);
            let x = modPow(a, d, n);

            if (x === 1n || x === n - 1n) {
                continue;
            }

            let composite = true;
            for (let r = 1n; r < s; r++) {
                x = modPow(x, 2n, n);
                if (x === n - 1n) {
                    composite = false;
                    break;
                }
            }

            if (composite) {
                return false; // Pasti bukan bilangan prima
            }
        }

        return true; // Kemungkinan besar bilangan prima murni
    }

    /**
     * Membangkitkan bilangan prima acak dengan panjang bit tertentu.
     * Berulang kali membuat angka acak ganjil sampai lolos uji Miller-Rabin.
     */
    function generatePrime(bits = 64, rounds = 25) {
        let candidate;
        let attempts = 0;
        while (true) {
            attempts++;
            candidate = randomBigIntBits(bits);
            if (millerRabinTest(candidate, rounds)) {
                return candidate;
            }
            if (attempts > 10000) {
                throw new Error("Gagal menemukan bilangan prima setelah 10000 percobaan");
            }
        }
    }

    // =====================================================================================
    // 7. TAHAP 1 RSA: PEMBANGKITAN PASANGAN KUNCI (KEY GENERATION)
    // =====================================================================================
    /**
     * Pembangkitan Pasangan Kunci RSA (Kunci Publik & Kunci Privat).
     * 
     * ALUR 5 LANGKAH STANDAR MATEMATIKA RSA:
     * -------------------------------------------------------------------------------------
     * Langkah 1: Pilih dua bilangan prima acak besar yang berlainan: p dan q
     * Langkah 2: Hitung Modulus n = p * q
     *            (Nilai n ini dipublikasikan bersama kunci publik dan privat)
     * Langkah 3: Hitung Fungsi Totient Euler phi(n) = (p - 1) * (q - 1)
     *            (Nilai phi dirahasiakan, hanya digunakan untuk menghitung d)
     * Langkah 4: Pilih eksponen publik 'e' sehingga 1 < e < phi dan gcd(e, phi) === 1
     *            (Umumnya dipilih 65537 karena memiliki sifat matematis yang optimal)
     * Langkah 5: Hitung eksponen privat 'd' menggunakan Algoritma Euclidean Diperluas
     *            sehingga: (e * d) mod phi = 1  <=>  d = e^(-1) mod phi
     * 
     * HASIL AKHIR:
     * - KUNCI PUBLIK : Pasangan (e, n) -> Boleh disebarkan ke semua orang
     * - KUNCI PRIVAT : Pasangan (d, n) -> Harus dirahasiakan oleh pemilik kunci
     * 
     * @param {number} keyBits Total bit modulus n (misal 128-bit)
     * @returns {object} { publicKey, privateKey, mathDetails }
     */
    function generateKeyPair(keyBits = 128) {
        const primeBits = Math.floor(keyBits / 2);

        // Langkah 1: Bangkitkan dua bilangan prima acak p dan q
        let p = generatePrime(primeBits);
        let q = generatePrime(primeBits);
        while (p === q) {
            q = generatePrime(primeBits);
        }

        // Langkah 2: Hitung Modulus n = p * q
        const n = p * q;

        // Langkah 3: Hitung Euler Totient phi(n) = (p - 1) * (q - 1)
        const phi = (p - 1n) * (q - 1n);

        // Langkah 4: Pilih eksponen publik e yang relatif prima terhadap phi
        const candidateE = [65537n, 17n, 257n, 65539n, 3n];
        let e = null;
        for (const cand of candidateE) {
            if (cand < phi && gcd(cand, phi) === 1n) {
                e = cand;
                break;
            }
        }

        if (!e) {
            let cand = 65537n;
            while (cand < phi) {
                if (gcd(cand, phi) === 1n) {
                    e = cand;
                    break;
                }
                cand += 2n;
            }
        }

        // Langkah 5: Hitung eksponen privat d via Extended Euclidean
        const { d, steps: euclideanSteps } = modInverse(e, phi);

        return {
            publicKey: {
                e: e.toString(),
                n: n.toString(),
                bitLength: n.toString(2).length
            },
            privateKey: {
                d: d.toString(),
                n: n.toString(),
                bitLength: n.toString(2).length
            },
            mathDetails: {
                p: p.toString(),
                q: q.toString(),
                n: n.toString(),
                phi: phi.toString(),
                e: e.toString(),
                d: d.toString(),
                keyBits: keyBits,
                actualBits: n.toString(2).length,
                euclideanSampleSteps: euclideanSteps.slice(0, 10)
            }
        };
    }

    // =====================================================================================
    // 8. KONVERSI TEKS KE DERETAN BYTE (MANUAL UTF-8 ENCODER / DECODER)
    // =====================================================================================
    /**
     * Konversi string teks UTF-8 ke deretan byte array secara manual murni tanpa library.
     * Mendukung karakter standar ASCII hingga karakter multi-byte (huruf aksen & emoji).
     */
    function utf8ToBytes(str) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            let code = str.charCodeAt(i);
            if (code < 0x80) {
                bytes.push(code);
            } else if (code < 0x800) {
                bytes.push(0xc0 | (code >> 6));
                bytes.push(0x80 | (code & 0x3f));
            } else if (code < 0xd800 || code >= 0xe000) {
                bytes.push(0xe0 | (code >> 12));
                bytes.push(0x80 | ((code >> 6) & 0x3f));
                bytes.push(0x80 | (code & 0x3f));
            } else {
                i++;
                code = 0x10000 + (((code & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
                bytes.push(0xf0 | (code >> 18));
                bytes.push(0x80 | ((code >> 12) & 0x3f));
                bytes.push(0x80 | ((code >> 6) & 0x3f));
                bytes.push(0x80 | (code & 0x3f));
            }
        }
        return bytes;
    }

    /**
     * Konversi deretan byte array kembali menjadi string teks UTF-8 asli.
     */
    function bytesToUtf8(bytes) {
        let str = '';
        let i = 0;
        while (i < bytes.length) {
            const b1 = bytes[i++];
            if (b1 < 0x80) {
                str += String.fromCharCode(b1);
            } else if ((b1 & 0xe0) === 0xc0) {
                const b2 = bytes[i++];
                str += String.fromCharCode(((b1 & 0x1f) << 6) | (b2 & 0x3f));
            } else if ((b1 & 0xf0) === 0xe0) {
                const b2 = bytes[i++];
                const b3 = bytes[i++];
                str += String.fromCharCode(((b1 & 0x0f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f));
            } else if ((b1 & 0xf8) === 0xf0) {
                const b2 = bytes[i++];
                const b3 = bytes[i++];
                const b4 = bytes[i++];
                let codepoint = ((b1 & 0x07) << 18) | ((b2 & 0x3f) << 12) | ((b3 & 0x3f) << 6) | (b4 & 0x3f);
                codepoint -= 0x10000;
                str += String.fromCharCode(0xd800 + (codepoint >> 10), 0xdc00 + (codepoint & 0x3ff));
            }
        }
        return str;
    }

    /**
     * Mengubah potongan byte menjadi bilangan integer BigInt murni (Big-Endian).
     * Contoh byte [0x41, 0x42] ('AB') -> 0x4142n = 16706n.
     */
    function bytesToBigInt(bytes) {
        let val = 0n;
        for (let i = 0; i < bytes.length; i++) {
            val = (val << 8n) | BigInt(bytes[i]);
        }
        return val;
    }

    /**
     * Mengubah bilangan integer BigInt kembali menjadi array byte (Big-Endian).
     */
    function bigIntToBytes(val, expectedLength = null) {
        let bytes = [];
        let temp = val;
        while (temp > 0n) {
            bytes.unshift(Number(temp & 0xffn));
            temp >>= 8n;
        }
        // Tambahkan padding nol di depan jika panjang byte kurang dari panjang asli
        if (expectedLength !== null) {
            while (bytes.length < expectedLength) {
                bytes.unshift(0);
            }
        }
        return bytes;
    }

    // =====================================================================================
    // 9. PEMBAGIAN BLOK TEKS (CHUNKING SUPAYA SYARAT RSA m < n TERPENUHI)
    // =====================================================================================
    /**
     * Menghitung ukuran blok maksimum (dalam satuan byte) berdasarkan Modulus n.
     * 
     * SYARAT MUTLAK MATEMATIKA RSA:
     * Nilai numerik pesan 'm' HARUS LEBIH KECIL dari Modulus 'n' (0 <= m < n).
     * Jika sebuah kalimat panjang langsung diubah menjadi angka m, nilainya pasti
     * jauh melebihi n. Akibatnya pesan tidak akan bisa didekripsi!
     * 
     * SOLUSI:
     * Pesan dipecah menjadi beberapa potongan blok (chunking) berukuran maksimal:
     * blockSize = floor((bitLength(n) - 1) / 8).
     * Untuk kunci 128-bit: (128 - 1) / 8 = 15 byte per blok.
     * Dengan 15 byte, nilai m dipastikan selalu < n!
     * 
     * @param {bigint} nBigInt Modulus n
     * @returns {number} Ukuran byte maksimum per blok
     */
    function getMaxBlockSize(nBigInt) {
        const bitLen = nBigInt.toString(2).length;
        const blockSize = Math.floor((bitLen - 1) / 8);
        return blockSize < 1 ? 1 : blockSize;
    }

    // =====================================================================================
    // 10. TAHAP 2 RSA: ENKRIPSI PESAN (ENCRYPTION)
    // =====================================================================================
    /**
     * Enkripsi Pesan Teks menggunakan Kunci Publik RSA (e, n).
     * 
     * RUMUS MATEMATIKA:
     * c = (m^e) mod n
     * 
     * LANGKAH-LANGKAH ENKRIPSI:
     * -------------------------------------------------------------------------------------
     * 1. Ambil eksponen publik 'e' dan modulus 'n' dari Kunci Publik penerima.
     * 2. Ubah teks plainteks menjadi deretan byte UTF-8.
     * 3. Bagi deretan byte menjadi beberapa blok (chunk) berukuran <= blockSize.
     * 4. Ubah setiap blok byte menjadi bilangan bulat besar m_i (cek syarat m_i < n).
     * 5. Hitung ciphertext per blok dengan rumus: c_i = (m_i^e) mod n via modPow().
     * 6. Simpan nilai c_i dalam format Hexadesimal agar mudah dikirimkan melalui jaringan.
     * 
     * @param {string} plaintext Teks aduan rahasia
     * @param {object} publicKey { e, n } Kunci publik Auditor
     * @returns {object} { cipherBlocks, blockSize, mathTrace, totalBlocks, serialized }
     */
    function encryptText(plaintext, publicKey) {
        const e = BigInt(publicKey.e);
        const n = BigInt(publicKey.n);
        const blockSize = getMaxBlockSize(n);
        const bytes = utf8ToBytes(plaintext);

        const cipherBlocks = [];
        const mathTrace = [];

        // Bagi pesan menjadi potongan blok byte
        for (let i = 0; i < bytes.length; i += blockSize) {
            const chunk = bytes.slice(i, i + blockSize);
            const m = bytesToBigInt(chunk);

            // Verifikasi syarat mutlak RSA
            if (m >= n) {
                throw new Error(`Kondisi RSA dilanggar: Nilai blok pesan m (${m}) >= Modulus n (${n})`);
            }

            // Rumus Enkripsi RSA: c = (m^e) mod n
            const c = modPow(m, e, n);
            cipherBlocks.push({
                cHex: c.toString(16),
                chunkLen: chunk.length
            });

            // Rekam jejak langkah matematika untuk visualisasi demo
            if (mathTrace.length < 5) {
                mathTrace.push({
                    chunkIndex: cipherBlocks.length,
                    chunkText: bytesToUtf8(chunk),
                    m: m.toString(),
                    mHex: m.toString(16),
                    c: c.toString(),
                    cHex: c.toString(16)
                });
            }
        }

        return {
            cipherBlocks,
            blockSize,
            mathTrace,
            totalBlocks: cipherBlocks.length,
            serialized: JSON.stringify(cipherBlocks)
        };
    }

    // =====================================================================================
    // 11. TAHAP 3 RSA: DEKRIPSI PESAN (DECRYPTION)
    // =====================================================================================
    /**
     * Dekripsi Pesan Ciphertext menggunakan Kunci Privat RSA (d, n).
     * 
     * RUMUS MATEMATIKA:
     * m = (c^d) mod n
     * 
     * LANGKAH-LANGKAH DEKRIPSI:
     * -------------------------------------------------------------------------------------
     * 1. Ambil eksponen privat 'd' dan modulus 'n' dari Kunci Privat Auditor.
     * 2. Ambil setiap blok ciphertext c_i (dalam format hex) dan ubah ke BigInt.
     * 3. Hitung rumus dekripsi: m_i = (c_i^d) mod n via modPow().
     *    Karena sifat matematika Euler: (m^e)^d mod n = m^(e*d) mod n = m!
     * 4. Konversikan kembali bilangan m_i menjadi deretan byte aslinya.
     * 5. Gabungkan semua byte dan terjemahkan kembali ke string teks Plaintext UTF-8 asli.
     * 
     * @param {string|Array} cipherPayload Blok ciphertext
     * @param {object} privateKey { d, n } Kunci privat Auditor
     * @returns {object} { plaintext, mathTrace, recoveredLength }
     */
    function decryptText(cipherPayload, privateKey) {
        const d = BigInt(privateKey.d);
        const n = BigInt(privateKey.n);

        let blocks = [];
        if (typeof cipherPayload === 'string') {
            blocks = JSON.parse(cipherPayload);
        } else if (Array.isArray(cipherPayload)) {
            blocks = cipherPayload;
        } else if (cipherPayload.cipherBlocks) {
            blocks = cipherPayload.cipherBlocks;
        }

        const recoveredBytes = [];
        const mathTrace = [];

        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            const c = BigInt('0x' + block.cHex);

            // Rumus Dekripsi RSA: m = (c^d) mod n
            const m = modPow(c, d, n);

            // Rekonstruksi byte sesuai panjang asli blok
            const chunkBytes = bigIntToBytes(m, block.chunkLen);
            recoveredBytes.push(...chunkBytes);

            // Rekam jejak langkah matematika untuk visualisasi demo
            if (mathTrace.length < 5) {
                mathTrace.push({
                    chunkIndex: i + 1,
                    cHex: block.cHex,
                    c: c.toString(),
                    m: m.toString(),
                    recoveredText: bytesToUtf8(chunkBytes)
                });
            }
        }

        const plaintext = bytesToUtf8(recoveredBytes);

        return {
            plaintext,
            mathTrace,
            recoveredLength: plaintext.length
        };
    }

    // =====================================================================================
    // 12. RSA DIGITAL SIGNATURE (PEMBUATAN TANDA TANGAN DIGITAL)
    // =====================================================================================
    /**
     * Membentuk Tanda Tangan Digital RSA (Digital Signature).
     * 
     * TUJUAN:
     * Membuktikan bahwa pengirim laporan adalah civitas berwenang tanpa membuka nama aslinya,
     * serta menjamin isi laporan tidak pernah diubah oleh siapapun (Integritas Data).
     * 
     * RUMUS MATEMATIKA:
     * S = (H(M))^d mod n
     * 
     * LANGKAH KERJA:
     * 1. Hitung hash dari isi pesan M menggunakan SHA-256 manual -> H(M).
     * 2. Sesuaikan ukuran hash ke dalam modulus pengirim: h = H(M) mod n.
     * 3. Enkripsi hash tersebut menggunakan KUNCI PRIVAT PENGIRIM (d): S = (h^d) mod n.
     * 
     * @param {string} message Isi narasi laporan
     * @param {object} privateKey Kunci privat pelapor
     * @returns {object} { signatureHex, hashHex, hModN, signatureBigInt }
     */
    function signMessage(message, privateKey) {
        const d = BigInt(privateKey.d);
        const n = BigInt(privateKey.n);

        // 1. Hash pesan dengan SHA-256 manual
        const hashHex = ManualSHA256.hash(message);
        const fullHashBigInt = ManualSHA256.hexToBigInt(hashHex);

        // 2. Sesuaikan ukuran hash agar h < n
        const h = fullHashBigInt % n;

        // 3. Tanda tangan digital: S = (h^d) mod n
        const S = modPow(h, d, n);

        return {
            signatureHex: S.toString(16),
            hashHex: hashHex,
            hModN: h.toString(),
            signatureBigInt: S.toString()
        };
    }

    // =====================================================================================
    // 13. RSA SIGNATURE VERIFICATION (VERIFIKASI KEASLIAN & INTEGRITAS PESAN)
    // =====================================================================================
    /**
     * Memverifikasi Tanda Tangan Digital RSA.
     * 
     * RUMUS MATEMATIKA:
     * V = (S^e) mod n
     * 
     * PEMBUKTIAN KEABSAHAN:
     * 1. Dekripsi tanda tangan S menggunakan KUNCI PUBLIK PENGIRIM (e): V = (S^e) mod n.
     * 2. Hitung ulang hash pesan saat ini: expectedH = SHA-256(pesan_sekarang) mod n.
     * 3. Jika V === expectedH:
     *    -> TANDA TANGAN VALID!
     *    -> Terbukti 100% dibuat oleh pemilik kunci privat pengirim yang sah.
     *    -> Terbukti isi pesan 100% utuh dan tidak pernah diubah/dimanipulasi sedikitpun.
     * 
     * @param {string} message Teks laporan yang didekripsi
     * @param {string} signatureHex Tanda tangan digital dalam hex
     * @param {object} publicKey Kunci publik civitas pengirim dari daftar Whitelist
     * @returns {object} { isValid, currentHashHex, expectedH, verifiedV, signatureHex }
     */
    function verifySignature(message, signatureHex, publicKey) {
        const e = BigInt(publicKey.e);
        const n = BigInt(publicKey.n);
        const S = BigInt('0x' + signatureHex);

        // 1. Hitung hash dari pesan saat ini
        const currentHashHex = ManualSHA256.hash(message);
        const fullHashBigInt = ManualSHA256.hexToBigInt(currentHashHex);
        const expectedH = fullHashBigInt % n;

        // 2. Dekripsi tanda tangan dengan kunci publik pengirim: V = (S^e) mod n
        const V = modPow(S, e, n);

        // 3. Bandingkan hasil verifikasi dengan hash pesan
        const isValid = (V === expectedH);

        return {
            isValid,
            currentHashHex,
            expectedH: expectedH.toString(),
            verifiedV: V.toString(),
            signatureHex
        };
    }

    // =====================================================================================
    // EKSPOR MODUL UNTUK PENGGUNAAN APLIKASI
    // =====================================================================================
    return {
        gcd,
        extendedEuclidean,
        modInverse,
        modPow,
        modPowWithTrace,
        millerRabinTest,
        generatePrime,
        generateKeyPair,
        encryptText,
        decryptText,
        signMessage,
        verifySignature,
        getMaxBlockSize
    };
})();

// Ekspor ke window global untuk browser
if (typeof window !== 'undefined') {
    window.ManualRSA = ManualRSA;
}
