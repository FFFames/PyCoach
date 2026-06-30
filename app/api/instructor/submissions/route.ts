import { NextResponse } from "next/server";import { demoSubmissions } from "@/lib/data";
export async function GET(){return NextResponse.json(demoSubmissions)}
