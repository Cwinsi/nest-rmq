import { ModuleMetadata, Type } from "@nestjs/common";
import { NestRmqOptions } from "./nest-rmq-options.interface";

export interface NestRmqOptionsFactory {
  createRmqOptions(): Promise<NestRmqOptions> | NestRmqOptions;
}

export interface NestRmqAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  useExisting?: Type<NestRmqOptionsFactory>;
  useClass?: Type<NestRmqOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<NestRmqOptions> | NestRmqOptions;
  inject?: any[];
}
