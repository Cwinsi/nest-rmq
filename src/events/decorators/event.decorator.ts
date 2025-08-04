import type { EventMetadata } from "../interfaces/event-metadata.interface";

const eventMetadataSymbol = Symbol("eventMetadata");

export const Event = (name: string): ClassDecorator => {
  return function (target: Function) {
    const eventMetadata: EventMetadata = { name };

    Reflect.defineMetadata(eventMetadataSymbol, eventMetadata, target);
  };
};

export const getEventMetadata = (target: Function): EventMetadata | null => {
  return Reflect.getMetadata(eventMetadataSymbol, target);
};
