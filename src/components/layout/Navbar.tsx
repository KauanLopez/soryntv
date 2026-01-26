import React, { useState, useRef, useEffect } from 'react';
import type { NavbarProps, ViewType } from '@/types';
import { NAV_LINKS } from '@/constants/mediaData';
import { supabase } from '@/lib/supabase';

interface ProfileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (view: ViewType) => void;
    onLogout: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ isOpen, onClose, onNavigate, onLogout }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const menuItems = [
        { id: 'profile', label: 'Profile', icon: 'person' },
        { id: 'sources', label: 'Sources', icon: 'source' },
        { id: 'settings', label: 'Settings', icon: 'settings' },
    ];

    return (
        <div
            ref={menuRef}
            className="absolute top-full right-0 mt-4 w-56 glass rounded-3xl p-2 shadow-2xl border border-white/10 animate-in fade-in slide-in-from-top-2 duration-200"
        >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-white/10 mb-2">
                <p className="text-sm font-bold text-white">Username</p>
                <p className="text-xs text-white/50 font-mono">user@email.com</p>
            </div>

            {/* Menu Items */}
            <div className="space-y-1">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            if (item.id === 'sources' || item.id === 'settings' || item.id === 'profile') {
                                onNavigate(item.id as ViewType);
                            }
                            onClose();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all group"
                    >
                        <span className="material-symbols-outlined text-[20px] text-white/50 group-hover:text-white transition-colors">
                            {item.icon}
                        </span>
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 my-2"></div>

            {/* Logout */}
            <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all group"
            >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                Logout
            </button>
        </div>
    );
};

export const Navbar: React.FC<NavbarProps> = ({ active, onNavigate }) => {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    return (
        <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] md:w-auto max-w-7xl">
            <div className="glass rounded-full p-1.5 flex items-center gap-1 shadow-2xl overflow-visible">
                <div className="px-4 md:px-6 py-2 shrink-0 md:mr-4">
                    <span className="font-bold text-lg tracking-tight">SORYN</span>
                </div>
                <nav className="flex items-center flex-1 overflow-x-auto scrollbar-hide mask-fade-edges md:mask-none gap-1">
                    {NAV_LINKS.map((link) => (
                        <button
                            key={link.id}
                            onClick={() => onNavigate(link.id as ViewType)}
                            className={`px-4 md:px-6 py-2 rounded-full text-xs md:text-sm font-bold uppercase tracking-wide transition-all whitespace-nowrap shrink-0 ${link.id === 'music' ? 'hidden md:flex' : ''
                                } ${active === link.id
                                    ? 'bg-white text-black'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {link.label}
                        </button>
                    ))}
                </nav>
                <div className="flex items-center gap-2 pl-2 md:pl-4 pr-1 shrink-0 relative">
                    <button className="size-8 md:size-10 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined text-[18px] md:text-[20px]">search</span>
                    </button>
                    <button
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className={`size-8 md:size-10 rounded-full border-2 overflow-hidden bg-zinc-800 transition-all ${isProfileMenuOpen ? 'border-white scale-105' : 'border-white/20 hover:border-white/40'}`}
                    >
                        <img src="https://picsum.photos/seed/user/100/100" alt="Avatar" className="w-full h-full object-cover" />
                    </button>
                    <ProfileMenu
                        isOpen={isProfileMenuOpen}
                        onClose={() => setIsProfileMenuOpen(false)}
                        onNavigate={onNavigate}
                        onLogout={handleLogout}
                    />
                </div>
            </div>
        </header>
    );
};
