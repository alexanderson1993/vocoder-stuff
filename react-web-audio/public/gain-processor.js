/**
 * Bit twiddling hacks for JavaScript.
 *
 * Author: Mikola Lysenko
 *
 * Ported from Stanford bit twiddling hack library:
 *    http://graphics.stanford.edu/~seander/bithacks.html
 */

const twiddle = {};
//Number of bits in an integer
twiddle.INT_BITS = 32;

//Constants
twiddle.INT_MAX = 0x7fffffff;
twiddle.INT_MIN = -1 << (twiddle.INT_BITS - 1);

//Returns -1, 0, +1 depending on sign of x
twiddle.sign = function(v) {
  return (v > 0) - (v < 0);
};

//Computes absolute value of integer
twiddle.abs = function(v) {
  var mask = v >> (twiddle.INT_BITS - 1);
  return (v ^ mask) - mask;
};

//Computes minimum of integers x and y
twiddle.min = function(x, y) {
  return y ^ ((x ^ y) & -(x < y));
};

//Computes maximum of integers x and y
twiddle.max = function(x, y) {
  return x ^ ((x ^ y) & -(x < y));
};

//Checks if a number is a power of two
twiddle.isPow2 = function(v) {
  return !(v & (v - 1)) && !!v;
};

//Computes log base 2 of v
twiddle.log2 = function(v) {
  var r, shift;
  r = (v > 0xffff) << 4;
  v >>>= r;
  shift = (v > 0xff) << 3;
  v >>>= shift;
  r |= shift;
  shift = (v > 0xf) << 2;
  v >>>= shift;
  r |= shift;
  shift = (v > 0x3) << 1;
  v >>>= shift;
  r |= shift;
  return r | (v >> 1);
};

//Computes log base 10 of v
twiddle.log10 = function(v) {
  return v >= 1000000000
    ? 9
    : v >= 100000000
    ? 8
    : v >= 10000000
    ? 7
    : v >= 1000000
    ? 6
    : v >= 100000
    ? 5
    : v >= 10000
    ? 4
    : v >= 1000
    ? 3
    : v >= 100
    ? 2
    : v >= 10
    ? 1
    : 0;
};

//Counts number of bits
twiddle.popCount = function(v) {
  v = v - ((v >>> 1) & 0x55555555);
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
  return (((v + (v >>> 4)) & 0xf0f0f0f) * 0x1010101) >>> 24;
};

//Counts number of trailing zeros
function countTrailingZeros(v) {
  var c = 32;
  v &= -v;
  if (v) c--;
  if (v & 0x0000ffff) c -= 16;
  if (v & 0x00ff00ff) c -= 8;
  if (v & 0x0f0f0f0f) c -= 4;
  if (v & 0x33333333) c -= 2;
  if (v & 0x55555555) c -= 1;
  return c;
}
twiddle.countTrailingZeros = countTrailingZeros;

//Rounds to next power of 2
twiddle.nextPow2 = function(v) {
  v += v === 0;
  --v;
  v |= v >>> 1;
  v |= v >>> 2;
  v |= v >>> 4;
  v |= v >>> 8;
  v |= v >>> 16;
  return v + 1;
};

//Rounds down to previous power of 2
twiddle.prevPow2 = function(v) {
  v |= v >>> 1;
  v |= v >>> 2;
  v |= v >>> 4;
  v |= v >>> 8;
  v |= v >>> 16;
  return v - (v >>> 1);
};

//Computes parity of word
twiddle.parity = function(v) {
  v ^= v >>> 16;
  v ^= v >>> 8;
  v ^= v >>> 4;
  v &= 0xf;
  return (0x6996 >>> v) & 1;
};

var REVERSE_TABLE = new Array(256);

(function(tab) {
  for (var i = 0; i < 256; ++i) {
    var v = i,
      r = i,
      s = 7;
    for (v >>>= 1; v; v >>>= 1) {
      r <<= 1;
      r |= v & 1;
      --s;
    }
    tab[i] = (r << s) & 0xff;
  }
})(REVERSE_TABLE);

//Reverse bits in a 32 bit word
twiddle.reverse = function(v) {
  return (
    (REVERSE_TABLE[v & 0xff] << 24) |
    (REVERSE_TABLE[(v >>> 8) & 0xff] << 16) |
    (REVERSE_TABLE[(v >>> 16) & 0xff] << 8) |
    REVERSE_TABLE[(v >>> 24) & 0xff]
  );
};

