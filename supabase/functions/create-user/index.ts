import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Get the JWT from the request headers
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    // 2. Initialize the Admin Client using the SERVICE_ROLE_KEY
    // Note: Do NOT use the user's JWT to initialize this client.
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // 3. Manually verify the user using the token from the header
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid User Session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Proceed with creation logic...
    const {
      email,
      password,
      firstName,
      lastName,
      permissionId,
      avatarUrl,
      isQuotaBased,
      upline,
      isActive,
    } = await req.json();

    // Fetch permissions array from permissions table
    let permissionsArray = [];
    if (permissionId) {
      const { data: permData, error: permError } = await supabaseAdmin
        .from("permissions")
        .select("permissions")
        .eq("id", permissionId)
        .single();
      if (permError) {
        return new Response(JSON.stringify({ error: permError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      permissionsArray = permData?.permissions || [];
    }

    const { data, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          permission_id: permissionId,
          is_quota_based: isQuotaBased,
          avatar_url: avatarUrl,
          upline: upline,
          permissions: permissionsArray,
          status: isActive,
          is_archive: false,
        },
      });

    if (createError) throw createError;

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
