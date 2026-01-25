declare module 'ncalayer-js-client' {
  export class NCALayerClient {
    /**
     * File storage type constant for PKCS12 files
     */
    static readonly fileStorageType: string;

    /**
     * Connect to NCALayer WebSocket server
     * @returns Promise that resolves when connection is established
     */
    connect(): Promise<void>;

    /**
     * Get list of active tokens (storage types) available
     * @returns Promise with array of storage type names (e.g., 'PKCS12', 'KAZTOKEN')
     */
    getActiveTokens(): Promise<string[]>;

    /**
     * Sign XML data
     * @param storageName - Storage type (e.g., 'PKCS12', 'KAZTOKEN')
     * @param xml - XML string to sign
     * @param keyType - Key type ('SIGNATURE' | 'AUTHENTICATION')
     * @param tbsElementXPath - XPath to the element to sign (empty for entire document)
     * @param signatureParentElementXPath - XPath to the parent element for signature
     * @returns Promise with signed XML string
     */
    signXml(
      storageName: string,
      xml: string,
      keyType: 'SIGNATURE' | 'AUTHENTICATION',
      tbsElementXPath?: string,
      signatureParentElementXPath?: string
    ): Promise<string>;

    /**
     * Sign CMS (Cryptographic Message Syntax) data
     * @param storageName - Storage type
     * @param keyType - Key type
     * @param data - Data to sign (base64 encoded)
     * @param attached - Whether to create attached or detached signature
     * @returns Promise with CMS signature
     */
    signCms(
      storageName: string,
      data: string,
      keyType: 'SIGNATURE' | 'AUTHENTICATION',
      attached: boolean
    ): Promise<string>;

    /**
     * Get subject DN (Distinguished Name) from certificate
     * @param storageName - Storage type
     * @param keyType - Key type
     * @returns Promise with subject DN string
     */
    getSubjectDN(
      storageName: string,
      keyType: 'SIGNATURE' | 'AUTHENTICATION'
    ): Promise<string>;

    /**
     * Close the WebSocket connection
     */
    disconnect(): void;
  }

  export default NCALayerClient;
}
