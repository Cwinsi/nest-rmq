import "jest-extended";
import { Event } from "../src/events/decorators/event.decorator";
import { EventHandler } from "../src/handlers/decorators/event-handler.decorator";
import { Injectable } from "@nestjs/common";

import { EventDelivery } from "../src/handlers/decorators/event-handler-delivery.decorator";
import { EventDeliveryContext } from "../src/handlers/context/event-delivery.context";
import { getBasicModule } from "./utils/basic-module-setup.util";
import { getMockChannelAndConnection } from "./utils/amqplib-mock-channel.util";

jest.mock("amqplib", () => ({
  connect: jest.fn(),
}));

describe("HandlerConsume", () => {
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
      @EventHandler(TestEvent)
      manualHandleEvent(
        event: TestEvent,
      ) {
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

});
