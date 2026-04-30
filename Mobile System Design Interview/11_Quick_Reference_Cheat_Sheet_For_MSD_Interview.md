# 11. Quick Reference Cheat Sheet for MSD Interview

This appendix provides a helpful reference list of topics to consider during your MSD interviews. They're organized by domain, making them easier to navigate.

---

## Network

| Category | Key considerations |
|---|---|
| Core protocols | • Communication protocols: REST, GraphQL, protocol buffers, or gRPC.<br>• Real-time updates: HTTP polling, SSE, WebSockets.<br>• Request management: idempotency keys, priority queuing, rate limiting, request throttling. |
| Data flow patterns | • Pagination: offset vs. cursor-based.<br>• Offline capabilities: offline-first design, optimistic UI updates, conflict resolution.<br>• Network resilience: connectivity handling, exponential backoff. |
| Security | • Authentication and authorization: token lifecycle, biometric auth, recovery flows.<br>• Security infrastructure: encryption in transit and at rest, certificate pinning, compliance requirements. |

---

## Data management

| Category | Key considerations |
|---|---|
| Architecture | • Core data flow: patterns for data flow, layer responsibilities, error handling, error propagation. |
| Storage and caching | • Storage options: key-value, relational/non-relational DB, custom/binary stores, secure storage.<br>• Caching: in-memory vs. disk trade-offs.<br>• Eviction policies: TTL, size-based eviction, priority-based eviction.<br>• Privacy: PII handling, GDPR compliance, data retention policies.<br>• Synchronization: sync strategies, conflict resolution, delta sync. |
| Data performance | • Pre-fetching: predictive fetching, resource usage trade-offs, prioritize critical paths.<br>• Background processing: task efficiency, battery impact, OS background execution limits. |
| UI & Interactions | • UI states: loading, empty, error, content.<br>• Input handling: validation on client and server side, sanitization, feedback for errors.<br>• Search: local vs. server-side search, indexing, typo tolerance. |

---

## Feature development

| Category | Key considerations |
|---|---|
| Version management | • Force upgrading: soft vs. hard upgrades, when to require updates, graceful prompts, version compatibility policies.<br>• Safe rollout: phased rollouts, feature flags, rollback procedures.<br>• CI/CD: automate build, test and deployments, code quality and security checks, ensure reproducible builds. |
| Dynamic configuration | • Remote config: feature control without app updates, default values for offline scenarios.<br>• A/B testing: experiments with clear metrics, user segmentation.<br>• Analytics: performance and business metrics, crash monitoring, logging. |
| Code architecture | • Modularization: separation of concerns, clear interfaces, balance granularity with practical maintenance.<br>• Dependency injection: testability, object lifecycle management, minimize global state and singletons.<br>• Third-party libraries: security and maintenance evaluation, size impact. |
| User experience | • Localization: text expansion/contraction, cultural and regional differences.<br>• Accessibility: screen readers, contrast, touch targets, test with accessibility tools.<br>• Crash reporting: automated collection, issue prioritization by impact and frequency, ensure right PII handling. |

---

## Performance

| Category | Key considerations |
|---|---|
| User experience | • Pre-fetching: predictive fetching, resource usage trade-offs, prioritize critical paths.<br>• App startup: optimize initialization, defer non-critical tasks, measure cold/warm start times.<br>• Stability: prevent crashes, implement error boundaries. |
| Resource management | • Battery & CPU: minimize background processing, batch operations.<br>• Network efficiency: compress payloads, minimize requests, adapt quality on connection type.<br>• App size: optimize assets, use app bundles, remove unused code. |
| Technical optimizations | • Caching strategy: cache appropriate responses, invalidation policies, multi-level caching.<br>• Lazy loading: on-demand components and data loading, defer heavy processing until needed, prioritize visible content first.<br>• Concurrency: proper threading models, avoid blocking main thread, manage thread contention and race conditions.<br>• Hardware acceleration: GPU usage for animations and rendering, specific hardware optimizations. |
| Monitoring | • Observability: performance metrics, proactive alerting, traces for complex operations.<br>• Business metrics: connect performance to business outcomes, track user engagement, user funnels, identify bottlenecks affecting revenue. |

---

## Team & Organization

| Category | Key considerations |
|---|---|
| Technical infrastructure | • Design system: consistent visual language, reusable components.<br>• Development efficiency: optimized builds, coding standards, effective code review processes. |
| Process & quality | • Code quality: static analysis, automated testing, technical debt.<br>• Risk management: early identification, contingency plans. |
| Team & culture | • Developer experience: efficient workflows, documentation.<br>• Team growth: onboarding, knowledge sharing, continuous learning. |
| Company context | • Available resources: infra constraints, team size and expertise, budget, in-house development vs. 3rd party investments.<br>• Business priorities: objectives alignment, target markets, monetization strategies, short-term needs vs. long-term platform health.<br>• Outage handling: escalation procedures, recovery playbooks, appropriate redundancies.<br>• Tech stack: integration with existing systems, platform consistency, future ecosystem evolution, standardization vs. specialized tools. |

---

> 📌 **Remember:** This list isn't meant to be a checkbox exercise where you cover everything. Strategic selection is key! Focus on the considerations most relevant to your specific design challenge, and be ready to explain why those topics are important. Your ability to make thoughtful trade-offs based on the system's unique requirements demonstrates stronger design thinking than attempting to cover every possible topic.