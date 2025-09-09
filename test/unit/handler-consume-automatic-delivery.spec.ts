import "jest-extended";
import { Event } from "../../src/events/decorators/event.decorator";
import { EventHandler } from "../../src/handlers/decorators/event-handler.decorator";
import { Injectable } from "@nestjs/common";

import { getBasicModule } from "./utils/basic-module-setup.util";
import { getMockChannelAndConnection } from "./utils/amqplib-mock-channel.util";

jest.mock("amqplib", () => ({
  connect: jest.fn(),
}));

describe("HandlerConsumeAutomaticDelivery", () => {
  let { mockChannel } = getMockChannelAndConnection();

  beforeEach(async () => {
    ({ mockChannel } = getMockChannelAndConnection());
  });

  it("after event handler success execution should call ack", async () => {
    const eventHandlerLogicMock = jest.fn();

    @Event("test")
    class TestEvent {
      constructor(private readonly userName: string) {}
    }

    @Injectable()
    class TestHandler {
      @EventHandler(TestEvent)
      manualHandleEvent(event: TestEvent) {
        eventHandlerLogicMock(event);
      }
    }

    await getBasicModule(TestHandler);

    const consumeCallback = mockChannel.consume.mock.calls[0][1];

    const event = new TestEvent("Alf");
    const fakeMessage = {
      content: Buffer.from(JSON.stringify(event)),
    };

    await consumeCallback(fakeMessage);

    expect(eventHandlerLogicMock).toHaveBeenCalledTimes(1);

    expect(mockChannel.ack).toHaveBeenCalledTimes(1);
    expect(mockChannel.nack).not.toHaveBeenCalled();
  });

  it("after event handler exception should call nack", async () => {
    @Event("test")
    class TestEvent {
      constructor(private readonly userName: string) {}
    }

    @Injectable()
    class TestHandler {
      @EventHandler(TestEvent)
      manualHandleEvent(_: TestEvent) {
        throw new Error("Supper painful error ;(");
      }
    }

    await getBasicModule(TestHandler);

    const consumeCallback = mockChannel.consume.mock.calls[0][1];

    const event = new TestEvent("Alf");
    const fakeMessage = {
      content: Buffer.from(JSON.stringify(event)),
    };

    await consumeCallback(fakeMessage);

    expect(mockChannel.nack).toHaveBeenCalledTimes(1);
    expect(mockChannel.ack).not.toHaveBeenCalled();
  });
});
