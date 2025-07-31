import '@testing-library/jest-dom';
import { beforeAll, beforeEach, afterAll } from 'vitest';
import { setupFetchMock } from 'vitest-fetch-mock';
import nock from 'nock';

// Setup fetch mock globally for Vitest
setupFetchMock(beforeAll, afterAll, beforeEach);

// Ensure nock cleans up after itself for backend tests
beforeEach(() => {
  nock.cleanAll();
});

afterAll(() => {
  nock.restore(); // Restore network connections after all tests
});
