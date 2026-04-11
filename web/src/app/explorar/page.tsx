"use client";

import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Post {
  id: number;
  author: string;
  initials: string;
  avatarColor: string;
  time: string;
  content: string;
  hasCert?: boolean;
  likes: number;
  comments: number;
  liked: boolean;
}

interface Suggestion {
  id: number;
  name: string;
  initials: string;
  avatarColor: string;
  sub: string;
  following: boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    author: "lagsuz ツ",
    initials: "🔥",
    avatarColor: "#ff4570",
    time: "20h ago",
    content: "hola",
    likes: 0,
    comments: 2,
    liked: false,
  },
  {
    id: 2,
    author: "Gutiérrez Zamora Luis Uziel",
    initials: "GZ",
    avatarColor: "#3d2070",
    time: "22h ago",
    content: "Prueba 2",
    likes: 0,
    comments: 0,
    liked: false,
  },
  {
    id: 3,
    author: "Gutiérrez Zamora Luis Uziel",
    initials: "GZ",
    avatarColor: "#3d2070",
    time: "21d ago",
    content: "Ya soy profesor !!!!",
    hasCert: true,
    likes: 1,
    comments: 1,
    liked: true,
  },
];

const INITIAL_SUGGESTIONS: Suggestion[] = [
  { id: 1, name: "Smart Systems & Innovation", initials: "SI", avatarColor: "#534ab7", sub: "Suggested for you", following: false },
  { id: 2, name: "Patiño Villa Aldo Yahir", initials: "PY", avatarColor: "#6c3fc5", sub: "Suggested for you", following: false },
  { id: 3, name: "Luis Gutiérrez", initials: "LG", avatarColor: "#3d2070", sub: "Suggested for you", following: false },
  { id: 4, name: "juancuriel@gmail.com", initials: "JU", avatarColor: "#2a1a5e", sub: "Suggested for you", following: false },
];

const TABS = ["Recents", "Friends", "Popular"] as const;
const RECOMMENDATIONS = [
  { label: "UI/UX", icon: "✦" },
  { label: "Music", icon: "♪" },
  { label: "Cooking", icon: "◎" },
  { label: "Hiking", icon: "▲" },
];

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  }),
};



// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({
  initials,
  color,
  size = 36,
}: {
  initials: string;
  color: string;
  size?: number;
}) {
  const isEmoji = /\p{Emoji}/u.test(initials);
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold text-white shrink-0"
      style={{
        width: size,
        height: size,
        background: isEmoji
          ? "linear-gradient(135deg,#ff6b35,#ff4570)"
          : color,
        fontSize: isEmoji ? size * 0.45 : size * 0.36,
      }}
    >
      {initials}
    </div>
  );
}

function ActionButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string | number;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 cursor-pointer border-none"
      style={{
        background: active
          ? "rgba(224,88,127,0.15)"
          : "rgba(108,63,197,0.15)",
        color: active ? "#e0587f" : "rgba(232,224,245,0.6)",
      }}
    >
      {icon}
      {label}
    </motion.button>
  );
}

