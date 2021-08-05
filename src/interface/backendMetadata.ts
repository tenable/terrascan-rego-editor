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