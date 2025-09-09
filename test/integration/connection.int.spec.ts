import { GenericContainer } from "testcontainers";
import { Test } from "@nestjs/testing";
import { NestRmqModule } from "../../src";

describe("ConnectionManager", () => {
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

  it("should connect with correct url", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        NestRmqModule.forRoot({
          connectionOption: {
            url,
          },
        }),
      ],
      providers: [],
    }).compile();

    await moduleRef.init();
    expect(moduleRef).toBeDefined();
    await moduleRef.close();
  });

  it("should throw error if connection fails", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        NestRmqModule.forRoot({
          connectionOption: {
            url: `amqp://localhost:${port + 1}`,
            timeout: 500,
          },
        }),
      ],
      providers: [],
    }).compile();
    await expect(moduleRef.init()).rejects.toThrow(Error);
  });
});
