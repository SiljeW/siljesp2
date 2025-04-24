import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'public/account/login.html'),
        register: resolve(__dirname, 'public/account/register.html'),
        profile: resolve(__dirname, 'public/account/profile.html'),
      }
    }
  }
});