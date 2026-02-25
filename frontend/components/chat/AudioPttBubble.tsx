"use client"

import React, { useState, useRef, useMemo } from 'react';
import { format } from "date-fns";

export interface AudioPttBubbleProps {
    message: {
        id: number;
        createdAt?: Date; // Use time if createdAt is not available
        time?: string;
        status?: string;
        content: {
            mediaUrl?: string;
            waveform?: number[];
            duration?: number;
            text?: string;
        }
    };
    fromAgent: boolean;
}

const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

export const AudioPttBubble = ({ message, fromAgent }: AudioPttBubbleProps) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);
    const waveform = useMemo(() => {
        if (message.content.waveform && message.content.waveform.length > 0) return message.content.waveform;
        // Generate consistent random-like waveform if not provided
        return Array(35).fill(0).map(() => 0.2 + Math.random() * 0.6);
    }, [message.content.waveform]);

    const duration = message.content.duration || 0;

    return (
        <div className={`flex items-end gap-2 ${fromAgent ? 'flex-row-reverse' : ''}`}>
            {/* Bolha PTT — Estilo WhatsApp Premium */}
            <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-2xl min-w-[280px] max-w-[320px] shadow-sm relative",
                fromAgent
                    ? 'bg-[#E7FFDB] text-slate-800 rounded-br-sm border border-[#D1EAB5]' // Outgoing
                    : 'bg-white text-slate-800 rounded-bl-sm border border-slate-100'      // Incoming
            )}>

                {/* Avatar / Imagem do perfil no áudio (Opcional, mas dá um toque premium) */}
                <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200/50">
                        <span className="material-symbols-outlined text-3xl text-slate-300">person</span>
                    </div>
                    {/* Botão play/pause flutuante no estilo WA */}
                    <button
                        onClick={() => {
                            if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
                            else { audioRef.current?.play(); setIsPlaying(true); }
                        }}
                        className="absolute inset-0 flex items-center justify-center bg-transparent group"
                    >
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 transform group-active:scale-95",
                            fromAgent ? "bg-emerald-500 text-white shadow-md shadow-emerald-200" : "bg-emerald-500 text-white shadow-md shadow-emerald-100"
                        )}>
                            <span className="material-symbols-outlined text-2xl font-bold">
                                {isPlaying ? 'pause' : 'play_arrow'}
                            </span>
                        </div>
                    </button>
                </div>

                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    {/* Waveform Area */}
                    <div className="flex items-center gap-[2px] h-8 pt-1">
                        {waveform.map((amplitude, i) => {
                            const isPast = (i / waveform.length) < (currentTime / (duration || 1));
                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "flex-1 rounded-full transition-all duration-150",
                                        isPast ? 'bg-emerald-500 w-[3px]' : 'bg-slate-300 w-[2px]'
                                    )}
                                    style={{
                                        height: `${Math.max(4, amplitude * 100)}%`,
                                        maxWidth: '3px'
                                    }}
                                />
                            );
                        })}
                    </div>

                    {/* Meta Data: Time and Mic */}
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-slate-500 tabular-nums">
                            {isPlaying ? formatTime(currentTime) : formatTime(duration)}
                        </span>
                        <div className="flex items-center gap-1">
                            <span className={cn(
                                "material-symbols-outlined text-base",
                                fromAgent ? "text-emerald-500" : "text-slate-400"
                            )}>
                                mic
                            </span>
                        </div>
                    </div>
                </div>

                <audio
                    ref={audioRef}
                    src={message.content.mediaUrl}
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    onEnded={() => { setIsPlaying(false); setCurrentTime(0); }}
                    onLoadedMetadata={(e) => {
                        // If duration is 0, try to update from metadata
                        if (!duration && e.currentTarget.duration) {
                            // We might want to pass this back up or handle locally
                        }
                    }}
                    preload="metadata"
                    hidden
                />
            </div>
        </div>
    );
};

// Helper internal simple cn
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
