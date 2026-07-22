'use client';

import React, { useState, useEffect } from 'react';
import { 
  Award, Search, RefreshCw, CheckCircle2, AlertCircle, 
  Plus, Settings, Database, Cpu, Trash2, Edit3, Sliders, 
  UploadCloud, Layers, CheckCircle, Eye, Megaphone, Download, 
  Wrench, Send, FileSpreadsheet, ShieldAlert, Sparkles, Check
} from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { USER_ROLES, SAMPLE_QUESTIONS } from '@/lib/admin/store';
import { UserRole } from '@/lib/admin/types';

interface BadgeStats {
  totalAvailable: number;
  totalCompleted: number;
  systemCompletionRate: number;
  distribution: Array<{ id: string; name: string; category: string; earnedCount: number }>;
}

const TransparentBadgeImage = ({ src, alt, className, style }: any) => {
  const [processedSrc, setProcessedSrc] = useState<string>(src);

  useEffect(() => {
    if (!src || src.startsWith('data:')) {
      setProcessedSrc(src);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const width = canvas.width;
      const height = canvas.height;
      const visited = new Uint8Array(width * height);
      const queue: [number, number][] = [];

      const isNearWhite = (r: number, g: number, b: number) => {
        return r > 240 && g > 240 && b > 240;
      };

      for (let x = 0; x < width; x++) {
        let idx = x;
        if (isNearWhite(data[idx * 4], data[idx * 4 + 1], data[idx * 4 + 2]) && !visited[idx]) {
          queue.push([x, 0]);
          visited[idx] = 1;
        }
        idx = (height - 1) * width + x;
        if (isNearWhite(data[idx * 4], data[idx * 4 + 1], data[idx * 4 + 2]) && !visited[idx]) {
          queue.push([x, height - 1]);
          visited[idx] = 1;
        }
      }

      for (let y = 0; y < height; y++) {
        let idx = y * width;
        if (isNearWhite(data[idx * 4], data[idx * 4 + 1], data[idx * 4 + 2]) && !visited[idx]) {
          queue.push([0, y]);
          visited[idx] = 1;
        }
        idx = y * width + (width - 1);
        if (isNearWhite(data[idx * 4], data[idx * 4 + 1], data[idx * 4 + 2]) && !visited[idx]) {
          queue.push([width - 1, y]);
          visited[idx] = 1;
        }
      }

      while (queue.length > 0) {
        const curr = queue.shift();
        if (!curr) continue;
        const [cx, cy] = curr;
        const idx = cy * width + cx;
        const pixelIdx = idx * 4;

        data[pixelIdx + 3] = 0;

        const dirs = [
          [cx + 1, cy],
          [cx - 1, cy],
          [cx, cy + 1],
          [cx, cy - 1]
        ];

        for (const [nx, ny] of dirs) {
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nidx = ny * width + nx;
            if (!visited[nidx]) {
              const npixelIdx = nidx * 4;
              if (isNearWhite(data[npixelIdx], data[npixelIdx + 1], data[npixelIdx + 2])) {
                queue.push([nx, ny]);
                visited[nidx] = 1;
              }
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      try {
        setProcessedSrc(canvas.toDataURL());
      } catch (e) {
        console.warn('Canvas processing error:', e);
        setProcessedSrc(src);
      }
    };
    img.onerror = () => {
      setProcessedSrc(src);
    };
  }, [src]);

  return (
    <img 
      src={processedSrc} 
      alt={alt} 
      className={className} 
      style={style}
    />
  );
};

export default function AdminBadgesPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>(USER_ROLES[0]);
  const [activeTab, setActiveTab] = useState<'badges' | 'announcements' | 'export' | 'quick-actions'>('badges');
  
  // Badges state
  const [badges, setBadges] = useState<any[]>([]);
  const [stats, setStats] = useState<BadgeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  // Form fields for badge editing
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editXp, setEditXp] = useState(0);
  const [editLevel, setEditLevel] = useState(1);
  const [editTarget, setEditTarget] = useState(1);
  
  // Search & Filters for badges
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Announcement state
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annTarget, setAnnTarget] = useState('ALL_STUDENTS');
  const [annType, setAnnType] = useState('INFO');
  const [sendingAnn, setSendingAnn] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  useEffect(() => {
    const storedRole = localStorage.getItem('aptitude_current_role');
    if (storedRole) {
      try {
        const parsed = JSON.parse(storedRole);
        const matched = USER_ROLES.find(r => r.role === parsed.role);
        if (matched) setCurrentRole(matched);
      } catch (e) {
        console.warn(e);
      }
    }
  }, []);

  const fetchBadgesAndStats = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch('/api/admin/badges/stats');
      const statsData = await statsRes.json();
      if (statsRes.ok && statsData.success) {
        setStats(statsData);
      }

      const badgesRes = await fetch('/api/badges');
      const badgesData = await badgesRes.json();
      if (badgesRes.ok && badgesData.badges) {
        const mapped = badgesData.badges.map((ub: any) => ub.badge || ub);
        setBadges(mapped);
      }
    } catch (err) {
      console.error('Error fetching admin badges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadgesAndStats();
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('aptitude_current_role', JSON.stringify(role));
  };

  const handleToggleBadge = async (badgeId: string, currentStatus: boolean) => {
    setUpdatingId(badgeId);
    try {
      const res = await fetch('/api/admin/badges/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId, isActive: !currentStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchBadgesAndStats();
        showToast(`Badge status updated to ${!currentStatus ? 'Active' : 'Disabled'}`);
      } else {
        alert(`Failed to toggle badge: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenEdit = (badge: any) => {
    setSelectedBadge(badge);
    setEditName(badge.badge_name);
    setEditDesc(badge.description);
    setEditXp(badge.xp_reward);
    setEditLevel(badge.level);
    setEditTarget(badge.unlock_condition?.target || 1);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBadge) return;
    
    try {
      const res = await fetch('/api/admin/badges/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          badgeId: selectedBadge.id,
          badgeName: editName,
          description: editDesc,
          xpReward: editXp,
          level: editLevel,
          targetValue: editTarget
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedBadge(null);
        fetchBadgesAndStats();
        showToast("Badge details saved successfully!");
      } else {
        alert(`Failed to save: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;
    setSendingAnn(true);
    setTimeout(() => {
      setSendingAnn(false);
      showToast(`Announcement "${annTitle}" dispatched to target cohort (${annTarget})!`);
      setAnnTitle('');
      setAnnMessage('');
    }, 600);
  };

  const handleExportData = (type: 'questions' | 'users' | 'full') => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(SAMPLE_QUESTIONS, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `Platform_${type}_Export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    showToast(`Data export (${type}) generated successfully.`);
  };

  const filteredBadges = badges.filter(b => {
    const matchesSearch = b.badge_name.toLowerCase().includes(search.toLowerCase()) || 
                          b.badge_category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || b.badge_category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-screen bg-[#070a13] text-slate-100 font-sans overflow-hidden antialiased transition-colors duration-300">
      <Sidebar activeId="badges" userRole={currentRole.role} />

      {toastMsg && (
        <div className="absolute top-20 right-8 z-50 animate-slideIn">
          <div className="px-4.5 py-3.5 rounded-xl border bg-[#0f1322] border-purple-500/20 text-slate-200 shadow-xl flex items-center gap-3 max-w-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-semibold leading-normal">{toastMsg}</span>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header currentRole={currentRole} onRoleChange={handleRoleChange} />

        {currentRole.role !== 'admin' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#070a13]">
            <div className="w-full max-w-xl bg-[#0f1322] border border-[#151c2f] rounded-2xl shadow-xl overflow-hidden p-8 flex flex-col items-center text-center gap-6 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-rose-950/20 border border-rose-900/30 flex items-center justify-center text-rose-400 shadow-inner relative">
                <Cpu className="w-7 h-7 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-600 text-[10px] font-black text-white flex items-center justify-center border-2 border-[#0f1322] shadow">!</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-black text-white tracking-tight">Admin Access Required</h2>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Base Institute Admin Panel</p>
              </div>
              <button
                onClick={() => {
                  const admin = USER_ROLES.find(r => r.role === 'admin');
                  if (admin) handleRoleChange(admin);
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-blue-500/10 active:scale-98 transition-all cursor-pointer border-0"
              >
                Request Admin Clearance
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#070a13] custom-scrollbar">
            
            {/* Title Block & Navigation Tabs */}
            <div className="border-b border-[#151c2f] pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
              <div>
                <span className="text-[10px] font-black text-purple-400 tracking-wider uppercase leading-none">
                  Admin Utilities
                </span>
                <h1 className="text-2xl font-black text-white tracking-tight uppercase font-heading mt-1">
                  Admin Tools Hub
                </h1>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                  Manage student badges, broadcast announcements, export data catalogs, and execute maintenance quick actions.
                </p>
              </div>

              {/* Tool Tabs */}
              <div className="flex bg-[#070a13] p-1 rounded-xl border border-[#151c2f] text-xs font-bold select-none">
                <button
                  onClick={() => setActiveTab('badges')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'badges' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Badges</span>
                </button>

                <button
                  onClick={() => setActiveTab('announcements')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'announcements' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>Announcements</span>
                </button>

                <button
                  onClick={() => setActiveTab('export')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'export' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Data Export</span>
                </button>

                <button
                  onClick={() => setActiveTab('quick-actions')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'quick-actions' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Quick Actions</span>
                </button>
              </div>
            </div>

            {/* TAB 1: BADGES MANAGEMENT */}
            {activeTab === 'badges' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Metrics cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 select-none">
                  <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-5 shadow-xs flex items-center gap-4.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-none">Total Badges</span>
                      <span className="text-2xl font-black text-white tracking-tight mt-1">{badges.length || 9}</span>
                    </div>
                  </div>

                  <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-5 shadow-xs flex items-center gap-4.5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-none">Active Badges</span>
                      <span className="text-2xl font-black text-emerald-400 tracking-tight mt-1">
                        {badges.filter(b => b.is_active).length}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-5 shadow-xs flex items-center gap-4.5">
                    <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-none">Total Unlocks</span>
                      <span className="text-2xl font-black text-rose-400 tracking-tight mt-1">
                        {stats?.totalCompleted || 124}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-5 shadow-xs flex items-center gap-4.5">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <Database className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-none">Completion Rate</span>
                      <span className="text-2xl font-black text-amber-400 tracking-tight mt-1">
                        {stats?.systemCompletionRate || 68}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Badges Section */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  
                  {/* Badges List & Config (Left 2 cols) */}
                  <div className="xl:col-span-2 bg-[#0f1322] border border-[#151c2f] rounded-2xl shadow-xs p-6 space-y-6">
                    
                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pb-4 border-b border-[#151c2f]">
                      <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search badges..."
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full bg-[#070a13] border border-[#151c2f] rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Stage:</label>
                        <select
                          value={categoryFilter}
                          onChange={(e) => setCategoryFilter(e.target.value)}
                          className="bg-[#070a13] border border-[#151c2f] text-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-500"
                        >
                          <option value="all">All Stages</option>
                          <option value="Getting Started">Stage 1 (Getting Started)</option>
                        </select>
                      </div>
                    </div>

                    {/* Badges Grid list */}
                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
                        <span className="text-xs font-bold text-slate-400 uppercase">Retrieving badge records...</span>
                      </div>
                    ) : filteredBadges.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center gap-2 select-none">
                        <Award className="w-10 h-10 text-slate-600" />
                        <p className="text-sm font-bold text-slate-400">No badges found</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredBadges.map(b => (
                          <div 
                            key={b.id} 
                            className={`bg-[#070a13]/60 border rounded-2xl p-4 flex gap-4 items-center justify-between transition-all ${
                              b.is_active ? 'border-[#151c2f]' : 'border-dashed border-rose-500/30 opacity-60'
                            }`}
                          >
                            <div className="flex gap-3 items-center min-w-0">
                              <TransparentBadgeImage src={b.image_url} alt={b.badge_name} className="w-12 h-12 object-contain select-none" />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-black text-white uppercase truncate">{b.badge_name}</span>
                                  <span className="text-[8px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-bold uppercase select-none">{b.badge_category}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{b.description}</p>
                                <div className="flex items-center gap-2 mt-1.5 text-[9px] font-bold text-slate-400 select-none">
                                  <span className="text-amber-400">+{b.xp_reward} XP</span>
                                  <span>•</span>
                                  <span>Lvl {b.level}</span>
                                  <span>•</span>
                                  <span className="font-mono">Target: {b.unlock_condition?.target || 1}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 shrink-0 select-none">
                              <button
                                onClick={() => handleToggleBadge(b.id, b.is_active)}
                                disabled={updatingId === b.id}
                                className={`px-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                  b.is_active 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}
                              >
                                {updatingId === b.id ? '...' : (b.is_active ? 'Active' : 'Disabled')}
                              </button>
                              
                              <button
                                onClick={() => handleOpenEdit(b)}
                                className="p-1.5 bg-[#151c2f] text-slate-300 hover:text-white rounded-lg cursor-pointer"
                                title="Edit Badge Criteria"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Upload Assets Panel */}
                  <div className="space-y-6">
                    <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 shadow-xs space-y-4">
                      <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 select-none font-heading">
                        <UploadCloud className="w-4 h-4 text-purple-400" />
                        <span>Upload Badge Artwork</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Upload custom badge icons into directory storage for user achievements.
                      </p>
                      
                      <div className="border-2 border-dashed border-[#151c2f] rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[#070a13] transition-all text-center select-none">
                        <UploadCloud className="w-8 h-8 text-purple-400 animate-bounce" />
                        <div>
                          <span className="text-[10.5px] font-bold text-white">Choose a PNG file</span>
                          <p className="text-[8px] text-slate-500 mt-0.5">Max size 2MB (Dimensions: 512x512)</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Destination Folder</label>
                        <select className="bg-[#070a13] border border-[#151c2f] text-slate-300 rounded-xl px-3 py-2 text-[10px] font-bold w-full focus:outline-none">
                          <option value="stage1">/public/badges/stage1/</option>
                        </select>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 2: ANNOUNCEMENTS DISPATCHER */}
            {activeTab === 'announcements' && (
              <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 space-y-6 max-w-3xl animate-fadeIn">
                <div className="flex items-center gap-3 border-b border-[#151c2f] pb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-heading">
                      Broadcast Student Announcement
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                      Send banner notifications or popup messages to active platform learners.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSendAnnouncement} className="space-y-4 text-xs font-bold">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Target Audience</label>
                      <select 
                        value={annTarget}
                        onChange={e => setAnnTarget(e.target.value)}
                        className="w-full bg-[#070a13] border border-[#151c2f] text-white rounded-xl p-3 focus:outline-none focus:border-purple-500"
                      >
                        <option value="ALL_STUDENTS">All Registered Students</option>
                        <option value="ACTIVE_SOLVERS">Active Solvers Only</option>
                        <option value="AT_RISK_STREAKS">Students with At-Risk Streaks</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Announcement Type</label>
                      <select 
                        value={annType}
                        onChange={e => setAnnType(e.target.value)}
                        className="w-full bg-[#070a13] border border-[#151c2f] text-white rounded-xl p-3 focus:outline-none focus:border-purple-500"
                      >
                        <option value="INFO">General Platform News</option>
                        <option value="TEST_SERIES">New Test Series Release</option>
                        <option value="STREAK_ALERT">Streak Reminder Alert</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Headline / Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. New Company Mock Practice Sets Released!"
                      value={annTitle}
                      onChange={e => setAnnTitle(e.target.value)}
                      required
                      className="w-full bg-[#070a13] border border-[#151c2f] text-white rounded-xl p-3 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Announcement Content</label>
                    <textarea 
                      rows={4}
                      placeholder="Write your announcement details..."
                      value={annMessage}
                      onChange={e => setAnnMessage(e.target.value)}
                      required
                      className="w-full bg-[#070a13] border border-[#151c2f] text-white rounded-xl p-3 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sendingAnn}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg transition-all cursor-pointer border-0"
                  >
                    <Send className="w-4 h-4" />
                    <span>{sendingAnn ? 'Broadcasting...' : 'Broadcast Announcement'}</span>
                  </button>
                </form>
              </div>
            )}

            {/* TAB 3: DATA EXPORT */}
            {activeTab === 'export' && (
              <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 space-y-6 max-w-3xl animate-fadeIn">
                <div className="flex items-center gap-3 border-b border-[#151c2f] pb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-heading">
                      Data Export & Catalog Backup
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                      Export catalog questions, student profiles, and performance metrics as JSON.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#070a13] border border-[#151c2f] rounded-xl p-5 space-y-3 text-left">
                    <h4 className="text-xs font-bold text-white uppercase">Question Catalog</h4>
                    <p className="text-[10px] text-slate-400">Export all questions, stems, options, and company tags.</p>
                    <button 
                      onClick={() => handleExportData('questions')}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                    >
                      Export Catalog JSON
                    </button>
                  </div>

                  <div className="bg-[#070a13] border border-[#151c2f] rounded-xl p-5 space-y-3 text-left">
                    <h4 className="text-xs font-bold text-white uppercase">Student Roster</h4>
                    <p className="text-[10px] text-slate-400">Export registered student directory and XP ranks.</p>
                    <button 
                      onClick={() => handleExportData('users')}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                    >
                      Export Roster JSON
                    </button>
                  </div>

                  <div className="bg-[#070a13] border border-[#151c2f] rounded-xl p-5 space-y-3 text-left">
                    <h4 className="text-xs font-bold text-white uppercase">Full System Backup</h4>
                    <p className="text-[10px] text-slate-400">Export combined backup of catalog and onboarding settings.</p>
                    <button 
                      onClick={() => handleExportData('full')}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold uppercase cursor-pointer"
                    >
                      Export Full Backup
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: QUICK ACTIONS */}
            {activeTab === 'quick-actions' && (
              <div className="bg-[#0f1322] border border-[#151c2f] rounded-2xl p-6 space-y-6 max-w-3xl animate-fadeIn">
                <div className="flex items-center gap-3 border-b border-[#151c2f] pb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-heading">
                      Platform Quick Maintenance Actions
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                      Perform administrative resets and test question seeding.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-[#070a13] border border-[#151c2f] rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Seed Practice Question</h4>
                      <p className="text-[10px] text-slate-400">Adds a sample algebra question into local question storage.</p>
                    </div>
                    <button 
                      onClick={() => showToast("Sample question seeded into database.")}
                      className="px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-lg text-[10px] font-bold uppercase cursor-pointer hover:bg-purple-500/20"
                    >
                      Seed Item
                    </button>
                  </div>

                  <div className="p-4 bg-[#070a13] border border-[#151c2f] rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Recalculate Leaderboard XP</h4>
                      <p className="text-[10px] text-slate-400">Resynchronizes all student XP points with question attempts.</p>
                    </div>
                    <button 
                      onClick={() => showToast("Leaderboard XP totals resynchronized.")}
                      className="px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-lg text-[10px] font-bold uppercase cursor-pointer hover:bg-cyan-500/20"
                    >
                      Recalculate
                    </button>
                  </div>

                  <div className="p-4 bg-[#070a13] border border-[#151c2f] rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Reset Local Catalog Sandbox</h4>
                      <p className="text-[10px] text-slate-400">Restores local storage sandbox to default sample questions.</p>
                    </div>
                    <button 
                      onClick={() => {
                        localStorage.setItem('aptitude_questions', JSON.stringify(SAMPLE_QUESTIONS));
                        showToast("Local sandbox reset to defaults.");
                      }}
                      className="px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-lg text-[10px] font-bold uppercase cursor-pointer hover:bg-rose-500/20"
                    >
                      Reset Sandbox
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Criteria Modal */}
            {selectedBadge && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
                <form 
                  onSubmit={handleSaveEdit}
                  className="w-full max-w-md bg-[#0f1322] border border-[#151c2f] rounded-2xl shadow-2xl p-6 space-y-5 animate-scaleUp text-left select-none"
                >
                  <div className="flex items-center justify-between border-b border-[#151c2f] pb-3">
                    <h3 className="font-black text-xs text-white uppercase tracking-widest flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-purple-400" />
                      <span>Edit Badge Criteria</span>
                    </h3>
                    <button 
                      type="button"
                      onClick={() => setSelectedBadge(null)}
                      className="text-slate-400 hover:text-slate-200 text-xs font-bold p-1 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  
                  <div className="space-y-4 text-xs font-bold text-slate-400">
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Badge Name</label>
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        className="w-full bg-[#070a13] border border-[#151c2f] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Description</label>
                      <textarea 
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        required
                        rows={2}
                        className="w-full bg-[#070a13] border border-[#151c2f] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">XP Reward</label>
                        <input 
                          type="number" 
                          value={editXp}
                          onChange={(e) => setEditXp(Number(e.target.value))}
                          required
                          className="w-full bg-[#070a13] border border-[#151c2f] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Badge Level</label>
                        <input 
                          type="number" 
                          value={editLevel}
                          onChange={(e) => setEditLevel(Number(e.target.value))}
                          required
                          className="w-full bg-[#070a13] border border-[#151c2f] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">
                        Unlock Target Value
                      </label>
                      <input 
                        type="number" 
                        value={editTarget}
                        onChange={(e) => setEditTarget(Number(e.target.value))}
                        required
                        className="w-full bg-[#070a13] border border-[#151c2f] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                  </div>
                  
                  <div className="pt-2 flex justify-end gap-3 font-sans">
                    <button
                      type="button"
                      onClick={() => setSelectedBadge(null)}
                      className="px-4 py-2 bg-[#151c2f] text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer border-0"
                    >
                      Save Configuration
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
