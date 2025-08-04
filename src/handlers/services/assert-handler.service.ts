import { AmqpConnectionService } from "../../amqp/services/amqp-connection.service";
import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { HandlerExplorerMethodInterface } from "../../handler-explorer/interfaces/handler-explorer-method.interface";
import { ConfigsService } from "../../configs/configs.service";
import { HandlerExplorerService } from "../../handler-explorer/services/handler-explorer.service";

@Injectable()
export class AssertHandlerService implements OnApplicationBootstrap {
  constructor(
    private readonly amqpConnectionService: AmqpConnectionService,
    private readonly handlerExplorerService: HandlerExplorerService,
    private readonly configsService: ConfigsService,
  ) {}

  async onApplicationBootstrap() {
    await this.assertHandlers();
  }

  async assertHandlers(): Promise<void> {
    const handlers = this.handlerExplorerService.getEventHandlerMethods();
    const assetHandlerTasks = handlers.map(
      async (handler) => await this.assertHandler(handler),
    );

    await Promise.all(assetHandlerTasks);
  }

  async assertHandler(handler: HandlerExplorerMethodInterface): Promise<void> {
    const channel = await this.amqpConnectionService.getChannel();
    const config = this.configsService.getConfigs();

    const handlerQueueName =
      config.handlerEventQueueNameStrategy.resolveQueueName(
        handler.handlerMetadata,
        handler.eventMetadata,
        config,
      );

    const handlerConfig = this.configsService.getHandlerConfigs(
      handler.handlerMetadata.options,
    );

    const eventExchange =
      await config.eventsExchangeStrategy.getEventExchangeName(
        channel,
        handler.eventMetadata,
        handler.handlerMetadata.eventClass,
        config,
      );

    await channel.assertQueue(handlerQueueName, {
      durable: handlerConfig.durable,
    });

    await channel.bindQueue(
      handlerQueueName,
      eventExchange,
      handler.eventMetadata.name,
    );

    await channel.consume(handlerQueueName, async (message) => {
      if (!message) {
        return;
      }

      const eventData = JSON.parse(message.content.toString());
      await handler.method(eventData);
      channel.ack(message);
    });
  }
}
