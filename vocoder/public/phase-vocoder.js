/**
 * > Transformations of frequency domain information
 *
 * This module is a collection of functions to work with spectrum of a signal
 *
 * Before we do anything in the field of spectral modeling, we must be able to
 * competently compute the spectrum of a signal. The spectrum is given by
 * the Fourier transform of a signal, but in virtually all cases, the result
 * from the DFT has to be converted into polar coordinates in order to permit
 * the desired modifications in an appropriate way as magnitudes and phases
 *
 * [![npm install dsp-spectrum](https://nodei.co/npm/dsp-spectrum.png?mini=true)](https://npmjs.org/package/dsp-spectrum/)
 *
 * This module contains function to work with the result of a DFT (or FFT),
 * the signal in the frequency domain.
 *
 * This is part of [dsp-kit](https://github.com/oramics/dsp-kit)
 *
 * ### References
 * - Polar notation: http://www.dspguide.com/ch8/8.htm
 *
 * @example
 * const dsp = require('dsp-kit')
 * dsp.spectrum(dft.fft(signal))
 *
 * @module spectrum
 */
const { sqrt, PI, cos, sin, atan2 } = Math
const PI2 = 2 * PI

// get a number modulo PI2 (taking care of negatives)
function phmod (ph) { return ph < 0 ? PI2 + (ph % PI2) : ph % PI2 }

/**
 * Get band width of a result of a fourier transformation
 *
 * It calculates the size of each _bin_ of the spectrum in Hertzs.
 * @param {Integer} size - the DFT (or FFT) buffer size
 * @param {Integer} sampleRate - the sample rate of the original signal
 * @return {Number} the frequency width of each bin
 */
function bandWidth (size, sampleRate) {
  return 2 / size * sampleRate / 2
}

/**
 * Calculates the center frequency of an DFT band (or bin)
 *
 * @param {Integer} index The index of the FFT band.
 * @param {Integer} size - the DFT (or FFT) buffer size
 * @param {Integer} sampleRate - the sample rate of the original signal
 * @return {Number} the center frequency of the DFT band
 *
 * @returns The middle frequency in Hz.
 */
function bandFrequency (index, size, sampleRate) {
  const width = bandWidth(size, sampleRate)
  return width * index + width / 2
}

/**
 * Convert a signal in frequency domain from rectangular `{ real, imag }` to
 * polar form `{ magnitudes, phases }`
 *
 * It returns an object with two arrays: `{ magnitures: <Array>, phases: <Array> }`
 * If not provided, the magnitudes and phases lengths will be the same as the
 * real and imaginary parts (you can remove calculations by providing arrays
 * of `length = (N / 2) + 1` in real signals because the symetric properties)
 *
 * @param {Object} freqDomain - the frequency domain data in rectangular notation
 * @param {Object} output - (Optional) the buffers to store the data in polar form
 * if you want to reuse buffers for performance reasons
 * @return {Array} the frequency domain data in polar notation: an object
 * with the form: `{ magnitudes: <Array>, phases: <Array> }`
 *
 * @example
 * const dsp = require('dsp-kit')
 * dsp.polar(dsp.fft(signal)).magnitudes
 */
function polar (result, output) {
  const { real, imag } = result
  const len = real.length
  if (!output) output = { magnitudes: zeros(len), phases: zeros(len) }
  const { magnitudes, phases } = output
  const limit = Math.min(len, magnitudes.length)
  let rval, ival
  for (let i = 0; i < limit; i++) {
    rval = real[i]
    ival = imag[i]
    if (magnitudes) magnitudes[i] = sqrt(rval * rval + ival * ival)
    if (phases) phases[i] = atan2(ival, rval)
  }
  return output
}

