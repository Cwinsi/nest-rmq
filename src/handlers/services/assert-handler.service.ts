import { AmqpConnectionService } from "../../amqp/services/amqp-connection.service";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { HandlerExplorerMethodInterface } from "../../handler-explorer/interfaces/handler-explorer-method.interface";
import { HandlerExplorerService } from "../../handler-explorer/services/handler-explorer.service";
import { HandlerAdditionalArgumentPipelineService } from "../handler-additional-arguments/services/handler-additional-argument-pipeline.service";
import { HandlerConsumeDataBuilder } from "../builders/handler-consume-data.builder";
import { Channel } from "amqplib";
import { AssertHandlerTypesService } from "./assert-handler-types.service";

@Injectable()
export class AssertHandlerService implements OnModuleInit {
  constructor(
    @Inject()
    private readonly amqpConnectionService: AmqpConnectionService,

    private readonly handlerExplorerService: HandlerExplorerService,
    private readonly assertHandlerTypesService: AssertHandlerTypesService,
    private readonly handlerAdditionalArgumentPipelineService: HandlerAdditionalArgumentPipelineService,
  ) {}

  async onModuleInit() {
    await this.assertHandlers();
  }

  async assertHandlers(): Promise<void> {
    const channelWrapper = await this.amqpConnectionService.getChannelWrapper();
    const handlers = this.handlerExplorerService.getEventHandlerMethods();
    const assetHandlerTasks = handlers.map(
      async (handler) => await this.assertHandler(handler),
    );

    await Promise.all(assetHandlerTasks);

    await channelWrapper.waitForConnect();
  }

  async assertHandler(handler: HandlerExplorerMethodInterface): Promise<void> {
    const channelWrapper = await this.amqpConnectionService.getChannelWrapper();

    const assertHandlerType =
      this.assertHandlerTypesService.getAssertHandlerForTypeOrFail(
        handler.handlerMetadata.type,
      );

    const pipeline =
      this.handlerAdditionalArgumentPipelineService.getPipeline();

    const handlerQueueName = await assertHandlerType.createHandlerQueues(
      channelWrapper,
      handler,
    );

    await channelWrapper.addSetup((channel: Channel) => {
      channel.consume(handlerQueueName, async (message) => {
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

        // TODO: refactor
        if (consumeData.automaticProcessing) {
          try {
            await handler.method.apply(handler.instance, handlerArguments);

            consumeData.handlerDeliveryContext.ack();
          } catch (_) {
            consumeData.handlerDeliveryContext.nack();
          }
        } else {
          await handler.method.apply(handler.instance, handlerArguments);
        }
      });
    });
  }
}
