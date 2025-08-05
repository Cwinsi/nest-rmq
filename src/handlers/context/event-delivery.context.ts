import { Channel, ConsumeMessage } from "amqplib";

export class EventDeliveryContext {
  constructor(
    private readonly message: ConsumeMessage,
    private readonly channel: Channel,
  ) {}

  private called = false;

  ack() {
    if (!this.called) {
      this.channel.ack(this.message);

      this.called = true;
    }
  }

  nack(requeue = false) {
    if (!this.called) {
      this.channel.nack(this.message, false, requeue);
      this.called = true;
    }
  }
}
