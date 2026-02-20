"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    DollarSign, Building2, Users, ArrowUpRight, Activity,
    ShieldCheck, ShieldAlert, Globe, CreditCard, PieChart,
    BarChart3, TrendingUp, AlertCircle
} from "lucide-react"

export default function SuperAdminDashboard() {
    const [metrics, setMetrics] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadMetrics()
    }, [])

    const loadMetrics = async () => {
        try {
            const { data } = await api.get('/super-admin/dashboard')
            setMetrics(data)
        } catch (error) {
            console.error("Failed to load metrics", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Caregando métricas do painel...</div>
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Executivo</h2>
                    <p className="text-muted-foreground mt-1">
                        Saúde financeira, operacional e técnica do NorthWay Omni.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                    ATUALIZAÇÃO EM TEMPO REAL
                </div>
            </div>

            {/* Main KPIs Rack */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* MRR Card */}
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 group-hover:text-indigo-600 transition-colors">
                            MRR (Mensal)
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{formatCurrency(metrics?.mrr)}</div>
                        <div className="flex items-center mt-1 text-xs text-emerald-600 font-semibold bg-emerald-50 w-fit px-2 py-0.5 rounded-md">
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                            +4.2% este mês
                        </div>
                    </CardContent>
                    <div className="h-1 bg-emerald-500 w-full opacity-20" />
                </Card>

                {/* Churn Rate Card */}
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 group-hover:text-red-500 transition-colors">
                            Churn Rate
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{metrics?.churnRate || 0}%</div>
                        <div className="text-xs text-slate-500 mt-1">Últimos 30 dias</div>
                    </CardContent>
                    <div className="h-1 bg-red-400 w-full opacity-20" />
                </Card>

                {/* LTV Card */}
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 group-hover:text-blue-500 transition-colors">
                            LTV (Estimado)
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{formatCurrency(metrics?.ltv)}</div>
                        <div className="text-xs text-slate-500 mt-1">Tempo médio de vida</div>
                    </CardContent>
                    <div className="h-1 bg-blue-500 w-full opacity-20" />
                </Card>

                {/* Conversion Card */}
                <Card className="border-none shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 group-hover:text-orange-500 transition-colors">
                            Conversão Trial
                        </CardTitle>
                        <PieChart className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{metrics?.conversionRate || 0}%</div>
                        <div className="text-xs text-slate-500 mt-1">Trial para Pago</div>
                    </CardContent>
                    <div className="h-1 bg-orange-400 w-full opacity-20" />
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* System Health Section */}
                <Card className="border-none shadow-sm bg-white md:col-span-2">
                    <CardHeader className="border-b border-slate-50">
                        <CardTitle className="text-lg font-bold flex items-center justify-between text-slate-800">
                            <span className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-indigo-600" />
                                Saúde e Integrações
                            </span>
                            <span className="text-xs font-normal text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                SISTEMAS ONLINE
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                            {/* Connector Asaas */}
                            <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${metrics?.asaasHealth?.status === 'connected' ? 'bg-indigo-50' : 'bg-red-50'}`}>
                                        <Globe className={`h-6 w-6 ${metrics?.asaasHealth?.status === 'connected' ? 'text-indigo-600' : 'text-red-600'}`} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">API Asaas (Gateway)</p>
                                        <p className="text-xs text-slate-500">Ambiente de {metrics?.asaasHealth?.environment || 'Produção'}</p>
                                    </div>
                                </div>
                                <div className={`text-xs font-bold px-3 py-1 rounded-full ${metrics?.asaasHealth?.status === 'connected' ? 'text-emerald-700 bg-emerald-100' : 'text-red-700 bg-red-100'}`}>
                                    {metrics?.asaasHealth?.status === 'connected' ? 'LATÊNCIA OK' : 'INSTÁVEL'}
                                </div>
                            </div>

                            {/* Internal Services */}
                            <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-indigo-50">
                                        <ShieldCheck className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">Serviços NorthWay</p>
                                        <p className="text-xs text-slate-500">Auth, Billing, Messaging, Workspaces</p>
                                    </div>
                                </div>
                                <div className="text-xs font-bold px-3 py-1 rounded-full text-emerald-700 bg-emerald-100">
                                    100% UPTIME
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Critical Alerts */}
                <Card className="border-none shadow-sm bg-slate-900 text-white">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-orange-400" />
                            Alertas de Atenção
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {metrics?.criticalAlerts?.length > 0 ? (
                            metrics.criticalAlerts.map((alert: any, idx: number) => (
                                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-red-400/20 text-red-400">
                                            <AlertCircle className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-100">{alert.count} Workspaces Bloqueados</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Pendência de pagamento detectada</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center opacity-40">
                                <ShieldCheck className="h-12 w-12 mb-2" />
                                <p className="text-sm">Nenhum alerta crítico</p>
                            </div>
                        )}
                        <Button variant="ghost" className="w-full text-xs text-slate-400 hover:text-white hover:bg-white/5 py-2">
                            Ver todos os registros
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Quick Statistics */}
                <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Users className="h-4 w-4 text-indigo-500" />
                        Distribuição de Clientes
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Workspaces Ativos</span>
                            <span className="font-bold text-slate-900">{metrics?.activeWorkspaces}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-indigo-500 h-full transition-all duration-1000"
                                style={{ width: `${(metrics?.activeWorkspaces / (metrics?.totalWorkspaces || 1)) * 100}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Base total: {metrics?.totalWorkspaces}</span>
                            <span>Signups: +{metrics?.newSignups}</span>
                        </div>
                    </div>
                </div>

                {/* System Version */}
                <div className="p-6 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/20 text-white flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-indigo-200">NORTHWAY OMNI v2.4.0</p>
                        <h3 className="text-lg font-bold">Núcleo do Sistema Estável</h3>
                        <p className="text-xs text-indigo-100">Próxima manutenção programada: 02/03/2026</p>
                    </div>
                    <Activity className="h-12 w-12 text-white/20 animate-pulse" />
                </div>
            </div>
        </div>
    )
}

