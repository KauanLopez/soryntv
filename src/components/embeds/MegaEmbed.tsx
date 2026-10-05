import React, { useMemo } from 'react';

interface MegaEmbedProps {
    /**
     * TMDB ID (numeric) or IMDb ID (starting with "tt")
     */
    id: string | number;
    /**
     * Additional CSS classes
     */
    className?: string;
}

export const MegaEmbed: React.FC<MegaEmbedProps> = ({ id, className = '' }) => {
    const embedUrl = useMemo(() => {
        return `https://megaembedapi.site/embed/${id}`;
    }, [id]);

    return (
        <div className={`w-full aspect-video rounded-2xl overflow-hidden bg-black ${className}`}>
            <iframe
                src={embedUrl}
                className="w-full h-full border-0"
                scrolling="no"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                title="MegaEmbed Player"
            />
        </div>
    );
};
