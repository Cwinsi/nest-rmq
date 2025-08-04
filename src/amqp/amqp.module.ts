import { Module } from "@nestjs/common";
import { ConfigsModule } from "../configs/configs.module";
import { AmqpConnectionService } from "./services/amqp-connection.service";

@Module({
  imports: [ConfigsModule],
  providers: [AmqpConnectionService],
  exports: [AmqpConnectionService],
})
export class AmqpModule {}
