import React, { useEffect, useRef, useState } from 'react';

interface WebtorPlayerProps {
    magnet: string;
    onClose?: () => void;
}

declare global {
    interface Window {
        webtor: any[];
    }
}

/**
 * WebtorPlayer using the official Webtor SDK via CDN script
 * Based on: https://github.com/webtor-io/embed-sdk-js
 */
export const WebtorPlayer: React.FC<WebtorPlayerProps> = ({
    magnet,
    onClose
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const scriptLoadedRef = useRef(false);

    useEffect(() => {
        console.log('[WebtorPlayer] Initializing for magnet:', magnet);

        // Initialize webtor array if not exists
        if (!window.webtor) {
            window.webtor = [];
        }

        // Load the Webtor SDK script if not already loaded
        const loadScript = () => {
            return new Promise<void>((resolve, reject) => {
                // Check if script already exists
                if (document.querySelector('script[src*="webtor"]') || scriptLoadedRef.current) {
                    console.log('[WebtorPlayer] Script already loaded');
                    resolve();
                    return;
                }

                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@webtor/embed-sdk-js/dist/index.min.js';
                script.async = true;
                script.charset = 'utf-8';

                script.onload = () => {
                    console.log('[WebtorPlayer] SDK script loaded successfully');
                    scriptLoadedRef.current = true;
                    resolve();
                };

                script.onerror = () => {
                    console.error('[WebtorPlayer] Failed to load SDK script');
                    reject(new Error('Failed to load Webtor SDK'));
                };

                document.body.appendChild(script);
            });
        };

        const initPlayer = async () => {
            try {
                await loadScript();

                // Small delay to ensure script is initialized
                await new Promise(resolve => setTimeout(resolve, 100));

                if (containerRef.current) {
                    // Clear container
                    containerRef.current.innerHTML = '';

                    const videoId = `webtor-${Math.random().toString(36).substr(2, 9)}`;

                    // Create video element with magnet as src
                    const videoEl = document.createElement('video');
                    videoEl.controls = true;
                    videoEl.src = magnet;
                    videoEl.id = videoId;
                    videoEl.style.width = '100%';
                    videoEl.style.height = '100%';
                    videoEl.className = 'webtor';

                    containerRef.current.appendChild(videoEl);

                    console.log('[WebtorPlayer] Video element created with ID:', videoId);

                    // Explicitly trigger Webtor in case it missed the DOM scan
                    if (window.webtor) {
                        window.webtor.push({
                            id: videoId,
                            magnet: magnet,
                            width: '100%',
                            height: '100%',
                            i18n: {
                                en: {
                                    common: {
                                        "play": "Play",
                                    }
                                }
                            }
                        });
                    }

                    // The SDK should automatically pick up the video element
                    setIsLoading(false);
                }
            } catch (err: any) {
                console.error('[WebtorPlayer] Error:', err);
                setError(err.message || 'Failed to initialize player');
                setIsLoading(false);
            }
        };

        initPlayer();

        return () => {
            // Cleanup
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [magnet]);

    if (error) {
        return (
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#000',
                    color: '#fff',
                    zIndex: 100,
                    padding: '24px',
                    textAlign: 'center'
                }}
            >
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(239, 68, 68, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#ef4444' }}>warning</span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Failed to load Player</h3>
                <p style={{ color: '#a1a1aa', maxWidth: '400px', marginBottom: '16px' }}>{error}</p>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '8px 24px',
                            backgroundColor: '#dc2626',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Reload Page
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            style={{
                                padding: '8px 24px',
                                backgroundColor: '#3f3f46',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            Go Back
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: '#000',
                zIndex: 99
            }}
        >
            {/* Loading Overlay */}
            {isLoading && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#000',
                        zIndex: 101,
                        pointerEvents: 'none'
                    }}
                >
                    <div
                        style={{
                            width: '64px',
                            height: '64px',
                            border: '4px solid rgba(255,255,255,0.2)',
                            borderTopColor: '#14b8a6',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}
                    />
                    <p style={{ color: '#71717a', marginTop: '16px' }}>Initializing Webtor Stream...</p>
                    <style>{`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            )}

            {/* Player Container */}
            <div
                ref={containerRef}
                style={{
                    width: '100%',
                    height: '100%'
                }}
            />
        </div>
    );
};
