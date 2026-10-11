"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Clock, User, Mail, Search, 
  Settings, LogOut, ChevronRight, Edit2, 
  Trash2, ExternalLink, RefreshCw, AlertCircle,
  X, CheckCircle2, Loader2
} from "lucide-react";
import Image from "next/image";

interface Booking {
  id: number;
  uid: string;
  title: string;
  start: string;
  end: string;
  status: string;
  attendees: Array<{ name: string; email: string }>;
  location?: string;
  eventType?: { slug: string; title: string };
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bookings?status=upcoming");
      const data = await res.json();
      if (data.data) {
        setBookings(data.data);
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const auth = localStorage.getItem("admin_auth");
    if (!auth) {
      router.push("/admin/login");
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuth(true);
      fetchBookings();
    }
  }, [router]);


  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    router.push("/admin/login");
  };

  const handleCancel = async (uid: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${uid}/cancel`, {
        method: "POST",
        body: JSON.stringify({ cancellationReason: "Cancelled by admin" }),
      });
      if (res.ok) {
        await fetchBookings();
        setShowCancelModal(false);
        setSelectedBooking(null);
      }
    } catch (err) {
      alert("Failed to cancel booking");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = async (uid: string) => {
    if (!rescheduleDate || !rescheduleTime) return;
    setActionLoading(true);
    
    // Construct ISO string
    const start = new Date(`${rescheduleDate}T${rescheduleTime}:00Z`).toISOString();

    try {
      const res = await fetch(`/api/admin/bookings/${uid}/reschedule`, {
        method: "POST",
        body: JSON.stringify({ start, reschedulingReason: "Rescheduled by admin" }),
      });
      if (res.ok) {
        await fetchBookings();
        setShowEditModal(false);
        setSelectedBooking(null);
      }
    } catch (err) {
      alert("Failed to reschedule booking");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.attendees?.[0]?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.attendees?.[0]?.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (!isAuth) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-black/40 backdrop-blur-3xl border-r border-white/5 flex flex-col p-8 z-20">
        <div className="flex items-center gap-3 mb-16">
          <Image src="/logo.svg" alt="Queens OS" width={40} height={40} />
          <div className="font-bold font-outfit text-xl tracking-tight">Queens<span className="text-primary">Admin</span></div>
        </div>

        <nav className="flex-1 space-y-4">
          <button className="flex items-center gap-3 w-full p-4 rounded-2xl bg-primary/10 text-primary font-bold transition-all border border-primary/20">
            <Calendar size={20} />
            <span>Bookings</span>
          </button>
          <button className="flex items-center gap-3 w-full p-4 rounded-2xl hover:bg-white/5 text-foreground-muted font-medium transition-all group">
            <User size={20} className="group-hover:text-white" />
            <span className="group-hover:text-white">Clients</span>
          </button>
          <button className="flex items-center gap-3 w-full p-4 rounded-2xl hover:bg-white/5 text-foreground-muted font-medium transition-all group">
            <Settings size={20} className="group-hover:text-white" />
            <span className="group-hover:text-white">System Config</span>
          </button>
        </nav>

        <button onClick={handleLogout} className="flex items-center gap-3 w-full p-4 rounded-2xl hover:bg-red-500/10 text-red-400 font-bold transition-all border border-transparent hover:border-red-500/20">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen relative">
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[160px] pointer-events-none -mr-40 -mt-40 z-0" />

        <header className="p-8 lg:p-12 flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-4xl font-bold font-outfit tracking-tight mb-2">Booking Management</h1>
            <p className="text-foreground-muted">Review and manage upcoming demo sessions.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchBookings} className="p-3 rounded-full glass hover:bg-white/10 transition-all">
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </header>

        <section className="px-8 lg:px-12 flex-1 overflow-hidden flex flex-col relative z-10">
          {/* Search bar */}
          <div className="relative mb-8 max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground-muted" size={18} />
            <input 
              type="text"
              placeholder="Search by client name or email..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-primary/50 transition-all font-medium text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex-1 glass rounded-[40px] border border-white/5 overflow-hidden flex flex-col mb-12 shadow-2xl">
            <div className="overflow-y-auto scrollbar-hide">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-[#0a0a0a] border-b border-white/5 text-xs font-bold uppercase tracking-widest text-foreground-muted">
                  <tr>
                    <th className="p-8">Client</th>
                    <th className="p-8">Date & Time</th>
                    <th className="p-8">Status</th>
                    <th className="p-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="p-8"><div className="h-10 bg-white/5 rounded-xl w-48" /></td>
                        <td className="p-8"><div className="h-10 bg-white/5 rounded-xl w-32" /></td>
                        <td className="p-8"><div className="h-6 bg-white/5 rounded-full w-16" /></td>
                        <td className="p-8"><div className="h-10 bg-white/5 rounded-xl w-24 ml-auto" /></td>
                      </tr>
                    ))
                  ) : filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                      <tr key={booking.uid} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent-blue/10 flex items-center justify-center font-bold text-primary">
                              {booking.attendees?.[0]?.name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-bold text-white mb-0.5">{booking.attendees?.[0]?.name}</div>
                              <div className="text-xs text-foreground-muted flex items-center gap-1.5">
                                <Mail size={12} />
                                {booking.attendees?.[0]?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-8">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm font-bold">
                              <Calendar size={14} className="text-primary" />
                              {new Date(booking.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-foreground-muted">
                              <Clock size={14} />
                              {new Date(booking.start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </td>
                        <td className="p-8">
                          <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                            booking.status === 'upcoming' ? 'bg-primary/10 text-primary border-primary/20' : 
                            booking.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                            'bg-white/5 text-foreground-muted border-white/10'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-8 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => { setSelectedBooking(booking); setShowEditModal(true); }}
                              className="p-3 rounded-xl glass hover:bg-white/10 text-white transition-all"
                              title="Reschedule"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={() => { setSelectedBooking(booking); setShowCancelModal(true); }}
                              className="p-3 rounded-xl glass hover:bg-red-500/10 text-red-400 border-red-500/10 hover:border-red-500/20 transition-all"
                              title="Cancel"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-32 text-center">
                        <div className="flex flex-col items-center gap-4 text-foreground-muted">
                          <AlertCircle size={48} className="opacity-20" />
                          <p className="font-medium text-lg">No bookings found matching your criteria.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {showEditModal && selectedBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg glass-dark rounded-[40px] border border-white/10 p-10 lg:p-14 overflow-hidden">
              <button onClick={() => setShowEditModal(false)} className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/5 transition-all text-foreground-muted"><X size={24} /></button>
              
              <div className="modal-section">
                <h2 className="text-4xl font-bold font-outfit mb-3 tracking-tight">Reschedule</h2>
                <p className="text-lg text-foreground-muted">Update session time for {selectedBooking.attendees[0].name}.</p>
              </div>

              <div className="modal-form-wrapper">
                <div className="space-y-2">
                  <label className="demo-modal-label">Select New Date</label>
                  <input type="date" className="demo-modal-input" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="demo-modal-label">Select New Time</label>
                  <input type="time" className="demo-modal-input" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} />
                </div>
                <button 
                  disabled={!rescheduleDate || !rescheduleTime || actionLoading}
                  onClick={() => handleReschedule(selectedBooking.uid)}
                  className="demo-modal-btn-primary flex items-center justify-center gap-2 mt-4"
                >
                  {actionLoading ? <Loader2 size={20} className="animate-spin" /> : "Confirm Reschedule"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && selectedBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCancelModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md glass-dark rounded-[40px] border border-red-500/20 p-10 lg:p-14 overflow-hidden text-center">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <AlertCircle size={40} className="text-red-500" />
              </div>
              <h2 className="text-3xl font-bold font-outfit mb-4">Cancel Booking?</h2>
              <p className="text-foreground-muted mb-10">This will remove the session for <strong>{selectedBooking.attendees[0].name}</strong> and notify them via email.</p>
              
              <div className="flex gap-4">
                <button onClick={() => setShowCancelModal(false)} className="flex-1 py-4 glass text-white font-bold rounded-2xl hover:bg-white/10 transition-all border-white/5">Stay</button>
                <button 
                  disabled={actionLoading}
                  onClick={() => handleCancel(selectedBooking.uid)}
                  className="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-all shadow-[0_10px_30px_rgba(239,68,68,0.3)] disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 size={20} className="animate-spin mx-auto" /> : "Cancel Event"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

