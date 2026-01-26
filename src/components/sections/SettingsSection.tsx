import React, { useState } from 'react';

interface ToggleSwitchProps {
    enabled: boolean;
    onChange: (enabled: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ enabled, onChange }) => (
    <button
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-7 rounded-full transition-colors ${enabled ? 'bg-accentTeal' : 'bg-zinc-800'}`}
    >
        <div className={`absolute top-1 size-5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
);

interface SelectProps {
    value: string;
    options: string[];
    onChange: (value: string) => void;
}

const Select: React.FC<SelectProps> = ({ value, options, onChange }) => (
    <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white font-medium focus:border-white outline-none transition-all cursor-pointer appearance-none min-w-[160px]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px', paddingRight: '40px' }}
    >
        {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
        ))}
    </select>
);

interface SettingItemProps {
    icon: string;
    title: string;
    description?: string;
    children: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({ icon, title, description, children }) => (
    <div className="flex items-center justify-between py-5 border-b border-zinc-800/50 last:border-0 gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="size-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/70 shrink-0">
                <span className="material-symbols-outlined text-xl">{icon}</span>
            </div>
            <div className="min-w-0">
                <h4 className="font-bold text-white">{title}</h4>
                {description && <p className="text-zinc-500 text-sm truncate">{description}</p>}
            </div>
        </div>
        <div className="shrink-0">{children}</div>
    </div>
);

interface SettingsSectionCardProps {
    icon: string;
    title: string;
    tag?: string;
    children: React.ReactNode;
}

const SettingsSectionCard: React.FC<SettingsSectionCardProps> = ({ icon, title, tag, children }) => (
    <div className="bg-card p-6 md:p-8 rounded-[2rem] border border-white/5 space-y-4 hover:border-white/10 transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/50">
            <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-white">{icon}</span>
                <h3 className="text-xl font-black tracking-tight uppercase">{title}</h3>
            </div>
            {tag && <span className="text-[10px] font-mono text-zinc-500 border border-zinc-800 px-3 py-1 rounded">{tag}</span>}
        </div>
        <div>{children}</div>
    </div>
);

const DangerButton: React.FC<{ icon: string; label: string; onClick?: () => void }> = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="flex items-center gap-3 px-5 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-medium"
    >
        <span className="material-symbols-outlined text-xl">{icon}</span>
        {label}
    </button>
);

const ActionButton: React.FC<{ label: string; outline?: boolean; onClick?: () => void }> = ({ label, outline, onClick }) => (
    <button
        onClick={onClick}
        className={`h-10 px-6 rounded-full font-bold uppercase tracking-widest text-xs transition-all ${outline
            ? 'border border-white/20 text-white hover:bg-white hover:text-black'
            : 'bg-white text-black hover:scale-105'}`}
    >
        {label}
    </button>
);

