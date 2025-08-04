export type EventClass<Event> = new (...args: any[]) => Event;
export type AnyEventClass = EventClass<any>;
