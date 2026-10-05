import React, { useMemo } from 'react';

interface EmbedMoviesProps {
    /**
     * TMDB ID (numeric) or IMDb ID (starting with "tt")
     */
    id: string | number;
    /**
     * Additional CSS classes
     */
    className?: string;
}

export const EmbedMovies: React.FC<EmbedMoviesProps> = ({ id, className = '' }) => {
    const embedUrl = useMemo(() => {
        return `https://myembed.biz/filme/${id}`;
    }, [id]);

    return (
        <div className={`w-full aspect-video rounded-2xl overflow-hidden bg-black ${className}`}>
            <iframe
                src={embedUrl}
                className="w-full h-full border-0"
                scrolling="no"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                title="EmbedMovies Player"
            />
        </div>
    );
};
