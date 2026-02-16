import { useState, useEffect } from "react";
import { supabase } from "../db/supabase";
import type { Role } from "../types/auth";

export const useUserRole = () => {
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        console.log("user.id");
        console.log(user.id);
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        setRole(data?.role as Role);
      }
    };

    fetchRole();
  }, []);

  return role;
};
