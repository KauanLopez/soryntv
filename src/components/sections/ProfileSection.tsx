import React, { useState } from 'react';

// Mock data for demonstration
const CONTINUE_WATCHING = [
    { id: 1, title: 'The Last of Us', episode: 'S1 E5', progress: 65, image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400' },
    { id: 2, title: 'Dune: Part Two', episode: '1h 12m left', progress: 45, image: 'https://images.unsplash.com/photo-1506466010722-395ee2bef877?w=400' },
    { id: 3, title: 'Shogun', episode: 'S1 E3', progress: 20, image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400' },
];

const MY_LIST = [
    { id: 1, title: 'Oppenheimer', type: 'Movie', image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400' },
    { id: 2, title: 'Breaking Bad', type: 'Series', image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400' },
    { id: 3, title: 'Interstellar', type: 'Movie', image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400' },
    { id: 4, title: 'Dark', type: 'Series', image: 'https://images.unsplash.com/photo-1509248961895-b4a6b5e1dab7?w=400' },
];

const WATCH_HISTORY = [
    { id: 1, title: 'Dust Bunny', type: 'Movie', watchedAt: '2 hours ago', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400' },
    { id: 2, title: 'The Rip', type: 'Movie', watchedAt: 'Yesterday', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400' },
    { id: 3, title: 'Stranger Things S4 E7', type: 'Episode', watchedAt: '3 days ago', image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400' },
    { id: 4, title: 'The Matrix', type: 'Movie', watchedAt: '1 week ago', image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400' },
];

const GENRE_DATA = [
    { name: 'Sci-Fi', percentage: 35, color: '#2DD4BF' },
    { name: 'Drama', percentage: 25, color: '#A855F7' },
    { name: 'Action', percentage: 20, color: '#3B82F6' },
    { name: 'Thriller', percentage: 12, color: '#F97316' },
    { name: 'Comedy', percentage: 8, color: '#EC4899' },
];

const ACHIEVEMENTS = [
    { id: 1, name: 'Maratonista', description: 'Assistiu 5 episódios seguidos', icon: 'local_fire_department', unlocked: true, color: '#F97316' },
    { id: 2, name: 'Coruja Noturna', description: 'Assistiu às 3am', icon: 'nightlight', unlocked: true, color: '#A855F7' },
    { id: 3, name: 'Cinéfilo', description: '100 filmes assistidos', icon: 'movie', unlocked: false, progress: 67, color: '#3B82F6' },
    { id: 4, name: 'Explorador', description: '10 gêneros diferentes', icon: 'explore', unlocked: true, color: '#2DD4BF' },
    { id: 5, name: 'Crítico', description: 'Avaliou 50 títulos', icon: 'star', unlocked: false, progress: 24, color: '#EAB308' },
    { id: 6, name: 'Primeiro de Muitos', description: 'Completou sua primeira série', icon: 'celebration', unlocked: true, color: '#EC4899' },
];

interface StatCardProps {
    icon: string;
    value: string;
    label: string;
    color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color = 'white' }) => (
    <div className="bg-card p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors text-center">
        <span className="material-symbols-outlined text-3xl mb-2" style={{ color }}>{icon}</span>
        <div className="text-2xl md:text-3xl font-black tracking-tight">{value}</div>
        <div className="text-zinc-500 text-sm font-medium">{label}</div>
    </div>
);

interface MediaCardSmallProps {
    title: string;
    subtitle: string;
    image: string;
    progress?: number;
    onClick?: () => void;
}

const MediaCardSmall: React.FC<MediaCardSmallProps> = ({ title, subtitle, image, progress, onClick }) => (
    <div
        onClick={onClick}
        className="group relative bg-card rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 transition-all cursor-pointer hover:scale-[1.02]"
    >
        <div className="aspect-video bg-zinc-900">
            <img src={image} alt={title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            {progress !== undefined && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
                    <div className="h-full bg-accentTeal transition-all" style={{ width: `${progress}%` }} />
                </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="size-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl text-white">play_arrow</span>
                </div>
            </div>
        </div>
        <div className="p-4">
            <h4 className="font-bold text-white truncate">{title}</h4>
            <p className="text-zinc-500 text-sm">{subtitle}</p>
        </div>
    </div>
);

interface AchievementBadgeProps {
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress?: number;
    color: string;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ name, description, icon, unlocked, progress, color }) => (
    <div className={`relative p-6 rounded-2xl border transition-all ${unlocked
        ? 'bg-card border-white/10 hover:border-white/20'
        : 'bg-zinc-900/50 border-zinc-800/50 opacity-60'}`}
    >
        <div className="flex items-start gap-4">
            <div
                className={`size-14 rounded-xl flex items-center justify-center ${unlocked ? '' : 'bg-zinc-800'}`}
                style={{ backgroundColor: unlocked ? `${color}20` : undefined }}
            >
                <span
                    className="material-symbols-outlined text-2xl"
                    style={{ color: unlocked ? color : '#52525b' }}
                >
                    {unlocked ? icon : 'lock'}
                </span>
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white">{name}</h4>
                <p className="text-zinc-500 text-sm">{description}</p>
                {!unlocked && progress !== undefined && (
                    <div className="mt-3">
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${progress}%`, backgroundColor: color }}
                            />
                        </div>
                        <p className="text-xs text-zinc-600 mt-1">{progress}% completo</p>
                    </div>
                )}
            </div>
            {unlocked && (
                <span className="material-symbols-outlined text-sm text-accentTeal">verified</span>
            )}
        </div>
    </div>
);

export const ProfileSection: React.FC = () => {
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [bio, setBio] = useState('Apaixonado por cinema e séries de ficção científica. Sempre em busca da próxima grande história.');

    return (
        <div className="py-12 md:py-32 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto space-y-12 md:space-y-20">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-center">
                {/* Avatar */}
                <div className="relative group">
                    <div className="size-32 md:size-40 rounded-full bg-gradient-to-br from-accentTeal via-accentPurple to-blue-500 p-1">
                        <div className="size-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                            <span className="material-symbols-outlined text-5xl text-white/50">person</span>
                        </div>
                    </div>
                    <button className="absolute bottom-0 right-0 size-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-xl">photo_camera</span>
                    </button>
                </div>

                {/* User Info */}
                <div className="flex-1 space-y-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter">Username</h1>
                        <p className="text-zinc-500 font-mono text-sm">user@email.com</p>
                    </div>

                    {/* Bio */}
                    <div className="max-w-xl">
                        {isEditingBio ? (
                            <div className="space-y-2">
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white resize-none focus:border-white outline-none"
                                    rows={3}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsEditingBio(false)}
                                        className="px-4 py-2 rounded-lg bg-white text-black font-bold text-sm hover:scale-105 transition-transform"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setIsEditingBio(false)}
                                        className="px-4 py-2 rounded-lg border border-zinc-700 text-white font-bold text-sm hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p
                                onClick={() => setIsEditingBio(true)}
                                className="text-zinc-400 cursor-pointer hover:text-white transition-colors border-l border-white/10 pl-4"
                            >
                                {bio}
                                <span className="material-symbols-outlined text-sm ml-2 opacity-50">edit</span>
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-lg">calendar_today</span>
                            Member since Jan 2024
                        </span>
                        <span className="size-1 bg-zinc-700 rounded-full"></span>
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-lg text-accentTeal">verified</span>
                            Premium
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="space-y-6">
                <h2 className="text-2xl font-black uppercase tracking-tighter">Viewing Stats</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <StatCard icon="schedule" value="127h" label="Time Watched" color="#2DD4BF" />
                    <StatCard icon="movie" value="84" label="Movies" color="#A855F7" />
                    <StatCard icon="tv" value="312" label="Episodes" color="#3B82F6" />
                    <StatCard icon="check_circle" value="12" label="Series Completed" color="#22C55E" />
                    <StatCard icon="rocket_launch" value="Sci-Fi" label="Favorite Genre" color="#F97316" />
                    <StatCard icon="weekend" value="Sat" label="Most Active Day" color="#EC4899" />
                </div>
            </div>

            {/* Continue Watching */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Continue Watching</h2>
                    <button className="text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                        View All <span className="material-symbols-outlined text-lg">chevron_right</span>
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {CONTINUE_WATCHING.map((item) => (
                        <MediaCardSmall
                            key={item.id}
                            title={item.title}
                            subtitle={item.episode}
                            image={item.image}
                            progress={item.progress}
                        />
                    ))}
                </div>
            </div>

            {/* My List / Favorites */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">My List</h2>
                    <button className="text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
                        View All ({MY_LIST.length}) <span className="material-symbols-outlined text-lg">chevron_right</span>
                    </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {MY_LIST.map((item) => (
                        <MediaCardSmall
                            key={item.id}
                            title={item.title}
                            subtitle={item.type}
                            image={item.image}
                        />
                    ))}
                </div>
            </div>

            {/* Genre Preferences */}
            <div className="space-y-6">
                <h2 className="text-2xl font-black uppercase tracking-tighter">Genre Preferences</h2>
                <div className="bg-card p-6 md:p-8 rounded-[2rem] border border-white/5">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        {/* Donut Chart Placeholder */}
                        <div className="relative size-48 shrink-0">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                {GENRE_DATA.reduce((acc, genre, index) => {
                                    const offset = acc.offset;
                                    const circumference = 2 * Math.PI * 40;
                                    const strokeDasharray = (genre.percentage / 100) * circumference;
                                    acc.elements.push(
                                        <circle
                                            key={genre.name}
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke={genre.color}
                                            strokeWidth="12"
                                            strokeDasharray={`${strokeDasharray} ${circumference}`}
                                            strokeDashoffset={-offset}
                                            className="transition-all duration-500"
                                        />
                                    );
                                    acc.offset = offset + strokeDasharray;
                                    return acc;
                                }, { elements: [] as React.ReactNode[], offset: 0 }).elements}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-2xl font-black">5</div>
                                    <div className="text-xs text-zinc-500">Genres</div>
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                            {GENRE_DATA.map((genre) => (
                                <div key={genre.name} className="flex items-center gap-3">
                                    <div className="size-3 rounded-full" style={{ backgroundColor: genre.color }} />
                                    <span className="text-white font-medium flex-1">{genre.name}</span>
                                    <span className="text-zinc-500 font-mono text-sm">{genre.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Watch History */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Watch History</h2>
                    <button className="text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-lg">delete</span>
                        Clear All
                    </button>
                </div>
                <div className="bg-card rounded-[2rem] border border-white/5 overflow-hidden divide-y divide-zinc-800/50">
                    {WATCH_HISTORY.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors group">
                            <div className="size-16 rounded-xl overflow-hidden bg-zinc-900 shrink-0">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-white truncate">{item.title}</h4>
                                <p className="text-zinc-500 text-sm">{item.type} • {item.watchedAt}</p>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-red-400">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Achievements */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Achievements</h2>
                    <span className="text-sm text-zinc-500 font-mono">
                        {ACHIEVEMENTS.filter(a => a.unlocked).length}/{ACHIEVEMENTS.length} Unlocked
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ACHIEVEMENTS.map((achievement) => (
                        <AchievementBadge key={achievement.id} {...achievement} />
                    ))}
                </div>
            </div>
        </div>
    );
};
