import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { driverService } from '@/services/driverService'

// FAQ Data Source
const FAQ_DATA = [
    {
        id: 'q1',
        title: 'Bagaimana cara tarik saldo (Cashout)?',
        answer: 'Untuk menarik saldo, masuk ke menu **Pendapatan** > Klik tombol **Tarik Saldo**. Pastikan Anda sudah menambahkan Rekening Bank di halaman profil dan memiliki saldo minimal Rp 10.000.'
    },
    {
        id: 'q2',
        title: 'Apa itu Potongan Ongkir COD?',
        answer: 'Bantoo! tidak memotong pendapatan *delivery fee* Anda secara langsung jika pesanan dibayar tunai (COD). Namun, uang tunai tersebut harus disetorkan secara berkala ke Admin melalui menu **Setor Ke Admin** agar akun Anda tetap aktif.'
    },
    {
        id: 'q3',
        title: 'Tingkat & Poin saya tidak bertambah?',
        answer: 'Sistem Tingkat (Bronze/Silver/Gold) diperbarui berdasarkan jumlah total pesanan yang berhasil Anda selesaikan. Jika Anda baru saja menyelesaikan pesanan, tunggu beberapa saat hingga server menyinkronkan data Anda.'
    },
    {
        id: 'q4',
        title: 'Pelanggan tidak bisa dihubungi!',
        answer: 'Jika pelanggan tidak dapat dihubungi selama lebih dari 10 menit sesampainya Anda di lokasi pengantaran, Anda berhak menekan tombol Bantuan Darurat pada layar pengantaran atau langsung chat Admin via WhatsApp di bawah untuk proses retur.'
    },
    {
        id: 'q5',
        title: 'Kenapa akun saya Offline terus?',
        answer: 'Penyebab umum: 1) Ada pesanan yang sedang berjalan namun belum diselesaikan. 2) Limit tunggakan deposit tunai COD Anda melebihi batas. Silakan setor COD ke Admin terlebih dahulu.'
    }
]

