import { supabase } from "../db/supabase";

/**
 * Fetches the role name from a permissionId (roleId) in the permissions table.
 * Returns the role name or a fallback if not found.
 */
export const roleNameFromPermissionId = async (
  permissionId: string | null | undefined,
): Promise<string> => {
  if (!permissionId) return "-";
  const { data, error } = await supabase
    .from("permissions")
    .select("name")
    .eq("id", permissionId)
    .single();
  if (error || !data?.name) return "-";
  return data.name;
};
