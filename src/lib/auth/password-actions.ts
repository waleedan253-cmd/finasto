"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
});
const passwordSchema = z.object({ password: z.string().min(8).max(72) });

export async function requestResetAction(
  input: unknown,
): Promise<{ ok: true } | { error: string }> {
  const parsed = emailSchema.safeParse(input);
  if (!parsed.success) return { error: "Enter a valid email." };

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email: parsed.data.email,
    });

    // Unknown email -> silently do nothing (prevents account enumeration)
    if (!error && data?.properties?.hashed_token) {
      const link = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?token_hash=${data.properties.hashed_token}&type=recovery`;
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: parsed.data.email,
        subject: "Reset your Finasto password",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;background:#FBF7F1;color:#321E18">
            <h2 style="margin:0 0 12px">Reset your password</h2>
            <p style="font-size:15px;line-height:1.6">We received a request to reset your Finasto password. This link expires in 1 hour.</p>
            <p style="margin:28px 0">
              <a href="${link}" style="background:#321E18;color:#FBF7F1;padding:14px 28px;border-radius:999px;text-decoration:none;font-size:15px">Reset password</a>
            </p>
            <p style="font-size:13px;color:#7A6E66">If you didn't request this, you can ignore this email.</p>
          </div>`,
      });
    }
  } catch (e) {
    console.error("requestResetAction failed", e);
  }
  // Same response whether or not the account exists
  return { ok: true };
}

export async function updatePasswordAction(
  input: unknown,
): Promise<{ error: string } | void> {
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success)
    return { error: "Password must be at least 8 characters." };

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "Reset link expired. Request a new one." };

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return { error: "Could not update password. Try again." };

  await supabase.auth.signOut();
  redirect("/login");
}
