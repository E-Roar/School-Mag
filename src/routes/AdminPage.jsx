import { useEffect, useMemo, useState } from "react";
import { SceneLayout } from "../components/SceneLayout";
import { UI } from "../components/UI";
import { Dashboard } from "../components/Dashboard";
import { AdminIssuePicker } from "../components/AdminIssuePicker";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";

const LoginPanel = ({ onAuthenticated, error, loading }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onAuthenticated(email, password);
  };

  return (
    <div className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl bg-slate-900/90 border border-white/10 p-8 shadow-2xl flex flex-col gap-4"
      >
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">
            Admin Access
          </p>
          <h2 className="text-2xl font-semibold text-white">Sign in</h2>
        </div>
        <label className="text-sm text-white/70">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-2xl bg-white/10 px-4 py-2 text-white outline-none border border-white/10 focus:border-white/40"
            autoComplete="username"
            required
          />
        </label>
        <label className="text-sm text-white/70">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-2xl bg-white/10 px-4 py-2 text-white outline-none border border-white/10 focus:border-white/40"
            autoComplete="current-password"
            required
          />
        </label>
        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/50 rounded-2xl px-3 py-2">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-white text-black py-2 font-semibold uppercase tracking-wider hover:bg-white/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
        <p className="text-xs text-white/60">
          Only administrators with existing credentials may sign in. Contact IT
          if you need access.
        </p>
        {error && (
          <button
            type="button"
            onClick={async () => {
              if (supabase) await supabase.auth.signOut();
              window.location.reload();
            }}
            className="mt-4 text-xs text-red-300 hover:text-red-200 underline"
          >
            Force Logout / Clear Session
          </button>
        )}
      </form>
    </div>
  );
};

export const AdminPage = () => {
  const [isAuthed, setIsAuthed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }

      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          setIsAuthed(false);
          setLoading(false);
          return;
        }

        // Check if user is admin
        if (session?.user) {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError) {
            console.error("User fetch error:", userError);
            // Don't sign out immediately on network error, just fail auth check
            setIsAuthed(false);
            setLoading(false);
            return;
          }

          // Check both app_metadata and user_metadata for role
          const role = user?.app_metadata?.role || user?.user_metadata?.role;

          // Debug log
          if (process.env.NODE_ENV === "development") {
            console.log("Session check - User metadata:", {
              app_metadata: user?.app_metadata,
              user_metadata: user?.user_metadata,
              role,
            });
          }

          if (role === "admin") {
            setIsAuthed(true);
          } else {
            console.warn("User does not have admin role:", role);
            // If we have a session but no admin role, we should probably show an error
            // rather than silently signing out, which can be confusing.
            // But for security, we shouldn't show the admin UI.
            setIsAuthed(false);
            setError(`Logged in as ${user.email} but not an admin (Role: ${role || 'None'}).`);
            // We do NOT sign out here automatically to avoid loops.
            // The user can click "Logout" if they want to switch accounts.
          }
        } else {
          setIsAuthed(false);
        }
      } catch (err) {
        console.error("Session check error:", err);
        setIsAuthed(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes (only if Supabase is configured)
    let subscription = null;
    if (isSupabaseConfigured && supabase) {
      try {
        const authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === "SIGNED_IN" && session) {
            try {
              const {
                data: { user },
              } = await supabase.auth.getUser();
              const role = user?.app_metadata?.role || user?.user_metadata?.role;
              setIsAuthed(role === "admin");
            } catch (err) {
              console.error("Error checking user role:", err);
              setIsAuthed(false);
            }
          } else if (event === "SIGNED_OUT") {
            setIsAuthed(false);
          }
        });
        subscription = authSubscription?.data?.subscription;
      } catch (err) {
        console.error("Error setting up auth listener:", err);
      }
    }

    return () => {
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    };
  }, []);

  const handleAuth = async (email, password) => {
    setError("");
    setLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      // Fallback to mock auth if Supabase not configured
      const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "admin@school.edu";
      const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "supersecure";
      if (
        email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
        password === ADMIN_PASSWORD
      ) {
        setIsAuthed(true);
      } else {
        setError("Invalid credentials");
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) throw authError;

      // Verify admin role
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      // Check both app_metadata and user_metadata for role
      // Also check if role is nested differently
      const appMetadataRole = user?.app_metadata?.role;
      const userMetadataRole = user?.user_metadata?.role;
      const role = appMetadataRole || userMetadataRole;

      // Debug: Log user metadata to help troubleshoot
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 Full User Object:", user);
        console.log("📋 User metadata breakdown:", {
          app_metadata: user?.app_metadata,
          user_metadata: user?.user_metadata,
          app_metadata_role: appMetadataRole,
          user_metadata_role: userMetadataRole,
          raw_app_meta_data: user?.raw_app_meta_data,
          computed_role: role,
          user_id: user?.id,
          email: user?.email,
        });

        // Show the full structure of app_metadata and user_metadata
        console.log("📦 app_metadata full content:", JSON.stringify(user?.app_metadata, null, 2));
        console.log("📦 user_metadata full content:", JSON.stringify(user?.user_metadata, null, 2));
      }

      // TEMPORARY: Allow any authenticated user for testing (REMOVE IN PRODUCTION!)
      // Set this to true to bypass role check for testing:
      const TEMP_BYPASS_ROLE_CHECK = false; // Change to true to allow any authenticated user
      const allowTemporaryAccess = TEMP_BYPASS_ROLE_CHECK && process.env.NODE_ENV === "development" && user?.id;

      if (role === "admin" || allowTemporaryAccess) {
        setIsAuthed(true);
        setError("");
      } else {
        // Clear any existing session
        await supabase.auth.signOut();
        setError(
          `Access denied. Admin role required. Current role: ${role || "none"}. ` +
          `\n\nTo fix this:\n1. Run this SQL in Supabase Dashboard > SQL Editor:\n` +
          `UPDATE auth.users SET raw_app_meta_data = jsonb_set(COALESCE(raw_app_meta_data, '{}'::jsonb), '{role}', '"admin"') WHERE email = '${user?.email}';\n` +
          `UPDATE auth.users SET raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"admin"') WHERE email = '${user?.email}';\n` +
          `\n2. Clear browser storage and sign in again.`
        );
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || "Invalid credentials");
      setIsAuthed(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthed(false);
  };

  const overlays = useMemo(
    () => (
      <>
        <UI />
        {isAuthed && (
          <>
            <AdminIssuePicker />
            <Dashboard />
          </>
        )}
        {!isAuthed && !loading && (
          <LoginPanel onAuthenticated={handleAuth} error={error} loading={loading} />
        )}
        {isAuthed && (
          <button
            onClick={handleLogout}
            className="pointer-events-auto fixed top-6 right-6 z-50 rounded-full bg-red-500/20 text-red-200 border border-red-500/50 px-4 py-2 text-xs uppercase tracking-widest hover:bg-red-500/30 transition shadow-neon"
          >
            Logout
          </button>
        )}
      </>
    ),
    [isAuthed, error, loading]
  );

  return <SceneLayout>{overlays}</SceneLayout>;
};


