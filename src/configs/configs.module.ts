import { DynamicModule, Module } from "@nestjs/common";
import { NestRmqOptions } from "./interfaces/nest-rmq-options.interface";
import { ConfigsService } from "./configs.service";
import { configClientOptionsSymbol } from "./symbols/config-client-options.symbol";

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
}
