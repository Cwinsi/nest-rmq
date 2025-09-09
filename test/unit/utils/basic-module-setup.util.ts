import { Test } from "@nestjs/testing";
import { NestRmqModule } from "../../../src";
import { Provider } from "@nestjs/common";
import { AnyEventClass } from "../../../src/events/types/event-class.type";

export const getBasicModule = async (
  handler: Provider,
  ...events: AnyEventClass[]
) => {
  const moduleRef = await Test.createTestingModule({
    imports: [
      NestRmqModule.forRoot({
        connectionOption: {
          url: "amqp://127.0.0.1",
        },
      }),
      NestRmqModule.forFeature(events),
    ],
    providers: [handler],
  }).compile();

  await moduleRef.init();

  return moduleRef;
};
