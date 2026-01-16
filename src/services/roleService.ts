import { supabase } from '../lib/supabase';
import { UserRole } from '../store/authStore';

export interface RolePermissions {
    canCreatePets: boolean;
    canEditPets: boolean;
    canDeletePets: boolean;
    canManageUsers: boolean;
    canViewAnalytics: boolean;
    canModerateContent: boolean;
}

export const getDefaultPermissions = (role: UserRole): RolePermissions => {
    if (role === 'admin') {
        return {
            canCreatePets: true,
            canEditPets: true,
            canDeletePets: true,
            canManageUsers: true,
            canViewAnalytics: true,
            canModerateContent: true,
        };
    }

    return {
        canCreatePets: false,
        canEditPets: false,
        canDeletePets: false,
        canManageUsers: false,
        canViewAnalytics: false,
        canModerateContent: false,
    };
};

export const updateUserRoleInSupabase = async (userId: string, role: UserRole): Promise<void> => {
    const permissions = getDefaultPermissions(role);

    const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
            role,
            permissions,
            lastUpdated: new Date().toISOString()
        }
    });

    if (error) throw error;
};

export const getUserRoleFromSupabase = async (userId: string): Promise<UserRole> => {
    const { data, error } = await supabase.auth.admin.getUserById(userId);

    if (error) throw error;

    return data.user?.user_metadata?.role || 'user';
};

export const isUserAdmin = async (userId: string): Promise<boolean> => {
    const role = await getUserRoleFromSupabase(userId);
    return role === 'admin';
};

export const validateUserRole = (role: string): UserRole => {
    if (role === 'admin' || role === 'user') {
        return role;
    }
    return 'user';
};

export default {
    getDefaultPermissions,
    updateUserRoleInSupabase,
    getUserRoleFromSupabase,
    isUserAdmin,
    validateUserRole
};