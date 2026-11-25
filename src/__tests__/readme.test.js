import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

import pkg from "../../package.json";
import { NETWORK } from "../networks";

const README = fs.readFileSync(
    path.join(import.meta.dirname, "..", "..", "README.md"),
    "utf8",
);

// derived from the manifest, not hand-written: a host allow-list stays green on a 404ing path
const servedBy = {
    "cdn.jsdelivr.net": `https://cdn.jsdelivr.net/npm/${pkg.name}@{version}/${pkg.jsdelivr}`,
    "unpkg.com": `https://unpkg.com/${pkg.name}@{version}/${pkg.unpkg}`,
};

const scriptUrls = [
    ...README.matchAll(/<script\s+src="(https?:\/\/[^"]+)"/g),
].map(([, url]) => url);

describe("the browser install the README documents", () => {
    it("is documented at all", () => {
        // deleting the section must fail this file rather than pass it vacuously
        expect(scriptUrls.length).toBeGreaterThan(0);
    });

    it.each(scriptUrls)("%s is served from the packed build", (url) => {
        const host = new URL(url).host;

        // cdnjs mirrors nothing on its own: it needs a registration nobody has made
        expect(Object.keys(servedBy)).toContain(host);
        expect(url).toBe(servedBy[host]);
    });

    it.each([pkg.unpkg, pkg.jsdelivr])("ships %s to npm", (entry) => {
        expect(pkg.files).toContain(entry);
    });

    it("names no cdn that does not carry the package", () => {
        // it was documented for 29 months and 404ed the whole time
        expect(README).not.toMatch(/cdnjs/i);
    });
});

describe("the networks the README documents", () => {
    it.each(Object.values(NETWORK))(
        "names %s in the enum's list",
        (network) => {
            const list = README.match(
                /`NETWORK` is an enum of the networks[^)]*\)/,
            )?.[0];

            expect(list).toContain(`\`${network}\``);
        },
    );

    it.each([NETWORK.ethereum, NETWORK.base])(
        "says the SDK refuses %s and points to the EIP-1193 provider",
        (network) => {
            const section = README.split("### Ethereum and Base")[1]?.split(
                "\n## ",
            )[0];

            expect(section).toContain(`NETWORK.${network}`);
            expect(section).toContain("EIP-6963");
            expect(section).toContain('"Network is not supported"');
        },
    );
});
