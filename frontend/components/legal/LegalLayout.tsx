import Link from 'next/link';

interface LegalLayoutProps {
    title: string;
    subtitle: string;
    version: string;
    updatedAt: string;
    children: React.ReactNode;
}

export function LegalLayout({ title, subtitle, version, updatedAt, children }: LegalLayoutProps) {
    return (
        <div className="min-h-screen bg-[#030304]">

            {/* Header público */}
            <header className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff1f4b] to-[#ff4d6d] flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <path d="M13 3L21 11M21 11L13 19M21 11H3" />
                            </svg>
                        </div>
                        <span className="font-bold text-white">NorthWay Omni</span>
                    </Link>
                    <div className="flex gap-4 text-sm text-white/40">
                        <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
                        <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
                        <Link href="/login" className="hover:text-white transition-colors">Entrar</Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <div className="border-b border-white/5 bg-gradient-to-br from-[#1a0b0e] to-[#030304]">
                <div className="max-w-5xl mx-auto px-6 py-16">
                    <div className="inline-flex items-center gap-2 bg-[#ff1f4b]/10 border border-[#ff1f4b]/20 rounded-full px-4 py-1.5 mb-6">
                        <span className="text-[#ff1f4b] text-xs font-bold uppercase tracking-wider">Documento Legal</span>
                    </div>
                    <h1 className="text-4xl font-black text-white mb-3">{title}</h1>
                    <p className="text-white/50 text-lg mb-6">{subtitle}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-white/30">
                        <span>Versão {version}</span>
                        <span>·</span>
                        <span>Atualizado em {updatedAt}</span>
                        <span>·</span>
                        <span>Vigência imediata</span>
                    </div>
                </div>
            </div>

            {/* Conteúdo */}
            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="max-w-3xl">{children}</div>
            </div>

            {/* Footer */}
            <footer className="border-t border-white/5 mt-20">
                <div className="max-w-5xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-white/30 text-sm">© 2026 NorthWay Company. CNPJ 56.106.629/0001-75</p>
                    <div className="flex gap-6 text-sm text-white/30">
                        <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
                        <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
                        <a href="mailto:marciogholmm@gmail.com" className="hover:text-white transition-colors">
                            marciogholmm@gmail.com
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// ─── Componentes internos reutilizáveis ───────────────────────────────────────

export function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
    return (
        <section id={id} className="mb-12 scroll-mt-24">
            <h2 className="text-2xl font-bold text-white mb-4 pb-3 border-b border-white/5">{title}</h2>
            <div className="space-y-4">{children}</div>
        </section>
    );
}

export function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mt-6">
            <h3 className="text-base font-bold text-white/90 mb-3">{title}</h3>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

export function P({ children }: { children: React.ReactNode }) {
    return <p className="text-sm leading-7 text-white/60">{children}</p>;
}

export function BulletList({ items }: { items: string[] }) {
    return (
        <ul className="space-y-2 ml-2">
            {items.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-white/60">
                    <span className="text-[#ff1f4b] mt-1.5 flex-shrink-0 text-xs">●</span>
                    <span className="leading-6">{item}</span>
                </li>
            ))}
        </ul>
    );
}

export function HighlightBox({ icon, children }: { icon: string; children: React.ReactNode }) {
    return (
        <div className="bg-[#ff1f4b]/5 border border-[#ff1f4b]/15 rounded-xl p-5 my-4">
            <p className="text-sm text-white/70 leading-6">
                <span className="mr-2">{icon}</span>{children}
            </p>
        </div>
    );
}
