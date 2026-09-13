import { notFound } from "next/navigation";
import { TREE_OPS, TREE_OP_LIST, type TreeOpKey } from "@/lib/trees";
import { TreeVisualizer } from "@/components/TreeVisualizer";

type PageProps = {
  params: Promise<{ operation: string }>;
};

function isTreeOpKey(slug: string): slug is TreeOpKey {
  return slug in TREE_OPS;
}

export function generateStaticParams() {
  return TREE_OP_LIST.map((op) => ({ operation: op.key }));
}

export async function generateMetadata({ params }: PageProps) {
  const { operation: slug } = await params;
  if (!isTreeOpKey(slug)) return { title: "Operation not found" };
  const op = TREE_OPS[slug];
  return {
    title: `${op.name} — AlgoThrive`,
    description: op.blurb,
  };
}

export default async function TreeOperationPage({ params }: PageProps) {
  const { operation: slug } = await params;

  if (!isTreeOpKey(slug)) {
    notFound();
  }

  return <TreeVisualizer opKey={slug} />;
}
