import { authService } from '@/services/authService';

export function useRoleManager(user, refreshProfile) {
    const switchRole = async (newRole) => {
        if (!user) throw new Error('Not authenticated');
        if (user.roles.includes('admin')) throw new Error('Admin role is locked. Cannot switch roles.');
        if (!user.roles.includes(newRole)) throw new Error(`User does not have role: ${newRole}`);

        // Auto-offline driver when switching away/to driver
        if (user.activeRole === 'driver' || newRole === 'driver') {
            try {
                await authService.setDriverOffline(user.id);
                sessionStorage.removeItem('driver_isOnline');
            } catch (e) {
                console.warn('Failed to auto-offline driver on role switch:', e);
            }
        }

        localStorage.setItem('user_last_active_role', newRole);
        await authService.updateActiveRole(user.id, newRole);
        await refreshProfile();
    };

    const hasRole = (roleName) => user?.roles?.includes(roleName) || false;

    return {
        switchRole,
        hasRole
    };
}
