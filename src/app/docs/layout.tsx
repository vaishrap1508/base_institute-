import { Layout, Navbar } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import { siteConfig } from '@/config/site'
import { Layers } from 'lucide-react'

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const pageMap = await getPageMap('/docs')

  return (
    <Layout
      navbar={
        <Navbar 
          logo={
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                <Layers className="w-4.5 h-4.5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold tracking-tight text-xs text-slate-900 dark:text-white leading-none">THE LUCID INTELLECTUAL</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Aptitude Arena</span>
              </div>
            </div>
          } 
        />
      }
      footer={null}
      pageMap={pageMap}
      sidebar={{ defaultMenuCollapseLevel: 1, autoCollapse: true }}
      feedback={{ content: null }}
      editLink={null}
      copyPageButton={false}
    >
      {children}
    </Layout>
  )
}
