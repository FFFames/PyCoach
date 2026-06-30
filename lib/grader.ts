import { Assignment } from "./types";

type TestResult={passed:boolean;input:string;expected:string;actual:string};
export type GradeResult={grade:number;feedback:string;results:TestResult[];mode:"remote"|"fallback"};

const FORBIDDEN = [/\bimport\s+(os|subprocess|socket|pathlib|shutil)\b/,/\bfrom\s+(os|subprocess|socket|pathlib|shutil)\b/,/\b(eval|exec|open|compile|__import__)\s*\(/];

export async function gradeCode(code:string,assignment:Assignment):Promise<GradeResult>{
 if(!code.trim()) throw new Error("Code cannot be empty.");
 if(code.length>10000) throw new Error("Code is too long.");
 if(FORBIDDEN.some(pattern=>pattern.test(code))) throw new Error("This demo blocks filesystem, process, network, and dynamic execution APIs.");
 const endpoint=process.env.CODE_RUNNER_URL;
 if(endpoint){
  const response=await fetch(endpoint,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({language:"python",code,tests:assignment.tests}),signal:AbortSignal.timeout(8000)});
  if(!response.ok) throw new Error("The code runner could not grade this submission.");
  return {...await response.json(),mode:"remote"};
 }
 return fallbackGrade(code,assignment);
}

function fallbackGrade(code:string,assignment:Assignment):GradeResult{
 const checks:Record<string,()=>boolean>={
  variables:()=>/input\s*\(/.test(code)&&/(\/|round\s*\(|\.2f)/.test(code)&&/print\s*\(/.test(code),
  conditionals:()=>/\bif\b/.test(code)&&/\belif\b/.test(code)&&/\belse\b/.test(code)&&/print\s*\(/.test(code),
  loops:()=>/\b(for|while)\b/.test(code)&&/range\s*\(/.test(code)&&/print\s*\(/.test(code),
  lists:()=>/(list|split)\s*\(/.test(code)&&/(sum\s*\(|for\b)/.test(code)&&/print\s*\(/.test(code),
  functions:()=>/def\s+is_palindrome\s*\(/.test(code)&&/(\[::\s*-1\]|reversed\s*\()/.test(code)&&/return\b/.test(code)
 };
 const passed=checks[assignment.skill]?.()??false;
 const results=assignment.tests.map(test=>({passed,input:test.input,expected:test.expected,actual:passed?test.expected:"Not executed in fallback mode"}));
 return {grade:passed?100:0,feedback:passed?"Your solution matches the required structure. Connect a sandbox runner for execution-based verification.":"Your code is missing part of the expected solution structure. Review the prompt and try again.",results,mode:"fallback"};
}
