"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts"
import { DollarSign, TrendingUp, Calendar, CreditCard } from "lucide-react"

const monthlyData = [
    { name: "Set", total: 4500 },
    { name: "Out", total: 5200 },
    { name: "Nov", total: 4800 },
    { name: "Dez", total: 6100 },
    { name: "Jan", total: 7500 },
    { name: "Fev", total: 8900 },
]

export default function RevenueAnalysis() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadFinancials()
    }, [])

    const loadFinancials = async () => {
        try {
            const { data } = await api.get('/super-admin/reports/financial')
            setStats(data)
        } catch (error) {
            console.error("Failed to load financials", error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
    }

    if (loading) return <div className="p-8 text-center text-slate-500">Analisando dados financeiros...</div>

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Análise de Receita</h2>
                    <p className="text-slate-500 mt-1">Desempenho financeiro e projeções de faturamento.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-xl border-slate-200">
                        <Calendar className="h-4 w-4 mr-2" />
                        Últimos 6 Meses
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Receita Total</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats?.totalRevenue)}</div>
                        <p className="text-xs text-emerald-600 mt-1 flex items-center font-bold">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +12% vs mês anterior
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ticket Médio</CardTitle>
                        <CreditCard className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats?.totalRevenue / (stats?.count || 1))}</div>
                        <p className="text-xs text-slate-400 mt-1">Baseado em {stats?.count} faturas</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-indigo-600 text-white overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Inadimplência</CardTitle>
                        <AlertCircle className="h-4 w-4 text-white/50" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2.4%</div>
                        <p className="text-xs text-indigo-100 mt-1">Excelente estado de saúde</p>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Chart */}
            <Card className="border-none shadow-sm bg-white overflow-hidden p-6">
                <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-lg font-bold text-slate-800">Crescimento de Receita</CardTitle>
                </CardHeader>
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                            />
                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                                {monthlyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 5 ? '#4f46e5' : '#e2e8f0'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    )
}

function AlertCircle(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
}

function Button({ children, className, variant }: any) {
    return <button className={`px-4 py-2 rounded-md font-medium ${className}`}>{children}</button>
}
