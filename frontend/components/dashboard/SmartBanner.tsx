"use client"

import React, { useState, useEffect } from "react"
import { X, ExternalLink, Info, Star, Percent, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface SmartBannerProps {
    workspaceId: string
    position: 'TOP' | 'SIDEBAR' | 'INBOX_EMPTY' | 'DASHBOARD_BOTTOM'
}

export function SmartBanner({ workspaceId, position }: SmartBannerProps) {
    const [banners, setBanners] = useState<any[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await api.get(`/workspaces/${workspaceId}/banners`, {
                    params: { position }
                })
                setBanners(res.data)
            } catch (error) {
                console.error("Failed to fetch banners", error)
            }
        }
        if (workspaceId) fetchBanners()
    }, [workspaceId, position])

    const handleDismiss = async (bannerId: string) => {
        try {
            await api.post(`/workspaces/${workspaceId}/banners/${bannerId}/dismiss`)
            setBanners(prev => prev.filter(b => b.id !== bannerId))
        } catch (error) {
            console.error("Failed to dismiss banner", error)
        }
    }

    const handleClick = async (banner: any) => {
        try {
            await api.patch(`/workspaces/${workspaceId}/banners/${banner.id}/click`)

            // Build URL with UTMs
            const url = new URL(banner.ctaUrl)
            url.searchParams.set('utm_source', 'northway_omni')
            url.searchParams.set('utm_medium', 'smart_banner')
            url.searchParams.set('utm_campaign', banner.title.toLowerCase().replace(/ /g, '_'))

            window.open(url.toString(), '_blank')
        } catch (error) {
            console.error("Failed to track click", error)
            window.open(banner.ctaUrl, '_blank')
        }
    }

    if (banners.length === 0) return null

    const currentBanner = banners[currentIndex]

    const getBannerStyles = (type: string) => {
        switch (type) {
            case 'EDUCATIONAL': return "bg-[#F0F7FF] border-[#D0E7FF] text-[#0052CC]"
            case 'SOCIAL_PROOF': return "bg-[#F2FCF5] border-[#D1F7D9] text-[#166534]"
            case 'PROMO': return "bg-[#FFF9F0] border-[#FFE7C2] text-[#92400E]"
            default: return "bg-white border-[#F0F0F0] text-[#0F0F0F]"
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'EDUCATIONAL': return <Info className="h-4 w-4" />
            case 'SOCIAL_PROOF': return <Star className="h-4 w-4" />
            case 'PROMO': return <Sparkles className="h-4 w-4" />
            default: return <Info className="h-4 w-4" />
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                    "relative overflow-hidden mb-6 p-4 rounded-xl border flex items-center gap-4 transition-all duration-300",
                    getBannerStyles(currentBanner.type)
                )}
            >
                <div className={cn(
                    "h-10 w-10 shrink-0 rounded-lg flex items-center justify-center bg-white/50 backdrop-blur-sm shadow-sm",
                    currentBanner.type === 'PROMO' ? "text-[#E8202A]" : "text-inherit"
                )}>
                    {getIcon(currentBanner.type)}
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="text-[14px] font-bold truncate leading-tight mb-0.5">
                        {currentBanner.title}
                    </h4>
                    <p className="text-[13px] opacity-90 truncate font-medium">
                        {currentBanner.description}
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <Button
                        size="sm"
                        onClick={() => handleClick(currentBanner)}
                        className={cn(
                            "h-8 px-4 text-[12px] font-bold gap-2",
                            currentBanner.type === 'PROMO'
                                ? "bg-[#E8202A] hover:bg-[#CC1018] text-white"
                                : "bg-black hover:bg-zinc-800 text-white"
                        )}
                    >
                        {currentBanner.ctaText}
                        <ExternalLink className="h-3 w-3" />
                    </Button>

                    <button
                        onClick={() => handleDismiss(currentBanner.id)}
                        className="p-1.5 hover:bg-black/5 rounded-full transition-colors opacity-60 hover:opacity-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
