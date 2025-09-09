import "jest-extended";
import { Event } from "../../src/events/decorators/event.decorator";
import { EventProcessor } from "../../src/handlers/decorators/event-processor.decorator";
import { Test, TestingModule } from "@nestjs/testing";
import { Injectable } from "@nestjs/common";
import { NestRmqModule } from "../../src/nest-rmq.module";
import { faker } from "@faker-js/faker";
import { HandlerEventQueueNameStrategy } from "../../src/handlers/interfaces/handler-event-queue-name-strategy.interface";
import { EventsExchangeStrategy } from "../../src/events/interfaces/events-exchange-strategy.interface";
import { NestRmqConnectionOptions } from "../../src/configs/interfaces/nest-rmq-connection-options.interface";
import { EventDelivery } from "../../src/handlers/decorators/./event-delivery.decorator";
import { EventDeliveryContext } from "../../src/handlers/context/event-delivery.context";
import { getMockChannelAndConnection } from "./utils/amqplib-mock-channel.util";

jest.mock("amqplib", () => ({
  connect: jest.fn(),
}));

@Event("test")
class TestEvent {}

@Event("test2")
class TestEvent2 {}

@Injectable()
class TestHandler {
  @EventProcessor(TestEvent)
  handleEvent(_event: TestEvent, @EventDelivery() _: EventDeliveryContext) {}

  @EventProcessor(TestEvent2)
  handleEvent2(_event: TestEvent2) {}

  @EventProcessor(TestEvent2)
  handleEvent3(_event: TestEvent2) {}
}

describe("Assert processor handlers", () => {
  let moduleRef: TestingModule;

  const mockEventQueueNameStrategy: HandlerEventQueueNameStrategy = {
    resolveQueueName: jest.fn().mockReturnValue("mock-queue"),
  };

  const mockEventExchangeStrategy: EventsExchangeStrategy = {
    getEventExchangeName: jest.fn().mockReturnValue("mock-exchange"),
  };

  let { mockChannel } = getMockChannelAndConnection();

  const connectionOption: NestRmqConnectionOptions = {
    url: faker.internet.url(),
  };

  beforeAll(async () => {
    ({ mockChannel } = getMockChannelAndConnection());

    moduleRef = await Test.createTestingModule({
      imports: [
        NestRmqModule.forRoot({
          connectionOption,
          handlerEventQueueNameStrategy: mockEventQueueNameStrategy,
          eventsExchangeStrategy: mockEventExchangeStrategy,
        }),
      ],
      providers: [TestHandler],
    }).compile();

    await moduleRef.init();
  });

  it("should create and bind queue for all handlers", () => {
    expect(mockChannel.bindQueue).toHaveBeenCalledTimes(3);
    expect(mockChannel.assertQueue).toHaveBeenCalledTimes(3);
    expect(mockChannel.consume).toHaveBeenCalledTimes(3);
  });

  it("should use name strategy for all handlers", () => {
    expect(mockEventQueueNameStrategy.resolveQueueName).toHaveBeenCalledTimes(
      3,
    );
  });
});
