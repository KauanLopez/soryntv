import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { tmdb, getImageUrl } from '@/lib/tmdb';

type Step = 'movie' | 'series' | 'music';

const STEPS: Step[] = ['movie', 'series', 'music'];

// Fallback/Mock for Music Only
const MOCK_MUSIC_GENRES = ['Pop', 'Rock', 'Hip Hop', 'R&B', 'Electronic', 'Jazz', 'Classical', 'Indie'];
const MOCK_MUSIC_RESULTS = [
    { id: 101, title: 'The Weeknd', poster_path: null, media_type: 'person', image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300&q=80' },
    { id: 102, title: 'Taylor Swift', poster_path: null, media_type: 'person', image: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=300&q=80' },
    { id: 103, title: 'Kendrick Lamar', poster_path: null, media_type: 'person', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&q=80' },
    { id: 104, title: 'Daft Punk', poster_path: null, media_type: 'person', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80' },
];

export const Onboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [loading, setLoading] = useState(false);

    // Store selections
    const [selectedGenres, setSelectedGenres] = useState<Record<Step, string[]>>({ movie: [], series: [], music: [] });
    const [selectedFavorites, setSelectedFavorites] = useState<Record<Step, any[]>>({ movie: [], series: [], music: [] });

    // Data State
    const [genres, setGenres] = useState<string[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const currentStep = STEPS[currentStepIndex];

    // Fetch Genres and Initial Content
    useEffect(() => {
        const loadData = async () => {
            setSearchResults([]); // Reset results

            if (currentStep === 'movie') {
                const g = await tmdb.getGenres('movie');
                setGenres(g.slice(0, 12).map(g => g.name)); // Limit to 12 for UI
                const popular = await tmdb.getPopular('movie');
                setSearchResults(popular.slice(0, 8));
            } else if (currentStep === 'series') {
                const g = await tmdb.getGenres('tv');
                setGenres(g.slice(0, 12).map(g => g.name));
                const popular = await tmdb.getPopular('tv');
                setSearchResults(popular.slice(0, 8));
            } else {
                setGenres(MOCK_MUSIC_GENRES);
                setSearchResults(MOCK_MUSIC_RESULTS);
            }
        };
        loadData();
    }, [currentStep]);

    // Handle Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (!searchTerm) {
                // If empty, reset to popular (re-trigger loadData logic effectively, or just leave as is if we want to keep previous state)
                if (currentStep === 'movie') {
                    const popular = await tmdb.getPopular('movie');
                    setSearchResults(popular.slice(0, 8));
                } else if (currentStep === 'series') {
                    const popular = await tmdb.getPopular('tv');
                    setSearchResults(popular.slice(0, 8));
                } else {
                    setSearchResults(MOCK_MUSIC_RESULTS.filter(i => i.title.toLowerCase().includes('')));
                }
                return;
            }

            if (currentStep === 'music') {
                setSearchResults(MOCK_MUSIC_RESULTS.filter(i => i.title.toLowerCase().includes(searchTerm.toLowerCase())));
                return;
            }

            // TMDB Search
            const results = await tmdb.searchMulti(searchTerm);
            // Filter by current step type
            const filtered = results.filter(r =>
                (currentStep === 'movie' && r.media_type === 'movie') ||
                (currentStep === 'series' && r.media_type === 'tv')
            );
            setSearchResults(filtered.slice(0, 8));
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, currentStep]);

    const handleGenreToggle = (genre: string) => {
        const current = selectedGenres[currentStep];
        const updated = current.includes(genre)
            ? current.filter(g => g !== genre)
            : [...current, genre];

        setSelectedGenres({ ...selectedGenres, [currentStep]: updated });
    };

    const handleFavoriteToggle = (item: any) => {
        const current = selectedFavorites[currentStep];
        const exists = current.find(i => i.id === item.id);

        if (exists) {
            setSelectedFavorites({ ...selectedFavorites, [currentStep]: current.filter(i => i.id !== item.id) });
        } else {
            if (current.length >= 3) return; // Max 3
            // Normalize item structure for storage
            const normalizedItem = {
                id: item.id,
                title: item.title || item.name,
                image: item.poster_path ? getImageUrl(item.poster_path) : (item.image || '')
            };
            setSelectedFavorites({ ...selectedFavorites, [currentStep]: [...current, normalizedItem] });
        }
    };

    const handleNext = async () => {
        if (currentStepIndex < STEPS.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
            setSearchTerm('');
        } else {
            // Submit all data
            setLoading(true);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('No user found');

                // 1. Insert Genres
                const genresToInsert = Object.entries(selectedGenres).flatMap(([type, genres]) =>
                    genres.map(genre => ({ user_id: user.id, media_type: type, genre }))
                );
                if (genresToInsert.length > 0) {
                    await supabase.from('user_genres').insert(genresToInsert);
                }

                // 2. Insert Favorites
                const favoritesToInsert = Object.entries(selectedFavorites).flatMap(([type, items]) =>
                    items.map(item => ({
                        user_id: user.id,
                        media_type: type,
                        title: item.title,
                        metadata: { image: item.image, id: item.id }
                    }))
                );
                if (favoritesToInsert.length > 0) {
                    await supabase.from('user_favorites').insert(favoritesToInsert);
                }

                // 3. Update Profile
                await supabase.from('profiles').upsert({ id: user.id, onboarding_completed: true });

                onComplete();
            } catch (error) {
                console.error('Error saving onboarding data:', error);
                alert('Failed to save preferences. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4 md:p-12 overflow-y-auto">
            <div className="w-full max-w-4xl space-y-4 md:space-y-12 animate-in slide-in-from-bottom duration-500">
                {/* Header */}
                <div className="space-y-2 md:space-y-4 text-center">
                    <div className="flex justify-center gap-2 mb-4 md:mb-8">
                        {STEPS.map((step, i) => (
                            <div key={step} className={`h-1 w-8 md:w-12 rounded-full transition-all duration-300 ${i <= currentStepIndex ? 'bg-white' : 'bg-white/10'}`} />
                        ))}
                    </div>
                    <h2 className="text-2xl md:text-6xl font-black uppercase tracking-tighter text-white">
                        {currentStep === 'movie' && 'Favorite Movies'}
                        {currentStep === 'series' && 'Top Series'}
                        {currentStep === 'music' && 'Music Vibes'}
                    </h2>
                    <p className="text-zinc-500 font-mono text-[10px] md:text-xs uppercase tracking-widest">
                        Customize your Soryn experience • Step {currentStepIndex + 1} of 3
                    </p>
                </div>

                {/* Genre Selection */}
                <div className="space-y-3 md:space-y-6">
                    <h3 className="text-[10px] md:text-sm font-black uppercase tracking-widest text-zinc-400">Select Genres</h3>
                    <div className="flex flex-wrap gap-2 md:gap-3">
                        {genres.map(genre => {
                            const isSelected = selectedGenres[currentStep].includes(genre);
                            return (
                                <button
                                    key={genre}
                                    onClick={() => handleGenreToggle(genre)}
                                    className={`px-3 py-1.5 md:px-6 md:py-3 rounded-full border text-[10px] md:text-sm font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 ${isSelected
                                            ? 'bg-white text-black border-white'
                                            : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-white hover:text-white'
                                        }`}
                                >
                                    {genre}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Favorites Search */}
                <div className="space-y-3 md:space-y-6">
                    <div className="flex justify-between items-end">
                        <h3 className="text-[10px] md:text-sm font-black uppercase tracking-widest text-zinc-400">
                            Search Favorites <span className="text-zinc-600">(Max 3)</span>
                        </h3>
                        <span className="text-[10px] md:text-xs font-mono text-accentTeal">{selectedFavorites[currentStep].length}/3 Selected</span>
                    </div>

                    <div className="relative">
                        <span className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-zinc-500 material-symbols-outlined text-sm md:text-base">search</span>
                        <input
                            type="text"
                            placeholder={`Search ${currentStep}s...`}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-900/50 border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-5 pl-10 md:pl-14 pr-6 text-sm md:text-base text-white placeholder:text-zinc-700 focus:outline-none focus:border-white transition-all font-medium"
                        />
                    </div>

                    {/* Results / Selections */}
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
                        {searchResults.map(item => {
                            const isSelected = selectedFavorites[currentStep].find(i => i.id === item.id);
                            // Handle TMDB vs Mock vs Stored Item structure
                            const title = item.title || item.name;
                            const image = item.poster_path ? getImageUrl(item.poster_path) : (item.image || '');

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleFavoriteToggle(item)}
                                    className={`relative aspect-[3/4] rounded-lg md:rounded-xl overflow-hidden group border-2 transition-all ${isSelected ? 'border-accentTeal scale-105' : 'border-transparent hover:border-white/50'}`}
                                >
                                    {image ? (
                                        <img src={image} alt={title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-zinc-700">movie</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-2 md:p-4 flex flex-col justify-end text-left">
                                        <h4 className="font-bold text-[10px] md:text-sm leading-tight line-clamp-2">{title}</h4>
                                        {isSelected && <span className="absolute top-1 right-1 md:top-2 md:right-2 text-accentTeal material-symbols-outlined text-sm md:text-xl bg-black rounded-full">check_circle</span>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex justify-end pt-4 md:pt-8 border-t border-white/5">
                    <button
                        onClick={handleNext}
                        disabled={loading}
                        className="h-10 md:h-16 px-6 md:px-12 rounded-full bg-white text-black text-xs md:text-base font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2 md:gap-3"
                    >
                        {loading ? 'Saving...' : currentStepIndex === STEPS.length - 1 ? 'Finish Setup' : 'Next Step'}
                        {!loading && <span className="material-symbols-outlined text-sm md:text-base">arrow_forward</span>}
                    </button>
                </div>
            </div>
        </div>
    );
};
