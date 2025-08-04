import { Inject } from "@nestjs/common";
import { getEventProducerToken } from "../injection/get-event-producer-token";

export function InjectEventProducer<Event>(
  event: new (...args: any[]) => Event,
) {
  return Inject(getEventProducerToken(event));
}
