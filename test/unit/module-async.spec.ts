import { Test, TestingModule } from "@nestjs/testing";
import { ConfigsService } from "../../src/configs/configs.service";
import { NestRmqModule } from "../../src/nest-rmq.module";
import { getEventProducerToken } from "../../src/producers/injection/get-event-producer-token";
import { Event } from "../../src";
import { Injectable, Module } from "@nestjs/common";
import { getMockChannelAndConnection } from "./utils/amqplib-mock-channel.util";

jest.mock("amqplib", () => ({
  connect: jest.fn(),
}));

@Event("test")
class TestEvent {
  constructor(private readonly eventField: string) {}
}

@Injectable()
class FactoryConfigProvider {
  public url = "amqp://test";
}

@Module({
  providers: [FactoryConfigProvider],
  exports: [FactoryConfigProvider],
})
class FactoryConfigModule {}

describe("Async root module init", () => {
  let moduleRef: TestingModule;

  getMockChannelAndConnection();

  beforeAll(async () => {
    getMockChannelAndConnection();

    moduleRef = await Test.createTestingModule({
      imports: [
        FactoryConfigModule,
        NestRmqModule.forRootAsync({
          useFactory: async (config: FactoryConfigProvider) => {
            return {
              connectionOption: {
                url: config.url,
              },
            };
          },
          imports: [FactoryConfigModule],
          inject: [FactoryConfigProvider],
        }),
        NestRmqModule.forFeature([TestEvent]),
      ],
      providers: [FactoryConfigProvider],
    }).compile();
  });

  it("should be defined", () => {
    expect(moduleRef).toBeDefined();
  });

  it("producers should be be defined", () => {
    const producer = moduleRef.get(getEventProducerToken(TestEvent));
    expect(producer).toBeDefined();
  });

  it("factory configs should be be defined", () => {
    const configsService = moduleRef.get(ConfigsService);
    expect(configsService).toBeDefined();

    const configs = configsService.getConfigs();
    expect(configs.connectionOption.url).toEqual("amqp://test");
  });
});
