import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../../lib/auth";
import { getServiceClient } from "../../../../../lib/supabase";

export async function POST(req) {
  const session = await getAdminSession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getServiceClient();

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file)
      return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Use JPG, PNG, WebP, SVG, or GIF." },
        { status: 400 }
      );
    }

    // Validate file size (max 4MB). The Vault shrinks screenshots to a crisp WebP before
    // uploading, so real uploads are far smaller; 4MB stays under the host's request limit.
    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 4MB." },
        { status: 400 }
      );
    }

    // Build a unique filename: timestamp + sanitised original name
    // The extension comes from the verified file type, not from the file name.
    const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/svg+xml": "svg", "image/gif": "gif" };
    const ext = EXT[file.type];
    const safeName = file.name
      .replace(/\.[^/.]+$/, "")           // remove extension
      .replace(/[^a-zA-Z0-9-_]/g, "-")   // sanitise
      .toLowerCase()
      .slice(0, 40);
    const filename = `${safeName}-${Date.now()}.${ext}`;

    // Convert File → ArrayBuffer → Buffer for Supabase upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("brand-logos")
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from("brand-logos")
      .getPublicUrl(filename);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err) {
    console.error("Upload route error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}