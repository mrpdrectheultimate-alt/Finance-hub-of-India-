import { createServiceClient } from "@/lib/supabase";

// ─── Enroll user in welcome sequence (call after signup) ──────
export async function enrollWelcomeSequence(userId: string) {
  const supabase = createServiceClient();
  const seqId    = "11111111-0001-0001-0001-000000000001";

  await supabase.from("user_email_sequence_state").upsert({
    user_id:      userId,
    sequence_id:  seqId,
    current_step: 0,
    enrolled_at:  new Date().toISOString(),
    next_send_at: new Date().toISOString(), // send first email immediately
  }, { onConflict: "user_id,sequence_id" });
}
