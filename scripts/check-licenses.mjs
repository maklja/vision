#!/usr/bin/env node
/**
 * Production dependency license gate for the pnpm workspace.
 *
 * The allow list, deny list, and accepted-finding process are documented in
 * DEPENDENCY_MAINTENANCE.md. Run this through `pnpm audit:licenses`, which CI uses as well.
 */
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

// Permissive licenses that may ship without a review.
const allowedLicenses = new Set([
	'0BSD',
	'Apache-2.0',
	'BlueOak-1.0.0',
	'BSD-2-Clause',
	'BSD-3-Clause',
	'CC0-1.0',
	'ISC',
	'MIT',
	'MIT-0',
	'Python-2.0',
	'Unlicense',
	'Zlib',
]);

// Copyleft and other licenses that always need a time-boxed accepted finding before they may ship.
const deniedLicenses = new Set([
	'AGPL-3.0-only',
	'AGPL-3.0-or-later',
	'BUSL-1.1',
	'CC-BY-NC-4.0',
	'GPL-2.0-only',
	'GPL-2.0-or-later',
	'GPL-3.0-only',
	'GPL-3.0-or-later',
	'LGPL-2.1-only',
	'LGPL-2.1-or-later',
	'LGPL-3.0-only',
	'LGPL-3.0-or-later',
	'SSPL-1.0',
	'UNLICENSED',
]);

// Accepted findings are reviewed exceptions. Each entry needs an owner, a rationale, and a
// `reviewBy` date (YYYY-MM-DD) at most 90 days out; the gate fails once that date passes.
const acceptedFindings = [];

const reviewWindowDays = 90;

const splitTopLevel = (expression, separator) => {
	const parts = [];
	let current = '';
	let depth = 0;

	for (let index = 0; index < expression.length; index += 1) {
		const character = expression[index];
		if (character === '(') {
			depth += 1;
		} else if (character === ')') {
			depth -= 1;
		}

		if (depth === 0 && expression.startsWith(separator, index)) {
			parts.push(current);
			current = '';
			index += separator.length - 1;
			continue;
		}

		current += character;
	}

	parts.push(current);
	return parts.map((part) => part.trim()).filter((part) => part.length > 0);
};

const stripWrap = (expression) => {
	let value = expression.trim();

	while (value.startsWith('(') && value.endsWith(')')) {
		let depth = 0;
		let wraps = true;

		for (let index = 0; index < value.length; index += 1) {
			if (value[index] === '(') {
				depth += 1;
			} else if (value[index] === ')') {
				depth -= 1;
			}
			if (depth === 0 && index < value.length - 1) {
				wraps = false;
				break;
			}
		}

		if (!wraps) {
			break;
		}
		value = value.slice(1, -1).trim();
	}

	return value;
};

// A license expression passes when one OR alternative is allowed and every AND requirement is
// allowed, so a dual-licensed package like `(MPL-2.0 OR Apache-2.0)` passes through Apache-2.0.
const isLicenseAllowed = (expression) => {
	const value = stripWrap(expression);
	const alternatives = splitTopLevel(value, ' OR ');
	if (alternatives.length > 1) {
		return alternatives.some(isLicenseAllowed);
	}

	const requirements = splitTopLevel(value, ' AND ');
	if (requirements.length > 1) {
		return requirements.every(isLicenseAllowed);
	}

	if (deniedLicenses.has(value)) {
		return false;
	}

	return allowedLicenses.has(value);
};

const millisecondsPerDay = 24 * 60 * 60 * 1000;

// reviewBy is a UTC calendar date: it remains valid through that entire day.
const daysUntil = (date) =>
	Date.parse(date) / millisecondsPerDay - Math.floor(Date.now() / millisecondsPerDay);

