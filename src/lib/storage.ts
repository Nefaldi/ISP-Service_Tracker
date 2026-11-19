import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const STORAGE_BUCKET = "ticket-attachments";

/**
 * Upload a file directly to Supabase Storage with local filesystem fallback
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

  // 1. Try Supabase Cloud Storage if client configured
  if (supabase) {
    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, fileBuffer, {
          contentType,
          upsert: true,
        });

      if (!error) {
        const { data: publicData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filePath);

        return {
          filePath,
          publicUrl: publicData.publicUrl,
        };
      }
      console.warn(
        `[STORAGE] Supabase Storage upload error: ${error.message}. Menggunakan penyimpanan lokal fallback.`
      );
    } catch (supabaseErr) {
      console.warn("[STORAGE] Supabase Storage exception:", supabaseErr);
    }
  }

  // 2. Resilient Fallback: Local filesystem (public/uploads/)
  try {
    const localDir = path.join(process.cwd(), "public", "uploads", folder);
    await fs.mkdir(localDir, { recursive: true });
    const localFilePath = path.join(localDir, `${timestamp}-${sanitized}`);
    const buffer = Buffer.isBuffer(fileBuffer)
      ? fileBuffer
      : Buffer.from(fileBuffer);
    await fs.writeFile(localFilePath, buffer);

    const publicUrl = `/uploads/${folder}/${timestamp}-${sanitized}`;
    return {
      filePath,
      publicUrl,
    };
  } catch (fsErr) {
    console.error("[STORAGE] Local filesystem write error:", fsErr);
    throw new Error("Gagal mengunggah berkas foto.");
  }
}
