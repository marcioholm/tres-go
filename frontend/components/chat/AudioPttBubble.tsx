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
    const waveform = message.content.waveform || Array(40).fill(0.3);
    const duration = message.content.duration || 0;

    return (
        <div className={`flex items-end gap-2 ${fromAgent ? 'flex-row-reverse' : ''}`}>

            {/* Bolha PTT — idêntica ao WhatsApp */}
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl max-w-[260px] shadow-sm ${fromAgent
                ? 'bg-[#E7FFDB] text-slate-800 rounded-br-sm border border-[#D1EAB5]'    // Estilo WhatsApp Outgoing
                : 'bg-white text-slate-800 rounded-bl-sm border border-slate-100'
                }`}>

                {/* Botão play/pause */}
                <button
                    onClick={() => {
                        if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
                        else { audioRef.current?.play(); setIsPlaying(true); }
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${fromAgent ? 'bg-transparent text-emerald-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'
                        }`}
                >
                    <span className={`material-symbols-outlined text-3xl font-light`}>
                        {isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                </button>

                <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
                    {/* Waveform com progresso */}
                    <div className="flex items-center gap-px h-6">
                        {waveform.map((amplitude, i) => {
                            const isPast = (i / waveform.length) < (currentTime / (duration || 1));
                            return (
                                <div
                                    key={i}
                                    className={`flex-1 rounded-full transition-colors duration-100 ${isPast
                                        ? 'bg-emerald-500'
                                        : 'bg-slate-300'
                                        }`}
                                    style={{ height: `${Math.max(20, amplitude * 100)}%` }}
                                />
                            );
                        })}
                    </div>

                    {/* Tempo */}
                    <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-medium tabular-nums ${fromAgent ? 'text-slate-500' : 'text-slate-400'}`}>
                            {isPlaying ? formatTime(currentTime) : formatTime(duration)}
                        </span>
                        {/* Ícone de microfone */}
                        <span className={`material-symbols-outlined text-sm ${fromAgent ? 'text-emerald-500' : 'text-slate-300'}`}>
                            mic
                        </span>
                    </div>
                </div>

                <audio
                    ref={audioRef}
                    src={message.content.mediaUrl}
                    onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                    onEnded={() => { setIsPlaying(false); setCurrentTime(0); }}
                    preload="metadata"
                    hidden
                />
            </div>

        </div>
    );
};
