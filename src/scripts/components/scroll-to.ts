import { debounce } from 'lodash'
import * as Bows from 'bows'
const log = Bows('ScrollTo')

// -- Declare global variables
declare const $: any

export class ScrollTo {
  private $el: any // jQuery element

  constructor(options) {
    log('constructor triggered.')
    this.$el = options.$el

    // -- Event bindings
    this.$el.on('click', this.clickHandler.bind(this))

    // -- Event emitters
    $.event.trigger('global', { sender: 'scroll-to', subject: 'initialized', payload: {} })
  }

  // -- Event Handlers

  private clickHandler(e: Event): void {
    // log('clickHandler triggered')
    this.activate()
  }

  // -- Private methods

  private activate(): void {
    /**
     * we are not pre-fetching data attributes but find them on the fly.
     * This way, the component is now friendly towards dynamic changes.
     */
    // Find optional offset
    let offsetY: number | null = null
    if (this.$el.attr('data-offset-y')) {
      offsetY = parseInt(this.$el.attr('data-offset-y'))
      // log('offsetY:', offsetY)
    }

    // Find optional transition speed
    let transitionSpeed: number = 600
    if (this.$el.attr('data-transition-speed')) {
      transitionSpeed = parseInt(this.$el.attr('data-transition-speed'))
    }

    // Find target strategy
    if (this.$el.attr('data-target-selector')) { // Scroll to position by CSS selector
      const targetSelector: string = this.$el.attr('data-target-selector')
      const $target: any = $(targetSelector) // jQuery element
      if ($target.length === 0) {
        throw new Error('Cannot find target selector: [' + targetSelector + '].')
      } else {
        const targetOffset: any = $target.first().offset()
        // log('targetOffset:', targetOffset)
        const positionY: number = targetOffset.top + ((offsetY) ? offsetY : 0)
        this.scrollAction(positionY, transitionSpeed)
      }
    } else if (this.$el.attr('data-target-position')) { // Scroll to position by y-index value
      const positionY: number = parseInt(this.$el.attr('data-target-position')) + ((offsetY) ? offsetY : 0)
      this.scrollAction(positionY, transitionSpeed)
    } else {
      throw new Error('ScrollTo target unspecified.')
    }
  }

  private scrollAction(positionY: number, transitionSpeed: number): void {
    // log('scrollAction triggered. positionY:', positionY)
    const scrollTopValue: string = positionY + 'px'
    $('html, body').animate({
      scrollTop: scrollTopValue,
    }, transitionSpeed)
  }
}
