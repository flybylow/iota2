# Project Organization Guidelines

## Overview
This document outlines the fundamental rules and best practices for maintaining a clean and well-organized project structure.

## Rule #1: Keep Everything Clean and Organized

### Folder Structure
- **Always maintain a clear folder hierarchy**
- Place files in their appropriate directories based on purpose
- Use descriptive, consistent naming conventions
- Keep related files together

### Naming Conventions
- Use lowercase with hyphens for file names (e.g., `project-setup.md`)
- Use descriptive names that clearly indicate the file's purpose
- Number documentation files for sequential reading (e.g., `01-`, `02-`)
- Avoid abbreviations unless they're widely understood

### Documentation Standards
- Store all documentation in the `docs/` folder
- Keep documentation up-to-date as the project evolves
- Write clear, concise descriptions
- Include examples when appropriate

### Best Practices
1. **Regular cleanup**: Remove obsolete files and folders
2. **Consistent formatting**: Follow established patterns
3. **Clear organization**: Group related items together
4. **Proper categorization**: Place files in their correct locations
5. **Version control**: Track changes and maintain history

## Getting Started
When adding new content:
1. Determine the appropriate folder location
2. Use proper naming conventions
3. Document your changes
4. Keep the structure clean and logical

## Current Project Structure

```
IOTA2/
├── docs/
│   ├── README.md                           # Documentation index
│   ├── 01-organization-guidelines.md       # This file
│   ├── 02-tshirt-escrow-overview.md       # Project overview
│   ├── 03-user-flows.md                    # UX flows
│   ├── 04-technical-architecture.md        # Smart contracts
│   ├── 05-react-component.md               # Frontend guide
│   ├── 06-deployment-guide.md              # Deployment steps
│   ├── 07-demo-script.md                   # Pitch script
│   ├── 08-roadmap-and-future.md            # Future plans
│   └── 09-react-component-source.md        # Source code
└── (source code will go here)
```

## Documentation Standards

### File Organization
- **Sequential numbering** for logical reading order
- **README.md** as the entry point for any folder
- **Cross-references** at the bottom of each document
- **Update timestamps** when making significant changes

### Content Standards
- Use clear, concise language
- Include code examples where relevant
- Add visual diagrams for complex flows
- Keep technical depth appropriate for audience

### Code Documentation
- Always specify language in code blocks
- Include inline comments for complex logic
- Provide working examples, not placeholders
- Show both mock and production versions

---
*Last updated: Wednesday Jan 28, 2026*
