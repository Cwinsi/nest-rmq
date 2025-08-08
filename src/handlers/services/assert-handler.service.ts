import { AmqpConnectionService } from "../../amqp/services/amqp-connection.service";
import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { HandlerExplorerMethodInterface } from "../../handler-explorer/interfaces/handler-explorer-method.interface";
import { ConfigsService } from "../../configs/configs.service";
import { HandlerExplorerService } from "../../handler-explorer/services/handler-explorer.service";
import { getEventHandlerDeliveryIndexesMetadata } from "../decorators/event-handler-delivery.decorator";
import { EventDeliveryContext } from "../context/event-delivery.context";
import { getEventHandlerPropertiesIndexesMetadata } from "../decorators/event-handler-properties.decorator";
import { plainObjectToInstanceUtil } from "../../utils/plain-object-to-instance.util";

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

    const eventDeliveryArgumentIndexes = getEventHandlerDeliveryIndexesMetadata(
      handler.handlerMetadata.handlerClass,
      handler.handlerMetadata.methodName,
    );

    // TODO: refactor
    if (eventDeliveryArgumentIndexes.length > 1) {
      throw new Error(
        `Only one @EventDelivery decorator allowed to apply for one handler`,
      );
    }

    const eventPropertiesArgumentIndexes =
      getEventHandlerPropertiesIndexesMetadata(
        handler.handlerMetadata.handlerClass,
        handler.handlerMetadata.methodName,
      );

    const automaticDeliveryControl = eventDeliveryArgumentIndexes.length === 0;

    await channel.consume(handlerQueueName, async (message) => {
      if (!message) {
        return;
      }

      const eventData = JSON.parse(message.content.toString());
      const event = plainObjectToInstanceUtil(
        handler.handlerMetadata.eventClass,
        eventData,
      );
      const handlerArgs: any[] = [event];

      for (const eventPropertiesArgumentIndex of eventPropertiesArgumentIndexes) {
        handlerArgs[eventPropertiesArgumentIndex] = message.properties;
      }

      const handlerDeliveryContext = new EventDeliveryContext(message, channel);

      // TODO: move to dedicated services
      if (automaticDeliveryControl) {
        try {
          await handler.method.apply(
            handler.handlerMetadata.handlerClass,
            handlerArgs,
          );

          handlerDeliveryContext.ack();
        } catch (_) {
          // TODO: add logs
          handlerDeliveryContext.nack();
        }
      } else {
        for (const eventDeliveryArgumentIndex of eventDeliveryArgumentIndexes) {
          handlerArgs[eventDeliveryArgumentIndex] = handlerDeliveryContext;
        }

        await handler.method.apply(
          handler.handlerMetadata.handlerClass,
          handlerArgs,
        );
      }
    });
  }
}
