# Kriptografi Part 5
## Asymmetric-key Cryptography: RSA

---

## 1. Perkenalan RSA

- Dari sekian banyak algoritma kriptografi kunci-publik yang pernah dibuat, algoritma yang paling populer adalah **algoritma RSA**.
- Algoritma RSA dibuat oleh 3 orang peneliti dari MIT (Massachusetts Institute of Technology) pada tahun 1976, yaitu: Ron (**R**)ivest, Adi (**S**)hamir, dan Leonard (**A**)dleman.
- Keamanan algoritma RSA terletak pada sulitnya memfaktorkan bilangan yang besar menjadi faktor-faktor prima. Pemfaktoran dilakukan untuk memperoleh kunci privat. Selama pemfaktoran bilangan besar menjadi faktor-faktor prima belum ditemukan algoritma yang mangkus, maka selama itu pula keamanan algoritma RSA tetap terjamin.

---

## 2. PBB (Pembagi Bersama Terbesar) atau GCD (Greatest Common Divisor)

Misalkan $a$ dan $b$ adalah dua buah bilangan bulat tidak nol. Pembagi bersama terbesar (PBB atau gcd) dari $a$ dan $b$ adalah bilangan bulat terbesar $d$ sedemikian sehingga $d \mid a$ dan $d \mid b$. Dalam hal ini dinyatakan bahwa $\text{PBB}(a, b) = d$.

**Contoh:**

- Faktor pembagi 45: 1, 3, 5, 9, 15, 45
- Faktor pembagi 36: 1, 2, 3, 4, 9, 12, 18, 36
- Faktor pembagi bersama dari 45 dan 36 adalah 1, 3, 9
- $\text{PBB}(45, 36) = 9$

---

## 3. Relatif Prima

- Dua buah bilangan bulat $a$ dan $b$ dikatakan **relatif prima** jika $\text{PBB}(a, b) = 1$.
- **Contoh:**
  - 20 dan 3 relatif prima sebab $\text{PBB}(20, 3) = 1$.
  - 7 dan 11 relatif prima karena $\text{PBB}(7, 11) = 1$.
  - 20 dan 5 tidak relatif prima sebab $\text{PBB}(20, 5) = 5 \neq 1$.
- Jika $a$ dan $b$ relatif prima, maka terdapat bilangan bulat $m$ dan $n$ sedemikian sehingga:

  $$ma + nb = 1$$

- **Contoh:** Bilangan 20 dan 3 relatif prima karena $\text{PBB}(20, 3) = 1$, atau dapat ditulis

  $$2 \cdot 20 + (-13) \cdot 3 = 1$$

  dengan $m = 2$ dan $n = -13$.
- Tetapi 20 dan 5 tidak relatif prima karena $\text{PBB}(20, 5) = 5 \neq 1$ sehingga 20 dan 5 tidak dapat dinyatakan dalam $m \cdot 20 + n \cdot 5 = 1$.

---

## 4. Fungsi Totient Euler ($\Phi(n)$)

- Fungsi Euler $\Phi$ mendefinisikan $\Phi(n)$ untuk $n \geq 1$ yang menyatakan jumlah bilangan bulat positif $< n$ yang relatif prima dengan $n$.
- Jika $n = pq$ adalah bilangan komposit dengan $p$ dan $q$ prima, maka:

  $$\Phi(n) = \Phi(p)\,\Phi(q) = (p-1)(q-1)$$

- **Contoh:** Tentukan $\Phi(21)$.

  **Penyelesaian:** Karena $21 = 7 \times 3$,

  $$\Phi(21) = \Phi(7)\,\Phi(3) = 6 \times 2 = 12$$

  yaitu 12 buah bilangan bulat yang relatif prima terhadap 21: 1, 2, 4, 5, 8, 10, 11, 13, 16, 17, 19, 20.

---

## 5. Teorema Euler

Selain fungsi totient Euler, kita juga mendefinisikan teorema Euler. Misalkan $a$ dan $n$ adalah dua buah bilangan yang relatif prima, $\Phi(n)$ adalah fungsi totient Euler, maka berlaku teorema Euler sebagai berikut:

$$a^{\Phi(n)} \equiv 1 \pmod{n}$$

**Contoh:** $a = 7$ dan $n = 10$ (keduanya relatif prima), $\Phi(10) = 4$, maka:

$$7^4 = 2041 \equiv 1 \pmod{10}$$

