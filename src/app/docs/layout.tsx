import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const pageMap = await getPageMap('/docs')

  return (
    <Layout
      navbar={<Navbar logo={<b>Kinetic Hub Docs</b>} />}
      footer={<Footer>Kinetic Hub © {new Date().getFullYear()}</Footer>}
      pageMap={pageMap}
      sidebar={{ defaultMenuCollapseLevel: 1, autoCollapse: true }}
      feedback={{ content: null }}
      editLink={null}
    >
      {children}
    </Layout>
  )
}
