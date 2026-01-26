import React, { useState } from 'react';
import { SOURCE_NODES } from '@/constants/mediaData';
import { AddAddonInput } from './AddAddonInput';
import { InstalledAddonsList } from '@/components/addons/InstalledAddonsList';
import { supabase } from '@/lib/supabase';

export const SourcesSection: React.FC = () => {
    const [url, setUrl] = useState('');
    const [installedIds, setInstalledIds] = useState<string[]>([]); // This might be redundant if list manages itself, skipping for now or keeping for AddInput prop
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleAddonInstalled = async (manifest: any, transportUrl: string) => {
        console.log('Installing:', manifest.name, transportUrl);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('You must be logged in to install addons.');
                return;
            }

            // Save to Supabase
            const { error } = await supabase.from('user_addons').insert({
                user_id: user.id,
                addon_id: manifest.id,
                transport_url: transportUrl,
                manifest_url: transportUrl, // Simplified for now
                name: manifest.name,
                logo: manifest.logo,
                version: manifest.version,
                installed_at: new Date().toISOString()
            });

            if (error) {
                // If unique constraint violation (code 23505), handle gracefully
                if (error.code === '23505') {
                    alert('This exact addon configuration is already installed.');
                } else {
                    console.error('Database Error:', error);
                    alert('Failed to save addon to account.');
                }
                return;
            }

            // Success: Update UI
            setInstalledIds(prev => [...prev, manifest.id]);
            setRefreshTrigger(prev => prev + 1); // Trigger list reload

        } catch (err) {
            console.error('Installation Error:', err);
            alert('An unexpected error occurred.');
        }
    };


    return (
        <div className="py-12 md:py-32 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto space-y-12 md:space-y-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-12">
                <div className="space-y-4 md:space-y-6">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none">MEDIA<br />SOURCES</h1>
                    <p className="text-zinc-400 text-base md:text-xl font-medium max-w-lg border-l border-white/10 pl-6 md:pl-8">
                        Orchestrate your external streams. Import M3U playlists, HLS links, and custom API endpoints.
                    </p>
                </div>
                <div className="flex flex-col items-start md:items-end gap-4 w-full md:w-auto">
                    <button className="bg-white text-black h-14 md:h-16 px-8 md:px-10 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform w-full md:w-auto">
                        Sync All Sources
                    </button>
                    <div className="flex items-center gap-2 font-mono text-xs text-zinc-500 uppercase">
                        <span className="size-2 bg-accentTeal rounded-full animate-pulse"></span>
                        System Online
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-12">
                {/* 1. Add New Addon */}
                <AddAddonInput
                    installedAddonIds={installedIds}
                    onAddonInstalled={handleAddonInstalled}
                />

                {/* 2. Installed Addons List */}
                <InstalledAddonsList refreshTrigger={refreshTrigger} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="bg-card p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-white/5 space-y-6 md:space-y-12 group hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-start">
                        <span className="material-symbols-outlined text-4xl md:text-5xl text-white">playlist_play</span>
                        <span className="text-[10px] font-mono text-zinc-500 border border-zinc-800 px-3 py-1 rounded">TYPE: LIST</span>
                    </div>
                    <div>
                        <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Playlist Import</h3>
                        <p className="text-zinc-500 text-sm md:text-base">Add M3U or M3U8 files with full EPG support.</p>
                    </div>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="https://source.url/playlist.m3u"
                            className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-4 text-white font-mono placeholder:text-zinc-700 focus:border-white outline-none transition-all text-sm md:text-base"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <button className="w-full h-12 md:h-14 rounded-full border border-white/10 text-white font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all text-xs md:text-sm">
                            Connect Playlist
                        </button>
                    </div>
                </div>

                <div className="bg-card p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-white/5 space-y-6 md:space-y-12 group hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-start">
                        <span className="material-symbols-outlined text-4xl md:text-5xl text-white">cast</span>
                        <span className="text-[10px] font-mono text-zinc-500 border border-zinc-800 px-3 py-1 rounded">TYPE: STREAM</span>
                    </div>
                    <div>
                        <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Direct HLS Stream</h3>
                        <p className="text-zinc-500 text-sm md:text-base">Play single HLS, RTMP or Dash live connection.</p>
                    </div>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="https://server.com/live/index.m3u8"
                            className="w-full bg-black border border-zinc-800 rounded-2xl px-6 py-4 text-white font-mono placeholder:text-zinc-700 focus:border-white outline-none transition-all text-sm md:text-base"
                        />
                        <button className="w-full h-12 md:h-14 rounded-full border border-white/10 text-white font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all text-xs md:text-sm">
                            Start Stream
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-6 md:space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Active Nodes</h3>
                    <div className="font-mono text-[10px] text-zinc-600 uppercase tracking-[0.2em]">Total: 04 • Online: 03</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {SOURCE_NODES.map((node, i) => (
                        <div key={i} className={`p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-zinc-900 bg-zinc-900/50 flex flex-col gap-4 md:gap-6 hover:border-zinc-700 transition-all ${node.offline ? 'opacity-40' : ''}`}>
                            <div className="flex justify-between items-start">
                                <div className="size-10 md:size-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white">
                                    <span className="material-symbols-outlined text-lg md:text-2xl">{node.icon}</span>
                                </div>
                                {node.active ? (
                                    <span className="material-symbols-outlined text-accentTeal animate-spin">sync</span>
                                ) : (
                                    <div className={`size-2 rounded-full ${node.offline ? 'bg-red-500' : 'bg-accentTeal'}`}></div>
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-base md:text-lg">{node.name}</h4>
                                <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">{node.type} • Active Session</p>
                            </div>
                            <div className="mt-auto flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <span className={node.offline ? 'text-red-500' : node.active ? 'text-accentPurple' : 'text-accentTeal'}>{node.status}</span>
                                <span className="text-zinc-700">Sync: 12m</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

