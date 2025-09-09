import { RequiredNestRMQOptions } from "../types/required-options.type";
import { defaultHandlerOptions } from "./default-handler-options.value";
import { HandlerClassMethodQueueNameStrategy } from "../../handlers/handler-event-queue-name-strategies/handler-class-method.queue-name-strategy";
import { SingleExchangeStrategy } from "../../events/events-exchange-strategies/single.exchange-strategy";

export const defaultNestRmqOptions: RequiredNestRMQOptions = {
  defaultHandlerOptions,
  connectionOption: {
    url: "amqp://localhost:5672",
    timeout: 5000,
  },
  instanceId: "nest-rmq",

  handlerEventQueueNameStrategy: new HandlerClassMethodQueueNameStrategy(),
  eventsExchangeStrategy: new SingleExchangeStrategy(),
};
