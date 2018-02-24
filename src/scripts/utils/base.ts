// import { forEach } from 'lodash'
import * as Bows from 'bows'
const log = Bows('Utils')

export class Utils {
  constructor() { }

  public static getParameterByName(name: string, url: string): string {
    name = name.replace(/[\[\]]/g, "\\$&")
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)")
    const results = regex.exec(url)

    if (!results) {
        return ''
    } else if (!results[2]) {
        return ''
    } else {
        return decodeURIComponent(results[2].replace(/\+/g, " "))
    }
  }
}
