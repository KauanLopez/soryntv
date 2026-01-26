import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="relative z-10 border-t border-white/10 mt-32 pt-16 pb-32 bg-black overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-12">
                <div className="space-y-4">
                    <h2 className="text-3xl font-black uppercase tracking-widest leading-none">SORYN</h2>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">© 2024 SORYN INC. OPERATIONAL</p>
                </div>
                <div className="flex flex-wrap gap-4 md:gap-8 text-xs font-mono font-bold uppercase tracking-widest text-white/50">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms</a>
                    <a href="#" className="hover:text-white transition-colors">Help</a>
                </div>
            </div>
            <div className="absolute bottom-4 left-0 w-full flex justify-center pointer-events-none select-none opacity-5">
                <h1 className="text-[8rem] md:text-[14rem] font-black leading-none tracking-tighter">SORYN</h1>
            </div>
        </footer>
    );
};
