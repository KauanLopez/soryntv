import React, { useState, useCallback, useEffect } from 'react';
import type { ViewType, SelectedMedia } from '@/types';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { DiscoverMore } from '@/components/sections/DiscoverMore';
import { SourcesSection } from '@/components/sections/SourcesSection';
import { SettingsSection } from '@/components/sections/SettingsSection';
import { ProfileSection } from '@/components/sections/ProfileSection';
import { MediaPage } from '@/components/sections/MediaPage';
import { MovieDetailPage } from '@/components/sections/MovieDetailPage';
import { Login } from '@/components/auth/Login';
import { Onboarding } from '@/components/onboarding/Onboarding';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { recommendationsService } from '@/lib/recommendations';
import { TMDBResult } from '@/lib/tmdb';

const App: React.FC = () => {
    const [activeView, setActiveView] = useState<ViewType>('home');
    const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    // Recommendation Data State
    const [heroMovies, setHeroMovies] = useState<TMDBResult[]>([]);
    const [trending, setTrending] = useState<{ movies: TMDBResult[], tv: TMDBResult[] } | null>(null);

    const checkProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('onboarding_completed')
                .eq('id', userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
            }

            if (data) {
                setOnboardingComplete(data.onboarding_completed);
                // If onboarding complete, fetch recommendations
                if (data.onboarding_completed) {
                    try {
                        const recs = await recommendationsService.getHeroRecommendations(userId);
                        setHeroMovies(recs);
                        const trendData = await recommendationsService.getTrending();
                        setTrending(trendData);
                    } catch (recError) {
                        console.error('Error loading recommendations:', recError);
                    }
                }
            } else {
                setOnboardingComplete(false);
            }
        } catch (e) {
            console.error(e);
            setOnboardingComplete(false);
        }
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) {
                checkProfile(session.user.id).then(() => setLoading(false));
            } else {
                setLoading(false);
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                checkProfile(session.user.id);
            } else {
                setOnboardingComplete(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleCloseMedia = useCallback(() => {
        setSelectedMedia(null);
    }, []);

    const handleSelectMedia = useCallback((media: SelectedMedia) => {
        setSelectedMedia(media);
    }, []);

    const handleWatch = () => {
        // Default to a featured movie (this could be dynamic based on hero carousel)
        if (heroMovies.length > 0) {
            setSelectedMedia({ id: heroMovies[0].id, type: 'movie' });
        }
    };

    const handleOnboardingComplete = () => {
        setOnboardingComplete(true);
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <span className="size-10 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
            </div>
        );
    }

    if (!session) {
        return <Login />;
    }

    if (onboardingComplete === false) {
        return <Onboarding onComplete={handleOnboardingComplete} />;
    }

    // Show MovieDetailPage full-screen when media is selected
    if (selectedMedia) {
        return (
            <MovieDetailPage
                media={selectedMedia}
                onClose={handleCloseMedia}
                onSelectMedia={handleSelectMedia}
            />
        );
    }

    return (
        <div className="relative min-h-screen overflow-x-hidden">
            <div className="fixed inset-0 dot-matrix-bg bg-dot-matrix pointer-events-none z-0 opacity-40"></div>
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[50vh] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none z-0"></div>

            <Navbar active={activeView} onNavigate={setActiveView} />

            <main className="relative z-10">
                {activeView === 'home' && (
                    <>
                        <Hero onWatch={handleWatch} movies={heroMovies} />
                        <DiscoverMore onSelectMedia={handleSelectMedia} trending={trending} />
                    </>
                )}

                {activeView === 'sources' && (
                    <SourcesSection />
                )}

                {(activeView === 'movies' || activeView === 'series' || activeView === 'music') && (
                    <div className="min-h-screen bg-page">
                        <MediaPage
                            type={activeView}
                            onSelectMedia={handleSelectMedia}
                        />
                    </div>
                )}

                {activeView === 'settings' && (
                    <SettingsSection />
                )}

                {activeView === 'profile' && (
                    <ProfileSection />
                )}
            </main>

            <Footer />
        </div>
    );
};

export default App;

