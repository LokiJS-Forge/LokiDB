export type SyncOrAsync<T> = T | Promise<T>;

export interface Storage {
  readonly length: number;
  clear(): SyncOrAsync<void>;
  getItem(key: string): SyncOrAsync<string | null>;
  key(index: number): SyncOrAsync<string | null>;
  removeItem(key: string): SyncOrAsync<void>;
  setItem(key: string, value: string): SyncOrAsync<void>;
}
