import { HandlerExplorerMethodInterface } from "../../../handler-explorer/interfaces/handler-explorer-method.interface";
import { AssertHandlerTypeInterface } from "../../interfaces/assert-handler-type.interface";
import { Injectable } from "@nestjs/common";
import { ConfigsService } from "../../../configs/configs.service";
import { ChannelWrapper } from "amqp-connection-manager";
import { Channel } from "amqplib";
import { HandlerType } from "../../enums/handler-type.enum";

@Injectable()
export class AssertSubscriptionHandlerService
  implements AssertHandlerTypeInterface
{
  constructor(private readonly configsService: ConfigsService) {}

  async createHandlerQueues(
    channelWrapper: ChannelWrapper,
    handler: HandlerExplorerMethodInterface,
  ): Promise<string> {
    const config = this.configsService.getConfigs();

    const handlerQueueName =
      config.handlerEventQueueNameStrategy.resolveQueueName(
        handler.handlerMetadata,
        handler.eventMetadata,
        config,
      );

    const handlerQueueNameWithInstance = `${handlerQueueName}_${this.configsService.getConfigs().instanceId}`;
    const handlerConfig = this.configsService.getHandlerConfigs(
      handler.handlerMetadata.options,
    );

    const eventExchange =
      await config.eventsExchangeStrategy.getEventExchangeName(
        channelWrapper,
        handler.eventMetadata,
        handler.handlerMetadata.eventClass,
        config,
      );

    await channelWrapper.addSetup(async (channel: Channel) => {
      await channel.assertQueue(handlerQueueNameWithInstance, {
        durable: handlerConfig.durable,
        autoDelete: true,
      });

      await channel.bindQueue(
        handlerQueueNameWithInstance,
        eventExchange,
        handler.eventMetadata.name,
      );
    });

    return handlerQueueNameWithInstance;
  }

  getHandlerType(): HandlerType {
    return HandlerType.SUBSCRIPTION;
  }
}
