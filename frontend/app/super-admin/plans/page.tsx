"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Layers, Plus, Edit, Trash2,
    Check, X, Users, MessageSquare, Zap, Settings2
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export default function PlansManagement() {
    const [plans, setPlans] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingPlan, setEditingPlan] = useState<any>(null)
    const [formData, setFormData] = useState<any>({
        name: "",
        slug: "",
        description: "",
        priceMonthly: 0,
        priceYearly: 0,
        isActive: true,
        isPublic: true,
        trialDays: 14,
        maxAgents: 2,
        maxChannels: 1,
        maxConversationsPerMonth: 500,
        maxSectors: 1,
        hasKanban: false,
        hasChatbot: false,
        hasAI: false,
        hasReports: false,
        hasAPI: false
    })

    useEffect(() => {
        loadPlans()
    }, [])

    const loadPlans = async () => {
        try {
            const { data } = await api.get('/super-admin/plans')
            setPlans(data || [])
        } catch (error) {
            console.error("Failed to load plans", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            if (editingPlan) {
                await api.put(`/super-admin/plans/${editingPlan.id}`, formData)
            } else {
                await api.post('/super-admin/plans', formData)
            }
            setIsDialogOpen(false)
            setEditingPlan(null)
            loadPlans()
        } catch (error) {
            console.error("Failed to save plan", error)
            alert("Erro ao salvar plano. Verifique os dados.")
        }
    }

    const handleEdit = (plan: any) => {
        setEditingPlan(plan)
        setFormData({ ...plan })
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este plano? Esta ação pode afetar assinaturas existentes.")) return
        try {
            // Supondo que exista um DELETE ou apenas desativamos
            await api.put(`/super-admin/plans/${id}`, { isActive: false })
            loadPlans()
        } catch (error) {
            console.error("Failed to delete plan", error)
        }
    }

    const resetForm = () => {
        setEditingPlan(null)
        setFormData({
            name: "",
            slug: "",
            description: "",
            priceMonthly: 0,
            priceYearly: 0,
            isActive: true,
            isPublic: true,
            trialDays: 14,
            maxAgents: 2,
            maxChannels: 1,
            maxConversationsPerMonth: 500,
            maxSectors: 1,
            hasKanban: false,
            hasChatbot: false,
            hasAI: false,
            hasReports: false,
            hasAPI: false
        })
        setIsDialogOpen(true)
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Configuração de Planos</h2>
                    <p className="text-sm text-slate-500 mt-1">Defina preços, limites de agentes e funcionalidades de cada tier.</p>
                </div>
                <Button
                    onClick={resetForm}
                    className="bg-indigo-600 hover:bg-indigo-700 rounded-xl gap-2 font-bold h-11 px-6 shadow-md shadow-indigo-100"
                >
                    <Plus className="h-4 w-4" />
                    Novo Plano
                </Button>
            </div>

            {/* Dialog de Cadastro/Edição */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
                    <DialogHeader>
                        <DialogTitle>{editingPlan ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
                        <DialogDescription>
                            Configure os limites e preços do tier. O slug deve ser único.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nome do Plano</Label>
                                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Growth" />
                            </div>
                            <div className="space-y-2">
                                <Label>Slug (ID único)</Label>
                                <Input value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="ex: growth" disabled={!!editingPlan} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Descrição</Label>
                            <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Breve descrição dos benefícios..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Preço Mensal (R$)</Label>
                                <Input type="number" value={formData.priceMonthly} onChange={e => setFormData({ ...formData, priceMonthly: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Preço Anual (R$)</Label>
                                <Input type="number" value={formData.priceYearly} onChange={e => setFormData({ ...formData, priceYearly: Number(e.target.value) })} />
                            </div>
                        </div>

                        <div className="border-t pt-4 mt-2">
                            <h4 className="font-bold text-sm mb-4 flex items-center gap-2"><Settings2 className="h-4 w-4" /> Limites Operacionais</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs">Máx Agentes</Label>
                                    <Input type="number" value={formData.maxAgents} onChange={e => setFormData({ ...formData, maxAgents: Number(e.target.value) })} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Máx Canais</Label>
                                    <Input type="number" value={formData.maxChannels} onChange={e => setFormData({ ...formData, maxChannels: Number(e.target.value) })} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Conversas/mês</Label>
                                    <Input type="number" value={formData.maxConversationsPerMonth} onChange={e => setFormData({ ...formData, maxConversationsPerMonth: Number(e.target.value) })} />
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-bold text-sm mb-4 flex items-center gap-2 text-indigo-600"><Check className="h-4 w-4" /> Funcionalidades Inclusas</h4>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs">Painel Kanban</Label>
                                    <Switch checked={formData.hasKanban} onCheckedChange={checked => setFormData({ ...formData, hasKanban: checked })} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs">Chatbot / Automação</Label>
                                    <Switch checked={formData.hasChatbot} onCheckedChange={checked => setFormData({ ...formData, hasChatbot: checked })} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs">IA Generativa</Label>
                                    <Switch checked={formData.hasAI} onCheckedChange={checked => setFormData({ ...formData, hasAI: checked })} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs">Acesso API</Label>
                                    <Switch checked={formData.hasAPI} onCheckedChange={checked => setFormData({ ...formData, hasAPI: checked })} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Salvar Plano</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="grid gap-6 md:grid-cols-3">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-[400px] w-full bg-slate-100 animate-pulse rounded-2xl" />
                    ))
                ) : plans.length === 0 ? (
                    <Card className="col-span-3 border-dashed border-2 p-12 text-center text-slate-400">
                        Nenhum plano configurado no momento.
                    </Card>
                ) : plans.map((p) => (
                    <Card key={p.id} className={`border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group ${p.isActive ? 'bg-white' : 'bg-slate-50 opacity-75 grayscale'}`}>
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <Zap className="h-5 w-5" />
                                </div>
                                <Badge variant={p.isActive ? "default" : "secondary"} className={p.isActive ? "bg-emerald-500 text-white" : ""}>
                                    {p.isActive ? 'ATIVO' : 'INATIVO'}
                                </Badge>
                            </div>
                            <CardTitle className="text-xl font-bold text-slate-900">{p.name}</CardTitle>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-2xl font-black text-slate-900">{formatCurrency(p.priceMonthly)}</span>
                                <span className="text-sm text-slate-400">/mês</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <Users className="h-4 w-4 text-indigo-500" />
                                <span>Até <b>{p.maxAgents}</b> Agentes</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <MessageSquare className="h-4 w-4 text-indigo-500" />
                                <span>Até <b>{p.maxConnections || 'ilimitadas'}</b> Conexões</span>
                            </div>
                            <div className="pt-4 border-t border-slate-50">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Status dos Recursos</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <Check className="h-3 w-3 text-emerald-500" /> IA Generativa
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <Check className="h-3 w-3 text-emerald-500" /> Kanban Core
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <Check className="h-3 w-3 text-emerald-500" /> API Access
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                                        <X className="h-3 w-3" /> Relatórios Av.
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50/50 p-4 gap-2">
                            <Button
                                onClick={() => handleEdit(p)}
                                variant="outline"
                                className="flex-1 rounded-xl h-9 text-xs font-bold border-slate-200"
                            >
                                <Edit className="h-3.5 w-3.5 mr-2" />
                                Editar
                            </Button>
                            <Button
                                onClick={() => handleDelete(p.id)}
                                variant="ghost"
                                className="h-9 w-9 p-0 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
