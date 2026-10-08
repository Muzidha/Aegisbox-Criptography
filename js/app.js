/**
 * AegisBox Application Controller (app.js)
 * Mengontrol navigasi UI, interaksi form, rendering laporan, dan integrasi kriptografi RSA manual.
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // STATE & INITIALIZATION
    // =========================================================================
    let currentAuditor = CivitasStore.getAuditor();
    let currentMembers = CivitasStore.getMembers();
    let selectedSender = currentMembers[0] || null;
    let decryptedReportsMap = {}; // reportId -> { plaintext, isValid, senderMember }
    let isKeyVisible = false;

    // Inisialisasi awal
    initTabs();
    initAuth();
    initSenderDropdown();
    initLivePipeline();
    initQuickPresets();
    initGuideModal();
    initQuickReset();
    renderAuditorPanel();
    renderDirectoryTable();
    initLabComponents();
    updateHeaderBadges();

    // =========================================================================
    // TOAST NOTIFICATIONS
    // =========================================================================
    function showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type === 'error' ? 'toast-error' : 'toast-success'}`;
        toast.innerHTML = `
            <span>${type === 'error' ? '❌' : '✅'}</span>
            <div>${message}</div>
        `;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    function updateHeaderBadges() {
        const members = CivitasStore.getMembers();
        const reports = CivitasStore.getReports();
        const badgeMem = document.getElementById('registeredCountBadge');
        const badgeRep = document.getElementById('reportCountBadge');
        const inboxCount = document.getElementById('auditorInboxCount');

        const pendingReports = reports.filter(r => r.status === 'Menunggu Tinjauan');

        if (badgeMem) badgeMem.textContent = `${members.length} Civitas Whitelist`;
        if (badgeRep) {
            badgeRep.textContent = pendingReports.length > 0 
                ? `${reports.length} Laporan (${pendingReports.length} Menunggu)`
                : `${reports.length} Laporan (Semua Terverifikasi)`;
        }
        if (inboxCount) {
            inboxCount.textContent = pendingReports.length;
            if (pendingReports.length === 0) {
                inboxCount.style.background = '#10b981';
                inboxCount.style.color = '#ffffff';
                inboxCount.title = 'Semua laporan telah diverifikasi';
            } else {
                inboxCount.style.background = '';
                inboxCount.style.color = '';
                inboxCount.title = `${pendingReports.length} laporan menunggu verifikasi`;
            }
        }
    }

    // =========================================================================
    // TAB NAVIGATION
    // =========================================================================
    function activateTab(tabId) {
        const tabButtons = document.querySelectorAll('.nav-tab-btn');
        tabButtons.forEach(b => {
            if (b.getAttribute('data-tab') === tabId) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });
        document.querySelectorAll('.tab-pane').forEach(p => {
            if (p.id === tabId) {
                p.classList.add('active');
            } else {
                p.classList.remove('active');
            }
        });
        if (tabId === 'tab-auditor') renderAuditorPanel();
        if (tabId === 'tab-directory') renderDirectoryTable();
    }


    // =========================================================================
    // AUTENTIKASI PENGGUNA & ROLE MANAGEMENT (LOGIN / REGISTER)
    // =========================================================================
    function applyUserSession() {
        const currentUser = CivitasStore.getCurrentUser();
        const authSection = document.getElementById('authSection');
        const appSection = document.getElementById('authenticatedAppSection');
        const userSessionPill = document.getElementById('userSessionPill');
        const navTabAuditor = document.getElementById('navTabAuditor');
        const navTabSubmit = document.getElementById('navTabSubmit');
        const activeCivitasBanner = document.getElementById('activeCivitasInfoBanner');
        const senderSelectGroup = document.getElementById('senderSelectGroup');

        if (!currentUser) {
            if (authSection) authSection.style.display = 'flex';
            if (appSection) appSection.style.display = 'none';
            if (userSessionPill) userSessionPill.style.display = 'none';

            const userInp = document.getElementById('loginUsername');
            const passInp = document.getElementById('loginPassword');
            if (userInp) userInp.value = '';
            if (passInp) passInp.value = '';
            const authAlert = document.getElementById('authErrorAlert');
            if (authAlert) authAlert.style.display = 'none';
            return;
        }

        // Sudah Terotentikasi
        if (authSection) authSection.style.display = 'none';
        if (appSection) appSection.style.display = 'block';
        if (userSessionPill) userSessionPill.style.display = 'flex';

        const avatarEl = document.getElementById('userAvatar');
        const nameEl = document.getElementById('userNameLabel');
        const roleEl = document.getElementById('userRoleBadge');

        currentMembers = CivitasStore.getMembers();
        currentAuditor = CivitasStore.getAuditor();

        if (currentUser.role === 'admin') {
            // Pihak Berwenang / Auditor
            if (avatarEl) {
                avatarEl.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
            }
            if (nameEl) nameEl.textContent = 'Pihak Berwenang';
            if (roleEl) {
                roleEl.textContent = 'Auditor';
                roleEl.style.color = '#059669';
            }

            // Auditor melihat Panel Auditor
            if (navTabAuditor) navTabAuditor.style.display = 'inline-flex';
            if (navTabSubmit) navTabSubmit.style.display = 'inline-flex';

            if (activeCivitasBanner) activeCivitasBanner.style.display = 'none';
            if (senderSelectGroup) senderSelectGroup.style.display = 'block';

            initSenderDropdown();
            activateTab('tab-auditor');
        } else {
            // Civitas Biasa (Pihak Pengirim)
            let member = currentUser.member;
            if (!member && currentUser.memberId) {
                member = CivitasStore.findMemberById(currentUser.memberId);
            }
            if (!member) {
                member = currentMembers[0];
            }
            selectedSender = member;

            if (avatarEl) {
                avatarEl.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
            }
            if (nameEl) nameEl.textContent = currentUser.username;
            if (roleEl) {
                roleEl.textContent = member ? member.pseudonymCode : 'Pengirim';
                roleEl.style.color = '#0d9488';
            }

            // Sembunyikan Panel Auditor dari Civitas Biasa!
            if (navTabAuditor) navTabAuditor.style.display = 'none';
            if (navTabSubmit) navTabSubmit.style.display = 'inline-flex';

            // Tampilkan identitas pengirim aktif di formulir kirim laporan
            if (activeCivitasBanner && member) {
                activeCivitasBanner.style.display = 'flex';
                activeCivitasBanner.innerHTML = `
                    <div class="active-civitas-icon">🛡️</div>
                    <div class="active-civitas-text">
                        <strong>Identitas Pengirim Terotentikasi:</strong> ${escapeHtml(member.alias)} (${escapeHtml(member.role)} - ${escapeHtml(member.unit)})<br>
                        <span>Nama asli Anda disamarkan. Pesan akan ditandatangani digital atas nama: <strong class="highlight-token" style="color:var(--primary); font-family:var(--font-mono);">${escapeHtml(member.pseudonymCode)}</strong></span>
                    </div>
                `;
            }
            if (senderSelectGroup) senderSelectGroup.style.display = 'none';

            updateSenderKeyInput();
            triggerLivePipelineUpdate();
            activateTab('tab-submit');
        }

        updateHeaderBadges();
    }

    function initAuth() {
        const tabLoginBtn = document.getElementById('authTabLoginBtn');
        const tabRegBtn = document.getElementById('authTabRegisterBtn');
        const formLogin = document.getElementById('formLogin');
        const formRegister = document.getElementById('formRegister');
        const authAlert = document.getElementById('authErrorAlert');
        const btnLogout = document.getElementById('btnLogout');

        function setAuthAlert(msg, type = 'error') {
            if (!authAlert) return;
            if (!msg) {
                authAlert.style.display = 'none';
                return;
            }
            authAlert.className = `auth-alert ${type}`;
            authAlert.textContent = msg;
            authAlert.style.display = 'block';
        }

        if (tabLoginBtn && tabRegBtn) {
            tabLoginBtn.addEventListener('click', () => {
                tabLoginBtn.classList.add('active');
                tabRegBtn.classList.remove('active');
                formLogin.style.display = 'block';
                formRegister.style.display = 'none';
                setAuthAlert('');
            });

            tabRegBtn.addEventListener('click', () => {
                tabRegBtn.classList.add('active');
                tabLoginBtn.classList.remove('active');
                formLogin.style.display = 'none';
                formRegister.style.display = 'block';
                setAuthAlert('');
            });
        }

        // Submit Login
        if (formLogin) {
            formLogin.addEventListener('submit', (e) => {
                e.preventDefault();
                const u = document.getElementById('loginUsername').value.trim();
                const p = document.getElementById('loginPassword').value.trim();

                if (!u || !p) {
                    setAuthAlert('Username dan password wajib diisi!');
                    return;
                }

                try {
                    const user = CivitasStore.login(u, p);
                    setAuthAlert('');
                    showToast(`Selamat datang, ${user.name || user.username}!`);
                    applyUserSession();
                } catch (err) {
                    setAuthAlert(err.message || 'Login gagal.');
                }
            });
        }

        // Submit Register
        if (formRegister) {
            formRegister.addEventListener('submit', (e) => {
                e.preventDefault();
                const u = document.getElementById('regUsername').value.trim();
                const p = document.getElementById('regPassword').value.trim();
                const keygenNotice = document.getElementById('regKeygenNotice');
                const submitBtn = document.getElementById('btnSubmitRegister');

                if (!u || !p) {
                    setAuthAlert('Username dan password wajib diisi!');
                    return;
                }

                if (u.length < 3) {
                    setAuthAlert('Username minimal 3 karakter!');
                    return;
                }

                if (keygenNotice) keygenNotice.style.display = 'block';
                if (submitBtn) submitBtn.disabled = true;

                setTimeout(() => {
                    try {
                        const user = CivitasStore.register(u, p);
                        setAuthAlert('');
                        showToast(`Registrasi berhasil! Akun dan Kunci RSA 128-bit dibuat untuk ${user.username}.`);
                        applyUserSession();
                        renderDirectoryTable();
                    } catch (err) {
                        setAuthAlert(err.message || 'Pendaftaran gagal.');
                    } finally {
                        if (keygenNotice) keygenNotice.style.display = 'none';
                        if (submitBtn) submitBtn.disabled = false;
                    }
                }, 40);
            });
        }

        // Logout
        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                CivitasStore.logout();
                showToast('Anda telah keluar dari akun.');
                applyUserSession();
            });
        }

        // Periksa sesi saat halaman dimuat
        applyUserSession();
    }


    function initTabs() {
        const tabButtons = document.querySelectorAll('.nav-tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-tab');
                tabButtons.forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

                btn.classList.add('active');
                const targetPane = document.getElementById(targetId);
                if (targetPane) targetPane.classList.add('active');

                if (targetId === 'tab-auditor') renderAuditorPanel();
                if (targetId === 'tab-directory') renderDirectoryTable();
            });
        });

        // Math Inspector Sub-tabs
        const mathSubButtons = document.querySelectorAll('.math-subnav-btn');
        mathSubButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-math');
                mathSubButtons.forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.math-pane').forEach(p => p.classList.remove('active'));

                btn.classList.add('active');
                const targetPane = document.getElementById(targetId);
                if (targetPane) targetPane.classList.add('active');
            });
        });
    }

    // =========================================================================
    // WHISTLEBLOWER PORTAL (SUBMIT REPORT)
    // =========================================================================
    function initSenderDropdown() {
        const select = document.getElementById('senderSelect');
        const members = CivitasStore.getMembers();
        select.innerHTML = '';

        members.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = `${m.alias} - ${m.role} (${m.unit})`;
            select.appendChild(opt);
        });

        if (members.length > 0) {
            selectedSender = members[0];
            updateSenderKeyInput();
        }

        select.addEventListener('change', () => {
            const memberId = select.value;
            selectedSender = members.find(m => m.id === memberId) || members[0];
            updateSenderKeyInput();
            triggerLivePipelineUpdate();
        });

        // Toggle Key Visibility
        const btnToggle = document.getElementById('btnToggleKeyVisibility');
        const keyInput = document.getElementById('senderPrivateKeyInput');
        btnToggle.addEventListener('click', () => {
            isKeyVisible = !isKeyVisible;
            keyInput.type = isKeyVisible ? 'text' : 'password';
            btnToggle.textContent = isKeyVisible ? '🙈 Sembunyikan' : '👁️ Tampilkan';
        });
    }

    function updateSenderKeyInput() {
        const keyInput = document.getElementById('senderPrivateKeyInput');
        const pseudoHighlight = document.getElementById('senderPseudonymHighlight');
        if (selectedSender) {
            if (keyInput) keyInput.value = selectedSender.privateKey.d;
            if (pseudoHighlight) pseudoHighlight.textContent = selectedSender.pseudonymCode;
        }
    }

    function initQuickPresets() {
        const presets = {
            lab: {
                title: "Dugaan Manipulasi Pengadaan Alat Lab Komputer Semester Ini",
                category: "Korupsi & Pungli",
                content: "Terdapat ketidaksesuaian spesifikasi komputer lab yang datang dibandingkan RAB pengadaan resmi fakultas. Pembayaran invoice tercatat untuk tipe Core i7, namun unit terpasang adalah Core i3 rekondisi tanpa segel resmi. Kami menyimpan salinan dokumen serah terima barang untuk audit forensik."
            },
            exam: {
                title: "Praktik Sindikat Joki Ujian Akhir dan Pembocoran Kunci Jawaban",
                category: "Kecurangan Akademik",
                content: "Teridentifikasi sindikat berbayar yang menawarkan pengerjaan ujian akhir daring dan joki tugas besar di beberapa mata kuliah dasar bersama. Terdapat bukti tangkapan layar transaksi pembayaran e-wallet dan link grup chat rahasia tempat pembagian kunci jawaban."
            },
            facility: {
                title: "Usulan Perbaikan Jalur Evakuasi dan Fasilitas Disabilitas Gedung Kuliah",
                category: "Saran & Masukan",
                content: "Sebagian besar jalur akses kursi roda di Gedung Perkuliahan Bersama terhalang oleh parkir motor liar dan tangga darurat lantai 3 terkunci selama jam kuliah aktif. Mohon inspeksi sarana keselamatan gedung dan pembersihan aksesibilitas bagi civitas disabilitas."
            }
        };

        const presetBtns = document.querySelectorAll('.preset-btn');
        presetBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.getAttribute('data-preset');
                const data = presets[key];
                if (!data) return;

                document.getElementById('reportTitle').value = data.title;
                document.getElementById('reportCategory').value = data.category;
                document.getElementById('reportContent').value = data.content;

                triggerLivePipelineUpdate();
                showToast(`Contoh aduan "${data.title.slice(0, 28)}..." dimuat!`);
            });
        });
    }

    function initGuideModal() {
        const modal = document.getElementById('guideModal');
        const btnOpen = document.getElementById('btnOpenGuideModal');
        const btnClose = document.getElementById('btnCloseGuideModal');
        const btnGotIt = document.getElementById('btnGotItGuide');

        if (!modal) return;

        btnOpen?.addEventListener('click', () => modal.classList.add('open'));
        btnClose?.addEventListener('click', () => modal.classList.remove('open'));
        btnGotIt?.addEventListener('click', () => modal.classList.remove('open'));

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('open');
        });
    }

    function initQuickReset() {
        const btn = document.getElementById('btnQuickReset');
        if (!btn) return;

        btn.addEventListener('click', () => {
            if (!confirm('Kembalikan semua data simulasi ke setelan awal pabrik (reset data)?')) return;
            CivitasStore.resetToDefault();
            decryptedReportsMap = {};
            showToast('Data simulasi berhasil dikembalikan ke bawaan!');
            initSenderDropdown();
            renderAuditorPanel();
            renderDirectoryTable();
            updateHeaderBadges();
        });
    }

    function initLivePipeline() {
        const contentTextarea = document.getElementById('reportContent');
        const titleInput = document.getElementById('reportTitle');

        contentTextarea.addEventListener('input', triggerLivePipelineUpdate);
        titleInput.addEventListener('input', triggerLivePipelineUpdate);

        // Initial trigger
        triggerLivePipelineUpdate();

        // Submit Button Event
        const btnSubmit = document.getElementById('btnSubmitReport');
        btnSubmit.addEventListener('click', handleReportSubmission);
    }

    function triggerLivePipelineUpdate() {
        if (!selectedSender) return;
        const text = document.getElementById('reportContent').value.trim();
        const hashPreview = document.getElementById('liveHashPreview');
        const sigPreview = document.getElementById('liveSigPreview');
        const cipherPreview = document.getElementById('liveCipherPreview');
        const pseudonymPreview = document.getElementById('livePseudonymPreview');
        const auditorSummary = document.getElementById('submitAuditorKeySummary');

        const cipherTraceEl = document.getElementById('liveCipherTracePreview');

        if (!text) {
            hashPreview.textContent = 'Silakan tulis isi narasi laporan...';
            sigPreview.textContent = '-';
            cipherPreview.textContent = '-';
            if (cipherTraceEl) cipherTraceEl.innerHTML = '';
            return;
        }

        try {
            // 1. Live Hash (Manual SHA-256)
            const hashHex = ManualSHA256.hash(text);
            hashPreview.textContent = `SHA-256: ${hashHex}`;

            // 2. Live Signature (RSA)
            const sig = ManualRSA.signMessage(text, selectedSender.privateKey);
            sigPreview.textContent = `S (Hex): ${sig.signatureHex.slice(0, 36)}... (${sig.signatureHex.length} hex digits)`;

            // 3. Live Cipher Preview
            const auditor = CivitasStore.getAuditor();
            const enc = ManualRSA.encryptText(text, auditor.publicKey);
            cipherPreview.textContent = `Total ${enc.totalBlocks} RSA blok terenkripsi (Blok 1: 0x${enc.cipherBlocks[0].cHex.slice(0, 24)}...)`;

            if (cipherTraceEl && enc.mathTrace && enc.mathTrace[0]) {
                const tr = enc.mathTrace[0];
                cipherTraceEl.innerHTML = `
                    <div style="padding:0.45rem 0.6rem; background:rgba(0,0,0,0.02); border-radius:4px; border-left:3px solid var(--primary); margin-top:0.35rem;">
                        <strong>Rumus Enkripsi RSA:</strong> <code>c = (m^e) mod n</code><br>
                        <strong>Sampel Blok 1:</strong> m = <code>${tr.m.slice(0, 16)}...</code> &rarr; c = <code>0x${tr.cHex.slice(0, 16)}...</code>
                    </div>
                `;
            }

            // 4. Pseudonym Tag
            pseudonymPreview.textContent = selectedSender.pseudonymCode;

            // Auditor Summary Box
            auditorSummary.innerHTML = `
                Modulus n: ${auditor.publicKey.n} (${auditor.publicKey.bitLength}-bit)<br>
                Eksponen e: ${auditor.publicKey.e}
            `;
        } catch (e) {
            console.error("Live pipeline error:", e);
        }
    }

    function handleReportSubmission() {
        const title = document.getElementById('reportTitle').value.trim();
        const category = document.getElementById('reportCategory').value;
        const content = document.getElementById('reportContent').value.trim();

        if (!title || !content) {
            showToast('Judul dan isi laporan wajib diisi!', 'error');
            return;
        }

        if (!selectedSender) {
            showToast('Pilih identitas pengirim terlebih dahulu!', 'error');
            return;
        }

        try {
            const auditor = CivitasStore.getAuditor();

            // 1. Tanda tangani teks laporan menggunakan Kunci Privat Pengirim
            const signatureResult = ManualRSA.signMessage(content, selectedSender.privateKey);

            // 2. Enkripsi teks laporan menggunakan Kunci Publik Auditor
            const encryptResult = ManualRSA.encryptText(content, auditor.publicKey);

            // 3. Buat payload laporan
            const newReport = {
                id: `RPT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                title: title,
                category: category,
                pseudonymCode: selectedSender.pseudonymCode,
                senderPublicKey: selectedSender.publicKey,
                signatureHex: signatureResult.signatureHex,
                hashHex: signatureResult.hashHex,
                cipherBlocks: encryptResult.cipherBlocks,
                blockSize: encryptResult.blockSize,
                submittedAt: new Date().toISOString(),
                status: "Menunggu Tinjauan",
                statusNote: "Laporan baru diterima. Terenkripsi dengan Kunci Publik Auditor.",
                auditorFeedback: null
            };

            // Simpan laporan ke penyimpanan
            CivitasStore.submitReport(newReport);

            showToast(`Laporan aman berhasil dikirim dengan ID: ${newReport.id}!`);
            updateHeaderBadges();

            // Reset form
            document.getElementById('reportTitle').value = '';
            document.getElementById('reportContent').value = '';
            triggerLivePipelineUpdate();

            // Pindah ke tab auditor jika admin; jika civitas, tetap di form dengan konfirmasi
            const curUser = CivitasStore.getCurrentUser();
            if (curUser && curUser.role === 'admin') {
                setTimeout(() => {
                    const navAuditor = document.getElementById('navTabAuditor');
                    if (navAuditor) navAuditor.click();
                }, 1000);
            }

        } catch (err) {
            console.error("Gagal mengirim laporan:", err);
            showToast(`Gagal mengirim laporan: ${err.message}`, 'error');
        }
    }

    // =========================================================================
    // AUDITOR PANEL
    // =========================================================================
    function renderAuditorPanel() {
        const auditor = CivitasStore.getAuditor();
        const reports = CivitasStore.getReports();
        const container = document.getElementById('reportsListContainer');

        // Update Auditor Info Box
        document.getElementById('auditorPanelName').textContent = auditor.name;
        document.getElementById('auditorPanelKeyInfo').textContent = 
            `Modulus n (${auditor.publicKey.bitLength}-bit): ${auditor.publicKey.n.slice(0, 20)}... | Eksponen Publik e: ${auditor.publicKey.e}`;

        if (!reports || reports.length === 0) {
            container.innerHTML = `
                <div class="glass-card" style="text-align:center; padding:3rem 1rem;">
                    <div style="font-size:2.5rem; margin-bottom:0.75rem;">📭</div>
                    <h3 style="color:var(--primary-dark);">Belum Ada Laporan Masuk</h3>
                    <p style="color:var(--text-muted); font-size:0.9rem; margin-top:0.25rem;">
                        Semua laporan whistleblower terenkripsi akan muncul di sini.
                    </p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';

        reports.forEach(rpt => {
            const isDecrypted = Boolean(decryptedReportsMap[rpt.id] || rpt.decryptedData);
            const decryptedData = decryptedReportsMap[rpt.id] || rpt.decryptedData || null;

            // Cek apakah public key pengirim terdaftar di Whitelist Civitas
            const matchedMember = CivitasStore.findMemberByPublicKey(rpt.senderPublicKey);
            const isRegisteredCivitas = Boolean(matchedMember);

            const card = document.createElement('div');
            card.className = `report-card ${isRegisteredCivitas ? 'verified-official' : ''}`;
            card.id = `report-card-${rpt.id}`;

            // Bangun Ciphertext preview string
            const cipherPreviewStr = rpt.cipherBlocks.map(b => '0x' + b.cHex).join(' ');

            const isVerified = rpt.status === 'Terverifikasi & Didekripsi' || isDecrypted;
            const statusBadgeClass = isVerified ? 'tag-emerald' : (rpt.status === 'Ditolak' ? 'tag-rose' : 'tag-purple');
            const statusLabel = isVerified ? '✅ Terverifikasi & Didekripsi' : `⏳ ${rpt.status}`;

            card.innerHTML = `
                <div class="report-card-top">
                    <div>
                        <div class="report-meta">
                            <span class="pseudonym-tag">👤 ${rpt.pseudonymCode}</span>
                            <span class="badge-tag ${isRegisteredCivitas ? 'tag-emerald' : 'tag-rose'}">${isRegisteredCivitas ? 'Whitelisted' : 'Kunci Tak Terdaftar'}</span>
                            <span style="font-size:0.78rem; color:var(--text-dim);">${new Date(rpt.submittedAt).toLocaleString('id-ID')}</span>
                        </div>
                        <h3 style="color:var(--text-main, #111827); font-size:1.15rem; margin-top:0.5rem; font-weight:700;">${escapeHtml(rpt.title)}</h3>
                        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.2rem;">
                            Kategori: <strong>${escapeHtml(rpt.category)}</strong> &bull; ID: <code>${rpt.id}</code>
                        </div>
                    </div>
                    <div>
                        <span class="badge-tag ${statusBadgeClass}">${statusLabel}</span>
                    </div>
                </div>

                <!-- Tampilan Terenkripsi vs Terdekripsi -->
                <div id="content-container-${rpt.id}">
                    ${isDecrypted ? renderDecryptedView(rpt, decryptedData) : renderEncryptedView(rpt, cipherPreviewStr)}
                </div>

                <!-- Formulir Tindak Lanjut Auditor -->
                <div style="margin-top:1.25rem; padding-top:1rem; border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem;">
                    <div style="font-size:0.82rem; color:var(--text-muted);">
                        Status: ${escapeHtml(rpt.statusNote || 'Laporan masuk')}
                    </div>
                    <div style="display:flex; gap:0.5rem;">
                        <button class="btn btn-secondary btn-sm" onclick="promptUpdateStatus('${rpt.id}')">
                            Ubah Status
                        </button>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });
    }

    function renderEncryptedView(rpt, cipherPreviewStr) {
        return `
            <div style="margin:0.85rem 0;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
                    <span style="font-size:0.8rem; font-weight:700; color:var(--text-muted);">
                        Ciphertext (${rpt.cipherBlocks.length} Blok RSA):
                    </span>
                </div>
                <div class="cipher-preview-box">
                    ${cipherPreviewStr}
                </div>
            </div>

            <div style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; margin-top:0.75rem;">
                <button class="btn btn-emerald btn-sm" onclick="decryptReportAction('${rpt.id}')">
                    Buka &amp; Dekripsi Laporan
                </button>
                <div style="font-size:0.78rem; font-family:var(--font-mono); color:var(--text-dim);">
                    Signature: ${rpt.signatureHex.slice(0, 16)}...
                </div>
            </div>
        `;
    }

    function renderDecryptedView(rpt, dec) {
        const matchedMember = CivitasStore.findMemberByPublicKey(rpt.senderPublicKey);
        const traces = (dec.mathTrace && dec.mathTrace.length > 0) ? dec.mathTrace : (function() {
            try {
                const aud = CivitasStore.getAuditor();
                const sampleRes = ManualRSA.decryptText(rpt.cipherBlocks.slice(0, 2), aud.privateKey);
                return sampleRes.mathTrace || [];
            } catch(e) { return []; }
        })();

        return `
            <div class="decrypted-box">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                    <strong style="font-size:0.88rem; color:var(--primary-dark);">Isi Laporan (Plaintext):</strong>
                    <span class="badge-tag tag-emerald" style="font-size:0.72rem;">Terdekripsi</span>
                </div>

                <div class="plaintext-result-card">
${escapeHtml(dec.plaintext)}
                </div>

                <div style="margin-top:0.6rem; padding:0.5rem 0.75rem; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-sm); font-size:0.8rem; color:var(--text-muted); display:flex; justify-content:space-between; flex-wrap:wrap; gap:0.5rem;">
                    <span>Tanda Tangan Digital: <strong style="color:var(--primary);">${dec.isValid ? 'Valid (Hash Sesuai)' : 'Tidak Valid'}</strong></span>
                    <span>Pengirim: <strong>${matchedMember ? 'Civitas Whitelist' : 'Pengirim Luar'}</strong> &bull; Pseudonim: <code>${escapeHtml(rpt.pseudonymCode)}</code></span>
                </div>

                <!-- Collapsible Detail Matematika Dekripsi RSA -->
                <details class="tech-collapse-box" style="margin-top:0.75rem;">
                    <summary class="tech-collapse-summary">
                        <span>📐 Bukti Tahapan Dekripsi RSA (m = c^d mod n)</span>
                        <span class="toggle-link">Lihat Rincian Matematis</span>
                    </summary>
                    <div class="tech-collapse-content" style="padding:0.75rem; font-size:0.8rem; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-sm); margin-top:0.5rem; line-height:1.6;">
                        <div style="margin-bottom:0.4rem; font-family:var(--font-mono); color:var(--text-muted);">
                            <strong>Formula Dekripsi:</strong> <code>m = (c^d) mod n</code> &bull; Total Blok: <strong>${rpt.cipherBlocks ? rpt.cipherBlocks.length : 0} blok RSA</strong>
                        </div>
                        ${traces.map(t => `
                            <div style="padding:0.4rem 0.6rem; margin-bottom:0.4rem; background:#ffffff; border:1px solid var(--border-color); border-radius:4px; font-family:var(--font-mono);">
                                <div style="color:var(--text-muted); font-size:0.75rem;">Blok ${t.chunkIndex}:</div>
                                <div>c = <code>0x${t.cHex.slice(0, 20)}...</code></div>
                                <div>m = c<sup>d</sup> mod n = <code>${t.m.slice(0, 16)}...</code></div>
                                <div style="color:var(--primary); font-weight:600;">Teks Terpulihkan: "${escapeHtml(t.recoveredText)}"</div>
                            </div>
                        `).join('')}
                        <div style="margin-top:0.5rem; font-size:0.78rem; color:var(--text-dim); font-family:var(--font-mono);">
                            Verifikasi Tanda Tangan: <code>V = (S^e) mod n = ${dec.verifiedV ? dec.verifiedV.slice(0, 20) + '...' : '-'}</code> (${dec.isValid ? 'Cocok dengan Hash Dokumen' : 'Tidak Cocok'})
                        </div>
                    </div>
                </details>

                ${rpt.auditorFeedback ? `
                    <div style="margin-top: 0.75rem; padding: 0.75rem; background: var(--primary-soft); border-left: 3px solid var(--primary); border-radius: 4px; font-size: 0.85rem; color: var(--text-main);">
                        <strong>Tanggapan Auditor:</strong> ${escapeHtml(rpt.auditorFeedback)}
                    </div>
                ` : ''}
            </div>
        `;
    }

    // Aksi Dekripsi Laporan
    window.decryptReportAction = function (reportId) {
        const reports = CivitasStore.getReports();
        const rpt = reports.find(r => r.id === reportId);
        if (!rpt) return;

        const auditor = CivitasStore.getAuditor();

        try {
            // 1. Jalankan dekripsi RSA blok per blok
            const decResult = ManualRSA.decryptText(rpt.cipherBlocks, auditor.privateKey);

            // 2. Verifikasi Digital Signature
            const sigCheck = ManualRSA.verifySignature(decResult.plaintext, rpt.signatureHex, rpt.senderPublicKey);

            // Simpan status dekripsi di memori
            const decData = {
                plaintext: decResult.plaintext,
                currentHashHex: sigCheck.currentHashHex,
                verifiedV: sigCheck.verifiedV,
                isValid: sigCheck.isValid,
                mathTrace: decResult.mathTrace || []
            };
            decryptedReportsMap[reportId] = decData;

            // Update status laporan di Store!
            const newStatus = sigCheck.isValid ? "Terverifikasi & Didekripsi" : "Verifikasi Gagal";
            const note = sigCheck.isValid
                ? "Tanda tangan kriptografis RSA valid (Pengirim sah). Laporan telah didekripsi utuh."
                : "Peringatan: Tanda tangan kriptografis tidak cocok!";

            CivitasStore.updateReportStatus(reportId, newStatus, null, note, decData);

            showToast(`Laporan ${reportId} berhasil didekripsi & status diperbarui!`);
            renderAuditorPanel();
            updateHeaderBadges();

        } catch (e) {
            console.error("Gagal mendekripsi laporan:", e);
            showToast(`Gagal mendekripsi: ${e.message}`, 'error');
        }
    };

    // Aksi Ubah Status Investigasi
    window.promptUpdateStatus = function (reportId) {
        const currentRpt = CivitasStore.getReports().find(r => r.id === reportId);
        if (!currentRpt) return;

        const newStatus = prompt("Masukkan status investigasi baru:\n(Pilihan: Menunggu Tinjauan / Dalam Investigasi / Terbukti & Ditindaklanjuti / Ditolak)", currentRpt.status);
        if (!newStatus) return;

        const feedback = prompt("Masukkan catatan tindak lanjut / respon auditor untuk pengadu:", currentRpt.auditorFeedback || "Laporan sedang ditindaklanjuti secara rahasia oleh tim auditor.");

        CivitasStore.updateReportStatus(reportId, newStatus, feedback);
        showToast(`Status laporan ${reportId} berhasil diperbarui!`);
        renderAuditorPanel();
    };

    // Tombol Refresh Laporan
    document.getElementById('btnRefreshReports').addEventListener('click', () => {
        renderAuditorPanel();
        showToast('Daftar laporan dimuat ulang.');
    });

    // =========================================================================
    // CIVITAS DIRECTORY & WHITELIST REGISTRY
    // =========================================================================
    function renderDirectoryTable() {
        const members = CivitasStore.getMembers();
        const tbody = document.getElementById('membersTableBody');
        tbody.innerHTML = '';

        members.forEach(m => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${escapeHtml(m.id)}</strong></td>
                <td>
                    <div style="font-weight:800; color:#000000 !important; font-size:0.95rem;">${escapeHtml(m.alias)}</div>
                    <div style="font-size:0.78rem; color:#5c5a54 !important;">${escapeHtml(m.role)} &bull; ${escapeHtml(m.unit)}</div>
                </td>
                <td><span class="pseudonym-tag">${escapeHtml(m.pseudonymCode)}</span></td>
                <td>
                    <div class="code-box inline-mono" style="max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                        e: ${m.publicKey.e}, n: ${m.publicKey.n}
                    </div>
                </td>
                <td>${escapeHtml(m.registeredAt)}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="useMemberToSubmit('${m.id}')">
                        Pilih Sebagai Pelapor
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.useMemberToSubmit = function (memberId) {
        const members = CivitasStore.getMembers();
        selectedSender = members.find(m => m.id === memberId) || selectedSender;
        const select = document.getElementById('senderSelect');
        if (select) select.value = memberId;
        updateSenderKeyInput();
        triggerLivePipelineUpdate();

        document.getElementById('navTabSubmit').click();
        showToast(`Identitas pengirim disetel ke: ${selectedSender.alias}`);
    };

    // Modal Pendaftaran Civitas Baru
    const memberModal = document.getElementById('newMemberModal');
    const btnOpenMemberModal = document.getElementById('btnOpenNewMemberModal');
    const btnCloseMemberModal = document.getElementById('btnCloseMemberModal');
    const btnGenerateSave = document.getElementById('btnGenerateSaveMember');

    btnOpenMemberModal.addEventListener('click', () => {
        memberModal.classList.add('open');
    });

    btnCloseMemberModal.addEventListener('click', () => {
        memberModal.classList.remove('open');
    });

    memberModal.addEventListener('click', (e) => {
        if (e.target === memberModal) {
            memberModal.classList.remove('open');
        }
    });

    btnGenerateSave.addEventListener('click', () => {
        const alias = document.getElementById('newMemberAlias').value.trim();
        const role = document.getElementById('newMemberRole').value;
        const unit = document.getElementById('newMemberUnit').value.trim();
        const bits = parseInt(document.getElementById('newMemberBits').value, 10);
        const progress = document.getElementById('keygenProgress');

        if (!alias || !unit) {
            showToast('Lengkapi semua data formulir civitas!', 'error');
            return;
        }

        progress.style.display = 'block';
        btnGenerateSave.disabled = true;
        btnGenerateSave.innerHTML = `
            <span class="dot-pulse" style="margin-right:8px;"></span>
            Sedang Menghitung Kunci RSA (${bits}-bit)...
        `;

        setTimeout(() => {
            try {
                // Generate Keypair RSA Manual murni
                const keypair = ManualRSA.generateKeyPair(bits);

                // Buat kode pseudonim unik
                const randomHex = Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase().padStart(6, '0');
                const pseudonymCode = `CIVITAS-ANON-${randomHex}`;

                const newMember = {
                    id: `MEM-${Math.floor(10000 + Math.random() * 90000)}`,
                    alias: alias,
                    role: role,
                    unit: unit,
                    registeredAt: new Date().toISOString().split('T')[0],
                    publicKey: keypair.publicKey,
                    privateKey: keypair.privateKey,
                    pseudonymCode: pseudonymCode
                };

                CivitasStore.addMember(newMember);

                progress.style.display = 'none';
                btnGenerateSave.disabled = false;
                btnGenerateSave.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Bangkitkan Kunci RSA &amp; Simpan ke Whitelist
                `;

                // Reset field form
                document.getElementById('newMemberAlias').value = 'Civitas #MHS-' + Math.floor(100000 + Math.random() * 900000);
                document.getElementById('newMemberUnit').value = '';

                memberModal.classList.remove('open');

                showToast(`Civitas ${alias} berhasil didaftarkan dengan Kunci RSA ${bits}-bit!`);
                initSenderDropdown();
                renderDirectoryTable();
                updateHeaderBadges();

            } catch (err) {
                progress.style.display = 'none';
                btnGenerateSave.disabled = false;
                btnGenerateSave.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Bangkitkan Kunci RSA &amp; Simpan ke Whitelist
                `;
                showToast(`Gagal membangkitkan kunci: ${err.message}`, 'error');
            }
        }, 50);
    });

    // =========================================================================
    // AUDITOR KEY MANAGEMENT MODAL
    // =========================================================================
    const auditorModal = document.getElementById('auditorKeyModal');
    const btnOpenAuditorModal = document.getElementById('btnShowAuditorKeyModal');
    const btnCloseAuditorModal = document.getElementById('btnCloseAuditorModal');
    const btnRegenAuditor = document.getElementById('btnRegenerateAuditorKeys');
    const btnResetAll = document.getElementById('btnResetAllData');

    btnOpenAuditorModal.addEventListener('click', () => {
        const aud = CivitasStore.getAuditor();
        document.getElementById('modalAuditorPublicKey').textContent = 
            `Eksponen e: ${aud.publicKey.e}\nModulus n: ${aud.publicKey.n} (${aud.publicKey.bitLength}-bit)`;
        document.getElementById('modalAuditorPrivateKey').textContent = 
            `Eksponen Privat d: ${aud.privateKey.d}`;

        const mathEl = document.getElementById('modalAuditorMathDetails');
        if (mathEl) {
            const m = aud.mathDetails || {};
            mathEl.innerHTML = `
                <div><strong>1. Bilangan Prima p (rahasia):</strong> <code>${m.p || '-'}</code></div>
                <div><strong>2. Bilangan Prima q (rahasia):</strong> <code>${m.q || '-'}</code></div>
                <div><strong>3. Modulus n = p &times; q (publik):</strong> <code>${m.n || aud.publicKey.n}</code> (${aud.publicKey.bitLength}-bit)</div>
                <div><strong>4. Euler's Totient &phi;(n) = (p - 1)(q - 1) (rahasia):</strong> <code>${m.phi || '-'}</code></div>
                <div><strong>5. Eksponen Publik e (publik):</strong> <code>${aud.publicKey.e}</code> (memenuhi gcd(e, &phi;) = 1)</div>
                <div><strong>6. Eksponen Privat d = e<sup>-1</sup> mod &phi; (rahasia):</strong> <code>${aud.privateKey.d}</code></div>
                <div style="margin-top:0.4rem; color:var(--primary); font-weight:700;">&bull; Verifikasi: (e &times; d) mod &phi;(n) = 1 (Terbukti Valid!)</div>
            `;
        }
        auditorModal.classList.add('open');
    });

    btnCloseAuditorModal.addEventListener('click', () => {
        auditorModal.classList.remove('open');
    });

    auditorModal.addEventListener('click', (e) => {
        if (e.target === auditorModal) {
            auditorModal.classList.remove('open');
        }
    });

    btnRegenAuditor.addEventListener('click', () => {
        if (!confirm('Apakah Anda yakin ingin membangkitkan ulang Kunci RSA Auditor? Laporan lama yang terenkripsi dengan kunci lama tidak akan bisa didekripsi.')) return;

        try {
            const keypair = ManualRSA.generateKeyPair(128);
            const updated = {
                name: "Komite Etik & Satgas Investigasi Independen",
                publicKey: keypair.publicKey,
                privateKey: keypair.privateKey,
                mathDetails: keypair.mathDetails
            };
            CivitasStore.setAuditorKeys(updated);
            showToast('Kunci RSA Auditor berhasil diperbarui!');
            auditorModal.classList.remove('open');
            renderAuditorPanel();
            triggerLivePipelineUpdate();
        } catch (e) {
            showToast(`Gagal: ${e.message}`, 'error');
        }
    });

    btnResetAll.addEventListener('click', () => {
        if (!confirm('Kembalikan semua data ke setelan awal pabrik (reset localStorage)?')) return;
        CivitasStore.resetToDefault();
        decryptedReportsMap = {};
        showToast('Database berhasil direset ke bawaan!');
        auditorModal.classList.remove('open');
        initSenderDropdown();
        renderAuditorPanel();
        renderDirectoryTable();
        updateHeaderBadges();
    });

    // =========================================================================
    // RSA LABORATORY & MATH INSPECTOR
    // =========================================================================
    function initLabComponents() {
        const btnRunPrime = document.getElementById('btnRunPrimeTest');
        if (!btnRunPrime) return;
        btnRunPrime.addEventListener('click', () => {
            const bits = parseInt(document.getElementById('primeBitSelect').value, 10);
            const rounds = parseInt(document.getElementById('primeRoundsInput').value, 10);
            const decBox = document.getElementById('primeResultDecimal');
            const bitsBox = document.getElementById('primeResultBits');
            const statusBox = document.getElementById('primeResultStatus');

            decBox.textContent = 'Mencari kandidat bilangan prima acak & menguji...';

            setTimeout(() => {
                try {
                    const prime = ManualRSA.generatePrime(bits, rounds);
                    decBox.textContent = prime.toString();
                    bitsBox.textContent = `Biner: ${prime.toString(2)}\nPanjang: ${prime.toString(2).length} bit`;
                    statusBox.innerHTML = `
                        <span style="color:#059669;">✅ Lolos ${rounds} Putaran Uji Miller-Rabin (Probabilitas Prima: > 99.999999%)</span>
                    `;
                    showToast('Bilangan prima berhasil dibangkitkan!');
                } catch (e) {
                    decBox.textContent = `Error: ${e.message}`;
                    statusBox.textContent = 'Gagal menemukan bilangan prima.';
                }
            }, 50);
        });

        // 2. RSA Keygen Trace Runner
        const btnKeygenTrace = document.getElementById('btnRunKeygenTrace');
        btnKeygenTrace.addEventListener('click', () => {
            const bits = parseInt(document.getElementById('keygenBitSelect').value, 10);
            try {
                const kp = ManualRSA.generateKeyPair(bits);
                const m = kp.mathDetails;

                document.getElementById('traceP').textContent = m.p;
                document.getElementById('traceQ').textContent = m.q;
                document.getElementById('traceN').textContent = `${m.n} (${m.actualBits}-bit)`;
                document.getElementById('tracePhi').textContent = m.phi;
                document.getElementById('traceE').textContent = m.e;
                document.getElementById('traceD').textContent = m.d;

                // Render Euclidean steps table
                const tbody = document.getElementById('euclideanTraceBody');
                tbody.innerHTML = '';

                if (m.euclideanSampleSteps && m.euclideanSampleSteps.length > 0) {
                    m.euclideanSampleSteps.forEach((s, idx) => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>Step ${idx + 1}</td>
                            <td><code>${s.old_r}</code></td>
                            <td><code>${s.r}</code></td>
                            <td><code>${s.q}</code></td>
                            <td><code>${s.rem}</code></td>
                        `;
                        tbody.appendChild(tr);
                    });
                }

                showToast(`Trace Keygen RSA ${bits}-bit selesai!`);
            } catch (e) {
                showToast(`Error: ${e.message}`, 'error');
            }
        });

        // 3. ModPow Visualizer
        const btnRunModpow = document.getElementById('btnRunModpowTrace');
        btnRunModpow.addEventListener('click', () => {
            try {
                const base = BigInt(document.getElementById('modpowBase').value);
                const exp = BigInt(document.getElementById('modpowExp').value);
                const mod = BigInt(document.getElementById('modpowMod').value);

                const trace = ManualRSA.modPowWithTrace(base, exp, mod, 30);
                const resultDisplay = document.getElementById('modpowFinalResult');
                resultDisplay.textContent = `Hasil Akhir: ${trace.result.toString()}`;

                const tbody = document.getElementById('modpowTableBody');
                tbody.innerHTML = '';

                trace.steps.forEach(s => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${s.stepIndex}</td>
                        <td><span class="code-box inline-mono">${s.bit}</span></td>
                        <td>${s.action}</td>
                        <td><code>${s.currentResult}</code></td>
                    `;
                    tbody.appendChild(tr);
                });

                showToast('Trace Square-and-Multiply selesai!');
            } catch (e) {
                showToast(`Input tidak valid: ${e.message}`, 'error');
            }
        });

        // 4. Tampering & Anti-Fraud Testbench
        let currentTamperSig = null;
        let currentSignerMember = currentMembers[0];

        const btnGenTamperSig = document.getElementById('btnGenerateTamperSignature');
        const btnTestTamper = document.getElementById('btnTestVerificationTamper');

        btnGenTamperSig.addEventListener('click', () => {
            const text = document.getElementById('tamperOriginalText').value;
            if (!text) return;

            try {
                const sigResult = ManualRSA.signMessage(text, currentSignerMember.privateKey);
                currentTamperSig = sigResult.signatureHex;
                document.getElementById('tamperSignatureHex').textContent = currentTamperSig;
                document.getElementById('tamperManipulatedText').value = text;
                showToast('Tanda tangan digital RSA berhasil dibangkitkan untuk dokumen asli!');
            } catch (e) {
                showToast(`Error: ${e.message}`, 'error');
            }
        });

        btnTestTamper.addEventListener('click', () => {
            if (!currentTamperSig) {
                showToast('Tandatangani dokumen asli terlebih dahulu!', 'error');
                return;
            }

            const manipulatedText = document.getElementById('tamperManipulatedText').value;
            const resCallout = document.getElementById('tamperResultCallout');
            const resTitle = document.getElementById('tamperResultTitle');
            const resDesc = document.getElementById('tamperResultDesc');

            try {
                const verification = ManualRSA.verifySignature(manipulatedText, currentTamperSig, currentSignerMember.publicKey);

                if (verification.isValid) {
                    resCallout.style.borderColor = 'rgba(16,185,129,0.5)';
                    resCallout.style.background = 'rgba(16,185,129,0.08)';
                    resTitle.innerHTML = `<span style="color:#059669;">✅ TANDA TANGAN VALID - DOKUMEN ASLI & TIDAK BERUBAH</span>`;
                    resDesc.innerHTML = `
                        Nilai rekonstruksi V = (S^e mod n) (${verification.verifiedV}) sama persis dengan hash teks H(M') (${verification.expectedH}).<br>
                        Integritas data terbukti utuh!
                    `;
                } else {
                    resCallout.style.borderColor = 'rgba(244,63,94,0.5)';
                    resCallout.style.background = 'rgba(244,63,94,0.1)';
                    resTitle.innerHTML = `<span style="color:#f43f5e;">❌ VERIFIKASI GAGAL! TERDETEKSI PEMALSUAN DOKUMEN / TAMPERING</span>`;
                    resDesc.innerHTML = `
                        Nilai rekonstruksi V = (S^e mod n) (${verification.verifiedV}) <strong>TIDAK COCOK</strong> dengan hash teks yang telah diubah (${verification.expectedH}).<br>
                        Sistem menolak laporan karena isi dokumen telah dimanipulasi setelah ditandatangani!
                    `;
                }
            } catch (e) {
                showToast(`Error verifikasi: ${e.message}`, 'error');
            }
        });
    }

    // Helper Escape HTML
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});
