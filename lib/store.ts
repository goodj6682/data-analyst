import { ParsedData } from "@/types";

const store = new Map<string, ParsedData>();

export function saveData(id: string, data: ParsedData): void {
  store.set(id, data);
}

export function getData(id: string): ParsedData | undefined {
  return store.get(id);
}

export function hasData(id: string): boolean {
  return store.has(id);
}