export const SettingsSection: React.FC = () => {
    // Appearance
    const [theme, setTheme] = useState('Dark');
    const [accentColor, setAccentColor] = useState('Teal');
    const [animations, setAnimations] = useState(true);
    const [density, setDensity] = useState('Default');

    // Playback
    const [videoQuality, setVideoQuality] = useState('Auto');
    const [autoplay, setAutoplay] = useState(true);
    const [skipIntro, setSkipIntro] = useState(true);
    const [subtitleLang, setSubtitleLang] = useState('Português');
    const [audioLang, setAudioLang] = useState('Original');

    // Notifications
    const [notifyReleases, setNotifyReleases] = useState(true);
    const [notifyContinue, setNotifyContinue] = useState(true);
    const [notifySources, setNotifySources] = useState(false);

    // Privacy
    const [twoFactor, setTwoFactor] = useState(false);
    const [saveHistory, setSaveHistory] = useState(true);

    // Data
    const [limitData, setLimitData] = useState(false);

    // Language
    const [interfaceLang, setInterfaceLang] = useState('Português (BR)');
    const [region, setRegion] = useState('Brasil');

    // Advanced
    const [devMode, setDevMode] = useState(false);

    const accentColors = [
        { name: 'Teal', color: '#2DD4BF' },
        { name: 'Purple', color: '#A855F7' },
        { name: 'Blue', color: '#3B82F6' },
        { name: 'Red', color: '#EF4444' },
        { name: 'Orange', color: '#F97316' },
        { name: 'Pink', color: '#EC4899' },
    ];

    return (
        <div className="py-12 md:py-32 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto space-y-12 md:space-y-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-12">
                <div className="space-y-4 md:space-y-6">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none">
                        SETTINGS
                    </h1>
                    <p className="text-zinc-400 text-base md:text-xl font-medium max-w-lg border-l border-white/10 pl-6 md:pl-8">
                        Customize your experience. Configure appearance, playback, privacy, and more.
                    </p>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs text-zinc-500 uppercase">
                    <span className="size-2 bg-accentTeal rounded-full"></span>
                    All Systems Nominal
                </div>
            </div>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

                {/* Appearance */}
                <SettingsSectionCard icon="palette" title="Appearance" tag="VISUAL">
                    <SettingItem icon="dark_mode" title="Theme" description="Choose your preferred color scheme">
                        <Select value={theme} options={['Dark', 'Light', 'System']} onChange={setTheme} />
                    </SettingItem>
                    <SettingItem icon="colorize" title="Accent Color" description="Highlight color for UI elements">
                        <div className="flex items-center gap-2">
                            {accentColors.map((c) => (
                                <button
                                    key={c.name}
                                    onClick={() => setAccentColor(c.name)}
                                    className={`size-7 rounded-full transition-all ${accentColor === c.name ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'hover:scale-110'}`}
                                    style={{ backgroundColor: c.color }}
                                    title={c.name}
                                />
                            ))}
                        </div>
                    </SettingItem>
                    <SettingItem icon="animation" title="Animations" description="Enable smooth transitions and effects">
                        <ToggleSwitch enabled={animations} onChange={setAnimations} />
                    </SettingItem>
                    <SettingItem icon="view_compact" title="Interface Density" description="Spacing between elements">
                        <Select value={density} options={['Compact', 'Default', 'Comfortable']} onChange={setDensity} />
                    </SettingItem>
                </SettingsSectionCard>

                {/* Playback */}
                <SettingsSectionCard icon="play_circle" title="Playback" tag="MEDIA">
                    <SettingItem icon="high_quality" title="Video Quality" description="Default streaming resolution">
                        <Select value={videoQuality} options={['Auto', '4K (2160p)', '1080p', '720p', '480p']} onChange={setVideoQuality} />
                    </SettingItem>
                    <SettingItem icon="skip_next" title="Autoplay" description="Play next episode automatically">
                        <ToggleSwitch enabled={autoplay} onChange={setAutoplay} />
                    </SettingItem>
                    <SettingItem icon="fast_forward" title="Skip Intro/Outro" description="Automatically skip openings and credits">
                        <ToggleSwitch enabled={skipIntro} onChange={setSkipIntro} />
                    </SettingItem>
                    <SettingItem icon="subtitles" title="Default Subtitles" description="Preferred subtitle language">
                        <Select value={subtitleLang} options={['Off', 'Português', 'English', 'Español', 'Auto']} onChange={setSubtitleLang} />
                    </SettingItem>
                    <SettingItem icon="volume_up" title="Default Audio" description="Preferred audio track">
                        <Select value={audioLang} options={['Original', 'Português', 'English', 'Español']} onChange={setAudioLang} />
                    </SettingItem>
                </SettingsSectionCard>

                {/* Notifications */}
                <SettingsSectionCard icon="notifications" title="Notifications" tag="ALERTS">
                    <SettingItem icon="new_releases" title="New Releases" description="Get notified about new movies and series">
                        <ToggleSwitch enabled={notifyReleases} onChange={setNotifyReleases} />
                    </SettingItem>
                    <SettingItem icon="history" title="Continue Watching" description="Reminders to finish what you started">
                        <ToggleSwitch enabled={notifyContinue} onChange={setNotifyContinue} />
                    </SettingItem>
                    <SettingItem icon="source" title="Source Updates" description="Status changes for media sources">
                        <ToggleSwitch enabled={notifySources} onChange={setNotifySources} />
                    </SettingItem>
                </SettingsSectionCard>

                {/* Account & Privacy */}
                <SettingsSectionCard icon="shield" title="Account & Privacy" tag="SECURITY">
                    <SettingItem icon="mail" title="Email Address" description="user@email.com">
                        <ActionButton label="Change" outline />
                    </SettingItem>
                    <SettingItem icon="key" title="Password" description="Last changed 30 days ago">
                        <ActionButton label="Change" outline />
                    </SettingItem>
                    <SettingItem icon="security" title="Two-Factor Auth" description="Add extra security to your account">
                        <ToggleSwitch enabled={twoFactor} onChange={setTwoFactor} />
                    </SettingItem>
                    <SettingItem icon="devices" title="Connected Devices" description="Manage your active sessions">
                        <ActionButton label="Manage" outline />
                    </SettingItem>
                    <SettingItem icon="visibility_off" title="Watch History" description="Save and sync your viewing progress">
                        <ToggleSwitch enabled={saveHistory} onChange={setSaveHistory} />
                    </SettingItem>
                    <div className="pt-4 border-t border-zinc-800/50 mt-2">
                        <DangerButton icon="delete_forever" label="Delete Account" />
                    </div>
                </SettingsSectionCard>

                {/* Data & Storage */}
                <SettingsSectionCard icon="storage" title="Data & Storage" tag="CACHE">
                    <SettingItem icon="photo_library" title="Image Cache" description="Cached images: 245 MB">
                        <ActionButton label="Clear" outline />
                    </SettingItem>
                    <SettingItem icon="download" title="Downloads" description="Offline content: 1.2 GB">
                        <ActionButton label="Manage" outline />
                    </SettingItem>
                    <SettingItem icon="data_saver_on" title="Data Saver" description="Limit quality on mobile data">
                        <ToggleSwitch enabled={limitData} onChange={setLimitData} />
                    </SettingItem>
                </SettingsSectionCard>

                {/* Language & Region */}
                <SettingsSectionCard icon="language" title="Language & Region" tag="LOCALE">
                    <SettingItem icon="translate" title="Interface Language" description="App display language">
                        <Select value={interfaceLang} options={['Português (BR)', 'English (US)', 'Español', 'Français', 'Deutsch']} onChange={setInterfaceLang} />
                    </SettingItem>
                    <SettingItem icon="public" title="Country/Region" description="Affects content availability">
                        <Select value={region} options={['Brasil', 'United States', 'Portugal', 'España', 'México']} onChange={setRegion} />
                    </SettingItem>
                </SettingsSectionCard>

                {/* Advanced */}
                <SettingsSectionCard icon="code" title="Advanced" tag="DEV">
                    <SettingItem icon="bug_report" title="Developer Mode" description="Enable debug logs and tools">
                        <ToggleSwitch enabled={devMode} onChange={setDevMode} />
                    </SettingItem>
                    <SettingItem icon="dns" title="Media Server" description="Configure custom endpoints">
                        <ActionButton label="Configure" outline />
                    </SettingItem>
                    <SettingItem icon="import_export" title="Import/Export" description="Backup your settings">
                        <div className="flex gap-2">
                            <ActionButton label="Import" outline />
                            <ActionButton label="Export" outline />
                        </div>
                    </SettingItem>
                    <SettingItem icon="info" title="About Soryn" description="Version 1.0.0">
                        <span className="text-zinc-500 font-mono text-sm">Build #2024.01</span>
                    </SettingItem>
                </SettingsSectionCard>
            </div>
        </div>
    );
};