//Interleave bits of 2 coordinates with 16 bits.  Useful for fast quadtree codes
twiddle.interleave2 = function(x, y) {
  x &= 0xffff;
  x = (x | (x << 8)) & 0x00ff00ff;
  x = (x | (x << 4)) & 0x0f0f0f0f;
  x = (x | (x << 2)) & 0x33333333;
  x = (x | (x << 1)) & 0x55555555;

  y &= 0xffff;
  y = (y | (y << 8)) & 0x00ff00ff;
  y = (y | (y << 4)) & 0x0f0f0f0f;
  y = (y | (y << 2)) & 0x33333333;
  y = (y | (y << 1)) & 0x55555555;

  return x | (y << 1);
};

//Extracts the nth interleaved component
twiddle.deinterleave2 = function(v, n) {
  v = (v >>> n) & 0x55555555;
  v = (v | (v >>> 1)) & 0x33333333;
  v = (v | (v >>> 2)) & 0x0f0f0f0f;
  v = (v | (v >>> 4)) & 0x00ff00ff;
  v = (v | (v >>> 16)) & 0x000ffff;
  return (v << 16) >> 16;
};

//Interleave bits of 3 coordinates, each with 10 bits.  Useful for fast octree codes
twiddle.interleave3 = function(x, y, z) {
  x &= 0x3ff;
  x = (x | (x << 16)) & 4278190335;
  x = (x | (x << 8)) & 251719695;
  x = (x | (x << 4)) & 3272356035;
  x = (x | (x << 2)) & 1227133513;

  y &= 0x3ff;
  y = (y | (y << 16)) & 4278190335;
  y = (y | (y << 8)) & 251719695;
  y = (y | (y << 4)) & 3272356035;
  y = (y | (y << 2)) & 1227133513;
  x |= y << 1;

  z &= 0x3ff;
  z = (z | (z << 16)) & 4278190335;
  z = (z | (z << 8)) & 251719695;
  z = (z | (z << 4)) & 3272356035;
  z = (z | (z << 2)) & 1227133513;

  return x | (z << 2);
};

//Extracts nth interleaved component of a 3-tuple
twiddle.deinterleave3 = function(v, n) {
  v = (v >>> n) & 1227133513;
  v = (v | (v >>> 2)) & 3272356035;
  v = (v | (v >>> 4)) & 251719695;
  v = (v | (v >>> 8)) & 4278190335;
  v = (v | (v >>> 16)) & 0x3ff;
  return (v << 22) >> 22;
};

//Computes next combination in colexicographic order (this is mistakenly called nextPermutation on the bit twiddling hacks page)
twiddle.nextCombination = function(v) {
  var t = v | (v - 1);
  return (t + 1) | (((~t & -~t) - 1) >>> (countTrailingZeros(v) + 1));
};

//-------------------------------------------------
// Add two complex numbers
//-------------------------------------------------
var complexAdd = function(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
};

//-------------------------------------------------
// Subtract two complex numbers
//-------------------------------------------------
var complexSubtract = function(a, b) {
  return [a[0] - b[0], a[1] - b[1]];
};

//-------------------------------------------------
// Multiply two complex numbers
//
// (a + bi) * (c + di) = (ac - bd) + (ad + bc)i
//-------------------------------------------------
var complexMultiply = function(a, b) {
  return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
};

//-------------------------------------------------
// Calculate |a + bi|
//
// sqrt(a*a + b*b)
//-------------------------------------------------
var complexMagnitude = function(c) {
  return Math.sqrt(c[0] * c[0] + c[1] * c[1]);
};

//-------------------------------------------------
// By Eulers Formula:
//
// e^(i*x) = cos(x) + i*sin(x)
//
// and in DFT:
//
// x = -2*PI*(k/N)
//-------------------------------------------------
var mapExponent = {},
  exponent = function(k, N) {
    var x = -2 * Math.PI * (k / N);

    mapExponent[N] = mapExponent[N] || {};
    mapExponent[N][k] = mapExponent[N][k] || [Math.cos(x), Math.sin(x)]; // [Real, Imaginary]

    return mapExponent[N][k];
  };

//-------------------------------------------------
// Calculate FFT Magnitude for complex numbers.
//-------------------------------------------------
var fftMag = function(fftBins) {
  var ret = fftBins.map(complexMagnitude);
  return ret.slice(0, ret.length / 2);
};

