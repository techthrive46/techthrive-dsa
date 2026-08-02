import { notFound } from "next/navigation";
import { ALGOS, ALGO_LIST, type AlgoKey } from "@/lib/sorting";
import { SortingVisualizer } from "@/components/SortingVisualizer";

type PageProps = {
  params: Promise<{ algorithm: string }>;
};

function isAlgoKey(slug: string): slug is AlgoKey {
  return slug in ALGOS;
}

export function generateStaticParams() {
  return ALGO_LIST.map((algo) => ({ algorithm: algo.key }));
}

export async function generateMetadata({ params }: PageProps) {
  const { algorithm: slug } = await params;
  if (!isAlgoKey(slug)) return { title: "Algorithm not found" };
  const algo = ALGOS[slug];
  return {
    title: `${algo.name} — AlgoThrive`,
    description: algo.blurb,
  };
}

export default async function SortingAlgorithmPage({ params }: PageProps) {
  const { algorithm: slug } = await params;

  if (!isAlgoKey(slug)) {
    notFound();
  }

  return <SortingVisualizer algoKey={slug} />;
}
