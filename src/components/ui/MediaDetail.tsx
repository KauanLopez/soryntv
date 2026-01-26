import React from 'react';
import type { MediaDetailProps } from '@/types';

export const MediaDetail: React.FC<MediaDetailProps> = ({ media, onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:px-6 md:py-12">
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
                onClick={onClose}
            />

            <div className="relative w-full md:max-w-6xl h-[90vh] md:h-full md:max-h-[85vh] glass rounded-t-[2rem] md:rounded-[3rem] overflow-hidden flex flex-col md:flex-row border border-white/20 shadow-[0_0_100px_rgba(0,0,0,1)] animate-in slide-in-from-bottom duration-300">
                {/* Visual Side */}
                <div className="relative w-full h-[30vh] md:h-full md:w-1/2 shrink-0">
                    <img
                        src={media.image}
                        alt={media.title}
                        className="absolute inset-0 w-full h-full object-cover grayscale opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <button className="size-16 md:size-24 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-all shadow-2xl">
                            <span className="material-symbols-outlined text-3xl md:text-5xl fill-current">play_arrow</span>
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 left-4 md:top-8 md:left-8 size-10 md:size-12 glass rounded-full flex items-center justify-center text-white hover:bg-white/10 z-10"
                    >
                        <span className="material-symbols-outlined text-lg md:text-2xl">close</span>
                    </button>
                </div>

                {/* Info Side */}
                <div className="flex-1 p-6 md:p-12 lg:p-16 flex flex-col md:justify-center gap-4 md:gap-8 overflow-y-auto bg-black/40">
                    <div className="flex items-center gap-3 md:gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 shrink-0">
                        <span className="px-2 md:px-3 py-1 border border-zinc-800 rounded">{media.year || '2024'}</span>
                        <span className="px-2 md:px-3 py-1 border border-zinc-800 rounded">TV-MA</span>
                        <span className="text-accentPink">{media.rating || '98% Match'}</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.9] break-words">
                        {media.title}
                    </h1>

                    <p className="text-zinc-400 text-sm md:text-lg lg:text-xl font-medium leading-relaxed line-clamp-4 md:line-clamp-none">
                        In a dystopia riddled with corruption and cybernetic implants, a talented but reckless street kid strives to become a mercenary outlaw.
                    </p>

                    <div className="space-y-4 md:space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-600">Top Cast</h3>
                        <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="size-12 md:size-16 rounded-xl md:rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden grayscale hover:grayscale-0 transition-all shrink-0">
                                    <img src={`https://picsum.photos/seed/${i + 100}/100/100`} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 md:gap-4 pt-4 md:pt-8 mt-auto md:mt-0 pb-12 md:pb-0">
                        <button className="h-12 md:h-16 px-8 md:px-12 rounded-full bg-white text-black font-black uppercase tracking-widest hover:scale-105 transition-all text-sm md:text-base flex-1 md:flex-none">
                            Watch Now
                        </button>
                        <button className="size-12 md:size-16 rounded-full glass flex items-center justify-center text-white hover:bg-white/10 transition-all">
                            <span className="material-symbols-outlined text-xl md:text-2xl">add</span>
                        </button>
                        <button className="size-12 md:size-16 rounded-full glass flex items-center justify-center text-white hover:bg-white/10 transition-all">
                            <span className="material-symbols-outlined text-xl md:text-2xl">share</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
