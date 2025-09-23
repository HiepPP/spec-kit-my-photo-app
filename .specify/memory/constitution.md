<!--
SYNC IMPACT REPORT
Version change: 1.0.0 → 2.0.0
Modified principles:
- I. Vanilla Web Standards → React Component Architecture
- V. Minimal Dependencies → Modern React Ecosystem
Added sections: None
Removed sections: None
Templates requiring updates:
- ✅ plan-template.md (compatible - references constitution check)
- ✅ spec-template.md (compatible - no constitutional constraints)
- ✅ tasks-template.md (compatible - follows TDD principles)
Follow-up TODOs: None
-->

# My Photo App Constitution

## Core Principles

### I. React Component Architecture

Use React.js as the primary UI framework with functional components and hooks. Component design MUST follow single responsibility principle with clear prop interfaces. Custom hooks MUST be used for shared logic. Components MUST be reusable and composable following React best practices.

### II. 100% Test Coverage (NON-NEGOTIABLE)

Every line of code MUST have corresponding unit tests. Test coverage below 100% blocks all releases. Tests MUST be written before implementation (TDD). Red-Green-Refactor cycle is strictly enforced. No exceptions for "simple" code or "obvious" functionality.

### III. Accessibility First

All user interfaces MUST include proper ARIA labels, semantic HTML, and keyboard navigation support. Accessibility requirements are non-negotiable and MUST be validated before any feature is considered complete. Follow WCAG 2.1 AA standards as minimum baseline.

### IV. Local SQLite Storage

All data persistence MUST use local SQLite databases. No external databases, cloud storage, or remote dependencies for data storage. The application MUST function completely offline. Data export/import capabilities are required for user control.

### V. Modern React Ecosystem

Core dependencies are React.js, Tailwind CSS, and shadcn/ui components. Additional dependencies require justification and approval. Prefer shadcn/ui components over custom implementations. Tailwind utility classes MUST be used for all styling with custom CSS only for complex animations or layouts not achievable with utilities.

## Technology Constraints

- **Frontend Framework**: React.js 18+ with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build Tool**: Vite for development and production builds
- **Database**: SQLite with local file storage only
- **Testing**: Jest/Vitest with React Testing Library
- **State Management**: React hooks (useState, useReducer) and Context API
- **Bundling**: Vite's native bundling with React optimizations

## Development Workflow

- **Test-Driven Development**: Tests written and failing before any implementation
- **Component Development**: Start with shadcn/ui components, customize as needed
- **Local Development**: All development occurs locally with no external service dependencies
- **Accessibility Validation**: Manual and automated accessibility testing required
- **Performance Standards**: Core Web Vitals must meet "Good" thresholds
- **Code Review**: All changes require review focusing on constitutional compliance
- **Documentation**: Every feature requires updated documentation including accessibility notes

## Governance

This constitution supersedes all other development practices and guidelines. Changes to core principles require documented justification and migration plan. All code reviews MUST verify constitutional compliance before approval.

**Amendment Process**: Constitutional changes require unanimous approval and complete regression testing. Version increments follow semantic versioning for governance changes.

**Compliance Review**: Weekly constitution compliance audits required. Violations must be resolved immediately or feature reverted.

**Version**: 2.0.0 | **Ratified**: 2025-09-23 | **Last Amended**: 2025-09-23