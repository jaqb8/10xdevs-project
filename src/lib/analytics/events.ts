import { captureServerEvent } from "./posthog.server";

export const ANALYTICS_EVENTS = {
  USER_SIGNUP: "user_signup",
  USER_LOGIN: "user_login",
  USER_LOGOUT: "user_logout",
  TEXT_ANALYSIS_REQUESTED: "text_analysis_requested",
  TEXT_ANALYSIS_COMPLETED: "text_analysis_completed",
  TEXT_ANALYSIS_FAILED: "text_analysis_failed",
  LEARNING_ITEM_ADDED: "learning_item_added",
  LEARNING_ITEM_REMOVED: "learning_item_removed",
  RATE_LIMIT_EXCEEDED: "rate_limit_exceeded",
} as const;

export interface UserAuthEventProperties extends Record<string, unknown> {
  user_id: string;
  email_domain?: string;
}

export interface TextAnalysisEventProperties extends Record<string, unknown> {
  user_id?: string;
  mode: "grammar_and_spelling" | "colloquial_speech";
  text_length: number;
}

export interface TextAnalysisCompletedProperties extends TextAnalysisEventProperties {
  is_correct: boolean;
}

export interface TextAnalysisFailedProperties extends TextAnalysisEventProperties {
  error_message: string;
}

export interface LearningItemEventProperties extends Record<string, unknown> {
  user_id: string;
  item_id: string;
  mode: "grammar_and_spelling" | "colloquial_speech";
  analysis_id?: string;
}

export interface RateLimitExceededProperties extends Record<string, unknown> {
  user_id: string;
  endpoint: string;
  max_requests: number;
  window_ms: number;
  time_until_reset: number;
}

export function trackUserSignup(props: UserAuthEventProperties, waitUntil?: (promise: Promise<unknown>) => void) {
  captureServerEvent(
    ANALYTICS_EVENTS.USER_SIGNUP,
    {
      ...props,
      email_domain: props.email_domain,
    },
    waitUntil
  );
}

export function trackUserLogin(props: UserAuthEventProperties, waitUntil?: (promise: Promise<unknown>) => void) {
  captureServerEvent(
    ANALYTICS_EVENTS.USER_LOGIN,
    {
      ...props,
      email_domain: props.email_domain,
    },
    waitUntil
  );
}

export function trackUserLogout(props: UserAuthEventProperties, waitUntil?: (promise: Promise<unknown>) => void) {
  captureServerEvent(ANALYTICS_EVENTS.USER_LOGOUT, props, waitUntil);
}

export function trackTextAnalysisRequested(
  props: TextAnalysisEventProperties,
  waitUntil?: (promise: Promise<unknown>) => void
) {
  captureServerEvent(ANALYTICS_EVENTS.TEXT_ANALYSIS_REQUESTED, props, waitUntil);
}

export function trackTextAnalysisCompleted(
  props: TextAnalysisCompletedProperties,
  waitUntil?: (promise: Promise<unknown>) => void
) {
  captureServerEvent(ANALYTICS_EVENTS.TEXT_ANALYSIS_COMPLETED, props, waitUntil);
}

export function trackTextAnalysisFailed(
  props: TextAnalysisFailedProperties,
  waitUntil?: (promise: Promise<unknown>) => void
) {
  captureServerEvent(ANALYTICS_EVENTS.TEXT_ANALYSIS_FAILED, props, waitUntil);
}

export function trackLearningItemAdded(
  props: LearningItemEventProperties,
  waitUntil?: (promise: Promise<unknown>) => void
) {
  captureServerEvent(ANALYTICS_EVENTS.LEARNING_ITEM_ADDED, props, waitUntil);
}

export function trackLearningItemRemoved(
  props: LearningItemEventProperties,
  waitUntil?: (promise: Promise<unknown>) => void
) {
  captureServerEvent(ANALYTICS_EVENTS.LEARNING_ITEM_REMOVED, props, waitUntil);
}

export function trackRateLimitExceeded(
  props: RateLimitExceededProperties,
  waitUntil?: (promise: Promise<unknown>) => void
) {
  captureServerEvent(ANALYTICS_EVENTS.RATE_LIMIT_EXCEEDED, props, waitUntil);
}
