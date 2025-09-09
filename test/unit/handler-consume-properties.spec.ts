import "jest-extended";
import { Event } from "../../src/events/decorators/event.decorator";
import { EventProcessor } from "../../src/handlers/decorators/event-processor.decorator";
import { Injectable } from "@nestjs/common";

import { getBasicModule } from "./utils/basic-module-setup.util";
import { getMockChannelAndConnection } from "./utils/amqplib-mock-channel.util";
import { EventProperties } from "../../src/handlers/decorators/event-properties.decorator";
import { EventPropertiesContext } from "../../src";

jest.mock("amqplib", () => ({
  connect: jest.fn(),
}));

describe("Handler consume properties", () => {
  let { mockChannel } = getMockChannelAndConnection();

  beforeEach(async () => {
    ({ mockChannel } = getMockChannelAndConnection());
  });

  it("should invoke handler with message properties", async () => {
    const eventHandlerLogicMock = jest.fn();
    const eventHandlerPropertiesMock = jest.fn();

    @Event("test")
    class TestEvent {
      constructor(private readonly userName: string) {}
    }

    @Injectable()
    class TestHandler {
      @EventProcessor(TestEvent)
      manualHandleEvent(
        event: TestEvent,
        @EventProperties() eventPropertiesContext: EventPropertiesContext,
      ) {
        eventHandlerLogicMock(event);
        eventHandlerPropertiesMock(eventPropertiesContext);
      }
    }

    await getBasicModule(TestHandler);
    const consumeCallback = mockChannel.consume.mock.calls[0][1];

    const event = new TestEvent("Pedro");
    const fakeMessage = {
      content: Buffer.from(JSON.stringify(event)),
      properties: {},
    };

    await consumeCallback(fakeMessage);

    expect(eventHandlerLogicMock).toHaveBeenCalledTimes(1);
    expect(eventHandlerLogicMock).toHaveBeenCalledWith(event);

    expect(eventHandlerPropertiesMock).toHaveBeenCalledTimes(1);

    const contextProperties = eventHandlerPropertiesMock.mock.calls[0][0];
    expect(contextProperties).toBeInstanceOf(EventPropertiesContext);
  });
});
