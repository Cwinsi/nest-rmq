import { MessagePropertyHeaders } from "amqplib/properties";

export class EventPropertiesContext {
  contentType: any | undefined;
  contentEncoding: any | undefined;
  headers: MessagePropertyHeaders | undefined;
  deliveryMode: any | undefined;
  priority: any | undefined;
  correlationId: any | undefined;
  replyTo: any | undefined;
  expiration: any | undefined;
  messageId: any | undefined;
  timestamp: any | undefined;
  type: any | undefined;
  userId: any | undefined;
  appId: any | undefined;
  clusterId: any | undefined;
}