//-------------------------------------------------
// Calculate Frequency Bins
//
// Returns an array of the frequencies (in hertz) of
// each FFT bin provided, assuming the sampleRate is
// samples taken per second.
//-------------------------------------------------
var fftFreq = function(fftBins, sampleRate) {
  var stepFreq = sampleRate / fftBins.length;
  var ret = fftBins.slice(0, fftBins.length / 2);

  return ret.map(function(__, ix) {
    return ix * stepFreq;
  });
};

const fft = {
  //-------------------------------------------------
  // Calculate FFT for vector where vector.length
  // is assumed to be a power of 2.
  //-------------------------------------------------
  fft: function fft(vector) {
    var X = [],
      N = vector.length;

    // Base case is X = x + 0i since our input is assumed to be real only.
    if (N == 1) {
      if (Array.isArray(vector[0]))
        //If input vector contains complex numbers
        return [[vector[0][0], vector[0][1]]];
      else return [[vector[0], 0]];
    }

    // Recurse: all even samples
    var X_evens = fft(vector.filter(even)),
      // Recurse: all odd samples
      X_odds = fft(vector.filter(odd));

    // Now, perform N/2 operations!
    for (var k = 0; k < N / 2; k++) {
      // t is a complex number!
      var t = X_evens[k],
        e = complexMultiply(exponent(k, N), X_odds[k]);

      X[k] = complexAdd(t, e);
      X[k + N / 2] = complexSubtract(t, e);
    }

    function even(__, ix) {
      return ix % 2 == 0;
    }

    function odd(__, ix) {
      return ix % 2 == 1;
    }

    return X;
  },
  //-------------------------------------------------
  // Calculate FFT for vector where vector.length
  // is assumed to be a power of 2.  This is the in-
  // place implementation, to avoid the memory
  // footprint used by recursion.
  //-------------------------------------------------
  fftInPlace: function(vector) {
    var N = vector.length;

    var trailingZeros = twiddle.countTrailingZeros(N); //Once reversed, this will be leading zeros

    // Reverse bits
    for (var k = 0; k < N; k++) {
      var p = twiddle.reverse(k) >>> (twiddle.INT_BITS - trailingZeros);
      if (p > k) {
        var complexTemp = [vector[k], 0];
        vector[k] = vector[p];
        vector[p] = complexTemp;
      } else {
        vector[p] = [vector[p], 0];
      }
    }

    //Do the DIT now in-place
    for (var len = 2; len <= N; len += len) {
      for (var i = 0; i < len / 2; i++) {
        var w = exponent(i, len);
        for (var j = 0; j < N / len; j++) {
          var t = complexMultiply(w, vector[j * len + i + len / 2]);
          vector[j * len + i + len / 2] = complexSubtract(
            vector[j * len + i],
            t
          );
          vector[j * len + i] = complexAdd(vector[j * len + i], t);
        }
      }
    }
  }
};

let sent = 0;
class GainProcessor extends AudioWorkletProcessor {
  // Custom AudioParams can be defined with this static getter.
  static get parameterDescriptors() {
    return [{ name: "gain", defaultValue: 1 }];
  }

  constructor() {
    // The super constructor call is required.
    super();
    this.fftOutput = {
      real: new Float32Array(128),
      imag: new Float32Array(128)
    };
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    // if (sent < 10) {
    //   sent++;
    //   // this.port.postMessage(JSON.stringify(parameters));
    //   // this.port.postMessage(JSON.stringify(inputs[0][0].length));
    // }
    for (let channel = 0; channel < input.length; ++channel) {
      const inputChannel = input[channel];
      const outputChannel = output[channel];

      // if (sent === 0) {
      //   this.port.postMessage(JSON.stringify(inputChannel));
      // }
      const fftOutput = fft.fft(inputChannel);
      sent++;
      if (sent % 10 === 0) {
        this.port.postMessage(JSON.stringify({ fftOutput, sampleRate }));
      }
      // if (sent % 10 === 0) {

      //   this.port.postMessage(JSON.stringify(this.fftOutput));
      // }

      // this.port.postMessage(JSON.stringify(sent));
      for (let i = 0; i < inputChannel.length; ++i) {
        outputChannel[i] = inputChannel[i];
      }
    }

    return true;
  }
}

registerProcessor("gain-processor", GainProcessor);
