<!--
SYNC IMPACT REPORT
Version change: NEW → 1.0.0
Modified principles: None (new constitution)
Added sections:
- Core Principles (5 principles for minimalist web app)
- Technology Constraints
- Development Workflow
- Governance
Removed sections: None
Templates requiring updates:
- ✅ plan-template.md (compatible - references constitution check)
- ✅ spec-template.md (compatible - no constitutional constraints)
- ✅ tasks-template.md (compatible - follows TDD principles)
Follow-up TODOs: None
-->

# My Photo App Constitution

## Core Principles

### I. Vanilla Web Standards
Use vanilla JavaScript, HTML, and CSS where possible. Modern web APIs and standards are preferred over complex frameworks. Libraries may only be added when they provide essential functionality that cannot be reasonably implemented with vanilla technologies or when they significantly reduce complexity without introducing significant dependencies.

### II. 100% Test Coverage (NON-NEGOTIABLE)
Every line of code MUST have corresponding unit tests. Test coverage below 100% blocks all releases. Tests MUST be written before implementation (TDD). Red-Green-Refactor cycle is strictly enforced. No exceptions for "simple" code or "obvious" functionality.

### III. Accessibility First
All user interfaces MUST include proper ARIA labels, semantic HTML, and keyboard navigation support. Accessibility requirements are non-negotiable and MUST be validated before any feature is considered complete. Follow WCAG 2.1 AA standards as minimum baseline.

### IV. Local SQLite Storage
All data persistence MUST use local SQLite databases. No external databases, cloud storage, or remote dependencies for data storage. The application MUST function completely offline. Data export/import capabilities are required for user control.

### V. Minimal Dependencies
No external dependencies beyond Vite for build tooling. Any proposed dependency MUST be justified with clear rationale for why vanilla implementation is insufficient. Dependencies that duplicate native browser capabilities are forbidden.

## Technology Constraints

- **Build Tool**: Vite only for development and production builds
- **Database**: SQLite with local file storage only
- **Testing**: Browser-native testing or minimal testing utilities
- **Styling**: CSS custom properties, CSS Grid, Flexbox - no CSS frameworks
- **JavaScript**: ES2020+ features, Web APIs, no transpilation unless required for specific browser support
- **Bundling**: Vite's native bundling, no additional bundlers or plugins unless essential

## Development Workflow

- **Test-Driven Development**: Tests written and failing before any implementation
- **Local Development**: All development occurs locally with no external service dependencies
- **Accessibility Validation**: Manual and automated accessibility testing required
- **Performance Standards**: Core Web Vitals must meet "Good" thresholds
- **Code Review**: All changes require review focusing on constitutional compliance
- **Documentation**: Every feature requires updated documentation including accessibility notes

## Governance

This constitution supersedes all other development practices and guidelines. Changes to core principles require documented justification and migration plan. All code reviews MUST verify constitutional compliance before approval.

**Amendment Process**: Constitutional changes require unanimous approval and complete regression testing. Version increments follow semantic versioning for governance changes.

**Compliance Review**: Weekly constitution compliance audits required. Violations must be resolved immediately or feature reverted.

**Version**: 1.0.0 | **Ratified**: 2025-09-23 | **Last Amended**: 2025-09-23