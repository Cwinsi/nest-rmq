import { Test, TestingModule } from "@nestjs/testing";
import { ConfigsService } from "../src/configs/configs.service";
import { NestRmqModule } from "../src/nest-rmq.module";
import { ConfigsModule } from "../src/configs/configs.module";
import { NestRmqOptions } from "../src/configs/interfaces/nest-rmq-options.interface";
import { faker } from "@faker-js/faker";
import { defaultHandlerOptions } from "../src/configs/values/default-handler-options.value";

describe("Config module", () => {
  let moduleRef: TestingModule;
  let configsService: ConfigsService;

  const moduleClientOptions: NestRmqOptions = {
    connectionOption: {
      port: faker.number.int({ min: 3000, max: 4000 }),
    },
    defaultHandlerOptions: {
      durable: false,
    },
  };

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [NestRmqModule.forRoot(moduleClientOptions), ConfigsModule],
    }).compile();

    configsService = moduleRef.get(ConfigsService);
  });

  it("should be defined", () => {
    expect(configsService).toBeDefined();
  });

  it("configs should be available", () => {
    expect(configsService.getConfigs()).toBeDefined();
  });

  it("configs provide default values", () => {
    expect(
      configsService.getConfigs().defaultHandlerOptions.prefetch,
    ).toBeDefined();
  });

  it("provided configs should be available", () => {
    const configs = configsService.getConfigs();

    expect(configs.connectionOption.port).toBeDefined();
    expect(configs.connectionOption.port).toEqual(
      moduleClientOptions.connectionOption.port,
    );
  });

  it("provided configs should have higher priority then default", () => {
    const configs = configsService.getConfigs();

    expect(configs.defaultHandlerOptions.durable).toBeFalsy();
  });

  it("handler configs should return default values", () => {
    const configs = configsService.getHandlerConfigs();

    expect(configs.prefetch).toEqual(defaultHandlerOptions.prefetch);
  });

  it("handler configs should return provided app configs", () => {
    const configs = configsService.getHandlerConfigs();

    expect(configs.durable).toEqual(
      moduleClientOptions.defaultHandlerOptions?.durable,
    );
  });

  it("handler configs should return handler option values", () => {
    const prefetchOptionValue = faker.number.int({ min: 100, max: 150 });

    const configs = configsService.getHandlerConfigs({
      prefetch: prefetchOptionValue,
    });

    expect(configs.prefetch).toEqual(prefetchOptionValue);
  });
});
