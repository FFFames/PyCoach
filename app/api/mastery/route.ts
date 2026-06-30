import { NextResponse } from "next/server";import { demoMastery } from "@/lib/data";
export async function GET(){return NextResponse.json(demoMastery)}
