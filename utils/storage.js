const supabase = require('./supabase');

async function uploadReceipt(file) {
    const fileName = `${Date.now()}-${file.originalname}`;
    const { data, error } = await supabase.storage
        .from('receipts')
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
}

module.exports = { uploadReceipt };
