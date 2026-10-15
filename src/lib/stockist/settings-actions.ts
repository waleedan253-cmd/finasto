"use server";

// Server Action for the stockist Settings page. It:
//   1. re-checks requireRole("stockist"),
//   2. validates every input with zod,
//   3. saves through update_my_stockist_profile(), a database function that
//      finds the stockist from the signed-in user and can write ONLY name,
//      phone, country and region. Email, status, discount rate, notes and
//      the login link cannot be changed from here, whatever the browser sends.
//
// An empty phone / country / region is saved as "not set" (null).

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { isValidPhoneNumber } from "libphonenumber-js";
const profileSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(120),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine(
      (v) => v === "" || isValidPhoneNumber(v),
      "Enter a valid phone number",
    )
    .nullable(),
  country: z.string().trim().max(60).nullable(),
  region: z.string().trim().max(60).nullable(),
});

export type StockistProfileInput = z.infer<typeof profileSchema>;

export type SaveProfileResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function saveMyStockistProfile(
  input: StockistProfileInput,
): Promise<SaveProfileResult> {
  await requireRole("stockist");

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }
  const data = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_my_stockist_profile", {
    p_name: data.name,
    p_phone: data.phone ?? "",
    p_country: data.country ?? "",
    p_region: data.region ?? "",
  });

  if (error) {
    return {
      success: false,
      error: `Could not save your details: ${error.message}`,
    };
  }

  revalidatePath("/stockist/settings");
  revalidatePath("/stockist"); // the top bar shows the name
  return { success: true };
}
