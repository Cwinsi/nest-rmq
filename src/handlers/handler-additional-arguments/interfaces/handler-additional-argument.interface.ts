import { HandlerConsumeDataInterface } from "../../interfaces/handler-consume-data.interface";

export interface HandlerAdditionalArgumentInterface {
  execute(consumeData: HandlerConsumeDataInterface): void;
}
