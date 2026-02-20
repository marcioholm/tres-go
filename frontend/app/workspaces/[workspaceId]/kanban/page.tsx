"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { KanbanBoard } from "@/components/kanban/KanbanBoard"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { useLanguage } from "@/lib/language-context"

export default function KanbanPage() {
    const { t } = useLanguage()
    const params = useParams()
    const workspaceId = params.workspaceId as string
    const [isNewDealOpen, setIsNewDealOpen] = useState(false)
    const [newDeal, setNewDeal] = useState({ title: "", value: "", contactId: "" })
    const [contacts, setContacts] = useState<{ id: string, name: string }[]>([])
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        if (isNewDealOpen) {
            fetchContacts()
        }
    }, [isNewDealOpen])

    const fetchContacts = async () => {
        try {
            const { data } = await api.get(`/workspaces/${workspaceId}/contacts?limit=100`)
            setContacts(data)
        } catch (error) {
            console.error(error)
        }
    }

    const handleCreateDeal = async () => {
        if (!newDeal.title || !newDeal.contactId) return

        try {
            await api.post(`/workspaces/${workspaceId}/kanban/deals`, {
                ...newDeal,
                workspaceId
            })
            setNewDeal({ title: "", value: "", contactId: "" })
            setIsNewDealOpen(false)
            setRefreshKey(prev => prev + 1)
        } catch (error) {
            console.error("Failed to create deal", error)
        }
    }

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-white shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Funil de Vendas</h1>
                    <p className="text-sm text-slate-500">Gerencie suas oportunidades de negócio.</p>
                </div>
                <Dialog open={isNewDealOpen} onOpenChange={setIsNewDealOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-red-600 hover:bg-red-700 font-bold gap-2 shadow-sm shadow-red-100">
                            <Plus className="h-4 w-4" /> NOVO NEGÓCIO
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Novo Negócio</DialogTitle>
                            <DialogDescription>Crie uma nova oportunidade no funil de vendas.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Título do Negócio</Label>
                                <Input
                                    id="title"
                                    placeholder="Ex: Contrato Anual - Empresa X"
                                    value={newDeal.title}
                                    onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="value">Valor Estimado (R$)</Label>
                                <Input
                                    id="value"
                                    type="number"
                                    placeholder="Ex: 5000.00"
                                    value={newDeal.value}
                                    onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact">Contato / Cliente</Label>
                                <Select
                                    value={newDeal.contactId}
                                    onValueChange={(value) => setNewDeal({ ...newDeal, contactId: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um cliente..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {contacts.map(contact => (
                                            <SelectItem key={contact.id} value={contact.id}>
                                                {contact.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreateDeal} className="bg-red-600 hover:bg-red-700 font-bold w-full">CRIAR NEGÓCIO</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex-1 overflow-hidden p-6">
                <KanbanBoard key={refreshKey} workspaceId={workspaceId} />
            </div>
        </div>
    )
}
