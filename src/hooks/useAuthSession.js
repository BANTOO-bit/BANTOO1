import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';

export function useAuthSession(onSessionUpdate, onSessionClear) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const initAuth = async () => {
            try {
                const { data, error } = await authService.getSession();
                if (error) throw error;
                if (data?.session && isMounted) {
                    await onSessionUpdate(data.session.user);
                }
            } catch (error) {
                // Silent catch for initial session fetch failure
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = authService.onAuthStateChange(async (_event, session) => {
            if (!isMounted) return;
            if (_event === 'INITIAL_SESSION') return;

            if (session) {
                await onSessionUpdate(session.user);
            } else {
                await onSessionClear();
            }
            setLoading(false);
        });

        return () => {
            isMounted = false;
            subscription?.unsubscribe();
        };
    }, [onSessionUpdate, onSessionClear]);

    return { loading };
}