/**
 * > Array manipulation functions
 *
 * This module contains helper functions to work with arrays (usually typed arrays,
 * but not required).
 *
 * This module accepts the premise that explicit is better than implicit.
 * For this reason:
 * - The first parameter of all the functions is the number of samples to process.
 * - The last parameter of all modifyng functions is the array to use as output
 * allowing _explicit_ in-place modification
 *
 * [![npm install dsp-array](https://nodei.co/npm/dsp-array.png?mini=true)](https://npmjs.org/package/dsp-array/)
 *
 * This is part of [dsp-kit](https://github.com/oramics/dsp-kit)
 *
 * @example
 * var array = require('dsp-array')
 * const sine = array.fill(1024, (x) => Math.sin(0.5 * x))
 *
 * @example
 * // included in dsp-kit package
 * var dsp = require('dsp-kit')
 * dsp.fill(...)
 *
 * @module array
 */

/**
 * Create a typed array (a Float64Array) filled with zeros
 *
 * @param {Integer} size
 * @return {Array} the array
 */
function zeros (size) { return new Float64Array(size) }

/**
 * Fill an array using a function
 *
 * @param {Number|Array} array - The array (to reuse) or an array length to create one
 * @param {Function} fn - the generator function. It receives the following parameters:
 *
 * - n: a number from [0..1]
 * - index: a number from [0...length]
 * - length: the array length
 *
 * @example
 * const sine = array.fill(10, (x) => Math.sin(x))
 */
function fill (N, fn, output) {
  if (arguments.length < 3) output = zeros(N)
  for (let n = 0; n < N; n++) output[n] = fn(n, N)
  return output
}

/**
 * Concatenate two arrays
 * @param {Array} arrayA
 * @param {Array} arrayB
 * @param {Array} destination - (Optional) If provided, the length must be
 * _at least_ the sum of the arrayA and arrayB length plus the destOffset
 * @return {Array} destination
 * @example
 * // concat into a new array
 * const arrayC = array.concat(arrayA, arrayB)
 */
function concat (a, b, dest = null, offset = 0) {
  const al = a.length
  const bl = b.length
  if (dest === null) dest = zeros(al + bl + offset)
  for (let i = 0; i < al; i++) dest[i + offset] = a[i]
  for (let i = 0; i < bl; i++) dest[i + al + offset] = b[i]
  return dest
}

/**
 * Add elements from two arrays. Can work in-place
 *
 * @param {Integer} numberOfSamples - the number of samples to add
 * @param {Array} a - one buffer to add
 * @param {Array} b - the other buffer
 * @param {Array} output - (Optional) the output buffer (or a new one if not provided)
 * @return {Array} the output buffer
 * @example
 * add(10, signalA, signalB)
 * // in-place (store the result in signalA)
 * add(10, signalA, signalB, signalA)
 */
function add (N, a, b, out) {
  out = out || zeros(N)
  for (var i = 0; i < N; i++) out[i] = a[i] + b[i]
  return out
}

/**
 * Multiply elements from two arrays. Can work in-place
 *
 * @param {Integer} numberOfSamples - the number of samples to add
 * @param {Array} a - one buffer to add
 * @param {Array} b - the other buffer
 * @param {Array} output - (Optional) the output buffer (or a new one if not provided)
 * @return {Array} the output buffer
 * @example
 * mult(10, signalA, signalB)
 * // in-place (store the result in signalA)
 * mult(10, signalA, signalB, signalA)
 */
function mult (N, a, b, out) {
  out = out || zeros(N)
  for (var i = 0; i < N; i++) out[i] = a[i] * b[i]
  return out
}

/**
 * Substract elements from two arrays. Can work in-place
 *
 * @param {Integer} numberOfSamples - the number of samples to add
 * @param {Array} minuend - the buffer to substract from
 * @param {Array} subtrahend - the buffer to get the numbers to being subtracted
 * @param {Array} output - (Optional) the output buffer (or a new one if not provided)
 * @return {Array} the output buffer
 * @example
 * var signalA = [3, 3, 3, 3]
 * var signalB = [0, 1, 2, 3]
 * substr(10, signalA, signalB) // => [3, 2, 1, 0]
 * // in-place (store the result in signalA)
 * substr(10, signalA, signalB, signalA) // => signalA contains the result
 */
