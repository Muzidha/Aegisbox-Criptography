/**
 * SHA-256 Manual Implementation (Pure JavaScript, No External Library)
 * Sesuai Standar FIPS PUB 180-4
 * Dibuat secara mandiri untuk Tugas Kriptografi:
 * Mendukung hashing pesan untuk Digital Signature RSA.
 */

const ManualSHA256 = (function () {
    // 64 Round Constants (K)
    const K = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    // Fungsi bitwise 32-bit
    function rotr(x, n) {
        return (x >>> n) | (x << (32 - n));
    }

    function ch(x, y, z) {
        return (x & y) ^ (~x & z);
    }

    function maj(x, y, z) {
        return (x & y) ^ (x & z) ^ (y & z);
    }

    function sigma0(x) {
        return rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22);
    }

    function sigma1(x) {
        return rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25);
    }

    function gamma0(x) {
        return rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
    }

    function gamma1(x) {
        return rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10);
    }

    // Konversi string ke UTF-8 byte array murni manual
    function stringToBytes(str) {
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
                // Surrogate pair (emoji, unicode tinggi)
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
     * Hitung SHA-256 dari teks input
     * @param {string} message
     * @returns {string} Hex string 64 karakter (256-bit)
     */
    function hash(message) {
        const bytes = stringToBytes(message);
        const bitLen = bytes.length * 8;

        // 1. Padding: tambah bit 1 (0x80)
        bytes.push(0x80);

        // 2. Tambah padding nol sampai panjang (panjang % 64) == 56 bytes
        while ((bytes.length % 64) !== 56) {
            bytes.push(0x00);
        }

        // 3. Tambah panjang pesan asli (64-bit integer, Big-Endian)
        const highLen = Math.floor(bitLen / 0x100000000);
        const lowLen = bitLen >>> 0;

        for (let i = 3; i >= 0; i--) bytes.push((highLen >>> (i * 8)) & 0xff);
        for (let i = 3; i >= 0; i--) bytes.push((lowLen >>> (i * 8)) & 0xff);

        // 4. Initial Hash Values (H0 s/d H7)
        let H0 = 0x6a09e667;
        let H1 = 0xbb67ae85;
        let H2 = 0x3c6ef372;
        let H3 = 0xa54ff53a;
        let H4 = 0x510e527f;
        let H5 = 0x9b05688c;
        let H6 = 0x1f83d9ab;
        let H7 = 0x5be0cd19;

        // 5. Proses setiap blok 512-bit (64 bytes)
        const W = new Uint32Array(64);

        for (let chunkStart = 0; chunkStart < bytes.length; chunkStart += 64) {
            // Isi 16 words pertama dari blok
            for (let t = 0; t < 16; t++) {
                const idx = chunkStart + t * 4;
                W[t] = ((bytes[idx] << 24) |
                        (bytes[idx + 1] << 16) |
                        (bytes[idx + 2] << 8) |
                        (bytes[idx + 3])) >>> 0;
            }

            // Perluas menjadi 64 words
            for (let t = 16; t < 64; t++) {
                const s0 = gamma0(W[t - 15]);
                const s1 = gamma1(W[t - 2]);
                W[t] = ((W[t - 16] + s0 + W[t - 7] + s1) >>> 0);
            }

            // Inisialisasi variabel kerja
            let a = H0;
            let b = H1;
            let c = H2;
            let d = H3;
            let e = H4;
            let f = H5;
            let g = H6;
            let h = H7;

            // 64 putaran kompresi
            for (let t = 0; t < 64; t++) {
                const T1 = (h + sigma1(e) + ch(e, f, g) + K[t] + W[t]) >>> 0;
                const T2 = (sigma0(a) + maj(a, b, c)) >>> 0;
                h = g;
                g = f;
                f = e;
                e = (d + T1) >>> 0;
                d = c;
                c = b;
                b = a;
                a = (T1 + T2) >>> 0;
            }

            // Tambahkan hasil blok ke hash sementara
            H0 = (H0 + a) >>> 0;
            H1 = (H1 + b) >>> 0;
            H2 = (H2 + c) >>> 0;
            H3 = (H3 + d) >>> 0;
            H4 = (H4 + e) >>> 0;
            H5 = (H5 + f) >>> 0;
            H6 = (H6 + g) >>> 0;
            H7 = (H7 + h) >>> 0;
        }

        // Format hasil ke 64 karakter Hex
        function toHex(val) {
            return (val >>> 0).toString(16).padStart(8, '0');
        }

        return toHex(H0) + toHex(H1) + toHex(H2) + toHex(H3) +
               toHex(H4) + toHex(H5) + toHex(H6) + toHex(H7);
    }

    /**
     * Konversi string hasil hash hex ke BigInt
     * @param {string} hexStr
     * @returns {bigint}
     */
    function hexToBigInt(hexStr) {
        return BigInt('0x' + hexStr);
    }

    /**
     * Hashing langsung mengembalikan BigInt
     * @param {string} message
     * @returns {bigint}
     */
    function hashToBigInt(message) {
        return hexToBigInt(hash(message));
    }

    return {
        hash,
        hexToBigInt,
        hashToBigInt
    };
})();
