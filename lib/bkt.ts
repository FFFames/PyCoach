import { Mastery, Skill } from "./types";

export const BKT = { initial: 0.3, learn: 0.12, guess: 0.2, slip: 0.1 } as const;

export function updateMastery(prior:number, correct:boolean):number {
 const likelihood = correct ? prior*(1-BKT.slip) : prior*BKT.slip;
 const evidence = correct ? likelihood+(1-prior)*BKT.guess : likelihood+(1-prior)*(1-BKT.guess);
 const posterior = likelihood/evidence;
 return posterior+(1-posterior)*BKT.learn;
}

export function lowestMastery(mastery:Mastery):Skill {
 return (Object.entries(mastery) as [Skill,number][]).sort((a,b)=>a[1]-b[1])[0][0];
}
