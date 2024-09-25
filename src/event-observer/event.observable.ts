export interface EventObservable {
    getEventId: () => string;
    isCompleted: () => boolean;
}
