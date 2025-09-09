import "jest-extended";
import { Event } from "../../src/events/decorators/event.decorator";
import { EventProcessor } from "../../src/handlers/decorators/event-processor.decorator";
import { Injectable } from "@nestjs/common";

import { getBasicModule } from "./utils/basic-module-setup.util";
import { getMockChannelAndConnection } from "./utils/amqplib-mock-channel.util";

jest.mock("amqplib", () => ({
  connect: jest.fn(),
}));

describe("Processor consume", () => {
  let { mockChannel } = getMockChannelAndConnection();

  beforeEach(async () => {
    ({ mockChannel } = getMockChannelAndConnection());
  });

  it("should invoke handler without event event object", async () => {
    const eventHandlerLogicMock = jest.fn();

    @Event("test")
    class TestEvent {
      constructor(private readonly userName: string) {}
    }

    @Injectable()
    class TestHandler {
      @EventProcessor(TestEvent)
      manualHandleEvent(event: TestEvent) {
        eventHandlerLogicMock(event);
      }
    }

    await getBasicModule(TestHandler);
    const consumeCallback = mockChannel.consume.mock.calls[0][1];

    const event = new TestEvent("Pedro");
    const fakeMessage = {
      content: Buffer.from(JSON.stringify(event)),
    };

    await consumeCallback(fakeMessage);

    expect(eventHandlerLogicMock).toHaveBeenCalledTimes(1);
    expect(eventHandlerLogicMock).toHaveBeenCalledWith(event);

    const receivedEvent = eventHandlerLogicMock.mock.calls[0][0];
    expect(receivedEvent).toBeInstanceOf(TestEvent);
  });

  it("consumer should have access to correct this", async () => {
    const eventHandlerLogicMock = jest.fn();

    @Event("test")
    class TestEvent {
      constructor(private readonly userName: string) {}
    }

    @Injectable()
    class TestHandler {
      constructor() {
        this.thisMethod = eventHandlerLogicMock;
      }

      thisMethod: any;

      @EventProcessor(TestEvent)
      manualHandleEvent(_: TestEvent) {
        this.thisMethod();
      }
    }

    await getBasicModule(TestHandler);
    const consumeCallback = mockChannel.consume.mock.calls[0][1];

    const event = new TestEvent("Pedro");
    const fakeMessage = {
      content: Buffer.from(JSON.stringify(event)),
    };
    await consumeCallback(fakeMessage);

    expect(eventHandlerLogicMock).toHaveBeenCalled();
  });
});
