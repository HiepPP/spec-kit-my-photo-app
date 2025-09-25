# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a photo organizer application built with React, TypeScript, Tailwind CSS, and shadcn/ui components. The app organizes local photos into albums by capture date, with drag-and-drop reordering and ZIP export functionality. All data is stored locally using SQLite with no cloud dependencies.

## Constitution and Development Principles

The project follows strict constitutional principles (see `.specify/memory/constitution.md`):

- **React Component Architecture**: Functional components with hooks, single responsibility principle
- **100% Test Coverage**: TDD enforced, tests written before implementation (NON-NEGOTIABLE)
- **Accessibility First**: WCAG 2.1 AA compliance, ARIA labels, keyboard navigation
- **Local SQLite Storage**: Offline-first, no external dependencies for data
- **Modern React Ecosystem**: React 18+, TypeScript, Tailwind CSS, shadcn/ui components

## Project Structure and Workflow

### Spec-Kit Architecture

This project uses the Spec-Kit methodology for feature development:

1. `/specify` - Create feature specifications in `specs/###-feature-name/spec.md`
2. `/plan` - Generate implementation plans in `specs/###-feature-name/plan.md`
3. `/tasks` - Create task lists in `specs/###-feature-name/tasks.md`
4. Implementation follows the constitutional principles

### Key Directories

- `.specify/` - Templates, scripts, and governance documents
- `specs/` - Feature specifications and implementation plans
- `.claude/` - Claude Code command definitions

### Essential Scripts

- `.specify/scripts/bash/create-new-feature.sh` - Initialize new feature branches and specs
- `.specify/scripts/bash/update-agent-context.sh claude` - Update this CLAUDE.md file

## Technology Stack

### Core Dependencies

- **Frontend**: React.js 18+ with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Build**: Vite for development and production builds
- **Database**: SQLite for local storage
- **Testing**: Jest/Vitest with React Testing Library
- **State Management**: React hooks (useState, useReducer) and Context API

### Development Commands

Since this is a new project without package.json yet, these will be established during implementation:

- Build: `npm run build` (to be configured with Vite)
- Test: `npm test` (to be configured with Vitest)
- Lint: `npm run lint` (to be configured)
- Dev server: `npm run dev` (to be configured with Vite)

## Constitutional Compliance

### Test-Driven Development

- ALWAYS write failing tests before implementation
- Use Red-Green-Refactor cycle
- 100% test coverage is mandatory - no exceptions
- Tests must cover all functional requirements from specifications

### Component Development

- Start with shadcn/ui components when possible
- Follow single responsibility principle
- Use TypeScript for all components
- Implement proper prop interfaces
- Create custom hooks for shared logic

### Accessibility Requirements

- Include ARIA labels on all interactive elements
- Ensure keyboard navigation works
- Test with screen readers
- Follow semantic HTML principles
- Validate against WCAG 2.1 AA standards

### Local Storage Strategy

- Use SQLite for all data persistence
- No cloud storage or external APIs for data
- Implement data export/import capabilities
- Ensure offline functionality

## Current Feature

**Active Feature**: Photo Organizer App (`001-build-a-photo`)

- **Specification**: `specs/001-build-a-photo/spec.md`
- **Status**: Specification complete, ready for planning phase
- **Key Requirements**: Upload photos, auto-group by date, drag-and-drop albums, tile view, zoom, ZIP export

Next step: Run `/plan` command to create implementation plan.
