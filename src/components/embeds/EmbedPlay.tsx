import React, { useMemo } from 'react';

interface EmbedPlayProps {
    /**
     * TMDB ID (numeric) or IMDb ID (starting with "tt")
     */
    id: string | number;
    /**
     * The type of media to play
     */
    type: 'movie' | 'tv' | 'anime' | 'dorama';
    /**
     * Season number (only for TV shows)
     */
    season?: number;
    /**
     * Episode number (only for TV shows)
     */
    episode?: number;
    /**
     * Additional CSS classes
     */
    className?: string;
}

export const EmbedPlay: React.FC<EmbedPlayProps> = ({ id, type, season, episode, className = '' }) => {
    const embedUrl = useMemo(() => {
        let url = `https://embedplayapi.top/embed/${id}`;
        
        // Se for série e tiver temporada/episódio, adiciona na URL
        if (type === 'tv' && season !== undefined && episode !== undefined) {
            url += `/${season}/${episode}`;
        }
        
        return url;
    }, [id, type, season, episode]);

    return (
        <div className={`w-full aspect-video rounded-2xl overflow-hidden bg-black ${className}`}>
            <iframe
                src={embedUrl}
                className="w-full h-full border-0"
                scrolling="no"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                title="EmbedPlay Player"
            />
        </div>
    );
};
