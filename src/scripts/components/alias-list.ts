import { debounce } from 'lodash'
import * as Bows from 'bows'
import { NodeManager } from '../models/node-manager'
import { Utils } from '../utils/base'
import { NeoValidator } from '../models/neo-validator';

const log = Bows('AliasList')

// -- Declare global variables
declare const $: any

export class AliasList {
  private $el: any // jQuery element
  private $caption: any
  private $captionAddress: any
  private $wifInput: any
  private $table: any
  private $tableBody: any
  private nodeManager?: NodeManager
  private targetAddress?: string
  private aliasCount = 0

  constructor(options) {
    log('constructor triggered.')
    this.$el = options.$el
    this.$caption = this.$el.find('.caption')
    this.$captionAddress = this.$caption.find('.address')
    this.$wifInput = this.$el.find('.field.wif input')
    this.$table = this.$el.find('table')
    this.$tableBody = this.$table.find('tbody')
    this.nodeManager = options.nodeManager

    // -- Event bindings
    $(document).on('alias-list', (e: Event, msg: any) => {
      if (msg.subject === 'update-target-address') {
        this.updateTargetAddressHandler(msg)
      } else if (msg.subject === 'update-alias-count') {
        this.updateAliasCountHandler(msg)
      } else if (msg.subject === 'row-ready') {
        this.rowReadyHandler(msg)
      }
    })

    // -- Bootstrap
    this.setTargetAddress()

    // -- Event emitters
  }

  // -- Event Handlers

  private updateTargetAddressHandler(msg: any): void {
    // log('updateTargetAddressHandler triggered. msg:', msg)
    this.setCaption()
    this.setAliasCount()
  }

  private updateAliasCountHandler(msg: any): void {
    // log('updateAliasCountHandler triggered. msg:', msg)
    this.emptyAliasList()
    this.populateAliasList()
  }

  private rowReadyHandler(msg: any): void {
    // log('rowReadyHandler triggered. msg:', msg)
    const index = msg.payload.index
    this.setAliasName(msg.payload.index)
    this.setAliasScore(msg.payload.index)
  }

  private voteUpClickHandler(e: any): void {
    log('voteUpClickHandler triggered. e:', e)
    const $target = $(e.delegateTarget)
    const wif = this.getWif()
    const index = parseInt($target.closest('tr').attr('data-index'))
    const point = 1
    this.hideOperators(index)
    this.setVote(wif, index, point)
  }

  private voteDownClickHandler(e: any): void {
    log('voteDownClickHandler triggered. e:', e)
    const $target = $(e.delegateTarget)
    const wif = this.getWif()
    const index = parseInt($target.closest('tr').attr('data-index'))
    const point = -1

    if (!NeoValidator.isValidWif(wif)) {
      this.triggerCallout('Invalid Input', 'The provided WIF is invalid.', 'alert')
      return
    }

    this.hideOperators(index)
    this.setVote(wif, index, point)
  }

  // -- Private methods

  private setCaption(): void {
    this.$captionAddress.text(this.targetAddress)
  }

  private setTargetAddress(): void {
    this.targetAddress = Utils.getParameterByName('w', window.location.href)
    $.event.trigger('alias-list', { sender: 'alias-list', subject: 'update-target-address', payload: {} })
  }

  private setAliasCount(): void {
    log('setAliasCount triggered.')
    if (this.nodeManager) {
      this.nodeManager.getNeoAliasCount(this.targetAddress as string)
        .then((res) => {
          // log('good. res:', res)
          this.aliasCount = res
          $.event.trigger('alias-list', { sender: 'alias-list', subject: 'update-alias-count', payload: {} })
        })
        .catch((err) => {
          log('Failed on setAliasCount. err:', err)
        })
    } else {
      log.warn('NodeManager is not available. Abort.')
    }
  }

  private setAliasName(index: number): void {
    if (this.nodeManager) {
      const $td = this.$tableBody.find('tr[data-index="' + index + '"] .alias')
      this.nodeManager.getNeoAlias(this.targetAddress as string, index)
        .then((res) => {
          $td.text(res)
        })
        .catch((err) => {
          log('rowReadyHandler failed. index:', index, 'err:', err)
          $td.text('(failed)')
        })
    } else {
      log.warn('NodeManager is not available. Abort.')
    }
  }

  private setAliasScore(index: number): void {
    if (this.nodeManager) {
      const $td = this.$tableBody.find('tr[data-index="' + index + '"] .score')
      this.nodeManager.getNeoAliasScore(this.targetAddress as string, index)
        .then((res) => {
          $td.text(res)
        })
        .catch((err) => {
          log('rowReadyHandler failed. index:', index, 'err:', err)
          $td.text('(failed)')
        })
    } else {
      log.warn('NodeManager is not available. Abort.')
    }
  }

  private setVote(invokerWif: string, index: number, point: number) {
    log('setVote triggered. invokerWif:', invokerWif, 'index:', index, 'point:', point)
    if (this.nodeManager) {
      this.nodeManager.setVote(invokerWif, this.targetAddress as string, index, point)
        .then((res) => {
          log('setVote success. res:', res)
          this.triggerCallout('Vote Submitted', 'It may take up to 1 minute to appear on blockchain. It also also be a false positive due to incomplete error reporting.', 'success')
        })
        .catch((err) => {
          log('Failed on setVote. err:', err)
          this.triggerCallout('Submission Failed', 'There is a problem with your alias submission.', 'alert')
        })
    } else {
      log.warn('NodeManager is not available. Abort.')
      this.triggerCallout('Application Error', 'Application node manager appears to be unavailable.', 'alert')
    }
  }

  private emptyAliasList(): void {
    // log('emptyAliasList triggered.')
    this.$tableBody.empty()
  }

  private populateAliasList(): void {
    // log('populateAliasList triggered.')

    // for (let i=0; i<this.aliasCount; i++) {
    for (let i=this.aliasCount-1; i>=0; i--) {
      const $row = this.getRowSnippet(i)
      this.$tableBody.append($row)
      $.event.trigger('alias-list', { sender: 'alias-list', subject: 'row-ready', payload: { index: i } })
    }
  }

  private getRowSnippet(index: number): any {
    // log('getRowSnippet triggered. index:', index)
    const $voteUp = $('<a/>', { class: 'vote-up', text: 'Vote up' })
    const $voteDown = $('<a/>', { class: 'vote-down', text: 'Vote down' })
    const $operationTd = $('<td/>', { class: 'operation' })
    $operationTd.append($voteDown).append($voteUp)

    $voteUp.on('click', this.voteUpClickHandler.bind(this))
    $voteDown.on('click', this.voteDownClickHandler.bind(this))

    const $tr = $('<tr/>', { class: 'row', 'data-index': index })
    $tr.append($('<td/>', { class: 'index', text: index }))
    $tr.append($('<td/>', { class: 'alias', text: '(loading...)' }))
    $tr.append($('<td/>', { class: 'score', text: '(loading...)' }))
    $tr.append($operationTd)
    return $tr
  }

  private getWif(): string {
    return this.$wifInput.val()
  }

  private hideOperators(index: number): void {
    const $operationTd = this.$tableBody.find('tr[data-index="' + index + '"] td.operation')
    $operationTd.empty()
  }

  private triggerCallout(caption: string = '', message: string = '', additionalClasses: string = ''): void {
    $.event.trigger('callout-box', { sender: 'callout-box', subject: 'callout-request', payload: {
      caption: caption,
      message: message,
      additionalClasses: additionalClasses,
    }})
  }
}
