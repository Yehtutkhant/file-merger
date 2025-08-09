"use client";

import { useMemo, useRef, useState } from "react";
import FileUpload from "@/components/file-upload";
import FileList from "@/components/file-list";
import Dashboard from "@/components/dashboard";

export default function Home() {
	const [activeTab, setActiveTab] = useState<"upload" | "files">("upload");
	let selectedFiles: File[] = [];
	const [dailySelectedFiles, setDailySelectedFiles] = useState<File[]>([]);
	const [empSelectedFiles, setEmpSelectedFiles] = useState<File[]>([]);
	const [isUploading, setIsUploading] = useState(false);
	const fileRef = useRef<HTMLInputElement>(null);

	selectedFiles = useMemo(
		() => [...dailySelectedFiles, ...empSelectedFiles],
		[dailySelectedFiles, empSelectedFiles],
	);
	const handleUpload = async () => {
		if (selectedFiles.length === 0) {
			alert("Please select files before uploading.");
			return;
		}

		setIsUploading(true);

		const formData = new FormData();
		selectedFiles.forEach((file) => {
			formData.append("files", file); // "files" is the field name your API expects
		});

		try {
			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) throw new Error("Upload failed");
			alert("Files uploaded successfully!");
			setDailySelectedFiles([]); // Clear after upload
			setEmpSelectedFiles([]); // Clear after upload
		} catch (error: any) {
			alert(`Error: ${error.message}`);
		} finally {
			setIsUploading(false);
		}
	};
	return (
		<div className="container mx-auto px-4 py-8 max-w-4xl">
			<h1 className="text-3xl font-bold mb-8">Candidate Dashboard Generator</h1>

			<div className="flex border-b mb-6">
				<button
					className={`py-2 px-4 font-medium ${
						activeTab === "upload"
							? "text-blue-600 border-b-2 border-blue-600"
							: "text-gray-500 hover:text-gray-700"
					}`}
					onClick={() => setActiveTab("upload")}>
					Upload Files
				</button>
				<button
					className={`py-2 px-4 font-medium ${
						activeTab === "files"
							? "text-blue-600 border-b-2 border-blue-600"
							: "text-gray-500 hover:text-gray-700"
					}`}
					onClick={() => setActiveTab("files")}>
					Manage Files
				</button>
			</div>

			{activeTab === "upload" && (
				<div>
					<div className="grid grid-cols-1 gap-6 mb-8">
						<div className="border rounded-md p-4">
							<div className="w-full flex items-center justify-between">
								<h2 className="text-xl font-bold mb-4">Upload Files</h2>
								<button
									type="button"
									onClick={() => {
										if (fileRef.current) {
											fileRef.current.value = ""; // clears native input
										}
										setDailySelectedFiles([]);
										setEmpSelectedFiles([]);
									}}
									className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ">
									Clear Files
								</button>
							</div>

							<FileUpload
								fileType="daily"
								selectedFiles={dailySelectedFiles}
								setSelectedFiles={setDailySelectedFiles}
								isUploading={isUploading}
								fileRef={fileRef}
							/>
							<FileUpload
								fileType="employee"
								selectedFiles={empSelectedFiles}
								setSelectedFiles={setEmpSelectedFiles}
								isUploading={isUploading}
								fileRef={fileRef}
							/>
							<button
								type="button"
								onClick={handleUpload}
								disabled={isUploading || selectedFiles.length === 0}
								className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
								{isUploading ? "Uploading..." : "Upload"}
							</button>
						</div>
						<Dashboard />
					</div>
				</div>
			)}

			{activeTab === "files" && (
				<div>
					<FileList fileType="daily" />
					<FileList fileType="employee" />
				</div>
			)}
		</div>
	);
}
