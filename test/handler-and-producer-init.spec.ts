import "jest-extended";
import { Event } from "../src/events/decorators/event.decorator";
import { EventHandler } from "../src/handlers/decorators/event-handler.decorator";
import {Injectable, OnApplicationBootstrap, OnModuleInit} from "@nestjs/common";

import { EventDelivery } from "../src/handlers/decorators/event-handler-delivery.decorator";
import { EventDeliveryContext } from "../src/handlers/context/event-delivery.context";
import { getBasicModule } from "./utils/basic-module-setup.util";
import { getMockChannelAndConnection } from "./utils/amqplib-mock-channel.util";
import {EventProducer, InjectEventProducer} from "../src";

jest.mock("amqplib", () => ({
  connect: jest.fn(),
}));

describe("HandlerAndProducerInit", () => {
  let { mockChannel } = getMockChannelAndConnection();

  beforeEach(async () => {
    ({ mockChannel } = getMockChannelAndConnection());
  });

  it("Handlers should init before producers", async () => {
    const eventHandlerLogicMock = jest.fn();

    @Event("test")
    class TestEvent {
      constructor(private readonly userName: string) {}
    }

    @Injectable()
    class TestHandler implements OnModuleInit {
      constructor(
        @InjectEventProducer(TestEvent)
        private readonly testEventEventProducer: EventProducer<TestEvent>) {
      }

      onModuleInit() {
        this.testEventEventProducer.publish(new TestEvent("Pedro"))
      }

      @EventHandler(TestEvent)
      manualHandleEvent(
        event: TestEvent,
      ) {
        eventHandlerLogicMock(event);
      }
    }

    await getBasicModule(TestHandler, TestEvent);
    expect(mockChannel.consume).toHaveBeenCalledBefore(mockChannel.publish);
  });

});
