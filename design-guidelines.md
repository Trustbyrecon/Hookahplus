# Moodbook Design Guidelines

The project uses a custom Moodbook color palette defined in `tailwind.config.js`.
Follow these rules when adding styles:

- Use palette colors such as `charcoal`, `ember`, `mystic`, `deepMoss`, and `goldLumen`.
- Do **not** use Tailwind's default `black`, `white`, or `gray-*` classes.
- Extend the palette in `tailwind.config.js` if additional colors are required.

Run the palette check on changed files before committing:

```bash
npm run check:palette -- <files>
```
