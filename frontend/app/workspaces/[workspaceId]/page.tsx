"use client"

import React, { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { MessageSquare, CheckCircle, Reply, Timer, DollarSign, Award, Smile, AlertTriangle, Download, Filter, Bell, Search, Menu } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Line,
    ComposedChart,
    PieChart,
    Pie,
    Cell
} from "recharts"

export default function DashboardPage({ params: paramsPromise }: { params: Promise<{ workspaceId: string }> }) {
    const params = React.use(paramsPromise)
    const { t } = useLanguage()
    const [period, setPeriod] = useState<'hoje' | '7d' | '30d' | 'custom'>('hoje')
    const [currentTime, setCurrentTime] = useState<string>("")
    const [agentTab, setAgentTab] = useState<'atendimento' | 'vendas'>('atendimento')
    const [sectors, setSectors] = useState<any[]>([])
    const [dashboardMetrics, setDashboardMetrics] = useState<any>(null)
    const [agentPerformance, setAgentPerformance] = useState<any[]>([])
    const [volumeChartData, setVolumeChartData] = useState<any[]>([])
    const [funnelData, setFunnelData] = useState<any[]>([])
    const [trafficData, setTrafficData] = useState<any[]>([])
    const [pendingConversations, setPendingConversations] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Fetch Sector Metrics
    // Fetch All Metrics
    useEffect(() => {
        const fetchAllMetrics = async () => {
            setIsLoading(true)
            try {
                const [sectorsRes, dashRes, agentsRes, volumeRes, funnelRes, trafficRes, pendingRes] = await Promise.all([
                    api.get(`/workspaces/${params.workspaceId}/reports/sectors`),
                    api.get(`/workspaces/${params.workspaceId}/reports/dashboard`),
                    api.get(`/workspaces/${params.workspaceId}/reports/agents`),
                    api.get(`/workspaces/${params.workspaceId}/reports/volume`),
                    api.get(`/workspaces/${params.workspaceId}/reports/funnel`),
                    api.get(`/workspaces/${params.workspaceId}/reports/traffic`),
                    api.get(`/workspaces/${params.workspaceId}/reports/pending`)
                ])
                setSectors(sectorsRes.data)
                setDashboardMetrics(dashRes.data)
                setAgentPerformance(agentsRes.data)
                setVolumeChartData(volumeRes.data)
                setFunnelData(funnelRes.data)
                setTrafficData(trafficRes.data)
                setPendingConversations(pendingRes.data)
            } catch (error) {
                console.error("Failed to fetch dashboard metrics", error)
            } finally {
                setIsLoading(false)
            }
        }
        if (params.workspaceId) fetchAllMetrics()
    }, [params.workspaceId])

    // Live Clock
    useEffect(() => {
        const updateTime = () => {
            const now = new Date()
            setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
        }
        updateTime()
        const interval = setInterval(updateTime, 1000)
        return () => clearInterval(interval)
    }, [])

    // Dynamic Data from API
    const volumeData = volumeChartData.length > 0 ? volumeChartData : [
        { name: 'Dom', total: 0 },
        { name: 'Seg', total: 0 },
        { name: 'Ter', total: 0 },
        { name: 'Qua', total: 0 },
        { name: 'Qui', total: 0 },
        { name: 'Sex', total: 0 },
        { name: 'Sab', total: 0 },
    ]

    const channelData = sectors.map(s => ({
        name: s.name,
        value: s.totalConversations || 0,
        color: s.color || '#cbd5e1'
    }))

    return (
        <div className="min-h-screen bg-[#f4f5f7] pb-10">
            {/* ══ HEADER ══════════════════════════════════════════════════════════════ */}
            <header className="flex items-center justify-between border-b border-border bg-white px-6 py-3 sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary p-1.5 rounded-lg">
                            <Menu className="text-white w-6 h-6" />
                        </div>
                        <h1 className="text-lg font-bold tracking-tight uppercase italic">Northway <span className="text-primary not-italic">Omni</span></h1>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Period selector */}
                    <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-1">
                        <button onClick={() => setPeriod('hoje')} className={cn("period-btn px-4 py-1.5 text-xs font-bold rounded-md transition-all", period === 'hoje' ? "bg-white shadow-sm text-text-dark" : "text-slate-500 hover:text-slate-800")}>Hoje</button>
                        <button onClick={() => setPeriod('7d')} className={cn("period-btn px-4 py-1.5 text-xs font-bold rounded-md transition-all", period === '7d' ? "bg-white shadow-sm text-text-dark" : "text-slate-500 hover:text-slate-800")}>7 dias</button>
                        <button onClick={() => setPeriod('30d')} className={cn("period-btn px-4 py-1.5 text-xs font-bold rounded-md transition-all", period === '30d' ? "bg-white shadow-sm text-text-dark" : "text-slate-500 hover:text-slate-800")}>30 dias</button>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-primary transition-colors relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-white"></span>
                    </button>
                </div>
            </header>

            {/* ══ MAIN ════════════════════════════════════════════════════════════════ */}
            <main className="max-w-[1440px] mx-auto p-6 space-y-6">

                {/* Live status bar */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Visão Geral</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Atualizado em tempo real · <span className="font-mono">{currentTime}</span></p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Live indicators */}
                        <div className="flex items-center gap-4 bg-white border border-border rounded-xl px-5 py-2.5 shadow-sm">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot"></span>
                                <span className="text-xs font-bold text-slate-800">6 agentes online</span>
                            </div>
                            <div className="w-px h-4 bg-slate-200"></div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-400 pulse-dot"></span>
                                <span className="text-xs font-bold text-slate-800">12 na fila</span>
                            </div>
                            <div className="w-px h-4 bg-slate-200"></div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary pulse-dot"></span>
                                <span className="text-xs font-bold text-slate-800">38 em atendimento</span>
                            </div>
                        </div>
                        <Button variant="outline" className="flex items-center gap-2 bg-white border-border rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-primary hover:border-primary/30 transition-all shadow-sm h-auto">
                            <Download className="w-4 h-4" /> Exportar
                        </Button>
                    </div>
                </div>

                {/* ── SETORES OVERVIEW ────────────────────────────────────────────────── */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Performance por Setor</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {isLoading ? (
                            [1, 2, 3, 4].map(i => (
                                <Card key={i} className="p-4 h-32 animate-pulse bg-slate-100" />
                            ))
                        ) : sectors.map(sector => (
                            <Card key={sector.id} className="p-5 relative overflow-hidden border-none shadow-[0_1px_3px_rgba(0,0,0,0.04)] group hover:shadow-md transition-all">
                                <div className="absolute top-0 right-0 w-16 h-16 opacity-10 rounded-full -translate-y-4 translate-x-4" style={{ backgroundColor: sector.color }}></div>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sector.color }}></div>
                                        <span className="font-bold text-slate-800 text-sm">{sector.name}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{sector.slaCompliance} SLA</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Conversas</p>
                                        <p className="text-xl font-black text-slate-800">{sector.totalConversations}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Tempo (TMA)</p>
                                        <p className="text-xl font-black text-slate-800">{sector.avgResponseTime}</p>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center gap-3">
                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-1.5 rounded-full bg-emerald-400" style={{ width: sector.slaCompliance }}></div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                        {sectors.length === 0 && !isLoading && (
                            <Card className="p-5 lg:col-span-4 flex items-center justify-center border-dashed border-2 text-slate-400 text-xs">
                                Nenhum setor configurado. Vá em Configurações para adicionar.
                            </Card>
                        )}
                    </div>
                </div>

                {/* ── KPI GRID ──────────────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

                    {/* KPI 1: Total conversas */}
                    <Card className="p-5 relative overflow-hidden bg-white border-none shadow-sm group hover:shadow-md transition-all h-full">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50/50 rounded-full -translate-y-8 translate-x-8"></div>
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <MessageSquare className="text-blue-500 w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Conversas</p>
                        <p className="text-3xl font-black text-slate-800 count-anim">{dashboardMetrics?.totalConversations?.value || 0}</p>
                    </Card>

                    {/* KPI 2: Resolvidas */}
                    <Card className="p-5 relative overflow-hidden bg-white border-none shadow-sm group hover:shadow-md transition-all h-full">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50/50 rounded-full -translate-y-8 translate-x-8"></div>
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <CheckCircle className="text-emerald-500 w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{dashboardMetrics?.resolved?.rate || 0}%</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Resolvidas</p>
                        <p className="text-3xl font-black text-slate-800 count-anim">{dashboardMetrics?.resolved?.value || 0}</p>
                    </Card>

                    {/* KPI 3: Novos Contatos */}
                    <Card className="p-5 relative overflow-hidden bg-white border-none shadow-sm group hover:shadow-md transition-all h-full">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-amber-50/50 rounded-full -translate-y-8 translate-x-8"></div>
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                <Reply className="text-amber-500 w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Novos Contatos</p>
                        <p className="text-3xl font-black text-slate-800 count-anim">{dashboardMetrics?.newContacts?.value || 0}</p>
                    </Card>

                    {/* KPI 4: TMA */}
                    <Card className="p-5 relative overflow-hidden border-none shadow-sm group hover:shadow-md transition-all h-full bg-white">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-8 translate-x-8"></div>
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Timer className="text-primary w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">TMA Médio</p>
                        <p className="text-3xl font-black text-slate-800 count-anim">{dashboardMetrics?.tma?.value || "12m"}</p>
                    </Card>

                    {/* KPI 5: Receita */}
                    <Card className="p-5 relative overflow-hidden border-none shadow-sm group hover:shadow-md transition-all h-full bg-white">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50/50 rounded-full -translate-y-8 translate-x-8"></div>
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <DollarSign className="text-emerald-600 w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Receita</p>
                        <p className="text-3xl font-black text-emerald-600 count-anim">R$ {dashboardMetrics?.revenue?.value?.toLocaleString('pt-BR') || 0}</p>
                        <p className="text-[10px] text-slate-500 mt-1 font-bold">Ticket: R$ {dashboardMetrics?.revenue?.ticketMedia?.toLocaleString('pt-BR') || 0}</p>
                    </Card>

                </div>

                {/* ── CHARTS ROW ─────────────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* Volume Chart */}
                    <Card className="p-5 lg:col-span-2 border-none shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="font-bold text-sm text-slate-800">Volume de Conversas</h3>
                                <p className="text-[11px] text-slate-500">Recebidas vs Resolvidas por hora</p>
                            </div>
                            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
                                <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded bg-primary inline-block"></span>Recebidas</span>
                                <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded bg-emerald-400 inline-block"></span>Resolvidas</span>
                                <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded bg-blue-400 inline-block"></span>TMA (min)</span>
                            </div>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={volumeChartData}>
                                    <CartesianGrid vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '8px', border: 'none', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                                    <Bar dataKey="total" fill="rgba(69, 10, 10, 0.12)" radius={[4, 4, 0, 0]} stroke="#f20d0d" strokeWidth={2} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Channel Chart */}
                    <Card className="p-5 border-none shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="font-bold text-sm text-slate-800">Volume por Canal</h3>
                                <p className="text-[11px] text-slate-500">Distribuição do período</p>
                            </div>
                        </div>
                        <div className="h-[180px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={channelData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {channelData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '8px', border: 'none', color: '#fff' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                <p className="text-2xl font-bold text-slate-800">{dashboardMetrics?.totalConversations?.value || 0}</p>
                                <p className="text-[10px] text-slate-400">Total</p>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            {channelData.map((channel, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                    <span className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: channel.color }}></span>
                                        {channel.name}
                                    </span>
                                    <span className="font-bold text-slate-800">{channel.value} <span className="text-slate-500 font-normal">({Math.round(channel.value / 247 * 100)}%)</span></span>
                                </div>
                            ))}
                        </div>
                    </Card>

                </div>

                {/* ── SEGUNDA LINHA DE GRÁFICOS ──────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* Origem dos Clientes */}
                    <Card className="p-5 border-none shadow-sm bg-white hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-sm text-slate-800">Origem dos Clientes</h3>
                                <p className="text-[11px] text-slate-500">Fonte de tráfego (UTM Source)</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {trafficData.length > 0 ? trafficData.map((s, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 bg-slate-50 font-bold text-slate-600">
                                        {(s?.name || "?").substring(0, 1)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-semibold text-slate-700">{s.name}</span>
                                            <span className="font-bold text-slate-800">{s.value} <span className="text-slate-500 font-normal">{s.pct}%</span></span>
                                        </div>
                                        <div className="h-1.5 bg-slate-100 rounded-full">
                                            <div className="h-1.5 rounded-full bg-primary" style={{ width: `${s.pct}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="h-full flex items-center justify-center text-slate-400 text-xs py-10">
                                    Sem dados de origem cadastrados.
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Funnel */}
                    <Card className="p-5 border-none shadow-sm bg-white hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-sm text-slate-800">Funil de Conversão</h3>
                                <p className="text-[11px] text-slate-500">Oportunidades no CRM</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {funnelData.length > 0 ? funnelData.map((step, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: step.color }}></span>
                                            {step.name}
                                        </span>
                                        <span className="font-bold text-slate-800">{step.value}</span>
                                    </div>
                                    <div className="h-6 bg-slate-50 rounded-md overflow-hidden relative border border-slate-100/50">
                                        <div className="h-6 opacity-10 rounded-md bar-fill flex items-center justify-end pr-2 absolute top-0 left-0" style={{ width: '100%', backgroundColor: step.color }}></div>
                                        <div className="h-6 rounded-md bar-fill flex items-center justify-end pr-2 absolute top-0 left-0" style={{ width: `${Math.max(10, (step.value / (funnelData[0]?.value || 1)) * 100)}%`, backgroundColor: step.color }}>
                                            <span className="text-[9px] text-white font-bold">{Math.round((step.value / (funnelData[0]?.value || 1)) * 100)}%</span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="h-full flex items-center justify-center text-slate-400 text-xs py-10">
                                    Configure seu Kanban para ver o funil.
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* TMA per Agent */}
                    <Card className="p-5 border-none shadow-sm bg-white hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-sm text-slate-800">TMA por Agente</h3>
                                <p className="text-[11px] text-slate-500">Tempo médio atendimento</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {agentPerformance.slice(0, 4).map((a, i) => (
                                <div key={i} className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-lg -mx-1.5 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                        {(a?.name || "?").substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-semibold text-slate-700 truncate">{a.name}</span>
                                            <span className="font-bold ml-2 text-emerald-600">{a.tma}</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-100 rounded-full">
                                            <div className="h-1.5 rounded-full bg-emerald-400 bar-fill" style={{ width: '60%' }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                </div>

                {/* ── BOTTOM ROW ─────────────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                    {/* Agent Ranking */}
                    <Card className="lg:col-span-2 border-none shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                        <div className="p-5 border-b border-border flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-sm text-slate-800">Ranking de Agentes</h3>
                                <p className="text-[11px] text-slate-500">Performance completa do período</p>
                            </div>
                            <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-1">
                                <button onClick={() => setAgentTab('atendimento')} className={cn("px-3 py-1 text-[10px] font-bold rounded-md transition-all", agentTab === 'atendimento' ? "bg-white shadow-sm text-text-dark" : "text-slate-500")}>Atendimento</button>
                                <button onClick={() => setAgentTab('vendas')} className={cn("px-3 py-1 text-[10px] font-bold rounded-md transition-all", agentTab === 'vendas' ? "bg-white shadow-sm text-text-dark" : "text-slate-500")}>Vendas</button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-50">
                                        <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider px-5 py-3">#</th>
                                        <th className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-3">Agente</th>
                                        <th className="text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-3">Atendidos</th>
                                        <th className="text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-3">Resolvidos</th>
                                        <th className="text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-3">TMR</th>
                                        <th className="text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-3">TMA</th>
                                        <th className="text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-3">CSAT</th>
                                        <th className="text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 py-3">Receita</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {agentPerformance.map((a, i) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                                            <td className="px-5 py-3.5 text-xs font-black text-slate-400">{i + 1}</td>
                                            <td className="px-3 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-8 h-8 rounded-full bg-slate-200 text-slate-600 text-xs font-bold flex items-center justify-center`}>{(a?.name || "?").substring(0, 2).toUpperCase()}</div>
                                                    <div><p className="text-xs font-bold text-slate-700">{a.name}</p><p className="text-[10px] text-slate-500">Agente</p></div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3.5 text-right text-xs font-bold text-slate-700">{a.conversations}</td>
                                            <td className="px-3 py-3.5 text-right text-xs font-bold text-emerald-600">{a.resolved}</td>
                                            <td className="px-3 py-3.5 text-right text-xs font-bold text-slate-700">{a.tmr || "0m"}</td>
                                            <td className="px-3 py-3.5 text-right text-xs font-bold text-slate-700">{a.tma}</td>
                                            <td className="px-3 py-3.5 text-right text-xs font-bold text-slate-700">⭐ 5.0</td>
                                            <td className="px-3 py-3.5 text-right text-xs font-bold text-emerald-600">R$ 0</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Right Column: Alerts & Campaigns */}
                    <div className="flex flex-col gap-4">
                        {/* SLA Critical List */}
                        <Card className="p-5 flex-1 border-none shadow-sm bg-white">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-primary" /> Aguardando Resposta
                                </h3>
                                <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10 cursor-pointer hover:bg-primary/10 transition-colors">Ver no inbox</span>
                            </div>
                            <div className="space-y-2.5">
                                {pendingConversations.length > 0 ? pendingConversations.map((c, i) => (
                                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-red-100 bg-red-50/50">
                                        <div className="w-8 h-8 rounded-full bg-white border border-red-100 text-red-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                            {(c?.contact?.firstName || c?.contact?.name || "?").substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-800 truncate">{c.contact.firstName || c.contact.name}</p>
                                            <p className="text-[10px] text-red-600 font-bold">⏱ {Math.round((new Date().getTime() - new Date(c.createdAt).getTime()) / 60000)} min sem resposta</p>
                                        </div>
                                        <div className="w-1 h-8 rounded-full bg-red-400 flex-shrink-0"></div>
                                    </div>
                                )) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-10 text-center gap-2">
                                        <CheckCircle className="w-8 h-8 text-emerald-400 opacity-20" />
                                        Nenhuma conversa aguardando resposta.
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Recent Campaigns */}
                        <Card className="p-5 border-none shadow-sm bg-white">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-sm text-slate-800">Campanhas Ativas</h3>
                                <button className="text-[10px] font-bold text-primary hover:underline">Ver todas</button>
                            </div>
                            <div className="space-y-4">
                                <div className="p-10 border-2 border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                                        <MessageSquare className="w-5 h-5 text-slate-300" />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sem Campanhas Ativas</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                </div>

            </main>
        </div>
    )
}
