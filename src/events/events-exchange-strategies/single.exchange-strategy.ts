import { EventsExchangeStrategy } from "../interfaces/events-exchange-strategy.interface";
import { ChannelWrapper } from "amqp-connection-manager";
import { Channel } from "amqplib";

export class SingleExchangeStrategy implements EventsExchangeStrategy {
  constructor(private readonly exchangeName: string = "nest-rmq") {}

  private exchangeAsserted = false;

  async getEventExchangeName(channelWrapper: ChannelWrapper): Promise<string> {
    if (this.exchangeAsserted) {
      return this.exchangeName;
    }

    await channelWrapper.addSetup((channel: Channel) =>
      channel.assertExchange(this.exchangeName, "direct", {
        durable: true,
      }),
    );

    this.exchangeAsserted = true;

    return this.exchangeName;
  }
}
