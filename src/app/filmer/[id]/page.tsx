import FilmerProfile from './filmer-profile';

export const dynamic = 'force-dynamic';

interface FilmerPageProps {
  params: Promise<{ id: string }>;
}

export default function FilmerProfilePage({ params }: FilmerPageProps) {
  return <FilmerProfile params={params} />;
}
