# 🛡️ LAPORAN TUGAS BESAR KRIPTOGRAFI
## APLIKASI WHISTLEBLOWER & KOTAK SARAN ANONIM TERVERIFIKASI (AEGISBOX)
### IMPLEMENTASI KRIPTOGRAFI RSA MANUAL MURNI (TANPA LIBRARY & TANPA FRAMEWORK)

---

> ### 📋 IDENTITAS KELOMPOK

> - **Anggota 1**      : Muhammad Ziddan Habibi — NRP: 5027241122 
> - **Anggota 2**      : M.Faqih Ridho — NRP : 5027241123
> - **Anggota 2**      : Muhammad Ahsani Taqwim — NRP : 5027241099
> - **Mata Kuliah**    : Kriptografi


---

## 🚫 1. PERNYATAAN BEBAS LIBRARY & BEBAS FRAMEWORK (100% NATIVE)

Program ini dibuat secara **MURNI TANPA MENGGUNAKAN LIBRARY ATAU FRAMEWORK JADI APAPUN**:

1. **Bebas Framework Web / CSS:**
   - **TIDAK** menggunakan React, Vue, Angular, Svelte, Next.js, Vite, dll.
   - **TIDAK** menggunakan TailwindCSS, Bootstrap, jQuery, atau UI library lainnya.
   - Tampilan dibangun murni menggunakan **HTML5 semantik** dan **Vanilla CSS3** native.
2. **Bebas Library Kriptografi:**
   - **TIDAK** menggunakan Crypto-JS, Node-Forge, WebCrypto API (subtle RSA), JSEncrypt, PyCryptodome, BouncyCastle, dll.
   - Seluruh algoritma kriptografi (pembangkitan bilangan prima, Miller-Rabin, Extended Euclidean, pemangkatan modular, enkripsi, dekripsi, SHA-256, hingga tanda tangan digital) ditulis sendiri secara manual dari nol.
3. **Operasi Bilangan Besar (Arbitrary-Precision Arithmetic):**
   - Menggunakan fitur bawaan JavaScript murni yaitu tipe data **`BigInt`** (contoh: `1234567890123456789n`) untuk menangani perhitungan modulus $n$, eksponen $e$, dan $d$ tanpa terjadi floating-point overflow.
4. **Portabilitas:**
   - Aplikasi dapat dijalankan langsung di laptop penguji/dosen hanya dengan **klik ganda (double click) pada file `index.html`** tanpa perlu menginstal `node_modules` atau menjalankan server khusus.

---

## 🔍 2. PEMETAAN KODE & FUNGSI SETIAP TAHAPAN RSA (KODE PROGRAM)

