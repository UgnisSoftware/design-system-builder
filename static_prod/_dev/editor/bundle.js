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
;(function () {
	'use strict';

	/**
	 * @preserve FastClick: polyfill to remove click delays on browsers with touch UIs.
	 *
	 * @codingstandard ftlabs-jsv2
	 * @copyright The Financial Times Limited [All Rights Reserved]
	 * @license MIT License (see LICENSE.txt)
	 */

	/*jslint browser:true, node:true*/
	/*global define, Event, Node*/


	/**
	 * Instantiate fast-clicking listeners on the specified layer.
	 *
	 * @constructor
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	function FastClick(layer, options) {
		var oldOnClick;

		options = options || {};

		/**
		 * Whether a click is currently being tracked.
		 *
		 * @type boolean
		 */
		this.trackingClick = false;


		/**
		 * Timestamp for when click tracking started.
		 *
		 * @type number
		 */
		this.trackingClickStart = 0;


		/**
		 * The element being tracked for a click.
		 *
		 * @type EventTarget
		 */
		this.targetElement = null;


		/**
		 * X-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartX = 0;


		/**
		 * Y-coordinate of touch start event.
		 *
		 * @type number
		 */
		this.touchStartY = 0;


		/**
		 * ID of the last touch, retrieved from Touch.identifier.
		 *
		 * @type number
		 */
		this.lastTouchIdentifier = 0;


		/**
		 * Touchmove boundary, beyond which a click will be cancelled.
		 *
		 * @type number
		 */
		this.touchBoundary = options.touchBoundary || 10;


		/**
		 * The FastClick layer.
		 *
		 * @type Element
		 */
		this.layer = layer;

		/**
		 * The minimum time between tap(touchstart and touchend) events
		 *
		 * @type number
		 */
		this.tapDelay = options.tapDelay || 200;

		/**
		 * The maximum time for a tap
		 *
		 * @type number
		 */
		this.tapTimeout = options.tapTimeout || 700;

		if (FastClick.notNeeded(layer)) {
			return;
		}

		// Some old versions of Android don't have Function.prototype.bind
		function bind(method, context) {
			return function() { return method.apply(context, arguments); };
		}


		var methods = ['onMouse', 'onClick', 'onTouchStart', 'onTouchMove', 'onTouchEnd', 'onTouchCancel'];
		var context = this;
		for (var i = 0, l = methods.length; i < l; i++) {
			context[methods[i]] = bind(context[methods[i]], context);
		}

		// Set up event handlers as required
		if (deviceIsAndroid) {
			layer.addEventListener('mouseover', this.onMouse, true);
			layer.addEventListener('mousedown', this.onMouse, true);
			layer.addEventListener('mouseup', this.onMouse, true);
		}

		layer.addEventListener('click', this.onClick, true);
		layer.addEventListener('touchstart', this.onTouchStart, false);
		layer.addEventListener('touchmove', this.onTouchMove, false);
		layer.addEventListener('touchend', this.onTouchEnd, false);
		layer.addEventListener('touchcancel', this.onTouchCancel, false);

		// Hack is required for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
		// which is how FastClick normally stops click events bubbling to callbacks registered on the FastClick
		// layer when they are cancelled.
		if (!Event.prototype.stopImmediatePropagation) {
			layer.removeEventListener = function(type, callback, capture) {
				var rmv = Node.prototype.removeEventListener;
				if (type === 'click') {
					rmv.call(layer, type, callback.hijacked || callback, capture);
				} else {
					rmv.call(layer, type, callback, capture);
				}
			};

			layer.addEventListener = function(type, callback, capture) {
				var adv = Node.prototype.addEventListener;
				if (type === 'click') {
					adv.call(layer, type, callback.hijacked || (callback.hijacked = function(event) {
						if (!event.propagationStopped) {
							callback(event);
						}
					}), capture);
				} else {
					adv.call(layer, type, callback, capture);
				}
			};
		}

		// If a handler is already declared in the element's onclick attribute, it will be fired before
		// FastClick's onClick handler. Fix this by pulling out the user-defined handler function and
		// adding it as listener.
		if (typeof layer.onclick === 'function') {

			// Android browser on at least 3.2 requires a new reference to the function in layer.onclick
			// - the old one won't work if passed to addEventListener directly.
			oldOnClick = layer.onclick;
			layer.addEventListener('click', function(event) {
				oldOnClick(event);
			}, false);
			layer.onclick = null;
		}
	}

	/**
	* Windows Phone 8.1 fakes user agent string to look like Android and iPhone.
	*
	* @type boolean
	*/
	var deviceIsWindowsPhone = navigator.userAgent.indexOf("Windows Phone") >= 0;

	/**
	 * Android requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsAndroid = navigator.userAgent.indexOf('Android') > 0 && !deviceIsWindowsPhone;


	/**
	 * iOS requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsIOS = /iP(ad|hone|od)/.test(navigator.userAgent) && !deviceIsWindowsPhone;


	/**
	 * iOS 4 requires an exception for select elements.
	 *
	 * @type boolean
	 */
	var deviceIsIOS4 = deviceIsIOS && (/OS 4_\d(_\d)?/).test(navigator.userAgent);


	/**
	 * iOS 6.0-7.* requires the target element to be manually derived
	 *
	 * @type boolean
	 */
	var deviceIsIOSWithBadTarget = deviceIsIOS && (/OS [6-7]_\d/).test(navigator.userAgent);

	/**
	 * BlackBerry requires exceptions.
	 *
	 * @type boolean
	 */
	var deviceIsBlackBerry10 = navigator.userAgent.indexOf('BB10') > 0;

	/**
	 * Determine whether a given element requires a native click.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element needs a native click
	 */
	FastClick.prototype.needsClick = function(target) {
		switch (target.nodeName.toLowerCase()) {

		// Don't send a synthetic click to disabled inputs (issue #62)
		case 'button':
		case 'select':
		case 'textarea':
			if (target.disabled) {
				return true;
			}

			break;
		case 'input':

			// File inputs need real clicks on iOS 6 due to a browser bug (issue #68)
			if ((deviceIsIOS && target.type === 'file') || target.disabled) {
				return true;
			}

			break;
		case 'label':
		case 'iframe': // iOS8 homescreen apps can prevent events bubbling into frames
		case 'video':
			return true;
		}

		return (/\bneedsclick\b/).test(target.className);
	};


	/**
	 * Determine whether a given element requires a call to focus to simulate click into element.
	 *
	 * @param {EventTarget|Element} target Target DOM element
	 * @returns {boolean} Returns true if the element requires a call to focus to simulate native click.
	 */
	FastClick.prototype.needsFocus = function(target) {
		switch (target.nodeName.toLowerCase()) {
		case 'textarea':
			return true;
		case 'select':
			return !deviceIsAndroid;
		case 'input':
			switch (target.type) {
			case 'button':
			case 'checkbox':
			case 'file':
			case 'image':
			case 'radio':
			case 'submit':
				return false;
			}

			// No point in attempting to focus disabled inputs
			return !target.disabled && !target.readOnly;
		default:
			return (/\bneedsfocus\b/).test(target.className);
		}
	};


	/**
	 * Send a click event to the specified element.
	 *
	 * @param {EventTarget|Element} targetElement
	 * @param {Event} event
	 */
	FastClick.prototype.sendClick = function(targetElement, event) {
		var clickEvent, touch;

		// On some Android devices activeElement needs to be blurred otherwise the synthetic click will have no effect (#24)
		if (document.activeElement && document.activeElement !== targetElement) {
			document.activeElement.blur();
		}

		touch = event.changedTouches[0];

		// Synthesise a click event, with an extra attribute so it can be tracked
		clickEvent = document.createEvent('MouseEvents');
		clickEvent.initMouseEvent(this.determineEventType(targetElement), true, true, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, false, false, false, false, 0, null);
		clickEvent.forwardedTouchEvent = true;
		targetElement.dispatchEvent(clickEvent);
	};

	FastClick.prototype.determineEventType = function(targetElement) {

		//Issue #159: Android Chrome Select Box does not open with a synthetic click event
		if (deviceIsAndroid && targetElement.tagName.toLowerCase() === 'select') {
			return 'mousedown';
		}

		return 'click';
	};


	/**
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.focus = function(targetElement) {
		var length;

		// Issue #160: on iOS 7, some input elements (e.g. date datetime month) throw a vague TypeError on setSelectionRange. These elements don't have an integer value for the selectionStart and selectionEnd properties, but unfortunately that can't be used for detection because accessing the properties also throws a TypeError. Just check the type instead. Filed as Apple bug #15122724.
		if (deviceIsIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month') {
			length = targetElement.value.length;
			targetElement.setSelectionRange(length, length);
		} else {
			targetElement.focus();
		}
	};


	/**
	 * Check whether the given target element is a child of a scrollable layer and if so, set a flag on it.
	 *
	 * @param {EventTarget|Element} targetElement
	 */
	FastClick.prototype.updateScrollParent = function(targetElement) {
		var scrollParent, parentElement;

		scrollParent = targetElement.fastClickScrollParent;

		// Attempt to discover whether the target element is contained within a scrollable layer. Re-check if the
		// target element was moved to another parent.
		if (!scrollParent || !scrollParent.contains(targetElement)) {
			parentElement = targetElement;
			do {
				if (parentElement.scrollHeight > parentElement.offsetHeight) {
					scrollParent = parentElement;
					targetElement.fastClickScrollParent = parentElement;
					break;
				}

				parentElement = parentElement.parentElement;
			} while (parentElement);
		}

		// Always update the scroll top tracker if possible.
		if (scrollParent) {
			scrollParent.fastClickLastScrollTop = scrollParent.scrollTop;
		}
	};


	/**
	 * @param {EventTarget} targetElement
	 * @returns {Element|EventTarget}
	 */
	FastClick.prototype.getTargetElementFromEventTarget = function(eventTarget) {

		// On some older browsers (notably Safari on iOS 4.1 - see issue #56) the event target may be a text node.
		if (eventTarget.nodeType === Node.TEXT_NODE) {
			return eventTarget.parentNode;
		}

		return eventTarget;
	};


	/**
	 * On touch start, record the position and scroll offset.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchStart = function(event) {
		var targetElement, touch, selection;

		// Ignore multiple touches, otherwise pinch-to-zoom is prevented if both fingers are on the FastClick element (issue #111).
		if (event.targetTouches.length > 1) {
			return true;
		}

		targetElement = this.getTargetElementFromEventTarget(event.target);
		touch = event.targetTouches[0];

		if (deviceIsIOS) {

			// Only trusted events will deselect text on iOS (issue #49)
			selection = window.getSelection();
			if (selection.rangeCount && !selection.isCollapsed) {
				return true;
			}

			if (!deviceIsIOS4) {

				// Weird things happen on iOS when an alert or confirm dialog is opened from a click event callback (issue #23):
				// when the user next taps anywhere else on the page, new touchstart and touchend events are dispatched
				// with the same identifier as the touch event that previously triggered the click that triggered the alert.
				// Sadly, there is an issue on iOS 4 that causes some normal touch events to have the same identifier as an
				// immediately preceeding touch event (issue #52), so this fix is unavailable on that platform.
				// Issue 120: touch.identifier is 0 when Chrome dev tools 'Emulate touch events' is set with an iOS device UA string,
				// which causes all touch events to be ignored. As this block only applies to iOS, and iOS identifiers are always long,
				// random integers, it's safe to to continue if the identifier is 0 here.
				if (touch.identifier && touch.identifier === this.lastTouchIdentifier) {
					event.preventDefault();
					return false;
				}

				this.lastTouchIdentifier = touch.identifier;

				// If the target element is a child of a scrollable layer (using -webkit-overflow-scrolling: touch) and:
				// 1) the user does a fling scroll on the scrollable layer
				// 2) the user stops the fling scroll with another tap
				// then the event.target of the last 'touchend' event will be the element that was under the user's finger
				// when the fling scroll was started, causing FastClick to send a click event to that layer - unless a check
				// is made to ensure that a parent layer was not scrolled before sending a synthetic click (issue #42).
				this.updateScrollParent(targetElement);
			}
		}

		this.trackingClick = true;
		this.trackingClickStart = event.timeStamp;
		this.targetElement = targetElement;

		this.touchStartX = touch.pageX;
		this.touchStartY = touch.pageY;

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			event.preventDefault();
		}

		return true;
	};


	/**
	 * Based on a touchmove event object, check whether the touch has moved past a boundary since it started.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.touchHasMoved = function(event) {
		var touch = event.changedTouches[0], boundary = this.touchBoundary;

		if (Math.abs(touch.pageX - this.touchStartX) > boundary || Math.abs(touch.pageY - this.touchStartY) > boundary) {
			return true;
		}

		return false;
	};


	/**
	 * Update the last position.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchMove = function(event) {
		if (!this.trackingClick) {
			return true;
		}

		// If the touch has moved, cancel the click tracking
		if (this.targetElement !== this.getTargetElementFromEventTarget(event.target) || this.touchHasMoved(event)) {
			this.trackingClick = false;
			this.targetElement = null;
		}

		return true;
	};


	/**
	 * Attempt to find the labelled control for the given label element.
	 *
	 * @param {EventTarget|HTMLLabelElement} labelElement
	 * @returns {Element|null}
	 */
	FastClick.prototype.findControl = function(labelElement) {

		// Fast path for newer browsers supporting the HTML5 control attribute
		if (labelElement.control !== undefined) {
			return labelElement.control;
		}

		// All browsers under test that support touch events also support the HTML5 htmlFor attribute
		if (labelElement.htmlFor) {
			return document.getElementById(labelElement.htmlFor);
		}

		// If no for attribute exists, attempt to retrieve the first labellable descendant element
		// the list of which is defined here: http://www.w3.org/TR/html5/forms.html#category-label
		return labelElement.querySelector('button, input:not([type=hidden]), keygen, meter, output, progress, select, textarea');
	};


	/**
	 * On touch end, determine whether to send a click event at once.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onTouchEnd = function(event) {
		var forElement, trackingClickStart, targetTagName, scrollParent, touch, targetElement = this.targetElement;

		if (!this.trackingClick) {
			return true;
		}

		// Prevent phantom clicks on fast double-tap (issue #36)
		if ((event.timeStamp - this.lastClickTime) < this.tapDelay) {
			this.cancelNextClick = true;
			return true;
		}

		if ((event.timeStamp - this.trackingClickStart) > this.tapTimeout) {
			return true;
		}

		// Reset to prevent wrong click cancel on input (issue #156).
		this.cancelNextClick = false;

		this.lastClickTime = event.timeStamp;

		trackingClickStart = this.trackingClickStart;
		this.trackingClick = false;
		this.trackingClickStart = 0;

		// On some iOS devices, the targetElement supplied with the event is invalid if the layer
		// is performing a transition or scroll, and has to be re-detected manually. Note that
		// for this to function correctly, it must be called *after* the event target is checked!
		// See issue #57; also filed as rdar://13048589 .
		if (deviceIsIOSWithBadTarget) {
			touch = event.changedTouches[0];

			// In certain cases arguments of elementFromPoint can be negative, so prevent setting targetElement to null
			targetElement = document.elementFromPoint(touch.pageX - window.pageXOffset, touch.pageY - window.pageYOffset) || targetElement;
			targetElement.fastClickScrollParent = this.targetElement.fastClickScrollParent;
		}

		targetTagName = targetElement.tagName.toLowerCase();
		if (targetTagName === 'label') {
			forElement = this.findControl(targetElement);
			if (forElement) {
				this.focus(targetElement);
				if (deviceIsAndroid) {
					return false;
				}

				targetElement = forElement;
			}
		} else if (this.needsFocus(targetElement)) {

			// Case 1: If the touch started a while ago (best guess is 100ms based on tests for issue #36) then focus will be triggered anyway. Return early and unset the target element reference so that the subsequent click will be allowed through.
			// Case 2: Without this exception for input elements tapped when the document is contained in an iframe, then any inputted text won't be visible even though the value attribute is updated as the user types (issue #37).
			if ((event.timeStamp - trackingClickStart) > 100 || (deviceIsIOS && window.top !== window && targetTagName === 'input')) {
				this.targetElement = null;
				return false;
			}

			this.focus(targetElement);
			this.sendClick(targetElement, event);

			// Select elements need the event to go through on iOS 4, otherwise the selector menu won't open.
			// Also this breaks opening selects when VoiceOver is active on iOS6, iOS7 (and possibly others)
			if (!deviceIsIOS || targetTagName !== 'select') {
				this.targetElement = null;
				event.preventDefault();
			}

			return false;
		}

		if (deviceIsIOS && !deviceIsIOS4) {

			// Don't send a synthetic click event if the target element is contained within a parent layer that was scrolled
			// and this tap is being used to stop the scrolling (usually initiated by a fling - issue #42).
			scrollParent = targetElement.fastClickScrollParent;
			if (scrollParent && scrollParent.fastClickLastScrollTop !== scrollParent.scrollTop) {
				return true;
			}
		}

		// Prevent the actual click from going though - unless the target node is marked as requiring
		// real clicks or if it is in the whitelist in which case only non-programmatic clicks are permitted.
		if (!this.needsClick(targetElement)) {
			event.preventDefault();
			this.sendClick(targetElement, event);
		}

		return false;
	};


	/**
	 * On touch cancel, stop tracking the click.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.onTouchCancel = function() {
		this.trackingClick = false;
		this.targetElement = null;
	};


	/**
	 * Determine mouse events which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onMouse = function(event) {

		// If a target element was never set (because a touch event was never fired) allow the event
		if (!this.targetElement) {
			return true;
		}

		if (event.forwardedTouchEvent) {
			return true;
		}

		// Programmatically generated events targeting a specific element should be permitted
		if (!event.cancelable) {
			return true;
		}

		// Derive and check the target element to see whether the mouse event needs to be permitted;
		// unless explicitly enabled, prevent non-touch click events from triggering actions,
		// to prevent ghost/doubleclicks.
		if (!this.needsClick(this.targetElement) || this.cancelNextClick) {

			// Prevent any user-added listeners declared on FastClick element from being fired.
			if (event.stopImmediatePropagation) {
				event.stopImmediatePropagation();
			} else {

				// Part of the hack for browsers that don't support Event#stopImmediatePropagation (e.g. Android 2)
				event.propagationStopped = true;
			}

			// Cancel the event
			event.stopPropagation();
			event.preventDefault();

			return false;
		}

		// If the mouse event is permitted, return true for the action to go through.
		return true;
	};


	/**
	 * On actual clicks, determine whether this is a touch-generated click, a click action occurring
	 * naturally after a delay after a touch (which needs to be cancelled to avoid duplication), or
	 * an actual click which should be permitted.
	 *
	 * @param {Event} event
	 * @returns {boolean}
	 */
	FastClick.prototype.onClick = function(event) {
		var permitted;

		// It's possible for another FastClick-like library delivered with third-party code to fire a click event before FastClick does (issue #44). In that case, set the click-tracking flag back to false and return early. This will cause onTouchEnd to return early.
		if (this.trackingClick) {
			this.targetElement = null;
			this.trackingClick = false;
			return true;
		}

		// Very odd behaviour on iOS (issue #18): if a submit element is present inside a form and the user hits enter in the iOS simulator or clicks the Go button on the pop-up OS keyboard the a kind of 'fake' click event will be triggered with the submit-type input element as the target.
		if (event.target.type === 'submit' && event.detail === 0) {
			return true;
		}

		permitted = this.onMouse(event);

		// Only unset targetElement if the click is not permitted. This will ensure that the check for !targetElement in onMouse fails and the browser's click doesn't go through.
		if (!permitted) {
			this.targetElement = null;
		}

		// If clicks are permitted, return true for the action to go through.
		return permitted;
	};


	/**
	 * Remove all FastClick's event listeners.
	 *
	 * @returns {void}
	 */
	FastClick.prototype.destroy = function() {
		var layer = this.layer;

		if (deviceIsAndroid) {
			layer.removeEventListener('mouseover', this.onMouse, true);
			layer.removeEventListener('mousedown', this.onMouse, true);
			layer.removeEventListener('mouseup', this.onMouse, true);
		}

		layer.removeEventListener('click', this.onClick, true);
		layer.removeEventListener('touchstart', this.onTouchStart, false);
		layer.removeEventListener('touchmove', this.onTouchMove, false);
		layer.removeEventListener('touchend', this.onTouchEnd, false);
		layer.removeEventListener('touchcancel', this.onTouchCancel, false);
	};


	/**
	 * Check whether FastClick is needed.
	 *
	 * @param {Element} layer The layer to listen on
	 */
	FastClick.notNeeded = function(layer) {
		var metaViewport;
		var chromeVersion;
		var blackberryVersion;
		var firefoxVersion;

		// Devices that don't support touch don't need FastClick
		if (typeof window.ontouchstart === 'undefined') {
			return true;
		}

		// Chrome version - zero for other browsers
		chromeVersion = +(/Chrome\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (chromeVersion) {

			if (deviceIsAndroid) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// Chrome on Android with user-scalable="no" doesn't need FastClick (issue #89)
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// Chrome 32 and above with width=device-width or less don't need FastClick
					if (chromeVersion > 31 && document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}

			// Chrome desktop doesn't need FastClick (issue #15)
			} else {
				return true;
			}
		}

		if (deviceIsBlackBerry10) {
			blackberryVersion = navigator.userAgent.match(/Version\/([0-9]*)\.([0-9]*)/);

			// BlackBerry 10.3+ does not require Fastclick library.
			// https://github.com/ftlabs/fastclick/issues/251
			if (blackberryVersion[1] >= 10 && blackberryVersion[2] >= 3) {
				metaViewport = document.querySelector('meta[name=viewport]');

				if (metaViewport) {
					// user-scalable=no eliminates click delay.
					if (metaViewport.content.indexOf('user-scalable=no') !== -1) {
						return true;
					}
					// width=device-width (or less than device-width) eliminates click delay.
					if (document.documentElement.scrollWidth <= window.outerWidth) {
						return true;
					}
				}
			}
		}

		// IE10 with -ms-touch-action: none or manipulation, which disables double-tap-to-zoom (issue #97)
		if (layer.style.msTouchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		// Firefox version - zero for other browsers
		firefoxVersion = +(/Firefox\/([0-9]+)/.exec(navigator.userAgent) || [,0])[1];

		if (firefoxVersion >= 27) {
			// Firefox 27+ does not have tap delay if the content is not zoomable - https://bugzilla.mozilla.org/show_bug.cgi?id=922896

			metaViewport = document.querySelector('meta[name=viewport]');
			if (metaViewport && (metaViewport.content.indexOf('user-scalable=no') !== -1 || document.documentElement.scrollWidth <= window.outerWidth)) {
				return true;
			}
		}

		// IE11: prefixed -ms-touch-action is no longer supported and it's recomended to use non-prefixed version
		// http://msdn.microsoft.com/en-us/library/windows/apps/Hh767313.aspx
		if (layer.style.touchAction === 'none' || layer.style.touchAction === 'manipulation') {
			return true;
		}

		return false;
	};


	/**
	 * Factory method for creating a FastClick object
	 *
	 * @param {Element} layer The layer to listen on
	 * @param {Object} [options={}] The options to override the defaults
	 */
	FastClick.attach = function(layer, options) {
		return new FastClick(layer, options);
	};


	if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {

		// AMD. Register as an anonymous module.
		define(function() {
			return FastClick;
		});
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = FastClick.attach;
		module.exports.FastClick = FastClick;
	} else {
		window.FastClick = FastClick;
	}
}());

},{}],3:[function(require,module,exports){
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

},{"./is":5,"./vnode":12}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
module.exports = {
  array: Array.isArray,
  primitive: function(s) { return typeof s === 'string' || typeof s === 'number'; },
};

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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

},{"./htmldomapi":4,"./is":5,"./vnode":12}],12:[function(require,module,exports){
module.exports = function(sel, data, children, text, elm) {
  var key = data === undefined ? undefined : data.key;
  return {sel: sel, data: data, children: children,
          text: text, elm: elm, key: key};
};

},{}],13:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _snabbdom = require("snabbdom");

var _snabbdom2 = _interopRequireDefault(_snabbdom);

var _h = require("snabbdom/h");

var _h2 = _interopRequireDefault(_h);

var _big = require("../node_modules/big.js");

var _big2 = _interopRequireDefault(_big);

var _ugnis = require("./ugnis");

var _ugnis2 = _interopRequireDefault(_ugnis);

var _app = require("../ugnis_components/app.json");

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function updateProps(oldVnode, vnode) {
    var key = void 0,
        cur = void 0,
        old = void 0,
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
    return ("" + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/[10]/g, function () {
        return (0 | Math.random() * 16).toString(16);
    });
}

_big2.default.E_POS = 1e+6;

var attachFastClick = require('fastclick');
attachFastClick(document.body);

var version = '0.0.26v';
editor(_app2.default);

function editor(appDefinition) {

    var savedDefinition = JSON.parse(localStorage.getItem('app_key_' + version));
    var app = (0, _ugnis2.default)(savedDefinition || appDefinition);

    var node = document.createElement('div');
    document.body.appendChild(node);

    // State
    var state = {
        leftOpen: true,
        rightOpen: true,
        fullScreen: false,
        editorRightWidth: 350,
        editorLeftWidth: 350,
        subEditorWidth: 350,
        appIsFrozen: false,
        selectedViewNode: {},
        selectedEventId: '',
        selectedPipeId: '',
        selectedStateNodeId: '',
        selectedViewSubMenu: 'props',
        editingTitleNodeId: '',
        viewFoldersClosed: {},
        eventStack: [],
        definition: savedDefinition || app.definition
    };
    // undo/redo
    var stateStack = [state.definition];
    function setState(newState) {
        if (newState === state) {
            console.warn('state was mutated, search for a bug');
        }
        if (state.definition !== newState.definition) {
            // unselect deleted components and state
            if (newState.definition.state[newState.selectedStateNodeId] === undefined) {
                newState = _extends({}, newState, { selectedStateNodeId: '' });
            }
            if (newState.selectedViewNode.ref !== undefined && newState.definition[newState.selectedViewNode.ref][newState.selectedViewNode.id] === undefined) {
                newState = _extends({}, newState, { selectedViewNode: {} });
            }
            // undo/redo then render then save
            var currentIndex = stateStack.findIndex(function (a) {
                return a === state.definition;
            });
            stateStack = stateStack.slice(0, currentIndex + 1).concat(newState.definition);
            // TODO add garbage collection?
            app.render(newState.definition);
            setTimeout(function () {
                return localStorage.setItem('app_key_' + version, JSON.stringify(newState.definition));
            }, 0);
        }
        if (state.appIsFrozen !== newState.appIsFrozen || state.selectedViewNode !== newState.selectedViewNode) {
            app._freeze(newState.appIsFrozen, VIEW_NODE_SELECTED, newState.selectedViewNode);
        }
        if (newState.editingTitleNodeId && state.editingTitleNodeId !== newState.editingTitleNodeId) {
            // que auto focus
            setTimeout(function () {
                var node = document.querySelectorAll('[data-istitleeditor]')[0];
                if (node) {
                    node.focus();
                }
            }, 0);
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
    window.addEventListener("resize", function () {
        render();
    }, false);
    window.addEventListener("orientationchange", function () {
        render();
    }, false);
    document.addEventListener('keydown', function (e) {
        // 83 - s
        // 90 - z
        // 89 - y
        // 32 - space
        // 13 - enter
        // 27 - escape
        if (e.which === 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            // TODO garbage collect
            e.preventDefault();
            fetch('/save', { method: 'POST', body: JSON.stringify(state.definition), headers: { "Content-Type": "application/json" } });
            return false;
        }
        if (e.which === 32 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
            FREEZER_CLICKED();
        }
        if (!e.shiftKey && e.which === 90 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
            var currentIndex = stateStack.findIndex(function (a) {
                return a === state.definition;
            });
            if (currentIndex > 0) {
                var newDefinition = stateStack[currentIndex - 1];
                app.render(newDefinition);
                state = _extends({}, state, { definition: newDefinition });
                render();
            }
        }
        if (e.which === 89 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) || e.shiftKey && e.which === 90 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
            e.preventDefault();
            var _currentIndex = stateStack.findIndex(function (a) {
                return a === state.definition;
            });
            if (_currentIndex < stateStack.length - 1) {
                var _newDefinition = stateStack[_currentIndex + 1];
                app.render(_newDefinition);
                state = _extends({}, state, { definition: _newDefinition });
                render();
            }
        }
        if (e.which === 13) {
            setState(_extends({}, state, { editingTitleNodeId: '' }));
        }
        if (e.which === 27) {
            FULL_SCREEN_CLICKED(false);
        }
    });

    // Listen to app
    app.addListener(function (eventId, data, e, previousState, currentState, mutations) {
        setState(_extends({}, state, { eventStack: state.eventStack.concat({ eventId: eventId, data: data, e: e, previousState: previousState, currentState: currentState, mutations: mutations }) }));
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
                }), selectedViewNode: {} }));
        }
        setState(_extends({}, state, { definition: _extends({}, state.definition, _defineProperty({}, parentRef.ref, _extends({}, state.definition[parentRef.ref], _defineProperty({}, parentRef.id, _extends({}, state.definition[parentRef.ref][parentRef.id], { children: state.definition[parentRef.ref][parentRef.id].children.filter(function (ref) {
                    return ref.id !== nodeRef.id;
                }) }))))), selectedViewNode: {} }));
    }
    function ADD_NODE(nodeRef, type) {
        // TODO remove when dragging works
        if (!nodeRef.ref || !state.definition[nodeRef.ref][nodeRef.id] || !state.definition[nodeRef.ref][nodeRef.id].children) {
            nodeRef = { ref: 'vNodeBox', id: '_rootNode' };
        }
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
            }));
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
                }, _defineProperty(_extends16, nodeRef.ref, _extends({}, state.definition[nodeRef.ref], _defineProperty({}, nodeId, _extends({}, state.definition[nodeRef.ref][nodeId], { children: state.definition[nodeRef.ref][nodeId].children.concat({ ref: 'vNodeText', id: newNodeId }) })))), _defineProperty(_extends16, "vNodeText", _extends({}, state.definition.vNodeText, _defineProperty({}, newNodeId, _newNode))), _defineProperty(_extends16, "style", _extends({}, state.definition.style, _defineProperty({}, newStyleId, newStyle))), _extends16)) }));
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
                type: 'input',
                title: 'update input',
                mutators: [{ ref: 'mutator', id: mutatorId }],
                emitter: {
                    ref: 'vNodeInput',
                    id: newNodeId
                },
                data: [{ ref: 'eventData', id: '_input' }]
            };
            return setState(_extends({}, state, {
                selectedViewNode: { ref: 'vNodeInput', id: newNodeId },
                definition: _extends({}, state.definition, (_extends25 = {
                    pipe: _extends({}, state.definition.pipe, (_extends17 = {}, _defineProperty(_extends17, pipeInputId, newPipeInput), _defineProperty(_extends17, pipeMutatorId, newPipeMutator), _extends17))
                }, _defineProperty(_extends25, nodeRef.ref, _extends({}, state.definition[nodeRef.ref], _defineProperty({}, nodeId, _extends({}, state.definition[nodeRef.ref][nodeId], { children: state.definition[nodeRef.ref][nodeId].children.concat({ ref: 'vNodeInput', id: newNodeId }) })))), _defineProperty(_extends25, "vNodeInput", _extends({}, state.definition.vNodeInput, _defineProperty({}, newNodeId, _newNode2))), _defineProperty(_extends25, "style", _extends({}, state.definition.style, _defineProperty({}, newStyleId, newStyle))), _defineProperty(_extends25, "nameSpace", _extends({}, state.definition.nameSpace, _defineProperty({}, '_rootNameSpace', _extends({}, state.definition.nameSpace['_rootNameSpace'], { children: state.definition.nameSpace['_rootNameSpace'].children.concat({ ref: 'state', id: stateId }) })))), _defineProperty(_extends25, "state", _extends({}, state.definition.state, _defineProperty({}, stateId, newState))), _defineProperty(_extends25, "mutator", _extends({}, state.definition.mutator, _defineProperty({}, mutatorId, newMutator))), _defineProperty(_extends25, "event", _extends({}, state.definition.event, _defineProperty({}, eventId, newEvent))), _extends25)) }));
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
        if (type === 'folder') {
            var _extends26;

            newState = {
                title: 'new folder',
                children: []
            };
            return setState(_extends({}, state, { definition: _extends({}, state.definition, {
                    nameSpace: _extends({}, state.definition.nameSpace, (_extends26 = {}, _defineProperty(_extends26, namespaceId, _extends({}, state.definition.nameSpace[namespaceId], { children: state.definition.nameSpace[namespaceId].children.concat({ ref: 'nameSpace', id: newStateId }) })), _defineProperty(_extends26, newStateId, newState), _extends26))
                }) }));
        }
        setState(_extends({}, state, { definition: _extends({}, state.definition, {
                nameSpace: _extends({}, state.definition.nameSpace, _defineProperty({}, namespaceId, _extends({}, state.definition.nameSpace[namespaceId], { children: state.definition.nameSpace[namespaceId].children.concat({ ref: 'state', id: newStateId }) }))),
                state: _extends({}, state.definition.state, _defineProperty({}, newStateId, newState))
            }) }));
    }
    function CHANGE_STYLE(styleId, key, e) {
        e.preventDefault();
        // and now I really regret not using immutable or ramda lenses
        setState(_extends({}, state, { definition: _extends({}, state.definition, { style: _extends({}, state.definition.style, _defineProperty({}, styleId, _extends({}, state.definition.style[styleId], _defineProperty({}, key, e.target.value)))) }) }));
    }
    function ADD_DEFAULT_STYLE(styleId, key) {
        setState(_extends({}, state, { definition: _extends({}, state.definition, { style: _extends({}, state.definition.style, _defineProperty({}, styleId, _extends({}, state.definition.style[styleId], _defineProperty({}, key, 'default')))) }) }));
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
            }) }));
    }
    function CHANGE_VIEW_NODE_TITLE(nodeRef, e) {
        e.preventDefault();
        var nodeId = nodeRef.id;
        var nodeType = nodeRef.ref;
        setState(_extends({}, state, { definition: _extends({}, state.definition, _defineProperty({}, nodeType, _extends({}, state.definition[nodeType], _defineProperty({}, nodeId, _extends({}, state.definition[nodeType][nodeId], { title: e.target.value }))))) }));
    }
    function CHANGE_STATE_NODE_TITLE(nodeId, e) {
        e.preventDefault();
        setState(_extends({}, state, { definition: _extends({}, state.definition, {
                state: _extends({}, state.definition.state, _defineProperty({}, nodeId, _extends({}, state.definition.state[nodeId], { title: e.target.value })))
            }) }));
    }
    function CHANGE_NAMESPACE_TITLE(nodeId, e) {
        e.preventDefault();
        setState(_extends({}, state, { definition: _extends({}, state.definition, {
                nameSpace: _extends({}, state.definition.nameSpace, _defineProperty({}, nodeId, _extends({}, state.definition.nameSpace[nodeId], { title: e.target.value })))
            }) }));
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
        setState(_extends({}, state, { definition: _extends({}, state.definition, _defineProperty({}, ref.ref, _extends({}, state.definition[ref.ref], _defineProperty({}, ref.id, _extends({}, state.definition[ref.ref][ref.id], _defineProperty({}, propertyName, value)))))) }));
    }
    function ADD_EVENT(propertyName) {
        var _extends46;

        var ref = state.selectedViewNode;
        var eventId = uuid();
        setState(_extends({}, state, { definition: _extends({}, state.definition, (_extends46 = {}, _defineProperty(_extends46, ref.ref, _extends({}, state.definition[ref.ref], _defineProperty({}, ref.id, _extends({}, state.definition[ref.ref][ref.id], _defineProperty({}, propertyName, { ref: 'event', id: eventId }))))), _defineProperty(_extends46, "event", _extends({}, state.definition.event, _defineProperty({}, eventId, {
                title: 'On ' + propertyName,
                mutators: []
            }))), _extends46)) }));
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
            }) }));
    }
    function ADD_TRANSFORMATION(pipeId, transformation) {
        if (transformation === 'join') {
            var _extends49;

            var newPipeId = uuid();
            var joinId = uuid();
            setState(_extends({}, state, { definition: _extends({}, state.definition, {
                    join: _extends({}, state.definition.join, _defineProperty({}, joinId, {
                        value: { ref: 'pipe', id: newPipeId }
                    })),
                    pipe: _extends({}, state.definition.pipe, (_extends49 = {}, _defineProperty(_extends49, newPipeId, {
                        type: 'text',
                        value: 'Default text',
                        transformations: []
                    }), _defineProperty(_extends49, pipeId, _extends({}, state.definition.pipe[pipeId], {
                        transformations: state.definition.pipe[pipeId].transformations.concat({ ref: 'join', id: joinId })
                    })), _extends49))
                }) }));
        }
        if (transformation === 'toUpperCase') {
            var newId = uuid();
            setState(_extends({}, state, { definition: _extends({}, state.definition, {
                    toUpperCase: _extends({}, state.definition.toUpperCase, _defineProperty({}, newId, {})),
                    pipe: _extends({}, state.definition.pipe, _defineProperty({}, pipeId, _extends({}, state.definition.pipe[pipeId], {
                        transformations: state.definition.pipe[pipeId].transformations.concat({ ref: 'toUpperCase', id: newId })
                    })))
                }) }));
        }
        if (transformation === 'toLowerCase') {
            var _newId = uuid();
            setState(_extends({}, state, { definition: _extends({}, state.definition, {
                    toLowerCase: _extends({}, state.definition.toLowerCase, _defineProperty({}, _newId, {})),
                    pipe: _extends({}, state.definition.pipe, _defineProperty({}, pipeId, _extends({}, state.definition.pipe[pipeId], {
                        transformations: state.definition.pipe[pipeId].transformations.concat({ ref: 'toLowerCase', id: _newId })
                    })))
                }) }));
        }
        if (transformation === 'toText') {
            var _newId2 = uuid();
            setState(_extends({}, state, { definition: _extends({}, state.definition, {
                    toText: _extends({}, state.definition.toText, _defineProperty({}, _newId2, {})),
                    pipe: _extends({}, state.definition.pipe, _defineProperty({}, pipeId, _extends({}, state.definition.pipe[pipeId], {
                        transformations: state.definition.pipe[pipeId].transformations.concat({ ref: 'toText', id: _newId2 })
                    })))
                }) }));
        }
        if (transformation === 'add') {
            var _extends57;

            var _newPipeId = uuid();
            var addId = uuid();
            setState(_extends({}, state, { definition: _extends({}, state.definition, {
                    add: _extends({}, state.definition.add, _defineProperty({}, addId, {
                        value: { ref: 'pipe', id: _newPipeId }
                    })),
                    pipe: _extends({}, state.definition.pipe, (_extends57 = {}, _defineProperty(_extends57, _newPipeId, {
                        type: 'number',
                        value: 0,
                        transformations: []
                    }), _defineProperty(_extends57, pipeId, _extends({}, state.definition.pipe[pipeId], {
                        transformations: state.definition.pipe[pipeId].transformations.concat({ ref: 'add', id: addId })
                    })), _extends57))
                }) }));
        }
        if (transformation === 'subtract') {
            var _extends59;

            var _newPipeId2 = uuid();
            var subtractId = uuid();
            setState(_extends({}, state, { definition: _extends({}, state.definition, {
                    subtract: _extends({}, state.definition.subtract, _defineProperty({}, subtractId, {
                        value: { ref: 'pipe', id: _newPipeId2 }
                    })),
                    pipe: _extends({}, state.definition.pipe, (_extends59 = {}, _defineProperty(_extends59, _newPipeId2, {
                        type: 'number',
                        value: 0,
                        transformations: []
                    }), _defineProperty(_extends59, pipeId, _extends({}, state.definition.pipe[pipeId], {
                        transformations: state.definition.pipe[pipeId].transformations.concat({ ref: 'subtract', id: subtractId })
                    })), _extends59))
                }) }));
        }
    }
    function RESET_APP_STATE() {
        app.setCurrentState(app.createDefaultState());
        setState(_extends({}, state, { eventStack: [] }));
    }
    function RESET_APP_DEFINITION() {
        if (state.definition !== appDefinition) {
            setState(_extends({}, state, { definition: _extends({}, appDefinition) }));
        }
    }
    function FULL_SCREEN_CLICKED(value) {
        if (value !== state.fullScreen) {
            setState(_extends({}, state, { fullScreen: value }));
        }
    }

    var boxIcon = (0, _h2.default)('svg', {
        attrs: { width: 14, height: 15 },
        style: { cursor: 'pointer', padding: '0 7px 0 0' }
    }, [(0, _h2.default)('rect', { attrs: { x: 2, y: 2, width: 12, height: 12, fill: 'none', transition: 'all 0.2s', stroke: 'currentcolor', 'stroke-width': '2' } })]);
    var ifIcon = (0, _h2.default)('svg', {
        attrs: { width: 14, height: 14 },
        style: { cursor: 'pointer', padding: '0 7px 0 0' }
    }, [(0, _h2.default)('text', { attrs: { x: 3, y: 14, fill: 'currentcolor' } }, '?')]);
    var numberIcon = (0, _h2.default)('svg', {
        attrs: { width: 14, height: 14 },
        style: { cursor: 'pointer', padding: '0 7px 0 0' }
    }, [(0, _h2.default)('text', { attrs: { x: 0, y: 14, fill: 'currentcolor' } }, '№')]);
    var listIcon = (0, _h2.default)('svg', {
        attrs: { width: 14, height: 14 },
        style: { cursor: 'pointer', padding: '0 7px 0 0' }
    }, [(0, _h2.default)('circle', { attrs: { r: 2, cx: 2, cy: 2, transition: 'all 0.2s', fill: 'currentcolor' } }), (0, _h2.default)('rect', { attrs: { x: 6, y: 1, width: 8, transition: 'all 0.2s', height: 2, fill: 'currentcolor' } }), (0, _h2.default)('circle', { attrs: { r: 2, cx: 2, cy: 7, transition: 'all 0.2s', fill: 'currentcolor' } }), (0, _h2.default)('rect', { attrs: { x: 6, y: 6, width: 8, transition: 'all 0.2s', height: 2, fill: 'currentcolor' } }), (0, _h2.default)('circle', { attrs: { r: 2, cx: 2, cy: 12, transition: 'all 0.2s', fill: 'currentcolor' } }), (0, _h2.default)('rect', { attrs: { x: 6, y: 11, width: 8, transition: 'all 0.2s', height: 2, fill: 'currentcolor' } })]);
    var inputIcon = (0, _h2.default)('svg', {
        attrs: { viewBox: '0 0 16 16', width: 14, height: 14 },
        style: { cursor: 'pointer', padding: '0 7px 0 0' }
    }, [(0, _h2.default)('path', { attrs: { d: 'M 15,2 11,2 C 10.447,2 10,1.552 10,1 10,0.448 10.447,0 11,0 l 4,0 c 0.553,0 1,0.448 1,1 0,0.552 -0.447,1 -1,1 z m -2,14 c -0.553,0 -1,-0.447 -1,-1 L 12,1 c 0,-0.552 0.447,-1 1,-1 0.553,0 1,0.448 1,1 l 0,14 c 0,0.553 -0.447,1 -1,1 z m 2,0 -4,0 c -0.553,0 -1,-0.447 -1,-1 0,-0.553 0.447,-1 1,-1 l 4,0 c 0.553,0 1,0.447 1,1 0,0.553 -0.447,1 -1,1 z', fill: 'currentcolor' } }), (0, _h2.default)('path', { attrs: { d: 'M 9.8114827,4.2360393 C 9.6547357,4.5865906 9.3039933,4.8295854 8.8957233,4.8288684 L 1.2968926,4.8115404 1.3169436,2.806447 8.9006377,2.828642 c 0.552448,0.00165 0.9993074,0.4501223 0.9976564,1.0025698 -2.1e-5,0.1445856 -0.0313,0.2806734 -0.08681,0.404827 z', fill: 'currentcolor' } }), (0, _h2.default)('path', { attrs: { d: 'm 9.8114827,11.738562 c -0.156747,0.350551 -0.5074894,0.593546 -0.9157594,0.592829 l -7.5988307,-0.01733 0.020051,-2.005093 7.5836941,0.02219 c 0.552448,0.0016 0.9993074,0.450122 0.9976564,1.00257 -2.1e-5,0.144585 -0.0313,0.280673 -0.08681,0.404827 z', fill: 'currentcolor' } }), (0, _h2.default)('path', { attrs: { d: 'm 1.2940583,12.239836 0.01704,-9.4450947 1.9714852,0.024923 -0.021818,9.4262797 z', fill: 'currentcolor' } })]);
    var textIcon = (0, _h2.default)('svg', {
        attrs: { viewBox: '0 0 300 300', width: 14, height: 14 },
        style: { cursor: 'pointer', padding: '0 7px 0 0' }
    }, [(0, _h2.default)('path', { attrs: { d: 'M 0 0 L 0 85.8125 L 27.03125 85.8125 C 36.617786 44.346316 67.876579 42.179793 106.90625 42.59375 L 106.90625 228.375 C 107.31101 279.09641 98.908386 277.33602 62.125 277.5 L 62.125 299.5625 L 149 299.5625 L 150.03125 299.5625 L 236.90625 299.5625 L 236.90625 277.5 C 200.12286 277.336 191.72024 279.09639 192.125 228.375 L 192.125 42.59375 C 231.15467 42.17975 262.41346 44.346304 272 85.8125 L 299.03125 85.8125 L 299.03125 0 L 150.03125 0 L 149 0 L 0 0 z', fill: 'currentcolor' } })]);
    var folderIcon = (0, _h2.default)('svg', {
        attrs: { viewBox: '0 0 24 24', width: 14, height: 14, fill: 'currentcolor' },
        style: { cursor: 'pointer', padding: '0 7px 0 0' }
    }, [(0, _h2.default)('path', { attrs: { d: 'M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z' } }), (0, _h2.default)('path', { attrs: { d: 'M0 0h24v24H0z', fill: "none" } })]);

    function render() {
        var currentRunningState = app.getCurrentState();
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
                }, [displState.title])]), (0, _h2.default)('div', { style: { flex: '0', cursor: 'default', color: pipe.transformations.length > 0 ? '#bdbdbd' : displState.type === type ? 'green' : 'red' } }, displState.type)]), (0, _h2.default)('div', { style: { paddingLeft: '15px' } }, listTransformations(pipe.transformations, pipe.type)), (0, _h2.default)('div', state.selectedPipeId === ref.id ? pipe.transformations.length === 0 ? genTransformators(displState.type) : pipe.transformations[pipe.transformations.length - 1].ref === 'add' || pipe.transformations[pipe.transformations.length - 1].ref === 'subtract' ? genTransformators('number') : genTransformators('text') : [])]);
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
            if (stateId === '_rootNameSpace') {
                return (0, _h2.default)('div', currentNameSpace.children.map(function (ref) {
                    return ref.ref === 'state' ? listState(ref.id) : listNameSpace(ref.id);
                }));
            }
            var closed = state.viewFoldersClosed[stateId] || state.selectedStateNodeId !== stateId && currentNameSpace.children.length === 0;
            return (0, _h2.default)('div', {
                style: {
                    position: 'relative'
                }
            }, [(0, _h2.default)('div', [(0, _h2.default)('svg', {
                attrs: { width: 12, height: 16 },
                style: { cursor: 'pointer', padding: '0 5px', transform: closed ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'all 0.2s' },
                on: {
                    click: [VIEW_FOLDER_CLICKED, stateId]
                }
            }, [(0, _h2.default)('polygon', { attrs: { points: '12,8 0,1 3,8 0,15' }, style: { fill: state.selectedStateNodeId === stateId ? '#eab65c' : 'white', transition: 'fill 0.2s' } })]), state.editingTitleNodeId === stateId ? editingNode() : (0, _h2.default)('span', { style: { cursor: 'pointer' }, on: { dblclick: [EDIT_VIEW_NODE_TITLE, stateId] } }, [(0, _h2.default)('span', { style: { color: state.selectedStateNodeId === stateId ? '#eab65c' : 'white', transition: 'color 0.2s' } }, currentNameSpace.title)])]), (0, _h2.default)('div', { style: { display: closed ? 'none' : 'block', paddingLeft: '10px', paddingBottom: '5px', transition: 'border-color 0.2s' } }, [].concat(_toConsumableArray(currentNameSpace.children.map(function (ref) {
                return ref.ref === 'state' ? listState(ref.id) : listNameSpace(ref.id);
            }))))]);
        }
        function listState(stateId) {
            var currentState = state.definition.state[stateId];
            function editingNode() {
                return (0, _h2.default)('input', {
                    style: {
                        color: 'white',
                        outline: 'none',
                        padding: '4px 7px',
                        boxShadow: 'none',
                        display: 'inline',
                        border: 'none',
                        background: 'none',
                        font: 'inherit',
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        flex: '0 0 auto'
                    },
                    on: {
                        input: [CHANGE_STATE_NODE_TITLE, stateId]
                    },
                    liveProps: {
                        value: currentState.title
                    },
                    attrs: {
                        'data-istitleeditor': true
                    }
                });
            }
            return (0, _h2.default)('div', {
                style: {
                    cursor: 'pointer',
                    position: 'relative',
                    fontSize: '14px'
                }
            }, [(0, _h2.default)('span', { style: { display: 'flex', flexWrap: 'wrap' } }, [(0, _h2.default)('span', { style: { flex: '0 0 auto', position: 'relative', transform: 'translateZ(0)', margin: '7px 7px 0 0', boxShadow: 'inset 0 0 0 2px ' + (state.selectedStateNodeId === stateId ? '#eab65c' : '#828282'), background: '#444', padding: '4px 7px' } }, [(0, _h2.default)('span', { style: { opacity: state.editingTitleNodeId === stateId ? '0' : '1', color: 'white', display: 'inline-block' }, on: { click: [STATE_NODE_SELECTED, stateId], dblclick: [EDIT_VIEW_NODE_TITLE, stateId] } }, currentState.title), state.editingTitleNodeId === stateId ? editingNode() : (0, _h2.default)('span')]), function () {
                var noStyleInput = {
                    color: currentRunningState[stateId] !== state.definition.state[stateId].defaultValue ? 'rgb(91, 204, 91)' : 'white',
                    background: 'none',
                    outline: 'none',
                    display: 'inline',
                    flex: '1',
                    minWidth: '50px',
                    border: 'none',
                    padding: '10px 7px 4px 7px',
                    boxShadow: 'inset 0 -2px 0 0 ' + (state.selectedStateNodeId === stateId ? '#eab65c' : '#828282')
                };
                if (currentState.type === 'text') return (0, _h2.default)('input', { attrs: { type: 'text' }, liveProps: { value: currentRunningState[stateId] }, style: noStyleInput, on: { input: [CHANGE_CURRENT_STATE_TEXT_VALUE, stateId] } });
                if (currentState.type === 'number') return (0, _h2.default)('input', { attrs: { type: 'number' }, liveProps: { value: currentRunningState[stateId] }, style: noStyleInput, on: { input: [CHANGE_CURRENT_STATE_NUMBER_VALUE, stateId] } });
                if (currentState.type === 'table') {
                    var _ret = function () {
                        var table = currentRunningState[stateId];
                        return {
                            v: (0, _h2.default)('div', {
                                style: {
                                    background: '#828183',
                                    width: '100%',
                                    flex: '0 0 100%'
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
            }()]), state.selectedStateNodeId === stateId ? (0, _h2.default)('span', currentState.mutators.map(function (mutatorRef) {
                var mutator = state.definition[mutatorRef.ref][mutatorRef.id];
                var event = state.definition[mutator.event.ref][mutator.event.id];
                var emitter = state.definition[event.emitter.ref][event.emitter.id];
                return (0, _h2.default)('div', { style: {
                        display: 'flex',
                        cursor: 'pointer',
                        alignItems: 'center',
                        background: '#444',
                        paddingTop: '3px',
                        paddingBottom: '3px',
                        color: state.selectedViewNode.id === event.emitter.id ? '#53B2ED' : 'white',
                        transition: '0.2s all',
                        minWidth: '100%'
                    }, on: { click: [VIEW_NODE_SELECTED, event.emitter] } }, [(0, _h2.default)('span', { style: { flex: '0 0 auto', margin: '0 0 0 5px' } }, [event.emitter.ref === 'vNodeBox' ? boxIcon : event.emitter.ref === 'vNodeList' ? listIcon : event.emitter.ref === 'vNodeList' ? ifIcon : event.emitter.ref === 'vNodeInput' ? inputIcon : textIcon]), (0, _h2.default)('span', { style: { flex: '5 5 auto', margin: '0 5px 0 0', minWidth: '0', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' } }, emitter.title), (0, _h2.default)('span', { style: { flex: '0 0 auto', marginLeft: 'auto', marginRight: '5px', color: '#5bcc5b' } }, event.type)]);
            })) : (0, _h2.default)('span')]);
        }

        var stateComponent = (0, _h2.default)('div', { attrs: { class: 'better-scrollbar' }, style: { overflow: 'auto', flex: '1', padding: '0 10px' }, on: { click: [UNSELECT_STATE_NODE] } }, [listNameSpace('_rootNameSpace')]);

        function listBoxNode(nodeRef, depth) {
            var nodeId = nodeRef.id;
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
            }, [(0, _h2.default)('div', { style: {
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: depth * 20 + 8 + 'px',
                    background: '#444',
                    borderTop: '2px solid #4d4d4d',
                    borderBottom: '2px solid #333',
                    paddingTop: '1px',
                    whiteSpace: 'nowrap',
                    paddingBottom: '3px'
                } }, [nodeRef.ref === 'vNodeBox' && node.children.length > 0 ? (0, _h2.default)('svg', {
                attrs: { width: 12, height: 16 },
                style: { cursor: 'pointer', padding: '0 5px', transform: closed ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'all 0.2s', marginLeft: '-3px' },
                on: {
                    click: [VIEW_FOLDER_CLICKED, nodeId]
                }
            }, [(0, _h2.default)('polygon', { attrs: { points: '12,8 0,1 3,8 0,15' }, style: { fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white', transition: 'fill 0.2s' } })]) : (0, _h2.default)('span'), (0, _h2.default)('span', { style: { color: state.selectedViewNode.id === nodeId ? '#53B2ED' : '#bdbdbd' }, on: { click: [VIEW_NODE_SELECTED, nodeRef] } }, [nodeRef.ref === 'vNodeBox' ? boxIcon : nodeRef.ref === 'vNodeList' ? listIcon : ifIcon]), state.editingTitleNodeId === nodeId ? editingNode() : (0, _h2.default)('span', { style: { flex: '1', cursor: 'pointer', color: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white', transition: 'color 0.2s' }, on: { click: [VIEW_NODE_SELECTED, nodeRef], dblclick: [EDIT_VIEW_NODE_TITLE, nodeId] } }, node.title)]), (0, _h2.default)('div', {
                style: { display: closed ? 'none' : 'block', transition: 'border-color 0.2s' }
            }, [].concat(_toConsumableArray(node.children.map(function (ref) {
                if (ref.ref === 'vNodeText') return simpleNode(ref, depth + 1);
                if (ref.ref === 'vNodeBox' || ref.ref === 'vNodeList' || ref.ref === 'vNodeIf') return listBoxNode(ref, depth + 1);
                if (ref.ref === 'vNodeInput') return simpleNode(ref, depth + 1);
            }))))]);
        }
        function simpleNode(nodeRef, depth) {
            var nodeId = nodeRef.id;
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
            return (0, _h2.default)('div', {
                style: {
                    cursor: 'pointer',
                    position: 'relative',
                    paddingLeft: depth * 20 + 8 + 'px',
                    background: '#444',
                    borderTop: '2px solid #4d4d4d',
                    borderBottom: '2px solid #333',
                    paddingTop: '1px',
                    whiteSpace: 'nowrap',
                    paddingBottom: '3px'
                },
                on: { click: [VIEW_NODE_SELECTED, nodeRef], dblclick: [EDIT_VIEW_NODE_TITLE, nodeId] }
            }, [(0, _h2.default)('span', { style: { color: state.selectedViewNode.id === nodeId ? '#53B2ED' : '#bdbdbd' } }, [nodeRef.ref === 'vNodeInput' ? inputIcon : textIcon]), state.editingTitleNodeId === nodeId ? editingNode() : (0, _h2.default)('span', { style: { color: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white', transition: 'color 0.2s' } }, node.title)]);
        }

        var propsComponent = (0, _h2.default)('div', {
            style: {
                background: state.selectedViewSubMenu === 'props' ? '#4d4d4d' : '#3d3d3d',
                padding: '10px 0',
                flex: '1',
                cursor: 'pointer',
                textAlign: 'center'
            },
            on: {
                click: [SELECT_VIEW_SUBMENU, 'props']
            }
        }, 'data');
        var styleComponent = (0, _h2.default)('div', {
            style: {
                background: state.selectedViewSubMenu === 'style' ? '#4d4d4d' : '#3d3d3d',
                padding: '10px 0',
                flex: '1',
                borderRight: '1px solid #222',
                borderLeft: '1px solid #222',
                textAlign: 'center',
                cursor: 'pointer'
            },
            on: {
                click: [SELECT_VIEW_SUBMENU, 'style']
            }
        }, 'style');
        var eventsComponent = (0, _h2.default)('div', {
            style: {
                background: state.selectedViewSubMenu === 'events' ? '#4d4d4d' : '#3d3d3d',
                padding: '10px 0',
                flex: '1',
                textAlign: 'center',
                cursor: 'pointer'
            },
            on: {
                click: [SELECT_VIEW_SUBMENU, 'events']
            }
        }, 'events');

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
                        }, 'no data required');
                    }
                    if (state.selectedViewNode.ref === 'vNodeText') {
                        return (0, _h2.default)('div', [(0, _h2.default)('div', {
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
                        return (0, _h2.default)('div', [(0, _h2.default)('div', {
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
                return (0, _h2.default)('div', { attrs: { class: 'better-scrollbar' }, style: { overflow: 'auto' } }, [].concat(_toConsumableArray(Object.keys(selectedStyle).map(function (key) {
                    return (0, _h2.default)('div', { style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end'
                        } }, [(0, _h2.default)('span', key), (0, _h2.default)('input', {
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
                    })]);
                })), [(0, _h2.default)('div', { style: {} }, styles.filter(function (key) {
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
                }))]));
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
                            color: 'white',
                            transition: 'color 0.2s',
                            fontSize: '14px',
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
                    left: '-15px',
                    transform: 'translate(-100%, 0)',
                    marginRight: '8px',
                    top: '50%',
                    height: '49.5%',
                    display: 'flex'
                }
            }, [(0, _h2.default)('div', { style: { flex: '1', display: 'flex', flexDirection: 'column', background: '#4d4d4d', width: state.subEditorWidth + 'px', border: '3px solid #222' } }, [(0, _h2.default)('div', { style: { flex: '0 0 auto' } }, [(0, _h2.default)('div', { style: {
                    display: 'flex',
                    cursor: 'default',
                    alignItems: 'center',
                    background: '#222',
                    paddingTop: '2px',
                    paddingBottom: '5px',
                    color: '#53B2ED',
                    minWidth: '100%'
                } }, [(0, _h2.default)('span', { style: { flex: '0 0 auto', margin: '0 0 0 5px' } }, [state.selectedViewNode.ref === 'vNodeBox' ? boxIcon : state.selectedViewNode.ref === 'vNodeList' ? listIcon : state.selectedViewNode.ref === 'vNodeList' ? ifIcon : state.selectedViewNode.ref === 'vNodeInput' ? inputIcon : textIcon]), (0, _h2.default)('span', { style: { flex: '5 5 auto', margin: '0 5px 0 0', minWidth: '0', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' } }, selectedNode.title), (0, _h2.default)('span', { style: { flex: '0 0 auto', marginLeft: 'auto', cursor: 'pointer', marginRight: '5px', color: 'white' }, on: { click: [UNSELECT_VIEW_NODE] } }, 'x')])]), fullVNode ? (0, _h2.default)('div', { style: { display: 'flex', flex: '0 0 auto', fontFamily: "'Comfortaa', sans-serif" } }, [propsComponent, styleComponent, eventsComponent]) : (0, _h2.default)('span'), dragSubComponent, state.selectedViewSubMenu === 'props' || !fullVNode ? genpropsSubmenuComponent() : state.selectedViewSubMenu === 'style' ? genstyleSubmenuComponent() : state.selectedViewSubMenu === 'events' ? geneventsSubmenuComponent() : (0, _h2.default)('span', 'Error, no such menu')])]);
        }

        var addStateComponent = (0, _h2.default)('div', { style: { flex: '0 auto', marginLeft: state.rightOpen ? '-10px' : '0', border: '3px solid #222', borderRight: 'none', background: '#333', height: '40px', display: 'flex', alignItems: 'center' } }, [(0, _h2.default)('span', { style: { fontFamily: "'Comfortaa', sans-serif", fontSize: '0.9em', cursor: 'pointer', padding: '0 5px' } }, 'add state: '), (0, _h2.default)('span', { style: { display: 'inline-block' }, on: { click: [ADD_STATE, '_rootNameSpace', 'text'] } }, [textIcon]), (0, _h2.default)('span', { on: { click: [ADD_STATE, '_rootNameSpace', 'number'] } }, [numberIcon]), (0, _h2.default)('span', { on: { click: [ADD_STATE, '_rootNameSpace', 'boolean'] } }, [ifIcon]), (0, _h2.default)('span', { on: { click: [ADD_STATE, '_rootNameSpace', 'table'] } }, [listIcon]), (0, _h2.default)('span', { on: { click: [ADD_STATE, '_rootNameSpace', 'folder'] } }, [folderIcon])]);

        var addViewNodeComponent = (0, _h2.default)('div', { style: { flex: '0 auto', marginLeft: state.rightOpen ? '-10px' : '0', border: '3px solid #222', borderRight: 'none', background: '#333', height: '40px', display: 'flex', alignItems: 'center' } }, [(0, _h2.default)('span', { style: { fontFamily: "'Comfortaa', sans-serif", fontSize: '0.9em', padding: '0 10px' } }, 'add component: '), (0, _h2.default)('span', { on: { click: [ADD_NODE, state.selectedViewNode, 'box'] } }, [boxIcon]), (0, _h2.default)('span', { on: { click: [ADD_NODE, state.selectedViewNode, 'input'] } }, [inputIcon]), (0, _h2.default)('span', { on: { click: [ADD_NODE, state.selectedViewNode, 'text'] } }, [textIcon])]);

        var viewComponent = (0, _h2.default)('div', { attrs: { class: 'better-scrollbar' }, style: { overflow: 'auto', position: 'relative', flex: '1' }, on: { click: [UNSELECT_VIEW_NODE] } }, [listBoxNode({ ref: 'vNodeBox', id: '_rootNode' }, 0)]);

        var rightComponent = (0, _h2.default)('div', {
            style: {
                display: 'flex',
                flexDirection: 'column',
                position: 'absolute',
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
        }, [dragComponentRight, addStateComponent, stateComponent, addViewNodeComponent, viewComponent, state.selectedViewNode.ref ? generateEditNodeComponent() : (0, _h2.default)('span')]);

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
                border: 'none',
                color: 'white',
                fontFamily: "'Comfortaa', sans-serif",
                fontSize: '16px'
            }
        }, [(0, _h2.default)('div', { style: {
                background: '#444444',
                border: 'none',
                color: 'white',
                display: 'inline-block',
                padding: '15px 20px',
                margin: '13px 13px 0 0',
                cursor: 'pointer'
            },
            on: {
                click: [FULL_SCREEN_CLICKED, true]
            }
        }, 'full screen'), (0, _h2.default)('div', { style: {
                background: '#444444',
                border: 'none',
                color: 'white',
                display: 'inline-block',
                padding: '15px 20px',
                margin: '13px 13px 0 0',
                cursor: 'pointer'
            },
            on: {
                click: RESET_APP_STATE
            }
        }, 'reset state'), (0, _h2.default)('div', { style: {
                background: '#444444',
                border: 'none',
                color: 'white',
                display: 'inline-block',
                padding: '15px 20px',
                margin: '13px 13px 0 0',
                cursor: 'pointer'
            },
            on: {
                click: RESET_APP_DEFINITION
            }
        }, 'reset demo')])]);
        var leftComponent = (0, _h2.default)('div', {
            style: {
                display: 'flex',
                flexDirection: 'column',
                position: 'absolute',
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
                overflow: 'auto'
            }
        }, state.eventStack.filter(function (eventData) {
            return state.definition.event[eventData.eventId] !== undefined;
        }).reverse() // mutates the array, but it was already copied with filter
        .map(function (eventData, index) {
            var event = state.definition.event[eventData.eventId];
            var emitter = state.definition[event.emitter.ref][event.emitter.id];
            // no idea why this key works, don't touch it, probably rerenders more than needed, but who cares
            return (0, _h2.default)('div', { key: event.emitter.id + index, style: { marginBottom: '10px' } }, [(0, _h2.default)('div', { style: {
                    display: 'flex',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    alignItems: 'center',
                    background: '#444',
                    paddingTop: '3px',
                    paddingBottom: '3px',
                    color: state.selectedViewNode.id === event.emitter.id ? '#53B2ED' : 'white',
                    transition: '0.2s all',
                    minWidth: '100%'
                }, on: { click: [VIEW_NODE_SELECTED, event.emitter] } }, [(0, _h2.default)('span', { style: { flex: '0 0 auto', margin: '0 0 0 5px' } }, [event.emitter.ref === 'vNodeBox' ? boxIcon : event.emitter.ref === 'vNodeList' ? listIcon : event.emitter.ref === 'vNodeList' ? ifIcon : event.emitter.ref === 'vNodeInput' ? inputIcon : textIcon]), (0, _h2.default)('span', { style: { flex: '5 5 auto', margin: '0 5px 0 0', minWidth: '0', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' } }, emitter.title), (0, _h2.default)('span', { style: { flex: '0 0 auto', fontFamily: "'Comfortaa', sans-serif", fontSize: '0.9em', marginLeft: 'auto', marginRight: '5px', color: '#5bcc5b' } }, event.type)]), (0, _h2.default)('div', { style: { paddingLeft: '10px', whiteSpace: 'nowrap' } }, Object.keys(eventData.mutations).filter(function (stateId) {
                return state.definition.state[stateId] !== undefined;
            }).map(function (stateId) {
                return (0, _h2.default)('span', [(0, _h2.default)('span', { on: { click: [STATE_NODE_SELECTED, stateId] }, style: { cursor: 'pointer', fontSize: '14px', color: 'white', boxShadow: 'inset 0 0 0 2px ' + (state.selectedStateNodeId === stateId ? '#eab65c' : '#828282'), background: '#444', padding: '2px 5px', marginRight: '5px', display: 'inline-block', transition: 'all 0.2s' } }, state.definition.state[stateId].title), (0, _h2.default)('span', { style: { color: '#8e8e8e' } }, eventData.previousState[stateId].toString() + ' –› '), (0, _h2.default)('span', eventData.mutations[stateId].toString())]);
            }))]);
        }))]);
        var renderViewComponent = (0, _h2.default)('div', {
            style: {
                flex: '1 auto',
                background: "\n                    radial-gradient(black 5%, transparent 16%) 0 0,\n                    radial-gradient(black 5%, transparent 16%) 8px 8px,\n                    radial-gradient(rgba(255,255,255,.1) 5%, transparent 20%) 0 1px,\n                    radial-gradient(rgba(255,255,255,.1) 5%, transparent 20%) 8px 9px",
                backgroundColor: '#333',
                backgroundSize: '16px 16px',
                display: 'relative',
                overflow: 'auto'
            }
        }, [(0, _h2.default)('div', { style: function () {
                var topMenuHeight = 75;
                var widthLeft = window.innerWidth - ((state.leftOpen ? state.editorLeftWidth : 0) + (state.rightOpen ? state.editorRightWidth : 0));
                var heightLeft = window.innerHeight - topMenuHeight;
                return {
                    width: state.fullScreen ? '100vw' : widthLeft - 40 + 'px',
                    height: state.fullScreen ? '100vh' : heightLeft - 40 + 'px',
                    background: '#ffffff',
                    zIndex: state.fullScreen ? '99999' : undefined,
                    boxShadow: 'rgba(0, 0, 0, 0.247059) 0px 14px 45px, rgba(0, 0, 0, 0.219608) 0px 10px 18px',
                    position: 'fixed',
                    transition: state.fullScreen ? 'all 0.3s' : 'none',
                    top: state.fullScreen ? '0px' : 20 + 75 + 'px',
                    left: state.fullScreen ? '0px' : (state.leftOpen ? state.editorLeftWidth : 0) + 20 + 'px'
                };
            }() }, [state.fullScreen ? (0, _h2.default)('span', { style: { position: 'fixed', padding: '12px 10px', top: '0', right: '20px', border: '2px solid #333', borderTop: 'none', background: '#444', color: 'white', opacity: '0.8', cursor: 'pointer' }, on: { click: [FULL_SCREEN_CLICKED, false] } }, 'exit full screen') : (0, _h2.default)('span'), (0, _h2.default)('div', { style: { overflow: 'auto', width: '100%', height: '100%' } }, [app.vdom])])]);
        var mainRowComponent = (0, _h2.default)('div', {
            style: {
                display: 'flex',
                flex: '1',
                position: 'relative'
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

},{"../node_modules/big.js":1,"../ugnis_components/app.json":15,"./ugnis":14,"fastclick":2,"snabbdom":11,"snabbdom/h":3,"snabbdom/modules/attributes":6,"snabbdom/modules/class":7,"snabbdom/modules/eventlisteners":8,"snabbdom/modules/props":9,"snabbdom/modules/style":10}],14:[function(require,module,exports){
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

    var currentState = createDefaultState();

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

    var frozenShadow = 'inset 0 0 0 3px #3590df';

    function boxNode(ref) {
        var node = definition[ref.ref][ref.id];
        var style = resolve(node.style);
        var data = {
            style: frozen && selectedNodeInDevelopment.id === ref.id ? _extends({}, style, { transition: 'box-shadow 0.2s', boxShadow: style.boxShadow ? style.boxShadow + ' , ' + frozenShadow : frozenShadow }) : style,
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
        var style = resolve(node.style);
        var data = {
            style: frozen && selectedNodeInDevelopment.id === ref.id ? _extends({}, style, { transition: 'box-shadow 0.2s', boxShadow: style.boxShadow ? style.boxShadow + ' , ' + frozenShadow : frozenShadow }) : style,
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
        var style = resolve(node.style);
        var data = {
            style: frozen && selectedNodeInDevelopment.id === ref.id ? _extends({}, style, { transition: 'box-shadow 0.2s', boxShadow: style.boxShadow ? style.boxShadow + ' , ' + frozenShadow : frozenShadow }) : style,
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

    function createDefaultState() {
        return Object.keys(definition.state).map(function (key) {
            return definition.state[key];
        }).reduce(function (acc, def) {
            acc[def.ref] = def.defaultValue;
            return acc;
        }, {});
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
        _resolve: resolve,
        createDefaultState: createDefaultState
    };
};

},{"big.js":1,"snabbdom":11,"snabbdom/h":3,"snabbdom/modules/attributes":6,"snabbdom/modules/class":7,"snabbdom/modules/eventlisteners":8,"snabbdom/modules/props":9,"snabbdom/modules/style":10}],15:[function(require,module,exports){
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
            "value": "Number currently is: ",
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
            "value": "The number is even 🎉",
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
            "title": "Number currently",
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
            "title": "+ button",
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
            "title": "- button",
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
            "title": "is even",
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
            "title": "list of boxes",
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
            "title": "is number even",
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
        }
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
            "title": "number",
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
            "type": "click",
            "mutators": [
                {
                    "ref": "mutator",
                    "id": "as55d6d2-00db-8ab5-c332-882575f25426"
                }
            ],
            "emitter": {
                "ref": "vNodeText",
                "id": "1481d6d2-00db-8ab5-c332-882575f25425"
            },
            "data": []
        },
        "3a54d6d2-00db-8ab5-c332-882575f25426": {
            "type": "click",
            "mutators": [
                {
                    "ref": "mutator",
                    "id": "9dq8d6d2-00db-8ab5-c332-882575f25426"
                }
            ],
            "emitter": {
                "ref": "vNodeText",
                "id": "3481d6d2-00db-8ab5-c332-882575f25425"
            },
            "data": []
        }
    }
}
},{}]},{},[13])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmlnLmpzL2JpZy5qcyIsIm5vZGVfbW9kdWxlcy9mYXN0Y2xpY2svbGliL2Zhc3RjbGljay5qcyIsIm5vZGVfbW9kdWxlcy9zbmFiYmRvbS9oLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL2h0bWxkb21hcGkuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vaXMuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vbW9kdWxlcy9hdHRyaWJ1dGVzLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvY2xhc3MuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vbW9kdWxlcy9ldmVudGxpc3RlbmVycy5qcyIsIm5vZGVfbW9kdWxlcy9zbmFiYmRvbS9tb2R1bGVzL3Byb3BzLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvc3R5bGUuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vc25hYmJkb20uanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vdm5vZGUuanMiLCJzcmNcXGluZGV4LmpzIiwic3JjXFx1Z25pcy5qcyIsInVnbmlzX2NvbXBvbmVudHMvYXBwLmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdG5DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3owQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGJpZy5qcyB2My4xLjMgaHR0cHM6Ly9naXRodWIuY29tL01pa2VNY2wvYmlnLmpzL0xJQ0VOQ0UgKi9cclxuOyhmdW5jdGlvbiAoZ2xvYmFsKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4vKlxyXG4gIGJpZy5qcyB2My4xLjNcclxuICBBIHNtYWxsLCBmYXN0LCBlYXN5LXRvLXVzZSBsaWJyYXJ5IGZvciBhcmJpdHJhcnktcHJlY2lzaW9uIGRlY2ltYWwgYXJpdGhtZXRpYy5cclxuICBodHRwczovL2dpdGh1Yi5jb20vTWlrZU1jbC9iaWcuanMvXHJcbiAgQ29weXJpZ2h0IChjKSAyMDE0IE1pY2hhZWwgTWNsYXVnaGxpbiA8TThjaDg4bEBnbWFpbC5jb20+XHJcbiAgTUlUIEV4cGF0IExpY2VuY2VcclxuKi9cclxuXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBFRElUQUJMRSBERUZBVUxUUyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcblxyXG4gICAgLy8gVGhlIGRlZmF1bHQgdmFsdWVzIGJlbG93IG11c3QgYmUgaW50ZWdlcnMgd2l0aGluIHRoZSBzdGF0ZWQgcmFuZ2VzLlxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgbWF4aW11bSBudW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMgb2YgdGhlIHJlc3VsdHMgb2Ygb3BlcmF0aW9uc1xyXG4gICAgICogaW52b2x2aW5nIGRpdmlzaW9uOiBkaXYgYW5kIHNxcnQsIGFuZCBwb3cgd2l0aCBuZWdhdGl2ZSBleHBvbmVudHMuXHJcbiAgICAgKi9cclxuICAgIHZhciBEUCA9IDIwLCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gTUFYX0RQXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVGhlIHJvdW5kaW5nIG1vZGUgdXNlZCB3aGVuIHJvdW5kaW5nIHRvIHRoZSBhYm92ZSBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIDAgVG93YXJkcyB6ZXJvIChpLmUuIHRydW5jYXRlLCBubyByb3VuZGluZykuICAgICAgIChST1VORF9ET1dOKVxyXG4gICAgICAgICAqIDEgVG8gbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCByb3VuZCB1cC4gIChST1VORF9IQUxGX1VQKVxyXG4gICAgICAgICAqIDIgVG8gbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCB0byBldmVuLiAgIChST1VORF9IQUxGX0VWRU4pXHJcbiAgICAgICAgICogMyBBd2F5IGZyb20gemVyby4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKFJPVU5EX1VQKVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFJNID0gMSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMCwgMSwgMiBvciAzXHJcblxyXG4gICAgICAgIC8vIFRoZSBtYXhpbXVtIHZhbHVlIG9mIERQIGFuZCBCaWcuRFAuXHJcbiAgICAgICAgTUFYX0RQID0gMUU2LCAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIDEwMDAwMDBcclxuXHJcbiAgICAgICAgLy8gVGhlIG1heGltdW0gbWFnbml0dWRlIG9mIHRoZSBleHBvbmVudCBhcmd1bWVudCB0byB0aGUgcG93IG1ldGhvZC5cclxuICAgICAgICBNQVhfUE9XRVIgPSAxRTYsICAgICAgICAgICAgICAgICAgIC8vIDEgdG8gMTAwMDAwMFxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSBleHBvbmVudCB2YWx1ZSBhdCBhbmQgYmVuZWF0aCB3aGljaCB0b1N0cmluZyByZXR1cm5zIGV4cG9uZW50aWFsXHJcbiAgICAgICAgICogbm90YXRpb24uXHJcbiAgICAgICAgICogSmF2YVNjcmlwdCdzIE51bWJlciB0eXBlOiAtN1xyXG4gICAgICAgICAqIC0xMDAwMDAwIGlzIHRoZSBtaW5pbXVtIHJlY29tbWVuZGVkIGV4cG9uZW50IHZhbHVlIG9mIGEgQmlnLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIEVfTkVHID0gLTcsICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gLTEwMDAwMDBcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgZXhwb25lbnQgdmFsdWUgYXQgYW5kIGFib3ZlIHdoaWNoIHRvU3RyaW5nIHJldHVybnMgZXhwb25lbnRpYWxcclxuICAgICAgICAgKiBub3RhdGlvbi5cclxuICAgICAgICAgKiBKYXZhU2NyaXB0J3MgTnVtYmVyIHR5cGU6IDIxXHJcbiAgICAgICAgICogMTAwMDAwMCBpcyB0aGUgbWF4aW11bSByZWNvbW1lbmRlZCBleHBvbmVudCB2YWx1ZSBvZiBhIEJpZy5cclxuICAgICAgICAgKiAoVGhpcyBsaW1pdCBpcyBub3QgZW5mb3JjZWQgb3IgY2hlY2tlZC4pXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgRV9QT1MgPSAyMSwgICAgICAgICAgICAgICAgICAgLy8gMCB0byAxMDAwMDAwXHJcblxyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuICAgICAgICAvLyBUaGUgc2hhcmVkIHByb3RvdHlwZSBvYmplY3QuXHJcbiAgICAgICAgUCA9IHt9LFxyXG4gICAgICAgIGlzVmFsaWQgPSAvXi0/KFxcZCsoXFwuXFxkKik/fFxcLlxcZCspKGVbKy1dP1xcZCspPyQvaSxcclxuICAgICAgICBCaWc7XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBDcmVhdGUgYW5kIHJldHVybiBhIEJpZyBjb25zdHJ1Y3Rvci5cclxuICAgICAqXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGJpZ0ZhY3RvcnkoKSB7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVGhlIEJpZyBjb25zdHJ1Y3RvciBhbmQgZXhwb3J0ZWQgZnVuY3Rpb24uXHJcbiAgICAgICAgICogQ3JlYXRlIGFuZCByZXR1cm4gYSBuZXcgaW5zdGFuY2Ugb2YgYSBCaWcgbnVtYmVyIG9iamVjdC5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIG4ge251bWJlcnxzdHJpbmd8QmlnfSBBIG51bWVyaWMgdmFsdWUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gQmlnKG4pIHtcclxuICAgICAgICAgICAgdmFyIHggPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgLy8gRW5hYmxlIGNvbnN0cnVjdG9yIHVzYWdlIHdpdGhvdXQgbmV3LlxyXG4gICAgICAgICAgICBpZiAoISh4IGluc3RhbmNlb2YgQmlnKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG4gPT09IHZvaWQgMCA/IGJpZ0ZhY3RvcnkoKSA6IG5ldyBCaWcobik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIER1cGxpY2F0ZS5cclxuICAgICAgICAgICAgaWYgKG4gaW5zdGFuY2VvZiBCaWcpIHtcclxuICAgICAgICAgICAgICAgIHgucyA9IG4ucztcclxuICAgICAgICAgICAgICAgIHguZSA9IG4uZTtcclxuICAgICAgICAgICAgICAgIHguYyA9IG4uYy5zbGljZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGFyc2UoeCwgbik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIFJldGFpbiBhIHJlZmVyZW5jZSB0byB0aGlzIEJpZyBjb25zdHJ1Y3RvciwgYW5kIHNoYWRvd1xyXG4gICAgICAgICAgICAgKiBCaWcucHJvdG90eXBlLmNvbnN0cnVjdG9yIHdoaWNoIHBvaW50cyB0byBPYmplY3QuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICB4LmNvbnN0cnVjdG9yID0gQmlnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQmlnLnByb3RvdHlwZSA9IFA7XHJcbiAgICAgICAgQmlnLkRQID0gRFA7XHJcbiAgICAgICAgQmlnLlJNID0gUk07XHJcbiAgICAgICAgQmlnLkVfTkVHID0gRV9ORUc7XHJcbiAgICAgICAgQmlnLkVfUE9TID0gRV9QT1M7XHJcblxyXG4gICAgICAgIHJldHVybiBCaWc7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIFByaXZhdGUgZnVuY3Rpb25zXHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiBCaWcgeCBpbiBub3JtYWwgb3IgZXhwb25lbnRpYWxcclxuICAgICAqIG5vdGF0aW9uIHRvIGRwIGZpeGVkIGRlY2ltYWwgcGxhY2VzIG9yIHNpZ25pZmljYW50IGRpZ2l0cy5cclxuICAgICAqXHJcbiAgICAgKiB4IHtCaWd9IFRoZSBCaWcgdG8gZm9ybWF0LlxyXG4gICAgICogZHAge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICogdG9FIHtudW1iZXJ9IDEgKHRvRXhwb25lbnRpYWwpLCAyICh0b1ByZWNpc2lvbikgb3IgdW5kZWZpbmVkICh0b0ZpeGVkKS5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZm9ybWF0KHgsIGRwLCB0b0UpIHtcclxuICAgICAgICB2YXIgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBpbmRleCAobm9ybWFsIG5vdGF0aW9uKSBvZiB0aGUgZGlnaXQgdGhhdCBtYXkgYmUgcm91bmRlZCB1cC5cclxuICAgICAgICAgICAgaSA9IGRwIC0gKHggPSBuZXcgQmlnKHgpKS5lLFxyXG4gICAgICAgICAgICBjID0geC5jO1xyXG5cclxuICAgICAgICAvLyBSb3VuZD9cclxuICAgICAgICBpZiAoYy5sZW5ndGggPiArK2RwKSB7XHJcbiAgICAgICAgICAgIHJuZCh4LCBpLCBCaWcuUk0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFjWzBdKSB7XHJcbiAgICAgICAgICAgICsraTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRvRSkge1xyXG4gICAgICAgICAgICBpID0gZHA7XHJcblxyXG4gICAgICAgIC8vIHRvRml4ZWRcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjID0geC5jO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVjYWxjdWxhdGUgaSBhcyB4LmUgbWF5IGhhdmUgY2hhbmdlZCBpZiB2YWx1ZSByb3VuZGVkIHVwLlxyXG4gICAgICAgICAgICBpID0geC5lICsgaSArIDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBcHBlbmQgemVyb3M/XHJcbiAgICAgICAgZm9yICg7IGMubGVuZ3RoIDwgaTsgYy5wdXNoKDApKSB7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGkgPSB4LmU7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogdG9QcmVjaXNpb24gcmV0dXJucyBleHBvbmVudGlhbCBub3RhdGlvbiBpZiB0aGUgbnVtYmVyIG9mXHJcbiAgICAgICAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHNwZWNpZmllZCBpcyBsZXNzIHRoYW4gdGhlIG51bWJlciBvZiBkaWdpdHNcclxuICAgICAgICAgKiBuZWNlc3NhcnkgdG8gcmVwcmVzZW50IHRoZSBpbnRlZ2VyIHBhcnQgb2YgdGhlIHZhbHVlIGluIG5vcm1hbFxyXG4gICAgICAgICAqIG5vdGF0aW9uLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHJldHVybiB0b0UgPT09IDEgfHwgdG9FICYmIChkcCA8PSBpIHx8IGkgPD0gQmlnLkVfTkVHKSA/XHJcblxyXG4gICAgICAgICAgLy8gRXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICAgICAgICAoeC5zIDwgMCAmJiBjWzBdID8gJy0nIDogJycpICtcclxuICAgICAgICAgICAgKGMubGVuZ3RoID4gMSA/IGNbMF0gKyAnLicgKyBjLmpvaW4oJycpLnNsaWNlKDEpIDogY1swXSkgK1xyXG4gICAgICAgICAgICAgIChpIDwgMCA/ICdlJyA6ICdlKycpICsgaVxyXG5cclxuICAgICAgICAgIC8vIE5vcm1hbCBub3RhdGlvbi5cclxuICAgICAgICAgIDogeC50b1N0cmluZygpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUGFyc2UgdGhlIG51bWJlciBvciBzdHJpbmcgdmFsdWUgcGFzc2VkIHRvIGEgQmlnIGNvbnN0cnVjdG9yLlxyXG4gICAgICpcclxuICAgICAqIHgge0JpZ30gQSBCaWcgbnVtYmVyIGluc3RhbmNlLlxyXG4gICAgICogbiB7bnVtYmVyfHN0cmluZ30gQSBudW1lcmljIHZhbHVlLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBwYXJzZSh4LCBuKSB7XHJcbiAgICAgICAgdmFyIGUsIGksIG5MO1xyXG5cclxuICAgICAgICAvLyBNaW51cyB6ZXJvP1xyXG4gICAgICAgIGlmIChuID09PSAwICYmIDEgLyBuIDwgMCkge1xyXG4gICAgICAgICAgICBuID0gJy0wJztcclxuXHJcbiAgICAgICAgLy8gRW5zdXJlIG4gaXMgc3RyaW5nIGFuZCBjaGVjayB2YWxpZGl0eS5cclxuICAgICAgICB9IGVsc2UgaWYgKCFpc1ZhbGlkLnRlc3QobiArPSAnJykpIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoTmFOKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSBzaWduLlxyXG4gICAgICAgIHgucyA9IG4uY2hhckF0KDApID09ICctJyA/IChuID0gbi5zbGljZSgxKSwgLTEpIDogMTtcclxuXHJcbiAgICAgICAgLy8gRGVjaW1hbCBwb2ludD9cclxuICAgICAgICBpZiAoKGUgPSBuLmluZGV4T2YoJy4nKSkgPiAtMSkge1xyXG4gICAgICAgICAgICBuID0gbi5yZXBsYWNlKCcuJywgJycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRXhwb25lbnRpYWwgZm9ybT9cclxuICAgICAgICBpZiAoKGkgPSBuLnNlYXJjaCgvZS9pKSkgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgZXhwb25lbnQuXHJcbiAgICAgICAgICAgIGlmIChlIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgZSA9IGk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZSArPSArbi5zbGljZShpICsgMSk7XHJcbiAgICAgICAgICAgIG4gPSBuLnN1YnN0cmluZygwLCBpKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChlIDwgMCkge1xyXG5cclxuICAgICAgICAgICAgLy8gSW50ZWdlci5cclxuICAgICAgICAgICAgZSA9IG4ubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIGxlYWRpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yIChpID0gMDsgbi5jaGFyQXQoaSkgPT0gJzAnOyBpKyspIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpID09IChuTCA9IG4ubGVuZ3RoKSkge1xyXG5cclxuICAgICAgICAgICAgLy8gWmVyby5cclxuICAgICAgICAgICAgeC5jID0gWyB4LmUgPSAwIF07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIERldGVybWluZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yICg7IG4uY2hhckF0KC0tbkwpID09ICcwJzspIHtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgeC5lID0gZSAtIGkgLSAxO1xyXG4gICAgICAgICAgICB4LmMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIC8vIENvbnZlcnQgc3RyaW5nIHRvIGFycmF5IG9mIGRpZ2l0cyB3aXRob3V0IGxlYWRpbmcvdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoZSA9IDA7IGkgPD0gbkw7IHguY1tlKytdID0gK24uY2hhckF0KGkrKykpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSb3VuZCBCaWcgeCB0byBhIG1heGltdW0gb2YgZHAgZGVjaW1hbCBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBybS5cclxuICAgICAqIENhbGxlZCBieSBkaXYsIHNxcnQgYW5kIHJvdW5kLlxyXG4gICAgICpcclxuICAgICAqIHgge0JpZ30gVGhlIEJpZyB0byByb3VuZC5cclxuICAgICAqIGRwIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqIHJtIHtudW1iZXJ9IDAsIDEsIDIgb3IgMyAoRE9XTiwgSEFMRl9VUCwgSEFMRl9FVkVOLCBVUClcclxuICAgICAqIFttb3JlXSB7Ym9vbGVhbn0gV2hldGhlciB0aGUgcmVzdWx0IG9mIGRpdmlzaW9uIHdhcyB0cnVuY2F0ZWQuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHJuZCh4LCBkcCwgcm0sIG1vcmUpIHtcclxuICAgICAgICB2YXIgdSxcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIGkgPSB4LmUgKyBkcCArIDE7XHJcblxyXG4gICAgICAgIGlmIChybSA9PT0gMSkge1xyXG5cclxuICAgICAgICAgICAgLy8geGNbaV0gaXMgdGhlIGRpZ2l0IGFmdGVyIHRoZSBkaWdpdCB0aGF0IG1heSBiZSByb3VuZGVkIHVwLlxyXG4gICAgICAgICAgICBtb3JlID0geGNbaV0gPj0gNTtcclxuICAgICAgICB9IGVsc2UgaWYgKHJtID09PSAyKSB7XHJcbiAgICAgICAgICAgIG1vcmUgPSB4Y1tpXSA+IDUgfHwgeGNbaV0gPT0gNSAmJlxyXG4gICAgICAgICAgICAgIChtb3JlIHx8IGkgPCAwIHx8IHhjW2kgKyAxXSAhPT0gdSB8fCB4Y1tpIC0gMV0gJiAxKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHJtID09PSAzKSB7XHJcbiAgICAgICAgICAgIG1vcmUgPSBtb3JlIHx8IHhjW2ldICE9PSB1IHx8IGkgPCAwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG1vcmUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIGlmIChybSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3dFcnIoJyFCaWcuUk0hJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpIDwgMSB8fCAheGNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChtb3JlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gMSwgMC4xLCAwLjAxLCAwLjAwMSwgMC4wMDAxIGV0Yy5cclxuICAgICAgICAgICAgICAgIHguZSA9IC1kcDtcclxuICAgICAgICAgICAgICAgIHguYyA9IFsxXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBaZXJvLlxyXG4gICAgICAgICAgICAgICAgeC5jID0gW3guZSA9IDBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSBhbnkgZGlnaXRzIGFmdGVyIHRoZSByZXF1aXJlZCBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAgICAgICAgeGMubGVuZ3RoID0gaS0tO1xyXG5cclxuICAgICAgICAgICAgLy8gUm91bmQgdXA/XHJcbiAgICAgICAgICAgIGlmIChtb3JlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gUm91bmRpbmcgdXAgbWF5IG1lYW4gdGhlIHByZXZpb3VzIGRpZ2l0IGhhcyB0byBiZSByb3VuZGVkIHVwLlxyXG4gICAgICAgICAgICAgICAgZm9yICg7ICsreGNbaV0gPiA5Oykge1xyXG4gICAgICAgICAgICAgICAgICAgIHhjW2ldID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpLS0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyt4LmU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhjLnVuc2hpZnQoMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoaSA9IHhjLmxlbmd0aDsgIXhjWy0taV07IHhjLnBvcCgpKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhyb3cgYSBCaWdFcnJvci5cclxuICAgICAqXHJcbiAgICAgKiBtZXNzYWdlIHtzdHJpbmd9IFRoZSBlcnJvciBtZXNzYWdlLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiB0aHJvd0VycihtZXNzYWdlKSB7XHJcbiAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcclxuICAgICAgICBlcnIubmFtZSA9ICdCaWdFcnJvcic7XHJcblxyXG4gICAgICAgIHRocm93IGVycjtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gUHJvdG90eXBlL2luc3RhbmNlIG1ldGhvZHNcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIGFic29sdXRlIHZhbHVlIG9mIHRoaXMgQmlnLlxyXG4gICAgICovXHJcbiAgICBQLmFicyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgeCA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKHRoaXMpO1xyXG4gICAgICAgIHgucyA9IDE7XHJcblxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVyblxyXG4gICAgICogMSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZ3JlYXRlciB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSxcclxuICAgICAqIC0xIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBsZXNzIHRoYW4gdGhlIHZhbHVlIG9mIEJpZyB5LCBvclxyXG4gICAgICogMCBpZiB0aGV5IGhhdmUgdGhlIHNhbWUgdmFsdWUuXHJcbiAgICAqL1xyXG4gICAgUC5jbXAgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciB4TmVnLFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIHljID0gKHkgPSBuZXcgeC5jb25zdHJ1Y3Rvcih5KSkuYyxcclxuICAgICAgICAgICAgaSA9IHgucyxcclxuICAgICAgICAgICAgaiA9IHkucyxcclxuICAgICAgICAgICAgayA9IHguZSxcclxuICAgICAgICAgICAgbCA9IHkuZTtcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuICF4Y1swXSA/ICF5Y1swXSA/IDAgOiAtaiA6IGk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTaWducyBkaWZmZXI/XHJcbiAgICAgICAgaWYgKGkgIT0gaikge1xyXG4gICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICB9XHJcbiAgICAgICAgeE5lZyA9IGkgPCAwO1xyXG5cclxuICAgICAgICAvLyBDb21wYXJlIGV4cG9uZW50cy5cclxuICAgICAgICBpZiAoayAhPSBsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBrID4gbCBeIHhOZWcgPyAxIDogLTE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpID0gLTE7XHJcbiAgICAgICAgaiA9IChrID0geGMubGVuZ3RoKSA8IChsID0geWMubGVuZ3RoKSA/IGsgOiBsO1xyXG5cclxuICAgICAgICAvLyBDb21wYXJlIGRpZ2l0IGJ5IGRpZ2l0LlxyXG4gICAgICAgIGZvciAoOyArK2kgPCBqOykge1xyXG5cclxuICAgICAgICAgICAgaWYgKHhjW2ldICE9IHljW2ldKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geGNbaV0gPiB5Y1tpXSBeIHhOZWcgPyAxIDogLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgbGVuZ3Rocy5cclxuICAgICAgICByZXR1cm4gayA9PSBsID8gMCA6IGsgPiBsIF4geE5lZyA/IDEgOiAtMTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBkaXZpZGVkIGJ5IHRoZVxyXG4gICAgICogdmFsdWUgb2YgQmlnIHksIHJvdW5kZWQsIGlmIG5lY2Vzc2FyeSwgdG8gYSBtYXhpbXVtIG9mIEJpZy5EUCBkZWNpbWFsXHJcbiAgICAgKiBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBCaWcuUk0uXHJcbiAgICAgKi9cclxuICAgIFAuZGl2ID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIC8vIGRpdmlkZW5kXHJcbiAgICAgICAgICAgIGR2ZCA9IHguYyxcclxuICAgICAgICAgICAgLy9kaXZpc29yXHJcbiAgICAgICAgICAgIGR2cyA9ICh5ID0gbmV3IEJpZyh5KSkuYyxcclxuICAgICAgICAgICAgcyA9IHgucyA9PSB5LnMgPyAxIDogLTEsXHJcbiAgICAgICAgICAgIGRwID0gQmlnLkRQO1xyXG5cclxuICAgICAgICBpZiAoZHAgIT09IH5+ZHAgfHwgZHAgPCAwIHx8IGRwID4gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchQmlnLkRQIScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIDA/XHJcbiAgICAgICAgaWYgKCFkdmRbMF0gfHwgIWR2c1swXSkge1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgYm90aCBhcmUgMCwgdGhyb3cgTmFOXHJcbiAgICAgICAgICAgIGlmIChkdmRbMF0gPT0gZHZzWzBdKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvd0VycihOYU4pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBkdnMgaXMgMCwgdGhyb3cgKy1JbmZpbml0eS5cclxuICAgICAgICAgICAgaWYgKCFkdnNbMF0pIHtcclxuICAgICAgICAgICAgICAgIHRocm93RXJyKHMgLyAwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gZHZkIGlzIDAsIHJldHVybiArLTAuXHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnKHMgKiAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBkdnNMLCBkdnNULCBuZXh0LCBjbXAsIHJlbUksIHUsXHJcbiAgICAgICAgICAgIGR2c1ogPSBkdnMuc2xpY2UoKSxcclxuICAgICAgICAgICAgZHZkSSA9IGR2c0wgPSBkdnMubGVuZ3RoLFxyXG4gICAgICAgICAgICBkdmRMID0gZHZkLmxlbmd0aCxcclxuICAgICAgICAgICAgLy8gcmVtYWluZGVyXHJcbiAgICAgICAgICAgIHJlbSA9IGR2ZC5zbGljZSgwLCBkdnNMKSxcclxuICAgICAgICAgICAgcmVtTCA9IHJlbS5sZW5ndGgsXHJcbiAgICAgICAgICAgIC8vIHF1b3RpZW50XHJcbiAgICAgICAgICAgIHEgPSB5LFxyXG4gICAgICAgICAgICBxYyA9IHEuYyA9IFtdLFxyXG4gICAgICAgICAgICBxaSA9IDAsXHJcbiAgICAgICAgICAgIGRpZ2l0cyA9IGRwICsgKHEuZSA9IHguZSAtIHkuZSkgKyAxO1xyXG5cclxuICAgICAgICBxLnMgPSBzO1xyXG4gICAgICAgIHMgPSBkaWdpdHMgPCAwID8gMCA6IGRpZ2l0cztcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIHZlcnNpb24gb2YgZGl2aXNvciB3aXRoIGxlYWRpbmcgemVyby5cclxuICAgICAgICBkdnNaLnVuc2hpZnQoMCk7XHJcblxyXG4gICAgICAgIC8vIEFkZCB6ZXJvcyB0byBtYWtlIHJlbWFpbmRlciBhcyBsb25nIGFzIGRpdmlzb3IuXHJcbiAgICAgICAgZm9yICg7IHJlbUwrKyA8IGR2c0w7IHJlbS5wdXNoKDApKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkbyB7XHJcblxyXG4gICAgICAgICAgICAvLyAnbmV4dCcgaXMgaG93IG1hbnkgdGltZXMgdGhlIGRpdmlzb3IgZ29lcyBpbnRvIGN1cnJlbnQgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICBmb3IgKG5leHQgPSAwOyBuZXh0IDwgMTA7IG5leHQrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENvbXBhcmUgZGl2aXNvciBhbmQgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgaWYgKGR2c0wgIT0gKHJlbUwgPSByZW0ubGVuZ3RoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNtcCA9IGR2c0wgPiByZW1MID8gMSA6IC0xO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChyZW1JID0gLTEsIGNtcCA9IDA7ICsrcmVtSSA8IGR2c0w7KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZHZzW3JlbUldICE9IHJlbVtyZW1JXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY21wID0gZHZzW3JlbUldID4gcmVtW3JlbUldID8gMSA6IC0xO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gSWYgZGl2aXNvciA8IHJlbWFpbmRlciwgc3VidHJhY3QgZGl2aXNvciBmcm9tIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgIGlmIChjbXAgPCAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlbWFpbmRlciBjYW4ndCBiZSBtb3JlIHRoYW4gMSBkaWdpdCBsb25nZXIgdGhhbiBkaXZpc29yLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEVxdWFsaXNlIGxlbmd0aHMgdXNpbmcgZGl2aXNvciB3aXRoIGV4dHJhIGxlYWRpbmcgemVybz9cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGR2c1QgPSByZW1MID09IGR2c0wgPyBkdnMgOiBkdnNaOyByZW1MOykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlbVstLXJlbUxdIDwgZHZzVFtyZW1MXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtSSA9IHJlbUw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICg7IHJlbUkgJiYgIXJlbVstLXJlbUldOyByZW1bcmVtSV0gPSA5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAtLXJlbVtyZW1JXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbVtyZW1MXSArPSAxMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1bcmVtTF0gLT0gZHZzVFtyZW1MXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICg7ICFyZW1bMF07IHJlbS5zaGlmdCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQWRkIHRoZSAnbmV4dCcgZGlnaXQgdG8gdGhlIHJlc3VsdCBhcnJheS5cclxuICAgICAgICAgICAgcWNbcWkrK10gPSBjbXAgPyBuZXh0IDogKytuZXh0O1xyXG5cclxuICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSByZW1haW5kZXIuXHJcbiAgICAgICAgICAgIGlmIChyZW1bMF0gJiYgY21wKSB7XHJcbiAgICAgICAgICAgICAgICByZW1bcmVtTF0gPSBkdmRbZHZkSV0gfHwgMDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlbSA9IFsgZHZkW2R2ZEldIF07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSB3aGlsZSAoKGR2ZEkrKyA8IGR2ZEwgfHwgcmVtWzBdICE9PSB1KSAmJiBzLS0pO1xyXG5cclxuICAgICAgICAvLyBMZWFkaW5nIHplcm8/IERvIG5vdCByZW1vdmUgaWYgcmVzdWx0IGlzIHNpbXBseSB6ZXJvIChxaSA9PSAxKS5cclxuICAgICAgICBpZiAoIXFjWzBdICYmIHFpICE9IDEpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZXJlIGNhbid0IGJlIG1vcmUgdGhhbiBvbmUgemVyby5cclxuICAgICAgICAgICAgcWMuc2hpZnQoKTtcclxuICAgICAgICAgICAgcS5lLS07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSb3VuZD9cclxuICAgICAgICBpZiAocWkgPiBkaWdpdHMpIHtcclxuICAgICAgICAgICAgcm5kKHEsIGRwLCBCaWcuUk0sIHJlbVswXSAhPT0gdSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZXF1YWwgdG8gdGhlIHZhbHVlIG9mIEJpZyB5LFxyXG4gICAgICogb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAuZXEgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHJldHVybiAhdGhpcy5jbXAoeSk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGdyZWF0ZXIgdGhhbiB0aGUgdmFsdWUgb2YgQmlnIHksXHJcbiAgICAgKiBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5ndCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY21wKHkpID4gMDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIHRoZVxyXG4gICAgICogdmFsdWUgb2YgQmlnIHksIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmd0ZSA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY21wKHkpID4gLTE7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGxlc3MgdGhhbiB0aGUgdmFsdWUgb2YgQmlnIHksXHJcbiAgICAgKiBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5sdCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY21wKHkpIDwgMDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIHRoZSB2YWx1ZVxyXG4gICAgICogb2YgQmlnIHksIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmx0ZSA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgIHJldHVybiB0aGlzLmNtcCh5KSA8IDE7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgbWludXMgdGhlIHZhbHVlXHJcbiAgICAgKiBvZiBCaWcgeS5cclxuICAgICAqL1xyXG4gICAgUC5zdWIgPSBQLm1pbnVzID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgaSwgaiwgdCwgeExUeSxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIGEgPSB4LnMsXHJcbiAgICAgICAgICAgIGIgPSAoeSA9IG5ldyBCaWcoeSkpLnM7XHJcblxyXG4gICAgICAgIC8vIFNpZ25zIGRpZmZlcj9cclxuICAgICAgICBpZiAoYSAhPSBiKSB7XHJcbiAgICAgICAgICAgIHkucyA9IC1iO1xyXG4gICAgICAgICAgICByZXR1cm4geC5wbHVzKHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHhjID0geC5jLnNsaWNlKCksXHJcbiAgICAgICAgICAgIHhlID0geC5lLFxyXG4gICAgICAgICAgICB5YyA9IHkuYyxcclxuICAgICAgICAgICAgeWUgPSB5LmU7XHJcblxyXG4gICAgICAgIC8vIEVpdGhlciB6ZXJvP1xyXG4gICAgICAgIGlmICgheGNbMF0gfHwgIXljWzBdKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB5IGlzIG5vbi16ZXJvPyB4IGlzIG5vbi16ZXJvPyBPciBib3RoIGFyZSB6ZXJvLlxyXG4gICAgICAgICAgICByZXR1cm4geWNbMF0gPyAoeS5zID0gLWIsIHkpIDogbmV3IEJpZyh4Y1swXSA/IHggOiAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSB3aGljaCBpcyB0aGUgYmlnZ2VyIG51bWJlci5cclxuICAgICAgICAvLyBQcmVwZW5kIHplcm9zIHRvIGVxdWFsaXNlIGV4cG9uZW50cy5cclxuICAgICAgICBpZiAoYSA9IHhlIC0geWUpIHtcclxuXHJcbiAgICAgICAgICAgIGlmICh4TFR5ID0gYSA8IDApIHtcclxuICAgICAgICAgICAgICAgIGEgPSAtYTtcclxuICAgICAgICAgICAgICAgIHQgPSB4YztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHllID0geGU7XHJcbiAgICAgICAgICAgICAgICB0ID0geWM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG4gICAgICAgICAgICBmb3IgKGIgPSBhOyBiLS07IHQucHVzaCgwKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBFeHBvbmVudHMgZXF1YWwuIENoZWNrIGRpZ2l0IGJ5IGRpZ2l0LlxyXG4gICAgICAgICAgICBqID0gKCh4TFR5ID0geGMubGVuZ3RoIDwgeWMubGVuZ3RoKSA/IHhjIDogeWMpLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIGZvciAoYSA9IGIgPSAwOyBiIDwgajsgYisrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHhjW2JdICE9IHljW2JdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeExUeSA9IHhjW2JdIDwgeWNbYl07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHggPCB5PyBQb2ludCB4YyB0byB0aGUgYXJyYXkgb2YgdGhlIGJpZ2dlciBudW1iZXIuXHJcbiAgICAgICAgaWYgKHhMVHkpIHtcclxuICAgICAgICAgICAgdCA9IHhjO1xyXG4gICAgICAgICAgICB4YyA9IHljO1xyXG4gICAgICAgICAgICB5YyA9IHQ7XHJcbiAgICAgICAgICAgIHkucyA9IC15LnM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIEFwcGVuZCB6ZXJvcyB0byB4YyBpZiBzaG9ydGVyLiBObyBuZWVkIHRvIGFkZCB6ZXJvcyB0byB5YyBpZiBzaG9ydGVyXHJcbiAgICAgICAgICogYXMgc3VidHJhY3Rpb24gb25seSBuZWVkcyB0byBzdGFydCBhdCB5Yy5sZW5ndGguXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaWYgKCggYiA9IChqID0geWMubGVuZ3RoKSAtIChpID0geGMubGVuZ3RoKSApID4gMCkge1xyXG5cclxuICAgICAgICAgICAgZm9yICg7IGItLTsgeGNbaSsrXSA9IDApIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU3VidHJhY3QgeWMgZnJvbSB4Yy5cclxuICAgICAgICBmb3IgKGIgPSBpOyBqID4gYTspe1xyXG5cclxuICAgICAgICAgICAgaWYgKHhjWy0tal0gPCB5Y1tqXSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IGo7IGkgJiYgIXhjWy0taV07IHhjW2ldID0gOSkge1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLS14Y1tpXTtcclxuICAgICAgICAgICAgICAgIHhjW2pdICs9IDEwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHhjW2pdIC09IHljW2pdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgIGZvciAoOyB4Y1stLWJdID09PSAwOyB4Yy5wb3AoKSkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIGxlYWRpbmcgemVyb3MgYW5kIGFkanVzdCBleHBvbmVudCBhY2NvcmRpbmdseS5cclxuICAgICAgICBmb3IgKDsgeGNbMF0gPT09IDA7KSB7XHJcbiAgICAgICAgICAgIHhjLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIC0teWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXhjWzBdKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBuIC0gbiA9ICswXHJcbiAgICAgICAgICAgIHkucyA9IDE7XHJcblxyXG4gICAgICAgICAgICAvLyBSZXN1bHQgbXVzdCBiZSB6ZXJvLlxyXG4gICAgICAgICAgICB4YyA9IFt5ZSA9IDBdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgeS5jID0geGM7XHJcbiAgICAgICAgeS5lID0geWU7XHJcblxyXG4gICAgICAgIHJldHVybiB5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIG1vZHVsbyB0aGVcclxuICAgICAqIHZhbHVlIG9mIEJpZyB5LlxyXG4gICAgICovXHJcbiAgICBQLm1vZCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIHlHVHgsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBhID0geC5zLFxyXG4gICAgICAgICAgICBiID0gKHkgPSBuZXcgQmlnKHkpKS5zO1xyXG5cclxuICAgICAgICBpZiAoIXkuY1swXSkge1xyXG4gICAgICAgICAgICB0aHJvd0VycihOYU4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgeC5zID0geS5zID0gMTtcclxuICAgICAgICB5R1R4ID0geS5jbXAoeCkgPT0gMTtcclxuICAgICAgICB4LnMgPSBhO1xyXG4gICAgICAgIHkucyA9IGI7XHJcblxyXG4gICAgICAgIGlmICh5R1R4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnKHgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYSA9IEJpZy5EUDtcclxuICAgICAgICBiID0gQmlnLlJNO1xyXG4gICAgICAgIEJpZy5EUCA9IEJpZy5STSA9IDA7XHJcbiAgICAgICAgeCA9IHguZGl2KHkpO1xyXG4gICAgICAgIEJpZy5EUCA9IGE7XHJcbiAgICAgICAgQmlnLlJNID0gYjtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWludXMoIHgudGltZXMoeSkgKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBwbHVzIHRoZSB2YWx1ZVxyXG4gICAgICogb2YgQmlnIHkuXHJcbiAgICAgKi9cclxuICAgIFAuYWRkID0gUC5wbHVzID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgdCxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIGEgPSB4LnMsXHJcbiAgICAgICAgICAgIGIgPSAoeSA9IG5ldyBCaWcoeSkpLnM7XHJcblxyXG4gICAgICAgIC8vIFNpZ25zIGRpZmZlcj9cclxuICAgICAgICBpZiAoYSAhPSBiKSB7XHJcbiAgICAgICAgICAgIHkucyA9IC1iO1xyXG4gICAgICAgICAgICByZXR1cm4geC5taW51cyh5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciB4ZSA9IHguZSxcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIHllID0geS5lLFxyXG4gICAgICAgICAgICB5YyA9IHkuYztcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHkgaXMgbm9uLXplcm8/IHggaXMgbm9uLXplcm8/IE9yIGJvdGggYXJlIHplcm8uXHJcbiAgICAgICAgICAgIHJldHVybiB5Y1swXSA/IHkgOiBuZXcgQmlnKHhjWzBdID8geCA6IGEgKiAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgeGMgPSB4Yy5zbGljZSgpO1xyXG5cclxuICAgICAgICAvLyBQcmVwZW5kIHplcm9zIHRvIGVxdWFsaXNlIGV4cG9uZW50cy5cclxuICAgICAgICAvLyBOb3RlOiBGYXN0ZXIgdG8gdXNlIHJldmVyc2UgdGhlbiBkbyB1bnNoaWZ0cy5cclxuICAgICAgICBpZiAoYSA9IHhlIC0geWUpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChhID4gMCkge1xyXG4gICAgICAgICAgICAgICAgeWUgPSB4ZTtcclxuICAgICAgICAgICAgICAgIHQgPSB5YztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGEgPSAtYTtcclxuICAgICAgICAgICAgICAgIHQgPSB4YztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgIGZvciAoOyBhLS07IHQucHVzaCgwKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUG9pbnQgeGMgdG8gdGhlIGxvbmdlciBhcnJheS5cclxuICAgICAgICBpZiAoeGMubGVuZ3RoIC0geWMubGVuZ3RoIDwgMCkge1xyXG4gICAgICAgICAgICB0ID0geWM7XHJcbiAgICAgICAgICAgIHljID0geGM7XHJcbiAgICAgICAgICAgIHhjID0gdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgYSA9IHljLmxlbmd0aDtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBPbmx5IHN0YXJ0IGFkZGluZyBhdCB5Yy5sZW5ndGggLSAxIGFzIHRoZSBmdXJ0aGVyIGRpZ2l0cyBvZiB4YyBjYW4gYmVcclxuICAgICAgICAgKiBsZWZ0IGFzIHRoZXkgYXJlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZvciAoYiA9IDA7IGE7KSB7XHJcbiAgICAgICAgICAgIGIgPSAoeGNbLS1hXSA9IHhjW2FdICsgeWNbYV0gKyBiKSAvIDEwIHwgMDtcclxuICAgICAgICAgICAgeGNbYV0gJT0gMTA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBObyBuZWVkIHRvIGNoZWNrIGZvciB6ZXJvLCBhcyAreCArICt5ICE9IDAgJiYgLXggKyAteSAhPSAwXHJcblxyXG4gICAgICAgIGlmIChiKSB7XHJcbiAgICAgICAgICAgIHhjLnVuc2hpZnQoYik7XHJcbiAgICAgICAgICAgICsreWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgIGZvciAoYSA9IHhjLmxlbmd0aDsgeGNbLS1hXSA9PT0gMDsgeGMucG9wKCkpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHkuYyA9IHhjO1xyXG4gICAgICAgIHkuZSA9IHllO1xyXG5cclxuICAgICAgICByZXR1cm4geTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHJhaXNlZCB0byB0aGUgcG93ZXIgbi5cclxuICAgICAqIElmIG4gaXMgbmVnYXRpdmUsIHJvdW5kLCBpZiBuZWNlc3NhcnksIHRvIGEgbWF4aW11bSBvZiBCaWcuRFAgZGVjaW1hbFxyXG4gICAgICogcGxhY2VzIHVzaW5nIHJvdW5kaW5nIG1vZGUgQmlnLlJNLlxyXG4gICAgICpcclxuICAgICAqIG4ge251bWJlcn0gSW50ZWdlciwgLU1BWF9QT1dFUiB0byBNQVhfUE9XRVIgaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBQLnBvdyA9IGZ1bmN0aW9uIChuKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBvbmUgPSBuZXcgeC5jb25zdHJ1Y3RvcigxKSxcclxuICAgICAgICAgICAgeSA9IG9uZSxcclxuICAgICAgICAgICAgaXNOZWcgPSBuIDwgMDtcclxuXHJcbiAgICAgICAgaWYgKG4gIT09IH5+biB8fCBuIDwgLU1BWF9QT1dFUiB8fCBuID4gTUFYX1BPV0VSKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchcG93IScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbiA9IGlzTmVnID8gLW4gOiBuO1xyXG5cclxuICAgICAgICBmb3IgKDs7KSB7XHJcblxyXG4gICAgICAgICAgICBpZiAobiAmIDEpIHtcclxuICAgICAgICAgICAgICAgIHkgPSB5LnRpbWVzKHgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG4gPj49IDE7XHJcblxyXG4gICAgICAgICAgICBpZiAoIW4pIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHggPSB4LnRpbWVzKHgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGlzTmVnID8gb25lLmRpdih5KSA6IHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgcm91bmRlZCB0byBhXHJcbiAgICAgKiBtYXhpbXVtIG9mIGRwIGRlY2ltYWwgcGxhY2VzIHVzaW5nIHJvdW5kaW5nIG1vZGUgcm0uXHJcbiAgICAgKiBJZiBkcCBpcyBub3Qgc3BlY2lmaWVkLCByb3VuZCB0byAwIGRlY2ltYWwgcGxhY2VzLlxyXG4gICAgICogSWYgcm0gaXMgbm90IHNwZWNpZmllZCwgdXNlIEJpZy5STS5cclxuICAgICAqXHJcbiAgICAgKiBbZHBdIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqIFtybV0gMCwgMSwgMiBvciAzIChST1VORF9ET1dOLCBST1VORF9IQUxGX1VQLCBST1VORF9IQUxGX0VWRU4sIFJPVU5EX1VQKVxyXG4gICAgICovXHJcbiAgICBQLnJvdW5kID0gZnVuY3Rpb24gKGRwLCBybSkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcjtcclxuXHJcbiAgICAgICAgaWYgKGRwID09IG51bGwpIHtcclxuICAgICAgICAgICAgZHAgPSAwO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZHAgIT09IH5+ZHAgfHwgZHAgPCAwIHx8IGRwID4gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchcm91bmQhJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJuZCh4ID0gbmV3IEJpZyh4KSwgZHAsIHJtID09IG51bGwgPyBCaWcuUk0gOiBybSk7XHJcblxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHNxdWFyZSByb290IG9mIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyxcclxuICAgICAqIHJvdW5kZWQsIGlmIG5lY2Vzc2FyeSwgdG8gYSBtYXhpbXVtIG9mIEJpZy5EUCBkZWNpbWFsIHBsYWNlcyB1c2luZ1xyXG4gICAgICogcm91bmRpbmcgbW9kZSBCaWcuUk0uXHJcbiAgICAgKi9cclxuICAgIFAuc3FydCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgZXN0aW1hdGUsIHIsIGFwcHJveCxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICBpID0geC5zLFxyXG4gICAgICAgICAgICBlID0geC5lLFxyXG4gICAgICAgICAgICBoYWxmID0gbmV3IEJpZygnMC41Jyk7XHJcblxyXG4gICAgICAgIC8vIFplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEJpZyh4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIG5lZ2F0aXZlLCB0aHJvdyBOYU4uXHJcbiAgICAgICAgaWYgKGkgPCAwKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKE5hTik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFc3RpbWF0ZS5cclxuICAgICAgICBpID0gTWF0aC5zcXJ0KHgudG9TdHJpbmcoKSk7XHJcblxyXG4gICAgICAgIC8vIE1hdGguc3FydCB1bmRlcmZsb3cvb3ZlcmZsb3c/XHJcbiAgICAgICAgLy8gUGFzcyB4IHRvIE1hdGguc3FydCBhcyBpbnRlZ2VyLCB0aGVuIGFkanVzdCB0aGUgcmVzdWx0IGV4cG9uZW50LlxyXG4gICAgICAgIGlmIChpID09PSAwIHx8IGkgPT09IDEgLyAwKSB7XHJcbiAgICAgICAgICAgIGVzdGltYXRlID0geGMuam9pbignJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIShlc3RpbWF0ZS5sZW5ndGggKyBlICYgMSkpIHtcclxuICAgICAgICAgICAgICAgIGVzdGltYXRlICs9ICcwJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgciA9IG5ldyBCaWcoIE1hdGguc3FydChlc3RpbWF0ZSkudG9TdHJpbmcoKSApO1xyXG4gICAgICAgICAgICByLmUgPSAoKGUgKyAxKSAvIDIgfCAwKSAtIChlIDwgMCB8fCBlICYgMSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgciA9IG5ldyBCaWcoaS50b1N0cmluZygpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGkgPSByLmUgKyAoQmlnLkRQICs9IDQpO1xyXG5cclxuICAgICAgICAvLyBOZXd0b24tUmFwaHNvbiBpdGVyYXRpb24uXHJcbiAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICBhcHByb3ggPSByO1xyXG4gICAgICAgICAgICByID0gaGFsZi50aW1lcyggYXBwcm94LnBsdXMoIHguZGl2KGFwcHJveCkgKSApO1xyXG4gICAgICAgIH0gd2hpbGUgKCBhcHByb3guYy5zbGljZSgwLCBpKS5qb2luKCcnKSAhPT1cclxuICAgICAgICAgICAgICAgICAgICAgICByLmMuc2xpY2UoMCwgaSkuam9pbignJykgKTtcclxuXHJcbiAgICAgICAgcm5kKHIsIEJpZy5EUCAtPSA0LCBCaWcuUk0pO1xyXG5cclxuICAgICAgICByZXR1cm4gcjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyB0aW1lcyB0aGUgdmFsdWUgb2ZcclxuICAgICAqIEJpZyB5LlxyXG4gICAgICovXHJcbiAgICBQLm11bCA9IFAudGltZXMgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciBjLFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIHljID0gKHkgPSBuZXcgQmlnKHkpKS5jLFxyXG4gICAgICAgICAgICBhID0geGMubGVuZ3RoLFxyXG4gICAgICAgICAgICBiID0geWMubGVuZ3RoLFxyXG4gICAgICAgICAgICBpID0geC5lLFxyXG4gICAgICAgICAgICBqID0geS5lO1xyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgc2lnbiBvZiByZXN1bHQuXHJcbiAgICAgICAgeS5zID0geC5zID09IHkucyA/IDEgOiAtMTtcclxuXHJcbiAgICAgICAgLy8gUmV0dXJuIHNpZ25lZCAwIGlmIGVpdGhlciAwLlxyXG4gICAgICAgIGlmICgheGNbMF0gfHwgIXljWzBdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnKHkucyAqIDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGlzZSBleHBvbmVudCBvZiByZXN1bHQgYXMgeC5lICsgeS5lLlxyXG4gICAgICAgIHkuZSA9IGkgKyBqO1xyXG5cclxuICAgICAgICAvLyBJZiBhcnJheSB4YyBoYXMgZmV3ZXIgZGlnaXRzIHRoYW4geWMsIHN3YXAgeGMgYW5kIHljLCBhbmQgbGVuZ3Rocy5cclxuICAgICAgICBpZiAoYSA8IGIpIHtcclxuICAgICAgICAgICAgYyA9IHhjO1xyXG4gICAgICAgICAgICB4YyA9IHljO1xyXG4gICAgICAgICAgICB5YyA9IGM7XHJcbiAgICAgICAgICAgIGogPSBhO1xyXG4gICAgICAgICAgICBhID0gYjtcclxuICAgICAgICAgICAgYiA9IGo7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXNlIGNvZWZmaWNpZW50IGFycmF5IG9mIHJlc3VsdCB3aXRoIHplcm9zLlxyXG4gICAgICAgIGZvciAoYyA9IG5ldyBBcnJheShqID0gYSArIGIpOyBqLS07IGNbal0gPSAwKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBNdWx0aXBseS5cclxuXHJcbiAgICAgICAgLy8gaSBpcyBpbml0aWFsbHkgeGMubGVuZ3RoLlxyXG4gICAgICAgIGZvciAoaSA9IGI7IGktLTspIHtcclxuICAgICAgICAgICAgYiA9IDA7XHJcblxyXG4gICAgICAgICAgICAvLyBhIGlzIHljLmxlbmd0aC5cclxuICAgICAgICAgICAgZm9yIChqID0gYSArIGk7IGogPiBpOykge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEN1cnJlbnQgc3VtIG9mIHByb2R1Y3RzIGF0IHRoaXMgZGlnaXQgcG9zaXRpb24sIHBsdXMgY2FycnkuXHJcbiAgICAgICAgICAgICAgICBiID0gY1tqXSArIHljW2ldICogeGNbaiAtIGkgLSAxXSArIGI7XHJcbiAgICAgICAgICAgICAgICBjW2otLV0gPSBiICUgMTA7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gY2FycnlcclxuICAgICAgICAgICAgICAgIGIgPSBiIC8gMTAgfCAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNbal0gPSAoY1tqXSArIGIpICUgMTA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJbmNyZW1lbnQgcmVzdWx0IGV4cG9uZW50IGlmIHRoZXJlIGlzIGEgZmluYWwgY2FycnkuXHJcbiAgICAgICAgaWYgKGIpIHtcclxuICAgICAgICAgICAgKyt5LmU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgYW55IGxlYWRpbmcgemVyby5cclxuICAgICAgICBpZiAoIWNbMF0pIHtcclxuICAgICAgICAgICAgYy5zaGlmdCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgIGZvciAoaSA9IGMubGVuZ3RoOyAhY1stLWldOyBjLnBvcCgpKSB7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHkuYyA9IGM7XHJcblxyXG4gICAgICAgIHJldHVybiB5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnLlxyXG4gICAgICogUmV0dXJuIGV4cG9uZW50aWFsIG5vdGF0aW9uIGlmIHRoaXMgQmlnIGhhcyBhIHBvc2l0aXZlIGV4cG9uZW50IGVxdWFsIHRvXHJcbiAgICAgKiBvciBncmVhdGVyIHRoYW4gQmlnLkVfUE9TLCBvciBhIG5lZ2F0aXZlIGV4cG9uZW50IGVxdWFsIHRvIG9yIGxlc3MgdGhhblxyXG4gICAgICogQmlnLkVfTkVHLlxyXG4gICAgICovXHJcbiAgICBQLnRvU3RyaW5nID0gUC52YWx1ZU9mID0gUC50b0pTT04gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBlID0geC5lLFxyXG4gICAgICAgICAgICBzdHIgPSB4LmMuam9pbignJyksXHJcbiAgICAgICAgICAgIHN0ckwgPSBzdHIubGVuZ3RoO1xyXG5cclxuICAgICAgICAvLyBFeHBvbmVudGlhbCBub3RhdGlvbj9cclxuICAgICAgICBpZiAoZSA8PSBCaWcuRV9ORUcgfHwgZSA+PSBCaWcuRV9QT1MpIHtcclxuICAgICAgICAgICAgc3RyID0gc3RyLmNoYXJBdCgwKSArIChzdHJMID4gMSA/ICcuJyArIHN0ci5zbGljZSgxKSA6ICcnKSArXHJcbiAgICAgICAgICAgICAgKGUgPCAwID8gJ2UnIDogJ2UrJykgKyBlO1xyXG5cclxuICAgICAgICAvLyBOZWdhdGl2ZSBleHBvbmVudD9cclxuICAgICAgICB9IGVsc2UgaWYgKGUgPCAwKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBQcmVwZW5kIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKDsgKytlOyBzdHIgPSAnMCcgKyBzdHIpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdHIgPSAnMC4nICsgc3RyO1xyXG5cclxuICAgICAgICAvLyBQb3NpdGl2ZSBleHBvbmVudD9cclxuICAgICAgICB9IGVsc2UgaWYgKGUgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoKytlID4gc3RyTCkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEFwcGVuZCB6ZXJvcy5cclxuICAgICAgICAgICAgICAgIGZvciAoZSAtPSBzdHJMOyBlLS0gOyBzdHIgKz0gJzAnKSB7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZSA8IHN0ckwpIHtcclxuICAgICAgICAgICAgICAgIHN0ciA9IHN0ci5zbGljZSgwLCBlKSArICcuJyArIHN0ci5zbGljZShlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFeHBvbmVudCB6ZXJvLlxyXG4gICAgICAgIH0gZWxzZSBpZiAoc3RyTCA+IDEpIHtcclxuICAgICAgICAgICAgc3RyID0gc3RyLmNoYXJBdCgwKSArICcuJyArIHN0ci5zbGljZSgxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEF2b2lkICctMCdcclxuICAgICAgICByZXR1cm4geC5zIDwgMCAmJiB4LmNbMF0gPyAnLScgKyBzdHIgOiBzdHI7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICogSWYgdG9FeHBvbmVudGlhbCwgdG9GaXhlZCwgdG9QcmVjaXNpb24gYW5kIGZvcm1hdCBhcmUgbm90IHJlcXVpcmVkIHRoZXlcclxuICAgICAqIGNhbiBzYWZlbHkgYmUgY29tbWVudGVkLW91dCBvciBkZWxldGVkLiBObyByZWR1bmRhbnQgY29kZSB3aWxsIGJlIGxlZnQuXHJcbiAgICAgKiBmb3JtYXQgaXMgdXNlZCBvbmx5IGJ5IHRvRXhwb25lbnRpYWwsIHRvRml4ZWQgYW5kIHRvUHJlY2lzaW9uLlxyXG4gICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICovXHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpbiBleHBvbmVudGlhbFxyXG4gICAgICogbm90YXRpb24gdG8gZHAgZml4ZWQgZGVjaW1hbCBwbGFjZXMgYW5kIHJvdW5kZWQsIGlmIG5lY2Vzc2FyeSwgdXNpbmdcclxuICAgICAqIEJpZy5STS5cclxuICAgICAqXHJcbiAgICAgKiBbZHBdIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqL1xyXG4gICAgUC50b0V4cG9uZW50aWFsID0gZnVuY3Rpb24gKGRwKSB7XHJcblxyXG4gICAgICAgIGlmIChkcCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGRwID0gdGhpcy5jLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkcCAhPT0gfn5kcCB8fCBkcCA8IDAgfHwgZHAgPiBNQVhfRFApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyF0b0V4cCEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmb3JtYXQodGhpcywgZHAsIDEpO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGluIG5vcm1hbCBub3RhdGlvblxyXG4gICAgICogdG8gZHAgZml4ZWQgZGVjaW1hbCBwbGFjZXMgYW5kIHJvdW5kZWQsIGlmIG5lY2Vzc2FyeSwgdXNpbmcgQmlnLlJNLlxyXG4gICAgICpcclxuICAgICAqIFtkcF0ge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBQLnRvRml4ZWQgPSBmdW5jdGlvbiAoZHApIHtcclxuICAgICAgICB2YXIgc3RyLFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgbmVnID0gQmlnLkVfTkVHLFxyXG4gICAgICAgICAgICBwb3MgPSBCaWcuRV9QT1M7XHJcblxyXG4gICAgICAgIC8vIFByZXZlbnQgdGhlIHBvc3NpYmlsaXR5IG9mIGV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAgICAgIEJpZy5FX05FRyA9IC0oQmlnLkVfUE9TID0gMSAvIDApO1xyXG5cclxuICAgICAgICBpZiAoZHAgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBzdHIgPSB4LnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkcCA9PT0gfn5kcCAmJiBkcCA+PSAwICYmIGRwIDw9IE1BWF9EUCkge1xyXG4gICAgICAgICAgICBzdHIgPSBmb3JtYXQoeCwgeC5lICsgZHApO1xyXG5cclxuICAgICAgICAgICAgLy8gKC0wKS50b0ZpeGVkKCkgaXMgJzAnLCBidXQgKC0wLjEpLnRvRml4ZWQoKSBpcyAnLTAnLlxyXG4gICAgICAgICAgICAvLyAoLTApLnRvRml4ZWQoMSkgaXMgJzAuMCcsIGJ1dCAoLTAuMDEpLnRvRml4ZWQoMSkgaXMgJy0wLjAnLlxyXG4gICAgICAgICAgICBpZiAoeC5zIDwgMCAmJiB4LmNbMF0gJiYgc3RyLmluZGV4T2YoJy0nKSA8IDApIHtcclxuICAgICAgICAvL0UuZy4gLTAuNSBpZiByb3VuZGVkIHRvIC0wIHdpbGwgY2F1c2UgdG9TdHJpbmcgdG8gb21pdCB0aGUgbWludXMgc2lnbi5cclxuICAgICAgICAgICAgICAgIHN0ciA9ICctJyArIHN0cjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBCaWcuRV9ORUcgPSBuZWc7XHJcbiAgICAgICAgQmlnLkVfUE9TID0gcG9zO1xyXG5cclxuICAgICAgICBpZiAoIXN0cikge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXRvRml4IScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHN0cjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyByb3VuZGVkIHRvIHNkXHJcbiAgICAgKiBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgQmlnLlJNLiBVc2UgZXhwb25lbnRpYWwgbm90YXRpb24gaWYgc2QgaXMgbGVzc1xyXG4gICAgICogdGhhbiB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBuZWNlc3NhcnkgdG8gcmVwcmVzZW50IHRoZSBpbnRlZ2VyIHBhcnQgb2YgdGhlXHJcbiAgICAgKiB2YWx1ZSBpbiBub3JtYWwgbm90YXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogc2Qge251bWJlcn0gSW50ZWdlciwgMSB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBQLnRvUHJlY2lzaW9uID0gZnVuY3Rpb24gKHNkKSB7XHJcblxyXG4gICAgICAgIGlmIChzZCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzZCAhPT0gfn5zZCB8fCBzZCA8IDEgfHwgc2QgPiBNQVhfRFApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyF0b1ByZSEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmb3JtYXQodGhpcywgc2QgLSAxLCAyKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8vIEV4cG9ydFxyXG5cclxuXHJcbiAgICBCaWcgPSBiaWdGYWN0b3J5KCk7XHJcblxyXG4gICAgLy9BTUQuXHJcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcbiAgICAgICAgZGVmaW5lKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEJpZztcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAvLyBOb2RlIGFuZCBvdGhlciBDb21tb25KUy1saWtlIGVudmlyb25tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMuXHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XHJcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBCaWc7XHJcblxyXG4gICAgLy9Ccm93c2VyLlxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBnbG9iYWwuQmlnID0gQmlnO1xyXG4gICAgfVxyXG59KSh0aGlzKTtcclxuIiwiOyhmdW5jdGlvbiAoKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHQvKipcblx0ICogQHByZXNlcnZlIEZhc3RDbGljazogcG9seWZpbGwgdG8gcmVtb3ZlIGNsaWNrIGRlbGF5cyBvbiBicm93c2VycyB3aXRoIHRvdWNoIFVJcy5cblx0ICpcblx0ICogQGNvZGluZ3N0YW5kYXJkIGZ0bGFicy1qc3YyXG5cdCAqIEBjb3B5cmlnaHQgVGhlIEZpbmFuY2lhbCBUaW1lcyBMaW1pdGVkIFtBbGwgUmlnaHRzIFJlc2VydmVkXVxuXHQgKiBAbGljZW5zZSBNSVQgTGljZW5zZSAoc2VlIExJQ0VOU0UudHh0KVxuXHQgKi9cblxuXHQvKmpzbGludCBicm93c2VyOnRydWUsIG5vZGU6dHJ1ZSovXG5cdC8qZ2xvYmFsIGRlZmluZSwgRXZlbnQsIE5vZGUqL1xuXG5cblx0LyoqXG5cdCAqIEluc3RhbnRpYXRlIGZhc3QtY2xpY2tpbmcgbGlzdGVuZXJzIG9uIHRoZSBzcGVjaWZpZWQgbGF5ZXIuXG5cdCAqXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IGxheWVyIFRoZSBsYXllciB0byBsaXN0ZW4gb25cblx0ICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBUaGUgb3B0aW9ucyB0byBvdmVycmlkZSB0aGUgZGVmYXVsdHNcblx0ICovXG5cdGZ1bmN0aW9uIEZhc3RDbGljayhsYXllciwgb3B0aW9ucykge1xuXHRcdHZhciBvbGRPbkNsaWNrO1xuXG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cblx0XHQvKipcblx0XHQgKiBXaGV0aGVyIGEgY2xpY2sgaXMgY3VycmVudGx5IGJlaW5nIHRyYWNrZWQuXG5cdFx0ICpcblx0XHQgKiBAdHlwZSBib29sZWFuXG5cdFx0ICovXG5cdFx0dGhpcy50cmFja2luZ0NsaWNrID0gZmFsc2U7XG5cblxuXHRcdC8qKlxuXHRcdCAqIFRpbWVzdGFtcCBmb3Igd2hlbiBjbGljayB0cmFja2luZyBzdGFydGVkLlxuXHRcdCAqXG5cdFx0ICogQHR5cGUgbnVtYmVyXG5cdFx0ICovXG5cdFx0dGhpcy50cmFja2luZ0NsaWNrU3RhcnQgPSAwO1xuXG5cblx0XHQvKipcblx0XHQgKiBUaGUgZWxlbWVudCBiZWluZyB0cmFja2VkIGZvciBhIGNsaWNrLlxuXHRcdCAqXG5cdFx0ICogQHR5cGUgRXZlbnRUYXJnZXRcblx0XHQgKi9cblx0XHR0aGlzLnRhcmdldEVsZW1lbnQgPSBudWxsO1xuXG5cblx0XHQvKipcblx0XHQgKiBYLWNvb3JkaW5hdGUgb2YgdG91Y2ggc3RhcnQgZXZlbnQuXG5cdFx0ICpcblx0XHQgKiBAdHlwZSBudW1iZXJcblx0XHQgKi9cblx0XHR0aGlzLnRvdWNoU3RhcnRYID0gMDtcblxuXG5cdFx0LyoqXG5cdFx0ICogWS1jb29yZGluYXRlIG9mIHRvdWNoIHN0YXJ0IGV2ZW50LlxuXHRcdCAqXG5cdFx0ICogQHR5cGUgbnVtYmVyXG5cdFx0ICovXG5cdFx0dGhpcy50b3VjaFN0YXJ0WSA9IDA7XG5cblxuXHRcdC8qKlxuXHRcdCAqIElEIG9mIHRoZSBsYXN0IHRvdWNoLCByZXRyaWV2ZWQgZnJvbSBUb3VjaC5pZGVudGlmaWVyLlxuXHRcdCAqXG5cdFx0ICogQHR5cGUgbnVtYmVyXG5cdFx0ICovXG5cdFx0dGhpcy5sYXN0VG91Y2hJZGVudGlmaWVyID0gMDtcblxuXG5cdFx0LyoqXG5cdFx0ICogVG91Y2htb3ZlIGJvdW5kYXJ5LCBiZXlvbmQgd2hpY2ggYSBjbGljayB3aWxsIGJlIGNhbmNlbGxlZC5cblx0XHQgKlxuXHRcdCAqIEB0eXBlIG51bWJlclxuXHRcdCAqL1xuXHRcdHRoaXMudG91Y2hCb3VuZGFyeSA9IG9wdGlvbnMudG91Y2hCb3VuZGFyeSB8fCAxMDtcblxuXG5cdFx0LyoqXG5cdFx0ICogVGhlIEZhc3RDbGljayBsYXllci5cblx0XHQgKlxuXHRcdCAqIEB0eXBlIEVsZW1lbnRcblx0XHQgKi9cblx0XHR0aGlzLmxheWVyID0gbGF5ZXI7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgbWluaW11bSB0aW1lIGJldHdlZW4gdGFwKHRvdWNoc3RhcnQgYW5kIHRvdWNoZW5kKSBldmVudHNcblx0XHQgKlxuXHRcdCAqIEB0eXBlIG51bWJlclxuXHRcdCAqL1xuXHRcdHRoaXMudGFwRGVsYXkgPSBvcHRpb25zLnRhcERlbGF5IHx8IDIwMDtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBtYXhpbXVtIHRpbWUgZm9yIGEgdGFwXG5cdFx0ICpcblx0XHQgKiBAdHlwZSBudW1iZXJcblx0XHQgKi9cblx0XHR0aGlzLnRhcFRpbWVvdXQgPSBvcHRpb25zLnRhcFRpbWVvdXQgfHwgNzAwO1xuXG5cdFx0aWYgKEZhc3RDbGljay5ub3ROZWVkZWQobGF5ZXIpKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gU29tZSBvbGQgdmVyc2lvbnMgb2YgQW5kcm9pZCBkb24ndCBoYXZlIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kXG5cdFx0ZnVuY3Rpb24gYmluZChtZXRob2QsIGNvbnRleHQpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ldGhvZC5hcHBseShjb250ZXh0LCBhcmd1bWVudHMpOyB9O1xuXHRcdH1cblxuXG5cdFx0dmFyIG1ldGhvZHMgPSBbJ29uTW91c2UnLCAnb25DbGljaycsICdvblRvdWNoU3RhcnQnLCAnb25Ub3VjaE1vdmUnLCAnb25Ub3VjaEVuZCcsICdvblRvdWNoQ2FuY2VsJ107XG5cdFx0dmFyIGNvbnRleHQgPSB0aGlzO1xuXHRcdGZvciAodmFyIGkgPSAwLCBsID0gbWV0aG9kcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0XHRcdGNvbnRleHRbbWV0aG9kc1tpXV0gPSBiaW5kKGNvbnRleHRbbWV0aG9kc1tpXV0sIGNvbnRleHQpO1xuXHRcdH1cblxuXHRcdC8vIFNldCB1cCBldmVudCBoYW5kbGVycyBhcyByZXF1aXJlZFxuXHRcdGlmIChkZXZpY2VJc0FuZHJvaWQpIHtcblx0XHRcdGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIHRoaXMub25Nb3VzZSwgdHJ1ZSk7XG5cdFx0XHRsYXllci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uTW91c2UsIHRydWUpO1xuXHRcdFx0bGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25Nb3VzZSwgdHJ1ZSk7XG5cdFx0fVxuXG5cdFx0bGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm9uQ2xpY2ssIHRydWUpO1xuXHRcdGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLm9uVG91Y2hTdGFydCwgZmFsc2UpO1xuXHRcdGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMub25Ub3VjaE1vdmUsIGZhbHNlKTtcblx0XHRsYXllci5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMub25Ub3VjaEVuZCwgZmFsc2UpO1xuXHRcdGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdGhpcy5vblRvdWNoQ2FuY2VsLCBmYWxzZSk7XG5cblx0XHQvLyBIYWNrIGlzIHJlcXVpcmVkIGZvciBicm93c2VycyB0aGF0IGRvbid0IHN1cHBvcnQgRXZlbnQjc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uIChlLmcuIEFuZHJvaWQgMilcblx0XHQvLyB3aGljaCBpcyBob3cgRmFzdENsaWNrIG5vcm1hbGx5IHN0b3BzIGNsaWNrIGV2ZW50cyBidWJibGluZyB0byBjYWxsYmFja3MgcmVnaXN0ZXJlZCBvbiB0aGUgRmFzdENsaWNrXG5cdFx0Ly8gbGF5ZXIgd2hlbiB0aGV5IGFyZSBjYW5jZWxsZWQuXG5cdFx0aWYgKCFFdmVudC5wcm90b3R5cGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKSB7XG5cdFx0XHRsYXllci5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgY2FsbGJhY2ssIGNhcHR1cmUpIHtcblx0XHRcdFx0dmFyIHJtdiA9IE5vZGUucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXI7XG5cdFx0XHRcdGlmICh0eXBlID09PSAnY2xpY2snKSB7XG5cdFx0XHRcdFx0cm12LmNhbGwobGF5ZXIsIHR5cGUsIGNhbGxiYWNrLmhpamFja2VkIHx8IGNhbGxiYWNrLCBjYXB0dXJlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRybXYuY2FsbChsYXllciwgdHlwZSwgY2FsbGJhY2ssIGNhcHR1cmUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHRsYXllci5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgY2FsbGJhY2ssIGNhcHR1cmUpIHtcblx0XHRcdFx0dmFyIGFkdiA9IE5vZGUucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXI7XG5cdFx0XHRcdGlmICh0eXBlID09PSAnY2xpY2snKSB7XG5cdFx0XHRcdFx0YWR2LmNhbGwobGF5ZXIsIHR5cGUsIGNhbGxiYWNrLmhpamFja2VkIHx8IChjYWxsYmFjay5oaWphY2tlZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdFx0XHRpZiAoIWV2ZW50LnByb3BhZ2F0aW9uU3RvcHBlZCkge1xuXHRcdFx0XHRcdFx0XHRjYWxsYmFjayhldmVudCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSksIGNhcHR1cmUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGFkdi5jYWxsKGxheWVyLCB0eXBlLCBjYWxsYmFjaywgY2FwdHVyZSk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0Ly8gSWYgYSBoYW5kbGVyIGlzIGFscmVhZHkgZGVjbGFyZWQgaW4gdGhlIGVsZW1lbnQncyBvbmNsaWNrIGF0dHJpYnV0ZSwgaXQgd2lsbCBiZSBmaXJlZCBiZWZvcmVcblx0XHQvLyBGYXN0Q2xpY2sncyBvbkNsaWNrIGhhbmRsZXIuIEZpeCB0aGlzIGJ5IHB1bGxpbmcgb3V0IHRoZSB1c2VyLWRlZmluZWQgaGFuZGxlciBmdW5jdGlvbiBhbmRcblx0XHQvLyBhZGRpbmcgaXQgYXMgbGlzdGVuZXIuXG5cdFx0aWYgKHR5cGVvZiBsYXllci5vbmNsaWNrID09PSAnZnVuY3Rpb24nKSB7XG5cblx0XHRcdC8vIEFuZHJvaWQgYnJvd3NlciBvbiBhdCBsZWFzdCAzLjIgcmVxdWlyZXMgYSBuZXcgcmVmZXJlbmNlIHRvIHRoZSBmdW5jdGlvbiBpbiBsYXllci5vbmNsaWNrXG5cdFx0XHQvLyAtIHRoZSBvbGQgb25lIHdvbid0IHdvcmsgaWYgcGFzc2VkIHRvIGFkZEV2ZW50TGlzdGVuZXIgZGlyZWN0bHkuXG5cdFx0XHRvbGRPbkNsaWNrID0gbGF5ZXIub25jbGljaztcblx0XHRcdGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0b2xkT25DbGljayhldmVudCk7XG5cdFx0XHR9LCBmYWxzZSk7XG5cdFx0XHRsYXllci5vbmNsaWNrID0gbnVsbDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0KiBXaW5kb3dzIFBob25lIDguMSBmYWtlcyB1c2VyIGFnZW50IHN0cmluZyB0byBsb29rIGxpa2UgQW5kcm9pZCBhbmQgaVBob25lLlxuXHQqXG5cdCogQHR5cGUgYm9vbGVhblxuXHQqL1xuXHR2YXIgZGV2aWNlSXNXaW5kb3dzUGhvbmUgPSBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoXCJXaW5kb3dzIFBob25lXCIpID49IDA7XG5cblx0LyoqXG5cdCAqIEFuZHJvaWQgcmVxdWlyZXMgZXhjZXB0aW9ucy5cblx0ICpcblx0ICogQHR5cGUgYm9vbGVhblxuXHQgKi9cblx0dmFyIGRldmljZUlzQW5kcm9pZCA9IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignQW5kcm9pZCcpID4gMCAmJiAhZGV2aWNlSXNXaW5kb3dzUGhvbmU7XG5cblxuXHQvKipcblx0ICogaU9TIHJlcXVpcmVzIGV4Y2VwdGlvbnMuXG5cdCAqXG5cdCAqIEB0eXBlIGJvb2xlYW5cblx0ICovXG5cdHZhciBkZXZpY2VJc0lPUyA9IC9pUChhZHxob25lfG9kKS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSAmJiAhZGV2aWNlSXNXaW5kb3dzUGhvbmU7XG5cblxuXHQvKipcblx0ICogaU9TIDQgcmVxdWlyZXMgYW4gZXhjZXB0aW9uIGZvciBzZWxlY3QgZWxlbWVudHMuXG5cdCAqXG5cdCAqIEB0eXBlIGJvb2xlYW5cblx0ICovXG5cdHZhciBkZXZpY2VJc0lPUzQgPSBkZXZpY2VJc0lPUyAmJiAoL09TIDRfXFxkKF9cXGQpPy8pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG5cblxuXHQvKipcblx0ICogaU9TIDYuMC03LiogcmVxdWlyZXMgdGhlIHRhcmdldCBlbGVtZW50IHRvIGJlIG1hbnVhbGx5IGRlcml2ZWRcblx0ICpcblx0ICogQHR5cGUgYm9vbGVhblxuXHQgKi9cblx0dmFyIGRldmljZUlzSU9TV2l0aEJhZFRhcmdldCA9IGRldmljZUlzSU9TICYmICgvT1MgWzYtN11fXFxkLykudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcblxuXHQvKipcblx0ICogQmxhY2tCZXJyeSByZXF1aXJlcyBleGNlcHRpb25zLlxuXHQgKlxuXHQgKiBAdHlwZSBib29sZWFuXG5cdCAqL1xuXHR2YXIgZGV2aWNlSXNCbGFja0JlcnJ5MTAgPSBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ0JCMTAnKSA+IDA7XG5cblx0LyoqXG5cdCAqIERldGVybWluZSB3aGV0aGVyIGEgZ2l2ZW4gZWxlbWVudCByZXF1aXJlcyBhIG5hdGl2ZSBjbGljay5cblx0ICpcblx0ICogQHBhcmFtIHtFdmVudFRhcmdldHxFbGVtZW50fSB0YXJnZXQgVGFyZ2V0IERPTSBlbGVtZW50XG5cdCAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIHRydWUgaWYgdGhlIGVsZW1lbnQgbmVlZHMgYSBuYXRpdmUgY2xpY2tcblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUubmVlZHNDbGljayA9IGZ1bmN0aW9uKHRhcmdldCkge1xuXHRcdHN3aXRjaCAodGFyZ2V0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpIHtcblxuXHRcdC8vIERvbid0IHNlbmQgYSBzeW50aGV0aWMgY2xpY2sgdG8gZGlzYWJsZWQgaW5wdXRzIChpc3N1ZSAjNjIpXG5cdFx0Y2FzZSAnYnV0dG9uJzpcblx0XHRjYXNlICdzZWxlY3QnOlxuXHRcdGNhc2UgJ3RleHRhcmVhJzpcblx0XHRcdGlmICh0YXJnZXQuZGlzYWJsZWQpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJ2lucHV0JzpcblxuXHRcdFx0Ly8gRmlsZSBpbnB1dHMgbmVlZCByZWFsIGNsaWNrcyBvbiBpT1MgNiBkdWUgdG8gYSBicm93c2VyIGJ1ZyAoaXNzdWUgIzY4KVxuXHRcdFx0aWYgKChkZXZpY2VJc0lPUyAmJiB0YXJnZXQudHlwZSA9PT0gJ2ZpbGUnKSB8fCB0YXJnZXQuZGlzYWJsZWQpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJ2xhYmVsJzpcblx0XHRjYXNlICdpZnJhbWUnOiAvLyBpT1M4IGhvbWVzY3JlZW4gYXBwcyBjYW4gcHJldmVudCBldmVudHMgYnViYmxpbmcgaW50byBmcmFtZXNcblx0XHRjYXNlICd2aWRlbyc6XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKC9cXGJuZWVkc2NsaWNrXFxiLykudGVzdCh0YXJnZXQuY2xhc3NOYW1lKTtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBEZXRlcm1pbmUgd2hldGhlciBhIGdpdmVuIGVsZW1lbnQgcmVxdWlyZXMgYSBjYWxsIHRvIGZvY3VzIHRvIHNpbXVsYXRlIGNsaWNrIGludG8gZWxlbWVudC5cblx0ICpcblx0ICogQHBhcmFtIHtFdmVudFRhcmdldHxFbGVtZW50fSB0YXJnZXQgVGFyZ2V0IERPTSBlbGVtZW50XG5cdCAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIHRydWUgaWYgdGhlIGVsZW1lbnQgcmVxdWlyZXMgYSBjYWxsIHRvIGZvY3VzIHRvIHNpbXVsYXRlIG5hdGl2ZSBjbGljay5cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUubmVlZHNGb2N1cyA9IGZ1bmN0aW9uKHRhcmdldCkge1xuXHRcdHN3aXRjaCAodGFyZ2V0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpIHtcblx0XHRjYXNlICd0ZXh0YXJlYSc6XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRjYXNlICdzZWxlY3QnOlxuXHRcdFx0cmV0dXJuICFkZXZpY2VJc0FuZHJvaWQ7XG5cdFx0Y2FzZSAnaW5wdXQnOlxuXHRcdFx0c3dpdGNoICh0YXJnZXQudHlwZSkge1xuXHRcdFx0Y2FzZSAnYnV0dG9uJzpcblx0XHRcdGNhc2UgJ2NoZWNrYm94Jzpcblx0XHRcdGNhc2UgJ2ZpbGUnOlxuXHRcdFx0Y2FzZSAnaW1hZ2UnOlxuXHRcdFx0Y2FzZSAncmFkaW8nOlxuXHRcdFx0Y2FzZSAnc3VibWl0Jzpcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBObyBwb2ludCBpbiBhdHRlbXB0aW5nIHRvIGZvY3VzIGRpc2FibGVkIGlucHV0c1xuXHRcdFx0cmV0dXJuICF0YXJnZXQuZGlzYWJsZWQgJiYgIXRhcmdldC5yZWFkT25seTtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuICgvXFxibmVlZHNmb2N1c1xcYi8pLnRlc3QodGFyZ2V0LmNsYXNzTmFtZSk7XG5cdFx0fVxuXHR9O1xuXG5cblx0LyoqXG5cdCAqIFNlbmQgYSBjbGljayBldmVudCB0byB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RXZlbnRUYXJnZXR8RWxlbWVudH0gdGFyZ2V0RWxlbWVudFxuXHQgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5zZW5kQ2xpY2sgPSBmdW5jdGlvbih0YXJnZXRFbGVtZW50LCBldmVudCkge1xuXHRcdHZhciBjbGlja0V2ZW50LCB0b3VjaDtcblxuXHRcdC8vIE9uIHNvbWUgQW5kcm9pZCBkZXZpY2VzIGFjdGl2ZUVsZW1lbnQgbmVlZHMgdG8gYmUgYmx1cnJlZCBvdGhlcndpc2UgdGhlIHN5bnRoZXRpYyBjbGljayB3aWxsIGhhdmUgbm8gZWZmZWN0ICgjMjQpXG5cdFx0aWYgKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gdGFyZ2V0RWxlbWVudCkge1xuXHRcdFx0ZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5ibHVyKCk7XG5cdFx0fVxuXG5cdFx0dG91Y2ggPSBldmVudC5jaGFuZ2VkVG91Y2hlc1swXTtcblxuXHRcdC8vIFN5bnRoZXNpc2UgYSBjbGljayBldmVudCwgd2l0aCBhbiBleHRyYSBhdHRyaWJ1dGUgc28gaXQgY2FuIGJlIHRyYWNrZWRcblx0XHRjbGlja0V2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnRzJyk7XG5cdFx0Y2xpY2tFdmVudC5pbml0TW91c2VFdmVudCh0aGlzLmRldGVybWluZUV2ZW50VHlwZSh0YXJnZXRFbGVtZW50KSwgdHJ1ZSwgdHJ1ZSwgd2luZG93LCAxLCB0b3VjaC5zY3JlZW5YLCB0b3VjaC5zY3JlZW5ZLCB0b3VjaC5jbGllbnRYLCB0b3VjaC5jbGllbnRZLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgMCwgbnVsbCk7XG5cdFx0Y2xpY2tFdmVudC5mb3J3YXJkZWRUb3VjaEV2ZW50ID0gdHJ1ZTtcblx0XHR0YXJnZXRFbGVtZW50LmRpc3BhdGNoRXZlbnQoY2xpY2tFdmVudCk7XG5cdH07XG5cblx0RmFzdENsaWNrLnByb3RvdHlwZS5kZXRlcm1pbmVFdmVudFR5cGUgPSBmdW5jdGlvbih0YXJnZXRFbGVtZW50KSB7XG5cblx0XHQvL0lzc3VlICMxNTk6IEFuZHJvaWQgQ2hyb21lIFNlbGVjdCBCb3ggZG9lcyBub3Qgb3BlbiB3aXRoIGEgc3ludGhldGljIGNsaWNrIGV2ZW50XG5cdFx0aWYgKGRldmljZUlzQW5kcm9pZCAmJiB0YXJnZXRFbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3NlbGVjdCcpIHtcblx0XHRcdHJldHVybiAnbW91c2Vkb3duJztcblx0XHR9XG5cblx0XHRyZXR1cm4gJ2NsaWNrJztcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fEVsZW1lbnR9IHRhcmdldEVsZW1lbnRcblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUuZm9jdXMgPSBmdW5jdGlvbih0YXJnZXRFbGVtZW50KSB7XG5cdFx0dmFyIGxlbmd0aDtcblxuXHRcdC8vIElzc3VlICMxNjA6IG9uIGlPUyA3LCBzb21lIGlucHV0IGVsZW1lbnRzIChlLmcuIGRhdGUgZGF0ZXRpbWUgbW9udGgpIHRocm93IGEgdmFndWUgVHlwZUVycm9yIG9uIHNldFNlbGVjdGlvblJhbmdlLiBUaGVzZSBlbGVtZW50cyBkb24ndCBoYXZlIGFuIGludGVnZXIgdmFsdWUgZm9yIHRoZSBzZWxlY3Rpb25TdGFydCBhbmQgc2VsZWN0aW9uRW5kIHByb3BlcnRpZXMsIGJ1dCB1bmZvcnR1bmF0ZWx5IHRoYXQgY2FuJ3QgYmUgdXNlZCBmb3IgZGV0ZWN0aW9uIGJlY2F1c2UgYWNjZXNzaW5nIHRoZSBwcm9wZXJ0aWVzIGFsc28gdGhyb3dzIGEgVHlwZUVycm9yLiBKdXN0IGNoZWNrIHRoZSB0eXBlIGluc3RlYWQuIEZpbGVkIGFzIEFwcGxlIGJ1ZyAjMTUxMjI3MjQuXG5cdFx0aWYgKGRldmljZUlzSU9TICYmIHRhcmdldEVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2UgJiYgdGFyZ2V0RWxlbWVudC50eXBlLmluZGV4T2YoJ2RhdGUnKSAhPT0gMCAmJiB0YXJnZXRFbGVtZW50LnR5cGUgIT09ICd0aW1lJyAmJiB0YXJnZXRFbGVtZW50LnR5cGUgIT09ICdtb250aCcpIHtcblx0XHRcdGxlbmd0aCA9IHRhcmdldEVsZW1lbnQudmFsdWUubGVuZ3RoO1xuXHRcdFx0dGFyZ2V0RWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZShsZW5ndGgsIGxlbmd0aCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRhcmdldEVsZW1lbnQuZm9jdXMoKTtcblx0XHR9XG5cdH07XG5cblxuXHQvKipcblx0ICogQ2hlY2sgd2hldGhlciB0aGUgZ2l2ZW4gdGFyZ2V0IGVsZW1lbnQgaXMgYSBjaGlsZCBvZiBhIHNjcm9sbGFibGUgbGF5ZXIgYW5kIGlmIHNvLCBzZXQgYSBmbGFnIG9uIGl0LlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fEVsZW1lbnR9IHRhcmdldEVsZW1lbnRcblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUudXBkYXRlU2Nyb2xsUGFyZW50ID0gZnVuY3Rpb24odGFyZ2V0RWxlbWVudCkge1xuXHRcdHZhciBzY3JvbGxQYXJlbnQsIHBhcmVudEVsZW1lbnQ7XG5cblx0XHRzY3JvbGxQYXJlbnQgPSB0YXJnZXRFbGVtZW50LmZhc3RDbGlja1Njcm9sbFBhcmVudDtcblxuXHRcdC8vIEF0dGVtcHQgdG8gZGlzY292ZXIgd2hldGhlciB0aGUgdGFyZ2V0IGVsZW1lbnQgaXMgY29udGFpbmVkIHdpdGhpbiBhIHNjcm9sbGFibGUgbGF5ZXIuIFJlLWNoZWNrIGlmIHRoZVxuXHRcdC8vIHRhcmdldCBlbGVtZW50IHdhcyBtb3ZlZCB0byBhbm90aGVyIHBhcmVudC5cblx0XHRpZiAoIXNjcm9sbFBhcmVudCB8fCAhc2Nyb2xsUGFyZW50LmNvbnRhaW5zKHRhcmdldEVsZW1lbnQpKSB7XG5cdFx0XHRwYXJlbnRFbGVtZW50ID0gdGFyZ2V0RWxlbWVudDtcblx0XHRcdGRvIHtcblx0XHRcdFx0aWYgKHBhcmVudEVsZW1lbnQuc2Nyb2xsSGVpZ2h0ID4gcGFyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQpIHtcblx0XHRcdFx0XHRzY3JvbGxQYXJlbnQgPSBwYXJlbnRFbGVtZW50O1xuXHRcdFx0XHRcdHRhcmdldEVsZW1lbnQuZmFzdENsaWNrU2Nyb2xsUGFyZW50ID0gcGFyZW50RWxlbWVudDtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHBhcmVudEVsZW1lbnQgPSBwYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQ7XG5cdFx0XHR9IHdoaWxlIChwYXJlbnRFbGVtZW50KTtcblx0XHR9XG5cblx0XHQvLyBBbHdheXMgdXBkYXRlIHRoZSBzY3JvbGwgdG9wIHRyYWNrZXIgaWYgcG9zc2libGUuXG5cdFx0aWYgKHNjcm9sbFBhcmVudCkge1xuXHRcdFx0c2Nyb2xsUGFyZW50LmZhc3RDbGlja0xhc3RTY3JvbGxUb3AgPSBzY3JvbGxQYXJlbnQuc2Nyb2xsVG9wO1xuXHRcdH1cblx0fTtcblxuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fSB0YXJnZXRFbGVtZW50XG5cdCAqIEByZXR1cm5zIHtFbGVtZW50fEV2ZW50VGFyZ2V0fVxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5nZXRUYXJnZXRFbGVtZW50RnJvbUV2ZW50VGFyZ2V0ID0gZnVuY3Rpb24oZXZlbnRUYXJnZXQpIHtcblxuXHRcdC8vIE9uIHNvbWUgb2xkZXIgYnJvd3NlcnMgKG5vdGFibHkgU2FmYXJpIG9uIGlPUyA0LjEgLSBzZWUgaXNzdWUgIzU2KSB0aGUgZXZlbnQgdGFyZ2V0IG1heSBiZSBhIHRleHQgbm9kZS5cblx0XHRpZiAoZXZlbnRUYXJnZXQubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFKSB7XG5cdFx0XHRyZXR1cm4gZXZlbnRUYXJnZXQucGFyZW50Tm9kZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZXZlbnRUYXJnZXQ7XG5cdH07XG5cblxuXHQvKipcblx0ICogT24gdG91Y2ggc3RhcnQsIHJlY29yZCB0aGUgcG9zaXRpb24gYW5kIHNjcm9sbCBvZmZzZXQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5vblRvdWNoU3RhcnQgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdHZhciB0YXJnZXRFbGVtZW50LCB0b3VjaCwgc2VsZWN0aW9uO1xuXG5cdFx0Ly8gSWdub3JlIG11bHRpcGxlIHRvdWNoZXMsIG90aGVyd2lzZSBwaW5jaC10by16b29tIGlzIHByZXZlbnRlZCBpZiBib3RoIGZpbmdlcnMgYXJlIG9uIHRoZSBGYXN0Q2xpY2sgZWxlbWVudCAoaXNzdWUgIzExMSkuXG5cdFx0aWYgKGV2ZW50LnRhcmdldFRvdWNoZXMubGVuZ3RoID4gMSkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0dGFyZ2V0RWxlbWVudCA9IHRoaXMuZ2V0VGFyZ2V0RWxlbWVudEZyb21FdmVudFRhcmdldChldmVudC50YXJnZXQpO1xuXHRcdHRvdWNoID0gZXZlbnQudGFyZ2V0VG91Y2hlc1swXTtcblxuXHRcdGlmIChkZXZpY2VJc0lPUykge1xuXG5cdFx0XHQvLyBPbmx5IHRydXN0ZWQgZXZlbnRzIHdpbGwgZGVzZWxlY3QgdGV4dCBvbiBpT1MgKGlzc3VlICM0OSlcblx0XHRcdHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcblx0XHRcdGlmIChzZWxlY3Rpb24ucmFuZ2VDb3VudCAmJiAhc2VsZWN0aW9uLmlzQ29sbGFwc2VkKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIWRldmljZUlzSU9TNCkge1xuXG5cdFx0XHRcdC8vIFdlaXJkIHRoaW5ncyBoYXBwZW4gb24gaU9TIHdoZW4gYW4gYWxlcnQgb3IgY29uZmlybSBkaWFsb2cgaXMgb3BlbmVkIGZyb20gYSBjbGljayBldmVudCBjYWxsYmFjayAoaXNzdWUgIzIzKTpcblx0XHRcdFx0Ly8gd2hlbiB0aGUgdXNlciBuZXh0IHRhcHMgYW55d2hlcmUgZWxzZSBvbiB0aGUgcGFnZSwgbmV3IHRvdWNoc3RhcnQgYW5kIHRvdWNoZW5kIGV2ZW50cyBhcmUgZGlzcGF0Y2hlZFxuXHRcdFx0XHQvLyB3aXRoIHRoZSBzYW1lIGlkZW50aWZpZXIgYXMgdGhlIHRvdWNoIGV2ZW50IHRoYXQgcHJldmlvdXNseSB0cmlnZ2VyZWQgdGhlIGNsaWNrIHRoYXQgdHJpZ2dlcmVkIHRoZSBhbGVydC5cblx0XHRcdFx0Ly8gU2FkbHksIHRoZXJlIGlzIGFuIGlzc3VlIG9uIGlPUyA0IHRoYXQgY2F1c2VzIHNvbWUgbm9ybWFsIHRvdWNoIGV2ZW50cyB0byBoYXZlIHRoZSBzYW1lIGlkZW50aWZpZXIgYXMgYW5cblx0XHRcdFx0Ly8gaW1tZWRpYXRlbHkgcHJlY2VlZGluZyB0b3VjaCBldmVudCAoaXNzdWUgIzUyKSwgc28gdGhpcyBmaXggaXMgdW5hdmFpbGFibGUgb24gdGhhdCBwbGF0Zm9ybS5cblx0XHRcdFx0Ly8gSXNzdWUgMTIwOiB0b3VjaC5pZGVudGlmaWVyIGlzIDAgd2hlbiBDaHJvbWUgZGV2IHRvb2xzICdFbXVsYXRlIHRvdWNoIGV2ZW50cycgaXMgc2V0IHdpdGggYW4gaU9TIGRldmljZSBVQSBzdHJpbmcsXG5cdFx0XHRcdC8vIHdoaWNoIGNhdXNlcyBhbGwgdG91Y2ggZXZlbnRzIHRvIGJlIGlnbm9yZWQuIEFzIHRoaXMgYmxvY2sgb25seSBhcHBsaWVzIHRvIGlPUywgYW5kIGlPUyBpZGVudGlmaWVycyBhcmUgYWx3YXlzIGxvbmcsXG5cdFx0XHRcdC8vIHJhbmRvbSBpbnRlZ2VycywgaXQncyBzYWZlIHRvIHRvIGNvbnRpbnVlIGlmIHRoZSBpZGVudGlmaWVyIGlzIDAgaGVyZS5cblx0XHRcdFx0aWYgKHRvdWNoLmlkZW50aWZpZXIgJiYgdG91Y2guaWRlbnRpZmllciA9PT0gdGhpcy5sYXN0VG91Y2hJZGVudGlmaWVyKSB7XG5cdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLmxhc3RUb3VjaElkZW50aWZpZXIgPSB0b3VjaC5pZGVudGlmaWVyO1xuXG5cdFx0XHRcdC8vIElmIHRoZSB0YXJnZXQgZWxlbWVudCBpcyBhIGNoaWxkIG9mIGEgc2Nyb2xsYWJsZSBsYXllciAodXNpbmcgLXdlYmtpdC1vdmVyZmxvdy1zY3JvbGxpbmc6IHRvdWNoKSBhbmQ6XG5cdFx0XHRcdC8vIDEpIHRoZSB1c2VyIGRvZXMgYSBmbGluZyBzY3JvbGwgb24gdGhlIHNjcm9sbGFibGUgbGF5ZXJcblx0XHRcdFx0Ly8gMikgdGhlIHVzZXIgc3RvcHMgdGhlIGZsaW5nIHNjcm9sbCB3aXRoIGFub3RoZXIgdGFwXG5cdFx0XHRcdC8vIHRoZW4gdGhlIGV2ZW50LnRhcmdldCBvZiB0aGUgbGFzdCAndG91Y2hlbmQnIGV2ZW50IHdpbGwgYmUgdGhlIGVsZW1lbnQgdGhhdCB3YXMgdW5kZXIgdGhlIHVzZXIncyBmaW5nZXJcblx0XHRcdFx0Ly8gd2hlbiB0aGUgZmxpbmcgc2Nyb2xsIHdhcyBzdGFydGVkLCBjYXVzaW5nIEZhc3RDbGljayB0byBzZW5kIGEgY2xpY2sgZXZlbnQgdG8gdGhhdCBsYXllciAtIHVubGVzcyBhIGNoZWNrXG5cdFx0XHRcdC8vIGlzIG1hZGUgdG8gZW5zdXJlIHRoYXQgYSBwYXJlbnQgbGF5ZXIgd2FzIG5vdCBzY3JvbGxlZCBiZWZvcmUgc2VuZGluZyBhIHN5bnRoZXRpYyBjbGljayAoaXNzdWUgIzQyKS5cblx0XHRcdFx0dGhpcy51cGRhdGVTY3JvbGxQYXJlbnQodGFyZ2V0RWxlbWVudCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy50cmFja2luZ0NsaWNrID0gdHJ1ZTtcblx0XHR0aGlzLnRyYWNraW5nQ2xpY2tTdGFydCA9IGV2ZW50LnRpbWVTdGFtcDtcblx0XHR0aGlzLnRhcmdldEVsZW1lbnQgPSB0YXJnZXRFbGVtZW50O1xuXG5cdFx0dGhpcy50b3VjaFN0YXJ0WCA9IHRvdWNoLnBhZ2VYO1xuXHRcdHRoaXMudG91Y2hTdGFydFkgPSB0b3VjaC5wYWdlWTtcblxuXHRcdC8vIFByZXZlbnQgcGhhbnRvbSBjbGlja3Mgb24gZmFzdCBkb3VibGUtdGFwIChpc3N1ZSAjMzYpXG5cdFx0aWYgKChldmVudC50aW1lU3RhbXAgLSB0aGlzLmxhc3RDbGlja1RpbWUpIDwgdGhpcy50YXBEZWxheSkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBCYXNlZCBvbiBhIHRvdWNobW92ZSBldmVudCBvYmplY3QsIGNoZWNrIHdoZXRoZXIgdGhlIHRvdWNoIGhhcyBtb3ZlZCBwYXN0IGEgYm91bmRhcnkgc2luY2UgaXQgc3RhcnRlZC5cblx0ICpcblx0ICogQHBhcmFtIHtFdmVudH0gZXZlbnRcblx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLnRvdWNoSGFzTW92ZWQgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdHZhciB0b3VjaCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLCBib3VuZGFyeSA9IHRoaXMudG91Y2hCb3VuZGFyeTtcblxuXHRcdGlmIChNYXRoLmFicyh0b3VjaC5wYWdlWCAtIHRoaXMudG91Y2hTdGFydFgpID4gYm91bmRhcnkgfHwgTWF0aC5hYnModG91Y2gucGFnZVkgLSB0aGlzLnRvdWNoU3RhcnRZKSA+IGJvdW5kYXJ5KSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH07XG5cblxuXHQvKipcblx0ICogVXBkYXRlIHRoZSBsYXN0IHBvc2l0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUub25Ub3VjaE1vdmUgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdGlmICghdGhpcy50cmFja2luZ0NsaWNrKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyBJZiB0aGUgdG91Y2ggaGFzIG1vdmVkLCBjYW5jZWwgdGhlIGNsaWNrIHRyYWNraW5nXG5cdFx0aWYgKHRoaXMudGFyZ2V0RWxlbWVudCAhPT0gdGhpcy5nZXRUYXJnZXRFbGVtZW50RnJvbUV2ZW50VGFyZ2V0KGV2ZW50LnRhcmdldCkgfHwgdGhpcy50b3VjaEhhc01vdmVkKGV2ZW50KSkge1xuXHRcdFx0dGhpcy50cmFja2luZ0NsaWNrID0gZmFsc2U7XG5cdFx0XHR0aGlzLnRhcmdldEVsZW1lbnQgPSBudWxsO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIEF0dGVtcHQgdG8gZmluZCB0aGUgbGFiZWxsZWQgY29udHJvbCBmb3IgdGhlIGdpdmVuIGxhYmVsIGVsZW1lbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RXZlbnRUYXJnZXR8SFRNTExhYmVsRWxlbWVudH0gbGFiZWxFbGVtZW50XG5cdCAqIEByZXR1cm5zIHtFbGVtZW50fG51bGx9XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLmZpbmRDb250cm9sID0gZnVuY3Rpb24obGFiZWxFbGVtZW50KSB7XG5cblx0XHQvLyBGYXN0IHBhdGggZm9yIG5ld2VyIGJyb3dzZXJzIHN1cHBvcnRpbmcgdGhlIEhUTUw1IGNvbnRyb2wgYXR0cmlidXRlXG5cdFx0aWYgKGxhYmVsRWxlbWVudC5jb250cm9sICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHJldHVybiBsYWJlbEVsZW1lbnQuY29udHJvbDtcblx0XHR9XG5cblx0XHQvLyBBbGwgYnJvd3NlcnMgdW5kZXIgdGVzdCB0aGF0IHN1cHBvcnQgdG91Y2ggZXZlbnRzIGFsc28gc3VwcG9ydCB0aGUgSFRNTDUgaHRtbEZvciBhdHRyaWJ1dGVcblx0XHRpZiAobGFiZWxFbGVtZW50Lmh0bWxGb3IpIHtcblx0XHRcdHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChsYWJlbEVsZW1lbnQuaHRtbEZvcik7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgbm8gZm9yIGF0dHJpYnV0ZSBleGlzdHMsIGF0dGVtcHQgdG8gcmV0cmlldmUgdGhlIGZpcnN0IGxhYmVsbGFibGUgZGVzY2VuZGFudCBlbGVtZW50XG5cdFx0Ly8gdGhlIGxpc3Qgb2Ygd2hpY2ggaXMgZGVmaW5lZCBoZXJlOiBodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sNS9mb3Jtcy5odG1sI2NhdGVnb3J5LWxhYmVsXG5cdFx0cmV0dXJuIGxhYmVsRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdidXR0b24sIGlucHV0Om5vdChbdHlwZT1oaWRkZW5dKSwga2V5Z2VuLCBtZXRlciwgb3V0cHV0LCBwcm9ncmVzcywgc2VsZWN0LCB0ZXh0YXJlYScpO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIE9uIHRvdWNoIGVuZCwgZGV0ZXJtaW5lIHdoZXRoZXIgdG8gc2VuZCBhIGNsaWNrIGV2ZW50IGF0IG9uY2UuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5vblRvdWNoRW5kID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHR2YXIgZm9yRWxlbWVudCwgdHJhY2tpbmdDbGlja1N0YXJ0LCB0YXJnZXRUYWdOYW1lLCBzY3JvbGxQYXJlbnQsIHRvdWNoLCB0YXJnZXRFbGVtZW50ID0gdGhpcy50YXJnZXRFbGVtZW50O1xuXG5cdFx0aWYgKCF0aGlzLnRyYWNraW5nQ2xpY2spIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIFByZXZlbnQgcGhhbnRvbSBjbGlja3Mgb24gZmFzdCBkb3VibGUtdGFwIChpc3N1ZSAjMzYpXG5cdFx0aWYgKChldmVudC50aW1lU3RhbXAgLSB0aGlzLmxhc3RDbGlja1RpbWUpIDwgdGhpcy50YXBEZWxheSkge1xuXHRcdFx0dGhpcy5jYW5jZWxOZXh0Q2xpY2sgPSB0cnVlO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKChldmVudC50aW1lU3RhbXAgLSB0aGlzLnRyYWNraW5nQ2xpY2tTdGFydCkgPiB0aGlzLnRhcFRpbWVvdXQpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIFJlc2V0IHRvIHByZXZlbnQgd3JvbmcgY2xpY2sgY2FuY2VsIG9uIGlucHV0IChpc3N1ZSAjMTU2KS5cblx0XHR0aGlzLmNhbmNlbE5leHRDbGljayA9IGZhbHNlO1xuXG5cdFx0dGhpcy5sYXN0Q2xpY2tUaW1lID0gZXZlbnQudGltZVN0YW1wO1xuXG5cdFx0dHJhY2tpbmdDbGlja1N0YXJ0ID0gdGhpcy50cmFja2luZ0NsaWNrU3RhcnQ7XG5cdFx0dGhpcy50cmFja2luZ0NsaWNrID0gZmFsc2U7XG5cdFx0dGhpcy50cmFja2luZ0NsaWNrU3RhcnQgPSAwO1xuXG5cdFx0Ly8gT24gc29tZSBpT1MgZGV2aWNlcywgdGhlIHRhcmdldEVsZW1lbnQgc3VwcGxpZWQgd2l0aCB0aGUgZXZlbnQgaXMgaW52YWxpZCBpZiB0aGUgbGF5ZXJcblx0XHQvLyBpcyBwZXJmb3JtaW5nIGEgdHJhbnNpdGlvbiBvciBzY3JvbGwsIGFuZCBoYXMgdG8gYmUgcmUtZGV0ZWN0ZWQgbWFudWFsbHkuIE5vdGUgdGhhdFxuXHRcdC8vIGZvciB0aGlzIHRvIGZ1bmN0aW9uIGNvcnJlY3RseSwgaXQgbXVzdCBiZSBjYWxsZWQgKmFmdGVyKiB0aGUgZXZlbnQgdGFyZ2V0IGlzIGNoZWNrZWQhXG5cdFx0Ly8gU2VlIGlzc3VlICM1NzsgYWxzbyBmaWxlZCBhcyByZGFyOi8vMTMwNDg1ODkgLlxuXHRcdGlmIChkZXZpY2VJc0lPU1dpdGhCYWRUYXJnZXQpIHtcblx0XHRcdHRvdWNoID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF07XG5cblx0XHRcdC8vIEluIGNlcnRhaW4gY2FzZXMgYXJndW1lbnRzIG9mIGVsZW1lbnRGcm9tUG9pbnQgY2FuIGJlIG5lZ2F0aXZlLCBzbyBwcmV2ZW50IHNldHRpbmcgdGFyZ2V0RWxlbWVudCB0byBudWxsXG5cdFx0XHR0YXJnZXRFbGVtZW50ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCh0b3VjaC5wYWdlWCAtIHdpbmRvdy5wYWdlWE9mZnNldCwgdG91Y2gucGFnZVkgLSB3aW5kb3cucGFnZVlPZmZzZXQpIHx8IHRhcmdldEVsZW1lbnQ7XG5cdFx0XHR0YXJnZXRFbGVtZW50LmZhc3RDbGlja1Njcm9sbFBhcmVudCA9IHRoaXMudGFyZ2V0RWxlbWVudC5mYXN0Q2xpY2tTY3JvbGxQYXJlbnQ7XG5cdFx0fVxuXG5cdFx0dGFyZ2V0VGFnTmFtZSA9IHRhcmdldEVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuXHRcdGlmICh0YXJnZXRUYWdOYW1lID09PSAnbGFiZWwnKSB7XG5cdFx0XHRmb3JFbGVtZW50ID0gdGhpcy5maW5kQ29udHJvbCh0YXJnZXRFbGVtZW50KTtcblx0XHRcdGlmIChmb3JFbGVtZW50KSB7XG5cdFx0XHRcdHRoaXMuZm9jdXModGFyZ2V0RWxlbWVudCk7XG5cdFx0XHRcdGlmIChkZXZpY2VJc0FuZHJvaWQpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0YXJnZXRFbGVtZW50ID0gZm9yRWxlbWVudDtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKHRoaXMubmVlZHNGb2N1cyh0YXJnZXRFbGVtZW50KSkge1xuXG5cdFx0XHQvLyBDYXNlIDE6IElmIHRoZSB0b3VjaCBzdGFydGVkIGEgd2hpbGUgYWdvIChiZXN0IGd1ZXNzIGlzIDEwMG1zIGJhc2VkIG9uIHRlc3RzIGZvciBpc3N1ZSAjMzYpIHRoZW4gZm9jdXMgd2lsbCBiZSB0cmlnZ2VyZWQgYW55d2F5LiBSZXR1cm4gZWFybHkgYW5kIHVuc2V0IHRoZSB0YXJnZXQgZWxlbWVudCByZWZlcmVuY2Ugc28gdGhhdCB0aGUgc3Vic2VxdWVudCBjbGljayB3aWxsIGJlIGFsbG93ZWQgdGhyb3VnaC5cblx0XHRcdC8vIENhc2UgMjogV2l0aG91dCB0aGlzIGV4Y2VwdGlvbiBmb3IgaW5wdXQgZWxlbWVudHMgdGFwcGVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIGNvbnRhaW5lZCBpbiBhbiBpZnJhbWUsIHRoZW4gYW55IGlucHV0dGVkIHRleHQgd29uJ3QgYmUgdmlzaWJsZSBldmVuIHRob3VnaCB0aGUgdmFsdWUgYXR0cmlidXRlIGlzIHVwZGF0ZWQgYXMgdGhlIHVzZXIgdHlwZXMgKGlzc3VlICMzNykuXG5cdFx0XHRpZiAoKGV2ZW50LnRpbWVTdGFtcCAtIHRyYWNraW5nQ2xpY2tTdGFydCkgPiAxMDAgfHwgKGRldmljZUlzSU9TICYmIHdpbmRvdy50b3AgIT09IHdpbmRvdyAmJiB0YXJnZXRUYWdOYW1lID09PSAnaW5wdXQnKSkge1xuXHRcdFx0XHR0aGlzLnRhcmdldEVsZW1lbnQgPSBudWxsO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuZm9jdXModGFyZ2V0RWxlbWVudCk7XG5cdFx0XHR0aGlzLnNlbmRDbGljayh0YXJnZXRFbGVtZW50LCBldmVudCk7XG5cblx0XHRcdC8vIFNlbGVjdCBlbGVtZW50cyBuZWVkIHRoZSBldmVudCB0byBnbyB0aHJvdWdoIG9uIGlPUyA0LCBvdGhlcndpc2UgdGhlIHNlbGVjdG9yIG1lbnUgd29uJ3Qgb3Blbi5cblx0XHRcdC8vIEFsc28gdGhpcyBicmVha3Mgb3BlbmluZyBzZWxlY3RzIHdoZW4gVm9pY2VPdmVyIGlzIGFjdGl2ZSBvbiBpT1M2LCBpT1M3IChhbmQgcG9zc2libHkgb3RoZXJzKVxuXHRcdFx0aWYgKCFkZXZpY2VJc0lPUyB8fCB0YXJnZXRUYWdOYW1lICE9PSAnc2VsZWN0Jykge1xuXHRcdFx0XHR0aGlzLnRhcmdldEVsZW1lbnQgPSBudWxsO1xuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0aWYgKGRldmljZUlzSU9TICYmICFkZXZpY2VJc0lPUzQpIHtcblxuXHRcdFx0Ly8gRG9uJ3Qgc2VuZCBhIHN5bnRoZXRpYyBjbGljayBldmVudCBpZiB0aGUgdGFyZ2V0IGVsZW1lbnQgaXMgY29udGFpbmVkIHdpdGhpbiBhIHBhcmVudCBsYXllciB0aGF0IHdhcyBzY3JvbGxlZFxuXHRcdFx0Ly8gYW5kIHRoaXMgdGFwIGlzIGJlaW5nIHVzZWQgdG8gc3RvcCB0aGUgc2Nyb2xsaW5nICh1c3VhbGx5IGluaXRpYXRlZCBieSBhIGZsaW5nIC0gaXNzdWUgIzQyKS5cblx0XHRcdHNjcm9sbFBhcmVudCA9IHRhcmdldEVsZW1lbnQuZmFzdENsaWNrU2Nyb2xsUGFyZW50O1xuXHRcdFx0aWYgKHNjcm9sbFBhcmVudCAmJiBzY3JvbGxQYXJlbnQuZmFzdENsaWNrTGFzdFNjcm9sbFRvcCAhPT0gc2Nyb2xsUGFyZW50LnNjcm9sbFRvcCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBQcmV2ZW50IHRoZSBhY3R1YWwgY2xpY2sgZnJvbSBnb2luZyB0aG91Z2ggLSB1bmxlc3MgdGhlIHRhcmdldCBub2RlIGlzIG1hcmtlZCBhcyByZXF1aXJpbmdcblx0XHQvLyByZWFsIGNsaWNrcyBvciBpZiBpdCBpcyBpbiB0aGUgd2hpdGVsaXN0IGluIHdoaWNoIGNhc2Ugb25seSBub24tcHJvZ3JhbW1hdGljIGNsaWNrcyBhcmUgcGVybWl0dGVkLlxuXHRcdGlmICghdGhpcy5uZWVkc0NsaWNrKHRhcmdldEVsZW1lbnQpKSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0dGhpcy5zZW5kQ2xpY2sodGFyZ2V0RWxlbWVudCwgZXZlbnQpO1xuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBPbiB0b3VjaCBjYW5jZWwsIHN0b3AgdHJhY2tpbmcgdGhlIGNsaWNrLlxuXHQgKlxuXHQgKiBAcmV0dXJucyB7dm9pZH1cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUub25Ub3VjaENhbmNlbCA9IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMudHJhY2tpbmdDbGljayA9IGZhbHNlO1xuXHRcdHRoaXMudGFyZ2V0RWxlbWVudCA9IG51bGw7XG5cdH07XG5cblxuXHQvKipcblx0ICogRGV0ZXJtaW5lIG1vdXNlIGV2ZW50cyB3aGljaCBzaG91bGQgYmUgcGVybWl0dGVkLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUub25Nb3VzZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cblx0XHQvLyBJZiBhIHRhcmdldCBlbGVtZW50IHdhcyBuZXZlciBzZXQgKGJlY2F1c2UgYSB0b3VjaCBldmVudCB3YXMgbmV2ZXIgZmlyZWQpIGFsbG93IHRoZSBldmVudFxuXHRcdGlmICghdGhpcy50YXJnZXRFbGVtZW50KSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAoZXZlbnQuZm9yd2FyZGVkVG91Y2hFdmVudCkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gUHJvZ3JhbW1hdGljYWxseSBnZW5lcmF0ZWQgZXZlbnRzIHRhcmdldGluZyBhIHNwZWNpZmljIGVsZW1lbnQgc2hvdWxkIGJlIHBlcm1pdHRlZFxuXHRcdGlmICghZXZlbnQuY2FuY2VsYWJsZSkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gRGVyaXZlIGFuZCBjaGVjayB0aGUgdGFyZ2V0IGVsZW1lbnQgdG8gc2VlIHdoZXRoZXIgdGhlIG1vdXNlIGV2ZW50IG5lZWRzIHRvIGJlIHBlcm1pdHRlZDtcblx0XHQvLyB1bmxlc3MgZXhwbGljaXRseSBlbmFibGVkLCBwcmV2ZW50IG5vbi10b3VjaCBjbGljayBldmVudHMgZnJvbSB0cmlnZ2VyaW5nIGFjdGlvbnMsXG5cdFx0Ly8gdG8gcHJldmVudCBnaG9zdC9kb3VibGVjbGlja3MuXG5cdFx0aWYgKCF0aGlzLm5lZWRzQ2xpY2sodGhpcy50YXJnZXRFbGVtZW50KSB8fCB0aGlzLmNhbmNlbE5leHRDbGljaykge1xuXG5cdFx0XHQvLyBQcmV2ZW50IGFueSB1c2VyLWFkZGVkIGxpc3RlbmVycyBkZWNsYXJlZCBvbiBGYXN0Q2xpY2sgZWxlbWVudCBmcm9tIGJlaW5nIGZpcmVkLlxuXHRcdFx0aWYgKGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbikge1xuXHRcdFx0XHRldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0Ly8gUGFydCBvZiB0aGUgaGFjayBmb3IgYnJvd3NlcnMgdGhhdCBkb24ndCBzdXBwb3J0IEV2ZW50I3N0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbiAoZS5nLiBBbmRyb2lkIDIpXG5cdFx0XHRcdGV2ZW50LnByb3BhZ2F0aW9uU3RvcHBlZCA9IHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdC8vIENhbmNlbCB0aGUgZXZlbnRcblx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIElmIHRoZSBtb3VzZSBldmVudCBpcyBwZXJtaXR0ZWQsIHJldHVybiB0cnVlIGZvciB0aGUgYWN0aW9uIHRvIGdvIHRocm91Z2guXG5cdFx0cmV0dXJuIHRydWU7XG5cdH07XG5cblxuXHQvKipcblx0ICogT24gYWN0dWFsIGNsaWNrcywgZGV0ZXJtaW5lIHdoZXRoZXIgdGhpcyBpcyBhIHRvdWNoLWdlbmVyYXRlZCBjbGljaywgYSBjbGljayBhY3Rpb24gb2NjdXJyaW5nXG5cdCAqIG5hdHVyYWxseSBhZnRlciBhIGRlbGF5IGFmdGVyIGEgdG91Y2ggKHdoaWNoIG5lZWRzIHRvIGJlIGNhbmNlbGxlZCB0byBhdm9pZCBkdXBsaWNhdGlvbiksIG9yXG5cdCAqIGFuIGFjdHVhbCBjbGljayB3aGljaCBzaG91bGQgYmUgcGVybWl0dGVkLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUub25DbGljayA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0dmFyIHBlcm1pdHRlZDtcblxuXHRcdC8vIEl0J3MgcG9zc2libGUgZm9yIGFub3RoZXIgRmFzdENsaWNrLWxpa2UgbGlicmFyeSBkZWxpdmVyZWQgd2l0aCB0aGlyZC1wYXJ0eSBjb2RlIHRvIGZpcmUgYSBjbGljayBldmVudCBiZWZvcmUgRmFzdENsaWNrIGRvZXMgKGlzc3VlICM0NCkuIEluIHRoYXQgY2FzZSwgc2V0IHRoZSBjbGljay10cmFja2luZyBmbGFnIGJhY2sgdG8gZmFsc2UgYW5kIHJldHVybiBlYXJseS4gVGhpcyB3aWxsIGNhdXNlIG9uVG91Y2hFbmQgdG8gcmV0dXJuIGVhcmx5LlxuXHRcdGlmICh0aGlzLnRyYWNraW5nQ2xpY2spIHtcblx0XHRcdHRoaXMudGFyZ2V0RWxlbWVudCA9IG51bGw7XG5cdFx0XHR0aGlzLnRyYWNraW5nQ2xpY2sgPSBmYWxzZTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIFZlcnkgb2RkIGJlaGF2aW91ciBvbiBpT1MgKGlzc3VlICMxOCk6IGlmIGEgc3VibWl0IGVsZW1lbnQgaXMgcHJlc2VudCBpbnNpZGUgYSBmb3JtIGFuZCB0aGUgdXNlciBoaXRzIGVudGVyIGluIHRoZSBpT1Mgc2ltdWxhdG9yIG9yIGNsaWNrcyB0aGUgR28gYnV0dG9uIG9uIHRoZSBwb3AtdXAgT1Mga2V5Ym9hcmQgdGhlIGEga2luZCBvZiAnZmFrZScgY2xpY2sgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgd2l0aCB0aGUgc3VibWl0LXR5cGUgaW5wdXQgZWxlbWVudCBhcyB0aGUgdGFyZ2V0LlxuXHRcdGlmIChldmVudC50YXJnZXQudHlwZSA9PT0gJ3N1Ym1pdCcgJiYgZXZlbnQuZGV0YWlsID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRwZXJtaXR0ZWQgPSB0aGlzLm9uTW91c2UoZXZlbnQpO1xuXG5cdFx0Ly8gT25seSB1bnNldCB0YXJnZXRFbGVtZW50IGlmIHRoZSBjbGljayBpcyBub3QgcGVybWl0dGVkLiBUaGlzIHdpbGwgZW5zdXJlIHRoYXQgdGhlIGNoZWNrIGZvciAhdGFyZ2V0RWxlbWVudCBpbiBvbk1vdXNlIGZhaWxzIGFuZCB0aGUgYnJvd3NlcidzIGNsaWNrIGRvZXNuJ3QgZ28gdGhyb3VnaC5cblx0XHRpZiAoIXBlcm1pdHRlZCkge1xuXHRcdFx0dGhpcy50YXJnZXRFbGVtZW50ID0gbnVsbDtcblx0XHR9XG5cblx0XHQvLyBJZiBjbGlja3MgYXJlIHBlcm1pdHRlZCwgcmV0dXJuIHRydWUgZm9yIHRoZSBhY3Rpb24gdG8gZ28gdGhyb3VnaC5cblx0XHRyZXR1cm4gcGVybWl0dGVkO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIFJlbW92ZSBhbGwgRmFzdENsaWNrJ3MgZXZlbnQgbGlzdGVuZXJzLlxuXHQgKlxuXHQgKiBAcmV0dXJucyB7dm9pZH1cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBsYXllciA9IHRoaXMubGF5ZXI7XG5cblx0XHRpZiAoZGV2aWNlSXNBbmRyb2lkKSB7XG5cdFx0XHRsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCB0aGlzLm9uTW91c2UsIHRydWUpO1xuXHRcdFx0bGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5vbk1vdXNlLCB0cnVlKTtcblx0XHRcdGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uTW91c2UsIHRydWUpO1xuXHRcdH1cblxuXHRcdGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vbkNsaWNrLCB0cnVlKTtcblx0XHRsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5vblRvdWNoU3RhcnQsIGZhbHNlKTtcblx0XHRsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLm9uVG91Y2hNb3ZlLCBmYWxzZSk7XG5cdFx0bGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLm9uVG91Y2hFbmQsIGZhbHNlKTtcblx0XHRsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIHRoaXMub25Ub3VjaENhbmNlbCwgZmFsc2UpO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIENoZWNrIHdoZXRoZXIgRmFzdENsaWNrIGlzIG5lZWRlZC5cblx0ICpcblx0ICogQHBhcmFtIHtFbGVtZW50fSBsYXllciBUaGUgbGF5ZXIgdG8gbGlzdGVuIG9uXG5cdCAqL1xuXHRGYXN0Q2xpY2subm90TmVlZGVkID0gZnVuY3Rpb24obGF5ZXIpIHtcblx0XHR2YXIgbWV0YVZpZXdwb3J0O1xuXHRcdHZhciBjaHJvbWVWZXJzaW9uO1xuXHRcdHZhciBibGFja2JlcnJ5VmVyc2lvbjtcblx0XHR2YXIgZmlyZWZveFZlcnNpb247XG5cblx0XHQvLyBEZXZpY2VzIHRoYXQgZG9uJ3Qgc3VwcG9ydCB0b3VjaCBkb24ndCBuZWVkIEZhc3RDbGlja1xuXHRcdGlmICh0eXBlb2Ygd2luZG93Lm9udG91Y2hzdGFydCA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIENocm9tZSB2ZXJzaW9uIC0gemVybyBmb3Igb3RoZXIgYnJvd3NlcnNcblx0XHRjaHJvbWVWZXJzaW9uID0gKygvQ2hyb21lXFwvKFswLTldKykvLmV4ZWMobmF2aWdhdG9yLnVzZXJBZ2VudCkgfHwgWywwXSlbMV07XG5cblx0XHRpZiAoY2hyb21lVmVyc2lvbikge1xuXG5cdFx0XHRpZiAoZGV2aWNlSXNBbmRyb2lkKSB7XG5cdFx0XHRcdG1ldGFWaWV3cG9ydCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ21ldGFbbmFtZT12aWV3cG9ydF0nKTtcblxuXHRcdFx0XHRpZiAobWV0YVZpZXdwb3J0KSB7XG5cdFx0XHRcdFx0Ly8gQ2hyb21lIG9uIEFuZHJvaWQgd2l0aCB1c2VyLXNjYWxhYmxlPVwibm9cIiBkb2Vzbid0IG5lZWQgRmFzdENsaWNrIChpc3N1ZSAjODkpXG5cdFx0XHRcdFx0aWYgKG1ldGFWaWV3cG9ydC5jb250ZW50LmluZGV4T2YoJ3VzZXItc2NhbGFibGU9bm8nKSAhPT0gLTEpIHtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBDaHJvbWUgMzIgYW5kIGFib3ZlIHdpdGggd2lkdGg9ZGV2aWNlLXdpZHRoIG9yIGxlc3MgZG9uJ3QgbmVlZCBGYXN0Q2xpY2tcblx0XHRcdFx0XHRpZiAoY2hyb21lVmVyc2lvbiA+IDMxICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxXaWR0aCA8PSB3aW5kb3cub3V0ZXJXaWR0aCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdC8vIENocm9tZSBkZXNrdG9wIGRvZXNuJ3QgbmVlZCBGYXN0Q2xpY2sgKGlzc3VlICMxNSlcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChkZXZpY2VJc0JsYWNrQmVycnkxMCkge1xuXHRcdFx0YmxhY2tiZXJyeVZlcnNpb24gPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9WZXJzaW9uXFwvKFswLTldKilcXC4oWzAtOV0qKS8pO1xuXG5cdFx0XHQvLyBCbGFja0JlcnJ5IDEwLjMrIGRvZXMgbm90IHJlcXVpcmUgRmFzdGNsaWNrIGxpYnJhcnkuXG5cdFx0XHQvLyBodHRwczovL2dpdGh1Yi5jb20vZnRsYWJzL2Zhc3RjbGljay9pc3N1ZXMvMjUxXG5cdFx0XHRpZiAoYmxhY2tiZXJyeVZlcnNpb25bMV0gPj0gMTAgJiYgYmxhY2tiZXJyeVZlcnNpb25bMl0gPj0gMykge1xuXHRcdFx0XHRtZXRhVmlld3BvcnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdtZXRhW25hbWU9dmlld3BvcnRdJyk7XG5cblx0XHRcdFx0aWYgKG1ldGFWaWV3cG9ydCkge1xuXHRcdFx0XHRcdC8vIHVzZXItc2NhbGFibGU9bm8gZWxpbWluYXRlcyBjbGljayBkZWxheS5cblx0XHRcdFx0XHRpZiAobWV0YVZpZXdwb3J0LmNvbnRlbnQuaW5kZXhPZigndXNlci1zY2FsYWJsZT1ubycpICE9PSAtMSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIHdpZHRoPWRldmljZS13aWR0aCAob3IgbGVzcyB0aGFuIGRldmljZS13aWR0aCkgZWxpbWluYXRlcyBjbGljayBkZWxheS5cblx0XHRcdFx0XHRpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFdpZHRoIDw9IHdpbmRvdy5vdXRlcldpZHRoKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBJRTEwIHdpdGggLW1zLXRvdWNoLWFjdGlvbjogbm9uZSBvciBtYW5pcHVsYXRpb24sIHdoaWNoIGRpc2FibGVzIGRvdWJsZS10YXAtdG8tem9vbSAoaXNzdWUgIzk3KVxuXHRcdGlmIChsYXllci5zdHlsZS5tc1RvdWNoQWN0aW9uID09PSAnbm9uZScgfHwgbGF5ZXIuc3R5bGUudG91Y2hBY3Rpb24gPT09ICdtYW5pcHVsYXRpb24nKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyBGaXJlZm94IHZlcnNpb24gLSB6ZXJvIGZvciBvdGhlciBicm93c2Vyc1xuXHRcdGZpcmVmb3hWZXJzaW9uID0gKygvRmlyZWZveFxcLyhbMC05XSspLy5leGVjKG5hdmlnYXRvci51c2VyQWdlbnQpIHx8IFssMF0pWzFdO1xuXG5cdFx0aWYgKGZpcmVmb3hWZXJzaW9uID49IDI3KSB7XG5cdFx0XHQvLyBGaXJlZm94IDI3KyBkb2VzIG5vdCBoYXZlIHRhcCBkZWxheSBpZiB0aGUgY29udGVudCBpcyBub3Qgem9vbWFibGUgLSBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD05MjI4OTZcblxuXHRcdFx0bWV0YVZpZXdwb3J0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbWV0YVtuYW1lPXZpZXdwb3J0XScpO1xuXHRcdFx0aWYgKG1ldGFWaWV3cG9ydCAmJiAobWV0YVZpZXdwb3J0LmNvbnRlbnQuaW5kZXhPZigndXNlci1zY2FsYWJsZT1ubycpICE9PSAtMSB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsV2lkdGggPD0gd2luZG93Lm91dGVyV2lkdGgpKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIElFMTE6IHByZWZpeGVkIC1tcy10b3VjaC1hY3Rpb24gaXMgbm8gbG9uZ2VyIHN1cHBvcnRlZCBhbmQgaXQncyByZWNvbWVuZGVkIHRvIHVzZSBub24tcHJlZml4ZWQgdmVyc2lvblxuXHRcdC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS93aW5kb3dzL2FwcHMvSGg3NjczMTMuYXNweFxuXHRcdGlmIChsYXllci5zdHlsZS50b3VjaEFjdGlvbiA9PT0gJ25vbmUnIHx8IGxheWVyLnN0eWxlLnRvdWNoQWN0aW9uID09PSAnbWFuaXB1bGF0aW9uJykge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIEZhY3RvcnkgbWV0aG9kIGZvciBjcmVhdGluZyBhIEZhc3RDbGljayBvYmplY3Rcblx0ICpcblx0ICogQHBhcmFtIHtFbGVtZW50fSBsYXllciBUaGUgbGF5ZXIgdG8gbGlzdGVuIG9uXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gVGhlIG9wdGlvbnMgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHRzXG5cdCAqL1xuXHRGYXN0Q2xpY2suYXR0YWNoID0gZnVuY3Rpb24obGF5ZXIsIG9wdGlvbnMpIHtcblx0XHRyZXR1cm4gbmV3IEZhc3RDbGljayhsYXllciwgb3B0aW9ucyk7XG5cdH07XG5cblxuXHRpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PT0gJ29iamVjdCcgJiYgZGVmaW5lLmFtZCkge1xuXG5cdFx0Ly8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuXHRcdGRlZmluZShmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBGYXN0Q2xpY2s7XG5cdFx0fSk7XG5cdH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0XHRtb2R1bGUuZXhwb3J0cyA9IEZhc3RDbGljay5hdHRhY2g7XG5cdFx0bW9kdWxlLmV4cG9ydHMuRmFzdENsaWNrID0gRmFzdENsaWNrO1xuXHR9IGVsc2Uge1xuXHRcdHdpbmRvdy5GYXN0Q2xpY2sgPSBGYXN0Q2xpY2s7XG5cdH1cbn0oKSk7XG4iLCJ2YXIgVk5vZGUgPSByZXF1aXJlKCcuL3Zub2RlJyk7XG52YXIgaXMgPSByZXF1aXJlKCcuL2lzJyk7XG5cbmZ1bmN0aW9uIGFkZE5TKGRhdGEsIGNoaWxkcmVuLCBzZWwpIHtcbiAgZGF0YS5ucyA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc7XG5cbiAgaWYgKHNlbCAhPT0gJ2ZvcmVpZ25PYmplY3QnICYmIGNoaWxkcmVuICE9PSB1bmRlZmluZWQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICBhZGROUyhjaGlsZHJlbltpXS5kYXRhLCBjaGlsZHJlbltpXS5jaGlsZHJlbiwgY2hpbGRyZW5baV0uc2VsKTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBoKHNlbCwgYiwgYykge1xuICB2YXIgZGF0YSA9IHt9LCBjaGlsZHJlbiwgdGV4dCwgaTtcbiAgaWYgKGMgIT09IHVuZGVmaW5lZCkge1xuICAgIGRhdGEgPSBiO1xuICAgIGlmIChpcy5hcnJheShjKSkgeyBjaGlsZHJlbiA9IGM7IH1cbiAgICBlbHNlIGlmIChpcy5wcmltaXRpdmUoYykpIHsgdGV4dCA9IGM7IH1cbiAgfSBlbHNlIGlmIChiICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAoaXMuYXJyYXkoYikpIHsgY2hpbGRyZW4gPSBiOyB9XG4gICAgZWxzZSBpZiAoaXMucHJpbWl0aXZlKGIpKSB7IHRleHQgPSBiOyB9XG4gICAgZWxzZSB7IGRhdGEgPSBiOyB9XG4gIH1cbiAgaWYgKGlzLmFycmF5KGNoaWxkcmVuKSkge1xuICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgaWYgKGlzLnByaW1pdGl2ZShjaGlsZHJlbltpXSkpIGNoaWxkcmVuW2ldID0gVk5vZGUodW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgY2hpbGRyZW5baV0pO1xuICAgIH1cbiAgfVxuICBpZiAoc2VsWzBdID09PSAncycgJiYgc2VsWzFdID09PSAndicgJiYgc2VsWzJdID09PSAnZycpIHtcbiAgICBhZGROUyhkYXRhLCBjaGlsZHJlbiwgc2VsKTtcbiAgfVxuICByZXR1cm4gVk5vZGUoc2VsLCBkYXRhLCBjaGlsZHJlbiwgdGV4dCwgdW5kZWZpbmVkKTtcbn07XG4iLCJmdW5jdGlvbiBjcmVhdGVFbGVtZW50KHRhZ05hbWUpe1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSwgcXVhbGlmaWVkTmFtZSl7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlVVJJLCBxdWFsaWZpZWROYW1lKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlVGV4dE5vZGUodGV4dCl7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0KTtcbn1cblxuXG5mdW5jdGlvbiBpbnNlcnRCZWZvcmUocGFyZW50Tm9kZSwgbmV3Tm9kZSwgcmVmZXJlbmNlTm9kZSl7XG4gIHBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5ld05vZGUsIHJlZmVyZW5jZU5vZGUpO1xufVxuXG5cbmZ1bmN0aW9uIHJlbW92ZUNoaWxkKG5vZGUsIGNoaWxkKXtcbiAgbm9kZS5yZW1vdmVDaGlsZChjaGlsZCk7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZENoaWxkKG5vZGUsIGNoaWxkKXtcbiAgbm9kZS5hcHBlbmRDaGlsZChjaGlsZCk7XG59XG5cbmZ1bmN0aW9uIHBhcmVudE5vZGUobm9kZSl7XG4gIHJldHVybiBub2RlLnBhcmVudEVsZW1lbnQ7XG59XG5cbmZ1bmN0aW9uIG5leHRTaWJsaW5nKG5vZGUpe1xuICByZXR1cm4gbm9kZS5uZXh0U2libGluZztcbn1cblxuZnVuY3Rpb24gdGFnTmFtZShub2RlKXtcbiAgcmV0dXJuIG5vZGUudGFnTmFtZTtcbn1cblxuZnVuY3Rpb24gc2V0VGV4dENvbnRlbnQobm9kZSwgdGV4dCl7XG4gIG5vZGUudGV4dENvbnRlbnQgPSB0ZXh0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlRWxlbWVudDogY3JlYXRlRWxlbWVudCxcbiAgY3JlYXRlRWxlbWVudE5TOiBjcmVhdGVFbGVtZW50TlMsXG4gIGNyZWF0ZVRleHROb2RlOiBjcmVhdGVUZXh0Tm9kZSxcbiAgYXBwZW5kQ2hpbGQ6IGFwcGVuZENoaWxkLFxuICByZW1vdmVDaGlsZDogcmVtb3ZlQ2hpbGQsXG4gIGluc2VydEJlZm9yZTogaW5zZXJ0QmVmb3JlLFxuICBwYXJlbnROb2RlOiBwYXJlbnROb2RlLFxuICBuZXh0U2libGluZzogbmV4dFNpYmxpbmcsXG4gIHRhZ05hbWU6IHRhZ05hbWUsXG4gIHNldFRleHRDb250ZW50OiBzZXRUZXh0Q29udGVudFxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBhcnJheTogQXJyYXkuaXNBcnJheSxcbiAgcHJpbWl0aXZlOiBmdW5jdGlvbihzKSB7IHJldHVybiB0eXBlb2YgcyA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHMgPT09ICdudW1iZXInOyB9LFxufTtcbiIsInZhciBOYW1lc3BhY2VVUklzID0ge1xuICBcInhsaW5rXCI6IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiXG59O1xuXG52YXIgYm9vbGVhbkF0dHJzID0gW1wiYWxsb3dmdWxsc2NyZWVuXCIsIFwiYXN5bmNcIiwgXCJhdXRvZm9jdXNcIiwgXCJhdXRvcGxheVwiLCBcImNoZWNrZWRcIiwgXCJjb21wYWN0XCIsIFwiY29udHJvbHNcIiwgXCJkZWNsYXJlXCIsXG4gICAgICAgICAgICAgICAgXCJkZWZhdWx0XCIsIFwiZGVmYXVsdGNoZWNrZWRcIiwgXCJkZWZhdWx0bXV0ZWRcIiwgXCJkZWZhdWx0c2VsZWN0ZWRcIiwgXCJkZWZlclwiLCBcImRpc2FibGVkXCIsIFwiZHJhZ2dhYmxlXCIsXG4gICAgICAgICAgICAgICAgXCJlbmFibGVkXCIsIFwiZm9ybW5vdmFsaWRhdGVcIiwgXCJoaWRkZW5cIiwgXCJpbmRldGVybWluYXRlXCIsIFwiaW5lcnRcIiwgXCJpc21hcFwiLCBcIml0ZW1zY29wZVwiLCBcImxvb3BcIiwgXCJtdWx0aXBsZVwiLFxuICAgICAgICAgICAgICAgIFwibXV0ZWRcIiwgXCJub2hyZWZcIiwgXCJub3Jlc2l6ZVwiLCBcIm5vc2hhZGVcIiwgXCJub3ZhbGlkYXRlXCIsIFwibm93cmFwXCIsIFwib3BlblwiLCBcInBhdXNlb25leGl0XCIsIFwicmVhZG9ubHlcIixcbiAgICAgICAgICAgICAgICBcInJlcXVpcmVkXCIsIFwicmV2ZXJzZWRcIiwgXCJzY29wZWRcIiwgXCJzZWFtbGVzc1wiLCBcInNlbGVjdGVkXCIsIFwic29ydGFibGVcIiwgXCJzcGVsbGNoZWNrXCIsIFwidHJhbnNsYXRlXCIsXG4gICAgICAgICAgICAgICAgXCJ0cnVlc3BlZWRcIiwgXCJ0eXBlbXVzdG1hdGNoXCIsIFwidmlzaWJsZVwiXTtcblxudmFyIGJvb2xlYW5BdHRyc0RpY3QgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuZm9yKHZhciBpPTAsIGxlbiA9IGJvb2xlYW5BdHRycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICBib29sZWFuQXR0cnNEaWN0W2Jvb2xlYW5BdHRyc1tpXV0gPSB0cnVlO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVBdHRycyhvbGRWbm9kZSwgdm5vZGUpIHtcbiAgdmFyIGtleSwgY3VyLCBvbGQsIGVsbSA9IHZub2RlLmVsbSxcbiAgICAgIG9sZEF0dHJzID0gb2xkVm5vZGUuZGF0YS5hdHRycywgYXR0cnMgPSB2bm9kZS5kYXRhLmF0dHJzLCBuYW1lc3BhY2VTcGxpdDtcblxuICBpZiAoIW9sZEF0dHJzICYmICFhdHRycykgcmV0dXJuO1xuICBvbGRBdHRycyA9IG9sZEF0dHJzIHx8IHt9O1xuICBhdHRycyA9IGF0dHJzIHx8IHt9O1xuXG4gIC8vIHVwZGF0ZSBtb2RpZmllZCBhdHRyaWJ1dGVzLCBhZGQgbmV3IGF0dHJpYnV0ZXNcbiAgZm9yIChrZXkgaW4gYXR0cnMpIHtcbiAgICBjdXIgPSBhdHRyc1trZXldO1xuICAgIG9sZCA9IG9sZEF0dHJzW2tleV07XG4gICAgaWYgKG9sZCAhPT0gY3VyKSB7XG4gICAgICBpZighY3VyICYmIGJvb2xlYW5BdHRyc0RpY3Rba2V5XSlcbiAgICAgICAgZWxtLnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICAgICAgZWxzZSB7XG4gICAgICAgIG5hbWVzcGFjZVNwbGl0ID0ga2V5LnNwbGl0KFwiOlwiKTtcbiAgICAgICAgaWYobmFtZXNwYWNlU3BsaXQubGVuZ3RoID4gMSAmJiBOYW1lc3BhY2VVUklzLmhhc093blByb3BlcnR5KG5hbWVzcGFjZVNwbGl0WzBdKSlcbiAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlTlMoTmFtZXNwYWNlVVJJc1tuYW1lc3BhY2VTcGxpdFswXV0sIGtleSwgY3VyKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGVsbS5zZXRBdHRyaWJ1dGUoa2V5LCBjdXIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvL3JlbW92ZSByZW1vdmVkIGF0dHJpYnV0ZXNcbiAgLy8gdXNlIGBpbmAgb3BlcmF0b3Igc2luY2UgdGhlIHByZXZpb3VzIGBmb3JgIGl0ZXJhdGlvbiB1c2VzIGl0ICguaS5lLiBhZGQgZXZlbiBhdHRyaWJ1dGVzIHdpdGggdW5kZWZpbmVkIHZhbHVlKVxuICAvLyB0aGUgb3RoZXIgb3B0aW9uIGlzIHRvIHJlbW92ZSBhbGwgYXR0cmlidXRlcyB3aXRoIHZhbHVlID09IHVuZGVmaW5lZFxuICBmb3IgKGtleSBpbiBvbGRBdHRycykge1xuICAgIGlmICghKGtleSBpbiBhdHRycykpIHtcbiAgICAgIGVsbS5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7Y3JlYXRlOiB1cGRhdGVBdHRycywgdXBkYXRlOiB1cGRhdGVBdHRyc307XG4iLCJmdW5jdGlvbiB1cGRhdGVDbGFzcyhvbGRWbm9kZSwgdm5vZGUpIHtcbiAgdmFyIGN1ciwgbmFtZSwgZWxtID0gdm5vZGUuZWxtLFxuICAgICAgb2xkQ2xhc3MgPSBvbGRWbm9kZS5kYXRhLmNsYXNzLFxuICAgICAga2xhc3MgPSB2bm9kZS5kYXRhLmNsYXNzO1xuXG4gIGlmICghb2xkQ2xhc3MgJiYgIWtsYXNzKSByZXR1cm47XG4gIG9sZENsYXNzID0gb2xkQ2xhc3MgfHwge307XG4gIGtsYXNzID0ga2xhc3MgfHwge307XG5cbiAgZm9yIChuYW1lIGluIG9sZENsYXNzKSB7XG4gICAgaWYgKCFrbGFzc1tuYW1lXSkge1xuICAgICAgZWxtLmNsYXNzTGlzdC5yZW1vdmUobmFtZSk7XG4gICAgfVxuICB9XG4gIGZvciAobmFtZSBpbiBrbGFzcykge1xuICAgIGN1ciA9IGtsYXNzW25hbWVdO1xuICAgIGlmIChjdXIgIT09IG9sZENsYXNzW25hbWVdKSB7XG4gICAgICBlbG0uY2xhc3NMaXN0W2N1ciA/ICdhZGQnIDogJ3JlbW92ZSddKG5hbWUpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtjcmVhdGU6IHVwZGF0ZUNsYXNzLCB1cGRhdGU6IHVwZGF0ZUNsYXNzfTtcbiIsImZ1bmN0aW9uIGludm9rZUhhbmRsZXIoaGFuZGxlciwgdm5vZGUsIGV2ZW50KSB7XG4gIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgLy8gY2FsbCBmdW5jdGlvbiBoYW5kbGVyXG4gICAgaGFuZGxlci5jYWxsKHZub2RlLCBldmVudCwgdm5vZGUpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiKSB7XG4gICAgLy8gY2FsbCBoYW5kbGVyIHdpdGggYXJndW1lbnRzXG4gICAgaWYgKHR5cGVvZiBoYW5kbGVyWzBdID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIC8vIHNwZWNpYWwgY2FzZSBmb3Igc2luZ2xlIGFyZ3VtZW50IGZvciBwZXJmb3JtYW5jZVxuICAgICAgaWYgKGhhbmRsZXIubGVuZ3RoID09PSAyKSB7XG4gICAgICAgIGhhbmRsZXJbMF0uY2FsbCh2bm9kZSwgaGFuZGxlclsxXSwgZXZlbnQsIHZub2RlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBhcmdzID0gaGFuZGxlci5zbGljZSgxKTtcbiAgICAgICAgYXJncy5wdXNoKGV2ZW50KTtcbiAgICAgICAgYXJncy5wdXNoKHZub2RlKTtcbiAgICAgICAgaGFuZGxlclswXS5hcHBseSh2bm9kZSwgYXJncyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGNhbGwgbXVsdGlwbGUgaGFuZGxlcnNcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGFuZGxlci5sZW5ndGg7IGkrKykge1xuICAgICAgICBpbnZva2VIYW5kbGVyKGhhbmRsZXJbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBoYW5kbGVFdmVudChldmVudCwgdm5vZGUpIHtcbiAgdmFyIG5hbWUgPSBldmVudC50eXBlLFxuICAgICAgb24gPSB2bm9kZS5kYXRhLm9uO1xuXG4gIC8vIGNhbGwgZXZlbnQgaGFuZGxlcihzKSBpZiBleGlzdHNcbiAgaWYgKG9uICYmIG9uW25hbWVdKSB7XG4gICAgaW52b2tlSGFuZGxlcihvbltuYW1lXSwgdm5vZGUsIGV2ZW50KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVMaXN0ZW5lcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGhhbmRsZXIoZXZlbnQpIHtcbiAgICBoYW5kbGVFdmVudChldmVudCwgaGFuZGxlci52bm9kZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlRXZlbnRMaXN0ZW5lcnMob2xkVm5vZGUsIHZub2RlKSB7XG4gIHZhciBvbGRPbiA9IG9sZFZub2RlLmRhdGEub24sXG4gICAgICBvbGRMaXN0ZW5lciA9IG9sZFZub2RlLmxpc3RlbmVyLFxuICAgICAgb2xkRWxtID0gb2xkVm5vZGUuZWxtLFxuICAgICAgb24gPSB2bm9kZSAmJiB2bm9kZS5kYXRhLm9uLFxuICAgICAgZWxtID0gdm5vZGUgJiYgdm5vZGUuZWxtLFxuICAgICAgbmFtZTtcblxuICAvLyBvcHRpbWl6YXRpb24gZm9yIHJldXNlZCBpbW11dGFibGUgaGFuZGxlcnNcbiAgaWYgKG9sZE9uID09PSBvbikge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIHJlbW92ZSBleGlzdGluZyBsaXN0ZW5lcnMgd2hpY2ggbm8gbG9uZ2VyIHVzZWRcbiAgaWYgKG9sZE9uICYmIG9sZExpc3RlbmVyKSB7XG4gICAgLy8gaWYgZWxlbWVudCBjaGFuZ2VkIG9yIGRlbGV0ZWQgd2UgcmVtb3ZlIGFsbCBleGlzdGluZyBsaXN0ZW5lcnMgdW5jb25kaXRpb25hbGx5XG4gICAgaWYgKCFvbikge1xuICAgICAgZm9yIChuYW1lIGluIG9sZE9uKSB7XG4gICAgICAgIC8vIHJlbW92ZSBsaXN0ZW5lciBpZiBlbGVtZW50IHdhcyBjaGFuZ2VkIG9yIGV4aXN0aW5nIGxpc3RlbmVycyByZW1vdmVkXG4gICAgICAgIG9sZEVsbS5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIG9sZExpc3RlbmVyLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAobmFtZSBpbiBvbGRPbikge1xuICAgICAgICAvLyByZW1vdmUgbGlzdGVuZXIgaWYgZXhpc3RpbmcgbGlzdGVuZXIgcmVtb3ZlZFxuICAgICAgICBpZiAoIW9uW25hbWVdKSB7XG4gICAgICAgICAgb2xkRWxtLnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgb2xkTGlzdGVuZXIsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIGFkZCBuZXcgbGlzdGVuZXJzIHdoaWNoIGhhcyBub3QgYWxyZWFkeSBhdHRhY2hlZFxuICBpZiAob24pIHtcbiAgICAvLyByZXVzZSBleGlzdGluZyBsaXN0ZW5lciBvciBjcmVhdGUgbmV3XG4gICAgdmFyIGxpc3RlbmVyID0gdm5vZGUubGlzdGVuZXIgPSBvbGRWbm9kZS5saXN0ZW5lciB8fCBjcmVhdGVMaXN0ZW5lcigpO1xuICAgIC8vIHVwZGF0ZSB2bm9kZSBmb3IgbGlzdGVuZXJcbiAgICBsaXN0ZW5lci52bm9kZSA9IHZub2RlO1xuXG4gICAgLy8gaWYgZWxlbWVudCBjaGFuZ2VkIG9yIGFkZGVkIHdlIGFkZCBhbGwgbmVlZGVkIGxpc3RlbmVycyB1bmNvbmRpdGlvbmFsbHlcbiAgICBpZiAoIW9sZE9uKSB7XG4gICAgICBmb3IgKG5hbWUgaW4gb24pIHtcbiAgICAgICAgLy8gYWRkIGxpc3RlbmVyIGlmIGVsZW1lbnQgd2FzIGNoYW5nZWQgb3IgbmV3IGxpc3RlbmVycyBhZGRlZFxuICAgICAgICBlbG0uYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBsaXN0ZW5lciwgZmFsc2UpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKG5hbWUgaW4gb24pIHtcbiAgICAgICAgLy8gYWRkIGxpc3RlbmVyIGlmIG5ldyBsaXN0ZW5lciBhZGRlZFxuICAgICAgICBpZiAoIW9sZE9uW25hbWVdKSB7XG4gICAgICAgICAgZWxtLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgbGlzdGVuZXIsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiB1cGRhdGVFdmVudExpc3RlbmVycyxcbiAgdXBkYXRlOiB1cGRhdGVFdmVudExpc3RlbmVycyxcbiAgZGVzdHJveTogdXBkYXRlRXZlbnRMaXN0ZW5lcnNcbn07XG4iLCJmdW5jdGlvbiB1cGRhdGVQcm9wcyhvbGRWbm9kZSwgdm5vZGUpIHtcbiAgdmFyIGtleSwgY3VyLCBvbGQsIGVsbSA9IHZub2RlLmVsbSxcbiAgICAgIG9sZFByb3BzID0gb2xkVm5vZGUuZGF0YS5wcm9wcywgcHJvcHMgPSB2bm9kZS5kYXRhLnByb3BzO1xuXG4gIGlmICghb2xkUHJvcHMgJiYgIXByb3BzKSByZXR1cm47XG4gIG9sZFByb3BzID0gb2xkUHJvcHMgfHwge307XG4gIHByb3BzID0gcHJvcHMgfHwge307XG5cbiAgZm9yIChrZXkgaW4gb2xkUHJvcHMpIHtcbiAgICBpZiAoIXByb3BzW2tleV0pIHtcbiAgICAgIGRlbGV0ZSBlbG1ba2V5XTtcbiAgICB9XG4gIH1cbiAgZm9yIChrZXkgaW4gcHJvcHMpIHtcbiAgICBjdXIgPSBwcm9wc1trZXldO1xuICAgIG9sZCA9IG9sZFByb3BzW2tleV07XG4gICAgaWYgKG9sZCAhPT0gY3VyICYmIChrZXkgIT09ICd2YWx1ZScgfHwgZWxtW2tleV0gIT09IGN1cikpIHtcbiAgICAgIGVsbVtrZXldID0gY3VyO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtjcmVhdGU6IHVwZGF0ZVByb3BzLCB1cGRhdGU6IHVwZGF0ZVByb3BzfTtcbiIsInZhciByYWYgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkgfHwgc2V0VGltZW91dDtcbnZhciBuZXh0RnJhbWUgPSBmdW5jdGlvbihmbikgeyByYWYoZnVuY3Rpb24oKSB7IHJhZihmbik7IH0pOyB9O1xuXG5mdW5jdGlvbiBzZXROZXh0RnJhbWUob2JqLCBwcm9wLCB2YWwpIHtcbiAgbmV4dEZyYW1lKGZ1bmN0aW9uKCkgeyBvYmpbcHJvcF0gPSB2YWw7IH0pO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVTdHlsZShvbGRWbm9kZSwgdm5vZGUpIHtcbiAgdmFyIGN1ciwgbmFtZSwgZWxtID0gdm5vZGUuZWxtLFxuICAgICAgb2xkU3R5bGUgPSBvbGRWbm9kZS5kYXRhLnN0eWxlLFxuICAgICAgc3R5bGUgPSB2bm9kZS5kYXRhLnN0eWxlO1xuXG4gIGlmICghb2xkU3R5bGUgJiYgIXN0eWxlKSByZXR1cm47XG4gIG9sZFN0eWxlID0gb2xkU3R5bGUgfHwge307XG4gIHN0eWxlID0gc3R5bGUgfHwge307XG4gIHZhciBvbGRIYXNEZWwgPSAnZGVsYXllZCcgaW4gb2xkU3R5bGU7XG5cbiAgZm9yIChuYW1lIGluIG9sZFN0eWxlKSB7XG4gICAgaWYgKCFzdHlsZVtuYW1lXSkge1xuICAgICAgZWxtLnN0eWxlW25hbWVdID0gJyc7XG4gICAgfVxuICB9XG4gIGZvciAobmFtZSBpbiBzdHlsZSkge1xuICAgIGN1ciA9IHN0eWxlW25hbWVdO1xuICAgIGlmIChuYW1lID09PSAnZGVsYXllZCcpIHtcbiAgICAgIGZvciAobmFtZSBpbiBzdHlsZS5kZWxheWVkKSB7XG4gICAgICAgIGN1ciA9IHN0eWxlLmRlbGF5ZWRbbmFtZV07XG4gICAgICAgIGlmICghb2xkSGFzRGVsIHx8IGN1ciAhPT0gb2xkU3R5bGUuZGVsYXllZFtuYW1lXSkge1xuICAgICAgICAgIHNldE5leHRGcmFtZShlbG0uc3R5bGUsIG5hbWUsIGN1cik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG5hbWUgIT09ICdyZW1vdmUnICYmIGN1ciAhPT0gb2xkU3R5bGVbbmFtZV0pIHtcbiAgICAgIGVsbS5zdHlsZVtuYW1lXSA9IGN1cjtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYXBwbHlEZXN0cm95U3R5bGUodm5vZGUpIHtcbiAgdmFyIHN0eWxlLCBuYW1lLCBlbG0gPSB2bm9kZS5lbG0sIHMgPSB2bm9kZS5kYXRhLnN0eWxlO1xuICBpZiAoIXMgfHwgIShzdHlsZSA9IHMuZGVzdHJveSkpIHJldHVybjtcbiAgZm9yIChuYW1lIGluIHN0eWxlKSB7XG4gICAgZWxtLnN0eWxlW25hbWVdID0gc3R5bGVbbmFtZV07XG4gIH1cbn1cblxuZnVuY3Rpb24gYXBwbHlSZW1vdmVTdHlsZSh2bm9kZSwgcm0pIHtcbiAgdmFyIHMgPSB2bm9kZS5kYXRhLnN0eWxlO1xuICBpZiAoIXMgfHwgIXMucmVtb3ZlKSB7XG4gICAgcm0oKTtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG5hbWUsIGVsbSA9IHZub2RlLmVsbSwgaWR4LCBpID0gMCwgbWF4RHVyID0gMCxcbiAgICAgIGNvbXBTdHlsZSwgc3R5bGUgPSBzLnJlbW92ZSwgYW1vdW50ID0gMCwgYXBwbGllZCA9IFtdO1xuICBmb3IgKG5hbWUgaW4gc3R5bGUpIHtcbiAgICBhcHBsaWVkLnB1c2gobmFtZSk7XG4gICAgZWxtLnN0eWxlW25hbWVdID0gc3R5bGVbbmFtZV07XG4gIH1cbiAgY29tcFN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbG0pO1xuICB2YXIgcHJvcHMgPSBjb21wU3R5bGVbJ3RyYW5zaXRpb24tcHJvcGVydHknXS5zcGxpdCgnLCAnKTtcbiAgZm9yICg7IGkgPCBwcm9wcy5sZW5ndGg7ICsraSkge1xuICAgIGlmKGFwcGxpZWQuaW5kZXhPZihwcm9wc1tpXSkgIT09IC0xKSBhbW91bnQrKztcbiAgfVxuICBlbG0uYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIGZ1bmN0aW9uKGV2KSB7XG4gICAgaWYgKGV2LnRhcmdldCA9PT0gZWxtKSAtLWFtb3VudDtcbiAgICBpZiAoYW1vdW50ID09PSAwKSBybSgpO1xuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7Y3JlYXRlOiB1cGRhdGVTdHlsZSwgdXBkYXRlOiB1cGRhdGVTdHlsZSwgZGVzdHJveTogYXBwbHlEZXN0cm95U3R5bGUsIHJlbW92ZTogYXBwbHlSZW1vdmVTdHlsZX07XG4iLCIvLyBqc2hpbnQgbmV3Y2FwOiBmYWxzZVxuLyogZ2xvYmFsIHJlcXVpcmUsIG1vZHVsZSwgZG9jdW1lbnQsIE5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFZOb2RlID0gcmVxdWlyZSgnLi92bm9kZScpO1xudmFyIGlzID0gcmVxdWlyZSgnLi9pcycpO1xudmFyIGRvbUFwaSA9IHJlcXVpcmUoJy4vaHRtbGRvbWFwaScpO1xuXG5mdW5jdGlvbiBpc1VuZGVmKHMpIHsgcmV0dXJuIHMgPT09IHVuZGVmaW5lZDsgfVxuZnVuY3Rpb24gaXNEZWYocykgeyByZXR1cm4gcyAhPT0gdW5kZWZpbmVkOyB9XG5cbnZhciBlbXB0eU5vZGUgPSBWTm9kZSgnJywge30sIFtdLCB1bmRlZmluZWQsIHVuZGVmaW5lZCk7XG5cbmZ1bmN0aW9uIHNhbWVWbm9kZSh2bm9kZTEsIHZub2RlMikge1xuICByZXR1cm4gdm5vZGUxLmtleSA9PT0gdm5vZGUyLmtleSAmJiB2bm9kZTEuc2VsID09PSB2bm9kZTIuc2VsO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVLZXlUb09sZElkeChjaGlsZHJlbiwgYmVnaW5JZHgsIGVuZElkeCkge1xuICB2YXIgaSwgbWFwID0ge30sIGtleTtcbiAgZm9yIChpID0gYmVnaW5JZHg7IGkgPD0gZW5kSWR4OyArK2kpIHtcbiAgICBrZXkgPSBjaGlsZHJlbltpXS5rZXk7XG4gICAgaWYgKGlzRGVmKGtleSkpIG1hcFtrZXldID0gaTtcbiAgfVxuICByZXR1cm4gbWFwO1xufVxuXG52YXIgaG9va3MgPSBbJ2NyZWF0ZScsICd1cGRhdGUnLCAncmVtb3ZlJywgJ2Rlc3Ryb3knLCAncHJlJywgJ3Bvc3QnXTtcblxuZnVuY3Rpb24gaW5pdChtb2R1bGVzLCBhcGkpIHtcbiAgdmFyIGksIGosIGNicyA9IHt9O1xuXG4gIGlmIChpc1VuZGVmKGFwaSkpIGFwaSA9IGRvbUFwaTtcblxuICBmb3IgKGkgPSAwOyBpIDwgaG9va3MubGVuZ3RoOyArK2kpIHtcbiAgICBjYnNbaG9va3NbaV1dID0gW107XG4gICAgZm9yIChqID0gMDsgaiA8IG1vZHVsZXMubGVuZ3RoOyArK2opIHtcbiAgICAgIGlmIChtb2R1bGVzW2pdW2hvb2tzW2ldXSAhPT0gdW5kZWZpbmVkKSBjYnNbaG9va3NbaV1dLnB1c2gobW9kdWxlc1tqXVtob29rc1tpXV0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGVtcHR5Tm9kZUF0KGVsbSkge1xuICAgIHZhciBpZCA9IGVsbS5pZCA/ICcjJyArIGVsbS5pZCA6ICcnO1xuICAgIHZhciBjID0gZWxtLmNsYXNzTmFtZSA/ICcuJyArIGVsbS5jbGFzc05hbWUuc3BsaXQoJyAnKS5qb2luKCcuJykgOiAnJztcbiAgICByZXR1cm4gVk5vZGUoYXBpLnRhZ05hbWUoZWxtKS50b0xvd2VyQ2FzZSgpICsgaWQgKyBjLCB7fSwgW10sIHVuZGVmaW5lZCwgZWxtKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVJtQ2IoY2hpbGRFbG0sIGxpc3RlbmVycykge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgtLWxpc3RlbmVycyA9PT0gMCkge1xuICAgICAgICB2YXIgcGFyZW50ID0gYXBpLnBhcmVudE5vZGUoY2hpbGRFbG0pO1xuICAgICAgICBhcGkucmVtb3ZlQ2hpbGQocGFyZW50LCBjaGlsZEVsbSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUVsbSh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgdmFyIGksIGRhdGEgPSB2bm9kZS5kYXRhO1xuICAgIGlmIChpc0RlZihkYXRhKSkge1xuICAgICAgaWYgKGlzRGVmKGkgPSBkYXRhLmhvb2spICYmIGlzRGVmKGkgPSBpLmluaXQpKSB7XG4gICAgICAgIGkodm5vZGUpO1xuICAgICAgICBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIGVsbSwgY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbiwgc2VsID0gdm5vZGUuc2VsO1xuICAgIGlmIChpc0RlZihzZWwpKSB7XG4gICAgICAvLyBQYXJzZSBzZWxlY3RvclxuICAgICAgdmFyIGhhc2hJZHggPSBzZWwuaW5kZXhPZignIycpO1xuICAgICAgdmFyIGRvdElkeCA9IHNlbC5pbmRleE9mKCcuJywgaGFzaElkeCk7XG4gICAgICB2YXIgaGFzaCA9IGhhc2hJZHggPiAwID8gaGFzaElkeCA6IHNlbC5sZW5ndGg7XG4gICAgICB2YXIgZG90ID0gZG90SWR4ID4gMCA/IGRvdElkeCA6IHNlbC5sZW5ndGg7XG4gICAgICB2YXIgdGFnID0gaGFzaElkeCAhPT0gLTEgfHwgZG90SWR4ICE9PSAtMSA/IHNlbC5zbGljZSgwLCBNYXRoLm1pbihoYXNoLCBkb3QpKSA6IHNlbDtcbiAgICAgIGVsbSA9IHZub2RlLmVsbSA9IGlzRGVmKGRhdGEpICYmIGlzRGVmKGkgPSBkYXRhLm5zKSA/IGFwaS5jcmVhdGVFbGVtZW50TlMoaSwgdGFnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogYXBpLmNyZWF0ZUVsZW1lbnQodGFnKTtcbiAgICAgIGlmIChoYXNoIDwgZG90KSBlbG0uaWQgPSBzZWwuc2xpY2UoaGFzaCArIDEsIGRvdCk7XG4gICAgICBpZiAoZG90SWR4ID4gMCkgZWxtLmNsYXNzTmFtZSA9IHNlbC5zbGljZShkb3QgKyAxKS5yZXBsYWNlKC9cXC4vZywgJyAnKTtcbiAgICAgIGlmIChpcy5hcnJheShjaGlsZHJlbikpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgYXBpLmFwcGVuZENoaWxkKGVsbSwgY3JlYXRlRWxtKGNoaWxkcmVuW2ldLCBpbnNlcnRlZFZub2RlUXVldWUpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChpcy5wcmltaXRpdmUodm5vZGUudGV4dCkpIHtcbiAgICAgICAgYXBpLmFwcGVuZENoaWxkKGVsbSwgYXBpLmNyZWF0ZVRleHROb2RlKHZub2RlLnRleHQpKTtcbiAgICAgIH1cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMuY3JlYXRlLmxlbmd0aDsgKytpKSBjYnMuY3JlYXRlW2ldKGVtcHR5Tm9kZSwgdm5vZGUpO1xuICAgICAgaSA9IHZub2RlLmRhdGEuaG9vazsgLy8gUmV1c2UgdmFyaWFibGVcbiAgICAgIGlmIChpc0RlZihpKSkge1xuICAgICAgICBpZiAoaS5jcmVhdGUpIGkuY3JlYXRlKGVtcHR5Tm9kZSwgdm5vZGUpO1xuICAgICAgICBpZiAoaS5pbnNlcnQpIGluc2VydGVkVm5vZGVRdWV1ZS5wdXNoKHZub2RlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZWxtID0gdm5vZGUuZWxtID0gYXBpLmNyZWF0ZVRleHROb2RlKHZub2RlLnRleHQpO1xuICAgIH1cbiAgICByZXR1cm4gdm5vZGUuZWxtO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkVm5vZGVzKHBhcmVudEVsbSwgYmVmb3JlLCB2bm9kZXMsIHN0YXJ0SWR4LCBlbmRJZHgsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgIGZvciAoOyBzdGFydElkeCA8PSBlbmRJZHg7ICsrc3RhcnRJZHgpIHtcbiAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBjcmVhdGVFbG0odm5vZGVzW3N0YXJ0SWR4XSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSwgYmVmb3JlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbnZva2VEZXN0cm95SG9vayh2bm9kZSkge1xuICAgIHZhciBpLCBqLCBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICBpZiAoaXNEZWYoZGF0YSkpIHtcbiAgICAgIGlmIChpc0RlZihpID0gZGF0YS5ob29rKSAmJiBpc0RlZihpID0gaS5kZXN0cm95KSkgaSh2bm9kZSk7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLmRlc3Ryb3kubGVuZ3RoOyArK2kpIGNicy5kZXN0cm95W2ldKHZub2RlKTtcbiAgICAgIGlmIChpc0RlZihpID0gdm5vZGUuY2hpbGRyZW4pKSB7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCB2bm9kZS5jaGlsZHJlbi5sZW5ndGg7ICsraikge1xuICAgICAgICAgIGludm9rZURlc3Ryb3lIb29rKHZub2RlLmNoaWxkcmVuW2pdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZVZub2RlcyhwYXJlbnRFbG0sIHZub2Rlcywgc3RhcnRJZHgsIGVuZElkeCkge1xuICAgIGZvciAoOyBzdGFydElkeCA8PSBlbmRJZHg7ICsrc3RhcnRJZHgpIHtcbiAgICAgIHZhciBpLCBsaXN0ZW5lcnMsIHJtLCBjaCA9IHZub2Rlc1tzdGFydElkeF07XG4gICAgICBpZiAoaXNEZWYoY2gpKSB7XG4gICAgICAgIGlmIChpc0RlZihjaC5zZWwpKSB7XG4gICAgICAgICAgaW52b2tlRGVzdHJveUhvb2soY2gpO1xuICAgICAgICAgIGxpc3RlbmVycyA9IGNicy5yZW1vdmUubGVuZ3RoICsgMTtcbiAgICAgICAgICBybSA9IGNyZWF0ZVJtQ2IoY2guZWxtLCBsaXN0ZW5lcnMpO1xuICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMucmVtb3ZlLmxlbmd0aDsgKytpKSBjYnMucmVtb3ZlW2ldKGNoLCBybSk7XG4gICAgICAgICAgaWYgKGlzRGVmKGkgPSBjaC5kYXRhKSAmJiBpc0RlZihpID0gaS5ob29rKSAmJiBpc0RlZihpID0gaS5yZW1vdmUpKSB7XG4gICAgICAgICAgICBpKGNoLCBybSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJtKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgeyAvLyBUZXh0IG5vZGVcbiAgICAgICAgICBhcGkucmVtb3ZlQ2hpbGQocGFyZW50RWxtLCBjaC5lbG0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlQ2hpbGRyZW4ocGFyZW50RWxtLCBvbGRDaCwgbmV3Q2gsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgIHZhciBvbGRTdGFydElkeCA9IDAsIG5ld1N0YXJ0SWR4ID0gMDtcbiAgICB2YXIgb2xkRW5kSWR4ID0gb2xkQ2gubGVuZ3RoIC0gMTtcbiAgICB2YXIgb2xkU3RhcnRWbm9kZSA9IG9sZENoWzBdO1xuICAgIHZhciBvbGRFbmRWbm9kZSA9IG9sZENoW29sZEVuZElkeF07XG4gICAgdmFyIG5ld0VuZElkeCA9IG5ld0NoLmxlbmd0aCAtIDE7XG4gICAgdmFyIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFswXTtcbiAgICB2YXIgbmV3RW5kVm5vZGUgPSBuZXdDaFtuZXdFbmRJZHhdO1xuICAgIHZhciBvbGRLZXlUb0lkeCwgaWR4SW5PbGQsIGVsbVRvTW92ZSwgYmVmb3JlO1xuXG4gICAgd2hpbGUgKG9sZFN0YXJ0SWR4IDw9IG9sZEVuZElkeCAmJiBuZXdTdGFydElkeCA8PSBuZXdFbmRJZHgpIHtcbiAgICAgIGlmIChpc1VuZGVmKG9sZFN0YXJ0Vm5vZGUpKSB7XG4gICAgICAgIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFsrK29sZFN0YXJ0SWR4XTsgLy8gVm5vZGUgaGFzIGJlZW4gbW92ZWQgbGVmdFxuICAgICAgfSBlbHNlIGlmIChpc1VuZGVmKG9sZEVuZFZub2RlKSkge1xuICAgICAgICBvbGRFbmRWbm9kZSA9IG9sZENoWy0tb2xkRW5kSWR4XTtcbiAgICAgIH0gZWxzZSBpZiAoc2FtZVZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld1N0YXJ0Vm5vZGUpKSB7XG4gICAgICAgIHBhdGNoVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdO1xuICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICB9IGVsc2UgaWYgKHNhbWVWbm9kZShvbGRFbmRWbm9kZSwgbmV3RW5kVm5vZGUpKSB7XG4gICAgICAgIHBhdGNoVm5vZGUob2xkRW5kVm5vZGUsIG5ld0VuZFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICBvbGRFbmRWbm9kZSA9IG9sZENoWy0tb2xkRW5kSWR4XTtcbiAgICAgICAgbmV3RW5kVm5vZGUgPSBuZXdDaFstLW5ld0VuZElkeF07XG4gICAgICB9IGVsc2UgaWYgKHNhbWVWbm9kZShvbGRTdGFydFZub2RlLCBuZXdFbmRWbm9kZSkpIHsgLy8gVm5vZGUgbW92ZWQgcmlnaHRcbiAgICAgICAgcGF0Y2hWbm9kZShvbGRTdGFydFZub2RlLCBuZXdFbmRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtLCBhcGkubmV4dFNpYmxpbmcob2xkRW5kVm5vZGUuZWxtKSk7XG4gICAgICAgIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFsrK29sZFN0YXJ0SWR4XTtcbiAgICAgICAgbmV3RW5kVm5vZGUgPSBuZXdDaFstLW5ld0VuZElkeF07XG4gICAgICB9IGVsc2UgaWYgKHNhbWVWbm9kZShvbGRFbmRWbm9kZSwgbmV3U3RhcnRWbm9kZSkpIHsgLy8gVm5vZGUgbW92ZWQgbGVmdFxuICAgICAgICBwYXRjaFZub2RlKG9sZEVuZFZub2RlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgb2xkRW5kVm5vZGUuZWxtLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaXNVbmRlZihvbGRLZXlUb0lkeCkpIG9sZEtleVRvSWR4ID0gY3JlYXRlS2V5VG9PbGRJZHgob2xkQ2gsIG9sZFN0YXJ0SWR4LCBvbGRFbmRJZHgpO1xuICAgICAgICBpZHhJbk9sZCA9IG9sZEtleVRvSWR4W25ld1N0YXJ0Vm5vZGUua2V5XTtcbiAgICAgICAgaWYgKGlzVW5kZWYoaWR4SW5PbGQpKSB7IC8vIE5ldyBlbGVtZW50XG4gICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGNyZWF0ZUVsbShuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsbVRvTW92ZSA9IG9sZENoW2lkeEluT2xkXTtcbiAgICAgICAgICBwYXRjaFZub2RlKGVsbVRvTW92ZSwgbmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICBvbGRDaFtpZHhJbk9sZF0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGVsbVRvTW92ZS5lbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9sZFN0YXJ0SWR4ID4gb2xkRW5kSWR4KSB7XG4gICAgICBiZWZvcmUgPSBpc1VuZGVmKG5ld0NoW25ld0VuZElkeCsxXSkgPyBudWxsIDogbmV3Q2hbbmV3RW5kSWR4KzFdLmVsbTtcbiAgICAgIGFkZFZub2RlcyhwYXJlbnRFbG0sIGJlZm9yZSwgbmV3Q2gsIG5ld1N0YXJ0SWR4LCBuZXdFbmRJZHgsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgfSBlbHNlIGlmIChuZXdTdGFydElkeCA+IG5ld0VuZElkeCkge1xuICAgICAgcmVtb3ZlVm5vZGVzKHBhcmVudEVsbSwgb2xkQ2gsIG9sZFN0YXJ0SWR4LCBvbGRFbmRJZHgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBhdGNoVm5vZGUob2xkVm5vZGUsIHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpIHtcbiAgICB2YXIgaSwgaG9vaztcbiAgICBpZiAoaXNEZWYoaSA9IHZub2RlLmRhdGEpICYmIGlzRGVmKGhvb2sgPSBpLmhvb2spICYmIGlzRGVmKGkgPSBob29rLnByZXBhdGNoKSkge1xuICAgICAgaShvbGRWbm9kZSwgdm5vZGUpO1xuICAgIH1cbiAgICB2YXIgZWxtID0gdm5vZGUuZWxtID0gb2xkVm5vZGUuZWxtLCBvbGRDaCA9IG9sZFZub2RlLmNoaWxkcmVuLCBjaCA9IHZub2RlLmNoaWxkcmVuO1xuICAgIGlmIChvbGRWbm9kZSA9PT0gdm5vZGUpIHJldHVybjtcbiAgICBpZiAoIXNhbWVWbm9kZShvbGRWbm9kZSwgdm5vZGUpKSB7XG4gICAgICB2YXIgcGFyZW50RWxtID0gYXBpLnBhcmVudE5vZGUob2xkVm5vZGUuZWxtKTtcbiAgICAgIGVsbSA9IGNyZWF0ZUVsbSh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBlbG0sIG9sZFZub2RlLmVsbSk7XG4gICAgICByZW1vdmVWbm9kZXMocGFyZW50RWxtLCBbb2xkVm5vZGVdLCAwLCAwKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGlzRGVmKHZub2RlLmRhdGEpKSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLnVwZGF0ZS5sZW5ndGg7ICsraSkgY2JzLnVwZGF0ZVtpXShvbGRWbm9kZSwgdm5vZGUpO1xuICAgICAgaSA9IHZub2RlLmRhdGEuaG9vaztcbiAgICAgIGlmIChpc0RlZihpKSAmJiBpc0RlZihpID0gaS51cGRhdGUpKSBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgfVxuICAgIGlmIChpc1VuZGVmKHZub2RlLnRleHQpKSB7XG4gICAgICBpZiAoaXNEZWYob2xkQ2gpICYmIGlzRGVmKGNoKSkge1xuICAgICAgICBpZiAob2xkQ2ggIT09IGNoKSB1cGRhdGVDaGlsZHJlbihlbG0sIG9sZENoLCBjaCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNEZWYoY2gpKSB7XG4gICAgICAgIGlmIChpc0RlZihvbGRWbm9kZS50ZXh0KSkgYXBpLnNldFRleHRDb250ZW50KGVsbSwgJycpO1xuICAgICAgICBhZGRWbm9kZXMoZWxtLCBudWxsLCBjaCwgMCwgY2gubGVuZ3RoIC0gMSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNEZWYob2xkQ2gpKSB7XG4gICAgICAgIHJlbW92ZVZub2RlcyhlbG0sIG9sZENoLCAwLCBvbGRDaC5sZW5ndGggLSAxKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNEZWYob2xkVm5vZGUudGV4dCkpIHtcbiAgICAgICAgYXBpLnNldFRleHRDb250ZW50KGVsbSwgJycpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAob2xkVm5vZGUudGV4dCAhPT0gdm5vZGUudGV4dCkge1xuICAgICAgYXBpLnNldFRleHRDb250ZW50KGVsbSwgdm5vZGUudGV4dCk7XG4gICAgfVxuICAgIGlmIChpc0RlZihob29rKSAmJiBpc0RlZihpID0gaG9vay5wb3N0cGF0Y2gpKSB7XG4gICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG9sZFZub2RlLCB2bm9kZSkge1xuICAgIHZhciBpLCBlbG0sIHBhcmVudDtcbiAgICB2YXIgaW5zZXJ0ZWRWbm9kZVF1ZXVlID0gW107XG4gICAgZm9yIChpID0gMDsgaSA8IGNicy5wcmUubGVuZ3RoOyArK2kpIGNicy5wcmVbaV0oKTtcblxuICAgIGlmIChpc1VuZGVmKG9sZFZub2RlLnNlbCkpIHtcbiAgICAgIG9sZFZub2RlID0gZW1wdHlOb2RlQXQob2xkVm5vZGUpO1xuICAgIH1cblxuICAgIGlmIChzYW1lVm5vZGUob2xkVm5vZGUsIHZub2RlKSkge1xuICAgICAgcGF0Y2hWbm9kZShvbGRWbm9kZSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsbSA9IG9sZFZub2RlLmVsbTtcbiAgICAgIHBhcmVudCA9IGFwaS5wYXJlbnROb2RlKGVsbSk7XG5cbiAgICAgIGNyZWF0ZUVsbSh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcblxuICAgICAgaWYgKHBhcmVudCAhPT0gbnVsbCkge1xuICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudCwgdm5vZGUuZWxtLCBhcGkubmV4dFNpYmxpbmcoZWxtKSk7XG4gICAgICAgIHJlbW92ZVZub2RlcyhwYXJlbnQsIFtvbGRWbm9kZV0sIDAsIDApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoaSA9IDA7IGkgPCBpbnNlcnRlZFZub2RlUXVldWUubGVuZ3RoOyArK2kpIHtcbiAgICAgIGluc2VydGVkVm5vZGVRdWV1ZVtpXS5kYXRhLmhvb2suaW5zZXJ0KGluc2VydGVkVm5vZGVRdWV1ZVtpXSk7XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCBjYnMucG9zdC5sZW5ndGg7ICsraSkgY2JzLnBvc3RbaV0oKTtcbiAgICByZXR1cm4gdm5vZGU7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge2luaXQ6IGluaXR9O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzZWwsIGRhdGEsIGNoaWxkcmVuLCB0ZXh0LCBlbG0pIHtcbiAgdmFyIGtleSA9IGRhdGEgPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6IGRhdGEua2V5O1xuICByZXR1cm4ge3NlbDogc2VsLCBkYXRhOiBkYXRhLCBjaGlsZHJlbjogY2hpbGRyZW4sXG4gICAgICAgICAgdGV4dDogdGV4dCwgZWxtOiBlbG0sIGtleToga2V5fTtcbn07XG4iLCJmdW5jdGlvbiB1cGRhdGVQcm9wcyhvbGRWbm9kZSwgdm5vZGUpIHtcclxuICAgIGxldCBrZXksIGN1ciwgb2xkLCBlbG0gPSB2bm9kZS5lbG0sXHJcbiAgICAgICAgcHJvcHMgPSB2bm9kZS5kYXRhLmxpdmVQcm9wcyB8fCB7fTtcclxuICAgIGZvciAoa2V5IGluIHByb3BzKSB7XHJcbiAgICAgICAgY3VyID0gcHJvcHNba2V5XTtcclxuICAgICAgICBvbGQgPSBlbG1ba2V5XTtcclxuICAgICAgICBpZiAob2xkICE9PSBjdXIpIGVsbVtrZXldID0gY3VyO1xyXG4gICAgfVxyXG59XHJcbmNvbnN0IGxpdmVQcm9wc1BsdWdpbiA9IHtjcmVhdGU6IHVwZGF0ZVByb3BzLCB1cGRhdGU6IHVwZGF0ZVByb3BzfTtcclxuaW1wb3J0IHNuYWJiZG9tIGZyb20gXCJzbmFiYmRvbVwiXHJcbmltcG9ydCBoIGZyb20gXCJzbmFiYmRvbS9oXCJcclxuY29uc3QgcGF0Y2ggPSBzbmFiYmRvbS5pbml0KFtcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvY2xhc3MnKSxcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvcHJvcHMnKSxcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvc3R5bGUnKSxcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvZXZlbnRsaXN0ZW5lcnMnKSxcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvYXR0cmlidXRlcycpLFxyXG4gICAgbGl2ZVByb3BzUGx1Z2luXHJcbl0pO1xyXG5cclxuZnVuY3Rpb24gdXVpZCgpe3JldHVybihcIlwiKzFlNystMWUzKy00ZTMrLThlMystMWUxMSkucmVwbGFjZSgvWzEwXS9nLGZ1bmN0aW9uKCl7cmV0dXJuKDB8TWF0aC5yYW5kb20oKSoxNikudG9TdHJpbmcoMTYpfSl9XHJcbmltcG9ydCBiaWcgZnJvbSAnLi4vbm9kZV9tb2R1bGVzL2JpZy5qcydcclxuYmlnLkVfUE9TID0gMWUrNlxyXG5cclxuaW1wb3J0IHVnbmlzIGZyb20gJy4vdWduaXMnXHJcbmltcG9ydCBzYXZlZEFwcCBmcm9tICcuLi91Z25pc19jb21wb25lbnRzL2FwcC5qc29uJ1xyXG5cclxuY29uc3QgYXR0YWNoRmFzdENsaWNrID0gcmVxdWlyZSgnZmFzdGNsaWNrJylcclxuYXR0YWNoRmFzdENsaWNrKGRvY3VtZW50LmJvZHkpXHJcblxyXG5jb25zdCB2ZXJzaW9uID0gJzAuMC4yNnYnXHJcbmVkaXRvcihzYXZlZEFwcClcclxuXHJcbmZ1bmN0aW9uIGVkaXRvcihhcHBEZWZpbml0aW9uKXtcclxuXHJcbiAgICBjb25zdCBzYXZlZERlZmluaXRpb24gPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhcHBfa2V5XycgKyB2ZXJzaW9uKSlcclxuICAgIGNvbnN0IGFwcCA9IHVnbmlzKHNhdmVkRGVmaW5pdGlvbiB8fCBhcHBEZWZpbml0aW9uKVxyXG5cclxuICAgIGxldCBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobm9kZSlcclxuXHJcbiAgICAvLyBTdGF0ZVxyXG4gICAgbGV0IHN0YXRlID0ge1xyXG4gICAgICAgIGxlZnRPcGVuOiB0cnVlLFxyXG4gICAgICAgIHJpZ2h0T3BlbjogdHJ1ZSxcclxuICAgICAgICBmdWxsU2NyZWVuOiBmYWxzZSxcclxuICAgICAgICBlZGl0b3JSaWdodFdpZHRoOiAzNTAsXHJcbiAgICAgICAgZWRpdG9yTGVmdFdpZHRoOiAzNTAsXHJcbiAgICAgICAgc3ViRWRpdG9yV2lkdGg6IDM1MCxcclxuICAgICAgICBhcHBJc0Zyb3plbjogZmFsc2UsXHJcbiAgICAgICAgc2VsZWN0ZWRWaWV3Tm9kZToge30sXHJcbiAgICAgICAgc2VsZWN0ZWRFdmVudElkOiAnJyxcclxuICAgICAgICBzZWxlY3RlZFBpcGVJZDogJycsXHJcbiAgICAgICAgc2VsZWN0ZWRTdGF0ZU5vZGVJZDogJycsXHJcbiAgICAgICAgc2VsZWN0ZWRWaWV3U3ViTWVudTogJ3Byb3BzJyxcclxuICAgICAgICBlZGl0aW5nVGl0bGVOb2RlSWQ6ICcnLFxyXG4gICAgICAgIHZpZXdGb2xkZXJzQ2xvc2VkOiB7fSxcclxuICAgICAgICBldmVudFN0YWNrOiBbXSxcclxuICAgICAgICBkZWZpbml0aW9uOiBzYXZlZERlZmluaXRpb24gfHwgYXBwLmRlZmluaXRpb24sXHJcbiAgICB9XHJcbiAgICAvLyB1bmRvL3JlZG9cclxuICAgIGxldCBzdGF0ZVN0YWNrID0gW3N0YXRlLmRlZmluaXRpb25dXHJcbiAgICBmdW5jdGlvbiBzZXRTdGF0ZShuZXdTdGF0ZSl7XHJcbiAgICAgICAgaWYobmV3U3RhdGUgPT09IHN0YXRlKXtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdzdGF0ZSB3YXMgbXV0YXRlZCwgc2VhcmNoIGZvciBhIGJ1ZycpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHN0YXRlLmRlZmluaXRpb24gIT09IG5ld1N0YXRlLmRlZmluaXRpb24pe1xyXG4gICAgICAgICAgICAvLyB1bnNlbGVjdCBkZWxldGVkIGNvbXBvbmVudHMgYW5kIHN0YXRlXHJcbiAgICAgICAgICAgIGlmKG5ld1N0YXRlLmRlZmluaXRpb24uc3RhdGVbbmV3U3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZF0gPT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgICAgICBuZXdTdGF0ZSA9IHsuLi5uZXdTdGF0ZSwgc2VsZWN0ZWRTdGF0ZU5vZGVJZDogJyd9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYobmV3U3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgIT09IHVuZGVmaW5lZCAmJiBuZXdTdGF0ZS5kZWZpbml0aW9uW25ld1N0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmXVtuZXdTdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkXSA9PT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgICAgIG5ld1N0YXRlID0gey4uLm5ld1N0YXRlLCBzZWxlY3RlZFZpZXdOb2RlOiB7fX1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyB1bmRvL3JlZG8gdGhlbiByZW5kZXIgdGhlbiBzYXZlXHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRJbmRleCA9IHN0YXRlU3RhY2suZmluZEluZGV4KChhKT0+YT09PXN0YXRlLmRlZmluaXRpb24pXHJcbiAgICAgICAgICAgIHN0YXRlU3RhY2sgPSBzdGF0ZVN0YWNrLnNsaWNlKDAsIGN1cnJlbnRJbmRleCsxKS5jb25jYXQobmV3U3RhdGUuZGVmaW5pdGlvbik7XHJcbiAgICAgICAgICAgIC8vIFRPRE8gYWRkIGdhcmJhZ2UgY29sbGVjdGlvbj9cclxuICAgICAgICAgICAgYXBwLnJlbmRlcihuZXdTdGF0ZS5kZWZpbml0aW9uKVxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpPT5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYXBwX2tleV8nK3ZlcnNpb24sIEpTT04uc3RyaW5naWZ5KG5ld1N0YXRlLmRlZmluaXRpb24pKSwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHN0YXRlLmFwcElzRnJvemVuICE9PSBuZXdTdGF0ZS5hcHBJc0Zyb3plbiB8fCBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlICE9PSBuZXdTdGF0ZS5zZWxlY3RlZFZpZXdOb2RlICl7XHJcbiAgICAgICAgICAgIGFwcC5fZnJlZXplKG5ld1N0YXRlLmFwcElzRnJvemVuLCBWSUVXX05PREVfU0VMRUNURUQsIG5ld1N0YXRlLnNlbGVjdGVkVmlld05vZGUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKG5ld1N0YXRlLmVkaXRpbmdUaXRsZU5vZGVJZCAmJiBzdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQgIT09IG5ld1N0YXRlLmVkaXRpbmdUaXRsZU5vZGVJZCl7XHJcbiAgICAgICAgICAgIC8vIHF1ZSBhdXRvIGZvY3VzXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCk9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBub2RlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtaXN0aXRsZWVkaXRvcl0nKVswXVxyXG4gICAgICAgICAgICAgICAgaWYobm9kZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5mb2N1cygpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIDApXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0YXRlID0gbmV3U3RhdGVcclxuICAgICAgICByZW5kZXIoKVxyXG4gICAgfVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSk9PiB7XHJcbiAgICAgICAgLy8gY2xpY2tlZCBvdXRzaWRlXHJcbiAgICAgICAgaWYoc3RhdGUuZWRpdGluZ1RpdGxlTm9kZUlkICYmICFlLnRhcmdldC5kYXRhc2V0LmlzdGl0bGVlZGl0b3Ipe1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGVkaXRpbmdUaXRsZU5vZGVJZDogJyd9KVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICByZW5kZXIoKVxyXG4gICAgfSwgZmFsc2UpXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm9yaWVudGF0aW9uY2hhbmdlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJlbmRlcigpXHJcbiAgICB9LCBmYWxzZSlcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSk9PntcclxuICAgICAgICAvLyA4MyAtIHNcclxuICAgICAgICAvLyA5MCAtIHpcclxuICAgICAgICAvLyA4OSAtIHlcclxuICAgICAgICAvLyAzMiAtIHNwYWNlXHJcbiAgICAgICAgLy8gMTMgLSBlbnRlclxyXG4gICAgICAgIC8vIDI3IC0gZXNjYXBlXHJcbiAgICAgICAgaWYoZS53aGljaCA9PT0gODMgJiYgKG5hdmlnYXRvci5wbGF0Zm9ybS5tYXRjaChcIk1hY1wiKSA/IGUubWV0YUtleSA6IGUuY3RybEtleSkpIHtcclxuICAgICAgICAgICAgLy8gVE9ETyBnYXJiYWdlIGNvbGxlY3RcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBmZXRjaCgnL3NhdmUnLCB7bWV0aG9kOiAnUE9TVCcsIGJvZHk6IEpTT04uc3RyaW5naWZ5KHN0YXRlLmRlZmluaXRpb24pLCBoZWFkZXJzOiB7XCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCJ9fSlcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZihlLndoaWNoID09PSAzMiAmJiAobmF2aWdhdG9yLnBsYXRmb3JtLm1hdGNoKFwiTWFjXCIpID8gZS5tZXRhS2V5IDogZS5jdHJsS2V5KSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgRlJFRVpFUl9DTElDS0VEKClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoIWUuc2hpZnRLZXkgJiYgZS53aGljaCA9PT0gOTAgJiYgKG5hdmlnYXRvci5wbGF0Zm9ybS5tYXRjaChcIk1hY1wiKSA/IGUubWV0YUtleSA6IGUuY3RybEtleSkpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50SW5kZXggPSBzdGF0ZVN0YWNrLmZpbmRJbmRleCgoYSk9PmE9PT1zdGF0ZS5kZWZpbml0aW9uKVxyXG4gICAgICAgICAgICBpZihjdXJyZW50SW5kZXggPiAwKXtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0RlZmluaXRpb24gPSBzdGF0ZVN0YWNrW2N1cnJlbnRJbmRleC0xXVxyXG4gICAgICAgICAgICAgICAgYXBwLnJlbmRlcihuZXdEZWZpbml0aW9uKVxyXG4gICAgICAgICAgICAgICAgc3RhdGUgPSB7Li4uc3RhdGUsIGRlZmluaXRpb246IG5ld0RlZmluaXRpb259XHJcbiAgICAgICAgICAgICAgICByZW5kZXIoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKChlLndoaWNoID09PSA4OSAmJiAobmF2aWdhdG9yLnBsYXRmb3JtLm1hdGNoKFwiTWFjXCIpID8gZS5tZXRhS2V5IDogZS5jdHJsS2V5KSkgfHwgKGUuc2hpZnRLZXkgJiYgZS53aGljaCA9PT0gOTAgJiYgKG5hdmlnYXRvci5wbGF0Zm9ybS5tYXRjaChcIk1hY1wiKSA/IGUubWV0YUtleSA6IGUuY3RybEtleSkpKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudEluZGV4ID0gc3RhdGVTdGFjay5maW5kSW5kZXgoKGEpPT5hPT09c3RhdGUuZGVmaW5pdGlvbilcclxuICAgICAgICAgICAgaWYoY3VycmVudEluZGV4IDwgc3RhdGVTdGFjay5sZW5ndGgtMSl7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdEZWZpbml0aW9uID0gc3RhdGVTdGFja1tjdXJyZW50SW5kZXgrMV1cclxuICAgICAgICAgICAgICAgIGFwcC5yZW5kZXIobmV3RGVmaW5pdGlvbilcclxuICAgICAgICAgICAgICAgIHN0YXRlID0gey4uLnN0YXRlLCBkZWZpbml0aW9uOiBuZXdEZWZpbml0aW9ufVxyXG4gICAgICAgICAgICAgICAgcmVuZGVyKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZihlLndoaWNoID09PSAxMykge1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGVkaXRpbmdUaXRsZU5vZGVJZDogJyd9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZihlLndoaWNoID09PSAyNykge1xyXG4gICAgICAgICAgICBGVUxMX1NDUkVFTl9DTElDS0VEKGZhbHNlKVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgLy8gTGlzdGVuIHRvIGFwcFxyXG4gICAgYXBwLmFkZExpc3RlbmVyKChldmVudElkLCBkYXRhLCBlLCBwcmV2aW91c1N0YXRlLCBjdXJyZW50U3RhdGUsIG11dGF0aW9ucyk9PntcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGV2ZW50U3RhY2s6IHN0YXRlLmV2ZW50U3RhY2suY29uY2F0KHtldmVudElkLCBkYXRhLCBlLCBwcmV2aW91c1N0YXRlLCBjdXJyZW50U3RhdGUsIG11dGF0aW9uc30pfSlcclxuICAgIH0pXHJcblxyXG4gICAgLy8gQWN0aW9uc1xyXG4gICAgZnVuY3Rpb24gV0lEVEhfRFJBR0dFRCh3aWR0aE5hbWUsIGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICBmdW5jdGlvbiByZXNpemUoZSl7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICBsZXQgbmV3V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCAtIChlLnRvdWNoZXM/IGUudG91Y2hlc1swXS5wYWdlWDogZS5wYWdlWClcclxuICAgICAgICAgICAgaWYod2lkdGhOYW1lID09PSAnZWRpdG9yTGVmdFdpZHRoJyl7XHJcbiAgICAgICAgICAgICAgICBuZXdXaWR0aCA9IGUudG91Y2hlcz8gZS50b3VjaGVzWzBdLnBhZ2VYOiBlLnBhZ2VYXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYod2lkdGhOYW1lID09PSAnc3ViRWRpdG9yV2lkdGgnKXtcclxuICAgICAgICAgICAgICAgIG5ld1dpZHRoID0gbmV3V2lkdGggLSBzdGF0ZS5lZGl0b3JSaWdodFdpZHRoIC0gMTBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBJIHByb2JhYmx5IHdhcyBkcnVua1xyXG4gICAgICAgICAgICBpZih3aWR0aE5hbWUgIT09ICdzdWJFZGl0b3JXaWR0aCcgJiYgKCAod2lkdGhOYW1lID09PSAnZWRpdG9yTGVmdFdpZHRoJyA/IHN0YXRlLmxlZnRPcGVuOiBzdGF0ZS5yaWdodE9wZW4pID8gbmV3V2lkdGggPCAxODA6IG5ld1dpZHRoID4gMTgwKSl7XHJcbiAgICAgICAgICAgICAgICBpZih3aWR0aE5hbWUgPT09ICdlZGl0b3JMZWZ0V2lkdGgnKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0U3RhdGUoey4uLnN0YXRlLCBsZWZ0T3BlbjogIXN0YXRlLmxlZnRPcGVufSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBzZXRTdGF0ZSh7Li4uc3RhdGUsIHJpZ2h0T3BlbjogIXN0YXRlLnJpZ2h0T3Blbn0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYobmV3V2lkdGggPCAyNTApe1xyXG4gICAgICAgICAgICAgICAgbmV3V2lkdGggPSAyNTBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIFt3aWR0aE5hbWVdOiBuZXdXaWR0aH0pXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgcmVzaXplKVxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCByZXNpemUpXHJcbiAgICAgICAgZnVuY3Rpb24gc3RvcERyYWdnaW5nKGUpe1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHJlc2l6ZSlcclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHJlc2l6ZSlcclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBzdG9wRHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHN0b3BEcmFnZ2luZylcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgc3RvcERyYWdnaW5nKVxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHN0b3BEcmFnZ2luZylcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIEZSRUVaRVJfQ0xJQ0tFRCgpIHtcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGFwcElzRnJvemVuOiAhc3RhdGUuYXBwSXNGcm96ZW59KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gVklFV19GT0xERVJfQ0xJQ0tFRChub2RlSWQpIHtcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIHZpZXdGb2xkZXJzQ2xvc2VkOnsuLi5zdGF0ZS52aWV3Rm9sZGVyc0Nsb3NlZCwgW25vZGVJZF06ICFzdGF0ZS52aWV3Rm9sZGVyc0Nsb3NlZFtub2RlSWRdfX0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBWSUVXX05PREVfU0VMRUNURUQocmVmKSB7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBzZWxlY3RlZFZpZXdOb2RlOnJlZn0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBVTlNFTEVDVF9WSUVXX05PREUoZSkge1xyXG4gICAgICAgIGlmKGUudGFyZ2V0ID09PSB0aGlzLmVsbSl7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgc2VsZWN0ZWRWaWV3Tm9kZTp7fX0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gU1RBVEVfTk9ERV9TRUxFQ1RFRChub2RlSWQpIHtcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIHNlbGVjdGVkU3RhdGVOb2RlSWQ6bm9kZUlkfSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFVOU0VMRUNUX1NUQVRFX05PREUoZSkge1xyXG4gICAgICAgIGlmKGUudGFyZ2V0ID09PSB0aGlzLmVsbSl7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgc2VsZWN0ZWRTdGF0ZU5vZGVJZDonJywgc2VsZWN0ZWRFdmVudElkOicnfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBERUxFVEVfU0VMRUNURURfVklFVyhub2RlUmVmLCBwYXJlbnRSZWYsIGUpIHtcclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgaWYobm9kZVJlZi5pZCA9PT0gJ19yb290Tm9kZScpe1xyXG4gICAgICAgICAgICAvLyBpbW11dGFibHkgcmVtb3ZlIGFsbCBub2RlcyBleGNlcHQgcm9vdE5vZGVcclxuICAgICAgICAgICAgcmV0dXJuIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgIHZOb2RlQm94OiB7J19yb290Tm9kZSc6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnZOb2RlQm94Wydfcm9vdE5vZGUnXSwgY2hpbGRyZW46IFtdfX0sXHJcbiAgICAgICAgICAgIH0sIHNlbGVjdGVkVmlld05vZGU6IHt9fSlcclxuICAgICAgICB9XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIFtwYXJlbnRSZWYucmVmXTogey4uLnN0YXRlLmRlZmluaXRpb25bcGFyZW50UmVmLnJlZl0sIFtwYXJlbnRSZWYuaWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXVtwYXJlbnRSZWYuaWRdLCBjaGlsZHJlbjpzdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdW3BhcmVudFJlZi5pZF0uY2hpbGRyZW4uZmlsdGVyKChyZWYpPT5yZWYuaWQgIT09IG5vZGVSZWYuaWQpfX0sXHJcbiAgICAgICAgfSwgc2VsZWN0ZWRWaWV3Tm9kZToge319KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQUREX05PREUobm9kZVJlZiwgdHlwZSkge1xyXG4gICAgICAgIC8vIFRPRE8gcmVtb3ZlIHdoZW4gZHJhZ2dpbmcgd29ya3NcclxuICAgICAgICBpZighbm9kZVJlZi5yZWYgfHwgIXN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVSZWYuaWRdIHx8ICFzdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlUmVmLmlkXS5jaGlsZHJlbil7XHJcbiAgICAgICAgICAgIG5vZGVSZWYgPSB7cmVmOiAndk5vZGVCb3gnLCBpZDogJ19yb290Tm9kZSd9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG5vZGVJZCA9IG5vZGVSZWYuaWRcclxuICAgICAgICBjb25zdCBuZXdOb2RlSWQgPSB1dWlkKClcclxuICAgICAgICBjb25zdCBuZXdTdHlsZUlkID0gdXVpZCgpXHJcbiAgICAgICAgY29uc3QgbmV3U3R5bGUgPSB7XHJcbiAgICAgICAgICAgIHBhZGRpbmc6ICcxMHB4JyxcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHlwZSA9PT0gJ2JveCcpIHtcclxuICAgICAgICAgICAgY29uc3QgbmV3Tm9kZSA9IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnYm94JyxcclxuICAgICAgICAgICAgICAgIHN0eWxlOiB7cmVmOidzdHlsZScsIGlkOm5ld1N0eWxlSWR9LFxyXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzZXRTdGF0ZSh7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZSxcclxuICAgICAgICAgICAgICAgIHNlbGVjdGVkVmlld05vZGU6IHtyZWY6J3ZOb2RlQm94JywgaWQ6IG5ld05vZGVJZH0sXHJcbiAgICAgICAgICAgICAgICBkZWZpbml0aW9uOiBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlQm94JyA/IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIHZOb2RlQm94OiB7Li4uc3RhdGUuZGVmaW5pdGlvbi52Tm9kZUJveCwgW25vZGVJZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnZOb2RlQm94W25vZGVJZF0sIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uLnZOb2RlQm94W25vZGVJZF0uY2hpbGRyZW4uY29uY2F0KHtyZWY6J3ZOb2RlQm94JywgaWQ6bmV3Tm9kZUlkfSl9LCBbbmV3Tm9kZUlkXTogbmV3Tm9kZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnN0eWxlLCBbbmV3U3R5bGVJZF06IG5ld1N0eWxlfSxcclxuICAgICAgICAgICAgICAgIH0gOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBbbm9kZVJlZi5yZWZdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl0sIFtub2RlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZUlkXSwgY2hpbGRyZW46IHN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVJZF0uY2hpbGRyZW4uY29uY2F0KHtyZWY6J3ZOb2RlQm94JywgaWQ6bmV3Tm9kZUlkfSl9fSxcclxuICAgICAgICAgICAgICAgICAgICB2Tm9kZUJveDogey4uLnN0YXRlLmRlZmluaXRpb24udk5vZGVCb3gsIFtuZXdOb2RlSWRdOiBuZXdOb2RlfSxcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogey4uLnN0YXRlLmRlZmluaXRpb24uc3R5bGUsIFtuZXdTdHlsZUlkXTogbmV3U3R5bGV9LFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0eXBlID09PSAndGV4dCcpe1xyXG4gICAgICAgICAgICBjb25zdCBwaXBlSWQgPSB1dWlkKClcclxuICAgICAgICAgICAgY29uc3QgbmV3Tm9kZSA9IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgICBzdHlsZToge3JlZjonc3R5bGUnLCBpZDpuZXdTdHlsZUlkfSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB7cmVmOidwaXBlJywgaWQ6cGlwZUlkfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1BpcGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogJ0RlZmF1bHQgVGV4dCcsXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFtdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNldFN0YXRlKHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRWaWV3Tm9kZToge3JlZjondk5vZGVUZXh0JywgaWQ6IG5ld05vZGVJZH0sXHJcbiAgICAgICAgICAgICAgICBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBwaXBlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLCBbcGlwZUlkXTogbmV3UGlwZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgW25vZGVSZWYucmVmXTogey4uLnN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdLCBbbm9kZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVJZF0sIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlSWRdLmNoaWxkcmVuLmNvbmNhdCh7cmVmOid2Tm9kZVRleHQnLCBpZDpuZXdOb2RlSWR9KX19LFxyXG4gICAgICAgICAgICAgICAgICAgIHZOb2RlVGV4dDogey4uLnN0YXRlLmRlZmluaXRpb24udk5vZGVUZXh0LCBbbmV3Tm9kZUlkXTogbmV3Tm9kZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnN0eWxlLCBbbmV3U3R5bGVJZF06IG5ld1N0eWxlfSxcclxuICAgICAgICAgICAgICAgIH19KVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0eXBlID09PSAnaW5wdXQnKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHN0YXRlSWQgPSB1dWlkKClcclxuICAgICAgICAgICAgY29uc3QgZXZlbnRJZCA9IHV1aWQoKVxyXG4gICAgICAgICAgICBjb25zdCBtdXRhdG9ySWQgPSB1dWlkKClcclxuICAgICAgICAgICAgY29uc3QgcGlwZUlucHV0SWQgPSB1dWlkKClcclxuICAgICAgICAgICAgY29uc3QgcGlwZU11dGF0b3JJZCA9IHV1aWQoKVxyXG4gICAgICAgICAgICBjb25zdCBuZXdOb2RlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdpbnB1dCcsXHJcbiAgICAgICAgICAgICAgICBzdHlsZToge3JlZjonc3R5bGUnLCBpZDpuZXdTdHlsZUlkfSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB7cmVmOidwaXBlJywgaWQ6cGlwZUlucHV0SWR9LFxyXG4gICAgICAgICAgICAgICAgaW5wdXQ6IHtyZWY6J2V2ZW50JywgaWQ6ZXZlbnRJZH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBuZXdQaXBlSW5wdXQgPSB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZToge3JlZjogJ3N0YXRlJywgaWQ6IHN0YXRlSWR9LFxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBbXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1BpcGVNdXRhdG9yID0ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6ICdldmVudERhdGEnLCBpZDogJ19pbnB1dCd9LFxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBbXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1N0YXRlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdpbnB1dCB2YWx1ZScsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgICByZWY6IHN0YXRlSWQsXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU6ICdEZWZhdWx0IHRleHQnLFxyXG4gICAgICAgICAgICAgICAgbXV0YXRvcnM6IFt7IHJlZjonbXV0YXRvcicsIGlkOm11dGF0b3JJZH1dLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld011dGF0b3IgPSB7XHJcbiAgICAgICAgICAgICAgICBldmVudDogeyByZWY6ICdldmVudCcsIGlkOmV2ZW50SWR9LFxyXG4gICAgICAgICAgICAgICAgc3RhdGU6IHsgcmVmOiAnc3RhdGUnLCBpZDpzdGF0ZUlkfSxcclxuICAgICAgICAgICAgICAgIG11dGF0aW9uOiB7IHJlZjogJ3BpcGUnLCBpZDogcGlwZU11dGF0b3JJZH0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbmV3RXZlbnQgPSB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnaW5wdXQnLFxyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICd1cGRhdGUgaW5wdXQnLFxyXG4gICAgICAgICAgICAgICAgbXV0YXRvcnM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7IHJlZjogJ211dGF0b3InLCBpZDogbXV0YXRvcklkfSxcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICBlbWl0dGVyOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVmOiAndk5vZGVJbnB1dCcsXHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IG5ld05vZGVJZCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge3JlZjogJ2V2ZW50RGF0YScsIGlkOiAnX2lucHV0J31cclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNldFN0YXRlKHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRWaWV3Tm9kZToge3JlZjondk5vZGVJbnB1dCcsIGlkOiBuZXdOb2RlSWR9LFxyXG4gICAgICAgICAgICAgICAgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwZTogey4uLnN0YXRlLmRlZmluaXRpb24ucGlwZSwgW3BpcGVJbnB1dElkXTogbmV3UGlwZUlucHV0LCBbcGlwZU11dGF0b3JJZF06IG5ld1BpcGVNdXRhdG9yfSxcclxuICAgICAgICAgICAgICAgICAgICBbbm9kZVJlZi5yZWZdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl0sIFtub2RlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZUlkXSwgY2hpbGRyZW46IHN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVJZF0uY2hpbGRyZW4uY29uY2F0KHtyZWY6J3ZOb2RlSW5wdXQnLCBpZDpuZXdOb2RlSWR9KX19LFxyXG4gICAgICAgICAgICAgICAgICAgIHZOb2RlSW5wdXQ6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnZOb2RlSW5wdXQsIFtuZXdOb2RlSWRdOiBuZXdOb2RlfSxcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogey4uLnN0YXRlLmRlZmluaXRpb24uc3R5bGUsIFtuZXdTdHlsZUlkXTogbmV3U3R5bGV9LFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWVTcGFjZTogey4uLnN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlLCBbJ19yb290TmFtZVNwYWNlJ106IHsuLi5zdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZVsnX3Jvb3ROYW1lU3BhY2UnXSwgY2hpbGRyZW46IHN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlWydfcm9vdE5hbWVTcGFjZSddLmNoaWxkcmVuLmNvbmNhdCh7cmVmOidzdGF0ZScsIGlkOnN0YXRlSWR9KX19LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5zdGF0ZSwgW3N0YXRlSWRdOiBuZXdTdGF0ZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgbXV0YXRvcjogey4uLnN0YXRlLmRlZmluaXRpb24ubXV0YXRvciwgW211dGF0b3JJZF06IG5ld011dGF0b3J9LFxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50OiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5ldmVudCwgW2V2ZW50SWRdOiBuZXdFdmVudH0sXHJcbiAgICAgICAgICAgICAgICB9fSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBBRERfU1RBVEUobmFtZXNwYWNlSWQsIHR5cGUpIHtcclxuICAgICAgICBjb25zdCBuZXdTdGF0ZUlkID0gdXVpZCgpXHJcbiAgICAgICAgbGV0IG5ld1N0YXRlXHJcbiAgICAgICAgaWYodHlwZSA9PT0gJ3RleHQnKSB7XHJcbiAgICAgICAgICAgIG5ld1N0YXRlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICduZXcgdGV4dCcsXHJcbiAgICAgICAgICAgICAgICByZWY6IG5ld1N0YXRlSWQsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU6ICdEZWZhdWx0IHRleHQnLFxyXG4gICAgICAgICAgICAgICAgbXV0YXRvcnM6IFtdLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHR5cGUgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgIG5ld1N0YXRlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICduZXcgbnVtYmVyJyxcclxuICAgICAgICAgICAgICAgIHJlZjogbmV3U3RhdGVJZCxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiAwLFxyXG4gICAgICAgICAgICAgICAgbXV0YXRvcnM6IFtdLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHR5cGUgPT09ICdib29sZWFuJykge1xyXG4gICAgICAgICAgICBuZXdTdGF0ZSA9IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnbmV3IGJvb2xlYW4nLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgICAgICAgICAgcmVmOiBuZXdTdGF0ZUlkLFxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgbXV0YXRvcnM6IFtdLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHR5cGUgPT09ICd0YWJsZScpIHtcclxuICAgICAgICAgICAgbmV3U3RhdGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ25ldyB0YWJsZScsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAndGFibGUnLFxyXG4gICAgICAgICAgICAgICAgcmVmOiBuZXdTdGF0ZUlkLFxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiB7fSxcclxuICAgICAgICAgICAgICAgIG11dGF0b3JzOiBbXSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0eXBlID09PSAnZm9sZGVyJykge1xyXG4gICAgICAgICAgICBuZXdTdGF0ZSA9IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnbmV3IGZvbGRlcicsXHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjogW10sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgIG5hbWVTcGFjZTogey4uLnN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlLCBbbmFtZXNwYWNlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5uYW1lU3BhY2VbbmFtZXNwYWNlSWRdLCBjaGlsZHJlbjogc3RhdGUuZGVmaW5pdGlvbi5uYW1lU3BhY2VbbmFtZXNwYWNlSWRdLmNoaWxkcmVuLmNvbmNhdCh7cmVmOiduYW1lU3BhY2UnLCBpZDpuZXdTdGF0ZUlkfSl9LCBbbmV3U3RhdGVJZF06IG5ld1N0YXRlfSxcclxuICAgICAgICAgICAgfX0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICBuYW1lU3BhY2U6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZSwgW25hbWVzcGFjZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlW25hbWVzcGFjZUlkXSwgY2hpbGRyZW46IHN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlW25hbWVzcGFjZUlkXS5jaGlsZHJlbi5jb25jYXQoe3JlZjonc3RhdGUnLCBpZDpuZXdTdGF0ZUlkfSl9fSxcclxuICAgICAgICAgICAgc3RhdGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnN0YXRlLCBbbmV3U3RhdGVJZF06IG5ld1N0YXRlfSxcclxuICAgICAgICB9fSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIENIQU5HRV9TVFlMRShzdHlsZUlkLCBrZXksIGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAvLyBhbmQgbm93IEkgcmVhbGx5IHJlZ3JldCBub3QgdXNpbmcgaW1tdXRhYmxlIG9yIHJhbWRhIGxlbnNlc1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjogey4uLnN0YXRlLmRlZmluaXRpb24sIHN0eWxlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5zdHlsZSwgW3N0eWxlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5zdHlsZVtzdHlsZUlkXSwgW2tleV06IGUudGFyZ2V0LnZhbHVlfX19fSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIEFERF9ERUZBVUxUX1NUWUxFKHN0eWxlSWQsIGtleSkge1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjogey4uLnN0YXRlLmRlZmluaXRpb24sIHN0eWxlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5zdHlsZSwgW3N0eWxlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5zdHlsZVtzdHlsZUlkXSwgW2tleV06ICdkZWZhdWx0J319fX0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBTRUxFQ1RfVklFV19TVUJNRU5VKG5ld0lkKSB7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBzZWxlY3RlZFZpZXdTdWJNZW51Om5ld0lkfSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIEVESVRfVklFV19OT0RFX1RJVExFKG5vZGVJZCkge1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZWRpdGluZ1RpdGxlTm9kZUlkOm5vZGVJZH0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBFRElUX0VWRU5UX1RJVExFKG5vZGVJZCkge1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZWRpdGluZ1RpdGxlTm9kZUlkOm5vZGVJZH0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBDSEFOR0VfRVZFTlRfVElUTEUobm9kZUlkLCBlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICBldmVudDoge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5ldmVudCxcclxuICAgICAgICAgICAgICAgIFtub2RlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5ldmVudFtub2RlSWRdLFxyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiBlLnRhcmdldC52YWx1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH19KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQ0hBTkdFX1ZJRVdfTk9ERV9USVRMRShub2RlUmVmLCBlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIGNvbnN0IG5vZGVJZCA9IG5vZGVSZWYuaWRcclxuICAgICAgICBjb25zdCBub2RlVHlwZSA9IG5vZGVSZWYucmVmXHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIFtub2RlVHlwZV06IHsuLi5zdGF0ZS5kZWZpbml0aW9uW25vZGVUeXBlXSwgW25vZGVJZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uW25vZGVUeXBlXVtub2RlSWRdLCB0aXRsZTogZS50YXJnZXQudmFsdWV9fSxcclxuICAgICAgICB9fSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIENIQU5HRV9TVEFURV9OT0RFX1RJVExFKG5vZGVJZCwgZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgc3RhdGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnN0YXRlLCBbbm9kZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb24uc3RhdGVbbm9kZUlkXSwgdGl0bGU6IGUudGFyZ2V0LnZhbHVlfX0sXHJcbiAgICAgICAgfX0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBDSEFOR0VfTkFNRVNQQUNFX1RJVExFKG5vZGVJZCwgZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgbmFtZVNwYWNlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5uYW1lU3BhY2UsIFtub2RlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5uYW1lU3BhY2Vbbm9kZUlkXSwgdGl0bGU6IGUudGFyZ2V0LnZhbHVlfX0sXHJcbiAgICAgICAgfX0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBDSEFOR0VfQ1VSUkVOVF9TVEFURV9URVhUX1ZBTFVFKHN0YXRlSWQsIGUpIHtcclxuICAgICAgICBhcHAuc2V0Q3VycmVudFN0YXRlKHsuLi5hcHAuZ2V0Q3VycmVudFN0YXRlKCksIFtzdGF0ZUlkXTogZS50YXJnZXQudmFsdWV9KVxyXG4gICAgICAgIHJlbmRlcigpXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBDSEFOR0VfQ1VSUkVOVF9TVEFURV9OVU1CRVJfVkFMVUUoc3RhdGVJZCwgZSkge1xyXG4gICAgICAgIC8vIHRvZG8gYmlnIHRocm93cyBlcnJvciBpbnN0ZWFkIG9mIHJldHVybmluZyBOYU4uLi4gZml4LCByZXdyaXRlIG9yIGhhY2tcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBpZihiaWcoZS50YXJnZXQudmFsdWUpLnRvU3RyaW5nKCkgIT09IGFwcC5nZXRDdXJyZW50U3RhdGUoKVtzdGF0ZUlkXS50b1N0cmluZygpKXtcclxuICAgICAgICAgICAgICAgIGFwcC5zZXRDdXJyZW50U3RhdGUoey4uLmFwcC5nZXRDdXJyZW50U3RhdGUoKSwgW3N0YXRlSWRdOiBiaWcoZS50YXJnZXQudmFsdWUpfSlcclxuICAgICAgICAgICAgICAgIHJlbmRlcigpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoKGVycikge1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFNFTEVDVF9FVkVOVChldmVudElkKSB7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBzZWxlY3RlZEV2ZW50SWQ6ZXZlbnRJZH0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBDSEFOR0VfU1RBVElDX1ZBTFVFKHJlZiwgcHJvcGVydHlOYW1lLCB0eXBlLCBlKSB7XHJcbiAgICAgICAgbGV0IHZhbHVlID0gZS50YXJnZXQudmFsdWVcclxuICAgICAgICBpZih0eXBlID09PSAnbnVtYmVyJyl7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGJpZyhlLnRhcmdldC52YWx1ZSlcclxuICAgICAgICAgICAgfSBjYXRjaChlcnIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246e1xyXG4gICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICBbcmVmLnJlZl06IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb25bcmVmLnJlZl0sXHJcbiAgICAgICAgICAgICAgICBbcmVmLmlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXSxcclxuICAgICAgICAgICAgICAgICAgICBbcHJvcGVydHlOYW1lXTogdmFsdWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH19KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQUREX0VWRU5UKHByb3BlcnR5TmFtZSkge1xyXG4gICAgICAgIGNvbnN0IHJlZiA9IHN0YXRlLnNlbGVjdGVkVmlld05vZGVcclxuICAgICAgICBjb25zdCBldmVudElkID0gdXVpZCgpO1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjp7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIFtyZWYucmVmXToge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbltyZWYucmVmXSxcclxuICAgICAgICAgICAgICAgIFtyZWYuaWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdLFxyXG4gICAgICAgICAgICAgICAgICAgIFtwcm9wZXJ0eU5hbWVdOiB7cmVmOiAnZXZlbnQnLCBpZDogZXZlbnRJZH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXZlbnQ6IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24uZXZlbnQsXHJcbiAgICAgICAgICAgICAgICBbZXZlbnRJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ09uICcgKyBwcm9wZXJ0eU5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgbXV0YXRvcnM6IFtdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9fSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFNFTEVDVF9QSVBFKHBpcGVJZCkge1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgc2VsZWN0ZWRQaXBlSWQ6cGlwZUlkfSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIENIQU5HRV9QSVBFX1ZBTFVFX1RPX1NUQVRFKHBpcGVJZCkge1xyXG4gICAgICAgIGlmKCFzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkIHx8IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLnZhbHVlLmlkICl7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIHBpcGU6IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZSxcclxuICAgICAgICAgICAgICAgIFtwaXBlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6ICdzdGF0ZScsIGlkOiBzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkfSxcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFtdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9fSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIEFERF9UUkFOU0ZPUk1BVElPTihwaXBlSWQsIHRyYW5zZm9ybWF0aW9uKSB7XHJcbiAgICAgICAgaWYodHJhbnNmb3JtYXRpb24gPT09ICdqb2luJyl7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1BpcGVJZCA9IHV1aWQoKTtcclxuICAgICAgICAgICAgY29uc3Qgam9pbklkID0gdXVpZCgpO1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICBqb2luOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5qb2luLFxyXG4gICAgICAgICAgICAgICAgICAgIFtqb2luSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7cmVmOiAncGlwZScsIGlkOm5ld1BpcGVJZH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcGlwZToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZSxcclxuICAgICAgICAgICAgICAgICAgICBbbmV3UGlwZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnRGVmYXVsdCB0ZXh0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgW3BpcGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0udHJhbnNmb3JtYXRpb25zLmNvbmNhdCh7cmVmOiAnam9pbicsIGlkOmpvaW5JZH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9fSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHJhbnNmb3JtYXRpb24gPT09ICd0b1VwcGVyQ2FzZScpe1xyXG4gICAgICAgICAgICBjb25zdCBuZXdJZCA9IHV1aWQoKTtcclxuICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgdG9VcHBlckNhc2U6IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnRvVXBwZXJDYXNlLFxyXG4gICAgICAgICAgICAgICAgICAgIFtuZXdJZF06IHt9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcGlwZToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZSxcclxuICAgICAgICAgICAgICAgICAgICBbcGlwZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBzdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXS50cmFuc2Zvcm1hdGlvbnMuY29uY2F0KHtyZWY6ICd0b1VwcGVyQ2FzZScsIGlkOm5ld0lkfSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH19KVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0cmFuc2Zvcm1hdGlvbiA9PT0gJ3RvTG93ZXJDYXNlJyl7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld0lkID0gdXVpZCgpO1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICB0b0xvd2VyQ2FzZToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24udG9Mb3dlckNhc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgW25ld0lkXToge31cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwaXBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIFtwaXBlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IHN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLnRyYW5zZm9ybWF0aW9ucy5jb25jYXQoe3JlZjogJ3RvTG93ZXJDYXNlJywgaWQ6bmV3SWR9KVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfX0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRyYW5zZm9ybWF0aW9uID09PSAndG9UZXh0Jyl7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld0lkID0gdXVpZCgpO1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICB0b1RleHQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnRvVGV4dCxcclxuICAgICAgICAgICAgICAgICAgICBbbmV3SWRdOiB7fVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHBpcGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsXHJcbiAgICAgICAgICAgICAgICAgICAgW3BpcGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0udHJhbnNmb3JtYXRpb25zLmNvbmNhdCh7cmVmOiAndG9UZXh0JywgaWQ6bmV3SWR9KVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfX0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRyYW5zZm9ybWF0aW9uID09PSAnYWRkJyl7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1BpcGVJZCA9IHV1aWQoKTtcclxuICAgICAgICAgICAgY29uc3QgYWRkSWQgPSB1dWlkKCk7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgIGFkZDoge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24uYWRkLFxyXG4gICAgICAgICAgICAgICAgICAgIFthZGRJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6ICdwaXBlJywgaWQ6bmV3UGlwZUlkfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwaXBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIFtuZXdQaXBlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgW3BpcGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0udHJhbnNmb3JtYXRpb25zLmNvbmNhdCh7cmVmOiAnYWRkJywgaWQ6YWRkSWR9KVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfX0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRyYW5zZm9ybWF0aW9uID09PSAnc3VidHJhY3QnKXtcclxuICAgICAgICAgICAgY29uc3QgbmV3UGlwZUlkID0gdXVpZCgpO1xyXG4gICAgICAgICAgICBjb25zdCBzdWJ0cmFjdElkID0gdXVpZCgpO1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICBzdWJ0cmFjdDoge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24uc3VidHJhY3QsXHJcbiAgICAgICAgICAgICAgICAgICAgW3N1YnRyYWN0SWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7cmVmOiAncGlwZScsIGlkOm5ld1BpcGVJZH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcGlwZToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZSxcclxuICAgICAgICAgICAgICAgICAgICBbbmV3UGlwZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogW11cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFtwaXBlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IHN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLnRyYW5zZm9ybWF0aW9ucy5jb25jYXQoe3JlZjogJ3N1YnRyYWN0JywgaWQ6c3VidHJhY3RJZH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9fSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBSRVNFVF9BUFBfU1RBVEUoKSB7XHJcbiAgICAgICAgYXBwLnNldEN1cnJlbnRTdGF0ZShhcHAuY3JlYXRlRGVmYXVsdFN0YXRlKCkpXHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBldmVudFN0YWNrOiBbXX0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBSRVNFVF9BUFBfREVGSU5JVElPTigpIHtcclxuICAgICAgICBpZihzdGF0ZS5kZWZpbml0aW9uICE9PSBhcHBEZWZpbml0aW9uKXtcclxuICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7Li4uYXBwRGVmaW5pdGlvbn19KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIEZVTExfU0NSRUVOX0NMSUNLRUQodmFsdWUpIHtcclxuICAgICAgICBpZih2YWx1ZSAhPT0gc3RhdGUuZnVsbFNjcmVlbil7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZnVsbFNjcmVlbjogdmFsdWV9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBib3hJY29uID0gaCgnc3ZnJywge1xyXG4gICAgICAgICAgICBhdHRyczoge3dpZHRoOiAxNCwgaGVpZ2h0OiAxNX0sXHJcbiAgICAgICAgICAgIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInLCBwYWRkaW5nOiAnMCA3cHggMCAwJ30sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIGgoJ3JlY3QnLCB7YXR0cnM6IHt4OiAyLCB5OiAyLCB3aWR0aDogMTIsIGhlaWdodDogMTIsIGZpbGw6ICdub25lJywgdHJhbnNpdGlvbjogJ2FsbCAwLjJzJywgc3Ryb2tlOiAnY3VycmVudGNvbG9yJywgJ3N0cm9rZS13aWR0aCc6ICcyJ319KSxcclxuICAgICAgICBdKVxyXG4gICAgY29uc3QgaWZJY29uID0gaCgnc3ZnJywge1xyXG4gICAgICAgIGF0dHJzOiB7d2lkdGg6IDE0LCBoZWlnaHQ6IDE0fSxcclxuICAgICAgICBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJywgcGFkZGluZzogJzAgN3B4IDAgMCd9LFxyXG4gICAgfSwgW1xyXG4gICAgICAgIGgoJ3RleHQnLCB7YXR0cnM6IHsgeDozLCB5OjE0LCBmaWxsOiAnY3VycmVudGNvbG9yJ319LCAnPycpLFxyXG4gICAgXSlcclxuICAgIGNvbnN0IG51bWJlckljb24gPSBoKCdzdmcnLCB7XHJcbiAgICAgICAgYXR0cnM6IHt3aWR0aDogMTQsIGhlaWdodDogMTR9LFxyXG4gICAgICAgIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInLCBwYWRkaW5nOiAnMCA3cHggMCAwJ30sXHJcbiAgICB9LCBbXHJcbiAgICAgICAgaCgndGV4dCcsIHthdHRyczogeyB4OjAsIHk6MTQsIGZpbGw6ICdjdXJyZW50Y29sb3InfX0sICfihJYnKSxcclxuICAgIF0pXHJcbiAgICBjb25zdCBsaXN0SWNvbiA9IGgoJ3N2ZycsIHtcclxuICAgICAgICAgICAgYXR0cnM6IHt3aWR0aDogMTQsIGhlaWdodDogMTR9LFxyXG4gICAgICAgICAgICBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJywgcGFkZGluZzogJzAgN3B4IDAgMCd9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBoKCdjaXJjbGUnLCB7YXR0cnM6IHtyOiAyLCBjeDogMiwgY3k6IDIsIHRyYW5zaXRpb246ICdhbGwgMC4ycycsIGZpbGw6ICdjdXJyZW50Y29sb3InLH19KSxcclxuICAgICAgICAgICAgaCgncmVjdCcsIHthdHRyczoge3g6IDYsIHk6IDEsIHdpZHRoOiA4LCB0cmFuc2l0aW9uOiAnYWxsIDAuMnMnLCBoZWlnaHQ6IDIsIGZpbGw6ICdjdXJyZW50Y29sb3InLH19KSxcclxuICAgICAgICAgICAgaCgnY2lyY2xlJywge2F0dHJzOiB7cjogMiwgY3g6IDIsIGN5OiA3LCB0cmFuc2l0aW9uOiAnYWxsIDAuMnMnLCBmaWxsOiAnY3VycmVudGNvbG9yJyx9fSksXHJcbiAgICAgICAgICAgIGgoJ3JlY3QnLCB7YXR0cnM6IHt4OiA2LCB5OiA2LCB3aWR0aDogOCwgdHJhbnNpdGlvbjogJ2FsbCAwLjJzJywgaGVpZ2h0OiAyLCBmaWxsOiAnY3VycmVudGNvbG9yJyx9fSksXHJcbiAgICAgICAgICAgIGgoJ2NpcmNsZScsIHthdHRyczoge3I6IDIsIGN4OiAyLCBjeTogMTIsIHRyYW5zaXRpb246ICdhbGwgMC4ycycsIGZpbGw6ICdjdXJyZW50Y29sb3InLH19KSxcclxuICAgICAgICAgICAgaCgncmVjdCcsIHthdHRyczoge3g6IDYsIHk6IDExLCB3aWR0aDogOCwgdHJhbnNpdGlvbjogJ2FsbCAwLjJzJywgaGVpZ2h0OiAyLCBmaWxsOidjdXJyZW50Y29sb3InLH19KSxcclxuICAgICAgICBdKVxyXG4gICAgY29uc3QgaW5wdXRJY29uID0gaCgnc3ZnJywge1xyXG4gICAgICAgICAgICBhdHRyczoge3ZpZXdCb3g6ICcwIDAgMTYgMTYnLCB3aWR0aDogMTQsIGhlaWdodDogMTR9LFxyXG4gICAgICAgICAgICBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJywgcGFkZGluZzogJzAgN3B4IDAgMCd9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBoKCdwYXRoJywge2F0dHJzOiB7ZDogJ00gMTUsMiAxMSwyIEMgMTAuNDQ3LDIgMTAsMS41NTIgMTAsMSAxMCwwLjQ0OCAxMC40NDcsMCAxMSwwIGwgNCwwIGMgMC41NTMsMCAxLDAuNDQ4IDEsMSAwLDAuNTUyIC0wLjQ0NywxIC0xLDEgeiBtIC0yLDE0IGMgLTAuNTUzLDAgLTEsLTAuNDQ3IC0xLC0xIEwgMTIsMSBjIDAsLTAuNTUyIDAuNDQ3LC0xIDEsLTEgMC41NTMsMCAxLDAuNDQ4IDEsMSBsIDAsMTQgYyAwLDAuNTUzIC0wLjQ0NywxIC0xLDEgeiBtIDIsMCAtNCwwIGMgLTAuNTUzLDAgLTEsLTAuNDQ3IC0xLC0xIDAsLTAuNTUzIDAuNDQ3LC0xIDEsLTEgbCA0LDAgYyAwLjU1MywwIDEsMC40NDcgMSwxIDAsMC41NTMgLTAuNDQ3LDEgLTEsMSB6JywgZmlsbDonY3VycmVudGNvbG9yJ319KSxcclxuICAgICAgICAgICAgaCgncGF0aCcsIHthdHRyczoge2Q6ICdNIDkuODExNDgyNyw0LjIzNjAzOTMgQyA5LjY1NDczNTcsNC41ODY1OTA2IDkuMzAzOTkzMyw0LjgyOTU4NTQgOC44OTU3MjMzLDQuODI4ODY4NCBMIDEuMjk2ODkyNiw0LjgxMTU0MDQgMS4zMTY5NDM2LDIuODA2NDQ3IDguOTAwNjM3NywyLjgyODY0MiBjIDAuNTUyNDQ4LDAuMDAxNjUgMC45OTkzMDc0LDAuNDUwMTIyMyAwLjk5NzY1NjQsMS4wMDI1Njk4IC0yLjFlLTUsMC4xNDQ1ODU2IC0wLjAzMTMsMC4yODA2NzM0IC0wLjA4NjgxLDAuNDA0ODI3IHonLCBmaWxsOiAnY3VycmVudGNvbG9yJ319KSxcclxuICAgICAgICAgICAgaCgncGF0aCcsIHthdHRyczoge2Q6ICdtIDkuODExNDgyNywxMS43Mzg1NjIgYyAtMC4xNTY3NDcsMC4zNTA1NTEgLTAuNTA3NDg5NCwwLjU5MzU0NiAtMC45MTU3NTk0LDAuNTkyODI5IGwgLTcuNTk4ODMwNywtMC4wMTczMyAwLjAyMDA1MSwtMi4wMDUwOTMgNy41ODM2OTQxLDAuMDIyMTkgYyAwLjU1MjQ0OCwwLjAwMTYgMC45OTkzMDc0LDAuNDUwMTIyIDAuOTk3NjU2NCwxLjAwMjU3IC0yLjFlLTUsMC4xNDQ1ODUgLTAuMDMxMywwLjI4MDY3MyAtMC4wODY4MSwwLjQwNDgyNyB6JywgZmlsbDogJ2N1cnJlbnRjb2xvcid9fSksXHJcbiAgICAgICAgICAgIGgoJ3BhdGgnLCB7YXR0cnM6IHtkOiAnbSAxLjI5NDA1ODMsMTIuMjM5ODM2IDAuMDE3MDQsLTkuNDQ1MDk0NyAxLjk3MTQ4NTIsMC4wMjQ5MjMgLTAuMDIxODE4LDkuNDI2Mjc5NyB6JywgZmlsbDogJ2N1cnJlbnRjb2xvcid9fSksXHJcbiAgICAgICAgXSlcclxuICAgIGNvbnN0IHRleHRJY29uID0gaCgnc3ZnJywge1xyXG4gICAgICAgICAgICBhdHRyczoge3ZpZXdCb3g6ICcwIDAgMzAwIDMwMCcsIHdpZHRoOiAxNCwgaGVpZ2h0OiAxNH0sXHJcbiAgICAgICAgICAgIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInLCBwYWRkaW5nOiAnMCA3cHggMCAwJ30sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIGgoJ3BhdGgnLCB7YXR0cnM6IHtkOiAnTSAwIDAgTCAwIDg1LjgxMjUgTCAyNy4wMzEyNSA4NS44MTI1IEMgMzYuNjE3Nzg2IDQ0LjM0NjMxNiA2Ny44NzY1NzkgNDIuMTc5NzkzIDEwNi45MDYyNSA0Mi41OTM3NSBMIDEwNi45MDYyNSAyMjguMzc1IEMgMTA3LjMxMTAxIDI3OS4wOTY0MSA5OC45MDgzODYgMjc3LjMzNjAyIDYyLjEyNSAyNzcuNSBMIDYyLjEyNSAyOTkuNTYyNSBMIDE0OSAyOTkuNTYyNSBMIDE1MC4wMzEyNSAyOTkuNTYyNSBMIDIzNi45MDYyNSAyOTkuNTYyNSBMIDIzNi45MDYyNSAyNzcuNSBDIDIwMC4xMjI4NiAyNzcuMzM2IDE5MS43MjAyNCAyNzkuMDk2MzkgMTkyLjEyNSAyMjguMzc1IEwgMTkyLjEyNSA0Mi41OTM3NSBDIDIzMS4xNTQ2NyA0Mi4xNzk3NSAyNjIuNDEzNDYgNDQuMzQ2MzA0IDI3MiA4NS44MTI1IEwgMjk5LjAzMTI1IDg1LjgxMjUgTCAyOTkuMDMxMjUgMCBMIDE1MC4wMzEyNSAwIEwgMTQ5IDAgTCAwIDAgeicsIGZpbGw6ICdjdXJyZW50Y29sb3InfX0pXHJcbiAgICAgICAgXSlcclxuICAgIGNvbnN0IGZvbGRlckljb24gPSBoKCdzdmcnLCB7XHJcbiAgICAgICAgICAgIGF0dHJzOiB7dmlld0JveDogJzAgMCAyNCAyNCcsIHdpZHRoOiAxNCwgaGVpZ2h0OiAxNCwgZmlsbDogJ2N1cnJlbnRjb2xvcid9LFxyXG4gICAgICAgICAgICBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJywgcGFkZGluZzogJzAgN3B4IDAgMCd9LFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgW1xyXG4gICAgICAgICAgICBoKCdwYXRoJywge2F0dHJzOiB7ZDogJ00xMCA0SDRjLTEuMSAwLTEuOTkuOS0xLjk5IDJMMiAxOGMwIDEuMS45IDIgMiAyaDE2YzEuMSAwIDItLjkgMi0yVjhjMC0xLjEtLjktMi0yLTJoLThsLTItMnonfX0pLFxyXG4gICAgICAgICAgICBoKCdwYXRoJywge2F0dHJzOiB7ZDogJ00wIDBoMjR2MjRIMHonLCBmaWxsOlwibm9uZVwifX0pLFxyXG4gICAgICAgIF0pXHJcblxyXG4gICAgZnVuY3Rpb24gcmVuZGVyKCkge1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRSdW5uaW5nU3RhdGUgPSBhcHAuZ2V0Q3VycmVudFN0YXRlKClcclxuICAgICAgICBjb25zdCBkcmFnQ29tcG9uZW50TGVmdCA9IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgIG1vdXNlZG93bjogW1dJRFRIX0RSQUdHRUQsICdlZGl0b3JMZWZ0V2lkdGgnXSxcclxuICAgICAgICAgICAgICAgIHRvdWNoc3RhcnQ6IFtXSURUSF9EUkFHR0VELCAnZWRpdG9yTGVmdFdpZHRoJ10sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgICAgIHJpZ2h0OiAnMCcsXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGVYKDEwMCUpJyxcclxuICAgICAgICAgICAgICAgIHRvcDogJzAnLFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6ICcxMHB4JyxcclxuICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMWVtJyxcclxuICAgICAgICAgICAgICAgIG9wYWNpdHk6ICcwJyxcclxuICAgICAgICAgICAgICAgIGN1cnNvcjogJ2NvbC1yZXNpemUnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgY29uc3QgZHJhZ0NvbXBvbmVudFJpZ2h0ID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgbW91c2Vkb3duOiBbV0lEVEhfRFJBR0dFRCwgJ2VkaXRvclJpZ2h0V2lkdGgnXSxcclxuICAgICAgICAgICAgICAgIHRvdWNoc3RhcnQ6IFtXSURUSF9EUkFHR0VELCAnZWRpdG9yUmlnaHRXaWR0aCddLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICBsZWZ0OiAnMCcsXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGVYKC0xMDAlKScsXHJcbiAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAnMTBweCcsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogJzFlbScsXHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAnMCcsXHJcbiAgICAgICAgICAgICAgICBjdXJzb3I6ICdjb2wtcmVzaXplJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KVxyXG4gICAgICAgIGNvbnN0IGRyYWdTdWJDb21wb25lbnQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICBtb3VzZWRvd246IFtXSURUSF9EUkFHR0VELCAnc3ViRWRpdG9yV2lkdGgnXSxcclxuICAgICAgICAgICAgICAgIHRvdWNoc3RhcnQ6IFtXSURUSF9EUkFHR0VELCAnc3ViRWRpdG9yV2lkdGgnXSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICAgICAgbGVmdDogJzJweCcsXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGVYKC0xMDAlKScsXHJcbiAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAnMTBweCcsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogJzFlbScsXHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICAgICAgY3Vyc29yOiAnY29sLXJlc2l6ZScsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZW1iZXJFZGl0b3IocmVmLCB0eXBlKXtcclxuICAgICAgICAgICAgY29uc3QgcGlwZSA9IHN0YXRlLmRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gbGlzdFRyYW5zZm9ybWF0aW9ucyh0cmFuc2Zvcm1hdGlvbnMsIHRyYW5zVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybWF0aW9ucy5tYXAoKHRyYW5zUmVmLCBpbmRleCk9PntcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1lciA9IHN0YXRlLmRlZmluaXRpb25bdHJhbnNSZWYucmVmXVt0cmFuc1JlZi5pZF1cclxuICAgICAgICAgICAgICAgICAgICAvLyBpZiAodHJhbnNSZWYucmVmID09PSAnZXF1YWwnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIHJldHVybiBoKCdkaXYnLCB7fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7Y29sb3I6ICcjYmRiZGJkJywgY3Vyc29yOiAnZGVmYXVsdCcsIGRpc3BsYXk6J2ZsZXgnfX0sIFtoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnfX0sIHRyYW5zUmVmLnJlZiksIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCd9fSwgdHJhbnNUeXBlKV0pLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgZW1iZXJFZGl0b3IodHJhbnNmb3JtZXIudmFsdWUsIHR5cGUpXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc1JlZi5yZWYgPT09ICdhZGQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge2tleTogaW5kZXgsIHN0eWxlOiB7Y29sb3I6ICcjYmRiZGJkJywgY3Vyc29yOiAnZGVmYXVsdCcsIGRpc3BsYXk6J2ZsZXgnfX0sIFtoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnfX0sIHRyYW5zUmVmLnJlZiksIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCcsIGNvbG9yOiB0cmFuc2Zvcm1hdGlvbnMubGVuZ3RoLTEgIT09IGluZGV4ID8gJyNiZGJkYmQnOiB0cmFuc1R5cGUgPT09IHR5cGUgPyAnZ3JlZW4nOiAncmVkJ319LCAnbnVtYmVyJyldKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmdMZWZ0OiAnMTVweCd9fSwgW2VtYmVyRWRpdG9yKHRyYW5zZm9ybWVyLnZhbHVlLCB0cmFuc1R5cGUpXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zUmVmLnJlZiA9PT0gJ3N1YnRyYWN0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge30sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtrZXk6IGluZGV4LCBzdHlsZToge2NvbG9yOiAnI2JkYmRiZCcsIGN1cnNvcjogJ2RlZmF1bHQnLCBkaXNwbGF5OidmbGV4J319LCBbaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJ319LCB0cmFuc1JlZi5yZWYpLCBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAnLCBjb2xvcjogdHJhbnNmb3JtYXRpb25zLmxlbmd0aC0xICE9PSBpbmRleCA/ICcjYmRiZGJkJzogdHJhbnNUeXBlID09PSB0eXBlID8gJ2dyZWVuJzogJ3JlZCd9fSwgJ251bWJlcicpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nTGVmdDogJzE1cHgnfX0sIFtlbWJlckVkaXRvcih0cmFuc2Zvcm1lci52YWx1ZSwgdHJhbnNUeXBlKV0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmICh0cmFuc1JlZi5yZWYgPT09ICdicmFuY2gnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIGlmKHJlc29sdmUodHJhbnNmb3JtZXIucHJlZGljYXRlKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICB2YWx1ZSA9IHRyYW5zZm9ybVZhbHVlKHZhbHVlLCB0cmFuc2Zvcm1lci50aGVuKVxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgdmFsdWUgPSB0cmFuc2Zvcm1WYWx1ZSh2YWx1ZSwgdHJhbnNmb3JtZXIuZWxzZSlcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNSZWYucmVmID09PSAnam9pbicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHt9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtjb2xvcjogJyNiZGJkYmQnLCBjdXJzb3I6ICdkZWZhdWx0JywgZGlzcGxheTonZmxleCd9fSwgW2goJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMSd9fSwgdHJhbnNSZWYucmVmKSwgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwJywgY29sb3I6IHRyYW5zZm9ybWF0aW9ucy5sZW5ndGgtMSAhPT0gaW5kZXggPyAnI2JkYmRiZCc6IHRyYW5zVHlwZSA9PT0gdHlwZSA/ICdncmVlbic6ICdyZWQnfX0sICd0ZXh0JyldKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmdMZWZ0OiAnMTVweCd9fSwgW2VtYmVyRWRpdG9yKHRyYW5zZm9ybWVyLnZhbHVlLCB0cmFuc1R5cGUpXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zUmVmLnJlZiA9PT0gJ3RvVXBwZXJDYXNlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge30sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2N1cnNvcjogJ2RlZmF1bHQnLCBkaXNwbGF5OidmbGV4J319LCBbaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJywgY29sb3I6ICcjYmRiZGJkJ319LCB0cmFuc1JlZi5yZWYpLCBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAnLCBjb2xvcjogdHJhbnNmb3JtYXRpb25zLmxlbmd0aC0xICE9PSBpbmRleCA/ICcjYmRiZGJkJzogdHJhbnNUeXBlID09PSB0eXBlID8gJ2dyZWVuJzogJ3JlZCd9fSwgJ3RleHQnKV0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNSZWYucmVmID09PSAndG9Mb3dlckNhc2UnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7Y3Vyc29yOiAnZGVmYXVsdCcsIGRpc3BsYXk6J2ZsZXgnfX0sIFtoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnLCBjb2xvcjogJyNiZGJkYmQnfX0sIHRyYW5zUmVmLnJlZiksIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCcsIGNvbG9yOiB0cmFuc2Zvcm1hdGlvbnMubGVuZ3RoLTEgIT09IGluZGV4ID8gJyNiZGJkYmQnOiB0cmFuc1R5cGUgPT09IHR5cGUgPyAnZ3JlZW4nOiAncmVkJ319LCAndGV4dCcpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc1JlZi5yZWYgPT09ICd0b1RleHQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7Y3Vyc29yOiAnZGVmYXVsdCcsIGRpc3BsYXk6J2ZsZXgnfX0sIFtoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnLCBjb2xvcjogJyNiZGJkYmQnfX0sIHRyYW5zUmVmLnJlZiksIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCcsIGNvbG9yOiB0cmFuc2Zvcm1hdGlvbnMubGVuZ3RoLTEgIT09IGluZGV4ID8gJyNiZGJkYmQnOiB0cmFuc1R5cGUgPT09IHR5cGUgPyAnZ3JlZW4nOiAncmVkJ319LCAndGV4dCcpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gZ2VuVHJhbnNmb3JtYXRvcnModHlwZSkge1xyXG4gICAgICAgICAgICAgICAgaWYodHlwZSA9PT0gJ3RleHQnKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nOiAnNXB4IDEwcHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgYm9yZGVyUmFkaXVzOiAnMTBweCcsIG1hcmdpbjogJzVweCcsIGN1cnNvcjogJ3BvaW50ZXInLCBib3JkZXI6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPyAnMnB4IHNvbGlkIHdoaXRlJyA6ICcycHggc29saWQgI2JkYmRiZCcsIGNvbG9yOiBzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID8gJ3doaXRlJyA6ICcjYmRiZGJkJyx9LCBvbjoge2NsaWNrOiBbQ0hBTkdFX1BJUEVfVkFMVUVfVE9fU1RBVEUsIHJlZi5pZF19fSwgJ2NoYW5nZSB0byBzdGF0ZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nOiAnNXB4IDEwcHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgYm9yZGVyUmFkaXVzOiAnMTBweCcsIG1hcmdpbjogJzVweCcsIGN1cnNvcjogJ3BvaW50ZXInLCBib3JkZXI6ICcycHggc29saWQgd2hpdGUnfSwgb246IHtjbGljazogW0FERF9UUkFOU0ZPUk1BVElPTiwgcmVmLmlkLCAnam9pbiddfX0sICdqb2luJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmc6ICc1cHggMTBweCcsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCBib3JkZXJSYWRpdXM6ICcxMHB4JywgbWFyZ2luOiAnNXB4JywgY3Vyc29yOiAncG9pbnRlcicsIGJvcmRlcjogJzJweCBzb2xpZCB3aGl0ZSd9LCBvbjoge2NsaWNrOiBbQUREX1RSQU5TRk9STUFUSU9OLCByZWYuaWQsICd0b1VwcGVyQ2FzZSddfX0sICd0byBVcHBlciBjYXNlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmc6ICc1cHggMTBweCcsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCBib3JkZXJSYWRpdXM6ICcxMHB4JywgbWFyZ2luOiAnNXB4JywgY3Vyc29yOiAncG9pbnRlcicsIGJvcmRlcjogJzJweCBzb2xpZCB3aGl0ZSd9LCBvbjoge2NsaWNrOiBbQUREX1RSQU5TRk9STUFUSU9OLCByZWYuaWQsICd0b0xvd2VyQ2FzZSddfX0sICd0byBMb3dlciBjYXNlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYodHlwZSA9PT0gJ251bWJlcicpe1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmc6ICc1cHggMTBweCcsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCBib3JkZXJSYWRpdXM6ICcxMHB4JywgbWFyZ2luOiAnNXB4JywgY3Vyc29yOiAncG9pbnRlcicsIGJvcmRlcjogc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA/ICcycHggc29saWQgd2hpdGUnIDogJzJweCBzb2xpZCAjYmRiZGJkJywgY29sb3I6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgID8gJ3doaXRlJyA6ICcjYmRiZGJkJyx9LCBvbjoge2NsaWNrOiBbQ0hBTkdFX1BJUEVfVkFMVUVfVE9fU1RBVEUsIHJlZi5pZF19fSwgJ2NoYW5nZSB0byBzdGF0ZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nOiAnNXB4IDEwcHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgYm9yZGVyUmFkaXVzOiAnMTBweCcsIG1hcmdpbjogJzVweCcsIGN1cnNvcjogJ3BvaW50ZXInLCBib3JkZXI6ICcycHggc29saWQgd2hpdGUnfSwgb246IHtjbGljazogW0FERF9UUkFOU0ZPUk1BVElPTiwgcmVmLmlkLCAndG9UZXh0J119fSwgJ3RvIHRleHQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZzogJzVweCAxMHB4JywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsIGJvcmRlclJhZGl1czogJzEwcHgnLCBtYXJnaW46ICc1cHgnLCBjdXJzb3I6ICdwb2ludGVyJywgYm9yZGVyOiAnMnB4IHNvbGlkIHdoaXRlJ30sIG9uOiB7Y2xpY2s6IFtBRERfVFJBTlNGT1JNQVRJT04sIHJlZi5pZCwgJ2FkZCddfX0sICdhZGQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZzogJzVweCAxMHB4JywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsIGJvcmRlclJhZGl1czogJzEwcHgnLCBtYXJnaW46ICc1cHgnLCBjdXJzb3I6ICdwb2ludGVyJywgYm9yZGVyOiAnMnB4IHNvbGlkIHdoaXRlJ30sIG9uOiB7Y2xpY2s6IFtBRERfVFJBTlNGT1JNQVRJT04sIHJlZi5pZCwgJ3N1YnRyYWN0J119fSwgJ3N1YnRyYWN0JyksXHJcbiAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcGlwZS52YWx1ZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCBbaCgnZGl2Jywge3N0eWxlOntkaXNwbGF5OidmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcid9LCBvbjoge2NsaWNrOiBbU0VMRUNUX1BJUEUsIHJlZi5pZF19fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2lucHV0Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZTogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW46ICAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0RGVjb3JhdGlvbjogJ3VuZGVybGluZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogW0NIQU5HRV9TVEFUSUNfVkFMVUUsIHJlZiwgJ3ZhbHVlJywgJ3RleHQnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXZlUHJvcHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcGlwZS52YWx1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcwJywgY3Vyc29yOiAnZGVmYXVsdCcsIGNvbG9yOiBwaXBlLnRyYW5zZm9ybWF0aW9ucy5sZW5ndGggPiAwID8gJyNiZGJkYmQnOiB0eXBlID09PSAndGV4dCcgPyAnZ3JlZW4nOiAncmVkJ319LCAndGV4dCcpXHJcbiAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nTGVmdDogJzE1cHgnfX0sIGxpc3RUcmFuc2Zvcm1hdGlvbnMocGlwZS50cmFuc2Zvcm1hdGlvbnMsIHBpcGUudHlwZSkpLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHN0YXRlLnNlbGVjdGVkUGlwZUlkID09PSByZWYuaWQgPyBnZW5UcmFuc2Zvcm1hdG9ycygndGV4dCcpOiBbXSlcclxuICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghaXNOYU4ocGFyc2VGbG9hdChOdW1iZXIocGlwZS52YWx1ZSkpKSAmJiBpc0Zpbml0ZShOdW1iZXIocGlwZS52YWx1ZSkpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2JywgW2goJ2RpdicsIHtzdHlsZTp7ZGlzcGxheTonZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInfSwgb246IHtjbGljazogW1NFTEVDVF9QSVBFLCByZWYuaWRdfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICBoKCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzOiB7dHlwZTonbnVtYmVyJ30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbjogICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHREZWNvcmF0aW9uOiAndW5kZXJsaW5lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBbQ0hBTkdFX1NUQVRJQ19WQUxVRSwgcmVmLCAndmFsdWUnLCAnbnVtYmVyJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGl2ZVByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IE51bWJlcihwaXBlLnZhbHVlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcwJywgY3Vyc29yOiAnZGVmYXVsdCcsIGNvbG9yOiBwaXBlLnRyYW5zZm9ybWF0aW9ucy5sZW5ndGggPiAwID8gJyNiZGJkYmQnOiB0eXBlID09PSAnbnVtYmVyJyA/ICdncmVlbic6ICdyZWQnfX0sICdudW1iZXInKVxyXG4gICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ0xlZnQ6ICcxNXB4J319LCBsaXN0VHJhbnNmb3JtYXRpb25zKHBpcGUudHJhbnNmb3JtYXRpb25zLCBwaXBlLnR5cGUpKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCBzdGF0ZS5zZWxlY3RlZFBpcGVJZCA9PT0gcmVmLmlkID8gZ2VuVHJhbnNmb3JtYXRvcnMoJ251bWJlcicpOiBbXSlcclxuICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKHBpcGUudmFsdWUucmVmID09PSAnc3RhdGUnKXtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRpc3BsU3RhdGUgPSBzdGF0ZS5kZWZpbml0aW9uW3BpcGUudmFsdWUucmVmXVtwaXBlLnZhbHVlLmlkXVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIFtoKCdkaXYnLCB7c3R5bGU6e2Rpc3BsYXk6J2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJ30sIG9uOiB7Y2xpY2s6IFtTRUxFQ1RfUElQRSwgcmVmLmlkXX19LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzEnfX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtoKCdkaXYnLHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJywgY29sb3I6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHBpcGUudmFsdWUuaWQgPyAnI2VhYjY1Yyc6ICd3aGl0ZScsIHBhZGRpbmc6ICcycHggNXB4JywgbWFyZ2luOiAnM3B4IDNweCAwIDAnLCBib3JkZXI6ICcycHggc29saWQgJyArIChzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBwaXBlLnZhbHVlLmlkID8gJyNlYWI2NWMnOiAnd2hpdGUnKSwgYm9yZGVyUmFkaXVzOiAnMTBweCcsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbjoge2NsaWNrOiBbU1RBVEVfTk9ERV9TRUxFQ1RFRCwgcGlwZS52YWx1ZS5pZF19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW2Rpc3BsU3RhdGUudGl0bGVdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtmbGV4OiAnMCcsIGN1cnNvcjogJ2RlZmF1bHQnLCBjb2xvcjogcGlwZS50cmFuc2Zvcm1hdGlvbnMubGVuZ3RoID4gMCA/ICcjYmRiZGJkJzogZGlzcGxTdGF0ZS50eXBlID09PSB0eXBlID8gJ2dyZWVuJzogJ3JlZCd9fSwgZGlzcGxTdGF0ZS50eXBlKVxyXG4gICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ0xlZnQ6ICcxNXB4J319LCBsaXN0VHJhbnNmb3JtYXRpb25zKHBpcGUudHJhbnNmb3JtYXRpb25zLCBwaXBlLnR5cGUpKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCBzdGF0ZS5zZWxlY3RlZFBpcGVJZCA9PT0gcmVmLmlkID8gcGlwZS50cmFuc2Zvcm1hdGlvbnMubGVuZ3RoID09PSAwID8gZ2VuVHJhbnNmb3JtYXRvcnMoZGlzcGxTdGF0ZS50eXBlKTogcGlwZS50cmFuc2Zvcm1hdGlvbnNbcGlwZS50cmFuc2Zvcm1hdGlvbnMubGVuZ3RoLTFdLnJlZiA9PT0gJ2FkZCcgfHwgcGlwZS50cmFuc2Zvcm1hdGlvbnNbcGlwZS50cmFuc2Zvcm1hdGlvbnMubGVuZ3RoLTFdLnJlZiA9PT0gJ3N1YnRyYWN0Jz8gZ2VuVHJhbnNmb3JtYXRvcnMoJ251bWJlcicpIDogZ2VuVHJhbnNmb3JtYXRvcnMoJ3RleHQnKTogW10pXHJcbiAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHBpcGUudmFsdWUucmVmID09PSAnZXZlbnREYXRhJyl7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudERhdGEgPSBzdGF0ZS5kZWZpbml0aW9uW3BpcGUudmFsdWUucmVmXVtwaXBlLnZhbHVlLmlkXVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIFtoKCdkaXYnLCB7c3R5bGU6e2Rpc3BsYXk6J2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJ30sIG9uOiB7Y2xpY2s6IFtTRUxFQ1RfUElQRSwgcmVmLmlkXX19LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzEnfX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtoKCdkaXYnLHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJywgY29sb3I6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHBpcGUudmFsdWUuaWQgPyAnI2VhYjY1Yyc6ICd3aGl0ZScsIHBhZGRpbmc6ICcycHggNXB4JywgbWFyZ2luOiAnM3B4IDNweCAwIDAnLCBib3JkZXI6ICcycHggc29saWQgJyArIChzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBwaXBlLnZhbHVlLmlkID8gJyNlYWI2NWMnOiAnd2hpdGUnKSwgZGlzcGxheTogJ2lubGluZS1ibG9jayd9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7Y2xpY2s6IFtTVEFURV9OT0RFX1NFTEVDVEVELCBwaXBlLnZhbHVlLmlkXX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbZXZlbnREYXRhLnRpdGxlXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzAnLCBjdXJzb3I6ICdkZWZhdWx0JywgY29sb3I6IHBpcGUudHJhbnNmb3JtYXRpb25zLmxlbmd0aCA+IDAgPyAnI2JkYmRiZCc6IGV2ZW50RGF0YS50eXBlID09PSB0eXBlID8gJ2dyZWVuJzogJ3JlZCd9fSwgZXZlbnREYXRhLnR5cGUpXHJcbiAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nTGVmdDogJzE1cHgnfX0sIGxpc3RUcmFuc2Zvcm1hdGlvbnMocGlwZS50cmFuc2Zvcm1hdGlvbnMsIHBpcGUudHlwZSkpLFxyXG4gICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbGlzdE5hbWVTcGFjZShzdGF0ZUlkKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnROYW1lU3BhY2UgPSBzdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZVtzdGF0ZUlkXVxyXG4gICAgICAgICAgICBmdW5jdGlvbiBlZGl0aW5nTm9kZSgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBoKCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBzdGF0ZUlkID8gJyNlYWI2NWMnOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJ2luc2V0IDAgLTFweCAwIDAgd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbjogICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udDogJ2luaGVyaXQnXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogW0NIQU5HRV9OQU1FU1BBQ0VfVElUTEUsIHN0YXRlSWRdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbGl2ZVByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdXJyZW50TmFtZVNwYWNlLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b2ZvY3VzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pc3RpdGxlZWRpdG9yJzogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoc3RhdGVJZCA9PT0gJ19yb290TmFtZVNwYWNlJyl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2JywgIGN1cnJlbnROYW1lU3BhY2UuY2hpbGRyZW4ubWFwKChyZWYpPT4gcmVmLnJlZiA9PT0gJ3N0YXRlJyA/IGxpc3RTdGF0ZShyZWYuaWQpOiBsaXN0TmFtZVNwYWNlKHJlZi5pZCkpKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGNsb3NlZCA9IHN0YXRlLnZpZXdGb2xkZXJzQ2xvc2VkW3N0YXRlSWRdIHx8IChzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkICE9PSBzdGF0ZUlkICYmIGN1cnJlbnROYW1lU3BhY2UuY2hpbGRyZW4ubGVuZ3RoID09PSAwKVxyXG4gICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3N2ZycsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRyczoge3dpZHRoOiAxMiwgaGVpZ2h0OiAxNn0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcicsIHBhZGRpbmc6ICcwIDVweCcsIHRyYW5zZm9ybTogY2xvc2VkID8gJ3JvdGF0ZSgwZGVnKSc6ICdyb3RhdGUoOTBkZWcpJywgdHJhbnNpdGlvbjogJ2FsbCAwLjJzJ30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpY2s6IFtWSUVXX0ZPTERFUl9DTElDS0VELCBzdGF0ZUlkXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW2goJ3BvbHlnb24nLCB7YXR0cnM6IHtwb2ludHM6ICcxMiw4IDAsMSAzLDggMCwxNSd9LCBzdHlsZToge2ZpbGw6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHN0YXRlSWQgPyAnI2VhYjY1Yyc6ICd3aGl0ZScsIHRyYW5zaXRpb246ICdmaWxsIDAuMnMnfX0pXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLmVkaXRpbmdUaXRsZU5vZGVJZCA9PT0gc3RhdGVJZCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZGl0aW5nTm9kZSgpOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHsgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcid9LCBvbjoge2RibGNsaWNrOiBbRURJVF9WSUVXX05PREVfVElUTEUsIHN0YXRlSWRdfX0sIFtoKCdzcGFuJywge3N0eWxlOiB7Y29sb3I6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHN0YXRlSWQgPyAnI2VhYjY1Yyc6ICd3aGl0ZScsIHRyYW5zaXRpb246ICdjb2xvciAwLjJzJ319LCBjdXJyZW50TmFtZVNwYWNlLnRpdGxlKV0pLFxyXG4gICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZTogeyBkaXNwbGF5OiBjbG9zZWQgPyAnbm9uZSc6ICdibG9jaycsIHBhZGRpbmdMZWZ0OiAnMTBweCcsIHBhZGRpbmdCb3R0b206ICc1cHgnLCB0cmFuc2l0aW9uOiAnYm9yZGVyLWNvbG9yIDAuMnMnfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uY3VycmVudE5hbWVTcGFjZS5jaGlsZHJlbi5tYXAoKHJlZik9PiByZWYucmVmID09PSAnc3RhdGUnID8gbGlzdFN0YXRlKHJlZi5pZCk6IGxpc3ROYW1lU3BhY2UocmVmLmlkKSksXHJcbiAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gbGlzdFN0YXRlKHN0YXRlSWQpIHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudFN0YXRlID0gc3RhdGUuZGVmaW5pdGlvbi5zdGF0ZVtzdGF0ZUlkXVxyXG4gICAgICAgICAgICBmdW5jdGlvbiBlZGl0aW5nTm9kZSgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBoKCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZTogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnNHB4IDdweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udDogJ2luaGVyaXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmxleDogJzAgMCBhdXRvJyxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBbQ0hBTkdFX1NUQVRFX05PREVfVElUTEUsIHN0YXRlSWRdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbGl2ZVByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdXJyZW50U3RhdGUudGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBhdHRyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pc3RpdGxlZWRpdG9yJzogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTRweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2Rpc3BsYXk6ICdmbGV4JywgZmxleFdyYXA6ICd3cmFwJ319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCAwIGF1dG8nLCAgcG9zaXRpb246ICdyZWxhdGl2ZScsIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVooMCknLCBtYXJnaW46ICc3cHggN3B4IDAgMCcsICBib3hTaGFkb3c6ICdpbnNldCAwIDAgMCAycHggJyArIChzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBzdGF0ZUlkID8gJyNlYWI2NWMnOiAnIzgyODI4MicpICwgYmFja2dyb3VuZDogJyM0NDQnLCBwYWRkaW5nOiAnNHB4IDdweCcsfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtvcGFjaXR5OiBzdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQgPT09IHN0YXRlSWQgPyAnMCc6ICcxJywgY29sb3I6ICd3aGl0ZScsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snfSwgb246IHtjbGljazogW1NUQVRFX05PREVfU0VMRUNURUQsIHN0YXRlSWRdLCBkYmxjbGljazogW0VESVRfVklFV19OT0RFX1RJVExFLCBzdGF0ZUlkXX19LCBjdXJyZW50U3RhdGUudGl0bGUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuZWRpdGluZ1RpdGxlTm9kZUlkID09PSBzdGF0ZUlkID8gZWRpdGluZ05vZGUoKTogaCgnc3BhbicpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgKCgpPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm9TdHlsZUlucHV0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBjdXJyZW50UnVubmluZ1N0YXRlW3N0YXRlSWRdICE9PSBzdGF0ZS5kZWZpbml0aW9uLnN0YXRlW3N0YXRlSWRdLmRlZmF1bHRWYWx1ZSA/ICdyZ2IoOTEsIDIwNCwgOTEpJyA6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbGV4OiAnMScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluV2lkdGg6ICc1MHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTBweCA3cHggNHB4IDdweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm94U2hhZG93OiAnaW5zZXQgMCAtMnB4IDAgMCAnICsgKHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHN0YXRlSWQgPyAnI2VhYjY1Yyc6ICcjODI4MjgyJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGN1cnJlbnRTdGF0ZS50eXBlID09PSAndGV4dCcpIHJldHVybiBoKCdpbnB1dCcsIHthdHRyczoge3R5cGU6ICd0ZXh0J30sIGxpdmVQcm9wczoge3ZhbHVlOiBjdXJyZW50UnVubmluZ1N0YXRlW3N0YXRlSWRdfSwgc3R5bGU6IG5vU3R5bGVJbnB1dCwgb246IHtpbnB1dDogW0NIQU5HRV9DVVJSRU5UX1NUQVRFX1RFWFRfVkFMVUUsIHN0YXRlSWRdfX0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihjdXJyZW50U3RhdGUudHlwZSA9PT0gJ251bWJlcicpIHJldHVybiBoKCdpbnB1dCcsIHthdHRyczoge3R5cGU6ICdudW1iZXInfSwgbGl2ZVByb3BzOiB7dmFsdWU6IGN1cnJlbnRSdW5uaW5nU3RhdGVbc3RhdGVJZF19LCBzdHlsZTogbm9TdHlsZUlucHV0LCAgb246IHtpbnB1dDogW0NIQU5HRV9DVVJSRU5UX1NUQVRFX05VTUJFUl9WQUxVRSwgc3RhdGVJZF19fSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGN1cnJlbnRTdGF0ZS50eXBlID09PSAndGFibGUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGFibGUgPSBjdXJyZW50UnVubmluZ1N0YXRlW3N0YXRlSWRdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjODI4MTgzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZsZXg6ICcwIDAgMTAwJSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtkaXNwbGF5OiAnZmxleCd9fSwgIE9iamVjdC5rZXlzKGN1cnJlbnRTdGF0ZS5kZWZpbml0aW9uKS5tYXAoa2V5ID0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcxJywgcGFkZGluZzogJzJweCA1cHgnLCBib3JkZXJCb3R0b206ICcycHggc29saWQgd2hpdGUnfX0sIGtleSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uT2JqZWN0LmtleXModGFibGUpLm1hcChpZCA9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2Rpc3BsYXk6ICdmbGV4J319LCBPYmplY3Qua2V5cyh0YWJsZVtpZF0pLm1hcChrZXkgPT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzEnLCBwYWRkaW5nOiAnMnB4IDVweCd9fSwgdGFibGVbaWRdW2tleV0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSkoKSxcclxuICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBzdGF0ZUlkID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RhdGUubXV0YXRvcnMubWFwKG11dGF0b3JSZWYgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtdXRhdG9yID0gc3RhdGUuZGVmaW5pdGlvblttdXRhdG9yUmVmLnJlZl1bbXV0YXRvclJlZi5pZF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBzdGF0ZS5kZWZpbml0aW9uW211dGF0b3IuZXZlbnQucmVmXVttdXRhdG9yLmV2ZW50LmlkXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbWl0dGVyID0gc3RhdGUuZGVmaW5pdGlvbltldmVudC5lbWl0dGVyLnJlZl1bZXZlbnQuZW1pdHRlci5pZF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNDQ0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdUb3A6ICczcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0JvdHRvbTogJzNweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gZXZlbnQuZW1pdHRlci5pZCA/ICcjNTNCMkVEJzogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICcwLjJzIGFsbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW5XaWR0aDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBvbjoge2NsaWNrOiBbVklFV19OT0RFX1NFTEVDVEVELCBldmVudC5lbWl0dGVyXX19LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAgMCBhdXRvJywgbWFyZ2luOiAnMCAwIDAgNXB4J319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuZW1pdHRlci5yZWYgPT09ICd2Tm9kZUJveCcgPyBib3hJY29uIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuZW1pdHRlci5yZWYgPT09ICd2Tm9kZUxpc3QnID8gbGlzdEljb24gOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuZW1pdHRlci5yZWYgPT09ICd2Tm9kZUxpc3QnID8gaWZJY29uIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudC5lbWl0dGVyLnJlZiA9PT0gJ3ZOb2RlSW5wdXQnID8gaW5wdXRJY29uIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dEljb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnNSA1IGF1dG8nLCBtYXJnaW46ICcwIDVweCAwIDAnLCBtaW5XaWR0aDogJzAnLCBvdmVyZmxvdzogJ2hpZGRlbicsIHdoaXRlU3BhY2U6ICdub3dyYXAnLCB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcyd9fSwgZW1pdHRlci50aXRsZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAgMCBhdXRvJywgbWFyZ2luTGVmdDogJ2F1dG8nLCBtYXJnaW5SaWdodDogJzVweCcsIGNvbG9yOiAnIzViY2M1Yid9fSwgZXZlbnQudHlwZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJyksXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHN0YXRlQ29tcG9uZW50ID0gaCgnZGl2JywgeyBhdHRyczoge2NsYXNzOiAnYmV0dGVyLXNjcm9sbGJhcid9LCBzdHlsZToge292ZXJmbG93OiAnYXV0bycsIGZsZXg6ICcxJywgcGFkZGluZzogJzAgMTBweCd9LCBvbjoge2NsaWNrOiBbVU5TRUxFQ1RfU1RBVEVfTk9ERV19fSwgW2xpc3ROYW1lU3BhY2UoJ19yb290TmFtZVNwYWNlJyldKVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBsaXN0Qm94Tm9kZShub2RlUmVmLCBkZXB0aCkge1xyXG4gICAgICAgICAgICBjb25zdCBub2RlSWQgPSBub2RlUmVmLmlkXHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBzdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlSWRdXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGVkaXRpbmdOb2RlKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2lucHV0Jywge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzUzQjJFRCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICdpbnNldCAwIC0xcHggMCAwICM1M0IyRUQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250OiAnaW5oZXJpdCdcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBbQ0hBTkdFX1ZJRVdfTk9ERV9USVRMRSwgbm9kZVJlZl0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBsaXZlUHJvcHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG5vZGUudGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBhdHRyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvZm9jdXM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLWlzdGl0bGVlZGl0b3InOiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBjbG9zZWQgPSBzdGF0ZS52aWV3Rm9sZGVyc0Nsb3NlZFtub2RlSWRdXHJcbiAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nTGVmdDogZGVwdGggKjIwICsgOCsgJ3B4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM0NDQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJUb3A6ICcycHggc29saWQgIzRkNGQ0ZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTogJzJweCBzb2xpZCAjMzMzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ1RvcDogJzFweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaXRlU3BhY2U6ICdub3dyYXAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nQm90dG9tOiAnM3B4JyxcclxuICAgICAgICAgICAgICAgICAgICB9fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlQm94JyAmJiBub2RlLmNoaWxkcmVuLmxlbmd0aCA+IDAgPyBoKCdzdmcnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHt3aWR0aDogMTIsIGhlaWdodDogMTZ9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInLCBwYWRkaW5nOiAnMCA1cHgnLCB0cmFuc2Zvcm06IGNsb3NlZCA/ICdyb3RhdGUoMGRlZyknOiAncm90YXRlKDkwZGVnKScsIHRyYW5zaXRpb246ICdhbGwgMC4ycycsIG1hcmdpbkxlZnQ6ICctM3B4J30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpY2s6IFtWSUVXX0ZPTERFUl9DTElDS0VELCBub2RlSWRdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbaCgncG9seWdvbicsIHthdHRyczoge3BvaW50czogJzEyLDggMCwxIDMsOCAwLDE1J30sIHN0eWxlOiB7ZmlsbDogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJyM1M0IyRUQnOiAnd2hpdGUnLCB0cmFuc2l0aW9uOiAnZmlsbCAwLjJzJ319KV0pOiBoKCdzcGFuJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtjb2xvcjogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJyM1M0IyRUQnOiAnI2JkYmRiZCd9LCBvbjoge2NsaWNrOiBbVklFV19OT0RFX1NFTEVDVEVELCBub2RlUmVmXX19LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlQm94JyA/IGJveEljb24gOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVSZWYucmVmID09PSAndk5vZGVMaXN0JyA/IGxpc3RJY29uIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWZJY29uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQgPT09IG5vZGVJZCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZGl0aW5nTm9kZSgpOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHsgc3R5bGU6IHtmbGV4OiAnMScsIGN1cnNvcjogJ3BvaW50ZXInLCBjb2xvcjogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJyM1M0IyRUQnOiAnd2hpdGUnLCB0cmFuc2l0aW9uOiAnY29sb3IgMC4ycyd9LCBvbjoge2NsaWNrOiBbVklFV19OT0RFX1NFTEVDVEVELCBub2RlUmVmXSwgZGJsY2xpY2s6IFtFRElUX1ZJRVdfTk9ERV9USVRMRSwgbm9kZUlkXX19LCBub2RlLnRpdGxlKSxcclxuICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IGRpc3BsYXk6IGNsb3NlZCA/ICdub25lJzogJ2Jsb2NrJywgdHJhbnNpdGlvbjogJ2JvcmRlci1jb2xvciAwLjJzJ30sXHJcbiAgICAgICAgICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5ub2RlLmNoaWxkcmVuLm1hcCgocmVmKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVmLnJlZiA9PT0gJ3ZOb2RlVGV4dCcpIHJldHVybiBzaW1wbGVOb2RlKHJlZiwgZGVwdGgrMSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJlZi5yZWYgPT09ICd2Tm9kZUJveCcgfHwgcmVmLnJlZiA9PT0gJ3ZOb2RlTGlzdCcgfHwgcmVmLnJlZiA9PT0gJ3ZOb2RlSWYnKSByZXR1cm4gbGlzdEJveE5vZGUocmVmLCBkZXB0aCsxKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVmLnJlZiA9PT0gJ3ZOb2RlSW5wdXQnKSByZXR1cm4gc2ltcGxlTm9kZShyZWYsIGRlcHRoKzEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIHNpbXBsZU5vZGUobm9kZVJlZiwgZGVwdGgpIHtcclxuICAgICAgICAgICAgY29uc3Qgbm9kZUlkID0gbm9kZVJlZi5pZFxyXG4gICAgICAgICAgICBjb25zdCBub2RlID0gc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZUlkXVxyXG4gICAgICAgICAgICBmdW5jdGlvbiBlZGl0aW5nTm9kZSgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBoKCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyM1M0IyRUQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm94U2hhZG93OiAnaW5zZXQgMCAtMXB4IDAgMCAjNTNCMkVEJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udDogJ2luaGVyaXQnXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogW0NIQU5HRV9WSUVXX05PREVfVElUTEUsIG5vZGVSZWZdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbGl2ZVByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBub2RlLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b2ZvY3VzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pc3RpdGxlZWRpdG9yJzogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdMZWZ0OiBkZXB0aCAqMjAgKyA4ICsncHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzQ0NCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclRvcDogJzJweCBzb2xpZCAjNGQ0ZDRkJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiAnMnB4IHNvbGlkICMzMzMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nVG9wOiAnMXB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpdGVTcGFjZTogJ25vd3JhcCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdCb3R0b206ICczcHgnXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvbjoge2NsaWNrOiBbVklFV19OT0RFX1NFTEVDVEVELCBub2RlUmVmXSwgZGJsY2xpY2s6IFtFRElUX1ZJRVdfTk9ERV9USVRMRSwgbm9kZUlkXX1cclxuICAgICAgICAgICAgICAgIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7Y29sb3I6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJyNiZGJkYmQnfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVJlZi5yZWYgPT09ICd2Tm9kZUlucHV0JyA/IGlucHV0SWNvbiA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0SWNvblxyXG4gICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmVkaXRpbmdUaXRsZU5vZGVJZCA9PT0gbm9kZUlkID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWRpdGluZ05vZGUoKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2NvbG9yOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnIzUzQjJFRCc6ICd3aGl0ZScsIHRyYW5zaXRpb246ICdjb2xvciAwLjJzJ319LCBub2RlLnRpdGxlKSxcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgcHJvcHNDb21wb25lbnQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBzdGF0ZS5zZWxlY3RlZFZpZXdTdWJNZW51ID09PSAncHJvcHMnID8gJyM0ZDRkNGQnOiAnIzNkM2QzZCcsXHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTBweCAwJyxcclxuICAgICAgICAgICAgICAgIGZsZXg6ICcxJyxcclxuICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgIGNsaWNrOiBbU0VMRUNUX1ZJRVdfU1VCTUVOVSwgJ3Byb3BzJ11cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sICdkYXRhJylcclxuICAgICAgICBjb25zdCBzdHlsZUNvbXBvbmVudCA9IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IHN0YXRlLnNlbGVjdGVkVmlld1N1Yk1lbnUgPT09ICdzdHlsZScgPyAnIzRkNGQ0ZCc6ICcjM2QzZDNkJyxcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMHB4IDAnLFxyXG4gICAgICAgICAgICAgICAgZmxleDogJzEnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmlnaHQ6ICcxcHggc29saWQgIzIyMicsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJMZWZ0OiAnMXB4IHNvbGlkICMyMjInLFxyXG4gICAgICAgICAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgY2xpY2s6IFtTRUxFQ1RfVklFV19TVUJNRU5VLCAnc3R5bGUnXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgJ3N0eWxlJylcclxuICAgICAgICBjb25zdCBldmVudHNDb21wb25lbnQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBzdGF0ZS5zZWxlY3RlZFZpZXdTdWJNZW51ID09PSAnZXZlbnRzJyA/ICcjNGQ0ZDRkJzogJyMzZDNkM2QnLFxyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzEwcHggMCcsXHJcbiAgICAgICAgICAgICAgICBmbGV4OiAnMScsXHJcbiAgICAgICAgICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICBjbGljazogW1NFTEVDVF9WSUVXX1NVQk1FTlUsICdldmVudHMnXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgJ2V2ZW50cycpXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdlbmVyYXRlRWRpdE5vZGVDb21wb25lbnQoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHN0eWxlcyA9IFsnYmFja2dyb3VuZCcsICdib3JkZXInLCAnb3V0bGluZScsICdjdXJzb3InLCAnY29sb3InLCAnZGlzcGxheScsICd0b3AnLCAnYm90dG9tJywgJ2xlZnQnLCAncmlnaHQnLCAncG9zaXRpb24nLCAnb3ZlcmZsb3cnLCAnaGVpZ2h0JywgJ3dpZHRoJywgJ2ZvbnQnLCAnZm9udCcsICdtYXJnaW4nLCAncGFkZGluZycsICd1c2VyU2VsZWN0J11cclxuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWROb2RlID0gc3RhdGUuZGVmaW5pdGlvbltzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZl1bc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZF1cclxuICAgICAgICAgICAgY29uc3QgZ2VucHJvcHNTdWJtZW51Q29tcG9uZW50ID0gKCkgPT4gaCgnZGl2JywgWygoKT0+e1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmID09PSAndk5vZGVCb3gnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW5Ub3A6ICcxMDBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyNiZGJkYmQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LCAnbm8gZGF0YSByZXF1aXJlZCcpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZVRleHQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM2NzY3NjcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc1cHggMTBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMTBweCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJ319LCAndGV4dCB2YWx1ZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzAnLCBjdXJzb3I6ICdkZWZhdWx0JywgY29sb3I6ICcjYmRiZGJkJ319LCAndGV4dCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nOiAnNXB4IDEwcHgnfX0sIFtlbWJlckVkaXRvcihzZWxlY3RlZE5vZGUudmFsdWUsICd0ZXh0JyldKVxyXG4gICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZUlucHV0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM2NzY3NjcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc1cHggMTBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMTBweCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJ319LCAnaW5wdXQgdmFsdWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcwJywgY3Vyc29yOiAnZGVmYXVsdCcsIGNvbG9yOiAnI2JkYmRiZCd9fSwgJ3RleHQnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZzogJzVweCAxMHB4J319LCBbZW1iZXJFZGl0b3Ioc2VsZWN0ZWROb2RlLnZhbHVlLCAndGV4dCcpXSlcclxuICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmID09PSAndk5vZGVMaXN0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luVG9wOiAnMTAwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjYmRiZGJkJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgJ1RPRE8gQUREIFBST1BTJylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZiA9PT0gJ3ZOb2RlSWYnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW5Ub3A6ICcxMDBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyNiZGJkYmQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LCAnVE9ETyBBREQgUFJPUFMnKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KSgpXSlcclxuICAgICAgICAgICAgY29uc3QgZ2Vuc3R5bGVTdWJtZW51Q29tcG9uZW50ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRTdHlsZSA9IHN0YXRlLmRlZmluaXRpb24uc3R5bGVbc2VsZWN0ZWROb2RlLnN0eWxlLmlkXVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHthdHRyczoge2NsYXNzOiAnYmV0dGVyLXNjcm9sbGJhcid9LCBzdHlsZToge292ZXJmbG93OiAnYXV0byd9fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLk9iamVjdC5rZXlzKHNlbGVjdGVkU3R5bGUpLm1hcCgoa2V5KSA9PiBoKCdkaXYnLCB7c3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAganVzdGlmeUNvbnRlbnQ6ICdmbGV4LWVuZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIGtleSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2lucHV0Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZTogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICdpbnNldCAwIC0xcHggMCAwIHdoaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzE2MHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW46ICcxMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wczoge3ZhbHVlOiBzZWxlY3RlZFN0eWxlW2tleV19LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb246IHtpbnB1dDogW0NIQU5HRV9TVFlMRSwgc2VsZWN0ZWROb2RlLnN0eWxlLmlkLCBrZXldfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgICAgICAgICBdKSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7fX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoa2V5KSA9PiAhT2JqZWN0LmtleXMoc2VsZWN0ZWRTdHlsZSkuaW5jbHVkZXMoa2V5KSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKGtleSkgPT4gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7Y2xpY2s6IFtBRERfREVGQVVMVF9TVFlMRSwgc2VsZWN0ZWROb2RlLnN0eWxlLmlkLCBrZXldfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzVweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJzNweCBzb2xpZCB3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc1cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW46ICc1cHgnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgJysgJyArIGtleSkpXHJcbiAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBnZW5ldmVudHNTdWJtZW51Q29tcG9uZW50ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IGF2YWlsYWJsZUV2ZW50cyA9IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnb24gY2xpY2snLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWU6ICdjbGljaydcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdkb3VibGUgY2xpY2tlZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZTogJ2RibGNsaWNrJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ21vdXNlIG92ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWU6ICdtb3VzZW92ZXInXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnbW91c2Ugb3V0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lOiAnbW91c2VvdXQnXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZiA9PT0gJ3ZOb2RlSW5wdXQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlRXZlbnRzID0gYXZhaWxhYmxlRXZlbnRzLmNvbmNhdChbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnaW5wdXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lOiAnaW5wdXQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnZm9jdXMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lOiAnZm9jdXMnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnYmx1cicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWU6ICdibHVyJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50RXZlbnRzID0gYXZhaWxhYmxlRXZlbnRzLmZpbHRlcigoZXZlbnQpID0+IHNlbGVjdGVkTm9kZVtldmVudC5wcm9wZXJ0eU5hbWVdKVxyXG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnRzTGVmdCA9IGF2YWlsYWJsZUV2ZW50cy5maWx0ZXIoKGV2ZW50KSA9PiAhc2VsZWN0ZWROb2RlW2V2ZW50LnByb3BlcnR5TmFtZV0pXHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmdUb3A6ICcyMHB4J319LCBldmVudHNMZWZ0Lm1hcCgoZXZlbnQpID0+XHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICczcHggc29saWQgIzViY2M1YicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc1cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnNXB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbjogJzEwcHgnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIG9uOiB7Y2xpY2s6IFtBRERfRVZFTlQsIGV2ZW50LnByb3BlcnR5TmFtZV19XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgJysgJyArIGV2ZW50LmRlc2NyaXB0aW9uKSxcclxuICAgICAgICAgICAgICAgICkuY29uY2F0KGN1cnJlbnRFdmVudHMubGVuZ3RoID9cclxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50RXZlbnRzLm1hcCgoZXZlbnQpID0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2JhY2tncm91bmQ6ICcjNjc2NzY3JywgcGFkZGluZzogJzVweCAxMHB4J319LCBldmVudC5kZXNjcmlwdGlvbiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2NvbG9yIDAuMnMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxNHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzVweCAxMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJveFNoYWRvdzogc3RhdGUuc2VsZWN0ZWRFdmVudElkID09PSBzZWxlY3RlZE5vZGVbZXZlbnQucHJvcGVydHlOYW1lXS5pZCA/ICcjNWJjYzViIDVweCAwIDBweCAwcHggaW5zZXQnIDogJ25vbmUnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGljazogW1NFTEVDVF9FVkVOVCwgc2VsZWN0ZWROb2RlW2V2ZW50LnByb3BlcnR5TmFtZV0uaWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGJsY2xpY2s6IFtFRElUX0VWRU5UX1RJVExFLCBzZWxlY3RlZE5vZGVbZXZlbnQucHJvcGVydHlOYW1lXS5pZF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHt9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAn4oCiICcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQgPT09IHNlbGVjdGVkTm9kZVtldmVudC5wcm9wZXJ0eU5hbWVdLmlkID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZTogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm94U2hhZG93OiAnaW5zZXQgMCAtMXB4IDAgMCB3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW46ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnQ6ICdpbmhlcml0J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IFtDSEFOR0VfRVZFTlRfVElUTEUsIHNlbGVjdGVkTm9kZVtldmVudC5wcm9wZXJ0eU5hbWVdLmlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGl2ZVByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogc3RhdGUuZGVmaW5pdGlvbi5ldmVudFtzZWxlY3RlZE5vZGVbZXZlbnQucHJvcGVydHlOYW1lXS5pZF0udGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvZm9jdXM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pc3RpdGxlZWRpdG9yJzogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHN0YXRlLmRlZmluaXRpb24uZXZlbnRbc2VsZWN0ZWROb2RlW2V2ZW50LnByb3BlcnR5TmFtZV0uaWRdLnRpdGxlXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSkgOlxyXG4gICAgICAgICAgICAgICAgICAgIFtdKSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgZnVsbFZOb2RlID0gc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZUJveCcgfHwgc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZVRleHQnIHx8IHN0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmID09PSAndk5vZGVJbnB1dCdcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6ICctMTVweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlKC0xMDAlLCAwKScsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luUmlnaHQ6ICc4cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvcDogJzUwJScsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnNDkuNSUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzEnLCBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBiYWNrZ3JvdW5kOiAnIzRkNGQ0ZCcsIHdpZHRoOiBzdGF0ZS5zdWJFZGl0b3JXaWR0aCArICdweCcsIGJvcmRlcjogJzNweCBzb2xpZCAjMjIyJ319LFtcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtmbGV4OiAnMCAwIGF1dG8nLH19LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAnZGVmYXVsdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjMjIyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdUb3A6ICcycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0JvdHRvbTogJzVweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyM1M0IyRUQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluV2lkdGg6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCAwIGF1dG8nLCBtYXJnaW46ICcwIDAgMCA1cHgnfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZiA9PT0gJ3ZOb2RlQm94JyA/IGJveEljb24gOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZiA9PT0gJ3ZOb2RlTGlzdCcgPyBsaXN0SWNvbiA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZiA9PT0gJ3ZOb2RlTGlzdCcgPyBpZkljb24gOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmID09PSAndk5vZGVJbnB1dCcgPyBpbnB1dEljb24gOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0SWNvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICc1IDUgYXV0bycsIG1hcmdpbjogJzAgNXB4IDAgMCcsIG1pbldpZHRoOiAnMCcsIG92ZXJmbG93OiAnaGlkZGVuJywgd2hpdGVTcGFjZTogJ25vd3JhcCcsIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJ319LCBzZWxlY3RlZE5vZGUudGl0bGUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwIDAgYXV0bycsIG1hcmdpbkxlZnQ6ICdhdXRvJywgY3Vyc29yOiAncG9pbnRlcicsIG1hcmdpblJpZ2h0OiAnNXB4JywgY29sb3I6ICd3aGl0ZSd9LCBvbjoge2NsaWNrOiBbVU5TRUxFQ1RfVklFV19OT0RFXX19LCAneCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxWTm9kZSA/IGgoJ2RpdicsIHtzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGZsZXg6ICcwIDAgYXV0bycsIGZvbnRGYW1pbHk6IFwiJ0NvbWZvcnRhYScsIHNhbnMtc2VyaWZcIn19LCBbcHJvcHNDb21wb25lbnQsIHN0eWxlQ29tcG9uZW50LCBldmVudHNDb21wb25lbnRdKSA6IGgoJ3NwYW4nKSxcclxuICAgICAgICAgICAgICAgICAgICBkcmFnU3ViQ29tcG9uZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLnNlbGVjdGVkVmlld1N1Yk1lbnUgPT09ICdwcm9wcycgfHwgIWZ1bGxWTm9kZSA/IGdlbnByb3BzU3VibWVudUNvbXBvbmVudCgpOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5zZWxlY3RlZFZpZXdTdWJNZW51ID09PSAnc3R5bGUnID8gZ2Vuc3R5bGVTdWJtZW51Q29tcG9uZW50KCk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5zZWxlY3RlZFZpZXdTdWJNZW51ID09PSAnZXZlbnRzJyA/IGdlbmV2ZW50c1N1Ym1lbnVDb21wb25lbnQoKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywgJ0Vycm9yLCBubyBzdWNoIG1lbnUnKVxyXG4gICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgXSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGFkZFN0YXRlQ29tcG9uZW50ID0gaCgnZGl2Jywge3N0eWxlOiB7IGZsZXg6ICcwIGF1dG8nLCBtYXJnaW5MZWZ0OiBzdGF0ZS5yaWdodE9wZW4gPyAnLTEwcHgnOiAnMCcsIGJvcmRlcjogJzNweCBzb2xpZCAjMjIyJywgYm9yZGVyUmlnaHQ6ICdub25lJywgYmFja2dyb3VuZDogJyMzMzMnLCBoZWlnaHQ6ICc0MHB4JywgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJ319LCBbXHJcbiAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHsgZm9udEZhbWlseTogXCInQ29tZm9ydGFhJywgc2Fucy1zZXJpZlwiLCBmb250U2l6ZTogJzAuOWVtJywgY3Vyc29yOiAncG9pbnRlcicsIHBhZGRpbmc6ICcwIDVweCd9fSwgJ2FkZCBzdGF0ZTogJyksXHJcbiAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtkaXNwbGF5OiAnaW5saW5lLWJsb2NrJ30sIG9uOiB7Y2xpY2s6IFtBRERfU1RBVEUsICdfcm9vdE5hbWVTcGFjZScsICd0ZXh0J119fSwgW3RleHRJY29uXSksXHJcbiAgICAgICAgICAgIGgoJ3NwYW4nLCB7b246IHtjbGljazogW0FERF9TVEFURSwgJ19yb290TmFtZVNwYWNlJywgJ251bWJlciddfX0sIFtudW1iZXJJY29uXSksXHJcbiAgICAgICAgICAgIGgoJ3NwYW4nLCB7b246IHtjbGljazogW0FERF9TVEFURSwgJ19yb290TmFtZVNwYWNlJywgJ2Jvb2xlYW4nXX19LCBbaWZJY29uXSksXHJcbiAgICAgICAgICAgIGgoJ3NwYW4nLCB7b246IHtjbGljazogW0FERF9TVEFURSwgJ19yb290TmFtZVNwYWNlJywgJ3RhYmxlJ119fSwgW2xpc3RJY29uXSksXHJcbiAgICAgICAgICAgIGgoJ3NwYW4nLCB7b246IHtjbGljazogW0FERF9TVEFURSwgJ19yb290TmFtZVNwYWNlJywgJ2ZvbGRlciddfX0sIFtmb2xkZXJJY29uXSksXHJcbiAgICAgICAgXSlcclxuXHJcblxyXG4gICAgICAgIGNvbnN0IGFkZFZpZXdOb2RlQ29tcG9uZW50ID0gaCgnZGl2Jywge3N0eWxlOiB7IGZsZXg6ICcwIGF1dG8nLCBtYXJnaW5MZWZ0OiBzdGF0ZS5yaWdodE9wZW4gPyAnLTEwcHgnOiAnMCcsIGJvcmRlcjogJzNweCBzb2xpZCAjMjIyJywgYm9yZGVyUmlnaHQ6ICdub25lJywgYmFja2dyb3VuZDogJyMzMzMnLCBoZWlnaHQ6ICc0MHB4JywgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJ319LCBbXHJcbiAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHsgZm9udEZhbWlseTogXCInQ29tZm9ydGFhJywgc2Fucy1zZXJpZlwiLCBmb250U2l6ZTogJzAuOWVtJywgcGFkZGluZzogJzAgMTBweCd9fSwgJ2FkZCBjb21wb25lbnQ6ICcpLFxyXG4gICAgICAgICAgICBoKCdzcGFuJywge29uOiB7Y2xpY2s6IFtBRERfTk9ERSwgc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZSwgJ2JveCddfX0sIFtib3hJY29uXSksXHJcbiAgICAgICAgICAgIGgoJ3NwYW4nLCB7b246IHtjbGljazogW0FERF9OT0RFLCBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLCAnaW5wdXQnXX19LCBbaW5wdXRJY29uXSksXHJcbiAgICAgICAgICAgIGgoJ3NwYW4nLCB7b246IHtjbGljazogW0FERF9OT0RFLCBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLCAndGV4dCddfX0sIFt0ZXh0SWNvbl0pXHJcbiAgICAgICAgXSlcclxuXHJcbiAgICAgICAgY29uc3Qgdmlld0NvbXBvbmVudCA9IGgoJ2RpdicsIHthdHRyczoge2NsYXNzOiAnYmV0dGVyLXNjcm9sbGJhcid9LCBzdHlsZToge292ZXJmbG93OiAnYXV0bycsIHBvc2l0aW9uOiAncmVsYXRpdmUnLCBmbGV4OiAnMSd9LCBvbjoge2NsaWNrOiBbVU5TRUxFQ1RfVklFV19OT0RFXX19LCBbXHJcbiAgICAgICAgICAgIGxpc3RCb3hOb2RlKHtyZWY6ICd2Tm9kZUJveCcsIGlkOidfcm9vdE5vZGUnfSwgMCksXHJcbiAgICAgICAgXSlcclxuXHJcbiAgICAgICAgY29uc3QgcmlnaHRDb21wb25lbnQgPVxyXG4gICAgICAgICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICByaWdodDogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnQ6IFwiMzAwIDEuMmVtICdPcGVuIFNhbnMnXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgbGluZUhlaWdodDogJzEuMmVtJyxcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogc3RhdGUuZWRpdG9yUmlnaHRXaWR0aCArICdweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM0ZDRkNGQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJveFNpemluZzogXCJib3JkZXItYm94XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyTGVmdDogJzNweCBzb2xpZCAjMjIyJyxcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnMC41cyB0cmFuc2Zvcm0nLFxyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogc3RhdGUucmlnaHRPcGVuID8gJ3RyYW5zbGF0ZVooMCkgdHJhbnNsYXRlWCgwJSknOiAndHJhbnNsYXRlWigwKSB0cmFuc2xhdGVYKDEwMCUpJyxcclxuICAgICAgICAgICAgICAgICAgICB1c2VyU2VsZWN0OiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgICAgICBkcmFnQ29tcG9uZW50UmlnaHQsXHJcbiAgICAgICAgICAgICAgICBhZGRTdGF0ZUNvbXBvbmVudCxcclxuICAgICAgICAgICAgICAgIHN0YXRlQ29tcG9uZW50LFxyXG4gICAgICAgICAgICAgICAgYWRkVmlld05vZGVDb21wb25lbnQsXHJcbiAgICAgICAgICAgICAgICB2aWV3Q29tcG9uZW50LFxyXG4gICAgICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPyBnZW5lcmF0ZUVkaXROb2RlQ29tcG9uZW50KCk6IGgoJ3NwYW4nKVxyXG4gICAgICAgICAgICBdKVxyXG5cclxuXHJcbiAgICAgICAgY29uc3QgdG9wQ29tcG9uZW50ID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgZmxleDogJzEgYXV0bycsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICc3NXB4JyxcclxuICAgICAgICAgICAgICAgIG1heEhlaWdodDogJzc1cHgnLFxyXG4gICAgICAgICAgICAgICAgbWluSGVpZ2h0OiAnNzVweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzIyMicsXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OidmbGV4JyxcclxuICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiJ0NvbWZvcnRhYScsIHNhbnMtc2VyaWZcIixcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIFtcclxuICAgICAgICAgICAgaCgnYScsIHtzdHlsZToge2ZsZXg6ICcwIGF1dG8nLCB3aWR0aDogJzE5MHB4JywgdGV4dERlY29yYXRpb246ICdpbmhlcml0JywgdXNlclNlbGVjdDogJ25vbmUnfSwgYXR0cnM6IHtocmVmOicvX2Rldid9fSwgW1xyXG4gICAgICAgICAgICAgICAgaCgnaW1nJyx7c3R5bGU6IHsgbWFyZ2luOiAnN3B4IC0ycHggLTNweCA1cHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJ30sIGF0dHJzOiB7c3JjOiAnL2ltYWdlcy9sb2dvMjU2eDI1Ni5wbmcnLCBoZWlnaHQ6ICc1Nyd9fSksXHJcbiAgICAgICAgICAgICAgICBoKCdzcGFuJyx7c3R5bGU6IHsgZm9udFNpemU6JzQ0cHgnLCAgdmVydGljYWxBbGlnbjogJ2JvdHRvbScsIGNvbG9yOiAnI2ZmZid9fSwgJ3VnbmlzJylcclxuICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgIHJpZ2h0OiAnMCcsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgZm9udEZhbWlseTogXCInQ29tZm9ydGFhJywgc2Fucy1zZXJpZlwiLFxyXG4gICAgICAgICAgICAgICAgZm9udFNpemU6ICcxNnB4JyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM0NDQ0NDQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxNXB4IDIwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbjogJzEzcHggMTNweCAwIDAnLFxyXG4gICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGljazogW0ZVTExfU0NSRUVOX0NMSUNLRUQsIHRydWVdXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgJ2Z1bGwgc2NyZWVuJyksXHJcbiAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzQ0NDQ0NCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzE1cHggMjBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAnMTNweCAxM3B4IDAgMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsaWNrOiBSRVNFVF9BUFBfU1RBVEVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCAncmVzZXQgc3RhdGUnKSxcclxuICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNDQ0NDQ0JyxcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTVweCAyMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW46ICcxM3B4IDEzcHggMCAwJyxcclxuICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xpY2s6IFJFU0VUX0FQUF9ERUZJTklUSU9OXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgJ3Jlc2V0IGRlbW8nKVxyXG4gICAgICAgICAgICBdKVxyXG4gICAgICAgIF0pXHJcbiAgICAgICAgY29uc3QgbGVmdENvbXBvbmVudCA9IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgIGxlZnQ6ICcwJyxcclxuICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBmb250OiBcIjMwMCAxLjJlbSAnT3BlbiBTYW5zJ1wiLFxyXG4gICAgICAgICAgICAgICAgbGluZUhlaWdodDogJzEuMmVtJyxcclxuICAgICAgICAgICAgICAgIHdpZHRoOiBzdGF0ZS5lZGl0b3JMZWZ0V2lkdGggKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM0ZDRkNGQnLFxyXG4gICAgICAgICAgICAgICAgYm94U2l6aW5nOiBcImJvcmRlci1ib3hcIixcclxuICAgICAgICAgICAgICAgIGJvcmRlclJpZ2h0OiAnM3B4IHNvbGlkICMyMjInLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJzAuNXMgdHJhbnNmb3JtJyxcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogc3RhdGUubGVmdE9wZW4gPyAndHJhbnNsYXRlWigwKSB0cmFuc2xhdGVYKDAlKSc6ICd0cmFuc2xhdGVaKDApIHRyYW5zbGF0ZVgoLTEwMCUpJyxcclxuICAgICAgICAgICAgICAgIHVzZXJTZWxlY3Q6ICdub25lJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgIGRyYWdDb21wb25lbnRMZWZ0LFxyXG4gICAgICAgICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBGUkVFWkVSX0NMSUNLRURcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGZsZXg6ICcwIGF1dG8nLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjMzMzJyxcclxuICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sIFtcclxuICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHsgcGFkZGluZzogJzE1cHggMTVweCAxMHB4IDE1cHgnLCBjb2xvcjogc3RhdGUuYXBwSXNGcm96ZW4gPyAncmdiKDkxLCAyMDQsIDkxKScgOiAncmdiKDIwNCwgOTEsIDkxKSd9fSwgc3RhdGUuYXBwSXNGcm96ZW4gPyAn4pa6JyA6ICfinZrinZonKSxcclxuICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICBhdHRyczoge2NsYXNzOiAnYmV0dGVyLXNjcm9sbGJhcid9LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsZXg6ICcxIGF1dG8nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdzogJ2F1dG8nXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHN0YXRlLmV2ZW50U3RhY2tcclxuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChldmVudERhdGEpPT5zdGF0ZS5kZWZpbml0aW9uLmV2ZW50W2V2ZW50RGF0YS5ldmVudElkXSAhPT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICAgICAgICAgIC5yZXZlcnNlKCkgLy8gbXV0YXRlcyB0aGUgYXJyYXksIGJ1dCBpdCB3YXMgYWxyZWFkeSBjb3BpZWQgd2l0aCBmaWx0ZXJcclxuICAgICAgICAgICAgICAgICAgICAubWFwKChldmVudERhdGEsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gc3RhdGUuZGVmaW5pdGlvbi5ldmVudFtldmVudERhdGEuZXZlbnRJZF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZW1pdHRlciA9IHN0YXRlLmRlZmluaXRpb25bZXZlbnQuZW1pdHRlci5yZWZdW2V2ZW50LmVtaXR0ZXIuaWRdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vIGlkZWEgd2h5IHRoaXMga2V5IHdvcmtzLCBkb24ndCB0b3VjaCBpdCwgcHJvYmFibHkgcmVyZW5kZXJzIG1vcmUgdGhhbiBuZWVkZWQsIGJ1dCB3aG8gY2FyZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtrZXk6IGV2ZW50LmVtaXR0ZXIuaWQgKyBpbmRleCwgc3R5bGU6IHttYXJnaW5Cb3R0b206ICcxMHB4J319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMTBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM0NDQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdUb3A6ICczcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdCb3R0b206ICczcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBldmVudC5lbWl0dGVyLmlkID8gJyM1M0IyRUQnOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICcwLjJzIGFsbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluV2lkdGg6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIG9uOiB7Y2xpY2s6IFtWSUVXX05PREVfU0VMRUNURUQsIGV2ZW50LmVtaXR0ZXJdfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAgMCBhdXRvJywgbWFyZ2luOiAnMCAwIDAgNXB4J319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LmVtaXR0ZXIucmVmID09PSAndk5vZGVCb3gnID8gYm94SWNvbiA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudC5lbWl0dGVyLnJlZiA9PT0gJ3ZOb2RlTGlzdCcgPyBsaXN0SWNvbiA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuZW1pdHRlci5yZWYgPT09ICd2Tm9kZUxpc3QnID8gaWZJY29uIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuZW1pdHRlci5yZWYgPT09ICd2Tm9kZUlucHV0JyA/IGlucHV0SWNvbiA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0SWNvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzUgNSBhdXRvJywgbWFyZ2luOiAnMCA1cHggMCAwJywgbWluV2lkdGg6ICcwJywgb3ZlcmZsb3c6ICdoaWRkZW4nLCB3aGl0ZVNwYWNlOiAnbm93cmFwJywgIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJ319LCBlbWl0dGVyLnRpdGxlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAgMCBhdXRvJywgZm9udEZhbWlseTogXCInQ29tZm9ydGFhJywgc2Fucy1zZXJpZlwiLCBmb250U2l6ZTogJzAuOWVtJywgbWFyZ2luTGVmdDogJ2F1dG8nLCBtYXJnaW5SaWdodDogJzVweCcsIGNvbG9yOiAnIzViY2M1Yid9fSwgZXZlbnQudHlwZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nTGVmdDogJzEwcHgnLCB3aGl0ZVNwYWNlOiAnbm93cmFwJ319LCBPYmplY3Qua2V5cyhldmVudERhdGEubXV0YXRpb25zKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoc3RhdGVJZCA9PiBzdGF0ZS5kZWZpbml0aW9uLnN0YXRlW3N0YXRlSWRdICE9PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChzdGF0ZUlkID0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge29uOiB7Y2xpY2s6IFtTVEFURV9OT0RFX1NFTEVDVEVELCBzdGF0ZUlkXX0sIHN0eWxlOiB7Y3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTRweCcsIGNvbG9yOiAnd2hpdGUnLCBib3hTaGFkb3c6ICdpbnNldCAwIDAgMCAycHggJyArIChzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBzdGF0ZUlkID8gJyNlYWI2NWMnOiAnIzgyODI4MicpICwgYmFja2dyb3VuZDogJyM0NDQnLCBwYWRkaW5nOiAnMnB4IDVweCcsIG1hcmdpblJpZ2h0OiAnNXB4JywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsIHRyYW5zaXRpb246ICdhbGwgMC4ycyd9fSwgc3RhdGUuZGVmaW5pdGlvbi5zdGF0ZVtzdGF0ZUlkXS50aXRsZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7Y29sb3I6ICcjOGU4ZThlJ319LCBldmVudERhdGEucHJldmlvdXNTdGF0ZVtzdGF0ZUlkXS50b1N0cmluZygpICsgJyDigJPigLogJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywgZXZlbnREYXRhLm11dGF0aW9uc1tzdGF0ZUlkXS50b1N0cmluZygpKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICBdKVxyXG4gICAgICAgIGNvbnN0IHJlbmRlclZpZXdDb21wb25lbnQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBmbGV4OiAnMSBhdXRvJyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IGBcclxuICAgICAgICAgICAgICAgICAgICByYWRpYWwtZ3JhZGllbnQoYmxhY2sgNSUsIHRyYW5zcGFyZW50IDE2JSkgMCAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHJhZGlhbC1ncmFkaWVudChibGFjayA1JSwgdHJhbnNwYXJlbnQgMTYlKSA4cHggOHB4LFxyXG4gICAgICAgICAgICAgICAgICAgIHJhZGlhbC1ncmFkaWVudChyZ2JhKDI1NSwyNTUsMjU1LC4xKSA1JSwgdHJhbnNwYXJlbnQgMjAlKSAwIDFweCxcclxuICAgICAgICAgICAgICAgICAgICByYWRpYWwtZ3JhZGllbnQocmdiYSgyNTUsMjU1LDI1NSwuMSkgNSUsIHRyYW5zcGFyZW50IDIwJSkgOHB4IDlweGAsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6JyMzMzMnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZFNpemU6JzE2cHggMTZweCcsXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OidyZWxhdGl2ZScsXHJcbiAgICAgICAgICAgICAgICBvdmVyZmxvdzogJ2F1dG8nLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sIFtcclxuICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiAoKCk9PntcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRvcE1lbnVIZWlnaHQgPSA3NVxyXG4gICAgICAgICAgICAgICAgY29uc3Qgd2lkdGhMZWZ0ID0gd2luZG93LmlubmVyV2lkdGggLSAoKHN0YXRlLmxlZnRPcGVuID8gc3RhdGUuZWRpdG9yTGVmdFdpZHRoOiAwKSArIChzdGF0ZS5yaWdodE9wZW4gPyBzdGF0ZS5lZGl0b3JSaWdodFdpZHRoIDogMCkpXHJcbiAgICAgICAgICAgICAgICBjb25zdCBoZWlnaHRMZWZ0ID0gd2luZG93LmlubmVySGVpZ2h0IC0gdG9wTWVudUhlaWdodFxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogc3RhdGUuZnVsbFNjcmVlbiA/ICcxMDB2dycgOiB3aWR0aExlZnQgLSA0MCArJ3B4JyxcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHN0YXRlLmZ1bGxTY3JlZW4gPyAnMTAwdmgnIDogaGVpZ2h0TGVmdCAtIDQwICsgJ3B4JyxcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2ZmZmZmZicsXHJcbiAgICAgICAgICAgICAgICAgICAgekluZGV4OiBzdGF0ZS5mdWxsU2NyZWVuID8gJzk5OTk5JyA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICdyZ2JhKDAsIDAsIDAsIDAuMjQ3MDU5KSAwcHggMTRweCA0NXB4LCByZ2JhKDAsIDAsIDAsIDAuMjE5NjA4KSAwcHggMTBweCAxOHB4JyxcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2ZpeGVkJyxcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiBzdGF0ZS5mdWxsU2NyZWVuID8gICdhbGwgMC4zcyc6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICB0b3A6IHN0YXRlLmZ1bGxTY3JlZW4gPyAnMHB4JyA6IDIwICsgNzUgKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IHN0YXRlLmZ1bGxTY3JlZW4gPyAnMHB4JyA6IChzdGF0ZS5sZWZ0T3BlbiA/c3RhdGUuZWRpdG9yTGVmdFdpZHRoIDogMCkgKyAyMCArICdweCcsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKCl9LCBbXHJcbiAgICAgICAgICAgICAgICBzdGF0ZS5mdWxsU2NyZWVuID9cclxuICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7cG9zaXRpb246ICdmaXhlZCcsIHBhZGRpbmc6ICcxMnB4IDEwcHgnLCB0b3A6ICcwJywgcmlnaHQ6ICcyMHB4JywgYm9yZGVyOiAnMnB4IHNvbGlkICMzMzMnLCBib3JkZXJUb3A6ICdub25lJywgYmFja2dyb3VuZDogJyM0NDQnLCBjb2xvcjogJ3doaXRlJywgb3BhY2l0eTogJzAuOCcsIGN1cnNvcjogJ3BvaW50ZXInfSwgb246IHtjbGljazogW0ZVTExfU0NSRUVOX0NMSUNLRUQsIGZhbHNlXX19LCAnZXhpdCBmdWxsIHNjcmVlbicpOlxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nKSxcclxuICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge292ZXJmbG93OiAnYXV0bycsIHdpZHRoOiAnMTAwJScsIGhlaWdodDogJzEwMCUnfX0sIFthcHAudmRvbV0pXHJcbiAgICAgICAgICAgIF0pXHJcbiAgICAgICAgXSlcclxuICAgICAgICBjb25zdCBtYWluUm93Q29tcG9uZW50ID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgZmxleDogJzEnLFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICByZW5kZXJWaWV3Q29tcG9uZW50LFxyXG4gICAgICAgICAgICBsZWZ0Q29tcG9uZW50LFxyXG4gICAgICAgICAgICByaWdodENvbXBvbmVudFxyXG4gICAgICAgIF0pXHJcbiAgICAgICAgY29uc3Qgdm5vZGUgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnZml4ZWQnLFxyXG4gICAgICAgICAgICAgICAgdG9wOiAnMCcsXHJcbiAgICAgICAgICAgICAgICByaWdodDogJzAnLFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6ICcxMDB2dycsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDB2aCcsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICB0b3BDb21wb25lbnQsXHJcbiAgICAgICAgICAgIG1haW5Sb3dDb21wb25lbnQsXHJcbiAgICAgICAgXSlcclxuXHJcbiAgICAgICAgbm9kZSA9IHBhdGNoKG5vZGUsIHZub2RlKVxyXG4gICAgfVxyXG5cclxuICAgIHJlbmRlcigpXHJcbn0iLCJmdW5jdGlvbiB1cGRhdGVQcm9wcyhvbGRWbm9kZSwgdm5vZGUpIHtcclxuICAgIHZhciBrZXksIGN1ciwgb2xkLCBlbG0gPSB2bm9kZS5lbG0sXHJcbiAgICAgICAgcHJvcHMgPSB2bm9kZS5kYXRhLmxpdmVQcm9wcyB8fCB7fTtcclxuICAgIGZvciAoa2V5IGluIHByb3BzKSB7XHJcbiAgICAgICAgY3VyID0gcHJvcHNba2V5XTtcclxuICAgICAgICBvbGQgPSBlbG1ba2V5XTtcclxuICAgICAgICBpZiAob2xkICE9PSBjdXIpIGVsbVtrZXldID0gY3VyO1xyXG4gICAgfVxyXG59XHJcbmNvbnN0IGxpdmVQcm9wc1BsdWdpbiA9IHtjcmVhdGU6IHVwZGF0ZVByb3BzLCB1cGRhdGU6IHVwZGF0ZVByb3BzfTtcclxuaW1wb3J0IHNuYWJiZG9tIGZyb20gJ3NuYWJiZG9tJ1xyXG5jb25zdCBwYXRjaCA9IHNuYWJiZG9tLmluaXQoW1xyXG4gICAgcmVxdWlyZSgnc25hYmJkb20vbW9kdWxlcy9jbGFzcycpLFxyXG4gICAgcmVxdWlyZSgnc25hYmJkb20vbW9kdWxlcy9wcm9wcycpLFxyXG4gICAgcmVxdWlyZSgnc25hYmJkb20vbW9kdWxlcy9zdHlsZScpLFxyXG4gICAgcmVxdWlyZSgnc25hYmJkb20vbW9kdWxlcy9ldmVudGxpc3RlbmVycycpLFxyXG4gICAgcmVxdWlyZSgnc25hYmJkb20vbW9kdWxlcy9hdHRyaWJ1dGVzJyksXHJcbiAgICBsaXZlUHJvcHNQbHVnaW5cclxuXSk7XHJcbmltcG9ydCBoIGZyb20gJ3NuYWJiZG9tL2gnO1xyXG5pbXBvcnQgYmlnIGZyb20gJ2JpZy5qcyc7XHJcblxyXG5mdW5jdGlvbiBmbGF0dGVuKGFycikge1xyXG4gICAgcmV0dXJuIGFyci5yZWR1Y2UoZnVuY3Rpb24gKGZsYXQsIHRvRmxhdHRlbikge1xyXG4gICAgICAgIHJldHVybiBmbGF0LmNvbmNhdChBcnJheS5pc0FycmF5KHRvRmxhdHRlbikgPyBmbGF0dGVuKHRvRmxhdHRlbikgOiB0b0ZsYXR0ZW4pO1xyXG4gICAgfSwgW10pO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCAoZGVmaW5pdGlvbikgPT4ge1xyXG5cclxuICAgIGxldCBjdXJyZW50U3RhdGUgPSBjcmVhdGVEZWZhdWx0U3RhdGUoKVxyXG5cclxuICAgIC8vIEFsbG93cyBzdG9waW5nIGFwcGxpY2F0aW9uIGluIGRldmVsb3BtZW50LiBUaGlzIGlzIG5vdCBhbiBhcHBsaWNhdGlvbiBzdGF0ZVxyXG4gICAgbGV0IGZyb3plbiA9IGZhbHNlXHJcbiAgICBsZXQgZnJvemVuQ2FsbGJhY2sgPSBudWxsXHJcbiAgICBsZXQgc2VsZWN0SG92ZXJBY3RpdmUgPSBmYWxzZVxyXG4gICAgbGV0IHNlbGVjdGVkTm9kZUluRGV2ZWxvcG1lbnQgPSB7fVxyXG5cclxuICAgIGZ1bmN0aW9uIHNlbGVjdE5vZGVIb3ZlcihyZWYsIGUpIHtcclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgc2VsZWN0ZWROb2RlSW5EZXZlbG9wbWVudCA9IHJlZlxyXG4gICAgICAgIGZyb3plbkNhbGxiYWNrKHJlZilcclxuICAgICAgICByZW5kZXIoKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gc2VsZWN0Tm9kZUNsaWNrKHJlZiwgZSkge1xyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICBzZWxlY3RIb3ZlckFjdGl2ZSA9IGZhbHNlXHJcbiAgICAgICAgc2VsZWN0ZWROb2RlSW5EZXZlbG9wbWVudCA9IHJlZlxyXG4gICAgICAgIGZyb3plbkNhbGxiYWNrKHJlZilcclxuICAgICAgICByZW5kZXIoKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGdsb2JhbCBzdGF0ZSBmb3IgcmVzb2x2ZXJcclxuICAgIGxldCBjdXJyZW50RXZlbnQgPSBudWxsXHJcbiAgICBsZXQgY3VycmVudE1hcFZhbHVlID0ge31cclxuICAgIGxldCBjdXJyZW50TWFwSW5kZXggPSB7fVxyXG4gICAgbGV0IGV2ZW50RGF0YSA9IHt9XHJcbiAgICBmdW5jdGlvbiByZXNvbHZlKHJlZil7XHJcbiAgICAgICAgaWYocmVmID09PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gc3RhdGljIHZhbHVlIChzdHJpbmcvbnVtYmVyKVxyXG4gICAgICAgIGlmKHJlZi5yZWYgPT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHJldHVybiByZWZcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZGVmID0gZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdXHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdwaXBlJykge1xyXG4gICAgICAgICAgICByZXR1cm4gcGlwZShyZWYpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWYucmVmID09PSAnY29uZGl0aW9uYWwnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKGRlZi5wcmVkaWNhdGUpID8gcmVzb2x2ZShkZWYudGhlbikgOiByZXNvbHZlKGRlZi5lbHNlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3N0YXRlJykge1xyXG4gICAgICAgICAgICByZXR1cm4gY3VycmVudFN0YXRlW3JlZi5pZF1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICd2Tm9kZUJveCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGJveE5vZGUocmVmKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3ZOb2RlVGV4dCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRleHROb2RlKHJlZilcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICd2Tm9kZUlucHV0Jykge1xyXG4gICAgICAgICAgICByZXR1cm4gaW5wdXROb2RlKHJlZilcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICd2Tm9kZUxpc3QnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBsaXN0Tm9kZShyZWYpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWYucmVmID09PSAndk5vZGVJZicpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGlmTm9kZShyZWYpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWYucmVmID09PSAnc3R5bGUnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhkZWYpLnJlZHVjZSgoYWNjLCB2YWwpPT4ge1xyXG4gICAgICAgICAgICAgICAgYWNjW3ZhbF0gPSByZXNvbHZlKGRlZlt2YWxdKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjY1xyXG4gICAgICAgICAgICB9LCB7fSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdldmVudERhdGEnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBldmVudERhdGFbcmVmLmlkXVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ2xpc3RWYWx1ZScpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRNYXBWYWx1ZVtkZWYubGlzdC5pZF1bZGVmLnByb3BlcnR5XVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aHJvdyBFcnJvcihyZWYpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdHJhbnNmb3JtVmFsdWUodmFsdWUsIHRyYW5zZm9ybWF0aW9ucyl7XHJcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRyYW5zZm9ybWF0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCByZWYgPSB0cmFuc2Zvcm1hdGlvbnNbaV07XHJcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybWVyID0gZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdXHJcbiAgICAgICAgICAgIGlmIChyZWYucmVmID09PSAnZXF1YWwnKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wYXJlVmFsdWUgPSByZXNvbHZlKHRyYW5zZm9ybWVyLnZhbHVlKVxyXG4gICAgICAgICAgICAgICAgaWYodmFsdWUgaW5zdGFuY2VvZiBiaWcgfHwgY29tcGFyZVZhbHVlIGluc3RhbmNlb2YgYmlnKXtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGJpZyh2YWx1ZSkuZXEoY29tcGFyZVZhbHVlKVxyXG4gICAgICAgICAgICAgICAgfSBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgPT09IGNvbXBhcmVWYWx1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZWYucmVmID09PSAnYWRkJykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBiaWcodmFsdWUpLnBsdXMocmVzb2x2ZSh0cmFuc2Zvcm1lci52YWx1ZSkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdzdWJ0cmFjdCcpIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gYmlnKHZhbHVlKS5taW51cyhyZXNvbHZlKHRyYW5zZm9ybWVyLnZhbHVlKSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ211bHRpcGx5Jykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBiaWcodmFsdWUpLnRpbWVzKHJlc29sdmUodHJhbnNmb3JtZXIudmFsdWUpKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZWYucmVmID09PSAnZGl2aWRlJykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBiaWcodmFsdWUpLmRpdihyZXNvbHZlKHRyYW5zZm9ybWVyLnZhbHVlKSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3JlbWFpbmRlcicpIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gYmlnKHZhbHVlKS5tb2QocmVzb2x2ZSh0cmFuc2Zvcm1lci52YWx1ZSkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdicmFuY2gnKSB7XHJcbiAgICAgICAgICAgICAgICBpZihyZXNvbHZlKHRyYW5zZm9ybWVyLnByZWRpY2F0ZSkpe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdHJhbnNmb3JtVmFsdWUodmFsdWUsIHRyYW5zZm9ybWVyLnRoZW4pXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdHJhbnNmb3JtVmFsdWUodmFsdWUsIHRyYW5zZm9ybWVyLmVsc2UpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdqb2luJykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5jb25jYXQocmVzb2x2ZSh0cmFuc2Zvcm1lci52YWx1ZSkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlZi5yZWYgPT09ICd0b1VwcGVyQ2FzZScpIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9VcHBlckNhc2UoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZWYucmVmID09PSAndG9Mb3dlckNhc2UnKSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3RvVGV4dCcpIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9TdHJpbmcoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwaXBlKHJlZikge1xyXG4gICAgICAgIGNvbnN0IGRlZiA9IGRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXVxyXG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm1WYWx1ZShyZXNvbHZlKGRlZi52YWx1ZSksIGRlZi50cmFuc2Zvcm1hdGlvbnMpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZnJvemVuU2hhZG93ID0gJ2luc2V0IDAgMCAwIDNweCAjMzU5MGRmJ1xyXG5cclxuICAgIGZ1bmN0aW9uIGJveE5vZGUocmVmKSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IGRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXVxyXG4gICAgICAgIGNvbnN0IHN0eWxlID0gcmVzb2x2ZShub2RlLnN0eWxlKVxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSB7XHJcbiAgICAgICAgICAgIHN0eWxlOiBmcm96ZW4gJiYgc2VsZWN0ZWROb2RlSW5EZXZlbG9wbWVudC5pZCA9PT0gcmVmLmlkID8gey4uLnN0eWxlLCB0cmFuc2l0aW9uOidib3gtc2hhZG93IDAuMnMnLCBib3hTaGFkb3c6IHN0eWxlLmJveFNoYWRvdyA/IHN0eWxlLmJveFNoYWRvdyArICcgLCAnICsgZnJvemVuU2hhZG93OiBmcm96ZW5TaGFkb3cgfSA6IHN0eWxlLFxyXG4gICAgICAgICAgICBvbjogZnJvemVuID9cclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZW92ZXI6IHNlbGVjdEhvdmVyQWN0aXZlID8gW3NlbGVjdE5vZGVIb3ZlciwgcmVmXTogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBbc2VsZWN0Tm9kZUNsaWNrLCByZWZdXHJcbiAgICAgICAgICAgICAgICB9OntcclxuICAgICAgICAgICAgICAgICAgICBjbGljazogbm9kZS5jbGljayA/IFtlbWl0RXZlbnQsIG5vZGUuY2xpY2tdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGRibGNsaWNrOiBub2RlLmRibGNsaWNrID8gW2VtaXRFdmVudCwgbm9kZS5kYmxjbGlja10gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VvdmVyOiBub2RlLm1vdXNlb3ZlciA/IFtlbWl0RXZlbnQsIG5vZGUubW91c2VvdmVyXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZW91dDogbm9kZS5tb3VzZW91dCA/IFtlbWl0RXZlbnQsIG5vZGUubW91c2VvdXRdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGgoJ2RpdicsIGRhdGEsIGZsYXR0ZW4obm9kZS5jaGlsZHJlbi5tYXAocmVzb2x2ZSkpKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGlmTm9kZShyZWYpIHtcclxuICAgICAgICBjb25zdCBub2RlID0gZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdXHJcbiAgICAgICAgcmV0dXJuIHJlc29sdmUobm9kZS52YWx1ZSkgPyBub2RlLmNoaWxkcmVuLm1hcChyZXNvbHZlKTogW11cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB0ZXh0Tm9kZShyZWYpIHtcclxuICAgICAgICBjb25zdCBub2RlID0gZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdXHJcbiAgICAgICAgY29uc3Qgc3R5bGUgPSByZXNvbHZlKG5vZGUuc3R5bGUpXHJcbiAgICAgICAgY29uc3QgZGF0YSA9IHtcclxuICAgICAgICAgICAgc3R5bGU6IGZyb3plbiAmJiBzZWxlY3RlZE5vZGVJbkRldmVsb3BtZW50LmlkID09PSByZWYuaWQgPyB7Li4uc3R5bGUsIHRyYW5zaXRpb246J2JveC1zaGFkb3cgMC4ycycsIGJveFNoYWRvdzogc3R5bGUuYm94U2hhZG93ID8gc3R5bGUuYm94U2hhZG93ICsgJyAsICcgKyBmcm96ZW5TaGFkb3c6IGZyb3plblNoYWRvdyB9IDogc3R5bGUsXHJcbiAgICAgICAgICAgIG9uOiBmcm96ZW4gP1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlb3Zlcjogc2VsZWN0SG92ZXJBY3RpdmUgPyBbc2VsZWN0Tm9kZUhvdmVyLCByZWZdOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xpY2s6IFtzZWxlY3ROb2RlQ2xpY2ssIHJlZl1cclxuICAgICAgICAgICAgICAgIH06e1xyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBub2RlLmNsaWNrID8gW2VtaXRFdmVudCwgbm9kZS5jbGlja10gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgZGJsY2xpY2s6IG5vZGUuZGJsY2xpY2sgPyBbZW1pdEV2ZW50LCBub2RlLmRibGNsaWNrXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZW92ZXI6IG5vZGUubW91c2VvdmVyID8gW2VtaXRFdmVudCwgbm9kZS5tb3VzZW92ZXJdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlb3V0OiBub2RlLm1vdXNlb3V0ID8gW2VtaXRFdmVudCwgbm9kZS5tb3VzZW91dF0gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaCgnc3BhbicsIGRhdGEsIHJlc29sdmUobm9kZS52YWx1ZSkpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5wdXROb2RlKHJlZikge1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBkZWZpbml0aW9uW3JlZi5yZWZdW3JlZi5pZF1cclxuICAgICAgICBjb25zdCBzdHlsZSA9IHJlc29sdmUobm9kZS5zdHlsZSlcclxuICAgICAgICBjb25zdCBkYXRhID0ge1xyXG4gICAgICAgICAgICBzdHlsZTogZnJvemVuICYmIHNlbGVjdGVkTm9kZUluRGV2ZWxvcG1lbnQuaWQgPT09IHJlZi5pZCA/IHsuLi5zdHlsZSwgdHJhbnNpdGlvbjonYm94LXNoYWRvdyAwLjJzJywgYm94U2hhZG93OiBzdHlsZS5ib3hTaGFkb3cgPyBzdHlsZS5ib3hTaGFkb3cgKyAnICwgJyArIGZyb3plblNoYWRvdzogZnJvemVuU2hhZG93IH0gOiBzdHlsZSxcclxuICAgICAgICAgICAgb246IGZyb3plbiA/XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VvdmVyOiBzZWxlY3RIb3ZlckFjdGl2ZSA/IFtzZWxlY3ROb2RlSG92ZXIsIHJlZl06IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBjbGljazogW3NlbGVjdE5vZGVDbGljaywgcmVmXVxyXG4gICAgICAgICAgICAgICAgfTp7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xpY2s6IG5vZGUuY2xpY2sgPyBbZW1pdEV2ZW50LCBub2RlLmNsaWNrXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dDogbm9kZS5pbnB1dCA/IFtlbWl0RXZlbnQsIG5vZGUuaW5wdXRdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGRibGNsaWNrOiBub2RlLmRibGNsaWNrID8gW2VtaXRFdmVudCwgbm9kZS5kYmxjbGlja10gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VvdmVyOiBub2RlLm1vdXNlb3ZlciA/IFtlbWl0RXZlbnQsIG5vZGUubW91c2VvdmVyXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZW91dDogbm9kZS5tb3VzZW91dCA/IFtlbWl0RXZlbnQsIG5vZGUubW91c2VvdXRdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvY3VzOiBub2RlLmZvY3VzID8gW2VtaXRFdmVudCwgbm9kZS5mb2N1c10gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgYmx1cjogbm9kZS5ibHVyID8gW2VtaXRFdmVudCwgbm9kZS5ibHVyXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogcmVzb2x2ZShub2RlLnZhbHVlKSxcclxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiBub2RlLnBsYWNlaG9sZGVyXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGgoJ2lucHV0JywgZGF0YSlcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBsaXN0Tm9kZShyZWYpIHtcclxuICAgICAgICBjb25zdCBub2RlID0gZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdXHJcbiAgICAgICAgY29uc3QgbGlzdCA9IHJlc29sdmUobm9kZS52YWx1ZSlcclxuXHJcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBPYmplY3Qua2V5cyhsaXN0KS5tYXAoa2V5PT5saXN0W2tleV0pLm1hcCgodmFsdWUsIGluZGV4KT0+IHtcclxuICAgICAgICAgICAgY3VycmVudE1hcFZhbHVlW3JlZi5pZF0gPSB2YWx1ZVxyXG4gICAgICAgICAgICBjdXJyZW50TWFwSW5kZXhbcmVmLmlkXSA9IGluZGV4XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbm9kZS5jaGlsZHJlbi5tYXAocmVzb2x2ZSlcclxuICAgICAgICB9KVxyXG4gICAgICAgIGRlbGV0ZSBjdXJyZW50TWFwVmFsdWVbcmVmLmlkXTtcclxuICAgICAgICBkZWxldGUgY3VycmVudE1hcEluZGV4W3JlZi5pZF07XHJcblxyXG4gICAgICAgIHJldHVybiBjaGlsZHJlblxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGxpc3RlbmVycyA9IFtdXHJcblxyXG4gICAgZnVuY3Rpb24gYWRkTGlzdGVuZXIoY2FsbGJhY2spIHtcclxuICAgICAgICBjb25zdCBsZW5ndGggPSBsaXN0ZW5lcnMucHVzaChjYWxsYmFjaylcclxuXHJcbiAgICAgICAgLy8gZm9yIHVuc3Vic2NyaWJpbmdcclxuICAgICAgICByZXR1cm4gKCkgPT4gbGlzdGVuZXJzLnNwbGljZShsZW5ndGggLSAxLCAxKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGVtaXRFdmVudChldmVudFJlZiwgZSkge1xyXG4gICAgICAgIGNvbnN0IGV2ZW50SWQgPSBldmVudFJlZi5pZFxyXG4gICAgICAgIGNvbnN0IGV2ZW50ID0gZGVmaW5pdGlvbi5ldmVudFtldmVudElkXVxyXG4gICAgICAgIGN1cnJlbnRFdmVudCA9IGVcclxuICAgICAgICBldmVudC5kYXRhLmZvckVhY2goKHJlZik9PntcclxuICAgICAgICAgICAgaWYocmVmLmlkID09PSAnX2lucHV0Jyl7XHJcbiAgICAgICAgICAgICAgICBldmVudERhdGFbcmVmLmlkXSA9IGUudGFyZ2V0LnZhbHVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIGNvbnN0IHByZXZpb3VzU3RhdGUgPSBjdXJyZW50U3RhdGVcclxuICAgICAgICBsZXQgbXV0YXRpb25zID0ge31cclxuICAgICAgICBkZWZpbml0aW9uLmV2ZW50W2V2ZW50SWRdLm11dGF0b3JzLmZvckVhY2goKHJlZik9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG11dGF0b3IgPSBkZWZpbml0aW9uLm11dGF0b3JbcmVmLmlkXVxyXG4gICAgICAgICAgICBjb25zdCBzdGF0ZSA9IG11dGF0b3Iuc3RhdGVcclxuICAgICAgICAgICAgbXV0YXRpb25zW3N0YXRlLmlkXSA9IHJlc29sdmUobXV0YXRvci5tdXRhdGlvbilcclxuICAgICAgICB9KVxyXG4gICAgICAgIGN1cnJlbnRTdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIGN1cnJlbnRTdGF0ZSwgbXV0YXRpb25zKVxyXG4gICAgICAgIGxpc3RlbmVycy5mb3JFYWNoKGNhbGxiYWNrID0+IGNhbGxiYWNrKGV2ZW50SWQsIGV2ZW50RGF0YSwgZSwgcHJldmlvdXNTdGF0ZSwgY3VycmVudFN0YXRlLCBtdXRhdGlvbnMpKVxyXG4gICAgICAgIGN1cnJlbnRFdmVudCA9IHt9XHJcbiAgICAgICAgZXZlbnREYXRhID0ge31cclxuICAgICAgICBpZihPYmplY3Qua2V5cyhtdXRhdGlvbnMpLmxlbmd0aCl7XHJcbiAgICAgICAgICAgIHJlbmRlcigpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxldCB2ZG9tID0gcmVzb2x2ZSh7cmVmOid2Tm9kZUJveCcsIGlkOidfcm9vdE5vZGUnfSlcclxuICAgIGZ1bmN0aW9uIHJlbmRlcihuZXdEZWZpbml0aW9uKSB7XHJcbiAgICAgICAgaWYobmV3RGVmaW5pdGlvbil7XHJcbiAgICAgICAgICAgIGlmKGRlZmluaXRpb24uc3RhdGUgIT09IG5ld0RlZmluaXRpb24uc3RhdGUpe1xyXG4gICAgICAgICAgICAgICAgZGVmaW5pdGlvbiA9IG5ld0RlZmluaXRpb25cclxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1N0YXRlID0gT2JqZWN0LmtleXMoZGVmaW5pdGlvbi5zdGF0ZSkubWFwKGtleT0+ZGVmaW5pdGlvbi5zdGF0ZVtrZXldKS5yZWR1Y2UoKGFjYywgZGVmKT0+IHtcclxuICAgICAgICAgICAgICAgICAgICBhY2NbZGVmLnJlZl0gPSBkZWYuZGVmYXVsdFZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFjY1xyXG4gICAgICAgICAgICAgICAgfSwge30pXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50U3RhdGUgPSB7Li4ubmV3U3RhdGUsIC4uLmN1cnJlbnRTdGF0ZX1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGRlZmluaXRpb24gPSBuZXdEZWZpbml0aW9uXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbmV3dmRvbSA9IHJlc29sdmUoe3JlZjondk5vZGVCb3gnLCBpZDonX3Jvb3ROb2RlJ30pXHJcbiAgICAgICAgcGF0Y2godmRvbSwgbmV3dmRvbSlcclxuICAgICAgICB2ZG9tID0gbmV3dmRvbVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIF9mcmVlemUoaXNGcm96ZW4sIGNhbGxiYWNrLCBub2RlSWQpIHtcclxuICAgICAgICBmcm96ZW5DYWxsYmFjayA9IGNhbGxiYWNrXHJcbiAgICAgICAgc2VsZWN0ZWROb2RlSW5EZXZlbG9wbWVudCA9IG5vZGVJZFxyXG4gICAgICAgIGlmKGZyb3plbiA9PT0gZmFsc2UgJiYgaXNGcm96ZW4gPT09IHRydWUpe1xyXG4gICAgICAgICAgICBzZWxlY3RIb3ZlckFjdGl2ZSA9IHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoZnJvemVuIHx8IGZyb3plbiAhPT0gaXNGcm96ZW4pe1xyXG4gICAgICAgICAgICBmcm96ZW4gPSBpc0Zyb3plblxyXG4gICAgICAgICAgICByZW5kZXIoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50U3RhdGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRTdGF0ZVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNldEN1cnJlbnRTdGF0ZShuZXdTdGF0ZSkge1xyXG4gICAgICAgIGN1cnJlbnRTdGF0ZSA9IG5ld1N0YXRlXHJcbiAgICAgICAgcmVuZGVyKClcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVEZWZhdWx0U3RhdGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGRlZmluaXRpb24uc3RhdGUpLm1hcChrZXk9PmRlZmluaXRpb24uc3RhdGVba2V5XSkucmVkdWNlKChhY2MsIGRlZik9PiB7XHJcbiAgICAgICAgICAgIGFjY1tkZWYucmVmXSA9IGRlZi5kZWZhdWx0VmFsdWVcclxuICAgICAgICAgICAgcmV0dXJuIGFjY1xyXG4gICAgICAgIH0sIHt9KVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZGVmaW5pdGlvbixcclxuICAgICAgICB2ZG9tLFxyXG4gICAgICAgIGdldEN1cnJlbnRTdGF0ZSxcclxuICAgICAgICBzZXRDdXJyZW50U3RhdGUsXHJcbiAgICAgICAgcmVuZGVyLFxyXG4gICAgICAgIGVtaXRFdmVudCxcclxuICAgICAgICBhZGRMaXN0ZW5lcixcclxuICAgICAgICBfZnJlZXplLFxyXG4gICAgICAgIF9yZXNvbHZlOiByZXNvbHZlLFxyXG4gICAgICAgIGNyZWF0ZURlZmF1bHRTdGF0ZVxyXG4gICAgfVxyXG59IiwibW9kdWxlLmV4cG9ydHM9e1xyXG4gICAgXCJldmVudERhdGFcIjoge1xyXG4gICAgICAgIFwiX2lucHV0XCI6IHtcclxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcImlucHV0IHZhbHVlXCIsXHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcInRleHRcIlxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcInRvTG93ZXJDYXNlXCI6IHt9LFxyXG4gICAgXCJ0b1VwcGVyQ2FzZVwiOiB7fSxcclxuICAgIFwiY29uZGl0aW9uYWxcIjoge30sXHJcbiAgICBcImVxdWFsXCI6IHtcclxuICAgICAgICBcImE3MjUxYWYwLTUwYTctNDgyMy04NWEwLTY2Y2UwOWQ4YTNjY1wiOiB7XHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiZWUyNDIzZTYtNWI0OC00MWFlLThjY2YtNmEyYzdiNDZkMmY4XCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcIm5vdFwiOiB7fSxcclxuICAgIFwibGlzdFwiOiB7fSxcclxuICAgIFwidG9UZXh0XCI6IHtcclxuICAgICAgICBcIjdiczlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7fVxyXG4gICAgfSxcclxuICAgIFwibGlzdFZhbHVlXCI6IHtcclxuICAgICAgICBcInB6N2hkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcIm51bWJlclwiLFxyXG4gICAgICAgICAgICBcImxpc3RcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZUxpc3RcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJmbDg5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjVcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInByb3BlcnR5XCI6IFwieFwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImhqOXdkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcIm51bWJlclwiLFxyXG4gICAgICAgICAgICBcImxpc3RcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZUxpc3RcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJmbDg5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjVcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInByb3BlcnR5XCI6IFwieVwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImhocjhiNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgICAgICAgXCJsaXN0XCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwidk5vZGVMaXN0XCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiZmw4OWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJwcm9wZXJ0eVwiOiBcImNvbG9yXCJcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJwaXBlXCI6IHtcclxuICAgICAgICBcImZ3OGpkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIk51bWJlciBjdXJyZW50bHkgaXM6IFwiLFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJqb2luXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcInA5czNkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwidW01ZWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwic3RhdGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJ0b1RleHRcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwiN2JzOWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJ1aThqZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjogXCIrXCIsXHJcbiAgICAgICAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImM4d2VkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIi1cIixcclxuICAgICAgICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwicGRxNmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJzdGF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcIjQ2dmRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcImFkZFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJ3ODZmZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIjQ1MnFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcIm51bWJlclwiLFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwic3RhdGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJzdWJ0cmFjdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJ1NDN3ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImV3ODNkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcIm51bWJlclwiLFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IDEsXHJcbiAgICAgICAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInczZTlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcIm51bWJlclwiLFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IDEsXHJcbiAgICAgICAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIjNxa2lkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiAwLFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJhZGRcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwid2JyN2Q2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJ0b1RleHRcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwibm9vcFwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwiam9pblwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJzMjU4ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInQ3dnFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiAwLFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJhZGRcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwidnE4ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJ0b1RleHRcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwibm9vcFwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwiam9pblwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJ3ZjlhZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIjhjcTZiNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcImxpc3RWYWx1ZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcImhocjhiNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImY5cXhkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcInRhYmxlXCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJzdGF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcImM4cTlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInF3dzlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcInB4XCIsXHJcbiAgICAgICAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInFkdzdjNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcInB4XCIsXHJcbiAgICAgICAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIjg0MzY5YWJhLTRhNGQtNDkzMi04YTlhLThmOWNhOTQ4YjZhMlwiOiB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiBcIlRoZSBudW1iZXIgaXMgZXZlbiDwn46JXCIsXHJcbiAgICAgICAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImMyZmI5YTliLTI1YmItNGU4Yi04MGMwLWNmNTFiODUwNjA3MFwiOiB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcImJvb2xlYW5cIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInN0YXRlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiNDZ2ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwicmVtYWluZGVyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIjM0NzgwZDIyLWY1MjEtNGMzMC04OWE1LTNlN2Y1YjVhZjdjMlwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwiZXF1YWxcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwiYTcyNTFhZjAtNTBhNy00ODIzLTg1YTAtNjZjZTA5ZDhhM2NjXCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCIxMjI5ZDQ3OC1iYzI1LTQ0MDEtOGE4OS03NGZjNmNmZTg5OTZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiAyLFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJlZTI0MjNlNi01YjQ4LTQxYWUtOGNjZi02YTJjN2I0NmQyZjhcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiAwLFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcImpvaW5cIjoge1xyXG4gICAgICAgIFwicDlzM2Q2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJ1bTVlZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIndmOWFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwicXd3OWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJzMjU4ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcInFkdzdjNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJhZGRcIjoge1xyXG4gICAgICAgIFwidzg2ZmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJldzgzZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIndicjdkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJsaXN0VmFsdWVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJwejdoZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInZxOGRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJsaXN0VmFsdWVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJoajl3ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwic3VidHJhY3RcIjoge1xyXG4gICAgICAgIFwidTQzd2Q2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJ3M2U5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwicmVtYWluZGVyXCI6IHtcclxuICAgICAgICBcIjM0NzgwZDIyLWY1MjEtNGMzMC04OWE1LTNlN2Y1YjVhZjdjMlwiOiB7XHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiMTIyOWQ0NzgtYmMyNS00NDAxLThhODktNzRmYzZjZmU4OTk2XCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcInZOb2RlQm94XCI6IHtcclxuICAgICAgICBcIl9yb290Tm9kZVwiOiB7XHJcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJib3hcIixcclxuICAgICAgICAgICAgXCJzdHlsZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInN0eWxlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiX3Jvb3RTdHlsZVwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwiY2hpbGRyZW5cIjogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwidk5vZGVUZXh0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIjI0NzFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwidk5vZGVUZXh0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIjE0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwidk5vZGVUZXh0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIjM0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwidk5vZGVJZlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCI1Nzg3YzE1YS00MjZiLTQxZWItODMxZC1lM2UwNzQxNTk1ODJcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcInZOb2RlTGlzdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJmbDg5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjVcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImd3OWRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJib3hcIixcclxuICAgICAgICAgICAgXCJzdHlsZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInN0eWxlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiZnE5ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJjaGlsZHJlblwiOiBbXVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcInZOb2RlVGV4dFwiOiB7XHJcbiAgICAgICAgXCIyNDcxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjVcIjoge1xyXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwiTnVtYmVyIGN1cnJlbnRseVwiLFxyXG4gICAgICAgICAgICBcInN0eWxlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwic3R5bGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCI4NDgxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcImZ3OGpkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiMTQ4MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCI6IHtcclxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIisgYnV0dG9uXCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwidWk4amQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJzdHlsZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInN0eWxlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiOTQ4MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJjbGlja1wiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcImV2ZW50XCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiZDQ4cmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCIzNDgxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjVcIjoge1xyXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwiLSBidXR0b25cIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJjOHdlZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInN0eWxlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwic3R5bGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCI3NDgxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcImNsaWNrXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwiZXZlbnRcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCIzYTU0ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImU4YWRkMWM3LThhMDEtNDE2NC04NjA0LTcyMmQ4YWI1MjlmMVwiOiB7XHJcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJpcyBldmVuXCIsXHJcbiAgICAgICAgICAgIFwic3R5bGVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJzdHlsZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcIjRkY2E3M2IzLTkwZWItNDFlNy04NjUxLTJiZGNjOTNmMzg3MVwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiODQzNjlhYmEtNGE0ZC00OTMyLThhOWEtOGY5Y2E5NDhiNmEyXCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcInZOb2RlSW5wdXRcIjoge30sXHJcbiAgICBcInZOb2RlTGlzdFwiOiB7XHJcbiAgICAgICAgXCJmbDg5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjVcIjoge1xyXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwibGlzdCBvZiBib3hlc1wiLFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcImY5cXhkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwiY2hpbGRyZW5cIjogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwidk5vZGVCb3hcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwiZ3c5ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcInZOb2RlSWZcIjoge1xyXG4gICAgICAgIFwiNTc4N2MxNWEtNDI2Yi00MWViLTgzMWQtZTNlMDc0MTU5NTgyXCI6IHtcclxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcImlzIG51bWJlciBldmVuXCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiYzJmYjlhOWItMjViYi00ZThiLTgwYzAtY2Y1MWI4NTA2MDcwXCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJjaGlsZHJlblwiOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZVRleHRcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwiZThhZGQxYzctOGEwMS00MTY0LTg2MDQtNzIyZDhhYjUyOWYxXCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcInN0eWxlXCI6IHtcclxuICAgICAgICBcIl9yb290U3R5bGVcIjoge1xyXG4gICAgICAgICAgICBcImZvbnRGYW1pbHlcIjogXCInQ29tZm9ydGFhJywgY3Vyc2l2ZVwiLFxyXG4gICAgICAgICAgICBcImJhY2tncm91bmRcIjogXCIjZjVmNWY1XCIsXHJcbiAgICAgICAgICAgIFwibWluSGVpZ2h0XCI6IFwiMTAwJVwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIjg0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwicGFkZGluZ1wiOiBcIjEwcHhcIixcclxuICAgICAgICAgICAgXCJtYXJnaW5cIjogXCIxMHB4IDVweFwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIjk0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwicGFkZGluZ1wiOiBcIjEwcHggMTVweFwiLFxyXG4gICAgICAgICAgICBcImJhY2tncm91bmRcIjogXCIjYWFhYWFhXCIsXHJcbiAgICAgICAgICAgIFwiZGlzcGxheVwiOiBcImlubGluZS1ibG9ja1wiLFxyXG4gICAgICAgICAgICBcIm1hcmdpbkxlZnRcIjogXCI1cHhcIixcclxuICAgICAgICAgICAgXCJib3JkZXJSYWRpdXNcIjogXCIzcHhcIixcclxuICAgICAgICAgICAgXCJjdXJzb3JcIjogXCJwb2ludGVyXCIsXHJcbiAgICAgICAgICAgIFwidXNlclNlbGVjdFwiOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgXCJtYXJnaW5cIjogXCIxMHB4IDVweFwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIjc0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwicGFkZGluZ1wiOiBcIjEwcHggMTVweFwiLFxyXG4gICAgICAgICAgICBcImJhY2tncm91bmRcIjogXCIjOTk5OTk5XCIsXHJcbiAgICAgICAgICAgIFwiZGlzcGxheVwiOiBcImlubGluZS1ibG9ja1wiLFxyXG4gICAgICAgICAgICBcIm1hcmdpbkxlZnRcIjogXCI1cHhcIixcclxuICAgICAgICAgICAgXCJib3JkZXJSYWRpdXNcIjogXCIzcHhcIixcclxuICAgICAgICAgICAgXCJjdXJzb3JcIjogXCJwb2ludGVyXCIsXHJcbiAgICAgICAgICAgIFwibWFyZ2luXCI6IFwiMTBweCA1cHhcIixcclxuICAgICAgICAgICAgXCJ1c2VyU2VsZWN0XCI6IFwibm9uZVwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIjgwOTJhYzVlLWRmZDAtNDQ5Mi1hNjVkLThhYzNlZWMzMjVlMFwiOiB7XHJcbiAgICAgICAgICAgIFwicGFkZGluZ1wiOiBcIjEwcHggMTBweCAxMHB4IDBcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJhOTQ2MWUyOC03ZDkyLTQ5YTAtOTAwMS0yM2Q3NGU0YjM4MmRcIjoge1xyXG4gICAgICAgICAgICBcInBhZGRpbmdcIjogXCIxMHB4IDEwcHggMTBweCAwXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiNzY2YjExZWMtZGEyNy00OTRjLWIyNzItYzI2ZmVjM2Y2NDc1XCI6IHtcclxuICAgICAgICAgICAgXCJwYWRkaW5nXCI6IFwiMTBweFwiLFxyXG4gICAgICAgICAgICBcImZsb2F0XCI6IFwicmlnaHRcIixcclxuICAgICAgICAgICAgXCJwYWRkaW5nUmlnaHRcIjogXCI1MHB4XCIsXHJcbiAgICAgICAgICAgIFwidGV4dEFsaWduXCI6IFwicmlnaHRcIixcclxuICAgICAgICAgICAgXCJtYXhXaWR0aFwiOiBcIjUwMHB4XCIsXHJcbiAgICAgICAgICAgIFwibGluZS1oZWlnaHRcIjogXCIxLjVcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJjYmNkOGVkYi00YWEyLTQzZmUtYWQzOS1jZWU3OWI0OTAyOTVcIjoge1xyXG4gICAgICAgICAgICBcInBhZGRpbmdcIjogXCIxMHB4XCIsXHJcbiAgICAgICAgICAgIFwiZGlzcGxheVwiOiBcImJsb2NrXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiNjc2M2YxMDItMjNmNy00MzkwLWI0NjMtNGUxYjE0ZTg2NmM5XCI6IHtcclxuICAgICAgICAgICAgXCJwYWRkaW5nXCI6IFwiMTBweFwiLFxyXG4gICAgICAgICAgICBcImRpc3BsYXlcIjogXCJibG9ja1wiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIjkxYzlhZGYwLWQ2MmUtNDU4MC05M2U3LWYzOTU5NGFlNWU3ZFwiOiB7XHJcbiAgICAgICAgICAgIFwicGFkZGluZ1wiOiBcIjEwcHhcIixcclxuICAgICAgICAgICAgXCJkaXNwbGF5XCI6IFwiYmxvY2tcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJlOWZiZWIzOS03MTkzLTQ1MjItOTFiMy03NjFiZDM1NjM5ZDNcIjoge1xyXG4gICAgICAgICAgICBcInBhZGRpbmdcIjogXCIxMHB4XCIsXHJcbiAgICAgICAgICAgIFwiZGlzcGxheVwiOiBcImJsb2NrXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiM2NmNWQ4OWQtMzcwMy00ODNlLWFiNjQtNWE1Yjc4MGFlYzI3XCI6IHtcclxuICAgICAgICAgICAgXCJwYWRkaW5nXCI6IFwiMTBweFwiLFxyXG4gICAgICAgICAgICBcImRpc3BsYXlcIjogXCJibG9ja1wiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImZxOWRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwicGFkZGluZ1wiOiBcIjEwcHhcIixcclxuICAgICAgICAgICAgXCJ3aWR0aFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCIzcWtpZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcImhlaWdodFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJ0N3ZxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcImJhY2tncm91bmRcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiOGNxNmI2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCI0ZGNhNzNiMy05MGViLTQxZTctODY1MS0yYmRjYzkzZjM4NzFcIjoge1xyXG4gICAgICAgICAgICBcInBhZGRpbmdcIjogXCIxMHB4XCJcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJuYW1lU3BhY2VcIjoge1xyXG4gICAgICAgIFwiX3Jvb3ROYW1lU3BhY2VcIjoge1xyXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwic3RhdGVcIixcclxuICAgICAgICAgICAgXCJjaGlsZHJlblwiOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJzdGF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcInN0YXRlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcImM4cTlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJzdGF0ZVwiOiB7XHJcbiAgICAgICAgXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgICAgIFwicmVmXCI6IFwiNDZ2ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCIsXHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcIm51bWJlclwiLFxyXG4gICAgICAgICAgICBcImRlZmF1bHRWYWx1ZVwiOiAwLFxyXG4gICAgICAgICAgICBcIm11dGF0b3JzXCI6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcIm11dGF0b3JcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwiYXM1NWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJtdXRhdG9yXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIjlkcThkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiYzhxOWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcInRpbGVzXCIsXHJcbiAgICAgICAgICAgIFwicmVmXCI6IFwiYzhxOWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCIsXHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcInRhYmxlXCIsXHJcbiAgICAgICAgICAgIFwiZGVmaW5pdGlvblwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInhcIjogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgICAgIFwieVwiOiBcIm51bWJlclwiLFxyXG4gICAgICAgICAgICAgICAgXCJjb2xvclwiOiBcInRleHRcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcImRlZmF1bHRWYWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcIm9wczZkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJ4XCI6IDEyMCxcclxuICAgICAgICAgICAgICAgICAgICBcInlcIjogMTAwLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY29sb3JcIjogXCIjZWFiNjVjXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcIndwdjVkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJ4XCI6IDIwMCxcclxuICAgICAgICAgICAgICAgICAgICBcInlcIjogMTIwLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY29sb3JcIjogXCIjNTNCMkVEXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcInFuMjdkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJ4XCI6IDEzMCxcclxuICAgICAgICAgICAgICAgICAgICBcInlcIjogMjAwLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY29sb3JcIjogXCIjNWJjYzViXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBcImNhOXJkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJ4XCI6IDE1MCxcclxuICAgICAgICAgICAgICAgICAgICBcInlcIjogMTUwLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiY29sb3JcIjogXCIjNGQ0ZDRkXCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJtdXRhdG9yc1wiOiBbXVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcIm11dGF0b3JcIjoge1xyXG4gICAgICAgIFwiYXM1NWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJldmVudFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcImV2ZW50XCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiZDQ4cmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJzdGF0ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInN0YXRlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiNDZ2ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJtdXRhdGlvblwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJwZHE2ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIjlkcThkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwiZXZlbnRcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJldmVudFwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcIjNhNTRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwic3RhdGVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJzdGF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcIjQ2dmRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwibXV0YXRpb25cIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiNDUycWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcImV2ZW50XCI6IHtcclxuICAgICAgICBcImQ0OHJkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcImNsaWNrXCIsXHJcbiAgICAgICAgICAgIFwibXV0YXRvcnNcIjogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwibXV0YXRvclwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJhczU1ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICBcImVtaXR0ZXJcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZVRleHRcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCIxNDgxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjVcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcImRhdGFcIjogW11cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiM2E1NGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwiY2xpY2tcIixcclxuICAgICAgICAgICAgXCJtdXRhdG9yc1wiOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJtdXRhdG9yXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIjlkcThkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIFwiZW1pdHRlclwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInZOb2RlVGV4dFwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcIjM0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==
