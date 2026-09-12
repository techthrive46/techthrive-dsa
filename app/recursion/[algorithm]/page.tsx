import { notFound } from "next/navigation";
import {
  RECURSION_ALGOS,
  RECURSION_ALGO_LIST,
  type RecursionAlgoKey,
} from "@/lib/recursion";
import { RecursionVisualizer } from "@/components/RecursionVisualizer";

type PageProps = {
  params: Promise<{ algorithm: string }>;
};

function isRecursionAlgoKey(slug: string): slug is RecursionAlgoKey {
  return slug in RECURSION_ALGOS;
}

export function generateStaticParams() {
  return RECURSION_ALGO_LIST.map((algo) => ({ algorithm: algo.key }));
}

export async function generateMetadata({ params }: PageProps) {
  const { algorithm: slug } = await params;
  if (!isRecursionAlgoKey(slug)) return { title: "Algorithm not found" };
  const algo = RECURSION_ALGOS[slug];
  return {
    title: `${algo.name} — AlgoThrive`,
    description: algo.blurb,
  };
}

export default async function RecursionAlgorithmPage({ params }: PageProps) {
  const { algorithm: slug } = await params;

  if (!isRecursionAlgoKey(slug)) {
    notFound();
  }

  return <RecursionVisualizer algoKey={slug} />;
}
