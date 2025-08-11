import { Inject, Injectable } from "@nestjs/common";
import { HandlerAdditionalArgumentInterface } from "../interfaces/handler-additional-argument.interface";
import { handlerAdditionalArgumentsListSymbol } from "../symbols/handler-additional-arguments-list.symbol";

@Injectable()
export class HandlerAdditionalArgumentPipelineService {
  constructor(
    @Inject(handlerAdditionalArgumentsListSymbol)
    private readonly handlerAdditionalArguments: HandlerAdditionalArgumentInterface[],
  ) {}

  getPipeline(): HandlerAdditionalArgumentInterface[] {
    return this.handlerAdditionalArguments;
  }
}
