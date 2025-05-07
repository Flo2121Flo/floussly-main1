import { useState, useCallback } from 'react';
import { Buffer } from 'buffer';

interface EncryptionState {
  publicKey: string | null;
  privateKey: string | null;
  error: string | null;
}

export const useEncryption = () => {
  const [state, setState] = useState<EncryptionState>({
    publicKey: null,
    privateKey: null,
    error: null,
  });

  const generateKeyPair = useCallback(async () => {
    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt']
      );

      const publicKeyBuffer = await window.crypto.subtle.exportKey(
        'spki',
        keyPair.publicKey
      );
      const privateKeyBuffer = await window.crypto.subtle.exportKey(
        'pkcs8',
        keyPair.privateKey
      );

      const publicKey = Buffer.from(publicKeyBuffer).toString('base64');
      const privateKey = Buffer.from(privateKeyBuffer).toString('base64');

      setState((prev) => ({
        ...prev,
        publicKey,
        privateKey,
        error: null,
      }));

      return { publicKey, privateKey };
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate key pair',
      }));
      throw error;
    }
  }, []);

  const importPublicKey = useCallback(async (publicKeyString: string) => {
    try {
      const publicKeyBuffer = Buffer.from(publicKeyString, 'base64');
      const publicKey = await window.crypto.subtle.importKey(
        'spki',
        publicKeyBuffer,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256',
        },
        true,
        ['encrypt']
      );

      setState((prev) => ({
        ...prev,
        publicKey: publicKeyString,
        error: null,
      }));

      return publicKey;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to import public key',
      }));
      throw error;
    }
  }, []);

  const importPrivateKey = useCallback(async (privateKeyString: string) => {
    try {
      const privateKeyBuffer = Buffer.from(privateKeyString, 'base64');
      const privateKey = await window.crypto.subtle.importKey(
        'pkcs8',
        privateKeyBuffer,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256',
        },
        true,
        ['decrypt']
      );

      setState((prev) => ({
        ...prev,
        privateKey: privateKeyString,
        error: null,
      }));

      return privateKey;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to import private key',
      }));
      throw error;
    }
  }, []);

  const encryptMessage = useCallback(async (message: string, publicKey: CryptoKey) => {
    try {
      const encoder = new TextEncoder();
      const messageBuffer = encoder.encode(message);

      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: 'RSA-OAEP',
        },
        publicKey,
        messageBuffer
      );

      return Buffer.from(encryptedBuffer).toString('base64');
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to encrypt message',
      }));
      throw error;
    }
  }, []);

  const decryptMessage = useCallback(async (encryptedMessage: string, privateKey: CryptoKey) => {
    try {
      const encryptedBuffer = Buffer.from(encryptedMessage, 'base64');

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'RSA-OAEP',
        },
        privateKey,
        encryptedBuffer
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to decrypt message',
      }));
      throw error;
    }
  }, []);

  const generateSymmetricKey = useCallback(async () => {
    try {
      const key = await window.crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256,
        },
        true,
        ['encrypt', 'decrypt']
      );

      const exportedKey = await window.crypto.subtle.exportKey('raw', key);
      return Buffer.from(exportedKey).toString('base64');
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to generate symmetric key',
      }));
      throw error;
    }
  }, []);

  const encryptWithSymmetricKey = useCallback(async (message: string, keyString: string) => {
    try {
      const keyBuffer = Buffer.from(keyString, 'base64');
      const key = await window.crypto.subtle.importKey(
        'raw',
        keyBuffer,
        {
          name: 'AES-GCM',
          length: 256,
        },
        false,
        ['encrypt']
      );

      const encoder = new TextEncoder();
      const messageBuffer = encoder.encode(message);
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        key,
        messageBuffer
      );

      return {
        encrypted: Buffer.from(encryptedBuffer).toString('base64'),
        iv: Buffer.from(iv).toString('base64'),
      };
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to encrypt with symmetric key',
      }));
      throw error;
    }
  }, []);

  const decryptWithSymmetricKey = useCallback(async (encryptedMessage: string, iv: string, keyString: string) => {
    try {
      const keyBuffer = Buffer.from(keyString, 'base64');
      const key = await window.crypto.subtle.importKey(
        'raw',
        keyBuffer,
        {
          name: 'AES-GCM',
          length: 256,
        },
        false,
        ['decrypt']
      );

      const encryptedBuffer = Buffer.from(encryptedMessage, 'base64');
      const ivBuffer = Buffer.from(iv, 'base64');

      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: ivBuffer,
        },
        key,
        encryptedBuffer
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to decrypt with symmetric key',
      }));
      throw error;
    }
  }, []);

  return {
    ...state,
    generateKeyPair,
    importPublicKey,
    importPrivateKey,
    encryptMessage,
    decryptMessage,
    generateSymmetricKey,
    encryptWithSymmetricKey,
    decryptWithSymmetricKey,
  };
}; 