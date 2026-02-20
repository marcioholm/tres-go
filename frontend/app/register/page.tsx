import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ShieldCheck, Target, Sparkles, Navigation, UserCircle, Building2, ChevronRight, Store } from "lucide-react";
import { useEffect } from "react";

const manifestos = [
    {
        title: <>"Crescimento com <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">método</span> gera liberdade."</>,
        desc: "Do comércio local ao varejo de elite, a NorthWay escala seu faturamento com ordem.",
        img: "/niche-tech.png",
        badge: "Inteligência Multicanal"
    },
    {
        title: <>"A Ordem devolve a <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">vida</span> ao seu negócio."</>,
        desc: "Restauramos a direção de farmácias e serviços de saúde com processos de elite.",
        img: "/niche-pharmacy.png",
        badge: "Gestão em Saúde"
    },
    {
        title: <>"Sabor sem <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">caos</span> gera escala."</>,
        desc: "Lanchonetes e restaurantes que operam como relógios suíços através da NorthWay.",
        img: "/niche-food.png",
        badge: "Food Service Elite"
    },
    {
        title: <>"Varejo é <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-red-600">detalhe</span> e direção."</>,
        desc: "Transformamos o atendimento de boutiques e lojas em uma máquina de vendas.",
        img: "/niche-retail.png",
        badge: "Varejo de Alto Padrão"
    }
];

