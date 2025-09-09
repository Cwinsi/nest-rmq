import { Inject, Injectable } from "@nestjs/common";
import { AssertHandlerTypeInterface } from "../interfaces/assert-handler-type.interface";
import { assertHandlerTypesListSymbol } from "../symbols/assert-handler-types-list.symbol";
import { HandlerType } from "../enums/handler-type.enum";

@Injectable()
export class AssertHandlerTypesService {
  constructor(
    @Inject(assertHandlerTypesListSymbol)
    private readonly assertHandlerTypes: AssertHandlerTypeInterface[],
  ) {}

  getAssertHandlerForTypeOrFail(type: HandlerType): AssertHandlerTypeInterface {
    const handlerType = this.assertHandlerTypes.find(
      (handlerType) => handlerType.getHandlerType() === type,
    );

    if (!handlerType) {
      throw new Error(`Assert handler for ${type} is not found`);
    }

    return handlerType;
  }
}
