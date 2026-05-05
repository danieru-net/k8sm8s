---
title: 'Kubernetes Networking Deep Dive: CNI Plugins and Network Policies'
author: 'danielsilvajobs'
publishDate: 2026-05-03
tags: ['K8s', 'Networking', 'CNI', 'Security']
description: 'A comprehensive exploration of CNI plugins, network policies, and designing secure, scalable cluster networking from the ground up.'
---

## Overview

Kubernetes networking is deceptively simple at the API layer and remarkably complex underneath. Every pod gets an IP. Every pod can talk to every other pod. That's it — that's the contract. How you enforce that contract is where CNI plugins come in.

This article walks through the CNI specification, compares the most widely deployed plugins, and shows you how to write Network Policies that actually work.

## The CNI Contract

The Container Network Interface (CNI) specification defines a simple plugin system. When the kubelet creates a pod sandbox, it calls your CNI binary with a JSON config. The plugin is responsible for:

1. Allocating an IP from a pool
2. Creating a network interface in the pod's network namespace
3. Configuring routing so the pod can reach other pods and the host

The key invariant every compliant plugin must uphold: **any pod must be able to reach any other pod by IP without NAT**.

```bash
# Inspect what CNI plugins are installed on a node
ls /opt/cni/bin/

# View active CNI config
cat /etc/cni/net.d/*.conf | jq .
```

## Plugin Comparison

### Calico

The most popular choice in production. Calico uses BGP to distribute routes between nodes, meaning every pod IP is fully routable across the cluster without overlays in most configurations.

```yaml
apiVersion: projectcalico.org/v3
kind: FelixConfiguration
metadata:
  name: default
spec:
  bpfEnabled: true # eBPF dataplane for lower latency
  bpfLogLevel: ''
  logSeverityScreen: Info
```

**Best for:** Clusters on bare metal or cloud VMs where you control BGP peering. Excellent Network Policy enforcement via iptables or eBPF.

### Cilium

Cilium's eBPF-native architecture means it can enforce policies at the kernel level, bypassing iptables entirely. It also speaks the Kubernetes NetworkPolicy API _and_ its own `CiliumNetworkPolicy` CRD for L7 enforcement.

```yaml
apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: allow-api-to-db
spec:
  endpointSelector:
    matchLabels:
      app: postgres
  ingress:
    - fromEndpoints:
        - matchLabels:
            app: api-server
      toPorts:
        - ports:
            - port: '5432'
              protocol: TCP
```

**Best for:** High-throughput, observability-focused environments. Hubble (Cilium's network observability layer) gives you flow-level visibility for free.

### Flannel

The simplest option. Flannel uses VXLAN encapsulation to create an overlay network. Zero BGP, zero eBPF — just UDP tunnels.

**Best for:** Development clusters and learning environments. Not recommended for production under heavy traffic due to encapsulation overhead.

## Writing Effective Network Policies

The Kubernetes `NetworkPolicy` resource is _deny-everything by default_ — but only once you've applied at least one policy to a namespace. Until then, all traffic flows freely.

### Step 1: Default Deny All

Apply this to every namespace you control:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: production
spec:
  podSelector: {} # applies to all pods in the namespace
  policyTypes:
    - Ingress
    - Egress
```

### Step 2: Explicit Allow Rules

Now selectively open what's needed:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-api-ingress
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: api-server
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: ingress-nginx
      ports:
        - protocol: TCP
          port: 8080
```

### Common Gotchas

**DNS breaks under default-deny.** CoreDNS lives in `kube-system`. You must allow egress on port 53 UDP/TCP, or pods can't resolve service names:

```yaml
- ports:
    - port: 53
      protocol: UDP
    - port: 53
      protocol: TCP
  to:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: kube-system
```

**NodePort traffic bypasses NetworkPolicy** for most CNI implementations. If you're using NodePorts and need to restrict access, enforce at the firewall or security group level.

## Testing Your Policies

Never assume a policy works until you've verified it. Use `netshoot` for ad-hoc debugging:

```bash
# Deploy a debug pod
kubectl run netshoot --image=nicolaka/netshoot -it --rm

# From inside: test connectivity
curl -v --connect-timeout 3 http://my-service.production.svc.cluster.local:8080
nc -zv postgres.production.svc.cluster.local 5432
```

For CI validation, `networkpolicy-validator` can diff your policy intent against what's actually enforced.

## Key Takeaways

- Start with default-deny and add explicit allows — never start open
- Match your CNI plugin to your infrastructure: Calico for BGP environments, Cilium for observability, Flannel only for dev
- Remember DNS when writing egress policies
- Validate policies in a staging namespace before applying to production
- Use `kubectl describe networkpolicy` to inspect effective rules, not just the YAML
