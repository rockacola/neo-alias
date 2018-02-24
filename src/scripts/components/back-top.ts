import { debounce } from 'lodash'
import * as Bows from 'bows'
const log = Bows('BackTop')

// -- Declare global variables
declare const $: any

export class BackTop {
  private $el: any // jQuery element

  constructor(options) {
    log('constructor triggered.')
    this.$el = options.$el

    // -- Init
    this.reviewVisibility()

    // -- Event bindings
    $(document).on('scroll', debounce(this.documentOnScrollHandler.bind(this), 50))

    // -- Event emitters
    $.event.trigger('global', { sender: 'back-top', subject: 'initialized', payload: {} })
  }

  // -- Event Handlers

  private documentOnScrollHandler(e: Event): void {
    this.reviewVisibility()
  }

  // -- Private methods

  private reviewVisibility(): void {
    // log('reviewVisibility triggered.')
    const MAGIC_NUMBER = 900
    if ($(document).scrollTop() > MAGIC_NUMBER) {
      this.$el.show()
    } else {
      this.$el.hide()
    }
  }
}
