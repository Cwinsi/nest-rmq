import "reflect-metadata";
import { EventPropertiesContext } from "../context/event-properties.context";

const eventHandlerPropertiesMetadataSymbol = Symbol(
  "eventHandlerPropertiesMetadata",
);

export function EventProperties(): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    if (!propertyKey) {
      throw new Error(
        `@EventProperties decorator can only be applied be used on argument.`,
      );
    }

    const parameterTypes = Reflect.getMetadata(
      "design:paramtypes",
      target,
      propertyKey,
    );
    const paramType = parameterTypes?.[parameterIndex];

    if (paramType !== EventPropertiesContext) {
      throw new Error(
        "@EventProperties can only be used on parameters of type EventPropertiesContext.",
      );
    }

    const existingIndices: number[] =
      Reflect.getOwnMetadata(
        eventHandlerPropertiesMetadataSymbol,
        target,
        propertyKey!,
      ) || [];

    Reflect.defineMetadata(
      eventHandlerPropertiesMetadataSymbol,
      [...existingIndices, parameterIndex],
      target,
      propertyKey,
    );
  };
}

export const getEventHandlerPropertiesIndexesMetadata = (
  target: Object,
  propertyKey: string,
): number[] => {
  return (
    Reflect.getOwnMetadata(
      eventHandlerPropertiesMetadataSymbol,
      target,
      propertyKey!,
    ) || []
  );
};
