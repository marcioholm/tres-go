"use client"

import { useLanguage } from "@/lib/language-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDateRangePicker } from "@/components/date-range-picker"
import { FileDown } from "lucide-react"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

export default function ReportsPage({ params }: { params: { workspaceId: string } }) {
    const { workspaceId } = params
    const { t } = useLanguage()
    const [metrics, setMetrics] = useState<any>(null)
    const [volumeData, setVolumeData] = useState<any[]>([])
    const [agentData, setAgentData] = useState<any[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [metricsRes, volumeRes, agentRes] = await Promise.all([
                    api.get(`/workspaces/${workspaceId}/reports/dashboard`),
                    api.get(`/workspaces/${workspaceId}/reports/volume`),
                    api.get(`/workspaces/${workspaceId}/reports/agents`)
                ])
                setMetrics(metricsRes.data)
                setVolumeData(volumeRes.data)
                setAgentData(agentRes.data)
            } catch (error) {
                console.error("Failed to fetch reports", error)
            }
        }
        fetchData()
    }, [workspaceId])

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Relatórios</h1>
                    <p className="text-slate-500 mt-2">Acompanhe métricas e indicadores de desempenho.</p>
                </div>
                <div className="flex items-center gap-2">
                    <CalendarDateRangePicker />
                    <Button variant="outline">
                        <FileDown className="mr-2 h-4 w-4" /> Exportar
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Conversas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,284</div>
                        <p className="text-xs text-muted-foreground">+20.1% vs mês anterior</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resolvidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,100</div>
                        <p className="text-xs text-muted-foreground">85% taxa de resolução</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Novos Contatos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+573</div>
                        <p className="text-xs text-muted-foreground">+201 desde semana passada</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tempo Médio (TMA)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4m 32s</div>
                        <p className="text-xs text-muted-foreground">-1m vs mês anterior</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="agents">Desempenho Agentes</TabsTrigger>
                    <TabsTrigger value="tags">Tags & Motivos</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Volume de Atendimentos</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[350px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={volumeData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="total" fill="#0f172a" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="agents" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Desempenho dos Agentes</CardTitle>
                            <CardDescription>Métricas individuais de produtividade.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {agentData.map((agent: any) => (
                                    <div key={agent.name} className="flex items-center">
                                        <div className="ml-4 space-y-1 w-full">
                                            <div className="flex justify-between">
                                                <p className="text-sm font-medium leading-none">{agent.name}</p>
                                                <p className="text-sm text-muted-foreground">{agent.resolved} resolvidas</p>
                                            </div>
                                            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-primary h-full"
                                                    style={{ width: `${(agent.resolved / agent.conversations) * 100}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground pt-1">
                                                TMA: {agent.tma} • {agent.conversations} conversas totais
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="tags" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tags & Motivos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[350px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg border-dashed border-2">
                                Em breve: Gráfico de distribuição de tags.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
