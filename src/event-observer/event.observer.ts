import events from 'events';
import { EventObservable } from './event.observable';

export const appEventEmitter = new events.EventEmitter();

export class EventObserver {
    public constructor(private readonly observable: EventObservable) {}

    public static observe = (observable: EventObservable): EventObserver => {
        appEventEmitter.on(observable.getEventId(), () => {});
        return new EventObserver(observable);
    };
}
