"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { ArrowLeft, Camera, ShieldCheck } from "lucide-react"

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/auth/profile')
            setUser(data)
        } catch (error) {
            toast.error("Erro ao carregar perfil")
            router.push('/workspaces/default')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            // Mock de salvamento - Implementação real dependeria dos endpoints de auth
            await new Promise(resolve => setTimeout(resolve, 800))
            toast.success("Perfil atualizado com sucesso!")
        } catch (error) {
            toast.error("Erro ao salvar alterações")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="flex items-center justify-center min-h-screen">Carregando...</div>

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar - Foto e Status */}
                    <div className="md:w-1/3 space-y-6">
                        <Card>
                            <CardHeader className="text-center">
                                <CardTitle>Foto de Perfil</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-4">
                                <div className="relative group">
                                    <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                                        <AvatarImage src="/avatars/me.png" />
                                        <AvatarFallback className="text-3xl font-bold">{user?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="text-center">
                                    <h3 className="font-bold text-lg">{user?.name}</h3>
                                    <p className="text-sm text-slate-500">{user?.email}</p>
                                </div>
                                <Separator />
                                <div className="w-full space-y-2 pt-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Membro desde:</span>
                                        <span className="font-medium">{new Date(user?.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Status da Conta:</span>
                                        <span className="text-emerald-600 font-bold">Ativa</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content - Dados e Senha */}
                    <div className="flex-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Dados Pessoais</CardTitle>
                                <CardDescription>Edite suas informações básicas de contato.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSave} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nome Completo</Label>
                                            <Input id="name" defaultValue={user?.name} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">E-mail</Label>
                                            <Input id="email" defaultValue={user?.email} disabled />
                                        </div>
                                    </div>
                                    <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={saving}>
                                        {saving ? "Salvando..." : "Salvar Alterações"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-indigo-600" />
                                    Segurança e Senha
                                </CardTitle>
                                <CardDescription>Mantenha sua conta protegida atualizando sua senha regularmente.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="current-pass">Senha Atual</Label>
                                        <Input id="current-pass" type="password" placeholder="••••••••" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-pass">Nova Senha</Label>
                                        <Input id="new-pass" type="password" placeholder="Digite a nova senha" />
                                    </div>
                                </div>
                                <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                                    Alterar Senha
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
