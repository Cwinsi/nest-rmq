import { EventsExchangeStrategy } from "../interfaces/events-exchange-strategy.interface";
import { Channel } from "amqplib";

export class SingleExchangeStrategy implements EventsExchangeStrategy {
  constructor(private readonly exchangeName: string = "nest-rmq") {}

  private exchangeAsserted = false;

  async getEventExchangeName(channel: Channel): Promise<string> {
    if (this.exchangeAsserted) {
      return this.exchangeName;
    }

    await channel.assertExchange(this.exchangeName, "direct", {
      durable: true,
    });

    this.exchangeAsserted = true;

    return this.exchangeName;
  }
}
