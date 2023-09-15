import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    paths: {
      base: '/svelte-swipe'
    },
    adapter: adapter()
  }
};

export default config;
