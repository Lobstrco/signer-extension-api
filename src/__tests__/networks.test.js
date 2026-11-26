import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

import { NETWORK } from "../networks";

describe("the published network vocabulary", () => {
    it("imports nothing, so the protocol entry can re-export it without closing a cycle", () => {
        // a cycle resolves to undefined, and an unnamed network means Stellar forever
        const source = fs.readFileSync(
            path.join(import.meta.dirname, "..", "networks.ts"),
            "utf8",
        );

        expect(source).not.toMatch(/^\s*import\b/m);
        expect(source).not.toMatch(/\bfrom\s*["']/);
        expect(source).not.toMatch(/\bimport\s*\(/);
        expect(source).not.toMatch(/\brequire\s*\(/);
    });

    it("names Ethereum and Base as two peer networks, matching the backend verbatim", () => {
        // one member per chain: an "evm" member or a CAIP-2 id would never match a backend row
        expect(NETWORK.ethereum).toBe("ethereum");
        expect(NETWORK.base).toBe("base");
        Object.values(NETWORK).forEach((network) => {
            expect(network).toMatch(/^[a-z]+$/);
        });
    });
});
