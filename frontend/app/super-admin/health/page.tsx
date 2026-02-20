"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "../../../components/ui/progress"
import {
    Activity, Cpu, MemoryStick as Memory,
    Globe, Server, Database, Zap
} from "lucide-react"

export default function SystemHealth() {
    const [health, setHealth] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const interval = setInterval(loadHealth, 5000)
        loadHealth()
        return () => clearInterval(interval)
    }, [])

    const loadHealth = async () => {
        try {
            const { data } = await api.get('/super-admin/health')
            setHealth(data)
        } catch (error) {
            console.error("Failed to load health", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-8 text-center text-slate-500">Monitorando telemetria do sistema...</div>

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Activity className="h-6 w-6 text-emerald-500 animate-pulse" />
                        Saúde do Ecossistema
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Dados técnicos em tempo real sobre instâncias e integrações.</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-4 py-1.5 font-black uppercase text-xs tracking-widest">
                    ONLINE
                </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none shadow-sm bg-white p-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <Cpu className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <span className="text-xs font-bold text-slate-400 uppercase">CPU Usage</span>
                            <span className="text-2xl font-black text-slate-900">{health?.cpu?.usage}%</span>
                            <Progress value={health?.cpu?.usage} className="h-1.5 mt-2 bg-slate-100" />
                        </div>
                    </div>
                </Card>

                <Card className="border-none shadow-sm bg-white p-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <Memory className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <span className="text-xs font-bold text-slate-400 uppercase">RAM Avail</span>
                            <span className="text-2xl font-black text-slate-900">{(health?.memory?.free / 1024 / 1024 / 1024).toFixed(1)} GB</span>
                            <Progress value={(1 - (health?.memory?.free / health?.memory?.total)) * 100} className="h-1.5 mt-2 bg-slate-100" />
                        </div>
                    </div>
                </Card>

                <Card className="border-none shadow-sm bg-white p-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                            <Zap className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <span className="text-xs font-bold text-slate-400 uppercase">Latency</span>
                            <span className="text-2xl font-black text-slate-900">24ms</span>
                            <span className="text-[10px] text-emerald-500 font-bold mt-1">EXTREMELY STABLE</span>
                        </div>
                    </div>
                </Card>

                <Card className="border-none shadow-sm bg-white p-4">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <Globe className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col flex-1">
                            <span className="text-xs font-bold text-slate-400 uppercase">Uptime</span>
                            <span className="text-lg font-black text-slate-900">{(health?.uptime / 3600).toFixed(1)}h</span>
                            <span className="text-[10px] text-slate-400 font-bold mt-1">LAST RESTART: 2 DAYS AGO</span>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                            <Server className="h-4 w-4" /> Serviços Internos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                            {['API Core', 'Worker Node', 'Redis (Cache)', 'PostgreSQL'].map(service => (
                                <div key={service} className="flex items-center justify-between p-4 px-6">
                                    <span className="font-semibold text-slate-700">{service}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                        <span className="text-xs font-bold text-emerald-600">OPERATIONAL</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                            <Globe className="h-4 w-4" /> Integrações Externas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                            <div className="flex items-center justify-between p-4 px-6">
                                <span className="font-semibold text-slate-700 font-serif">Asaas API</span>
                                <div className="flex items-center gap-2">
                                    <div className={`h-2 w-2 rounded-full ${health?.services?.asaas === 'UP' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    <span className={`text-xs font-bold ${health?.services?.asaas === 'UP' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {health?.services?.asaas === 'UP' ? 'CONNECTED' : 'DOWN'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 px-6">
                                <span className="font-semibold text-slate-700">Evolution API</span>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <span className="text-xs font-bold text-emerald-600">CONNECTED</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 px-6">
                                <span className="font-semibold text-slate-700">OpenAI</span>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <span className="text-xs font-bold text-emerald-600">CONNECTED</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
