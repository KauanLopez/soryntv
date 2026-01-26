import React, { useState, useEffect, useRef } from 'react';
import { tmdb, getImageUrl, TMDBMovieDetails, TMDBCastMember, TMDBResult } from '@/lib/tmdb';
import { WatchSection } from '@/components/watch/WatchSection';
import type { SelectedMedia } from '@/types';

interface MovieDetailPageProps {
    media: SelectedMedia;
    onClose: () => void;
    onSelectMedia: (media: SelectedMedia) => void;
}

// Helper to format runtime
const formatRuntime = (minutes?: number | null): string => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
};

// Helper to format currency
const formatCurrency = (amount?: number): string => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

export const MovieDetailPage: React.FC<MovieDetailPageProps> = ({ media, onClose, onSelectMedia }) => {
    const [details, setDetails] = useState<TMDBMovieDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const backButtonRef = useRef<HTMLButtonElement>(null);
    const castScrollRef = useRef<HTMLDivElement>(null);
    const similarScrollRef = useRef<HTMLDivElement>(null);

    // Scroll function for carousels
    const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
        if (ref.current) {
            const scrollAmount = direction === 'left' ? -400 : 400;
            ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const loadDetails = async () => {
            setLoading(true);
            const data = await tmdb.getDetails(media.id, media.type);
            setDetails(data);
            setLoading(false);
        };
        loadDetails();
    }, [media.id, media.type]);

    // Focus back button on mount for controller navigation
    useEffect(() => {
        if (!loading && backButtonRef.current) {
            backButtonRef.current.focus();
        }
    }, [loading]);

    // Handle keyboard escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (loading) {
        return (
            <div className="fixed inset-0 z-[100] bg-page">
                <div className="w-full h-screen flex items-center justify-center">
                    <span className="size-12 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                </div>
            </div>
        );
    }

    if (!details) {
        return (
            <div className="fixed inset-0 z-[100] bg-page flex items-center justify-center">
                <div className="text-center space-y-4">
                    <span className="material-symbols-outlined text-6xl text-zinc-600">error</span>
                    <p className="text-zinc-400 text-lg">Failed to load content</p>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const title = details.title || details.name || 'Unknown';
    const year = details.release_date?.split('-')[0] || details.first_air_date?.split('-')[0] || '';
    const runtime = formatRuntime(details.runtime || details.episode_run_time?.[0]);
    const rating = details.vote_average ? Math.round(details.vote_average * 10) : 0;
    const director = details.credits?.crew?.find(c => c.job === 'Director');
    const topCast = details.credits?.cast?.slice(0, 8) || [];
    const similarItems = details.similar?.results?.slice(0, 10) || [];
    const trailer = details.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');

    const handleSimilarClick = (item: TMDBResult) => {
        onSelectMedia({ id: item.id, type: item.media_type || media.type });
    };

    return (
        <div className="fixed inset-0 z-[100] bg-page overflow-y-auto">
            {/* Hero Section */}
            <div className="relative w-full min-h-[55vh] md:min-h-[65vh]">
                {/* Backdrop Image */}
                <div className="absolute inset-0">
                    <img
                        src={getImageUrl(details.backdrop_path, 'original')}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-page via-page/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-page/90 via-page/40 to-transparent" />
                </div>

                {/* Back Button */}
                <button
                    ref={backButtonRef}
                    onClick={onClose}
                    className="absolute top-6 left-6 md:top-10 md:left-10 z-20 size-12 md:size-14 glass rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                    <span className="material-symbols-outlined text-xl md:text-2xl">arrow_back</span>
                </button>

                {/* Content */}
                <div className="relative z-10 min-h-[70vh] md:min-h-[80vh] flex items-end">
                    <div className="w-full px-6 md:px-12 lg:px-24 pb-12 md:pb-16">
                        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
                            {/* Poster */}
                            <div className="hidden md:block w-64 lg:w-72 shrink-0">
                                <img
                                    src={getImageUrl(details.poster_path)}
                                    alt={title}
                                    className="w-full rounded-2xl border border-white/10 shadow-2xl"
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1 space-y-6">
                                {/* Badges */}
                                <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                    {year && <span className="px-3 py-1.5 border border-zinc-700 rounded-full">{year}</span>}
                                    {runtime && <span className="px-3 py-1.5 border border-zinc-700 rounded-full">{runtime}</span>}
                                    {details.number_of_seasons && (
                                        <span className="px-3 py-1.5 border border-zinc-700 rounded-full">
                                            {details.number_of_seasons} Season{details.number_of_seasons > 1 ? 's' : ''}
                                        </span>
                                    )}
                                    <span className={`px-3 py-1.5 rounded-full ${rating >= 70 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : rating >= 50 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                                        {rating}% Match
                                    </span>
                                </div>

                                {/* Title */}
                                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white leading-[0.95] uppercase">
                                    {title}
                                </h1>

                                {/* Tagline */}
                                {details.tagline && (
                                    <p className="text-lg md:text-xl text-zinc-400 italic font-medium">"{details.tagline}"</p>
                                )}

                                {/* Genres */}
                                <div className="flex flex-wrap gap-2">
                                    {details.genres?.map(genre => (
                                        <span
                                            key={genre.id}
                                            className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 rounded-full text-zinc-300"
                                        >
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>

                                {/* Overview */}
                                <p className="text-zinc-400 text-base md:text-lg leading-relaxed max-w-3xl">
                                    {details.overview}
                                </p>

                                {/* Actions */}
                                <div className="flex flex-wrap gap-4 pt-4">
                                    {/* Removed Watch Now Button */}
                                    {trailer && (
                                        <a
                                            href={`https://www.youtube.com/watch?v=${trailer.key}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 h-14 md:h-16 px-8 md:px-12 rounded-full glass text-white font-black uppercase tracking-widest hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                                        >
                                            <span className="material-symbols-outlined text-xl md:text-2xl">play_circle</span>
                                            Trailer
                                        </a>
                                    )}
                                    <button className="size-14 md:size-16 rounded-full glass flex items-center justify-center text-white hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-white/50">
                                        <span className="material-symbols-outlined text-xl md:text-2xl">add</span>
                                    </button>
                                    <button className="size-14 md:size-16 rounded-full glass flex items-center justify-center text-white hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-white/50">
                                        <span className="material-symbols-outlined text-xl md:text-2xl">share</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Consumption Interface (Watch Section) */}
            <WatchSection
                media={media}
                title={title}
                numberOfSeasons={details.number_of_seasons}
            />

            {/* Details Section */}
            <div className="w-full px-6 md:px-12 lg:px-24 py-8 md:py-10 space-y-10">

                {/* Info Grid - NOW AFTER EPISODES */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Director / Creator */}
                    {director && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-600">Director</h4>
                            <p className="text-white font-bold text-lg">{director.name}</p>
                        </div>
                    )}

                    {/* Status */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-600">Status</h4>
                        <p className="text-white font-bold text-lg">{details.status}</p>
                    </div>

                    {/* Languages */}
                    {details.spoken_languages?.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-600">Languages</h4>
                            <p className="text-white font-bold text-lg">
                                {details.spoken_languages.map(l => l.english_name).join(', ')}
                            </p>
                        </div>
                    )}

                    {/* Budget (Movies only) */}
                    {details.budget !== undefined && details.budget > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-600">Budget</h4>
                            <p className="text-white font-bold text-lg">{formatCurrency(details.budget)}</p>
                        </div>
                    )}

                    {/* Revenue (Movies only) */}
                    {details.revenue !== undefined && details.revenue > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-600">Revenue</h4>
                            <p className="text-white font-bold text-lg">{formatCurrency(details.revenue)}</p>
                        </div>
                    )}

                    {/* Production Companies */}
                    {details.production_companies?.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-600">Production</h4>
                            <p className="text-white font-bold text-lg">
                                {details.production_companies.slice(0, 2).map(c => c.name).join(', ')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Cast Section */}
                {topCast.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-end justify-between">
                            <h3 className="text-2xl font-black uppercase tracking-tight text-white">Cast</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => scroll(castScrollRef, 'left')}
                                    className="size-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:border-white hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                                >
                                    <span className="material-symbols-outlined">arrow_back</span>
                                </button>
                                <button
                                    onClick={() => scroll(castScrollRef, 'right')}
                                    className="size-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:border-white hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                                >
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                        <div
                            ref={castScrollRef}
                            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {topCast.map((actor: TMDBCastMember) => (
                                <div
                                    key={actor.id}
                                    className="w-20 md:w-24 group shrink-0"
                                >
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-zinc-900 border border-white/10 mb-2">
                                        <img
                                            src={getImageUrl(actor.profile_path)}
                                            alt={actor.name}
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                                        />
                                    </div>
                                    <p className="text-white font-bold text-sm truncate">{actor.name}</p>
                                    <p className="text-zinc-500 text-xs truncate">{actor.character}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Similar Titles Section */}
                {similarItems.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-end justify-between">
                            <h3 className="text-2xl font-black uppercase tracking-tight text-white">Similar Titles</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => scroll(similarScrollRef, 'left')}
                                    className="size-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:border-white hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                                >
                                    <span className="material-symbols-outlined">arrow_back</span>
                                </button>
                                <button
                                    onClick={() => scroll(similarScrollRef, 'right')}
                                    className="size-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:border-white hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                                >
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                        <div
                            ref={similarScrollRef}
                            className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {similarItems.map((item: TMDBResult) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSimilarClick(item)}
                                    className="min-w-[180px] md:min-w-[200px] h-[270px] md:h-[300px] relative group cursor-pointer rounded-2xl overflow-hidden border border-white/5 bg-zinc-900 shrink-0 text-left focus:outline-none focus:ring-2 focus:ring-white/50 focus:scale-[1.02] transition-all"
                                >
                                    <img
                                        src={getImageUrl(item.poster_path)}
                                        alt={item.title || item.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-focus:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                                    <div className="absolute bottom-0 left-0 p-4 w-full space-y-1">
                                        <span className="text-[10px] font-black bg-white text-black px-2 py-0.5 rounded uppercase tracking-widest inline-block mb-1">
                                            {item.vote_average ? `${Math.round(item.vote_average * 10)}%` : 'New'}
                                        </span>
                                        <h4 className="text-base font-black leading-tight tracking-tight text-white line-clamp-2">
                                            {item.title || item.name}
                                        </h4>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom spacing */}
            <div className="h-24"></div>
        </div>
    );
};
