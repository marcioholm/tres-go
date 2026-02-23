"use client"

import { useEffect, useState, useCallback } from "react"
import { api } from "@/lib/api"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Search, User as UserIcon, ShieldCheck, Pencil,
    Save, Loader2, Users, Monitor, Layers, Megaphone
} from "lucide-react"
import { toast } from "sonner"

interface Plan {
    id: string
    name: string
    slug: string
    priceMonthly: number
    maxAgents: number
    maxChannels: number
    maxSectors: number
    maxCampaigns: number
    hasKanban: boolean
    hasChatbot: boolean
    hasAI: boolean
    hasReports: boolean
    hasAPI: boolean
    hasScheduledMessages: boolean
    hasCampaigns: boolean
    hasSalesHistory: boolean
}

interface WorkspaceUser {
    workspace: {
        id: string
        name: string
        subscription?: {
            status: string
            plan: Plan
        }
        channels?: any[]
        sectors?: any[]
    }
    role: string
}

interface User {
    id: string
    name?: string
    firstName?: string
    lastName?: string
    email: string
    superAdmin?: any
    workspaces: WorkspaceUser[]
}

export default function UsersGlobalManagement() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [plans, setPlans] = useState<Plan[]>([])
    const [editingUser, setEditingUser] = useState<User | null>(null)
    const [editOpen, setEditOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    // Edit form state
    const [selectedPlanSlug, setSelectedPlanSlug] = useState("")
    const [overrides, setOverrides] = useState({
        maxAgents: 0,
        maxChannels: 0,
        maxSectors: 0,
        maxCampaigns: 0,
        hasKanban: false,
        hasChatbot: false,
        hasAI: false,
        hasReports: false,
        hasAPI: false,
        hasScheduledMessages: false,
        hasCampaigns: false,
        hasSalesHistory: false,
    })

    useEffect(() => {
        loadUsers()
        loadPlans()
    }, [])

    const loadUsers = async () => {
        try {
            const { data } = await api.get('/super-admin/users', { params: { search } })
            setUsers(data || [])
        } catch (error) {
            console.error("Failed to load users", error)
        } finally {
            setLoading(false)
        }
    }

    const loadPlans = async () => {
        try {
            const { data } = await api.get('/super-admin/plans')
            setPlans(data || [])
        } catch (error) {
            console.error("Failed to load plans", error)
        }
    }

    const openEdit = async (user: User) => {
        try {
            const { data } = await api.get(`/super-admin/users/${user.id}`)
            setEditingUser(data)

            // Pre-populate with the user's first admin workspace plan
            const adminWs = data.workspaces?.find((wu: WorkspaceUser) => wu.role === 'ADMIN')
            const plan = adminWs?.workspace?.subscription?.plan

            setSelectedPlanSlug(plan?.slug || "")
            setOverrides({
                maxAgents: plan?.maxAgents ?? 2,
                maxChannels: plan?.maxChannels ?? 1,
                maxSectors: plan?.maxSectors ?? 1,
                maxCampaigns: plan?.maxCampaigns ?? 0,
                hasKanban: plan?.hasKanban ?? false,
                hasChatbot: plan?.hasChatbot ?? false,
                hasAI: plan?.hasAI ?? false,
                hasReports: plan?.hasReports ?? false,
                hasAPI: plan?.hasAPI ?? false,
                hasScheduledMessages: plan?.hasScheduledMessages ?? false,
                hasCampaigns: plan?.hasCampaigns ?? false,
                hasSalesHistory: plan?.hasSalesHistory ?? false,
            })
            setEditOpen(true)
        } catch (e) {
            toast.error("Erro ao carregar detalhes do usuário")
        }
    }

    const saveUser = async () => {
        if (!editingUser) return
        setSaving(true)
        try {
            await api.put(`/super-admin/users/${editingUser.id}`, {
                workspacePlanSlug: selectedPlanSlug || undefined,
                overrides,
            })
            toast.success("Usuário atualizado com sucesso!")
            setEditOpen(false)
            loadUsers()
        } catch (e: any) {
            toast.error(e?.response?.data?.message || "Erro ao salvar alterações")
        } finally {
            setSaving(false)
        }
    }

    const displayName = (u: User) =>
        u.name || [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email

    const adminWorkspace = (u: User) =>
        u.workspaces?.find(wu => wu.role === 'ADMIN')?.workspace

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Busca Global de Usuários</h2>
                    <p className="text-sm text-slate-500 mt-1">Gerencie planos, limites e funcionalidades por usuário.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Email ou nome..."
                        className="pl-10 w-80 rounded-xl border-slate-200"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="font-bold">Usuário</TableHead>
                            <TableHead className="font-bold">Privilégios</TableHead>
                            <TableHead className="font-bold">Workspace / Plano</TableHead>
                            <TableHead className="font-bold">Limites</TableHead>
                            <TableHead className="font-bold text-right text-slate-400 uppercase text-[10px] tracking-widest">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-slate-400">
                                    Buscando base de usuários...
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-slate-400">
                                    Nenhum usuário encontrado.
                                </TableCell>
                            </TableRow>
                        ) : users.map((u) => {
                            const ws = adminWorkspace(u)
                            const plan = ws?.subscription?.plan
                            return (
                                <TableRow key={u.id} className="hover:bg-slate-50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                                                <UserIcon className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">{displayName(u)}</span>
                                                <span className="text-sm text-slate-500">{u.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {u.superAdmin ? (
                                            <Badge className="bg-indigo-600 text-white border-none gap-1 py-1">
                                                <ShieldCheck className="h-3 w-3" />
                                                SUPER ADMIN
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-slate-400 border-slate-200">
                                                USUÁRIO
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {ws ? (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-semibold text-slate-700">{ws.name}</span>
                                                {plan ? (
                                                    <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-100 w-fit">
                                                        {plan.name}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs text-slate-400">Sem plano</span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-300">Sem workspace</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {plan ? (
                                            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" /> {plan.maxAgents} agentes
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Monitor className="h-3 w-3" /> {plan.maxChannels} canais
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Layers className="h-3 w-3" /> {plan.maxSectors} setores
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-300">—</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs gap-1.5 border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-semibold"
                                            onClick={() => openEdit(u)}
                                        >
                                            <Pencil className="h-3 w-3" />
                                            EDITAR
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Modal */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-indigo-600" />
                            Editar Usuário
                        </DialogTitle>
                        <DialogDescription>
                            {editingUser && (
                                <span className="font-semibold text-slate-700">
                                    {displayName(editingUser)} · {editingUser.email}
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-2">
                        {/* Plan Selection */}
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                                <Layers className="h-4 w-4 text-indigo-500" />
                                Plano do Workspace
                            </Label>
                            <Select value={selectedPlanSlug} onValueChange={(v) => {
                                setSelectedPlanSlug(v)
                                const plan = plans.find(p => p.slug === v)
                                if (plan) {
                                    setOverrides({
                                        maxAgents: plan.maxAgents,
                                        maxChannels: plan.maxChannels,
                                        maxSectors: plan.maxSectors,
                                        maxCampaigns: plan.maxCampaigns,
                                        hasKanban: plan.hasKanban,
                                        hasChatbot: plan.hasChatbot,
                                        hasAI: plan.hasAI,
                                        hasReports: plan.hasReports,
                                        hasAPI: plan.hasAPI,
                                        hasScheduledMessages: plan.hasScheduledMessages,
                                        hasCampaigns: plan.hasCampaigns,
                                        hasSalesHistory: plan.hasSalesHistory,
                                    })
                                }
                            }}>
                                <SelectTrigger className="rounded-xl border-slate-200 h-11">
                                    <SelectValue placeholder="Selecionar plano..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {plans.map(p => (
                                        <SelectItem key={p.slug} value={p.slug}>
                                            {p.name} — R$ {p.priceMonthly}/mês
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-400">Trocar o plano atualiza os limites base. Você pode ajustá-los manualmente abaixo.</p>
                        </div>

                        {/* Limits */}
                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-slate-700">Limites de Recursos</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { key: "maxAgents", label: "Agentes Máx.", icon: Users },
                                    { key: "maxChannels", label: "Canais Máx.", icon: Monitor },
                                    { key: "maxSectors", label: "Setores Máx.", icon: Layers },
                                    { key: "maxCampaigns", label: "Campanhas Máx.", icon: Megaphone },
                                ].map(({ key, label, icon: Icon }) => (
                                    <div key={key} className="flex flex-col gap-1.5 bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                            <Icon className="h-3 w-3" />
                                            {label}
                                        </label>
                                        <Input
                                            type="number"
                                            min={0}
                                            className="h-9 rounded-lg border-slate-200 text-slate-900 font-bold bg-white"
                                            value={(overrides as any)[key]}
                                            onChange={(e) => setOverrides(prev => ({
                                                ...prev,
                                                [key]: parseInt(e.target.value) || 0
                                            }))}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Feature Flags */}
                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-slate-700">Funcionalidades</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { key: "hasKanban", label: "Kanban / CRM" },
                                    { key: "hasChatbot", label: "Chatbot / Fluxo" },
                                    { key: "hasAI", label: "Inteligência Artificial" },
                                    { key: "hasReports", label: "Relatórios" },
                                    { key: "hasAPI", label: "Acesso à API" },
                                    { key: "hasScheduledMessages", label: "Msgs Agendadas" },
                                    { key: "hasCampaigns", label: "Campanhas" },
                                    { key: "hasSalesHistory", label: "Histórico de Vendas" },
                                ].map(({ key, label }) => (
                                    <div key={key} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                                        <span className="text-sm text-slate-600 font-medium">{label}</span>
                                        <Switch
                                            id={`switch-${key}`}
                                            checked={(overrides as any)[key]}
                                            onCheckedChange={(v) => setOverrides(prev => ({
                                                ...prev,
                                                [key]: v
                                            }))}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 pt-2">
                        <Button variant="outline" className="rounded-xl" onClick={() => setEditOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            className="rounded-xl bg-indigo-600 hover:bg-indigo-700 gap-2 font-semibold"
                            onClick={saveUser}
                            disabled={saving}
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Salvar Alterações
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