function substr (N, a, b, out) {
  out = out || zeros(N)
  for (var i = 0; i < N; i++) out[i] = a[i] - b[i]
  return out
}

const isSame = Object.is
/**
 * Round the values of an array to a number of decimals.
 *
 * There are small differences of precission between algorithms. This helper
 * function allows to compare them discarding the precission errors.
 *
 * @function
 * @param {Array} array
 * @param {Integer} decimals - (Optional) the number of decimals (8 by default)
 */
const round = roundTo(8)

/**
 * Create a function that rounds to the given decimals
 * @param {Integer} decimals - The number of decimals
 * @return {Function} a function
 * @see round
 */
function roundTo (dec) {
  return function round (arr, n = dec, output) {
    const size = arr.length
    if (!output) output = new Float64Array(size)
    const limit = Math.min(size, output.length)
    const m = Math.pow(10, n)
    for (let i = 0; i < limit; i++) {
      const r = Math.round(arr[i] * m) / m
      output[i] = isSame(r, -0) ? 0 : r
    }
    return output
  }
}

/**
 * Test if the N first elements of an array is true for a given predicate
 *
 * @param {Integer} N - the number of elements to test
 * @param {Function} predicate - a function that receive an element of the
 * array and should return true or false
 * @param {Array} array - the array
 * @return {Boolean}
 *
 * @example
 * var signal = [1, 1, 1, 2, 2, 2]
 * testAll(3, signal, (x) => x === 1) // => true
 * testAll(4, signal, (x) => x === 1) // => false
 */
function testAll (N, fn, array) {
  for (var i = 0; i < N; i++) {
    if (!fn(array[i])) return false
  }
  return true
}
function recalcPhases (frames, { size, hop, factor, sampleRate }, omega) {
  const original = hop / sampleRate
  const modified = (hop * factor) / sampleRate

  const numFrames = frames.length
  for (let i = 2; i < numFrames; i++) {
    const prev = frames[i - 1]
    const current = frames[i]
    // for each frame, update each bin
    for (let bin = 0; bin < size; bin++) {
      // calculate the difference between phases
      const deltaPhi = current.phases[bin] - prev.phases[bin]
      // get the current band frequency
      const freq = omega[bin]
      // calculate the frequency deviation with the given hop size
      const deltaFreq = (deltaPhi / original) - freq
      // wrap the deviation
      var wrappedDeltaFreq = ((deltaFreq + PI) % PI2) - PI
      // and calculate the real frequency
      var realFreq = freq + wrappedDeltaFreq
      // update the phase
      current.phases[bin] = prev.phases[bin] + modified * realFreq
    }
  }
}

/**
 * Synthesize a signal from a collection of frames
 * @private
 * @param {Array<Object>} frames - an array of frames (`{ magnitudes, phases }`)
 * @param {Object} options - All required: size, hop, sampeRate, factor
 * @param {Array} output - (Optional) the output array
 */
function synthesis (frames, { ft, size, hop, sampleRate, factor }, output) {
  if (!frames || !frames.length) throw Error('"frames" parameter is required in synthesis')

  var len = frames.length
  var hopS = hop * factor
  if (!output) output = zeros(len * hopS + size)
  var position = 0

  // create some intermediate buffers (and reuse it for performance)
  var rectFD = { real: zeros(size), imag: zeros(size) }
  var timeDomain = { real: zeros(size), imag: zeros(size) }
  for (var i = 0; i < len; i++) {
    // 1. Convert freq-domain from polar to rectangular
    rectangular(frames[i], rectFD)
    // 2. Convert from freq-domain in rectangular to time-domain
    var signal = ft.inverse(rectFD, timeDomain).real
    // 3. Unshift the previous cycling shift
    ifftshift(signal)
    // 4. Overlap add
    var write = output.subarray(position, position + hopS)
    add(hopS, signal, write, write)
    position += hopS
  }
  return output
}


