(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* big.js v3.1.3 https://github.com/MikeMcl/big.js/LICENCE */
;(function (global) {
    'use strict';

/*
  big.js v3.1.3
  A small, fast, easy-to-use library for arbitrary-precision decimal arithmetic.
  https://github.com/MikeMcl/big.js/
  Copyright (c) 2014 Michael Mclaughlin <M8ch88l@gmail.com>
  MIT Expat Licence
*/

/***************************** EDITABLE DEFAULTS ******************************/

    // The default values below must be integers within the stated ranges.

    /*
     * The maximum number of decimal places of the results of operations
     * involving division: div and sqrt, and pow with negative exponents.
     */
    var DP = 20,                           // 0 to MAX_DP

        /*
         * The rounding mode used when rounding to the above decimal places.
         *
         * 0 Towards zero (i.e. truncate, no rounding).       (ROUND_DOWN)
         * 1 To nearest neighbour. If equidistant, round up.  (ROUND_HALF_UP)
         * 2 To nearest neighbour. If equidistant, to even.   (ROUND_HALF_EVEN)
         * 3 Away from zero.                                  (ROUND_UP)
         */
        RM = 1,                            // 0, 1, 2 or 3

        // The maximum value of DP and Big.DP.
        MAX_DP = 1E6,                      // 0 to 1000000

        // The maximum magnitude of the exponent argument to the pow method.
        MAX_POWER = 1E6,                   // 1 to 1000000

        /*
         * The exponent value at and beneath which toString returns exponential
         * notation.
         * JavaScript's Number type: -7
         * -1000000 is the minimum recommended exponent value of a Big.
         */
        E_NEG = -7,                   // 0 to -1000000

        /*
         * The exponent value at and above which toString returns exponential
         * notation.
         * JavaScript's Number type: 21
         * 1000000 is the maximum recommended exponent value of a Big.
         * (This limit is not enforced or checked.)
         */
        E_POS = 21,                   // 0 to 1000000

/******************************************************************************/

        // The shared prototype object.
        P = {},
        isValid = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,
        Big;


    /*
     * Create and return a Big constructor.
     *
     */
    function bigFactory() {

        /*
         * The Big constructor and exported function.
         * Create and return a new instance of a Big number object.
         *
         * n {number|string|Big} A numeric value.
         */
        function Big(n) {
            var x = this;

            // Enable constructor usage without new.
            if (!(x instanceof Big)) {
                return n === void 0 ? bigFactory() : new Big(n);
            }

            // Duplicate.
            if (n instanceof Big) {
                x.s = n.s;
                x.e = n.e;
                x.c = n.c.slice();
            } else {
                parse(x, n);
            }

            /*
             * Retain a reference to this Big constructor, and shadow
             * Big.prototype.constructor which points to Object.
             */
            x.constructor = Big;
        }

        Big.prototype = P;
        Big.DP = DP;
        Big.RM = RM;
        Big.E_NEG = E_NEG;
        Big.E_POS = E_POS;

        return Big;
    }


    // Private functions


    /*
     * Return a string representing the value of Big x in normal or exponential
     * notation to dp fixed decimal places or significant digits.
     *
     * x {Big} The Big to format.
     * dp {number} Integer, 0 to MAX_DP inclusive.
     * toE {number} 1 (toExponential), 2 (toPrecision) or undefined (toFixed).
     */
    function format(x, dp, toE) {
        var Big = x.constructor,

            // The index (normal notation) of the digit that may be rounded up.
            i = dp - (x = new Big(x)).e,
            c = x.c;

        // Round?
        if (c.length > ++dp) {
            rnd(x, i, Big.RM);
        }

        if (!c[0]) {
            ++i;
        } else if (toE) {
            i = dp;

        // toFixed
        } else {
            c = x.c;

            // Recalculate i as x.e may have changed if value rounded up.
            i = x.e + i + 1;
        }

        // Append zeros?
        for (; c.length < i; c.push(0)) {
        }
        i = x.e;

        /*
         * toPrecision returns exponential notation if the number of
         * significant digits specified is less than the number of digits
         * necessary to represent the integer part of the value in normal
         * notation.
         */
        return toE === 1 || toE && (dp <= i || i <= Big.E_NEG) ?

          // Exponential notation.
          (x.s < 0 && c[0] ? '-' : '') +
            (c.length > 1 ? c[0] + '.' + c.join('').slice(1) : c[0]) +
              (i < 0 ? 'e' : 'e+') + i

          // Normal notation.
          : x.toString();
    }


    /*
     * Parse the number or string value passed to a Big constructor.
     *
     * x {Big} A Big number instance.
     * n {number|string} A numeric value.
     */
    function parse(x, n) {
        var e, i, nL;

        // Minus zero?
        if (n === 0 && 1 / n < 0) {
            n = '-0';

        // Ensure n is string and check validity.
        } else if (!isValid.test(n += '')) {
            throwErr(NaN);
        }

        // Determine sign.
        x.s = n.charAt(0) == '-' ? (n = n.slice(1), -1) : 1;

        // Decimal point?
        if ((e = n.indexOf('.')) > -1) {
            n = n.replace('.', '');
        }

        // Exponential form?
        if ((i = n.search(/e/i)) > 0) {

            // Determine exponent.
            if (e < 0) {
                e = i;
            }
            e += +n.slice(i + 1);
            n = n.substring(0, i);

        } else if (e < 0) {

            // Integer.
            e = n.length;
        }

        // Determine leading zeros.
        for (i = 0; n.charAt(i) == '0'; i++) {
        }

        if (i == (nL = n.length)) {

            // Zero.
            x.c = [ x.e = 0 ];
        } else {

            // Determine trailing zeros.
            for (; n.charAt(--nL) == '0';) {
            }

            x.e = e - i - 1;
            x.c = [];

            // Convert string to array of digits without leading/trailing zeros.
            for (e = 0; i <= nL; x.c[e++] = +n.charAt(i++)) {
            }
        }

        return x;
    }


    /*
     * Round Big x to a maximum of dp decimal places using rounding mode rm.
     * Called by div, sqrt and round.
     *
     * x {Big} The Big to round.
     * dp {number} Integer, 0 to MAX_DP inclusive.
     * rm {number} 0, 1, 2 or 3 (DOWN, HALF_UP, HALF_EVEN, UP)
     * [more] {boolean} Whether the result of division was truncated.
     */
    function rnd(x, dp, rm, more) {
        var u,
            xc = x.c,
            i = x.e + dp + 1;

        if (rm === 1) {

            // xc[i] is the digit after the digit that may be rounded up.
            more = xc[i] >= 5;
        } else if (rm === 2) {
            more = xc[i] > 5 || xc[i] == 5 &&
              (more || i < 0 || xc[i + 1] !== u || xc[i - 1] & 1);
        } else if (rm === 3) {
            more = more || xc[i] !== u || i < 0;
        } else {
            more = false;

            if (rm !== 0) {
                throwErr('!Big.RM!');
            }
        }

        if (i < 1 || !xc[0]) {

            if (more) {

                // 1, 0.1, 0.01, 0.001, 0.0001 etc.
                x.e = -dp;
                x.c = [1];
            } else {

                // Zero.
                x.c = [x.e = 0];
            }
        } else {

            // Remove any digits after the required decimal places.
            xc.length = i--;

            // Round up?
            if (more) {

                // Rounding up may mean the previous digit has to be rounded up.
                for (; ++xc[i] > 9;) {
                    xc[i] = 0;

                    if (!i--) {
                        ++x.e;
                        xc.unshift(1);
                    }
                }
            }

            // Remove trailing zeros.
            for (i = xc.length; !xc[--i]; xc.pop()) {
            }
        }

        return x;
    }


    /*
     * Throw a BigError.
     *
     * message {string} The error message.
     */
    function throwErr(message) {
        var err = new Error(message);
        err.name = 'BigError';

        throw err;
    }


    // Prototype/instance methods


    /*
     * Return a new Big whose value is the absolute value of this Big.
     */
    P.abs = function () {
        var x = new this.constructor(this);
        x.s = 1;

        return x;
    };


    /*
     * Return
     * 1 if the value of this Big is greater than the value of Big y,
     * -1 if the value of this Big is less than the value of Big y, or
     * 0 if they have the same value.
    */
    P.cmp = function (y) {
        var xNeg,
            x = this,
            xc = x.c,
            yc = (y = new x.constructor(y)).c,
            i = x.s,
            j = y.s,
            k = x.e,
            l = y.e;

        // Either zero?
        if (!xc[0] || !yc[0]) {
            return !xc[0] ? !yc[0] ? 0 : -j : i;
        }

        // Signs differ?
        if (i != j) {
            return i;
        }
        xNeg = i < 0;

        // Compare exponents.
        if (k != l) {
            return k > l ^ xNeg ? 1 : -1;
        }

        i = -1;
        j = (k = xc.length) < (l = yc.length) ? k : l;

        // Compare digit by digit.
        for (; ++i < j;) {

            if (xc[i] != yc[i]) {
                return xc[i] > yc[i] ^ xNeg ? 1 : -1;
            }
        }

        // Compare lengths.
        return k == l ? 0 : k > l ^ xNeg ? 1 : -1;
    };


    /*
     * Return a new Big whose value is the value of this Big divided by the
     * value of Big y, rounded, if necessary, to a maximum of Big.DP decimal
     * places using rounding mode Big.RM.
     */
    P.div = function (y) {
        var x = this,
            Big = x.constructor,
            // dividend
            dvd = x.c,
            //divisor
            dvs = (y = new Big(y)).c,
            s = x.s == y.s ? 1 : -1,
            dp = Big.DP;

        if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
            throwErr('!Big.DP!');
        }

        // Either 0?
        if (!dvd[0] || !dvs[0]) {

            // If both are 0, throw NaN
            if (dvd[0] == dvs[0]) {
                throwErr(NaN);
            }

            // If dvs is 0, throw +-Infinity.
            if (!dvs[0]) {
                throwErr(s / 0);
            }

            // dvd is 0, return +-0.
            return new Big(s * 0);
        }

        var dvsL, dvsT, next, cmp, remI, u,
            dvsZ = dvs.slice(),
            dvdI = dvsL = dvs.length,
            dvdL = dvd.length,
            // remainder
            rem = dvd.slice(0, dvsL),
            remL = rem.length,
            // quotient
            q = y,
            qc = q.c = [],
            qi = 0,
            digits = dp + (q.e = x.e - y.e) + 1;

        q.s = s;
        s = digits < 0 ? 0 : digits;

        // Create version of divisor with leading zero.
        dvsZ.unshift(0);

        // Add zeros to make remainder as long as divisor.
        for (; remL++ < dvsL; rem.push(0)) {
        }

        do {

            // 'next' is how many times the divisor goes into current remainder.
            for (next = 0; next < 10; next++) {

                // Compare divisor and remainder.
                if (dvsL != (remL = rem.length)) {
                    cmp = dvsL > remL ? 1 : -1;
                } else {

                    for (remI = -1, cmp = 0; ++remI < dvsL;) {

                        if (dvs[remI] != rem[remI]) {
                            cmp = dvs[remI] > rem[remI] ? 1 : -1;
                            break;
                        }
                    }
                }

                // If divisor < remainder, subtract divisor from remainder.
                if (cmp < 0) {

                    // Remainder can't be more than 1 digit longer than divisor.
                    // Equalise lengths using divisor with extra leading zero?
                    for (dvsT = remL == dvsL ? dvs : dvsZ; remL;) {

                        if (rem[--remL] < dvsT[remL]) {
                            remI = remL;

                            for (; remI && !rem[--remI]; rem[remI] = 9) {
                            }
                            --rem[remI];
                            rem[remL] += 10;
                        }
                        rem[remL] -= dvsT[remL];
                    }
                    for (; !rem[0]; rem.shift()) {
                    }
                } else {
                    break;
                }
            }

            // Add the 'next' digit to the result array.
            qc[qi++] = cmp ? next : ++next;

            // Update the remainder.
            if (rem[0] && cmp) {
                rem[remL] = dvd[dvdI] || 0;
            } else {
                rem = [ dvd[dvdI] ];
            }

        } while ((dvdI++ < dvdL || rem[0] !== u) && s--);

        // Leading zero? Do not remove if result is simply zero (qi == 1).
        if (!qc[0] && qi != 1) {

            // There can't be more than one zero.
            qc.shift();
            q.e--;
        }

        // Round?
        if (qi > digits) {
            rnd(q, dp, Big.RM, rem[0] !== u);
        }

        return q;
    };


    /*
     * Return true if the value of this Big is equal to the value of Big y,
     * otherwise returns false.
     */
    P.eq = function (y) {
        return !this.cmp(y);
    };


    /*
     * Return true if the value of this Big is greater than the value of Big y,
     * otherwise returns false.
     */
    P.gt = function (y) {
        return this.cmp(y) > 0;
    };


    /*
     * Return true if the value of this Big is greater than or equal to the
     * value of Big y, otherwise returns false.
     */
    P.gte = function (y) {
        return this.cmp(y) > -1;
    };


    /*
     * Return true if the value of this Big is less than the value of Big y,
     * otherwise returns false.
     */
    P.lt = function (y) {
        return this.cmp(y) < 0;
    };


    /*
     * Return true if the value of this Big is less than or equal to the value
     * of Big y, otherwise returns false.
     */
    P.lte = function (y) {
         return this.cmp(y) < 1;
    };


    /*
     * Return a new Big whose value is the value of this Big minus the value
     * of Big y.
     */
    P.sub = P.minus = function (y) {
        var i, j, t, xLTy,
            x = this,
            Big = x.constructor,
            a = x.s,
            b = (y = new Big(y)).s;

        // Signs differ?
        if (a != b) {
            y.s = -b;
            return x.plus(y);
        }

        var xc = x.c.slice(),
            xe = x.e,
            yc = y.c,
            ye = y.e;

        // Either zero?
        if (!xc[0] || !yc[0]) {

            // y is non-zero? x is non-zero? Or both are zero.
            return yc[0] ? (y.s = -b, y) : new Big(xc[0] ? x : 0);
        }

        // Determine which is the bigger number.
        // Prepend zeros to equalise exponents.
        if (a = xe - ye) {

            if (xLTy = a < 0) {
                a = -a;
                t = xc;
            } else {
                ye = xe;
                t = yc;
            }

            t.reverse();
            for (b = a; b--; t.push(0)) {
            }
            t.reverse();
        } else {

            // Exponents equal. Check digit by digit.
            j = ((xLTy = xc.length < yc.length) ? xc : yc).length;

            for (a = b = 0; b < j; b++) {

                if (xc[b] != yc[b]) {
                    xLTy = xc[b] < yc[b];
                    break;
                }
            }
        }

        // x < y? Point xc to the array of the bigger number.
        if (xLTy) {
            t = xc;
            xc = yc;
            yc = t;
            y.s = -y.s;
        }

        /*
         * Append zeros to xc if shorter. No need to add zeros to yc if shorter
         * as subtraction only needs to start at yc.length.
         */
        if (( b = (j = yc.length) - (i = xc.length) ) > 0) {

            for (; b--; xc[i++] = 0) {
            }
        }

        // Subtract yc from xc.
        for (b = i; j > a;){

            if (xc[--j] < yc[j]) {

                for (i = j; i && !xc[--i]; xc[i] = 9) {
                }
                --xc[i];
                xc[j] += 10;
            }
            xc[j] -= yc[j];
        }

        // Remove trailing zeros.
        for (; xc[--b] === 0; xc.pop()) {
        }

        // Remove leading zeros and adjust exponent accordingly.
        for (; xc[0] === 0;) {
            xc.shift();
            --ye;
        }

        if (!xc[0]) {

            // n - n = +0
            y.s = 1;

            // Result must be zero.
            xc = [ye = 0];
        }

        y.c = xc;
        y.e = ye;

        return y;
    };


    /*
     * Return a new Big whose value is the value of this Big modulo the
     * value of Big y.
     */
    P.mod = function (y) {
        var yGTx,
            x = this,
            Big = x.constructor,
            a = x.s,
            b = (y = new Big(y)).s;

        if (!y.c[0]) {
            throwErr(NaN);
        }

        x.s = y.s = 1;
        yGTx = y.cmp(x) == 1;
        x.s = a;
        y.s = b;

        if (yGTx) {
            return new Big(x);
        }

        a = Big.DP;
        b = Big.RM;
        Big.DP = Big.RM = 0;
        x = x.div(y);
        Big.DP = a;
        Big.RM = b;

        return this.minus( x.times(y) );
    };


    /*
     * Return a new Big whose value is the value of this Big plus the value
     * of Big y.
     */
    P.add = P.plus = function (y) {
        var t,
            x = this,
            Big = x.constructor,
            a = x.s,
            b = (y = new Big(y)).s;

        // Signs differ?
        if (a != b) {
            y.s = -b;
            return x.minus(y);
        }

        var xe = x.e,
            xc = x.c,
            ye = y.e,
            yc = y.c;

        // Either zero?
        if (!xc[0] || !yc[0]) {

            // y is non-zero? x is non-zero? Or both are zero.
            return yc[0] ? y : new Big(xc[0] ? x : a * 0);
        }
        xc = xc.slice();

        // Prepend zeros to equalise exponents.
        // Note: Faster to use reverse then do unshifts.
        if (a = xe - ye) {

            if (a > 0) {
                ye = xe;
                t = yc;
            } else {
                a = -a;
                t = xc;
            }

            t.reverse();
            for (; a--; t.push(0)) {
            }
            t.reverse();
        }

        // Point xc to the longer array.
        if (xc.length - yc.length < 0) {
            t = yc;
            yc = xc;
            xc = t;
        }
        a = yc.length;

        /*
         * Only start adding at yc.length - 1 as the further digits of xc can be
         * left as they are.
         */
        for (b = 0; a;) {
            b = (xc[--a] = xc[a] + yc[a] + b) / 10 | 0;
            xc[a] %= 10;
        }

        // No need to check for zero, as +x + +y != 0 && -x + -y != 0

        if (b) {
            xc.unshift(b);
            ++ye;
        }

         // Remove trailing zeros.
        for (a = xc.length; xc[--a] === 0; xc.pop()) {
        }

        y.c = xc;
        y.e = ye;

        return y;
    };


    /*
     * Return a Big whose value is the value of this Big raised to the power n.
     * If n is negative, round, if necessary, to a maximum of Big.DP decimal
     * places using rounding mode Big.RM.
     *
     * n {number} Integer, -MAX_POWER to MAX_POWER inclusive.
     */
    P.pow = function (n) {
        var x = this,
            one = new x.constructor(1),
            y = one,
            isNeg = n < 0;

        if (n !== ~~n || n < -MAX_POWER || n > MAX_POWER) {
            throwErr('!pow!');
        }

        n = isNeg ? -n : n;

        for (;;) {

            if (n & 1) {
                y = y.times(x);
            }
            n >>= 1;

            if (!n) {
                break;
            }
            x = x.times(x);
        }

        return isNeg ? one.div(y) : y;
    };


    /*
     * Return a new Big whose value is the value of this Big rounded to a
     * maximum of dp decimal places using rounding mode rm.
     * If dp is not specified, round to 0 decimal places.
     * If rm is not specified, use Big.RM.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     * [rm] 0, 1, 2 or 3 (ROUND_DOWN, ROUND_HALF_UP, ROUND_HALF_EVEN, ROUND_UP)
     */
    P.round = function (dp, rm) {
        var x = this,
            Big = x.constructor;

        if (dp == null) {
            dp = 0;
        } else if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
            throwErr('!round!');
        }
        rnd(x = new Big(x), dp, rm == null ? Big.RM : rm);

        return x;
    };


    /*
     * Return a new Big whose value is the square root of the value of this Big,
     * rounded, if necessary, to a maximum of Big.DP decimal places using
     * rounding mode Big.RM.
     */
    P.sqrt = function () {
        var estimate, r, approx,
            x = this,
            Big = x.constructor,
            xc = x.c,
            i = x.s,
            e = x.e,
            half = new Big('0.5');

        // Zero?
        if (!xc[0]) {
            return new Big(x);
        }

        // If negative, throw NaN.
        if (i < 0) {
            throwErr(NaN);
        }

        // Estimate.
        i = Math.sqrt(x.toString());

        // Math.sqrt underflow/overflow?
        // Pass x to Math.sqrt as integer, then adjust the result exponent.
        if (i === 0 || i === 1 / 0) {
            estimate = xc.join('');

            if (!(estimate.length + e & 1)) {
                estimate += '0';
            }

            r = new Big( Math.sqrt(estimate).toString() );
            r.e = ((e + 1) / 2 | 0) - (e < 0 || e & 1);
        } else {
            r = new Big(i.toString());
        }

        i = r.e + (Big.DP += 4);

        // Newton-Raphson iteration.
        do {
            approx = r;
            r = half.times( approx.plus( x.div(approx) ) );
        } while ( approx.c.slice(0, i).join('') !==
                       r.c.slice(0, i).join('') );

        rnd(r, Big.DP -= 4, Big.RM);

        return r;
    };


    /*
     * Return a new Big whose value is the value of this Big times the value of
     * Big y.
     */
    P.mul = P.times = function (y) {
        var c,
            x = this,
            Big = x.constructor,
            xc = x.c,
            yc = (y = new Big(y)).c,
            a = xc.length,
            b = yc.length,
            i = x.e,
            j = y.e;

        // Determine sign of result.
        y.s = x.s == y.s ? 1 : -1;

        // Return signed 0 if either 0.
        if (!xc[0] || !yc[0]) {
            return new Big(y.s * 0);
        }

        // Initialise exponent of result as x.e + y.e.
        y.e = i + j;

        // If array xc has fewer digits than yc, swap xc and yc, and lengths.
        if (a < b) {
            c = xc;
            xc = yc;
            yc = c;
            j = a;
            a = b;
            b = j;
        }

        // Initialise coefficient array of result with zeros.
        for (c = new Array(j = a + b); j--; c[j] = 0) {
        }

        // Multiply.

        // i is initially xc.length.
        for (i = b; i--;) {
            b = 0;

            // a is yc.length.
            for (j = a + i; j > i;) {

                // Current sum of products at this digit position, plus carry.
                b = c[j] + yc[i] * xc[j - i - 1] + b;
                c[j--] = b % 10;

                // carry
                b = b / 10 | 0;
            }
            c[j] = (c[j] + b) % 10;
        }

        // Increment result exponent if there is a final carry.
        if (b) {
            ++y.e;
        }

        // Remove any leading zero.
        if (!c[0]) {
            c.shift();
        }

        // Remove trailing zeros.
        for (i = c.length; !c[--i]; c.pop()) {
        }
        y.c = c;

        return y;
    };


    /*
     * Return a string representing the value of this Big.
     * Return exponential notation if this Big has a positive exponent equal to
     * or greater than Big.E_POS, or a negative exponent equal to or less than
     * Big.E_NEG.
     */
    P.toString = P.valueOf = P.toJSON = function () {
        var x = this,
            Big = x.constructor,
            e = x.e,
            str = x.c.join(''),
            strL = str.length;

        // Exponential notation?
        if (e <= Big.E_NEG || e >= Big.E_POS) {
            str = str.charAt(0) + (strL > 1 ? '.' + str.slice(1) : '') +
              (e < 0 ? 'e' : 'e+') + e;

        // Negative exponent?
        } else if (e < 0) {

            // Prepend zeros.
            for (; ++e; str = '0' + str) {
            }
            str = '0.' + str;

        // Positive exponent?
        } else if (e > 0) {

            if (++e > strL) {

                // Append zeros.
                for (e -= strL; e-- ; str += '0') {
                }
            } else if (e < strL) {
                str = str.slice(0, e) + '.' + str.slice(e);
            }

        // Exponent zero.
        } else if (strL > 1) {
            str = str.charAt(0) + '.' + str.slice(1);
        }

        // Avoid '-0'
        return x.s < 0 && x.c[0] ? '-' + str : str;
    };


    /*
     ***************************************************************************
     * If toExponential, toFixed, toPrecision and format are not required they
     * can safely be commented-out or deleted. No redundant code will be left.
     * format is used only by toExponential, toFixed and toPrecision.
     ***************************************************************************
     */


    /*
     * Return a string representing the value of this Big in exponential
     * notation to dp fixed decimal places and rounded, if necessary, using
     * Big.RM.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     */
    P.toExponential = function (dp) {

        if (dp == null) {
            dp = this.c.length - 1;
        } else if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
            throwErr('!toExp!');
        }

        return format(this, dp, 1);
    };


    /*
     * Return a string representing the value of this Big in normal notation
     * to dp fixed decimal places and rounded, if necessary, using Big.RM.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     */
    P.toFixed = function (dp) {
        var str,
            x = this,
            Big = x.constructor,
            neg = Big.E_NEG,
            pos = Big.E_POS;

        // Prevent the possibility of exponential notation.
        Big.E_NEG = -(Big.E_POS = 1 / 0);

        if (dp == null) {
            str = x.toString();
        } else if (dp === ~~dp && dp >= 0 && dp <= MAX_DP) {
            str = format(x, x.e + dp);

            // (-0).toFixed() is '0', but (-0.1).toFixed() is '-0'.
            // (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
            if (x.s < 0 && x.c[0] && str.indexOf('-') < 0) {
        //E.g. -0.5 if rounded to -0 will cause toString to omit the minus sign.
                str = '-' + str;
            }
        }
        Big.E_NEG = neg;
        Big.E_POS = pos;

        if (!str) {
            throwErr('!toFix!');
        }

        return str;
    };


    /*
     * Return a string representing the value of this Big rounded to sd
     * significant digits using Big.RM. Use exponential notation if sd is less
     * than the number of digits necessary to represent the integer part of the
     * value in normal notation.
     *
     * sd {number} Integer, 1 to MAX_DP inclusive.
     */
    P.toPrecision = function (sd) {

        if (sd == null) {
            return this.toString();
        } else if (sd !== ~~sd || sd < 1 || sd > MAX_DP) {
            throwErr('!toPre!');
        }

        return format(this, sd - 1, 2);
    };


    // Export


    Big = bigFactory();

    //AMD.
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return Big;
        });

    // Node and other CommonJS-like environments that support module.exports.
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = Big;

    //Browser.
    } else {
        global.Big = Big;
    }
})(this);

},{}],2:[function(require,module,exports){
var VNode = require('./vnode');
var is = require('./is');

function addNS(data, children, sel) {
  data.ns = 'http://www.w3.org/2000/svg';

  if (sel !== 'foreignObject' && children !== undefined) {
    for (var i = 0; i < children.length; ++i) {
      addNS(children[i].data, children[i].children, children[i].sel);
    }
  }
}

module.exports = function h(sel, b, c) {
  var data = {}, children, text, i;
  if (c !== undefined) {
    data = b;
    if (is.array(c)) { children = c; }
    else if (is.primitive(c)) { text = c; }
  } else if (b !== undefined) {
    if (is.array(b)) { children = b; }
    else if (is.primitive(b)) { text = b; }
    else { data = b; }
  }
  if (is.array(children)) {
    for (i = 0; i < children.length; ++i) {
      if (is.primitive(children[i])) children[i] = VNode(undefined, undefined, undefined, children[i]);
    }
  }
  if (sel[0] === 's' && sel[1] === 'v' && sel[2] === 'g') {
    addNS(data, children, sel);
  }
  return VNode(sel, data, children, text, undefined);
};

},{"./is":4,"./vnode":11}],3:[function(require,module,exports){
function createElement(tagName){
  return document.createElement(tagName);
}

function createElementNS(namespaceURI, qualifiedName){
  return document.createElementNS(namespaceURI, qualifiedName);
}

function createTextNode(text){
  return document.createTextNode(text);
}


function insertBefore(parentNode, newNode, referenceNode){
  parentNode.insertBefore(newNode, referenceNode);
}


function removeChild(node, child){
  node.removeChild(child);
}

function appendChild(node, child){
  node.appendChild(child);
}

function parentNode(node){
  return node.parentElement;
}

function nextSibling(node){
  return node.nextSibling;
}

function tagName(node){
  return node.tagName;
}

function setTextContent(node, text){
  node.textContent = text;
}

module.exports = {
  createElement: createElement,
  createElementNS: createElementNS,
  createTextNode: createTextNode,
  appendChild: appendChild,
  removeChild: removeChild,
  insertBefore: insertBefore,
  parentNode: parentNode,
  nextSibling: nextSibling,
  tagName: tagName,
  setTextContent: setTextContent
};

},{}],4:[function(require,module,exports){
module.exports = {
  array: Array.isArray,
  primitive: function(s) { return typeof s === 'string' || typeof s === 'number'; },
};

},{}],5:[function(require,module,exports){
var NamespaceURIs = {
  "xlink": "http://www.w3.org/1999/xlink"
};

var booleanAttrs = ["allowfullscreen", "async", "autofocus", "autoplay", "checked", "compact", "controls", "declare",
                "default", "defaultchecked", "defaultmuted", "defaultselected", "defer", "disabled", "draggable",
                "enabled", "formnovalidate", "hidden", "indeterminate", "inert", "ismap", "itemscope", "loop", "multiple",
                "muted", "nohref", "noresize", "noshade", "novalidate", "nowrap", "open", "pauseonexit", "readonly",
                "required", "reversed", "scoped", "seamless", "selected", "sortable", "spellcheck", "translate",
                "truespeed", "typemustmatch", "visible"];

var booleanAttrsDict = Object.create(null);
for(var i=0, len = booleanAttrs.length; i < len; i++) {
  booleanAttrsDict[booleanAttrs[i]] = true;
}

function updateAttrs(oldVnode, vnode) {
  var key, cur, old, elm = vnode.elm,
      oldAttrs = oldVnode.data.attrs, attrs = vnode.data.attrs, namespaceSplit;

  if (!oldAttrs && !attrs) return;
  oldAttrs = oldAttrs || {};
  attrs = attrs || {};

  // update modified attributes, add new attributes
  for (key in attrs) {
    cur = attrs[key];
    old = oldAttrs[key];
    if (old !== cur) {
      if(!cur && booleanAttrsDict[key])
        elm.removeAttribute(key);
      else {
        namespaceSplit = key.split(":");
        if(namespaceSplit.length > 1 && NamespaceURIs.hasOwnProperty(namespaceSplit[0]))
          elm.setAttributeNS(NamespaceURIs[namespaceSplit[0]], key, cur);
        else
          elm.setAttribute(key, cur);
      }
    }
  }
  //remove removed attributes
  // use `in` operator since the previous `for` iteration uses it (.i.e. add even attributes with undefined value)
  // the other option is to remove all attributes with value == undefined
  for (key in oldAttrs) {
    if (!(key in attrs)) {
      elm.removeAttribute(key);
    }
  }
}

module.exports = {create: updateAttrs, update: updateAttrs};

},{}],6:[function(require,module,exports){
function updateClass(oldVnode, vnode) {
  var cur, name, elm = vnode.elm,
      oldClass = oldVnode.data.class,
      klass = vnode.data.class;

  if (!oldClass && !klass) return;
  oldClass = oldClass || {};
  klass = klass || {};

  for (name in oldClass) {
    if (!klass[name]) {
      elm.classList.remove(name);
    }
  }
  for (name in klass) {
    cur = klass[name];
    if (cur !== oldClass[name]) {
      elm.classList[cur ? 'add' : 'remove'](name);
    }
  }
}

module.exports = {create: updateClass, update: updateClass};

},{}],7:[function(require,module,exports){
function invokeHandler(handler, vnode, event) {
  if (typeof handler === "function") {
    // call function handler
    handler.call(vnode, event, vnode);
  } else if (typeof handler === "object") {
    // call handler with arguments
    if (typeof handler[0] === "function") {
      // special case for single argument for performance
      if (handler.length === 2) {
        handler[0].call(vnode, handler[1], event, vnode);
      } else {
        var args = handler.slice(1);
        args.push(event);
        args.push(vnode);
        handler[0].apply(vnode, args);
      }
    } else {
      // call multiple handlers
      for (var i = 0; i < handler.length; i++) {
        invokeHandler(handler[i]);
      }
    }
  }
}

function handleEvent(event, vnode) {
  var name = event.type,
      on = vnode.data.on;

  // call event handler(s) if exists
  if (on && on[name]) {
    invokeHandler(on[name], vnode, event);
  }
}

function createListener() {
  return function handler(event) {
    handleEvent(event, handler.vnode);
  }
}

function updateEventListeners(oldVnode, vnode) {
  var oldOn = oldVnode.data.on,
      oldListener = oldVnode.listener,
      oldElm = oldVnode.elm,
      on = vnode && vnode.data.on,
      elm = vnode && vnode.elm,
      name;

  // optimization for reused immutable handlers
  if (oldOn === on) {
    return;
  }

  // remove existing listeners which no longer used
  if (oldOn && oldListener) {
    // if element changed or deleted we remove all existing listeners unconditionally
    if (!on) {
      for (name in oldOn) {
        // remove listener if element was changed or existing listeners removed
        oldElm.removeEventListener(name, oldListener, false);
      }
    } else {
      for (name in oldOn) {
        // remove listener if existing listener removed
        if (!on[name]) {
          oldElm.removeEventListener(name, oldListener, false);
        }
      }
    }
  }

  // add new listeners which has not already attached
  if (on) {
    // reuse existing listener or create new
    var listener = vnode.listener = oldVnode.listener || createListener();
    // update vnode for listener
    listener.vnode = vnode;

    // if element changed or added we add all needed listeners unconditionally
    if (!oldOn) {
      for (name in on) {
        // add listener if element was changed or new listeners added
        elm.addEventListener(name, listener, false);
      }
    } else {
      for (name in on) {
        // add listener if new listener added
        if (!oldOn[name]) {
          elm.addEventListener(name, listener, false);
        }
      }
    }
  }
}

module.exports = {
  create: updateEventListeners,
  update: updateEventListeners,
  destroy: updateEventListeners
};

},{}],8:[function(require,module,exports){
function updateProps(oldVnode, vnode) {
  var key, cur, old, elm = vnode.elm,
      oldProps = oldVnode.data.props, props = vnode.data.props;

  if (!oldProps && !props) return;
  oldProps = oldProps || {};
  props = props || {};

  for (key in oldProps) {
    if (!props[key]) {
      delete elm[key];
    }
  }
  for (key in props) {
    cur = props[key];
    old = oldProps[key];
    if (old !== cur && (key !== 'value' || elm[key] !== cur)) {
      elm[key] = cur;
    }
  }
}

module.exports = {create: updateProps, update: updateProps};

},{}],9:[function(require,module,exports){
var raf = (typeof window !== 'undefined' && window.requestAnimationFrame) || setTimeout;
var nextFrame = function(fn) { raf(function() { raf(fn); }); };

function setNextFrame(obj, prop, val) {
  nextFrame(function() { obj[prop] = val; });
}

function updateStyle(oldVnode, vnode) {
  var cur, name, elm = vnode.elm,
      oldStyle = oldVnode.data.style,
      style = vnode.data.style;

  if (!oldStyle && !style) return;
  oldStyle = oldStyle || {};
  style = style || {};
  var oldHasDel = 'delayed' in oldStyle;

  for (name in oldStyle) {
    if (!style[name]) {
      elm.style[name] = '';
    }
  }
  for (name in style) {
    cur = style[name];
    if (name === 'delayed') {
      for (name in style.delayed) {
        cur = style.delayed[name];
        if (!oldHasDel || cur !== oldStyle.delayed[name]) {
          setNextFrame(elm.style, name, cur);
        }
      }
    } else if (name !== 'remove' && cur !== oldStyle[name]) {
      elm.style[name] = cur;
    }
  }
}

function applyDestroyStyle(vnode) {
  var style, name, elm = vnode.elm, s = vnode.data.style;
  if (!s || !(style = s.destroy)) return;
  for (name in style) {
    elm.style[name] = style[name];
  }
}

function applyRemoveStyle(vnode, rm) {
  var s = vnode.data.style;
  if (!s || !s.remove) {
    rm();
    return;
  }
  var name, elm = vnode.elm, idx, i = 0, maxDur = 0,
      compStyle, style = s.remove, amount = 0, applied = [];
  for (name in style) {
    applied.push(name);
    elm.style[name] = style[name];
  }
  compStyle = getComputedStyle(elm);
  var props = compStyle['transition-property'].split(', ');
  for (; i < props.length; ++i) {
    if(applied.indexOf(props[i]) !== -1) amount++;
  }
  elm.addEventListener('transitionend', function(ev) {
    if (ev.target === elm) --amount;
    if (amount === 0) rm();
  });
}

module.exports = {create: updateStyle, update: updateStyle, destroy: applyDestroyStyle, remove: applyRemoveStyle};

},{}],10:[function(require,module,exports){
// jshint newcap: false
/* global require, module, document, Node */
'use strict';

var VNode = require('./vnode');
var is = require('./is');
var domApi = require('./htmldomapi');

function isUndef(s) { return s === undefined; }
function isDef(s) { return s !== undefined; }

var emptyNode = VNode('', {}, [], undefined, undefined);

function sameVnode(vnode1, vnode2) {
  return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
}

function createKeyToOldIdx(children, beginIdx, endIdx) {
  var i, map = {}, key;
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (isDef(key)) map[key] = i;
  }
  return map;
}

var hooks = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];

function init(modules, api) {
  var i, j, cbs = {};

  if (isUndef(api)) api = domApi;

  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = [];
    for (j = 0; j < modules.length; ++j) {
      if (modules[j][hooks[i]] !== undefined) cbs[hooks[i]].push(modules[j][hooks[i]]);
    }
  }

  function emptyNodeAt(elm) {
    var id = elm.id ? '#' + elm.id : '';
    var c = elm.className ? '.' + elm.className.split(' ').join('.') : '';
    return VNode(api.tagName(elm).toLowerCase() + id + c, {}, [], undefined, elm);
  }

  function createRmCb(childElm, listeners) {
    return function() {
      if (--listeners === 0) {
        var parent = api.parentNode(childElm);
        api.removeChild(parent, childElm);
      }
    };
  }

  function createElm(vnode, insertedVnodeQueue) {
    var i, data = vnode.data;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) {
        i(vnode);
        data = vnode.data;
      }
    }
    var elm, children = vnode.children, sel = vnode.sel;
    if (isDef(sel)) {
      // Parse selector
      var hashIdx = sel.indexOf('#');
      var dotIdx = sel.indexOf('.', hashIdx);
      var hash = hashIdx > 0 ? hashIdx : sel.length;
      var dot = dotIdx > 0 ? dotIdx : sel.length;
      var tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
      elm = vnode.elm = isDef(data) && isDef(i = data.ns) ? api.createElementNS(i, tag)
                                                          : api.createElement(tag);
      if (hash < dot) elm.id = sel.slice(hash + 1, dot);
      if (dotIdx > 0) elm.className = sel.slice(dot + 1).replace(/\./g, ' ');
      if (is.array(children)) {
        for (i = 0; i < children.length; ++i) {
          api.appendChild(elm, createElm(children[i], insertedVnodeQueue));
        }
      } else if (is.primitive(vnode.text)) {
        api.appendChild(elm, api.createTextNode(vnode.text));
      }
      for (i = 0; i < cbs.create.length; ++i) cbs.create[i](emptyNode, vnode);
      i = vnode.data.hook; // Reuse variable
      if (isDef(i)) {
        if (i.create) i.create(emptyNode, vnode);
        if (i.insert) insertedVnodeQueue.push(vnode);
      }
    } else {
      elm = vnode.elm = api.createTextNode(vnode.text);
    }
    return vnode.elm;
  }

  function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      api.insertBefore(parentElm, createElm(vnodes[startIdx], insertedVnodeQueue), before);
    }
  }

  function invokeDestroyHook(vnode) {
    var i, j, data = vnode.data;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.destroy)) i(vnode);
      for (i = 0; i < cbs.destroy.length; ++i) cbs.destroy[i](vnode);
      if (isDef(i = vnode.children)) {
        for (j = 0; j < vnode.children.length; ++j) {
          invokeDestroyHook(vnode.children[j]);
        }
      }
    }
  }

  function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      var i, listeners, rm, ch = vnodes[startIdx];
      if (isDef(ch)) {
        if (isDef(ch.sel)) {
          invokeDestroyHook(ch);
          listeners = cbs.remove.length + 1;
          rm = createRmCb(ch.elm, listeners);
          for (i = 0; i < cbs.remove.length; ++i) cbs.remove[i](ch, rm);
          if (isDef(i = ch.data) && isDef(i = i.hook) && isDef(i = i.remove)) {
            i(ch, rm);
          } else {
            rm();
          }
        } else { // Text node
          api.removeChild(parentElm, ch.elm);
        }
      }
    }
  }

  function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
    var oldStartIdx = 0, newStartIdx = 0;
    var oldEndIdx = oldCh.length - 1;
    var oldStartVnode = oldCh[0];
    var oldEndVnode = oldCh[oldEndIdx];
    var newEndIdx = newCh.length - 1;
    var newStartVnode = newCh[0];
    var newEndVnode = newCh[newEndIdx];
    var oldKeyToIdx, idxInOld, elmToMove, before;

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
        api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
        api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
        idxInOld = oldKeyToIdx[newStartVnode.key];
        if (isUndef(idxInOld)) { // New element
          api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
          newStartVnode = newCh[++newStartIdx];
        } else {
          elmToMove = oldCh[idxInOld];
          patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
          oldCh[idxInOld] = undefined;
          api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
          newStartVnode = newCh[++newStartIdx];
        }
      }
    }
    if (oldStartIdx > oldEndIdx) {
      before = isUndef(newCh[newEndIdx+1]) ? null : newCh[newEndIdx+1].elm;
      addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
    }
  }

  function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
    var i, hook;
    if (isDef(i = vnode.data) && isDef(hook = i.hook) && isDef(i = hook.prepatch)) {
      i(oldVnode, vnode);
    }
    var elm = vnode.elm = oldVnode.elm, oldCh = oldVnode.children, ch = vnode.children;
    if (oldVnode === vnode) return;
    if (!sameVnode(oldVnode, vnode)) {
      var parentElm = api.parentNode(oldVnode.elm);
      elm = createElm(vnode, insertedVnodeQueue);
      api.insertBefore(parentElm, elm, oldVnode.elm);
      removeVnodes(parentElm, [oldVnode], 0, 0);
      return;
    }
    if (isDef(vnode.data)) {
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode);
      i = vnode.data.hook;
      if (isDef(i) && isDef(i = i.update)) i(oldVnode, vnode);
    }
    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue);
      } else if (isDef(ch)) {
        if (isDef(oldVnode.text)) api.setTextContent(elm, '');
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
      } else if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1);
      } else if (isDef(oldVnode.text)) {
        api.setTextContent(elm, '');
      }
    } else if (oldVnode.text !== vnode.text) {
      api.setTextContent(elm, vnode.text);
    }
    if (isDef(hook) && isDef(i = hook.postpatch)) {
      i(oldVnode, vnode);
    }
  }

  return function(oldVnode, vnode) {
    var i, elm, parent;
    var insertedVnodeQueue = [];
    for (i = 0; i < cbs.pre.length; ++i) cbs.pre[i]();

    if (isUndef(oldVnode.sel)) {
      oldVnode = emptyNodeAt(oldVnode);
    }

    if (sameVnode(oldVnode, vnode)) {
      patchVnode(oldVnode, vnode, insertedVnodeQueue);
    } else {
      elm = oldVnode.elm;
      parent = api.parentNode(elm);

      createElm(vnode, insertedVnodeQueue);

      if (parent !== null) {
        api.insertBefore(parent, vnode.elm, api.nextSibling(elm));
        removeVnodes(parent, [oldVnode], 0, 0);
      }
    }

    for (i = 0; i < insertedVnodeQueue.length; ++i) {
      insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
    }
    for (i = 0; i < cbs.post.length; ++i) cbs.post[i]();
    return vnode;
  };
}

module.exports = {init: init};

},{"./htmldomapi":3,"./is":4,"./vnode":11}],11:[function(require,module,exports){
module.exports = function(sel, data, children, text, elm) {
  var key = data === undefined ? undefined : data.key;
  return {sel: sel, data: data, children: children,
          text: text, elm: elm, key: key};
};

},{}],12:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _snabbdom = require("snabbdom");

var _snabbdom2 = _interopRequireDefault(_snabbdom);

var _h = require("snabbdom/h");

var _h2 = _interopRequireDefault(_h);

var _big = require("big.js");

var _big2 = _interopRequireDefault(_big);

var _ugnis = require("./ugnis");

var _ugnis2 = _interopRequireDefault(_ugnis);

var _app = require("../ugnis_components/app.json");

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function updateProps(oldVnode, vnode) {
    var key,
        cur,
        old,
        elm = vnode.elm,
        props = vnode.data.liveProps || {};
    for (key in props) {
        cur = props[key];
        old = elm[key];
        if (old !== cur) elm[key] = cur;
    }
}
var livePropsPlugin = { create: updateProps, update: updateProps };

var patch = _snabbdom2.default.init([require('snabbdom/modules/class'), require('snabbdom/modules/props'), require('snabbdom/modules/style'), require('snabbdom/modules/eventlisteners'), require('snabbdom/modules/attributes'), livePropsPlugin]);

function uuid() {
    return ("" + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/1|0/g, function () {
        return (0 | Math.random() * 16).toString(16);
    });
}

_big2.default.E_POS = 1e+6;

editor(_app2.default);

function editor(appDefinition) {

    var savedDefinition = JSON.parse(localStorage.getItem('saved_app'));
    var app = (0, _ugnis2.default)(savedDefinition || appDefinition);

    var node = document.createElement('div');
    document.body.appendChild(node);

    // State
    var state = {
        leftOpen: true,
        rightOpen: true,
        editorRightWidth: 350,
        editorLeftWidth: 350,
        subEditorWidth: 350,
        appIsFrozen: false,
        showingViewNodes: false,
        selectedViewNode: {},
        selectedEventId: '',
        selectedPipeId: '',
        selectedStateNodeId: '',
        selectedViewSubMenu: 'props',
        editingTitleNodeId: '',
        activeEvent: '',
        viewFoldersClosed: {},
        dragMouseLocation: null,
        currentlyDragging: '',
        definition: savedDefinition || app.definition
    };
    // undo/redo
    var stateStack = [state];
    function setState(newState, pushToStack) {
        if (newState === state) {
            console.warn('state was mutated, search for a bug');
        }
        // some actions should not be recorded and controlled through undo/redo
        if (pushToStack) {
            var currentIndex = stateStack.findIndex(function (a) {
                return a === state;
            });
            stateStack = stateStack.slice(0, currentIndex + 1).concat(newState);
        } else {
            // overwrite current
            stateStack[stateStack.findIndex(function (a) {
                return a === state;
            })] = newState;
        }
        if (state.appIsFrozen !== newState.appIsFrozen || state.selectedViewNode !== newState.selectedViewNode) {
            app._freeze(newState.appIsFrozen, VIEW_NODE_SELECTED, newState.selectedViewNode);
        }
        if (state.definition !== newState.definition) {
            // TODO add garbage collection?
            app.render(newState.definition);
            localStorage.setItem('saved_app', JSON.stringify(newState.definition));
        }
        state = newState;
        render();
    }
    document.addEventListener('click', function (e) {
        // clicked outside
        if (state.editingTitleNodeId && !e.target.dataset.istitleeditor) {
            setState(_extends({}, state, { editingTitleNodeId: '' }));
        }
    });
    document.addEventListener('keydown', function (e) {
        // 83 - s
        // 90 - z
        // 89 - y
        // 32 - space
        // 13 - enter
        if (e.which == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            // TODO garbage collect
            e.preventDefault();
            fetch('/save', { method: 'POST', body: JSON.stringify(state.definition), headers: { "Content-Type": "application/json" } });
            return false;
        }
        if (e.which == 32 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
            FREEZER_CLICKED();
        }
        if (!e.shiftKey && e.which == 90 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
            var currentIndex = stateStack.findIndex(function (a) {
                return a === state;
            });
            if (currentIndex > 0) {
                var newState = stateStack[currentIndex - 1];
                if (state.definition !== newState.definition) {
                    app.render(newState.definition);
                }
                state = newState;
                render();
            }
        }
        if (e.which == 89 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) || e.shiftKey && e.which == 90 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
            var _currentIndex = stateStack.findIndex(function (a) {
                return a === state;
            });
            if (_currentIndex < stateStack.length - 1) {
                var _newState = stateStack[_currentIndex + 1];
                if (state.definition !== _newState.definition) {
                    app.render(_newState.definition);
                }
                state = _newState;
                render();
            }
        }
        if (e.which == 13) {
            setState(_extends({}, state, { editingTitleNodeId: '' }));
        }
    });

    // Actions
    function WIDTH_DRAGGED(widthName, e) {
        e.preventDefault();
        function resize(e) {
            e.preventDefault();
            var newWidth = window.innerWidth - (e.touches ? e.touches[0].pageX : e.pageX);
            if (widthName === 'editorLeftWidth') {
                newWidth = e.touches ? e.touches[0].pageX : e.pageX;
            }
            if (widthName === 'subEditorWidth') {
                newWidth = newWidth - state.editorRightWidth - 10;
            }
            // I probably was drunk
            if (widthName !== 'subEditorWidth' && ((widthName === 'editorLeftWidth' ? state.leftOpen : state.rightOpen) ? newWidth < 180 : newWidth > 180)) {
                if (widthName === 'editorLeftWidth') {
                    return setState(_extends({}, state, { leftOpen: !state.leftOpen }));
                }
                return setState(_extends({}, state, { rightOpen: !state.rightOpen }));
            }
            if (newWidth < 250) {
                newWidth = 250;
            }
            setState(_extends({}, state, _defineProperty({}, widthName, newWidth)));
            return false;
        }
        window.addEventListener('mousemove', resize);
        window.addEventListener('touchmove', resize);
        function stopDragging(e) {
            e.preventDefault();
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('touchmove', resize);
            window.removeEventListener('mouseup', stopDragging);
            window.removeEventListener('touchend', stopDragging);
            return false;
        }
        window.addEventListener('mouseup', stopDragging);
        window.addEventListener('touchend', stopDragging);
        return false;
    }
    function FREEZER_CLICKED() {
        setState(_extends({}, state, { appIsFrozen: !state.appIsFrozen }));
    }
    function VIEW_FOLDER_CLICKED(nodeId) {
        setState(_extends({}, state, { viewFoldersClosed: _extends({}, state.viewFoldersClosed, _defineProperty({}, nodeId, !state.viewFoldersClosed[nodeId])) }));
    }
    function VIEW_NODE_SELECTED(ref) {
        setState(_extends({}, state, { selectedViewNode: ref }));
    }
    function UNSELECT_VIEW_NODE(e) {
        if (e.target === this.elm) {
            setState(_extends({}, state, { selectedViewNode: {} }));
        }
    }
    function STATE_NODE_SELECTED(nodeId) {
        setState(_extends({}, state, { selectedStateNodeId: nodeId }));
    }
    function UNSELECT_STATE_NODE(e) {
        if (e.target === this.elm) {
            setState(_extends({}, state, { selectedStateNodeId: '', selectedEventId: '' }));
        }
    }
    function DELETE_SELECTED_VIEW(nodeRef, parentRef, e) {
        e.stopPropagation();
        if (nodeRef.id === '_rootNode') {
            // immutably remove all nodes except rootNode
            return setState(_extends({}, state, { definition: _extends({}, state.definition, {
                    vNodeBox: { '_rootNode': _extends({}, state.definition.vNodeBox['_rootNode'], { children: [] }) }
                }), selectedViewNode: {} }), true);
        }
        setState(_extends({}, state, { definition: _extends({}, state.definition, _defineProperty({}, parentRef.ref, _extends({}, state.definition[parentRef.ref], _defineProperty({}, parentRef.id, _extends({}, state.definition[parentRef.ref][parentRef.id], { children: state.definition[parentRef.ref][parentRef.id].children.filter(function (ref) {
                    return ref.id !== nodeRef.id;
                }) }))))), selectedViewNode: {} }), true);
    }
    function NODE_DRAGGED(type, e) {
        e.preventDefault();
        function showComponent(e) {
            e.preventDefault();
            var x = e.touches ? e.touches[0].pageX : e.pageX;
            var y = e.touches ? e.touches[0].pageY : e.pageY;

            setState(_extends({}, state, { dragMouseLocation: { x: x, y: y } }));
            return false;
        }
        window.addEventListener('mousemove', showComponent);
        window.addEventListener('touchmove', showComponent);
        function stopDragging(e) {
            e.preventDefault();
            window.removeEventListener('mousemove', showComponent);
            window.removeEventListener('touchmove', showComponent);
            window.removeEventListener('mouseup', stopDragging);
            window.removeEventListener('touchend', stopDragging);

            setState(_extends({}, state, { dragMouseLocation: null, currentlyDragging: '' }));
            return false;
        }
        window.addEventListener('mouseup', stopDragging);
        window.addEventListener('touchend', stopDragging);
        var x = e.touches ? e.touches[0].pageX : e.pageX;
        var y = e.touches ? e.touches[0].pageY : e.pageY;
        setState(_extends({}, state, { dragMouseLocation: { x: x, y: y }, currentlyDragging: type, showingViewNodes: false }));
        return false;
    }
    function DRAGGED_OVER_ME(nodeRef) {
        ADD_NODE(nodeRef, state.currentlyDragging);
    }
    function ADD_NODE(nodeRef, type) {
        var nodeId = nodeRef.id;
        var newNodeId = uuid();
        var newStyleId = uuid();
        var newStyle = {
            padding: '10px'
        };
        if (type === 'box') {
            var _extends6, _extends11;

            var newNode = {
                title: 'box',
                style: { ref: 'style', id: newStyleId },
                children: []
            };
            return setState(_extends({}, state, {
                selectedViewNode: { ref: 'vNodeBox', id: newNodeId },
                definition: nodeRef.ref === 'vNodeBox' ? _extends({}, state.definition, {
                    vNodeBox: _extends({}, state.definition.vNodeBox, (_extends6 = {}, _defineProperty(_extends6, nodeId, _extends({}, state.definition.vNodeBox[nodeId], { children: state.definition.vNodeBox[nodeId].children.concat({ ref: 'vNodeBox', id: newNodeId }) })), _defineProperty(_extends6, newNodeId, newNode), _extends6)),
                    style: _extends({}, state.definition.style, _defineProperty({}, newStyleId, newStyle))
                }) : _extends({}, state.definition, (_extends11 = {}, _defineProperty(_extends11, nodeRef.ref, _extends({}, state.definition[nodeRef.ref], _defineProperty({}, nodeId, _extends({}, state.definition[nodeRef.ref][nodeId], { children: state.definition[nodeRef.ref][nodeId].children.concat({ ref: 'vNodeBox', id: newNodeId }) })))), _defineProperty(_extends11, "vNodeBox", _extends({}, state.definition.vNodeBox, _defineProperty({}, newNodeId, newNode))), _defineProperty(_extends11, "style", _extends({}, state.definition.style, _defineProperty({}, newStyleId, newStyle))), _extends11))
            }), true);
        }
        if (type === 'text') {
            var _extends16;

            var pipeId = uuid();
            var _newNode = {
                title: 'text',
                style: { ref: 'style', id: newStyleId },
                value: { ref: 'pipe', id: pipeId }
            };
            var newPipe = {
                type: 'text',
                value: 'Default Text',
                transformations: []
            };
            return setState(_extends({}, state, {
                selectedViewNode: { ref: 'vNodeText', id: newNodeId },
                definition: _extends({}, state.definition, (_extends16 = {
                    pipe: _extends({}, state.definition.pipe, _defineProperty({}, pipeId, newPipe))
                }, _defineProperty(_extends16, nodeRef.ref, _extends({}, state.definition[nodeRef.ref], _defineProperty({}, nodeId, _extends({}, state.definition[nodeRef.ref][nodeId], { children: state.definition[nodeRef.ref][nodeId].children.concat({ ref: 'vNodeText', id: newNodeId }) })))), _defineProperty(_extends16, "vNodeText", _extends({}, state.definition.vNodeText, _defineProperty({}, newNodeId, _newNode))), _defineProperty(_extends16, "style", _extends({}, state.definition.style, _defineProperty({}, newStyleId, newStyle))), _extends16)) }), true);
        }
        if (type === 'input') {
            var _extends17, _extends25;

            var stateId = uuid();
            var eventId = uuid();
            var mutatorId = uuid();
            var pipeInputId = uuid();
            var pipeMutatorId = uuid();
            var _newNode2 = {
                title: 'input',
                style: { ref: 'style', id: newStyleId },
                value: { ref: 'pipe', id: pipeInputId },
                input: { ref: 'event', id: eventId }
            };
            var newPipeInput = {
                type: 'text',
                value: { ref: 'state', id: stateId },
                transformations: []
            };
            var newPipeMutator = {
                type: 'text',
                value: { ref: 'eventData', id: '_input' },
                transformations: []
            };
            var newState = {
                title: 'input value',
                type: 'text',
                ref: stateId,
                defaultValue: 'Default text',
                mutators: [{ ref: 'mutator', id: mutatorId }]
            };
            var newMutator = {
                event: { ref: 'event', id: eventId },
                state: { ref: 'state', id: stateId },
                mutation: { ref: 'pipe', id: pipeMutatorId }
            };
            var newEvent = {
                title: 'update input',
                mutators: [{ ref: 'mutator', id: mutatorId }],
                data: [{ ref: 'eventData', id: '_input' }]
            };
            return setState(_extends({}, state, {
                selectedViewNode: { ref: 'vNodeInput', id: newNodeId },
                definition: _extends({}, state.definition, (_extends25 = {
                    pipe: _extends({}, state.definition.pipe, (_extends17 = {}, _defineProperty(_extends17, pipeInputId, newPipeInput), _defineProperty(_extends17, pipeMutatorId, newPipeMutator), _extends17))
                }, _defineProperty(_extends25, nodeRef.ref, _extends({}, state.definition[nodeRef.ref], _defineProperty({}, nodeId, _extends({}, state.definition[nodeRef.ref][nodeId], { children: state.definition[nodeRef.ref][nodeId].children.concat({ ref: 'vNodeInput', id: newNodeId }) })))), _defineProperty(_extends25, "vNodeInput", _extends({}, state.definition.vNodeInput, _defineProperty({}, newNodeId, _newNode2))), _defineProperty(_extends25, "style", _extends({}, state.definition.style, _defineProperty({}, newStyleId, newStyle))), _defineProperty(_extends25, "nameSpace", _extends({}, state.definition.nameSpace, _defineProperty({}, '_rootNameSpace', _extends({}, state.definition.nameSpace['_rootNameSpace'], { children: state.definition.nameSpace['_rootNameSpace'].children.concat({ ref: 'state', id: stateId }) })))), _defineProperty(_extends25, "state", _extends({}, state.definition.state, _defineProperty({}, stateId, newState))), _defineProperty(_extends25, "mutator", _extends({}, state.definition.mutator, _defineProperty({}, mutatorId, newMutator))), _defineProperty(_extends25, "event", _extends({}, state.definition.event, _defineProperty({}, eventId, newEvent))), _extends25)) }), true);
        }
    }
    function ADD_STATE(namespaceId, type) {
        var newStateId = uuid();
        var newState = void 0;
        if (type === 'text') {
            newState = {
                title: 'new text',
                ref: newStateId,
                type: 'text',
                defaultValue: 'Default text',
                mutators: []
            };
        }
        if (type === 'number') {
            newState = {
                title: 'new number',
                ref: newStateId,
                type: 'number',
                defaultValue: 0,
                mutators: []
            };
        }
        if (type === 'boolean') {
            newState = {
                title: 'new boolean',
                type: 'boolean',
                ref: newStateId,
                defaultValue: true,
                mutators: []
            };
        }
        if (type === 'table') {
            newState = {
                title: 'new table',
                type: 'table',
                ref: newStateId,
                defaultValue: {},
                mutators: []
            };
        }
        if (type === 'namespace') {
            var _extends26;

            newState = {
                title: 'new namespace',
                children: []
            };
            return setState(_extends({}, state, { definition: _extends({}, state.definition, {
                    nameSpace: _extends({}, state.definition.nameSpace, (_extends26 = {}, _defineProperty(_extends26, namespaceId, _extends({}, state.definition.nameSpace[namespaceId], { children: state.definition.nameSpace[namespaceId].children.concat({ ref: 'nameSpace', id: newStateId }) })), _defineProperty(_extends26, newStateId, newState), _extends26))
                }) }), true);
        }
        setState(_extends({}, state, { definition: _extends({}, state.definition, {
                nameSpace: _extends({}, state.definition.nameSpace, _defineProperty({}, namespaceId, _extends({}, state.definition.nameSpace[namespaceId], { children: state.definition.nameSpace[namespaceId].children.concat({ ref: 'state', id: newStateId }) }))),
                state: _extends({}, state.definition.state, _defineProperty({}, newStateId, newState))
            }) }), true);
    }
    function CHANGE_STYLE(styleId, key, e) {
        e.preventDefault();
        // and now I really regret not using immutable or ramda lenses
        setState(_extends({}, state, { definition: _extends({}, state.definition, { style: _extends({}, state.definition.style, _defineProperty({}, styleId, _extends({}, state.definition.style[styleId], _defineProperty({}, key, e.target.value)))) }) }), true);
    }
    function ADD_DEFAULT_STYLE(styleId, key) {
        setState(_extends({}, state, { definition: _extends({}, state.definition, { style: _extends({}, state.definition.style, _defineProperty({}, styleId, _extends({}, state.definition.style[styleId], _defineProperty({}, key, 'default')))) }) }), true);
    }
    function SELECT_VIEW_SUBMENU(newId) {
        setState(_extends({}, state, { selectedViewSubMenu: newId }));
    }
    function EDIT_VIEW_NODE_TITLE(nodeId) {
        setState(_extends({}, state, { editingTitleNodeId: nodeId }));
    }
    function EDIT_EVENT_TITLE(nodeId) {
        setState(_extends({}, state, { editingTitleNodeId: nodeId }));
    }
    function CHANGE_EVENT_TITLE(nodeId, e) {
        e.preventDefault();
        setState(_extends({}, state, { definition: _extends({}, state.definition, {
                event: _extends({}, state.definition.event, _defineProperty({}, nodeId, _extends({}, state.definition.event[nodeId], {
                    title: e.target.value
                })))
            }) }), true);
    }
    function CHANGE_VIEW_NODE_TITLE(nodeRef, e) {
        e.preventDefault();
        var nodeId = nodeRef.id;
        var nodeType = nodeRef.ref;
        setState(_extends({}, state, { definition: _extends({}, state.definition, _defineProperty({}, nodeType, _extends({}, state.definition[nodeType], _defineProperty({}, nodeId, _extends({}, state.definition[nodeType][nodeId], { title: e.target.value }))))) }), true);
    }
    function CHANGE_STATE_NODE_TITLE(nodeId, e) {
        e.preventDefault();
        setState(_extends({}, state, { definition: _extends({}, state.definition, {
                state: _extends({}, state.definition.state, _defineProperty({}, nodeId, _extends({}, state.definition.state[nodeId], { title: e.target.value })))
            }) }), true);
    }
    function CHANGE_NAMESPACE_TITLE(nodeId, e) {
        e.preventDefault();
        setState(_extends({}, state, { definition: _extends({}, state.definition, {
                nameSpace: _extends({}, state.definition.nameSpace, _defineProperty({}, nodeId, _extends({}, state.definition.nameSpace[nodeId], { title: e.target.value })))
            }) }), true);
    }
    function CHANGE_CURRENT_STATE_TEXT_VALUE(stateId, e) {
        app.setCurrentState(_extends({}, app.getCurrentState(), _defineProperty({}, stateId, e.target.value)));
        render();
    }
    function CHANGE_CURRENT_STATE_NUMBER_VALUE(stateId, e) {
        // todo big throws error instead of returning NaN... fix, rewrite or hack
        try {
            if ((0, _big2.default)(e.target.value).toString() !== app.getCurrentState()[stateId].toString()) {
                app.setCurrentState(_extends({}, app.getCurrentState(), _defineProperty({}, stateId, (0, _big2.default)(e.target.value))));
                render();
            }
        } catch (err) {}
    }
    function INCREMENT_CURRENT_STATE_NUMBER_VALUE(stateId) {
        app.setCurrentState(_extends({}, app.getCurrentState(), _defineProperty({}, stateId, (0, _big2.default)(app.getCurrentState()[stateId]).add(1))));
        render();
    }
    function DECREMENT_CURRENT_STATE_NUMBER_VALUE(stateId) {
        app.setCurrentState(_extends({}, app.getCurrentState(), _defineProperty({}, stateId, (0, _big2.default)(app.getCurrentState()[stateId]).add(-1))));
        render();
    }
    function SELECT_EVENT(eventId) {
        setState(_extends({}, state, { selectedEventId: eventId }));
    }
    function CHANGE_STATIC_VALUE(ref, propertyName, type, e) {
        var value = e.target.value;
        if (type === 'number') {
            try {
                value = (0, _big2.default)(e.target.value);
            } catch (err) {
                return;
            }
        }
        setState(_extends({}, state, { definition: _extends({}, state.definition, _defineProperty({}, ref.ref, _extends({}, state.definition[ref.ref], _defineProperty({}, ref.id, _extends({}, state.definition[ref.ref][ref.id], _defineProperty({}, propertyName, value)))))) }), true);
    }
    function ADD_EVENT(propertyName) {
        var _extends48;

        var ref = state.selectedViewNode;
        var eventId = uuid();
        setState(_extends({}, state, { definition: _extends({}, state.definition, (_extends48 = {}, _defineProperty(_extends48, ref.ref, _extends({}, state.definition[ref.ref], _defineProperty({}, ref.id, _extends({}, state.definition[ref.ref][ref.id], _defineProperty({}, propertyName, { ref: 'event', id: eventId }))))), _defineProperty(_extends48, "event", _extends({}, state.definition.event, _defineProperty({}, eventId, {
                title: 'On ' + propertyName,
                mutators: []
            }))), _extends48)) }), true);
    }
    function ADD_MUTATOR(stateId, eventId) {
        var mutatorId = uuid();
        var pipeId = uuid();
        setState(_extends({}, state, { definition: _extends({}, state.definition, {
                pipe: _extends({}, state.definition.pipe, _defineProperty({}, pipeId, {
                    type: state.definition.state[stateId].type,
                    value: state.definition.state[stateId].defaultValue,
                    transformations: []
                })),
                state: _extends({}, state.definition.state, _defineProperty({}, stateId, _extends({}, state.definition.state[stateId], {
                    mutators: state.definition.state[stateId].mutators.concat({
                        ref: 'mutator',
                        id: mutatorId
                    })
                }))),
                mutator: _extends({}, state.definition.mutator, _defineProperty({}, mutatorId, {
                    event: {
                        ref: "event",
                        id: eventId
                    },
                    state: {
                        ref: "state",
                        id: stateId
                    },
                    mutation: {
                        ref: "pipe",
                        id: pipeId
                    }
                })),
                event: _extends({}, state.definition.event, _defineProperty({}, eventId, _extends({}, state.definition.event[eventId], {
                    mutators: state.definition.event[eventId].mutators.concat({
                        ref: 'mutator',
                        id: mutatorId
                    })
                })))
            }) }), true);
    }
    function MOVE_VIEW_NODE(parentRef, position, amount, e) {
        e.preventDefault();
        e.stopPropagation();
        setState(_extends({}, state, { definition: _extends({}, state.definition, _defineProperty({}, parentRef.ref, _extends({}, state.definition[parentRef.ref], _defineProperty({}, parentRef.id, _extends({}, state.definition[parentRef.ref][parentRef.id], {
                children: state.definition[parentRef.ref][parentRef.id].children.map( // functional swap
                function (child, index) {
                    return index === position + amount ? state.definition[parentRef.ref][parentRef.id].children[position] : index === position ? state.definition[parentRef.ref][parentRef.id].children[position + amount] : state.definition[parentRef.ref][parentRef.id].children[index];
                })
            }))))) }), true);
    }
    function SELECT_PIPE(pipeId) {
        setState(_extends({}, state, { selectedPipeId: pipeId }));
    }
    function CHANGE_PIPE_VALUE_TO_STATE(pipeId) {
        if (!state.selectedStateNodeId || state.selectedStateNodeId === state.definition.pipe[pipeId].value.id) {
            return;
        }
        setState(_extends({}, state, { definition: _extends({}, state.definition, {
                pipe: _extends({}, state.definition.pipe, _defineProperty({}, pipeId, _extends({}, state.definition.pipe[pipeId], {
                    value: { ref: 'state', id: state.selectedStateNodeId },
                    transformations: []
                })))
            }) }), true);
    }
    function ADD_TRANSFORMATION(pipeId, transformation) {
        if (transformation === 'join') {
            var _extends57;

            var newPipeId = uuid();
            var joinId = uuid();
            setState(_extends({}, state, { definition: _extends({}, state.definition, {
                    join: _extends({}, state.definition.join, _defineProperty({}, joinId, {
                        value: { ref: 'pipe', id: newPipeId }
                    })),
                    pipe: _extends({}, state.definition.pipe, (_extends57 = {}, _defineProperty(_extends57, newPipeId, {
                        type: 'text',
                        value: 'Default text',
                        transformations: []
                    }), _defineProperty(_extends57, pipeId, _extends({}, state.definition.pipe[pipeId], {
                        transformations: state.definition.pipe[pipeId].transformations.concat({ ref: 'join', id: joinId })
                    })), _extends57))
                }) }), true);
        }
        if (transformation === 'toUpperCase') {
            var newId = uuid();
            setState(_extends({}, state, { definition: _extends({}, state.definition, {
                    toUpperCase: _extends({}, state.definition.toUpperCase, _defineProperty({}, newId, {})),
                    pipe: _extends({}, state.definition.pipe, _defineProperty({}, pipeId, _extends({}, state.definition.pipe[pipeId], {
                        transformations: state.definition.pipe[pipeId].transformations.concat({ ref: 'toUpperCase', id: newId })
                    })))
                }) }), true);
        }
        if (transformation === 'toLowerCase') {
            var _newId = uuid();
            setState(_extends({}, state, { definition: _extends({}, state.definition, {
                    toLowerCase: _extends({}, state.definition.toLowerCase, _defineProperty({}, _newId, {})),
                    pipe: _extends({}, state.definition.pipe, _defineProperty({}, pipeId, _extends({}, state.definition.pipe[pipeId], {
                        transformations: state.definition.pipe[pipeId].transformations.concat({ ref: 'toLowerCase', id: _newId })
                    })))
                }) }), true);
        }
        if (transformation === 'toText') {
            var _newId2 = uuid();
            setState(_extends({}, state, { definition: _extends({}, state.definition, {
                    toText: _extends({}, state.definition.toText, _defineProperty({}, _newId2, {})),
                    pipe: _extends({}, state.definition.pipe, _defineProperty({}, pipeId, _extends({}, state.definition.pipe[pipeId], {
                        transformations: state.definition.pipe[pipeId].transformations.concat({ ref: 'toText', id: _newId2 })
                    })))
                }) }), true);
        }
        if (transformation === 'add') {
            var _extends65;

            var _newPipeId = uuid();
            var addId = uuid();
            setState(_extends({}, state, { definition: _extends({}, state.definition, {
                    add: _extends({}, state.definition.add, _defineProperty({}, addId, {
                        value: { ref: 'pipe', id: _newPipeId }
                    })),
                    pipe: _extends({}, state.definition.pipe, (_extends65 = {}, _defineProperty(_extends65, _newPipeId, {
                        type: 'number',
                        value: 0,
                        transformations: []
                    }), _defineProperty(_extends65, pipeId, _extends({}, state.definition.pipe[pipeId], {
                        transformations: state.definition.pipe[pipeId].transformations.concat({ ref: 'add', id: addId })
                    })), _extends65))
                }) }), true);
        }
        if (transformation === 'subtract') {
            var _extends67;

            var _newPipeId2 = uuid();
            var subtractId = uuid();
            setState(_extends({}, state, { definition: _extends({}, state.definition, {
                    subtract: _extends({}, state.definition.subtract, _defineProperty({}, subtractId, {
                        value: { ref: 'pipe', id: _newPipeId2 }
                    })),
                    pipe: _extends({}, state.definition.pipe, (_extends67 = {}, _defineProperty(_extends67, _newPipeId2, {
                        type: 'number',
                        value: 0,
                        transformations: []
                    }), _defineProperty(_extends67, pipeId, _extends({}, state.definition.pipe[pipeId], {
                        transformations: state.definition.pipe[pipeId].transformations.concat({ ref: 'subtract', id: subtractId })
                    })), _extends67))
                }) }), true);
        }
    }
    function SHOW_VIEW_NODES(e) {
        setState(_extends({}, state, {
            showingViewNodes: true
        }));
    }
    function RESET_APP() {
        setState(_extends({}, state, { definition: appDefinition }));
    }

    // Listen to app and blink every action
    var timer = null;
    var eventStack = [];
    app.addListener(function (eventName, data, e, previousState, currentState, mutations) {
        eventStack.push({ eventName: eventName, data: data, e: e, previousState: previousState, currentState: currentState, mutations: mutations });
        setState(_extends({}, state, { activeEvent: eventName }));
        // yeah, I probably needed some observables too
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            setState(_extends({}, state, { activeEvent: '' }));
        }, 500);
    });

    // Render
    function render() {
        var currentState = app.getCurrentState();
        var dragComponentLeft = (0, _h2.default)('div', {
            on: {
                mousedown: [WIDTH_DRAGGED, 'editorLeftWidth'],
                touchstart: [WIDTH_DRAGGED, 'editorLeftWidth']
            },
            style: {
                position: 'absolute',
                right: '0',
                transform: 'translateX(100%)',
                top: '0',
                width: '10px',
                height: '100%',
                textAlign: 'center',
                fontSize: '1em',
                opacity: '0',
                cursor: 'col-resize'
            }
        });
        var dragComponentRight = (0, _h2.default)('div', {
            on: {
                mousedown: [WIDTH_DRAGGED, 'editorRightWidth'],
                touchstart: [WIDTH_DRAGGED, 'editorRightWidth']
            },
            style: {
                position: 'absolute',
                left: '0',
                transform: 'translateX(-100%)',
                top: '0',
                width: '10px',
                height: '100%',
                textAlign: 'center',
                fontSize: '1em',
                opacity: '0',
                cursor: 'col-resize'
            }
        });
        var dragSubComponent = (0, _h2.default)('div', {
            on: {
                mousedown: [WIDTH_DRAGGED, 'subEditorWidth'],
                touchstart: [WIDTH_DRAGGED, 'subEditorWidth']
            },
            style: {
                position: 'absolute',
                left: '2px',
                transform: 'translateX(-100%)',
                top: '0',
                width: '10px',
                height: '100%',
                textAlign: 'center',
                fontSize: '1em',
                opacity: 0,
                cursor: 'col-resize'
            }
        });

        function emberEditor(ref, type) {
            var pipe = state.definition[ref.ref][ref.id];

            function listTransformations(transformations, transType) {
                return transformations.map(function (transRef, index) {
                    var transformer = state.definition[transRef.ref][transRef.id];
                    // if (transRef.ref === 'equal') {
                    //     return h('div', {}, [
                    //         h('div', {style: {color: '#bdbdbd', cursor: 'default', display:'flex'}}, [h('span', {style: {flex: '1'}}, transRef.ref), h('span', {style: {flex: '0'}}, transType)]),
                    //         emberEditor(transformer.value, type)
                    //     ])
                    // }
                    if (transRef.ref === 'add') {
                        return (0, _h2.default)('div', {}, [(0, _h2.default)('div', { key: index, style: { color: '#bdbdbd', cursor: 'default', display: 'flex' } }, [(0, _h2.default)('span', { style: { flex: '1' } }, transRef.ref), (0, _h2.default)('span', { style: { flex: '0', color: transformations.length - 1 !== index ? '#bdbdbd' : transType === type ? 'green' : 'red' } }, 'number')]), (0, _h2.default)('div', { style: { paddingLeft: '15px' } }, [emberEditor(transformer.value, transType)])]);
                    }
                    if (transRef.ref === 'subtract') {
                        return (0, _h2.default)('div', {}, [(0, _h2.default)('div', { key: index, style: { color: '#bdbdbd', cursor: 'default', display: 'flex' } }, [(0, _h2.default)('span', { style: { flex: '1' } }, transRef.ref), (0, _h2.default)('span', { style: { flex: '0', color: transformations.length - 1 !== index ? '#bdbdbd' : transType === type ? 'green' : 'red' } }, 'number')]), (0, _h2.default)('div', { style: { paddingLeft: '15px' } }, [emberEditor(transformer.value, transType)])]);
                    }
                    // if (transRef.ref === 'branch') {
                    //     if(resolve(transformer.predicate)){
                    //         value = transformValue(value, transformer.then)
                    //     } else {
                    //         value = transformValue(value, transformer.else)
                    //     }
                    // }
                    if (transRef.ref === 'join') {
                        return (0, _h2.default)('div', {}, [(0, _h2.default)('div', { style: { color: '#bdbdbd', cursor: 'default', display: 'flex' } }, [(0, _h2.default)('span', { style: { flex: '1' } }, transRef.ref), (0, _h2.default)('span', { style: { flex: '0', color: transformations.length - 1 !== index ? '#bdbdbd' : transType === type ? 'green' : 'red' } }, 'text')]), (0, _h2.default)('div', { style: { paddingLeft: '15px' } }, [emberEditor(transformer.value, transType)])]);
                    }
                    if (transRef.ref === 'toUpperCase') {
                        return (0, _h2.default)('div', {}, [(0, _h2.default)('div', { style: { cursor: 'default', display: 'flex' } }, [(0, _h2.default)('span', { style: { flex: '1', color: '#bdbdbd' } }, transRef.ref), (0, _h2.default)('span', { style: { flex: '0', color: transformations.length - 1 !== index ? '#bdbdbd' : transType === type ? 'green' : 'red' } }, 'text')])]);
                    }
                    if (transRef.ref === 'toLowerCase') {
                        return (0, _h2.default)('div', {}, [(0, _h2.default)('div', { style: { cursor: 'default', display: 'flex' } }, [(0, _h2.default)('span', { style: { flex: '1', color: '#bdbdbd' } }, transRef.ref), (0, _h2.default)('span', { style: { flex: '0', color: transformations.length - 1 !== index ? '#bdbdbd' : transType === type ? 'green' : 'red' } }, 'text')])]);
                    }
                    if (transRef.ref === 'toText') {
                        return (0, _h2.default)('div', {}, [(0, _h2.default)('div', { style: { cursor: 'default', display: 'flex' } }, [(0, _h2.default)('span', { style: { flex: '1', color: '#bdbdbd' } }, transRef.ref), (0, _h2.default)('span', { style: { flex: '0', color: transformations.length - 1 !== index ? '#bdbdbd' : transType === type ? 'green' : 'red' } }, 'text')])]);
                    }
                });
            }

            function genTransformators(type) {
                if (type === 'text') {
                    return [(0, _h2.default)('div', { style: { padding: '5px 10px', display: 'inline-block', borderRadius: '10px', margin: '5px', cursor: 'pointer', border: state.selectedStateNodeId ? '2px solid white' : '2px solid #bdbdbd', color: state.selectedStateNodeId ? 'white' : '#bdbdbd' }, on: { click: [CHANGE_PIPE_VALUE_TO_STATE, ref.id] } }, 'change to state'), (0, _h2.default)('div', { style: { padding: '5px 10px', display: 'inline-block', borderRadius: '10px', margin: '5px', cursor: 'pointer', border: '2px solid white' }, on: { click: [ADD_TRANSFORMATION, ref.id, 'join'] } }, 'join'), (0, _h2.default)('div', { style: { padding: '5px 10px', display: 'inline-block', borderRadius: '10px', margin: '5px', cursor: 'pointer', border: '2px solid white' }, on: { click: [ADD_TRANSFORMATION, ref.id, 'toUpperCase'] } }, 'to Upper case'), (0, _h2.default)('div', { style: { padding: '5px 10px', display: 'inline-block', borderRadius: '10px', margin: '5px', cursor: 'pointer', border: '2px solid white' }, on: { click: [ADD_TRANSFORMATION, ref.id, 'toLowerCase'] } }, 'to Lower case')];
                }
                if (type === 'number') {
                    return [(0, _h2.default)('div', { style: { padding: '5px 10px', display: 'inline-block', borderRadius: '10px', margin: '5px', cursor: 'pointer', border: state.selectedStateNodeId ? '2px solid white' : '2px solid #bdbdbd', color: state.selectedStateNodeId ? 'white' : '#bdbdbd' }, on: { click: [CHANGE_PIPE_VALUE_TO_STATE, ref.id] } }, 'change to state'), (0, _h2.default)('div', { style: { padding: '5px 10px', display: 'inline-block', borderRadius: '10px', margin: '5px', cursor: 'pointer', border: '2px solid white' }, on: { click: [ADD_TRANSFORMATION, ref.id, 'toText'] } }, 'to text'), (0, _h2.default)('div', { style: { padding: '5px 10px', display: 'inline-block', borderRadius: '10px', margin: '5px', cursor: 'pointer', border: '2px solid white' }, on: { click: [ADD_TRANSFORMATION, ref.id, 'add'] } }, 'add'), (0, _h2.default)('div', { style: { padding: '5px 10px', display: 'inline-block', borderRadius: '10px', margin: '5px', cursor: 'pointer', border: '2px solid white' }, on: { click: [ADD_TRANSFORMATION, ref.id, 'subtract'] } }, 'subtract')];
                }
            }
            if (typeof pipe.value === 'string') {
                return (0, _h2.default)('div', [(0, _h2.default)('div', { style: { display: 'flex', alignItems: 'center' }, on: { click: [SELECT_PIPE, ref.id] } }, [(0, _h2.default)('input', {
                    style: {
                        background: 'none',
                        outline: 'none',
                        padding: '0',
                        margin: '0',
                        border: 'none',
                        borderRadius: '0',
                        display: 'inline-block',
                        width: '100%',
                        color: 'white',
                        textDecoration: 'underline'
                    },
                    on: {
                        input: [CHANGE_STATIC_VALUE, ref, 'value', 'text']
                    },
                    liveProps: {
                        value: pipe.value
                    }
                }), (0, _h2.default)('div', { style: { flex: '0', cursor: 'default', color: pipe.transformations.length > 0 ? '#bdbdbd' : type === 'text' ? 'green' : 'red' } }, 'text')]), (0, _h2.default)('div', { style: { paddingLeft: '15px' } }, listTransformations(pipe.transformations, pipe.type)), (0, _h2.default)('div', state.selectedPipeId === ref.id ? genTransformators('text') : [])]);
            }

            if (!isNaN(parseFloat(Number(pipe.value))) && isFinite(Number(pipe.value))) {
                return (0, _h2.default)('div', [(0, _h2.default)('div', { style: { display: 'flex', alignItems: 'center' }, on: { click: [SELECT_PIPE, ref.id] } }, [(0, _h2.default)('input', {
                    attrs: { type: 'number' },
                    style: {
                        background: 'none',
                        outline: 'none',
                        padding: '0',
                        margin: '0',
                        border: 'none',
                        borderRadius: '0',
                        display: 'inline-block',
                        width: '100%',
                        color: 'white',
                        textDecoration: 'underline'
                    },
                    on: {
                        input: [CHANGE_STATIC_VALUE, ref, 'value', 'number']
                    },
                    liveProps: {
                        value: Number(pipe.value)
                    }
                }), (0, _h2.default)('div', { style: { flex: '0', cursor: 'default', color: pipe.transformations.length > 0 ? '#bdbdbd' : type === 'number' ? 'green' : 'red' } }, 'number')]), (0, _h2.default)('div', { style: { paddingLeft: '15px' } }, listTransformations(pipe.transformations, pipe.type)), (0, _h2.default)('div', state.selectedPipeId === ref.id ? genTransformators('number') : [])]);
            }

            if (pipe.value.ref === 'state') {
                var displState = state.definition[pipe.value.ref][pipe.value.id];
                return (0, _h2.default)('div', [(0, _h2.default)('div', { style: { display: 'flex', alignItems: 'center' }, on: { click: [SELECT_PIPE, ref.id] } }, [(0, _h2.default)('div', { style: { flex: '1' } }, [(0, _h2.default)('div', {
                    style: { cursor: 'pointer', color: state.selectedStateNodeId === pipe.value.id ? '#eab65c' : 'white', padding: '2px 5px', margin: '3px 3px 0 0', border: '2px solid ' + (state.selectedStateNodeId === pipe.value.id ? '#eab65c' : 'white'), borderRadius: '10px', display: 'inline-block' },
                    on: { click: [STATE_NODE_SELECTED, pipe.value.id] }
                }, [displState.title])]), (0, _h2.default)('div', { style: { flex: '0', cursor: 'default', color: pipe.transformations.length > 0 ? '#bdbdbd' : displState.type === type ? 'green' : 'red' } }, displState.type)]), (0, _h2.default)('div', { style: { paddingLeft: '15px' } }, listTransformations(pipe.transformations, pipe.type)), (0, _h2.default)('div', state.selectedPipeId === ref.id ? pipe.transformations.length === 0 ? genTransformators(displState.type) : pipe.transformations[pipe.transformations.length - 1].ref === 'add' || pipe.transformations[pipe.transformations.length - 1].ref === 'subtract' ? genTransformators('number') : genTransformators('text') : []) // TODO fix, a hack for demo, type should be last transformation not just text
                ]);
            }
            if (pipe.value.ref === 'eventData') {
                var eventData = state.definition[pipe.value.ref][pipe.value.id];
                return (0, _h2.default)('div', [(0, _h2.default)('div', { style: { display: 'flex', alignItems: 'center' }, on: { click: [SELECT_PIPE, ref.id] } }, [(0, _h2.default)('div', { style: { flex: '1' } }, [(0, _h2.default)('div', {
                    style: { cursor: 'pointer', color: state.selectedStateNodeId === pipe.value.id ? '#eab65c' : 'white', padding: '2px 5px', margin: '3px 3px 0 0', border: '2px solid ' + (state.selectedStateNodeId === pipe.value.id ? '#eab65c' : 'white'), display: 'inline-block' },
                    on: { click: [STATE_NODE_SELECTED, pipe.value.id] }
                }, [eventData.title])]), (0, _h2.default)('div', { style: { flex: '0', cursor: 'default', color: pipe.transformations.length > 0 ? '#bdbdbd' : eventData.type === type ? 'green' : 'red' } }, eventData.type)]), (0, _h2.default)('div', { style: { paddingLeft: '15px' } }, listTransformations(pipe.transformations, pipe.type))]);
            }
        }

        function listNameSpace(stateId) {
            var currentNameSpace = state.definition.nameSpace[stateId];
            function editingNode() {
                return (0, _h2.default)('input', {
                    style: {
                        background: 'none',
                        color: state.selectedStateNodeId === stateId ? '#eab65c' : 'white',
                        outline: 'none',
                        boxShadow: 'inset 0 -1px 0 0 white',
                        padding: '0',
                        margin: '0',
                        border: 'none',
                        borderRadius: '0',
                        display: 'inline',
                        font: 'inherit'
                    },
                    on: {
                        input: [CHANGE_NAMESPACE_TITLE, stateId]
                    },
                    liveProps: {
                        value: currentNameSpace.title
                    },
                    attrs: {
                        autofocus: true,
                        'data-istitleeditor': true
                    }
                });
            }
            var closed = state.viewFoldersClosed[stateId] || state.selectedStateNodeId !== stateId && currentNameSpace.children.length === 0;
            return (0, _h2.default)('div', {
                style: {
                    position: 'relative'
                }
            }, [(0, _h2.default)('div', [(0, _h2.default)('svg', {
                attrs: { width: 12, height: 16 },
                style: { cursor: 'pointer', padding: '0 5px', transform: closed ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'all 0.2s', marginLeft: '-10px' },
                on: {
                    click: [VIEW_FOLDER_CLICKED, stateId]
                }
            }, [(0, _h2.default)('polygon', { attrs: { points: '12,8 0,1 3,8 0,15' }, style: { fill: state.selectedStateNodeId === stateId ? '#eab65c' : 'white', transition: 'fill 0.2s' } })]), state.editingTitleNodeId === stateId ? editingNode() : (0, _h2.default)('span', { style: { cursor: 'pointer' }, on: { click: [STATE_NODE_SELECTED, stateId], dblclick: [EDIT_VIEW_NODE_TITLE, stateId] } }, [(0, _h2.default)('span', { style: { color: state.selectedStateNodeId === stateId ? '#eab65c' : 'white', transition: 'color 0.2s' } }, currentNameSpace.title)])]), (0, _h2.default)('div', { style: { display: closed ? 'none' : 'block', paddingLeft: '10px', paddingBottom: '5px', borderLeft: state.selectedStateNodeId === stateId ? '2px solid #eab65c' : '2px solid #bdbdbd', transition: 'border-color 0.2s' } }, [].concat(_toConsumableArray(currentNameSpace.children.map(function (ref) {
                return ref.ref === 'state' ? listState(ref.id) : listNameSpace(ref.id);
            })), [(0, _h2.default)('span', { style: { display: state.selectedStateNodeId === stateId ? 'inline-block' : 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #eab65c', padding: '5px', margin: '5px' }, on: { click: [ADD_STATE, stateId, 'text'] } }, '+ text'), (0, _h2.default)('span', { style: { display: state.selectedStateNodeId === stateId ? 'inline-block' : 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #eab65c', padding: '5px', margin: '5px' }, on: { click: [ADD_STATE, stateId, 'number'] } }, '+ number'),
            //h('span', {style: {display: state.selectedStateNodeId === stateId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #eab65c', padding: '5px', margin: '5px'}, on: {click: [ADD_STATE, stateId, 'boolean']}}, '+ variant'),
            //h('span', {style: {display: state.selectedStateNodeId === stateId ? 'inline-block': 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #eab65c', padding: '5px', margin: '5px'}, on: {click: [ADD_STATE, stateId, 'table']}}, '+ table'),
            (0, _h2.default)('span', { style: { display: state.selectedStateNodeId === stateId ? 'inline-block' : 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #eab65c', padding: '5px', margin: '5px' }, on: { click: [ADD_STATE, stateId, 'namespace'] } }, '+ folder')]))]);
        }
        function listState(stateId) {
            var currentState = state.definition.state[stateId];
            function editingNode() {
                return (0, _h2.default)('input', {
                    style: {
                        background: 'none',
                        color: state.selectedStateNodeId === stateId ? '#eab65c' : 'white',
                        outline: 'none',
                        boxShadow: 'none',
                        padding: '2px 5px',
                        margin: '3px 3px 0 0',
                        border: '2px solid ' + (state.selectedStateNodeId === stateId ? '#eab65c' : '#bdbdbd'),
                        borderRadius: '10px',
                        display: 'inline',
                        font: 'inherit'
                    },
                    on: {
                        input: [CHANGE_STATE_NODE_TITLE, stateId]
                    },
                    liveProps: {
                        value: currentState.title
                    },
                    attrs: {
                        autofocus: true,
                        'data-istitleeditor': true
                    }
                });
            }
            return (0, _h2.default)('div', {
                style: {
                    cursor: 'pointer',
                    position: 'relative',
                    fontSize: '0.8em'
                }
            }, [(0, _h2.default)('span', { on: { click: [STATE_NODE_SELECTED, stateId], dblclick: [EDIT_VIEW_NODE_TITLE, stateId] } }, [state.editingTitleNodeId === stateId ? editingNode() : (0, _h2.default)('span', { style: { color: state.selectedStateNodeId === stateId ? '#eab65c' : 'white', padding: '2px 5px', margin: '7px 3px 2px 0', border: '2px solid ' + (state.selectedStateNodeId === stateId ? '#eab65c' : '#bdbdbd'), borderRadius: '10px', display: 'inline-block', transition: 'all 0.2s' } }, currentState.title)]), (0, _h2.default)('span', ': '), function () {
                var noStyleInput = {
                    color: app.getCurrentState()[stateId] != state.definition.state[stateId].defaultValue ? 'rgb(91, 204, 91)' : 'white',
                    background: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    display: 'inline',
                    border: 'none',
                    maxWidth: '50%'
                };
                if (currentState.type === 'text') return (0, _h2.default)('input', { attrs: { type: 'text' }, liveProps: { value: app.getCurrentState()[stateId] }, style: noStyleInput, on: { input: [CHANGE_CURRENT_STATE_TEXT_VALUE, stateId] } });
                if (currentState.type === 'number') return (0, _h2.default)('span', { style: { position: 'relative' } }, [(0, _h2.default)('input', { attrs: { type: 'number' }, liveProps: { value: app.getCurrentState()[stateId] }, style: _extends({}, noStyleInput, { width: 9 * app.getCurrentState()[stateId].toString().length + 'px' }), on: { input: [CHANGE_CURRENT_STATE_NUMBER_VALUE, stateId] } })]);
                if (currentState.type === 'table') {
                    var _ret = function () {
                        var table = app.getCurrentState()[stateId];
                        return {
                            v: (0, _h2.default)('div', {
                                style: {
                                    marginTop: '3px',
                                    background: '#828183',
                                    width: '100%'
                                }
                            }, [(0, _h2.default)('div', { style: { display: 'flex' } }, Object.keys(currentState.definition).map(function (key) {
                                return (0, _h2.default)('div', { style: { flex: '1', padding: '2px 5px', borderBottom: '2px solid white' } }, key);
                            }))].concat(_toConsumableArray(Object.keys(table).map(function (id) {
                                return (0, _h2.default)('div', { style: { display: 'flex' } }, Object.keys(table[id]).map(function (key) {
                                    return (0, _h2.default)('div', { style: { flex: '1', padding: '2px 5px' } }, table[id][key]);
                                }));
                            }))))
                        };
                    }();

                    if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
                }
            }(), state.selectedStateNodeId === stateId ? (0, _h2.default)('span', currentState.mutators.map(function (ref) {
                return (0, _h2.default)('div', {
                    style: { color: state.activeEvent === state.definition.mutator[ref.id].event.id ? '#5bcc5b' : 'white', transition: 'all 0.2s', boxShadow: state.selectedEventId === state.definition.mutator[ref.id].event.id ? '#5bcc5b 5px 0 0px 0px inset' : 'none', padding: '0 0 0 7px' },
                    on: {
                        click: [SELECT_EVENT, state.definition.mutator[ref.id].event.id],
                        dblclick: [EDIT_EVENT_TITLE, state.definition.mutator[ref.id].event.id]
                    }
                }, [(0, _h2.default)('span', ['• ', state.editingTitleNodeId === state.definition.mutator[ref.id].event.id ? (0, _h2.default)('input', {
                    style: {
                        background: 'none',
                        color: 'white',
                        outline: 'none',
                        boxShadow: 'inset 0 -1px 0 0 white',
                        padding: '0',
                        margin: '0',
                        border: 'none',
                        borderRadius: '0',
                        display: 'inline',
                        font: 'inherit'
                    },
                    on: {
                        input: [CHANGE_EVENT_TITLE, state.definition.mutator[ref.id].event.id]
                    },
                    liveProps: {
                        value: state.definition.event[state.definition.mutator[ref.id].event.id].title
                    },
                    attrs: {
                        autofocus: true,
                        'data-istitleeditor': true
                    }
                }) : state.definition.event[state.definition.mutator[ref.id].event.id].title]), state.selectedEventId === state.definition.mutator[ref.id].event.id ? (0, _h2.default)('div', { style: { marginLeft: '10px' } }, [emberEditor(state.definition.mutator[ref.id].mutation, currentState.type)]) : (0, _h2.default)('div')]);
            })) : (0, _h2.default)('span')]);
        }

        var stateComponent = (0, _h2.default)('div', { attrs: { class: 'better-scrollbar' }, style: { overflow: 'auto', flex: '1', padding: '6px 15px' }, on: { click: [UNSELECT_STATE_NODE] } }, [listNameSpace('_rootNameSpace')]);

        function listBoxNode(nodeRef, parentRef, position) {
            var nodeId = nodeRef.id;
            var parentId = parentRef.id;
            var node = state.definition[nodeRef.ref][nodeId];
            function editingNode() {
                return (0, _h2.default)('input', {
                    style: {
                        border: 'none',
                        background: 'none',
                        color: '#53B2ED',
                        outline: 'none',
                        padding: '0',
                        boxShadow: 'inset 0 -1px 0 0 #53B2ED',
                        font: 'inherit'
                    },
                    on: {
                        input: [CHANGE_VIEW_NODE_TITLE, nodeRef]
                    },
                    liveProps: {
                        value: node.title
                    },
                    attrs: {
                        autofocus: true,
                        'data-istitleeditor': true
                    }
                });
            }
            var closed = state.viewFoldersClosed[nodeId];
            return (0, _h2.default)('div', {
                style: {
                    position: 'relative'
                }
            }, [(0, _h2.default)('div', { style: { display: 'flex', alignItems: 'center' } }, [nodeRef.ref === 'vNodeBox' && node.children.length > 0 ? (0, _h2.default)('svg', {
                attrs: { width: 12, height: 16 },
                style: { cursor: 'pointer', padding: '0 5px', transform: closed ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'all 0.2s', marginLeft: '-3px' },
                on: {
                    click: [VIEW_FOLDER_CLICKED, nodeId]
                }
            }, [(0, _h2.default)('polygon', { attrs: { points: '12,8 0,1 3,8 0,15' }, style: { fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white', transition: 'fill 0.2s' } })]) : (0, _h2.default)('span'), (0, _h2.default)('svg', {
                attrs: { width: 14, height: 14 },
                style: { cursor: 'pointer', padding: '0 5px 0 0' },
                on: { click: [VIEW_NODE_SELECTED, nodeRef] }
            }, nodeRef.ref === 'vNodeBox' ? [(0, _h2.default)('rect', { attrs: { x: 1, y: 1, width: 12, height: 12, fill: 'none', transition: 'all 0.2s', stroke: state.selectedViewNode.id === nodeId ? '#53B2ED' : '#bdbdbd', 'stroke-width': '2' } })] : nodeRef.ref === 'vNodeList' ? [(0, _h2.default)('circle', { attrs: { r: 2, cx: 2, cy: 2, transition: 'all 0.2s', fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : '#bdbdbd' } }), (0, _h2.default)('rect', { attrs: { x: 6, y: 1, width: 10, transition: 'all 0.2s', height: 2, fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : '#bdbdbd' } }), (0, _h2.default)('circle', { attrs: { r: 2, cx: 2, cy: 7, transition: 'all 0.2s', fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : '#bdbdbd' } }), (0, _h2.default)('rect', { attrs: { x: 6, y: 6, width: 10, transition: 'all 0.2s', height: 2, fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : '#bdbdbd' } }), (0, _h2.default)('circle', { attrs: { r: 2, cx: 2, cy: 12, transition: 'all 0.2s', fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : '#bdbdbd' } }), (0, _h2.default)('rect', { attrs: { x: 6, y: 11, width: 10, transition: 'all 0.2s', height: 2, fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : '#bdbdbd' } })] : [(0, _h2.default)('text', { attrs: { x: 3, y: 14, fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : '#bdbdbd' } }, '?')]), state.editingTitleNodeId === nodeId ? editingNode() : (0, _h2.default)('span', { style: { flex: '1', cursor: 'pointer', color: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white', transition: 'color 0.2s' }, on: { click: [VIEW_NODE_SELECTED, nodeRef], dblclick: [EDIT_VIEW_NODE_TITLE, nodeId] } }, node.title)]), (0, _h2.default)('div', {
                style: { display: closed ? 'none' : 'block', marginLeft: '7px', paddingLeft: '10px', borderLeft: nodeRef.ref === 'vNodeBox' ? state.selectedViewNode.id === nodeId ? '2px solid #53B2ED' : '2px solid #bdbdbd' : 'none', transition: 'border-color 0.2s' },
                on: {
                    mouseover: state.currentlyDragging ? [DRAGGED_OVER_ME, nodeRef] : undefined
                } }, [].concat(_toConsumableArray(node.children.map(function (ref, index) {
                if (ref.ref === 'vNodeText') return listTextNode(ref, nodeRef, index);
                if (ref.ref === 'vNodeBox' || ref.ref === 'vNodeList' || ref.ref === 'vNodeIf') return listBoxNode(ref, nodeRef, index);
                if (ref.ref === 'vNodeInput') return listInputNode(ref, nodeRef, index);
            }))))]);
        }
        function listTextNode(nodeRef, parentRef, position) {
            var nodeId = nodeRef.id;
            var parentId = parentRef.id;
            var node = state.definition.vNodeText[nodeId];
            function editingNode() {
                return (0, _h2.default)('input', {
                    style: {
                        border: 'none',
                        background: 'none',
                        color: '#53B2ED',
                        outline: 'none',
                        padding: '0',
                        boxShadow: 'inset 0 -1px 0 0 #53B2ED',
                        font: 'inherit'
                    },
                    on: {
                        input: [CHANGE_VIEW_NODE_TITLE, nodeRef]
                    },
                    liveProps: {
                        value: node.title
                    },
                    attrs: {
                        autofocus: true,
                        'data-istitleeditor': true
                    }
                });
            }
            return (0, _h2.default)('div', {
                style: {
                    cursor: 'pointer',
                    position: 'relative'
                },
                on: { click: [VIEW_NODE_SELECTED, nodeRef], dblclick: [EDIT_VIEW_NODE_TITLE, nodeId] }
            }, [(0, _h2.default)('svg', {
                attrs: { viewBox: '0 0 300 300', width: 14, height: 14 },
                style: { cursor: 'pointer', padding: '0 7px 0 0' }
            }, [(0, _h2.default)('path', { attrs: { d: 'M 0 0 L 0 85.8125 L 27.03125 85.8125 C 36.617786 44.346316 67.876579 42.179793 106.90625 42.59375 L 106.90625 228.375 C 107.31101 279.09641 98.908386 277.33602 62.125 277.5 L 62.125 299.5625 L 149 299.5625 L 150.03125 299.5625 L 236.90625 299.5625 L 236.90625 277.5 C 200.12286 277.336 191.72024 279.09639 192.125 228.375 L 192.125 42.59375 C 231.15467 42.17975 262.41346 44.346304 272 85.8125 L 299.03125 85.8125 L 299.03125 0 L 150.03125 0 L 149 0 L 0 0 z', fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : '#bdbdbd' } })]), state.editingTitleNodeId === nodeId ? editingNode() : (0, _h2.default)('span', { style: { color: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white', transition: 'color 0.2s' } }, node.title)]);
        }
        function listInputNode(nodeRef, parentRef, position) {
            var nodeId = nodeRef.id;
            var parentId = parentRef.id;
            var node = state.definition.vNodeInput[nodeId];
            function editingNode() {
                return (0, _h2.default)('input', {
                    style: {
                        border: 'none',
                        background: 'none',
                        color: '#53B2ED',
                        outline: 'none',
                        padding: '0',
                        boxShadow: 'inset 0 -1px 0 0 #53B2ED',
                        font: 'inherit'
                    },
                    on: {
                        input: [CHANGE_VIEW_NODE_TITLE, nodeRef]
                    },
                    liveProps: {
                        value: node.title
                    },
                    attrs: {
                        autofocus: true,
                        'data-istitleeditor': true
                    }
                });
            }
            return (0, _h2.default)('div', {
                style: {
                    cursor: 'pointer',
                    position: 'relative'
                },
                on: { click: [VIEW_NODE_SELECTED, nodeRef], dblclick: [EDIT_VIEW_NODE_TITLE, nodeId] }
            }, [(0, _h2.default)('svg', {
                attrs: { viewBox: '0 0 16 16', width: 14, height: 14 },
                style: { cursor: 'pointer', padding: '0 7px 0 0' }
            }, [(0, _h2.default)('path', { attrs: { d: 'M 15,2 11,2 C 10.447,2 10,1.552 10,1 10,0.448 10.447,0 11,0 l 4,0 c 0.553,0 1,0.448 1,1 0,0.552 -0.447,1 -1,1 z m -2,14 c -0.553,0 -1,-0.447 -1,-1 L 12,1 c 0,-0.552 0.447,-1 1,-1 0.553,0 1,0.448 1,1 l 0,14 c 0,0.553 -0.447,1 -1,1 z m 2,0 -4,0 c -0.553,0 -1,-0.447 -1,-1 0,-0.553 0.447,-1 1,-1 l 4,0 c 0.553,0 1,0.447 1,1 0,0.553 -0.447,1 -1,1 z', fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white' } }), (0, _h2.default)('path', { attrs: { d: 'M 9.8114827,4.2360393 C 9.6547357,4.5865906 9.3039933,4.8295854 8.8957233,4.8288684 L 1.2968926,4.8115404 1.3169436,2.806447 8.9006377,2.828642 c 0.552448,0.00165 0.9993074,0.4501223 0.9976564,1.0025698 -2.1e-5,0.1445856 -0.0313,0.2806734 -0.08681,0.404827 z', fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white' } }), (0, _h2.default)('path', { attrs: { d: 'm 9.8114827,11.738562 c -0.156747,0.350551 -0.5074894,0.593546 -0.9157594,0.592829 l -7.5988307,-0.01733 0.020051,-2.005093 7.5836941,0.02219 c 0.552448,0.0016 0.9993074,0.450122 0.9976564,1.00257 -2.1e-5,0.144585 -0.0313,0.280673 -0.08681,0.404827 z', fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white' } }), (0, _h2.default)('path', { attrs: { d: 'm 1.2940583,12.239836 0.01704,-9.4450947 1.9714852,0.024923 -0.021818,9.4262797 z', fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white' } })]), state.editingTitleNodeId === nodeId ? editingNode() : (0, _h2.default)('span', { style: { color: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white', transition: 'color 0.2s' } }, node.title)]);
        }

        var propsComponent = (0, _h2.default)('div', {
            style: {
                background: state.selectedViewSubMenu === 'props' ? '#4d4d4d' : '#3d3d3d',
                padding: '12px 15px 8px',
                position: 'absolute',
                top: '0',
                left: '6px',
                zIndex: state.selectedViewSubMenu === 'props' ? '500' : '0',
                cursor: 'pointer',
                borderRadius: '15px 15px 0 0',
                borderColor: '#222',
                borderStyle: 'solid',
                borderWidth: '3px 3px 0 3px'
            },
            on: {
                click: [SELECT_VIEW_SUBMENU, 'props']
            }
        }, 'props');
        var styleComponent = (0, _h2.default)('div', {
            style: {
                background: state.selectedViewSubMenu === 'style' ? '#4d4d4d' : '#3d3d3d',
                padding: '12px 15px 8px',
                position: 'absolute',
                top: '0',
                left: '91px',
                zIndex: state.selectedViewSubMenu === 'style' ? '500' : '0',
                cursor: 'pointer',
                borderRadius: '15px 15px 0 0',
                borderColor: '#222',
                borderStyle: 'solid',
                borderWidth: '3px 3px 0 3px'
            },
            on: {
                click: [SELECT_VIEW_SUBMENU, 'style']
            }
        }, 'style');
        var eventsComponent = (0, _h2.default)('div', {
            style: {
                background: state.selectedViewSubMenu === 'events' ? '#4d4d4d' : '#3d3d3d',
                padding: '12px 15px 8px',
                position: 'absolute',
                top: '0',
                left: '165px',
                zIndex: state.selectedViewSubMenu === 'events' ? '500' : '0',
                cursor: 'pointer',
                borderRadius: '15px 15px 0 0',
                borderColor: '#222',
                borderStyle: 'solid',
                borderWidth: '3px 3px 0 3px'
            },
            on: {
                click: [SELECT_VIEW_SUBMENU, 'events']
            }
        }, 'events');
        var unselectComponent = (0, _h2.default)('div', {
            style: {
                background: '#4d4d4d',
                padding: '15px 23px 5px',
                position: 'absolute',
                top: '0',
                right: '16px',
                zIndex: '100',
                cursor: 'pointer',
                borderRadius: '15px 15px 0 0',
                borderColor: '#222',
                borderStyle: 'solid',
                borderWidth: '3px 3px 0 3px'
            },
            on: {
                click: [UNSELECT_VIEW_NODE]
            }
        }, 'x');

        function generateEditNodeComponent() {
            var styles = ['background', 'border', 'outline', 'cursor', 'color', 'display', 'top', 'bottom', 'left', 'right', 'position', 'overflow', 'height', 'width', 'font', 'font', 'margin', 'padding', 'userSelect'];
            var selectedNode = state.definition[state.selectedViewNode.ref][state.selectedViewNode.id];
            var genpropsSubmenuComponent = function genpropsSubmenuComponent() {
                return (0, _h2.default)('div', [function () {
                    if (state.selectedViewNode.ref === 'vNodeBox') {
                        return (0, _h2.default)('div', {
                            style: {
                                textAlign: 'center',
                                marginTop: '100px',
                                color: '#bdbdbd'
                            }
                        }, 'Component has no props');
                    }
                    if (state.selectedViewNode.ref === 'vNodeText') {
                        return (0, _h2.default)('div', { style: { paddingTop: '20px' } }, [(0, _h2.default)('div', {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                background: '#676767',
                                padding: '5px 10px',
                                marginBottom: '10px'
                            }
                        }, [(0, _h2.default)('span', { style: { flex: '1' } }, 'text value'), (0, _h2.default)('div', { style: { flex: '0', cursor: 'default', color: '#bdbdbd' } }, 'text')]), (0, _h2.default)('div', { style: { padding: '5px 10px' } }, [emberEditor(selectedNode.value, 'text')])]);
                    }
                    if (state.selectedViewNode.ref === 'vNodeInput') {
                        return (0, _h2.default)('div', { style: { paddingTop: '20px' } }, [(0, _h2.default)('div', {
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                background: '#676767',
                                padding: '5px 10px',
                                marginBottom: '10px'
                            }
                        }, [(0, _h2.default)('span', { style: { flex: '1' } }, 'input value'), (0, _h2.default)('div', { style: { flex: '0', cursor: 'default', color: '#bdbdbd' } }, 'text')]), (0, _h2.default)('div', { style: { padding: '5px 10px' } }, [emberEditor(selectedNode.value, 'text')])]);
                    }
                    if (state.selectedViewNode.ref === 'vNodeList') {
                        return (0, _h2.default)('div', {
                            style: {
                                textAlign: 'center',
                                marginTop: '100px',
                                color: '#bdbdbd'
                            }
                        }, 'TODO ADD PROPS');
                    }
                    if (state.selectedViewNode.ref === 'vNodeIf') {
                        return (0, _h2.default)('div', {
                            style: {
                                textAlign: 'center',
                                marginTop: '100px',
                                color: '#bdbdbd'
                            }
                        }, 'TODO ADD PROPS');
                    }
                }()]);
            };
            var genstyleSubmenuComponent = function genstyleSubmenuComponent() {
                var selectedStyle = state.definition.style[selectedNode.style.id];
                return (0, _h2.default)('div', [function () {
                    return (0, _h2.default)('div', { style: {} }, Object.keys(selectedStyle).map(function (key) {
                        return (0, _h2.default)('div', [(0, _h2.default)('input', {
                            style: {
                                border: 'none',
                                background: 'none',
                                color: 'white',
                                outline: 'none',
                                padding: '0',
                                boxShadow: 'inset 0 -1px 0 0 white',
                                display: 'inline-block',
                                width: '160px',
                                margin: '10px'
                            },
                            props: { value: selectedStyle[key] },
                            on: { input: [CHANGE_STYLE, selectedNode.style.id, key] }
                        }), (0, _h2.default)('span', key)]);
                    }));
                }(), function () {
                    return (0, _h2.default)('div', { style: {} }, styles.filter(function (key) {
                        return !Object.keys(selectedStyle).includes(key);
                    }).map(function (key) {
                        return (0, _h2.default)('div', {
                            on: { click: [ADD_DEFAULT_STYLE, selectedNode.style.id, key] },
                            style: {
                                display: 'inline-block',
                                cursor: 'pointer',
                                borderRadius: '5px',
                                border: '3px solid white',
                                padding: '5px',
                                margin: '5px'
                            }
                        }, '+ ' + key);
                    }));
                }()]);
            };
            var geneventsSubmenuComponent = function geneventsSubmenuComponent() {
                var availableEvents = [{
                    description: 'on click',
                    propertyName: 'click'
                }, {
                    description: 'double clicked',
                    propertyName: 'dblclick'
                }, {
                    description: 'mouse over',
                    propertyName: 'mouseover'
                }, {
                    description: 'mouse out',
                    propertyName: 'mouseout'
                }];
                if (state.selectedViewNode.ref === 'vNodeInput') {
                    availableEvents = availableEvents.concat([{
                        description: 'input',
                        propertyName: 'input'
                    }, {
                        description: 'focus',
                        propertyName: 'focus'
                    }, {
                        description: 'blur',
                        propertyName: 'blur'
                    }]);
                }
                var currentEvents = availableEvents.filter(function (event) {
                    return selectedNode[event.propertyName];
                });
                var eventsLeft = availableEvents.filter(function (event) {
                    return !selectedNode[event.propertyName];
                });

                return (0, _h2.default)('div', { style: { paddingTop: '20px' } }, eventsLeft.map(function (event) {
                    return (0, _h2.default)('div', {
                        style: {
                            display: 'inline-block',
                            border: '3px solid #5bcc5b',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            padding: '5px',
                            margin: '10px'
                        }, on: { click: [ADD_EVENT, event.propertyName] }
                    }, '+ ' + event.description);
                }).concat(currentEvents.length ? currentEvents.map(function (event) {
                    return (0, _h2.default)('div', [(0, _h2.default)('div', { style: { background: '#676767', padding: '5px 10px' } }, event.description), (0, _h2.default)('div', {
                        style: {
                            color: state.activeEvent === selectedNode[event.propertyName].id ? '#5bcc5b' : 'white',
                            transition: 'color 0.2s',
                            fontSize: '0.8em',
                            cursor: 'pointer',
                            padding: '5px 10px',
                            boxShadow: state.selectedEventId === selectedNode[event.propertyName].id ? '#5bcc5b 5px 0 0px 0px inset' : 'none'
                        },
                        on: {
                            click: [SELECT_EVENT, selectedNode[event.propertyName].id],
                            dblclick: [EDIT_EVENT_TITLE, selectedNode[event.propertyName].id]
                        }
                    }, [(0, _h2.default)('span', {}, ['• ', state.editingTitleNodeId === selectedNode[event.propertyName].id ? (0, _h2.default)('input', {
                        style: {
                            background: 'none',
                            color: 'white',
                            outline: 'none',
                            boxShadow: 'inset 0 -1px 0 0 white',
                            padding: '0',
                            margin: '0',
                            border: 'none',
                            borderRadius: '0',
                            display: 'inline',
                            font: 'inherit'
                        },
                        on: {
                            input: [CHANGE_EVENT_TITLE, selectedNode[event.propertyName].id]
                        },
                        liveProps: {
                            value: state.definition.event[selectedNode[event.propertyName].id].title
                        },
                        attrs: {
                            autofocus: true,
                            'data-istitleeditor': true
                        }
                    }) : state.definition.event[selectedNode[event.propertyName].id].title])])]);
                }) : []));
            };

            var fullVNode = state.selectedViewNode.ref === 'vNodeBox' || state.selectedViewNode.ref === 'vNodeText' || state.selectedViewNode.ref === 'vNodeInput';

            return (0, _h2.default)('div', {
                style: {
                    position: 'absolute',
                    left: '-8px',
                    transform: 'translate(-100%, 0)',
                    marginRight: '8px',
                    bottom: '6px',
                    height: '50%',
                    display: 'flex',
                    flexDirection: 'column'
                }
            }, [(0, _h2.default)('div', { style: { flex: '1', maxHeight: '43px', minHeight: '43px', position: 'relative', marginTop: '6px' } }, fullVNode ? [eventsComponent, styleComponent, propsComponent, unselectComponent] : [unselectComponent]), (0, _h2.default)('div', { attrs: { class: 'better-scrollbar' }, style: { flex: '1', overflow: 'auto', background: '#4d4d4d', borderRadius: '10px', width: state.subEditorWidth + 'px', border: '3px solid #222' } }, [dragSubComponent, state.selectedViewSubMenu === 'props' || !fullVNode ? genpropsSubmenuComponent() : state.selectedViewSubMenu === 'style' ? genstyleSubmenuComponent() : state.selectedViewSubMenu === 'events' ? geneventsSubmenuComponent() : (0, _h2.default)('span', 'Error, no such menu')])]);
        }

        var addStateComponent = (0, _h2.default)('div', { style: { cursor: 'pointer', flex: '0 auto', background: '#333', height: '40px', display: 'flex', alignItems: 'center' } }, [(0, _h2.default)('span', { style: { cursor: 'pointer', padding: '0 5px' } }, 'add state')]);

        function generateSelectViewNodeComponent() {
            return (0, _h2.default)('div', {
                style: {
                    position: 'absolute',
                    left: '0px',
                    bottom: '0px',
                    height: '50%',
                    display: 'flex',
                    flexDirection: 'column'
                }
            }, [(0, _h2.default)('div', { attrs: { class: 'better-scrollbar' }, style: { margin: '40px 3px 0 0', flex: '1', overflow: 'auto', background: '#333', width: state.editorRightWidth + 'px' } }, [(0, _h2.default)('div', { style: { padding: '5px', margin: '5px' } }, 'drag and drop components into the component tree or into live application'), (0, _h2.default)('div', { style: { cursor: 'pointer', borderRadius: '5px', border: '3px solid #53B2ED', padding: '5px', margin: '5px' }, on: {
                    mousedown: [NODE_DRAGGED, 'box'],
                    touchstart: [NODE_DRAGGED, 'box']
                } }, '+ box'), (0, _h2.default)('div', { style: { cursor: 'pointer', borderRadius: '5px', border: '3px solid #53B2ED', padding: '5px', margin: '5px' }, on: {
                    mousedown: [NODE_DRAGGED, 'text'],
                    touchstart: [NODE_DRAGGED, 'text']
                } }, '+ text'), (0, _h2.default)('div', { style: { cursor: 'pointer', borderRadius: '5px', border: '3px solid #53B2ED', padding: '5px', margin: '5px' }, on: {
                    mousedown: [NODE_DRAGGED, 'input'],
                    touchstart: [NODE_DRAGGED, 'input']
                } }, '+ input')])]);
        }

        var addViewNodeComponent = (0, _h2.default)('div', { style: { cursor: 'pointer', flex: '0 auto', background: '#333', height: '40px', display: 'flex', alignItems: 'center' }, on: { click: [SHOW_VIEW_NODES] } }, [(0, _h2.default)('span', { style: { cursor: 'pointer', padding: '0 5px' } }, 'add component')]);

        var viewComponent = (0, _h2.default)('div', { attrs: { class: 'better-scrollbar' }, style: { overflow: 'auto', position: 'relative', flex: '1', padding: '6px 8px' }, on: { click: [UNSELECT_VIEW_NODE] } }, [listBoxNode({ ref: 'vNodeBox', id: '_rootNode' }, {})]);

        var rightComponent = (0, _h2.default)('div', {
            style: {
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: '0',
                right: '0',
                color: 'white',
                height: '100%',
                font: "300 1.2em 'Open Sans'",
                lineHeight: '1.2em',
                width: state.editorRightWidth + 'px',
                background: '#4d4d4d',
                boxSizing: "border-box",
                borderLeft: '3px solid #222',
                transition: '0.5s transform',
                transform: state.rightOpen ? 'translateZ(0) translateX(0%)' : 'translateZ(0) translateX(100%)',
                userSelect: 'none'
            }
        }, [dragComponentRight, addStateComponent, stateComponent, addViewNodeComponent, viewComponent, state.showingViewNodes ? generateSelectViewNodeComponent() : state.selectedViewNode.ref ? generateEditNodeComponent() : (0, _h2.default)('span')]);

        var topComponent = (0, _h2.default)('div', {
            style: {
                flex: '1 auto',
                height: '75px',
                maxHeight: '75px',
                minHeight: '75px',
                background: '#222',
                display: 'flex',
                justifyContent: 'center',
                fontFamily: "'Comfortaa', sans-serif"
            }
        }, [(0, _h2.default)('a', { style: { flex: '0 auto', width: '190px', textDecoration: 'inherit', userSelect: 'none' }, attrs: { href: '/_dev' } }, [(0, _h2.default)('img', { style: { margin: '7px -2px -3px 5px', display: 'inline-block' }, attrs: { src: '/images/logo256x256.png', height: '57' } }), (0, _h2.default)('span', { style: { fontSize: '44px', verticalAlign: 'bottom', color: '#fff' } }, 'ugnis')]), (0, _h2.default)('div', { style: {
                position: 'absolute',
                top: '0',
                right: '0',
                background: '#9c4848',
                borderRadius: '10px',
                border: 'none',
                color: 'white',
                display: 'inline-block',
                padding: '15px 20px',
                margin: '13px',
                cursor: 'pointer'
            },
            on: {
                click: RESET_APP
            }
        }, 'reset demo')]);
        var leftComponent = (0, _h2.default)('div', {
            style: {
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: '0',
                left: '0',
                height: '100%',
                color: 'white',
                font: "300 1.2em 'Open Sans'",
                lineHeight: '1.2em',
                width: state.editorLeftWidth + 'px',
                background: '#4d4d4d',
                boxSizing: "border-box",
                borderRight: '3px solid #222',
                transition: '0.5s transform',
                transform: state.leftOpen ? 'translateZ(0) translateX(0%)' : 'translateZ(0) translateX(-100%)',
                userSelect: 'none'
            }
        }, [dragComponentLeft, (0, _h2.default)('div', {
            on: {
                click: FREEZER_CLICKED
            },
            style: {
                flex: '0 auto',
                padding: '10px',
                textAlign: 'center',
                background: '#333',
                cursor: 'pointer'
            }
        }, [(0, _h2.default)('span', { style: { padding: '15px 15px 10px 15px', color: state.appIsFrozen ? 'rgb(91, 204, 91)' : 'rgb(204, 91, 91)' } }, state.appIsFrozen ? '►' : '❚❚')]), (0, _h2.default)('div', {
            attrs: { class: 'better-scrollbar' },
            style: {
                flex: '1 auto',
                padding: '10px',
                overflow: 'auto'
            }
        }, eventStack.map(function (a) {
            return a;
        }).reverse().map(function (event) {
            return (0, _h2.default)('div', { style: { padding: '5px', color: '#ffffff' } }, [state.definition.event[event.eventName].title, (0, _h2.default)('div', Object.keys(event.mutations).map(function (stateId) {
                return state.definition.state[stateId].title + ': ' + event.mutations[stateId].toString();
            }))]);
        }))]);
        var renderViewComponent = (0, _h2.default)('div', {
            style: {
                flex: '1 auto',
                background: "\n                    radial-gradient(black 5%, transparent 16%) 0 0,\n                    radial-gradient(black 5%, transparent 16%) 8px 8px,\n                    radial-gradient(rgba(255,255,255,.1) 5%, transparent 20%) 0 1px,\n                    radial-gradient(rgba(255,255,255,.1) 5%, transparent 20%) 8px 9px",
                backgroundColor: '#333',
                backgroundSize: '16px 16px',
                transform: 'translateZ(0)',
                display: 'relative',
                overflow: 'auto'
            }
        }, [(0, _h2.default)('div', { style: function () {
                var desiredWidth = 1920;
                var desiredHeight = 1080;
                var topMenuHeight = 75;
                var widthLeft = window.innerWidth - (state.editorLeftWidth + state.editorRightWidth);
                var heightLeft = window.innerHeight - topMenuHeight;
                var scaleX = widthLeft < desiredWidth ? widthLeft / desiredWidth : 1;
                var scaleY = heightLeft < desiredHeight ? heightLeft / desiredHeight : 1;
                if (scaleX > scaleY) {
                    scaleX = scaleY;
                } else {
                    scaleY = scaleX;
                }
                return {
                    width: desiredWidth + 'px',
                    height: desiredHeight + 'px',
                    background: '#ffffff',
                    boxShadow: 'rgba(0, 0, 0, 0.247059) 0px 14px 45px, rgba(0, 0, 0, 0.219608) 0px 10px 18px',
                    transform: 'translateZ(0) scale(' + scaleX + ',' + scaleY + ')',
                    position: 'absolute',
                    top: (heightLeft - desiredHeight) / 2 + 'px',
                    left: (widthLeft - desiredWidth) / 2 + state.editorLeftWidth + 'px'
                };
            }() }, [(0, _h2.default)('div', { style: { background: '#93d1f7', width: '100%', height: '40px', position: 'absolute', top: '-40px', display: 'flex', justifyContent: 'center', alignItems: 'center', left: '0', borderRadius: '5px 5px 0 0', boxShadow: 'inset 0 -3px 0 0 #b7b7b7' } }, 'todo: url, width and height, close button'), (0, _h2.default)('div', { style: { overflow: 'auto', width: '100%', height: '100%' } }, [app.vdom])])]);
        var mainRowComponent = (0, _h2.default)('div', {
            style: {
                display: 'flex',
                flex: '1',
                position: 'relative',
                transform: 'translateZ(0)'
            }
        }, [renderViewComponent, leftComponent, rightComponent]);
        var vnode = (0, _h2.default)('div', {
            style: {
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: '0',
                right: '0',
                width: '100vw',
                height: '100vh'
            }
        }, [topComponent, mainRowComponent]);

        node = patch(node, vnode);
    }

    render();
}

},{"../ugnis_components/app.json":14,"./ugnis":13,"big.js":1,"snabbdom":10,"snabbdom/h":2,"snabbdom/modules/attributes":5,"snabbdom/modules/class":6,"snabbdom/modules/eventlisteners":7,"snabbdom/modules/props":8,"snabbdom/modules/style":9}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _snabbdom = require('snabbdom');

var _snabbdom2 = _interopRequireDefault(_snabbdom);

var _h = require('snabbdom/h');

var _h2 = _interopRequireDefault(_h);

var _big = require('big.js');

var _big2 = _interopRequireDefault(_big);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function updateProps(oldVnode, vnode) {
    var key,
        cur,
        old,
        elm = vnode.elm,
        props = vnode.data.liveProps || {};
    for (key in props) {
        cur = props[key];
        old = elm[key];
        if (old !== cur) elm[key] = cur;
    }
}
var livePropsPlugin = { create: updateProps, update: updateProps };

var patch = _snabbdom2.default.init([require('snabbdom/modules/class'), require('snabbdom/modules/props'), require('snabbdom/modules/style'), require('snabbdom/modules/eventlisteners'), require('snabbdom/modules/attributes'), livePropsPlugin]);


function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
}

exports.default = function (definition) {

    var currentState = Object.keys(definition.state).map(function (key) {
        return definition.state[key];
    }).reduce(function (acc, def) {
        acc[def.ref] = def.defaultValue;
        return acc;
    }, {});

    // Allows stoping application in development. This is not an application state
    var frozen = false;
    var frozenCallback = null;
    var selectHoverActive = false;
    var selectedNodeInDevelopment = {};

    function selectNodeHover(ref, e) {
        e.stopPropagation();
        selectedNodeInDevelopment = ref;
        frozenCallback(ref);
        render();
    }
    function selectNodeClick(ref, e) {
        e.stopPropagation();
        selectHoverActive = false;
        selectedNodeInDevelopment = ref;
        frozenCallback(ref);
        render();
    }

    // global state for resolver
    var currentEvent = null;
    var currentMapValue = {};
    var currentMapIndex = {};
    var eventData = {};
    function resolve(ref) {
        if (ref === undefined) {
            return;
        }
        // static value (string/number)
        if (ref.ref === undefined) {
            return ref;
        }
        var def = definition[ref.ref][ref.id];
        if (ref.ref === 'pipe') {
            return pipe(ref);
        }
        if (ref.ref === 'conditional') {
            return resolve(def.predicate) ? resolve(def.then) : resolve(def.else);
        }
        if (ref.ref === 'state') {
            return currentState[ref.id];
        }
        if (ref.ref === 'vNodeBox') {
            return boxNode(ref);
        }
        if (ref.ref === 'vNodeText') {
            return textNode(ref);
        }
        if (ref.ref === 'vNodeInput') {
            return inputNode(ref);
        }
        if (ref.ref === 'vNodeList') {
            return listNode(ref);
        }
        if (ref.ref === 'vNodeIf') {
            return ifNode(ref);
        }
        if (ref.ref === 'style') {
            return Object.keys(def).reduce(function (acc, val) {
                acc[val] = resolve(def[val]);
                return acc;
            }, {});
        }
        if (ref.ref === 'eventData') {
            return eventData[ref.id];
        }
        if (ref.ref === 'listValue') {
            return currentMapValue[def.list.id][def.property];
        }
        throw Error(ref);
    }

    function transformValue(value, transformations) {
        for (var i = 0; i < transformations.length; i++) {
            var ref = transformations[i];
            var transformer = definition[ref.ref][ref.id];
            if (ref.ref === 'equal') {
                var compareValue = resolve(transformer.value);
                if (value instanceof _big2.default || compareValue instanceof _big2.default) {
                    value = (0, _big2.default)(value).eq(compareValue);
                } else {
                    value = value === compareValue;
                }
            }
            if (ref.ref === 'add') {
                value = (0, _big2.default)(value).plus(resolve(transformer.value));
            }
            if (ref.ref === 'subtract') {
                value = (0, _big2.default)(value).minus(resolve(transformer.value));
            }
            if (ref.ref === 'multiply') {
                value = (0, _big2.default)(value).times(resolve(transformer.value));
            }
            if (ref.ref === 'divide') {
                value = (0, _big2.default)(value).div(resolve(transformer.value));
            }
            if (ref.ref === 'remainder') {
                value = (0, _big2.default)(value).mod(resolve(transformer.value));
            }
            if (ref.ref === 'branch') {
                if (resolve(transformer.predicate)) {
                    value = transformValue(value, transformer.then);
                } else {
                    value = transformValue(value, transformer.else);
                }
            }
            if (ref.ref === 'join') {
                value = value.concat(resolve(transformer.value));
            }
            if (ref.ref === 'toUpperCase') {
                value = value.toUpperCase();
            }
            if (ref.ref === 'toLowerCase') {
                value = value.toLowerCase();
            }
            if (ref.ref === 'toText') {
                value = value.toString();
            }
        }
        return value;
    }

    function pipe(ref) {
        var def = definition[ref.ref][ref.id];
        return transformValue(resolve(def.value), def.transformations);
    }

    function boxNode(ref) {
        var node = definition[ref.ref][ref.id];
        var data = {
            style: frozen && selectedNodeInDevelopment.id === ref.id ? _extends({}, resolve(node.style), { transition: 'outline 0.1s', outline: '3px solid #3590df' }) : resolve(node.style),
            on: frozen ? {
                mouseover: selectHoverActive ? [selectNodeHover, ref] : undefined,
                click: [selectNodeClick, ref]
            } : {
                click: node.click ? [emitEvent, node.click] : undefined,
                dblclick: node.dblclick ? [emitEvent, node.dblclick] : undefined,
                mouseover: node.mouseover ? [emitEvent, node.mouseover] : undefined,
                mouseout: node.mouseout ? [emitEvent, node.mouseout] : undefined
            }
        };
        return (0, _h2.default)('div', data, flatten(node.children.map(resolve)));
    }

    function ifNode(ref) {
        var node = definition[ref.ref][ref.id];
        return resolve(node.value) ? node.children.map(resolve) : [];
    }

    function textNode(ref) {
        var node = definition[ref.ref][ref.id];
        var data = {
            style: frozen && selectedNodeInDevelopment.id === ref.id ? _extends({}, resolve(node.style), { transition: 'outline 0.1s', outline: '3px solid #3590df' }) : resolve(node.style),
            on: frozen ? {
                mouseover: selectHoverActive ? [selectNodeHover, ref] : undefined,
                click: [selectNodeClick, ref]
            } : {
                click: node.click ? [emitEvent, node.click] : undefined,
                dblclick: node.dblclick ? [emitEvent, node.dblclick] : undefined,
                mouseover: node.mouseover ? [emitEvent, node.mouseover] : undefined,
                mouseout: node.mouseout ? [emitEvent, node.mouseout] : undefined
            }
        };
        return (0, _h2.default)('span', data, resolve(node.value));
    }

    function inputNode(ref) {
        var node = definition[ref.ref][ref.id];
        var data = {
            style: frozen && selectedNodeInDevelopment.id === ref.id ? _extends({}, resolve(node.style), { transition: 'outline 0.1s', outline: '3px solid #3590df' }) : resolve(node.style),
            on: frozen ? {
                mouseover: selectHoverActive ? [selectNodeHover, ref] : undefined,
                click: [selectNodeClick, ref]
            } : {
                click: node.click ? [emitEvent, node.click] : undefined,
                input: node.input ? [emitEvent, node.input] : undefined,
                dblclick: node.dblclick ? [emitEvent, node.dblclick] : undefined,
                mouseover: node.mouseover ? [emitEvent, node.mouseover] : undefined,
                mouseout: node.mouseout ? [emitEvent, node.mouseout] : undefined,
                focus: node.focus ? [emitEvent, node.focus] : undefined,
                blur: node.blur ? [emitEvent, node.blur] : undefined
            },
            props: {
                value: resolve(node.value),
                placeholder: node.placeholder
            }
        };
        return (0, _h2.default)('input', data);
    }

    function listNode(ref) {
        var node = definition[ref.ref][ref.id];
        var list = resolve(node.value);

        var children = Object.keys(list).map(function (key) {
            return list[key];
        }).map(function (value, index) {
            currentMapValue[ref.id] = value;
            currentMapIndex[ref.id] = index;

            return node.children.map(resolve);
        });
        delete currentMapValue[ref.id];
        delete currentMapIndex[ref.id];

        return children;
    }

    var listeners = [];

    function addListener(callback) {
        var length = listeners.push(callback);

        // for unsubscribing
        return function () {
            return listeners.splice(length - 1, 1);
        };
    }

    function emitEvent(eventRef, e) {
        var eventId = eventRef.id;
        var event = definition.event[eventId];
        currentEvent = e;
        event.data.forEach(function (ref) {
            if (ref.id === '_input') {
                eventData[ref.id] = e.target.value;
            }
        });
        var previousState = currentState;
        var mutations = {};
        definition.event[eventId].mutators.forEach(function (ref) {
            var mutator = definition.mutator[ref.id];
            var state = mutator.state;
            mutations[state.id] = resolve(mutator.mutation);
        });
        currentState = Object.assign({}, currentState, mutations);
        listeners.forEach(function (callback) {
            return callback(eventId, eventData, e, previousState, currentState, mutations);
        });
        currentEvent = {};
        eventData = {};
        if (Object.keys(mutations).length) {
            render();
        }
    }

    var vdom = resolve({ ref: 'vNodeBox', id: '_rootNode' });
    function render(newDefinition) {
        if (newDefinition) {
            if (definition.state !== newDefinition.state) {
                definition = newDefinition;
                var newState = Object.keys(definition.state).map(function (key) {
                    return definition.state[key];
                }).reduce(function (acc, def) {
                    acc[def.ref] = def.defaultValue;
                    return acc;
                }, {});
                currentState = _extends({}, newState, currentState);
            } else {
                definition = newDefinition;
            }
        }
        var newvdom = resolve({ ref: 'vNodeBox', id: '_rootNode' });
        patch(vdom, newvdom);
        vdom = newvdom;
    }

    function _freeze(isFrozen, callback, nodeId) {
        frozenCallback = callback;
        selectedNodeInDevelopment = nodeId;
        if (frozen === false && isFrozen === true) {
            selectHoverActive = true;
        }
        if (frozen || frozen !== isFrozen) {
            frozen = isFrozen;
            render();
        }
    }

    function getCurrentState() {
        return currentState;
    }

    function setCurrentState(newState) {
        currentState = newState;
        render();
    }

    return {
        definition: definition,
        vdom: vdom,
        getCurrentState: getCurrentState,
        setCurrentState: setCurrentState,
        render: render,
        emitEvent: emitEvent,
        addListener: addListener,
        _freeze: _freeze,
        _resolve: resolve
    };
};

},{"big.js":1,"snabbdom":10,"snabbdom/h":2,"snabbdom/modules/attributes":5,"snabbdom/modules/class":6,"snabbdom/modules/eventlisteners":7,"snabbdom/modules/props":8,"snabbdom/modules/style":9}],14:[function(require,module,exports){
module.exports={
    "eventData": {
        "_input": {
            "title": "input value",
            "type": "text"
        }
    },
    "toLowerCase": {},
    "toUpperCase": {},
    "conditional": {},
    "equal": {
        "a7251af0-50a7-4823-85a0-66ce09d8a3cc": {
            "value": {
                "ref": "pipe",
                "id": "ee2423e6-5b48-41ae-8ccf-6a2c7b46d2f8"
            }
        }
    },
    "not": {},
    "list": {},
    "toText": {
        "7bs9d6d2-00db-8ab5-c332-882575f25426": {}
    },
    "listValue": {
        "pz7hd6d2-00db-8ab5-c332-882575f25426": {
            "type": "number",
            "list": {
                "ref": "vNodeList",
                "id": "fl89d6d2-00db-8ab5-c332-882575f25425"
            },
            "property": "x"
        },
        "hj9wd6d2-00db-8ab5-c332-882575f25426": {
            "type": "number",
            "list": {
                "ref": "vNodeList",
                "id": "fl89d6d2-00db-8ab5-c332-882575f25425"
            },
            "property": "y"
        },
        "hhr8b6d2-00db-8ab5-c332-882575f25426": {
            "type": "text",
            "list": {
                "ref": "vNodeList",
                "id": "fl89d6d2-00db-8ab5-c332-882575f25425"
            },
            "property": "color"
        }
    },
    "pipe": {
        "fw8jd6d2-00db-8ab5-c332-882575f25426": {
            "type": "text",
            "value": "Current value: ",
            "transformations": [
                {
                    "ref": "join",
                    "id": "p9s3d6d2-00db-8ab5-c332-882575f25426"
                }
            ]
        },
        "um5ed6d2-00db-8ab5-c332-882575f25426": {
            "type": "text",
            "value": {
                "ref": "state",
                "id": "46vdd6d2-00db-8ab5-c332-882575f25426"
            },
            "transformations": [
                {
                    "ref": "toText",
                    "id": "7bs9d6d2-00db-8ab5-c332-882575f25426"
                }
            ]
        },
        "ui8jd6d2-00db-8ab5-c332-882575f25426": {
            "type": "text",
            "value": "+",
            "transformations": []
        },
        "c8wed6d2-00db-8ab5-c332-882575f25426": {
            "type": "text",
            "value": "-",
            "transformations": []
        },
        "pdq6d6d2-00db-8ab5-c332-882575f25426": {
            "type": "number",
            "value": {
                "ref": "state",
                "id": "46vdd6d2-00db-8ab5-c332-882575f25426"
            },
            "transformations": [
                {
                    "ref": "add",
                    "id": "w86fd6d2-00db-8ab5-c332-882575f25426"
                }
            ]
        },
        "452qd6d2-00db-8ab5-c332-882575f25426": {
            "type": "number",
            "value": {
                "ref": "state",
                "id": "46vdd6d2-00db-8ab5-c332-882575f25426"
            },
            "transformations": [
                {
                    "ref": "subtract",
                    "id": "u43wd6d2-00db-8ab5-c332-882575f25426"
                }
            ]
        },
        "ew83d6d2-00db-8ab5-c332-882575f25426": {
            "type": "number",
            "value": 1,
            "transformations": []
        },
        "w3e9d6d2-00db-8ab5-c332-882575f25426": {
            "type": "number",
            "value": 1,
            "transformations": []
        },
        "3qkid6d2-00db-8ab5-c332-882575f25426": {
            "type": "text",
            "value": 0,
            "transformations": [
                {
                    "ref": "add",
                    "id": "wbr7d6d2-00db-8ab5-c332-882575f25426"
                },
                {
                    "ref": "toText",
                    "id": "noop"
                },
                {
                    "ref": "join",
                    "id": "s258d6d2-00db-8ab5-c332-882575f25426"
                }
            ]
        },
        "t7vqd6d2-00db-8ab5-c332-882575f25426": {
            "type": "text",
            "value": 0,
            "transformations": [
                {
                    "ref": "add",
                    "id": "vq8dd6d2-00db-8ab5-c332-882575f25426"
                },
                {
                    "ref": "toText",
                    "id": "noop"
                },
                {
                    "ref": "join",
                    "id": "wf9ad6d2-00db-8ab5-c332-882575f25426"
                }
            ]
        },
        "8cq6b6d2-00db-8ab5-c332-882575f25426": {
            "type": "text",
            "value": {
                "ref": "listValue",
                "id": "hhr8b6d2-00db-8ab5-c332-882575f25426"
            },
            "transformations": []
        },
        "f9qxd6d2-00db-8ab5-c332-882575f25426": {
            "type": "table",
            "value": {
                "ref": "state",
                "id": "c8q9d6d2-00db-8ab5-c332-882575f25426"
            },
            "transformations": []
        },
        "qww9d6d2-00db-8ab5-c332-882575f25426": {
            "type": "text",
            "value": "px",
            "transformations": []
        },
        "qdw7c6d2-00db-8ab5-c332-882575f25426": {
            "type": "text",
            "value": "px",
            "transformations": []
        },
        "84369aba-4a4d-4932-8a9a-8f9ca948b6a2": {
            "type": "text",
            "value": "The number now is even",
            "transformations": []
        },
        "c2fb9a9b-25bb-4e8b-80c0-cf51b8506070": {
            "type": "boolean",
            "value": {
                "ref": "state",
                "id": "46vdd6d2-00db-8ab5-c332-882575f25426"
            },
            "transformations": [
                {
                    "ref": "remainder",
                    "id": "34780d22-f521-4c30-89a5-3e7f5b5af7c2"
                },
                {
                    "ref": "equal",
                    "id": "a7251af0-50a7-4823-85a0-66ce09d8a3cc"
                }
            ]
        },
        "1229d478-bc25-4401-8a89-74fc6cfe8996": {
            "type": "number",
            "value": 2,
            "transformations": []
        },
        "ee2423e6-5b48-41ae-8ccf-6a2c7b46d2f8": {
            "type": "number",
            "value": 0,
            "transformations": []
        }
    },
    "join": {
        "p9s3d6d2-00db-8ab5-c332-882575f25426": {
            "value": {
                "ref": "pipe",
                "id": "um5ed6d2-00db-8ab5-c332-882575f25426"
            }
        },
        "wf9ad6d2-00db-8ab5-c332-882575f25426": {
            "value": {
                "ref": "pipe",
                "id": "qww9d6d2-00db-8ab5-c332-882575f25426"
            }
        },
        "s258d6d2-00db-8ab5-c332-882575f25426": {
            "value": {
                "ref": "pipe",
                "id": "qdw7c6d2-00db-8ab5-c332-882575f25426"
            }
        }
    },
    "add": {
        "w86fd6d2-00db-8ab5-c332-882575f25426": {
            "value": {
                "ref": "pipe",
                "id": "ew83d6d2-00db-8ab5-c332-882575f25426"
            }
        },
        "wbr7d6d2-00db-8ab5-c332-882575f25426": {
            "value": {
                "ref": "listValue",
                "id": "pz7hd6d2-00db-8ab5-c332-882575f25426"
            }
        },
        "vq8dd6d2-00db-8ab5-c332-882575f25426": {
            "value": {
                "ref": "listValue",
                "id": "hj9wd6d2-00db-8ab5-c332-882575f25426"
            }
        }
    },
    "subtract": {
        "u43wd6d2-00db-8ab5-c332-882575f25426": {
            "value": {
                "ref": "pipe",
                "id": "w3e9d6d2-00db-8ab5-c332-882575f25426"
            }
        }
    },
    "remainder": {
        "34780d22-f521-4c30-89a5-3e7f5b5af7c2": {
            "value": {
                "ref": "pipe",
                "id": "1229d478-bc25-4401-8a89-74fc6cfe8996"
            }
        }
    },
    "vNodeBox": {
        "_rootNode": {
            "title": "box",
            "style": {
                "ref": "style",
                "id": "_rootStyle"
            },
            "children": [
                {
                    "ref": "vNodeText",
                    "id": "2471d6d2-00db-8ab5-c332-882575f25425"
                },
                {
                    "ref": "vNodeText",
                    "id": "1481d6d2-00db-8ab5-c332-882575f25425"
                },
                {
                    "ref": "vNodeText",
                    "id": "3481d6d2-00db-8ab5-c332-882575f25425"
                },
                {
                    "ref": "vNodeIf",
                    "id": "5787c15a-426b-41eb-831d-e3e074159582"
                },
                {
                    "ref": "vNodeList",
                    "id": "fl89d6d2-00db-8ab5-c332-882575f25425"
                }
            ]
        },
        "gw9dd6d2-00db-8ab5-c332-882575f25426": {
            "title": "box",
            "style": {
                "ref": "style",
                "id": "fq9dd6d2-00db-8ab5-c332-882575f25426"
            },
            "children": []
        }
    },
    "vNodeText": {
        "2471d6d2-00db-8ab5-c332-882575f25425": {
            "title": "text",
            "style": {
                "ref": "style",
                "id": "8481d6d2-00db-8ab5-c332-882575f25426"
            },
            "value": {
                "ref": "pipe",
                "id": "fw8jd6d2-00db-8ab5-c332-882575f25426"
            }
        },
        "1481d6d2-00db-8ab5-c332-882575f25425": {
            "title": "text",
            "value": {
                "ref": "pipe",
                "id": "ui8jd6d2-00db-8ab5-c332-882575f25426"
            },
            "style": {
                "ref": "style",
                "id": "9481d6d2-00db-8ab5-c332-882575f25426"
            },
            "click": {
                "ref": "event",
                "id": "d48rd6d2-00db-8ab5-c332-882575f25426"
            }
        },
        "3481d6d2-00db-8ab5-c332-882575f25425": {
            "title": "text",
            "value": {
                "ref": "pipe",
                "id": "c8wed6d2-00db-8ab5-c332-882575f25426"
            },
            "style": {
                "ref": "style",
                "id": "7481d6d2-00db-8ab5-c332-882575f25426"
            },
            "click": {
                "ref": "event",
                "id": "3a54d6d2-00db-8ab5-c332-882575f25426"
            }
        },
        "e8add1c7-8a01-4164-8604-722d8ab529f1": {
            "title": "text",
            "style": {
                "ref": "style",
                "id": "4dca73b3-90eb-41e7-8651-2bdcc93f3871"
            },
            "value": {
                "ref": "pipe",
                "id": "84369aba-4a4d-4932-8a9a-8f9ca948b6a2"
            }
        }
    },
    "vNodeInput": {},
    "vNodeList": {
        "fl89d6d2-00db-8ab5-c332-882575f25425": {
            "title": "list",
            "value": {
                "ref": "pipe",
                "id": "f9qxd6d2-00db-8ab5-c332-882575f25426"
            },
            "children": [
                {
                    "ref": "vNodeBox",
                    "id": "gw9dd6d2-00db-8ab5-c332-882575f25426"
                }
            ]
        }
    },
    "vNodeIf": {
        "5787c15a-426b-41eb-831d-e3e074159582": {
            "title": "if",
            "value": {
                "ref": "pipe",
                "id": "c2fb9a9b-25bb-4e8b-80c0-cf51b8506070"
            },
            "children": [
                {
                    "ref": "vNodeText",
                    "id": "e8add1c7-8a01-4164-8604-722d8ab529f1"
                }
            ]
        }
    },
    "style": {
        "_rootStyle": {
            "fontFamily": "'Comfortaa', cursive",
            "background": "#f5f5f5",
            "minHeight": "100%"
        },
        "8481d6d2-00db-8ab5-c332-882575f25426": {
            "padding": "10px",
            "margin": "10px 5px"
        },
        "9481d6d2-00db-8ab5-c332-882575f25426": {
            "padding": "10px 15px",
            "background": "#aaaaaa",
            "display": "inline-block",
            "marginLeft": "5px",
            "borderRadius": "3px",
            "cursor": "pointer",
            "userSelect": "none",
            "margin": "10px 5px"
        },
        "7481d6d2-00db-8ab5-c332-882575f25426": {
            "padding": "10px 15px",
            "background": "#999999",
            "display": "inline-block",
            "marginLeft": "5px",
            "borderRadius": "3px",
            "cursor": "pointer",
            "margin": "10px 5px",
            "userSelect": "none"
        },
        "8092ac5e-dfd0-4492-a65d-8ac3eec325e0": {
            "padding": "10px 10px 10px 0"
        },
        "a9461e28-7d92-49a0-9001-23d74e4b382d": {
            "padding": "10px 10px 10px 0"
        },
        "766b11ec-da27-494c-b272-c26fec3f6475": {
            "padding": "10px",
            "float": "right",
            "paddingRight": "50px",
            "textAlign": "right",
            "maxWidth": "500px",
            "line-height": "1.5"
        },
        "cbcd8edb-4aa2-43fe-ad39-cee79b490295": {
            "padding": "10px",
            "display": "block"
        },
        "6763f102-23f7-4390-b463-4e1b14e866c9": {
            "padding": "10px",
            "display": "block"
        },
        "91c9adf0-d62e-4580-93e7-f39594ae5e7d": {
            "padding": "10px",
            "display": "block"
        },
        "e9fbeb39-7193-4522-91b3-761bd35639d3": {
            "padding": "10px",
            "display": "block"
        },
        "3cf5d89d-3703-483e-ab64-5a5b780aec27": {
            "padding": "10px",
            "display": "block"
        },
        "fq9dd6d2-00db-8ab5-c332-882575f25426": {
            "padding": "10px",
            "width": {
                "ref": "pipe",
                "id": "3qkid6d2-00db-8ab5-c332-882575f25426"
            },
            "height": {
                "ref": "pipe",
                "id": "t7vqd6d2-00db-8ab5-c332-882575f25426"
            },
            "background": {
                "ref": "pipe",
                "id": "8cq6b6d2-00db-8ab5-c332-882575f25426"
            }
        },
        "4dca73b3-90eb-41e7-8651-2bdcc93f3871": {
            "padding": "10px"
        },
    },
    "nameSpace": {
        "_rootNameSpace": {
            "title": "state",
            "children": [
                {
                    "ref": "state",
                    "id": "46vdd6d2-00db-8ab5-c332-882575f25426"
                },
                {
                    "ref": "state",
                    "id": "c8q9d6d2-00db-8ab5-c332-882575f25426"
                }
            ]
        }
    },
    "state": {
        "46vdd6d2-00db-8ab5-c332-882575f25426": {
            "title": "count",
            "ref": "46vdd6d2-00db-8ab5-c332-882575f25426",
            "type": "number",
            "defaultValue": 0,
            "mutators": [
                {
                    "ref": "mutator",
                    "id": "as55d6d2-00db-8ab5-c332-882575f25426"
                },
                {
                    "ref": "mutator",
                    "id": "9dq8d6d2-00db-8ab5-c332-882575f25426"
                }
            ]
        },
        "c8q9d6d2-00db-8ab5-c332-882575f25426": {
            "title": "tiles",
            "ref": "c8q9d6d2-00db-8ab5-c332-882575f25426",
            "type": "table",
            "definition": {
                "x": "number",
                "y": "number",
                "color": "text"
            },
            "defaultValue": {
                "ops6d6d2-00db-8ab5-c332-882575f25426": {
                    "x": 120,
                    "y": 100,
                    "color": "#eab65c"
                },
                "wpv5d6d2-00db-8ab5-c332-882575f25426": {
                    "x": 200,
                    "y": 120,
                    "color": "#53B2ED"
                },
                "qn27d6d2-00db-8ab5-c332-882575f25426": {
                    "x": 130,
                    "y": 200,
                    "color": "#5bcc5b"
                },
                "ca9rd6d2-00db-8ab5-c332-882575f25426": {
                    "x": 150,
                    "y": 150,
                    "color": "#4d4d4d"
                }
            },
            "mutators": []
        }
    },
    "mutator": {
        "as55d6d2-00db-8ab5-c332-882575f25426": {
            "event": {
                "ref": "event",
                "id": "d48rd6d2-00db-8ab5-c332-882575f25426"
            },
            "state": {
                "ref": "state",
                "id": "46vdd6d2-00db-8ab5-c332-882575f25426"
            },
            "mutation": {
                "ref": "pipe",
                "id": "pdq6d6d2-00db-8ab5-c332-882575f25426"
            }
        },
        "9dq8d6d2-00db-8ab5-c332-882575f25426": {
            "event": {
                "ref": "event",
                "id": "3a54d6d2-00db-8ab5-c332-882575f25426"
            },
            "state": {
                "ref": "state",
                "id": "46vdd6d2-00db-8ab5-c332-882575f25426"
            },
            "mutation": {
                "ref": "pipe",
                "id": "452qd6d2-00db-8ab5-c332-882575f25426"
            }
        }
    },
    "event": {
        "d48rd6d2-00db-8ab5-c332-882575f25426": {
            "title": "increment",
            "mutators": [
                {
                    "ref": "mutator",
                    "id": "as55d6d2-00db-8ab5-c332-882575f25426"
                }
            ],
            "data": []
        },
        "3a54d6d2-00db-8ab5-c332-882575f25426": {
            "title": "decrement",
            "mutators": [
                {
                    "ref": "mutator",
                    "id": "9dq8d6d2-00db-8ab5-c332-882575f25426"
                }
            ],
            "data": []
        }
    }
}
},{}]},{},[12])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmlnLmpzL2JpZy5qcyIsIm5vZGVfbW9kdWxlcy9zbmFiYmRvbS9oLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL2h0bWxkb21hcGkuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vaXMuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vbW9kdWxlcy9hdHRyaWJ1dGVzLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvY2xhc3MuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vbW9kdWxlcy9ldmVudGxpc3RlbmVycy5qcyIsIm5vZGVfbW9kdWxlcy9zbmFiYmRvbS9tb2R1bGVzL3Byb3BzLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvc3R5bGUuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vc25hYmJkb20uanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vdm5vZGUuanMiLCJzcmNcXGluZGV4LmpzIiwic3JjXFx1Z25pcy5qcyIsInVnbmlzX2NvbXBvbmVudHMvYXBwLmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdG5DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGJpZy5qcyB2My4xLjMgaHR0cHM6Ly9naXRodWIuY29tL01pa2VNY2wvYmlnLmpzL0xJQ0VOQ0UgKi9cclxuOyhmdW5jdGlvbiAoZ2xvYmFsKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4vKlxyXG4gIGJpZy5qcyB2My4xLjNcclxuICBBIHNtYWxsLCBmYXN0LCBlYXN5LXRvLXVzZSBsaWJyYXJ5IGZvciBhcmJpdHJhcnktcHJlY2lzaW9uIGRlY2ltYWwgYXJpdGhtZXRpYy5cclxuICBodHRwczovL2dpdGh1Yi5jb20vTWlrZU1jbC9iaWcuanMvXHJcbiAgQ29weXJpZ2h0IChjKSAyMDE0IE1pY2hhZWwgTWNsYXVnaGxpbiA8TThjaDg4bEBnbWFpbC5jb20+XHJcbiAgTUlUIEV4cGF0IExpY2VuY2VcclxuKi9cclxuXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBFRElUQUJMRSBERUZBVUxUUyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcblxyXG4gICAgLy8gVGhlIGRlZmF1bHQgdmFsdWVzIGJlbG93IG11c3QgYmUgaW50ZWdlcnMgd2l0aGluIHRoZSBzdGF0ZWQgcmFuZ2VzLlxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgbWF4aW11bSBudW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMgb2YgdGhlIHJlc3VsdHMgb2Ygb3BlcmF0aW9uc1xyXG4gICAgICogaW52b2x2aW5nIGRpdmlzaW9uOiBkaXYgYW5kIHNxcnQsIGFuZCBwb3cgd2l0aCBuZWdhdGl2ZSBleHBvbmVudHMuXHJcbiAgICAgKi9cclxuICAgIHZhciBEUCA9IDIwLCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gTUFYX0RQXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVGhlIHJvdW5kaW5nIG1vZGUgdXNlZCB3aGVuIHJvdW5kaW5nIHRvIHRoZSBhYm92ZSBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIDAgVG93YXJkcyB6ZXJvIChpLmUuIHRydW5jYXRlLCBubyByb3VuZGluZykuICAgICAgIChST1VORF9ET1dOKVxyXG4gICAgICAgICAqIDEgVG8gbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCByb3VuZCB1cC4gIChST1VORF9IQUxGX1VQKVxyXG4gICAgICAgICAqIDIgVG8gbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCB0byBldmVuLiAgIChST1VORF9IQUxGX0VWRU4pXHJcbiAgICAgICAgICogMyBBd2F5IGZyb20gemVyby4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKFJPVU5EX1VQKVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFJNID0gMSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMCwgMSwgMiBvciAzXHJcblxyXG4gICAgICAgIC8vIFRoZSBtYXhpbXVtIHZhbHVlIG9mIERQIGFuZCBCaWcuRFAuXHJcbiAgICAgICAgTUFYX0RQID0gMUU2LCAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIDEwMDAwMDBcclxuXHJcbiAgICAgICAgLy8gVGhlIG1heGltdW0gbWFnbml0dWRlIG9mIHRoZSBleHBvbmVudCBhcmd1bWVudCB0byB0aGUgcG93IG1ldGhvZC5cclxuICAgICAgICBNQVhfUE9XRVIgPSAxRTYsICAgICAgICAgICAgICAgICAgIC8vIDEgdG8gMTAwMDAwMFxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSBleHBvbmVudCB2YWx1ZSBhdCBhbmQgYmVuZWF0aCB3aGljaCB0b1N0cmluZyByZXR1cm5zIGV4cG9uZW50aWFsXHJcbiAgICAgICAgICogbm90YXRpb24uXHJcbiAgICAgICAgICogSmF2YVNjcmlwdCdzIE51bWJlciB0eXBlOiAtN1xyXG4gICAgICAgICAqIC0xMDAwMDAwIGlzIHRoZSBtaW5pbXVtIHJlY29tbWVuZGVkIGV4cG9uZW50IHZhbHVlIG9mIGEgQmlnLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIEVfTkVHID0gLTcsICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gLTEwMDAwMDBcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgZXhwb25lbnQgdmFsdWUgYXQgYW5kIGFib3ZlIHdoaWNoIHRvU3RyaW5nIHJldHVybnMgZXhwb25lbnRpYWxcclxuICAgICAgICAgKiBub3RhdGlvbi5cclxuICAgICAgICAgKiBKYXZhU2NyaXB0J3MgTnVtYmVyIHR5cGU6IDIxXHJcbiAgICAgICAgICogMTAwMDAwMCBpcyB0aGUgbWF4aW11bSByZWNvbW1lbmRlZCBleHBvbmVudCB2YWx1ZSBvZiBhIEJpZy5cclxuICAgICAgICAgKiAoVGhpcyBsaW1pdCBpcyBub3QgZW5mb3JjZWQgb3IgY2hlY2tlZC4pXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgRV9QT1MgPSAyMSwgICAgICAgICAgICAgICAgICAgLy8gMCB0byAxMDAwMDAwXHJcblxyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuICAgICAgICAvLyBUaGUgc2hhcmVkIHByb3RvdHlwZSBvYmplY3QuXHJcbiAgICAgICAgUCA9IHt9LFxyXG4gICAgICAgIGlzVmFsaWQgPSAvXi0/KFxcZCsoXFwuXFxkKik/fFxcLlxcZCspKGVbKy1dP1xcZCspPyQvaSxcclxuICAgICAgICBCaWc7XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBDcmVhdGUgYW5kIHJldHVybiBhIEJpZyBjb25zdHJ1Y3Rvci5cclxuICAgICAqXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGJpZ0ZhY3RvcnkoKSB7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVGhlIEJpZyBjb25zdHJ1Y3RvciBhbmQgZXhwb3J0ZWQgZnVuY3Rpb24uXHJcbiAgICAgICAgICogQ3JlYXRlIGFuZCByZXR1cm4gYSBuZXcgaW5zdGFuY2Ugb2YgYSBCaWcgbnVtYmVyIG9iamVjdC5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIG4ge251bWJlcnxzdHJpbmd8QmlnfSBBIG51bWVyaWMgdmFsdWUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gQmlnKG4pIHtcclxuICAgICAgICAgICAgdmFyIHggPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgLy8gRW5hYmxlIGNvbnN0cnVjdG9yIHVzYWdlIHdpdGhvdXQgbmV3LlxyXG4gICAgICAgICAgICBpZiAoISh4IGluc3RhbmNlb2YgQmlnKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG4gPT09IHZvaWQgMCA/IGJpZ0ZhY3RvcnkoKSA6IG5ldyBCaWcobik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIER1cGxpY2F0ZS5cclxuICAgICAgICAgICAgaWYgKG4gaW5zdGFuY2VvZiBCaWcpIHtcclxuICAgICAgICAgICAgICAgIHgucyA9IG4ucztcclxuICAgICAgICAgICAgICAgIHguZSA9IG4uZTtcclxuICAgICAgICAgICAgICAgIHguYyA9IG4uYy5zbGljZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGFyc2UoeCwgbik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIFJldGFpbiBhIHJlZmVyZW5jZSB0byB0aGlzIEJpZyBjb25zdHJ1Y3RvciwgYW5kIHNoYWRvd1xyXG4gICAgICAgICAgICAgKiBCaWcucHJvdG90eXBlLmNvbnN0cnVjdG9yIHdoaWNoIHBvaW50cyB0byBPYmplY3QuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICB4LmNvbnN0cnVjdG9yID0gQmlnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQmlnLnByb3RvdHlwZSA9IFA7XHJcbiAgICAgICAgQmlnLkRQID0gRFA7XHJcbiAgICAgICAgQmlnLlJNID0gUk07XHJcbiAgICAgICAgQmlnLkVfTkVHID0gRV9ORUc7XHJcbiAgICAgICAgQmlnLkVfUE9TID0gRV9QT1M7XHJcblxyXG4gICAgICAgIHJldHVybiBCaWc7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIFByaXZhdGUgZnVuY3Rpb25zXHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiBCaWcgeCBpbiBub3JtYWwgb3IgZXhwb25lbnRpYWxcclxuICAgICAqIG5vdGF0aW9uIHRvIGRwIGZpeGVkIGRlY2ltYWwgcGxhY2VzIG9yIHNpZ25pZmljYW50IGRpZ2l0cy5cclxuICAgICAqXHJcbiAgICAgKiB4IHtCaWd9IFRoZSBCaWcgdG8gZm9ybWF0LlxyXG4gICAgICogZHAge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICogdG9FIHtudW1iZXJ9IDEgKHRvRXhwb25lbnRpYWwpLCAyICh0b1ByZWNpc2lvbikgb3IgdW5kZWZpbmVkICh0b0ZpeGVkKS5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZm9ybWF0KHgsIGRwLCB0b0UpIHtcclxuICAgICAgICB2YXIgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBpbmRleCAobm9ybWFsIG5vdGF0aW9uKSBvZiB0aGUgZGlnaXQgdGhhdCBtYXkgYmUgcm91bmRlZCB1cC5cclxuICAgICAgICAgICAgaSA9IGRwIC0gKHggPSBuZXcgQmlnKHgpKS5lLFxyXG4gICAgICAgICAgICBjID0geC5jO1xyXG5cclxuICAgICAgICAvLyBSb3VuZD9cclxuICAgICAgICBpZiAoYy5sZW5ndGggPiArK2RwKSB7XHJcbiAgICAgICAgICAgIHJuZCh4LCBpLCBCaWcuUk0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFjWzBdKSB7XHJcbiAgICAgICAgICAgICsraTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRvRSkge1xyXG4gICAgICAgICAgICBpID0gZHA7XHJcblxyXG4gICAgICAgIC8vIHRvRml4ZWRcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjID0geC5jO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVjYWxjdWxhdGUgaSBhcyB4LmUgbWF5IGhhdmUgY2hhbmdlZCBpZiB2YWx1ZSByb3VuZGVkIHVwLlxyXG4gICAgICAgICAgICBpID0geC5lICsgaSArIDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBcHBlbmQgemVyb3M/XHJcbiAgICAgICAgZm9yICg7IGMubGVuZ3RoIDwgaTsgYy5wdXNoKDApKSB7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGkgPSB4LmU7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogdG9QcmVjaXNpb24gcmV0dXJucyBleHBvbmVudGlhbCBub3RhdGlvbiBpZiB0aGUgbnVtYmVyIG9mXHJcbiAgICAgICAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHNwZWNpZmllZCBpcyBsZXNzIHRoYW4gdGhlIG51bWJlciBvZiBkaWdpdHNcclxuICAgICAgICAgKiBuZWNlc3NhcnkgdG8gcmVwcmVzZW50IHRoZSBpbnRlZ2VyIHBhcnQgb2YgdGhlIHZhbHVlIGluIG5vcm1hbFxyXG4gICAgICAgICAqIG5vdGF0aW9uLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHJldHVybiB0b0UgPT09IDEgfHwgdG9FICYmIChkcCA8PSBpIHx8IGkgPD0gQmlnLkVfTkVHKSA/XHJcblxyXG4gICAgICAgICAgLy8gRXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICAgICAgICAoeC5zIDwgMCAmJiBjWzBdID8gJy0nIDogJycpICtcclxuICAgICAgICAgICAgKGMubGVuZ3RoID4gMSA/IGNbMF0gKyAnLicgKyBjLmpvaW4oJycpLnNsaWNlKDEpIDogY1swXSkgK1xyXG4gICAgICAgICAgICAgIChpIDwgMCA/ICdlJyA6ICdlKycpICsgaVxyXG5cclxuICAgICAgICAgIC8vIE5vcm1hbCBub3RhdGlvbi5cclxuICAgICAgICAgIDogeC50b1N0cmluZygpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUGFyc2UgdGhlIG51bWJlciBvciBzdHJpbmcgdmFsdWUgcGFzc2VkIHRvIGEgQmlnIGNvbnN0cnVjdG9yLlxyXG4gICAgICpcclxuICAgICAqIHgge0JpZ30gQSBCaWcgbnVtYmVyIGluc3RhbmNlLlxyXG4gICAgICogbiB7bnVtYmVyfHN0cmluZ30gQSBudW1lcmljIHZhbHVlLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBwYXJzZSh4LCBuKSB7XHJcbiAgICAgICAgdmFyIGUsIGksIG5MO1xyXG5cclxuICAgICAgICAvLyBNaW51cyB6ZXJvP1xyXG4gICAgICAgIGlmIChuID09PSAwICYmIDEgLyBuIDwgMCkge1xyXG4gICAgICAgICAgICBuID0gJy0wJztcclxuXHJcbiAgICAgICAgLy8gRW5zdXJlIG4gaXMgc3RyaW5nIGFuZCBjaGVjayB2YWxpZGl0eS5cclxuICAgICAgICB9IGVsc2UgaWYgKCFpc1ZhbGlkLnRlc3QobiArPSAnJykpIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoTmFOKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSBzaWduLlxyXG4gICAgICAgIHgucyA9IG4uY2hhckF0KDApID09ICctJyA/IChuID0gbi5zbGljZSgxKSwgLTEpIDogMTtcclxuXHJcbiAgICAgICAgLy8gRGVjaW1hbCBwb2ludD9cclxuICAgICAgICBpZiAoKGUgPSBuLmluZGV4T2YoJy4nKSkgPiAtMSkge1xyXG4gICAgICAgICAgICBuID0gbi5yZXBsYWNlKCcuJywgJycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRXhwb25lbnRpYWwgZm9ybT9cclxuICAgICAgICBpZiAoKGkgPSBuLnNlYXJjaCgvZS9pKSkgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgZXhwb25lbnQuXHJcbiAgICAgICAgICAgIGlmIChlIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgZSA9IGk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZSArPSArbi5zbGljZShpICsgMSk7XHJcbiAgICAgICAgICAgIG4gPSBuLnN1YnN0cmluZygwLCBpKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChlIDwgMCkge1xyXG5cclxuICAgICAgICAgICAgLy8gSW50ZWdlci5cclxuICAgICAgICAgICAgZSA9IG4ubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIGxlYWRpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yIChpID0gMDsgbi5jaGFyQXQoaSkgPT0gJzAnOyBpKyspIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpID09IChuTCA9IG4ubGVuZ3RoKSkge1xyXG5cclxuICAgICAgICAgICAgLy8gWmVyby5cclxuICAgICAgICAgICAgeC5jID0gWyB4LmUgPSAwIF07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIERldGVybWluZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yICg7IG4uY2hhckF0KC0tbkwpID09ICcwJzspIHtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgeC5lID0gZSAtIGkgLSAxO1xyXG4gICAgICAgICAgICB4LmMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIC8vIENvbnZlcnQgc3RyaW5nIHRvIGFycmF5IG9mIGRpZ2l0cyB3aXRob3V0IGxlYWRpbmcvdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoZSA9IDA7IGkgPD0gbkw7IHguY1tlKytdID0gK24uY2hhckF0KGkrKykpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSb3VuZCBCaWcgeCB0byBhIG1heGltdW0gb2YgZHAgZGVjaW1hbCBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBybS5cclxuICAgICAqIENhbGxlZCBieSBkaXYsIHNxcnQgYW5kIHJvdW5kLlxyXG4gICAgICpcclxuICAgICAqIHgge0JpZ30gVGhlIEJpZyB0byByb3VuZC5cclxuICAgICAqIGRwIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqIHJtIHtudW1iZXJ9IDAsIDEsIDIgb3IgMyAoRE9XTiwgSEFMRl9VUCwgSEFMRl9FVkVOLCBVUClcclxuICAgICAqIFttb3JlXSB7Ym9vbGVhbn0gV2hldGhlciB0aGUgcmVzdWx0IG9mIGRpdmlzaW9uIHdhcyB0cnVuY2F0ZWQuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHJuZCh4LCBkcCwgcm0sIG1vcmUpIHtcclxuICAgICAgICB2YXIgdSxcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIGkgPSB4LmUgKyBkcCArIDE7XHJcblxyXG4gICAgICAgIGlmIChybSA9PT0gMSkge1xyXG5cclxuICAgICAgICAgICAgLy8geGNbaV0gaXMgdGhlIGRpZ2l0IGFmdGVyIHRoZSBkaWdpdCB0aGF0IG1heSBiZSByb3VuZGVkIHVwLlxyXG4gICAgICAgICAgICBtb3JlID0geGNbaV0gPj0gNTtcclxuICAgICAgICB9IGVsc2UgaWYgKHJtID09PSAyKSB7XHJcbiAgICAgICAgICAgIG1vcmUgPSB4Y1tpXSA+IDUgfHwgeGNbaV0gPT0gNSAmJlxyXG4gICAgICAgICAgICAgIChtb3JlIHx8IGkgPCAwIHx8IHhjW2kgKyAxXSAhPT0gdSB8fCB4Y1tpIC0gMV0gJiAxKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHJtID09PSAzKSB7XHJcbiAgICAgICAgICAgIG1vcmUgPSBtb3JlIHx8IHhjW2ldICE9PSB1IHx8IGkgPCAwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG1vcmUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIGlmIChybSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3dFcnIoJyFCaWcuUk0hJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpIDwgMSB8fCAheGNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChtb3JlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gMSwgMC4xLCAwLjAxLCAwLjAwMSwgMC4wMDAxIGV0Yy5cclxuICAgICAgICAgICAgICAgIHguZSA9IC1kcDtcclxuICAgICAgICAgICAgICAgIHguYyA9IFsxXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBaZXJvLlxyXG4gICAgICAgICAgICAgICAgeC5jID0gW3guZSA9IDBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSBhbnkgZGlnaXRzIGFmdGVyIHRoZSByZXF1aXJlZCBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAgICAgICAgeGMubGVuZ3RoID0gaS0tO1xyXG5cclxuICAgICAgICAgICAgLy8gUm91bmQgdXA/XHJcbiAgICAgICAgICAgIGlmIChtb3JlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gUm91bmRpbmcgdXAgbWF5IG1lYW4gdGhlIHByZXZpb3VzIGRpZ2l0IGhhcyB0byBiZSByb3VuZGVkIHVwLlxyXG4gICAgICAgICAgICAgICAgZm9yICg7ICsreGNbaV0gPiA5Oykge1xyXG4gICAgICAgICAgICAgICAgICAgIHhjW2ldID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpLS0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyt4LmU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhjLnVuc2hpZnQoMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoaSA9IHhjLmxlbmd0aDsgIXhjWy0taV07IHhjLnBvcCgpKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhyb3cgYSBCaWdFcnJvci5cclxuICAgICAqXHJcbiAgICAgKiBtZXNzYWdlIHtzdHJpbmd9IFRoZSBlcnJvciBtZXNzYWdlLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiB0aHJvd0VycihtZXNzYWdlKSB7XHJcbiAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcclxuICAgICAgICBlcnIubmFtZSA9ICdCaWdFcnJvcic7XHJcblxyXG4gICAgICAgIHRocm93IGVycjtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gUHJvdG90eXBlL2luc3RhbmNlIG1ldGhvZHNcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIGFic29sdXRlIHZhbHVlIG9mIHRoaXMgQmlnLlxyXG4gICAgICovXHJcbiAgICBQLmFicyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgeCA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKHRoaXMpO1xyXG4gICAgICAgIHgucyA9IDE7XHJcblxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVyblxyXG4gICAgICogMSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZ3JlYXRlciB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSxcclxuICAgICAqIC0xIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBsZXNzIHRoYW4gdGhlIHZhbHVlIG9mIEJpZyB5LCBvclxyXG4gICAgICogMCBpZiB0aGV5IGhhdmUgdGhlIHNhbWUgdmFsdWUuXHJcbiAgICAqL1xyXG4gICAgUC5jbXAgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciB4TmVnLFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIHljID0gKHkgPSBuZXcgeC5jb25zdHJ1Y3Rvcih5KSkuYyxcclxuICAgICAgICAgICAgaSA9IHgucyxcclxuICAgICAgICAgICAgaiA9IHkucyxcclxuICAgICAgICAgICAgayA9IHguZSxcclxuICAgICAgICAgICAgbCA9IHkuZTtcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuICF4Y1swXSA/ICF5Y1swXSA/IDAgOiAtaiA6IGk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTaWducyBkaWZmZXI/XHJcbiAgICAgICAgaWYgKGkgIT0gaikge1xyXG4gICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICB9XHJcbiAgICAgICAgeE5lZyA9IGkgPCAwO1xyXG5cclxuICAgICAgICAvLyBDb21wYXJlIGV4cG9uZW50cy5cclxuICAgICAgICBpZiAoayAhPSBsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBrID4gbCBeIHhOZWcgPyAxIDogLTE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpID0gLTE7XHJcbiAgICAgICAgaiA9IChrID0geGMubGVuZ3RoKSA8IChsID0geWMubGVuZ3RoKSA/IGsgOiBsO1xyXG5cclxuICAgICAgICAvLyBDb21wYXJlIGRpZ2l0IGJ5IGRpZ2l0LlxyXG4gICAgICAgIGZvciAoOyArK2kgPCBqOykge1xyXG5cclxuICAgICAgICAgICAgaWYgKHhjW2ldICE9IHljW2ldKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geGNbaV0gPiB5Y1tpXSBeIHhOZWcgPyAxIDogLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgbGVuZ3Rocy5cclxuICAgICAgICByZXR1cm4gayA9PSBsID8gMCA6IGsgPiBsIF4geE5lZyA/IDEgOiAtMTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBkaXZpZGVkIGJ5IHRoZVxyXG4gICAgICogdmFsdWUgb2YgQmlnIHksIHJvdW5kZWQsIGlmIG5lY2Vzc2FyeSwgdG8gYSBtYXhpbXVtIG9mIEJpZy5EUCBkZWNpbWFsXHJcbiAgICAgKiBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBCaWcuUk0uXHJcbiAgICAgKi9cclxuICAgIFAuZGl2ID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIC8vIGRpdmlkZW5kXHJcbiAgICAgICAgICAgIGR2ZCA9IHguYyxcclxuICAgICAgICAgICAgLy9kaXZpc29yXHJcbiAgICAgICAgICAgIGR2cyA9ICh5ID0gbmV3IEJpZyh5KSkuYyxcclxuICAgICAgICAgICAgcyA9IHgucyA9PSB5LnMgPyAxIDogLTEsXHJcbiAgICAgICAgICAgIGRwID0gQmlnLkRQO1xyXG5cclxuICAgICAgICBpZiAoZHAgIT09IH5+ZHAgfHwgZHAgPCAwIHx8IGRwID4gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchQmlnLkRQIScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIDA/XHJcbiAgICAgICAgaWYgKCFkdmRbMF0gfHwgIWR2c1swXSkge1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgYm90aCBhcmUgMCwgdGhyb3cgTmFOXHJcbiAgICAgICAgICAgIGlmIChkdmRbMF0gPT0gZHZzWzBdKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvd0VycihOYU4pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBkdnMgaXMgMCwgdGhyb3cgKy1JbmZpbml0eS5cclxuICAgICAgICAgICAgaWYgKCFkdnNbMF0pIHtcclxuICAgICAgICAgICAgICAgIHRocm93RXJyKHMgLyAwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gZHZkIGlzIDAsIHJldHVybiArLTAuXHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnKHMgKiAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBkdnNMLCBkdnNULCBuZXh0LCBjbXAsIHJlbUksIHUsXHJcbiAgICAgICAgICAgIGR2c1ogPSBkdnMuc2xpY2UoKSxcclxuICAgICAgICAgICAgZHZkSSA9IGR2c0wgPSBkdnMubGVuZ3RoLFxyXG4gICAgICAgICAgICBkdmRMID0gZHZkLmxlbmd0aCxcclxuICAgICAgICAgICAgLy8gcmVtYWluZGVyXHJcbiAgICAgICAgICAgIHJlbSA9IGR2ZC5zbGljZSgwLCBkdnNMKSxcclxuICAgICAgICAgICAgcmVtTCA9IHJlbS5sZW5ndGgsXHJcbiAgICAgICAgICAgIC8vIHF1b3RpZW50XHJcbiAgICAgICAgICAgIHEgPSB5LFxyXG4gICAgICAgICAgICBxYyA9IHEuYyA9IFtdLFxyXG4gICAgICAgICAgICBxaSA9IDAsXHJcbiAgICAgICAgICAgIGRpZ2l0cyA9IGRwICsgKHEuZSA9IHguZSAtIHkuZSkgKyAxO1xyXG5cclxuICAgICAgICBxLnMgPSBzO1xyXG4gICAgICAgIHMgPSBkaWdpdHMgPCAwID8gMCA6IGRpZ2l0cztcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIHZlcnNpb24gb2YgZGl2aXNvciB3aXRoIGxlYWRpbmcgemVyby5cclxuICAgICAgICBkdnNaLnVuc2hpZnQoMCk7XHJcblxyXG4gICAgICAgIC8vIEFkZCB6ZXJvcyB0byBtYWtlIHJlbWFpbmRlciBhcyBsb25nIGFzIGRpdmlzb3IuXHJcbiAgICAgICAgZm9yICg7IHJlbUwrKyA8IGR2c0w7IHJlbS5wdXNoKDApKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkbyB7XHJcblxyXG4gICAgICAgICAgICAvLyAnbmV4dCcgaXMgaG93IG1hbnkgdGltZXMgdGhlIGRpdmlzb3IgZ29lcyBpbnRvIGN1cnJlbnQgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICBmb3IgKG5leHQgPSAwOyBuZXh0IDwgMTA7IG5leHQrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENvbXBhcmUgZGl2aXNvciBhbmQgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgaWYgKGR2c0wgIT0gKHJlbUwgPSByZW0ubGVuZ3RoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNtcCA9IGR2c0wgPiByZW1MID8gMSA6IC0xO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChyZW1JID0gLTEsIGNtcCA9IDA7ICsrcmVtSSA8IGR2c0w7KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZHZzW3JlbUldICE9IHJlbVtyZW1JXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY21wID0gZHZzW3JlbUldID4gcmVtW3JlbUldID8gMSA6IC0xO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gSWYgZGl2aXNvciA8IHJlbWFpbmRlciwgc3VidHJhY3QgZGl2aXNvciBmcm9tIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgIGlmIChjbXAgPCAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlbWFpbmRlciBjYW4ndCBiZSBtb3JlIHRoYW4gMSBkaWdpdCBsb25nZXIgdGhhbiBkaXZpc29yLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEVxdWFsaXNlIGxlbmd0aHMgdXNpbmcgZGl2aXNvciB3aXRoIGV4dHJhIGxlYWRpbmcgemVybz9cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGR2c1QgPSByZW1MID09IGR2c0wgPyBkdnMgOiBkdnNaOyByZW1MOykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlbVstLXJlbUxdIDwgZHZzVFtyZW1MXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtSSA9IHJlbUw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICg7IHJlbUkgJiYgIXJlbVstLXJlbUldOyByZW1bcmVtSV0gPSA5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAtLXJlbVtyZW1JXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbVtyZW1MXSArPSAxMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1bcmVtTF0gLT0gZHZzVFtyZW1MXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICg7ICFyZW1bMF07IHJlbS5zaGlmdCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQWRkIHRoZSAnbmV4dCcgZGlnaXQgdG8gdGhlIHJlc3VsdCBhcnJheS5cclxuICAgICAgICAgICAgcWNbcWkrK10gPSBjbXAgPyBuZXh0IDogKytuZXh0O1xyXG5cclxuICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSByZW1haW5kZXIuXHJcbiAgICAgICAgICAgIGlmIChyZW1bMF0gJiYgY21wKSB7XHJcbiAgICAgICAgICAgICAgICByZW1bcmVtTF0gPSBkdmRbZHZkSV0gfHwgMDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlbSA9IFsgZHZkW2R2ZEldIF07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSB3aGlsZSAoKGR2ZEkrKyA8IGR2ZEwgfHwgcmVtWzBdICE9PSB1KSAmJiBzLS0pO1xyXG5cclxuICAgICAgICAvLyBMZWFkaW5nIHplcm8/IERvIG5vdCByZW1vdmUgaWYgcmVzdWx0IGlzIHNpbXBseSB6ZXJvIChxaSA9PSAxKS5cclxuICAgICAgICBpZiAoIXFjWzBdICYmIHFpICE9IDEpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZXJlIGNhbid0IGJlIG1vcmUgdGhhbiBvbmUgemVyby5cclxuICAgICAgICAgICAgcWMuc2hpZnQoKTtcclxuICAgICAgICAgICAgcS5lLS07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSb3VuZD9cclxuICAgICAgICBpZiAocWkgPiBkaWdpdHMpIHtcclxuICAgICAgICAgICAgcm5kKHEsIGRwLCBCaWcuUk0sIHJlbVswXSAhPT0gdSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZXF1YWwgdG8gdGhlIHZhbHVlIG9mIEJpZyB5LFxyXG4gICAgICogb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAuZXEgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHJldHVybiAhdGhpcy5jbXAoeSk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGdyZWF0ZXIgdGhhbiB0aGUgdmFsdWUgb2YgQmlnIHksXHJcbiAgICAgKiBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5ndCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY21wKHkpID4gMDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIHRoZVxyXG4gICAgICogdmFsdWUgb2YgQmlnIHksIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmd0ZSA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY21wKHkpID4gLTE7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGxlc3MgdGhhbiB0aGUgdmFsdWUgb2YgQmlnIHksXHJcbiAgICAgKiBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5sdCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY21wKHkpIDwgMDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIHRoZSB2YWx1ZVxyXG4gICAgICogb2YgQmlnIHksIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmx0ZSA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgIHJldHVybiB0aGlzLmNtcCh5KSA8IDE7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgbWludXMgdGhlIHZhbHVlXHJcbiAgICAgKiBvZiBCaWcgeS5cclxuICAgICAqL1xyXG4gICAgUC5zdWIgPSBQLm1pbnVzID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgaSwgaiwgdCwgeExUeSxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIGEgPSB4LnMsXHJcbiAgICAgICAgICAgIGIgPSAoeSA9IG5ldyBCaWcoeSkpLnM7XHJcblxyXG4gICAgICAgIC8vIFNpZ25zIGRpZmZlcj9cclxuICAgICAgICBpZiAoYSAhPSBiKSB7XHJcbiAgICAgICAgICAgIHkucyA9IC1iO1xyXG4gICAgICAgICAgICByZXR1cm4geC5wbHVzKHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHhjID0geC5jLnNsaWNlKCksXHJcbiAgICAgICAgICAgIHhlID0geC5lLFxyXG4gICAgICAgICAgICB5YyA9IHkuYyxcclxuICAgICAgICAgICAgeWUgPSB5LmU7XHJcblxyXG4gICAgICAgIC8vIEVpdGhlciB6ZXJvP1xyXG4gICAgICAgIGlmICgheGNbMF0gfHwgIXljWzBdKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB5IGlzIG5vbi16ZXJvPyB4IGlzIG5vbi16ZXJvPyBPciBib3RoIGFyZSB6ZXJvLlxyXG4gICAgICAgICAgICByZXR1cm4geWNbMF0gPyAoeS5zID0gLWIsIHkpIDogbmV3IEJpZyh4Y1swXSA/IHggOiAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSB3aGljaCBpcyB0aGUgYmlnZ2VyIG51bWJlci5cclxuICAgICAgICAvLyBQcmVwZW5kIHplcm9zIHRvIGVxdWFsaXNlIGV4cG9uZW50cy5cclxuICAgICAgICBpZiAoYSA9IHhlIC0geWUpIHtcclxuXHJcbiAgICAgICAgICAgIGlmICh4TFR5ID0gYSA8IDApIHtcclxuICAgICAgICAgICAgICAgIGEgPSAtYTtcclxuICAgICAgICAgICAgICAgIHQgPSB4YztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHllID0geGU7XHJcbiAgICAgICAgICAgICAgICB0ID0geWM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG4gICAgICAgICAgICBmb3IgKGIgPSBhOyBiLS07IHQucHVzaCgwKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBFeHBvbmVudHMgZXF1YWwuIENoZWNrIGRpZ2l0IGJ5IGRpZ2l0LlxyXG4gICAgICAgICAgICBqID0gKCh4TFR5ID0geGMubGVuZ3RoIDwgeWMubGVuZ3RoKSA/IHhjIDogeWMpLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIGZvciAoYSA9IGIgPSAwOyBiIDwgajsgYisrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHhjW2JdICE9IHljW2JdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeExUeSA9IHhjW2JdIDwgeWNbYl07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHggPCB5PyBQb2ludCB4YyB0byB0aGUgYXJyYXkgb2YgdGhlIGJpZ2dlciBudW1iZXIuXHJcbiAgICAgICAgaWYgKHhMVHkpIHtcclxuICAgICAgICAgICAgdCA9IHhjO1xyXG4gICAgICAgICAgICB4YyA9IHljO1xyXG4gICAgICAgICAgICB5YyA9IHQ7XHJcbiAgICAgICAgICAgIHkucyA9IC15LnM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIEFwcGVuZCB6ZXJvcyB0byB4YyBpZiBzaG9ydGVyLiBObyBuZWVkIHRvIGFkZCB6ZXJvcyB0byB5YyBpZiBzaG9ydGVyXHJcbiAgICAgICAgICogYXMgc3VidHJhY3Rpb24gb25seSBuZWVkcyB0byBzdGFydCBhdCB5Yy5sZW5ndGguXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaWYgKCggYiA9IChqID0geWMubGVuZ3RoKSAtIChpID0geGMubGVuZ3RoKSApID4gMCkge1xyXG5cclxuICAgICAgICAgICAgZm9yICg7IGItLTsgeGNbaSsrXSA9IDApIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU3VidHJhY3QgeWMgZnJvbSB4Yy5cclxuICAgICAgICBmb3IgKGIgPSBpOyBqID4gYTspe1xyXG5cclxuICAgICAgICAgICAgaWYgKHhjWy0tal0gPCB5Y1tqXSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IGo7IGkgJiYgIXhjWy0taV07IHhjW2ldID0gOSkge1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLS14Y1tpXTtcclxuICAgICAgICAgICAgICAgIHhjW2pdICs9IDEwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHhjW2pdIC09IHljW2pdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgIGZvciAoOyB4Y1stLWJdID09PSAwOyB4Yy5wb3AoKSkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIGxlYWRpbmcgemVyb3MgYW5kIGFkanVzdCBleHBvbmVudCBhY2NvcmRpbmdseS5cclxuICAgICAgICBmb3IgKDsgeGNbMF0gPT09IDA7KSB7XHJcbiAgICAgICAgICAgIHhjLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIC0teWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXhjWzBdKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBuIC0gbiA9ICswXHJcbiAgICAgICAgICAgIHkucyA9IDE7XHJcblxyXG4gICAgICAgICAgICAvLyBSZXN1bHQgbXVzdCBiZSB6ZXJvLlxyXG4gICAgICAgICAgICB4YyA9IFt5ZSA9IDBdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgeS5jID0geGM7XHJcbiAgICAgICAgeS5lID0geWU7XHJcblxyXG4gICAgICAgIHJldHVybiB5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIG1vZHVsbyB0aGVcclxuICAgICAqIHZhbHVlIG9mIEJpZyB5LlxyXG4gICAgICovXHJcbiAgICBQLm1vZCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIHlHVHgsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBhID0geC5zLFxyXG4gICAgICAgICAgICBiID0gKHkgPSBuZXcgQmlnKHkpKS5zO1xyXG5cclxuICAgICAgICBpZiAoIXkuY1swXSkge1xyXG4gICAgICAgICAgICB0aHJvd0VycihOYU4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgeC5zID0geS5zID0gMTtcclxuICAgICAgICB5R1R4ID0geS5jbXAoeCkgPT0gMTtcclxuICAgICAgICB4LnMgPSBhO1xyXG4gICAgICAgIHkucyA9IGI7XHJcblxyXG4gICAgICAgIGlmICh5R1R4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnKHgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYSA9IEJpZy5EUDtcclxuICAgICAgICBiID0gQmlnLlJNO1xyXG4gICAgICAgIEJpZy5EUCA9IEJpZy5STSA9IDA7XHJcbiAgICAgICAgeCA9IHguZGl2KHkpO1xyXG4gICAgICAgIEJpZy5EUCA9IGE7XHJcbiAgICAgICAgQmlnLlJNID0gYjtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWludXMoIHgudGltZXMoeSkgKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBwbHVzIHRoZSB2YWx1ZVxyXG4gICAgICogb2YgQmlnIHkuXHJcbiAgICAgKi9cclxuICAgIFAuYWRkID0gUC5wbHVzID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgdCxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIGEgPSB4LnMsXHJcbiAgICAgICAgICAgIGIgPSAoeSA9IG5ldyBCaWcoeSkpLnM7XHJcblxyXG4gICAgICAgIC8vIFNpZ25zIGRpZmZlcj9cclxuICAgICAgICBpZiAoYSAhPSBiKSB7XHJcbiAgICAgICAgICAgIHkucyA9IC1iO1xyXG4gICAgICAgICAgICByZXR1cm4geC5taW51cyh5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciB4ZSA9IHguZSxcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIHllID0geS5lLFxyXG4gICAgICAgICAgICB5YyA9IHkuYztcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHkgaXMgbm9uLXplcm8/IHggaXMgbm9uLXplcm8/IE9yIGJvdGggYXJlIHplcm8uXHJcbiAgICAgICAgICAgIHJldHVybiB5Y1swXSA/IHkgOiBuZXcgQmlnKHhjWzBdID8geCA6IGEgKiAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgeGMgPSB4Yy5zbGljZSgpO1xyXG5cclxuICAgICAgICAvLyBQcmVwZW5kIHplcm9zIHRvIGVxdWFsaXNlIGV4cG9uZW50cy5cclxuICAgICAgICAvLyBOb3RlOiBGYXN0ZXIgdG8gdXNlIHJldmVyc2UgdGhlbiBkbyB1bnNoaWZ0cy5cclxuICAgICAgICBpZiAoYSA9IHhlIC0geWUpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChhID4gMCkge1xyXG4gICAgICAgICAgICAgICAgeWUgPSB4ZTtcclxuICAgICAgICAgICAgICAgIHQgPSB5YztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGEgPSAtYTtcclxuICAgICAgICAgICAgICAgIHQgPSB4YztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgIGZvciAoOyBhLS07IHQucHVzaCgwKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUG9pbnQgeGMgdG8gdGhlIGxvbmdlciBhcnJheS5cclxuICAgICAgICBpZiAoeGMubGVuZ3RoIC0geWMubGVuZ3RoIDwgMCkge1xyXG4gICAgICAgICAgICB0ID0geWM7XHJcbiAgICAgICAgICAgIHljID0geGM7XHJcbiAgICAgICAgICAgIHhjID0gdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgYSA9IHljLmxlbmd0aDtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBPbmx5IHN0YXJ0IGFkZGluZyBhdCB5Yy5sZW5ndGggLSAxIGFzIHRoZSBmdXJ0aGVyIGRpZ2l0cyBvZiB4YyBjYW4gYmVcclxuICAgICAgICAgKiBsZWZ0IGFzIHRoZXkgYXJlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZvciAoYiA9IDA7IGE7KSB7XHJcbiAgICAgICAgICAgIGIgPSAoeGNbLS1hXSA9IHhjW2FdICsgeWNbYV0gKyBiKSAvIDEwIHwgMDtcclxuICAgICAgICAgICAgeGNbYV0gJT0gMTA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBObyBuZWVkIHRvIGNoZWNrIGZvciB6ZXJvLCBhcyAreCArICt5ICE9IDAgJiYgLXggKyAteSAhPSAwXHJcblxyXG4gICAgICAgIGlmIChiKSB7XHJcbiAgICAgICAgICAgIHhjLnVuc2hpZnQoYik7XHJcbiAgICAgICAgICAgICsreWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgIGZvciAoYSA9IHhjLmxlbmd0aDsgeGNbLS1hXSA9PT0gMDsgeGMucG9wKCkpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHkuYyA9IHhjO1xyXG4gICAgICAgIHkuZSA9IHllO1xyXG5cclxuICAgICAgICByZXR1cm4geTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHJhaXNlZCB0byB0aGUgcG93ZXIgbi5cclxuICAgICAqIElmIG4gaXMgbmVnYXRpdmUsIHJvdW5kLCBpZiBuZWNlc3NhcnksIHRvIGEgbWF4aW11bSBvZiBCaWcuRFAgZGVjaW1hbFxyXG4gICAgICogcGxhY2VzIHVzaW5nIHJvdW5kaW5nIG1vZGUgQmlnLlJNLlxyXG4gICAgICpcclxuICAgICAqIG4ge251bWJlcn0gSW50ZWdlciwgLU1BWF9QT1dFUiB0byBNQVhfUE9XRVIgaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBQLnBvdyA9IGZ1bmN0aW9uIChuKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBvbmUgPSBuZXcgeC5jb25zdHJ1Y3RvcigxKSxcclxuICAgICAgICAgICAgeSA9IG9uZSxcclxuICAgICAgICAgICAgaXNOZWcgPSBuIDwgMDtcclxuXHJcbiAgICAgICAgaWYgKG4gIT09IH5+biB8fCBuIDwgLU1BWF9QT1dFUiB8fCBuID4gTUFYX1BPV0VSKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchcG93IScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbiA9IGlzTmVnID8gLW4gOiBuO1xyXG5cclxuICAgICAgICBmb3IgKDs7KSB7XHJcblxyXG4gICAgICAgICAgICBpZiAobiAmIDEpIHtcclxuICAgICAgICAgICAgICAgIHkgPSB5LnRpbWVzKHgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG4gPj49IDE7XHJcblxyXG4gICAgICAgICAgICBpZiAoIW4pIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHggPSB4LnRpbWVzKHgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGlzTmVnID8gb25lLmRpdih5KSA6IHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgcm91bmRlZCB0byBhXHJcbiAgICAgKiBtYXhpbXVtIG9mIGRwIGRlY2ltYWwgcGxhY2VzIHVzaW5nIHJvdW5kaW5nIG1vZGUgcm0uXHJcbiAgICAgKiBJZiBkcCBpcyBub3Qgc3BlY2lmaWVkLCByb3VuZCB0byAwIGRlY2ltYWwgcGxhY2VzLlxyXG4gICAgICogSWYgcm0gaXMgbm90IHNwZWNpZmllZCwgdXNlIEJpZy5STS5cclxuICAgICAqXHJcbiAgICAgKiBbZHBdIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqIFtybV0gMCwgMSwgMiBvciAzIChST1VORF9ET1dOLCBST1VORF9IQUxGX1VQLCBST1VORF9IQUxGX0VWRU4sIFJPVU5EX1VQKVxyXG4gICAgICovXHJcbiAgICBQLnJvdW5kID0gZnVuY3Rpb24gKGRwLCBybSkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcjtcclxuXHJcbiAgICAgICAgaWYgKGRwID09IG51bGwpIHtcclxuICAgICAgICAgICAgZHAgPSAwO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZHAgIT09IH5+ZHAgfHwgZHAgPCAwIHx8IGRwID4gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchcm91bmQhJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJuZCh4ID0gbmV3IEJpZyh4KSwgZHAsIHJtID09IG51bGwgPyBCaWcuUk0gOiBybSk7XHJcblxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHNxdWFyZSByb290IG9mIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyxcclxuICAgICAqIHJvdW5kZWQsIGlmIG5lY2Vzc2FyeSwgdG8gYSBtYXhpbXVtIG9mIEJpZy5EUCBkZWNpbWFsIHBsYWNlcyB1c2luZ1xyXG4gICAgICogcm91bmRpbmcgbW9kZSBCaWcuUk0uXHJcbiAgICAgKi9cclxuICAgIFAuc3FydCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgZXN0aW1hdGUsIHIsIGFwcHJveCxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICBpID0geC5zLFxyXG4gICAgICAgICAgICBlID0geC5lLFxyXG4gICAgICAgICAgICBoYWxmID0gbmV3IEJpZygnMC41Jyk7XHJcblxyXG4gICAgICAgIC8vIFplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEJpZyh4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIG5lZ2F0aXZlLCB0aHJvdyBOYU4uXHJcbiAgICAgICAgaWYgKGkgPCAwKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKE5hTik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFc3RpbWF0ZS5cclxuICAgICAgICBpID0gTWF0aC5zcXJ0KHgudG9TdHJpbmcoKSk7XHJcblxyXG4gICAgICAgIC8vIE1hdGguc3FydCB1bmRlcmZsb3cvb3ZlcmZsb3c/XHJcbiAgICAgICAgLy8gUGFzcyB4IHRvIE1hdGguc3FydCBhcyBpbnRlZ2VyLCB0aGVuIGFkanVzdCB0aGUgcmVzdWx0IGV4cG9uZW50LlxyXG4gICAgICAgIGlmIChpID09PSAwIHx8IGkgPT09IDEgLyAwKSB7XHJcbiAgICAgICAgICAgIGVzdGltYXRlID0geGMuam9pbignJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIShlc3RpbWF0ZS5sZW5ndGggKyBlICYgMSkpIHtcclxuICAgICAgICAgICAgICAgIGVzdGltYXRlICs9ICcwJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgciA9IG5ldyBCaWcoIE1hdGguc3FydChlc3RpbWF0ZSkudG9TdHJpbmcoKSApO1xyXG4gICAgICAgICAgICByLmUgPSAoKGUgKyAxKSAvIDIgfCAwKSAtIChlIDwgMCB8fCBlICYgMSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgciA9IG5ldyBCaWcoaS50b1N0cmluZygpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGkgPSByLmUgKyAoQmlnLkRQICs9IDQpO1xyXG5cclxuICAgICAgICAvLyBOZXd0b24tUmFwaHNvbiBpdGVyYXRpb24uXHJcbiAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICBhcHByb3ggPSByO1xyXG4gICAgICAgICAgICByID0gaGFsZi50aW1lcyggYXBwcm94LnBsdXMoIHguZGl2KGFwcHJveCkgKSApO1xyXG4gICAgICAgIH0gd2hpbGUgKCBhcHByb3guYy5zbGljZSgwLCBpKS5qb2luKCcnKSAhPT1cclxuICAgICAgICAgICAgICAgICAgICAgICByLmMuc2xpY2UoMCwgaSkuam9pbignJykgKTtcclxuXHJcbiAgICAgICAgcm5kKHIsIEJpZy5EUCAtPSA0LCBCaWcuUk0pO1xyXG5cclxuICAgICAgICByZXR1cm4gcjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyB0aW1lcyB0aGUgdmFsdWUgb2ZcclxuICAgICAqIEJpZyB5LlxyXG4gICAgICovXHJcbiAgICBQLm11bCA9IFAudGltZXMgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciBjLFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIHljID0gKHkgPSBuZXcgQmlnKHkpKS5jLFxyXG4gICAgICAgICAgICBhID0geGMubGVuZ3RoLFxyXG4gICAgICAgICAgICBiID0geWMubGVuZ3RoLFxyXG4gICAgICAgICAgICBpID0geC5lLFxyXG4gICAgICAgICAgICBqID0geS5lO1xyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgc2lnbiBvZiByZXN1bHQuXHJcbiAgICAgICAgeS5zID0geC5zID09IHkucyA/IDEgOiAtMTtcclxuXHJcbiAgICAgICAgLy8gUmV0dXJuIHNpZ25lZCAwIGlmIGVpdGhlciAwLlxyXG4gICAgICAgIGlmICgheGNbMF0gfHwgIXljWzBdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnKHkucyAqIDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGlzZSBleHBvbmVudCBvZiByZXN1bHQgYXMgeC5lICsgeS5lLlxyXG4gICAgICAgIHkuZSA9IGkgKyBqO1xyXG5cclxuICAgICAgICAvLyBJZiBhcnJheSB4YyBoYXMgZmV3ZXIgZGlnaXRzIHRoYW4geWMsIHN3YXAgeGMgYW5kIHljLCBhbmQgbGVuZ3Rocy5cclxuICAgICAgICBpZiAoYSA8IGIpIHtcclxuICAgICAgICAgICAgYyA9IHhjO1xyXG4gICAgICAgICAgICB4YyA9IHljO1xyXG4gICAgICAgICAgICB5YyA9IGM7XHJcbiAgICAgICAgICAgIGogPSBhO1xyXG4gICAgICAgICAgICBhID0gYjtcclxuICAgICAgICAgICAgYiA9IGo7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXNlIGNvZWZmaWNpZW50IGFycmF5IG9mIHJlc3VsdCB3aXRoIHplcm9zLlxyXG4gICAgICAgIGZvciAoYyA9IG5ldyBBcnJheShqID0gYSArIGIpOyBqLS07IGNbal0gPSAwKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBNdWx0aXBseS5cclxuXHJcbiAgICAgICAgLy8gaSBpcyBpbml0aWFsbHkgeGMubGVuZ3RoLlxyXG4gICAgICAgIGZvciAoaSA9IGI7IGktLTspIHtcclxuICAgICAgICAgICAgYiA9IDA7XHJcblxyXG4gICAgICAgICAgICAvLyBhIGlzIHljLmxlbmd0aC5cclxuICAgICAgICAgICAgZm9yIChqID0gYSArIGk7IGogPiBpOykge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEN1cnJlbnQgc3VtIG9mIHByb2R1Y3RzIGF0IHRoaXMgZGlnaXQgcG9zaXRpb24sIHBsdXMgY2FycnkuXHJcbiAgICAgICAgICAgICAgICBiID0gY1tqXSArIHljW2ldICogeGNbaiAtIGkgLSAxXSArIGI7XHJcbiAgICAgICAgICAgICAgICBjW2otLV0gPSBiICUgMTA7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gY2FycnlcclxuICAgICAgICAgICAgICAgIGIgPSBiIC8gMTAgfCAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNbal0gPSAoY1tqXSArIGIpICUgMTA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJbmNyZW1lbnQgcmVzdWx0IGV4cG9uZW50IGlmIHRoZXJlIGlzIGEgZmluYWwgY2FycnkuXHJcbiAgICAgICAgaWYgKGIpIHtcclxuICAgICAgICAgICAgKyt5LmU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgYW55IGxlYWRpbmcgemVyby5cclxuICAgICAgICBpZiAoIWNbMF0pIHtcclxuICAgICAgICAgICAgYy5zaGlmdCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgIGZvciAoaSA9IGMubGVuZ3RoOyAhY1stLWldOyBjLnBvcCgpKSB7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHkuYyA9IGM7XHJcblxyXG4gICAgICAgIHJldHVybiB5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnLlxyXG4gICAgICogUmV0dXJuIGV4cG9uZW50aWFsIG5vdGF0aW9uIGlmIHRoaXMgQmlnIGhhcyBhIHBvc2l0aXZlIGV4cG9uZW50IGVxdWFsIHRvXHJcbiAgICAgKiBvciBncmVhdGVyIHRoYW4gQmlnLkVfUE9TLCBvciBhIG5lZ2F0aXZlIGV4cG9uZW50IGVxdWFsIHRvIG9yIGxlc3MgdGhhblxyXG4gICAgICogQmlnLkVfTkVHLlxyXG4gICAgICovXHJcbiAgICBQLnRvU3RyaW5nID0gUC52YWx1ZU9mID0gUC50b0pTT04gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBlID0geC5lLFxyXG4gICAgICAgICAgICBzdHIgPSB4LmMuam9pbignJyksXHJcbiAgICAgICAgICAgIHN0ckwgPSBzdHIubGVuZ3RoO1xyXG5cclxuICAgICAgICAvLyBFeHBvbmVudGlhbCBub3RhdGlvbj9cclxuICAgICAgICBpZiAoZSA8PSBCaWcuRV9ORUcgfHwgZSA+PSBCaWcuRV9QT1MpIHtcclxuICAgICAgICAgICAgc3RyID0gc3RyLmNoYXJBdCgwKSArIChzdHJMID4gMSA/ICcuJyArIHN0ci5zbGljZSgxKSA6ICcnKSArXHJcbiAgICAgICAgICAgICAgKGUgPCAwID8gJ2UnIDogJ2UrJykgKyBlO1xyXG5cclxuICAgICAgICAvLyBOZWdhdGl2ZSBleHBvbmVudD9cclxuICAgICAgICB9IGVsc2UgaWYgKGUgPCAwKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBQcmVwZW5kIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKDsgKytlOyBzdHIgPSAnMCcgKyBzdHIpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdHIgPSAnMC4nICsgc3RyO1xyXG5cclxuICAgICAgICAvLyBQb3NpdGl2ZSBleHBvbmVudD9cclxuICAgICAgICB9IGVsc2UgaWYgKGUgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoKytlID4gc3RyTCkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEFwcGVuZCB6ZXJvcy5cclxuICAgICAgICAgICAgICAgIGZvciAoZSAtPSBzdHJMOyBlLS0gOyBzdHIgKz0gJzAnKSB7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZSA8IHN0ckwpIHtcclxuICAgICAgICAgICAgICAgIHN0ciA9IHN0ci5zbGljZSgwLCBlKSArICcuJyArIHN0ci5zbGljZShlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFeHBvbmVudCB6ZXJvLlxyXG4gICAgICAgIH0gZWxzZSBpZiAoc3RyTCA+IDEpIHtcclxuICAgICAgICAgICAgc3RyID0gc3RyLmNoYXJBdCgwKSArICcuJyArIHN0ci5zbGljZSgxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEF2b2lkICctMCdcclxuICAgICAgICByZXR1cm4geC5zIDwgMCAmJiB4LmNbMF0gPyAnLScgKyBzdHIgOiBzdHI7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICogSWYgdG9FeHBvbmVudGlhbCwgdG9GaXhlZCwgdG9QcmVjaXNpb24gYW5kIGZvcm1hdCBhcmUgbm90IHJlcXVpcmVkIHRoZXlcclxuICAgICAqIGNhbiBzYWZlbHkgYmUgY29tbWVudGVkLW91dCBvciBkZWxldGVkLiBObyByZWR1bmRhbnQgY29kZSB3aWxsIGJlIGxlZnQuXHJcbiAgICAgKiBmb3JtYXQgaXMgdXNlZCBvbmx5IGJ5IHRvRXhwb25lbnRpYWwsIHRvRml4ZWQgYW5kIHRvUHJlY2lzaW9uLlxyXG4gICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICovXHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpbiBleHBvbmVudGlhbFxyXG4gICAgICogbm90YXRpb24gdG8gZHAgZml4ZWQgZGVjaW1hbCBwbGFjZXMgYW5kIHJvdW5kZWQsIGlmIG5lY2Vzc2FyeSwgdXNpbmdcclxuICAgICAqIEJpZy5STS5cclxuICAgICAqXHJcbiAgICAgKiBbZHBdIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqL1xyXG4gICAgUC50b0V4cG9uZW50aWFsID0gZnVuY3Rpb24gKGRwKSB7XHJcblxyXG4gICAgICAgIGlmIChkcCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGRwID0gdGhpcy5jLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkcCAhPT0gfn5kcCB8fCBkcCA8IDAgfHwgZHAgPiBNQVhfRFApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyF0b0V4cCEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmb3JtYXQodGhpcywgZHAsIDEpO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGluIG5vcm1hbCBub3RhdGlvblxyXG4gICAgICogdG8gZHAgZml4ZWQgZGVjaW1hbCBwbGFjZXMgYW5kIHJvdW5kZWQsIGlmIG5lY2Vzc2FyeSwgdXNpbmcgQmlnLlJNLlxyXG4gICAgICpcclxuICAgICAqIFtkcF0ge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBQLnRvRml4ZWQgPSBmdW5jdGlvbiAoZHApIHtcclxuICAgICAgICB2YXIgc3RyLFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgbmVnID0gQmlnLkVfTkVHLFxyXG4gICAgICAgICAgICBwb3MgPSBCaWcuRV9QT1M7XHJcblxyXG4gICAgICAgIC8vIFByZXZlbnQgdGhlIHBvc3NpYmlsaXR5IG9mIGV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAgICAgIEJpZy5FX05FRyA9IC0oQmlnLkVfUE9TID0gMSAvIDApO1xyXG5cclxuICAgICAgICBpZiAoZHAgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBzdHIgPSB4LnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkcCA9PT0gfn5kcCAmJiBkcCA+PSAwICYmIGRwIDw9IE1BWF9EUCkge1xyXG4gICAgICAgICAgICBzdHIgPSBmb3JtYXQoeCwgeC5lICsgZHApO1xyXG5cclxuICAgICAgICAgICAgLy8gKC0wKS50b0ZpeGVkKCkgaXMgJzAnLCBidXQgKC0wLjEpLnRvRml4ZWQoKSBpcyAnLTAnLlxyXG4gICAgICAgICAgICAvLyAoLTApLnRvRml4ZWQoMSkgaXMgJzAuMCcsIGJ1dCAoLTAuMDEpLnRvRml4ZWQoMSkgaXMgJy0wLjAnLlxyXG4gICAgICAgICAgICBpZiAoeC5zIDwgMCAmJiB4LmNbMF0gJiYgc3RyLmluZGV4T2YoJy0nKSA8IDApIHtcclxuICAgICAgICAvL0UuZy4gLTAuNSBpZiByb3VuZGVkIHRvIC0wIHdpbGwgY2F1c2UgdG9TdHJpbmcgdG8gb21pdCB0aGUgbWludXMgc2lnbi5cclxuICAgICAgICAgICAgICAgIHN0ciA9ICctJyArIHN0cjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBCaWcuRV9ORUcgPSBuZWc7XHJcbiAgICAgICAgQmlnLkVfUE9TID0gcG9zO1xyXG5cclxuICAgICAgICBpZiAoIXN0cikge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXRvRml4IScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHN0cjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyByb3VuZGVkIHRvIHNkXHJcbiAgICAgKiBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgQmlnLlJNLiBVc2UgZXhwb25lbnRpYWwgbm90YXRpb24gaWYgc2QgaXMgbGVzc1xyXG4gICAgICogdGhhbiB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBuZWNlc3NhcnkgdG8gcmVwcmVzZW50IHRoZSBpbnRlZ2VyIHBhcnQgb2YgdGhlXHJcbiAgICAgKiB2YWx1ZSBpbiBub3JtYWwgbm90YXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogc2Qge251bWJlcn0gSW50ZWdlciwgMSB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBQLnRvUHJlY2lzaW9uID0gZnVuY3Rpb24gKHNkKSB7XHJcblxyXG4gICAgICAgIGlmIChzZCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzZCAhPT0gfn5zZCB8fCBzZCA8IDEgfHwgc2QgPiBNQVhfRFApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyF0b1ByZSEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmb3JtYXQodGhpcywgc2QgLSAxLCAyKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8vIEV4cG9ydFxyXG5cclxuXHJcbiAgICBCaWcgPSBiaWdGYWN0b3J5KCk7XHJcblxyXG4gICAgLy9BTUQuXHJcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcbiAgICAgICAgZGVmaW5lKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEJpZztcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAvLyBOb2RlIGFuZCBvdGhlciBDb21tb25KUy1saWtlIGVudmlyb25tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMuXHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XHJcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBCaWc7XHJcblxyXG4gICAgLy9Ccm93c2VyLlxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBnbG9iYWwuQmlnID0gQmlnO1xyXG4gICAgfVxyXG59KSh0aGlzKTtcclxuIiwidmFyIFZOb2RlID0gcmVxdWlyZSgnLi92bm9kZScpO1xudmFyIGlzID0gcmVxdWlyZSgnLi9pcycpO1xuXG5mdW5jdGlvbiBhZGROUyhkYXRhLCBjaGlsZHJlbiwgc2VsKSB7XG4gIGRhdGEubnMgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnO1xuXG4gIGlmIChzZWwgIT09ICdmb3JlaWduT2JqZWN0JyAmJiBjaGlsZHJlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgYWRkTlMoY2hpbGRyZW5baV0uZGF0YSwgY2hpbGRyZW5baV0uY2hpbGRyZW4sIGNoaWxkcmVuW2ldLnNlbCk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaChzZWwsIGIsIGMpIHtcbiAgdmFyIGRhdGEgPSB7fSwgY2hpbGRyZW4sIHRleHQsIGk7XG4gIGlmIChjICE9PSB1bmRlZmluZWQpIHtcbiAgICBkYXRhID0gYjtcbiAgICBpZiAoaXMuYXJyYXkoYykpIHsgY2hpbGRyZW4gPSBjOyB9XG4gICAgZWxzZSBpZiAoaXMucHJpbWl0aXZlKGMpKSB7IHRleHQgPSBjOyB9XG4gIH0gZWxzZSBpZiAoYiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKGlzLmFycmF5KGIpKSB7IGNoaWxkcmVuID0gYjsgfVxuICAgIGVsc2UgaWYgKGlzLnByaW1pdGl2ZShiKSkgeyB0ZXh0ID0gYjsgfVxuICAgIGVsc2UgeyBkYXRhID0gYjsgfVxuICB9XG4gIGlmIChpcy5hcnJheShjaGlsZHJlbikpIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmIChpcy5wcmltaXRpdmUoY2hpbGRyZW5baV0pKSBjaGlsZHJlbltpXSA9IFZOb2RlKHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGNoaWxkcmVuW2ldKTtcbiAgICB9XG4gIH1cbiAgaWYgKHNlbFswXSA9PT0gJ3MnICYmIHNlbFsxXSA9PT0gJ3YnICYmIHNlbFsyXSA9PT0gJ2cnKSB7XG4gICAgYWRkTlMoZGF0YSwgY2hpbGRyZW4sIHNlbCk7XG4gIH1cbiAgcmV0dXJuIFZOb2RlKHNlbCwgZGF0YSwgY2hpbGRyZW4sIHRleHQsIHVuZGVmaW5lZCk7XG59O1xuIiwiZnVuY3Rpb24gY3JlYXRlRWxlbWVudCh0YWdOYW1lKXtcbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnTmFtZSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2VVUkksIHF1YWxpZmllZE5hbWUpe1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSwgcXVhbGlmaWVkTmFtZSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVRleHROb2RlKHRleHQpe1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dCk7XG59XG5cblxuZnVuY3Rpb24gaW5zZXJ0QmVmb3JlKHBhcmVudE5vZGUsIG5ld05vZGUsIHJlZmVyZW5jZU5vZGUpe1xuICBwYXJlbnROb2RlLmluc2VydEJlZm9yZShuZXdOb2RlLCByZWZlcmVuY2VOb2RlKTtcbn1cblxuXG5mdW5jdGlvbiByZW1vdmVDaGlsZChub2RlLCBjaGlsZCl7XG4gIG5vZGUucmVtb3ZlQ2hpbGQoY2hpbGQpO1xufVxuXG5mdW5jdGlvbiBhcHBlbmRDaGlsZChub2RlLCBjaGlsZCl7XG4gIG5vZGUuYXBwZW5kQ2hpbGQoY2hpbGQpO1xufVxuXG5mdW5jdGlvbiBwYXJlbnROb2RlKG5vZGUpe1xuICByZXR1cm4gbm9kZS5wYXJlbnRFbGVtZW50O1xufVxuXG5mdW5jdGlvbiBuZXh0U2libGluZyhub2RlKXtcbiAgcmV0dXJuIG5vZGUubmV4dFNpYmxpbmc7XG59XG5cbmZ1bmN0aW9uIHRhZ05hbWUobm9kZSl7XG4gIHJldHVybiBub2RlLnRhZ05hbWU7XG59XG5cbmZ1bmN0aW9uIHNldFRleHRDb250ZW50KG5vZGUsIHRleHQpe1xuICBub2RlLnRleHRDb250ZW50ID0gdGV4dDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZUVsZW1lbnQ6IGNyZWF0ZUVsZW1lbnQsXG4gIGNyZWF0ZUVsZW1lbnROUzogY3JlYXRlRWxlbWVudE5TLFxuICBjcmVhdGVUZXh0Tm9kZTogY3JlYXRlVGV4dE5vZGUsXG4gIGFwcGVuZENoaWxkOiBhcHBlbmRDaGlsZCxcbiAgcmVtb3ZlQ2hpbGQ6IHJlbW92ZUNoaWxkLFxuICBpbnNlcnRCZWZvcmU6IGluc2VydEJlZm9yZSxcbiAgcGFyZW50Tm9kZTogcGFyZW50Tm9kZSxcbiAgbmV4dFNpYmxpbmc6IG5leHRTaWJsaW5nLFxuICB0YWdOYW1lOiB0YWdOYW1lLFxuICBzZXRUZXh0Q29udGVudDogc2V0VGV4dENvbnRlbnRcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgYXJyYXk6IEFycmF5LmlzQXJyYXksXG4gIHByaW1pdGl2ZTogZnVuY3Rpb24ocykgeyByZXR1cm4gdHlwZW9mIHMgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBzID09PSAnbnVtYmVyJzsgfSxcbn07XG4iLCJ2YXIgTmFtZXNwYWNlVVJJcyA9IHtcbiAgXCJ4bGlua1wiOiBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIlxufTtcblxudmFyIGJvb2xlYW5BdHRycyA9IFtcImFsbG93ZnVsbHNjcmVlblwiLCBcImFzeW5jXCIsIFwiYXV0b2ZvY3VzXCIsIFwiYXV0b3BsYXlcIiwgXCJjaGVja2VkXCIsIFwiY29tcGFjdFwiLCBcImNvbnRyb2xzXCIsIFwiZGVjbGFyZVwiLFxuICAgICAgICAgICAgICAgIFwiZGVmYXVsdFwiLCBcImRlZmF1bHRjaGVja2VkXCIsIFwiZGVmYXVsdG11dGVkXCIsIFwiZGVmYXVsdHNlbGVjdGVkXCIsIFwiZGVmZXJcIiwgXCJkaXNhYmxlZFwiLCBcImRyYWdnYWJsZVwiLFxuICAgICAgICAgICAgICAgIFwiZW5hYmxlZFwiLCBcImZvcm1ub3ZhbGlkYXRlXCIsIFwiaGlkZGVuXCIsIFwiaW5kZXRlcm1pbmF0ZVwiLCBcImluZXJ0XCIsIFwiaXNtYXBcIiwgXCJpdGVtc2NvcGVcIiwgXCJsb29wXCIsIFwibXVsdGlwbGVcIixcbiAgICAgICAgICAgICAgICBcIm11dGVkXCIsIFwibm9ocmVmXCIsIFwibm9yZXNpemVcIiwgXCJub3NoYWRlXCIsIFwibm92YWxpZGF0ZVwiLCBcIm5vd3JhcFwiLCBcIm9wZW5cIiwgXCJwYXVzZW9uZXhpdFwiLCBcInJlYWRvbmx5XCIsXG4gICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiLCBcInJldmVyc2VkXCIsIFwic2NvcGVkXCIsIFwic2VhbWxlc3NcIiwgXCJzZWxlY3RlZFwiLCBcInNvcnRhYmxlXCIsIFwic3BlbGxjaGVja1wiLCBcInRyYW5zbGF0ZVwiLFxuICAgICAgICAgICAgICAgIFwidHJ1ZXNwZWVkXCIsIFwidHlwZW11c3RtYXRjaFwiLCBcInZpc2libGVcIl07XG5cbnZhciBib29sZWFuQXR0cnNEaWN0ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbmZvcih2YXIgaT0wLCBsZW4gPSBib29sZWFuQXR0cnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgYm9vbGVhbkF0dHJzRGljdFtib29sZWFuQXR0cnNbaV1dID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlQXR0cnMob2xkVm5vZGUsIHZub2RlKSB7XG4gIHZhciBrZXksIGN1ciwgb2xkLCBlbG0gPSB2bm9kZS5lbG0sXG4gICAgICBvbGRBdHRycyA9IG9sZFZub2RlLmRhdGEuYXR0cnMsIGF0dHJzID0gdm5vZGUuZGF0YS5hdHRycywgbmFtZXNwYWNlU3BsaXQ7XG5cbiAgaWYgKCFvbGRBdHRycyAmJiAhYXR0cnMpIHJldHVybjtcbiAgb2xkQXR0cnMgPSBvbGRBdHRycyB8fCB7fTtcbiAgYXR0cnMgPSBhdHRycyB8fCB7fTtcblxuICAvLyB1cGRhdGUgbW9kaWZpZWQgYXR0cmlidXRlcywgYWRkIG5ldyBhdHRyaWJ1dGVzXG4gIGZvciAoa2V5IGluIGF0dHJzKSB7XG4gICAgY3VyID0gYXR0cnNba2V5XTtcbiAgICBvbGQgPSBvbGRBdHRyc1trZXldO1xuICAgIGlmIChvbGQgIT09IGN1cikge1xuICAgICAgaWYoIWN1ciAmJiBib29sZWFuQXR0cnNEaWN0W2tleV0pXG4gICAgICAgIGVsbS5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgICAgIGVsc2Uge1xuICAgICAgICBuYW1lc3BhY2VTcGxpdCA9IGtleS5zcGxpdChcIjpcIik7XG4gICAgICAgIGlmKG5hbWVzcGFjZVNwbGl0Lmxlbmd0aCA+IDEgJiYgTmFtZXNwYWNlVVJJcy5oYXNPd25Qcm9wZXJ0eShuYW1lc3BhY2VTcGxpdFswXSkpXG4gICAgICAgICAgZWxtLnNldEF0dHJpYnV0ZU5TKE5hbWVzcGFjZVVSSXNbbmFtZXNwYWNlU3BsaXRbMF1dLCBrZXksIGN1cik7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKGtleSwgY3VyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLy9yZW1vdmUgcmVtb3ZlZCBhdHRyaWJ1dGVzXG4gIC8vIHVzZSBgaW5gIG9wZXJhdG9yIHNpbmNlIHRoZSBwcmV2aW91cyBgZm9yYCBpdGVyYXRpb24gdXNlcyBpdCAoLmkuZS4gYWRkIGV2ZW4gYXR0cmlidXRlcyB3aXRoIHVuZGVmaW5lZCB2YWx1ZSlcbiAgLy8gdGhlIG90aGVyIG9wdGlvbiBpcyB0byByZW1vdmUgYWxsIGF0dHJpYnV0ZXMgd2l0aCB2YWx1ZSA9PSB1bmRlZmluZWRcbiAgZm9yIChrZXkgaW4gb2xkQXR0cnMpIHtcbiAgICBpZiAoIShrZXkgaW4gYXR0cnMpKSB7XG4gICAgICBlbG0ucmVtb3ZlQXR0cmlidXRlKGtleSk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge2NyZWF0ZTogdXBkYXRlQXR0cnMsIHVwZGF0ZTogdXBkYXRlQXR0cnN9O1xuIiwiZnVuY3Rpb24gdXBkYXRlQ2xhc3Mob2xkVm5vZGUsIHZub2RlKSB7XG4gIHZhciBjdXIsIG5hbWUsIGVsbSA9IHZub2RlLmVsbSxcbiAgICAgIG9sZENsYXNzID0gb2xkVm5vZGUuZGF0YS5jbGFzcyxcbiAgICAgIGtsYXNzID0gdm5vZGUuZGF0YS5jbGFzcztcblxuICBpZiAoIW9sZENsYXNzICYmICFrbGFzcykgcmV0dXJuO1xuICBvbGRDbGFzcyA9IG9sZENsYXNzIHx8IHt9O1xuICBrbGFzcyA9IGtsYXNzIHx8IHt9O1xuXG4gIGZvciAobmFtZSBpbiBvbGRDbGFzcykge1xuICAgIGlmICgha2xhc3NbbmFtZV0pIHtcbiAgICAgIGVsbS5jbGFzc0xpc3QucmVtb3ZlKG5hbWUpO1xuICAgIH1cbiAgfVxuICBmb3IgKG5hbWUgaW4ga2xhc3MpIHtcbiAgICBjdXIgPSBrbGFzc1tuYW1lXTtcbiAgICBpZiAoY3VyICE9PSBvbGRDbGFzc1tuYW1lXSkge1xuICAgICAgZWxtLmNsYXNzTGlzdFtjdXIgPyAnYWRkJyA6ICdyZW1vdmUnXShuYW1lKTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7Y3JlYXRlOiB1cGRhdGVDbGFzcywgdXBkYXRlOiB1cGRhdGVDbGFzc307XG4iLCJmdW5jdGlvbiBpbnZva2VIYW5kbGVyKGhhbmRsZXIsIHZub2RlLCBldmVudCkge1xuICBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIC8vIGNhbGwgZnVuY3Rpb24gaGFuZGxlclxuICAgIGhhbmRsZXIuY2FsbCh2bm9kZSwgZXZlbnQsIHZub2RlKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJvYmplY3RcIikge1xuICAgIC8vIGNhbGwgaGFuZGxlciB3aXRoIGFyZ3VtZW50c1xuICAgIGlmICh0eXBlb2YgaGFuZGxlclswXSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAvLyBzcGVjaWFsIGNhc2UgZm9yIHNpbmdsZSBhcmd1bWVudCBmb3IgcGVyZm9ybWFuY2VcbiAgICAgIGlmIChoYW5kbGVyLmxlbmd0aCA9PT0gMikge1xuICAgICAgICBoYW5kbGVyWzBdLmNhbGwodm5vZGUsIGhhbmRsZXJbMV0sIGV2ZW50LCB2bm9kZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgYXJncyA9IGhhbmRsZXIuc2xpY2UoMSk7XG4gICAgICAgIGFyZ3MucHVzaChldmVudCk7XG4gICAgICAgIGFyZ3MucHVzaCh2bm9kZSk7XG4gICAgICAgIGhhbmRsZXJbMF0uYXBwbHkodm5vZGUsIGFyZ3MpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjYWxsIG11bHRpcGxlIGhhbmRsZXJzXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhhbmRsZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaW52b2tlSGFuZGxlcihoYW5kbGVyW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlRXZlbnQoZXZlbnQsIHZub2RlKSB7XG4gIHZhciBuYW1lID0gZXZlbnQudHlwZSxcbiAgICAgIG9uID0gdm5vZGUuZGF0YS5vbjtcblxuICAvLyBjYWxsIGV2ZW50IGhhbmRsZXIocykgaWYgZXhpc3RzXG4gIGlmIChvbiAmJiBvbltuYW1lXSkge1xuICAgIGludm9rZUhhbmRsZXIob25bbmFtZV0sIHZub2RlLCBldmVudCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlTGlzdGVuZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBoYW5kbGVyKGV2ZW50KSB7XG4gICAgaGFuZGxlRXZlbnQoZXZlbnQsIGhhbmRsZXIudm5vZGUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUV2ZW50TGlzdGVuZXJzKG9sZFZub2RlLCB2bm9kZSkge1xuICB2YXIgb2xkT24gPSBvbGRWbm9kZS5kYXRhLm9uLFxuICAgICAgb2xkTGlzdGVuZXIgPSBvbGRWbm9kZS5saXN0ZW5lcixcbiAgICAgIG9sZEVsbSA9IG9sZFZub2RlLmVsbSxcbiAgICAgIG9uID0gdm5vZGUgJiYgdm5vZGUuZGF0YS5vbixcbiAgICAgIGVsbSA9IHZub2RlICYmIHZub2RlLmVsbSxcbiAgICAgIG5hbWU7XG5cbiAgLy8gb3B0aW1pemF0aW9uIGZvciByZXVzZWQgaW1tdXRhYmxlIGhhbmRsZXJzXG4gIGlmIChvbGRPbiA9PT0gb24pIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyByZW1vdmUgZXhpc3RpbmcgbGlzdGVuZXJzIHdoaWNoIG5vIGxvbmdlciB1c2VkXG4gIGlmIChvbGRPbiAmJiBvbGRMaXN0ZW5lcikge1xuICAgIC8vIGlmIGVsZW1lbnQgY2hhbmdlZCBvciBkZWxldGVkIHdlIHJlbW92ZSBhbGwgZXhpc3RpbmcgbGlzdGVuZXJzIHVuY29uZGl0aW9uYWxseVxuICAgIGlmICghb24pIHtcbiAgICAgIGZvciAobmFtZSBpbiBvbGRPbikge1xuICAgICAgICAvLyByZW1vdmUgbGlzdGVuZXIgaWYgZWxlbWVudCB3YXMgY2hhbmdlZCBvciBleGlzdGluZyBsaXN0ZW5lcnMgcmVtb3ZlZFxuICAgICAgICBvbGRFbG0ucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCBvbGRMaXN0ZW5lciwgZmFsc2UpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKG5hbWUgaW4gb2xkT24pIHtcbiAgICAgICAgLy8gcmVtb3ZlIGxpc3RlbmVyIGlmIGV4aXN0aW5nIGxpc3RlbmVyIHJlbW92ZWRcbiAgICAgICAgaWYgKCFvbltuYW1lXSkge1xuICAgICAgICAgIG9sZEVsbS5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIG9sZExpc3RlbmVyLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBhZGQgbmV3IGxpc3RlbmVycyB3aGljaCBoYXMgbm90IGFscmVhZHkgYXR0YWNoZWRcbiAgaWYgKG9uKSB7XG4gICAgLy8gcmV1c2UgZXhpc3RpbmcgbGlzdGVuZXIgb3IgY3JlYXRlIG5ld1xuICAgIHZhciBsaXN0ZW5lciA9IHZub2RlLmxpc3RlbmVyID0gb2xkVm5vZGUubGlzdGVuZXIgfHwgY3JlYXRlTGlzdGVuZXIoKTtcbiAgICAvLyB1cGRhdGUgdm5vZGUgZm9yIGxpc3RlbmVyXG4gICAgbGlzdGVuZXIudm5vZGUgPSB2bm9kZTtcblxuICAgIC8vIGlmIGVsZW1lbnQgY2hhbmdlZCBvciBhZGRlZCB3ZSBhZGQgYWxsIG5lZWRlZCBsaXN0ZW5lcnMgdW5jb25kaXRpb25hbGx5XG4gICAgaWYgKCFvbGRPbikge1xuICAgICAgZm9yIChuYW1lIGluIG9uKSB7XG4gICAgICAgIC8vIGFkZCBsaXN0ZW5lciBpZiBlbGVtZW50IHdhcyBjaGFuZ2VkIG9yIG5ldyBsaXN0ZW5lcnMgYWRkZWRcbiAgICAgICAgZWxtLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgbGlzdGVuZXIsIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChuYW1lIGluIG9uKSB7XG4gICAgICAgIC8vIGFkZCBsaXN0ZW5lciBpZiBuZXcgbGlzdGVuZXIgYWRkZWRcbiAgICAgICAgaWYgKCFvbGRPbltuYW1lXSkge1xuICAgICAgICAgIGVsbS5hZGRFdmVudExpc3RlbmVyKG5hbWUsIGxpc3RlbmVyLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogdXBkYXRlRXZlbnRMaXN0ZW5lcnMsXG4gIHVwZGF0ZTogdXBkYXRlRXZlbnRMaXN0ZW5lcnMsXG4gIGRlc3Ryb3k6IHVwZGF0ZUV2ZW50TGlzdGVuZXJzXG59O1xuIiwiZnVuY3Rpb24gdXBkYXRlUHJvcHMob2xkVm5vZGUsIHZub2RlKSB7XG4gIHZhciBrZXksIGN1ciwgb2xkLCBlbG0gPSB2bm9kZS5lbG0sXG4gICAgICBvbGRQcm9wcyA9IG9sZFZub2RlLmRhdGEucHJvcHMsIHByb3BzID0gdm5vZGUuZGF0YS5wcm9wcztcblxuICBpZiAoIW9sZFByb3BzICYmICFwcm9wcykgcmV0dXJuO1xuICBvbGRQcm9wcyA9IG9sZFByb3BzIHx8IHt9O1xuICBwcm9wcyA9IHByb3BzIHx8IHt9O1xuXG4gIGZvciAoa2V5IGluIG9sZFByb3BzKSB7XG4gICAgaWYgKCFwcm9wc1trZXldKSB7XG4gICAgICBkZWxldGUgZWxtW2tleV07XG4gICAgfVxuICB9XG4gIGZvciAoa2V5IGluIHByb3BzKSB7XG4gICAgY3VyID0gcHJvcHNba2V5XTtcbiAgICBvbGQgPSBvbGRQcm9wc1trZXldO1xuICAgIGlmIChvbGQgIT09IGN1ciAmJiAoa2V5ICE9PSAndmFsdWUnIHx8IGVsbVtrZXldICE9PSBjdXIpKSB7XG4gICAgICBlbG1ba2V5XSA9IGN1cjtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7Y3JlYXRlOiB1cGRhdGVQcm9wcywgdXBkYXRlOiB1cGRhdGVQcm9wc307XG4iLCJ2YXIgcmFmID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHx8IHNldFRpbWVvdXQ7XG52YXIgbmV4dEZyYW1lID0gZnVuY3Rpb24oZm4pIHsgcmFmKGZ1bmN0aW9uKCkgeyByYWYoZm4pOyB9KTsgfTtcblxuZnVuY3Rpb24gc2V0TmV4dEZyYW1lKG9iaiwgcHJvcCwgdmFsKSB7XG4gIG5leHRGcmFtZShmdW5jdGlvbigpIHsgb2JqW3Byb3BdID0gdmFsOyB9KTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlU3R5bGUob2xkVm5vZGUsIHZub2RlKSB7XG4gIHZhciBjdXIsIG5hbWUsIGVsbSA9IHZub2RlLmVsbSxcbiAgICAgIG9sZFN0eWxlID0gb2xkVm5vZGUuZGF0YS5zdHlsZSxcbiAgICAgIHN0eWxlID0gdm5vZGUuZGF0YS5zdHlsZTtcblxuICBpZiAoIW9sZFN0eWxlICYmICFzdHlsZSkgcmV0dXJuO1xuICBvbGRTdHlsZSA9IG9sZFN0eWxlIHx8IHt9O1xuICBzdHlsZSA9IHN0eWxlIHx8IHt9O1xuICB2YXIgb2xkSGFzRGVsID0gJ2RlbGF5ZWQnIGluIG9sZFN0eWxlO1xuXG4gIGZvciAobmFtZSBpbiBvbGRTdHlsZSkge1xuICAgIGlmICghc3R5bGVbbmFtZV0pIHtcbiAgICAgIGVsbS5zdHlsZVtuYW1lXSA9ICcnO1xuICAgIH1cbiAgfVxuICBmb3IgKG5hbWUgaW4gc3R5bGUpIHtcbiAgICBjdXIgPSBzdHlsZVtuYW1lXTtcbiAgICBpZiAobmFtZSA9PT0gJ2RlbGF5ZWQnKSB7XG4gICAgICBmb3IgKG5hbWUgaW4gc3R5bGUuZGVsYXllZCkge1xuICAgICAgICBjdXIgPSBzdHlsZS5kZWxheWVkW25hbWVdO1xuICAgICAgICBpZiAoIW9sZEhhc0RlbCB8fCBjdXIgIT09IG9sZFN0eWxlLmRlbGF5ZWRbbmFtZV0pIHtcbiAgICAgICAgICBzZXROZXh0RnJhbWUoZWxtLnN0eWxlLCBuYW1lLCBjdXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChuYW1lICE9PSAncmVtb3ZlJyAmJiBjdXIgIT09IG9sZFN0eWxlW25hbWVdKSB7XG4gICAgICBlbG0uc3R5bGVbbmFtZV0gPSBjdXI7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGFwcGx5RGVzdHJveVN0eWxlKHZub2RlKSB7XG4gIHZhciBzdHlsZSwgbmFtZSwgZWxtID0gdm5vZGUuZWxtLCBzID0gdm5vZGUuZGF0YS5zdHlsZTtcbiAgaWYgKCFzIHx8ICEoc3R5bGUgPSBzLmRlc3Ryb3kpKSByZXR1cm47XG4gIGZvciAobmFtZSBpbiBzdHlsZSkge1xuICAgIGVsbS5zdHlsZVtuYW1lXSA9IHN0eWxlW25hbWVdO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFwcGx5UmVtb3ZlU3R5bGUodm5vZGUsIHJtKSB7XG4gIHZhciBzID0gdm5vZGUuZGF0YS5zdHlsZTtcbiAgaWYgKCFzIHx8ICFzLnJlbW92ZSkge1xuICAgIHJtKCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBuYW1lLCBlbG0gPSB2bm9kZS5lbG0sIGlkeCwgaSA9IDAsIG1heER1ciA9IDAsXG4gICAgICBjb21wU3R5bGUsIHN0eWxlID0gcy5yZW1vdmUsIGFtb3VudCA9IDAsIGFwcGxpZWQgPSBbXTtcbiAgZm9yIChuYW1lIGluIHN0eWxlKSB7XG4gICAgYXBwbGllZC5wdXNoKG5hbWUpO1xuICAgIGVsbS5zdHlsZVtuYW1lXSA9IHN0eWxlW25hbWVdO1xuICB9XG4gIGNvbXBTdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxtKTtcbiAgdmFyIHByb3BzID0gY29tcFN0eWxlWyd0cmFuc2l0aW9uLXByb3BlcnR5J10uc3BsaXQoJywgJyk7XG4gIGZvciAoOyBpIDwgcHJvcHMubGVuZ3RoOyArK2kpIHtcbiAgICBpZihhcHBsaWVkLmluZGV4T2YocHJvcHNbaV0pICE9PSAtMSkgYW1vdW50Kys7XG4gIH1cbiAgZWxtLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBmdW5jdGlvbihldikge1xuICAgIGlmIChldi50YXJnZXQgPT09IGVsbSkgLS1hbW91bnQ7XG4gICAgaWYgKGFtb3VudCA9PT0gMCkgcm0oKTtcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge2NyZWF0ZTogdXBkYXRlU3R5bGUsIHVwZGF0ZTogdXBkYXRlU3R5bGUsIGRlc3Ryb3k6IGFwcGx5RGVzdHJveVN0eWxlLCByZW1vdmU6IGFwcGx5UmVtb3ZlU3R5bGV9O1xuIiwiLy8ganNoaW50IG5ld2NhcDogZmFsc2Vcbi8qIGdsb2JhbCByZXF1aXJlLCBtb2R1bGUsIGRvY3VtZW50LCBOb2RlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBWTm9kZSA9IHJlcXVpcmUoJy4vdm5vZGUnKTtcbnZhciBpcyA9IHJlcXVpcmUoJy4vaXMnKTtcbnZhciBkb21BcGkgPSByZXF1aXJlKCcuL2h0bWxkb21hcGknKTtcblxuZnVuY3Rpb24gaXNVbmRlZihzKSB7IHJldHVybiBzID09PSB1bmRlZmluZWQ7IH1cbmZ1bmN0aW9uIGlzRGVmKHMpIHsgcmV0dXJuIHMgIT09IHVuZGVmaW5lZDsgfVxuXG52YXIgZW1wdHlOb2RlID0gVk5vZGUoJycsIHt9LCBbXSwgdW5kZWZpbmVkLCB1bmRlZmluZWQpO1xuXG5mdW5jdGlvbiBzYW1lVm5vZGUodm5vZGUxLCB2bm9kZTIpIHtcbiAgcmV0dXJuIHZub2RlMS5rZXkgPT09IHZub2RlMi5rZXkgJiYgdm5vZGUxLnNlbCA9PT0gdm5vZGUyLnNlbDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlS2V5VG9PbGRJZHgoY2hpbGRyZW4sIGJlZ2luSWR4LCBlbmRJZHgpIHtcbiAgdmFyIGksIG1hcCA9IHt9LCBrZXk7XG4gIGZvciAoaSA9IGJlZ2luSWR4OyBpIDw9IGVuZElkeDsgKytpKSB7XG4gICAga2V5ID0gY2hpbGRyZW5baV0ua2V5O1xuICAgIGlmIChpc0RlZihrZXkpKSBtYXBba2V5XSA9IGk7XG4gIH1cbiAgcmV0dXJuIG1hcDtcbn1cblxudmFyIGhvb2tzID0gWydjcmVhdGUnLCAndXBkYXRlJywgJ3JlbW92ZScsICdkZXN0cm95JywgJ3ByZScsICdwb3N0J107XG5cbmZ1bmN0aW9uIGluaXQobW9kdWxlcywgYXBpKSB7XG4gIHZhciBpLCBqLCBjYnMgPSB7fTtcblxuICBpZiAoaXNVbmRlZihhcGkpKSBhcGkgPSBkb21BcGk7XG5cbiAgZm9yIChpID0gMDsgaSA8IGhvb2tzLmxlbmd0aDsgKytpKSB7XG4gICAgY2JzW2hvb2tzW2ldXSA9IFtdO1xuICAgIGZvciAoaiA9IDA7IGogPCBtb2R1bGVzLmxlbmd0aDsgKytqKSB7XG4gICAgICBpZiAobW9kdWxlc1tqXVtob29rc1tpXV0gIT09IHVuZGVmaW5lZCkgY2JzW2hvb2tzW2ldXS5wdXNoKG1vZHVsZXNbal1baG9va3NbaV1dKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBlbXB0eU5vZGVBdChlbG0pIHtcbiAgICB2YXIgaWQgPSBlbG0uaWQgPyAnIycgKyBlbG0uaWQgOiAnJztcbiAgICB2YXIgYyA9IGVsbS5jbGFzc05hbWUgPyAnLicgKyBlbG0uY2xhc3NOYW1lLnNwbGl0KCcgJykuam9pbignLicpIDogJyc7XG4gICAgcmV0dXJuIFZOb2RlKGFwaS50YWdOYW1lKGVsbSkudG9Mb3dlckNhc2UoKSArIGlkICsgYywge30sIFtdLCB1bmRlZmluZWQsIGVsbSk7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVSbUNiKGNoaWxkRWxtLCBsaXN0ZW5lcnMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoLS1saXN0ZW5lcnMgPT09IDApIHtcbiAgICAgICAgdmFyIHBhcmVudCA9IGFwaS5wYXJlbnROb2RlKGNoaWxkRWxtKTtcbiAgICAgICAgYXBpLnJlbW92ZUNoaWxkKHBhcmVudCwgY2hpbGRFbG0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVFbG0odm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgIHZhciBpLCBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICBpZiAoaXNEZWYoZGF0YSkpIHtcbiAgICAgIGlmIChpc0RlZihpID0gZGF0YS5ob29rKSAmJiBpc0RlZihpID0gaS5pbml0KSkge1xuICAgICAgICBpKHZub2RlKTtcbiAgICAgICAgZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBlbG0sIGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW4sIHNlbCA9IHZub2RlLnNlbDtcbiAgICBpZiAoaXNEZWYoc2VsKSkge1xuICAgICAgLy8gUGFyc2Ugc2VsZWN0b3JcbiAgICAgIHZhciBoYXNoSWR4ID0gc2VsLmluZGV4T2YoJyMnKTtcbiAgICAgIHZhciBkb3RJZHggPSBzZWwuaW5kZXhPZignLicsIGhhc2hJZHgpO1xuICAgICAgdmFyIGhhc2ggPSBoYXNoSWR4ID4gMCA/IGhhc2hJZHggOiBzZWwubGVuZ3RoO1xuICAgICAgdmFyIGRvdCA9IGRvdElkeCA+IDAgPyBkb3RJZHggOiBzZWwubGVuZ3RoO1xuICAgICAgdmFyIHRhZyA9IGhhc2hJZHggIT09IC0xIHx8IGRvdElkeCAhPT0gLTEgPyBzZWwuc2xpY2UoMCwgTWF0aC5taW4oaGFzaCwgZG90KSkgOiBzZWw7XG4gICAgICBlbG0gPSB2bm9kZS5lbG0gPSBpc0RlZihkYXRhKSAmJiBpc0RlZihpID0gZGF0YS5ucykgPyBhcGkuY3JlYXRlRWxlbWVudE5TKGksIHRhZylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGFwaS5jcmVhdGVFbGVtZW50KHRhZyk7XG4gICAgICBpZiAoaGFzaCA8IGRvdCkgZWxtLmlkID0gc2VsLnNsaWNlKGhhc2ggKyAxLCBkb3QpO1xuICAgICAgaWYgKGRvdElkeCA+IDApIGVsbS5jbGFzc05hbWUgPSBzZWwuc2xpY2UoZG90ICsgMSkucmVwbGFjZSgvXFwuL2csICcgJyk7XG4gICAgICBpZiAoaXMuYXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgIGFwaS5hcHBlbmRDaGlsZChlbG0sIGNyZWF0ZUVsbShjaGlsZHJlbltpXSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoaXMucHJpbWl0aXZlKHZub2RlLnRleHQpKSB7XG4gICAgICAgIGFwaS5hcHBlbmRDaGlsZChlbG0sIGFwaS5jcmVhdGVUZXh0Tm9kZSh2bm9kZS50ZXh0KSk7XG4gICAgICB9XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLmNyZWF0ZS5sZW5ndGg7ICsraSkgY2JzLmNyZWF0ZVtpXShlbXB0eU5vZGUsIHZub2RlKTtcbiAgICAgIGkgPSB2bm9kZS5kYXRhLmhvb2s7IC8vIFJldXNlIHZhcmlhYmxlXG4gICAgICBpZiAoaXNEZWYoaSkpIHtcbiAgICAgICAgaWYgKGkuY3JlYXRlKSBpLmNyZWF0ZShlbXB0eU5vZGUsIHZub2RlKTtcbiAgICAgICAgaWYgKGkuaW5zZXJ0KSBpbnNlcnRlZFZub2RlUXVldWUucHVzaCh2bm9kZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsbSA9IHZub2RlLmVsbSA9IGFwaS5jcmVhdGVUZXh0Tm9kZSh2bm9kZS50ZXh0KTtcbiAgICB9XG4gICAgcmV0dXJuIHZub2RlLmVsbTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFZub2RlcyhwYXJlbnRFbG0sIGJlZm9yZSwgdm5vZGVzLCBzdGFydElkeCwgZW5kSWR4LCBpbnNlcnRlZFZub2RlUXVldWUpIHtcbiAgICBmb3IgKDsgc3RhcnRJZHggPD0gZW5kSWR4OyArK3N0YXJ0SWR4KSB7XG4gICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgY3JlYXRlRWxtKHZub2Rlc1tzdGFydElkeF0sIGluc2VydGVkVm5vZGVRdWV1ZSksIGJlZm9yZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW52b2tlRGVzdHJveUhvb2sodm5vZGUpIHtcbiAgICB2YXIgaSwgaiwgZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgaWYgKGlzRGVmKGRhdGEpKSB7XG4gICAgICBpZiAoaXNEZWYoaSA9IGRhdGEuaG9vaykgJiYgaXNEZWYoaSA9IGkuZGVzdHJveSkpIGkodm5vZGUpO1xuICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5kZXN0cm95Lmxlbmd0aDsgKytpKSBjYnMuZGVzdHJveVtpXSh2bm9kZSk7XG4gICAgICBpZiAoaXNEZWYoaSA9IHZub2RlLmNoaWxkcmVuKSkge1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgdm5vZGUuY2hpbGRyZW4ubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICBpbnZva2VEZXN0cm95SG9vayh2bm9kZS5jaGlsZHJlbltqXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVWbm9kZXMocGFyZW50RWxtLCB2bm9kZXMsIHN0YXJ0SWR4LCBlbmRJZHgpIHtcbiAgICBmb3IgKDsgc3RhcnRJZHggPD0gZW5kSWR4OyArK3N0YXJ0SWR4KSB7XG4gICAgICB2YXIgaSwgbGlzdGVuZXJzLCBybSwgY2ggPSB2bm9kZXNbc3RhcnRJZHhdO1xuICAgICAgaWYgKGlzRGVmKGNoKSkge1xuICAgICAgICBpZiAoaXNEZWYoY2guc2VsKSkge1xuICAgICAgICAgIGludm9rZURlc3Ryb3lIb29rKGNoKTtcbiAgICAgICAgICBsaXN0ZW5lcnMgPSBjYnMucmVtb3ZlLmxlbmd0aCArIDE7XG4gICAgICAgICAgcm0gPSBjcmVhdGVSbUNiKGNoLmVsbSwgbGlzdGVuZXJzKTtcbiAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLnJlbW92ZS5sZW5ndGg7ICsraSkgY2JzLnJlbW92ZVtpXShjaCwgcm0pO1xuICAgICAgICAgIGlmIChpc0RlZihpID0gY2guZGF0YSkgJiYgaXNEZWYoaSA9IGkuaG9vaykgJiYgaXNEZWYoaSA9IGkucmVtb3ZlKSkge1xuICAgICAgICAgICAgaShjaCwgcm0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBybSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHsgLy8gVGV4dCBub2RlXG4gICAgICAgICAgYXBpLnJlbW92ZUNoaWxkKHBhcmVudEVsbSwgY2guZWxtKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUNoaWxkcmVuKHBhcmVudEVsbSwgb2xkQ2gsIG5ld0NoLCBpbnNlcnRlZFZub2RlUXVldWUpIHtcbiAgICB2YXIgb2xkU3RhcnRJZHggPSAwLCBuZXdTdGFydElkeCA9IDA7XG4gICAgdmFyIG9sZEVuZElkeCA9IG9sZENoLmxlbmd0aCAtIDE7XG4gICAgdmFyIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFswXTtcbiAgICB2YXIgb2xkRW5kVm5vZGUgPSBvbGRDaFtvbGRFbmRJZHhdO1xuICAgIHZhciBuZXdFbmRJZHggPSBuZXdDaC5sZW5ndGggLSAxO1xuICAgIHZhciBuZXdTdGFydFZub2RlID0gbmV3Q2hbMF07XG4gICAgdmFyIG5ld0VuZFZub2RlID0gbmV3Q2hbbmV3RW5kSWR4XTtcbiAgICB2YXIgb2xkS2V5VG9JZHgsIGlkeEluT2xkLCBlbG1Ub01vdmUsIGJlZm9yZTtcblxuICAgIHdoaWxlIChvbGRTdGFydElkeCA8PSBvbGRFbmRJZHggJiYgbmV3U3RhcnRJZHggPD0gbmV3RW5kSWR4KSB7XG4gICAgICBpZiAoaXNVbmRlZihvbGRTdGFydFZub2RlKSkge1xuICAgICAgICBvbGRTdGFydFZub2RlID0gb2xkQ2hbKytvbGRTdGFydElkeF07IC8vIFZub2RlIGhhcyBiZWVuIG1vdmVkIGxlZnRcbiAgICAgIH0gZWxzZSBpZiAoaXNVbmRlZihvbGRFbmRWbm9kZSkpIHtcbiAgICAgICAgb2xkRW5kVm5vZGUgPSBvbGRDaFstLW9sZEVuZElkeF07XG4gICAgICB9IGVsc2UgaWYgKHNhbWVWbm9kZShvbGRTdGFydFZub2RlLCBuZXdTdGFydFZub2RlKSkge1xuICAgICAgICBwYXRjaFZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFsrK29sZFN0YXJ0SWR4XTtcbiAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgfSBlbHNlIGlmIChzYW1lVm5vZGUob2xkRW5kVm5vZGUsIG5ld0VuZFZub2RlKSkge1xuICAgICAgICBwYXRjaFZub2RlKG9sZEVuZFZub2RlLCBuZXdFbmRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgb2xkRW5kVm5vZGUgPSBvbGRDaFstLW9sZEVuZElkeF07XG4gICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgfSBlbHNlIGlmIChzYW1lVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3RW5kVm5vZGUpKSB7IC8vIFZub2RlIG1vdmVkIHJpZ2h0XG4gICAgICAgIHBhdGNoVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3RW5kVm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBvbGRTdGFydFZub2RlLmVsbSwgYXBpLm5leHRTaWJsaW5nKG9sZEVuZFZub2RlLmVsbSkpO1xuICAgICAgICBvbGRTdGFydFZub2RlID0gb2xkQ2hbKytvbGRTdGFydElkeF07XG4gICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgfSBlbHNlIGlmIChzYW1lVm5vZGUob2xkRW5kVm5vZGUsIG5ld1N0YXJ0Vm5vZGUpKSB7IC8vIFZub2RlIG1vdmVkIGxlZnRcbiAgICAgICAgcGF0Y2hWbm9kZShvbGRFbmRWbm9kZSwgbmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZEVuZFZub2RlLmVsbSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICBvbGRFbmRWbm9kZSA9IG9sZENoWy0tb2xkRW5kSWR4XTtcbiAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGlzVW5kZWYob2xkS2V5VG9JZHgpKSBvbGRLZXlUb0lkeCA9IGNyZWF0ZUtleVRvT2xkSWR4KG9sZENoLCBvbGRTdGFydElkeCwgb2xkRW5kSWR4KTtcbiAgICAgICAgaWR4SW5PbGQgPSBvbGRLZXlUb0lkeFtuZXdTdGFydFZub2RlLmtleV07XG4gICAgICAgIGlmIChpc1VuZGVmKGlkeEluT2xkKSkgeyAvLyBOZXcgZWxlbWVudFxuICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBjcmVhdGVFbG0obmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbG1Ub01vdmUgPSBvbGRDaFtpZHhJbk9sZF07XG4gICAgICAgICAgcGF0Y2hWbm9kZShlbG1Ub01vdmUsIG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgb2xkQ2hbaWR4SW5PbGRdID0gdW5kZWZpbmVkO1xuICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBlbG1Ub01vdmUuZWxtLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChvbGRTdGFydElkeCA+IG9sZEVuZElkeCkge1xuICAgICAgYmVmb3JlID0gaXNVbmRlZihuZXdDaFtuZXdFbmRJZHgrMV0pID8gbnVsbCA6IG5ld0NoW25ld0VuZElkeCsxXS5lbG07XG4gICAgICBhZGRWbm9kZXMocGFyZW50RWxtLCBiZWZvcmUsIG5ld0NoLCBuZXdTdGFydElkeCwgbmV3RW5kSWR4LCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgIH0gZWxzZSBpZiAobmV3U3RhcnRJZHggPiBuZXdFbmRJZHgpIHtcbiAgICAgIHJlbW92ZVZub2RlcyhwYXJlbnRFbG0sIG9sZENoLCBvbGRTdGFydElkeCwgb2xkRW5kSWR4KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwYXRjaFZub2RlKG9sZFZub2RlLCB2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgdmFyIGksIGhvb2s7XG4gICAgaWYgKGlzRGVmKGkgPSB2bm9kZS5kYXRhKSAmJiBpc0RlZihob29rID0gaS5ob29rKSAmJiBpc0RlZihpID0gaG9vay5wcmVwYXRjaCkpIHtcbiAgICAgIGkob2xkVm5vZGUsIHZub2RlKTtcbiAgICB9XG4gICAgdmFyIGVsbSA9IHZub2RlLmVsbSA9IG9sZFZub2RlLmVsbSwgb2xkQ2ggPSBvbGRWbm9kZS5jaGlsZHJlbiwgY2ggPSB2bm9kZS5jaGlsZHJlbjtcbiAgICBpZiAob2xkVm5vZGUgPT09IHZub2RlKSByZXR1cm47XG4gICAgaWYgKCFzYW1lVm5vZGUob2xkVm5vZGUsIHZub2RlKSkge1xuICAgICAgdmFyIHBhcmVudEVsbSA9IGFwaS5wYXJlbnROb2RlKG9sZFZub2RlLmVsbSk7XG4gICAgICBlbG0gPSBjcmVhdGVFbG0odm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgZWxtLCBvbGRWbm9kZS5lbG0pO1xuICAgICAgcmVtb3ZlVm5vZGVzKHBhcmVudEVsbSwgW29sZFZub2RlXSwgMCwgMCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChpc0RlZih2bm9kZS5kYXRhKSkge1xuICAgICAgZm9yIChpID0gMDsgaSA8IGNicy51cGRhdGUubGVuZ3RoOyArK2kpIGNicy51cGRhdGVbaV0ob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgIGkgPSB2bm9kZS5kYXRhLmhvb2s7XG4gICAgICBpZiAoaXNEZWYoaSkgJiYgaXNEZWYoaSA9IGkudXBkYXRlKSkgaShvbGRWbm9kZSwgdm5vZGUpO1xuICAgIH1cbiAgICBpZiAoaXNVbmRlZih2bm9kZS50ZXh0KSkge1xuICAgICAgaWYgKGlzRGVmKG9sZENoKSAmJiBpc0RlZihjaCkpIHtcbiAgICAgICAgaWYgKG9sZENoICE9PSBjaCkgdXBkYXRlQ2hpbGRyZW4oZWxtLCBvbGRDaCwgY2gsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzRGVmKGNoKSkge1xuICAgICAgICBpZiAoaXNEZWYob2xkVm5vZGUudGV4dCkpIGFwaS5zZXRUZXh0Q29udGVudChlbG0sICcnKTtcbiAgICAgICAgYWRkVm5vZGVzKGVsbSwgbnVsbCwgY2gsIDAsIGNoLmxlbmd0aCAtIDEsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzRGVmKG9sZENoKSkge1xuICAgICAgICByZW1vdmVWbm9kZXMoZWxtLCBvbGRDaCwgMCwgb2xkQ2gubGVuZ3RoIC0gMSk7XG4gICAgICB9IGVsc2UgaWYgKGlzRGVmKG9sZFZub2RlLnRleHQpKSB7XG4gICAgICAgIGFwaS5zZXRUZXh0Q29udGVudChlbG0sICcnKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG9sZFZub2RlLnRleHQgIT09IHZub2RlLnRleHQpIHtcbiAgICAgIGFwaS5zZXRUZXh0Q29udGVudChlbG0sIHZub2RlLnRleHQpO1xuICAgIH1cbiAgICBpZiAoaXNEZWYoaG9vaykgJiYgaXNEZWYoaSA9IGhvb2sucG9zdHBhdGNoKSkge1xuICAgICAgaShvbGRWbm9kZSwgdm5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbihvbGRWbm9kZSwgdm5vZGUpIHtcbiAgICB2YXIgaSwgZWxtLCBwYXJlbnQ7XG4gICAgdmFyIGluc2VydGVkVm5vZGVRdWV1ZSA9IFtdO1xuICAgIGZvciAoaSA9IDA7IGkgPCBjYnMucHJlLmxlbmd0aDsgKytpKSBjYnMucHJlW2ldKCk7XG5cbiAgICBpZiAoaXNVbmRlZihvbGRWbm9kZS5zZWwpKSB7XG4gICAgICBvbGRWbm9kZSA9IGVtcHR5Tm9kZUF0KG9sZFZub2RlKTtcbiAgICB9XG5cbiAgICBpZiAoc2FtZVZub2RlKG9sZFZub2RlLCB2bm9kZSkpIHtcbiAgICAgIHBhdGNoVm5vZGUob2xkVm5vZGUsIHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbG0gPSBvbGRWbm9kZS5lbG07XG4gICAgICBwYXJlbnQgPSBhcGkucGFyZW50Tm9kZShlbG0pO1xuXG4gICAgICBjcmVhdGVFbG0odm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG5cbiAgICAgIGlmIChwYXJlbnQgIT09IG51bGwpIHtcbiAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnQsIHZub2RlLmVsbSwgYXBpLm5leHRTaWJsaW5nKGVsbSkpO1xuICAgICAgICByZW1vdmVWbm9kZXMocGFyZW50LCBbb2xkVm5vZGVdLCAwLCAwKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLmxlbmd0aDsgKytpKSB7XG4gICAgICBpbnNlcnRlZFZub2RlUXVldWVbaV0uZGF0YS5ob29rLmluc2VydChpbnNlcnRlZFZub2RlUXVldWVbaV0pO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLnBvc3QubGVuZ3RoOyArK2kpIGNicy5wb3N0W2ldKCk7XG4gICAgcmV0dXJuIHZub2RlO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtpbml0OiBpbml0fTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2VsLCBkYXRhLCBjaGlsZHJlbiwgdGV4dCwgZWxtKSB7XG4gIHZhciBrZXkgPSBkYXRhID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBkYXRhLmtleTtcbiAgcmV0dXJuIHtzZWw6IHNlbCwgZGF0YTogZGF0YSwgY2hpbGRyZW46IGNoaWxkcmVuLFxuICAgICAgICAgIHRleHQ6IHRleHQsIGVsbTogZWxtLCBrZXk6IGtleX07XG59O1xuIiwiZnVuY3Rpb24gdXBkYXRlUHJvcHMob2xkVm5vZGUsIHZub2RlKSB7XHJcbiAgICB2YXIga2V5LCBjdXIsIG9sZCwgZWxtID0gdm5vZGUuZWxtLFxyXG4gICAgICAgIHByb3BzID0gdm5vZGUuZGF0YS5saXZlUHJvcHMgfHwge307XHJcbiAgICBmb3IgKGtleSBpbiBwcm9wcykge1xyXG4gICAgICAgIGN1ciA9IHByb3BzW2tleV07XHJcbiAgICAgICAgb2xkID0gZWxtW2tleV07XHJcbiAgICAgICAgaWYgKG9sZCAhPT0gY3VyKSBlbG1ba2V5XSA9IGN1cjtcclxuICAgIH1cclxufVxyXG5jb25zdCBsaXZlUHJvcHNQbHVnaW4gPSB7Y3JlYXRlOiB1cGRhdGVQcm9wcywgdXBkYXRlOiB1cGRhdGVQcm9wc307XHJcbmltcG9ydCBzbmFiYmRvbSBmcm9tIFwic25hYmJkb21cIlxyXG5pbXBvcnQgaCBmcm9tIFwic25hYmJkb20vaFwiXHJcbmNvbnN0IHBhdGNoID0gc25hYmJkb20uaW5pdChbXHJcbiAgICByZXF1aXJlKCdzbmFiYmRvbS9tb2R1bGVzL2NsYXNzJyksXHJcbiAgICByZXF1aXJlKCdzbmFiYmRvbS9tb2R1bGVzL3Byb3BzJyksXHJcbiAgICByZXF1aXJlKCdzbmFiYmRvbS9tb2R1bGVzL3N0eWxlJyksXHJcbiAgICByZXF1aXJlKCdzbmFiYmRvbS9tb2R1bGVzL2V2ZW50bGlzdGVuZXJzJyksXHJcbiAgICByZXF1aXJlKCdzbmFiYmRvbS9tb2R1bGVzL2F0dHJpYnV0ZXMnKSxcclxuICAgIGxpdmVQcm9wc1BsdWdpblxyXG5dKTtcclxuXHJcbmZ1bmN0aW9uIHV1aWQoKXtyZXR1cm4oXCJcIisxZTcrLTFlMystNGUzKy04ZTMrLTFlMTEpLnJlcGxhY2UoLzF8MC9nLGZ1bmN0aW9uKCl7cmV0dXJuKDB8TWF0aC5yYW5kb20oKSoxNikudG9TdHJpbmcoMTYpfSl9XHJcbmltcG9ydCBiaWcgZnJvbSAnYmlnLmpzJ1xyXG5iaWcuRV9QT1MgPSAxZSs2XHJcblxyXG5pbXBvcnQgdWduaXMgZnJvbSAnLi91Z25pcydcclxuXHJcbmltcG9ydCBzYXZlZEFwcCBmcm9tICcuLi91Z25pc19jb21wb25lbnRzL2FwcC5qc29uJ1xyXG5cclxuZWRpdG9yKHNhdmVkQXBwKVxyXG5cclxuZnVuY3Rpb24gZWRpdG9yKGFwcERlZmluaXRpb24pe1xyXG5cclxuICAgIGNvbnN0IHNhdmVkRGVmaW5pdGlvbiA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3NhdmVkX2FwcCcpKVxyXG4gICAgY29uc3QgYXBwID0gdWduaXMoc2F2ZWREZWZpbml0aW9uIHx8IGFwcERlZmluaXRpb24pXHJcblxyXG4gICAgbGV0IG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChub2RlKVxyXG5cclxuICAgIC8vIFN0YXRlXHJcbiAgICBsZXQgc3RhdGUgPSB7XHJcbiAgICAgICAgbGVmdE9wZW46IHRydWUsXHJcbiAgICAgICAgcmlnaHRPcGVuOiB0cnVlLFxyXG4gICAgICAgIGVkaXRvclJpZ2h0V2lkdGg6IDM1MCxcclxuICAgICAgICBlZGl0b3JMZWZ0V2lkdGg6IDM1MCxcclxuICAgICAgICBzdWJFZGl0b3JXaWR0aDogMzUwLFxyXG4gICAgICAgIGFwcElzRnJvemVuOiBmYWxzZSxcclxuICAgICAgICBzaG93aW5nVmlld05vZGVzOiBmYWxzZSxcclxuICAgICAgICBzZWxlY3RlZFZpZXdOb2RlOiB7fSxcclxuICAgICAgICBzZWxlY3RlZEV2ZW50SWQ6ICcnLFxyXG4gICAgICAgIHNlbGVjdGVkUGlwZUlkOiAnJyxcclxuICAgICAgICBzZWxlY3RlZFN0YXRlTm9kZUlkOiAnJyxcclxuICAgICAgICBzZWxlY3RlZFZpZXdTdWJNZW51OiAncHJvcHMnLFxyXG4gICAgICAgIGVkaXRpbmdUaXRsZU5vZGVJZDogJycsXHJcbiAgICAgICAgYWN0aXZlRXZlbnQ6ICcnLFxyXG4gICAgICAgIHZpZXdGb2xkZXJzQ2xvc2VkOiB7fSxcclxuICAgICAgICBkcmFnTW91c2VMb2NhdGlvbjogbnVsbCxcclxuICAgICAgICBjdXJyZW50bHlEcmFnZ2luZzogJycsXHJcbiAgICAgICAgZGVmaW5pdGlvbjogc2F2ZWREZWZpbml0aW9uIHx8IGFwcC5kZWZpbml0aW9uLFxyXG4gICAgfVxyXG4gICAgLy8gdW5kby9yZWRvXHJcbiAgICBsZXQgc3RhdGVTdGFjayA9IFtzdGF0ZV1cclxuICAgIGZ1bmN0aW9uIHNldFN0YXRlKG5ld1N0YXRlLCBwdXNoVG9TdGFjayl7XHJcbiAgICAgICAgaWYobmV3U3RhdGUgPT09IHN0YXRlKXtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdzdGF0ZSB3YXMgbXV0YXRlZCwgc2VhcmNoIGZvciBhIGJ1ZycpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHNvbWUgYWN0aW9ucyBzaG91bGQgbm90IGJlIHJlY29yZGVkIGFuZCBjb250cm9sbGVkIHRocm91Z2ggdW5kby9yZWRvXHJcbiAgICAgICAgaWYocHVzaFRvU3RhY2spe1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50SW5kZXggPSBzdGF0ZVN0YWNrLmZpbmRJbmRleCgoYSk9PmE9PT1zdGF0ZSlcclxuICAgICAgICAgICAgc3RhdGVTdGFjayA9IHN0YXRlU3RhY2suc2xpY2UoMCwgY3VycmVudEluZGV4KzEpLmNvbmNhdChuZXdTdGF0ZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gb3ZlcndyaXRlIGN1cnJlbnRcclxuICAgICAgICAgICAgc3RhdGVTdGFja1tzdGF0ZVN0YWNrLmZpbmRJbmRleCgoYSk9PmE9PT1zdGF0ZSldID0gbmV3U3RhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHN0YXRlLmFwcElzRnJvemVuICE9PSBuZXdTdGF0ZS5hcHBJc0Zyb3plbiB8fCBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlICE9PSBuZXdTdGF0ZS5zZWxlY3RlZFZpZXdOb2RlICl7XHJcbiAgICAgICAgICAgIGFwcC5fZnJlZXplKG5ld1N0YXRlLmFwcElzRnJvemVuLCBWSUVXX05PREVfU0VMRUNURUQsIG5ld1N0YXRlLnNlbGVjdGVkVmlld05vZGUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHN0YXRlLmRlZmluaXRpb24gIT09IG5ld1N0YXRlLmRlZmluaXRpb24pe1xyXG4gICAgICAgICAgICAvLyBUT0RPIGFkZCBnYXJiYWdlIGNvbGxlY3Rpb24/XHJcbiAgICAgICAgICAgIGFwcC5yZW5kZXIobmV3U3RhdGUuZGVmaW5pdGlvbilcclxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3NhdmVkX2FwcCcsIEpTT04uc3RyaW5naWZ5KG5ld1N0YXRlLmRlZmluaXRpb24pKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgc3RhdGUgPSBuZXdTdGF0ZVxyXG4gICAgICAgIHJlbmRlcigpXHJcbiAgICB9XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKT0+IHtcclxuICAgICAgICAvLyBjbGlja2VkIG91dHNpZGVcclxuICAgICAgICBpZihzdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQgJiYgIWUudGFyZ2V0LmRhdGFzZXQuaXN0aXRsZWVkaXRvcil7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZWRpdGluZ1RpdGxlTm9kZUlkOiAnJ30pXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSk9PntcclxuICAgICAgICAvLyA4MyAtIHNcclxuICAgICAgICAvLyA5MCAtIHpcclxuICAgICAgICAvLyA4OSAtIHlcclxuICAgICAgICAvLyAzMiAtIHNwYWNlXHJcbiAgICAgICAgLy8gMTMgLSBlbnRlclxyXG4gICAgICAgIGlmKGUud2hpY2ggPT0gODMgJiYgKG5hdmlnYXRvci5wbGF0Zm9ybS5tYXRjaChcIk1hY1wiKSA/IGUubWV0YUtleSA6IGUuY3RybEtleSkpIHtcclxuICAgICAgICAgICAgLy8gVE9ETyBnYXJiYWdlIGNvbGxlY3RcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBmZXRjaCgnL3NhdmUnLCB7bWV0aG9kOiAnUE9TVCcsIGJvZHk6IEpTT04uc3RyaW5naWZ5KHN0YXRlLmRlZmluaXRpb24pLCBoZWFkZXJzOiB7XCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCJ9fSlcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZihlLndoaWNoID09IDMyICYmIChuYXZpZ2F0b3IucGxhdGZvcm0ubWF0Y2goXCJNYWNcIikgPyBlLm1ldGFLZXkgOiBlLmN0cmxLZXkpKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICBGUkVFWkVSX0NMSUNLRUQoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZighZS5zaGlmdEtleSAmJiBlLndoaWNoID09IDkwICYmIChuYXZpZ2F0b3IucGxhdGZvcm0ubWF0Y2goXCJNYWNcIikgPyBlLm1ldGFLZXkgOiBlLmN0cmxLZXkpKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudEluZGV4ID0gc3RhdGVTdGFjay5maW5kSW5kZXgoKGEpPT5hPT09c3RhdGUpXHJcbiAgICAgICAgICAgIGlmKGN1cnJlbnRJbmRleCA+IDApe1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3U3RhdGUgPSBzdGF0ZVN0YWNrW2N1cnJlbnRJbmRleC0xXVxyXG4gICAgICAgICAgICAgICAgaWYoc3RhdGUuZGVmaW5pdGlvbiAhPT0gbmV3U3RhdGUuZGVmaW5pdGlvbil7XHJcbiAgICAgICAgICAgICAgICAgICAgYXBwLnJlbmRlcihuZXdTdGF0ZS5kZWZpbml0aW9uKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc3RhdGUgPSBuZXdTdGF0ZVxyXG4gICAgICAgICAgICAgICAgcmVuZGVyKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZigoZS53aGljaCA9PSA4OSAmJiAobmF2aWdhdG9yLnBsYXRmb3JtLm1hdGNoKFwiTWFjXCIpID8gZS5tZXRhS2V5IDogZS5jdHJsS2V5KSkgfHwgKGUuc2hpZnRLZXkgJiYgZS53aGljaCA9PSA5MCAmJiAobmF2aWdhdG9yLnBsYXRmb3JtLm1hdGNoKFwiTWFjXCIpID8gZS5tZXRhS2V5IDogZS5jdHJsS2V5KSkpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50SW5kZXggPSBzdGF0ZVN0YWNrLmZpbmRJbmRleCgoYSk9PmE9PT1zdGF0ZSlcclxuICAgICAgICAgICAgaWYoY3VycmVudEluZGV4IDwgc3RhdGVTdGFjay5sZW5ndGgtMSl7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdTdGF0ZSA9IHN0YXRlU3RhY2tbY3VycmVudEluZGV4KzFdXHJcbiAgICAgICAgICAgICAgICBpZihzdGF0ZS5kZWZpbml0aW9uICE9PSBuZXdTdGF0ZS5kZWZpbml0aW9uKXtcclxuICAgICAgICAgICAgICAgICAgICBhcHAucmVuZGVyKG5ld1N0YXRlLmRlZmluaXRpb24pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IG5ld1N0YXRlXHJcbiAgICAgICAgICAgICAgICByZW5kZXIoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKGUud2hpY2ggPT0gMTMpIHtcclxuICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBlZGl0aW5nVGl0bGVOb2RlSWQ6ICcnfSlcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG5cclxuICAgIC8vIEFjdGlvbnNcclxuICAgIGZ1bmN0aW9uIFdJRFRIX0RSQUdHRUQod2lkdGhOYW1lLCBlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgZnVuY3Rpb24gcmVzaXplKGUpe1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgbGV0IG5ld1dpZHRoID0gd2luZG93LmlubmVyV2lkdGggLSAoZS50b3VjaGVzPyBlLnRvdWNoZXNbMF0ucGFnZVg6IGUucGFnZVgpXHJcbiAgICAgICAgICAgIGlmKHdpZHRoTmFtZSA9PT0gJ2VkaXRvckxlZnRXaWR0aCcpe1xyXG4gICAgICAgICAgICAgICAgbmV3V2lkdGggPSBlLnRvdWNoZXM/IGUudG91Y2hlc1swXS5wYWdlWDogZS5wYWdlWFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHdpZHRoTmFtZSA9PT0gJ3N1YkVkaXRvcldpZHRoJyl7XHJcbiAgICAgICAgICAgICAgICBuZXdXaWR0aCA9IG5ld1dpZHRoIC0gc3RhdGUuZWRpdG9yUmlnaHRXaWR0aCAtIDEwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gSSBwcm9iYWJseSB3YXMgZHJ1bmtcclxuICAgICAgICAgICAgaWYod2lkdGhOYW1lICE9PSAnc3ViRWRpdG9yV2lkdGgnICYmICggKHdpZHRoTmFtZSA9PT0gJ2VkaXRvckxlZnRXaWR0aCcgPyBzdGF0ZS5sZWZ0T3Blbjogc3RhdGUucmlnaHRPcGVuKSA/IG5ld1dpZHRoIDwgMTgwOiBuZXdXaWR0aCA+IDE4MCkpe1xyXG4gICAgICAgICAgICAgICAgaWYod2lkdGhOYW1lID09PSAnZWRpdG9yTGVmdFdpZHRoJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldFN0YXRlKHsuLi5zdGF0ZSwgbGVmdE9wZW46ICFzdGF0ZS5sZWZ0T3Blbn0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2V0U3RhdGUoey4uLnN0YXRlLCByaWdodE9wZW46ICFzdGF0ZS5yaWdodE9wZW59KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKG5ld1dpZHRoIDwgMjUwKXtcclxuICAgICAgICAgICAgICAgIG5ld1dpZHRoID0gMjUwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBbd2lkdGhOYW1lXTogbmV3V2lkdGh9KVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHJlc2l6ZSlcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgcmVzaXplKVxyXG4gICAgICAgIGZ1bmN0aW9uIHN0b3BEcmFnZ2luZyhlKXtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCByZXNpemUpXHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCByZXNpemUpXHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgc3RvcERyYWdnaW5nKVxyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBzdG9wRHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHN0b3BEcmFnZ2luZylcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBzdG9wRHJhZ2dpbmcpXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBGUkVFWkVSX0NMSUNLRUQoKSB7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBhcHBJc0Zyb3plbjogIXN0YXRlLmFwcElzRnJvemVufSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFZJRVdfRk9MREVSX0NMSUNLRUQobm9kZUlkKSB7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCB2aWV3Rm9sZGVyc0Nsb3NlZDp7Li4uc3RhdGUudmlld0ZvbGRlcnNDbG9zZWQsIFtub2RlSWRdOiAhc3RhdGUudmlld0ZvbGRlcnNDbG9zZWRbbm9kZUlkXX19KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gVklFV19OT0RFX1NFTEVDVEVEKHJlZikge1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgc2VsZWN0ZWRWaWV3Tm9kZTpyZWZ9KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gVU5TRUxFQ1RfVklFV19OT0RFKGUpIHtcclxuICAgICAgICBpZihlLnRhcmdldCA9PT0gdGhpcy5lbG0pe1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIHNlbGVjdGVkVmlld05vZGU6e319KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFNUQVRFX05PREVfU0VMRUNURUQobm9kZUlkKSB7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBzZWxlY3RlZFN0YXRlTm9kZUlkOm5vZGVJZH0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBVTlNFTEVDVF9TVEFURV9OT0RFKGUpIHtcclxuICAgICAgICBpZihlLnRhcmdldCA9PT0gdGhpcy5lbG0pe1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIHNlbGVjdGVkU3RhdGVOb2RlSWQ6JycsIHNlbGVjdGVkRXZlbnRJZDonJ30pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gREVMRVRFX1NFTEVDVEVEX1ZJRVcobm9kZVJlZiwgcGFyZW50UmVmLCBlKSB7XHJcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIGlmKG5vZGVSZWYuaWQgPT09ICdfcm9vdE5vZGUnKXtcclxuICAgICAgICAgICAgLy8gaW1tdXRhYmx5IHJlbW92ZSBhbGwgbm9kZXMgZXhjZXB0IHJvb3ROb2RlXHJcbiAgICAgICAgICAgIHJldHVybiBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICB2Tm9kZUJveDogeydfcm9vdE5vZGUnOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi52Tm9kZUJveFsnX3Jvb3ROb2RlJ10sIGNoaWxkcmVuOiBbXX19LFxyXG4gICAgICAgICAgICB9LCBzZWxlY3RlZFZpZXdOb2RlOiB7fX0sIHRydWUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICBbcGFyZW50UmVmLnJlZl06IHsuLi5zdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdLCBbcGFyZW50UmVmLmlkXTogey4uLnN0YXRlLmRlZmluaXRpb25bcGFyZW50UmVmLnJlZl1bcGFyZW50UmVmLmlkXSwgY2hpbGRyZW46c3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXVtwYXJlbnRSZWYuaWRdLmNoaWxkcmVuLmZpbHRlcigocmVmKT0+cmVmLmlkICE9PSBub2RlUmVmLmlkKX19LFxyXG4gICAgICAgIH0sIHNlbGVjdGVkVmlld05vZGU6IHt9fSwgdHJ1ZSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIE5PREVfRFJBR0dFRCh0eXBlLCBlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgZnVuY3Rpb24gc2hvd0NvbXBvbmVudChlKXtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIGNvbnN0IHggPSBlLnRvdWNoZXM/IGUudG91Y2hlc1swXS5wYWdlWDogZS5wYWdlWFxyXG4gICAgICAgICAgICBjb25zdCB5ID0gZS50b3VjaGVzPyBlLnRvdWNoZXNbMF0ucGFnZVk6IGUucGFnZVlcclxuXHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZHJhZ01vdXNlTG9jYXRpb246IHt4LCB5fX0pXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgc2hvd0NvbXBvbmVudClcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgc2hvd0NvbXBvbmVudClcclxuICAgICAgICBmdW5jdGlvbiBzdG9wRHJhZ2dpbmcoZSl7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgc2hvd0NvbXBvbmVudClcclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHNob3dDb21wb25lbnQpXHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgc3RvcERyYWdnaW5nKVxyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBzdG9wRHJhZ2dpbmcpXHJcblxyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRyYWdNb3VzZUxvY2F0aW9uOiBudWxsLCBjdXJyZW50bHlEcmFnZ2luZzogJyd9KVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBzdG9wRHJhZ2dpbmcpXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgc3RvcERyYWdnaW5nKVxyXG4gICAgICAgIGNvbnN0IHggPSBlLnRvdWNoZXM/IGUudG91Y2hlc1swXS5wYWdlWDogZS5wYWdlWFxyXG4gICAgICAgIGNvbnN0IHkgPSBlLnRvdWNoZXM/IGUudG91Y2hlc1swXS5wYWdlWTogZS5wYWdlWVxyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZHJhZ01vdXNlTG9jYXRpb246IHt4LCB5fSwgY3VycmVudGx5RHJhZ2dpbmc6IHR5cGUsIHNob3dpbmdWaWV3Tm9kZXM6IGZhbHNlfSlcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIERSQUdHRURfT1ZFUl9NRShub2RlUmVmKSB7XHJcbiAgICAgICAgQUREX05PREUobm9kZVJlZiwgc3RhdGUuY3VycmVudGx5RHJhZ2dpbmcpXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBBRERfTk9ERShub2RlUmVmLCB0eXBlKSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZUlkID0gbm9kZVJlZi5pZFxyXG4gICAgICAgIGNvbnN0IG5ld05vZGVJZCA9IHV1aWQoKVxyXG4gICAgICAgIGNvbnN0IG5ld1N0eWxlSWQgPSB1dWlkKClcclxuICAgICAgICBjb25zdCBuZXdTdHlsZSA9IHtcclxuICAgICAgICAgICAgcGFkZGluZzogJzEwcHgnLFxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0eXBlID09PSAnYm94Jykge1xyXG4gICAgICAgICAgICBjb25zdCBuZXdOb2RlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdib3gnLFxyXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtyZWY6J3N0eWxlJywgaWQ6bmV3U3R5bGVJZH0sXHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjogW10sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNldFN0YXRlKHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRWaWV3Tm9kZToge3JlZjondk5vZGVCb3gnLCBpZDogbmV3Tm9kZUlkfSxcclxuICAgICAgICAgICAgICAgIGRlZmluaXRpb246IG5vZGVSZWYucmVmID09PSAndk5vZGVCb3gnID8ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2Tm9kZUJveDogey4uLnN0YXRlLmRlZmluaXRpb24udk5vZGVCb3gsIFtub2RlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi52Tm9kZUJveFtub2RlSWRdLCBjaGlsZHJlbjogc3RhdGUuZGVmaW5pdGlvbi52Tm9kZUJveFtub2RlSWRdLmNoaWxkcmVuLmNvbmNhdCh7cmVmOid2Tm9kZUJveCcsIGlkOm5ld05vZGVJZH0pfSwgW25ld05vZGVJZF06IG5ld05vZGV9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogey4uLnN0YXRlLmRlZmluaXRpb24uc3R5bGUsIFtuZXdTdHlsZUlkXTogbmV3U3R5bGV9LFxyXG4gICAgICAgICAgICAgICAgICAgIH0gOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtub2RlUmVmLnJlZl06IHsuLi5zdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXSwgW25vZGVJZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlSWRdLCBjaGlsZHJlbjogc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZUlkXS5jaGlsZHJlbi5jb25jYXQoe3JlZjondk5vZGVCb3gnLCBpZDpuZXdOb2RlSWR9KX19LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2Tm9kZUJveDogey4uLnN0YXRlLmRlZmluaXRpb24udk5vZGVCb3gsIFtuZXdOb2RlSWRdOiBuZXdOb2RlfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnN0eWxlLCBbbmV3U3R5bGVJZF06IG5ld1N0eWxlfSxcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHRydWUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHR5cGUgPT09ICd0ZXh0Jyl7XHJcbiAgICAgICAgICAgIGNvbnN0IHBpcGVJZCA9IHV1aWQoKVxyXG4gICAgICAgICAgICBjb25zdCBuZXdOb2RlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgIHN0eWxlOiB7cmVmOidzdHlsZScsIGlkOm5ld1N0eWxlSWR9LFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6J3BpcGUnLCBpZDpwaXBlSWR9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbmV3UGlwZSA9IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiAnRGVmYXVsdCBUZXh0JyxcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogW11cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc2V0U3RhdGUoe1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFZpZXdOb2RlOiB7cmVmOid2Tm9kZVRleHQnLCBpZDogbmV3Tm9kZUlkfSxcclxuICAgICAgICAgICAgICAgIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsIFtwaXBlSWRdOiBuZXdQaXBlfSxcclxuICAgICAgICAgICAgICAgICAgICBbbm9kZVJlZi5yZWZdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl0sIFtub2RlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZUlkXSwgY2hpbGRyZW46IHN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVJZF0uY2hpbGRyZW4uY29uY2F0KHtyZWY6J3ZOb2RlVGV4dCcsIGlkOm5ld05vZGVJZH0pfX0sXHJcbiAgICAgICAgICAgICAgICAgICAgdk5vZGVUZXh0OiB7Li4uc3RhdGUuZGVmaW5pdGlvbi52Tm9kZVRleHQsIFtuZXdOb2RlSWRdOiBuZXdOb2RlfSxcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogey4uLnN0YXRlLmRlZmluaXRpb24uc3R5bGUsIFtuZXdTdHlsZUlkXTogbmV3U3R5bGV9LFxyXG4gICAgICAgICAgICAgICAgfX0sIHRydWUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHR5cGUgPT09ICdpbnB1dCcpIHtcclxuICAgICAgICAgICAgY29uc3Qgc3RhdGVJZCA9IHV1aWQoKVxyXG4gICAgICAgICAgICBjb25zdCBldmVudElkID0gdXVpZCgpXHJcbiAgICAgICAgICAgIGNvbnN0IG11dGF0b3JJZCA9IHV1aWQoKVxyXG4gICAgICAgICAgICBjb25zdCBwaXBlSW5wdXRJZCA9IHV1aWQoKVxyXG4gICAgICAgICAgICBjb25zdCBwaXBlTXV0YXRvcklkID0gdXVpZCgpXHJcbiAgICAgICAgICAgIGNvbnN0IG5ld05vZGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ2lucHV0JyxcclxuICAgICAgICAgICAgICAgIHN0eWxlOiB7cmVmOidzdHlsZScsIGlkOm5ld1N0eWxlSWR9LFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6J3BpcGUnLCBpZDpwaXBlSW5wdXRJZH0sXHJcbiAgICAgICAgICAgICAgICBpbnB1dDoge3JlZjonZXZlbnQnLCBpZDpldmVudElkfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1BpcGVJbnB1dCA9IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB7cmVmOiAnc3RhdGUnLCBpZDogc3RhdGVJZH0sXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFtdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbmV3UGlwZU11dGF0b3IgPSB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZToge3JlZjogJ2V2ZW50RGF0YScsIGlkOiAnX2lucHV0J30sXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFtdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbmV3U3RhdGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ2lucHV0IHZhbHVlJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgIHJlZjogc3RhdGVJZCxcclxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogJ0RlZmF1bHQgdGV4dCcsXHJcbiAgICAgICAgICAgICAgICBtdXRhdG9yczogW3sgcmVmOidtdXRhdG9yJywgaWQ6bXV0YXRvcklkfV0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbmV3TXV0YXRvciA9IHtcclxuICAgICAgICAgICAgICAgIGV2ZW50OiB7IHJlZjogJ2V2ZW50JywgaWQ6ZXZlbnRJZH0sXHJcbiAgICAgICAgICAgICAgICBzdGF0ZTogeyByZWY6ICdzdGF0ZScsIGlkOnN0YXRlSWR9LFxyXG4gICAgICAgICAgICAgICAgbXV0YXRpb246IHsgcmVmOiAncGlwZScsIGlkOiBwaXBlTXV0YXRvcklkfSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBuZXdFdmVudCA9IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAndXBkYXRlIGlucHV0JyxcclxuICAgICAgICAgICAgICAgIG11dGF0b3JzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgeyByZWY6ICdtdXRhdG9yJywgaWQ6IG11dGF0b3JJZH0sXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogW1xyXG4gICAgICAgICAgICAgICAgICAgIHtyZWY6ICdldmVudERhdGEnLCBpZDogJ19pbnB1dCd9XHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzZXRTdGF0ZSh7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZSxcclxuICAgICAgICAgICAgICAgIHNlbGVjdGVkVmlld05vZGU6IHtyZWY6J3ZOb2RlSW5wdXQnLCBpZDogbmV3Tm9kZUlkfSxcclxuICAgICAgICAgICAgICAgIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsIFtwaXBlSW5wdXRJZF06IG5ld1BpcGVJbnB1dCwgW3BpcGVNdXRhdG9ySWRdOiBuZXdQaXBlTXV0YXRvcn0sXHJcbiAgICAgICAgICAgICAgICAgICAgW25vZGVSZWYucmVmXTogey4uLnN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdLCBbbm9kZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVJZF0sIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlSWRdLmNoaWxkcmVuLmNvbmNhdCh7cmVmOid2Tm9kZUlucHV0JywgaWQ6bmV3Tm9kZUlkfSl9fSxcclxuICAgICAgICAgICAgICAgICAgICB2Tm9kZUlucHV0OiB7Li4uc3RhdGUuZGVmaW5pdGlvbi52Tm9kZUlucHV0LCBbbmV3Tm9kZUlkXTogbmV3Tm9kZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnN0eWxlLCBbbmV3U3R5bGVJZF06IG5ld1N0eWxlfSxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lU3BhY2U6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZSwgWydfcm9vdE5hbWVTcGFjZSddOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5uYW1lU3BhY2VbJ19yb290TmFtZVNwYWNlJ10sIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZVsnX3Jvb3ROYW1lU3BhY2UnXS5jaGlsZHJlbi5jb25jYXQoe3JlZjonc3RhdGUnLCBpZDpzdGF0ZUlkfSl9fSxcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZTogey4uLnN0YXRlLmRlZmluaXRpb24uc3RhdGUsIFtzdGF0ZUlkXTogbmV3U3RhdGV9LFxyXG4gICAgICAgICAgICAgICAgICAgIG11dGF0b3I6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLm11dGF0b3IsIFttdXRhdG9ySWRdOiBuZXdNdXRhdG9yfSxcclxuICAgICAgICAgICAgICAgICAgICBldmVudDogey4uLnN0YXRlLmRlZmluaXRpb24uZXZlbnQsIFtldmVudElkXTogbmV3RXZlbnR9LFxyXG4gICAgICAgICAgICAgICAgfX0sIHRydWUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQUREX1NUQVRFKG5hbWVzcGFjZUlkLCB0eXBlKSB7XHJcbiAgICAgICAgY29uc3QgbmV3U3RhdGVJZCA9IHV1aWQoKVxyXG4gICAgICAgIGxldCBuZXdTdGF0ZVxyXG4gICAgICAgIGlmKHR5cGUgPT09ICd0ZXh0Jykge1xyXG4gICAgICAgICAgICBuZXdTdGF0ZSA9IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnbmV3IHRleHQnLFxyXG4gICAgICAgICAgICAgICAgcmVmOiBuZXdTdGF0ZUlkLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiAnRGVmYXVsdCB0ZXh0JyxcclxuICAgICAgICAgICAgICAgIG11dGF0b3JzOiBbXSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0eXBlID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICBuZXdTdGF0ZSA9IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnbmV3IG51bWJlcicsXHJcbiAgICAgICAgICAgICAgICByZWY6IG5ld1N0YXRlSWQsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogMCxcclxuICAgICAgICAgICAgICAgIG11dGF0b3JzOiBbXSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0eXBlID09PSAnYm9vbGVhbicpIHtcclxuICAgICAgICAgICAgbmV3U3RhdGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ25ldyBib29sZWFuJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICAgICAgICAgIHJlZjogbmV3U3RhdGVJZCxcclxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIG11dGF0b3JzOiBbXSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0eXBlID09PSAndGFibGUnKSB7XHJcbiAgICAgICAgICAgIG5ld1N0YXRlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICduZXcgdGFibGUnLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ3RhYmxlJyxcclxuICAgICAgICAgICAgICAgIHJlZjogbmV3U3RhdGVJZCxcclxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZToge30sXHJcbiAgICAgICAgICAgICAgICBtdXRhdG9yczogW10sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHlwZSA9PT0gJ25hbWVzcGFjZScpIHtcclxuICAgICAgICAgICAgbmV3U3RhdGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ25ldyBuYW1lc3BhY2UnLFxyXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICBuYW1lU3BhY2U6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZSwgW25hbWVzcGFjZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlW25hbWVzcGFjZUlkXSwgY2hpbGRyZW46IHN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlW25hbWVzcGFjZUlkXS5jaGlsZHJlbi5jb25jYXQoe3JlZjonbmFtZVNwYWNlJywgaWQ6bmV3U3RhdGVJZH0pfSwgW25ld1N0YXRlSWRdOiBuZXdTdGF0ZX0sXHJcbiAgICAgICAgICAgIH19LCB0cnVlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgbmFtZVNwYWNlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5uYW1lU3BhY2UsIFtuYW1lc3BhY2VJZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZVtuYW1lc3BhY2VJZF0sIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZVtuYW1lc3BhY2VJZF0uY2hpbGRyZW4uY29uY2F0KHtyZWY6J3N0YXRlJywgaWQ6bmV3U3RhdGVJZH0pfX0sXHJcbiAgICAgICAgICAgIHN0YXRlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5zdGF0ZSwgW25ld1N0YXRlSWRdOiBuZXdTdGF0ZX0sXHJcbiAgICAgICAgfX0sIHRydWUpXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBDSEFOR0VfU1RZTEUoc3R5bGVJZCwga2V5LCBlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgLy8gYW5kIG5vdyBJIHJlYWxseSByZWdyZXQgbm90IHVzaW5nIGltbXV0YWJsZSBvciByYW1kYSBsZW5zZXNcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHsuLi5zdGF0ZS5kZWZpbml0aW9uLCBzdHlsZTogey4uLnN0YXRlLmRlZmluaXRpb24uc3R5bGUsIFtzdHlsZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb24uc3R5bGVbc3R5bGVJZF0sIFtrZXldOiBlLnRhcmdldC52YWx1ZX19fX0sIHRydWUpXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBBRERfREVGQVVMVF9TVFlMRShzdHlsZUlkLCBrZXkpIHtcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHsuLi5zdGF0ZS5kZWZpbml0aW9uLCBzdHlsZTogey4uLnN0YXRlLmRlZmluaXRpb24uc3R5bGUsIFtzdHlsZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb24uc3R5bGVbc3R5bGVJZF0sIFtrZXldOiAnZGVmYXVsdCd9fX19LCB0cnVlKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gU0VMRUNUX1ZJRVdfU1VCTUVOVShuZXdJZCkge1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgc2VsZWN0ZWRWaWV3U3ViTWVudTpuZXdJZH0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBFRElUX1ZJRVdfTk9ERV9USVRMRShub2RlSWQpIHtcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGVkaXRpbmdUaXRsZU5vZGVJZDpub2RlSWR9KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gRURJVF9FVkVOVF9USVRMRShub2RlSWQpIHtcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGVkaXRpbmdUaXRsZU5vZGVJZDpub2RlSWR9KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQ0hBTkdFX0VWRU5UX1RJVExFKG5vZGVJZCwgZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgZXZlbnQ6IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24uZXZlbnQsXHJcbiAgICAgICAgICAgICAgICBbbm9kZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24uZXZlbnRbbm9kZUlkXSxcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogZS50YXJnZXQudmFsdWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9fSwgdHJ1ZSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIENIQU5HRV9WSUVXX05PREVfVElUTEUobm9kZVJlZiwgZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBjb25zdCBub2RlSWQgPSBub2RlUmVmLmlkXHJcbiAgICAgICAgY29uc3Qgbm9kZVR5cGUgPSBub2RlUmVmLnJlZlxyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICBbbm9kZVR5cGVdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlVHlwZV0sIFtub2RlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlVHlwZV1bbm9kZUlkXSwgdGl0bGU6IGUudGFyZ2V0LnZhbHVlfX0sXHJcbiAgICAgICAgfX0sIHRydWUpXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBDSEFOR0VfU1RBVEVfTk9ERV9USVRMRShub2RlSWQsIGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIHN0YXRlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5zdGF0ZSwgW25vZGVJZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnN0YXRlW25vZGVJZF0sIHRpdGxlOiBlLnRhcmdldC52YWx1ZX19LFxyXG4gICAgICAgIH19LCB0cnVlKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQ0hBTkdFX05BTUVTUEFDRV9USVRMRShub2RlSWQsIGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIG5hbWVTcGFjZTogey4uLnN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlLCBbbm9kZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlW25vZGVJZF0sIHRpdGxlOiBlLnRhcmdldC52YWx1ZX19LFxyXG4gICAgICAgIH19LCB0cnVlKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQ0hBTkdFX0NVUlJFTlRfU1RBVEVfVEVYVF9WQUxVRShzdGF0ZUlkLCBlKSB7XHJcbiAgICAgICAgYXBwLnNldEN1cnJlbnRTdGF0ZSh7Li4uYXBwLmdldEN1cnJlbnRTdGF0ZSgpLCBbc3RhdGVJZF06IGUudGFyZ2V0LnZhbHVlfSlcclxuICAgICAgICByZW5kZXIoKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQ0hBTkdFX0NVUlJFTlRfU1RBVEVfTlVNQkVSX1ZBTFVFKHN0YXRlSWQsIGUpIHtcclxuICAgICAgICAvLyB0b2RvIGJpZyB0aHJvd3MgZXJyb3IgaW5zdGVhZCBvZiByZXR1cm5pbmcgTmFOLi4uIGZpeCwgcmV3cml0ZSBvciBoYWNrXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYoYmlnKGUudGFyZ2V0LnZhbHVlKS50b1N0cmluZygpICE9PSBhcHAuZ2V0Q3VycmVudFN0YXRlKClbc3RhdGVJZF0udG9TdHJpbmcoKSl7XHJcbiAgICAgICAgICAgICAgICBhcHAuc2V0Q3VycmVudFN0YXRlKHsuLi5hcHAuZ2V0Q3VycmVudFN0YXRlKCksIFtzdGF0ZUlkXTogYmlnKGUudGFyZ2V0LnZhbHVlKX0pXHJcbiAgICAgICAgICAgICAgICByZW5kZXIoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaChlcnIpIHtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBJTkNSRU1FTlRfQ1VSUkVOVF9TVEFURV9OVU1CRVJfVkFMVUUoc3RhdGVJZCkge1xyXG4gICAgICAgIGFwcC5zZXRDdXJyZW50U3RhdGUoey4uLmFwcC5nZXRDdXJyZW50U3RhdGUoKSwgW3N0YXRlSWRdOiBiaWcoYXBwLmdldEN1cnJlbnRTdGF0ZSgpW3N0YXRlSWRdKS5hZGQoMSl9KVxyXG4gICAgICAgIHJlbmRlcigpXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBERUNSRU1FTlRfQ1VSUkVOVF9TVEFURV9OVU1CRVJfVkFMVUUoc3RhdGVJZCkge1xyXG4gICAgICAgIGFwcC5zZXRDdXJyZW50U3RhdGUoey4uLmFwcC5nZXRDdXJyZW50U3RhdGUoKSwgW3N0YXRlSWRdOiBiaWcoYXBwLmdldEN1cnJlbnRTdGF0ZSgpW3N0YXRlSWRdKS5hZGQoLTEpfSlcclxuICAgICAgICByZW5kZXIoKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gU0VMRUNUX0VWRU5UKGV2ZW50SWQpIHtcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIHNlbGVjdGVkRXZlbnRJZDpldmVudElkfSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIENIQU5HRV9TVEFUSUNfVkFMVUUocmVmLCBwcm9wZXJ0eU5hbWUsIHR5cGUsIGUpIHtcclxuICAgICAgICBsZXQgdmFsdWUgPSBlLnRhcmdldC52YWx1ZVxyXG4gICAgICAgIGlmKHR5cGUgPT09ICdudW1iZXInKXtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gYmlnKGUudGFyZ2V0LnZhbHVlKVxyXG4gICAgICAgICAgICB9IGNhdGNoKGVycikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjp7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIFtyZWYucmVmXToge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbltyZWYucmVmXSxcclxuICAgICAgICAgICAgICAgIFtyZWYuaWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdLFxyXG4gICAgICAgICAgICAgICAgICAgIFtwcm9wZXJ0eU5hbWVdOiB2YWx1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfX0sIHRydWUpXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBBRERfRVZFTlQocHJvcGVydHlOYW1lKSB7XHJcbiAgICAgICAgY29uc3QgcmVmID0gc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZVxyXG4gICAgICAgIGNvbnN0IGV2ZW50SWQgPSB1dWlkKCk7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOntcclxuICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgW3JlZi5yZWZdOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uW3JlZi5yZWZdLFxyXG4gICAgICAgICAgICAgICAgW3JlZi5pZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uW3JlZi5yZWZdW3JlZi5pZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgW3Byb3BlcnR5TmFtZV06IHtyZWY6ICdldmVudCcsIGlkOiBldmVudElkfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBldmVudDoge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5ldmVudCxcclxuICAgICAgICAgICAgICAgIFtldmVudElkXToge1xyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnT24gJyArIHByb3BlcnR5TmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBtdXRhdG9yczogW11cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH19LCB0cnVlKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQUREX01VVEFUT1Ioc3RhdGVJZCwgZXZlbnRJZCkge1xyXG4gICAgICAgIGNvbnN0IG11dGF0b3JJZCA9IHV1aWQoKTtcclxuICAgICAgICBjb25zdCBwaXBlSWQgPSB1dWlkKCk7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOntcclxuICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgcGlwZTp7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsXHJcbiAgICAgICAgICAgICAgICBbcGlwZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHN0YXRlLmRlZmluaXRpb24uc3RhdGVbc3RhdGVJZF0udHlwZSxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogc3RhdGUuZGVmaW5pdGlvbi5zdGF0ZVtzdGF0ZUlkXS5kZWZhdWx0VmFsdWUsXHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBbXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzdGF0ZToge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5zdGF0ZSxcclxuICAgICAgICAgICAgICAgIFtzdGF0ZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24uc3RhdGVbc3RhdGVJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgbXV0YXRvcnM6IHN0YXRlLmRlZmluaXRpb24uc3RhdGVbc3RhdGVJZF0ubXV0YXRvcnMuY29uY2F0KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiAnbXV0YXRvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBtdXRhdG9ySWRcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtdXRhdG9yOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLm11dGF0b3IsXHJcbiAgICAgICAgICAgICAgICBbbXV0YXRvcklkXToge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogXCJldmVudFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogZXZlbnRJZFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiBcInN0YXRlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBzdGF0ZUlkXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBtdXRhdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWY6IFwicGlwZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogcGlwZUlkXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBldmVudDoge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5ldmVudCxcclxuICAgICAgICAgICAgICAgIFtldmVudElkXToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24uZXZlbnRbZXZlbnRJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgbXV0YXRvcnM6IHN0YXRlLmRlZmluaXRpb24uZXZlbnRbZXZlbnRJZF0ubXV0YXRvcnMuY29uY2F0KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiAnbXV0YXRvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBtdXRhdG9ySWRcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfX0sIHRydWUpXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBNT1ZFX1ZJRVdfTk9ERShwYXJlbnRSZWYsIHBvc2l0aW9uLCBhbW91bnQsIGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOntcclxuICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgW3BhcmVudFJlZi5yZWZdOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdLFxyXG4gICAgICAgICAgICAgICAgW3BhcmVudFJlZi5pZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdW3BhcmVudFJlZi5pZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IHN0YXRlLmRlZmluaXRpb25bcGFyZW50UmVmLnJlZl1bcGFyZW50UmVmLmlkXS5jaGlsZHJlbi5tYXAoIC8vIGZ1bmN0aW9uYWwgc3dhcFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoY2hpbGQsaW5kZXgpPT4gaW5kZXggPT09IHBvc2l0aW9uICsgYW1vdW50ID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLmRlZmluaXRpb25bcGFyZW50UmVmLnJlZl1bcGFyZW50UmVmLmlkXS5jaGlsZHJlbltwb3NpdGlvbl06XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleCA9PT0gcG9zaXRpb24gP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLmRlZmluaXRpb25bcGFyZW50UmVmLnJlZl1bcGFyZW50UmVmLmlkXS5jaGlsZHJlbltwb3NpdGlvbiArIGFtb3VudF06XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXVtwYXJlbnRSZWYuaWRdLmNoaWxkcmVuW2luZGV4XVxyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH19LCB0cnVlKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gU0VMRUNUX1BJUEUocGlwZUlkKSB7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBzZWxlY3RlZFBpcGVJZDpwaXBlSWR9KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQ0hBTkdFX1BJUEVfVkFMVUVfVE9fU1RBVEUocGlwZUlkKSB7XHJcbiAgICAgICAgaWYoIXN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgfHwgc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0udmFsdWUuaWQgKXtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgcGlwZToge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLFxyXG4gICAgICAgICAgICAgICAgW3BpcGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXSxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZToge3JlZjogJ3N0YXRlJywgaWQ6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWR9LFxyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogW11cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH19LCB0cnVlKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQUREX1RSQU5TRk9STUFUSU9OKHBpcGVJZCwgdHJhbnNmb3JtYXRpb24pIHtcclxuICAgICAgICBpZih0cmFuc2Zvcm1hdGlvbiA9PT0gJ2pvaW4nKXtcclxuICAgICAgICAgICAgY29uc3QgbmV3UGlwZUlkID0gdXVpZCgpO1xyXG4gICAgICAgICAgICBjb25zdCBqb2luSWQgPSB1dWlkKCk7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgIGpvaW46IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLmpvaW4sXHJcbiAgICAgICAgICAgICAgICAgICAgW2pvaW5JZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6ICdwaXBlJywgaWQ6bmV3UGlwZUlkfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwaXBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIFtuZXdQaXBlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdEZWZhdWx0IHRleHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBbcGlwZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBzdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXS50cmFuc2Zvcm1hdGlvbnMuY29uY2F0KHtyZWY6ICdqb2luJywgaWQ6am9pbklkfSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH19LCB0cnVlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0cmFuc2Zvcm1hdGlvbiA9PT0gJ3RvVXBwZXJDYXNlJyl7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld0lkID0gdXVpZCgpO1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICB0b1VwcGVyQ2FzZToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24udG9VcHBlckNhc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgW25ld0lkXToge31cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwaXBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIFtwaXBlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IHN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLnRyYW5zZm9ybWF0aW9ucy5jb25jYXQoe3JlZjogJ3RvVXBwZXJDYXNlJywgaWQ6bmV3SWR9KVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfX0sIHRydWUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRyYW5zZm9ybWF0aW9uID09PSAndG9Mb3dlckNhc2UnKXtcclxuICAgICAgICAgICAgY29uc3QgbmV3SWQgPSB1dWlkKCk7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgIHRvTG93ZXJDYXNlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi50b0xvd2VyQ2FzZSxcclxuICAgICAgICAgICAgICAgICAgICBbbmV3SWRdOiB7fVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHBpcGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsXHJcbiAgICAgICAgICAgICAgICAgICAgW3BpcGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0udHJhbnNmb3JtYXRpb25zLmNvbmNhdCh7cmVmOiAndG9Mb3dlckNhc2UnLCBpZDpuZXdJZH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9fSwgdHJ1ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHJhbnNmb3JtYXRpb24gPT09ICd0b1RleHQnKXtcclxuICAgICAgICAgICAgY29uc3QgbmV3SWQgPSB1dWlkKCk7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgIHRvVGV4dDoge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24udG9UZXh0LFxyXG4gICAgICAgICAgICAgICAgICAgIFtuZXdJZF06IHt9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcGlwZToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZSxcclxuICAgICAgICAgICAgICAgICAgICBbcGlwZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBzdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXS50cmFuc2Zvcm1hdGlvbnMuY29uY2F0KHtyZWY6ICd0b1RleHQnLCBpZDpuZXdJZH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9fSwgdHJ1ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHJhbnNmb3JtYXRpb24gPT09ICdhZGQnKXtcclxuICAgICAgICAgICAgY29uc3QgbmV3UGlwZUlkID0gdXVpZCgpO1xyXG4gICAgICAgICAgICBjb25zdCBhZGRJZCA9IHV1aWQoKTtcclxuICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgYWRkOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5hZGQsXHJcbiAgICAgICAgICAgICAgICAgICAgW2FkZElkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToge3JlZjogJ3BpcGUnLCBpZDpuZXdQaXBlSWR9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHBpcGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsXHJcbiAgICAgICAgICAgICAgICAgICAgW25ld1BpcGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ251bWJlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBbcGlwZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBzdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXS50cmFuc2Zvcm1hdGlvbnMuY29uY2F0KHtyZWY6ICdhZGQnLCBpZDphZGRJZH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9fSwgdHJ1ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHJhbnNmb3JtYXRpb24gPT09ICdzdWJ0cmFjdCcpe1xyXG4gICAgICAgICAgICBjb25zdCBuZXdQaXBlSWQgPSB1dWlkKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHN1YnRyYWN0SWQgPSB1dWlkKCk7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgIHN1YnRyYWN0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5zdWJ0cmFjdCxcclxuICAgICAgICAgICAgICAgICAgICBbc3VidHJhY3RJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6ICdwaXBlJywgaWQ6bmV3UGlwZUlkfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwaXBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIFtuZXdQaXBlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgW3BpcGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0udHJhbnNmb3JtYXRpb25zLmNvbmNhdCh7cmVmOiAnc3VidHJhY3QnLCBpZDpzdWJ0cmFjdElkfSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH19LCB0cnVlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFNIT1dfVklFV19OT0RFUyhlKXtcclxuICAgICAgICBzZXRTdGF0ZSh7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLFxyXG4gICAgICAgICAgICBzaG93aW5nVmlld05vZGVzOiB0cnVlXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFJFU0VUX0FQUCgpIHtcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IGFwcERlZmluaXRpb259KVxyXG4gICAgfVxyXG5cclxuICAgIC8vIExpc3RlbiB0byBhcHAgYW5kIGJsaW5rIGV2ZXJ5IGFjdGlvblxyXG4gICAgbGV0IHRpbWVyID0gbnVsbFxyXG4gICAgY29uc3QgZXZlbnRTdGFjayA9IFtdXHJcbiAgICBhcHAuYWRkTGlzdGVuZXIoKGV2ZW50TmFtZSwgZGF0YSwgZSwgcHJldmlvdXNTdGF0ZSwgY3VycmVudFN0YXRlLCBtdXRhdGlvbnMpPT57XHJcbiAgICAgICAgZXZlbnRTdGFjay5wdXNoKHtldmVudE5hbWUsIGRhdGEsIGUsIHByZXZpb3VzU3RhdGUsIGN1cnJlbnRTdGF0ZSwgbXV0YXRpb25zfSlcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGFjdGl2ZUV2ZW50OiBldmVudE5hbWV9KVxyXG4gICAgICAgIC8vIHllYWgsIEkgcHJvYmFibHkgbmVlZGVkIHNvbWUgb2JzZXJ2YWJsZXMgdG9vXHJcbiAgICAgICAgaWYodGltZXIpe1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRpbWVyID0gc2V0VGltZW91dCgoKT0+IHtcclxuICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBhY3RpdmVFdmVudDogJyd9KVxyXG4gICAgICAgIH0sIDUwMClcclxuICAgIH0pXHJcblxyXG4gICAgLy8gUmVuZGVyXHJcbiAgICBmdW5jdGlvbiByZW5kZXIoKSB7XHJcbiAgICAgICAgY29uc3QgY3VycmVudFN0YXRlID0gYXBwLmdldEN1cnJlbnRTdGF0ZSgpXHJcbiAgICAgICAgY29uc3QgZHJhZ0NvbXBvbmVudExlZnQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICBtb3VzZWRvd246IFtXSURUSF9EUkFHR0VELCAnZWRpdG9yTGVmdFdpZHRoJ10sXHJcbiAgICAgICAgICAgICAgICB0b3VjaHN0YXJ0OiBbV0lEVEhfRFJBR0dFRCwgJ2VkaXRvckxlZnRXaWR0aCddLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICByaWdodDogJzAnLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlWCgxMDAlKScsXHJcbiAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAnMTBweCcsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogJzFlbScsXHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAnMCcsXHJcbiAgICAgICAgICAgICAgICBjdXJzb3I6ICdjb2wtcmVzaXplJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KVxyXG4gICAgICAgIGNvbnN0IGRyYWdDb21wb25lbnRSaWdodCA9IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgIG1vdXNlZG93bjogW1dJRFRIX0RSQUdHRUQsICdlZGl0b3JSaWdodFdpZHRoJ10sXHJcbiAgICAgICAgICAgICAgICB0b3VjaHN0YXJ0OiBbV0lEVEhfRFJBR0dFRCwgJ2VkaXRvclJpZ2h0V2lkdGgnXSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICAgICAgbGVmdDogJzAnLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlWCgtMTAwJSknLFxyXG4gICAgICAgICAgICAgICAgdG9wOiAnMCcsXHJcbiAgICAgICAgICAgICAgICB3aWR0aDogJzEwcHgnLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXHJcbiAgICAgICAgICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgZm9udFNpemU6ICcxZW0nLFxyXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogJzAnLFxyXG4gICAgICAgICAgICAgICAgY3Vyc29yOiAnY29sLXJlc2l6ZScsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSlcclxuICAgICAgICBjb25zdCBkcmFnU3ViQ29tcG9uZW50ID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgbW91c2Vkb3duOiBbV0lEVEhfRFJBR0dFRCwgJ3N1YkVkaXRvcldpZHRoJ10sXHJcbiAgICAgICAgICAgICAgICB0b3VjaHN0YXJ0OiBbV0lEVEhfRFJBR0dFRCwgJ3N1YkVkaXRvcldpZHRoJ10sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgICAgIGxlZnQ6ICcycHgnLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlWCgtMTAwJSknLFxyXG4gICAgICAgICAgICAgICAgdG9wOiAnMCcsXHJcbiAgICAgICAgICAgICAgICB3aWR0aDogJzEwcHgnLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXHJcbiAgICAgICAgICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgZm9udFNpemU6ICcxZW0nLFxyXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgICAgIGN1cnNvcjogJ2NvbC1yZXNpemUnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGVtYmVyRWRpdG9yKHJlZiwgdHlwZSl7XHJcbiAgICAgICAgICAgIGNvbnN0IHBpcGUgPSBzdGF0ZS5kZWZpbml0aW9uW3JlZi5yZWZdW3JlZi5pZF1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGxpc3RUcmFuc2Zvcm1hdGlvbnModHJhbnNmb3JtYXRpb25zLCB0cmFuc1R5cGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1hdGlvbnMubWFwKCh0cmFuc1JlZiwgaW5kZXgpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdHJhbnNmb3JtZXIgPSBzdGF0ZS5kZWZpbml0aW9uW3RyYW5zUmVmLnJlZl1bdHJhbnNSZWYuaWRdXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgKHRyYW5zUmVmLnJlZiA9PT0gJ2VxdWFsJykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICByZXR1cm4gaCgnZGl2Jywge30sIFtcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2NvbG9yOiAnI2JkYmRiZCcsIGN1cnNvcjogJ2RlZmF1bHQnLCBkaXNwbGF5OidmbGV4J319LCBbaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJ319LCB0cmFuc1JlZi5yZWYpLCBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAnfX0sIHRyYW5zVHlwZSldKSxcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIGVtYmVyRWRpdG9yKHRyYW5zZm9ybWVyLnZhbHVlLCB0eXBlKVxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNSZWYucmVmID09PSAnYWRkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge30sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtrZXk6IGluZGV4LCBzdHlsZToge2NvbG9yOiAnI2JkYmRiZCcsIGN1cnNvcjogJ2RlZmF1bHQnLCBkaXNwbGF5OidmbGV4J319LCBbaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJ319LCB0cmFuc1JlZi5yZWYpLCBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAnLCBjb2xvcjogdHJhbnNmb3JtYXRpb25zLmxlbmd0aC0xICE9PSBpbmRleCA/ICcjYmRiZGJkJzogdHJhbnNUeXBlID09PSB0eXBlID8gJ2dyZWVuJzogJ3JlZCd9fSwgJ251bWJlcicpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nTGVmdDogJzE1cHgnfX0sIFtlbWJlckVkaXRvcih0cmFuc2Zvcm1lci52YWx1ZSwgdHJhbnNUeXBlKV0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc1JlZi5yZWYgPT09ICdzdWJ0cmFjdCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHt9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7a2V5OiBpbmRleCwgc3R5bGU6IHtjb2xvcjogJyNiZGJkYmQnLCBjdXJzb3I6ICdkZWZhdWx0JywgZGlzcGxheTonZmxleCd9fSwgW2goJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMSd9fSwgdHJhbnNSZWYucmVmKSwgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwJywgY29sb3I6IHRyYW5zZm9ybWF0aW9ucy5sZW5ndGgtMSAhPT0gaW5kZXggPyAnI2JkYmRiZCc6IHRyYW5zVHlwZSA9PT0gdHlwZSA/ICdncmVlbic6ICdyZWQnfX0sICdudW1iZXInKV0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ0xlZnQ6ICcxNXB4J319LCBbZW1iZXJFZGl0b3IodHJhbnNmb3JtZXIudmFsdWUsIHRyYW5zVHlwZSldKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyBpZiAodHJhbnNSZWYucmVmID09PSAnYnJhbmNoJykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBpZihyZXNvbHZlKHRyYW5zZm9ybWVyLnByZWRpY2F0ZSkpe1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgdmFsdWUgPSB0cmFuc2Zvcm1WYWx1ZSh2YWx1ZSwgdHJhbnNmb3JtZXIudGhlbilcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIHZhbHVlID0gdHJhbnNmb3JtVmFsdWUodmFsdWUsIHRyYW5zZm9ybWVyLmVsc2UpXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zUmVmLnJlZiA9PT0gJ2pvaW4nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7Y29sb3I6ICcjYmRiZGJkJywgY3Vyc29yOiAnZGVmYXVsdCcsIGRpc3BsYXk6J2ZsZXgnfX0sIFtoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnfX0sIHRyYW5zUmVmLnJlZiksIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCcsIGNvbG9yOiB0cmFuc2Zvcm1hdGlvbnMubGVuZ3RoLTEgIT09IGluZGV4ID8gJyNiZGJkYmQnOiB0cmFuc1R5cGUgPT09IHR5cGUgPyAnZ3JlZW4nOiAncmVkJ319LCAndGV4dCcpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nTGVmdDogJzE1cHgnfX0sIFtlbWJlckVkaXRvcih0cmFuc2Zvcm1lci52YWx1ZSwgdHJhbnNUeXBlKV0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc1JlZi5yZWYgPT09ICd0b1VwcGVyQ2FzZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHt9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtjdXJzb3I6ICdkZWZhdWx0JywgZGlzcGxheTonZmxleCd9fSwgW2goJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMScsIGNvbG9yOiAnI2JkYmRiZCd9fSwgdHJhbnNSZWYucmVmKSwgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwJywgY29sb3I6IHRyYW5zZm9ybWF0aW9ucy5sZW5ndGgtMSAhPT0gaW5kZXggPyAnI2JkYmRiZCc6IHRyYW5zVHlwZSA9PT0gdHlwZSA/ICdncmVlbic6ICdyZWQnfX0sICd0ZXh0JyldKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zUmVmLnJlZiA9PT0gJ3RvTG93ZXJDYXNlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge30sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2N1cnNvcjogJ2RlZmF1bHQnLCBkaXNwbGF5OidmbGV4J319LCBbaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJywgY29sb3I6ICcjYmRiZGJkJ319LCB0cmFuc1JlZi5yZWYpLCBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAnLCBjb2xvcjogdHJhbnNmb3JtYXRpb25zLmxlbmd0aC0xICE9PSBpbmRleCA/ICcjYmRiZGJkJzogdHJhbnNUeXBlID09PSB0eXBlID8gJ2dyZWVuJzogJ3JlZCd9fSwgJ3RleHQnKV0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNSZWYucmVmID09PSAndG9UZXh0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge30sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2N1cnNvcjogJ2RlZmF1bHQnLCBkaXNwbGF5OidmbGV4J319LCBbaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJywgY29sb3I6ICcjYmRiZGJkJ319LCB0cmFuc1JlZi5yZWYpLCBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAnLCBjb2xvcjogdHJhbnNmb3JtYXRpb25zLmxlbmd0aC0xICE9PSBpbmRleCA/ICcjYmRiZGJkJzogdHJhbnNUeXBlID09PSB0eXBlID8gJ2dyZWVuJzogJ3JlZCd9fSwgJ3RleHQnKV0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGdlblRyYW5zZm9ybWF0b3JzKHR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGlmKHR5cGUgPT09ICd0ZXh0Jyl7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZzogJzVweCAxMHB4JywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsIGJvcmRlclJhZGl1czogJzEwcHgnLCBtYXJnaW46ICc1cHgnLCBjdXJzb3I6ICdwb2ludGVyJywgYm9yZGVyOiBzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID8gJzJweCBzb2xpZCB3aGl0ZScgOiAnMnB4IHNvbGlkICNiZGJkYmQnLCBjb2xvcjogc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA/ICd3aGl0ZScgOiAnI2JkYmRiZCcsfSwgb246IHtjbGljazogW0NIQU5HRV9QSVBFX1ZBTFVFX1RPX1NUQVRFLCByZWYuaWRdfX0sICdjaGFuZ2UgdG8gc3RhdGUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZzogJzVweCAxMHB4JywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsIGJvcmRlclJhZGl1czogJzEwcHgnLCBtYXJnaW46ICc1cHgnLCBjdXJzb3I6ICdwb2ludGVyJywgYm9yZGVyOiAnMnB4IHNvbGlkIHdoaXRlJ30sIG9uOiB7Y2xpY2s6IFtBRERfVFJBTlNGT1JNQVRJT04sIHJlZi5pZCwgJ2pvaW4nXX19LCAnam9pbicpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nOiAnNXB4IDEwcHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgYm9yZGVyUmFkaXVzOiAnMTBweCcsIG1hcmdpbjogJzVweCcsIGN1cnNvcjogJ3BvaW50ZXInLCBib3JkZXI6ICcycHggc29saWQgd2hpdGUnfSwgb246IHtjbGljazogW0FERF9UUkFOU0ZPUk1BVElPTiwgcmVmLmlkLCAndG9VcHBlckNhc2UnXX19LCAndG8gVXBwZXIgY2FzZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nOiAnNXB4IDEwcHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgYm9yZGVyUmFkaXVzOiAnMTBweCcsIG1hcmdpbjogJzVweCcsIGN1cnNvcjogJ3BvaW50ZXInLCBib3JkZXI6ICcycHggc29saWQgd2hpdGUnfSwgb246IHtjbGljazogW0FERF9UUkFOU0ZPUk1BVElPTiwgcmVmLmlkLCAndG9Mb3dlckNhc2UnXX19LCAndG8gTG93ZXIgY2FzZScpLFxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmKHR5cGUgPT09ICdudW1iZXInKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nOiAnNXB4IDEwcHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgYm9yZGVyUmFkaXVzOiAnMTBweCcsIG1hcmdpbjogJzVweCcsIGN1cnNvcjogJ3BvaW50ZXInLCBib3JkZXI6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPyAnMnB4IHNvbGlkIHdoaXRlJyA6ICcycHggc29saWQgI2JkYmRiZCcsIGNvbG9yOiBzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkICA/ICd3aGl0ZScgOiAnI2JkYmRiZCcsfSwgb246IHtjbGljazogW0NIQU5HRV9QSVBFX1ZBTFVFX1RPX1NUQVRFLCByZWYuaWRdfX0sICdjaGFuZ2UgdG8gc3RhdGUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZzogJzVweCAxMHB4JywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsIGJvcmRlclJhZGl1czogJzEwcHgnLCBtYXJnaW46ICc1cHgnLCBjdXJzb3I6ICdwb2ludGVyJywgYm9yZGVyOiAnMnB4IHNvbGlkIHdoaXRlJ30sIG9uOiB7Y2xpY2s6IFtBRERfVFJBTlNGT1JNQVRJT04sIHJlZi5pZCwgJ3RvVGV4dCddfX0sICd0byB0ZXh0JyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmc6ICc1cHggMTBweCcsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCBib3JkZXJSYWRpdXM6ICcxMHB4JywgbWFyZ2luOiAnNXB4JywgY3Vyc29yOiAncG9pbnRlcicsIGJvcmRlcjogJzJweCBzb2xpZCB3aGl0ZSd9LCBvbjoge2NsaWNrOiBbQUREX1RSQU5TRk9STUFUSU9OLCByZWYuaWQsICdhZGQnXX19LCAnYWRkJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmc6ICc1cHggMTBweCcsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCBib3JkZXJSYWRpdXM6ICcxMHB4JywgbWFyZ2luOiAnNXB4JywgY3Vyc29yOiAncG9pbnRlcicsIGJvcmRlcjogJzJweCBzb2xpZCB3aGl0ZSd9LCBvbjoge2NsaWNrOiBbQUREX1RSQU5TRk9STUFUSU9OLCByZWYuaWQsICdzdWJ0cmFjdCddfX0sICdzdWJ0cmFjdCcpLFxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHBpcGUudmFsdWUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2JywgW2goJ2RpdicsIHtzdHlsZTp7ZGlzcGxheTonZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInfSwgb246IHtjbGljazogW1NFTEVDVF9QSVBFLCByZWYuaWRdfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICBoKCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAgJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dERlY29yYXRpb246ICd1bmRlcmxpbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IFtDSEFOR0VfU1RBVElDX1ZBTFVFLCByZWYsICd2YWx1ZScsICd0ZXh0J10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGl2ZVByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHBpcGUudmFsdWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtmbGV4OiAnMCcsIGN1cnNvcjogJ2RlZmF1bHQnLCBjb2xvcjogcGlwZS50cmFuc2Zvcm1hdGlvbnMubGVuZ3RoID4gMCA/ICcjYmRiZGJkJzogdHlwZSA9PT0gJ3RleHQnID8gJ2dyZWVuJzogJ3JlZCd9fSwgJ3RleHQnKVxyXG4gICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ0xlZnQ6ICcxNXB4J319LCBsaXN0VHJhbnNmb3JtYXRpb25zKHBpcGUudHJhbnNmb3JtYXRpb25zLCBwaXBlLnR5cGUpKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCBzdGF0ZS5zZWxlY3RlZFBpcGVJZCA9PT0gcmVmLmlkID8gZ2VuVHJhbnNmb3JtYXRvcnMoJ3RleHQnKTogW10pXHJcbiAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIWlzTmFOKHBhcnNlRmxvYXQoTnVtYmVyKHBpcGUudmFsdWUpKSkgJiYgaXNGaW5pdGUoTnVtYmVyKHBpcGUudmFsdWUpKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIFtoKCdkaXYnLCB7c3R5bGU6e2Rpc3BsYXk6J2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJ30sIG9uOiB7Y2xpY2s6IFtTRUxFQ1RfUElQRSwgcmVmLmlkXX19LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnaW5wdXQnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRyczoge3R5cGU6J251bWJlcid9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZTogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW46ICAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0RGVjb3JhdGlvbjogJ3VuZGVybGluZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogW0NIQU5HRV9TVEFUSUNfVkFMVUUsIHJlZiwgJ3ZhbHVlJywgJ251bWJlciddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpdmVQcm9wczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBOdW1iZXIocGlwZS52YWx1ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtmbGV4OiAnMCcsIGN1cnNvcjogJ2RlZmF1bHQnLCBjb2xvcjogcGlwZS50cmFuc2Zvcm1hdGlvbnMubGVuZ3RoID4gMCA/ICcjYmRiZGJkJzogdHlwZSA9PT0gJ251bWJlcicgPyAnZ3JlZW4nOiAncmVkJ319LCAnbnVtYmVyJylcclxuICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmdMZWZ0OiAnMTVweCd9fSwgbGlzdFRyYW5zZm9ybWF0aW9ucyhwaXBlLnRyYW5zZm9ybWF0aW9ucywgcGlwZS50eXBlKSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywgc3RhdGUuc2VsZWN0ZWRQaXBlSWQgPT09IHJlZi5pZCA/IGdlblRyYW5zZm9ybWF0b3JzKCdudW1iZXInKTogW10pXHJcbiAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZihwaXBlLnZhbHVlLnJlZiA9PT0gJ3N0YXRlJyl7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkaXNwbFN0YXRlID0gc3RhdGUuZGVmaW5pdGlvbltwaXBlLnZhbHVlLnJlZl1bcGlwZS52YWx1ZS5pZF1cclxuICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCBbaCgnZGl2Jywge3N0eWxlOntkaXNwbGF5OidmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcid9LCBvbjoge2NsaWNrOiBbU0VMRUNUX1BJUEUsIHJlZi5pZF19fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcxJ319LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBbaCgnZGl2Jyx7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcicsIGNvbG9yOiBzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBwaXBlLnZhbHVlLmlkID8gJyNlYWI2NWMnOiAnd2hpdGUnLCBwYWRkaW5nOiAnMnB4IDVweCcsIG1hcmdpbjogJzNweCAzcHggMCAwJywgYm9yZGVyOiAnMnB4IHNvbGlkICcgKyAoc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gcGlwZS52YWx1ZS5pZCA/ICcjZWFiNjVjJzogJ3doaXRlJyksIGJvcmRlclJhZGl1czogJzEwcHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJ30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb246IHtjbGljazogW1NUQVRFX05PREVfU0VMRUNURUQsIHBpcGUudmFsdWUuaWRdfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtkaXNwbFN0YXRlLnRpdGxlXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzAnLCBjdXJzb3I6ICdkZWZhdWx0JywgY29sb3I6IHBpcGUudHJhbnNmb3JtYXRpb25zLmxlbmd0aCA+IDAgPyAnI2JkYmRiZCc6IGRpc3BsU3RhdGUudHlwZSA9PT0gdHlwZSA/ICdncmVlbic6ICdyZWQnfX0sIGRpc3BsU3RhdGUudHlwZSlcclxuICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmdMZWZ0OiAnMTVweCd9fSwgbGlzdFRyYW5zZm9ybWF0aW9ucyhwaXBlLnRyYW5zZm9ybWF0aW9ucywgcGlwZS50eXBlKSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywgc3RhdGUuc2VsZWN0ZWRQaXBlSWQgPT09IHJlZi5pZCA/IHBpcGUudHJhbnNmb3JtYXRpb25zLmxlbmd0aCA9PT0gMCA/IGdlblRyYW5zZm9ybWF0b3JzKGRpc3BsU3RhdGUudHlwZSk6IHBpcGUudHJhbnNmb3JtYXRpb25zW3BpcGUudHJhbnNmb3JtYXRpb25zLmxlbmd0aC0xXS5yZWYgPT09ICdhZGQnIHx8IHBpcGUudHJhbnNmb3JtYXRpb25zW3BpcGUudHJhbnNmb3JtYXRpb25zLmxlbmd0aC0xXS5yZWYgPT09ICdzdWJ0cmFjdCc/IGdlblRyYW5zZm9ybWF0b3JzKCdudW1iZXInKSA6IGdlblRyYW5zZm9ybWF0b3JzKCd0ZXh0Jyk6IFtdKSAvLyBUT0RPIGZpeCwgYSBoYWNrIGZvciBkZW1vLCB0eXBlIHNob3VsZCBiZSBsYXN0IHRyYW5zZm9ybWF0aW9uIG5vdCBqdXN0IHRleHRcclxuICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYocGlwZS52YWx1ZS5yZWYgPT09ICdldmVudERhdGEnKXtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50RGF0YSA9IHN0YXRlLmRlZmluaXRpb25bcGlwZS52YWx1ZS5yZWZdW3BpcGUudmFsdWUuaWRdXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2JywgW2goJ2RpdicsIHtzdHlsZTp7ZGlzcGxheTonZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInfSwgb246IHtjbGljazogW1NFTEVDVF9QSVBFLCByZWYuaWRdfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtmbGV4OiAnMSd9fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgW2goJ2Rpdicse1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInLCBjb2xvcjogc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gcGlwZS52YWx1ZS5pZCA/ICcjZWFiNjVjJzogJ3doaXRlJywgcGFkZGluZzogJzJweCA1cHgnLCBtYXJnaW46ICczcHggM3B4IDAgMCcsIGJvcmRlcjogJzJweCBzb2xpZCAnICsgKHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHBpcGUudmFsdWUuaWQgPyAnI2VhYjY1Yyc6ICd3aGl0ZScpLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJ30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb246IHtjbGljazogW1NUQVRFX05PREVfU0VMRUNURUQsIHBpcGUudmFsdWUuaWRdfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtldmVudERhdGEudGl0bGVdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtmbGV4OiAnMCcsIGN1cnNvcjogJ2RlZmF1bHQnLCBjb2xvcjogcGlwZS50cmFuc2Zvcm1hdGlvbnMubGVuZ3RoID4gMCA/ICcjYmRiZGJkJzogZXZlbnREYXRhLnR5cGUgPT09IHR5cGUgPyAnZ3JlZW4nOiAncmVkJ319LCBldmVudERhdGEudHlwZSlcclxuICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmdMZWZ0OiAnMTVweCd9fSwgbGlzdFRyYW5zZm9ybWF0aW9ucyhwaXBlLnRyYW5zZm9ybWF0aW9ucywgcGlwZS50eXBlKSksXHJcbiAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBsaXN0TmFtZVNwYWNlKHN0YXRlSWQpIHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudE5hbWVTcGFjZSA9IHN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlW3N0YXRlSWRdXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGVkaXRpbmdOb2RlKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2lucHV0Jywge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHN0YXRlSWQgPyAnI2VhYjY1Yyc6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm94U2hhZG93OiAnaW5zZXQgMCAtMXB4IDAgMCB3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAgJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250OiAnaW5oZXJpdCdcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBbQ0hBTkdFX05BTUVTUEFDRV9USVRMRSwgc3RhdGVJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBsaXZlUHJvcHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGN1cnJlbnROYW1lU3BhY2UudGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBhdHRyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvZm9jdXM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLWlzdGl0bGVlZGl0b3InOiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBjbG9zZWQgPSBzdGF0ZS52aWV3Rm9sZGVyc0Nsb3NlZFtzdGF0ZUlkXSB8fCAoc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCAhPT0gc3RhdGVJZCAmJiBjdXJyZW50TmFtZVNwYWNlLmNoaWxkcmVuLmxlbmd0aCA9PT0gMClcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2JywgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdzdmcnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHt3aWR0aDogMTIsIGhlaWdodDogMTZ9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInLCBwYWRkaW5nOiAnMCA1cHgnLCB0cmFuc2Zvcm06IGNsb3NlZCA/ICdyb3RhdGUoMGRlZyknOiAncm90YXRlKDkwZGVnKScsIHRyYW5zaXRpb246ICdhbGwgMC4ycycsIG1hcmdpbkxlZnQ6ICctMTBweCd9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsaWNrOiBbVklFV19GT0xERVJfQ0xJQ0tFRCwgc3RhdGVJZF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtoKCdwb2x5Z29uJywge2F0dHJzOiB7cG9pbnRzOiAnMTIsOCAwLDEgMyw4IDAsMTUnfSwgc3R5bGU6IHtmaWxsOiBzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBzdGF0ZUlkID8gJyNlYWI2NWMnOiAnd2hpdGUnLCB0cmFuc2l0aW9uOiAnZmlsbCAwLjJzJ319KV0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQgPT09IHN0YXRlSWQgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWRpdGluZ05vZGUoKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7IHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInfSwgb246IHtjbGljazogW1NUQVRFX05PREVfU0VMRUNURUQsIHN0YXRlSWRdLCBkYmxjbGljazogW0VESVRfVklFV19OT0RFX1RJVExFLCBzdGF0ZUlkXX19LCBbaCgnc3BhbicsIHtzdHlsZToge2NvbG9yOiBzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBzdGF0ZUlkID8gJyNlYWI2NWMnOiAnd2hpdGUnLCB0cmFuc2l0aW9uOiAnY29sb3IgMC4ycyd9fSwgY3VycmVudE5hbWVTcGFjZS50aXRsZSldKSxcclxuICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHsgZGlzcGxheTogY2xvc2VkID8gJ25vbmUnOiAnYmxvY2snLCBwYWRkaW5nTGVmdDogJzEwcHgnLCBwYWRkaW5nQm90dG9tOiAnNXB4JywgYm9yZGVyTGVmdDogc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gc3RhdGVJZCA/ICcycHggc29saWQgI2VhYjY1YycgOicycHggc29saWQgI2JkYmRiZCcsIHRyYW5zaXRpb246ICdib3JkZXItY29sb3IgMC4ycyd9fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5jdXJyZW50TmFtZVNwYWNlLmNoaWxkcmVuLm1hcCgocmVmKT0+IHJlZi5yZWYgPT09ICdzdGF0ZScgPyBsaXN0U3RhdGUocmVmLmlkKTogbGlzdE5hbWVTcGFjZShyZWYuaWQpKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2Rpc3BsYXk6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHN0YXRlSWQgPyAnaW5saW5lLWJsb2NrJzogJ25vbmUnLCBjdXJzb3I6ICdwb2ludGVyJywgYm9yZGVyUmFkaXVzOiAnNXB4JywgYm9yZGVyOiAnM3B4IHNvbGlkICNlYWI2NWMnLCBwYWRkaW5nOiAnNXB4JywgbWFyZ2luOiAnNXB4J30sIG9uOiB7Y2xpY2s6IFtBRERfU1RBVEUsIHN0YXRlSWQsICd0ZXh0J119fSwgJysgdGV4dCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZGlzcGxheTogc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gc3RhdGVJZCA/ICdpbmxpbmUtYmxvY2snOiAnbm9uZScsIGN1cnNvcjogJ3BvaW50ZXInLCBib3JkZXJSYWRpdXM6ICc1cHgnLCBib3JkZXI6ICczcHggc29saWQgI2VhYjY1YycsIHBhZGRpbmc6ICc1cHgnLCBtYXJnaW46ICc1cHgnfSwgb246IHtjbGljazogW0FERF9TVEFURSwgc3RhdGVJZCwgJ251bWJlciddfX0sICcrIG51bWJlcicpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2goJ3NwYW4nLCB7c3R5bGU6IHtkaXNwbGF5OiBzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBzdGF0ZUlkID8gJ2lubGluZS1ibG9jayc6ICdub25lJywgY3Vyc29yOiAncG9pbnRlcicsIGJvcmRlclJhZGl1czogJzVweCcsIGJvcmRlcjogJzNweCBzb2xpZCAjZWFiNjVjJywgcGFkZGluZzogJzVweCcsIG1hcmdpbjogJzVweCd9LCBvbjoge2NsaWNrOiBbQUREX1NUQVRFLCBzdGF0ZUlkLCAnYm9vbGVhbiddfX0sICcrIHZhcmlhbnQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9oKCdzcGFuJywge3N0eWxlOiB7ZGlzcGxheTogc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gc3RhdGVJZCA/ICdpbmxpbmUtYmxvY2snOiAnbm9uZScsIGN1cnNvcjogJ3BvaW50ZXInLCBib3JkZXJSYWRpdXM6ICc1cHgnLCBib3JkZXI6ICczcHggc29saWQgI2VhYjY1YycsIHBhZGRpbmc6ICc1cHgnLCBtYXJnaW46ICc1cHgnfSwgb246IHtjbGljazogW0FERF9TVEFURSwgc3RhdGVJZCwgJ3RhYmxlJ119fSwgJysgdGFibGUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2Rpc3BsYXk6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHN0YXRlSWQgPyAnaW5saW5lLWJsb2NrJzogJ25vbmUnLCBjdXJzb3I6ICdwb2ludGVyJywgYm9yZGVyUmFkaXVzOiAnNXB4JywgYm9yZGVyOiAnM3B4IHNvbGlkICNlYWI2NWMnLCBwYWRkaW5nOiAnNXB4JywgbWFyZ2luOiAnNXB4J30sIG9uOiB7Y2xpY2s6IFtBRERfU1RBVEUsIHN0YXRlSWQsICduYW1lc3BhY2UnXX19LCAnKyBmb2xkZXInKSxcclxuICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBsaXN0U3RhdGUoc3RhdGVJZCkge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50U3RhdGUgPSBzdGF0ZS5kZWZpbml0aW9uLnN0YXRlW3N0YXRlSWRdXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGVkaXRpbmdOb2RlKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2lucHV0Jywge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHN0YXRlSWQgPyAnI2VhYjY1Yyc6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm94U2hhZG93OiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcycHggNXB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAnM3B4IDNweCAwIDAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICcycHggc29saWQgJyArIChzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBzdGF0ZUlkID8gJyNlYWI2NWMnOiAnI2JkYmRiZCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnQ6ICdpbmhlcml0J1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IFtDSEFOR0VfU1RBVEVfTk9ERV9USVRMRSwgc3RhdGVJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBsaXZlUHJvcHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGN1cnJlbnRTdGF0ZS50aXRsZSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGF0dHJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9mb2N1czogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGEtaXN0aXRsZWVkaXRvcic6IHRydWVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzAuOGVtJyxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge29uOiB7Y2xpY2s6IFtTVEFURV9OT0RFX1NFTEVDVEVELCBzdGF0ZUlkXSwgZGJsY2xpY2s6IFtFRElUX1ZJRVdfTk9ERV9USVRMRSwgc3RhdGVJZF19fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQgPT09IHN0YXRlSWQgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWRpdGluZ05vZGUoKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtjb2xvcjogc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gc3RhdGVJZCA/ICcjZWFiNjVjJzogJ3doaXRlJywgcGFkZGluZzogJzJweCA1cHgnLCBtYXJnaW46ICc3cHggM3B4IDJweCAwJywgYm9yZGVyOiAnMnB4IHNvbGlkICcgKyAoc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gc3RhdGVJZCA/ICcjZWFiNjVjJzogJyNiZGJkYmQnKSwgYm9yZGVyUmFkaXVzOiAnMTBweCcsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCB0cmFuc2l0aW9uOiAnYWxsIDAuMnMnfX0sIGN1cnJlbnRTdGF0ZS50aXRsZSksXHJcbiAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsICc6ICcpLFxyXG4gICAgICAgICAgICAgICAgICAgICgoKT0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm9TdHlsZUlucHV0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IGFwcC5nZXRDdXJyZW50U3RhdGUoKVtzdGF0ZUlkXSAhPSBzdGF0ZS5kZWZpbml0aW9uLnN0YXRlW3N0YXRlSWRdLmRlZmF1bHRWYWx1ZSA/ICdyZ2IoOTEsIDIwNCwgOTEpJyA6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhXaWR0aDogJzUwJScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoY3VycmVudFN0YXRlLnR5cGUgPT09ICd0ZXh0JykgcmV0dXJuIGgoJ2lucHV0Jywge2F0dHJzOiB7dHlwZTogJ3RleHQnfSwgbGl2ZVByb3BzOiB7dmFsdWU6IGFwcC5nZXRDdXJyZW50U3RhdGUoKVtzdGF0ZUlkXX0sIHN0eWxlOiBub1N0eWxlSW5wdXQsIG9uOiB7aW5wdXQ6IFtDSEFOR0VfQ1VSUkVOVF9TVEFURV9URVhUX1ZBTFVFLCBzdGF0ZUlkXX19KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihjdXJyZW50U3RhdGUudHlwZSA9PT0gJ251bWJlcicpIHJldHVybiBoKCdzcGFuJywge3N0eWxlOiB7cG9zaXRpb246ICdyZWxhdGl2ZSd9fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnaW5wdXQnLCB7YXR0cnM6IHt0eXBlOiAnbnVtYmVyJ30sIGxpdmVQcm9wczoge3ZhbHVlOiBhcHAuZ2V0Q3VycmVudFN0YXRlKClbc3RhdGVJZF19LCBzdHlsZTogey4uLm5vU3R5bGVJbnB1dCwgd2lkdGg6IDkqYXBwLmdldEN1cnJlbnRTdGF0ZSgpW3N0YXRlSWRdLnRvU3RyaW5nKCkubGVuZ3RoICsgJ3B4J30sIG9uOiB7aW5wdXQ6IFtDSEFOR0VfQ1VSUkVOVF9TVEFURV9OVU1CRVJfVkFMVUUsIHN0YXRlSWRdfX0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihjdXJyZW50U3RhdGUudHlwZSA9PT0gJ3RhYmxlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGFibGUgPSBhcHAuZ2V0Q3VycmVudFN0YXRlKClbc3RhdGVJZF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luVG9wOiAnM3B4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjODI4MTgzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZGlzcGxheTogJ2ZsZXgnfX0sICBPYmplY3Qua2V5cyhjdXJyZW50U3RhdGUuZGVmaW5pdGlvbikubWFwKGtleSA9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcxJywgcGFkZGluZzogJzJweCA1cHgnLCBib3JkZXJCb3R0b206ICcycHggc29saWQgd2hpdGUnfX0sIGtleSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uT2JqZWN0LmtleXModGFibGUpLm1hcChpZCA9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZGlzcGxheTogJ2ZsZXgnfX0sIE9iamVjdC5rZXlzKHRhYmxlW2lkXSkubWFwKGtleSA9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcxJywgcGFkZGluZzogJzJweCA1cHgnfX0sIHRhYmxlW2lkXVtrZXldKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pKCksXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gc3RhdGVJZCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCBjdXJyZW50U3RhdGUubXV0YXRvcnMubWFwKHJlZiA9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge2NvbG9yOiBzdGF0ZS5hY3RpdmVFdmVudCA9PT0gc3RhdGUuZGVmaW5pdGlvbi5tdXRhdG9yW3JlZi5pZF0uZXZlbnQuaWQgPyAnIzViY2M1Yic6ICd3aGl0ZScsIHRyYW5zaXRpb246ICdhbGwgMC4ycycsIGJveFNoYWRvdzogc3RhdGUuc2VsZWN0ZWRFdmVudElkID09PSBzdGF0ZS5kZWZpbml0aW9uLm11dGF0b3JbcmVmLmlkXS5ldmVudC5pZCA/ICcjNWJjYzViIDVweCAwIDBweCAwcHggaW5zZXQnOiAnbm9uZScsIHBhZGRpbmc6ICcwIDAgMCA3cHgnfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsaWNrOiBbU0VMRUNUX0VWRU5ULCBzdGF0ZS5kZWZpbml0aW9uLm11dGF0b3JbcmVmLmlkXS5ldmVudC5pZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYmxjbGljazogW0VESVRfRVZFTlRfVElUTEUsIHN0YXRlLmRlZmluaXRpb24ubXV0YXRvcltyZWYuaWRdLmV2ZW50LmlkXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ+KAoiAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLmVkaXRpbmdUaXRsZU5vZGVJZCA9PT0gc3RhdGUuZGVmaW5pdGlvbi5tdXRhdG9yW3JlZi5pZF0uZXZlbnQuaWQgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICdpbnNldCAwIC0xcHggMCAwIHdoaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAgJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnQ6ICdpbmhlcml0J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IFtDSEFOR0VfRVZFTlRfVElUTEUsIHN0YXRlLmRlZmluaXRpb24ubXV0YXRvcltyZWYuaWRdLmV2ZW50LmlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXZlUHJvcHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogc3RhdGUuZGVmaW5pdGlvbi5ldmVudFtzdGF0ZS5kZWZpbml0aW9uLm11dGF0b3JbcmVmLmlkXS5ldmVudC5pZF0udGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvZm9jdXM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGEtaXN0aXRsZWVkaXRvcic6IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBzdGF0ZS5kZWZpbml0aW9uLmV2ZW50W3N0YXRlLmRlZmluaXRpb24ubXV0YXRvcltyZWYuaWRdLmV2ZW50LmlkXS50aXRsZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5zZWxlY3RlZEV2ZW50SWQgPT09IHN0YXRlLmRlZmluaXRpb24ubXV0YXRvcltyZWYuaWRdLmV2ZW50LmlkID8gaCgnZGl2Jywge3N0eWxlOiB7bWFyZ2luTGVmdDogJzEwcHgnfX0sIFtlbWJlckVkaXRvcihzdGF0ZS5kZWZpbml0aW9uLm11dGF0b3JbcmVmLmlkXS5tdXRhdGlvbiwgY3VycmVudFN0YXRlLnR5cGUpXSk6IGgoJ2RpdicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgKSkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJyksXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHN0YXRlQ29tcG9uZW50ID0gaCgnZGl2JywgeyBhdHRyczoge2NsYXNzOiAnYmV0dGVyLXNjcm9sbGJhcid9LCBzdHlsZToge292ZXJmbG93OiAnYXV0bycsIGZsZXg6ICcxJywgcGFkZGluZzogJzZweCAxNXB4J30sIG9uOiB7Y2xpY2s6IFtVTlNFTEVDVF9TVEFURV9OT0RFXX19LCBbbGlzdE5hbWVTcGFjZSgnX3Jvb3ROYW1lU3BhY2UnKV0pXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxpc3RCb3hOb2RlKG5vZGVSZWYsIHBhcmVudFJlZiwgcG9zaXRpb24pIHtcclxuICAgICAgICAgICAgY29uc3Qgbm9kZUlkID0gbm9kZVJlZi5pZFxyXG4gICAgICAgICAgICBjb25zdCBwYXJlbnRJZCA9IHBhcmVudFJlZi5pZFxyXG4gICAgICAgICAgICBjb25zdCBub2RlID0gc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZUlkXVxyXG4gICAgICAgICAgICBmdW5jdGlvbiBlZGl0aW5nTm9kZSgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBoKCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyM1M0IyRUQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm94U2hhZG93OiAnaW5zZXQgMCAtMXB4IDAgMCAjNTNCMkVEJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udDogJ2luaGVyaXQnXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogW0NIQU5HRV9WSUVXX05PREVfVElUTEUsIG5vZGVSZWZdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbGl2ZVByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBub2RlLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b2ZvY3VzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pc3RpdGxlZWRpdG9yJzogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgY2xvc2VkID0gc3RhdGUudmlld0ZvbGRlcnNDbG9zZWRbbm9kZUlkXVxyXG4gICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVJlZi5yZWYgPT09ICd2Tm9kZUJveCcgJiYgbm9kZS5jaGlsZHJlbi5sZW5ndGggPiAwID8gaCgnc3ZnJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzOiB7d2lkdGg6IDEyLCBoZWlnaHQ6IDE2fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJywgcGFkZGluZzogJzAgNXB4JywgdHJhbnNmb3JtOiBjbG9zZWQgPyAncm90YXRlKDBkZWcpJzogJ3JvdGF0ZSg5MGRlZyknLCB0cmFuc2l0aW9uOiAnYWxsIDAuMnMnLCBtYXJnaW5MZWZ0OiAnLTNweCd9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsaWNrOiBbVklFV19GT0xERVJfQ0xJQ0tFRCwgbm9kZUlkXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW2goJ3BvbHlnb24nLCB7YXR0cnM6IHtwb2ludHM6ICcxMiw4IDAsMSAzLDggMCwxNSd9LCBzdHlsZToge2ZpbGw6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJ3doaXRlJywgdHJhbnNpdGlvbjogJ2ZpbGwgMC4ycyd9fSldKTogaCgnc3BhbicpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdzdmcnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHt3aWR0aDogMTQsIGhlaWdodDogMTR9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInLCBwYWRkaW5nOiAnMCA1cHggMCAwJ30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb246IHtjbGljazogW1ZJRVdfTk9ERV9TRUxFQ1RFRCwgbm9kZVJlZl19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVJlZi5yZWYgPT09ICd2Tm9kZUJveCcgPyBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3JlY3QnLCB7YXR0cnM6IHt4OiAxLCB5OiAxLCB3aWR0aDogMTIsIGhlaWdodDogMTIsIGZpbGw6ICdub25lJywgdHJhbnNpdGlvbjogJ2FsbCAwLjJzJyxzdHJva2U6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJyNiZGJkYmQnLCAnc3Ryb2tlLXdpZHRoJzogJzInfX0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF06XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVJlZi5yZWYgPT09ICd2Tm9kZUxpc3QnID8gW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnY2lyY2xlJywge2F0dHJzOiB7cjogMiwgY3g6IDIsIGN5OiAyLCB0cmFuc2l0aW9uOiAnYWxsIDAuMnMnLCBmaWxsOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnIzUzQjJFRCc6ICcjYmRiZGJkJyx9fSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdyZWN0Jywge2F0dHJzOiB7eDogNiwgeTogMSwgd2lkdGg6IDEwLCB0cmFuc2l0aW9uOiAnYWxsIDAuMnMnLCBoZWlnaHQ6IDIsIGZpbGw6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJyNiZGJkYmQnLH19KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2NpcmNsZScsIHthdHRyczoge3I6IDIsIGN4OiAyLCBjeTogNywgdHJhbnNpdGlvbjogJ2FsbCAwLjJzJywgZmlsbDogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJyM1M0IyRUQnOiAnI2JkYmRiZCcsfX0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgncmVjdCcsIHthdHRyczoge3g6IDYsIHk6IDYsIHdpZHRoOiAxMCwgdHJhbnNpdGlvbjogJ2FsbCAwLjJzJywgaGVpZ2h0OiAyLCBmaWxsOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnIzUzQjJFRCc6ICcjYmRiZGJkJyx9fSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdjaXJjbGUnLCB7YXR0cnM6IHtyOiAyLCBjeDogMiwgY3k6IDEyLCB0cmFuc2l0aW9uOiAnYWxsIDAuMnMnLCBmaWxsOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnIzUzQjJFRCc6ICcjYmRiZGJkJyx9fSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdyZWN0Jywge2F0dHJzOiB7eDogNiwgeTogMTEsIHdpZHRoOiAxMCwgdHJhbnNpdGlvbjogJ2FsbCAwLjJzJywgaGVpZ2h0OiAyLCBmaWxsOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnIzUzQjJFRCc6ICcjYmRiZGJkJyx9fSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0gOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCd0ZXh0Jywge2F0dHJzOiB7IHg6MywgeToxNCwgZmlsbDogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJyM1M0IyRUQnOiAnI2JkYmRiZCd9fSwgJz8nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQgPT09IG5vZGVJZCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZGl0aW5nTm9kZSgpOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHsgc3R5bGU6IHtmbGV4OiAnMScsIGN1cnNvcjogJ3BvaW50ZXInLCBjb2xvcjogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJyM1M0IyRUQnOiAnd2hpdGUnLCB0cmFuc2l0aW9uOiAnY29sb3IgMC4ycyd9LCBvbjoge2NsaWNrOiBbVklFV19OT0RFX1NFTEVDVEVELCBub2RlUmVmXSwgZGJsY2xpY2s6IFtFRElUX1ZJRVdfTk9ERV9USVRMRSwgbm9kZUlkXX19LCBub2RlLnRpdGxlKSxcclxuICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IGRpc3BsYXk6IGNsb3NlZCA/ICdub25lJzogJ2Jsb2NrJywgbWFyZ2luTGVmdDogJzdweCcsIHBhZGRpbmdMZWZ0OiAnMTBweCcsIGJvcmRlckxlZnQ6IG5vZGVSZWYucmVmID09PSAndk5vZGVCb3gnID8gc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJzJweCBzb2xpZCAjNTNCMkVEJyA6ICcycHggc29saWQgI2JkYmRiZCc6ICdub25lJywgdHJhbnNpdGlvbjogJ2JvcmRlci1jb2xvciAwLjJzJ30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3VzZW92ZXI6IHN0YXRlLmN1cnJlbnRseURyYWdnaW5nID8gW0RSQUdHRURfT1ZFUl9NRSwgbm9kZVJlZl0gOiB1bmRlZmluZWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4ubm9kZS5jaGlsZHJlbi5tYXAoKHJlZiwgaW5kZXgpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihyZWYucmVmID09PSAndk5vZGVUZXh0JykgcmV0dXJuIGxpc3RUZXh0Tm9kZShyZWYsIG5vZGVSZWYsIGluZGV4KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVmLnJlZiA9PT0gJ3ZOb2RlQm94JyB8fCByZWYucmVmID09PSAndk5vZGVMaXN0JyB8fCByZWYucmVmID09PSAndk5vZGVJZicpIHJldHVybiBsaXN0Qm94Tm9kZShyZWYsIG5vZGVSZWYsIGluZGV4KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVmLnJlZiA9PT0gJ3ZOb2RlSW5wdXQnKSByZXR1cm4gbGlzdElucHV0Tm9kZShyZWYsIG5vZGVSZWYsIGluZGV4KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBsaXN0VGV4dE5vZGUobm9kZVJlZiwgcGFyZW50UmVmLCBwb3NpdGlvbikge1xyXG4gICAgICAgICAgICBjb25zdCBub2RlSWQgPSBub2RlUmVmLmlkXHJcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudElkID0gcGFyZW50UmVmLmlkXHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBzdGF0ZS5kZWZpbml0aW9uLnZOb2RlVGV4dFtub2RlSWRdXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGVkaXRpbmdOb2RlKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2lucHV0Jywge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzUzQjJFRCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICdpbnNldCAwIC0xcHggMCAwICM1M0IyRUQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250OiAnaW5oZXJpdCdcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBbQ0hBTkdFX1ZJRVdfTk9ERV9USVRMRSwgbm9kZVJlZl0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBsaXZlUHJvcHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG5vZGUudGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBhdHRyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvZm9jdXM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLWlzdGl0bGVlZGl0b3InOiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb246IHtjbGljazogW1ZJRVdfTk9ERV9TRUxFQ1RFRCwgbm9kZVJlZl0sIGRibGNsaWNrOiBbRURJVF9WSUVXX05PREVfVElUTEUsIG5vZGVJZF19XHJcbiAgICAgICAgICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnc3ZnJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHt2aWV3Qm94OiAnMCAwIDMwMCAzMDAnLCB3aWR0aDogMTQsIGhlaWdodDogMTR9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcicsIHBhZGRpbmc6ICcwIDdweCAwIDAnfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgncGF0aCcsIHthdHRyczoge2Q6ICdNIDAgMCBMIDAgODUuODEyNSBMIDI3LjAzMTI1IDg1LjgxMjUgQyAzNi42MTc3ODYgNDQuMzQ2MzE2IDY3Ljg3NjU3OSA0Mi4xNzk3OTMgMTA2LjkwNjI1IDQyLjU5Mzc1IEwgMTA2LjkwNjI1IDIyOC4zNzUgQyAxMDcuMzExMDEgMjc5LjA5NjQxIDk4LjkwODM4NiAyNzcuMzM2MDIgNjIuMTI1IDI3Ny41IEwgNjIuMTI1IDI5OS41NjI1IEwgMTQ5IDI5OS41NjI1IEwgMTUwLjAzMTI1IDI5OS41NjI1IEwgMjM2LjkwNjI1IDI5OS41NjI1IEwgMjM2LjkwNjI1IDI3Ny41IEMgMjAwLjEyMjg2IDI3Ny4zMzYgMTkxLjcyMDI0IDI3OS4wOTYzOSAxOTIuMTI1IDIyOC4zNzUgTCAxOTIuMTI1IDQyLjU5Mzc1IEMgMjMxLjE1NDY3IDQyLjE3OTc1IDI2Mi40MTM0NiA0NC4zNDYzMDQgMjcyIDg1LjgxMjUgTCAyOTkuMDMxMjUgODUuODEyNSBMIDI5OS4wMzEyNSAwIEwgMTUwLjAzMTI1IDAgTCAxNDkgMCBMIDAgMCB6JywgZmlsbDogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJyM1M0IyRUQnOiAnI2JkYmRiZCd9fSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUuZWRpdGluZ1RpdGxlTm9kZUlkID09PSBub2RlSWQgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlZGl0aW5nTm9kZSgpOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7Y29sb3I6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJ3doaXRlJywgdHJhbnNpdGlvbjogJ2NvbG9yIDAuMnMnfX0sIG5vZGUudGl0bGUpLFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGxpc3RJbnB1dE5vZGUobm9kZVJlZiwgcGFyZW50UmVmLCBwb3NpdGlvbikge1xyXG4gICAgICAgICAgICBjb25zdCBub2RlSWQgPSBub2RlUmVmLmlkXHJcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudElkID0gcGFyZW50UmVmLmlkXHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBzdGF0ZS5kZWZpbml0aW9uLnZOb2RlSW5wdXRbbm9kZUlkXVxyXG4gICAgICAgICAgICBmdW5jdGlvbiBlZGl0aW5nTm9kZSgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBoKCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyM1M0IyRUQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm94U2hhZG93OiAnaW5zZXQgMCAtMXB4IDAgMCAjNTNCMkVEJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udDogJ2luaGVyaXQnXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogW0NIQU5HRV9WSUVXX05PREVfVElUTEUsIG5vZGVSZWZdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbGl2ZVByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBub2RlLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b2ZvY3VzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pc3RpdGxlZWRpdG9yJzogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZSdcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG9uOiB7Y2xpY2s6IFtWSUVXX05PREVfU0VMRUNURUQsIG5vZGVSZWZdLCBkYmxjbGljazogW0VESVRfVklFV19OT0RFX1RJVExFLCBub2RlSWRdfVxyXG4gICAgICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIGgoJ3N2ZycsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzOiB7dmlld0JveDogJzAgMCAxNiAxNicsIHdpZHRoOiAxNCwgaGVpZ2h0OiAxNH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJywgcGFkZGluZzogJzAgN3B4IDAgMCd9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdwYXRoJywge2F0dHJzOiB7ZDogJ00gMTUsMiAxMSwyIEMgMTAuNDQ3LDIgMTAsMS41NTIgMTAsMSAxMCwwLjQ0OCAxMC40NDcsMCAxMSwwIGwgNCwwIGMgMC41NTMsMCAxLDAuNDQ4IDEsMSAwLDAuNTUyIC0wLjQ0NywxIC0xLDEgeiBtIC0yLDE0IGMgLTAuNTUzLDAgLTEsLTAuNDQ3IC0xLC0xIEwgMTIsMSBjIDAsLTAuNTUyIDAuNDQ3LC0xIDEsLTEgMC41NTMsMCAxLDAuNDQ4IDEsMSBsIDAsMTQgYyAwLDAuNTUzIC0wLjQ0NywxIC0xLDEgeiBtIDIsMCAtNCwwIGMgLTAuNTUzLDAgLTEsLTAuNDQ3IC0xLC0xIDAsLTAuNTUzIDAuNDQ3LC0xIDEsLTEgbCA0LDAgYyAwLjU1MywwIDEsMC40NDcgMSwxIDAsMC41NTMgLTAuNDQ3LDEgLTEsMSB6JywgZmlsbDogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJyM1M0IyRUQnOiAnd2hpdGUnfX0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgncGF0aCcsIHthdHRyczoge2Q6ICdNIDkuODExNDgyNyw0LjIzNjAzOTMgQyA5LjY1NDczNTcsNC41ODY1OTA2IDkuMzAzOTkzMyw0LjgyOTU4NTQgOC44OTU3MjMzLDQuODI4ODY4NCBMIDEuMjk2ODkyNiw0LjgxMTU0MDQgMS4zMTY5NDM2LDIuODA2NDQ3IDguOTAwNjM3NywyLjgyODY0MiBjIDAuNTUyNDQ4LDAuMDAxNjUgMC45OTkzMDc0LDAuNDUwMTIyMyAwLjk5NzY1NjQsMS4wMDI1Njk4IC0yLjFlLTUsMC4xNDQ1ODU2IC0wLjAzMTMsMC4yODA2NzM0IC0wLjA4NjgxLDAuNDA0ODI3IHonLCBmaWxsOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnIzUzQjJFRCc6ICd3aGl0ZSd9fSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdwYXRoJywge2F0dHJzOiB7ZDogJ20gOS44MTE0ODI3LDExLjczODU2MiBjIC0wLjE1Njc0NywwLjM1MDU1MSAtMC41MDc0ODk0LDAuNTkzNTQ2IC0wLjkxNTc1OTQsMC41OTI4MjkgbCAtNy41OTg4MzA3LC0wLjAxNzMzIDAuMDIwMDUxLC0yLjAwNTA5MyA3LjU4MzY5NDEsMC4wMjIxOSBjIDAuNTUyNDQ4LDAuMDAxNiAwLjk5OTMwNzQsMC40NTAxMjIgMC45OTc2NTY0LDEuMDAyNTcgLTIuMWUtNSwwLjE0NDU4NSAtMC4wMzEzLDAuMjgwNjczIC0wLjA4NjgxLDAuNDA0ODI3IHonLCBmaWxsOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnIzUzQjJFRCc6ICd3aGl0ZSd9fSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdwYXRoJywge2F0dHJzOiB7ZDogJ20gMS4yOTQwNTgzLDEyLjIzOTgzNiAwLjAxNzA0LC05LjQ0NTA5NDcgMS45NzE0ODUyLDAuMDI0OTIzIC0wLjAyMTgxOCw5LjQyNjI3OTcgeicsIGZpbGw6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJ3doaXRlJ319KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUuZWRpdGluZ1RpdGxlTm9kZUlkID09PSBub2RlSWQgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlZGl0aW5nTm9kZSgpOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7Y29sb3I6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJ3doaXRlJywgdHJhbnNpdGlvbjogJ2NvbG9yIDAuMnMnfX0sIG5vZGUudGl0bGUpLFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwcm9wc0NvbXBvbmVudCA9IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IHN0YXRlLnNlbGVjdGVkVmlld1N1Yk1lbnUgPT09ICdwcm9wcycgPyAnIzRkNGQ0ZCc6ICcjM2QzZDNkJyxcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMnB4IDE1cHggOHB4JyxcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICAgICAgdG9wOiAnMCcsXHJcbiAgICAgICAgICAgICAgICBsZWZ0OiAnNnB4JyxcclxuICAgICAgICAgICAgICAgIHpJbmRleDogc3RhdGUuc2VsZWN0ZWRWaWV3U3ViTWVudSA9PT0gJ3Byb3BzJyA/ICc1MDAnOiAnMCcsXHJcbiAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzE1cHggMTVweCAwIDAnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjMjIyJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclN0eWxlOiAnc29saWQnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6ICczcHggM3B4IDAgM3B4JyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgIGNsaWNrOiBbU0VMRUNUX1ZJRVdfU1VCTUVOVSwgJ3Byb3BzJ11cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sICdwcm9wcycpXHJcbiAgICAgICAgY29uc3Qgc3R5bGVDb21wb25lbnQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBzdGF0ZS5zZWxlY3RlZFZpZXdTdWJNZW51ID09PSAnc3R5bGUnID8gJyM0ZDRkNGQnOiAnIzNkM2QzZCcsXHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTJweCAxNXB4IDhweCcsXHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgICAgIHRvcDogJzAnLFxyXG4gICAgICAgICAgICAgICAgbGVmdDogJzkxcHgnLFxyXG4gICAgICAgICAgICAgICAgekluZGV4OiBzdGF0ZS5zZWxlY3RlZFZpZXdTdWJNZW51ID09PSAnc3R5bGUnID8gJzUwMCc6ICcwJyxcclxuICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTVweCAxNXB4IDAgMCcsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyMyMjInLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyU3R5bGU6ICdzb2xpZCcsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogJzNweCAzcHggMCAzcHgnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgY2xpY2s6IFtTRUxFQ1RfVklFV19TVUJNRU5VLCAnc3R5bGUnXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgJ3N0eWxlJylcclxuICAgICAgICBjb25zdCBldmVudHNDb21wb25lbnQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBzdGF0ZS5zZWxlY3RlZFZpZXdTdWJNZW51ID09PSAnZXZlbnRzJyA/ICcjNGQ0ZDRkJzogJyMzZDNkM2QnLFxyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzEycHggMTVweCA4cHgnLFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgIGxlZnQ6ICcxNjVweCcsXHJcbiAgICAgICAgICAgICAgICB6SW5kZXg6IHN0YXRlLnNlbGVjdGVkVmlld1N1Yk1lbnUgPT09ICdldmVudHMnID8gJzUwMCc6ICcwJyxcclxuICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTVweCAxNXB4IDAgMCcsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyMyMjInLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyU3R5bGU6ICdzb2xpZCcsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogJzNweCAzcHggMCAzcHgnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgY2xpY2s6IFtTRUxFQ1RfVklFV19TVUJNRU5VLCAnZXZlbnRzJ11cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sICdldmVudHMnKVxyXG4gICAgICAgIGNvbnN0IHVuc2VsZWN0Q29tcG9uZW50ID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM0ZDRkNGQnLFxyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzE1cHggMjNweCA1cHgnLFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgIHJpZ2h0OiAnMTZweCcsXHJcbiAgICAgICAgICAgICAgICB6SW5kZXg6ICcxMDAnLFxyXG4gICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxNXB4IDE1cHggMCAwJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiAnIzIyMicsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJTdHlsZTogJ3NvbGlkJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcldpZHRoOiAnM3B4IDNweCAwIDNweCcsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICBjbGljazogW1VOU0VMRUNUX1ZJRVdfTk9ERV1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sICd4JylcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2VuZXJhdGVFZGl0Tm9kZUNvbXBvbmVudCgpIHtcclxuICAgICAgICAgICAgY29uc3Qgc3R5bGVzID0gWydiYWNrZ3JvdW5kJywgJ2JvcmRlcicsICdvdXRsaW5lJywgJ2N1cnNvcicsICdjb2xvcicsICdkaXNwbGF5JywgJ3RvcCcsICdib3R0b20nLCAnbGVmdCcsICdyaWdodCcsICdwb3NpdGlvbicsICdvdmVyZmxvdycsICdoZWlnaHQnLCAnd2lkdGgnLCAnZm9udCcsICdmb250JywgJ21hcmdpbicsICdwYWRkaW5nJywgJ3VzZXJTZWxlY3QnXVxyXG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZE5vZGUgPSBzdGF0ZS5kZWZpbml0aW9uW3N0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmXVtzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkXVxyXG4gICAgICAgICAgICBjb25zdCBnZW5wcm9wc1N1Ym1lbnVDb21wb25lbnQgPSAoKSA9PiBoKCdkaXYnLCBbKCgpPT57XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZUJveCcpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpblRvcDogJzEwMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnI2JkYmRiZCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sICdDb21wb25lbnQgaGFzIG5vIHByb3BzJylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZiA9PT0gJ3ZOb2RlVGV4dCcpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ1RvcDogJzIwcHgnfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM2NzY3NjcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc1cHggMTBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMTBweCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJ319LCAndGV4dCB2YWx1ZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzAnLCBjdXJzb3I6ICdkZWZhdWx0JywgY29sb3I6ICcjYmRiZGJkJ319LCAndGV4dCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nOiAnNXB4IDEwcHgnfX0sIFtlbWJlckVkaXRvcihzZWxlY3RlZE5vZGUudmFsdWUsICd0ZXh0JyldKVxyXG4gICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZUlucHV0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nVG9wOiAnMjBweCd9fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzY3Njc2NycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzVweCAxMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW5Cb3R0b206ICcxMHB4J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnfX0sICdpbnB1dCB2YWx1ZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzAnLCBjdXJzb3I6ICdkZWZhdWx0JywgY29sb3I6ICcjYmRiZGJkJ319LCAndGV4dCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nOiAnNXB4IDEwcHgnfX0sIFtlbWJlckVkaXRvcihzZWxlY3RlZE5vZGUudmFsdWUsICd0ZXh0JyldKVxyXG4gICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZUxpc3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW5Ub3A6ICcxMDBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyNiZGJkYmQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LCAnVE9ETyBBREQgUFJPUFMnKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmID09PSAndk5vZGVJZicpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpblRvcDogJzEwMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnI2JkYmRiZCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sICdUT0RPIEFERCBQUk9QUycpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKCldKVxyXG4gICAgICAgICAgICBjb25zdCBnZW5zdHlsZVN1Ym1lbnVDb21wb25lbnQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RlZFN0eWxlID0gc3RhdGUuZGVmaW5pdGlvbi5zdHlsZVtzZWxlY3RlZE5vZGUuc3R5bGUuaWRdXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2JywgW1xyXG4gICAgICAgICAgICAgICAgICAgICgoKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge3N0eWxlOiB7fX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhzZWxlY3RlZFN0eWxlKS5tYXAoKGtleSkgPT4gaCgnZGl2JywgW2goJ2lucHV0Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm94U2hhZG93OiAnaW5zZXQgMCAtMXB4IDAgMCB3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzE2MHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAnMTBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wczoge3ZhbHVlOiBzZWxlY3RlZFN0eWxlW2tleV19LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7aW5wdXQ6IFtDSEFOR0VfU1RZTEUsIHNlbGVjdGVkTm9kZS5zdHlsZS5pZCwga2V5XX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCBrZXkpXSkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICB9KSgpLFxyXG4gICAgICAgICAgICAgICAgICAgICgoKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge3N0eWxlOiB7fX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChrZXkpID0+ICFPYmplY3Qua2V5cyhzZWxlY3RlZFN0eWxlKS5pbmNsdWRlcyhrZXkpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKGtleSkgPT4gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbjoge2NsaWNrOiBbQUREX0RFRkFVTFRfU1RZTEUsIHNlbGVjdGVkTm9kZS5zdHlsZS5pZCwga2V5XX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNXB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJzNweCBzb2xpZCB3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnNXB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbjogJzVweCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICcrICcgKyBrZXkpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgfSkoKSxcclxuICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgZ2VuZXZlbnRzU3VibWVudUNvbXBvbmVudCA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBhdmFpbGFibGVFdmVudHMgPSBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ29uIGNsaWNrJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lOiAnY2xpY2snXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnZG91YmxlIGNsaWNrZWQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWU6ICdkYmxjbGljaydcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdtb3VzZSBvdmVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lOiAnbW91c2VvdmVyJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ21vdXNlIG91dCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZTogJ21vdXNlb3V0J1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZUlucHV0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIGF2YWlsYWJsZUV2ZW50cyA9IGF2YWlsYWJsZUV2ZW50cy5jb25jYXQoW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2lucHV0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZTogJ2lucHV0J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2ZvY3VzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZTogJ2ZvY3VzJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2JsdXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lOiAnYmx1cidcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudEV2ZW50cyA9IGF2YWlsYWJsZUV2ZW50cy5maWx0ZXIoKGV2ZW50KSA9PiBzZWxlY3RlZE5vZGVbZXZlbnQucHJvcGVydHlOYW1lXSlcclxuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50c0xlZnQgPSBhdmFpbGFibGVFdmVudHMuZmlsdGVyKChldmVudCkgPT4gIXNlbGVjdGVkTm9kZVtldmVudC5wcm9wZXJ0eU5hbWVdKVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nVG9wOiAnMjBweCd9fSwgZXZlbnRzTGVmdC5tYXAoKGV2ZW50KSA9PlxyXG4gICAgICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICczcHggc29saWQgIzViY2M1YicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzVweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnNXB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAnMTBweCdcclxuICAgICAgICAgICAgICAgICAgICB9LCBvbjoge2NsaWNrOiBbQUREX0VWRU5ULCBldmVudC5wcm9wZXJ0eU5hbWVdfVxyXG4gICAgICAgICAgICAgICAgfSwgJysgJyArIGV2ZW50LmRlc2NyaXB0aW9uKSxcclxuICAgICAgICAgICAgKS5jb25jYXQoY3VycmVudEV2ZW50cy5sZW5ndGggP1xyXG4gICAgICAgICAgICAgICAgY3VycmVudEV2ZW50cy5tYXAoKGV2ZW50KSA9PlxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7YmFja2dyb3VuZDogJyM2NzY3NjcnLCBwYWRkaW5nOiAnNXB4IDEwcHgnfX0sIGV2ZW50LmRlc2NyaXB0aW9uKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogc3RhdGUuYWN0aXZlRXZlbnQgPT09IHNlbGVjdGVkTm9kZVtldmVudC5wcm9wZXJ0eU5hbWVdLmlkID8gJyM1YmNjNWInIDogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2NvbG9yIDAuMnMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzAuOGVtJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc1cHggMTBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJveFNoYWRvdzogc3RhdGUuc2VsZWN0ZWRFdmVudElkID09PSBzZWxlY3RlZE5vZGVbZXZlbnQucHJvcGVydHlOYW1lXS5pZCA/ICcjNWJjYzViIDVweCAwIDBweCAwcHggaW5zZXQnIDogJ25vbmUnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGljazogW1NFTEVDVF9FVkVOVCwgc2VsZWN0ZWROb2RlW2V2ZW50LnByb3BlcnR5TmFtZV0uaWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYmxjbGljazogW0VESVRfRVZFTlRfVElUTEUsIHNlbGVjdGVkTm9kZVtldmVudC5wcm9wZXJ0eU5hbWVdLmlkXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge30sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ+KAoiAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQgPT09IHNlbGVjdGVkTm9kZVtldmVudC5wcm9wZXJ0eU5hbWVdLmlkID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2lucHV0Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm94U2hhZG93OiAnaW5zZXQgMCAtMXB4IDAgMCB3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnQ6ICdpbmhlcml0J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IFtDSEFOR0VfRVZFTlRfVElUTEUsIHNlbGVjdGVkTm9kZVtldmVudC5wcm9wZXJ0eU5hbWVdLmlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpdmVQcm9wczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogc3RhdGUuZGVmaW5pdGlvbi5ldmVudFtzZWxlY3RlZE5vZGVbZXZlbnQucHJvcGVydHlOYW1lXS5pZF0udGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvZm9jdXM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLWlzdGl0bGVlZGl0b3InOiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogc3RhdGUuZGVmaW5pdGlvbi5ldmVudFtzZWxlY3RlZE5vZGVbZXZlbnQucHJvcGVydHlOYW1lXS5pZF0udGl0bGVdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgXSkpIDpcclxuICAgICAgICAgICAgICAgIFtdKSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgZnVsbFZOb2RlID0gc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZUJveCcgfHwgc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZVRleHQnIHx8IHN0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmID09PSAndk5vZGVJbnB1dCdcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6ICctOHB4JyxcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUoLTEwMCUsIDApJyxcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW5SaWdodDogJzhweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYm90dG9tOiAnNnB4JyxcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICc1MCUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzEnLCBtYXhIZWlnaHQ6ICc0M3B4JywgbWluSGVpZ2h0OiAnNDNweCcsIHBvc2l0aW9uOiAncmVsYXRpdmUnLCBtYXJnaW5Ub3A6ICc2cHgnfX0sIGZ1bGxWTm9kZSA/IFtldmVudHNDb21wb25lbnQsIHN0eWxlQ29tcG9uZW50LCBwcm9wc0NvbXBvbmVudCwgdW5zZWxlY3RDb21wb25lbnRdOiBbdW5zZWxlY3RDb21wb25lbnRdKSxcclxuICAgICAgICAgICAgICAgIGgoJ2RpdicsIHthdHRyczoge2NsYXNzOiAnYmV0dGVyLXNjcm9sbGJhcid9LCBzdHlsZToge2ZsZXg6ICcxJywgb3ZlcmZsb3c6ICdhdXRvJywgYmFja2dyb3VuZDogJyM0ZDRkNGQnLCBib3JkZXJSYWRpdXM6ICcxMHB4Jywgd2lkdGg6IHN0YXRlLnN1YkVkaXRvcldpZHRoICsgJ3B4JywgYm9yZGVyOiAnM3B4IHNvbGlkICMyMjInfX0sW1xyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdTdWJDb21wb25lbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRWaWV3U3ViTWVudSA9PT0gJ3Byb3BzJyB8fCAhZnVsbFZOb2RlID8gZ2VucHJvcHNTdWJtZW51Q29tcG9uZW50KCk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLnNlbGVjdGVkVmlld1N1Yk1lbnUgPT09ICdzdHlsZScgPyBnZW5zdHlsZVN1Ym1lbnVDb21wb25lbnQoKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLnNlbGVjdGVkVmlld1N1Yk1lbnUgPT09ICdldmVudHMnID8gZ2VuZXZlbnRzU3VibWVudUNvbXBvbmVudCgpOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCAnRXJyb3IsIG5vIHN1Y2ggbWVudScpXHJcbiAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICBdKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYWRkU3RhdGVDb21wb25lbnQgPSBoKCdkaXYnLCB7c3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcicsIGZsZXg6ICcwIGF1dG8nLCBiYWNrZ3JvdW5kOiAnIzMzMycsIGhlaWdodDogJzQwcHgnLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInfX0sIFtcclxuICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJywgcGFkZGluZzogJzAgNXB4J319LCAnYWRkIHN0YXRlJylcclxuICAgICAgICBdKVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZW5lcmF0ZVNlbGVjdFZpZXdOb2RlQ29tcG9uZW50KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiAnMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICBib3R0b206ICcwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzUwJScsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgICAgICBoKCdkaXYnLCB7YXR0cnM6IHtjbGFzczogJ2JldHRlci1zY3JvbGxiYXInfSwgc3R5bGU6IHttYXJnaW46ICc0MHB4IDNweCAwIDAnLCBmbGV4OiAnMScsIG92ZXJmbG93OiAnYXV0bycsIGJhY2tncm91bmQ6ICcjMzMzJywgd2lkdGg6IHN0YXRlLmVkaXRvclJpZ2h0V2lkdGggKyAncHgnfX0sW1xyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmc6ICc1cHgnLCBtYXJnaW46ICc1cHgnfX0sICdkcmFnIGFuZCBkcm9wIGNvbXBvbmVudHMgaW50byB0aGUgY29tcG9uZW50IHRyZWUgb3IgaW50byBsaXZlIGFwcGxpY2F0aW9uJyksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7Y3Vyc29yOiAncG9pbnRlcicsIGJvcmRlclJhZGl1czogJzVweCcsIGJvcmRlcjogJzNweCBzb2xpZCAjNTNCMkVEJywgcGFkZGluZzogJzVweCcsIG1hcmdpbjogJzVweCd9LCBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW91c2Vkb3duOiBbTk9ERV9EUkFHR0VELCAnYm94J10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3VjaHN0YXJ0OiBbTk9ERV9EUkFHR0VELCAnYm94J10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH19LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnKyBib3gnXHJcbiAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtjdXJzb3I6ICdwb2ludGVyJywgYm9yZGVyUmFkaXVzOiAnNXB4JywgYm9yZGVyOiAnM3B4IHNvbGlkICM1M0IyRUQnLCBwYWRkaW5nOiAnNXB4JywgbWFyZ2luOiAnNXB4J30sIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3VzZWRvd246IFtOT0RFX0RSQUdHRUQsICd0ZXh0J10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3VjaHN0YXJ0OiBbTk9ERV9EUkFHR0VELCAndGV4dCddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJysgdGV4dCdcclxuICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2N1cnNvcjogJ3BvaW50ZXInLCBib3JkZXJSYWRpdXM6ICc1cHgnLCBib3JkZXI6ICczcHggc29saWQgIzUzQjJFRCcsIHBhZGRpbmc6ICc1cHgnLCBtYXJnaW46ICc1cHgnfSwgb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vdXNlZG93bjogW05PREVfRFJBR0dFRCwgJ2lucHV0J10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3VjaHN0YXJ0OiBbTk9ERV9EUkFHR0VELCAnaW5wdXQnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICcrIGlucHV0J1xyXG4gICAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICBdKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYWRkVmlld05vZGVDb21wb25lbnQgPSBoKCdkaXYnLCB7c3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcicsIGZsZXg6ICcwIGF1dG8nLCBiYWNrZ3JvdW5kOiAnIzMzMycsIGhlaWdodDogJzQwcHgnLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInfSwgb246IHtjbGljazogW1NIT1dfVklFV19OT0RFU119fSwgW1xyXG4gICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInLCBwYWRkaW5nOiAnMCA1cHgnfX0sICdhZGQgY29tcG9uZW50JylcclxuICAgICAgICBdKVxyXG5cclxuICAgICAgICBjb25zdCB2aWV3Q29tcG9uZW50ID0gaCgnZGl2Jywge2F0dHJzOiB7Y2xhc3M6ICdiZXR0ZXItc2Nyb2xsYmFyJ30sIHN0eWxlOiB7b3ZlcmZsb3c6ICdhdXRvJywgcG9zaXRpb246ICdyZWxhdGl2ZScsIGZsZXg6ICcxJywgcGFkZGluZzogJzZweCA4cHgnfSwgb246IHtjbGljazogW1VOU0VMRUNUX1ZJRVdfTk9ERV19fSwgW1xyXG4gICAgICAgICAgICBsaXN0Qm94Tm9kZSh7cmVmOiAndk5vZGVCb3gnLCBpZDonX3Jvb3ROb2RlJ30sIHt9KSxcclxuICAgICAgICBdKVxyXG5cclxuICAgICAgICBjb25zdCByaWdodENvbXBvbmVudCA9XHJcbiAgICAgICAgICAgIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnZml4ZWQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvcDogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0OiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udDogXCIzMDAgMS4yZW0gJ09wZW4gU2FucydcIixcclxuICAgICAgICAgICAgICAgICAgICBsaW5lSGVpZ2h0OiAnMS4yZW0nLFxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiBzdGF0ZS5lZGl0b3JSaWdodFdpZHRoICsgJ3B4JyxcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzRkNGQ0ZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYm94U2l6aW5nOiBcImJvcmRlci1ib3hcIixcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXJMZWZ0OiAnM3B4IHNvbGlkICMyMjInLFxyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICcwLjVzIHRyYW5zZm9ybScsXHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtOiBzdGF0ZS5yaWdodE9wZW4gPyAndHJhbnNsYXRlWigwKSB0cmFuc2xhdGVYKDAlKSc6ICd0cmFuc2xhdGVaKDApIHRyYW5zbGF0ZVgoMTAwJSknLFxyXG4gICAgICAgICAgICAgICAgICAgIHVzZXJTZWxlY3Q6ICdub25lJyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sIFtcclxuICAgICAgICAgICAgICAgIGRyYWdDb21wb25lbnRSaWdodCxcclxuICAgICAgICAgICAgICAgIGFkZFN0YXRlQ29tcG9uZW50LFxyXG4gICAgICAgICAgICAgICAgc3RhdGVDb21wb25lbnQsXHJcbiAgICAgICAgICAgICAgICBhZGRWaWV3Tm9kZUNvbXBvbmVudCxcclxuICAgICAgICAgICAgICAgIHZpZXdDb21wb25lbnQsXHJcbiAgICAgICAgICAgICAgICBzdGF0ZS5zaG93aW5nVmlld05vZGVzID8gZ2VuZXJhdGVTZWxlY3RWaWV3Tm9kZUNvbXBvbmVudCgpOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZiA/IGdlbmVyYXRlRWRpdE5vZGVDb21wb25lbnQoKTogaCgnc3BhbicpXHJcbiAgICAgICAgICAgIF0pXHJcblxyXG5cclxuICAgICAgICBjb25zdCB0b3BDb21wb25lbnQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBmbGV4OiAnMSBhdXRvJyxcclxuICAgICAgICAgICAgICAgIGhlaWdodDogJzc1cHgnLFxyXG4gICAgICAgICAgICAgICAgbWF4SGVpZ2h0OiAnNzVweCcsXHJcbiAgICAgICAgICAgICAgICBtaW5IZWlnaHQ6ICc3NXB4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjMjIyJyxcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6J2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgZm9udEZhbWlseTogXCInQ29tZm9ydGFhJywgc2Fucy1zZXJpZlwiLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICBoKCdhJywge3N0eWxlOiB7ZmxleDogJzAgYXV0bycsIHdpZHRoOiAnMTkwcHgnLCB0ZXh0RGVjb3JhdGlvbjogJ2luaGVyaXQnLCB1c2VyU2VsZWN0OiAnbm9uZSd9LCBhdHRyczoge2hyZWY6Jy9fZGV2J319LCBbXHJcbiAgICAgICAgICAgICAgICBoKCdpbWcnLHtzdHlsZTogeyBtYXJnaW46ICc3cHggLTJweCAtM3B4IDVweCcsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snfSwgYXR0cnM6IHtzcmM6ICcvaW1hZ2VzL2xvZ28yNTZ4MjU2LnBuZycsIGhlaWdodDogJzU3J319KSxcclxuICAgICAgICAgICAgICAgIGgoJ3NwYW4nLHtzdHlsZTogeyBmb250U2l6ZTonNDRweCcsICB2ZXJ0aWNhbEFsaWduOiAnYm90dG9tJywgY29sb3I6ICcjZmZmJ319LCAndWduaXMnKVxyXG4gICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgICAgIHRvcDogJzAnLFxyXG4gICAgICAgICAgICAgICAgcmlnaHQ6ICcwJyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjOWM0ODQ4JyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzEwcHgnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzE1cHggMjBweCcsXHJcbiAgICAgICAgICAgICAgICBtYXJnaW46ICcxM3B4JyxcclxuICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBSRVNFVF9BUFBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgJ3Jlc2V0IGRlbW8nKVxyXG4gICAgICAgIF0pXHJcbiAgICAgICAgY29uc3QgbGVmdENvbXBvbmVudCA9IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdmaXhlZCcsXHJcbiAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgIGxlZnQ6ICcwJyxcclxuICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBmb250OiBcIjMwMCAxLjJlbSAnT3BlbiBTYW5zJ1wiLFxyXG4gICAgICAgICAgICAgICAgbGluZUhlaWdodDogJzEuMmVtJyxcclxuICAgICAgICAgICAgICAgIHdpZHRoOiBzdGF0ZS5lZGl0b3JMZWZ0V2lkdGggKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM0ZDRkNGQnLFxyXG4gICAgICAgICAgICAgICAgYm94U2l6aW5nOiBcImJvcmRlci1ib3hcIixcclxuICAgICAgICAgICAgICAgIGJvcmRlclJpZ2h0OiAnM3B4IHNvbGlkICMyMjInLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJzAuNXMgdHJhbnNmb3JtJyxcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogc3RhdGUubGVmdE9wZW4gPyAndHJhbnNsYXRlWigwKSB0cmFuc2xhdGVYKDAlKSc6ICd0cmFuc2xhdGVaKDApIHRyYW5zbGF0ZVgoLTEwMCUpJyxcclxuICAgICAgICAgICAgICAgIHVzZXJTZWxlY3Q6ICdub25lJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgIGRyYWdDb21wb25lbnRMZWZ0LFxyXG4gICAgICAgICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBGUkVFWkVSX0NMSUNLRURcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGZsZXg6ICcwIGF1dG8nLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjMzMzJyxcclxuICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sIFtcclxuICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHsgcGFkZGluZzogJzE1cHggMTVweCAxMHB4IDE1cHgnLCBjb2xvcjogc3RhdGUuYXBwSXNGcm96ZW4gPyAncmdiKDkxLCAyMDQsIDkxKScgOiAncmdiKDIwNCwgOTEsIDkxKSd9fSwgc3RhdGUuYXBwSXNGcm96ZW4gPyAn4pa6JyA6ICfinZrinZonKSxcclxuICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICBhdHRyczoge2NsYXNzOiAnYmV0dGVyLXNjcm9sbGJhcid9LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsZXg6ICcxIGF1dG8nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJmbG93OiAnYXV0bydcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZXZlbnRTdGFja1xyXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoKGEpPT5hKVxyXG4gICAgICAgICAgICAgICAgICAgIC5yZXZlcnNlKClcclxuICAgICAgICAgICAgICAgICAgICAubWFwKGV2ZW50ID0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZTogeyBwYWRkaW5nOiAnNXB4JywgY29sb3I6ICcjZmZmZmZmJ319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5kZWZpbml0aW9uLmV2ZW50W2V2ZW50LmV2ZW50TmFtZV0udGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCBPYmplY3Qua2V5cyhldmVudC5tdXRhdGlvbnMpLm1hcChzdGF0ZUlkID0+IHN0YXRlLmRlZmluaXRpb24uc3RhdGVbc3RhdGVJZF0udGl0bGUgKyAnOiAnICsgZXZlbnQubXV0YXRpb25zW3N0YXRlSWRdLnRvU3RyaW5nKCkpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIF0pXHJcbiAgICAgICAgY29uc3QgcmVuZGVyVmlld0NvbXBvbmVudCA9IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgIGZsZXg6ICcxIGF1dG8nLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogYFxyXG4gICAgICAgICAgICAgICAgICAgIHJhZGlhbC1ncmFkaWVudChibGFjayA1JSwgdHJhbnNwYXJlbnQgMTYlKSAwIDAsXHJcbiAgICAgICAgICAgICAgICAgICAgcmFkaWFsLWdyYWRpZW50KGJsYWNrIDUlLCB0cmFuc3BhcmVudCAxNiUpIDhweCA4cHgsXHJcbiAgICAgICAgICAgICAgICAgICAgcmFkaWFsLWdyYWRpZW50KHJnYmEoMjU1LDI1NSwyNTUsLjEpIDUlLCB0cmFuc3BhcmVudCAyMCUpIDAgMXB4LFxyXG4gICAgICAgICAgICAgICAgICAgIHJhZGlhbC1ncmFkaWVudChyZ2JhKDI1NSwyNTUsMjU1LC4xKSA1JSwgdHJhbnNwYXJlbnQgMjAlKSA4cHggOXB4YCxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjonIzMzMycsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kU2l6ZTonMTZweCAxNnB4JyxcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVooMCknLFxyXG4gICAgICAgICAgICAgICAgZGlzcGxheToncmVsYXRpdmUnLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICdhdXRvJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZTogKCgpPT57XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkZXNpcmVkV2lkdGggPSAxOTIwXHJcbiAgICAgICAgICAgICAgICBjb25zdCBkZXNpcmVkSGVpZ2h0ID0gMTA4MFxyXG4gICAgICAgICAgICAgICAgY29uc3QgdG9wTWVudUhlaWdodCA9IDc1XHJcbiAgICAgICAgICAgICAgICBjb25zdCB3aWR0aExlZnQgPSB3aW5kb3cuaW5uZXJXaWR0aCAtIChzdGF0ZS5lZGl0b3JMZWZ0V2lkdGggKyBzdGF0ZS5lZGl0b3JSaWdodFdpZHRoKVxyXG4gICAgICAgICAgICAgICAgY29uc3QgaGVpZ2h0TGVmdCA9IHdpbmRvdy5pbm5lckhlaWdodCAtIHRvcE1lbnVIZWlnaHRcclxuICAgICAgICAgICAgICAgIGxldCBzY2FsZVggPSB3aWR0aExlZnQgPCBkZXNpcmVkV2lkdGggPyB3aWR0aExlZnQvZGVzaXJlZFdpZHRoOiAxXHJcbiAgICAgICAgICAgICAgICBsZXQgc2NhbGVZID0gaGVpZ2h0TGVmdCA8IGRlc2lyZWRIZWlnaHQgPyBoZWlnaHRMZWZ0L2Rlc2lyZWRIZWlnaHQ6IDFcclxuICAgICAgICAgICAgICAgIGlmKHNjYWxlWCA+IHNjYWxlWSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlWCA9IHNjYWxlWVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBzY2FsZVkgPSBzY2FsZVhcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGRlc2lyZWRXaWR0aCArJ3B4JyxcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGRlc2lyZWRIZWlnaHQgKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjZmZmZmZmJyxcclxuICAgICAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICdyZ2JhKDAsIDAsIDAsIDAuMjQ3MDU5KSAwcHggMTRweCA0NXB4LCByZ2JhKDAsIDAsIDAsIDAuMjE5NjA4KSAwcHggMTBweCAxOHB4JyxcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGVaKDApIHNjYWxlKCcrIHNjYWxlWCArICcsJysgc2NhbGVZICsnKScsXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAoaGVpZ2h0TGVmdC1kZXNpcmVkSGVpZ2h0KS8yICsgJ3B4JyxcclxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiAod2lkdGhMZWZ0LWRlc2lyZWRXaWR0aCkvMitzdGF0ZS5lZGl0b3JMZWZ0V2lkdGggKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KSgpfSwgW1xyXG4gICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7YmFja2dyb3VuZDogJyM5M2QxZjcnLCB3aWR0aDogJzEwMCUnLCBoZWlnaHQ6ICc0MHB4JywgcG9zaXRpb246J2Fic29sdXRlJywgdG9wOiAnLTQwcHgnLCBkaXNwbGF5OiAnZmxleCcsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGxlZnQ6ICcwJywgYm9yZGVyUmFkaXVzOiAnNXB4IDVweCAwIDAnLCBib3hTaGFkb3c6ICdpbnNldCAwIC0zcHggMCAwICNiN2I3YjcnfX0sICd0b2RvOiB1cmwsIHdpZHRoIGFuZCBoZWlnaHQsIGNsb3NlIGJ1dHRvbicpLFxyXG4gICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7b3ZlcmZsb3c6ICdhdXRvJywgd2lkdGg6ICcxMDAlJywgaGVpZ2h0OiAnMTAwJSd9fSwgW2FwcC52ZG9tXSlcclxuICAgICAgICAgICAgXSlcclxuICAgICAgICBdKVxyXG4gICAgICAgIGNvbnN0IG1haW5Sb3dDb21wb25lbnQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICBmbGV4OiAnMScsXHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVooMCknLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sIFtcclxuICAgICAgICAgICAgcmVuZGVyVmlld0NvbXBvbmVudCxcclxuICAgICAgICAgICAgbGVmdENvbXBvbmVudCxcclxuICAgICAgICAgICAgcmlnaHRDb21wb25lbnRcclxuICAgICAgICBdKVxyXG4gICAgICAgIGNvbnN0IHZub2RlID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2ZpeGVkJyxcclxuICAgICAgICAgICAgICAgIHRvcDogJzAnLFxyXG4gICAgICAgICAgICAgICAgcmlnaHQ6ICcwJyxcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwdncnLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwdmgnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sIFtcclxuICAgICAgICAgICAgdG9wQ29tcG9uZW50LFxyXG4gICAgICAgICAgICBtYWluUm93Q29tcG9uZW50LFxyXG4gICAgICAgIF0pXHJcblxyXG4gICAgICAgIG5vZGUgPSBwYXRjaChub2RlLCB2bm9kZSlcclxuICAgIH1cclxuXHJcbiAgICByZW5kZXIoKVxyXG59IiwiZnVuY3Rpb24gdXBkYXRlUHJvcHMob2xkVm5vZGUsIHZub2RlKSB7XHJcbiAgICB2YXIga2V5LCBjdXIsIG9sZCwgZWxtID0gdm5vZGUuZWxtLFxyXG4gICAgICAgIHByb3BzID0gdm5vZGUuZGF0YS5saXZlUHJvcHMgfHwge307XHJcbiAgICBmb3IgKGtleSBpbiBwcm9wcykge1xyXG4gICAgICAgIGN1ciA9IHByb3BzW2tleV07XHJcbiAgICAgICAgb2xkID0gZWxtW2tleV07XHJcbiAgICAgICAgaWYgKG9sZCAhPT0gY3VyKSBlbG1ba2V5XSA9IGN1cjtcclxuICAgIH1cclxufVxyXG5jb25zdCBsaXZlUHJvcHNQbHVnaW4gPSB7Y3JlYXRlOiB1cGRhdGVQcm9wcywgdXBkYXRlOiB1cGRhdGVQcm9wc307XHJcbmltcG9ydCBzbmFiYmRvbSBmcm9tICdzbmFiYmRvbSdcclxuY29uc3QgcGF0Y2ggPSBzbmFiYmRvbS5pbml0KFtcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvY2xhc3MnKSxcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvcHJvcHMnKSxcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvc3R5bGUnKSxcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvZXZlbnRsaXN0ZW5lcnMnKSxcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvYXR0cmlidXRlcycpLFxyXG4gICAgbGl2ZVByb3BzUGx1Z2luXHJcbl0pO1xyXG5pbXBvcnQgaCBmcm9tICdzbmFiYmRvbS9oJztcclxuaW1wb3J0IGJpZyBmcm9tICdiaWcuanMnO1xyXG5cclxuZnVuY3Rpb24gZmxhdHRlbihhcnIpIHtcclxuICAgIHJldHVybiBhcnIucmVkdWNlKGZ1bmN0aW9uIChmbGF0LCB0b0ZsYXR0ZW4pIHtcclxuICAgICAgICByZXR1cm4gZmxhdC5jb25jYXQoQXJyYXkuaXNBcnJheSh0b0ZsYXR0ZW4pID8gZmxhdHRlbih0b0ZsYXR0ZW4pIDogdG9GbGF0dGVuKTtcclxuICAgIH0sIFtdKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgKGRlZmluaXRpb24pID0+IHtcclxuXHJcbiAgICBsZXQgY3VycmVudFN0YXRlID0gT2JqZWN0LmtleXMoZGVmaW5pdGlvbi5zdGF0ZSkubWFwKGtleT0+ZGVmaW5pdGlvbi5zdGF0ZVtrZXldKS5yZWR1Y2UoKGFjYywgZGVmKT0+IHtcclxuICAgICAgICBhY2NbZGVmLnJlZl0gPSBkZWYuZGVmYXVsdFZhbHVlXHJcbiAgICAgICAgcmV0dXJuIGFjY1xyXG4gICAgfSwge30pXHJcblxyXG4gICAgLy8gQWxsb3dzIHN0b3BpbmcgYXBwbGljYXRpb24gaW4gZGV2ZWxvcG1lbnQuIFRoaXMgaXMgbm90IGFuIGFwcGxpY2F0aW9uIHN0YXRlXHJcbiAgICBsZXQgZnJvemVuID0gZmFsc2VcclxuICAgIGxldCBmcm96ZW5DYWxsYmFjayA9IG51bGxcclxuICAgIGxldCBzZWxlY3RIb3ZlckFjdGl2ZSA9IGZhbHNlXHJcbiAgICBsZXQgc2VsZWN0ZWROb2RlSW5EZXZlbG9wbWVudCA9IHt9XHJcblxyXG4gICAgZnVuY3Rpb24gc2VsZWN0Tm9kZUhvdmVyKHJlZiwgZSkge1xyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICBzZWxlY3RlZE5vZGVJbkRldmVsb3BtZW50ID0gcmVmXHJcbiAgICAgICAgZnJvemVuQ2FsbGJhY2socmVmKVxyXG4gICAgICAgIHJlbmRlcigpXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBzZWxlY3ROb2RlQ2xpY2socmVmLCBlKSB7XHJcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIHNlbGVjdEhvdmVyQWN0aXZlID0gZmFsc2VcclxuICAgICAgICBzZWxlY3RlZE5vZGVJbkRldmVsb3BtZW50ID0gcmVmXHJcbiAgICAgICAgZnJvemVuQ2FsbGJhY2socmVmKVxyXG4gICAgICAgIHJlbmRlcigpXHJcbiAgICB9XHJcblxyXG4gICAgLy8gZ2xvYmFsIHN0YXRlIGZvciByZXNvbHZlclxyXG4gICAgbGV0IGN1cnJlbnRFdmVudCA9IG51bGxcclxuICAgIGxldCBjdXJyZW50TWFwVmFsdWUgPSB7fVxyXG4gICAgbGV0IGN1cnJlbnRNYXBJbmRleCA9IHt9XHJcbiAgICBsZXQgZXZlbnREYXRhID0ge31cclxuICAgIGZ1bmN0aW9uIHJlc29sdmUocmVmKXtcclxuICAgICAgICBpZihyZWYgPT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBzdGF0aWMgdmFsdWUgKHN0cmluZy9udW1iZXIpXHJcbiAgICAgICAgaWYocmVmLnJlZiA9PT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgcmV0dXJuIHJlZlxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBkZWYgPSBkZWZpbml0aW9uW3JlZi5yZWZdW3JlZi5pZF1cclxuICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3BpcGUnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwaXBlKHJlZilcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdjb25kaXRpb25hbCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZGVmLnByZWRpY2F0ZSkgPyByZXNvbHZlKGRlZi50aGVuKSA6IHJlc29sdmUoZGVmLmVsc2UpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWYucmVmID09PSAnc3RhdGUnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50U3RhdGVbcmVmLmlkXVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3ZOb2RlQm94Jykge1xyXG4gICAgICAgICAgICByZXR1cm4gYm94Tm9kZShyZWYpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWYucmVmID09PSAndk5vZGVUZXh0Jykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGV4dE5vZGUocmVmKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3ZOb2RlSW5wdXQnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpbnB1dE5vZGUocmVmKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3ZOb2RlTGlzdCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGxpc3ROb2RlKHJlZilcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICd2Tm9kZUlmJykge1xyXG4gICAgICAgICAgICByZXR1cm4gaWZOb2RlKHJlZilcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdzdHlsZScpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGRlZikucmVkdWNlKChhY2MsIHZhbCk9PiB7XHJcbiAgICAgICAgICAgICAgICBhY2NbdmFsXSA9IHJlc29sdmUoZGVmW3ZhbF0pXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYWNjXHJcbiAgICAgICAgICAgIH0sIHt9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ2V2ZW50RGF0YScpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGV2ZW50RGF0YVtyZWYuaWRdXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWYucmVmID09PSAnbGlzdFZhbHVlJykge1xyXG4gICAgICAgICAgICByZXR1cm4gY3VycmVudE1hcFZhbHVlW2RlZi5saXN0LmlkXVtkZWYucHJvcGVydHldXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRocm93IEVycm9yKHJlZilcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB0cmFuc2Zvcm1WYWx1ZSh2YWx1ZSwgdHJhbnNmb3JtYXRpb25zKXtcclxuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdHJhbnNmb3JtYXRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlZiA9IHRyYW5zZm9ybWF0aW9uc1tpXTtcclxuICAgICAgICAgICAgY29uc3QgdHJhbnNmb3JtZXIgPSBkZWZpbml0aW9uW3JlZi5yZWZdW3JlZi5pZF1cclxuICAgICAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdlcXVhbCcpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBhcmVWYWx1ZSA9IHJlc29sdmUodHJhbnNmb3JtZXIudmFsdWUpXHJcbiAgICAgICAgICAgICAgICBpZih2YWx1ZSBpbnN0YW5jZW9mIGJpZyB8fCBjb21wYXJlVmFsdWUgaW5zdGFuY2VvZiBiaWcpe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gYmlnKHZhbHVlKS5lcShjb21wYXJlVmFsdWUpXHJcbiAgICAgICAgICAgICAgICB9IGVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PT0gY29tcGFyZVZhbHVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdhZGQnKSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGJpZyh2YWx1ZSkucGx1cyhyZXNvbHZlKHRyYW5zZm9ybWVyLnZhbHVlKSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3N1YnRyYWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBiaWcodmFsdWUpLm1pbnVzKHJlc29sdmUodHJhbnNmb3JtZXIudmFsdWUpKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZWYucmVmID09PSAnbXVsdGlwbHknKSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGJpZyh2YWx1ZSkudGltZXMocmVzb2x2ZSh0cmFuc2Zvcm1lci52YWx1ZSkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdkaXZpZGUnKSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGJpZyh2YWx1ZSkuZGl2KHJlc29sdmUodHJhbnNmb3JtZXIudmFsdWUpKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZWYucmVmID09PSAncmVtYWluZGVyJykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBiaWcodmFsdWUpLm1vZChyZXNvbHZlKHRyYW5zZm9ybWVyLnZhbHVlKSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ2JyYW5jaCcpIHtcclxuICAgICAgICAgICAgICAgIGlmKHJlc29sdmUodHJhbnNmb3JtZXIucHJlZGljYXRlKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB0cmFuc2Zvcm1WYWx1ZSh2YWx1ZSwgdHJhbnNmb3JtZXIudGhlbilcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB0cmFuc2Zvcm1WYWx1ZSh2YWx1ZSwgdHJhbnNmb3JtZXIuZWxzZSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ2pvaW4nKSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLmNvbmNhdChyZXNvbHZlKHRyYW5zZm9ybWVyLnZhbHVlKSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3RvVXBwZXJDYXNlJykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1VwcGVyQ2FzZSgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlZi5yZWYgPT09ICd0b0xvd2VyQ2FzZScpIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZWYucmVmID09PSAndG9UZXh0Jykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1N0cmluZygpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBpcGUocmVmKSB7XHJcbiAgICAgICAgY29uc3QgZGVmID0gZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdXHJcbiAgICAgICAgcmV0dXJuIHRyYW5zZm9ybVZhbHVlKHJlc29sdmUoZGVmLnZhbHVlKSwgZGVmLnRyYW5zZm9ybWF0aW9ucylcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBib3hOb2RlKHJlZikge1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBkZWZpbml0aW9uW3JlZi5yZWZdW3JlZi5pZF1cclxuICAgICAgICBjb25zdCBkYXRhID0ge1xyXG4gICAgICAgICAgICBzdHlsZTogZnJvemVuICYmIHNlbGVjdGVkTm9kZUluRGV2ZWxvcG1lbnQuaWQgPT09IHJlZi5pZCA/IHsuLi5yZXNvbHZlKG5vZGUuc3R5bGUpLCB0cmFuc2l0aW9uOidvdXRsaW5lIDAuMXMnLG91dGxpbmU6ICczcHggc29saWQgIzM1OTBkZid9IDogcmVzb2x2ZShub2RlLnN0eWxlKSxcclxuICAgICAgICAgICAgb246IGZyb3plbiA/XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VvdmVyOiBzZWxlY3RIb3ZlckFjdGl2ZSA/IFtzZWxlY3ROb2RlSG92ZXIsIHJlZl06IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBjbGljazogW3NlbGVjdE5vZGVDbGljaywgcmVmXVxyXG4gICAgICAgICAgICAgICAgfTp7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xpY2s6IG5vZGUuY2xpY2sgPyBbZW1pdEV2ZW50LCBub2RlLmNsaWNrXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBkYmxjbGljazogbm9kZS5kYmxjbGljayA/IFtlbWl0RXZlbnQsIG5vZGUuZGJsY2xpY2tdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlb3Zlcjogbm9kZS5tb3VzZW92ZXIgPyBbZW1pdEV2ZW50LCBub2RlLm1vdXNlb3Zlcl0gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VvdXQ6IG5vZGUubW91c2VvdXQgPyBbZW1pdEV2ZW50LCBub2RlLm1vdXNlb3V0XSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBoKCdkaXYnLCBkYXRhLCBmbGF0dGVuKG5vZGUuY2hpbGRyZW4ubWFwKHJlc29sdmUpKSlcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpZk5vZGUocmVmKSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IGRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXVxyXG4gICAgICAgIHJldHVybiByZXNvbHZlKG5vZGUudmFsdWUpID8gbm9kZS5jaGlsZHJlbi5tYXAocmVzb2x2ZSk6IFtdXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdGV4dE5vZGUocmVmKSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IGRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXVxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSB7XHJcbiAgICAgICAgICAgIHN0eWxlOiBmcm96ZW4gJiYgc2VsZWN0ZWROb2RlSW5EZXZlbG9wbWVudC5pZCA9PT0gcmVmLmlkID8gey4uLnJlc29sdmUobm9kZS5zdHlsZSksIHRyYW5zaXRpb246J291dGxpbmUgMC4xcycsb3V0bGluZTogJzNweCBzb2xpZCAjMzU5MGRmJ30gOiByZXNvbHZlKG5vZGUuc3R5bGUpLFxyXG4gICAgICAgICAgICBvbjogZnJvemVuID9cclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZW92ZXI6IHNlbGVjdEhvdmVyQWN0aXZlID8gW3NlbGVjdE5vZGVIb3ZlciwgcmVmXTogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBbc2VsZWN0Tm9kZUNsaWNrLCByZWZdXHJcbiAgICAgICAgICAgICAgICB9OntcclxuICAgICAgICAgICAgICAgICAgICBjbGljazogbm9kZS5jbGljayA/IFtlbWl0RXZlbnQsIG5vZGUuY2xpY2tdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGRibGNsaWNrOiBub2RlLmRibGNsaWNrID8gW2VtaXRFdmVudCwgbm9kZS5kYmxjbGlja10gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VvdmVyOiBub2RlLm1vdXNlb3ZlciA/IFtlbWl0RXZlbnQsIG5vZGUubW91c2VvdmVyXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZW91dDogbm9kZS5tb3VzZW91dCA/IFtlbWl0RXZlbnQsIG5vZGUubW91c2VvdXRdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGgoJ3NwYW4nLCBkYXRhLCByZXNvbHZlKG5vZGUudmFsdWUpKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGlucHV0Tm9kZShyZWYpIHtcclxuICAgICAgICBjb25zdCBub2RlID0gZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdXHJcbiAgICAgICAgY29uc3QgZGF0YSA9IHtcclxuICAgICAgICAgICAgc3R5bGU6IGZyb3plbiAmJiBzZWxlY3RlZE5vZGVJbkRldmVsb3BtZW50LmlkID09PSByZWYuaWQgPyB7Li4ucmVzb2x2ZShub2RlLnN0eWxlKSwgdHJhbnNpdGlvbjonb3V0bGluZSAwLjFzJyxvdXRsaW5lOiAnM3B4IHNvbGlkICMzNTkwZGYnfSA6IHJlc29sdmUobm9kZS5zdHlsZSksXHJcbiAgICAgICAgICAgIG9uOiBmcm96ZW4gP1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlb3Zlcjogc2VsZWN0SG92ZXJBY3RpdmUgPyBbc2VsZWN0Tm9kZUhvdmVyLCByZWZdOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xpY2s6IFtzZWxlY3ROb2RlQ2xpY2ssIHJlZl1cclxuICAgICAgICAgICAgICAgIH06e1xyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBub2RlLmNsaWNrID8gW2VtaXRFdmVudCwgbm9kZS5jbGlja10gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IG5vZGUuaW5wdXQgPyBbZW1pdEV2ZW50LCBub2RlLmlucHV0XSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBkYmxjbGljazogbm9kZS5kYmxjbGljayA/IFtlbWl0RXZlbnQsIG5vZGUuZGJsY2xpY2tdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlb3Zlcjogbm9kZS5tb3VzZW92ZXIgPyBbZW1pdEV2ZW50LCBub2RlLm1vdXNlb3Zlcl0gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VvdXQ6IG5vZGUubW91c2VvdXQgPyBbZW1pdEV2ZW50LCBub2RlLm1vdXNlb3V0XSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBmb2N1czogbm9kZS5mb2N1cyA/IFtlbWl0RXZlbnQsIG5vZGUuZm9jdXNdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGJsdXI6IG5vZGUuYmx1ciA/IFtlbWl0RXZlbnQsIG5vZGUuYmx1cl0gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHJlc29sdmUobm9kZS52YWx1ZSksXHJcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogbm9kZS5wbGFjZWhvbGRlclxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBoKCdpbnB1dCcsIGRhdGEpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbGlzdE5vZGUocmVmKSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IGRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXVxyXG4gICAgICAgIGNvbnN0IGxpc3QgPSByZXNvbHZlKG5vZGUudmFsdWUpXHJcblxyXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gT2JqZWN0LmtleXMobGlzdCkubWFwKGtleT0+bGlzdFtrZXldKS5tYXAoKHZhbHVlLCBpbmRleCk9PiB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRNYXBWYWx1ZVtyZWYuaWRdID0gdmFsdWVcclxuICAgICAgICAgICAgY3VycmVudE1hcEluZGV4W3JlZi5pZF0gPSBpbmRleFxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG5vZGUuY2hpbGRyZW4ubWFwKHJlc29sdmUpXHJcbiAgICAgICAgfSlcclxuICAgICAgICBkZWxldGUgY3VycmVudE1hcFZhbHVlW3JlZi5pZF07XHJcbiAgICAgICAgZGVsZXRlIGN1cnJlbnRNYXBJbmRleFtyZWYuaWRdO1xyXG5cclxuICAgICAgICByZXR1cm4gY2hpbGRyZW5cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBsaXN0ZW5lcnMgPSBbXVxyXG5cclxuICAgIGZ1bmN0aW9uIGFkZExpc3RlbmVyKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gbGlzdGVuZXJzLnB1c2goY2FsbGJhY2spXHJcblxyXG4gICAgICAgIC8vIGZvciB1bnN1YnNjcmliaW5nXHJcbiAgICAgICAgcmV0dXJuICgpID0+IGxpc3RlbmVycy5zcGxpY2UobGVuZ3RoIC0gMSwgMSlcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBlbWl0RXZlbnQoZXZlbnRSZWYsIGUpIHtcclxuICAgICAgICBjb25zdCBldmVudElkID0gZXZlbnRSZWYuaWRcclxuICAgICAgICBjb25zdCBldmVudCA9IGRlZmluaXRpb24uZXZlbnRbZXZlbnRJZF1cclxuICAgICAgICBjdXJyZW50RXZlbnQgPSBlXHJcbiAgICAgICAgZXZlbnQuZGF0YS5mb3JFYWNoKChyZWYpPT57XHJcbiAgICAgICAgICAgIGlmKHJlZi5pZCA9PT0gJ19pbnB1dCcpe1xyXG4gICAgICAgICAgICAgICAgZXZlbnREYXRhW3JlZi5pZF0gPSBlLnRhcmdldC52YWx1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICBjb25zdCBwcmV2aW91c1N0YXRlID0gY3VycmVudFN0YXRlXHJcbiAgICAgICAgbGV0IG11dGF0aW9ucyA9IHt9XHJcbiAgICAgICAgZGVmaW5pdGlvbi5ldmVudFtldmVudElkXS5tdXRhdG9ycy5mb3JFYWNoKChyZWYpPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBtdXRhdG9yID0gZGVmaW5pdGlvbi5tdXRhdG9yW3JlZi5pZF1cclxuICAgICAgICAgICAgY29uc3Qgc3RhdGUgPSBtdXRhdG9yLnN0YXRlXHJcbiAgICAgICAgICAgIG11dGF0aW9uc1tzdGF0ZS5pZF0gPSByZXNvbHZlKG11dGF0b3IubXV0YXRpb24pXHJcbiAgICAgICAgfSlcclxuICAgICAgICBjdXJyZW50U3RhdGUgPSBPYmplY3QuYXNzaWduKHt9LCBjdXJyZW50U3RhdGUsIG11dGF0aW9ucylcclxuICAgICAgICBsaXN0ZW5lcnMuZm9yRWFjaChjYWxsYmFjayA9PiBjYWxsYmFjayhldmVudElkLCBldmVudERhdGEsIGUsIHByZXZpb3VzU3RhdGUsIGN1cnJlbnRTdGF0ZSwgbXV0YXRpb25zKSlcclxuICAgICAgICBjdXJyZW50RXZlbnQgPSB7fVxyXG4gICAgICAgIGV2ZW50RGF0YSA9IHt9XHJcbiAgICAgICAgaWYoT2JqZWN0LmtleXMobXV0YXRpb25zKS5sZW5ndGgpe1xyXG4gICAgICAgICAgICByZW5kZXIoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBsZXQgdmRvbSA9IHJlc29sdmUoe3JlZjondk5vZGVCb3gnLCBpZDonX3Jvb3ROb2RlJ30pXHJcbiAgICBmdW5jdGlvbiByZW5kZXIobmV3RGVmaW5pdGlvbikge1xyXG4gICAgICAgIGlmKG5ld0RlZmluaXRpb24pe1xyXG4gICAgICAgICAgICBpZihkZWZpbml0aW9uLnN0YXRlICE9PSBuZXdEZWZpbml0aW9uLnN0YXRlKXtcclxuICAgICAgICAgICAgICAgIGRlZmluaXRpb24gPSBuZXdEZWZpbml0aW9uXHJcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdTdGF0ZSA9IE9iamVjdC5rZXlzKGRlZmluaXRpb24uc3RhdGUpLm1hcChrZXk9PmRlZmluaXRpb24uc3RhdGVba2V5XSkucmVkdWNlKChhY2MsIGRlZik9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWNjW2RlZi5yZWZdID0gZGVmLmRlZmF1bHRWYWx1ZVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhY2NcclxuICAgICAgICAgICAgICAgIH0sIHt9KVxyXG4gICAgICAgICAgICAgICAgY3VycmVudFN0YXRlID0gey4uLm5ld1N0YXRlLCAuLi5jdXJyZW50U3RhdGV9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkZWZpbml0aW9uID0gbmV3RGVmaW5pdGlvblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG5ld3Zkb20gPSByZXNvbHZlKHtyZWY6J3ZOb2RlQm94JywgaWQ6J19yb290Tm9kZSd9KVxyXG4gICAgICAgIHBhdGNoKHZkb20sIG5ld3Zkb20pXHJcbiAgICAgICAgdmRvbSA9IG5ld3Zkb21cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBfZnJlZXplKGlzRnJvemVuLCBjYWxsYmFjaywgbm9kZUlkKSB7XHJcbiAgICAgICAgZnJvemVuQ2FsbGJhY2sgPSBjYWxsYmFja1xyXG4gICAgICAgIHNlbGVjdGVkTm9kZUluRGV2ZWxvcG1lbnQgPSBub2RlSWRcclxuICAgICAgICBpZihmcm96ZW4gPT09IGZhbHNlICYmIGlzRnJvemVuID09PSB0cnVlKXtcclxuICAgICAgICAgICAgc2VsZWN0SG92ZXJBY3RpdmUgPSB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKGZyb3plbiB8fCBmcm96ZW4gIT09IGlzRnJvemVuKXtcclxuICAgICAgICAgICAgZnJvemVuID0gaXNGcm96ZW5cclxuICAgICAgICAgICAgcmVuZGVyKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0Q3VycmVudFN0YXRlKCkge1xyXG4gICAgICAgIHJldHVybiBjdXJyZW50U3RhdGVcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzZXRDdXJyZW50U3RhdGUobmV3U3RhdGUpIHtcclxuICAgICAgICBjdXJyZW50U3RhdGUgPSBuZXdTdGF0ZVxyXG4gICAgICAgIHJlbmRlcigpXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBkZWZpbml0aW9uLFxyXG4gICAgICAgIHZkb20sXHJcbiAgICAgICAgZ2V0Q3VycmVudFN0YXRlLFxyXG4gICAgICAgIHNldEN1cnJlbnRTdGF0ZSxcclxuICAgICAgICByZW5kZXIsXHJcbiAgICAgICAgZW1pdEV2ZW50LFxyXG4gICAgICAgIGFkZExpc3RlbmVyLFxyXG4gICAgICAgIF9mcmVlemUsXHJcbiAgICAgICAgX3Jlc29sdmU6IHJlc29sdmUsXHJcbiAgICB9XHJcbn0iLCJtb2R1bGUuZXhwb3J0cz17XHJcbiAgICBcImV2ZW50RGF0YVwiOiB7XHJcbiAgICAgICAgXCJfaW5wdXRcIjoge1xyXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwiaW5wdXQgdmFsdWVcIixcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwidG9Mb3dlckNhc2VcIjoge30sXHJcbiAgICBcInRvVXBwZXJDYXNlXCI6IHt9LFxyXG4gICAgXCJjb25kaXRpb25hbFwiOiB7fSxcclxuICAgIFwiZXF1YWxcIjoge1xyXG4gICAgICAgIFwiYTcyNTFhZjAtNTBhNy00ODIzLTg1YTAtNjZjZTA5ZDhhM2NjXCI6IHtcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJlZTI0MjNlNi01YjQ4LTQxYWUtOGNjZi02YTJjN2I0NmQyZjhcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwibm90XCI6IHt9LFxyXG4gICAgXCJsaXN0XCI6IHt9LFxyXG4gICAgXCJ0b1RleHRcIjoge1xyXG4gICAgICAgIFwiN2JzOWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHt9XHJcbiAgICB9LFxyXG4gICAgXCJsaXN0VmFsdWVcIjoge1xyXG4gICAgICAgIFwicHo3aGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgICAgIFwibGlzdFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInZOb2RlTGlzdFwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcImZsODlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwicHJvcGVydHlcIjogXCJ4XCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiaGo5d2Q2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgICAgIFwibGlzdFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInZOb2RlTGlzdFwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcImZsODlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwicHJvcGVydHlcIjogXCJ5XCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiaGhyOGI2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICBcImxpc3RcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZUxpc3RcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJmbDg5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjVcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInByb3BlcnR5XCI6IFwiY29sb3JcIlxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcInBpcGVcIjoge1xyXG4gICAgICAgIFwiZnc4amQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IFwiQ3VycmVudCB2YWx1ZTogXCIsXHJcbiAgICAgICAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcImpvaW5cIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwicDlzM2Q2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJ1bTVlZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJzdGF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcIjQ2dmRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcInRvVGV4dFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCI3YnM5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInVpOGpkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIitcIixcclxuICAgICAgICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiYzh3ZWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IFwiLVwiLFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJwZHE2ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInN0YXRlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiNDZ2ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwiYWRkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcInc4NmZkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiNDUycWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJzdGF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcIjQ2dmRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcInN1YnRyYWN0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcInU0M3dkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiZXc4M2Q2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjogMSxcclxuICAgICAgICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwidzNlOWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjogMSxcclxuICAgICAgICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiM3FraWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IDAsXHJcbiAgICAgICAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcImFkZFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJ3YnI3ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcInRvVGV4dFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJub29wXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJqb2luXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcInMyNThkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwidDd2cWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IDAsXHJcbiAgICAgICAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcImFkZFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJ2cThkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcInRvVGV4dFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJub29wXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJqb2luXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIndmOWFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiOGNxNmI2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwibGlzdFZhbHVlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiaGhyOGI2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiZjlxeGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwidGFibGVcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInN0YXRlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiYzhxOWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwicXd3OWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IFwicHhcIixcclxuICAgICAgICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwicWR3N2M2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IFwicHhcIixcclxuICAgICAgICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiODQzNjlhYmEtNGE0ZC00OTMyLThhOWEtOGY5Y2E5NDhiNmEyXCI6IHtcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IFwiVGhlIG51bWJlciBub3cgaXMgZXZlblwiLFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJjMmZiOWE5Yi0yNWJiLTRlOGItODBjMC1jZjUxYjg1MDYwNzBcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJib29sZWFuXCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJzdGF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcIjQ2dmRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcInJlbWFpbmRlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCIzNDc4MGQyMi1mNTIxLTRjMzAtODlhNS0zZTdmNWI1YWY3YzJcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcImVxdWFsXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcImE3MjUxYWYwLTUwYTctNDgyMy04NWEwLTY2Y2UwOWQ4YTNjY1wiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiMTIyOWQ0NzgtYmMyNS00NDAxLThhODktNzRmYzZjZmU4OTk2XCI6IHtcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjogMixcclxuICAgICAgICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiZWUyNDIzZTYtNWI0OC00MWFlLThjY2YtNmEyYzdiNDZkMmY4XCI6IHtcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjogMCxcclxuICAgICAgICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJqb2luXCI6IHtcclxuICAgICAgICBcInA5czNkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwidW01ZWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJ3ZjlhZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcInF3dzlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiczI1OGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJxZHc3YzZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiYWRkXCI6IHtcclxuICAgICAgICBcInc4NmZkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiZXc4M2Q2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJ3YnI3ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwibGlzdFZhbHVlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwicHo3aGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJ2cThkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwibGlzdFZhbHVlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiaGo5d2Q2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcInN1YnRyYWN0XCI6IHtcclxuICAgICAgICBcInU0M3dkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwidzNlOWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcInJlbWFpbmRlclwiOiB7XHJcbiAgICAgICAgXCIzNDc4MGQyMi1mNTIxLTRjMzAtODlhNS0zZTdmNWI1YWY3YzJcIjoge1xyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcIjEyMjlkNDc4LWJjMjUtNDQwMS04YTg5LTc0ZmM2Y2ZlODk5NlwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJ2Tm9kZUJveFwiOiB7XHJcbiAgICAgICAgXCJfcm9vdE5vZGVcIjoge1xyXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwiYm94XCIsXHJcbiAgICAgICAgICAgIFwic3R5bGVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJzdHlsZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcIl9yb290U3R5bGVcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcImNoaWxkcmVuXCI6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcInZOb2RlVGV4dFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCIyNDcxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjVcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcInZOb2RlVGV4dFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCIxNDgxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjVcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcInZOb2RlVGV4dFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCIzNDgxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjVcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcInZOb2RlSWZcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwiNTc4N2MxNWEtNDI2Yi00MWViLTgzMWQtZTNlMDc0MTU5NTgyXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZUxpc3RcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwiZmw4OWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJndzlkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwiYm94XCIsXHJcbiAgICAgICAgICAgIFwic3R5bGVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJzdHlsZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcImZxOWRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwiY2hpbGRyZW5cIjogW11cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJ2Tm9kZVRleHRcIjoge1xyXG4gICAgICAgIFwiMjQ3MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCI6IHtcclxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcInRleHRcIixcclxuICAgICAgICAgICAgXCJzdHlsZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInN0eWxlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiODQ4MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJmdzhqZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIjE0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiOiB7XHJcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwidWk4amQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJzdHlsZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInN0eWxlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiOTQ4MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJjbGlja1wiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcImV2ZW50XCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiZDQ4cmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCIzNDgxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjVcIjoge1xyXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcImM4d2VkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwic3R5bGVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJzdHlsZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcIjc0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwiY2xpY2tcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJldmVudFwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcIjNhNTRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiZThhZGQxYzctOGEwMS00MTY0LTg2MDQtNzIyZDhhYjUyOWYxXCI6IHtcclxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcInRleHRcIixcclxuICAgICAgICAgICAgXCJzdHlsZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInN0eWxlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiNGRjYTczYjMtOTBlYi00MWU3LTg2NTEtMmJkY2M5M2YzODcxXCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCI4NDM2OWFiYS00YTRkLTQ5MzItOGE5YS04ZjljYTk0OGI2YTJcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwidk5vZGVJbnB1dFwiOiB7fSxcclxuICAgIFwidk5vZGVMaXN0XCI6IHtcclxuICAgICAgICBcImZsODlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiOiB7XHJcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJsaXN0XCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiZjlxeGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJjaGlsZHJlblwiOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZUJveFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJndzlkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwidk5vZGVJZlwiOiB7XHJcbiAgICAgICAgXCI1Nzg3YzE1YS00MjZiLTQxZWItODMxZC1lM2UwNzQxNTk1ODJcIjoge1xyXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwiaWZcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJjMmZiOWE5Yi0yNWJiLTRlOGItODBjMC1jZjUxYjg1MDYwNzBcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcImNoaWxkcmVuXCI6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcInZOb2RlVGV4dFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJlOGFkZDFjNy04YTAxLTQxNjQtODYwNC03MjJkOGFiNTI5ZjFcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwic3R5bGVcIjoge1xyXG4gICAgICAgIFwiX3Jvb3RTdHlsZVwiOiB7XHJcbiAgICAgICAgICAgIFwiZm9udEZhbWlseVwiOiBcIidDb21mb3J0YWEnLCBjdXJzaXZlXCIsXHJcbiAgICAgICAgICAgIFwiYmFja2dyb3VuZFwiOiBcIiNmNWY1ZjVcIixcclxuICAgICAgICAgICAgXCJtaW5IZWlnaHRcIjogXCIxMDAlXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiODQ4MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJwYWRkaW5nXCI6IFwiMTBweFwiLFxyXG4gICAgICAgICAgICBcIm1hcmdpblwiOiBcIjEwcHggNXB4XCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiOTQ4MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJwYWRkaW5nXCI6IFwiMTBweCAxNXB4XCIsXHJcbiAgICAgICAgICAgIFwiYmFja2dyb3VuZFwiOiBcIiNhYWFhYWFcIixcclxuICAgICAgICAgICAgXCJkaXNwbGF5XCI6IFwiaW5saW5lLWJsb2NrXCIsXHJcbiAgICAgICAgICAgIFwibWFyZ2luTGVmdFwiOiBcIjVweFwiLFxyXG4gICAgICAgICAgICBcImJvcmRlclJhZGl1c1wiOiBcIjNweFwiLFxyXG4gICAgICAgICAgICBcImN1cnNvclwiOiBcInBvaW50ZXJcIixcclxuICAgICAgICAgICAgXCJ1c2VyU2VsZWN0XCI6IFwibm9uZVwiLFxyXG4gICAgICAgICAgICBcIm1hcmdpblwiOiBcIjEwcHggNXB4XCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiNzQ4MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJwYWRkaW5nXCI6IFwiMTBweCAxNXB4XCIsXHJcbiAgICAgICAgICAgIFwiYmFja2dyb3VuZFwiOiBcIiM5OTk5OTlcIixcclxuICAgICAgICAgICAgXCJkaXNwbGF5XCI6IFwiaW5saW5lLWJsb2NrXCIsXHJcbiAgICAgICAgICAgIFwibWFyZ2luTGVmdFwiOiBcIjVweFwiLFxyXG4gICAgICAgICAgICBcImJvcmRlclJhZGl1c1wiOiBcIjNweFwiLFxyXG4gICAgICAgICAgICBcImN1cnNvclwiOiBcInBvaW50ZXJcIixcclxuICAgICAgICAgICAgXCJtYXJnaW5cIjogXCIxMHB4IDVweFwiLFxyXG4gICAgICAgICAgICBcInVzZXJTZWxlY3RcIjogXCJub25lXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiODA5MmFjNWUtZGZkMC00NDkyLWE2NWQtOGFjM2VlYzMyNWUwXCI6IHtcclxuICAgICAgICAgICAgXCJwYWRkaW5nXCI6IFwiMTBweCAxMHB4IDEwcHggMFwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImE5NDYxZTI4LTdkOTItNDlhMC05MDAxLTIzZDc0ZTRiMzgyZFwiOiB7XHJcbiAgICAgICAgICAgIFwicGFkZGluZ1wiOiBcIjEwcHggMTBweCAxMHB4IDBcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCI3NjZiMTFlYy1kYTI3LTQ5NGMtYjI3Mi1jMjZmZWMzZjY0NzVcIjoge1xyXG4gICAgICAgICAgICBcInBhZGRpbmdcIjogXCIxMHB4XCIsXHJcbiAgICAgICAgICAgIFwiZmxvYXRcIjogXCJyaWdodFwiLFxyXG4gICAgICAgICAgICBcInBhZGRpbmdSaWdodFwiOiBcIjUwcHhcIixcclxuICAgICAgICAgICAgXCJ0ZXh0QWxpZ25cIjogXCJyaWdodFwiLFxyXG4gICAgICAgICAgICBcIm1heFdpZHRoXCI6IFwiNTAwcHhcIixcclxuICAgICAgICAgICAgXCJsaW5lLWhlaWdodFwiOiBcIjEuNVwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImNiY2Q4ZWRiLTRhYTItNDNmZS1hZDM5LWNlZTc5YjQ5MDI5NVwiOiB7XHJcbiAgICAgICAgICAgIFwicGFkZGluZ1wiOiBcIjEwcHhcIixcclxuICAgICAgICAgICAgXCJkaXNwbGF5XCI6IFwiYmxvY2tcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCI2NzYzZjEwMi0yM2Y3LTQzOTAtYjQ2My00ZTFiMTRlODY2YzlcIjoge1xyXG4gICAgICAgICAgICBcInBhZGRpbmdcIjogXCIxMHB4XCIsXHJcbiAgICAgICAgICAgIFwiZGlzcGxheVwiOiBcImJsb2NrXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiOTFjOWFkZjAtZDYyZS00NTgwLTkzZTctZjM5NTk0YWU1ZTdkXCI6IHtcclxuICAgICAgICAgICAgXCJwYWRkaW5nXCI6IFwiMTBweFwiLFxyXG4gICAgICAgICAgICBcImRpc3BsYXlcIjogXCJibG9ja1wiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImU5ZmJlYjM5LTcxOTMtNDUyMi05MWIzLTc2MWJkMzU2MzlkM1wiOiB7XHJcbiAgICAgICAgICAgIFwicGFkZGluZ1wiOiBcIjEwcHhcIixcclxuICAgICAgICAgICAgXCJkaXNwbGF5XCI6IFwiYmxvY2tcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCIzY2Y1ZDg5ZC0zNzAzLTQ4M2UtYWI2NC01YTViNzgwYWVjMjdcIjoge1xyXG4gICAgICAgICAgICBcInBhZGRpbmdcIjogXCIxMHB4XCIsXHJcbiAgICAgICAgICAgIFwiZGlzcGxheVwiOiBcImJsb2NrXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiZnE5ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJwYWRkaW5nXCI6IFwiMTBweFwiLFxyXG4gICAgICAgICAgICBcIndpZHRoXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcIjNxa2lkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwiaGVpZ2h0XCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcInQ3dnFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwiYmFja2dyb3VuZFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCI4Y3E2YjZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIjRkY2E3M2IzLTkwZWItNDFlNy04NjUxLTJiZGNjOTNmMzg3MVwiOiB7XHJcbiAgICAgICAgICAgIFwicGFkZGluZ1wiOiBcIjEwcHhcIlxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgXCJuYW1lU3BhY2VcIjoge1xyXG4gICAgICAgIFwiX3Jvb3ROYW1lU3BhY2VcIjoge1xyXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwic3RhdGVcIixcclxuICAgICAgICAgICAgXCJjaGlsZHJlblwiOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJzdGF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcInN0YXRlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcImM4cTlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJzdGF0ZVwiOiB7XHJcbiAgICAgICAgXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwiY291bnRcIixcclxuICAgICAgICAgICAgXCJyZWZcIjogXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIixcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgICAgIFwiZGVmYXVsdFZhbHVlXCI6IDAsXHJcbiAgICAgICAgICAgIFwibXV0YXRvcnNcIjogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwibXV0YXRvclwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJhczU1ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcIm11dGF0b3JcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwiOWRxOGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJjOHE5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwidGlsZXNcIixcclxuICAgICAgICAgICAgXCJyZWZcIjogXCJjOHE5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIixcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwidGFibGVcIixcclxuICAgICAgICAgICAgXCJkZWZpbml0aW9uXCI6IHtcclxuICAgICAgICAgICAgICAgIFwieFwiOiBcIm51bWJlclwiLFxyXG4gICAgICAgICAgICAgICAgXCJ5XCI6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgICAgICAgICBcImNvbG9yXCI6IFwidGV4dFwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwiZGVmYXVsdFZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwib3BzNmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInhcIjogMTIwLFxyXG4gICAgICAgICAgICAgICAgICAgIFwieVwiOiAxMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb2xvclwiOiBcIiNlYWI2NWNcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwid3B2NWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInhcIjogMjAwLFxyXG4gICAgICAgICAgICAgICAgICAgIFwieVwiOiAxMjAsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb2xvclwiOiBcIiM1M0IyRURcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwicW4yN2Q2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInhcIjogMTMwLFxyXG4gICAgICAgICAgICAgICAgICAgIFwieVwiOiAyMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb2xvclwiOiBcIiM1YmNjNWJcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwiY2E5cmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInhcIjogMTUwLFxyXG4gICAgICAgICAgICAgICAgICAgIFwieVwiOiAxNTAsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb2xvclwiOiBcIiM0ZDRkNGRcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIm11dGF0b3JzXCI6IFtdXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwibXV0YXRvclwiOiB7XHJcbiAgICAgICAgXCJhczU1ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcImV2ZW50XCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwiZXZlbnRcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJkNDhyZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInN0YXRlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwic3RhdGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIm11dGF0aW9uXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcInBkcTZkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiOWRxOGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJldmVudFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcImV2ZW50XCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiM2E1NGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJzdGF0ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInN0YXRlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiNDZ2ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJtdXRhdGlvblwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCI0NTJxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiZXZlbnRcIjoge1xyXG4gICAgICAgIFwiZDQ4cmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcImluY3JlbWVudFwiLFxyXG4gICAgICAgICAgICBcIm11dGF0b3JzXCI6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcIm11dGF0b3JcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwiYXM1NWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgXCJkYXRhXCI6IFtdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIjNhNTRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJkZWNyZW1lbnRcIixcclxuICAgICAgICAgICAgXCJtdXRhdG9yc1wiOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJtdXRhdG9yXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIjlkcThkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==
