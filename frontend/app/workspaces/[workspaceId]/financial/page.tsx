"use client"

import React, { useState, useEffect } from "react"
import {
    DollarSign,
    TrendingUp,
    ShoppingBag,
    Users,
    ArrowUpRight,
    Download,
    Calendar,
    Filter,
    Search,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    BadgePercent,
    ArrowDownRight,
    MoreHorizontal
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { api } from "@/lib/api"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area
} from "recharts"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function FinancialPage({ params: paramsPromise }: { params: Promise<{ workspaceId: string }> }) {
    const params = React.use(paramsPromise)
    const [isLoading, setIsLoading] = useState(true)
    const [report, setReport] = useState<any>(null)
    const [sales, setSales] = useState<any[]>([])
    const [period, setPeriod] = useState('30d')

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const [reportRes, salesRes] = await Promise.all([
                    api.get(`/workspaces/${params.workspaceId}/sales/report`, { params: { period } }),
                    api.get(`/workspaces/${params.workspaceId}/sales`, { params: { limit: 10 } })
                ])
                setReport(reportRes.data)
                setSales(salesRes.data)
            } catch (error) {
                console.error("Failed to fetch financial data", error)
            } finally {
                setIsLoading(false)
            }
        }
        if (params.workspaceId) fetchData()
    }, [params.workspaceId, period])

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    }

    const exportToCSV = () => {
        if (sales.length === 0) return

        const headers = ["ID", "Data", "Título", "Cliente", "Agente", "Canal", "Valor", "Status", "Pagamento"]
        const rows = sales.map(s => [
            s.id,
            format(new Date(s.saleDate), 'dd/MM/yyyy HH:mm'),
            s.title,
            s.contact?.name || 'N/A',
            `${s.agent?.firstName || ''} ${s.agent?.lastName || ''}`.trim(),
            s.channel?.name || 'Manual',
            s.amount,
            s.status,
            s.paymentMethod
        ])

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(r => r.join(",")).join("\n")

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `vendas_${format(new Date(), 'yyyy-MM-dd')}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    if (isLoading && !report) {
        return <div className="flex-1 flex items-center justify-center">Carregando dados financeiros...</div>
    }

    return (
        <div className="flex-1 p-8 pt-6 space-y-8 max-w-[1400px] mx-auto bg-[#FAFAFA]">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[24px] font-black text-[#0F0F0F]">Financeiro</h1>
                    <p className="text-[14px] text-[#6B6B6B] font-medium">Acompanhe sua receita e desempenho de vendas</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[180px] h-10 border-[#F0F0F0] bg-white">
                            <Calendar className="h-4 w-4 mr-2 text-[#6B6B6B]" />
                            <SelectValue placeholder="Período" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-[#F0F0F0]">
                            <SelectItem value="hoje">Hoje</SelectItem>
                            <SelectItem value="7d">Últimos 7 dias</SelectItem>
                            <SelectItem value="30d">Últimos 30 dias</SelectItem>
                            <SelectItem value="90d">Últimos 90 dias</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-10 border-[#F0F0F0] font-bold gap-2 text-[#0F0F0F] bg-white hover:bg-[#F5F5F5]"
                        onClick={exportToCSV}
                    >
                        <Download className="h-4 w-4" />
                        EXPORTAR CSV
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 border-[#F0F0F0] shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 rounded-lg bg-[#F0F7FF] flex items-center justify-center text-[#0052CC]">
                            <DollarSign className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold text-[#16A34A] bg-[#DCFCE7] border-none">
                            +12.5%
                        </Badge>
                    </div>
                    <p className="text-[12px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-1">Receita Total</p>
                    <h2 className="text-2xl font-black text-[#0F0F0F]">{formatCurrency(report?.totalRevenue || 0)}</h2>
                    <p className="text-[11px] text-[#9CA3AF] mt-2 font-medium">Considerando apenas pagamentos confirmados</p>
                </Card>

                <Card className="p-6 border-[#F0F0F0] shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 rounded-lg bg-[#F2FCF5] flex items-center justify-center text-[#166534]">
                            <ShoppingBag className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold text-[#16A34A] bg-[#DCFCE7] border-none">
                            +8.2%
                        </Badge>
                    </div>
                    <p className="text-[12px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-1">Total de Vendas</p>
                    <h2 className="text-2xl font-black text-[#0F0F0F]">{report?.totalSales || 0}</h2>
                    <p className="text-[11px] text-[#9CA3AF] mt-2 font-medium">Vendas registradas no período</p>
                </Card>

                <Card className="p-6 border-[#F0F0F0] shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 rounded-lg bg-[#FFF9F0] flex items-center justify-center text-[#92400E]">
                            <BadgePercent className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold text-[#E8202A] bg-[#FEE2E2] border-none">
                            -2.1%
                        </Badge>
                    </div>
                    <p className="text-[12px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-1">Ticket Médio</p>
                    <h2 className="text-2xl font-black text-[#0F0F0F]">{formatCurrency(report?.averageTicket || 0)}</h2>
                    <p className="text-[11px] text-[#9CA3AF] mt-2 font-medium">Valor médio por transação</p>
                </Card>

                <Card className="p-6 border-[#F0F0F0] shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-10 w-10 rounded-lg bg-[#F5F5F5] flex items-center justify-center text-[#0F0F0F]">
                            <CreditCard className="h-5 w-5" />
                        </div>
                        <div className="flex items-center gap-1 text-[#EAB308]">
                            <TrendingUp className="h-3 w-3" />
                            <span className="text-[10px] font-bold">EM ABERTO</span>
                        </div>
                    </div>
                    <p className="text-[12px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-1">A Receber</p>
                    <h2 className="text-2xl font-black text-[#0F0F0F]">{formatCurrency(report?.pendingRevenue || 0)}</h2>
                    <p className="text-[11px] text-[#9CA3AF] mt-2 font-medium">Vendas com pagamento pendente</p>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 border-[#F0F0F0] shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-[16px] font-bold text-[#0F0F0F]">Receita por Período</h3>
                            <p className="text-[12px] text-[#6B6B6B] font-medium">Evolução diária do faturamento</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={report?.byPeriod || []}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#E8202A" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#E8202A" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }}
                                    tickFormatter={(val) => format(new Date(val), 'dd/MM', { locale: ptBR })}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }}
                                    tickFormatter={(val) => `R$ ${val / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(val: any) => [formatCurrency(val), "Receita"]}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="totalRevenue"
                                    stroke="#E8202A"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRev)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="p-6 border-[#F0F0F0] shadow-sm bg-white">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-[16px] font-bold text-[#0F0F0F]">Vendas por Canal</h3>
                            <p className="text-[12px] text-[#6B6B6B] font-medium">Origem das conversões</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={report?.byChannel || []} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F0F0F0" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="channelName"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#0F0F0F', fontWeight: 'bold' }}
                                    width={100}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar
                                    dataKey="totalRevenue"
                                    fill="#0F0F0F"
                                    radius={[0, 4, 4, 0]}
                                    barSize={20}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Bottom Row - Performance & Recent Sales */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 p-6 border-[#F0F0F0] shadow-sm bg-white">
                    <h3 className="text-[16px] font-bold text-[#0F0F0F] mb-6">Top Agentes</h3>
                    <div className="space-y-6">
                        {report?.byAgent?.slice(0, 5).map((agent: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[10px] font-bold text-[#0F0F0F] border border-[#F0F0F0]">
                                        {agent.agentName.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-[#0F0F0F]">{agent.agentName}</p>
                                        <p className="text-[11px] text-[#6B6B6B]">{agent.totalSales} vendas</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[13px] font-black text-[#0F0F0F]">{formatCurrency(agent.totalRevenue)}</p>
                                    <p className="text-[10px] font-bold text-[#16A34A]">Ticket: {formatCurrency(agent.averageTicket)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="ghost" className="w-full mt-6 text-[12px] font-bold text-[#6B6B6B] hover:bg-[#F5F5F5]">
                        VER RANKING COMPLETO
                    </Button>
                </Card>

                <Card className="lg:col-span-2 p-0 border-[#F0F0F0] shadow-sm bg-white overflow-hidden">
                    <div className="p-6 border-b border-[#F0F0F0] flex items-center justify-between">
                        <h3 className="text-[16px] font-bold text-[#0F0F0F]">Últimas Vendas</h3>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]" />
                            <Input placeholder="Buscar venda..." className="h-8 pl-9 text-[12px] border-[#F0F0F0] bg-[#FAFAFA]" />
                        </div>
                    </div>
                    <Table>
                        <TableHeader className="bg-[#FAFAFA] border-b border-[#F0F0F0]">
                            <TableRow>
                                <TableHead className="text-[11px] font-bold text-[#6B6B6B] uppercase h-10 px-6">Venda</TableHead>
                                <TableHead className="text-[11px] font-bold text-[#6B6B6B] uppercase h-10">Cliente</TableHead>
                                <TableHead className="text-[11px] font-bold text-[#6B6B6B] uppercase h-10">Valor</TableHead>
                                <TableHead className="text-[11px] font-bold text-[#6B6B6B] uppercase h-10">Status</TableHead>
                                <TableHead className="text-[11px] font-bold text-[#6B6B6B] uppercase h-10 text-right pr-6">Ação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sales.map((sale) => (
                                <TableRow key={sale.id} className="border-b border-[#F0F0F0] hover:bg-[#FAFAFA] group transition-colors">
                                    <TableCell className="px-6 py-4">
                                        <p className="text-[13px] font-bold text-[#0F0F0F]">{sale.title}</p>
                                        <p className="text-[11px] text-[#9CA3AF] font-medium">{format(new Date(sale.saleDate), 'dd MMM, HH:mm', { locale: ptBR })}</p>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[8px] font-bold text-[#0F0F0F]">
                                                {sale.contact?.name?.substring(0, 2).toUpperCase() || 'NA'}
                                            </div>
                                            <span className="text-[13px] font-medium text-[#0F0F0F]">{sale.contact?.name || 'Cliente'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-[13px] font-black text-[#0F0F0F]">{formatCurrency(sale.amount)}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded-full border-none",
                                            sale.paymentStatus === 'PAID' ? "bg-[#DCFCE7] text-[#166534]" :
                                                sale.paymentStatus === 'PENDING' ? "bg-[#FEF9C3] text-[#854D0E]" : "bg-[#FEE2E2] text-[#991B1B]"
                                        )}>
                                            {sale.paymentStatus === 'PAID' ? 'PAGO' : sale.paymentStatus === 'PENDING' ? 'PENDENTE' : 'CANCELADO'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#9CA3AF] hover:text-[#0F0F0F] group-hover:bg-white">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="p-4 bg-[#FAFAFA] flex items-center justify-between border-t border-[#F0F0F0]">
                        <p className="text-[11px] text-[#6B6B6B] font-medium">Mostrando 10 de {report?.totalSales || 0} vendas</p>
                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" className="h-8 w-8 border-[#F0F0F0] bg-white disabled:opacity-50" disabled>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8 border-[#F0F0F0] bg-white">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
