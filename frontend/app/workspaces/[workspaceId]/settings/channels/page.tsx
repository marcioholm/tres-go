'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Instagram,
    MessageCircle,
    Plus,
    Settings,
    Trash2,
    AlertCircle,
    CheckCircle2,
    MoreVertical,
    ExternalLink,
    XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

interface Channel {
    id: string;
    type: 'INSTAGRAM' | 'MESSENGER' | 'WHATSAPP';
    name: string;
    status: 'ACTIVE' | 'CONNECTING' | 'ERROR' | 'DISCONNECTED';
    displayName?: string;
    phoneNumber?: string;
    pageName?: string;
    pageAvatar?: string;
}

export default function ChannelsPage() {
    const { workspaceId } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChannels();

        const success = searchParams.get('success');
        const error = searchParams.get('error');

        if (success) {
            toast.success('Canal conectado com sucesso! 🎉');
        }

        if (error) {
            const messages: Record<string, string> = {
                cancelled: 'Conexão cancelada. Tente novamente quando quiser.',
                no_pages: 'Nenhuma Página do Facebook encontrada. Certifique-se de ser administrador de uma Página.',
                unknown: 'Erro inesperado. Entre em contato com o suporte se o problema persistir.',
            };
            toast.error(messages[error] || 'Erro na conexão');
        }
    }, [workspaceId, searchParams]);

    const fetchChannels = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces/${workspaceId}/channels`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setChannels(data);
        } catch (err) {
            console.error('Error fetching channels:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja desconectar este canal?')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces/${workspaceId}/channels/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchChannels();
        } catch (err) {
            console.error('Error deleting channel:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff1f4b]"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white uppercase">Canais de Atendimento</h1>
                    <p className="text-slate-400 mt-1">Gerencie suas conexões com Instagram, Messenger e WhatsApp.</p>
                </div>
                <button
                    onClick={() => router.push(`/workspaces/${workspaceId}/settings/channels/novo`)}
                    className="flex items-center gap-2 bg-[#ff1f4b] hover:bg-[#d9163f] text-white px-5 py-2.5 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg shadow-[#ff1f4b]/20"
                >
                    <Plus size={20} />
                    CONECTAR NOVO CANAL
                </button>
            </div>

            {channels.length === 0 ? (
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center backdrop-blur-sm">
                    <div className="bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500">
                        <MessageCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Nenhum canal conectado</h3>
                    <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                        Comece conectando sua conta do Instagram ou WhatsApp para centralizar seus atendimentos.
                    </p>
                    <button
                        onClick={() => router.push(`/workspaces/${workspaceId}/settings/channels/novo`)}
                        className="text-[#ff1f4b] font-bold hover:underline"
                    >
                        Configurar minha primeira conexão →
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {channels.map((channel, index) => (
                        <motion.div
                            key={channel.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-slate-900/40 border border-slate-800 hover:border-[#ff1f4b]/30 rounded-3xl p-6 transition-all backdrop-blur-md relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleDelete(channel.id)}
                                    className="p-2 text-slate-500 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-slate-700 relative">
                                    {channel.type === 'INSTAGRAM' && <Instagram className="text-pink-500" size={28} />}
                                    {channel.type === 'WHATSAPP' && <MessageCircle className="text-green-500" size={28} />}
                                    {channel.type === 'MESSENGER' && <MessageCircle className="text-blue-500" size={28} />}
                                    <div className="absolute -bottom-1 -right-1">
                                        {channel.status === 'ACTIVE' ? (
                                            <CheckCircle2 size={18} className="text-green-500 fill-slate-950" />
                                        ) : (
                                            <AlertCircle size={18} className="text-yellow-500 fill-slate-950" />
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white group-hover:text-[#ff1f4b] transition-colors">
                                        {channel.name}
                                    </h3>
                                    <p className="text-xs font-black tracking-widest text-slate-500 uppercase">
                                        {channel.type}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-800/50">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Status</span>
                                    <span className={`font-bold ${channel.status === 'ACTIVE' ? 'text-green-500' : 'text-yellow-500'}`}>
                                        {channel.status === 'ACTIVE' ? 'Ativo' : 'Pendente'}
                                    </span>
                                </div>
                                {channel.phoneNumber && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Número</span>
                                        <span className="text-slate-300">{channel.phoneNumber}</span>
                                    </div>
                                )}
                                {channel.pageName && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Página</span>
                                        <span className="text-slate-300 truncate max-w-[150px]">{channel.pageName}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex gap-2">
                                <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-xl text-sm font-bold transition-colors">
                                    Configurações
                                </button>
                                <button className="px-3 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-xl transition-colors">
                                    <ExternalLink size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
