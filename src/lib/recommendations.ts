import { supabase } from '@/lib/supabase';
import { tmdb, TMDBResult, TMDBGenre } from '@/lib/tmdb';

// Map genre names to IDs (fetched dynamically to be safe, or cache them)
let GENRE_MAP: Record<string, number> = {};

const ensureGenreMap = async () => {
    if (Object.keys(GENRE_MAP).length > 0) return;

    // Fetch both and merge
    const movieGenres = await tmdb.getGenres('movie');
    const tvGenres = await tmdb.getGenres('tv');

    [...movieGenres, ...tvGenres].forEach(g => {
        GENRE_MAP[g.name] = g.id;
    });
};

export const recommendationsService = {
    // 1. Get User Preferred Genres from Supabase
    getUserGenres: async (userId: string): Promise<string[]> => {
        const { data } = await supabase
            .from('user_genres')
            .select('genre')
            .eq('user_id', userId)
            .eq('media_type', 'movie'); // Focus on movies for Hero for now

        return data?.map(d => d.genre) || [];
    },

    // 2. Get Recommendations based on genres
    getHeroRecommendations: async (userId: string): Promise<TMDBResult[]> => {
        // Get user genres
        const userGenres = await recommendationsService.getUserGenres(userId);

        // If no genres (e.g. skipped/error), return popular
        if (userGenres.length === 0) {
            const popular = await tmdb.getPopular('movie');
            return popular.slice(0, 3);
        }

        await ensureGenreMap();

        // Convert genre names to IDs
        const genreIds = userGenres
            .map(name => GENRE_MAP[name])
            .filter(id => id !== undefined);

        if (genreIds.length === 0) {
            const popular = await tmdb.getPopular('movie');
            return popular.slice(0, 3);
        }

        // Call discover
        // Simple logic: Join IDs with OR (|) to get broader results
        const genreQuery = genreIds.join('|');

        // Custom Fetch to discover
        // We use the tmdb client structure but need a custom endpoint here potentially
        // Or adding a discover method to tmdb.ts. 
        // For simplicity let's do a direct fetch here or extend tmdb client.
        // Let's extend this logically:

        try {
            const searchParams = new URLSearchParams({
                api_key: import.meta.env.VITE_TMDB_API_KEY, // Use Key or Token via Header
                with_genres: genreQuery,
                sort_by: 'popularity.desc',
                page: '1',
                language: 'en-US'
            });

            // Using Read Token via Headers ideally
            const response = await fetch(`https://api.themoviedb.org/3/discover/movie?${searchParams.toString()}`, {
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${import.meta.env.VITE_TMDB_READ_TOKEN}`
                }
            });

            const data = await response.json();
            // Return top 3
            return (data.results || []).slice(0, 3);
        } catch (e) {
            console.error('Recs Error:', e);
            return [];
        }
    },

    getTrending: async (type: 'movie' | 'tv' | 'all' = 'all') => {
        const [movies, tv] = await Promise.all([
            tmdb.getTrending('movie', 'day'),
            tmdb.getTrending('tv', 'day')
        ]);

        return {
            movies: movies.slice(0, 10),
            tv: tv.slice(0, 10)
        };
    },

    // NEW: Get content for Movies or Series pages
    getPageContent: async (type: 'movie' | 'series', userId: string) => {
        const mediaType = type === 'movie' ? 'movie' : 'tv';

        // Get user preferred genres for this media type
        const { data: userGenresData } = await supabase
            .from('user_genres')
            .select('genre')
            .eq('user_id', userId)
            .eq('media_type', type);

        const userGenres = userGenresData?.map(d => d.genre) || [];

        // Ensure genre map is populated
        await ensureGenreMap();

        // Convert genre names to IDs
        const genreIds = userGenres
            .map(name => GENRE_MAP[name])
            .filter(id => id !== undefined);

        // Fetch multiple sections in parallel
        const [forYou, trending, popular] = await Promise.all([
            // "For You" - Based on user genres
            (async () => {
                if (genreIds.length === 0) {
                    // If no genres, use popular
                    return tmdb.getPopular(mediaType);
                }
                try {
                    const genreQuery = genreIds.join('|');
                    const response = await fetch(
                        `https://api.themoviedb.org/3/discover/${mediaType}?with_genres=${genreQuery}&sort_by=popularity.desc&page=1&language=en-US`,
                        {
                            headers: {
                                accept: 'application/json',
                                Authorization: `Bearer ${import.meta.env.VITE_TMDB_READ_TOKEN}`
                            }
                        }
                    );
                    const data = await response.json();
                    return data.results || [];
                } catch {
                    return tmdb.getPopular(mediaType);
                }
            })(),
            // Trending
            tmdb.getTrending(mediaType, 'day'),
            // Popular
            tmdb.getPopular(mediaType)
        ]);

        return {
            forYou: forYou.slice(0, 20),
            trending: trending.slice(0, 20),
            popular: popular.slice(0, 20)
        };
    }
};
