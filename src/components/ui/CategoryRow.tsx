import React, { useRef } from 'react';

interface CategoryRowProps {
    title: string;
    categories: string[];
}

export const CategoryRow: React.FC<CategoryRowProps> = ({ title, categories }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <section className="py-8 space-y-6">
            <div className="px-6 md:px-12">
                <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-6">{title}</h3>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto px-6 md:px-12 pb-4 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {categories.map((category, idx) => (
                    <button
                        key={idx}
                        className="whitespace-nowrap px-8 py-3 rounded-full border border-zinc-800 bg-zinc-900/50 text-zinc-400 font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-black hover:border-white transition-all"
                    >
                        {category}
                    </button>
                ))}
            </div>
        </section>
    );
};
