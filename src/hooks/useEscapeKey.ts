import { useEffect } from 'react';

/**
 * Hook to handle escape key press
 * @param callback - Function to call when Escape key is pressed
 */
export function useEscapeKey(callback: () => void): void {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                callback();
            }
        };

        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [callback]);
}
