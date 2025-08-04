import { Event } from "../src/events/decorators/event.decorator";
import { EventHandler } from "../src/handlers/decorators/event-handler.decorator";
import { HandlerExplorerService } from "../src/handler-explorer/services/handler-explorer.service";
import { Test, TestingModule } from "@nestjs/testing";
import { Injectable } from "@nestjs/common";
import { HandlerExplorerModule } from "../src/handler-explorer/handler-explorer.module";

@Event("test")
class TestEvent {}

@Injectable()
class TestHandler {
  @EventHandler(TestEvent)
  handleEvents(_event: TestEvent) {}
}

describe("HandlerExplorer", () => {
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

  it("should find handler", () => {
    const handlers = explorer.getEventHandlerMethods();

    expect(handlers).toBeDefined();
    expect(handlers).toHaveLength(1);

    const handler = handlers[0];

    expect(handler).toBeDefined();
    expect(handler!.method).toBe(TestHandler.prototype.handleEvents);
  });
});
