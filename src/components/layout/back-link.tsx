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
      <Link href={href} className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4">
        <ArrowLeft className="h-4 w-4" />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-4"
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}
