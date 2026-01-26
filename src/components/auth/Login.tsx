import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                // Ideally show a message to check email, but for now we auto-login if disabled email verification or just show success
                if (!error) alert('Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
            <div className="w-full max-w-md glass rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

                <div className="relative z-10 space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-4xl font-black uppercase tracking-tighter text-white">
                            {isSignUp ? 'Join Soryn' : 'Welcome Back'}
                        </h2>
                        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
                            {isSignUp ? 'Create your command center' : 'Enter your credentials'}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono p-4 rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative group">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors material-symbols-outlined text-[20px]">mail</span>
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-full py-4 pl-14 pr-6 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white focus:bg-black/60 transition-all font-medium"
                                    required
                                />
                            </div>
                            <div className="relative group">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors material-symbols-outlined text-[20px]">lock</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-full py-4 pl-14 pr-14 text-white placeholder:text-zinc-600 focus:outline-none focus:border-white focus:bg-black/60 transition-all font-medium"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs font-medium text-zinc-400 px-2">
                            <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                                <input type="checkbox" className="rounded border-zinc-700 bg-zinc-900 focus:ring-offset-0 focus:ring-0 w-4 h-4 accent-white" />
                                <span>Remember me</span>
                            </label>
                            {!isSignUp && (
                                <button type="button" className="hover:text-white transition-colors uppercase tracking-wider font-bold">
                                    Forgot Password?
                                </button>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 rounded-full bg-white text-black font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="size-5 border-2 border-zinc-300 border-t-black rounded-full animate-spin"></span>
                            ) : (
                                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-4 border-t border-white/5">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-zinc-500 text-xs font-mono uppercase tracking-widest hover:text-white transition-colors"
                        >
                            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
