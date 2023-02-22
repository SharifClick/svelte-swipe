// @ts-nocheck
import { sveltekit } from "@sveltejs/kit/vite";

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
  server: {
    port: 5000,
  },

  preview: {
    port: 5000,
  },
};

export default config;

