# My Remix Hooks

This demo app showcases my custom Remix hooks in action.

## Hooks

- `useMatchesData` - Query loader data across your app
- `useDeserialize` - Deserializes server-data (string to Date, etc)
- `useFormState` - Global transition/form state
- `useFetcherState` - Fetcher state
- `useEventSource` - EventSource hook

## Demo

Run the app in development mode:

```sh
npm i
npm run dev
```

Open the app in your browser. You will find the three following routes:

- `/message-board` - Implements a no-JavaScript message board.
- `/message-board-final` - Implements an enhanced version using my custom hooks.
- `/message-board-ludicrous` - Implements an reactive version using my custom hooks.
