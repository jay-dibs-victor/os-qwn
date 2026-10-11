import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../../core/store/useAuthStore';
import { useUIStore } from '../../../core/store/useUIStore';
import apiClient from '../../../core/api/apiClient';
import { motion, AnimatePresence } from 'framer-motion';

const RewardsDashboard = () => {
  const { user, fetchGamificationStats } = useAuthStore();
  const { addToast } = useUIStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exchangeAmount, setExchangeAmount] = useState('');
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const data = await fetchGamificationStats();
    if (data) setStats(data);
    setLoading(false);
  };

  const isDriver = user?.roles?.toLowerCase().includes('driver');
  const tripThreshold = isDriver ? 5 : 3;
  const completedTrips = stats?.completed_trips || user?.completed_trips || 0;
  const isLocked = completedTrips < tripThreshold;

  const handleExchange = async () => {
    if (isLocked) {
       return setMessage({ type: 'error', text: `You must complete ${tripThreshold} trips to unlock coin exchange.` });
    }
    if (!exchangeAmount || isNaN(exchangeAmount) || Number(exchangeAmount) <= 0) {
       return setMessage({ type: 'error', text: 'Enter a valid amount.' });
    }
    setExchangeLoading(true);
    setMessage(null);
    try {
      const res = await apiClient.post('/gamification/exchange', { amount: Number(exchangeAmount) });
      if (res.data?.status === 200) {
         addToast('Exchange successful!', 'success');
         setExchangeAmount('');
         loadStats();
      }
    } catch (e) {
      setMessage({ type: 'error', text: e.response?.data?.error || 'Exchange failed.' });
    }
    setExchangeLoading(false);
  };

  const copyReferral = () => {
    const code = user?.referral_code || 'GOMOBILE';
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0E1015]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  const referralCount = isDriver ? (stats?.referred_drivers_count || 0) : (stats?.referred_users_count || 0);
  const nextMilestone = 5;
  const referralProgress = (referralCount % nextMilestone) / nextMilestone * 100;
  const milestoneReward = isDriver ? 700 : 500;

  return (
    <div className="min-h-screen bg-[#0E1015] text-white p-4 md:p-12 font-sans selection:bg-yellow-500 selection:text-black">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600 tracking-tight">
              REWARDS HUB
            </h1>
            <p className="text-gray-400 mt-1 font-medium italic">Welcome, {user?.firstname || 'Valued Member'}</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
             <div className="bg-[#1A1D24] border border-[#2A2E39] px-5 py-2.5 rounded-2xl flex items-center shadow-xl backdrop-blur-md">
                <span className="text-xl mr-2">🔥</span>
                <div>
                   <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Current Streak</p>
                   <p className="font-extrabold text-lg leading-tight">{stats?.streak_count || 0} Days</p>
                </div>
             </div>
          </div>
        </header>

        {/* Top Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Balance Card */}
          <div className="md:col-span-2 bg-gradient-to-br from-[#1A1D24] to-[#12141A] border border-[#2A2E39] rounded-[2rem] p-8 relative overflow-hidden shadow-2xl group">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px] group-hover:bg-yellow-500/20 transition-all duration-700"></div>
            
            <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Total TaxiCoins</p>
            <div className="flex items-end space-x-3 relative z-10">
               <span className="text-7xl font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.4)] tracking-tighter">
                  {(stats?.taxi_coins || user?.taxi_coins || 0).toLocaleString()}
               </span>
               <span className="text-2xl text-yellow-600 font-black mb-2">TXC</span>
            </div>
          </div>

          {/* Trip Lock / Unlock Progress Card */}
          <div className="bg-[#1A1D24] border border-[#2A2E39] rounded-[2rem] p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
             {isLocked ? (
               <>
                 <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4 border border-yellow-500/20 animate-pulse">
                    <span className="text-2xl">🔒</span>
                 </div>
                 <h3 className="font-bold text-gray-300 text-sm uppercase tracking-wider mb-1">Trip Lock Active</h3>
                 <p className="text-xs text-gray-500 mb-4 px-2">Complete {tripThreshold} trips to unlock coin exchange</p>
                 <div className="w-full bg-[#0E1015] h-2.5 rounded-full overflow-hidden border border-[#2A2E39]">
                    <div 
                      className="bg-yellow-500 h-full transition-all duration-1000" 
                      style={{ width: `${(completedTrips / tripThreshold) * 100}%` }}
                    />
                 </div>
                 <span className="text-[10px] mt-2 font-bold text-yellow-500/80">{completedTrips} / {tripThreshold} TRIPS</span>
               </>
             ) : (
               <>
                 <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border border-green-500/20">
                    <span className="text-2xl">🔓</span>
                 </div>
                 <h3 className="font-bold text-green-400 text-sm uppercase tracking-wider mb-1">Pocket Unlocked</h3>
                 <p className="text-xs text-gray-500 mb-0">You've completed {completedTrips} trips!</p>
               </>
             )}
          </div>
        </div>

        {/* Referral Milestones Section */}
        <div className="bg-gradient-to-r from-[#1A1D24] to-[#16191F] border border-[#2A2E39] rounded-[2rem] p-8 relative overflow-hidden">
           <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
              <div className="flex-1 space-y-4">
                 <div className="flex items-center space-x-3">
                    <span className="p-2 bg-yellow-500/10 rounded-lg text-xl border border-yellow-500/20">🤝</span>
                    <h2 className="text-2xl font-black tracking-tight">Referral Milestones</h2>
                 </div>
                 <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                    Invite 5 {isDriver ? 'drivers' : 'friends'} and earn <span className="text-yellow-500 font-bold">{milestoneReward} TXC</span> bonus. Every 5 matters!
                 </p>
                 
                 <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                       <span className="text-gray-500">{referralCount} Referred</span>
                       <span className="text-yellow-500">Next Reward: {milestoneReward} TXC</span>
                    </div>
                    <div className="w-full bg-[#0E1015] h-3 rounded-full overflow-hidden border border-[#2A2E39]">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${referralProgress}%` }}
                         className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-full"
                       />
                    </div>
                 </div>
              </div>

              <div className="w-full md:w-auto bg-[#0E1015] border border-[#2A2E39] p-6 rounded-3xl flex flex-col items-center">
                 <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mb-4">Your Referral Code</p>
                 <div className="flex items-center space-x-2 bg-[#1A1D24] p-3 rounded-2xl border border-[#2A2E39] w-full justify-between">
                    <span className="font-mono text-xl font-bold tracking-widest text-yellow-400 px-2 uppercase">{user?.referral_code || 'GOMOBILE'}</span>
                    <button 
                      onClick={copyReferral}
                      className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${copied ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black hover:scale-105'}`}
                    >
                       {copied ? 'COPIED!' : 'COPY'}
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {message && (
           <motion.div 
             initial={{ opacity: 0, y: -10 }} 
             animate={{ opacity: 1, y: 0 }}
             className={`p-4 rounded-2xl border ${message.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-green-500/10 border-green-500/50 text-green-400'}`}
           >
             <p className="text-sm font-bold flex items-center">
                <span className="mr-2">{message.type === 'error' ? '✖' : '✔'}</span>
                {message.text}
             </p>
           </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Exchange Section */}
          <div className={`bg-[#1A1D24] border border-[#2A2E39] rounded-[2.5rem] p-10 relative overflow-hidden transition-all duration-500 ${isLocked ? 'opacity-60 grayscale-[0.5]' : ''}`}>
            {isLocked && (
               <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0E1015]/40 backdrop-blur-[2px]">
                  <span className="text-4xl mb-2">🔒</span>
                  <p className="font-bold text-sm text-yellow-500 uppercase tracking-widest">Locked Feature</p>
               </div>
            )}
            
            <h2 className="text-2xl font-black mb-6 flex items-center tracking-tight">
               <span className="bg-yellow-500 text-black w-10 h-10 rounded-2xl flex items-center justify-center mr-4 text-lg font-black shadow-lg shadow-yellow-500/20">₦</span>
               Exchange Naira to TXC
            </h2>
            <p className="text-gray-400 mb-8 text-sm font-medium leading-relaxed">
               Convert your wallet balance to TaxiCoins instantly. <br/>
               Rate: <span className="text-yellow-500 font-bold">₦1 = {stats?.exchange_rate || 2} TXC</span>.
            </p>
            
            <div className="relative mb-8">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-black text-lg">₦</span>
              <input 
                type="number"
                disabled={exchangeLoading || isLocked}
                className="w-full bg-[#0E1015] border-2 border-[#2A2E39] rounded-2xl py-5 pl-12 pr-6 text-white font-bold text-xl focus:outline-none focus:border-yellow-500 transition-all placeholder:text-gray-700"
                placeholder="0.00"
                value={exchangeAmount}
                onChange={e => setExchangeAmount(e.target.value)}
              />
            </div>
            
            <AnimatePresence>
               {exchangeAmount && !isNaN(exchangeAmount) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex justify-between items-center mb-8 text-sm bg-yellow-500/5 p-5 rounded-2xl border border-yellow-500/20 overflow-hidden"
                  >
                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Estimated Outcome:</span>
                    <span className="text-yellow-400 font-black text-xl">+{Number(exchangeAmount) * (stats?.exchange_rate || 2)} TXC</span>
                  </motion.div>
               )}
            </AnimatePresence>

            <button 
              onClick={handleExchange}
              disabled={exchangeLoading || isLocked}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-5 rounded-2xl transition-all shadow-[0_10px_30px_rgba(234,179,8,0.2)] hover:shadow-[0_15px_40px_rgba(234,179,8,0.3)] disabled:opacity-30 active:scale-95 text-lg"
            >
              {exchangeLoading ? 'Processing...' : 'Confirm Exchange'}
            </button>
          </div>

          {/* Quests Section */}
          <div className="bg-[#1A1D24] border border-[#2A2E39] rounded-[2.5rem] p-10">
            <h2 className="text-2xl font-black mb-8 flex items-center tracking-tight">
               <span className="text-3xl mr-4 shadow-xl">🎯</span> Active Quests
            </h2>
            
            <div className="space-y-5">
               {stats?.activeTasks?.length > 0 ? (
                 stats.activeTasks.map(task => (
                    <div key={task._id || task.id} className="bg-[#0E1015] p-5 rounded-[1.5rem] border border-[#2A2E39] hover:border-yellow-500/50 transition-all group cursor-pointer hover:translate-y-[-2px]">
                       <div className="flex justify-between items-start mb-2">
                          <h3 className="font-black text-md leading-tight group-hover:text-yellow-400 transition-colors uppercase tracking-tight">{task.title}</h3>
                          <span className="text-yellow-500 font-black bg-yellow-500/10 px-3 py-1.5 rounded-xl text-[10px] border border-yellow-500/20">+{task.reward_coins} TXC</span>
                       </div>
                       <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{task.description}</p>
                    </div>
                 ))
               ) : (
                 <div className="text-center py-12 text-gray-600">
                    <span className="text-5xl block mb-4 opacity-40">🏟️</span>
                    <p className="font-bold uppercase tracking-widest text-[10px]">Quests arriving soon</p>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Transaction History */}
        {stats?.history?.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-black mb-6 tracking-tight uppercase">Recent Activity</h2>
            <div className="bg-[#1A1D24] border border-[#2A2E39] rounded-[2rem] overflow-hidden shadow-2xl">
               {stats.history.map((tx, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-6 ${idx !== stats.history.length - 1 ? 'border-b border-[#2A2E39]' : ''} hover:bg-white/[0.02] transition-all`}>
                     <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${tx.type === 'SPEND' || tx.type === 'COIN_PAYMENT' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                           <span className="font-bold">{tx.type === 'SPEND' || tx.type === 'COIN_PAYMENT' ? '↙' : '↗'}</span>
                        </div>
                        <div>
                           <p className="font-black text-sm uppercase tracking-tight">{tx.reason}</p>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{new Date(tx.created_at || new Date()).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
                        </div>
                     </div>
                     <span className={`font-black text-lg tracking-tighter ${tx.type === 'SPEND' || tx.type === 'COIN_PAYMENT' ? 'text-red-400' : 'text-green-400'}`}>
                        {tx.type === 'SPEND' || tx.type === 'COIN_PAYMENT' ? '-' : '+'}{tx.amount.toLocaleString()}
                     </span>
                  </div>
               ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsDashboard;
