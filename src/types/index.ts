// View types
export type ViewType = 'home' | 'movies' | 'series' | 'music' | 'sources' | 'settings' | 'profile';

// Media item for discover section
export interface MediaItem {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    type: 'movie' | 'music' | 'live' | 'series';
    tag?: string;
    meta?: string;
}

// Selected media for detail view
export interface Media {
    title: string;
    year?: string;
    duration?: string;
    rating?: string;
    category?: string;
    image: string;
    subtitle?: string;
}

// Component props
export interface NavbarProps {
    active: ViewType;
    onNavigate: (view: ViewType) => void;
}

export interface HeroProps {
    onWatch: () => void;
}

export interface DiscoverMoreProps {
    onSelectMedia: (media: Media) => void;
}

export interface MediaDetailProps {
    media: Media;
    onClose: () => void;
}

// Selected media for full-screen detail page
export interface SelectedMedia {
    id: number;
    type: 'movie' | 'tv';
}

// Source node for sources section
export interface SourceNode {
    name: string;
    status: 'Online' | 'Syncing' | 'Offline';
    type: string;
    icon: string;
    active?: boolean;
    offline?: boolean;
}

export interface UserAddon {
    id: string;            // Database primary key
    addonId: string;       // Stremio ID (e.g., 'org.stremio.cinemeta')
    name: string;          // Cached Name
    logo?: string;         // Cached Logo URL
    version: string;
    transportUrl: string;  // The full installation URL
    installedAt: string;
}
