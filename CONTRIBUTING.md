# Contributing to QazDocs

We welcome contributions to QazDocs! To ensure consistency and quality, please follow these guidelines.

## 🎨 Style Guidelines

### Colors
Always use the brand color palette defined in `tailwind.config.js`:
- `brand-black`: `#000000`
- `brand-eggshell`: `#f3efe0`
- `brand-aquamarine`: `#7fefbd`
- `brand-gold`: `#cba135`

### Styling Principles
- **No Gradients**: Use flat colors or subtle shadows.
- **Animations**: Use `framer-motion` for all transitions. Aim for a "premium" feel with sliding entrance animations and smooth hovers.
- **Responsiveness**: Ensure all components work from mobile to desktop.

## 🛠️ Development Workflow

1. **Routing**: Use TanStack Router for all navigation. Define routes in `src/routes`.
2. **State Management**: Use TanStack Query for server state. Avoid local state for data that can be fetched.
3. **Components**: Use functional components with hooks. Keep components small and reusable.
4. **Icons**: Use `lucide-react` for all iconography.

## 📮 Pull Request Process

1. Create a feature branch from `main`.
2. Ensure your code passes linting and type checks.
3. Update the `README.md` if you add new features.
4. Submit your PR and wait for review.
