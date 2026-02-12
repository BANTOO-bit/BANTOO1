import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import { supabase } from '../../services/supabaseClient'
import PhoneInput from '../../components/shared/PhoneInput'

export default function CreateAdminPage() {
    const navigate = useNavigate()
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [message, setMessage] = useState('')
    const [formError, setFormError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setFormError('')
        setMessage('')

        try {
            // Step 1: Register with Supabase Auth using email as primary login
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: name,
                        phone_number: phone,
                        role: 'admin'
                    }
                }
            })

            if (signUpError) throw signUpError
            if (!signUpData.user) throw new Error('Registrasi gagal')

            const userId = signUpData.user.id

            // Step 2: Insert admin role into user_roles table
            const { error: roleError } = await supabase
                .from('user_roles')
                .insert({ user_id: userId, role: 'admin' })

            if (roleError) {
                console.error('Failed to insert admin role:', roleError)
                // Don't throw - role can be added manually if this fails
            }

            // Step 3: Update profiles table with admin role
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    active_role: 'admin',
                    phone: phone,
                    full_name: name
                })
                .eq('id', userId)

            if (profileError) {
                console.error('Failed to update profile:', profileError)
            }

            // Step 4: Logout immediately
            await authService.signOut()

            setMessage(`Admin "${name}" berhasil didaftarkan! Redirect ke halaman login admin...`)
            setPhone('')
            setEmail('')
            setPassword('')
            setName('')

            // Redirect to admin login after 3 seconds
            setTimeout(() => {
                navigate('/manage/auth')
            }, 3000)
        } catch (err) {
            console.error('Admin registration failed:', err)
            if (err.message?.includes('already registered')) {
                setFormError('Email ini sudah terdaftar. Silakan gunakan email lain atau langsung login.')
            } else {
                setFormError(err.message || 'Gagal mendaftarkan admin')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0f1923] flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-2xl mb-4">
                        <span className="material-symbols-outlined text-red-500 text-3xl">shield_person</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Buat Akun Admin</h1>
                    <p className="text-[#617589] text-sm mt-1">Daftarkan administrator baru</p>
                </div>

                {/* Form Card */}
                <div className="bg-[#1a2632] border border-[#2a3b4d] rounded-2xl p-8 shadow-2xl">

                    {message && (
                        <div className="mb-6 p-3 bg-green-900/20 border border-green-800/30 text-green-400 rounded-xl text-sm flex items-start gap-2">
                            <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">check_circle</span>
                            <span>{message}</span>
                        </div>
                    )}

                    {formError && (
                        <div className="mb-6 p-3 bg-red-900/20 border border-red-800/30 text-red-400 rounded-xl text-sm flex items-start gap-2">
                            <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">error</span>
                            <span>{formError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[#94a3b8] mb-2">Nama Lengkap</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#617589] text-[20px]">person</span>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nama Admin"
                                    className="w-full bg-[#202e3b] border border-[#2a3b4d] rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-[#617589] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#94a3b8] mb-2">Email</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#617589] text-[20px]">mail</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@bantoo.com"
                                    className="w-full bg-[#202e3b] border border-[#2a3b4d] rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-[#617589] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    required
                                />
                            </div>
                            <p className="text-xs text-[#617589] mt-1 pl-1">Email ini akan digunakan untuk login admin</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#94a3b8] mb-2">Nomor Telepon</label>
                            <PhoneInput
                                value={phone}
                                onChange={setPhone}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#94a3b8] mb-2">Kata Sandi</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#617589] text-[20px]">lock</span>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min. 6 karakter"
                                    className="w-full bg-[#202e3b] border border-[#2a3b4d] rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-[#617589] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                                    Buat Akun Admin
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-[#2a3b4d]"></div>
                        <span className="text-xs text-[#617589]">sudah punya akun?</span>
                        <div className="flex-1 h-px bg-[#2a3b4d]"></div>
                    </div>

                    {/* Login Link */}
                    <button
                        onClick={() => navigate('/manage/auth')}
                        className="w-full h-12 border border-[#2a3b4d] text-[#94a3b8] hover:text-white hover:border-[#3a4b5d] font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">login</span>
                        Login sebagai Admin
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-[#617589] mt-6">
                    Halaman ini khusus untuk pembuatan akun administrator
                </p>
            </div>
        </div>
    )
}
