import { forwardRef, Module } from "@nestjs/common";
import { AssertHandlerService } from "./services/assert-handler.service";
import { ConfigsModule } from "../configs/configs.module";
import { AmqpModule } from "../amqp/amqp.module";
import { HandlerExplorerModule } from "../handler-explorer/handler-explorer.module";
import { HandlerAdditionalArgumentsModule } from "./handler-additional-arguments/handler-additional-arguments.module";
import { AssertProcessorHandlerService } from "./services/handler-types/assert-processor-handler.service";

@Module({
  providers: [AssertHandlerService, AssertProcessorHandlerService],
  exports: [AssertHandlerService],
  imports: [
    ConfigsModule,
    HandlerExplorerModule,
    HandlerAdditionalArgumentsModule,

    forwardRef(() => AmqpModule),
  ],
})
export class HandlersModule {}
