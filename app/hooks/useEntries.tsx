import { useCallback, useEffect, useState } from 'react';
import invariant from 'tiny-invariant';
import { Entry } from '~/types';
import { deserialize, useDeserialize } from './useDeserialize';
import { SSEvents, useEventSource } from './useEventSource';
import { useMatchesData } from './useMatchesData';

function isEntry(data: any): data is Entry {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    'message' in data &&
    'likes' in data &&
    'createdAt' in data
  );
}

function isEntryArray(data: any): data is Entry[] {
  return Array.isArray(data) && data.every(isEntry);
}

/**
 * Get entries in any nested component of /message-board
 */
export function useEntries() {
  // Use useMatchesData to get the data from the route that returns the data.
  const entries = useMatchesData('entries');
  // Deserialize the data to convert createdAt and updatedAt to Date objects.
  const deserializedEntries = useDeserialize(entries);
  // Use invariant to throw an error if the data is not an array of Entries.
  invariant(isEntryArray(deserializedEntries), 'Expected entries to be an array of entries');
  return deserializedEntries;
}

/*
 * 🔥👀🔥
 * Note: Should check if current user triggers event and then ignore it as Remix will already revalidate on mutation.
 */
export function useReactiveEntries() {
  const entries = useEntries();
  const [reactiveEntries, setReactiveEntries] = useState(entries);

  useEffect(() => {
    setReactiveEntries(entries);
  }, [entries]);

  const handleEntryChange = useCallback((event: MessageEvent) => {
    console.log(event);
    const entry = deserialize(JSON.parse(event.data));
    invariant(isEntry(entry), 'Expected entry to be an entry');
    setReactiveEntries((entries) => {
      const filteredEntries = entries.filter((e) => e.id !== entry.id);
      return [...filteredEntries, entry].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    });
  }, []);

  useEventSource('/sse', [
    { event: SSEvents.messageCreated, handler: handleEntryChange },
    { event: SSEvents.likesChanged, handler: handleEntryChange },
  ]);

  return reactiveEntries;
}
