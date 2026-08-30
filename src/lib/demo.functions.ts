import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const roleSchema = z.object({ role: z.enum(["admin", "pengasuhan"]) });

/**
 * Returns credentials for a development/demo account, creating the auth user
 * and its role row on first use. Sign-in itself still goes through normal auth.
 */
export const getDemoCredentials = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => roleSchema.parse(data))
  .handler(async ({ data }) => {
    const isAdmin = data.role === "admin";
    const email = isAdmin
      ? (process.env["DEMO_ADMIN_EMAIL"] ?? "admin.demo@santrios.app")
      : (process.env["DEMO_PENGASUHAN_EMAIL"] ?? "pengasuhan.demo@santrios.app");
    const password = isAdmin
      ? (process.env["DEMO_ADMIN_PASSWORD"] ?? "SantriOS#Admin2026")
      : (process.env["DEMO_PENGASUHAN_PASSWORD"] ?? "SantriOS#Asuh2026");
    const fullName = isAdmin ? "Admin Demo" : "Pengasuhan Demo";

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
    let userId = list?.users.find((u) => u.email === email)?.id;

    if (!userId) {
      const created = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });
      if (created.error) throw new Error(created.error.message);
      userId = created.data.user?.id;
    } else {
      await supabaseAdmin.auth.admin.updateUserById(userId, { password });
    }

    if (!userId) throw new Error("Akun demo gagal dibuat.");

    await supabaseAdmin
      .from("profiles")
      .upsert({ id: userId, full_name: fullName, email }, { onConflict: "id" });
    await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: userId, role: data.role }, { onConflict: "user_id,role" });

    return { email, password };
  });
