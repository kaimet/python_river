/*
Pseudorandom number generators

https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
https://github.com/bryc/code/blob/master/jshash/PRNGs.md


Usage:

<script src="prng.js"></script>
var seed = cyrb128("apples");
var rnd = mulberry32(seed[0]);
var x = rnd(); // in a range [0; 1]

*/


// Generators ================================


// sfc32 (Simple Fast Counter)
// sfc32 is part of the PractRand random number testing suite (which it passes of course). sfc32 has a 128-bit state and is very fast in JS.

function sfc32(a, b, c, d) {
    return function() {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0; 
      var t = (a + b) | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
}



// Mulberry32 is a simple generator with a 32-bit state, but is extremely fast and has good quality randomness (author states it passes all tests of gjrand testing suite and has a full 232 period, but I haven't verified).
// I would recommend this if you just need a simple but decent PRNG and don't need billions of random numbers (see Birthday problem).

function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}



// As of May 2018, xoshiro128** is the new member of the Xorshift family, by Vigna & Blackman (professor Vigna was also responsible for the Xorshift128+ algorithm powering most Math.random implementations under the hood). It is the fastest generator that offers a 128-bit state.
// The authors claim it passes randomness tests well (albeit with caveats). Other researchers have pointed out that it fails some tests in TestU01 (particularly LinearComp and BinaryRank). In practice, it should not cause issues when floats are used (such as in these implementations), but may cause issues if relying on the raw lowest order bit.

function xoshiro128ss(a, b, c, d) {
    return function() {
        var t = b << 9, r = a * 5; r = (r << 7 | r >>> 25) * 9;
        c ^= a; d ^= b;
        b ^= c; a ^= d; c ^= t;
        d = d << 11 | d >>> 21;
        return (r >>> 0) / 4294967296;
    }
}



// JSF (Jenkins' Small Fast)
//This is JSF or 'smallprng' by Bob Jenkins (2007), who also made ISAAC and SpookyHash. It passes PractRand tests and should be quite fast, although not as fast as sfc32.

function jsf32(a, b, c, d) {
    return function() {
        a |= 0; b |= 0; c |= 0; d |= 0;
        var t = a - (b << 27 | b >>> 5) | 0;
        a = b ^ (c << 17 | c >>> 15);
        b = c + d | 0;
        c = d + t | 0;
        d = a + t | 0;
        return (d >>> 0) / 4294967296;
    }
}




// Seeds ====================================

// hash functions are very good at generating seeds from short strings. A good hash function will generate very different results even when two strings are similar, so you don't have to put much thought into the string. Here's an example hash function:

function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
}
// Calling cyrb128 will produce a 128-bit hash value from a string which can be used to seed a PRNG. 

/* Here's how you might use it:

// Create cyrb128 state:
var seed = cyrb128("apples");
// Four 32-bit component hashes provide the seed for sfc32.
var rand = sfc32(seed[0], seed[1], seed[2], seed[3]);

// Only one 32-bit component hash is needed for mulberry32.
var rand = mulberry32(seed[0]);

// Obtain sequential random numbers like so:
rand();
rand();
*/