const describeFindingProblem = (finding) => {
	if (
		!['package', 'license', 'owner', 'rationale', 'reviewBy'].every(
			(field) => typeof finding?.[field] === 'string' && finding[field].trim().length > 0,
		)
	) {
		return 'accepted findings must record a package, license, owner, rationale, and reviewBy date';
	}
	if (
		!/^\d{4}-\d{2}-\d{2}$/.test(finding.reviewBy) ||
		Number.isNaN(Date.parse(finding.reviewBy)) ||
		new Date(finding.reviewBy).toISOString().slice(0, 10) !== finding.reviewBy
	) {
		return `accepted finding has an invalid reviewBy date: ${finding.reviewBy}`;
	}
	if (daysUntil(finding.reviewBy) > reviewWindowDays) {
		return `accepted finding reviewBy date must be within ${reviewWindowDays} days: ${finding.reviewBy}`;
	}
	if (daysUntil(finding.reviewBy) < 0) {
		return `accepted finding review date has passed: ${finding.reviewBy}`;
	}
	return null;
};

const readInventory = () => {
	try {
		const output = execFileSync('pnpm', ['licenses', 'list', '--prod', '--json'], {
			encoding: 'utf8',
			maxBuffer: 64 * 1024 * 1024,
			stdio: ['ignore', 'pipe', 'inherit'],
		});
		return JSON.parse(output);
	} catch (error) {
		console.error(
			'Unable to read the production dependency license inventory with `pnpm licenses list --prod --json`.',
		);
		console.error(error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
};

export const evaluateLicenseInventory = (inventory, findings = acceptedFindings) => {
	const violations = [];
	const appliedFindings = [];
	const histogram = new Map();
	let packagesChecked = 0;

	// Validate all exceptions, including entries that no longer match a disallowed dependency.
	const validFindings = [];
	for (const finding of findings) {
		const problem = describeFindingProblem(finding);
		if (problem) {
			violations.push({
				name: finding?.package ?? '(missing package)',
				versions: [],
				license: finding?.license ?? '(missing license)',
				reason: problem,
			});
		} else {
			validFindings.push(finding);
		}
	}

	for (const [expression, packages] of Object.entries(inventory)) {
		for (const dependency of packages) {
			packagesChecked += 1;
			histogram.set(expression, (histogram.get(expression) ?? 0) + 1);

			if (isLicenseAllowed(expression)) {
				continue;
			}

			const finding = validFindings.find(
				(entry) => entry.license === expression && entry.package === dependency.name,
			);

			if (!finding) {
				violations.push({
					name: dependency.name,
					versions: dependency.versions,
					license: expression,
					reason: 'license is not on the allow list',
				});
				continue;
			}

			appliedFindings.push({
				name: dependency.name,
				license: expression,
				owner: finding.owner,
			});
		}
	}

	return { violations, appliedFindings, histogram, packagesChecked };
};

const runAudit = () => {
	const { violations, appliedFindings, histogram, packagesChecked } =
		evaluateLicenseInventory(readInventory());
	console.log(`Production dependency license inventory (${packagesChecked} packages):`);
	const sortedHistogram = [...histogram.entries()].sort((left, right) => right[1] - left[1]);
	for (const [expression, count] of sortedHistogram) {
		console.log(`  ${expression}: ${count}`);
	}

	for (const finding of appliedFindings) {
		console.log(`  accepted: ${finding.name} (${finding.license}) — owner ${finding.owner}`);
	}

	if (packagesChecked === 0) {
		console.error(
			'The license inventory was empty; the audit did not collect any production dependency.',
		);
		process.exitCode = 1;
	} else if (violations.length > 0) {
		console.error(`\n${violations.length} production dependency license violation(s):`);
		for (const violation of violations) {
			console.error(
				`  ${violation.name}${violation.versions.length ? `@${violation.versions.join(', ')}` : ''} (${violation.license}): ${violation.reason}`,
			);
		}
		console.error(
			'\nFix: replace or upgrade the dependency, add a reviewed license to the allow list, or record an accepted finding with an owner, rationale, and review date. See DEPENDENCY_MAINTENANCE.md.',
		);
		process.exitCode = 1;
	} else {
		console.log('\nAll production dependency licenses are allowed.');
	}
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	runAudit();
}
