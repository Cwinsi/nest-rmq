import { HandlerConsumeDataInterface } from "../../interfaces/handler-consume-data.interface";
import { HandlerAdditionalArgumentInterface } from "../interfaces/handler-additional-argument.interface";
import { getEventHandlerDeliveryIndexesMetadata } from "../../decorators/./event-delivery.decorator";
import { EventDeliveryContext } from "../../context/event-delivery.context";

export class EventDeliveryHandlerAdditionalArgument
  implements HandlerAdditionalArgumentInterface
{
  execute(consumeData: HandlerConsumeDataInterface): void {
    const { handler, message, channel } = consumeData;
    const handlerDeliveryContext = new EventDeliveryContext(message, channel);

    consumeData.handlerDeliveryContext = handlerDeliveryContext;

    const eventDeliveryArgumentIndexes = getEventHandlerDeliveryIndexesMetadata(
      handler.handlerMetadata.handlerClass,
      handler.handlerMetadata.methodName,
    );

    if (eventDeliveryArgumentIndexes.length > 1) {
      throw new Error(
        `Only one @EventDelivery decorator allowed to apply for one handler`,
      );
    }

    for (const eventDeliveryArgumentIndex of eventDeliveryArgumentIndexes) {
      consumeData.additionalArguments[eventDeliveryArgumentIndex] =
        handlerDeliveryContext;
    }

    const automaticDeliveryControl = eventDeliveryArgumentIndexes.length === 0;

    if (automaticDeliveryControl) {
      consumeData.automaticProcessing = true;
    }
  }
}
