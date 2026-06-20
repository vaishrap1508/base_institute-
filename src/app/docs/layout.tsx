import { Layout, Navbar } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'
import { siteConfig } from '@/config/site'

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const pageMap = await getPageMap('/docs')

  return (
    <Layout
      navbar={<Navbar logo={<b>{siteConfig.name} Docs</b>} />}
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
