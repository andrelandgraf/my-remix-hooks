import fs from 'fs/promises';
import path from 'path';
import { v4 } from 'uuid';
import type { Entry } from './types';

/*
 * Gets all entries from db.json "database".
 */
export async function getAllEntries(): Promise<Entry[]> {
  const fileContents = await fs.readFile(path.join(process.cwd(), 'db.json'), 'utf-8');
  const data = JSON.parse(fileContents);
  return data.entries;
}

/*
 * Adds a entry to the db.json "database".
 */
export async function addEntry(name: string, message: string) {
  const entry: Entry = { id: v4(), name, message, likes: 0 };
  const fileContents = await fs.readFile(path.join(process.cwd(), 'db.json'), 'utf-8');
  const data = JSON.parse(fileContents);
  data.entries.push(entry);
  await fs.writeFile(path.join(process.cwd(), 'db.json'), JSON.stringify(data, null, 2));
}

/*
 * Adds/Removes likes to/from an entry in the db.json "database".
 */
export async function updateLikes(id: string, byValue: number) {
  const entries = await getAllEntries();
  const entry = entries.find((entry) => entry.id === id);
  if (entry) {
    entry.likes = entry.likes + byValue;
  }
  await fs.writeFile(path.join(process.cwd(), 'db.json'), JSON.stringify({ entries }, null, 2));
}

/*
 * Delete an entry from the db.json "database".
 */
export async function deleteEntry(id: string) {
  const entries = await getAllEntries();
  const newEntries = entries.filter((entry) => entry.id !== id);
  await fs.writeFile(path.join(process.cwd(), 'db.json'), JSON.stringify({ entries: newEntries }, null, 2));
}
