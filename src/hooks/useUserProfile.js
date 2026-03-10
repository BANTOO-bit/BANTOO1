import { useState, useRef, useCallback, useEffect } from 'react';
import { authService } from '@/services/authService';
import { TIMEOUTS } from '@/config/constants';

export function useUserProfile(user, onLogout) {
    const [fullUser, setFullUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const isRefreshing = useRef(false);

    const refreshProfile = useCallback(async (passedUser = null) => {
        if (isRefreshing.current) return;
        isRefreshing.current = true;

        try {
            let authUser = passedUser || user;

            if (!authUser) {
                const { data, error } = await authService.getUser();
                if (error || !data.user) return;
                authUser = data.user;
            }

            const userId = authUser.id;

            // Fetch all profile data via service
            const { profile, userRoles, merchant, driver, wallet } = await authService.refreshUserProfile(userId);

            // Provide fallback if user_roles fails
            if (userRoles.error) {
                if (import.meta.env.DEV && userRoles.error.code !== '404' && !userRoles.error.message?.includes('404')) {
                    console.debug('[useUserProfile] user_roles fetch skipped:', userRoles.error.message);
                }
            }

            // Extract and derive roles
            const isAdmin = profile.data?.role === 'admin';
            let roles = userRoles.data?.map(r => r.role) || [];

            if (isAdmin) {
                // Admin is standalone — no customer/merchant/driver roles
                roles = ['admin'];
            } else {
                if (!roles.includes('customer')) roles.push('customer');
                if (driver.data?.status === 'approved' && !roles.includes('driver')) roles.push('driver');
                if (merchant.data?.status === 'approved' && !roles.includes('merchant')) roles.push('merchant');
                roles = [...new Set(roles)];
            }

            // Determine active role (admin is always locked to 'admin')
            let determinedRole = isAdmin ? 'admin' : null;
            
            // Fix Role Revert Bug: We trust localStorage more if it exists and is valid. 
            // This prevents race conditions where DB fetch returns old 'customer' status just after switching.
            const savedRole = localStorage.getItem('user_last_active_role');
            
            if (!determinedRole && savedRole && roles.includes(savedRole)) {
                determinedRole = savedRole; // Trust local state first 
            } else if (!determinedRole && profile.data?.active_role && roles.includes(profile.data.active_role)) {
                determinedRole = profile.data.active_role; // Fallback to DB
            }
            
            const activeRole = determinedRole || (
                roles.includes('admin') ? 'admin' :
                    roles.includes('merchant') ? 'merchant' :
                        roles.includes('driver') ? 'driver' : 'customer'
            );

            localStorage.setItem('user_last_active_role', activeRole);

            const userWithRole = {
                ...authUser,
                fullName: profile.data?.full_name || authUser.user_metadata?.full_name,
                phone: profile.data?.phone || authUser.user_metadata?.phone_number,
                avatarUrl: profile.data?.avatar_url,
                roles,
                activeRole,
                role: activeRole, // Legacy prop
                merchantStatus: merchant.data?.status || null,
                merchantId: merchant.data?.id || null,
                merchantName: merchant.data?.name || null,
                driverStatus: driver.data?.status || null,
                driverId: driver.data?.id || null,
                walletBalance: wallet.data?.balance || 0,
                isMerchant: roles.includes('merchant') && merchant.data?.status === 'approved',
                isDriver: roles.includes('driver') && driver.data?.status === 'approved',
                isAdmin: roles.includes('admin'),
                hasPendingMerchant: merchant.data?.status === 'pending',
                hasPendingDriver: driver.data?.status === 'pending'
            };

            setFullUser(userWithRole);
            setIsAuthenticated(true);
        } catch (err) {
            console.error('Error refreshing profile:', err);
        } finally {
            isRefreshing.current = false;
        }
    }, [user]);

    // Realtime profile changes (multi-device awareness)
    // No periodic polling needed — realtime subscription handles updates
    useEffect(() => {
        if (!fullUser?.id) return;
        const cleanup = authService.subscribeToProfileChanges(fullUser.id, async (payload) => {
            const updated = payload.new;
            if (updated.status === 'terminated' || updated.status === 'suspended') {
                await onLogout();
                return;
            }
            await refreshProfile();
        });
        return cleanup;
    }, [fullUser?.id, refreshProfile, onLogout]);

    const clearProfile = useCallback(() => {
        setFullUser(null);
        setIsAuthenticated(false);
    }, []);

    return {
        fullUser,
        setFullUser,
        isAuthenticated,
        refreshProfile,
        clearProfile
    };
}
