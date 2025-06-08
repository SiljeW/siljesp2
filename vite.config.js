import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        login: 'login.html',
        register: 'register.html',
        profile: 'profile.html',
        listings: 'listings.html',
        pets: 'pets.html'
      }
    }
  }
})