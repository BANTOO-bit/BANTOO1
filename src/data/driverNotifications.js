// Mock notifications data for Driver
export const mockNotifications = [
    {
        id: 1,
        type: 'alert',
        subtype: 'limit',
        icon: 'access_time_filled',
        title: 'Batas Maksimal Setoran',
        message: 'Peringatan! Saldo COD Anda sudah mencapai batas maksimal. Segera setorkan fee admin agar tetap bisa menerima pesanan.',
        time: 'Baru saja',
        isUnread: true,
        category: 'today',
        details: {
            amount: 500000,
            limit: 500000,
            description: 'Batas maksimal penahanan uang COD adalah Rp 500.000. Saat ini saldo Anda telah mencapai batas tersebut.',
            action: 'Harap segera melakukan setoran tunai ke Admin/Koordinator terdekat untuk mengaktifkan kembali fitur terima pesanan.'
        }
    },
    {
        id: 2,
        type: 'alert',
        subtype: 'suspended',
        icon: 'gpp_bad',
        title: 'Akun Ditangguhkan (Suspended)',
        message: 'Akun Anda Ditangguhkan. Silakan hubungi admin atau pusat bantuan untuk informasi lebih lanjut.',
        time: '10 mnt yang lalu',
        isUnread: true,
        category: 'today',
        details: {
            status: 'Ditangguhkan',
            date: '24 Mei 2024',
            reason: 'Pelanggaran kode etik (pembatalan pesanan berulang)',
            description: 'Akun Anda tidak dapat digunakan untuk sementara. Silakan hubungi Pusat Bantuan untuk proses banding.'
        }
    },
    {
        id: 3,
        type: 'order',
        icon: 'local_shipping',
        title: 'Pesanan Baru Masuk!',
        message: 'Pesanan #OD-99281 dari Warung Sate Pak Kumis siap diambil. Segera konfirmasi.',
        time: '2 mnt yang lalu',
        isUnread: true,
        category: 'today'
    },
    {
        id: 4,
        type: 'success',
        subtype: 'deposit',
        icon: 'verified',
        title: 'Setoran COD Berhasil',
        message: 'Dana COD sebesar Rp 125.000 dari pesanan #OD-99220 telah diterima oleh Admin.',
        time: '1 jam yang lalu',
        isUnread: true,
        category: 'today',
        details: {
            transactionId: 'SET-8821',
            amount: 125000,
            status: 'Berhasil Diverifikasi',
            adminName: 'Siti (Pusat)',
            time: '1 jam yang lalu',
            note: 'Uang COD telah diterima oleh Admin. Limit transaksi Anda telah diperbarui.'
        }
    },
    {
        id: 5,
        type: 'success',
        subtype: 'withdrawal',
        icon: 'account_balance_wallet',
        title: 'Tarik Saldo Berhasil',
        message: 'Penarikan dana Rp 500.000 ke rekening BCA berhasil diproses. Silakan cek mutasi Anda.',
        time: '3 jam yang lalu',
        isUnread: false,
        category: 'today',
        details: {
            transactionId: 'TRX-88291002',
            amount: 500000,
            adminFee: 2500,
            totalReceived: 497500,
            date: 'Selasa, 24 Okt 2023 • 14:30 WIB',
            bankName: 'Bank BCA',
            accountNumber: '**** **** 8821',
            note: 'Dana telah berhasil dikirim ke rekening Anda. Silakan cek mutasi secara berkala.'
        }
    },
    {
        id: 6,
        type: 'success',
        icon: 'check_circle',
        title: 'Pesanan Selesai',
        message: 'Pesanan #OD-99100 telah berhasil diantar. Dana diteruskan ke saldo.',
        time: 'Kemarin, 14:30',
        isUnread: false,
        category: 'yesterday'
    },
    {
        id: 7,
        type: 'info',
        subtype: 'account',
        icon: 'security',
        title: 'Informasi Rekening Diperbarui',
        message: 'Perubahan data rekening bank Anda telah diverifikasi dan aktif digunakan.',
        time: 'Kemarin, 10:15',
        isUnread: false,
        category: 'yesterday',
        details: {
            bankName: 'Bank BCA',
            accountNumber: '123******89',
            time: '10:15 WIB',
            note: 'Perubahan ini dilakukan pada 10:15 WIB. Jika ini bukan Anda, segera amankan akun Anda untuk mencegah penyalahgunaan.'
        }
    }
]
