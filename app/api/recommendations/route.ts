import { NextResponse } from "next/server";import { assignments,demoMastery } from "@/lib/data";import { lowestMastery } from "@/lib/bkt";
export async function GET(){const skill=lowestMastery(demoMastery);return NextResponse.json({reason:`Lowest estimated mastery: ${skill}`,assignment:assignments.find(a=>a.skill===skill)})}
