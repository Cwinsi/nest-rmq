import "jest-extended";
import { Event } from "../src/events/decorators/event.decorator";
import { EventHandler } from "../src/handlers/decorators/event-handler.decorator";
import { Test, TestingModule } from "@nestjs/testing";
import { Injectable } from "@nestjs/common";
import { NestRmqModule } from "../src/nest-rmq.module";
import { faker } from "@faker-js/faker";
import amqplib from "amqplib";
import { HandlerEventQueueNameStrategy } from "../src/handlers/interfaces/handler-event-queue-name-strategy.interface";
import { EventsExchangeStrategy } from "../src/events/interfaces/events-exchange-strategy.interface";
import { NestRmqConnectionOptions } from "../src/configs/interfaces/nest-rmq-connection-options.interface";
import { EventDelivery } from "../src/handlers/decorators/event-handler-delivery.decorator";
import { EventDeliveryContext } from "../src/handlers/context/event-delivery.context";

jest.mock("amqplib", () => ({
  connect: jest.fn(),
}));

@Event("test")
class TestEvent {}

@Event("test2")
class TestEvent2 {}

@Injectable()
class TestHandler {
  @EventHandler(TestEvent)
  handleEvent(_event: TestEvent, @EventDelivery() a: EventDeliveryContext) {}

  @EventHandler(TestEvent2)
  handleEvent2(_event: TestEvent2) {}

  @EventHandler(TestEvent2)
  handleEvent3(_event: TestEvent2) {}
}

describe("AssertHandlers", () => {
  let moduleRef: TestingModule;

  const mockEventQueueNameStrategy: HandlerEventQueueNameStrategy = {
    resolveQueueName: jest.fn().mockReturnValue("mock-queue"),
  };

  const mockEventExchangeStrategy: EventsExchangeStrategy = {
    getEventExchangeName: jest.fn().mockReturnValue("mock-exchange"),
  };

  const mockChannel = {
    assertQueue: jest.fn(),
    bindQueue: jest.fn(),
    consume: jest.fn(),
    ack: jest.fn(),
    assertExchange: jest.fn(),
  };
  const mockConnection = {
    createChannel: jest.fn().mockResolvedValue(mockChannel),
  };

  const connectionOption: NestRmqConnectionOptions = {
    hostname: faker.internet.ipv4(),
    username: faker.internet.username(),
    password: faker.internet.password(),
  };

  beforeAll(async () => {
    (amqplib.connect as jest.Mock).mockResolvedValue(mockConnection);

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