> Catatan: pada slide asli tertulis 2041. Nilai sebenarnya $7^4 = 2401$ (hasil modulonya tetap $\equiv 1 \pmod{10}$).

---

## 6. Properti pada Algoritma RSA

Variabel-variabel yang digunakan pada algoritma RSA:

| Variabel | Keterangan | Status |
|---|---|---|
| $p$ dan $q$ | bilangan prima | rahasia |
| $n = p \times q$ | modulus | tidak rahasia |
| $\Phi(n) = (p-1)(q-1)$ | | rahasia |
| $e$ | kunci enkripsi | tidak rahasia |
| $d$ | kunci dekripsi | rahasia |
| $m$ | plainteks | rahasia |
| $c$ | cipherteks | tidak rahasia |

---

## 7. Pembangkitan Kunci Algoritma RSA

1. Pilih dua buah bilangan prima sembarang, $p$ dan $q$.
2. Hitung $n = p \times q$ (sebaiknya $p \neq q$, sebab jika $p = q$ maka $n = p^2$ sehingga $p$ dapat dikriptanalisis dengan menarik akar pangkat dua dari $n$).
3. Hitung $\Phi(n) = (p-1)(q-1)$.
4. Pilih kunci publik, $e$, yang relatif prima terhadap $\Phi(n)$.
5. Bangkitkan kunci privat dengan menggunakan persamaan:

   $$e \cdot d \equiv 1 \pmod{\Phi(n)}$$

Perhatikan bahwa $e \cdot d \equiv 1 \pmod{\Phi(n)}$ ekuivalen dengan $e \cdot d = 1 + k\,\Phi(n)$, sehingga $d$ dapat dihitung dengan:

$$d = \frac{1 + k\,\Phi(n)}{e}$$

Akan terdapat bilangan bulat $k$ yang memberikan bilangan bulat $d$.

**Hasil dari algoritma di atas:**

- Kunci publik adalah pasangan $(e, n)$
- Kunci privat adalah pasangan $(d, n)$

> Catatan: $n$ tidak bersifat rahasia, namun ia diperlukan pada perhitungan enkripsi/dekripsi.

### Contoh: Alice (A)

1. Alice memilih $p = 47$ dan $q = 71$ (keduanya prima).
2. Alice menghitung $n = p \times q = 3337$ dan $\Phi(n) = (p-1)(q-1) = 3220$. Alice memilih kunci publik $e = 79$, karena 79 relatif prima dengan 3220. Alice mengumumkan nilai $e$ dan $n$.
3. Alice menghitung kunci dekripsi $d$ menggunakan persamaan:

   $$d = \frac{1 + k\,\Phi(n)}{e} = \frac{1 + k \cdot 3220}{79} = \ ...?$$

4. Dengan mencoba nilai-nilai $k = 1, 2, 3, \dots$, diperoleh nilai $d$ yang bulat adalah **1019**. Ini adalah kunci privat untuk mendekripsi pesan. Kunci ini harus dirahasiakan oleh Alice.
5. **Kunci publik Alice:** $(e = 79,\ n = 3337)$
6. **Kunci privat Alice:** $(d = 1019,\ n = 3337)$

### Contoh: Bob (B)

1. Bob memilih $p = 83$ dan $q = 61$ (keduanya prima).
2. Bob menghitung $n = p \times q = 5063$ dan $\Phi(n) = (p-1)(q-1) = 4920$. Bob memilih kunci publik $e = 187$, karena 187 relatif prima dengan 4920. Bob mengumumkan nilai $e$ dan $n$.
3. Bob menghitung kunci dekripsi $d$ menggunakan persamaan:

   $$d = \frac{1 + k\,\Phi(n)}{e} = \frac{1 + k \cdot 4920}{187} = \ ...?$$

4. Dengan mencoba nilai-nilai $k = 1, 2, 3, \dots$, diperoleh nilai $d$ yang bulat adalah **763**. Ini adalah kunci privat untuk mendekripsi pesan. Kunci ini harus dirahasiakan oleh Bob.
5. **Kunci publik Bob:** $(e = 187,\ n = 5063)$
6. **Kunci privat Bob:** $(d = 763,\ n = 5063)$
7. Baik Alice maupun Bob mengumumkan kunci publik mereka masing-masing agar dapat digunakan untuk mengenkripsi pesan yang ditujukan kepada mereka.

---

## 8. Algoritma Enkripsi dan Dekripsi RSA

### Enkripsi

