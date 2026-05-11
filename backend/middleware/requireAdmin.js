import { getSupabaseClient } from '../db/supabase.js';

const ADMIN_EMAIL_ALLOWLIST = ['laura.hernandez@payflow.com'];

export default async function requireAdmin(req, res, next) {
  try {
    const email = String(req.user?.email || '').toLowerCase();
    const metadataRole = String(req.user?.user_metadata?.role || '').toLowerCase();

    if (metadataRole === 'admin' || ADMIN_EMAIL_ALLOWLIST.includes(email)) {
      return next();
    }

    if (!email) {
      return res.status(403).json({
        status: 'error',
        message: 'Admin access required',
        statusCode: 403,
      });
    }

    const supabase = getSupabaseClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('email', email)
      .eq('is_active', true)
      .maybeSingle();

    if (!error && user?.role === 'Admin') {
      return next();
    }

    return res.status(403).json({
      status: 'error',
      message: 'Admin access required',
      statusCode: 403,
    });
  } catch (error) {
    return res.status(403).json({
      status: 'error',
      message: 'Admin access required',
      statusCode: 403,
    });
  }
}