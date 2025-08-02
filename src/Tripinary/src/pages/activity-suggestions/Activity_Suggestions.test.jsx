import { describe, it, expect, vi } from 'vitest';
import { fetchTips } from '../activity-suggestions/fetchTips'; 

//Mock the global fetch API before each test
global.fetch = vi.fn();

describe('fetchTips', () => {
  it('returns a travel tip from OpenRouter', async () => {
    fetch.mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          choices: [
            {
              message: {
                content: 'Pack light, but carry curiosity.',
              },
            },
          ],
        }),
    });

    const result = await fetchTips('Tokyo', 'fake-api-key');
    expect(result).toBe('Pack light, but carry curiosity.');
  });

  //Tests the fallback message when there is no input
  it('returns fallback message if choices are missing', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({}),
    });

    const result = await fetchTips('Kyoto', 'fake-api-key');
    expect(result).toBe('No tip available, but adventure awaits!');
  });

  //Tests to see if a message pops up when there is a network failure
  it('returns error message on network failure', async () => {
    fetch.mockRejectedValueOnce(new Error('Network fail'));

    const result = await fetchTips('Osaka', 'fake-api-key');
    expect(result).toBe("Oops! Couldn't fetch your travel tip.");
  });
});
