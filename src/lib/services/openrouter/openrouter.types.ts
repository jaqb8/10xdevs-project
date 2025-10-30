import type { ZodSchema } from "zod";

export interface ChatCompletionParams<T> {
  model: string;
  systemMessage: string;
  userMessage: string;
  responseSchema: ZodSchema<T>;
  temperature?: number;
  maxTokens?: number;
}

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterRequestBody {
  model: string;
  messages: OpenRouterMessage[];
  reasoning?: {
    enabled: boolean;
  };
  response_format?: {
    type: "json_schema";
    json_schema: {
      name: string;
      strict: boolean;
      schema: unknown;
    };
  };
  temperature?: number;
  max_tokens?: number;
}

export interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}
