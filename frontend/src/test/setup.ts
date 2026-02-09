import '@testing-library/jest-dom';

// Polyfill for Radix UI components in jsdom
window.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
