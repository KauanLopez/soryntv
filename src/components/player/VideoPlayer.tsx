import React, { useState, useEffect, useRef } from 'react';
import { Stream } from '@/lib/stremio';
import { WebtorPlayer } from './WebtorPlayer';

interface VideoPlayerProps {
    stream: Stream;
    title?: string;
    onClose: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ stream, title, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Detect if valid HTTP stream
    const isPlayable = Boolean(stream.url && (stream.url.startsWith('http') || stream.url.startsWith('https')));

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(e => {
                console.error("Autoplay failed:", e);
                // Don't set error immediately, let user click play
            });
        }
    }, [stream]);

    const handleOpenExternal = () => {
        if (stream.infoHash) {
            // Magnet link construction for Stremio or Torrent client
            const magnet = `magnet:?xt=urn:btih:${stream.infoHash}&dn=${encodeURIComponent(title || 'video')}`;
            window.location.href = magnet;
        } else if (stream.url) {
            window.open(stream.url, '_blank');
        } else if (stream.externalUrl) {
            window.open(stream.externalUrl, '_blank');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black animate-in fade-in duration-300">
            {/* Initial Loader / Error / UI Overlay */}

            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 z-50 p-2 bg-black/50 hover:bg-white text-white hover:text-black rounded-full transition-all"
            >
                <span className="material-symbols-outlined text-3xl">close</span>
            </button>

            {/* Content */}
            <div className="w-full h-full relative group">
                {isPlayable ? (
                    <video
                        ref={videoRef}
                        className="w-full h-full object-contain"
                        controls
                        autoPlay
                        src={stream.url}
                        onError={(e) => {
                            console.error("Video Error:", e);
                            setError("Browser cannot play this format. Try an external player.");
                        }}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                    >
                        Your browser does not support the video tag.
                    </video>
                ) : stream.infoHash ? (
                    <WebtorPlayer
                        magnet={`magnet:?xt=urn:btih:${stream.infoHash}&dn=${encodeURIComponent(title || 'video')}`}
                    // No onClose prop needed here as the parent handles closing, but we might want it to match
                    />
                ) : (
                    /* Fallback for other non-playable streams */
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-6">
                        <div className="size-20 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                            <span className="material-symbols-outlined text-4xl">link_off</span>
                        </div>
                        <div className="max-w-md space-y-2">
                            <h3 className="text-2xl font-bold text-white">Playback Not Supported</h3>
                            <p className="text-zinc-400">
                                This stream type (likely P2P/Torrent) cannot be played directly in the browser.
                            </p>
                        </div>
                    </div>
                )}

                {/* Error Overlay */}
                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 space-y-6">
                        <div className="size-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                            <span className="material-symbols-outlined text-4xl">error</span>
                        </div>
                        <h3 className="text-xl font-bold text-white max-w-md text-center">{error}</h3>

                        <button
                            onClick={handleOpenExternal}
                            className="px-8 py-3 bg-white text-black rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined">open_in_new</span>
                            Abrir Player Externo
                        </button>
                    </div>
                )}

                {/* Overlay Controls for unsupported formats even if no error yet (if manual check failed or just preemptive) */}
            </div>
        </div>
    );
};
