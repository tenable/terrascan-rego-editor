// BackendPolicyObject represents the fields required in rule upload request
// by accurics backend
export interface BackendPolicyObject {
    ruleName: string,
    provider: string
    policy: string
    ruleTemplate: string,
    engineType: string
    resourceType: string,
    severity: string,
    vulnerability: string,
    ruleTemplateName?: string,
    ruleArgument?: string,
    policyRelevance?: string,
    remediation?: string
    ruleDisplayName?: string
    category?: string
    ruleReferenceId?: string,
    version?: string,
    custom?: boolean
};

// RuleResponse is the response received for a GET request from Accurics backend
export interface RuleResponse {
    count: number,
    rules: NormalizedRuleObject[]
}

// NormalizedRuleObject represents a single rule object received from Accurics backend
export interface NormalizedRuleObject {
    id: string,
    ruleTemplateId: string,
    ruleName: string,
    ruleTemplate: string,
    ruleTemplateName?: string,
    ruleArgument?: string,
    severity: string,
    vulnerability: string,
    remediation?: string
    engineType: string,
    provider: string,
    managedBy: string,
    ruleDisplayName: string,
    category?: string,
    policyRelevance?: string,
    ruleReferenceId: string,
    policy: string,
    version?: number,
    custom?: boolean,
    resourceType: string
};