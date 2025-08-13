import { AmqpConnectionService } from "../../amqp/services/amqp-connection.service";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { HandlerExplorerMethodInterface } from "../../handler-explorer/interfaces/handler-explorer-method.interface";
import { ConfigsService } from "../../configs/configs.service";
import { HandlerExplorerService } from "../../handler-explorer/services/handler-explorer.service";
import { HandlerAdditionalArgumentPipelineService } from "../handler-additional-arguments/services/handler-additional-argument-pipeline.service";
import { HandlerConsumeDataBuilder } from "../builders/handler-consume-data.builder";

@Injectable()
export class AssertHandlerService implements OnModuleInit {
  constructor(
    private readonly amqpConnectionService: AmqpConnectionService,
    private readonly handlerExplorerService: HandlerExplorerService,
    private readonly configsService: ConfigsService,
    private readonly handlerAdditionalArgumentPipelineService: HandlerAdditionalArgumentPipelineService,
  ) {}

  async onModuleInit() {
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

    const pipeline =
      this.handlerAdditionalArgumentPipelineService.getPipeline();

    await channel.consume(handlerQueueName, async (message) => {
      if (!message) {
        return;
      }

      const handlerConsumeDataBuilder = HandlerConsumeDataBuilder.builder()
        .withHandler(handler)
        .withMessage(message)
        .withChannel(channel)
        .withEventJsonContentBuffer(message.content)
        .withArgumentPipeline(pipeline);

      const handlerArguments = handlerConsumeDataBuilder.buildArguments();
      const consumeData = handlerConsumeDataBuilder.build();

      if (consumeData.automaticProcessing) {
        try {
          await handler.method.apply(handler.instance, handlerArguments);

          consumeData.handlerDeliveryContext.ack();
        } catch (_) {
          // TODO: add logs
          consumeData.handlerDeliveryContext.nack();
        }
      } else {
        await handler.method.apply(handler.instance, handlerArguments);
      }
    });
  }
}
