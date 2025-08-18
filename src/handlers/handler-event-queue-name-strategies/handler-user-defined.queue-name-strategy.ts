import { HandlerEventQueueNameStrategy } from "../interfaces/handler-event-queue-name-strategy.interface";
import { HandlerMetadata } from "../interfaces/handler-metadata.interface";
import { EventMetadata } from "../../events/interfaces/event-metadata.interface";

// TODO: add tests
export class HandlerUserDefinedQueueNameStrategy
  implements HandlerEventQueueNameStrategy
{
  resolveQueueName(
    handlerMetadata: HandlerMetadata,
    eventMetadata: EventMetadata,
  ): string {
    if (!handlerMetadata.options.queueName) {
      throw new Error(
        `Handler for ${eventMetadata.name} event in ${handlerMetadata.methodName}.${handlerMetadata.className} doesn't have queue name.`,
      );
    }

    return handlerMetadata.options.queueName;
  }
}
