"use client"

import { useLanguage } from "@/lib/language-context"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowRightLeft, Check, CheckCheck, Instagram, Facebook, MessageSquare, Phone, Video, Plus, MoreVertical, Search, Paperclip, Clock, AlertCircle, Zap, RotateCcw, Send, DollarSign, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { NewConversationDialog } from "@/components/chat/NewConversationDialog"

import { Composer } from "@/components/chat/Composer"
import { ContactProfilePanel } from "@/components/contact/ContactProfilePanel"
import { TransferAgentDialog } from "@/components/chat/TransferAgentDialog"
import { AudioPttBubble } from "@/components/chat/AudioPttBubble"
import { useParams } from "next/navigation"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { socketService } from "@/lib/socket-service"
import Link from "next/link"
import { SaleModal } from "@/components/sales/SaleModal"

interface Message {
    id: string | number
    text: string
    time: string
    fromMe: boolean
    isSystem?: boolean
    mediaUrl?: string
    mediaFinalUrl?: string
    mediaType?: string
    isInternal?: boolean
    isScheduled?: boolean
    scheduledTo?: Date
    isPtt?: boolean
    duration?: number
    waveform?: number[]
    senderName?: string
    status?: string // 'PENDING', 'SENT', 'DELIVERED', 'FAILED'
    content?: any // Raw content from API
    sequence?: number
    type?: string
    fileName?: string
    mimeType?: string
}

interface Sector {
    id: string
    name: string
    color: string
}

interface Contact {
    id: string
    name: string
    phone: string
    avatarUrl?: string
    handle?: string
}

interface PipelineStage {
    id: string
    name: string
    color: string
}

interface Conversation {
    id: string
    name?: string
    status: string
    avatar: string
    unread: number
    messages: Message[]
    sla: 'ok' | 'warning' | 'danger'
    sectorId?: string
    sector?: Sector
    contactId: string
    contact?: Contact
    channel?: {
        type: 'WHATSAPP' | 'INSTAGRAM' | 'MESSENGER' | 'ZAPI'
        name: string
    }
    currentStage?: PipelineStage
    agentId?: string
}

