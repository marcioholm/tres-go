"use client"

import { useEffect, useState } from "react"
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
import { Loader2, Save, Target, Timer, UserCheck, BarChart3 } from "lucide-react"

export default function PerformanceSettingsPage({ params }: { params: { workspaceId: string } }) {
    const { workspaceId } = params
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
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
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
                                value={config.saleAttribution}
                                onValueChange={(v) => setConfig({ ...config, saleAttribution: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a regra" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LAST_AGENT">Último Agente (Quem resolveu)</SelectItem>
                                    <SelectItem value="FIRST_AGENT">Primeiro Agente (Quem iniciou)</SelectItem>
                                    <SelectItem value="EQUAL_SPLIT">Divisão Igualitária</SelectItem>
                                    <SelectItem value="MANUAL">Manual (Escolha no ato da venda)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-400">Esta regra será aplicada automaticamente ao registrar uma conversão.</p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="space-y-0.5">
                                <Label className="text-base">Permitir Ajuste Manual</Label>
                                <p className="text-sm text-slate-500">Agentes podem alterar a atribuição ao marcar como vendido.</p>
                            </div>
                            <Switch
                                checked={config.manualAttribution}
                                onCheckedChange={(v) => setConfig({ ...config, manualAttribution: v })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Cálculo de Tempo */}
                <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                                <Timer className="h-5 w-5" />
                            </div>
                            <CardTitle>Cálculo de Tempo útil</CardTitle>
                        </div>
                        <CardDescription>Configure como o Tempo Médio de Atendimento (TMA) é calculado.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Método de Cálculo</Label>
                            <Select
                                value={config.timeCalculation}
                                onValueChange={(v) => setConfig({ ...config, timeCalculation: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o método" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TOTAL">Tempo Total (Início ao Fim)</SelectItem>
                                    <SelectItem value="ACTIVE_ONLY">Apenas Atendimento Ativo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label>Limite de Inatividade (minutos)</Label>
                                <span className="text-sm font-medium text-amber-600">{config.inactivityThreshold} min</span>
                            </div>
                            <Input
                                type="number"
                                value={config.inactivityThreshold}
                                onChange={(e) => setConfig({ ...config, inactivityThreshold: parseInt(e.target.value) })}
                            />
                            <p className="text-xs text-slate-400">Tempo máximo de silêncio para considerar a sessão como "inativa" no cálculo de TMA.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Metas de Equipe */}
                <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                <Target className="h-5 w-5" />
                            </div>
                            <CardTitle>Metas de Atendimento e Conversão</CardTitle>
                        </div>
                        <CardDescription>Defina os KPIs esperados para sinalização nos relatórios de performance.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Primeira Resposta (min)</Label>
                            <Input
                                type="number"
                                value={config.firstResponseGoal}
                                onChange={(e) => setConfig({ ...config, firstResponseGoal: parseInt(e.target.value) })}
                                className="border-emerald-100 focus:border-emerald-300"
                            />
                            <p className="text-xs text-slate-400">Abaixo disso = Acima da média.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Tempo de Resolução (min)</Label>
                            <Input
                                type="number"
                                value={config.resolutionGoal}
                                onChange={(e) => setConfig({ ...config, resolutionGoal: parseInt(e.target.value) })}
                                className="border-emerald-100 focus:border-emerald-300"
                            />
                            <p className="text-xs text-slate-400">Ex: 1440 min = 24 horas.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Taxa de Conversão (%)</Label>
                            <Input
                                type="number"
                                value={config.conversionRateGoal}
                                onChange={(e) => setConfig({ ...config, conversionRateGoal: parseFloat(e.target.value) })}
                                className="border-emerald-100 focus:border-emerald-300"
                            />
                            <p className="text-xs text-slate-400">Meta de vendas por atendimentos.</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Visibilidade e Relatórios */}
                <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            <CardTitle>Visibilidade e Relatórios</CardTitle>
                        </div>
                        <CardDescription>Controle quem pode acessar as métricas de performance da equipe.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Quem pode ver o Dashboard de Performance?</Label>
                            <Select
                                value={config.reportVisibility}
                                onValueChange={(v) => setConfig({ ...config, reportVisibility: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN_ONLY">Apenas Administradores</SelectItem>
                                    <SelectItem value="ALL_AGENTS">Todos os Agentes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Período Padrão de Análise</Label>
                            <Select
                                value={config.defaultReportPeriod}
                                onValueChange={(v) => setConfig({ ...config, defaultReportPeriod: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="WEEKLY">Semanal</SelectItem>
                                    <SelectItem value="MONTHLY">Mensal</SelectItem>
                                    <SelectItem value="CUSTOM">Personalizado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
