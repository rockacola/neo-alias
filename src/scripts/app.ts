import * as Bows from 'bows'
const log = Bows('App')
import { Utils } from './utils/base'
import { ScrollTo } from './components/scroll-to'
import { BackTop } from './components/back-top'
import { NodeManager } from './models/node-manager'
import { NeonProfile } from './components/neon-profile'
import { AllReport } from './components/all-report'
import { SetAliasForm } from './components/set-alias-form'
import { AliasList } from './components/alias-list'
import { CalloutBox } from './components/callout-box';

// -- Declare global variables
declare const $: any
declare const Foundation: any

class App {
  private foundationComponents = [] as any
  private customComponents = [] as any
  private nodeManager: NodeManager = new NodeManager()

  constructor() {
    log('constructor triggered.')

    // --  Init
    $('html').removeClass('no-js') // This should be conducted by Foundation 6, but some reason it is not. Explicitly remove no-js class.

    // -- Event bindings
    // $(document).on('top-nav:constructor:complete', (e) => {
    //   log('top-nav:constructor:complete triggered. e:', e)
    // })

    // -- Component bindings
    this.bindFoundationComponents()
    this.bindCustomComponents()

    // -- Event emitters
    $.event.trigger('global', { sender: 'app', subject: 'initialized', payload: {} })
  }

  // -- Private methods

  private bindFoundationComponents(): void {
    const $dropdownMenus = $('[data-dropdown-menu]')
    if ($dropdownMenus.length > 0) {
      this.foundationComponents.push(new Foundation.DropdownMenu($dropdownMenus))
    }

    const $offCanvases = $('[data-off-canvas]')
    if ($offCanvases.length > 0) {
      this.foundationComponents.push(new Foundation.OffCanvas($offCanvases))
    }
  }

  private bindCustomComponents(): void {
    const $scrollTos = $('[data-component="scroll-to"]')
    $scrollTos.each((index, el) => {
      this.customComponents.push(new ScrollTo({ $el: $(el) }))
    })

    const $backTops = $('[data-component="back-top"]')
    $backTops.each((index, el) => {
      this.customComponents.push(new BackTop({ $el: $(el) }))
    })

    const $neonProfiles = $('[data-component="neon-profile"]')
    $neonProfiles.each((index, el) => {
      this.customComponents.push(new NeonProfile({ $el: $(el), nodeManager: this.nodeManager }))
    })

    const $allReports = $('[data-component="all-report"]')
    $allReports.each((index, el) => {
      this.customComponents.push(new AllReport({ $el: $(el), nodeManager: this.nodeManager }))
    })

    const $setAliasForms = $('[data-component="set-alias-form"]')
    $setAliasForms.each((index, el) => {
      this.customComponents.push(new SetAliasForm({ $el: $(el), nodeManager: this.nodeManager }))
    })

    const $aliasLists = $('[data-component="alias-list"]')
    $aliasLists.each((index, el) => {
      this.customComponents.push(new AliasList({ $el: $(el), nodeManager: this.nodeManager }))
    })

    const $calloutBoxes = $('[data-component="callout-box"]')
    $calloutBoxes.each((index, el) => {
      this.customComponents.push(new CalloutBox({ $el: $(el), nodeManager: this.nodeManager }))
    })
  }
}

// -- Initialize The Application
$(document).ready((e) => {
  const app = new App()
})
