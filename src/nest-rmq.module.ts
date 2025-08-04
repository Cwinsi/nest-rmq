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
import {
  NestRmqAsyncOptions,
  NestRmqOptionsFactory,
} from "./configs/interfaces/nest-rmq-async-options.interface";

export const nestRmqOptions = Symbol("nestRmqOptions");

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

  static forRootAsync(options: NestRmqAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);

    return {
      module: NestRmqModule,
      global: true,
      imports: options.imports ?? [],
      providers: [
        ...asyncProviders,
        {
          provide: "CONFIGS_MODULE",
          useFactory: async (opts: NestRmqOptions) =>
            ConfigsModule.forRoot(opts),
          inject: [nestRmqOptions],
        },
      ],
      exports: [ProducersModule],
    };
  }

  private static createAsyncProviders(
    options: NestRmqAsyncOptions,
  ): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: nestRmqOptions,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ];
    }

    if (!options.useClass || !options.useExisting) {
      throw new Error("Must provide useClass or useExisting");
    }

    const useClass = options.useClass || options.useExisting;

    const providers: Provider[] = [
      {
        provide: nestRmqOptions,
        useFactory: async (factory: NestRmqOptionsFactory) =>
          await factory.createRmqOptions(),
        inject: [useClass!],
      },
    ];

    if (options.useClass) {
      providers.push({
        provide: useClass,
        useClass,
      });
    }

    return providers;
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

// static forRootAsync(options: MyLibModuleAsyncOptions): DynamicModule {
//   const asyncProviders = this.createAsyncProviders(options);
//
//   return {
//     module: NestRmqModule,
//     imports: options.imports || [],
//     providers: [...asyncProviders, MyLibService],
//     exports: [ProducersModule],
//   };
// }
