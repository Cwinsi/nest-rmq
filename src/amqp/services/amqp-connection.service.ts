import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigsService } from "../../configs/configs.service";
import amqp, { AmqpConnectionManager } from "amqp-connection-manager";
import type { ChannelWrapper } from "amqp-connection-manager";

@Injectable()
export class AmqpConnectionService implements OnModuleInit, OnModuleDestroy {
  private channelWrapper: ChannelWrapper | null = null;
  private connection: AmqpConnectionManager | null = null;

  constructor(private readonly configsService: ConfigsService) {}

  async onModuleInit() {
    await this.getChannelWrapper();
  }

  async onModuleDestroy() {
    if (this.channelWrapper) {
      await this.channelWrapper.close();
      this.channelWrapper.removeAllListeners();
      this.channelWrapper = null;
    }

    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }

  async connect(): Promise<ChannelWrapper> {
    const connectionOption = this.configsService.getConfigs().connectionOption;
    this.connection = amqp.connect({
      url: connectionOption.url,
      connectionOptions: {
        timeout: connectionOption.timeout,
      },
    });

    await new Promise<void>((resolve, reject) => {
      this.connection!.on("connect", () => resolve());
      this.connection!.on("disconnect", (err) =>
        reject(new Error(`AMQP disconnect: ${err?.err?.message || err}`)),
      );
      this.connection!.on("error", (err) =>
        reject(new Error(`AMQP error: ${err?.err?.message || err}`)),
      );
      this.connection!.on("connectFailed", (err) =>
        reject(new Error(`AMQP connectFailed: ${err?.err?.message || err}`)),
      );
    });

    const channelWrapper: ChannelWrapper = this.connection.createChannel({});

    this.channelWrapper = channelWrapper;
    return channelWrapper;
  }

  async getChannelWrapper(): Promise<ChannelWrapper> {
    if (!this.channelWrapper) {
      return await this.connect();
    }

    return this.channelWrapper;
  }
}
