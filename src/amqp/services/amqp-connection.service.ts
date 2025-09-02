import { forwardRef, Inject, Injectable } from "@nestjs/common";
import amqplib, { Channel } from "amqplib";
import { ConfigsService } from "../../configs/configs.service";
import { AssertHandlerService } from "../../handlers/services/assert-handler.service";

@Injectable()
export class AmqpConnectionService {
  private chanel: Channel | null = null;

  constructor(
    private readonly configsService: ConfigsService,

    @Inject(forwardRef(() => AssertHandlerService))
    private readonly assertHandlerService: AssertHandlerService,
  ) {}

  async connect(): Promise<Channel> {
    const amqpConnection = await amqplib.connect(
      this.configsService.getConfigs().connectionOption,
    );

    this.chanel = await amqpConnection.createChannel();

    this.chanel.on("close", async () => {
      await this.assertHandlerService.assertHandlers();
    });

    return this.chanel;
  }

  async getChannel(): Promise<Channel> {
    if (!this.chanel) {
      return await this.connect();
    }

    return this.chanel;
  }
}
