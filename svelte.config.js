import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    paths: {
      base: '/svelte-swipe'
    },
    adapter: adapter({
      pages: 'build', // path to public directory
      assets: 'build' // path to public directory
    })
  }
};

export default config;
