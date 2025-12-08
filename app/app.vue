<script setup lang="ts">
import colors from "tailwindcss/colors";


// elon.yttergren Gunnar8989 0721472824
const appConfig = useAppConfig();
const colorMode = useColorMode();

const color = computed(() =>
  colorMode.value === "dark"
    ? (colors as any)[appConfig.ui.colors.neutral][900]
    : "white"
);

useHead({
  meta: [
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { key: "theme-color", name: "theme-color", content: color },
  ],
  link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
  htmlAttrs: {
    lang: "en",
  },
});

useSeoMeta({
  title: "Waves Generator",
  description:
    "Generate waveforms with customizable parameters and download them as audio files.",
});

const links = [
  {
    label: "Waves",
    icon: "i-lucide-book",
    to: "/",
  },
  {
    label: "Examples",
    icon: "i-lucide-box",
    to: "/examples",
  },
  {
    label: "Clip-path",
    icon: "i-lucide-presentation",
    to: "/clippy",
  },
  {
    label: "Colors",
    icon: "i-lucide-droplet",
    to: "/colors",
  },
];
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator color="var(--ui-primary)" />

    <UHeader
      :ui="{ center: 'flex-1', root: 'border-none bg-transparent' }"
      :to="'/'"
      :title="appConfig.header?.title || 'hej'"
    >
      <UNavigationMenu orientation="horizontal" :items="links" />

      <template #title>
        <div class="flex items-center gap-2 font-semibold italic">
          <UIcon name="i-lucide:box" class="h-5 shrink-0" />
          Waves Generator
        </div>
      </template>

      <template #right>
        <ClientOnly>
          <UColorModeButton />

          <template #fallback>
            <div
              class="h-8 w-8 animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-md"
            />
          </template>
        </ClientOnly>
      </template>

      <template #toggle="{ open, toggle }">
        <IconMenuToggle :open="open" class="lg:hidden" @click="toggle" />
      </template>

      <template #body>
        <UNavigationMenu orientation="vertical" :items="links" />
        <!-- <UContentNavigation highlight variant="link" :navigation="navigation" /> -->
      </template>
    </UHeader>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
