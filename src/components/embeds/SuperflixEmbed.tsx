import React, { useMemo } from 'react';

interface SuperflixEmbedProps {
    /**
     * TMDB ID (numeric) or IMDb ID (starting with "tt")
     */
    id: string | number;
    /**
     * The type of media to play
     */
    type: 'movie' | 'tv' | 'anime' | 'dorama';
    /**
     * Additional CSS classes
     */
    className?: string;
}

export const SuperflixEmbed: React.FC<SuperflixEmbedProps> = ({ id, type, className = '' }) => {
    const embedUrl = useMemo(() => {
        // The user provided two formats:
        // Movie: https://superflixhd.epizy.com/embed-2/type=movies&imdb=tt1386697
        // TV: https://superflixhd.epizy.com/embed-2/?type=tvshows&imdb=tt2193021
        // Adding the '?' is the standard way to start query parameters, so we'll use it for both.
        const mediaType = type === 'movie' ? 'movies' : 'tvshows';
        return `https://superflixhd.epizy.com/embed-2/?type=${mediaType}&imdb=${id}`;
    }, [id, type]);

    return (
        <div className={`w-full aspect-video rounded-2xl overflow-hidden bg-black ${className}`}>
            <iframe
                src={embedUrl}
                className="w-full h-full border-0"
                scrolling="no"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                title="Superflix Player"
            />
        </div>
    );
};
