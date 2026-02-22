"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDateRangePicker } from "@/components/date-range-picker"
import { api } from "@/lib/api"
import { toast } from "sonner"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts"
import {
    Loader2, TrendingUp, Clock, CheckCircle2, DollarSign,
    User, Target, Award, ArrowUpRight, ArrowDownRight,
    Users
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const COLORS = ['#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

export default function PerformanceDashboardPage({ params }: { params: { workspaceId: string } }) {
    const { workspaceId } = params
    const { t } = useLanguage()
    const [loading, setLoading] = useState(true)
    const [config, setConfig] = useState<any>(null)
    const [metrics, setMetrics] = useState<any>(null)
    const [agentMetrics, setAgentMetrics] = useState<any[]>([])
    const [selectedAgent, setSelectedAgent] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [configRes, metricsRes, agentsRes] = await Promise.all([
                    api.get(`/workspaces/${workspaceId}/performance/config`),
                    api.get(`/workspaces/${workspaceId}/performance/metrics`),
                    api.get(`/workspaces/${workspaceId}/reports/agents`)
                ])
                setConfig(configRes.data)
                setMetrics(metricsRes.data)
                setAgentMetrics(Array.isArray(agentsRes.data) ? agentsRes.data : [])
            } catch (error) {
                console.error("Failed to fetch performance data", error)
                toast.error("Erro ao carregar dados de performance")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [workspaceId])

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const StatCard = ({ title, value, target, unit = "", icon: Icon, color }: any) => {
        const isGoalMet = target ? (unit === "%" ? value >= target : value <= target) : true;

        return (
            <Card className="border-none shadow-sm overflow-hidden group">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
                            <Icon className={`h-5 w-5 ${color.replace('bg-', 'text-')}`} />
                        </div>
                        {target && (
                            <Badge
                                variant="outline"
                                className={cn(
                                    "text-[10px] uppercase font-bold",
                                    isGoalMet ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                                )}
                            >
                                {isGoalMet ? "Meta Batida" : "Abaixo da Meta"}
                            </Badge>
                        )}
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-500">{title}</p>
                        <div className="flex items-baseline gap-1">
                            <h3 className="text-2xl font-bold text-slate-800">{value}{unit}</h3>
                            {target && <span className="text-xs text-slate-400">/ meta: {target}{unit}</span>}
                        </div>
                    </div>
                    {target && target > 0 && (
                        <div className="mt-4 space-y-2">
                            <Progress
                                value={unit === "%" ? (Number(value) / target) * 100 : (target / Math.max(Number(value), 1)) * 100}
                                className="h-1.5"
                                indicatorClassName={isGoalMet ? "bg-emerald-500" : "bg-amber-500"}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Dashboard de Performance</h1>
                    <p className="text-slate-500 mt-1">Análise detalhada de produtividade e eficiência da equipe.</p>
                </div>
                <div className="flex items-center gap-3">
                    <CalendarDateRangePicker />
                    <Button variant="outline" size="icon">
                        <TrendingUp className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Primeira Resposta"
                    value={metrics?.avgFirstResponseTime || 0}
                    target={config?.firstResponseGoal}
                    unit="min"
                    icon={Clock}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Tempo de Resolução"
                    value={metrics?.avgResolutionTime || 0}
                    target={config?.resolutionGoal}
                    unit="min"
                    icon={CheckCircle2}
                    color="bg-amber-500"
                />
                <StatCard
                    title="Taxa de Conversão"
                    value={metrics?.conversionRate?.toFixed(1) || "0.0"}
                    target={config?.conversionRateGoal}
                    unit="%"
                    icon={Award}
                    color="bg-emerald-500"
                />
                <StatCard
                    title="Vendas Registradas"
                    value={metrics?.totalSales || 0}
                    icon={DollarSign}
                    color="bg-indigo-500"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Ranking de Agentes */}
                <Card className="col-span-1 border-none shadow-md">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Top Agentes (Conversão)</CardTitle>
                            <Users className="h-4 w-4 text-slate-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {agentMetrics.slice(0, 5).map((agent, i) => (
                                <div key={agent.name} className="flex items-center gap-4">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? "bg-yellow-100 text-yellow-700" :
                                        i === 1 ? "bg-slate-100 text-slate-700" :
                                            i === 2 ? "bg-orange-100 text-orange-700" : "bg-slate-50 text-slate-400"
                                        }`}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-700">{agent.name}</p>
                                        <p className="text-xs text-slate-500">{agent.resolved} conversas resolvidas</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-emerald-600">
                                            {((agent.revenue / (agent.conversations || 1)) * 10).toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full mt-6 text-primary" onClick={() => (window as any).location.href = `/workspaces/${workspaceId}/reports`}>
                            Ver Relatório Completo
                        </Button>
                    </CardContent>
                </Card>

                {/* Gráfico de Conversão Semanal */}
                <Card className="col-span-2 border-none shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg">Eficiência Semanal</CardTitle>
                        <CardDescription>Comparativo entre mensagens recebidas e resoluções.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'Seg', recebidas: 45, resolvidas: 38 },
                                    { name: 'Ter', recebidas: 52, resolvidas: 48 },
                                    { name: 'Qua', recebidas: 38, resolvidas: 35 },
                                    { name: 'Qui', recebidas: 61, resolvidas: 55 },
                                    { name: 'Sex', recebidas: 55, resolvidas: 50 },
                                    { name: 'Sab', recebidas: 22, resolvidas: 20 },
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: '#64748b' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="recebidas" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={20} />
                                    <Bar dataKey="resolvidas" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