function DriverHelpCenterPage() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const messagesEndRef = useRef(null)
    
    // User Profile for greeting
    const [profileName, setProfileName] = useState('Mitra')
    useEffect(() => {
        if(user?.id) {
            driverService.getProfile().then(p => {
                if(p?.full_name) setProfileName(p.full_name)
            }).catch(() => {})
        }
    }, [user?.id])

    // Chat State
    const [messages, setMessages] = useState([
        { 
            id: 'welcome', 
            sender: 'bot', 
            text: 'Halo! Saya **Bantoobot** 🤖\nAda kendala terkait layanan pengemudi yang bisa saya bantu jawab hari ini?', 
            time: new Date()
        }
    ])
    
    // Auto-scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleAskQuestion = (faq) => {
        // 1. Add User Question Bubble
        const userMsg = {
            id: `usr-${Date.now()}`,
            sender: 'user',
            text: faq.title,
            time: new Date()
        }
        
        // 2. Add Typing Indicator immediately
        const typingMsg = {
            id: 'typing',
            sender: 'bot',
            isTyping: true,
            time: new Date()
        }
        
        setMessages(prev => [...prev, userMsg, typingMsg])

        // 3. Remove Typing Indicator and Add Bot Answer after delay
        setTimeout(() => {
            setMessages(prev => {
                const filtered = prev.filter(m => m.id !== 'typing')
                return [...filtered, {
                    id: `bot-${Date.now()}`,
                    sender: 'bot',
                    text: faq.answer,
                    time: new Date()
                }]
            })
        }, 1000)
    }

    // Helper to render bold text in markdown-like format (*text*) or (**text**)
    const formatText = (text) => {
        if (!text) return ''
        const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g)
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-bold text-slate-800">{part.slice(2, -2)}</strong>
            }
            if (part.startsWith('*') && part.endsWith('*')) {
                return <strong key={i} className="font-bold text-slate-800">{part.slice(1, -1)}</strong>
            }
            // Split by newline for standard breaks
            return part.split('\n').map((line, j) => (
                <span key={`${i}-${j}`}>
                    {line}
                    {j < part.split('\n').length - 1 && <br />}
                </span>
            ))
        })
    }

    return (
        <div className="relative min-h-screen flex flex-col bg-slate-50">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-[#0d59f2] text-white px-4 pt-12 pb-3 shadow-md">
                <div className="relative flex items-center justify-between min-h-[40px]">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 active:scale-95 transition-all -ml-2"
                    >
                        <span className="material-symbols-outlined text-white">arrow_back</span>
                    </button>
                    <div className="flex flex-col items-center">
                        <h1 className="text-white text-lg font-bold tracking-tight">Pusat Bantuan Mitra</h1>
                        <span className="text-[10px] text-blue-100 font-medium flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                            Online
                        </span>
                    </div>
                    <div className="w-10 h-10" />
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[url('https://www.transparenttextures.com/patterns/cream-pixels.png')]">
                <div className="text-center my-2">
                    <span className="px-3 py-1 bg-slate-200/60 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Hari ini
                    </span>
                </div>

                {messages.map((msg) => (
                    <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'bot' && (
                            <div className="w-8 h-8 rounded-full bg-[#0d59f2] flex items-center justify-center shrink-0 mr-2 mt-auto mb-1 border-2 border-white shadow-sm">
                                <span className="material-symbols-outlined text-white text-[16px]">support_agent</span>
                            </div>
                        )}
                        
                        <div className={`max-w-[80%] flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                            <div 
                                className={`p-3 rounded-2xl shadow-sm text-sm relative ${
                                    msg.sender === 'user' 
                                        ? 'bg-[#0d59f2] text-white rounded-br-sm' 
                                        : 'bg-white border border-slate-100 text-slate-600 rounded-bl-sm'
                                }`}
                            >
                                {msg.isTyping ? (
                                    <div className="flex gap-1 items-center h-5 px-1">
                                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                                    </div>
                                ) : (
                                    <p className="leading-relaxed">
                                        {msg.id === 'welcome' 
                                            ? formatText(msg.text.replace('[Nama Driver]', profileName))
                                            : formatText(msg.text)
                                        }
                                    </p>
                                )}
                            </div>
                            <span className={`text-[9px] text-slate-400 mt-1 font-medium ${msg.sender === 'user' ? 'mr-1' : 'ml-1'}`}>
                                {msg.time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </main>

            {/* Input Area (Static Chips) */}
            <div className="bg-white border-t border-slate-100 p-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-10">
                <p className="text-xs font-bold text-slate-500 mb-3 px-1">Pilih Topik Pertanyaan:</p>
                <div className="flex items-center overflow-x-auto pb-2 gap-2 hide-scrollbar">
                    {FAQ_DATA.map(faq => (
                        <button
                            key={faq.id}
                            onClick={() => handleAskQuestion(faq)}
                            className="shrink-0 max-w-[200px] whitespace-normal text-left px-4 py-2 border border-[#0d59f2]/30 bg-blue-50 hover:bg-[#0d59f2] hover:text-white hover:border-[#0d59f2] text-[#0d59f2] rounded-xl text-xs font-semibold transition-all active:scale-[0.98]"
                        >
                            {faq.title}
                        </button>
                    ))}
                </div>
                
                {/* Fallback to Live CS */}
                <div className="pt-3 mt-1 border-t border-dashed border-slate-200">
                    <button 
                        onClick={() => window.location.href = 'https://wa.me/6281234567890?text=Halo%20Admin%20Bantoo,%20saya%20butuh%20bantuan%20sebagai%20Mitra%20Pengemudi.'}
                        className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3.5 rounded-xl font-bold shadow-sm active:scale-[0.98] transition-all"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"></path>
                        </svg>
                        Hubungi Admin via WhatsApp
                    </button>
                </div>
            </div>
            
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    )
}

export default DriverHelpCenterPage
