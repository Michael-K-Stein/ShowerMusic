import { getSymetricalEncyptionKey } from "@/app/settings";

export type Base64String = string;
export type CipheredData<T> = Base64String;
export interface EncryptedData<T>
{
    cipheredData: CipheredData<T>;
    iv: Base64String;
};
const cryptoAlgorithm = { name: 'AES-GCM' };
export async function aesEncrypt<T>(data: T): Promise<EncryptedData<T>>
{
    const encodedData = new TextEncoder().encode(JSON.stringify(data));
    const encryptionKey = await getSymetricalEncyptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedData = await crypto.subtle.encrypt({ ...cryptoAlgorithm, iv }, encryptionKey, encodedData);
    return {
        cipheredData: Buffer.from(encryptedData).toString("base64"),
        iv: Buffer.from(iv).toString("base64"),
    };
}
export async function aesDecrypt<T>(encryptedData: EncryptedData<T>): Promise<T>
{
    const { cipheredData, iv } = encryptedData;
    const encryptionKey = await getSymetricalEncyptionKey();

    const decodedIv = Buffer.from(iv, 'base64');
    const decodedCipherData = Buffer.from(cipheredData, 'base64');

    const decryptedData = await crypto.subtle.decrypt({ ...cryptoAlgorithm, iv: decodedIv }, encryptionKey, decodedCipherData);
    const decodedDecryptedData = new TextDecoder().decode(decryptedData);

    const spreadPlainData = JSON.parse(decodedDecryptedData);
    return spreadPlainData as T;
}
