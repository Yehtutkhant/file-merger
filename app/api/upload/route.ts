import { saveFileMetadata } from "@/lib/db";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const formData = await req.formData();

	const files = formData.getAll("files") as File[];

	if (!files.length) {
		return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
	}

	const supabase = await createClient();

	const results = [];

	for (const file of files) {
		try {
			const fileName = file.name;

			// Validate file name or type here if needed
			const arrayBuffer = await file.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			const workbook = XLSX.read(buffer, { type: "buffer" });
			if (!workbook.SheetNames?.length) {
				throw new Error("Excel file has no worksheets");
			}

			let fileType: "daily" | "employee" | null = null;
			const nameLower = fileName.toLowerCase();
			if (nameLower.includes("daily report")) fileType = "daily";
			if (nameLower.includes("new employee")) fileType = "employee";
			if (!fileType) throw new Error("Invalid file type");

			const storagePath = `${fileType}/${Date.now()}_${fileName}`;
			const { error: uploadError } = await supabase.storage
				.from("excel-files")
				.upload(storagePath, buffer, {
					contentType: fileName.endsWith(".xls")
						? "application/vnd.ms-excel"
						: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
					upsert: false,
				});

			if (uploadError) throw uploadError;

			const fileMetadata = await saveFileMetadata(
				fileName,
				fileType,
				storagePath,
			);

			results.push({ id: fileMetadata.id, fileName });
		} catch (error: any) {
			results.push({ fileName: file.name, error: error.message });
		}
	}

	return NextResponse.json({ results }, { status: 200 });
}
