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
"use strict";var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};var _snabbdom=require("snabbdom");var _snabbdom2=_interopRequireDefault(_snabbdom);var _h=require("snabbdom/h");var _h2=_interopRequireDefault(_h);var _big=require("../node_modules/big.js");var _big2=_interopRequireDefault(_big);var _ugnis=require("./ugnis");var _ugnis2=_interopRequireDefault(_ugnis);var _app=require("../ugnis_components/app.json");var _app2=_interopRequireDefault(_app);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _objectWithoutProperties(obj,keys){var target={};for(var i in obj){if(keys.indexOf(i)>=0)continue;if(!Object.prototype.hasOwnProperty.call(obj,i))continue;target[i]=obj[i];}return target;}function _defineProperty(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else{obj[key]=value;}return obj;}function _toConsumableArray(arr){if(Array.isArray(arr)){for(var i=0,arr2=Array(arr.length);i<arr.length;i++){arr2[i]=arr[i];}return arr2;}else{return Array.from(arr);}}function updateProps(oldVnode,vnode){var key=void 0,cur=void 0,old=void 0,elm=vnode.elm,props=vnode.data.liveProps||{};for(key in props){cur=props[key];old=elm[key];if(old!==cur)elm[key]=cur;}}var livePropsPlugin={create:updateProps,update:updateProps};var patch=_snabbdom2.default.init([require('snabbdom/modules/class'),require('snabbdom/modules/props'),require('snabbdom/modules/style'),require('snabbdom/modules/eventlisteners'),require('snabbdom/modules/attributes'),livePropsPlugin]);function uuid(){return(""+1e7+-1e3+-4e3+-8e3+-1e11).replace(/[10]/g,function(){return(0|Math.random()*16).toString(16);});}_big2.default.E_POS=1e+6;function moveInArray(array,moveIndex,toIndex){var item=array[moveIndex];var length=array.length;var diff=moveIndex-toIndex;if(diff>0){return[].concat(_toConsumableArray(array.slice(0,toIndex)),[item],_toConsumableArray(array.slice(toIndex,moveIndex)),_toConsumableArray(array.slice(moveIndex+1,length)));}else if(diff<0){return[].concat(_toConsumableArray(array.slice(0,moveIndex)),_toConsumableArray(array.slice(moveIndex+1,toIndex+1)),[item],_toConsumableArray(array.slice(toIndex+1,length)));}return array;}var attachFastClick=require('fastclick');attachFastClick(document.body);var version='0.0.31v';editor(_app2.default);function editor(appDefinition){var savedDefinition=JSON.parse(localStorage.getItem('app_key_'+version));var app=(0,_ugnis2.default)(savedDefinition||appDefinition);var node=document.createElement('div');document.body.appendChild(node);// State
var state={leftOpen:false,rightOpen:true,fullScreen:false,editorRightWidth:350,editorLeftWidth:350,subEditorWidth:350,componentEditorPosition:{x:window.innerWidth-710,y:window.innerHeight/2},appIsFrozen:false,selectedViewNode:{},selectedPipeId:'',selectedStateNodeId:'',selectedViewSubMenu:'props',editingTitleNodeId:'',viewFoldersClosed:{},draggedComponentView:null,draggedComponentStateId:null,hoveredPipe:null,hoveredViewNode:null,mousePosition:{},eventStack:[],definition:savedDefinition||app.definition};// undo/redo
var stateStack=[state.definition];var currentAnimationFrameRequest=null;function setState(newState,timeTraveling){if(newState===state){console.warn('state was mutated, search for a bug');}if(state.definition!==newState.definition){// unselect deleted components and state
if(newState.definition.state[newState.selectedStateNodeId]===undefined){newState=_extends({},newState,{selectedStateNodeId:''});}if(newState.selectedViewNode.ref!==undefined&&newState.definition[newState.selectedViewNode.ref][newState.selectedViewNode.id]===undefined){newState=_extends({},newState,{selectedViewNode:{}});}// undo/redo then render then save
if(!timeTraveling){var currentIndex=stateStack.findIndex(function(a){return a===state.definition;});stateStack=stateStack.slice(0,currentIndex+1).concat(newState.definition);}app.render(newState.definition);setTimeout(function(){return localStorage.setItem('app_key_'+version,JSON.stringify(newState.definition));},0);}if(state.appIsFrozen!==newState.appIsFrozen||state.selectedViewNode!==newState.selectedViewNode){app._freeze(newState.appIsFrozen,VIEW_NODE_SELECTED,newState.selectedViewNode);}if(newState.editingTitleNodeId&&state.editingTitleNodeId!==newState.editingTitleNodeId){// que auto focus
setTimeout(function(){var node=document.querySelectorAll('[data-istitleeditor]')[0];if(node){node.focus();}},0);}state=newState;if(!currentAnimationFrameRequest){window.requestAnimationFrame(render);}}document.addEventListener('click',function(e){// clicked outside
if(state.editingTitleNodeId&&!e.target.dataset.istitleeditor){setState(_extends({},state,{editingTitleNodeId:''}));}});window.addEventListener("resize",function(){render();},false);window.addEventListener("orientationchange",function(){render();},false);document.addEventListener('keydown',function(e){// 83 - s
// 90 - z
// 89 - y
// 32 - space
// 13 - enter
// 27 - escape
if(e.which===83&&(navigator.platform.match("Mac")?e.metaKey:e.ctrlKey)){// TODO garbage collect
e.preventDefault();fetch('/save',{method:'POST',body:JSON.stringify(state.definition),headers:{"Content-Type":"application/json"}});return false;}if(e.which===32&&(navigator.platform.match("Mac")?e.metaKey:e.ctrlKey)){e.preventDefault();FREEZER_CLICKED();}if(!e.shiftKey&&e.which===90&&(navigator.platform.match("Mac")?e.metaKey:e.ctrlKey)){e.preventDefault();var currentIndex=stateStack.findIndex(function(a){return a===state.definition;});if(currentIndex>0){var newDefinition=stateStack[currentIndex-1];setState(_extends({},state,{definition:newDefinition}),true);}}if(e.which===89&&(navigator.platform.match("Mac")?e.metaKey:e.ctrlKey)||e.shiftKey&&e.which===90&&(navigator.platform.match("Mac")?e.metaKey:e.ctrlKey)){e.preventDefault();var _currentIndex=stateStack.findIndex(function(a){return a===state.definition;});if(_currentIndex<stateStack.length-1){var _newDefinition=stateStack[_currentIndex+1];setState(_extends({},state,{definition:_newDefinition}),true);}}if(e.which===13){setState(_extends({},state,{editingTitleNodeId:''}));}if(e.which===27){FULL_SCREEN_CLICKED(false);}});// Listen to app
app.addListener(function(eventId,data,e,previousState,currentState,mutations){setState(_extends({},state,{eventStack:state.eventStack.concat({eventId:eventId,data:data,e:e,previousState:previousState,currentState:currentState,mutations:mutations})}));});// Actions
var openBoxTimeout=null;function VIEW_DRAGGED(nodeRef,parentRef,initialDepth,e){e.preventDefault();var isArrow=e.target.dataset.closearrow;var isTrashcan=e.target.dataset.trashcan;var initialX=e.touches?e.touches[0].pageX:e.pageX;var initialY=e.touches?e.touches[0].pageY:e.pageY;var position=this.elm.getBoundingClientRect();var offsetX=initialX-position.left;var offsetY=initialY-position.top;function drag(e){e.preventDefault();var x=e.touches?e.touches[0].pageX:e.pageX;var y=e.touches?e.touches[0].pageY:e.pageY;if(!state.draggedComponentView){if(Math.abs(initialY-y)>3){setState(_extends({},state,{draggedComponentView:_extends({},nodeRef,{depth:initialDepth}),mousePosition:{x:x-offsetX,y:y-offsetY}}));}}else{setState(_extends({},state,{mousePosition:{x:x-offsetX,y:y-offsetY}}));}return false;}window.addEventListener('mousemove',drag);window.addEventListener('touchmove',drag);function stopDragging(event){var _extends4,_extends8;event.preventDefault();window.removeEventListener('mousemove',drag);window.removeEventListener('touchmove',drag);window.removeEventListener('mouseup',stopDragging);window.removeEventListener('touchend',stopDragging);if(openBoxTimeout){clearTimeout(openBoxTimeout);openBoxTimeout=null;}if(!state.draggedComponentView){if(event.target===e.target&&isArrow){return VIEW_FOLDER_CLICKED(nodeRef.id);}if(event.target===e.target&&isTrashcan){return DELETE_SELECTED_VIEW(nodeRef,parentRef);}return VIEW_NODE_SELECTED(nodeRef);}if(!state.hoveredViewNode){return setState(_extends({},state,{draggedComponentView:null}));}var newParentRef=state.hoveredViewNode.parent;// frame this somewhere on how not to write code
var fixedParents=_extends({},state,{draggedComponentView:null,hoveredViewNode:null,definition:parentRef.id===newParentRef.id?_extends({},state.definition,_defineProperty({},parentRef.ref,_extends({},state.definition[parentRef.ref],_defineProperty({},parentRef.id,_extends({},state.definition[parentRef.ref][parentRef.id],{children:moveInArray(state.definition[parentRef.ref][parentRef.id].children,state.definition[parentRef.ref][parentRef.id].children.findIndex(function(ref){return ref.id===nodeRef.id;}),state.hoveredViewNode.position)}))))):parentRef.ref===newParentRef.ref?_extends({},state.definition,_defineProperty({},parentRef.ref,_extends({},state.definition[parentRef.ref],(_extends4={},_defineProperty(_extends4,parentRef.id,_extends({},state.definition[parentRef.ref][parentRef.id],{children:state.definition[parentRef.ref][parentRef.id].children.filter(function(ref){return ref.id!==nodeRef.id;})})),_defineProperty(_extends4,newParentRef.id,_extends({},state.definition[newParentRef.ref][newParentRef.id],{children:state.definition[newParentRef.ref][newParentRef.id].children.slice(0,state.hoveredViewNode.position).concat(nodeRef,state.definition[newParentRef.ref][newParentRef.id].children.slice(state.hoveredViewNode.position))})),_extends4)))):_extends({},state.definition,(_extends8={},_defineProperty(_extends8,parentRef.ref,_extends({},state.definition[parentRef.ref],_defineProperty({},parentRef.id,_extends({},state.definition[parentRef.ref][parentRef.id],{children:state.definition[parentRef.ref][parentRef.id].children.filter(function(ref){return ref.id!==nodeRef.id;})})))),_defineProperty(_extends8,newParentRef.ref,_extends({},state.definition[newParentRef.ref],_defineProperty({},newParentRef.id,_extends({},state.definition[newParentRef.ref][newParentRef.id],{children:state.definition[newParentRef.ref][newParentRef.id].children.slice(0,state.hoveredViewNode.position).concat(nodeRef,state.definition[newParentRef.ref][newParentRef.id].children.slice(state.hoveredViewNode.position))})))),_extends8))});setState(_extends({},fixedParents,{definition:_extends({},fixedParents.definition,_defineProperty({},nodeRef.ref,_extends({},fixedParents.definition[nodeRef.ref],_defineProperty({},nodeRef.id,_extends({},fixedParents.definition[nodeRef.ref][nodeRef.id],{parent:newParentRef})))))}));return false;}window.addEventListener('mouseup',stopDragging);window.addEventListener('touchend',stopDragging);return false;}function HOVER_MOBILE(e){var elem=document.elementFromPoint(e.touches[0].clientX,e.touches[0].clientY);var moveEvent=new MouseEvent('mousemove',{bubbles:true,cancelable:true,view:window,clientX:e.touches[0].clientX,clientY:e.touches[0].clientY,screenX:e.touches[0].screenX,screenY:e.touches[0].screenY});elem.dispatchEvent(moveEvent);}function VIEW_HOVERED(nodeRef,parentRef,depth,e){if(!state.draggedComponentView){return;}var hitPosition=(e.touches?28:e.layerY)/28;var insertBefore=function insertBefore(){return setState(_extends({},state,{hoveredViewNode:{parent:parentRef,depth:depth,position:state.definition[parentRef.ref][parentRef.id].children.filter(function(ref){return ref.id!==state.draggedComponentView.id;}).findIndex(function(ref){return ref.id===nodeRef.id;})}}));};var insertAfter=function insertAfter(){return setState(_extends({},state,{hoveredViewNode:{parent:parentRef,depth:depth,position:state.definition[parentRef.ref][parentRef.id].children.filter(function(ref){return ref.id!==state.draggedComponentView.id;}).findIndex(function(ref){return ref.id===nodeRef.id;})+1}}));};var insertAsFirst=function insertAsFirst(){return setState(_extends({},state,{hoveredViewNode:{parent:nodeRef,depth:depth+1,position:0}}));};var insertAsLast=function insertAsLast(){return setState(_extends({},state,{hoveredViewNode:{parent:{ref:'vNodeBox',id:'_rootNode'},depth:1,position:state.definition['vNodeBox']['_rootNode'].children.length}}));};var insertAt=function insertAt(toPutRef,index){return setState(_extends({},state,{hoveredViewNode:{parent:toPutRef,depth:depth-1,position:index+1}}));};if(nodeRef.id===state.draggedComponentView.id){var parent=state.definition[parentRef.ref][parentRef.id];// check if the last child, if yes, go to grandparent and drop there after parent
if(parent.children[parent.children.length-1].id===nodeRef.id){if(parentRef.id!=='_rootNode'){var grandparent=state.definition[parent.parent.ref][parent.parent.id];var parentPosition=grandparent.children.findIndex(function(childRef){return childRef.id===parentRef.id;});return insertAt(parent.parent,parentPosition);}}return setState(_extends({},state,{hoveredViewNode:null}));}if(nodeRef.id==='_rootNode'){return insertAsFirst();}if(nodeRef.id==='_lastNode'){return insertAsLast();}// pray to god that you did not make a mistake here
if(state.definition[nodeRef.ref][nodeRef.id].children){// if box
if(state.viewFoldersClosed[nodeRef.id]||state.definition[nodeRef.ref][nodeRef.id].children.length===0){// if closed or empty box
if(hitPosition<0.3){insertBefore();}else{if(!openBoxTimeout){openBoxTimeout=setTimeout(function(){return VIEW_FOLDER_CLICKED(nodeRef.id,false);},500);}insertAsFirst();return;}}else{// open box
if(hitPosition<0.5){insertBefore();}else{insertAsFirst();}}}else{// simple node
if(hitPosition<0.5){insertBefore();}else{insertAfter();}}if(openBoxTimeout){clearTimeout(openBoxTimeout);openBoxTimeout=null;}}function PIPE_HOVERED(pipeRef,e){if(!state.draggedComponentStateId){return;}setState(_extends({},state,{hoveredPipe:pipeRef}));}function COMPONENT_VIEW_DRAGGED(e){var initialX=e.touches?e.touches[0].pageX:e.pageX;var initialY=e.touches?e.touches[0].pageY:e.pageY;var position=this.elm.getBoundingClientRect();var offsetX=initialX-position.left;var offsetY=initialY-position.top;function drag(e){e.preventDefault();var x=e.touches?e.touches[0].pageX:e.pageX;var y=e.touches?e.touches[0].pageY:e.pageY;setState(_extends({},state,{componentEditorPosition:{x:x-offsetX,y:y-offsetY}}));}window.addEventListener('mousemove',drag);window.addEventListener('touchmove',drag);function stopDragging(event){event.preventDefault();window.removeEventListener('mousemove',drag);window.removeEventListener('touchmove',drag);window.removeEventListener('mouseup',stopDragging);window.removeEventListener('touchend',stopDragging);}window.addEventListener('mouseup',stopDragging);window.addEventListener('touchend',stopDragging);}function WIDTH_DRAGGED(widthName,e){e.preventDefault();function resize(e){e.preventDefault();// TODO refactor
var newWidth=window.innerWidth-(e.touches?e.touches[0].pageX:e.pageX);if(widthName==='editorLeftWidth'){newWidth=e.touches?e.touches[0].pageX:e.pageX;}if(widthName==='subEditorWidth'){newWidth=(e.touches?e.touches[0].pageX:e.pageX)-state.componentEditorPosition.x;}if(widthName==='subEditorWidthLeft'){newWidth=state.componentEditorPosition.x+state.subEditorWidth-(e.touches?e.touches[0].pageX:e.pageX);if(newWidth<250){return;}return setState(_extends({},state,{subEditorWidth:newWidth,componentEditorPosition:_extends({},state.componentEditorPosition,{x:e.touches?e.touches[0].pageX:e.pageX})}));}// I probably was drunk
if(widthName!=='subEditorWidth'&&widthName!=='subEditorWidth'&&((widthName==='editorLeftWidth'?state.leftOpen:state.rightOpen)?newWidth<180:newWidth>180)){if(widthName==='editorLeftWidth'){return setState(_extends({},state,{leftOpen:!state.leftOpen}));}return setState(_extends({},state,{rightOpen:!state.rightOpen}));}if(newWidth<250){newWidth=250;}setState(_extends({},state,_defineProperty({},widthName,newWidth)));return false;}window.addEventListener('mousemove',resize);window.addEventListener('touchmove',resize);function stopDragging(e){e.preventDefault();window.removeEventListener('mousemove',resize);window.removeEventListener('touchmove',resize);window.removeEventListener('mouseup',stopDragging);window.removeEventListener('touchend',stopDragging);return false;}window.addEventListener('mouseup',stopDragging);window.addEventListener('touchend',stopDragging);return false;}function STATE_DRAGGED(stateId,e){e.preventDefault();var initialX=e.touches?e.touches[0].pageX:e.pageX;var initialY=e.touches?e.touches[0].pageY:e.pageY;var position=this.elm.getBoundingClientRect();var offsetX=initialX-position.left;var offsetY=initialY-position.top;function drag(e){e.preventDefault();var x=e.touches?e.touches[0].pageX:e.pageX;var y=e.touches?e.touches[0].pageY:e.pageY;if(!state.draggedComponentView){if(Math.abs(initialY-y)>3){setState(_extends({},state,{draggedComponentStateId:stateId,mousePosition:{x:x-offsetX,y:y-offsetY}}));}}else{setState(_extends({},state,{mousePosition:{x:x-offsetX,y:y-offsetY}}));}return false;}window.addEventListener('mousemove',drag);window.addEventListener('touchmove',drag);function stopDragging(event){event.preventDefault();window.removeEventListener('mousemove',drag);window.removeEventListener('touchmove',drag);window.removeEventListener('mouseup',stopDragging);window.removeEventListener('touchend',stopDragging);if(!state.draggedComponentStateId){return STATE_NODE_SELECTED(stateId);}if(!state.hoveredPipe){return setState(_extends({},state,{draggedComponentStateId:null,hoveredPipe:null}));}var pipeDropped=state.definition.pipe[state.hoveredPipe.id];if(pipeDropped.type==='text'){var _extends13,_extends14;if(state.definition.pipe[state.hoveredPipe.id].value.ref&&state.definition.pipe[state.hoveredPipe.id].value.ref==='state'){return setState(_extends({},state,{draggedComponentStateId:null,hoveredPipe:null,definition:_extends({},state.definition,{pipe:_extends({},state.definition.pipe,_defineProperty({},state.hoveredPipe.id,_extends({},state.definition.pipe[state.hoveredPipe.id],{value:{ref:'state',id:state.draggedComponentStateId},transformations:[]})))})}));}var joinIdState=uuid();var joinIdText=uuid();var pipeIdState=uuid();var pipeIdText=uuid();setState(_extends({},state,{draggedComponentStateId:null,hoveredPipe:null,definition:_extends({},state.definition,{pipe:_extends({},state.definition.pipe,(_extends13={},_defineProperty(_extends13,state.hoveredPipe.id,_extends({},state.definition.pipe[state.hoveredPipe.id],{transformations:[{ref:'join',id:joinIdState},{ref:'join',id:joinIdText}].concat(state.definition.pipe[state.hoveredPipe.id].transformations)})),_defineProperty(_extends13,pipeIdState,{type:'text',value:{ref:'state',id:state.draggedComponentStateId},transformations:[]}),_defineProperty(_extends13,pipeIdText,{type:'text',value:'',transformations:[]}),_extends13)),join:_extends({},state.definition.join,(_extends14={},_defineProperty(_extends14,joinIdState,{value:{ref:'pipe',id:pipeIdState}}),_defineProperty(_extends14,joinIdText,{value:{ref:'pipe',id:pipeIdText}}),_extends14))})}));}if(pipeDropped.type==='number'){// you can't drop boolean into number
if(state.definition.state[state.draggedComponentStateId].type==='boolean'){return setState(_extends({},state,{draggedComponentStateId:null,hoveredPipe:null}));}// you can't drop boolean into number
if(state.definition.state[state.draggedComponentStateId].type==='text'){return setState(_extends({},state,{draggedComponentStateId:null,hoveredPipe:null,definition:_extends({},state.definition,{pipe:_extends({},state.definition.pipe,_defineProperty({},state.hoveredPipe.id,_extends({},state.definition.pipe[state.hoveredPipe.id],{value:{ref:'state',id:state.draggedComponentStateId},transformations:[{ref:'length',id:'noop'}]})))})}));}setState(_extends({},state,{draggedComponentStateId:null,hoveredPipe:null,definition:_extends({},state.definition,{pipe:_extends({},state.definition.pipe,_defineProperty({},state.hoveredPipe.id,_extends({},state.definition.pipe[state.hoveredPipe.id],{value:{ref:'state',id:state.draggedComponentStateId}})))})}));}if(pipeDropped.type==='boolean'){if(state.definition.state[state.draggedComponentStateId].type==='number'){var _extends17;var eqId=uuid();var pipeId=uuid();return setState(_extends({},state,{draggedComponentStateId:null,hoveredPipe:null,definition:_extends({},state.definition,{pipe:_extends({},state.definition.pipe,(_extends17={},_defineProperty(_extends17,state.hoveredPipe.id,_extends({},state.definition.pipe[state.hoveredPipe.id],{value:{ref:'state',id:state.draggedComponentStateId},transformations:[{ref:'equal',id:eqId}]})),_defineProperty(_extends17,pipeId,{type:'number',value:0,transformations:[]}),_extends17)),equal:_extends({},state.definition.equal,_defineProperty({},eqId,{value:{ref:'pipe',id:pipeId}}))})}));}// you can't drop boolean into number
if(state.definition.state[state.draggedComponentStateId].type==='text'){var _extends19;var _eqId=uuid();var _pipeId=uuid();return setState(_extends({},state,{draggedComponentStateId:null,hoveredPipe:null,definition:_extends({},state.definition,{pipe:_extends({},state.definition.pipe,(_extends19={},_defineProperty(_extends19,state.hoveredPipe.id,_extends({},state.definition.pipe[state.hoveredPipe.id],{value:{ref:'state',id:state.draggedComponentStateId},transformations:[{ref:'equal',id:_eqId}]})),_defineProperty(_extends19,_pipeId,{type:'text',value:'Default text',transformations:[]}),_extends19)),equal:_extends({},state.definition.equal,_defineProperty({},_eqId,{value:{ref:'pipe',id:_pipeId}}))})}));}setState(_extends({},state,{draggedComponentStateId:null,hoveredPipe:null,definition:_extends({},state.definition,{pipe:_extends({},state.definition.pipe,_defineProperty({},state.hoveredPipe.id,_extends({},state.definition.pipe[state.hoveredPipe.id],{value:{ref:'state',id:state.draggedComponentStateId}})))})}));}}window.addEventListener('mouseup',stopDragging);window.addEventListener('touchend',stopDragging);}function OPEN_SIDEBAR(side){if(side==='left'){return setState(_extends({},state,{leftOpen:!state.leftOpen}));}if(side==='right'){return setState(_extends({},state,{rightOpen:!state.rightOpen}));}}function FREEZER_CLICKED(){setState(_extends({},state,{appIsFrozen:!state.appIsFrozen}));}function VIEW_FOLDER_CLICKED(nodeId,forcedValue){setState(_extends({},state,{viewFoldersClosed:_extends({},state.viewFoldersClosed,_defineProperty({},nodeId,forcedValue!==undefined?forcedValue:!state.viewFoldersClosed[nodeId]))}));}function VIEW_NODE_SELECTED(ref){setState(_extends({},state,{selectedViewNode:ref}));}function UNSELECT_VIEW_NODE(selfOnly,stopPropagation,e){if(stopPropagation){e.stopPropagation();}if(selfOnly&&e.target!==this.elm){return;}setState(_extends({},state,{selectedViewNode:{}}));}function STATE_NODE_SELECTED(nodeId){setState(_extends({},state,{selectedStateNodeId:nodeId}));}function UNSELECT_STATE_NODE(e){if(e.target===this.elm){setState(_extends({},state,{selectedStateNodeId:''}));}}function ADD_NODE(nodeRef,type){if(!nodeRef.ref||!state.definition[nodeRef.ref][nodeRef.id]||!state.definition[nodeRef.ref][nodeRef.id].children){if(state.selectedViewNode.id&&state.selectedViewNode.id!=='_rootNode'){nodeRef=state.definition[state.selectedViewNode.ref][state.selectedViewNode.id].parent;}else{nodeRef={ref:'vNodeBox',id:'_rootNode'};}}var nodeId=nodeRef.id;var newNodeId=uuid();var newStyleId=uuid();var newStyle={};if(type==='box'){var _extends23,_extends28;var newNode={title:'box',parent:nodeRef,style:{ref:'style',id:newStyleId},children:[]};return setState(_extends({},state,{selectedViewNode:{ref:'vNodeBox',id:newNodeId},definition:nodeRef.ref==='vNodeBox'?_extends({},state.definition,{vNodeBox:_extends({},state.definition.vNodeBox,(_extends23={},_defineProperty(_extends23,nodeId,_extends({},state.definition.vNodeBox[nodeId],{children:state.definition.vNodeBox[nodeId].children.concat({ref:'vNodeBox',id:newNodeId})})),_defineProperty(_extends23,newNodeId,newNode),_extends23)),style:_extends({},state.definition.style,_defineProperty({},newStyleId,newStyle))}):_extends({},state.definition,(_extends28={},_defineProperty(_extends28,nodeRef.ref,_extends({},state.definition[nodeRef.ref],_defineProperty({},nodeId,_extends({},state.definition[nodeRef.ref][nodeId],{children:state.definition[nodeRef.ref][nodeId].children.concat({ref:'vNodeBox',id:newNodeId})})))),_defineProperty(_extends28,"vNodeBox",_extends({},state.definition.vNodeBox,_defineProperty({},newNodeId,newNode))),_defineProperty(_extends28,"style",_extends({},state.definition.style,_defineProperty({},newStyleId,newStyle))),_extends28))}));}if(type==='text'){var _extends33;var pipeId=uuid();var _newNode={title:'text',parent:nodeRef,style:{ref:'style',id:newStyleId},value:{ref:'pipe',id:pipeId}};var newPipe={type:'text',value:'Default Text',transformations:[]};return setState(_extends({},state,{selectedViewNode:{ref:'vNodeText',id:newNodeId},definition:_extends({},state.definition,(_extends33={pipe:_extends({},state.definition.pipe,_defineProperty({},pipeId,newPipe))},_defineProperty(_extends33,nodeRef.ref,_extends({},state.definition[nodeRef.ref],_defineProperty({},nodeId,_extends({},state.definition[nodeRef.ref][nodeId],{children:state.definition[nodeRef.ref][nodeId].children.concat({ref:'vNodeText',id:newNodeId})})))),_defineProperty(_extends33,"vNodeText",_extends({},state.definition.vNodeText,_defineProperty({},newNodeId,_newNode))),_defineProperty(_extends33,"style",_extends({},state.definition.style,_defineProperty({},newStyleId,newStyle))),_extends33))}));}if(type==='image'){var _extends38;var _pipeId2=uuid();var _newNode2={title:'image',parent:nodeRef,style:{ref:'style',id:newStyleId},src:{ref:'pipe',id:_pipeId2}};var _newPipe={type:'text',value:'https://www.ugnis.com/images/logo256x256.png',transformations:[]};return setState(_extends({},state,{selectedViewNode:{ref:'vNodeImage',id:newNodeId},definition:_extends({},state.definition,(_extends38={pipe:_extends({},state.definition.pipe,_defineProperty({},_pipeId2,_newPipe))},_defineProperty(_extends38,nodeRef.ref,_extends({},state.definition[nodeRef.ref],_defineProperty({},nodeId,_extends({},state.definition[nodeRef.ref][nodeId],{children:state.definition[nodeRef.ref][nodeId].children.concat({ref:'vNodeImage',id:newNodeId})})))),_defineProperty(_extends38,"vNodeImage",_extends({},state.definition.vNodeImage,_defineProperty({},newNodeId,_newNode2))),_defineProperty(_extends38,"style",_extends({},state.definition.style,_defineProperty({},newStyleId,newStyle))),_extends38))}));}if(type==='if'){var _extends40,_extends44;var _pipeId3=uuid();var _newNode3={title:'conditional',parent:nodeRef,value:{ref:'pipe',id:_pipeId3},children:[]};var _newPipe2={type:'boolean',value:true,transformations:[]};return setState(_extends({},state,{selectedViewNode:{ref:'vNodeIf',id:newNodeId},definition:nodeRef.ref==='vNodeIf'?_extends({},state.definition,{pipe:_extends({},state.definition.pipe,_defineProperty({},_pipeId3,_newPipe2)),vNodeIf:_extends({},state.definition.vNodeIf,(_extends40={},_defineProperty(_extends40,nodeId,_extends({},state.definition.vNodeIf[nodeId],{children:state.definition.vNodeIf[nodeId].children.concat({ref:'vNodeIf',id:newNodeId})})),_defineProperty(_extends40,newNodeId,_newNode3),_extends40))}):_extends({},state.definition,(_extends44={pipe:_extends({},state.definition.pipe,_defineProperty({},_pipeId3,_newPipe2))},_defineProperty(_extends44,nodeRef.ref,_extends({},state.definition[nodeRef.ref],_defineProperty({},nodeId,_extends({},state.definition[nodeRef.ref][nodeId],{children:state.definition[nodeRef.ref][nodeId].children.concat({ref:'vNodeIf',id:newNodeId})})))),_defineProperty(_extends44,"vNodeIf",_extends({},state.definition.vNodeIf,_defineProperty({},newNodeId,_newNode3))),_extends44))}));}if(type==='input'){var _extends45,_extends53;var stateId=uuid();var eventId=uuid();var mutatorId=uuid();var pipeInputId=uuid();var pipeMutatorId=uuid();var _newNode4={title:'input',parent:nodeRef,style:{ref:'style',id:newStyleId},value:{ref:'pipe',id:pipeInputId},input:{ref:'event',id:eventId}};var newPipeInput={type:'text',value:{ref:'state',id:stateId},transformations:[]};var newPipeMutator={type:'text',value:{ref:'eventData',id:'_input'},transformations:[]};var newState={title:'input value',type:'text',ref:stateId,defaultValue:'Default text',mutators:[{ref:'mutator',id:mutatorId}]};var newMutator={event:{ref:'event',id:eventId},state:{ref:'state',id:stateId},mutation:{ref:'pipe',id:pipeMutatorId}};var newEvent={type:'input',title:'update input',mutators:[{ref:'mutator',id:mutatorId}],emitter:{ref:'vNodeInput',id:newNodeId},data:[{ref:'eventData',id:'_input'}]};return setState(_extends({},state,{selectedViewNode:{ref:'vNodeInput',id:newNodeId},definition:_extends({},state.definition,(_extends53={pipe:_extends({},state.definition.pipe,(_extends45={},_defineProperty(_extends45,pipeInputId,newPipeInput),_defineProperty(_extends45,pipeMutatorId,newPipeMutator),_extends45))},_defineProperty(_extends53,nodeRef.ref,_extends({},state.definition[nodeRef.ref],_defineProperty({},nodeId,_extends({},state.definition[nodeRef.ref][nodeId],{children:state.definition[nodeRef.ref][nodeId].children.concat({ref:'vNodeInput',id:newNodeId})})))),_defineProperty(_extends53,"vNodeInput",_extends({},state.definition.vNodeInput,_defineProperty({},newNodeId,_newNode4))),_defineProperty(_extends53,"style",_extends({},state.definition.style,_defineProperty({},newStyleId,newStyle))),_defineProperty(_extends53,"nameSpace",_extends({},state.definition.nameSpace,_defineProperty({},'_rootNameSpace',_extends({},state.definition.nameSpace['_rootNameSpace'],{children:state.definition.nameSpace['_rootNameSpace'].children.concat({ref:'state',id:stateId})})))),_defineProperty(_extends53,"state",_extends({},state.definition.state,_defineProperty({},stateId,newState))),_defineProperty(_extends53,"mutator",_extends({},state.definition.mutator,_defineProperty({},mutatorId,newMutator))),_defineProperty(_extends53,"event",_extends({},state.definition.event,_defineProperty({},eventId,newEvent))),_extends53))}));}}function ADD_STATE(namespaceId,type){var newStateId=uuid();var newState=void 0;if(type==='text'){newState={title:'new text',ref:newStateId,type:'text',defaultValue:'Default text',mutators:[]};}if(type==='number'){newState={title:'new number',ref:newStateId,type:'number',defaultValue:0,mutators:[]};}if(type==='boolean'){newState={title:'new boolean',type:'boolean',ref:newStateId,defaultValue:true,mutators:[]};}if(type==='table'){newState={title:'new table',type:'table',ref:newStateId,defaultValue:{},mutators:[]};}if(type==='folder'){var _extends54;newState={title:'new folder',children:[]};return setState(_extends({},state,{definition:_extends({},state.definition,{nameSpace:_extends({},state.definition.nameSpace,(_extends54={},_defineProperty(_extends54,namespaceId,_extends({},state.definition.nameSpace[namespaceId],{children:state.definition.nameSpace[namespaceId].children.concat({ref:'nameSpace',id:newStateId})})),_defineProperty(_extends54,newStateId,newState),_extends54))})}));}setState(_extends({},state,{definition:_extends({},state.definition,{nameSpace:_extends({},state.definition.nameSpace,_defineProperty({},namespaceId,_extends({},state.definition.nameSpace[namespaceId],{children:state.definition.nameSpace[namespaceId].children.concat({ref:'state',id:newStateId})}))),state:_extends({},state.definition.state,_defineProperty({},newStateId,newState))})}));}function ADD_DEFAULT_STYLE(styleId,key){var pipeId=uuid();var defaults={'background':'white','border':'1px solid black','outline':'1px solid black','cursor':'pointer','color':'black','display':'block','top':'0px','bottom':'0px','left':'0px','right':'0px','flex':'1 1 auto','justifyContent':'center','alignItems':'center','maxWidth':'100%','maxHeight':'100%','minWidth':'100%','minHeight':'100%','position':'absolute','overflow':'auto','height':'500px','width':'500px','font':'italic 2em "Comic Sans MS", cursive, sans-serif','margin':'10px','padding':'10px'};setState(_extends({},state,{definition:_extends({},state.definition,{pipe:_extends({},state.definition.pipe,_defineProperty({},pipeId,{type:'text',value:defaults[key],transformations:[]})),style:_extends({},state.definition.style,_defineProperty({},styleId,_extends({},state.definition.style[styleId],_defineProperty({},key,{ref:'pipe',id:pipeId}))))})}));}function SELECT_VIEW_SUBMENU(newId){setState(_extends({},state,{selectedViewSubMenu:newId}));}function EDIT_VIEW_NODE_TITLE(nodeId){setState(_extends({},state,{editingTitleNodeId:nodeId}));}function DELETE_SELECTED_VIEW(nodeRef,parentRef){if(nodeRef.id==='_rootNode'){if(state.definition.vNodeBox['_rootNode'].children.length===0){return;}// immutably remove all nodes except rootNode
return setState(_extends({},state,{definition:_extends({},state.definition,{vNodeBox:{'_rootNode':_extends({},state.definition.vNodeBox['_rootNode'],{children:[]})}}),selectedViewNode:{}}));}setState(_extends({},state,{definition:_extends({},state.definition,_defineProperty({},parentRef.ref,_extends({},state.definition[parentRef.ref],_defineProperty({},parentRef.id,_extends({},state.definition[parentRef.ref][parentRef.id],{children:state.definition[parentRef.ref][parentRef.id].children.filter(function(ref){return ref.id!==nodeRef.id;})}))))),selectedViewNode:{}}));}function CHANGE_VIEW_NODE_TITLE(nodeRef,e){e.preventDefault();var nodeId=nodeRef.id;var nodeType=nodeRef.ref;setState(_extends({},state,{definition:_extends({},state.definition,_defineProperty({},nodeType,_extends({},state.definition[nodeType],_defineProperty({},nodeId,_extends({},state.definition[nodeType][nodeId],{title:e.target.value})))))}));}function CHANGE_STATE_NODE_TITLE(nodeId,e){e.preventDefault();setState(_extends({},state,{definition:_extends({},state.definition,{state:_extends({},state.definition.state,_defineProperty({},nodeId,_extends({},state.definition.state[nodeId],{title:e.target.value})))})}));}function CHANGE_NAMESPACE_TITLE(nodeId,e){e.preventDefault();setState(_extends({},state,{definition:_extends({},state.definition,{nameSpace:_extends({},state.definition.nameSpace,_defineProperty({},nodeId,_extends({},state.definition.nameSpace[nodeId],{title:e.target.value})))})}));}function CHANGE_CURRENT_STATE_TEXT_VALUE(stateId,e){app.setCurrentState(_extends({},app.getCurrentState(),_defineProperty({},stateId,e.target.value)));render();}function CHANGE_CURRENT_STATE_NUMBER_VALUE(stateId,e){// todo big throws error instead of returning NaN... fix, rewrite or hack
try{if((0,_big2.default)(e.target.value).toString()!==app.getCurrentState()[stateId].toString()){app.setCurrentState(_extends({},app.getCurrentState(),_defineProperty({},stateId,(0,_big2.default)(e.target.value))));render();}}catch(err){}}function CHANGE_STATIC_VALUE(ref,propertyName,type,e){var value=e.target.value;if(type==='number'){try{value=(0,_big2.default)(e.target.value);}catch(err){return;}}if(type==='boolean'){value=value===true||value==='true'?true:false;}setState(_extends({},state,{definition:_extends({},state.definition,_defineProperty({},ref.ref,_extends({},state.definition[ref.ref],_defineProperty({},ref.id,_extends({},state.definition[ref.ref][ref.id],_defineProperty({},propertyName,value))))))}));}function ADD_EVENT(propertyName,node){var _extends74;var ref=state.selectedViewNode;var eventId=uuid();setState(_extends({},state,{definition:_extends({},state.definition,(_extends74={},_defineProperty(_extends74,ref.ref,_extends({},state.definition[ref.ref],_defineProperty({},ref.id,_extends({},state.definition[ref.ref][ref.id],_defineProperty({},propertyName,{ref:'event',id:eventId}))))),_defineProperty(_extends74,"event",_extends({},state.definition.event,_defineProperty({},eventId,{type:propertyName,emitter:node,mutators:[],data:[]}))),_extends74))}));}function SELECT_PIPE(pipeId,e){e.stopPropagation();setState(_extends({},state,{selectedPipeId:pipeId}));}function CHANGE_PIPE_VALUE_TO_STATE(pipeId){if(!state.selectedStateNodeId||state.selectedStateNodeId===state.definition.pipe[pipeId].value.id){return;}setState(_extends({},state,{definition:_extends({},state.definition,{pipe:_extends({},state.definition.pipe,_defineProperty({},pipeId,_extends({},state.definition.pipe[pipeId],{value:{ref:'state',id:state.selectedStateNodeId},transformations:[]})))})}));}function ADD_TRANSFORMATION(pipeId,transformation){if(transformation==='join'){var _extends77;var newPipeId=uuid();var joinId=uuid();setState(_extends({},state,{definition:_extends({},state.definition,{join:_extends({},state.definition.join,_defineProperty({},joinId,{value:{ref:'pipe',id:newPipeId}})),pipe:_extends({},state.definition.pipe,(_extends77={},_defineProperty(_extends77,newPipeId,{type:'text',value:'Default text',transformations:[]}),_defineProperty(_extends77,pipeId,_extends({},state.definition.pipe[pipeId],{transformations:state.definition.pipe[pipeId].transformations.concat({ref:'join',id:joinId})})),_extends77))})}));}if(transformation==='toUpperCase'){var newId=uuid();setState(_extends({},state,{definition:_extends({},state.definition,{toUpperCase:_extends({},state.definition.toUpperCase,_defineProperty({},newId,{})),pipe:_extends({},state.definition.pipe,_defineProperty({},pipeId,_extends({},state.definition.pipe[pipeId],{transformations:state.definition.pipe[pipeId].transformations.concat({ref:'toUpperCase',id:newId})})))})}));}if(transformation==='toLowerCase'){var _newId=uuid();setState(_extends({},state,{definition:_extends({},state.definition,{toLowerCase:_extends({},state.definition.toLowerCase,_defineProperty({},_newId,{})),pipe:_extends({},state.definition.pipe,_defineProperty({},pipeId,_extends({},state.definition.pipe[pipeId],{transformations:state.definition.pipe[pipeId].transformations.concat({ref:'toLowerCase',id:_newId})})))})}));}if(transformation==='add'){var _extends83;var _newPipeId=uuid();var addId=uuid();setState(_extends({},state,{definition:_extends({},state.definition,{add:_extends({},state.definition.add,_defineProperty({},addId,{value:{ref:'pipe',id:_newPipeId}})),pipe:_extends({},state.definition.pipe,(_extends83={},_defineProperty(_extends83,_newPipeId,{type:'number',value:0,transformations:[]}),_defineProperty(_extends83,pipeId,_extends({},state.definition.pipe[pipeId],{transformations:state.definition.pipe[pipeId].transformations.concat({ref:'add',id:addId})})),_extends83))})}));}if(transformation==='subtract'){var _extends85;var _newPipeId2=uuid();var subtractId=uuid();setState(_extends({},state,{definition:_extends({},state.definition,{subtract:_extends({},state.definition.subtract,_defineProperty({},subtractId,{value:{ref:'pipe',id:_newPipeId2}})),pipe:_extends({},state.definition.pipe,(_extends85={},_defineProperty(_extends85,_newPipeId2,{type:'number',value:0,transformations:[]}),_defineProperty(_extends85,pipeId,_extends({},state.definition.pipe[pipeId],{transformations:state.definition.pipe[pipeId].transformations.concat({ref:'subtract',id:subtractId})})),_extends85))})}));}}function RESET_APP_STATE(){app.setCurrentState(app.createDefaultState());setState(_extends({},state,{eventStack:[]}));}function RESET_APP_DEFINITION(){if(state.definition!==appDefinition){setState(_extends({},state,{definition:_extends({},appDefinition)}));}}function FULL_SCREEN_CLICKED(value){if(value!==state.fullScreen){setState(_extends({},state,{fullScreen:value}));}}function SAVE_DEFAULT(stateId){setState(_extends({},state,{definition:_extends({},state.definition,{state:_extends({},state.definition.state,_defineProperty({},stateId,_extends({},state.definition.state[stateId],{defaultValue:app.getCurrentState()[stateId]})))})}));}function DELETE_STATE(stateId){var _state$definition$sta=state.definition.state,deletedState=_state$definition$sta[stateId],newState=_objectWithoutProperties(_state$definition$sta,[stateId]);setState(_extends({},state,{definition:_extends({},state.definition,{state:newState,nameSpace:_extends({},state.definition.nameSpace,{'_rootNameSpace':_extends({},state.definition.nameSpace['_rootNameSpace'],{children:state.definition.nameSpace['_rootNameSpace'].children.filter(function(ref){return ref.id!==stateId;})})})})}));}var boxIcon=function boxIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'layers');};var ifIcon=function ifIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'},style:{transform:'rotate(90deg)'}},'call_split');};var numberIcon=function numberIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'looks_one');};var listIcon=function listIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'view_list');};var inputIcon=function inputIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'input');};var textIcon=function textIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'text_fields');};var deleteIcon=function deleteIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons','data-trashcan':true}},'delete_forever');};var clearIcon=function clearIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'clear');};var folderIcon=function folderIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'folder');};var saveIcon=function saveIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'check');};var imageIcon=function imageIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'image');};var appIcon=function appIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'},style:{fontSize:'18px'}},'description');};var arrowIcon=function arrowIcon(rotate){return(0,_h2.default)('i',{attrs:{class:'material-icons','data-closearrow':true},style:{transition:'all 0.2s',transform:rotate?'rotate(-90deg)':'rotate(0deg)',cursor:'pointer'}},'expand_more');};function render(){var currentRunningState=app.getCurrentState();var dragComponentLeft=(0,_h2.default)('div',{on:{mousedown:[WIDTH_DRAGGED,'editorLeftWidth'],touchstart:[WIDTH_DRAGGED,'editorLeftWidth']},style:{position:'absolute',right:'0',transform:'translateX(100%)',top:'0',width:'10px',height:'100%',textAlign:'center',fontSize:'1em',opacity:'0',cursor:'col-resize'}});var openComponentLeft=(0,_h2.default)('div',{on:{mousedown:[OPEN_SIDEBAR,'left'],touchstart:[OPEN_SIDEBAR,'left']},style:{position:'absolute',right:'-3px',top:'50%',transform:'translateZ(0) translateX(100%) translateY(-50%)',width:'15px',height:'10%',textAlign:'center',fontSize:'1em',borderRadius:'0 5px 5px 0',background:'#5d5d5d',boxShadow:'inset 0 0 2px 7px #222',cursor:'pointer'}});var openComponentRight=(0,_h2.default)('div',{on:{mousedown:[OPEN_SIDEBAR,'right'],touchstart:[OPEN_SIDEBAR,'right']},style:{position:'absolute',left:'-3px',top:'50%',transform:'translateZ(0) translateX(-100%) translateY(-50%)',width:'15px',height:'10%',textAlign:'center',fontSize:'1em',borderRadius:'5px 0 0 5px',background:'#5d5d5d',boxShadow:'inset 0 0 2px 7px #222',cursor:'pointer'}});var dragComponentRight=(0,_h2.default)('div',{on:{mousedown:[WIDTH_DRAGGED,'editorRightWidth'],touchstart:[WIDTH_DRAGGED,'editorRightWidth']},style:{position:'absolute',left:'0',transform:'translateX(-100%)',top:'0',width:'10px',height:'100%',textAlign:'center',fontSize:'1em',opacity:'0',cursor:'col-resize'}});var dragSubComponentRight=(0,_h2.default)('div',{on:{mousedown:[WIDTH_DRAGGED,'subEditorWidth'],touchstart:[WIDTH_DRAGGED,'subEditorWidth']},style:{position:'absolute',right:'2px',transform:'translateX(100%)',top:'0',width:'10px',height:'100%',textAlign:'center',fontSize:'1em',opacity:0,cursor:'col-resize'}});var dragSubComponentLeft=(0,_h2.default)('div',{on:{mousedown:[WIDTH_DRAGGED,'subEditorWidthLeft'],touchstart:[WIDTH_DRAGGED,'subEditorWidthLeft']},style:{position:'absolute',left:'2px',transform:'translateX(-100%)',top:'0',width:'10px',height:'100%',textAlign:'center',fontSize:'1em',opacity:0,cursor:'col-resize'}});function emberEditor(ref,type){var pipe=state.definition[ref.ref][ref.id];function listTransformations(transformations,transType){return transformations.map(function(transRef,index){var transformer=state.definition[transRef.ref][transRef.id];if(transRef.ref==='equal'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{key:index,style:{color:'#bdbdbd',cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1'}},transRef.ref),(0,_h2.default)('span',{style:{flex:'0',color:transformations.length-1!==index?'#bdbdbd':transType===type?'green':'red'}},'true/false')]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},[emberEditor(transformer.value,type)])]);}if(transRef.ref==='add'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{key:index,style:{color:'#bdbdbd',cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1'}},transRef.ref),(0,_h2.default)('span',{style:{flex:'0',color:transformations.length-1!==index?'#bdbdbd':transType===type?'green':'red'}},'number')]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},[emberEditor(transformer.value,'number')])]);}if(transRef.ref==='subtract'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{key:index,style:{color:'#bdbdbd',cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1'}},transRef.ref),(0,_h2.default)('span',{style:{flex:'0',color:transformations.length-1!==index?'#bdbdbd':transType===type?'green':'red'}},'number')]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},[emberEditor(transformer.value,'number')])]);}if(transRef.ref==='multiply'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{key:index,style:{color:'#bdbdbd',cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1'}},transRef.ref),(0,_h2.default)('span',{style:{flex:'0',color:transformations.length-1!==index?'#bdbdbd':transType===type?'green':'red'}},'number')]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},[emberEditor(transformer.value,'number')])]);}if(transRef.ref==='divide'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{key:index,style:{color:'#bdbdbd',cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1'}},transRef.ref),(0,_h2.default)('span',{style:{flex:'0',color:transformations.length-1!==index?'#bdbdbd':transType===type?'green':'red'}},'number')]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},[emberEditor(transformer.value,'number')])]);}if(transRef.ref==='remainder'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{key:index,style:{color:'#bdbdbd',cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1'}},transRef.ref),(0,_h2.default)('span',{style:{flex:'0',color:transformations.length-1!==index?'#bdbdbd':transType===type?'green':'red'}},'number')]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},[emberEditor(transformer.value,'number')])]);}// if (transRef.ref === 'branch') {
//     if(resolve(transformer.predicate)){
//         value = transformValue(value, transformer.then)
//     } else {
//         value = transformValue(value, transformer.else)
//     }
// }
if(transRef.ref==='join'){return(0,_h2.default)('span',{},[emberEditor(transformer.value,transType)]);}if(transRef.ref==='toUpperCase'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{style:{cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1',color:'#bdbdbd'}},transRef.ref)])]);}if(transRef.ref==='toLowerCase'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{style:{cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1',color:'#bdbdbd'}},transRef.ref)])]);}if(transRef.ref==='length'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{style:{cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1',color:'#bdbdbd'}},transRef.ref)])]);}});}function genTransformators(){var selectedPipe=state.definition.pipe[state.selectedPipeId];return[(0,_h2.default)('span')];// TODO rethink
return[(0,_h2.default)('div',{style:{position:'fixed',top:state.componentEditorPosition.y+'px',left:state.componentEditorPosition.x-307+'px',height:'50%',width:'300px',display:'flex'}},[(0,_h2.default)('div',{style:{border:'3px solid #222',flex:'1 1 0%',background:'#4d4d4d',marginBottom:'10px'}},[(0,_h2.default)('div',{style:{display:'flex',cursor:'default',alignItems:'center',background:'#222',paddingTop:'2px',paddingBottom:'5px',color:'#53B2ED',minWidth:'100%'}},[(0,_h2.default)('span',{style:{flex:'5 5 auto',margin:'0 5px',minWidth:'0',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',fontSize:'0.8em'}},'Ugnis Toolbox'),(0,_h2.default)('span',{style:{flex:'0 0 auto',marginLeft:'auto',cursor:'pointer',marginRight:'5px',color:'white',display:'inline-flex'},on:{mousedown:[SELECT_PIPE,''],touchstart:[SELECT_PIPE,'']}},[clearIcon()])])])])];}if(typeof pipe.value==='string'){return(0,_h2.default)('div',{style:{position:'relative'}},[(0,_h2.default)('div',{style:{display:'flex',alignItems:'baseline'},on:{click:[SELECT_PIPE,ref.id]}},[(0,_h2.default)('span',{style:{flex:'0 0 auto',position:'relative',transform:'translateZ(0)'}},[(0,_h2.default)('span',{style:{opacity:'0',display:'inline-block',whiteSpace:'pre',padding:'0 5px 2px 5px',borderBottom:'2px solid white'}},pipe.value),(0,_h2.default)('input',{attrs:{type:'text'},style:{color:'white',outline:'none',boxShadow:'none',textAlign:'center',display:'inline',border:'none',borderBottom:'2px solid white',background:'none',font:'inherit',position:'absolute',top:'0',left:'0',width:'100%',flex:'0 0 auto'},on:{input:[CHANGE_STATIC_VALUE,ref,'value','text'],mousemove:[PIPE_HOVERED,ref]},liveProps:{value:pipe.value}})])].concat(_toConsumableArray(listTransformations(pipe.transformations,pipe.type)))),(0,_h2.default)('div',state.selectedPipeId===ref.id?genTransformators():[])]);}if(pipe.value===true||pipe.value===false){return(0,_h2.default)('select',{liveProps:{value:pipe.value.toString()},style:{},on:{click:[SELECT_PIPE,ref.id],input:[CHANGE_STATIC_VALUE,ref,'value','boolean'],mousemove:[PIPE_HOVERED,ref]}},[(0,_h2.default)('option',{attrs:{value:'true'},style:{color:'black'}},['true']),(0,_h2.default)('option',{attrs:{value:'false'},style:{color:'black'}},['false'])]);}if(!isNaN(parseFloat(Number(pipe.value)))&&isFinite(Number(pipe.value))){return(0,_h2.default)('div',{style:{position:'relative'}},[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center'},on:{click:[SELECT_PIPE,ref.id]}},[(0,_h2.default)('input',{attrs:{type:'number'},style:{background:'none',outline:'none',padding:'0',margin:'0',border:'none',borderRadius:'0',display:'inline-block',width:'100%',color:'white',textDecoration:'underline'},on:{input:[CHANGE_STATIC_VALUE,ref,'value','number'],mousemove:[PIPE_HOVERED,ref]},liveProps:{value:Number(pipe.value)}}),(0,_h2.default)('div',{style:{flex:'0',cursor:'default',color:pipe.transformations.length>0?'#bdbdbd':type==='number'?'green':'red'}},'number')]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},listTransformations(pipe.transformations,pipe.type)),(0,_h2.default)('div',state.selectedPipeId===ref.id?genTransformators():[])]);}if(pipe.value.ref==='state'){var displState=state.definition[pipe.value.ref][pipe.value.id];return(0,_h2.default)('div',{style:{position:'relative',cursor:'pointer'}},[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center'},on:{click:[SELECT_PIPE,ref.id],mousemove:[PIPE_HOVERED,ref]}},[(0,_h2.default)('div',{style:{flex:'1'}},[(0,_h2.default)('span',{style:{whiteSpace:'nowrap',flex:'0 0 auto',display:'inline-block',position:'relative',transform:'translateZ(0)',boxShadow:'inset 0 0 0 2px '+(state.selectedStateNodeId===pipe.value.id?'#eab65c':'#828282'),background:'#444',padding:'4px 7px'}},[(0,_h2.default)('span',{style:{color:'white',display:'inline-block'},on:{click:[STATE_NODE_SELECTED,pipe.value.id]}},displState.title)])])]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},listTransformations(pipe.transformations,pipe.type)),(0,_h2.default)('div',state.selectedPipeId===ref.id?genTransformators():[])]);}if(pipe.value.ref==='listValue'){return(0,_h2.default)('div','TODO');}if(pipe.value.ref==='eventData'){var eventData=state.definition[pipe.value.ref][pipe.value.id];return(0,_h2.default)('div',[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center'},on:{click:[SELECT_PIPE,ref.id]}},[(0,_h2.default)('div',{style:{flex:'1'}},[(0,_h2.default)('div',{style:{cursor:'pointer',color:state.selectedStateNodeId===pipe.value.id?'#eab65c':'white',padding:'2px 5px',margin:'3px 3px 0 0',border:'2px solid '+(state.selectedStateNodeId===pipe.value.id?'#eab65c':'white'),display:'inline-block'},on:{click:[STATE_NODE_SELECTED,pipe.value.id]}},[eventData.title])]),(0,_h2.default)('div',{style:{flex:'0',cursor:'default',color:pipe.transformations.length>0?'#bdbdbd':eventData.type===type?'green':'red'}},eventData.type)]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},listTransformations(pipe.transformations,pipe.type))]);}}function listState(stateId){var currentState=state.definition.state[stateId];function editingNode(){return(0,_h2.default)('input',{style:{color:'white',outline:'none',padding:'4px 7px',boxShadow:'none',display:'inline',border:'none',background:'none',font:'inherit',position:'absolute',top:'0',left:'0',width:'100%',flex:'0 0 auto'},on:{input:[CHANGE_STATE_NODE_TITLE,stateId]},liveProps:{value:currentState.title},attrs:{'data-istitleeditor':true}});}return(0,_h2.default)('div',{style:{cursor:'pointer',position:'relative',fontSize:'14px'}},[(0,_h2.default)('span',{style:{display:'flex',flexWrap:'wrap',marginTop:'6px'}},[(0,_h2.default)('span',{style:{flex:'0 0 auto',position:'relative',transform:'translateZ(0)',margin:'0 7px 0 0',boxShadow:'inset 0 0 0 2px '+(state.selectedStateNodeId===stateId?'#eab65c':'#828282'),background:'#444',padding:'4px 7px'}},[(0,_h2.default)('span',{style:{opacity:state.editingTitleNodeId===stateId?'0':'1',color:'white',display:'inline-block'},on:{mousedown:[STATE_DRAGGED,stateId],touchstart:[STATE_DRAGGED,stateId],touchmove:[HOVER_MOBILE],dblclick:[EDIT_VIEW_NODE_TITLE,stateId]}},currentState.title),state.editingTitleNodeId===stateId?editingNode():(0,_h2.default)('span')]),function(){var noStyleInput={color:currentRunningState[stateId]!==state.definition.state[stateId].defaultValue?'rgb(91, 204, 91)':'white',background:'none',outline:'none',display:'inline',flex:'1',minWidth:'50px',border:'none',boxShadow:'inset 0 -2px 0 0 '+(state.selectedStateNodeId===stateId?'#eab65c':'#828282')};if(currentState.type==='text')return(0,_h2.default)('input',{attrs:{type:'text'},liveProps:{value:currentRunningState[stateId]},style:noStyleInput,on:{input:[CHANGE_CURRENT_STATE_TEXT_VALUE,stateId]}});if(currentState.type==='number')return(0,_h2.default)('input',{attrs:{type:'number'},liveProps:{value:currentRunningState[stateId]},style:noStyleInput,on:{input:[CHANGE_CURRENT_STATE_NUMBER_VALUE,stateId]}});if(currentState.type==='boolean')return(0,_h2.default)('select',{liveProps:{value:currentRunningState[stateId].toString()},style:noStyleInput,on:{input:[CHANGE_CURRENT_STATE_TEXT_VALUE,stateId]}},[(0,_h2.default)('option',{attrs:{value:'true'},style:{color:'black'}},['true']),(0,_h2.default)('option',{attrs:{value:'false'},style:{color:'black'}},['false'])]);if(currentState.type==='table'){var _ret=function(){if(state.selectedStateNodeId!==stateId){return{v:(0,_h2.default)('div',{key:'icon',on:{click:[STATE_NODE_SELECTED,stateId]},style:{display:'flex',alignItems:'center',marginTop:'7px'}},[listIcon()])};}var table=currentRunningState[stateId];return{v:(0,_h2.default)('div',{key:'table',style:{background:'#828183',width:'100%',flex:'0 0 100%'}},[(0,_h2.default)('div',{style:{display:'flex'}},Object.keys(currentState.definition).map(function(key){return(0,_h2.default)('div',{style:{flex:'1',padding:'2px 5px',borderBottom:'2px solid white'}},key);}))].concat(_toConsumableArray(Object.keys(table).map(function(id){return(0,_h2.default)('div',{style:{display:'flex'}},Object.keys(table[id]).map(function(key){return(0,_h2.default)('div',{style:{flex:'1',padding:'2px 5px'}},table[id][key]);}));}))))};}();if((typeof _ret==="undefined"?"undefined":_typeof(_ret))==="object")return _ret.v;}}(),currentState.type!=='table'&&currentRunningState[stateId]!==state.definition.state[stateId].defaultValue?(0,_h2.default)('div',{style:{display:'inline-flex',alignSelf:'center'},on:{click:[SAVE_DEFAULT,stateId]}},[saveIcon()]):(0,_h2.default)('span'),state.selectedStateNodeId===stateId&&currentState.type!=='table'?(0,_h2.default)('div',{style:{display:'inline-flex',alignSelf:'center'},on:{click:[DELETE_STATE,stateId]}},[deleteIcon()]):(0,_h2.default)('span')]),state.selectedStateNodeId===stateId?(0,_h2.default)('span',currentState.mutators.map(function(mutatorRef){var mutator=state.definition[mutatorRef.ref][mutatorRef.id];var event=state.definition[mutator.event.ref][mutator.event.id];var emitter=state.definition[event.emitter.ref][event.emitter.id];return(0,_h2.default)('div',{style:{display:'flex',cursor:'pointer',alignItems:'center',background:'#444',paddingTop:'3px',paddingBottom:'3px',color:state.selectedViewNode.id===event.emitter.id?'#53B2ED':'white',transition:'0.2s all',minWidth:'100%'},on:{click:[VIEW_NODE_SELECTED,event.emitter]}},[(0,_h2.default)('span',{style:{flex:'0 0 auto',margin:'0 3px 0 5px',display:'inline-flex'}},[event.emitter.ref==='vNodeBox'?boxIcon():event.emitter.ref==='vNodeList'?listIcon():event.emitter.ref==='vNodeList'?ifIcon():event.emitter.ref==='vNodeInput'?inputIcon():textIcon()]),(0,_h2.default)('span',{style:{flex:'5 5 auto',margin:'0 5px 0 0',minWidth:'0',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}},emitter.title),(0,_h2.default)('span',{style:{flex:'0 0 auto',marginLeft:'auto',marginRight:'5px',color:'#5bcc5b'}},event.type)]);})):(0,_h2.default)('span')]);}function fakeState(stateId){var currentState=state.definition.state[stateId];return(0,_h2.default)('span',{style:{flex:'0 0 auto',position:'relative',transform:'translateZ(0)',margin:'7px 7px 0 0',boxShadow:'inset 0 0 0 2px '+(state.selectedStateNodeId===stateId?'#eab65c':'#828282'),background:'#444',padding:'4px 7px'}},[(0,_h2.default)('span',{style:{color:'white',display:'inline-block'}},currentState.title)]);}var stateComponent=(0,_h2.default)('div',{attrs:{class:'better-scrollbar'},style:{overflow:'auto',flex:'1',padding:'0 10px'},on:{click:[UNSELECT_STATE_NODE]}},state.definition.nameSpace['_rootNameSpace'].children.map(function(ref){return listState(ref.id);}));function listNode(nodeRef,parentRef,depth){if(nodeRef.id==='_rootNode')return listRootNode(nodeRef);if(nodeRef.ref==='vNodeText')return simpleNode(nodeRef,parentRef,depth);if(nodeRef.ref==='vNodeImage')return simpleNode(nodeRef,parentRef,depth);if(nodeRef.ref==='vNodeBox'||nodeRef.ref==='vNodeList'||nodeRef.ref==='vNodeIf')return listBoxNode(nodeRef,parentRef,depth);if(nodeRef.ref==='vNodeInput')return simpleNode(nodeRef,parentRef,depth);}function prevent_bubbling(e){e.stopPropagation();}function editingNode(nodeRef){return(0,_h2.default)('input',{style:{border:'none',height:'26px',background:'none',color:'#53B2ED',outline:'none',flex:'1',padding:'0',boxShadow:'inset 0 -1px 0 0 #53B2ED',font:'inherit',paddingLeft:'2px'},on:{mousedown:prevent_bubbling,input:[CHANGE_VIEW_NODE_TITLE,nodeRef]},liveProps:{value:state.definition[nodeRef.ref][nodeRef.id].title},attrs:{autofocus:true,'data-istitleeditor':true}});}function listRootNode(nodeRef){var nodeId=nodeRef.id;var node=state.definition[nodeRef.ref][nodeId];return(0,_h2.default)('div',{style:{position:'relative'}},[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center',paddingLeft:'8px',paddingRight:'8px',background:'#444',borderTop:'2px solid #4d4d4d',borderBottom:'2px solid #333',height:'26px',whiteSpace:'nowrap'},on:{mousemove:[VIEW_HOVERED,nodeRef,{},1],touchmove:[HOVER_MOBILE]}},[(0,_h2.default)('span',{key:nodeId,style:{color:state.selectedViewNode.id===nodeId?'#53B2ED':'#bdbdbd',display:'inline-flex'},on:{click:[VIEW_NODE_SELECTED,nodeRef]}},[appIcon()]),state.editingTitleNodeId===nodeId?editingNode(nodeRef):(0,_h2.default)('span',{style:{flex:'1',cursor:'pointer',color:state.selectedViewNode.id===nodeId?'#53B2ED':'white',transition:'color 0.2s',paddingLeft:'2px'},on:{click:[VIEW_NODE_SELECTED,nodeRef],dblclick:[EDIT_VIEW_NODE_TITLE,nodeId]}},node.title)]),(0,_h2.default)('div',state.hoveredViewNode&&state.hoveredViewNode.parent.id===nodeId&&!(node.children.findIndex(function(ref){return ref.id===state.draggedComponentView.id;})===state.hoveredViewNode.position)?function(){// copy pasted from listBoxNode
var oldPosition=node.children.findIndex(function(ref){return ref.id===state.draggedComponentView.id;});var newPosition=oldPosition===-1||state.hoveredViewNode.position<oldPosition?state.hoveredViewNode.position:state.hoveredViewNode.position+1;var children=node.children.map(function(ref){return listNode(ref,nodeRef,1);});return children.slice(0,newPosition).concat(spacerComponent(),children.slice(newPosition));}():node.children.map(function(ref){return listNode(ref,nodeRef,1);})),(0,_h2.default)('div',{style:{display:'flex',alignItems:'center',paddingLeft:'8px',paddingRight:'8px',height:'15px'},on:{mousemove:[VIEW_HOVERED,{id:'_lastNode'},{},1],touchmove:[HOVER_MOBILE]}})]);}function listBoxNode(nodeRef,parentRef,depth){var nodeId=nodeRef.id;var node=state.definition[nodeRef.ref][nodeId];return(0,_h2.default)('div',{style:{opacity:state.draggedComponentView&&state.draggedComponentView.id===nodeId?'0.5':'1.0'}},[(0,_h2.default)('div',{key:nodeId,style:{display:'flex',height:'26px',position:'relative',alignItems:'center',paddingLeft:(depth-(node.children.length>0||state.hoveredViewNode&&state.hoveredViewNode.parent.id===nodeId?1:0))*20+8+'px',paddingRight:'8px',background:'#444',borderTop:'2px solid #4d4d4d',borderBottom:'2px solid #333',whiteSpace:'nowrap',color:state.selectedViewNode.id===nodeId?'#53B2ED':'white'},on:{mousedown:[VIEW_DRAGGED,nodeRef,parentRef,depth],touchstart:[VIEW_DRAGGED,nodeRef,parentRef,depth],mousemove:[VIEW_HOVERED,nodeRef,parentRef,depth],touchmove:[HOVER_MOBILE]}},[node.children.length>0||state.hoveredViewNode&&state.hoveredViewNode.parent.id===nodeId?(0,_h2.default)('span',{style:{display:'inline-flex'}},[arrowIcon(state.viewFoldersClosed[nodeId]||state.draggedComponentView&&nodeId===state.draggedComponentView.id)]):(0,_h2.default)('span'),(0,_h2.default)('span',{key:nodeId,style:{display:'inline-flex',color:state.selectedViewNode.id===nodeId?'#53B2ED':'#bdbdbd',transition:'color 0.2s'}},[nodeRef.ref==='vNodeBox'?boxIcon():nodeRef.ref==='vNodeList'?listIcon():ifIcon()]),state.editingTitleNodeId===nodeId?editingNode(nodeRef):(0,_h2.default)('span',{style:{flex:'1',cursor:'pointer',transition:'color 0.2s',paddingLeft:'2px',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'},on:{dblclick:[EDIT_VIEW_NODE_TITLE,nodeId]}},node.title),(0,_h2.default)('div',{style:{color:'#53B2ED',cursor:'pointer',display:state.selectedViewNode.id===nodeId?'inline-flex':'none',flex:'0 0 auto'}},[deleteIcon()])]),(0,_h2.default)('div',{style:{display:state.viewFoldersClosed[nodeId]||state.draggedComponentView&&nodeId===state.draggedComponentView.id?'none':'block'}},state.hoveredViewNode&&state.hoveredViewNode.parent.id===nodeId&&!(node.children.findIndex(function(ref){return ref.id===state.draggedComponentView.id;})===state.hoveredViewNode.position)?function(){// adds a fake component
var oldPosition=node.children.findIndex(function(ref){return ref.id===state.draggedComponentView.id;});// this is needed because we still show the old node
var newPosition=oldPosition===-1||state.hoveredViewNode.position<oldPosition?state.hoveredViewNode.position:state.hoveredViewNode.position+1;var children=node.children.map(function(ref){return listNode(ref,nodeRef,depth+1);});return children.slice(0,newPosition).concat(spacerComponent(),children.slice(newPosition));}():node.children.map(function(ref){return listNode(ref,nodeRef,depth+1);}))]);}function simpleNode(nodeRef,parentRef,depth){var nodeId=nodeRef.id;var node=state.definition[nodeRef.ref][nodeId];return(0,_h2.default)('div',{key:nodeId,style:{cursor:'pointer',opacity:state.draggedComponentView&&state.draggedComponentView.id===nodeId?'0.5':'1.0',position:'relative',height:'26px',paddingLeft:depth*20+8+'px',paddingRight:'8px',background:'#444',borderTop:'2px solid #4d4d4d',borderBottom:'2px solid #333',whiteSpace:'nowrap',display:'flex',alignItems:'center',color:state.selectedViewNode.id===nodeId?'#53B2ED':'#bdbdbd'},on:{mousedown:[VIEW_DRAGGED,nodeRef,parentRef,depth],touchstart:[VIEW_DRAGGED,nodeRef,parentRef,depth],dblclick:[EDIT_VIEW_NODE_TITLE,nodeId],mousemove:[VIEW_HOVERED,nodeRef,parentRef,depth],touchmove:[HOVER_MOBILE]}},[nodeRef.ref==='vNodeInput'?inputIcon():nodeRef.ref==='vNodeImage'?imageIcon():textIcon(),state.editingTitleNodeId===nodeId?editingNode(nodeRef):(0,_h2.default)('span',{style:{flex:'1',color:state.selectedViewNode.id===nodeId?'#53B2ED':'white',transition:'color 0.2s',paddingLeft:'2px',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}},node.title),(0,_h2.default)('div',{style:{color:'#53B2ED',cursor:'pointer',display:state.selectedViewNode.id===nodeId?'inline-flex':'none',flex:'0 0 auto'}},[deleteIcon()])]);}function spacerComponent(){return(0,_h2.default)('div',{key:'spacer',style:{cursor:'pointer',height:'6px',boxShadow:'inset 0 0 1px 1px #53B2ED'}});}function fakeComponent(nodeRef,depth){var nodeId=nodeRef.id;var node=state.definition[nodeRef.ref][nodeId];return(0,_h2.default)('div',{key:'_fake'+nodeId,style:{cursor:'pointer',transition:'padding-left 0.2s',height:'26px',paddingLeft:(depth-(node.children&&node.children.length>0?1:0))*20+8+'px',paddingRight:'8px',background:'rgba(68,68,68,0.8)',borderTop:'2px solid #4d4d4d',borderBottom:'2px solid #333',whiteSpace:'nowrap',display:'flex',alignItems:'center',color:state.selectedViewNode.id===nodeId?'#53B2ED':'#bdbdbd'}},[(nodeRef.ref==='vNodeBox'||nodeRef.ref==='vNodeList'||nodeRef.ref==='vNodeIf')&&node.children.length>0?arrowIcon(true):(0,_h2.default)('span',{key:'_fakeSpan'+nodeId}),nodeRef.ref==='vNodeBox'?boxIcon():nodeRef.ref==='vNodeList'?listIcon():nodeRef.ref==='vNodeIf'?ifIcon():nodeRef.ref==='vNodeInput'?inputIcon():nodeRef.ref==='vNodeImage'?imageIcon():textIcon(),(0,_h2.default)('span',{style:{flex:'1',color:state.selectedViewNode.id===nodeId?'#53B2ED':'white',transition:'color 0.2s',paddingLeft:'2px',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}},node.title)]);}function generateEditNodeComponent(){var styles=['background','border','outline','cursor','color','display','top','bottom','left','flex','justifyContent','alignItems','width','height','maxWidth','maxHeight','minWidth','minHeight','right','position','overflow','font','margin','padding'];var selectedNode=state.definition[state.selectedViewNode.ref][state.selectedViewNode.id];var propsComponent=(0,_h2.default)('div',{style:{background:state.selectedViewSubMenu==='props'?'#4d4d4d':'#3d3d3d',padding:'10px 0',flex:'1',cursor:'pointer',textAlign:'center'},on:{click:[SELECT_VIEW_SUBMENU,'props']}},'data');var styleComponent=(0,_h2.default)('div',{style:{background:state.selectedViewSubMenu==='style'?'#4d4d4d':'#3d3d3d',padding:'10px 0',flex:'1',borderRight:'1px solid #222',borderLeft:'1px solid #222',textAlign:'center',cursor:'pointer'},on:{click:[SELECT_VIEW_SUBMENU,'style']}},'style');var eventsComponent=(0,_h2.default)('div',{style:{background:state.selectedViewSubMenu==='events'?'#4d4d4d':'#3d3d3d',padding:'10px 0',flex:'1',textAlign:'center',cursor:'pointer'},on:{click:[SELECT_VIEW_SUBMENU,'events']}},'events');var genpropsSubmenuComponent=function genpropsSubmenuComponent(){return(0,_h2.default)('div',[function(){if(state.selectedViewNode.ref==='vNodeBox'){return(0,_h2.default)('div',{style:{textAlign:'center',marginTop:'100px',color:'#bdbdbd'}},'no data required');}if(state.selectedViewNode.ref==='vNodeText'){return(0,_h2.default)('div',{style:{overflow:'auto'},attrs:{"class":'better-scrollbar'}},[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center',background:'#676767',padding:'5px 10px',marginBottom:'10px'}},[(0,_h2.default)('span',{style:{flex:'1'}},'text value'),(0,_h2.default)('div',{style:{flex:'0',cursor:'default',color:'#bdbdbd'}},'text')]),(0,_h2.default)('div',{style:{padding:'5px 10px'}},[emberEditor(selectedNode.value,'text')])]);}if(state.selectedViewNode.ref==='vNodeImage'){return(0,_h2.default)('div',{style:{overflow:'auto'},attrs:{"class":'better-scrollbar'}},[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center',background:'#676767',padding:'5px 10px',marginBottom:'10px'}},[(0,_h2.default)('span',{style:{flex:'1'}},'source (url)'),(0,_h2.default)('div',{style:{flex:'0',cursor:'default',color:'#bdbdbd'}},'text')]),(0,_h2.default)('div',{style:{padding:'5px 10px'}},[emberEditor(selectedNode.src,'text')])]);}if(state.selectedViewNode.ref==='vNodeInput'){return(0,_h2.default)('div',{style:{overflow:'auto'},attrs:{"class":'better-scrollbar'}},[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center',background:'#676767',padding:'5px 10px',marginBottom:'10px'}},[(0,_h2.default)('span',{style:{flex:'1'}},'input value'),(0,_h2.default)('div',{style:{flex:'0',cursor:'default',color:'#bdbdbd'}},'text')]),(0,_h2.default)('div',{style:{padding:'5px 10px'}},[emberEditor(selectedNode.value,'text')])]);}if(state.selectedViewNode.ref==='vNodeList'){return(0,_h2.default)('div',{style:{overflow:'auto'},attrs:{"class":'better-scrollbar'}},[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center',background:'#676767',padding:'5px 10px',marginBottom:'10px'}},[(0,_h2.default)('span',{style:{flex:'1'}},'table'),(0,_h2.default)('div',{style:{flex:'0',cursor:'default',color:'#bdbdbd'}},'table')]),(0,_h2.default)('div',{style:{padding:'5px 10px'}},[emberEditor(selectedNode.value,'table')])]);}if(state.selectedViewNode.ref==='vNodeIf'){return(0,_h2.default)('div',{style:{overflow:'auto'},attrs:{"class":'better-scrollbar'}},[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center',background:'#676767',padding:'5px 10px',marginBottom:'10px'}},[(0,_h2.default)('span',{style:{flex:'1'}},'predicate'),(0,_h2.default)('div',{style:{flex:'0',cursor:'default',color:'#bdbdbd'}},'true/false')]),(0,_h2.default)('div',{style:{padding:'5px 10px'}},[emberEditor(selectedNode.value,'boolean')])]);}}()]);};var genstyleSubmenuComponent=function genstyleSubmenuComponent(){var selectedStyle=state.definition.style[selectedNode.style.id];return(0,_h2.default)('div',{attrs:{class:'better-scrollbar'},style:{overflow:'auto'}},[(0,_h2.default)('div',{style:{padding:'10px',fontFamily:"'Comfortaa', sans-serif",color:'#bdbdbd'}},'style panel will change a lot in 1.0v, right now it\'s just CSS')].concat(_toConsumableArray(Object.keys(selectedStyle).map(function(key){return(0,_h2.default)('div',{style:{}},[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center',background:'#676767',padding:'5px 10px',marginBottom:'10px'}},[(0,_h2.default)('span',{style:{flex:'1'}},key),(0,_h2.default)('div',{style:{flex:'0',cursor:'default',color:'#bdbdbd'}},'text')]),(0,_h2.default)('div',{style:{padding:'5px 10px'}},[emberEditor(selectedStyle[key],'text')])]);})),[(0,_h2.default)('div',{style:{padding:'5px 10px',fontFamily:"'Comfortaa', sans-serif",color:'#bdbdbd'}},'add Style:'),(0,_h2.default)('div',{style:{padding:'5px 0 5px 10px'}},styles.filter(function(key){return!Object.keys(selectedStyle).includes(key);}).map(function(key){return(0,_h2.default)('div',{on:{click:[ADD_DEFAULT_STYLE,selectedNode.style.id,key]},style:{cursor:'pointer',border:'3px solid white',padding:'5px',marginTop:'5px'}},'+ '+key);}))]));};var geneventsSubmenuComponent=function geneventsSubmenuComponent(){var availableEvents=[{description:'on click',propertyName:'click'},{description:'double clicked',propertyName:'dblclick'},{description:'mouse over',propertyName:'mouseover'},{description:'mouse out',propertyName:'mouseout'}];if(state.selectedViewNode.ref==='vNodeInput'){availableEvents=availableEvents.concat([{description:'input',propertyName:'input'},{description:'focus',propertyName:'focus'},{description:'blur',propertyName:'blur'}]);}var currentEvents=availableEvents.filter(function(event){return selectedNode[event.propertyName];});var eventsLeft=availableEvents.filter(function(event){return!selectedNode[event.propertyName];});return(0,_h2.default)('div',{style:{paddingTop:'20px'}},[].concat(_toConsumableArray(currentEvents.length?currentEvents.map(function(eventDesc){var event=state.definition[selectedNode[eventDesc.propertyName].ref][selectedNode[eventDesc.propertyName].id];return(0,_h2.default)('div',[(0,_h2.default)('div',{style:{background:'#676767',padding:'5px 10px'}},event.type),(0,_h2.default)('div',{style:{color:'white',transition:'color 0.2s',fontSize:'14px',cursor:'pointer',padding:'5px 10px'}},event.mutators.map(function(mutatorRef){var mutator=state.definition[mutatorRef.ref][mutatorRef.id];var stateDef=state.definition[mutator.state.ref][mutator.state.id];return(0,_h2.default)('div',{style:{marginTop:'10px'}},[(0,_h2.default)('span',{style:{flex:'0 0 auto',display:'inline-block',position:'relative',transform:'translateZ(0)',boxShadow:'inset 0 0 0 2px '+(state.selectedStateNodeId===mutator.state.id?'#eab65c':'#828282'),background:'#444',padding:'4px 7px'}},[(0,_h2.default)('span',{style:{color:'white',display:'inline-block'},on:{click:[STATE_NODE_SELECTED,mutator.state.id]}},stateDef.title)]),emberEditor(mutator.mutation,stateDef.type)]);}))]);}):[]),[(0,_h2.default)('div',{style:{padding:'5px 10px',fontFamily:"'Comfortaa', sans-serif",color:'#bdbdbd'}},'add Event:'),(0,_h2.default)('div',{style:{padding:'5px 0 5px 10px'}},[].concat(_toConsumableArray(eventsLeft.map(function(event){return(0,_h2.default)('div',{style:{border:'3px solid #5bcc5b',cursor:'pointer',padding:'5px',margin:'10px'},on:{click:[ADD_EVENT,event.propertyName,state.selectedViewNode]}},'+ '+event.description);}))))]));};var fullVNode=['vNodeBox','vNodeText','vNodeImage','vNodeInput'].includes(state.selectedViewNode.ref);return(0,_h2.default)('div',{style:{position:'fixed',font:"300 1.2em 'Open Sans'",lineHeight:'1.2em',color:'white',left:state.componentEditorPosition.x+'px',top:state.componentEditorPosition.y+'px',height:'50%',display:'flex',zIndex:'3000'}},[(0,_h2.default)('div',{style:{flex:'1',display:'flex',marginBottom:'10px',flexDirection:'column',background:'#4d4d4d',width:state.subEditorWidth+'px',border:'3px solid #222'}},[(0,_h2.default)('div',{style:{flex:'0 0 auto'}},[(0,_h2.default)('div',{style:{display:'flex',cursor:'default',alignItems:'center',background:'#222',paddingTop:'2px',paddingBottom:'5px',color:'#53B2ED',minWidth:'100%'},on:{mousedown:[COMPONENT_VIEW_DRAGGED],touchstart:[COMPONENT_VIEW_DRAGGED]}},[(0,_h2.default)('span',{style:{flex:'0 0 auto',margin:'0 2px 0 5px',display:'inline-flex'}},[state.selectedViewNode.id==='_rootNode'?appIcon():state.selectedViewNode.ref==='vNodeBox'?boxIcon():state.selectedViewNode.ref==='vNodeList'?listIcon():state.selectedViewNode.ref==='vNodeList'?ifIcon():state.selectedViewNode.ref==='vNodeInput'?inputIcon():state.selectedViewNode.ref==='vNodeImage'?imageIcon():textIcon()]),(0,_h2.default)('span',{style:{flex:'5 5 auto',margin:'0 5px 0 0',minWidth:'0',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',fontSize:'0.8em'}},selectedNode.title),(0,_h2.default)('span',{style:{flex:'0 0 auto',marginLeft:'auto',cursor:'pointer',marginRight:'5px',color:'white',display:'inline-flex'},on:{mousedown:[UNSELECT_VIEW_NODE,false,true],touchstart:[UNSELECT_VIEW_NODE,false,true]}},[clearIcon()])])]),fullVNode?(0,_h2.default)('div',{style:{display:'flex',flex:'0 0 auto',fontFamily:"'Comfortaa', sans-serif"}},[propsComponent,styleComponent,eventsComponent]):(0,_h2.default)('span'),dragSubComponentRight,dragSubComponentLeft,state.selectedViewSubMenu==='props'||!fullVNode?genpropsSubmenuComponent():state.selectedViewSubMenu==='style'?genstyleSubmenuComponent():state.selectedViewSubMenu==='events'?geneventsSubmenuComponent():(0,_h2.default)('span','Error, no such menu')])]);}var addStateComponent=(0,_h2.default)('div',{style:{flex:'0 auto',marginLeft:state.rightOpen?'-10px':'0',border:'3px solid #222',borderRight:'none',background:'#333',height:'40px',display:'flex',alignItems:'center'}},[(0,_h2.default)('span',{style:{fontFamily:"'Comfortaa', sans-serif",fontSize:'0.9em',cursor:'pointer',padding:'0 5px'}},'add state: '),(0,_h2.default)('span',{style:{display:'inline-block'},on:{click:[ADD_STATE,'_rootNameSpace','text']}},[textIcon()]),(0,_h2.default)('span',{on:{click:[ADD_STATE,'_rootNameSpace','number']}},[numberIcon()]),(0,_h2.default)('span',{on:{click:[ADD_STATE,'_rootNameSpace','boolean']}},[ifIcon()])]);var addViewNodeComponent=(0,_h2.default)('div',{style:{flex:'0 auto',marginLeft:state.rightOpen?'-10px':'0',border:'3px solid #222',borderRight:'none',background:'#333',height:'40px',display:'flex',alignItems:'center'}},[(0,_h2.default)('span',{style:{fontFamily:"'Comfortaa', sans-serif",fontSize:'0.9em',padding:'0 10px'}},'add component: '),(0,_h2.default)('span',{on:{click:[ADD_NODE,state.selectedViewNode,'box']}},[boxIcon()]),(0,_h2.default)('span',{on:{click:[ADD_NODE,state.selectedViewNode,'input']}},[inputIcon()]),(0,_h2.default)('span',{on:{click:[ADD_NODE,state.selectedViewNode,'text']}},[textIcon()]),(0,_h2.default)('span',{on:{click:[ADD_NODE,state.selectedViewNode,'image']}},[imageIcon()]),(0,_h2.default)('span',{on:{click:[ADD_NODE,state.selectedViewNode,'if']}},[ifIcon()])]);var viewComponent=(0,_h2.default)('div',{attrs:{class:'better-scrollbar'},style:{overflow:'auto',position:'relative',flex:'1',fontSize:'0.8em'}},[listNode({ref:'vNodeBox',id:'_rootNode'},{},0)]);var rightComponent=(0,_h2.default)('div',{style:{display:'flex',flexDirection:'column',position:'absolute',top:'0',right:'0',color:'white',height:'100%',font:"300 1.2em 'Open Sans'",lineHeight:'1.2em',width:state.editorRightWidth+'px',background:'#4d4d4d',boxSizing:"border-box",borderLeft:'3px solid #222',transition:'0.5s transform',transform:state.rightOpen?'translateZ(0) translateX(0%)':'translateZ(0) translateX(100%)',userSelect:'none'}},[dragComponentRight,openComponentRight,addStateComponent,stateComponent,addViewNodeComponent,viewComponent]);var topComponent=(0,_h2.default)('div',{style:{flex:'1 auto',height:'75px',maxHeight:'75px',minHeight:'75px',background:'#222',display:'flex',justifyContent:'center',fontFamily:"'Comfortaa', sans-serif"}},[(0,_h2.default)('a',{style:{flex:'0 auto',width:'190px',textDecoration:'inherit',userSelect:'none'},attrs:{href:'/_dev'}},[(0,_h2.default)('img',{style:{margin:'7px -2px -3px 5px',display:'inline-block'},attrs:{src:'/images/logo256x256.png',height:'57'}}),(0,_h2.default)('span',{style:{fontSize:'44px',verticalAlign:'bottom',color:'#fff'}},'ugnis')]),(0,_h2.default)('div',{style:{position:'absolute',top:'0',right:'0',border:'none',color:'white',fontFamily:"'Comfortaa', sans-serif",fontSize:'16px'}},[(0,_h2.default)('div',{style:{background:'#444444',border:'none',color:'white',display:'inline-block',padding:'15px 20px',margin:'13px 13px 0 0',cursor:'pointer'},on:{click:[FULL_SCREEN_CLICKED,true]}},'full screen'),(0,_h2.default)('div',{style:{background:'#444444',border:'none',color:'white',display:'inline-block',padding:'15px 20px',margin:'13px 13px 0 0',cursor:'pointer'},on:{click:RESET_APP_STATE}},'reset state'),(0,_h2.default)('div',{style:{background:'#444444',border:'none',color:'white',display:'inline-block',padding:'15px 20px',margin:'13px 13px 0 0',cursor:'pointer'},on:{click:RESET_APP_DEFINITION}},'reset demo')])]);var leftComponent=(0,_h2.default)('div',{style:{display:'flex',flexDirection:'column',position:'absolute',top:'0',left:'0',height:'100%',color:'white',font:"300 1.2em 'Open Sans'",width:state.editorLeftWidth+'px',background:'#4d4d4d',boxSizing:"border-box",borderRight:'3px solid #222',transition:'0.5s transform',transform:state.leftOpen?'translateZ(0) translateX(0%)':'translateZ(0) translateX(-100%)',userSelect:'none'}},[dragComponentLeft,openComponentLeft,(0,_h2.default)('div',{on:{click:FREEZER_CLICKED},style:{flex:'0 auto',padding:'10px',textAlign:'center',background:'#333',cursor:'pointer'}},[(0,_h2.default)('span',{style:{padding:'15px 15px 10px 15px',color:state.appIsFrozen?'rgb(91, 204, 91)':'rgb(204, 91, 91)'}},state.appIsFrozen?'►':'❚❚')]),(0,_h2.default)('div',{attrs:{class:'better-scrollbar'},style:{flex:'1 auto',overflow:'auto'}},state.eventStack.filter(function(eventData){return state.definition.event[eventData.eventId]!==undefined;}).reverse()// mutates the array, but it was already copied with filter
.map(function(eventData,index){var event=state.definition.event[eventData.eventId];var emitter=state.definition[event.emitter.ref][event.emitter.id];// no idea why this key works, don't touch it, probably rerenders more than needed, but who cares
return(0,_h2.default)('div',{key:event.emitter.id+index,style:{marginBottom:'10px'}},[(0,_h2.default)('div',{style:{display:'flex',marginBottom:'10px',cursor:'pointer',alignItems:'center',background:'#444',paddingTop:'3px',paddingBottom:'3px',color:state.selectedViewNode.id===event.emitter.id?'#53B2ED':'white',transition:'0.2s all',minWidth:'100%'},on:{click:[VIEW_NODE_SELECTED,event.emitter]}},[(0,_h2.default)('span',{style:{flex:'0 0 auto',margin:'0 0 0 5px',display:'inline-flex'}},[event.emitter.ref==='vNodeBox'?boxIcon():event.emitter.ref==='vNodeList'?listIcon():event.emitter.ref==='vNodeList'?ifIcon():event.emitter.ref==='vNodeInput'?inputIcon():textIcon()]),(0,_h2.default)('span',{style:{flex:'5 5 auto',margin:'0 5px 0 0',minWidth:'0',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}},emitter.title),(0,_h2.default)('span',{style:{flex:'0 0 auto',fontFamily:"'Comfortaa', sans-serif",fontSize:'0.9em',marginLeft:'auto',marginRight:'5px',color:'#5bcc5b'}},event.type)]),Object.keys(eventData.mutations).length===0?(0,_h2.default)('div',{style:{padding:'5px 10px',fontFamily:"'Comfortaa', sans-serif",color:'#bdbdbd'}},'nothing has changed'):(0,_h2.default)('div',{style:{paddingLeft:'10px',whiteSpace:'nowrap'}},Object.keys(eventData.mutations).filter(function(stateId){return state.definition.state[stateId]!==undefined;}).map(function(stateId){return(0,_h2.default)('span',[(0,_h2.default)('span',{on:{click:[STATE_NODE_SELECTED,stateId]},style:{cursor:'pointer',fontSize:'14px',color:'white',boxShadow:'inset 0 0 0 2px '+(state.selectedStateNodeId===stateId?'#eab65c':'#828282'),background:'#444',padding:'2px 5px',marginRight:'5px',display:'inline-block',transition:'all 0.2s'}},state.definition.state[stateId].title),(0,_h2.default)('span',{style:{color:'#8e8e8e'}},eventData.previousState[stateId].toString()+' –› '),(0,_h2.default)('span',eventData.mutations[stateId].toString())]);}))]);}))]);var renderViewComponent=(0,_h2.default)('div',{style:{flex:'1 auto',//backgroundImage: 'radial-gradient(black 15%, transparent 16%), radial-gradient(black 15%, transparent 16%), radial-gradient(rgba(255, 255, 255, 0.0980392) 15%, transparent 20%), radial-gradient(rgba(255, 255, 255, 0.0980392) 15%, transparent 20%)',
backgroundPositionX:'0px, 8px, 0px, 8px',backgroundPositionY:'0px, 8px, 1px, 9px',backgroundColor:'#333',backgroundSize:'16px 16px',display:'relative',overflow:'auto'}},[(0,_h2.default)('div',{style:function(){var topMenuHeight=75;var widthLeft=window.innerWidth-((state.leftOpen?state.editorLeftWidth:0)+(state.rightOpen?state.editorRightWidth:0));var heightLeft=window.innerHeight-topMenuHeight;return{width:state.fullScreen?'100vw':widthLeft-40+'px',height:state.fullScreen?'100vh':heightLeft-40+'px',background:'#ffffff',zIndex:state.fullScreen?'2000':'100',boxShadow:'rgba(0, 0, 0, 0.247059) 0px 14px 45px, rgba(0, 0, 0, 0.219608) 0px 10px 18px',position:'fixed',transition:'all 0.5s',top:state.fullScreen?'0px':20+75+'px',left:state.fullScreen?'0px':(state.leftOpen?state.editorLeftWidth:0)+20+'px'};}()},[state.fullScreen?(0,_h2.default)('span',{style:{position:'fixed',padding:'12px 10px',top:'0',right:'20px',border:'2px solid #333',borderTop:'none',background:'#444',color:'white',opacity:'0.8',cursor:'pointer'},on:{click:[FULL_SCREEN_CLICKED,false]}},'exit full screen'):(0,_h2.default)('span'),(0,_h2.default)('div',{style:{overflow:'auto',width:'100%',height:'100%'}},[app.vdom])])]);var mainRowComponent=(0,_h2.default)('div',{style:{display:'flex',flex:'1',position:'relative'}},[renderViewComponent,leftComponent,rightComponent,state.selectedViewNode.ref?generateEditNodeComponent():(0,_h2.default)('span')]);var vnode=(0,_h2.default)('div',{style:{display:'flex',flexDirection:'column',position:'fixed',top:'0',right:'0',width:'100vw',height:'100vh'}},[topComponent,mainRowComponent,state.draggedComponentView?(0,_h2.default)('div',{style:{fontFamily:"Open Sans",pointerEvents:'none',position:'fixed',top:state.mousePosition.y+'px',left:state.mousePosition.x+'px',lineHeight:'1.2em',fontSize:'1.2em',zIndex:'99999',width:state.editorRightWidth+'px'}},[(0,_h2.default)('div',{style:{overflow:'auto',position:'relative',flex:'1',fontSize:'0.8em'}},[fakeComponent(state.draggedComponentView,state.hoveredViewNode?state.hoveredViewNode.depth:state.draggedComponentView.depth)])]):(0,_h2.default)('span'),state.draggedComponentStateId?(0,_h2.default)('div',{style:{fontFamily:"Open Sans",pointerEvents:'none',position:'fixed',top:state.mousePosition.y+'px',left:state.mousePosition.x+'px',lineHeight:'1.2em',fontSize:'16px',zIndex:'99999',width:state.editorRightWidth+'px'}},[fakeState(state.draggedComponentStateId)]):(0,_h2.default)('span')]);node=patch(node,vnode);currentAnimationFrameRequest=null;}render();}

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
        if (ref.ref === 'vNodeImage') {
            return imageNode(ref);
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
            if (ref.ref === 'join') {
                value = value.toString().concat(resolve(transformer.value));
            }
            if (ref.ref === 'toUpperCase') {
                value = value.toUpperCase();
            }
            if (ref.ref === 'toLowerCase') {
                value = value.toLowerCase();
            }
            if (ref.ref === 'length') {
                value = value.length;
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

    function imageNode(ref) {
        var node = definition[ref.ref][ref.id];
        var style = resolve(node.style);
        var data = {
            attrs: {
                src: resolve(node.src)
            },
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
        return (0, _h2.default)('img', data);
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
  "length": {},
  "list": {},
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
        },
        {
          "ref": "join",
          "id": "8a6cd6d2-00db-8ab5-c332-882575f25426"
        }
      ]
    },
    "um5ed6d2-00db-8ab5-c332-882575f25426": {
      "type": "text",
      "value": {
        "ref": "state",
        "id": "46vdd6d2-00db-8ab5-c332-882575f25426"
      },
      "transformations": []
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
          "ref": "join",
          "id": "wf9ad6d2-00db-8ab5-c332-882575f25426"
        }
      ]
    },
    "7dbvd6d2-00db-8ab5-c332-882575f25426": {
      "type": "text",
      "value": {
        "ref": "listValue",
        "id": "hj9wd6d2-00db-8ab5-c332-882575f25426"
      },
      "transformations": []
    },
    "8d4vd6d2-00db-8ab5-c332-882575f25426": {
      "type": "text",
      "value": {
        "ref": "listValue",
        "id": "pz7hd6d2-00db-8ab5-c332-882575f25426"
      },
      "transformations": []
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
    },
    "945f0818-7743-4edd-8c76-3dd5a8ba7fa9": {
      "type": "text",
      "value": "'Comfortaa', cursive",
      "transformations": []
    },
    "a60899ee-9925-4e05-890e-b9428b02dbf9": {
      "type": "text",
      "value": "#f5f5f5",
      "transformations": []
    },
    "1e465403-5382-4a45-89da-8d88e2eb2fb9": {
      "type": "text",
      "value": "100%",
      "transformations": []
    },
    "ef2ec184-199f-4ee8-8e30-b99dbc1df5db": {
      "type": "text",
      "value": "10px",
      "transformations": []
    },
    "fab286c4-ded3-4a5e-8749-7678abcbb125": {
      "type": "text",
      "value": "10px 5px",
      "transformations": []
    },
    "703f8e02-c5c3-4d27-8ca2-722c4d0d1ea0": {
      "type": "text",
      "value": "10px 15px",
      "transformations": []
    },
    "8f3c6630-d8d9-4bc1-8a3d-ba4dad3091f0": {
      "type": "text",
      "value": "#aaaaaa",
      "transformations": []
    },
    "d31c4746-2329-4404-8689-fbf2393efd44": {
      "type": "text",
      "value": "inline-block",
      "transformations": []
    },
    "41685adc-3793-4566-8f61-2c2a42fdf86e": {
      "type": "text",
      "value": "5px",
      "transformations": []
    },
    "d5754fdb-4689-4f87-87fc-51d60022b32c": {
      "type": "text",
      "value": "3px",
      "transformations": []
    },
    "0bc6a18c-1766-42bd-8b4a-202a2b0c34fe": {
      "type": "text",
      "value": "pointer",
      "transformations": []
    },
    "9b250ef8-c1be-4706-8a71-f444f18f0f82": {
      "type": "text",
      "value": "none",
      "transformations": []
    },
    "b0a10497-ec26-4ff7-8739-a193755cbcae": {
      "type": "text",
      "value": "10px 5px",
      "transformations": []
    },
    "8764e258-599d-4252-8112-d06fcd0d5e2a": {
      "type": "text",
      "value": "10px 15px",
      "transformations": []
    },
    "8caaf876-10bc-47de-89d9-869c892cd4ce": {
      "type": "text",
      "value": "#999999",
      "transformations": []
    },
    "ae987bba-734a-46ae-8c82-c04896221179": {
      "type": "text",
      "value": "inline-block",
      "transformations": []
    },
    "f0090f8d-87b4-4d83-8a53-039b21e2b594": {
      "type": "text",
      "value": "5px",
      "transformations": []
    },
    "b7c791a6-2c91-4b62-8820-dbaaf9d5c179": {
      "type": "text",
      "value": "3px",
      "transformations": []
    },
    "d795a510-ccf9-4d92-81ee-5e512b81ee58": {
      "type": "text",
      "value": "pointer",
      "transformations": []
    },
    "7518524a-0bc2-465c-814e-0a5d39de25e3": {
      "type": "text",
      "value": "10px 5px",
      "transformations": []
    },
    "b24b1c18-8a82-4c8f-8180-6d062c78c9d9": {
      "type": "text",
      "value": "none",
      "transformations": []
    },
    "67f70d97-a346-42e4-833f-6eaeaeed4fef": {
      "type": "text",
      "value": "10px 10px 10px 0",
      "transformations": []
    },
    "98257461-928e-4ff9-8ac5-0b89298e4ef1": {
      "type": "text",
      "value": "10px 10px 10px 0",
      "transformations": []
    },
    "9931fe6a-074e-4cb7-8355-c18d818679a7": {
      "type": "text",
      "value": "10px",
      "transformations": []
    },
    "72b559e9-2546-4bae-8a61-555567363b11": {
      "type": "text",
      "value": "right",
      "transformations": []
    },
    "30f8c701-7adf-4398-862e-55372e29c14d": {
      "type": "text",
      "value": "50px",
      "transformations": []
    },
    "6635dbb2-b364-4efd-8061-26432007eb1a": {
      "type": "text",
      "value": "right",
      "transformations": []
    },
    "042ccf7d-819b-4fac-8282-2f19069b5386": {
      "type": "text",
      "value": "500px",
      "transformations": []
    },
    "e7bc6e20-1510-4bac-859f-04ec3dcda66b": {
      "type": "text",
      "value": "1.5",
      "transformations": []
    },
    "ef8dc9c6-f333-4b61-8d25-d36afe517520": {
      "type": "text",
      "value": "10px",
      "transformations": []
    },
    "755a70a2-d181-4faf-8593-5ab7601158f9": {
      "type": "text",
      "value": "block",
      "transformations": []
    },
    "9f501c35-54b3-4c60-8fc4-d6a45e776eb3": {
      "type": "text",
      "value": "10px",
      "transformations": []
    },
    "e8acc6b0-d1de-443b-8128-df6b5186f70c": {
      "type": "text",
      "value": "block",
      "transformations": []
    },
    "71764362-e09a-4412-8fbc-ed3cb4d4c954": {
      "type": "text",
      "value": "10px",
      "transformations": []
    },
    "c199b191-88d2-463d-8564-1ce1a1631b2d": {
      "type": "text",
      "value": "block",
      "transformations": []
    },
    "b2117e6b-ace7-4e75-8e7d-323668d1b19d": {
      "type": "text",
      "value": "10px",
      "transformations": []
    },
    "8a53848d-8c7d-44dc-8d13-ae060107c80b": {
      "type": "text",
      "value": "block",
      "transformations": []
    },
    "1906b5b4-6024-48f1-84da-c332e555afb3": {
      "type": "text",
      "value": "10px",
      "transformations": []
    },
    "a565696d-8a60-416e-844a-60c8f2fe8c5a": {
      "type": "text",
      "value": "block",
      "transformations": []
    },
    "15d47b07-396c-4c03-8591-f472598f15e2": {
      "type": "text",
      "value": "10px",
      "transformations": []
    },
    "a8f5c1ce-783b-4626-826a-473ab434c0b2": {
      "type": "text",
      "value": "10px",
      "transformations": []
    },
    "a9cw9a9b-25bb-4e8b-80c0-cf51b8506070": {
      "type": "text",
      "value": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Schonach_-_Paradies_-_Sonnenaufgang.jpg/1280px-Schonach_-_Paradies_-_Sonnenaufgang.jpg",
      "transformations": []
    },
    "d1314274-5efc-4be1-830b-0ff8c92b5029": {
      "type": "text",
      "value": "block",
      "transformations": []
    },
    "9qc84274-5efc-4be1-830b-0ff8c92b5029": {
      "type": "text",
      "value": "",
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
    },
    "8a6cd6d2-00db-8ab5-c332-882575f25426": {
      "value": {
        "ref": "pipe",
        "id": "9qc84274-5efc-4be1-830b-0ff8c92b5029"
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
        "ref": "pipe",
        "id": "8d4vd6d2-00db-8ab5-c332-882575f25426"
      }
    },
    "vq8dd6d2-00db-8ab5-c332-882575f25426": {
      "value": {
        "ref": "pipe",
        "id": "7dbvd6d2-00db-8ab5-c332-882575f25426"
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
      "title": "app",
      "style": {
        "ref": "style",
        "id": "_rootStyle"
      },
      "parent": {},
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
          "ref": "vNodeImage",
          "id": "sd8vc15a-426b-41eb-831d-e3e074159582"
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
      "parent": {
        "ref": "vNodeList",
        "id": "fl89d6d2-00db-8ab5-c332-882575f25425"
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
      "parent": {
        "ref": "vNodeBox",
        "id": "_rootNode"
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
      "parent": {
        "ref": "vNodeBox",
        "id": "_rootNode"
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
      "parent": {
        "ref": "vNodeBox",
        "id": "_rootNode"
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
      "parent": {
        "ref": "vNodeIf",
        "id": "5787c15a-426b-41eb-831d-e3e074159582"
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
      "parent": {
        "ref": "vNodeBox",
        "id": "_rootNode"
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
      "parent": {
        "ref": "vNodeBox",
        "id": "_rootNode"
      },
      "children": [
        {
          "ref": "vNodeText",
          "id": "e8add1c7-8a01-4164-8604-722d8ab529f1"
        }
      ]
    }
  },
  "vNodeImage": {
    "sd8vc15a-426b-41eb-831d-e3e074159582": {
      "title": "hills",
      "src": {
        "ref": "pipe",
        "id": "a9cw9a9b-25bb-4e8b-80c0-cf51b8506070"
      },
      "parent": {
        "ref": "vNodeBox",
        "id": "_rootNode"
      },
      "style": {
        "ref": "style",
        "id": "wf8d73b3-90eb-41e7-8651-2bdcc93f3871"
      }
    }
  },
  "style": {
    "_rootStyle": {
      "fontFamily": {
        "ref": "pipe",
        "id": "945f0818-7743-4edd-8c76-3dd5a8ba7fa9"
      },
      "background": {
        "ref": "pipe",
        "id": "a60899ee-9925-4e05-890e-b9428b02dbf9"
      },
      "minHeight": {
        "ref": "pipe",
        "id": "1e465403-5382-4a45-89da-8d88e2eb2fb9"
      }
    },
    "8481d6d2-00db-8ab5-c332-882575f25426": {
      "padding": {
        "ref": "pipe",
        "id": "ef2ec184-199f-4ee8-8e30-b99dbc1df5db"
      },
      "margin": {
        "ref": "pipe",
        "id": "fab286c4-ded3-4a5e-8749-7678abcbb125"
      }
    },
    "9481d6d2-00db-8ab5-c332-882575f25426": {
      "padding": {
        "ref": "pipe",
        "id": "703f8e02-c5c3-4d27-8ca2-722c4d0d1ea0"
      },
      "background": {
        "ref": "pipe",
        "id": "8f3c6630-d8d9-4bc1-8a3d-ba4dad3091f0"
      },
      "display": {
        "ref": "pipe",
        "id": "d31c4746-2329-4404-8689-fbf2393efd44"
      },
      "borderRadius": {
        "ref": "pipe",
        "id": "d5754fdb-4689-4f87-87fc-51d60022b32c"
      },
      "cursor": {
        "ref": "pipe",
        "id": "0bc6a18c-1766-42bd-8b4a-202a2b0c34fe"
      },
      "userSelect": {
        "ref": "pipe",
        "id": "9b250ef8-c1be-4706-8a71-f444f18f0f82"
      },
      "margin": {
        "ref": "pipe",
        "id": "b0a10497-ec26-4ff7-8739-a193755cbcae"
      }
    },
    "7481d6d2-00db-8ab5-c332-882575f25426": {
      "padding": {
        "ref": "pipe",
        "id": "8764e258-599d-4252-8112-d06fcd0d5e2a"
      },
      "background": {
        "ref": "pipe",
        "id": "8caaf876-10bc-47de-89d9-869c892cd4ce"
      },
      "display": {
        "ref": "pipe",
        "id": "ae987bba-734a-46ae-8c82-c04896221179"
      },
      "borderRadius": {
        "ref": "pipe",
        "id": "b7c791a6-2c91-4b62-8820-dbaaf9d5c179"
      },
      "cursor": {
        "ref": "pipe",
        "id": "d795a510-ccf9-4d92-81ee-5e512b81ee58"
      },
      "margin": {
        "ref": "pipe",
        "id": "7518524a-0bc2-465c-814e-0a5d39de25e3"
      }
    },
    "8092ac5e-dfd0-4492-a65d-8ac3eec325e0": {
      "padding": {
        "ref": "pipe",
        "id": "67f70d97-a346-42e4-833f-6eaeaeed4fef"
      }
    },
    "a9461e28-7d92-49a0-9001-23d74e4b382d": {
      "padding": {
        "ref": "pipe",
        "id": "98257461-928e-4ff9-8ac5-0b89298e4ef1"
      }
    },
    "766b11ec-da27-494c-b272-c26fec3f6475": {
      "padding": {
        "ref": "pipe",
        "id": "9931fe6a-074e-4cb7-8355-c18d818679a7"
      },
      "float": {
        "ref": "pipe",
        "id": "72b559e9-2546-4bae-8a61-555567363b11"
      },
      "textAlign": {
        "ref": "pipe",
        "id": "6635dbb2-b364-4efd-8061-26432007eb1a"
      },
      "maxWidth": {
        "ref": "pipe",
        "id": "042ccf7d-819b-4fac-8282-2f19069b5386"
      }
    },
    "cbcd8edb-4aa2-43fe-ad39-cee79b490295": {
      "padding": {
        "ref": "pipe",
        "id": "ef8dc9c6-f333-4b61-8d25-d36afe517520"
      },
      "display": {
        "ref": "pipe",
        "id": "755a70a2-d181-4faf-8593-5ab7601158f9"
      }
    },
    "6763f102-23f7-4390-b463-4e1b14e866c9": {
      "padding": {
        "ref": "pipe",
        "id": "9f501c35-54b3-4c60-8fc4-d6a45e776eb3"
      },
      "display": {
        "ref": "pipe",
        "id": "e8acc6b0-d1de-443b-8128-df6b5186f70c"
      }
    },
    "91c9adf0-d62e-4580-93e7-f39594ae5e7d": {
      "padding": {
        "ref": "pipe",
        "id": "71764362-e09a-4412-8fbc-ed3cb4d4c954"
      },
      "display": {
        "ref": "pipe",
        "id": "c199b191-88d2-463d-8564-1ce1a1631b2d"
      }
    },
    "e9fbeb39-7193-4522-91b3-761bd35639d3": {
      "padding": {
        "ref": "pipe",
        "id": "b2117e6b-ace7-4e75-8e7d-323668d1b19d"
      },
      "display": {
        "ref": "pipe",
        "id": "8a53848d-8c7d-44dc-8d13-ae060107c80b"
      }
    },
    "3cf5d89d-3703-483e-ab64-5a5b780aec27": {
      "padding": {
        "ref": "pipe",
        "id": "1906b5b4-6024-48f1-84da-c332e555afb3"
      },
      "display": {
        "ref": "pipe",
        "id": "a565696d-8a60-416e-844a-60c8f2fe8c5a"
      }
    },
    "fq9dd6d2-00db-8ab5-c332-882575f25426": {
      "padding": {
        "ref": "pipe",
        "id": "15d47b07-396c-4c03-8591-f472598f15e2"
      },
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
      "padding": {
        "ref": "pipe",
        "id": "a8f5c1ce-783b-4626-826a-473ab434c0b2"
      }
    },
    "wf8d73b3-90eb-41e7-8651-2bdcc93f3871": {
      "display": {
        "ref": "pipe",
        "id": "d1314274-5efc-4be1-830b-0ff8c92b5029"
      }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmlnLmpzL2JpZy5qcyIsIm5vZGVfbW9kdWxlcy9mYXN0Y2xpY2svbGliL2Zhc3RjbGljay5qcyIsIm5vZGVfbW9kdWxlcy9zbmFiYmRvbS9oLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL2h0bWxkb21hcGkuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vaXMuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vbW9kdWxlcy9hdHRyaWJ1dGVzLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvY2xhc3MuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vbW9kdWxlcy9ldmVudGxpc3RlbmVycy5qcyIsIm5vZGVfbW9kdWxlcy9zbmFiYmRvbS9tb2R1bGVzL3Byb3BzLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvc3R5bGUuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vc25hYmJkb20uanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vdm5vZGUuanMiLCJzcmNcXGluZGV4LmpzIiwic3JjXFx1Z25pcy5qcyIsInVnbmlzX2NvbXBvbmVudHMvYXBwLmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdG5DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3owQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBiaWcuanMgdjMuMS4zIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWtlTWNsL2JpZy5qcy9MSUNFTkNFICovXHJcbjsoZnVuY3Rpb24gKGdsb2JhbCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuLypcclxuICBiaWcuanMgdjMuMS4zXHJcbiAgQSBzbWFsbCwgZmFzdCwgZWFzeS10by11c2UgbGlicmFyeSBmb3IgYXJiaXRyYXJ5LXByZWNpc2lvbiBkZWNpbWFsIGFyaXRobWV0aWMuXHJcbiAgaHR0cHM6Ly9naXRodWIuY29tL01pa2VNY2wvYmlnLmpzL1xyXG4gIENvcHlyaWdodCAoYykgMjAxNCBNaWNoYWVsIE1jbGF1Z2hsaW4gPE04Y2g4OGxAZ21haWwuY29tPlxyXG4gIE1JVCBFeHBhdCBMaWNlbmNlXHJcbiovXHJcblxyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogRURJVEFCTEUgREVGQVVMVFMgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuICAgIC8vIFRoZSBkZWZhdWx0IHZhbHVlcyBiZWxvdyBtdXN0IGJlIGludGVnZXJzIHdpdGhpbiB0aGUgc3RhdGVkIHJhbmdlcy5cclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIG1heGltdW0gbnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzIG9mIHRoZSByZXN1bHRzIG9mIG9wZXJhdGlvbnNcclxuICAgICAqIGludm9sdmluZyBkaXZpc2lvbjogZGl2IGFuZCBzcXJ0LCBhbmQgcG93IHdpdGggbmVnYXRpdmUgZXhwb25lbnRzLlxyXG4gICAgICovXHJcbiAgICB2YXIgRFAgPSAyMCwgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIE1BWF9EUFxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSByb3VuZGluZyBtb2RlIHVzZWQgd2hlbiByb3VuZGluZyB0byB0aGUgYWJvdmUgZGVjaW1hbCBwbGFjZXMuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiAwIFRvd2FyZHMgemVybyAoaS5lLiB0cnVuY2F0ZSwgbm8gcm91bmRpbmcpLiAgICAgICAoUk9VTkRfRE9XTilcclxuICAgICAgICAgKiAxIFRvIG5lYXJlc3QgbmVpZ2hib3VyLiBJZiBlcXVpZGlzdGFudCwgcm91bmQgdXAuICAoUk9VTkRfSEFMRl9VUClcclxuICAgICAgICAgKiAyIFRvIG5lYXJlc3QgbmVpZ2hib3VyLiBJZiBlcXVpZGlzdGFudCwgdG8gZXZlbi4gICAoUk9VTkRfSEFMRl9FVkVOKVxyXG4gICAgICAgICAqIDMgQXdheSBmcm9tIHplcm8uICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChST1VORF9VUClcclxuICAgICAgICAgKi9cclxuICAgICAgICBSTSA9IDEsICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAsIDEsIDIgb3IgM1xyXG5cclxuICAgICAgICAvLyBUaGUgbWF4aW11bSB2YWx1ZSBvZiBEUCBhbmQgQmlnLkRQLlxyXG4gICAgICAgIE1BWF9EUCA9IDFFNiwgICAgICAgICAgICAgICAgICAgICAgLy8gMCB0byAxMDAwMDAwXHJcblxyXG4gICAgICAgIC8vIFRoZSBtYXhpbXVtIG1hZ25pdHVkZSBvZiB0aGUgZXhwb25lbnQgYXJndW1lbnQgdG8gdGhlIHBvdyBtZXRob2QuXHJcbiAgICAgICAgTUFYX1BPV0VSID0gMUU2LCAgICAgICAgICAgICAgICAgICAvLyAxIHRvIDEwMDAwMDBcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgZXhwb25lbnQgdmFsdWUgYXQgYW5kIGJlbmVhdGggd2hpY2ggdG9TdHJpbmcgcmV0dXJucyBleHBvbmVudGlhbFxyXG4gICAgICAgICAqIG5vdGF0aW9uLlxyXG4gICAgICAgICAqIEphdmFTY3JpcHQncyBOdW1iZXIgdHlwZTogLTdcclxuICAgICAgICAgKiAtMTAwMDAwMCBpcyB0aGUgbWluaW11bSByZWNvbW1lbmRlZCBleHBvbmVudCB2YWx1ZSBvZiBhIEJpZy5cclxuICAgICAgICAgKi9cclxuICAgICAgICBFX05FRyA9IC03LCAgICAgICAgICAgICAgICAgICAvLyAwIHRvIC0xMDAwMDAwXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVGhlIGV4cG9uZW50IHZhbHVlIGF0IGFuZCBhYm92ZSB3aGljaCB0b1N0cmluZyByZXR1cm5zIGV4cG9uZW50aWFsXHJcbiAgICAgICAgICogbm90YXRpb24uXHJcbiAgICAgICAgICogSmF2YVNjcmlwdCdzIE51bWJlciB0eXBlOiAyMVxyXG4gICAgICAgICAqIDEwMDAwMDAgaXMgdGhlIG1heGltdW0gcmVjb21tZW5kZWQgZXhwb25lbnQgdmFsdWUgb2YgYSBCaWcuXHJcbiAgICAgICAgICogKFRoaXMgbGltaXQgaXMgbm90IGVuZm9yY2VkIG9yIGNoZWNrZWQuKVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIEVfUE9TID0gMjEsICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gMTAwMDAwMFxyXG5cclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuXHJcbiAgICAgICAgLy8gVGhlIHNoYXJlZCBwcm90b3R5cGUgb2JqZWN0LlxyXG4gICAgICAgIFAgPSB7fSxcclxuICAgICAgICBpc1ZhbGlkID0gL14tPyhcXGQrKFxcLlxcZCopP3xcXC5cXGQrKShlWystXT9cXGQrKT8kL2ksXHJcbiAgICAgICAgQmlnO1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogQ3JlYXRlIGFuZCByZXR1cm4gYSBCaWcgY29uc3RydWN0b3IuXHJcbiAgICAgKlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBiaWdGYWN0b3J5KCkge1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSBCaWcgY29uc3RydWN0b3IgYW5kIGV4cG9ydGVkIGZ1bmN0aW9uLlxyXG4gICAgICAgICAqIENyZWF0ZSBhbmQgcmV0dXJuIGEgbmV3IGluc3RhbmNlIG9mIGEgQmlnIG51bWJlciBvYmplY3QuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBuIHtudW1iZXJ8c3RyaW5nfEJpZ30gQSBudW1lcmljIHZhbHVlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIEJpZyhuKSB7XHJcbiAgICAgICAgICAgIHZhciB4ID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIC8vIEVuYWJsZSBjb25zdHJ1Y3RvciB1c2FnZSB3aXRob3V0IG5ldy5cclxuICAgICAgICAgICAgaWYgKCEoeCBpbnN0YW5jZW9mIEJpZykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuID09PSB2b2lkIDAgPyBiaWdGYWN0b3J5KCkgOiBuZXcgQmlnKG4pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBEdXBsaWNhdGUuXHJcbiAgICAgICAgICAgIGlmIChuIGluc3RhbmNlb2YgQmlnKSB7XHJcbiAgICAgICAgICAgICAgICB4LnMgPSBuLnM7XHJcbiAgICAgICAgICAgICAgICB4LmUgPSBuLmU7XHJcbiAgICAgICAgICAgICAgICB4LmMgPSBuLmMuc2xpY2UoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBhcnNlKHgsIG4pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgKiBSZXRhaW4gYSByZWZlcmVuY2UgdG8gdGhpcyBCaWcgY29uc3RydWN0b3IsIGFuZCBzaGFkb3dcclxuICAgICAgICAgICAgICogQmlnLnByb3RvdHlwZS5jb25zdHJ1Y3RvciB3aGljaCBwb2ludHMgdG8gT2JqZWN0LlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgeC5jb25zdHJ1Y3RvciA9IEJpZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEJpZy5wcm90b3R5cGUgPSBQO1xyXG4gICAgICAgIEJpZy5EUCA9IERQO1xyXG4gICAgICAgIEJpZy5STSA9IFJNO1xyXG4gICAgICAgIEJpZy5FX05FRyA9IEVfTkVHO1xyXG4gICAgICAgIEJpZy5FX1BPUyA9IEVfUE9TO1xyXG5cclxuICAgICAgICByZXR1cm4gQmlnO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBQcml2YXRlIGZ1bmN0aW9uc1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgQmlnIHggaW4gbm9ybWFsIG9yIGV4cG9uZW50aWFsXHJcbiAgICAgKiBub3RhdGlvbiB0byBkcCBmaXhlZCBkZWNpbWFsIHBsYWNlcyBvciBzaWduaWZpY2FudCBkaWdpdHMuXHJcbiAgICAgKlxyXG4gICAgICogeCB7QmlnfSBUaGUgQmlnIHRvIGZvcm1hdC5cclxuICAgICAqIGRwIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqIHRvRSB7bnVtYmVyfSAxICh0b0V4cG9uZW50aWFsKSwgMiAodG9QcmVjaXNpb24pIG9yIHVuZGVmaW5lZCAodG9GaXhlZCkuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGZvcm1hdCh4LCBkcCwgdG9FKSB7XHJcbiAgICAgICAgdmFyIEJpZyA9IHguY29uc3RydWN0b3IsXHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgaW5kZXggKG5vcm1hbCBub3RhdGlvbikgb2YgdGhlIGRpZ2l0IHRoYXQgbWF5IGJlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgIGkgPSBkcCAtICh4ID0gbmV3IEJpZyh4KSkuZSxcclxuICAgICAgICAgICAgYyA9IHguYztcclxuXHJcbiAgICAgICAgLy8gUm91bmQ/XHJcbiAgICAgICAgaWYgKGMubGVuZ3RoID4gKytkcCkge1xyXG4gICAgICAgICAgICBybmQoeCwgaSwgQmlnLlJNKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghY1swXSkge1xyXG4gICAgICAgICAgICArK2k7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0b0UpIHtcclxuICAgICAgICAgICAgaSA9IGRwO1xyXG5cclxuICAgICAgICAvLyB0b0ZpeGVkXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYyA9IHguYztcclxuXHJcbiAgICAgICAgICAgIC8vIFJlY2FsY3VsYXRlIGkgYXMgeC5lIG1heSBoYXZlIGNoYW5nZWQgaWYgdmFsdWUgcm91bmRlZCB1cC5cclxuICAgICAgICAgICAgaSA9IHguZSArIGkgKyAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQXBwZW5kIHplcm9zP1xyXG4gICAgICAgIGZvciAoOyBjLmxlbmd0aCA8IGk7IGMucHVzaCgwKSkge1xyXG4gICAgICAgIH1cclxuICAgICAgICBpID0geC5lO1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIHRvUHJlY2lzaW9uIHJldHVybnMgZXhwb25lbnRpYWwgbm90YXRpb24gaWYgdGhlIG51bWJlciBvZlxyXG4gICAgICAgICAqIHNpZ25pZmljYW50IGRpZ2l0cyBzcGVjaWZpZWQgaXMgbGVzcyB0aGFuIHRoZSBudW1iZXIgb2YgZGlnaXRzXHJcbiAgICAgICAgICogbmVjZXNzYXJ5IHRvIHJlcHJlc2VudCB0aGUgaW50ZWdlciBwYXJ0IG9mIHRoZSB2YWx1ZSBpbiBub3JtYWxcclxuICAgICAgICAgKiBub3RhdGlvbi5cclxuICAgICAgICAgKi9cclxuICAgICAgICByZXR1cm4gdG9FID09PSAxIHx8IHRvRSAmJiAoZHAgPD0gaSB8fCBpIDw9IEJpZy5FX05FRykgP1xyXG5cclxuICAgICAgICAgIC8vIEV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAgICAgICAgKHgucyA8IDAgJiYgY1swXSA/ICctJyA6ICcnKSArXHJcbiAgICAgICAgICAgIChjLmxlbmd0aCA+IDEgPyBjWzBdICsgJy4nICsgYy5qb2luKCcnKS5zbGljZSgxKSA6IGNbMF0pICtcclxuICAgICAgICAgICAgICAoaSA8IDAgPyAnZScgOiAnZSsnKSArIGlcclxuXHJcbiAgICAgICAgICAvLyBOb3JtYWwgbm90YXRpb24uXHJcbiAgICAgICAgICA6IHgudG9TdHJpbmcoKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFBhcnNlIHRoZSBudW1iZXIgb3Igc3RyaW5nIHZhbHVlIHBhc3NlZCB0byBhIEJpZyBjb25zdHJ1Y3Rvci5cclxuICAgICAqXHJcbiAgICAgKiB4IHtCaWd9IEEgQmlnIG51bWJlciBpbnN0YW5jZS5cclxuICAgICAqIG4ge251bWJlcnxzdHJpbmd9IEEgbnVtZXJpYyB2YWx1ZS5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcGFyc2UoeCwgbikge1xyXG4gICAgICAgIHZhciBlLCBpLCBuTDtcclxuXHJcbiAgICAgICAgLy8gTWludXMgemVybz9cclxuICAgICAgICBpZiAobiA9PT0gMCAmJiAxIC8gbiA8IDApIHtcclxuICAgICAgICAgICAgbiA9ICctMCc7XHJcblxyXG4gICAgICAgIC8vIEVuc3VyZSBuIGlzIHN0cmluZyBhbmQgY2hlY2sgdmFsaWRpdHkuXHJcbiAgICAgICAgfSBlbHNlIGlmICghaXNWYWxpZC50ZXN0KG4gKz0gJycpKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKE5hTik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgc2lnbi5cclxuICAgICAgICB4LnMgPSBuLmNoYXJBdCgwKSA9PSAnLScgPyAobiA9IG4uc2xpY2UoMSksIC0xKSA6IDE7XHJcblxyXG4gICAgICAgIC8vIERlY2ltYWwgcG9pbnQ/XHJcbiAgICAgICAgaWYgKChlID0gbi5pbmRleE9mKCcuJykpID4gLTEpIHtcclxuICAgICAgICAgICAgbiA9IG4ucmVwbGFjZSgnLicsICcnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEV4cG9uZW50aWFsIGZvcm0/XHJcbiAgICAgICAgaWYgKChpID0gbi5zZWFyY2goL2UvaSkpID4gMCkge1xyXG5cclxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIGV4cG9uZW50LlxyXG4gICAgICAgICAgICBpZiAoZSA8IDApIHtcclxuICAgICAgICAgICAgICAgIGUgPSBpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGUgKz0gK24uc2xpY2UoaSArIDEpO1xyXG4gICAgICAgICAgICBuID0gbi5zdWJzdHJpbmcoMCwgaSk7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAoZSA8IDApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIEludGVnZXIuXHJcbiAgICAgICAgICAgIGUgPSBuLmxlbmd0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSBsZWFkaW5nIHplcm9zLlxyXG4gICAgICAgIGZvciAoaSA9IDA7IG4uY2hhckF0KGkpID09ICcwJzsgaSsrKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaSA9PSAobkwgPSBuLmxlbmd0aCkpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFplcm8uXHJcbiAgICAgICAgICAgIHguYyA9IFsgeC5lID0gMCBdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoOyBuLmNoYXJBdCgtLW5MKSA9PSAnMCc7KSB7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHguZSA9IGUgLSBpIC0gMTtcclxuICAgICAgICAgICAgeC5jID0gW107XHJcblxyXG4gICAgICAgICAgICAvLyBDb252ZXJ0IHN0cmluZyB0byBhcnJheSBvZiBkaWdpdHMgd2l0aG91dCBsZWFkaW5nL3RyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKGUgPSAwOyBpIDw9IG5MOyB4LmNbZSsrXSA9ICtuLmNoYXJBdChpKyspKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUm91bmQgQmlnIHggdG8gYSBtYXhpbXVtIG9mIGRwIGRlY2ltYWwgcGxhY2VzIHVzaW5nIHJvdW5kaW5nIG1vZGUgcm0uXHJcbiAgICAgKiBDYWxsZWQgYnkgZGl2LCBzcXJ0IGFuZCByb3VuZC5cclxuICAgICAqXHJcbiAgICAgKiB4IHtCaWd9IFRoZSBCaWcgdG8gcm91bmQuXHJcbiAgICAgKiBkcCB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKiBybSB7bnVtYmVyfSAwLCAxLCAyIG9yIDMgKERPV04sIEhBTEZfVVAsIEhBTEZfRVZFTiwgVVApXHJcbiAgICAgKiBbbW9yZV0ge2Jvb2xlYW59IFdoZXRoZXIgdGhlIHJlc3VsdCBvZiBkaXZpc2lvbiB3YXMgdHJ1bmNhdGVkLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBybmQoeCwgZHAsIHJtLCBtb3JlKSB7XHJcbiAgICAgICAgdmFyIHUsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICBpID0geC5lICsgZHAgKyAxO1xyXG5cclxuICAgICAgICBpZiAocm0gPT09IDEpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHhjW2ldIGlzIHRoZSBkaWdpdCBhZnRlciB0aGUgZGlnaXQgdGhhdCBtYXkgYmUgcm91bmRlZCB1cC5cclxuICAgICAgICAgICAgbW9yZSA9IHhjW2ldID49IDU7XHJcbiAgICAgICAgfSBlbHNlIGlmIChybSA9PT0gMikge1xyXG4gICAgICAgICAgICBtb3JlID0geGNbaV0gPiA1IHx8IHhjW2ldID09IDUgJiZcclxuICAgICAgICAgICAgICAobW9yZSB8fCBpIDwgMCB8fCB4Y1tpICsgMV0gIT09IHUgfHwgeGNbaSAtIDFdICYgMSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChybSA9PT0gMykge1xyXG4gICAgICAgICAgICBtb3JlID0gbW9yZSB8fCB4Y1tpXSAhPT0gdSB8fCBpIDwgMDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBtb3JlID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBpZiAocm0gIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRocm93RXJyKCchQmlnLlJNIScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaSA8IDEgfHwgIXhjWzBdKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAobW9yZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIDEsIDAuMSwgMC4wMSwgMC4wMDEsIDAuMDAwMSBldGMuXHJcbiAgICAgICAgICAgICAgICB4LmUgPSAtZHA7XHJcbiAgICAgICAgICAgICAgICB4LmMgPSBbMV07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gWmVyby5cclxuICAgICAgICAgICAgICAgIHguYyA9IFt4LmUgPSAwXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgYW55IGRpZ2l0cyBhZnRlciB0aGUgcmVxdWlyZWQgZGVjaW1hbCBwbGFjZXMuXHJcbiAgICAgICAgICAgIHhjLmxlbmd0aCA9IGktLTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJvdW5kIHVwP1xyXG4gICAgICAgICAgICBpZiAobW9yZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFJvdW5kaW5nIHVwIG1heSBtZWFuIHRoZSBwcmV2aW91cyBkaWdpdCBoYXMgdG8gYmUgcm91bmRlZCB1cC5cclxuICAgICAgICAgICAgICAgIGZvciAoOyArK3hjW2ldID4gOTspIHtcclxuICAgICAgICAgICAgICAgICAgICB4Y1tpXSA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghaS0tKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsreC5lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4Yy51bnNoaWZ0KDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKGkgPSB4Yy5sZW5ndGg7ICF4Y1stLWldOyB4Yy5wb3AoKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4geDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFRocm93IGEgQmlnRXJyb3IuXHJcbiAgICAgKlxyXG4gICAgICogbWVzc2FnZSB7c3RyaW5nfSBUaGUgZXJyb3IgbWVzc2FnZS5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gdGhyb3dFcnIobWVzc2FnZSkge1xyXG4gICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IobWVzc2FnZSk7XHJcbiAgICAgICAgZXJyLm5hbWUgPSAnQmlnRXJyb3InO1xyXG5cclxuICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIFByb3RvdHlwZS9pbnN0YW5jZSBtZXRob2RzXHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiB0aGlzIEJpZy5cclxuICAgICAqL1xyXG4gICAgUC5hYnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHggPSBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih0aGlzKTtcclxuICAgICAgICB4LnMgPSAxO1xyXG5cclxuICAgICAgICByZXR1cm4geDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm5cclxuICAgICAqIDEgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGdyZWF0ZXIgdGhhbiB0aGUgdmFsdWUgb2YgQmlnIHksXHJcbiAgICAgKiAtMSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgbGVzcyB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSwgb3JcclxuICAgICAqIDAgaWYgdGhleSBoYXZlIHRoZSBzYW1lIHZhbHVlLlxyXG4gICAgKi9cclxuICAgIFAuY21wID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgeE5lZyxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICB5YyA9ICh5ID0gbmV3IHguY29uc3RydWN0b3IoeSkpLmMsXHJcbiAgICAgICAgICAgIGkgPSB4LnMsXHJcbiAgICAgICAgICAgIGogPSB5LnMsXHJcbiAgICAgICAgICAgIGsgPSB4LmUsXHJcbiAgICAgICAgICAgIGwgPSB5LmU7XHJcblxyXG4gICAgICAgIC8vIEVpdGhlciB6ZXJvP1xyXG4gICAgICAgIGlmICgheGNbMF0gfHwgIXljWzBdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAheGNbMF0gPyAheWNbMF0gPyAwIDogLWogOiBpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU2lnbnMgZGlmZmVyP1xyXG4gICAgICAgIGlmIChpICE9IGopIHtcclxuICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHhOZWcgPSBpIDwgMDtcclxuXHJcbiAgICAgICAgLy8gQ29tcGFyZSBleHBvbmVudHMuXHJcbiAgICAgICAgaWYgKGsgIT0gbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gayA+IGwgXiB4TmVnID8gMSA6IC0xO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaSA9IC0xO1xyXG4gICAgICAgIGogPSAoayA9IHhjLmxlbmd0aCkgPCAobCA9IHljLmxlbmd0aCkgPyBrIDogbDtcclxuXHJcbiAgICAgICAgLy8gQ29tcGFyZSBkaWdpdCBieSBkaWdpdC5cclxuICAgICAgICBmb3IgKDsgKytpIDwgajspIHtcclxuXHJcbiAgICAgICAgICAgIGlmICh4Y1tpXSAhPSB5Y1tpXSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHhjW2ldID4geWNbaV0gXiB4TmVnID8gMSA6IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDb21wYXJlIGxlbmd0aHMuXHJcbiAgICAgICAgcmV0dXJuIGsgPT0gbCA/IDAgOiBrID4gbCBeIHhOZWcgPyAxIDogLTE7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgZGl2aWRlZCBieSB0aGVcclxuICAgICAqIHZhbHVlIG9mIEJpZyB5LCByb3VuZGVkLCBpZiBuZWNlc3NhcnksIHRvIGEgbWF4aW11bSBvZiBCaWcuRFAgZGVjaW1hbFxyXG4gICAgICogcGxhY2VzIHVzaW5nIHJvdW5kaW5nIG1vZGUgQmlnLlJNLlxyXG4gICAgICovXHJcbiAgICBQLmRpdiA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICAvLyBkaXZpZGVuZFxyXG4gICAgICAgICAgICBkdmQgPSB4LmMsXHJcbiAgICAgICAgICAgIC8vZGl2aXNvclxyXG4gICAgICAgICAgICBkdnMgPSAoeSA9IG5ldyBCaWcoeSkpLmMsXHJcbiAgICAgICAgICAgIHMgPSB4LnMgPT0geS5zID8gMSA6IC0xLFxyXG4gICAgICAgICAgICBkcCA9IEJpZy5EUDtcclxuXHJcbiAgICAgICAgaWYgKGRwICE9PSB+fmRwIHx8IGRwIDwgMCB8fCBkcCA+IE1BWF9EUCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIUJpZy5EUCEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEVpdGhlciAwP1xyXG4gICAgICAgIGlmICghZHZkWzBdIHx8ICFkdnNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIGJvdGggYXJlIDAsIHRocm93IE5hTlxyXG4gICAgICAgICAgICBpZiAoZHZkWzBdID09IGR2c1swXSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3dFcnIoTmFOKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gSWYgZHZzIGlzIDAsIHRocm93ICstSW5maW5pdHkuXHJcbiAgICAgICAgICAgIGlmICghZHZzWzBdKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvd0VycihzIC8gMCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGR2ZCBpcyAwLCByZXR1cm4gKy0wLlxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEJpZyhzICogMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgZHZzTCwgZHZzVCwgbmV4dCwgY21wLCByZW1JLCB1LFxyXG4gICAgICAgICAgICBkdnNaID0gZHZzLnNsaWNlKCksXHJcbiAgICAgICAgICAgIGR2ZEkgPSBkdnNMID0gZHZzLmxlbmd0aCxcclxuICAgICAgICAgICAgZHZkTCA9IGR2ZC5sZW5ndGgsXHJcbiAgICAgICAgICAgIC8vIHJlbWFpbmRlclxyXG4gICAgICAgICAgICByZW0gPSBkdmQuc2xpY2UoMCwgZHZzTCksXHJcbiAgICAgICAgICAgIHJlbUwgPSByZW0ubGVuZ3RoLFxyXG4gICAgICAgICAgICAvLyBxdW90aWVudFxyXG4gICAgICAgICAgICBxID0geSxcclxuICAgICAgICAgICAgcWMgPSBxLmMgPSBbXSxcclxuICAgICAgICAgICAgcWkgPSAwLFxyXG4gICAgICAgICAgICBkaWdpdHMgPSBkcCArIChxLmUgPSB4LmUgLSB5LmUpICsgMTtcclxuXHJcbiAgICAgICAgcS5zID0gcztcclxuICAgICAgICBzID0gZGlnaXRzIDwgMCA/IDAgOiBkaWdpdHM7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSB2ZXJzaW9uIG9mIGRpdmlzb3Igd2l0aCBsZWFkaW5nIHplcm8uXHJcbiAgICAgICAgZHZzWi51bnNoaWZ0KDApO1xyXG5cclxuICAgICAgICAvLyBBZGQgemVyb3MgdG8gbWFrZSByZW1haW5kZXIgYXMgbG9uZyBhcyBkaXZpc29yLlxyXG4gICAgICAgIGZvciAoOyByZW1MKysgPCBkdnNMOyByZW0ucHVzaCgwKSkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZG8ge1xyXG5cclxuICAgICAgICAgICAgLy8gJ25leHQnIGlzIGhvdyBtYW55IHRpbWVzIHRoZSBkaXZpc29yIGdvZXMgaW50byBjdXJyZW50IHJlbWFpbmRlci5cclxuICAgICAgICAgICAgZm9yIChuZXh0ID0gMDsgbmV4dCA8IDEwOyBuZXh0KyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDb21wYXJlIGRpdmlzb3IgYW5kIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgIGlmIChkdnNMICE9IChyZW1MID0gcmVtLmxlbmd0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbXAgPSBkdnNMID4gcmVtTCA/IDEgOiAtMTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAocmVtSSA9IC0xLCBjbXAgPSAwOyArK3JlbUkgPCBkdnNMOykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGR2c1tyZW1JXSAhPSByZW1bcmVtSV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNtcCA9IGR2c1tyZW1JXSA+IHJlbVtyZW1JXSA/IDEgOiAtMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIElmIGRpdmlzb3IgPCByZW1haW5kZXIsIHN1YnRyYWN0IGRpdmlzb3IgZnJvbSByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICBpZiAoY21wIDwgMCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBSZW1haW5kZXIgY2FuJ3QgYmUgbW9yZSB0aGFuIDEgZGlnaXQgbG9uZ2VyIHRoYW4gZGl2aXNvci5cclxuICAgICAgICAgICAgICAgICAgICAvLyBFcXVhbGlzZSBsZW5ndGhzIHVzaW5nIGRpdmlzb3Igd2l0aCBleHRyYSBsZWFkaW5nIHplcm8/XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChkdnNUID0gcmVtTCA9PSBkdnNMID8gZHZzIDogZHZzWjsgcmVtTDspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZW1bLS1yZW1MXSA8IGR2c1RbcmVtTF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbUkgPSByZW1MO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoOyByZW1JICYmICFyZW1bLS1yZW1JXTsgcmVtW3JlbUldID0gOSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLS1yZW1bcmVtSV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1bcmVtTF0gKz0gMTA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVtW3JlbUxdIC09IGR2c1RbcmVtTF07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoOyAhcmVtWzBdOyByZW0uc2hpZnQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgJ25leHQnIGRpZ2l0IHRvIHRoZSByZXN1bHQgYXJyYXkuXHJcbiAgICAgICAgICAgIHFjW3FpKytdID0gY21wID8gbmV4dCA6ICsrbmV4dDtcclxuXHJcbiAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICBpZiAocmVtWzBdICYmIGNtcCkge1xyXG4gICAgICAgICAgICAgICAgcmVtW3JlbUxdID0gZHZkW2R2ZEldIHx8IDA7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZW0gPSBbIGR2ZFtkdmRJXSBdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gd2hpbGUgKChkdmRJKysgPCBkdmRMIHx8IHJlbVswXSAhPT0gdSkgJiYgcy0tKTtcclxuXHJcbiAgICAgICAgLy8gTGVhZGluZyB6ZXJvPyBEbyBub3QgcmVtb3ZlIGlmIHJlc3VsdCBpcyBzaW1wbHkgemVybyAocWkgPT0gMSkuXHJcbiAgICAgICAgaWYgKCFxY1swXSAmJiBxaSAhPSAxKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBUaGVyZSBjYW4ndCBiZSBtb3JlIHRoYW4gb25lIHplcm8uXHJcbiAgICAgICAgICAgIHFjLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIHEuZS0tO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUm91bmQ/XHJcbiAgICAgICAgaWYgKHFpID4gZGlnaXRzKSB7XHJcbiAgICAgICAgICAgIHJuZChxLCBkcCwgQmlnLlJNLCByZW1bMF0gIT09IHUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHE7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGVxdWFsIHRvIHRoZSB2YWx1ZSBvZiBCaWcgeSxcclxuICAgICAqIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmVxID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICByZXR1cm4gIXRoaXMuY21wKHkpO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBncmVhdGVyIHRoYW4gdGhlIHZhbHVlIG9mIEJpZyB5LFxyXG4gICAgICogb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAuZ3QgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNtcCh5KSA+IDA7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byB0aGVcclxuICAgICAqIHZhbHVlIG9mIEJpZyB5LCBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5ndGUgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNtcCh5KSA+IC0xO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBsZXNzIHRoYW4gdGhlIHZhbHVlIG9mIEJpZyB5LFxyXG4gICAgICogb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAubHQgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNtcCh5KSA8IDA7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0byB0aGUgdmFsdWVcclxuICAgICAqIG9mIEJpZyB5LCBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5sdGUgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgICByZXR1cm4gdGhpcy5jbXAoeSkgPCAxO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIG1pbnVzIHRoZSB2YWx1ZVxyXG4gICAgICogb2YgQmlnIHkuXHJcbiAgICAgKi9cclxuICAgIFAuc3ViID0gUC5taW51cyA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIGksIGosIHQsIHhMVHksXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBhID0geC5zLFxyXG4gICAgICAgICAgICBiID0gKHkgPSBuZXcgQmlnKHkpKS5zO1xyXG5cclxuICAgICAgICAvLyBTaWducyBkaWZmZXI/XHJcbiAgICAgICAgaWYgKGEgIT0gYikge1xyXG4gICAgICAgICAgICB5LnMgPSAtYjtcclxuICAgICAgICAgICAgcmV0dXJuIHgucGx1cyh5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciB4YyA9IHguYy5zbGljZSgpLFxyXG4gICAgICAgICAgICB4ZSA9IHguZSxcclxuICAgICAgICAgICAgeWMgPSB5LmMsXHJcbiAgICAgICAgICAgIHllID0geS5lO1xyXG5cclxuICAgICAgICAvLyBFaXRoZXIgemVybz9cclxuICAgICAgICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xyXG5cclxuICAgICAgICAgICAgLy8geSBpcyBub24temVybz8geCBpcyBub24temVybz8gT3IgYm90aCBhcmUgemVyby5cclxuICAgICAgICAgICAgcmV0dXJuIHljWzBdID8gKHkucyA9IC1iLCB5KSA6IG5ldyBCaWcoeGNbMF0gPyB4IDogMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgd2hpY2ggaXMgdGhlIGJpZ2dlciBudW1iZXIuXHJcbiAgICAgICAgLy8gUHJlcGVuZCB6ZXJvcyB0byBlcXVhbGlzZSBleHBvbmVudHMuXHJcbiAgICAgICAgaWYgKGEgPSB4ZSAtIHllKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoeExUeSA9IGEgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBhID0gLWE7XHJcbiAgICAgICAgICAgICAgICB0ID0geGM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB5ZSA9IHhlO1xyXG4gICAgICAgICAgICAgICAgdCA9IHljO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgICAgICAgZm9yIChiID0gYTsgYi0tOyB0LnB1c2goMCkpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gRXhwb25lbnRzIGVxdWFsLiBDaGVjayBkaWdpdCBieSBkaWdpdC5cclxuICAgICAgICAgICAgaiA9ICgoeExUeSA9IHhjLmxlbmd0aCA8IHljLmxlbmd0aCkgPyB4YyA6IHljKS5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGEgPSBiID0gMDsgYiA8IGo7IGIrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh4Y1tiXSAhPSB5Y1tiXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHhMVHkgPSB4Y1tiXSA8IHljW2JdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyB4IDwgeT8gUG9pbnQgeGMgdG8gdGhlIGFycmF5IG9mIHRoZSBiaWdnZXIgbnVtYmVyLlxyXG4gICAgICAgIGlmICh4TFR5KSB7XHJcbiAgICAgICAgICAgIHQgPSB4YztcclxuICAgICAgICAgICAgeGMgPSB5YztcclxuICAgICAgICAgICAgeWMgPSB0O1xyXG4gICAgICAgICAgICB5LnMgPSAteS5zO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBBcHBlbmQgemVyb3MgdG8geGMgaWYgc2hvcnRlci4gTm8gbmVlZCB0byBhZGQgemVyb3MgdG8geWMgaWYgc2hvcnRlclxyXG4gICAgICAgICAqIGFzIHN1YnRyYWN0aW9uIG9ubHkgbmVlZHMgdG8gc3RhcnQgYXQgeWMubGVuZ3RoLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGlmICgoIGIgPSAoaiA9IHljLmxlbmd0aCkgLSAoaSA9IHhjLmxlbmd0aCkgKSA+IDApIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAoOyBiLS07IHhjW2krK10gPSAwKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFN1YnRyYWN0IHljIGZyb20geGMuXHJcbiAgICAgICAgZm9yIChiID0gaTsgaiA+IGE7KXtcclxuXHJcbiAgICAgICAgICAgIGlmICh4Y1stLWpdIDwgeWNbal0pIHtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSBqOyBpICYmICF4Y1stLWldOyB4Y1tpXSA9IDkpIHtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC0teGNbaV07XHJcbiAgICAgICAgICAgICAgICB4Y1tqXSArPSAxMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB4Y1tqXSAtPSB5Y1tqXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKDsgeGNbLS1iXSA9PT0gMDsgeGMucG9wKCkpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBsZWFkaW5nIHplcm9zIGFuZCBhZGp1c3QgZXhwb25lbnQgYWNjb3JkaW5nbHkuXHJcbiAgICAgICAgZm9yICg7IHhjWzBdID09PSAwOykge1xyXG4gICAgICAgICAgICB4Yy5zaGlmdCgpO1xyXG4gICAgICAgICAgICAtLXllO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF4Y1swXSkge1xyXG5cclxuICAgICAgICAgICAgLy8gbiAtIG4gPSArMFxyXG4gICAgICAgICAgICB5LnMgPSAxO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVzdWx0IG11c3QgYmUgemVyby5cclxuICAgICAgICAgICAgeGMgPSBbeWUgPSAwXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHkuYyA9IHhjO1xyXG4gICAgICAgIHkuZSA9IHllO1xyXG5cclxuICAgICAgICByZXR1cm4geTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBtb2R1bG8gdGhlXHJcbiAgICAgKiB2YWx1ZSBvZiBCaWcgeS5cclxuICAgICAqL1xyXG4gICAgUC5tb2QgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciB5R1R4LFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgYSA9IHgucyxcclxuICAgICAgICAgICAgYiA9ICh5ID0gbmV3IEJpZyh5KSkucztcclxuXHJcbiAgICAgICAgaWYgKCF5LmNbMF0pIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoTmFOKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHgucyA9IHkucyA9IDE7XHJcbiAgICAgICAgeUdUeCA9IHkuY21wKHgpID09IDE7XHJcbiAgICAgICAgeC5zID0gYTtcclxuICAgICAgICB5LnMgPSBiO1xyXG5cclxuICAgICAgICBpZiAoeUdUeCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEJpZyh4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGEgPSBCaWcuRFA7XHJcbiAgICAgICAgYiA9IEJpZy5STTtcclxuICAgICAgICBCaWcuRFAgPSBCaWcuUk0gPSAwO1xyXG4gICAgICAgIHggPSB4LmRpdih5KTtcclxuICAgICAgICBCaWcuRFAgPSBhO1xyXG4gICAgICAgIEJpZy5STSA9IGI7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLm1pbnVzKCB4LnRpbWVzKHkpICk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgcGx1cyB0aGUgdmFsdWVcclxuICAgICAqIG9mIEJpZyB5LlxyXG4gICAgICovXHJcbiAgICBQLmFkZCA9IFAucGx1cyA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIHQsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBhID0geC5zLFxyXG4gICAgICAgICAgICBiID0gKHkgPSBuZXcgQmlnKHkpKS5zO1xyXG5cclxuICAgICAgICAvLyBTaWducyBkaWZmZXI/XHJcbiAgICAgICAgaWYgKGEgIT0gYikge1xyXG4gICAgICAgICAgICB5LnMgPSAtYjtcclxuICAgICAgICAgICAgcmV0dXJuIHgubWludXMoeSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgeGUgPSB4LmUsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICB5ZSA9IHkuZSxcclxuICAgICAgICAgICAgeWMgPSB5LmM7XHJcblxyXG4gICAgICAgIC8vIEVpdGhlciB6ZXJvP1xyXG4gICAgICAgIGlmICgheGNbMF0gfHwgIXljWzBdKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB5IGlzIG5vbi16ZXJvPyB4IGlzIG5vbi16ZXJvPyBPciBib3RoIGFyZSB6ZXJvLlxyXG4gICAgICAgICAgICByZXR1cm4geWNbMF0gPyB5IDogbmV3IEJpZyh4Y1swXSA/IHggOiBhICogMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHhjID0geGMuc2xpY2UoKTtcclxuXHJcbiAgICAgICAgLy8gUHJlcGVuZCB6ZXJvcyB0byBlcXVhbGlzZSBleHBvbmVudHMuXHJcbiAgICAgICAgLy8gTm90ZTogRmFzdGVyIHRvIHVzZSByZXZlcnNlIHRoZW4gZG8gdW5zaGlmdHMuXHJcbiAgICAgICAgaWYgKGEgPSB4ZSAtIHllKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoYSA+IDApIHtcclxuICAgICAgICAgICAgICAgIHllID0geGU7XHJcbiAgICAgICAgICAgICAgICB0ID0geWM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBhID0gLWE7XHJcbiAgICAgICAgICAgICAgICB0ID0geGM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG4gICAgICAgICAgICBmb3IgKDsgYS0tOyB0LnB1c2goMCkpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFBvaW50IHhjIHRvIHRoZSBsb25nZXIgYXJyYXkuXHJcbiAgICAgICAgaWYgKHhjLmxlbmd0aCAtIHljLmxlbmd0aCA8IDApIHtcclxuICAgICAgICAgICAgdCA9IHljO1xyXG4gICAgICAgICAgICB5YyA9IHhjO1xyXG4gICAgICAgICAgICB4YyA9IHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGEgPSB5Yy5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogT25seSBzdGFydCBhZGRpbmcgYXQgeWMubGVuZ3RoIC0gMSBhcyB0aGUgZnVydGhlciBkaWdpdHMgb2YgeGMgY2FuIGJlXHJcbiAgICAgICAgICogbGVmdCBhcyB0aGV5IGFyZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBmb3IgKGIgPSAwOyBhOykge1xyXG4gICAgICAgICAgICBiID0gKHhjWy0tYV0gPSB4Y1thXSArIHljW2FdICsgYikgLyAxMCB8IDA7XHJcbiAgICAgICAgICAgIHhjW2FdICU9IDEwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTm8gbmVlZCB0byBjaGVjayBmb3IgemVybywgYXMgK3ggKyAreSAhPSAwICYmIC14ICsgLXkgIT0gMFxyXG5cclxuICAgICAgICBpZiAoYikge1xyXG4gICAgICAgICAgICB4Yy51bnNoaWZ0KGIpO1xyXG4gICAgICAgICAgICArK3llO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKGEgPSB4Yy5sZW5ndGg7IHhjWy0tYV0gPT09IDA7IHhjLnBvcCgpKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB5LmMgPSB4YztcclxuICAgICAgICB5LmUgPSB5ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyByYWlzZWQgdG8gdGhlIHBvd2VyIG4uXHJcbiAgICAgKiBJZiBuIGlzIG5lZ2F0aXZlLCByb3VuZCwgaWYgbmVjZXNzYXJ5LCB0byBhIG1heGltdW0gb2YgQmlnLkRQIGRlY2ltYWxcclxuICAgICAqIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIEJpZy5STS5cclxuICAgICAqXHJcbiAgICAgKiBuIHtudW1iZXJ9IEludGVnZXIsIC1NQVhfUE9XRVIgdG8gTUFYX1BPV0VSIGluY2x1c2l2ZS5cclxuICAgICAqL1xyXG4gICAgUC5wb3cgPSBmdW5jdGlvbiAobikge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgICAgICAgb25lID0gbmV3IHguY29uc3RydWN0b3IoMSksXHJcbiAgICAgICAgICAgIHkgPSBvbmUsXHJcbiAgICAgICAgICAgIGlzTmVnID0gbiA8IDA7XHJcblxyXG4gICAgICAgIGlmIChuICE9PSB+fm4gfHwgbiA8IC1NQVhfUE9XRVIgfHwgbiA+IE1BWF9QT1dFUikge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXBvdyEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG4gPSBpc05lZyA/IC1uIDogbjtcclxuXHJcbiAgICAgICAgZm9yICg7Oykge1xyXG5cclxuICAgICAgICAgICAgaWYgKG4gJiAxKSB7XHJcbiAgICAgICAgICAgICAgICB5ID0geS50aW1lcyh4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBuID4+PSAxO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFuKSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB4ID0geC50aW1lcyh4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBpc05lZyA/IG9uZS5kaXYoeSkgOiB5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHJvdW5kZWQgdG8gYVxyXG4gICAgICogbWF4aW11bSBvZiBkcCBkZWNpbWFsIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIHJtLlxyXG4gICAgICogSWYgZHAgaXMgbm90IHNwZWNpZmllZCwgcm91bmQgdG8gMCBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAqIElmIHJtIGlzIG5vdCBzcGVjaWZpZWQsIHVzZSBCaWcuUk0uXHJcbiAgICAgKlxyXG4gICAgICogW2RwXSB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKiBbcm1dIDAsIDEsIDIgb3IgMyAoUk9VTkRfRE9XTiwgUk9VTkRfSEFMRl9VUCwgUk9VTkRfSEFMRl9FVkVOLCBST1VORF9VUClcclxuICAgICAqL1xyXG4gICAgUC5yb3VuZCA9IGZ1bmN0aW9uIChkcCwgcm0pIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3I7XHJcblxyXG4gICAgICAgIGlmIChkcCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGRwID0gMDtcclxuICAgICAgICB9IGVsc2UgaWYgKGRwICE9PSB+fmRwIHx8IGRwIDwgMCB8fCBkcCA+IE1BWF9EUCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXJvdW5kIScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBybmQoeCA9IG5ldyBCaWcoeCksIGRwLCBybSA9PSBudWxsID8gQmlnLlJNIDogcm0pO1xyXG5cclxuICAgICAgICByZXR1cm4geDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSBzcXVhcmUgcm9vdCBvZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcsXHJcbiAgICAgKiByb3VuZGVkLCBpZiBuZWNlc3NhcnksIHRvIGEgbWF4aW11bSBvZiBCaWcuRFAgZGVjaW1hbCBwbGFjZXMgdXNpbmdcclxuICAgICAqIHJvdW5kaW5nIG1vZGUgQmlnLlJNLlxyXG4gICAgICovXHJcbiAgICBQLnNxcnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGVzdGltYXRlLCByLCBhcHByb3gsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgaSA9IHgucyxcclxuICAgICAgICAgICAgZSA9IHguZSxcclxuICAgICAgICAgICAgaGFsZiA9IG5ldyBCaWcoJzAuNScpO1xyXG5cclxuICAgICAgICAvLyBaZXJvP1xyXG4gICAgICAgIGlmICgheGNbMF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWcoeCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiBuZWdhdGl2ZSwgdGhyb3cgTmFOLlxyXG4gICAgICAgIGlmIChpIDwgMCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycihOYU4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRXN0aW1hdGUuXHJcbiAgICAgICAgaSA9IE1hdGguc3FydCh4LnRvU3RyaW5nKCkpO1xyXG5cclxuICAgICAgICAvLyBNYXRoLnNxcnQgdW5kZXJmbG93L292ZXJmbG93P1xyXG4gICAgICAgIC8vIFBhc3MgeCB0byBNYXRoLnNxcnQgYXMgaW50ZWdlciwgdGhlbiBhZGp1c3QgdGhlIHJlc3VsdCBleHBvbmVudC5cclxuICAgICAgICBpZiAoaSA9PT0gMCB8fCBpID09PSAxIC8gMCkge1xyXG4gICAgICAgICAgICBlc3RpbWF0ZSA9IHhjLmpvaW4oJycpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCEoZXN0aW1hdGUubGVuZ3RoICsgZSAmIDEpKSB7XHJcbiAgICAgICAgICAgICAgICBlc3RpbWF0ZSArPSAnMCc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHIgPSBuZXcgQmlnKCBNYXRoLnNxcnQoZXN0aW1hdGUpLnRvU3RyaW5nKCkgKTtcclxuICAgICAgICAgICAgci5lID0gKChlICsgMSkgLyAyIHwgMCkgLSAoZSA8IDAgfHwgZSAmIDEpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHIgPSBuZXcgQmlnKGkudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpID0gci5lICsgKEJpZy5EUCArPSA0KTtcclxuXHJcbiAgICAgICAgLy8gTmV3dG9uLVJhcGhzb24gaXRlcmF0aW9uLlxyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgYXBwcm94ID0gcjtcclxuICAgICAgICAgICAgciA9IGhhbGYudGltZXMoIGFwcHJveC5wbHVzKCB4LmRpdihhcHByb3gpICkgKTtcclxuICAgICAgICB9IHdoaWxlICggYXBwcm94LmMuc2xpY2UoMCwgaSkuam9pbignJykgIT09XHJcbiAgICAgICAgICAgICAgICAgICAgICAgci5jLnNsaWNlKDAsIGkpLmpvaW4oJycpICk7XHJcblxyXG4gICAgICAgIHJuZChyLCBCaWcuRFAgLT0gNCwgQmlnLlJNKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHI7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgdGltZXMgdGhlIHZhbHVlIG9mXHJcbiAgICAgKiBCaWcgeS5cclxuICAgICAqL1xyXG4gICAgUC5tdWwgPSBQLnRpbWVzID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgYyxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICB5YyA9ICh5ID0gbmV3IEJpZyh5KSkuYyxcclxuICAgICAgICAgICAgYSA9IHhjLmxlbmd0aCxcclxuICAgICAgICAgICAgYiA9IHljLmxlbmd0aCxcclxuICAgICAgICAgICAgaSA9IHguZSxcclxuICAgICAgICAgICAgaiA9IHkuZTtcclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHNpZ24gb2YgcmVzdWx0LlxyXG4gICAgICAgIHkucyA9IHgucyA9PSB5LnMgPyAxIDogLTE7XHJcblxyXG4gICAgICAgIC8vIFJldHVybiBzaWduZWQgMCBpZiBlaXRoZXIgMC5cclxuICAgICAgICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEJpZyh5LnMgKiAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpc2UgZXhwb25lbnQgb2YgcmVzdWx0IGFzIHguZSArIHkuZS5cclxuICAgICAgICB5LmUgPSBpICsgajtcclxuXHJcbiAgICAgICAgLy8gSWYgYXJyYXkgeGMgaGFzIGZld2VyIGRpZ2l0cyB0aGFuIHljLCBzd2FwIHhjIGFuZCB5YywgYW5kIGxlbmd0aHMuXHJcbiAgICAgICAgaWYgKGEgPCBiKSB7XHJcbiAgICAgICAgICAgIGMgPSB4YztcclxuICAgICAgICAgICAgeGMgPSB5YztcclxuICAgICAgICAgICAgeWMgPSBjO1xyXG4gICAgICAgICAgICBqID0gYTtcclxuICAgICAgICAgICAgYSA9IGI7XHJcbiAgICAgICAgICAgIGIgPSBqO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGlzZSBjb2VmZmljaWVudCBhcnJheSBvZiByZXN1bHQgd2l0aCB6ZXJvcy5cclxuICAgICAgICBmb3IgKGMgPSBuZXcgQXJyYXkoaiA9IGEgKyBiKTsgai0tOyBjW2pdID0gMCkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTXVsdGlwbHkuXHJcblxyXG4gICAgICAgIC8vIGkgaXMgaW5pdGlhbGx5IHhjLmxlbmd0aC5cclxuICAgICAgICBmb3IgKGkgPSBiOyBpLS07KSB7XHJcbiAgICAgICAgICAgIGIgPSAwO1xyXG5cclxuICAgICAgICAgICAgLy8gYSBpcyB5Yy5sZW5ndGguXHJcbiAgICAgICAgICAgIGZvciAoaiA9IGEgKyBpOyBqID4gaTspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDdXJyZW50IHN1bSBvZiBwcm9kdWN0cyBhdCB0aGlzIGRpZ2l0IHBvc2l0aW9uLCBwbHVzIGNhcnJ5LlxyXG4gICAgICAgICAgICAgICAgYiA9IGNbal0gKyB5Y1tpXSAqIHhjW2ogLSBpIC0gMV0gKyBiO1xyXG4gICAgICAgICAgICAgICAgY1tqLS1dID0gYiAlIDEwO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGNhcnJ5XHJcbiAgICAgICAgICAgICAgICBiID0gYiAvIDEwIHwgMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjW2pdID0gKGNbal0gKyBiKSAlIDEwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSW5jcmVtZW50IHJlc3VsdCBleHBvbmVudCBpZiB0aGVyZSBpcyBhIGZpbmFsIGNhcnJ5LlxyXG4gICAgICAgIGlmIChiKSB7XHJcbiAgICAgICAgICAgICsreS5lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIGFueSBsZWFkaW5nIHplcm8uXHJcbiAgICAgICAgaWYgKCFjWzBdKSB7XHJcbiAgICAgICAgICAgIGMuc2hpZnQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKGkgPSBjLmxlbmd0aDsgIWNbLS1pXTsgYy5wb3AoKSkge1xyXG4gICAgICAgIH1cclxuICAgICAgICB5LmMgPSBjO1xyXG5cclxuICAgICAgICByZXR1cm4geTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZy5cclxuICAgICAqIFJldHVybiBleHBvbmVudGlhbCBub3RhdGlvbiBpZiB0aGlzIEJpZyBoYXMgYSBwb3NpdGl2ZSBleHBvbmVudCBlcXVhbCB0b1xyXG4gICAgICogb3IgZ3JlYXRlciB0aGFuIEJpZy5FX1BPUywgb3IgYSBuZWdhdGl2ZSBleHBvbmVudCBlcXVhbCB0byBvciBsZXNzIHRoYW5cclxuICAgICAqIEJpZy5FX05FRy5cclxuICAgICAqL1xyXG4gICAgUC50b1N0cmluZyA9IFAudmFsdWVPZiA9IFAudG9KU09OID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgZSA9IHguZSxcclxuICAgICAgICAgICAgc3RyID0geC5jLmpvaW4oJycpLFxyXG4gICAgICAgICAgICBzdHJMID0gc3RyLmxlbmd0aDtcclxuXHJcbiAgICAgICAgLy8gRXhwb25lbnRpYWwgbm90YXRpb24/XHJcbiAgICAgICAgaWYgKGUgPD0gQmlnLkVfTkVHIHx8IGUgPj0gQmlnLkVfUE9TKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IHN0ci5jaGFyQXQoMCkgKyAoc3RyTCA+IDEgPyAnLicgKyBzdHIuc2xpY2UoMSkgOiAnJykgK1xyXG4gICAgICAgICAgICAgIChlIDwgMCA/ICdlJyA6ICdlKycpICsgZTtcclxuXHJcbiAgICAgICAgLy8gTmVnYXRpdmUgZXhwb25lbnQ/XHJcbiAgICAgICAgfSBlbHNlIGlmIChlIDwgMCkge1xyXG5cclxuICAgICAgICAgICAgLy8gUHJlcGVuZCB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yICg7ICsrZTsgc3RyID0gJzAnICsgc3RyKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3RyID0gJzAuJyArIHN0cjtcclxuXHJcbiAgICAgICAgLy8gUG9zaXRpdmUgZXhwb25lbnQ/XHJcbiAgICAgICAgfSBlbHNlIGlmIChlID4gMCkge1xyXG5cclxuICAgICAgICAgICAgaWYgKCsrZSA+IHN0ckwpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBcHBlbmQgemVyb3MuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGUgLT0gc3RyTDsgZS0tIDsgc3RyICs9ICcwJykge1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGUgPCBzdHJMKSB7XHJcbiAgICAgICAgICAgICAgICBzdHIgPSBzdHIuc2xpY2UoMCwgZSkgKyAnLicgKyBzdHIuc2xpY2UoZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRXhwb25lbnQgemVyby5cclxuICAgICAgICB9IGVsc2UgaWYgKHN0ckwgPiAxKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IHN0ci5jaGFyQXQoMCkgKyAnLicgKyBzdHIuc2xpY2UoMSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBdm9pZCAnLTAnXHJcbiAgICAgICAgcmV0dXJuIHgucyA8IDAgJiYgeC5jWzBdID8gJy0nICsgc3RyIDogc3RyO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAqIElmIHRvRXhwb25lbnRpYWwsIHRvRml4ZWQsIHRvUHJlY2lzaW9uIGFuZCBmb3JtYXQgYXJlIG5vdCByZXF1aXJlZCB0aGV5XHJcbiAgICAgKiBjYW4gc2FmZWx5IGJlIGNvbW1lbnRlZC1vdXQgb3IgZGVsZXRlZC4gTm8gcmVkdW5kYW50IGNvZGUgd2lsbCBiZSBsZWZ0LlxyXG4gICAgICogZm9ybWF0IGlzIHVzZWQgb25seSBieSB0b0V4cG9uZW50aWFsLCB0b0ZpeGVkIGFuZCB0b1ByZWNpc2lvbi5cclxuICAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAqL1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaW4gZXhwb25lbnRpYWxcclxuICAgICAqIG5vdGF0aW9uIHRvIGRwIGZpeGVkIGRlY2ltYWwgcGxhY2VzIGFuZCByb3VuZGVkLCBpZiBuZWNlc3NhcnksIHVzaW5nXHJcbiAgICAgKiBCaWcuUk0uXHJcbiAgICAgKlxyXG4gICAgICogW2RwXSB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKi9cclxuICAgIFAudG9FeHBvbmVudGlhbCA9IGZ1bmN0aW9uIChkcCkge1xyXG5cclxuICAgICAgICBpZiAoZHAgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBkcCA9IHRoaXMuYy5sZW5ndGggLSAxO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZHAgIT09IH5+ZHAgfHwgZHAgPCAwIHx8IGRwID4gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchdG9FeHAhJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZm9ybWF0KHRoaXMsIGRwLCAxKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpbiBub3JtYWwgbm90YXRpb25cclxuICAgICAqIHRvIGRwIGZpeGVkIGRlY2ltYWwgcGxhY2VzIGFuZCByb3VuZGVkLCBpZiBuZWNlc3NhcnksIHVzaW5nIEJpZy5STS5cclxuICAgICAqXHJcbiAgICAgKiBbZHBdIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqL1xyXG4gICAgUC50b0ZpeGVkID0gZnVuY3Rpb24gKGRwKSB7XHJcbiAgICAgICAgdmFyIHN0cixcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIG5lZyA9IEJpZy5FX05FRyxcclxuICAgICAgICAgICAgcG9zID0gQmlnLkVfUE9TO1xyXG5cclxuICAgICAgICAvLyBQcmV2ZW50IHRoZSBwb3NzaWJpbGl0eSBvZiBleHBvbmVudGlhbCBub3RhdGlvbi5cclxuICAgICAgICBCaWcuRV9ORUcgPSAtKEJpZy5FX1BPUyA9IDEgLyAwKTtcclxuXHJcbiAgICAgICAgaWYgKGRwID09IG51bGwpIHtcclxuICAgICAgICAgICAgc3RyID0geC50b1N0cmluZygpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZHAgPT09IH5+ZHAgJiYgZHAgPj0gMCAmJiBkcCA8PSBNQVhfRFApIHtcclxuICAgICAgICAgICAgc3RyID0gZm9ybWF0KHgsIHguZSArIGRwKTtcclxuXHJcbiAgICAgICAgICAgIC8vICgtMCkudG9GaXhlZCgpIGlzICcwJywgYnV0ICgtMC4xKS50b0ZpeGVkKCkgaXMgJy0wJy5cclxuICAgICAgICAgICAgLy8gKC0wKS50b0ZpeGVkKDEpIGlzICcwLjAnLCBidXQgKC0wLjAxKS50b0ZpeGVkKDEpIGlzICctMC4wJy5cclxuICAgICAgICAgICAgaWYgKHgucyA8IDAgJiYgeC5jWzBdICYmIHN0ci5pbmRleE9mKCctJykgPCAwKSB7XHJcbiAgICAgICAgLy9FLmcuIC0wLjUgaWYgcm91bmRlZCB0byAtMCB3aWxsIGNhdXNlIHRvU3RyaW5nIHRvIG9taXQgdGhlIG1pbnVzIHNpZ24uXHJcbiAgICAgICAgICAgICAgICBzdHIgPSAnLScgKyBzdHI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgQmlnLkVfTkVHID0gbmVnO1xyXG4gICAgICAgIEJpZy5FX1BPUyA9IHBvcztcclxuXHJcbiAgICAgICAgaWYgKCFzdHIpIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyF0b0ZpeCEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzdHI7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgcm91bmRlZCB0byBzZFxyXG4gICAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIEJpZy5STS4gVXNlIGV4cG9uZW50aWFsIG5vdGF0aW9uIGlmIHNkIGlzIGxlc3NcclxuICAgICAqIHRoYW4gdGhlIG51bWJlciBvZiBkaWdpdHMgbmVjZXNzYXJ5IHRvIHJlcHJlc2VudCB0aGUgaW50ZWdlciBwYXJ0IG9mIHRoZVxyXG4gICAgICogdmFsdWUgaW4gbm9ybWFsIG5vdGF0aW9uLlxyXG4gICAgICpcclxuICAgICAqIHNkIHtudW1iZXJ9IEludGVnZXIsIDEgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqL1xyXG4gICAgUC50b1ByZWNpc2lvbiA9IGZ1bmN0aW9uIChzZCkge1xyXG5cclxuICAgICAgICBpZiAoc2QgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b1N0cmluZygpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc2QgIT09IH5+c2QgfHwgc2QgPCAxIHx8IHNkID4gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchdG9QcmUhJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZm9ybWF0KHRoaXMsIHNkIC0gMSwgMik7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvLyBFeHBvcnRcclxuXHJcblxyXG4gICAgQmlnID0gYmlnRmFjdG9yeSgpO1xyXG5cclxuICAgIC8vQU1ELlxyXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgICAgIGRlZmluZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBCaWc7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgLy8gTm9kZSBhbmQgb3RoZXIgQ29tbW9uSlMtbGlrZSBlbnZpcm9ubWVudHMgdGhhdCBzdXBwb3J0IG1vZHVsZS5leHBvcnRzLlxyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xyXG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gQmlnO1xyXG5cclxuICAgIC8vQnJvd3Nlci5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZ2xvYmFsLkJpZyA9IEJpZztcclxuICAgIH1cclxufSkodGhpcyk7XHJcbiIsIjsoZnVuY3Rpb24gKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0LyoqXG5cdCAqIEBwcmVzZXJ2ZSBGYXN0Q2xpY2s6IHBvbHlmaWxsIHRvIHJlbW92ZSBjbGljayBkZWxheXMgb24gYnJvd3NlcnMgd2l0aCB0b3VjaCBVSXMuXG5cdCAqXG5cdCAqIEBjb2RpbmdzdGFuZGFyZCBmdGxhYnMtanN2MlxuXHQgKiBAY29weXJpZ2h0IFRoZSBGaW5hbmNpYWwgVGltZXMgTGltaXRlZCBbQWxsIFJpZ2h0cyBSZXNlcnZlZF1cblx0ICogQGxpY2Vuc2UgTUlUIExpY2Vuc2UgKHNlZSBMSUNFTlNFLnR4dClcblx0ICovXG5cblx0Lypqc2xpbnQgYnJvd3Nlcjp0cnVlLCBub2RlOnRydWUqL1xuXHQvKmdsb2JhbCBkZWZpbmUsIEV2ZW50LCBOb2RlKi9cblxuXG5cdC8qKlxuXHQgKiBJbnN0YW50aWF0ZSBmYXN0LWNsaWNraW5nIGxpc3RlbmVycyBvbiB0aGUgc3BlY2lmaWVkIGxheWVyLlxuXHQgKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQHBhcmFtIHtFbGVtZW50fSBsYXllciBUaGUgbGF5ZXIgdG8gbGlzdGVuIG9uXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gVGhlIG9wdGlvbnMgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHRzXG5cdCAqL1xuXHRmdW5jdGlvbiBGYXN0Q2xpY2sobGF5ZXIsIG9wdGlvbnMpIHtcblx0XHR2YXIgb2xkT25DbGljaztcblxuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0LyoqXG5cdFx0ICogV2hldGhlciBhIGNsaWNrIGlzIGN1cnJlbnRseSBiZWluZyB0cmFja2VkLlxuXHRcdCAqXG5cdFx0ICogQHR5cGUgYm9vbGVhblxuXHRcdCAqL1xuXHRcdHRoaXMudHJhY2tpbmdDbGljayA9IGZhbHNlO1xuXG5cblx0XHQvKipcblx0XHQgKiBUaW1lc3RhbXAgZm9yIHdoZW4gY2xpY2sgdHJhY2tpbmcgc3RhcnRlZC5cblx0XHQgKlxuXHRcdCAqIEB0eXBlIG51bWJlclxuXHRcdCAqL1xuXHRcdHRoaXMudHJhY2tpbmdDbGlja1N0YXJ0ID0gMDtcblxuXG5cdFx0LyoqXG5cdFx0ICogVGhlIGVsZW1lbnQgYmVpbmcgdHJhY2tlZCBmb3IgYSBjbGljay5cblx0XHQgKlxuXHRcdCAqIEB0eXBlIEV2ZW50VGFyZ2V0XG5cdFx0ICovXG5cdFx0dGhpcy50YXJnZXRFbGVtZW50ID0gbnVsbDtcblxuXG5cdFx0LyoqXG5cdFx0ICogWC1jb29yZGluYXRlIG9mIHRvdWNoIHN0YXJ0IGV2ZW50LlxuXHRcdCAqXG5cdFx0ICogQHR5cGUgbnVtYmVyXG5cdFx0ICovXG5cdFx0dGhpcy50b3VjaFN0YXJ0WCA9IDA7XG5cblxuXHRcdC8qKlxuXHRcdCAqIFktY29vcmRpbmF0ZSBvZiB0b3VjaCBzdGFydCBldmVudC5cblx0XHQgKlxuXHRcdCAqIEB0eXBlIG51bWJlclxuXHRcdCAqL1xuXHRcdHRoaXMudG91Y2hTdGFydFkgPSAwO1xuXG5cblx0XHQvKipcblx0XHQgKiBJRCBvZiB0aGUgbGFzdCB0b3VjaCwgcmV0cmlldmVkIGZyb20gVG91Y2guaWRlbnRpZmllci5cblx0XHQgKlxuXHRcdCAqIEB0eXBlIG51bWJlclxuXHRcdCAqL1xuXHRcdHRoaXMubGFzdFRvdWNoSWRlbnRpZmllciA9IDA7XG5cblxuXHRcdC8qKlxuXHRcdCAqIFRvdWNobW92ZSBib3VuZGFyeSwgYmV5b25kIHdoaWNoIGEgY2xpY2sgd2lsbCBiZSBjYW5jZWxsZWQuXG5cdFx0ICpcblx0XHQgKiBAdHlwZSBudW1iZXJcblx0XHQgKi9cblx0XHR0aGlzLnRvdWNoQm91bmRhcnkgPSBvcHRpb25zLnRvdWNoQm91bmRhcnkgfHwgMTA7XG5cblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBGYXN0Q2xpY2sgbGF5ZXIuXG5cdFx0ICpcblx0XHQgKiBAdHlwZSBFbGVtZW50XG5cdFx0ICovXG5cdFx0dGhpcy5sYXllciA9IGxheWVyO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIG1pbmltdW0gdGltZSBiZXR3ZWVuIHRhcCh0b3VjaHN0YXJ0IGFuZCB0b3VjaGVuZCkgZXZlbnRzXG5cdFx0ICpcblx0XHQgKiBAdHlwZSBudW1iZXJcblx0XHQgKi9cblx0XHR0aGlzLnRhcERlbGF5ID0gb3B0aW9ucy50YXBEZWxheSB8fCAyMDA7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgbWF4aW11bSB0aW1lIGZvciBhIHRhcFxuXHRcdCAqXG5cdFx0ICogQHR5cGUgbnVtYmVyXG5cdFx0ICovXG5cdFx0dGhpcy50YXBUaW1lb3V0ID0gb3B0aW9ucy50YXBUaW1lb3V0IHx8IDcwMDtcblxuXHRcdGlmIChGYXN0Q2xpY2subm90TmVlZGVkKGxheWVyKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIFNvbWUgb2xkIHZlcnNpb25zIG9mIEFuZHJvaWQgZG9uJ3QgaGF2ZSBGdW5jdGlvbi5wcm90b3R5cGUuYmluZFxuXHRcdGZ1bmN0aW9uIGJpbmQobWV0aG9kLCBjb250ZXh0KSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7IHJldHVybiBtZXRob2QuYXBwbHkoY29udGV4dCwgYXJndW1lbnRzKTsgfTtcblx0XHR9XG5cblxuXHRcdHZhciBtZXRob2RzID0gWydvbk1vdXNlJywgJ29uQ2xpY2snLCAnb25Ub3VjaFN0YXJ0JywgJ29uVG91Y2hNb3ZlJywgJ29uVG91Y2hFbmQnLCAnb25Ub3VjaENhbmNlbCddO1xuXHRcdHZhciBjb250ZXh0ID0gdGhpcztcblx0XHRmb3IgKHZhciBpID0gMCwgbCA9IG1ldGhvZHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdFx0XHRjb250ZXh0W21ldGhvZHNbaV1dID0gYmluZChjb250ZXh0W21ldGhvZHNbaV1dLCBjb250ZXh0KTtcblx0XHR9XG5cblx0XHQvLyBTZXQgdXAgZXZlbnQgaGFuZGxlcnMgYXMgcmVxdWlyZWRcblx0XHRpZiAoZGV2aWNlSXNBbmRyb2lkKSB7XG5cdFx0XHRsYXllci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCB0aGlzLm9uTW91c2UsIHRydWUpO1xuXHRcdFx0bGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5vbk1vdXNlLCB0cnVlKTtcblx0XHRcdGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uTW91c2UsIHRydWUpO1xuXHRcdH1cblxuXHRcdGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vbkNsaWNrLCB0cnVlKTtcblx0XHRsYXllci5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5vblRvdWNoU3RhcnQsIGZhbHNlKTtcblx0XHRsYXllci5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLm9uVG91Y2hNb3ZlLCBmYWxzZSk7XG5cdFx0bGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLm9uVG91Y2hFbmQsIGZhbHNlKTtcblx0XHRsYXllci5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIHRoaXMub25Ub3VjaENhbmNlbCwgZmFsc2UpO1xuXG5cdFx0Ly8gSGFjayBpcyByZXF1aXJlZCBmb3IgYnJvd3NlcnMgdGhhdCBkb24ndCBzdXBwb3J0IEV2ZW50I3N0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbiAoZS5nLiBBbmRyb2lkIDIpXG5cdFx0Ly8gd2hpY2ggaXMgaG93IEZhc3RDbGljayBub3JtYWxseSBzdG9wcyBjbGljayBldmVudHMgYnViYmxpbmcgdG8gY2FsbGJhY2tzIHJlZ2lzdGVyZWQgb24gdGhlIEZhc3RDbGlja1xuXHRcdC8vIGxheWVyIHdoZW4gdGhleSBhcmUgY2FuY2VsbGVkLlxuXHRcdGlmICghRXZlbnQucHJvdG90eXBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbikge1xuXHRcdFx0bGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGNhbGxiYWNrLCBjYXB0dXJlKSB7XG5cdFx0XHRcdHZhciBybXYgPSBOb2RlLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyO1xuXHRcdFx0XHRpZiAodHlwZSA9PT0gJ2NsaWNrJykge1xuXHRcdFx0XHRcdHJtdi5jYWxsKGxheWVyLCB0eXBlLCBjYWxsYmFjay5oaWphY2tlZCB8fCBjYWxsYmFjaywgY2FwdHVyZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cm12LmNhbGwobGF5ZXIsIHR5cGUsIGNhbGxiYWNrLCBjYXB0dXJlKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0bGF5ZXIuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGNhbGxiYWNrLCBjYXB0dXJlKSB7XG5cdFx0XHRcdHZhciBhZHYgPSBOb2RlLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyO1xuXHRcdFx0XHRpZiAodHlwZSA9PT0gJ2NsaWNrJykge1xuXHRcdFx0XHRcdGFkdi5jYWxsKGxheWVyLCB0eXBlLCBjYWxsYmFjay5oaWphY2tlZCB8fCAoY2FsbGJhY2suaGlqYWNrZWQgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRcdFx0aWYgKCFldmVudC5wcm9wYWdhdGlvblN0b3BwZWQpIHtcblx0XHRcdFx0XHRcdFx0Y2FsbGJhY2soZXZlbnQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pLCBjYXB0dXJlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRhZHYuY2FsbChsYXllciwgdHlwZSwgY2FsbGJhY2ssIGNhcHR1cmUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdC8vIElmIGEgaGFuZGxlciBpcyBhbHJlYWR5IGRlY2xhcmVkIGluIHRoZSBlbGVtZW50J3Mgb25jbGljayBhdHRyaWJ1dGUsIGl0IHdpbGwgYmUgZmlyZWQgYmVmb3JlXG5cdFx0Ly8gRmFzdENsaWNrJ3Mgb25DbGljayBoYW5kbGVyLiBGaXggdGhpcyBieSBwdWxsaW5nIG91dCB0aGUgdXNlci1kZWZpbmVkIGhhbmRsZXIgZnVuY3Rpb24gYW5kXG5cdFx0Ly8gYWRkaW5nIGl0IGFzIGxpc3RlbmVyLlxuXHRcdGlmICh0eXBlb2YgbGF5ZXIub25jbGljayA9PT0gJ2Z1bmN0aW9uJykge1xuXG5cdFx0XHQvLyBBbmRyb2lkIGJyb3dzZXIgb24gYXQgbGVhc3QgMy4yIHJlcXVpcmVzIGEgbmV3IHJlZmVyZW5jZSB0byB0aGUgZnVuY3Rpb24gaW4gbGF5ZXIub25jbGlja1xuXHRcdFx0Ly8gLSB0aGUgb2xkIG9uZSB3b24ndCB3b3JrIGlmIHBhc3NlZCB0byBhZGRFdmVudExpc3RlbmVyIGRpcmVjdGx5LlxuXHRcdFx0b2xkT25DbGljayA9IGxheWVyLm9uY2xpY2s7XG5cdFx0XHRsYXllci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdG9sZE9uQ2xpY2soZXZlbnQpO1xuXHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0bGF5ZXIub25jbGljayA9IG51bGw7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCogV2luZG93cyBQaG9uZSA4LjEgZmFrZXMgdXNlciBhZ2VudCBzdHJpbmcgdG8gbG9vayBsaWtlIEFuZHJvaWQgYW5kIGlQaG9uZS5cblx0KlxuXHQqIEB0eXBlIGJvb2xlYW5cblx0Ki9cblx0dmFyIGRldmljZUlzV2luZG93c1Bob25lID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKFwiV2luZG93cyBQaG9uZVwiKSA+PSAwO1xuXG5cdC8qKlxuXHQgKiBBbmRyb2lkIHJlcXVpcmVzIGV4Y2VwdGlvbnMuXG5cdCAqXG5cdCAqIEB0eXBlIGJvb2xlYW5cblx0ICovXG5cdHZhciBkZXZpY2VJc0FuZHJvaWQgPSBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ0FuZHJvaWQnKSA+IDAgJiYgIWRldmljZUlzV2luZG93c1Bob25lO1xuXG5cblx0LyoqXG5cdCAqIGlPUyByZXF1aXJlcyBleGNlcHRpb25zLlxuXHQgKlxuXHQgKiBAdHlwZSBib29sZWFuXG5cdCAqL1xuXHR2YXIgZGV2aWNlSXNJT1MgPSAvaVAoYWR8aG9uZXxvZCkvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgJiYgIWRldmljZUlzV2luZG93c1Bob25lO1xuXG5cblx0LyoqXG5cdCAqIGlPUyA0IHJlcXVpcmVzIGFuIGV4Y2VwdGlvbiBmb3Igc2VsZWN0IGVsZW1lbnRzLlxuXHQgKlxuXHQgKiBAdHlwZSBib29sZWFuXG5cdCAqL1xuXHR2YXIgZGV2aWNlSXNJT1M0ID0gZGV2aWNlSXNJT1MgJiYgKC9PUyA0X1xcZChfXFxkKT8vKS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuXG5cblx0LyoqXG5cdCAqIGlPUyA2LjAtNy4qIHJlcXVpcmVzIHRoZSB0YXJnZXQgZWxlbWVudCB0byBiZSBtYW51YWxseSBkZXJpdmVkXG5cdCAqXG5cdCAqIEB0eXBlIGJvb2xlYW5cblx0ICovXG5cdHZhciBkZXZpY2VJc0lPU1dpdGhCYWRUYXJnZXQgPSBkZXZpY2VJc0lPUyAmJiAoL09TIFs2LTddX1xcZC8pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG5cblx0LyoqXG5cdCAqIEJsYWNrQmVycnkgcmVxdWlyZXMgZXhjZXB0aW9ucy5cblx0ICpcblx0ICogQHR5cGUgYm9vbGVhblxuXHQgKi9cblx0dmFyIGRldmljZUlzQmxhY2tCZXJyeTEwID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdCQjEwJykgPiAwO1xuXG5cdC8qKlxuXHQgKiBEZXRlcm1pbmUgd2hldGhlciBhIGdpdmVuIGVsZW1lbnQgcmVxdWlyZXMgYSBuYXRpdmUgY2xpY2suXG5cdCAqXG5cdCAqIEBwYXJhbSB7RXZlbnRUYXJnZXR8RWxlbWVudH0gdGFyZ2V0IFRhcmdldCBET00gZWxlbWVudFxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyB0cnVlIGlmIHRoZSBlbGVtZW50IG5lZWRzIGEgbmF0aXZlIGNsaWNrXG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLm5lZWRzQ2xpY2sgPSBmdW5jdGlvbih0YXJnZXQpIHtcblx0XHRzd2l0Y2ggKHRhcmdldC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpKSB7XG5cblx0XHQvLyBEb24ndCBzZW5kIGEgc3ludGhldGljIGNsaWNrIHRvIGRpc2FibGVkIGlucHV0cyAoaXNzdWUgIzYyKVxuXHRcdGNhc2UgJ2J1dHRvbic6XG5cdFx0Y2FzZSAnc2VsZWN0Jzpcblx0XHRjYXNlICd0ZXh0YXJlYSc6XG5cdFx0XHRpZiAodGFyZ2V0LmRpc2FibGVkKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRicmVhaztcblx0XHRjYXNlICdpbnB1dCc6XG5cblx0XHRcdC8vIEZpbGUgaW5wdXRzIG5lZWQgcmVhbCBjbGlja3Mgb24gaU9TIDYgZHVlIHRvIGEgYnJvd3NlciBidWcgKGlzc3VlICM2OClcblx0XHRcdGlmICgoZGV2aWNlSXNJT1MgJiYgdGFyZ2V0LnR5cGUgPT09ICdmaWxlJykgfHwgdGFyZ2V0LmRpc2FibGVkKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRicmVhaztcblx0XHRjYXNlICdsYWJlbCc6XG5cdFx0Y2FzZSAnaWZyYW1lJzogLy8gaU9TOCBob21lc2NyZWVuIGFwcHMgY2FuIHByZXZlbnQgZXZlbnRzIGJ1YmJsaW5nIGludG8gZnJhbWVzXG5cdFx0Y2FzZSAndmlkZW8nOlxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuICgvXFxibmVlZHNjbGlja1xcYi8pLnRlc3QodGFyZ2V0LmNsYXNzTmFtZSk7XG5cdH07XG5cblxuXHQvKipcblx0ICogRGV0ZXJtaW5lIHdoZXRoZXIgYSBnaXZlbiBlbGVtZW50IHJlcXVpcmVzIGEgY2FsbCB0byBmb2N1cyB0byBzaW11bGF0ZSBjbGljayBpbnRvIGVsZW1lbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RXZlbnRUYXJnZXR8RWxlbWVudH0gdGFyZ2V0IFRhcmdldCBET00gZWxlbWVudFxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyB0cnVlIGlmIHRoZSBlbGVtZW50IHJlcXVpcmVzIGEgY2FsbCB0byBmb2N1cyB0byBzaW11bGF0ZSBuYXRpdmUgY2xpY2suXG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLm5lZWRzRm9jdXMgPSBmdW5jdGlvbih0YXJnZXQpIHtcblx0XHRzd2l0Y2ggKHRhcmdldC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0Y2FzZSAndGV4dGFyZWEnOlxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0Y2FzZSAnc2VsZWN0Jzpcblx0XHRcdHJldHVybiAhZGV2aWNlSXNBbmRyb2lkO1xuXHRcdGNhc2UgJ2lucHV0Jzpcblx0XHRcdHN3aXRjaCAodGFyZ2V0LnR5cGUpIHtcblx0XHRcdGNhc2UgJ2J1dHRvbic6XG5cdFx0XHRjYXNlICdjaGVja2JveCc6XG5cdFx0XHRjYXNlICdmaWxlJzpcblx0XHRcdGNhc2UgJ2ltYWdlJzpcblx0XHRcdGNhc2UgJ3JhZGlvJzpcblx0XHRcdGNhc2UgJ3N1Ym1pdCc6XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gTm8gcG9pbnQgaW4gYXR0ZW1wdGluZyB0byBmb2N1cyBkaXNhYmxlZCBpbnB1dHNcblx0XHRcdHJldHVybiAhdGFyZ2V0LmRpc2FibGVkICYmICF0YXJnZXQucmVhZE9ubHk7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiAoL1xcYm5lZWRzZm9jdXNcXGIvKS50ZXN0KHRhcmdldC5jbGFzc05hbWUpO1xuXHRcdH1cblx0fTtcblxuXG5cdC8qKlxuXHQgKiBTZW5kIGEgY2xpY2sgZXZlbnQgdG8gdGhlIHNwZWNpZmllZCBlbGVtZW50LlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fEVsZW1lbnR9IHRhcmdldEVsZW1lbnRcblx0ICogQHBhcmFtIHtFdmVudH0gZXZlbnRcblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUuc2VuZENsaWNrID0gZnVuY3Rpb24odGFyZ2V0RWxlbWVudCwgZXZlbnQpIHtcblx0XHR2YXIgY2xpY2tFdmVudCwgdG91Y2g7XG5cblx0XHQvLyBPbiBzb21lIEFuZHJvaWQgZGV2aWNlcyBhY3RpdmVFbGVtZW50IG5lZWRzIHRvIGJlIGJsdXJyZWQgb3RoZXJ3aXNlIHRoZSBzeW50aGV0aWMgY2xpY2sgd2lsbCBoYXZlIG5vIGVmZmVjdCAoIzI0KVxuXHRcdGlmIChkb2N1bWVudC5hY3RpdmVFbGVtZW50ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IHRhcmdldEVsZW1lbnQpIHtcblx0XHRcdGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpO1xuXHRcdH1cblxuXHRcdHRvdWNoID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF07XG5cblx0XHQvLyBTeW50aGVzaXNlIGEgY2xpY2sgZXZlbnQsIHdpdGggYW4gZXh0cmEgYXR0cmlidXRlIHNvIGl0IGNhbiBiZSB0cmFja2VkXG5cdFx0Y2xpY2tFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdNb3VzZUV2ZW50cycpO1xuXHRcdGNsaWNrRXZlbnQuaW5pdE1vdXNlRXZlbnQodGhpcy5kZXRlcm1pbmVFdmVudFR5cGUodGFyZ2V0RWxlbWVudCksIHRydWUsIHRydWUsIHdpbmRvdywgMSwgdG91Y2guc2NyZWVuWCwgdG91Y2guc2NyZWVuWSwgdG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIDAsIG51bGwpO1xuXHRcdGNsaWNrRXZlbnQuZm9yd2FyZGVkVG91Y2hFdmVudCA9IHRydWU7XG5cdFx0dGFyZ2V0RWxlbWVudC5kaXNwYXRjaEV2ZW50KGNsaWNrRXZlbnQpO1xuXHR9O1xuXG5cdEZhc3RDbGljay5wcm90b3R5cGUuZGV0ZXJtaW5lRXZlbnRUeXBlID0gZnVuY3Rpb24odGFyZ2V0RWxlbWVudCkge1xuXG5cdFx0Ly9Jc3N1ZSAjMTU5OiBBbmRyb2lkIENocm9tZSBTZWxlY3QgQm94IGRvZXMgbm90IG9wZW4gd2l0aCBhIHN5bnRoZXRpYyBjbGljayBldmVudFxuXHRcdGlmIChkZXZpY2VJc0FuZHJvaWQgJiYgdGFyZ2V0RWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdzZWxlY3QnKSB7XG5cdFx0XHRyZXR1cm4gJ21vdXNlZG93bic7XG5cdFx0fVxuXG5cdFx0cmV0dXJuICdjbGljayc7XG5cdH07XG5cblxuXHQvKipcblx0ICogQHBhcmFtIHtFdmVudFRhcmdldHxFbGVtZW50fSB0YXJnZXRFbGVtZW50XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLmZvY3VzID0gZnVuY3Rpb24odGFyZ2V0RWxlbWVudCkge1xuXHRcdHZhciBsZW5ndGg7XG5cblx0XHQvLyBJc3N1ZSAjMTYwOiBvbiBpT1MgNywgc29tZSBpbnB1dCBlbGVtZW50cyAoZS5nLiBkYXRlIGRhdGV0aW1lIG1vbnRoKSB0aHJvdyBhIHZhZ3VlIFR5cGVFcnJvciBvbiBzZXRTZWxlY3Rpb25SYW5nZS4gVGhlc2UgZWxlbWVudHMgZG9uJ3QgaGF2ZSBhbiBpbnRlZ2VyIHZhbHVlIGZvciB0aGUgc2VsZWN0aW9uU3RhcnQgYW5kIHNlbGVjdGlvbkVuZCBwcm9wZXJ0aWVzLCBidXQgdW5mb3J0dW5hdGVseSB0aGF0IGNhbid0IGJlIHVzZWQgZm9yIGRldGVjdGlvbiBiZWNhdXNlIGFjY2Vzc2luZyB0aGUgcHJvcGVydGllcyBhbHNvIHRocm93cyBhIFR5cGVFcnJvci4gSnVzdCBjaGVjayB0aGUgdHlwZSBpbnN0ZWFkLiBGaWxlZCBhcyBBcHBsZSBidWcgIzE1MTIyNzI0LlxuXHRcdGlmIChkZXZpY2VJc0lPUyAmJiB0YXJnZXRFbGVtZW50LnNldFNlbGVjdGlvblJhbmdlICYmIHRhcmdldEVsZW1lbnQudHlwZS5pbmRleE9mKCdkYXRlJykgIT09IDAgJiYgdGFyZ2V0RWxlbWVudC50eXBlICE9PSAndGltZScgJiYgdGFyZ2V0RWxlbWVudC50eXBlICE9PSAnbW9udGgnKSB7XG5cdFx0XHRsZW5ndGggPSB0YXJnZXRFbGVtZW50LnZhbHVlLmxlbmd0aDtcblx0XHRcdHRhcmdldEVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2UobGVuZ3RoLCBsZW5ndGgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0YXJnZXRFbGVtZW50LmZvY3VzKCk7XG5cdFx0fVxuXHR9O1xuXG5cblx0LyoqXG5cdCAqIENoZWNrIHdoZXRoZXIgdGhlIGdpdmVuIHRhcmdldCBlbGVtZW50IGlzIGEgY2hpbGQgb2YgYSBzY3JvbGxhYmxlIGxheWVyIGFuZCBpZiBzbywgc2V0IGEgZmxhZyBvbiBpdC5cblx0ICpcblx0ICogQHBhcmFtIHtFdmVudFRhcmdldHxFbGVtZW50fSB0YXJnZXRFbGVtZW50XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLnVwZGF0ZVNjcm9sbFBhcmVudCA9IGZ1bmN0aW9uKHRhcmdldEVsZW1lbnQpIHtcblx0XHR2YXIgc2Nyb2xsUGFyZW50LCBwYXJlbnRFbGVtZW50O1xuXG5cdFx0c2Nyb2xsUGFyZW50ID0gdGFyZ2V0RWxlbWVudC5mYXN0Q2xpY2tTY3JvbGxQYXJlbnQ7XG5cblx0XHQvLyBBdHRlbXB0IHRvIGRpc2NvdmVyIHdoZXRoZXIgdGhlIHRhcmdldCBlbGVtZW50IGlzIGNvbnRhaW5lZCB3aXRoaW4gYSBzY3JvbGxhYmxlIGxheWVyLiBSZS1jaGVjayBpZiB0aGVcblx0XHQvLyB0YXJnZXQgZWxlbWVudCB3YXMgbW92ZWQgdG8gYW5vdGhlciBwYXJlbnQuXG5cdFx0aWYgKCFzY3JvbGxQYXJlbnQgfHwgIXNjcm9sbFBhcmVudC5jb250YWlucyh0YXJnZXRFbGVtZW50KSkge1xuXHRcdFx0cGFyZW50RWxlbWVudCA9IHRhcmdldEVsZW1lbnQ7XG5cdFx0XHRkbyB7XG5cdFx0XHRcdGlmIChwYXJlbnRFbGVtZW50LnNjcm9sbEhlaWdodCA+IHBhcmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0KSB7XG5cdFx0XHRcdFx0c2Nyb2xsUGFyZW50ID0gcGFyZW50RWxlbWVudDtcblx0XHRcdFx0XHR0YXJnZXRFbGVtZW50LmZhc3RDbGlja1Njcm9sbFBhcmVudCA9IHBhcmVudEVsZW1lbnQ7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRwYXJlbnRFbGVtZW50ID0gcGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50O1xuXHRcdFx0fSB3aGlsZSAocGFyZW50RWxlbWVudCk7XG5cdFx0fVxuXG5cdFx0Ly8gQWx3YXlzIHVwZGF0ZSB0aGUgc2Nyb2xsIHRvcCB0cmFja2VyIGlmIHBvc3NpYmxlLlxuXHRcdGlmIChzY3JvbGxQYXJlbnQpIHtcblx0XHRcdHNjcm9sbFBhcmVudC5mYXN0Q2xpY2tMYXN0U2Nyb2xsVG9wID0gc2Nyb2xsUGFyZW50LnNjcm9sbFRvcDtcblx0XHR9XG5cdH07XG5cblxuXHQvKipcblx0ICogQHBhcmFtIHtFdmVudFRhcmdldH0gdGFyZ2V0RWxlbWVudFxuXHQgKiBAcmV0dXJucyB7RWxlbWVudHxFdmVudFRhcmdldH1cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUuZ2V0VGFyZ2V0RWxlbWVudEZyb21FdmVudFRhcmdldCA9IGZ1bmN0aW9uKGV2ZW50VGFyZ2V0KSB7XG5cblx0XHQvLyBPbiBzb21lIG9sZGVyIGJyb3dzZXJzIChub3RhYmx5IFNhZmFyaSBvbiBpT1MgNC4xIC0gc2VlIGlzc3VlICM1NikgdGhlIGV2ZW50IHRhcmdldCBtYXkgYmUgYSB0ZXh0IG5vZGUuXG5cdFx0aWYgKGV2ZW50VGFyZ2V0Lm5vZGVUeXBlID09PSBOb2RlLlRFWFRfTk9ERSkge1xuXHRcdFx0cmV0dXJuIGV2ZW50VGFyZ2V0LnBhcmVudE5vZGU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGV2ZW50VGFyZ2V0O1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIE9uIHRvdWNoIHN0YXJ0LCByZWNvcmQgdGhlIHBvc2l0aW9uIGFuZCBzY3JvbGwgb2Zmc2V0LlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUub25Ub3VjaFN0YXJ0ID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHR2YXIgdGFyZ2V0RWxlbWVudCwgdG91Y2gsIHNlbGVjdGlvbjtcblxuXHRcdC8vIElnbm9yZSBtdWx0aXBsZSB0b3VjaGVzLCBvdGhlcndpc2UgcGluY2gtdG8tem9vbSBpcyBwcmV2ZW50ZWQgaWYgYm90aCBmaW5nZXJzIGFyZSBvbiB0aGUgRmFzdENsaWNrIGVsZW1lbnQgKGlzc3VlICMxMTEpLlxuXHRcdGlmIChldmVudC50YXJnZXRUb3VjaGVzLmxlbmd0aCA+IDEpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHRhcmdldEVsZW1lbnQgPSB0aGlzLmdldFRhcmdldEVsZW1lbnRGcm9tRXZlbnRUYXJnZXQoZXZlbnQudGFyZ2V0KTtcblx0XHR0b3VjaCA9IGV2ZW50LnRhcmdldFRvdWNoZXNbMF07XG5cblx0XHRpZiAoZGV2aWNlSXNJT1MpIHtcblxuXHRcdFx0Ly8gT25seSB0cnVzdGVkIGV2ZW50cyB3aWxsIGRlc2VsZWN0IHRleHQgb24gaU9TIChpc3N1ZSAjNDkpXG5cdFx0XHRzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG5cdFx0XHRpZiAoc2VsZWN0aW9uLnJhbmdlQ291bnQgJiYgIXNlbGVjdGlvbi5pc0NvbGxhcHNlZCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCFkZXZpY2VJc0lPUzQpIHtcblxuXHRcdFx0XHQvLyBXZWlyZCB0aGluZ3MgaGFwcGVuIG9uIGlPUyB3aGVuIGFuIGFsZXJ0IG9yIGNvbmZpcm0gZGlhbG9nIGlzIG9wZW5lZCBmcm9tIGEgY2xpY2sgZXZlbnQgY2FsbGJhY2sgKGlzc3VlICMyMyk6XG5cdFx0XHRcdC8vIHdoZW4gdGhlIHVzZXIgbmV4dCB0YXBzIGFueXdoZXJlIGVsc2Ugb24gdGhlIHBhZ2UsIG5ldyB0b3VjaHN0YXJ0IGFuZCB0b3VjaGVuZCBldmVudHMgYXJlIGRpc3BhdGNoZWRcblx0XHRcdFx0Ly8gd2l0aCB0aGUgc2FtZSBpZGVudGlmaWVyIGFzIHRoZSB0b3VjaCBldmVudCB0aGF0IHByZXZpb3VzbHkgdHJpZ2dlcmVkIHRoZSBjbGljayB0aGF0IHRyaWdnZXJlZCB0aGUgYWxlcnQuXG5cdFx0XHRcdC8vIFNhZGx5LCB0aGVyZSBpcyBhbiBpc3N1ZSBvbiBpT1MgNCB0aGF0IGNhdXNlcyBzb21lIG5vcm1hbCB0b3VjaCBldmVudHMgdG8gaGF2ZSB0aGUgc2FtZSBpZGVudGlmaWVyIGFzIGFuXG5cdFx0XHRcdC8vIGltbWVkaWF0ZWx5IHByZWNlZWRpbmcgdG91Y2ggZXZlbnQgKGlzc3VlICM1MiksIHNvIHRoaXMgZml4IGlzIHVuYXZhaWxhYmxlIG9uIHRoYXQgcGxhdGZvcm0uXG5cdFx0XHRcdC8vIElzc3VlIDEyMDogdG91Y2guaWRlbnRpZmllciBpcyAwIHdoZW4gQ2hyb21lIGRldiB0b29scyAnRW11bGF0ZSB0b3VjaCBldmVudHMnIGlzIHNldCB3aXRoIGFuIGlPUyBkZXZpY2UgVUEgc3RyaW5nLFxuXHRcdFx0XHQvLyB3aGljaCBjYXVzZXMgYWxsIHRvdWNoIGV2ZW50cyB0byBiZSBpZ25vcmVkLiBBcyB0aGlzIGJsb2NrIG9ubHkgYXBwbGllcyB0byBpT1MsIGFuZCBpT1MgaWRlbnRpZmllcnMgYXJlIGFsd2F5cyBsb25nLFxuXHRcdFx0XHQvLyByYW5kb20gaW50ZWdlcnMsIGl0J3Mgc2FmZSB0byB0byBjb250aW51ZSBpZiB0aGUgaWRlbnRpZmllciBpcyAwIGhlcmUuXG5cdFx0XHRcdGlmICh0b3VjaC5pZGVudGlmaWVyICYmIHRvdWNoLmlkZW50aWZpZXIgPT09IHRoaXMubGFzdFRvdWNoSWRlbnRpZmllcikge1xuXHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhpcy5sYXN0VG91Y2hJZGVudGlmaWVyID0gdG91Y2guaWRlbnRpZmllcjtcblxuXHRcdFx0XHQvLyBJZiB0aGUgdGFyZ2V0IGVsZW1lbnQgaXMgYSBjaGlsZCBvZiBhIHNjcm9sbGFibGUgbGF5ZXIgKHVzaW5nIC13ZWJraXQtb3ZlcmZsb3ctc2Nyb2xsaW5nOiB0b3VjaCkgYW5kOlxuXHRcdFx0XHQvLyAxKSB0aGUgdXNlciBkb2VzIGEgZmxpbmcgc2Nyb2xsIG9uIHRoZSBzY3JvbGxhYmxlIGxheWVyXG5cdFx0XHRcdC8vIDIpIHRoZSB1c2VyIHN0b3BzIHRoZSBmbGluZyBzY3JvbGwgd2l0aCBhbm90aGVyIHRhcFxuXHRcdFx0XHQvLyB0aGVuIHRoZSBldmVudC50YXJnZXQgb2YgdGhlIGxhc3QgJ3RvdWNoZW5kJyBldmVudCB3aWxsIGJlIHRoZSBlbGVtZW50IHRoYXQgd2FzIHVuZGVyIHRoZSB1c2VyJ3MgZmluZ2VyXG5cdFx0XHRcdC8vIHdoZW4gdGhlIGZsaW5nIHNjcm9sbCB3YXMgc3RhcnRlZCwgY2F1c2luZyBGYXN0Q2xpY2sgdG8gc2VuZCBhIGNsaWNrIGV2ZW50IHRvIHRoYXQgbGF5ZXIgLSB1bmxlc3MgYSBjaGVja1xuXHRcdFx0XHQvLyBpcyBtYWRlIHRvIGVuc3VyZSB0aGF0IGEgcGFyZW50IGxheWVyIHdhcyBub3Qgc2Nyb2xsZWQgYmVmb3JlIHNlbmRpbmcgYSBzeW50aGV0aWMgY2xpY2sgKGlzc3VlICM0MikuXG5cdFx0XHRcdHRoaXMudXBkYXRlU2Nyb2xsUGFyZW50KHRhcmdldEVsZW1lbnQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMudHJhY2tpbmdDbGljayA9IHRydWU7XG5cdFx0dGhpcy50cmFja2luZ0NsaWNrU3RhcnQgPSBldmVudC50aW1lU3RhbXA7XG5cdFx0dGhpcy50YXJnZXRFbGVtZW50ID0gdGFyZ2V0RWxlbWVudDtcblxuXHRcdHRoaXMudG91Y2hTdGFydFggPSB0b3VjaC5wYWdlWDtcblx0XHR0aGlzLnRvdWNoU3RhcnRZID0gdG91Y2gucGFnZVk7XG5cblx0XHQvLyBQcmV2ZW50IHBoYW50b20gY2xpY2tzIG9uIGZhc3QgZG91YmxlLXRhcCAoaXNzdWUgIzM2KVxuXHRcdGlmICgoZXZlbnQudGltZVN0YW1wIC0gdGhpcy5sYXN0Q2xpY2tUaW1lKSA8IHRoaXMudGFwRGVsYXkpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH07XG5cblxuXHQvKipcblx0ICogQmFzZWQgb24gYSB0b3VjaG1vdmUgZXZlbnQgb2JqZWN0LCBjaGVjayB3aGV0aGVyIHRoZSB0b3VjaCBoYXMgbW92ZWQgcGFzdCBhIGJvdW5kYXJ5IHNpbmNlIGl0IHN0YXJ0ZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS50b3VjaEhhc01vdmVkID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHR2YXIgdG91Y2ggPSBldmVudC5jaGFuZ2VkVG91Y2hlc1swXSwgYm91bmRhcnkgPSB0aGlzLnRvdWNoQm91bmRhcnk7XG5cblx0XHRpZiAoTWF0aC5hYnModG91Y2gucGFnZVggLSB0aGlzLnRvdWNoU3RhcnRYKSA+IGJvdW5kYXJ5IHx8IE1hdGguYWJzKHRvdWNoLnBhZ2VZIC0gdGhpcy50b3VjaFN0YXJ0WSkgPiBib3VuZGFyeSkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIFVwZGF0ZSB0aGUgbGFzdCBwb3NpdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIHtFdmVudH0gZXZlbnRcblx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLm9uVG91Y2hNb3ZlID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRpZiAoIXRoaXMudHJhY2tpbmdDbGljaykge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgdGhlIHRvdWNoIGhhcyBtb3ZlZCwgY2FuY2VsIHRoZSBjbGljayB0cmFja2luZ1xuXHRcdGlmICh0aGlzLnRhcmdldEVsZW1lbnQgIT09IHRoaXMuZ2V0VGFyZ2V0RWxlbWVudEZyb21FdmVudFRhcmdldChldmVudC50YXJnZXQpIHx8IHRoaXMudG91Y2hIYXNNb3ZlZChldmVudCkpIHtcblx0XHRcdHRoaXMudHJhY2tpbmdDbGljayA9IGZhbHNlO1xuXHRcdFx0dGhpcy50YXJnZXRFbGVtZW50ID0gbnVsbDtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBBdHRlbXB0IHRvIGZpbmQgdGhlIGxhYmVsbGVkIGNvbnRyb2wgZm9yIHRoZSBnaXZlbiBsYWJlbCBlbGVtZW50LlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fEhUTUxMYWJlbEVsZW1lbnR9IGxhYmVsRWxlbWVudFxuXHQgKiBAcmV0dXJucyB7RWxlbWVudHxudWxsfVxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5maW5kQ29udHJvbCA9IGZ1bmN0aW9uKGxhYmVsRWxlbWVudCkge1xuXG5cdFx0Ly8gRmFzdCBwYXRoIGZvciBuZXdlciBicm93c2VycyBzdXBwb3J0aW5nIHRoZSBIVE1MNSBjb250cm9sIGF0dHJpYnV0ZVxuXHRcdGlmIChsYWJlbEVsZW1lbnQuY29udHJvbCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gbGFiZWxFbGVtZW50LmNvbnRyb2w7XG5cdFx0fVxuXG5cdFx0Ly8gQWxsIGJyb3dzZXJzIHVuZGVyIHRlc3QgdGhhdCBzdXBwb3J0IHRvdWNoIGV2ZW50cyBhbHNvIHN1cHBvcnQgdGhlIEhUTUw1IGh0bWxGb3IgYXR0cmlidXRlXG5cdFx0aWYgKGxhYmVsRWxlbWVudC5odG1sRm9yKSB7XG5cdFx0XHRyZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobGFiZWxFbGVtZW50Lmh0bWxGb3IpO1xuXHRcdH1cblxuXHRcdC8vIElmIG5vIGZvciBhdHRyaWJ1dGUgZXhpc3RzLCBhdHRlbXB0IHRvIHJldHJpZXZlIHRoZSBmaXJzdCBsYWJlbGxhYmxlIGRlc2NlbmRhbnQgZWxlbWVudFxuXHRcdC8vIHRoZSBsaXN0IG9mIHdoaWNoIGlzIGRlZmluZWQgaGVyZTogaHR0cDovL3d3dy53My5vcmcvVFIvaHRtbDUvZm9ybXMuaHRtbCNjYXRlZ29yeS1sYWJlbFxuXHRcdHJldHVybiBsYWJlbEVsZW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uLCBpbnB1dDpub3QoW3R5cGU9aGlkZGVuXSksIGtleWdlbiwgbWV0ZXIsIG91dHB1dCwgcHJvZ3Jlc3MsIHNlbGVjdCwgdGV4dGFyZWEnKTtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBPbiB0b3VjaCBlbmQsIGRldGVybWluZSB3aGV0aGVyIHRvIHNlbmQgYSBjbGljayBldmVudCBhdCBvbmNlLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUub25Ub3VjaEVuZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0dmFyIGZvckVsZW1lbnQsIHRyYWNraW5nQ2xpY2tTdGFydCwgdGFyZ2V0VGFnTmFtZSwgc2Nyb2xsUGFyZW50LCB0b3VjaCwgdGFyZ2V0RWxlbWVudCA9IHRoaXMudGFyZ2V0RWxlbWVudDtcblxuXHRcdGlmICghdGhpcy50cmFja2luZ0NsaWNrKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyBQcmV2ZW50IHBoYW50b20gY2xpY2tzIG9uIGZhc3QgZG91YmxlLXRhcCAoaXNzdWUgIzM2KVxuXHRcdGlmICgoZXZlbnQudGltZVN0YW1wIC0gdGhpcy5sYXN0Q2xpY2tUaW1lKSA8IHRoaXMudGFwRGVsYXkpIHtcblx0XHRcdHRoaXMuY2FuY2VsTmV4dENsaWNrID0gdHJ1ZTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdGlmICgoZXZlbnQudGltZVN0YW1wIC0gdGhpcy50cmFja2luZ0NsaWNrU3RhcnQpID4gdGhpcy50YXBUaW1lb3V0KSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyBSZXNldCB0byBwcmV2ZW50IHdyb25nIGNsaWNrIGNhbmNlbCBvbiBpbnB1dCAoaXNzdWUgIzE1NikuXG5cdFx0dGhpcy5jYW5jZWxOZXh0Q2xpY2sgPSBmYWxzZTtcblxuXHRcdHRoaXMubGFzdENsaWNrVGltZSA9IGV2ZW50LnRpbWVTdGFtcDtcblxuXHRcdHRyYWNraW5nQ2xpY2tTdGFydCA9IHRoaXMudHJhY2tpbmdDbGlja1N0YXJ0O1xuXHRcdHRoaXMudHJhY2tpbmdDbGljayA9IGZhbHNlO1xuXHRcdHRoaXMudHJhY2tpbmdDbGlja1N0YXJ0ID0gMDtcblxuXHRcdC8vIE9uIHNvbWUgaU9TIGRldmljZXMsIHRoZSB0YXJnZXRFbGVtZW50IHN1cHBsaWVkIHdpdGggdGhlIGV2ZW50IGlzIGludmFsaWQgaWYgdGhlIGxheWVyXG5cdFx0Ly8gaXMgcGVyZm9ybWluZyBhIHRyYW5zaXRpb24gb3Igc2Nyb2xsLCBhbmQgaGFzIHRvIGJlIHJlLWRldGVjdGVkIG1hbnVhbGx5LiBOb3RlIHRoYXRcblx0XHQvLyBmb3IgdGhpcyB0byBmdW5jdGlvbiBjb3JyZWN0bHksIGl0IG11c3QgYmUgY2FsbGVkICphZnRlciogdGhlIGV2ZW50IHRhcmdldCBpcyBjaGVja2VkIVxuXHRcdC8vIFNlZSBpc3N1ZSAjNTc7IGFsc28gZmlsZWQgYXMgcmRhcjovLzEzMDQ4NTg5IC5cblx0XHRpZiAoZGV2aWNlSXNJT1NXaXRoQmFkVGFyZ2V0KSB7XG5cdFx0XHR0b3VjaCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdO1xuXG5cdFx0XHQvLyBJbiBjZXJ0YWluIGNhc2VzIGFyZ3VtZW50cyBvZiBlbGVtZW50RnJvbVBvaW50IGNhbiBiZSBuZWdhdGl2ZSwgc28gcHJldmVudCBzZXR0aW5nIHRhcmdldEVsZW1lbnQgdG8gbnVsbFxuXHRcdFx0dGFyZ2V0RWxlbWVudCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQodG91Y2gucGFnZVggLSB3aW5kb3cucGFnZVhPZmZzZXQsIHRvdWNoLnBhZ2VZIC0gd2luZG93LnBhZ2VZT2Zmc2V0KSB8fCB0YXJnZXRFbGVtZW50O1xuXHRcdFx0dGFyZ2V0RWxlbWVudC5mYXN0Q2xpY2tTY3JvbGxQYXJlbnQgPSB0aGlzLnRhcmdldEVsZW1lbnQuZmFzdENsaWNrU2Nyb2xsUGFyZW50O1xuXHRcdH1cblxuXHRcdHRhcmdldFRhZ05hbWUgPSB0YXJnZXRFbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcblx0XHRpZiAodGFyZ2V0VGFnTmFtZSA9PT0gJ2xhYmVsJykge1xuXHRcdFx0Zm9yRWxlbWVudCA9IHRoaXMuZmluZENvbnRyb2wodGFyZ2V0RWxlbWVudCk7XG5cdFx0XHRpZiAoZm9yRWxlbWVudCkge1xuXHRcdFx0XHR0aGlzLmZvY3VzKHRhcmdldEVsZW1lbnQpO1xuXHRcdFx0XHRpZiAoZGV2aWNlSXNBbmRyb2lkKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGFyZ2V0RWxlbWVudCA9IGZvckVsZW1lbnQ7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh0aGlzLm5lZWRzRm9jdXModGFyZ2V0RWxlbWVudCkpIHtcblxuXHRcdFx0Ly8gQ2FzZSAxOiBJZiB0aGUgdG91Y2ggc3RhcnRlZCBhIHdoaWxlIGFnbyAoYmVzdCBndWVzcyBpcyAxMDBtcyBiYXNlZCBvbiB0ZXN0cyBmb3IgaXNzdWUgIzM2KSB0aGVuIGZvY3VzIHdpbGwgYmUgdHJpZ2dlcmVkIGFueXdheS4gUmV0dXJuIGVhcmx5IGFuZCB1bnNldCB0aGUgdGFyZ2V0IGVsZW1lbnQgcmVmZXJlbmNlIHNvIHRoYXQgdGhlIHN1YnNlcXVlbnQgY2xpY2sgd2lsbCBiZSBhbGxvd2VkIHRocm91Z2guXG5cdFx0XHQvLyBDYXNlIDI6IFdpdGhvdXQgdGhpcyBleGNlcHRpb24gZm9yIGlucHV0IGVsZW1lbnRzIHRhcHBlZCB3aGVuIHRoZSBkb2N1bWVudCBpcyBjb250YWluZWQgaW4gYW4gaWZyYW1lLCB0aGVuIGFueSBpbnB1dHRlZCB0ZXh0IHdvbid0IGJlIHZpc2libGUgZXZlbiB0aG91Z2ggdGhlIHZhbHVlIGF0dHJpYnV0ZSBpcyB1cGRhdGVkIGFzIHRoZSB1c2VyIHR5cGVzIChpc3N1ZSAjMzcpLlxuXHRcdFx0aWYgKChldmVudC50aW1lU3RhbXAgLSB0cmFja2luZ0NsaWNrU3RhcnQpID4gMTAwIHx8IChkZXZpY2VJc0lPUyAmJiB3aW5kb3cudG9wICE9PSB3aW5kb3cgJiYgdGFyZ2V0VGFnTmFtZSA9PT0gJ2lucHV0JykpIHtcblx0XHRcdFx0dGhpcy50YXJnZXRFbGVtZW50ID0gbnVsbDtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLmZvY3VzKHRhcmdldEVsZW1lbnQpO1xuXHRcdFx0dGhpcy5zZW5kQ2xpY2sodGFyZ2V0RWxlbWVudCwgZXZlbnQpO1xuXG5cdFx0XHQvLyBTZWxlY3QgZWxlbWVudHMgbmVlZCB0aGUgZXZlbnQgdG8gZ28gdGhyb3VnaCBvbiBpT1MgNCwgb3RoZXJ3aXNlIHRoZSBzZWxlY3RvciBtZW51IHdvbid0IG9wZW4uXG5cdFx0XHQvLyBBbHNvIHRoaXMgYnJlYWtzIG9wZW5pbmcgc2VsZWN0cyB3aGVuIFZvaWNlT3ZlciBpcyBhY3RpdmUgb24gaU9TNiwgaU9TNyAoYW5kIHBvc3NpYmx5IG90aGVycylcblx0XHRcdGlmICghZGV2aWNlSXNJT1MgfHwgdGFyZ2V0VGFnTmFtZSAhPT0gJ3NlbGVjdCcpIHtcblx0XHRcdFx0dGhpcy50YXJnZXRFbGVtZW50ID0gbnVsbDtcblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdGlmIChkZXZpY2VJc0lPUyAmJiAhZGV2aWNlSXNJT1M0KSB7XG5cblx0XHRcdC8vIERvbid0IHNlbmQgYSBzeW50aGV0aWMgY2xpY2sgZXZlbnQgaWYgdGhlIHRhcmdldCBlbGVtZW50IGlzIGNvbnRhaW5lZCB3aXRoaW4gYSBwYXJlbnQgbGF5ZXIgdGhhdCB3YXMgc2Nyb2xsZWRcblx0XHRcdC8vIGFuZCB0aGlzIHRhcCBpcyBiZWluZyB1c2VkIHRvIHN0b3AgdGhlIHNjcm9sbGluZyAodXN1YWxseSBpbml0aWF0ZWQgYnkgYSBmbGluZyAtIGlzc3VlICM0MikuXG5cdFx0XHRzY3JvbGxQYXJlbnQgPSB0YXJnZXRFbGVtZW50LmZhc3RDbGlja1Njcm9sbFBhcmVudDtcblx0XHRcdGlmIChzY3JvbGxQYXJlbnQgJiYgc2Nyb2xsUGFyZW50LmZhc3RDbGlja0xhc3RTY3JvbGxUb3AgIT09IHNjcm9sbFBhcmVudC5zY3JvbGxUb3ApIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gUHJldmVudCB0aGUgYWN0dWFsIGNsaWNrIGZyb20gZ29pbmcgdGhvdWdoIC0gdW5sZXNzIHRoZSB0YXJnZXQgbm9kZSBpcyBtYXJrZWQgYXMgcmVxdWlyaW5nXG5cdFx0Ly8gcmVhbCBjbGlja3Mgb3IgaWYgaXQgaXMgaW4gdGhlIHdoaXRlbGlzdCBpbiB3aGljaCBjYXNlIG9ubHkgbm9uLXByb2dyYW1tYXRpYyBjbGlja3MgYXJlIHBlcm1pdHRlZC5cblx0XHRpZiAoIXRoaXMubmVlZHNDbGljayh0YXJnZXRFbGVtZW50KSkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdHRoaXMuc2VuZENsaWNrKHRhcmdldEVsZW1lbnQsIGV2ZW50KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH07XG5cblxuXHQvKipcblx0ICogT24gdG91Y2ggY2FuY2VsLCBzdG9wIHRyYWNraW5nIHRoZSBjbGljay5cblx0ICpcblx0ICogQHJldHVybnMge3ZvaWR9XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLm9uVG91Y2hDYW5jZWwgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnRyYWNraW5nQ2xpY2sgPSBmYWxzZTtcblx0XHR0aGlzLnRhcmdldEVsZW1lbnQgPSBudWxsO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIERldGVybWluZSBtb3VzZSBldmVudHMgd2hpY2ggc2hvdWxkIGJlIHBlcm1pdHRlZC5cblx0ICpcblx0ICogQHBhcmFtIHtFdmVudH0gZXZlbnRcblx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLm9uTW91c2UgPSBmdW5jdGlvbihldmVudCkge1xuXG5cdFx0Ly8gSWYgYSB0YXJnZXQgZWxlbWVudCB3YXMgbmV2ZXIgc2V0IChiZWNhdXNlIGEgdG91Y2ggZXZlbnQgd2FzIG5ldmVyIGZpcmVkKSBhbGxvdyB0aGUgZXZlbnRcblx0XHRpZiAoIXRoaXMudGFyZ2V0RWxlbWVudCkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKGV2ZW50LmZvcndhcmRlZFRvdWNoRXZlbnQpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIFByb2dyYW1tYXRpY2FsbHkgZ2VuZXJhdGVkIGV2ZW50cyB0YXJnZXRpbmcgYSBzcGVjaWZpYyBlbGVtZW50IHNob3VsZCBiZSBwZXJtaXR0ZWRcblx0XHRpZiAoIWV2ZW50LmNhbmNlbGFibGUpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIERlcml2ZSBhbmQgY2hlY2sgdGhlIHRhcmdldCBlbGVtZW50IHRvIHNlZSB3aGV0aGVyIHRoZSBtb3VzZSBldmVudCBuZWVkcyB0byBiZSBwZXJtaXR0ZWQ7XG5cdFx0Ly8gdW5sZXNzIGV4cGxpY2l0bHkgZW5hYmxlZCwgcHJldmVudCBub24tdG91Y2ggY2xpY2sgZXZlbnRzIGZyb20gdHJpZ2dlcmluZyBhY3Rpb25zLFxuXHRcdC8vIHRvIHByZXZlbnQgZ2hvc3QvZG91YmxlY2xpY2tzLlxuXHRcdGlmICghdGhpcy5uZWVkc0NsaWNrKHRoaXMudGFyZ2V0RWxlbWVudCkgfHwgdGhpcy5jYW5jZWxOZXh0Q2xpY2spIHtcblxuXHRcdFx0Ly8gUHJldmVudCBhbnkgdXNlci1hZGRlZCBsaXN0ZW5lcnMgZGVjbGFyZWQgb24gRmFzdENsaWNrIGVsZW1lbnQgZnJvbSBiZWluZyBmaXJlZC5cblx0XHRcdGlmIChldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24pIHtcblx0XHRcdFx0ZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdC8vIFBhcnQgb2YgdGhlIGhhY2sgZm9yIGJyb3dzZXJzIHRoYXQgZG9uJ3Qgc3VwcG9ydCBFdmVudCNzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24gKGUuZy4gQW5kcm9pZCAyKVxuXHRcdFx0XHRldmVudC5wcm9wYWdhdGlvblN0b3BwZWQgPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBDYW5jZWwgdGhlIGV2ZW50XG5cdFx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBJZiB0aGUgbW91c2UgZXZlbnQgaXMgcGVybWl0dGVkLCByZXR1cm4gdHJ1ZSBmb3IgdGhlIGFjdGlvbiB0byBnbyB0aHJvdWdoLlxuXHRcdHJldHVybiB0cnVlO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIE9uIGFjdHVhbCBjbGlja3MsIGRldGVybWluZSB3aGV0aGVyIHRoaXMgaXMgYSB0b3VjaC1nZW5lcmF0ZWQgY2xpY2ssIGEgY2xpY2sgYWN0aW9uIG9jY3VycmluZ1xuXHQgKiBuYXR1cmFsbHkgYWZ0ZXIgYSBkZWxheSBhZnRlciBhIHRvdWNoICh3aGljaCBuZWVkcyB0byBiZSBjYW5jZWxsZWQgdG8gYXZvaWQgZHVwbGljYXRpb24pLCBvclxuXHQgKiBhbiBhY3R1YWwgY2xpY2sgd2hpY2ggc2hvdWxkIGJlIHBlcm1pdHRlZC5cblx0ICpcblx0ICogQHBhcmFtIHtFdmVudH0gZXZlbnRcblx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLm9uQ2xpY2sgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdHZhciBwZXJtaXR0ZWQ7XG5cblx0XHQvLyBJdCdzIHBvc3NpYmxlIGZvciBhbm90aGVyIEZhc3RDbGljay1saWtlIGxpYnJhcnkgZGVsaXZlcmVkIHdpdGggdGhpcmQtcGFydHkgY29kZSB0byBmaXJlIGEgY2xpY2sgZXZlbnQgYmVmb3JlIEZhc3RDbGljayBkb2VzIChpc3N1ZSAjNDQpLiBJbiB0aGF0IGNhc2UsIHNldCB0aGUgY2xpY2stdHJhY2tpbmcgZmxhZyBiYWNrIHRvIGZhbHNlIGFuZCByZXR1cm4gZWFybHkuIFRoaXMgd2lsbCBjYXVzZSBvblRvdWNoRW5kIHRvIHJldHVybiBlYXJseS5cblx0XHRpZiAodGhpcy50cmFja2luZ0NsaWNrKSB7XG5cdFx0XHR0aGlzLnRhcmdldEVsZW1lbnQgPSBudWxsO1xuXHRcdFx0dGhpcy50cmFja2luZ0NsaWNrID0gZmFsc2U7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyBWZXJ5IG9kZCBiZWhhdmlvdXIgb24gaU9TIChpc3N1ZSAjMTgpOiBpZiBhIHN1Ym1pdCBlbGVtZW50IGlzIHByZXNlbnQgaW5zaWRlIGEgZm9ybSBhbmQgdGhlIHVzZXIgaGl0cyBlbnRlciBpbiB0aGUgaU9TIHNpbXVsYXRvciBvciBjbGlja3MgdGhlIEdvIGJ1dHRvbiBvbiB0aGUgcG9wLXVwIE9TIGtleWJvYXJkIHRoZSBhIGtpbmQgb2YgJ2Zha2UnIGNsaWNrIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIHdpdGggdGhlIHN1Ym1pdC10eXBlIGlucHV0IGVsZW1lbnQgYXMgdGhlIHRhcmdldC5cblx0XHRpZiAoZXZlbnQudGFyZ2V0LnR5cGUgPT09ICdzdWJtaXQnICYmIGV2ZW50LmRldGFpbCA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0cGVybWl0dGVkID0gdGhpcy5vbk1vdXNlKGV2ZW50KTtcblxuXHRcdC8vIE9ubHkgdW5zZXQgdGFyZ2V0RWxlbWVudCBpZiB0aGUgY2xpY2sgaXMgbm90IHBlcm1pdHRlZC4gVGhpcyB3aWxsIGVuc3VyZSB0aGF0IHRoZSBjaGVjayBmb3IgIXRhcmdldEVsZW1lbnQgaW4gb25Nb3VzZSBmYWlscyBhbmQgdGhlIGJyb3dzZXIncyBjbGljayBkb2Vzbid0IGdvIHRocm91Z2guXG5cdFx0aWYgKCFwZXJtaXR0ZWQpIHtcblx0XHRcdHRoaXMudGFyZ2V0RWxlbWVudCA9IG51bGw7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgY2xpY2tzIGFyZSBwZXJtaXR0ZWQsIHJldHVybiB0cnVlIGZvciB0aGUgYWN0aW9uIHRvIGdvIHRocm91Z2guXG5cdFx0cmV0dXJuIHBlcm1pdHRlZDtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBSZW1vdmUgYWxsIEZhc3RDbGljaydzIGV2ZW50IGxpc3RlbmVycy5cblx0ICpcblx0ICogQHJldHVybnMge3ZvaWR9XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgbGF5ZXIgPSB0aGlzLmxheWVyO1xuXG5cdFx0aWYgKGRldmljZUlzQW5kcm9pZCkge1xuXHRcdFx0bGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgdGhpcy5vbk1vdXNlLCB0cnVlKTtcblx0XHRcdGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMub25Nb3VzZSwgdHJ1ZSk7XG5cdFx0XHRsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5vbk1vdXNlLCB0cnVlKTtcblx0XHR9XG5cblx0XHRsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMub25DbGljaywgdHJ1ZSk7XG5cdFx0bGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMub25Ub3VjaFN0YXJ0LCBmYWxzZSk7XG5cdFx0bGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5vblRvdWNoTW92ZSwgZmFsc2UpO1xuXHRcdGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5vblRvdWNoRW5kLCBmYWxzZSk7XG5cdFx0bGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCB0aGlzLm9uVG91Y2hDYW5jZWwsIGZhbHNlKTtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBDaGVjayB3aGV0aGVyIEZhc3RDbGljayBpcyBuZWVkZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RWxlbWVudH0gbGF5ZXIgVGhlIGxheWVyIHRvIGxpc3RlbiBvblxuXHQgKi9cblx0RmFzdENsaWNrLm5vdE5lZWRlZCA9IGZ1bmN0aW9uKGxheWVyKSB7XG5cdFx0dmFyIG1ldGFWaWV3cG9ydDtcblx0XHR2YXIgY2hyb21lVmVyc2lvbjtcblx0XHR2YXIgYmxhY2tiZXJyeVZlcnNpb247XG5cdFx0dmFyIGZpcmVmb3hWZXJzaW9uO1xuXG5cdFx0Ly8gRGV2aWNlcyB0aGF0IGRvbid0IHN1cHBvcnQgdG91Y2ggZG9uJ3QgbmVlZCBGYXN0Q2xpY2tcblx0XHRpZiAodHlwZW9mIHdpbmRvdy5vbnRvdWNoc3RhcnQgPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyBDaHJvbWUgdmVyc2lvbiAtIHplcm8gZm9yIG90aGVyIGJyb3dzZXJzXG5cdFx0Y2hyb21lVmVyc2lvbiA9ICsoL0Nocm9tZVxcLyhbMC05XSspLy5leGVjKG5hdmlnYXRvci51c2VyQWdlbnQpIHx8IFssMF0pWzFdO1xuXG5cdFx0aWYgKGNocm9tZVZlcnNpb24pIHtcblxuXHRcdFx0aWYgKGRldmljZUlzQW5kcm9pZCkge1xuXHRcdFx0XHRtZXRhVmlld3BvcnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdtZXRhW25hbWU9dmlld3BvcnRdJyk7XG5cblx0XHRcdFx0aWYgKG1ldGFWaWV3cG9ydCkge1xuXHRcdFx0XHRcdC8vIENocm9tZSBvbiBBbmRyb2lkIHdpdGggdXNlci1zY2FsYWJsZT1cIm5vXCIgZG9lc24ndCBuZWVkIEZhc3RDbGljayAoaXNzdWUgIzg5KVxuXHRcdFx0XHRcdGlmIChtZXRhVmlld3BvcnQuY29udGVudC5pbmRleE9mKCd1c2VyLXNjYWxhYmxlPW5vJykgIT09IC0xKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gQ2hyb21lIDMyIGFuZCBhYm92ZSB3aXRoIHdpZHRoPWRldmljZS13aWR0aCBvciBsZXNzIGRvbid0IG5lZWQgRmFzdENsaWNrXG5cdFx0XHRcdFx0aWYgKGNocm9tZVZlcnNpb24gPiAzMSAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsV2lkdGggPD0gd2luZG93Lm91dGVyV2lkdGgpIHtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHQvLyBDaHJvbWUgZGVza3RvcCBkb2Vzbid0IG5lZWQgRmFzdENsaWNrIChpc3N1ZSAjMTUpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoZGV2aWNlSXNCbGFja0JlcnJ5MTApIHtcblx0XHRcdGJsYWNrYmVycnlWZXJzaW9uID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvVmVyc2lvblxcLyhbMC05XSopXFwuKFswLTldKikvKTtcblxuXHRcdFx0Ly8gQmxhY2tCZXJyeSAxMC4zKyBkb2VzIG5vdCByZXF1aXJlIEZhc3RjbGljayBsaWJyYXJ5LlxuXHRcdFx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL2Z0bGFicy9mYXN0Y2xpY2svaXNzdWVzLzI1MVxuXHRcdFx0aWYgKGJsYWNrYmVycnlWZXJzaW9uWzFdID49IDEwICYmIGJsYWNrYmVycnlWZXJzaW9uWzJdID49IDMpIHtcblx0XHRcdFx0bWV0YVZpZXdwb3J0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbWV0YVtuYW1lPXZpZXdwb3J0XScpO1xuXG5cdFx0XHRcdGlmIChtZXRhVmlld3BvcnQpIHtcblx0XHRcdFx0XHQvLyB1c2VyLXNjYWxhYmxlPW5vIGVsaW1pbmF0ZXMgY2xpY2sgZGVsYXkuXG5cdFx0XHRcdFx0aWYgKG1ldGFWaWV3cG9ydC5jb250ZW50LmluZGV4T2YoJ3VzZXItc2NhbGFibGU9bm8nKSAhPT0gLTEpIHtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyB3aWR0aD1kZXZpY2Utd2lkdGggKG9yIGxlc3MgdGhhbiBkZXZpY2Utd2lkdGgpIGVsaW1pbmF0ZXMgY2xpY2sgZGVsYXkuXG5cdFx0XHRcdFx0aWYgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxXaWR0aCA8PSB3aW5kb3cub3V0ZXJXaWR0aCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gSUUxMCB3aXRoIC1tcy10b3VjaC1hY3Rpb246IG5vbmUgb3IgbWFuaXB1bGF0aW9uLCB3aGljaCBkaXNhYmxlcyBkb3VibGUtdGFwLXRvLXpvb20gKGlzc3VlICM5Nylcblx0XHRpZiAobGF5ZXIuc3R5bGUubXNUb3VjaEFjdGlvbiA9PT0gJ25vbmUnIHx8IGxheWVyLnN0eWxlLnRvdWNoQWN0aW9uID09PSAnbWFuaXB1bGF0aW9uJykge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gRmlyZWZveCB2ZXJzaW9uIC0gemVybyBmb3Igb3RoZXIgYnJvd3NlcnNcblx0XHRmaXJlZm94VmVyc2lvbiA9ICsoL0ZpcmVmb3hcXC8oWzAtOV0rKS8uZXhlYyhuYXZpZ2F0b3IudXNlckFnZW50KSB8fCBbLDBdKVsxXTtcblxuXHRcdGlmIChmaXJlZm94VmVyc2lvbiA+PSAyNykge1xuXHRcdFx0Ly8gRmlyZWZveCAyNysgZG9lcyBub3QgaGF2ZSB0YXAgZGVsYXkgaWYgdGhlIGNvbnRlbnQgaXMgbm90IHpvb21hYmxlIC0gaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9OTIyODk2XG5cblx0XHRcdG1ldGFWaWV3cG9ydCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ21ldGFbbmFtZT12aWV3cG9ydF0nKTtcblx0XHRcdGlmIChtZXRhVmlld3BvcnQgJiYgKG1ldGFWaWV3cG9ydC5jb250ZW50LmluZGV4T2YoJ3VzZXItc2NhbGFibGU9bm8nKSAhPT0gLTEgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFdpZHRoIDw9IHdpbmRvdy5vdXRlcldpZHRoKSkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBJRTExOiBwcmVmaXhlZCAtbXMtdG91Y2gtYWN0aW9uIGlzIG5vIGxvbmdlciBzdXBwb3J0ZWQgYW5kIGl0J3MgcmVjb21lbmRlZCB0byB1c2Ugbm9uLXByZWZpeGVkIHZlcnNpb25cblx0XHQvLyBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvd2luZG93cy9hcHBzL0hoNzY3MzEzLmFzcHhcblx0XHRpZiAobGF5ZXIuc3R5bGUudG91Y2hBY3Rpb24gPT09ICdub25lJyB8fCBsYXllci5zdHlsZS50b3VjaEFjdGlvbiA9PT0gJ21hbmlwdWxhdGlvbicpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBGYWN0b3J5IG1ldGhvZCBmb3IgY3JlYXRpbmcgYSBGYXN0Q2xpY2sgb2JqZWN0XG5cdCAqXG5cdCAqIEBwYXJhbSB7RWxlbWVudH0gbGF5ZXIgVGhlIGxheWVyIHRvIGxpc3RlbiBvblxuXHQgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIFRoZSBvcHRpb25zIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0c1xuXHQgKi9cblx0RmFzdENsaWNrLmF0dGFjaCA9IGZ1bmN0aW9uKGxheWVyLCBvcHRpb25zKSB7XG5cdFx0cmV0dXJuIG5ldyBGYXN0Q2xpY2sobGF5ZXIsIG9wdGlvbnMpO1xuXHR9O1xuXG5cblx0aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGRlZmluZS5hbWQgPT09ICdvYmplY3QnICYmIGRlZmluZS5hbWQpIHtcblxuXHRcdC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cblx0XHRkZWZpbmUoZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gRmFzdENsaWNrO1xuXHRcdH0pO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBGYXN0Q2xpY2suYXR0YWNoO1xuXHRcdG1vZHVsZS5leHBvcnRzLkZhc3RDbGljayA9IEZhc3RDbGljaztcblx0fSBlbHNlIHtcblx0XHR3aW5kb3cuRmFzdENsaWNrID0gRmFzdENsaWNrO1xuXHR9XG59KCkpO1xuIiwidmFyIFZOb2RlID0gcmVxdWlyZSgnLi92bm9kZScpO1xudmFyIGlzID0gcmVxdWlyZSgnLi9pcycpO1xuXG5mdW5jdGlvbiBhZGROUyhkYXRhLCBjaGlsZHJlbiwgc2VsKSB7XG4gIGRhdGEubnMgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnO1xuXG4gIGlmIChzZWwgIT09ICdmb3JlaWduT2JqZWN0JyAmJiBjaGlsZHJlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgYWRkTlMoY2hpbGRyZW5baV0uZGF0YSwgY2hpbGRyZW5baV0uY2hpbGRyZW4sIGNoaWxkcmVuW2ldLnNlbCk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaChzZWwsIGIsIGMpIHtcbiAgdmFyIGRhdGEgPSB7fSwgY2hpbGRyZW4sIHRleHQsIGk7XG4gIGlmIChjICE9PSB1bmRlZmluZWQpIHtcbiAgICBkYXRhID0gYjtcbiAgICBpZiAoaXMuYXJyYXkoYykpIHsgY2hpbGRyZW4gPSBjOyB9XG4gICAgZWxzZSBpZiAoaXMucHJpbWl0aXZlKGMpKSB7IHRleHQgPSBjOyB9XG4gIH0gZWxzZSBpZiAoYiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKGlzLmFycmF5KGIpKSB7IGNoaWxkcmVuID0gYjsgfVxuICAgIGVsc2UgaWYgKGlzLnByaW1pdGl2ZShiKSkgeyB0ZXh0ID0gYjsgfVxuICAgIGVsc2UgeyBkYXRhID0gYjsgfVxuICB9XG4gIGlmIChpcy5hcnJheShjaGlsZHJlbikpIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmIChpcy5wcmltaXRpdmUoY2hpbGRyZW5baV0pKSBjaGlsZHJlbltpXSA9IFZOb2RlKHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGNoaWxkcmVuW2ldKTtcbiAgICB9XG4gIH1cbiAgaWYgKHNlbFswXSA9PT0gJ3MnICYmIHNlbFsxXSA9PT0gJ3YnICYmIHNlbFsyXSA9PT0gJ2cnKSB7XG4gICAgYWRkTlMoZGF0YSwgY2hpbGRyZW4sIHNlbCk7XG4gIH1cbiAgcmV0dXJuIFZOb2RlKHNlbCwgZGF0YSwgY2hpbGRyZW4sIHRleHQsIHVuZGVmaW5lZCk7XG59O1xuIiwiZnVuY3Rpb24gY3JlYXRlRWxlbWVudCh0YWdOYW1lKXtcbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnTmFtZSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2VVUkksIHF1YWxpZmllZE5hbWUpe1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSwgcXVhbGlmaWVkTmFtZSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVRleHROb2RlKHRleHQpe1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dCk7XG59XG5cblxuZnVuY3Rpb24gaW5zZXJ0QmVmb3JlKHBhcmVudE5vZGUsIG5ld05vZGUsIHJlZmVyZW5jZU5vZGUpe1xuICBwYXJlbnROb2RlLmluc2VydEJlZm9yZShuZXdOb2RlLCByZWZlcmVuY2VOb2RlKTtcbn1cblxuXG5mdW5jdGlvbiByZW1vdmVDaGlsZChub2RlLCBjaGlsZCl7XG4gIG5vZGUucmVtb3ZlQ2hpbGQoY2hpbGQpO1xufVxuXG5mdW5jdGlvbiBhcHBlbmRDaGlsZChub2RlLCBjaGlsZCl7XG4gIG5vZGUuYXBwZW5kQ2hpbGQoY2hpbGQpO1xufVxuXG5mdW5jdGlvbiBwYXJlbnROb2RlKG5vZGUpe1xuICByZXR1cm4gbm9kZS5wYXJlbnRFbGVtZW50O1xufVxuXG5mdW5jdGlvbiBuZXh0U2libGluZyhub2RlKXtcbiAgcmV0dXJuIG5vZGUubmV4dFNpYmxpbmc7XG59XG5cbmZ1bmN0aW9uIHRhZ05hbWUobm9kZSl7XG4gIHJldHVybiBub2RlLnRhZ05hbWU7XG59XG5cbmZ1bmN0aW9uIHNldFRleHRDb250ZW50KG5vZGUsIHRleHQpe1xuICBub2RlLnRleHRDb250ZW50ID0gdGV4dDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZUVsZW1lbnQ6IGNyZWF0ZUVsZW1lbnQsXG4gIGNyZWF0ZUVsZW1lbnROUzogY3JlYXRlRWxlbWVudE5TLFxuICBjcmVhdGVUZXh0Tm9kZTogY3JlYXRlVGV4dE5vZGUsXG4gIGFwcGVuZENoaWxkOiBhcHBlbmRDaGlsZCxcbiAgcmVtb3ZlQ2hpbGQ6IHJlbW92ZUNoaWxkLFxuICBpbnNlcnRCZWZvcmU6IGluc2VydEJlZm9yZSxcbiAgcGFyZW50Tm9kZTogcGFyZW50Tm9kZSxcbiAgbmV4dFNpYmxpbmc6IG5leHRTaWJsaW5nLFxuICB0YWdOYW1lOiB0YWdOYW1lLFxuICBzZXRUZXh0Q29udGVudDogc2V0VGV4dENvbnRlbnRcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgYXJyYXk6IEFycmF5LmlzQXJyYXksXG4gIHByaW1pdGl2ZTogZnVuY3Rpb24ocykgeyByZXR1cm4gdHlwZW9mIHMgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBzID09PSAnbnVtYmVyJzsgfSxcbn07XG4iLCJ2YXIgTmFtZXNwYWNlVVJJcyA9IHtcbiAgXCJ4bGlua1wiOiBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIlxufTtcblxudmFyIGJvb2xlYW5BdHRycyA9IFtcImFsbG93ZnVsbHNjcmVlblwiLCBcImFzeW5jXCIsIFwiYXV0b2ZvY3VzXCIsIFwiYXV0b3BsYXlcIiwgXCJjaGVja2VkXCIsIFwiY29tcGFjdFwiLCBcImNvbnRyb2xzXCIsIFwiZGVjbGFyZVwiLFxuICAgICAgICAgICAgICAgIFwiZGVmYXVsdFwiLCBcImRlZmF1bHRjaGVja2VkXCIsIFwiZGVmYXVsdG11dGVkXCIsIFwiZGVmYXVsdHNlbGVjdGVkXCIsIFwiZGVmZXJcIiwgXCJkaXNhYmxlZFwiLCBcImRyYWdnYWJsZVwiLFxuICAgICAgICAgICAgICAgIFwiZW5hYmxlZFwiLCBcImZvcm1ub3ZhbGlkYXRlXCIsIFwiaGlkZGVuXCIsIFwiaW5kZXRlcm1pbmF0ZVwiLCBcImluZXJ0XCIsIFwiaXNtYXBcIiwgXCJpdGVtc2NvcGVcIiwgXCJsb29wXCIsIFwibXVsdGlwbGVcIixcbiAgICAgICAgICAgICAgICBcIm11dGVkXCIsIFwibm9ocmVmXCIsIFwibm9yZXNpemVcIiwgXCJub3NoYWRlXCIsIFwibm92YWxpZGF0ZVwiLCBcIm5vd3JhcFwiLCBcIm9wZW5cIiwgXCJwYXVzZW9uZXhpdFwiLCBcInJlYWRvbmx5XCIsXG4gICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiLCBcInJldmVyc2VkXCIsIFwic2NvcGVkXCIsIFwic2VhbWxlc3NcIiwgXCJzZWxlY3RlZFwiLCBcInNvcnRhYmxlXCIsIFwic3BlbGxjaGVja1wiLCBcInRyYW5zbGF0ZVwiLFxuICAgICAgICAgICAgICAgIFwidHJ1ZXNwZWVkXCIsIFwidHlwZW11c3RtYXRjaFwiLCBcInZpc2libGVcIl07XG5cbnZhciBib29sZWFuQXR0cnNEaWN0ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbmZvcih2YXIgaT0wLCBsZW4gPSBib29sZWFuQXR0cnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgYm9vbGVhbkF0dHJzRGljdFtib29sZWFuQXR0cnNbaV1dID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlQXR0cnMob2xkVm5vZGUsIHZub2RlKSB7XG4gIHZhciBrZXksIGN1ciwgb2xkLCBlbG0gPSB2bm9kZS5lbG0sXG4gICAgICBvbGRBdHRycyA9IG9sZFZub2RlLmRhdGEuYXR0cnMsIGF0dHJzID0gdm5vZGUuZGF0YS5hdHRycywgbmFtZXNwYWNlU3BsaXQ7XG5cbiAgaWYgKCFvbGRBdHRycyAmJiAhYXR0cnMpIHJldHVybjtcbiAgb2xkQXR0cnMgPSBvbGRBdHRycyB8fCB7fTtcbiAgYXR0cnMgPSBhdHRycyB8fCB7fTtcblxuICAvLyB1cGRhdGUgbW9kaWZpZWQgYXR0cmlidXRlcywgYWRkIG5ldyBhdHRyaWJ1dGVzXG4gIGZvciAoa2V5IGluIGF0dHJzKSB7XG4gICAgY3VyID0gYXR0cnNba2V5XTtcbiAgICBvbGQgPSBvbGRBdHRyc1trZXldO1xuICAgIGlmIChvbGQgIT09IGN1cikge1xuICAgICAgaWYoIWN1ciAmJiBib29sZWFuQXR0cnNEaWN0W2tleV0pXG4gICAgICAgIGVsbS5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgICAgIGVsc2Uge1xuICAgICAgICBuYW1lc3BhY2VTcGxpdCA9IGtleS5zcGxpdChcIjpcIik7XG4gICAgICAgIGlmKG5hbWVzcGFjZVNwbGl0Lmxlbmd0aCA+IDEgJiYgTmFtZXNwYWNlVVJJcy5oYXNPd25Qcm9wZXJ0eShuYW1lc3BhY2VTcGxpdFswXSkpXG4gICAgICAgICAgZWxtLnNldEF0dHJpYnV0ZU5TKE5hbWVzcGFjZVVSSXNbbmFtZXNwYWNlU3BsaXRbMF1dLCBrZXksIGN1cik7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKGtleSwgY3VyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLy9yZW1vdmUgcmVtb3ZlZCBhdHRyaWJ1dGVzXG4gIC8vIHVzZSBgaW5gIG9wZXJhdG9yIHNpbmNlIHRoZSBwcmV2aW91cyBgZm9yYCBpdGVyYXRpb24gdXNlcyBpdCAoLmkuZS4gYWRkIGV2ZW4gYXR0cmlidXRlcyB3aXRoIHVuZGVmaW5lZCB2YWx1ZSlcbiAgLy8gdGhlIG90aGVyIG9wdGlvbiBpcyB0byByZW1vdmUgYWxsIGF0dHJpYnV0ZXMgd2l0aCB2YWx1ZSA9PSB1bmRlZmluZWRcbiAgZm9yIChrZXkgaW4gb2xkQXR0cnMpIHtcbiAgICBpZiAoIShrZXkgaW4gYXR0cnMpKSB7XG4gICAgICBlbG0ucmVtb3ZlQXR0cmlidXRlKGtleSk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge2NyZWF0ZTogdXBkYXRlQXR0cnMsIHVwZGF0ZTogdXBkYXRlQXR0cnN9O1xuIiwiZnVuY3Rpb24gdXBkYXRlQ2xhc3Mob2xkVm5vZGUsIHZub2RlKSB7XG4gIHZhciBjdXIsIG5hbWUsIGVsbSA9IHZub2RlLmVsbSxcbiAgICAgIG9sZENsYXNzID0gb2xkVm5vZGUuZGF0YS5jbGFzcyxcbiAgICAgIGtsYXNzID0gdm5vZGUuZGF0YS5jbGFzcztcblxuICBpZiAoIW9sZENsYXNzICYmICFrbGFzcykgcmV0dXJuO1xuICBvbGRDbGFzcyA9IG9sZENsYXNzIHx8IHt9O1xuICBrbGFzcyA9IGtsYXNzIHx8IHt9O1xuXG4gIGZvciAobmFtZSBpbiBvbGRDbGFzcykge1xuICAgIGlmICgha2xhc3NbbmFtZV0pIHtcbiAgICAgIGVsbS5jbGFzc0xpc3QucmVtb3ZlKG5hbWUpO1xuICAgIH1cbiAgfVxuICBmb3IgKG5hbWUgaW4ga2xhc3MpIHtcbiAgICBjdXIgPSBrbGFzc1tuYW1lXTtcbiAgICBpZiAoY3VyICE9PSBvbGRDbGFzc1tuYW1lXSkge1xuICAgICAgZWxtLmNsYXNzTGlzdFtjdXIgPyAnYWRkJyA6ICdyZW1vdmUnXShuYW1lKTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7Y3JlYXRlOiB1cGRhdGVDbGFzcywgdXBkYXRlOiB1cGRhdGVDbGFzc307XG4iLCJmdW5jdGlvbiBpbnZva2VIYW5kbGVyKGhhbmRsZXIsIHZub2RlLCBldmVudCkge1xuICBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIC8vIGNhbGwgZnVuY3Rpb24gaGFuZGxlclxuICAgIGhhbmRsZXIuY2FsbCh2bm9kZSwgZXZlbnQsIHZub2RlKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJvYmplY3RcIikge1xuICAgIC8vIGNhbGwgaGFuZGxlciB3aXRoIGFyZ3VtZW50c1xuICAgIGlmICh0eXBlb2YgaGFuZGxlclswXSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAvLyBzcGVjaWFsIGNhc2UgZm9yIHNpbmdsZSBhcmd1bWVudCBmb3IgcGVyZm9ybWFuY2VcbiAgICAgIGlmIChoYW5kbGVyLmxlbmd0aCA9PT0gMikge1xuICAgICAgICBoYW5kbGVyWzBdLmNhbGwodm5vZGUsIGhhbmRsZXJbMV0sIGV2ZW50LCB2bm9kZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgYXJncyA9IGhhbmRsZXIuc2xpY2UoMSk7XG4gICAgICAgIGFyZ3MucHVzaChldmVudCk7XG4gICAgICAgIGFyZ3MucHVzaCh2bm9kZSk7XG4gICAgICAgIGhhbmRsZXJbMF0uYXBwbHkodm5vZGUsIGFyZ3MpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjYWxsIG11bHRpcGxlIGhhbmRsZXJzXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhhbmRsZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaW52b2tlSGFuZGxlcihoYW5kbGVyW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlRXZlbnQoZXZlbnQsIHZub2RlKSB7XG4gIHZhciBuYW1lID0gZXZlbnQudHlwZSxcbiAgICAgIG9uID0gdm5vZGUuZGF0YS5vbjtcblxuICAvLyBjYWxsIGV2ZW50IGhhbmRsZXIocykgaWYgZXhpc3RzXG4gIGlmIChvbiAmJiBvbltuYW1lXSkge1xuICAgIGludm9rZUhhbmRsZXIob25bbmFtZV0sIHZub2RlLCBldmVudCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlTGlzdGVuZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBoYW5kbGVyKGV2ZW50KSB7XG4gICAgaGFuZGxlRXZlbnQoZXZlbnQsIGhhbmRsZXIudm5vZGUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUV2ZW50TGlzdGVuZXJzKG9sZFZub2RlLCB2bm9kZSkge1xuICB2YXIgb2xkT24gPSBvbGRWbm9kZS5kYXRhLm9uLFxuICAgICAgb2xkTGlzdGVuZXIgPSBvbGRWbm9kZS5saXN0ZW5lcixcbiAgICAgIG9sZEVsbSA9IG9sZFZub2RlLmVsbSxcbiAgICAgIG9uID0gdm5vZGUgJiYgdm5vZGUuZGF0YS5vbixcbiAgICAgIGVsbSA9IHZub2RlICYmIHZub2RlLmVsbSxcbiAgICAgIG5hbWU7XG5cbiAgLy8gb3B0aW1pemF0aW9uIGZvciByZXVzZWQgaW1tdXRhYmxlIGhhbmRsZXJzXG4gIGlmIChvbGRPbiA9PT0gb24pIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyByZW1vdmUgZXhpc3RpbmcgbGlzdGVuZXJzIHdoaWNoIG5vIGxvbmdlciB1c2VkXG4gIGlmIChvbGRPbiAmJiBvbGRMaXN0ZW5lcikge1xuICAgIC8vIGlmIGVsZW1lbnQgY2hhbmdlZCBvciBkZWxldGVkIHdlIHJlbW92ZSBhbGwgZXhpc3RpbmcgbGlzdGVuZXJzIHVuY29uZGl0aW9uYWxseVxuICAgIGlmICghb24pIHtcbiAgICAgIGZvciAobmFtZSBpbiBvbGRPbikge1xuICAgICAgICAvLyByZW1vdmUgbGlzdGVuZXIgaWYgZWxlbWVudCB3YXMgY2hhbmdlZCBvciBleGlzdGluZyBsaXN0ZW5lcnMgcmVtb3ZlZFxuICAgICAgICBvbGRFbG0ucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCBvbGRMaXN0ZW5lciwgZmFsc2UpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKG5hbWUgaW4gb2xkT24pIHtcbiAgICAgICAgLy8gcmVtb3ZlIGxpc3RlbmVyIGlmIGV4aXN0aW5nIGxpc3RlbmVyIHJlbW92ZWRcbiAgICAgICAgaWYgKCFvbltuYW1lXSkge1xuICAgICAgICAgIG9sZEVsbS5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIG9sZExpc3RlbmVyLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBhZGQgbmV3IGxpc3RlbmVycyB3aGljaCBoYXMgbm90IGFscmVhZHkgYXR0YWNoZWRcbiAgaWYgKG9uKSB7XG4gICAgLy8gcmV1c2UgZXhpc3RpbmcgbGlzdGVuZXIgb3IgY3JlYXRlIG5ld1xuICAgIHZhciBsaXN0ZW5lciA9IHZub2RlLmxpc3RlbmVyID0gb2xkVm5vZGUubGlzdGVuZXIgfHwgY3JlYXRlTGlzdGVuZXIoKTtcbiAgICAvLyB1cGRhdGUgdm5vZGUgZm9yIGxpc3RlbmVyXG4gICAgbGlzdGVuZXIudm5vZGUgPSB2bm9kZTtcblxuICAgIC8vIGlmIGVsZW1lbnQgY2hhbmdlZCBvciBhZGRlZCB3ZSBhZGQgYWxsIG5lZWRlZCBsaXN0ZW5lcnMgdW5jb25kaXRpb25hbGx5XG4gICAgaWYgKCFvbGRPbikge1xuICAgICAgZm9yIChuYW1lIGluIG9uKSB7XG4gICAgICAgIC8vIGFkZCBsaXN0ZW5lciBpZiBlbGVtZW50IHdhcyBjaGFuZ2VkIG9yIG5ldyBsaXN0ZW5lcnMgYWRkZWRcbiAgICAgICAgZWxtLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgbGlzdGVuZXIsIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChuYW1lIGluIG9uKSB7XG4gICAgICAgIC8vIGFkZCBsaXN0ZW5lciBpZiBuZXcgbGlzdGVuZXIgYWRkZWRcbiAgICAgICAgaWYgKCFvbGRPbltuYW1lXSkge1xuICAgICAgICAgIGVsbS5hZGRFdmVudExpc3RlbmVyKG5hbWUsIGxpc3RlbmVyLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogdXBkYXRlRXZlbnRMaXN0ZW5lcnMsXG4gIHVwZGF0ZTogdXBkYXRlRXZlbnRMaXN0ZW5lcnMsXG4gIGRlc3Ryb3k6IHVwZGF0ZUV2ZW50TGlzdGVuZXJzXG59O1xuIiwiZnVuY3Rpb24gdXBkYXRlUHJvcHMob2xkVm5vZGUsIHZub2RlKSB7XG4gIHZhciBrZXksIGN1ciwgb2xkLCBlbG0gPSB2bm9kZS5lbG0sXG4gICAgICBvbGRQcm9wcyA9IG9sZFZub2RlLmRhdGEucHJvcHMsIHByb3BzID0gdm5vZGUuZGF0YS5wcm9wcztcblxuICBpZiAoIW9sZFByb3BzICYmICFwcm9wcykgcmV0dXJuO1xuICBvbGRQcm9wcyA9IG9sZFByb3BzIHx8IHt9O1xuICBwcm9wcyA9IHByb3BzIHx8IHt9O1xuXG4gIGZvciAoa2V5IGluIG9sZFByb3BzKSB7XG4gICAgaWYgKCFwcm9wc1trZXldKSB7XG4gICAgICBkZWxldGUgZWxtW2tleV07XG4gICAgfVxuICB9XG4gIGZvciAoa2V5IGluIHByb3BzKSB7XG4gICAgY3VyID0gcHJvcHNba2V5XTtcbiAgICBvbGQgPSBvbGRQcm9wc1trZXldO1xuICAgIGlmIChvbGQgIT09IGN1ciAmJiAoa2V5ICE9PSAndmFsdWUnIHx8IGVsbVtrZXldICE9PSBjdXIpKSB7XG4gICAgICBlbG1ba2V5XSA9IGN1cjtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7Y3JlYXRlOiB1cGRhdGVQcm9wcywgdXBkYXRlOiB1cGRhdGVQcm9wc307XG4iLCJ2YXIgcmFmID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHx8IHNldFRpbWVvdXQ7XG52YXIgbmV4dEZyYW1lID0gZnVuY3Rpb24oZm4pIHsgcmFmKGZ1bmN0aW9uKCkgeyByYWYoZm4pOyB9KTsgfTtcblxuZnVuY3Rpb24gc2V0TmV4dEZyYW1lKG9iaiwgcHJvcCwgdmFsKSB7XG4gIG5leHRGcmFtZShmdW5jdGlvbigpIHsgb2JqW3Byb3BdID0gdmFsOyB9KTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlU3R5bGUob2xkVm5vZGUsIHZub2RlKSB7XG4gIHZhciBjdXIsIG5hbWUsIGVsbSA9IHZub2RlLmVsbSxcbiAgICAgIG9sZFN0eWxlID0gb2xkVm5vZGUuZGF0YS5zdHlsZSxcbiAgICAgIHN0eWxlID0gdm5vZGUuZGF0YS5zdHlsZTtcblxuICBpZiAoIW9sZFN0eWxlICYmICFzdHlsZSkgcmV0dXJuO1xuICBvbGRTdHlsZSA9IG9sZFN0eWxlIHx8IHt9O1xuICBzdHlsZSA9IHN0eWxlIHx8IHt9O1xuICB2YXIgb2xkSGFzRGVsID0gJ2RlbGF5ZWQnIGluIG9sZFN0eWxlO1xuXG4gIGZvciAobmFtZSBpbiBvbGRTdHlsZSkge1xuICAgIGlmICghc3R5bGVbbmFtZV0pIHtcbiAgICAgIGVsbS5zdHlsZVtuYW1lXSA9ICcnO1xuICAgIH1cbiAgfVxuICBmb3IgKG5hbWUgaW4gc3R5bGUpIHtcbiAgICBjdXIgPSBzdHlsZVtuYW1lXTtcbiAgICBpZiAobmFtZSA9PT0gJ2RlbGF5ZWQnKSB7XG4gICAgICBmb3IgKG5hbWUgaW4gc3R5bGUuZGVsYXllZCkge1xuICAgICAgICBjdXIgPSBzdHlsZS5kZWxheWVkW25hbWVdO1xuICAgICAgICBpZiAoIW9sZEhhc0RlbCB8fCBjdXIgIT09IG9sZFN0eWxlLmRlbGF5ZWRbbmFtZV0pIHtcbiAgICAgICAgICBzZXROZXh0RnJhbWUoZWxtLnN0eWxlLCBuYW1lLCBjdXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChuYW1lICE9PSAncmVtb3ZlJyAmJiBjdXIgIT09IG9sZFN0eWxlW25hbWVdKSB7XG4gICAgICBlbG0uc3R5bGVbbmFtZV0gPSBjdXI7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGFwcGx5RGVzdHJveVN0eWxlKHZub2RlKSB7XG4gIHZhciBzdHlsZSwgbmFtZSwgZWxtID0gdm5vZGUuZWxtLCBzID0gdm5vZGUuZGF0YS5zdHlsZTtcbiAgaWYgKCFzIHx8ICEoc3R5bGUgPSBzLmRlc3Ryb3kpKSByZXR1cm47XG4gIGZvciAobmFtZSBpbiBzdHlsZSkge1xuICAgIGVsbS5zdHlsZVtuYW1lXSA9IHN0eWxlW25hbWVdO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFwcGx5UmVtb3ZlU3R5bGUodm5vZGUsIHJtKSB7XG4gIHZhciBzID0gdm5vZGUuZGF0YS5zdHlsZTtcbiAgaWYgKCFzIHx8ICFzLnJlbW92ZSkge1xuICAgIHJtKCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBuYW1lLCBlbG0gPSB2bm9kZS5lbG0sIGlkeCwgaSA9IDAsIG1heER1ciA9IDAsXG4gICAgICBjb21wU3R5bGUsIHN0eWxlID0gcy5yZW1vdmUsIGFtb3VudCA9IDAsIGFwcGxpZWQgPSBbXTtcbiAgZm9yIChuYW1lIGluIHN0eWxlKSB7XG4gICAgYXBwbGllZC5wdXNoKG5hbWUpO1xuICAgIGVsbS5zdHlsZVtuYW1lXSA9IHN0eWxlW25hbWVdO1xuICB9XG4gIGNvbXBTdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxtKTtcbiAgdmFyIHByb3BzID0gY29tcFN0eWxlWyd0cmFuc2l0aW9uLXByb3BlcnR5J10uc3BsaXQoJywgJyk7XG4gIGZvciAoOyBpIDwgcHJvcHMubGVuZ3RoOyArK2kpIHtcbiAgICBpZihhcHBsaWVkLmluZGV4T2YocHJvcHNbaV0pICE9PSAtMSkgYW1vdW50Kys7XG4gIH1cbiAgZWxtLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBmdW5jdGlvbihldikge1xuICAgIGlmIChldi50YXJnZXQgPT09IGVsbSkgLS1hbW91bnQ7XG4gICAgaWYgKGFtb3VudCA9PT0gMCkgcm0oKTtcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge2NyZWF0ZTogdXBkYXRlU3R5bGUsIHVwZGF0ZTogdXBkYXRlU3R5bGUsIGRlc3Ryb3k6IGFwcGx5RGVzdHJveVN0eWxlLCByZW1vdmU6IGFwcGx5UmVtb3ZlU3R5bGV9O1xuIiwiLy8ganNoaW50IG5ld2NhcDogZmFsc2Vcbi8qIGdsb2JhbCByZXF1aXJlLCBtb2R1bGUsIGRvY3VtZW50LCBOb2RlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBWTm9kZSA9IHJlcXVpcmUoJy4vdm5vZGUnKTtcbnZhciBpcyA9IHJlcXVpcmUoJy4vaXMnKTtcbnZhciBkb21BcGkgPSByZXF1aXJlKCcuL2h0bWxkb21hcGknKTtcblxuZnVuY3Rpb24gaXNVbmRlZihzKSB7IHJldHVybiBzID09PSB1bmRlZmluZWQ7IH1cbmZ1bmN0aW9uIGlzRGVmKHMpIHsgcmV0dXJuIHMgIT09IHVuZGVmaW5lZDsgfVxuXG52YXIgZW1wdHlOb2RlID0gVk5vZGUoJycsIHt9LCBbXSwgdW5kZWZpbmVkLCB1bmRlZmluZWQpO1xuXG5mdW5jdGlvbiBzYW1lVm5vZGUodm5vZGUxLCB2bm9kZTIpIHtcbiAgcmV0dXJuIHZub2RlMS5rZXkgPT09IHZub2RlMi5rZXkgJiYgdm5vZGUxLnNlbCA9PT0gdm5vZGUyLnNlbDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlS2V5VG9PbGRJZHgoY2hpbGRyZW4sIGJlZ2luSWR4LCBlbmRJZHgpIHtcbiAgdmFyIGksIG1hcCA9IHt9LCBrZXk7XG4gIGZvciAoaSA9IGJlZ2luSWR4OyBpIDw9IGVuZElkeDsgKytpKSB7XG4gICAga2V5ID0gY2hpbGRyZW5baV0ua2V5O1xuICAgIGlmIChpc0RlZihrZXkpKSBtYXBba2V5XSA9IGk7XG4gIH1cbiAgcmV0dXJuIG1hcDtcbn1cblxudmFyIGhvb2tzID0gWydjcmVhdGUnLCAndXBkYXRlJywgJ3JlbW92ZScsICdkZXN0cm95JywgJ3ByZScsICdwb3N0J107XG5cbmZ1bmN0aW9uIGluaXQobW9kdWxlcywgYXBpKSB7XG4gIHZhciBpLCBqLCBjYnMgPSB7fTtcblxuICBpZiAoaXNVbmRlZihhcGkpKSBhcGkgPSBkb21BcGk7XG5cbiAgZm9yIChpID0gMDsgaSA8IGhvb2tzLmxlbmd0aDsgKytpKSB7XG4gICAgY2JzW2hvb2tzW2ldXSA9IFtdO1xuICAgIGZvciAoaiA9IDA7IGogPCBtb2R1bGVzLmxlbmd0aDsgKytqKSB7XG4gICAgICBpZiAobW9kdWxlc1tqXVtob29rc1tpXV0gIT09IHVuZGVmaW5lZCkgY2JzW2hvb2tzW2ldXS5wdXNoKG1vZHVsZXNbal1baG9va3NbaV1dKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBlbXB0eU5vZGVBdChlbG0pIHtcbiAgICB2YXIgaWQgPSBlbG0uaWQgPyAnIycgKyBlbG0uaWQgOiAnJztcbiAgICB2YXIgYyA9IGVsbS5jbGFzc05hbWUgPyAnLicgKyBlbG0uY2xhc3NOYW1lLnNwbGl0KCcgJykuam9pbignLicpIDogJyc7XG4gICAgcmV0dXJuIFZOb2RlKGFwaS50YWdOYW1lKGVsbSkudG9Mb3dlckNhc2UoKSArIGlkICsgYywge30sIFtdLCB1bmRlZmluZWQsIGVsbSk7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVSbUNiKGNoaWxkRWxtLCBsaXN0ZW5lcnMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoLS1saXN0ZW5lcnMgPT09IDApIHtcbiAgICAgICAgdmFyIHBhcmVudCA9IGFwaS5wYXJlbnROb2RlKGNoaWxkRWxtKTtcbiAgICAgICAgYXBpLnJlbW92ZUNoaWxkKHBhcmVudCwgY2hpbGRFbG0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVFbG0odm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgIHZhciBpLCBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICBpZiAoaXNEZWYoZGF0YSkpIHtcbiAgICAgIGlmIChpc0RlZihpID0gZGF0YS5ob29rKSAmJiBpc0RlZihpID0gaS5pbml0KSkge1xuICAgICAgICBpKHZub2RlKTtcbiAgICAgICAgZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBlbG0sIGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW4sIHNlbCA9IHZub2RlLnNlbDtcbiAgICBpZiAoaXNEZWYoc2VsKSkge1xuICAgICAgLy8gUGFyc2Ugc2VsZWN0b3JcbiAgICAgIHZhciBoYXNoSWR4ID0gc2VsLmluZGV4T2YoJyMnKTtcbiAgICAgIHZhciBkb3RJZHggPSBzZWwuaW5kZXhPZignLicsIGhhc2hJZHgpO1xuICAgICAgdmFyIGhhc2ggPSBoYXNoSWR4ID4gMCA/IGhhc2hJZHggOiBzZWwubGVuZ3RoO1xuICAgICAgdmFyIGRvdCA9IGRvdElkeCA+IDAgPyBkb3RJZHggOiBzZWwubGVuZ3RoO1xuICAgICAgdmFyIHRhZyA9IGhhc2hJZHggIT09IC0xIHx8IGRvdElkeCAhPT0gLTEgPyBzZWwuc2xpY2UoMCwgTWF0aC5taW4oaGFzaCwgZG90KSkgOiBzZWw7XG4gICAgICBlbG0gPSB2bm9kZS5lbG0gPSBpc0RlZihkYXRhKSAmJiBpc0RlZihpID0gZGF0YS5ucykgPyBhcGkuY3JlYXRlRWxlbWVudE5TKGksIHRhZylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGFwaS5jcmVhdGVFbGVtZW50KHRhZyk7XG4gICAgICBpZiAoaGFzaCA8IGRvdCkgZWxtLmlkID0gc2VsLnNsaWNlKGhhc2ggKyAxLCBkb3QpO1xuICAgICAgaWYgKGRvdElkeCA+IDApIGVsbS5jbGFzc05hbWUgPSBzZWwuc2xpY2UoZG90ICsgMSkucmVwbGFjZSgvXFwuL2csICcgJyk7XG4gICAgICBpZiAoaXMuYXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgIGFwaS5hcHBlbmRDaGlsZChlbG0sIGNyZWF0ZUVsbShjaGlsZHJlbltpXSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoaXMucHJpbWl0aXZlKHZub2RlLnRleHQpKSB7XG4gICAgICAgIGFwaS5hcHBlbmRDaGlsZChlbG0sIGFwaS5jcmVhdGVUZXh0Tm9kZSh2bm9kZS50ZXh0KSk7XG4gICAgICB9XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLmNyZWF0ZS5sZW5ndGg7ICsraSkgY2JzLmNyZWF0ZVtpXShlbXB0eU5vZGUsIHZub2RlKTtcbiAgICAgIGkgPSB2bm9kZS5kYXRhLmhvb2s7IC8vIFJldXNlIHZhcmlhYmxlXG4gICAgICBpZiAoaXNEZWYoaSkpIHtcbiAgICAgICAgaWYgKGkuY3JlYXRlKSBpLmNyZWF0ZShlbXB0eU5vZGUsIHZub2RlKTtcbiAgICAgICAgaWYgKGkuaW5zZXJ0KSBpbnNlcnRlZFZub2RlUXVldWUucHVzaCh2bm9kZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsbSA9IHZub2RlLmVsbSA9IGFwaS5jcmVhdGVUZXh0Tm9kZSh2bm9kZS50ZXh0KTtcbiAgICB9XG4gICAgcmV0dXJuIHZub2RlLmVsbTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFZub2RlcyhwYXJlbnRFbG0sIGJlZm9yZSwgdm5vZGVzLCBzdGFydElkeCwgZW5kSWR4LCBpbnNlcnRlZFZub2RlUXVldWUpIHtcbiAgICBmb3IgKDsgc3RhcnRJZHggPD0gZW5kSWR4OyArK3N0YXJ0SWR4KSB7XG4gICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgY3JlYXRlRWxtKHZub2Rlc1tzdGFydElkeF0sIGluc2VydGVkVm5vZGVRdWV1ZSksIGJlZm9yZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW52b2tlRGVzdHJveUhvb2sodm5vZGUpIHtcbiAgICB2YXIgaSwgaiwgZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgaWYgKGlzRGVmKGRhdGEpKSB7XG4gICAgICBpZiAoaXNEZWYoaSA9IGRhdGEuaG9vaykgJiYgaXNEZWYoaSA9IGkuZGVzdHJveSkpIGkodm5vZGUpO1xuICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5kZXN0cm95Lmxlbmd0aDsgKytpKSBjYnMuZGVzdHJveVtpXSh2bm9kZSk7XG4gICAgICBpZiAoaXNEZWYoaSA9IHZub2RlLmNoaWxkcmVuKSkge1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgdm5vZGUuY2hpbGRyZW4ubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICBpbnZva2VEZXN0cm95SG9vayh2bm9kZS5jaGlsZHJlbltqXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVWbm9kZXMocGFyZW50RWxtLCB2bm9kZXMsIHN0YXJ0SWR4LCBlbmRJZHgpIHtcbiAgICBmb3IgKDsgc3RhcnRJZHggPD0gZW5kSWR4OyArK3N0YXJ0SWR4KSB7XG4gICAgICB2YXIgaSwgbGlzdGVuZXJzLCBybSwgY2ggPSB2bm9kZXNbc3RhcnRJZHhdO1xuICAgICAgaWYgKGlzRGVmKGNoKSkge1xuICAgICAgICBpZiAoaXNEZWYoY2guc2VsKSkge1xuICAgICAgICAgIGludm9rZURlc3Ryb3lIb29rKGNoKTtcbiAgICAgICAgICBsaXN0ZW5lcnMgPSBjYnMucmVtb3ZlLmxlbmd0aCArIDE7XG4gICAgICAgICAgcm0gPSBjcmVhdGVSbUNiKGNoLmVsbSwgbGlzdGVuZXJzKTtcbiAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLnJlbW92ZS5sZW5ndGg7ICsraSkgY2JzLnJlbW92ZVtpXShjaCwgcm0pO1xuICAgICAgICAgIGlmIChpc0RlZihpID0gY2guZGF0YSkgJiYgaXNEZWYoaSA9IGkuaG9vaykgJiYgaXNEZWYoaSA9IGkucmVtb3ZlKSkge1xuICAgICAgICAgICAgaShjaCwgcm0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBybSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHsgLy8gVGV4dCBub2RlXG4gICAgICAgICAgYXBpLnJlbW92ZUNoaWxkKHBhcmVudEVsbSwgY2guZWxtKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUNoaWxkcmVuKHBhcmVudEVsbSwgb2xkQ2gsIG5ld0NoLCBpbnNlcnRlZFZub2RlUXVldWUpIHtcbiAgICB2YXIgb2xkU3RhcnRJZHggPSAwLCBuZXdTdGFydElkeCA9IDA7XG4gICAgdmFyIG9sZEVuZElkeCA9IG9sZENoLmxlbmd0aCAtIDE7XG4gICAgdmFyIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFswXTtcbiAgICB2YXIgb2xkRW5kVm5vZGUgPSBvbGRDaFtvbGRFbmRJZHhdO1xuICAgIHZhciBuZXdFbmRJZHggPSBuZXdDaC5sZW5ndGggLSAxO1xuICAgIHZhciBuZXdTdGFydFZub2RlID0gbmV3Q2hbMF07XG4gICAgdmFyIG5ld0VuZFZub2RlID0gbmV3Q2hbbmV3RW5kSWR4XTtcbiAgICB2YXIgb2xkS2V5VG9JZHgsIGlkeEluT2xkLCBlbG1Ub01vdmUsIGJlZm9yZTtcblxuICAgIHdoaWxlIChvbGRTdGFydElkeCA8PSBvbGRFbmRJZHggJiYgbmV3U3RhcnRJZHggPD0gbmV3RW5kSWR4KSB7XG4gICAgICBpZiAoaXNVbmRlZihvbGRTdGFydFZub2RlKSkge1xuICAgICAgICBvbGRTdGFydFZub2RlID0gb2xkQ2hbKytvbGRTdGFydElkeF07IC8vIFZub2RlIGhhcyBiZWVuIG1vdmVkIGxlZnRcbiAgICAgIH0gZWxzZSBpZiAoaXNVbmRlZihvbGRFbmRWbm9kZSkpIHtcbiAgICAgICAgb2xkRW5kVm5vZGUgPSBvbGRDaFstLW9sZEVuZElkeF07XG4gICAgICB9IGVsc2UgaWYgKHNhbWVWbm9kZShvbGRTdGFydFZub2RlLCBuZXdTdGFydFZub2RlKSkge1xuICAgICAgICBwYXRjaFZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFsrK29sZFN0YXJ0SWR4XTtcbiAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgfSBlbHNlIGlmIChzYW1lVm5vZGUob2xkRW5kVm5vZGUsIG5ld0VuZFZub2RlKSkge1xuICAgICAgICBwYXRjaFZub2RlKG9sZEVuZFZub2RlLCBuZXdFbmRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgb2xkRW5kVm5vZGUgPSBvbGRDaFstLW9sZEVuZElkeF07XG4gICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgfSBlbHNlIGlmIChzYW1lVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3RW5kVm5vZGUpKSB7IC8vIFZub2RlIG1vdmVkIHJpZ2h0XG4gICAgICAgIHBhdGNoVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3RW5kVm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBvbGRTdGFydFZub2RlLmVsbSwgYXBpLm5leHRTaWJsaW5nKG9sZEVuZFZub2RlLmVsbSkpO1xuICAgICAgICBvbGRTdGFydFZub2RlID0gb2xkQ2hbKytvbGRTdGFydElkeF07XG4gICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgfSBlbHNlIGlmIChzYW1lVm5vZGUob2xkRW5kVm5vZGUsIG5ld1N0YXJ0Vm5vZGUpKSB7IC8vIFZub2RlIG1vdmVkIGxlZnRcbiAgICAgICAgcGF0Y2hWbm9kZShvbGRFbmRWbm9kZSwgbmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZEVuZFZub2RlLmVsbSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICBvbGRFbmRWbm9kZSA9IG9sZENoWy0tb2xkRW5kSWR4XTtcbiAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGlzVW5kZWYob2xkS2V5VG9JZHgpKSBvbGRLZXlUb0lkeCA9IGNyZWF0ZUtleVRvT2xkSWR4KG9sZENoLCBvbGRTdGFydElkeCwgb2xkRW5kSWR4KTtcbiAgICAgICAgaWR4SW5PbGQgPSBvbGRLZXlUb0lkeFtuZXdTdGFydFZub2RlLmtleV07XG4gICAgICAgIGlmIChpc1VuZGVmKGlkeEluT2xkKSkgeyAvLyBOZXcgZWxlbWVudFxuICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBjcmVhdGVFbG0obmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbG1Ub01vdmUgPSBvbGRDaFtpZHhJbk9sZF07XG4gICAgICAgICAgcGF0Y2hWbm9kZShlbG1Ub01vdmUsIG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgb2xkQ2hbaWR4SW5PbGRdID0gdW5kZWZpbmVkO1xuICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBlbG1Ub01vdmUuZWxtLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChvbGRTdGFydElkeCA+IG9sZEVuZElkeCkge1xuICAgICAgYmVmb3JlID0gaXNVbmRlZihuZXdDaFtuZXdFbmRJZHgrMV0pID8gbnVsbCA6IG5ld0NoW25ld0VuZElkeCsxXS5lbG07XG4gICAgICBhZGRWbm9kZXMocGFyZW50RWxtLCBiZWZvcmUsIG5ld0NoLCBuZXdTdGFydElkeCwgbmV3RW5kSWR4LCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgIH0gZWxzZSBpZiAobmV3U3RhcnRJZHggPiBuZXdFbmRJZHgpIHtcbiAgICAgIHJlbW92ZVZub2RlcyhwYXJlbnRFbG0sIG9sZENoLCBvbGRTdGFydElkeCwgb2xkRW5kSWR4KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwYXRjaFZub2RlKG9sZFZub2RlLCB2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgdmFyIGksIGhvb2s7XG4gICAgaWYgKGlzRGVmKGkgPSB2bm9kZS5kYXRhKSAmJiBpc0RlZihob29rID0gaS5ob29rKSAmJiBpc0RlZihpID0gaG9vay5wcmVwYXRjaCkpIHtcbiAgICAgIGkob2xkVm5vZGUsIHZub2RlKTtcbiAgICB9XG4gICAgdmFyIGVsbSA9IHZub2RlLmVsbSA9IG9sZFZub2RlLmVsbSwgb2xkQ2ggPSBvbGRWbm9kZS5jaGlsZHJlbiwgY2ggPSB2bm9kZS5jaGlsZHJlbjtcbiAgICBpZiAob2xkVm5vZGUgPT09IHZub2RlKSByZXR1cm47XG4gICAgaWYgKCFzYW1lVm5vZGUob2xkVm5vZGUsIHZub2RlKSkge1xuICAgICAgdmFyIHBhcmVudEVsbSA9IGFwaS5wYXJlbnROb2RlKG9sZFZub2RlLmVsbSk7XG4gICAgICBlbG0gPSBjcmVhdGVFbG0odm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgZWxtLCBvbGRWbm9kZS5lbG0pO1xuICAgICAgcmVtb3ZlVm5vZGVzKHBhcmVudEVsbSwgW29sZFZub2RlXSwgMCwgMCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChpc0RlZih2bm9kZS5kYXRhKSkge1xuICAgICAgZm9yIChpID0gMDsgaSA8IGNicy51cGRhdGUubGVuZ3RoOyArK2kpIGNicy51cGRhdGVbaV0ob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgIGkgPSB2bm9kZS5kYXRhLmhvb2s7XG4gICAgICBpZiAoaXNEZWYoaSkgJiYgaXNEZWYoaSA9IGkudXBkYXRlKSkgaShvbGRWbm9kZSwgdm5vZGUpO1xuICAgIH1cbiAgICBpZiAoaXNVbmRlZih2bm9kZS50ZXh0KSkge1xuICAgICAgaWYgKGlzRGVmKG9sZENoKSAmJiBpc0RlZihjaCkpIHtcbiAgICAgICAgaWYgKG9sZENoICE9PSBjaCkgdXBkYXRlQ2hpbGRyZW4oZWxtLCBvbGRDaCwgY2gsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzRGVmKGNoKSkge1xuICAgICAgICBpZiAoaXNEZWYob2xkVm5vZGUudGV4dCkpIGFwaS5zZXRUZXh0Q29udGVudChlbG0sICcnKTtcbiAgICAgICAgYWRkVm5vZGVzKGVsbSwgbnVsbCwgY2gsIDAsIGNoLmxlbmd0aCAtIDEsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzRGVmKG9sZENoKSkge1xuICAgICAgICByZW1vdmVWbm9kZXMoZWxtLCBvbGRDaCwgMCwgb2xkQ2gubGVuZ3RoIC0gMSk7XG4gICAgICB9IGVsc2UgaWYgKGlzRGVmKG9sZFZub2RlLnRleHQpKSB7XG4gICAgICAgIGFwaS5zZXRUZXh0Q29udGVudChlbG0sICcnKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG9sZFZub2RlLnRleHQgIT09IHZub2RlLnRleHQpIHtcbiAgICAgIGFwaS5zZXRUZXh0Q29udGVudChlbG0sIHZub2RlLnRleHQpO1xuICAgIH1cbiAgICBpZiAoaXNEZWYoaG9vaykgJiYgaXNEZWYoaSA9IGhvb2sucG9zdHBhdGNoKSkge1xuICAgICAgaShvbGRWbm9kZSwgdm5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbihvbGRWbm9kZSwgdm5vZGUpIHtcbiAgICB2YXIgaSwgZWxtLCBwYXJlbnQ7XG4gICAgdmFyIGluc2VydGVkVm5vZGVRdWV1ZSA9IFtdO1xuICAgIGZvciAoaSA9IDA7IGkgPCBjYnMucHJlLmxlbmd0aDsgKytpKSBjYnMucHJlW2ldKCk7XG5cbiAgICBpZiAoaXNVbmRlZihvbGRWbm9kZS5zZWwpKSB7XG4gICAgICBvbGRWbm9kZSA9IGVtcHR5Tm9kZUF0KG9sZFZub2RlKTtcbiAgICB9XG5cbiAgICBpZiAoc2FtZVZub2RlKG9sZFZub2RlLCB2bm9kZSkpIHtcbiAgICAgIHBhdGNoVm5vZGUob2xkVm5vZGUsIHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbG0gPSBvbGRWbm9kZS5lbG07XG4gICAgICBwYXJlbnQgPSBhcGkucGFyZW50Tm9kZShlbG0pO1xuXG4gICAgICBjcmVhdGVFbG0odm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG5cbiAgICAgIGlmIChwYXJlbnQgIT09IG51bGwpIHtcbiAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnQsIHZub2RlLmVsbSwgYXBpLm5leHRTaWJsaW5nKGVsbSkpO1xuICAgICAgICByZW1vdmVWbm9kZXMocGFyZW50LCBbb2xkVm5vZGVdLCAwLCAwKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLmxlbmd0aDsgKytpKSB7XG4gICAgICBpbnNlcnRlZFZub2RlUXVldWVbaV0uZGF0YS5ob29rLmluc2VydChpbnNlcnRlZFZub2RlUXVldWVbaV0pO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLnBvc3QubGVuZ3RoOyArK2kpIGNicy5wb3N0W2ldKCk7XG4gICAgcmV0dXJuIHZub2RlO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtpbml0OiBpbml0fTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2VsLCBkYXRhLCBjaGlsZHJlbiwgdGV4dCwgZWxtKSB7XG4gIHZhciBrZXkgPSBkYXRhID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBkYXRhLmtleTtcbiAgcmV0dXJuIHtzZWw6IHNlbCwgZGF0YTogZGF0YSwgY2hpbGRyZW46IGNoaWxkcmVuLFxuICAgICAgICAgIHRleHQ6IHRleHQsIGVsbTogZWxtLCBrZXk6IGtleX07XG59O1xuIiwiZnVuY3Rpb24gdXBkYXRlUHJvcHMob2xkVm5vZGUsIHZub2RlKSB7XHJcbiAgICBsZXQga2V5LCBjdXIsIG9sZCwgZWxtID0gdm5vZGUuZWxtLFxyXG4gICAgICAgIHByb3BzID0gdm5vZGUuZGF0YS5saXZlUHJvcHMgfHwge307XHJcbiAgICBmb3IgKGtleSBpbiBwcm9wcykge1xyXG4gICAgICAgIGN1ciA9IHByb3BzW2tleV07XHJcbiAgICAgICAgb2xkID0gZWxtW2tleV07XHJcbiAgICAgICAgaWYgKG9sZCAhPT0gY3VyKSBlbG1ba2V5XSA9IGN1cjtcclxuICAgIH1cclxufVxyXG5jb25zdCBsaXZlUHJvcHNQbHVnaW4gPSB7Y3JlYXRlOiB1cGRhdGVQcm9wcywgdXBkYXRlOiB1cGRhdGVQcm9wc307XHJcbmltcG9ydCBzbmFiYmRvbSBmcm9tIFwic25hYmJkb21cIlxyXG5pbXBvcnQgaCBmcm9tIFwic25hYmJkb20vaFwiXHJcbmNvbnN0IHBhdGNoID0gc25hYmJkb20uaW5pdChbXHJcbiAgICByZXF1aXJlKCdzbmFiYmRvbS9tb2R1bGVzL2NsYXNzJyksXHJcbiAgICByZXF1aXJlKCdzbmFiYmRvbS9tb2R1bGVzL3Byb3BzJyksXHJcbiAgICByZXF1aXJlKCdzbmFiYmRvbS9tb2R1bGVzL3N0eWxlJyksXHJcbiAgICByZXF1aXJlKCdzbmFiYmRvbS9tb2R1bGVzL2V2ZW50bGlzdGVuZXJzJyksXHJcbiAgICByZXF1aXJlKCdzbmFiYmRvbS9tb2R1bGVzL2F0dHJpYnV0ZXMnKSxcclxuICAgIGxpdmVQcm9wc1BsdWdpblxyXG5dKTtcclxuXHJcbmZ1bmN0aW9uIHV1aWQoKXtyZXR1cm4oXCJcIisxZTcrLTFlMystNGUzKy04ZTMrLTFlMTEpLnJlcGxhY2UoL1sxMF0vZyxmdW5jdGlvbigpe3JldHVybigwfE1hdGgucmFuZG9tKCkqMTYpLnRvU3RyaW5nKDE2KX0pfVxyXG5pbXBvcnQgYmlnIGZyb20gJy4uL25vZGVfbW9kdWxlcy9iaWcuanMnXHJcbmJpZy5FX1BPUyA9IDFlKzZcclxuXHJcbmltcG9ydCB1Z25pcyBmcm9tICcuL3VnbmlzJ1xyXG5pbXBvcnQgc2F2ZWRBcHAgZnJvbSAnLi4vdWduaXNfY29tcG9uZW50cy9hcHAuanNvbidcclxuXHJcbmZ1bmN0aW9uIG1vdmVJbkFycmF5IChhcnJheSwgbW92ZUluZGV4LCB0b0luZGV4KSB7XHJcbiAgICBsZXQgaXRlbSA9IGFycmF5W21vdmVJbmRleF07XHJcbiAgICBsZXQgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xyXG4gICAgbGV0IGRpZmYgPSBtb3ZlSW5kZXggLSB0b0luZGV4O1xyXG5cclxuICAgIGlmIChkaWZmID4gMCkge1xyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgIC4uLmFycmF5LnNsaWNlKDAsIHRvSW5kZXgpLFxyXG4gICAgICAgICAgICBpdGVtLFxyXG4gICAgICAgICAgICAuLi5hcnJheS5zbGljZSh0b0luZGV4LCBtb3ZlSW5kZXgpLFxyXG4gICAgICAgICAgICAuLi5hcnJheS5zbGljZShtb3ZlSW5kZXggKyAxLCBsZW5ndGgpXHJcbiAgICAgICAgXTtcclxuICAgIH0gZWxzZSBpZiAoZGlmZiA8IDApIHtcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICAuLi5hcnJheS5zbGljZSgwLCBtb3ZlSW5kZXgpLFxyXG4gICAgICAgICAgICAuLi5hcnJheS5zbGljZShtb3ZlSW5kZXggKyAxLCB0b0luZGV4ICsgMSksXHJcbiAgICAgICAgICAgIGl0ZW0sXHJcbiAgICAgICAgICAgIC4uLmFycmF5LnNsaWNlKHRvSW5kZXggKyAxLCBsZW5ndGgpXHJcbiAgICAgICAgXTtcclxuICAgIH1cclxuICAgIHJldHVybiBhcnJheTtcclxufVxyXG5cclxuY29uc3QgYXR0YWNoRmFzdENsaWNrID0gcmVxdWlyZSgnZmFzdGNsaWNrJylcclxuYXR0YWNoRmFzdENsaWNrKGRvY3VtZW50LmJvZHkpXHJcblxyXG5jb25zdCB2ZXJzaW9uID0gJzAuMC4zMXYnXHJcbmVkaXRvcihzYXZlZEFwcClcclxuXHJcbmZ1bmN0aW9uIGVkaXRvcihhcHBEZWZpbml0aW9uKXtcclxuXHJcbiAgICBjb25zdCBzYXZlZERlZmluaXRpb24gPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhcHBfa2V5XycgKyB2ZXJzaW9uKSlcclxuICAgIGNvbnN0IGFwcCA9IHVnbmlzKHNhdmVkRGVmaW5pdGlvbiB8fCBhcHBEZWZpbml0aW9uKVxyXG5cclxuICAgIGxldCBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobm9kZSlcclxuXHJcbiAgICAvLyBTdGF0ZVxyXG4gICAgbGV0IHN0YXRlID0ge1xyXG4gICAgICAgIGxlZnRPcGVuOiBmYWxzZSxcclxuICAgICAgICByaWdodE9wZW46IHRydWUsXHJcbiAgICAgICAgZnVsbFNjcmVlbjogZmFsc2UsXHJcbiAgICAgICAgZWRpdG9yUmlnaHRXaWR0aDogMzUwLFxyXG4gICAgICAgIGVkaXRvckxlZnRXaWR0aDogMzUwLFxyXG4gICAgICAgIHN1YkVkaXRvcldpZHRoOiAzNTAsXHJcbiAgICAgICAgY29tcG9uZW50RWRpdG9yUG9zaXRpb246IHt4OiB3aW5kb3cuaW5uZXJXaWR0aCAtIDcxMCwgeTogd2luZG93LmlubmVySGVpZ2h0IC8gMn0gLFxyXG4gICAgICAgIGFwcElzRnJvemVuOiBmYWxzZSxcclxuICAgICAgICBzZWxlY3RlZFZpZXdOb2RlOiB7fSxcclxuICAgICAgICBzZWxlY3RlZFBpcGVJZDogJycsXHJcbiAgICAgICAgc2VsZWN0ZWRTdGF0ZU5vZGVJZDogJycsXHJcbiAgICAgICAgc2VsZWN0ZWRWaWV3U3ViTWVudTogJ3Byb3BzJyxcclxuICAgICAgICBlZGl0aW5nVGl0bGVOb2RlSWQ6ICcnLFxyXG4gICAgICAgIHZpZXdGb2xkZXJzQ2xvc2VkOiB7fSxcclxuICAgICAgICBkcmFnZ2VkQ29tcG9uZW50VmlldzogbnVsbCxcclxuICAgICAgICBkcmFnZ2VkQ29tcG9uZW50U3RhdGVJZDogbnVsbCxcclxuICAgICAgICBob3ZlcmVkUGlwZTogbnVsbCxcclxuICAgICAgICBob3ZlcmVkVmlld05vZGU6IG51bGwsXHJcbiAgICAgICAgbW91c2VQb3NpdGlvbjoge30sXHJcbiAgICAgICAgZXZlbnRTdGFjazogW10sXHJcbiAgICAgICAgZGVmaW5pdGlvbjogc2F2ZWREZWZpbml0aW9uIHx8IGFwcC5kZWZpbml0aW9uLFxyXG4gICAgfVxyXG4gICAgLy8gdW5kby9yZWRvXHJcbiAgICBsZXQgc3RhdGVTdGFjayA9IFtzdGF0ZS5kZWZpbml0aW9uXVxyXG4gICAgbGV0IGN1cnJlbnRBbmltYXRpb25GcmFtZVJlcXVlc3QgPSBudWxsO1xyXG4gICAgZnVuY3Rpb24gc2V0U3RhdGUobmV3U3RhdGUsIHRpbWVUcmF2ZWxpbmcpe1xyXG4gICAgICAgIGlmKG5ld1N0YXRlID09PSBzdGF0ZSl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybignc3RhdGUgd2FzIG11dGF0ZWQsIHNlYXJjaCBmb3IgYSBidWcnKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZihzdGF0ZS5kZWZpbml0aW9uICE9PSBuZXdTdGF0ZS5kZWZpbml0aW9uKXtcclxuICAgICAgICAgICAgLy8gdW5zZWxlY3QgZGVsZXRlZCBjb21wb25lbnRzIGFuZCBzdGF0ZVxyXG4gICAgICAgICAgICBpZihuZXdTdGF0ZS5kZWZpbml0aW9uLnN0YXRlW25ld1N0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWRdID09PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICAgbmV3U3RhdGUgPSB7Li4ubmV3U3RhdGUsIHNlbGVjdGVkU3RhdGVOb2RlSWQ6ICcnfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKG5ld1N0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmICE9PSB1bmRlZmluZWQgJiYgbmV3U3RhdGUuZGVmaW5pdGlvbltuZXdTdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZl1bbmV3U3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZF0gPT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgICAgICBuZXdTdGF0ZSA9IHsuLi5uZXdTdGF0ZSwgc2VsZWN0ZWRWaWV3Tm9kZToge319XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gdW5kby9yZWRvIHRoZW4gcmVuZGVyIHRoZW4gc2F2ZVxyXG4gICAgICAgICAgICBpZighdGltZVRyYXZlbGluZyl7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50SW5kZXggPSBzdGF0ZVN0YWNrLmZpbmRJbmRleCgoYSk9PmE9PT1zdGF0ZS5kZWZpbml0aW9uKVxyXG4gICAgICAgICAgICAgICAgc3RhdGVTdGFjayA9IHN0YXRlU3RhY2suc2xpY2UoMCwgY3VycmVudEluZGV4KzEpLmNvbmNhdChuZXdTdGF0ZS5kZWZpbml0aW9uKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFwcC5yZW5kZXIobmV3U3RhdGUuZGVmaW5pdGlvbilcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKT0+bG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2FwcF9rZXlfJyt2ZXJzaW9uLCBKU09OLnN0cmluZ2lmeShuZXdTdGF0ZS5kZWZpbml0aW9uKSksIDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZihzdGF0ZS5hcHBJc0Zyb3plbiAhPT0gbmV3U3RhdGUuYXBwSXNGcm96ZW4gfHwgc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZSAhPT0gbmV3U3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZSApe1xyXG4gICAgICAgICAgICBhcHAuX2ZyZWV6ZShuZXdTdGF0ZS5hcHBJc0Zyb3plbiwgVklFV19OT0RFX1NFTEVDVEVELCBuZXdTdGF0ZS5zZWxlY3RlZFZpZXdOb2RlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZihuZXdTdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQgJiYgc3RhdGUuZWRpdGluZ1RpdGxlTm9kZUlkICE9PSBuZXdTdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQpe1xyXG4gICAgICAgICAgICAvLyBxdWUgYXV0byBmb2N1c1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgbm9kZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWlzdGl0bGVlZGl0b3JdJylbMF1cclxuICAgICAgICAgICAgICAgIGlmKG5vZGUpe1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUuZm9jdXMoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAwKVxyXG4gICAgICAgIH1cclxuICAgICAgICBzdGF0ZSA9IG5ld1N0YXRlXHJcbiAgICAgICAgaWYoIWN1cnJlbnRBbmltYXRpb25GcmFtZVJlcXVlc3Qpe1xyXG4gICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcilcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKT0+IHtcclxuICAgICAgICAvLyBjbGlja2VkIG91dHNpZGVcclxuICAgICAgICBpZihzdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQgJiYgIWUudGFyZ2V0LmRhdGFzZXQuaXN0aXRsZWVkaXRvcil7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZWRpdGluZ1RpdGxlTm9kZUlkOiAnJ30pXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJlbmRlcigpXHJcbiAgICB9LCBmYWxzZSlcclxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwib3JpZW50YXRpb25jaGFuZ2VcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmVuZGVyKClcclxuICAgIH0sIGZhbHNlKVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChlKT0+e1xyXG4gICAgICAgIC8vIDgzIC0gc1xyXG4gICAgICAgIC8vIDkwIC0gelxyXG4gICAgICAgIC8vIDg5IC0geVxyXG4gICAgICAgIC8vIDMyIC0gc3BhY2VcclxuICAgICAgICAvLyAxMyAtIGVudGVyXHJcbiAgICAgICAgLy8gMjcgLSBlc2NhcGVcclxuICAgICAgICBpZihlLndoaWNoID09PSA4MyAmJiAobmF2aWdhdG9yLnBsYXRmb3JtLm1hdGNoKFwiTWFjXCIpID8gZS5tZXRhS2V5IDogZS5jdHJsS2V5KSkge1xyXG4gICAgICAgICAgICAvLyBUT0RPIGdhcmJhZ2UgY29sbGVjdFxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGZldGNoKCcvc2F2ZScsIHttZXRob2Q6ICdQT1NUJywgYm9keTogSlNPTi5zdHJpbmdpZnkoc3RhdGUuZGVmaW5pdGlvbiksIGhlYWRlcnM6IHtcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIn19KVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKGUud2hpY2ggPT09IDMyICYmIChuYXZpZ2F0b3IucGxhdGZvcm0ubWF0Y2goXCJNYWNcIikgPyBlLm1ldGFLZXkgOiBlLmN0cmxLZXkpKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICBGUkVFWkVSX0NMSUNLRUQoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZighZS5zaGlmdEtleSAmJiBlLndoaWNoID09PSA5MCAmJiAobmF2aWdhdG9yLnBsYXRmb3JtLm1hdGNoKFwiTWFjXCIpID8gZS5tZXRhS2V5IDogZS5jdHJsS2V5KSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRJbmRleCA9IHN0YXRlU3RhY2suZmluZEluZGV4KChhKT0+YT09PXN0YXRlLmRlZmluaXRpb24pXHJcbiAgICAgICAgICAgIGlmKGN1cnJlbnRJbmRleCA+IDApe1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3RGVmaW5pdGlvbiA9IHN0YXRlU3RhY2tbY3VycmVudEluZGV4LTFdXHJcbiAgICAgICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IG5ld0RlZmluaXRpb259LCB0cnVlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKChlLndoaWNoID09PSA4OSAmJiAobmF2aWdhdG9yLnBsYXRmb3JtLm1hdGNoKFwiTWFjXCIpID8gZS5tZXRhS2V5IDogZS5jdHJsS2V5KSkgfHwgKGUuc2hpZnRLZXkgJiYgZS53aGljaCA9PT0gOTAgJiYgKG5hdmlnYXRvci5wbGF0Zm9ybS5tYXRjaChcIk1hY1wiKSA/IGUubWV0YUtleSA6IGUuY3RybEtleSkpKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudEluZGV4ID0gc3RhdGVTdGFjay5maW5kSW5kZXgoKGEpPT5hPT09c3RhdGUuZGVmaW5pdGlvbilcclxuICAgICAgICAgICAgaWYoY3VycmVudEluZGV4IDwgc3RhdGVTdGFjay5sZW5ndGgtMSl7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdEZWZpbml0aW9uID0gc3RhdGVTdGFja1tjdXJyZW50SW5kZXgrMV1cclxuICAgICAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjogbmV3RGVmaW5pdGlvbn0sIHRydWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoZS53aGljaCA9PT0gMTMpIHtcclxuICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBlZGl0aW5nVGl0bGVOb2RlSWQ6ICcnfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoZS53aGljaCA9PT0gMjcpIHtcclxuICAgICAgICAgICAgRlVMTF9TQ1JFRU5fQ0xJQ0tFRChmYWxzZSlcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG5cclxuICAgIC8vIExpc3RlbiB0byBhcHBcclxuICAgIGFwcC5hZGRMaXN0ZW5lcigoZXZlbnRJZCwgZGF0YSwgZSwgcHJldmlvdXNTdGF0ZSwgY3VycmVudFN0YXRlLCBtdXRhdGlvbnMpPT57XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBldmVudFN0YWNrOiBzdGF0ZS5ldmVudFN0YWNrLmNvbmNhdCh7ZXZlbnRJZCwgZGF0YSwgZSwgcHJldmlvdXNTdGF0ZSwgY3VycmVudFN0YXRlLCBtdXRhdGlvbnN9KX0pXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIEFjdGlvbnNcclxuICAgIGxldCBvcGVuQm94VGltZW91dCA9IG51bGxcclxuICAgIGZ1bmN0aW9uIFZJRVdfRFJBR0dFRChub2RlUmVmLCBwYXJlbnRSZWYsIGluaXRpYWxEZXB0aCwgZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIGNvbnN0IGlzQXJyb3cgPSBlLnRhcmdldC5kYXRhc2V0LmNsb3NlYXJyb3dcclxuICAgICAgICBjb25zdCBpc1RyYXNoY2FuID0gZS50YXJnZXQuZGF0YXNldC50cmFzaGNhblxyXG4gICAgICAgIGNvbnN0IGluaXRpYWxYID0gZS50b3VjaGVzPyBlLnRvdWNoZXNbMF0ucGFnZVg6IGUucGFnZVhcclxuICAgICAgICBjb25zdCBpbml0aWFsWSA9IGUudG91Y2hlcz8gZS50b3VjaGVzWzBdLnBhZ2VZOiBlLnBhZ2VZXHJcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLmVsbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxyXG4gICAgICAgIGNvbnN0IG9mZnNldFggPSBpbml0aWFsWCAtIHBvc2l0aW9uLmxlZnRcclxuICAgICAgICBjb25zdCBvZmZzZXRZID0gaW5pdGlhbFkgLSBwb3NpdGlvbi50b3BcclxuICAgICAgICBmdW5jdGlvbiBkcmFnKGUpe1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgY29uc3QgeCA9IGUudG91Y2hlcz8gZS50b3VjaGVzWzBdLnBhZ2VYOiBlLnBhZ2VYXHJcbiAgICAgICAgICAgIGNvbnN0IHkgPSBlLnRvdWNoZXM/IGUudG91Y2hlc1swXS5wYWdlWTogZS5wYWdlWVxyXG4gICAgICAgICAgICBpZighc3RhdGUuZHJhZ2dlZENvbXBvbmVudFZpZXcpe1xyXG4gICAgICAgICAgICAgICAgaWYoTWF0aC5hYnMoaW5pdGlhbFkteSkgPiAzKXtcclxuICAgICAgICAgICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRyYWdnZWRDb21wb25lbnRWaWV3OiB7Li4ubm9kZVJlZiwgZGVwdGg6IGluaXRpYWxEZXB0aH0sIG1vdXNlUG9zaXRpb246IHt4OiB4IC0gb2Zmc2V0WCwgeTogeSAtIG9mZnNldFl9fSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgbW91c2VQb3NpdGlvbjoge3g6IHggLSBvZmZzZXRYLCB5OiB5IC0gb2Zmc2V0WX19KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZHJhZylcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZHJhZylcclxuICAgICAgICBmdW5jdGlvbiBzdG9wRHJhZ2dpbmcoZXZlbnQpe1xyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBkcmFnKVxyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZHJhZylcclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBzdG9wRHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHN0b3BEcmFnZ2luZylcclxuICAgICAgICAgICAgaWYob3BlbkJveFRpbWVvdXQpe1xyXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KG9wZW5Cb3hUaW1lb3V0KVxyXG4gICAgICAgICAgICAgICAgb3BlbkJveFRpbWVvdXQgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoIXN0YXRlLmRyYWdnZWRDb21wb25lbnRWaWV3KXtcclxuICAgICAgICAgICAgICAgIGlmKGV2ZW50LnRhcmdldCA9PT0gZS50YXJnZXQgJiYgaXNBcnJvdyl7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFZJRVdfRk9MREVSX0NMSUNLRUQobm9kZVJlZi5pZClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmKGV2ZW50LnRhcmdldCA9PT0gZS50YXJnZXQgJiYgaXNUcmFzaGNhbil7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIERFTEVURV9TRUxFQ1RFRF9WSUVXKG5vZGVSZWYsIHBhcmVudFJlZilcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBWSUVXX05PREVfU0VMRUNURUQobm9kZVJlZilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZighc3RhdGUuaG92ZXJlZFZpZXdOb2RlKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRyYWdnZWRDb21wb25lbnRWaWV3OiBudWxsLH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbmV3UGFyZW50UmVmID0gc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBhcmVudFxyXG4gICAgICAgICAgICAvLyBmcmFtZSB0aGlzIHNvbWV3aGVyZSBvbiBob3cgbm90IHRvIHdyaXRlIGNvZGVcclxuICAgICAgICAgICAgY29uc3QgZml4ZWRQYXJlbnRzID0ge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBkcmFnZ2VkQ29tcG9uZW50VmlldzogbnVsbCxcclxuICAgICAgICAgICAgICAgIGhvdmVyZWRWaWV3Tm9kZTogbnVsbCxcclxuICAgICAgICAgICAgICAgIGRlZmluaXRpb246IHBhcmVudFJlZi5pZCA9PT0gbmV3UGFyZW50UmVmLmlkID8geyAvLyBtb3ZpbmcgaW4gdGhlIHNhbWUgcGFyZW50XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBbcGFyZW50UmVmLnJlZl06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgW3BhcmVudFJlZi5pZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb25bcGFyZW50UmVmLnJlZl1bcGFyZW50UmVmLmlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBtb3ZlSW5BcnJheShzdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdW3BhcmVudFJlZi5pZF0uY2hpbGRyZW4sIHN0YXRlLmRlZmluaXRpb25bcGFyZW50UmVmLnJlZl1bcGFyZW50UmVmLmlkXS5jaGlsZHJlbi5maW5kSW5kZXgoKHJlZik9PiByZWYuaWQgPT09IG5vZGVSZWYuaWQpLCBzdGF0ZS5ob3ZlcmVkVmlld05vZGUucG9zaXRpb24pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IDogcGFyZW50UmVmLnJlZiA9PT0gbmV3UGFyZW50UmVmLnJlZiA/IHsgLy8gbW92aW5nIGluIHRoZSBzaW1pbGFyIHBhcmVudCAoc2FtZSB0eXBlKVxyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgW3BhcmVudFJlZi5yZWZdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb25bcGFyZW50UmVmLnJlZl0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtwYXJlbnRSZWYuaWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdW3BhcmVudFJlZi5pZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbjogc3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXVtwYXJlbnRSZWYuaWRdLmNoaWxkcmVuLmZpbHRlcigocmVmKT0+IHJlZi5pZCAhPT0gbm9kZVJlZi5pZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgW25ld1BhcmVudFJlZi5pZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb25bbmV3UGFyZW50UmVmLnJlZl1bbmV3UGFyZW50UmVmLmlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uW25ld1BhcmVudFJlZi5yZWZdW25ld1BhcmVudFJlZi5pZF0uY2hpbGRyZW4uc2xpY2UoMCwgc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBvc2l0aW9uKS5jb25jYXQobm9kZVJlZiwgc3RhdGUuZGVmaW5pdGlvbltuZXdQYXJlbnRSZWYucmVmXVtuZXdQYXJlbnRSZWYuaWRdLmNoaWxkcmVuLnNsaWNlKHN0YXRlLmhvdmVyZWRWaWV3Tm9kZS5wb3NpdGlvbikpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgfSA6IHsgLy8gbW92aW5nIHRvIGEgbmV3IHR5cGUgcGFyZW50XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBbcGFyZW50UmVmLnJlZl06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgW3BhcmVudFJlZi5pZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb25bcGFyZW50UmVmLnJlZl1bcGFyZW50UmVmLmlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdW3BhcmVudFJlZi5pZF0uY2hpbGRyZW4uZmlsdGVyKChyZWYpPT4gcmVmLmlkICE9PSBub2RlUmVmLmlkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgW25ld1BhcmVudFJlZi5yZWZdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb25bbmV3UGFyZW50UmVmLnJlZl0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtuZXdQYXJlbnRSZWYuaWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uW25ld1BhcmVudFJlZi5yZWZdW25ld1BhcmVudFJlZi5pZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbjogc3RhdGUuZGVmaW5pdGlvbltuZXdQYXJlbnRSZWYucmVmXVtuZXdQYXJlbnRSZWYuaWRdLmNoaWxkcmVuLnNsaWNlKDAsIHN0YXRlLmhvdmVyZWRWaWV3Tm9kZS5wb3NpdGlvbikuY29uY2F0KG5vZGVSZWYsIHN0YXRlLmRlZmluaXRpb25bbmV3UGFyZW50UmVmLnJlZl1bbmV3UGFyZW50UmVmLmlkXS5jaGlsZHJlbi5zbGljZShzdGF0ZS5ob3ZlcmVkVmlld05vZGUucG9zaXRpb24pKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2V0U3RhdGUoe1xyXG4gICAgICAgICAgICAgICAgLi4uZml4ZWRQYXJlbnRzLFxyXG4gICAgICAgICAgICAgICAgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLmZpeGVkUGFyZW50cy5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIFtub2RlUmVmLnJlZl06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uZml4ZWRQYXJlbnRzLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBbbm9kZVJlZi5pZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLmZpeGVkUGFyZW50cy5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlUmVmLmlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudDogbmV3UGFyZW50UmVmXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBzdG9wRHJhZ2dpbmcpXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgc3RvcERyYWdnaW5nKVxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIEhPVkVSX01PQklMRShlKSB7XHJcbiAgICAgICAgY29uc3QgZWxlbSA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoZS50b3VjaGVzWzBdLmNsaWVudFgsIGUudG91Y2hlc1swXS5jbGllbnRZKVxyXG4gICAgICAgIGNvbnN0IG1vdmVFdmVudCA9IG5ldyBNb3VzZUV2ZW50KCdtb3VzZW1vdmUnLCB7XHJcbiAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXHJcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIHZpZXc6IHdpbmRvdyxcclxuICAgICAgICAgICAgY2xpZW50WDogZS50b3VjaGVzWzBdLmNsaWVudFgsXHJcbiAgICAgICAgICAgIGNsaWVudFk6IGUudG91Y2hlc1swXS5jbGllbnRZLFxyXG4gICAgICAgICAgICBzY3JlZW5YOiBlLnRvdWNoZXNbMF0uc2NyZWVuWCxcclxuICAgICAgICAgICAgc2NyZWVuWTogZS50b3VjaGVzWzBdLnNjcmVlblksXHJcbiAgICAgICAgfSlcclxuICAgICAgICBlbGVtLmRpc3BhdGNoRXZlbnQobW92ZUV2ZW50KVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIFZJRVdfSE9WRVJFRChub2RlUmVmLCBwYXJlbnRSZWYsIGRlcHRoLCBlKSB7XHJcbiAgICAgICAgaWYoIXN0YXRlLmRyYWdnZWRDb21wb25lbnRWaWV3KXtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBoaXRQb3NpdGlvbiA9IChlLnRvdWNoZXM/IDI4OiBlLmxheWVyWSkgLyAyOFxyXG4gICAgICAgIGNvbnN0IGluc2VydEJlZm9yZSAgPSAoKT0+IHNldFN0YXRlKHsuLi5zdGF0ZSwgaG92ZXJlZFZpZXdOb2RlOiB7cGFyZW50OiBwYXJlbnRSZWYsIGRlcHRoLCBwb3NpdGlvbjogc3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXVtwYXJlbnRSZWYuaWRdLmNoaWxkcmVuLmZpbHRlcigocmVmKT0+IHJlZi5pZCAhPT0gc3RhdGUuZHJhZ2dlZENvbXBvbmVudFZpZXcuaWQpLmZpbmRJbmRleCgocmVmKT0+cmVmLmlkID09PSBub2RlUmVmLmlkKX19KVxyXG4gICAgICAgIGNvbnN0IGluc2VydEFmdGVyICAgPSAoKT0+IHNldFN0YXRlKHsuLi5zdGF0ZSwgaG92ZXJlZFZpZXdOb2RlOiB7cGFyZW50OiBwYXJlbnRSZWYsIGRlcHRoLCBwb3NpdGlvbjogc3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXVtwYXJlbnRSZWYuaWRdLmNoaWxkcmVuLmZpbHRlcigocmVmKT0+IHJlZi5pZCAhPT0gc3RhdGUuZHJhZ2dlZENvbXBvbmVudFZpZXcuaWQpLmZpbmRJbmRleCgocmVmKT0+cmVmLmlkID09PSBub2RlUmVmLmlkKSArIDF9fSlcclxuICAgICAgICBjb25zdCBpbnNlcnRBc0ZpcnN0ID0gKCk9PiBzZXRTdGF0ZSh7Li4uc3RhdGUsIGhvdmVyZWRWaWV3Tm9kZToge3BhcmVudDogbm9kZVJlZiwgZGVwdGg6IGRlcHRoKzEsIHBvc2l0aW9uOiAwfX0pXHJcbiAgICAgICAgY29uc3QgaW5zZXJ0QXNMYXN0ID0gKCk9PiBzZXRTdGF0ZSh7Li4uc3RhdGUsIGhvdmVyZWRWaWV3Tm9kZToge3BhcmVudDoge3JlZjogJ3ZOb2RlQm94JywgaWQ6ICdfcm9vdE5vZGUnfSwgZGVwdGg6IDEsIHBvc2l0aW9uOiBzdGF0ZS5kZWZpbml0aW9uWyd2Tm9kZUJveCddWydfcm9vdE5vZGUnXS5jaGlsZHJlbi5sZW5ndGh9fSlcclxuICAgICAgICBjb25zdCBpbnNlcnRBdCA9ICh0b1B1dFJlZiwgaW5kZXgpPT4gc2V0U3RhdGUoey4uLnN0YXRlLCBob3ZlcmVkVmlld05vZGU6IHtwYXJlbnQ6IHRvUHV0UmVmLCBkZXB0aDogZGVwdGgtMSwgcG9zaXRpb246IGluZGV4KzF9fSlcclxuXHJcbiAgICAgICAgaWYobm9kZVJlZi5pZCA9PT0gc3RhdGUuZHJhZ2dlZENvbXBvbmVudFZpZXcuaWQpe1xyXG4gICAgICAgICAgICBjb25zdCBwYXJlbnQgPSBzdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdW3BhcmVudFJlZi5pZF1cclxuICAgICAgICAgICAgLy8gY2hlY2sgaWYgdGhlIGxhc3QgY2hpbGQsIGlmIHllcywgZ28gdG8gZ3JhbmRwYXJlbnQgYW5kIGRyb3AgdGhlcmUgYWZ0ZXIgcGFyZW50XHJcbiAgICAgICAgICAgIGlmKHBhcmVudC5jaGlsZHJlbltwYXJlbnQuY2hpbGRyZW4ubGVuZ3RoIC0gMV0uaWQgPT09IG5vZGVSZWYuaWQpe1xyXG4gICAgICAgICAgICAgICAgaWYocGFyZW50UmVmLmlkICE9PSAnX3Jvb3ROb2RlJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGdyYW5kcGFyZW50ID0gc3RhdGUuZGVmaW5pdGlvbltwYXJlbnQucGFyZW50LnJlZl1bcGFyZW50LnBhcmVudC5pZF1cclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJlbnRQb3NpdGlvbiA9IGdyYW5kcGFyZW50LmNoaWxkcmVuLmZpbmRJbmRleCgoY2hpbGRSZWYpPT4gY2hpbGRSZWYuaWQgPT09IHBhcmVudFJlZi5pZClcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaW5zZXJ0QXQocGFyZW50LnBhcmVudCwgcGFyZW50UG9zaXRpb24pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNldFN0YXRlKHsuLi5zdGF0ZSwgaG92ZXJlZFZpZXdOb2RlOiBudWxsLH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKG5vZGVSZWYuaWQgPT09ICdfcm9vdE5vZGUnKXtcclxuICAgICAgICAgICAgcmV0dXJuIGluc2VydEFzRmlyc3QoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZihub2RlUmVmLmlkID09PSAnX2xhc3ROb2RlJyl7XHJcbiAgICAgICAgICAgIHJldHVybiBpbnNlcnRBc0xhc3QoKVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBwcmF5IHRvIGdvZCB0aGF0IHlvdSBkaWQgbm90IG1ha2UgYSBtaXN0YWtlIGhlcmVcclxuICAgICAgICBpZihzdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlUmVmLmlkXS5jaGlsZHJlbil7IC8vIGlmIGJveFxyXG4gICAgICAgICAgICBpZihzdGF0ZS52aWV3Rm9sZGVyc0Nsb3NlZFtub2RlUmVmLmlkXSB8fCBzdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlUmVmLmlkXS5jaGlsZHJlbi5sZW5ndGggPT09IDApeyAvLyBpZiBjbG9zZWQgb3IgZW1wdHkgYm94XHJcbiAgICAgICAgICAgICAgICBpZihoaXRQb3NpdGlvbiA8IDAuMyl7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5zZXJ0QmVmb3JlKClcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoIW9wZW5Cb3hUaW1lb3V0KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3BlbkJveFRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpPT5WSUVXX0ZPTERFUl9DTElDS0VEKG5vZGVSZWYuaWQsIGZhbHNlKSwgNTAwKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpbnNlcnRBc0ZpcnN0KClcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHsgLy8gb3BlbiBib3hcclxuICAgICAgICAgICAgICAgIGlmKGhpdFBvc2l0aW9uIDwgMC41KXtcclxuICAgICAgICAgICAgICAgICAgICBpbnNlcnRCZWZvcmUoKVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnNlcnRBc0ZpcnN0KClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7IC8vIHNpbXBsZSBub2RlXHJcbiAgICAgICAgICAgIGlmKGhpdFBvc2l0aW9uIDwgMC41KXtcclxuICAgICAgICAgICAgICAgIGluc2VydEJlZm9yZSgpXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpbnNlcnRBZnRlcigpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYob3BlbkJveFRpbWVvdXQpe1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQob3BlbkJveFRpbWVvdXQpXHJcbiAgICAgICAgICAgIG9wZW5Cb3hUaW1lb3V0ID0gbnVsbFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBQSVBFX0hPVkVSRUQocGlwZVJlZiwgZSkge1xyXG4gICAgICAgIGlmKCFzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50U3RhdGVJZCl7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBob3ZlcmVkUGlwZTogcGlwZVJlZn0pXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gQ09NUE9ORU5UX1ZJRVdfRFJBR0dFRChlKSB7XHJcbiAgICAgICAgY29uc3QgaW5pdGlhbFggPSBlLnRvdWNoZXMgPyBlLnRvdWNoZXNbMF0ucGFnZVggOiBlLnBhZ2VYXHJcbiAgICAgICAgY29uc3QgaW5pdGlhbFkgPSBlLnRvdWNoZXMgPyBlLnRvdWNoZXNbMF0ucGFnZVkgOiBlLnBhZ2VZXHJcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLmVsbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxyXG4gICAgICAgIGNvbnN0IG9mZnNldFggPSBpbml0aWFsWCAtIHBvc2l0aW9uLmxlZnRcclxuICAgICAgICBjb25zdCBvZmZzZXRZID0gaW5pdGlhbFkgLSBwb3NpdGlvbi50b3BcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZHJhZyhlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICBjb25zdCB4ID0gZS50b3VjaGVzID8gZS50b3VjaGVzWzBdLnBhZ2VYIDogZS5wYWdlWFxyXG4gICAgICAgICAgICBjb25zdCB5ID0gZS50b3VjaGVzID8gZS50b3VjaGVzWzBdLnBhZ2VZIDogZS5wYWdlWVxyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZSxcclxuICAgICAgICAgICAgICAgIGNvbXBvbmVudEVkaXRvclBvc2l0aW9uOiB7eDogeCAtIG9mZnNldFgsIHk6IHkgLSBvZmZzZXRZfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZHJhZylcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZHJhZylcclxuICAgICAgICBmdW5jdGlvbiBzdG9wRHJhZ2dpbmcoZXZlbnQpIHtcclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZHJhZylcclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGRyYWcpXHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgc3RvcERyYWdnaW5nKVxyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBzdG9wRHJhZ2dpbmcpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgc3RvcERyYWdnaW5nKVxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHN0b3BEcmFnZ2luZylcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFdJRFRIX0RSQUdHRUQod2lkdGhOYW1lLCBlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgZnVuY3Rpb24gcmVzaXplKGUpe1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgLy8gVE9ETyByZWZhY3RvclxyXG4gICAgICAgICAgICBsZXQgbmV3V2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCAtIChlLnRvdWNoZXM/IGUudG91Y2hlc1swXS5wYWdlWDogZS5wYWdlWClcclxuICAgICAgICAgICAgaWYod2lkdGhOYW1lID09PSAnZWRpdG9yTGVmdFdpZHRoJyl7XHJcbiAgICAgICAgICAgICAgICBuZXdXaWR0aCA9IGUudG91Y2hlcz8gZS50b3VjaGVzWzBdLnBhZ2VYOiBlLnBhZ2VYXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYod2lkdGhOYW1lID09PSAnc3ViRWRpdG9yV2lkdGgnKXtcclxuICAgICAgICAgICAgICAgIG5ld1dpZHRoID0gKGUudG91Y2hlcz8gZS50b3VjaGVzWzBdLnBhZ2VYOiBlLnBhZ2VYKSAtIHN0YXRlLmNvbXBvbmVudEVkaXRvclBvc2l0aW9uLnhcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZih3aWR0aE5hbWUgPT09ICdzdWJFZGl0b3JXaWR0aExlZnQnKXtcclxuICAgICAgICAgICAgICAgIG5ld1dpZHRoID0gc3RhdGUuY29tcG9uZW50RWRpdG9yUG9zaXRpb24ueCArIHN0YXRlLnN1YkVkaXRvcldpZHRoIC0gKGUudG91Y2hlcz8gZS50b3VjaGVzWzBdLnBhZ2VYOiBlLnBhZ2VYKVxyXG4gICAgICAgICAgICAgICAgaWYobmV3V2lkdGggPCAyNTApe1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNldFN0YXRlKHsuLi5zdGF0ZSwgc3ViRWRpdG9yV2lkdGg6IG5ld1dpZHRoLCBjb21wb25lbnRFZGl0b3JQb3NpdGlvbjogey4uLnN0YXRlLmNvbXBvbmVudEVkaXRvclBvc2l0aW9uLCB4OiBlLnRvdWNoZXM/IGUudG91Y2hlc1swXS5wYWdlWDogZS5wYWdlWH19KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIEkgcHJvYmFibHkgd2FzIGRydW5rXHJcbiAgICAgICAgICAgIGlmKHdpZHRoTmFtZSAhPT0gJ3N1YkVkaXRvcldpZHRoJyAmJiB3aWR0aE5hbWUgIT09ICdzdWJFZGl0b3JXaWR0aCcgJiYgKCAod2lkdGhOYW1lID09PSAnZWRpdG9yTGVmdFdpZHRoJyA/IHN0YXRlLmxlZnRPcGVuOiBzdGF0ZS5yaWdodE9wZW4pID8gbmV3V2lkdGggPCAxODA6IG5ld1dpZHRoID4gMTgwKSl7XHJcbiAgICAgICAgICAgICAgICBpZih3aWR0aE5hbWUgPT09ICdlZGl0b3JMZWZ0V2lkdGgnKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0U3RhdGUoey4uLnN0YXRlLCBsZWZ0T3BlbjogIXN0YXRlLmxlZnRPcGVufSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBzZXRTdGF0ZSh7Li4uc3RhdGUsIHJpZ2h0T3BlbjogIXN0YXRlLnJpZ2h0T3Blbn0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYobmV3V2lkdGggPCAyNTApe1xyXG4gICAgICAgICAgICAgICAgbmV3V2lkdGggPSAyNTBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIFt3aWR0aE5hbWVdOiBuZXdXaWR0aH0pXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgcmVzaXplKVxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCByZXNpemUpXHJcbiAgICAgICAgZnVuY3Rpb24gc3RvcERyYWdnaW5nKGUpe1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHJlc2l6ZSlcclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHJlc2l6ZSlcclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBzdG9wRHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHN0b3BEcmFnZ2luZylcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgc3RvcERyYWdnaW5nKVxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHN0b3BEcmFnZ2luZylcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBTVEFURV9EUkFHR0VEKHN0YXRlSWQsIGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICBjb25zdCBpbml0aWFsWCA9IGUudG91Y2hlcz8gZS50b3VjaGVzWzBdLnBhZ2VYOiBlLnBhZ2VYXHJcbiAgICAgICAgY29uc3QgaW5pdGlhbFkgPSBlLnRvdWNoZXM/IGUudG91Y2hlc1swXS5wYWdlWTogZS5wYWdlWVxyXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5lbG0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcclxuICAgICAgICBjb25zdCBvZmZzZXRYID0gaW5pdGlhbFggLSBwb3NpdGlvbi5sZWZ0XHJcbiAgICAgICAgY29uc3Qgb2Zmc2V0WSA9IGluaXRpYWxZIC0gcG9zaXRpb24udG9wXHJcbiAgICAgICAgZnVuY3Rpb24gZHJhZyhlKXtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIGNvbnN0IHggPSBlLnRvdWNoZXM/IGUudG91Y2hlc1swXS5wYWdlWDogZS5wYWdlWFxyXG4gICAgICAgICAgICBjb25zdCB5ID0gZS50b3VjaGVzPyBlLnRvdWNoZXNbMF0ucGFnZVk6IGUucGFnZVlcclxuICAgICAgICAgICAgaWYoIXN0YXRlLmRyYWdnZWRDb21wb25lbnRWaWV3KXtcclxuICAgICAgICAgICAgICAgIGlmKE1hdGguYWJzKGluaXRpYWxZLXkpID4gMyl7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkcmFnZ2VkQ29tcG9uZW50U3RhdGVJZDogc3RhdGVJZCwgbW91c2VQb3NpdGlvbjoge3g6IHggLSBvZmZzZXRYLCB5OiB5IC0gb2Zmc2V0WX19KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBtb3VzZVBvc2l0aW9uOiB7eDogeCAtIG9mZnNldFgsIHk6IHkgLSBvZmZzZXRZfX0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBkcmFnKVxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBkcmFnKVxyXG4gICAgICAgIGZ1bmN0aW9uIHN0b3BEcmFnZ2luZyhldmVudCl7XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGRyYWcpXHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBkcmFnKVxyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHN0b3BEcmFnZ2luZylcclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgc3RvcERyYWdnaW5nKVxyXG4gICAgICAgICAgICBpZighc3RhdGUuZHJhZ2dlZENvbXBvbmVudFN0YXRlSWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBTVEFURV9OT0RFX1NFTEVDVEVEKHN0YXRlSWQpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoIXN0YXRlLmhvdmVyZWRQaXBlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2V0U3RhdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnZWRDb21wb25lbnRTdGF0ZUlkOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIGhvdmVyZWRQaXBlOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBwaXBlRHJvcHBlZCA9IHN0YXRlLmRlZmluaXRpb24ucGlwZVtzdGF0ZS5ob3ZlcmVkUGlwZS5pZF1cclxuICAgICAgICAgICAgaWYocGlwZURyb3BwZWQudHlwZSA9PT0gJ3RleHQnKXtcclxuICAgICAgICAgICAgICAgIGlmKHN0YXRlLmRlZmluaXRpb24ucGlwZVtzdGF0ZS5ob3ZlcmVkUGlwZS5pZF0udmFsdWUucmVmICYmIHN0YXRlLmRlZmluaXRpb24ucGlwZVtzdGF0ZS5ob3ZlcmVkUGlwZS5pZF0udmFsdWUucmVmID09PSAnc3RhdGUnKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0U3RhdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ2dlZENvbXBvbmVudFN0YXRlSWQ6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvdmVyZWRQaXBlOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZpbml0aW9uIDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBpcGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW3N0YXRlLmhvdmVyZWRQaXBlLmlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGVbc3RhdGUuaG92ZXJlZFBpcGUuaWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToge3JlZjogJ3N0YXRlJywgaWQ6c3RhdGUuZHJhZ2dlZENvbXBvbmVudFN0YXRlSWR9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3Qgam9pbklkU3RhdGUgPSB1dWlkKClcclxuICAgICAgICAgICAgICAgIGNvbnN0IGpvaW5JZFRleHQgPSB1dWlkKClcclxuICAgICAgICAgICAgICAgIGNvbnN0IHBpcGVJZFN0YXRlID0gdXVpZCgpXHJcbiAgICAgICAgICAgICAgICBjb25zdCBwaXBlSWRUZXh0ID0gdXVpZCgpXHJcbiAgICAgICAgICAgICAgICBzZXRTdGF0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dlZENvbXBvbmVudFN0YXRlSWQ6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgaG92ZXJlZFBpcGU6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVmaW5pdGlvbiA6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGlwZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW3N0YXRlLmhvdmVyZWRQaXBlLmlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZVtzdGF0ZS5ob3ZlcmVkUGlwZS5pZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBbe3JlZjogJ2pvaW4nLCBpZDogam9pbklkU3RhdGV9LCB7cmVmOiAnam9pbicsIGlkOiBqb2luSWRUZXh0fV0uY29uY2F0KHN0YXRlLmRlZmluaXRpb24ucGlwZVtzdGF0ZS5ob3ZlcmVkUGlwZS5pZF0udHJhbnNmb3JtYXRpb25zKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtwaXBlSWRTdGF0ZV06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6ICdzdGF0ZScsIGlkOnN0YXRlLmRyYWdnZWRDb21wb25lbnRTdGF0ZUlkfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW3BpcGVJZFRleHRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBqb2luOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLmpvaW4sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbam9pbklkU3RhdGVdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6ICdwaXBlJywgaWQ6IHBpcGVJZFN0YXRlfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtqb2luSWRUZXh0XToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7cmVmOiAncGlwZScsIGlkOiBwaXBlSWRUZXh0fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHBpcGVEcm9wcGVkLnR5cGUgPT09ICdudW1iZXInKXtcclxuICAgICAgICAgICAgICAgIC8vIHlvdSBjYW4ndCBkcm9wIGJvb2xlYW4gaW50byBudW1iZXJcclxuICAgICAgICAgICAgICAgIGlmKHN0YXRlLmRlZmluaXRpb24uc3RhdGVbc3RhdGUuZHJhZ2dlZENvbXBvbmVudFN0YXRlSWRdLnR5cGUgPT09ICdib29sZWFuJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldFN0YXRlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdnZWRDb21wb25lbnRTdGF0ZUlkOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBob3ZlcmVkUGlwZTogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8geW91IGNhbid0IGRyb3AgYm9vbGVhbiBpbnRvIG51bWJlclxyXG4gICAgICAgICAgICAgICAgaWYoc3RhdGUuZGVmaW5pdGlvbi5zdGF0ZVtzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50U3RhdGVJZF0udHlwZSA9PT0gJ3RleHQnKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0U3RhdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ2dlZENvbXBvbmVudFN0YXRlSWQ6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvdmVyZWRQaXBlOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZpbml0aW9uIDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBpcGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW3N0YXRlLmhvdmVyZWRQaXBlLmlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGVbc3RhdGUuaG92ZXJlZFBpcGUuaWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToge3JlZjogJ3N0YXRlJywgaWQ6c3RhdGUuZHJhZ2dlZENvbXBvbmVudFN0YXRlSWR9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY6ICdsZW5ndGgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6ICdub29wJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHNldFN0YXRlKHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICBkcmFnZ2VkQ29tcG9uZW50U3RhdGVJZDogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBob3ZlcmVkUGlwZTogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBkZWZpbml0aW9uIDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwaXBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbc3RhdGUuaG92ZXJlZFBpcGUuaWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlW3N0YXRlLmhvdmVyZWRQaXBlLmlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToge3JlZjogJ3N0YXRlJywgaWQ6c3RhdGUuZHJhZ2dlZENvbXBvbmVudFN0YXRlSWR9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYocGlwZURyb3BwZWQudHlwZSA9PT0gJ2Jvb2xlYW4nKXtcclxuICAgICAgICAgICAgICAgIGlmKHN0YXRlLmRlZmluaXRpb24uc3RhdGVbc3RhdGUuZHJhZ2dlZENvbXBvbmVudFN0YXRlSWRdLnR5cGUgPT09ICdudW1iZXInKXtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlcUlkID0gdXVpZCgpXHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGlwZUlkID0gdXVpZCgpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldFN0YXRlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRyYWdnZWRDb21wb25lbnRTdGF0ZUlkOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBob3ZlcmVkUGlwZTogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVmaW5pdGlvbiA6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwaXBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtzdGF0ZS5ob3ZlcmVkUGlwZS5pZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlW3N0YXRlLmhvdmVyZWRQaXBlLmlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6ICdzdGF0ZScsIGlkOnN0YXRlLmRyYWdnZWRDb21wb25lbnRTdGF0ZUlkfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiAnZXF1YWwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGVxSWRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfV1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtwaXBlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXF1YWw6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLmVxdWFsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtlcUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiAncGlwZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogcGlwZUlkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyB5b3UgY2FuJ3QgZHJvcCBib29sZWFuIGludG8gbnVtYmVyXHJcbiAgICAgICAgICAgICAgICBpZihzdGF0ZS5kZWZpbml0aW9uLnN0YXRlW3N0YXRlLmRyYWdnZWRDb21wb25lbnRTdGF0ZUlkXS50eXBlID09PSAndGV4dCcpe1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVxSWQgPSB1dWlkKClcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwaXBlSWQgPSB1dWlkKClcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2V0U3RhdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZHJhZ2dlZENvbXBvbmVudFN0YXRlSWQ6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhvdmVyZWRQaXBlOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWZpbml0aW9uIDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBpcGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW3N0YXRlLmhvdmVyZWRQaXBlLmlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGVbc3RhdGUuaG92ZXJlZFBpcGUuaWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToge3JlZjogJ3N0YXRlJywgaWQ6c3RhdGUuZHJhZ2dlZENvbXBvbmVudFN0YXRlSWR9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY6ICdlcXVhbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogZXFJZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW3BpcGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ0RlZmF1bHQgdGV4dCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVxdWFsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5lcXVhbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbZXFJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogJ3BpcGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHBpcGVJZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc2V0U3RhdGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLFxyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdnZWRDb21wb25lbnRTdGF0ZUlkOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIGhvdmVyZWRQaXBlOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlZmluaXRpb24gOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBpcGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtzdGF0ZS5ob3ZlcmVkUGlwZS5pZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGVbc3RhdGUuaG92ZXJlZFBpcGUuaWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7cmVmOiAnc3RhdGUnLCBpZDpzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50U3RhdGVJZH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHN0b3BEcmFnZ2luZylcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBzdG9wRHJhZ2dpbmcpXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBPUEVOX1NJREVCQVIoc2lkZSkge1xyXG4gICAgICAgIGlmKHNpZGUgPT09ICdsZWZ0Jyl7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXRTdGF0ZSh7Li4uc3RhdGUsIGxlZnRPcGVuOiAhc3RhdGUubGVmdE9wZW59KVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZihzaWRlID09PSAncmlnaHQnKXtcclxuICAgICAgICAgICAgcmV0dXJuIHNldFN0YXRlKHsuLi5zdGF0ZSwgcmlnaHRPcGVuOiAhc3RhdGUucmlnaHRPcGVufSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBGUkVFWkVSX0NMSUNLRUQoKSB7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBhcHBJc0Zyb3plbjogIXN0YXRlLmFwcElzRnJvemVufSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFZJRVdfRk9MREVSX0NMSUNLRUQobm9kZUlkLCBmb3JjZWRWYWx1ZSkge1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgdmlld0ZvbGRlcnNDbG9zZWQ6ey4uLnN0YXRlLnZpZXdGb2xkZXJzQ2xvc2VkLCBbbm9kZUlkXTogZm9yY2VkVmFsdWUgIT09IHVuZGVmaW5lZCA/IGZvcmNlZFZhbHVlIDogIXN0YXRlLnZpZXdGb2xkZXJzQ2xvc2VkW25vZGVJZF19fSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFZJRVdfTk9ERV9TRUxFQ1RFRChyZWYpIHtcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIHNlbGVjdGVkVmlld05vZGU6cmVmfSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFVOU0VMRUNUX1ZJRVdfTk9ERShzZWxmT25seSwgc3RvcFByb3BhZ2F0aW9uLCBlKSB7XHJcbiAgICAgICAgaWYoc3RvcFByb3BhZ2F0aW9uKXtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZihzZWxmT25seSAmJiBlLnRhcmdldCAhPT0gdGhpcy5lbG0pe1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBzZWxlY3RlZFZpZXdOb2RlOnt9fSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFNUQVRFX05PREVfU0VMRUNURUQobm9kZUlkKSB7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBzZWxlY3RlZFN0YXRlTm9kZUlkOm5vZGVJZH0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBVTlNFTEVDVF9TVEFURV9OT0RFKGUpIHtcclxuICAgICAgICBpZihlLnRhcmdldCA9PT0gdGhpcy5lbG0pe1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIHNlbGVjdGVkU3RhdGVOb2RlSWQ6Jyd9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIEFERF9OT0RFKG5vZGVSZWYsIHR5cGUpIHtcclxuICAgICAgICBpZighbm9kZVJlZi5yZWYgfHwgIXN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVSZWYuaWRdIHx8ICFzdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlUmVmLmlkXS5jaGlsZHJlbil7XHJcbiAgICAgICAgICAgIGlmKHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgJiYgc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCAhPT0gJ19yb290Tm9kZScpe1xyXG4gICAgICAgICAgICAgICAgbm9kZVJlZiA9IHN0YXRlLmRlZmluaXRpb25bc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWZdW3N0YXRlLnNlbGVjdGVkVmlld05vZGUuaWRdLnBhcmVudFxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbm9kZVJlZiA9IHtyZWY6ICd2Tm9kZUJveCcsIGlkOiAnX3Jvb3ROb2RlJ31cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBub2RlSWQgPSBub2RlUmVmLmlkXHJcbiAgICAgICAgY29uc3QgbmV3Tm9kZUlkID0gdXVpZCgpXHJcbiAgICAgICAgY29uc3QgbmV3U3R5bGVJZCA9IHV1aWQoKVxyXG4gICAgICAgIGNvbnN0IG5ld1N0eWxlID0ge1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0eXBlID09PSAnYm94Jykge1xyXG4gICAgICAgICAgICBjb25zdCBuZXdOb2RlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdib3gnLFxyXG4gICAgICAgICAgICAgICAgcGFyZW50OiBub2RlUmVmLFxyXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtyZWY6J3N0eWxlJywgaWQ6bmV3U3R5bGVJZH0sXHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjogW10sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNldFN0YXRlKHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRWaWV3Tm9kZToge3JlZjondk5vZGVCb3gnLCBpZDogbmV3Tm9kZUlkfSxcclxuICAgICAgICAgICAgICAgIGRlZmluaXRpb246IG5vZGVSZWYucmVmID09PSAndk5vZGVCb3gnID8ge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgdk5vZGVCb3g6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnZOb2RlQm94LCBbbm9kZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb24udk5vZGVCb3hbbm9kZUlkXSwgY2hpbGRyZW46IHN0YXRlLmRlZmluaXRpb24udk5vZGVCb3hbbm9kZUlkXS5jaGlsZHJlbi5jb25jYXQoe3JlZjondk5vZGVCb3gnLCBpZDpuZXdOb2RlSWR9KX0sIFtuZXdOb2RlSWRdOiBuZXdOb2RlfSxcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogey4uLnN0YXRlLmRlZmluaXRpb24uc3R5bGUsIFtuZXdTdHlsZUlkXTogbmV3U3R5bGV9LFxyXG4gICAgICAgICAgICAgICAgfSA6IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIFtub2RlUmVmLnJlZl06IHsuLi5zdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXSwgW25vZGVJZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlSWRdLCBjaGlsZHJlbjogc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZUlkXS5jaGlsZHJlbi5jb25jYXQoe3JlZjondk5vZGVCb3gnLCBpZDpuZXdOb2RlSWR9KX19LFxyXG4gICAgICAgICAgICAgICAgICAgIHZOb2RlQm94OiB7Li4uc3RhdGUuZGVmaW5pdGlvbi52Tm9kZUJveCwgW25ld05vZGVJZF06IG5ld05vZGV9LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5zdHlsZSwgW25ld1N0eWxlSWRdOiBuZXdTdHlsZX0sXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHR5cGUgPT09ICd0ZXh0Jyl7XHJcbiAgICAgICAgICAgIGNvbnN0IHBpcGVJZCA9IHV1aWQoKVxyXG4gICAgICAgICAgICBjb25zdCBuZXdOb2RlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgIHBhcmVudDogbm9kZVJlZixcclxuICAgICAgICAgICAgICAgIHN0eWxlOiB7cmVmOidzdHlsZScsIGlkOm5ld1N0eWxlSWR9LFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6J3BpcGUnLCBpZDpwaXBlSWR9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbmV3UGlwZSA9IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiAnRGVmYXVsdCBUZXh0JyxcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogW11cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc2V0U3RhdGUoe1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFZpZXdOb2RlOiB7cmVmOid2Tm9kZVRleHQnLCBpZDogbmV3Tm9kZUlkfSxcclxuICAgICAgICAgICAgICAgIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsIFtwaXBlSWRdOiBuZXdQaXBlfSxcclxuICAgICAgICAgICAgICAgICAgICBbbm9kZVJlZi5yZWZdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl0sIFtub2RlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZUlkXSwgY2hpbGRyZW46IHN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVJZF0uY2hpbGRyZW4uY29uY2F0KHtyZWY6J3ZOb2RlVGV4dCcsIGlkOm5ld05vZGVJZH0pfX0sXHJcbiAgICAgICAgICAgICAgICAgICAgdk5vZGVUZXh0OiB7Li4uc3RhdGUuZGVmaW5pdGlvbi52Tm9kZVRleHQsIFtuZXdOb2RlSWRdOiBuZXdOb2RlfSxcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogey4uLnN0YXRlLmRlZmluaXRpb24uc3R5bGUsIFtuZXdTdHlsZUlkXTogbmV3U3R5bGV9LFxyXG4gICAgICAgICAgICAgICAgfX0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHR5cGUgPT09ICdpbWFnZScpe1xyXG4gICAgICAgICAgICBjb25zdCBwaXBlSWQgPSB1dWlkKClcclxuICAgICAgICAgICAgY29uc3QgbmV3Tm9kZSA9IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnaW1hZ2UnLFxyXG4gICAgICAgICAgICAgICAgcGFyZW50OiBub2RlUmVmLFxyXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtyZWY6J3N0eWxlJywgaWQ6bmV3U3R5bGVJZH0sXHJcbiAgICAgICAgICAgICAgICBzcmM6IHtyZWY6J3BpcGUnLCBpZDpwaXBlSWR9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbmV3UGlwZSA9IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiAnaHR0cHM6Ly93d3cudWduaXMuY29tL2ltYWdlcy9sb2dvMjU2eDI1Ni5wbmcnLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBbXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzZXRTdGF0ZSh7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZSxcclxuICAgICAgICAgICAgICAgIHNlbGVjdGVkVmlld05vZGU6IHtyZWY6J3ZOb2RlSW1hZ2UnLCBpZDogbmV3Tm9kZUlkfSxcclxuICAgICAgICAgICAgICAgIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsIFtwaXBlSWRdOiBuZXdQaXBlfSxcclxuICAgICAgICAgICAgICAgICAgICBbbm9kZVJlZi5yZWZdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl0sIFtub2RlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZUlkXSwgY2hpbGRyZW46IHN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVJZF0uY2hpbGRyZW4uY29uY2F0KHtyZWY6J3ZOb2RlSW1hZ2UnLCBpZDpuZXdOb2RlSWR9KX19LFxyXG4gICAgICAgICAgICAgICAgICAgIHZOb2RlSW1hZ2U6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnZOb2RlSW1hZ2UsIFtuZXdOb2RlSWRdOiBuZXdOb2RlfSxcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogey4uLnN0YXRlLmRlZmluaXRpb24uc3R5bGUsIFtuZXdTdHlsZUlkXTogbmV3U3R5bGV9LFxyXG4gICAgICAgICAgICAgICAgfX0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHR5cGUgPT09ICdpZicpe1xyXG4gICAgICAgICAgICBjb25zdCBwaXBlSWQgPSB1dWlkKClcclxuICAgICAgICAgICAgY29uc3QgbmV3Tm9kZSA9IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnY29uZGl0aW9uYWwnLFxyXG4gICAgICAgICAgICAgICAgcGFyZW50OiBub2RlUmVmLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6J3BpcGUnLCBpZDpwaXBlSWR9LFxyXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1BpcGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogW11cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc2V0U3RhdGUoe1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFZpZXdOb2RlOiB7cmVmOid2Tm9kZUlmJywgaWQ6IG5ld05vZGVJZH0sXHJcbiAgICAgICAgICAgICAgICBkZWZpbml0aW9uOiBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlSWYnID8ge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwZTogey4uLnN0YXRlLmRlZmluaXRpb24ucGlwZSwgW3BpcGVJZF06IG5ld1BpcGV9LFxyXG4gICAgICAgICAgICAgICAgICAgIHZOb2RlSWY6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnZOb2RlSWYsIFtub2RlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi52Tm9kZUlmW25vZGVJZF0sIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uLnZOb2RlSWZbbm9kZUlkXS5jaGlsZHJlbi5jb25jYXQoe3JlZjondk5vZGVJZicsIGlkOm5ld05vZGVJZH0pfSwgW25ld05vZGVJZF06IG5ld05vZGV9LFxyXG4gICAgICAgICAgICAgICAgfSA6IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsIFtwaXBlSWRdOiBuZXdQaXBlfSxcclxuICAgICAgICAgICAgICAgICAgICBbbm9kZVJlZi5yZWZdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl0sIFtub2RlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZUlkXSwgY2hpbGRyZW46IHN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVJZF0uY2hpbGRyZW4uY29uY2F0KHtyZWY6J3ZOb2RlSWYnLCBpZDpuZXdOb2RlSWR9KX19LFxyXG4gICAgICAgICAgICAgICAgICAgIHZOb2RlSWY6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnZOb2RlSWYsIFtuZXdOb2RlSWRdOiBuZXdOb2RlfSxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHlwZSA9PT0gJ2lucHV0Jykge1xyXG4gICAgICAgICAgICBjb25zdCBzdGF0ZUlkID0gdXVpZCgpXHJcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50SWQgPSB1dWlkKClcclxuICAgICAgICAgICAgY29uc3QgbXV0YXRvcklkID0gdXVpZCgpXHJcbiAgICAgICAgICAgIGNvbnN0IHBpcGVJbnB1dElkID0gdXVpZCgpXHJcbiAgICAgICAgICAgIGNvbnN0IHBpcGVNdXRhdG9ySWQgPSB1dWlkKClcclxuICAgICAgICAgICAgY29uc3QgbmV3Tm9kZSA9IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnaW5wdXQnLFxyXG4gICAgICAgICAgICAgICAgcGFyZW50OiBub2RlUmVmLFxyXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtyZWY6J3N0eWxlJywgaWQ6bmV3U3R5bGVJZH0sXHJcbiAgICAgICAgICAgICAgICB2YWx1ZToge3JlZjoncGlwZScsIGlkOnBpcGVJbnB1dElkfSxcclxuICAgICAgICAgICAgICAgIGlucHV0OiB7cmVmOidldmVudCcsIGlkOmV2ZW50SWR9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbmV3UGlwZUlucHV0ID0ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6ICdzdGF0ZScsIGlkOiBzdGF0ZUlkfSxcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogW11cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBuZXdQaXBlTXV0YXRvciA9IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB7cmVmOiAnZXZlbnREYXRhJywgaWQ6ICdfaW5wdXQnfSxcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogW11cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBuZXdTdGF0ZSA9IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnaW5wdXQgdmFsdWUnLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxyXG4gICAgICAgICAgICAgICAgcmVmOiBzdGF0ZUlkLFxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiAnRGVmYXVsdCB0ZXh0JyxcclxuICAgICAgICAgICAgICAgIG11dGF0b3JzOiBbeyByZWY6J211dGF0b3InLCBpZDptdXRhdG9ySWR9XSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBuZXdNdXRhdG9yID0ge1xyXG4gICAgICAgICAgICAgICAgZXZlbnQ6IHsgcmVmOiAnZXZlbnQnLCBpZDpldmVudElkfSxcclxuICAgICAgICAgICAgICAgIHN0YXRlOiB7IHJlZjogJ3N0YXRlJywgaWQ6c3RhdGVJZH0sXHJcbiAgICAgICAgICAgICAgICBtdXRhdGlvbjogeyByZWY6ICdwaXBlJywgaWQ6IHBpcGVNdXRhdG9ySWR9LFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld0V2ZW50ID0ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2lucHV0JyxcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAndXBkYXRlIGlucHV0JyxcclxuICAgICAgICAgICAgICAgIG11dGF0b3JzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgeyByZWY6ICdtdXRhdG9yJywgaWQ6IG11dGF0b3JJZH0sXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgZW1pdHRlcjoge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZjogJ3ZOb2RlSW5wdXQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBuZXdOb2RlSWQsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZGF0YTogW1xyXG4gICAgICAgICAgICAgICAgICAgIHtyZWY6ICdldmVudERhdGEnLCBpZDogJ19pbnB1dCd9XHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzZXRTdGF0ZSh7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZSxcclxuICAgICAgICAgICAgICAgIHNlbGVjdGVkVmlld05vZGU6IHtyZWY6J3ZOb2RlSW5wdXQnLCBpZDogbmV3Tm9kZUlkfSxcclxuICAgICAgICAgICAgICAgIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsIFtwaXBlSW5wdXRJZF06IG5ld1BpcGVJbnB1dCwgW3BpcGVNdXRhdG9ySWRdOiBuZXdQaXBlTXV0YXRvcn0sXHJcbiAgICAgICAgICAgICAgICAgICAgW25vZGVSZWYucmVmXTogey4uLnN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdLCBbbm9kZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVJZF0sIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlSWRdLmNoaWxkcmVuLmNvbmNhdCh7cmVmOid2Tm9kZUlucHV0JywgaWQ6bmV3Tm9kZUlkfSl9fSxcclxuICAgICAgICAgICAgICAgICAgICB2Tm9kZUlucHV0OiB7Li4uc3RhdGUuZGVmaW5pdGlvbi52Tm9kZUlucHV0LCBbbmV3Tm9kZUlkXTogbmV3Tm9kZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnN0eWxlLCBbbmV3U3R5bGVJZF06IG5ld1N0eWxlfSxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lU3BhY2U6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZSwgWydfcm9vdE5hbWVTcGFjZSddOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5uYW1lU3BhY2VbJ19yb290TmFtZVNwYWNlJ10sIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZVsnX3Jvb3ROYW1lU3BhY2UnXS5jaGlsZHJlbi5jb25jYXQoe3JlZjonc3RhdGUnLCBpZDpzdGF0ZUlkfSl9fSxcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZTogey4uLnN0YXRlLmRlZmluaXRpb24uc3RhdGUsIFtzdGF0ZUlkXTogbmV3U3RhdGV9LFxyXG4gICAgICAgICAgICAgICAgICAgIG11dGF0b3I6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLm11dGF0b3IsIFttdXRhdG9ySWRdOiBuZXdNdXRhdG9yfSxcclxuICAgICAgICAgICAgICAgICAgICBldmVudDogey4uLnN0YXRlLmRlZmluaXRpb24uZXZlbnQsIFtldmVudElkXTogbmV3RXZlbnR9LFxyXG4gICAgICAgICAgICAgICAgfX0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQUREX1NUQVRFKG5hbWVzcGFjZUlkLCB0eXBlKSB7XHJcbiAgICAgICAgY29uc3QgbmV3U3RhdGVJZCA9IHV1aWQoKVxyXG4gICAgICAgIGxldCBuZXdTdGF0ZVxyXG4gICAgICAgIGlmKHR5cGUgPT09ICd0ZXh0Jykge1xyXG4gICAgICAgICAgICBuZXdTdGF0ZSA9IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnbmV3IHRleHQnLFxyXG4gICAgICAgICAgICAgICAgcmVmOiBuZXdTdGF0ZUlkLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiAnRGVmYXVsdCB0ZXh0JyxcclxuICAgICAgICAgICAgICAgIG11dGF0b3JzOiBbXSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0eXBlID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICBuZXdTdGF0ZSA9IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnbmV3IG51bWJlcicsXHJcbiAgICAgICAgICAgICAgICByZWY6IG5ld1N0YXRlSWQsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogMCxcclxuICAgICAgICAgICAgICAgIG11dGF0b3JzOiBbXSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0eXBlID09PSAnYm9vbGVhbicpIHtcclxuICAgICAgICAgICAgbmV3U3RhdGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ25ldyBib29sZWFuJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICAgICAgICAgIHJlZjogbmV3U3RhdGVJZCxcclxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIG11dGF0b3JzOiBbXSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0eXBlID09PSAndGFibGUnKSB7XHJcbiAgICAgICAgICAgIG5ld1N0YXRlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICduZXcgdGFibGUnLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ3RhYmxlJyxcclxuICAgICAgICAgICAgICAgIHJlZjogbmV3U3RhdGVJZCxcclxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZToge30sXHJcbiAgICAgICAgICAgICAgICBtdXRhdG9yczogW10sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHlwZSA9PT0gJ2ZvbGRlcicpIHtcclxuICAgICAgICAgICAgbmV3U3RhdGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ25ldyBmb2xkZXInLFxyXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICBuYW1lU3BhY2U6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZSwgW25hbWVzcGFjZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlW25hbWVzcGFjZUlkXSwgY2hpbGRyZW46IHN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlW25hbWVzcGFjZUlkXS5jaGlsZHJlbi5jb25jYXQoe3JlZjonbmFtZVNwYWNlJywgaWQ6bmV3U3RhdGVJZH0pfSwgW25ld1N0YXRlSWRdOiBuZXdTdGF0ZX0sXHJcbiAgICAgICAgICAgIH19KVxyXG4gICAgICAgIH1cclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgbmFtZVNwYWNlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5uYW1lU3BhY2UsIFtuYW1lc3BhY2VJZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZVtuYW1lc3BhY2VJZF0sIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZVtuYW1lc3BhY2VJZF0uY2hpbGRyZW4uY29uY2F0KHtyZWY6J3N0YXRlJywgaWQ6bmV3U3RhdGVJZH0pfX0sXHJcbiAgICAgICAgICAgIHN0YXRlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5zdGF0ZSwgW25ld1N0YXRlSWRdOiBuZXdTdGF0ZX0sXHJcbiAgICAgICAgfX0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBBRERfREVGQVVMVF9TVFlMRShzdHlsZUlkLCBrZXkpIHtcclxuICAgICAgICBjb25zdCBwaXBlSWQgPSB1dWlkKClcclxuICAgICAgICBjb25zdCBkZWZhdWx0cyA9IHtcclxuICAgICAgICAgICAgJ2JhY2tncm91bmQnOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAnYm9yZGVyJzogJzFweCBzb2xpZCBibGFjaycsXHJcbiAgICAgICAgICAgICdvdXRsaW5lJzogJzFweCBzb2xpZCBibGFjaycsXHJcbiAgICAgICAgICAgICdjdXJzb3InOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICdjb2xvcic6ICdibGFjaycsXHJcbiAgICAgICAgICAgICdkaXNwbGF5JzogJ2Jsb2NrJyxcclxuICAgICAgICAgICAgJ3RvcCc6ICcwcHgnLFxyXG4gICAgICAgICAgICAnYm90dG9tJzogJzBweCcsXHJcbiAgICAgICAgICAgICdsZWZ0JzogJzBweCcsXHJcbiAgICAgICAgICAgICdyaWdodCc6ICcwcHgnLFxyXG4gICAgICAgICAgICAnZmxleCc6ICcxIDEgYXV0bycsXHJcbiAgICAgICAgICAgICdqdXN0aWZ5Q29udGVudCc6ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAnYWxpZ25JdGVtcyc6ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAnbWF4V2lkdGgnOiAnMTAwJScsXHJcbiAgICAgICAgICAgICdtYXhIZWlnaHQnOiAnMTAwJScsXHJcbiAgICAgICAgICAgICdtaW5XaWR0aCc6ICcxMDAlJyxcclxuICAgICAgICAgICAgJ21pbkhlaWdodCc6ICcxMDAlJyxcclxuICAgICAgICAgICAgJ3Bvc2l0aW9uJzogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgJ292ZXJmbG93JzogJ2F1dG8nLFxyXG4gICAgICAgICAgICAnaGVpZ2h0JzogJzUwMHB4JyxcclxuICAgICAgICAgICAgJ3dpZHRoJzogJzUwMHB4JyxcclxuICAgICAgICAgICAgJ2ZvbnQnOiAnaXRhbGljIDJlbSBcIkNvbWljIFNhbnMgTVNcIiwgY3Vyc2l2ZSwgc2Fucy1zZXJpZicsXHJcbiAgICAgICAgICAgICdtYXJnaW4nOiAnMTBweCcsXHJcbiAgICAgICAgICAgICdwYWRkaW5nJzogJzEwcHgnLFxyXG4gICAgICAgIH1cclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgcGlwZTogey4uLnN0YXRlLmRlZmluaXRpb24ucGlwZSwgW3BpcGVJZF06IHt0eXBlOiAndGV4dCcsIHZhbHVlOiBkZWZhdWx0c1trZXldLCB0cmFuc2Zvcm1hdGlvbnM6W119fSxcclxuICAgICAgICAgICAgc3R5bGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnN0eWxlLCBbc3R5bGVJZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnN0eWxlW3N0eWxlSWRdLCBba2V5XToge3JlZjogJ3BpcGUnLCBpZDogcGlwZUlkfX19fX0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBTRUxFQ1RfVklFV19TVUJNRU5VKG5ld0lkKSB7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBzZWxlY3RlZFZpZXdTdWJNZW51Om5ld0lkfSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIEVESVRfVklFV19OT0RFX1RJVExFKG5vZGVJZCkge1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZWRpdGluZ1RpdGxlTm9kZUlkOm5vZGVJZH0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBERUxFVEVfU0VMRUNURURfVklFVyhub2RlUmVmLCBwYXJlbnRSZWYpIHtcclxuICAgICAgICBpZihub2RlUmVmLmlkID09PSAnX3Jvb3ROb2RlJyl7XHJcbiAgICAgICAgICAgIGlmKHN0YXRlLmRlZmluaXRpb24udk5vZGVCb3hbJ19yb290Tm9kZSddLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gaW1tdXRhYmx5IHJlbW92ZSBhbGwgbm9kZXMgZXhjZXB0IHJvb3ROb2RlXHJcbiAgICAgICAgICAgIHJldHVybiBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICB2Tm9kZUJveDogeydfcm9vdE5vZGUnOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi52Tm9kZUJveFsnX3Jvb3ROb2RlJ10sIGNoaWxkcmVuOiBbXX19LFxyXG4gICAgICAgICAgICB9LCBzZWxlY3RlZFZpZXdOb2RlOiB7fX0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICBbcGFyZW50UmVmLnJlZl06IHsuLi5zdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdLCBbcGFyZW50UmVmLmlkXTogey4uLnN0YXRlLmRlZmluaXRpb25bcGFyZW50UmVmLnJlZl1bcGFyZW50UmVmLmlkXSwgY2hpbGRyZW46c3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXVtwYXJlbnRSZWYuaWRdLmNoaWxkcmVuLmZpbHRlcigocmVmKT0+cmVmLmlkICE9PSBub2RlUmVmLmlkKX19LFxyXG4gICAgICAgIH0sIHNlbGVjdGVkVmlld05vZGU6IHt9fSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIENIQU5HRV9WSUVXX05PREVfVElUTEUobm9kZVJlZiwgZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBjb25zdCBub2RlSWQgPSBub2RlUmVmLmlkXHJcbiAgICAgICAgY29uc3Qgbm9kZVR5cGUgPSBub2RlUmVmLnJlZlxyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICBbbm9kZVR5cGVdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlVHlwZV0sIFtub2RlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlVHlwZV1bbm9kZUlkXSwgdGl0bGU6IGUudGFyZ2V0LnZhbHVlfX0sXHJcbiAgICAgICAgfX0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBDSEFOR0VfU1RBVEVfTk9ERV9USVRMRShub2RlSWQsIGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIHN0YXRlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5zdGF0ZSwgW25vZGVJZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnN0YXRlW25vZGVJZF0sIHRpdGxlOiBlLnRhcmdldC52YWx1ZX19LFxyXG4gICAgICAgIH19KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQ0hBTkdFX05BTUVTUEFDRV9USVRMRShub2RlSWQsIGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIG5hbWVTcGFjZTogey4uLnN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlLCBbbm9kZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlW25vZGVJZF0sIHRpdGxlOiBlLnRhcmdldC52YWx1ZX19LFxyXG4gICAgICAgIH19KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQ0hBTkdFX0NVUlJFTlRfU1RBVEVfVEVYVF9WQUxVRShzdGF0ZUlkLCBlKSB7XHJcbiAgICAgICAgYXBwLnNldEN1cnJlbnRTdGF0ZSh7Li4uYXBwLmdldEN1cnJlbnRTdGF0ZSgpLCBbc3RhdGVJZF06IGUudGFyZ2V0LnZhbHVlfSlcclxuICAgICAgICByZW5kZXIoKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQ0hBTkdFX0NVUlJFTlRfU1RBVEVfTlVNQkVSX1ZBTFVFKHN0YXRlSWQsIGUpIHtcclxuICAgICAgICAvLyB0b2RvIGJpZyB0aHJvd3MgZXJyb3IgaW5zdGVhZCBvZiByZXR1cm5pbmcgTmFOLi4uIGZpeCwgcmV3cml0ZSBvciBoYWNrXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYoYmlnKGUudGFyZ2V0LnZhbHVlKS50b1N0cmluZygpICE9PSBhcHAuZ2V0Q3VycmVudFN0YXRlKClbc3RhdGVJZF0udG9TdHJpbmcoKSl7XHJcbiAgICAgICAgICAgICAgICBhcHAuc2V0Q3VycmVudFN0YXRlKHsuLi5hcHAuZ2V0Q3VycmVudFN0YXRlKCksIFtzdGF0ZUlkXTogYmlnKGUudGFyZ2V0LnZhbHVlKX0pXHJcbiAgICAgICAgICAgICAgICByZW5kZXIoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaChlcnIpIHtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBDSEFOR0VfU1RBVElDX1ZBTFVFKHJlZiwgcHJvcGVydHlOYW1lLCB0eXBlLCBlKSB7XHJcbiAgICAgICAgbGV0IHZhbHVlID0gZS50YXJnZXQudmFsdWVcclxuICAgICAgICBpZih0eXBlID09PSAnbnVtYmVyJyl7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGJpZyhlLnRhcmdldC52YWx1ZSlcclxuICAgICAgICAgICAgfSBjYXRjaChlcnIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0eXBlID09PSAnYm9vbGVhbicpe1xyXG4gICAgICAgICAgICB2YWx1ZSA9ICh2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gJ3RydWUnKSA/IHRydWUgOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246e1xyXG4gICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICBbcmVmLnJlZl06IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb25bcmVmLnJlZl0sXHJcbiAgICAgICAgICAgICAgICBbcmVmLmlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXSxcclxuICAgICAgICAgICAgICAgICAgICBbcHJvcGVydHlOYW1lXTogdmFsdWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH19KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQUREX0VWRU5UKHByb3BlcnR5TmFtZSwgbm9kZSkge1xyXG4gICAgICAgIGNvbnN0IHJlZiA9IHN0YXRlLnNlbGVjdGVkVmlld05vZGVcclxuICAgICAgICBjb25zdCBldmVudElkID0gdXVpZCgpO1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjp7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIFtyZWYucmVmXToge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbltyZWYucmVmXSxcclxuICAgICAgICAgICAgICAgIFtyZWYuaWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdLFxyXG4gICAgICAgICAgICAgICAgICAgIFtwcm9wZXJ0eU5hbWVdOiB7cmVmOiAnZXZlbnQnLCBpZDogZXZlbnRJZH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXZlbnQ6IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24uZXZlbnQsXHJcbiAgICAgICAgICAgICAgICBbZXZlbnRJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBwcm9wZXJ0eU5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgZW1pdHRlcjogbm9kZSxcclxuICAgICAgICAgICAgICAgICAgICBtdXRhdG9yczogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogW11cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH19KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gU0VMRUNUX1BJUEUocGlwZUlkLCBlKSB7XHJcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgc2VsZWN0ZWRQaXBlSWQ6cGlwZUlkfSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIENIQU5HRV9QSVBFX1ZBTFVFX1RPX1NUQVRFKHBpcGVJZCkge1xyXG4gICAgICAgIGlmKCFzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkIHx8IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLnZhbHVlLmlkICl7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIHBpcGU6IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZSxcclxuICAgICAgICAgICAgICAgIFtwaXBlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6ICdzdGF0ZScsIGlkOiBzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkfSxcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFtdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9fSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIEFERF9UUkFOU0ZPUk1BVElPTihwaXBlSWQsIHRyYW5zZm9ybWF0aW9uKSB7XHJcbiAgICAgICAgaWYodHJhbnNmb3JtYXRpb24gPT09ICdqb2luJyl7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1BpcGVJZCA9IHV1aWQoKTtcclxuICAgICAgICAgICAgY29uc3Qgam9pbklkID0gdXVpZCgpO1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICBqb2luOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5qb2luLFxyXG4gICAgICAgICAgICAgICAgICAgIFtqb2luSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7cmVmOiAncGlwZScsIGlkOm5ld1BpcGVJZH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcGlwZToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZSxcclxuICAgICAgICAgICAgICAgICAgICBbbmV3UGlwZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnRGVmYXVsdCB0ZXh0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgW3BpcGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0udHJhbnNmb3JtYXRpb25zLmNvbmNhdCh7cmVmOiAnam9pbicsIGlkOmpvaW5JZH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9fSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHJhbnNmb3JtYXRpb24gPT09ICd0b1VwcGVyQ2FzZScpe1xyXG4gICAgICAgICAgICBjb25zdCBuZXdJZCA9IHV1aWQoKTtcclxuICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgdG9VcHBlckNhc2U6IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnRvVXBwZXJDYXNlLFxyXG4gICAgICAgICAgICAgICAgICAgIFtuZXdJZF06IHt9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcGlwZToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZSxcclxuICAgICAgICAgICAgICAgICAgICBbcGlwZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBzdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXS50cmFuc2Zvcm1hdGlvbnMuY29uY2F0KHtyZWY6ICd0b1VwcGVyQ2FzZScsIGlkOm5ld0lkfSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH19KVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0cmFuc2Zvcm1hdGlvbiA9PT0gJ3RvTG93ZXJDYXNlJyl7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld0lkID0gdXVpZCgpO1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICB0b0xvd2VyQ2FzZToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24udG9Mb3dlckNhc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgW25ld0lkXToge31cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwaXBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIFtwaXBlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IHN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLnRyYW5zZm9ybWF0aW9ucy5jb25jYXQoe3JlZjogJ3RvTG93ZXJDYXNlJywgaWQ6bmV3SWR9KVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfX0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRyYW5zZm9ybWF0aW9uID09PSAnYWRkJyl7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1BpcGVJZCA9IHV1aWQoKTtcclxuICAgICAgICAgICAgY29uc3QgYWRkSWQgPSB1dWlkKCk7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgIGFkZDoge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24uYWRkLFxyXG4gICAgICAgICAgICAgICAgICAgIFthZGRJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6ICdwaXBlJywgaWQ6bmV3UGlwZUlkfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwaXBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIFtuZXdQaXBlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgW3BpcGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0udHJhbnNmb3JtYXRpb25zLmNvbmNhdCh7cmVmOiAnYWRkJywgaWQ6YWRkSWR9KVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfX0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRyYW5zZm9ybWF0aW9uID09PSAnc3VidHJhY3QnKXtcclxuICAgICAgICAgICAgY29uc3QgbmV3UGlwZUlkID0gdXVpZCgpO1xyXG4gICAgICAgICAgICBjb25zdCBzdWJ0cmFjdElkID0gdXVpZCgpO1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICBzdWJ0cmFjdDoge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24uc3VidHJhY3QsXHJcbiAgICAgICAgICAgICAgICAgICAgW3N1YnRyYWN0SWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7cmVmOiAncGlwZScsIGlkOm5ld1BpcGVJZH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcGlwZToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZSxcclxuICAgICAgICAgICAgICAgICAgICBbbmV3UGlwZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogW11cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFtwaXBlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IHN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLnRyYW5zZm9ybWF0aW9ucy5jb25jYXQoe3JlZjogJ3N1YnRyYWN0JywgaWQ6c3VidHJhY3RJZH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9fSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBSRVNFVF9BUFBfU1RBVEUoKSB7XHJcbiAgICAgICAgYXBwLnNldEN1cnJlbnRTdGF0ZShhcHAuY3JlYXRlRGVmYXVsdFN0YXRlKCkpXHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBldmVudFN0YWNrOiBbXX0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBSRVNFVF9BUFBfREVGSU5JVElPTigpIHtcclxuICAgICAgICBpZihzdGF0ZS5kZWZpbml0aW9uICE9PSBhcHBEZWZpbml0aW9uKXtcclxuICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7Li4uYXBwRGVmaW5pdGlvbn19KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIEZVTExfU0NSRUVOX0NMSUNLRUQodmFsdWUpIHtcclxuICAgICAgICBpZih2YWx1ZSAhPT0gc3RhdGUuZnVsbFNjcmVlbil7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZnVsbFNjcmVlbjogdmFsdWV9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFNBVkVfREVGQVVMVChzdGF0ZUlkKSB7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOntcclxuICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgc3RhdGU6IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24uc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBbc3RhdGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnN0YXRlW3N0YXRlSWRdLFxyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogYXBwLmdldEN1cnJlbnRTdGF0ZSgpW3N0YXRlSWRdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9fSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIERFTEVURV9TVEFURShzdGF0ZUlkKSB7XHJcbiAgICAgICAgY29uc3Qge1tzdGF0ZUlkXTogZGVsZXRlZFN0YXRlLCAuLi5uZXdTdGF0ZX0gPSBzdGF0ZS5kZWZpbml0aW9uLnN0YXRlXHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOntcclxuICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgc3RhdGU6IG5ld1N0YXRlLFxyXG4gICAgICAgICAgICBuYW1lU3BhY2U6IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlLFxyXG4gICAgICAgICAgICAgICAgJ19yb290TmFtZVNwYWNlJzoge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlWydfcm9vdE5hbWVTcGFjZSddLFxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZVsnX3Jvb3ROYW1lU3BhY2UnXS5jaGlsZHJlbi5maWx0ZXIoKHJlZik9PiByZWYuaWQgIT09IHN0YXRlSWQpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9fSlcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBib3hJY29uID0gKCkgPT4gaCgnaScsIHthdHRyczoge2NsYXNzOiAnbWF0ZXJpYWwtaWNvbnMnfX0sICdsYXllcnMnKVxyXG4gICAgY29uc3QgaWZJY29uID0gKCkgPT4gaCgnaScsIHthdHRyczoge2NsYXNzOiAnbWF0ZXJpYWwtaWNvbnMnfSwgc3R5bGU6IHt0cmFuc2Zvcm06ICdyb3RhdGUoOTBkZWcpJ319LCAnY2FsbF9zcGxpdCcpXHJcbiAgICBjb25zdCBudW1iZXJJY29uID0gKCkgPT4gaCgnaScsIHthdHRyczoge2NsYXNzOiAnbWF0ZXJpYWwtaWNvbnMnfX0sICdsb29rc19vbmUnKVxyXG4gICAgY29uc3QgbGlzdEljb24gPSAoKSA9PiBoKCdpJywge2F0dHJzOiB7Y2xhc3M6ICdtYXRlcmlhbC1pY29ucyd9fSwgJ3ZpZXdfbGlzdCcpXHJcbiAgICBjb25zdCBpbnB1dEljb24gPSAoKSA9PiBoKCdpJywge2F0dHJzOiB7Y2xhc3M6ICdtYXRlcmlhbC1pY29ucyd9fSwgJ2lucHV0JylcclxuICAgIGNvbnN0IHRleHRJY29uID0gKCkgPT4gaCgnaScsIHthdHRyczoge2NsYXNzOiAnbWF0ZXJpYWwtaWNvbnMnfX0sICd0ZXh0X2ZpZWxkcycpXHJcbiAgICBjb25zdCBkZWxldGVJY29uID0gKCkgPT4gaCgnaScsIHthdHRyczoge2NsYXNzOiAnbWF0ZXJpYWwtaWNvbnMnLCAnZGF0YS10cmFzaGNhbic6IHRydWV9fSwgJ2RlbGV0ZV9mb3JldmVyJylcclxuICAgIGNvbnN0IGNsZWFySWNvbiA9ICgpID0+IGgoJ2knLCB7YXR0cnM6IHtjbGFzczogJ21hdGVyaWFsLWljb25zJ319LCAnY2xlYXInKVxyXG4gICAgY29uc3QgZm9sZGVySWNvbiA9ICgpID0+IGgoJ2knLCB7YXR0cnM6IHtjbGFzczogJ21hdGVyaWFsLWljb25zJ319LCAnZm9sZGVyJylcclxuICAgIGNvbnN0IHNhdmVJY29uID0gKCkgPT4gaCgnaScsIHthdHRyczoge2NsYXNzOiAnbWF0ZXJpYWwtaWNvbnMnfX0sICdjaGVjaycpXHJcbiAgICBjb25zdCBpbWFnZUljb24gPSAoKSA9PiBoKCdpJywge2F0dHJzOiB7Y2xhc3M6ICdtYXRlcmlhbC1pY29ucyd9fSwgJ2ltYWdlJylcclxuICAgIGNvbnN0IGFwcEljb24gPSAoKSA9PiBoKCdpJywge2F0dHJzOiB7Y2xhc3M6ICdtYXRlcmlhbC1pY29ucyd9LCBzdHlsZTogeyBmb250U2l6ZTogJzE4cHgnfX0sICdkZXNjcmlwdGlvbicpXHJcbiAgICBjb25zdCBhcnJvd0ljb24gPSAocm90YXRlKSA9PiBoKCdpJywge2F0dHJzOiB7Y2xhc3M6ICdtYXRlcmlhbC1pY29ucycsICdkYXRhLWNsb3NlYXJyb3cnOiB0cnVlfSwgc3R5bGU6IHt0cmFuc2l0aW9uOiAnYWxsIDAuMnMnLCB0cmFuc2Zvcm06IHJvdGF0ZSA/ICdyb3RhdGUoLTkwZGVnKScgOiAncm90YXRlKDBkZWcpJywgY3Vyc29yOiAncG9pbnRlcid9fSwgJ2V4cGFuZF9tb3JlJylcclxuXHJcbiAgICBmdW5jdGlvbiByZW5kZXIoKSB7XHJcbiAgICAgICAgY29uc3QgY3VycmVudFJ1bm5pbmdTdGF0ZSA9IGFwcC5nZXRDdXJyZW50U3RhdGUoKVxyXG4gICAgICAgIGNvbnN0IGRyYWdDb21wb25lbnRMZWZ0ID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgbW91c2Vkb3duOiBbV0lEVEhfRFJBR0dFRCwgJ2VkaXRvckxlZnRXaWR0aCddLFxyXG4gICAgICAgICAgICAgICAgdG91Y2hzdGFydDogW1dJRFRIX0RSQUdHRUQsICdlZGl0b3JMZWZ0V2lkdGgnXSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICAgICAgcmlnaHQ6ICcwJyxcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVgoMTAwJSknLFxyXG4gICAgICAgICAgICAgICAgdG9wOiAnMCcsXHJcbiAgICAgICAgICAgICAgICB3aWR0aDogJzEwcHgnLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXHJcbiAgICAgICAgICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgZm9udFNpemU6ICcxZW0nLFxyXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogJzAnLFxyXG4gICAgICAgICAgICAgICAgY3Vyc29yOiAnY29sLXJlc2l6ZScsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSlcclxuICAgICAgICBjb25zdCBvcGVuQ29tcG9uZW50TGVmdCA9IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgIG1vdXNlZG93bjogW09QRU5fU0lERUJBUiwgJ2xlZnQnXSxcclxuICAgICAgICAgICAgICAgIHRvdWNoc3RhcnQ6IFtPUEVOX1NJREVCQVIsICdsZWZ0J10sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgICAgIHJpZ2h0OiAnLTNweCcsXHJcbiAgICAgICAgICAgICAgICB0b3A6ICc1MCUnLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlWigwKSB0cmFuc2xhdGVYKDEwMCUpIHRyYW5zbGF0ZVkoLTUwJSknLFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6ICcxNXB4JyxcclxuICAgICAgICAgICAgICAgIGhlaWdodDogJzEwJScsXHJcbiAgICAgICAgICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgZm9udFNpemU6ICcxZW0nLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMCA1cHggNXB4IDAnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM1ZDVkNWQnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnaW5zZXQgMCAwIDJweCA3cHggIzIyMicsXHJcbiAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KVxyXG4gICAgICAgIGNvbnN0IG9wZW5Db21wb25lbnRSaWdodCA9IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgIG1vdXNlZG93bjogW09QRU5fU0lERUJBUiwgJ3JpZ2h0J10sXHJcbiAgICAgICAgICAgICAgICB0b3VjaHN0YXJ0OiBbT1BFTl9TSURFQkFSLCAncmlnaHQnXSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICAgICAgbGVmdDogJy0zcHgnLFxyXG4gICAgICAgICAgICAgICAgdG9wOiAnNTAlJyxcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVooMCkgdHJhbnNsYXRlWCgtMTAwJSkgdHJhbnNsYXRlWSgtNTAlKScsXHJcbiAgICAgICAgICAgICAgICB3aWR0aDogJzE1cHgnLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAlJyxcclxuICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogJzFlbScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICc1cHggMCAwIDVweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzVkNWQ1ZCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICdpbnNldCAwIDAgMnB4IDdweCAjMjIyJyxcclxuICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgY29uc3QgZHJhZ0NvbXBvbmVudFJpZ2h0ID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgbW91c2Vkb3duOiBbV0lEVEhfRFJBR0dFRCwgJ2VkaXRvclJpZ2h0V2lkdGgnXSxcclxuICAgICAgICAgICAgICAgIHRvdWNoc3RhcnQ6IFtXSURUSF9EUkFHR0VELCAnZWRpdG9yUmlnaHRXaWR0aCddLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICBsZWZ0OiAnMCcsXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGVYKC0xMDAlKScsXHJcbiAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAnMTBweCcsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogJzFlbScsXHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAnMCcsXHJcbiAgICAgICAgICAgICAgICBjdXJzb3I6ICdjb2wtcmVzaXplJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KVxyXG4gICAgICAgIGNvbnN0IGRyYWdTdWJDb21wb25lbnRSaWdodCA9IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgIG1vdXNlZG93bjogW1dJRFRIX0RSQUdHRUQsICdzdWJFZGl0b3JXaWR0aCddLFxyXG4gICAgICAgICAgICAgICAgdG91Y2hzdGFydDogW1dJRFRIX0RSQUdHRUQsICdzdWJFZGl0b3JXaWR0aCddLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICByaWdodDogJzJweCcsXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGVYKDEwMCUpJyxcclxuICAgICAgICAgICAgICAgIHRvcDogJzAnLFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6ICcxMHB4JyxcclxuICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMWVtJyxcclxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgICAgICBjdXJzb3I6ICdjb2wtcmVzaXplJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KVxyXG4gICAgICAgIGNvbnN0IGRyYWdTdWJDb21wb25lbnRMZWZ0ID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgbW91c2Vkb3duOiBbV0lEVEhfRFJBR0dFRCwgJ3N1YkVkaXRvcldpZHRoTGVmdCddLFxyXG4gICAgICAgICAgICAgICAgdG91Y2hzdGFydDogW1dJRFRIX0RSQUdHRUQsICdzdWJFZGl0b3JXaWR0aExlZnQnXSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICAgICAgbGVmdDogJzJweCcsXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGVYKC0xMDAlKScsXHJcbiAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAnMTBweCcsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogJzFlbScsXHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICAgICAgY3Vyc29yOiAnY29sLXJlc2l6ZScsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZW1iZXJFZGl0b3IocmVmLCB0eXBlKXtcclxuICAgICAgICAgICAgY29uc3QgcGlwZSA9IHN0YXRlLmRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gbGlzdFRyYW5zZm9ybWF0aW9ucyh0cmFuc2Zvcm1hdGlvbnMsIHRyYW5zVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybWF0aW9ucy5tYXAoKHRyYW5zUmVmLCBpbmRleCk9PntcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1lciA9IHN0YXRlLmRlZmluaXRpb25bdHJhbnNSZWYucmVmXVt0cmFuc1JlZi5pZF1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNSZWYucmVmID09PSAnZXF1YWwnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge2tleTogaW5kZXgsIHN0eWxlOiB7Y29sb3I6ICcjYmRiZGJkJywgY3Vyc29yOiAnZGVmYXVsdCcsIGRpc3BsYXk6J2ZsZXgnfX0sIFtoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnfX0sIHRyYW5zUmVmLnJlZiksIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCcsIGNvbG9yOiB0cmFuc2Zvcm1hdGlvbnMubGVuZ3RoLTEgIT09IGluZGV4ID8gJyNiZGJkYmQnOiB0cmFuc1R5cGUgPT09IHR5cGUgPyAnZ3JlZW4nOiAncmVkJ319LCAndHJ1ZS9mYWxzZScpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nTGVmdDogJzE1cHgnfX0sIFtlbWJlckVkaXRvcih0cmFuc2Zvcm1lci52YWx1ZSwgdHlwZSldKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNSZWYucmVmID09PSAnYWRkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge30sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtrZXk6IGluZGV4LCBzdHlsZToge2NvbG9yOiAnI2JkYmRiZCcsIGN1cnNvcjogJ2RlZmF1bHQnLCBkaXNwbGF5OidmbGV4J319LCBbaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJ319LCB0cmFuc1JlZi5yZWYpLCBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAnLCBjb2xvcjogdHJhbnNmb3JtYXRpb25zLmxlbmd0aC0xICE9PSBpbmRleCA/ICcjYmRiZGJkJzogdHJhbnNUeXBlID09PSB0eXBlID8gJ2dyZWVuJzogJ3JlZCd9fSwgJ251bWJlcicpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nTGVmdDogJzE1cHgnfX0sIFtlbWJlckVkaXRvcih0cmFuc2Zvcm1lci52YWx1ZSwgJ251bWJlcicpXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zUmVmLnJlZiA9PT0gJ3N1YnRyYWN0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge30sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtrZXk6IGluZGV4LCBzdHlsZToge2NvbG9yOiAnI2JkYmRiZCcsIGN1cnNvcjogJ2RlZmF1bHQnLCBkaXNwbGF5OidmbGV4J319LCBbaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJ319LCB0cmFuc1JlZi5yZWYpLCBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAnLCBjb2xvcjogdHJhbnNmb3JtYXRpb25zLmxlbmd0aC0xICE9PSBpbmRleCA/ICcjYmRiZGJkJzogdHJhbnNUeXBlID09PSB0eXBlID8gJ2dyZWVuJzogJ3JlZCd9fSwgJ251bWJlcicpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nTGVmdDogJzE1cHgnfX0sIFtlbWJlckVkaXRvcih0cmFuc2Zvcm1lci52YWx1ZSwgJ251bWJlcicpXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zUmVmLnJlZiA9PT0gJ211bHRpcGx5Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge30sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtrZXk6IGluZGV4LCBzdHlsZToge2NvbG9yOiAnI2JkYmRiZCcsIGN1cnNvcjogJ2RlZmF1bHQnLCBkaXNwbGF5OidmbGV4J319LCBbaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJ319LCB0cmFuc1JlZi5yZWYpLCBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAnLCBjb2xvcjogdHJhbnNmb3JtYXRpb25zLmxlbmd0aC0xICE9PSBpbmRleCA/ICcjYmRiZGJkJzogdHJhbnNUeXBlID09PSB0eXBlID8gJ2dyZWVuJzogJ3JlZCd9fSwgJ251bWJlcicpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nTGVmdDogJzE1cHgnfX0sIFtlbWJlckVkaXRvcih0cmFuc2Zvcm1lci52YWx1ZSwgJ251bWJlcicpXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zUmVmLnJlZiA9PT0gJ2RpdmlkZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHt9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7a2V5OiBpbmRleCwgc3R5bGU6IHtjb2xvcjogJyNiZGJkYmQnLCBjdXJzb3I6ICdkZWZhdWx0JywgZGlzcGxheTonZmxleCd9fSwgW2goJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMSd9fSwgdHJhbnNSZWYucmVmKSwgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwJywgY29sb3I6IHRyYW5zZm9ybWF0aW9ucy5sZW5ndGgtMSAhPT0gaW5kZXggPyAnI2JkYmRiZCc6IHRyYW5zVHlwZSA9PT0gdHlwZSA/ICdncmVlbic6ICdyZWQnfX0sICdudW1iZXInKV0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ0xlZnQ6ICcxNXB4J319LCBbZW1iZXJFZGl0b3IodHJhbnNmb3JtZXIudmFsdWUsICdudW1iZXInKV0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc1JlZi5yZWYgPT09ICdyZW1haW5kZXInKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge2tleTogaW5kZXgsIHN0eWxlOiB7Y29sb3I6ICcjYmRiZGJkJywgY3Vyc29yOiAnZGVmYXVsdCcsIGRpc3BsYXk6J2ZsZXgnfX0sIFtoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnfX0sIHRyYW5zUmVmLnJlZiksIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCcsIGNvbG9yOiB0cmFuc2Zvcm1hdGlvbnMubGVuZ3RoLTEgIT09IGluZGV4ID8gJyNiZGJkYmQnOiB0cmFuc1R5cGUgPT09IHR5cGUgPyAnZ3JlZW4nOiAncmVkJ319LCAnbnVtYmVyJyldKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmdMZWZ0OiAnMTVweCd9fSwgW2VtYmVyRWRpdG9yKHRyYW5zZm9ybWVyLnZhbHVlLCAnbnVtYmVyJyldKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyBpZiAodHJhbnNSZWYucmVmID09PSAnYnJhbmNoJykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBpZihyZXNvbHZlKHRyYW5zZm9ybWVyLnByZWRpY2F0ZSkpe1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgdmFsdWUgPSB0cmFuc2Zvcm1WYWx1ZSh2YWx1ZSwgdHJhbnNmb3JtZXIudGhlbilcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIHZhbHVlID0gdHJhbnNmb3JtVmFsdWUodmFsdWUsIHRyYW5zZm9ybWVyLmVsc2UpXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zUmVmLnJlZiA9PT0gJ2pvaW4nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdzcGFuJywge30sIFtlbWJlckVkaXRvcih0cmFuc2Zvcm1lci52YWx1ZSwgdHJhbnNUeXBlKV0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc1JlZi5yZWYgPT09ICd0b1VwcGVyQ2FzZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHt9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtjdXJzb3I6ICdkZWZhdWx0JywgZGlzcGxheTonZmxleCd9fSwgW2goJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMScsIGNvbG9yOiAnI2JkYmRiZCd9fSwgdHJhbnNSZWYucmVmKV0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNSZWYucmVmID09PSAndG9Mb3dlckNhc2UnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7Y3Vyc29yOiAnZGVmYXVsdCcsIGRpc3BsYXk6J2ZsZXgnfX0sIFtoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnLCBjb2xvcjogJyNiZGJkYmQnfX0sIHRyYW5zUmVmLnJlZildKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zUmVmLnJlZiA9PT0gJ2xlbmd0aCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHt9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtjdXJzb3I6ICdkZWZhdWx0JywgZGlzcGxheTonZmxleCd9fSwgW2goJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMScsIGNvbG9yOiAnI2JkYmRiZCd9fSwgdHJhbnNSZWYucmVmKV0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGdlblRyYW5zZm9ybWF0b3JzKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRQaXBlID0gc3RhdGUuZGVmaW5pdGlvbi5waXBlW3N0YXRlLnNlbGVjdGVkUGlwZUlkXVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtoKCdzcGFuJyldIC8vIFRPRE8gcmV0aGlua1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtoKCdkaXYnLCB7c3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2ZpeGVkJyxcclxuICAgICAgICAgICAgICAgICAgICB0b3A6IHN0YXRlLmNvbXBvbmVudEVkaXRvclBvc2l0aW9uLnkgKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IHN0YXRlLmNvbXBvbmVudEVkaXRvclBvc2l0aW9uLnggLSAzMDcgKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzUwJScsXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICczMDBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLHtzdHlsZToge2JvcmRlcjogJzNweCBzb2xpZCAjMjIyJywgZmxleDogJzEgMSAwJScsIGJhY2tncm91bmQ6ICcjNGQ0ZDRkJywgbWFyZ2luQm90dG9tOiAnMTBweCd9fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ2RlZmF1bHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzIyMicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nVG9wOiAnMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdCb3R0b206ICc1cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjNTNCMkVEJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbldpZHRoOiAnMTAwJScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICc1IDUgYXV0bycsIG1hcmdpbjogJzAgNXB4JywgbWluV2lkdGg6ICcwJywgb3ZlcmZsb3c6ICdoaWRkZW4nLCB3aGl0ZVNwYWNlOiAnbm93cmFwJywgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnLCBmb250U2l6ZTogJzAuOGVtJ319LCAnVWduaXMgVG9vbGJveCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwIDAgYXV0bycsIG1hcmdpbkxlZnQ6ICdhdXRvJywgY3Vyc29yOiAncG9pbnRlcicsIG1hcmdpblJpZ2h0OiAnNXB4JywgY29sb3I6ICd3aGl0ZScsIGRpc3BsYXk6ICdpbmxpbmUtZmxleCd9LCBvbjoge21vdXNlZG93bjogW1NFTEVDVF9QSVBFLCAnJ10sIHRvdWNoc3RhcnQ6IFtTRUxFQ1RfUElQRSwgJyddfX0sIFtjbGVhckljb24oKV0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICBdKV1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHBpcGUudmFsdWUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge3N0eWxlOiB7cG9zaXRpb246ICdyZWxhdGl2ZSd9fSwgW2goJ2RpdicsIHtzdHlsZTp7ZGlzcGxheTonZmxleCcsIGFsaWduSXRlbXM6ICdiYXNlbGluZSd9LCBvbjoge2NsaWNrOiBbU0VMRUNUX1BJUEUsIHJlZi5pZF19fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCAwIGF1dG8nLCBwb3NpdGlvbjogJ3JlbGF0aXZlJywgdHJhbnNmb3JtOiAndHJhbnNsYXRlWigwKSd9fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7b3BhY2l0eTogJzAnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgd2hpdGVTcGFjZTogJ3ByZScsIHBhZGRpbmc6ICcwIDVweCAycHggNXB4JywgYm9yZGVyQm90dG9tOiAnMnB4IHNvbGlkIHdoaXRlJ319LCBwaXBlLnZhbHVlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnaW5wdXQnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZTogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiAnMnB4IHNvbGlkIHdoaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udDogJ2luaGVyaXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZsZXg6ICcwIDAgYXV0bycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogW0NIQU5HRV9TVEFUSUNfVkFMVUUsIHJlZiwgJ3ZhbHVlJywgJ3RleHQnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3VzZW1vdmU6IFtQSVBFX0hPVkVSRUQsIHJlZl0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGl2ZVByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHBpcGUudmFsdWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICAuLi5saXN0VHJhbnNmb3JtYXRpb25zKHBpcGUudHJhbnNmb3JtYXRpb25zLCBwaXBlLnR5cGUpLFxyXG4gICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywgc3RhdGUuc2VsZWN0ZWRQaXBlSWQgPT09IHJlZi5pZCA/IGdlblRyYW5zZm9ybWF0b3JzKCk6IFtdKVxyXG4gICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHBpcGUudmFsdWUgPT09IHRydWUgfHwgcGlwZS52YWx1ZSA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBoKCdzZWxlY3QnLCB7bGl2ZVByb3BzOiB7dmFsdWU6ICBwaXBlLnZhbHVlLnRvU3RyaW5nKCl9LCBzdHlsZToge30sICBvbjoge2NsaWNrOiBbU0VMRUNUX1BJUEUsIHJlZi5pZF0sIGlucHV0OiBbQ0hBTkdFX1NUQVRJQ19WQUxVRSwgcmVmLCAndmFsdWUnLCAnYm9vbGVhbiddLCBtb3VzZW1vdmU6IFtQSVBFX0hPVkVSRUQsIHJlZl19fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIGgoJ29wdGlvbicsIHthdHRyczoge3ZhbHVlOiAndHJ1ZSd9LCBzdHlsZToge2NvbG9yOiAnYmxhY2snfX0sIFsndHJ1ZSddKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdvcHRpb24nLCB7YXR0cnM6IHt2YWx1ZTogJ2ZhbHNlJ30sIHN0eWxlOiB7Y29sb3I6ICdibGFjayd9fSwgWydmYWxzZSddKSxcclxuICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghaXNOYU4ocGFyc2VGbG9hdChOdW1iZXIocGlwZS52YWx1ZSkpKSAmJiBpc0Zpbml0ZShOdW1iZXIocGlwZS52YWx1ZSkpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge3N0eWxlOiB7cG9zaXRpb246ICdyZWxhdGl2ZSd9fSwgW2goJ2RpdicsIHtzdHlsZTp7ZGlzcGxheTonZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInfSwgb246IHtjbGljazogW1NFTEVDVF9QSVBFLCByZWYuaWRdfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICBoKCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzOiB7dHlwZTonbnVtYmVyJ30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbjogICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHREZWNvcmF0aW9uOiAndW5kZXJsaW5lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBbQ0hBTkdFX1NUQVRJQ19WQUxVRSwgcmVmLCAndmFsdWUnLCAnbnVtYmVyJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW91c2Vtb3ZlOiBbUElQRV9IT1ZFUkVELCByZWZdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGl2ZVByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IE51bWJlcihwaXBlLnZhbHVlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcwJywgY3Vyc29yOiAnZGVmYXVsdCcsIGNvbG9yOiBwaXBlLnRyYW5zZm9ybWF0aW9ucy5sZW5ndGggPiAwID8gJyNiZGJkYmQnOiB0eXBlID09PSAnbnVtYmVyJyA/ICdncmVlbic6ICdyZWQnfX0sICdudW1iZXInKVxyXG4gICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ0xlZnQ6ICcxNXB4J319LCBsaXN0VHJhbnNmb3JtYXRpb25zKHBpcGUudHJhbnNmb3JtYXRpb25zLCBwaXBlLnR5cGUpKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCBzdGF0ZS5zZWxlY3RlZFBpcGVJZCA9PT0gcmVmLmlkID8gZ2VuVHJhbnNmb3JtYXRvcnMoKTogW10pXHJcbiAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZihwaXBlLnZhbHVlLnJlZiA9PT0gJ3N0YXRlJyl7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkaXNwbFN0YXRlID0gc3RhdGUuZGVmaW5pdGlvbltwaXBlLnZhbHVlLnJlZl1bcGlwZS52YWx1ZS5pZF1cclxuICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7c3R5bGU6IHtwb3NpdGlvbjogJ3JlbGF0aXZlJywgY3Vyc29yOiAncG9pbnRlcid9fSwgW2goJ2RpdicsIHtzdHlsZTp7ZGlzcGxheTonZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInfSwgb246IHtjbGljazogW1NFTEVDVF9QSVBFLCByZWYuaWRdLCBtb3VzZW1vdmU6IFtQSVBFX0hPVkVSRUQsIHJlZl19fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcxJ319LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7d2hpdGVTcGFjZTogJ25vd3JhcCcsZmxleDogJzAgMCBhdXRvJywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsIHBvc2l0aW9uOiAncmVsYXRpdmUnLCB0cmFuc2Zvcm06ICd0cmFuc2xhdGVaKDApJywgYm94U2hhZG93OiAnaW5zZXQgMCAwIDAgMnB4ICcgKyAoc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gcGlwZS52YWx1ZS5pZD8gJyNlYWI2NWMnOiAnIzgyODI4MicpICwgYmFja2dyb3VuZDogJyM0NDQnLCBwYWRkaW5nOiAnNHB4IDdweCcsfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7Y29sb3I6ICd3aGl0ZScsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snfSwgb246IHtjbGljazogW1NUQVRFX05PREVfU0VMRUNURUQsIHBpcGUudmFsdWUuaWRdfX0sIGRpc3BsU3RhdGUudGl0bGUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ0xlZnQ6ICcxNXB4J319LCBsaXN0VHJhbnNmb3JtYXRpb25zKHBpcGUudHJhbnNmb3JtYXRpb25zLCBwaXBlLnR5cGUpKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCBzdGF0ZS5zZWxlY3RlZFBpcGVJZCA9PT0gcmVmLmlkID8gZ2VuVHJhbnNmb3JtYXRvcnMoKTogW10pXHJcbiAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHBpcGUudmFsdWUucmVmID09PSAnbGlzdFZhbHVlJyl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2JywgJ1RPRE8nKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHBpcGUudmFsdWUucmVmID09PSAnZXZlbnREYXRhJyl7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudERhdGEgPSBzdGF0ZS5kZWZpbml0aW9uW3BpcGUudmFsdWUucmVmXVtwaXBlLnZhbHVlLmlkXVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIFtoKCdkaXYnLCB7c3R5bGU6e2Rpc3BsYXk6J2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJ30sIG9uOiB7Y2xpY2s6IFtTRUxFQ1RfUElQRSwgcmVmLmlkXX19LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzEnfX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtoKCdkaXYnLHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJywgY29sb3I6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHBpcGUudmFsdWUuaWQgPyAnI2VhYjY1Yyc6ICd3aGl0ZScsIHBhZGRpbmc6ICcycHggNXB4JywgbWFyZ2luOiAnM3B4IDNweCAwIDAnLCBib3JkZXI6ICcycHggc29saWQgJyArIChzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBwaXBlLnZhbHVlLmlkID8gJyNlYWI2NWMnOiAnd2hpdGUnKSwgZGlzcGxheTogJ2lubGluZS1ibG9jayd9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7Y2xpY2s6IFtTVEFURV9OT0RFX1NFTEVDVEVELCBwaXBlLnZhbHVlLmlkXX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbZXZlbnREYXRhLnRpdGxlXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzAnLCBjdXJzb3I6ICdkZWZhdWx0JywgY29sb3I6IHBpcGUudHJhbnNmb3JtYXRpb25zLmxlbmd0aCA+IDAgPyAnI2JkYmRiZCc6IGV2ZW50RGF0YS50eXBlID09PSB0eXBlID8gJ2dyZWVuJzogJ3JlZCd9fSwgZXZlbnREYXRhLnR5cGUpXHJcbiAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nTGVmdDogJzE1cHgnfX0sIGxpc3RUcmFuc2Zvcm1hdGlvbnMocGlwZS50cmFuc2Zvcm1hdGlvbnMsIHBpcGUudHlwZSkpLFxyXG4gICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbGlzdFN0YXRlKHN0YXRlSWQpIHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudFN0YXRlID0gc3RhdGUuZGVmaW5pdGlvbi5zdGF0ZVtzdGF0ZUlkXVxyXG4gICAgICAgICAgICBmdW5jdGlvbiBlZGl0aW5nTm9kZSgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBoKCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZTogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnNHB4IDdweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udDogJ2luaGVyaXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmxleDogJzAgMCBhdXRvJyxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBbQ0hBTkdFX1NUQVRFX05PREVfVElUTEUsIHN0YXRlSWRdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbGl2ZVByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdXJyZW50U3RhdGUudGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBhdHRyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pc3RpdGxlZWRpdG9yJzogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTRweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2Rpc3BsYXk6ICdmbGV4JywgZmxleFdyYXA6ICd3cmFwJywgbWFyZ2luVG9wOiAnNnB4J319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCAwIGF1dG8nLCAgcG9zaXRpb246ICdyZWxhdGl2ZScsIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVooMCknLCBtYXJnaW46ICcwIDdweCAwIDAnLCAgYm94U2hhZG93OiAnaW5zZXQgMCAwIDAgMnB4ICcgKyAoc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gc3RhdGVJZCA/ICcjZWFiNjVjJzogJyM4MjgyODInKSAsIGJhY2tncm91bmQ6ICcjNDQ0JywgcGFkZGluZzogJzRweCA3cHgnLH19LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7b3BhY2l0eTogc3RhdGUuZWRpdGluZ1RpdGxlTm9kZUlkID09PSBzdGF0ZUlkID8gJzAnOiAnMScsIGNvbG9yOiAnd2hpdGUnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJ30sIG9uOiB7bW91c2Vkb3duOiBbU1RBVEVfRFJBR0dFRCwgc3RhdGVJZF0sIHRvdWNoc3RhcnQ6IFtTVEFURV9EUkFHR0VELCBzdGF0ZUlkXSwgdG91Y2htb3ZlOiBbSE9WRVJfTU9CSUxFXSwgZGJsY2xpY2s6IFtFRElUX1ZJRVdfTk9ERV9USVRMRSwgc3RhdGVJZF19fSwgY3VycmVudFN0YXRlLnRpdGxlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLmVkaXRpbmdUaXRsZU5vZGVJZCA9PT0gc3RhdGVJZCA/IGVkaXRpbmdOb2RlKCk6IGgoJ3NwYW4nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICgoKT0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vU3R5bGVJbnB1dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogY3VycmVudFJ1bm5pbmdTdGF0ZVtzdGF0ZUlkXSAhPT0gc3RhdGUuZGVmaW5pdGlvbi5zdGF0ZVtzdGF0ZUlkXS5kZWZhdWx0VmFsdWUgPyAncmdiKDkxLCAyMDQsIDkxKScgOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmxleDogJzEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbldpZHRoOiAnNTBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm94U2hhZG93OiAnaW5zZXQgMCAtMnB4IDAgMCAnICsgKHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHN0YXRlSWQgPyAnI2VhYjY1Yyc6ICcjODI4MjgyJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGN1cnJlbnRTdGF0ZS50eXBlID09PSAndGV4dCcpIHJldHVybiBoKCdpbnB1dCcsIHthdHRyczoge3R5cGU6ICd0ZXh0J30sIGxpdmVQcm9wczoge3ZhbHVlOiBjdXJyZW50UnVubmluZ1N0YXRlW3N0YXRlSWRdfSwgc3R5bGU6IG5vU3R5bGVJbnB1dCwgb246IHtpbnB1dDogW0NIQU5HRV9DVVJSRU5UX1NUQVRFX1RFWFRfVkFMVUUsIHN0YXRlSWRdfX0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihjdXJyZW50U3RhdGUudHlwZSA9PT0gJ251bWJlcicpIHJldHVybiBoKCdpbnB1dCcsIHthdHRyczoge3R5cGU6ICdudW1iZXInfSwgbGl2ZVByb3BzOiB7dmFsdWU6IGN1cnJlbnRSdW5uaW5nU3RhdGVbc3RhdGVJZF19LCBzdHlsZTogbm9TdHlsZUlucHV0LCAgb246IHtpbnB1dDogW0NIQU5HRV9DVVJSRU5UX1NUQVRFX05VTUJFUl9WQUxVRSwgc3RhdGVJZF19fSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKGN1cnJlbnRTdGF0ZS50eXBlID09PSAnYm9vbGVhbicpIHJldHVybiBoKCdzZWxlY3QnLCB7bGl2ZVByb3BzOiB7dmFsdWU6IGN1cnJlbnRSdW5uaW5nU3RhdGVbc3RhdGVJZF0udG9TdHJpbmcoKX0sIHN0eWxlOiBub1N0eWxlSW5wdXQsICBvbjoge2lucHV0OiBbQ0hBTkdFX0NVUlJFTlRfU1RBVEVfVEVYVF9WQUxVRSwgc3RhdGVJZF19fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ29wdGlvbicsIHthdHRyczoge3ZhbHVlOiAndHJ1ZSd9LCBzdHlsZToge2NvbG9yOiAnYmxhY2snfX0sIFsndHJ1ZSddKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdvcHRpb24nLCB7YXR0cnM6IHt2YWx1ZTogJ2ZhbHNlJ30sIHN0eWxlOiB7Y29sb3I6ICdibGFjayd9fSwgWydmYWxzZSddKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihjdXJyZW50U3RhdGUudHlwZSA9PT0gJ3RhYmxlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgIT09IHN0YXRlSWQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge2tleTogJ2ljb24nLG9uOiB7Y2xpY2s6IFtTVEFURV9OT0RFX1NFTEVDVEVELCBzdGF0ZUlkXX0sIHN0eWxlOiB7ZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgbWFyZ2luVG9wOiAnN3B4J319LCBbbGlzdEljb24oKV0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhYmxlID0gY3VycmVudFJ1bm5pbmdTdGF0ZVtzdGF0ZUlkXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiAndGFibGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzgyODE4MycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbGV4OiAnMCAwIDEwMCUnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZGlzcGxheTogJ2ZsZXgnfX0sICBPYmplY3Qua2V5cyhjdXJyZW50U3RhdGUuZGVmaW5pdGlvbikubWFwKGtleSA9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtmbGV4OiAnMScsIHBhZGRpbmc6ICcycHggNXB4JywgYm9yZGVyQm90dG9tOiAnMnB4IHNvbGlkIHdoaXRlJ319LCBrZXkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLk9iamVjdC5rZXlzKHRhYmxlKS5tYXAoaWQgPT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtkaXNwbGF5OiAnZmxleCd9fSwgT2JqZWN0LmtleXModGFibGVbaWRdKS5tYXAoa2V5ID0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcxJywgcGFkZGluZzogJzJweCA1cHgnfX0sIHRhYmxlW2lkXVtrZXldKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdGF0ZS50eXBlICE9PSAndGFibGUnICYmIGN1cnJlbnRSdW5uaW5nU3RhdGVbc3RhdGVJZF0gIT09IHN0YXRlLmRlZmluaXRpb24uc3RhdGVbc3RhdGVJZF0uZGVmYXVsdFZhbHVlID8gaCgnZGl2Jywge3N0eWxlOiB7ZGlzcGxheTogJ2lubGluZS1mbGV4JywgYWxpZ25TZWxmOiAnY2VudGVyJ30sIG9uOiB7Y2xpY2s6IFtTQVZFX0RFRkFVTFQsIHN0YXRlSWRdfX0sIFtzYXZlSWNvbigpXSk6IGgoJ3NwYW4nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gc3RhdGVJZCAmJiBjdXJyZW50U3RhdGUudHlwZSAhPT0gJ3RhYmxlJyA/IGgoJ2RpdicsIHtzdHlsZToge2Rpc3BsYXk6ICdpbmxpbmUtZmxleCcsIGFsaWduU2VsZjogJ2NlbnRlcid9LCBvbjoge2NsaWNrOiBbREVMRVRFX1NUQVRFLCBzdGF0ZUlkXX19LCBbZGVsZXRlSWNvbigpXSk6IGgoJ3NwYW4nKVxyXG4gICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHN0YXRlSWQgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRTdGF0ZS5tdXRhdG9ycy5tYXAobXV0YXRvclJlZiA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG11dGF0b3IgPSBzdGF0ZS5kZWZpbml0aW9uW211dGF0b3JSZWYucmVmXVttdXRhdG9yUmVmLmlkXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBldmVudCA9IHN0YXRlLmRlZmluaXRpb25bbXV0YXRvci5ldmVudC5yZWZdW211dGF0b3IuZXZlbnQuaWRdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVtaXR0ZXIgPSBzdGF0ZS5kZWZpbml0aW9uW2V2ZW50LmVtaXR0ZXIucmVmXVtldmVudC5lbWl0dGVyLmlkXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge3N0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM0NDQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ1RvcDogJzNweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nQm90dG9tOiAnM3B4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBldmVudC5lbWl0dGVyLmlkID8gJyM1M0IyRUQnOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJzAuMnMgYWxsJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1pbldpZHRoOiAnMTAwJScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIG9uOiB7Y2xpY2s6IFtWSUVXX05PREVfU0VMRUNURUQsIGV2ZW50LmVtaXR0ZXJdfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCAwIGF1dG8nLCBtYXJnaW46ICcwIDNweCAwIDVweCcsIGRpc3BsYXk6ICdpbmxpbmUtZmxleCd9fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LmVtaXR0ZXIucmVmID09PSAndk5vZGVCb3gnID8gYm94SWNvbigpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuZW1pdHRlci5yZWYgPT09ICd2Tm9kZUxpc3QnID8gbGlzdEljb24oKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudC5lbWl0dGVyLnJlZiA9PT0gJ3ZOb2RlTGlzdCcgPyBpZkljb24oKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuZW1pdHRlci5yZWYgPT09ICd2Tm9kZUlucHV0JyA/IGlucHV0SWNvbigpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dEljb24oKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICc1IDUgYXV0bycsIG1hcmdpbjogJzAgNXB4IDAgMCcsIG1pbldpZHRoOiAnMCcsIG92ZXJmbG93OiAnaGlkZGVuJywgd2hpdGVTcGFjZTogJ25vd3JhcCcsIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJ319LCBlbWl0dGVyLnRpdGxlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCAwIGF1dG8nLCBtYXJnaW5MZWZ0OiAnYXV0bycsIG1hcmdpblJpZ2h0OiAnNXB4JywgY29sb3I6ICcjNWJjYzViJ319LCBldmVudC50eXBlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nKSxcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZmFrZVN0YXRlKHN0YXRlSWQpIHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudFN0YXRlID0gc3RhdGUuZGVmaW5pdGlvbi5zdGF0ZVtzdGF0ZUlkXVxyXG4gICAgICAgICAgICByZXR1cm4gaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwIDAgYXV0bycsICBwb3NpdGlvbjogJ3JlbGF0aXZlJywgdHJhbnNmb3JtOiAndHJhbnNsYXRlWigwKScsIG1hcmdpbjogJzdweCA3cHggMCAwJywgIGJveFNoYWRvdzogJ2luc2V0IDAgMCAwIDJweCAnICsgKHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHN0YXRlSWQgPyAnI2VhYjY1Yyc6ICcjODI4MjgyJykgLCBiYWNrZ3JvdW5kOiAnIzQ0NCcsIHBhZGRpbmc6ICc0cHggN3B4Jyx9fSwgW1xyXG4gICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2NvbG9yOiAnd2hpdGUnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJ319LCBjdXJyZW50U3RhdGUudGl0bGUpLFxyXG4gICAgICAgICAgICBdKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgc3RhdGVDb21wb25lbnQgPSBoKCdkaXYnLCB7IGF0dHJzOiB7Y2xhc3M6ICdiZXR0ZXItc2Nyb2xsYmFyJ30sIHN0eWxlOiB7b3ZlcmZsb3c6ICdhdXRvJywgZmxleDogJzEnLCBwYWRkaW5nOiAnMCAxMHB4J30sIG9uOiB7Y2xpY2s6IFtVTlNFTEVDVF9TVEFURV9OT0RFXX19LCBzdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZVsnX3Jvb3ROYW1lU3BhY2UnXS5jaGlsZHJlbi5tYXAoKHJlZik9PiBsaXN0U3RhdGUocmVmLmlkKSkpXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxpc3ROb2RlKG5vZGVSZWYsIHBhcmVudFJlZiwgZGVwdGgpe1xyXG4gICAgICAgICAgICBpZihub2RlUmVmLmlkID09PSAnX3Jvb3ROb2RlJykgcmV0dXJuIGxpc3RSb290Tm9kZShub2RlUmVmKVxyXG4gICAgICAgICAgICBpZihub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlVGV4dCcpIHJldHVybiBzaW1wbGVOb2RlKG5vZGVSZWYsIHBhcmVudFJlZiwgZGVwdGgpXHJcbiAgICAgICAgICAgIGlmKG5vZGVSZWYucmVmID09PSAndk5vZGVJbWFnZScpIHJldHVybiBzaW1wbGVOb2RlKG5vZGVSZWYsIHBhcmVudFJlZiwgZGVwdGgpXHJcbiAgICAgICAgICAgIGlmKG5vZGVSZWYucmVmID09PSAndk5vZGVCb3gnIHx8IG5vZGVSZWYucmVmID09PSAndk5vZGVMaXN0JyB8fCBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlSWYnKSByZXR1cm4gbGlzdEJveE5vZGUobm9kZVJlZiwgcGFyZW50UmVmLCBkZXB0aClcclxuICAgICAgICAgICAgaWYobm9kZVJlZi5yZWYgPT09ICd2Tm9kZUlucHV0JykgcmV0dXJuIHNpbXBsZU5vZGUobm9kZVJlZiwgcGFyZW50UmVmLCBkZXB0aClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHByZXZlbnRfYnViYmxpbmcoZSkge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGVkaXRpbmdOb2RlKG5vZGVSZWYpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2lucHV0Jywge1xyXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcyNnB4JyxcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjNTNCMkVEJyxcclxuICAgICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgZmxleDogJzEnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICdpbnNldCAwIC0xcHggMCAwICM1M0IyRUQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnQ6ICdpbmhlcml0JyxcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nTGVmdDogJzJweCcsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZWRvd246IHByZXZlbnRfYnViYmxpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IFtDSEFOR0VfVklFV19OT0RFX1RJVExFLCBub2RlUmVmXSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBsaXZlUHJvcHM6IHtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZVJlZi5pZF0udGl0bGUsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgYXR0cnM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhdXRvZm9jdXM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2RhdGEtaXN0aXRsZWVkaXRvcic6IHRydWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxpc3RSb290Tm9kZShub2RlUmVmKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGVJZCA9IG5vZGVSZWYuaWRcclxuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVJZF1cclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nTGVmdDogJzhweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdSaWdodDogJzhweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNDQ0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyVG9wOiAnMnB4IHNvbGlkICM0ZDRkNGQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJCb3R0b206ICcycHggc29saWQgIzMzMycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzI2cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGl0ZVNwYWNlOiAnbm93cmFwJyxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbjoge21vdXNlbW92ZTogW1ZJRVdfSE9WRVJFRCwgbm9kZVJlZiwge30sIDFdLCB0b3VjaG1vdmU6IFtIT1ZFUl9NT0JJTEVdfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sICBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7a2V5OiBub2RlSWQsIHN0eWxlOiB7Y29sb3I6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJyNiZGJkYmQnLCBkaXNwbGF5OiAnaW5saW5lLWZsZXgnfSwgb246IHtjbGljazogW1ZJRVdfTk9ERV9TRUxFQ1RFRCwgbm9kZVJlZl19fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwSWNvbigpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQgPT09IG5vZGVJZCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZGl0aW5nTm9kZShub2RlUmVmKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7IHN0eWxlOiB7ZmxleDogJzEnLCBjdXJzb3I6ICdwb2ludGVyJywgY29sb3I6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJ3doaXRlJywgdHJhbnNpdGlvbjogJ2NvbG9yIDAuMnMnLCBwYWRkaW5nTGVmdDogJzJweCd9LCBvbjoge2NsaWNrOiBbVklFV19OT0RFX1NFTEVDVEVELCBub2RlUmVmXSwgZGJsY2xpY2s6IFtFRElUX1ZJRVdfTk9ERV9USVRMRSwgbm9kZUlkXX19LCBub2RlLnRpdGxlKSxcclxuICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCBzdGF0ZS5ob3ZlcmVkVmlld05vZGUgJiYgc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBhcmVudC5pZCA9PT0gbm9kZUlkICYmICEobm9kZS5jaGlsZHJlbi5maW5kSW5kZXgoKHJlZik9PiByZWYuaWQgPT09IHN0YXRlLmRyYWdnZWRDb21wb25lbnRWaWV3LmlkKSA9PT0gc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBvc2l0aW9uKSA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICgoKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29weSBwYXN0ZWQgZnJvbSBsaXN0Qm94Tm9kZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgb2xkUG9zaXRpb24gPSBub2RlLmNoaWxkcmVuLmZpbmRJbmRleCgocmVmKT0+IHJlZi5pZCA9PT0gc3RhdGUuZHJhZ2dlZENvbXBvbmVudFZpZXcuaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdQb3NpdGlvbiA9IG9sZFBvc2l0aW9uID09PSAtMSB8fCBzdGF0ZS5ob3ZlcmVkVmlld05vZGUucG9zaXRpb24gPCBvbGRQb3NpdGlvbiA/IHN0YXRlLmhvdmVyZWRWaWV3Tm9kZS5wb3NpdGlvbiA6IHN0YXRlLmhvdmVyZWRWaWV3Tm9kZS5wb3NpdGlvbiArIDFcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbi5tYXAoKHJlZik9Pmxpc3ROb2RlKHJlZiwgbm9kZVJlZiwgMSkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2hpbGRyZW4uc2xpY2UoMCwgbmV3UG9zaXRpb24pLmNvbmNhdChzcGFjZXJDb21wb25lbnQoKSwgY2hpbGRyZW4uc2xpY2UobmV3UG9zaXRpb24pKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSgpOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmNoaWxkcmVuLm1hcCgocmVmKT0+bGlzdE5vZGUocmVmLCBub2RlUmVmLCAxKSlcclxuICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nTGVmdDogJzhweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nUmlnaHQ6ICc4cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTVweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbjoge21vdXNlbW92ZTogW1ZJRVdfSE9WRVJFRCwge2lkOiAnX2xhc3ROb2RlJ30sIHt9LCAxXSwgdG91Y2htb3ZlOiBbSE9WRVJfTU9CSUxFXX19XHJcbiAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbGlzdEJveE5vZGUobm9kZVJlZiwgcGFyZW50UmVmLCBkZXB0aCkge1xyXG4gICAgICAgICAgICBjb25zdCBub2RlSWQgPSBub2RlUmVmLmlkXHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBzdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlSWRdXHJcbiAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7c3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiBzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50VmlldyAmJiBzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50Vmlldy5pZCA9PT0gbm9kZUlkID8gJzAuNScgOiAnMS4wJyxcclxuICAgICAgICAgICAgICAgIH19LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk6IG5vZGVJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzI2cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdMZWZ0OiAoZGVwdGggLSAobm9kZS5jaGlsZHJlbi5sZW5ndGggPiAwIHx8IChzdGF0ZS5ob3ZlcmVkVmlld05vZGUgJiYgc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBhcmVudC5pZCA9PT0gbm9kZUlkKSA/IDE6IDApKSAqMjAgKyA4KyAncHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ1JpZ2h0OiAnOHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNDQ0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclRvcDogJzJweCBzb2xpZCAjNGQ0ZDRkJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTogJzJweCBzb2xpZCAjMzMzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaXRlU3BhY2U6ICdub3dyYXAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJ3doaXRlJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbjoge21vdXNlZG93bjogW1ZJRVdfRFJBR0dFRCwgbm9kZVJlZiwgcGFyZW50UmVmLCBkZXB0aF0sIHRvdWNoc3RhcnQ6IFtWSUVXX0RSQUdHRUQsIG5vZGVSZWYsIHBhcmVudFJlZiwgZGVwdGhdLCBtb3VzZW1vdmU6IFtWSUVXX0hPVkVSRUQsIG5vZGVSZWYsIHBhcmVudFJlZiwgZGVwdGhdLCB0b3VjaG1vdmU6IFtIT1ZFUl9NT0JJTEVdfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5jaGlsZHJlbi5sZW5ndGggPiAwIHx8IChzdGF0ZS5ob3ZlcmVkVmlld05vZGUgJiYgc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBhcmVudC5pZCA9PT0gbm9kZUlkKSA/IGgoJ3NwYW4nLCB7c3R5bGU6IHtkaXNwbGF5OiAnaW5saW5lLWZsZXgnfX0sIFthcnJvd0ljb24oc3RhdGUudmlld0ZvbGRlcnNDbG9zZWRbbm9kZUlkXSB8fCAoc3RhdGUuZHJhZ2dlZENvbXBvbmVudFZpZXcgJiYgbm9kZUlkID09PSBzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50Vmlldy5pZCkpXSk6IGgoJ3NwYW4nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtrZXk6IG5vZGVJZCwgc3R5bGU6IHtkaXNwbGF5OiAnaW5saW5lLWZsZXgnLCBjb2xvcjogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJyM1M0IyRUQnOiAnI2JkYmRiZCcsIHRyYW5zaXRpb246ICdjb2xvciAwLjJzJ319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlQm94JyA/IGJveEljb24oKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVJlZi5yZWYgPT09ICd2Tm9kZUxpc3QnID8gbGlzdEljb24oKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmSWNvbigpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQgPT09IG5vZGVJZCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZGl0aW5nTm9kZShub2RlUmVmKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7IHN0eWxlOiB7ZmxleDogJzEnLCBjdXJzb3I6ICdwb2ludGVyJywgdHJhbnNpdGlvbjogJ2NvbG9yIDAuMnMnLCBwYWRkaW5nTGVmdDogJzJweCcsIG92ZXJmbG93OiAnaGlkZGVuJywgd2hpdGVTcGFjZTogJ25vd3JhcCcsIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJ30sIG9uOiB7ZGJsY2xpY2s6IFtFRElUX1ZJRVdfTk9ERV9USVRMRSwgbm9kZUlkXX19LCBub2RlLnRpdGxlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7Y29sb3I6ICcjNTNCMkVEJywgY3Vyc29yOiAncG9pbnRlcicsIGRpc3BsYXk6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICdpbmxpbmUtZmxleCc6ICdub25lJywgZmxleDogJzAgMCBhdXRvJ319LCBbZGVsZXRlSWNvbigpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgZGlzcGxheTogc3RhdGUudmlld0ZvbGRlcnNDbG9zZWRbbm9kZUlkXSB8fCAoc3RhdGUuZHJhZ2dlZENvbXBvbmVudFZpZXcgJiYgbm9kZUlkID09PSBzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50Vmlldy5pZCkgPyAnbm9uZSc6ICdibG9jayd9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBzdGF0ZS5ob3ZlcmVkVmlld05vZGUgJiYgc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBhcmVudC5pZCA9PT0gbm9kZUlkICYmICEobm9kZS5jaGlsZHJlbi5maW5kSW5kZXgoKHJlZik9PiByZWYuaWQgPT09IHN0YXRlLmRyYWdnZWRDb21wb25lbnRWaWV3LmlkKSA9PT0gc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBvc2l0aW9uKSA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKCk9PntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGRzIGEgZmFrZSBjb21wb25lbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvbGRQb3NpdGlvbiA9IG5vZGUuY2hpbGRyZW4uZmluZEluZGV4KChyZWYpPT4gcmVmLmlkID09PSBzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50Vmlldy5pZCkgLy8gdGhpcyBpcyBuZWVkZWQgYmVjYXVzZSB3ZSBzdGlsbCBzaG93IHRoZSBvbGQgbm9kZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1Bvc2l0aW9uID0gb2xkUG9zaXRpb24gPT09IC0xIHx8IHN0YXRlLmhvdmVyZWRWaWV3Tm9kZS5wb3NpdGlvbiA8IG9sZFBvc2l0aW9uID8gc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBvc2l0aW9uIDogc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBvc2l0aW9uICsgMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbi5tYXAoKHJlZik9Pmxpc3ROb2RlKHJlZiwgbm9kZVJlZiwgZGVwdGgrMSkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkcmVuLnNsaWNlKDAsIG5ld1Bvc2l0aW9uKS5jb25jYXQoc3BhY2VyQ29tcG9uZW50KCksIGNoaWxkcmVuLnNsaWNlKG5ld1Bvc2l0aW9uKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKCk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLmNoaWxkcmVuLm1hcCgocmVmKT0+bGlzdE5vZGUocmVmLCBub2RlUmVmLCBkZXB0aCsxKSlcclxuICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIHNpbXBsZU5vZGUobm9kZVJlZiwgcGFyZW50UmVmLCBkZXB0aCkge1xyXG4gICAgICAgICAgICBjb25zdCBub2RlSWQgPSBub2RlUmVmLmlkXHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBzdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlSWRdXHJcbiAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5OiBub2RlSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IHN0YXRlLmRyYWdnZWRDb21wb25lbnRWaWV3ICYmIHN0YXRlLmRyYWdnZWRDb21wb25lbnRWaWV3LmlkID09PSBub2RlSWQgPyAnMC41JyA6ICcxLjAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMjZweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdMZWZ0OiBkZXB0aCAqMjAgKyA4ICsncHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nUmlnaHQ6ICc4cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzQ0NCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclRvcDogJzJweCBzb2xpZCAjNGQ0ZDRkJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiAnMnB4IHNvbGlkICMzMzMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGl0ZVNwYWNlOiAnbm93cmFwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJyNiZGJkYmQnLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb246IHttb3VzZWRvd246IFtWSUVXX0RSQUdHRUQsIG5vZGVSZWYsIHBhcmVudFJlZiwgZGVwdGhdLCB0b3VjaHN0YXJ0OiBbVklFV19EUkFHR0VELCBub2RlUmVmLCBwYXJlbnRSZWYsIGRlcHRoXSwgZGJsY2xpY2s6IFtFRElUX1ZJRVdfTk9ERV9USVRMRSwgbm9kZUlkXSwgbW91c2Vtb3ZlOiBbVklFV19IT1ZFUkVELCBub2RlUmVmLCBwYXJlbnRSZWYsIGRlcHRoXSwgdG91Y2htb3ZlOiBbSE9WRVJfTU9CSUxFXX1cclxuICAgICAgICAgICAgICAgIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlSW5wdXQnID8gaW5wdXRJY29uKCkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlSW1hZ2UnID8gaW1hZ2VJY29uKCkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dEljb24oKSxcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQgPT09IG5vZGVJZCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVkaXRpbmdOb2RlKG5vZGVSZWYpOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnLCBjb2xvcjogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJyM1M0IyRUQnOiAnd2hpdGUnLCB0cmFuc2l0aW9uOiAnY29sb3IgMC4ycycsIHBhZGRpbmdMZWZ0OiAnMnB4Jywgb3ZlcmZsb3c6ICdoaWRkZW4nLCB3aGl0ZVNwYWNlOiAnbm93cmFwJywgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnfX0sIG5vZGUudGl0bGUpLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2NvbG9yOiAnIzUzQjJFRCcsIGN1cnNvcjogJ3BvaW50ZXInLCBkaXNwbGF5OiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnaW5saW5lLWZsZXgnOiAnbm9uZScsIGZsZXg6ICcwIDAgYXV0byd9fSwgW2RlbGV0ZUljb24oKV0pLFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzcGFjZXJDb21wb25lbnQoKXtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgIGtleTogJ3NwYWNlcicsXHJcbiAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzZweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYm94U2hhZG93OiAnaW5zZXQgMCAwIDFweCAxcHggIzUzQjJFRCcsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBmYWtlQ29tcG9uZW50KG5vZGVSZWYsIGRlcHRoLCkge1xyXG4gICAgICAgICAgICBjb25zdCBub2RlSWQgPSBub2RlUmVmLmlkXHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBzdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlSWRdXHJcbiAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnX2Zha2UnK25vZGVJZCxcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ3BhZGRpbmctbGVmdCAwLjJzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMjZweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdMZWZ0OiAoZGVwdGggLSAobm9kZS5jaGlsZHJlbiAmJiBub2RlLmNoaWxkcmVuLmxlbmd0aCA+IDAgPyAxOiAwKSkgKjIwICsgOCArJ3B4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ1JpZ2h0OiAnOHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJ3JnYmEoNjgsNjgsNjgsMC44KScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclRvcDogJzJweCBzb2xpZCAjNGQ0ZDRkJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiAnMnB4IHNvbGlkICMzMzMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGl0ZVNwYWNlOiAnbm93cmFwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJyNiZGJkYmQnLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgKG5vZGVSZWYucmVmID09PSAndk5vZGVCb3gnIHx8IG5vZGVSZWYucmVmID09PSAndk5vZGVMaXN0JyB8fCBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlSWYnKSAmJiBub2RlLmNoaWxkcmVuLmxlbmd0aCA+IDAgID8gYXJyb3dJY29uKHRydWUpOiBoKCdzcGFuJywge2tleTogJ19mYWtlU3Bhbicrbm9kZUlkfSksXHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZVJlZi5yZWYgPT09ICd2Tm9kZUJveCcgPyBib3hJY29uKCkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlTGlzdCcgPyBsaXN0SWNvbigpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVSZWYucmVmID09PSAndk5vZGVJZicgPyBpZkljb24oKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlSW5wdXQnID8gaW5wdXRJY29uKCkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlSW1hZ2UnID8gaW1hZ2VJY29uKCkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dEljb24oKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnLCBjb2xvcjogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJyM1M0IyRUQnOiAnd2hpdGUnLCB0cmFuc2l0aW9uOiAnY29sb3IgMC4ycycsIHBhZGRpbmdMZWZ0OiAnMnB4Jywgb3ZlcmZsb3c6ICdoaWRkZW4nLCB3aGl0ZVNwYWNlOiAnbm93cmFwJywgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnfX0sIG5vZGUudGl0bGUpLFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZW5lcmF0ZUVkaXROb2RlQ29tcG9uZW50KCkge1xyXG4gICAgICAgICAgICBjb25zdCBzdHlsZXMgPSBbJ2JhY2tncm91bmQnLCAnYm9yZGVyJywgJ291dGxpbmUnLCAnY3Vyc29yJywgJ2NvbG9yJywgJ2Rpc3BsYXknLCAndG9wJywgJ2JvdHRvbScsICdsZWZ0JywgJ2ZsZXgnLCAnanVzdGlmeUNvbnRlbnQnLCAnYWxpZ25JdGVtcycsICd3aWR0aCcsICdoZWlnaHQnLCAnbWF4V2lkdGgnLCAnbWF4SGVpZ2h0JywgJ21pbldpZHRoJywgJ21pbkhlaWdodCcsICdyaWdodCcsICdwb3NpdGlvbicsICdvdmVyZmxvdycsICdmb250JywgJ21hcmdpbicsICdwYWRkaW5nJ11cclxuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWROb2RlID0gc3RhdGUuZGVmaW5pdGlvbltzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZl1bc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZF1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHByb3BzQ29tcG9uZW50ID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBzdGF0ZS5zZWxlY3RlZFZpZXdTdWJNZW51ID09PSAncHJvcHMnID8gJyM0ZDRkNGQnOiAnIzNkM2QzZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEwcHggMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZmxleDogJzEnLFxyXG4gICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICBjbGljazogW1NFTEVDVF9WSUVXX1NVQk1FTlUsICdwcm9wcyddXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sICdkYXRhJylcclxuICAgICAgICAgICAgY29uc3Qgc3R5bGVDb21wb25lbnQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IHN0YXRlLnNlbGVjdGVkVmlld1N1Yk1lbnUgPT09ICdzdHlsZScgPyAnIzRkNGQ0ZCc6ICcjM2QzZDNkJyxcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTBweCAwJyxcclxuICAgICAgICAgICAgICAgICAgICBmbGV4OiAnMScsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmlnaHQ6ICcxcHggc29saWQgIzIyMicsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyTGVmdDogJzFweCBzb2xpZCAjMjIyJyxcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xpY2s6IFtTRUxFQ1RfVklFV19TVUJNRU5VLCAnc3R5bGUnXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAnc3R5bGUnKVxyXG4gICAgICAgICAgICBjb25zdCBldmVudHNDb21wb25lbnQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IHN0YXRlLnNlbGVjdGVkVmlld1N1Yk1lbnUgPT09ICdldmVudHMnID8gJyM0ZDRkNGQnOiAnIzNkM2QzZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEwcHggMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZmxleDogJzEnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICBjbGljazogW1NFTEVDVF9WSUVXX1NVQk1FTlUsICdldmVudHMnXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCAnZXZlbnRzJylcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGdlbnByb3BzU3VibWVudUNvbXBvbmVudCA9ICgpID0+IGgoJ2RpdicsIFsoKCk9PntcclxuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZiA9PT0gJ3ZOb2RlQm94Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luVG9wOiAnMTAwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjYmRiZGJkJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgJ25vIGRhdGEgcmVxdWlyZWQnKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmID09PSAndk5vZGVUZXh0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7c3R5bGU6IHtvdmVyZmxvdzogJ2F1dG8nfSwgYXR0cnM6IHtcImNsYXNzXCI6ICdiZXR0ZXItc2Nyb2xsYmFyJ319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNjc2NzY3JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnNXB4IDEwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbkJvdHRvbTogJzEwcHgnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMSd9fSwgJ3RleHQgdmFsdWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcwJywgY3Vyc29yOiAnZGVmYXVsdCcsIGNvbG9yOiAnI2JkYmRiZCd9fSwgJ3RleHQnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZzogJzVweCAxMHB4J319LCBbZW1iZXJFZGl0b3Ioc2VsZWN0ZWROb2RlLnZhbHVlLCAndGV4dCcpXSlcclxuICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmID09PSAndk5vZGVJbWFnZScpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge3N0eWxlOiB7b3ZlcmZsb3c6ICdhdXRvJ30sIGF0dHJzOiB7XCJjbGFzc1wiOiAnYmV0dGVyLXNjcm9sbGJhcid9fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzY3Njc2NycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzVweCAxMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW5Cb3R0b206ICcxMHB4J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnfX0sICdzb3VyY2UgKHVybCknKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcwJywgY3Vyc29yOiAnZGVmYXVsdCcsIGNvbG9yOiAnI2JkYmRiZCd9fSwgJ3RleHQnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZzogJzVweCAxMHB4J319LCBbZW1iZXJFZGl0b3Ioc2VsZWN0ZWROb2RlLnNyYywgJ3RleHQnKV0pXHJcbiAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZiA9PT0gJ3ZOb2RlSW5wdXQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtzdHlsZToge292ZXJmbG93OiAnYXV0byd9LCBhdHRyczoge1wiY2xhc3NcIjogJ2JldHRlci1zY3JvbGxiYXInfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM2NzY3NjcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc1cHggMTBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMTBweCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJ319LCAnaW5wdXQgdmFsdWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcwJywgY3Vyc29yOiAnZGVmYXVsdCcsIGNvbG9yOiAnI2JkYmRiZCd9fSwgJ3RleHQnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZzogJzVweCAxMHB4J319LCBbZW1iZXJFZGl0b3Ioc2VsZWN0ZWROb2RlLnZhbHVlLCAndGV4dCcpXSlcclxuICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmID09PSAndk5vZGVMaXN0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7c3R5bGU6IHtvdmVyZmxvdzogJ2F1dG8nfSwgYXR0cnM6IHtcImNsYXNzXCI6ICdiZXR0ZXItc2Nyb2xsYmFyJ319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNjc2NzY3JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnNXB4IDEwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbkJvdHRvbTogJzEwcHgnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMSd9fSwgJ3RhYmxlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtmbGV4OiAnMCcsIGN1cnNvcjogJ2RlZmF1bHQnLCBjb2xvcjogJyNiZGJkYmQnfX0sICd0YWJsZScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nOiAnNXB4IDEwcHgnfX0sIFtlbWJlckVkaXRvcihzZWxlY3RlZE5vZGUudmFsdWUsICd0YWJsZScpXSlcclxuICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmID09PSAndk5vZGVJZicpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge3N0eWxlOiB7b3ZlcmZsb3c6ICdhdXRvJ30sIGF0dHJzOiB7XCJjbGFzc1wiOiAnYmV0dGVyLXNjcm9sbGJhcid9fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzY3Njc2NycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzVweCAxMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW5Cb3R0b206ICcxMHB4J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnfX0sICdwcmVkaWNhdGUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcwJywgY3Vyc29yOiAnZGVmYXVsdCcsIGNvbG9yOiAnI2JkYmRiZCd9fSwgJ3RydWUvZmFsc2UnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZzogJzVweCAxMHB4J319LCBbZW1iZXJFZGl0b3Ioc2VsZWN0ZWROb2RlLnZhbHVlLCAnYm9vbGVhbicpXSlcclxuICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KSgpXSlcclxuICAgICAgICAgICAgY29uc3QgZ2Vuc3R5bGVTdWJtZW51Q29tcG9uZW50ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRTdHlsZSA9IHN0YXRlLmRlZmluaXRpb24uc3R5bGVbc2VsZWN0ZWROb2RlLnN0eWxlLmlkXVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHthdHRyczoge2NsYXNzOiAnYmV0dGVyLXNjcm9sbGJhcid9LCBzdHlsZToge292ZXJmbG93OiAnYXV0byd9fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicseyBzdHlsZToge3BhZGRpbmc6ICcxMHB4JywgZm9udEZhbWlseTogXCInQ29tZm9ydGFhJywgc2Fucy1zZXJpZlwiLCAgY29sb3I6ICcjYmRiZGJkJ319LCAnc3R5bGUgcGFuZWwgd2lsbCBjaGFuZ2UgYSBsb3QgaW4gMS4wdiwgcmlnaHQgbm93IGl0XFwncyBqdXN0IENTUycpLFxyXG4gICAgICAgICAgICAgICAgICAgIC4uLk9iamVjdC5rZXlzKHNlbGVjdGVkU3R5bGUpLm1hcCgoa2V5KSA9PiBoKCdkaXYnLCB7c3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICB9fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzY3Njc2NycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzVweCAxMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW5Cb3R0b206ICcxMHB4J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnfX0sIGtleSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtmbGV4OiAnMCcsIGN1cnNvcjogJ2RlZmF1bHQnLCBjb2xvcjogJyNiZGJkYmQnfX0sICd0ZXh0JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmc6ICc1cHggMTBweCd9fSwgW2VtYmVyRWRpdG9yKHNlbGVjdGVkU3R5bGVba2V5XSwgJ3RleHQnKV0pLFxyXG4gICAgICAgICAgICAgICAgICAgIF0pKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHsgcGFkZGluZzogJzVweCAxMHB4JywgZm9udEZhbWlseTogXCInQ29tZm9ydGFhJywgc2Fucy1zZXJpZlwiLCAgY29sb3I6ICcjYmRiZGJkJ319LCAnYWRkIFN0eWxlOicpLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZTogeyBwYWRkaW5nOiAnNXB4IDAgNXB4IDEwcHgnfX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcigoa2V5KSA9PiAhT2JqZWN0LmtleXMoc2VsZWN0ZWRTdHlsZSkuaW5jbHVkZXMoa2V5KSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKGtleSkgPT4gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7Y2xpY2s6IFtBRERfREVGQVVMVF9TVFlMRSwgc2VsZWN0ZWROb2RlLnN0eWxlLmlkLCBrZXldfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnM3B4IHNvbGlkIHdoaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzVweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpblRvcDogJzVweCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAnKyAnICsga2V5KSlcclxuICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGdlbmV2ZW50c1N1Ym1lbnVDb21wb25lbnQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYXZhaWxhYmxlRXZlbnRzID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdvbiBjbGljaycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZTogJ2NsaWNrJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2RvdWJsZSBjbGlja2VkJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lOiAnZGJsY2xpY2snXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnbW91c2Ugb3ZlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZTogJ21vdXNlb3ZlcidcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdtb3VzZSBvdXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWU6ICdtb3VzZW91dCdcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmID09PSAndk5vZGVJbnB1dCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBhdmFpbGFibGVFdmVudHMgPSBhdmFpbGFibGVFdmVudHMuY29uY2F0KFtcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdpbnB1dCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWU6ICdpbnB1dCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdmb2N1cycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWU6ICdmb2N1cydcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdibHVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZTogJ2JsdXInXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRFdmVudHMgPSBhdmFpbGFibGVFdmVudHMuZmlsdGVyKChldmVudCkgPT4gc2VsZWN0ZWROb2RlW2V2ZW50LnByb3BlcnR5TmFtZV0pXHJcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudHNMZWZ0ID0gYXZhaWxhYmxlRXZlbnRzLmZpbHRlcigoZXZlbnQpID0+ICFzZWxlY3RlZE5vZGVbZXZlbnQucHJvcGVydHlOYW1lXSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nVG9wOiAnMjBweCd9fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi4oY3VycmVudEV2ZW50cy5sZW5ndGggP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudEV2ZW50cy5tYXAoKGV2ZW50RGVzYykgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gc3RhdGUuZGVmaW5pdGlvbltzZWxlY3RlZE5vZGVbZXZlbnREZXNjLnByb3BlcnR5TmFtZV0ucmVmXVtzZWxlY3RlZE5vZGVbZXZlbnREZXNjLnByb3BlcnR5TmFtZV0uaWRdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7YmFja2dyb3VuZDogJyM2NzY3NjcnLCBwYWRkaW5nOiAnNXB4IDEwcHgnfX0sIGV2ZW50LnR5cGUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3N0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2NvbG9yIDAuMnMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTRweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzVweCAxMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBldmVudC5tdXRhdG9ycy5tYXAobXV0YXRvclJlZiA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbXV0YXRvciA9IHN0YXRlLmRlZmluaXRpb25bbXV0YXRvclJlZi5yZWZdW211dGF0b3JSZWYuaWRdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhdGVEZWYgPSBzdGF0ZS5kZWZpbml0aW9uW211dGF0b3Iuc3RhdGUucmVmXVttdXRhdG9yLnN0YXRlLmlkXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7c3R5bGU6IHttYXJnaW5Ub3A6ICcxMHB4J319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCAwIGF1dG8nLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgcG9zaXRpb246ICdyZWxhdGl2ZScsIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVooMCknLCBib3hTaGFkb3c6ICdpbnNldCAwIDAgMCAycHggJyArIChzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBtdXRhdG9yLnN0YXRlLmlkID8gJyNlYWI2NWMnOiAnIzgyODI4MicpICwgYmFja2dyb3VuZDogJyM0NDQnLCBwYWRkaW5nOiAnNHB4IDdweCcsfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtjb2xvcjogJ3doaXRlJywgZGlzcGxheTogJ2lubGluZS1ibG9jayd9LCBvbjoge2NsaWNrOiBbU1RBVEVfTk9ERV9TRUxFQ1RFRCwgbXV0YXRvci5zdGF0ZS5pZF19fSwgc3RhdGVEZWYudGl0bGUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW1iZXJFZGl0b3IobXV0YXRvci5tdXRhdGlvbiwgc3RhdGVEZWYudHlwZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZTogeyBwYWRkaW5nOiAnNXB4IDEwcHgnLCBmb250RmFtaWx5OiBcIidDb21mb3J0YWEnLCBzYW5zLXNlcmlmXCIsICBjb2xvcjogJyNiZGJkYmQnfX0sICdhZGQgRXZlbnQ6JyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsICB7c3R5bGU6IHsgcGFkZGluZzogJzVweCAwIDVweCAxMHB4J319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5ldmVudHNMZWZ0Lm1hcCgoZXZlbnQpID0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnM3B4IHNvbGlkICM1YmNjNWInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnNXB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbjogJzEwcHgnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIG9uOiB7Y2xpY2s6IFtBRERfRVZFTlQsIGV2ZW50LnByb3BlcnR5TmFtZSwgc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZV19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgJysgJyArIGV2ZW50LmRlc2NyaXB0aW9uKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uc3QgZnVsbFZOb2RlID0gWyd2Tm9kZUJveCcsJ3ZOb2RlVGV4dCcsICd2Tm9kZUltYWdlJywgJ3ZOb2RlSW5wdXQnXS5pbmNsdWRlcyhzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZilcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnZml4ZWQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnQ6IFwiMzAwIDEuMmVtICdPcGVuIFNhbnMnXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgbGluZUhlaWdodDogJzEuMmVtJyxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiBzdGF0ZS5jb21wb25lbnRFZGl0b3JQb3NpdGlvbi54ICsgJ3B4JyxcclxuICAgICAgICAgICAgICAgICAgICB0b3A6IHN0YXRlLmNvbXBvbmVudEVkaXRvclBvc2l0aW9uLnkgKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzUwJScsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgIHpJbmRleDogJzMwMDAnLFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtmbGV4OiAnMScsIGRpc3BsYXk6ICdmbGV4JywgbWFyZ2luQm90dG9tOiAnMTBweCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBiYWNrZ3JvdW5kOiAnIzRkNGQ0ZCcsIHdpZHRoOiBzdGF0ZS5zdWJFZGl0b3JXaWR0aCArICdweCcsIGJvcmRlcjogJzNweCBzb2xpZCAjMjIyJ319LFtcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtmbGV4OiAnMCAwIGF1dG8nLH19LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAnZGVmYXVsdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjMjIyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdUb3A6ICcycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0JvdHRvbTogJzVweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyM1M0IyRUQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluV2lkdGg6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1vdXNlZG93bjogW0NPTVBPTkVOVF9WSUVXX0RSQUdHRURdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG91Y2hzdGFydDogW0NPTVBPTkVOVF9WSUVXX0RSQUdHRURdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LH0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCAwIGF1dG8nLCBtYXJnaW46ICcwIDJweCAwIDVweCcsIGRpc3BsYXk6ICdpbmxpbmUtZmxleCd9fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09ICdfcm9vdE5vZGUnID8gYXBwSWNvbigpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZUJveCcgPyBib3hJY29uKCkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZUxpc3QnID8gbGlzdEljb24oKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZUxpc3QnID8gaWZJY29uKCkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZiA9PT0gJ3ZOb2RlSW5wdXQnID8gaW5wdXRJY29uKCkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZUltYWdlJyA/IGltYWdlSWNvbigpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0SWNvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzUgNSBhdXRvJywgbWFyZ2luOiAnMCA1cHggMCAwJywgbWluV2lkdGg6ICcwJywgb3ZlcmZsb3c6ICdoaWRkZW4nLCB3aGl0ZVNwYWNlOiAnbm93cmFwJywgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnLCBmb250U2l6ZTogJzAuOGVtJ319LCBzZWxlY3RlZE5vZGUudGl0bGUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwIDAgYXV0bycsIG1hcmdpbkxlZnQ6ICdhdXRvJywgY3Vyc29yOiAncG9pbnRlcicsIG1hcmdpblJpZ2h0OiAnNXB4JywgY29sb3I6ICd3aGl0ZScsIGRpc3BsYXk6ICdpbmxpbmUtZmxleCd9LCBvbjoge21vdXNlZG93bjogW1VOU0VMRUNUX1ZJRVdfTk9ERSwgZmFsc2UsIHRydWVdLCB0b3VjaHN0YXJ0OiBbVU5TRUxFQ1RfVklFV19OT0RFLCBmYWxzZSwgdHJ1ZV19fSwgW2NsZWFySWNvbigpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgZnVsbFZOb2RlID8gaCgnZGl2Jywge3N0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZmxleDogJzAgMCBhdXRvJywgZm9udEZhbWlseTogXCInQ29tZm9ydGFhJywgc2Fucy1zZXJpZlwifX0sIFtwcm9wc0NvbXBvbmVudCwgc3R5bGVDb21wb25lbnQsIGV2ZW50c0NvbXBvbmVudF0pIDogaCgnc3BhbicpLFxyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdTdWJDb21wb25lbnRSaWdodCxcclxuICAgICAgICAgICAgICAgICAgICBkcmFnU3ViQ29tcG9uZW50TGVmdCxcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5zZWxlY3RlZFZpZXdTdWJNZW51ID09PSAncHJvcHMnIHx8ICFmdWxsVk5vZGUgPyBnZW5wcm9wc1N1Ym1lbnVDb21wb25lbnQoKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRWaWV3U3ViTWVudSA9PT0gJ3N0eWxlJyA/IGdlbnN0eWxlU3VibWVudUNvbXBvbmVudCgpOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRWaWV3U3ViTWVudSA9PT0gJ2V2ZW50cycgPyBnZW5ldmVudHNTdWJtZW51Q29tcG9uZW50KCk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsICdFcnJvciwgbm8gc3VjaCBtZW51JylcclxuICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgIF0pXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBhZGRTdGF0ZUNvbXBvbmVudCA9IGgoJ2RpdicsIHtzdHlsZTogeyBmbGV4OiAnMCBhdXRvJywgbWFyZ2luTGVmdDogc3RhdGUucmlnaHRPcGVuID8gJy0xMHB4JzogJzAnLCBib3JkZXI6ICczcHggc29saWQgIzIyMicsIGJvcmRlclJpZ2h0OiAnbm9uZScsIGJhY2tncm91bmQ6ICcjMzMzJywgaGVpZ2h0OiAnNDBweCcsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcid9fSwgW1xyXG4gICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7IGZvbnRGYW1pbHk6IFwiJ0NvbWZvcnRhYScsIHNhbnMtc2VyaWZcIiwgZm9udFNpemU6ICcwLjllbScsIGN1cnNvcjogJ3BvaW50ZXInLCBwYWRkaW5nOiAnMCA1cHgnfX0sICdhZGQgc3RhdGU6ICcpLFxyXG4gICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZGlzcGxheTogJ2lubGluZS1ibG9jayd9LCBvbjoge2NsaWNrOiBbQUREX1NUQVRFLCAnX3Jvb3ROYW1lU3BhY2UnLCAndGV4dCddfX0sIFt0ZXh0SWNvbigpXSksXHJcbiAgICAgICAgICAgIGgoJ3NwYW4nLCB7b246IHtjbGljazogW0FERF9TVEFURSwgJ19yb290TmFtZVNwYWNlJywgJ251bWJlciddfX0sIFtudW1iZXJJY29uKCldKSxcclxuICAgICAgICAgICAgaCgnc3BhbicsIHtvbjoge2NsaWNrOiBbQUREX1NUQVRFLCAnX3Jvb3ROYW1lU3BhY2UnLCAnYm9vbGVhbiddfX0sIFtpZkljb24oKV0pLFxyXG4gICAgICAgICAgICAvL2goJ3NwYW4nLCB7b246IHtjbGljazogW0FERF9TVEFURSwgJ19yb290TmFtZVNwYWNlJywgJ3RhYmxlJ119fSwgW2xpc3RJY29uKCldKSxcclxuICAgICAgICBdKVxyXG5cclxuXHJcbiAgICAgICAgY29uc3QgYWRkVmlld05vZGVDb21wb25lbnQgPSBoKCdkaXYnLCB7c3R5bGU6IHsgZmxleDogJzAgYXV0bycsIG1hcmdpbkxlZnQ6IHN0YXRlLnJpZ2h0T3BlbiA/ICctMTBweCc6ICcwJywgYm9yZGVyOiAnM3B4IHNvbGlkICMyMjInLCBib3JkZXJSaWdodDogJ25vbmUnLCBiYWNrZ3JvdW5kOiAnIzMzMycsIGhlaWdodDogJzQwcHgnLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInfX0sIFtcclxuICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZTogeyBmb250RmFtaWx5OiBcIidDb21mb3J0YWEnLCBzYW5zLXNlcmlmXCIsIGZvbnRTaXplOiAnMC45ZW0nLCBwYWRkaW5nOiAnMCAxMHB4J319LCAnYWRkIGNvbXBvbmVudDogJyksXHJcbiAgICAgICAgICAgIGgoJ3NwYW4nLCB7b246IHtjbGljazogW0FERF9OT0RFLCBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLCAnYm94J119fSwgW2JveEljb24oKV0pLFxyXG4gICAgICAgICAgICBoKCdzcGFuJywge29uOiB7Y2xpY2s6IFtBRERfTk9ERSwgc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZSwgJ2lucHV0J119fSwgW2lucHV0SWNvbigpXSksXHJcbiAgICAgICAgICAgIGgoJ3NwYW4nLCB7b246IHtjbGljazogW0FERF9OT0RFLCBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLCAndGV4dCddfX0sIFt0ZXh0SWNvbigpXSksXHJcbiAgICAgICAgICAgIGgoJ3NwYW4nLCB7b246IHtjbGljazogW0FERF9OT0RFLCBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLCAnaW1hZ2UnXX19LCBbaW1hZ2VJY29uKCldKSxcclxuICAgICAgICAgICAgaCgnc3BhbicsIHtvbjoge2NsaWNrOiBbQUREX05PREUsIHN0YXRlLnNlbGVjdGVkVmlld05vZGUsICdpZiddfX0sIFtpZkljb24oKV0pLFxyXG4gICAgICAgIF0pXHJcblxyXG4gICAgICAgIGNvbnN0IHZpZXdDb21wb25lbnQgPSBoKCdkaXYnLCB7YXR0cnM6IHtjbGFzczogJ2JldHRlci1zY3JvbGxiYXInfSwgc3R5bGU6IHtvdmVyZmxvdzogJ2F1dG8nLCBwb3NpdGlvbjogJ3JlbGF0aXZlJywgZmxleDogJzEnLCBmb250U2l6ZTogJzAuOGVtJ319LCBbXHJcbiAgICAgICAgICAgIGxpc3ROb2RlKHtyZWY6ICd2Tm9kZUJveCcsIGlkOidfcm9vdE5vZGUnfSwge30sIDApLFxyXG4gICAgICAgIF0pXHJcblxyXG4gICAgICAgIGNvbnN0IHJpZ2h0Q29tcG9uZW50ID1cclxuICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgcmlnaHQ6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgICAgICBmb250OiBcIjMwMCAxLjJlbSAnT3BlbiBTYW5zJ1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6ICcxLjJlbScsXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHN0YXRlLmVkaXRvclJpZ2h0V2lkdGggKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNGQ0ZDRkJyxcclxuICAgICAgICAgICAgICAgICAgICBib3hTaXppbmc6IFwiYm9yZGVyLWJveFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlckxlZnQ6ICczcHggc29saWQgIzIyMicsXHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJzAuNXMgdHJhbnNmb3JtJyxcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm06IHN0YXRlLnJpZ2h0T3BlbiA/ICd0cmFuc2xhdGVaKDApIHRyYW5zbGF0ZVgoMCUpJzogJ3RyYW5zbGF0ZVooMCkgdHJhbnNsYXRlWCgxMDAlKScsXHJcbiAgICAgICAgICAgICAgICAgICAgdXNlclNlbGVjdDogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgZHJhZ0NvbXBvbmVudFJpZ2h0LFxyXG4gICAgICAgICAgICAgICAgb3BlbkNvbXBvbmVudFJpZ2h0LFxyXG4gICAgICAgICAgICAgICAgYWRkU3RhdGVDb21wb25lbnQsXHJcbiAgICAgICAgICAgICAgICBzdGF0ZUNvbXBvbmVudCxcclxuICAgICAgICAgICAgICAgIGFkZFZpZXdOb2RlQ29tcG9uZW50LFxyXG4gICAgICAgICAgICAgICAgdmlld0NvbXBvbmVudCxcclxuICAgICAgICAgICAgXSlcclxuXHJcbiAgICAgICAgY29uc3QgdG9wQ29tcG9uZW50ID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgZmxleDogJzEgYXV0bycsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICc3NXB4JyxcclxuICAgICAgICAgICAgICAgIG1heEhlaWdodDogJzc1cHgnLFxyXG4gICAgICAgICAgICAgICAgbWluSGVpZ2h0OiAnNzVweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzIyMicsXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OidmbGV4JyxcclxuICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiJ0NvbWZvcnRhYScsIHNhbnMtc2VyaWZcIixcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIFtcclxuICAgICAgICAgICAgaCgnYScsIHtzdHlsZToge2ZsZXg6ICcwIGF1dG8nLCB3aWR0aDogJzE5MHB4JywgdGV4dERlY29yYXRpb246ICdpbmhlcml0JywgdXNlclNlbGVjdDogJ25vbmUnfSwgYXR0cnM6IHtocmVmOicvX2Rldid9fSwgW1xyXG4gICAgICAgICAgICAgICAgaCgnaW1nJyx7c3R5bGU6IHsgbWFyZ2luOiAnN3B4IC0ycHggLTNweCA1cHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJ30sIGF0dHJzOiB7c3JjOiAnL2ltYWdlcy9sb2dvMjU2eDI1Ni5wbmcnLCBoZWlnaHQ6ICc1Nyd9fSksXHJcbiAgICAgICAgICAgICAgICBoKCdzcGFuJyx7c3R5bGU6IHsgZm9udFNpemU6JzQ0cHgnLCAgdmVydGljYWxBbGlnbjogJ2JvdHRvbScsIGNvbG9yOiAnI2ZmZid9fSwgJ3VnbmlzJylcclxuICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgIHJpZ2h0OiAnMCcsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgZm9udEZhbWlseTogXCInQ29tZm9ydGFhJywgc2Fucy1zZXJpZlwiLFxyXG4gICAgICAgICAgICAgICAgZm9udFNpemU6ICcxNnB4JyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM0NDQ0NDQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxNXB4IDIwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbjogJzEzcHggMTNweCAwIDAnLFxyXG4gICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGljazogW0ZVTExfU0NSRUVOX0NMSUNLRUQsIHRydWVdXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgJ2Z1bGwgc2NyZWVuJyksXHJcbiAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzQ0NDQ0NCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzE1cHggMjBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAnMTNweCAxM3B4IDAgMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsaWNrOiBSRVNFVF9BUFBfU1RBVEVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCAncmVzZXQgc3RhdGUnKSxcclxuICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNDQ0NDQ0JyxcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTVweCAyMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW46ICcxM3B4IDEzcHggMCAwJyxcclxuICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xpY2s6IFJFU0VUX0FQUF9ERUZJTklUSU9OXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgJ3Jlc2V0IGRlbW8nKVxyXG4gICAgICAgICAgICBdKVxyXG4gICAgICAgIF0pXHJcbiAgICAgICAgY29uc3QgbGVmdENvbXBvbmVudCA9IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgIGxlZnQ6ICcwJyxcclxuICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBmb250OiBcIjMwMCAxLjJlbSAnT3BlbiBTYW5zJ1wiLFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6IHN0YXRlLmVkaXRvckxlZnRXaWR0aCArICdweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzRkNGQ0ZCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaXppbmc6IFwiYm9yZGVyLWJveFwiLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmlnaHQ6ICczcHggc29saWQgIzIyMicsXHJcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnMC41cyB0cmFuc2Zvcm0nLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiBzdGF0ZS5sZWZ0T3BlbiA/ICd0cmFuc2xhdGVaKDApIHRyYW5zbGF0ZVgoMCUpJzogJ3RyYW5zbGF0ZVooMCkgdHJhbnNsYXRlWCgtMTAwJSknLFxyXG4gICAgICAgICAgICAgICAgdXNlclNlbGVjdDogJ25vbmUnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sIFtcclxuICAgICAgICAgICAgZHJhZ0NvbXBvbmVudExlZnQsXHJcbiAgICAgICAgICAgIG9wZW5Db21wb25lbnRMZWZ0LFxyXG4gICAgICAgICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBGUkVFWkVSX0NMSUNLRURcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGZsZXg6ICcwIGF1dG8nLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjMzMzJyxcclxuICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sIFtcclxuICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHsgcGFkZGluZzogJzE1cHggMTVweCAxMHB4IDE1cHgnLCBjb2xvcjogc3RhdGUuYXBwSXNGcm96ZW4gPyAncmdiKDkxLCAyMDQsIDkxKScgOiAncmdiKDIwNCwgOTEsIDkxKSd9fSwgc3RhdGUuYXBwSXNGcm96ZW4gPyAn4pa6JyA6ICfinZrinZonKSxcclxuICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICBhdHRyczoge2NsYXNzOiAnYmV0dGVyLXNjcm9sbGJhcid9LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsZXg6ICcxIGF1dG8nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdzogJ2F1dG8nXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHN0YXRlLmV2ZW50U3RhY2tcclxuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChldmVudERhdGEpPT5zdGF0ZS5kZWZpbml0aW9uLmV2ZW50W2V2ZW50RGF0YS5ldmVudElkXSAhPT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICAgICAgICAgIC5yZXZlcnNlKCkgLy8gbXV0YXRlcyB0aGUgYXJyYXksIGJ1dCBpdCB3YXMgYWxyZWFkeSBjb3BpZWQgd2l0aCBmaWx0ZXJcclxuICAgICAgICAgICAgICAgICAgICAubWFwKChldmVudERhdGEsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gc3RhdGUuZGVmaW5pdGlvbi5ldmVudFtldmVudERhdGEuZXZlbnRJZF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZW1pdHRlciA9IHN0YXRlLmRlZmluaXRpb25bZXZlbnQuZW1pdHRlci5yZWZdW2V2ZW50LmVtaXR0ZXIuaWRdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vIGlkZWEgd2h5IHRoaXMga2V5IHdvcmtzLCBkb24ndCB0b3VjaCBpdCwgcHJvYmFibHkgcmVyZW5kZXJzIG1vcmUgdGhhbiBuZWVkZWQsIGJ1dCB3aG8gY2FyZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtrZXk6IGV2ZW50LmVtaXR0ZXIuaWQgKyBpbmRleCwgc3R5bGU6IHttYXJnaW5Cb3R0b206ICcxMHB4J319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMTBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM0NDQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdUb3A6ICczcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdCb3R0b206ICczcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBldmVudC5lbWl0dGVyLmlkID8gJyM1M0IyRUQnOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICcwLjJzIGFsbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluV2lkdGg6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIG9uOiB7Y2xpY2s6IFtWSUVXX05PREVfU0VMRUNURUQsIGV2ZW50LmVtaXR0ZXJdfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAgMCBhdXRvJywgbWFyZ2luOiAnMCAwIDAgNXB4JywgZGlzcGxheTogJ2lubGluZS1mbGV4J319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LmVtaXR0ZXIucmVmID09PSAndk5vZGVCb3gnID8gYm94SWNvbigpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LmVtaXR0ZXIucmVmID09PSAndk5vZGVMaXN0JyA/IGxpc3RJY29uKCkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LmVtaXR0ZXIucmVmID09PSAndk5vZGVMaXN0JyA/IGlmSWNvbigpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuZW1pdHRlci5yZWYgPT09ICd2Tm9kZUlucHV0JyA/IGlucHV0SWNvbigpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRJY29uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICc1IDUgYXV0bycsIG1hcmdpbjogJzAgNXB4IDAgMCcsIG1pbldpZHRoOiAnMCcsIG92ZXJmbG93OiAnaGlkZGVuJywgd2hpdGVTcGFjZTogJ25vd3JhcCcsICB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcyd9fSwgZW1pdHRlci50aXRsZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwIDAgYXV0bycsIGZvbnRGYW1pbHk6IFwiJ0NvbWZvcnRhYScsIHNhbnMtc2VyaWZcIiwgZm9udFNpemU6ICcwLjllbScsIG1hcmdpbkxlZnQ6ICdhdXRvJywgbWFyZ2luUmlnaHQ6ICc1cHgnLCBjb2xvcjogJyM1YmNjNWInfX0sIGV2ZW50LnR5cGUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhldmVudERhdGEubXV0YXRpb25zKS5sZW5ndGggPT09IDAgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZTogeyBwYWRkaW5nOiAnNXB4IDEwcHgnLCBmb250RmFtaWx5OiBcIidDb21mb3J0YWEnLCBzYW5zLXNlcmlmXCIsICBjb2xvcjogJyNiZGJkYmQnfX0sICdub3RoaW5nIGhhcyBjaGFuZ2VkJyk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ0xlZnQ6ICcxMHB4Jywgd2hpdGVTcGFjZTogJ25vd3JhcCd9fSwgT2JqZWN0LmtleXMoZXZlbnREYXRhLm11dGF0aW9ucylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihzdGF0ZUlkID0+IHN0YXRlLmRlZmluaXRpb24uc3RhdGVbc3RhdGVJZF0gIT09IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChzdGF0ZUlkID0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7b246IHtjbGljazogW1NUQVRFX05PREVfU0VMRUNURUQsIHN0YXRlSWRdfSwgc3R5bGU6IHtjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICd3aGl0ZScsIGJveFNoYWRvdzogJ2luc2V0IDAgMCAwIDJweCAnICsgKHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHN0YXRlSWQgPyAnI2VhYjY1Yyc6ICcjODI4MjgyJykgLCBiYWNrZ3JvdW5kOiAnIzQ0NCcsIHBhZGRpbmc6ICcycHggNXB4JywgbWFyZ2luUmlnaHQ6ICc1cHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgdHJhbnNpdGlvbjogJ2FsbCAwLjJzJ319LCBzdGF0ZS5kZWZpbml0aW9uLnN0YXRlW3N0YXRlSWRdLnRpdGxlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7Y29sb3I6ICcjOGU4ZThlJ319LCBldmVudERhdGEucHJldmlvdXNTdGF0ZVtzdGF0ZUlkXS50b1N0cmluZygpICsgJyDigJPigLogJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIGV2ZW50RGF0YS5tdXRhdGlvbnNbc3RhdGVJZF0udG9TdHJpbmcoKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICBdKVxyXG4gICAgICAgIGNvbnN0IHJlbmRlclZpZXdDb21wb25lbnQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBmbGV4OiAnMSBhdXRvJyxcclxuICAgICAgICAgICAgICAgIC8vYmFja2dyb3VuZEltYWdlOiAncmFkaWFsLWdyYWRpZW50KGJsYWNrIDE1JSwgdHJhbnNwYXJlbnQgMTYlKSwgcmFkaWFsLWdyYWRpZW50KGJsYWNrIDE1JSwgdHJhbnNwYXJlbnQgMTYlKSwgcmFkaWFsLWdyYWRpZW50KHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wOTgwMzkyKSAxNSUsIHRyYW5zcGFyZW50IDIwJSksIHJhZGlhbC1ncmFkaWVudChyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDk4MDM5MikgMTUlLCB0cmFuc3BhcmVudCAyMCUpJyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRQb3NpdGlvblg6ICcwcHgsIDhweCwgMHB4LCA4cHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZFBvc2l0aW9uWTogJzBweCwgOHB4LCAxcHgsIDlweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6JyMzMzMnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZFNpemU6JzE2cHggMTZweCcsXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OidyZWxhdGl2ZScsXHJcbiAgICAgICAgICAgICAgICBvdmVyZmxvdzogJ2F1dG8nLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sIFtcclxuICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiAoKCk9PntcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRvcE1lbnVIZWlnaHQgPSA3NVxyXG4gICAgICAgICAgICAgICAgY29uc3Qgd2lkdGhMZWZ0ID0gd2luZG93LmlubmVyV2lkdGggLSAoKHN0YXRlLmxlZnRPcGVuID8gc3RhdGUuZWRpdG9yTGVmdFdpZHRoOiAwKSArIChzdGF0ZS5yaWdodE9wZW4gPyBzdGF0ZS5lZGl0b3JSaWdodFdpZHRoIDogMCkpXHJcbiAgICAgICAgICAgICAgICBjb25zdCBoZWlnaHRMZWZ0ID0gd2luZG93LmlubmVySGVpZ2h0IC0gdG9wTWVudUhlaWdodFxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogc3RhdGUuZnVsbFNjcmVlbiA/ICcxMDB2dycgOiB3aWR0aExlZnQgLSA0MCArJ3B4JyxcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHN0YXRlLmZ1bGxTY3JlZW4gPyAnMTAwdmgnIDogaGVpZ2h0TGVmdCAtIDQwICsgJ3B4JyxcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2ZmZmZmZicsXHJcbiAgICAgICAgICAgICAgICAgICAgekluZGV4OiBzdGF0ZS5mdWxsU2NyZWVuID8gJzIwMDAnIDogJzEwMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYm94U2hhZG93OiAncmdiYSgwLCAwLCAwLCAwLjI0NzA1OSkgMHB4IDE0cHggNDVweCwgcmdiYSgwLCAwLCAwLCAwLjIxOTYwOCkgMHB4IDEwcHggMThweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdmaXhlZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2FsbCAwLjVzJyxcclxuICAgICAgICAgICAgICAgICAgICB0b3A6IHN0YXRlLmZ1bGxTY3JlZW4gPyAnMHB4JyA6IDIwICsgNzUgKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IHN0YXRlLmZ1bGxTY3JlZW4gPyAnMHB4JyA6IChzdGF0ZS5sZWZ0T3BlbiA/c3RhdGUuZWRpdG9yTGVmdFdpZHRoIDogMCkgKyAyMCArICdweCcsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKCl9LCBbXHJcbiAgICAgICAgICAgICAgICBzdGF0ZS5mdWxsU2NyZWVuID9cclxuICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7cG9zaXRpb246ICdmaXhlZCcsIHBhZGRpbmc6ICcxMnB4IDEwcHgnLCB0b3A6ICcwJywgcmlnaHQ6ICcyMHB4JywgYm9yZGVyOiAnMnB4IHNvbGlkICMzMzMnLCBib3JkZXJUb3A6ICdub25lJywgYmFja2dyb3VuZDogJyM0NDQnLCBjb2xvcjogJ3doaXRlJywgb3BhY2l0eTogJzAuOCcsIGN1cnNvcjogJ3BvaW50ZXInfSwgb246IHtjbGljazogW0ZVTExfU0NSRUVOX0NMSUNLRUQsIGZhbHNlXX19LCAnZXhpdCBmdWxsIHNjcmVlbicpOlxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nKSxcclxuICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge292ZXJmbG93OiAnYXV0bycsIHdpZHRoOiAnMTAwJScsIGhlaWdodDogJzEwMCUnfX0sIFthcHAudmRvbV0pXHJcbiAgICAgICAgICAgIF0pXHJcbiAgICAgICAgXSlcclxuICAgICAgICBjb25zdCBtYWluUm93Q29tcG9uZW50ID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgZmxleDogJzEnLFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICByZW5kZXJWaWV3Q29tcG9uZW50LFxyXG4gICAgICAgICAgICBsZWZ0Q29tcG9uZW50LFxyXG4gICAgICAgICAgICByaWdodENvbXBvbmVudCxcclxuICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPyBnZW5lcmF0ZUVkaXROb2RlQ29tcG9uZW50KCk6IGgoJ3NwYW4nKVxyXG4gICAgICAgIF0pXHJcbiAgICAgICAgY29uc3Qgdm5vZGUgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnZml4ZWQnLFxyXG4gICAgICAgICAgICAgICAgdG9wOiAnMCcsXHJcbiAgICAgICAgICAgICAgICByaWdodDogJzAnLFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6ICcxMDB2dycsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDB2aCcsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICB0b3BDb21wb25lbnQsXHJcbiAgICAgICAgICAgIG1haW5Sb3dDb21wb25lbnQsXHJcbiAgICAgICAgICAgIHN0YXRlLmRyYWdnZWRDb21wb25lbnRWaWV3ID8gaCgnZGl2Jywge3N0eWxlOiB7Zm9udEZhbWlseTogXCJPcGVuIFNhbnNcIiwgcG9pbnRlckV2ZW50czogJ25vbmUnLCBwb3NpdGlvbjogJ2ZpeGVkJywgdG9wOiBzdGF0ZS5tb3VzZVBvc2l0aW9uLnkgKyAncHgnLCBsZWZ0OiBzdGF0ZS5tb3VzZVBvc2l0aW9uLnggKyAncHgnLCBsaW5lSGVpZ2h0OiAnMS4yZW0nLCBmb250U2l6ZTogJzEuMmVtJywgekluZGV4OiAnOTk5OTknLCB3aWR0aDogc3RhdGUuZWRpdG9yUmlnaHRXaWR0aCArICdweCd9fSwgW2goJ2RpdicsIHtzdHlsZToge292ZXJmbG93OiAnYXV0bycsIHBvc2l0aW9uOiAncmVsYXRpdmUnLCBmbGV4OiAnMScsIGZvbnRTaXplOiAnMC44ZW0nfX0sIFtmYWtlQ29tcG9uZW50KHN0YXRlLmRyYWdnZWRDb21wb25lbnRWaWV3LCBzdGF0ZS5ob3ZlcmVkVmlld05vZGUgPyBzdGF0ZS5ob3ZlcmVkVmlld05vZGUuZGVwdGggOiBzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50Vmlldy5kZXB0aCldKV0pOiBoKCdzcGFuJyksXHJcbiAgICAgICAgICAgIHN0YXRlLmRyYWdnZWRDb21wb25lbnRTdGF0ZUlkID8gaCgnZGl2Jywge3N0eWxlOiB7Zm9udEZhbWlseTogXCJPcGVuIFNhbnNcIiwgcG9pbnRlckV2ZW50czogJ25vbmUnLCBwb3NpdGlvbjogJ2ZpeGVkJywgdG9wOiBzdGF0ZS5tb3VzZVBvc2l0aW9uLnkgKyAncHgnLCBsZWZ0OiBzdGF0ZS5tb3VzZVBvc2l0aW9uLnggKyAncHgnLCBsaW5lSGVpZ2h0OiAnMS4yZW0nLCBmb250U2l6ZTogJzE2cHgnLCB6SW5kZXg6ICc5OTk5OScsIHdpZHRoOiBzdGF0ZS5lZGl0b3JSaWdodFdpZHRoICsgJ3B4J319LCBbZmFrZVN0YXRlKHN0YXRlLmRyYWdnZWRDb21wb25lbnRTdGF0ZUlkKV0pOiBoKCdzcGFuJyksXHJcbiAgICAgICAgXSlcclxuXHJcbiAgICAgICAgbm9kZSA9IHBhdGNoKG5vZGUsIHZub2RlKVxyXG4gICAgICAgIGN1cnJlbnRBbmltYXRpb25GcmFtZVJlcXVlc3QgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbmRlcigpXHJcbn0iLCJmdW5jdGlvbiB1cGRhdGVQcm9wcyhvbGRWbm9kZSwgdm5vZGUpIHtcclxuICAgIHZhciBrZXksIGN1ciwgb2xkLCBlbG0gPSB2bm9kZS5lbG0sXHJcbiAgICAgICAgcHJvcHMgPSB2bm9kZS5kYXRhLmxpdmVQcm9wcyB8fCB7fTtcclxuICAgIGZvciAoa2V5IGluIHByb3BzKSB7XHJcbiAgICAgICAgY3VyID0gcHJvcHNba2V5XTtcclxuICAgICAgICBvbGQgPSBlbG1ba2V5XTtcclxuICAgICAgICBpZiAob2xkICE9PSBjdXIpIGVsbVtrZXldID0gY3VyO1xyXG4gICAgfVxyXG59XHJcbmNvbnN0IGxpdmVQcm9wc1BsdWdpbiA9IHtjcmVhdGU6IHVwZGF0ZVByb3BzLCB1cGRhdGU6IHVwZGF0ZVByb3BzfTtcclxuaW1wb3J0IHNuYWJiZG9tIGZyb20gJ3NuYWJiZG9tJ1xyXG5jb25zdCBwYXRjaCA9IHNuYWJiZG9tLmluaXQoW1xyXG4gICAgcmVxdWlyZSgnc25hYmJkb20vbW9kdWxlcy9jbGFzcycpLFxyXG4gICAgcmVxdWlyZSgnc25hYmJkb20vbW9kdWxlcy9wcm9wcycpLFxyXG4gICAgcmVxdWlyZSgnc25hYmJkb20vbW9kdWxlcy9zdHlsZScpLFxyXG4gICAgcmVxdWlyZSgnc25hYmJkb20vbW9kdWxlcy9ldmVudGxpc3RlbmVycycpLFxyXG4gICAgcmVxdWlyZSgnc25hYmJkb20vbW9kdWxlcy9hdHRyaWJ1dGVzJyksXHJcbiAgICBsaXZlUHJvcHNQbHVnaW5cclxuXSk7XHJcbmltcG9ydCBoIGZyb20gJ3NuYWJiZG9tL2gnO1xyXG5pbXBvcnQgYmlnIGZyb20gJ2JpZy5qcyc7XHJcblxyXG5mdW5jdGlvbiBmbGF0dGVuKGFycikge1xyXG4gICAgcmV0dXJuIGFyci5yZWR1Y2UoZnVuY3Rpb24gKGZsYXQsIHRvRmxhdHRlbikge1xyXG4gICAgICAgIHJldHVybiBmbGF0LmNvbmNhdChBcnJheS5pc0FycmF5KHRvRmxhdHRlbikgPyBmbGF0dGVuKHRvRmxhdHRlbikgOiB0b0ZsYXR0ZW4pO1xyXG4gICAgfSwgW10pO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCAoZGVmaW5pdGlvbikgPT4ge1xyXG5cclxuICAgIGxldCBjdXJyZW50U3RhdGUgPSBjcmVhdGVEZWZhdWx0U3RhdGUoKVxyXG5cclxuICAgIC8vIEFsbG93cyBzdG9waW5nIGFwcGxpY2F0aW9uIGluIGRldmVsb3BtZW50LiBUaGlzIGlzIG5vdCBhbiBhcHBsaWNhdGlvbiBzdGF0ZVxyXG4gICAgbGV0IGZyb3plbiA9IGZhbHNlXHJcbiAgICBsZXQgZnJvemVuQ2FsbGJhY2sgPSBudWxsXHJcbiAgICBsZXQgc2VsZWN0SG92ZXJBY3RpdmUgPSBmYWxzZVxyXG4gICAgbGV0IHNlbGVjdGVkTm9kZUluRGV2ZWxvcG1lbnQgPSB7fVxyXG5cclxuICAgIGZ1bmN0aW9uIHNlbGVjdE5vZGVIb3ZlcihyZWYsIGUpIHtcclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgc2VsZWN0ZWROb2RlSW5EZXZlbG9wbWVudCA9IHJlZlxyXG4gICAgICAgIGZyb3plbkNhbGxiYWNrKHJlZilcclxuICAgICAgICByZW5kZXIoKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gc2VsZWN0Tm9kZUNsaWNrKHJlZiwgZSkge1xyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICBzZWxlY3RIb3ZlckFjdGl2ZSA9IGZhbHNlXHJcbiAgICAgICAgc2VsZWN0ZWROb2RlSW5EZXZlbG9wbWVudCA9IHJlZlxyXG4gICAgICAgIGZyb3plbkNhbGxiYWNrKHJlZilcclxuICAgICAgICByZW5kZXIoKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGdsb2JhbCBzdGF0ZSBmb3IgcmVzb2x2ZXJcclxuICAgIGxldCBjdXJyZW50RXZlbnQgPSBudWxsXHJcbiAgICBsZXQgY3VycmVudE1hcFZhbHVlID0ge31cclxuICAgIGxldCBjdXJyZW50TWFwSW5kZXggPSB7fVxyXG4gICAgbGV0IGV2ZW50RGF0YSA9IHt9XHJcbiAgICBmdW5jdGlvbiByZXNvbHZlKHJlZil7XHJcbiAgICAgICAgaWYocmVmID09PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gc3RhdGljIHZhbHVlIChzdHJpbmcvbnVtYmVyKVxyXG4gICAgICAgIGlmKHJlZi5yZWYgPT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHJldHVybiByZWZcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZGVmID0gZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdXHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdwaXBlJykge1xyXG4gICAgICAgICAgICByZXR1cm4gcGlwZShyZWYpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWYucmVmID09PSAnY29uZGl0aW9uYWwnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKGRlZi5wcmVkaWNhdGUpID8gcmVzb2x2ZShkZWYudGhlbikgOiByZXNvbHZlKGRlZi5lbHNlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3N0YXRlJykge1xyXG4gICAgICAgICAgICByZXR1cm4gY3VycmVudFN0YXRlW3JlZi5pZF1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICd2Tm9kZUJveCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGJveE5vZGUocmVmKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3ZOb2RlVGV4dCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRleHROb2RlKHJlZilcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICd2Tm9kZUlucHV0Jykge1xyXG4gICAgICAgICAgICByZXR1cm4gaW5wdXROb2RlKHJlZilcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICd2Tm9kZUxpc3QnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBsaXN0Tm9kZShyZWYpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWYucmVmID09PSAndk5vZGVJZicpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGlmTm9kZShyZWYpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWYucmVmID09PSAndk5vZGVJbWFnZScpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGltYWdlTm9kZShyZWYpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWYucmVmID09PSAnc3R5bGUnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhkZWYpLnJlZHVjZSgoYWNjLCB2YWwpPT4ge1xyXG4gICAgICAgICAgICAgICAgYWNjW3ZhbF0gPSByZXNvbHZlKGRlZlt2YWxdKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjY1xyXG4gICAgICAgICAgICB9LCB7fSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdldmVudERhdGEnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBldmVudERhdGFbcmVmLmlkXVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ2xpc3RWYWx1ZScpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRNYXBWYWx1ZVtkZWYubGlzdC5pZF1bZGVmLnByb3BlcnR5XVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aHJvdyBFcnJvcihyZWYpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdHJhbnNmb3JtVmFsdWUodmFsdWUsIHRyYW5zZm9ybWF0aW9ucyl7XHJcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRyYW5zZm9ybWF0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCByZWYgPSB0cmFuc2Zvcm1hdGlvbnNbaV07XHJcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybWVyID0gZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdXHJcbiAgICAgICAgICAgIGlmIChyZWYucmVmID09PSAnZXF1YWwnKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wYXJlVmFsdWUgPSByZXNvbHZlKHRyYW5zZm9ybWVyLnZhbHVlKVxyXG4gICAgICAgICAgICAgICAgaWYodmFsdWUgaW5zdGFuY2VvZiBiaWcgfHwgY29tcGFyZVZhbHVlIGluc3RhbmNlb2YgYmlnKXtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGJpZyh2YWx1ZSkuZXEoY29tcGFyZVZhbHVlKVxyXG4gICAgICAgICAgICAgICAgfSBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgPT09IGNvbXBhcmVWYWx1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZWYucmVmID09PSAnYWRkJykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBiaWcodmFsdWUpLnBsdXMocmVzb2x2ZSh0cmFuc2Zvcm1lci52YWx1ZSkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdzdWJ0cmFjdCcpIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gYmlnKHZhbHVlKS5taW51cyhyZXNvbHZlKHRyYW5zZm9ybWVyLnZhbHVlKSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ211bHRpcGx5Jykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBiaWcodmFsdWUpLnRpbWVzKHJlc29sdmUodHJhbnNmb3JtZXIudmFsdWUpKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZWYucmVmID09PSAnZGl2aWRlJykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBiaWcodmFsdWUpLmRpdihyZXNvbHZlKHRyYW5zZm9ybWVyLnZhbHVlKSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3JlbWFpbmRlcicpIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gYmlnKHZhbHVlKS5tb2QocmVzb2x2ZSh0cmFuc2Zvcm1lci52YWx1ZSkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdqb2luJykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1N0cmluZygpLmNvbmNhdChyZXNvbHZlKHRyYW5zZm9ybWVyLnZhbHVlKSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3RvVXBwZXJDYXNlJykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1VwcGVyQ2FzZSgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlZi5yZWYgPT09ICd0b0xvd2VyQ2FzZScpIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZWYucmVmID09PSAnbGVuZ3RoJykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5sZW5ndGhcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGlwZShyZWYpIHtcclxuICAgICAgICBjb25zdCBkZWYgPSBkZWZpbml0aW9uW3JlZi5yZWZdW3JlZi5pZF1cclxuICAgICAgICByZXR1cm4gdHJhbnNmb3JtVmFsdWUocmVzb2x2ZShkZWYudmFsdWUpLCBkZWYudHJhbnNmb3JtYXRpb25zKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGZyb3plblNoYWRvdyA9ICdpbnNldCAwIDAgMCAzcHggIzM1OTBkZidcclxuXHJcbiAgICBmdW5jdGlvbiBib3hOb2RlKHJlZikge1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBkZWZpbml0aW9uW3JlZi5yZWZdW3JlZi5pZF1cclxuICAgICAgICBjb25zdCBzdHlsZSA9IHJlc29sdmUobm9kZS5zdHlsZSlcclxuICAgICAgICBjb25zdCBkYXRhID0ge1xyXG4gICAgICAgICAgICBzdHlsZTogZnJvemVuICYmIHNlbGVjdGVkTm9kZUluRGV2ZWxvcG1lbnQuaWQgPT09IHJlZi5pZCA/IHsuLi5zdHlsZSwgdHJhbnNpdGlvbjonYm94LXNoYWRvdyAwLjJzJywgYm94U2hhZG93OiBzdHlsZS5ib3hTaGFkb3cgPyBzdHlsZS5ib3hTaGFkb3cgKyAnICwgJyArIGZyb3plblNoYWRvdzogZnJvemVuU2hhZG93IH0gOiBzdHlsZSxcclxuICAgICAgICAgICAgb246IGZyb3plbiA/XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VvdmVyOiBzZWxlY3RIb3ZlckFjdGl2ZSA/IFtzZWxlY3ROb2RlSG92ZXIsIHJlZl06IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBjbGljazogW3NlbGVjdE5vZGVDbGljaywgcmVmXVxyXG4gICAgICAgICAgICAgICAgfTp7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xpY2s6IG5vZGUuY2xpY2sgPyBbZW1pdEV2ZW50LCBub2RlLmNsaWNrXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBkYmxjbGljazogbm9kZS5kYmxjbGljayA/IFtlbWl0RXZlbnQsIG5vZGUuZGJsY2xpY2tdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlb3Zlcjogbm9kZS5tb3VzZW92ZXIgPyBbZW1pdEV2ZW50LCBub2RlLm1vdXNlb3Zlcl0gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VvdXQ6IG5vZGUubW91c2VvdXQgPyBbZW1pdEV2ZW50LCBub2RlLm1vdXNlb3V0XSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBoKCdkaXYnLCBkYXRhLCBmbGF0dGVuKG5vZGUuY2hpbGRyZW4ubWFwKHJlc29sdmUpKSlcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpZk5vZGUocmVmKSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IGRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXVxyXG4gICAgICAgIHJldHVybiByZXNvbHZlKG5vZGUudmFsdWUpID8gbm9kZS5jaGlsZHJlbi5tYXAocmVzb2x2ZSk6IFtdXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdGV4dE5vZGUocmVmKSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IGRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXVxyXG4gICAgICAgIGNvbnN0IHN0eWxlID0gcmVzb2x2ZShub2RlLnN0eWxlKVxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSB7XHJcbiAgICAgICAgICAgIHN0eWxlOiBmcm96ZW4gJiYgc2VsZWN0ZWROb2RlSW5EZXZlbG9wbWVudC5pZCA9PT0gcmVmLmlkID8gey4uLnN0eWxlLCB0cmFuc2l0aW9uOidib3gtc2hhZG93IDAuMnMnLCBib3hTaGFkb3c6IHN0eWxlLmJveFNoYWRvdyA/IHN0eWxlLmJveFNoYWRvdyArICcgLCAnICsgZnJvemVuU2hhZG93OiBmcm96ZW5TaGFkb3cgfSA6IHN0eWxlLFxyXG4gICAgICAgICAgICBvbjogZnJvemVuID9cclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZW92ZXI6IHNlbGVjdEhvdmVyQWN0aXZlID8gW3NlbGVjdE5vZGVIb3ZlciwgcmVmXTogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBbc2VsZWN0Tm9kZUNsaWNrLCByZWZdXHJcbiAgICAgICAgICAgICAgICB9OntcclxuICAgICAgICAgICAgICAgICAgICBjbGljazogbm9kZS5jbGljayA/IFtlbWl0RXZlbnQsIG5vZGUuY2xpY2tdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGRibGNsaWNrOiBub2RlLmRibGNsaWNrID8gW2VtaXRFdmVudCwgbm9kZS5kYmxjbGlja10gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VvdmVyOiBub2RlLm1vdXNlb3ZlciA/IFtlbWl0RXZlbnQsIG5vZGUubW91c2VvdmVyXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZW91dDogbm9kZS5tb3VzZW91dCA/IFtlbWl0RXZlbnQsIG5vZGUubW91c2VvdXRdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGgoJ3NwYW4nLCBkYXRhLCByZXNvbHZlKG5vZGUudmFsdWUpKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGltYWdlTm9kZShyZWYpIHtcclxuICAgICAgICBjb25zdCBub2RlID0gZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdXHJcbiAgICAgICAgY29uc3Qgc3R5bGUgPSByZXNvbHZlKG5vZGUuc3R5bGUpXHJcbiAgICAgICAgY29uc3QgZGF0YSA9IHtcclxuICAgICAgICAgICAgYXR0cnM6IHtcclxuICAgICAgICAgICAgICAgIHNyYzogcmVzb2x2ZShub2RlLnNyYylcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc3R5bGU6IGZyb3plbiAmJiBzZWxlY3RlZE5vZGVJbkRldmVsb3BtZW50LmlkID09PSByZWYuaWQgPyB7Li4uc3R5bGUsIHRyYW5zaXRpb246J2JveC1zaGFkb3cgMC4ycycsIGJveFNoYWRvdzogc3R5bGUuYm94U2hhZG93ID8gc3R5bGUuYm94U2hhZG93ICsgJyAsICcgKyBmcm96ZW5TaGFkb3c6IGZyb3plblNoYWRvdyB9IDogc3R5bGUsXHJcbiAgICAgICAgICAgIG9uOiBmcm96ZW4gP1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlb3Zlcjogc2VsZWN0SG92ZXJBY3RpdmUgPyBbc2VsZWN0Tm9kZUhvdmVyLCByZWZdOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xpY2s6IFtzZWxlY3ROb2RlQ2xpY2ssIHJlZl1cclxuICAgICAgICAgICAgICAgIH06e1xyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBub2RlLmNsaWNrID8gW2VtaXRFdmVudCwgbm9kZS5jbGlja10gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgZGJsY2xpY2s6IG5vZGUuZGJsY2xpY2sgPyBbZW1pdEV2ZW50LCBub2RlLmRibGNsaWNrXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZW92ZXI6IG5vZGUubW91c2VvdmVyID8gW2VtaXRFdmVudCwgbm9kZS5tb3VzZW92ZXJdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlb3V0OiBub2RlLm1vdXNlb3V0ID8gW2VtaXRFdmVudCwgbm9kZS5tb3VzZW91dF0gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaCgnaW1nJywgZGF0YSlcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbnB1dE5vZGUocmVmKSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IGRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXVxyXG4gICAgICAgIGNvbnN0IHN0eWxlID0gcmVzb2x2ZShub2RlLnN0eWxlKVxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSB7XHJcbiAgICAgICAgICAgIHN0eWxlOiBmcm96ZW4gJiYgc2VsZWN0ZWROb2RlSW5EZXZlbG9wbWVudC5pZCA9PT0gcmVmLmlkID8gey4uLnN0eWxlLCB0cmFuc2l0aW9uOidib3gtc2hhZG93IDAuMnMnLCBib3hTaGFkb3c6IHN0eWxlLmJveFNoYWRvdyA/IHN0eWxlLmJveFNoYWRvdyArICcgLCAnICsgZnJvemVuU2hhZG93OiBmcm96ZW5TaGFkb3cgfSA6IHN0eWxlLFxyXG4gICAgICAgICAgICBvbjogZnJvemVuID9cclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZW92ZXI6IHNlbGVjdEhvdmVyQWN0aXZlID8gW3NlbGVjdE5vZGVIb3ZlciwgcmVmXTogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBbc2VsZWN0Tm9kZUNsaWNrLCByZWZdXHJcbiAgICAgICAgICAgICAgICB9OntcclxuICAgICAgICAgICAgICAgICAgICBjbGljazogbm9kZS5jbGljayA/IFtlbWl0RXZlbnQsIG5vZGUuY2xpY2tdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0OiBub2RlLmlucHV0ID8gW2VtaXRFdmVudCwgbm9kZS5pbnB1dF0gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgZGJsY2xpY2s6IG5vZGUuZGJsY2xpY2sgPyBbZW1pdEV2ZW50LCBub2RlLmRibGNsaWNrXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZW92ZXI6IG5vZGUubW91c2VvdmVyID8gW2VtaXRFdmVudCwgbm9kZS5tb3VzZW92ZXJdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlb3V0OiBub2RlLm1vdXNlb3V0ID8gW2VtaXRFdmVudCwgbm9kZS5tb3VzZW91dF0gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9jdXM6IG5vZGUuZm9jdXMgPyBbZW1pdEV2ZW50LCBub2RlLmZvY3VzXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBibHVyOiBub2RlLmJsdXIgPyBbZW1pdEV2ZW50LCBub2RlLmJsdXJdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgcHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiByZXNvbHZlKG5vZGUudmFsdWUpLFxyXG4gICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI6IG5vZGUucGxhY2Vob2xkZXJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaCgnaW5wdXQnLCBkYXRhKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGxpc3ROb2RlKHJlZikge1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBkZWZpbml0aW9uW3JlZi5yZWZdW3JlZi5pZF1cclxuICAgICAgICBjb25zdCBsaXN0ID0gcmVzb2x2ZShub2RlLnZhbHVlKVxyXG5cclxuICAgICAgICBjb25zdCBjaGlsZHJlbiA9IE9iamVjdC5rZXlzKGxpc3QpLm1hcChrZXk9Pmxpc3Rba2V5XSkubWFwKCh2YWx1ZSwgaW5kZXgpPT4ge1xyXG4gICAgICAgICAgICBjdXJyZW50TWFwVmFsdWVbcmVmLmlkXSA9IHZhbHVlXHJcbiAgICAgICAgICAgIGN1cnJlbnRNYXBJbmRleFtyZWYuaWRdID0gaW5kZXhcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBub2RlLmNoaWxkcmVuLm1hcChyZXNvbHZlKVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgZGVsZXRlIGN1cnJlbnRNYXBWYWx1ZVtyZWYuaWRdO1xyXG4gICAgICAgIGRlbGV0ZSBjdXJyZW50TWFwSW5kZXhbcmVmLmlkXTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGNoaWxkcmVuXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbGlzdGVuZXJzID0gW11cclxuXHJcbiAgICBmdW5jdGlvbiBhZGRMaXN0ZW5lcihjYWxsYmFjaykge1xyXG4gICAgICAgIGNvbnN0IGxlbmd0aCA9IGxpc3RlbmVycy5wdXNoKGNhbGxiYWNrKVxyXG5cclxuICAgICAgICAvLyBmb3IgdW5zdWJzY3JpYmluZ1xyXG4gICAgICAgIHJldHVybiAoKSA9PiBsaXN0ZW5lcnMuc3BsaWNlKGxlbmd0aCAtIDEsIDEpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZW1pdEV2ZW50KGV2ZW50UmVmLCBlKSB7XHJcbiAgICAgICAgY29uc3QgZXZlbnRJZCA9IGV2ZW50UmVmLmlkXHJcbiAgICAgICAgY29uc3QgZXZlbnQgPSBkZWZpbml0aW9uLmV2ZW50W2V2ZW50SWRdXHJcbiAgICAgICAgY3VycmVudEV2ZW50ID0gZVxyXG4gICAgICAgIGV2ZW50LmRhdGEuZm9yRWFjaCgocmVmKT0+e1xyXG4gICAgICAgICAgICBpZihyZWYuaWQgPT09ICdfaW5wdXQnKXtcclxuICAgICAgICAgICAgICAgIGV2ZW50RGF0YVtyZWYuaWRdID0gZS50YXJnZXQudmFsdWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgY29uc3QgcHJldmlvdXNTdGF0ZSA9IGN1cnJlbnRTdGF0ZVxyXG4gICAgICAgIGxldCBtdXRhdGlvbnMgPSB7fVxyXG4gICAgICAgIGRlZmluaXRpb24uZXZlbnRbZXZlbnRJZF0ubXV0YXRvcnMuZm9yRWFjaCgocmVmKT0+IHtcclxuICAgICAgICAgICAgY29uc3QgbXV0YXRvciA9IGRlZmluaXRpb24ubXV0YXRvcltyZWYuaWRdXHJcbiAgICAgICAgICAgIGNvbnN0IHN0YXRlID0gbXV0YXRvci5zdGF0ZVxyXG4gICAgICAgICAgICBtdXRhdGlvbnNbc3RhdGUuaWRdID0gcmVzb2x2ZShtdXRhdG9yLm11dGF0aW9uKVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgY3VycmVudFN0YXRlID0gT2JqZWN0LmFzc2lnbih7fSwgY3VycmVudFN0YXRlLCBtdXRhdGlvbnMpXHJcbiAgICAgICAgbGlzdGVuZXJzLmZvckVhY2goY2FsbGJhY2sgPT4gY2FsbGJhY2soZXZlbnRJZCwgZXZlbnREYXRhLCBlLCBwcmV2aW91c1N0YXRlLCBjdXJyZW50U3RhdGUsIG11dGF0aW9ucykpXHJcbiAgICAgICAgY3VycmVudEV2ZW50ID0ge31cclxuICAgICAgICBldmVudERhdGEgPSB7fVxyXG4gICAgICAgIGlmKE9iamVjdC5rZXlzKG11dGF0aW9ucykubGVuZ3RoKXtcclxuICAgICAgICAgICAgcmVuZGVyKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHZkb20gPSByZXNvbHZlKHtyZWY6J3ZOb2RlQm94JywgaWQ6J19yb290Tm9kZSd9KVxyXG4gICAgZnVuY3Rpb24gcmVuZGVyKG5ld0RlZmluaXRpb24pIHtcclxuICAgICAgICBpZihuZXdEZWZpbml0aW9uKXtcclxuICAgICAgICAgICAgaWYoZGVmaW5pdGlvbi5zdGF0ZSAhPT0gbmV3RGVmaW5pdGlvbi5zdGF0ZSl7XHJcbiAgICAgICAgICAgICAgICBkZWZpbml0aW9uID0gbmV3RGVmaW5pdGlvblxyXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3U3RhdGUgPSBPYmplY3Qua2V5cyhkZWZpbml0aW9uLnN0YXRlKS5tYXAoa2V5PT5kZWZpbml0aW9uLnN0YXRlW2tleV0pLnJlZHVjZSgoYWNjLCBkZWYpPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjY1tkZWYucmVmXSA9IGRlZi5kZWZhdWx0VmFsdWVcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWNjXHJcbiAgICAgICAgICAgICAgICB9LCB7fSlcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRTdGF0ZSA9IHsuLi5uZXdTdGF0ZSwgLi4uY3VycmVudFN0YXRlfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZGVmaW5pdGlvbiA9IG5ld0RlZmluaXRpb25cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBuZXd2ZG9tID0gcmVzb2x2ZSh7cmVmOid2Tm9kZUJveCcsIGlkOidfcm9vdE5vZGUnfSlcclxuICAgICAgICBwYXRjaCh2ZG9tLCBuZXd2ZG9tKVxyXG4gICAgICAgIHZkb20gPSBuZXd2ZG9tXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gX2ZyZWV6ZShpc0Zyb3plbiwgY2FsbGJhY2ssIG5vZGVJZCkge1xyXG4gICAgICAgIGZyb3plbkNhbGxiYWNrID0gY2FsbGJhY2tcclxuICAgICAgICBzZWxlY3RlZE5vZGVJbkRldmVsb3BtZW50ID0gbm9kZUlkXHJcbiAgICAgICAgaWYoZnJvemVuID09PSBmYWxzZSAmJiBpc0Zyb3plbiA9PT0gdHJ1ZSl7XHJcbiAgICAgICAgICAgIHNlbGVjdEhvdmVyQWN0aXZlID0gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZihmcm96ZW4gfHwgZnJvemVuICE9PSBpc0Zyb3plbil7XHJcbiAgICAgICAgICAgIGZyb3plbiA9IGlzRnJvemVuXHJcbiAgICAgICAgICAgIHJlbmRlcigpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldEN1cnJlbnRTdGF0ZSgpIHtcclxuICAgICAgICByZXR1cm4gY3VycmVudFN0YXRlXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2V0Q3VycmVudFN0YXRlKG5ld1N0YXRlKSB7XHJcbiAgICAgICAgY3VycmVudFN0YXRlID0gbmV3U3RhdGVcclxuICAgICAgICByZW5kZXIoKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZURlZmF1bHRTdGF0ZSgpIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMoZGVmaW5pdGlvbi5zdGF0ZSkubWFwKGtleT0+ZGVmaW5pdGlvbi5zdGF0ZVtrZXldKS5yZWR1Y2UoKGFjYywgZGVmKT0+IHtcclxuICAgICAgICAgICAgYWNjW2RlZi5yZWZdID0gZGVmLmRlZmF1bHRWYWx1ZVxyXG4gICAgICAgICAgICByZXR1cm4gYWNjXHJcbiAgICAgICAgfSwge30pXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBkZWZpbml0aW9uLFxyXG4gICAgICAgIHZkb20sXHJcbiAgICAgICAgZ2V0Q3VycmVudFN0YXRlLFxyXG4gICAgICAgIHNldEN1cnJlbnRTdGF0ZSxcclxuICAgICAgICByZW5kZXIsXHJcbiAgICAgICAgZW1pdEV2ZW50LFxyXG4gICAgICAgIGFkZExpc3RlbmVyLFxyXG4gICAgICAgIF9mcmVlemUsXHJcbiAgICAgICAgX3Jlc29sdmU6IHJlc29sdmUsXHJcbiAgICAgICAgY3JlYXRlRGVmYXVsdFN0YXRlXHJcbiAgICB9XHJcbn0iLCJtb2R1bGUuZXhwb3J0cz17XHJcbiAgXCJldmVudERhdGFcIjoge1xyXG4gICAgXCJfaW5wdXRcIjoge1xyXG4gICAgICBcInRpdGxlXCI6IFwiaW5wdXQgdmFsdWVcIixcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiXHJcbiAgICB9XHJcbiAgfSxcclxuICBcInRvTG93ZXJDYXNlXCI6IHt9LFxyXG4gIFwidG9VcHBlckNhc2VcIjoge30sXHJcbiAgXCJjb25kaXRpb25hbFwiOiB7fSxcclxuICBcImVxdWFsXCI6IHtcclxuICAgIFwiYTcyNTFhZjAtNTBhNy00ODIzLTg1YTAtNjZjZTA5ZDhhM2NjXCI6IHtcclxuICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImVlMjQyM2U2LTViNDgtNDFhZS04Y2NmLTZhMmM3YjQ2ZDJmOFwiXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIFwibm90XCI6IHt9LFxyXG4gIFwibGVuZ3RoXCI6IHt9LFxyXG4gIFwibGlzdFwiOiB7fSxcclxuICBcImxpc3RWYWx1ZVwiOiB7XHJcbiAgICBcInB6N2hkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcIm51bWJlclwiLFxyXG4gICAgICBcImxpc3RcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwidk5vZGVMaXN0XCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImZsODlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwicHJvcGVydHlcIjogXCJ4XCJcclxuICAgIH0sXHJcbiAgICBcImhqOXdkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcIm51bWJlclwiLFxyXG4gICAgICBcImxpc3RcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwidk5vZGVMaXN0XCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImZsODlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwicHJvcGVydHlcIjogXCJ5XCJcclxuICAgIH0sXHJcbiAgICBcImhocjhiNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJsaXN0XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInZOb2RlTGlzdFwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJmbDg5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjVcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInByb3BlcnR5XCI6IFwiY29sb3JcIlxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCJwaXBlXCI6IHtcclxuICAgIFwiZnc4amQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiTnVtYmVyIGN1cnJlbnRseSBpczogXCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcImpvaW5cIixcclxuICAgICAgICAgIFwiaWRcIjogXCJwOXMzZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgXCJyZWZcIjogXCJqb2luXCIsXHJcbiAgICAgICAgICBcImlkXCI6IFwiOGE2Y2Q2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICBcInVtNWVkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJzdGF0ZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwidWk4amQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiK1wiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiYzh3ZWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiLVwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwicGRxNmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwibnVtYmVyXCIsXHJcbiAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwic3RhdGVcIixcclxuICAgICAgICBcImlkXCI6IFwiNDZ2ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfSxcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwicmVmXCI6IFwiYWRkXCIsXHJcbiAgICAgICAgICBcImlkXCI6IFwidzg2ZmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICBcIjQ1MnFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcIm51bWJlclwiLFxyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInN0YXRlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjQ2dmRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcInN1YnRyYWN0XCIsXHJcbiAgICAgICAgICBcImlkXCI6IFwidTQzd2Q2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICBcImV3ODNkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcIm51bWJlclwiLFxyXG4gICAgICBcInZhbHVlXCI6IDEsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJ3M2U5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJudW1iZXJcIixcclxuICAgICAgXCJ2YWx1ZVwiOiAxLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiM3FraWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IDAsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcImFkZFwiLFxyXG4gICAgICAgICAgXCJpZFwiOiBcIndicjdkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcImpvaW5cIixcclxuICAgICAgICAgIFwiaWRcIjogXCJzMjU4ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIFwidDd2cWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IDAsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcImFkZFwiLFxyXG4gICAgICAgICAgXCJpZFwiOiBcInZxOGRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcImpvaW5cIixcclxuICAgICAgICAgIFwiaWRcIjogXCJ3ZjlhZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIFwiN2RidmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcImxpc3RWYWx1ZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJoajl3ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiOGQ0dmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcImxpc3RWYWx1ZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJwejdoZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiOGNxNmI2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcImxpc3RWYWx1ZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJoaHI4YjZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiZjlxeGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGFibGVcIixcclxuICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJzdGF0ZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJjOHE5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwicXd3OWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwicHhcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcInFkdzdjNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcInB4XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCI4NDM2OWFiYS00YTRkLTQ5MzItOGE5YS04ZjljYTk0OGI2YTJcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCJUaGUgbnVtYmVyIGlzIGV2ZW4g8J+OiVwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiYzJmYjlhOWItMjViYi00ZThiLTgwYzAtY2Y1MWI4NTA2MDcwXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwiYm9vbGVhblwiLFxyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInN0YXRlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjQ2dmRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcInJlbWFpbmRlclwiLFxyXG4gICAgICAgICAgXCJpZFwiOiBcIjM0NzgwZDIyLWY1MjEtNGMzMC04OWE1LTNlN2Y1YjVhZjdjMlwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcImVxdWFsXCIsXHJcbiAgICAgICAgICBcImlkXCI6IFwiYTcyNTFhZjAtNTBhNy00ODIzLTg1YTAtNjZjZTA5ZDhhM2NjXCJcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICBcIjEyMjlkNDc4LWJjMjUtNDQwMS04YTg5LTc0ZmM2Y2ZlODk5NlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcIm51bWJlclwiLFxyXG4gICAgICBcInZhbHVlXCI6IDIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJlZTI0MjNlNi01YjQ4LTQxYWUtOGNjZi02YTJjN2I0NmQyZjhcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJudW1iZXJcIixcclxuICAgICAgXCJ2YWx1ZVwiOiAwLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiOTQ1ZjA4MTgtNzc0My00ZWRkLThjNzYtM2RkNWE4YmE3ZmE5XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiJ0NvbWZvcnRhYScsIGN1cnNpdmVcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcImE2MDg5OWVlLTk5MjUtNGUwNS04OTBlLWI5NDI4YjAyZGJmOVwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIiNmNWY1ZjVcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcIjFlNDY1NDAzLTUzODItNGE0NS04OWRhLThkODhlMmViMmZiOVwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIjEwMCVcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcImVmMmVjMTg0LTE5OWYtNGVlOC04ZTMwLWI5OWRiYzFkZjVkYlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIjEwcHhcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcImZhYjI4NmM0LWRlZDMtNGE1ZS04NzQ5LTc2NzhhYmNiYjEyNVwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIjEwcHggNXB4XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCI3MDNmOGUwMi1jNWMzLTRkMjctOGNhMi03MjJjNGQwZDFlYTBcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCIxMHB4IDE1cHhcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcIjhmM2M2NjMwLWQ4ZDktNGJjMS04YTNkLWJhNGRhZDMwOTFmMFwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIiNhYWFhYWFcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcImQzMWM0NzQ2LTIzMjktNDQwNC04Njg5LWZiZjIzOTNlZmQ0NFwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcImlubGluZS1ibG9ja1wiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiNDE2ODVhZGMtMzc5My00NTY2LThmNjEtMmMyYTQyZmRmODZlXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiNXB4XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJkNTc1NGZkYi00Njg5LTRmODctODdmYy01MWQ2MDAyMmIzMmNcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCIzcHhcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcIjBiYzZhMThjLTE3NjYtNDJiZC04YjRhLTIwMmEyYjBjMzRmZVwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcInBvaW50ZXJcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcIjliMjUwZWY4LWMxYmUtNDcwNi04YTcxLWY0NDRmMThmMGY4MlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIm5vbmVcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcImIwYTEwNDk3LWVjMjYtNGZmNy04NzM5LWExOTM3NTVjYmNhZVwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIjEwcHggNXB4XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCI4NzY0ZTI1OC01OTlkLTQyNTItODExMi1kMDZmY2QwZDVlMmFcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCIxMHB4IDE1cHhcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcIjhjYWFmODc2LTEwYmMtNDdkZS04OWQ5LTg2OWM4OTJjZDRjZVwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIiM5OTk5OTlcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcImFlOTg3YmJhLTczNGEtNDZhZS04YzgyLWMwNDg5NjIyMTE3OVwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcImlubGluZS1ibG9ja1wiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiZjAwOTBmOGQtODdiNC00ZDgzLThhNTMtMDM5YjIxZTJiNTk0XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiNXB4XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJiN2M3OTFhNi0yYzkxLTRiNjItODgyMC1kYmFhZjlkNWMxNzlcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCIzcHhcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcImQ3OTVhNTEwLWNjZjktNGQ5Mi04MWVlLTVlNTEyYjgxZWU1OFwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcInBvaW50ZXJcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcIjc1MTg1MjRhLTBiYzItNDY1Yy04MTRlLTBhNWQzOWRlMjVlM1wiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIjEwcHggNXB4XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJiMjRiMWMxOC04YTgyLTRjOGYtODE4MC02ZDA2MmM3OGM5ZDlcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCJub25lXCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCI2N2Y3MGQ5Ny1hMzQ2LTQyZTQtODMzZi02ZWFlYWVlZDRmZWZcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCIxMHB4IDEwcHggMTBweCAwXCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCI5ODI1NzQ2MS05MjhlLTRmZjktOGFjNS0wYjg5Mjk4ZTRlZjFcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCIxMHB4IDEwcHggMTBweCAwXCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCI5OTMxZmU2YS0wNzRlLTRjYjctODM1NS1jMThkODE4Njc5YTdcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCIxMHB4XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCI3MmI1NTllOS0yNTQ2LTRiYWUtOGE2MS01NTU1NjczNjNiMTFcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCJyaWdodFwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiMzBmOGM3MDEtN2FkZi00Mzk4LTg2MmUtNTUzNzJlMjljMTRkXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiNTBweFwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiNjYzNWRiYjItYjM2NC00ZWZkLTgwNjEtMjY0MzIwMDdlYjFhXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwicmlnaHRcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcIjA0MmNjZjdkLTgxOWItNGZhYy04MjgyLTJmMTkwNjliNTM4NlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIjUwMHB4XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJlN2JjNmUyMC0xNTEwLTRiYWMtODU5Zi0wNGVjM2RjZGE2NmJcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCIxLjVcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcImVmOGRjOWM2LWYzMzMtNGI2MS04ZDI1LWQzNmFmZTUxNzUyMFwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIjEwcHhcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcIjc1NWE3MGEyLWQxODEtNGZhZi04NTkzLTVhYjc2MDExNThmOVwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcImJsb2NrXCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCI5ZjUwMWMzNS01NGIzLTRjNjAtOGZjNC1kNmE0NWU3NzZlYjNcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCIxMHB4XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJlOGFjYzZiMC1kMWRlLTQ0M2ItODEyOC1kZjZiNTE4NmY3MGNcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCJibG9ja1wiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiNzE3NjQzNjItZTA5YS00NDEyLThmYmMtZWQzY2I0ZDRjOTU0XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiMTBweFwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiYzE5OWIxOTEtODhkMi00NjNkLTg1NjQtMWNlMWExNjMxYjJkXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiYmxvY2tcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcImIyMTE3ZTZiLWFjZTctNGU3NS04ZTdkLTMyMzY2OGQxYjE5ZFwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIjEwcHhcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcIjhhNTM4NDhkLThjN2QtNDRkYy04ZDEzLWFlMDYwMTA3YzgwYlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcImJsb2NrXCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCIxOTA2YjViNC02MDI0LTQ4ZjEtODRkYS1jMzMyZTU1NWFmYjNcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCIxMHB4XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJhNTY1Njk2ZC04YTYwLTQxNmUtODQ0YS02MGM4ZjJmZThjNWFcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCJibG9ja1wiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiMTVkNDdiMDctMzk2Yy00YzAzLTg1OTEtZjQ3MjU5OGYxNWUyXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiMTBweFwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiYThmNWMxY2UtNzgzYi00NjI2LTgyNmEtNDczYWI0MzRjMGIyXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiMTBweFwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiYTljdzlhOWItMjViYi00ZThiLTgwYzAtY2Y1MWI4NTA2MDcwXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiaHR0cHM6Ly91cGxvYWQud2lraW1lZGlhLm9yZy93aWtpcGVkaWEvY29tbW9ucy90aHVtYi85LzlhL1NjaG9uYWNoXy1fUGFyYWRpZXNfLV9Tb25uZW5hdWZnYW5nLmpwZy8xMjgwcHgtU2Nob25hY2hfLV9QYXJhZGllc18tX1Nvbm5lbmF1ZmdhbmcuanBnXCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJkMTMxNDI3NC01ZWZjLTRiZTEtODMwYi0wZmY4YzkyYjUwMjlcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCJibG9ja1wiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiOXFjODQyNzQtNWVmYy00YmUxLTgzMGItMGZmOGM5MmI1MDI5XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiXCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9XHJcbiAgfSxcclxuICBcImpvaW5cIjoge1xyXG4gICAgXCJwOXMzZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwidW01ZWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwid2Y5YWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcInF3dzlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcInMyNThkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJxZHc3YzZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCI4YTZjZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiOXFjODQyNzQtNWVmYy00YmUxLTgzMGItMGZmOGM5MmI1MDI5XCJcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCJhZGRcIjoge1xyXG4gICAgXCJ3ODZmZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiZXc4M2Q2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwid2JyN2Q2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjhkNHZkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcInZxOGRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI3ZGJ2ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICBcInN1YnRyYWN0XCI6IHtcclxuICAgIFwidTQzd2Q2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcInczZTlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIFwicmVtYWluZGVyXCI6IHtcclxuICAgIFwiMzQ3ODBkMjItZjUyMS00YzMwLTg5YTUtM2U3ZjViNWFmN2MyXCI6IHtcclxuICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjEyMjlkNDc4LWJjMjUtNDQwMS04YTg5LTc0ZmM2Y2ZlODk5NlwiXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIFwidk5vZGVCb3hcIjoge1xyXG4gICAgXCJfcm9vdE5vZGVcIjoge1xyXG4gICAgICBcInRpdGxlXCI6IFwiYXBwXCIsXHJcbiAgICAgIFwic3R5bGVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwic3R5bGVcIixcclxuICAgICAgICBcImlkXCI6IFwiX3Jvb3RTdHlsZVwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwicGFyZW50XCI6IHt9LFxyXG4gICAgICBcImNoaWxkcmVuXCI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcInZOb2RlVGV4dFwiLFxyXG4gICAgICAgICAgXCJpZFwiOiBcIjI0NzFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcInZOb2RlVGV4dFwiLFxyXG4gICAgICAgICAgXCJpZFwiOiBcIjE0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcInZOb2RlVGV4dFwiLFxyXG4gICAgICAgICAgXCJpZFwiOiBcIjM0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcInZOb2RlSWZcIixcclxuICAgICAgICAgIFwiaWRcIjogXCI1Nzg3YzE1YS00MjZiLTQxZWItODMxZC1lM2UwNzQxNTk1ODJcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZUltYWdlXCIsXHJcbiAgICAgICAgICBcImlkXCI6IFwic2Q4dmMxNWEtNDI2Yi00MWViLTgzMWQtZTNlMDc0MTU5NTgyXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwicmVmXCI6IFwidk5vZGVMaXN0XCIsXHJcbiAgICAgICAgICBcImlkXCI6IFwiZmw4OWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCJcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICBcImd3OWRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidGl0bGVcIjogXCJib3hcIixcclxuICAgICAgXCJzdHlsZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJzdHlsZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJmcTlkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInBhcmVudFwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZUxpc3RcIixcclxuICAgICAgICBcImlkXCI6IFwiZmw4OWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCJcclxuICAgICAgfSxcclxuICAgICAgXCJjaGlsZHJlblwiOiBbXVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCJ2Tm9kZVRleHRcIjoge1xyXG4gICAgXCIyNDcxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjVcIjoge1xyXG4gICAgICBcInRpdGxlXCI6IFwiTnVtYmVyIGN1cnJlbnRseVwiLFxyXG4gICAgICBcInN0eWxlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInN0eWxlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjg0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwicGFyZW50XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInZOb2RlQm94XCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIl9yb290Tm9kZVwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJmdzhqZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCIxNDgxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjVcIjoge1xyXG4gICAgICBcInRpdGxlXCI6IFwiKyBidXR0b25cIixcclxuICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcInVpOGpkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwic3R5bGVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwic3R5bGVcIixcclxuICAgICAgICBcImlkXCI6IFwiOTQ4MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfSxcclxuICAgICAgXCJwYXJlbnRcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwidk5vZGVCb3hcIixcclxuICAgICAgICBcImlkXCI6IFwiX3Jvb3ROb2RlXCJcclxuICAgICAgfSxcclxuICAgICAgXCJjbGlja1wiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJldmVudFwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJkNDhyZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCIzNDgxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjVcIjoge1xyXG4gICAgICBcInRpdGxlXCI6IFwiLSBidXR0b25cIixcclxuICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImM4d2VkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwic3R5bGVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwic3R5bGVcIixcclxuICAgICAgICBcImlkXCI6IFwiNzQ4MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfSxcclxuICAgICAgXCJwYXJlbnRcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwidk5vZGVCb3hcIixcclxuICAgICAgICBcImlkXCI6IFwiX3Jvb3ROb2RlXCJcclxuICAgICAgfSxcclxuICAgICAgXCJjbGlja1wiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJldmVudFwiLFxyXG4gICAgICAgIFwiaWRcIjogXCIzYTU0ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJlOGFkZDFjNy04YTAxLTQxNjQtODYwNC03MjJkOGFiNTI5ZjFcIjoge1xyXG4gICAgICBcInRpdGxlXCI6IFwiaXMgZXZlblwiLFxyXG4gICAgICBcInN0eWxlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInN0eWxlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjRkY2E3M2IzLTkwZWItNDFlNy04NjUxLTJiZGNjOTNmMzg3MVwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwicGFyZW50XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInZOb2RlSWZcIixcclxuICAgICAgICBcImlkXCI6IFwiNTc4N2MxNWEtNDI2Yi00MWViLTgzMWQtZTNlMDc0MTU5NTgyXCJcclxuICAgICAgfSxcclxuICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjg0MzY5YWJhLTRhNGQtNDkzMi04YTlhLThmOWNhOTQ4YjZhMlwiXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIFwidk5vZGVJbnB1dFwiOiB7fSxcclxuICBcInZOb2RlTGlzdFwiOiB7XHJcbiAgICBcImZsODlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiOiB7XHJcbiAgICAgIFwidGl0bGVcIjogXCJsaXN0IG9mIGJveGVzXCIsXHJcbiAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJmOXF4ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInBhcmVudFwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZUJveFwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJfcm9vdE5vZGVcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImNoaWxkcmVuXCI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcInZOb2RlQm94XCIsXHJcbiAgICAgICAgICBcImlkXCI6IFwiZ3c5ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIH1cclxuICB9LFxyXG4gIFwidk5vZGVJZlwiOiB7XHJcbiAgICBcIjU3ODdjMTVhLTQyNmItNDFlYi04MzFkLWUzZTA3NDE1OTU4MlwiOiB7XHJcbiAgICAgIFwidGl0bGVcIjogXCJpcyBudW1iZXIgZXZlblwiLFxyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiYzJmYjlhOWItMjViYi00ZThiLTgwYzAtY2Y1MWI4NTA2MDcwXCJcclxuICAgICAgfSxcclxuICAgICAgXCJwYXJlbnRcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwidk5vZGVCb3hcIixcclxuICAgICAgICBcImlkXCI6IFwiX3Jvb3ROb2RlXCJcclxuICAgICAgfSxcclxuICAgICAgXCJjaGlsZHJlblwiOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZVRleHRcIixcclxuICAgICAgICAgIFwiaWRcIjogXCJlOGFkZDFjNy04YTAxLTQxNjQtODYwNC03MjJkOGFiNTI5ZjFcIlxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCJ2Tm9kZUltYWdlXCI6IHtcclxuICAgIFwic2Q4dmMxNWEtNDI2Yi00MWViLTgzMWQtZTNlMDc0MTU5NTgyXCI6IHtcclxuICAgICAgXCJ0aXRsZVwiOiBcImhpbGxzXCIsXHJcbiAgICAgIFwic3JjXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiYTljdzlhOWItMjViYi00ZThiLTgwYzAtY2Y1MWI4NTA2MDcwXCJcclxuICAgICAgfSxcclxuICAgICAgXCJwYXJlbnRcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwidk5vZGVCb3hcIixcclxuICAgICAgICBcImlkXCI6IFwiX3Jvb3ROb2RlXCJcclxuICAgICAgfSxcclxuICAgICAgXCJzdHlsZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJzdHlsZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJ3ZjhkNzNiMy05MGViLTQxZTctODY1MS0yYmRjYzkzZjM4NzFcIlxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICBcInN0eWxlXCI6IHtcclxuICAgIFwiX3Jvb3RTdHlsZVwiOiB7XHJcbiAgICAgIFwiZm9udEZhbWlseVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjk0NWYwODE4LTc3NDMtNGVkZC04Yzc2LTNkZDVhOGJhN2ZhOVwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiYmFja2dyb3VuZFwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImE2MDg5OWVlLTk5MjUtNGUwNS04OTBlLWI5NDI4YjAyZGJmOVwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwibWluSGVpZ2h0XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiMWU0NjU0MDMtNTM4Mi00YTQ1LTg5ZGEtOGQ4OGUyZWIyZmI5XCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiODQ4MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJwYWRkaW5nXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiZWYyZWMxODQtMTk5Zi00ZWU4LThlMzAtYjk5ZGJjMWRmNWRiXCJcclxuICAgICAgfSxcclxuICAgICAgXCJtYXJnaW5cIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJmYWIyODZjNC1kZWQzLTRhNWUtODc0OS03Njc4YWJjYmIxMjVcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCI5NDgxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInBhZGRpbmdcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI3MDNmOGUwMi1jNWMzLTRkMjctOGNhMi03MjJjNGQwZDFlYTBcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImJhY2tncm91bmRcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI4ZjNjNjYzMC1kOGQ5LTRiYzEtOGEzZC1iYTRkYWQzMDkxZjBcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImRpc3BsYXlcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJkMzFjNDc0Ni0yMzI5LTQ0MDQtODY4OS1mYmYyMzkzZWZkNDRcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImJvcmRlclJhZGl1c1wiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImQ1NzU0ZmRiLTQ2ODktNGY4Ny04N2ZjLTUxZDYwMDIyYjMyY1wiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiY3Vyc29yXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiMGJjNmExOGMtMTc2Ni00MmJkLThiNGEtMjAyYTJiMGMzNGZlXCJcclxuICAgICAgfSxcclxuICAgICAgXCJ1c2VyU2VsZWN0XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiOWIyNTBlZjgtYzFiZS00NzA2LThhNzEtZjQ0NGYxOGYwZjgyXCJcclxuICAgICAgfSxcclxuICAgICAgXCJtYXJnaW5cIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJiMGExMDQ5Ny1lYzI2LTRmZjctODczOS1hMTkzNzU1Y2JjYWVcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCI3NDgxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInBhZGRpbmdcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI4NzY0ZTI1OC01OTlkLTQyNTItODExMi1kMDZmY2QwZDVlMmFcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImJhY2tncm91bmRcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI4Y2FhZjg3Ni0xMGJjLTQ3ZGUtODlkOS04NjljODkyY2Q0Y2VcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImRpc3BsYXlcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJhZTk4N2JiYS03MzRhLTQ2YWUtOGM4Mi1jMDQ4OTYyMjExNzlcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImJvcmRlclJhZGl1c1wiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImI3Yzc5MWE2LTJjOTEtNGI2Mi04ODIwLWRiYWFmOWQ1YzE3OVwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiY3Vyc29yXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiZDc5NWE1MTAtY2NmOS00ZDkyLTgxZWUtNWU1MTJiODFlZTU4XCJcclxuICAgICAgfSxcclxuICAgICAgXCJtYXJnaW5cIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI3NTE4NTI0YS0wYmMyLTQ2NWMtODE0ZS0wYTVkMzlkZTI1ZTNcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCI4MDkyYWM1ZS1kZmQwLTQ0OTItYTY1ZC04YWMzZWVjMzI1ZTBcIjoge1xyXG4gICAgICBcInBhZGRpbmdcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI2N2Y3MGQ5Ny1hMzQ2LTQyZTQtODMzZi02ZWFlYWVlZDRmZWZcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJhOTQ2MWUyOC03ZDkyLTQ5YTAtOTAwMS0yM2Q3NGU0YjM4MmRcIjoge1xyXG4gICAgICBcInBhZGRpbmdcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI5ODI1NzQ2MS05MjhlLTRmZjktOGFjNS0wYjg5Mjk4ZTRlZjFcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCI3NjZiMTFlYy1kYTI3LTQ5NGMtYjI3Mi1jMjZmZWMzZjY0NzVcIjoge1xyXG4gICAgICBcInBhZGRpbmdcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI5OTMxZmU2YS0wNzRlLTRjYjctODM1NS1jMThkODE4Njc5YTdcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImZsb2F0XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiNzJiNTU5ZTktMjU0Ni00YmFlLThhNjEtNTU1NTY3MzYzYjExXCJcclxuICAgICAgfSxcclxuICAgICAgXCJ0ZXh0QWxpZ25cIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI2NjM1ZGJiMi1iMzY0LTRlZmQtODA2MS0yNjQzMjAwN2ViMWFcIlxyXG4gICAgICB9LFxyXG4gICAgICBcIm1heFdpZHRoXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiMDQyY2NmN2QtODE5Yi00ZmFjLTgyODItMmYxOTA2OWI1Mzg2XCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiY2JjZDhlZGItNGFhMi00M2ZlLWFkMzktY2VlNzliNDkwMjk1XCI6IHtcclxuICAgICAgXCJwYWRkaW5nXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiZWY4ZGM5YzYtZjMzMy00YjYxLThkMjUtZDM2YWZlNTE3NTIwXCJcclxuICAgICAgfSxcclxuICAgICAgXCJkaXNwbGF5XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiNzU1YTcwYTItZDE4MS00ZmFmLTg1OTMtNWFiNzYwMTE1OGY5XCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiNjc2M2YxMDItMjNmNy00MzkwLWI0NjMtNGUxYjE0ZTg2NmM5XCI6IHtcclxuICAgICAgXCJwYWRkaW5nXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiOWY1MDFjMzUtNTRiMy00YzYwLThmYzQtZDZhNDVlNzc2ZWIzXCJcclxuICAgICAgfSxcclxuICAgICAgXCJkaXNwbGF5XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiZThhY2M2YjAtZDFkZS00NDNiLTgxMjgtZGY2YjUxODZmNzBjXCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiOTFjOWFkZjAtZDYyZS00NTgwLTkzZTctZjM5NTk0YWU1ZTdkXCI6IHtcclxuICAgICAgXCJwYWRkaW5nXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiNzE3NjQzNjItZTA5YS00NDEyLThmYmMtZWQzY2I0ZDRjOTU0XCJcclxuICAgICAgfSxcclxuICAgICAgXCJkaXNwbGF5XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiYzE5OWIxOTEtODhkMi00NjNkLTg1NjQtMWNlMWExNjMxYjJkXCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiZTlmYmViMzktNzE5My00NTIyLTkxYjMtNzYxYmQzNTYzOWQzXCI6IHtcclxuICAgICAgXCJwYWRkaW5nXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiYjIxMTdlNmItYWNlNy00ZTc1LThlN2QtMzIzNjY4ZDFiMTlkXCJcclxuICAgICAgfSxcclxuICAgICAgXCJkaXNwbGF5XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiOGE1Mzg0OGQtOGM3ZC00NGRjLThkMTMtYWUwNjAxMDdjODBiXCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiM2NmNWQ4OWQtMzcwMy00ODNlLWFiNjQtNWE1Yjc4MGFlYzI3XCI6IHtcclxuICAgICAgXCJwYWRkaW5nXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiMTkwNmI1YjQtNjAyNC00OGYxLTg0ZGEtYzMzMmU1NTVhZmIzXCJcclxuICAgICAgfSxcclxuICAgICAgXCJkaXNwbGF5XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiYTU2NTY5NmQtOGE2MC00MTZlLTg0NGEtNjBjOGYyZmU4YzVhXCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiZnE5ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJwYWRkaW5nXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiMTVkNDdiMDctMzk2Yy00YzAzLTg1OTEtZjQ3MjU5OGYxNWUyXCJcclxuICAgICAgfSxcclxuICAgICAgXCJ3aWR0aFwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjNxa2lkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiaGVpZ2h0XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwidDd2cWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfSxcclxuICAgICAgXCJiYWNrZ3JvdW5kXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiOGNxNmI2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiNGRjYTczYjMtOTBlYi00MWU3LTg2NTEtMmJkY2M5M2YzODcxXCI6IHtcclxuICAgICAgXCJwYWRkaW5nXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiYThmNWMxY2UtNzgzYi00NjI2LTgyNmEtNDczYWI0MzRjMGIyXCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwid2Y4ZDczYjMtOTBlYi00MWU3LTg2NTEtMmJkY2M5M2YzODcxXCI6IHtcclxuICAgICAgXCJkaXNwbGF5XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiZDEzMTQyNzQtNWVmYy00YmUxLTgzMGItMGZmOGM5MmI1MDI5XCJcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCJuYW1lU3BhY2VcIjoge1xyXG4gICAgXCJfcm9vdE5hbWVTcGFjZVwiOiB7XHJcbiAgICAgIFwidGl0bGVcIjogXCJzdGF0ZVwiLFxyXG4gICAgICBcImNoaWxkcmVuXCI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcInN0YXRlXCIsXHJcbiAgICAgICAgICBcImlkXCI6IFwiNDZ2ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwicmVmXCI6IFwic3RhdGVcIixcclxuICAgICAgICAgIFwiaWRcIjogXCJjOHE5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCJzdGF0ZVwiOiB7XHJcbiAgICBcIjQ2dmRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidGl0bGVcIjogXCJudW1iZXJcIixcclxuICAgICAgXCJyZWZcIjogXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIixcclxuICAgICAgXCJ0eXBlXCI6IFwibnVtYmVyXCIsXHJcbiAgICAgIFwiZGVmYXVsdFZhbHVlXCI6IDAsXHJcbiAgICAgIFwibXV0YXRvcnNcIjogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwicmVmXCI6IFwibXV0YXRvclwiLFxyXG4gICAgICAgICAgXCJpZFwiOiBcImFzNTVkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcIm11dGF0b3JcIixcclxuICAgICAgICAgIFwiaWRcIjogXCI5ZHE4ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIFwiYzhxOWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0aXRsZVwiOiBcInRpbGVzXCIsXHJcbiAgICAgIFwicmVmXCI6IFwiYzhxOWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCIsXHJcbiAgICAgIFwidHlwZVwiOiBcInRhYmxlXCIsXHJcbiAgICAgIFwiZGVmaW5pdGlvblwiOiB7XHJcbiAgICAgICAgXCJ4XCI6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgXCJ5XCI6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgXCJjb2xvclwiOiBcInRleHRcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImRlZmF1bHRWYWx1ZVwiOiB7XHJcbiAgICAgICAgXCJvcHM2ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgXCJ4XCI6IDEyMCxcclxuICAgICAgICAgIFwieVwiOiAxMDAsXHJcbiAgICAgICAgICBcImNvbG9yXCI6IFwiI2VhYjY1Y1wiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIndwdjVkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICBcInhcIjogMjAwLFxyXG4gICAgICAgICAgXCJ5XCI6IDEyMCxcclxuICAgICAgICAgIFwiY29sb3JcIjogXCIjNTNCMkVEXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwicW4yN2Q2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgIFwieFwiOiAxMzAsXHJcbiAgICAgICAgICBcInlcIjogMjAwLFxyXG4gICAgICAgICAgXCJjb2xvclwiOiBcIiM1YmNjNWJcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJjYTlyZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgXCJ4XCI6IDE1MCxcclxuICAgICAgICAgIFwieVwiOiAxNTAsXHJcbiAgICAgICAgICBcImNvbG9yXCI6IFwiIzRkNGQ0ZFwiXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBcIm11dGF0b3JzXCI6IFtdXHJcbiAgICB9XHJcbiAgfSxcclxuICBcIm11dGF0b3JcIjoge1xyXG4gICAgXCJhczU1ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcImV2ZW50XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcImV2ZW50XCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImQ0OHJkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwic3RhdGVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwic3RhdGVcIixcclxuICAgICAgICBcImlkXCI6IFwiNDZ2ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfSxcclxuICAgICAgXCJtdXRhdGlvblwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcInBkcTZkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcIjlkcThkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwiZXZlbnRcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwiZXZlbnRcIixcclxuICAgICAgICBcImlkXCI6IFwiM2E1NGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfSxcclxuICAgICAgXCJzdGF0ZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJzdGF0ZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9LFxyXG4gICAgICBcIm11dGF0aW9uXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiNDUycWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCJldmVudFwiOiB7XHJcbiAgICBcImQ0OHJkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcImNsaWNrXCIsXHJcbiAgICAgIFwibXV0YXRvcnNcIjogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwicmVmXCI6IFwibXV0YXRvclwiLFxyXG4gICAgICAgICAgXCJpZFwiOiBcImFzNTVkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgfVxyXG4gICAgICBdLFxyXG4gICAgICBcImVtaXR0ZXJcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwidk5vZGVUZXh0XCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjE0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiZGF0YVwiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiM2E1NGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwiY2xpY2tcIixcclxuICAgICAgXCJtdXRhdG9yc1wiOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgXCJyZWZcIjogXCJtdXRhdG9yXCIsXHJcbiAgICAgICAgICBcImlkXCI6IFwiOWRxOGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICB9XHJcbiAgICAgIF0sXHJcbiAgICAgIFwiZW1pdHRlclwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZVRleHRcIixcclxuICAgICAgICBcImlkXCI6IFwiMzQ4MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCJcclxuICAgICAgfSxcclxuICAgICAgXCJkYXRhXCI6IFtdXHJcbiAgICB9XHJcbiAgfVxyXG59Il19
