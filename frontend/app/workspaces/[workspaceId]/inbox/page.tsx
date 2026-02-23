"use client"

import { useLanguage } from "@/lib/language-context"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Search, MoreVertical, Phone, Video, CheckCheck, Check, Paperclip, Mic, Send, ArrowRightLeft, Clock, MessageSquare, Instagram, Facebook, AlertCircle } from "lucide-react"
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

interface Message {
    id: string | number
    text: string
    time: string
    fromMe: boolean
    isSystem?: boolean
    mediaUrl?: string
    mediaType?: 'image' | 'video' | 'audio' | 'document'
    isInternal?: boolean
    isScheduled?: boolean
    scheduledTo?: Date
    isPtt?: boolean
    duration?: number
    waveform?: number[]
    senderName?: string
    status?: string // 'PENDING', 'SENT', 'DELIVERED', 'FAILED'
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
}

export default function InboxPage() {
    const { t } = useLanguage()
    const params = useParams()
    const workspaceId = params.workspaceId as string
    const [isTransferOpen, setIsTransferOpen] = useState(false)
    const [sectors, setSectors] = useState<Sector[]>([])
    const [selectedSector, setSelectedSector] = useState<string | null>(null)
    const [isNewChatOpen, setIsNewChatOpen] = useState(false)

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
    const [loadingConversations, setLoadingConversations] = useState(true)

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

    useEffect(() => {
        if (workspaceId) fetchConversations()
    }, [workspaceId])



    const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all')

    const filteredConversations = (conversations || []).filter(c => {
        if (!c) return false
        if (selectedSector && c.sectorId !== selectedSector) return false
        if (filter === 'all') return true
        return c.status === filter
    })

    const [activeChatId, setActiveChatId] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Socket.io Real-time Updates
    useEffect(() => {
        if (!workspaceId) return

        const socket = socketService.getSocket(workspaceId)

        socket.on('newMessage', (data: { conversationId: string, message: Message }) => {
            console.log('[Socket] New message received:', data)
            setConversations(prev => prev.map(conv => {
                if (String(conv.id) === String(data.conversationId)) {
                    // Mapear mensagem para garantir que tenha o campo 'text' e 'fromMe'
                    const mappedMessage: Message = {
                        ...data.message,
                        text: data.message.text || (data.message as any).content?.text || (data.message as any).content?.body || (data.message as any).content || '',
                        fromMe: (data.message as any).fromAgent ?? data.message.fromMe ?? false,
                        time: data.message.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }

                    // Update contact info if provided in the socket payload
                    const contactUpdate = (data as any).contact

                    // CRITICAL FIX: filter out null values from contactUpdate to avoid overriding valid data with null (causing crashes in rendering)
                    const safeContactUpdate = contactUpdate ? Object.fromEntries(
                        Object.entries(contactUpdate).filter(([_, v]) => v != null)
                    ) : null;

                    // Building the updated conversation explicitly to satisfy TypeScript
                    const updatedConv: Conversation = {
                        ...conv,
                        unread: String(conv.id) === String(activeChatId) ? conv.unread : conv.unread + 1,
                    };

                    if (safeContactUpdate) {
                        updatedConv.name = (safeContactUpdate.name as string) || conv.name;
                        updatedConv.contact = {
                            ...(conv.contact || { id: conv.contactId, name: conv.name || '', phone: '' }),
                            ...safeContactUpdate
                        } as Contact;
                    }

                    // Evitar duplicatas (guard against undefined messages array)
                    const currentMessages = Array.isArray(conv.messages) ? conv.messages : []
                    const messageExists = currentMessages.some(m => String(m.id) === String(mappedMessage.id))

                    return {
                        ...updatedConv,
                        messages: messageExists ? currentMessages : [...currentMessages, mappedMessage]
                    } as Conversation
                }
                return conv
            }))
        })

        socket.on('conversationTransferred', () => {
            fetchConversations() // Recarrega para atualizar status e setores
        })

        socket.on('new_conversation', (conversation: Conversation) => {
            console.log('[Socket] New conversation received:', conversation)
            setConversations(prev => {
                // Evitar duplicatas
                if (prev.some(c => c.id === conversation.id)) return prev
                return [conversation, ...prev]
            })
        })

        return () => {
            socket.off('newMessage')
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
                            messages: (data.messages || []).map((m: any) => ({
                                ...m,
                                text: m.text || (typeof m.content === 'string' ? m.content : m.content?.text || m.content?.body || ''),
                                time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                fromMe: m.fromAgent
                            })).sort((a: any, b: any) => {
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

    const activeChat = (conversations || []).find(c => c.id === activeChatId) || null

    // Auto-scroll to bottom when conversation opens or new message arrives
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [activeChatId, activeChat?.messages?.length])

    const handleAcceptChat = () => {
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
        return (
            <div className="flex h-[calc(100vh-theme(spacing.4))] items-center justify-center bg-white border rounded-xl shadow-sm m-2 text-slate-500">
                <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-200" />
                    <p className="font-medium text-lg text-slate-400">Nenhuma conversa encontrada</p>
                    <p className="text-sm">Conecte um canal para começar a receber mensagens.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-[calc(100vh-theme(spacing.4))] overflow-hidden bg-white border rounded-xl shadow-sm m-2">
            {/* Left Pane: Chat List */}
            <div className="w-80 border-r flex flex-col bg-slate-50/50">
                <div className="p-3 border-b bg-white space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-lg text-slate-800">{t("inbox")}</h2>
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsNewChatOpen(true)}><Plus className="h-5 w-5 text-red-600" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input placeholder="Pesquisar..." className="pl-9 bg-slate-100 border-none focus-visible:ring-red-500" />
                    </div>
                    <div className="flex gap-2 text-sm overflow-x-auto pb-1 scrollbar-hide">
                        <Badge
                            variant={filter === 'pending' ? "default" : "outline"}
                            className={`cursor-pointer ${filter === 'pending' ? 'bg-red-600 hover:bg-red-700' : 'bg-white hover:bg-slate-50'}`}
                            onClick={() => setFilter('pending')}
                        >
                            Pendentes
                        </Badge>
                        <Badge
                            variant={filter === 'active' ? "default" : "outline"}
                            className={`cursor-pointer ${filter === 'active' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white hover:bg-slate-50'}`}
                            onClick={() => setFilter('active')}
                        >
                            Atendendo
                        </Badge>
                        <Badge
                            variant={filter === 'all' ? "default" : "outline"}
                            className={`cursor-pointer ${filter === 'all' ? 'bg-slate-800 hover:bg-slate-900' : 'bg-white hover:bg-slate-50'}`}
                            onClick={() => setFilter('all')}
                        >
                            Todos
                        </Badge>
                    </div>

                    {/* Sector Filter */}
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide pt-2 border-t mt-2">
                        <Badge
                            variant={!selectedSector ? "secondary" : "outline"}
                            className="cursor-pointer whitespace-nowrap"
                            onClick={() => setSelectedSector(null)}
                        >
                            Todos os Setores
                        </Badge>
                        {sectors.map(sector => (
                            <Badge
                                key={sector.id}
                                variant="outline"
                                className={cn(
                                    "cursor-pointer whitespace-nowrap border-l-4",
                                    selectedSector === sector.id ? "bg-slate-100" : ""
                                )}
                                style={{ borderLeftColor: sector.color }}
                                onClick={() => setSelectedSector(sector.id)}
                            >
                                {sector.name}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.map((chat) => {
                        const channelType = chat.channel?.type || 'WHATSAPP'
                        const getIcon = () => {
                            switch (channelType) {
                                case 'INSTAGRAM': return <Instagram className="h-3 w-3 text-pink-500" />
                                case 'MESSENGER': return <Facebook className="h-3 w-3 text-blue-500" />
                                default: return <MessageSquare className="h-3 w-3 text-emerald-500" />
                            }
                        }

                        return (
                            <div
                                key={chat.id}
                                onClick={() => setActiveChatId(chat.id)}
                                className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-slate-100 transition-colors border-b border-slate-50 ${activeChatId === chat.id ? 'bg-red-50/50 border-l-4 border-l-red-600' : ''}`}
                            >
                                <div className="relative">
                                    <Avatar>
                                        <AvatarImage src={chat.contact?.avatarUrl || chat.avatar} />
                                        <AvatarFallback className="bg-red-100 text-red-600 font-medium">{(chat.contact?.name || chat?.name || "?").substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    {/* Channel Icon Overlay */}
                                    <div className="absolute -bottom-1 -left-1 bg-white rounded-full p-0.5 shadow-sm border border-slate-100">
                                        {getIcon()}
                                    </div>
                                    {/* SLA Indicator */}
                                    <div className={cn(
                                        "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white",
                                        chat.sla === 'danger' ? "bg-red-500" :
                                            chat.sla === 'warning' ? "bg-yellow-500" : "bg-emerald-500"
                                    )} title="Status SLA" />
                                    {chat.sector && (
                                        <div
                                            className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white"
                                            style={{ backgroundColor: chat.sector.color }}
                                            title={`Setor: ${chat.sector.name}`}
                                        />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-semibold text-sm text-slate-900 truncate">
                                            {chat.contact?.handle ? `@${chat.contact.handle}` : (chat.contact?.name || chat?.contact?.phone || chat?.name || "Sem nome")}
                                        </h3>
                                        <span className="text-xs text-slate-500">{chat?.messages?.[(chat?.messages?.length || 0) - 1]?.time || ""}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">
                                        {chat?.messages?.[(chat?.messages?.length || 0) - 1]?.isSystem ?
                                            (chat?.messages?.[(chat?.messages?.length || 0) - 1]?.text === "system:transferred" ? "Conversa transferida" : "Você entrou na conversa")
                                            : (chat?.messages?.[(chat?.messages?.length || 0) - 1]?.text || "Sem mensagens")}
                                    </p>
                                </div>
                                {chat.unread > 0 && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                                        {chat.unread}
                                    </span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Middle Pane: Chat Window */}
            <div className="flex-1 flex flex-col bg-[#F3F4F6]">
                {activeChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 border-b bg-white flex items-center justify-between px-6 shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={activeChat?.contact?.avatarUrl || activeChat.avatar} />
                                    <AvatarFallback className="bg-red-100 text-red-600">
                                        {(activeChat?.contact?.name || activeChat?.name || "?").substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="font-bold text-sm text-slate-900 group flex items-center gap-2">
                                        {activeChat?.contact?.name || activeChat?.contact?.phone || activeChat?.name || "Sem nome"}
                                        {activeChat?.channel?.type === 'INSTAGRAM' && <Instagram className="h-3 w-3 text-pink-500" />}
                                        {activeChat?.channel?.type === 'MESSENGER' && <Facebook className="h-3 w-3 text-blue-500" />}
                                        {(activeChat?.channel?.type === 'WHATSAPP' || activeChat?.channel?.type === 'ZAPI') && <MessageSquare className="h-3 w-3 text-emerald-500" />}

                                        {activeChat?.contact?.handle && (
                                            <span className="text-[10px] font-normal text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                                @{activeChat.contact.handle}
                                            </span>
                                        )}
                                    </h2>
                                    <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                        <span className="block h-2 w-2 rounded-full bg-emerald-500" />
                                        Online
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                                <Button variant="ghost" size="icon"><Phone className="h-5 w-5" /></Button>
                                <Button variant="ghost" size="icon"><Video className="h-5 w-5" /></Button>
                                <div className="h-6 w-px bg-slate-200 mx-2" />
                                <Button
                                    variant="ghost"
                                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                    onClick={() => setIsTransferOpen(true)}
                                >
                                    <ArrowRightLeft className="mr-2 h-4 w-4" /> Transferir
                                </Button>
                                <Button variant="outline" className="ml-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700">
                                    <CheckCheck className="mr-2 h-4 w-4" /> Resolver
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="flex justify-center">
                                <span className="bg-white/60 px-3 py-1 rounded-full text-xs text-slate-500 font-medium shadow-sm">Hoje</span>
                            </div>

                            {(activeChat?.messages || []).map((msg) => {
                                if (msg.isSystem) {
                                    return (
                                        <div key={msg.id} className="flex justify-center my-4">
                                            <span className="bg-slate-200/80 px-3 py-1 rounded text-xs text-slate-500 font-medium">
                                                {msg.text === "system:agent_joined" ? `Você assumiu este atendimento - ${msg.time}` :
                                                    msg.text === "system:transferred" ? `Atendimento transferido - ${msg.time}` : msg.text}
                                            </span>
                                        </div>
                                    )
                                }

                                return (
                                    <div key={msg.id} className={`flex flex-col gap-1 ${msg.fromMe ? 'items-end' : 'items-start'}`}>
                                        {msg.fromMe && (msg as any).senderName && (
                                            <span className="text-[10px] text-slate-400 font-medium px-1 mb-0.5">
                                                {(msg as any).senderName}
                                            </span>
                                        )}
                                        <div className={`p-3 rounded-2xl shadow-sm max-w-[75%] text-sm relative group overflow-hidden ${msg.isInternal
                                            ? 'bg-yellow-100 text-yellow-900 border border-yellow-200'
                                            : msg.fromMe
                                                ? 'bg-red-600 text-white rounded-br-sm'
                                                : 'bg-white text-slate-800 rounded-bl-sm'
                                            } ${msg.isScheduled ? 'border-2 border-dashed border-slate-300 opacity-80 bg-slate-50 text-slate-600' : ''}`}>

                                            {msg.isInternal && (
                                                <div className="flex items-center gap-1 mb-1 opacity-70 border-b border-yellow-200 pb-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Nota Interna</span>
                                                </div>
                                            )}

                                            {msg.isScheduled && (
                                                <div className="flex items-center gap-1 mb-1 opacity-70 border-b border-slate-200 pb-1 text-slate-500">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                        Agendado para {msg.scheduledTo?.toLocaleDateString()} às {msg.scheduledTo?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            )}

                                            {msg.mediaUrl && (
                                                <div className="mb-2 rounded-lg overflow-hidden">
                                                    {msg.mediaType === 'image' && (
                                                        <img src={msg.mediaUrl} alt="Attachment" className="max-w-full h-auto object-cover max-h-[300px]" />
                                                    )}
                                                    {msg.mediaType === 'video' && (
                                                        <video src={msg.mediaUrl} controls className="max-w-full max-h-[300px]" />
                                                    )}
                                                    {msg.mediaType === 'audio' && (
                                                        msg.isPtt ? (
                                                            <AudioPttBubble
                                                                message={{
                                                                    id: msg.id as number,
                                                                    content: { mediaUrl: msg.mediaUrl, waveform: msg.waveform, duration: msg.duration }
                                                                }}
                                                                fromAgent={msg.fromMe}
                                                            />
                                                        ) : (
                                                            <audio src={msg.mediaUrl} controls className="max-w-full" />
                                                        )
                                                    )}
                                                    {msg.mediaType === 'document' && (
                                                        <a href={msg.mediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-black/10 rounded-lg hover:bg-black/20 transition-colors">
                                                            <Paperclip className="h-5 w-5" />
                                                            <span className="underline">Ver Documento</span>
                                                        </a>
                                                    )}
                                                </div>
                                            )}

                                            <p className="whitespace-pre-wrap">{msg?.text || ""}</p>
                                            <div className="flex items-center gap-1 mt-1 justify-end">
                                                <span className={`text-[10px] ${msg?.fromMe ? 'text-white/80' : 'text-slate-400'} ${msg?.isInternal ? 'text-yellow-700' : ''}`}>
                                                    {msg?.time || ""}
                                                </span>
                                                {msg.fromMe && !msg.isInternal && !msg.isScheduled && (
                                                    <>
                                                        {msg.status === 'DELIVERED' && <CheckCheck className="h-3 w-3 text-white/90" />}
                                                        {msg.status === 'SENT' && <Check className="h-3 w-3 text-white/90" />}
                                                        {msg.status === 'PENDING' && <Clock className="h-3 w-3 text-white/60 animate-pulse" />}
                                                        {msg.status === 'FAILED' && <AlertCircle className="h-3 w-3 text-white" />}
                                                        {!msg.status && <CheckCheck className="h-3 w-3 text-white/90" />}
                                                    </>
                                                )}
                                                {msg.isScheduled && <span className="text-[10px] text-slate-400">Agendado</span>}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        {/* Scroll anchor - always keeps to bottom of chat */}
                        <div ref={messagesEndRef} className="h-0" />

                        {/* Input Area */}
                        {activeChat.status === 'pending' ? (
                            <div className="p-4 bg-white border-t min-h-[80px] flex items-center justify-center bg-slate-50/50">
                                <div className="text-center w-full max-w-md space-y-3">
                                    <p className="text-sm text-slate-500">Esta conversa está pendente. Aceite para iniciar o atendimento.</p>
                                    <Button
                                        onClick={handleAcceptChat}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 text-base"
                                    >
                                        <CheckCheck className="mr-2 h-5 w-5" />
                                        INICIAR ATENDIMENTO
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Composer onSendMessage={handleSendMessage} onScheduleMessage={handleScheduleMessage} />
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                            <MessageSquare className="h-8 w-8 text-slate-300" />
                        </div>
                        <p className="text-sm font-medium">Selecione uma conversa para começar</p>
                    </div>
                )}
            </div>

            {/* Right Pane: Contact Details */}
            {activeChat && (
                <ContactProfilePanel
                    workspaceId={workspaceId}
                    contactId={activeChat.contactId}
                />
            )}

            <TransferAgentDialog
                open={isTransferOpen}
                onOpenChange={setIsTransferOpen}
                onTransfer={handleTransfer}
            />

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
