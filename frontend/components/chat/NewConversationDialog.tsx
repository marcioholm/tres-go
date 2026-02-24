"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Check, Instagram, MessageCircle, Facebook, Phone, Plus } from "lucide-react"
import { api } from "@/lib/api"
import { useParams } from "next/navigation"
import { toast } from "sonner"

interface Contact {
    id: string
    name: string
    phone: string
    avatarUrl?: string
}

interface Channel {
    id: string
    name: string
    type: 'WHATSAPP' | 'INSTAGRAM' | 'MESSENGER' | 'ZAPI'
    status: string
}

interface NewConversationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConversationCreated: (conversationId: string) => void
}

export function NewConversationDialog({ open, onOpenChange, onConversationCreated }: NewConversationDialogProps) {
    const params = useParams()
    const workspaceId = params.workspaceId as string

    const [contacts, setContacts] = useState<Contact[]>([])
    const [channels, setChannels] = useState<Channel[]>([])
    const [search, setSearch] = useState("")
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
    const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null)
    const [initialMessage, setInitialMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        if (open) {
            fetchData()
        }
    }, [open, workspaceId])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [contactsRes, channelsRes] = await Promise.all([
                api.get(`/workspaces/${workspaceId}/contacts?limit=50`),
                api.get(`/workspaces/${workspaceId}/channels`)
            ])
            setContacts(contactsRes.data)
            setChannels(channelsRes.data.filter((c: Channel) => c.status === 'ACTIVE' || c.type === 'ZAPI'))
        } catch (error) {
            console.error("Failed to fetch new conversation data", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.toLowerCase().includes(search.toLowerCase())
    )

    const handleCreate = async () => {
        if (!selectedContactId || !selectedChannelId || !initialMessage.trim()) return

        setCreating(true)
        try {
            // 1. Find or create conversation
            const { data: conversation } = await api.post(`/workspaces/${workspaceId}/conversations/find-or-create`, {
                contactId: selectedContactId,
                channelId: selectedChannelId
            })

            // 2. Send initial message
            let currentUserName = "Agente";
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsed = JSON.parse(storedUser);
                    currentUserName = parsed.name || parsed.firstName || "Agente";
                }
            } catch (e) { }

            await api.post(`/workspaces/${workspaceId}/messages`, {
                conversationId: conversation.id,
                type: 'text',
                fromMe: true,
                senderName: currentUserName,
                content: { body: initialMessage }
            })

            toast.success("Conversa iniciada com sucesso!")
            onConversationCreated(conversation.id)
            onOpenChange(false)
            resetForm()
        } catch (error: any) {
            console.error("Failed to start conversation", error)
            toast.error(error.response?.data?.message || "Erro ao iniciar conversa. Verifique sua conexão.")
        } finally {
            setCreating(false)
        }
    }

    const resetForm = () => {
        setSelectedContactId(null)
        setSelectedChannelId(null)
        setInitialMessage("")
        setSearch("")
    }

    const getChannelIcon = (type: string) => {
        switch (type) {
            case 'WHATSAPP':
            case 'ZAPI': return <MessageCircle className="h-4 w-4 text-emerald-500" />
            case 'INSTAGRAM': return <Instagram className="h-4 w-4 text-pink-500" />
            case 'MESSENGER': return <Facebook className="h-4 w-4 text-blue-500" />
            default: return <Phone className="h-4 w-4 text-slate-400" />
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Iniciar Nova Conversa</DialogTitle>
                    <DialogDescription>
                        Escolha um contato e o canal para enviar a primeira mensagem.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Contact Selection */}
                    <div className="space-y-2">
                        <Label>1. Selecione o Contato</Label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar contato..."
                                className="pl-9"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="h-[150px] overflow-y-auto border rounded-md p-2 space-y-1">
                            {loading ? (
                                <div className="flex items-center justify-center h-full text-slate-500 text-sm">Carregando...</div>
                            ) : filteredContacts.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-slate-500 text-sm">Nenhum contato encontrado.</div>
                            ) : (
                                filteredContacts.map(contact => (
                                    <div
                                        key={contact.id}
                                        onClick={() => setSelectedContactId(contact.id)}
                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedContactId === contact.id ? 'bg-red-50 border-red-200 border' : 'hover:bg-slate-100 border border-transparent'}`}
                                    >
                                        <Avatar className="h-7 w-7">
                                            <AvatarImage src={contact.avatarUrl} />
                                            <AvatarFallback className="bg-slate-200 text-slate-600 text-[10px]">
                                                {contact.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-slate-900">{contact.name}</div>
                                            <div className="text-[10px] text-slate-500">{contact.phone}</div>
                                        </div>
                                        {selectedContactId === contact.id && <Check className="h-4 w-4 text-red-600" />}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Channel Selection */}
                    <div className="space-y-2">
                        <Label>2. canal de Envio</Label>
                        <div className="flex flex-wrap gap-2">
                            {channels.map(channel => (
                                <div
                                    key={channel.id}
                                    onClick={() => setSelectedChannelId(channel.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${selectedChannelId === channel.id ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                >
                                    {getChannelIcon(channel.type)}
                                    <span className="text-xs font-medium">{channel.name}</span>
                                </div>
                            ))}
                            {channels.length === 0 && !loading && (
                                <p className="text-xs text-red-500">Nenhum canal ativo encontrado.</p>
                            )}
                        </div>
                    </div>

                    {/* Initial Message */}
                    <div className="space-y-2">
                        <Label>3. Mensagem Inicial</Label>
                        <Textarea
                            placeholder="Digite sua mensagem aqui..."
                            className="resize-none min-h-[100px]"
                            value={initialMessage}
                            onChange={e => setInitialMessage(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button
                        onClick={handleCreate}
                        disabled={!selectedContactId || !selectedChannelId || !initialMessage.trim() || creating}
                        className="bg-red-600 hover:bg-red-700 text-white min-w-[120px]"
                    >
                        {creating ? "Iniciando..." : "Iniciar Conversa"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
