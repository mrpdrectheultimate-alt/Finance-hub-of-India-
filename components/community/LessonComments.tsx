"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type CommentProfile = {
  full_name: string | null;
  role: string | null;
};

type Comment = {
  id: string;
  content: string;
  user_id: string;
  parent_id: string | null;
  upvotes: number;
  is_pinned: boolean;
  created_at: string;
  profile: CommentProfile | CommentProfile[] | null;
  replies?: Comment[];
  userUpvoted?: boolean;
};

type RawComment = Omit<Comment, "replies" | "userUpvoted">;

type LessonCommentsProps = {
  lessonId: string;
  lessonTitle: string;
};

export default function LessonComments({ lessonId, lessonTitle }: LessonCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    void loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const loadComments = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) setUserId(user.id);

    const { data } = await supabase
      .from("lesson_comments" as never)
      .select("*, profile:profiles(full_name, role)")
      .eq("lesson_id", lessonId)
      .eq("is_deleted", false)
      .order("is_pinned", { ascending: false })
      .order("upvotes", { ascending: false })
      .order("created_at", { ascending: true });

    const rows = ((data as RawComment[] | null) || []).map(normalizeProfile);
    const topLevel = rows.filter((comment) => !comment.parent_id);
    const replies = rows.filter((comment) => comment.parent_id);
    const threaded = topLevel.map((comment) => ({
      ...comment,
      replies: replies.filter((reply) => reply.parent_id === comment.id),
    }));

    if (user && rows.length > 0) {
      const { data: upvotes } = await supabase
        .from("comment_upvotes" as never)
        .select("comment_id")
        .eq("user_id", user.id)
        .in("comment_id", rows.map((comment) => comment.id));

      const upvotedIds = new Set(((upvotes as { comment_id: string }[] | null) || []).map((item) => item.comment_id));
      setComments(
        threaded.map((comment) => ({
          ...comment,
          userUpvoted: upvotedIds.has(comment.id),
          replies: comment.replies?.map((reply) => ({ ...reply, userUpvoted: upvotedIds.has(reply.id) })),
        })),
      );
    } else {
      setComments(threaded);
    }

    setLoading(false);
  };

  const submitComment = async (parentId?: string) => {
    const text = parentId ? replyText : newComment;
    if (!text.trim() || !userId) return;

    setSubmitting(true);
    const { error } = await supabase.from("lesson_comments" as never).insert({
      lesson_id: lessonId,
      user_id: userId,
      content: text.trim(),
      parent_id: parentId || null,
    } as never);

    if (!error) {
      if (parentId) {
        setReplyText("");
        setReplyTo(null);
      } else {
        setNewComment("");
      }
      await loadComments();
    }
    setSubmitting(false);
  };

  const toggleUpvote = async (commentId: string) => {
    if (!userId) return;
    await supabase.rpc("toggle_comment_upvote" as never, {
      p_user_id: userId,
      p_comment_id: commentId,
    } as never);
    await loadComments();
  };

  const deleteComment = async (commentId: string) => {
    if (!window.confirm("Delete this comment?")) return;
    await supabase
      .from("lesson_comments" as never)
      .update({ is_deleted: true } as never)
      .eq("id", commentId)
      .eq("user_id", userId);
    await loadComments();
  };

  const toggleExpanded = (commentId: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  };

  return (
    <section style={s.wrap}>
      <div style={s.header}>
        <h3 style={s.title}>Discussion</h3>
        <span style={s.count}>{comments.length} {comments.length === 1 ? "comment" : "comments"}</span>
      </div>

      {userId ? (
        <div style={s.newCommentWrap}>
          <textarea
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            placeholder={`Ask a question or share a takeaway from "${lessonTitle}"...`}
            rows={3}
            style={s.textarea}
          />
          <div style={s.newCommentFooter}>
            <span style={s.commentHint}>Be specific. Mention concepts from the lesson for better answers.</span>
            <button
              onClick={() => void submitComment()}
              disabled={!newComment.trim() || submitting}
              style={{ ...s.submitBtn, opacity: !newComment.trim() || submitting ? 0.5 : 1 }}
              type="button"
            >
              {submitting ? "Posting..." : "Post comment"}
            </button>
          </div>
        </div>
      ) : (
        <div style={s.loginPrompt}>
          <Link href="/auth/login" style={s.loginLink}>Log in</Link> to join the discussion
        </div>
      )}

      <div style={s.commentsList}>
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => <div key={index} style={s.skeleton} />)
        ) : comments.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyIcon}>QA</div>
            <div style={s.emptyTitle}>No comments yet</div>
            <div style={s.emptySub}>Be the first to ask a question or share a takeaway.</div>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              replyTo={replyTo}
              replyText={replyText}
              submitting={submitting}
              expanded={expanded}
              userId={userId}
              setReplyTo={setReplyTo}
              setReplyText={setReplyText}
              submitComment={submitComment}
              toggleUpvote={toggleUpvote}
              deleteComment={deleteComment}
              toggleExpanded={toggleExpanded}
            />
          ))
        )}
      </div>
    </section>
  );
}

