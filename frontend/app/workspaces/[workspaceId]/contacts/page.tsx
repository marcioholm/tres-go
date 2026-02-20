"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Plus, Search, Trash2, Edit, ShoppingBag, DollarSign } from "lucide-react"
import { api } from "@/lib/api"
import { useParams } from "next/navigation"

enum TrafficSource {
    GOOGLE_ADS = "GOOGLE_ADS",
    GOOGLE_ORGANIC = "GOOGLE_ORGANIC",
    META_ADS = "META_ADS",
    META_ORGANIC = "META_ORGANIC",
    WHATSAPP_DIRECT = "WHATSAPP_DIRECT",
    INSTAGRAM_DIRECT = "INSTAGRAM_DIRECT",
    TIKTOK_ADS = "TIKTOK_ADS",
    TIKTOK_ORGANIC = "TIKTOK_ORGANIC",
    YOUTUBE = "YOUTUBE",
    EMAIL_MARKETING = "EMAIL_MARKETING",
    INDICATION = "INDICATION",
    COLD_CALL = "COLD_CALL",
    EVENT = "EVENT",
    OTHER = "OTHER"
}

interface Contact {
    id: string
    name: string
    phone: string | null
    email: string | null
    source: TrafficSource | null
    tags: string[] // Assuming generic array for now, or simplify
}

interface SaleItem {
    description: string
    quantity: number
    unitPrice: number
}

interface Sale {
    id: string
    totalAmount: number
    createdAt: string
    items: SaleItem[]
}

