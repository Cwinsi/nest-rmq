import "reflect-metadata";
import { EventDeliveryContext } from "../context/event-delivery.context";

const eventHandlerDeliveryMetadataSymbol = Symbol(
  "eventHandlerDeliveryMetadataSymbol",
);

export function EventDelivery(): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    if (!propertyKey) {
      throw new Error(
        `@EventDelivery decorator can only be applied be used on argument.`,
      );
    }

    const parameterTypes = Reflect.getMetadata(
      "design:paramtypes",
      target,
      propertyKey,
    );
    const paramType = parameterTypes?.[parameterIndex];

    if (paramType !== EventDeliveryContext) {
      throw new Error(
        "@EventDelivery can only be used on parameters of type EventDeliveryContext.",
      );
    }

    const existingIndices: number[] =
      Reflect.getOwnMetadata(
        eventHandlerDeliveryMetadataSymbol,
        target,
        propertyKey!,
      ) || [];

    Reflect.defineMetadata(
      eventHandlerDeliveryMetadataSymbol,
      [...existingIndices, parameterIndex],
      target,
      propertyKey,
    );
  };
}

export const getEventHandlerDeliveryIndexesMetadata = (
  target: Object,
  propertyKey: string,
): number[] => {
  return (
    Reflect.getOwnMetadata(
      eventHandlerDeliveryMetadataSymbol,
      target,
      propertyKey!,
    ) || []
  );
};
