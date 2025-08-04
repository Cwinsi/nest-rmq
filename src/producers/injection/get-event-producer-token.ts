export function getEventProducerToken(event: Function) {
  return `nest_rmq_${event.name}`;
}
