'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BackLinkProps {
  href?: string;
  label?: string;
}

export function BackLink({ href, label = 'Back' }: BackLinkProps) {
  const router = useRouter();

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center gap-1 text-[#8b8b8b] hover:text-[#00f5ff] mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-1 text-[#8b8b8b] hover:text-[#00f5ff] mb-4 transition-colors"
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
