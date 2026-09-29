
import React, { useState, useEffect, useMemo } from 'react';
import { tmdb, TMDBWatchProvidersResult, getStremioID } from '@/lib/tmdb';
import { AddonManager, Stream } from '@/lib/stremio';
import { supabase } from '@/lib/supabase';
import { StreamList } from './StreamList';
import { SeasonSelector } from './SeasonSelector';
import { VideoPlayerModal } from '@/components/player/VideoPlayerModal';
import type { SelectedMedia } from '@/types';

interface WatchSectionProps {
    media: SelectedMedia;
    title: string;
    numberOfSeasons?: number;
    // We pass ID, but note: Stremio often needs IMDB ID (tt12345). 
    // If media.id is a TMDB ID (number), we might need an external conversion service or AddonManager heuristic.
    // For this implementation, we assume the AddonManager might handle it or we use the number ID.
    // *If real app*, use `tmdb.getDetails` -> retrieve `external_ids` -> use IMDB ID.
}

export const WatchSection: React.FC<WatchSectionProps> = ({ media, title, numberOfSeasons }) => {
    const [playingStream, setPlayingStream] = useState<Stream | null>(null);
    const [providers, setProviders] = useState<TMDBWatchProvidersResult | null>(null);
    const [streams, setStreams] = useState<Stream[]>([]);
    const [loadingStreams, setLoadingStreams] = useState(false);
    const [addonManager, setAddonManager] = useState<AddonManager | null>(null);

    // Initialize Addon Manager with user's installed addons
    useEffect(() => {
        const initManager = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            let urls: string[] = [];
            
            if (session) {
                // Fetch user addons from DB
                const { data: userAddons } = await supabase
                    .from('user_addons')
                    .select('transport_url')
                    .eq('user_id', session.user.id);

                urls = userAddons?.map(a => a.transport_url) || [];
            }

            // Fallbacks if no addons are installed or user is anonymous
            if (urls.length === 0) {
                urls.push('https://v3-cinemeta.strem.io/manifest.json');
                // You can add more public default addons here if you want
            }

            const manager = new AddonManager(urls);
            await manager.init(); // fetch manifests
            setAddonManager(manager);
        };
        initManager();
    }, []);

    // Fetch Content (Providers + Streams if Movie)
    useEffect(() => {
        const fetchContent = async () => {
            // 1. TMDB Providers (Buy/Rent)
            const providerData = await tmdb.getWatchProviders(media.id, media.type);
            setProviders(providerData);

            // 2. Streams (Only if Movie - Series handled by SeasonSelector)
            if (media.type === 'movie' && addonManager) {
                setLoadingStreams(true);
                try {
                    // Convert TMDB ID to IMDB ID for Stremio Addons
                    const imdbId = await getStremioID(media.id, 'movie');
                    const results = await addonManager.getAllStreams('movie', imdbId);
                    setStreams(results);
                } catch (e) {
                    console.error('Failed to load streams:', e);
                } finally {
                    setLoadingStreams(false);
                }
            }
        };

        if (addonManager || media.type === 'tv') {
            // For TV we still fetch providers here
            fetchContent();
        }

    }, [media.id, media.type, addonManager]);

    const handlePlay = (stream: Stream) => {
        console.log('🎬 Handle Play Triggered:', stream);
        setPlayingStream(stream);
    };

    console.log('WatchSection Render. PlayingStream:', playingStream);

    return (
        <div className="w-full px-6 md:px-12 lg:px-24 pb-24 space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* LEFT: Streaming Options (Stremio) */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-full bg-white text-black flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">play_arrow</span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tight text-white">Stream Now</h3>
                            <p className="text-zinc-500 font-medium">Available sources from your addons</p>
                        </div>
                    </div>

                    {media.type === 'movie' ? (
                        <StreamList
                            streams={streams}
                            loading={loadingStreams}
                            onSelect={handlePlay}
                        />
                    ) : (
                        addonManager ? (
                            <SeasonSelector
                                seriesId={media.id}
                                numberOfSeasons={numberOfSeasons || 1}
                                addonManager={addonManager}
                                onStreamSelect={handlePlay}
                            />
                        ) : (
                            <div className="py-12 flex justify-center">
                                <span className="animate-spin border-2 border-white/20 border-t-white rounded-full size-8"></span>
                            </div>
                        )
                    )}
                </div>

                {/* RIGHT: Official Providers (TMDB) */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">shopping_bag</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-white">Buy or Rent</h3>
                            <p className="text-zinc-500 font-medium text-sm">Official platforms</p>
                        </div>
                    </div>

                    {!providers ? (
                        <div className="p-6 rounded-2xl border border-dashed border-zinc-800 text-center">
                            <p className="text-zinc-600 text-xs uppercase tracking-widest">No official providers found in US</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Flatrate / Subscription */}
                            {providers.flatrate && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Stream</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {providers.flatrate.map(p => (
                                            <a
                                                key={p.provider_id}
                                                href={providers.link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="size-12 rounded-xl overflow-hidden border border-white/10 hover:border-white hover:scale-110 transition-all"
                                                title={p.provider_name}
                                            >
                                                <img src={`https://image.tmdb.org/t/p/original${p.logo_path}`} alt={p.provider_name} className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Buy */}
                            {providers.buy && (
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Buy</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {providers.buy.map(p => (
                                            <a
                                                key={p.provider_id}
                                                href={providers.link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="size-12 rounded-xl overflow-hidden border border-white/10 hover:border-white hover:scale-110 transition-all"
                                                title={p.provider_name}
                                            >
                                                <img src={`https://image.tmdb.org/t/p/original${p.logo_path}`} alt={p.provider_name} className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {/* Video Player Modal */}
            {playingStream && (
                <VideoPlayerModal
                    isOpen={!!playingStream}
                    onClose={() => setPlayingStream(null)}
                    stream={playingStream}
                    title={title}
                />
            )}
        </div>
    );
};
