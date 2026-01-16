import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { createDefaultAccountsInSupabase } from './demoAuth';
import { UserRole, getDefaultPermissions, validateUserRole } from './roleService';

// Auth service with enhanced role-based functionality

export interface AuthOptions {
  role?: UserRole;
  name?: string;
  permissions?: any;
}

export async function signInWithPassword(email: string, password: string) {
    try {
        const result = await supabase.auth.signInWithPassword({ email, password });
        return result;
    } catch (error) {
        return { data: null, error } as any;
    }
}

export async function signUpWithEmail(email: string, password: string, options?: AuthOptions) {
    try {
        const validatedRole = validateUserRole(options?.role || 'user');
        const permissions = getDefaultPermissions(validatedRole);
        
        const signUpOptions = {
            email,
            password,
            options: {
                data: {
                    name: options?.name || email.split('@')[0],
                    role: validatedRole,
                    permissions,
                    joinDate: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                }
            }
        };

        const result = await supabase.auth.signUp(signUpOptions);
        return result;
    } catch (error) {
        return { data: null, error } as any;
    }
}

export async function signUpAsAdmin(email: string, password: string, name?: string) {
    return signUpWithEmail(email, password, {
        role: 'admin',
        name: name || 'Administrator'
    });
}

export async function signUpAsUser(email: string, password: string, name?: string) {
    return signUpWithEmail(email, password, {
        role: 'user',
        name: name || email.split('@')[0]
    });
}

export async function supabaseSignOut() {
    try {
        const result = await supabase.auth.signOut();
        return result;
    } catch (error) {
        return { error } as any;
    }
}

export async function getSupabaseSession() {
    try {
        const result = await supabase.auth.getSession();
        return result;
    } catch (error) {
        return { data: { session: null }, error } as any;
    }
}

export async function getSupabaseUser() {
    try {
        const result = await supabase.auth.getUser();
        return result;
    } catch (error) {
        return { data: { user: null }, error } as any;
    }
}

export async function supabaseRefreshSession() {
    try {
        const result = await supabase.auth.refreshSession();
        return result;
    } catch (error) {
        return { data: { session: null }, error } as any;
    }
}

export async function updateUserMetadata(userId: string, metadata: any) {
    try {
        const { error } = await supabase.auth.admin.updateUserById(userId, {
            user_metadata: {
                ...metadata,
                lastUpdated: new Date().toISOString()
            }
        });
        
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { error } as any;
    }
}

export async function createSupabaseDefaultAccounts() {
    if (!isSupabaseConfigured) {
        console.debug('createSupabaseDefaultAccounts: supabase not configured, skipping');
        return { skipped: true };
    }

    try {
        const res = await createDefaultAccountsInSupabase(supabase);
        return res;
    } catch (error) {
        console.debug('createSupabaseDefaultAccounts: error', error);
        return { error };
    }
}

export default {
    signInWithPassword,
    signUpWithEmail,
    signUpAsAdmin,
    signUpAsUser,
    supabaseSignOut,
    getSupabaseSession,
    getSupabaseUser,
    supabaseRefreshSession,
    updateUserMetadata,
    createSupabaseDefaultAccounts
};
