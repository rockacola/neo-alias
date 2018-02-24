import { debounce } from 'lodash'
import * as Bows from 'bows'
import { Utils } from '../utils/base'

const log = Bows('CalloutBox')

// -- Declare global variables
declare const $: any

export class CalloutBox {
  private $el: any // jQuery element
  private $wrapper: any

  constructor(options) {
    log('constructor triggered.')
    this.$el = options.$el
    this.$wrapper = this.$el.find('> .wrapper')

    // -- Event bindings
    $(document).on('callout-box', (e: Event, msg: any) => {
      if (msg.subject === 'callout-request') {
        this.calloutRequestHandler(msg)
      }
    })

    // -- Bootstrap

    // -- Event emitters
  }

  // -- Event Handlers

  private calloutRequestHandler(msg: any): void {
    log('calloutRequestHandler triggered. msg:', msg)
    var caption = msg.payload.caption
    var message = msg.payload.message
    var additionalClasses = msg.payload.additionalClasses
    this.appendCallout(caption, message, additionalClasses)
  }

  // -- Private methods

  private appendCallout(caption: string = '', message: string = '', additionalClasses: string = ''): void {
    const $callout = this.getCalloutSnippet(caption, message, additionalClasses)
    this.$wrapper.append($callout)
  }

  private getCalloutSnippet(caption: string = '', message: string = '', additionalClasses: string = ''): any {
    const $callout = $('<div/>', { class: 'callout ' + additionalClasses, 'data-closable': '' })
    $callout.append($('<h5/>', { class: 'caption', text: caption }))
    $callout.append($('<p/>', { class: 'message', text: message }))
    $callout.append($('<button/>', { class: 'close-button', type: 'button', 'data-close': '', text: '×' }))
    return $callout
  }
}
