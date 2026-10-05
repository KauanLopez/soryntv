import React, { useMemo } from 'react';

interface WarezCDNEmbedProps {
    /**
     * TMDB ID (numeric) or IMDb ID (starting with "tt")
     */
    id: string | number;
    /**
     * The type of media to play
     */
    type: 'movie' | 'tv' | 'anime' | 'dorama';
    /**
     * Optional settings to customize the embed
     */
    options?: {
        noEpList?: boolean;
        color?: string; // hex color without #
        noLink?: boolean;
        transparent?: boolean;
    };
    /**
     * Additional CSS classes
     */
    className?: string;
}

export const WarezCDNEmbed: React.FC<WarezCDNEmbedProps> = ({ id, type, options, className = '' }) => {
    const embedUrl = useMemo(() => {
        const baseUrl = 'https://warezcdn.sbs';
        const path = type === 'movie' ? 'filme' : 'serie';
        
        let url = `${baseUrl}/${path}/${id}`;
        
        if (options) {
            const hashes: string[] = [];
            if (options.noEpList) hashes.push('noEpList');
            if (options.noLink) hashes.push('noLink');
            if (options.transparent) hashes.push('transparent');
            if (options.color) hashes.push(`color:${options.color.replace('#', '')}`);
            
            if (hashes.length > 0) {
                url += `#${hashes.join('&')}`;
            }
        }
        
        return url;
    }, [id, type, options]);

    return (
        <div className={`w-full aspect-video rounded-2xl overflow-hidden bg-black ${className}`}>
            <iframe
                src={embedUrl}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                title="WarezCDN Player"
            />
        </div>
    );
};
