const supabase = require('../lib/supabase');

const uploadFile = async (bucket, filePath, fileBuffer, mimeType) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, fileBuffer, {
      contentType: mimeType,
      upsert: true
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return { path: filePath, url: urlData.publicUrl };
};

const deleteFile = async (bucket, filePath) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) throw error;
};

module.exports = { uploadFile, deleteFile };