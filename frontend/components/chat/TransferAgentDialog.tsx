import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, User as UserIcon, Check } from "lucide-react"
import { api } from "@/lib/api"
import { useParams } from "next/navigation"

interface User {
    id: string
    name: string
    email: string
}

interface Sector {
    id: string
    name: string
    color: string
}

interface TransferAgentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onTransfer: (data: { agentId?: string, sectorId?: string, note?: string }) => void
}

export function TransferAgentDialog({ open, onOpenChange, onTransfer }: TransferAgentDialogProps) {
    const params = useParams()
    const workspaceId = params.workspaceId as string
    const [users, setUsers] = useState<User[]>([])
    const [sectors, setSectors] = useState<Sector[]>([])
    const [search, setSearch] = useState("")
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
    const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null)
    const [note, setNote] = useState("")
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'agent' | 'sector'>('agent')

    useEffect(() => {
        if (open) {
            fetchUsers()
        }
    }, [open, workspaceId])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const [usersRes, sectorsRes] = await Promise.all([
                api.get(`/workspaces/${workspaceId}/users`),
                api.get(`/workspaces/${workspaceId}/sectors`)
            ])
            setUsers(usersRes.data)
            setSectors(sectorsRes.data)
        } catch (error) {
            console.error("Failed to fetch transfer targets", error)
        } finally {
            setLoading(false)
        }
    }

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    )

    const handleTransfer = () => {
        if (selectedAgentId || selectedSectorId) {
            onTransfer({
                agentId: selectedAgentId || undefined,
                sectorId: selectedSectorId || undefined,
                note
            })
            onOpenChange(false)
            setNote("")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Transferir Atendimento</DialogTitle>
                    <DialogDescription>
                        Selecione um agente para transferir esta conversa.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex p-1 bg-slate-100 rounded-lg">
                        <button
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'agent' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setActiveTab('agent')}
                        >
                            Agente
                        </button>
                        <button
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'sector' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setActiveTab('sector')}
                        >
                            Setor
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder={activeTab === 'agent' ? "Buscar agente..." : "Buscar setor..."}
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="h-[200px] overflow-y-auto border rounded-md p-2 space-y-1">
                        {loading ? (
                            <div className="flex items-center justify-center h-full text-slate-500 text-sm">Carregando...</div>
                        ) : activeTab === 'agent' ? (
                            filteredUsers.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-slate-500 text-sm">Nenhum agente encontrado.</div>
                            ) : (
                                filteredUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        onClick={() => { setSelectedAgentId(user.id); setSelectedSectorId(null); }}
                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedAgentId === user.id ? 'bg-red-50 border border-red-200' : 'hover:bg-slate-100 border border-transparent'}`}
                                    >
                                        <Avatar className="h-7 w-7">
                                            <AvatarFallback className="bg-slate-200 text-slate-600 text-[10px]">
                                                {user.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-slate-900">{user.name}</div>
                                        </div>
                                        {selectedAgentId === user.id && <Check className="h-4 w-4 text-red-600" />}
                                    </div>
                                ))
                            )
                        ) : (
                            sectors.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map((sector) => (
                                <div
                                    key={sector.id}
                                    onClick={() => { setSelectedSectorId(sector.id); setSelectedAgentId(null); }}
                                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedSectorId === sector.id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-100 border border-transparent'}`}
                                >
                                    <div className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] text-white font-bold" style={{ backgroundColor: sector.color }}>
                                        {sector.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-slate-900">{sector.name}</div>
                                    </div>
                                    {selectedSectorId === sector.id && <Check className="h-4 w-4 text-indigo-600" />}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="transfer-note" className="text-xs text-slate-500">Observação para o próximo atendente</Label>
                        <Input
                            id="transfer-note"
                            placeholder="Ex: Cliente quer falar sobre faturamento..."
                            value={note}
                            onChange={e => setNote(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleTransfer} disabled={!selectedAgentId && !selectedSectorId} className="bg-slate-900 hover:bg-slate-800 text-white min-w-[100px]">
                        Transferir
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