function CertificateCard() {
  return (
    <div
      className="mx-4 mb-2 p-3.5 rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "0.5px solid rgba(180,140,255,0.15)",
      }}
    >
      <p className="text-center text-[9px] tracking-widest mb-3"
        style={{ color: "rgba(232,224,245,0.38)" }}>
        UNIVERSIDAD DEL VALLE DE MÉXICO
      </p>
      <div className="flex gap-2.5">
        <div
          className="rounded-lg shrink-0 flex items-center justify-center"
          style={{
            width: 52,
            height: 68,
            background: "rgba(108,63,197,0.3)",
          }}
        >
          <svg width="22" height="22" fill="none" stroke="rgba(180,140,255,0.4)" strokeWidth="1.5">
            <rect x="3" y="3" width="16" height="18" rx="2" />
            <circle cx="11" cy="9" r="3" />
            <path d="M5 19c0-3 2.7-5 6-5s6 2 6 5" />
          </svg>
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          {[
            { label: "Profesionista", value: "Yazmín Rosas Mondragón" },
            { label: "Carrera", value: "Maestría en Atención a las Necesidades Educativas" },
            { label: "Institución · Fecha", value: "Ciudad de México · 13 Jul 2019" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[9px] uppercase tracking-wider"
                style={{ color: "rgba(232,224,245,0.35)" }}>{label}</p>
              <p className="text-[11px] font-medium mt-0.5"
                style={{ color: "rgba(232,224,245,0.85)" }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
      <div
        className="mt-2.5 pt-2 flex justify-between items-center"
        style={{ borderTop: "0.5px solid rgba(180,140,255,0.1)" }}
      >
        <div>
          <p className="text-[9px] uppercase tracking-wider" style={{ color: "rgba(232,224,245,0.35)" }}>
            Reconocimiento de Validez
          </p>
          <p className="text-[11px] font-medium" style={{ color: "rgba(232,224,245,0.85)" }}>
            Federal · 131/823
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 block" />
          <span className="text-[10px] text-emerald-400 font-semibold">Verificado</span>
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, onToggleLike }: { post: Post; onToggleLike: (id: number) => void }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      custom={post.id}
      variants={fadeInUp}
      whileHover="hover"
      className="rounded-3xl overflow-hidden mb-3.5"
      style={{
        background: "rgba(108,63,197,0.10)",
        border: "0.5px solid rgba(180,140,255,0.12)",
        transition: "border-color 0.2s",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 pt-3.5 pb-2.5">
        <Avatar initials={post.initials} color={post.avatarColor} />
        <div className="flex-1">
          <p className="text-[13px] font-semibold" style={{ color: "#e8e0f5" }}>
            {post.author}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(232,224,245,0.38)" }}>
            {post.time}
          </p>
        </div>
        <button
          className="text-lg cursor-pointer border-none bg-transparent tracking-widest"
          style={{ color: "rgba(232,224,245,0.3)", letterSpacing: "2px" }}
        >
          ···
        </button>
      </div>

      {/* Body text */}
      <p
        className="px-4 pb-2 text-[13.5px] leading-relaxed"
        style={{ color: "rgba(232,224,245,0.8)" }}
      >
        {post.content}
      </p>

      {/* Certificate embed */}
      {post.hasCert && <CertificateCard />}

      {/* Actions */}
      <div className="flex items-center gap-2 px-4 pb-3.5 pt-1">
        <ActionButton
          active={post.liked}
          onClick={() => onToggleLike(post.id)}
          icon={
            <svg width="14" height="14" fill={post.liked ? "#e0587f" : "none"}
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                transform="scale(0.583)" />
            </svg>
          }
          label={post.liked ? post.likes : "Like"}
        />
        <ActionButton
          icon={
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                transform="scale(0.583)" />
            </svg>
          }
          label={post.comments || "Comment"}
        />
        <div className="flex-1" />
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-none text-sm"
          style={{
            background: "rgba(255,255,255,0.05)",
            color: "rgba(232,224,245,0.4)",
          }}
        >
          ↑
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FeedPage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Recents");
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(INITIAL_SUGGESTIONS);

  function toggleLike(id: number) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  }

  function toggleFollow(id: number) {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, following: !s.following } : s))
    );
  }

  return (
    <div
      className="min-h-screen flex gap-5 p-5"
      style={{
        background: "#0b041a",
        fontFamily: "'DM Sans', 'Geist', sans-serif",
        color: "#e8e0f5",
      }}
    >
      {/* ── Feed ── */}
      <div className="flex-1 flex flex-col">
        {/* Tabs */}
        <div
          className="flex gap-0 rounded-full p-1 mb-4"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          {TABS.map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 text-center py-1.5 text-xs font-semibold rounded-full cursor-pointer border-none transition-colors duration-200"
              animate={{
                background: activeTab === tab ? "#6c3fc5" : "transparent",
                color: activeTab === tab ? "#fff" : "rgba(232,224,245,0.45)",
              }}
              transition={{ duration: 0.2 }}
            >
              {tab}
            </motion.button>
          ))}
        </div>

        {/* Compose */}
        <div
          className="flex items-center gap-2.5 rounded-3xl px-4 py-2.5 mb-4 cursor-pointer"
          style={{
            background: "rgba(108,63,197,0.10)",
            border: "0.5px solid rgba(180,140,255,0.12)",
          }}
        >
          <Avatar initials="GL" color="#4a2a8c" size={34} />
          <p className="flex-1 text-sm" style={{ color: "rgba(232,224,245,0.28)" }}>
            Share something...
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-white cursor-pointer border-none"
            style={{ background: "#6c3fc5" }}
          >
            Post
          </motion.button>
        </div>

        {/* Posts */}
        <AnimatePresence>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onToggleLike={toggleLike} />
          ))}
        </AnimatePresence>
      </div>

      {/* ── Sidebar ── */}
      <div className="w-60 flex flex-col gap-4 shrink-0">
        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="rounded-2xl p-4"
          style={{
            background: "rgba(108,63,197,0.08)",
            border: "0.5px solid rgba(180,140,255,0.10)",
          }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: "rgba(232,224,245,0.4)" }}>
            Your Story
          </p>
          <motion.div
            whileHover={{ borderColor: "rgba(180,140,255,0.5)" }}
            className="aspect-square rounded-2xl flex items-center justify-center text-3xl cursor-pointer"
            style={{
              background: "rgba(108,63,197,0.20)",
              border: "2px dashed rgba(180,140,255,0.2)",
              color: "rgba(180,140,255,0.5)",
              transition: "border-color 0.2s",
            }}
          >
            +
          </motion.div>
        </motion.div>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="rounded-2xl p-4"
          style={{
            background: "rgba(108,63,197,0.08)",
            border: "0.5px solid rgba(180,140,255,0.10)",
          }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: "rgba(232,224,245,0.4)" }}>
            Suggestions
          </p>
          <div className="flex flex-col">
            {suggestions.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.06 }}
                className="flex items-center gap-2.5 py-2"
                style={{
                  borderBottom: i < suggestions.length - 1
                    ? "0.5px solid rgba(180,140,255,0.07)"
                    : "none",
                }}
              >
                <div
                  className="rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                  style={{ width: 32, height: 32, background: s.avatarColor }}
                >
                  {s.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium truncate"
                    style={{ color: "rgba(232,224,245,0.85)" }}>
                    {s.name}
                  </p>
                  <p className="text-[10px]" style={{ color: "rgba(232,224,245,0.35)" }}>
                    {s.sub}
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => toggleFollow(s.id)}
                  className="text-[11px] font-bold px-3 py-1 rounded-xl cursor-pointer border-none transition-colors duration-200"
                  style={{
                    background: s.following ? "#6c3fc5" : "rgba(108,63,197,0.35)",
                    color: s.following ? "#fff" : "#c9a8ff",
                  }}
                >
                  {s.following ? "✓" : "Follow"}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="rounded-2xl p-4"
          style={{
            background: "rgba(108,63,197,0.08)",
            border: "0.5px solid rgba(180,140,255,0.10)",
          }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: "rgba(232,224,245,0.4)" }}>
            Explore
          </p>
          <div className="grid grid-cols-2 gap-2">
            {RECOMMENDATIONS.map(({ label, icon }) => (
              <motion.button
                key={label}
                whileHover={{ background: "rgba(108,63,197,0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-1.5 py-3.5 rounded-2xl text-center cursor-pointer border-none transition-colors duration-200"
                style={{
                  background: "rgba(108,63,197,0.20)",
                  border: "0.5px solid rgba(180,140,255,0.10)",
                }}
              >
                <span className="text-xl">{icon}</span>
                <span className="text-[11px] font-medium" style={{ color: "rgba(232,224,245,0.7)" }}>
                  {label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
