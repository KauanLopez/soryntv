import React, { useState, useEffect } from 'react';
import type { SelectedMedia } from '@/types';
import { SectionRow } from '@/components/ui/SectionRow';
import { CategoryRow } from '@/components/ui/CategoryRow';
import { recommendationsService } from '@/lib/recommendations';
import { TMDBResult, getImageUrl, tmdb } from '@/lib/tmdb';
import { supabase } from '@/lib/supabase';

interface MediaPageProps {
    type: 'movies' | 'series' | 'music';
    onSelectMedia: (media: SelectedMedia) => void;
}

// Convert TMDB result to internal media item format for display
// defaultType is used when item.media_type is not set (e.g., from discover/popular endpoints)
const toMediaItem = (item: TMDBResult, defaultType: 'movie' | 'tv') => ({
    id: String(item.id),
    title: item.title || item.name || '',
    image: getImageUrl(item.poster_path),
    subtitle: item.overview?.slice(0, 100) || '',
    tag: item.vote_average ? `${Math.round(item.vote_average * 10)}%` : 'New',
    type: (item.media_type === 'tv' || item.media_type === 'movie') ? item.media_type : defaultType
});

export const MediaPage: React.FC<MediaPageProps> = ({ type, onSelectMedia }) => {
    const [forYou, setForYou] = useState<TMDBResult[]>([]);
    const [trending, setTrending] = useState<TMDBResult[]>([]);
    const [popular, setPopular] = useState<TMDBResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [genres, setGenres] = useState<string[]>([]);

    useEffect(() => {
        const loadContent = async () => {
            setLoading(true);

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            if (type === 'music') {
                // Music: Keep mock data for now since TMDB doesn't support music
                setGenres(['Pop', 'R&B', 'Hip Hop', 'Electronic', 'Jazz', 'Rock', 'Indie', 'Classical']);
                setLoading(false);
                return;
            }

            // Fetch page content from recommendation service
            const mediaType = type === 'movies' ? 'movie' : 'series';
            const content = await recommendationsService.getPageContent(mediaType, user.id);

            setForYou(content.forYou);
            setTrending(content.trending);
            setPopular(content.popular);

            // Get genres for Category Row
            const genreList = await tmdb.getGenres(mediaType === 'movie' ? 'movie' : 'tv');
            setGenres(genreList.slice(0, 10).map(g => g.name));

            setLoading(false);
        };

        loadContent();
    }, [type]);

    const getTitle = () => {
        if (type === 'music') return 'Music';
        if (type === 'series') return 'Series';
        return 'Movies';
    };

    if (loading) {
        return (
            <div className="pt-32 pb-12 space-y-12 w-full overflow-hidden">
                <div className="px-6 md:px-12 mb-8">
                    <h2 className="text-6xl font-black uppercase tracking-tighter mb-4 text-white">
                        {getTitle()}
                    </h2>
                </div>
                {/* Loading Skeleton */}
                <div className="px-6 md:px-12 space-y-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="space-y-4">
                            <div className="h-6 w-48 bg-zinc-800 rounded animate-pulse"></div>
                            <div className="flex gap-4 overflow-hidden">
                                {[1, 2, 3, 4, 5].map(j => (
                                    <div key={j} className="w-48 h-72 bg-zinc-800 rounded-2xl animate-pulse shrink-0"></div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Music fallback (static data)
    if (type === 'music') {
        return (
            <div className="pt-32 pb-12 space-y-12 w-full overflow-hidden">
                <div className="px-6 md:px-12 mb-8">
                    <h2 className="text-6xl font-black uppercase tracking-tighter mb-4 text-white">Music</h2>
                    <p className="text-zinc-500">Music integration coming soon. Currently showing placeholder content.</p>
                </div>
                <CategoryRow title="Genres" categories={genres} />
            </div>
        );
    }

    // Movies / Series with TMDB data
    // Determine the correct TMDB media type for this page
    const tmdbMediaType: 'movie' | 'tv' = type === 'movies' ? 'movie' : 'tv';

    return (
        <div className="pt-32 pb-12 space-y-12 w-full overflow-hidden">
            <div className="px-6 md:px-12 mb-8">
                <h2 className="text-6xl font-black uppercase tracking-tighter mb-4 text-white">
                    {getTitle()}
                </h2>
            </div>

            <SectionRow
                title="Pensados para você"
                items={forYou.map(item => toMediaItem(item, tmdbMediaType))}
                onSelectMedia={onSelectMedia}
            />

            <SectionRow
                title="Em alta hoje"
                items={trending.map(item => toMediaItem(item, tmdbMediaType))}
                onSelectMedia={onSelectMedia}
            />

            <SectionRow
                title="Populares"
                items={popular.map(item => toMediaItem(item, tmdbMediaType))}
                onSelectMedia={onSelectMedia}
            />

            <CategoryRow
                title="Categorias"
                categories={genres}
            />
        </div>
    );
};

