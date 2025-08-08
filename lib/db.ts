import { createClient } from "./supabase/server";

export const saveFileMetadata = async (
	originalName: string,
	fileType: "daily" | "employee",
	storagePath: string,
) => {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("uploaded_files")
		.insert({
			original_name: originalName,
			file_type: fileType,
			storage_path: storagePath,
		})
		.select()
		.single();

	if (error) throw error;
	return data;
};

export const getFiles = async (fileType: "daily" | "employee") => {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("uploaded_files")
		.select("id, original_name, created_at")
		.eq("file_type", fileType)
		.order("created_at", { ascending: false });

	if (error) throw error;

	return data;
};
export const deleteFile = async (id: string) => {
	const supabase = await createClient();
	// First get file metadata
	const { data: fileData, error: fetchError } = await supabase
		.from("uploaded_files")
		.select("storage_path")
		.eq("id", id)
		.single();

	if (fetchError) throw fetchError;

	// Delete from storage
	const { error: storageError } = await supabase.storage
		.from("excel-files")
		.remove([fileData.storage_path]);

	if (storageError) throw storageError;

	// Delete metadata
	const { error: dbError } = await supabase
		.from("uploaded_files")
		.delete()
		.eq("id", id);

	if (dbError) throw dbError;
	return true;
};

export const getAllFilesData = async () => {
	const supabase = await createClient();
	const { data, error } = await supabase.from("uploaded_files").select("*");

	if (error) throw error;
	return data;
};

export const getFileContent = async (storagePath: string) => {
	const supabase = await createClient();
	const { data, error } = await supabase.storage
		.from("excel-files")
		.download(storagePath);

	if (error) throw error;
	return data;
};
