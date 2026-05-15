import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface CollectionCardProps {
  slug: string
  title: string
  description: string
  count: number
  accent?: string
}

export function CollectionCard({ slug, title, description, count, accent = '#6366f1' }: CollectionCardProps) {
  return (
    <Link
      href={`/collections/${slug}`}
      className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-5 flex flex-col gap-3 hover:border-[#6366f1]/40 transition-colors group"
    >
      <div className="flex items-start justify-between">
        <div
          className="w-2 h-2 rounded-full mt-1.5"
          style={{ backgroundColor: accent }}
        />
        <ArrowRight className="w-4 h-4 text-[#71717a] group-hover:text-[#6366f1] transition-colors" />
      </div>
      <div>
        <h3 className="font-semibold text-[#f4f4f5] mb-1 group-hover:text-[#6366f1] transition-colors">
          {title}
        </h3>
        <p className="text-xs text-[#71717a] leading-relaxed">{description}</p>
      </div>
      <div className="text-xs text-[#71717a] mt-auto">{count} stocks</div>
    </Link>
  )
}
