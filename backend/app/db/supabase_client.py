import logging
from typing import Optional
from app.config import settings

logger = logging.getLogger("finpilot.supabase")

_supabase_anon_client = None
_supabase_admin_client = None

def get_supabase_client():
    """Returns the standard Supabase client (using anon key) for user-context operations."""
    global _supabase_anon_client
    if _supabase_anon_client is not None:
        return _supabase_anon_client

    if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
        logger.warning("SUPABASE_URL or SUPABASE_ANON_KEY not set. Operating in local DB fallback mode.")
        return None

    try:
        from supabase import create_client
        _supabase_anon_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
        return _supabase_anon_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase anon client: {e}")
        return None

def get_supabase_admin():
    """Returns the privileged Supabase admin client (using service role key). NEVER expose to frontend."""
    global _supabase_admin_client
    if _supabase_admin_client is not None:
        return _supabase_admin_client

    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        logger.warning("SUPABASE_SERVICE_ROLE_KEY not set. Administrative operations will use local DB/API fallback.")
        return None

    try:
        from supabase import create_client
        _supabase_admin_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        return _supabase_admin_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase admin client: {e}")
        return None

def is_supabase_configured() -> bool:
    """Returns True if Supabase credentials are populated."""
    return bool(settings.SUPABASE_URL and (settings.SUPABASE_ANON_KEY or settings.SUPABASE_SERVICE_ROLE_KEY))
