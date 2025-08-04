import { HandlerMetadata } from "./handler-metadata.interface";
import { RequiredNestRMQOptions } from "../../configs/types/required-options.type";
import { EventMetadata } from "../../events/interfaces/event-metadata.interface";

export interface HandlerEventQueueNameStrategy {
  resolveQueueName(
    handlerMetadata: HandlerMetadata,
    eventMetadata: EventMetadata,
    rmqOptions: RequiredNestRMQOptions,
  ): string;
}
