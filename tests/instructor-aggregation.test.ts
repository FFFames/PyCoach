import { describe, expect, it } from "vitest";
import { aggregateStudents } from "@/lib/instructor-aggregation";
import type { Submission } from "@/lib/types";

function submission(index: number, studentId = "student-1", grade = 75): Submission {
  return {id:`submission-${index}`,studentId,studentName:studentId,assignmentId:index%2?"variables":"loops",assignmentTitle:"Exercise",skill:index%2?"variables":"loops",grade,feedback:"Feedback",submittedAt:new Date(Date.UTC(2026,0,1,0,index)).toISOString()};
}

describe("instructor student aggregation", () => {
  it("collapses 100 submissions into one student row", () => {
    const submissions = Array.from({ length: 100 }, (_, index) => submission(index, "student-1", index === 99 ? 90 : 75));
    const rows = aggregateStudents([{ id: "student-1", fullName: "Maya Chen" }], new Map([["student-1", "maya@example.com"]]), submissions);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({name:"Maya Chen",email:"maya@example.com",totalAttempts:100,latestGrade:90,completedAssignments:1,skillsAttempted:2});
  });

  it("sorts students by latest submission descending", () => {
    const rows = aggregateStudents(
      [{ id: "student-1", fullName: "First" }, { id: "student-2", fullName: "Second" }],
      new Map(),
      [submission(1, "student-1"), submission(2, "student-2")]
    );
    expect(rows.map((row) => row.id)).toEqual(["student-2", "student-1"]);
  });
});
