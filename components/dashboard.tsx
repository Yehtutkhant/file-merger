import { useState, useEffect } from "react";

interface DashboardData {
	employeeName: string;
	joinDate: string;
	role: string;
	teamMember: string;
}

function formatDate(date: Date) {
	const day = date.getDate(); // 1-31
	const year = date.getFullYear();

	// Short month names array
	const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];
	const month = months[date.getMonth()]; // 0-based month index

	return `${day}-${month}-${year}`;
}

export default function Dashboard() {
	const [data, setData] = useState<DashboardData[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const generateDashboard = async () => {
		setLoading(true);
		setError("");
		try {
			const response = await fetch("/api/generate", {
				method: "POST",
			});
			const result = await response.json();

			if (response.ok) {
				setData(result);
			} else {
				setError(result.error);
			}
		} catch (err) {
			setError("Failed to generate dashboard");
		} finally {
			setLoading(false);
		}
	};

	const exportToCSV = () => {
		if (data.length === 0) return;

		const headers = ["Employee Name", "Join Date", "Role", "Team Member"];
		const csvContent = [
			headers.join(","),
			...data.map(
				(item) =>
					`"${item.employeeName}","${item.joinDate}","${item.role}","${item.teamMember}"`,
			),
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "employee-dashboard.csv";
		link.click();
	};

	return (
		<div className="mt-8">
			<button
				onClick={generateDashboard}
				disabled={loading}
				className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400">
				{loading ? "Generating..." : "Generate Dashboard"}
			</button>

			{error && (
				<div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
					{error}
				</div>
			)}

			{data.length > 0 && (
				<div className="mt-6">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-xl font-bold">New Employees Dashboard</h2>
						<button
							onClick={exportToCSV}
							className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700">
							Export CSV
						</button>
					</div>

					<div className="overflow-x-auto">
						<table className="min-w-full bg-white border border-gray-200">
							<thead>
								<tr>
									<th className="py-2 px-4 border-b">Employee Name</th>
									<th className="py-2 px-4 border-b">Join Date</th>
									<th className="py-2 px-4 border-b">Role</th>
									<th className="py-2 px-4 border-b">Team Member</th>
								</tr>
							</thead>
							<tbody>
								{data.map((item, index) => (
									<tr key={index} className="hover:bg-gray-50">
										<td className="py-2 px-4 border-b">{item.employeeName}</td>
										<td className="py-2 px-4 border-b">
											{formatDate(new Date(item.joinDate))}
										</td>
										<td className="py-2 px-4 border-b">{item.role}</td>
										<td className="py-2 px-4 border-b">{item.teamMember}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
}
