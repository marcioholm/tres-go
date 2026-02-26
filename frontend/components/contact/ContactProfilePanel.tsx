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
import { Phone, Mail, Tag, TrendingUp, ArrowUpRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

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
                setSales(Array.isArray(salesRes.data) ? salesRes.data : [])

                // Fetch available tags
                const tagsRes = await api.get(`/workspaces/${workspaceId}/tags`)
                setAvailableTags(Array.isArray(tagsRes.data) ? tagsRes.data : [])

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
                            <div className="space-y-3">
                                {sales.map(sale => (
                                    <div key={sale.id} className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="text-sm font-bold text-slate-800 line-clamp-1">{sale.title}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">{new Date(sale.saleDate || sale.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <Badge className={cn(
                                                "text-[9px] font-bold px-1.5 py-0.5 border-0 uppercase tracking-tighter",
                                                sale.paymentStatus === 'PAID' ? "bg-green-500" :
                                                    sale.paymentStatus === 'PENDING' ? "bg-amber-500" : "bg-slate-400"
                                            )}>
                                                {sale.paymentStatus || sale.status}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-2 mb-3">
                                            {sale.paymentMethod && (
                                                <Badge variant="outline" className="text-[9px] text-slate-500 font-bold border-slate-200">
                                                    {sale.paymentMethod === 'CREDIT_CARD' && 'Cartão'}
                                                    {sale.paymentMethod === 'PIX' && 'PIX'}
                                                    {sale.paymentMethod === 'BANK_SLIP' && 'Boleto'}
                                                    {!['CREDIT_CARD', 'PIX', 'BANK_SLIP'].includes(sale.paymentMethod) && sale.paymentMethod}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex justify-between items-end border-t border-slate-50 pt-3 mt-1">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-slate-400 font-bold uppercase">Valor Total</span>
                                                <span className="text-base font-black text-slate-950">
                                                    R$ {(sale.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                                                <ArrowUpRight className="h-4 w-4" />
                                            </Button>
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