function CommentItem({
  comment,
  isReply = false,
  replyTo,
  replyText,
  submitting,
  expanded,
  userId,
  setReplyTo,
  setReplyText,
  submitComment,
  toggleUpvote,
  deleteComment,
  toggleExpanded,
}: {
  comment: Comment;
  isReply?: boolean;
  replyTo: string | null;
  replyText: string;
  submitting: boolean;
  expanded: Set<string>;
  userId: string;
  setReplyTo: (id: string | null) => void;
  setReplyText: (text: string) => void;
  submitComment: (parentId?: string) => Promise<void>;
  toggleUpvote: (commentId: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  toggleExpanded: (commentId: string) => void;
}) {
  const profile = normalizeProfile(comment).profile as CommentProfile;
  const role = profile?.role || "free";
  const roleColor = roleColors[role] || "#888";

  return (
    <div style={{ ...s.commentWrap, ...(isReply ? s.replyWrap : {}), ...(comment.is_pinned ? s.pinnedWrap : {}) }}>
      {comment.is_pinned ? <div style={s.pinnedTag}>Pinned</div> : null}

      <div style={s.commentHeader}>
        <div style={s.avatarWrap}>
          <div style={{ ...s.avatar, background: roleColor }}>
            {(profile?.full_name || "?")[0].toUpperCase()}
          </div>
          <div>
            <div style={s.commentAuthor}>
              {profile?.full_name || "Anonymous"}
              {role !== "free" ? <span style={{ ...s.rolePill, color: roleColor }}>{role}</span> : null}
            </div>
            <div style={s.commentTime}>{timeAgo(comment.created_at)}</div>
          </div>
        </div>
      </div>

      <div style={s.commentContent}>{comment.content}</div>

      <div style={s.commentActions}>
        <button
          onClick={() => void toggleUpvote(comment.id)}
          style={{ ...s.actionBtn, color: comment.userUpvoted ? "#1D9E75" : "#aaa" }}
          type="button"
        >
          Up {comment.upvotes}
        </button>
        {!isReply && userId ? (
          <button onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} style={s.actionBtn} type="button">
            Reply {comment.replies?.length ? `(${comment.replies.length})` : ""}
          </button>
        ) : null}
        {comment.user_id === userId ? (
          <button onClick={() => void deleteComment(comment.id)} style={{ ...s.actionBtn, color: "#B91C1C" }} type="button">
            Delete
          </button>
        ) : null}
        {!isReply && comment.replies?.length ? (
          <button onClick={() => toggleExpanded(comment.id)} style={s.actionBtn} type="button">
            {expanded.has(comment.id) ? "Hide" : "Show"} {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
          </button>
        ) : null}
      </div>

      {replyTo === comment.id && userId ? (
        <div style={s.replyInput}>
          <textarea
            value={replyText}
            onChange={(event) => setReplyText(event.target.value)}
            placeholder="Reply to this comment..."
            rows={2}
            style={s.textarea}
          />
          <div style={s.replyBtns}>
            <button onClick={() => { setReplyTo(null); setReplyText(""); }} style={s.cancelBtn} type="button">Cancel</button>
            <button
              onClick={() => void submitComment(comment.id)}
              disabled={!replyText.trim() || submitting}
              style={{ ...s.submitBtn, opacity: !replyText.trim() || submitting ? 0.5 : 1 }}
              type="button"
            >
              {submitting ? "Posting..." : "Post reply"}
            </button>
          </div>
        </div>
      ) : null}

      {!isReply && expanded.has(comment.id)
        ? comment.replies?.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              isReply
              replyTo={replyTo}
              replyText={replyText}
              submitting={submitting}
              expanded={expanded}
              userId={userId}
              setReplyTo={setReplyTo}
              setReplyText={setReplyText}
              submitComment={submitComment}
              toggleUpvote={toggleUpvote}
              deleteComment={deleteComment}
              toggleExpanded={toggleExpanded}
            />
          ))
        : null}
    </div>
  );
}

