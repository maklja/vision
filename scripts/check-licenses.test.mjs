import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { evaluateLicenseInventory } from './check-licenses.mjs';

const dependency = { name: 'example', versions: ['1.0.0'] };
const acceptedFinding = {
	package: 'example',
	license: 'GPL-3.0-only',
	owner: 'maintainer',
	rationale: 'Pending replacement under tracked review',
	reviewBy: '2026-11-01',
};

describe('SPDX license expressions', () => {
	it.each([
		'MIT OR (GPL-3.0-only',
		'MIT OR OR GPL-3.0-only',
		'MIT OR SEE LICENSE IN LICENSE',
		'MIT OR GPL-3.0-only)',
		'MIT OR',
		'OR MIT',
		'MIT AND',
		'MIT OR ()',
		'MIT OR (Apache-2.0 AND)',
		'MIT OR NotAnSpdxLicense',
		'MIT Apache-2.0',
		'',
	])('rejects the complete malformed expression %s', (license) => {
		const result = evaluateLicenseInventory({ [license]: [dependency] });
		expect(result.violations).toHaveLength(1);
		expect(result.appliedFindings).toEqual([]);
	});

	it.each([
		'MIT',
		'(MPL-2.0 OR Apache-2.0)',
		'MIT OR (GPL-3.0-only AND Apache-2.0)',
		'MIT AND (Apache-2.0 OR GPL-3.0-only)',
		'(MIT AND ISC) OR GPL-3.0-only',
		'((MIT))',
	])('allows the valid expression %s', (license) => {
		expect(evaluateLicenseInventory({ [license]: [dependency] }).violations).toEqual([]);
	});

	it.each([
		'MIT AND GPL-3.0-only',
		'MIT AND (GPL-3.0-only OR AGPL-3.0-only)',
		'MIT WITH Classpath-exception-2.0',
		'MIT+',
		'LicenseRef-Custom',
	])('requires a reviewed finding for %s', (license) => {
		expect(evaluateLicenseInventory({ [license]: [dependency] }).violations).toHaveLength(1);
	});
});

describe('production license exceptions', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-10-01T12:00:00Z'));
	});

	afterEach(() => vi.useRealTimers());

	it.each([
		'2026-11-01T00:00:00Z',
		'2026-11-01T00:00:01Z',
		'2026-11-01T12:00:00Z',
		'2026-11-01T23:59:59.999Z',
	])('keeps an exception valid on its review date at %s', (now) => {
		vi.setSystemTime(new Date(now));
		const result = evaluateLicenseInventory({ 'GPL-3.0-only': [dependency] }, [
			acceptedFinding,
		]);
		expect(result.violations).toEqual([]);
		expect(result.appliedFindings).toHaveLength(1);
	});

	it('expires an exception at UTC midnight after its review date', () => {
		vi.setSystemTime(new Date('2026-11-02T00:00:00Z'));
		const result = evaluateLicenseInventory({ MIT: [dependency] }, [acceptedFinding]);
		expect(result.violations).toHaveLength(1);
		expect(result.violations[0].reason).toContain('has passed');
	});

	it.each(['2026-10-01T00:00:00Z', '2026-10-01T23:59:59.999Z'])(
		'enforces the 90-calendar-day window at %s',
		(now) => {
			vi.setSystemTime(new Date(now));
			const inventory = { 'GPL-3.0-only': [dependency] };
			const atLimit = evaluateLicenseInventory(inventory, [
				{ ...acceptedFinding, reviewBy: '2026-12-30' },
			]);
			expect(atLimit.violations).toEqual([]);
			const beyondLimit = evaluateLicenseInventory(inventory, [
				{ ...acceptedFinding, reviewBy: '2026-12-31' },
			]);
			expect(beyondLimit.violations[0].reason).toContain('within 90 days');
			expect(beyondLimit.appliedFindings).toEqual([]);
		},
	);

	it.each([
		['removed dependency', { MIT: [{ name: 'other', versions: ['1.0.0'] }] }],
		['changed license', { MIT: [dependency] }],
		['allow-listed license', { MIT: [dependency] }, 'MIT'],
	])('rejects an expired exception for a %s', (_scenario, inventory, license) => {
		const result = evaluateLicenseInventory(inventory, [
			{
				...acceptedFinding,
				license: license ?? acceptedFinding.license,
				reviewBy: '2026-09-30',
			},
		]);
		expect(result.violations).toEqual([
			expect.objectContaining({
				name: 'example',
				reason: expect.stringContaining('has passed'),
			}),
		]);
		expect(result.appliedFindings).toEqual([]);
	});

	it.each([
		['missing owner', { owner: '' }],
		['blank rationale', { rationale: ' ' }],
		['missing package', { package: '' }],
		['missing license', { license: '' }],
		['missing review date', { reviewBy: '' }],
		['invalid date', { reviewBy: 'not-a-date' }],
		['nonexistent calendar date', { reviewBy: '2026-11-31' }],
		['date beyond review window', { reviewBy: '2027-02-01' }],
	])('rejects an unmatched exception with a %s', (_scenario, fields) => {
		const result = evaluateLicenseInventory({ MIT: [dependency] }, [
			{ ...acceptedFinding, ...fields },
		]);
		expect(result.violations).toHaveLength(1);
		expect(result.appliedFindings).toEqual([]);
	});

	it('validates every exception even when a matching valid exception comes first', () => {
		const result = evaluateLicenseInventory({ 'GPL-3.0-only': [dependency] }, [
			acceptedFinding,
			{ ...acceptedFinding, reviewBy: '2026-09-30' },
		]);
		expect(result.violations).toHaveLength(1);
		expect(result.violations[0].reason).toContain('has passed');
	});

	it('applies a valid exception to a disallowed dependency', () => {
		const result = evaluateLicenseInventory({ 'GPL-3.0-only': [dependency] }, [
			acceptedFinding,
		]);
		expect(result.violations).toEqual([]);
		expect(result.appliedFindings).toEqual([
			{ name: 'example', license: 'GPL-3.0-only', owner: 'maintainer' },
		]);
	});

	it('does not apply an invalid exception to a disallowed dependency', () => {
		const result = evaluateLicenseInventory({ 'GPL-3.0-only': [dependency] }, [
			{ ...acceptedFinding, reviewBy: '2026-09-30' },
		]);
		expect(result.violations.some((entry) => entry.reason.includes('has passed'))).toBe(true);
		expect(result.appliedFindings).toEqual([]);
	});

	it('still rejects a disallowed license without an exception', () => {
		const result = evaluateLicenseInventory({ 'GPL-3.0-only': [dependency] });
		expect(result.violations).toEqual([
			{ ...dependency, license: 'GPL-3.0-only', reason: 'license is not on the allow list' },
		]);
	});

	it('allows a valid unused exception and permissive licenses', () => {
		const result = evaluateLicenseInventory({ MIT: [dependency] }, [acceptedFinding]);
		expect(result.violations).toEqual([]);
		expect(result.appliedFindings).toEqual([]);
		expect(result.packagesChecked).toBe(1);
	});
});
