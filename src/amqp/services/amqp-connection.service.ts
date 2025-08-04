import { Injectable } from "@nestjs/common";
import amqplib, { Channel } from "amqplib";
import { ConfigsService } from "../../configs/configs.service";

@Injectable()
export class AmqpConnectionService {
  private chanel: Channel | null = null;

  constructor(private readonly configsService: ConfigsService) {}

  async connect(): Promise<Channel> {
    const amqpConnection = await amqplib.connect(
      this.configsService.getConfigs().connectionOption,
    );

    this.chanel = await amqpConnection.createChannel();
    return this.chanel;
  }

  async getChannel(): Promise<Channel> {
    if (!this.chanel) {
      return await this.connect();
    }

    return this.chanel;
  }
}
