"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Play, Pause, Trash2, Users, Calendar, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useLanguage } from "@/lib/language-context"
import { toast } from "sonner"

interface Campaign {
    id: string
    name: string
    status: 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED'
    type: string
    createdAt: string
    repliesCount: number
    filterTagIds: string[]
    filterSource?: string
}

export default function CampaignsPage() {
    const { t } = useLanguage()
    const params = useParams()
    const router = useRouter()
    const workspaceId = params.workspaceId as string
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCampaigns()
    }, [workspaceId])

    const fetchCampaigns = async () => {
        setLoading(true)
        try {
            const { data } = await api.get(`/workspaces/${workspaceId}/campaigns`)
            setCampaigns(data)
        } catch (error) {
            console.error("Failed to fetch campaigns", error)
            toast.error("Erro ao carregar campanhas")
        } finally {
            setLoading(false)
        }
    }

    const handleStart = async (id: string) => {
        try {
            await api.post(`/workspaces/${workspaceId}/campaigns/${id}/start`)
            toast.success("Campanha iniciada!")
            fetchCampaigns()
        } catch (error) {
            console.error("Failed to start campaign", error)
            toast.error("Erro ao iniciar campanha")
        }
    }

    const handlePause = async (id: string) => {
        try {
            await api.post(`/workspaces/${workspaceId}/campaigns/${id}/pause`)
            toast.success("Campanha pausada!")
            fetchCampaigns()
        } catch (error) {
            console.error("Failed to pause campaign", error)
            toast.error("Erro ao pausar campanha")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta campanha?")) return
        try {
            await api.delete(`/workspaces/${workspaceId}/campaigns/${id}`)
            toast.success("Campanha excluída!")
            fetchCampaigns()
        } catch (error) {
            console.error("Failed to delete campaign", error)
            toast.error("Erro ao excluir campanha")
        }
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Campanhas</h1>
                    <p className="text-slate-500">Gerencie seus disparos em massa e automações.</p>
                </div>
                <Button onClick={() => router.push(`/workspaces/${workspaceId}/campaigns/new`)} className="bg-red-600 hover:bg-red-700">
                    <Plus className="mr-2 h-4 w-4" /> Nova Campanha
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-10 text-slate-500">Carregando campanhas...</div>
            ) : campaigns.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed rounded-xl bg-slate-50">
                    <MessageSquare className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">Nenhuma campanha encontrada</h3>
                    <p className="text-slate-500 mb-6">Crie sua primeira campanha para engajar seus contatos.</p>
                    <Button onClick={() => router.push(`/workspaces/${workspaceId}/campaigns/new`)} variant="outline">
                        Criar Campanha
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {campaigns.map((campaign) => (
                        <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge
                                        variant={campaign.status === 'RUNNING' ? 'default' : 'secondary'}
                                        className={campaign.status === 'RUNNING' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                                    >
                                        {campaign.status}
                                    </Badge>
                                    <div className="flex gap-1">
                                        {campaign.status === 'RUNNING' ? (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-500" onClick={() => handlePause(campaign.id)} title="Pausar">
                                                <Pause className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={() => handleStart(campaign.id)} title="Iniciar">
                                                <Play className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => handleDelete(campaign.id)} title="Excluir">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <CardTitle className="text-lg">{campaign.name}</CardTitle>
                                <CardDescription className="text-xs">
                                    Criada em {format(new Date(campaign.createdAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4 text-slate-400" />
                                        <span>
                                            {(campaign.filterTagIds?.length || 0) + (campaign.filterSource ? 1 : 0)} filtros
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageSquare className="h-4 w-4 text-slate-400" />
                                        <span>{campaign.repliesCount} respostas</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 text-xs text-slate-400 border-t mt-2">
                                ID: {campaign.id.substring(0, 8)}...
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
