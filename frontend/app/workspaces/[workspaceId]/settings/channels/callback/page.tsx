'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
    Check,
    Instagram,
    MessageCircle,
    ArrowLeft,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Page {
    id: string;
    name: string;
    picture: { data: { url: string } };
    access_token: string;
}

export default function MetaCallbackPage() {
    const { workspaceId } = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const key = searchParams.get('key');

    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (key) {
            fetchPages();
        }
    }, [key]);

    const fetchPages = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces/${workspaceId}/channels/oauth/meta/pages?key=${key}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setPages(data);
        } catch (err) {
            setError('Falha ao carregar suas páginas. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (page: Page) => {
        setConnecting(page.id);
        try {
            const token = localStorage.getItem('token');
            // Identificar se é IG ou Messenger baseado no contexto original ou tentar buscar IG
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces/${workspaceId}/channels`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    type: 'MESSENGER', // Fallback, no futuro detectar IG
                    name: page.name,
                    pageId: page.id,
                    pageName: page.name,
                    pageAvatar: page.picture?.data?.url,
                    accessToken: page.access_token,
                    status: 'ACTIVE'
                })
            });

            if (!res.ok) throw new Error();

            router.push(`/workspaces/${workspaceId}/settings/channels`);
        } catch (err) {
            setError('Erro ao conectar página.');
            setConnecting(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="animate-spin text-[#ff1f4b]" size={32} />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Carregando suas páginas...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-black text-white uppercase tracking-tight">Selecione a Página</h1>
                <p className="text-slate-400">Escolha qual página do Facebook você deseja conectar.</p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm flex items-center gap-2">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            <div className="space-y-4">
                {pages.map((page, index) => (
                    <motion.div
                        key={page.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-slate-900/50 border border-slate-800 p-5 rounded-3xl flex items-center justify-between hover:border-slate-700 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <img
                                src={page.picture?.data?.url}
                                alt={page.name}
                                className="w-12 h-12 rounded-full border-2 border-slate-800"
                            />
                            <div>
                                <h3 className="font-bold text-white">{page.name}</h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">ID: {page.id}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => handleConnect(page)}
                            disabled={connecting !== null}
                            className="bg-white text-black font-black px-6 py-2.5 rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50"
                        >
                            {connecting === page.id ? <Loader2 className="animate-spin" size={20} /> : 'CONECTAR'}
                        </button>
                    </motion.div>
                ))}
            </div>

            <div className="text-center pt-8">
                <button
                    onClick={() => router.push(`/workspaces/${workspaceId}/settings/channels/novo`)}
                    className="text-slate-500 hover:text-white flex items-center gap-2 mx-auto font-bold text-xs uppercase"
                >
                    <ArrowLeft size={14} /> Voltar para o início
                </button>
            </div>
        </div>
    );
}
