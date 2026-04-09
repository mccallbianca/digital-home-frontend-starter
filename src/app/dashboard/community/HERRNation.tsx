'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import CommunityStandardsModal from './CommunityStandardsModal';

/* ---------- Types ---------- */
interface Space {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  min_tier: string;
  sort_order: number;
}
interface Thread {
  id: string;
  space: string;
  title: string;
  body: string | null;
  author_id: string;
  pinned: boolean;
  created_at: string;
  profiles?: { preferred_name: string | null; first_name: string | null };
}
interface Post {
  id: string;
  thread_id: string;
  body: string;
  author_id: string;
  created_at: string;
  profiles?: { preferred_name: string | null; first_name: string | null };
}
interface Reaction { post_id: string; author_id: string; emoji: string }
interface DMConvo { partnerId: string; body: string; created_at: string; read: boolean }
interface DM { id: string; sender_id: string; recipient_id: string; body: string; created_at: string; read: boolean }

/* ---------- Helpers ---------- */
const TIER_RANK: Record<string, number> = { collective: 0, core: 1, elite: 2 };

function tierAccess(userTier: string, required: string) {
  return (TIER_RANK[userTier] ?? 0) >= (TIER_RANK[required] ?? 0);
}

function authorName(p?: { preferred_name: string | null; first_name: string | null }) {
  return p?.preferred_name || p?.first_name || 'Member';
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ---------- Props ---------- */
interface HERRNationProps {
  userId: string;
  displayName: string;
  userTier: string;
  acknowledged: boolean;
}

/* ---------- Component ---------- */
export default function HERRNation({ userId, displayName: _displayName, userTier, acknowledged }: HERRNationProps) {
  /* ----- State ----- */
  const [showStandards, setShowStandards] = useState(!acknowledged);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [activeSpace, setActiveSpace] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Compose
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadBody, setNewThreadBody] = useState('');
  const [newPostBody, setNewPostBody] = useState('');
  const [showNewThread, setShowNewThread] = useState(false);

  // DMs
  const [view, setView] = useState<'spaces' | 'dms'>('spaces');
  const [dmList, setDmList] = useState<DMConvo[]>([]);
  const [dmPartner, setDmPartner] = useState<string | null>(null);
  const [dmMessages, setDmMessages] = useState<DM[]>([]);
  const [newDmBody, setNewDmBody] = useState('');
  const [newDmPartnerId, setNewDmPartnerId] = useState('');

  // Sidebar mobile toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const postsEndRef = useRef<HTMLDivElement>(null);

  /* ----- API helpers ----- */
  const api = useCallback(async (action: string, params?: Record<string, string>) => {
    const qs = new URLSearchParams({ action, ...params }).toString();
    const res = await fetch(`/api/community?${qs}`);
    return res.json();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const post = useCallback(async (body: Record<string, any>) => {
    const res = await fetch('/api/community', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.json();
  }, []);

  /* ----- Load spaces ----- */
  useEffect(() => {
    if (showStandards) return;
    api('spaces').then(d => {
      const available = (d.spaces || []).filter((s: Space) => tierAccess(userTier, s.min_tier));
      setSpaces(available);
      if (available.length > 0) setActiveSpace(available[0].slug);
      setLoading(false);
    });
  }, [showStandards, api, userTier]);

  /* ----- Load threads for active space ----- */
  useEffect(() => {
    if (!activeSpace) return;
    setActiveThread(null);
    api('threads', { space: activeSpace }).then(d => setThreads(d.threads || []));
  }, [activeSpace, api]);

  /* ----- Load posts for active thread ----- */
  useEffect(() => {
    if (!activeThread) return;
    api('posts', { threadId: activeThread.id }).then(d => {
      setPosts(d.posts || []);
      setReactions(d.reactions || []);
      setTimeout(() => postsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
  }, [activeThread, api]);

  /* ----- Acknowledge ----- */
  async function handleAcknowledge() {
    await post({ action: 'acknowledge', userId });
    setShowStandards(false);
  }

  /* ----- Create thread ----- */
  async function handleCreateThread() {
    if (!newThreadTitle.trim() || !activeSpace) return;
    const result = await post({
      action: 'create-thread',
      space: activeSpace,
      title: newThreadTitle.trim(),
      content: newThreadBody.trim() || null,
      authorId: userId,
    });
    if (result.threadId) {
      setNewThreadTitle('');
      setNewThreadBody('');
      setShowNewThread(false);
      const d = await api('threads', { space: activeSpace });
      setThreads(d.threads || []);
    }
  }

  /* ----- Create post ----- */
  async function handleCreatePost() {
    if (!newPostBody.trim() || !activeThread) return;
    await post({
      action: 'create-post',
      threadId: activeThread.id,
      content: newPostBody.trim(),
      authorId: userId,
    });
    setNewPostBody('');
    const d = await api('posts', { threadId: activeThread.id });
    setPosts(d.posts || []);
    setReactions(d.reactions || []);
    setTimeout(() => postsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  /* ----- React ----- */
  async function handleReact(postId: string, emoji = '\u{1F44F}') {
    await post({ action: 'react', postId, authorId: userId, emoji });
    if (activeThread) {
      const d = await api('posts', { threadId: activeThread.id });
      setReactions(d.reactions || []);
    }
  }

  /* ----- Flag ----- */
  async function handleFlag(postId: string) {
    if (!confirm('Flag this post for moderator review?')) return;
    await post({ action: 'flag', postId });
  }

  /* ----- Block / Silence ----- */
  async function handleBlock(blockedId: string, type: 'block' | 'silence') {
    const label = type === 'silence' ? 'silence (hide posts from your feed)' : 'block (prevent DMs)';
    if (!confirm(`${label} this member?`)) return;
    await post({ action: 'block', blockerId: userId, blockedId, type });
  }

  /* ----- DM list ----- */
  async function loadDMs() {
    const d = await api('dm-list', { userId });
    setDmList(d.conversations || []);
  }

  /* ----- DM conversation ----- */
  async function openDM(partnerId: string) {
    setDmPartner(partnerId);
    const d = await api('dms', { userId, partnerId });
    setDmMessages(d.messages || []);
  }

  /* ----- Send DM ----- */
  async function handleSendDM() {
    if (!newDmBody.trim() || !dmPartner) return;
    const result = await post({
      action: 'send-dm',
      senderId: userId,
      recipientId: dmPartner,
      content: newDmBody.trim(),
    });
    if (result.error) {
      alert(result.error);
      return;
    }
    setNewDmBody('');
    const d = await api('dms', { userId, partnerId: dmPartner });
    setDmMessages(d.messages || []);
  }

  /* ----- Start new DM ----- */
  async function handleStartNewDM() {
    if (!newDmPartnerId.trim()) return;
    setDmPartner(newDmPartnerId.trim());
    const d = await api('dms', { userId, partnerId: newDmPartnerId.trim() });
    setDmMessages(d.messages || []);
    setNewDmPartnerId('');
  }

  /* ----- Standards gate ----- */
  if (showStandards) {
    return <CommunityStandardsModal onAccept={handleAcknowledge} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-[var(--herr-cobalt)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ======================= RENDER ======================= */
  return (
    <div className="flex h-[calc(100vh-280px)] min-h-[500px] border border-[var(--herr-border)]">
      {/* ---- Sidebar ---- */}
      <aside className={`
        ${sidebarOpen ? 'block' : 'hidden'} md:block
        w-full md:w-56 shrink-0 border-r border-[var(--herr-border)] bg-[var(--herr-black)]
        absolute md:relative z-10 md:z-auto h-full overflow-y-auto
      `}>
        <div className="p-4">
          <p className="herr-label text-[var(--herr-faint)] mb-3">Spaces</p>
          {spaces.map(s => (
            <button
              key={s.slug}
              onClick={() => { setActiveSpace(s.slug); setView('spaces'); setSidebarOpen(false); }}
              className={`block w-full text-left px-3 py-2 text-[0.85rem] rounded transition-colors mb-1 ${
                activeSpace === s.slug && view === 'spaces'
                  ? 'bg-[var(--herr-surface)] text-[var(--herr-white)]'
                  : 'text-[var(--herr-muted)] hover:text-[var(--herr-white)] hover:bg-[var(--herr-surface)]'
              }`}
            >
              # {s.name}
              {s.min_tier !== 'collective' && (
                <span className="ml-1 text-[0.7rem] text-[var(--herr-cobalt)] uppercase">{s.min_tier}</span>
              )}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-[var(--herr-border)]">
          <button
            onClick={() => { setView('dms'); loadDMs(); setSidebarOpen(false); }}
            className={`block w-full text-left px-3 py-2 text-[0.85rem] rounded transition-colors ${
              view === 'dms'
                ? 'bg-[var(--herr-surface)] text-[var(--herr-white)]'
                : 'text-[var(--herr-muted)] hover:text-[var(--herr-white)] hover:bg-[var(--herr-surface)]'
            }`}
          >
            Direct Messages
          </button>
        </div>

        {/* 988 persistent block */}
        <div className="p-4 border-t border-[var(--herr-border)]">
          <div className="bg-[#1a0a12] border border-[var(--herr-pink)]/30 p-3 text-[0.75rem] text-[var(--herr-muted)] leading-relaxed">
            <p className="text-[var(--herr-pink)] font-medium mb-1">Crisis?</p>
            <p>Call or text <strong className="text-[var(--herr-white)]">988</strong></p>
          </div>
        </div>
      </aside>

      {/* ---- Mobile sidebar toggle ---- */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed bottom-4 left-4 z-20 bg-[var(--herr-surface)] border border-[var(--herr-border)] px-3 py-2 text-[0.8rem] text-[var(--herr-muted)]"
      >
        {sidebarOpen ? 'Close' : 'Spaces'}
      </button>

      {/* ---- Main content ---- */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[var(--herr-surface)]/30">
        {view === 'spaces' ? (
          /* ========== SPACES VIEW ========== */
          activeThread ? (
            /* ---- Thread / Posts view ---- */
            <>
              <header className="p-4 border-b border-[var(--herr-border)] flex items-center gap-3">
                <button
                  onClick={() => setActiveThread(null)}
                  className="text-[var(--herr-muted)] hover:text-[var(--herr-white)] text-[0.85rem]"
                >
                  &larr; Back
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[var(--herr-white)] font-medium text-[0.95rem] truncate">
                    {activeThread.pinned && <span className="text-[var(--herr-cobalt)] mr-1">Pinned</span>}
                    {activeThread.title}
                  </h3>
                  <p className="text-[0.75rem] text-[var(--herr-faint)]">
                    by {authorName(activeThread.profiles)} &middot; {timeAgo(activeThread.created_at)}
                  </p>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Thread body */}
                {activeThread.body && (
                  <div className="bg-[var(--herr-black)] border border-[var(--herr-border)] p-4 text-[0.88rem] text-[var(--herr-muted)] leading-relaxed">
                    {activeThread.body}
                  </div>
                )}

                {/* Posts */}
                {posts.map(p => {
                  const postReactions = reactions.filter(r => r.post_id === p.id);
                  const clapCount = postReactions.filter(r => r.emoji === '\u{1F44F}').length;
                  const userClapped = postReactions.some(r => r.emoji === '\u{1F44F}' && r.author_id === userId);
                  const isOwn = p.author_id === userId;

                  return (
                    <div key={p.id} className="group">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--herr-border)] flex items-center justify-center text-[0.7rem] text-[var(--herr-muted)] shrink-0">
                          {authorName(p.profiles).charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-[var(--herr-white)] text-[0.85rem] font-medium">
                              {authorName(p.profiles)}
                            </span>
                            <span className="text-[0.7rem] text-[var(--herr-faint)]">
                              {timeAgo(p.created_at)}
                            </span>
                          </div>
                          <p className="text-[0.88rem] text-[var(--herr-muted)] leading-relaxed mt-1 whitespace-pre-wrap">
                            {p.body}
                          </p>
                          {/* Actions */}
                          <div className="flex items-center gap-3 mt-2">
                            <button
                              onClick={() => handleReact(p.id)}
                              className={`text-[0.75rem] flex items-center gap-1 transition-colors ${
                                userClapped ? 'text-[var(--herr-pink)]' : 'text-[var(--herr-faint)] hover:text-[var(--herr-white)]'
                              }`}
                            >
                              {'\u{1F44F}'} {clapCount > 0 && clapCount}
                            </button>
                            {!isOwn && (
                              <>
                                <button
                                  onClick={() => handleFlag(p.id)}
                                  className="text-[0.7rem] text-[var(--herr-faint)] hover:text-[var(--herr-pink)] opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  Flag
                                </button>
                                <button
                                  onClick={() => handleBlock(p.author_id, 'silence')}
                                  className="text-[0.7rem] text-[var(--herr-faint)] hover:text-[var(--herr-pink)] opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  Silence
                                </button>
                                <button
                                  onClick={() => handleBlock(p.author_id, 'block')}
                                  className="text-[0.7rem] text-[var(--herr-faint)] hover:text-[var(--herr-pink)] opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  Block
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={postsEndRef} />
              </div>

              {/* Reply input */}
              <div className="p-4 border-t border-[var(--herr-border)]">
                <div className="flex gap-2">
                  <input
                    value={newPostBody}
                    onChange={e => setNewPostBody(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleCreatePost()}
                    placeholder="Write a reply..."
                    className="flex-1 bg-[var(--herr-black)] border border-[var(--herr-border)] px-4 py-2 text-[0.88rem] text-[var(--herr-white)] placeholder:text-[var(--herr-faint)] focus:outline-none focus:border-[var(--herr-cobalt)]"
                  />
                  <button
                    onClick={handleCreatePost}
                    disabled={!newPostBody.trim()}
                    className="btn-herr-primary text-[0.82rem] px-4 disabled:opacity-30"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* ---- Thread list view ---- */
            <>
              <header className="p-4 border-b border-[var(--herr-border)] flex items-center justify-between">
                <div>
                  <h3 className="text-[var(--herr-white)] font-medium text-[0.95rem]">
                    # {spaces.find(s => s.slug === activeSpace)?.name || activeSpace}
                  </h3>
                  <p className="text-[0.75rem] text-[var(--herr-faint)]">
                    {spaces.find(s => s.slug === activeSpace)?.description}
                  </p>
                </div>
                <button
                  onClick={() => setShowNewThread(!showNewThread)}
                  className="btn-herr-primary text-[0.78rem] px-3 py-1.5"
                >
                  + Thread
                </button>
              </header>

              <div className="flex-1 overflow-y-auto">
                {/* New thread form */}
                {showNewThread && (
                  <div className="p-4 border-b border-[var(--herr-border)] bg-[var(--herr-black)]">
                    <input
                      value={newThreadTitle}
                      onChange={e => setNewThreadTitle(e.target.value)}
                      placeholder="Thread title"
                      className="w-full bg-transparent border border-[var(--herr-border)] px-4 py-2 text-[0.88rem] text-[var(--herr-white)] placeholder:text-[var(--herr-faint)] focus:outline-none focus:border-[var(--herr-cobalt)] mb-2"
                    />
                    <textarea
                      value={newThreadBody}
                      onChange={e => setNewThreadBody(e.target.value)}
                      placeholder="Opening post (optional)"
                      rows={3}
                      className="w-full bg-transparent border border-[var(--herr-border)] px-4 py-2 text-[0.88rem] text-[var(--herr-muted)] placeholder:text-[var(--herr-faint)] focus:outline-none focus:border-[var(--herr-cobalt)] mb-2 resize-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleCreateThread} disabled={!newThreadTitle.trim()} className="btn-herr-primary text-[0.78rem] px-3 py-1.5 disabled:opacity-30">
                        Create Thread
                      </button>
                      <button onClick={() => setShowNewThread(false)} className="text-[0.78rem] text-[var(--herr-muted)] px-3 py-1.5">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {threads.length === 0 ? (
                  <div className="p-8 text-center text-[var(--herr-faint)] text-[0.88rem]">
                    No threads yet. Start the conversation.
                  </div>
                ) : (
                  threads.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setActiveThread(t)}
                      className="w-full text-left p-4 border-b border-[var(--herr-border)] hover:bg-[var(--herr-surface)] transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-[var(--herr-white)] text-[0.88rem] font-medium truncate">
                            {t.pinned && <span className="text-[var(--herr-cobalt)] mr-1 text-[0.75rem]">[Pinned]</span>}
                            {t.title}
                          </p>
                          <p className="text-[0.75rem] text-[var(--herr-faint)] mt-1">
                            {authorName(t.profiles)} &middot; {timeAgo(t.created_at)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )
        ) : (
          /* ========== DM VIEW ========== */
          dmPartner ? (
            <>
              <header className="p-4 border-b border-[var(--herr-border)] flex items-center gap-3">
                <button
                  onClick={() => setDmPartner(null)}
                  className="text-[var(--herr-muted)] hover:text-[var(--herr-white)] text-[0.85rem]"
                >
                  &larr; Back
                </button>
                <p className="text-[var(--herr-white)] text-[0.9rem] font-medium">
                  DM &middot; {dmPartner.slice(0, 8)}...
                </p>
              </header>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {dmMessages.map(dm => {
                  const isOwn = dm.sender_id === userId;
                  return (
                    <div key={dm.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-2 text-[0.88rem] leading-relaxed ${
                        isOwn
                          ? 'bg-[var(--herr-cobalt)]/20 text-[var(--herr-white)] border border-[var(--herr-cobalt)]/30'
                          : 'bg-[var(--herr-black)] text-[var(--herr-muted)] border border-[var(--herr-border)]'
                      }`}>
                        <p className="whitespace-pre-wrap">{dm.body}</p>
                        <p className="text-[0.65rem] text-[var(--herr-faint)] mt-1">{timeAgo(dm.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-[var(--herr-border)]">
                <div className="flex gap-2">
                  <input
                    value={newDmBody}
                    onChange={e => setNewDmBody(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendDM()}
                    placeholder="Write a message..."
                    className="flex-1 bg-[var(--herr-black)] border border-[var(--herr-border)] px-4 py-2 text-[0.88rem] text-[var(--herr-white)] placeholder:text-[var(--herr-faint)] focus:outline-none focus:border-[var(--herr-cobalt)]"
                  />
                  <button onClick={handleSendDM} disabled={!newDmBody.trim()} className="btn-herr-primary text-[0.82rem] px-4 disabled:opacity-30">
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <header className="p-4 border-b border-[var(--herr-border)]">
                <h3 className="text-[var(--herr-white)] font-medium text-[0.95rem]">Direct Messages</h3>
              </header>

              <div className="flex-1 overflow-y-auto">
                {/* New DM */}
                <div className="p-4 border-b border-[var(--herr-border)]">
                  <div className="flex gap-2">
                    <input
                      value={newDmPartnerId}
                      onChange={e => setNewDmPartnerId(e.target.value)}
                      placeholder="Enter member ID to message..."
                      className="flex-1 bg-[var(--herr-black)] border border-[var(--herr-border)] px-3 py-2 text-[0.82rem] text-[var(--herr-white)] placeholder:text-[var(--herr-faint)] focus:outline-none focus:border-[var(--herr-cobalt)]"
                    />
                    <button onClick={handleStartNewDM} disabled={!newDmPartnerId.trim()} className="btn-herr-primary text-[0.78rem] px-3 disabled:opacity-30">
                      Open
                    </button>
                  </div>
                </div>

                {dmList.length === 0 ? (
                  <div className="p-8 text-center text-[var(--herr-faint)] text-[0.88rem]">
                    No conversations yet.
                  </div>
                ) : (
                  dmList.map(c => (
                    <button
                      key={c.partnerId}
                      onClick={() => openDM(c.partnerId)}
                      className="w-full text-left p-4 border-b border-[var(--herr-border)] hover:bg-[var(--herr-surface)] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-[var(--herr-white)] text-[0.85rem] truncate">
                            {c.partnerId.slice(0, 8)}...
                          </p>
                          <p className="text-[0.78rem] text-[var(--herr-faint)] truncate mt-0.5">{c.body}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <span className="text-[0.7rem] text-[var(--herr-faint)]">{timeAgo(c.created_at)}</span>
                          {!c.read && <span className="w-2 h-2 rounded-full bg-[var(--herr-pink)]" />}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
