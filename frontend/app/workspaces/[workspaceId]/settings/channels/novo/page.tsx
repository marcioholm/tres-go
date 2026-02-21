'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Instagram,
    MessageCircle,
    ArrowLeft,
    Check,
    ShieldCheck,
    Smartphone,
    Globe,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Step = 'TYPE' | 'WABA_REQUEST' | 'WABA_VERIFY' | 'META_START' | 'DONE';

export default function NewChannelPage() {
    const { workspaceId } = useParams();
    const router = useRouter();
    const [step, setStep] = useState<Step>('TYPE');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [type, setType] = useState<'INSTAGRAM' | 'MESSENGER' | 'WHATSAPP' | null>(null);
    const [channelName, setChannelName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [verifyCode, setVerifyCode] = useState('');
    const [tempChannelId, setTempChannelId] = useState('');

    const handleStartMetaOAuth = async (selectedType: 'INSTAGRAM' | 'MESSENGER') => {
        if (!channelName) {
            setError('Por favor, dê um nome para este canal.');
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/workspaces/${workspaceId}/channels/oauth/meta?type=${selectedType}&name=${channelName}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const { url } = await res.json();
            window.location.href = url;
        } catch (err) {
            setError('Falha ao iniciar conexão com a Meta.');
            setLoading(false);
        }
    };

    const handleRequestWabaCode = async (method: 'SMS' | 'VOICE') => {
        if (!channelName || !phoneNumber) {
            setError('Nome e número são obrigatórios.');
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/workspaces/${workspaceId}/channels/whatsapp/request-code`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ channelName, phoneNumber, method })
                }
            );
            if (!res.ok) throw new Error();
            const { channelId } = await res.json();
            setTempChannelId(channelId);
            setStep('WABA_VERIFY');
        } catch (err) {
            setError('Falha ao solicitar código. Verifique o número.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyWabaCode = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/workspaces/${workspaceId}/channels/whatsapp/verify-code`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ channelId: tempChannelId, code: verifyCode })
                }
            );
            if (!res.ok) throw new Error();
            setStep('DONE');
        } catch (err) {
            setError('Código inválido.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto min-h-[600px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
                {step === 'TYPE' && (
                    <motion.div
                        key="step-type"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="text-center space-y-2">
                            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Conectar Novo Canal</h1>
                            <p className="text-slate-400">Escolha o canal que deseja integrar ao NorthWay Omni</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { id: 'INSTAGRAM', name: 'Instagram', icon: Instagram, color: 'from-purple-600 to-pink-600' },
                                { id: 'WHATSAPP', name: 'WhatsApp', icon: MessageCircle, color: 'from-green-600 to-emerald-600' },
                                { id: 'MESSENGER', name: 'Messenger', icon: MessageCircle, color: 'from-blue-600 to-sky-600' },
                            ].map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => {
                                        setType(c.id as any);
                                        setStep(c.id === 'WHATSAPP' ? 'WABA_REQUEST' : 'META_START');
                                    }}
                                    className="group relative bg-slate-900/50 border border-slate-800 hover:border-[#ff1f4b]/50 rounded-3xl p-8 transition-all hover:scale-105 active:scale-95"
                                >
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                                        <c.icon className="text-white" size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{c.name}</h3>
                                    <p className="text-slate-500 text-sm">Conectar conta via API Oficial</p>
                                </button>
                            ))}
                        </div>

                        <div className="text-center pt-8">
                            <button
                                onClick={() => router.back()}
                                className="text-slate-500 hover:text-white flex items-center gap-2 mx-auto font-bold"
                            >
                                <ArrowLeft size={18} /> VOLTAR
                            </button>
                        </div>
                    </motion.div>
                )}

                {(step === 'META_START' || step === 'WABA_REQUEST') && (
                    <motion.div
                        key="step-form"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="max-w-md mx-auto w-full space-y-8 bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-md"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <button onClick={() => setStep('TYPE')} className="text-slate-500 hover:text-white">
                                <ArrowLeft size={20} />
                            </button>
                            <h2 className="text-2xl font-bold text-white uppercase italic tracking-tight">
                                {type === 'WHATSAPP' ? 'Conectar WhatsApp' : 'Conectar Meta'}
                            </h2>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm flex items-center gap-2">
                                <AlertCircle size={18} /> {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Nome do Canal</label>
                                <input
                                    type="text"
                                    placeholder="Ex: WhatsApp Vendas"
                                    value={channelName}
                                    onChange={(e) => setChannelName(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-[#ff1f4b] transition-all outline-none"
                                />
                            </div>

                            {type === 'WHATSAPP' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Número (DDI + DDD + Número)</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: 5511999999999"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-[#ff1f4b] transition-all outline-none"
                                    />
                                </div>
                            )}
                        </div>

                        {type === 'WHATSAPP' ? (
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleRequestWabaCode('SMS')}
                                    disabled={loading}
                                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl flex flex-col items-center gap-2 text-sm transition-all"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <Smartphone size={24} />}
                                    RECEBER SMS
                                </button>
                                <button
                                    onClick={() => handleRequestWabaCode('VOICE')}
                                    disabled={loading}
                                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl flex flex-col items-center gap-2 text-sm transition-all"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <Globe size={24} />}
                                    RECEBER CHAMADA
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => handleStartMetaOAuth(type as any)}
                                disabled={loading}
                                className="w-full bg-[#ff1f4b] text-white font-black py-4 rounded-2xl hover:bg-[#d9163f] transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                                CONECTAR COM FACEBOOK
                            </button>
                        )}

                        <div className="flex items-center gap-2 text-slate-600 justify-center text-xs font-bold uppercase tracking-widest">
                            <ShieldCheck size={14} /> Conexão Segura via Meta API
                        </div>
                    </motion.div>
                )}

                {step === 'WABA_VERIFY' && (
                    <motion.div
                        key="step-verify"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md mx-auto w-full space-y-8 bg-slate-900/50 border border-slate-800 rounded-3xl p-8 text-center"
                    >
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-500 mb-6">
                            <ShieldCheck size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase italic">Verificar Código</h2>
                        <p className="text-slate-400">Insira o código de 6 dígitos enviado para seu telefone.</p>

                        <input
                            type="text"
                            maxLength={6}
                            placeholder="000000"
                            value={verifyCode}
                            onChange={(e) => setVerifyCode(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-3xl font-black text-center text-white tracking-[0.5em] focus:border-[#ff1f4b] outline-none transition-all"
                        />

                        <button
                            onClick={handleVerifyWabaCode}
                            disabled={loading || verifyCode.length < 6}
                            className="w-full bg-[#ff1f4b] disabled:opacity-50 text-white font-black py-4 rounded-2xl hover:bg-[#d9163f] transition-all active:scale-95 flex items-center justify-center"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'CONFIRMAR AGORA'}
                        </button>
                    </motion.div>
                )}

                {step === 'DONE' && (
                    <motion.div
                        key="step-done"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-6"
                    >
                        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white shadow-2xl shadow-green-500/50">
                            <Check size={48} strokeWidth={4} />
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase italic">Canal Conectado!</h2>
                        <p className="text-slate-400 max-w-xs mx-auto">
                            Seu canal de WhatsApp foi configurado com sucesso e já está pronto para receber mensagens.
                        </p>
                        <button
                            onClick={() => router.push(`/workspaces/${workspaceId}/settings/channels`)}
                            className="bg-white text-black font-black px-12 py-4 rounded-2xl hover:bg-slate-200 transition-all uppercase"
                        >
                            Ir para Canais
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
