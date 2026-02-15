import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '../../services/authService'
import { supabase } from '../../services/supabaseClient'
import ButtonLoader from '../../components/shared/ButtonLoader'

export default function AdminLoginPage() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            // Sign in with email
            const { data, error: signInError } = await authService.signInWithEmail(email, password)

            if (signInError) throw signInError

            if (!data?.user) {
                throw new Error('Login gagal')
            }

            // Check if user has admin role in profiles table
            const userId = data.user.id
            const { data: profileData } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single()

            if (profileData?.role !== 'admin') {
                // Not an admin - sign out and show error
                await authService.signOut()
                setError('Akun ini bukan admin. Gunakan halaman login biasa untuk customer/merchant/driver.')
                return
            }

            // Admin verified - redirect to dashboard
            navigate('/admin/dashboard')
        } catch (err) {
            console.error('Admin login failed:', err)
            if (err.message?.includes('Invalid')) {
                setError('Email atau kata sandi salah')
            } else {
                setError(err.message || 'Gagal login. Silakan coba lagi.')
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
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
                        <span className="material-symbols-outlined text-primary text-3xl">admin_panel_settings</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                    <p className="text-[#617589] text-sm mt-1">Masuk ke dashboard administrator</p>
                </div>

                {/* Login Card */}
                <div className="bg-[#1a2632] border border-[#2a3b4d] rounded-2xl p-8 shadow-2xl">

                    {error && (
                        <div className="mb-6 p-3 bg-red-900/20 border border-red-800/30 text-red-400 rounded-xl text-sm flex items-start gap-2">
                            <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">error</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#617589] text-[20px]">mail</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@bantoo.com"
                                    className="w-full bg-[#202e3b] border border-[#2a3b4d] rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-[#617589] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                                Kata Sandi
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#617589] text-[20px]">lock</span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan kata sandi"
                                    className="w-full bg-[#202e3b] border border-[#2a3b4d] rounded-xl pl-12 pr-12 py-3.5 text-white placeholder:text-[#617589] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#617589] hover:text-[#94a3b8] transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <ButtonLoader />
                            ) : (
                                <>
                                    Masuk
                                    <span className="material-symbols-outlined text-[20px]">login</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-[#2a3b4d]"></div>
                        <span className="text-xs text-[#617589]">atau</span>
                        <div className="flex-1 h-px bg-[#2a3b4d]"></div>
                    </div>

                    {/* Create Admin Link */}
                    <Link
                        to="/create-admin-secret"
                        className="w-full h-12 border border-[#2a3b4d] text-[#94a3b8] hover:text-white hover:border-[#3a4b5d] font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">person_add</span>
                        Buat Akun Admin Baru
                    </Link>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-[#617589] mt-6">
                    Halaman ini khusus untuk administrator BANTOO
                </p>
            </div>
        </div>
    )
}
