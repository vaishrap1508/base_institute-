'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DomainsScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/student/dashboard?tab=domains');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#030712]">
      <div className="w-8 h-8 rounded-full border border-blue-600/60 border-t-transparent animate-spin" />
    </div>
  );
}