Berikut adalah daftar fungsi lengkap di dalam berkas [`js/rsa.js`](file:///c:/Users/zidda/Kuliah/kripto/js/rsa.js) dan [`js/sha256.js`](file:///c:/Users/zidda/Kuliah/kripto/js/sha256.js) yang mengimplementasikan setiap tahapan RSA secara mandiri:

```
                  ALUR KRIPTOGRAFI RSA MANUAL AEGISBOX
                  ───────────────────────────────────
 [Pesan Teks UTF-8] ──> [Manual SHA-256] ──> Hash H ──> S = H^d mod n (Sign)
         │
         ├───> [Chunking: utf8ToBytes -> bytesToBigInt] (m < n)
         │
         ▼
 [Enkripsi RSA: c = m^e mod n] (Square-and-Multiply) ──> [Ciphertext Hex Blocks]
         │
         ▼
 [Dekripsi RSA: m = c^d mod n] (Square-and-Multiply) ──> [bigIntToBytes -> Plaintext]
         │
         ▼
 [Verifikasi Signature: V = S^e mod n == H] ──> [Status: Civitas Sah Terverifikasi]
```

### Tabel Pemetaan Fungsi Program:

| Tahapan RSA | Nama Fungsi Program | Lokasi Berkas & Baris | Rumus Matematis & Penjelasan Logika |
|---|---|---|---|
| **1. Uji Keprimaan Probabilistik** | `millerRabinTest(n, rounds)` | [`js/rsa.js` (L208-L252)](file:///c:/Users/zidda/Kuliah/kripto/js/rsa.js#L208-L252) | Menulis $n - 1 = 2^s \cdot d$ dengan $d$ ganjil. Memilih basis acak $a \in [2, n-2]$, menguji $x = a^d \pmod n$. Mengulang hingga $k$ putaran untuk memastikan keprimaan. |
| **2. Pembangkitan Prima Acak** | `generatePrime(bits, rounds)` | [`js/rsa.js` (L260-L273)](file:///c:/Users/zidda/Kuliah/kripto/js/rsa.js#L260-L273) | Membangkitkan bilangan ganjil acak sepanjang $b$ bit (`randomBigIntBits`), lalu mengujinya dengan `millerRabinTest`. Menghasilkan prima $p$ dan $q$. |
| **3. Pembangkitan Kunci (Keygen)** | `generateKeyPair(keyBits)` | [`js/rsa.js` (L280-L345)](file:///c:/Users/zidda/Kuliah/kripto/js/rsa.js#L280-L345) | 1. Bangkitkan prima $p \neq q$<br>2. Hitung Modulus $n = p \cdot q$<br>3. Hitung Euler Totient $\phi(n) = (p-1)(q-1)$<br>4. Pilih $e$ koprima ($\gcd(e, \phi(n)) = 1$)<br>5. Hitung $d = \text{modInverse}(e, \phi(n))$ |
| **4. Algoritma Euclidean Standar** | `gcd(a, b)` | [`js/rsa.js` (L32-L41)](file:///c:/Users/zidda/Kuliah/kripto/js/rsa.js#L32-L41) | Menghitung Faktor Persekutuan Terbesar dengan algoritma pembagian sisa Euclidean hingga sisa $= 0$. Digunakan untuk validasi $\gcd(e, \phi(n)) = 1$. |
| **5. Algoritma Euclidean Diperluas** | `extendedEuclidean(a, b)` | [`js/rsa.js` (L48-L82)](file:///c:/Users/zidda/Kuliah/kripto/js/rsa.js#L48-L82) | Mencari koefisien integer $x$ dan $y$ yang memenuhi $a \cdot x + b \cdot y = \gcd(a, b)$, sekaligus mencatat jejak langkah tabel pembagian untuk keperluan edukatif / demo. |
| **6. Invers Modulo (Kunci Privat $d$)** | `modInverse(e, phi)` | [`js/rsa.js` (L88-L99)](file:///c:/Users/zidda/Kuliah/kripto/js/rsa.js#L88-L99) | Menghitung eksponen privat $d$ sehingga $(e \cdot d) \equiv 1 \pmod{\phi(n)}$ menggunakan hasil $x$ dari Algoritma Euclidean Diperluas. |
| **7. Pemangkatan Modular Cepat** | `modPow(base, exp, mod)` | [`js/rsa.js` (L105-L119)](file:///c:/Users/zidda/Kuliah/kripto/js/rsa.js#L105-L119) | Algoritma **Square-and-Multiply (Binary Exponentiation)** untuk menghitung $base^{exp} \pmod{mod}$ dalam kompleksitas $O(\log exp)$ tanpa memori overflow. |
| **8. Visualisasi Langkah Pemangkatan** | `modPowWithTrace(base, exp, mod)` | [`js/rsa.js` (L125-L165)](file:///c:/Users/zidda/Kuliah/kripto/js/rsa.js#L125-L165) | Menelusuri proses Square dan Multiply bit demi bit biner eksponen dan menampilkan riwayat perhitungannya ke tabel antarmuka. |
| **9. Pembagian Blok Pesan (Chunking)** | `getMaxBlockSize(n)` | [`js/rsa.js` (L437-L442)](file:///c:/Users/zidda/Kuliah/kripto/js/rsa.js#L437-L442) | Menghitung batas ukuran blok byte maksimum $\lfloor(\text{bitLength}(n) - 1) / 8\rfloor$ untuk menjamin syarat mutlak RSA: nilai blok pesan $m < n$. |
| **10. Konversi Teks UTF-8 ke BigInt** | `utf8ToBytes()`, `bytesToBigInt()` | [`js/rsa.js` (L350-L413)](file:///c:/Users/zidda/Kuliah/kripto/js/rsa.js#L350-L413) | Mengubah karakter teks UTF-8 ke byte array, lalu menggabungkan bit byte per blok menjadi sebuah integer besar $m$. |
| **11. Enkripsi RSA Teks** | `encryptText(plaintext, publicKey)` | [`js/rsa.js` (L448-L493)](file:///c:/Users/zidda/Kuliah/kripto/js/rsa.js#L448-L493) | Memecah teks ke blok $m_i$, lalu mengenkripsi setiap blok ke Kunci Publik Auditor: $c_i = (m_i^e) \pmod n$. |
| **12. Dekripsi RSA Teks** | `decryptText(cipherPayload, privateKey)` | [`js/rsa.js` (L499-L544)](file:///c:/Users/zidda/Kuliah/kripto/js/rsa.js#L499-L544) | Mendekripsi setiap blok ciphertext menggunakan Kunci Privat Auditor: $m_i = (c_i^d) \pmod n$, lalu merekonstruksi byte kembali ke teks asli (`bytesToUtf8`). |
| **13. Fungsi Hash Mandiri** | `ManualSHA256.hash(message)` | [`js/sha256.js` (L81-L168)](file:///c:/Users/zidda/Kuliah/kripto/js/sha256.js#L81-L168) | Implementasi murni SHA-256 standar FIPS PUB 180-4 (padding 0x80, 64-bit length, 64 putaran kompresi bitwise 32-bit `Ch`, `Maj`, $\Sigma, \sigma$). |
| **14. RSA Digital Signature** | `signMessage(message, privateKey)` | [`js/rsa.js` (L551-L572)](file:///c:/Users/zidda/Kuliah/kripto/js/rsa.js#L551-L572) | Menghitung intisari hash $H = \text{SHA256}(M) \pmod n$, lalu menandatanganinya dengan kunci privat pengadu: $S = (H^d) \pmod n$. |
| **15. Verifikasi Keaslian Signature** | `verifySignature(message, sig, publicKey)` | [`js/rsa.js` (L579-L602)](file:///c:/Users/zidda/Kuliah/kripto/js/rsa.js#L579-L602) | Mendekripsi signature dengan Kunci Publik pengadu: $V = (S^e) \pmod n$. Valid jika $V == H(M) \pmod n$. |

---

## 🌟 3. KONSEP APLIKASI: WHISTLEBLOWER ANONIM TERVERIFIKASI

### Masalah Nyata:
- Civitas (mahasiswa, dosen, staf) enggan melapor kecurangan akademik, pungutan liar, atau pelecehan karena takut identitasnya bocor dan mengalami intimidasi.
- Jika form pelaporan dibuka secara publik tanpa identitas sama sekali, kotak aduan akan dibanjiri berita bohong (hoax), fitnah, dan spam dari pihak luar organisasi.

### Solusi Kriptografis Dua Lapis:
1. **Lapis 1 — Kerahasiaan (RSA Encryption):**
   Isi laporan hanya bisa dibuka oleh Tim Auditor yang memegang Kunci Privat Auditor ($SK_{\text{auditor}}$).
2. **Lapis 2 — Keabsahan Pengadu (RSA Digital Signature):**
   Pengadu menandatangani laporan dengan Kunci Privat miliknya ($SK_{\text{user}}$). Sistem mencocokkan tanda tangan tersebut dengan **Whitelist Kunci Publik Civitas Resmi**.
   - **Hasil:** Auditor mengetahui bahwa laporan **PASTI berasal dari civitas internal yang sah**, namun nama asli pelapor tetap dirahasiakan melalui kode pseudonim (misal: `GHOST-CYBER-884`).
3. **Lapis 3 — Anti-Pemalsuan (Tamper-Proof):**
   Jika ada oknum yang mengubah 1 huruf saja pada isi aduan, tanda tangan digital seketika rusak dan sistem menolak laporan tersebut.

---

## 🚀 4. CARA MENJALANKAN APLIKASI

### Opsi A (Paling Mudah — Tanpa Server):
1. Buka File Explorer.
2. Masuk ke folder proyek: `c:\Users\zidda\Kuliah\kripto`.
3. **Klik ganda (double click) pada berkas `index.html`**. Aplikasi langsung terbuka di browser Anda (Chrome, Edge, Firefox).

### Opsi B (Menggunakan Local Server Python):
1. Buka terminal PowerShell di folder proyek:
   ```powershell
   cd c:\Users\zidda\Kuliah\kripto
   ```
2. Jalankan server:
   ```powershell
   python -m http.server 8080
   ```
3. Buka browser dan kunjungi: `http://localhost:8080`

---
---
*Dibuat untuk Tugas Besar Mata Kuliah Kriptografi — Implementasi RSA Murni Tanpa Library & Framework.*
