"use client"

import React, { useEffect, useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Loader2, Save, Target, Timer, UserCheck, BarChart3, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PerformanceSettingsPage({ params: paramsPromise }: { params: Promise<{ workspaceId: string }> }) {
    const params = React.use(paramsPromise)
    const { workspaceId } = params
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [config, setConfig] = useState<any>(null)

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await api.get(`/workspaces/${workspaceId}/performance/config`)
                setConfig(res.data)
            } catch (error) {
                console.error("Failed to fetch performance config", error)
                toast.error("Erro ao carregar configurações de performance")
            } finally {
                setLoading(false)
            }
        }
        fetchConfig()
    }, [workspaceId])

    const handleSave = async () => {
        setSaving(true)
        try {
            await api.put(`/workspaces/${workspaceId}/performance/config`, config)
            toast.success("Configurações salvas com sucesso!")
        } catch (error) {
            console.error("Failed to save performance config", error)
            toast.error("Erro ao salvar configurações")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!config) {
        return (
            <div className="flex h-full items-center justify-center text-slate-500 min-h-[400px]">
                Não foi possível carregar as configurações.
            </div>
        )
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <Button variant="ghost" className="mb-4 pl-0 hover:pl-0 hover:bg-transparent text-slate-500 hover:text-slate-900" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Performance e Métricas</h1>
                        <p className="text-slate-500 mt-2">Configure regras de negócio, metas de atendimento e visibilidade de relatórios.</p>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    >
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Salvar Configurações
                    </Button>
                </div>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
                {/* Atribuição de Vendas */}
                <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <UserCheck className="h-5 w-5" />
                            </div>
                            <CardTitle>Atribuição de Vendas</CardTitle>
                        </div>
                        <CardDescription>Defina qual agente recebe o crédito pelas conversas convertidas em venda.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Regra de Atribuição Principal</Label>
                            <Select
                                value={config.salesAssignmentRule}
                                onValueChange={(v) => setConfig({ ...config, salesAssignmentRule: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma regra" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LAST_INTERACTION">Última Interação (Padrão)</SelectItem>
                                    <SelectItem value="FIRST_INTERACTION">Primeira Interação</SelectItem>
                                    <SelectItem value="LINEAR">Linear (Dividir crédito)</SelectItem>
                                    <SelectItem value="MANUAL">Atribuição Manual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Auto-atribuição de novos leads</Label>
                                <p className="text-xs text-slate-500">Atribuir lead automaticamente ao primeiro a responder.</p>
                            </div>
                            <Switch
                                checked={config.autoAssignLeads}
                                onCheckedChange={(v) => setConfig({ ...config, autoAssignLeads: v })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* SLAs de Atendimento */}
                <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                <Timer className="h-5 w-5" />
                            </div>
                            <CardTitle>SLAs de Atendimento</CardTitle>
                        </div>
                        <CardDescription>Configure limites de tempo para garantir respostas rápidas aos clientes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Tempo Limite de Primeira Resposta (SLA)</Label>
                            <Select
                                value={config.firstResponseSlaMinutes?.toString()}
                                onValueChange={(v) => setConfig({ ...config, firstResponseSlaMinutes: parseInt(v) })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tempo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 Minutos</SelectItem>
                                    <SelectItem value="15">15 Minutos</SelectItem>
                                    <SelectItem value="30">30 Minutos</SelectItem>
                                    <SelectItem value="60">1 Hora</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Alerta de conversa ociosa após (minutos)</Label>
                            <Input
                                type="number"
                                value={config.idleConversationAlertMinutes}
                                onChange={(e) => setConfig({ ...config, idleConversationAlertMinutes: parseInt(e.target.value) })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Metas da Equipe */}
                <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                <Target className="h-5 w-5" />
                            </div>
                            <CardTitle>Metas Globais</CardTitle>
                        </div>
                        <CardDescription>Defina os KPIs alvo que toda a equipe deve buscar atingir.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Meta de Taxa de Conversão (%)</Label>
                            <Input
                                type="number"
                                value={config.targetConversionRate}
                                onChange={(e) => setConfig({ ...config, targetConversionRate: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Meta de CSAT (Satisfação)</Label>
                            <Input
                                type="number"
                                step="0.1"
                                value={config.targetCsat}
                                onChange={(e) => setConfig({ ...config, targetCsat: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Volume Alvo de Atendimentos Mensais</Label>
                            <Input
                                type="number"
                                value={config.targetMonthlyVolume}
                                onChange={(e) => setConfig({ ...config, targetMonthlyVolume: parseInt(e.target.value) })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Visibilidade e Relatórios */}
                <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            <CardTitle>Visibilidade e Dashboards</CardTitle>
                        </div>
                        <CardDescription>Controle como os dados são exibidos para os diferentes níveis de acesso.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Período Padrão de Visualização</Label>
                            <Select
                                value={config.defaultViewPeriod}
                                onValueChange={(v) => setConfig({ ...config, defaultViewPeriod: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o período" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TODAY">Hoje</SelectItem>
                                    <SelectItem value="LAST_7_DAYS">Últimos 7 Dias</SelectItem>
                                    <SelectItem value="LAST_30_DAYS">Últimos 30 Dias</SelectItem>
                                    <SelectItem value="THIS_MONTH">Mês Atual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Exibir faturamento para agentes</Label>
                                <p className="text-xs text-slate-500">Permitir que agentes vejam valores monetários nos dashboards.</p>
                            </div>
                            <Switch
                                checked={config.showRevenueToAgents}
                                onCheckedChange={(v) => setConfig({ ...config, showRevenueToAgents: v })}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
