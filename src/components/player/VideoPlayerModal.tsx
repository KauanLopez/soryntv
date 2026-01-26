import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MediaPlayer, MediaProvider, Poster } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { Stream } from '@/lib/stremio';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { WebtorPlayer } from './WebtorPlayer';

interface VideoPlayerModalProps {
    isOpen: boolean;
    onClose: () => void;
    stream: Stream;
    title?: string;
    subtitles?: { label: string; src: string; lang: string }[];
}

// Logic to determine if a stream plays in browser (HTTP) or needs external player (Magnet/Torrent)
const isStreamPlayable = (url?: string) => {
    if (!url) return false;
    // Basic check: HTTP/HTTPS usually works. Magnet/UDP/etc do not.
    return url.startsWith('http://') || url.startsWith('https://');
};

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ isOpen, onClose, stream, title, subtitles }) => {

    // Auto-focus logic for keyboard accessibility
    useEffect(() => {
        if (isOpen) {
            // Lock body scroll?
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const playable = isStreamPlayable(stream.url);
    const isTorrent = !!stream.infoHash;

    const handleOpenExternal = () => {
        if (stream.infoHash) {
            const magnet = `magnet:?xt=urn:btih:${stream.infoHash}&dn=${encodeURIComponent(title || 'video')}`;
            window.location.href = magnet;
        } else if (stream.url) {
            window.open(stream.url, '_blank');
        } else if (stream.externalUrl) {
            window.open(stream.externalUrl, '_blank');
        }
    };

    // For torrent streams, use full-screen Webtor player

    if (isTorrent) {
        return createPortal(
            <>
                {/* Back button floating over the player */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        top: '16px',
                        left: '16px',
                        zIndex: 200,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        border: 'none',
                        borderRadius: '9999px',
                        color: '#fff',
                        cursor: 'pointer',
                        backdropFilter: 'blur(8px)'
                    }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_back</span>
                </button>

                {/* Webtor Player - takes full screen */}
                <WebtorPlayer
                    magnet={`magnet:?xt=urn:btih:${stream.infoHash}&dn=${encodeURIComponent(title || 'video')}`}
                    onClose={onClose}
                />
            </>,
            document.body
        );
    }

    return createPortal(
        <div className="fixed inset-0 z-[100] bg-black animate-in fade-in duration-300 flex flex-col">

            {/* Header / Overlay Controls */}
            <div className="absolute top-0 left-0 w-full p-6 z-50 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                <div className="pointer-events-auto">
                    <button onClick={onClose} className="group flex items-center gap-2 text-white/70 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">arrow_back</span>
                        <span className="font-bold text-lg hidden md:block">Back</span>
                    </button>
                    {title && <h2 className="mt-2 text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-1000">{title}</h2>}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 w-full h-full relative flex items-center justify-center">
                {playable ? (
                    <MediaPlayer
                        title={title}
                        src={stream.url}
                        autoPlay
                        className="w-full h-full"
                    >
                        <MediaProvider>
                            <Poster className="vds-poster" />
                        </MediaProvider>
                        <DefaultVideoLayout icons={defaultLayoutIcons} />
                    </MediaPlayer>
                ) : (
                    /* Fallback for other non-playable streams */
                    <div className="flex flex-col items-center justify-center p-8 text-center space-y-8 max-w-lg mx-auto animate-in slide-in-from-bottom-8 duration-500">
                        <div className="relative">
                            <div className="absolute inset-0 bg-accentTeal/20 blur-3xl rounded-full"></div>
                            <div className="relative size-24 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl">
                                <span className="material-symbols-outlined text-5xl text-zinc-500">link_off</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-3xl font-black text-white tracking-tight">External Player Required</h3>
                            <p className="text-zinc-400 text-lg leading-relaxed">
                                This stream ({stream.name || 'P2P'}) format is not supported in the browser.
                                Open it in your desktop player.
                            </p>
                        </div>

                        <div className="flex flex-col w-full gap-3 pt-4">
                            <button
                                onClick={handleOpenExternal}
                                className="w-full py-4 bg-white text-black font-black uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 flex items-center justify-center gap-3"
                            >
                                <span className="material-symbols-outlined">open_in_new</span>
                                Abrir Player Externo
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-zinc-900 text-zinc-400 font-bold uppercase tracking-wider rounded-xl hover:bg-zinc-800 hover:text-white transition-all"
                            >
                                Cancel
                            </button>
                        </div>

                        <div className="text-xs text-zinc-600 font-mono">
                            Hash: {stream.infoHash?.substring(0, 10)}...
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};
