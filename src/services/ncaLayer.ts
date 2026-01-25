import { NCALayerClient } from 'ncalayer-js-client'

export type NcaSignatureResult = { signature: string } | null

export type KeyType = 'AUTHENTICATION' | 'SIGNATURE'

class NcaLayerService {
  private ncaLayerClient: InstanceType<typeof NCALayerClient>

  constructor() {
    this.ncaLayerClient = new NCALayerClient()
  }

  /**
   * Подключиться к NCALayer и подписать XML
   * @param xml - XML строка для подписания
   * @param keyType - тип ключа (AUTHENTICATION или SIGNATURE)
   * @returns signedXml - подписанный XML или null при ошибке
   */
  async signXml(xml: string, keyType: KeyType = 'SIGNATURE'): Promise<string | null> {
    try {
      await Promise.race([
        this.ncaLayerClient.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000)),
      ])
      const tokens = (await this.ncaLayerClient.getActiveTokens()) || []
      const storageType = tokens.includes(NCALayerClient.fileStorageType)
        ? NCALayerClient.fileStorageType
        : (tokens[0] || NCALayerClient.fileStorageType)
      const signedXml = await this.ncaLayerClient.signXml(
        storageType,
        xml,
        keyType,
        '',
        ''
      )
      return signedXml || null
    } catch {
      try {
        this.ncaLayerClient = new NCALayerClient()
        await Promise.race([
          this.ncaLayerClient.connect(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000)),
        ])
        const tokens = (await this.ncaLayerClient.getActiveTokens()) || []
        const storageType = tokens.includes(NCALayerClient.fileStorageType)
          ? NCALayerClient.fileStorageType
          : (tokens[0] || NCALayerClient.fileStorageType)
        const signedXml = await this.ncaLayerClient.signXml(
          storageType,
          xml,
          keyType,
          '',
          ''
        )
        return signedXml || null
      } catch {
        console.error('NCALayer signXml error after reset')
        return null
      }
    }
  }

  /**
   * Подключиться к NCALayer и получить активные токены
   * @returns массив активных токенов или null при ошибке
   */
  async getActiveTokens(): Promise<string[] | null> {
    try {
      await Promise.race([
        this.ncaLayerClient.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000)),
      ])
      const tokens = await this.ncaLayerClient.getActiveTokens()
      return tokens || null
    } catch {
      try {
        this.ncaLayerClient = new NCALayerClient()
        await Promise.race([
          this.ncaLayerClient.connect(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000)),
        ])
        const tokens = await this.ncaLayerClient.getActiveTokens()
        return tokens || null
      } catch {
        console.error('NCALayer getActiveTokens error after reset')
        return null
      }
    }
  }

  /**
   * Проверить подключение к NCALayer
   * @returns true если подключение успешно
   */
  async connect(): Promise<boolean> {
    try {
      await Promise.race([
        this.ncaLayerClient.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000)),
      ])
      return true
    } catch {
      try {
        this.ncaLayerClient = new NCALayerClient()
        await Promise.race([
          this.ncaLayerClient.connect(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000)),
        ])
        return true
      } catch {
        console.error('NCALayer connect error after reset')
        return false
      }
    }
  }

  /**
   * Подписать XML с ключом SIGNATURE
   * @param xml - XML строка для подписания
   * @returns NcaSignatureResult с подписанным XML
   */
  async signXmlAuth(xml: string): Promise<NcaSignatureResult> {
    const signedXml = await this.signXml(xml, 'SIGNATURE')
    if (signedXml) {
      return { signature: signedXml }
    }
    return null
  }

  /**
   * Подписать XML ключом AUTHENTICATION (для авторизации по ЭЦП)
   */
  async signXmlAuthentication(xml: string): Promise<NcaSignatureResult> {
    const signedXml = await this.signXml(xml, 'AUTHENTICATION')
    if (signedXml) {
      return { signature: signedXml }
    }
    return null
  }

  /**
   * Подписать XML ключом SIGNATURE (явная обёртка)
   */
  async signXmlSignature(xml: string): Promise<NcaSignatureResult> {
    const signedXml = await this.signXml(xml, 'SIGNATURE')
    if (signedXml) {
      return { signature: signedXml }
    }
    return null
  }
}

export const ncaLayer = new NcaLayerService()
