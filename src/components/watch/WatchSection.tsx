
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

import { WarezCDNEmbed } from '@/components/embeds/WarezCDNEmbed';
import { EmbedMovies } from '@/components/embeds/EmbedMovies';
import { MegaEmbed } from '@/components/embeds/MegaEmbed';
import { SuperflixEmbed } from '@/components/embeds/SuperflixEmbed';
import { EmbedPlay } from '@/components/embeds/EmbedPlay';
import { VerticalAdBanner } from '@/components/ads/VerticalAdBanner';

type EmbedServer = 'none' | 'warezcdn' | 'embedmovies' | 'megaembed' | 'superflix' | 'embedplay';

export const WatchSection: React.FC<WatchSectionProps> = ({ media, title, numberOfSeasons }) => {
    const [playingStream, setPlayingStream] = useState<Stream | null>(null);
    const [activeEmbed, setActiveEmbed] = useState<EmbedServer>('none');
    
    // Embed specific season/episode state
    const [embedSeason, setEmbedSeason] = useState(1);
    const [embedEpisode, setEmbedEpisode] = useState(1);
    const [providers, setProviders] = useState<TMDBWatchProvidersResult | null>(null);
    const [streams, setStreams] = useState<Stream[]>([]);
    const [loadingStreams, setLoadingStreams] = useState(false);
    const [addonManager, setAddonManager] = useState<AddonManager | null>(null);
    const [resolvedImdbId, setResolvedImdbId] = useState<string | null>(null);

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
            if (media.type === 'movie') {
                try {
                    // Convert TMDB ID to IMDB ID for Stremio Addons & WarezCDN
                    const imdbId = await getStremioID(media.id, 'movie');
                    setResolvedImdbId(imdbId);

                    if (addonManager) {
                        setLoadingStreams(true);
                        const results = await addonManager.getAllStreams('movie', imdbId);
                        setStreams(results);
                        setLoadingStreams(false);
                    }
                } catch (e) {
                    console.error('Failed to load streams or IMDb ID:', e);
                    setLoadingStreams(false);
                }
            }
        };

        if (addonManager || media.type === 'tv') {
            fetchContent();
        }

    }, [media.id, media.type, addonManager]);

    const handlePlay = (stream: Stream) => {
        setPlayingStream(stream);
    };

    return (
        <div className="w-full px-6 md:px-12 lg:px-24 pb-24 space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* LEFT: Streaming Options */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-full bg-white text-black flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">play_arrow</span>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black uppercase tracking-tight text-white">Stream Now</h3>
                                <p className="text-zinc-500 font-medium">Choose your preferred source</p>
                            </div>
                        </div>
                    </div>

                    {activeEmbed !== 'none' ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <button 
                                    onClick={() => setActiveEmbed('none')}
                                    className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                                >
                                    <span className="material-symbols-outlined">arrow_back</span>
                                    Back to Addon Streams
                                </button>

                                {media.type === 'tv' && (
                                    <div className="flex items-center gap-4 bg-zinc-900/80 p-2 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Season</span>
                                            <select 
                                                value={embedSeason}
                                                onChange={(e) => setEmbedSeason(Number(e.target.value))}
                                                className="bg-black border border-white/10 text-white text-sm rounded-lg focus:ring-white/20 focus:border-white/30 block p-2 outline-none"
                                            >
                                                {Array.from({ length: numberOfSeasons || 10 }, (_, i) => i + 1).map(num => (
                                                    <option key={num} value={num}>{num}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Episode</span>
                                            <input 
                                                type="number" 
                                                min="1"
                                                value={embedEpisode}
                                                onChange={(e) => setEmbedEpisode(Number(e.target.value))}
                                                className="bg-black border border-white/10 text-white text-sm rounded-lg focus:ring-white/20 focus:border-white/30 block p-2 w-16 outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {activeEmbed === 'warezcdn' && (
                                <WarezCDNEmbed 
                                    id={(media.type === 'movie' && resolvedImdbId) ? resolvedImdbId : media.id} 
                                    type={media.type as 'movie' | 'tv'} 
                                    options={{ color: '2DD4BF' }} 
                                />
                            )}

                            {activeEmbed === 'embedmovies' && (
                                <EmbedMovies 
                                    id={(media.type === 'movie' && resolvedImdbId) ? resolvedImdbId : media.id} 
                                />
                            )}

                            {activeEmbed === 'megaembed' && (
                                <MegaEmbed 
                                    id={(media.type === 'movie' && resolvedImdbId) ? resolvedImdbId : media.id} 
                                />
                            )}

                            {activeEmbed === 'superflix' && (
                                <SuperflixEmbed
                                    id={(media.type === 'movie' && resolvedImdbId) ? resolvedImdbId : media.id}
                                    type={media.type as 'movie' | 'tv'}
                                />
                            )}

                            {activeEmbed === 'embedplay' && (
                                <EmbedPlay
                                    id={(media.type === 'movie' && resolvedImdbId) ? resolvedImdbId : media.id}
                                    type={media.type as 'movie' | 'tv'}
                                    season={embedSeason}
                                    episode={embedEpisode}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Server selection cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <button 
                                    onClick={() => setActiveEmbed('embedmovies')}
                                    className="p-5 bg-zinc-900/50 border border-white/5 rounded-2xl text-left hover:border-white/20 hover:bg-zinc-800/50 transition-all group"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-emerald-400 text-sm">play_circle</span>
                                        </div>
                                        <h4 className="font-bold text-white">Server 1</h4>
                                        <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Recommended</span>
                                    </div>
                                    <p className="text-xs text-zinc-500">EmbedMovies — Fast and clean</p>
                                </button>

                                <button 
                                    onClick={() => setActiveEmbed('megaembed')}
                                    className="p-5 bg-zinc-900/50 border border-white/5 rounded-2xl text-left hover:border-white/20 hover:bg-zinc-800/50 transition-all group"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="size-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-violet-400 text-sm">smart_display</span>
                                        </div>
                                        <h4 className="font-bold text-white">Server 2</h4>
                                    </div>
                                    <p className="text-xs text-zinc-500">MegaEmbed — Multi-source</p>
                                </button>

                                <button 
                                    onClick={() => setActiveEmbed('superflix')}
                                    className="p-5 bg-zinc-900/50 border border-white/5 rounded-2xl text-left hover:border-white/20 hover:bg-zinc-800/50 transition-all group"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="size-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-rose-400 text-sm">movie</span>
                                        </div>
                                        <h4 className="font-bold text-white">Server 3</h4>
                                    </div>
                                    <p className="text-xs text-zinc-500">Superflix — High quality</p>
                                </button>

                                <button 
                                    onClick={() => setActiveEmbed('warezcdn')}
                                    className="p-5 bg-zinc-900/50 border border-white/5 rounded-2xl text-left hover:border-white/20 hover:bg-zinc-800/50 transition-all group"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="size-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-blue-400 text-sm">public</span>
                                        </div>
                                        <h4 className="font-bold text-white">Server 4</h4>
                                    </div>
                                    <p className="text-xs text-zinc-500">WarezCDN — Alternative</p>
                                </button>

                                <button 
                                    onClick={() => setActiveEmbed('embedplay')}
                                    className="p-5 bg-zinc-900/50 border border-white/5 rounded-2xl text-left hover:border-white/20 hover:bg-zinc-800/50 transition-all group"
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="size-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-orange-400 text-sm">play_arrow</span>
                                        </div>
                                        <h4 className="font-bold text-white">Server 5</h4>
                                    </div>
                                    <p className="text-xs text-zinc-500">EmbedPlay — Reliable</p>
                                </button>
                            </div>

                            <div className="w-full flex items-center gap-4">
                                <div className="h-px bg-white/10 flex-1"></div>
                                <span className="text-xs font-mono text-zinc-600 uppercase tracking-widest">Or use Addons</span>
                                <div className="h-px bg-white/10 flex-1"></div>
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

                    {/* Ad Banner inside Sidebar */}
                    <div className="mt-12 rounded-2xl border border-white/5 bg-[#0F0F0F] p-4 relative overflow-hidden group min-h-[400px]">
                        <span className="absolute top-4 left-4 text-[9px] font-black uppercase tracking-widest text-zinc-500 bg-black/50 px-2 py-0.5 rounded border border-white/5 z-10">
                            Sponsored
                        </span>
                        <VerticalAdBanner className="w-full h-full pt-8 scale-[0.9] opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
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
