import { debounce } from 'lodash'
import * as Neon from '@cityofzion/neon-js'
import * as Bows from 'bows'
import { Utils } from '../utils/base';
const log = Bows('NodeManager')
const Query = Neon.rpc.Query

// -- Declare global variables
declare const $: any

export class NodeManager {
  private rpcUrl = ''
  private network = 'TestNet'
  // private neoAliasHash = '8a092d91a822192b20e91722dc3dea28dfdb5cbd' // Version 17
  private neoAliasHash = '83d3ddd44f4c197152b827f3660b00a49fcb5d22' // Version 18

  constructor(options = undefined) {
    log('constructor triggered.')

    // -- Init
    this.initNode()
    this.initRpcUrl()

    // -- Event bindings

    // -- Event emitters
    $.event.trigger('global', { sender: 'node-manager', subject: 'initialized', payload: {} })
  }

  // -- Event Handlers

  // -- Private methods

  private initNode(): void {
    log('initNode triggered.')
    this.getVersionUserAgent()
      .then((res) => {
        log(`Connected to [${this.rpcUrl}], Version: [${res}]`)
      })
      .catch((err) => {})
  }

  private initRpcUrl(): void {
    // Hard coded default
    const URL = 'http://seed2.neo.org:20332'

    // Attempt to fetch from URL parameter
    const providedRpcUrl = Utils.getParameterByName('rpc', window.location.href) // Assume it is URL decoded and accurate
    
    // Assignment
    if (providedRpcUrl) {
      log('Setting target RPC with user provided URL:', providedRpcUrl)
      this.rpcUrl = providedRpcUrl
    } else {
      this.rpcUrl = URL
    }
  }

  private getAddressIndexInfo(hexValue: string): any {
    /**
     * The idea been:
     * - seek for last occurrence of `5f`, which is `_`) and split there
     * - first part, unhex it to get the wallet address
     * - 2nd part
     *   - if it's empty , then it's `index = 0`
     *   - otherwise it's a base16 representation of a integer
     */
    // log('getAddressIndexInfo triggered. hexValue:', hexValue)
    const SPLITTER = '5f'
    const splitIndex = hexValue.lastIndexOf(SPLITTER)
    const addressHex = hexValue.substring(0, splitIndex)
    const indexHex = hexValue.replace(addressHex + SPLITTER, '')
    log('hexValue:', hexValue, 'addressHex:', addressHex, 'indexHex:', indexHex)

    const address = Neon.u.hexstring2str(addressHex)
    const index = (indexHex === '') ? 0 : parseInt(indexHex, 16)
    return { address, index }
  }

  // -- Public method

  public getNodeUrl(): string {
    return this.rpcUrl
  }

  public getVersionUserAgent(): Promise<string> {
    return new Promise((resolve, reject) => {
      Query.getVersion()
        .execute(this.rpcUrl)
        .then((res) => {
          // log('res:', res)
          resolve(res.result.useragent)
        })
        .catch((err) => {
          log.warn('getVersionUserAgent() err:', err)
          reject(err)
        })
    })
  }

  public getBlockCount(): Promise<string> {
    return new Promise((resolve, reject) => {
      Query.getBlockCount()
        .execute(this.rpcUrl)
        .then((res) => {
          // log('res:', res)
          resolve(res.result)
        })
        .catch((err) => {
          log.warn('getBlockCount() err:', err)
          reject(err)
        })
    })
  }

  public getNeoAliasVersion(): Promise<string> {
    log('getNeoAliasVersion triggered.')
    return new Promise((resolve, reject) => {
      Query.getContractState(this.neoAliasHash).execute(this.rpcUrl)
      .then((res) => {
        const version = res.result.code_version
        resolve(version)
      })
      .catch((err) => reject(err))
    })
  }

