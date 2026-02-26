"use client"

import React, { useState, useEffect } from "react"
import { TrendingUp, Target, Zap, ChevronRight, Activity } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { motion } from "framer-motion"

interface NorthwayScoreProps {
    workspaceId: string
}

export function NorthwayScore({ workspaceId }: NorthwayScoreProps) {
    const [scoreData, setScoreData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchScore = async () => {
            setIsLoading(true)
            try {
                // Mock behavior for now as we didn't implement the full endpoint logic yet
                // But we'll call the planned endpoint
                const res = await api.get(`/workspaces/${workspaceId}/score`)
                setScoreData(res.data)
            } catch (error) {
                console.error("Failed to fetch score", error)
                // Fallback to initial state
                setScoreData({
                    score: 45,
                    categories: {
                        atendimento: 50,
                        funil: 40,
                        operacao: 30,
                        crescimento: 60
                    },
                    health: 'needs_attention',
                    recommendation: 'Conecte mais canais para aumentar sua pontuação'
                })
            } finally {
                setIsLoading(false)
            }
        }
        if (workspaceId) fetchScore()
    }, [workspaceId])

    if (isLoading || !scoreData) return null

    const getScoreColor = (score: number) => {
        if (score >= 80) return "from-[#16A34A] to-[#16A34A]" // Success
        if (score >= 50) return "from-[#EAB308] to-[#EAB308]" // Warning
        return "from-[#E8202A] to-[#E8202A]" // Danger
    }

    const categories = [
        { name: 'Atendimento', value: scoreData.categories.atendimento, icon: Activity },
        { name: 'Funil', value: scoreData.categories.funil, icon: Target },
        { name: 'Operação', value: scoreData.categories.operacao, icon: Zap },
        { name: 'Crescimento', value: scoreData.categories.crescimento, icon: TrendingUp },
    ]

    return (
        <Card className="p-6 border-[#F0F0F0] shadow-sm bg-white overflow-hidden relative">
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h3 className="text-[15px] font-bold text-[#0F0F0F] mb-1">Northway Score</h3>
                    <p className="text-[13px] text-[#6B6B6B] font-medium">Saúde operacional do seu negócio</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-[#0F0F0F]" />
                </div>
            </div>

            <div className="flex items-center gap-10">
                <div className="relative h-28 w-28 shrink-0">
                    <svg className="h-full w-full" viewBox="0 0 100 100">
                        <circle
                            className="text-[#F0F0F0]"
                            strokeWidth="10"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                        />
                        <motion.circle
                            initial={{ strokeDashoffset: 251 }}
                            animate={{ strokeDashoffset: 251 - (251 * scoreData.score) / 100 }}
                            className={cn("bg-gradient-to-r", getScoreColor(scoreData.score))}
                            strokeWidth="10"
                            strokeDasharray="251"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-[#0F0F0F]">{scoreData.score}</span>
                        <span className="text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider">PONTOS</span>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-4">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-[#6B6B6B] uppercase">{cat.name}</span>
                                <span className="text-[11px] font-bold text-[#0F0F0F]">{cat.value}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-[#F5F5F5] rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${cat.value}%` }}
                                    className="h-full bg-black rounded-full"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 p-4 bg-[#F9FAFB] border border-[#F3F4F6] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white shadow-sm border border-[#F0F0F0] flex items-center justify-center text-[#E8202A]">
                        <Activity className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-[12px] font-bold text-[#0F0F0F]">{scoreData.recommendation}</p>
                        <p className="text-[11px] text-[#6B6B6B]">Fale com um consultor NorthWay Assessoria</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" className="h-8 px-4 text-[11px] font-bold border-[#F0F0F0] hover:bg-white bg-white">
                    VER ANÁLISE COMPLETA
                    <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
            </div>
        </Card>
    )
}
