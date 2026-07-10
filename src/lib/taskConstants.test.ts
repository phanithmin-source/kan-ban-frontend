import { describe, it, expect } from "vitest";
import { getStatusBadgeVariant, getPriorityBadgeVariant } from "./taskConstants";

describe("taskConstants variant helpers", () => {
    describe("getStatusBadgeVariant", () => {
        it("returns success variant for DONE", () => {
            expect(getStatusBadgeVariant("DONE")).toBe("success");
        });

        it("returns warning variant for REVIEW", () => {
            expect(getStatusBadgeVariant("REVIEW")).toBe("warning");
        });

        it("returns info variant for IN_PROGRESS", () => {
            expect(getStatusBadgeVariant("IN_PROGRESS")).toBe("info");
        });

        it("returns secondary variant for TODO and fallback cases", () => {
            expect(getStatusBadgeVariant("TODO")).toBe("secondary");
            // @ts-expect-error Testing fallback runtime values path
            expect(getStatusBadgeVariant("UNKNOWN_STATUS")).toBe("secondary");
        });
    });

    describe("getPriorityBadgeVariant", () => {
        it("returns destructive variant for HIGH", () => {
            expect(getPriorityBadgeVariant("HIGH")).toBe("destructive");
        });

        it("returns warning variant for MEDIUM", () => {
            expect(getPriorityBadgeVariant("MEDIUM")).toBe("warning");
        });

        it("returns success variant for LOW and default fallback cases", () => {
            expect(getPriorityBadgeVariant("LOW")).toBe("success");
            expect(getPriorityBadgeVariant("")).toBe("success");
            expect(getPriorityBadgeVariant("UNKNOWN")).toBe("success");
        });
    });
});
