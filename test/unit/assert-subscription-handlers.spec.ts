import "jest-extended";
import { TestingModule } from "@nestjs/testing";
import { getMockChannelAndConnection } from "./utils/amqplib-mock-channel.util";
import { Event } from "../../src";
import { Injectable } from "@nestjs/common";
import { EventSubscription } from "../../src/handlers/decorators/event-subscription.decorator";
import { getBasicModule } from "./utils/basic-module-setup.util";

jest.mock("amqplib", () => ({
  connect: jest.fn(),
}));

describe("Assert subscription handlers", () => {
  let moduleRef: TestingModule;

  let { mockChannel } = getMockChannelAndConnection();

  beforeAll(async () => {
    ({ mockChannel } = getMockChannelAndConnection());
  });

  it("should create and bind queue for all handlers", async () => {
    @Event("test")
    class TestEvent {}

    @Injectable()
    class TestHandler {
      @EventSubscription(TestEvent)
      handleEvent(_event: TestEvent) {}

      @EventSubscription(TestEvent)
      handleEvent2(_event: TestEvent) {}
    }

    await getBasicModule(TestHandler, TestEvent);

    expect(mockChannel.bindQueue).toHaveBeenCalledTimes(2);
    expect(mockChannel.assertQueue).toHaveBeenCalledTimes(2);
    expect(mockChannel.consume).toHaveBeenCalledTimes(2);
  });
});
