export let activeEncryptionKey: CryptoKey | null = null;

export function setGlobalKey(key: CryptoKey | null) {
  activeEncryptionKey = key;
}

export async function deriveKey(password: string, saltString: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const salt = encoder.encode(saltString);
  
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

export function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function base64ToBuffer(base64: string): ArrayBuffer {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function encryptData(data: any): Promise<string> {
  if (!activeEncryptionKey) throw new Error("No encryption key set");
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(JSON.stringify(data));

  const ciphertext = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    activeEncryptionKey,
    encodedData
  );

  return bufferToBase64(iv.buffer) + ':' + bufferToBase64(ciphertext);
}

export async function decryptData(encryptedString: string): Promise<any> {
  if (!activeEncryptionKey) throw new Error("No encryption key set");
  const parts = encryptedString.split(':');
  if (parts.length !== 2) throw new Error('Invalid encrypted data format');
  
  const iv = base64ToBuffer(parts[0]);
  const ciphertext = base64ToBuffer(parts[1]);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(iv) as any
    },
    activeEncryptionKey,
    ciphertext
  );

  const decoder = new TextDecoder();
  const decryptedString = decoder.decode(decryptedBuffer);
  return JSON.parse(decryptedString);
}
