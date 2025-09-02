import { HandlerOptions } from "./handler-options.interface";
import { EventClass } from "../../events/types/event-class.type";
import { HandlerType } from "../enums/handler-type.enum";

export interface HandlerMetadata {
  eventClass: EventClass<any>;
  handlerClass: Object;
  className: string;
  methodName: string;
  options: HandlerOptions;
  type: HandlerType;
}
