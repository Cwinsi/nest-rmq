import { Inject, Injectable } from "@nestjs/common";
import type { NestRmqOptions } from "./interfaces/nest-rmq-options.interface";
import { configClientOptionsSymbol } from "./symbols/config-client-options.symbol";
import { merge } from "lodash";
import { defaultNestRmqOptions } from "./values/default-nest-rmq-options.value";
import {
  RequiredHandlerOptions,
  RequiredNestRMQOptions,
} from "./types/required-options.type";
import { HandlerOptions } from "../handlers/interfaces/handler-options.interface";

@Injectable()
export class ConfigsService {
  constructor(
    @Inject(configClientOptionsSymbol)
    private readonly clientOptions: NestRmqOptions,
  ) {}

  getConfigs(): RequiredNestRMQOptions {
    return merge(defaultNestRmqOptions, this.clientOptions);
  }

  getHandlerConfigs(handlerOptions?: HandlerOptions): RequiredHandlerOptions {
    return merge(this.getConfigs().defaultHandlerOptions, handlerOptions || {});
  }
}
