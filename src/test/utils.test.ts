import { describe, it, expect } from "vitest";
import { cn, getInitials } from "../lib/utils";

describe("getInitials", () => {
    it("extracts single initial for single name", () => {
        expect(getInitials("Alice")).toBe("A");
        expect(getInitials("bob")).toBe("B");
    });

    it("extracts double initials for two names", () => {
        expect(getInitials("John Doe")).toBe("JD");
        expect(getInitials("Jane Doe")).toBe("JD");
    });

    it("extracts first two initials for three or more names", () => {
        expect(getInitials("John Fitzgerald Kennedy")).toBe("JF");
        expect(getInitials("Alice Bob Charlie Daniel")).toBe("AB");
    });

    it("handles empty, null, and undefined values cleanly", () => {
        expect(getInitials(null)).toBe("?");
        expect(getInitials(undefined)).toBe("?");
        expect(getInitials("")).toBe("?");
        expect(getInitials("   ")).toBe("?");
    });

    it("handles leading, trailing, and duplicate spaces", () => {
        expect(getInitials("  John   Doe  ")).toBe("JD");
        expect(getInitials(" Alice ")).toBe("A");
    });
});

describe("cn utility", () => {
    it("joins simple classes", () => {
        expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white");
    });

    it("handles falsey conditional classes", () => {
        expect(cn("bg-red-500", false && "text-white", true && "font-bold")).toBe(
            "bg-red-500 font-bold"
        );
    });

    it("merges tailwind class clashes correctly", () => {
        expect(cn("p-2 p-4")).toBe("p-4");
        expect(cn("px-2 px-4")).toBe("px-4");
    });
});
