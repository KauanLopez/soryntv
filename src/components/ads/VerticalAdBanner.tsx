import React, { useEffect, useRef } from 'react';

interface VerticalAdBannerProps {
    className?: string;
}

export const VerticalAdBanner: React.FC<VerticalAdBannerProps> = ({ className = '' }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Verifica se o script já foi injetado para evitar duplicação (comum no React Strict Mode)
        if (containerRef.current.querySelector('script')) return;

        const script = document.createElement('script');
        script.src = "//untimely-hello.com/b.XyVnsAdKG/l/0NYjW/cj/eeCm/9muCZsUjl_k-PtTsct0yOYT/AX1TMdDwUwtPNkzdQo5UMfDzUZwvOzQj";
        script.async = true;
        script.referrerPolicy = "no-referrer-when-downgrade";

        // Injeta configurações caso o script nativo requeira
        (script as any).settings = {};

        containerRef.current.appendChild(script);

        return () => {
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, []);

    return (
        <div 
            ref={containerRef} 
            className={`flex items-center justify-center overflow-hidden bg-transparent ${className}`}
        />
    );
};
