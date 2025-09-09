import { EventsExchangeStrategy } from "../interfaces/events-exchange-strategy.interface";
import { EventMetadata } from "../interfaces/event-metadata.interface";
import { ChannelWrapper } from "amqp-connection-manager";
import { Channel } from "amqplib";

export class EveryEventExchangeStrategy implements EventsExchangeStrategy {
  constructor(private readonly exchangePrefix: string = "nest-rmq-event") {}

  private eventExchanges = new Map<string, string>();

  async getEventExchangeName(
    channelWrapper: ChannelWrapper,
    eventMetadata: EventMetadata,
  ): Promise<string> {
    const eventName = eventMetadata.name;
    const existedExchangeName = this.eventExchanges.get(eventName);

    if (existedExchangeName) {
      return existedExchangeName;
    }

    const exchangeName = `${this.exchangePrefix}.${eventName}`;

    await channelWrapper.addSetup((channel: Channel) =>
      channel.assertExchange(exchangeName, "direct", {
        durable: true,
      }),
    );

    this.eventExchanges.set(eventName, exchangeName);
    return exchangeName;
  }
}
