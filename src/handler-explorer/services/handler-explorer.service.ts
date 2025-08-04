import { Injectable } from "@nestjs/common";
import { DiscoveryService, MetadataScanner } from "@nestjs/core";
import { getEventHandlerMetadata } from "../../handlers/decorators/event-handler.decorator";
import { getEventMetadata } from "../../events/decorators/event.decorator";
import { HandlerExplorerMethodInterface } from "../interfaces/handler-explorer-method.interface";

@Injectable()
export class HandlerExplorerService {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  getEventHandlerMethods(): HandlerExplorerMethodInterface[] {
    const instances = this.getProvidersInstances();

    return this.getEventHandlerMethodsForInstances(instances);
  }

  getProvidersInstances(): any[] {
    const providers = this.discovery.getProviders();

    return providers
      .map((provider) => provider.instance)
      .filter((instance) => instance);
  }

  getEventHandlerMethodsForInstances(
    instances: any[],
  ): HandlerExplorerMethodInterface[] {
    const handlers: HandlerExplorerMethodInterface[] = [];

    for (const instance of instances) {
      const prototype = Object.getPrototypeOf(instance);

      const methods = this.metadataScanner.getAllMethodNames(prototype);

      for (const methodName of methods) {
        const methodRef = instance[methodName];

        const handlerMetadata = getEventHandlerMetadata(methodRef);
        if (!handlerMetadata) continue;

        const eventMetadata = getEventMetadata(handlerMetadata.eventClass);
        if (!eventMetadata) continue;

        handlers.push({
          method: methodRef,
          eventMetadata,
          handlerMetadata,
        });
      }
    }

    return handlers;
  }
}
