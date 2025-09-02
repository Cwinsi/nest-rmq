import "jest-extended";
import { Event } from "../src/events/decorators/event.decorator";
import { Test, TestingModule } from "@nestjs/testing";
import { NestRmqModule } from "../src";
import amqplib from "amqplib";
import { EventProducer } from "../src/producers/event-producer";
import { getEventProducerToken } from "../src/producers/injection/get-event-producer-token";
import {getMockChannelAndConnection} from "./utils/amqplib-mock-channel.util";

jest.mock("amqplib", () => ({
  connect: jest.fn(),
}));

@Event("test")
class TestEvent {
  constructor(private readonly eventField: string) {}
}

describe("Producers", () => {
  let moduleRef: TestingModule;
  let producerRef: EventProducer<TestEvent>;


  let { mockChannel } = getMockChannelAndConnection();

  beforeAll(async () => {
  ({ mockChannel } = getMockChannelAndConnection());

    moduleRef = await Test.createTestingModule({
      imports: [
        NestRmqModule.forRoot({
          connectionOption: {},
        }),
        NestRmqModule.forFeature([TestEvent]),
      ],
    }).compile();


    producerRef = moduleRef.get(getEventProducerToken(TestEvent));
  });

  it("should be defined", () => {
    expect(moduleRef).toBeDefined();
    expect(producerRef).toBeDefined();
  });

  it("should call chanel publish on publish event", async () => {
    await producerRef.publish(new TestEvent("test"));
    expect(mockChannel.publish).toHaveBeenCalledTimes(1);
  });

  it("should call chanel publish with json data", async () => {
    await producerRef.publish(new TestEvent("test2"));

    const [exchange, routingKey, contentBuffer] =
      mockChannel.publish.mock.calls[0];

    const jsonString = contentBuffer.toString();
    const parsed = JSON.parse(jsonString);
    expect(parsed).toBeInstanceOf(Object);
  });
});