function normalizeProfile<T extends { profile: CommentProfile | CommentProfile[] | null }>(comment: T): T & { profile: CommentProfile } {
  const profile = Array.isArray(comment.profile) ? comment.profile[0] : comment.profile;
  return { ...comment, profile: profile || { full_name: null, role: "free" } };
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const roleColors: Record<string, string> = {
  expert: "#534AB7",
  pro: "#1D9E75",
  free: "#888",
};

const s: Record<string, CSSProperties> = {
  wrap: { background: "#fff", border: "0.5px solid #e5e5e5", borderRadius: 14, padding: "20px 22px", fontFamily: "system-ui,-apple-system,sans-serif", marginTop: 28 },
  header: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: "0.5px solid #eee" },
  title: { fontSize: 16, fontWeight: 700, color: "#0a0a0a", margin: 0, letterSpacing: "-0.3px" },
  count: { fontSize: 12, color: "#888", background: "#f5f5f5", padding: "2px 9px", borderRadius: 12 },
  newCommentWrap: { marginBottom: 20 },
  textarea: { width: "100%", padding: "10px 12px", fontSize: 13, border: "0.5px solid #ddd", borderRadius: 9, outline: "none", fontFamily: "system-ui", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box", color: "#333" },
  newCommentFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, gap: 12, flexWrap: "wrap" },
  commentHint: { fontSize: 11, color: "#999" },
  submitBtn: { padding: "8px 16px", fontSize: 12, fontWeight: 600, border: "none", borderRadius: 8, background: "#1D9E75", color: "#fff", cursor: "pointer", fontFamily: "system-ui", transition: "opacity .2s" },
  cancelBtn: { padding: "7px 12px", fontSize: 12, border: "0.5px solid #ddd", borderRadius: 8, background: "#fff", color: "#555", cursor: "pointer", fontFamily: "system-ui" },
  loginPrompt: { padding: 16, background: "#fafafa", border: "0.5px solid #eee", borderRadius: 9, fontSize: 13, color: "#888", textAlign: "center", marginBottom: 20 },
  loginLink: { color: "#1D9E75", fontWeight: 600, textDecoration: "none" },
  commentsList: { display: "flex", flexDirection: "column", gap: 2 },
  skeleton: { height: 80, background: "#eee", borderRadius: 10, marginBottom: 8 },
  empty: { textAlign: "center", padding: "32px 20px", color: "#888" },
  emptyIcon: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, background: "#E1F5EE", color: "#1D9E75", fontSize: 12, fontWeight: 800, marginBottom: 8 },
  emptyTitle: { fontWeight: 600, fontSize: 14, color: "#555", marginBottom: 4 },
  emptySub: { fontSize: 13 },
  commentWrap: { padding: "14px 0", borderBottom: "0.5px solid #f5f5f5" },
  replyWrap: { marginLeft: 32, paddingLeft: 14, borderLeft: "2px solid #eee" },
  pinnedWrap: { background: "#FFFBEC", borderRadius: 9, padding: "12px 14px", border: "0.5px solid #FAC775", marginBottom: 8 },
  pinnedTag: { fontSize: 10, fontWeight: 700, color: "#854F0B", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".06em" },
  commentHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  avatarWrap: { display: "flex", alignItems: "center", gap: 8 },
  avatar: { width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 },
  commentAuthor: { fontSize: 13, fontWeight: 600, color: "#0a0a0a", display: "flex", alignItems: "center", gap: 6 },
  rolePill: { fontSize: 10, fontWeight: 700, textTransform: "uppercase" },
  commentTime: { fontSize: 10, color: "#aaa", marginTop: 1 },
  commentContent: { fontSize: 14, color: "#333", lineHeight: 1.7, marginBottom: 10, whiteSpace: "pre-wrap" },
  commentActions: { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" },
  actionBtn: { fontSize: 11, color: "#888", background: "none", border: "none", cursor: "pointer", fontFamily: "system-ui", padding: 0, fontWeight: 600 },
  replyInput: { marginTop: 10, paddingLeft: 8 },
  replyBtns: { display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end" },
};
