export type Skill = "variables" | "conditionals" | "loops" | "lists" | "functions";
export type Assignment = {id:string;title:string;description:string;starterCode:string;difficulty:"Beginner"|"Intermediate";skill:Skill;tests:{input:string;expected:string}[]};
export type Submission = {id:string;studentId:string;studentName:string;assignmentId:string;assignmentTitle:string;skill:Skill;grade:number;feedback:string;submittedAt:string};
export type Mastery = Record<Skill, number>;
