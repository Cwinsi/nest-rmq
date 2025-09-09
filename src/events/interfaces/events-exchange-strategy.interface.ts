import { AnyEventClass } from "../types/event-class.type";
import { EventMetadata } from "./event-metadata.interface";
import { RequiredNestRMQOptions } from "../../configs/types/required-options.type";
import { ChannelWrapper } from "amqp-connection-manager";

export interface EventsExchangeStrategy {
  getEventExchangeName(
    channelWrapper: ChannelWrapper,
    eventMetadata: EventMetadata,
    event: AnyEventClass,
    config: RequiredNestRMQOptions,
  ): Promise<string>;
}
