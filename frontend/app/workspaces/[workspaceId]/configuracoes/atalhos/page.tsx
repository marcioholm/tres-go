'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Zap,
    Plus,
    Trash2,
    Command,
    Search,
    MessageSquare,
    Save,
    Loader2,
    Copy
} from 'lucide-react';

export default function QuickRepliesPage() {
    const { workspaceId } = useParams();
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [newReply, setNewReply] = useState({
        command: '',
        title: '',
        content: '',
        category: ''
    });

    useEffect(() => {
        fetchReplies();
    }, []);

    const fetchReplies = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces/${workspaceId}/pipelines/quick-replies`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setReplies(data);
            }
        } catch (error) {
            console.error('Erro ao buscar atalhos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newReply.command || !newReply.content) {
            toast.error('Comando e conteúdo são obrigatórios');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces/${workspaceId}/pipelines/quick-replies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newReply)
            });

            if (res.ok) {
                toast.success('Atalho criado com sucesso!');
                setNewReply({ command: '', title: '', content: '', category: '' });
                fetchReplies();
            } else {
                toast.error('Erro ao criar atalho (comando já pode existir)');
            }
        } catch (error) {
            toast.error('Erro na conexão com o servidor');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja excluir este atalho?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces/${workspaceId}/pipelines/quick-replies/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                toast.success('Atalho removido');
                fetchReplies();
            }
        } catch (error) {
            toast.error('Erro ao remover atalho');
        }
    };

    const filteredReplies = replies.filter(r =>
        r.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
    );

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl">
                        <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Atalhos de Resposta</h1>
                        <p className="text-sm text-muted-foreground">Economize tempo enviando mensagens prontas usando o comando / no chat.</p>
                    </div>
                </div>
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar atalhos..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulário Novo Atalho */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-6 border-none shadow-premium bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg">Novo Atalho</CardTitle>
                            <CardDescription>Crie comandos personalizados para agilizar o atendimento.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Comando (ex: /ola)</Label>
                                <div className="relative">
                                    <Command className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                                    <Input
                                        placeholder="/comando"
                                        className="pl-10 font-mono"
                                        value={newReply.command}
                                        onChange={e => setNewReply({ ...newReply, command: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Título Interno</Label>
                                <Input
                                    placeholder="Ex: Saudação Inicial"
                                    value={newReply.title}
                                    onChange={e => setNewReply({ ...newReply, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Conteúdo da Mensagem</Label>
                                <Textarea
                                    placeholder="Olá! Como podemos ajudar você hoje?"
                                    className="min-h-[150px] resize-none"
                                    value={newReply.content}
                                    onChange={e => setNewReply({ ...newReply, content: e.target.value })}
                                />
                            </div>
                            <Button className="w-full mt-2" onClick={handleCreate}>
                                <Plus className="w-4 h-4 mr-2" /> Criar Atalho
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Lista de Atalhos */}
                <div className="lg:col-span-2 space-y-4">
                    {filteredReplies.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredReplies.map((reply) => (
                                <Card key={reply.id} className="group hover:border-primary/50 transition-all bg-white border shadow-sm">
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-muted px-3 py-1.5 rounded-lg border font-mono font-bold text-primary text-sm">
                                                    {reply.command}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm">{reply.title}</h4>
                                                    {reply.category && (
                                                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest bg-muted/50 px-2 py-0.5 rounded">
                                                            {reply.category}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                    <Copy className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDelete(reply.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="bg-muted/30 p-4 rounded-xl relative border group/content">
                                            <p className="text-sm whitespace-pre-wrap leading-relaxed text-slate-700 italic">
                                                "{reply.content}"
                                            </p>
                                            <MessageSquare className="absolute -bottom-2 -right-2 w-8 h-8 text-primary opacity-5 -rotate-12" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-3xl bg-muted/5 text-center">
                            <div className="bg-muted p-6 rounded-full mb-4">
                                <Search className="w-12 h-12 text-muted-foreground opacity-20" />
                            </div>
                            <h3 className="font-bold text-lg">Nenhum atalho encontrado</h3>
                            <p className="text-muted-foreground">Tente buscar por outro termo ou crie um novo atalho.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
