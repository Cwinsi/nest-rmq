import { DynamicModule, Module, Provider } from "@nestjs/common";
import { NestRmqOptions } from "./configs/interfaces/nest-rmq-options.interface";
import { AnyEventClass } from "./events/types/event-class.type";
import { EventProducerFactory } from "./producers/factories/event-producer.factory";
import { EventProducer } from "./producers/event-producer";
import { getEventProducerToken } from "./producers/injection/get-event-producer-token";
import { AmqpModule } from "./amqp/amqp.module";
import { ConfigsModule } from "./configs/configs.module";
import { HandlerExplorerModule } from "./handler-explorer/handler-explorer.module";
import { HandlersModule } from "./handlers/handlers.module";
import { ProducersModule } from "./producers/producers.module";

@Module({})
export class NestRmqModule {
  static forRoot(options: NestRmqOptions): DynamicModule {
    return {
      module: NestRmqModule,
      global: true,
      imports: [
        ConfigsModule.forRoot(options),
        AmqpModule,
        HandlerExplorerModule,
        HandlersModule,
        ProducersModule,
      ],
      providers: [],
      exports: [ProducersModule],
    };
  }

  static forFeature(events: AnyEventClass[]): DynamicModule {
    const producers: Provider[] = events.map((event) => ({
      provide: getEventProducerToken(event),
      inject: [EventProducerFactory],
      useFactory: async (
        factory: EventProducerFactory,
      ): Promise<EventProducer<any>> => {
        return await factory.getProducer(event);
      },
    }));

    return {
      module: NestRmqModule,
      imports: [],
      providers: [...producers],
      exports: [...producers],
    };
  }
}
