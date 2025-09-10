import { GenericContainer, StartedTestContainer } from "testcontainers";
import {
  Event,
  EventProcessor,
  EventProducer,
  InjectEventProducer,
} from "../../src";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { getBasicModule } from "./utils/basic-module-setup.util";

describe("Publish and handle", () => {
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

  it("Should publish and handle events", async () => {
    const eventHandlerLogicMock = jest.fn();

    @Event("test")
    class TestEvent {
      constructor(private readonly userName: string) {}
    }

    @Injectable()
    class TestHandler implements OnModuleInit {
      constructor(
        @InjectEventProducer(TestEvent)
        private readonly testEventEventProducer: EventProducer<TestEvent>,
      ) {}

      async onModuleInit() {
        await this.testEventEventProducer.publish(new TestEvent("Pedro"));
        await this.testEventEventProducer.publish(new TestEvent("Pedro"));
      }

      @EventProcessor(TestEvent)
      processEvent(event: TestEvent) {
        eventHandlerLogicMock(event);
      }
    }

    const moduleRef = await getBasicModule(url, [TestHandler], [TestEvent]);

    expect(moduleRef).toBeDefined();
    expect(eventHandlerLogicMock).toHaveBeenCalledTimes(2);

    await moduleRef.close();
  });

  it("Should publish and handle event once for a few handlers", async () => {
    const eventHandlerLogicMock = jest.fn();

    @Event("test")
    class TestEvent {
      constructor(private readonly userName: string) {}
    }

    @Injectable()
    class TestHandler {
      constructor(
        @InjectEventProducer(TestEvent)
        private readonly testEventEventProducer: EventProducer<TestEvent>,
      ) {}

      async publishEvent() {
        await this.testEventEventProducer.publish(new TestEvent("Pedro"));
      }

      @EventProcessor(TestEvent)
      processEvent(event: TestEvent) {
        eventHandlerLogicMock(event);
      }
    }

    const firstModuleRef = await getBasicModule(
      url,
      [TestHandler],
      [TestEvent],
    );
    const secondModuleRef = await getBasicModule(
      url,
      [TestHandler],
      [TestEvent],
    );

    const firstHandler: TestHandler = await firstModuleRef.resolve(TestHandler);

    expect(firstModuleRef).toBeDefined();
    expect(secondModuleRef).toBeDefined();
    expect(firstHandler).toBeDefined();

    await firstHandler.publishEvent();

    expect(eventHandlerLogicMock).toHaveBeenCalledTimes(1);

    await firstModuleRef.close();
    await secondModuleRef.close();
  });

  it("Should publish and handle event once for every uniq processor", async () => {
    const firstEventHandlerLogicMock = jest.fn();
    const secondEventHandlerLogicMock = jest.fn();

    @Event("test")
    class TestEvent {
      constructor(private readonly userName: string) {}
    }

    @Injectable()
    class TestHandler {
      constructor(
        @InjectEventProducer(TestEvent)
        private readonly testEventEventProducer: EventProducer<TestEvent>,
      ) {}

      async publishEvent() {
        await this.testEventEventProducer.publish(new TestEvent("Pedro"));
      }

      @EventProcessor(TestEvent)
      processEvent(event: TestEvent) {
        firstEventHandlerLogicMock(event);
      }

      @EventProcessor(TestEvent)
      processEvent2(event: TestEvent) {
        secondEventHandlerLogicMock(event);
      }
    }

    const firstModuleRef = await getBasicModule(
      url,
      [TestHandler],
      [TestEvent],
    );
    const secondModuleRef = await getBasicModule(
      url,
      [TestHandler],
      [TestEvent],
    );

    const firstHandler: TestHandler = await firstModuleRef.resolve(TestHandler);

    expect(firstModuleRef).toBeDefined();
    expect(secondModuleRef).toBeDefined();
    expect(firstHandler).toBeDefined();

    await firstHandler.publishEvent();

    expect(firstEventHandlerLogicMock).toHaveBeenCalledTimes(1);
    expect(secondEventHandlerLogicMock).toHaveBeenCalledTimes(1);

    await firstModuleRef.close();
    await secondModuleRef.close();
  });
});
