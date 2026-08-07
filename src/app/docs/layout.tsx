import { Layout, Navbar } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import { siteConfig } from '@/config/site'
import RoleToggle from '@/components/RoleToggle'

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const pageMap = await getPageMap('/docs')

  return (
    <Layout
      navbar={
        <div className="flex items-center justify-between w-full pr-4">
          <Navbar logo={<b>{siteConfig.name} Docs</b>} />
          <RoleToggle />
        </div>
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
