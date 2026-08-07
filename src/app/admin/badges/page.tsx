'use client';

import { USER_ROLES } from '@/lib/admin/store';
import { UserRole } from '@/lib/admin/types';
import { useAdmin } from '@/app/admin/AdminContext';
import RoleToggle from '@/components/RoleToggle';
import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Settings, 
  Database,
  Cpu,
  Trash2,
  Edit3,
  Sliders,
  UploadCloud,
  Layers,
  CheckCircle,
  Eye
} from 'lucide-react';
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

      // Push all borders to seed flood fill
      for (let x = 0; x < width; x++) {
        // Top edge
        let idx = x;
        if (isNearWhite(data[idx * 4], data[idx * 4 + 1], data[idx * 4 + 2]) && !visited[idx]) {
          queue.push([x, 0]);
          visited[idx] = 1;
        }
        // Bottom edge
        idx = (height - 1) * width + x;
        if (isNearWhite(data[idx * 4], data[idx * 4 + 1], data[idx * 4 + 2]) && !visited[idx]) {
          queue.push([x, height - 1]);
          visited[idx] = 1;
        }
      }

      for (let y = 0; y < height; y++) {
        // Left edge
        let idx = y * width;
        if (isNearWhite(data[idx * 4], data[idx * 4 + 1], data[idx * 4 + 2]) && !visited[idx]) {
          queue.push([0, y]);
          visited[idx] = 1;
        }
        // Right edge
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

        // Set alpha to transparent
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
  const { currentRole, handleRoleChange } = useAdmin();
const [badges, setBadges] = useState<any[]>([]);
  const [stats, setStats] = useState<BadgeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);
  
  // Form fields for editing
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editXp, setEditXp] = useState(0);
  const [editLevel, setEditLevel] = useState(1);
  const [editTarget, setEditTarget] = useState(1);
  
  // Search & Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Sync role

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

  // Toggles active state in database
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
        // Refresh
        fetchBadgesAndStats();
      } else {
        alert(`Failed to toggle badge: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Opens editing modal
  const handleOpenEdit = (badge: any) => {
    setSelectedBadge(badge);
    setEditName(badge.badge_name);
    setEditDesc(badge.description);
    setEditXp(badge.xp_reward);
    setEditLevel(badge.level);
    setEditTarget(badge.unlock_condition?.target || 1);
  };

  // Saves changes
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
      } else {
        alert(`Failed to save: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // Filters logic
  const filteredBadges = badges.filter(b => {
    const matchesSearch = b.badge_name.toLowerCase().includes(search.toLowerCase()) || 
                          b.badge_category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || b.badge_category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <>

        {currentRole.role !== 'admin' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-[#030712]">
            <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-8 flex flex-col items-center text-center gap-6 animate-scaleUp">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center text-rose-500 dark:text-rose-400 shadow-inner relative">
                <Cpu className="w-7 h-7 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-rose-600 text-[10px] font-black text-white flex items-center justify-center border-2 border-white dark:border-slate-900 shadow">!</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Clearance Protocol Violation</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Secured Sandbox v2.4</p>
              </div>
              <div className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 p-4 rounded-xl space-y-3.5 text-xs text-left">
                <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800 pb-2">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Clearance Status</span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/35 text-rose-700 dark:text-rose-400 uppercase tracking-wide">DENIED</span>
                </div>
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 font-semibold">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Attempted User</span>
                    <span className="text-slate-800 dark:text-slate-100 font-bold">{currentRole.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Clearance Role</span>
                    <span className="text-slate-800 dark:text-rose-400 font-bold uppercase tracking-wider text-[11px] text-rose-600">{currentRole.role}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Attempted Access Route</span>
                    <span className="text-slate-800 dark:text-slate-200 font-bold font-mono text-[11px]">/admin/badges</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 w-full mt-2">
                <RoleToggle />
                <button
                  onClick={() => {
                    const admin = USER_ROLES.find(r => r.role === 'admin');
                    if (admin) handleRoleChange(admin);
                  }}
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-blue-500/10 active:scale-98 transition-all cursor-pointer"
                >
                  <span>Request Admin Clearance</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            
            {/* Title Block */}
            <div className="border-b border-slate-200/60 dark:border-slate-900 pb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none">
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Badge Registry & Rules Management</h1>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  Monitor user badge completion statistics, enable/disable badges, and edit progression thresholds.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <RoleToggle />
                <button
                  onClick={fetchBadgesAndStats}
                  className="px-4 py-2 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer hover:bg-slate-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh Stats</span>
                </button>
              </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 select-none animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4.5">
                <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Award className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">Total Badges</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">{badges.length || 9}</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">Active Badges</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-1">
                    {badges.filter(b => b.is_active).length}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4.5">
                <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">Total Unlocks</span>
                  <span className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight mt-1">
                    {stats?.totalCompleted || 0}
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4.5">
                <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <Database className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider leading-none">Completion Rate</span>
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight mt-1">
                    {stats?.systemCompletionRate || 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Main Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Badges List & Config (Left 2 cols) */}
              <div className="xl:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs p-6 space-y-6">
                
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search badges..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Stage:</label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-600"
                    >
                      <option value="all">All Stages</option>
                      <option value="Getting Started">Stage 1 (Getting Started)</option>
                    </select>
                  </div>
                </div>

                {/* Badges Grid list */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="text-xs font-bold text-slate-400 uppercase">Retrieving badge records...</span>
                  </div>
                ) : filteredBadges.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center gap-2 select-none">
                    <Award className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No badges found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredBadges.map(b => (
                      <div 
                        key={b.id} 
                        className={`bg-slate-50/50 dark:bg-slate-950/20 border rounded-2xl p-4 flex gap-4 items-center justify-between transition-all ${
                          b.is_active ? 'border-slate-200 dark:border-slate-800' : 'border-dashed border-rose-200 dark:border-rose-900/40 opacity-60'
                        }`}
                      >
                        <div className="flex gap-3 items-center min-w-0">
                          <TransparentBadgeImage src={b.image_url} alt={b.badge_name} className="w-12 h-12 object-contain select-none" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">{b.badge_name}</span>
                              <span className="text-[8px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase select-none">{b.badge_category}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{b.description}</p>
                            <div className="flex items-center gap-2 mt-1.5 text-[9px] font-bold text-slate-400 select-none">
                              <span className="text-amber-600 dark:text-amber-400">+{b.xp_reward} XP</span>
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
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/25 dark:text-emerald-400 border border-emerald-500/10'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/25 dark:text-rose-400 border border-rose-500/10'
                            }`}
                          >
                            {updatingId === b.id ? '...' : (b.is_active ? 'Active' : 'Disabled')}
                          </button>
                          
                          <button
                            onClick={() => handleOpenEdit(b)}
                            className="p-1.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer"
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

              {/* Stats Log & Uploader Placeholder (Right 1 col) */}
              <div className="space-y-6">
                
                {/* Upload Assets Panel */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                  <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2 select-none">
                    <UploadCloud className="w-4 h-4 text-blue-600" />
                    <span>Upload Badge Assets</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Upload stage artwork (Stage 1, Badges 1-9) directly into the directory storage.
                  </p>
                  
                  {/* Fake Uploader */}
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-all text-center select-none">
                    <UploadCloud className="w-8 h-8 text-slate-300 animate-bounce" />
                    <div>
                      <span className="text-[10.5px] font-bold text-slate-900 dark:text-white">Choose a PNG file</span>
                      <p className="text-[8px] text-slate-400 mt-0.5">Max size 2MB (Dimensions: 512x512)</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Target Folder Destination</label>
                    <select className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-[10px] font-bold w-full focus:outline-none">
                      <option value="stage1">/public/badges/stage1/</option>
                    </select>
                  </div>
                </div>

                {/* Badge distribution chart representation */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4 select-none">
                  <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Completion Distribution</span>
                  </h3>
                  
                  <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                    {stats?.distribution && stats.distribution.length > 0 ? (
                      stats.distribution
                        .sort((a, b) => b.earnedCount - a.earnedCount)
                        .slice(0, 6)
                        .map((dist, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-slate-800 dark:text-slate-200 truncate uppercase max-w-[120px]">{dist.name}</span>
                              <span className="text-slate-400 font-mono">{dist.earnedCount} users</span>
                            </div>
                            <div className="w-full h-1 bg-slate-50/70 dark:bg-slate-950 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${Math.min(100, dist.earnedCount * 25)}%` }} // rough scaling
                              />
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-6 text-slate-400 text-[10px] font-bold">
                        No distribution data available
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

            {/* Edit Criteria Modal */}
            {selectedBadge && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
                <form 
                  onSubmit={handleSaveEdit}
                  className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] shadow-2xl p-6 space-y-5 animate-scaleIn text-left select-none"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="font-black text-xs text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-blue-600" />
                      <span>Edit Badge Criteria</span>
                    </h3>
                    <button 
                      type="button"
                      onClick={() => setSelectedBadge(null)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 hover:bg-slate-100 rounded cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  
                  <div className="space-y-4 text-xs font-bold text-slate-500">
                    
                    {/* Badge Name */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Badge Name</label>
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Description</label>
                      <textarea 
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        required
                        rows={2}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* XP Reward */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">XP Reward</label>
                        <input 
                          type="number" 
                          value={editXp}
                          onChange={(e) => setEditXp(Number(e.target.value))}
                          required
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                        />
                      </div>

                      {/* Level */}
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Badge Level</label>
                        <input 
                          type="number" 
                          value={editLevel}
                          onChange={(e) => setEditLevel(Number(e.target.value))}
                          required
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    {/* Target Value */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">
                        Unlock Target Value (Condition Type: <span className="font-mono text-blue-600">{selectedBadge.unlock_condition?.type}</span>)
                      </label>
                      <input 
                        type="number" 
                        value={editTarget}
                        onChange={(e) => setEditTarget(Number(e.target.value))}
                        required
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                      />
                      <span className="text-[8.5px] font-bold text-slate-400 mt-1 block">
                        Sets the quantitative threshold (e.g. solved items, streak days, visited counts) needed to achieve this badge.
                      </span>
                    </div>

                  </div>
                  
                  <div className="pt-2 flex justify-end gap-3 font-sans">
                    <button
                      type="button"
                      onClick={() => setSelectedBadge(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-blue-500/10 cursor-pointer active:scale-98"
                    >
                      Save Configuration
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}
      </>
  );
}
