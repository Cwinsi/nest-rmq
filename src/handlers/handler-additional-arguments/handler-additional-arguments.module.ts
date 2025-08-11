import { Module } from "@nestjs/common";
import { handlerAdditionalArgumentsListSymbol } from "./symbols/handler-additional-arguments-list.symbol";
import { EventDeliveryHandlerAdditionalArgument } from "./arguments/event-delivery.handler-additional-argument";
import { EventPropertiesHandlerAdditionalArgument } from "./arguments/event-properties.handler-additional-argument";
import { HandlerAdditionalArgumentPipelineService } from "./services/handler-additional-argument-pipeline.service";

@Module({
  providers: [
    HandlerAdditionalArgumentPipelineService,

    {
      provide: handlerAdditionalArgumentsListSymbol,
      useFactory: () => [
        new EventDeliveryHandlerAdditionalArgument(),
        new EventPropertiesHandlerAdditionalArgument(),
      ],
    },
  ],
  exports: [HandlerAdditionalArgumentPipelineService],
})
export class HandlerAdditionalArgumentsModule {}
