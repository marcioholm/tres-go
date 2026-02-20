import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Trash2, Send, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AudioPreviewComposer({
    audioUrl,
    onCancel,
    onSend,
    onSchedule
}: {
    audioUrl: string;
    onCancel: () => void;
    onSend: () => void;
    onSchedule?: () => void;
}) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.addEventListener('loadedmetadata', () => {
            setDuration(audio.duration);
        });

        audio.addEventListener('timeupdate', () => {
            setProgress((audio.currentTime / audio.duration) * 100);
        });

        audio.addEventListener('ended', () => {
            setIsPlaying(false);
            setProgress(0);
        });

        return () => {
            audio.pause();
            audio.removeAttribute('src');
            audio.load();
        };
    }, [audioUrl]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-3 p-3 bg-slate-50 border rounded-xl w-full">
            <Button variant="ghost" size="icon" onClick={onCancel} className="text-slate-400 hover:text-red-500 shrink-0">
                <Trash2 className="h-5 w-5" />
            </Button>

            <Button onClick={togglePlay} className="rounded-full h-10 w-10 shrink-0 bg-blue-600 hover:bg-blue-700 text-white p-0 flex items-center justify-center">
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
            </Button>

            <div className="flex-1 min-w-0">
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden w-full max-w-[200px]">
                    <div
                        className="h-full bg-blue-500 transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="text-xs text-slate-500 mt-1">
                    {formatTime(audioRef.current?.currentTime || 0)} / {formatTime(duration)}
                </div>
            </div>

            {onSchedule && (
                <Button variant="ghost" size="icon" onClick={onSchedule} className="text-blue-600 hover:bg-blue-100 shrink-0">
                    <Clock className="h-5 w-5" />
                </Button>
            )}

            <Button onClick={onSend} className="rounded-full px-4 shrink-0 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                <Send className="h-4 w-4 mr-2" />
                Enviar PTT
            </Button>
        </div>
    );
}
