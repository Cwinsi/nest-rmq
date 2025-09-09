import { GenericContainer } from "testcontainers";
import { Test } from "@nestjs/testing";
import {
  Event,
  EventProcessor,
  EventProducer,
  InjectEventProducer,
  NestRmqModule,
} from "../../src";
import { Injectable, OnModuleInit } from "@nestjs/common";

describe("test", () => {
  jest.setTimeout(30000);

  let container: GenericContainer;
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

  it("Should produces and process events", async () => {
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
      }

      @EventProcessor(TestEvent)
      manualHandleEvent(event: TestEvent) {
        eventHandlerLogicMock(event);
      }
    }

    const moduleRef = await Test.createTestingModule({
      imports: [
        NestRmqModule.forRoot({
          connectionOption: {
            url,
          },
        }),
        NestRmqModule.forFeature([TestEvent]),
      ],
      providers: [TestHandler],
    }).compile();

    await moduleRef.init();

    expect(moduleRef).toBeDefined();
    expect(eventHandlerLogicMock).toHaveBeenCalledTimes(1);

    await moduleRef.close();
  });
});
