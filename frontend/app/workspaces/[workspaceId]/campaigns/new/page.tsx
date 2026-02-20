"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Check, Users, MessageSquare, Calendar as CalendarIcon, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Composer } from "@/components/chat/Composer"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

enum Step {
    DETAILS = 0,
    AUDIENCE = 1,
    MESSAGE = 2,
    SCHEDULE = 3
}

export default function NewCampaignPage() {
    const params = useParams()
    const router = useRouter()
    const workspaceId = params.workspaceId as string

    const [step, setStep] = useState<Step>(Step.DETAILS)
    const [loading, setLoading] = useState(false)
    const [previewCount, setPreviewCount] = useState<number | null>(null)

    // Form State
    const [name, setName] = useState("")
    const [type, setType] = useState("SIMPLE")
    const [selectedSource, setSelectedSource] = useState<string>("ALL")
    // Note: In a real app we would fetch available tags. 
    // For now we'll simulate or allow manual input/selection if tags component exists. 
    // Simplified: Just source filter for now to demonstrate layout.
    const [messageContent, setMessageContent] = useState("")
    const [mediaUrl, setMediaUrl] = useState<string | undefined>(undefined)
    const [mediaType, setMediaType] = useState<string | undefined>(undefined)
    const [delayBetween, setDelayBetween] = useState(3000)

    const handleNext = async () => {
        if (step === Step.DETAILS) {
            if (!name) { toast.error("Nome é obrigatório"); return }
            setStep(Step.AUDIENCE)
        } else if (step === Step.AUDIENCE) {
            // Check audience size
            checkAudience()
            setStep(Step.MESSAGE)
        } else if (step === Step.MESSAGE) {
            if (!messageContent && !mediaUrl) { toast.error("Mensagem vazia"); return }
            setStep(Step.SCHEDULE)
        }
    }

    const checkAudience = async () => {
        // Mock check or real API call to count contacts
        // In real app: POST /campaigns/preview-audience { filters }
        setPreviewCount(150 + Math.floor(Math.random() * 50)) // Mock
    }

    const handleCreate = async () => {
        setLoading(true)
        try {
            await api.post(`/workspaces/${workspaceId}/campaigns`, {
                name,
                type,
                content: messageContent,
                mediaUrl,
                mediaType,
                filterSource: selectedSource === "ALL" ? undefined : selectedSource,
                delayBetween
            })
            toast.success("Campanha criada com sucesso!")
            router.push(`/workspaces/${workspaceId}/campaigns`)
        } catch (error) {
            console.error("Failed to create campaign", error)
            toast.error("Erro ao criar campanha")
        } finally {
            setLoading(false)
        }
    }

    const steps = [
        { title: "Detalhes", icon: MessageSquare },
        { title: "Público", icon: Users },
        { title: "Mensagem", icon: File },
        { title: "Revisão", icon: Check }
    ]

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900">Nova Campanha</h1>
                </div>
            </div>

            {/* Stepper */}
            <div className="flex justify-between relative mb-10">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10" />
                {steps.map((s, idx) => (
                    <div key={idx} className={`flex flex-col items-center gap-2 bg-white px-2 ${idx <= step ? 'text-primary' : 'text-slate-400'}`}>
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors ${idx <= step ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-white'}`}>
                            {idx + 1}
                        </div>
                        <span className="text-xs font-medium">{s.title}</span>
                    </div>
                ))}
            </div>

            <Card className="min-h-[400px] flex flex-col">
                <CardContent className="flex-1 p-6">
                    {step === Step.DETAILS && (
                        <div className="space-y-4 max-w-md mx-auto py-10">
                            <div className="space-y-2">
                                <Label>Nome da Campanha</Label>
                                <Input
                                    placeholder="Ex: Oferta de Natal"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SIMPLE">Simples (Texto/Mídia)</SelectItem>
                                        {/* Future: Template */}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {step === Step.AUDIENCE && (
                        <div className="space-y-6 max-w-md mx-auto py-10">
                            <div className="space-y-2">
                                <Label>Filtrar por Origem</Label>
                                <Select value={selectedSource} onValueChange={setSelectedSource}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todas as origens" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Todas</SelectItem>
                                        <SelectItem value="GOOGLE_ADS">Google Ads</SelectItem>
                                        <SelectItem value="META_ADS">Meta Ads</SelectItem>
                                        <SelectItem value="WHATSAPP_DIRECT">WhatsApp Direct</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="p-4 bg-slate-50 rounded-lg border flex items-center gap-3">
                                <Users className="h-5 w-5 text-slate-400" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Estimativa de Público</p>
                                    <p className="text-xs text-slate-500">
                                        {previewCount !== null ? `~${previewCount} contatos` : "Calculando..."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === Step.MESSAGE && (
                        <div className="max-w-xl mx-auto py-6">
                            <Label className="mb-2 block">Conteúdo da Mensagem</Label>
                            <div className="border rounded-xl overflow-hidden shadow-sm">
                                <Composer
                                    onSendMessage={(text, url, type, isInternal) => {
                                        if (isInternal) {
                                            toast.error("Notas internas não permitidas em campanhas")
                                            return
                                        }
                                        setMessageContent(text)
                                        setMediaUrl(url)
                                        setMediaType(type)
                                        // Auto advance could happen here, but better to just set state and let user click Next
                                        toast.success("Mensagem definida!")
                                    }}
                                // Hide schedule button in composer as we schedule globally
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-2 text-center">
                                Use o compositor acima para definir o texto e mídia. Clique em enviar (aviãozinho) para confirmar o conteúdo.
                            </p>
                            {(messageContent || mediaUrl) && (
                                <div className="mt-4 p-3 bg-green-50 text-green-700 text-sm rounded border border-green-200">
                                    ✅ Mensagem definida: {messageContent.substring(0, 50)}{messageContent.length > 50 ? '...' : ''} {mediaUrl ? '(com mídia)' : ''}
                                </div>
                            )}
                        </div>
                    )}

                    {step === Step.SCHEDULE && (
                        <div className="space-y-6 max-w-md mx-auto py-10">
                            <div className="space-y-2">
                                <Label>Delay entre mensagens (ms)</Label>
                                <Input
                                    type="number"
                                    min={1000}
                                    value={delayBetween}
                                    onChange={(e) => setDelayBetween(Number(e.target.value))}
                                />
                                <p className="text-xs text-slate-500">Recomendado: 3000ms+ para evitar bloqueios.</p>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <h3 className="font-medium">Resumo</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <span className="text-slate-500">Nome:</span>
                                    <span>{name}</span>
                                    <span className="text-slate-500">Público:</span>
                                    <span className="flex items-center gap-1"><Filter className="h-3 w-3" /> {selectedSource === "ALL" ? "Todos" : selectedSource}</span>
                                    <span className="text-slate-500">Mensagem:</span>
                                    <span>{messageContent ? "Texto" : "Sem texto"} {mediaUrl ? "+ Mídia" : ""}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between border-t p-6">
                    <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                        Anterior
                    </Button>

                    {step < Step.SCHEDULE ? (
                        <Button onClick={handleNext}>
                            Próximo <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button className="bg-green-600 hover:bg-green-700" onClick={handleCreate} disabled={loading}>
                            {loading ? "Criando..." : "Criar Campanha"}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}

// Icon helper
function File({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
}
