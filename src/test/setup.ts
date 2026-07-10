import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Automatically clean up standard render/testing DOM tree after each test
afterEach(() => {
  cleanup();
});
