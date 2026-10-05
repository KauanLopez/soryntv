import React from 'react';
import type { SelectedMedia } from '@/types';
import { TMDBResult, getImageUrl } from '@/lib/tmdb';
import { VerticalAdBanner } from '@/components/ads/VerticalAdBanner';

interface DiscoverMoreProps {
    onSelectMedia: (media: SelectedMedia) => void;
    trending?: { movies: TMDBResult[], tv: TMDBResult[] } | null;
}

export const DiscoverMore: React.FC<DiscoverMoreProps> = ({ onSelectMedia, trending }) => {
    // If no data yet, simple fallback or skeleton. For now, empty array check handling.
    const movies = trending?.movies || [];
    const shows = trending?.tv || [];

    // Grid assignments (Mix of trending)
    // 0: Main Feature (Movie #1)
    // 1: Sonic Vibe (Show #1 context or music placeholder if preferred, let's use Show #1)
    // 2: Live Card (Movie #2)
    // 3: Small List (Show #2)

    const item1 = movies[0]; // Hero - Movie
    const item2 = shows[0];  // TV Show
    const item3 = movies[1]; // Movie
    const item4 = shows[1];  // TV Show

    // Helper that uses explicit type parameter instead of relying on item.media_type
    const handleSelectMedia = (item: TMDBResult | undefined, explicitType: 'movie' | 'tv') => {
        if (item) {
            onSelectMedia({
                id: item.id,
                type: explicitType
            });
        }
    };

    if (!item1) return null; // Loading state or empty

    return (
        <section className="py-24 px-6 md:px-12 max-w-[1440px] mx-auto">
            <div className="flex items-end justify-between mb-12 border-b border-zinc-900 pb-8">
                <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase">Discover More</h2>
                <div className="flex gap-4">
                    <button className="size-14 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:border-white hover:text-white transition-all">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <button className="size-14 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:border-white hover:text-white transition-all">
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Main Featured Bento (Trending Movie #1) */}
                <button
                    type="button"
                    className="col-span-12 md:col-span-6 h-[500px] relative group overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-900 text-left focus:outline-none focus:border-white transition-all duration-300"
                    onClick={() => handleSelectMedia(item1, 'movie')}
                >
                    <img src={getImageUrl(item1.backdrop_path, 'original')} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                    <div className="absolute top-8 left-8">
                        <span className="bg-white text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">Trending #1</span>
                    </div>
                    <div className="absolute bottom-10 left-10 space-y-4 max-w-md">
                        <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight">{item1.title}</h3>
                        <p className="text-zinc-400 font-medium line-clamp-2">{item1.overview}</p>
                        <div className="flex items-center gap-4">
                            <div className="size-14 bg-white rounded-full flex items-center justify-center text-black">
                                <span className="material-symbols-outlined text-3xl fill-current">play_arrow</span>
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Watch Details</span>
                        </div>
                    </div>
                </button>

                {/* Secondary Bento (Trending Show #1) */}
                <div className="col-span-12 md:col-span-3 h-[500px] bg-[#0F0F0F] rounded-[2.5rem] border border-white/5 p-8 flex flex-col justify-between group overflow-hidden relative">
                    {/* Use backdrop as ambient background */}
                    <img src={getImageUrl(item2?.poster_path)} className="absolute inset-0 w-full h-full object-cover opacity-20 hover:opacity-10 transition-opacity" />

                    <div className="relative z-10 flex justify-between items-start">
                        <span className="flex items-center gap-2 text-accentTeal font-black text-[10px] uppercase tracking-widest border border-accentTeal/20 px-3 py-1 rounded-full bg-black/50">
                            <span className="material-symbols-outlined text-sm">trending_up</span> TV SHOW
                        </span>
                    </div>

                    <div className="relative z-10 flex flex-col items-center gap-6">
                        <div className="size-48 rounded-2xl border-2 border-zinc-800 p-1 bg-black rotate-3 group-hover:rotate-0 transition-transform">
                            <img src={getImageUrl(item2?.poster_path)} className="w-full h-full rounded-xl object-cover" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-black tracking-tight mb-1 text-white line-clamp-2">{item2?.name}</h3>
                            <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em]">Top Series</p>
                        </div>
                    </div>

                    <button className="relative z-10 w-full h-12 bg-white/10 hover:bg-white text-white hover:text-black rounded-full text-xs font-black uppercase tracking-widest transition-all"
                        onClick={() => handleSelectMedia(item2, 'tv')}>
                        View Info
                    </button>
                </div>

                {/* Trending Movie #2 */}
                <div className="col-span-12 md:col-span-3 h-[500px] relative rounded-[2.5rem] overflow-hidden border border-white/5 group cursor-pointer" onClick={() => handleSelectMedia(item3, 'movie')}>
                    <img src={getImageUrl(item3?.poster_path)} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                    <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
                        <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-2">
                            HOT
                        </span>
                        <span className="text-zinc-300 font-mono text-[10px] border border-zinc-800 bg-black/50 px-2 py-0.5 rounded backdrop-blur">
                            {item3?.vote_average?.toFixed(1)}
                        </span>
                    </div>
                    <div className="absolute bottom-10 left-8 right-8">
                        <p className="text-accentTeal font-black text-[10px] uppercase tracking-widest mb-2">Movie</p>
                        <h3 className="text-2xl font-black tracking-tight leading-tight mb-2 text-white line-clamp-2 cursor-pointer hover:underline">{item3?.title}</h3>
                        <p className="text-zinc-500 font-mono text-[10px] line-clamp-2">{item3?.overview}</p>
                    </div>
                </div>

                {/* Trending Show #2 (Small List Style) */}
                <button
                    type="button"
                    className="col-span-12 md:col-span-6 h-[300px] bg-[#0F0F0F] rounded-[2.5rem] border border-white/5 p-8 flex items-center gap-8 hover:bg-zinc-900 focus:bg-zinc-900 focus:scale-[1.02] focus:border-white transition-all text-left group"
                    onClick={() => handleSelectMedia(item4, 'tv')}
                >
                    <div className="w-1/2 h-full rounded-2xl overflow-hidden border border-white/5">
                        <img src={getImageUrl(item4?.backdrop_path)} className="w-full h-full object-cover transition-all" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="bg-accentPurple/20 text-accentPurple text-[10px] font-black px-2 py-0.5 rounded border border-accentPurple/30">TV Series</span>
                            <span className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest">{item4?.first_air_date?.split('-')[0]}</span>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white line-clamp-2">{item4?.name}</h3>
                        <p className="text-zinc-500 font-medium line-clamp-2">{item4?.overview}</p>
                        <span className="text-[10px] font-black uppercase tracking-widest border-b border-zinc-700 pb-1 text-zinc-500 group-hover:text-white group-focus:text-white transition-colors">Details</span>
                    </div>
                </button>

                {/* My List Bento (Static) */}
                <button
                    type="button"
                    className="col-span-12 md:col-span-3 h-[300px] bg-zinc-900 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center gap-4 hover:bg-zinc-800 focus:bg-zinc-800 focus:border-white focus:scale-[1.02] transition-all group"
                >
                    <div className="size-20 rounded-full bg-accentPink/10 border border-accentPink/20 flex items-center justify-center text-accentPink group-hover:scale-110 group-focus:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-4xl fill-current">local_activity</span>
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-black uppercase tracking-tight text-white">My List</h3>
                        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest">Saved Titles</p>
                    </div>
                </button>

                {/* Ad Banner (Sponsored) */}
                <div className="col-span-12 md:col-span-3 h-[300px] bg-[#0F0F0F] rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center p-4 relative overflow-hidden group">
                    <span className="absolute top-4 left-4 text-[9px] font-black uppercase tracking-widest text-zinc-500 bg-black/50 px-2 py-0.5 rounded border border-white/5 z-10">
                        Sponsored
                    </span>
                    <VerticalAdBanner className="w-full h-full scale-[0.85] opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
            </div>
        </section>
    );
};