/**
 * Given a spectrum in rectangular form (`{ magnitudes, phases }`) convert
 * into a spectrum in polar form (`{ real, imag }`).
 *
 * This is the inverse operation of `polar` function
 * @see polar
 */
function rectangular (spectrum, complex) {
  const { magnitudes, phases } = spectrum
  const size = magnitudes.length
  if (!complex) complex = { real: zeros(size), imag: zeros(size) }
  const { real, imag } = complex
  const limit = Math.min(size, real.length)
  for (let i = 0; i < limit; i++) {
    real[i] = magnitudes[i] * cos(phases[i])
    imag[i] = magnitudes[i] * sin(phases[i])
  }
  return complex
}

/**
 * Perfroms a phase-unwrapping of a phase data
 * @param {Array} data - phase data
 * @param {Array} output - (Optional) the output array to store the unrapped
 * phase data (or a new array will be created if not provided)
 * @return {Array} the unrapped phase data
 *
 * @example
 * // get the spectrum of a 1024 size signal fragment
 * const spectrum = dsp.spectrum(dsp.fft(1024, signal))
 * // unwrap the phases
 * const unwrapped = dsp.unwrap(spectrum.phases)
 */
function unwrap (data, output) {
  const size = data.length
  if (!output) output = zeros(size)

  let shift = 0
  let prev = output[0] = phmod(data[0])
  for (let i = 1; i < size; i++) {
    const current = phmod(data[i])
    const diff = current - prev
    if (diff < -PI) shift += PI2
    else if (diff > PI) shift -= PI2
    output[i] = current + shift
    prev = current
  }
  return output
}

const random = Math.random

/**
 * Set random phases of a collection of frames
 * @private
 */
function randomPhases (frames, { size }) {
  for (var n = 0; n < frames.length; n++) {
    var phases = frames[n].phases
    for (var i = 0; i < size; i++) {
      phases[i] = PI2 * random()
    }
  }
}
/**
 *
 */
function analysis (signal, { size, hop, windowFn = () => 1, ft = fft(size) }) {

  var numFrames = Math.floor((signal.length - size) / hop)
  var window = fill(size, windowFn)

  // create an array to store all frames
  var frames = new Array(numFrames)

  // create some intermediate buffers (frame and frame in freq domain)
  var frame = zeros(size)
  var fdFrame = { real: zeros(size), imag: zeros(size) }
  for (var i = 0; i < numFrames; i++) {
    frame.set(signal.subarray(i * hop, i * hop + size))
    // 1. place a window into the signal
    mult(size, window, frame, frame)
    // 3. Cyclic shift to phase zero windowing
    fftshift(frame) // => centered
    // 4. Perform the forward fft
    ft.forward(frame, fdFrame)
    // 5. Convert to polar form in a new frame
    frames[i] = polar(fdFrame)
  }
  return frames
}

/**
 * > Cyclic rotation for phase-zero windowing
 *
 * [![npm install dsp-fftshift](https://nodei.co/npm/dsp-fftshift.png?mini=true)](https://npmjs.org/package/dsp-fftshift/)
 *
 * This is part of [dsp-kit](https://github.com/oramics/dsp-kit)
 *
 * @example
 * var shift = require('dsp-fftshift')
 * shift.fftshift(signal)
 * shift.ifftshift(signal)
 *
 * @example
 * // ES6 syntax
 * import { fftshift, ifftshift } from 'dsp-fftshift'
 * fftshift(signal)
 *
 * @example
 * // included in dsp-kit package
 * var dsp = require('dsp-kit')
 * dsp.fftshift(signal)
 * dsp.ifftshift(signal)
 *
 * @module fftshift
 */

/**
 * Rotate a buffer in place
 *
 * from: http://stackoverflow.com/questions/876293/fastest-algorithm-for-circle-shift-n-sized-array-for-m-position
 *
 * @param {Array} source - the buffer to rotate
 * @param {Number} rotations - the number of rotations
 * @private
 */
