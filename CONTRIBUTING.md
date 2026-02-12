# Contributing to Bantoo

## Code Style Guidelines

### JavaScript/React
- Use functional components with hooks
- Follow React best practices
- Use descriptive variable names
- Add comments for complex logic
- Keep components focused and small

### Styling
- Use TailwindCSS utility classes
- Follow spacing standards:
  - Screen edges: `px-4` (16px)
  - Cards: `p-5` (20px)
  - Gaps: `gap-4` (16px) or `gap-6` (24px)
- Ensure dark mode support
- Meet 44px minimum touch targets

### File Organization
- Place components in appropriate directories
- Use index files for cleaner imports
- Keep related files together
- Follow existing naming conventions

### State Management
- Use Context for global state
- Keep component state local when possible
- Use custom hooks for reusable logic
- Avoid prop drilling

### Error Handling
- Use `logger.error()` instead of `console.error()`
- Provide user-friendly error messages
- Add error boundaries for critical sections
- Handle loading and error states

### Form Validation
- Use `useForm` hook for forms
- Add real-time validation
- Provide clear error messages
- Use Yup for schema validation

## Git Workflow

1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Test thoroughly on mobile viewport
4. Create pull request
5. Wait for review and approval

## Testing

- Test on multiple screen sizes
- Verify dark mode compatibility
- Check touch target sizes
- Test error scenarios
- Verify loading states

## Questions?

Contact the development team for any questions or clarifications.
