import { notFound } from "next/navigation";
import {
  SEARCH_ALGOS,
  SEARCH_ALGO_LIST,
  type SearchAlgoKey,
} from "@/lib/searching";
import { SearchVisualizer } from "@/components/SearchVisualizer";

type PageProps = {
  params: Promise<{ algorithm: string }>;
};

function isSearchAlgoKey(slug: string): slug is SearchAlgoKey {
  return slug in SEARCH_ALGOS;
}

export function generateStaticParams() {
  return SEARCH_ALGO_LIST.map((algo) => ({ algorithm: algo.key }));
}

export async function generateMetadata({ params }: PageProps) {
  const { algorithm: slug } = await params;
  if (!isSearchAlgoKey(slug)) return { title: "Algorithm not found" };
  const algo = SEARCH_ALGOS[slug];
  return {
    title: `${algo.name} — AlgoThrive`,
    description: algo.blurb,
  };
}

export default async function SearchingAlgorithmPage({ params }: PageProps) {
  const { algorithm: slug } = await params;

  if (!isSearchAlgoKey(slug)) {
    notFound();
  }

  return <SearchVisualizer algoKey={slug} />;
}
