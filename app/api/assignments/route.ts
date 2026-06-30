import { NextResponse } from "next/server";import { assignments } from "@/lib/data";
export async function GET(){return NextResponse.json(assignments.map(({tests,...assignment})=>assignment))}
