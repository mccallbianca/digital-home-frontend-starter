/**
 * Personalization Rules Engine
 * Evaluates JSON rules from `personalization_rules` table against visitor profiles.
 *
 * Rule format (condition):
 * {
 *   "operator": "and" | "or",
 *   "conditions": [
 *     { "field": "segment", "op": "eq", "value": "first-visit" },
 *     { "field": "visitCount", "op": "gte", "value": 3 },
 *     { "field": "pagesViewed", "op": "contains", "value": "/services" }
 *   ]
 * }
 *
 * Rule format (action):
 * {
 *   "type": "swap_hero" | "swap_cta" | "show_offer" | "show_banner" | "reorder_content",
 *   "variant": "string identifier",
 *   "config": { ... action-specific config }
 * }
 */

import type { VisitorProfile } from "./visitor";
import type { Json } from "@/types/database";

export interface PersonalizationRule {
  id: string;
  name: string;
  condition: RuleCondition;
  action: RuleAction;
  pagePatterns: string[];
  priority: number;
  status: "active" | "paused" | "archived";
}

export interface RuleCondition {
  operator: "and" | "or";
  conditions: SingleCondition[];
}

export interface SingleCondition {
  field: string;
  op: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains" | "not_contains" | "in" | "not_in";
  value: string | number | boolean | string[];
}

export interface RuleAction {
  type: "swap_hero" | "swap_cta" | "show_offer" | "show_banner" | "reorder_content" | "custom";
  variant: string;
  config?: Record<string, unknown>;
}

export interface PersonalizationResult {
  ruleId: string;
  ruleName: string;
  action: RuleAction;
}

/**
 * Evaluate all active rules against a visitor profile for a given page.
 * Returns matched actions sorted by priority (highest first).
 */
export function evaluateRules(
  rules: PersonalizationRule[],
  visitor: VisitorProfile,
  currentPath: string
): PersonalizationResult[] {
  const results: PersonalizationResult[] = [];

  // Only evaluate active rules
  const activeRules = rules
    .filter((r) => r.status === "active")
    .sort((a, b) => b.priority - a.priority); // highest priority first

  for (const rule of activeRules) {
    // Check if rule applies to this page
    if (!matchesPage(rule.pagePatterns, currentPath)) continue;

    // Evaluate conditions
    if (evaluateCondition(rule.condition, visitor)) {
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        action: rule.action,
      });
    }
  }

  return results;
}

/**
 * Check if a page path matches any of the rule's page patterns.
 * Supports wildcards: "/blog/*" matches "/blog/anything"
 */
function matchesPage(patterns: string[], path: string): boolean {
  // Empty patterns = applies to all pages
  if (patterns.length === 0) return true;

  for (const pattern of patterns) {
    if (pattern === "*" || pattern === "/*") return true;

    if (pattern.endsWith("/*")) {
      const prefix = pattern.slice(0, -2);
      if (path.startsWith(prefix)) return true;
    } else if (pattern === path) {
      return true;
    }
  }

  return false;
}

/**
 * Evaluate a rule condition group against a visitor profile.
 */
function evaluateCondition(condition: RuleCondition, visitor: VisitorProfile): boolean {
  const results = condition.conditions.map((c) => evaluateSingle(c, visitor));

  if (condition.operator === "and") {
    return results.every(Boolean);
  }
  return results.some(Boolean);
}

/**
 * Evaluate a single condition against the visitor profile.
 */
function evaluateSingle(condition: SingleCondition, visitor: VisitorProfile): boolean {
  const fieldValue = getFieldValue(visitor, condition.field);
  const { op, value } = condition;

  switch (op) {
    case "eq":
      return fieldValue === value;
    case "neq":
      return fieldValue !== value;
    case "gt":
      return typeof fieldValue === "number" && fieldValue > (value as number);
    case "gte":
      return typeof fieldValue === "number" && fieldValue >= (value as number);
    case "lt":
      return typeof fieldValue === "number" && fieldValue < (value as number);
    case "lte":
      return typeof fieldValue === "number" && fieldValue <= (value as number);
    case "contains":
      if (Array.isArray(fieldValue)) return fieldValue.includes(value as string);
      if (typeof fieldValue === "string") return fieldValue.includes(value as string);
      return false;
    case "not_contains":
      if (Array.isArray(fieldValue)) return !fieldValue.includes(value as string);
      if (typeof fieldValue === "string") return !fieldValue.includes(value as string);
      return true;
    case "in":
      return Array.isArray(value) && value.includes(fieldValue as string);
    case "not_in":
      return Array.isArray(value) && !value.includes(fieldValue as string);
    default:
      return false;
  }
}

/**
 * Extract a field value from the visitor profile by dot-notation path.
 */
function getFieldValue(visitor: VisitorProfile, field: string): unknown {
  const map: Record<string, unknown> = {
    segment: visitor.segment,
    visitCount: visitor.visitCount,
    firstSource: visitor.firstSource,
    firstMedium: visitor.firstMedium,
    latestSource: visitor.latestSource,
    latestMedium: visitor.latestMedium,
    isAITraffic: visitor.isAITraffic,
    aiSource: visitor.aiSource,
    pagesViewed: visitor.pagesViewed,
    contentAffinities: visitor.contentAffinities,
    deviceType: visitor.deviceType,
  };

  return map[field] ?? null;
}

/**
 * Parse a raw DB rule row into a typed PersonalizationRule.
 */
export function parseRule(row: {
  id: string;
  name: string;
  condition: Json;
  action: Json;
  page_patterns: string[];
  priority: number;
  status: "active" | "paused" | "archived";
}): PersonalizationRule {
  return {
    id: row.id,
    name: row.name,
    condition: row.condition as unknown as RuleCondition,
    action: row.action as unknown as RuleAction,
    pagePatterns: row.page_patterns,
    priority: row.priority,
    status: row.status,
  };
}
