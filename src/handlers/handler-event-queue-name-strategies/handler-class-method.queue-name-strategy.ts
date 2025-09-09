import { HandlerEventQueueNameStrategy } from "../interfaces/handler-event-queue-name-strategy.interface";
import { HandlerMetadata } from "../interfaces/handler-metadata.interface";
import { EventMetadata } from "../../events/interfaces/event-metadata.interface";

export class HandlerClassMethodQueueNameStrategy
  implements HandlerEventQueueNameStrategy
{
  resolveQueueName(
    handlerMetadata: HandlerMetadata,
    eventMetadata: EventMetadata,
  ): string {
    return `${eventMetadata.name}_${handlerMetadata.type}_${handlerMetadata.methodName}_${handlerMetadata.className}`;
  }
}
