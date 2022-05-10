/*
    Copyright (C) 2022 Tenable, Inc.
    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
        http://www.apache.org/licenses/LICENSE-2.0
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

// BackendPolicyObject represents the fields required in rule upload request
// by Tenable.cs backend
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

// RuleResponse is the response received for a GET request from Tenable.cs backend
export interface RuleResponse {
    count: number,
    rules: NormalizedRuleObject[]
}

// NormalizedRuleObject represents a single rule object received from Tenable.cs backend
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
