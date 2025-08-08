import * as XLSX from "xlsx";
import { getAllFilesData, getFileContent } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

interface ProcessedResult {
	employeeName: string;
	joinDate: string;
	role: string;
	teamMember: string;
}

export async function POST() {
	try {
		const files = await getAllFilesData();
		const dailyFiles = files.filter((f) => f.file_type === "daily");
		const employeeFiles = files.filter((f) => f.file_type === "employee");

		if (dailyFiles.length === 0 || employeeFiles.length === 0) {
			return NextResponse.json(
				{
					error: "Please upload both Daily Reports and New Employee files",
				},
				{ status: 400 },
			);
		}
		const passedCandidates: Record<string, string> = {};
		let hasPassedCandidate = false;

		for (const file of dailyFiles) {
			const fileContent = await getFileContent(file.storage_path);
			const arrayBuffer = await fileContent.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			const workbook = XLSX.read(buffer, { type: "buffer" });

			const sheet = workbook.Sheets[workbook.SheetNames[0]];

			const data: any[] = XLSX.utils.sheet_to_json(sheet);

			// Extract team member name from filename
			const filenameParts = file.original_name.split("_");
			let nameParts = filenameParts.slice(2);

			nameParts[nameParts.length - 1] = nameParts[nameParts.length - 1].replace(
				/\.[^/.]+$/,
				"",
			);
			const teamMember = nameParts.join(" ");

			data.forEach((row) => {
				const status = (row["Status"] || row["status"] || "").toString().trim();

				if (status === "Pass") {
					passedCandidates[row["Candidate Name"]] = teamMember;
					hasPassedCandidate = true;
				}
			});
		}

		if (!hasPassedCandidate) {
			return NextResponse.json(
				{
					error: "No candidates with Pass status found",
				},
				{ status: 400 },
			);
		}

		// Process new employee files
		const result: ProcessedResult[] = [];

		for (const file of employeeFiles) {
			const fileContent = await getFileContent(file.storage_path);
			const arrayBuffer = await fileContent.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			const workbook = XLSX.read(buffer, { type: "buffer" });

			const sheet = workbook.Sheets[workbook.SheetNames[0]];
			const data: any[] = XLSX.utils.sheet_to_json(sheet);

			data.forEach((row) => {
				const employeeName = row["Employee Name"];

				if (passedCandidates[employeeName]) {
					result.push({
						employeeName,
						joinDate: row["Join Date"],
						role: row["Role"],
						teamMember: passedCandidates[employeeName],
					});
				}
			});
		}

		return NextResponse.json(result, { status: 200 });
	} catch (error) {
		console.error("Generation error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
