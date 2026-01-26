import React, { useRef } from 'react';
import type { SelectedMedia } from '@/types';

interface MediaItem {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    type: 'movie' | 'tv';
    tag?: string;
}

interface SectionRowProps {
    title: string;
    items: MediaItem[];
    onSelectMedia: (media: SelectedMedia) => void;
}

export const SectionRow: React.FC<SectionRowProps> = ({ title, items, onSelectMedia }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -400 : 400;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section className="py-8 space-y-6">
            <div className="flex items-end justify-between px-6 md:px-12">
                <h3 className="text-2xl font-black uppercase tracking-tight text-white">{title}</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="size-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:border-white hover:text-white transition-all"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="size-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:border-white hover:text-white transition-all"
                    >
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto px-6 md:px-12 pb-8 scrollbar-hide snap-x"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {items.map((item) => (
                    <button
                        type="button"
                        key={item.id}
                        onClick={() => onSelectMedia({
                            id: parseInt(item.id, 10),
                            type: item.type
                        })}
                        className="min-w-[280px] h-[400px] relative group cursor-pointer rounded-[2rem] overflow-hidden border border-white/5 bg-zinc-900 snap-center text-left focus:scale-[1.03] focus:border-white transition-all duration-300 outline-none"
                    >
                        <img
                            src={item.image}
                            alt={item.title}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-focus:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

                        <div className="absolute bottom-0 left-0 p-6 w-full space-y-2 translate-y-4 group-hover:translate-y-0 group-focus:translate-y-0 transition-transform duration-300">
                            {item.tag && (
                                <span className="text-[10px] font-black bg-white text-black px-2 py-0.5 rounded uppercase tracking-widest inline-block mb-1">
                                    {item.tag}
                                </span>
                            )}
                            <h4 className="text-xl font-black leading-tight tracking-tight text-white">{item.title}</h4>
                            <p className="text-zinc-400 text-xs font-medium line-clamp-2">{item.subtitle}</p>
                        </div>
                    </button>
                ))}
            </div>
        </section>
    );
};

