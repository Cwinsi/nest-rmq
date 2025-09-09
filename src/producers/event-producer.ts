import { EventMetadata } from "../events/interfaces/event-metadata.interface";
import { AmqpConnectionService } from "../amqp/services/amqp-connection.service";

export class EventProducer<Event> {
  constructor(
    private readonly amqpConnectionService: AmqpConnectionService,
    private readonly eventMetadata: EventMetadata,
    private readonly eventExchangeName: string,
  ) {}

  async publish(event: Event): Promise<void> {
    const payload = Buffer.from(JSON.stringify(event));
    const channelWrapper = await this.amqpConnectionService.getChannelWrapper();

    await channelWrapper.publish(
      this.eventExchangeName,
      this.eventMetadata.name,
      payload,
      {
        persistent: true,
      },
    );
  }
}
