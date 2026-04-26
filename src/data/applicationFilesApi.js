import { supabase } from "../lib/supabase";
import JSZip from "jszip";

const MATERIALS_BUCKET = "application-files";

export async function fetchApplicationFiles(publicId) {
  const { data, error } = await supabase
    .from("application_files")
    .select("*")
    .eq("public_id", publicId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getApplicationFileSignedUrl(filePath) {
  if (!filePath) return null;

  const { data, error } = await supabase.storage
    .from(MATERIALS_BUCKET)
    .createSignedUrl(filePath, 60 * 60);

  if (error) throw error;
  return data?.signedUrl || null;
}

export async function downloadApplicationFile(filePath, downloadName) {
  if (!filePath) return;

  const { data, error } = await supabase.storage
    .from(MATERIALS_BUCKET)
    .download(filePath);

  if (error) throw error;
  if (!data) throw new Error("文件不存在或下载失败");

  const blobUrl = window.URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = downloadName || "file";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(blobUrl);
}

export async function updateApplicationFileReview(fileId, payload) {
  const { data, error } = await supabase
    .from("application_files")
    .update(payload)
    .eq("id", fileId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function downloadApplicationFilesAsZip(files, zipName = "materials.zip") {
  if (!files || files.length === 0) {
    throw new Error("没有可打包的文件");
  }

  const zip = new JSZip();

  for (const file of files) {
    if (!file?.file_path) continue;

    const { data, error } = await supabase.storage
      .from(MATERIALS_BUCKET)
      .download(file.file_path);

    if (error) {
      console.error("zip download file error:", file.file_path, error);
      continue;
    }

    if (!data) continue;

    const safeName = file.downloadName || file.file_name || "file";
    zip.file(safeName, data);
  }

  const blob = await zip.generateAsync({ type: "blob" });

  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = zipName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(blobUrl);
}