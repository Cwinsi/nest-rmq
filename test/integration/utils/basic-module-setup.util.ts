import { Test } from "@nestjs/testing";
import { NestRmqModule } from "../../../src";
import { Provider } from "@nestjs/common";
import { AnyEventClass } from "../../../src/events/types/event-class.type";

export const getBasicModule = async (
  url: string,
  handler: Provider[],
  events: AnyEventClass[],
  instanceId = "test",
) => {
  const moduleRef = await Test.createTestingModule({
    imports: [
      NestRmqModule.forRoot({
        connectionOption: {
          url,
        },
        instanceId,
      }),
      NestRmqModule.forFeature(events),
    ],
    providers: handler,
  }).compile();

  await moduleRef.init();

  return moduleRef;
};