Misal Bob akan mengirimkan pesan $m$ kepada Alice dan akan mengenkripsinya menggunakan algoritma RSA. Nilai $m$ haruslah terletak di dalam selang $[0, n-1]$. Prosedur yang dilakukan Bob sebagai berikut:

1. Bob mengambil kunci publik Alice, $e$, dan nilai modulus $n$.
2. Nyatakan plainteks $m$ menjadi blok-blok $m_1, m_2, \dots$ sedemikian sehingga setiap blok merepresentasikan nilai di dalam selang $[0, n-1]$.
3. Setiap blok $m_i$ dienkripsi menjadi blok $c_i$ dengan rumus:

   $$c_i = m_i^{e} \bmod n$$

4. Bob mengirim $c_i$ kepada Alice.

### Dekripsi

Alice mendekripsikan cipherteks dari Bob sebagai berikut:

1. Alice menggunakan kunci privatnya, $d$, dan nilai modulus $n$.
2. Setiap blok cipherteks $c_i$ didekripsi kembali menjadi blok $m_i$ dengan rumus:

   $$m_i = c_i^{d} \bmod n$$

---

## 9. Contoh Enkripsi RSA

1. Misalkan Bob mengirim pesan **m = HELLOALICE** kepada Alice. Dengan perumpamaan hasil dari desimal tabel ASCII adalah A=00, B=01, ..., Z=25, maka pesan $m$ dikodekan ke dalam desimal (dalam kasus ini, spasi diabaikan) menjadi:

   **m = 07041111140011080204**

2. Bob memecah $m$ menjadi blok yang lebih kecil, misalnya blok-blok sepanjang 4 digit:

   $m_1 = 0704;\ m_2 = 1111;\ m_3 = 1400;\ m_4 = 1108;\ m_5 = 0204$

3. Nilai-nilai $m_i$ ini masih terletak pada selang $[0, 3337-1]$ agar transformasi menjadi satu-ke-satu.
4. Misalkan Bob mengetahui kunci publik Alice adalah $e = 79$ dan $n = 3337$. Bob mengenkripsi setiap blok plainteks sebagai berikut:

   - $c_1 = 704^{79} \bmod 3337 = 328$
   - $c_2 = 1111^{79} \bmod 3337 = 301$
   - $c_3 = 1400^{79} \bmod 3337 = 2653$
   - $c_4 = 1108^{79} \bmod 3337 = 2986$
   - $c_5 = 204^{79} \bmod 3337 = 1164$

Jadi cipherteks yang dihasilkan adalah:

**c = 0328 0301 2653 2986 1164** (ditulis pada slide: `03280301265329861164`)

---

## 10. Contoh Dekripsi RSA

1. Cipherteks dikirim ke Alice. Alice melakukan dekripsi menggunakan kunci privat $d = 1019$. Blok-blok cipherteks didekripsi Alice sebagai berikut:

   - $m_1 = 328^{1019} \bmod 3337 = 704 = 0704$
   - $m_2 = 301^{1019} \bmod 3337 = 1111$
   - $m_3 = 2653^{1019} \bmod 3337 = 1400$
   - $m_4 = 2986^{1019} \bmod 3337 = 1108$
   - $m_5 = 1164^{1019} \bmod 3337 = 204$

2. Alice akan memperoleh kembali plainteks semula:

   **m = 07041111140011080204**

3. Yang dikodekan kembali menjadi **m = HELLOALICE**

---

## Referensi

- Jean-Philippe Aumasson. 2017. *Serious Cryptography: A Practical Introduction to Modern Encryption*. San Francisco: No Starch Press, Inc.
- Rinaldi Munir. 2019. *Kriptografi*, Edisi Kedua.

---

## ETS (Tugas)

- Buatlah kelompok dengan jumlah anggota 2 orang per kelompok.
- Buatlah program dengan 2 studi kasus berbeda:
  - Studi kasus pertama: mengimplementasikan algoritma enkripsi **DES dan AES**.
  - Studi kasus kedua: mengimplementasikan algoritma **RSA**.
- Wajib menggunakan UI.

**Yang dikumpulkan:**

- Program (dalam ZIP)
- Dokumentasi Word (dalam ZIP)
- Dokumentasi video dalam bentuk link yang diupload ke YouTube (boleh listed/unlisted), dikumpulkan pada spreadsheet yang telah disediakan. Video berisi presentasi demo project dan running program; sebelum presentasi setiap anggota wajib memperkenalkan diri dengan Nama dan NRP.

**Deadline:** Senin, 21 Oktober 2024, pukul 10.00 WIB, di Classroom.
