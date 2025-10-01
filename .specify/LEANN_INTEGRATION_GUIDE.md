# LEANN Integration Guide for Spec-Kit Workflow

## Overview

This guide explains how to integrate LEANN semantic search with your Spec-Kit development workflow to enable intelligent code discovery and knowledge management across your photo app project.

## What We've Built

**Index Name**: `my-photo-app`
**Size**: 0.8 MB (97% smaller than traditional vector databases)
**Content**: 823 searchable chunks from 76 documents
**Coverage**: Specs, source code, tests, templates, and documentation

## Key Features Demonstrated

### 1. Semantic Code Search
Instead of grep or text matching, LEANN understands concepts:

```bash
# Traditional approach
grep -r "upload" src/

# LEANN semantic approach
leann search my-photo-app "photo upload functionality"
```

### 2. Cross-Reference Discovery
Find related concepts across different document types:

```bash
leann search my-photo-app "constitution React components"
# Results link constitutional principles with implementation details
```

### 3. Pattern Recognition
Discover implementation patterns and best practices:

```bash
leann search my-photo-app "error handling validation"
# Finds error patterns across tests, components, and specs
```

## Integration with Spec-Kit Phases

### Phase 0: Specification Enhancement
When creating feature specifications, use LEANN to:

```bash
# Research existing patterns
leann search my-photo-app "similar authentication patterns"

# Find constitutional requirements
leann search my-photo-app "accessibility requirements"

# Check for related implementations
leann search my-photo-app "photo gallery components"
```

### Phase 1: Planning Support
Enhance your planning phase with context discovery:

```bash
# Find similar feature implementations
leann search my-photo-app "drag and drop functionality"

# Discover test patterns
leann search my-photo-app "TDD test coverage"

# Research architectural decisions
leann search my-photo-app "React component architecture patterns"
```

### Phase 2: Task Generation
Support task creation with pattern discovery:

```bash
# Find similar task structures
leann search my-photo-app "component testing patterns"

# Discover integration approaches
leann search my-photo-app "database integration patterns"
```

### Phase 3: Implementation Aid
During implementation, use LEANN for:

```bash
# Find similar implementations
leann search my-photo-app "modal component patterns"

# Discover error handling approaches
leann search my-photo-app "async error handling"

# Find testing patterns
leann search my-photo-app "React Testing Library patterns"
```

## Practical Query Examples

### Feature Development
```bash
# Understanding existing photo handling
leann search my-photo-app "image processing workflow"

# Finding UI patterns
leann search my-photo-app "responsive grid layouts"

# Discover state management approaches
leann search my-photo-app "React hooks state patterns"
```

### Constitution Compliance
```bash
# Check accessibility requirements
leann search my-photo-app "WCAG compliance implementation"

# Find test coverage requirements
leann search my-photo-app "100% test coverage patterns"

# Discover local storage patterns
leann search my-photo-app "SQLite local storage"
```

### Debugging and Problem Solving
```bash
# Find error handling patterns
leann search my-photo-app "error boundaries React"

# Discover performance optimizations
leann search my-photo-app "performance optimization patterns"

# Find debugging approaches
leann search my-photo-app "React debugging techniques"
```

## Maintaining the Index

### Updating the Index
When you add new files or make significant changes:

```bash
# Rebuild the index with updated content
leann build my-photo-app --docs ./specs ./src ./tests ./CLAUDE.md ./.specify --file-types .md,.tsx,.ts,.js,.jsx,.json
```

### Selective Updates
For specific directories or file types:

```bash
# Update only specifications
leann build specs-only --docs ./specs --file-types .md

# Update only source code
leann build code-only --docs ./src --file-types .tsx,.ts
```

## Advanced Usage

### Combining LEANN with MCP Tools
Since you have LEANN MCP integration, you can:

1. **Use Claude Code with LEANN context**: Claude automatically gets semantic context from your codebase
2. **Cross-reference specifications and implementation**: Ask questions that span specs and code
3. **Discover implicit patterns**: Find undocumented architectural decisions

### Query Strategies

1. **Start Broad, Then Narrow**: Begin with general concepts, then add specifics
   ```bash
   leann search my-photo-app "authentication"
   leann search my-photo-app "JWT token validation React"
   ```

2. **Use Domain Language**: Use your project's terminology
   ```bash
   leann search my-photo-app "album drag reordering"
   leann search my-photo-app "photo metadata extraction"
   ```

3. **Cross-Reference Constraints**: Link requirements with implementation
   ```bash
   leann search my-photo-app "accessibility keyboard navigation"
   leann search my-photo-app "local SQLite database constraints"
   ```

## Integration with Your Current Workflow

### Before Creating New Features
```bash
# Research existing patterns
leann search my-photo-app "similar feature implementation"

# Check constitutional compliance
leann search my-photo-app "relevant constitutional requirements"

# Find test strategies
leann search my-photo-app "testing patterns for similar features"
```

### During Code Reviews
```bash
# Verify pattern consistency
leann search my-photo-app "existing error handling patterns"

# Check test coverage approaches
leann search my-photo-app "similar component testing strategies"

# Validate architectural decisions
leann search my-photo-app "architectural patterns for similar functionality"
```

### Knowledge Discovery
```bash
# Find undocumented decisions
leann search my-photo-app "implementation rationale"

# Discover best practices
leann search my-photo-app "code quality patterns"

# Cross-reference related features
leann search my-photo-app "related functionality patterns"
```

## Benefits Achieved

1. **97% Storage Reduction**: Traditional vector databases would require ~25MB, LEANN uses only 0.8MB
2. **Lightning Fast Search**: Sub-second semantic search across entire codebase
3. **Privacy**: Everything runs locally, no code sent to external services
4. **Context Awareness**: AI assistants have deep understanding of project structure
5. **Pattern Discovery**: Find implicit architectural decisions and best practices

## Tips for Effective Usage

1. **Use Natural Language**: Ask questions as you would to a senior developer
2. **Iterate Your Queries**: Refine based on results to discover deeper insights
3. **Cross-Reference**: Use results to find related concepts and patterns
4. **Document Discoveries**: Add insights from LEANN searches to your specs and documentation

## Troubleshooting

### Common Issues

1. **Missing Content**: Ensure all relevant files are included in the index
2. **Outdated Results**: Rebuild index after major changes
3. **Poor Results**: Try different query terms or broader concepts

### Getting Help

The LEANN MCP integration provides contextual assistance, and you can always use `leann --help` for command reference.

---

*This integration guide demonstrates how LEANN enhances your Spec-Kit workflow by providing semantic understanding across all your project artifacts, making your development process more efficient and knowledge-rich.*