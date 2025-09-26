import { Request, Response } from "express";
import { supabaseAdmin } from "../db";
import { z } from "zod";

const UpdateProfileSchema = z.object({
  firstName: z.string().trim().min(1, "firstName required"),
  lastName: z.string().trim().min(1, "lastName required"),
  dob: z.string().trim().optional().or(z.null()),          // yyyy-mm-dd or null
  bio: z.string().trim().max(160).optional().or(z.null()), // optional short bio
  contactPref: z.enum(["SMS", "CALL"]).optional().or(z.null()),
  newsletter: z.boolean().optional().default(false),
});

function validISODate(s?: string | null) {
  if (!s) return true;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const yyyy = Number(m[1]), mm = Number(m[2]), dd = Number(m[3]);
  if (mm < 1 || mm > 12) return false;
  const dim = new Date(yyyy, mm, 0).getDate();
  return dd >= 1 && dd <= dim;
}

export async function updateMe(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string | undefined;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const parsed = UpdateProfileSchema.safeParse(req.body || {});
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => i.message).join(", ");
      return res.status(400).json({ error: issues || "invalid payload" });
    }
    const { firstName, lastName, dob, bio, contactPref, newsletter } = parsed.data;

    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

    if (!validISODate(dob)) {
      return res.status(400).json({ error: "Invalid DOB format; expected yyyy-mm-dd" });
    }

    // Normalize empties to null
    const upd: any = {
      name: fullName,
      dob: dob || null,
      bio: bio ? bio : null,
      contact_pref: contactPref || null,
      newsletter: Boolean(newsletter),
    };

    const { data, error } = await supabaseAdmin
      .from("users")
      .update(upd)
      .eq("id", userId)
      .select("id, mobile, name, phone, dob, bio, contact_pref, newsletter")
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.json({
      id: data?.id ?? userId,
      mobile: data?.mobile ?? null,
      firstName,
      lastName,
      name: fullName,
      phone: data?.phone ?? null,
      dob: data?.dob ?? null,
      bio: data?.bio ?? null,
      contactPref: data?.contact_pref ?? null,
      newsletter: Boolean(data?.newsletter),
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
}
