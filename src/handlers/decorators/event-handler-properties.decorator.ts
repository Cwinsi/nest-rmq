import "reflect-metadata";

const eventHandlerPropertiesMetadataSymbol = Symbol(
  "eventHandlerPropertiesMetadataSymbol",
);

// TODO: add test cases
export function EventProperties(): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    if (!propertyKey) {
      throw new Error(
        `@EventProperties decorator can only be applied be used on argument.`,
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
