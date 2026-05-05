---
title: 'RBAC Security Hardening in Production Kubernetes Clusters'
author: 'danielsilvajobs'
publishDate: 2026-05-05
tags: ['K8s', 'Security', 'RBAC', 'Compliance']
description: 'How to design a least-privilege RBAC model, audit existing permissions, and avoid the common misconfigurations that lead to cluster compromise.'
---

## Why RBAC Matters in Kubernetes

The default configuration of many Kubernetes distributions is surprisingly permissive. `cluster-admin` bindings accumulate. Service accounts run with more privilege than their workloads require. A single misconfigured RoleBinding can give an attacker a path from a compromised pod to full cluster control.

This guide covers how to audit your current state, design a least-privilege model, and harden the configuration that attackers routinely exploit.

## Auditing Your Current RBAC State

Before changing anything, understand what you have. Two tools make this tractable:

### `kubectl-who-can`

```bash
# Install
kubectl krew install who-can

# Who can create pods in the production namespace?
kubectl who-can create pods -n production

# Who can read secrets cluster-wide?
kubectl who-can get secrets --all-namespaces
```

### `rakkess` (access matrix)

```bash
kubectl krew install rakkess

# Show what a specific service account can do
kubectl rakkess --sa production:my-app-sa
```

Save the output before you make changes. You want a baseline to diff against.

## The Privilege Escalation Paths to Close First

These are the misconfigurations attackers look for immediately after gaining a foothold in a pod:

### 1. Wildcard Verb Bindings

```yaml
# BAD — this is effectively cluster-admin for the namespace
rules:
  - apiGroups: ['*']
    resources: ['*']
    verbs: ['*']
```

Search for these with:

```bash
kubectl get clusterrolebindings,rolebindings -A -o json | \
  jq '.items[] | select(.roleRef.name | test("admin|cluster")) | .metadata.name'
```

### 2. `get secrets` at Cluster Scope

A service account that can `get secrets` in any namespace can read service account tokens and potentially escalate. Scope secret access to specific namespaces and specific secret names where possible.

```yaml
# BETTER — scoped to a single namespace and a name prefix
rules:
  - apiGroups: ['']
    resources: ['secrets']
    resourceNames: ['my-app-config', 'my-app-tls']
    verbs: ['get']
```

### 3. Pod Exec and Attach

`pods/exec` lets anyone with the binding run arbitrary commands in any pod in scope. This is legitimate for some operators but should never be granted broadly.

```bash
kubectl who-can create pods/exec --all-namespaces
```

### 4. Privilege Escalation via `bind` and `escalate`

If a subject has `bind` or `escalate` verbs on the RBAC API group, they can grant themselves any role. Remove these unless you're explicitly building a multi-tenant platform that requires them.

## Designing a Least-Privilege Model

Structure permissions around workload identity, not team membership.

### Service Account per Workload

Never reuse a service account across unrelated workloads. The blast radius of a compromised pod is bounded by its service account.

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: payment-processor
  namespace: payments
  annotations:
    # For EKS: bind to a specific IAM role
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/payment-processor
```

### Role + RoleBinding Template

Start from nothing and add only what your app's readiness probes, controllers, and business logic require:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: payment-processor
  namespace: payments
rules:
  - apiGroups: ['']
    resources: ['configmaps']
    resourceNames: ['payment-config']
    verbs: ['get', 'watch']
  # No secrets access — use External Secrets Operator or Vault agent instead
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: payment-processor
  namespace: payments
subjects:
  - kind: ServiceAccount
    name: payment-processor
    namespace: payments
roleRef:
  kind: Role
  name: payment-processor
  apiGroup: rbac.authorization.k8s.io
```

## Automating Token Projection

Kubernetes 1.21+ introduced projected service account tokens with bounded TTLs. Disable auto-mounting of the long-lived token on pods that don't need API access:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: stateless-app
automountServiceAccountToken: false
```

For pods that do need API access, use a projected volume with a short expiry:

```yaml
volumes:
  - name: kube-api-token
    projected:
      sources:
        - serviceAccountToken:
            path: token
            expirationSeconds: 3600 # 1-hour TTL, rotated automatically
            audience: 'api'
```

## Continuous Compliance

RBAC configurations drift. Someone grants cluster-admin for debugging, forgets to remove it, and the binding lives forever. Three practices keep this under control:

1. **Policy-as-code**: Commit all RoleBindings to Git. Use Kyverno or OPA Gatekeeper to block `cluster-admin` bindings in non-system namespaces.
2. **Periodic audits**: Run `rakkess` in CI against a snapshot of the cluster state weekly and diff against the baseline.
3. **Alert on sensitive verbs**: Ship Kubernetes audit logs to your SIEM and alert on `create rolebinding`, `bind`, and `escalate` events.

```yaml
# Kyverno policy: block cluster-admin for non-system subjects
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: restrict-clusteradmin
spec:
  validationFailureAction: Enforce
  rules:
    - name: no-clusteradmin
      match:
        any:
          - resources:
              kinds: [ClusterRoleBinding]
      validate:
        message: 'cluster-admin must not be bound to user subjects.'
        deny:
          conditions:
            any:
              - key: '{{ request.object.roleRef.name }}'
                operator: Equals
                value: cluster-admin
```

## Summary

Kubernetes RBAC is powerful and easy to misconfigure. The fundamentals:

- Audit before you change — know your blast radius
- Close the four common privilege escalation paths: wildcards, cluster-scoped secret reads, pod exec, and bind/escalate
- One service account per workload, scoped to the minimum verbs required
- Automate detection of drift with policy-as-code and audit log alerting
