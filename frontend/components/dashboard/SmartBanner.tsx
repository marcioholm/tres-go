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

    // Auto-rotation logic
    useEffect(() => {
        if (banners.length <= 1) return

        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % banners.length)
        }, 8000)

        return () => clearInterval(timer)
    }, [banners.length])

    const handleDismiss = async (bannerId: string) => {
        try {
            await api.post(`/workspaces/${workspaceId}/banners/${bannerId}/dismiss`)
            setBanners(prev => prev.filter(b => b.id !== bannerId))
            if (currentIndex >= banners.length - 1) {
                setCurrentIndex(0)
            }
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
            case 'EDUCATIONAL': return "bg-[#F0F7FF]/80 border-[#D0E7FF]/50 text-[#0052CC] backdrop-blur-md"
            case 'SOCIAL_PROOF': return "bg-[#F2FCF5]/80 border-[#D1F7D9]/50 text-[#166534] backdrop-blur-md"
            case 'PROMO': return "border-transparent text-white"
            default: return "bg-white/80 border-[#F0F0F0]/50 text-[#0F0F0F] backdrop-blur-md"
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'EDUCATIONAL': return <Info className="h-5 w-5" />
            case 'SOCIAL_PROOF': return <Star className="h-5 w-5" />
            case 'PROMO': return <Sparkles className="h-5 w-5 fill-white/20" />
            default: return <Info className="h-5 w-5" />
        }
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={currentBanner.id}
                initial={{ opacity: 0, scale: 0.98, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={cn(
                    "relative overflow-hidden mb-8 rounded-2xl border shadow-lg transition-all duration-500 hover:shadow-xl",
                    getBannerStyles(currentBanner.type)
                )}
            >
                {/* Premium Background for PROMO */}
                {currentBanner.type === 'PROMO' && (
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/banner-premium-bg.png"
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

                        {/* Shimmer Effect */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '200%' }}
                            transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 5 }}
                            className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-1/2 -skew-x-12"
                        />
                    </div>
                )}

                <div className="relative z-10 p-5 md:p-6 flex flex-col md:flex-row items-center gap-5">
                    <div className={cn(
                        "h-12 w-12 shrink-0 rounded-xl flex items-center justify-center shadow-inner",
                        currentBanner.type === 'PROMO'
                            ? "bg-white/10 backdrop-blur-xl border border-white/20 text-white"
                            : "bg-white/50 backdrop-blur-sm border border-black/5 text-inherit"
                    )}>
                        {getIcon(currentBanner.type)}
                    </div>

                    <div className="flex-1 text-center md:text-left min-w-0">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                            {currentBanner.type === 'PROMO' && (
                                <span className="px-2 py-0.5 rounded-full bg-[#E8202A] text-[10px] font-black uppercase tracking-widest text-white shadow-sm border border-white/10">
                                    Assessoria Exclusive
                                </span>
                            )}
                            <h4 className={cn(
                                "text-[16px] font-black tracking-tight leading-tight",
                                currentBanner.type === 'PROMO' ? "text-white" : "text-zinc-900"
                            )}>
                                {currentBanner.title}
                            </h4>
                        </div>
                        <p className={cn(
                            "text-[14px] font-medium max-w-2xl line-clamp-2",
                            currentBanner.type === 'PROMO' ? "text-white/80" : "text-zinc-600"
                        )}>
                            {currentBanner.description}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                        <Button
                            onClick={() => handleClick(currentBanner)}
                            className={cn(
                                "h-11 px-6 rounded-xl text-[14px] font-bold gap-3 transition-all active:scale-95 shadow-lg",
                                currentBanner.type === 'PROMO'
                                    ? "bg-[#E8202A] hover:bg-[#CC1018] text-white hover:shadow-red-500/20"
                                    : "bg-black hover:bg-zinc-800 text-white"
                            )}
                        >
                            {currentBanner.ctaText}
                            <div className="p-1 rounded-full bg-white/20">
                                <ExternalLink className="h-3 w-3" />
                            </div>
                        </Button>

                        <button
                            onClick={() => handleDismiss(currentBanner.id)}
                            className={cn(
                                "p-2 rounded-full transition-all group",
                                currentBanner.type === 'PROMO'
                                    ? "hover:bg-white/10 text-white/40 hover:text-white"
                                    : "hover:bg-black/5 text-zinc-400 hover:text-zinc-900"
                            )}
                        >
                            <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                </div>

                {/* Banner Indicators (Dots) */}
                {banners.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={cn(
                                    "h-1 rounded-full transition-all duration-300",
                                    idx === currentIndex
                                        ? (currentBanner.type === 'PROMO' ? "w-4 bg-white" : "w-4 bg-black")
                                        : (currentBanner.type === 'PROMO' ? "w-1 bg-white/30" : "w-1 bg-black/10")
                                )}
                            />
                        ))}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    )
}
