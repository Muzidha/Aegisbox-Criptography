/**
 * Storage & Organisasi Registry (Store & Public Key Directory)
 * Menyimpan data civitas organisasi terdaftar, kunci publik/privat, dan kotak masuk laporan whistleblower.
 * Menggunakan localStorage untuk persistensi data di browser.
 */

const CivitasStore = (function () {
    const STORAGE_KEY = 'aegisbox_whistleblower_data_v3';

    // Data Awal Bawaan - Kunci RSA 128-bit Asli & Terverifikasi Matematis
    const DEFAULT_DATA = {
    "auditor": {
        "name": "Komite Etik & Satgas Investigasi Independen",
        "publicKey": {
            "e": "65537",
            "n": "262006731669837592620842269741213415357",
            "bitLength": 128
        },
        "privateKey": {
            "d": "179007483059167310767054989606921509633",
            "n": "262006731669837592620842269741213415357",
            "bitLength": 128
        },
        "mathDetails": {
            "p": "15655680937205993317",
            "q": "16735569198218272121",
            "n": "262006731669837592620842269741213415357",
            "phi": "262006731669837592588451019605789149920",
            "e": "65537",
            "d": "179007483059167310767054989606921509633",
            "keyBits": 128,
            "actualBits": 128,
            "euclideanSampleSteps": [
                {
                    "old_r": "65537",
                    "r": "262006731669837592588451019605789149920",
                    "q": "0",
                    "rem": "65537"
                },
                {
                    "old_r": "262006731669837592588451019605789149920",
                    "r": "65537",
                    "q": "3997844449239934580289775540622688",
                    "rem": "46464"
                },
                {
                    "old_r": "65537",
                    "r": "46464",
                    "q": "1",
                    "rem": "19073"
                },
                {
                    "old_r": "46464",
                    "r": "19073",
                    "q": "2",
                    "rem": "8318"
                },
                {
                    "old_r": "19073",
                    "r": "8318",
                    "q": "2",
                    "rem": "2437"
                },
                {
                    "old_r": "8318",
                    "r": "2437",
                    "q": "3",
                    "rem": "1007"
                },
                {
                    "old_r": "2437",
                    "r": "1007",
                    "q": "2",
                    "rem": "423"
                },
                {
                    "old_r": "1007",
                    "r": "423",
                    "q": "2",
                    "rem": "161"
                },
                {
                    "old_r": "423",
                    "r": "161",
                    "q": "2",
                    "rem": "101"
                },
                {
                    "old_r": "161",
                    "r": "101",
                    "q": "1",
                    "rem": "60"
                }
            ]
        }
    },
    "members": [
        {
            "id": "MEM-MHS-202401",
            "alias": "Civitas #MHS-202401",
            "role": "Mahasiswa Aktif",
            "unit": "Fakultas Ilmu Komputer",
            "registeredAt": "2026-02-10",
            "publicKey": {
                "e": "65537",
                "n": "220907863734343486057711449248211657019",
                "bitLength": 128
            },
            "privateKey": {
                "d": "126746379787582339161286734003385643489",
                "n": "220907863734343486057711449248211657019",
                "bitLength": 128
            },
            "pseudonymCode": "GHOST-CYBER-884"
        },
        {
            "id": "MEM-DOS-10492",
            "alias": "Civitas #DOS-10492",
            "role": "Dosen / Pengajar",
            "unit": "Departemen Sistem Informasi",
            "registeredAt": "2026-01-15",
            "publicKey": {
                "e": "65537",
                "n": "139526406733721018796208119668935254931",
                "bitLength": 127
            },
            "privateKey": {
                "d": "17708785132232043489168598227489176561",
                "n": "139526406733721018796208119668935254931",
                "bitLength": 127
            },
            "pseudonymCode": "SILENT-EAGLE-419"
        },
        {
            "id": "MEM-STF-08821",
            "alias": "Civitas #STF-08821",
            "role": "Staf Administrasi & Keuangan",
            "unit": "Biro Keuangan Pusat",
            "registeredAt": "2026-03-01",
            "publicKey": {
                "e": "65537",
                "n": "103122911014631803700252977203200348279",
                "bitLength": 127
            },
            "privateKey": {
                "d": "101185924221537646938973618334527600193",
                "n": "103122911014631803700252977203200348279",
                "bitLength": 127
            },
            "pseudonymCode": "SHADOW-HERO-103"
        }
    ],
    "reports": [
        {
            "id": "RPT-2026-0091",
            "title": "Dugaan Pungutan Liar Dana Praktikum Tanpa Kuitansi Resmi",
            "category": "Korupsi & Pungli",
            "pseudonymCode": "GHOST-CYBER-884",
            "senderMemberId": "MEM-MHS-202401",
            "senderPublicKey": {
                "e": "65537",
                "n": "220907863734343486057711449248211657019",
                "bitLength": 128
            },
            "signatureHex": "6d69daa5793697f894eaca014e608a8a",
            "hashHex": "5f0e5e6f32c4ac4c84dfd9f002cc43f892266bad7f505e72e17b295713b785ce",
            "cipherBlocks": [
                {
                    "cHex": "202214b486fadfcb97292a9d6f8a29d3",
                    "chunkLen": 15
                },
                {
                    "cHex": "915e0a2ad36101e52367c8362749718f",
                    "chunkLen": 15
                },
                {
                    "cHex": "43ac7c6df429b3a053fc15787b5a782e",
                    "chunkLen": 15
                },
                {
                    "cHex": "2504d90e202491152dc941bda1668ca3",
                    "chunkLen": 15
                },
                {
                    "cHex": "295bd1512038cfeab391ffc9a3a47c9a",
                    "chunkLen": 15
                },
                {
                    "cHex": "bbe11961e55fffc26f4fed35332b9974",
                    "chunkLen": 15
                },
                {
                    "cHex": "c17248f9c97a8c02ff325b28b784aaa6",
                    "chunkLen": 15
                },
                {
                    "cHex": "4a3943719bd49b824f332b43d64b4d77",
                    "chunkLen": 15
                },
                {
                    "cHex": "bd829c9b2d60e9c7ca955b9fa19e3490",
                    "chunkLen": 15
                },
                {
                    "cHex": "735ff8b13e1d9d4721077b8ae61b0ac4",
                    "chunkLen": 15
                },
                {
                    "cHex": "9df9cec1ba8a2cec7383636f11907f86",
                    "chunkLen": 15
                },
                {
                    "cHex": "ac525e55d91b2030d82c751c72c77ae6",
                    "chunkLen": 15
                },
                {
                    "cHex": "a98ccca4c3614f1dd8f43329ae6ab5c5",
                    "chunkLen": 15
                },
                {
                    "cHex": "60e2431002a3572c7b22ccfd1dfe30e9",
                    "chunkLen": 15
                },
                {
                    "cHex": "7febe136d8c9151fab62d0f59b1fa4be",
                    "chunkLen": 15
                },
                {
                    "cHex": "470f3e44cee614d572ad36a491969bb7",
                    "chunkLen": 15
                },
                {
                    "cHex": "398bf9c3092d85dab4ce9c733a772c43",
                    "chunkLen": 15
                },
                {
                    "cHex": "a8b985501cc6d7babaac6f112b82d46c",
                    "chunkLen": 15
                },
                {
                    "cHex": "addd1097809e9ee0168143e1c06fb7a0",
                    "chunkLen": 15
                },
                {
                    "cHex": "7f358005715832d3ebea8e572cf4ce65",
                    "chunkLen": 15
                },
                {
                    "cHex": "6b78385ff3555948880e9849a6b9bb17",
                    "chunkLen": 15
                },
                {
                    "cHex": "1a4666800b31877b52a5d2eca5df729f",
                    "chunkLen": 15
                },
                {
                    "cHex": "4a55ea2c098f118912ac09fd9b0ddd0b",
                    "chunkLen": 10
                }
            ],
            "blockSize": 15,
            "submittedAt": "2026-10-06T10:15:00.000Z",
            "status": "Menunggu Tinjauan",
            "statusNote": "Laporan baru diterima. Terenkripsi dengan Kunci Publik Auditor.",
            "auditorFeedback": null
        }
    ]
};

    function loadData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) {
                saveData(DEFAULT_DATA);
                return DEFAULT_DATA;
            }
            const parsed = JSON.parse(raw);
            if (!parsed.auditor || !parsed.auditor.privateKey || !parsed.auditor.mathDetails) {
                saveData(DEFAULT_DATA);
                return DEFAULT_DATA;
            }
            const e = BigInt(parsed.auditor.publicKey.e);
            const d = BigInt(parsed.auditor.privateKey.d);
            const phi = BigInt(parsed.auditor.mathDetails.phi);
            if ((e * d) % phi !== 1n) {
                console.warn("Kunci auditor di penyimpanan tidak valid matematis. Mereset ke pasangan kunci valid.");
                saveData(DEFAULT_DATA);
                return DEFAULT_DATA;
            }
            return parsed;
        } catch (e) {
            console.warn("Gagal memuat data dari localStorage, menggunakan data default:", e);
            return DEFAULT_DATA;
        }
    }

    function saveData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error("Gagal menyimpan ke localStorage:", e);
        }
    }

    function getMembers() {
        const data = loadData();
        return data.members || [];
    }

    function getAuditor() {
        const data = loadData();
        return data.auditor;
    }

    function setAuditorKeys(newAuditor) {
        const data = loadData();
        data.auditor = newAuditor;
        saveData(data);
    }

    function addMember(member) {
        const data = loadData();
        data.members.push(member);
        saveData(data);
        return member;
    }

    function getReports() {
        const data = loadData();
        return data.reports || [];
    }

    function submitReport(reportPayload) {
        const data = loadData();
        data.reports.unshift(reportPayload);
        saveData(data);
        return reportPayload;
    }

    function updateReportStatus(reportId, newStatus, auditorFeedback = null, statusNote = null, decryptedData = null) {
        const data = loadData();
        const rpt = data.reports.find(r => r.id === reportId);
        if (rpt) {
            if (newStatus) rpt.status = newStatus;
            if (auditorFeedback !== null) rpt.auditorFeedback = auditorFeedback;
            if (statusNote !== null) rpt.statusNote = statusNote;
            if (decryptedData !== null) rpt.decryptedData = decryptedData;
            saveData(data);
            return rpt;
        }
        return null;
    }

    function findMemberByPublicKey(publicKey) {
        const members = getMembers();
        return members.find(m => 
            m.publicKey.n === publicKey.n && 
            m.publicKey.e === publicKey.e
        );
    }

    function resetToDefault() {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('aegisbox_whistleblower_data_v2');
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
