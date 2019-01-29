'use strict'

module.exports = {
  randomString (length, alphabet) {
    const buffer = []

    length = length || 10
    alphabet = alphabet || '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'

    while (length) {
      const r = (Math.random() * alphabet.length) | 0
      buffer.push(alphabet.charAt(r))
      length -= 1
    }

    return buffer.join('')
  }
}
