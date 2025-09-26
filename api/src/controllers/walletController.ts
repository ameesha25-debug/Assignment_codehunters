import { Request, Response } from "express";
import { supabaseAdmin } from "../db";

export async function getCredit(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string | undefined;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Ensure wallet exists
    await supabaseAdmin
      .from("wallets")
      .upsert({ user_id: userId }, { onConflict: "user_id" });

    const { data, error } = await supabaseAdmin
      .from("wallets")
      .select("balance, refunds, promo, instore")
      .eq("user_id", userId)
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.json({
      balance: data?.balance ?? 0,
      breakdown: {
        refunds: data?.refunds ?? 0,
        lifestyleCredits: data?.promo ?? 0,
        returnToStores: data?.instore ?? 0
      }
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Server error" });
  }
}
