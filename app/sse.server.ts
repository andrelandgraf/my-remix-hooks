/*
 * SSE code copy-pasted from discussion in SSE discussion on GitHub:
 * https://github.com/remix-run/remix/discussions/2622
 * Mostly from Ryan Florence's post:
 * https://github.com/remix-run/remix/discussions/2622#discussioncomment-3916017
 * Jacob Ebey has a great demo as well: https://github.com/jacob-ebey/remix-sse-live-viewers
 */

import { SSEvents } from './hooks/useEventSource';

type InitFunction = (send: SendFunction) => CleanupFunction;
type SendFunction = (event: SSEvents, data: string) => void;
type CleanupFunction = () => void;

export function eventStream(request: Request, init: InitFunction) {
  let stream = new ReadableStream({
    start(controller) {
      let encoder = new TextEncoder();
      let send = (event: SSEvents, data: string) => {
        console.log('sent called!');
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };
      let cleanup = init(send);

      let closed = false;
      let close = () => {
        if (closed) return;
        cleanup();
        closed = true;
        request.signal.removeEventListener('abort', close);
        controller.close();
      };

      request.signal.addEventListener('abort', close);
      if (request.signal.aborted) {
        close();
        return;
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Cache-Control': 'no-store, no-transform',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream',
    },
  });
}
