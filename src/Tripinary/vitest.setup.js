import '@testing-library/jest-dom';
import { beforeAll, beforeEach, afterAll, vi } from 'vitest';
import nock from 'nock';

beforeAll(() => {
  globalThis.fetch = vi.fn(); // Mock fetch globally
});

beforeEach(() => {
  nock.cleanAll();
  fetch.mockClear(); // Reset fetch mocks before each test
});

afterAll(() => {
  nock.restore();
});
