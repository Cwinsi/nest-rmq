import { HandlerExplorerMethodInterface } from "../../handler-explorer/interfaces/handler-explorer-method.interface";
import { ChannelWrapper } from "amqp-connection-manager";
import { HandlerType } from "../enums/handler-type.enum";

export interface AssertHandlerTypeInterface {
  /**
   * Create queue, binding and asserts to process event in handler
   *
   * @return name of queue to consume events
   */
  createHandlerQueues(
    channelWrapper: ChannelWrapper,
    handler: HandlerExplorerMethodInterface,
  ): Promise<string>;

  getHandlerType(): HandlerType;
}
