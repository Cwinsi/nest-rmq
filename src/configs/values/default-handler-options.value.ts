import { RequiredHandlerOptions } from "../types/required-options.type";

export const defaultHandlerOptions: RequiredHandlerOptions = {
  durable: true,
  prefetch: 50,
};
