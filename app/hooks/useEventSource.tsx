import { useEffect } from 'react';

export enum SSEvents {
  messageCreated = 'message-created',
  likesChanged = 'likes-changed',
}

type EventHandlers = Array<{
  event: SSEvents;
  handler: (event: MessageEvent) => void;
}>;

/*
 * SSE code copy-pasted from discussion in SSE discussion on GitHub:
 * https://github.com/remix-run/remix/discussions/2622
 * Mostly from Ryan Florence's post:
 * https://github.com/remix-run/remix/discussions/2622#discussioncomment-3916017
 * dan-cooke created remix-sse package: https://github.com/baggers-org/remix-sse
 * Jacob Ebey has a great demo as well: https://github.com/jacob-ebey/remix-sse-live-viewers
 */
export function useEventSource(href: string, eventHandlers: EventHandlers) {
  useEffect(() => {
    const eventSource = new EventSource(href);
    eventHandlers.forEach(({ event, handler }) => {
      eventSource.addEventListener(event, handler);
    });

    return () => {
      eventHandlers.forEach(({ event, handler }) => {
        eventSource.removeEventListener(event, handler);
      });
      eventSource.close();
    };
  }, []);
}