function rotate (src, n) {
  var len = src.length
  reverse(src, 0, len)
  reverse(src, 0, n)
  reverse(src, n, len)
  return src
}
function reverse (src, from, to) {
  --from
  while (++from < --to) {
    var tmp = src[from]
    src[from] = src[to]
    src[to] = tmp
  }
}

/**
 * Zero-phase windowing alignment
 *
 * __CAUTION__: this function mutates the array
 *
 * Perform a cyclic shifting (rotation) to set the first sample at the middle
 * of the buffer (it reorder buffer samples from (0:N-1) to [(N/2:N-1) (0:(N/2-1))])
 *
 * Named by the same function in mathlab: `fftshift`
 *
 * @param {Array} buffer
 * @return {Array} the same buffer (with the data rotated)
 */
function fftshift (src) {
  const len = src.length
  return rotate(src, Math.floor(len / 2))
}

/**
 * Inverse of zero-phase windowing alignment
 *
 * __CAUTION__: this function mutates the array
 *
 * @see fftshift
 * @param {Array} buffer
 * @return {Array} the same buffer (with the data rotated)
 */
function ifftshift (src) {
  const len = src.length
  return rotate(src, Math.floor((len + 1) / 2))
}

/**
 * > Fast fourier transform using radix-2 Cooley-Tukey algorithm
 *
 * [![npm install dsp-fft-radix2](https://nodei.co/npm/dsp-fft-radix2.png?mini=true)](https://npmjs.org/package/dsp-fft-radix2/)
 *
 * This module have functions to compute a Fast Fourier transform either
 * in forward and inverse versions. The code is adapted from the unmaintained
 * [dsp.js](https://github.com/corbanbrook/dsp.js) library.
 *
 * This is part of [dsp-kit](https://github.com/oramics/dsp-kit)
 *
 * @example
 * var fftRadix2 = require('dsp-fft-radix2')
 * var ft = fftRadix2(1024)
 * ft.forward(signal)
 * ft.inverse(signal)
 *
 * @module fft-radix2
 */
// Checks if a number is a power of two
// https://github.com/mikolalysenko/bit-twiddle/blob/master/twiddle.js#L41
function isPow2 (v) { return !(v & (v - 1)) && (!!v) }

/**
 * Create a Fast Fourier Transform functions
 *
 * It returns an object with two funtions: forward and inverse.
 * Both accepts a signal and (optionally) an output buffer to store the
 * results (to reduce memory allocation).
 *
 * @param {Integer} size - the FFT size
 * @return {Object<forward, inverse>} fourier transform functions
 *
 * @example
 * var fftRadix2 = require('dsp-fft-radix2')
 * var ft = fftRadix2(1024)
 * // Given a signal (a Float32Array) ...
 * output = { real: new Float32Array(1024), imag: new Float32Array(1024) }
 * ft.forward(signal, output)
 * // it's invertible
 * ft.inverse(output).real === signal
 */
function fft (size) {
  var cached = tables(size)
  return {
    forward: (input, output) => process(1, cached, input, output),
    inverse: (input, output) => process(-1, cached, input, output)
  }
}

