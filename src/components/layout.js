import * as React from "react"
import { graphql, Link, useStaticQuery } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

const Layout = ({ location, title, children }) => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          social {
            github
          }
        }
      }
    }
  `)
  const social = data.site.siteMetadata?.social

  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  let header

  if (isRootPath) {
    header = (
      <h1 className="main-heading">
        <Link to="/">{title}</Link>
      </h1>
    )
  } else {
    header = (
      <Link className="header-link-home" to="/">
        {title}
      </Link>
    )
  }

  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      <header className="global-header">
        {header}
        <Link to={social.github}>
          <StaticImage
            className="github-avatar"
            formats={["AUTO", "WEBP", "AVIF"]}
            src="../images/GitHub-Mark-120px-plus.png"
            width={34}
            alt="github"
          />
        </Link>
      </header>
      <main>{children}</main>
      <footer>
        © {new Date().getFullYear()}, Built with
        {` `}
        <a href="https://www.gatsbyjs.com">Gatsby</a>
      </footer>
    </div>
  )
}

export default Layout
