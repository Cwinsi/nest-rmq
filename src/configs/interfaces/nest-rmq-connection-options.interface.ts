export interface NestRmqConnectionOptions {
  protocol?: string;
  hostname?: string;
  port?: number;
  username?: string;
  password?: string;
  heartbeat?: number;
}
