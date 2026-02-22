import { useState } from 'react';

const DriverIssueModal = ({ isOpen, onClose, onSubmit, type = 'pickup' }) => {
    const [reason, setReason] = useState('');
    const [customReason, setCustomReason] = useState('');

    if (!isOpen) return null;

    const reasons = type === 'pickup' ? [
        'Restoran Tutup',
        'Item Habis',
        'Antrean Terlalu Panjang',
        'Kendala Kendaraan / Ban Bocor'
    ] : type === 'payment' ? [
        'Pelanggan Bayar Kurang / Selisih',
        'Pelanggan Menolak Membayar COD',
        'Pelanggan Meminta Transfer Manual'
    ] : [
        'Pelanggan Tidak Bisa Dihubungi',
        'Alamat Tidak Ditemukan',
        'Kendala Kendaraan / Ban Bocor',
        'Pelanggan Menolak Pesanan'
    ];

    const handleSubmit = () => {
        const finalReason = reason === 'Lainnya' ? customReason : reason;
        if (!finalReason) return;
        onSubmit(finalReason);
        setReason('');
        setCustomReason('');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-slide-up">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">Validasi / Lapor Kendala</h3>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="p-4 flex flex-col gap-3">
                    <p className="text-sm text-slate-500 mb-2">Pilih alasan mengapa Anda tidak bisa melanjutkan pesanan ini:</p>
                    {reasons.map((r, i) => (
                        <label key={i} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${reason === r ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-red-200'}`}>
                            <input
                                type="radio"
                                name="issueReason"
                                checked={reason === r}
                                onChange={() => setReason(r)}
                                className="mt-0.5 text-red-600 focus:ring-red-500"
                            />
                            <span className={`text-sm font-semibold ${reason === r ? 'text-red-700' : 'text-slate-700'}`}>{r}</span>
                        </label>
                    ))}
                    <label className={`flex flex-col gap-2 p-3 rounded-xl border cursor-pointer transition-all ${reason === 'Lainnya' ? 'border-red-500 bg-red-50' : 'border-slate-200 hover:border-red-200'}`}>
                        <div className="flex items-start gap-3">
                            <input
                                type="radio"
                                name="issueReason"
                                checked={reason === 'Lainnya'}
                                onChange={() => setReason('Lainnya')}
                                className="mt-0.5 text-red-600 focus:ring-red-500"
                            />
                            <span className={`text-sm font-semibold ${reason === 'Lainnya' ? 'text-red-700' : 'text-slate-700'}`}>Alasan Lainnya</span>
                        </div>
                        {reason === 'Lainnya' && (
                            <textarea
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                placeholder="Tuliskan kendala Anda..."
                                className="w-full mt-2 p-3 bg-white border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 placeholder:text-slate-400"
                                rows="3"
                            ></textarea>
                        )}
                    </label>

                    <button
                        onClick={handleSubmit}
                        disabled={!reason || (reason === 'Lainnya' && !customReason)}
                        className="w-full mt-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-3.5 rounded-xl transition-colors"
                    >
                        KIRIM LAPORAN
                    </button>
                    <p className="text-[10px] text-center text-slate-400 mt-2">
                        Tim Support akan meninjau laporan Anda. Sanksi dapat berlaku jika laporan palsu.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DriverIssueModal;
