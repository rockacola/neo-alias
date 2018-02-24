import { debounce } from 'lodash'
import * as Bows from 'bows'
const log = Bows('NeoValidator')

// -- Declare global variables

export class NeoValidator {

  constructor() {}

  // -- Public methods

  public static isValidAddress(value: string): boolean {
    return /^([a][a-z0-9]{33})$/i.test(value)
  }

  public static isValidWif(value: string): boolean {
    return /^([a-z0-9]{52})$/i.test(value)
  }

  public static isValidAlias(value: string): boolean {
    return /^([a-z0-9._]{3,})$/i.test(value)
  }
}
