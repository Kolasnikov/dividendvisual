import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

export interface PostMeta {
  slug: string
  title: string
  description: string
  seoTitle?: string
  seoDescription?: string
  date: string
  updated?: string
  readingTime: number
  tags: string[]
  faqTitle?: string
  faq?: PostFaq[]
}

export interface Post extends PostMeta {
  content: string
}

export interface PostFaq {
  question: string
  answer: string
}

function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((filename) => {
      const slug = filename.replace('.mdx', '')
      const { data, content } = matter(fs.readFileSync(path.join(BLOG_DIR, filename), 'utf8'))
      return {
        slug,
        title: data.title ?? slug,
        description: data.description ?? '',
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        date: data.date ?? '',
        updated: data.updated,
        readingTime: readingTime(content),
        tags: data.tags ?? [],
        faqTitle: data.faqTitle,
        faq: data.faq ?? [],
      }
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1))
}

export function getPost(slug: string): Post | null {
  const filepath = path.join(BLOG_DIR, `${slug}.mdx`)
  if (!fs.existsSync(filepath)) return null
  const { data, content } = matter(fs.readFileSync(filepath, 'utf8'))
  return {
    slug,
    title: data.title ?? slug,
    description: data.description ?? '',
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    date: data.date ?? '',
    updated: data.updated,
    readingTime: readingTime(content),
    tags: data.tags ?? [],
    faqTitle: data.faqTitle,
    faq: data.faq ?? [],
    content,
  }
}
