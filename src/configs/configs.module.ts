import { DynamicModule, Module } from "@nestjs/common";
import { NestRmqOptions } from "./interfaces/nest-rmq-options.interface";
import { ConfigsService } from "./configs.service";
import { configClientOptionsSymbol } from "./symbols/config-client-options.symbol";
import { NestRmqAsyncOptions } from "./interfaces/nest-rmq-async-options.interface";

const configClientOptionsProviderSymbol = Symbol("configClientOptionsProvider");

@Module({})
export class ConfigsModule {
  static forRoot(options: NestRmqOptions): DynamicModule {
    return {
      module: ConfigsModule,
      providers: [
        {
          provide: configClientOptionsSymbol,
          useValue: options,
        },
        ConfigsService,
      ],
      global: true,
      exports: [ConfigsService, configClientOptionsSymbol],
    };
  }

  static forRootAsync(options: NestRmqAsyncOptions): DynamicModule {
    return {
      module: ConfigsModule,
      imports: options.imports ?? [],
      providers: [
        {
          provide: configClientOptionsProviderSymbol,
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        },
        {
          provide: configClientOptionsSymbol,
          useFactory: (config) => config,
          inject: [configClientOptionsProviderSymbol],
        },
        ConfigsService,
      ],
      global: true,
      exports: [ConfigsService, configClientOptionsSymbol],
    };
  }
}
