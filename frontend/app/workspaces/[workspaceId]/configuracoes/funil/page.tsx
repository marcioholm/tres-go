'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, CheckCircle, ArrowRight, Save, Layout } from 'lucide-react';

interface Pipeline {
  id: string;
  name: string;
  workspaceId: string;
  sectorId?: string;
  isDefault: boolean;
  stages: Stage[];
  sector?: { name: string };
}

interface Stage {
  id: string;
  name: string;
  color: string;
  order: number;
  isConversion: boolean;
  keywords: Keyword[];
}

interface Keyword {
  id: string;
  phrase: string;
}

export default function PipelineConfigPage() {
  const { workspaceId } = useParams();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [selected, setSelected] = useState<Pipeline | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [pRes, sRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces/${workspaceId}/pipelines`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/workspaces/${workspaceId}/sectors`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (pRes.ok && sRes.ok) {
        const pData = await pRes.json();
        const sData = await sRes.json();
        setPipelines(pData);
        setSectors(sData);
        if (pData.length > 0) setSelected(pData[0]);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStage = (pipelineId: string) => {
    if (!selected) return;
    const newStage: Stage = {
      id: `temp-${Date.now()}`,
      name: 'Nova Etapa',
      color: '#6366f1',
      order: selected.stages.length,
      isConversion: false,
      keywords: []
    };
    setSelected({
      ...selected,
      stages: [...selected.stages, newStage]
    });
  };

  const updateStage = (stageId: string, data: Partial<Stage>) => {
    if (!selected) return;
    const updatedStages = selected.stages.map(s =>
      s.id === stageId ? { ...s, ...data } : s
    );
    setSelected({ ...selected, stages: updatedStages });
  };

  const addKeyword = (stageId: string, phrase: string) => {
    if (!selected) return;
    const updatedStages = selected.stages.map(s => {
      if (s.id === stageId) {
        return {
          ...s,
          keywords: [...s.keywords, { id: `kw-${Date.now()}`, phrase: phrase.toLowerCase().trim() }]
        };
      }
      return s;
    });
    setSelected({ ...selected, stages: updatedStages });
  };

  const removeKeyword = (stageId: string, keywordId: string) => {
    if (!selected) return;
    const updatedStages = selected.stages.map(s => {
      if (s.id === stageId) {
        return {
          ...s,
          keywords: s.keywords.filter(k => k.id !== keywordId)
        };
      }
      return s;
    });
    setSelected({ ...selected, stages: updatedStages });
  };

  const deleteStage = (stageId: string) => {
    if (!selected) return;
    setSelected({
      ...selected,
      stages: selected.stages.filter(s => s.id !== stageId)
    });
  };

  const createNewPipeline = () => {
    const newPipeline: Pipeline = {
      id: `temp-${Date.now()}`,
      name: 'Novo Funil de Vendas',
      workspaceId: workspaceId as string,
      isDefault: pipelines.length === 0,
      stages: [
        { id: `temp-s1-${Date.now()}`, name: 'Lead', color: '#6366f1', order: 0, isConversion: false, keywords: [] },
        { id: `temp-s2-${Date.now()}`, name: 'Contatado', color: '#8b5cf6', order: 1, isConversion: false, keywords: [] },
        { id: `temp-s3-${Date.now()}`, name: 'Venda Finalizada', color: '#10b981', order: 2, isConversion: true, keywords: [] }
      ]
    };
    setSelected(newPipeline);
  };

  const savePipeline = async () => {
    if (!selected) return;
    try {
      const token = localStorage.getItem('token');
      const isNew = selected.id.startsWith('temp');
      const url = isNew
        ? `${process.env.NEXT_PUBLIC_API_URL}/workspaces/${workspaceId}/pipelines`
        : `${process.env.NEXT_PUBLIC_API_URL}/workspaces/${workspaceId}/pipelines/${selected.id}`;

      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(selected)
      });

      if (res.ok) {
        toast.success('Funil salvo com sucesso!');
        fetchData();
      } else {
        toast.error('Erro ao salvar funil');
      }
    } catch (error) {
      toast.error('Erro na conexão com o servidor');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Funil de Vendas</h1>
          <p className="text-muted-foreground">Configure as etapas de atendimento por setor e automatize com palavras-chave.</p>
        </div>
        <Button onClick={createNewPipeline}>
          <Plus className="w-4 h-4 mr-2" /> Novo Funil
        </Button>
      </div>

      <div className="flex gap-2 border-b overflow-x-auto pb-2 scrollbar-none">
        {pipelines.map(p => (
          <button
            key={p.id}
            onClick={() => setSelected(p)}
            className={`px-4 py-2 whitespace-nowrap rounded-t-lg transition-all ${selected?.id === p.id
              ? 'bg-primary text-primary-foreground font-medium shadow-sm'
              : 'hover:bg-muted text-muted-foreground'
              }`}
          >
            {p.sector?.name || 'Padrão'}
            {p.isDefault && <span className="ml-2 text-[10px] uppercase font-bold text-white bg-blue-500 px-1.5 py-0.5 rounded">Default</span>}
          </button>
        ))}
      </div>

      {selected ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-premium bg-white">
              <CardHeader className="border-b bg-muted/10">
                <CardTitle className="flex items-center gap-2">
                  <Layout className="w-5 h-5 text-primary" />
                  Editor de Funil: {selected?.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Nome do Funil</Label>
                    <Input
                      value={selected?.name || ''}
                      onChange={e => selected && setSelected({ ...selected, name: e.target.value })}
                      className="bg-muted/30 focus-visible:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Setor Vinculado</Label>
                    <div className="p-2 border rounded bg-muted/20 text-sm flex items-center h-10 px-3">
                      {selected.sector?.name || 'Todos (Padrão)'}
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-4 border-t">
                  <h3 className="font-bold text-lg flex items-center justify-between">
                    Etapas do Fluxo
                    <span className="text-xs font-normal text-muted-foreground">O sistema avança automaticamente por estas etapas</span>
                  </h3>

                  <div className="space-y-4">
                    {selected.stages.map((stage) => (
                      <div key={stage.id} className="p-5 border rounded-xl space-y-4 relative group hover:border-primary/50 transition-colors bg-white shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="relative group/color">
                            <Input
                              type="color"
                              value={stage.color}
                              onChange={e => updateStage(stage.id, { color: e.target.value })}
                              className="w-10 h-10 p-0 rounded-full cursor-pointer overflow-hidden border-2"
                            />
                          </div>
                          <Input
                            value={stage.name}
                            onChange={e => updateStage(stage.id, { name: e.target.value })}
                            placeholder="Ex: Qualificação, Interesse, Fechamento"
                            className="font-medium h-10"
                          />
                          <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border">
                            <input
                              type="checkbox"
                              checked={stage.isConversion}
                              onChange={e => updateStage(stage.id, { isConversion: e.target.checked })}
                              id={`conv-${stage.id}`}
                              className="w-4 h-4 accent-green-500"
                            />
                            <Label htmlFor={`conv-${stage.id}`} className="text-xs font-semibold cursor-pointer text-muted-foreground">CONVERSÃO</Label>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteStage(stage.id)}
                            className="text-destructive hover:bg-destructive/10 h-8 w-8"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="bg-muted/20 p-4 rounded-lg border border-dashed border-muted-foreground/20">
                          <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-3">
                            <span className="p-1 bg-primary/10 rounded text-primary">💬</span> GATILHOS (PALAVRAS-CHAVE)
                          </Label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {stage.keywords.map(kw => (
                              <span key={kw.id} className="inline-flex items-center gap-1.5 bg-primary/5 text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-medium group/kw transition-all hover:bg-primary/10">
                                {kw.phrase}
                                <button
                                  onClick={() => removeKeyword(stage.id, kw.id)}
                                  className="text-primary/50 hover:text-destructive p-0.5 rounded-full"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Adicionar frase gatilho..."
                              className="h-8 text-xs bg-white border-muted-foreground/10 focus-visible:ring-primary"
                              onKeyDown={e => {
                                if (e.key === 'Enter' && e.currentTarget.value) {
                                  addKeyword(stage.id, e.currentTarget.value);
                                  e.currentTarget.value = '';
                                  e.preventDefault();
                                }
                              }}
                            />
                            <Button variant="ghost" size="sm" className="h-8 text-[10px] text-muted-foreground">Enter para adicionar</Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button variant="outline" className="w-full border-dashed py-6 group hover:border-primary hover:bg-primary/5" onClick={() => addStage(selected.id)}>
                      <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" /> Adicionar Nova Etapa ao Funil
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-lg bg-white overflow-hidden">
              <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  PREVIEW DO CICLO
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Fluxo Linear</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 relative">
                <div className="space-y-3 relative z-10">
                  {selected.stages.map((stage, index) => (
                    <div key={stage.id} className="flex flex-col items-center">
                      <div
                        className="w-full py-4 px-5 rounded-xl flex items-center justify-between border-l-4 transition-all hover:translate-x-1"
                        style={{ borderLeftColor: stage.color, background: `${stage.color}08`, boxShadow: '0 2px 10px -5px rgba(0,0,0,0.1)' }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-muted-foreground opacity-30">{index + 1}</span>
                          <span className="font-semibold text-sm">{stage.name}</span>
                        </div>
                        {stage.isConversion && (
                          <div className="flex items-center gap-1 bg-green-500/10 text-green-600 px-2 py-0.5 rounded text-[10px] font-bold">
                            <CheckCircle className="w-3 h-3" />
                            CONVERTIDO
                          </div>
                        )}
                      </div>
                      {index < (selected?.stages.length || 0) - 1 && (
                        <div className="my-1 flex flex-col items-center opacity-20">
                          <ArrowRight className="w-4 h-4 rotate-90" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Linha de progresso no fundo */}
                <div className="absolute top-10 bottom-10 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent -z-0" />
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button className="w-full h-14 text-md font-bold shadow-xl hover:scale-[1.03] transition-all bg-primary hover:bg-primary/90" onClick={savePipeline}>
                <Save className="w-5 h-5 mr-3" /> SALVAR FUNIL
              </Button>
              <p className="text-[11px] text-center text-muted-foreground italic px-4">
                As alterações afetarão apenas mensagens recebidas após o salvamento. Movimentações automáticas seguem a ordem definida.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-2xl bg-muted/5 p-12 text-center">
          <div className="bg-primary/10 p-6 rounded-full mb-6">
            <Layout className="w-12 h-12 text-primary opacity-50" />
          </div>
          <h2 className="text-xl font-bold mb-2">Nenhum Funil Configurado</h2>
          <p className="text-muted-foreground max-w-sm mb-8">
            Você ainda não criou um funil de vendas. Crie etapas e palavras-chave para automatizar seus processos.
          </p>
          <Button variant="outline" size="lg" className="px-10 border-primary text-primary hover:bg-primary/5" onClick={createNewPipeline}>
            Começar Agora
          </Button>
        </div>
      )}
    </div>
  );
}
