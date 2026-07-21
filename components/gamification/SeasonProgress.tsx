"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { supabase } from "@/lib/supabase";

type LeaderboardEntry = {
  rank: number;
  user_id: string;
  display_name: string | null;
  xp_total: number;
  streak_current: number;
  badge_count: number;
  role: string;
};

type SeasonStats = {
  season_xp: number;
  rank: string;
} | null;

type Season = {
  id: string;
  season_number: number;
  title: string;
} | null;

type LeaderboardResponse = {
  leaderboard?: LeaderboardEntry[];
  myUserId?: string;
  season?: Season;
  seasonStats?: SeasonStats;
};

const RANKS = [
  { name: "Bronze", min: 0, max: 499, color: "#A8662D", bg: "#FDF1E7", icon: "B" },
  { name: "Silver", min: 500, max: 1999, color: "#767A82", bg: "#F5F5F5", icon: "S" },
  { name: "Gold", min: 2000, max: 4999, color: "#A67700", bg: "#FFFBEC", icon: "G" },
  { name: "Platinum", min: 5000, max: 9999, color: "#534AB7", bg: "#EEEDFE", icon: "P" },
  { name: "Diamond", min: 10000, max: 99999, color: "#185FA5", bg: "#E6F1FB", icon: "D" },
];

function getRankInfo(seasonXP: number) {
  return RANKS.find((rank) => seasonXP >= rank.min && seasonXP <= rank.max) || RANKS[0];
}

function getNextRank(seasonXP: number) {
  const current = RANKS.findIndex((rank) => seasonXP >= rank.min && seasonXP <= rank.max);
  return current >= 0 && current < RANKS.length - 1 ? RANKS[current + 1] : null;
}

