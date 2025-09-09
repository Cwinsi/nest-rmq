import { HandlerExplorerMethodInterface } from "../../../handler-explorer/interfaces/handler-explorer-method.interface";
import { AssertHandlerTypeInterface } from "../../interfaces/assert-handler-type.interface";
import { Injectable } from "@nestjs/common";
import { ConfigsService } from "../../../configs/configs.service";
import { ChannelWrapper } from "amqp-connection-manager";
import { Channel } from "amqplib";

@Injectable()
export class AssertProcessorHandlerService
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
      await channel.assertQueue(handlerQueueName, {
        durable: handlerConfig.durable,
      });

      await channel.bindQueue(
        handlerQueueName,
        eventExchange,
        handler.eventMetadata.name,
      );
    });

    return handlerQueueName;
  }
}
