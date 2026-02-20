"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Eye, EyeOff, CheckCircle2, Navigation, Sparkles } from "lucide-react"
import { useEffect } from "react"

const manifestos = [
    {
        title: <>Nós não fazemos <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">marketing.</span><br />Nós restauramos <span className="underline decoration-red-600/50 decoration-8 underline-offset-[-4px]">direção.</span></>,
        desc: "Crescimento sem direção gera caos. Crescimento com método gera liberdade.",
        img: "/niche-tech.png"
    },
    {
        title: <>A Ordem devolve a <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">Vida</span> ao negócio.</>,
        desc: "Transformamos o caos operacional em lucro escalável e previsível.",
        img: "/niche-pharmacy.png"
    },
    {
        title: <>Direção é o novo <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">Poder.</span></>,
        desc: "Saia do operacional e assuma o comando estratégico da sua empresa.",
        img: "/niche-food.png"
    },
    {
        title: <>Seu crescimento <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">Métrica</span> por métrica.</>,
        desc: "Dados transformados em inteligência comercial para qualquer nicho.",
        img: "/niche-retail.png"
    }
];

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const router = useRouter()

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentStep((prev) => (prev + 1) % manifestos.length);
        }, 7000);
        return () => clearInterval(timer);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const { data } = await api.post('/auth/login', { email, password });

            if (data.access_token) {
                localStorage.setItem('token', data.access_token);
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }

                let targetWorkspaceId = 'default';
                if (data.user?.workspaces?.length > 0) {
                    targetWorkspaceId = data.user.workspaces[0].workspaceId;
                }

                toast.success("Login realizado com sucesso!");

                if (data.user?.isSuperAdmin) {
                    router.push('/super-admin');
                    return;
                }

                router.push(`/workspaces/${targetWorkspaceId}/inbox`);
            }
        } catch (error: any) {
            console.error("Login failed", error);
            const message = error.response?.data?.message || "Email ou senha incorretos.";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-[#F8FAFC]">
            {/* Left Side: Form */}
            <div className="flex flex-col items-center justify-center p-8 lg:p-12 bg-white animate-in fade-in slide-in-from-left duration-700">
                <div className="w-full max-w-md space-y-8">
                    <div className="flex flex-col items-center lg:items-start space-y-6">
                        <a href="https://www.northwaycompany.com.br/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:opacity-80 transition-all transform hover:scale-105 active:scale-95">
                            <img src="/logo-northway.png" alt="NorthWay Logo" className="h-14 w-14 object-contain shadow-sm rounded-lg" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none">NORTHWAY</span>
                                <span className="text-lg font-bold text-red-600 tracking-widest leading-none mt-1">OMNI</span>
                            </div>
                        </a>
                        <div className="space-y-2 text-center lg:text-left">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Acesse sua conta</h1>
                            <p className="text-slate-500 font-medium text-lg leading-relaxed">A plataforma definitiva para restaurar a direção do seu crescimento.</p>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Email Corporativo</Label>
                            <div className="relative group">
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="nome@empresa.com"
                                    required
                                    className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all rounded-xl pl-4 pr-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Senha</Label>
                                <Link href="#" className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors uppercase tracking-tight">Esqueceu?</Link>
                            </div>
                            <div className="relative group">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    required
                                    className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all rounded-xl pl-4 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-600 p-1 rounded-md transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 py-1">
                            <Checkbox id="remember" className="rounded-md border-slate-300 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600" />
                            <label htmlFor="remember" className="text-sm font-semibold text-slate-500 cursor-pointer select-none">Mantenha-me conectado</label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-base h-14 rounded-xl shadow-xl shadow-red-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-4 flex items-center justify-center gap-2 group"
                            disabled={loading}
                        >
                            {loading ? "CONECTANDO..." : (
                                <>
                                    ENTRAR NA PLATAFORMA
                                    <Navigation className="h-4 w-4 rotate-90 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="text-center pt-2">
                        <p className="text-slate-500 font-medium">
                            Ainda não tem estrutura?
                            <Link href="/register" className="ml-2 text-red-600 font-black hover:underline decoration-2 underline-offset-4">Criar conta gratuita</Link>
                        </p>
                    </div>

                    <div className="flex items-center gap-2 pt-8 opacity-40 grayscale group hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                        <div className="h-px flex-1 bg-slate-300" />
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500">Trusted by Market Leaders</span>
                        <div className="h-px flex-1 bg-slate-300" />
                    </div>
                </div>
            </div>

            {/* Right Side: Branded Cover */}
            <div className="hidden lg:flex relative bg-slate-950 items-center justify-center overflow-hidden animate-in fade-in duration-1000">
                {manifestos.map((m, idx) => (
                    <img
                        key={idx}
                        src={m.img}
                        alt="NorthWay Vision"
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 scale-105 ${currentStep === idx ? "opacity-50 scale-110 blur-0" : "opacity-0 scale-100 blur-sm"
                            }`}
                    />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/20 to-transparent" />

                <div className="relative z-10 w-full max-w-xl p-12">
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-10 shadow-2xl space-y-8 transform hover:scale-[1.02] transition-all duration-700">
                        <div className="inline-flex items-center gap-2 rounded-full bg-red-600/30 px-4 py-1.5 text-xs font-black text-red-100 border border-red-500/20 uppercase tracking-widest animate-pulse">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            Manifesto NorthWay
                        </div>

                        <div className="space-y-4 min-h-[160px]">
                            <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700" key={`login-title-${currentStep}`}>
                                {manifestos[currentStep].title}
                            </h2>
                            <p className="text-xl text-slate-300 font-medium leading-relaxed italic animate-in fade-in slide-in-from-bottom-2 duration-1000" key={`login-desc-${currentStep}`}>
                                "{manifestos[currentStep].desc}"
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 pt-6">
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                                <div className="h-10 w-10 rounded-xl bg-red-600/20 flex items-center justify-center group-hover:bg-red-600/40 transition-colors">
                                    <CheckCircle2 className="h-5 w-5 text-red-500" />
                                </div>
                                <div>
                                    <p className="font-black text-white text-sm uppercase tracking-wider">A Ordem devolve a vida</p>
                                    <p className="text-slate-400 text-sm font-medium">Números, funil e posicionamento em harmonia.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