export default function ContactsPage() {
    const { t } = useLanguage()
    const params = useParams()
    const workspaceId = params.workspaceId as string

    const [contacts, setContacts] = useState<Contact[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [editingContact, setEditingContact] = useState<Contact | null>(null)
    const [newContact, setNewContact] = useState<Partial<Contact>>({ name: "", phone: "", email: "", source: null })
    const [loading, setLoading] = useState(true)

    // Sales State
    const [sales, setSales] = useState<Sale[]>([])
    const [newSaleItems, setNewSaleItems] = useState<SaleItem[]>([{ description: "", quantity: 1, unitPrice: 0 }])
    const [salesLoading, setSalesLoading] = useState(false)

    const fetchContacts = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/workspaces/${workspaceId}/contacts?search=${searchTerm}`)
            setContacts(response.data)
        } catch (error) {
            console.error("Failed to fetch contacts", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchSales = async (contactId: string) => {
        try {
            setSalesLoading(true)
            const response = await api.get(`/workspaces/${workspaceId}/sales?contactId=${contactId}`)
            setSales(response.data)
        } catch (error) {
            console.error("Failed to fetch sales", error)
        } finally {
            setSalesLoading(false)
        }
    }

    useEffect(() => {
        fetchContacts()
    }, [workspaceId, searchTerm])

    const handleSaveContact = async () => {
        if (!newContact.name) return

        try {
            if (editingContact) {
                await api.patch(`/workspaces/${workspaceId}/contacts/${editingContact.id}`, newContact)
            } else {
                await api.post(`/workspaces/${workspaceId}/contacts`, newContact)
            }
            fetchContacts()
            handleCloseDialog()
        } catch (error) {
            console.error("Failed to save contact", error)
        }
    }

    const handleRegisterSale = async () => {
        if (!editingContact) return
        const validItems = newSaleItems.filter(item => item.description && item.quantity > 0 && item.unitPrice >= 0)
        if (validItems.length === 0) return

        try {
            await api.post(`/workspaces/${workspaceId}/sales`, {
                contactId: editingContact.id,
                items: validItems
            })
            // Reset form
            setNewSaleItems([{ description: "", quantity: 1, unitPrice: 0 }])
            // Refresh sales
            fetchSales(editingContact.id)
        } catch (error) {
            console.error("Failed to register sale", error)
        }
    }

    const handleEditClick = (contact: Contact) => {
        setEditingContact(contact)
        setNewContact({
            name: contact.name,
            phone: contact.phone || "",
            email: contact.email || "",
            source: contact.source
        })
        setIsAddOpen(true)
        fetchSales(contact.id)
    }

    const handleDeleteContact = async (id: string) => {
        try {
            await api.delete(`/workspaces/${workspaceId}/contacts/${id}`)
            fetchContacts()
        } catch (error) {
            console.error("Failed to delete contact", error)
        }
    }

    const handleCloseDialog = () => {
        setIsAddOpen(false)
        setTimeout(() => {
            setEditingContact(null)
            setNewContact({ name: "", phone: "", email: "", source: null })
            setSales([])
            setNewSaleItems([{ description: "", quantity: 1, unitPrice: 0 }])
        }, 300)
    }

    const addSaleItem = () => {
        setNewSaleItems([...newSaleItems, { description: "", quantity: 1, unitPrice: 0 }])
    }

    const updateSaleItem = (index: number, field: keyof SaleItem, value: any) => {
        const updatedItems = [...newSaleItems]
        updatedItems[index] = { ...updatedItems[index], [field]: value }
        setNewSaleItems(updatedItems)
    }

    const removeSaleItem = (index: number) => {
        setNewSaleItems(newSaleItems.filter((_, i) => i !== index))
    }

    const sourceLabels: Record<string, string> = {
        GOOGLE_ADS: "Google Ads",
        GOOGLE_ORGANIC: "Google Orgânico",
        META_ADS: "Meta Ads (Facebook/Instagram)",
        META_ORGANIC: "Meta Orgânico",
        WHATSAPP_DIRECT: "WhatsApp Direto",
        INSTAGRAM_DIRECT: "Instagram Direct",
        TIKTOK_ADS: "TikTok Ads",
        TIKTOK_ORGANIC: "TikTok Orgânico",
        YOUTUBE: "YouTube",
        EMAIL_MARKETING: "Email Marketing",
        INDICATION: "Indicação",
        COLD_CALL: "Cold Call / Prospecção",
        EVENT: "Evento",
        OTHER: "Outro"
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Contatos</h1>
                    <p className="text-slate-500 mt-2">Gerencie sua base de clientes e leads.</p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={(open) => {
                    if (!open) handleCloseDialog()
                    else setIsAddOpen(true)
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 gap-2 font-bold">
                            <Plus className="h-4 w-4" />
                            NOVO CONTATO
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingContact ? "Detalhes do Contato" : "Adicionar Novo Contato"}</DialogTitle>
                            <DialogDescription>
                                {editingContact ? "Gerencie as informações e histórico do cliente." : "Preencha os dados do novo cliente."}
                            </DialogDescription>
                        </DialogHeader>

                        {editingContact ? (
                            <Tabs defaultValue="details" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="details">Dados Cadastrais</TabsTrigger>
                                    <TabsTrigger value="sales">Histórico de Vendas</TabsTrigger>
                                </TabsList>
                                <TabsContent value="details" className="space-y-4 py-4">
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nome Completo</Label>
                                            <Input
                                                id="name"
                                                placeholder="Ex: Ana Clara"
                                                value={newContact.name}
                                                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Telefone (WhatsApp)</Label>
                                                <Input
                                                    id="phone"
                                                    placeholder="Ex: +55 11 99999-9999"
                                                    value={newContact.phone || ""}
                                                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email (Opcional)</Label>
                                                <Input
                                                    id="email"
                                                    placeholder="Ex: ana@email.com"
                                                    value={newContact.email || ""}
                                                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="source">Origem do Cliente</Label>
                                            <Select
                                                value={newContact.source || ""}
                                                onValueChange={(value) => setNewContact({ ...newContact, source: value ? value as TrafficSource : null })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a origem" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(sourceLabels).map(([key, label]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <Button type="button" onClick={handleSaveContact} className="bg-red-600 hover:bg-red-700 font-bold">
                                            SALVAR ALTERAÇÕES
                                        </Button>
                                    </div>
                                </TabsContent>
                                <TabsContent value="sales" className="space-y-4 py-4">
                                    <Card className="p-4 bg-slate-50 border-dashed">
                                        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                            <ShoppingBag className="h-4 w-4" /> Registrar Nova Venda
                                        </h3>
                                        {newSaleItems.map((item, index) => (
                                            <div key={index} className="flex gap-2 mb-2 items-end">
                                                <div className="flex-1">
                                                    <Input
                                                        placeholder="Produto/Serviço"
                                                        value={item.description}
                                                        onChange={(e) => updateSaleItem(index, 'description', e.target.value)}
                                                    />
                                                </div>
                                                <div className="w-20">
                                                    <Input
                                                        type="number"
                                                        placeholder="Qtd"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateSaleItem(index, 'quantity', parseInt(e.target.value))}
                                                    />
                                                </div>
                                                <div className="w-24">
                                                    <Input
                                                        type="number"
                                                        placeholder="Preço"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.unitPrice}
                                                        onChange={(e) => updateSaleItem(index, 'unitPrice', parseFloat(e.target.value))}
                                                    />
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => removeSaleItem(index)}>
                                                    <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
                                                </Button>
                                            </div>
                                        ))}
                                        <div className="flex justify-between items-center mt-3">
                                            <Button variant="outline" size="sm" onClick={addSaleItem} className="text-xs">
                                                <Plus className="h-3 w-3 mr-1" /> Adicionar Item
                                            </Button>
                                            <Button size="sm" onClick={handleRegisterSale} className="bg-green-600 hover:bg-green-700">
                                                <DollarSign className="h-3 w-3 mr-1" /> REGISTRAR VENDA
                                            </Button>
                                        </div>
                                    </Card>

                                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                        <h3 className="font-semibold text-sm text-slate-500">Histórico ({sales.length})</h3>
                                        {salesLoading ? (
                                            <div className="text-center py-4 text-slate-400">Carregando histórico...</div>
                                        ) : sales.length === 0 ? (
                                            <div className="text-center py-8 text-slate-400 border rounded-lg bg-slate-50/50">
                                                Nenhuma venda registrada.
                                            </div>
                                        ) : (
                                            sales.map(sale => (
                                                <div key={sale.id} className="border rounded-lg p-3 bg-white text-sm">
                                                    <div className="flex justify-between font-medium mb-2">
                                                        <span>{new Date(sale.createdAt).toLocaleDateString()}</span>
                                                        <span className="text-green-600">R$ {sale.totalAmount.toFixed(2)}</span>
                                                    </div>
                                                    <div className="space-y-1">
                                                        {sale.items.map((item, idx) => (
                                                            <div key={idx} className="flex justify-between text-slate-500 text-xs">
                                                                <span>{item.quantity}x {item.description}</span>
                                                                <span>R$ {(item.quantity * item.unitPrice).toFixed(2)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        ) : (
                            // Add New Contact Form (No Tabs)
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nome Completo</Label>
                                    <Input
                                        id="name"
                                        placeholder="Ex: Ana Clara"
                                        value={newContact.name}
                                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Telefone (WhatsApp)</Label>
                                    <Input
                                        id="phone"
                                        placeholder="Ex: +55 11 99999-9999"
                                        value={newContact.phone || ""}
                                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email (Opcional)</Label>
                                    <Input
                                        id="email"
                                        placeholder="Ex: ana@email.com"
                                        value={newContact.email || ""}
                                        onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="source">Origem do Cliente</Label>
                                    <Select
                                        value={newContact.source || ""}
                                        onValueChange={(value) => setNewContact({ ...newContact, source: value ? value as TrafficSource : null })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione a origem" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(sourceLabels).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="mt-4">
                                    <Button type="submit" onClick={handleSaveContact} className="bg-red-600 hover:bg-red-700 font-bold w-full">
                                        SALVAR CONTATO
                                    </Button>
                                </div>
                            </div>
                        )}
                        {!editingContact && (
                            <DialogFooter className="hidden" />
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden border-slate-200 shadow-sm">
                <div className="p-4 border-b flex items-center gap-4 bg-slate-50/50">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar por nome, telefone ou email..."
                            className="pl-9 bg-white border-slate-200 focus-visible:ring-red-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <Table>
                        <TableHeader className="bg-slate-50 sticky top-0">
                            <TableRow>
                                <TableHead className="w-[250px]">Nome</TableHead>
                                <TableHead>Telefone</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Origem</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                                        Carregando contatos...
                                    </TableCell>
                                </TableRow>
                            ) : contacts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                                        Nenhum contato encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                contacts.map((contact) => (
                                    <TableRow key={contact.id} className="group hover:bg-slate-50">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                                                    {contact.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                {contact.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-600 font-mono text-xs">{contact.phone || "-"}</TableCell>
                                        <TableCell className="text-slate-600">{contact.email || "-"}</TableCell>
                                        <TableCell className="text-slate-600">
                                            {contact.source ? (
                                                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs border border-blue-100">
                                                    {sourceLabels[contact.source] || contact.source}
                                                </span>
                                            ) : "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-400 hover:text-blue-600"
                                                    onClick={() => handleEditClick(contact)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o contato <b>{contact.name}</b>.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDeleteContact(contact.id)}
                                                                className="bg-red-600 hover:bg-red-700"
                                                            >
                                                                Excluir
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}
