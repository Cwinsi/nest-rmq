import "reflect-metadata";
import { HandlerMetadata } from "../interfaces/handler-metadata.interface";
import { HandlerOptions } from "../interfaces/handler-options.interface";
import { EventClass } from "../../events/types/event-class.type";
import { EventDeliveryContext } from "../context/event-delivery.context";

const eventHandlerMetadataSymbol = Symbol("eventHandlerMetadata");

export const EventHandler = <Event>(
  eventClass: EventClass<Event>,
  options: HandlerOptions = {},
) => {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<
      (event: Event, ...args: EventDeliveryContext[]) => any
    >,
  ) => {
    if (!descriptor.value) {
      throw new Error(
        `@EventHandler decorator can only be applied to methods, but '${String(propertyKey)}' has no value.`,
      );
    }

    const handlerMetadata: HandlerMetadata = {
      eventClass,
      handlerClass: target,
      methodName: String(propertyKey),
      className: target.constructor.name,
      options,
    };

    Reflect.defineMetadata(
      eventHandlerMetadataSymbol,
      handlerMetadata,
      descriptor.value,
    );
  };
};

export const getEventHandlerMetadata = (
  target: Function,
): HandlerMetadata | null => {
  return Reflect.getMetadata(eventHandlerMetadataSymbol, target);
};
