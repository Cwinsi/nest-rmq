import { HandlerMetadata } from "../interfaces/handler-metadata.interface";

export const eventHandlerMetadataSymbol = Symbol("eventHandlerMetadata");

export const getEventProcessorMetadata = (
  target: Function,
): HandlerMetadata | null => {
  return Reflect.getMetadata(eventHandlerMetadataSymbol, target);
};
