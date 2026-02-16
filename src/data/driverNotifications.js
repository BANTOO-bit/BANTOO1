export const mockNotifications = [
    {
        id: 1,
        title: 'Penarikan Berhasil',
        message: 'Dana sebesar Rp 150.000 berhasil ditransfer ke rekening BCA Anda.',
        time: 'Baru saja',
        read: false,
        type: 'success',
        subtype: 'withdrawal',
        icon: 'account_balance_wallet',
        details: {
            transactionId: 'TRX-88291039',
            amount: 150000,
            adminFee: 2500,
            totalReceived: 147500,
            date: '20 Okt 2023, 14:30 WIB',
            bankName: 'BCA',
            accountNumber: '•••• 4567',
            note: 'Dana sudah masuk ke rekening Anda. Silakan cek mutasi rekening secara berkala.'
        }
    },
    {
        id: 2,
        title: 'Keamanan Akun',
        message: 'Perubahan nomor rekening berhasil dilakukan pada 19 Okt 2023.',
        time: '19 Okt',
        read: true,
        type: 'security',
        subtype: 'account',
        icon: 'security',
        details: {
            bankName: 'BCA',
            accountNumber: '1234567890',
            time: '19 Okt 2023, 09:15 WIB',
            note: 'Jika Anda tidak merasa melakukan perubahan ini, segera hubungi Pusat Bantuan kami untuk mengamankan akun Anda.'
        }
    },
    {
        id: 3,
        title: 'Akun Ditangguhkan',
        message: 'Akun Anda ditangguhkan sementara karena laporan ketidaksesuaian kendaraan.',
        time: '18 Okt',
        read: true,
        type: 'alert',
        subtype: 'suspended',
        icon: 'gpp_bad',
        details: {
            status: 'Ditangguhkan Sementara',
            date: '18 Okt 2023',
            reason: 'Laporan pelanggan mengenai ketidaksesuaian plat nomor kendaraan saat penjemputan.',
            description: 'Kami menerima laporan bahwa kendaraan yang Anda gunakan tidak sesuai dengan data yang terdaftar di aplikasi. Sesuai kebijakan keselamatan kami, akun Anda dinonaktifkan sementara selama proses investigasi (1x24 jam).'
        }
    },
    {
        id: 4,
        title: 'Setoran Berhasil',
        message: 'Setoran tunai Rp 50.000 telah diterima oleh Admin.',
        time: '17 Okt',
        read: true,
        type: 'info',
        subtype: 'deposit',
        icon: 'savings',
        details: {
            transactionId: 'DEP-773821',
            amount: 50000,
            status: 'Lunas',
            adminName: 'Budi Santoso (Admin Pusat)',
            time: '17 Okt 2023, 10:00 WIB',
            note: 'Terima kasih telah melakukan setoran tunai tepat waktu. Saldo limit COD Anda telah diperbarui.'
        }
    },
    {
        id: 5,
        title: 'Batas COD Hampir Habis',
        message: 'Saldo limit COD Anda tersisa Rp 20.000. Segera lakukan setoran.',
        time: '16 Okt',
        read: true,
        type: 'warning',
        subtype: 'limit',
        icon: 'payments',
        details: {
            amount: 480000,
            limit: 500000,
            description: 'Anda telah menerima pembayaran tunai (COD) mendekati batas maksimal Rp 500.000. Harap segera lakukan setoran ke Admin atau transfer dompet tunai agar Anda tetap bisa menerima order COD.',
            action: 'Segera lakukan top-up atau setoran.'
        }
    }
]
