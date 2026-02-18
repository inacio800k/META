import { useAuth } from '@/contexts/AuthContext';
import { Role } from '@/types';
import { useCallback } from 'react';

type Permission = 'add_value' | 'send_message' | 'view_admin_panel';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    admin: ['add_value', 'send_message', 'view_admin_panel'],
    operador: ['add_value'],
    vendedor: ['send_message'],
};

export const usePermission = () => {
    const { user, loading } = useAuth();

    const hasPermission = useCallback((permission: Permission): boolean => {
        if (!user) return false;
        return ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
    }, [user]);

    const isRole = useCallback((role: Role): boolean => {
        return user?.role === role;
    }, [user]);

    const hasRole = useCallback((roles: Role[]): boolean => {
        return user ? roles.includes(user.role) : false;
    }, [user]);

    return { hasPermission, isRole, hasRole, user, loading };
};
