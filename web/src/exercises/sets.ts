export function bitsFromSet(values: readonly number[], size: number): string {
  return Array.from({ length: size }, (_, index) =>
    values.includes(index) ? "1" : "0",
  ).join("");
}

export function setFromBits(bits: string): number[] {
  const values: number[] = [];
  for (let index = 0; index < bits.length; index += 1) {
    if (bits[index] === "1") values.push(index);
  }
  return values;
}

export function parseBitVector(input: string): string | null {
  const bits = input.trim().replace(/\s+/g, "");
  return /^[01]+$/.test(bits) ? bits : null;
}

export function parseSet(input: string): number[] | null {
  const trimmed = input.trim();
  if (trimmed === "" || trimmed === "∅" || trimmed === "{}") return [];

  const inner = trimmed.replace(/^\{/, "").replace(/\}$/, "").trim();
  if (inner === "") return [];

  const parts = inner.split(/[,，\s]+/).filter(Boolean);
  const numbers = parts.map((part) => Number(part));
  if (numbers.some((value) => !Number.isInteger(value))) return null;

  return [...new Set(numbers)].sort((a, b) => a - b);
}

export function formatSet(values: readonly number[]): string {
  if (values.length === 0) return "∅";
  return `{${[...values].sort((a, b) => a - b).join(", ")}}`;
}

export function sameSet(a: readonly number[], b: readonly number[]): boolean {
  if (a.length !== b.length) return false;
  const left = [...a].sort((x, y) => x - y);
  const right = [...b].sort((x, y) => x - y);
  return left.every((value, index) => value === right[index]);
}
