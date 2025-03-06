<build_quality_standards>
When implementing code changes or creating new components, always adhere to these standards:

1. Type Safety
- Ensure all types are explicitly defined
- Use proper type imports from libraries
- Avoid using 'any' type unless absolutely necessary
- Verify type compatibility between components and their props
- Handle null and undefined cases explicitly
- Use proper type assertions and guards

2. Component Architecture
- Follow React best practices and modern patterns
- Use functional components with proper hooks
- Implement proper prop typing and validation
- Handle loading, error, and empty states
- Ensure proper event handling and callbacks
- Follow the single responsibility principle

3. Dependency Management
- Verify compatibility between package versions
- Use specific version numbers in package.json
- Handle peer dependencies appropriately
- Use --legacy-peer-deps only when necessary
- Document any specific dependency requirements

4. UI Component Standards
- Use consistent component libraries (e.g., shadcn/ui)
- Follow the design system's patterns and conventions
- Implement proper accessibility features
- Handle responsive design requirements
- Use proper variant types and props

5. Authentication & Authorization
- Follow security best practices
- Handle user sessions properly
- Implement proper role-based access control
- Use correct adapter types and configurations
- Handle authentication errors gracefully

6. Form Handling
- Implement proper form validation
- Use appropriate form libraries (e.g., react-hook-form)
- Handle form submission states
- Provide proper user feedback
- Implement proper error handling

7. API Integration
- Handle API responses properly
- Implement proper error handling
- Use proper typing for API responses
- Handle loading and error states
- Implement proper caching strategies

8. Code Quality
- Follow consistent naming conventions
- Implement proper error boundaries
- Use proper code organization
- Follow DRY principles
- Implement proper commenting and documentation

9. Build Process
- Verify all imports are properly resolved
- Ensure no unused variables or imports
- Handle environment variables properly
- Follow proper file structure
- Implement proper code splitting

10. Testing Considerations
- Ensure code is testable
- Handle edge cases
- Implement proper error scenarios
- Consider performance implications
- Handle async operations properly

Before completing any code change:
1. Verify all types are properly defined
2. Check for proper error handling
3. Verify proper prop passing
4. Ensure consistent styling
5. Check for proper form validation
6. Verify API integration
7. Check for proper authentication handling
8. Verify proper state management
9. Ensure proper loading states
10. Run build process to verify changes

Error Resolution Process:
1. Identify the exact error message
2. Locate the source file and line number
3. Understand the type mismatch or issue
4. Implement the fix following the standards above
5. Verify the fix doesn't introduce new issues
6. Test the build process again
7. Document any necessary changes
</build_quality_standards>

<file_structure_standards>
Maintain consistent file organization:

/src
  /components
    /ui          # Reusable UI components
    /layouts     # Layout components
    /features    # Feature-specific components
  /lib          # Utility functions and configurations
  /types        # TypeScript type definitions
  /hooks        # Custom React hooks
  /api          # API route handlers
  /styles       # Global styles and themes
  /constants    # Constants and enums
  /context      # React context providers
  /utils        # Helper functions
</file_structure_standards>

<code_implementation_checklist>
Before submitting any code changes, verify:

1. Types
   - [ ] All props are properly typed
   - [ ] No 'any' types used
   - [ ] Proper interface definitions
   - [ ] Proper type imports

2. Components
   - [ ] Proper prop validation
   - [ ] Error boundaries implemented
   - [ ] Loading states handled
   - [ ] Empty states handled

3. Forms
   - [ ] Proper validation
   - [ ] Error handling
   - [ ] Loading states
   - [ ] Success feedback

4. API Integration
   - [ ] Proper error handling
   - [ ] Loading states
   - [ ] Type safety
   - [ ] Proper caching

5. Authentication
   - [ ] Proper session handling
   - [ ] Role-based access
   - [ ] Error handling
   - [ ] Security best practices

6. Build Process
   - [ ] No type errors
   - [ ] No lint errors
   - [ ] No console errors
   - [ ] Proper imports
</code_implementation_checklist>
