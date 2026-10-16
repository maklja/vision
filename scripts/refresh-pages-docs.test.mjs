import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, expect, it } from 'vitest';

const script = fileURLToPath(new URL('./refresh-pages-docs.sh', import.meta.url));
let directory;
let build;
let docs;

function write(root, path, content) {
	writeFileSync(join(root, path), content);
}

function publish() {
	execFileSync('bash', [script, build, docs]);
}

beforeEach(() => {
	directory = mkdtempSync(join(tmpdir(), 'vision-pages-'));
	build = join(directory, 'tested build');
	docs = join(directory, 'published docs');
	for (const root of [build, docs]) mkdirSync(join(root, 'assets'), { recursive: true });
});
afterEach(() => rmSync(directory, { recursive: true, force: true }));

it('replaces same-size, same-timestamp HTML and assets with the tested build', () => {
	const oldHtml = '<script src="/vision/assets/old.js"></script>';
	const newHtml = '<script src="/vision/assets/new.js"></script>';
	write(docs, 'index.html', oldHtml);
	write(build, 'index.html', newHtml);
	write(docs, 'assets/old.js', 'old chunk');
	write(build, 'assets/new.js', 'new chunk');
	write(docs, 'assets/style.css', 'old style');
	write(build, 'assets/style.css', 'new style');
	const timestamp = new Date('2026-10-16T08:51:38Z');
	for (const root of [build, docs]) {
		for (const path of ['index.html', 'assets/style.css']) {
			utimesSync(join(root, path), timestamp, timestamp);
		}
	}

	publish();

	expect(readFileSync(join(docs, 'index.html'), 'utf8')).toBe(newHtml);
	expect(readFileSync(join(docs, 'assets/new.js'), 'utf8')).toBe('new chunk');
	expect(readFileSync(join(docs, 'assets/style.css'), 'utf8')).toBe('new style');
	expect(() => readFileSync(join(docs, 'assets/old.js'))).toThrow();
	expect(readFileSync(join(docs, '.nojekyll'), 'utf8')).toBe('');
	// A retry also succeeds when the destination already has the Pages marker.
	publish();
	expect(readFileSync(join(docs, 'index.html'), 'utf8')).toBe(newHtml);
});

it.each([undefined, ''])(
	'rejects an absent or empty entry document before changing docs (%s)',
	(html) => {
		write(docs, 'index.html', 'previous deployment');
		if (html !== undefined) write(build, 'index.html', html);

		const result = spawnSync('bash', [script, build, docs]);

		expect(result.status).not.toBe(0);
		expect(readFileSync(join(docs, 'index.html'), 'utf8')).toBe('previous deployment');
	},
);

it('rejects a mismatched copy before marking it ready for Pages', () => {
	write(build, 'index.html', 'tested entry');
	write(docs, 'index.html', 'stale entry');
	// Simulate a copy command that succeeds without copying; verification must still fail.
	const commands = join(directory, 'commands');
	mkdirSync(commands);
	writeFileSync(join(commands, 'rsync'), '#!/bin/sh\nexit 0\n', { mode: 0o755 });
	const result = spawnSync('bash', [script, build, docs], {
		env: { ...process.env, PATH: `${commands}:${process.env.PATH}` },
	});
	expect(result.status).not.toBe(0);
	expect(result.stdout.toString()).toContain('index.html');
	expect(() => readFileSync(join(docs, '.nojekyll'))).toThrow();
});
