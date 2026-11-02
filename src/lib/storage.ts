import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const STORAGE_BUCKET = "ticket-attachments";

/**
 * Upload a file directly to Supabase Storage
 */
export async function uploadToStorage(
  fileBuffer: ArrayBuffer | Buffer,
  fileName: string,
  contentType: string,
  folder: "damages" | "resolutions" = "damages"
): Promise<{ publicUrl: string; filePath: string }> {
  const timestamp = Date.now();
  const sanitized = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filePath = `${folder}/${timestamp}-${sanitized}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Gagal mengunggah ke Supabase Storage: ${error.message}`);
  }

  const { data: publicData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return {
    filePath,
    publicUrl: publicData.publicUrl,
  };
}
