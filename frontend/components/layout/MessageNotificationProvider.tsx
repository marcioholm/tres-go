"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { socketService } from "@/lib/socket-service"
import { useParams, useRouter } from "next/navigation"
import { MessageCircle, X, Volume2, VolumeX } from "lucide-react"

interface Notification {
    id: string
    contactName: string
    message: string
    conversationId: string
    channelType: string
    timestamp: number
}

const SOUND_URL = "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCIiIiIiIjAwMDAwMD4+Pj4+PkxMTExMTFpaWlpaWmhoaGhoaHZ2dnZ2doSEhISEhJKSkpKSkqCgoKCgoK6urq6urrAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+1BkAAAC0ANItAAAABgAAA0gAAABAQEBBAIAoAQAAAAAE2WgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"

export function MessageNotificationProvider({ children }: { children: React.ReactNode }) {
    const params = useParams()
    const router = useRouter()
    const workspaceId = params?.workspaceId as string
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [soundEnabled, setSoundEnabled] = useState(true)
    const audioRef = useRef<AudioContext | null>(null)
    const [visible, setVisible] = useState(false)

    // Play a subtle notification beep using Web Audio API
    const playNotificationSound = useCallback(() => {
        if (!soundEnabled) return
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()

            // First beep
            const osc1 = ctx.createOscillator()
            const gain1 = ctx.createGain()
            osc1.connect(gain1)
            gain1.connect(ctx.destination)
            osc1.frequency.value = 880
            gain1.gain.setValueAtTime(0, ctx.currentTime)
            gain1.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01)
            gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
            osc1.start(ctx.currentTime)
            osc1.stop(ctx.currentTime + 0.2)

            // Second beep
            const osc2 = ctx.createOscillator()
            const gain2 = ctx.createGain()
            osc2.connect(gain2)
            gain2.connect(ctx.destination)
            osc2.frequency.value = 1100
            gain2.gain.setValueAtTime(0, ctx.currentTime + 0.25)
            gain2.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.26)
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
            osc2.start(ctx.currentTime + 0.25)
            osc2.stop(ctx.currentTime + 0.5)
        } catch (e) {
            console.warn("[Notifications] Audio not available:", e)
        }
    }, [soundEnabled])

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }, [])

    useEffect(() => {
        if (!workspaceId || workspaceId === 'default') return

        const socket = socketService.getSocket(workspaceId)

        const handleNewMessage = (data: any) => {
            // Don't notify for messages sent by agents
            if (data.direction === 'outbound' || data.fromMe) return

            const notification: Notification = {
                id: `${Date.now()}-${Math.random()}`,
                contactName: data.contact?.name || data.contactName || 'Contato',
                message: data.content?.text || data.body || data.message || 'Nova mensagem',
                conversationId: data.conversationId,
                channelType: data.channelType || 'WHATSAPP',
                timestamp: Date.now(),
            }

            setNotifications(prev => [...prev.slice(-4), notification]) // Max 5 at once
            setVisible(true)
            playNotificationSound()

            // Browser notification (if permitted)
            if (Notification.permission === 'granted') {
                const n = new Notification(`💬 ${notification.contactName}`, {
                    body: notification.message,
                    icon: '/favicon.ico',
                    tag: notification.id,
                    silent: true, // We handle sound ourselves
                })
                n.onclick = () => {
                    window.focus()
                    router.push(`/workspaces/${workspaceId}/inbox?conversation=${notification.conversationId}`)
                    n.close()
                }
            }

            // Auto-dismiss after 6 seconds
            setTimeout(() => removeNotification(notification.id), 6000)
        }

        socket.on('new_message', handleNewMessage)
        socket.on('message', handleNewMessage)
        socket.on('conversation:new_message', handleNewMessage)

        // Request browser notification permission
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }

        return () => {
            socket.off('new_message', handleNewMessage)
            socket.off('message', handleNewMessage)
            socket.off('conversation:new_message', handleNewMessage)
        }
    }, [workspaceId, playNotificationSound, removeNotification, router])

    const channelIcon = (type: string) => {
        if (type === 'INSTAGRAM') return '📸'
        if (type === 'MESSENGER') return '💬'
        return '📲'
    }

    return (
        <>
            {children}

            {/* Sound toggle button */}
            <button
                onClick={() => setSoundEnabled(prev => !prev)}
                className="fixed bottom-4 right-4 z-40 h-9 w-9 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all hover:scale-110"
                title={soundEnabled ? "Desativar som" : "Ativar som"}
            >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            {/* Notification stack */}
            <div className="fixed bottom-16 right-4 z-50 flex flex-col-reverse gap-2 pointer-events-none w-80">
                {notifications.map((n, idx) => (
                    <div
                        key={n.id}
                        className="pointer-events-auto bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex items-start gap-3 animate-in slide-in-from-right-4 duration-300"
                        style={{ opacity: 1 - idx * 0.08 }}
                    >
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-lg">
                            {channelIcon(n.channelType)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <p className="font-bold text-slate-900 text-sm truncate">{n.contactName}</p>
                                <span className="text-[10px] text-slate-400 whitespace-nowrap flex-shrink-0">
                                    {new Date(n.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p className="text-slate-500 text-xs mt-0.5 truncate">{n.message}</p>
                            <button
                                onClick={() => {
                                    router.push(`/workspaces/${workspaceId}/inbox?conversation=${n.conversationId}`)
                                    removeNotification(n.id)
                                }}
                                className="mt-2 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                            >
                                VER CONVERSA →
                            </button>
                        </div>
                        <button
                            onClick={() => removeNotification(n.id)}
                            className="flex-shrink-0 h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                        >
                            <X className="h-3 w-3 text-slate-500" />
                        </button>
                    </div>
                ))}
            </div>
        </>
    )
}
