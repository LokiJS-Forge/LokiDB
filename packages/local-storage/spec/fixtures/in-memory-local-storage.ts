export class InMemoryLocalStorage implements Storage {
  private data: Record<string, string> = {};

  length: number;
  clear(): void {
    this.data = {};
  }
  getItem(key: string): string | null {
    return this.data[key];
  }
  key(index: number): string | null {
    return Object.keys(this.data)[index] || null;
  }
  removeItem(key: string): void {
    if (key in this.data) {
      delete this.data[key];
    }
  }
  setItem(key: string, value: string): void {
    this.data[key] = value;
  }
}

export class AsyncInMemoryLocalStorage {
  private data: Record<string, string> = {};

  length: number;
  async clear(): Promise<void> {
    this.data = {};
  }
  async getItem(key: string): Promise<string | null> {
    return this.data[key];
  }
  async key(index: number): Promise<string | null> {
    return Object.keys(this.data)[index] || null;
  }
  async removeItem(key: string): Promise<void> {
    if (key in this.data) {
      delete this.data[key];
    }
  }
  async setItem(key: string, value: string): Promise<void> {
    this.data[key] = value;
  }
}
