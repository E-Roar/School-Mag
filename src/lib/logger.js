import { supabase } from './supabaseClient';

export const logActivity = async (action, details = {}) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from('activity_logs').insert({
            user_id: user.id,
            action,
            details
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};
