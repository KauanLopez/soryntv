import React, { useState, useEffect } from 'react';
import type { HeroProps } from '@/types';
import { TMDBResult, getImageUrl } from '@/lib/tmdb';

interface HeroCarouselProps extends HeroProps {
    movies?: TMDBResult[];
}

export const Hero: React.FC<HeroCarouselProps> = ({ onWatch, movies = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-scroll logic
    useEffect(() => {
        if (movies.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % movies.length);
        }, 8000); // 8 seconds per slide
        return () => clearInterval(interval);
    }, [movies.length]);

    // Fallback if no movies
    const currentMovie = movies.length > 0 ? movies[currentIndex] : null;

    if (!currentMovie) {
        // Render Loading or Default Static Hero (Dune)
        return (
            <section className="relative w-full h-[95vh] px-4 sm:px-6 md:px-12 pt-12 md:pt-12 pb-24 md:pb-0">
                <div className="relative w-full h-full rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/10 bg-[#0a0a0a] animate-pulse">
                    <div className="absolute inset-0 bg-zinc-900"></div>
                </div>
            </section>
        );
    }

    // Determine content
    const title = currentMovie.title || 'Unknown Title';
    const image = getImageUrl(currentMovie.backdrop_path, 'original');
    const year = currentMovie.release_date ? new Date(currentMovie.release_date).getFullYear() : '';
    const overview = currentMovie.overview;

    return (
        <section className="relative w-full h-[95vh] px-4 sm:px-6 md:px-12 pt-12 md:pt-12 pb-24 md:pb-0">
            <div className="relative w-full h-full rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/10 bg-[#0a0a0a] group">
                {/* Background Video/Image - Keyed by ID to trigger transition animations if frameworks support it, 
                    but plain CSS bg-image transition is smoother with specific stacking. 
                    Simple approach: Use key to remount or just update style.
                */}
                <div
                    key={currentMovie.id} // reliable re-render for animation reset if using CSS animations
                    className="absolute inset-0 bg-cover bg-center transition-all duration-[2000ms] ease-in-out scale-100 group-hover:scale-105 animate-in fade-in zoom-in-50"
                    style={{ backgroundImage: `url("${image}")` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-page via-page/40 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-page/80 via-transparent to-transparent"></div>
                </div>

                {/* Content */}
                <div className="relative h-full flex flex-col justify-end p-6 md:p-12 lg:p-24 max-w-5xl z-10">
                    <div className="flex gap-4 mb-4 md:mb-8 animate-in slide-in-from-bottom-10 duration-700 delay-100">
                        <span className="bg-white text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">Recommended For You</span>
                        <span className="glass text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em]">Top Pick</span>
                    </div>

                    <div className="mb-4 md:mb-8 animate-in slide-in-from-bottom-10 duration-700 delay-200">
                        <h1 className="text-5xl sm:text-7xl md:text-[6rem] lg:text-[8rem] font-black tracking-tighter text-white leading-[0.9] mb-2 md:mb-4 break-words line-clamp-2">
                            {title}
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs md:text-sm font-mono text-zinc-400 mb-6 md:mb-8 border-l border-zinc-800 pl-4 md:pl-8 animate-in slide-in-from-bottom-10 duration-700 delay-300">
                        <span className="text-white font-black">{currentMovie.vote_average ? Math.round(currentMovie.vote_average * 10) : 'NR'}% Match</span>
                        <span>{year}</span>
                        <span className="text-[10px] border border-zinc-700 px-2 rounded font-bold">HD</span>
                    </div>

                    <p className="text-zinc-400 text-sm md:text-xl font-medium max-w-2xl leading-relaxed mb-8 md:mb-12 line-clamp-3 md:line-clamp-3 animate-in slide-in-from-bottom-10 duration-700 delay-400">
                        {overview}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 animate-in slide-in-from-bottom-10 duration-700 delay-500">
                        <button
                            onClick={onWatch}
                            className="flex items-center justify-center gap-3 h-14 md:h-16 px-8 md:px-12 rounded-full bg-white text-black text-base md:text-lg font-black hover:scale-105 transition-all shadow-2xl hover:bg-zinc-200"
                        >
                            <span className="material-symbols-outlined fill-current text-xl md:text-2xl">play_arrow</span>
                            WATCH NOW
                        </button>
                        <button className="flex items-center justify-center gap-3 h-14 md:h-16 px-8 md:px-12 rounded-full glass text-white text-base md:text-lg font-black hover:bg-white/10 transition-all">
                            <span className="material-symbols-outlined text-xl md:text-2xl">add</span>
                            ADD TO LIST
                        </button>
                    </div>
                </div>

                {/* Carousel Indicators - Absolute Bottom Right */}
                <div className="absolute bottom-12 right-12 flex gap-3 z-20">
                    {movies.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
