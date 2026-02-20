"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function RegisterPage() {
    const { t } = useLanguage()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.target as HTMLFormElement);
        const name = formData.get('name') as string;
        const workspaceName = formData.get('workspace') as string;
        const taxId = formData.get('taxId') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            await api.post('/auth/register', {
                name,
                workspaceName,
                taxId,
                email,
                password
            });
            toast.success("Conta criada com sucesso! Redirecionando...");
            router.push('/login');
        } catch (error: any) {
            console.error("Registration failed", error);
            const message = error.response?.data?.message || "Falha ao criar conta. Tente novamente.";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Lado Direito: Capa Brandeada (Invertido no Register para variar) */}
            <div className="hidden lg:flex relative bg-slate-900 items-center justify-center overflow-hidden order-2">
                <img
                    src="/auth-cover.png"
                    alt="NorthWay Manifesto"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 to-transparent" />

                <div className="relative z-10 w-full max-w-lg p-12 text-white">
                    <div className="space-y-8">
                        <div className="inline-flex items-center rounded-full bg-red-600/20 px-3 py-1 text-sm font-semibold text-red-100 ring-1 ring-inset ring-red-600/20">
                            Manifesto NorthWay
                        </div>
                        <h2 className="text-4xl font-bold leading-tight">
                            "Crescimento com método <br />
                            <span className="text-red-400">gera liberdade."</span>
                        </h2>
                        <div className="space-y-4 text-lg text-slate-200 leading-relaxed">
                            <p>✓ Dashboards Estratégicos</p>
                            <p>✓ Inteligência de Dados</p>
                            <p>✓ Fim do Caos Operacional</p>
                        </div>
                        <div className="pt-8 flex items-center gap-4">
                            <div className="h-px flex-1 bg-white/20" />
                            <span className="text-sm font-medium tracking-widest uppercase opacity-60">Manifesto NorthWay</span>
                            <div className="h-px flex-1 bg-white/20" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Lado Esquerdo: Formulário */}
            <div className="flex flex-col items-center justify-center p-8 lg:p-12 bg-white order-1">
                <div className="w-full max-w-md space-y-8">
                    <div className="flex flex-col items-center lg:items-start space-y-4">
                        <a href="https://www.northwaycompany.com.br/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <img src="/logo-northway.png" alt="NorthWay Logo" className="h-12 w-12 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            <span className="text-2xl font-bold text-slate-900 tracking-tight">NORTHWAY<span className="text-red-600">OMNI</span></span>
                        </a>
                        <div className="space-y-1 text-center lg:text-left">
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Comece agora</h1>
                            <p className="text-slate-500 font-medium">Inicie seu teste gratuito de 7 dias hoje mesmo.</p>
                        </div>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Seu Nome</Label>
                                <Input id="name" name="name" placeholder="Nome" required className="h-11 bg-slate-50 border-slate-200 focus:border-red-300 focus:ring-red-100 transition-all" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="workspace" className="text-sm font-semibold text-slate-700">Sua Empresa</Label>
                                <Input id="workspace" name="workspace" placeholder="Empresa" required className="h-11 bg-slate-50 border-slate-200 focus:border-red-300 focus:ring-red-100 transition-all" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="taxId" className="text-sm font-semibold text-slate-700">CPF ou CNPJ (Obrigatório para faturamento)</Label>
                            <Input id="taxId" name="taxId" placeholder="000.000.000-00" required className="h-11 bg-slate-50 border-slate-200 focus:border-red-300 focus:ring-red-100 transition-all" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Corporativo</Label>
                            <Input id="email" name="email" type="email" placeholder="nome@empresa.com" required className="h-11 bg-slate-50 border-slate-200 focus:border-red-300 focus:ring-red-100 transition-all" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Crie uma Senha</Label>
                            <Input id="password" name="password" type="password" placeholder="••••••••" required className="h-11 bg-slate-50 border-slate-200 focus:border-red-300 focus:ring-red-100 transition-all" />
                        </div>

                        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 shadow-lg shadow-red-200 transition-all transform hover:scale-[1.01] mt-2" disabled={loading}>
                            {loading ? "Criando sua conta..." : "CRIAR MINHA CONTA"}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-slate-500">
                        Já tem uma conta? <Link href="/login" className="text-red-600 font-bold hover:underline">Fazer login</Link>
                    </div>

                    <p className="text-center lg:text-left text-xs text-slate-400 mt-8">
                        Ao se cadastrar, você concorda com nossos <Link href="#" className="underline">Termos</Link> e <Link href="#" className="underline">Privacidade</Link>.
                    </p>
                </div>
            </div>
        </div>
    )
}
