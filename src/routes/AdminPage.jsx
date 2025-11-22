import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabaseClient";
import { BookDataProvider } from "../context/BookDataContext";
import { AdminDashboard } from "./AdminDashboard";
import { LoginPanel } from "../components/LoginPanel";

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
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          setIsAuthed(false);
          setLoading(false);
          return;
        }

        if (session?.user) {
          const { data: { user }, error: userError } = await supabase.auth.getUser();

          if (userError) {
            console.error("User fetch error:", userError);
            setIsAuthed(false);
            setLoading(false);
            return;
          }

          const role = user?.app_metadata?.role || user?.user_metadata?.role;

          if (role === "admin") {
            setIsAuthed(true);
          } else {
            console.warn("User does not have admin role:", role);
            setIsAuthed(false);
            setError(`Logged in as ${user.email} but not an admin.`);
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

    let subscription = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          const { data: { user } } = await supabase.auth.getUser();
          const role = user?.app_metadata?.role || user?.user_metadata?.role;
          setIsAuthed(role === "admin");
        } else if (event === "SIGNED_OUT") {
          setIsAuthed(false);
        }
      });
      subscription = data.subscription;
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const handleAuth = async (email, password) => {
    setError("");
    setLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      // Mock auth for dev
      const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "admin@school.edu";
      const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "supersecure";
      if (email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
        setIsAuthed(true);
      } else {
        setError("Invalid credentials");
      }
      setLoading(false);
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) throw authError;

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const role = user?.app_metadata?.role || user?.user_metadata?.role;

      if (role === "admin") {
        setIsAuthed(true);
        setError("");
      } else {
        await supabase.auth.signOut();
        setError(`Access denied. Admin role required.`);
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || "Invalid credentials");
      setIsAuthed(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading Admin Panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return <LoginPanel onAuthenticated={handleAuth} error={error} loading={loading} />;
  }

  return (
    <BookDataProvider isAdminMode={true}>
      <AdminDashboard />
    </BookDataProvider>
  );
};