export default function InboxPage() {
    const { t } = useLanguage()
    const params = useParams()
    const workspaceId = params.workspaceId as string

    const getMessagePreview = (msg: Message | undefined) => {
        if (!msg) return "Sem mensagens";
        if (msg.isSystem) {
            return msg.text === "system:transferred" ? "Conversa transferida" : "Você entrou na conversa";
        }
        if (msg.text && msg.text !== 'Media/Unsupported Type') return msg.text;

        const type = (msg.mediaType || msg.type || '').toLowerCase();
        const mime = (msg.mimeType || '').toLowerCase();

        if (type === 'image') return '📷 Foto';
        if (type === 'video') return '🎥 Vídeo';
        if (type === 'audio' || type === 'ptt') return '🎵 Áudio';
        if (type === 'sticker' || mime.includes('webp')) return '🎨 Figurinha';
        if (type === 'document') return '📄 Documento';
        if (msg.mediaUrl) return '📎 Arquivo';

        return "Sem mensagens";
    };

    const [isTransferOpen, setIsTransferOpen] = useState(false)
    const [sectors, setSectors] = useState<Sector[]>([])
    const [selectedSector, setSelectedSector] = useState<string | null>(null)
    const [isNewChatOpen, setIsNewChatOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [availableStages, setAvailableStages] = useState<PipelineStage[]>([])
    const [showSaleModal, setShowSaleModal] = useState(false)

    // Fetch Sectors
    useEffect(() => {
        const fetchSectors = async () => {
            try {
                const { data } = await api.get(`/workspaces/${workspaceId}/sectors`)
                setSectors(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error("Failed to fetch sectors", error)
                // Fallback mock
                setSectors([
                    { id: '1', name: 'Comercial', color: '#ef4444' },
                    { id: '2', name: 'Suporte', color: '#3b82f6' }
                ])
            }
        }
        fetchSectors()
    }, [workspaceId])

    // Mock Data State
    // Real Conversations State
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [channels, setChannels] = useState<any[]>([])
    const [loadingConversations, setLoadingConversations] = useState(true)
    const [loadingChannels, setLoadingChannels] = useState(true)

    // Fetch Conversations
    const fetchConversations = async () => {
        setLoadingConversations(true)
        try {
            const { data } = await api.get(`/workspaces/${workspaceId}/conversations`)
            setConversations(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error("Failed to fetch conversations", error)
        } finally {
            setLoadingConversations(false)
        }
    }

    const fetchChannels = async () => {
        setLoadingChannels(true)
        try {
            const { data } = await api.get(`/workspaces/${workspaceId}/channels`)
            setChannels(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error("Failed to fetch channels", error)
        } finally {
            setLoadingChannels(false)
        }
    }

    useEffect(() => {
        if (workspaceId) {
            fetchConversations()
            fetchChannels()
        }
    }, [workspaceId])



    const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'me'>('all')
    const [userId, setUserId] = useState<string | null>(null); // Assuming userId is available from auth context or similar

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                setUserId(parsed.id);
            }
        } catch (e) {
            console.error("Failed to parse user for userId", e);
        }
    }, []);

    const filteredConversations = (conversations || []).filter(chat => {
        if (!chat) return false
        if (selectedSector && chat.sectorId !== selectedSector) return false
        if (filter === 'all') return true
        if (filter === 'pending') return chat.status === 'pending'
        if (filter === 'active') return chat.status === 'active'
        if (filter === 'me') return (chat.agentId === userId || !chat.agentId)
        return true
    }).filter(chat => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            chat.contact?.name?.toLowerCase().includes(searchLower) ||
            chat.contact?.phone?.includes(search) ||
            chat.contact?.handle?.toLowerCase().includes(searchLower) ||
            chat.name?.toLowerCase().includes(searchLower)
        );
    })

    const [activeChatId, setActiveChatId] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Socket.io Real-time Updates
    useEffect(() => {
        if (!workspaceId) return

        const socket = socketService.getSocket(workspaceId)

        socket.on('newMessage', (data: { conversationId: string, channelType?: string, message: Message, contact?: any }) => {
            console.log('[Socket] New message received:', data)

            // Notification logic (sound/beep)
            const isFromMe = (data.message as any).fromAgent ?? data.message.fromMe ?? false;
            if (!isFromMe) {
                try {
                    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.value = 880;
                    gain.gain.setValueAtTime(0, ctx.currentTime);
                    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
                    osc.start(ctx.currentTime);
                    osc.stop(ctx.currentTime + 0.2);
                } catch (e) { console.warn("Audio error", e); }
            }

            setConversations(prev => {
                const idx = prev.findIndex(c => String(c.id) === String(data.conversationId))
                if (idx === -1) return prev

                const conv = prev[idx]

                let content: any = {};
                try {
                    if (typeof data.message.content === 'string') {
                        content = JSON.parse(data.message.content);
                    } else if (typeof data.message.content === 'object' && data.message.content !== null) {
                        content = data.message.content;
                    }
                } catch (e) {
                    console.warn("Resilient parser: content is not JSON, treating as text", e);
                    content = { text: String(data.message.content) };
                }

                const mappedMessage: Message = {
                    ...data.message,
                    text: data.message.text || content.text || content.body || '',
                    mediaUrl: data.message.mediaFinalUrl || data.message.mediaUrl || content.mediaUrl,
                    mediaType: (data.message.type || data.message.mediaType || content.mediaType || '').toLowerCase() as any,
                    isPtt: data.message.isPtt || content.isPtt,
                    duration: data.message.duration || content.duration,
                    waveform: data.message.waveform || content.waveform,
                    fileName: data.message.fileName || content.fileName,
                    fromMe: isFromMe,
                    time: data.message.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }

                const contactUpdate = data.contact
                const safeContactUpdate = contactUpdate ? Object.fromEntries(
                    Object.entries(contactUpdate).filter(([_, v]) => v != null)
                ) : null

                const isActiveConv = String(conv.id) === String(activeChatId)
                const currentMessages = Array.isArray(conv.messages) ? conv.messages : []
                const messageExists = currentMessages.some(m => String(m.id) === String(mappedMessage.id))
                const updatedMessages = messageExists
                    ? currentMessages.map(m => String(m.id) === String(mappedMessage.id) ? mappedMessage : m)
                    : [...currentMessages, mappedMessage];

                const updatedConv: Conversation = {
                    ...conv,
                    // Priority channel identification
                    channel: data.channelType ? { ...conv.channel, type: data.channelType as any, name: conv.channel?.name || 'Canal' } as any : conv.channel,
                    // If this is the open chat, don't increment unread — clear it instead
                    unread: isActiveConv ? 0 : (conv.unread || 0) + 1,
                    messages: updatedMessages,
                    ...(safeContactUpdate ? {
                        name: (safeContactUpdate.name as string) || conv.name,
                        contact: {
                            ...(conv.contact || { id: conv.contactId, name: conv.name || '', phone: '' }),
                            ...safeContactUpdate
                        } as Contact
                    } : {})
                }

                // Float updated conversation to the TOP of the list
                const rest = prev.filter((_, i) => i !== idx)
                return [updatedConv, ...rest]
            })
        })

        socket.on('conversationTransferred', () => {
            fetchConversations() // Recarrega para atualizar status e setores
        })

        socket.on('new_conversation', (conversation: any) => {
            console.log('[Socket] New conversation received:', conversation)
            setConversations(prev => {
                // Evitar duplicatas
                if (prev.some(c => c.id === conversation.id)) return prev

                // Map the incoming raw conversation to our UI structure if needed
                const mappedConv: Conversation = {
                    ...conversation,
                    contact: conversation.contact || { id: conversation.contactId, name: 'Novo Contato' },
                    channel: conversation.channel || { type: 'WHATSAPP' as const, name: conversation.channel?.name || 'WhatsApp' },
                    messages: conversation.messages || [],
                    unread: (conversation.unread || 0) + 1
                }

                // Play notification sound for new conversation too
                try {
                    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.frequency.setValueAtTime(440, ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
                    gain.gain.setValueAtTime(0, ctx.currentTime);
                    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                    osc.start(ctx.currentTime);
                    osc.stop(ctx.currentTime + 0.5);
                } catch (e) { }

                return [mappedConv, ...prev]
            })
        })

        socket.on('conversation_stage_changed', (data: { conversationId: string, stage: any, triggeredBy?: string, automatic: boolean }) => {
            console.log('[Socket] Conversation stage changed:', data)
            setConversations(prev => prev.map(c => {
                if (c.id === data.conversationId) {
                    const updatedConv = { ...c, currentStage: data.stage }

                    if (data.automatic) {
                        const systemMsg = {
                            id: `auto-${Date.now()}`,
                            isSystem: true,
                            isAutomatic: true,
                            text: `🎯 Movido para ${data.stage.name} — gatilho: '${data.triggeredBy}'`,
                            triggeredBy: data.triggeredBy,
                            stageName: data.stage.name,
                            stageColor: data.stage.color,
                            previousStageId: c.currentStage?.id,
                            createdAt: new Date(),
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            expiresAt: Date.now() + 30000, // 30 seconds
                            fromMe: false
                        }
                        updatedConv.messages = [...(c.messages || []), systemMsg]
                    }

                    return updatedConv
                }
                return c
            }))

            if (data.automatic) {
                toast.info(`Conversa movida automaticamente para ${data.stage.name}`)
            }
        })

        socket.on('messageStatusUpdate', (data: { messageId: string, conversationId: string, status: string }) => {
            console.log('[Socket] Message status update:', data)
            setConversations(prev => {
                return prev.map(c => {
                    if (String(c.id) === String(data.conversationId)) {
                        return {
                            ...c,
                            messages: c.messages.map(m =>
                                String(m.id) === String(data.messageId) ? { ...m, status: data.status } : m
                            )
                        }
                    }
                    return c
                })
            })
        })

        return () => {
            socket.off('newMessage')
            socket.off('messageStatusUpdate')
            socket.off('conversationTransferred')
            socket.off('new_conversation')
        }
    }, [workspaceId, activeChatId])


    // Load full message history when a chat is opened
    useEffect(() => {
        if (!activeChatId || !workspaceId) return
        const loadHistory = async () => {
            try {
                const { data } = await api.get(`/workspaces/${workspaceId}/conversations/${activeChatId}`)
                setConversations(prev => prev.map(c => {
                    if (c.id === activeChatId) {
                        return {
                            ...c,
                            messages: (data.messages || []).map((m: any) => {
                                let content: any = {};
                                try {
                                    if (typeof m.content === 'string') {
                                        content = JSON.parse(m.content);
                                    } else if (typeof m.content === 'object' && m.content !== null) {
                                        content = m.content;
                                    }
                                } catch (e) {
                                    console.warn("Resilient parser: content is not JSON, treating as text", e);
                                    content = { text: String(m.content) };
                                }

                                return {
                                    ...m,
                                    text: m.text || content.text || content.body || '',
                                    mediaUrl: m.mediaFinalUrl || m.mediaUrl || content.mediaUrl,
                                    mediaType: (m.type || m.mediaType || content.mediaType || '').toLowerCase(),
                                    isPtt: m.isPtt || content.isPtt,
                                    duration: m.duration || content.duration,
                                    waveform: m.waveform || content.waveform,
                                    time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                    fromMe: m.fromAgent
                                };
                            }).sort((a: any, b: any) => {
                                // 1. Priority: Monotone sequence
                                if (a.sequence !== undefined && b.sequence !== undefined && a.sequence !== 0 && b.sequence !== 0) {
                                    return a.sequence - b.sequence;
                                }
                                // 2. Fallback: CreatedAt
                                const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
                                const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
                                return ta - tb
                            })
                        }
                    }
                    return c
                }))
            } catch (error) {
                console.error('Failed to load message history:', error)
            }
        }
        loadHistory()
    }, [activeChatId, workspaceId])

    // Carregar estágios do funil quando a conversa ativa mudar
    useEffect(() => {
        if (!activeChatId || !workspaceId) return
        const fetchPipeline = async () => {
            try {
                const conv = conversations.find(c => c.id === activeChatId)
                const { data } = await api.get(`/workspaces/${workspaceId}/pipelines/by-sector${conv?.sectorId ? `?sectorId=${conv.sectorId}` : ''}`)
                setAvailableStages(data?.stages || [])
            } catch (error) {
                console.error("Erro ao carregar estágios do funil", error)
            }
        }
        fetchPipeline()
    }, [activeChatId, workspaceId])

    const handleStageChange = async (stageId: string) => {
        if (!activeChatId || !workspaceId) return
        try {
            const { data } = await api.post(`/workspaces/${workspaceId}/pipelines/move`, {
                conversationId: activeChatId,
                stageId
            })

            // Atualizar localmente
            setConversations(prev => prev.map(c => {
                if (c.id === activeChatId) {
                    return { ...c, currentStage: data }
                }
                return c
            }))

            toast.success(`Conversa movida para: ${data.name}`)
        } catch (error) {
            console.error("Erro ao mover estágio", error)
            toast.error("Erro ao mover estágio da conversa")
        }
    }

    const activeChat = (conversations || []).find(c => c.id === activeChatId) || null

    // Auto-scroll to bottom when conversation opens or new message arrives
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [activeChatId, activeChat?.messages?.length])

    const handleResolve = async () => {
        if (!activeChat) return;
        try {
            await fetch(`/api/workspaces/${workspaceId}/conversations/${activeChat.id}/resolve`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            toast.success("Conversa finalizada!");
            setActiveChatId(null);
            fetchConversations();
        } catch (error) {
            toast.error("Erro ao finalizar conversa");
        }
    };

    const handleAcceptChat = async () => {
        if (!activeChatId) return
        setConversations(prev => prev.map(c => {
            if (c.id === activeChatId) {
                return {
                    ...c,
                    status: "active",
                    messages: [...c.messages, {
                        id: Date.now(),
                        text: "system:agent_joined",
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        fromMe: true,
                        isSystem: true
                    }]
                }
            }
            return c
        }))
    }

    const handleSendMessage = async (text: string, mediaUrl?: string, mediaType?: 'image' | 'video' | 'audio' | 'document', isInternal?: boolean, mediaMeta?: any) => {
        if (activeChatId) {
            // Optimistic Update
            // Get agent name from localStorage
            let currentUserName = "Agente";
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsed = JSON.parse(storedUser);
                    currentUserName = parsed.name || parsed.firstName || "Agente";
                }
            } catch (e) {
                console.error("Failed to parse user for senderName", e);
            }

            const tempId = Date.now().toString()
            const newMessage: Message = {
                id: tempId,
                text: text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                fromMe: true,
                senderName: currentUserName,
                mediaUrl,
                mediaType,
                isInternal,
                isPtt: mediaMeta?.isPtt,
                duration: mediaMeta?.duration,
                waveform: mediaMeta?.waveform
            }

            setConversations(prev => prev.map(c => {
                if (String(c.id) === String(activeChatId)) {
                    return {
                        ...c,
                        messages: [...c.messages, newMessage]
                    }
                }
                return c
            }))

            try {
                await api.post(`/workspaces/${workspaceId}/messages`, {
                    conversationId: activeChatId,
                    type: mediaType || 'text',
                    fromMe: true,
                    senderName: currentUserName, // Pass the sender name to the backend
                    isInternal: isInternal,
                    mediaUrl: mediaUrl,
                    mediaType: mediaType,
                    isPtt: mediaMeta?.isPtt,
                    duration: mediaMeta?.duration,
                    waveform: mediaMeta?.waveform,
                    content: {
                        body: text,
                        mediaUrl: mediaUrl,
                        mediaType: mediaType,
                        ...(mediaMeta || {})
                    },
                    isInternalNote: isInternal,
                    status: 'PENDING'
                })
            } catch (error) {
                console.error("Failed to send message:", error)
                // Optionally remove the message from state if it failed
            }
        }
    }



    const handleScheduleMessage = async (date: Date, text: string, mediaUrl?: string, mediaType?: 'image' | 'video' | 'audio' | 'document', mediaMeta?: any) => {
        if (!activeChatId) return
        // Optimistic Update
        setConversations(prev => prev.map(c => {
            if (c.id === activeChatId) {
                return {
                    ...c,
                    messages: [...c.messages, {
                        id: Date.now(),
                        text: text,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        fromMe: true,
                        mediaUrl,
                        mediaType,
                        isScheduled: true,
                        scheduledTo: date
                    }]
                }
            }
            return c
        }))

        // API Call
        try {
            await api.post(`/workspaces/${workspaceId}/scheduled-messages`, {
                conversationId: activeChatId.toString(),
                content: {
                    body: text,
                    mediaUrl,
                    mediaType,
                    ...(mediaMeta || {})
                },
                scheduledAt: date.toISOString(),
            })
        } catch (error) {
            console.error("Failed to schedule message:", error)
            // Ideally revert optimistic update here
        }
    }

    const handleTransfer = async (data: { agentId?: string, sectorId?: string, note?: string }) => {
        if (!activeChatId) return
        // In a real app, call API to transfer
        console.log(`Transferring chat ${activeChatId} targets:`, data)

        try {
            await api.post(`/workspaces/${workspaceId}/conversations/${activeChatId}/transfer`, data)

            // Update local state to show system message
            setConversations(prev => prev.map(c => {
                if (c.id === activeChatId) {
                    return {
                        ...c,
                        status: data.agentId ? c.status : 'pending', // If transferred to sector, it goes back to pending queue
                        messages: [...c.messages, {
                            id: Date.now(),
                            text: `system:transferred${data.note ? `: ${data.note}` : ""}`,
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            fromMe: true,
                            isSystem: true
                        }]
                    }
                }
                return c
            }))
        } catch (error) {
            console.error("Failed to transfer conversation:", error)
        }
    }

    if (loadingConversations) {
        return (
            <div className="flex h-[calc(100vh-theme(spacing.4))] items-center justify-center bg-white border rounded-xl shadow-sm m-2">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-red-600" />
                    <p className="text-sm text-slate-500 font-medium">Carregando conversas...</p>
                </div>
            </div>
        )
    }

    if (!conversations || conversations.length === 0) {
        const hasChannels = channels && channels.length > 0
        return (
            <div className="flex h-[calc(100vh-theme(spacing.4))] items-center justify-center bg-white border rounded-xl shadow-sm m-2 text-slate-500">
                <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-200" />
                    <p className="font-medium text-lg text-slate-400">
                        {hasChannels ? "Nenhuma conversa ativa" : "Nenhuma conversa encontrada"}
                    </p>
                    <p className="text-sm">
                        {hasChannels
                            ? "Aguardando novas mensagens dos seus canais conectados."
                            : "Conecte um canal para começar a receber mensagens."}
                    </p>
                    <div className="mt-6 flex flex-col items-center gap-3">
                        <Button onClick={() => setIsNewChatOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 font-bold px-8">
                            <Plus className="mr-2 h-5 w-5" />
                            INICIAR CONVERSA
                        </Button>
                        {!hasChannels && (
                            <Button asChild className="bg-red-600 hover:bg-red-700 font-bold">
                                <Link href={`/workspaces/${workspaceId}/integrations`}>
                                    CONECTAR CANAL
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                <NewConversationDialog
                    open={isNewChatOpen}
                    onOpenChange={setIsNewChatOpen}
                    onConversationCreated={(id) => {
                        setActiveChatId(id)
                        fetchConversations()
                    }}
                />
            </div>
        )
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
            {/* COLUMN 1: CONVERSATIONS LIST (280px) */}
            <div className="w-[320px] border-r border-[#F0F0F0] flex flex-col bg-white">
                <div className="p-6 pb-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[20px] font-semibold text-[#0F0F0F]">Inbox</h2>
                        <Button
                            variant="ghost"
                            className="h-8 gap-1.5 text-[#E8202A] hover:text-[#CC1018] hover:bg-[#FFF5F5] font-bold text-[11px]"
                            onClick={() => setShowSaleModal(true)}
                        >
                            <DollarSign className="h-3.5 w-3.5" />
                            REGISTRAR VENDA
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#F5F5F5]" onClick={() => setIsNewChatOpen(true)}>
                            <Plus className="h-5 w-5 text-[#0F0F0F]" />
                        </Button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF] stroke-[1.5px]" />
                        <Input
                            placeholder="Buscar..."
                            className="pl-9 h-9 bg-[#F5F5F5] border-none text-[13px] rounded-md focus-visible:ring-1 focus-visible:ring-[#E8202A]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4 text-[13px] font-medium border-b border-[#F0F0F0]">
                        <button
                            onClick={() => setFilter('pending')}
                            className={cn("pb-2 px-1 relative transition-colors", filter === 'pending' ? "text-[#0F0F0F]" : "text-[#6B6B6B] hover:text-[#0F0F0F]")}
                        >
                            Pendentes
                            {filter === 'pending' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E8202A] animate-in fade-in duration-300" />}
                        </button>
                        <button
                            onClick={() => setFilter('active')}
                            className={cn("pb-2 px-1 relative transition-colors", filter === 'active' ? "text-[#0F0F0F]" : "text-[#6B6B6B] hover:text-[#0F0F0F]")}
                        >
                            Atendendo
                            {filter === 'active' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E8202A] animate-in fade-in duration-300" />}
                        </button>
                        <button
                            onClick={() => setFilter('all')}
                            className={cn("pb-2 px-1 relative transition-colors", filter === 'all' ? "text-[#0F0F0F]" : "text-[#6B6B6B] hover:text-[#0F0F0F]")}
                        >
                            Todos
                            {filter === 'all' && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E8202A] animate-in fade-in duration-300" />}
                        </button>
                    </div>

                    {/* Sector Filters (Chips) */}
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        <button
                            onClick={() => setSelectedSector(null)}
                            className={cn(
                                "h-7 px-3 text-[11px] font-bold rounded-full border transition-all whitespace-nowrap",
                                !selectedSector ? "bg-[#0F0F0F] text-white border-[#0F0F0F]" : "bg-white text-[#6B6B6B] border-[#F0F0F0] hover:bg-[#F5F5F5]"
                            )}
                        >
                            Todos
                        </button>
                        {sectors.map(sector => (
                            <button
                                key={sector.id}
                                onClick={() => setSelectedSector(sector.id)}
                                className={cn(
                                    "h-7 px-3 text-[11px] font-bold rounded-full border transition-all whitespace-nowrap",
                                    selectedSector === sector.id ? "bg-[#0F0F0F] text-white border-[#0F0F0F]" : "bg-white text-[#6B6B6B] border-[#F0F0F0] hover:bg-[#F5F5F5]"
                                )}
                            >
                                {sector.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {filteredConversations.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => setActiveChatId(chat.id)}
                            className={cn(
                                "px-6 py-4 cursor-pointer transition-all border-b border-[#F0F0F0] relative",
                                activeChatId === chat.id ? 'bg-[#F5F5F5]' : 'bg-white hover:bg-[#FAFAFA]'
                            )}
                        >
                            {activeChatId === chat.id && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#E8202A]" />}

                            <div className="flex gap-3">
                                <div className="relative flex-shrink-0">
                                    <Avatar className="h-10 w-10 border border-[#F0F0F0]">
                                        <AvatarImage src={chat.contact?.avatarUrl || chat.avatar} />
                                        <AvatarFallback className="bg-[#F5F5F5] text-[#0F0F0F] font-bold">
                                            {(chat.contact?.name || chat?.name || "?").substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-[#F0F0F0]">
                                        <div className="w-3 h-3 flex items-center justify-center">
                                            {chat.channel?.type === 'INSTAGRAM' && <Instagram className="h-2 w-2 text-pink-500" />}
                                            {chat.channel?.type === 'MESSENGER' && <Facebook className="h-2 w-2 text-blue-500" />}
                                            {(chat.channel?.type === 'WHATSAPP' || chat.channel?.type === 'ZAPI') && <MessageSquare className="h-2 w-2 text-[#16A34A]" />}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="text-[13px] font-semibold text-[#0F0F0F] truncate">
                                            {chat.contact?.name || chat?.contact?.phone || "Sem nome"}
                                        </h3>
                                        <span className="text-[11px] text-[#9CA3AF]">
                                            {chat?.messages?.[chat?.messages?.length - 1]?.time || ""}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mt-0.5">
                                        <p className="text-[12px] text-[#6B6B6B] truncate pr-4">
                                            {getMessagePreview(chat?.messages?.[chat?.messages?.length - 1])}
                                        </p>
                                        {chat.unread > 0 && (
                                            <div className="h-4 w-4 rounded-full bg-[#E8202A] text-[10px] font-bold text-white flex items-center justify-center">
                                                {chat.unread}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* COLUMN 2: CHAT AREA (Flex-1) */}
            <div className="flex-1 flex flex-col bg-[#F9FAFB]">
                {activeChat ? (
                    <>
                        <div className="h-14 bg-white border-b border-[#F0F0F0] flex items-center justify-between px-6 z-10 shrink-0">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 border border-[#F0F0F0]">
                                    <AvatarImage src={activeChat?.contact?.avatarUrl} />
                                    <AvatarFallback className="bg-[#F5F5F5] text-[#0F0F0F] font-bold text-[10px]">
                                        {(activeChat?.contact?.name || "?").substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <h2 className="text-[13px] font-semibold text-[#0F0F0F] flex items-center gap-2">
                                        {activeChat?.contact?.name || "Sem nome"}
                                        <span className="text-[10px] px-1.5 py-0.25 bg-[#F5F5F5] text-[#6B6B6B] rounded-full border border-[#F0F0F0]">Aguardando</span>
                                    </h2>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    className="h-8 text-[11px] font-bold text-[#E8202A] hover:text-[#CC1018] hover:bg-[#FFF5F5]"
                                    onClick={() => setShowSaleModal(true)}
                                >
                                    <DollarSign className="mr-2 h-3.5 w-3.5" /> Registrar Venda
                                </Button>
                                <Button variant="ghost" className="h-8 text-[11px] font-bold text-[#6B6B6B] hover:text-[#0F0F0F] hover:bg-[#F5F5F5]" onClick={() => setIsTransferOpen(true)}>
                                    <ArrowRightLeft className="mr-2 h-3.5 w-3.5" /> Transferir
                                </Button>
                                <Button variant="outline" className="h-8 text-[11px] font-bold text-[#16A34A] border-[#DCFCE7] hover:bg-[#F0FDF4] transition-all" onClick={handleResolve}>
                                    <CheckCheck className="mr-2 h-3.5 w-3.5" /> Resolver
                                </Button>
                            </div>
                        </div>

                        {/* MESSAGES AREA */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {(activeChat?.messages || []).map((msg) => {
                                if (msg.isSystem) {
                                    return (
                                        <div key={msg.id} className="flex justify-center">
                                            <span className="text-[11px] font-medium text-[#9CA3AF] bg-white px-3 py-1 rounded-full border border-[#F0F0F0]">
                                                {msg.text === "system:agent_joined" ? "Você assumiu este atendimento" : msg.text}
                                            </span>
                                        </div>
                                    );
                                }

                                const isInternal = msg.isInternal;
                                const fromMe = msg.fromMe;

                                return (
                                    <div key={msg.id} className={cn("flex flex-col group", fromMe ? "items-end" : "items-start")}>
                                        <div className={cn(
                                            "max-w-[70%] p-3 text-[13px] leading-relaxed shadow-none",
                                            isInternal
                                                ? "bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] rounded-lg"
                                                : fromMe
                                                    ? "bg-[#0F0F0F] text-white rounded-[12px_12px_0_12px]"
                                                    : "bg-white text-[#0F0F0F] border border-[#F0F0F0] rounded-[0_12px_12px_12px]"
                                        )}>
                                            {isInternal && <p className="text-[10px] font-bold uppercase mb-1 opacity-60 tracking-wider">Nota Interna</p>}
                                            {msg.text}
                                            <div className={cn("flex items-center gap-1 mt-1 justify-end opacity-60 text-[10px]", fromMe ? "text-white/80" : "text-[#9CA3AF]")}>
                                                {msg.time}
                                                {fromMe && !isInternal && <CheckCheck className="h-3 w-3" />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* INPUT AREA */}
                        <div className="bg-white border-t border-[#F0F0F0] p-4">
                            {activeChat.status === 'pending' ? (
                                <div className="flex flex-col items-center gap-3 py-4">
                                    <p className="text-[12px] text-[#6B6B6B]">Essa conversa ainda não foi aceita.</p>
                                    <Button onClick={handleAcceptChat} className="bg-[#000000] hover:bg-[#1a1a1a] text-white text-[12px] font-bold h-10 px-8">
                                        ACEITAR CONVERSA
                                    </Button>
                                </div>
                            ) : (
                                <Composer onSendMessage={handleSendMessage} onScheduleMessage={handleScheduleMessage} />
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#9CA3AF] space-y-3">
                        <div className="p-4 bg-white rounded-full border border-[#F0F0F0] shadow-sm">
                            <MessageSquare className="h-6 w-6 stroke-[1.5px]" />
                        </div>
                        <p className="text-[13px] font-medium">Selecione uma conversa para começar</p>
                    </div>
                )}
            </div>

            {/* COLUMN 3: PROFILE (280px) */}
            {activeChat && (
                <div className="w-[300px] border-l border-[#F0F0F0] bg-white flex flex-col overflow-y-auto no-scrollbar">
                    <div className="p-8 flex flex-col items-center text-center border-b border-[#F0F0F0]">
                        <Avatar className="h-20 w-20 mb-4 border-2 border-[#F5F5F5]">
                            <AvatarImage src={activeChat?.contact?.avatarUrl} />
                            <AvatarFallback className="text-xl bg-[#F5F5F5] text-[#0F0F0F] font-bold">
                                {(activeChat?.contact?.name || "?").substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <h2 className="text-[16px] font-semibold text-[#0F0F0F]">{activeChat?.contact?.name || "Sem nome"}</h2>
                        <p className="text-[12px] text-[#6B6B6B] mt-1">{activeChat?.contact?.phone || "Sem telefone"}</p>
                    </div>

                    <div className="p-6 space-y-6 text-[13px]">
                        <div>
                            <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-3">Informações</p>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-[#6B6B6B]">Canal</span>
                                    <span className="font-medium text-[#0F0F0F]">{activeChat?.channel?.name || "WhatsApp"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#6B6B6B]">Setor</span>
                                    <span className="font-medium text-[#0F0F0F]">{activeChat?.sector?.name || "Vendas"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#6B6B6B]">Tags</span>
                                    <div className="flex gap-1">
                                        <span className="px-2 py-0.5 bg-[#F5F5F5] rounded text-[10px] font-bold text-[#0F0F0F]">VIP</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-[#F0F0F0]">
                            <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-3">CRM</p>
                            <div className="p-4 bg-[#F5F5F5] rounded-lg">
                                <p className="text-[12px] font-semibold text-[#0F0F0F]">Oportunidade Aberta</p>
                                <p className="text-[11px] text-[#6B6B6B] mt-1">Status: Negociação</p>
                                <p className="text-[11px] text-[#E8202A] font-bold mt-2 hover:underline cursor-pointer">Ver no Funil →</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <TransferAgentDialog open={isTransferOpen} onOpenChange={setIsTransferOpen} onTransfer={handleTransfer} />
            <NewConversationDialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen} onConversationCreated={(id) => { setActiveChatId(id); fetchConversations(); }} />

            {activeChat && (
                <SaleModal
                    isOpen={showSaleModal}
                    onClose={() => setShowSaleModal(false)}
                    workspaceId={workspaceId}
                    contactId={activeChat.contactId}
                    conversationId={activeChat.id}
                    onSuccess={(sale) => {
                        // Refresh contact labels/history if needed
                        fetchConversations()
                    }}
                />
            )}
        </div>
    );
}
