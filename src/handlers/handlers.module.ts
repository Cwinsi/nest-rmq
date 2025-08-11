import { Module } from "@nestjs/common";
import { AssertHandlerService } from "./services/assert-handler.service";
import { ConfigsModule } from "../configs/configs.module";
import { AmqpModule } from "../amqp/amqp.module";
import { HandlerExplorerModule } from "../handler-explorer/handler-explorer.module";
import { HandlerAdditionalArgumentsModule } from "./handler-additional-arguments/handler-additional-arguments.module";

@Module({
  providers: [AssertHandlerService],
  exports: [AssertHandlerService],
  imports: [
    ConfigsModule,
    AmqpModule,
    HandlerExplorerModule,
    HandlerAdditionalArgumentsModule,
  ],
})
export class HandlersModule {}
