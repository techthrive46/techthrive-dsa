import { parseScript, type Operation, type StructureKey } from "@/lib/stacksQueues";

export type IntListLimits = {
  minSize: number;
  maxSize: number;
  minValue: number;
  maxValue: number;
  /** Reject repeated values (BSTs need unique keys). */
  unique?: boolean;
};

/** Limits shared by the sorting and searching array inputs. */
export const ARRAY_LIMITS: IntListLimits = { minSize: 3, maxSize: 16, minValue: 1, maxValue: 20 };

/** Limits for the values inserted into a BST. */
export const TREE_LIMITS: IntListLimits = {
  minSize: 3,
  maxSize: 9,
  minValue: 1,
  maxValue: 99,
  unique: true,
};

export type IntListResult = { ok: true; values: number[] } | { ok: false; error: string };

export function parseIntList(input: string, limits: IntListLimits): IntListResult {
  const { minSize, maxSize, minValue, maxValue, unique } = limits;
  const parts = input
    .split(/[\s,]+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length < minSize || parts.length > maxSize) {
    return { ok: false, error: `Enter ${minSize}–${maxSize} numbers.` };
  }

  const values: number[] = [];
  const seen = new Set<number>();
  for (const part of parts) {
    const n = Number(part);
    if (!Number.isInteger(n) || n < minValue || n > maxValue) {
      return { ok: false, error: `Values must be integers from ${minValue} to ${maxValue}.` };
    }
    if (unique && seen.has(n)) {
      return { ok: false, error: `"${n}" is repeated — BST values must be unique.` };
    }
    seen.add(n);
    values.push(n);
  }
  return { ok: true, values };
}

/* ---------- Reading shared links (?arr=…) ---------- */

/** Parses a query-string list, returning `undefined` when it is missing or invalid. */
export function intListFromParam(
  raw: string | null,
  limits: IntListLimits,
): number[] | undefined {
  if (!raw) return undefined;
  const result = parseIntList(raw, limits);
  return result.ok ? result.values : undefined;
}

export function intFromParam(
  raw: string | null,
  min: number,
  max: number,
): number | undefined {
  if (raw === null || raw.trim() === "") return undefined;
  const n = Number(raw);
  return Number.isInteger(n) && n >= min && n <= max ? n : undefined;
}

/** Parses each comma-separated value against its own [min, max] range. */
export function paramsFromParam(
  raw: string | null,
  mins: number[],
  maxs: number[],
): number[] | undefined {
  if (!raw) return undefined;
  const parts = raw.split(",");
  if (parts.length !== mins.length) return undefined;
  const out: number[] = [];
  for (let i = 0; i < parts.length; i++) {
    const n = intFromParam(parts[i]!, mins[i]!, maxs[i]!);
    if (n === undefined) return undefined;
    out.push(n);
  }
  return out;
}

export function scriptFromParam(
  raw: string | null,
  structure: StructureKey,
): Operation[] | undefined {
  if (!raw) return undefined;
  const result = parseScript(structure, raw);
  return result.ok ? result.ops : undefined;
}
