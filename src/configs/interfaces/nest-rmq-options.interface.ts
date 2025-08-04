import { HandlerOptions } from "../../handlers/interfaces/handler-options.interface";
import { Options } from "amqplib/properties";
import { HandlerEventQueueNameStrategy } from "../../handlers/interfaces/handler-event-queue-name-strategy.interface";
import { EventsExchangeStrategy } from "../../events/interfaces/events-exchange-strategy.interface";

export interface NestRmqOptions {
  defaultHandlerOptions?: HandlerOptions;
  handlerEventQueueNameStrategy?: HandlerEventQueueNameStrategy; // TODO: rename
  eventsExchangeStrategy?: EventsExchangeStrategy; // TODO: rename
  connectionOption: Options.Connect;
}
