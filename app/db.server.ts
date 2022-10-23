import fs from 'fs/promises';
import path from 'path';
import { v4 } from 'uuid';
import { deserialize } from './hooks/useDeserialize';
import type { Entry } from './types';

/**
 * For error testing purposes
 */
const WITH_ERRORS = false;
function throwErrorMaybe(likelihood = 0.5) {
  if (WITH_ERRORS && Math.random() < likelihood) {
    throw new Error('Something went wrong');
  }
}

/*
 * Gets all entries from db.json "database".
 */
export async function getAllEntries(): Promise<Entry[]> {
  const fileContents = await fs.readFile(path.join(process.cwd(), 'db.json'), 'utf-8');
  const data = JSON.parse(fileContents);
  const entries = deserialize<Entry[]>(data.entries);
  return entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/*
 * Adds a entry to the db.json "database".
 */
export async function addEntry(name: string, message: string) {
  throwErrorMaybe();
  const entry: Entry = { id: v4(), name, message, likes: 0, createdAt: new Date() };
  const fileContents = await fs.readFile(path.join(process.cwd(), 'db.json'), 'utf-8');
  const data = JSON.parse(fileContents);
  data.entries.push(entry);
  await fs.writeFile(path.join(process.cwd(), 'db.json'), JSON.stringify(data, null, 2));
  return entry;
}

/*
 * Adds/Removes likes to/from an entry in the db.json "database".
 */
export async function updateLikes(id: string, byValue: number) {
  throwErrorMaybe(0.1);
  const entries = await getAllEntries();
  const entry = entries.find((entry) => entry.id === id);
  if (!entry) {
    throw Error('Entry not found');
  }
  entry.likes = entry.likes + byValue;
  await fs.writeFile(path.join(process.cwd(), 'db.json'), JSON.stringify({ entries }, null, 2));
  return entry;
}

/*
 * Delete an entry from the db.json "database".
 */
export async function deleteEntry(id: string) {
  throwErrorMaybe();
  const entries = await getAllEntries();
  const newEntries = entries.filter((entry) => entry.id !== id);
  await fs.writeFile(path.join(process.cwd(), 'db.json'), JSON.stringify({ entries: newEntries }, null, 2));
}
