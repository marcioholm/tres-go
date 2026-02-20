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
    const [isLoadingSectors, setIsLoadingSectors] = useState(true)

    // Fetch Sector Metrics
    useEffect(() => {
        const fetchSectors = async () => {
            try {
                const response = await api.get(`/workspaces/${params.workspaceId}/reports/sectors`)
                setSectors(response.data)
            } catch (error) {
                console.error("Failed to fetch sector metrics", error)
            } finally {
                setIsLoadingSectors(false)
            }
        }
        fetchSectors()
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

    // Mock Data for Charts
    const volumeData = [
        { hour: '08h', recebidas: 8, resolvidas: 6, tma: 12 },
        { hour: '09h', recebidas: 14, resolvidas: 11, tma: 15 },
        { hour: '10h', recebidas: 22, resolvidas: 18, tma: 20 },
        { hour: '11h', recebidas: 19, resolvidas: 15, tma: 22 },
        { hour: '12h', recebidas: 12, resolvidas: 10, tma: 18 },
        { hour: '13h', recebidas: 7, resolvidas: 5, tma: 14 },
        { hour: '14h', recebidas: 24, resolvidas: 20, tma: 19 },
        { hour: '15h', recebidas: 21, resolvidas: 18, tma: 17 },
        { hour: '16h', recebidas: 18, resolvidas: 15, tma: 21 },
        { hour: '17h', recebidas: 16, resolvidas: 13, tma: 16 },
        { hour: '18h', recebidas: 11, resolvidas: 9, tma: 13 },
        { hour: '19h', recebidas: 6, resolvidas: 4, tma: 11 },
    ]

    const channelData = [
        { name: 'WhatsApp Oficial', value: 143, color: '#4ade80' },
        { name: 'Instagram', value: 68, color: '#f472b6' },
        { name: 'Messenger', value: 23, color: '#60a5fa' },
        { name: 'Z-API', value: 13, color: '#cbd5e1' },
    ]

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
                        {isLoadingSectors ? (
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
                        {sectors.length === 0 && !isLoadingSectors && (
                            <Card className="p-5 lg:col-span-4 flex items-center justify-center border-dashed border-2 text-slate-400 text-xs">
                                Nenhum setor configurado. Vá em Configurações para adicionar.
                            </Card>
                        )}
                    </div>
                </div>

                {/* ── KPI GRID ──────────────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* KPI 1: Total conversas */}
                    <Card className="p-5 relative overflow-hidden kpi-shimmer border-none shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-8 translate-x-8"></div>
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <MessageSquare className="text-blue-500 w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12% ↑</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Conversas</p>
                        <p className="text-3xl font-black text-slate-800 count-anim">247</p>
                        <div className="mt-3 flex items-center gap-2">
                            <div className="flex-1 h-1 bg-slate-100 rounded-full">
                                <div className="h-1 bg-blue-400 rounded-full bar-fill" style={{ width: '73%' }}></div>
                            </div>
                            <span className="text-[10px] text-slate-500 font-semibold">73% meta</span>
                        </div>
                    </Card>

                    {/* KPI 2: Resolvidas */}
                    <Card className="p-5 relative overflow-hidden kpi-shimmer border-none shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -translate-y-8 translate-x-8"></div>
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <CheckCircle className="text-emerald-500 w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+8% ↑</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Resolvidas</p>
                        <p className="text-3xl font-black text-slate-800 count-anim">189</p>
                        <div className="mt-3 flex items-center gap-2">
                            <div className="flex-1 h-1 bg-slate-100 rounded-full">
                                <div className="h-1 bg-emerald-400 rounded-full bar-fill" style={{ width: '76%' }}></div>
                            </div>
                            <span className="text-[10px] text-slate-500 font-semibold">76% taxa</span>
                        </div>
                    </Card>

                    {/* KPI 3: TMR */}
                    <Card className="p-5 relative overflow-hidden kpi-shimmer border-none shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -translate-y-8 translate-x-8"></div>
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                <Reply className="text-amber-500 w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">-3min ↓</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tempo Médio Resposta</p>
                        <p className="text-3xl font-black text-slate-800 count-anim">4<span className="text-lg font-bold text-slate-500">min</span></p>
                        <p className="text-[10px] text-slate-500 mt-1">Desde a última mensagem do cliente</p>
                    </Card>

                    {/* KPI 4: TMA */}
                    <Card className="p-5 relative overflow-hidden kpi-shimmer border-l-4 border-l-primary border-t-0 border-r-0 border-b-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-8 translate-x-8"></div>
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Timer className="text-primary w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">NOVO</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tempo Médio Atendimento</p>
                        <p className="text-3xl font-black text-slate-800 count-anim">18<span className="text-lg font-bold text-slate-500">min</span></p>
                        <p className="text-[10px] text-slate-500 mt-1">Da aceitação à resolução</p>
                    </Card>

                </div>

                {/* Segunda linha de KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* KPI 5: Receita */}
                    <Card className="p-5 relative overflow-hidden border-none shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <DollarSign className="text-emerald-600 w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+24% ↑</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Receita do Período</p>
                        <p className="text-2xl font-black text-emerald-600">R$ 48.290</p>
                        <p className="text-[10px] text-slate-500 mt-1">Ticket médio: <strong>R$ 890</strong></p>
                    </Card>

                    {/* KPI 6: Taxa Resolução */}
                    <Card className="p-5 relative overflow-hidden border-none shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">
                                <Award className="text-violet-500 w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+5% ↑</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Resolução 1º Contato</p>
                        <p className="text-2xl font-black text-slate-800">68<span className="text-base font-bold text-slate-500">%</span></p>
                        <p className="text-[10px] text-slate-500 mt-1">128 de 189 resolvidas</p>
                    </Card>

                    {/* KPI 7: CSAT */}
                    <Card className="p-5 relative overflow-hidden border-none shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
                                <Smile className="text-pink-500 w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">142 respostas</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Satisfação (CSAT)</p>
                        <p className="text-2xl font-black text-slate-800">4.7<span className="text-base font-bold text-slate-500">/5</span></p>
                        <div className="flex gap-0.5 mt-1">
                            {[1, 2, 3, 4].map(i => (
                                <span key={i} className="text-amber-400 text-sm">★</span>
                            ))}
                            <span className="text-slate-200 text-sm">★</span>
                        </div>
                    </Card>

                    {/* KPI 8: SLA Crítico */}
                    <Card className="p-5 relative overflow-hidden border-l-4 border-l-amber-400 border-t-0 border-r-0 border-b-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                <AlertTriangle className="text-amber-500 w-5 h-5" />
                            </div>
                            <button className="text-[10px] font-bold text-primary hover:underline">Ver todas</button>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">SLA Crítico</p>
                        <p className="text-2xl font-black text-amber-500">7</p>
                        <p className="text-[10px] text-slate-500 mt-1">Aguardando &gt; 30 min sem resposta</p>
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
                                <ComposedChart data={volumeData}>
                                    <CartesianGrid vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6366f1' }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '8px', border: 'none', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                                    <Bar dataKey="recebidas" fill="rgba(242,13,13,0.12)" radius={[4, 4, 0, 0]} stroke="#f20d0d" strokeWidth={2} />
                                    <Bar dataKey="resolvidas" fill="rgba(52,211,153,0.15)" radius={[4, 4, 0, 0]} stroke="#10b981" strokeWidth={2} />
                                    <Line type="monotone" dataKey="tma" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#6366f1' }} yAxisId="right" />
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
                                <p className="text-2xl font-bold text-slate-800">247</p>
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
                    <Card className="p-5 border-none shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-sm text-slate-800">Origem dos Clientes</h3>
                                <p className="text-[11px] text-slate-500">Fonte de tráfego</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {[
                                { name: 'Google Ads', prev: '🔵', color: 'bg-blue-500', bg: 'bg-[#e8f0fe]', val: 89, pct: 36 },
                                { name: 'Meta Ads', prev: '🔴', color: 'bg-red-400', bg: 'bg-[#fce8e8]', val: 72, pct: 29 },
                                { name: 'Indicação', prev: '🤝', color: 'bg-emerald-400', bg: 'bg-[#ecfdf5]', val: 41, pct: 17 },
                                { name: 'Instagram', prev: '📱', color: 'bg-pink-400', bg: 'bg-[#fdf4ff]', val: 28, pct: 11 },
                                { name: 'Outros', prev: '📞', color: 'bg-amber-400', bg: 'bg-[#fffbeb]', val: 17, pct: 7 },

                            ].map((s, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0" style={{ backgroundColor: s.bg.replace('bg-', '') }}>{s.prev}</div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-semibold text-slate-700">{s.name}</span>
                                            <span className="font-bold text-slate-800">{s.val} <span className="text-slate-500 font-normal">{s.pct}%</span></span>
                                        </div>
                                        <div className="h-1.5 bg-slate-100 rounded-full">
                                            <div className={`h-1.5 rounded-full bar-fill ${s.color}`} style={{ width: `${s.pct}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Funnel */}
                    <Card className="p-5 border-none shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-sm text-slate-800">Funil de Conversão</h3>
                                <p className="text-[11px] text-slate-500">Kanban → Receita</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {[
                                { name: 'Novo Lead', color: 'bg-blue-400', val: 89, pct: 100 },
                                { name: 'Contato Realizado', color: 'bg-amber-400', val: 71, pct: 80 },
                                { name: 'Proposta Enviada', color: 'bg-orange-400', val: 48, pct: 54 },
                                { name: 'Negociação', color: 'bg-red-400', val: 31, pct: 35 },
                                { name: 'Ganho ✨', color: 'bg-emerald-500', val: 19, pct: 21 },
                            ].map((step, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${step.color} inline-block`}></span>{step.name}</span>
                                        <span className="font-bold text-slate-800">{step.val}</span>
                                    </div>
                                    <div className="h-6 bg-slate-50 rounded-md overflow-hidden relative">
                                        <div className={`h-6 ${step.color} rounded-md bar-fill flex items-center justify-end pr-2 absolute top-0 left-0 bg-opacity-20`} style={{ width: '100%' }}></div>
                                        <div className={`h-6 ${step.color} rounded-md bar-fill flex items-center justify-end pr-2 absolute top-0 left-0`} style={{ width: `${step.pct}%` }}>
                                            <span className="text-[9px] text-white font-bold">{step.pct}%</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* TMA per Agent */}
                    <Card className="p-5 border-none shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-sm text-slate-800">TMA por Agente</h3>
                                <p className="text-[11px] text-slate-500">Tempo médio atendimento</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {[
                                { name: 'Marcos Oliveira', initials: 'MO', color: 'bg-emerald-500', time: '11min', sla: 'ok', pct: 55 },
                                { name: 'Carlos Eduardo', initials: 'CE', color: 'bg-blue-500', time: '14min', sla: 'ok', pct: 70 },
                                { name: 'Agente Silva', initials: 'AS', color: 'bg-primary', time: '22min', sla: 'warn', pct: 100 },
                                { name: 'Bruno Mendes', initials: 'BM', color: 'bg-violet-500', time: '34min', sla: 'crit', pct: 100 },
                            ].map((a, i) => (
                                <div key={i} className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-lg -mx-1.5 transition-colors">
                                    <div className={`w-8 h-8 rounded-full ${a.color} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>{a.initials}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-semibold text-slate-700 truncate">{a.name}</span>
                                            <span className={`font-bold ml-2 flex-shrink-0 ${a.sla === 'ok' ? 'text-emerald-600' : a.sla === 'warn' ? 'text-amber-600' : 'text-red-600'}`}>
                                                {a.time}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-slate-100 rounded-full">
                                            <div className={`h-1.5 rounded-full bar-fill ${a.sla === 'ok' ? 'bg-emerald-400' : a.sla === 'warn' ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${a.pct}%` }}></div>
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
                                    {[
                                        { rank: '🥇', name: 'Marcos Oliveira', role: 'Admin', color: 'bg-emerald-500', atendidos: 54, resolvidos: 49, tmr: '2min', tma: '11min', csat: '4.9', receita: 'R$ 18.400' },
                                        { rank: '🥈', name: 'Carlos Eduardo', role: 'Agente', color: 'bg-blue-500', atendidos: 47, resolvidos: 41, tmr: '3min', tma: '14min', csat: '4.8', receita: 'R$ 15.200' },
                                        { rank: '🥉', name: 'Agente Silva', role: 'Agente', color: 'bg-primary', atendidos: 38, resolvidos: 29, tmr: '5min', tma: '22min', csat: '4.6', receita: 'R$ 9.800' },
                                        { rank: '4', name: 'Bruno Mendes', role: 'Agente', color: 'bg-violet-500', atendidos: 28, resolvidos: 18, tmr: '8min', tma: '34min', csat: '4.1', receita: 'R$ 4.890' },
                                    ].map((a, i) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                                            <td className="px-5 py-3.5 text-xs font-black text-slate-400">{a.rank}</td>
                                            <td className="px-3 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-8 h-8 rounded-full ${a.color} text-white text-xs font-bold flex items-center justify-center`}>{a.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</div>
                                                    <div><p className="text-xs font-bold text-slate-700">{a.name}</p><p className="text-[10px] text-slate-500">{a.role}</p></div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3.5 text-right text-xs font-bold text-slate-700">{a.atendidos}</td>
                                            <td className="px-3 py-3.5 text-right text-xs font-bold text-emerald-600">{a.resolvidos}</td>
                                            <td className="px-3 py-3.5 text-right text-xs font-bold text-slate-700">{a.tmr}</td>
                                            <td className="px-3 py-3.5 text-right text-xs font-bold text-slate-700">{a.tma}</td>
                                            <td className="px-3 py-3.5 text-right text-xs font-bold text-slate-700">⭐ {a.csat}</td>
                                            <td className="px-3 py-3.5 text-right text-xs font-bold text-emerald-600">{a.receita}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Right Column: Alerts & Campaigns */}
                    <div className="flex flex-col gap-4">
                        {/* SLA Critical List */}
                        <Card className="p-5 flex-1 border-none shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-sm text-slate-800">⚠️ Aguardando Resposta</h3>
                                <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10 cursor-pointer hover:bg-primary/10 transition-colors">Ver no inbox</span>
                            </div>
                            <div className="space-y-2.5">
                                {[
                                    { name: 'João Pereira', time: '47 min', risk: 'high', bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600', bar: 'bg-red-400' },
                                    { name: 'Ana Carvalho', time: '38 min', risk: 'high', bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600', bar: 'bg-red-400' },
                                    { name: 'Rafael Moura', time: '31 min', risk: 'warn', bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', bar: 'bg-amber-400' },
                                ].map((c, i) => (
                                    <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl border ${c.bg} ${c.border}`}>
                                        <div className={`w-8 h-8 rounded-full bg-white/50 ${c.text} text-xs font-bold flex items-center justify-center flex-shrink-0`}>{c.name.split(' ').map(n => n[0]).join('').substring(0, 2)}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-800 truncate">{c.name}</p>
                                            <p className={`text-[10px] ${c.text} font-bold`}>⏱ {c.time} sem resposta</p>
                                        </div>
                                        <div className={`w-1.5 h-8 rounded-full ${c.bar} flex-shrink-0`}></div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Recent Campaigns */}
                        <Card className="p-5 border-none shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-sm text-slate-800">Campanhas Ativas</h3>
                                <button className="text-[10px] font-bold text-primary hover:underline">Ver todas</button>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="font-semibold text-slate-700">Promoção Fevereiro</span>
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 rounded-full">76%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-2 bg-emerald-400 rounded-full bar-fill" style={{ width: '76%' }}></div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-0.5">912 / 1.200 enviados</p>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="font-semibold text-slate-700">Reativação VIP</span>
                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 rounded-full">Agendada</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-2 bg-blue-300 rounded-full bar-fill" style={{ width: '0%' }}></div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Inicia em 25/02 às 09:00</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                </div>

            </main>
        </div>
    )
}
