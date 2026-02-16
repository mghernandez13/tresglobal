import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { supabase } from "../../db/supabase";
import Swal from "sweetalert2";
import type { Session } from "@supabase/supabase-js";
import type { AuthContextType } from "../../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingPage, setLoadingPage] = useState<boolean>(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);

      setLoadingPage(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // if (event === "SIGNED_OUT") {
      //   Swal.fire({
      //     icon: "error",
      //     title: "Session expired",
      //     text: `Session has expired, please relogin`,
      //   });
      //   setSession(null);
      // }

      setSession(session);

      setLoadingPage(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error.message;
      }

      const userRole = data.user?.app_metadata.role;
      if (userRole !== "admin") {
        setSession(null);
        return { success: false, error: "You have no access to this portal" };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Swal.fire({
        icon: "error",
        title: "Log out",
        text: `Error occurred while trying to log out: ${error}`,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{ session, signIn, signOut, loadingPage, setLoadingPage }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("UserAuth must be used within an AuthContextProvider");
  }
  return useContext(AuthContext) as AuthContextType;
};
