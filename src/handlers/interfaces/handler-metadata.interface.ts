import { HandlerOptions } from "./handler-options.interface";
import { EventClass } from "../../events/types/event-class.type";

export interface HandlerMetadata {
  eventClass: EventClass<any>;
  handlerClass: Object;
  className: string;
  methodName: string;
  options: HandlerOptions;
}
