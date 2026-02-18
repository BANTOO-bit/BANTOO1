import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { chatService } from '../../../services/chatService'
import { supabase } from '../../../services/supabaseClient'

const quickReplies = [
    'Sudah sampai mana pak?',
    'Tolong hubungi saya ya',
    'Titip di satpam saja',
    'Terima kasih banyak!'
]

function ChatDriverPage() {
    const { orderId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [messages, setMessages] = useState([])
    const [inputText, setInputText] = useState('')
    const [sending, setSending] = useState(false)
    const [driverInfo, setDriverInfo] = useState(null)
    const [loading, setLoading] = useState(true)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Fetch order info + driver details
    useEffect(() => {
        if (!orderId) return

        const fetchOrderInfo = async () => {
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select(`
                        id, status, driver_id,
                        drivers:driver_id (
                            vehicle_plate, vehicle_brand,
                            profile:user_id (full_name, avatar_url, phone)
                        )
                    `)
                    .eq('id', orderId)
                    .single()

                if (!error && data?.drivers) {
                    setDriverInfo({
                        name: data.drivers.profile?.full_name || 'Driver',
                        phone: data.drivers.profile?.phone || '-',
                        avatar: data.drivers.profile?.avatar_url,
                        vehicle: data.drivers.vehicle_brand || 'Motor',
                        plate: data.drivers.vehicle_plate || '-'
                    })
                }
            } catch (err) {
                console.error('Error fetching order info:', err)
            }
        }

        fetchOrderInfo()
    }, [orderId])

    // Fetch messages + subscribe to realtime
    useEffect(() => {
        if (!orderId || !user?.id) return

        const loadMessages = async () => {
            setLoading(true)
            const msgs = await chatService.getMessages(orderId)
            setMessages(msgs)
            setLoading(false)

            // Mark driver messages as read
            await chatService.markAsRead(orderId, 'customer')
        }

        loadMessages()

        // Subscribe to new messages
        const unsubscribe = chatService.subscribeToMessages(orderId, (newMsg) => {
            setMessages(prev => {
                // Avoid duplicates
                if (prev.find(m => m.id === newMsg.id)) return prev
                return [...prev, newMsg]
            })

            // Mark as read if from driver
            if (newMsg.sender_role === 'driver') {
                chatService.markAsRead(orderId, 'customer')
            }
        })

        return () => unsubscribe()
    }, [orderId, user?.id])

    const handleSend = async (text = inputText) => {
        if (!text.trim() || sending) return

        setSending(true)
        setInputText('')

        try {
            await chatService.sendMessage(orderId, text, 'customer')
        } catch (error) {
            console.error('Failed to send message:', error)
            setInputText(text) // Restore on failure
        } finally {
            setSending(false)
        }
    }

    const handleCall = () => {
        if (driverInfo?.phone && driverInfo.phone !== '-') {
            window.open(`tel:${driverInfo.phone}`, '_self')
        }
    }

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        })
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
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                            {driverInfo?.avatar ? (
                                <img src={driverInfo.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-primary">person</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{driverInfo?.name || 'Driver'}</p>
                            <p className="text-xs text-text-secondary">
                                {driverInfo?.vehicle || 'Motor'} • {driverInfo?.plate || '-'}
                            </p>
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
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
                        <span className="material-symbols-outlined text-4xl mb-2">chat_bubble_outline</span>
                        <p className="text-sm">Belum ada pesan</p>
                        <p className="text-xs">Kirim pesan ke driver Anda</p>
                    </div>
                ) : (
                    messages.map(msg => (
                        <div key={msg.id}>
                            <div className={`flex ${msg.sender_role === 'customer' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] ${msg.sender_role === 'customer'
                                    ? 'bg-primary text-white rounded-2xl rounded-br-md'
                                    : 'bg-white border border-border-color rounded-2xl rounded-bl-md'
                                    } px-4 py-3 shadow-sm`}>
                                    <p className="text-sm">{msg.message}</p>
                                    <div className={`flex items-center gap-1 mt-1 ${msg.sender_role === 'customer' ? 'justify-end' : ''}`}>
                                        <p className={`text-[10px] ${msg.sender_role === 'customer' ? 'text-white/70' : 'text-text-secondary'}`}>
                                            {formatTime(msg.created_at)}
                                        </p>
                                        {msg.sender_role === 'customer' && (
                                            <span className={`material-symbols-outlined text-[12px] ${msg.is_read ? 'text-blue-200' : 'text-white/50'}`}>
                                                done_all
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-4 pb-2">
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {quickReplies.map((reply, index) => (
                        <button
                            key={index}
                            onClick={() => handleSend(reply)}
                            disabled={sending}
                            className="px-3 py-1.5 bg-orange-50 text-primary text-xs font-medium rounded-full whitespace-nowrap active:scale-95 transition-transform border border-primary/20 disabled:opacity-50"
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
                        disabled={!inputText.trim() || sending}
                        className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined">{sending ? 'hourglass_top' : 'send'}</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ChatDriverPage
