import { ModuleMetadata } from "@nestjs/common";
import { NestRmqOptions } from "./nest-rmq-options.interface";

export interface NestRmqOptionsFactory {
  createRmqOptions(): Promise<NestRmqOptions> | NestRmqOptions;
}

export interface NestRmqAsyncOptions extends Pick<ModuleMetadata, "imports"> {
  useFactory: (...args: any[]) => Promise<NestRmqOptions> | NestRmqOptions;
  inject?: any[];
}