  public getNeoAliasCountAll(): Promise<number> {
    log('getNeoAliasCountAll triggered.')
    return new Promise((resolve, reject) => {
      const props = {
        scriptHash: this.neoAliasHash,
        operation: 'count_all',
        args: []
      }
      const script = Neon.sc.createScript(props)
      // log('script:', script)
      Query.invokeScript(script).execute(this.rpcUrl)
        .then((res) => {
          // log('success. res:', res)
          try {
            const rawValue = res.result.stack[0].value
            const value = (rawValue === '') ? 0 : parseInt(rawValue)
            resolve(value)
          } catch (ex) {
            log.warn('Failed to extract data. ex:', ex)
            reject(new Error('Parsing error.'))
          }
        })
        .catch((err) => reject(err))
    })
  }

  public getNeoAliasAllIndex(index: number): Promise<string> {
    // log('getNeoAliasAllIndex triggered. index:', index)
    return new Promise((resolve, reject) => {
      const props = {
        scriptHash: this.neoAliasHash,
        operation: 'get_all_index',
        args: [{ "type": "Integer", "value": index }]
      }
      const script = Neon.sc.createScript(props)
      Query.invokeScript(script).execute(this.rpcUrl)
        .then((res) => {
          // log('success. res:', res)
          try {
            const rawValue = res.result.stack[0].value
            const info = this.getAddressIndexInfo(rawValue)
            resolve(info)
          } catch (ex) {
            log.warn('Failed to extract data. ex:', ex)
            reject(new Error('Parsing error.'))
          }
        })
        .catch((err) => reject(err))
    })
  }

  public getNeoAliasCount(address: string): Promise<number> {
    log('getNeoAliasCount triggered. address:', address)
    return new Promise((resolve, reject) => {
      const props = {
        scriptHash: this.neoAliasHash,
        operation: 'count_alias',
        args: [{ "type": "String", "value": address }]
      }
      const script = Neon.sc.createScript(props)
      // log('script:', script)
      Query.invokeScript(script).execute(this.rpcUrl)
        .then((res) => {
          // log('success. res:', res)
          try {
            const rawValue = res.result.stack[0].value
            const value = (rawValue === '') ? 0 : parseInt(rawValue)
            resolve(value)
          } catch (ex) {
            log.warn('Failed to extract data. ex:', ex)
            reject(new Error('Parsing error.'))
          }
        })
        .catch((err) => reject(err))
    })
  }

  public getNeoAlias(address: string, index: number): Promise<string> {
    // log('getNeoAlias triggered. address:', address, 'index:', index)
    return new Promise((resolve, reject) => {
      try {
        const props = {
          scriptHash: this.neoAliasHash,
          operation: 'get_alias',
          args: [
            { "type": "String", "value": address },
            { "type": "Integer", "value": index }
          ],
        }
        const script = Neon.sc.createScript(props)
        Query.invokeScript(script).execute(this.rpcUrl)
          .then((res) => {
            // log('success. res:', res)
            try {
              const rawValue = res.result.stack[0].value
              const value = Neon.u.hexstring2str(rawValue)
              resolve(value)
            } catch (ex) {
              log.warn('Failed to extract data for getNeoAlias. ex:', ex)
              reject(new Error('Parsing error.'))
            }
          })
          .catch((err) => reject(err))
      } catch (ex) {
        log.warn('Failed process getNeoAlias. ex:', ex)
        reject(new Error('Parsing error.'))
      }
    })
  }

  public getNeoAliasScore(address: string, index: number): Promise<number> {
    // log('getNeoAliasScore triggered. address:', address, 'index:', index)
    return new Promise((resolve, reject) => {
      try {
        const props = {
          scriptHash: this.neoAliasHash,
          operation: 'get_alias_score',
          args: [
            { "type": "String", "value": address },
            { "type": "Integer", "value": index }
          ],
        }
        const script = Neon.sc.createScript(props)
        Query.invokeScript(script).execute(this.rpcUrl)
          .then((res) => {
            // log('success. res:', res)
            try {
              const rawValue = res.result.stack[0].value
              const value = (rawValue === '') ? 0 : parseInt(rawValue)
              resolve(value)
            } catch (ex) {
              log.warn('Failed to extract data for getNeoAliasScore. ex:', ex)
              reject(new Error('Parsing error.'))
            }
          })
          .catch((err) => reject(err))
      } catch (ex) {
        log.warn('Failed process getNeoAliasScore. ex:', ex)
        reject(new Error('Parsing error.'))
      }
    })
  }

