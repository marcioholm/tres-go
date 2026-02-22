import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Contact, Sale, TrafficSource, Tag as TagType } from "@/types/contact"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Check, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, MapPin, Calendar, DollarSign, Tag, TrendingUp, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface ContactProfilePanelProps {
    workspaceId: string
    contactId: string | number
    onClose?: () => void
}

export function ContactProfilePanel({ workspaceId, contactId, onClose }: ContactProfilePanelProps) {
    const [contact, setContact] = useState<Contact | null>(null)
    const [sales, setSales] = useState<Sale[]>([])
    const [loading, setLoading] = useState(true)
    const [updatingSource, setUpdatingSource] = useState(false)
    const [availableTags, setAvailableTags] = useState<TagType[]>([])
    const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false)
    const [editingPhone, setEditingPhone] = useState(false)
    const [phoneValue, setPhoneValue] = useState('')

    useEffect(() => {
        if (!contactId) return

        const fetchData = async () => {
            setLoading(true)
            try {
                // Fetch contact details
                const contactRes = await api.get(`/workspaces/${workspaceId}/contacts/${contactId}`)
                setContact(contactRes.data)

                // Fetch sales history
                const salesRes = await api.get(`/workspaces/${workspaceId}/sales?contactId=${contactId}`)
                setSales(salesRes.data)

                // Fetch available tags
                const tagsRes = await api.get(`/workspaces/${workspaceId}/tags`)
                setAvailableTags(tagsRes.data)

                // Initialize phone editing value
                if (contactRes.data?.phone) setPhoneValue(contactRes.data.phone)
            } catch (error) {
                console.error("Failed to fetch contact profile:", error)
                setContact(null)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [workspaceId, contactId])

    const handleSourceChange = async (newSource: TrafficSource) => {
        if (!contact) return
        setUpdatingSource(true)
        try {
            await api.patch(`/workspaces/${workspaceId}/contacts/${contact.id}/source`, {
                source: newSource
            })
            setContact({ ...contact, source: newSource })
        } catch (error) {
            console.error("Failed to update source:", error)
        } finally {
            setUpdatingSource(false)
        }
    }

    const handlePhoneSave = async () => {
        if (!contact) return
        try {
            await api.patch(`/workspaces/${workspaceId}/contacts/${contact.id}`, { phone: phoneValue })
            setContact({ ...contact, phone: phoneValue })
            setEditingPhone(false)
        } catch (error) {
            console.error('Failed to update phone:', error)
        }
    }

    const handleAddTag = async (tag: TagType) => {
        if (!contact) return
        try {
            await api.post(`/workspaces/${workspaceId}/contacts/${contact.id}/tags/${tag.id}`)
            const newTags = [...(contact.tags || []), tag]
            setContact({ ...contact, tags: newTags })
            setIsTagPopoverOpen(false)
        } catch (error) {
            console.error("Failed to add tag", error)
        }
    }

    const handleRemoveTag = async (tagId: string) => {
        if (!contact) return
        try {
            await api.delete(`/workspaces/${workspaceId}/contacts/${contact.id}/tags/${tagId}`)
            const newTags = (contact.tags || []).filter(t => t.id !== tagId)
            setContact({ ...contact, tags: newTags })
        } catch (error) {
            console.error("Failed to remove tag", error)
        }
    }

    if (loading) {
        return (
            <div className="w-80 border-l bg-white h-full p-6 space-y-6">
                <div className="flex flex-col items-center space-y-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </div>
        )
    }

    if (!contact) {
        return (
            <div className="w-80 border-l bg-white h-full p-6 flex items-center justify-center text-slate-500">
                <p>Contato não encontrado ou erro ao carregar.</p>
            </div>
        )
    }

    return (
        <div className="w-80 border-l flex flex-col bg-white h-full">
            <div className="h-16 border-b flex items-center justify-between px-6">
                <h3 className="font-semibold text-slate-700">Perfil do Contato</h3>
                {onClose && <Button variant="ghost" size="icon" onClick={onClose}>×</Button>}
            </div>

            <ScrollArea className="flex-1">
                <div className="p-6 flex flex-col items-center border-b">
                    <Avatar className="h-24 w-24 mb-4">
                        <AvatarFallback className="text-2xl bg-slate-100 text-slate-600 font-medium">
                            {(contact?.name || "??").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-bold text-slate-800 text-center">{contact?.name || "Sem nome"}</h2>
                    <p className="text-sm text-slate-500 font-medium tracking-wide mt-1">
                        {contact?.email || "Sem email"}
                    </p>

                    <div className="grid grid-cols-2 gap-3 w-full mt-6">
                        <Button variant="outline" className="text-xs h-9">Ver CRM</Button>
                        <Button variant="outline" className="text-xs h-9">Histórico</Button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Telefone</label>
                            {editingPhone ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        className="flex-1 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        value={phoneValue}
                                        onChange={(e) => setPhoneValue(e.target.value)}
                                        placeholder="+55 11 99999-9999"
                                        autoFocus
                                    />
                                    <button onClick={handlePhoneSave} className="text-xs text-blue-600 font-medium hover:underline">Salvar</button>
                                    <button onClick={() => setEditingPhone(false)} className="text-xs text-slate-400 hover:underline">✕</button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                    <Phone className="h-4 w-4 text-slate-400" />
                                    <span className="flex-1">{contact?.phone || "Adicionar telefone"}</span>
                                    <button onClick={() => { setPhoneValue(contact?.phone || ''); setEditingPhone(true) }} className="text-xs text-slate-400 hover:text-blue-500">✏️</button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Origem</label>
                            <Select
                                value={contact.source || ""}
                                onValueChange={(val) => handleSourceChange(val as TrafficSource)}
                                disabled={updatingSource}
                            >
                                <SelectTrigger className="w-full h-9 text-xs">
                                    <SelectValue placeholder="Selecione a origem" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(TrafficSource).map((src) => (
                                        <SelectItem key={src} value={src} className="text-xs">
                                            {src.replace(/_/g, " ")}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Tag className="h-3 w-3" /> Etiquetas
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {(contact?.tags || []).map(tag => (
                                <Badge
                                    key={tag.id}
                                    className="pl-2 pr-1 py-0.5 text-[10px] font-medium border-0 flex items-center gap-1"
                                    style={{
                                        backgroundColor: tag.color ? `${tag.color}20` : '#f1f5f9',
                                        color: tag.color || '#64748b'
                                    }}
                                >
                                    {tag.name}
                                    <button
                                        onClick={() => handleRemoveTag(tag.id)}
                                        className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                            <Popover open={isTagPopoverOpen} onOpenChange={setIsTagPopoverOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-6 text-[10px] px-2 border-dashed">
                                        <Plus className="h-3 w-3 mr-1" /> Adicionar
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-52" align="start">
                                    <Command>
                                        <CommandInput placeholder="Procurar tag..." className="h-8 text-xs" />
                                        <CommandEmpty>Nenhuma tag encontrada.</CommandEmpty>
                                        <CommandGroup>
                                            {(availableTags || []).filter(t => !(contact?.tags || []).some(ct => ct.id === t.id)).map(tag => (
                                                <CommandItem
                                                    key={tag.id}
                                                    onSelect={() => handleAddTag(tag)}
                                                    className="text-xs"
                                                >
                                                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: tag.color || "#ccc" }} />
                                                    {tag.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <TrendingUp className="h-3 w-3" />
                                Histórico de Vendas
                            </label>
                            <Badge variant="outline" className="text-[10px]">{(sales || []).length}</Badge>
                        </div>

                        {(!sales || sales.length === 0) ? (
                            <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center">
                                <p className="text-xs text-slate-400">Nenhuma venda registrada</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {sales.map(sale => (
                                    <div key={sale.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-medium text-slate-700 line-clamp-1" title={sale.title}>{sale.title}</span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${sale.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                sale.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-slate-100 text-slate-600'
                                                }`}>
                                                {sale.status === 'COMPLETED' ? 'Pago' : sale.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs text-slate-500">
                                                {new Date(sale.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="text-sm font-bold text-slate-800">
                                                R$ {sale.amount.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}
