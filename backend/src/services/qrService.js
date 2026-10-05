import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique secure QR token for a vehicle pass
 */
export const generatePassToken = () => {
  return `UGP-${uuidv4().replace(/-/g, '').toUpperCase()}`;
};

/**
 * Generates a human-friendly pass reference number
 */
export const generatePassNumber = () => {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `UPASS-${year}-${randomSuffix}`;
};

/**
 * Generates a base64 Data URL for a QR code representing the token
 */
export const generateQRCodeDataUrl = async (token) => {
  try {
    const dataUrl = await QRCode.toDataURL(token, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: 2,
      scale: 8,
      color: {
        dark: '#0f172a', // Deep slate / navy
        light: '#ffffff',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR Code Data URL:', err);
    throw new Error('Failed to generate QR Code image');
  }
};