function process (dir, tables, input, output) {
  const { size, cosTable, sinTable, reverseTable } = tables

  if (!input.real) input = { real: input, imag: new Float32Array(size) }
  const rs = input.real
  const is = input.imag
  if (rs.length !== size) throw Error('Real buffer length must be ' + size + ' but was ' + rs.length)
  if (is.length !== size) throw Error('Imag buffer length must be ' + size + ' but was ' + is.length)

  if (!output) output = { real: new Float32Array(size), imag: new Float32Array(size) }
  const { real, imag } = output

  let i
  for (i = 0; i < size; i++) {
    real[i] = rs[reverseTable[i]]
    imag[i] = dir * is[reverseTable[i]]
  }

  let phaseShiftStepReal, phaseShiftStepImag, currentPhaseShiftReal, currentPhaseShiftImag
  let off, tr, ti, tmpReal
  let halfSize = 1
  while (halfSize < size) {
    phaseShiftStepReal = cosTable[halfSize]
    phaseShiftStepImag = sinTable[halfSize]
    currentPhaseShiftReal = 1
    currentPhaseShiftImag = 0

    for (let fftStep = 0; fftStep < halfSize; fftStep++) {
      i = fftStep

      while (i < size) {
        off = i + halfSize
        tr = (currentPhaseShiftReal * real[off]) - (currentPhaseShiftImag * imag[off])
        ti = (currentPhaseShiftReal * imag[off]) + (currentPhaseShiftImag * real[off])

        real[off] = real[i] - tr
        imag[off] = imag[i] - ti
        real[i] += tr
        imag[i] += ti

        i += halfSize << 1
      }

      tmpReal = currentPhaseShiftReal
      currentPhaseShiftReal = (tmpReal * phaseShiftStepReal) - (currentPhaseShiftImag * phaseShiftStepImag)
      currentPhaseShiftImag = (tmpReal * phaseShiftStepImag) + (currentPhaseShiftImag * phaseShiftStepReal)
    }

    halfSize = halfSize << 1
  }

  if (dir === -1) {
    // normalize
    for (i = 0; i < size; i++) {
      real[i] /= size
      imag[i] /= size
    }
  }

  return output
}

function tables (size) {
  if (!isPow2(size)) throw Error('Size must be a power of 2, and was: ' + size)
  let reverseTable = new Uint32Array(size)
  let sinTable = new Float64Array(size)
  let cosTable = new Float64Array(size)
  let limit = 1
  let bit = size >> 1

  while (limit < size) {
    for (let i = 0; i < limit; i++) {
      reverseTable[i + limit] = reverseTable[i] + bit
    }
    limit = limit << 1
    bit = bit >> 1
  }

  for (let i = 0; i < size; i++) {
    sinTable[i] = Math.sin(-Math.PI / i)
    cosTable[i] = Math.cos(-Math.PI / i)
  }
  return { size, reverseTable, sinTable, cosTable }
}

/**
 * The Hanning window (one of a family of ‘raised cosine’ windows) is also known
 * as ‘Hann window’. Do not confuse it with the ‘Hamming’ window.
 *
 * - Smooth transition to zero at window endpoints
 * - Roll-off is asymptotically -18 dB per octave
 * - First side lobe is -31dB relative to main-lobe peak
 */
const hanning = () => (n, N) => {
  const z = (PI2 * n) / (N - 1)
  return 0.5 * (1 - cos(z))
}

/*
 * The Hamming window is the simplest example of a family of windows that are
 * constructed as a weighted sum of a constant term and some cosine terms. Do
 * not confuse it with the ‘Hanning’ window.
 *
 * - Discontinuous ``slam to zero'' at endpoints
 * - Roll-off is asymptotically -6 dB per octave
 * - Side lobes are closer to ``equal ripple''
 * - First side lobe is 41dB down = 10dB better than Hann
*/
const hamming = () => (n, N) => {
  const z = (PI2 * n) / (N - 1)
  return 0.54 - 0.46 * cos(z)
}

const blackman = (a) => (n, N) => {
  const z = (PI2 * n) / (N - 1)
  return (1 - a) / 2 - 0.5 * cos(z) + a * cos(2 * z) / 2
}

/**
 * The Blackman-Harris window is one of a family of window functions given by a
 * sum of cosine terms. By varying the number and coefficients of the terms
 * different characteristics can be optimized.
*/
const blackmanHarris = () => (n, N) => {
  var z = (PI2 * n) / (N - 1)
  return 0.35875 - 0.48829 * cos(z) + 0.14128 * cos(2 * z) - 0.01168 * cos(3 * z)
}

