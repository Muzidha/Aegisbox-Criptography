/**
 * Storage & Organisasi Registry (Store & Public Key Directory)
 * Menyimpan data civitas organisasi terdaftar, kunci publik/privat, dan kotak masuk laporan whistleblower.
 * Menggunakan localStorage untuk persistensi data di browser.
 */

const CivitasStore = (function () {
    const STORAGE_KEY = 'aegisbox_whistleblower_data_v2';

    // Data Awal Bawaan (Default Seed Data)
    // Dibuat dengan pasangan kunci RSA valid sehingga aplikasi langsung bisa dicoba tanpa setup manual.
    const DEFAULT_DATA = {
        // Kunci RSA Tim Auditor / Komite Etik
        auditor: {
            name: "Komite Etik & Satgas Investigasi Independen",
            publicKey: {
                e: "65537",
                n: "277514338902506692290518387063702116347",
                bitLength: 128
            },
            privateKey: {
                d: "178550186178386470390629235889753232141",
                n: "277514338902506692290518387063702116347",
                bitLength: 128
            },
            mathDetails: {
                p: "16757656910606775983",
                q: "16560450530730419269",
                phi: "277514338902506688958707642929983911096",
                e: "65537",
                d: "178550186178386470390629235889753232141"
            }
        },

        // Direktori Civitas Sah (Daftar Kunci Publik Whitelist Organisasi)
        members: [
            {
                id: "MEM-MHS-202401",
                alias: "Civitas #MHS-202401",
                role: "Mahasiswa Aktif",
                unit: "Fakultas Ilmu Komputer",
                registeredAt: "2026-02-10",
                publicKey: {
                    e: "65537",
                    n: "244670228185684705306354415842817290197",
                    bitLength: 128
                },
                privateKey: {
                    d: "74071302834375003507850551579246142177",
                    n: "244670228185684705306354415842817290197",
                    bitLength: 128
                },
                pseudonymCode: "GHOST-CYBER-884"
            },
            {
                id: "MEM-DOS-10492",
                alias: "Civitas #DOS-10492",
                role: "Dosen / Pengajar",
                unit: "Departemen Sistem Informasi",
                registeredAt: "2026-01-15",
                publicKey: {
                    e: "65537",
                    n: "313437255140134444983056345638520336083",
                    bitLength: 128
                },
                privateKey: {
                    d: "128362624508492809623048995328459203649",
                    n: "313437255140134444983056345638520336083",
                    bitLength: 128
                },
                pseudonymCode: "SILENT-EAGLE-419"
            },
            {
                id: "MEM-STF-08821",
                alias: "Civitas #STF-08821",
                role: "Staf Administrasi & Keuangan",
                unit: "Biro Keuangan Pusat",
                registeredAt: "2026-03-01",
                publicKey: {
                    e: "65537",
                    n: "284164573887134882206637401202868971207",
                    bitLength: 128
                },
                privateKey: {
                    d: "196024345229272304918712028045763953473",
                    n: "284164573887134882206637401202868971207",
                    bitLength: 128
                },
                pseudonymCode: "SHADOW-HERO-103"
            }
        ],

        // Kotak Laporan Masuk (Whistleblower Reports Box)
        reports: []
    };

    /**
     * Memuat data dari localStorage atau inisialisasi awal
     */
    function loadData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                saveData(DEFAULT_DATA);
                // Buat contoh laporan pertama secara otomatis
                seedInitialReport();
                return JSON.parse(localStorage.getItem(STORAGE_KEY));
            }
            return JSON.parse(raw);
        } catch (e) {
            console.warn("Gagal memuat data dari localStorage, menggunakan data memori:", e);
            return DEFAULT_DATA;
        }
    }

    /**
     * Menyimpan data ke localStorage
     */
    function saveData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error("Gagal menyimpan ke localStorage:", e);
        }
    }

    /**
     * Membuat laporan contoh awal dengan enkripsi RSA dan Digital Signature yang valid
     */
    function seedInitialReport() {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(DEFAULT_DATA));
        if (data.reports && data.reports.length > 0) return;

        const sender = data.members[0]; // Civitas #MHS-202401
        const auditor = data.auditor;

        const plaintextBody = 
            "Laporan Dugaan Pungutan Liar & Manipulasi Nilai Ujian Semester Gasal.\n" +
            "Terjadi permintaan dana praktikum tidak resmi sebesar Rp 350.000 per mahasiswa tanpa kuitansi resmi institusi.\n" +
            "Bukti transaksi dan tangkapan layar percakapan telah kami amankan pada arsip internal.\n" +
            "Mohon perlindungan saksi dan audit forensik terhadap rekening penampung.";

        // 1. Tanda tangani plaintext menggunakan kunci privat pengirim
        const sigResult = ManualRSA.signMessage(plaintextBody, sender.privateKey);

        // 2. Enkripsi plaintext menggunakan kunci publik auditor
        const encResult = ManualRSA.encryptText(plaintextBody, auditor.publicKey);

        const sampleReport = {
            id: "RPT-2026-0091",
            title: "Dugaan Pungutan Liar Dana Praktikum Tanpa Kuitansi Resmi",
            category: "Korupsi & Pungli",
            pseudonymCode: sender.pseudonymCode,
            senderMemberId: sender.id, // Hanya disimpan internal hash, pseudonim yang tampil
            senderPublicKey: sender.publicKey,
            signatureHex: sigResult.signatureHex,
            hashHex: sigResult.hashHex,
            cipherBlocks: encResult.cipherBlocks,
            blockSize: encResult.blockSize,
            submittedAt: "2026-10-06T10:15:00.000Z",
            status: "Menunggu Tinjauan",
            statusNote: "Laporan baru diterima. Terenkripsi dengan Kunci Publik Auditor.",
            auditorFeedback: null
        };

        data.reports = [sampleReport];
        saveData(data);
    }

    /**
     * Dapatkan daftar seluruh anggota terdaftar
     */
    function getMembers() {
        const data = loadData();
        return data.members || [];
    }

    /**
     * Dapatkan data auditor (Kunci Publik & Kunci Privat)
     */
    function getAuditor() {
        const data = loadData();
        return data.auditor;
    }

    /**
     * Update data auditor (misal generate kunci baru)
     */
    function setAuditorKeys(newAuditor) {
        const data = loadData();
        data.auditor = newAuditor;
        saveData(data);
    }

    /**
     * Tambah civitas anggota baru ke direktori organisasi
     */
    function addMember(member) {
        const data = loadData();
        data.members.push(member);
        saveData(data);
        return member;
    }

    /**
     * Dapatkan semua laporan yang masuk
     */
    function getReports() {
        const data = loadData();
        return data.reports || [];
    }

    /**
     * Tambahkan laporan baru dari whistleblower
     */
    function submitReport(reportPayload) {
        const data = loadData();
        data.reports.unshift(reportPayload);
        saveData(data);
        return reportPayload;
    }

    /**
     * Perbarui status atau tanggapan auditor pada laporan
     */
    function updateReportStatus(reportId, newStatus, auditorFeedback = null, statusNote = null, decryptedData = null) {
        const data = loadData();
        const rpt = data.reports.find(r => r.id === reportId);
        if (rpt) {
            if (newStatus) rpt.status = newStatus;
            if (auditorFeedback !== null) {
                rpt.auditorFeedback = auditorFeedback;
            }
            if (statusNote !== null) {
                rpt.statusNote = statusNote;
            }
            if (decryptedData !== null) {
                rpt.decryptedData = decryptedData;
            }
            saveData(data);
            return rpt;
        }
        return null;
    }

    /**
     * Cari anggota berdasarkan public key (n & e) untuk verifikasi identitas
     */
    function findMemberByPublicKey(publicKey) {
        const members = getMembers();
        return members.find(m => 
            m.publicKey.n === publicKey.n && 
            m.publicKey.e === publicKey.e
        );
    }

    /**
     * Reset database ke kondisi awal
     */
    function resetToDefault() {
        localStorage.removeItem(STORAGE_KEY);
        loadData();
    }

    return {
        loadData,
        getMembers,
        getAuditor,
        setAuditorKeys,
        addMember,
        getReports,
        submitReport,
        updateReportStatus,
        findMemberByPublicKey,
        resetToDefault
    };
})();
