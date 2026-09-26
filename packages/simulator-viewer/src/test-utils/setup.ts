import { beforeEach, vi } from 'vitest';

const deterministicUuid = vi.hoisted(() => ({ counter: 0 }));

// Store slices generate identifiers with `uuid`'s v1. Characterizing resulting state requires
// those identifiers to be stable so tests stay deterministic and do not depend on the clock.
vi.mock('uuid', () => ({
	v1: () => `00000000-0000-4000-8000-${String(++deterministicUuid.counter).padStart(12, '0')}`,
}));

beforeEach(() => {
	deterministicUuid.counter = 0;
});
