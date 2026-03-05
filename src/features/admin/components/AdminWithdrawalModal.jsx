import { useState } from 'react'

export default function AdminWithdrawalModal({ isOpen, onClose, data, onConfirm }) {
    if (!isOpen || !data) return null

    const [referenceNumber, setReferenceNumber] = useState('')

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-white dark:bg-[#1a2632] rounded-xl w-full max-w-lg border border-[#e5e7eb] dark:border-[#2a3b4d] flex flex-col shadow-none overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb] dark:border-[#2a3b4d]">
                    <h3 className="text-lg font-bold text-[#111418] dark:text-white">Verifikasi Penarikan Dana {data.type === 'driver' ? 'Driver' : 'Mitra'}</h3>
                    <button onClick={onClose} className="text-[#617589] hover:text-[#111418] dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 flex flex-col gap-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-medium text-[#617589] dark:text-[#94a3b8] mb-1">Nama {data.type === 'driver' ? 'Driver' : 'Mitra'}</p>
                                <p className="text-sm font-semibold text-[#111418] dark:text-white">{data.name} <span className="text-xs font-normal text-[#617589] dark:text-[#94a3b8]">({data.id})</span></p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-[#617589] dark:text-[#94a3b8] mb-1">Nominal Penarikan</p>
                                <p className="text-lg font-bold text-primary">{data.amount}</p>
                            </div>
                        </div>

                        <div className="bg-[#f0f2f4] dark:bg-[#2a3b4d] p-4 rounded-lg border border-[#e5e7eb] dark:border-[#2a3b4d]/50">
                            <p className="text-xs font-medium text-[#617589] dark:text-[#94a3b8] mb-2 uppercase tracking-wide">Informasi Rekening Bank</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-white dark:bg-[#1a2632] flex items-center justify-center border border-[#e5e7eb] dark:border-[#2a3b4d]">
                                    <span className="material-symbols-outlined text-[#617589]">account_balance</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#111418] dark:text-white">{data.bankName} - {data.accountNumber}</p>
                                    <p className="text-xs text-[#617589] dark:text-[#94a3b8]">a.n. {data.accountHolder}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[#111418] dark:text-white">Unggah Bukti Transfer</label>
                        <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#d1d5db] dark:border-[#4b5563] rounded-lg hover:bg-[#f9fafb] dark:hover:bg-[#2a3b4d]/50 transition-colors cursor-pointer group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <span className="material-symbols-outlined text-[#9ca3af] mb-2 text-3xl group-hover:text-primary transition-colors">cloud_upload</span>
                                <p className="mb-1 text-sm text-[#617589] dark:text-[#94a3b8]"><span class="font-semibold text-primary">Klik untuk unggah</span> atau drag and drop</p>
                                <p className="text-xs text-[#9ca3af] dark:text-[#6b7280]">PNG, JPG atau PDF (Maks. 2MB)</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-[#111418] dark:text-white" htmlFor="ref-number">Catatan / Nomor Referensi Bank</label>
                        <input
                            className="w-full px-3 py-2 text-sm border border-[#d1d5db] dark:border-[#4b5563] rounded-lg bg-white dark:bg-[#1a2632] text-[#111418] dark:text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-shadow"
                            id="ref-number"
                            placeholder="Masukkan nomor referensi transaksi..."
                            type="text"
                            value={referenceNumber}
                            onChange={(e) => setReferenceNumber(e.target.value)}
                        />
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-[#f0fdf4] dark:bg-[#14532d]/20 rounded-lg border border-[#dcfce7] dark:border-[#14532d]/40">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-[#1a2632] border border-[#e5e7eb] dark:border-[#2a3b4d] shrink-0">
                            <span className="material-symbols-outlined text-[#22c55e] text-lg">chat</span>
                        </div>
                        <div className="flex flex-col">
                            <p className="text-xs font-bold text-[#111418] dark:text-white mb-0.5">Otomatisasi Notifikasi WhatsApp</p>
                            <p className="text-xs text-[#617589] dark:text-[#94a3b8] leading-relaxed">Sistem akan mengirimkan bukti transfer dan notifikasi sukses ke WhatsApp <span className="font-semibold text-[#111418] dark:text-white">{data.name}</span> secara otomatis.</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e7eb] dark:border-[#2a3b4d] bg-[#f9fafb] dark:bg-[#1f2e3b]/50">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-[#617589] bg-gray-200 dark:bg-[#2a3b4d] dark:text-[#94a3b8] rounded-lg hover:bg-gray-300 dark:hover:bg-[#374151] transition-colors">
                        Batal
                    </button>
                    <button onClick={() => onConfirm(data, referenceNumber)} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-blue-600 transition-colors shadow-none flex items-center gap-2">
                        Konfirmasi & Kirim Notifikasi
                        <svg className="w-4 h-4 fill-current opacity-90" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.884-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    )
}
