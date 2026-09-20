/**
 * Supabase Integration for Gallery Images
 *
 * Setup instructions:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Create a storage bucket named "portfolio-images"
 * 3. Upload your 5 gallery images
 * 4. Set the bucket to public access
 * 5. Copy your Project URL and Anon Key
 * 6. Create `.env.local` with the values (see .env.local.example)
 *
 * Then update the GALLERY_IMAGES array in GalleryGrid.tsx
 * to use getImageUrl() instead of placeholder URLs.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "portfolio-images";

/**
 * Get public URL for an image stored in Supabase Storage
 * @param fileName - The file name/path within the bucket
 * @returns Full public URL of the image
 */
export function getImageUrl(fileName: string): string {
  if (!SUPABASE_URL) {
    console.warn("Supabase URL not configured. Using placeholder images.");
    return `https://placehold.co/600x800/C0392B/FFF8E7?text=${encodeURIComponent(fileName)}`;
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`;
}

/**
 * Example usage in GalleryGrid.tsx:
 *
 * import { getImageUrl } from "@/lib/supabase";
 *
 * const GALLERY_IMAGES = [
 *   { id: 1, src: getImageUrl("artwork-1.jpg"), alt: "Artwork 1" },
 *   { id: 2, src: getImageUrl("artwork-2.jpg"), alt: "Artwork 2" },
 *   { id: 3, src: getImageUrl("artwork-3.jpg"), alt: "Artwork 3" },
 *   { id: 4, src: getImageUrl("artwork-4.jpg"), alt: "Artwork 4" },
 *   { id: 5, src: getImageUrl("artwork-5.jpg"), alt: "Artwork 5" },
 * ];
 */

export { SUPABASE_URL, SUPABASE_ANON_KEY, BUCKET_NAME };
