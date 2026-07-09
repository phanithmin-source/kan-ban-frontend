import { describe, it, expect } from "vitest";
import { formatDate } from "./formatDate";

describe("formatDate utility", () => {
    it("returns null for null, undefined, or empty values", () => {
        expect(formatDate(null)).toBeNull();
        expect(formatDate(undefined)).toBeNull();
        expect(formatDate("")).toBeNull();
    });

    it("formats valid ISO date strings correctly", () => {
        expect(formatDate("2026-07-09T00:00:00Z")).toBe("Jul 9, 2026");
        expect(formatDate("2026-01-01")).toBe("Jan 1, 2026");
    });

    it("formats valid numerical timestamp strings correctly", () => {
        // 1775779200000 corresponds to "2026-04-02T00:00:00.000Z" (or similar depending on timezone, but formats to Apr 2, 2026/Apr 1, 2026)
        // Since Intl.DateTimeFormat output is based on timezone, let's test a fixed date or check it matches a known parsing.
        const date = new Date(1775779200000);
        const expected = new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(date);
        expect(formatDate("1775779200000")).toBe(expected);
    });

    it("returns the original string untouched for invalid date arguments", () => {
        expect(formatDate("invalid-date-string")).toBe("invalid-date-string");
        expect(formatDate("not-a-date")).toBe("not-a-date");
    });
});
