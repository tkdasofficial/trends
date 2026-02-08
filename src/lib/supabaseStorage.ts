import { supabase } from '@/integrations/supabase/client';

/**
 * Upload an image to Supabase Storage from a data URL or blob
 * Returns the public URL of the uploaded image
 */
export async function uploadImageToCloud(
  firebaseUid: string,
  imageName: string,
  dataUrl: string
): Promise<string> {
  try {
    // Convert data URL to blob
    const res = await fetch(dataUrl);
    const blob = await res.blob();

    const fileName = `${firebaseUid}/${imageName}_${Date.now()}.jpg`;

    const { data, error } = await supabase.storage
      .from('profile-images')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (err) {
    console.error('Image upload to Cloud failed:', err);
    // Return the data URL as fallback (will work locally but not persist)
    return dataUrl;
  }
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteImageFromCloud(publicUrl: string): Promise<void> {
  try {
    // Extract path from public URL
    const url = new URL(publicUrl);
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/profile-images\/(.+)/);
    if (!pathMatch) return;

    await supabase.storage.from('profile-images').remove([pathMatch[1]]);
  } catch (err) {
    console.error('Failed to delete image from Cloud:', err);
  }
}
