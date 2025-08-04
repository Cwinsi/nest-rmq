import { AnyEventClass } from "../types/event-class.type";
import { EventMetadata } from "./event-metadata.interface";
import { Channel } from "amqplib";
import { RequiredNestRMQOptions } from "../../configs/types/required-options.type";

export interface EventsExchangeStrategy {
  getEventExchangeName(
    // TODO: remove amqplib dependency in code, aggregate in amqp service
    channel: Channel,
    eventMetadata: EventMetadata,
    event: AnyEventClass,
    config: RequiredNestRMQOptions,
  ): Promise<string>;
}
