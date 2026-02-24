"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, MessageCircle, Smartphone, Check, AlertTriangle, Facebook, Loader2, Link2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export default function IntegrationsPage() {
    const { t } = useLanguage()
    const { workspaceId } = useParams()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [step, setStep] = useState(1)
    const [provider, setProvider] = useState("")
    const [loading, setLoading] = useState(false)
    const [whatsappMode, setWhatsappMode] = useState("official") // 'official' | 'zapi'
    const [channelName, setChannelName] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [channels, setChannels] = useState<any[]>([])

    // Z-API Fields
    const [instanceId, setInstanceId] = useState("")
    const [instanceToken, setInstanceToken] = useState("")
    const [clientToken, setClientToken] = useState("")

    // Meta Fields
    const [phoneNumberId, setPhoneNumberId] = useState("")
    const [wabaId, setWabaId] = useState("")
    const [accessToken, setAccessToken] = useState("")

    useEffect(() => {
        const fetchChannels = async () => {
            setLoading(true)
            try {
                const res = await api.get(`/workspaces/${workspaceId}/channels`)
                setChannels(Array.isArray(res.data) ? res.data : [])
            } catch (err) {
                console.error('Failed to fetch channels:', err)
            } finally {
                setLoading(false)
            }
        }
        if (workspaceId && workspaceId !== 'undefined') fetchChannels()
    }, [workspaceId])

    const handleStartMetaOAuth = async (selectedType: 'INSTAGRAM' | 'MESSENGER') => {
        // Redireciona para o fluxo centralizado do backend
        const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://backend-tres-go.onrender.com';
        window.location.href = `${backendUrl}/auth/meta/login?workspaceId=${workspaceId}`;
    }

    const handleConnect = async () => {
        if (provider === 'instagram' || provider === 'messenger') {
            handleStartMetaOAuth(provider === 'instagram' ? 'INSTAGRAM' : 'MESSENGER')
            return
        }

        setError(null)

        if (provider === 'whatsapp' && whatsappMode === 'zapi') {
            if (!instanceId || !instanceToken || !clientToken || !channelName || !phoneNumber) {
                setError("Por favor, preencha todos os campos da Z-API, o nome do canal e o número.")
                return
            }

            setLoading(true)
            try {
                const res = await api.post(`/workspaces/${workspaceId}/channels`, {
                    name: channelName,
                    phoneNumber,
                    type: 'WHATSAPP', // Or 'ZAPI' if we want to be explicit, but WHATSAPP + config works
                    status: 'ACTIVE',
                    config: {
                        instanceId,
                        instanceToken,
                        clientToken
                    }
                })
                setChannels(prev => [...prev, res.data])
                setStep(2)
            } catch (err: any) {
                console.error("Failed to connect Z-API:", err)
                setError(err.response?.data?.message || "Falha ao conectar Z-API")
            } finally {
                setLoading(false)
            }
            return
        }

        // Official WhatsApp logic
        if (provider === 'whatsapp' && whatsappMode === 'official') {
            if (!phoneNumberId || !wabaId || !accessToken || !channelName || !phoneNumber) {
                setError("Por favor, preencha todos os campos obrigatórios.")
                return
            }

            setLoading(true)
            try {
                const res = await api.post(`/workspaces/${workspaceId}/channels`, {
                    name: channelName,
                    phoneNumber,
                    type: 'WHATSAPP',
                    status: 'ACTIVE',
                    phoneNumberId,
                    wabaId,
                    accessToken,
                })
                setChannels(prev => [...prev, res.data])
                setStep(2)
            } catch (err: any) {
                console.error("Failed to connect Meta WhatsApp:", err)
                setError(err.response?.data?.message || "Falha ao conectar via Meta")
            } finally {
                setLoading(false)
            }
            return
        }
    }

    const handleClose = () => {
        setIsDialogOpen(false)
        setTimeout(() => {
            setStep(1)
            setProvider("")
            setWhatsappMode("official")
            setChannelName("")
            setPhoneNumber("")
            setError(null)
        }, 300)
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 h-full overflow-y-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Integrações</h1>
                    <p className="text-slate-500 mt-2">Gerencie suas conexões com canais de comunicação.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-200 gap-2 font-bold">
                            <Plus className="h-4 w-4" />
                            NOVA CONEXÃO
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] bg-white">
                        <DialogHeader>
                            <DialogTitle>Conectar Novo Canal</DialogTitle>
                            <DialogDescription>
                                {step === 1 ? "Escolha um provedor para integrar à plataforma." : "Verificando credenciais..."}
                            </DialogDescription>
                        </DialogHeader>

                        {step === 1 ? (
                            <div className="grid gap-6 py-4">
                                {/* Provider Selection */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div
                                        className={`border-2 rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${provider === 'whatsapp' ? 'border-green-500 bg-green-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                                        onClick={() => {
                                            setProvider('whatsapp')
                                            setError(null)
                                        }}
                                    >
                                        <div className="p-2 bg-green-100 rounded-full">
                                            <MessageCircle className="h-6 w-6 text-green-600" />
                                        </div>
                                        <span className="font-semibold text-sm text-slate-700">WhatsApp</span>
                                    </div>
                                    <div
                                        className={`border-2 rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${provider === 'instagram' ? 'border-pink-500 bg-pink-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                                        onClick={() => setProvider('instagram')}
                                    >
                                        <div className="p-2 bg-pink-100 rounded-full">
                                            <Smartphone className="h-6 w-6 text-pink-600" />
                                        </div>
                                        <span className="font-semibold text-sm text-slate-700">Instagram</span>
                                    </div>
                                    <div
                                        className={`border-2 rounded-xl p-4 flex flex-col items-center gap-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${provider === 'messenger' ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                                        onClick={() => setProvider('messenger')}
                                    >
                                        <div className="p-2 bg-blue-100 rounded-full">
                                            <Facebook className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <span className="font-semibold text-sm text-slate-700">Messenger</span>
                                    </div>
                                </div>

                                {/* WhatsApp Config */}
                                {provider === 'whatsapp' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center justify-center p-1 bg-slate-100 rounded-lg">
                                            <Button
                                                variant={whatsappMode === 'official' ? 'default' : 'ghost'}
                                                size="sm"
                                                onClick={() => setWhatsappMode('official')}
                                                className={`flex-1 rounded-md transition-all ${whatsappMode === 'official' ? 'bg-white text-slate-900 shadow-sm hover:bg-white' : 'text-slate-500 hover:text-slate-900'}`}
                                            >
                                                API Oficial (Meta)
                                            </Button>
                                            <Button
                                                variant={whatsappMode === 'zapi' ? 'default' : 'ghost'}
                                                size="sm"
                                                onClick={() => setWhatsappMode('zapi')}
                                                className={`flex-1 rounded-md transition-all ${whatsappMode === 'zapi' ? 'bg-white text-slate-900 shadow-sm hover:bg-white' : 'text-slate-500 hover:text-slate-900'}`}
                                            >
                                                Z-API (Não Oficial)
                                            </Button>
                                        </div>

                                        {whatsappMode === 'official' ? (
                                            <div className="space-y-4 p-4 border rounded-lg bg-slate-50/50">
                                                <div className="space-y-2">
                                                    <Label>Nome do Canal</Label>
                                                    <Input placeholder="Ex: WhatsApp Suporte" value={channelName} onChange={e => setChannelName(e.target.value)} className="bg-white" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Número do WhatsApp</Label>
                                                    <Input placeholder="Ex: 5511999999999" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="bg-white" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Phone Number ID</Label>
                                                    <Input placeholder="Ex: 10593..." value={phoneNumberId} onChange={e => setPhoneNumberId(e.target.value)} className="bg-white" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>WABA ID (WhatsApp Business Account)</Label>
                                                    <Input placeholder="Ex: 10293..." value={wabaId} onChange={e => setWabaId(e.target.value)} className="bg-white" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Access Token (Permanente)</Label>
                                                    <Input type="password" placeholder="EAAG..." value={accessToken} onChange={e => setAccessToken(e.target.value)} className="bg-white" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-900">
                                                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                                                    <AlertTitle className="text-amber-800 font-bold">Atenção: Risco de Bloqueio</AlertTitle>
                                                    <AlertDescription className="text-amber-800/80 text-xs mt-1">
                                                        A integração via Z-API/QR Code não é oficial da Meta. O uso intenso pode violar os Termos de Serviço e resultar no banimento irreversível do número.
                                                    </AlertDescription>
                                                </Alert>
                                                {error && (
                                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-semibold flex items-center gap-2 border border-red-100">
                                                        <AlertTriangle size={14} /> {error}
                                                    </div>
                                                )}
                                                <div className="p-4 border rounded-lg bg-slate-50/50 space-y-4">
                                                    <div className="space-y-2">
                                                        <Label>Nome do Canal</Label>
                                                        <Input placeholder="Ex: WhatsApp Vendas" value={channelName} onChange={e => setChannelName(e.target.value)} className="bg-white" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Número do WhatsApp</Label>
                                                        <Input placeholder="Ex: 5511999999999" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="bg-white" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Instance ID</Label>
                                                        <Input placeholder="Ex: 3A2B1C..." value={instanceId} onChange={e => setInstanceId(e.target.value)} className="bg-white" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Instance Token</Label>
                                                        <Input type="password" placeholder="Ex: 5F3G2H..." value={instanceToken} onChange={e => setInstanceToken(e.target.value)} className="bg-white" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Client Token</Label>
                                                        <Input type="password" placeholder="Ex: 8J9K0L..." value={clientToken} onChange={e => setClientToken(e.target.value)} className="bg-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Instagram/Messenger Config */}
                                {(provider === 'instagram' || provider === 'messenger') && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 p-4 border rounded-lg bg-slate-50/50">
                                        {error && (
                                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-semibold flex items-center gap-2 border border-red-100">
                                                <AlertTriangle size={14} /> {error}
                                            </div>
                                        )}
                                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
                                            <p className="text-xs text-blue-700 font-medium">
                                                Você será redirecionado para o Facebook para selecionar as páginas que deseja conectar.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center gap-6 text-center animate-in zoom-in-50 duration-300">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
                                    <div className="relative h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                                        <Check className="h-8 w-8 text-green-600" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-slate-900">Conectado com Sucesso!</h3>
                                    <p className="text-slate-500 max-w-xs mx-auto">
                                        O canal foi configurado e já está pronto para processar mensagens.
                                    </p>
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            {step === 1 && (
                                <Button type="submit" onClick={handleConnect} disabled={!provider || loading} className="bg-red-600 hover:bg-red-700 w-full h-11 font-bold shadow-md shadow-red-100">
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            CONECTANDO...
                                        </>
                                    ) : (
                                        (provider === 'instagram' || provider === 'messenger') ? "CONECTAR COM FACEBOOK" : "SALVAR E CONECTAR"
                                    )}
                                </Button>
                            )}
                            {step === 2 && (
                                <Button onClick={handleClose} className="w-full bg-slate-900 hover:bg-slate-800 h-11 font-bold">
                                    FECHAR
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {channels.map((channel) => (
                    <Card key={channel.id} className={`border-l-4 ${channel.type === 'INSTAGRAM' ? 'border-l-pink-500' : channel.type === 'MESSENGER' ? 'border-l-blue-500' : 'border-l-green-500'} shadow-sm hover:shadow-md transition-shadow`}>
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${channel.type === 'INSTAGRAM' ? 'bg-pink-50' : channel.type === 'MESSENGER' ? 'bg-blue-50' : 'bg-green-50'}`}>
                                        {channel.type === 'INSTAGRAM' ? <Smartphone className="h-7 w-7 text-pink-600" /> : channel.type === 'MESSENGER' ? <Facebook className="h-7 w-7 text-blue-600" /> : <MessageCircle className="h-7 w-7 text-green-600" />}
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-bold text-slate-800">{channel.name}</CardTitle>
                                        <CardDescription className="text-xs mt-1 flex flex-col gap-0.5">
                                            {channel.type === 'INSTAGRAM' && (
                                                <span className="text-pink-600 font-semibold">{channel.igUsername ? `@${channel.igUsername}` : '@perfil_instagram'}</span>
                                            )}
                                            {channel.type === 'WHATSAPP' && (
                                                <span className="text-green-600 font-semibold">{channel.phoneNumber || 'Sem número'}</span>
                                            )}
                                            {channel.pageName && (
                                                <span className="text-slate-500 text-[10px] uppercase tracking-wider">Página: {channel.pageName}</span>
                                            )}
                                        </CardDescription>
                                    </div>
                                </div>
                                <Badge className={`${channel.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                                    {channel.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Provedor:</span>
                                <span className="font-semibold text-slate-700 flex items-center gap-1">
                                    <Check className="h-3 w-3 text-blue-500" />
                                    {(channel.config as any)?.instanceId ? 'Z-API' : 'Oficial'}
                                </span>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-2 gap-3">
                            <Button asChild variant="outline" size="sm" className="flex-1 font-semibold text-slate-600">
                                <Link href={`/workspaces/${workspaceId}/settings/channels`}>
                                    Configurar
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                <Card
                    className="border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-8 space-y-4 hover:bg-red-50/30 hover:border-red-200 transition-all cursor-pointer group"
                    onClick={() => setIsDialogOpen(true)}
                >
                    <div className="h-14 w-14 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Plus className="h-7 w-7 text-slate-400 group-hover:text-red-500 transition-colors" />
                    </div>
                    <div className="text-center space-y-1">
                        <h3 className="font-bold text-slate-800 group-hover:text-red-600 transition-colors">Nova Conexão</h3>
                        <p className="text-sm text-slate-500 px-4">Adicione WhatsApp, Instagram ou Messenger</p>
                    </div>
                </Card>
            </div>
        </div>
    )
}
