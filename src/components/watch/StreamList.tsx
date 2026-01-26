
import React from 'react';
import type { Stream } from '@/lib/stremio';

interface StreamListProps {
    streams: Stream[];
    loading: boolean;
    onSelect: (stream: Stream) => void;
}

export const StreamList: React.FC<StreamListProps> = ({ streams, loading, onSelect }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-zinc-900 rounded-xl border border-white/5 animate-pulse flex flex-col justify-center px-6 gap-2">
                        <div className="h-4 w-1/3 bg-zinc-800 rounded"></div>
                        <div className="h-3 w-1/2 bg-zinc-800 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (streams.length === 0) {
        return (
            <div className="w-full py-8 text-center bg-zinc-900/50 rounded-2xl border border-white/5 border-dashed">
                <span className="material-symbols-outlined text-4xl text-zinc-600 mb-2">signal_cellular_off</span>
                <p className="text-zinc-500 font-mono text-sm">No free streams found for this title.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Select Source</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {streams.map((stream, idx) => {
                    // Extract Resolution/Quality often found in 'name' or 'title' or 'description'
                    // For Torrentio: title usually has detail vertically separated by \n
                    const titleParts = (stream.title || stream.name || 'Unknown Source').split('\n');
                    const mainTitle = titleParts[0];
                    const subTitle = titleParts[1] || stream.description || '';

                    // Simple heuristic for badge color based on resolution text
                    let qualityColor = 'text-zinc-400 border-zinc-700 bg-zinc-800';
                    if (mainTitle.includes('4k') || mainTitle.includes('2160p')) qualityColor = 'text-accentPurple border-accentPurple/30 bg-accentPurple/10';
                    else if (mainTitle.includes('1080p')) qualityColor = 'text-accentTeal border-accentTeal/30 bg-accentTeal/10';

                    return (
                        <button
                            key={idx}
                            onClick={() => {
                                console.log('🖱️ Stream Clicked:', stream);
                                onSelect(stream);
                            }}
                            className="relative group flex flex-col items-start p-5 bg-[#121212] border border-white/5 rounded-2xl hover:bg-[#1A1A1A] hover:border-white/20 hover:scale-[1.02] transition-all text-left"
                        >
                            <div className="w-full flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${qualityColor}`}>
                                    {mainTitle.match(/4k|2160p|1080p|720p|HDR|Dolby/i)?.[0] || 'SD'}
                                </span>
                                <span className="material-symbols-outlined text-zinc-600 group-hover:text-white transition-colors text-xl">play_circle</span>
                            </div>

                            <h5 className="text-white font-bold text-sm leading-tight line-clamp-1 mb-1" title={mainTitle}>
                                {stream.name || 'Stream'} {stream._addonName ? `• ${stream._addonName}` : ''}
                            </h5>
                            <p className="text-zinc-500 text-xs font-mono line-clamp-1" title={subTitle}>
                                {subTitle || mainTitle}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
