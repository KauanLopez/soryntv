import React, { useState } from 'react';
import { validateStremioAddon, Manifest } from '@/lib/stremio';

interface AddAddonInputProps {
    onAddonInstalled: (manifest: Manifest, transportUrl: string) => void;
    installedAddonIds: string[];
}

export const AddAddonInput: React.FC<AddAddonInputProps> = ({ onAddonInstalled, installedAddonIds }) => {
    const [inputUrl, setInputUrl] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleInstall = async () => {
        if (!inputUrl.trim()) return;

        setStatus('loading');
        setMessage('');

        try {
            const { manifest, transportUrl } = await validateStremioAddon(inputUrl);

            // Check for duplicates
            if (installedAddonIds.includes(manifest.id)) {
                setStatus('error');
                setMessage(`Addon "${manifest.name}" is already installed.`);
                return;
            }

            // Success
            setStatus('success');
            setMessage(`Successfully installed: ${manifest.name} v${manifest.version}`);

            // Invoke callback
            onAddonInstalled(manifest, transportUrl);

            // Reset after a delay
            setTimeout(() => {
                setInputUrl('');
                setStatus('idle');
                setMessage('');
            }, 3000);

        } catch (error: any) {
            setStatus('error');
            // Show a user-friendly message, but log the real one
            setMessage(error.message || 'Could not validate addon. Check URL/Connection.');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleInstall();
        }
    };

    return (
        <div className="bg-card p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-white/5 space-y-6 md:space-y-12 group hover:border-white/10 transition-colors">
            <div className="flex justify-between items-start">
                <span className="material-symbols-outlined text-4xl md:text-5xl text-white">extension</span>
                <span className="text-[10px] font-mono text-zinc-500 border border-zinc-800 px-3 py-1 rounded">TYPE: ADDON</span>
            </div>

            <div>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Stremio Addon</h3>
                <p className="text-zinc-500 text-sm md:text-base">
                    Install external addons via URL (Manifest v3).
                </p>
                {status === 'error' && (
                    <p className="text-red-500 text-xs mt-2 font-mono break-all">{message}</p>
                )}
                {status === 'success' && (
                    <p className="text-accentTeal text-xs mt-2 font-mono">{message}</p>
                )}
            </div>

            <div className="space-y-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="https://v3-cinemeta.strem.io/manifest.json"
                        className={`w-full bg-black border ${status === 'error' ? 'border-red-500 focus:border-red-500' : 'border-zinc-800 focus:border-white'} rounded-2xl px-6 py-4 text-white font-mono placeholder:text-zinc-700 outline-none transition-all text-sm md:text-base pr-12`}
                        value={inputUrl}
                        onChange={(e) => {
                            setInputUrl(e.target.value);
                            if (status !== 'loading') setStatus('idle');
                        }}
                        onKeyDown={handleKeyDown}
                        disabled={status === 'loading'}
                    />
                    {status === 'loading' && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <span className="material-symbols-outlined animate-spin text-zinc-500">progress_activity</span>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleInstall}
                    disabled={status === 'loading' || !inputUrl.trim()}
                    className={`w-full h-12 md:h-14 rounded-full border border-white/10 text-white font-black uppercase tracking-widest transition-all text-xs md:text-sm
                        ${status === 'loading' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white hover:text-black'}
                    `}
                >
                    {status === 'loading' ? 'Validating...' : 'Install Addon'}
                </button>
            </div>
        </div>
    );
};
