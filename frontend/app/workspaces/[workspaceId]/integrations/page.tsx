"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
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
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [step, setStep] = useState(1)
    const [provider, setProvider] = useState("")
    const [loading, setLoading] = useState(false)
    const [whatsappMode, setWhatsappMode] = useState("official") // 'official' | 'zapi'

    const handleConnect = () => {
        setLoading(true)
        // Simulate connection delay
        setTimeout(() => {
            setStep(2)
            setLoading(false)
        }, 2000)
    }

    const handleClose = () => {
        setIsDialogOpen(false)
        setTimeout(() => {
            setStep(1)
            setProvider("")
            setWhatsappMode("official")
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
                                        onClick={() => setProvider('whatsapp')}
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
                                                    <Label>Phone Number ID</Label>
                                                    <Input placeholder="Ex: 10593..." className="bg-white" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>WABA ID (WhatsApp Business Account)</Label>
                                                    <Input placeholder="Ex: 10293..." className="bg-white" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Access Token (Permanente)</Label>
                                                    <Input type="password" placeholder="EAAG..." className="bg-white" />
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
                                                <div className="p-4 border rounded-lg bg-slate-50/50 space-y-4">
                                                    <div className="space-y-2">
                                                        <Label>Instance ID</Label>
                                                        <Input placeholder="Ex: 3A2B1C..." className="bg-white" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Instance Token</Label>
                                                        <Input type="password" placeholder="Ex: 5F3G2H..." className="bg-white" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Client Token</Label>
                                                        <Input type="password" placeholder="Ex: 8J9K0L..." className="bg-white" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Instagram/Messenger Config */}
                                {(provider === 'instagram' || provider === 'messenger') && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 p-4 border rounded-lg bg-slate-50/50">
                                        <div className="space-y-2">
                                            <Label>Page ID (Facebook Page)</Label>
                                            <Input placeholder="Ex: 102938..." className="bg-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Access Token (Long Lived)</Label>
                                            <Input type="password" placeholder="EAAG..." className="bg-white" />
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            Certifique-se de que a conta do Instagram Business está vinculada à Página do Facebook fornecida.
                                        </p>
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
                                        "SALVAR E CONECTAR"
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
                {/* Active Connection Card Example */}
                <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <MessageCircle className="h-7 w-7 text-green-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-bold text-slate-800">Comercial</CardTitle>
                                    <CardDescription className="font-mono text-xs mt-1">+55 11 99999-9999</CardDescription>
                                </div>
                            </div>
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                                ATIVO
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Provedor:</span>
                            <span className="font-semibold text-slate-700 flex items-center gap-1">
                                <Check className="h-3 w-3 text-blue-500" /> API Oficial
                            </span>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-2 gap-3">
                        <Button variant="outline" size="sm" className="flex-1 font-semibold text-slate-600">Testar</Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 font-semibold text-slate-600"
                            onClick={() => {
                                setProvider("whatsapp")
                                setWhatsappMode("official")
                                setIsDialogOpen(true)
                            }}
                        >
                            Configurar
                        </Button>
                    </CardFooter>
                </Card>

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
