import { describe, expect, it } from 'vitest';
import { blocking, nodeCheck } from '../src/setup/checks.js';

describe('setup checks', () => {
  it('require Node 20 or later', () => {
    expect(nodeCheck('22.1.0').ok).toBe(true);
    expect(nodeCheck('18.19.0').ok).toBe(false);
    expect(blocking([nodeCheck('18.19.0')])).toHaveLength(1);
  });
});
