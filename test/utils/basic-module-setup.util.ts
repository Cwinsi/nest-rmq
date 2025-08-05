import { Test } from "@nestjs/testing";
import {EveryEventExchangeStrategy, NestRmqModule} from "../../src";
import { Provider } from "@nestjs/common";

export const getBasicModule = async (...handlers: Provider[]) => {
  const moduleRef = await Test.createTestingModule({
    imports: [
      NestRmqModule.forRoot({
        connectionOption: {},
      }),
    ],
    providers: handlers,
  }).compile();

  await moduleRef.init();

  return moduleRef;
};
