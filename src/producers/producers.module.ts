import { Module } from "@nestjs/common";
import { EventProducerFactory } from "./factories/event-producer.factory";
import { AmqpModule } from "../amqp/amqp.module";
import { ConfigsModule } from "../configs/configs.module";

@Module({
  providers: [EventProducerFactory],
  exports: [EventProducerFactory],
  imports: [AmqpModule, ConfigsModule],
})
export class ProducersModule {}
