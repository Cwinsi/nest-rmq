import "reflect-metadata";
import { HandlerMetadata } from "../interfaces/handler-metadata.interface";
import { HandlerOptions } from "../interfaces/handler-options.interface";
import { EventClass } from "../../events/types/event-class.type";
import { HandlerAdditionalArgumentType } from "../types/handler-additional-argument.type";
import { HandlerType } from "../enums/handler-type.enum";
import { eventHandlerMetadataSymbol } from "../utils/event-processor-metadata.util";

export const EventSubscription = <Event>(
  eventClass: EventClass<Event>,
  options: HandlerOptions = {},
) => {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<
      (event: Event, ...args: (HandlerAdditionalArgumentType | any)[]) => any
    >,
  ) => {
    if (!descriptor.value) {
      throw new Error(
        `@EventSubscription decorator can only be applied to methods, but '${String(propertyKey)}' has no value.`,
      );
    }

    const handlerMetadata: HandlerMetadata = {
      eventClass,
      handlerClass: target,
      methodName: String(propertyKey),
      className: target.constructor.name,
      options,
      type: HandlerType.SUBSCRIPTION,
    };

    Reflect.defineMetadata(
      eventHandlerMetadataSymbol,
      handlerMetadata,
      descriptor.value,
    );
  };
};
