import type { LabParams } from "./types";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function numberParam(
  params: LabParams,
  name: string,
  fallback: number,
): number {
  const value = Number(params[name]);
  return Number.isFinite(value) ? value : fallback;
}

export function stringParam(
  params: LabParams,
  name: string,
  fallback: string,
): string {
  const value = params[name];
  return typeof value === "string" ? value : fallback;
}

export function binary(value: number, width: number): string {
  return (value >>> 0).toString(2).padStart(width, "0").slice(-width);
}

export function toBase(value: number, base: number): string {
  if (value === 0) return "0";
  const digits = "0123456789ABCDEF";
  let current = value;
  let output = "";
  while (current > 0) {
    output = digits[current % base] + output;
    current = Math.floor(current / base);
  }
  return output;
}

export function twosComplement(value: number, width: number): string {
  const modulus = 2 ** width;
  const normalized = ((value % modulus) + modulus) % modulus;
  return binary(normalized, width);
}
