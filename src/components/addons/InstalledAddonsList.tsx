import React, { useEffect, useState } from 'react';
import type { UserAddon } from '@/types';
import { supabase } from '@/lib/supabase';

interface InstalledAddonsListProps {
    refreshTrigger?: number;
}

export const InstalledAddonsList: React.FC<InstalledAddonsListProps> = ({ refreshTrigger = 0 }) => {
    const [addons, setAddons] = useState<UserAddon[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAddons = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('user_addons')
                .select('*')
                .eq('user_id', user.id)
                .order('installed_at', { ascending: false });

            if (error) throw error;

            // Map snake_case DB fields to camelCase TS interface if needed
            // But usually Supabase returns whatever column names.
            // My schema used snake_case: transport_url, addon_id, etc.
            // My TS interface uses camelCase: transportUrl, addonId.
            // I need to map them.
            const mappedAddons: UserAddon[] = (data || []).map((item: any) => ({
                id: item.id,
                addonId: item.addon_id,
                name: item.name,
                logo: item.logo,
                version: item.version,
                transportUrl: item.transport_url,
                installedAt: item.installed_at
            }));

            setAddons(mappedAddons);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching addons:', err);
            setError(err.message || 'Could not load addons');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddons();
    }, [refreshTrigger]);

    const handleUninstall = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to remove ${name}?`)) return;

        try {
            const { error } = await supabase
                .from('user_addons')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setAddons(prev => prev.filter(a => a.id !== id));
        } catch (e: any) {
            alert('Error removing addon: ' + e.message);
        }
    };

    const copyTransportUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        alert('Installation URL copied to clipboard!');
    };

    if (loading && addons.length === 0) {
        return (
            <div className="py-12 flex justify-center w-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-12 text-center w-full">
                <p className="text-red-400 font-mono text-sm">Error: {error}</p>
            </div>
        );
    }

    if (addons.length === 0) {
        // Return null or a subtle empty state if intended to be shown alongside "suggested" sources
        // But requested to "visualize installed addons", so an empty state is good.
        return (
            <div className="col-span-full py-12 text-center border border-dashed border-zinc-800 rounded-[2.5rem] bg-card/50">
                <span className="material-symbols-outlined text-4xl text-zinc-700 mb-4">extension_off</span>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">No addons installed yet</p>
            </div>
        );
    }

    return (
        <section className="space-y-6 w-full">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase">
                    Installed Addons <span className="text-zinc-600 ml-2 text-lg align-top font-mono">({addons.length})</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {addons.map((addon) => (
                    <div
                        key={addon.id}
                        className="group relative bg-[#121212] border border-white/5 hover:border-white/10 rounded-[2rem] p-6 transition-all duration-300 hover:bg-[#151515]"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div className="size-14 bg-zinc-900 rounded-2xl p-2 flex items-center justify-center border border-white/5 overflow-hidden">
                                {addon.logo ? (
                                    <img src={addon.logo} alt={addon.name} className="w-full h-full object-contain" />
                                ) : (
                                    <span className="material-symbols-outlined text-2xl text-zinc-700">extension</span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => copyTransportUrl(addon.transportUrl)}
                                    className="size-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/20 hover:bg-white/5 transition-colors"
                                    title="Copy Configuration URL"
                                >
                                    <span className="material-symbols-outlined text-lg">link</span>
                                </button>
                                <button
                                    onClick={() => handleUninstall(addon.id, addon.name)}
                                    className="size-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-colors"
                                    title="Uninstall"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1 line-clamp-1" title={addon.name}>
                                {addon.name}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-accentTeal bg-accentTeal/10 px-2 py-0.5 rounded border border-accentTeal/20">
                                    v{addon.version}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider line-clamp-1 truncate max-w-[120px]">
                                    {addon.addonId}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
