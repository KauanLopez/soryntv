/// <reference types="vite/client" />
const TMDB_API_URL = 'https://api.themoviedb.org/3';
const TMDB_READ_TOKEN = import.meta.env.VITE_TMDB_READ_TOKEN;

if (!TMDB_READ_TOKEN) {
    console.error('Missing TMDB Read Token');
}

export const MOVIE_GENRES: Record<number, string> = {};
export const SERIES_GENRES: Record<number, string> = {};

// Headers for API requests
const headers = {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_READ_TOKEN}`
};

// Types
export interface TMDBResult {
    id: number;
    title?: string;
    name?: string; // TV shows use 'name'
    poster_path: string | null;
    backdrop_path: string | null;
    media_type: 'movie' | 'tv' | 'person';
    genre_ids: number[];
    overview: string;
    vote_average: number;
    release_date?: string;
    first_air_date?: string;
}

export interface TMDBGenre {
    id: number;
    name: string;
}

// Detailed movie/TV types
export interface TMDBCastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
}

export interface TMDBCrewMember {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
}

export interface TMDBCredits {
    cast: TMDBCastMember[];
    crew: TMDBCrewMember[];
}

export interface TMDBProductionCompany {
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
}

export interface TMDBVideo {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
}

export interface TMDBMovieDetails {
    id: number;
    title?: string;
    name?: string;
    original_title?: string;
    original_name?: string;
    poster_path: string | null;
    backdrop_path: string | null;
    overview: string;
    vote_average: number;
    vote_count: number;
    runtime?: number; // movies
    episode_run_time?: number[]; // tv
    number_of_seasons?: number;
    number_of_episodes?: number;
    release_date?: string;
    first_air_date?: string;
    last_air_date?: string;
    genres: TMDBGenre[];
    tagline: string;
    status: string;
    budget?: number;
    revenue?: number;
    production_companies: TMDBProductionCompany[];
    spoken_languages: { english_name: string; iso_639_1: string; name: string }[];
    credits: TMDBCredits;
    similar: { results: TMDBResult[] };
    videos: { results: TMDBVideo[] };
}

// Helpers
export const getImageUrl = (path: string | null, size: 'w500' | 'original' = 'w500') => {
    if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
    return `https://image.tmdb.org/t/p/${size}${path}`;
};

// API Methods
export const tmdb = {
    getGenres: async (type: 'movie' | 'tv'): Promise<TMDBGenre[]> => {
        try {
            const response = await fetch(`${TMDB_API_URL}/genre/${type}/list?language=en-US`, { headers });
            const data = await response.json();
            return data.genres || [];
        } catch (error) {
            console.error(`Error fetching ${type} genres:`, error);
            return [];
        }
    },

    searchMulti: async (query: string): Promise<TMDBResult[]> => {
        if (!query) return [];
        try {
            const response = await fetch(
                `${TMDB_API_URL}/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
                { headers }
            );
            const data = await response.json();
            return (data.results || []).filter((item: TMDBResult) => item.media_type === 'movie' || item.media_type === 'tv');
        } catch (error) {
            console.error('Error searching TMDB:', error);
            return [];
        }
    },

    getTrending: async (type: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'week'): Promise<TMDBResult[]> => {
        try {
            const response = await fetch(`${TMDB_API_URL}/trending/${type}/${timeWindow}?language=en-US`, { headers });
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('Error fetching trending:', error);
            return [];
        }
    },

    // For Onboarding initial suggestions if search is empty
    getPopular: async (type: 'movie' | 'tv'): Promise<TMDBResult[]> => {
        try {
            const response = await fetch(`${TMDB_API_URL}/${type}/popular?language=en-US&page=1`, { headers });
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error(`Error fetching popular ${type}:`, error);
            return [];
        }
    },

    // Get detailed movie/TV info with credits, similar, and videos
    getDetails: async (id: number, type: 'movie' | 'tv'): Promise<TMDBMovieDetails | null> => {
        try {
            const response = await fetch(
                `${TMDB_API_URL}/${type}/${id}?language=en-US&append_to_response=credits,similar,videos`,
                { headers }
            );
            if (!response.ok) {
                console.error(`Error fetching ${type} details:`, response.status);
                return null;
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching ${type} details:`, error);
            return null;
        }
    },

    // Get season details with episodes for a TV show
    getSeasonDetails: async (seriesId: number, seasonNumber: number): Promise<TMDBSeasonDetails | null> => {
        try {
            const response = await fetch(
                `${TMDB_API_URL}/tv/${seriesId}/season/${seasonNumber}?language=en-US`,
                { headers }
            );
            if (!response.ok) {
                console.error(`Error fetching season ${seasonNumber}:`, response.status);
                return null;
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching season details:`, error);
            return null;
        }
    },
    // Get watch providers for movie/TV
    getWatchProviders: async (id: number, type: 'movie' | 'tv'): Promise<TMDBWatchProvidersResult | null> => {
        try {
            const response = await fetch(
                `${TMDB_API_URL}/${type}/${id}/watch/providers`,
                { headers }
            );
            if (!response.ok) return null;
            const data = await response.json();
            return data.results?.US || null; // Defaul to US for this demo, or allow argument
        } catch (error) {
            console.error('Error fetching watch providers:', error);
            return null;
        }
    },

    // Get external IDs (IMDB, etc.)
    getExternalIds: async (id: number, type: 'movie' | 'tv'): Promise<{ imdb_id?: string; tvdb_id?: number } | null> => {
        try {
            const response = await fetch(
                `${TMDB_API_URL}/${type}/${id}/external_ids?language=en-US`,
                { headers }
            );
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error('Error fetching external IDs:', error);
            return null;
        }
    }
};

/**
 * Converts a TMDB ID to an IMDB ID (Stremio format).
 * @param tmdbId The TMDB ID (number)
 * @param type 'movie' or 'tv' (series)
 * @returns The IMDB ID string (e.g., 'tt1234567')
 * @throws Error if IMDB ID is not found
 */
export const getStremioID = async (tmdbId: number, type: 'movie' | 'tv' | 'series'): Promise<string> => {
    // Map 'series' to 'tv' for TMDB API if needed
    const apiType = type === 'series' ? 'tv' : type;
    const ids = await tmdb.getExternalIds(tmdbId, apiType);

    if (!ids || !ids.imdb_id) {
        throw new Error(`No IMDB ID found for TMDB ID: ${tmdbId}`);
    }

    return ids.imdb_id;
};

export interface TMDBWatchProvider {
    provider_id: number;
    provider_name: string;
    logo_path: string;
}

export interface TMDBWatchProvidersResult {
    link: string;
    flatrate?: TMDBWatchProvider[];
    rent?: TMDBWatchProvider[];
    buy?: TMDBWatchProvider[];
}

// Episode type
export interface TMDBEpisode {
    id: number;
    name: string;
    overview: string;
    episode_number: number;
    season_number: number;
    air_date: string;
    runtime: number | null;
    still_path: string | null;
    vote_average: number;
}

// Season details with episodes
export interface TMDBSeasonDetails {
    id: number;
    name: string;
    overview: string;
    season_number: number;
    air_date: string;
    poster_path: string | null;
    episodes: TMDBEpisode[];
}
