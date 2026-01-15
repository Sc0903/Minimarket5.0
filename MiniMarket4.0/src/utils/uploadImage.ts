import { supabase } from '../config/supabase';
import * as FileSystem from 'expo-file-system/legacy';

export const uploadProductImage = async (uri: string, userId: string): Promise<string> => {
  try {
    if (!userId) {
      throw new Error('Usuario no identificado');
    }

    const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    // Leer el archivo como base64 usando el valor literal 'base64'
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64' as any,
    });

    // Convertir base64 a ArrayBuffer manualmente
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Subir a Supabase Storage
    const { error } = await supabase.storage
      .from('products')
      .upload(fileName, bytes, {
        contentType: `image/${fileExt}`,
        upsert: true,
      });

    if (error) {
      console.error('Error de storage:', error);
      throw error;
    }

    // Obtener URL pública
    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    if (!data || !data.publicUrl) {
      throw new Error('No se pudo obtener la URL pública');
    }

    return data.publicUrl;
  } catch (err) {
    console.error('Error uploading image:', err);
    throw err;
  }
};
