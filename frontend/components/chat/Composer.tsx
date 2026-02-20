
"use client"

import { useState, useRef, useEffect, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Paperclip, Mic, Send, Smile, X, FileText, Image as ImageIcon, Film, File as FileIcon, Calendar as CalendarIcon, Clock, ArrowRightLeft, Lock, CalendarClock } from "lucide-react"
import { api } from "@/lib/api"
import EmojiPicker, { EmojiClickData } from "emoji-picker-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { AudioPreviewComposer } from "./AudioPreviewComposer"

interface ComposerProps {
    onSendMessage: (text: string, mediaUrl?: string, mediaType?: 'image' | 'video' | 'audio' | 'document', isInternal?: boolean, mediaMeta?: any) => void
    onScheduleMessage?: (date: Date, text: string, mediaUrl?: string, mediaType?: 'image' | 'video' | 'audio' | 'document', mediaMeta?: any) => void
    isInternalNoteMode?: boolean
}

export function Composer({ onSendMessage, onScheduleMessage }: ComposerProps) {
    const [message, setMessage] = useState("")
    const [isInternal, setIsInternal] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [attachment, setAttachment] = useState<{ file: File, preview: string, type: 'image' | 'video' | 'audio' | 'document' } | null>(null)
    const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined)
    const [scheduleTime, setScheduleTime] = useState("09:00")
    const [isScheduleOpen, setIsScheduleOpen] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setMessage((prev) => prev + emojiData.emoji)
    }

    const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            const type = file.type.startsWith('image/') ? 'image' :
                file.type.startsWith('video/') ? 'video' :
                    file.type.startsWith('audio/') ? 'audio' : 'document'

            const preview = type === 'image' ? URL.createObjectURL(file) : ''

            setAttachment({ file, preview, type })
        }
    }

    const uploadFile = async (file: File, isPtt = false) => {
        const formData = new FormData()
        formData.append('file', file)

        // Hardcode a workspaceId and uploadedBy just for testing, 
        // in a real app this would come from an auth context or workspace context
        formData.append('workspaceId', window.location.pathname.split('/')[2] || '')
        formData.append('uploadedBy', 'user_id_here')

        if (isPtt) {
            formData.append('isPtt', 'true')
        }

        try {
            const { data } = await api.post('/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            return data // returns { url, isPtt, duration, waveform }
        } catch (error) {
            console.error("Upload failed", error)
            return null
        }
    }

    const handleSend = async (forceAttachment?: any) => {
        const currentAttachment = forceAttachment || attachment;
        if (!message.trim() && !currentAttachment) return

        let mediaUrl = undefined
        let mediaType = undefined
        let mediaMeta = undefined

        if (currentAttachment) {
            const isPtt = currentAttachment.file.name === 'voice_note.webm';
            const uploadResult = await uploadFile(currentAttachment.file, isPtt)
            if (uploadResult) {
                mediaUrl = uploadResult.url
                mediaType = currentAttachment.type
                mediaMeta = {
                    isPtt: uploadResult.isPtt,
                    duration: uploadResult.duration,
                    waveform: uploadResult.waveform
                }
            }
        }

        onSendMessage(message, mediaUrl, mediaType, isInternal, mediaMeta)

        // Reset state
        setMessage("")
        setAttachment(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleSchedule = async (forceAttachment?: any) => {
        const currentAttachment = forceAttachment || attachment;
        if (!message.trim() && !currentAttachment) return
        if (!scheduleDate || !onScheduleMessage) return

        // Combine date and time
        const [hours, minutes] = scheduleTime.split(':').map(Number)
        const scheduledDateTime = new Date(scheduleDate)
        scheduledDateTime.setHours(hours)
        scheduledDateTime.setMinutes(minutes)

        let mediaUrl = undefined
        let mediaType = undefined
        let mediaMeta = undefined

        if (currentAttachment) {
            const isPtt = currentAttachment.file.name === 'voice_note.webm';
            const uploadResult = await uploadFile(currentAttachment.file, isPtt)
            if (uploadResult) {
                mediaUrl = uploadResult.url
                mediaType = currentAttachment.type
                mediaMeta = {
                    isPtt: uploadResult.isPtt,
                    duration: uploadResult.duration,
                    waveform: uploadResult.waveform
                }
            }
        }

        onScheduleMessage(scheduledDateTime, message, mediaUrl, mediaType, mediaMeta)

        setIsScheduleOpen(false)
        setScheduleDate(undefined)
        setMessage("")
        setAttachment(null)
    }

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animationRef = useRef<number | undefined>(undefined)
    const analyserRef = useRef<AnalyserNode | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)

    const drawWaveform = () => {
        if (!canvasRef.current || !analyserRef.current) return
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const width = canvas.width
        const height = canvas.height
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw)
            analyserRef.current!.getByteTimeDomainData(dataArray)

            ctx.fillStyle = 'transparent'
            ctx.clearRect(0, 0, width, height)

            ctx.lineWidth = 2
            ctx.strokeStyle = '#ef4444' // red-500
            ctx.beginPath()

            const sliceWidth = width * 1.0 / dataArray.length
            let x = 0

            for (let i = 0; i < dataArray.length; i++) {
                const v = dataArray[i] / 128.0
                const y = v * height / 2

                if (i === 0) {
                    ctx.moveTo(x, y)
                } else {
                    ctx.lineTo(x, y)
                }

                x += sliceWidth
            }

            ctx.lineTo(width, height / 2)
            ctx.stroke()
        }

        draw()
    }

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

            // Setup Audio Context for Waveform
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
            const audioCtx = new AudioContextClass()
            const source = audioCtx.createMediaStreamSource(stream)
            const analyser = audioCtx.createAnalyser()

            analyser.fftSize = 256
            source.connect(analyser)
            analyserRef.current = analyser
            audioContextRef.current = audioCtx

            // Prefer opus codec for WhatsApp compatibility
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';

            const mediaRecorder = new MediaRecorder(stream, { mimeType })
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data)
                }
            }

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
                // PTT Preview always mapped to voice_note.webm identifier
                const audioFile = new File([audioBlob], "voice_note.webm", { type: mimeType })
                // Create preview URL
                setAttachment({ file: audioFile, preview: URL.createObjectURL(audioBlob), type: 'audio' })

                // Cleanup audio context
                if (animationRef.current) cancelAnimationFrame(animationRef.current)
                if (audioContextRef.current) {
                    audioContextRef.current.close()
                }
            }

            mediaRecorder.start()
            setIsRecording(true)

            // Kick off drawing the waveform via slight delay to ensure canvas exists
            setTimeout(() => drawWaveform(), 50)
        } catch (error) {
            console.error("Error accessing microphone:", error)
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            // Stop all tracks to release microphone
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
        }
    }

    // Se tiver um anexo de áudio do tipo PTT, renderiza somente o PTT Preview
    if (attachment && attachment.file.name === 'voice_note.webm') {
        return (
            <div className={cn("p-4 border-t flex flex-col gap-3 transition-colors", isInternal ? "bg-yellow-50/50" : "bg-white")}>
                <AudioPreviewComposer
                    audioUrl={attachment.preview}
                    onCancel={() => {
                        setAttachment(null);
                        if (fileInputRef.current) fileInputRef.current.value = ""
                    }}
                    onSend={() => handleSend(attachment)}
                />
            </div>
        )
    }

    return (
        <div className={cn("p-4 border-t flex flex-col gap-3 transition-colors", isInternal ? "bg-yellow-50/50" : "bg-white")}>
            {/* Attachment Preview (For static generic attachments) */}
            {attachment && (
                <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-lg w-fit relative group">
                    <button
                        onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = "" }}
                        className="absolute -top-2 -right-2 bg-slate-500 text-white rounded-full p-0.5 hover:bg-slate-600 z-10"
                    >
                        <X className="h-3 w-3" />
                    </button>
                    {attachment.type === 'image' && (
                        <img src={attachment.preview} alt="Preview" className="h-12 w-12 object-cover rounded" />
                    )}
                    {attachment.type === 'video' && <Film className="h-8 w-8 text-slate-500" />}
                    {attachment.type === 'audio' && <Mic className="h-8 w-8 text-slate-500" />}
                    {attachment.type === 'document' && <FileIcon className="h-8 w-8 text-slate-500" />}
                    <span className="text-xs text-slate-600 max-w-[150px] truncate">{attachment.file.name}</span>
                </div>
            )}

            <div className="flex items-end gap-3">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                />

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400 mb-0.5 shrink-0">
                            <Paperclip className="h-5 w-5" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-1" align="start">
                        <Button variant="ghost" className="w-full justify-start text-xs gap-2" onClick={() => fileInputRef.current?.click()}>
                            <FileText className="h-4 w-4" /> Documento
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-xs gap-2" onClick={() => {
                            if (fileInputRef.current) {
                                fileInputRef.current.accept = "image/*,video/*"
                                fileInputRef.current.click()
                            }
                        }}>
                            <ImageIcon className="h-4 w-4" /> Foto/Vídeo
                        </Button>
                    </PopoverContent>
                </Popover>

                <div className={cn("flex-1 rounded-xl border p-2 focus-within:ring-2 transition-all flex flex-col", isInternal ? "bg-yellow-100 border-yellow-200 focus-within:ring-yellow-300" : "bg-slate-50 border-slate-200 focus-within:ring-red-100 focus-within:border-red-300")}>
                    <div className="flex items-center gap-2 mb-2">
                        <Button
                            variant={isInternal ? "default" : "ghost"}
                            size="icon"
                            className={isInternal ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "text-slate-400"}
                            onClick={() => setIsInternal(!isInternal)}
                            title="Nota Interna (não visível para o cliente)"
                        >
                            <Lock className="h-5 w-5" />
                        </Button>
                        <div className="w-px h-6 bg-slate-200 mx-1" />
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-slate-400" title="Inserir Emoji">
                                    <Smile className="h-5 w-5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0 border-none">
                                <EmojiPicker onEmojiClick={handleEmojiClick} />
                            </PopoverContent>
                        </Popover>
                        {/* Transfer Button - Placeholder for future implementation */}
                        <Button variant="ghost" size="icon" className="text-slate-400" title="Transferir Atendimento">
                            <ArrowRightLeft className="h-5 w-5" />
                        </Button>
                    </div>
                    {isRecording ? (
                        <div className="w-full flex items-center justify-between p-2 pl-4">
                            <span className="text-red-500 font-medium text-sm animate-pulse flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                Gravando...
                            </span>
                            <canvas ref={canvasRef} width={150} height={30} className="ml-4" />
                        </div>
                    ) : (
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSend()
                                }
                            }}
                            placeholder={isInternal ? "Adicionar nota interna (visível apenas para a equipe)..." : "Escreva sua mensagem..."}
                            className="w-full bg-transparent border-none focus:ring-0 text-sm resize-none min-h-[40px] max-h-[120px] outline-none p-2"
                        />
                    )}

                    <div className="flex items-center gap-2 mt-2 p-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("text-slate-400 transition-colors", isRecording ? "text-red-600 bg-red-50 hover:bg-red-100 ring-2 ring-red-500" : "")}
                            onClick={() => {
                                if (isRecording) {
                                    stopRecording()
                                } else {
                                    startRecording()
                                }
                            }}
                        >
                            <Mic className="h-5 w-5" />
                        </Button>
                        <Popover open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className={scheduleDate ? "text-blue-600 bg-blue-50" : "text-slate-400"}>
                                    <CalendarClock className="h-5 w-5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-4" align="end">
                                <div className="space-y-4">
                                    <h4 className="font-medium text-sm">Agendar Mensagem</h4>
                                    <Calendar
                                        mode="single"
                                        selected={scheduleDate}
                                        onSelect={setScheduleDate}
                                        className="rounded-md border"
                                    />
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-slate-500" />
                                        <input
                                            type="time"
                                            className="border rounded px-2 py-1 text-sm w-full"
                                            value={scheduleTime}
                                            onChange={(e) => setScheduleTime(e.target.value)}
                                        />
                                    </div>
                                    {scheduleDate && (
                                        <Button size="sm" variant="ghost" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => { setScheduleDate(undefined); setScheduleTime("09:00") }}>
                                            Cancelar Agendamento
                                        </Button>
                                    )}
                                    <Button
                                        onClick={handleSchedule}
                                        disabled={!scheduleDate || (!message.trim() && !attachment)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        Agendar Mensagem
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Button
                            onClick={handleSend}
                            disabled={(!message.trim() && !attachment) || false}
                            className={cn(
                                "rounded-full px-6 transition-all duration-300 ml-auto", // ml-auto to push it to the right
                                isInternal ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-red-600 hover:bg-red-700 text-white"
                            )}
                        >
                            {isInternal ? (
                                <>
                                    <Lock className="h-4 w-4 mr-2" />
                                    Salvar Nota
                                </>
                            ) : scheduleDate ? (
                                <>
                                    <CalendarClock className="h-4 w-4 mr-2" />
                                    Agendar
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Enviar
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
