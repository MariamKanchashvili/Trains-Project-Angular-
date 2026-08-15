import { Service } from '@angular/core';

@Service()
export class StorageService {

  set(key: string, value: any, persistent: boolean = false) {
    const storage = persistent ? localStorage : sessionStorage;
    storage.setItem(key, JSON.stringify(value));
  }

  get(key: string, persistent: boolean = false) {
    const storage = persistent ? localStorage : sessionStorage;
    const data = storage.getItem(key);

    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  remove(key: string, persistent: boolean = false) {
    const storage = persistent ? localStorage : sessionStorage;
    storage.removeItem(key);
  }
}