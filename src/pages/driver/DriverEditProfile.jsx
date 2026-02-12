import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function DriverEditProfile() {
    const navigate = useNavigate()

    // Mock initial state
    const [formData, setFormData] = useState({
        name: 'Budi Santoso',
        phone: '0812-9988-7766',
        email: 'budi.santoso@email.com',
        address: 'Jl. Raya Kebon Jeruk No. 12A, Jakarta Barat, DKI Jakarta'
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSave = () => {
        // Logic to save profile would go here
        navigate('/driver/profile')
    }

    return (
        <div className="font-display bg-background-light text-slate-900 antialiased min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto shadow-2xl bg-background-light">
                {/* Header */}
                <header className="bg-white pt-12 pb-4 px-6 sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 shadow-sm">
                    <div className="w-16">
                        <button
                            onClick={() => navigate('/driver/profile')}
                            className="text-slate-500 text-base font-medium hover:text-slate-900 transition-colors"
                        >
                            Batal
                        </button>
                    </div>
                    <h1 className="text-lg font-bold text-slate-900 text-center flex-1">Ubah Profil</h1>
                    <div className="w-16 flex justify-end">
                        <button
                            onClick={handleSave}
                            className="text-[#0d59f2] text-base font-bold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Simpan
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto pb-32">
                    {/* Photo Change Section */}
                    <div className="flex flex-col items-center pt-8 pb-8 px-6 bg-white border-b border-slate-100 mb-4">
                        <div className="relative group cursor-pointer">
                            <div
                                className="bg-center bg-no-repeat bg-cover rounded-full size-32 ring-4 ring-slate-50 shadow-xl"
                                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBbrWfUKf0v3ygsHK1Gd08zoduoiOHyK-AzHdSjbcrg-uJJcqfeBou-uEGP9nsqoEjQe_HeTGeRfUq3tMA0xDsdoeQbX_WQr9RZDIlAbT4u29ITJuCJAq8hXRZmjfPm4Vh2VJP7RZ0urGXOPUvNj1H_ggdF-JS0OBQ0Cf6ld73t9kKCtRoecNq0qHmHIJNL9AyMPKeZhZMzVlWfQ6NbVlkNe7LPVQjnVKIpSMVCeRGY_zCv2G4v9EDM6KFZq-jHgctmifnVATzUlQ")' }}
                            >
                                <div className="absolute inset-0 bg-black/5 rounded-full group-hover:bg-black/10 transition-colors"></div>
                            </div>
                            <div className="absolute bottom-1 right-1 bg-[#0d59f2] text-white p-2 rounded-full ring-4 ring-white flex items-center justify-center shadow-md">
                                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                            </div>
                        </div>
                        <p className="mt-3 text-xs font-semibold text-[#0d59f2]">Ketuk untuk ganti foto</p>
                    </div>

                    {/* Form Fields */}
                    <div className="px-4 space-y-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            {/* Name */}
                            <div className="p-5 border-b border-slate-50 hover:bg-slate-50 focus-within:bg-slate-50 transition-colors">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Nama Lengkap</label>
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0d59f2] flex-none">
                                        <span className="material-symbols-outlined text-[20px]">person</span>
                                    </div>
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-0 border-b border-transparent focus:border-[#0d59f2] focus:ring-0 px-0 py-1 text-slate-900 font-bold text-base placeholder:text-slate-300 transition-colors"
                                        placeholder="Masukkan nama lengkap"
                                        type="text"
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="p-5 border-b border-slate-50 hover:bg-slate-50 focus-within:bg-slate-50 transition-colors">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Nomor Telepon</label>
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0d59f2] flex-none">
                                        <span className="material-symbols-outlined text-[20px]">call</span>
                                    </div>
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-0 border-b border-transparent focus:border-[#0d59f2] focus:ring-0 px-0 py-1 text-slate-900 font-bold text-base placeholder:text-slate-300 transition-colors"
                                        placeholder="08xx-xxxx-xxxx"
                                        type="tel"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="p-5 border-b border-slate-50 hover:bg-slate-50 focus-within:bg-slate-50 transition-colors">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Email</label>
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0d59f2] flex-none">
                                        <span className="material-symbols-outlined text-[20px]">mail</span>
                                    </div>
                                    <input
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-0 border-b border-transparent focus:border-[#0d59f2] focus:ring-0 px-0 py-1 text-slate-900 font-bold text-base placeholder:text-slate-300 transition-colors"
                                        placeholder="nama@email.com"
                                        type="email"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div className="p-5 hover:bg-slate-50 focus-within:bg-slate-50 transition-colors">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Alamat Domisili</label>
                                <div className="flex items-start gap-4">
                                    <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0d59f2] flex-none mt-1">
                                        <span className="material-symbols-outlined text-[20px]">home_pin</span>
                                    </div>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full bg-transparent border-0 border-b border-transparent focus:border-[#0d59f2] focus:ring-0 px-0 py-1 text-slate-900 font-bold text-base leading-relaxed placeholder:text-slate-300 resize-none transition-colors"
                                        rows="3"
                                    />
                                </div>
                            </div>
                        </div>

                        <p className="text-center text-xs text-slate-400 pt-4">ID Driver: DRV-8829-JKT</p>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default DriverEditProfile
