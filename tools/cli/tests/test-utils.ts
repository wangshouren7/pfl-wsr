export function nameOf<TObject>(obj: TObject, key: keyof TObject): string;
export function nameOf<TObject>(key: keyof TObject): string;
export function nameOf(key1: unknown, key2?: unknown): unknown {
  return key2 ?? key1;
}
