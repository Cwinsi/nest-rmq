import { Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { HandlerExplorerService } from "./services/handler-explorer.service";

@Module({
  imports: [DiscoveryModule],
  providers: [HandlerExplorerService],
  exports: [HandlerExplorerService],
})
export class HandlerExplorerModule {}