/**
 * > Phase-vocoder timestretch algorithm
 *
 * Time stretching means altering the duration of a signal without changing its pitch
 *
 * [![npm install dsp-phase-vocoder](https://nodei.co/npm/dsp-phase-vocoder.png?mini=true)](https://npmjs.org/package/dsp-phase-vocoder/)
 *
 * A short-time Fourier transform (STFT) is performed on a windowed time-domain
 * real signal to obtain a succession of overlapped spectral frames with minimal
 * side-band effects (analysis stage). The time delay at which every spectral
 * frame is picked up from the signal is called the hop size.
 *
 * The timedomain signal may be rebuilt by performing an inverse FastFourier
 * transform on all frames followed by a successive accumulation of all frames
 * (an operation termed overlap-add)
 *
 * Knowing the modulus of every bin is not enough: the phase information is
 * necessary for a perfect recovery of a signal without modification.
 * Furthermore the phase information allows an evaluation of ’instantaneous
 * frequencies’ by the measure of phases between two frames
 *
 * The essential idea is to build two functions (analyze and
 * synthesize) which are intended to work as a tightly coupled set. Between
 * these two function calls, however, any number of manipulations can be
 * performed to obtain the desired effects
 *
 * This is part of [dsp-kit](https://github.com/oramics/dsp-kit)

 *
 * ### References
 *
 * - https://github.com/echo66/time-stretch-wac-article/blob/master/ts-ps-wac.pdf
 * - https://www.spsc.tugraz.at/sites/default/files/Bachelor%20Thesis%20Gruenwald.pdf
 * - http://www.cs.princeton.edu/courses/archive/spr09/cos325/Bernardini.pdf
 *
 * @example
 * var dsp = require('dsp-kit')
 *
 *
 * @module phase-vocoder
 */

let sent = 0;
let self = null;
/**
 * Implements a standard phase vocoder timestretch algorithm. It returns a
 * function that process the data.
 */
function phaseVocoder ({
  algorithm = 'phase-vocoder',
  size = 4096,
  hop = size * 0.5,
  sampleRate = 44100,
  windowFn = hanning()
} = {}) {
  // a lookup table of bin center frecuencies
  var omega = fill(size, (x) => bandFrequency(x, size, sampleRate))
  var ft = fft(size)

  return function stretch (factor, signal, output, timeFreqProccessing) {
    var frames = analysis(signal, { ft, size, hop, windowFn })
    if (timeFreqProccessing) timeFreqProccessing(frames, { size, hop, sampleRate })
    if (algorithm === 'phase-vocoder') recalcPhases(frames, { size, factor, hop }, omega)
    else if (algorithm === 'paul-stretch') randomPhases(frames, size)
    return synthesis(frames, { ft, size, hop, factor, sampleRate }, output)
  }
}


/**
 * Implements the paul stretch algorithm for extreme timestretching
 */
function paulStretch ({ size = 512, hop = 125, sampleRate = 44100 } = {}) {
  return function stretch (factor, signal) {
    var frames = analysis(signal, { size, hop })
    randomPhases(frames, size)
    return synthesis(frames, { size, hop, factor, sampleRate })
  }
}

let time = new Date().toLocaleTimeString();
let count = 0;
const pv = phaseVocoder({size: 64, sampleRate:48000});
class PhaseVocoder extends AudioWorkletProcessor {
  // Custom AudioParams can be defined with this static getter.
  static get parameterDescriptors() {
    return [{ name: "gain", defaultValue: 1 }];
  }
  constructor() {
    super();
    self = this;
  }
  process(inputs, outputs, parameters) {
    count ++;
    if (time !== new Date().toLocaleTimeString()) {
      console.log(count);
      time = new Date().toLocaleTimeString();
      count = 0;
    }
    const input = inputs[0];
    const output = outputs[0];
    for (let channel = 0; channel < input.length; ++channel) {
      const inputChannel = input[channel];
      const outputChannel = output[channel];

    
      pv(2, inputChannel, outputChannel)
    }
  sent ++;
    return true;
  }
}

registerProcessor("phase-vocoder", PhaseVocoder);
