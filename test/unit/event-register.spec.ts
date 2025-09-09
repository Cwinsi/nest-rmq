import { Event } from "../../src/events/decorators/event.decorator";
import { EventProcessor } from "../../src/handlers/decorators/event-processor.decorator";
import { HandlerExplorerService } from "../../src/handler-explorer/services/handler-explorer.service";
import { Test, TestingModule } from "@nestjs/testing";
import { Injectable } from "@nestjs/common";
import { HandlerExplorerModule } from "../../src/handler-explorer/handler-explorer.module";
import { EventSubscription } from "../../src/handlers/decorators/event-subscription.decorator";

@Event("test")
class TestEvent {}

@Injectable()
class TestHandler {
  @EventProcessor(TestEvent)
  handleProcessorEvents(_event: TestEvent) {}

  @EventSubscription(TestEvent)
  handleSubscriptionEvents(_event: TestEvent) {}
}

describe("Handler explorer register", () => {
  let moduleRef: TestingModule;
  let explorer: HandlerExplorerService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [HandlerExplorerModule],
      providers: [TestHandler],
    }).compile();

    await moduleRef.init();

    explorer = moduleRef.get(HandlerExplorerService);
  });

  it("should be defined", () => {
    expect(explorer).toBeDefined();
  });

  it("should find handlers", () => {
    const handlers = explorer.getEventHandlerMethods();

    expect(handlers).toBeDefined();
    expect(handlers).toHaveLength(2);

    const [processor, subscription] = handlers;

    expect(processor).toBeDefined();
    expect(processor!.method).toBe(TestHandler.prototype.handleProcessorEvents);

    expect(subscription).toBeDefined();
    expect(subscription!.method).toBe(
      TestHandler.prototype.handleSubscriptionEvents,
    );
  });
});
