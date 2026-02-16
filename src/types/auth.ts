import type { AuthResponse, Session } from "@supabase/supabase-js";

export interface AuthContextType {
  session: Session | null;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    success: boolean;
    data?: AuthResponse["data"];
    error?: unknown;
  }>;
  signOut: () => Promise<void>;
  loadingPage: boolean;
  setLoadingPage: React.Dispatch<React.SetStateAction<boolean>>;
}

export type Role = "admin" | "moderator" | "user";
