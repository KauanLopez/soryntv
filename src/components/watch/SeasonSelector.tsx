
import React, { useState, useEffect, useRef } from 'react';
import { tmdb, TMDBSeasonDetails, TMDBEpisode, getImageUrl, getStremioID } from '@/lib/tmdb';
import { AddonManager } from '@/lib/stremio';
import { StreamList } from './StreamList';
import type { Stream } from '@/lib/stremio';

interface SeasonSelectorProps {
    seriesId: number;
    numberOfSeasons: number;
    addonManager: AddonManager;
    onStreamSelect: (stream: Stream) => void;
}

export const SeasonSelector: React.FC<SeasonSelectorProps> = ({ seriesId, numberOfSeasons, addonManager, onStreamSelect }) => {
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [seasonData, setSeasonData] = useState<TMDBSeasonDetails | null>(null);
    const [loadingSeason, setLoadingSeason] = useState(false);

    // Track expanded episode to show streams
    const [expandedEpisodeId, setExpandedEpisodeId] = useState<number | null>(null);
    const [streams, setStreams] = useState<Record<number, Stream[]>>({});
    const [loadingStreams, setLoadingStreams] = useState<Record<number, boolean>>({});

    const scrollRef = useRef<HTMLDivElement>(null);

    // Load Season Data
    useEffect(() => {
        const loadSeason = async () => {
            setLoadingSeason(true);
            const data = await tmdb.getSeasonDetails(seriesId, selectedSeason);
            setSeasonData(data);
            setExpandedEpisodeId(null); // Reset expansion on season change
            setLoadingSeason(false);
        };
        loadSeason();
    }, [seriesId, selectedSeason]);

    const handleSeasonSelect = (num: number) => {
        setSelectedSeason(num);
    };

    const handleExpandEpisode = async (episode: TMDBEpisode) => {
        // Toggle if already open
        if (expandedEpisodeId === episode.id) {
            setExpandedEpisodeId(null);
            return;
        }

        setExpandedEpisodeId(episode.id);

        // Fetch streams if not already cached in local state
        if (!streams[episode.id]) {
            setLoadingStreams(prev => ({ ...prev, [episode.id]: true }));
            try {
                // Convert to IMDB ID
                const imdbId = await getStremioID(seriesId, 'tv');
                const streamId = `${imdbId}:${episode.season_number}:${episode.episode_number}`;

                const results = await addonManager.getAllStreams('series', streamId);
                setStreams(prev => ({ ...prev, [episode.id]: results }));
            } catch (err) {
                console.error('Failed to load episode streams:', err);
            } finally {
                setLoadingStreams(prev => ({ ...prev, [episode.id]: false }));
            }
        }
    };

    return (
        <div className="space-y-8">
            {/* Season Tabs */}
            <div className="flex bg-zinc-900/50 p-1 rounded-full w-max max-w-full overflow-x-auto border border-white/5 scrollbar-hide">
                {Array.from({ length: numberOfSeasons }, (_, i) => i + 1).map((num) => (
                    <button
                        key={num}
                        onClick={() => handleSeasonSelect(num)}
                        className={`px-6 py-3 rounded-full text-sm font-black uppercase tracking-wider whitespace-nowrap transition-all ${selectedSeason === num
                            ? 'bg-white text-black shadow-lg scale-105'
                            : 'text-zinc-500 hover:text-white'
                            }`}
                    >
                        Season {num}
                    </button>
                ))}
            </div>

            {/* Episodes List */}
            {loadingSeason ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-zinc-900 rounded-2xl animate-pulse"></div>)}
                </div>
            ) : (
                <div className="space-y-4">
                    {seasonData?.episodes.map((episode) => {
                        const isExpanded = expandedEpisodeId === episode.id;

                        return (
                            <div
                                key={episode.id}
                                className={`bg-[#121212] overflow-hidden border transition-all duration-500 ease-in-out ${isExpanded ? 'border-white/20 rounded-[2rem] bg-zinc-900/30' : 'border-white/5 rounded-2xl hover:bg-zinc-900'
                                    }`}
                            >
                                {/* Episode Header / Clickable Area */}
                                <div
                                    className="p-4 flex gap-4 md:gap-6 cursor-pointer"
                                    onClick={() => handleExpandEpisode(episode)}
                                >
                                    {/* Thumbnail */}
                                    <div className="w-32 md:w-48 aspect-video rounded-xl overflow-hidden shrink-0 relative">
                                        <img
                                            src={getImageUrl(episode.still_path)}
                                            alt={episode.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <span className="material-symbols-outlined text-white">play_arrow</span>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 py-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-[10px] font-black text-accentTeal bg-accentTeal/10 px-2 py-0.5 rounded uppercase tracking-widest">
                                                EP {episode.episode_number}
                                            </span>
                                            <span className="text-[10px] font-mono text-zinc-500">
                                                {episode.air_date?.split('-')[0]}
                                            </span>
                                        </div>
                                        <h4 className={`text-base md:text-lg font-bold mb-2 transition-colors ${isExpanded ? 'text-white' : 'text-zinc-200'}`}>
                                            {episode.name}
                                        </h4>
                                        <p className="text-sm text-zinc-500 line-clamp-2 md:line-clamp-1">{episode.overview}</p>
                                    </div>

                                    {/* Arrow Icon */}
                                    <div className="flex items-center pr-2">
                                        <span className={`material-symbols-outlined text-zinc-600 transition-transform ${isExpanded ? 'rotate-180 text-white' : ''}`}>
                                            keyboard_arrow_down
                                        </span>
                                    </div>
                                </div>

                                {/* Expanded Content: Streams */}
                                {isExpanded && (
                                    <div className="px-4 pb-6 md:px-6 animate-in slide-in-from-top-4 fade-in duration-300">
                                        <div className="w-full h-px bg-white/5 mb-6"></div>
                                        <StreamList
                                            streams={streams[episode.id] || []}
                                            loading={loadingStreams[episode.id]}
                                            onSelect={onStreamSelect}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