export default function RegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentStep((prev) => (prev + 1) % manifestos.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.target as HTMLFormElement);
        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;
        const workspaceName = formData.get('workspace') as string;
        const taxId = formData.get('taxId') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const niche = formData.get('niche') as string;

        try {
            await api.post('/auth/register', {
                firstName,
                lastName,
                workspaceName,
                taxId,
                email,
                password,
                niche
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
        <div className="min-h-screen grid lg:grid-cols-2 bg-[#F8FAFC]">
            {/* Left Side: Form */}
            <div className="flex flex-col items-center justify-center p-8 lg:p-12 bg-white animate-in fade-in slide-in-from-right duration-700">
                <div className="w-full max-w-lg space-y-8">
                    <div className="flex flex-col items-center lg:items-start space-y-6">
                        <a href="https://www.northwaycompany.com.br/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:opacity-80 transition-all transform hover:scale-105 active:scale-95">
                            <img src="/logo-northway.png" alt="NorthWay Logo" className="h-14 w-14 object-contain shadow-sm rounded-lg" onError={(e) => (e.currentTarget.style.display = 'none')} />
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none">NORTHWAY</span>
                                <span className="text-lg font-bold text-red-600 tracking-widest leading-none mt-1">OMNI</span>
                            </div>
                        </a>
                        <div className="space-y-2 text-center lg:text-left">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Comece sua jornada</h1>
                            <p className="text-slate-500 font-medium text-lg leading-relaxed">Inicie seu teste de 7 dias e restaure a ordem no seu atendimento.</p>
                        </div>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Primeiro Nome</Label>
                                <Input id="firstName" name="firstName" placeholder="Seu nome" required className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Sobrenome</Label>
                                <Input id="lastName" name="lastName" placeholder="Seu sobrenome" required className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all rounded-xl" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="workspace" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Nome da Empresa</Label>
                            <Input id="workspace" name="workspace" placeholder="Ex: Farmácia Central" required className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all rounded-xl" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="taxId" className="text-sm font-bold text-slate-700 uppercase tracking-wider">CPF ou CNPJ</Label>
                            <Input id="taxId" name="taxId" placeholder="000.000.000-00" required className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all rounded-xl" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="niche" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Seu Segmento / Nicho</Label>
                            <div className="relative">
                                <select
                                    id="niche"
                                    name="niche"
                                    required
                                    className="w-full h-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all rounded-xl pl-4 pr-10 appearance-none text-slate-700 font-medium"
                                >
                                    <option value="" disabled selected>Selecione seu nicho...</option>
                                    <option value="farmacia">Farmácia / Saúde</option>
                                    <option value="gastronomia">Gastronomia / Lanchonete</option>
                                    <option value="varejo">Varejo / Boutique</option>
                                    <option value="tecnologia">Tecnologia / Serviços</option>
                                    <option value="outro">Outro Segmento</option>
                                </select>
                                <Store className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Email Corporativo</Label>
                            <Input id="email" name="email" type="email" placeholder="contato@empresa.com" required className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all rounded-xl" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-bold text-slate-700 uppercase tracking-wider">Crie uma Senha Forte</Label>
                            <Input id="password" name="password" type="password" placeholder="••••••••" required className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all rounded-xl" />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-base h-14 rounded-xl shadow-xl shadow-red-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-4 flex items-center justify-center gap-2 group"
                            disabled={loading}
                        >
                            {loading ? "CONFIGURANDO SUA CONTA..." : (
                                <>
                                    CRIAR MINHA CONTA AGORA
                                    <Navigation className="h-4 w-4 rotate-90 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="text-center pt-2">
                        <p className="text-slate-500 font-medium">
                            Já possui uma estrutura?
                            <Link href="/login" className="ml-2 text-red-600 font-black hover:underline decoration-2 underline-offset-4">Fazer login</Link>
                        </p>
                    </div>

                    <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-4">
                        Ao se cadastrar, você concorda com nossos <Link href="#" className="underline decoration-red-600/30">Termos</Link> e <Link href="#" className="underline decoration-red-600/30">Privacidade</Link>.
                    </p>
                </div>
            </div>

            {/* Right Side: Branded Cover */}
            <div className="hidden lg:flex relative bg-slate-950 items-center justify-center overflow-hidden animate-in fade-in duration-1000">
                {manifestos.map((m, idx) => (
                    <img
                        key={idx}
                        src={m.img}
                        alt="NorthWay Vision"
                        className={`absolute inset-0 w-full h-full object-cover opacity-50 transition-all duration-1000 scale-105 ${currentStep === idx ? "opacity-50 scale-110 blur-0" : "opacity-0 scale-100 blur-sm"
                            }`}
                    />
                ))}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-l from-slate-950/20 to-transparent" />

                <div className="relative z-10 w-full max-w-xl p-12">
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-10 shadow-2xl space-y-8 transform hover:scale-[1.02] transition-all duration-700">
                        <div className="inline-flex items-center gap-2 rounded-full bg-red-600/30 px-4 py-1.5 text-xs font-black text-red-100 border border-red-500/20 uppercase tracking-widest transition-all duration-500">
                            <Sparkles className="h-3 w-3 text-red-400" />
                            {manifestos[currentStep].badge}
                        </div>

                        <div className="space-y-4 min-h-[160px]">
                            <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tight text-balance animate-in fade-in slide-in-from-bottom-4 duration-700" key={`title-${currentStep}`}>
                                {manifestos[currentStep].title}
                            </h2>
                            <p className="text-xl text-slate-300 font-medium leading-relaxed italic animate-in fade-in slide-in-from-bottom-2 duration-1000" key={`desc-${currentStep}`}>
                                "{manifestos[currentStep].desc}"
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 pt-4">
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 transition-colors">
                                <div className="h-10 w-10 rounded-xl bg-red-600/20 flex items-center justify-center">
                                    <ShieldCheck className="h-5 w-5 text-red-500" />
                                </div>
                                <div>
                                    <p className="font-black text-white text-sm uppercase tracking-wider">Dashboards Estratégicos</p>
                                    <p className="text-slate-400 text-sm font-medium">Visualize cada centavo investido e retornado.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 transition-colors">
                                <div className="h-10 w-10 rounded-xl bg-red-600/20 flex items-center justify-center">
                                    <Target className="h-5 w-5 text-red-500" />
                                </div>
                                <div>
                                    <p className="font-black text-white text-sm uppercase tracking-wider">Fim do Caos Operacional</p>
                                    <p className="text-slate-400 text-sm font-medium">Processos estruturados que libertam o dono.</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 flex items-center gap-4 opacity-50">
                            <div className="h-px flex-1 bg-white/20" />
                            <span className="text-[10px] font-black tracking-widest uppercase text-white">Manifesto NorthWay</span>
                            <div className="h-px flex-1 bg-white/20" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
