# siljesp2

## Overview

A modern web application built with Vite, featuring Tailwind CSS for styling and PostCSS for CSS processing.
This web application allows for authenticated users (Noroff API) to register and login. 
Logged in users may create, edit and delete pet listings as well as updating profile avatar.

## Features

- ⚡ **Fast Development** - Powered by Vite for lightning-fast hot module replacement
- 🎨 **Modern Styling** - Tailwind CSS for utility-first styling
- 🔧 **PostCSS Processing** - Advanced CSS transformations and optimizations
- 📱 **Responsive Design** - Mobile-first approach with Tailwind's responsive utilities
- [Add your specific features]

## Getting Started

### Prerequisites

Make sure you have the following installed:

```bash
Node.js >= 16.x
npm >= 7.x or yarn >= 1.22.x
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SiljeW/siljesp2.git
   cd siljesp2
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

### Build

Create a production build:

```bash
npm run build
# or
yarn build
```

### Preview

Preview the production build locally:

```bash
npm run preview
# or
yarn preview
```

## Configuration

### Tailwind CSS

Tailwind CSS is configured in `tailwind.config.js`. Customize your design system by modifying:

```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Add your custom configurations here
    },
  },
  plugins: [],
}
```

### PostCSS

PostCSS plugins are configured in `postcss.config.js`:

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Vite

Vite configuration can be customized in `vite.config.js`:

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  // Add your Vite configurations here
})
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run linter (if configured)

## Styling Guide

This project uses Tailwind CSS for styling. Here are some key points:

- **Utility-first approach** - Use Tailwind's utility classes for styling
- **Responsive design** - Use responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`)
- **Custom components** - Create reusable components for complex UI patterns
- **Dark mode support** - Easily implement dark mode with Tailwind's dark mode utilities

## API Documentation

[If applicable, document your API endpoints or main functions]

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

[Explain how to run tests]

```bash
npm test
# or
yarn test
```

## Built With

- **[Vite](https://vitejs.dev/)** - Next generation frontend build tool
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[PostCSS](https://postcss.org/)** - CSS transformation tool
- **[Autoprefixer](https://autoprefixer.github.io/)** - CSS vendor prefixing
- [Add any additional frameworks/libraries you're using]

## Performance

This project leverages several technologies for optimal performance:

- **Vite's fast HMR** - Instant updates during development
- **Tree shaking** - Automatic removal of unused code
- **CSS optimization** - PostCSS optimizations and Tailwind's purge feature
- **Modern ES modules** - Native browser module support

## Browser Support

This project supports all modern browsers that support ES2015+ features. For legacy browser support, additional configuration may be needed.

