import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, MessageCircle, Share2, Sparkles, Settings as SettingsIcon, Sun, Moon, 
  Plus, Users, Radio, TrendingUp, Newspaper, Send, ArrowRight, UserPlus
} from 'lucide-react';
import { Post, Comment, SimState, INITIAL_STATE, generateRandomPost, generateRandomComment, getNextNewsFlash } from './simulation/SimEngine';
import { PERSONAS, Persona } from './simulation/Personas';

export default function App() {
  const [state, setState] = useState<SimState>(INITIAL_STATE);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [showSettings, setShowSettings] = useState(false);
  const [simActive, setSimActive] = useState(true);
  
  // Custom User Profile
  const [userProfile, setUserProfile] = useState({
    name: 'Scott Venable',
    handle: 'scotty_v',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    bio: 'Vibe-coding through the matrix. Building mini-apps. 🎛️🚀'
  });
  
  const [newPostText, setNewPostText] = useState('');
  const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Apply Theme class to HTML node
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Periodic simulation loop
  useEffect(() => {
    if (!simActive) return;

    const interval = setInterval(() => {
      // 60% chance to generate a new post
      if (Math.random() > 0.4) {
        const newPost = generateRandomPost(state);
        setState(prev => ({
          ...prev,
          posts: [newPost, ...prev.posts]
        }));
      } else if (state.posts.length > 0) {
        // 40% chance to add a comment to a random post
        setState(prev => {
          const nextPosts = [...prev.posts];
          const targetIndex = Math.floor(Math.random() * nextPosts.length);
          const targetPost = nextPosts[targetIndex];
          const newComment = generateRandomComment(targetPost);
          
          nextPosts[targetIndex] = {
            ...targetPost,
            comments: [...targetPost.comments, newComment]
          };
          return { ...prev, posts: nextPosts };
        });
      }

      // Rotate news flash occasionally
      if (Math.random() > 0.8) {
        setState(prev => ({
          ...prev,
          news: getNextNewsFlash(prev.news)
        }));
      }

    }, state.speed * 1000);

    return () => clearInterval(interval);
  }, [simActive, state.speed, state.posts]);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const userPost: Post = {
      id: `user_post_${Date.now()}`,
      author: {
        id: 'user',
        name: userProfile.name,
        handle: userProfile.handle,
        avatar: userProfile.avatar,
        role: 'Human User',
        bio: userProfile.bio,
        slang: 1,
        vocab: [],
        hobbies: [],
        interestTopics: [],
        emojiChance: 0.5
      },
      content: newPostText,
      timestamp: 'Just now',
      likes: 0,
      comments: []
    };

    setState(prev => ({
      ...prev,
      posts: [userPost, ...prev.posts]
    }));
    setNewPostText('');

    // Trigger an AI comment on the user's post after 2.5 seconds (in-character reaction!)
    setTimeout(() => {
      setState(prev => {
        const nextPosts = [...prev.posts];
        const index = nextPosts.findIndex(p => p.id === userPost.id);
        if (index !== -1) {
          const targetPost = nextPosts[index];
          const newComment = generateRandomComment(targetPost);
          nextPosts[index] = {
            ...targetPost,
            comments: [...targetPost.comments, newComment]
          };
        }
        return { ...prev, posts: nextPosts };
      });
    }, 2500);
  };

  const handleLikePost = (postId: string) => {
    setState(prev => {
      const nextPosts = prev.posts.map(p => {
        if (p.id === postId) {
          const liked = !p.isLikedByUser;
          return {
            ...p,
            likes: liked ? p.likes + 1 : p.likes - 1,
            isLikedByUser: liked
          };
        }
        return p;
      });
      return { ...prev, posts: nextPosts };
    });
  };

  const handleAddReply = (postId: string) => {
    if (!replyText.trim()) return;

    const userComment: Comment = {
      id: `user_c_${Date.now()}`,
      author: {
        id: 'user',
        name: userProfile.name,
        handle: userProfile.handle,
        avatar: userProfile.avatar,
        role: 'Human User',
        bio: userProfile.bio,
        slang: 1,
        vocab: [],
        hobbies: [],
        interestTopics: [],
        emojiChance: 0.5
      },
      content: replyText,
      timestamp: 'Just now'
    };

    setState(prev => {
      const nextPosts = prev.posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...p.comments, userComment]
          };
        }
        return p;
      });
      return { ...prev, posts: nextPosts };
    });
    setReplyText('');

    // Trigger AI response to the reply
    setTimeout(() => {
      setState(prev => {
        const nextPosts = [...prev.posts];
        const index = nextPosts.findIndex(p => p.id === postId);
        if (index !== -1) {
          const targetPost = nextPosts[index];
          const newComment = generateRandomComment(targetPost);
          nextPosts[index] = {
            ...targetPost,
            comments: [...targetPost.comments, newComment]
          };
        }
        return { ...prev, posts: nextPosts };
      });
    }, 3000);
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]" style={{ height: 'var(--header-height)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-[#ff9966] to-[#ff5e62] text-white font-bold">
            V
          </div>
          <h1 className="text-base font-bold tracking-tight flex items-center gap-2">
            VIVARIUM <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">Sim-Net</span>
          </h1>
        </div>

        {/* Top News Flash Ticker */}
        <div className="hidden md:flex items-center gap-2 max-w-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-full px-4 py-1 text-xs">
          <Newspaper className="w-3.5 h-3.5 text-[#ff5e62] shrink-0" />
          <span className="font-mono text-[#ff5e62] uppercase tracking-wider text-[9px] font-bold">News:</span>
          <span className="truncate text-[var(--text-secondary)]">{state.news}</span>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-all"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#ffd60a]" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-all text-[var(--text-secondary)]"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body Grid */}
      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full">
        
        {/* Left Sidebar - Profile & Active AI Personas */}
        <aside className="hidden lg:flex w-[290px] border-r border-[var(--border-color)] bg-[var(--bg-secondary)] flex-col h-full overflow-hidden">
          
          {/* User Profile Card */}
          <div className="p-4 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-3 mb-3">
              <img src={userProfile.avatar} alt="avatar" className="w-10 h-10 rounded-full border border-[var(--border-color)]" />
              <div>
                <h3 className="text-xs font-bold">{userProfile.name}</h3>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">@{userProfile.handle}</span>
              </div>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{userProfile.bio}</p>
          </div>

          {/* Active AI population panel */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            <h4 className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5" /> Simulation Population ({PERSONAS.length})
            </h4>

            {PERSONAS.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)]/50 hover:bg-[var(--bg-tertiary)] transition-all">
                <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full border border-[var(--border-color)]" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate">{p.name}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00ff66]" />
                  </div>
                  <span className="text-[9px] text-[var(--text-muted)] truncate block">{p.role}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Center - Scrolling Social Feed */}
        <main className="flex-1 flex flex-col h-full bg-[var(--bg-primary)] overflow-y-auto">
          
          {/* Post Creation Area */}
          <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
            <form onSubmit={handleCreatePost} className="flex gap-3">
              <img src={userProfile.avatar} alt="user" className="w-10 h-10 rounded-full border border-[var(--border-color)]" />
              <div className="flex-1 flex flex-col gap-2">
                <textarea
                  placeholder="Share your thoughts with the AI community..."
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  className="w-full bg-transparent resize-none border-none outline-none text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] py-1.5"
                  rows={2}
                />
                <div className="flex items-center justify-between border-t border-[var(--border-color)]/60 pt-2">
                  <span className="text-[9px] text-[var(--text-muted)] font-mono">SCOTTY_V IS ACTIVE</span>
                  <button 
                    type="submit"
                    disabled={!newPostText.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ff5e62] hover:bg-[#e04d51] disabled:bg-[var(--border-color)] disabled:text-[var(--text-muted)] text-white text-[11px] font-bold tracking-wide transition-all"
                  >
                    <Send className="w-3 h-3" />
                    <span>POST</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Social Posts Stream */}
          <div className="p-4 flex flex-col gap-4">
            {state.posts.map(post => (
              <div key={post.id} className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-sm animate-slideup flex flex-col gap-3">
                {/* Post Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={post.author.avatar} alt="avatar" className="w-9 h-9 rounded-full border border-[var(--border-color)]" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold">{post.author.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-secondary)] font-mono">
                          {post.author.role}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-[var(--text-muted)]">@{post.author.handle} · {post.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Post Body */}
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Engagement Actions */}
                <div className="flex items-center gap-6 border-t border-[var(--border-color)]/60 pt-3 text-[11px] text-[var(--text-secondary)] select-none">
                  {/* Likes Button */}
                  <div 
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center gap-1.5 cursor-pointer hover:text-[#ff5e62] transition-colors like-button-pulse ${
                      post.isLikedByUser ? 'text-[#ff5e62]' : ''
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLikedByUser ? 'fill-current text-[#ff5e62]' : 'stroke-[1.5]'}`} />
                    <span>{post.likes}</span>
                  </div>

                  {/* Comment Toggle Button */}
                  <div 
                    onClick={() => setSelectedPostForComments(selectedPostForComments === post.id ? null : post.id)}
                    className="flex items-center gap-1.5 cursor-pointer hover:text-[var(--accent-color)] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 stroke-[1.5]" />
                    <span>{post.comments.length} Comments</span>
                  </div>

                  <div className="flex items-center gap-1.5 cursor-pointer hover:text-[var(--text-primary)] transition-colors">
                    <Share2 className="w-4 h-4 stroke-[1.5]" />
                  </div>
                </div>

                {/* Expanded Threaded Comments Panel */}
                {selectedPostForComments === post.id && (
                  <div className="mt-3 border-t border-[var(--border-color)]/60 pt-3 flex flex-col gap-3">
                    {post.comments.map(c => (
                      <div key={c.id} className="flex gap-2.5 p-2.5 rounded-lg bg-[var(--bg-tertiary)]/50 border border-[var(--border-color)]/50">
                        <img src={c.author.avatar} alt="avatar" className="w-7 h-7 rounded-full border border-[var(--border-color)] shrink-0" />
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[11px] font-bold">{c.author.name}</span>
                            <span className="text-[9px] font-mono text-[var(--text-muted)]">@{c.author.handle} · {c.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{c.content}</p>
                        </div>
                      </div>
                    ))}

                    {/* Reply Box */}
                    <div className="flex gap-2.5 items-center mt-1">
                      <input 
                        type="text"
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-full px-4 py-2 text-xs focus:outline-none focus:border-[#ff5e62]"
                      />
                      <button 
                        onClick={() => handleAddReply(post.id)}
                        disabled={!replyText.trim()}
                        className="p-2 rounded-full bg-[#ff5e62] hover:bg-[#e04d51] text-white disabled:bg-[var(--border-color)] disabled:text-[var(--text-muted)] transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        </main>

        {/* Right Sidebar - Trending & Simulation Controllers */}
        <aside className="hidden xl:flex w-[290px] border-l border-[var(--border-color)] bg-[var(--bg-secondary)] flex-col h-full overflow-hidden p-4 gap-4">
          
          {/* Trending Hot Topics list */}
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)]/50">
            <h4 className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <TrendingUp className="w-3.5 h-3.5" /> Trending Topics
            </h4>
            <div className="flex flex-col gap-2.5">
              {state.trending.map((t, idx) => (
                <div key={t} className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[var(--accent-color)]">{t}</span>
                  <span className="text-[9px] font-mono text-[var(--text-muted)]">{(14.2 - idx * 2.1).toFixed(1)}k posts</span>
                </div>
              ))}
            </div>
          </div>

          {/* System Controllers */}
          <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-tertiary)]/50 flex flex-col gap-3">
            <h4 className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#ff5e62]" /> Engine Control
            </h4>

            {/* Toggle Switch */}
            <div className="flex items-center justify-between text-xs mt-1">
              <span>Auto Generation</span>
              <button 
                onClick={() => setSimActive(!simActive)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                  simActive 
                    ? 'bg-[#00ff66]/10 text-[#00ff66] border border-[#00ff66]/30' 
                    : 'bg-red-500/10 text-red-500 border border-red-500/30'
                }`}
              >
                {simActive ? 'RUNNING' : 'PAUSED'}
              </button>
            </div>

            {/* Timer slide speed */}
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-[10px] text-[var(--text-muted)]">SPEED: {state.speed} seconds</span>
              <input 
                type="range"
                min="5"
                max="60"
                step="5"
                value={state.speed}
                onChange={(e) => setState(prev => ({ ...prev, speed: parseInt(e.target.value) }))}
                className="w-full accent-[#ff5e62]"
              />
            </div>
          </div>

        </aside>

      </div>

    </div>
  );
}
