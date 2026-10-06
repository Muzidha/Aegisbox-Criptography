/**
 * Manual RSA Engine (Pure JavaScript & BigInt, No External Cryptography Libraries)
 * Dibuat secara mandiri untuk Tugas Besar Kriptografi.
 * 
 * Modul ini mencakup:
 * 1. Pembangkitan Bilangan Prima Acak (Random Prime Generator)
 * 2. Pengujian Keprimaan Probabilistik Miller-Rabin (Miller-Rabin Primality Test)
 * 3. Algoritma Euclidean & Algoritma Euclidean Diperluas (Extended Euclidean Algorithm)
 * 4. Invers Modulo (Modular Multiplicative Inverse)
 * 5. Pembangkitan Pasangan Kunci RSA (Key Generation: p, q, n, phi, e, d)
 * 6. Pemangkatan Modular Cepat (Square-and-Multiply / Binary Modular Exponentiation)
 * 7. Chunking / Pembagian Blok Teks agar m < n
 * 8. Enkripsi & Dekripsi Blok Asimetris
 * 9. RSA Digital Signature (Pembuatan Tanda Tangan & Verifikasi Keaslian)
 */

const ManualRSA = (function () {
    // Daftar bilangan prima kecil untuk uji coba pembagian cepat (pre-filter)
    const SMALL_PRIMES = [
        2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n, 43n, 47n,
        53n, 59n, 61n, 67n, 71n, 73n, 79n, 83n, 89n, 97n, 101n, 103n, 107n, 109n,
        113n, 127n, 131n, 137n, 139n, 149n, 151n, 157n, 163n, 167n, 173n, 179n,
        181n, 191n, 193n, 197n, 199n, 211n, 223n, 227n, 229n, 233n, 239n, 241n, 251n
    ];

    /**
     * Hitung Pembagi Bersama Terbesar (GCD) menggunakan Algoritma Euclidean Standar
     * @param {bigint} a
     * @param {bigint} b
     * @returns {bigint} gcd(a, b)
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

    /**
     * Algoritma Euclidean Diperluas (Extended Euclidean Algorithm)
     * Mencari x dan y sehingga a*x + b*y = gcd(a, b)
     * Mengembalikan { gcd, x, y, steps }
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

    /**
     * Menghitung Invers Modular: d = e^(-1) mod phi
     * sehingga (e * d) mod phi = 1
     */
    function modInverse(e, phi) {
        const result = extendedEuclidean(e, phi);
        if (result.gcd !== 1n) {
            throw new Error(`Invers modulo tidak ada karena gcd(${e}, ${phi}) = ${result.gcd} !== 1`);
        }
        // Pastikan d positif dalam modulo phi
        let d = result.x % phi;
        if (d < 0n) {
            d += phi;
        }
        return { d, steps: result.steps };
    }

    /**
     * Algoritma Pemangkatan Modular Cepat (Square-and-Multiply / Binary Exponentiation)
     * Menghitung (base^exp) mod mod secara efisien tanpa overflow O(log exp)
     */
    function modPow(base, exp, mod) {
        if (mod === 1n) return 0n;
        let result = 1n;
        let b = base % mod;
        let e = exp;

        while (e > 0n) {
            if ((e & 1n) === 1n) {
                result = (result * b) % mod;
            }
            e >>= 1n;
            b = (b * b) % mod;
        }
        return result;
    }

    /**
     * Pemangkatan Modular dengan pencatatan jejak langkah (Trace Steps)
     * Sangat berguna untuk visualisasi matematika bagi penguji / dosen.
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

            // Square
            if (i > 0) {
                result = (result * result) % mod;
            }

            let action = i === 0 ? "Initial" : `Square: (${prevRes}^2) mod n = ${result}`;

            // Multiply if bit == 1
            if (bit === '1') {
                const beforeMul = result;
                result = (result * b) % mod;
                action += i === 0 ? `Set initial bit 1` : ` | Multiply: (${beforeMul} * ${b}) mod n = ${result}`;
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

    /**
     * Menghasilkan BigInt acak dengan bit length tertentu
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
        // Pastikan bit tertinggi dan bit terendah (ganjil) aktif
        const mask = (1n << BigInt(bits)) - 1n;
        n = n & mask;
        n |= (1n << BigInt(bits - 1)); // set bit tertinggi agar sesuai panjang bit
        n |= 1n; // set bit terendah agar ganjil
        return n;
    }

    /**
     * Bilangan acak BigInt dalam rentang [min, max]
     */
    function randomBigIntRange(min, max) {
        const range = max - min;
        if (range <= 0n) return min;
        const bitLen = range.toString(2).length;
        let rand;
        do {
            rand = randomBigIntBits(bitLen);
        } while (rand > range);
        return min + rand;
    }

    /**
     * Uji Keprimaan Miller-Rabin (Probabilistic Primality Test)
     * Menguji apakah n kemungkinan prima atau pasti komposit
     * @param {bigint} n Bilangan ganjil yang akan diuji
     * @param {number} rounds Jumlah putaran pengujian
     * @returns {boolean} true jika kemungkinan besar prima, false jika komposit
     */
    function millerRabinTest(n, rounds = 25) {
        if (n < 2n) return false;
        if (n === 2n || n === 3n) return true;
        if ((n & 1n) === 0n) return false;

        // Cek pembagian dengan bilangan prima kecil (pre-filter cepat)
        for (const sp of SMALL_PRIMES) {
            if (n === sp) return true;
            if (n % sp === 0n) return false;
        }

        // Tulis n - 1 sebagai 2^s * d dengan d ganjil
        let d = n - 1n;
        let s = 0n;
        while ((d & 1n) === 0n) {
            d >>= 1n;
            s++;
        }

        // Jalankan pengujian Miller-Rabin sebanyak k putaran
        for (let i = 0; i < rounds; i++) {
            // Pilih basis acak a dalam rentang [2, n - 2]
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
                return false; // Pasti komposit
            }
        }

        return true; // Kemungkinan besar prima
    }

    /**
     * Pembangkitan Bilangan Prima Acak Mandiri
     * @param {number} bits Panjang bit bilangan prima
     * @param {number} rounds Jumlah putaran Miller-Rabin
     * @returns {bigint}
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

    /**
     * Pembangkitan Pasangan Kunci RSA (Key Generation)
     * @param {number} keyBits Total bit modulus n (misal 128-bit, 256-bit, 512-bit)
     * @returns {object} { publicKey, privateKey, mathDetails }
     */
    function generateKeyPair(keyBits = 128) {
        const primeBits = Math.floor(keyBits / 2);

        // 1. Pembangkitan dua bilangan prima acak berlainan p dan q
        let p = generatePrime(primeBits);
        let q = generatePrime(primeBits);
        while (p === q) {
            q = generatePrime(primeBits);
        }

        // 2. Hitung Modulus n = p * q
        const n = p * q;

        // 3. Hitung Fungsi Totient Euler phi(n) = (p - 1) * (q - 1)
        const phi = (p - 1n) * (q - 1n);

        // 4. Pilih eksponen publik e sehingga 1 < e < phi dan gcd(e, phi) = 1
        // Gunakan calon standar e: 65537n, jika tidak relatif prima cari bilangan ganjil lain
        const candidateE = [65537n, 17n, 257n, 65539n, 3n];
        let e = null;
        for (const cand of candidateE) {
            if (cand < phi && gcd(cand, phi) === 1n) {
                e = cand;
                break;
            }
        }

        if (!e) {
            // Pencarian acak jika calon umum tidak koprima
            let cand = 65537n;
            while (cand < phi) {
                if (gcd(cand, phi) === 1n) {
                    e = cand;
                    break;
                }
                cand += 2n;
            }
        }

        // 5. Hitung eksponen privat d = e^(-1) mod phi dengan Extended Euclidean
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

    /**
     * Konversi string UTF-8 ke Array of Bytes murni manual
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
     * Konversi Array of Bytes ke string UTF-8
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
     * Konversi byte chunk menjadi BigInt bilangan murni
     */
    function bytesToBigInt(bytes) {
        let val = 0n;
        for (let i = 0; i < bytes.length; i++) {
            val = (val << 8n) | BigInt(bytes[i]);
        }
        return val;
    }

    /**
     * Konversi BigInt kembali ke byte array
     */
    function bigIntToBytes(val, expectedLength = null) {
        let bytes = [];
        let temp = val;
        while (temp > 0n) {
            bytes.unshift(Number(temp & 0xffn));
            temp >>= 8n;
        }
        if (expectedLength !== null) {
            while (bytes.length < expectedLength) {
                bytes.unshift(0);
            }
        }
        return bytes;
    }

    /**
     * Menghitung ukuran blok maksimum (dalam bytes) berdasarkan modulus n
     * Syarat mutlak RSA: m < n.
     */
    function getMaxBlockSize(nBigInt) {
        const bitLen = nBigInt.toString(2).length;
        // Ambil (bitLen - 1) / 8 agar nilai blok m pasti lebih kecil dari n
        const blockSize = Math.floor((bitLen - 1) / 8);
        return blockSize < 1 ? 1 : blockSize;
    }

    /**
     * Enkripsi Pesan Teks menggunakan Kunci Publik RSA (e, n) dengan Pembagian Blok (Chunking)
     * Formula enkripsi RSA: c = (m^e) mod n
     */
    function encryptText(plaintext, publicKey) {
        const e = BigInt(publicKey.e);
        const n = BigInt(publicKey.n);
        const blockSize = getMaxBlockSize(n);
        const bytes = utf8ToBytes(plaintext);

        const cipherBlocks = [];
        const mathTrace = [];

        // Bagi pesan menjadi potongan byte berukuran <= blockSize
        for (let i = 0; i < bytes.length; i += blockSize) {
            const chunk = bytes.slice(i, i + blockSize);
            const m = bytesToBigInt(chunk);

            if (m >= n) {
                throw new Error(`Kondisi RSA dilanggar: Nilai blok pesan m (${m}) >= Modulus n (${n})`);
            }

            // c = (m^e) mod n
            const c = modPow(m, e, n);
            cipherBlocks.push({
                cHex: c.toString(16),
                chunkLen: chunk.length
            });

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
            // Format serialisasi ciphertext siap kirim
            serialized: JSON.stringify(cipherBlocks)
        };
    }

    /**
     * Dekripsi Pesan Ciphertext menggunakan Kunci Privat RSA (d, n)
     * Formula dekripsi RSA: m = (c^d) mod n
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

            // m = (c^d) mod n
            const m = modPow(c, d, n);

            // Rekonstruksi byte sesuai panjang aslinya
            const chunkBytes = bigIntToBytes(m, block.chunkLen);
            recoveredBytes.push(...chunkBytes);

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

    /**
     * Pembentukan RSA Digital Signature (Tanda Tangan Digital)
     * Formula: S = (H(M))^d mod n
     * Di mana H(M) adalah hash SHA-256 yang dihitung secara manual tanpa library.
     */
    function signMessage(message, privateKey) {
        const d = BigInt(privateKey.d);
        const n = BigInt(privateKey.n);

        // 1. Hash pesan menggunakan ManualSHA256
        const hashHex = ManualSHA256.hash(message);
        const fullHashBigInt = ManualSHA256.hexToBigInt(hashHex);

        // 2. Karena hash SHA-256 berukuran 256-bit, sesuaikan dalam modulus n
        // h = fullHashBigInt mod n
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

    /**
     * Verifikasi RSA Digital Signature (Pengujian Keaslian Pengirim & Integritas Pesan)
     * Formula: V = (S^e) mod n
     * Verifikasi valid jika V == (H(M) mod n)
     */
    function verifySignature(message, signatureHex, publicKey) {
        const e = BigInt(publicKey.e);
        const n = BigInt(publicKey.n);
        const S = BigInt('0x' + signatureHex);

        // 1. Hitung hash dari pesan saat ini
        const currentHashHex = ManualSHA256.hash(message);
        const fullHashBigInt = ManualSHA256.hexToBigInt(currentHashHex);
        const expectedH = fullHashBigInt % n;

        // 2. Dekripsi tanda tangan dengan public key: V = (S^e) mod n
        const V = modPow(S, e, n);

        // 3. Bandingkan hasil
        const isValid = (V === expectedH);

        return {
            isValid,
            currentHashHex,
            expectedH: expectedH.toString(),
            verifiedV: V.toString(),
            signatureHex
        };
    }

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
