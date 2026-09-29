import path from "node:path";
import { UserError } from "@cloudflare/workers-utils/errors";
import { afterEach, describe, it, vi } from "vitest";
import { runDockerCmdWithOutput } from "../src/utils";

afterEach(() => vi.restoreAllMocks());

describe("runDockerCmdWithOutput", () => {
	it.for([undefined, {}, { quiet: false }])(
		"retains stderr forwarding by default (%j)",
		(options, { expect }) => {
			const stderr = vi.spyOn(process.stderr, "write").mockReturnValue(true);
			expect(() =>
				runDockerCmdWithOutput(
					process.execPath,
					[
						"-e",
						'process.stderr.write("daemon unavailable\\n"); process.exit(1);',
					],
					options
				)
			).toThrow(UserError);
			expect(
				stderr.mock.calls.map(([chunk]) => String(chunk)).join("")
			).toContain("daemon unavailable");
		}
	);

	it("captures a failing child's stderr while preserving its exception", ({
		expect,
	}) => {
		const stderr = vi.spyOn(process.stderr, "write").mockReturnValue(true);
		expect(() =>
			runDockerCmdWithOutput(
				process.execPath,
				[
					"-e",
					'process.stderr.write("daemon unavailable\\n"); process.exit(1);',
				],
				{ quiet: true }
			)
		).toThrow("daemon unavailable");
		expect(stderr).not.toHaveBeenCalled();
	});

	it("still throws when the executable is missing in quiet mode", ({
		expect,
	}) => {
		const stderr = vi.spyOn(process.stderr, "write").mockReturnValue(true);
		expect(() =>
			runDockerCmdWithOutput(
				path.join(import.meta.dirname, "missing-docker"),
				["image", "ls"],
				{ quiet: true }
			)
		).toThrow("ENOENT");
		expect(stderr).not.toHaveBeenCalled();
	});

	it.for([false, true])(
		"returns trimmed stdout on success (quiet: %s)",
		(quiet, { expect }) => {
			expect(
				runDockerCmdWithOutput(
					process.execPath,
					["-e", 'process.stdout.write("  project-image:tag\\n");'],
					{ quiet }
				)
			).toBe("project-image:tag");
		}
	);
});
