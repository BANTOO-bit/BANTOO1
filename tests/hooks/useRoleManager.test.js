import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRoleManager } from '../../src/hooks/useRoleManager';
import { authService } from '../../src/services/authService';

// Mock dependencies
vi.mock('../../src/services/authService', () => ({
    authService: {
        setDriverOffline: vi.fn(),
        updateActiveRole: vi.fn(),
    }
}));

describe('useRoleManager', () => {
    let mockRefreshProfile;
    let mockUser;

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        sessionStorage.clear();

        mockRefreshProfile = vi.fn();
        mockUser = {
            id: 'test-user-123',
            roles: ['customer', 'driver', 'merchant'],
            activeRole: 'customer'
        };
    });

    it('should correctly identify if user has a specific role', () => {
        const { result } = renderHook(() => useRoleManager(mockUser, mockRefreshProfile));

        expect(result.current.hasRole('customer')).toBe(true);
        expect(result.current.hasRole('driver')).toBe(true);
        expect(result.current.hasRole('admin')).toBe(false);
    });

    it('should handle unauthenticated state gracefully', async () => {
        const { result } = renderHook(() => useRoleManager(null, mockRefreshProfile));

        expect(result.current.hasRole('customer')).toBe(false);
        await expect(result.current.switchRole('customer')).rejects.toThrow('Not authenticated');
    });

    it('should successfully switch role if user has permission', async () => {
        const { result } = renderHook(() => useRoleManager(mockUser, mockRefreshProfile));

        await act(async () => {
            await result.current.switchRole('merchant');
        });

        expect(localStorage.getItem('user_last_active_role')).toBe('merchant');
        expect(authService.updateActiveRole).toHaveBeenCalledWith('test-user-123', 'merchant');
        expect(mockRefreshProfile).toHaveBeenCalledOnce();
    });

    it('should throw error if switching to unauthorized role', async () => {
        const { result } = renderHook(() => useRoleManager(mockUser, mockRefreshProfile));

        await expect(result.current.switchRole('admin')).rejects.toThrow('User does not have role: admin');
        expect(authService.updateActiveRole).not.toHaveBeenCalled();
    });

    it('should block admin role switching', async () => {
        const adminUser = { ...mockUser, roles: ['admin', 'customer'], activeRole: 'admin' };
        const { result } = renderHook(() => useRoleManager(adminUser, mockRefreshProfile));

        await expect(result.current.switchRole('customer')).rejects.toThrow('Admin role is locked. Cannot switch roles.');
    });

    it('should auto-offline driver when switching AWAY from driver role', async () => {
        const driverUser = { ...mockUser, activeRole: 'driver' };
        sessionStorage.setItem('driver_isOnline', 'true');

        const { result } = renderHook(() => useRoleManager(driverUser, mockRefreshProfile));

        await act(async () => {
            await result.current.switchRole('customer');
        });

        expect(authService.setDriverOffline).toHaveBeenCalledWith('test-user-123');
        expect(sessionStorage.getItem('driver_isOnline')).toBeNull();
    });

    it('should auto-offline driver when switching TO driver role', async () => {
        // This is a safety measure in the original hook to ensure driver starts offline
        const { result } = renderHook(() => useRoleManager(mockUser, mockRefreshProfile));

        await act(async () => {
            await result.current.switchRole('driver');
        });

        expect(authService.setDriverOffline).toHaveBeenCalledWith('test-user-123');
    });
});
