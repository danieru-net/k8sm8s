import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://k8sm8s.com',
  integrations: [react()],
  markdown: {
    shikiConfig: {
      theme: 'dark-plus',
      wrap: true,
    },
  },
});
