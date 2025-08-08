import { useState, useEffect } from "react";

interface FileItem {
	id: string;
	original_name: string;
	created_at: string;
}

export default function FileList({
	fileType,
}: {
	fileType: "daily" | "employee";
}) {
	const [files, setFiles] = useState<FileItem[]>([]);
	const [loading, setLoading] = useState(true);
	const fetchFiles = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/files");

			const data = await response.json();

			setFiles(data[`${fileType}Files`] || []);
		} catch (error) {
			console.error("Error fetching files:", error);
		} finally {
			setLoading(false);
		}
	};
	useEffect(() => {
		fetchFiles();
	}, [fileType, fetchFiles]);

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this file?")) return;

		try {
			const response = await fetch(`/api/delete`, {
				method: "DELETE",
				body: JSON.stringify(id),
			});
			if (response.ok) fetchFiles();
		} catch (error) {
			console.error("Error deleting file:", error);
		}
	};

	if (loading) return <p>Loading files...</p>;

	return (
		<div className="mb-6">
			<h3 className="text-lg font-medium mb-2">
				{fileType === "daily" ? "Daily Reports" : "New Employee Files"}
			</h3>

			{files.length === 0 ? (
				<p className="text-gray-500">No files uploaded yet</p>
			) : (
				<ul className="border rounded-md divide-y">
					{files.map((file) => (
						<li key={file.id} className="p-3 flex justify-between items-center">
							<div>
								<p className="font-medium">{file.original_name}</p>
								<p className="text-sm text-gray-500">
									Uploaded: {new Date(file.created_at).toLocaleString()}
								</p>
							</div>
							<button
								onClick={() => handleDelete(file.id)}
								className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700">
								Delete
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
