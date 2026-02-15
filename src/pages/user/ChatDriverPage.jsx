import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import BackButton from '../../components/shared/BackButton'
import { useToast } from '../../context/ToastContext'
import { handleInfo } from '../../utils/errorHandler'

// Sample chat messages
const initialMessages = [
    {
        id: 1,
        type: 'system',
        text: 'Driver dalam perjalanan menuju restoran',
        time: '12:30'
    },
    {
        id: 2,
        type: 'driver',
        text: 'Halo, saya Ahmad driver Anda. Pesanan sedang diproses di restoran.',
        time: '12:31'
    },
    {
        id: 3,
        type: 'user',
        text: 'Baik pak, terima kasih infonya',
        time: '12:32'
    },
    {
        id: 4,
        type: 'driver',
        text: 'Sama-sama. Estimasi sampai sekitar 15-20 menit ya.',
        time: '12:33'
    }
]

const driverInfo = {
    name: 'Ahmad Rizki',
    phone: '+62 813 9876 5432',
    vehicle: 'Honda Vario 125',
    plate: 'B 1234 XYZ',
    rating: 4.9,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
}

const quickReplies = [
    'Sudah sampai mana pak?',
    'Tolong hubungi saya ya',
    'Titip di satpam saja',
    'Terima kasih banyak!'
]

function ChatDriverPage() {
    const { orderId } = useParams()
    const navigate = useNavigate()
    const toast = useToast()
    const [messages, setMessages] = useState(initialMessages)
    const [inputText, setInputText] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = (text = inputText) => {
        if (!text.trim()) return

        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: text.trim(),
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }

        setMessages(prev => [...prev, userMessage])
        setInputText('')

        // Simulate driver typing
        setIsTyping(true)

        setTimeout(() => {
            setIsTyping(false)
            const driverReply = {
                id: Date.now() + 1,
                type: 'driver',
                text: getDriverReply(text.trim()),
                time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            }
            setMessages(prev => [...prev, driverReply])
        }, 1500)
    }

    const getDriverReply = (userText) => {
        const lowerText = userText.toLowerCase()
        if (lowerText.includes('sampai') || lowerText.includes('mana')) {
            return 'Sekarang masih di jalan menuju lokasi Anda. Sekitar 10 menit lagi sampai ya.'
        }
        if (lowerText.includes('hubungi') || lowerText.includes('telepon')) {
            return 'Baik, nanti saya hubungi saat sudah dekat lokasi.'
        }
        if (lowerText.includes('satpam') || lowerText.includes('titip')) {
            return 'Siap, nanti saya titipkan ke satpam ya.'
        }
        if (lowerText.includes('terima kasih') || lowerText.includes('makasih')) {
            return 'Sama-sama! Semoga pesanannya sesuai ya 😊'
        }
        return 'Baik, saya mengerti. Ada yang bisa dibantu lagi?'
    }

    const handleQuickReply = (text) => {
        handleSend(text)
    }

    const handleCall = () => {
        // In real app, this would trigger phone call
        toast.info(`Menghubungi ${driverInfo.name} di ${driverInfo.phone}`)
    }

    return (
        <div className="min-h-screen flex flex-col bg-background-light">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white px-4 pt-12 pb-4 border-b border-border-color">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-text-main active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>

                    {/* Driver Info */}
                    <div className="flex items-center gap-3 flex-1">
                        <img
                            src={driverInfo.photo}
                            alt={driverInfo.name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{driverInfo.name}</p>
                            <p className="text-xs text-text-secondary">{driverInfo.vehicle} • {driverInfo.plate}</p>
                        </div>
                    </div>

                    {/* Call Button */}
                    <button
                        onClick={handleCall}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-green-50 text-green-600 active:scale-95 transition-transform"
                    >
                        <span className="material-symbols-outlined">call</span>
                    </button>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.map(message => (
                    <div key={message.id}>
                        {message.type === 'system' ? (
                            <div className="flex justify-center">
                                <span className="text-xs text-text-secondary bg-gray-100 px-3 py-1 rounded-full">
                                    {message.text}
                                </span>
                            </div>
                        ) : (
                            <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] ${message.type === 'user'
                                    ? 'bg-primary text-white rounded-2xl rounded-br-md'
                                    : 'bg-white border border-border-color rounded-2xl rounded-bl-md'
                                    } px-4 py-3 shadow-sm`}>
                                    <p className="text-sm">{message.text}</p>
                                    <p className={`text-[10px] mt-1 ${message.type === 'user' ? 'text-white/70' : 'text-text-secondary'}`}>
                                        {message.time}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-border-color rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-4 pb-2">
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {quickReplies.map((reply, index) => (
                        <button
                            key={index}
                            onClick={() => handleQuickReply(reply)}
                            className="px-3 py-1.5 bg-orange-50 text-primary text-xs font-medium rounded-full whitespace-nowrap active:scale-95 transition-transform border border-primary/20"
                        >
                            {reply}
                        </button>
                    ))}
                </div>
            </div>

            {/* Input Area */}
            <div className="sticky bottom-0 bg-white border-t border-border-color p-4">
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ketik pesan..."
                        className="flex-1 px-4 py-3 bg-gray-50 rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!inputText.trim()}
                        className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ChatDriverPage
