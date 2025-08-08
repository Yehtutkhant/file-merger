import { deleteFile } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, res: NextResponse) {
	try {
		const id = await req.json();

		if (await deleteFile(id as string)) {
			return NextResponse.json({ success: true }, { status: 200 });
		} else {
			return NextResponse.json({ error: "File not found" }, { status: 404 });
		}
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
