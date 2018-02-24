import { debounce } from 'lodash'
import * as Bows from 'bows'
import { NodeManager } from '../models/node-manager'
import { NeoValidator } from '../models/neo-validator';
const log = Bows('SetAliasForm')

// -- Declare global variables
declare const $: any

export class SetAliasForm {
  private $el: any // jQuery element
  private $addressInput: any // jQuery element
  private $aliasInput: any // jQuery element
  private $wifInput: any // jQuery element
  private $submitButton: any // jQuery element
  private nodeManager?: NodeManager

  constructor(options) {
    log('constructor triggered.')
    this.$el = options.$el
    this.$addressInput = this.$el.find('.field.target-address input')
    this.$aliasInput = this.$el.find('.field.new-alias input')
    this.$wifInput = this.$el.find('.field.wif input')
    this.$submitButton = this.$el.find('.field.submit button')
    this.nodeManager = options.nodeManager

    // -- Bootstrap

    // -- Event bindings
    this.$submitButton.on('click', this.submitButtonClickHandler.bind(this))

    // -- Event emitters
  }

  // -- Event Handlers

  private submitButtonClickHandler(e: Event) {
    log('submitButtonClickHandler triggered. e:', e)
    e.preventDefault()
    this.hideSubmitButton()

    const address = this.$addressInput.val()
    const alias = this.$aliasInput.val()
    const wif = this.$wifInput.val()
    // log('address:', address, 'alias:', alias, 'wif:', wif)

    if (!NeoValidator.isValidAddress(address)) {
      this.triggerCallout('Invalid Input', 'The provided wallet address is invalid.', 'alert')
      return
    }
    if (!NeoValidator.isValidAlias(alias)) {
      this.triggerCallout('Invalid Input', 'The provided alias name is invalid. Please only use alphanumeric, period and underscore.', 'alert')
      return
    }
    if (!NeoValidator.isValidWif(wif)) {
      this.triggerCallout('Invalid Input', 'The provided WIF is invalid.', 'alert')
      return
    }

    // Get invoker address
    if(this.nodeManager) {
      this.nodeManager.setNeoAlias(address, alias, wif)
        .then((res) => {
          log('success. res:', res)
          this.triggerCallout('New Alias Submitted', 'It may take up to 1 minute for your submission to appear on blockchain.', 'success')
        })
        .catch((err) => {
          log('failed. err:', err)
          this.triggerCallout('Submission Failed', 'There is a problem with your alias submission.', 'alert')
        })
    } else {
      log.warn('NodeManager is not available. Abort.')
      this.triggerCallout('Application Error', 'Application node manager appears to be unavailable.', 'alert')
    }
  }

  // -- Private methods

  private hideSubmitButton(): void {
    this.$submitButton.hide()
  }

  private triggerCallout(caption: string = '', message: string = '', additionalClasses: string = ''): void {
    $.event.trigger('callout-box', { sender: 'callout-box', subject: 'callout-request', payload: {
      caption: caption,
      message: message,
      additionalClasses: additionalClasses,
    }})
  }
}
