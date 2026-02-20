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

export default function LoginPage() {
    const { t } = useLanguage()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const email = (e.target as any).email.value;
        const password = (e.target as any).password.value;

        try {
            const { data } = await api.post('/auth/login', { email, password });

            if (data.access_token) {
                console.log("Login success, token received");
                localStorage.setItem('token', data.access_token);
                // Also store user info if needed for context
                if (data.user) {
                    console.log("User data received:", data.user);
                    localStorage.setItem('user', JSON.stringify(data.user));
                }

                let targetWorkspaceId = 'default';
                if (data.user && data.user.workspaces && data.user.workspaces.length > 0) {
                    // Pick the first workspace
                    targetWorkspaceId = data.user.workspaces[0].workspaceId;
                    console.log("Target workspace:", targetWorkspaceId);
                }

                toast.success("Login realizado com sucesso!");

                // Validate token storage
                if (!localStorage.getItem('token')) {
                    console.error("Token failed to save in localStorage");
                    toast.error("Erro: Token não salvo localmente.");
                    return;
                }

                // Prioritize Super Admin redirection
                console.log("IsSuperAdmin:", data.user?.isSuperAdmin);
                if (data.user?.isSuperAdmin) {
                    console.log("Redirecting to /super-admin");
                    router.push('/super-admin');
                    return;
                }

                console.log("Redirecting to workspace inbox");
                router.push(`/workspaces/${targetWorkspaceId}/inbox`);
            }
        } catch (error) {
            console.error("Login failed", error);
            toast.error("Falha no login. Verifique suas credenciais.");
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Lado Esquerdo: Formulário */}
            <div className="flex flex-col items-center justify-center p-8 lg:p-12 bg-white">
                <div className="w-full max-w-md space-y-8">
                    <div className="flex flex-col items-center lg:items-start space-y-4">
                        <div className="flex items-center gap-3">
                            <img src="/logo-northway.png" alt="NorthWay Logo" className="h-12 w-12 object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            <span className="text-2xl font-bold text-slate-900 tracking-tight">NORTHWAY<span className="text-red-600">OMNI</span></span>
                        </div>
                        <div className="space-y-1 text-center lg:text-left">
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bem-vindo de volta!</h1>
                            <p className="text-slate-500">Insira suas credenciais para acessar a plataforma.</p>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Corporativo</Label>
                            <Input id="email" type="email" placeholder="nome@empresa.com" required className="h-12 bg-slate-50 border-slate-200 focus:border-red-300 focus:ring-red-100 transition-all" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Senha</Label>
                                <Link href="#" className="text-xs text-red-600 font-bold hover:underline">Esqueceu a senha?</Link>
                            </div>
                            <Input id="password" type="password" placeholder="••••••••" required className="h-12 bg-slate-50 border-slate-200 focus:border-red-300 focus:ring-red-100 transition-all" />
                        </div>

                        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 shadow-lg shadow-red-200 transition-all transform hover:scale-[1.01]" disabled={loading}>
                            {loading ? "Entrando..." : "ENTRAR NA PLATAFORMA"}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-slate-500">
                        Ainda não tem uma conta? <Link href="/register" className="text-red-600 font-bold hover:underline">Criar conta gratuita</Link>
                    </div>

                    <p className="text-center lg:text-left text-xs text-slate-400 mt-12">
                        © 2024 NorthWay Omni. Todos os direitos reservados.
                    </p>
                </div>
            </div>

            {/* Lado Direito: Capa Brandeada */}
            <div className="hidden lg:flex relative bg-slate-900 items-center justify-center overflow-hidden">
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
                            "Conectamos sua empresa a todos os canais em uma única experiência inteligente."
                        </h2>
                        <div className="space-y-4 text-lg text-slate-200 leading-relaxed">
                            <p>✓ Atendimento Omnichannel Unificado</p>
                            <p>✓ Tecnologia que gera proximidade</p>
                            <p>✓ Resultados reais em escala</p>
                        </div>
                        <div className="pt-8 flex items-center gap-4">
                            <div className="h-px flex-1 bg-white/20" />
                            <span className="text-sm font-medium tracking-widest uppercase opacity-60">Impulsionando Negócios</span>
                            <div className="h-px flex-1 bg-white/20" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
