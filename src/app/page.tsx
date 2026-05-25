'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, ArrowRight, ShieldCheck, Cpu, Code2, Users, FileCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans">
      
      {/* Brand Header */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Layers className="w-4.5 h-4.5" />
          </div>
          <span className="font-bold tracking-tight text-sm text-slate-200">Aptitude AI Platform</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800 px-2 py-1 rounded">
            STAGING SANDBOX
          </span>
        </div>
      </header>

      {/* Main Feature Highlight */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-20 flex flex-col items-center justify-center text-center gap-8">
        
        {/* Decorative Badge */}
        <div className="inline-flex items-center gap-2 bg-blue-950/40 border border-blue-800/40 px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-400">
          <Cpu className="w-3.5 h-3.5 animate-pulse" />
          <span>Institutional Admin Release v2.4</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-2xl">
            AI-Powered Aptitude Platform <span className="text-blue-500">Internal Admin Workspace</span>
          </h1>
          <p className="text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
            Welcome to the staging sandbox. Step inside the production-grade admin console to manage taxonomies, write LaTeX stems, and preview live student instances.
          </p>
        </div>

        {/* Prominent Access Button */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <Link
            href="/admin/editor"
            className="flex items-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/25 transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>Open Dynamic Content Creator</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mt-12">
          
          {/* Card 1 */}
          <div className="bg-slate-850 border border-slate-800 rounded-xl p-5 text-left flex flex-col gap-2">
            <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center mb-1 text-blue-500">
              <Code2 className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-200">LaTeX & Math Render</span>
            <span className="text-xs text-slate-500 leading-normal">
              Fully interactive equation compiler rendering matrices, limits, and equations directly inside student previews.
            </span>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-850 border border-slate-800 rounded-xl p-5 text-left flex flex-col gap-2">
            <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center mb-1 text-emerald-500">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-200">Role-Based Clearance</span>
            <span className="text-xs text-slate-500 leading-normal">
              Dynamically switch user identities (Admin, Editor, Reviewer) to test permission constraints and workflows.
            </span>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-850 border border-slate-800 rounded-xl p-5 text-left flex flex-col gap-2">
            <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center mb-1 text-amber-500">
              <FileCheck className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-200">Zod Validation Schema</span>
            <span className="text-xs text-slate-500 leading-normal">
              Real-time warning validations checks choice matrix counts, character lengths, and formatting structure.
            </span>
          </div>

        </div>

      </main>

      {/* Footer copyright */}
      <footer className="px-8 py-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Operational Security: Sandbox Encrypted</span>
        </div>
        <span>© 2026 Aptitude AI Platform. All rights reserved.</span>
      </footer>

    </div>
  );
}
