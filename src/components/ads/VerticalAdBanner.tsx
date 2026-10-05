import React, { useEffect, useRef } from 'react';

interface VerticalAdBannerProps {
    className?: string;
}

export const VerticalAdBanner: React.FC<VerticalAdBannerProps> = ({ className = '' }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isLoaded = useRef(false);

    useEffect(() => {
        // Evita injeção dupla no Strict Mode do React
        if (!containerRef.current || isLoaded.current) return;
        isLoaded.current = true;

        // Geramos um ID único para o script âncora
        const scriptId = `ad-loader-${Math.random().toString(36).substring(2, 11)}`;
        
        // Criamos o script exatamente com a lógica fornecida pela rede de anúncios,
        // mas substituímos a busca falha (d.currentScript / d.scripts) por um getElementById cirúrgico.
        const loaderScript = document.createElement('script');
        loaderScript.id = scriptId;
        loaderScript.type = 'text/javascript';
        loaderScript.text = `
            (function(bnvhz){
                var d = document,
                    s = d.createElement('script'),
                    l = d.getElementById('${scriptId}');
                s.settings = bnvhz || {};
                s.src = "https://untimely-hello.com/bUX.V-stdEGDl/0PYfWhcg/yetmq9yuyZ/UVlqkaPHTQcx0XOdTUAe1YM_DlUstdNxzgQc5BM/DXUBwROyQL";
                s.async = true;
                s.referrerPolicy = 'no-referrer-when-downgrade';
                if (l && l.parentNode) {
                    l.parentNode.insertBefore(s, l);
                }
            })({});
        `;

        // Anexa e executa o script imediatamente dentro da nossa div
        containerRef.current.appendChild(loaderScript);
    }, []);

    return (
        <div 
            ref={containerRef} 
            className={`flex flex-col items-center justify-center overflow-visible bg-transparent min-h-[300px] w-full ${className}`}
        />
    );
};
