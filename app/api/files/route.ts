import { getFiles } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
	try {
		const [dailyFiles, employeeFiles] = await Promise.all([
			getFiles("daily"),
			getFiles("employee"),
		]);

		return NextResponse.json({ dailyFiles, employeeFiles }, { status: 200 });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
