import { debounce } from 'lodash'
import * as Neon from '@cityofzion/neon-js'
import * as Bows from 'bows'
import { NodeManager } from '../models/node-manager'
const log = Bows('NeonProfile')
const Query = Neon.rpc.Query

// -- Declare global variables
declare const $: any

export class NeonProfile {
  private $el: any // jQuery element
  private $urlValue: any // jQuery element
  private $nodeVersionValue: any // jQuery element
  private $contractVersionValue: any // jQuery element
  private $blockCountValue: any // jQuery element
  private nodeManager?: NodeManager

  constructor(options) {
    log('constructor triggered.')
    this.$el = options.$el
    this.$urlValue = this.$el.find('.field.node-url .value')
    this.$nodeVersionValue = this.$el.find('.field.node-version .value')
    this.$contractVersionValue = this.$el.find('.field.contract-version .value')
    this.$blockCountValue = this.$el.find('.field.block-count .value')
    this.nodeManager = options.nodeManager

    // -- Bootstrap
    this.setNodeUrl()
    this.setNodeVersion()
    this.setContractVersion()
    this.setBlockCount()
    setInterval(() => {
      this.setBlockCount()
    }, 20000)

    // -- Event bindings

    // -- Event emitters
    $.event.trigger('global', { sender: 'neon-profile', subject: 'initialized', payload: {} })
  }

  // -- Event Handlers

  // -- Private methods

  private setNodeUrl(): void {
    if (this.nodeManager) {
      const url = this.nodeManager.getNodeUrl()
      this.$urlValue.text(url)
    } else {
      log.warn('NodeManager is not available. Abort.')
    }
  }

  private setNodeVersion(): void {
    if (this.nodeManager) {
      this.nodeManager.getVersionUserAgent()
        .then((res) => {
          this.$nodeVersionValue.text(res)
        })
        .catch((err) => {})
    } else {
      log.warn('NodeManager is not available. Abort.')
    }
  }

  private setContractVersion(): void {
    if (this.nodeManager) {
      this.nodeManager.getNeoAliasVersion()
        .then((res) => {
          this.$contractVersionValue.text(res)
        })
        .catch((err) => {})
    } else {
      log.warn('NodeManager is not available. Abort.')
    }
  }

  private setBlockCount(): void {
    if (this.nodeManager) {
      this.nodeManager.getBlockCount()
        .then((res) => {
          this.$blockCountValue.text(res)
        })
        .catch((err) => {})
    } else {
      log.warn('NodeManager is not available. Abort.')
    }
  }
}
