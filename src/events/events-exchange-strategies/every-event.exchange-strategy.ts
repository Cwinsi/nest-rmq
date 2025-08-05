import { EventsExchangeStrategy } from "../interfaces/events-exchange-strategy.interface";
import { Channel } from "amqplib";
import { EventMetadata } from "../interfaces/event-metadata.interface";

export class EveryEventExchangeStrategy implements EventsExchangeStrategy {
  constructor(private readonly exchangePrefix: string = "nest-rmq-event") {}

  private eventExchanges = new Map<string, string>();

  async getEventExchangeName(
    channel: Channel,
    eventMetadata: EventMetadata,
  ): Promise<string> {
    const eventName = eventMetadata.name;
    const existedExchangeName = this.eventExchanges.get(eventName);

    if (existedExchangeName) {
      return existedExchangeName;
    }

    const exchangeName = `${this.exchangePrefix}.${eventName}`;

    await channel.assertExchange(exchangeName, "direct", {
      durable: true,
    });

    this.eventExchanges.set(eventName, exchangeName);
    return exchangeName;
  }
}
