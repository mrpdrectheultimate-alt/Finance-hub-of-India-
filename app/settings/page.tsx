"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/components/ui/ThemeProvider";

export default function SettingsPage() {
  const { mode, textSize, setMode, setTextSize } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [fullName, setFullName] = useState("");
  const [primaryTrack, setPrimaryTrack] = useState("Personal Finance");
  const [emailStreak, setEmailStreak] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setPrimaryTrack(data.primary_track || "Personal Finance");
        setEmailStreak(data.email_streak_reminder ?? true);
        setEmailDigest(data.email_weekly_digest ?? true);
        setPushNotifs(data.notification_push ?? false);
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        primary_track: primaryTrack,
        email_streak_reminder: emailStreak,
        email_weekly_digest: emailDigest,
        notification_push: pushNotifs,
        theme: mode,
      })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      setMessage("❌ Failed to save settings: " + error.message);
    } else {
      setMessage("✅ Settings saved successfully!");
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 760, margin: "60px auto", padding: "0 20px", textAlign: "center", fontFamily: "var(--font-ui, system-ui)" }}>
        <div style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTopColor: "#0E6163", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: "40px auto", padding: "0 20px", fontFamily: "var(--font-ui, system-ui)", color: "#0B1A2B" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Account & Preferences</h1>
      <p style={{ fontSize: 14, color: "#526173", marginBottom: 32 }}>Manage your profile, theme settings, notifications, and subscription.</p>

      {message && (
        <div style={{
          padding: "12px 16px", borderRadius: 10, fontSize: 14, fontWeight: 500, marginBottom: 24,
          background: message.startsWith("✅") ? "#F0F9F7" : "#FEF2F2",
          color: message.startsWith("✅") ? "#0E6163" : "#B91C1C",
          border: `1px solid ${message.startsWith("✅") ? "#B7E4D8" : "#FCA5A5"}`,
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {/* Profile Section */}
        <section style={{ background: "#ffffff", border: "1px solid #e5eaf0", borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Profile Information</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#526173", marginBottom: 6 }}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d1dbe6", fontSize: 14 }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#526173", marginBottom: 6 }}>Primary Learning Track</label>
              <select
                value={primaryTrack}
                onChange={e => setPrimaryTrack(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d1dbe6", fontSize: 14, background: "#fff" }}
              >
                {["Personal Finance", "Trading & Markets", "Corporate Finance", "Crypto & DeFi", "Behavioral Finance", "Technical Analysis", "Forex & Currencies", "हिंदी Finance"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Theme Preferences */}
        <section style={{ background: "#ffffff", border: "1px solid #e5eaf0", borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Appearance & Theme</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#526173", marginBottom: 8 }}>Theme Mode</label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[
                  { id: "light" as const, label: "☀️ Light" },
                  { id: "sepia" as const, label: "📖 Reading" },
                  { id: "dark" as const, label: "🌙 Dark" },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    style={{
                      padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                      border: mode === item.id ? "1.5px solid #0E6163" : "1px solid #d1dbe6",
                      background: mode === item.id ? "#F0F9F7" : "#fff",
                      color: mode === item.id ? "#0E6163" : "#526173",
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#526173", marginBottom: 8 }}>Text Size</label>
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { id: "default" as const, label: "Normal (100%)" },
                  { id: "large" as const, label: "Large (110%)" },
                  { id: "larger" as const, label: "Extra Large (120%)" },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTextSize(item.id)}
                    style={{
                      padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                      border: textSize === item.id ? "1.5px solid #0E6163" : "1px solid #d1dbe6",
                      background: textSize === item.id ? "#F0F9F7" : "#fff",
                      color: textSize === item.id ? "#0E6163" : "#526173",
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section style={{ background: "#ffffff", border: "1px solid #e5eaf0", borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Notifications & Reminders</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", fontSize: 14, color: "#0B1A2B" }}>
              <input type="checkbox" checked={emailStreak} onChange={e => setEmailStreak(e.target.checked)} style={{ width: 18, height: 18, accentColor: "#0E6163" }} />
              <div>
                <strong>Daily Streak Reminder</strong>
                <div style={{ fontSize: 12, color: "#718096" }}>Get a gentle email reminder when your streak is about to break</div>
              </div>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", fontSize: 14, color: "#0B1A2B" }}>
              <input type="checkbox" checked={emailDigest} onChange={e => setEmailDigest(e.target.checked)} style={{ width: 18, height: 18, accentColor: "#0E6163" }} />
              <div>
                <strong>Weekly Progress Digest</strong>
                <div style={{ fontSize: 12, color: "#718096" }}>Receive a summary of your weekly XP, league ranking, and completed lessons</div>
              </div>
            </label>
          </div>
        </section>

        {/* Subscription */}
        <section style={{ background: "#ffffff", border: "1px solid #e5eaf0", borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Subscription Plan</h2>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <span style={{ display: "inline-block", background: "#F0F9F7", border: "1px solid #B7E4D8", color: "#0E6163", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 12, textTransform: "uppercase", marginBottom: 6 }}>
                {profile?.subscription_tier || "Free"} Plan
              </span>
              <p style={{ fontSize: 13, color: "#718096", margin: 0 }}>Access core content, AI tutor daily free limits, and calculators.</p>
            </div>
            <a href="/pricing" style={{ padding: "8px 18px", background: "#0E6163", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              Upgrade to Pro →
            </a>
          </div>
        </section>

        {/* Save button */}
        <div style={{ textAlign: "right" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "12px 32px", fontSize: 15, fontWeight: 700,
              background: "#0E6163", color: "#fff", borderRadius: 10, border: "none",
              cursor: "pointer", opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
