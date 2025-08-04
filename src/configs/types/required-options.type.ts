import { HandlerOptions } from "../../handlers/interfaces/handler-options.interface";
import { NestRmqOptions } from "../interfaces/nest-rmq-options.interface";

export type RequiredHandlerOptions = Required<HandlerOptions>;
export type RequiredNestRMQOptions = Required<NestRmqOptions> & {
  defaultHandlerOptions: RequiredHandlerOptions;
};
