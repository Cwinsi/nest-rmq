import "jest-extended";
import { Event } from "../../src/events/decorators/event.decorator";
import { EventHandler } from "../../src/handlers/decorators/event-handler.decorator";
import { Injectable } from "@nestjs/common";

import { EventDelivery } from "../../src/handlers/decorators/event-handler-delivery.decorator";
import { EventDeliveryContext } from "../../src/handlers/context/event-delivery.context";
import { getBasicModule } from "./utils/basic-module-setup.util";
import { getMockChannelAndConnection } from "./utils/amqplib-mock-channel.util";

jest.mock("amqplib", () => ({
  connect: jest.fn(),
}));

describe("HandlerConsumeManualDelivery", () => {
  let { mockChannel } = getMockChannelAndConnection();

  beforeEach(async () => {
    ({ mockChannel } = getMockChannelAndConnection());
  });

  it("should invoke handler without ack message if manual delivery is enabled", async () => {
    const eventHandlerLogicMock = jest.fn();
    const eventHandlerDeliveryMock = jest.fn();

    @Event("test")
    class TestEvent {
      constructor(private readonly userName: string) {}
    }

    @Injectable()
    class TestHandler {
      @EventHandler(TestEvent)
      manualHandleEvent(
        event: TestEvent,
        @EventDelivery() eventHandlerContext: EventDeliveryContext,
      ) {
        eventHandlerLogicMock(event);
        eventHandlerDeliveryMock(eventHandlerContext);
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

    expect(mockChannel.ack).not.toHaveBeenCalled();
  });

  it("manual delivery allow to call ack", async () => {
    const eventHandlerLogicMock = jest.fn();
    const eventHandlerDeliveryMock = jest.fn();

    @Event("test")
    class TestEvent {
      constructor(private readonly userName: string) {}
    }

    @Injectable()
    class TestHandler {
      @EventHandler(TestEvent)
      manualHandleEvent(
        event: TestEvent,
        @EventDelivery() eventHandlerContext: EventDeliveryContext,
      ) {
        eventHandlerLogicMock(event);
        eventHandlerDeliveryMock(eventHandlerContext);

        eventHandlerContext.ack();
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
    expect(eventHandlerLogicMock).toHaveBeenCalledWith(event);

    expect(mockChannel.ack).toHaveBeenCalledTimes(1);
    expect(mockChannel.nack).not.toHaveBeenCalled();
  });

  it("multiple call nack or ack should not affect after first", async () => {
    const eventHandlerLogicMock = jest.fn();
    const eventHandlerDeliveryMock = jest.fn();

    @Event("test")
    class TestEvent {
      constructor(private readonly userName: string) {}
    }

    @Injectable()
    class TestHandler {
      @EventHandler(TestEvent)
      manualHandleEvent(
        event: TestEvent,
        @EventDelivery() eventHandlerContext: EventDeliveryContext,
      ) {
        eventHandlerLogicMock(event);
        eventHandlerDeliveryMock(eventHandlerContext);

        eventHandlerContext.nack();
        eventHandlerContext.nack();
        eventHandlerContext.ack();
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

  it("@EventHandler can be user only on EventDeliveryContext argument", async () => {
    expect(() => {
      @Event("test")
      class TestEvent {
        constructor(private readonly userName: string) {}
      }

      @Injectable()
      class _TestHandler {
        @EventHandler(TestEvent)
        manualHandleEvent(_: TestEvent, @EventDelivery() _delivery: object) {}
      }
    }).toThrow();
  });
});
