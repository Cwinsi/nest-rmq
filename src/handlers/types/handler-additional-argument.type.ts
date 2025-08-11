import { EventDeliveryContext } from "../context/event-delivery.context";
import { EventPropertiesContext } from "../context/event-properties.context";

export type HandlerAdditionalArgumentType =
  | EventDeliveryContext
  | EventPropertiesContext;
