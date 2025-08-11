import { HandlerConsumeDataInterface } from "../interfaces/handler-consume-data.interface";
import { HandlerExplorerMethodInterface } from "../../handler-explorer/interfaces/handler-explorer-method.interface";
import { ConsumeMessage } from "amqplib/properties";
import { Channel } from "amqplib";
import { HandlerAdditionalArgumentInterface } from "../handler-additional-arguments/interfaces/handler-additional-argument.interface";
import { HandlerAdditionalArgumentType } from "../types/handler-additional-argument.type";
import { plainObjectToInstanceUtil } from "../../utils/plain-object-to-instance.util";

interface HandlerConsumeDataBuilderHandlerStep {
  withHandler(
    handler: HandlerExplorerMethodInterface,
  ): HandlerConsumeDataBuilderHandlerMessageStep;
}

interface HandlerConsumeDataBuilderHandlerMessageStep {
  withMessage(
    message: ConsumeMessage,
  ): HandlerConsumeDataBuilderHandlerChannelStep;
}

interface HandlerConsumeDataBuilderHandlerChannelStep {
  withChannel(channel: Channel): HandlerConsumeDataBuilderHandlerEvensStep;
}

interface HandlerConsumeDataBuilderHandlerEvensStep {
  withEvent(event: Event): HandlerConsumeDataBuilderHandlerArgumentsStep;
  withEventJsonContentBuffer(
    content: Buffer,
  ): HandlerConsumeDataBuilderHandlerArgumentsStep;
}

interface HandlerConsumeDataBuilderHandlerArgumentsStep {
  withArgumentPipeline(
    pipeline: HandlerAdditionalArgumentInterface[],
  ): HandlerConsumeDataBuilderHandlerBuildStep;

  withAdditionalArguments(
    additionalArguments: HandlerAdditionalArgumentType[],
    automaticProcessing: boolean,
  ): HandlerConsumeDataBuilderHandlerBuildStep;
}

export interface HandlerConsumeDataBuilderHandlerBuildStep {
  buildArguments(): any[];
  build(): HandlerConsumeDataInterface;
}

export class HandlerConsumeDataBuilder
  implements
    HandlerConsumeDataBuilderHandlerStep,
    HandlerConsumeDataBuilderHandlerMessageStep,
    HandlerConsumeDataBuilderHandlerChannelStep,
    HandlerConsumeDataBuilderHandlerEvensStep,
    HandlerConsumeDataBuilderHandlerArgumentsStep,
    HandlerConsumeDataBuilderHandlerBuildStep
{
  private handlerConsumeData: Partial<HandlerConsumeDataInterface> = {
    additionalArguments: [],
  };

  static builder(): HandlerConsumeDataBuilder {
    return new HandlerConsumeDataBuilder();
  }

  withHandler(
    handler: HandlerExplorerMethodInterface,
  ): HandlerConsumeDataBuilderHandlerMessageStep {
    this.handlerConsumeData.handler = handler;
    return this;
  }

  withChannel(channel: Channel): HandlerConsumeDataBuilderHandlerEvensStep {
    this.handlerConsumeData.channel = channel;
    return this;
  }

  withMessage(
    message: ConsumeMessage,
  ): HandlerConsumeDataBuilderHandlerChannelStep {
    this.handlerConsumeData.message = message;
    return this;
  }

  withEvent(event: Event): HandlerConsumeDataBuilderHandlerArgumentsStep {
    this.handlerConsumeData.event = event;

    return this;
  }

  withEventJsonContentBuffer(
    content: Buffer,
  ): HandlerConsumeDataBuilderHandlerArgumentsStep {
    const plainEvent = JSON.parse(content.toString());
    const handler = this.handlerConsumeData.handler!;

    this.handlerConsumeData.event = plainObjectToInstanceUtil(
      handler.handlerMetadata.eventClass,
      plainEvent,
    );

    return this;
  }

  withAdditionalArguments(
    additionalArguments: HandlerAdditionalArgumentType[],
    automaticProcessing = true,
  ): HandlerConsumeDataBuilderHandlerBuildStep {
    this.handlerConsumeData.automaticProcessing = automaticProcessing;
    this.handlerConsumeData.additionalArguments = additionalArguments;

    return this;
  }

  withArgumentPipeline(
    pipeline: HandlerAdditionalArgumentInterface[],
  ): HandlerConsumeDataBuilderHandlerBuildStep {
    pipeline.forEach((pipelineArgument) =>
      pipelineArgument.execute(
        this.handlerConsumeData as HandlerConsumeDataInterface,
      ),
    );

    return this;
  }

  build(): HandlerConsumeDataInterface {
    return this.handlerConsumeData as HandlerConsumeDataInterface;
  }

  buildArguments(): any[] {
    const consumeData = this.build();

    const additionalArguments = [...consumeData.additionalArguments];

    additionalArguments[0] = this.handlerConsumeData.event;

    return additionalArguments;
  }
}
