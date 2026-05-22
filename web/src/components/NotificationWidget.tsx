'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification 
} from '@/actions/notificationActions';
import { 
  Bell, 
  Heart, 
  MessageSquare, 
  Calendar, 
  UserCheck, 
  X, 
  CheckCheck, 
  Trash2, 
  Sparkles,
  Info
} from 'lucide-react';

interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  created_at: string;
  data: any;
}

// Chime synthesized with Web Audio API for high-fidelity native feel
const playChime = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Tone 1: High soft bell (F#5)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.frequency.setValueAtTime(739.99, audioCtx.currentTime); // F#5
    gain1.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
    osc1.start();
    osc1.stop(audioCtx.currentTime + 0.18);

    // Tone 2: Crisp chime (B5)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.frequency.setValueAtTime(987.77, audioCtx.currentTime + 0.06); // B5
    gain2.gain.setValueAtTime(0.04, audioCtx.currentTime + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.45);
    osc2.start(audioCtx.currentTime + 0.06);
    osc2.stop(audioCtx.currentTime + 0.45);
  } catch (e) {
    console.log("AudioContext blocked or not supported in this browser session:", e);
  }
};

export default function NotificationWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const popoverRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Load user and initial notifications
  useEffect(() => {
    const initNotifications = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
          const res = await getNotifications();
          if (res.success && res.data) {
            setNotifications(res.data as NotificationItem[]);
          }
        }
      } catch (err) {
        console.error("Error setting up notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    initNotifications();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: unknown, session: { user: any } | null) => {
        if (session?.user) {
          setUserId(session.user.id);
          const res = await getNotifications();
          if (res.success && res.data) {
            setNotifications(res.data as NotificationItem[]);
          }
        } else {
          setUserId(null);
          setNotifications([]);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Real-time listener for incoming notifications
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          const newNotif = payload.new as NotificationItem;
          
          // Prepend to state
          setNotifications(prev => [newNotif, ...prev]);
          
          // Show slide-in toast
          setActiveToast(newNotif);
          
          // Play pristine chime
          playChime();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  // Handle click outside to close popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Auto-dismiss Toast after 5 seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  if (!userId) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (id: string) => {
    const res = await markNotificationAsRead(id);
    if (res.success) {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    const res = await markAllNotificationsAsRead();
    if (res.success) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Avoid triggering markAsRead on row click
    const res = await deleteNotification(id);
    if (res.success) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  // Helper icons and styles based on notification type
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'like':
        return {
          icon: <Heart className="w-4 h-4 text-[#f6339a]" />,
          bg: 'bg-[#f6339a]/10',
          border: 'border-[#f6339a]/20',
          glow: 'shadow-[0_0_10px_rgba(246,51,154,0.15)]'
        };
      case 'comment':
        return {
          icon: <MessageSquare className="w-4 h-4 text-[#00ffff]" />,
          bg: 'bg-[#00ffff]/10',
          border: 'border-[#00ffff]/20',
          glow: 'shadow-[0_0_10px_rgba(0,255,255,0.15)]'
        };
      case 'class':
        return {
          icon: <Calendar className="w-4 h-4 text-[#9810fa]" />,
          bg: 'bg-[#9810fa]/10',
          border: 'border-[#9810fa]/20',
          glow: 'shadow-[0_0_10px_rgba(152,16,250,0.15)]'
        };
      case 'connection':
        return {
          icon: <UserCheck className="w-4 h-4 text-[#00ffaa]" />,
          bg: 'bg-[#00ffaa]/10',
          border: 'border-[#00ffaa]/20',
          glow: 'shadow-[0_0_10px_rgba(0,255,170,0.15)]'
        };
      default:
        return {
          icon: <Info className="w-4 h-4 text-white/50" />,
          bg: 'bg-white/5',
          border: 'border-white/10',
          glow: ''
        };
    }
  };

  return (
    <>
      {/* ── REAL-TIME TOAST ALERT (Mobile / Desktop style push) ── */}
      <AnimatePresence>
        {activeToast && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
            onClick={() => { setIsOpen(true); setActiveToast(null); }}
            className="fixed bottom-24 right-6 z-[9999] w-80 sm:w-90 p-4 rounded-2xl bg-[#090909]/95 border border-white/[0.08] backdrop-blur-xl shadow-2xl cursor-pointer hover:border-white/20 transition-colors"
            style={{
              boxShadow: '0 10px 40px rgba(0,0,0,0.8), 0 0 1px 1px rgba(255,255,255,0.05)'
            }}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl shrink-0 ${getTypeConfig(activeToast.type).bg} ${getTypeConfig(activeToast.type).border}`}>
                {getTypeConfig(activeToast.type).icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black tracking-wide text-white uppercase flex items-center gap-1.5">
                  {activeToast.title}
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f6339a] animate-ping" />
                </h4>
                <p className="text-xs text-white/70 mt-1 line-clamp-2 leading-relaxed">{activeToast.body}</p>
                <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider mt-2">Toca para abrir</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setActiveToast(null); }}
                className="text-white/30 hover:text-white/70 p-1 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FLOATING WIDGET WRAPPER ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" ref={popoverRef}>
        
        {/* POPOVER PANEL */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="w-[320px] sm:w-[380px] bg-[#090909]/95 border border-white/[0.06] backdrop-blur-2xl rounded-[28px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.85)] mb-4 flex flex-col max-h-[480px]"
              style={{
                boxShadow: '0 25px 60px rgba(0,0,0,0.85), inset 0 0 1px 1px rgba(255,255,255,0.03)'
              }}
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-white/[0.05] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#f6339a]" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">Notificaciones</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#f6339a]/15 text-[#f6339a] border border-[#f6339a]/20">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] font-bold text-white/40 hover:text-[#00ffff] transition-colors flex items-center gap-1 uppercase tracking-wider"
                      title="Marcar todo como leído"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Leer Todo
                    </button>
                  )}
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1 text-white/35 hover:text-white/70 transition-colors rounded-lg hover:bg-white/5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable list */}
              <div className="overflow-y-auto no-scrollbar flex-1 p-2 sm:p-3 space-y-1.5">
                {loading ? (
                  <div className="py-20 text-center text-white/30 text-xs font-light">
                    <span className="w-5 h-5 rounded-full border border-white/20 border-t-white animate-spin inline-block mb-2"></span>
                    <p>Sincronizando alertas...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-20 text-center text-white/20 flex flex-col items-center gap-2">
                    <Bell className="w-8 h-8 stroke-[1] text-white/10" />
                    <p className="text-xs font-light">No tienes notificaciones todavía.</p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {notifications.map((notif) => {
                      const config = getTypeConfig(notif.type);
                      return (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10, scale: 0.95 }}
                          onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                          className={`p-3.5 rounded-2xl border transition-all duration-300 relative group cursor-pointer flex gap-3.5 ${
                            notif.read
                              ? 'bg-transparent border-transparent text-white/45'
                              : 'bg-white/[0.02] border-white/[0.04] text-white shadow-sm hover:bg-white/[0.04]'
                          }`}
                        >
                          {/* Left icon badge */}
                          <div className={`p-2.5 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center border transition-all duration-300 ${
                            notif.read
                              ? 'bg-white/5 border-white/5 text-white/30 opacity-40'
                              : `${config.bg} ${config.border} ${config.glow}`
                          }`}>
                            {config.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-xs font-bold truncate ${notif.read ? 'text-white/40' : 'text-white'}`}>
                              {notif.title}
                            </h4>
                            <p className={`text-xs leading-relaxed mt-1 break-words font-light ${notif.read ? 'text-white/30' : 'text-white/60'}`}>
                              {notif.body}
                            </p>
                            <p className="text-[9px] text-white/25 mt-1.5 uppercase tracking-wider font-bold">
                              {new Date(notif.created_at).toLocaleDateString(undefined, {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>

                          {/* Controls (visible on hover) */}
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleDelete(e, notif.id)}
                              className="p-1 rounded bg-white/5 border border-white/5 text-white/40 hover:text-[#f6339a] hover:bg-[#f6339a]/10 hover:border-[#f6339a]/20 transition-all"
                              title="Eliminar notificación"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TRIGGER BELL BUTTON */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`h-14 w-14 rounded-full flex items-center justify-center relative backdrop-blur-md transition-all duration-300 border shadow-2xl ${
            isOpen 
              ? 'bg-gradient-to-tr from-[#f6339a] to-[#9810fa] border-[#f6339a]/30 text-white shadow-[#f6339a]/20'
              : 'bg-white/[0.03] hover:bg-white/[0.07] border-white/10 text-white/80 hover:text-white'
          }`}
          style={{
            boxShadow: isOpen 
              ? '0 8px 30px rgba(246,51,154,0.3), 0 0 1px 1px rgba(255,255,255,0.05)'
              : '0 8px 24px rgba(0,0,0,0.6), 0 0 1px 1px rgba(255,255,255,0.02)'
          }}
        >
          <motion.div
            animate={unreadCount > 0 && !isOpen ? { rotate: [0, 15, -15, 10, -10, 0] } : {}}
            transition={{ repeat: Infinity, repeatDelay: 3.5, duration: 0.6 }}
          >
            <Bell className="w-[22px] h-[22px]" />
          </motion.div>
          
          {/* Glowing count badge */}
          {unreadCount > 0 && (
            <span 
              className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-[#f6339a] rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-[0_0_10px_#f6339a] border border-black/10"
              style={{
                boxShadow: '0 0 10px #f6339a, inset 0 0 2px rgba(255,255,255,0.3)'
              }}
            >
              {unreadCount}
            </span>
          )}
        </motion.button>
      </div>
    </>
  );
}
