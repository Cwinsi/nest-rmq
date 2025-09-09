import { forwardRef, Module } from "@nestjs/common";
import { AssertHandlerService } from "./services/assert-handler.service";
import { ConfigsModule } from "../configs/configs.module";
import { AmqpModule } from "../amqp/amqp.module";
import { HandlerExplorerModule } from "../handler-explorer/handler-explorer.module";
import { HandlerAdditionalArgumentsModule } from "./handler-additional-arguments/handler-additional-arguments.module";
import { AssertProcessorHandlerService } from "./services/handler-types/assert-processor-handler.service";
import { assertHandlerTypesListSymbol } from "./symbols/assert-handler-types-list.symbol";
import { AssertSubscriptionHandlerService } from "./services/handler-types/assert-subscription-handler.service";
import { AssertHandlerTypeInterface } from "./interfaces/assert-handler-type.interface";
import { AssertHandlerTypesService } from "./services/assert-handler-types.service";

@Module({
  providers: [
    AssertHandlerService,
    AssertHandlerTypesService,

    AssertProcessorHandlerService,
    AssertSubscriptionHandlerService,

    {
      useFactory: (...assertHandlerTypes: AssertHandlerTypeInterface[]) =>
        assertHandlerTypes,

      inject: [AssertProcessorHandlerService, AssertSubscriptionHandlerService],
      provide: assertHandlerTypesListSymbol,
    },
  ],
  exports: [AssertHandlerService],
  imports: [
    ConfigsModule,
    HandlerExplorerModule,
    HandlerAdditionalArgumentsModule,

    forwardRef(() => AmqpModule),
  ],
})
export class HandlersModule {}
