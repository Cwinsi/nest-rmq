import { forwardRef, Module } from "@nestjs/common";
import { ConfigsModule } from "../configs/configs.module";
import { AmqpConnectionService } from "./services/amqp-connection.service";
import { HandlersModule } from "../handlers/handlers.module";

@Module({
  imports: [ConfigsModule, forwardRef(() => HandlersModule)],
  providers: [AmqpConnectionService],
  exports: [AmqpConnectionService],
})
export class AmqpModule {}
