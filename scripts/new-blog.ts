/**
 * bootstrap for a new blog post
 */
import * as fs from "fs"
import { DateTime } from "luxon"
import * as path from "path"
import * as shell from 'shelljs'

// get new post name
const postName = process.argv[2]
if (!postName) {
  throw Error("missing new post name")
}

const capitalize = (str: string) =>
  `${str.charAt(0).toUpperCase()}${str.slice(1)}`

// create directory
const now = DateTime.now()
const newDirectory = `${now.toISODate()}-${postName
  .toLowerCase()
  .split(" ")
  .join("-")}`
const newDirectoryPath = path.join(
  __dirname,
  "..",
  "content",
  "blog",
  newDirectory
)
fs.mkdirSync(newDirectoryPath)

// create markdown file using date & post name, with template
const markdownFilePath = path.join(newDirectoryPath, "index.md")
fs.writeFileSync(
  markdownFilePath,
  `---
title: ${postName}
date: "${now.toISODate()}"
---
`
)

// open in vs code
shell.exec(`code ${markdownFilePath}`)