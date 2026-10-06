# 🛡️ AegisBox - Whistleblower & Kotak Saran Anonim Terverifikasi
### Implementasi Kriptografi RSA Manual Murni & Tanda Tangan Digital (Tanpa Library)

Aplikasi web modern untuk platform pelaporan pelanggaran dan kotak saran internal institusi/kampus secara anonim namun **terverifikasi keabsahannya** menggunakan **Kriptografi Asimetris RSA Manual** dan **RSA Digital Signature**.

---

## 🌟 1. Konsep & Masalah Nyata yang Diselesaikan

### Masalah:
1. **Dilema Pelapor (Whistleblower):** Banyak civitas (mahasiswa, dosen, staf) takut melaporkan kecurangan, pungutan liar, atau pelanggaran etika karena khawatir identitasnya terbongkar dan mendapat intimidasi/retaliasi.
2. **Kelemahan Kotak Saran Anonim Biasa:** Jika pelaporan dibuat tanpa verifikasi sama sekali (publik bebas mengisi form), sistem rawan dibanjiri fitnah, hoax, bot, dan serangan spam dari pihak luar organisasi.

### Solusi Kriptografis AegisBox:
- **Verifikasi Keanggotaan Sah (RSA Digital Signature):** Pengirim menandatangani hash isi aduan menggunakan **Private Key miliknya** ($S = H^d \pmod n$). Sistem mencocokkan tanda tangan tersebut dengan **Whitelist Kunci Publik Civitas Resmi**. Jika cocok, pengirim dijamin 100% adalah anggota internal yang sah tanpa membocorkan nama aslinya.
- **Kerahasiaan Dokumen Aduan (RSA Encryption):** Narasi dan bukti laporan dienkripsi secara asimetris menggunakan **Public Key Tim Auditor** ($c = m^e \pmod n$). Pihak ketiga, penyedia hosting, atau admin jaringan tidak dapat membaca isi aduan. Hanya Tim Auditor yang memegang Private Key yang dapat mendekripsi.
- **Pseudonimitas Terlindungi:** Laporan diberi label kode samaran (*Pseudonym Token*, misal: `GHOST-CYBER-884`), menjaga privasi pengadu secara absolut.
- **Integritas Anti-Pemalsuan (Tamper-Proof):** Jika ada pihak yang memanipulasi 1 karakter saja pada dokumen, tanda tangan digital otomatis menjadi invalid (*Mathematical Mismatch*).

---

## 🔬 2. Pembuktian Kriptografi Manual (100% Tanpa Library)

Aplikasi ini **TIDAK menggunakan pustaka kriptografi eksternal** (seperti Crypto-JS, Node-Forge, WebCrypto subtle RSA, jsencrypt, atau PyCryptodome). Seluruh formula matematika diimplementasikan dari dasar menggunakan JavaScript BigInt native:

