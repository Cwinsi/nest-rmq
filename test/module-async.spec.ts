import { Test, TestingModule } from "@nestjs/testing";
import { ConfigsService } from "../src/configs/configs.service";
import { NestRmqModule } from "../src/nest-rmq.module";
import { getEventProducerToken } from "../src/producers/injection/get-event-producer-token";
import { Event } from "../src";
import amqplib from "amqplib";
import { Injectable, Module } from "@nestjs/common";

jest.mock("amqplib", () => ({
  connect: jest.fn(),
}));

@Event("test")
class TestEvent {
  constructor(private readonly eventField: string) {}
}

@Injectable()
class FactoryConfigProvider {
  public port: number = 333;
}

@Module({
  providers: [FactoryConfigProvider],
  exports: [FactoryConfigProvider],
})
class FactoryConfigModule {}

describe("AsyncRootModule", () => {
  let moduleRef: TestingModule;

  const mockChannel = {
    assertQueue: jest.fn(),
    bindQueue: jest.fn(),
    consume: jest.fn(),
    ack: jest.fn(),
    assertExchange: jest.fn(),
    publish: jest.fn(),
  };

  const mockConnection = {
    createChannel: jest.fn().mockResolvedValue(mockChannel),
  };

  beforeAll(async () => {
    (amqplib.connect as jest.Mock).mockResolvedValue(mockConnection);

    moduleRef = await Test.createTestingModule({
      imports: [
        FactoryConfigModule,
        NestRmqModule.forRootAsync({
          useFactory: async (config: FactoryConfigProvider) => {
            return {
              connectionOption: {
                port: config.port,
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
    expect(configs.connectionOption.port).toEqual(333);
  });
});
