import { notFound } from "next/navigation";
import {
  STRUCTURES,
  STRUCTURE_LIST,
  type StructureKey,
} from "@/lib/stacksQueues";
import { StackQueueVisualizer } from "@/components/StackQueueVisualizer";

type PageProps = {
  params: Promise<{ structure: string }>;
};

function isStructureKey(slug: string): slug is StructureKey {
  return slug in STRUCTURES;
}

export function generateStaticParams() {
  return STRUCTURE_LIST.map((s) => ({ structure: s.key }));
}

export async function generateMetadata({ params }: PageProps) {
  const { structure: slug } = await params;
  if (!isStructureKey(slug)) return { title: "Structure not found" };
  const meta = STRUCTURES[slug];
  return {
    title: `${meta.name} — AlgoThrive`,
    description: meta.blurb,
  };
}

export default async function StackQueueDetailPage({ params }: PageProps) {
  const { structure: slug } = await params;

  if (!isStructureKey(slug)) {
    notFound();
  }

  return <StackQueueVisualizer structureKey={slug} />;
}
