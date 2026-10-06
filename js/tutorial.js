/**
 * AegisBox Interactive Tutorial System
 * Tutorial bergaya game dengan spotlight highlight, tooltip animasi,
 * dan navigasi step-by-step untuk setiap fitur aplikasi.
 */

(function () {
    'use strict';

    // =========================================================================
    // TUTORIAL STEPS DEFINITION
    // =========================================================================
    const TUTORIAL_STEPS = [
        // ── INTRO ──────────────────────────────────────────────────────────────
        {
            id: 'welcome',
            tab: null,
            target: null,
            title: '🛡️ Selamat Datang di AegisBox!',
            content: `
                <p>Ini adalah sistem <strong>Whistleblower & Kotak Saran Anonim Terverifikasi</strong> berbasis Kriptografi RSA yang diimplementasikan secara <em>manual tanpa library eksternal</em>.</p>
                <p style="margin-top:0.6rem;">Tutorial ini akan memandu kamu mengenal setiap fitur, dari cara mengirim laporan hingga verifikasi matematis kriptografi RSA.</p>
                <div class="tut-badge-row">
                    <span class="tut-badge">5 Tab Fitur</span>
                    <span class="tut-badge">RSA Manual</span>
                    <span class="tut-badge">SHA-256 Manual</span>
                    <span class="tut-badge">Miller-Rabin</span>
                </div>`,
            position: 'center',
            spotlight: false,
        },

        // ── HEADER ─────────────────────────────────────────────────────────────
        {
            id: 'header',
            tab: null,
            target: '.site-header',
            title: '📌 Header & Status Sistem',
            content: `
                <p>Header menampilkan <strong>status sistem secara real-time</strong>:</p>
                <ul>
                    <li>🟢 <strong>Auditor RSA Aktif</strong> — kunci 128-bit siap digunakan</li>
                    <li>👥 <strong>Civitas Whitelist</strong> — jumlah pengguna terdaftar</li>
                    <li>📨 <strong>Laporan Diterima</strong> — total laporan masuk terenkripsi</li>
                </ul>`,
            position: 'bottom',
            spotlight: true,
        },

        // ── TAB NAVIGATION ─────────────────────────────────────────────────────
        {
            id: 'nav-tabs',
            tab: null,
            target: '.nav-tabs-wrapper',
            title: '🧭 Navigasi Utama — 5 Tab Fitur',
            content: `
                <p>Aplikasi memiliki <strong>5 tab utama</strong>:</p>
                <ul>
                    <li>✍️ <strong>Kirim Laporan</strong> — Portal Whistleblower</li>
                    <li>🔍 <strong>Panel Auditor</strong> — Dekripsi & investigasi laporan</li>
                    <li>👥 <strong>Direktori Civitas</strong> — Whitelist kunci publik RSA</li>
                    <li>🔬 <strong>Lab Kripto</strong> — Inspeksi matematika RSA</li>
                    <li>📖 <strong>Teori RSA</strong> — Dokumentasi & formula</li>
                </ul>`,
            position: 'bottom',
            spotlight: true,
        },

        // ── TAB 1: SUBMIT FORM ─────────────────────────────────────────────────
        {
            id: 'submit-identity',
            tab: 'tab-submit',
            target: '#senderSelect',
            title: '👤 Pilih Identitas Pengirim',
            content: `
                <p>Pilih salah satu <strong>Civitas yang terdaftar</strong> sebagai identitas pengirim.</p>
                <p style="margin-top:0.5rem;">🔑 Kunci privat RSA-nya akan digunakan untuk <strong>menandatangani laporan secara digital</strong> — tanpa pernah membocorkan nama asli ke auditor.</p>`,
            position: 'bottom',
            spotlight: true,
        },
        {
            id: 'submit-privatekey',
            tab: 'tab-submit',
            target: '#senderPrivateKeyInput',
            title: '🔐 Kunci Privat RSA (d)',
            content: `
                <p>Ini adalah <strong>Kunci Privat RSA (d)</strong> milik pengirim terpilih.</p>
                <p style="margin-top:0.5rem;">Digunakan dalam formula tanda tangan digital:</p>
                <div class="tut-formula">S = H(M)<sup>d</sup> mod n</div>
                <p style="margin-top:0.5rem;">Klik <strong>"Tampilkan"</strong> untuk melihat nilai kunci privat secara utuh.</p>`,
            position: 'bottom',
            spotlight: true,
        },
        {
            id: 'submit-category',
            tab: 'tab-submit',
            target: '#reportCategory',
            title: '🏷️ Kategori Laporan',
            content: `
                <p>Pilih kategori pelanggaran yang sesuai:</p>
                <ul>
                    <li>💰 Korupsi & Pungli</li>
                    <li>📚 Kecurangan Akademik</li>
                    <li>⚠️ Pelanggaran Etika</li>
                    <li>🚫 Penyalahgunaan Wewenang</li>
                    <li>💡 Kotak Saran Konstruktif</li>
                </ul>`,
            position: 'bottom',
            spotlight: true,
        },
        {
            id: 'submit-content',
            tab: 'tab-submit',
            target: '#reportContent',
            title: '📝 Isi Narasi Laporan',
            content: `
                <p>Tuliskan kronologi kejadian secara detail di sini.</p>
                <p style="margin-top:0.5rem;">Teks ini akan <strong>dienkripsi blok per blok menggunakan RSA</strong> dengan kunci publik auditor, sehingga hanya auditor yang dapat membacanya.</p>
                <p style="margin-top:0.5rem;">Setiap perubahan teks memperbarui <strong>Live Pipeline</strong> di sebelah kanan secara real-time!</p>`,
            position: 'top',
            spotlight: true,
        },
        {
            id: 'submit-pipeline',
            tab: 'tab-submit',
            target: '#submitPipelineStepper',
            title: '⚙️ Live RSA Cryptographic Pipeline',
            content: `
                <p>Ini menunjukkan <strong>4 langkah proses kriptografi</strong> secara real-time:</p>
                <ol>
                    <li><strong>SHA-256 Manual</strong> — hash 256-bit dari isi laporan</li>
                    <li><strong>RSA Digital Signature</strong> — S = H<sup>d</sup> mod n</li>
                    <li><strong>RSA Enkripsi Blok</strong> — c<sub>i</sub> = m<sub>i</sub><sup>e</sup> mod n</li>
                    <li><strong>Pseudonim Terverifikasi</strong> — identitas anonim pengirim</li>
                </ol>`,
            position: 'left',
            spotlight: true,
        },
        {
            id: 'submit-button',
            tab: 'tab-submit',
            target: '#btnSubmitReport',
            title: '🚀 Kirim Laporan Terenkripsi',
            content: `
                <p>Klik tombol ini untuk <strong>menandatangani & mengenkripsi laporan</strong> secara kriptografis menggunakan RSA manual murni.</p>
                <p style="margin-top:0.5rem;">Setelah dikirim, laporan tersimpan dalam format ciphertext yang hanya bisa dibuka oleh auditor dengan kunci privat-nya.</p>`,
            position: 'top',
            spotlight: true,
        },

        // ── TAB 2: AUDITOR ─────────────────────────────────────────────────────
        {
            id: 'auditor-intro',
            tab: 'tab-auditor',
            target: '.auditor-status-card',
            title: '🔍 Panel Auditor — Kotak Masuk',
            content: `
                <p>Di sini auditor dapat melihat semua laporan terenkripsi yang masuk.</p>
                <p style="margin-top:0.5rem;">Setiap laporan hanya menampilkan <strong>ciphertext RSA</strong> — blok-blok angka terenkripsi. Tidak ada seorang pun selain auditor yang bisa membacanya.</p>`,
            position: 'bottom',
            spotlight: true,
        },
        {
            id: 'auditor-key-modal',
            tab: 'tab-auditor',
            target: '#btnShowAuditorKeyModal',
            title: '🗝️ Kelola Kunci RSA Auditor',
            content: `
                <p>Klik tombol ini untuk melihat <strong>Kunci Publik dan Privat RSA Auditor</strong>.</p>
                <p style="margin-top:0.5rem;">Dari sini kamu juga bisa:</p>
                <ul>
                    <li>🔄 <strong>Generate ulang</strong> kunci RSA auditor baru</li>
                    <li>🗑️ <strong>Reset</strong> database ke setelan awal</li>
                </ul>`,
            position: 'bottom',
            spotlight: true,
        },
        {
            id: 'auditor-reports',
            tab: 'tab-auditor',
            target: '#reportsListContainer',
            title: '📨 Daftar Laporan Terenkripsi',
            content: `
                <p>Setiap laporan menampilkan:</p>
                <ul>
                    <li>👤 <strong>Kode Pseudonim</strong> — identitas anonim pengirim</li>
                    <li>✅ <strong>Badge Civitas Sah</strong> — jika kunci publik pengirim ada di whitelist</li>
                    <li>🔒 <strong>Ciphertext RSA</strong> — blok-blok data terenkripsi</li>
                    <li>🔓 <strong>Tombol Dekripsi</strong> — untuk membaca isi laporan</li>
                </ul>`,
            position: 'top',
            spotlight: true,
        },

        // ── TAB 3: DIRECTORY ───────────────────────────────────────────────────
        {
            id: 'directory-concept',
            tab: 'tab-directory',
            target: '#tab-directory .math-formula-callout',
            title: '💡 Prinsip Whitelist Kunci Publik',
            content: `
                <p>Organisasi hanya menyimpan <strong>Kunci Publik RSA</strong> setiap civitas.</p>
                <p style="margin-top:0.5rem;">Saat laporan masuk, auditor memverifikasi apakah tanda tangan cocok dengan salah satu kunci publik di tabel ini:</p>
                <div class="tut-formula">V &equiv; S<sup>e</sup> (mod n)</div>
                <p style="margin-top:0.5rem;">Jika cocok → pengirim adalah civitas sah, <strong>tanpa auditor tahu nama aslinya</strong>!</p>`,
            position: 'bottom',
            spotlight: true,
        },
        {
            id: 'directory-table',
            tab: 'tab-directory',
            target: '#membersTable',
            title: '📋 Tabel Direktori Civitas',
            content: `
                <p>Tabel ini berisi semua civitas terdaftar dengan:</p>
                <ul>
                    <li>🆔 ID Anggota & Peran</li>
                    <li>🎭 Kode Pseudonim anonim</li>
                    <li>🔑 Kunci Publik RSA (e, n) — <em>hanya kunci publik, bukan privat!</em></li>
                    <li>📅 Tanggal pendaftaran</li>
                </ul>`,
            position: 'top',
            spotlight: true,
        },
        {
            id: 'directory-add',
            tab: 'tab-directory',
            target: '#btnOpenNewMemberModal',
            title: '➕ Daftarkan Civitas Baru',
            content: `
                <p>Klik tombol ini untuk mendaftarkan civitas baru.</p>
                <p style="margin-top:0.5rem;">Sistem akan <strong>membangkitkan pasangan kunci RSA</strong> secara otomatis menggunakan:</p>
                <ul>
                    <li>🎲 Dua bilangan prima acak <em>p</em> dan <em>q</em></li>
                    <li>🧪 Diuji dengan <strong>Miller-Rabin Probabilistik</strong></li>
                    <li>📐 Kunci privat dihitung via <strong>Extended Euclidean</strong></li>
                </ul>`,
            position: 'bottom',
            spotlight: true,
        },

        // ── TAB 4: LAB ─────────────────────────────────────────────────────────
        {
            id: 'lab-intro',
            tab: 'tab-lab',
            target: '.math-subnav',
            title: '🔬 Laboratorium Kriptografi RSA',
            content: `
                <p>Lab ini memiliki <strong>4 sub-modul</strong> untuk menginspeksi matematika RSA secara interaktif:</p>
                <ul>
                    <li>1️⃣ <strong>Miller-Rabin</strong> — Pembangkitan bilangan prima</li>
                    <li>2️⃣ <strong>Keygen</strong> — Trace lengkap pembangkitan kunci</li>
                    <li>3️⃣ <strong>Square-and-Multiply</strong> — Pemangkatan modular</li>
                    <li>4️⃣ <strong>Anti-Tampering</strong> — Uji integritas tanda tangan</li>
                </ul>`,
            position: 'bottom',
            spotlight: true,
        },
        {
            id: 'lab-miller-rabin',
            tab: 'tab-lab',
            tabMath: 'math-primes',
            target: '#math-primes .math-formula-callout',
            title: '🧮 Miller-Rabin Primality Test',
            content: `
                <p>Algoritma pengujian bilangan prima probabilistik yang digunakan untuk membangkitkan <em>p</em> dan <em>q</em>:</p>
                <div class="tut-formula">n &minus; 1 = 2<sup>s</sup> &middot; d</div>
                <p style="margin-top:0.5rem;">Hitung x = a<sup>d</sup> mod n untuk beberapa saksi <em>a</em> secara acak. Semakin banyak putaran pengujian, semakin kecil kemungkinan bilangan komposit lolos uji.</p>`,
            position: 'bottom',
            spotlight: true,
        },
        {
            id: 'lab-keygen',
            tab: 'tab-lab',
            tabMath: 'math-keygen',
            target: '#math-keygen',
            title: '🔑 Trace Pembangkitan Kunci RSA',
            content: `
                <p>Lihat seluruh langkah matematis pembangkitan kunci RSA:</p>
                <ul>
                    <li><strong>p, q</strong> — Dua bilangan prima acak</li>
                    <li><strong>n = p &times; q</strong> — Modulus RSA</li>
                    <li><strong>&phi;(n) = (p&minus;1)(q&minus;1)</strong> — Fungsi Euler Totient</li>
                    <li><strong>e = 65537</strong> — Eksponen publik</li>
                    <li><strong>d = e&#8315;&#185; mod &phi;(n)</strong> — Eksponen privat via Extended Euclidean</li>
                </ul>`,
            position: 'right',
            spotlight: true,
        },
        {
            id: 'lab-modpow',
            tab: 'tab-lab',
            tabMath: 'math-modpow',
            target: '#math-modpow',
            title: '⚡ Square-and-Multiply Visualizer',
            content: `
                <p>Visualisasi algoritma <strong>pemangkatan modular cepat</strong> yang digunakan di seluruh operasi RSA:</p>
                <div class="tut-formula">base<sup>exp</sup> mod n</div>
                <p style="margin-top:0.5rem;">Algoritma ini bekerja <strong>bit per bit</strong> dari eksponen, menghindari overflow pada bilangan BigInt yang sangat besar dengan kompleksitas <em>O(log exp)</em>.</p>`,
            position: 'right',
            spotlight: true,
        },
        {
            id: 'lab-tampering',
            tab: 'tab-lab',
            tabMath: 'math-tampering',
            target: '#math-tampering',
            title: '🛡️ Uji Anti-Tampering Dokumen',
            content: `
                <p>Buktikan bahwa <strong>mengubah satu karakter saja</strong> akan langsung membatalkan tanda tangan digital!</p>
                <ol>
                    <li>Tandatangani dokumen asli &rarr; dapatkan nilai S</li>
                    <li>Ubah satu huruf pada teks di kolom kanan</li>
                    <li>Klik verifikasi &rarr; sistem akan mendeteksi pemalsuan</li>
                </ol>
                <p style="margin-top:0.5rem;">Ini adalah bukti nyata <strong>integritas kriptografis RSA</strong>!</p>`,
            position: 'right',
            spotlight: true,
        },

        // ── TAB 5: DOCS ────────────────────────────────────────────────────────
        {
            id: 'docs-overview',
            tab: 'tab-docs',
            target: '#tab-docs .glass-card',
            title: '📖 Dokumentasi & Teori RSA',
            content: `
                <p>Tab ini berisi <strong>dokumentasi teknis lengkap</strong> implementasi:</p>
                <ul>
                    <li>📌 Masalah nyata yang diselesaikan</li>
                    <li>🔢 Formula matematis RSA lengkap (dengan KaTeX rendering)</li>
                    <li>💻 Bukti implementasi murni tanpa library</li>
                </ul>
                <p style="margin-top:0.5rem;">Semua formula matematika dirender menggunakan <strong>KaTeX</strong> untuk tampilan yang indah dan terbaca!</p>`,
            position: 'right',
            spotlight: true,
        },

        // ── OUTRO ──────────────────────────────────────────────────────────────
        {
            id: 'finish',
            tab: null,
            target: null,
            title: '🎉 Tutorial Selesai!',
            content: `
                <p>Kamu telah mengenal seluruh fitur <strong>AegisBox Cryptography System</strong>!</p>
                <div class="tut-badge-row" style="margin-top:0.75rem;">
                    <span class="tut-badge tut-badge-green">✅ Kirim Laporan</span>
                    <span class="tut-badge tut-badge-green">✅ Panel Auditor</span>
                    <span class="tut-badge tut-badge-green">✅ Direktori Civitas</span>
                    <span class="tut-badge tut-badge-green">✅ Lab Kripto RSA</span>
                    <span class="tut-badge tut-badge-green">✅ Dokumentasi</span>
                </div>
                <p style="margin-top:1rem; font-size:0.9rem; color:var(--text-muted);">Klik <strong>"Mulai Eksplorasi"</strong> untuk mulai menggunakan aplikasi secara mandiri.</p>`,
            position: 'center',
            spotlight: false,
        },
    ];

    // =========================================================================
    // STATE
    // =========================================================================
    let currentStep = 0;
    let tutorialActive = false;

    // =========================================================================
    // BUILD DOM
    // =========================================================================
    function buildTutorialDOM() {
        // Overlay gelap
        const overlay = document.createElement('div');
        overlay.id = 'tut-overlay';

        // Spotlight hole
        const spotlightEl = document.createElement('div');
        spotlightEl.id = 'tut-spotlight';

        // Tooltip card
        const tooltip = document.createElement('div');
        tooltip.id = 'tut-tooltip';
        tooltip.innerHTML = `
            <div id="tut-progress-bar"><div id="tut-progress-fill"></div></div>
            <div id="tut-step-counter"></div>
            <div id="tut-title"></div>
            <div id="tut-content"></div>
            <div id="tut-controls">
                <button id="tut-btn-skip">&#x2715; Lewati Tutorial</button>
                <div id="tut-nav-btns">
                    <button id="tut-btn-prev">&#8592; Kembali</button>
                    <button id="tut-btn-next">Lanjut &#8594;</button>
                </div>
            </div>
        `;

        // Floating launcher button
        const launcher = document.createElement('button');
        launcher.id = 'tut-launcher';
        launcher.title = 'Mulai Tutorial Interaktif';
        launcher.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>Tutorial</span>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(spotlightEl);
        document.body.appendChild(tooltip);
        document.body.appendChild(launcher);

        // Events
        launcher.addEventListener('click', startTutorial);
        document.getElementById('tut-btn-next').addEventListener('click', nextStep);
        document.getElementById('tut-btn-prev').addEventListener('click', prevStep);
        document.getElementById('tut-btn-skip').addEventListener('click', endTutorial);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) nextStep();
        });

        // Keyboard navigation
        document.addEventListener('keydown', function (e) {
            if (!tutorialActive) return;
            if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); nextStep(); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); prevStep(); }
            if (e.key === 'Escape') endTutorial();
        });
    }

    // =========================================================================
    // TUTORIAL CONTROL
    // =========================================================================
    function startTutorial() {
        tutorialActive = true;
        currentStep = 0;
        document.getElementById('tut-overlay').classList.add('active');
        document.getElementById('tut-launcher').classList.add('hidden');
        showStep(currentStep);
    }

    function endTutorial() {
        tutorialActive = false;
        document.getElementById('tut-overlay').classList.remove('active');
        const sp = document.getElementById('tut-spotlight');
        if (sp) { sp.style.cssText = ''; sp.style.display = 'none'; }
        document.getElementById('tut-tooltip').classList.remove('visible');
        document.getElementById('tut-launcher').classList.remove('hidden');
        removeAllHighlights();
        try { localStorage.setItem('aegisbox_tutorial_seen', '1'); } catch (_) {}
    }

    function nextStep() {
        if (currentStep < TUTORIAL_STEPS.length - 1) {
            currentStep++;
            showStep(currentStep);
        } else {
            endTutorial();
        }
    }

    function prevStep() {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
        }
    }

    // =========================================================================
    // SHOW STEP
    // =========================================================================
    function showStep(idx) {
        const step = TUTORIAL_STEPS[idx];

        removeAllHighlights();

        // Switch main tab if needed
        if (step.tab) {
            const tabBtn = document.querySelector('[data-tab="' + step.tab + '"]');
            if (tabBtn && !tabBtn.classList.contains('active')) tabBtn.click();
        }

        // Switch math sub-tab if needed
        if (step.tabMath) {
            const mathBtn = document.querySelector('[data-math="' + step.tabMath + '"]');
            if (mathBtn && !mathBtn.classList.contains('active')) mathBtn.click();
        }

        // Delay to let DOM settle
        var delay = (step.tab || step.tabMath) ? 150 : 0;
        setTimeout(function () {
            _renderStep(step, idx, TUTORIAL_STEPS.length);
        }, delay);
    }

    function _renderStep(step, idx, total) {
        var tooltip = document.getElementById('tut-tooltip');
        var spotlightEl = document.getElementById('tut-spotlight');

        // Content
        document.getElementById('tut-step-counter').textContent = 'Langkah ' + (idx + 1) + ' dari ' + total;
        document.getElementById('tut-title').innerHTML = step.title;
        document.getElementById('tut-content').innerHTML = step.content;

        // Progress bar
        var pct = ((idx + 1) / total) * 100;
        document.getElementById('tut-progress-fill').style.width = pct + '%';

        // Button states
        var prevBtn = document.getElementById('tut-btn-prev');
        prevBtn.style.visibility = idx === 0 ? 'hidden' : 'visible';
        var nextBtn = document.getElementById('tut-btn-next');
        nextBtn.textContent = idx === total - 1 ? '🚀 Mulai Eksplorasi' : 'Lanjut →';

        // Spotlight
        if (step.target && step.spotlight) {
            var el = document.querySelector(step.target);
            if (el) {
                el.classList.add('tut-highlight');
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(function () {
                    positionSpotlight(el, spotlightEl);
                    positionTooltip(el, tooltip, step.position);
                }, 200);
            } else {
                spotlightEl.style.display = 'none';
                centerTooltip(tooltip);
            }
        } else {
            spotlightEl.style.display = 'none';
            centerTooltip(tooltip);
        }

        // Animate tooltip in
        tooltip.classList.remove('visible');
        setTimeout(function () {
            tooltip.classList.add('visible');
        }, 30);
    }

    // =========================================================================
    // POSITIONING
    // =========================================================================
    function positionSpotlight(el, spotlightEl) {
        var rect = el.getBoundingClientRect();
        var PAD = 10;
        spotlightEl.style.display = 'block';
        spotlightEl.style.top = (rect.top - PAD) + 'px';
        spotlightEl.style.left = (rect.left - PAD) + 'px';
        spotlightEl.style.width = (rect.width + PAD * 2) + 'px';
        spotlightEl.style.height = (rect.height + PAD * 2) + 'px';
    }

    function positionTooltip(el, tooltipEl, position) {
        // Reset
        tooltipEl.style.cssText = '';
        tooltipEl.classList.add('visible');

        var rect = el.getBoundingClientRect();
        var tW = 360;
        var tH = tooltipEl.offsetHeight || 320;
        var vW = window.innerWidth;
        var vH = window.innerHeight;
        var PAD = 20;
        var MARGIN = 14;

        var top, left;

        if (position === 'bottom') {
            top = rect.bottom + PAD;
            left = rect.left + rect.width / 2 - tW / 2;
        } else if (position === 'top') {
            top = rect.top - tH - PAD;
            left = rect.left + rect.width / 2 - tW / 2;
        } else if (position === 'left') {
            top = rect.top + rect.height / 2 - tH / 2;
            left = rect.left - tW - PAD;
        } else if (position === 'right') {
            top = rect.top + rect.height / 2 - tH / 2;
            left = rect.right + PAD;
        } else {
            centerTooltip(tooltipEl);
            return;
        }

        // Clamp within viewport
        left = Math.max(MARGIN, Math.min(left, vW - tW - MARGIN));
        top = Math.max(MARGIN, Math.min(top, vH - tH - MARGIN));

        tooltipEl.style.position = 'fixed';
        tooltipEl.style.top = top + 'px';
        tooltipEl.style.left = left + 'px';
        tooltipEl.style.width = tW + 'px';
        tooltipEl.style.transform = 'none';
    }

    function centerTooltip(tooltipEl) {
        tooltipEl.style.position = 'fixed';
        tooltipEl.style.top = '50%';
        tooltipEl.style.left = '50%';
        tooltipEl.style.width = '420px';
        tooltipEl.style.transform = 'translate(-50%, -50%)';
    }

    function removeAllHighlights() {
        document.querySelectorAll('.tut-highlight').forEach(function (el) {
            el.classList.remove('tut-highlight');
        });
    }

    // =========================================================================
    // INIT
    // =========================================================================
    function init() {
        buildTutorialDOM();
        // Auto-start on first visit
        try {
            var seen = localStorage.getItem('aegisbox_tutorial_seen');
            if (!seen) {
                setTimeout(startTutorial, 900);
            }
        } catch (_) {}
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
