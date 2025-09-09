import { EventClass } from "../../events/types/event-class.type";
import { EventProducer } from "../event-producer";
import { AmqpConnectionService } from "../../amqp/services/amqp-connection.service";
import { getEventMetadata } from "../../events/decorators/event.decorator";
import { ConfigsService } from "../../configs/configs.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class EventProducerFactory {
  constructor(
    private readonly amqpConnectionService: AmqpConnectionService,
    private readonly configsService: ConfigsService,
  ) {}

  async getProducer<Event>(
    eventClass: EventClass<Event>,
  ): Promise<EventProducer<Event>> {
    const channelWrapper = await this.amqpConnectionService.getChannelWrapper();

    const eventMetadata = getEventMetadata(eventClass);
    if (!eventMetadata)
      throw new Error(`Event ${eventClass.name} has no @Event decorator`);

    const configs = this.configsService.getConfigs();

    const exchangeName =
      await configs.eventsExchangeStrategy.getEventExchangeName(
        channelWrapper,
        eventMetadata,
        eventClass,
        configs,
      );

    return new EventProducer<Event>(
      this.amqpConnectionService,
      eventMetadata,
      exchangeName,
    );
  }
}
