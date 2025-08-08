"use client";
import { SetStateAction } from "react";

type FileType = "daily" | "employee";

export default function FileUpload({
	fileType,
	selectedFiles,
	setSelectedFiles,
	isUploading,
}: {
	fileType: FileType;
	selectedFiles: File[];
	setSelectedFiles: React.Dispatch<SetStateAction<File[]>>;
	isUploading: boolean;
}) {
	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files) return;

		// Convert FileList to Array and merge with existing files
		const newFiles = Array.from(e.target.files);
		setSelectedFiles((prev) => [...prev, ...newFiles]);
	};

	return (
		<div className="mb-4">
			<label className="block mb-2 font-medium">
				Upload {fileType === "daily" ? "Daily Report" : "New Employee"} File(s)
			</label>
			<input
				type="file"
				accept=".xls,.xlsx"
				multiple
				onChange={handleFileSelect}
				disabled={isUploading}
				className="block w-full text-sm text-gray-500
					file:mr-4 file:py-2 file:px-4
					file:rounded-md file:border-0
					file:text-sm file:font-semibold
					file:bg-blue-50 file:text-blue-700
					hover:file:bg-blue-100"
			/>

			{/* List of selected files */}
			{selectedFiles.length > 0 && (
				<ul className="mt-2 text-sm text-gray-700">
					{selectedFiles.map((file, idx) => (
						<li key={idx}>{file.name}</li>
					))}
				</ul>
			)}

			{/* Upload button */}
		</div>
	);
}