  public setNeoAlias(targetAddress: string, newAlias: string, invokerWif: string): Promise<any> {
    log('setNeoAlias triggered. targetAddress:', targetAddress, 'newAlias:', newAlias, 'invokerWif:', invokerWif)
    try {
      const invokerPrivateKey = Neon.wallet.getPrivateKeyFromWIF(invokerWif)
      console.log('invokerPrivateKey:', invokerPrivateKey)
      const invokerPublicKey = Neon.wallet.getPublicKeyFromPrivateKey(invokerPrivateKey)
      console.log('invokerPublicKey:', invokerPublicKey)
      const invokerScriptHash = Neon.wallet.getScriptHashFromPublicKey(invokerPublicKey)
      console.log('invokerScriptHash:', invokerScriptHash)
      const invokerAddress = Neon.wallet.getAddressFromScriptHash(invokerScriptHash)
      console.log('invokerAddress:', invokerAddress)
      // TODO: better exception handling

      const props = {
        scriptHash: this.neoAliasHash,
        operation: 'set_alias',
        args: [
          { "type": "String", "value": invokerAddress },
          { "type": "String", "value": targetAddress },
          { "type": "String", "value": newAlias },
        ]
      }
      const config = {
        net: this.network,
        address: invokerAddress,
        privateKey: invokerWif,
        intents: Neon.api.makeIntent({ GAS: 0.001 }, invokerAddress), // NOTE: Seems that I must have an intent, so I send GAS to myself
        script: props,
        gas: 0
      }

      return new Promise((resolve, reject) => {
        this.invoke(config)
        .then((res: any) => {
          if (res.response.result === true) {
            resolve(res.response.txid)
          } else {
            reject(new Error('doInvoke() failed.'))
          }
        })
        .catch((err) => reject(err))
      })
    } catch (ex) {
      return Promise.reject(new Error(ex.message))
    }
  }

  public setVote(invokerWif: string, targetAddress: string, index: number, point: number): Promise<any> {
    log('setVote triggered.')
    try {
      const invokerPrivateKey = Neon.wallet.getPrivateKeyFromWIF(invokerWif)
      // console.log('invokerPrivateKey:', invokerPrivateKey)
      const invokerPublicKey = Neon.wallet.getPublicKeyFromPrivateKey(invokerPrivateKey)
      // console.log('invokerPublicKey:', invokerPublicKey)
      const invokerScriptHash = Neon.wallet.getScriptHashFromPublicKey(invokerPublicKey)
      // console.log('invokerScriptHash:', invokerScriptHash)
      const invokerAddress = Neon.wallet.getAddressFromScriptHash(invokerScriptHash)
      // console.log('invokerAddress:', invokerAddress)
      // TODO: better exception handling

      const props = {
        scriptHash: this.neoAliasHash,
        operation: 'vote_alias',
        args: [
          { "type": "String", "value": invokerAddress },
          { "type": "String", "value": targetAddress },
          { "type": "Integer", "value": index },
          { "type": "Integer", "value": point },
        ]
      }
      const config = {
        net: this.network,
        address: invokerAddress,
        privateKey: invokerWif,
        intents: Neon.api.makeIntent({ GAS: 0.001 }, invokerAddress), // NOTE: Seems that I must have an intent, so I send GAS to myself
        script: props,
        gas: 0
      }

      return new Promise((resolve, reject) => {
        this.invoke(config)
        .then((res: any) => {
          log('setVote res:', res)
          if (res.response.result === true) {
            resolve(res.response.txid)
          } else {
            reject(new Error('doInvoke() failed.'))
          }
        })
        .catch((err) => reject(err))
      })
    } catch (ex) {
      return Promise.reject(new Error(ex.message))
    }
  }

  // A workaround to neon-js declared incorrect return type for its doInvoke() method
  private invoke(config: Neon.api.apiConfig): Promise<object> {
    return Neon.api.doInvoke(config) as any
  }
}
