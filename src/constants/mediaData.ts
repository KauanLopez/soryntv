import type { MediaItem, SourceNode } from '@/types';

export const MEDIA_ITEMS: MediaItem[] = [
    {
        id: '1',
        title: 'Oppenheimer',
        subtitle: 'The story of J. Robert Oppenheimer.',
        image: 'https://images.unsplash.com/photo-1485846234645-a62644ef7467?q=80&w=1200',
        type: 'movie',
        tag: 'Trending #1',
    },
    {
        id: '2',
        title: 'After Hours',
        subtitle: 'The Weeknd',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800',
        type: 'music',
        tag: 'Sonic Vibe',
    },
    {
        id: '3',
        title: 'Monaco Grand Prix',
        subtitle: 'Lap 45/78 • Live on ESPN',
        image: 'https://images.unsplash.com/photo-1541890289-b86df5bafd81?q=80&w=800',
        type: 'live',
        tag: 'Live',
    },
    {
        id: '4',
        title: 'Blade Runner 2099',
        subtitle: "The Replicant's Dilemma",
        image: 'https://images.unsplash.com/photo-1605142859862-978be7eba909?q=80&w=1200',
        type: 'series',
        meta: 'S1 E4 • 24m remaining',
    },
    {
        id: '5',
        title: 'Cyberpunk Edgerunners',
        subtitle: 'Chooms fighting in Night City',
        image: 'https://images.unsplash.com/photo-1535498730771-e735b998cd64?q=80&w=800',
        type: 'series',
        tag: 'Anime',
    },
    {
        id: '6',
        title: 'Interstellar',
        subtitle: 'Mankind was born on Earth.',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200',
        type: 'movie',
        tag: 'Classic',
    },
    {
        id: '7',
        title: 'Midnight Jazz',
        subtitle: 'Smooth collection',
        image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=800',
        type: 'music',
        tag: 'Relax',
    },
    {
        id: '8',
        title: 'Formula 1: Drive to Survive',
        subtitle: 'Season 6 Available Now',
        image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1200',
        type: 'series',
        tag: 'Sports',
    },
    {
        id: '9',
        title: 'The Dark Knight',
        subtitle: 'Why so serious?',
        image: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cd4?q=80&w=1200',
        type: 'movie',
        tag: 'Action',
    }
];

export const NAV_LINKS = [
    { id: 'home', label: 'Home' },
    { id: 'movies', label: 'Movies' },
    { id: 'series', label: 'Series' },
    { id: 'music', label: 'Music' },
] as const;

export const SOURCE_NODES: SourceNode[] = [
    { name: 'Cinema Premium', status: 'Online', type: 'M3U', icon: 'movie' },
    { name: 'Sports Direct', status: 'Syncing', type: 'HLS', icon: 'sports_soccer', active: true },
    { name: 'Global News', status: 'Online', type: 'M3U8', icon: 'live_tv' },
    { name: 'Local NAS', status: 'Offline', type: 'DLNA', icon: 'dns', offline: true },
];
