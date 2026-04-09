/**
 * ECQO Security Layer — Main Export
 *
 * Central import point for all security modules.
 */

export { sanitizeInput, sanitizeObject, type SanitizeResult } from './sanitize';
export { checkContentPolicy, type ContentPolicyResult, type ContentFlag } from './content-policy';
export { checkRiskAlignment, getRiskTier, type RiskCheckResult, type RiskTier } from './ecqo-risk-check';
export { checkRateLimit, getRateLimitKey, RATE_LIMITS, type RateLimitConfig, type RateLimitResult } from './rate-limit';
export { sendSecurityAlert, type AlertType } from './alerts';
export { logAgentInteraction, logSecurityEvent, type AgentLogEntry } from './audit-log';
export { SECURITY_HEADERS, applySecurityHeaders } from './headers';
export { TRAUMA_MESSAGES, SECURITY_COLORS } from './trauma-messages';
