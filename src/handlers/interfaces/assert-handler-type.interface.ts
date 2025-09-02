import { HandlerExplorerMethodInterface } from "../../handler-explorer/interfaces/handler-explorer-method.interface";
import { Channel } from "amqplib";

export interface AssertHandlerTypeInterface {
  /**
   * Create queue, binding and asserts to process event in handler
   *
   * @return name of queue to consume events
   */
  createHandlerQueues(
    channel: Channel,
    handler: HandlerExplorerMethodInterface,
  ): Promise<string>;
}
