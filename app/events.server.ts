import { EventEmitter } from 'events';

declare global {
  var emitter: EventEmitter;
}

global.emitter = global.emitter || new EventEmitter();

export const emitter = global.emitter;
