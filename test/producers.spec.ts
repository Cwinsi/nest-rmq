import 'jest-extended';
import { Event } from "../src/events/decorators/event.decorator";
import { EventHandler } from "../src/handlers/decorators/event-handler.decorator";
import { Test, TestingModule } from "@nestjs/testing";
import { Injectable } from "@nestjs/common";
import { NestRmqModule } from "../src/nest-rmq.module";
import { Options } from "amqplib/properties";
import { faker } from "@faker-js/faker";
import amqplib from "amqplib";
import { HandlerEventQueueNameStrategy } from "../src/handlers/interfaces/handler-event-queue-name-strategy.interface";
import { EventsExchangeStrategy } from "../src/events/interfaces/events-exchange-strategy.interface";
import {EventProducer} from "../src/producers/event-producer";
import {getEventProducerToken} from "../src/producers/injection/get-event-producer-token";

jest.mock("amqplib", () => ({
  connect: jest.fn(),
}));

@Event("test")
class TestEvent {
  constructor(private readonly eventField: string) {
  }
}


describe("Producers", () => {
  let moduleRef: TestingModule;
  let producerRef: EventProducer<TestEvent>;

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
        NestRmqModule.forRoot({
          connectionOption: {}
        }),
        NestRmqModule.forFeature([TestEvent])
      ],
    }).compile();

    producerRef =  moduleRef.get(getEventProducerToken(TestEvent));
  });

  it("should be defined", () => {
    expect(moduleRef).toBeDefined();
    expect(producerRef).toBeDefined();
  });


  it("should call chanel publish on publish event", async () => {
    await producerRef.publish(new TestEvent('test'))
    expect(mockChannel.publish).toHaveBeenCalledTimes(1)
  });


  it("should call chanel publish with json data", async () => {
    await producerRef.publish(new TestEvent('test2'))

    const [exchange, routingKey, contentBuffer] = mockChannel.publish.mock.calls[0];

    const jsonString = contentBuffer.toString();
    const parsed = JSON.parse(jsonString);
    expect(parsed).toBeInstanceOf(Object);
  });
});
