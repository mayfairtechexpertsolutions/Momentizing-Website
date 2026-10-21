import { describe, expect, it } from "vitest";
import { RESUME_MAX_BYTES, resumeProblem } from "./careers";

const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

describe("resumeProblem", () => {
  it("accepts a PDF and a DOCX within the size cap", () => {
    expect(resumeProblem({ type: "application/pdf", size: 1024 })).toBeNull();
    expect(resumeProblem({ type: DOCX, size: RESUME_MAX_BYTES })).toBeNull();
  });

  it("rejects other types, oversize and empty files", () => {
    expect(resumeProblem({ type: "application/x-msdownload", size: 1024 })).toMatch(/PDF or Word/);
    expect(resumeProblem({ type: "application/pdf", size: RESUME_MAX_BYTES + 1 })).toMatch(/5 MB/);
    expect(resumeProblem({ type: "application/pdf", size: 0 })).toMatch(/empty/);
  });
});