| Modul | File | Komponen Matematis yang Ditulis Manual |
|---|---|---|
| **Pembangkitan Prima** | [`js/rsa.js`](file:///c:/Users/zidda/Kuliah/kripto/js/rsa.js) | Pengujian Probabilistik **Miller-Rabin** ($k$ putaran) dengan representasi $n-1 = 2^s \cdot d$ dan basis acak $a \in [2, n-2]$. |
| **Pembangkitan Kunci RSA** | [`js/rsa.js`](file:///c:/Users/zidda/Kuliah/kripto/js/rsa.js) | Generate $p, q$, modulus $n = p \cdot q$, Euler Totient $\phi(n) = (p-1)(q-1)$, pemilihan eksponen publik $e$ coprime dengan $\phi(n)$. |
| **Invers Modulo** | [`js/rsa.js`](file:///c:/Users/zidda/Kuliah/kripto/js/rsa.js) | **Algoritma Euclidean Diperluas (Extended Euclidean Algorithm)** untuk menghitung koefisien Bézout dan mencari $d = e^{-1} \pmod{\phi(n)}$. |
| **Pemangkatan Modular** | [`js/rsa.js`](file:///c:/Users/zidda/Kuliah/kripto/js/rsa.js) | **Square-and-Multiply (Binary Exponentiation)** untuk menghitung $base^{exp} \pmod n$ secara efisien $O(\log \text{exp})$ tanpa memory overflow. |
| **Chunking Blok Teks** | [`js/rsa.js`](file:///c:/Users/zidda/Kuliah/kripto/js/rsa.js) | Pemecahan teks UTF-8 ke byte array lalu ke BigInt per blok dengan batas kapasitas $m < n$. |
| **Enkripsi & Dekripsi** | [`js/rsa.js`](file:///c:/Users/zidda/Kuliah/kripto/js/rsa.js) | Enkripsi: $c_i = m_i^e \pmod n$, Dekripsi: $m_i = c_i^d \pmod n$. |
| **Hashing Pesan** | [`js/sha256.js`](file:///c:/Users/zidda/Kuliah/kripto/js/sha256.js) | Algoritma **SHA-256 murni** sesuai spesifikasi FIPS PUB 180-4 (64 ronde, rotasi bit 32-bit `Ch`, `Maj`, $\Sigma, \sigma$). |
| **Digital Signature** | [`js/rsa.js`](file:///c:/Users/zidda/Kuliah/kripto/js/rsa.js) | Tanda tangan: $S = H^d \pmod n$, Verifikasi: $V = S^e \pmod n \stackrel{?}{=} H$. |

---

## 🚀 3. Cara Menjalankan Aplikasi

Aplikasi dibangun murni berbasis **HTML5 + Vanilla CSS + Vanilla JavaScript**, sehingga sangat fleksibel dan dapat dibuka langsung di laptop penguji/dosen:

### Cara 1: Menggunakan Web Server Lokal (Direkomendasikan)
1. Buka terminal PowerShell pada folder proyek:
   ```powershell
   cd c:\Users\zidda\Kuliah\kripto
   ```
2. Jalankan server Python:
   ```powershell
   python -m http.server 8080
   ```
3. Buka browser (Chrome, Edge, Firefox, Brave) dan akses:
   ```
   http://localhost:8080
   ```

### Cara 2: Membuka Langsung File HTML
Buka File Explorer, masuk ke folder `c:\Users\zidda\Kuliah\kripto`, dan **klik ganda (double click) pada file `index.html`**.

---

## 🧭 4. Panduan Demonstrasi Pengujian (Demo untuk Dosen)

### Skenario 1: Mengirim Laporan Terenkripsi & Bertanda Tangan (Tab "Kirim Laporan")
1. Masuk ke tab **"📝 Kirim Laporan (Whistleblower)"**.
2. Pilih identitas civitas (misal: `Civitas #MHS-202401 - Mahasiswa Aktif`).
3. Perhatikan panel sebelah kanan (**Live RSA Cryptographic Pipeline**):
   - Hashing SHA-256 bergerak dinamis saat narasi diketik.
   - Tanda tangan digital $S = H^d \pmod n$ terhitung seketika.
   - Enkripsi blok RSA terhitung seketika.
4. Klik tombol **"Tanda Tangani & Enkripsi Laporan (RSA Manual)"**.
5. Sistem akan menampilkan notifikasi sukses dan mengarahkan langsung ke panel auditor.

### Skenario 2: Investigasi & Dekripsi Auditor (Tab "Panel Auditor")
1. Buka tab **"🕵️‍♂️ Panel Auditor (Investigasi)"**.
2. Perhatikan kartu laporan yang baru masuk:
   - Terlihat badge hijau **"Civitas Sah Terdaftar (Whitelisted)"** yang membuktikan keaslian civitas.
   - Isi laporan **terkunci rapat dalam bentuk Ciphertext Hex Blok acak**.
3. Klik tombol **"🔓 Dekripsi Laporan dengan Kunci Privat Auditor"**.
4. Sistem menjalankan formula $m = c^d \pmod n$ manual per blok:
   - Plaintext narasi laporan asli muncul kembali secara utuh.
   - Tampil kotak pembuktian matematis: kecocokan $V \equiv S^e \pmod n$ dengan nilai Hash dokumen.
5. Anda dapat mengklik **"📝 Ubah Status Investigasi"** untuk mengubah status laporan (misal: "Dalam Investigasi", "Telah Ditindaklanjuti") dan memberikan tanggapan resmi auditor.

### Skenario 3: Pendaftaran Civitas Baru (Tab "Direktori Civitas")
1. Buka tab **"🏛️ Direktori Civitas"**.
2. Klik tombol **"➕ Generate & Daftarkan Civitas Baru"**.
3. Masukkan nama/peran, pilih panjang bit kunci (misal 128-bit).
4. Klik **"Bangkitkan Kunci RSA & Simpan ke Whitelist"**. Sistem akan menjalankan Miller-Rabin dari nol untuk membangkitkan $p$ dan $q$ baru, menghitung pasangan kunci $(e, n)$ dan $(d, n)$, serta menyimpannya ke whitelist.

### Skenario 4: Laboratorium Kripto RSA (Tab "Math Inspector" - Fitur Andalan)
Buka tab **"🔬 Laboratorium Kripto RSA"** yang berisi 4 sub-alat visualisasi:
1. **Pembangkitan Bilangan Prima (Miller-Rabin):** Masukkan bit dan putaran $k$, klik bangkitkan untuk melihat bilangan prima dan konfirmasi probabilistiknya.
2. **Keygen & Extended Euclidean Trace:** Menampilkan nilai $p, q, n, \phi(n), e, d$ serta tabel langkah pembagian algoritma Euclidean langkah demi langkah.
3. **Square-and-Multiply Visualizer:** Menampilkan visualisasi pemangkatan modular bit-per-bit dengan operasi Square dan Multiply.
4. **Uji Anti-Tampering (Simulasi Pemalsuan):**
   - Klik *"Tandatangani Dokumen Asli"*.
   - Pada kolom sebelah kanan, ubah 1 huruf atau tanda baca pada pesan.
   - Klik *"Verifikasi Ulang Tanda Tangan"*.
   - Sistem akan langsung menampilkan pesan merah **"❌ VERIFIKASI GAGAL! TERDETEKSI PEMALSUAN DOKUMEN / TAMPERING"** karena nilai rekonstruksi $V \neq H(M')$.

---

## 📁 Struktur Berkas Proyek

```
c:\Users\zidda\Kuliah\kripto\
│
├── index.html          # Antarmuka web modern multi-tab & glassmorphism
├── README.md           # Dokumentasi teknis & panduan tugas lengkap
│
├── css\
│   └── style.css       # Sistem desain modern, tema cyber-security, responsive
│
└── js\
    ├── sha256.js       # Implementasi manual fungsi hash SHA-256 (FIPS 180-4)
    ├── rsa.js          # Mesin RSA manual (Miller-Rabin, Extended GCD, ModPow, Sign)
    ├── store.js        # Mock database, Whitelist Civitas, & Penyimpanan Laporan
    └── app.js          # Controller aplikasi, event handling, dan live visualizer
```

---
*Dibuat untuk Tugas Besar Kriptografi.*
