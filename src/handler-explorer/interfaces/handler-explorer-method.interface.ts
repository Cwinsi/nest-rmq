import { EventMetadata } from "../../events/interfaces/event-metadata.interface";
import { HandlerMetadata } from "../../handlers/interfaces/handler-metadata.interface";

export interface HandlerExplorerMethodInterface {
  eventMetadata: EventMetadata;
  handlerMetadata: HandlerMetadata;

  method: Function;
  instance: Function;
}
