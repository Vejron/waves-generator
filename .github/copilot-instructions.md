# GitHub Copilot Instructions for Waves Generator

This project is a **Nuxt 4** application using **@nuxt/ui** and **Tailwind CSS v4**.

## Architecture & Structure

- **Source Directory:** `app/` is the source root.
  - Components: `app/components/`
  - Pages: `app/pages/`
  - Assets: `app/assets/`
  - Composables: `app/composables/`
- **Framework:** Nuxt 4 with `@nuxt/ui`.
- **Styling:** Tailwind CSS v4.
- **Configuration:** `nuxt.config.ts` handles modules and build settings.

## Coding Conventions

### Vue Components

- **Script Setup:** Use `<script setup lang="ts">` for component logic.
- **Type Definitions:** Export prop interfaces in a separate `<script lang="ts">` block to allow importing them elsewhere.
  ```vue
  <script lang="ts">
  export interface MyComponentProps {
    label: string;
  }
  </script>

  <script setup lang="ts">
  defineProps<MyComponentProps>();
  </script>
  ```
- **Props:** Use `withDefaults` to define default values for props.
- **Slots:** Use `defineSlots` for fully typed slots.
- **Auto-imports:** Leverage Nuxt's auto-imports for Vue APIs (`ref`, `computed`, `watch`) and Nuxt composables (`useHead`, `useRouter`). Do not manually import them.

### Styling (Tailwind CSS v4)

- **Syntax:** Use Tailwind CSS v4 syntax (e.g., `@theme`, `@source`).
- **Global Styles:** Located in `app/assets/css/main.css`.
- **Dynamic Classes:** If generating classes dynamically, use the `@source inline` directive in CSS to ensure Tailwind detects them.
  ```css
  /* app/assets/css/main.css */
  @source inline('{sm:,md:,lg:,xl:,}grid-cols-{1,2,3,4,5,6,7,8}');
  ```
- **Theming:** Use CSS variables (e.g., `--ui-container`) for theme values.

### Nuxt & UI Library

- **Components:** Prefer `@nuxt/ui` components (`UButton`, `UContainer`, `UInput`) over standard HTML elements when applicable.
- **Icons:** Use the `icon` prop on UI components or the `UIcon` component with Iconify keys (e.g., `ph:waves`).

## Workflows

- **Development:** Run `npm run dev` to start the development server.
- **Build:** Run `npm run build` for production builds.
- **Linting:** The project uses `@nuxt/eslint`. Ensure code follows the linting rules.

## Key Files

- `nuxt.config.ts`: Project configuration.
- `app/assets/css/main.css`: Tailwind v4 setup and global styles.
- `app/components/ASection.vue`: Reference for component structure, exported types, and slot usage.
- `app/components/SvgWaveGenerator.vue`: Reference for interactive logic and SVG manipulation.
