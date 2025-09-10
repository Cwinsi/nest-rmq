import { GenericContainer, StartedTestContainer } from "testcontainers";
import { Event, EventProducer, InjectEventProducer } from "../../src";
import { Injectable } from "@nestjs/common";
import { EventSubscription } from "../../src/handlers/decorators/event-subscription.decorator";
import { getBasicModule } from "./utils/basic-module-setup.util";

describe("Publish and subscribe", () => {
  jest.setTimeout(30000);

  let container: StartedTestContainer;
  let port = 0;
  let url = "";

  beforeAll(async () => {
    container = await new GenericContainer("rabbitmq:3-management")
      .withExposedPorts(5672, 15672)
      .withStartupTimeout(30_000)
      .start();

    const host = container.getHost();
    port = container.getMappedPort(5672);

    url = `amqp://${host}:${port}`;
  });

  afterAll(async () => {
    if (container) {
      await container.stop();
    }
  });

  it("Should produces and subscribe to events", async () => {
    const firstEventHandlerLogicMock = jest.fn();
    const secondEventHandlerLogicMock = jest.fn();

    @Event("test")
    class TestEvent {
      constructor(private readonly userName: string) {}
    }

    @Injectable()
    class FirstTestHandler {
      constructor(
        @InjectEventProducer(TestEvent)
        private readonly testEventEventProducer: EventProducer<TestEvent>,
      ) {}

      async publishEvent() {
        await this.testEventEventProducer.publish(new TestEvent("Pedro"));
      }

      @EventSubscription(TestEvent)
      subscription1(event: TestEvent) {
        firstEventHandlerLogicMock(event);
      }
    }

    @Injectable()
    class SecondTestHandler {
      constructor(
        @InjectEventProducer(TestEvent)
        private readonly testEventEventProducer: EventProducer<TestEvent>,
      ) {}

      @EventSubscription(TestEvent)
      subscription1(event: TestEvent) {
        secondEventHandlerLogicMock(event);
      }
    }

    const firstModuleRef = await getBasicModule(
      url,
      [FirstTestHandler],
      [TestEvent],
      "app-1",
    );

    const secondModuleRef = await getBasicModule(
      url,
      [SecondTestHandler],
      [TestEvent],
      "app-2",
    );

    const firstHandler: FirstTestHandler =
      await firstModuleRef.resolve(FirstTestHandler);

    await firstHandler.publishEvent();

    expect(firstModuleRef).toBeDefined();
    expect(secondModuleRef).toBeDefined();

    expect(firstEventHandlerLogicMock).toHaveBeenCalledTimes(1);
    expect(secondEventHandlerLogicMock).toHaveBeenCalledTimes(1);

    await firstModuleRef.close();
    await secondModuleRef.close();
  });
});
