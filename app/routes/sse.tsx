/*
 * SSE code copy-pasted from discussion in SSE discussion on GitHub:
 * https://github.com/remix-run/remix/discussions/2622
 * Mostly from Ryan Florence's post:
 * https://github.com/remix-run/remix/discussions/2622#discussioncomment-3916017
 * Jacob Ebey has a great demo as well: https://github.com/jacob-ebey/remix-sse-live-viewers
 */

import { LoaderArgs } from '@remix-run/node';
import type { Entry } from '~/types';
import { SSEvents } from '~/hooks/useEventSource';
import { eventStream } from '~/sse.server';
import { emitter } from '~/events.server';

export function loader({ request }: LoaderArgs) {
  return eventStream(request, (send) => {
    emitter.addListener(SSEvents.messageCreated, handleMessageCreated);
    emitter.addListener(SSEvents.likesChanged, handleLikesChanged);

    function handleMessageCreated(entry: Entry) {
      send(SSEvents.messageCreated, JSON.stringify(entry));
    }

    function handleLikesChanged(entry: Entry) {
      send(SSEvents.messageCreated, JSON.stringify(entry));
    }

    return () => {
      emitter.removeListener(SSEvents.messageCreated, handleMessageCreated);
      emitter.removeListener(SSEvents.likesChanged, handleLikesChanged);
    };
  });
}