export default function SeasonProgress() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myUserId, setMyUserId] = useState("");
  const [season, setSeason] = useState<Season>(null);
  const [seasonXP, setSeasonXP] = useState(0);
  const [scope, setScope] = useState<"global" | "weekly">("global");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  const loadLeaderboard = async () => {
    setLoading(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/leaderboard?scope=${scope}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const result = (await response.json()) as LeaderboardResponse;

      if (response.ok) {
        setLeaderboard(result.leaderboard || []);
        setMyUserId(result.myUserId || session.user.id);
        setSeason(result.season || null);
        setSeasonXP(result.seasonStats?.season_xp || 0);
      }
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const myEntry = leaderboard.find((entry) => entry.user_id === myUserId) || null;
  const rank = getRankInfo(seasonXP);
  const nextRank = getNextRank(seasonXP);
  const progress = nextRank ? Math.min(100, ((seasonXP - rank.min) / (nextRank.min - rank.min)) * 100) : 100;

  return (
    <div style={s.wrap}>
      <div style={{ ...s.seasonCard, background: rank.bg, borderColor: `${rank.color}40` }}>
        <div style={s.seasonLeft}>
          <div style={{ ...s.seasonMark, color: rank.color }}>{rank.icon}</div>
          <div>
            <div style={s.seasonLabel}>
              Season {season?.season_number || 1} · {season?.title || "Foundation Season"}
            </div>
            <div style={{ ...s.rankName, color: rank.color }}>{rank.name}</div>
            <div style={s.seasonXP}>{seasonXP.toLocaleString()} season XP</div>
          </div>
        </div>

        {nextRank ? (
          <div style={s.seasonRight}>
            <div style={s.progressLabel}>
              {(nextRank.min - seasonXP).toLocaleString()} XP to {nextRank.name}
            </div>
            <div style={s.progressBg}>
              <div style={{ ...s.progressFill, width: `${progress}%`, background: rank.color }} />
            </div>
          </div>
        ) : null}
      </div>

      <div style={s.tabRow}>
        <button onClick={() => setScope("global")} style={{ ...s.tab, ...(scope === "global" ? s.tabActive : {}) }} type="button">
          Global
        </button>
        <button onClick={() => setScope("weekly")} style={{ ...s.tab, ...(scope === "weekly" ? s.tabActive : {}) }} type="button">
          This week
        </button>
      </div>

      {myEntry ? (
        <div style={s.myRank}>
          <div style={s.myRankBadge}>#{myEntry.rank}</div>
          <div style={s.myRankText}>Your rank</div>
          <div style={s.myRankXP}>{scope === "weekly" ? "this week" : `${myEntry.xp_total.toLocaleString()} XP`}</div>
        </div>
      ) : null}

      <div style={s.leaderboard}>
        {loading ? (
          Array.from({ length: 10 }).map((_, index) => <div key={index} style={s.skeleton} />)
        ) : leaderboard.length === 0 ? (
          <div style={s.empty}>No rankings yet. Start learning to appear on the leaderboard.</div>
        ) : (
          leaderboard.slice(0, 20).map((entry, index) => {
            const isMe = entry.user_id === myUserId;
            const medal = index === 0 ? "1" : index === 1 ? "2" : index === 2 ? "3" : null;

            return (
              <div
                key={entry.user_id}
                style={{
                  ...s.entry,
                  ...(isMe ? s.entryMe : {}),
                  ...(index < 3 ? s.entryTop : {}),
                }}
              >
                <div style={s.entryRank}>
                  {medal ? <span style={s.medal}>{medal}</span> : <span style={s.rankNum}>{entry.rank}</span>}
                </div>

                <div style={{ ...s.avatar, background: isMe ? "#1D9E75" : "#e5e5e5", color: isMe ? "#fff" : "#666" }}>
                  {(entry.display_name || "?")[0].toUpperCase()}
                </div>

                <div style={s.entryInfo}>
                  <div style={s.entryName}>
                    {entry.display_name || "Anonymous"}
                    {isMe ? <span style={s.youTag}>you</span> : null}
                  </div>
                  <div style={s.entryMeta}>
                    {entry.streak_current} streak · {entry.badge_count} badges · {entry.role}
                  </div>
                </div>

                <div style={s.entryXP}>
                  <div style={s.xpNum}>{entry.xp_total.toLocaleString()}</div>
                  <div style={s.xpLabel}>XP</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={s.rankGuide}>
        <div style={s.rankGuideTitle}>Season ranks</div>
        <div style={s.rankList}>
          {RANKS.map((item) => (
            <div key={item.name} style={{ ...s.rankItem, ...(item.name === rank.name ? s.rankItemActive : {}) }}>
              <span style={{ ...s.rankMiniMark, color: item.color, background: item.bg }}>{item.icon}</span>
              <span style={{ ...s.rankItemName, color: item.color }}>{item.name}</span>
              <span style={s.rankItemXP}>{item.min.toLocaleString()}+ XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s: Record<string, CSSProperties> = {
  wrap: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 14, overflow: "hidden", fontFamily: "system-ui,-apple-system,sans-serif" },
  seasonCard: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", border: "0.5px solid", gap: 16, flexWrap: "wrap" },
  seasonLeft: { display: "flex", alignItems: "center", gap: 12, minWidth: 0 },
  seasonMark: { width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,0.75)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900 },
  seasonLabel: { fontSize: 10, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 2 },
  rankName: { fontSize: 20, fontWeight: 800, letterSpacing: "-0.3px", marginBottom: 2 },
  seasonXP: { fontSize: 12, color: "#888" },
  seasonRight: { flex: 1, minWidth: 150, maxWidth: 240 },
  progressLabel: { fontSize: 10, color: "#888", marginBottom: 5 },
  progressBg: { height: 6, background: "rgba(0,0,0,0.1)", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3, transition: "width .5s ease" },
  tabRow: { display: "flex", gap: 4, padding: "10px 16px", borderBottom: "0.5px solid #eee" },
  tab: { padding: "6px 14px", fontSize: 12, fontWeight: 500, border: "0.5px solid #ddd", borderRadius: 20, background: "#fff", color: "#666", cursor: "pointer", fontFamily: "system-ui" },
  tabActive: { background: "#0a0a0a", color: "#fff", border: "0.5px solid #0a0a0a" },
  myRank: { display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "#F0FAF6", borderBottom: "0.5px solid #9FE1CB" },
  myRankBadge: { fontSize: 18, fontWeight: 800, color: "#1D9E75" },
  myRankText: { fontSize: 12, color: "#0F6E56", fontWeight: 600 },
  myRankXP: { fontSize: 12, color: "#888", marginLeft: "auto" },
  leaderboard: { display: "flex", flexDirection: "column" },
  skeleton: { height: 52, background: "#eee", margin: "0 16px 4px", borderRadius: 8 },
  empty: { padding: "28px", textAlign: "center", fontSize: 13, color: "#888" },
  entry: { display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: "0.5px solid #f5f5f5", transition: "background .1s" },
  entryMe: { background: "#F0FAF6" },
  entryTop: { background: "#FFFDF0" },
  entryRank: { width: 28, display: "flex", justifyContent: "center", flexShrink: 0 },
  medal: { width: 22, height: 22, borderRadius: "50%", background: "#0a0a0a", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 },
  rankNum: { fontSize: 12, fontWeight: 600, color: "#aaa" },
  avatar: { width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 },
  entryInfo: { flex: 1, minWidth: 0 },
  entryName: { fontSize: 13, fontWeight: 600, color: "#0a0a0a", display: "flex", alignItems: "center", gap: 6, marginBottom: 2 },
  youTag: { fontSize: 9, fontWeight: 700, color: "#1D9E75", background: "#E1F5EE", padding: "1px 5px", borderRadius: 8 },
  entryMeta: { fontSize: 10, color: "#888" },
  entryXP: { textAlign: "right", flexShrink: 0 },
  xpNum: { fontSize: 14, fontWeight: 700, color: "#0a0a0a", letterSpacing: "-0.3px" },
  xpLabel: { fontSize: 9, color: "#aaa" },
  rankGuide: { padding: "12px 16px", borderTop: "0.5px solid #eee", background: "#fafafa" },
  rankGuideTitle: { fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 8 },
  rankList: { display: "flex", gap: 6, flexWrap: "wrap" },
  rankItem: { display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, border: "0.5px solid #eee", background: "#fff" },
  rankItemActive: { border: "1.5px solid #1D9E75", background: "#F0FAF6" },
  rankMiniMark: { width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800 },
  rankItemName: { fontSize: 11, fontWeight: 700 },
  rankItemXP: { fontSize: 10, color: "#888" },
};
