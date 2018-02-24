import { debounce } from 'lodash'
import * as Bows from 'bows'
import { NodeManager } from '../models/node-manager'
const log = Bows('AllReport')

// -- Declare global variables
declare const $: any

export class AllReport {
  private $el: any // jQuery element
  private $allCountValue: any // jQuery element
  private $table: any
  private $tableBody: any
  private nodeManager?: NodeManager
  private allCount = 0

  constructor(options) {
    log('constructor triggered.')
    this.$el = options.$el
    this.$allCountValue = this.$el.find('.count-container .value')
    this.$table = this.$el.find('table.latest')
    this.$tableBody = this.$table.find('tbody')
    this.nodeManager = options.nodeManager

    // -- Event bindings
    $(document).on('all-report', (e: Event, msg: any) => {
      if (msg.subject === 'update-all-count') {
        this.updateAllCountHandler(msg)
      } else if (msg.subject === 'row-ready') {
        this.rowReadyHandler(msg)
      }
    })
    
    // -- Bootstrap
    this.setTotalAliasCount()

    // -- Event emitters
  }

  // -- Event Handlers

  private updateAllCountHandler(msg: any): void {
    log('updateAllCountHandler triggered. msg:', msg)
    const TAKE_SIZE = 10
    const startIndex = this.allCount - 1
    let tillIndex = startIndex - TAKE_SIZE
    if (tillIndex < 0) { tillIndex = 0 }
    log('iterate from:', startIndex, 'to:', tillIndex)
  
    this.emptyAliasList()
    for (let i=startIndex; i>=tillIndex; i--) {
      // this.populateAllAliasItem(i)
      const $row = this.getRowSnippet(i)
      this.$tableBody.append($row)
      $.event.trigger('all-report', { sender: 'all-report', subject: 'row-ready', payload: { index: i } })
    }
  }

  private rowReadyHandler(msg: any): void {
    // log('rowReadyHandler triggered. msg:', msg)
    const index = msg.payload.index
    this.populateAliasRow(index)
  }

  // -- Private methods

  private emptyAliasList(): void {
    // log('emptyAliasList triggered.')
    this.$tableBody.empty()
  }

  private setTotalAliasCount(): void {
    log('setTotalAliasCount triggered.')
    if (this.nodeManager) {
      this.nodeManager.getNeoAliasCountAll()
        .then((res) => {
          // log('good. res:', res)
          this.allCount = res
          this.$allCountValue.text(res)
          $.event.trigger('all-report', { sender: 'all-report', subject: 'update-all-count', payload: {} })
        })
        .catch((err) => {
          log('Failed on setTotalAliasCount. err:', err)
        })
    } else {
      log.warn('NodeManager is not available. Abort.')
    }
  }

  private populateAliasRow(index: number): void {
    if (this.nodeManager) {
      try {
        this.nodeManager.getNeoAliasAllIndex(index)
          .then((res: any) => {
            log('row => #', index, 'getNeoAliasAllIndex res:', res)
            const targetAddress: string = res.address
            const aliasIndex: number = res.index

            this.setTargetAddress(index, targetAddress)
            this.setTargetAlias(index, targetAddress, aliasIndex)
            this.setTargetScore(index, targetAddress, aliasIndex)
          })
          .catch((err) => {
            log('getNeoAliasAllIndex failed. index:', index, 'err:', err)
          })
      } catch (ex) {
        log.warn('Failed to fetching data. ex:', ex)
        this.setFailedRow(index)
      }
    } else {
      log.warn('NodeManager is not available. Abort.')
    }
  }

  private setFailedRow(index: number): void {
    this.$tableBody.find('tr[data-index="' + index + '"] .address').text('(failed)')
    this.$tableBody.find('tr[data-index="' + index + '"] .alias').text('(failed)')
    this.$tableBody.find('tr[data-index="' + index + '"] .score').text('(failed)')
  }

  private getRowSnippet(index: number): any {
    // log('getRowSnippet triggered. index:', index)
    const $tr = $('<tr/>', { class: 'row', 'data-index': index })
    $tr.append($('<td>', { class: 'index', text: index }))
    $tr.append($('<td>', { class: 'address', text: '(loading...)' }))
    $tr.append($('<td>', { class: 'alias', text: '(N/A)' }))
    $tr.append($('<td>', { class: 'score', text: '(N/A)' }))
    return $tr
  }

  private setTargetAddress(index: number, address: string): void {
    const url = '/aliases?w=' + encodeURI(address)
    const $anchor = $('<a/>', { href: url, text: address })
    this.$tableBody.find('tr[data-index="' + index + '"] .address').empty().append($anchor)
  }

  private setTargetAlias(index: number, targetAddress: string, aliasIndex: number): void {
    log('setTargetAlias triggered. index:', index, 'targetAddress:', targetAddress, 'aliasIndex:', aliasIndex)
    const $td = this.$tableBody.find('tr[data-index="' + index + '"] .alias')
    if (this.nodeManager) {
      this.nodeManager.getNeoAlias(targetAddress, aliasIndex)
        .then((res) => {
          $td.text(res)
        })
        .catch((err) => {
          log('setTargetAlias failed. index:', index, 'err:', err)
          $td.text('(failed)')
        })
    } else {
      log.warn('NodeManager is not available. Abort.')
    }
  }

  private setTargetScore(index: number, targetAddress: string, aliasIndex: number): void {
    const $td = this.$tableBody.find('tr[data-index="' + index + '"] .score')
    if (this.nodeManager) {
      this.nodeManager.getNeoAliasScore(targetAddress, aliasIndex)
        .then((res) => {
          $td.text(res)
        })
        .catch((err) => {
          log('setTargetScore failed. index:', index, 'err:', err)
          $td.text('(failed)')
        })
    } else {
      log.warn('NodeManager is not available. Abort.')
    }
  }
}
