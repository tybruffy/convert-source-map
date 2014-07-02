'use strict';
/*jshint asi: true */

var test = require('tap').test
  , generator = require('inline-source-map')
  , rx = require('..').commentRegex
  , mapFileRx = require('..').mapFileCommentRegex

function comment(prefix, suffix) {
  rx.lastIndex = 0;
  return rx.test(prefix + 'sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlcyI6WyJmdW5jdGlvbiBmb28oKSB7XG4gY29uc29sZS5sb2coXCJoZWxsbyBJIGFtIGZvb1wiKTtcbiBjb25zb2xlLmxvZyhcIndobyBhcmUgeW91XCIpO1xufVxuXG5mb28oKTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSJ9' + suffix)
}

// Source Map v2 Tests
test('comment regex old spec - @', function (t) {
  var validPrefixes = [
    // Source Map on it's own
    '//@ ',
    '  //@ ',
    '\t//@ ',
    // Source Map inline with code
    '///@ ',
    '}}//@ ',
    // CSS Source Map on it's own
    '/*@ ',
    '  /*@ ',
    '\t/*@ ',
    // CSS Source Map inline with code
    '//*@ ',
    '}}/*@ ',
    // Source Map V3 on it's own
    '//# ',
    '  //# ',
    '\t//# ',
    // Source Map V3 inline with code
    '///# ',
    '}}//# ',
    // CSS Source Map V3 on it's own
    '/*# ',
    '  /*# ',
    '\t/*# ',
    // CSS Source Map V3 inline with code
    '//*# ',
    '}}/*# ',    
  ];

  var invalidPrefixes = [ 
    ' @// @',
    ' @/* @',
    ' #// #',
    ' #/* #',
  ];

  var validSuffixes = [
    '',
    '\t*/',
    ' */',
  ];

  var invalidSuffixes = [
    '*/', // No space
    ' */ */',
    ' random other text',
    ' */random other text',
  ];

  // Test against valid prefixes with valid suffixes
  validPrefixes.forEach(function (prefix) {
    validSuffixes.forEach(function (suffix) {
      t.ok(comment(prefix, suffix), 'should match ' + prefix + " with suffix: " + suffix)     
    });
  });

  // Test against invalid prefixes with valid suffixes
  invalidPrefixes.forEach(function (prefix) {
    validSuffixes.forEach(function (suffix) {
      t.ok(!comment(prefix, suffix), 'should not match ' + prefix + " with suffix: " + suffix)     
    });
  }); 

  // Test against valid prefixes with invalid suffixes
  validPrefixes.forEach(function (prefix) {
    invalidSuffixes.forEach(function (suffix) {
      t.ok(!comment(prefix, suffix), 'should not match ' + prefix + " with suffix: " + suffix)     
    });
  }); 

  // Test against invalid prefixes with invalid suffixes
  invalidPrefixes.forEach(function (prefix) {
    invalidSuffixes.forEach(function (suffix) {
      t.ok(!comment(prefix, suffix), 'should not match ' + prefix + " with suffix: " + suffix)     
    });
  }); 

  t.end()
})

function mapFileComment(s) {
  mapFileRx.lastIndex = 0;
  return mapFileRx.test(s + 'sourceMappingURL=foo.js.map')
}

test('mapFileComment regex old spec - @', function (t) {
  [ '//@ '
  , '  //@ '
  , '\t//@ '
  ].forEach(function (x) { t.ok(mapFileComment(x), 'matches ' + x) });

  [ '///@ ' 
  , '}}//@ '
  , ' @// @'
  ].forEach(function (x) { t.ok(!mapFileComment(x), 'does not match ' + x) })
  t.end()
})

test('mapFileComment regex new spec - #', function (t) {
  [ '//# '
  , '  //# '
  , '\t//# '
  ].forEach(function (x) { t.ok(mapFileComment(x), 'matches ' + x) });

  [ '///# ' 
  , '}}//# '
  , ' #// #'
  ].forEach(function (x) { t.ok(!mapFileComment(x), 'does not match ' + x) })
  t.end()
})

function mapFileCommentWrap(s1, s2) {
  mapFileRx.lastIndex = 0;
  return mapFileRx.test(s1 + 'sourceMappingURL=foo.js.map' + s2)
}

test('mapFileComment regex /* */ old spec - @', function (t) {
  [ [ '/*@ ', '*/' ]
  , ['  /*@ ', '  */ ' ]
  , [ '\t/*@ ', ' \t*/\t ']
  ].forEach(function (x) { t.ok(mapFileCommentWrap(x[0], x[1]), 'matches ' + x.join(' :: ')) });

  [ [ '/*/*@ ', '*/' ]
  , ['}}/*@ ', '  */ ' ]
  , [ ' @/*@ ', ' \t*/\t ']
  ].forEach(function (x) { t.ok(!mapFileCommentWrap(x[0], x[1]), 'does not match ' + x.join(' :: ')) });
  t.end()
})

test('mapFileComment regex /* */ new spec - #', function (t) {
  [ [ '/*# ', '*/' ]
  , ['  /*# ', '  */ ' ]
  , [ '\t/*# ', ' \t*/\t ']
  ].forEach(function (x) { t.ok(mapFileCommentWrap(x[0], x[1]), 'matches ' + x.join(' :: ')) });

  [ [ '/*/*# ', '*/' ]
  , ['}}/*# ', '  */ ' ]
  , [ ' #/*# ', ' \t*/\t ']
  ].forEach(function (x) { t.ok(!mapFileCommentWrap(x[0], x[1]), 'does not match ' + x.join(' :: ')) });
  t.end()
})
