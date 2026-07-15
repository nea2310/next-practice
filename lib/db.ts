// lib/db.ts
export const users: { id: string; username: string; passwordHash: string }[] = [];

export let dataStore = {
  items: [
    { id: 'init-1', text: 'Initial item 1' },
    { id: 'init-2', text: 'Initial item 2' },
  ],
  lastUpdate: Date.now(),
};

export let idCounter = 3;

export function generateId() {
  return `item-${idCounter++}`;
}
