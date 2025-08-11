import { HandlerAdditionalArgumentType } from "../types/handler-additional-argument.type";
import { HandlerExplorerMethodInterface } from "../../handler-explorer/interfaces/handler-explorer-method.interface";
import { ConsumeMessage } from "amqplib/properties";
import { Channel } from "amqplib";
import { EventDeliveryContext } from "../context/event-delivery.context";

export interface HandlerConsumeDataInterface {
  handler: HandlerExplorerMethodInterface;
  message: ConsumeMessage;
  channel: Channel;
  event: any;
  handlerDeliveryContext: EventDeliveryContext;
  additionalArguments: HandlerAdditionalArgumentType[];
  automaticProcessing: boolean;
}
