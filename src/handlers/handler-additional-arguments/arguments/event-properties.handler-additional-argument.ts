import { HandlerConsumeDataInterface } from "../../interfaces/handler-consume-data.interface";
import { HandlerAdditionalArgumentInterface } from "../interfaces/handler-additional-argument.interface";
import { getEventHandlerPropertiesIndexesMetadata } from "../../decorators/event-properties.decorator";
import { plainObjectToInstanceUtil } from "../../../utils/plain-object-to-instance.util";
import { EventPropertiesContext } from "../../context/event-properties.context";

export class EventPropertiesHandlerAdditionalArgument
  implements HandlerAdditionalArgumentInterface
{
  execute(consumeData: HandlerConsumeDataInterface): void {
    const { handler, message } = consumeData;

    const properties = plainObjectToInstanceUtil(
      EventPropertiesContext,
      message.properties,
    );

    const eventPropertiesArgumentIndexes =
      getEventHandlerPropertiesIndexesMetadata(
        handler.handlerMetadata.handlerClass,
        handler.handlerMetadata.methodName,
      );

    for (const eventPropertiesArgumentIndex of eventPropertiesArgumentIndexes) {
      consumeData.additionalArguments[eventPropertiesArgumentIndex] =
        properties;
    }
  }
}
