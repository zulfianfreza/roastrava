import { UseMutationOptions } from "@tanstack/react-query";

export type ApiServiceErr = any;

export type MutOpt<Response, TVariables = unknown> = UseMutationOptions<
  Response,
  ApiServiceErr,
  TVariables,
  unknown
>;

export type Language = "id" | "en";
