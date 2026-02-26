"use client"

import React, { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import {
    MessageSquare,
    Users,
    CheckCircle,
    Timer,
    ArrowUpRight,
    ArrowDownRight,
    Globe,
    AlertTriangle,
    Download,
    DollarSign,
    Target,
    Activity,
    Zap,
    Trophy,
    TrendingUp
} from 'lucide-react';
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { SmartBanner } from "@/components/dashboard/SmartBanner"
import { NorthwayScore } from "@/components/dashboard/NorthwayScore"
import { PostOnboardingModal } from "@/components/dashboard/PostOnboardingModal"
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
    const [user, setUser] = useState<any>(null)
    const [showPostOnboarding, setShowPostOnboarding] = useState(false)
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

                const userRes = await api.get(`/workspaces/${params.workspaceId}/users/me`)
                setUser(userRes.data)
                if (!userRes.data?.welcomeShown) {
                    setShowPostOnboarding(true)
                }
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
            {/* ══ HEADER ══════════════════════════════════════════════════════════════ */}
            <div className="flex items-center justify-between px-8 py-3 bg-white border-b border-[#F0F0F0] h-14">
                <h1 className="text-[16px] font-semibold text-[#0F0F0F]">Dashboard</h1>
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-[#F5F5F5] rounded-md p-0.5">
                        <button onClick={() => setPeriod('hoje')} className={cn("px-3 py-1 text-[11px] font-medium rounded transition-all", period === 'hoje' ? "bg-white text-[#0F0F0F] shadow-sm" : "text-[#6B6B6B] hover:text-[#0F0F0F]")}>Hoje</button>
                        <button onClick={() => setPeriod('7d')} className={cn("px-3 py-1 text-[11px] font-medium rounded transition-all", period === '7d' ? "bg-white text-[#0F0F0F] shadow-sm" : "text-[#6B6B6B] hover:text-[#0F0F0F]")}>7 dias</button>
                        <button onClick={() => setPeriod('30d')} className={cn("px-3 py-1 text-[11px] font-medium rounded transition-all", period === '30d' ? "bg-white text-[#0F0F0F] shadow-sm" : "text-[#6B6B6B] hover:text-[#0F0F0F]")}>30 dias</button>
                    </div>
                    <Button variant="outline" className="h-8 text-[11px] font-semibold border-[#F0F0F0] text-[#6B6B6B] hover:bg-[#F5F5F5]">
                        <Download className="w-3.5 h-3.5 mr-2" /> Exportar
                    </Button>
                </div>
            </div>

            {/* ══ MAIN ════════════════════════════════════════════════════════════════ */}
            <main className="p-8 space-y-8 max-w-[1400px] mx-auto">

                {/* Smart Banner */}
                <SmartBanner workspaceId={params.workspaceId} position="TOP" />

                {/* Northway Score & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                    <div className="lg:col-span-2">
                        <NorthwayScore workspaceId={params.workspaceId} />
                    </div>
                    <Card className="p-6 border-[#F0F0F0] shadow-sm bg-black text-white flex flex-col justify-between overflow-hidden relative">
                        <div className="absolute -right-4 -top-4 h-24 w-24 bg-white/10 rounded-full blur-2xl" />
                        <div>
                            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                                <Trophy className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="text-[15px] font-bold mb-1">Crescimento Acelerado</h4>
                            <p className="text-[13px] text-zinc-400">Desbloqueie estratégias avançadas de vendas e automação com a Assessoria.</p>
                        </div>
                        <Button className="w-full bg-white text-black hover:bg-zinc-200 font-bold h-10 mt-6">
                            AGENDAR CONSULTORIA
                        </Button>
                    </Card>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {/* Conversas Hoje */}
                    <Card className="p-5 bg-white border-[#F0F0F0] shadow-none rounded-lg relative group">
                        <MessageSquare className="absolute top-5 right-5 w-4 h-4 text-[#D1D5DB] stroke-[1.5px]" />
                        <p className="text-[12px] font-medium text-[#6B6B6B] mb-1">Conversas Hoje</p>
                        <div className="flex items-end gap-2">
                            <h2 className="text-[32px] font-semibold text-[#0F0F0F] leading-tight font-mono">
                                {dashboardMetrics?.totalConversations?.value || 0}
                            </h2>
                            <span className="text-[13px] font-medium text-[#16A34A] mb-1.5">+12%</span>
                        </div>
                    </Card>

                    {/* Faturamento */}
                    <Card className="p-5 bg-white border-[#F0F0F0] shadow-none rounded-lg relative group overflow-hidden">
                        <div className="absolute top-0 right-0 p-3">
                            <TrendingUp className="w-4 h-4 text-green-500/30" />
                        </div>
                        <p className="text-[12px] font-bold text-[#6B6B6B] mb-1 uppercase tracking-tight">Faturamento (30d)</p>
                        <div className="flex items-end gap-2">
                            <h2 className="text-[28px] font-black text-[#0F0F0F] leading-tight">
                                R$ {(dashboardMetrics?.revenue?.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                            </h2>
                            <span className="text-[13px] font-medium text-[#16A34A] mb-1.5">+15%</span>
                        </div>
                    </Card>

                    {/* Ticket Médio */}
                    <Card className="p-5 bg-white border-[#F0F0F0] shadow-none rounded-lg relative group">
                        <DollarSign className="absolute top-5 right-5 w-4 h-4 text-[#D1D5DB] stroke-[1.5px]" />
                        <p className="text-[12px] font-bold text-[#6B6B6B] mb-1 uppercase tracking-tight">Ticket Médio</p>
                        <div className="flex items-end gap-2">
                            <h2 className="text-[28px] font-black text-[#0F0F0F] leading-tight">
                                R$ {(dashboardMetrics?.revenue?.ticketMedia || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                            </h2>
                            <span className="text-[13px] font-medium text-[#6B6B6B] mb-1.5">estável</span>
                        </div>
                    </Card>

                    {/* Resolvidas */}
                    <Card className="p-5 bg-white border-[#F0F0F0] shadow-none rounded-lg relative group">
                        <CheckCircle className="absolute top-5 right-5 w-4 h-4 text-[#D1D5DB] stroke-[1.5px]" />
                        <p className="text-[12px] font-bold text-[#6B6B6B] mb-1 uppercase tracking-tight">Resolvidas</p>
                        <div className="flex items-end gap-2">
                            <h2 className="text-[28px] font-black text-[#0F0F0F] leading-tight">
                                {dashboardMetrics?.resolved?.value || 0}
                            </h2>
                            <span className="text-[13px] font-medium text-[#16A34A] mb-1.5">
                                {dashboardMetrics?.resolved?.rate || 0}%
                            </span>
                        </div>
                    </Card>

                    {/* Conversas Abertas (Moved here or simplified) */}
                    <Card className="p-5 bg-white border-[#F0F0F0] shadow-none rounded-lg relative group">
                        <Users className="absolute top-5 right-5 w-4 h-4 text-[#D1D5DB] stroke-[1.5px]" />
                        <p className="text-[12px] font-bold text-[#6B6B6B] mb-1 uppercase tracking-tight">Novos Leads</p>
                        <div className="flex items-end gap-2">
                            <h2 className="text-[28px] font-black text-[#0F0F0F] leading-tight">
                                {dashboardMetrics?.newContacts?.value || 0}
                            </h2>
                            <span className="text-[13px] font-medium text-[#16A34A] mb-1.5">+5%</span>
                        </div>
                    </Card>
                </div>

                {/* ROW 2: CHART & RECENT CONVERSATIONS */}
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
                    {/* Volume Chart (60%) */}
                    <Card className="lg:col-span-6 p-6 bg-white border-[#F0F0F0] shadow-none rounded-lg">
                        <div className="flex flex-col mb-6">
                            <h3 className="text-[14px] font-semibold text-[#0F0F0F]">Volume de Mensagens</h3>
                            <p className="text-[12px] text-[#6B6B6B]">Atividade nos últimos 7 dias</p>
                        </div>
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={volumeData}>
                                    <CartesianGrid vertical={false} stroke="#F0F0F0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B6B6B' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B6B6B' }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #F0F0F0', boxShadow: 'none', fontSize: '11px' }} />
                                    <Line type="monotone" dataKey="total" stroke="#E8202A" strokeWidth={2} dot={{ r: 4, fill: '#E8202A', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Recent Conversations (40%) */}
                    <Card className="lg:col-span-4 p-6 bg-white border-[#F0F0F0] shadow-none rounded-lg flex flex-col">
                        <h3 className="text-[14px] font-semibold text-[#0F0F0F] mb-4">Conversas Recentes</h3>
                        <div className="space-y-4 flex-1">
                            {pendingConversations.slice(0, 5).map((chat, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[10px] font-bold text-[#0F0F0F] border border-[#F0F0F0]">
                                            {(chat?.contact?.name || "?").substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[13px] font-medium text-[#0F0F0F] truncate">{chat.contact.name}</span>
                                            <span className="text-[11px] text-[#6B6B6B]">Há 5 min</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] px-2 py-0.5 rounded bg-[#F5F5F5] text-[#6B6B6B] font-medium">Aguardando</span>
                                    </div>
                                </div>
                            ))}
                            {pendingConversations.length === 0 && (
                                <div className="h-full flex items-center justify-center text-[12px] text-[#6B6B6B] py-10">
                                    Nenhuma conversa pendente.
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* ROW 3: TOP AGENTS, CHANNELS, FUNNEL */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Top Agentes */}
                    <Card className="p-6 bg-white border-[#F0F0F0] shadow-none rounded-lg">
                        <h3 className="text-[14px] font-semibold text-[#0F0F0F] mb-4">Top Agentes</h3>
                        <div className="space-y-4">
                            {agentPerformance.slice(0, 5).map((a, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[11px] font-bold text-[#9CA3AF] w-4">{i + 1}</span>
                                        <div className="w-7 h-7 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[9px] font-bold text-[#0F0F0F]">
                                            {(a?.name || "?").substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className="text-[13px] font-medium text-[#0F0F0F] truncate">{a.name}</span>
                                    </div>
                                    <span className="text-[12px] font-bold text-[#0F0F0F]">{a.resolved}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Canais Conectados */}
                    <Card className="p-6 bg-white border-[#F0F0F0] shadow-none rounded-lg">
                        <h3 className="text-[14px] font-semibold text-[#0F0F0F] mb-4">Canais Conectados</h3>
                        <div className="space-y-4">
                            {sectors.slice(0, 5).map((s, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                                            <Globe className="w-3.5 h-3.5 text-[#6B6B6B]" />
                                        </div>
                                        <span className="text-[13px] font-medium text-[#0F0F0F]">{s.name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                                        <span className="text-[11px] text-[#6B6B6B] font-medium">On</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Funnel Resumido */}
                    <Card className="p-6 bg-white border-[#F0F0F0] shadow-none rounded-lg">
                        <h3 className="text-[14px] font-semibold text-[#0F0F0F] mb-4">Funil de Vendas</h3>
                        <div className="space-y-4">
                            {funnelData.slice(0, 5).map((step, i) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between text-[12px]">
                                        <span className="text-[#6B6B6B] font-medium">{step.name}</span>
                                        <span className="text-[#0F0F0F] font-bold">{step.value}</span>
                                    </div>
                                    <div className="h-1 bg-[#F5F5F5] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#E8202A] rounded-full transition-all duration-1000"
                                            style={{ width: `${(step.value / (funnelData[0]?.value || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

            </main>
            {/* Dashboard Footer / Extra Space */}
            <div className="h-20" />

            <PostOnboardingModal
                isOpen={showPostOnboarding}
                onClose={() => setShowPostOnboarding(false)}
                workspaceId={params.workspaceId}
            />
        </div>
    )
}
