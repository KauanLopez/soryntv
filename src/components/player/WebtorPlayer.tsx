import React, { useEffect, useRef, useState } from 'react';

interface WebtorPlayerProps {
    magnet: string;
    onClose?: () => void;
    poster?: string;
    title?: string;
}

declare global {
    interface Window {
        webtor?: any[];
    }
}

export const WebtorPlayer: React.FC<WebtorPlayerProps> = ({ magnet, onClose, poster, title }) => {
    const playerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const playerId = 'webtor-player-container';

    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const trafficInterval = useRef<any>(null);

    // --- 📡 DETETIVE DE TRÁFEGO PESADO ---
    useEffect(() => {
        if (!isLoading) return;

        const checkHeavyTraffic = () => {
            // Pega os recursos baixados recentemente
            const resources = performance.getEntriesByType("resource");
            const now = performance.now();

            // Filtra apenas o que aconteceu nos últimos 2 segundos
            const recent = resources.filter(r => r.startTime > now - 2000);

            // PROCURA POR ARQUIVOS "PESADOS"
            // Pedaços de vídeo (Chunks) geralmente têm mais de 100KB ou 200KB.
            // Imagens e scripts de analytics geralmente têm 2KB a 50KB.
            const hasHeavyDownload = recent.some(r => {
                // Se baixou algo maior que 150KB (approx) vindo do webtor ou blob
                // OBS: transferSize pode ser 0 se vier do cache, então olhamos encodedBodySize também
                const size = (r as any).transferSize || (r as any).encodedBodySize || 0;

                const isVideoChunk = size > 150000; // > 150KB
                const isWebtorRelated = r.name.includes('webtor') || r.name.includes('blob') || r.name.includes('segment');

                return isVideoChunk && isWebtorRelated;
            });

            if (hasHeavyDownload) {
                console.log("🚀 [DETECTOR] Download pesado detectado! O filme começou.");
                setStatusMessage('Iniciando reprodução...');

                // Pequeno delay para garantir que a imagem apareceu
                setTimeout(() => {
                    setIsLoading(false);
                    setIsPlaying(true);
                }, 1000);
            }
        };

        // Verifica a cada 800ms
        trafficInterval.current = setInterval(checkHeavyTraffic, 800);

        return () => {
            if (trafficInterval.current) clearInterval(trafficInterval.current);
        };
    }, [isLoading]);

    useEffect(() => {
        if (playerRef.current) playerRef.current.innerHTML = '';
        setIsLoading(false);
        setIsPlaying(false);

        window.webtor = window.webtor || [];
        window.webtor.push({
            id: playerId,
            magnet: magnet,
            width: '100%',
            height: '100%',
            theme: 'dark',
            title: title || 'SorynTV',
            poster: poster,
            lang: 'pt-BR',
            features: {
                continue: true,
                p2p: true,
                autoplay: false,
                controls: true,
                settings: true,
                subtitles: true,
            },
            on: {
                init: () => console.log('Webtor: Init'),
                download: () => setStatusMessage('Baixando...'),
                play: () => {
                    console.log('Webtor: Play detected');
                    setIsLoading(false);
                    setIsPlaying(true);
                },
            }
        });

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@webtor/embed-sdk-js/dist/index.min.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) document.body.removeChild(script);
            if (playerRef.current) playerRef.current.innerHTML = '';
            if (trafficInterval.current) clearInterval(trafficInterval.current);
        };
    }, [magnet]);

    // Detector de Clique (Blur)
    useEffect(() => {
        const handleFocusChange = () => {
            const activeElement = document.activeElement;
            const iframe = containerRef.current?.querySelector('iframe');

            if (iframe && activeElement === iframe) {
                setStatusMessage('Carregando Filme...');
                setIsLoading(true);
            }
        };
        window.addEventListener('blur', handleFocusChange);
        return () => window.removeEventListener('blur', handleFocusChange);
    }, []);

    return (
        <div ref={containerRef} className="fixed inset-0 w-screen h-screen bg-black z-[9999] flex items-center justify-center overflow-hidden group cursor-pointer">

            {/* IFRAME */}
            <div id={playerId} ref={playerRef} className="w-full h-full flex items-center justify-center" />

            {/* BOTÃO FANTASMA */}
            {!isLoading && !isPlaying && (
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                    <div className="relative group-hover:scale-110 transition-transform duration-300 ease-out">
                        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 group-hover:opacity-40 rounded-full"></div>
                        <div className="relative size-24 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center shadow-2xl">
                            <span className="material-symbols-outlined text-6xl text-white ml-2 drop-shadow-lg">play_arrow</span>
                        </div>
                    </div>
                </div>
            )}

            {/* CORTINA DE CARREGAMENTO */}
            <div
                className={`absolute inset-0 z-[10000] flex flex-col items-center justify-center bg-black/95 transition-opacity duration-500 ${isLoading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
            >
                <div className="flex flex-col items-center gap-6 p-6 animate-in fade-in zoom-in duration-300">
                    <div className="relative">
                        <div className="size-16 rounded-full border-4 border-zinc-800 border-t-blue-500 animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-500 animate-pulse">movie</span>
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-white font-bold text-xl">Preparando Sessão</h3>
                        <p className="text-zinc-400 text-sm font-mono animate-pulse">{statusMessage}</p>
                    </div>
                </div>

                {/* BOTÃO DE SEGURANÇA (Caso a detecção de rede falhe) */}
                <div className="absolute bottom-10 animate-in slide-in-from-bottom-4 duration-1000 delay-3000 fill-mode-forwards opacity-0" style={{ animationDelay: '3s' }}>
                    <button
                        onClick={() => setIsLoading(false)}
                        className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-full text-xs transition-all border border-zinc-800 cursor-pointer pointer-events-auto shadow-lg"
                    >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        Vídeo começou? Liberar Tela
                    </button>
                </div>
            </div>

            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-[10001] p-3 bg-black/50 hover:bg-white hover:text-black text-white rounded-full transition-all backdrop-blur-sm pointer-events-auto"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            )}
        </div>
    );
};