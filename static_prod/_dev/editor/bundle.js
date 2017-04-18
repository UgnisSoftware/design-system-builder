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
"use strict";var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj;};var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};var _snabbdom=require("snabbdom");var _snabbdom2=_interopRequireDefault(_snabbdom);var _h=require("snabbdom/h");var _h2=_interopRequireDefault(_h);var _big=require("../node_modules/big.js");var _big2=_interopRequireDefault(_big);var _ugnis=require("./ugnis");var _ugnis2=_interopRequireDefault(_ugnis);var _app=require("../ugnis_components/app.json");var _app2=_interopRequireDefault(_app);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _defineProperty(obj,key,value){if(key in obj){Object.defineProperty(obj,key,{value:value,enumerable:true,configurable:true,writable:true});}else{obj[key]=value;}return obj;}function _toConsumableArray(arr){if(Array.isArray(arr)){for(var i=0,arr2=Array(arr.length);i<arr.length;i++){arr2[i]=arr[i];}return arr2;}else{return Array.from(arr);}}function updateProps(oldVnode,vnode){var key=void 0,cur=void 0,old=void 0,elm=vnode.elm,props=vnode.data.liveProps||{};for(key in props){cur=props[key];old=elm[key];if(old!==cur)elm[key]=cur;}}var livePropsPlugin={create:updateProps,update:updateProps};var patch=_snabbdom2.default.init([require('snabbdom/modules/class'),require('snabbdom/modules/props'),require('snabbdom/modules/style'),require('snabbdom/modules/eventlisteners'),require('snabbdom/modules/attributes'),livePropsPlugin]);function uuid(){return(""+1e7+-1e3+-4e3+-8e3+-1e11).replace(/[10]/g,function(){return(0|Math.random()*16).toString(16);});}_big2.default.E_POS=1e+6;function moveInArray(array,moveIndex,toIndex){var item=array[moveIndex];var length=array.length;var diff=moveIndex-toIndex;if(diff>0){return[].concat(_toConsumableArray(array.slice(0,toIndex)),[item],_toConsumableArray(array.slice(toIndex,moveIndex)),_toConsumableArray(array.slice(moveIndex+1,length)));}else if(diff<0){return[].concat(_toConsumableArray(array.slice(0,moveIndex)),_toConsumableArray(array.slice(moveIndex+1,toIndex+1)),[item],_toConsumableArray(array.slice(toIndex+1,length)));}return array;}var attachFastClick=require('fastclick');attachFastClick(document.body);var version='0.0.28v';editor(_app2.default);function editor(appDefinition){var savedDefinition=JSON.parse(localStorage.getItem('app_key_'+version));var app=(0,_ugnis2.default)(savedDefinition||appDefinition);var node=document.createElement('div');document.body.appendChild(node);// State
var state={leftOpen:true,rightOpen:true,fullScreen:false,editorRightWidth:350,editorLeftWidth:350,subEditorWidth:350,appIsFrozen:false,selectedViewNode:{},selectedPipeId:'',selectedStateNodeId:'',selectedViewSubMenu:'props',editingTitleNodeId:'',viewFoldersClosed:{},draggedComponentView:null,hoveredViewNode:null,mousePosition:{},eventStack:[],definition:savedDefinition||app.definition};// undo/redo
var stateStack=[state.definition];var currentAnimationFrameRequest=null;function setState(newState){if(newState===state){console.warn('state was mutated, search for a bug');}if(state.definition!==newState.definition){// unselect deleted components and state
if(newState.definition.state[newState.selectedStateNodeId]===undefined){newState=_extends({},newState,{selectedStateNodeId:''});}if(newState.selectedViewNode.ref!==undefined&&newState.definition[newState.selectedViewNode.ref][newState.selectedViewNode.id]===undefined){newState=_extends({},newState,{selectedViewNode:{}});}// undo/redo then render then save
var currentIndex=stateStack.findIndex(function(a){return a===state.definition;});stateStack=stateStack.slice(0,currentIndex+1).concat(newState.definition);// TODO add garbage collection?
app.render(newState.definition);setTimeout(function(){return localStorage.setItem('app_key_'+version,JSON.stringify(newState.definition));},0);}if(state.appIsFrozen!==newState.appIsFrozen||state.selectedViewNode!==newState.selectedViewNode){app._freeze(newState.appIsFrozen,VIEW_NODE_SELECTED,newState.selectedViewNode);}if(newState.editingTitleNodeId&&state.editingTitleNodeId!==newState.editingTitleNodeId){// que auto focus
setTimeout(function(){var node=document.querySelectorAll('[data-istitleeditor]')[0];if(node){node.focus();}},0);}state=newState;if(!currentAnimationFrameRequest){window.requestAnimationFrame(render);}}document.addEventListener('click',function(e){// clicked outside
if(state.editingTitleNodeId&&!e.target.dataset.istitleeditor){setState(_extends({},state,{editingTitleNodeId:''}));}});window.addEventListener("resize",function(){render();},false);window.addEventListener("orientationchange",function(){render();},false);document.addEventListener('keydown',function(e){// 83 - s
// 90 - z
// 89 - y
// 32 - space
// 13 - enter
// 27 - escape
if(e.which===83&&(navigator.platform.match("Mac")?e.metaKey:e.ctrlKey)){// TODO garbage collect
e.preventDefault();fetch('/save',{method:'POST',body:JSON.stringify(state.definition),headers:{"Content-Type":"application/json"}});return false;}if(e.which===32&&(navigator.platform.match("Mac")?e.metaKey:e.ctrlKey)){e.preventDefault();FREEZER_CLICKED();}if(!e.shiftKey&&e.which===90&&(navigator.platform.match("Mac")?e.metaKey:e.ctrlKey)){e.preventDefault();var currentIndex=stateStack.findIndex(function(a){return a===state.definition;});if(currentIndex>0){var newDefinition=stateStack[currentIndex-1];app.render(newDefinition);state=_extends({},state,{definition:newDefinition});render();}}if(e.which===89&&(navigator.platform.match("Mac")?e.metaKey:e.ctrlKey)||e.shiftKey&&e.which===90&&(navigator.platform.match("Mac")?e.metaKey:e.ctrlKey)){e.preventDefault();var _currentIndex=stateStack.findIndex(function(a){return a===state.definition;});if(_currentIndex<stateStack.length-1){var _newDefinition=stateStack[_currentIndex+1];app.render(_newDefinition);state=_extends({},state,{definition:_newDefinition});render();}}if(e.which===13){setState(_extends({},state,{editingTitleNodeId:''}));}if(e.which===27){FULL_SCREEN_CLICKED(false);}});// Listen to app
app.addListener(function(eventId,data,e,previousState,currentState,mutations){setState(_extends({},state,{eventStack:state.eventStack.concat({eventId:eventId,data:data,e:e,previousState:previousState,currentState:currentState,mutations:mutations})}));});// Actions
var openBoxTimeout=null;function VIEW_DRAGGED(nodeRef,parentRef,initialDepth,e){e.preventDefault();var isArrow=e.target.dataset.closearrow;var initialX=e.touches?e.touches[0].pageX:e.pageX;var initialY=e.touches?e.touches[0].pageY:e.pageY;var position=this.elm.getBoundingClientRect();var offsetX=initialX-position.left;var offsetY=initialY-position.top;function drag(e){e.preventDefault();var x=e.touches?e.touches[0].pageX:e.pageX;var y=e.touches?e.touches[0].pageY:e.pageY;if(!state.draggedComponentView){if(Math.abs(initialY-y)>3){setState(_extends({},state,{draggedComponentView:_extends({},nodeRef,{depth:initialDepth}),mousePosition:{x:x-offsetX,y:y-offsetY}}));}}else{setState(_extends({},state,{mousePosition:{x:x-offsetX,y:y-offsetY}}));}return false;}window.addEventListener('mousemove',drag);window.addEventListener('touchmove',drag);function stopDragging(event){var _extends4,_extends8;event.preventDefault();window.removeEventListener('mousemove',drag);window.removeEventListener('touchmove',drag);window.removeEventListener('mouseup',stopDragging);window.removeEventListener('touchend',stopDragging);if(openBoxTimeout){clearTimeout(openBoxTimeout);openBoxTimeout=null;}if(!state.draggedComponentView){if(event.target===e.target&&isArrow){return VIEW_FOLDER_CLICKED(nodeRef.id);}return VIEW_NODE_SELECTED(nodeRef);}if(!state.hoveredViewNode){return setState(_extends({},state,{draggedComponentView:null}));}var newParentRef=state.hoveredViewNode.parent;setState(_extends({},state,{draggedComponentView:null,hoveredViewNode:null,definition:parentRef.id===newParentRef.id?_extends({},state.definition,_defineProperty({},parentRef.ref,_extends({},state.definition[parentRef.ref],_defineProperty({},parentRef.id,_extends({},state.definition[parentRef.ref][parentRef.id],{children:moveInArray(state.definition[parentRef.ref][parentRef.id].children,state.definition[parentRef.ref][parentRef.id].children.findIndex(function(ref){return ref.id===nodeRef.id;}),state.hoveredViewNode.position)}))))):parentRef.ref===newParentRef.ref?_extends({},state.definition,_defineProperty({},parentRef.ref,_extends({},state.definition[parentRef.ref],(_extends4={},_defineProperty(_extends4,parentRef.id,_extends({},state.definition[parentRef.ref][parentRef.id],{children:state.definition[parentRef.ref][parentRef.id].children.filter(function(ref){return ref.id!==nodeRef.id;})})),_defineProperty(_extends4,newParentRef.id,_extends({},state.definition[newParentRef.ref][newParentRef.id],{children:state.definition[newParentRef.ref][newParentRef.id].children.slice(0,state.hoveredViewNode.position).concat(nodeRef,state.definition[newParentRef.ref][newParentRef.id].children.slice(state.hoveredViewNode.position))})),_extends4)))):_extends({},state.definition,(_extends8={},_defineProperty(_extends8,parentRef.ref,_extends({},state.definition[parentRef.ref],_defineProperty({},parentRef.id,_extends({},state.definition[parentRef.ref][parentRef.id],{children:state.definition[parentRef.ref][parentRef.id].children.filter(function(ref){return ref.id!==nodeRef.id;})})))),_defineProperty(_extends8,newParentRef.ref,_extends({},state.definition[newParentRef.ref],_defineProperty({},newParentRef.id,_extends({},state.definition[newParentRef.ref][newParentRef.id],{children:state.definition[newParentRef.ref][newParentRef.id].children.slice(0,state.hoveredViewNode.position).concat(nodeRef,state.definition[newParentRef.ref][newParentRef.id].children.slice(state.hoveredViewNode.position))})))),_extends8))}));return false;}window.addEventListener('mouseup',stopDragging);window.addEventListener('touchend',stopDragging);return false;}function VIEW_HOVER_MOBILE(e){var elem=document.elementFromPoint(e.touches[0].clientX,e.touches[0].clientY);var moveEvent=new MouseEvent('mousemove',{bubbles:true,cancelable:true,view:window,clientX:e.touches[0].clientX,clientY:e.touches[0].clientY,screenX:e.touches[0].screenX,screenY:e.touches[0].screenY});elem.dispatchEvent(moveEvent);}function VIEW_HOVERED(nodeRef,parentRef,depth,e){if(!state.draggedComponentView){return;}if(nodeRef.id===state.draggedComponentView.id){return setState(_extends({},state,{hoveredViewNode:null}));}var hitPosition=(e.touches?28:e.layerY)/28;var insertBefore=function insertBefore(){return setState(_extends({},state,{hoveredViewNode:{parent:parentRef,depth:depth,position:state.definition[parentRef.ref][parentRef.id].children.filter(function(ref){return ref.id!==state.draggedComponentView.id;}).findIndex(function(ref){return ref.id===nodeRef.id;})}}));};var insertAfter=function insertAfter(){return setState(_extends({},state,{hoveredViewNode:{parent:parentRef,depth:depth,position:state.definition[parentRef.ref][parentRef.id].children.filter(function(ref){return ref.id!==state.draggedComponentView.id;}).findIndex(function(ref){return ref.id===nodeRef.id;})+1}}));};var insertAsFirst=function insertAsFirst(){return setState(_extends({},state,{hoveredViewNode:{parent:nodeRef,depth:depth+1,position:0}}));};if(nodeRef.id==='_rootNode'){return insertAsFirst();}// pray to god that you did not make a mistake here
if(state.definition[nodeRef.ref][nodeRef.id].children){// if box
if(state.viewFoldersClosed[nodeRef.id]||state.definition[nodeRef.ref][nodeRef.id].children.length===0){// if closed or empty box
if(hitPosition<0.3){insertBefore();}else{if(!openBoxTimeout){openBoxTimeout=setTimeout(function(){return VIEW_FOLDER_CLICKED(nodeRef.id,false);},500);}insertAsFirst();return;}}else{// open box
if(hitPosition<0.5){insertBefore();}else{insertAsFirst();}}}else{// simple node
if(hitPosition<0.5){insertBefore();}else{insertAfter();}}if(openBoxTimeout){clearTimeout(openBoxTimeout);openBoxTimeout=null;}}function WIDTH_DRAGGED(widthName,e){e.preventDefault();function resize(e){e.preventDefault();var newWidth=window.innerWidth-(e.touches?e.touches[0].pageX:e.pageX);if(widthName==='editorLeftWidth'){newWidth=e.touches?e.touches[0].pageX:e.pageX;}if(widthName==='subEditorWidth'){newWidth=newWidth-state.editorRightWidth-10;}// I probably was drunk
if(widthName!=='subEditorWidth'&&((widthName==='editorLeftWidth'?state.leftOpen:state.rightOpen)?newWidth<180:newWidth>180)){if(widthName==='editorLeftWidth'){return setState(_extends({},state,{leftOpen:!state.leftOpen}));}return setState(_extends({},state,{rightOpen:!state.rightOpen}));}if(newWidth<250){newWidth=250;}setState(_extends({},state,_defineProperty({},widthName,newWidth)));return false;}window.addEventListener('mousemove',resize);window.addEventListener('touchmove',resize);function stopDragging(e){e.preventDefault();window.removeEventListener('mousemove',resize);window.removeEventListener('touchmove',resize);window.removeEventListener('mouseup',stopDragging);window.removeEventListener('touchend',stopDragging);return false;}window.addEventListener('mouseup',stopDragging);window.addEventListener('touchend',stopDragging);return false;}function FREEZER_CLICKED(){setState(_extends({},state,{appIsFrozen:!state.appIsFrozen}));}function VIEW_FOLDER_CLICKED(nodeId,forcedValue){setState(_extends({},state,{viewFoldersClosed:_extends({},state.viewFoldersClosed,_defineProperty({},nodeId,forcedValue!==undefined?forcedValue:!state.viewFoldersClosed[nodeId]))}));}function VIEW_NODE_SELECTED(ref){setState(_extends({},state,{selectedViewNode:ref}));}function UNSELECT_VIEW_NODE(selfOnly,e){if(selfOnly&&e.target!==this.elm){return;}setState(_extends({},state,{selectedViewNode:{}}));}function STATE_NODE_SELECTED(nodeId){setState(_extends({},state,{selectedStateNodeId:nodeId}));}function UNSELECT_STATE_NODE(e){if(e.target===this.elm){setState(_extends({},state,{selectedStateNodeId:''}));}}function ADD_NODE(nodeRef,type){// TODO remove when dragging works
if(!nodeRef.ref||!state.definition[nodeRef.ref][nodeRef.id]||!state.definition[nodeRef.ref][nodeRef.id].children){nodeRef={ref:'vNodeBox',id:'_rootNode'};}var nodeId=nodeRef.id;var newNodeId=uuid();var newStyleId=uuid();var newStyle={};if(type==='box'){var _extends11,_extends16;var newNode={title:'box',style:{ref:'style',id:newStyleId},children:[]};return setState(_extends({},state,{selectedViewNode:{ref:'vNodeBox',id:newNodeId},definition:nodeRef.ref==='vNodeBox'?_extends({},state.definition,{vNodeBox:_extends({},state.definition.vNodeBox,(_extends11={},_defineProperty(_extends11,nodeId,_extends({},state.definition.vNodeBox[nodeId],{children:state.definition.vNodeBox[nodeId].children.concat({ref:'vNodeBox',id:newNodeId})})),_defineProperty(_extends11,newNodeId,newNode),_extends11)),style:_extends({},state.definition.style,_defineProperty({},newStyleId,newStyle))}):_extends({},state.definition,(_extends16={},_defineProperty(_extends16,nodeRef.ref,_extends({},state.definition[nodeRef.ref],_defineProperty({},nodeId,_extends({},state.definition[nodeRef.ref][nodeId],{children:state.definition[nodeRef.ref][nodeId].children.concat({ref:'vNodeBox',id:newNodeId})})))),_defineProperty(_extends16,"vNodeBox",_extends({},state.definition.vNodeBox,_defineProperty({},newNodeId,newNode))),_defineProperty(_extends16,"style",_extends({},state.definition.style,_defineProperty({},newStyleId,newStyle))),_extends16))}));}if(type==='text'){var _extends21;var pipeId=uuid();var _newNode={title:'text',style:{ref:'style',id:newStyleId},value:{ref:'pipe',id:pipeId}};var newPipe={type:'text',value:'Default Text',transformations:[]};return setState(_extends({},state,{selectedViewNode:{ref:'vNodeText',id:newNodeId},definition:_extends({},state.definition,(_extends21={pipe:_extends({},state.definition.pipe,_defineProperty({},pipeId,newPipe))},_defineProperty(_extends21,nodeRef.ref,_extends({},state.definition[nodeRef.ref],_defineProperty({},nodeId,_extends({},state.definition[nodeRef.ref][nodeId],{children:state.definition[nodeRef.ref][nodeId].children.concat({ref:'vNodeText',id:newNodeId})})))),_defineProperty(_extends21,"vNodeText",_extends({},state.definition.vNodeText,_defineProperty({},newNodeId,_newNode))),_defineProperty(_extends21,"style",_extends({},state.definition.style,_defineProperty({},newStyleId,newStyle))),_extends21))}));}if(type==='if'){var _extends23,_extends27;var _pipeId=uuid();var _newNode2={title:'conditional',value:{ref:'pipe',id:_pipeId},children:[]};var _newPipe={type:'boolean',value:true,transformations:[]};return setState(_extends({},state,{selectedViewNode:{ref:'vNodeIf',id:newNodeId},definition:nodeRef.ref==='vNodeIf'?_extends({},state.definition,{pipe:_extends({},state.definition.pipe,_defineProperty({},_pipeId,_newPipe)),vNodeIf:_extends({},state.definition.vNodeIf,(_extends23={},_defineProperty(_extends23,nodeId,_extends({},state.definition.vNodeIf[nodeId],{children:state.definition.vNodeIf[nodeId].children.concat({ref:'vNodeIf',id:newNodeId})})),_defineProperty(_extends23,newNodeId,_newNode2),_extends23))}):_extends({},state.definition,(_extends27={pipe:_extends({},state.definition.pipe,_defineProperty({},_pipeId,_newPipe))},_defineProperty(_extends27,nodeRef.ref,_extends({},state.definition[nodeRef.ref],_defineProperty({},nodeId,_extends({},state.definition[nodeRef.ref][nodeId],{children:state.definition[nodeRef.ref][nodeId].children.concat({ref:'vNodeIf',id:newNodeId})})))),_defineProperty(_extends27,"vNodeIf",_extends({},state.definition.vNodeIf,_defineProperty({},newNodeId,_newNode2))),_extends27))}));}if(type==='input'){var _extends28,_extends36;var stateId=uuid();var eventId=uuid();var mutatorId=uuid();var pipeInputId=uuid();var pipeMutatorId=uuid();var _newNode3={title:'input',style:{ref:'style',id:newStyleId},value:{ref:'pipe',id:pipeInputId},input:{ref:'event',id:eventId}};var newPipeInput={type:'text',value:{ref:'state',id:stateId},transformations:[]};var newPipeMutator={type:'text',value:{ref:'eventData',id:'_input'},transformations:[]};var newState={title:'input value',type:'text',ref:stateId,defaultValue:'Default text',mutators:[{ref:'mutator',id:mutatorId}]};var newMutator={event:{ref:'event',id:eventId},state:{ref:'state',id:stateId},mutation:{ref:'pipe',id:pipeMutatorId}};var newEvent={type:'input',title:'update input',mutators:[{ref:'mutator',id:mutatorId}],emitter:{ref:'vNodeInput',id:newNodeId},data:[{ref:'eventData',id:'_input'}]};return setState(_extends({},state,{selectedViewNode:{ref:'vNodeInput',id:newNodeId},definition:_extends({},state.definition,(_extends36={pipe:_extends({},state.definition.pipe,(_extends28={},_defineProperty(_extends28,pipeInputId,newPipeInput),_defineProperty(_extends28,pipeMutatorId,newPipeMutator),_extends28))},_defineProperty(_extends36,nodeRef.ref,_extends({},state.definition[nodeRef.ref],_defineProperty({},nodeId,_extends({},state.definition[nodeRef.ref][nodeId],{children:state.definition[nodeRef.ref][nodeId].children.concat({ref:'vNodeInput',id:newNodeId})})))),_defineProperty(_extends36,"vNodeInput",_extends({},state.definition.vNodeInput,_defineProperty({},newNodeId,_newNode3))),_defineProperty(_extends36,"style",_extends({},state.definition.style,_defineProperty({},newStyleId,newStyle))),_defineProperty(_extends36,"nameSpace",_extends({},state.definition.nameSpace,_defineProperty({},'_rootNameSpace',_extends({},state.definition.nameSpace['_rootNameSpace'],{children:state.definition.nameSpace['_rootNameSpace'].children.concat({ref:'state',id:stateId})})))),_defineProperty(_extends36,"state",_extends({},state.definition.state,_defineProperty({},stateId,newState))),_defineProperty(_extends36,"mutator",_extends({},state.definition.mutator,_defineProperty({},mutatorId,newMutator))),_defineProperty(_extends36,"event",_extends({},state.definition.event,_defineProperty({},eventId,newEvent))),_extends36))}));}}function ADD_STATE(namespaceId,type){var newStateId=uuid();var newState=void 0;if(type==='text'){newState={title:'new text',ref:newStateId,type:'text',defaultValue:'Default text',mutators:[]};}if(type==='number'){newState={title:'new number',ref:newStateId,type:'number',defaultValue:0,mutators:[]};}if(type==='boolean'){newState={title:'new boolean',type:'boolean',ref:newStateId,defaultValue:true,mutators:[]};}if(type==='table'){newState={title:'new table',type:'table',ref:newStateId,defaultValue:{},mutators:[]};}if(type==='folder'){var _extends37;newState={title:'new folder',children:[]};return setState(_extends({},state,{definition:_extends({},state.definition,{nameSpace:_extends({},state.definition.nameSpace,(_extends37={},_defineProperty(_extends37,namespaceId,_extends({},state.definition.nameSpace[namespaceId],{children:state.definition.nameSpace[namespaceId].children.concat({ref:'nameSpace',id:newStateId})})),_defineProperty(_extends37,newStateId,newState),_extends37))})}));}setState(_extends({},state,{definition:_extends({},state.definition,{nameSpace:_extends({},state.definition.nameSpace,_defineProperty({},namespaceId,_extends({},state.definition.nameSpace[namespaceId],{children:state.definition.nameSpace[namespaceId].children.concat({ref:'state',id:newStateId})}))),state:_extends({},state.definition.state,_defineProperty({},newStateId,newState))})}));}function ADD_DEFAULT_STYLE(styleId,key){var pipeId=uuid();var defaults={'background':'white','border':'1px solid black','outline':'1px solid black','cursor':'pointer','color':'black','display':'block','top':'0px','bottom':'0px','left':'0px','right':'0px','maxWidth':'100%','maxHeight':'100%','minWidth':'100%','minHeight':'100%','position':'absolute','overflow':'auto','height':'500px','width':'500px','font':'italic 2em "Comic Sans MS", cursive, sans-serif','margin':'10px','padding':'10px'};setState(_extends({},state,{definition:_extends({},state.definition,{pipe:_extends({},state.definition.pipe,_defineProperty({},pipeId,{type:'text',value:defaults[key],transformations:[]})),style:_extends({},state.definition.style,_defineProperty({},styleId,_extends({},state.definition.style[styleId],_defineProperty({},key,{ref:'pipe',id:pipeId}))))})}));}function SELECT_VIEW_SUBMENU(newId){setState(_extends({},state,{selectedViewSubMenu:newId}));}function EDIT_VIEW_NODE_TITLE(nodeId){setState(_extends({},state,{editingTitleNodeId:nodeId}));}function DELETE_SELECTED_VIEW(nodeRef,parentRef,e){e.stopPropagation();if(nodeRef.id==='_rootNode'){if(state.definition.vNodeBox['_rootNode'].children.length===0){return;}// immutably remove all nodes except rootNode
return setState(_extends({},state,{definition:_extends({},state.definition,{vNodeBox:{'_rootNode':_extends({},state.definition.vNodeBox['_rootNode'],{children:[]})}}),selectedViewNode:{}}),true);}setState(_extends({},state,{definition:_extends({},state.definition,_defineProperty({},parentRef.ref,_extends({},state.definition[parentRef.ref],_defineProperty({},parentRef.id,_extends({},state.definition[parentRef.ref][parentRef.id],{children:state.definition[parentRef.ref][parentRef.id].children.filter(function(ref){return ref.id!==nodeRef.id;})}))))),selectedViewNode:{}}),true);}function CHANGE_VIEW_NODE_TITLE(nodeRef,e){e.preventDefault();var nodeId=nodeRef.id;var nodeType=nodeRef.ref;setState(_extends({},state,{definition:_extends({},state.definition,_defineProperty({},nodeType,_extends({},state.definition[nodeType],_defineProperty({},nodeId,_extends({},state.definition[nodeType][nodeId],{title:e.target.value})))))}));}function CHANGE_STATE_NODE_TITLE(nodeId,e){e.preventDefault();setState(_extends({},state,{definition:_extends({},state.definition,{state:_extends({},state.definition.state,_defineProperty({},nodeId,_extends({},state.definition.state[nodeId],{title:e.target.value})))})}));}function CHANGE_NAMESPACE_TITLE(nodeId,e){e.preventDefault();setState(_extends({},state,{definition:_extends({},state.definition,{nameSpace:_extends({},state.definition.nameSpace,_defineProperty({},nodeId,_extends({},state.definition.nameSpace[nodeId],{title:e.target.value})))})}));}function CHANGE_CURRENT_STATE_TEXT_VALUE(stateId,e){app.setCurrentState(_extends({},app.getCurrentState(),_defineProperty({},stateId,e.target.value)));render();}function CHANGE_CURRENT_STATE_NUMBER_VALUE(stateId,e){// todo big throws error instead of returning NaN... fix, rewrite or hack
try{if((0,_big2.default)(e.target.value).toString()!==app.getCurrentState()[stateId].toString()){app.setCurrentState(_extends({},app.getCurrentState(),_defineProperty({},stateId,(0,_big2.default)(e.target.value))));render();}}catch(err){}}function CHANGE_STATIC_VALUE(ref,propertyName,type,e){var value=e.target.value;if(type==='number'){try{value=(0,_big2.default)(e.target.value);}catch(err){return;}}if(type==='boolean'){value=value===true||value==='true'?true:false;}setState(_extends({},state,{definition:_extends({},state.definition,_defineProperty({},ref.ref,_extends({},state.definition[ref.ref],_defineProperty({},ref.id,_extends({},state.definition[ref.ref][ref.id],_defineProperty({},propertyName,value))))))}));}function ADD_EVENT(propertyName,node){var _extends57;var ref=state.selectedViewNode;var eventId=uuid();setState(_extends({},state,{definition:_extends({},state.definition,(_extends57={},_defineProperty(_extends57,ref.ref,_extends({},state.definition[ref.ref],_defineProperty({},ref.id,_extends({},state.definition[ref.ref][ref.id],_defineProperty({},propertyName,{ref:'event',id:eventId}))))),_defineProperty(_extends57,"event",_extends({},state.definition.event,_defineProperty({},eventId,{type:propertyName,emitter:node,mutators:[],data:[]}))),_extends57))}));}function SELECT_PIPE(pipeId){setState(_extends({},state,{selectedPipeId:pipeId}));}function CHANGE_PIPE_VALUE_TO_STATE(pipeId){if(!state.selectedStateNodeId||state.selectedStateNodeId===state.definition.pipe[pipeId].value.id){return;}setState(_extends({},state,{definition:_extends({},state.definition,{pipe:_extends({},state.definition.pipe,_defineProperty({},pipeId,_extends({},state.definition.pipe[pipeId],{value:{ref:'state',id:state.selectedStateNodeId},transformations:[]})))})}));}function ADD_TRANSFORMATION(pipeId,transformation){if(transformation==='join'){var _extends60;var newPipeId=uuid();var joinId=uuid();setState(_extends({},state,{definition:_extends({},state.definition,{join:_extends({},state.definition.join,_defineProperty({},joinId,{value:{ref:'pipe',id:newPipeId}})),pipe:_extends({},state.definition.pipe,(_extends60={},_defineProperty(_extends60,newPipeId,{type:'text',value:'Default text',transformations:[]}),_defineProperty(_extends60,pipeId,_extends({},state.definition.pipe[pipeId],{transformations:state.definition.pipe[pipeId].transformations.concat({ref:'join',id:joinId})})),_extends60))})}));}if(transformation==='toUpperCase'){var newId=uuid();setState(_extends({},state,{definition:_extends({},state.definition,{toUpperCase:_extends({},state.definition.toUpperCase,_defineProperty({},newId,{})),pipe:_extends({},state.definition.pipe,_defineProperty({},pipeId,_extends({},state.definition.pipe[pipeId],{transformations:state.definition.pipe[pipeId].transformations.concat({ref:'toUpperCase',id:newId})})))})}));}if(transformation==='toLowerCase'){var _newId=uuid();setState(_extends({},state,{definition:_extends({},state.definition,{toLowerCase:_extends({},state.definition.toLowerCase,_defineProperty({},_newId,{})),pipe:_extends({},state.definition.pipe,_defineProperty({},pipeId,_extends({},state.definition.pipe[pipeId],{transformations:state.definition.pipe[pipeId].transformations.concat({ref:'toLowerCase',id:_newId})})))})}));}if(transformation==='toText'){var _newId2=uuid();setState(_extends({},state,{definition:_extends({},state.definition,{toText:_extends({},state.definition.toText,_defineProperty({},_newId2,{})),pipe:_extends({},state.definition.pipe,_defineProperty({},pipeId,_extends({},state.definition.pipe[pipeId],{transformations:state.definition.pipe[pipeId].transformations.concat({ref:'toText',id:_newId2})})))})}));}if(transformation==='add'){var _extends68;var _newPipeId=uuid();var addId=uuid();setState(_extends({},state,{definition:_extends({},state.definition,{add:_extends({},state.definition.add,_defineProperty({},addId,{value:{ref:'pipe',id:_newPipeId}})),pipe:_extends({},state.definition.pipe,(_extends68={},_defineProperty(_extends68,_newPipeId,{type:'number',value:0,transformations:[]}),_defineProperty(_extends68,pipeId,_extends({},state.definition.pipe[pipeId],{transformations:state.definition.pipe[pipeId].transformations.concat({ref:'add',id:addId})})),_extends68))})}));}if(transformation==='subtract'){var _extends70;var _newPipeId2=uuid();var subtractId=uuid();setState(_extends({},state,{definition:_extends({},state.definition,{subtract:_extends({},state.definition.subtract,_defineProperty({},subtractId,{value:{ref:'pipe',id:_newPipeId2}})),pipe:_extends({},state.definition.pipe,(_extends70={},_defineProperty(_extends70,_newPipeId2,{type:'number',value:0,transformations:[]}),_defineProperty(_extends70,pipeId,_extends({},state.definition.pipe[pipeId],{transformations:state.definition.pipe[pipeId].transformations.concat({ref:'subtract',id:subtractId})})),_extends70))})}));}}function RESET_APP_STATE(){app.setCurrentState(app.createDefaultState());setState(_extends({},state,{eventStack:[]}));}function RESET_APP_DEFINITION(){if(state.definition!==appDefinition){setState(_extends({},state,{definition:_extends({},appDefinition)}));}}function FULL_SCREEN_CLICKED(value){if(value!==state.fullScreen){setState(_extends({},state,{fullScreen:value}));}}var boxIcon=function boxIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'crop_square');};// dashboard ?
var ifIcon=function ifIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'done');};var numberIcon=function numberIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'looks_one');};var listIcon=function listIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'view_list');};var inputIcon=function inputIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'input');};var textIcon=function textIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'text_fields');};var deleteIcon=function deleteIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'delete_forever');};var clearIcon=function clearIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'clear');};var folderIcon=function folderIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'folder');};var appIcon=function appIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'},style:{fontSize:'18px'}},'description');};var arrowIcon=function arrowIcon(rotate){return(0,_h2.default)('i',{attrs:{class:'material-icons','data-closearrow':true},style:{transition:'all 0.2s',transform:rotate?'rotate(-90deg)':'rotate(0deg)',cursor:'pointer'}},'expand_more');};function render(){var currentRunningState=app.getCurrentState();var dragComponentLeft=(0,_h2.default)('div',{on:{mousedown:[WIDTH_DRAGGED,'editorLeftWidth'],touchstart:[WIDTH_DRAGGED,'editorLeftWidth']},style:{position:'absolute',right:'0',transform:'translateX(100%)',top:'0',width:'10px',height:'100%',textAlign:'center',fontSize:'1em',opacity:'0',cursor:'col-resize'}});var dragComponentRight=(0,_h2.default)('div',{on:{mousedown:[WIDTH_DRAGGED,'editorRightWidth'],touchstart:[WIDTH_DRAGGED,'editorRightWidth']},style:{position:'absolute',left:'0',transform:'translateX(-100%)',top:'0',width:'10px',height:'100%',textAlign:'center',fontSize:'1em',opacity:'0',cursor:'col-resize'}});var dragSubComponent=(0,_h2.default)('div',{on:{mousedown:[WIDTH_DRAGGED,'subEditorWidth'],touchstart:[WIDTH_DRAGGED,'subEditorWidth']},style:{position:'absolute',left:'2px',transform:'translateX(-100%)',top:'0',width:'10px',height:'100%',textAlign:'center',fontSize:'1em',opacity:0,cursor:'col-resize'}});function emberEditor(ref,type){var pipe=state.definition[ref.ref][ref.id];function listTransformations(transformations,transType){return transformations.map(function(transRef,index){var transformer=state.definition[transRef.ref][transRef.id];if(transRef.ref==='equal'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{key:index,style:{color:'#bdbdbd',cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1'}},transRef.ref),(0,_h2.default)('span',{style:{flex:'0',color:transformations.length-1!==index?'#bdbdbd':transType===type?'green':'red'}},'true/false')]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},[emberEditor(transformer.value,type)])]);}if(transRef.ref==='add'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{key:index,style:{color:'#bdbdbd',cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1'}},transRef.ref),(0,_h2.default)('span',{style:{flex:'0',color:transformations.length-1!==index?'#bdbdbd':transType===type?'green':'red'}},'number')]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},[emberEditor(transformer.value,'number')])]);}if(transRef.ref==='subtract'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{key:index,style:{color:'#bdbdbd',cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1'}},transRef.ref),(0,_h2.default)('span',{style:{flex:'0',color:transformations.length-1!==index?'#bdbdbd':transType===type?'green':'red'}},'number')]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},[emberEditor(transformer.value,'number')])]);}if(transRef.ref==='multiply'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{key:index,style:{color:'#bdbdbd',cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1'}},transRef.ref),(0,_h2.default)('span',{style:{flex:'0',color:transformations.length-1!==index?'#bdbdbd':transType===type?'green':'red'}},'number')]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},[emberEditor(transformer.value,'number')])]);}if(transRef.ref==='divide'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{key:index,style:{color:'#bdbdbd',cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1'}},transRef.ref),(0,_h2.default)('span',{style:{flex:'0',color:transformations.length-1!==index?'#bdbdbd':transType===type?'green':'red'}},'number')]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},[emberEditor(transformer.value,'number')])]);}if(transRef.ref==='remainder'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{key:index,style:{color:'#bdbdbd',cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1'}},transRef.ref),(0,_h2.default)('span',{style:{flex:'0',color:transformations.length-1!==index?'#bdbdbd':transType===type?'green':'red'}},'number')]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},[emberEditor(transformer.value,'number')])]);}// if (transRef.ref === 'branch') {
//     if(resolve(transformer.predicate)){
//         value = transformValue(value, transformer.then)
//     } else {
//         value = transformValue(value, transformer.else)
//     }
// }
if(transRef.ref==='join'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{style:{color:'#bdbdbd',cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1'}},transRef.ref),(0,_h2.default)('span',{style:{flex:'0',color:transformations.length-1!==index?'#bdbdbd':transType===type?'green':'red'}},'text')]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},[emberEditor(transformer.value,transType)])]);}if(transRef.ref==='toUpperCase'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{style:{cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1',color:'#bdbdbd'}},transRef.ref),(0,_h2.default)('span',{style:{flex:'0',color:transformations.length-1!==index?'#bdbdbd':transType===type?'green':'red'}},'text')])]);}if(transRef.ref==='toLowerCase'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{style:{cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1',color:'#bdbdbd'}},transRef.ref),(0,_h2.default)('span',{style:{flex:'0',color:transformations.length-1!==index?'#bdbdbd':transType===type?'green':'red'}},'text')])]);}if(transRef.ref==='toText'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{style:{cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1',color:'#bdbdbd'}},transRef.ref),(0,_h2.default)('span',{style:{flex:'0',color:transformations.length-1!==index?'#bdbdbd':transType===type?'green':'red'}},'text')])]);}});}function genTransformators(){var selectedPipe=state.definition.pipe[state.selectedPipeId];return[(0,_h2.default)('div',{style:{position:'fixed',top:'0px',left:'-307px',height:'100%',width:'300px',display:'flex'}},[(0,_h2.default)('div',{style:{border:'3px solid #222',flex:'1 1 0%',background:'#4d4d4d',marginBottom:'10px'}},[selectedPipe.type])])];}if(typeof pipe.value==='string'){return(0,_h2.default)('div',{style:{position:'relative'}},[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center'},on:{click:[SELECT_PIPE,ref.id]}},[(0,_h2.default)('input',{style:{background:'none',outline:'none',padding:'0',margin:'0',border:'none',borderRadius:'0',display:'inline-block',width:'100%',color:'white',textDecoration:'underline'},on:{input:[CHANGE_STATIC_VALUE,ref,'value','text']},liveProps:{value:pipe.value}}),(0,_h2.default)('div',{style:{flex:'0',cursor:'default',color:pipe.transformations.length>0?'#bdbdbd':type==='text'?'green':'red'}},'text')]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},listTransformations(pipe.transformations,pipe.type)),(0,_h2.default)('div',state.selectedPipeId===ref.id?genTransformators():[])]);}if(pipe.value===true||pipe.value===false){return(0,_h2.default)('select',{liveProps:{value:pipe.value.toString()},style:{},on:{input:[CHANGE_STATIC_VALUE,ref,'value','boolean']}},[(0,_h2.default)('option',{attrs:{value:'true'},style:{color:'black'}},['true']),(0,_h2.default)('option',{attrs:{value:'false'},style:{color:'black'}},['false'])]);}if(!isNaN(parseFloat(Number(pipe.value)))&&isFinite(Number(pipe.value))){return(0,_h2.default)('div',{style:{position:'relative'}},[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center'},on:{click:[SELECT_PIPE,ref.id]}},[(0,_h2.default)('input',{attrs:{type:'number'},style:{background:'none',outline:'none',padding:'0',margin:'0',border:'none',borderRadius:'0',display:'inline-block',width:'100%',color:'white',textDecoration:'underline'},on:{input:[CHANGE_STATIC_VALUE,ref,'value','number']},liveProps:{value:Number(pipe.value)}}),(0,_h2.default)('div',{style:{flex:'0',cursor:'default',color:pipe.transformations.length>0?'#bdbdbd':type==='number'?'green':'red'}},'number')]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},listTransformations(pipe.transformations,pipe.type)),(0,_h2.default)('div',state.selectedPipeId===ref.id?genTransformators():[])]);}if(pipe.value.ref==='state'){var displState=state.definition[pipe.value.ref][pipe.value.id];return(0,_h2.default)('div',{style:{position:'relative'}},[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center'},on:{click:[SELECT_PIPE,ref.id]}},[(0,_h2.default)('div',{style:{flex:'1'}},[(0,_h2.default)('span',{style:{flex:'0 0 auto',display:'inline-block',position:'relative',transform:'translateZ(0)',boxShadow:'inset 0 0 0 2px '+(state.selectedStateNodeId===pipe.value.id?'#eab65c':'#828282'),background:'#444',padding:'4px 7px'}},[(0,_h2.default)('span',{style:{color:'white',display:'inline-block'},on:{click:[STATE_NODE_SELECTED,pipe.value.id]}},displState.title)])]),(0,_h2.default)('div',{style:{flex:'0',cursor:'default',color:pipe.transformations.length>0?'#bdbdbd':displState.type===type?'green':'red'}},displState.type)]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},listTransformations(pipe.transformations,pipe.type)),(0,_h2.default)('div',state.selectedPipeId===ref.id?genTransformators():[])]);}if(pipe.value.ref==='listValue'){return(0,_h2.default)('div','TODO');}if(pipe.value.ref==='eventData'){var eventData=state.definition[pipe.value.ref][pipe.value.id];return(0,_h2.default)('div',[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center'},on:{click:[SELECT_PIPE,ref.id]}},[(0,_h2.default)('div',{style:{flex:'1'}},[(0,_h2.default)('div',{style:{cursor:'pointer',color:state.selectedStateNodeId===pipe.value.id?'#eab65c':'white',padding:'2px 5px',margin:'3px 3px 0 0',border:'2px solid '+(state.selectedStateNodeId===pipe.value.id?'#eab65c':'white'),display:'inline-block'},on:{click:[STATE_NODE_SELECTED,pipe.value.id]}},[eventData.title])]),(0,_h2.default)('div',{style:{flex:'0',cursor:'default',color:pipe.transformations.length>0?'#bdbdbd':eventData.type===type?'green':'red'}},eventData.type)]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},listTransformations(pipe.transformations,pipe.type))]);}}function listState(stateId){var currentState=state.definition.state[stateId];function editingNode(){return(0,_h2.default)('input',{style:{color:'white',outline:'none',padding:'4px 7px',boxShadow:'none',display:'inline',border:'none',background:'none',font:'inherit',position:'absolute',top:'0',left:'0',width:'100%',flex:'0 0 auto'},on:{input:[CHANGE_STATE_NODE_TITLE,stateId]},liveProps:{value:currentState.title},attrs:{'data-istitleeditor':true}});}return(0,_h2.default)('div',{style:{cursor:'pointer',position:'relative',fontSize:'14px'}},[(0,_h2.default)('span',{style:{display:'flex',flexWrap:'wrap'}},[(0,_h2.default)('span',{style:{flex:'0 0 auto',position:'relative',transform:'translateZ(0)',margin:'7px 7px 0 0',boxShadow:'inset 0 0 0 2px '+(state.selectedStateNodeId===stateId?'#eab65c':'#828282'),background:'#444',padding:'4px 7px'}},[(0,_h2.default)('span',{style:{opacity:state.editingTitleNodeId===stateId?'0':'1',color:'white',display:'inline-block'},on:{click:[STATE_NODE_SELECTED,stateId],dblclick:[EDIT_VIEW_NODE_TITLE,stateId]}},currentState.title),state.editingTitleNodeId===stateId?editingNode():(0,_h2.default)('span')]),function(){var noStyleInput={color:currentRunningState[stateId]!==state.definition.state[stateId].defaultValue?'rgb(91, 204, 91)':'white',background:'none',outline:'none',display:'inline',flex:'1',minWidth:'50px',border:'none',marginTop:'6px',boxShadow:'inset 0 -2px 0 0 '+(state.selectedStateNodeId===stateId?'#eab65c':'#828282')};if(currentState.type==='text')return(0,_h2.default)('input',{attrs:{type:'text'},liveProps:{value:currentRunningState[stateId]},style:noStyleInput,on:{input:[CHANGE_CURRENT_STATE_TEXT_VALUE,stateId]}});if(currentState.type==='number')return(0,_h2.default)('input',{attrs:{type:'number'},liveProps:{value:currentRunningState[stateId]},style:noStyleInput,on:{input:[CHANGE_CURRENT_STATE_NUMBER_VALUE,stateId]}});if(currentState.type==='boolean')return(0,_h2.default)('select',{liveProps:{value:currentRunningState[stateId].toString()},style:noStyleInput,on:{input:[CHANGE_CURRENT_STATE_NUMBER_VALUE,stateId]}},[(0,_h2.default)('option',{attrs:{value:'true'},style:{color:'black'}},['true']),(0,_h2.default)('option',{attrs:{value:'false'},style:{color:'black'}},['false'])]);if(currentState.type==='table'){var _ret=function(){if(state.selectedStateNodeId!==stateId){return{v:(0,_h2.default)('div',{key:'icon',on:{click:[STATE_NODE_SELECTED,stateId]},style:{display:'flex',alignItems:'center',marginTop:'7px'}},[listIcon()])};}var table=currentRunningState[stateId];return{v:(0,_h2.default)('div',{key:'table',style:{background:'#828183',width:'100%',flex:'0 0 100%'}},[(0,_h2.default)('div',{style:{display:'flex'}},Object.keys(currentState.definition).map(function(key){return(0,_h2.default)('div',{style:{flex:'1',padding:'2px 5px',borderBottom:'2px solid white'}},key);}))].concat(_toConsumableArray(Object.keys(table).map(function(id){return(0,_h2.default)('div',{style:{display:'flex'}},Object.keys(table[id]).map(function(key){return(0,_h2.default)('div',{style:{flex:'1',padding:'2px 5px'}},table[id][key]);}));}))))};}();if((typeof _ret==="undefined"?"undefined":_typeof(_ret))==="object")return _ret.v;}}()]),state.selectedStateNodeId===stateId?(0,_h2.default)('span',currentState.mutators.map(function(mutatorRef){var mutator=state.definition[mutatorRef.ref][mutatorRef.id];var event=state.definition[mutator.event.ref][mutator.event.id];var emitter=state.definition[event.emitter.ref][event.emitter.id];return(0,_h2.default)('div',{style:{display:'flex',cursor:'pointer',alignItems:'center',background:'#444',paddingTop:'3px',paddingBottom:'3px',color:state.selectedViewNode.id===event.emitter.id?'#53B2ED':'white',transition:'0.2s all',minWidth:'100%'},on:{click:[VIEW_NODE_SELECTED,event.emitter]}},[(0,_h2.default)('span',{style:{flex:'0 0 auto',margin:'0 0 0 5px'}},[event.emitter.ref==='vNodeBox'?boxIcon():event.emitter.ref==='vNodeList'?listIcon():event.emitter.ref==='vNodeList'?ifIcon():event.emitter.ref==='vNodeInput'?inputIcon():textIcon()]),(0,_h2.default)('span',{style:{flex:'5 5 auto',margin:'0 5px 0 0',minWidth:'0',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}},emitter.title),(0,_h2.default)('span',{style:{flex:'0 0 auto',marginLeft:'auto',marginRight:'5px',color:'#5bcc5b'}},event.type)]);})):(0,_h2.default)('span')]);}var stateComponent=(0,_h2.default)('div',{attrs:{class:'better-scrollbar'},style:{overflow:'auto',flex:'1',padding:'0 10px'},on:{click:[UNSELECT_STATE_NODE]}},state.definition.nameSpace['_rootNameSpace'].children.map(function(ref){return listState(ref.id);}));function listNode(nodeRef,parentRef,depth){if(nodeRef.id==='_rootNode')return listRootNode(nodeRef);if(nodeRef.ref==='vNodeText')return simpleNode(nodeRef,parentRef,depth);if(nodeRef.ref==='vNodeBox'||nodeRef.ref==='vNodeList'||nodeRef.ref==='vNodeIf')return listBoxNode(nodeRef,parentRef,depth);if(nodeRef.ref==='vNodeInput')return simpleNode(nodeRef,parentRef,depth);}function prevent_bubbling(e){e.stopPropagation();}function editingNode(nodeRef){return(0,_h2.default)('input',{style:{border:'none',height:'26px',background:'none',color:'#53B2ED',outline:'none',flex:'1',padding:'0',boxShadow:'inset 0 -1px 0 0 #53B2ED',font:'inherit',paddingLeft:'2px'},on:{mousedown:prevent_bubbling,input:[CHANGE_VIEW_NODE_TITLE,nodeRef]},liveProps:{value:state.definition[nodeRef.ref][nodeRef.id].title},attrs:{autofocus:true,'data-istitleeditor':true}});}function listRootNode(nodeRef){var nodeId=nodeRef.id;var node=state.definition[nodeRef.ref][nodeId];return(0,_h2.default)('div',{style:{position:'relative'}},[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center',paddingLeft:'8px',paddingRight:'8px',background:'#444',borderTop:'2px solid #4d4d4d',borderBottom:'2px solid #333',height:'26px',whiteSpace:'nowrap'},on:{mousemove:[VIEW_HOVERED,nodeRef,{},1],touchmove:[VIEW_HOVER_MOBILE]}},[(0,_h2.default)('span',{key:nodeId,style:{color:state.selectedViewNode.id===nodeId?'#53B2ED':'#bdbdbd',display:'inline-flex'},on:{click:[VIEW_NODE_SELECTED,nodeRef]}},[appIcon()]),state.editingTitleNodeId===nodeId?editingNode(nodeRef):(0,_h2.default)('span',{style:{flex:'1',cursor:'pointer',color:state.selectedViewNode.id===nodeId?'#53B2ED':'white',transition:'color 0.2s',paddingLeft:'2px'},on:{click:[VIEW_NODE_SELECTED,nodeRef],dblclick:[EDIT_VIEW_NODE_TITLE,nodeId]}},node.title)]),(0,_h2.default)('div',state.hoveredViewNode&&state.hoveredViewNode.parent.id===nodeId&&!(node.children.findIndex(function(ref){return ref.id===state.draggedComponentView.id;})===state.hoveredViewNode.position)?function(){// copy pasted from listBoxNode
var oldPosition=node.children.findIndex(function(ref){return ref.id===state.draggedComponentView.id;});var newPosition=oldPosition===-1||state.hoveredViewNode.position<oldPosition?state.hoveredViewNode.position:state.hoveredViewNode.position+1;var children=node.children.map(function(ref){return listNode(ref,nodeRef,1);});return children.slice(0,newPosition).concat(spacerComponent(),children.slice(newPosition));}():node.children.map(function(ref){return listNode(ref,nodeRef,1);}))]);}function listBoxNode(nodeRef,parentRef,depth){var nodeId=nodeRef.id;var node=state.definition[nodeRef.ref][nodeId];return(0,_h2.default)('div',{style:{opacity:state.draggedComponentView&&state.draggedComponentView.id===nodeId?'0.5':'1.0'}},[(0,_h2.default)('div',{key:nodeId,style:{display:'flex',height:'26px',position:'relative',alignItems:'center',paddingLeft:(depth-(node.children.length>0||state.hoveredViewNode&&state.hoveredViewNode.parent.id===nodeId?1:0))*20+8+'px',paddingRight:'8px',background:'#444',borderTop:'2px solid #4d4d4d',borderBottom:'2px solid #333',whiteSpace:'nowrap',color:state.selectedViewNode.id===nodeId?'#53B2ED':'white'},on:{mousedown:[VIEW_DRAGGED,nodeRef,parentRef,depth],touchstart:[VIEW_DRAGGED,nodeRef,parentRef,depth],mousemove:[VIEW_HOVERED,nodeRef,parentRef,depth],touchmove:[VIEW_HOVER_MOBILE]}},[node.children.length>0||state.hoveredViewNode&&state.hoveredViewNode.parent.id===nodeId?(0,_h2.default)('span',{style:{display:'inline-flex'}},[arrowIcon(state.viewFoldersClosed[nodeId]||state.draggedComponentView&&nodeId===state.draggedComponentView.id)]):(0,_h2.default)('span'),(0,_h2.default)('span',{key:nodeId,style:{display:'inline-flex',color:state.selectedViewNode.id===nodeId?'#53B2ED':'#bdbdbd',transition:'color 0.2s'}},[nodeRef.ref==='vNodeBox'?boxIcon():nodeRef.ref==='vNodeList'?listIcon():ifIcon()]),state.editingTitleNodeId===nodeId?editingNode(nodeRef):(0,_h2.default)('span',{style:{flex:'1',cursor:'pointer',transition:'color 0.2s',paddingLeft:'2px',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'},on:{dblclick:[EDIT_VIEW_NODE_TITLE,nodeId]}},node.title),(0,_h2.default)('div',{style:{color:'#53B2ED',cursor:'pointer',display:state.selectedViewNode.id===nodeId?'inline-flex':'none',flex:'0 0 auto'},on:{click:[DELETE_SELECTED_VIEW,nodeRef,parentRef]}},[deleteIcon()])]),(0,_h2.default)('div',{style:{display:state.viewFoldersClosed[nodeId]||state.draggedComponentView&&nodeId===state.draggedComponentView.id?'none':'block'}},state.hoveredViewNode&&state.hoveredViewNode.parent.id===nodeId&&!(node.children.findIndex(function(ref){return ref.id===state.draggedComponentView.id;})===state.hoveredViewNode.position)?function(){// adds a fake component
var oldPosition=node.children.findIndex(function(ref){return ref.id===state.draggedComponentView.id;});// this is needed because we still show the old node
var newPosition=oldPosition===-1||state.hoveredViewNode.position<oldPosition?state.hoveredViewNode.position:state.hoveredViewNode.position+1;var children=node.children.map(function(ref){return listNode(ref,nodeRef,depth+1);});return children.slice(0,newPosition).concat(spacerComponent(),children.slice(newPosition));}():node.children.map(function(ref){return listNode(ref,nodeRef,depth+1);}))]);}function simpleNode(nodeRef,parentRef,depth){var nodeId=nodeRef.id;var node=state.definition[nodeRef.ref][nodeId];return(0,_h2.default)('div',{key:nodeId,style:{cursor:'pointer',opacity:state.draggedComponentView&&state.draggedComponentView.id===nodeId?'0.5':'1.0',position:'relative',height:'26px',paddingLeft:depth*20+8+'px',paddingRight:'8px',background:'#444',borderTop:'2px solid #4d4d4d',borderBottom:'2px solid #333',whiteSpace:'nowrap',display:'flex',alignItems:'center',color:state.selectedViewNode.id===nodeId?'#53B2ED':'#bdbdbd'},on:{mousedown:[VIEW_DRAGGED,nodeRef,parentRef,depth],touchstart:[VIEW_DRAGGED,nodeRef,parentRef,depth],dblclick:[EDIT_VIEW_NODE_TITLE,nodeId],mousemove:[VIEW_HOVERED,nodeRef,parentRef,depth],touchmove:[VIEW_HOVER_MOBILE]}},[nodeRef.ref==='vNodeInput'?inputIcon():textIcon(),state.editingTitleNodeId===nodeId?editingNode(nodeRef):(0,_h2.default)('span',{style:{flex:'1',color:state.selectedViewNode.id===nodeId?'#53B2ED':'white',transition:'color 0.2s',paddingLeft:'2px',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}},node.title),(0,_h2.default)('div',{style:{color:'#53B2ED',cursor:'pointer',display:state.selectedViewNode.id===nodeId?'inline-flex':'none',flex:'0 0 auto'},on:{click:[DELETE_SELECTED_VIEW,nodeRef,parentRef]}},[deleteIcon()])]);}function spacerComponent(){return(0,_h2.default)('div',{key:'spacer',style:{cursor:'pointer',height:'6px',boxShadow:'inset 0 0 1px 1px #53B2ED'}});}function fakeComponent(nodeRef,depth){var nodeId=nodeRef.id;var node=state.definition[nodeRef.ref][nodeId];return(0,_h2.default)('div',{key:'_fake'+nodeId,style:{cursor:'pointer',transition:'padding-left 0.2s',height:'26px',paddingLeft:(depth-(node.children&&node.children.length>0?1:0))*20+8+'px',paddingRight:'8px',background:'rgba(68,68,68,0.8)',borderTop:'2px solid #4d4d4d',borderBottom:'2px solid #333',whiteSpace:'nowrap',display:'flex',alignItems:'center',color:state.selectedViewNode.id===nodeId?'#53B2ED':'#bdbdbd'}},[(nodeRef.ref==='vNodeBox'||nodeRef.ref==='vNodeList'||nodeRef.ref==='vNodeIf')&&node.children.length>0?arrowIcon(true):(0,_h2.default)('span',{key:'_fakeSpan'+nodeId}),nodeRef.ref==='vNodeBox'?boxIcon():nodeRef.ref==='vNodeList'?listIcon():nodeRef.ref==='vNodeIf'?ifIcon():nodeRef.ref==='vNodeInput'?inputIcon():textIcon(),(0,_h2.default)('span',{style:{flex:'1',color:state.selectedViewNode.id===nodeId?'#53B2ED':'white',transition:'color 0.2s',paddingLeft:'2px',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}},node.title)]);}function generateEditNodeComponent(){var styles=['background','border','outline','cursor','color','display','top','bottom','left','width','height','maxWidth','maxHeight','minWidth','minHeight','right','position','overflow','font','margin','padding'];var selectedNode=state.definition[state.selectedViewNode.ref][state.selectedViewNode.id];var propsComponent=(0,_h2.default)('div',{style:{background:state.selectedViewSubMenu==='props'?'#4d4d4d':'#3d3d3d',padding:'10px 0',flex:'1',cursor:'pointer',textAlign:'center'},on:{click:[SELECT_VIEW_SUBMENU,'props']}},'data');var styleComponent=(0,_h2.default)('div',{style:{background:state.selectedViewSubMenu==='style'?'#4d4d4d':'#3d3d3d',padding:'10px 0',flex:'1',borderRight:'1px solid #222',borderLeft:'1px solid #222',textAlign:'center',cursor:'pointer'},on:{click:[SELECT_VIEW_SUBMENU,'style']}},'style');var eventsComponent=(0,_h2.default)('div',{style:{background:state.selectedViewSubMenu==='events'?'#4d4d4d':'#3d3d3d',padding:'10px 0',flex:'1',textAlign:'center',cursor:'pointer'},on:{click:[SELECT_VIEW_SUBMENU,'events']}},'events');var genpropsSubmenuComponent=function genpropsSubmenuComponent(){return(0,_h2.default)('div',[function(){if(state.selectedViewNode.ref==='vNodeBox'){return(0,_h2.default)('div',{style:{textAlign:'center',marginTop:'100px',color:'#bdbdbd'}},'no data required');}if(state.selectedViewNode.ref==='vNodeText'){return(0,_h2.default)('div',[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center',background:'#676767',padding:'5px 10px',marginBottom:'10px'}},[(0,_h2.default)('span',{style:{flex:'1'}},'text value'),(0,_h2.default)('div',{style:{flex:'0',cursor:'default',color:'#bdbdbd'}},'text')]),(0,_h2.default)('div',{style:{padding:'5px 10px'}},[emberEditor(selectedNode.value,'text')])]);}if(state.selectedViewNode.ref==='vNodeInput'){return(0,_h2.default)('div',[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center',background:'#676767',padding:'5px 10px',marginBottom:'10px'}},[(0,_h2.default)('span',{style:{flex:'1'}},'input value'),(0,_h2.default)('div',{style:{flex:'0',cursor:'default',color:'#bdbdbd'}},'text')]),(0,_h2.default)('div',{style:{padding:'5px 10px'}},[emberEditor(selectedNode.value,'text')])]);}if(state.selectedViewNode.ref==='vNodeList'){return(0,_h2.default)('div',[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center',background:'#676767',padding:'5px 10px',marginBottom:'10px'}},[(0,_h2.default)('span',{style:{flex:'1'}},'table'),(0,_h2.default)('div',{style:{flex:'0',cursor:'default',color:'#bdbdbd'}},'table')]),(0,_h2.default)('div',{style:{padding:'5px 10px'}},[emberEditor(selectedNode.value,'table')])]);}if(state.selectedViewNode.ref==='vNodeIf'){return(0,_h2.default)('div',[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center',background:'#676767',padding:'5px 10px',marginBottom:'10px'}},[(0,_h2.default)('span',{style:{flex:'1'}},'predicate'),(0,_h2.default)('div',{style:{flex:'0',cursor:'default',color:'#bdbdbd'}},'true/false')]),(0,_h2.default)('div',{style:{padding:'5px 10px'}},[emberEditor(selectedNode.value,'boolean')])]);}}()]);};var genstyleSubmenuComponent=function genstyleSubmenuComponent(){var selectedStyle=state.definition.style[selectedNode.style.id];return(0,_h2.default)('div',{attrs:{class:'better-scrollbar'},style:{overflow:'auto'}},[(0,_h2.default)('div',{style:{padding:'10px',fontFamily:"'Comfortaa', sans-serif",color:'#bdbdbd'}},'style panel will change a lot in 1.0v, right now it\'s just CSS')].concat(_toConsumableArray(Object.keys(selectedStyle).map(function(key){return(0,_h2.default)('div',{style:{}},[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center',background:'#676767',padding:'5px 10px',marginBottom:'10px'}},[(0,_h2.default)('span',{style:{flex:'1'}},key),(0,_h2.default)('div',{style:{flex:'0',cursor:'default',color:'#bdbdbd'}},'text')]),(0,_h2.default)('div',{style:{padding:'5px 10px'}},[emberEditor(selectedStyle[key],'text')])]);})),[(0,_h2.default)('div',{style:{padding:'5px 10px',fontFamily:"'Comfortaa', sans-serif",color:'#bdbdbd'}},'add Style:'),(0,_h2.default)('div',{style:{padding:'5px 0 5px 10px'}},styles.filter(function(key){return!Object.keys(selectedStyle).includes(key);}).map(function(key){return(0,_h2.default)('div',{on:{click:[ADD_DEFAULT_STYLE,selectedNode.style.id,key]},style:{cursor:'pointer',border:'3px solid white',padding:'5px',marginTop:'5px'}},'+ '+key);}))]));};var geneventsSubmenuComponent=function geneventsSubmenuComponent(){var availableEvents=[{description:'on click',propertyName:'click'},{description:'double clicked',propertyName:'dblclick'},{description:'mouse over',propertyName:'mouseover'},{description:'mouse out',propertyName:'mouseout'}];if(state.selectedViewNode.ref==='vNodeInput'){availableEvents=availableEvents.concat([{description:'input',propertyName:'input'},{description:'focus',propertyName:'focus'},{description:'blur',propertyName:'blur'}]);}var currentEvents=availableEvents.filter(function(event){return selectedNode[event.propertyName];});var eventsLeft=availableEvents.filter(function(event){return!selectedNode[event.propertyName];});return(0,_h2.default)('div',{style:{paddingTop:'20px'}},[].concat(_toConsumableArray(currentEvents.length?currentEvents.map(function(eventDesc){var event=state.definition[selectedNode[eventDesc.propertyName].ref][selectedNode[eventDesc.propertyName].id];return(0,_h2.default)('div',[(0,_h2.default)('div',{style:{background:'#676767',padding:'5px 10px'}},event.type),(0,_h2.default)('div',{style:{color:'white',transition:'color 0.2s',fontSize:'14px',cursor:'pointer',padding:'5px 10px'}},event.mutators.map(function(mutatorRef){var mutator=state.definition[mutatorRef.ref][mutatorRef.id];var stateDef=state.definition[mutator.state.ref][mutator.state.id];return(0,_h2.default)('div',{style:{marginTop:'10px'}},[(0,_h2.default)('span',{style:{flex:'0 0 auto',display:'inline-block',position:'relative',transform:'translateZ(0)',boxShadow:'inset 0 0 0 2px '+(state.selectedStateNodeId===mutator.state.id?'#eab65c':'#828282'),background:'#444',padding:'4px 7px'}},[(0,_h2.default)('span',{style:{color:'white',display:'inline-block'},on:{click:[STATE_NODE_SELECTED,mutator.state.id]}},stateDef.title)]),emberEditor(mutator.mutation,stateDef.type)]);}))]);}):[]),[(0,_h2.default)('div',{style:{padding:'5px 10px',fontFamily:"'Comfortaa', sans-serif",color:'#bdbdbd'}},'add Event:'),(0,_h2.default)('div',{style:{padding:'5px 0 5px 10px'}},[].concat(_toConsumableArray(eventsLeft.map(function(event){return(0,_h2.default)('div',{style:{border:'3px solid #5bcc5b',cursor:'pointer',padding:'5px',margin:'10px'},on:{click:[ADD_EVENT,event.propertyName,state.selectedViewNode]}},'+ '+event.description);}))))]));};var fullVNode=state.selectedViewNode.ref==='vNodeBox'||state.selectedViewNode.ref==='vNodeText'||state.selectedViewNode.ref==='vNodeInput';return(0,_h2.default)('div',{style:{position:'absolute',left:'-15px',transform:'translate(-100%, 0)',marginRight:'8px',top:'50%',height:'50%',display:'flex'}},[(0,_h2.default)('div',{style:{flex:'1',display:'flex',marginBottom:'10px',flexDirection:'column',background:'#4d4d4d',width:state.subEditorWidth+'px',border:'3px solid #222'}},[(0,_h2.default)('div',{style:{flex:'0 0 auto'}},[(0,_h2.default)('div',{style:{display:'flex',cursor:'default',alignItems:'center',background:'#222',paddingTop:'2px',paddingBottom:'5px',color:'#53B2ED',minWidth:'100%'}},[(0,_h2.default)('span',{style:{flex:'0 0 auto',margin:'0 0 0 5px',display:'inline-flex'}},[state.selectedViewNode.id==='_rootNode'?appIcon():state.selectedViewNode.ref==='vNodeBox'?boxIcon():state.selectedViewNode.ref==='vNodeList'?listIcon():state.selectedViewNode.ref==='vNodeList'?ifIcon():state.selectedViewNode.ref==='vNodeInput'?inputIcon():textIcon()]),(0,_h2.default)('span',{style:{flex:'5 5 auto',margin:'0 5px 0 0',minWidth:'0',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}},selectedNode.title),(0,_h2.default)('span',{style:{flex:'0 0 auto',marginLeft:'auto',cursor:'pointer',marginRight:'5px',color:'white',display:'inline-flex'},on:{click:[UNSELECT_VIEW_NODE,false]}},[clearIcon()])])]),fullVNode?(0,_h2.default)('div',{style:{display:'flex',flex:'0 0 auto',fontFamily:"'Comfortaa', sans-serif"}},[propsComponent,styleComponent,eventsComponent]):(0,_h2.default)('span'),dragSubComponent,state.selectedViewSubMenu==='props'||!fullVNode?genpropsSubmenuComponent():state.selectedViewSubMenu==='style'?genstyleSubmenuComponent():state.selectedViewSubMenu==='events'?geneventsSubmenuComponent():(0,_h2.default)('span','Error, no such menu')])]);}var addStateComponent=(0,_h2.default)('div',{style:{flex:'0 auto',marginLeft:state.rightOpen?'-10px':'0',border:'3px solid #222',borderRight:'none',background:'#333',height:'40px',display:'flex',alignItems:'center'}},[(0,_h2.default)('span',{style:{fontFamily:"'Comfortaa', sans-serif",fontSize:'0.9em',cursor:'pointer',padding:'0 5px'}},'add state: '),(0,_h2.default)('span',{style:{display:'inline-block'},on:{click:[ADD_STATE,'_rootNameSpace','text']}},[textIcon()]),(0,_h2.default)('span',{on:{click:[ADD_STATE,'_rootNameSpace','number']}},[numberIcon()]),(0,_h2.default)('span',{on:{click:[ADD_STATE,'_rootNameSpace','boolean']}},[ifIcon()]),(0,_h2.default)('span',{on:{click:[ADD_STATE,'_rootNameSpace','table']}},[listIcon()])]);var addViewNodeComponent=(0,_h2.default)('div',{style:{flex:'0 auto',marginLeft:state.rightOpen?'-10px':'0',border:'3px solid #222',borderRight:'none',background:'#333',height:'40px',display:'flex',alignItems:'center'}},[(0,_h2.default)('span',{style:{fontFamily:"'Comfortaa', sans-serif",fontSize:'0.9em',padding:'0 10px'}},'add component: '),(0,_h2.default)('span',{on:{click:[ADD_NODE,state.selectedViewNode,'box']}},[boxIcon()]),(0,_h2.default)('span',{on:{click:[ADD_NODE,state.selectedViewNode,'input']}},[inputIcon()]),(0,_h2.default)('span',{on:{click:[ADD_NODE,state.selectedViewNode,'text']}},[textIcon()]),(0,_h2.default)('span',{on:{click:[ADD_NODE,state.selectedViewNode,'if']}},[ifIcon()])]);var viewComponent=(0,_h2.default)('div',{attrs:{class:'better-scrollbar'},style:{overflow:'auto',position:'relative',flex:'1',fontSize:'0.8em'},on:{click:[UNSELECT_VIEW_NODE,true]}},[listNode({ref:'vNodeBox',id:'_rootNode'},{},0)]);var rightComponent=(0,_h2.default)('div',{style:{display:'flex',flexDirection:'column',position:'absolute',top:'0',right:'0',color:'white',height:'100%',font:"300 1.2em 'Open Sans'",lineHeight:'1.2em',width:state.editorRightWidth+'px',background:'#4d4d4d',boxSizing:"border-box",borderLeft:'3px solid #222',transition:'0.5s transform',transform:state.rightOpen?'translateZ(0) translateX(0%)':'translateZ(0) translateX(100%)',userSelect:'none'}},[dragComponentRight,addStateComponent,stateComponent,addViewNodeComponent,viewComponent,state.selectedViewNode.ref?generateEditNodeComponent():(0,_h2.default)('span')]);var topComponent=(0,_h2.default)('div',{style:{flex:'1 auto',height:'75px',maxHeight:'75px',minHeight:'75px',background:'#222',display:'flex',justifyContent:'center',fontFamily:"'Comfortaa', sans-serif"}},[(0,_h2.default)('a',{style:{flex:'0 auto',width:'190px',textDecoration:'inherit',userSelect:'none'},attrs:{href:'/_dev'}},[(0,_h2.default)('img',{style:{margin:'7px -2px -3px 5px',display:'inline-block'},attrs:{src:'/images/logo256x256.png',height:'57'}}),(0,_h2.default)('span',{style:{fontSize:'44px',verticalAlign:'bottom',color:'#fff'}},'ugnis')]),(0,_h2.default)('div',{style:{position:'absolute',top:'0',right:'0',border:'none',color:'white',fontFamily:"'Comfortaa', sans-serif",fontSize:'16px'}},[(0,_h2.default)('div',{style:{background:'#444444',border:'none',color:'white',display:'inline-block',padding:'15px 20px',margin:'13px 13px 0 0',cursor:'pointer'},on:{click:[FULL_SCREEN_CLICKED,true]}},'full screen'),(0,_h2.default)('div',{style:{background:'#444444',border:'none',color:'white',display:'inline-block',padding:'15px 20px',margin:'13px 13px 0 0',cursor:'pointer'},on:{click:RESET_APP_STATE}},'reset state'),(0,_h2.default)('div',{style:{background:'#444444',border:'none',color:'white',display:'inline-block',padding:'15px 20px',margin:'13px 13px 0 0',cursor:'pointer'},on:{click:RESET_APP_DEFINITION}},'reset demo')])]);var leftComponent=(0,_h2.default)('div',{style:{display:'flex',flexDirection:'column',position:'absolute',top:'0',left:'0',height:'100%',color:'white',font:"300 1.2em 'Open Sans'",width:state.editorLeftWidth+'px',background:'#4d4d4d',boxSizing:"border-box",borderRight:'3px solid #222',transition:'0.5s transform',transform:state.leftOpen?'translateZ(0) translateX(0%)':'translateZ(0) translateX(-100%)',userSelect:'none'}},[dragComponentLeft,(0,_h2.default)('div',{on:{click:FREEZER_CLICKED},style:{flex:'0 auto',padding:'10px',textAlign:'center',background:'#333',cursor:'pointer'}},[(0,_h2.default)('span',{style:{padding:'15px 15px 10px 15px',color:state.appIsFrozen?'rgb(91, 204, 91)':'rgb(204, 91, 91)'}},state.appIsFrozen?'►':'❚❚')]),(0,_h2.default)('div',{attrs:{class:'better-scrollbar'},style:{flex:'1 auto',overflow:'auto'}},state.eventStack.filter(function(eventData){return state.definition.event[eventData.eventId]!==undefined;}).reverse()// mutates the array, but it was already copied with filter
.map(function(eventData,index){var event=state.definition.event[eventData.eventId];var emitter=state.definition[event.emitter.ref][event.emitter.id];// no idea why this key works, don't touch it, probably rerenders more than needed, but who cares
return(0,_h2.default)('div',{key:event.emitter.id+index,style:{marginBottom:'10px'}},[(0,_h2.default)('div',{style:{display:'flex',marginBottom:'10px',cursor:'pointer',alignItems:'center',background:'#444',paddingTop:'3px',paddingBottom:'3px',color:state.selectedViewNode.id===event.emitter.id?'#53B2ED':'white',transition:'0.2s all',minWidth:'100%'},on:{click:[VIEW_NODE_SELECTED,event.emitter]}},[(0,_h2.default)('span',{style:{flex:'0 0 auto',margin:'0 0 0 5px'}},[event.emitter.ref==='vNodeBox'?boxIcon():event.emitter.ref==='vNodeList'?listIcon():event.emitter.ref==='vNodeList'?ifIcon():event.emitter.ref==='vNodeInput'?inputIcon():textIcon()]),(0,_h2.default)('span',{style:{flex:'5 5 auto',margin:'0 5px 0 0',minWidth:'0',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}},emitter.title),(0,_h2.default)('span',{style:{flex:'0 0 auto',fontFamily:"'Comfortaa', sans-serif",fontSize:'0.9em',marginLeft:'auto',marginRight:'5px',color:'#5bcc5b'}},event.type)]),Object.keys(eventData.mutations).length===0?(0,_h2.default)('div',{style:{padding:'5px 10px',fontFamily:"'Comfortaa', sans-serif",color:'#bdbdbd'}},'nothing has changed'):(0,_h2.default)('div',{style:{paddingLeft:'10px',whiteSpace:'nowrap'}},Object.keys(eventData.mutations).filter(function(stateId){return state.definition.state[stateId]!==undefined;}).map(function(stateId){return(0,_h2.default)('span',[(0,_h2.default)('span',{on:{click:[STATE_NODE_SELECTED,stateId]},style:{cursor:'pointer',fontSize:'14px',color:'white',boxShadow:'inset 0 0 0 2px '+(state.selectedStateNodeId===stateId?'#eab65c':'#828282'),background:'#444',padding:'2px 5px',marginRight:'5px',display:'inline-block',transition:'all 0.2s'}},state.definition.state[stateId].title),(0,_h2.default)('span',{style:{color:'#8e8e8e'}},eventData.previousState[stateId].toString()+' –› '),(0,_h2.default)('span',eventData.mutations[stateId].toString())]);}))]);}))]);var renderViewComponent=(0,_h2.default)('div',{style:{flex:'1 auto',background:"\n                    radial-gradient(black 5%, transparent 16%) 0 0,\n                    radial-gradient(black 5%, transparent 16%) 8px 8px,\n                    radial-gradient(rgba(255,255,255,.1) 5%, transparent 20%) 0 1px,\n                    radial-gradient(rgba(255,255,255,.1) 5%, transparent 20%) 8px 9px",backgroundColor:'#333',backgroundSize:'16px 16px',display:'relative',overflow:'auto'}},[(0,_h2.default)('div',{style:function(){var topMenuHeight=75;var widthLeft=window.innerWidth-((state.leftOpen?state.editorLeftWidth:0)+(state.rightOpen?state.editorRightWidth:0));var heightLeft=window.innerHeight-topMenuHeight;return{width:state.fullScreen?'100vw':widthLeft-40+'px',height:state.fullScreen?'100vh':heightLeft-40+'px',background:'#ffffff',zIndex:state.fullScreen?'99999':undefined,boxShadow:'rgba(0, 0, 0, 0.247059) 0px 14px 45px, rgba(0, 0, 0, 0.219608) 0px 10px 18px',position:'fixed',transition:state.fullScreen?'all 0.3s':'none',top:state.fullScreen?'0px':20+75+'px',left:state.fullScreen?'0px':(state.leftOpen?state.editorLeftWidth:0)+20+'px'};}()},[state.fullScreen?(0,_h2.default)('span',{style:{position:'fixed',padding:'12px 10px',top:'0',right:'20px',border:'2px solid #333',borderTop:'none',background:'#444',color:'white',opacity:'0.8',cursor:'pointer'},on:{click:[FULL_SCREEN_CLICKED,false]}},'exit full screen'):(0,_h2.default)('span'),(0,_h2.default)('div',{style:{overflow:'auto',width:'100%',height:'100%'}},[app.vdom])])]);var mainRowComponent=(0,_h2.default)('div',{style:{display:'flex',flex:'1',position:'relative'}},[renderViewComponent,leftComponent,rightComponent]);var vnode=(0,_h2.default)('div',{style:{display:'flex',flexDirection:'column',position:'fixed',top:'0',right:'0',width:'100vw',height:'100vh'}},[topComponent,mainRowComponent,state.draggedComponentView?(0,_h2.default)('div',{style:{fontFamily:"Open Sans",pointerEvents:'none',position:'fixed',top:state.mousePosition.y+'px',left:state.mousePosition.x+'px',lineHeight:'1.2em',fontSize:'1.2em',zIndex:'99999',width:state.editorRightWidth+'px'}},[(0,_h2.default)('div',{style:{overflow:'auto',position:'relative',flex:'1',fontSize:'0.8em'}},[fakeComponent(state.draggedComponentView,state.hoveredViewNode?state.hoveredViewNode.depth:state.draggedComponentView.depth)])]):(0,_h2.default)('span')]);node=patch(node,vnode);currentAnimationFrameRequest=null;}render();}

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
      "value": "\'Comfortaa\', cursive",
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmlnLmpzL2JpZy5qcyIsIm5vZGVfbW9kdWxlcy9mYXN0Y2xpY2svbGliL2Zhc3RjbGljay5qcyIsIm5vZGVfbW9kdWxlcy9zbmFiYmRvbS9oLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL2h0bWxkb21hcGkuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vaXMuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vbW9kdWxlcy9hdHRyaWJ1dGVzLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvY2xhc3MuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vbW9kdWxlcy9ldmVudGxpc3RlbmVycy5qcyIsIm5vZGVfbW9kdWxlcy9zbmFiYmRvbS9tb2R1bGVzL3Byb3BzLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvc3R5bGUuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vc25hYmJkb20uanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vdm5vZGUuanMiLCJzcmNcXGluZGV4LmpzIiwic3JjXFx1Z25pcy5qcyIsInVnbmlzX2NvbXBvbmVudHMvYXBwLmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdG5DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3owQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBiaWcuanMgdjMuMS4zIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWtlTWNsL2JpZy5qcy9MSUNFTkNFICovXHJcbjsoZnVuY3Rpb24gKGdsb2JhbCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuLypcclxuICBiaWcuanMgdjMuMS4zXHJcbiAgQSBzbWFsbCwgZmFzdCwgZWFzeS10by11c2UgbGlicmFyeSBmb3IgYXJiaXRyYXJ5LXByZWNpc2lvbiBkZWNpbWFsIGFyaXRobWV0aWMuXHJcbiAgaHR0cHM6Ly9naXRodWIuY29tL01pa2VNY2wvYmlnLmpzL1xyXG4gIENvcHlyaWdodCAoYykgMjAxNCBNaWNoYWVsIE1jbGF1Z2hsaW4gPE04Y2g4OGxAZ21haWwuY29tPlxyXG4gIE1JVCBFeHBhdCBMaWNlbmNlXHJcbiovXHJcblxyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogRURJVEFCTEUgREVGQVVMVFMgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuICAgIC8vIFRoZSBkZWZhdWx0IHZhbHVlcyBiZWxvdyBtdXN0IGJlIGludGVnZXJzIHdpdGhpbiB0aGUgc3RhdGVkIHJhbmdlcy5cclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIG1heGltdW0gbnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzIG9mIHRoZSByZXN1bHRzIG9mIG9wZXJhdGlvbnNcclxuICAgICAqIGludm9sdmluZyBkaXZpc2lvbjogZGl2IGFuZCBzcXJ0LCBhbmQgcG93IHdpdGggbmVnYXRpdmUgZXhwb25lbnRzLlxyXG4gICAgICovXHJcbiAgICB2YXIgRFAgPSAyMCwgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIE1BWF9EUFxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSByb3VuZGluZyBtb2RlIHVzZWQgd2hlbiByb3VuZGluZyB0byB0aGUgYWJvdmUgZGVjaW1hbCBwbGFjZXMuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiAwIFRvd2FyZHMgemVybyAoaS5lLiB0cnVuY2F0ZSwgbm8gcm91bmRpbmcpLiAgICAgICAoUk9VTkRfRE9XTilcclxuICAgICAgICAgKiAxIFRvIG5lYXJlc3QgbmVpZ2hib3VyLiBJZiBlcXVpZGlzdGFudCwgcm91bmQgdXAuICAoUk9VTkRfSEFMRl9VUClcclxuICAgICAgICAgKiAyIFRvIG5lYXJlc3QgbmVpZ2hib3VyLiBJZiBlcXVpZGlzdGFudCwgdG8gZXZlbi4gICAoUk9VTkRfSEFMRl9FVkVOKVxyXG4gICAgICAgICAqIDMgQXdheSBmcm9tIHplcm8uICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChST1VORF9VUClcclxuICAgICAgICAgKi9cclxuICAgICAgICBSTSA9IDEsICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAsIDEsIDIgb3IgM1xyXG5cclxuICAgICAgICAvLyBUaGUgbWF4aW11bSB2YWx1ZSBvZiBEUCBhbmQgQmlnLkRQLlxyXG4gICAgICAgIE1BWF9EUCA9IDFFNiwgICAgICAgICAgICAgICAgICAgICAgLy8gMCB0byAxMDAwMDAwXHJcblxyXG4gICAgICAgIC8vIFRoZSBtYXhpbXVtIG1hZ25pdHVkZSBvZiB0aGUgZXhwb25lbnQgYXJndW1lbnQgdG8gdGhlIHBvdyBtZXRob2QuXHJcbiAgICAgICAgTUFYX1BPV0VSID0gMUU2LCAgICAgICAgICAgICAgICAgICAvLyAxIHRvIDEwMDAwMDBcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgZXhwb25lbnQgdmFsdWUgYXQgYW5kIGJlbmVhdGggd2hpY2ggdG9TdHJpbmcgcmV0dXJucyBleHBvbmVudGlhbFxyXG4gICAgICAgICAqIG5vdGF0aW9uLlxyXG4gICAgICAgICAqIEphdmFTY3JpcHQncyBOdW1iZXIgdHlwZTogLTdcclxuICAgICAgICAgKiAtMTAwMDAwMCBpcyB0aGUgbWluaW11bSByZWNvbW1lbmRlZCBleHBvbmVudCB2YWx1ZSBvZiBhIEJpZy5cclxuICAgICAgICAgKi9cclxuICAgICAgICBFX05FRyA9IC03LCAgICAgICAgICAgICAgICAgICAvLyAwIHRvIC0xMDAwMDAwXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVGhlIGV4cG9uZW50IHZhbHVlIGF0IGFuZCBhYm92ZSB3aGljaCB0b1N0cmluZyByZXR1cm5zIGV4cG9uZW50aWFsXHJcbiAgICAgICAgICogbm90YXRpb24uXHJcbiAgICAgICAgICogSmF2YVNjcmlwdCdzIE51bWJlciB0eXBlOiAyMVxyXG4gICAgICAgICAqIDEwMDAwMDAgaXMgdGhlIG1heGltdW0gcmVjb21tZW5kZWQgZXhwb25lbnQgdmFsdWUgb2YgYSBCaWcuXHJcbiAgICAgICAgICogKFRoaXMgbGltaXQgaXMgbm90IGVuZm9yY2VkIG9yIGNoZWNrZWQuKVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIEVfUE9TID0gMjEsICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gMTAwMDAwMFxyXG5cclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuXHJcbiAgICAgICAgLy8gVGhlIHNoYXJlZCBwcm90b3R5cGUgb2JqZWN0LlxyXG4gICAgICAgIFAgPSB7fSxcclxuICAgICAgICBpc1ZhbGlkID0gL14tPyhcXGQrKFxcLlxcZCopP3xcXC5cXGQrKShlWystXT9cXGQrKT8kL2ksXHJcbiAgICAgICAgQmlnO1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogQ3JlYXRlIGFuZCByZXR1cm4gYSBCaWcgY29uc3RydWN0b3IuXHJcbiAgICAgKlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBiaWdGYWN0b3J5KCkge1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSBCaWcgY29uc3RydWN0b3IgYW5kIGV4cG9ydGVkIGZ1bmN0aW9uLlxyXG4gICAgICAgICAqIENyZWF0ZSBhbmQgcmV0dXJuIGEgbmV3IGluc3RhbmNlIG9mIGEgQmlnIG51bWJlciBvYmplY3QuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBuIHtudW1iZXJ8c3RyaW5nfEJpZ30gQSBudW1lcmljIHZhbHVlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIEJpZyhuKSB7XHJcbiAgICAgICAgICAgIHZhciB4ID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIC8vIEVuYWJsZSBjb25zdHJ1Y3RvciB1c2FnZSB3aXRob3V0IG5ldy5cclxuICAgICAgICAgICAgaWYgKCEoeCBpbnN0YW5jZW9mIEJpZykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuID09PSB2b2lkIDAgPyBiaWdGYWN0b3J5KCkgOiBuZXcgQmlnKG4pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBEdXBsaWNhdGUuXHJcbiAgICAgICAgICAgIGlmIChuIGluc3RhbmNlb2YgQmlnKSB7XHJcbiAgICAgICAgICAgICAgICB4LnMgPSBuLnM7XHJcbiAgICAgICAgICAgICAgICB4LmUgPSBuLmU7XHJcbiAgICAgICAgICAgICAgICB4LmMgPSBuLmMuc2xpY2UoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBhcnNlKHgsIG4pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgKiBSZXRhaW4gYSByZWZlcmVuY2UgdG8gdGhpcyBCaWcgY29uc3RydWN0b3IsIGFuZCBzaGFkb3dcclxuICAgICAgICAgICAgICogQmlnLnByb3RvdHlwZS5jb25zdHJ1Y3RvciB3aGljaCBwb2ludHMgdG8gT2JqZWN0LlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgeC5jb25zdHJ1Y3RvciA9IEJpZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEJpZy5wcm90b3R5cGUgPSBQO1xyXG4gICAgICAgIEJpZy5EUCA9IERQO1xyXG4gICAgICAgIEJpZy5STSA9IFJNO1xyXG4gICAgICAgIEJpZy5FX05FRyA9IEVfTkVHO1xyXG4gICAgICAgIEJpZy5FX1BPUyA9IEVfUE9TO1xyXG5cclxuICAgICAgICByZXR1cm4gQmlnO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBQcml2YXRlIGZ1bmN0aW9uc1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgQmlnIHggaW4gbm9ybWFsIG9yIGV4cG9uZW50aWFsXHJcbiAgICAgKiBub3RhdGlvbiB0byBkcCBmaXhlZCBkZWNpbWFsIHBsYWNlcyBvciBzaWduaWZpY2FudCBkaWdpdHMuXHJcbiAgICAgKlxyXG4gICAgICogeCB7QmlnfSBUaGUgQmlnIHRvIGZvcm1hdC5cclxuICAgICAqIGRwIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqIHRvRSB7bnVtYmVyfSAxICh0b0V4cG9uZW50aWFsKSwgMiAodG9QcmVjaXNpb24pIG9yIHVuZGVmaW5lZCAodG9GaXhlZCkuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGZvcm1hdCh4LCBkcCwgdG9FKSB7XHJcbiAgICAgICAgdmFyIEJpZyA9IHguY29uc3RydWN0b3IsXHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgaW5kZXggKG5vcm1hbCBub3RhdGlvbikgb2YgdGhlIGRpZ2l0IHRoYXQgbWF5IGJlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgIGkgPSBkcCAtICh4ID0gbmV3IEJpZyh4KSkuZSxcclxuICAgICAgICAgICAgYyA9IHguYztcclxuXHJcbiAgICAgICAgLy8gUm91bmQ/XHJcbiAgICAgICAgaWYgKGMubGVuZ3RoID4gKytkcCkge1xyXG4gICAgICAgICAgICBybmQoeCwgaSwgQmlnLlJNKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghY1swXSkge1xyXG4gICAgICAgICAgICArK2k7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0b0UpIHtcclxuICAgICAgICAgICAgaSA9IGRwO1xyXG5cclxuICAgICAgICAvLyB0b0ZpeGVkXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYyA9IHguYztcclxuXHJcbiAgICAgICAgICAgIC8vIFJlY2FsY3VsYXRlIGkgYXMgeC5lIG1heSBoYXZlIGNoYW5nZWQgaWYgdmFsdWUgcm91bmRlZCB1cC5cclxuICAgICAgICAgICAgaSA9IHguZSArIGkgKyAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQXBwZW5kIHplcm9zP1xyXG4gICAgICAgIGZvciAoOyBjLmxlbmd0aCA8IGk7IGMucHVzaCgwKSkge1xyXG4gICAgICAgIH1cclxuICAgICAgICBpID0geC5lO1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIHRvUHJlY2lzaW9uIHJldHVybnMgZXhwb25lbnRpYWwgbm90YXRpb24gaWYgdGhlIG51bWJlciBvZlxyXG4gICAgICAgICAqIHNpZ25pZmljYW50IGRpZ2l0cyBzcGVjaWZpZWQgaXMgbGVzcyB0aGFuIHRoZSBudW1iZXIgb2YgZGlnaXRzXHJcbiAgICAgICAgICogbmVjZXNzYXJ5IHRvIHJlcHJlc2VudCB0aGUgaW50ZWdlciBwYXJ0IG9mIHRoZSB2YWx1ZSBpbiBub3JtYWxcclxuICAgICAgICAgKiBub3RhdGlvbi5cclxuICAgICAgICAgKi9cclxuICAgICAgICByZXR1cm4gdG9FID09PSAxIHx8IHRvRSAmJiAoZHAgPD0gaSB8fCBpIDw9IEJpZy5FX05FRykgP1xyXG5cclxuICAgICAgICAgIC8vIEV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAgICAgICAgKHgucyA8IDAgJiYgY1swXSA/ICctJyA6ICcnKSArXHJcbiAgICAgICAgICAgIChjLmxlbmd0aCA+IDEgPyBjWzBdICsgJy4nICsgYy5qb2luKCcnKS5zbGljZSgxKSA6IGNbMF0pICtcclxuICAgICAgICAgICAgICAoaSA8IDAgPyAnZScgOiAnZSsnKSArIGlcclxuXHJcbiAgICAgICAgICAvLyBOb3JtYWwgbm90YXRpb24uXHJcbiAgICAgICAgICA6IHgudG9TdHJpbmcoKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFBhcnNlIHRoZSBudW1iZXIgb3Igc3RyaW5nIHZhbHVlIHBhc3NlZCB0byBhIEJpZyBjb25zdHJ1Y3Rvci5cclxuICAgICAqXHJcbiAgICAgKiB4IHtCaWd9IEEgQmlnIG51bWJlciBpbnN0YW5jZS5cclxuICAgICAqIG4ge251bWJlcnxzdHJpbmd9IEEgbnVtZXJpYyB2YWx1ZS5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcGFyc2UoeCwgbikge1xyXG4gICAgICAgIHZhciBlLCBpLCBuTDtcclxuXHJcbiAgICAgICAgLy8gTWludXMgemVybz9cclxuICAgICAgICBpZiAobiA9PT0gMCAmJiAxIC8gbiA8IDApIHtcclxuICAgICAgICAgICAgbiA9ICctMCc7XHJcblxyXG4gICAgICAgIC8vIEVuc3VyZSBuIGlzIHN0cmluZyBhbmQgY2hlY2sgdmFsaWRpdHkuXHJcbiAgICAgICAgfSBlbHNlIGlmICghaXNWYWxpZC50ZXN0KG4gKz0gJycpKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKE5hTik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgc2lnbi5cclxuICAgICAgICB4LnMgPSBuLmNoYXJBdCgwKSA9PSAnLScgPyAobiA9IG4uc2xpY2UoMSksIC0xKSA6IDE7XHJcblxyXG4gICAgICAgIC8vIERlY2ltYWwgcG9pbnQ/XHJcbiAgICAgICAgaWYgKChlID0gbi5pbmRleE9mKCcuJykpID4gLTEpIHtcclxuICAgICAgICAgICAgbiA9IG4ucmVwbGFjZSgnLicsICcnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEV4cG9uZW50aWFsIGZvcm0/XHJcbiAgICAgICAgaWYgKChpID0gbi5zZWFyY2goL2UvaSkpID4gMCkge1xyXG5cclxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIGV4cG9uZW50LlxyXG4gICAgICAgICAgICBpZiAoZSA8IDApIHtcclxuICAgICAgICAgICAgICAgIGUgPSBpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGUgKz0gK24uc2xpY2UoaSArIDEpO1xyXG4gICAgICAgICAgICBuID0gbi5zdWJzdHJpbmcoMCwgaSk7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAoZSA8IDApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIEludGVnZXIuXHJcbiAgICAgICAgICAgIGUgPSBuLmxlbmd0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSBsZWFkaW5nIHplcm9zLlxyXG4gICAgICAgIGZvciAoaSA9IDA7IG4uY2hhckF0KGkpID09ICcwJzsgaSsrKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaSA9PSAobkwgPSBuLmxlbmd0aCkpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFplcm8uXHJcbiAgICAgICAgICAgIHguYyA9IFsgeC5lID0gMCBdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoOyBuLmNoYXJBdCgtLW5MKSA9PSAnMCc7KSB7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHguZSA9IGUgLSBpIC0gMTtcclxuICAgICAgICAgICAgeC5jID0gW107XHJcblxyXG4gICAgICAgICAgICAvLyBDb252ZXJ0IHN0cmluZyB0byBhcnJheSBvZiBkaWdpdHMgd2l0aG91dCBsZWFkaW5nL3RyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKGUgPSAwOyBpIDw9IG5MOyB4LmNbZSsrXSA9ICtuLmNoYXJBdChpKyspKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUm91bmQgQmlnIHggdG8gYSBtYXhpbXVtIG9mIGRwIGRlY2ltYWwgcGxhY2VzIHVzaW5nIHJvdW5kaW5nIG1vZGUgcm0uXHJcbiAgICAgKiBDYWxsZWQgYnkgZGl2LCBzcXJ0IGFuZCByb3VuZC5cclxuICAgICAqXHJcbiAgICAgKiB4IHtCaWd9IFRoZSBCaWcgdG8gcm91bmQuXHJcbiAgICAgKiBkcCB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKiBybSB7bnVtYmVyfSAwLCAxLCAyIG9yIDMgKERPV04sIEhBTEZfVVAsIEhBTEZfRVZFTiwgVVApXHJcbiAgICAgKiBbbW9yZV0ge2Jvb2xlYW59IFdoZXRoZXIgdGhlIHJlc3VsdCBvZiBkaXZpc2lvbiB3YXMgdHJ1bmNhdGVkLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBybmQoeCwgZHAsIHJtLCBtb3JlKSB7XHJcbiAgICAgICAgdmFyIHUsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICBpID0geC5lICsgZHAgKyAxO1xyXG5cclxuICAgICAgICBpZiAocm0gPT09IDEpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHhjW2ldIGlzIHRoZSBkaWdpdCBhZnRlciB0aGUgZGlnaXQgdGhhdCBtYXkgYmUgcm91bmRlZCB1cC5cclxuICAgICAgICAgICAgbW9yZSA9IHhjW2ldID49IDU7XHJcbiAgICAgICAgfSBlbHNlIGlmIChybSA9PT0gMikge1xyXG4gICAgICAgICAgICBtb3JlID0geGNbaV0gPiA1IHx8IHhjW2ldID09IDUgJiZcclxuICAgICAgICAgICAgICAobW9yZSB8fCBpIDwgMCB8fCB4Y1tpICsgMV0gIT09IHUgfHwgeGNbaSAtIDFdICYgMSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChybSA9PT0gMykge1xyXG4gICAgICAgICAgICBtb3JlID0gbW9yZSB8fCB4Y1tpXSAhPT0gdSB8fCBpIDwgMDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBtb3JlID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBpZiAocm0gIT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRocm93RXJyKCchQmlnLlJNIScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaSA8IDEgfHwgIXhjWzBdKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAobW9yZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIDEsIDAuMSwgMC4wMSwgMC4wMDEsIDAuMDAwMSBldGMuXHJcbiAgICAgICAgICAgICAgICB4LmUgPSAtZHA7XHJcbiAgICAgICAgICAgICAgICB4LmMgPSBbMV07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gWmVyby5cclxuICAgICAgICAgICAgICAgIHguYyA9IFt4LmUgPSAwXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgYW55IGRpZ2l0cyBhZnRlciB0aGUgcmVxdWlyZWQgZGVjaW1hbCBwbGFjZXMuXHJcbiAgICAgICAgICAgIHhjLmxlbmd0aCA9IGktLTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJvdW5kIHVwP1xyXG4gICAgICAgICAgICBpZiAobW9yZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFJvdW5kaW5nIHVwIG1heSBtZWFuIHRoZSBwcmV2aW91cyBkaWdpdCBoYXMgdG8gYmUgcm91bmRlZCB1cC5cclxuICAgICAgICAgICAgICAgIGZvciAoOyArK3hjW2ldID4gOTspIHtcclxuICAgICAgICAgICAgICAgICAgICB4Y1tpXSA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghaS0tKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICsreC5lO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4Yy51bnNoaWZ0KDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKGkgPSB4Yy5sZW5ndGg7ICF4Y1stLWldOyB4Yy5wb3AoKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4geDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFRocm93IGEgQmlnRXJyb3IuXHJcbiAgICAgKlxyXG4gICAgICogbWVzc2FnZSB7c3RyaW5nfSBUaGUgZXJyb3IgbWVzc2FnZS5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gdGhyb3dFcnIobWVzc2FnZSkge1xyXG4gICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IobWVzc2FnZSk7XHJcbiAgICAgICAgZXJyLm5hbWUgPSAnQmlnRXJyb3InO1xyXG5cclxuICAgICAgICB0aHJvdyBlcnI7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIFByb3RvdHlwZS9pbnN0YW5jZSBtZXRob2RzXHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiB0aGlzIEJpZy5cclxuICAgICAqL1xyXG4gICAgUC5hYnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHggPSBuZXcgdGhpcy5jb25zdHJ1Y3Rvcih0aGlzKTtcclxuICAgICAgICB4LnMgPSAxO1xyXG5cclxuICAgICAgICByZXR1cm4geDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm5cclxuICAgICAqIDEgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGdyZWF0ZXIgdGhhbiB0aGUgdmFsdWUgb2YgQmlnIHksXHJcbiAgICAgKiAtMSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgbGVzcyB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSwgb3JcclxuICAgICAqIDAgaWYgdGhleSBoYXZlIHRoZSBzYW1lIHZhbHVlLlxyXG4gICAgKi9cclxuICAgIFAuY21wID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgeE5lZyxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICB5YyA9ICh5ID0gbmV3IHguY29uc3RydWN0b3IoeSkpLmMsXHJcbiAgICAgICAgICAgIGkgPSB4LnMsXHJcbiAgICAgICAgICAgIGogPSB5LnMsXHJcbiAgICAgICAgICAgIGsgPSB4LmUsXHJcbiAgICAgICAgICAgIGwgPSB5LmU7XHJcblxyXG4gICAgICAgIC8vIEVpdGhlciB6ZXJvP1xyXG4gICAgICAgIGlmICgheGNbMF0gfHwgIXljWzBdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAheGNbMF0gPyAheWNbMF0gPyAwIDogLWogOiBpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU2lnbnMgZGlmZmVyP1xyXG4gICAgICAgIGlmIChpICE9IGopIHtcclxuICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHhOZWcgPSBpIDwgMDtcclxuXHJcbiAgICAgICAgLy8gQ29tcGFyZSBleHBvbmVudHMuXHJcbiAgICAgICAgaWYgKGsgIT0gbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gayA+IGwgXiB4TmVnID8gMSA6IC0xO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaSA9IC0xO1xyXG4gICAgICAgIGogPSAoayA9IHhjLmxlbmd0aCkgPCAobCA9IHljLmxlbmd0aCkgPyBrIDogbDtcclxuXHJcbiAgICAgICAgLy8gQ29tcGFyZSBkaWdpdCBieSBkaWdpdC5cclxuICAgICAgICBmb3IgKDsgKytpIDwgajspIHtcclxuXHJcbiAgICAgICAgICAgIGlmICh4Y1tpXSAhPSB5Y1tpXSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHhjW2ldID4geWNbaV0gXiB4TmVnID8gMSA6IC0xO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBDb21wYXJlIGxlbmd0aHMuXHJcbiAgICAgICAgcmV0dXJuIGsgPT0gbCA/IDAgOiBrID4gbCBeIHhOZWcgPyAxIDogLTE7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgZGl2aWRlZCBieSB0aGVcclxuICAgICAqIHZhbHVlIG9mIEJpZyB5LCByb3VuZGVkLCBpZiBuZWNlc3NhcnksIHRvIGEgbWF4aW11bSBvZiBCaWcuRFAgZGVjaW1hbFxyXG4gICAgICogcGxhY2VzIHVzaW5nIHJvdW5kaW5nIG1vZGUgQmlnLlJNLlxyXG4gICAgICovXHJcbiAgICBQLmRpdiA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICAvLyBkaXZpZGVuZFxyXG4gICAgICAgICAgICBkdmQgPSB4LmMsXHJcbiAgICAgICAgICAgIC8vZGl2aXNvclxyXG4gICAgICAgICAgICBkdnMgPSAoeSA9IG5ldyBCaWcoeSkpLmMsXHJcbiAgICAgICAgICAgIHMgPSB4LnMgPT0geS5zID8gMSA6IC0xLFxyXG4gICAgICAgICAgICBkcCA9IEJpZy5EUDtcclxuXHJcbiAgICAgICAgaWYgKGRwICE9PSB+fmRwIHx8IGRwIDwgMCB8fCBkcCA+IE1BWF9EUCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIUJpZy5EUCEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEVpdGhlciAwP1xyXG4gICAgICAgIGlmICghZHZkWzBdIHx8ICFkdnNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIElmIGJvdGggYXJlIDAsIHRocm93IE5hTlxyXG4gICAgICAgICAgICBpZiAoZHZkWzBdID09IGR2c1swXSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3dFcnIoTmFOKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gSWYgZHZzIGlzIDAsIHRocm93ICstSW5maW5pdHkuXHJcbiAgICAgICAgICAgIGlmICghZHZzWzBdKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvd0VycihzIC8gMCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGR2ZCBpcyAwLCByZXR1cm4gKy0wLlxyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEJpZyhzICogMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgZHZzTCwgZHZzVCwgbmV4dCwgY21wLCByZW1JLCB1LFxyXG4gICAgICAgICAgICBkdnNaID0gZHZzLnNsaWNlKCksXHJcbiAgICAgICAgICAgIGR2ZEkgPSBkdnNMID0gZHZzLmxlbmd0aCxcclxuICAgICAgICAgICAgZHZkTCA9IGR2ZC5sZW5ndGgsXHJcbiAgICAgICAgICAgIC8vIHJlbWFpbmRlclxyXG4gICAgICAgICAgICByZW0gPSBkdmQuc2xpY2UoMCwgZHZzTCksXHJcbiAgICAgICAgICAgIHJlbUwgPSByZW0ubGVuZ3RoLFxyXG4gICAgICAgICAgICAvLyBxdW90aWVudFxyXG4gICAgICAgICAgICBxID0geSxcclxuICAgICAgICAgICAgcWMgPSBxLmMgPSBbXSxcclxuICAgICAgICAgICAgcWkgPSAwLFxyXG4gICAgICAgICAgICBkaWdpdHMgPSBkcCArIChxLmUgPSB4LmUgLSB5LmUpICsgMTtcclxuXHJcbiAgICAgICAgcS5zID0gcztcclxuICAgICAgICBzID0gZGlnaXRzIDwgMCA/IDAgOiBkaWdpdHM7XHJcblxyXG4gICAgICAgIC8vIENyZWF0ZSB2ZXJzaW9uIG9mIGRpdmlzb3Igd2l0aCBsZWFkaW5nIHplcm8uXHJcbiAgICAgICAgZHZzWi51bnNoaWZ0KDApO1xyXG5cclxuICAgICAgICAvLyBBZGQgemVyb3MgdG8gbWFrZSByZW1haW5kZXIgYXMgbG9uZyBhcyBkaXZpc29yLlxyXG4gICAgICAgIGZvciAoOyByZW1MKysgPCBkdnNMOyByZW0ucHVzaCgwKSkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZG8ge1xyXG5cclxuICAgICAgICAgICAgLy8gJ25leHQnIGlzIGhvdyBtYW55IHRpbWVzIHRoZSBkaXZpc29yIGdvZXMgaW50byBjdXJyZW50IHJlbWFpbmRlci5cclxuICAgICAgICAgICAgZm9yIChuZXh0ID0gMDsgbmV4dCA8IDEwOyBuZXh0KyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDb21wYXJlIGRpdmlzb3IgYW5kIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgIGlmIChkdnNMICE9IChyZW1MID0gcmVtLmxlbmd0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBjbXAgPSBkdnNMID4gcmVtTCA/IDEgOiAtMTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAocmVtSSA9IC0xLCBjbXAgPSAwOyArK3JlbUkgPCBkdnNMOykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGR2c1tyZW1JXSAhPSByZW1bcmVtSV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNtcCA9IGR2c1tyZW1JXSA+IHJlbVtyZW1JXSA/IDEgOiAtMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIElmIGRpdmlzb3IgPCByZW1haW5kZXIsIHN1YnRyYWN0IGRpdmlzb3IgZnJvbSByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICBpZiAoY21wIDwgMCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBSZW1haW5kZXIgY2FuJ3QgYmUgbW9yZSB0aGFuIDEgZGlnaXQgbG9uZ2VyIHRoYW4gZGl2aXNvci5cclxuICAgICAgICAgICAgICAgICAgICAvLyBFcXVhbGlzZSBsZW5ndGhzIHVzaW5nIGRpdmlzb3Igd2l0aCBleHRyYSBsZWFkaW5nIHplcm8/XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChkdnNUID0gcmVtTCA9PSBkdnNMID8gZHZzIDogZHZzWjsgcmVtTDspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZW1bLS1yZW1MXSA8IGR2c1RbcmVtTF0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbUkgPSByZW1MO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoOyByZW1JICYmICFyZW1bLS1yZW1JXTsgcmVtW3JlbUldID0gOSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLS1yZW1bcmVtSV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1bcmVtTF0gKz0gMTA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVtW3JlbUxdIC09IGR2c1RbcmVtTF07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoOyAhcmVtWzBdOyByZW0uc2hpZnQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIEFkZCB0aGUgJ25leHQnIGRpZ2l0IHRvIHRoZSByZXN1bHQgYXJyYXkuXHJcbiAgICAgICAgICAgIHFjW3FpKytdID0gY21wID8gbmV4dCA6ICsrbmV4dDtcclxuXHJcbiAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICBpZiAocmVtWzBdICYmIGNtcCkge1xyXG4gICAgICAgICAgICAgICAgcmVtW3JlbUxdID0gZHZkW2R2ZEldIHx8IDA7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZW0gPSBbIGR2ZFtkdmRJXSBdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gd2hpbGUgKChkdmRJKysgPCBkdmRMIHx8IHJlbVswXSAhPT0gdSkgJiYgcy0tKTtcclxuXHJcbiAgICAgICAgLy8gTGVhZGluZyB6ZXJvPyBEbyBub3QgcmVtb3ZlIGlmIHJlc3VsdCBpcyBzaW1wbHkgemVybyAocWkgPT0gMSkuXHJcbiAgICAgICAgaWYgKCFxY1swXSAmJiBxaSAhPSAxKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBUaGVyZSBjYW4ndCBiZSBtb3JlIHRoYW4gb25lIHplcm8uXHJcbiAgICAgICAgICAgIHFjLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIHEuZS0tO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUm91bmQ/XHJcbiAgICAgICAgaWYgKHFpID4gZGlnaXRzKSB7XHJcbiAgICAgICAgICAgIHJuZChxLCBkcCwgQmlnLlJNLCByZW1bMF0gIT09IHUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHE7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGVxdWFsIHRvIHRoZSB2YWx1ZSBvZiBCaWcgeSxcclxuICAgICAqIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmVxID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICByZXR1cm4gIXRoaXMuY21wKHkpO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBncmVhdGVyIHRoYW4gdGhlIHZhbHVlIG9mIEJpZyB5LFxyXG4gICAgICogb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAuZ3QgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNtcCh5KSA+IDA7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byB0aGVcclxuICAgICAqIHZhbHVlIG9mIEJpZyB5LCBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5ndGUgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNtcCh5KSA+IC0xO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBsZXNzIHRoYW4gdGhlIHZhbHVlIG9mIEJpZyB5LFxyXG4gICAgICogb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAubHQgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNtcCh5KSA8IDA7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0byB0aGUgdmFsdWVcclxuICAgICAqIG9mIEJpZyB5LCBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5sdGUgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgICByZXR1cm4gdGhpcy5jbXAoeSkgPCAxO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIG1pbnVzIHRoZSB2YWx1ZVxyXG4gICAgICogb2YgQmlnIHkuXHJcbiAgICAgKi9cclxuICAgIFAuc3ViID0gUC5taW51cyA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIGksIGosIHQsIHhMVHksXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBhID0geC5zLFxyXG4gICAgICAgICAgICBiID0gKHkgPSBuZXcgQmlnKHkpKS5zO1xyXG5cclxuICAgICAgICAvLyBTaWducyBkaWZmZXI/XHJcbiAgICAgICAgaWYgKGEgIT0gYikge1xyXG4gICAgICAgICAgICB5LnMgPSAtYjtcclxuICAgICAgICAgICAgcmV0dXJuIHgucGx1cyh5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciB4YyA9IHguYy5zbGljZSgpLFxyXG4gICAgICAgICAgICB4ZSA9IHguZSxcclxuICAgICAgICAgICAgeWMgPSB5LmMsXHJcbiAgICAgICAgICAgIHllID0geS5lO1xyXG5cclxuICAgICAgICAvLyBFaXRoZXIgemVybz9cclxuICAgICAgICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xyXG5cclxuICAgICAgICAgICAgLy8geSBpcyBub24temVybz8geCBpcyBub24temVybz8gT3IgYm90aCBhcmUgemVyby5cclxuICAgICAgICAgICAgcmV0dXJuIHljWzBdID8gKHkucyA9IC1iLCB5KSA6IG5ldyBCaWcoeGNbMF0gPyB4IDogMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgd2hpY2ggaXMgdGhlIGJpZ2dlciBudW1iZXIuXHJcbiAgICAgICAgLy8gUHJlcGVuZCB6ZXJvcyB0byBlcXVhbGlzZSBleHBvbmVudHMuXHJcbiAgICAgICAgaWYgKGEgPSB4ZSAtIHllKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoeExUeSA9IGEgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBhID0gLWE7XHJcbiAgICAgICAgICAgICAgICB0ID0geGM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB5ZSA9IHhlO1xyXG4gICAgICAgICAgICAgICAgdCA9IHljO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgICAgICAgZm9yIChiID0gYTsgYi0tOyB0LnB1c2goMCkpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gRXhwb25lbnRzIGVxdWFsLiBDaGVjayBkaWdpdCBieSBkaWdpdC5cclxuICAgICAgICAgICAgaiA9ICgoeExUeSA9IHhjLmxlbmd0aCA8IHljLmxlbmd0aCkgPyB4YyA6IHljKS5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGEgPSBiID0gMDsgYiA8IGo7IGIrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh4Y1tiXSAhPSB5Y1tiXSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHhMVHkgPSB4Y1tiXSA8IHljW2JdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyB4IDwgeT8gUG9pbnQgeGMgdG8gdGhlIGFycmF5IG9mIHRoZSBiaWdnZXIgbnVtYmVyLlxyXG4gICAgICAgIGlmICh4TFR5KSB7XHJcbiAgICAgICAgICAgIHQgPSB4YztcclxuICAgICAgICAgICAgeGMgPSB5YztcclxuICAgICAgICAgICAgeWMgPSB0O1xyXG4gICAgICAgICAgICB5LnMgPSAteS5zO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBBcHBlbmQgemVyb3MgdG8geGMgaWYgc2hvcnRlci4gTm8gbmVlZCB0byBhZGQgemVyb3MgdG8geWMgaWYgc2hvcnRlclxyXG4gICAgICAgICAqIGFzIHN1YnRyYWN0aW9uIG9ubHkgbmVlZHMgdG8gc3RhcnQgYXQgeWMubGVuZ3RoLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGlmICgoIGIgPSAoaiA9IHljLmxlbmd0aCkgLSAoaSA9IHhjLmxlbmd0aCkgKSA+IDApIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAoOyBiLS07IHhjW2krK10gPSAwKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFN1YnRyYWN0IHljIGZyb20geGMuXHJcbiAgICAgICAgZm9yIChiID0gaTsgaiA+IGE7KXtcclxuXHJcbiAgICAgICAgICAgIGlmICh4Y1stLWpdIDwgeWNbal0pIHtcclxuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSBqOyBpICYmICF4Y1stLWldOyB4Y1tpXSA9IDkpIHtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC0teGNbaV07XHJcbiAgICAgICAgICAgICAgICB4Y1tqXSArPSAxMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB4Y1tqXSAtPSB5Y1tqXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKDsgeGNbLS1iXSA9PT0gMDsgeGMucG9wKCkpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBsZWFkaW5nIHplcm9zIGFuZCBhZGp1c3QgZXhwb25lbnQgYWNjb3JkaW5nbHkuXHJcbiAgICAgICAgZm9yICg7IHhjWzBdID09PSAwOykge1xyXG4gICAgICAgICAgICB4Yy5zaGlmdCgpO1xyXG4gICAgICAgICAgICAtLXllO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF4Y1swXSkge1xyXG5cclxuICAgICAgICAgICAgLy8gbiAtIG4gPSArMFxyXG4gICAgICAgICAgICB5LnMgPSAxO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVzdWx0IG11c3QgYmUgemVyby5cclxuICAgICAgICAgICAgeGMgPSBbeWUgPSAwXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHkuYyA9IHhjO1xyXG4gICAgICAgIHkuZSA9IHllO1xyXG5cclxuICAgICAgICByZXR1cm4geTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBtb2R1bG8gdGhlXHJcbiAgICAgKiB2YWx1ZSBvZiBCaWcgeS5cclxuICAgICAqL1xyXG4gICAgUC5tb2QgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciB5R1R4LFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgYSA9IHgucyxcclxuICAgICAgICAgICAgYiA9ICh5ID0gbmV3IEJpZyh5KSkucztcclxuXHJcbiAgICAgICAgaWYgKCF5LmNbMF0pIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoTmFOKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHgucyA9IHkucyA9IDE7XHJcbiAgICAgICAgeUdUeCA9IHkuY21wKHgpID09IDE7XHJcbiAgICAgICAgeC5zID0gYTtcclxuICAgICAgICB5LnMgPSBiO1xyXG5cclxuICAgICAgICBpZiAoeUdUeCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEJpZyh4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGEgPSBCaWcuRFA7XHJcbiAgICAgICAgYiA9IEJpZy5STTtcclxuICAgICAgICBCaWcuRFAgPSBCaWcuUk0gPSAwO1xyXG4gICAgICAgIHggPSB4LmRpdih5KTtcclxuICAgICAgICBCaWcuRFAgPSBhO1xyXG4gICAgICAgIEJpZy5STSA9IGI7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLm1pbnVzKCB4LnRpbWVzKHkpICk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgcGx1cyB0aGUgdmFsdWVcclxuICAgICAqIG9mIEJpZyB5LlxyXG4gICAgICovXHJcbiAgICBQLmFkZCA9IFAucGx1cyA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIHQsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBhID0geC5zLFxyXG4gICAgICAgICAgICBiID0gKHkgPSBuZXcgQmlnKHkpKS5zO1xyXG5cclxuICAgICAgICAvLyBTaWducyBkaWZmZXI/XHJcbiAgICAgICAgaWYgKGEgIT0gYikge1xyXG4gICAgICAgICAgICB5LnMgPSAtYjtcclxuICAgICAgICAgICAgcmV0dXJuIHgubWludXMoeSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgeGUgPSB4LmUsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICB5ZSA9IHkuZSxcclxuICAgICAgICAgICAgeWMgPSB5LmM7XHJcblxyXG4gICAgICAgIC8vIEVpdGhlciB6ZXJvP1xyXG4gICAgICAgIGlmICgheGNbMF0gfHwgIXljWzBdKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB5IGlzIG5vbi16ZXJvPyB4IGlzIG5vbi16ZXJvPyBPciBib3RoIGFyZSB6ZXJvLlxyXG4gICAgICAgICAgICByZXR1cm4geWNbMF0gPyB5IDogbmV3IEJpZyh4Y1swXSA/IHggOiBhICogMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHhjID0geGMuc2xpY2UoKTtcclxuXHJcbiAgICAgICAgLy8gUHJlcGVuZCB6ZXJvcyB0byBlcXVhbGlzZSBleHBvbmVudHMuXHJcbiAgICAgICAgLy8gTm90ZTogRmFzdGVyIHRvIHVzZSByZXZlcnNlIHRoZW4gZG8gdW5zaGlmdHMuXHJcbiAgICAgICAgaWYgKGEgPSB4ZSAtIHllKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoYSA+IDApIHtcclxuICAgICAgICAgICAgICAgIHllID0geGU7XHJcbiAgICAgICAgICAgICAgICB0ID0geWM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBhID0gLWE7XHJcbiAgICAgICAgICAgICAgICB0ID0geGM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG4gICAgICAgICAgICBmb3IgKDsgYS0tOyB0LnB1c2goMCkpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFBvaW50IHhjIHRvIHRoZSBsb25nZXIgYXJyYXkuXHJcbiAgICAgICAgaWYgKHhjLmxlbmd0aCAtIHljLmxlbmd0aCA8IDApIHtcclxuICAgICAgICAgICAgdCA9IHljO1xyXG4gICAgICAgICAgICB5YyA9IHhjO1xyXG4gICAgICAgICAgICB4YyA9IHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGEgPSB5Yy5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogT25seSBzdGFydCBhZGRpbmcgYXQgeWMubGVuZ3RoIC0gMSBhcyB0aGUgZnVydGhlciBkaWdpdHMgb2YgeGMgY2FuIGJlXHJcbiAgICAgICAgICogbGVmdCBhcyB0aGV5IGFyZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBmb3IgKGIgPSAwOyBhOykge1xyXG4gICAgICAgICAgICBiID0gKHhjWy0tYV0gPSB4Y1thXSArIHljW2FdICsgYikgLyAxMCB8IDA7XHJcbiAgICAgICAgICAgIHhjW2FdICU9IDEwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTm8gbmVlZCB0byBjaGVjayBmb3IgemVybywgYXMgK3ggKyAreSAhPSAwICYmIC14ICsgLXkgIT0gMFxyXG5cclxuICAgICAgICBpZiAoYikge1xyXG4gICAgICAgICAgICB4Yy51bnNoaWZ0KGIpO1xyXG4gICAgICAgICAgICArK3llO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKGEgPSB4Yy5sZW5ndGg7IHhjWy0tYV0gPT09IDA7IHhjLnBvcCgpKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB5LmMgPSB4YztcclxuICAgICAgICB5LmUgPSB5ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyByYWlzZWQgdG8gdGhlIHBvd2VyIG4uXHJcbiAgICAgKiBJZiBuIGlzIG5lZ2F0aXZlLCByb3VuZCwgaWYgbmVjZXNzYXJ5LCB0byBhIG1heGltdW0gb2YgQmlnLkRQIGRlY2ltYWxcclxuICAgICAqIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIEJpZy5STS5cclxuICAgICAqXHJcbiAgICAgKiBuIHtudW1iZXJ9IEludGVnZXIsIC1NQVhfUE9XRVIgdG8gTUFYX1BPV0VSIGluY2x1c2l2ZS5cclxuICAgICAqL1xyXG4gICAgUC5wb3cgPSBmdW5jdGlvbiAobikge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgICAgICAgb25lID0gbmV3IHguY29uc3RydWN0b3IoMSksXHJcbiAgICAgICAgICAgIHkgPSBvbmUsXHJcbiAgICAgICAgICAgIGlzTmVnID0gbiA8IDA7XHJcblxyXG4gICAgICAgIGlmIChuICE9PSB+fm4gfHwgbiA8IC1NQVhfUE9XRVIgfHwgbiA+IE1BWF9QT1dFUikge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXBvdyEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG4gPSBpc05lZyA/IC1uIDogbjtcclxuXHJcbiAgICAgICAgZm9yICg7Oykge1xyXG5cclxuICAgICAgICAgICAgaWYgKG4gJiAxKSB7XHJcbiAgICAgICAgICAgICAgICB5ID0geS50aW1lcyh4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBuID4+PSAxO1xyXG5cclxuICAgICAgICAgICAgaWYgKCFuKSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB4ID0geC50aW1lcyh4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBpc05lZyA/IG9uZS5kaXYoeSkgOiB5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHJvdW5kZWQgdG8gYVxyXG4gICAgICogbWF4aW11bSBvZiBkcCBkZWNpbWFsIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIHJtLlxyXG4gICAgICogSWYgZHAgaXMgbm90IHNwZWNpZmllZCwgcm91bmQgdG8gMCBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAqIElmIHJtIGlzIG5vdCBzcGVjaWZpZWQsIHVzZSBCaWcuUk0uXHJcbiAgICAgKlxyXG4gICAgICogW2RwXSB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKiBbcm1dIDAsIDEsIDIgb3IgMyAoUk9VTkRfRE9XTiwgUk9VTkRfSEFMRl9VUCwgUk9VTkRfSEFMRl9FVkVOLCBST1VORF9VUClcclxuICAgICAqL1xyXG4gICAgUC5yb3VuZCA9IGZ1bmN0aW9uIChkcCwgcm0pIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3I7XHJcblxyXG4gICAgICAgIGlmIChkcCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGRwID0gMDtcclxuICAgICAgICB9IGVsc2UgaWYgKGRwICE9PSB+fmRwIHx8IGRwIDwgMCB8fCBkcCA+IE1BWF9EUCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXJvdW5kIScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBybmQoeCA9IG5ldyBCaWcoeCksIGRwLCBybSA9PSBudWxsID8gQmlnLlJNIDogcm0pO1xyXG5cclxuICAgICAgICByZXR1cm4geDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSBzcXVhcmUgcm9vdCBvZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcsXHJcbiAgICAgKiByb3VuZGVkLCBpZiBuZWNlc3NhcnksIHRvIGEgbWF4aW11bSBvZiBCaWcuRFAgZGVjaW1hbCBwbGFjZXMgdXNpbmdcclxuICAgICAqIHJvdW5kaW5nIG1vZGUgQmlnLlJNLlxyXG4gICAgICovXHJcbiAgICBQLnNxcnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGVzdGltYXRlLCByLCBhcHByb3gsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgaSA9IHgucyxcclxuICAgICAgICAgICAgZSA9IHguZSxcclxuICAgICAgICAgICAgaGFsZiA9IG5ldyBCaWcoJzAuNScpO1xyXG5cclxuICAgICAgICAvLyBaZXJvP1xyXG4gICAgICAgIGlmICgheGNbMF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWcoeCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJZiBuZWdhdGl2ZSwgdGhyb3cgTmFOLlxyXG4gICAgICAgIGlmIChpIDwgMCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycihOYU4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRXN0aW1hdGUuXHJcbiAgICAgICAgaSA9IE1hdGguc3FydCh4LnRvU3RyaW5nKCkpO1xyXG5cclxuICAgICAgICAvLyBNYXRoLnNxcnQgdW5kZXJmbG93L292ZXJmbG93P1xyXG4gICAgICAgIC8vIFBhc3MgeCB0byBNYXRoLnNxcnQgYXMgaW50ZWdlciwgdGhlbiBhZGp1c3QgdGhlIHJlc3VsdCBleHBvbmVudC5cclxuICAgICAgICBpZiAoaSA9PT0gMCB8fCBpID09PSAxIC8gMCkge1xyXG4gICAgICAgICAgICBlc3RpbWF0ZSA9IHhjLmpvaW4oJycpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCEoZXN0aW1hdGUubGVuZ3RoICsgZSAmIDEpKSB7XHJcbiAgICAgICAgICAgICAgICBlc3RpbWF0ZSArPSAnMCc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHIgPSBuZXcgQmlnKCBNYXRoLnNxcnQoZXN0aW1hdGUpLnRvU3RyaW5nKCkgKTtcclxuICAgICAgICAgICAgci5lID0gKChlICsgMSkgLyAyIHwgMCkgLSAoZSA8IDAgfHwgZSAmIDEpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHIgPSBuZXcgQmlnKGkudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpID0gci5lICsgKEJpZy5EUCArPSA0KTtcclxuXHJcbiAgICAgICAgLy8gTmV3dG9uLVJhcGhzb24gaXRlcmF0aW9uLlxyXG4gICAgICAgIGRvIHtcclxuICAgICAgICAgICAgYXBwcm94ID0gcjtcclxuICAgICAgICAgICAgciA9IGhhbGYudGltZXMoIGFwcHJveC5wbHVzKCB4LmRpdihhcHByb3gpICkgKTtcclxuICAgICAgICB9IHdoaWxlICggYXBwcm94LmMuc2xpY2UoMCwgaSkuam9pbignJykgIT09XHJcbiAgICAgICAgICAgICAgICAgICAgICAgci5jLnNsaWNlKDAsIGkpLmpvaW4oJycpICk7XHJcblxyXG4gICAgICAgIHJuZChyLCBCaWcuRFAgLT0gNCwgQmlnLlJNKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHI7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgdGltZXMgdGhlIHZhbHVlIG9mXHJcbiAgICAgKiBCaWcgeS5cclxuICAgICAqL1xyXG4gICAgUC5tdWwgPSBQLnRpbWVzID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgYyxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICB5YyA9ICh5ID0gbmV3IEJpZyh5KSkuYyxcclxuICAgICAgICAgICAgYSA9IHhjLmxlbmd0aCxcclxuICAgICAgICAgICAgYiA9IHljLmxlbmd0aCxcclxuICAgICAgICAgICAgaSA9IHguZSxcclxuICAgICAgICAgICAgaiA9IHkuZTtcclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHNpZ24gb2YgcmVzdWx0LlxyXG4gICAgICAgIHkucyA9IHgucyA9PSB5LnMgPyAxIDogLTE7XHJcblxyXG4gICAgICAgIC8vIFJldHVybiBzaWduZWQgMCBpZiBlaXRoZXIgMC5cclxuICAgICAgICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEJpZyh5LnMgKiAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpc2UgZXhwb25lbnQgb2YgcmVzdWx0IGFzIHguZSArIHkuZS5cclxuICAgICAgICB5LmUgPSBpICsgajtcclxuXHJcbiAgICAgICAgLy8gSWYgYXJyYXkgeGMgaGFzIGZld2VyIGRpZ2l0cyB0aGFuIHljLCBzd2FwIHhjIGFuZCB5YywgYW5kIGxlbmd0aHMuXHJcbiAgICAgICAgaWYgKGEgPCBiKSB7XHJcbiAgICAgICAgICAgIGMgPSB4YztcclxuICAgICAgICAgICAgeGMgPSB5YztcclxuICAgICAgICAgICAgeWMgPSBjO1xyXG4gICAgICAgICAgICBqID0gYTtcclxuICAgICAgICAgICAgYSA9IGI7XHJcbiAgICAgICAgICAgIGIgPSBqO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGlzZSBjb2VmZmljaWVudCBhcnJheSBvZiByZXN1bHQgd2l0aCB6ZXJvcy5cclxuICAgICAgICBmb3IgKGMgPSBuZXcgQXJyYXkoaiA9IGEgKyBiKTsgai0tOyBjW2pdID0gMCkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTXVsdGlwbHkuXHJcblxyXG4gICAgICAgIC8vIGkgaXMgaW5pdGlhbGx5IHhjLmxlbmd0aC5cclxuICAgICAgICBmb3IgKGkgPSBiOyBpLS07KSB7XHJcbiAgICAgICAgICAgIGIgPSAwO1xyXG5cclxuICAgICAgICAgICAgLy8gYSBpcyB5Yy5sZW5ndGguXHJcbiAgICAgICAgICAgIGZvciAoaiA9IGEgKyBpOyBqID4gaTspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDdXJyZW50IHN1bSBvZiBwcm9kdWN0cyBhdCB0aGlzIGRpZ2l0IHBvc2l0aW9uLCBwbHVzIGNhcnJ5LlxyXG4gICAgICAgICAgICAgICAgYiA9IGNbal0gKyB5Y1tpXSAqIHhjW2ogLSBpIC0gMV0gKyBiO1xyXG4gICAgICAgICAgICAgICAgY1tqLS1dID0gYiAlIDEwO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGNhcnJ5XHJcbiAgICAgICAgICAgICAgICBiID0gYiAvIDEwIHwgMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjW2pdID0gKGNbal0gKyBiKSAlIDEwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSW5jcmVtZW50IHJlc3VsdCBleHBvbmVudCBpZiB0aGVyZSBpcyBhIGZpbmFsIGNhcnJ5LlxyXG4gICAgICAgIGlmIChiKSB7XHJcbiAgICAgICAgICAgICsreS5lO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIGFueSBsZWFkaW5nIHplcm8uXHJcbiAgICAgICAgaWYgKCFjWzBdKSB7XHJcbiAgICAgICAgICAgIGMuc2hpZnQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKGkgPSBjLmxlbmd0aDsgIWNbLS1pXTsgYy5wb3AoKSkge1xyXG4gICAgICAgIH1cclxuICAgICAgICB5LmMgPSBjO1xyXG5cclxuICAgICAgICByZXR1cm4geTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZy5cclxuICAgICAqIFJldHVybiBleHBvbmVudGlhbCBub3RhdGlvbiBpZiB0aGlzIEJpZyBoYXMgYSBwb3NpdGl2ZSBleHBvbmVudCBlcXVhbCB0b1xyXG4gICAgICogb3IgZ3JlYXRlciB0aGFuIEJpZy5FX1BPUywgb3IgYSBuZWdhdGl2ZSBleHBvbmVudCBlcXVhbCB0byBvciBsZXNzIHRoYW5cclxuICAgICAqIEJpZy5FX05FRy5cclxuICAgICAqL1xyXG4gICAgUC50b1N0cmluZyA9IFAudmFsdWVPZiA9IFAudG9KU09OID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgZSA9IHguZSxcclxuICAgICAgICAgICAgc3RyID0geC5jLmpvaW4oJycpLFxyXG4gICAgICAgICAgICBzdHJMID0gc3RyLmxlbmd0aDtcclxuXHJcbiAgICAgICAgLy8gRXhwb25lbnRpYWwgbm90YXRpb24/XHJcbiAgICAgICAgaWYgKGUgPD0gQmlnLkVfTkVHIHx8IGUgPj0gQmlnLkVfUE9TKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IHN0ci5jaGFyQXQoMCkgKyAoc3RyTCA+IDEgPyAnLicgKyBzdHIuc2xpY2UoMSkgOiAnJykgK1xyXG4gICAgICAgICAgICAgIChlIDwgMCA/ICdlJyA6ICdlKycpICsgZTtcclxuXHJcbiAgICAgICAgLy8gTmVnYXRpdmUgZXhwb25lbnQ/XHJcbiAgICAgICAgfSBlbHNlIGlmIChlIDwgMCkge1xyXG5cclxuICAgICAgICAgICAgLy8gUHJlcGVuZCB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yICg7ICsrZTsgc3RyID0gJzAnICsgc3RyKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3RyID0gJzAuJyArIHN0cjtcclxuXHJcbiAgICAgICAgLy8gUG9zaXRpdmUgZXhwb25lbnQ/XHJcbiAgICAgICAgfSBlbHNlIGlmIChlID4gMCkge1xyXG5cclxuICAgICAgICAgICAgaWYgKCsrZSA+IHN0ckwpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBBcHBlbmQgemVyb3MuXHJcbiAgICAgICAgICAgICAgICBmb3IgKGUgLT0gc3RyTDsgZS0tIDsgc3RyICs9ICcwJykge1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGUgPCBzdHJMKSB7XHJcbiAgICAgICAgICAgICAgICBzdHIgPSBzdHIuc2xpY2UoMCwgZSkgKyAnLicgKyBzdHIuc2xpY2UoZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRXhwb25lbnQgemVyby5cclxuICAgICAgICB9IGVsc2UgaWYgKHN0ckwgPiAxKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IHN0ci5jaGFyQXQoMCkgKyAnLicgKyBzdHIuc2xpY2UoMSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBdm9pZCAnLTAnXHJcbiAgICAgICAgcmV0dXJuIHgucyA8IDAgJiYgeC5jWzBdID8gJy0nICsgc3RyIDogc3RyO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAqIElmIHRvRXhwb25lbnRpYWwsIHRvRml4ZWQsIHRvUHJlY2lzaW9uIGFuZCBmb3JtYXQgYXJlIG5vdCByZXF1aXJlZCB0aGV5XHJcbiAgICAgKiBjYW4gc2FmZWx5IGJlIGNvbW1lbnRlZC1vdXQgb3IgZGVsZXRlZC4gTm8gcmVkdW5kYW50IGNvZGUgd2lsbCBiZSBsZWZ0LlxyXG4gICAgICogZm9ybWF0IGlzIHVzZWQgb25seSBieSB0b0V4cG9uZW50aWFsLCB0b0ZpeGVkIGFuZCB0b1ByZWNpc2lvbi5cclxuICAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuICAgICAqL1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaW4gZXhwb25lbnRpYWxcclxuICAgICAqIG5vdGF0aW9uIHRvIGRwIGZpeGVkIGRlY2ltYWwgcGxhY2VzIGFuZCByb3VuZGVkLCBpZiBuZWNlc3NhcnksIHVzaW5nXHJcbiAgICAgKiBCaWcuUk0uXHJcbiAgICAgKlxyXG4gICAgICogW2RwXSB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKi9cclxuICAgIFAudG9FeHBvbmVudGlhbCA9IGZ1bmN0aW9uIChkcCkge1xyXG5cclxuICAgICAgICBpZiAoZHAgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBkcCA9IHRoaXMuYy5sZW5ndGggLSAxO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZHAgIT09IH5+ZHAgfHwgZHAgPCAwIHx8IGRwID4gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchdG9FeHAhJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZm9ybWF0KHRoaXMsIGRwLCAxKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpbiBub3JtYWwgbm90YXRpb25cclxuICAgICAqIHRvIGRwIGZpeGVkIGRlY2ltYWwgcGxhY2VzIGFuZCByb3VuZGVkLCBpZiBuZWNlc3NhcnksIHVzaW5nIEJpZy5STS5cclxuICAgICAqXHJcbiAgICAgKiBbZHBdIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqL1xyXG4gICAgUC50b0ZpeGVkID0gZnVuY3Rpb24gKGRwKSB7XHJcbiAgICAgICAgdmFyIHN0cixcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIG5lZyA9IEJpZy5FX05FRyxcclxuICAgICAgICAgICAgcG9zID0gQmlnLkVfUE9TO1xyXG5cclxuICAgICAgICAvLyBQcmV2ZW50IHRoZSBwb3NzaWJpbGl0eSBvZiBleHBvbmVudGlhbCBub3RhdGlvbi5cclxuICAgICAgICBCaWcuRV9ORUcgPSAtKEJpZy5FX1BPUyA9IDEgLyAwKTtcclxuXHJcbiAgICAgICAgaWYgKGRwID09IG51bGwpIHtcclxuICAgICAgICAgICAgc3RyID0geC50b1N0cmluZygpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZHAgPT09IH5+ZHAgJiYgZHAgPj0gMCAmJiBkcCA8PSBNQVhfRFApIHtcclxuICAgICAgICAgICAgc3RyID0gZm9ybWF0KHgsIHguZSArIGRwKTtcclxuXHJcbiAgICAgICAgICAgIC8vICgtMCkudG9GaXhlZCgpIGlzICcwJywgYnV0ICgtMC4xKS50b0ZpeGVkKCkgaXMgJy0wJy5cclxuICAgICAgICAgICAgLy8gKC0wKS50b0ZpeGVkKDEpIGlzICcwLjAnLCBidXQgKC0wLjAxKS50b0ZpeGVkKDEpIGlzICctMC4wJy5cclxuICAgICAgICAgICAgaWYgKHgucyA8IDAgJiYgeC5jWzBdICYmIHN0ci5pbmRleE9mKCctJykgPCAwKSB7XHJcbiAgICAgICAgLy9FLmcuIC0wLjUgaWYgcm91bmRlZCB0byAtMCB3aWxsIGNhdXNlIHRvU3RyaW5nIHRvIG9taXQgdGhlIG1pbnVzIHNpZ24uXHJcbiAgICAgICAgICAgICAgICBzdHIgPSAnLScgKyBzdHI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgQmlnLkVfTkVHID0gbmVnO1xyXG4gICAgICAgIEJpZy5FX1BPUyA9IHBvcztcclxuXHJcbiAgICAgICAgaWYgKCFzdHIpIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyF0b0ZpeCEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzdHI7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgcm91bmRlZCB0byBzZFxyXG4gICAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHVzaW5nIEJpZy5STS4gVXNlIGV4cG9uZW50aWFsIG5vdGF0aW9uIGlmIHNkIGlzIGxlc3NcclxuICAgICAqIHRoYW4gdGhlIG51bWJlciBvZiBkaWdpdHMgbmVjZXNzYXJ5IHRvIHJlcHJlc2VudCB0aGUgaW50ZWdlciBwYXJ0IG9mIHRoZVxyXG4gICAgICogdmFsdWUgaW4gbm9ybWFsIG5vdGF0aW9uLlxyXG4gICAgICpcclxuICAgICAqIHNkIHtudW1iZXJ9IEludGVnZXIsIDEgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqL1xyXG4gICAgUC50b1ByZWNpc2lvbiA9IGZ1bmN0aW9uIChzZCkge1xyXG5cclxuICAgICAgICBpZiAoc2QgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50b1N0cmluZygpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc2QgIT09IH5+c2QgfHwgc2QgPCAxIHx8IHNkID4gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchdG9QcmUhJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZm9ybWF0KHRoaXMsIHNkIC0gMSwgMik7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvLyBFeHBvcnRcclxuXHJcblxyXG4gICAgQmlnID0gYmlnRmFjdG9yeSgpO1xyXG5cclxuICAgIC8vQU1ELlxyXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgICAgIGRlZmluZShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBCaWc7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgLy8gTm9kZSBhbmQgb3RoZXIgQ29tbW9uSlMtbGlrZSBlbnZpcm9ubWVudHMgdGhhdCBzdXBwb3J0IG1vZHVsZS5leHBvcnRzLlxyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xyXG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gQmlnO1xyXG5cclxuICAgIC8vQnJvd3Nlci5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZ2xvYmFsLkJpZyA9IEJpZztcclxuICAgIH1cclxufSkodGhpcyk7XHJcbiIsIjsoZnVuY3Rpb24gKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0LyoqXG5cdCAqIEBwcmVzZXJ2ZSBGYXN0Q2xpY2s6IHBvbHlmaWxsIHRvIHJlbW92ZSBjbGljayBkZWxheXMgb24gYnJvd3NlcnMgd2l0aCB0b3VjaCBVSXMuXG5cdCAqXG5cdCAqIEBjb2RpbmdzdGFuZGFyZCBmdGxhYnMtanN2MlxuXHQgKiBAY29weXJpZ2h0IFRoZSBGaW5hbmNpYWwgVGltZXMgTGltaXRlZCBbQWxsIFJpZ2h0cyBSZXNlcnZlZF1cblx0ICogQGxpY2Vuc2UgTUlUIExpY2Vuc2UgKHNlZSBMSUNFTlNFLnR4dClcblx0ICovXG5cblx0Lypqc2xpbnQgYnJvd3Nlcjp0cnVlLCBub2RlOnRydWUqL1xuXHQvKmdsb2JhbCBkZWZpbmUsIEV2ZW50LCBOb2RlKi9cblxuXG5cdC8qKlxuXHQgKiBJbnN0YW50aWF0ZSBmYXN0LWNsaWNraW5nIGxpc3RlbmVycyBvbiB0aGUgc3BlY2lmaWVkIGxheWVyLlxuXHQgKlxuXHQgKiBAY29uc3RydWN0b3Jcblx0ICogQHBhcmFtIHtFbGVtZW50fSBsYXllciBUaGUgbGF5ZXIgdG8gbGlzdGVuIG9uXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gVGhlIG9wdGlvbnMgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHRzXG5cdCAqL1xuXHRmdW5jdGlvbiBGYXN0Q2xpY2sobGF5ZXIsIG9wdGlvbnMpIHtcblx0XHR2YXIgb2xkT25DbGljaztcblxuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0LyoqXG5cdFx0ICogV2hldGhlciBhIGNsaWNrIGlzIGN1cnJlbnRseSBiZWluZyB0cmFja2VkLlxuXHRcdCAqXG5cdFx0ICogQHR5cGUgYm9vbGVhblxuXHRcdCAqL1xuXHRcdHRoaXMudHJhY2tpbmdDbGljayA9IGZhbHNlO1xuXG5cblx0XHQvKipcblx0XHQgKiBUaW1lc3RhbXAgZm9yIHdoZW4gY2xpY2sgdHJhY2tpbmcgc3RhcnRlZC5cblx0XHQgKlxuXHRcdCAqIEB0eXBlIG51bWJlclxuXHRcdCAqL1xuXHRcdHRoaXMudHJhY2tpbmdDbGlja1N0YXJ0ID0gMDtcblxuXG5cdFx0LyoqXG5cdFx0ICogVGhlIGVsZW1lbnQgYmVpbmcgdHJhY2tlZCBmb3IgYSBjbGljay5cblx0XHQgKlxuXHRcdCAqIEB0eXBlIEV2ZW50VGFyZ2V0XG5cdFx0ICovXG5cdFx0dGhpcy50YXJnZXRFbGVtZW50ID0gbnVsbDtcblxuXG5cdFx0LyoqXG5cdFx0ICogWC1jb29yZGluYXRlIG9mIHRvdWNoIHN0YXJ0IGV2ZW50LlxuXHRcdCAqXG5cdFx0ICogQHR5cGUgbnVtYmVyXG5cdFx0ICovXG5cdFx0dGhpcy50b3VjaFN0YXJ0WCA9IDA7XG5cblxuXHRcdC8qKlxuXHRcdCAqIFktY29vcmRpbmF0ZSBvZiB0b3VjaCBzdGFydCBldmVudC5cblx0XHQgKlxuXHRcdCAqIEB0eXBlIG51bWJlclxuXHRcdCAqL1xuXHRcdHRoaXMudG91Y2hTdGFydFkgPSAwO1xuXG5cblx0XHQvKipcblx0XHQgKiBJRCBvZiB0aGUgbGFzdCB0b3VjaCwgcmV0cmlldmVkIGZyb20gVG91Y2guaWRlbnRpZmllci5cblx0XHQgKlxuXHRcdCAqIEB0eXBlIG51bWJlclxuXHRcdCAqL1xuXHRcdHRoaXMubGFzdFRvdWNoSWRlbnRpZmllciA9IDA7XG5cblxuXHRcdC8qKlxuXHRcdCAqIFRvdWNobW92ZSBib3VuZGFyeSwgYmV5b25kIHdoaWNoIGEgY2xpY2sgd2lsbCBiZSBjYW5jZWxsZWQuXG5cdFx0ICpcblx0XHQgKiBAdHlwZSBudW1iZXJcblx0XHQgKi9cblx0XHR0aGlzLnRvdWNoQm91bmRhcnkgPSBvcHRpb25zLnRvdWNoQm91bmRhcnkgfHwgMTA7XG5cblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBGYXN0Q2xpY2sgbGF5ZXIuXG5cdFx0ICpcblx0XHQgKiBAdHlwZSBFbGVtZW50XG5cdFx0ICovXG5cdFx0dGhpcy5sYXllciA9IGxheWVyO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIG1pbmltdW0gdGltZSBiZXR3ZWVuIHRhcCh0b3VjaHN0YXJ0IGFuZCB0b3VjaGVuZCkgZXZlbnRzXG5cdFx0ICpcblx0XHQgKiBAdHlwZSBudW1iZXJcblx0XHQgKi9cblx0XHR0aGlzLnRhcERlbGF5ID0gb3B0aW9ucy50YXBEZWxheSB8fCAyMDA7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgbWF4aW11bSB0aW1lIGZvciBhIHRhcFxuXHRcdCAqXG5cdFx0ICogQHR5cGUgbnVtYmVyXG5cdFx0ICovXG5cdFx0dGhpcy50YXBUaW1lb3V0ID0gb3B0aW9ucy50YXBUaW1lb3V0IHx8IDcwMDtcblxuXHRcdGlmIChGYXN0Q2xpY2subm90TmVlZGVkKGxheWVyKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIFNvbWUgb2xkIHZlcnNpb25zIG9mIEFuZHJvaWQgZG9uJ3QgaGF2ZSBGdW5jdGlvbi5wcm90b3R5cGUuYmluZFxuXHRcdGZ1bmN0aW9uIGJpbmQobWV0aG9kLCBjb250ZXh0KSB7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKSB7IHJldHVybiBtZXRob2QuYXBwbHkoY29udGV4dCwgYXJndW1lbnRzKTsgfTtcblx0XHR9XG5cblxuXHRcdHZhciBtZXRob2RzID0gWydvbk1vdXNlJywgJ29uQ2xpY2snLCAnb25Ub3VjaFN0YXJ0JywgJ29uVG91Y2hNb3ZlJywgJ29uVG91Y2hFbmQnLCAnb25Ub3VjaENhbmNlbCddO1xuXHRcdHZhciBjb250ZXh0ID0gdGhpcztcblx0XHRmb3IgKHZhciBpID0gMCwgbCA9IG1ldGhvZHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdFx0XHRjb250ZXh0W21ldGhvZHNbaV1dID0gYmluZChjb250ZXh0W21ldGhvZHNbaV1dLCBjb250ZXh0KTtcblx0XHR9XG5cblx0XHQvLyBTZXQgdXAgZXZlbnQgaGFuZGxlcnMgYXMgcmVxdWlyZWRcblx0XHRpZiAoZGV2aWNlSXNBbmRyb2lkKSB7XG5cdFx0XHRsYXllci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCB0aGlzLm9uTW91c2UsIHRydWUpO1xuXHRcdFx0bGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5vbk1vdXNlLCB0cnVlKTtcblx0XHRcdGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uTW91c2UsIHRydWUpO1xuXHRcdH1cblxuXHRcdGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vbkNsaWNrLCB0cnVlKTtcblx0XHRsYXllci5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5vblRvdWNoU3RhcnQsIGZhbHNlKTtcblx0XHRsYXllci5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLm9uVG91Y2hNb3ZlLCBmYWxzZSk7XG5cdFx0bGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLm9uVG91Y2hFbmQsIGZhbHNlKTtcblx0XHRsYXllci5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIHRoaXMub25Ub3VjaENhbmNlbCwgZmFsc2UpO1xuXG5cdFx0Ly8gSGFjayBpcyByZXF1aXJlZCBmb3IgYnJvd3NlcnMgdGhhdCBkb24ndCBzdXBwb3J0IEV2ZW50I3N0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbiAoZS5nLiBBbmRyb2lkIDIpXG5cdFx0Ly8gd2hpY2ggaXMgaG93IEZhc3RDbGljayBub3JtYWxseSBzdG9wcyBjbGljayBldmVudHMgYnViYmxpbmcgdG8gY2FsbGJhY2tzIHJlZ2lzdGVyZWQgb24gdGhlIEZhc3RDbGlja1xuXHRcdC8vIGxheWVyIHdoZW4gdGhleSBhcmUgY2FuY2VsbGVkLlxuXHRcdGlmICghRXZlbnQucHJvdG90eXBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbikge1xuXHRcdFx0bGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGNhbGxiYWNrLCBjYXB0dXJlKSB7XG5cdFx0XHRcdHZhciBybXYgPSBOb2RlLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyO1xuXHRcdFx0XHRpZiAodHlwZSA9PT0gJ2NsaWNrJykge1xuXHRcdFx0XHRcdHJtdi5jYWxsKGxheWVyLCB0eXBlLCBjYWxsYmFjay5oaWphY2tlZCB8fCBjYWxsYmFjaywgY2FwdHVyZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cm12LmNhbGwobGF5ZXIsIHR5cGUsIGNhbGxiYWNrLCBjYXB0dXJlKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0bGF5ZXIuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGNhbGxiYWNrLCBjYXB0dXJlKSB7XG5cdFx0XHRcdHZhciBhZHYgPSBOb2RlLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyO1xuXHRcdFx0XHRpZiAodHlwZSA9PT0gJ2NsaWNrJykge1xuXHRcdFx0XHRcdGFkdi5jYWxsKGxheWVyLCB0eXBlLCBjYWxsYmFjay5oaWphY2tlZCB8fCAoY2FsbGJhY2suaGlqYWNrZWQgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0XHRcdFx0aWYgKCFldmVudC5wcm9wYWdhdGlvblN0b3BwZWQpIHtcblx0XHRcdFx0XHRcdFx0Y2FsbGJhY2soZXZlbnQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pLCBjYXB0dXJlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRhZHYuY2FsbChsYXllciwgdHlwZSwgY2FsbGJhY2ssIGNhcHR1cmUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdC8vIElmIGEgaGFuZGxlciBpcyBhbHJlYWR5IGRlY2xhcmVkIGluIHRoZSBlbGVtZW50J3Mgb25jbGljayBhdHRyaWJ1dGUsIGl0IHdpbGwgYmUgZmlyZWQgYmVmb3JlXG5cdFx0Ly8gRmFzdENsaWNrJ3Mgb25DbGljayBoYW5kbGVyLiBGaXggdGhpcyBieSBwdWxsaW5nIG91dCB0aGUgdXNlci1kZWZpbmVkIGhhbmRsZXIgZnVuY3Rpb24gYW5kXG5cdFx0Ly8gYWRkaW5nIGl0IGFzIGxpc3RlbmVyLlxuXHRcdGlmICh0eXBlb2YgbGF5ZXIub25jbGljayA9PT0gJ2Z1bmN0aW9uJykge1xuXG5cdFx0XHQvLyBBbmRyb2lkIGJyb3dzZXIgb24gYXQgbGVhc3QgMy4yIHJlcXVpcmVzIGEgbmV3IHJlZmVyZW5jZSB0byB0aGUgZnVuY3Rpb24gaW4gbGF5ZXIub25jbGlja1xuXHRcdFx0Ly8gLSB0aGUgb2xkIG9uZSB3b24ndCB3b3JrIGlmIHBhc3NlZCB0byBhZGRFdmVudExpc3RlbmVyIGRpcmVjdGx5LlxuXHRcdFx0b2xkT25DbGljayA9IGxheWVyLm9uY2xpY2s7XG5cdFx0XHRsYXllci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdG9sZE9uQ2xpY2soZXZlbnQpO1xuXHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0bGF5ZXIub25jbGljayA9IG51bGw7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCogV2luZG93cyBQaG9uZSA4LjEgZmFrZXMgdXNlciBhZ2VudCBzdHJpbmcgdG8gbG9vayBsaWtlIEFuZHJvaWQgYW5kIGlQaG9uZS5cblx0KlxuXHQqIEB0eXBlIGJvb2xlYW5cblx0Ki9cblx0dmFyIGRldmljZUlzV2luZG93c1Bob25lID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKFwiV2luZG93cyBQaG9uZVwiKSA+PSAwO1xuXG5cdC8qKlxuXHQgKiBBbmRyb2lkIHJlcXVpcmVzIGV4Y2VwdGlvbnMuXG5cdCAqXG5cdCAqIEB0eXBlIGJvb2xlYW5cblx0ICovXG5cdHZhciBkZXZpY2VJc0FuZHJvaWQgPSBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ0FuZHJvaWQnKSA+IDAgJiYgIWRldmljZUlzV2luZG93c1Bob25lO1xuXG5cblx0LyoqXG5cdCAqIGlPUyByZXF1aXJlcyBleGNlcHRpb25zLlxuXHQgKlxuXHQgKiBAdHlwZSBib29sZWFuXG5cdCAqL1xuXHR2YXIgZGV2aWNlSXNJT1MgPSAvaVAoYWR8aG9uZXxvZCkvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgJiYgIWRldmljZUlzV2luZG93c1Bob25lO1xuXG5cblx0LyoqXG5cdCAqIGlPUyA0IHJlcXVpcmVzIGFuIGV4Y2VwdGlvbiBmb3Igc2VsZWN0IGVsZW1lbnRzLlxuXHQgKlxuXHQgKiBAdHlwZSBib29sZWFuXG5cdCAqL1xuXHR2YXIgZGV2aWNlSXNJT1M0ID0gZGV2aWNlSXNJT1MgJiYgKC9PUyA0X1xcZChfXFxkKT8vKS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuXG5cblx0LyoqXG5cdCAqIGlPUyA2LjAtNy4qIHJlcXVpcmVzIHRoZSB0YXJnZXQgZWxlbWVudCB0byBiZSBtYW51YWxseSBkZXJpdmVkXG5cdCAqXG5cdCAqIEB0eXBlIGJvb2xlYW5cblx0ICovXG5cdHZhciBkZXZpY2VJc0lPU1dpdGhCYWRUYXJnZXQgPSBkZXZpY2VJc0lPUyAmJiAoL09TIFs2LTddX1xcZC8pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG5cblx0LyoqXG5cdCAqIEJsYWNrQmVycnkgcmVxdWlyZXMgZXhjZXB0aW9ucy5cblx0ICpcblx0ICogQHR5cGUgYm9vbGVhblxuXHQgKi9cblx0dmFyIGRldmljZUlzQmxhY2tCZXJyeTEwID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdCQjEwJykgPiAwO1xuXG5cdC8qKlxuXHQgKiBEZXRlcm1pbmUgd2hldGhlciBhIGdpdmVuIGVsZW1lbnQgcmVxdWlyZXMgYSBuYXRpdmUgY2xpY2suXG5cdCAqXG5cdCAqIEBwYXJhbSB7RXZlbnRUYXJnZXR8RWxlbWVudH0gdGFyZ2V0IFRhcmdldCBET00gZWxlbWVudFxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyB0cnVlIGlmIHRoZSBlbGVtZW50IG5lZWRzIGEgbmF0aXZlIGNsaWNrXG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLm5lZWRzQ2xpY2sgPSBmdW5jdGlvbih0YXJnZXQpIHtcblx0XHRzd2l0Y2ggKHRhcmdldC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpKSB7XG5cblx0XHQvLyBEb24ndCBzZW5kIGEgc3ludGhldGljIGNsaWNrIHRvIGRpc2FibGVkIGlucHV0cyAoaXNzdWUgIzYyKVxuXHRcdGNhc2UgJ2J1dHRvbic6XG5cdFx0Y2FzZSAnc2VsZWN0Jzpcblx0XHRjYXNlICd0ZXh0YXJlYSc6XG5cdFx0XHRpZiAodGFyZ2V0LmRpc2FibGVkKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRicmVhaztcblx0XHRjYXNlICdpbnB1dCc6XG5cblx0XHRcdC8vIEZpbGUgaW5wdXRzIG5lZWQgcmVhbCBjbGlja3Mgb24gaU9TIDYgZHVlIHRvIGEgYnJvd3NlciBidWcgKGlzc3VlICM2OClcblx0XHRcdGlmICgoZGV2aWNlSXNJT1MgJiYgdGFyZ2V0LnR5cGUgPT09ICdmaWxlJykgfHwgdGFyZ2V0LmRpc2FibGVkKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRicmVhaztcblx0XHRjYXNlICdsYWJlbCc6XG5cdFx0Y2FzZSAnaWZyYW1lJzogLy8gaU9TOCBob21lc2NyZWVuIGFwcHMgY2FuIHByZXZlbnQgZXZlbnRzIGJ1YmJsaW5nIGludG8gZnJhbWVzXG5cdFx0Y2FzZSAndmlkZW8nOlxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuICgvXFxibmVlZHNjbGlja1xcYi8pLnRlc3QodGFyZ2V0LmNsYXNzTmFtZSk7XG5cdH07XG5cblxuXHQvKipcblx0ICogRGV0ZXJtaW5lIHdoZXRoZXIgYSBnaXZlbiBlbGVtZW50IHJlcXVpcmVzIGEgY2FsbCB0byBmb2N1cyB0byBzaW11bGF0ZSBjbGljayBpbnRvIGVsZW1lbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RXZlbnRUYXJnZXR8RWxlbWVudH0gdGFyZ2V0IFRhcmdldCBET00gZWxlbWVudFxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyB0cnVlIGlmIHRoZSBlbGVtZW50IHJlcXVpcmVzIGEgY2FsbCB0byBmb2N1cyB0byBzaW11bGF0ZSBuYXRpdmUgY2xpY2suXG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLm5lZWRzRm9jdXMgPSBmdW5jdGlvbih0YXJnZXQpIHtcblx0XHRzd2l0Y2ggKHRhcmdldC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0Y2FzZSAndGV4dGFyZWEnOlxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0Y2FzZSAnc2VsZWN0Jzpcblx0XHRcdHJldHVybiAhZGV2aWNlSXNBbmRyb2lkO1xuXHRcdGNhc2UgJ2lucHV0Jzpcblx0XHRcdHN3aXRjaCAodGFyZ2V0LnR5cGUpIHtcblx0XHRcdGNhc2UgJ2J1dHRvbic6XG5cdFx0XHRjYXNlICdjaGVja2JveCc6XG5cdFx0XHRjYXNlICdmaWxlJzpcblx0XHRcdGNhc2UgJ2ltYWdlJzpcblx0XHRcdGNhc2UgJ3JhZGlvJzpcblx0XHRcdGNhc2UgJ3N1Ym1pdCc6XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gTm8gcG9pbnQgaW4gYXR0ZW1wdGluZyB0byBmb2N1cyBkaXNhYmxlZCBpbnB1dHNcblx0XHRcdHJldHVybiAhdGFyZ2V0LmRpc2FibGVkICYmICF0YXJnZXQucmVhZE9ubHk7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiAoL1xcYm5lZWRzZm9jdXNcXGIvKS50ZXN0KHRhcmdldC5jbGFzc05hbWUpO1xuXHRcdH1cblx0fTtcblxuXG5cdC8qKlxuXHQgKiBTZW5kIGEgY2xpY2sgZXZlbnQgdG8gdGhlIHNwZWNpZmllZCBlbGVtZW50LlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fEVsZW1lbnR9IHRhcmdldEVsZW1lbnRcblx0ICogQHBhcmFtIHtFdmVudH0gZXZlbnRcblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUuc2VuZENsaWNrID0gZnVuY3Rpb24odGFyZ2V0RWxlbWVudCwgZXZlbnQpIHtcblx0XHR2YXIgY2xpY2tFdmVudCwgdG91Y2g7XG5cblx0XHQvLyBPbiBzb21lIEFuZHJvaWQgZGV2aWNlcyBhY3RpdmVFbGVtZW50IG5lZWRzIHRvIGJlIGJsdXJyZWQgb3RoZXJ3aXNlIHRoZSBzeW50aGV0aWMgY2xpY2sgd2lsbCBoYXZlIG5vIGVmZmVjdCAoIzI0KVxuXHRcdGlmIChkb2N1bWVudC5hY3RpdmVFbGVtZW50ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IHRhcmdldEVsZW1lbnQpIHtcblx0XHRcdGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQuYmx1cigpO1xuXHRcdH1cblxuXHRcdHRvdWNoID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF07XG5cblx0XHQvLyBTeW50aGVzaXNlIGEgY2xpY2sgZXZlbnQsIHdpdGggYW4gZXh0cmEgYXR0cmlidXRlIHNvIGl0IGNhbiBiZSB0cmFja2VkXG5cdFx0Y2xpY2tFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdNb3VzZUV2ZW50cycpO1xuXHRcdGNsaWNrRXZlbnQuaW5pdE1vdXNlRXZlbnQodGhpcy5kZXRlcm1pbmVFdmVudFR5cGUodGFyZ2V0RWxlbWVudCksIHRydWUsIHRydWUsIHdpbmRvdywgMSwgdG91Y2guc2NyZWVuWCwgdG91Y2guc2NyZWVuWSwgdG91Y2guY2xpZW50WCwgdG91Y2guY2xpZW50WSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIDAsIG51bGwpO1xuXHRcdGNsaWNrRXZlbnQuZm9yd2FyZGVkVG91Y2hFdmVudCA9IHRydWU7XG5cdFx0dGFyZ2V0RWxlbWVudC5kaXNwYXRjaEV2ZW50KGNsaWNrRXZlbnQpO1xuXHR9O1xuXG5cdEZhc3RDbGljay5wcm90b3R5cGUuZGV0ZXJtaW5lRXZlbnRUeXBlID0gZnVuY3Rpb24odGFyZ2V0RWxlbWVudCkge1xuXG5cdFx0Ly9Jc3N1ZSAjMTU5OiBBbmRyb2lkIENocm9tZSBTZWxlY3QgQm94IGRvZXMgbm90IG9wZW4gd2l0aCBhIHN5bnRoZXRpYyBjbGljayBldmVudFxuXHRcdGlmIChkZXZpY2VJc0FuZHJvaWQgJiYgdGFyZ2V0RWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdzZWxlY3QnKSB7XG5cdFx0XHRyZXR1cm4gJ21vdXNlZG93bic7XG5cdFx0fVxuXG5cdFx0cmV0dXJuICdjbGljayc7XG5cdH07XG5cblxuXHQvKipcblx0ICogQHBhcmFtIHtFdmVudFRhcmdldHxFbGVtZW50fSB0YXJnZXRFbGVtZW50XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLmZvY3VzID0gZnVuY3Rpb24odGFyZ2V0RWxlbWVudCkge1xuXHRcdHZhciBsZW5ndGg7XG5cblx0XHQvLyBJc3N1ZSAjMTYwOiBvbiBpT1MgNywgc29tZSBpbnB1dCBlbGVtZW50cyAoZS5nLiBkYXRlIGRhdGV0aW1lIG1vbnRoKSB0aHJvdyBhIHZhZ3VlIFR5cGVFcnJvciBvbiBzZXRTZWxlY3Rpb25SYW5nZS4gVGhlc2UgZWxlbWVudHMgZG9uJ3QgaGF2ZSBhbiBpbnRlZ2VyIHZhbHVlIGZvciB0aGUgc2VsZWN0aW9uU3RhcnQgYW5kIHNlbGVjdGlvbkVuZCBwcm9wZXJ0aWVzLCBidXQgdW5mb3J0dW5hdGVseSB0aGF0IGNhbid0IGJlIHVzZWQgZm9yIGRldGVjdGlvbiBiZWNhdXNlIGFjY2Vzc2luZyB0aGUgcHJvcGVydGllcyBhbHNvIHRocm93cyBhIFR5cGVFcnJvci4gSnVzdCBjaGVjayB0aGUgdHlwZSBpbnN0ZWFkLiBGaWxlZCBhcyBBcHBsZSBidWcgIzE1MTIyNzI0LlxuXHRcdGlmIChkZXZpY2VJc0lPUyAmJiB0YXJnZXRFbGVtZW50LnNldFNlbGVjdGlvblJhbmdlICYmIHRhcmdldEVsZW1lbnQudHlwZS5pbmRleE9mKCdkYXRlJykgIT09IDAgJiYgdGFyZ2V0RWxlbWVudC50eXBlICE9PSAndGltZScgJiYgdGFyZ2V0RWxlbWVudC50eXBlICE9PSAnbW9udGgnKSB7XG5cdFx0XHRsZW5ndGggPSB0YXJnZXRFbGVtZW50LnZhbHVlLmxlbmd0aDtcblx0XHRcdHRhcmdldEVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2UobGVuZ3RoLCBsZW5ndGgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0YXJnZXRFbGVtZW50LmZvY3VzKCk7XG5cdFx0fVxuXHR9O1xuXG5cblx0LyoqXG5cdCAqIENoZWNrIHdoZXRoZXIgdGhlIGdpdmVuIHRhcmdldCBlbGVtZW50IGlzIGEgY2hpbGQgb2YgYSBzY3JvbGxhYmxlIGxheWVyIGFuZCBpZiBzbywgc2V0IGEgZmxhZyBvbiBpdC5cblx0ICpcblx0ICogQHBhcmFtIHtFdmVudFRhcmdldHxFbGVtZW50fSB0YXJnZXRFbGVtZW50XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLnVwZGF0ZVNjcm9sbFBhcmVudCA9IGZ1bmN0aW9uKHRhcmdldEVsZW1lbnQpIHtcblx0XHR2YXIgc2Nyb2xsUGFyZW50LCBwYXJlbnRFbGVtZW50O1xuXG5cdFx0c2Nyb2xsUGFyZW50ID0gdGFyZ2V0RWxlbWVudC5mYXN0Q2xpY2tTY3JvbGxQYXJlbnQ7XG5cblx0XHQvLyBBdHRlbXB0IHRvIGRpc2NvdmVyIHdoZXRoZXIgdGhlIHRhcmdldCBlbGVtZW50IGlzIGNvbnRhaW5lZCB3aXRoaW4gYSBzY3JvbGxhYmxlIGxheWVyLiBSZS1jaGVjayBpZiB0aGVcblx0XHQvLyB0YXJnZXQgZWxlbWVudCB3YXMgbW92ZWQgdG8gYW5vdGhlciBwYXJlbnQuXG5cdFx0aWYgKCFzY3JvbGxQYXJlbnQgfHwgIXNjcm9sbFBhcmVudC5jb250YWlucyh0YXJnZXRFbGVtZW50KSkge1xuXHRcdFx0cGFyZW50RWxlbWVudCA9IHRhcmdldEVsZW1lbnQ7XG5cdFx0XHRkbyB7XG5cdFx0XHRcdGlmIChwYXJlbnRFbGVtZW50LnNjcm9sbEhlaWdodCA+IHBhcmVudEVsZW1lbnQub2Zmc2V0SGVpZ2h0KSB7XG5cdFx0XHRcdFx0c2Nyb2xsUGFyZW50ID0gcGFyZW50RWxlbWVudDtcblx0XHRcdFx0XHR0YXJnZXRFbGVtZW50LmZhc3RDbGlja1Njcm9sbFBhcmVudCA9IHBhcmVudEVsZW1lbnQ7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRwYXJlbnRFbGVtZW50ID0gcGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50O1xuXHRcdFx0fSB3aGlsZSAocGFyZW50RWxlbWVudCk7XG5cdFx0fVxuXG5cdFx0Ly8gQWx3YXlzIHVwZGF0ZSB0aGUgc2Nyb2xsIHRvcCB0cmFja2VyIGlmIHBvc3NpYmxlLlxuXHRcdGlmIChzY3JvbGxQYXJlbnQpIHtcblx0XHRcdHNjcm9sbFBhcmVudC5mYXN0Q2xpY2tMYXN0U2Nyb2xsVG9wID0gc2Nyb2xsUGFyZW50LnNjcm9sbFRvcDtcblx0XHR9XG5cdH07XG5cblxuXHQvKipcblx0ICogQHBhcmFtIHtFdmVudFRhcmdldH0gdGFyZ2V0RWxlbWVudFxuXHQgKiBAcmV0dXJucyB7RWxlbWVudHxFdmVudFRhcmdldH1cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUuZ2V0VGFyZ2V0RWxlbWVudEZyb21FdmVudFRhcmdldCA9IGZ1bmN0aW9uKGV2ZW50VGFyZ2V0KSB7XG5cblx0XHQvLyBPbiBzb21lIG9sZGVyIGJyb3dzZXJzIChub3RhYmx5IFNhZmFyaSBvbiBpT1MgNC4xIC0gc2VlIGlzc3VlICM1NikgdGhlIGV2ZW50IHRhcmdldCBtYXkgYmUgYSB0ZXh0IG5vZGUuXG5cdFx0aWYgKGV2ZW50VGFyZ2V0Lm5vZGVUeXBlID09PSBOb2RlLlRFWFRfTk9ERSkge1xuXHRcdFx0cmV0dXJuIGV2ZW50VGFyZ2V0LnBhcmVudE5vZGU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGV2ZW50VGFyZ2V0O1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIE9uIHRvdWNoIHN0YXJ0LCByZWNvcmQgdGhlIHBvc2l0aW9uIGFuZCBzY3JvbGwgb2Zmc2V0LlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUub25Ub3VjaFN0YXJ0ID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHR2YXIgdGFyZ2V0RWxlbWVudCwgdG91Y2gsIHNlbGVjdGlvbjtcblxuXHRcdC8vIElnbm9yZSBtdWx0aXBsZSB0b3VjaGVzLCBvdGhlcndpc2UgcGluY2gtdG8tem9vbSBpcyBwcmV2ZW50ZWQgaWYgYm90aCBmaW5nZXJzIGFyZSBvbiB0aGUgRmFzdENsaWNrIGVsZW1lbnQgKGlzc3VlICMxMTEpLlxuXHRcdGlmIChldmVudC50YXJnZXRUb3VjaGVzLmxlbmd0aCA+IDEpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHRhcmdldEVsZW1lbnQgPSB0aGlzLmdldFRhcmdldEVsZW1lbnRGcm9tRXZlbnRUYXJnZXQoZXZlbnQudGFyZ2V0KTtcblx0XHR0b3VjaCA9IGV2ZW50LnRhcmdldFRvdWNoZXNbMF07XG5cblx0XHRpZiAoZGV2aWNlSXNJT1MpIHtcblxuXHRcdFx0Ly8gT25seSB0cnVzdGVkIGV2ZW50cyB3aWxsIGRlc2VsZWN0IHRleHQgb24gaU9TIChpc3N1ZSAjNDkpXG5cdFx0XHRzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG5cdFx0XHRpZiAoc2VsZWN0aW9uLnJhbmdlQ291bnQgJiYgIXNlbGVjdGlvbi5pc0NvbGxhcHNlZCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCFkZXZpY2VJc0lPUzQpIHtcblxuXHRcdFx0XHQvLyBXZWlyZCB0aGluZ3MgaGFwcGVuIG9uIGlPUyB3aGVuIGFuIGFsZXJ0IG9yIGNvbmZpcm0gZGlhbG9nIGlzIG9wZW5lZCBmcm9tIGEgY2xpY2sgZXZlbnQgY2FsbGJhY2sgKGlzc3VlICMyMyk6XG5cdFx0XHRcdC8vIHdoZW4gdGhlIHVzZXIgbmV4dCB0YXBzIGFueXdoZXJlIGVsc2Ugb24gdGhlIHBhZ2UsIG5ldyB0b3VjaHN0YXJ0IGFuZCB0b3VjaGVuZCBldmVudHMgYXJlIGRpc3BhdGNoZWRcblx0XHRcdFx0Ly8gd2l0aCB0aGUgc2FtZSBpZGVudGlmaWVyIGFzIHRoZSB0b3VjaCBldmVudCB0aGF0IHByZXZpb3VzbHkgdHJpZ2dlcmVkIHRoZSBjbGljayB0aGF0IHRyaWdnZXJlZCB0aGUgYWxlcnQuXG5cdFx0XHRcdC8vIFNhZGx5LCB0aGVyZSBpcyBhbiBpc3N1ZSBvbiBpT1MgNCB0aGF0IGNhdXNlcyBzb21lIG5vcm1hbCB0b3VjaCBldmVudHMgdG8gaGF2ZSB0aGUgc2FtZSBpZGVudGlmaWVyIGFzIGFuXG5cdFx0XHRcdC8vIGltbWVkaWF0ZWx5IHByZWNlZWRpbmcgdG91Y2ggZXZlbnQgKGlzc3VlICM1MiksIHNvIHRoaXMgZml4IGlzIHVuYXZhaWxhYmxlIG9uIHRoYXQgcGxhdGZvcm0uXG5cdFx0XHRcdC8vIElzc3VlIDEyMDogdG91Y2guaWRlbnRpZmllciBpcyAwIHdoZW4gQ2hyb21lIGRldiB0b29scyAnRW11bGF0ZSB0b3VjaCBldmVudHMnIGlzIHNldCB3aXRoIGFuIGlPUyBkZXZpY2UgVUEgc3RyaW5nLFxuXHRcdFx0XHQvLyB3aGljaCBjYXVzZXMgYWxsIHRvdWNoIGV2ZW50cyB0byBiZSBpZ25vcmVkLiBBcyB0aGlzIGJsb2NrIG9ubHkgYXBwbGllcyB0byBpT1MsIGFuZCBpT1MgaWRlbnRpZmllcnMgYXJlIGFsd2F5cyBsb25nLFxuXHRcdFx0XHQvLyByYW5kb20gaW50ZWdlcnMsIGl0J3Mgc2FmZSB0byB0byBjb250aW51ZSBpZiB0aGUgaWRlbnRpZmllciBpcyAwIGhlcmUuXG5cdFx0XHRcdGlmICh0b3VjaC5pZGVudGlmaWVyICYmIHRvdWNoLmlkZW50aWZpZXIgPT09IHRoaXMubGFzdFRvdWNoSWRlbnRpZmllcikge1xuXHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhpcy5sYXN0VG91Y2hJZGVudGlmaWVyID0gdG91Y2guaWRlbnRpZmllcjtcblxuXHRcdFx0XHQvLyBJZiB0aGUgdGFyZ2V0IGVsZW1lbnQgaXMgYSBjaGlsZCBvZiBhIHNjcm9sbGFibGUgbGF5ZXIgKHVzaW5nIC13ZWJraXQtb3ZlcmZsb3ctc2Nyb2xsaW5nOiB0b3VjaCkgYW5kOlxuXHRcdFx0XHQvLyAxKSB0aGUgdXNlciBkb2VzIGEgZmxpbmcgc2Nyb2xsIG9uIHRoZSBzY3JvbGxhYmxlIGxheWVyXG5cdFx0XHRcdC8vIDIpIHRoZSB1c2VyIHN0b3BzIHRoZSBmbGluZyBzY3JvbGwgd2l0aCBhbm90aGVyIHRhcFxuXHRcdFx0XHQvLyB0aGVuIHRoZSBldmVudC50YXJnZXQgb2YgdGhlIGxhc3QgJ3RvdWNoZW5kJyBldmVudCB3aWxsIGJlIHRoZSBlbGVtZW50IHRoYXQgd2FzIHVuZGVyIHRoZSB1c2VyJ3MgZmluZ2VyXG5cdFx0XHRcdC8vIHdoZW4gdGhlIGZsaW5nIHNjcm9sbCB3YXMgc3RhcnRlZCwgY2F1c2luZyBGYXN0Q2xpY2sgdG8gc2VuZCBhIGNsaWNrIGV2ZW50IHRvIHRoYXQgbGF5ZXIgLSB1bmxlc3MgYSBjaGVja1xuXHRcdFx0XHQvLyBpcyBtYWRlIHRvIGVuc3VyZSB0aGF0IGEgcGFyZW50IGxheWVyIHdhcyBub3Qgc2Nyb2xsZWQgYmVmb3JlIHNlbmRpbmcgYSBzeW50aGV0aWMgY2xpY2sgKGlzc3VlICM0MikuXG5cdFx0XHRcdHRoaXMudXBkYXRlU2Nyb2xsUGFyZW50KHRhcmdldEVsZW1lbnQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMudHJhY2tpbmdDbGljayA9IHRydWU7XG5cdFx0dGhpcy50cmFja2luZ0NsaWNrU3RhcnQgPSBldmVudC50aW1lU3RhbXA7XG5cdFx0dGhpcy50YXJnZXRFbGVtZW50ID0gdGFyZ2V0RWxlbWVudDtcblxuXHRcdHRoaXMudG91Y2hTdGFydFggPSB0b3VjaC5wYWdlWDtcblx0XHR0aGlzLnRvdWNoU3RhcnRZID0gdG91Y2gucGFnZVk7XG5cblx0XHQvLyBQcmV2ZW50IHBoYW50b20gY2xpY2tzIG9uIGZhc3QgZG91YmxlLXRhcCAoaXNzdWUgIzM2KVxuXHRcdGlmICgoZXZlbnQudGltZVN0YW1wIC0gdGhpcy5sYXN0Q2xpY2tUaW1lKSA8IHRoaXMudGFwRGVsYXkpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH07XG5cblxuXHQvKipcblx0ICogQmFzZWQgb24gYSB0b3VjaG1vdmUgZXZlbnQgb2JqZWN0LCBjaGVjayB3aGV0aGVyIHRoZSB0b3VjaCBoYXMgbW92ZWQgcGFzdCBhIGJvdW5kYXJ5IHNpbmNlIGl0IHN0YXJ0ZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS50b3VjaEhhc01vdmVkID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHR2YXIgdG91Y2ggPSBldmVudC5jaGFuZ2VkVG91Y2hlc1swXSwgYm91bmRhcnkgPSB0aGlzLnRvdWNoQm91bmRhcnk7XG5cblx0XHRpZiAoTWF0aC5hYnModG91Y2gucGFnZVggLSB0aGlzLnRvdWNoU3RhcnRYKSA+IGJvdW5kYXJ5IHx8IE1hdGguYWJzKHRvdWNoLnBhZ2VZIC0gdGhpcy50b3VjaFN0YXJ0WSkgPiBib3VuZGFyeSkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIFVwZGF0ZSB0aGUgbGFzdCBwb3NpdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIHtFdmVudH0gZXZlbnRcblx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLm9uVG91Y2hNb3ZlID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRpZiAoIXRoaXMudHJhY2tpbmdDbGljaykge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgdGhlIHRvdWNoIGhhcyBtb3ZlZCwgY2FuY2VsIHRoZSBjbGljayB0cmFja2luZ1xuXHRcdGlmICh0aGlzLnRhcmdldEVsZW1lbnQgIT09IHRoaXMuZ2V0VGFyZ2V0RWxlbWVudEZyb21FdmVudFRhcmdldChldmVudC50YXJnZXQpIHx8IHRoaXMudG91Y2hIYXNNb3ZlZChldmVudCkpIHtcblx0XHRcdHRoaXMudHJhY2tpbmdDbGljayA9IGZhbHNlO1xuXHRcdFx0dGhpcy50YXJnZXRFbGVtZW50ID0gbnVsbDtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBBdHRlbXB0IHRvIGZpbmQgdGhlIGxhYmVsbGVkIGNvbnRyb2wgZm9yIHRoZSBnaXZlbiBsYWJlbCBlbGVtZW50LlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fEhUTUxMYWJlbEVsZW1lbnR9IGxhYmVsRWxlbWVudFxuXHQgKiBAcmV0dXJucyB7RWxlbWVudHxudWxsfVxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5maW5kQ29udHJvbCA9IGZ1bmN0aW9uKGxhYmVsRWxlbWVudCkge1xuXG5cdFx0Ly8gRmFzdCBwYXRoIGZvciBuZXdlciBicm93c2VycyBzdXBwb3J0aW5nIHRoZSBIVE1MNSBjb250cm9sIGF0dHJpYnV0ZVxuXHRcdGlmIChsYWJlbEVsZW1lbnQuY29udHJvbCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gbGFiZWxFbGVtZW50LmNvbnRyb2w7XG5cdFx0fVxuXG5cdFx0Ly8gQWxsIGJyb3dzZXJzIHVuZGVyIHRlc3QgdGhhdCBzdXBwb3J0IHRvdWNoIGV2ZW50cyBhbHNvIHN1cHBvcnQgdGhlIEhUTUw1IGh0bWxGb3IgYXR0cmlidXRlXG5cdFx0aWYgKGxhYmVsRWxlbWVudC5odG1sRm9yKSB7XG5cdFx0XHRyZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobGFiZWxFbGVtZW50Lmh0bWxGb3IpO1xuXHRcdH1cblxuXHRcdC8vIElmIG5vIGZvciBhdHRyaWJ1dGUgZXhpc3RzLCBhdHRlbXB0IHRvIHJldHJpZXZlIHRoZSBmaXJzdCBsYWJlbGxhYmxlIGRlc2NlbmRhbnQgZWxlbWVudFxuXHRcdC8vIHRoZSBsaXN0IG9mIHdoaWNoIGlzIGRlZmluZWQgaGVyZTogaHR0cDovL3d3dy53My5vcmcvVFIvaHRtbDUvZm9ybXMuaHRtbCNjYXRlZ29yeS1sYWJlbFxuXHRcdHJldHVybiBsYWJlbEVsZW1lbnQucXVlcnlTZWxlY3RvcignYnV0dG9uLCBpbnB1dDpub3QoW3R5cGU9aGlkZGVuXSksIGtleWdlbiwgbWV0ZXIsIG91dHB1dCwgcHJvZ3Jlc3MsIHNlbGVjdCwgdGV4dGFyZWEnKTtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBPbiB0b3VjaCBlbmQsIGRldGVybWluZSB3aGV0aGVyIHRvIHNlbmQgYSBjbGljayBldmVudCBhdCBvbmNlLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUub25Ub3VjaEVuZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0dmFyIGZvckVsZW1lbnQsIHRyYWNraW5nQ2xpY2tTdGFydCwgdGFyZ2V0VGFnTmFtZSwgc2Nyb2xsUGFyZW50LCB0b3VjaCwgdGFyZ2V0RWxlbWVudCA9IHRoaXMudGFyZ2V0RWxlbWVudDtcblxuXHRcdGlmICghdGhpcy50cmFja2luZ0NsaWNrKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyBQcmV2ZW50IHBoYW50b20gY2xpY2tzIG9uIGZhc3QgZG91YmxlLXRhcCAoaXNzdWUgIzM2KVxuXHRcdGlmICgoZXZlbnQudGltZVN0YW1wIC0gdGhpcy5sYXN0Q2xpY2tUaW1lKSA8IHRoaXMudGFwRGVsYXkpIHtcblx0XHRcdHRoaXMuY2FuY2VsTmV4dENsaWNrID0gdHJ1ZTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdGlmICgoZXZlbnQudGltZVN0YW1wIC0gdGhpcy50cmFja2luZ0NsaWNrU3RhcnQpID4gdGhpcy50YXBUaW1lb3V0KSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyBSZXNldCB0byBwcmV2ZW50IHdyb25nIGNsaWNrIGNhbmNlbCBvbiBpbnB1dCAoaXNzdWUgIzE1NikuXG5cdFx0dGhpcy5jYW5jZWxOZXh0Q2xpY2sgPSBmYWxzZTtcblxuXHRcdHRoaXMubGFzdENsaWNrVGltZSA9IGV2ZW50LnRpbWVTdGFtcDtcblxuXHRcdHRyYWNraW5nQ2xpY2tTdGFydCA9IHRoaXMudHJhY2tpbmdDbGlja1N0YXJ0O1xuXHRcdHRoaXMudHJhY2tpbmdDbGljayA9IGZhbHNlO1xuXHRcdHRoaXMudHJhY2tpbmdDbGlja1N0YXJ0ID0gMDtcblxuXHRcdC8vIE9uIHNvbWUgaU9TIGRldmljZXMsIHRoZSB0YXJnZXRFbGVtZW50IHN1cHBsaWVkIHdpdGggdGhlIGV2ZW50IGlzIGludmFsaWQgaWYgdGhlIGxheWVyXG5cdFx0Ly8gaXMgcGVyZm9ybWluZyBhIHRyYW5zaXRpb24gb3Igc2Nyb2xsLCBhbmQgaGFzIHRvIGJlIHJlLWRldGVjdGVkIG1hbnVhbGx5LiBOb3RlIHRoYXRcblx0XHQvLyBmb3IgdGhpcyB0byBmdW5jdGlvbiBjb3JyZWN0bHksIGl0IG11c3QgYmUgY2FsbGVkICphZnRlciogdGhlIGV2ZW50IHRhcmdldCBpcyBjaGVja2VkIVxuXHRcdC8vIFNlZSBpc3N1ZSAjNTc7IGFsc28gZmlsZWQgYXMgcmRhcjovLzEzMDQ4NTg5IC5cblx0XHRpZiAoZGV2aWNlSXNJT1NXaXRoQmFkVGFyZ2V0KSB7XG5cdFx0XHR0b3VjaCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdO1xuXG5cdFx0XHQvLyBJbiBjZXJ0YWluIGNhc2VzIGFyZ3VtZW50cyBvZiBlbGVtZW50RnJvbVBvaW50IGNhbiBiZSBuZWdhdGl2ZSwgc28gcHJldmVudCBzZXR0aW5nIHRhcmdldEVsZW1lbnQgdG8gbnVsbFxuXHRcdFx0dGFyZ2V0RWxlbWVudCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQodG91Y2gucGFnZVggLSB3aW5kb3cucGFnZVhPZmZzZXQsIHRvdWNoLnBhZ2VZIC0gd2luZG93LnBhZ2VZT2Zmc2V0KSB8fCB0YXJnZXRFbGVtZW50O1xuXHRcdFx0dGFyZ2V0RWxlbWVudC5mYXN0Q2xpY2tTY3JvbGxQYXJlbnQgPSB0aGlzLnRhcmdldEVsZW1lbnQuZmFzdENsaWNrU2Nyb2xsUGFyZW50O1xuXHRcdH1cblxuXHRcdHRhcmdldFRhZ05hbWUgPSB0YXJnZXRFbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcblx0XHRpZiAodGFyZ2V0VGFnTmFtZSA9PT0gJ2xhYmVsJykge1xuXHRcdFx0Zm9yRWxlbWVudCA9IHRoaXMuZmluZENvbnRyb2wodGFyZ2V0RWxlbWVudCk7XG5cdFx0XHRpZiAoZm9yRWxlbWVudCkge1xuXHRcdFx0XHR0aGlzLmZvY3VzKHRhcmdldEVsZW1lbnQpO1xuXHRcdFx0XHRpZiAoZGV2aWNlSXNBbmRyb2lkKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGFyZ2V0RWxlbWVudCA9IGZvckVsZW1lbnQ7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh0aGlzLm5lZWRzRm9jdXModGFyZ2V0RWxlbWVudCkpIHtcblxuXHRcdFx0Ly8gQ2FzZSAxOiBJZiB0aGUgdG91Y2ggc3RhcnRlZCBhIHdoaWxlIGFnbyAoYmVzdCBndWVzcyBpcyAxMDBtcyBiYXNlZCBvbiB0ZXN0cyBmb3IgaXNzdWUgIzM2KSB0aGVuIGZvY3VzIHdpbGwgYmUgdHJpZ2dlcmVkIGFueXdheS4gUmV0dXJuIGVhcmx5IGFuZCB1bnNldCB0aGUgdGFyZ2V0IGVsZW1lbnQgcmVmZXJlbmNlIHNvIHRoYXQgdGhlIHN1YnNlcXVlbnQgY2xpY2sgd2lsbCBiZSBhbGxvd2VkIHRocm91Z2guXG5cdFx0XHQvLyBDYXNlIDI6IFdpdGhvdXQgdGhpcyBleGNlcHRpb24gZm9yIGlucHV0IGVsZW1lbnRzIHRhcHBlZCB3aGVuIHRoZSBkb2N1bWVudCBpcyBjb250YWluZWQgaW4gYW4gaWZyYW1lLCB0aGVuIGFueSBpbnB1dHRlZCB0ZXh0IHdvbid0IGJlIHZpc2libGUgZXZlbiB0aG91Z2ggdGhlIHZhbHVlIGF0dHJpYnV0ZSBpcyB1cGRhdGVkIGFzIHRoZSB1c2VyIHR5cGVzIChpc3N1ZSAjMzcpLlxuXHRcdFx0aWYgKChldmVudC50aW1lU3RhbXAgLSB0cmFja2luZ0NsaWNrU3RhcnQpID4gMTAwIHx8IChkZXZpY2VJc0lPUyAmJiB3aW5kb3cudG9wICE9PSB3aW5kb3cgJiYgdGFyZ2V0VGFnTmFtZSA9PT0gJ2lucHV0JykpIHtcblx0XHRcdFx0dGhpcy50YXJnZXRFbGVtZW50ID0gbnVsbDtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLmZvY3VzKHRhcmdldEVsZW1lbnQpO1xuXHRcdFx0dGhpcy5zZW5kQ2xpY2sodGFyZ2V0RWxlbWVudCwgZXZlbnQpO1xuXG5cdFx0XHQvLyBTZWxlY3QgZWxlbWVudHMgbmVlZCB0aGUgZXZlbnQgdG8gZ28gdGhyb3VnaCBvbiBpT1MgNCwgb3RoZXJ3aXNlIHRoZSBzZWxlY3RvciBtZW51IHdvbid0IG9wZW4uXG5cdFx0XHQvLyBBbHNvIHRoaXMgYnJlYWtzIG9wZW5pbmcgc2VsZWN0cyB3aGVuIFZvaWNlT3ZlciBpcyBhY3RpdmUgb24gaU9TNiwgaU9TNyAoYW5kIHBvc3NpYmx5IG90aGVycylcblx0XHRcdGlmICghZGV2aWNlSXNJT1MgfHwgdGFyZ2V0VGFnTmFtZSAhPT0gJ3NlbGVjdCcpIHtcblx0XHRcdFx0dGhpcy50YXJnZXRFbGVtZW50ID0gbnVsbDtcblx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdGlmIChkZXZpY2VJc0lPUyAmJiAhZGV2aWNlSXNJT1M0KSB7XG5cblx0XHRcdC8vIERvbid0IHNlbmQgYSBzeW50aGV0aWMgY2xpY2sgZXZlbnQgaWYgdGhlIHRhcmdldCBlbGVtZW50IGlzIGNvbnRhaW5lZCB3aXRoaW4gYSBwYXJlbnQgbGF5ZXIgdGhhdCB3YXMgc2Nyb2xsZWRcblx0XHRcdC8vIGFuZCB0aGlzIHRhcCBpcyBiZWluZyB1c2VkIHRvIHN0b3AgdGhlIHNjcm9sbGluZyAodXN1YWxseSBpbml0aWF0ZWQgYnkgYSBmbGluZyAtIGlzc3VlICM0MikuXG5cdFx0XHRzY3JvbGxQYXJlbnQgPSB0YXJnZXRFbGVtZW50LmZhc3RDbGlja1Njcm9sbFBhcmVudDtcblx0XHRcdGlmIChzY3JvbGxQYXJlbnQgJiYgc2Nyb2xsUGFyZW50LmZhc3RDbGlja0xhc3RTY3JvbGxUb3AgIT09IHNjcm9sbFBhcmVudC5zY3JvbGxUb3ApIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gUHJldmVudCB0aGUgYWN0dWFsIGNsaWNrIGZyb20gZ29pbmcgdGhvdWdoIC0gdW5sZXNzIHRoZSB0YXJnZXQgbm9kZSBpcyBtYXJrZWQgYXMgcmVxdWlyaW5nXG5cdFx0Ly8gcmVhbCBjbGlja3Mgb3IgaWYgaXQgaXMgaW4gdGhlIHdoaXRlbGlzdCBpbiB3aGljaCBjYXNlIG9ubHkgbm9uLXByb2dyYW1tYXRpYyBjbGlja3MgYXJlIHBlcm1pdHRlZC5cblx0XHRpZiAoIXRoaXMubmVlZHNDbGljayh0YXJnZXRFbGVtZW50KSkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdHRoaXMuc2VuZENsaWNrKHRhcmdldEVsZW1lbnQsIGV2ZW50KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH07XG5cblxuXHQvKipcblx0ICogT24gdG91Y2ggY2FuY2VsLCBzdG9wIHRyYWNraW5nIHRoZSBjbGljay5cblx0ICpcblx0ICogQHJldHVybnMge3ZvaWR9XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLm9uVG91Y2hDYW5jZWwgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnRyYWNraW5nQ2xpY2sgPSBmYWxzZTtcblx0XHR0aGlzLnRhcmdldEVsZW1lbnQgPSBudWxsO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIERldGVybWluZSBtb3VzZSBldmVudHMgd2hpY2ggc2hvdWxkIGJlIHBlcm1pdHRlZC5cblx0ICpcblx0ICogQHBhcmFtIHtFdmVudH0gZXZlbnRcblx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLm9uTW91c2UgPSBmdW5jdGlvbihldmVudCkge1xuXG5cdFx0Ly8gSWYgYSB0YXJnZXQgZWxlbWVudCB3YXMgbmV2ZXIgc2V0IChiZWNhdXNlIGEgdG91Y2ggZXZlbnQgd2FzIG5ldmVyIGZpcmVkKSBhbGxvdyB0aGUgZXZlbnRcblx0XHRpZiAoIXRoaXMudGFyZ2V0RWxlbWVudCkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKGV2ZW50LmZvcndhcmRlZFRvdWNoRXZlbnQpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIFByb2dyYW1tYXRpY2FsbHkgZ2VuZXJhdGVkIGV2ZW50cyB0YXJnZXRpbmcgYSBzcGVjaWZpYyBlbGVtZW50IHNob3VsZCBiZSBwZXJtaXR0ZWRcblx0XHRpZiAoIWV2ZW50LmNhbmNlbGFibGUpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIERlcml2ZSBhbmQgY2hlY2sgdGhlIHRhcmdldCBlbGVtZW50IHRvIHNlZSB3aGV0aGVyIHRoZSBtb3VzZSBldmVudCBuZWVkcyB0byBiZSBwZXJtaXR0ZWQ7XG5cdFx0Ly8gdW5sZXNzIGV4cGxpY2l0bHkgZW5hYmxlZCwgcHJldmVudCBub24tdG91Y2ggY2xpY2sgZXZlbnRzIGZyb20gdHJpZ2dlcmluZyBhY3Rpb25zLFxuXHRcdC8vIHRvIHByZXZlbnQgZ2hvc3QvZG91YmxlY2xpY2tzLlxuXHRcdGlmICghdGhpcy5uZWVkc0NsaWNrKHRoaXMudGFyZ2V0RWxlbWVudCkgfHwgdGhpcy5jYW5jZWxOZXh0Q2xpY2spIHtcblxuXHRcdFx0Ly8gUHJldmVudCBhbnkgdXNlci1hZGRlZCBsaXN0ZW5lcnMgZGVjbGFyZWQgb24gRmFzdENsaWNrIGVsZW1lbnQgZnJvbSBiZWluZyBmaXJlZC5cblx0XHRcdGlmIChldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24pIHtcblx0XHRcdFx0ZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdC8vIFBhcnQgb2YgdGhlIGhhY2sgZm9yIGJyb3dzZXJzIHRoYXQgZG9uJ3Qgc3VwcG9ydCBFdmVudCNzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24gKGUuZy4gQW5kcm9pZCAyKVxuXHRcdFx0XHRldmVudC5wcm9wYWdhdGlvblN0b3BwZWQgPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBDYW5jZWwgdGhlIGV2ZW50XG5cdFx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBJZiB0aGUgbW91c2UgZXZlbnQgaXMgcGVybWl0dGVkLCByZXR1cm4gdHJ1ZSBmb3IgdGhlIGFjdGlvbiB0byBnbyB0aHJvdWdoLlxuXHRcdHJldHVybiB0cnVlO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIE9uIGFjdHVhbCBjbGlja3MsIGRldGVybWluZSB3aGV0aGVyIHRoaXMgaXMgYSB0b3VjaC1nZW5lcmF0ZWQgY2xpY2ssIGEgY2xpY2sgYWN0aW9uIG9jY3VycmluZ1xuXHQgKiBuYXR1cmFsbHkgYWZ0ZXIgYSBkZWxheSBhZnRlciBhIHRvdWNoICh3aGljaCBuZWVkcyB0byBiZSBjYW5jZWxsZWQgdG8gYXZvaWQgZHVwbGljYXRpb24pLCBvclxuXHQgKiBhbiBhY3R1YWwgY2xpY2sgd2hpY2ggc2hvdWxkIGJlIHBlcm1pdHRlZC5cblx0ICpcblx0ICogQHBhcmFtIHtFdmVudH0gZXZlbnRcblx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLm9uQ2xpY2sgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdHZhciBwZXJtaXR0ZWQ7XG5cblx0XHQvLyBJdCdzIHBvc3NpYmxlIGZvciBhbm90aGVyIEZhc3RDbGljay1saWtlIGxpYnJhcnkgZGVsaXZlcmVkIHdpdGggdGhpcmQtcGFydHkgY29kZSB0byBmaXJlIGEgY2xpY2sgZXZlbnQgYmVmb3JlIEZhc3RDbGljayBkb2VzIChpc3N1ZSAjNDQpLiBJbiB0aGF0IGNhc2UsIHNldCB0aGUgY2xpY2stdHJhY2tpbmcgZmxhZyBiYWNrIHRvIGZhbHNlIGFuZCByZXR1cm4gZWFybHkuIFRoaXMgd2lsbCBjYXVzZSBvblRvdWNoRW5kIHRvIHJldHVybiBlYXJseS5cblx0XHRpZiAodGhpcy50cmFja2luZ0NsaWNrKSB7XG5cdFx0XHR0aGlzLnRhcmdldEVsZW1lbnQgPSBudWxsO1xuXHRcdFx0dGhpcy50cmFja2luZ0NsaWNrID0gZmFsc2U7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyBWZXJ5IG9kZCBiZWhhdmlvdXIgb24gaU9TIChpc3N1ZSAjMTgpOiBpZiBhIHN1Ym1pdCBlbGVtZW50IGlzIHByZXNlbnQgaW5zaWRlIGEgZm9ybSBhbmQgdGhlIHVzZXIgaGl0cyBlbnRlciBpbiB0aGUgaU9TIHNpbXVsYXRvciBvciBjbGlja3MgdGhlIEdvIGJ1dHRvbiBvbiB0aGUgcG9wLXVwIE9TIGtleWJvYXJkIHRoZSBhIGtpbmQgb2YgJ2Zha2UnIGNsaWNrIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkIHdpdGggdGhlIHN1Ym1pdC10eXBlIGlucHV0IGVsZW1lbnQgYXMgdGhlIHRhcmdldC5cblx0XHRpZiAoZXZlbnQudGFyZ2V0LnR5cGUgPT09ICdzdWJtaXQnICYmIGV2ZW50LmRldGFpbCA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0cGVybWl0dGVkID0gdGhpcy5vbk1vdXNlKGV2ZW50KTtcblxuXHRcdC8vIE9ubHkgdW5zZXQgdGFyZ2V0RWxlbWVudCBpZiB0aGUgY2xpY2sgaXMgbm90IHBlcm1pdHRlZC4gVGhpcyB3aWxsIGVuc3VyZSB0aGF0IHRoZSBjaGVjayBmb3IgIXRhcmdldEVsZW1lbnQgaW4gb25Nb3VzZSBmYWlscyBhbmQgdGhlIGJyb3dzZXIncyBjbGljayBkb2Vzbid0IGdvIHRocm91Z2guXG5cdFx0aWYgKCFwZXJtaXR0ZWQpIHtcblx0XHRcdHRoaXMudGFyZ2V0RWxlbWVudCA9IG51bGw7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgY2xpY2tzIGFyZSBwZXJtaXR0ZWQsIHJldHVybiB0cnVlIGZvciB0aGUgYWN0aW9uIHRvIGdvIHRocm91Z2guXG5cdFx0cmV0dXJuIHBlcm1pdHRlZDtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBSZW1vdmUgYWxsIEZhc3RDbGljaydzIGV2ZW50IGxpc3RlbmVycy5cblx0ICpcblx0ICogQHJldHVybnMge3ZvaWR9XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcblx0XHR2YXIgbGF5ZXIgPSB0aGlzLmxheWVyO1xuXG5cdFx0aWYgKGRldmljZUlzQW5kcm9pZCkge1xuXHRcdFx0bGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VvdmVyJywgdGhpcy5vbk1vdXNlLCB0cnVlKTtcblx0XHRcdGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMub25Nb3VzZSwgdHJ1ZSk7XG5cdFx0XHRsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgdGhpcy5vbk1vdXNlLCB0cnVlKTtcblx0XHR9XG5cblx0XHRsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMub25DbGljaywgdHJ1ZSk7XG5cdFx0bGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRoaXMub25Ub3VjaFN0YXJ0LCBmYWxzZSk7XG5cdFx0bGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgdGhpcy5vblRvdWNoTW92ZSwgZmFsc2UpO1xuXHRcdGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdGhpcy5vblRvdWNoRW5kLCBmYWxzZSk7XG5cdFx0bGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hjYW5jZWwnLCB0aGlzLm9uVG91Y2hDYW5jZWwsIGZhbHNlKTtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBDaGVjayB3aGV0aGVyIEZhc3RDbGljayBpcyBuZWVkZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RWxlbWVudH0gbGF5ZXIgVGhlIGxheWVyIHRvIGxpc3RlbiBvblxuXHQgKi9cblx0RmFzdENsaWNrLm5vdE5lZWRlZCA9IGZ1bmN0aW9uKGxheWVyKSB7XG5cdFx0dmFyIG1ldGFWaWV3cG9ydDtcblx0XHR2YXIgY2hyb21lVmVyc2lvbjtcblx0XHR2YXIgYmxhY2tiZXJyeVZlcnNpb247XG5cdFx0dmFyIGZpcmVmb3hWZXJzaW9uO1xuXG5cdFx0Ly8gRGV2aWNlcyB0aGF0IGRvbid0IHN1cHBvcnQgdG91Y2ggZG9uJ3QgbmVlZCBGYXN0Q2xpY2tcblx0XHRpZiAodHlwZW9mIHdpbmRvdy5vbnRvdWNoc3RhcnQgPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyBDaHJvbWUgdmVyc2lvbiAtIHplcm8gZm9yIG90aGVyIGJyb3dzZXJzXG5cdFx0Y2hyb21lVmVyc2lvbiA9ICsoL0Nocm9tZVxcLyhbMC05XSspLy5leGVjKG5hdmlnYXRvci51c2VyQWdlbnQpIHx8IFssMF0pWzFdO1xuXG5cdFx0aWYgKGNocm9tZVZlcnNpb24pIHtcblxuXHRcdFx0aWYgKGRldmljZUlzQW5kcm9pZCkge1xuXHRcdFx0XHRtZXRhVmlld3BvcnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdtZXRhW25hbWU9dmlld3BvcnRdJyk7XG5cblx0XHRcdFx0aWYgKG1ldGFWaWV3cG9ydCkge1xuXHRcdFx0XHRcdC8vIENocm9tZSBvbiBBbmRyb2lkIHdpdGggdXNlci1zY2FsYWJsZT1cIm5vXCIgZG9lc24ndCBuZWVkIEZhc3RDbGljayAoaXNzdWUgIzg5KVxuXHRcdFx0XHRcdGlmIChtZXRhVmlld3BvcnQuY29udGVudC5pbmRleE9mKCd1c2VyLXNjYWxhYmxlPW5vJykgIT09IC0xKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gQ2hyb21lIDMyIGFuZCBhYm92ZSB3aXRoIHdpZHRoPWRldmljZS13aWR0aCBvciBsZXNzIGRvbid0IG5lZWQgRmFzdENsaWNrXG5cdFx0XHRcdFx0aWYgKGNocm9tZVZlcnNpb24gPiAzMSAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsV2lkdGggPD0gd2luZG93Lm91dGVyV2lkdGgpIHtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHQvLyBDaHJvbWUgZGVza3RvcCBkb2Vzbid0IG5lZWQgRmFzdENsaWNrIChpc3N1ZSAjMTUpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoZGV2aWNlSXNCbGFja0JlcnJ5MTApIHtcblx0XHRcdGJsYWNrYmVycnlWZXJzaW9uID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvVmVyc2lvblxcLyhbMC05XSopXFwuKFswLTldKikvKTtcblxuXHRcdFx0Ly8gQmxhY2tCZXJyeSAxMC4zKyBkb2VzIG5vdCByZXF1aXJlIEZhc3RjbGljayBsaWJyYXJ5LlxuXHRcdFx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL2Z0bGFicy9mYXN0Y2xpY2svaXNzdWVzLzI1MVxuXHRcdFx0aWYgKGJsYWNrYmVycnlWZXJzaW9uWzFdID49IDEwICYmIGJsYWNrYmVycnlWZXJzaW9uWzJdID49IDMpIHtcblx0XHRcdFx0bWV0YVZpZXdwb3J0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbWV0YVtuYW1lPXZpZXdwb3J0XScpO1xuXG5cdFx0XHRcdGlmIChtZXRhVmlld3BvcnQpIHtcblx0XHRcdFx0XHQvLyB1c2VyLXNjYWxhYmxlPW5vIGVsaW1pbmF0ZXMgY2xpY2sgZGVsYXkuXG5cdFx0XHRcdFx0aWYgKG1ldGFWaWV3cG9ydC5jb250ZW50LmluZGV4T2YoJ3VzZXItc2NhbGFibGU9bm8nKSAhPT0gLTEpIHtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyB3aWR0aD1kZXZpY2Utd2lkdGggKG9yIGxlc3MgdGhhbiBkZXZpY2Utd2lkdGgpIGVsaW1pbmF0ZXMgY2xpY2sgZGVsYXkuXG5cdFx0XHRcdFx0aWYgKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxXaWR0aCA8PSB3aW5kb3cub3V0ZXJXaWR0aCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gSUUxMCB3aXRoIC1tcy10b3VjaC1hY3Rpb246IG5vbmUgb3IgbWFuaXB1bGF0aW9uLCB3aGljaCBkaXNhYmxlcyBkb3VibGUtdGFwLXRvLXpvb20gKGlzc3VlICM5Nylcblx0XHRpZiAobGF5ZXIuc3R5bGUubXNUb3VjaEFjdGlvbiA9PT0gJ25vbmUnIHx8IGxheWVyLnN0eWxlLnRvdWNoQWN0aW9uID09PSAnbWFuaXB1bGF0aW9uJykge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gRmlyZWZveCB2ZXJzaW9uIC0gemVybyBmb3Igb3RoZXIgYnJvd3NlcnNcblx0XHRmaXJlZm94VmVyc2lvbiA9ICsoL0ZpcmVmb3hcXC8oWzAtOV0rKS8uZXhlYyhuYXZpZ2F0b3IudXNlckFnZW50KSB8fCBbLDBdKVsxXTtcblxuXHRcdGlmIChmaXJlZm94VmVyc2lvbiA+PSAyNykge1xuXHRcdFx0Ly8gRmlyZWZveCAyNysgZG9lcyBub3QgaGF2ZSB0YXAgZGVsYXkgaWYgdGhlIGNvbnRlbnQgaXMgbm90IHpvb21hYmxlIC0gaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9OTIyODk2XG5cblx0XHRcdG1ldGFWaWV3cG9ydCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ21ldGFbbmFtZT12aWV3cG9ydF0nKTtcblx0XHRcdGlmIChtZXRhVmlld3BvcnQgJiYgKG1ldGFWaWV3cG9ydC5jb250ZW50LmluZGV4T2YoJ3VzZXItc2NhbGFibGU9bm8nKSAhPT0gLTEgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFdpZHRoIDw9IHdpbmRvdy5vdXRlcldpZHRoKSkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBJRTExOiBwcmVmaXhlZCAtbXMtdG91Y2gtYWN0aW9uIGlzIG5vIGxvbmdlciBzdXBwb3J0ZWQgYW5kIGl0J3MgcmVjb21lbmRlZCB0byB1c2Ugbm9uLXByZWZpeGVkIHZlcnNpb25cblx0XHQvLyBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvd2luZG93cy9hcHBzL0hoNzY3MzEzLmFzcHhcblx0XHRpZiAobGF5ZXIuc3R5bGUudG91Y2hBY3Rpb24gPT09ICdub25lJyB8fCBsYXllci5zdHlsZS50b3VjaEFjdGlvbiA9PT0gJ21hbmlwdWxhdGlvbicpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBGYWN0b3J5IG1ldGhvZCBmb3IgY3JlYXRpbmcgYSBGYXN0Q2xpY2sgb2JqZWN0XG5cdCAqXG5cdCAqIEBwYXJhbSB7RWxlbWVudH0gbGF5ZXIgVGhlIGxheWVyIHRvIGxpc3RlbiBvblxuXHQgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dIFRoZSBvcHRpb25zIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0c1xuXHQgKi9cblx0RmFzdENsaWNrLmF0dGFjaCA9IGZ1bmN0aW9uKGxheWVyLCBvcHRpb25zKSB7XG5cdFx0cmV0dXJuIG5ldyBGYXN0Q2xpY2sobGF5ZXIsIG9wdGlvbnMpO1xuXHR9O1xuXG5cblx0aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGRlZmluZS5hbWQgPT09ICdvYmplY3QnICYmIGRlZmluZS5hbWQpIHtcblxuXHRcdC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cblx0XHRkZWZpbmUoZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gRmFzdENsaWNrO1xuXHRcdH0pO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBGYXN0Q2xpY2suYXR0YWNoO1xuXHRcdG1vZHVsZS5leHBvcnRzLkZhc3RDbGljayA9IEZhc3RDbGljaztcblx0fSBlbHNlIHtcblx0XHR3aW5kb3cuRmFzdENsaWNrID0gRmFzdENsaWNrO1xuXHR9XG59KCkpO1xuIiwidmFyIFZOb2RlID0gcmVxdWlyZSgnLi92bm9kZScpO1xudmFyIGlzID0gcmVxdWlyZSgnLi9pcycpO1xuXG5mdW5jdGlvbiBhZGROUyhkYXRhLCBjaGlsZHJlbiwgc2VsKSB7XG4gIGRhdGEubnMgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnO1xuXG4gIGlmIChzZWwgIT09ICdmb3JlaWduT2JqZWN0JyAmJiBjaGlsZHJlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgYWRkTlMoY2hpbGRyZW5baV0uZGF0YSwgY2hpbGRyZW5baV0uY2hpbGRyZW4sIGNoaWxkcmVuW2ldLnNlbCk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaChzZWwsIGIsIGMpIHtcbiAgdmFyIGRhdGEgPSB7fSwgY2hpbGRyZW4sIHRleHQsIGk7XG4gIGlmIChjICE9PSB1bmRlZmluZWQpIHtcbiAgICBkYXRhID0gYjtcbiAgICBpZiAoaXMuYXJyYXkoYykpIHsgY2hpbGRyZW4gPSBjOyB9XG4gICAgZWxzZSBpZiAoaXMucHJpbWl0aXZlKGMpKSB7IHRleHQgPSBjOyB9XG4gIH0gZWxzZSBpZiAoYiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKGlzLmFycmF5KGIpKSB7IGNoaWxkcmVuID0gYjsgfVxuICAgIGVsc2UgaWYgKGlzLnByaW1pdGl2ZShiKSkgeyB0ZXh0ID0gYjsgfVxuICAgIGVsc2UgeyBkYXRhID0gYjsgfVxuICB9XG4gIGlmIChpcy5hcnJheShjaGlsZHJlbikpIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmIChpcy5wcmltaXRpdmUoY2hpbGRyZW5baV0pKSBjaGlsZHJlbltpXSA9IFZOb2RlKHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGNoaWxkcmVuW2ldKTtcbiAgICB9XG4gIH1cbiAgaWYgKHNlbFswXSA9PT0gJ3MnICYmIHNlbFsxXSA9PT0gJ3YnICYmIHNlbFsyXSA9PT0gJ2cnKSB7XG4gICAgYWRkTlMoZGF0YSwgY2hpbGRyZW4sIHNlbCk7XG4gIH1cbiAgcmV0dXJuIFZOb2RlKHNlbCwgZGF0YSwgY2hpbGRyZW4sIHRleHQsIHVuZGVmaW5lZCk7XG59O1xuIiwiZnVuY3Rpb24gY3JlYXRlRWxlbWVudCh0YWdOYW1lKXtcbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnTmFtZSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2VVUkksIHF1YWxpZmllZE5hbWUpe1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSwgcXVhbGlmaWVkTmFtZSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVRleHROb2RlKHRleHQpe1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGV4dCk7XG59XG5cblxuZnVuY3Rpb24gaW5zZXJ0QmVmb3JlKHBhcmVudE5vZGUsIG5ld05vZGUsIHJlZmVyZW5jZU5vZGUpe1xuICBwYXJlbnROb2RlLmluc2VydEJlZm9yZShuZXdOb2RlLCByZWZlcmVuY2VOb2RlKTtcbn1cblxuXG5mdW5jdGlvbiByZW1vdmVDaGlsZChub2RlLCBjaGlsZCl7XG4gIG5vZGUucmVtb3ZlQ2hpbGQoY2hpbGQpO1xufVxuXG5mdW5jdGlvbiBhcHBlbmRDaGlsZChub2RlLCBjaGlsZCl7XG4gIG5vZGUuYXBwZW5kQ2hpbGQoY2hpbGQpO1xufVxuXG5mdW5jdGlvbiBwYXJlbnROb2RlKG5vZGUpe1xuICByZXR1cm4gbm9kZS5wYXJlbnRFbGVtZW50O1xufVxuXG5mdW5jdGlvbiBuZXh0U2libGluZyhub2RlKXtcbiAgcmV0dXJuIG5vZGUubmV4dFNpYmxpbmc7XG59XG5cbmZ1bmN0aW9uIHRhZ05hbWUobm9kZSl7XG4gIHJldHVybiBub2RlLnRhZ05hbWU7XG59XG5cbmZ1bmN0aW9uIHNldFRleHRDb250ZW50KG5vZGUsIHRleHQpe1xuICBub2RlLnRleHRDb250ZW50ID0gdGV4dDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZUVsZW1lbnQ6IGNyZWF0ZUVsZW1lbnQsXG4gIGNyZWF0ZUVsZW1lbnROUzogY3JlYXRlRWxlbWVudE5TLFxuICBjcmVhdGVUZXh0Tm9kZTogY3JlYXRlVGV4dE5vZGUsXG4gIGFwcGVuZENoaWxkOiBhcHBlbmRDaGlsZCxcbiAgcmVtb3ZlQ2hpbGQ6IHJlbW92ZUNoaWxkLFxuICBpbnNlcnRCZWZvcmU6IGluc2VydEJlZm9yZSxcbiAgcGFyZW50Tm9kZTogcGFyZW50Tm9kZSxcbiAgbmV4dFNpYmxpbmc6IG5leHRTaWJsaW5nLFxuICB0YWdOYW1lOiB0YWdOYW1lLFxuICBzZXRUZXh0Q29udGVudDogc2V0VGV4dENvbnRlbnRcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgYXJyYXk6IEFycmF5LmlzQXJyYXksXG4gIHByaW1pdGl2ZTogZnVuY3Rpb24ocykgeyByZXR1cm4gdHlwZW9mIHMgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiBzID09PSAnbnVtYmVyJzsgfSxcbn07XG4iLCJ2YXIgTmFtZXNwYWNlVVJJcyA9IHtcbiAgXCJ4bGlua1wiOiBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIlxufTtcblxudmFyIGJvb2xlYW5BdHRycyA9IFtcImFsbG93ZnVsbHNjcmVlblwiLCBcImFzeW5jXCIsIFwiYXV0b2ZvY3VzXCIsIFwiYXV0b3BsYXlcIiwgXCJjaGVja2VkXCIsIFwiY29tcGFjdFwiLCBcImNvbnRyb2xzXCIsIFwiZGVjbGFyZVwiLFxuICAgICAgICAgICAgICAgIFwiZGVmYXVsdFwiLCBcImRlZmF1bHRjaGVja2VkXCIsIFwiZGVmYXVsdG11dGVkXCIsIFwiZGVmYXVsdHNlbGVjdGVkXCIsIFwiZGVmZXJcIiwgXCJkaXNhYmxlZFwiLCBcImRyYWdnYWJsZVwiLFxuICAgICAgICAgICAgICAgIFwiZW5hYmxlZFwiLCBcImZvcm1ub3ZhbGlkYXRlXCIsIFwiaGlkZGVuXCIsIFwiaW5kZXRlcm1pbmF0ZVwiLCBcImluZXJ0XCIsIFwiaXNtYXBcIiwgXCJpdGVtc2NvcGVcIiwgXCJsb29wXCIsIFwibXVsdGlwbGVcIixcbiAgICAgICAgICAgICAgICBcIm11dGVkXCIsIFwibm9ocmVmXCIsIFwibm9yZXNpemVcIiwgXCJub3NoYWRlXCIsIFwibm92YWxpZGF0ZVwiLCBcIm5vd3JhcFwiLCBcIm9wZW5cIiwgXCJwYXVzZW9uZXhpdFwiLCBcInJlYWRvbmx5XCIsXG4gICAgICAgICAgICAgICAgXCJyZXF1aXJlZFwiLCBcInJldmVyc2VkXCIsIFwic2NvcGVkXCIsIFwic2VhbWxlc3NcIiwgXCJzZWxlY3RlZFwiLCBcInNvcnRhYmxlXCIsIFwic3BlbGxjaGVja1wiLCBcInRyYW5zbGF0ZVwiLFxuICAgICAgICAgICAgICAgIFwidHJ1ZXNwZWVkXCIsIFwidHlwZW11c3RtYXRjaFwiLCBcInZpc2libGVcIl07XG5cbnZhciBib29sZWFuQXR0cnNEaWN0ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbmZvcih2YXIgaT0wLCBsZW4gPSBib29sZWFuQXR0cnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgYm9vbGVhbkF0dHJzRGljdFtib29sZWFuQXR0cnNbaV1dID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlQXR0cnMob2xkVm5vZGUsIHZub2RlKSB7XG4gIHZhciBrZXksIGN1ciwgb2xkLCBlbG0gPSB2bm9kZS5lbG0sXG4gICAgICBvbGRBdHRycyA9IG9sZFZub2RlLmRhdGEuYXR0cnMsIGF0dHJzID0gdm5vZGUuZGF0YS5hdHRycywgbmFtZXNwYWNlU3BsaXQ7XG5cbiAgaWYgKCFvbGRBdHRycyAmJiAhYXR0cnMpIHJldHVybjtcbiAgb2xkQXR0cnMgPSBvbGRBdHRycyB8fCB7fTtcbiAgYXR0cnMgPSBhdHRycyB8fCB7fTtcblxuICAvLyB1cGRhdGUgbW9kaWZpZWQgYXR0cmlidXRlcywgYWRkIG5ldyBhdHRyaWJ1dGVzXG4gIGZvciAoa2V5IGluIGF0dHJzKSB7XG4gICAgY3VyID0gYXR0cnNba2V5XTtcbiAgICBvbGQgPSBvbGRBdHRyc1trZXldO1xuICAgIGlmIChvbGQgIT09IGN1cikge1xuICAgICAgaWYoIWN1ciAmJiBib29sZWFuQXR0cnNEaWN0W2tleV0pXG4gICAgICAgIGVsbS5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgICAgIGVsc2Uge1xuICAgICAgICBuYW1lc3BhY2VTcGxpdCA9IGtleS5zcGxpdChcIjpcIik7XG4gICAgICAgIGlmKG5hbWVzcGFjZVNwbGl0Lmxlbmd0aCA+IDEgJiYgTmFtZXNwYWNlVVJJcy5oYXNPd25Qcm9wZXJ0eShuYW1lc3BhY2VTcGxpdFswXSkpXG4gICAgICAgICAgZWxtLnNldEF0dHJpYnV0ZU5TKE5hbWVzcGFjZVVSSXNbbmFtZXNwYWNlU3BsaXRbMF1dLCBrZXksIGN1cik7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlKGtleSwgY3VyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLy9yZW1vdmUgcmVtb3ZlZCBhdHRyaWJ1dGVzXG4gIC8vIHVzZSBgaW5gIG9wZXJhdG9yIHNpbmNlIHRoZSBwcmV2aW91cyBgZm9yYCBpdGVyYXRpb24gdXNlcyBpdCAoLmkuZS4gYWRkIGV2ZW4gYXR0cmlidXRlcyB3aXRoIHVuZGVmaW5lZCB2YWx1ZSlcbiAgLy8gdGhlIG90aGVyIG9wdGlvbiBpcyB0byByZW1vdmUgYWxsIGF0dHJpYnV0ZXMgd2l0aCB2YWx1ZSA9PSB1bmRlZmluZWRcbiAgZm9yIChrZXkgaW4gb2xkQXR0cnMpIHtcbiAgICBpZiAoIShrZXkgaW4gYXR0cnMpKSB7XG4gICAgICBlbG0ucmVtb3ZlQXR0cmlidXRlKGtleSk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge2NyZWF0ZTogdXBkYXRlQXR0cnMsIHVwZGF0ZTogdXBkYXRlQXR0cnN9O1xuIiwiZnVuY3Rpb24gdXBkYXRlQ2xhc3Mob2xkVm5vZGUsIHZub2RlKSB7XG4gIHZhciBjdXIsIG5hbWUsIGVsbSA9IHZub2RlLmVsbSxcbiAgICAgIG9sZENsYXNzID0gb2xkVm5vZGUuZGF0YS5jbGFzcyxcbiAgICAgIGtsYXNzID0gdm5vZGUuZGF0YS5jbGFzcztcblxuICBpZiAoIW9sZENsYXNzICYmICFrbGFzcykgcmV0dXJuO1xuICBvbGRDbGFzcyA9IG9sZENsYXNzIHx8IHt9O1xuICBrbGFzcyA9IGtsYXNzIHx8IHt9O1xuXG4gIGZvciAobmFtZSBpbiBvbGRDbGFzcykge1xuICAgIGlmICgha2xhc3NbbmFtZV0pIHtcbiAgICAgIGVsbS5jbGFzc0xpc3QucmVtb3ZlKG5hbWUpO1xuICAgIH1cbiAgfVxuICBmb3IgKG5hbWUgaW4ga2xhc3MpIHtcbiAgICBjdXIgPSBrbGFzc1tuYW1lXTtcbiAgICBpZiAoY3VyICE9PSBvbGRDbGFzc1tuYW1lXSkge1xuICAgICAgZWxtLmNsYXNzTGlzdFtjdXIgPyAnYWRkJyA6ICdyZW1vdmUnXShuYW1lKTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7Y3JlYXRlOiB1cGRhdGVDbGFzcywgdXBkYXRlOiB1cGRhdGVDbGFzc307XG4iLCJmdW5jdGlvbiBpbnZva2VIYW5kbGVyKGhhbmRsZXIsIHZub2RlLCBldmVudCkge1xuICBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIC8vIGNhbGwgZnVuY3Rpb24gaGFuZGxlclxuICAgIGhhbmRsZXIuY2FsbCh2bm9kZSwgZXZlbnQsIHZub2RlKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJvYmplY3RcIikge1xuICAgIC8vIGNhbGwgaGFuZGxlciB3aXRoIGFyZ3VtZW50c1xuICAgIGlmICh0eXBlb2YgaGFuZGxlclswXSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAvLyBzcGVjaWFsIGNhc2UgZm9yIHNpbmdsZSBhcmd1bWVudCBmb3IgcGVyZm9ybWFuY2VcbiAgICAgIGlmIChoYW5kbGVyLmxlbmd0aCA9PT0gMikge1xuICAgICAgICBoYW5kbGVyWzBdLmNhbGwodm5vZGUsIGhhbmRsZXJbMV0sIGV2ZW50LCB2bm9kZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgYXJncyA9IGhhbmRsZXIuc2xpY2UoMSk7XG4gICAgICAgIGFyZ3MucHVzaChldmVudCk7XG4gICAgICAgIGFyZ3MucHVzaCh2bm9kZSk7XG4gICAgICAgIGhhbmRsZXJbMF0uYXBwbHkodm5vZGUsIGFyZ3MpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBjYWxsIG11bHRpcGxlIGhhbmRsZXJzXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhhbmRsZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaW52b2tlSGFuZGxlcihoYW5kbGVyW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlRXZlbnQoZXZlbnQsIHZub2RlKSB7XG4gIHZhciBuYW1lID0gZXZlbnQudHlwZSxcbiAgICAgIG9uID0gdm5vZGUuZGF0YS5vbjtcblxuICAvLyBjYWxsIGV2ZW50IGhhbmRsZXIocykgaWYgZXhpc3RzXG4gIGlmIChvbiAmJiBvbltuYW1lXSkge1xuICAgIGludm9rZUhhbmRsZXIob25bbmFtZV0sIHZub2RlLCBldmVudCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlTGlzdGVuZXIoKSB7XG4gIHJldHVybiBmdW5jdGlvbiBoYW5kbGVyKGV2ZW50KSB7XG4gICAgaGFuZGxlRXZlbnQoZXZlbnQsIGhhbmRsZXIudm5vZGUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUV2ZW50TGlzdGVuZXJzKG9sZFZub2RlLCB2bm9kZSkge1xuICB2YXIgb2xkT24gPSBvbGRWbm9kZS5kYXRhLm9uLFxuICAgICAgb2xkTGlzdGVuZXIgPSBvbGRWbm9kZS5saXN0ZW5lcixcbiAgICAgIG9sZEVsbSA9IG9sZFZub2RlLmVsbSxcbiAgICAgIG9uID0gdm5vZGUgJiYgdm5vZGUuZGF0YS5vbixcbiAgICAgIGVsbSA9IHZub2RlICYmIHZub2RlLmVsbSxcbiAgICAgIG5hbWU7XG5cbiAgLy8gb3B0aW1pemF0aW9uIGZvciByZXVzZWQgaW1tdXRhYmxlIGhhbmRsZXJzXG4gIGlmIChvbGRPbiA9PT0gb24pIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyByZW1vdmUgZXhpc3RpbmcgbGlzdGVuZXJzIHdoaWNoIG5vIGxvbmdlciB1c2VkXG4gIGlmIChvbGRPbiAmJiBvbGRMaXN0ZW5lcikge1xuICAgIC8vIGlmIGVsZW1lbnQgY2hhbmdlZCBvciBkZWxldGVkIHdlIHJlbW92ZSBhbGwgZXhpc3RpbmcgbGlzdGVuZXJzIHVuY29uZGl0aW9uYWxseVxuICAgIGlmICghb24pIHtcbiAgICAgIGZvciAobmFtZSBpbiBvbGRPbikge1xuICAgICAgICAvLyByZW1vdmUgbGlzdGVuZXIgaWYgZWxlbWVudCB3YXMgY2hhbmdlZCBvciBleGlzdGluZyBsaXN0ZW5lcnMgcmVtb3ZlZFxuICAgICAgICBvbGRFbG0ucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCBvbGRMaXN0ZW5lciwgZmFsc2UpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKG5hbWUgaW4gb2xkT24pIHtcbiAgICAgICAgLy8gcmVtb3ZlIGxpc3RlbmVyIGlmIGV4aXN0aW5nIGxpc3RlbmVyIHJlbW92ZWRcbiAgICAgICAgaWYgKCFvbltuYW1lXSkge1xuICAgICAgICAgIG9sZEVsbS5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIG9sZExpc3RlbmVyLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBhZGQgbmV3IGxpc3RlbmVycyB3aGljaCBoYXMgbm90IGFscmVhZHkgYXR0YWNoZWRcbiAgaWYgKG9uKSB7XG4gICAgLy8gcmV1c2UgZXhpc3RpbmcgbGlzdGVuZXIgb3IgY3JlYXRlIG5ld1xuICAgIHZhciBsaXN0ZW5lciA9IHZub2RlLmxpc3RlbmVyID0gb2xkVm5vZGUubGlzdGVuZXIgfHwgY3JlYXRlTGlzdGVuZXIoKTtcbiAgICAvLyB1cGRhdGUgdm5vZGUgZm9yIGxpc3RlbmVyXG4gICAgbGlzdGVuZXIudm5vZGUgPSB2bm9kZTtcblxuICAgIC8vIGlmIGVsZW1lbnQgY2hhbmdlZCBvciBhZGRlZCB3ZSBhZGQgYWxsIG5lZWRlZCBsaXN0ZW5lcnMgdW5jb25kaXRpb25hbGx5XG4gICAgaWYgKCFvbGRPbikge1xuICAgICAgZm9yIChuYW1lIGluIG9uKSB7XG4gICAgICAgIC8vIGFkZCBsaXN0ZW5lciBpZiBlbGVtZW50IHdhcyBjaGFuZ2VkIG9yIG5ldyBsaXN0ZW5lcnMgYWRkZWRcbiAgICAgICAgZWxtLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgbGlzdGVuZXIsIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChuYW1lIGluIG9uKSB7XG4gICAgICAgIC8vIGFkZCBsaXN0ZW5lciBpZiBuZXcgbGlzdGVuZXIgYWRkZWRcbiAgICAgICAgaWYgKCFvbGRPbltuYW1lXSkge1xuICAgICAgICAgIGVsbS5hZGRFdmVudExpc3RlbmVyKG5hbWUsIGxpc3RlbmVyLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogdXBkYXRlRXZlbnRMaXN0ZW5lcnMsXG4gIHVwZGF0ZTogdXBkYXRlRXZlbnRMaXN0ZW5lcnMsXG4gIGRlc3Ryb3k6IHVwZGF0ZUV2ZW50TGlzdGVuZXJzXG59O1xuIiwiZnVuY3Rpb24gdXBkYXRlUHJvcHMob2xkVm5vZGUsIHZub2RlKSB7XG4gIHZhciBrZXksIGN1ciwgb2xkLCBlbG0gPSB2bm9kZS5lbG0sXG4gICAgICBvbGRQcm9wcyA9IG9sZFZub2RlLmRhdGEucHJvcHMsIHByb3BzID0gdm5vZGUuZGF0YS5wcm9wcztcblxuICBpZiAoIW9sZFByb3BzICYmICFwcm9wcykgcmV0dXJuO1xuICBvbGRQcm9wcyA9IG9sZFByb3BzIHx8IHt9O1xuICBwcm9wcyA9IHByb3BzIHx8IHt9O1xuXG4gIGZvciAoa2V5IGluIG9sZFByb3BzKSB7XG4gICAgaWYgKCFwcm9wc1trZXldKSB7XG4gICAgICBkZWxldGUgZWxtW2tleV07XG4gICAgfVxuICB9XG4gIGZvciAoa2V5IGluIHByb3BzKSB7XG4gICAgY3VyID0gcHJvcHNba2V5XTtcbiAgICBvbGQgPSBvbGRQcm9wc1trZXldO1xuICAgIGlmIChvbGQgIT09IGN1ciAmJiAoa2V5ICE9PSAndmFsdWUnIHx8IGVsbVtrZXldICE9PSBjdXIpKSB7XG4gICAgICBlbG1ba2V5XSA9IGN1cjtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7Y3JlYXRlOiB1cGRhdGVQcm9wcywgdXBkYXRlOiB1cGRhdGVQcm9wc307XG4iLCJ2YXIgcmFmID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUpIHx8IHNldFRpbWVvdXQ7XG52YXIgbmV4dEZyYW1lID0gZnVuY3Rpb24oZm4pIHsgcmFmKGZ1bmN0aW9uKCkgeyByYWYoZm4pOyB9KTsgfTtcblxuZnVuY3Rpb24gc2V0TmV4dEZyYW1lKG9iaiwgcHJvcCwgdmFsKSB7XG4gIG5leHRGcmFtZShmdW5jdGlvbigpIHsgb2JqW3Byb3BdID0gdmFsOyB9KTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlU3R5bGUob2xkVm5vZGUsIHZub2RlKSB7XG4gIHZhciBjdXIsIG5hbWUsIGVsbSA9IHZub2RlLmVsbSxcbiAgICAgIG9sZFN0eWxlID0gb2xkVm5vZGUuZGF0YS5zdHlsZSxcbiAgICAgIHN0eWxlID0gdm5vZGUuZGF0YS5zdHlsZTtcblxuICBpZiAoIW9sZFN0eWxlICYmICFzdHlsZSkgcmV0dXJuO1xuICBvbGRTdHlsZSA9IG9sZFN0eWxlIHx8IHt9O1xuICBzdHlsZSA9IHN0eWxlIHx8IHt9O1xuICB2YXIgb2xkSGFzRGVsID0gJ2RlbGF5ZWQnIGluIG9sZFN0eWxlO1xuXG4gIGZvciAobmFtZSBpbiBvbGRTdHlsZSkge1xuICAgIGlmICghc3R5bGVbbmFtZV0pIHtcbiAgICAgIGVsbS5zdHlsZVtuYW1lXSA9ICcnO1xuICAgIH1cbiAgfVxuICBmb3IgKG5hbWUgaW4gc3R5bGUpIHtcbiAgICBjdXIgPSBzdHlsZVtuYW1lXTtcbiAgICBpZiAobmFtZSA9PT0gJ2RlbGF5ZWQnKSB7XG4gICAgICBmb3IgKG5hbWUgaW4gc3R5bGUuZGVsYXllZCkge1xuICAgICAgICBjdXIgPSBzdHlsZS5kZWxheWVkW25hbWVdO1xuICAgICAgICBpZiAoIW9sZEhhc0RlbCB8fCBjdXIgIT09IG9sZFN0eWxlLmRlbGF5ZWRbbmFtZV0pIHtcbiAgICAgICAgICBzZXROZXh0RnJhbWUoZWxtLnN0eWxlLCBuYW1lLCBjdXIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChuYW1lICE9PSAncmVtb3ZlJyAmJiBjdXIgIT09IG9sZFN0eWxlW25hbWVdKSB7XG4gICAgICBlbG0uc3R5bGVbbmFtZV0gPSBjdXI7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGFwcGx5RGVzdHJveVN0eWxlKHZub2RlKSB7XG4gIHZhciBzdHlsZSwgbmFtZSwgZWxtID0gdm5vZGUuZWxtLCBzID0gdm5vZGUuZGF0YS5zdHlsZTtcbiAgaWYgKCFzIHx8ICEoc3R5bGUgPSBzLmRlc3Ryb3kpKSByZXR1cm47XG4gIGZvciAobmFtZSBpbiBzdHlsZSkge1xuICAgIGVsbS5zdHlsZVtuYW1lXSA9IHN0eWxlW25hbWVdO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFwcGx5UmVtb3ZlU3R5bGUodm5vZGUsIHJtKSB7XG4gIHZhciBzID0gdm5vZGUuZGF0YS5zdHlsZTtcbiAgaWYgKCFzIHx8ICFzLnJlbW92ZSkge1xuICAgIHJtKCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBuYW1lLCBlbG0gPSB2bm9kZS5lbG0sIGlkeCwgaSA9IDAsIG1heER1ciA9IDAsXG4gICAgICBjb21wU3R5bGUsIHN0eWxlID0gcy5yZW1vdmUsIGFtb3VudCA9IDAsIGFwcGxpZWQgPSBbXTtcbiAgZm9yIChuYW1lIGluIHN0eWxlKSB7XG4gICAgYXBwbGllZC5wdXNoKG5hbWUpO1xuICAgIGVsbS5zdHlsZVtuYW1lXSA9IHN0eWxlW25hbWVdO1xuICB9XG4gIGNvbXBTdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWxtKTtcbiAgdmFyIHByb3BzID0gY29tcFN0eWxlWyd0cmFuc2l0aW9uLXByb3BlcnR5J10uc3BsaXQoJywgJyk7XG4gIGZvciAoOyBpIDwgcHJvcHMubGVuZ3RoOyArK2kpIHtcbiAgICBpZihhcHBsaWVkLmluZGV4T2YocHJvcHNbaV0pICE9PSAtMSkgYW1vdW50Kys7XG4gIH1cbiAgZWxtLmFkZEV2ZW50TGlzdGVuZXIoJ3RyYW5zaXRpb25lbmQnLCBmdW5jdGlvbihldikge1xuICAgIGlmIChldi50YXJnZXQgPT09IGVsbSkgLS1hbW91bnQ7XG4gICAgaWYgKGFtb3VudCA9PT0gMCkgcm0oKTtcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge2NyZWF0ZTogdXBkYXRlU3R5bGUsIHVwZGF0ZTogdXBkYXRlU3R5bGUsIGRlc3Ryb3k6IGFwcGx5RGVzdHJveVN0eWxlLCByZW1vdmU6IGFwcGx5UmVtb3ZlU3R5bGV9O1xuIiwiLy8ganNoaW50IG5ld2NhcDogZmFsc2Vcbi8qIGdsb2JhbCByZXF1aXJlLCBtb2R1bGUsIGRvY3VtZW50LCBOb2RlICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBWTm9kZSA9IHJlcXVpcmUoJy4vdm5vZGUnKTtcbnZhciBpcyA9IHJlcXVpcmUoJy4vaXMnKTtcbnZhciBkb21BcGkgPSByZXF1aXJlKCcuL2h0bWxkb21hcGknKTtcblxuZnVuY3Rpb24gaXNVbmRlZihzKSB7IHJldHVybiBzID09PSB1bmRlZmluZWQ7IH1cbmZ1bmN0aW9uIGlzRGVmKHMpIHsgcmV0dXJuIHMgIT09IHVuZGVmaW5lZDsgfVxuXG52YXIgZW1wdHlOb2RlID0gVk5vZGUoJycsIHt9LCBbXSwgdW5kZWZpbmVkLCB1bmRlZmluZWQpO1xuXG5mdW5jdGlvbiBzYW1lVm5vZGUodm5vZGUxLCB2bm9kZTIpIHtcbiAgcmV0dXJuIHZub2RlMS5rZXkgPT09IHZub2RlMi5rZXkgJiYgdm5vZGUxLnNlbCA9PT0gdm5vZGUyLnNlbDtcbn1cblxuZnVuY3Rpb24gY3JlYXRlS2V5VG9PbGRJZHgoY2hpbGRyZW4sIGJlZ2luSWR4LCBlbmRJZHgpIHtcbiAgdmFyIGksIG1hcCA9IHt9LCBrZXk7XG4gIGZvciAoaSA9IGJlZ2luSWR4OyBpIDw9IGVuZElkeDsgKytpKSB7XG4gICAga2V5ID0gY2hpbGRyZW5baV0ua2V5O1xuICAgIGlmIChpc0RlZihrZXkpKSBtYXBba2V5XSA9IGk7XG4gIH1cbiAgcmV0dXJuIG1hcDtcbn1cblxudmFyIGhvb2tzID0gWydjcmVhdGUnLCAndXBkYXRlJywgJ3JlbW92ZScsICdkZXN0cm95JywgJ3ByZScsICdwb3N0J107XG5cbmZ1bmN0aW9uIGluaXQobW9kdWxlcywgYXBpKSB7XG4gIHZhciBpLCBqLCBjYnMgPSB7fTtcblxuICBpZiAoaXNVbmRlZihhcGkpKSBhcGkgPSBkb21BcGk7XG5cbiAgZm9yIChpID0gMDsgaSA8IGhvb2tzLmxlbmd0aDsgKytpKSB7XG4gICAgY2JzW2hvb2tzW2ldXSA9IFtdO1xuICAgIGZvciAoaiA9IDA7IGogPCBtb2R1bGVzLmxlbmd0aDsgKytqKSB7XG4gICAgICBpZiAobW9kdWxlc1tqXVtob29rc1tpXV0gIT09IHVuZGVmaW5lZCkgY2JzW2hvb2tzW2ldXS5wdXNoKG1vZHVsZXNbal1baG9va3NbaV1dKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBlbXB0eU5vZGVBdChlbG0pIHtcbiAgICB2YXIgaWQgPSBlbG0uaWQgPyAnIycgKyBlbG0uaWQgOiAnJztcbiAgICB2YXIgYyA9IGVsbS5jbGFzc05hbWUgPyAnLicgKyBlbG0uY2xhc3NOYW1lLnNwbGl0KCcgJykuam9pbignLicpIDogJyc7XG4gICAgcmV0dXJuIFZOb2RlKGFwaS50YWdOYW1lKGVsbSkudG9Mb3dlckNhc2UoKSArIGlkICsgYywge30sIFtdLCB1bmRlZmluZWQsIGVsbSk7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVSbUNiKGNoaWxkRWxtLCBsaXN0ZW5lcnMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoLS1saXN0ZW5lcnMgPT09IDApIHtcbiAgICAgICAgdmFyIHBhcmVudCA9IGFwaS5wYXJlbnROb2RlKGNoaWxkRWxtKTtcbiAgICAgICAgYXBpLnJlbW92ZUNoaWxkKHBhcmVudCwgY2hpbGRFbG0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVFbG0odm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgIHZhciBpLCBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICBpZiAoaXNEZWYoZGF0YSkpIHtcbiAgICAgIGlmIChpc0RlZihpID0gZGF0YS5ob29rKSAmJiBpc0RlZihpID0gaS5pbml0KSkge1xuICAgICAgICBpKHZub2RlKTtcbiAgICAgICAgZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBlbG0sIGNoaWxkcmVuID0gdm5vZGUuY2hpbGRyZW4sIHNlbCA9IHZub2RlLnNlbDtcbiAgICBpZiAoaXNEZWYoc2VsKSkge1xuICAgICAgLy8gUGFyc2Ugc2VsZWN0b3JcbiAgICAgIHZhciBoYXNoSWR4ID0gc2VsLmluZGV4T2YoJyMnKTtcbiAgICAgIHZhciBkb3RJZHggPSBzZWwuaW5kZXhPZignLicsIGhhc2hJZHgpO1xuICAgICAgdmFyIGhhc2ggPSBoYXNoSWR4ID4gMCA/IGhhc2hJZHggOiBzZWwubGVuZ3RoO1xuICAgICAgdmFyIGRvdCA9IGRvdElkeCA+IDAgPyBkb3RJZHggOiBzZWwubGVuZ3RoO1xuICAgICAgdmFyIHRhZyA9IGhhc2hJZHggIT09IC0xIHx8IGRvdElkeCAhPT0gLTEgPyBzZWwuc2xpY2UoMCwgTWF0aC5taW4oaGFzaCwgZG90KSkgOiBzZWw7XG4gICAgICBlbG0gPSB2bm9kZS5lbG0gPSBpc0RlZihkYXRhKSAmJiBpc0RlZihpID0gZGF0YS5ucykgPyBhcGkuY3JlYXRlRWxlbWVudE5TKGksIHRhZylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IGFwaS5jcmVhdGVFbGVtZW50KHRhZyk7XG4gICAgICBpZiAoaGFzaCA8IGRvdCkgZWxtLmlkID0gc2VsLnNsaWNlKGhhc2ggKyAxLCBkb3QpO1xuICAgICAgaWYgKGRvdElkeCA+IDApIGVsbS5jbGFzc05hbWUgPSBzZWwuc2xpY2UoZG90ICsgMSkucmVwbGFjZSgvXFwuL2csICcgJyk7XG4gICAgICBpZiAoaXMuYXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgIGFwaS5hcHBlbmRDaGlsZChlbG0sIGNyZWF0ZUVsbShjaGlsZHJlbltpXSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoaXMucHJpbWl0aXZlKHZub2RlLnRleHQpKSB7XG4gICAgICAgIGFwaS5hcHBlbmRDaGlsZChlbG0sIGFwaS5jcmVhdGVUZXh0Tm9kZSh2bm9kZS50ZXh0KSk7XG4gICAgICB9XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLmNyZWF0ZS5sZW5ndGg7ICsraSkgY2JzLmNyZWF0ZVtpXShlbXB0eU5vZGUsIHZub2RlKTtcbiAgICAgIGkgPSB2bm9kZS5kYXRhLmhvb2s7IC8vIFJldXNlIHZhcmlhYmxlXG4gICAgICBpZiAoaXNEZWYoaSkpIHtcbiAgICAgICAgaWYgKGkuY3JlYXRlKSBpLmNyZWF0ZShlbXB0eU5vZGUsIHZub2RlKTtcbiAgICAgICAgaWYgKGkuaW5zZXJ0KSBpbnNlcnRlZFZub2RlUXVldWUucHVzaCh2bm9kZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsbSA9IHZub2RlLmVsbSA9IGFwaS5jcmVhdGVUZXh0Tm9kZSh2bm9kZS50ZXh0KTtcbiAgICB9XG4gICAgcmV0dXJuIHZub2RlLmVsbTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZFZub2RlcyhwYXJlbnRFbG0sIGJlZm9yZSwgdm5vZGVzLCBzdGFydElkeCwgZW5kSWR4LCBpbnNlcnRlZFZub2RlUXVldWUpIHtcbiAgICBmb3IgKDsgc3RhcnRJZHggPD0gZW5kSWR4OyArK3N0YXJ0SWR4KSB7XG4gICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgY3JlYXRlRWxtKHZub2Rlc1tzdGFydElkeF0sIGluc2VydGVkVm5vZGVRdWV1ZSksIGJlZm9yZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW52b2tlRGVzdHJveUhvb2sodm5vZGUpIHtcbiAgICB2YXIgaSwgaiwgZGF0YSA9IHZub2RlLmRhdGE7XG4gICAgaWYgKGlzRGVmKGRhdGEpKSB7XG4gICAgICBpZiAoaXNEZWYoaSA9IGRhdGEuaG9vaykgJiYgaXNEZWYoaSA9IGkuZGVzdHJveSkpIGkodm5vZGUpO1xuICAgICAgZm9yIChpID0gMDsgaSA8IGNicy5kZXN0cm95Lmxlbmd0aDsgKytpKSBjYnMuZGVzdHJveVtpXSh2bm9kZSk7XG4gICAgICBpZiAoaXNEZWYoaSA9IHZub2RlLmNoaWxkcmVuKSkge1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgdm5vZGUuY2hpbGRyZW4ubGVuZ3RoOyArK2opIHtcbiAgICAgICAgICBpbnZva2VEZXN0cm95SG9vayh2bm9kZS5jaGlsZHJlbltqXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVWbm9kZXMocGFyZW50RWxtLCB2bm9kZXMsIHN0YXJ0SWR4LCBlbmRJZHgpIHtcbiAgICBmb3IgKDsgc3RhcnRJZHggPD0gZW5kSWR4OyArK3N0YXJ0SWR4KSB7XG4gICAgICB2YXIgaSwgbGlzdGVuZXJzLCBybSwgY2ggPSB2bm9kZXNbc3RhcnRJZHhdO1xuICAgICAgaWYgKGlzRGVmKGNoKSkge1xuICAgICAgICBpZiAoaXNEZWYoY2guc2VsKSkge1xuICAgICAgICAgIGludm9rZURlc3Ryb3lIb29rKGNoKTtcbiAgICAgICAgICBsaXN0ZW5lcnMgPSBjYnMucmVtb3ZlLmxlbmd0aCArIDE7XG4gICAgICAgICAgcm0gPSBjcmVhdGVSbUNiKGNoLmVsbSwgbGlzdGVuZXJzKTtcbiAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLnJlbW92ZS5sZW5ndGg7ICsraSkgY2JzLnJlbW92ZVtpXShjaCwgcm0pO1xuICAgICAgICAgIGlmIChpc0RlZihpID0gY2guZGF0YSkgJiYgaXNEZWYoaSA9IGkuaG9vaykgJiYgaXNEZWYoaSA9IGkucmVtb3ZlKSkge1xuICAgICAgICAgICAgaShjaCwgcm0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBybSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHsgLy8gVGV4dCBub2RlXG4gICAgICAgICAgYXBpLnJlbW92ZUNoaWxkKHBhcmVudEVsbSwgY2guZWxtKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUNoaWxkcmVuKHBhcmVudEVsbSwgb2xkQ2gsIG5ld0NoLCBpbnNlcnRlZFZub2RlUXVldWUpIHtcbiAgICB2YXIgb2xkU3RhcnRJZHggPSAwLCBuZXdTdGFydElkeCA9IDA7XG4gICAgdmFyIG9sZEVuZElkeCA9IG9sZENoLmxlbmd0aCAtIDE7XG4gICAgdmFyIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFswXTtcbiAgICB2YXIgb2xkRW5kVm5vZGUgPSBvbGRDaFtvbGRFbmRJZHhdO1xuICAgIHZhciBuZXdFbmRJZHggPSBuZXdDaC5sZW5ndGggLSAxO1xuICAgIHZhciBuZXdTdGFydFZub2RlID0gbmV3Q2hbMF07XG4gICAgdmFyIG5ld0VuZFZub2RlID0gbmV3Q2hbbmV3RW5kSWR4XTtcbiAgICB2YXIgb2xkS2V5VG9JZHgsIGlkeEluT2xkLCBlbG1Ub01vdmUsIGJlZm9yZTtcblxuICAgIHdoaWxlIChvbGRTdGFydElkeCA8PSBvbGRFbmRJZHggJiYgbmV3U3RhcnRJZHggPD0gbmV3RW5kSWR4KSB7XG4gICAgICBpZiAoaXNVbmRlZihvbGRTdGFydFZub2RlKSkge1xuICAgICAgICBvbGRTdGFydFZub2RlID0gb2xkQ2hbKytvbGRTdGFydElkeF07IC8vIFZub2RlIGhhcyBiZWVuIG1vdmVkIGxlZnRcbiAgICAgIH0gZWxzZSBpZiAoaXNVbmRlZihvbGRFbmRWbm9kZSkpIHtcbiAgICAgICAgb2xkRW5kVm5vZGUgPSBvbGRDaFstLW9sZEVuZElkeF07XG4gICAgICB9IGVsc2UgaWYgKHNhbWVWbm9kZShvbGRTdGFydFZub2RlLCBuZXdTdGFydFZub2RlKSkge1xuICAgICAgICBwYXRjaFZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFsrK29sZFN0YXJ0SWR4XTtcbiAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgfSBlbHNlIGlmIChzYW1lVm5vZGUob2xkRW5kVm5vZGUsIG5ld0VuZFZub2RlKSkge1xuICAgICAgICBwYXRjaFZub2RlKG9sZEVuZFZub2RlLCBuZXdFbmRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgb2xkRW5kVm5vZGUgPSBvbGRDaFstLW9sZEVuZElkeF07XG4gICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgfSBlbHNlIGlmIChzYW1lVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3RW5kVm5vZGUpKSB7IC8vIFZub2RlIG1vdmVkIHJpZ2h0XG4gICAgICAgIHBhdGNoVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3RW5kVm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBvbGRTdGFydFZub2RlLmVsbSwgYXBpLm5leHRTaWJsaW5nKG9sZEVuZFZub2RlLmVsbSkpO1xuICAgICAgICBvbGRTdGFydFZub2RlID0gb2xkQ2hbKytvbGRTdGFydElkeF07XG4gICAgICAgIG5ld0VuZFZub2RlID0gbmV3Q2hbLS1uZXdFbmRJZHhdO1xuICAgICAgfSBlbHNlIGlmIChzYW1lVm5vZGUob2xkRW5kVm5vZGUsIG5ld1N0YXJ0Vm5vZGUpKSB7IC8vIFZub2RlIG1vdmVkIGxlZnRcbiAgICAgICAgcGF0Y2hWbm9kZShvbGRFbmRWbm9kZSwgbmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZEVuZFZub2RlLmVsbSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICBvbGRFbmRWbm9kZSA9IG9sZENoWy0tb2xkRW5kSWR4XTtcbiAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGlzVW5kZWYob2xkS2V5VG9JZHgpKSBvbGRLZXlUb0lkeCA9IGNyZWF0ZUtleVRvT2xkSWR4KG9sZENoLCBvbGRTdGFydElkeCwgb2xkRW5kSWR4KTtcbiAgICAgICAgaWR4SW5PbGQgPSBvbGRLZXlUb0lkeFtuZXdTdGFydFZub2RlLmtleV07XG4gICAgICAgIGlmIChpc1VuZGVmKGlkeEluT2xkKSkgeyAvLyBOZXcgZWxlbWVudFxuICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBjcmVhdGVFbG0obmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSwgb2xkU3RhcnRWbm9kZS5lbG0pO1xuICAgICAgICAgIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFsrK25ld1N0YXJ0SWR4XTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbG1Ub01vdmUgPSBvbGRDaFtpZHhJbk9sZF07XG4gICAgICAgICAgcGF0Y2hWbm9kZShlbG1Ub01vdmUsIG5ld1N0YXJ0Vm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICAgICAgb2xkQ2hbaWR4SW5PbGRdID0gdW5kZWZpbmVkO1xuICAgICAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBlbG1Ub01vdmUuZWxtLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChvbGRTdGFydElkeCA+IG9sZEVuZElkeCkge1xuICAgICAgYmVmb3JlID0gaXNVbmRlZihuZXdDaFtuZXdFbmRJZHgrMV0pID8gbnVsbCA6IG5ld0NoW25ld0VuZElkeCsxXS5lbG07XG4gICAgICBhZGRWbm9kZXMocGFyZW50RWxtLCBiZWZvcmUsIG5ld0NoLCBuZXdTdGFydElkeCwgbmV3RW5kSWR4LCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgIH0gZWxzZSBpZiAobmV3U3RhcnRJZHggPiBuZXdFbmRJZHgpIHtcbiAgICAgIHJlbW92ZVZub2RlcyhwYXJlbnRFbG0sIG9sZENoLCBvbGRTdGFydElkeCwgb2xkRW5kSWR4KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBwYXRjaFZub2RlKG9sZFZub2RlLCB2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgdmFyIGksIGhvb2s7XG4gICAgaWYgKGlzRGVmKGkgPSB2bm9kZS5kYXRhKSAmJiBpc0RlZihob29rID0gaS5ob29rKSAmJiBpc0RlZihpID0gaG9vay5wcmVwYXRjaCkpIHtcbiAgICAgIGkob2xkVm5vZGUsIHZub2RlKTtcbiAgICB9XG4gICAgdmFyIGVsbSA9IHZub2RlLmVsbSA9IG9sZFZub2RlLmVsbSwgb2xkQ2ggPSBvbGRWbm9kZS5jaGlsZHJlbiwgY2ggPSB2bm9kZS5jaGlsZHJlbjtcbiAgICBpZiAob2xkVm5vZGUgPT09IHZub2RlKSByZXR1cm47XG4gICAgaWYgKCFzYW1lVm5vZGUob2xkVm5vZGUsIHZub2RlKSkge1xuICAgICAgdmFyIHBhcmVudEVsbSA9IGFwaS5wYXJlbnROb2RlKG9sZFZub2RlLmVsbSk7XG4gICAgICBlbG0gPSBjcmVhdGVFbG0odm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgZWxtLCBvbGRWbm9kZS5lbG0pO1xuICAgICAgcmVtb3ZlVm5vZGVzKHBhcmVudEVsbSwgW29sZFZub2RlXSwgMCwgMCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChpc0RlZih2bm9kZS5kYXRhKSkge1xuICAgICAgZm9yIChpID0gMDsgaSA8IGNicy51cGRhdGUubGVuZ3RoOyArK2kpIGNicy51cGRhdGVbaV0ob2xkVm5vZGUsIHZub2RlKTtcbiAgICAgIGkgPSB2bm9kZS5kYXRhLmhvb2s7XG4gICAgICBpZiAoaXNEZWYoaSkgJiYgaXNEZWYoaSA9IGkudXBkYXRlKSkgaShvbGRWbm9kZSwgdm5vZGUpO1xuICAgIH1cbiAgICBpZiAoaXNVbmRlZih2bm9kZS50ZXh0KSkge1xuICAgICAgaWYgKGlzRGVmKG9sZENoKSAmJiBpc0RlZihjaCkpIHtcbiAgICAgICAgaWYgKG9sZENoICE9PSBjaCkgdXBkYXRlQ2hpbGRyZW4oZWxtLCBvbGRDaCwgY2gsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzRGVmKGNoKSkge1xuICAgICAgICBpZiAoaXNEZWYob2xkVm5vZGUudGV4dCkpIGFwaS5zZXRUZXh0Q29udGVudChlbG0sICcnKTtcbiAgICAgICAgYWRkVm5vZGVzKGVsbSwgbnVsbCwgY2gsIDAsIGNoLmxlbmd0aCAtIDEsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzRGVmKG9sZENoKSkge1xuICAgICAgICByZW1vdmVWbm9kZXMoZWxtLCBvbGRDaCwgMCwgb2xkQ2gubGVuZ3RoIC0gMSk7XG4gICAgICB9IGVsc2UgaWYgKGlzRGVmKG9sZFZub2RlLnRleHQpKSB7XG4gICAgICAgIGFwaS5zZXRUZXh0Q29udGVudChlbG0sICcnKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG9sZFZub2RlLnRleHQgIT09IHZub2RlLnRleHQpIHtcbiAgICAgIGFwaS5zZXRUZXh0Q29udGVudChlbG0sIHZub2RlLnRleHQpO1xuICAgIH1cbiAgICBpZiAoaXNEZWYoaG9vaykgJiYgaXNEZWYoaSA9IGhvb2sucG9zdHBhdGNoKSkge1xuICAgICAgaShvbGRWbm9kZSwgdm5vZGUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbihvbGRWbm9kZSwgdm5vZGUpIHtcbiAgICB2YXIgaSwgZWxtLCBwYXJlbnQ7XG4gICAgdmFyIGluc2VydGVkVm5vZGVRdWV1ZSA9IFtdO1xuICAgIGZvciAoaSA9IDA7IGkgPCBjYnMucHJlLmxlbmd0aDsgKytpKSBjYnMucHJlW2ldKCk7XG5cbiAgICBpZiAoaXNVbmRlZihvbGRWbm9kZS5zZWwpKSB7XG4gICAgICBvbGRWbm9kZSA9IGVtcHR5Tm9kZUF0KG9sZFZub2RlKTtcbiAgICB9XG5cbiAgICBpZiAoc2FtZVZub2RlKG9sZFZub2RlLCB2bm9kZSkpIHtcbiAgICAgIHBhdGNoVm5vZGUob2xkVm5vZGUsIHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbG0gPSBvbGRWbm9kZS5lbG07XG4gICAgICBwYXJlbnQgPSBhcGkucGFyZW50Tm9kZShlbG0pO1xuXG4gICAgICBjcmVhdGVFbG0odm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG5cbiAgICAgIGlmIChwYXJlbnQgIT09IG51bGwpIHtcbiAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnQsIHZub2RlLmVsbSwgYXBpLm5leHRTaWJsaW5nKGVsbSkpO1xuICAgICAgICByZW1vdmVWbm9kZXMocGFyZW50LCBbb2xkVm5vZGVdLCAwLCAwKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgaW5zZXJ0ZWRWbm9kZVF1ZXVlLmxlbmd0aDsgKytpKSB7XG4gICAgICBpbnNlcnRlZFZub2RlUXVldWVbaV0uZGF0YS5ob29rLmluc2VydChpbnNlcnRlZFZub2RlUXVldWVbaV0pO1xuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLnBvc3QubGVuZ3RoOyArK2kpIGNicy5wb3N0W2ldKCk7XG4gICAgcmV0dXJuIHZub2RlO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtpbml0OiBpbml0fTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2VsLCBkYXRhLCBjaGlsZHJlbiwgdGV4dCwgZWxtKSB7XG4gIHZhciBrZXkgPSBkYXRhID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBkYXRhLmtleTtcbiAgcmV0dXJuIHtzZWw6IHNlbCwgZGF0YTogZGF0YSwgY2hpbGRyZW46IGNoaWxkcmVuLFxuICAgICAgICAgIHRleHQ6IHRleHQsIGVsbTogZWxtLCBrZXk6IGtleX07XG59O1xuIiwiZnVuY3Rpb24gdXBkYXRlUHJvcHMob2xkVm5vZGUsIHZub2RlKSB7XHJcbiAgICBsZXQga2V5LCBjdXIsIG9sZCwgZWxtID0gdm5vZGUuZWxtLFxyXG4gICAgICAgIHByb3BzID0gdm5vZGUuZGF0YS5saXZlUHJvcHMgfHwge307XHJcbiAgICBmb3IgKGtleSBpbiBwcm9wcykge1xyXG4gICAgICAgIGN1ciA9IHByb3BzW2tleV07XHJcbiAgICAgICAgb2xkID0gZWxtW2tleV07XHJcbiAgICAgICAgaWYgKG9sZCAhPT0gY3VyKSBlbG1ba2V5XSA9IGN1cjtcclxuICAgIH1cclxufVxyXG5jb25zdCBsaXZlUHJvcHNQbHVnaW4gPSB7Y3JlYXRlOiB1cGRhdGVQcm9wcywgdXBkYXRlOiB1cGRhdGVQcm9wc307XHJcbmltcG9ydCBzbmFiYmRvbSBmcm9tIFwic25hYmJkb21cIlxyXG5pbXBvcnQgaCBmcm9tIFwic25hYmJkb20vaFwiXHJcbmNvbnN0IHBhdGNoID0gc25hYmJkb20uaW5pdChbXHJcbiAgICByZXF1aXJlKCdzbmFiYmRvbS9tb2R1bGVzL2NsYXNzJyksXHJcbiAgICByZXF1aXJlKCdzbmFiYmRvbS9tb2R1bGVzL3Byb3BzJyksXHJcbiAgICByZXF1aXJlKCdzbmFiYmRvbS9tb2R1bGVzL3N0eWxlJyksXHJcbiAgICByZXF1aXJlKCdzbmFiYmRvbS9tb2R1bGVzL2V2ZW50bGlzdGVuZXJzJyksXHJcbiAgICByZXF1aXJlKCdzbmFiYmRvbS9tb2R1bGVzL2F0dHJpYnV0ZXMnKSxcclxuICAgIGxpdmVQcm9wc1BsdWdpblxyXG5dKTtcclxuXHJcbmZ1bmN0aW9uIHV1aWQoKXtyZXR1cm4oXCJcIisxZTcrLTFlMystNGUzKy04ZTMrLTFlMTEpLnJlcGxhY2UoL1sxMF0vZyxmdW5jdGlvbigpe3JldHVybigwfE1hdGgucmFuZG9tKCkqMTYpLnRvU3RyaW5nKDE2KX0pfVxyXG5pbXBvcnQgYmlnIGZyb20gJy4uL25vZGVfbW9kdWxlcy9iaWcuanMnXHJcbmJpZy5FX1BPUyA9IDFlKzZcclxuXHJcbmltcG9ydCB1Z25pcyBmcm9tICcuL3VnbmlzJ1xyXG5pbXBvcnQgc2F2ZWRBcHAgZnJvbSAnLi4vdWduaXNfY29tcG9uZW50cy9hcHAuanNvbidcclxuXHJcbmZ1bmN0aW9uIG1vdmVJbkFycmF5IChhcnJheSwgbW92ZUluZGV4LCB0b0luZGV4KSB7XHJcbiAgICBsZXQgaXRlbSA9IGFycmF5W21vdmVJbmRleF07XHJcbiAgICBsZXQgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xyXG4gICAgbGV0IGRpZmYgPSBtb3ZlSW5kZXggLSB0b0luZGV4O1xyXG5cclxuICAgIGlmIChkaWZmID4gMCkge1xyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgIC4uLmFycmF5LnNsaWNlKDAsIHRvSW5kZXgpLFxyXG4gICAgICAgICAgICBpdGVtLFxyXG4gICAgICAgICAgICAuLi5hcnJheS5zbGljZSh0b0luZGV4LCBtb3ZlSW5kZXgpLFxyXG4gICAgICAgICAgICAuLi5hcnJheS5zbGljZShtb3ZlSW5kZXggKyAxLCBsZW5ndGgpXHJcbiAgICAgICAgXTtcclxuICAgIH0gZWxzZSBpZiAoZGlmZiA8IDApIHtcclxuICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICAuLi5hcnJheS5zbGljZSgwLCBtb3ZlSW5kZXgpLFxyXG4gICAgICAgICAgICAuLi5hcnJheS5zbGljZShtb3ZlSW5kZXggKyAxLCB0b0luZGV4ICsgMSksXHJcbiAgICAgICAgICAgIGl0ZW0sXHJcbiAgICAgICAgICAgIC4uLmFycmF5LnNsaWNlKHRvSW5kZXggKyAxLCBsZW5ndGgpXHJcbiAgICAgICAgXTtcclxuICAgIH1cclxuICAgIHJldHVybiBhcnJheTtcclxufVxyXG5cclxuY29uc3QgYXR0YWNoRmFzdENsaWNrID0gcmVxdWlyZSgnZmFzdGNsaWNrJylcclxuYXR0YWNoRmFzdENsaWNrKGRvY3VtZW50LmJvZHkpXHJcblxyXG5jb25zdCB2ZXJzaW9uID0gJzAuMC4yOHYnXHJcbmVkaXRvcihzYXZlZEFwcClcclxuXHJcbmZ1bmN0aW9uIGVkaXRvcihhcHBEZWZpbml0aW9uKXtcclxuXHJcbiAgICBjb25zdCBzYXZlZERlZmluaXRpb24gPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhcHBfa2V5XycgKyB2ZXJzaW9uKSlcclxuICAgIGNvbnN0IGFwcCA9IHVnbmlzKHNhdmVkRGVmaW5pdGlvbiB8fCBhcHBEZWZpbml0aW9uKVxyXG5cclxuICAgIGxldCBub2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobm9kZSlcclxuXHJcbiAgICAvLyBTdGF0ZVxyXG4gICAgbGV0IHN0YXRlID0ge1xyXG4gICAgICAgIGxlZnRPcGVuOiB0cnVlLFxyXG4gICAgICAgIHJpZ2h0T3BlbjogdHJ1ZSxcclxuICAgICAgICBmdWxsU2NyZWVuOiBmYWxzZSxcclxuICAgICAgICBlZGl0b3JSaWdodFdpZHRoOiAzNTAsXHJcbiAgICAgICAgZWRpdG9yTGVmdFdpZHRoOiAzNTAsXHJcbiAgICAgICAgc3ViRWRpdG9yV2lkdGg6IDM1MCxcclxuICAgICAgICBhcHBJc0Zyb3plbjogZmFsc2UsXHJcbiAgICAgICAgc2VsZWN0ZWRWaWV3Tm9kZToge30sXHJcbiAgICAgICAgc2VsZWN0ZWRQaXBlSWQ6ICcnLFxyXG4gICAgICAgIHNlbGVjdGVkU3RhdGVOb2RlSWQ6ICcnLFxyXG4gICAgICAgIHNlbGVjdGVkVmlld1N1Yk1lbnU6ICdwcm9wcycsXHJcbiAgICAgICAgZWRpdGluZ1RpdGxlTm9kZUlkOiAnJyxcclxuICAgICAgICB2aWV3Rm9sZGVyc0Nsb3NlZDoge30sXHJcbiAgICAgICAgZHJhZ2dlZENvbXBvbmVudFZpZXc6IG51bGwsXHJcbiAgICAgICAgaG92ZXJlZFZpZXdOb2RlOiBudWxsLFxyXG4gICAgICAgIG1vdXNlUG9zaXRpb246IHt9LFxyXG4gICAgICAgIGV2ZW50U3RhY2s6IFtdLFxyXG4gICAgICAgIGRlZmluaXRpb246IHNhdmVkRGVmaW5pdGlvbiB8fCBhcHAuZGVmaW5pdGlvbixcclxuICAgIH1cclxuICAgIC8vIHVuZG8vcmVkb1xyXG4gICAgbGV0IHN0YXRlU3RhY2sgPSBbc3RhdGUuZGVmaW5pdGlvbl1cclxuICAgIGxldCBjdXJyZW50QW5pbWF0aW9uRnJhbWVSZXF1ZXN0ID0gbnVsbDtcclxuICAgIGZ1bmN0aW9uIHNldFN0YXRlKG5ld1N0YXRlKXtcclxuICAgICAgICBpZihuZXdTdGF0ZSA9PT0gc3RhdGUpe1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ3N0YXRlIHdhcyBtdXRhdGVkLCBzZWFyY2ggZm9yIGEgYnVnJylcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoc3RhdGUuZGVmaW5pdGlvbiAhPT0gbmV3U3RhdGUuZGVmaW5pdGlvbil7XHJcbiAgICAgICAgICAgIC8vIHVuc2VsZWN0IGRlbGV0ZWQgY29tcG9uZW50cyBhbmQgc3RhdGVcclxuICAgICAgICAgICAgaWYobmV3U3RhdGUuZGVmaW5pdGlvbi5zdGF0ZVtuZXdTdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkXSA9PT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgICAgIG5ld1N0YXRlID0gey4uLm5ld1N0YXRlLCBzZWxlY3RlZFN0YXRlTm9kZUlkOiAnJ31cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihuZXdTdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZiAhPT0gdW5kZWZpbmVkICYmIG5ld1N0YXRlLmRlZmluaXRpb25bbmV3U3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWZdW25ld1N0YXRlLnNlbGVjdGVkVmlld05vZGUuaWRdID09PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICAgICAgbmV3U3RhdGUgPSB7Li4ubmV3U3RhdGUsIHNlbGVjdGVkVmlld05vZGU6IHt9fVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIHVuZG8vcmVkbyB0aGVuIHJlbmRlciB0aGVuIHNhdmVcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudEluZGV4ID0gc3RhdGVTdGFjay5maW5kSW5kZXgoKGEpPT5hPT09c3RhdGUuZGVmaW5pdGlvbilcclxuICAgICAgICAgICAgc3RhdGVTdGFjayA9IHN0YXRlU3RhY2suc2xpY2UoMCwgY3VycmVudEluZGV4KzEpLmNvbmNhdChuZXdTdGF0ZS5kZWZpbml0aW9uKTtcclxuICAgICAgICAgICAgLy8gVE9ETyBhZGQgZ2FyYmFnZSBjb2xsZWN0aW9uP1xyXG4gICAgICAgICAgICBhcHAucmVuZGVyKG5ld1N0YXRlLmRlZmluaXRpb24pXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCk9PmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhcHBfa2V5XycrdmVyc2lvbiwgSlNPTi5zdHJpbmdpZnkobmV3U3RhdGUuZGVmaW5pdGlvbikpLCAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoc3RhdGUuYXBwSXNGcm96ZW4gIT09IG5ld1N0YXRlLmFwcElzRnJvemVuIHx8IHN0YXRlLnNlbGVjdGVkVmlld05vZGUgIT09IG5ld1N0YXRlLnNlbGVjdGVkVmlld05vZGUgKXtcclxuICAgICAgICAgICAgYXBwLl9mcmVlemUobmV3U3RhdGUuYXBwSXNGcm96ZW4sIFZJRVdfTk9ERV9TRUxFQ1RFRCwgbmV3U3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYobmV3U3RhdGUuZWRpdGluZ1RpdGxlTm9kZUlkICYmIHN0YXRlLmVkaXRpbmdUaXRsZU5vZGVJZCAhPT0gbmV3U3RhdGUuZWRpdGluZ1RpdGxlTm9kZUlkKXtcclxuICAgICAgICAgICAgLy8gcXVlIGF1dG8gZm9jdXNcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKT0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1pc3RpdGxlZWRpdG9yXScpWzBdXHJcbiAgICAgICAgICAgICAgICBpZihub2RlKXtcclxuICAgICAgICAgICAgICAgICAgICBub2RlLmZvY3VzKClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgMClcclxuICAgICAgICB9XHJcbiAgICAgICAgc3RhdGUgPSBuZXdTdGF0ZVxyXG4gICAgICAgIGlmKCFjdXJyZW50QW5pbWF0aW9uRnJhbWVSZXF1ZXN0KXtcclxuICAgICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSk9PiB7XHJcbiAgICAgICAgLy8gY2xpY2tlZCBvdXRzaWRlXHJcbiAgICAgICAgaWYoc3RhdGUuZWRpdGluZ1RpdGxlTm9kZUlkICYmICFlLnRhcmdldC5kYXRhc2V0LmlzdGl0bGVlZGl0b3Ipe1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGVkaXRpbmdUaXRsZU5vZGVJZDogJyd9KVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICByZW5kZXIoKVxyXG4gICAgfSwgZmFsc2UpXHJcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm9yaWVudGF0aW9uY2hhbmdlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJlbmRlcigpXHJcbiAgICB9LCBmYWxzZSlcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSk9PntcclxuICAgICAgICAvLyA4MyAtIHNcclxuICAgICAgICAvLyA5MCAtIHpcclxuICAgICAgICAvLyA4OSAtIHlcclxuICAgICAgICAvLyAzMiAtIHNwYWNlXHJcbiAgICAgICAgLy8gMTMgLSBlbnRlclxyXG4gICAgICAgIC8vIDI3IC0gZXNjYXBlXHJcbiAgICAgICAgaWYoZS53aGljaCA9PT0gODMgJiYgKG5hdmlnYXRvci5wbGF0Zm9ybS5tYXRjaChcIk1hY1wiKSA/IGUubWV0YUtleSA6IGUuY3RybEtleSkpIHtcclxuICAgICAgICAgICAgLy8gVE9ETyBnYXJiYWdlIGNvbGxlY3RcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBmZXRjaCgnL3NhdmUnLCB7bWV0aG9kOiAnUE9TVCcsIGJvZHk6IEpTT04uc3RyaW5naWZ5KHN0YXRlLmRlZmluaXRpb24pLCBoZWFkZXJzOiB7XCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCJ9fSlcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZihlLndoaWNoID09PSAzMiAmJiAobmF2aWdhdG9yLnBsYXRmb3JtLm1hdGNoKFwiTWFjXCIpID8gZS5tZXRhS2V5IDogZS5jdHJsS2V5KSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgRlJFRVpFUl9DTElDS0VEKClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoIWUuc2hpZnRLZXkgJiYgZS53aGljaCA9PT0gOTAgJiYgKG5hdmlnYXRvci5wbGF0Zm9ybS5tYXRjaChcIk1hY1wiKSA/IGUubWV0YUtleSA6IGUuY3RybEtleSkpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50SW5kZXggPSBzdGF0ZVN0YWNrLmZpbmRJbmRleCgoYSk9PmE9PT1zdGF0ZS5kZWZpbml0aW9uKVxyXG4gICAgICAgICAgICBpZihjdXJyZW50SW5kZXggPiAwKXtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0RlZmluaXRpb24gPSBzdGF0ZVN0YWNrW2N1cnJlbnRJbmRleC0xXVxyXG4gICAgICAgICAgICAgICAgYXBwLnJlbmRlcihuZXdEZWZpbml0aW9uKVxyXG4gICAgICAgICAgICAgICAgc3RhdGUgPSB7Li4uc3RhdGUsIGRlZmluaXRpb246IG5ld0RlZmluaXRpb259XHJcbiAgICAgICAgICAgICAgICByZW5kZXIoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKChlLndoaWNoID09PSA4OSAmJiAobmF2aWdhdG9yLnBsYXRmb3JtLm1hdGNoKFwiTWFjXCIpID8gZS5tZXRhS2V5IDogZS5jdHJsS2V5KSkgfHwgKGUuc2hpZnRLZXkgJiYgZS53aGljaCA9PT0gOTAgJiYgKG5hdmlnYXRvci5wbGF0Zm9ybS5tYXRjaChcIk1hY1wiKSA/IGUubWV0YUtleSA6IGUuY3RybEtleSkpKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudEluZGV4ID0gc3RhdGVTdGFjay5maW5kSW5kZXgoKGEpPT5hPT09c3RhdGUuZGVmaW5pdGlvbilcclxuICAgICAgICAgICAgaWYoY3VycmVudEluZGV4IDwgc3RhdGVTdGFjay5sZW5ndGgtMSl7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdEZWZpbml0aW9uID0gc3RhdGVTdGFja1tjdXJyZW50SW5kZXgrMV1cclxuICAgICAgICAgICAgICAgIGFwcC5yZW5kZXIobmV3RGVmaW5pdGlvbilcclxuICAgICAgICAgICAgICAgIHN0YXRlID0gey4uLnN0YXRlLCBkZWZpbml0aW9uOiBuZXdEZWZpbml0aW9ufVxyXG4gICAgICAgICAgICAgICAgcmVuZGVyKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZihlLndoaWNoID09PSAxMykge1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGVkaXRpbmdUaXRsZU5vZGVJZDogJyd9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZihlLndoaWNoID09PSAyNykge1xyXG4gICAgICAgICAgICBGVUxMX1NDUkVFTl9DTElDS0VEKGZhbHNlKVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgLy8gTGlzdGVuIHRvIGFwcFxyXG4gICAgYXBwLmFkZExpc3RlbmVyKChldmVudElkLCBkYXRhLCBlLCBwcmV2aW91c1N0YXRlLCBjdXJyZW50U3RhdGUsIG11dGF0aW9ucyk9PntcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGV2ZW50U3RhY2s6IHN0YXRlLmV2ZW50U3RhY2suY29uY2F0KHtldmVudElkLCBkYXRhLCBlLCBwcmV2aW91c1N0YXRlLCBjdXJyZW50U3RhdGUsIG11dGF0aW9uc30pfSlcclxuICAgIH0pXHJcblxyXG4gICAgLy8gQWN0aW9uc1xyXG4gICAgbGV0IG9wZW5Cb3hUaW1lb3V0ID0gbnVsbFxyXG4gICAgZnVuY3Rpb24gVklFV19EUkFHR0VEKG5vZGVSZWYsIHBhcmVudFJlZiwgaW5pdGlhbERlcHRoLCBlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgY29uc3QgaXNBcnJvdyA9IGUudGFyZ2V0LmRhdGFzZXQuY2xvc2VhcnJvd1xyXG4gICAgICAgIGNvbnN0IGluaXRpYWxYID0gZS50b3VjaGVzPyBlLnRvdWNoZXNbMF0ucGFnZVg6IGUucGFnZVhcclxuICAgICAgICBjb25zdCBpbml0aWFsWSA9IGUudG91Y2hlcz8gZS50b3VjaGVzWzBdLnBhZ2VZOiBlLnBhZ2VZXHJcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLmVsbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxyXG4gICAgICAgIGNvbnN0IG9mZnNldFggPSBpbml0aWFsWCAtIHBvc2l0aW9uLmxlZnRcclxuICAgICAgICBjb25zdCBvZmZzZXRZID0gaW5pdGlhbFkgLSBwb3NpdGlvbi50b3BcclxuICAgICAgICBmdW5jdGlvbiBkcmFnKGUpe1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgY29uc3QgeCA9IGUudG91Y2hlcz8gZS50b3VjaGVzWzBdLnBhZ2VYOiBlLnBhZ2VYXHJcbiAgICAgICAgICAgIGNvbnN0IHkgPSBlLnRvdWNoZXM/IGUudG91Y2hlc1swXS5wYWdlWTogZS5wYWdlWVxyXG4gICAgICAgICAgICBpZighc3RhdGUuZHJhZ2dlZENvbXBvbmVudFZpZXcpe1xyXG4gICAgICAgICAgICAgICAgaWYoTWF0aC5hYnMoaW5pdGlhbFkteSkgPiAzKXtcclxuICAgICAgICAgICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRyYWdnZWRDb21wb25lbnRWaWV3OiB7Li4ubm9kZVJlZiwgZGVwdGg6IGluaXRpYWxEZXB0aH0sIG1vdXNlUG9zaXRpb246IHt4OiB4IC0gb2Zmc2V0WCwgeTogeSAtIG9mZnNldFl9fSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgbW91c2VQb3NpdGlvbjoge3g6IHggLSBvZmZzZXRYLCB5OiB5IC0gb2Zmc2V0WX19KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZHJhZylcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZHJhZylcclxuICAgICAgICBmdW5jdGlvbiBzdG9wRHJhZ2dpbmcoZXZlbnQpe1xyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBkcmFnKVxyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZHJhZylcclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBzdG9wRHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHN0b3BEcmFnZ2luZylcclxuICAgICAgICAgICAgaWYob3BlbkJveFRpbWVvdXQpe1xyXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KG9wZW5Cb3hUaW1lb3V0KVxyXG4gICAgICAgICAgICAgICAgb3BlbkJveFRpbWVvdXQgPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYoIXN0YXRlLmRyYWdnZWRDb21wb25lbnRWaWV3KXtcclxuICAgICAgICAgICAgICAgIGlmKGV2ZW50LnRhcmdldCA9PT0gZS50YXJnZXQgJiYgaXNBcnJvdyl7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFZJRVdfRk9MREVSX0NMSUNLRUQobm9kZVJlZi5pZClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBWSUVXX05PREVfU0VMRUNURUQobm9kZVJlZilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZighc3RhdGUuaG92ZXJlZFZpZXdOb2RlKXtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRyYWdnZWRDb21wb25lbnRWaWV3OiBudWxsLH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbmV3UGFyZW50UmVmID0gc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBhcmVudFxyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZSxcclxuICAgICAgICAgICAgICAgIGRyYWdnZWRDb21wb25lbnRWaWV3OiBudWxsLFxyXG4gICAgICAgICAgICAgICAgaG92ZXJlZFZpZXdOb2RlOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgZGVmaW5pdGlvbjogcGFyZW50UmVmLmlkID09PSBuZXdQYXJlbnRSZWYuaWQgPyB7IC8vIG1vdmluZyBpbiB0aGUgc2FtZSBwYXJlbnRcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIFtwYXJlbnRSZWYucmVmXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBbcGFyZW50UmVmLmlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXVtwYXJlbnRSZWYuaWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IG1vdmVJbkFycmF5KHN0YXRlLmRlZmluaXRpb25bcGFyZW50UmVmLnJlZl1bcGFyZW50UmVmLmlkXS5jaGlsZHJlbiwgc3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXVtwYXJlbnRSZWYuaWRdLmNoaWxkcmVuLmZpbmRJbmRleCgocmVmKT0+IHJlZi5pZCA9PT0gbm9kZVJlZi5pZCksIHN0YXRlLmhvdmVyZWRWaWV3Tm9kZS5wb3NpdGlvbilcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gOiBwYXJlbnRSZWYucmVmID09PSBuZXdQYXJlbnRSZWYucmVmID8geyAvLyBtb3ZpbmcgaW4gdGhlIHNpbWlsYXIgcGFyZW50IChzYW1lIHR5cGUpXHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBbcGFyZW50UmVmLnJlZl06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgW3BhcmVudFJlZi5pZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb25bcGFyZW50UmVmLnJlZl1bcGFyZW50UmVmLmlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdW3BhcmVudFJlZi5pZF0uY2hpbGRyZW4uZmlsdGVyKChyZWYpPT4gcmVmLmlkICE9PSBub2RlUmVmLmlkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBbbmV3UGFyZW50UmVmLmlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbltuZXdQYXJlbnRSZWYucmVmXVtuZXdQYXJlbnRSZWYuaWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IHN0YXRlLmRlZmluaXRpb25bbmV3UGFyZW50UmVmLnJlZl1bbmV3UGFyZW50UmVmLmlkXS5jaGlsZHJlbi5zbGljZSgwLCBzdGF0ZS5ob3ZlcmVkVmlld05vZGUucG9zaXRpb24pLmNvbmNhdChub2RlUmVmLCBzdGF0ZS5kZWZpbml0aW9uW25ld1BhcmVudFJlZi5yZWZdW25ld1BhcmVudFJlZi5pZF0uY2hpbGRyZW4uc2xpY2Uoc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBvc2l0aW9uKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9IDogeyAvLyBtb3ZpbmcgdG8gYSBuZXcgdHlwZSBwYXJlbnRcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIFtwYXJlbnRSZWYucmVmXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBbcGFyZW50UmVmLmlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXVtwYXJlbnRSZWYuaWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IHN0YXRlLmRlZmluaXRpb25bcGFyZW50UmVmLnJlZl1bcGFyZW50UmVmLmlkXS5jaGlsZHJlbi5maWx0ZXIoKHJlZik9PiByZWYuaWQgIT09IG5vZGVSZWYuaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBbbmV3UGFyZW50UmVmLnJlZl06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbltuZXdQYXJlbnRSZWYucmVmXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgW25ld1BhcmVudFJlZi5pZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb25bbmV3UGFyZW50UmVmLnJlZl1bbmV3UGFyZW50UmVmLmlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uW25ld1BhcmVudFJlZi5yZWZdW25ld1BhcmVudFJlZi5pZF0uY2hpbGRyZW4uc2xpY2UoMCwgc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBvc2l0aW9uKS5jb25jYXQobm9kZVJlZiwgc3RhdGUuZGVmaW5pdGlvbltuZXdQYXJlbnRSZWYucmVmXVtuZXdQYXJlbnRSZWYuaWRdLmNoaWxkcmVuLnNsaWNlKHN0YXRlLmhvdmVyZWRWaWV3Tm9kZS5wb3NpdGlvbikpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgc3RvcERyYWdnaW5nKVxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHN0b3BEcmFnZ2luZylcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBWSUVXX0hPVkVSX01PQklMRShlKSB7XHJcbiAgICAgICAgY29uc3QgZWxlbSA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoZS50b3VjaGVzWzBdLmNsaWVudFgsIGUudG91Y2hlc1swXS5jbGllbnRZKVxyXG4gICAgICAgIGNvbnN0IG1vdmVFdmVudCA9IG5ldyBNb3VzZUV2ZW50KCdtb3VzZW1vdmUnLCB7XHJcbiAgICAgICAgICAgIGJ1YmJsZXM6IHRydWUsXHJcbiAgICAgICAgICAgIGNhbmNlbGFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIHZpZXc6IHdpbmRvdyxcclxuICAgICAgICAgICAgY2xpZW50WDogZS50b3VjaGVzWzBdLmNsaWVudFgsXHJcbiAgICAgICAgICAgIGNsaWVudFk6IGUudG91Y2hlc1swXS5jbGllbnRZLFxyXG4gICAgICAgICAgICBzY3JlZW5YOiBlLnRvdWNoZXNbMF0uc2NyZWVuWCxcclxuICAgICAgICAgICAgc2NyZWVuWTogZS50b3VjaGVzWzBdLnNjcmVlblksXHJcbiAgICAgICAgfSlcclxuICAgICAgICBlbGVtLmRpc3BhdGNoRXZlbnQobW92ZUV2ZW50KVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIFZJRVdfSE9WRVJFRChub2RlUmVmLCBwYXJlbnRSZWYsIGRlcHRoLCBlKSB7XHJcbiAgICAgICAgaWYoIXN0YXRlLmRyYWdnZWRDb21wb25lbnRWaWV3KXtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZihub2RlUmVmLmlkID09PSBzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50Vmlldy5pZCl7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXRTdGF0ZSh7Li4uc3RhdGUsIGhvdmVyZWRWaWV3Tm9kZTogbnVsbCx9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBoaXRQb3NpdGlvbiA9IChlLnRvdWNoZXM/IDI4OiBlLmxheWVyWSkgLyAyOFxyXG4gICAgICAgIGNvbnN0IGluc2VydEJlZm9yZSAgPSAoKT0+IHNldFN0YXRlKHsuLi5zdGF0ZSwgaG92ZXJlZFZpZXdOb2RlOiB7cGFyZW50OiBwYXJlbnRSZWYsIGRlcHRoLCBwb3NpdGlvbjogc3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXVtwYXJlbnRSZWYuaWRdLmNoaWxkcmVuLmZpbHRlcigocmVmKT0+IHJlZi5pZCAhPT0gc3RhdGUuZHJhZ2dlZENvbXBvbmVudFZpZXcuaWQpLmZpbmRJbmRleCgocmVmKT0+cmVmLmlkID09PSBub2RlUmVmLmlkKX19KVxyXG4gICAgICAgIGNvbnN0IGluc2VydEFmdGVyICAgPSAoKT0+IHNldFN0YXRlKHsuLi5zdGF0ZSwgaG92ZXJlZFZpZXdOb2RlOiB7cGFyZW50OiBwYXJlbnRSZWYsIGRlcHRoLCBwb3NpdGlvbjogc3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXVtwYXJlbnRSZWYuaWRdLmNoaWxkcmVuLmZpbHRlcigocmVmKT0+IHJlZi5pZCAhPT0gc3RhdGUuZHJhZ2dlZENvbXBvbmVudFZpZXcuaWQpLmZpbmRJbmRleCgocmVmKT0+cmVmLmlkID09PSBub2RlUmVmLmlkKSArIDF9fSlcclxuICAgICAgICBjb25zdCBpbnNlcnRBc0ZpcnN0ID0gKCk9PiBzZXRTdGF0ZSh7Li4uc3RhdGUsIGhvdmVyZWRWaWV3Tm9kZToge3BhcmVudDogbm9kZVJlZiwgZGVwdGg6IGRlcHRoKzEsIHBvc2l0aW9uOiAwfX0pXHJcblxyXG4gICAgICAgIGlmKG5vZGVSZWYuaWQgPT09ICdfcm9vdE5vZGUnKXtcclxuICAgICAgICAgICAgcmV0dXJuIGluc2VydEFzRmlyc3QoKVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBwcmF5IHRvIGdvZCB0aGF0IHlvdSBkaWQgbm90IG1ha2UgYSBtaXN0YWtlIGhlcmVcclxuICAgICAgICBpZihzdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlUmVmLmlkXS5jaGlsZHJlbil7IC8vIGlmIGJveFxyXG4gICAgICAgICAgICBpZihzdGF0ZS52aWV3Rm9sZGVyc0Nsb3NlZFtub2RlUmVmLmlkXSB8fCBzdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlUmVmLmlkXS5jaGlsZHJlbi5sZW5ndGggPT09IDApeyAvLyBpZiBjbG9zZWQgb3IgZW1wdHkgYm94XHJcbiAgICAgICAgICAgICAgICBpZihoaXRQb3NpdGlvbiA8IDAuMyl7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5zZXJ0QmVmb3JlKClcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoIW9wZW5Cb3hUaW1lb3V0KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3BlbkJveFRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpPT5WSUVXX0ZPTERFUl9DTElDS0VEKG5vZGVSZWYuaWQsIGZhbHNlKSwgNTAwKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpbnNlcnRBc0ZpcnN0KClcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHsgLy8gb3BlbiBib3hcclxuICAgICAgICAgICAgICAgIGlmKGhpdFBvc2l0aW9uIDwgMC41KXtcclxuICAgICAgICAgICAgICAgICAgICBpbnNlcnRCZWZvcmUoKVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpbnNlcnRBc0ZpcnN0KClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7IC8vIHNpbXBsZSBub2RlXHJcbiAgICAgICAgICAgIGlmKGhpdFBvc2l0aW9uIDwgMC41KXtcclxuICAgICAgICAgICAgICAgIGluc2VydEJlZm9yZSgpXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpbnNlcnRBZnRlcigpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYob3BlbkJveFRpbWVvdXQpe1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQob3BlbkJveFRpbWVvdXQpXHJcbiAgICAgICAgICAgIG9wZW5Cb3hUaW1lb3V0ID0gbnVsbFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFdJRFRIX0RSQUdHRUQod2lkdGhOYW1lLCBlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgZnVuY3Rpb24gcmVzaXplKGUpe1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgbGV0IG5ld1dpZHRoID0gd2luZG93LmlubmVyV2lkdGggLSAoZS50b3VjaGVzPyBlLnRvdWNoZXNbMF0ucGFnZVg6IGUucGFnZVgpXHJcbiAgICAgICAgICAgIGlmKHdpZHRoTmFtZSA9PT0gJ2VkaXRvckxlZnRXaWR0aCcpe1xyXG4gICAgICAgICAgICAgICAgbmV3V2lkdGggPSBlLnRvdWNoZXM/IGUudG91Y2hlc1swXS5wYWdlWDogZS5wYWdlWFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHdpZHRoTmFtZSA9PT0gJ3N1YkVkaXRvcldpZHRoJyl7XHJcbiAgICAgICAgICAgICAgICBuZXdXaWR0aCA9IG5ld1dpZHRoIC0gc3RhdGUuZWRpdG9yUmlnaHRXaWR0aCAtIDEwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gSSBwcm9iYWJseSB3YXMgZHJ1bmtcclxuICAgICAgICAgICAgaWYod2lkdGhOYW1lICE9PSAnc3ViRWRpdG9yV2lkdGgnICYmICggKHdpZHRoTmFtZSA9PT0gJ2VkaXRvckxlZnRXaWR0aCcgPyBzdGF0ZS5sZWZ0T3Blbjogc3RhdGUucmlnaHRPcGVuKSA/IG5ld1dpZHRoIDwgMTgwOiBuZXdXaWR0aCA+IDE4MCkpe1xyXG4gICAgICAgICAgICAgICAgaWYod2lkdGhOYW1lID09PSAnZWRpdG9yTGVmdFdpZHRoJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNldFN0YXRlKHsuLi5zdGF0ZSwgbGVmdE9wZW46ICFzdGF0ZS5sZWZ0T3Blbn0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2V0U3RhdGUoey4uLnN0YXRlLCByaWdodE9wZW46ICFzdGF0ZS5yaWdodE9wZW59KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKG5ld1dpZHRoIDwgMjUwKXtcclxuICAgICAgICAgICAgICAgIG5ld1dpZHRoID0gMjUwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBbd2lkdGhOYW1lXTogbmV3V2lkdGh9KVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHJlc2l6ZSlcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgcmVzaXplKVxyXG4gICAgICAgIGZ1bmN0aW9uIHN0b3BEcmFnZ2luZyhlKXtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCByZXNpemUpXHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCByZXNpemUpXHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgc3RvcERyYWdnaW5nKVxyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBzdG9wRHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHN0b3BEcmFnZ2luZylcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBzdG9wRHJhZ2dpbmcpXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBGUkVFWkVSX0NMSUNLRUQoKSB7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBhcHBJc0Zyb3plbjogIXN0YXRlLmFwcElzRnJvemVufSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFZJRVdfRk9MREVSX0NMSUNLRUQobm9kZUlkLCBmb3JjZWRWYWx1ZSkge1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgdmlld0ZvbGRlcnNDbG9zZWQ6ey4uLnN0YXRlLnZpZXdGb2xkZXJzQ2xvc2VkLCBbbm9kZUlkXTogZm9yY2VkVmFsdWUgIT09IHVuZGVmaW5lZCA/IGZvcmNlZFZhbHVlIDogIXN0YXRlLnZpZXdGb2xkZXJzQ2xvc2VkW25vZGVJZF19fSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFZJRVdfTk9ERV9TRUxFQ1RFRChyZWYpIHtcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIHNlbGVjdGVkVmlld05vZGU6cmVmfSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFVOU0VMRUNUX1ZJRVdfTk9ERShzZWxmT25seSwgZSkge1xyXG4gICAgICAgIGlmKHNlbGZPbmx5ICYmIGUudGFyZ2V0ICE9PSB0aGlzLmVsbSl7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIHNlbGVjdGVkVmlld05vZGU6e319KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gU1RBVEVfTk9ERV9TRUxFQ1RFRChub2RlSWQpIHtcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIHNlbGVjdGVkU3RhdGVOb2RlSWQ6bm9kZUlkfSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFVOU0VMRUNUX1NUQVRFX05PREUoZSkge1xyXG4gICAgICAgIGlmKGUudGFyZ2V0ID09PSB0aGlzLmVsbSl7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgc2VsZWN0ZWRTdGF0ZU5vZGVJZDonJ30pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQUREX05PREUobm9kZVJlZiwgdHlwZSkge1xyXG4gICAgICAgIC8vIFRPRE8gcmVtb3ZlIHdoZW4gZHJhZ2dpbmcgd29ya3NcclxuICAgICAgICBpZighbm9kZVJlZi5yZWYgfHwgIXN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVSZWYuaWRdIHx8ICFzdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlUmVmLmlkXS5jaGlsZHJlbil7XHJcbiAgICAgICAgICAgIG5vZGVSZWYgPSB7cmVmOiAndk5vZGVCb3gnLCBpZDogJ19yb290Tm9kZSd9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG5vZGVJZCA9IG5vZGVSZWYuaWRcclxuICAgICAgICBjb25zdCBuZXdOb2RlSWQgPSB1dWlkKClcclxuICAgICAgICBjb25zdCBuZXdTdHlsZUlkID0gdXVpZCgpXHJcbiAgICAgICAgY29uc3QgbmV3U3R5bGUgPSB7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHR5cGUgPT09ICdib3gnKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld05vZGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ2JveCcsXHJcbiAgICAgICAgICAgICAgICBzdHlsZToge3JlZjonc3R5bGUnLCBpZDpuZXdTdHlsZUlkfSxcclxuICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBbXSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc2V0U3RhdGUoe1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFZpZXdOb2RlOiB7cmVmOid2Tm9kZUJveCcsIGlkOiBuZXdOb2RlSWR9LFxyXG4gICAgICAgICAgICAgICAgZGVmaW5pdGlvbjogbm9kZVJlZi5yZWYgPT09ICd2Tm9kZUJveCcgPyB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgICAgICB2Tm9kZUJveDogey4uLnN0YXRlLmRlZmluaXRpb24udk5vZGVCb3gsIFtub2RlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi52Tm9kZUJveFtub2RlSWRdLCBjaGlsZHJlbjogc3RhdGUuZGVmaW5pdGlvbi52Tm9kZUJveFtub2RlSWRdLmNoaWxkcmVuLmNvbmNhdCh7cmVmOid2Tm9kZUJveCcsIGlkOm5ld05vZGVJZH0pfSwgW25ld05vZGVJZF06IG5ld05vZGV9LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5zdHlsZSwgW25ld1N0eWxlSWRdOiBuZXdTdHlsZX0sXHJcbiAgICAgICAgICAgICAgICB9IDoge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgW25vZGVSZWYucmVmXTogey4uLnN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdLCBbbm9kZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVJZF0sIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlSWRdLmNoaWxkcmVuLmNvbmNhdCh7cmVmOid2Tm9kZUJveCcsIGlkOm5ld05vZGVJZH0pfX0sXHJcbiAgICAgICAgICAgICAgICAgICAgdk5vZGVCb3g6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnZOb2RlQm94LCBbbmV3Tm9kZUlkXTogbmV3Tm9kZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnN0eWxlLCBbbmV3U3R5bGVJZF06IG5ld1N0eWxlfSxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHlwZSA9PT0gJ3RleHQnKXtcclxuICAgICAgICAgICAgY29uc3QgcGlwZUlkID0gdXVpZCgpXHJcbiAgICAgICAgICAgIGNvbnN0IG5ld05vZGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ3RleHQnLFxyXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtyZWY6J3N0eWxlJywgaWQ6bmV3U3R5bGVJZH0sXHJcbiAgICAgICAgICAgICAgICB2YWx1ZToge3JlZjoncGlwZScsIGlkOnBpcGVJZH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBuZXdQaXBlID0ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6ICdEZWZhdWx0IFRleHQnLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBbXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzZXRTdGF0ZSh7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZSxcclxuICAgICAgICAgICAgICAgIHNlbGVjdGVkVmlld05vZGU6IHtyZWY6J3ZOb2RlVGV4dCcsIGlkOiBuZXdOb2RlSWR9LFxyXG4gICAgICAgICAgICAgICAgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwZTogey4uLnN0YXRlLmRlZmluaXRpb24ucGlwZSwgW3BpcGVJZF06IG5ld1BpcGV9LFxyXG4gICAgICAgICAgICAgICAgICAgIFtub2RlUmVmLnJlZl06IHsuLi5zdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXSwgW25vZGVJZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlSWRdLCBjaGlsZHJlbjogc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZUlkXS5jaGlsZHJlbi5jb25jYXQoe3JlZjondk5vZGVUZXh0JywgaWQ6bmV3Tm9kZUlkfSl9fSxcclxuICAgICAgICAgICAgICAgICAgICB2Tm9kZVRleHQ6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnZOb2RlVGV4dCwgW25ld05vZGVJZF06IG5ld05vZGV9LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5zdHlsZSwgW25ld1N0eWxlSWRdOiBuZXdTdHlsZX0sXHJcbiAgICAgICAgICAgICAgICB9fSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHlwZSA9PT0gJ2lmJyl7XHJcbiAgICAgICAgICAgIGNvbnN0IHBpcGVJZCA9IHV1aWQoKVxyXG4gICAgICAgICAgICBjb25zdCBuZXdOb2RlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdjb25kaXRpb25hbCcsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZToge3JlZjoncGlwZScsIGlkOnBpcGVJZH0sXHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjogW10sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbmV3UGlwZSA9IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBbXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzZXRTdGF0ZSh7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZSxcclxuICAgICAgICAgICAgICAgIHNlbGVjdGVkVmlld05vZGU6IHtyZWY6J3ZOb2RlSWYnLCBpZDogbmV3Tm9kZUlkfSxcclxuICAgICAgICAgICAgICAgIGRlZmluaXRpb246IG5vZGVSZWYucmVmID09PSAndk5vZGVJZicgPyB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBwaXBlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLCBbcGlwZUlkXTogbmV3UGlwZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgdk5vZGVJZjogey4uLnN0YXRlLmRlZmluaXRpb24udk5vZGVJZiwgW25vZGVJZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnZOb2RlSWZbbm9kZUlkXSwgY2hpbGRyZW46IHN0YXRlLmRlZmluaXRpb24udk5vZGVJZltub2RlSWRdLmNoaWxkcmVuLmNvbmNhdCh7cmVmOid2Tm9kZUlmJywgaWQ6bmV3Tm9kZUlkfSl9LCBbbmV3Tm9kZUlkXTogbmV3Tm9kZX0sXHJcbiAgICAgICAgICAgICAgICB9IDoge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwZTogey4uLnN0YXRlLmRlZmluaXRpb24ucGlwZSwgW3BpcGVJZF06IG5ld1BpcGV9LFxyXG4gICAgICAgICAgICAgICAgICAgIFtub2RlUmVmLnJlZl06IHsuLi5zdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXSwgW25vZGVJZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlSWRdLCBjaGlsZHJlbjogc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZUlkXS5jaGlsZHJlbi5jb25jYXQoe3JlZjondk5vZGVJZicsIGlkOm5ld05vZGVJZH0pfX0sXHJcbiAgICAgICAgICAgICAgICAgICAgdk5vZGVJZjogey4uLnN0YXRlLmRlZmluaXRpb24udk5vZGVJZiwgW25ld05vZGVJZF06IG5ld05vZGV9LFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0eXBlID09PSAnaW5wdXQnKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHN0YXRlSWQgPSB1dWlkKClcclxuICAgICAgICAgICAgY29uc3QgZXZlbnRJZCA9IHV1aWQoKVxyXG4gICAgICAgICAgICBjb25zdCBtdXRhdG9ySWQgPSB1dWlkKClcclxuICAgICAgICAgICAgY29uc3QgcGlwZUlucHV0SWQgPSB1dWlkKClcclxuICAgICAgICAgICAgY29uc3QgcGlwZU11dGF0b3JJZCA9IHV1aWQoKVxyXG4gICAgICAgICAgICBjb25zdCBuZXdOb2RlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdpbnB1dCcsXHJcbiAgICAgICAgICAgICAgICBzdHlsZToge3JlZjonc3R5bGUnLCBpZDpuZXdTdHlsZUlkfSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB7cmVmOidwaXBlJywgaWQ6cGlwZUlucHV0SWR9LFxyXG4gICAgICAgICAgICAgICAgaW5wdXQ6IHtyZWY6J2V2ZW50JywgaWQ6ZXZlbnRJZH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBuZXdQaXBlSW5wdXQgPSB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZToge3JlZjogJ3N0YXRlJywgaWQ6IHN0YXRlSWR9LFxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBbXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1BpcGVNdXRhdG9yID0ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6ICdldmVudERhdGEnLCBpZDogJ19pbnB1dCd9LFxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBbXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1N0YXRlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdpbnB1dCB2YWx1ZScsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgICByZWY6IHN0YXRlSWQsXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU6ICdEZWZhdWx0IHRleHQnLFxyXG4gICAgICAgICAgICAgICAgbXV0YXRvcnM6IFt7IHJlZjonbXV0YXRvcicsIGlkOm11dGF0b3JJZH1dLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld011dGF0b3IgPSB7XHJcbiAgICAgICAgICAgICAgICBldmVudDogeyByZWY6ICdldmVudCcsIGlkOmV2ZW50SWR9LFxyXG4gICAgICAgICAgICAgICAgc3RhdGU6IHsgcmVmOiAnc3RhdGUnLCBpZDpzdGF0ZUlkfSxcclxuICAgICAgICAgICAgICAgIG11dGF0aW9uOiB7IHJlZjogJ3BpcGUnLCBpZDogcGlwZU11dGF0b3JJZH0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbmV3RXZlbnQgPSB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnaW5wdXQnLFxyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICd1cGRhdGUgaW5wdXQnLFxyXG4gICAgICAgICAgICAgICAgbXV0YXRvcnM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7IHJlZjogJ211dGF0b3InLCBpZDogbXV0YXRvcklkfSxcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICBlbWl0dGVyOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVmOiAndk5vZGVJbnB1dCcsXHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IG5ld05vZGVJZCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge3JlZjogJ2V2ZW50RGF0YScsIGlkOiAnX2lucHV0J31cclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNldFN0YXRlKHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRWaWV3Tm9kZToge3JlZjondk5vZGVJbnB1dCcsIGlkOiBuZXdOb2RlSWR9LFxyXG4gICAgICAgICAgICAgICAgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwZTogey4uLnN0YXRlLmRlZmluaXRpb24ucGlwZSwgW3BpcGVJbnB1dElkXTogbmV3UGlwZUlucHV0LCBbcGlwZU11dGF0b3JJZF06IG5ld1BpcGVNdXRhdG9yfSxcclxuICAgICAgICAgICAgICAgICAgICBbbm9kZVJlZi5yZWZdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl0sIFtub2RlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZUlkXSwgY2hpbGRyZW46IHN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVJZF0uY2hpbGRyZW4uY29uY2F0KHtyZWY6J3ZOb2RlSW5wdXQnLCBpZDpuZXdOb2RlSWR9KX19LFxyXG4gICAgICAgICAgICAgICAgICAgIHZOb2RlSW5wdXQ6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnZOb2RlSW5wdXQsIFtuZXdOb2RlSWRdOiBuZXdOb2RlfSxcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogey4uLnN0YXRlLmRlZmluaXRpb24uc3R5bGUsIFtuZXdTdHlsZUlkXTogbmV3U3R5bGV9LFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWVTcGFjZTogey4uLnN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlLCBbJ19yb290TmFtZVNwYWNlJ106IHsuLi5zdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZVsnX3Jvb3ROYW1lU3BhY2UnXSwgY2hpbGRyZW46IHN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlWydfcm9vdE5hbWVTcGFjZSddLmNoaWxkcmVuLmNvbmNhdCh7cmVmOidzdGF0ZScsIGlkOnN0YXRlSWR9KX19LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5zdGF0ZSwgW3N0YXRlSWRdOiBuZXdTdGF0ZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgbXV0YXRvcjogey4uLnN0YXRlLmRlZmluaXRpb24ubXV0YXRvciwgW211dGF0b3JJZF06IG5ld011dGF0b3J9LFxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50OiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5ldmVudCwgW2V2ZW50SWRdOiBuZXdFdmVudH0sXHJcbiAgICAgICAgICAgICAgICB9fSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBBRERfU1RBVEUobmFtZXNwYWNlSWQsIHR5cGUpIHtcclxuICAgICAgICBjb25zdCBuZXdTdGF0ZUlkID0gdXVpZCgpXHJcbiAgICAgICAgbGV0IG5ld1N0YXRlXHJcbiAgICAgICAgaWYodHlwZSA9PT0gJ3RleHQnKSB7XHJcbiAgICAgICAgICAgIG5ld1N0YXRlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICduZXcgdGV4dCcsXHJcbiAgICAgICAgICAgICAgICByZWY6IG5ld1N0YXRlSWQsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU6ICdEZWZhdWx0IHRleHQnLFxyXG4gICAgICAgICAgICAgICAgbXV0YXRvcnM6IFtdLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHR5cGUgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgIG5ld1N0YXRlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICduZXcgbnVtYmVyJyxcclxuICAgICAgICAgICAgICAgIHJlZjogbmV3U3RhdGVJZCxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiAwLFxyXG4gICAgICAgICAgICAgICAgbXV0YXRvcnM6IFtdLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHR5cGUgPT09ICdib29sZWFuJykge1xyXG4gICAgICAgICAgICBuZXdTdGF0ZSA9IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnbmV3IGJvb2xlYW4nLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgICAgICAgICAgcmVmOiBuZXdTdGF0ZUlkLFxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgbXV0YXRvcnM6IFtdLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHR5cGUgPT09ICd0YWJsZScpIHtcclxuICAgICAgICAgICAgbmV3U3RhdGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ25ldyB0YWJsZScsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAndGFibGUnLFxyXG4gICAgICAgICAgICAgICAgcmVmOiBuZXdTdGF0ZUlkLFxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiB7fSxcclxuICAgICAgICAgICAgICAgIG11dGF0b3JzOiBbXSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0eXBlID09PSAnZm9sZGVyJykge1xyXG4gICAgICAgICAgICBuZXdTdGF0ZSA9IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnbmV3IGZvbGRlcicsXHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjogW10sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgIG5hbWVTcGFjZTogey4uLnN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlLCBbbmFtZXNwYWNlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5uYW1lU3BhY2VbbmFtZXNwYWNlSWRdLCBjaGlsZHJlbjogc3RhdGUuZGVmaW5pdGlvbi5uYW1lU3BhY2VbbmFtZXNwYWNlSWRdLmNoaWxkcmVuLmNvbmNhdCh7cmVmOiduYW1lU3BhY2UnLCBpZDpuZXdTdGF0ZUlkfSl9LCBbbmV3U3RhdGVJZF06IG5ld1N0YXRlfSxcclxuICAgICAgICAgICAgfX0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICBuYW1lU3BhY2U6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZSwgW25hbWVzcGFjZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlW25hbWVzcGFjZUlkXSwgY2hpbGRyZW46IHN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlW25hbWVzcGFjZUlkXS5jaGlsZHJlbi5jb25jYXQoe3JlZjonc3RhdGUnLCBpZDpuZXdTdGF0ZUlkfSl9fSxcclxuICAgICAgICAgICAgc3RhdGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnN0YXRlLCBbbmV3U3RhdGVJZF06IG5ld1N0YXRlfSxcclxuICAgICAgICB9fSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIEFERF9ERUZBVUxUX1NUWUxFKHN0eWxlSWQsIGtleSkge1xyXG4gICAgICAgIGNvbnN0IHBpcGVJZCA9IHV1aWQoKVxyXG4gICAgICAgIGNvbnN0IGRlZmF1bHRzID0ge1xyXG4gICAgICAgICAgICAnYmFja2dyb3VuZCc6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICdib3JkZXInOiAnMXB4IHNvbGlkIGJsYWNrJyxcclxuICAgICAgICAgICAgJ291dGxpbmUnOiAnMXB4IHNvbGlkIGJsYWNrJyxcclxuICAgICAgICAgICAgJ2N1cnNvcic6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgJ2NvbG9yJzogJ2JsYWNrJyxcclxuICAgICAgICAgICAgJ2Rpc3BsYXknOiAnYmxvY2snLFxyXG4gICAgICAgICAgICAndG9wJzogJzBweCcsXHJcbiAgICAgICAgICAgICdib3R0b20nOiAnMHB4JyxcclxuICAgICAgICAgICAgJ2xlZnQnOiAnMHB4JyxcclxuICAgICAgICAgICAgJ3JpZ2h0JzogJzBweCcsXHJcbiAgICAgICAgICAgICdtYXhXaWR0aCc6ICcxMDAlJyxcclxuICAgICAgICAgICAgJ21heEhlaWdodCc6ICcxMDAlJyxcclxuICAgICAgICAgICAgJ21pbldpZHRoJzogJzEwMCUnLFxyXG4gICAgICAgICAgICAnbWluSGVpZ2h0JzogJzEwMCUnLFxyXG4gICAgICAgICAgICAncG9zaXRpb24nOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICAnb3ZlcmZsb3cnOiAnYXV0bycsXHJcbiAgICAgICAgICAgICdoZWlnaHQnOiAnNTAwcHgnLFxyXG4gICAgICAgICAgICAnd2lkdGgnOiAnNTAwcHgnLFxyXG4gICAgICAgICAgICAnZm9udCc6ICdpdGFsaWMgMmVtIFwiQ29taWMgU2FucyBNU1wiLCBjdXJzaXZlLCBzYW5zLXNlcmlmJyxcclxuICAgICAgICAgICAgJ21hcmdpbic6ICcxMHB4JyxcclxuICAgICAgICAgICAgJ3BhZGRpbmcnOiAnMTBweCcsXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICBwaXBlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLCBbcGlwZUlkXToge3R5cGU6ICd0ZXh0JywgdmFsdWU6IGRlZmF1bHRzW2tleV0sIHRyYW5zZm9ybWF0aW9uczpbXX19LFxyXG4gICAgICAgICAgICBzdHlsZTogey4uLnN0YXRlLmRlZmluaXRpb24uc3R5bGUsIFtzdHlsZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb24uc3R5bGVbc3R5bGVJZF0sIFtrZXldOiB7cmVmOiAncGlwZScsIGlkOiBwaXBlSWR9fX19fSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFNFTEVDVF9WSUVXX1NVQk1FTlUobmV3SWQpIHtcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIHNlbGVjdGVkVmlld1N1Yk1lbnU6bmV3SWR9KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gRURJVF9WSUVXX05PREVfVElUTEUobm9kZUlkKSB7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBlZGl0aW5nVGl0bGVOb2RlSWQ6bm9kZUlkfSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIERFTEVURV9TRUxFQ1RFRF9WSUVXKG5vZGVSZWYsIHBhcmVudFJlZiwgZSkge1xyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICBpZihub2RlUmVmLmlkID09PSAnX3Jvb3ROb2RlJyl7XHJcbiAgICAgICAgICAgIGlmKHN0YXRlLmRlZmluaXRpb24udk5vZGVCb3hbJ19yb290Tm9kZSddLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gaW1tdXRhYmx5IHJlbW92ZSBhbGwgbm9kZXMgZXhjZXB0IHJvb3ROb2RlXHJcbiAgICAgICAgICAgIHJldHVybiBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICB2Tm9kZUJveDogeydfcm9vdE5vZGUnOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi52Tm9kZUJveFsnX3Jvb3ROb2RlJ10sIGNoaWxkcmVuOiBbXX19LFxyXG4gICAgICAgICAgICB9LCBzZWxlY3RlZFZpZXdOb2RlOiB7fX0sIHRydWUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICBbcGFyZW50UmVmLnJlZl06IHsuLi5zdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdLCBbcGFyZW50UmVmLmlkXTogey4uLnN0YXRlLmRlZmluaXRpb25bcGFyZW50UmVmLnJlZl1bcGFyZW50UmVmLmlkXSwgY2hpbGRyZW46c3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXVtwYXJlbnRSZWYuaWRdLmNoaWxkcmVuLmZpbHRlcigocmVmKT0+cmVmLmlkICE9PSBub2RlUmVmLmlkKX19LFxyXG4gICAgICAgIH0sIHNlbGVjdGVkVmlld05vZGU6IHt9fSwgdHJ1ZSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIENIQU5HRV9WSUVXX05PREVfVElUTEUobm9kZVJlZiwgZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBjb25zdCBub2RlSWQgPSBub2RlUmVmLmlkXHJcbiAgICAgICAgY29uc3Qgbm9kZVR5cGUgPSBub2RlUmVmLnJlZlxyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICBbbm9kZVR5cGVdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlVHlwZV0sIFtub2RlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlVHlwZV1bbm9kZUlkXSwgdGl0bGU6IGUudGFyZ2V0LnZhbHVlfX0sXHJcbiAgICAgICAgfX0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBDSEFOR0VfU1RBVEVfTk9ERV9USVRMRShub2RlSWQsIGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIHN0YXRlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5zdGF0ZSwgW25vZGVJZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnN0YXRlW25vZGVJZF0sIHRpdGxlOiBlLnRhcmdldC52YWx1ZX19LFxyXG4gICAgICAgIH19KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQ0hBTkdFX05BTUVTUEFDRV9USVRMRShub2RlSWQsIGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIG5hbWVTcGFjZTogey4uLnN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlLCBbbm9kZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlW25vZGVJZF0sIHRpdGxlOiBlLnRhcmdldC52YWx1ZX19LFxyXG4gICAgICAgIH19KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQ0hBTkdFX0NVUlJFTlRfU1RBVEVfVEVYVF9WQUxVRShzdGF0ZUlkLCBlKSB7XHJcbiAgICAgICAgYXBwLnNldEN1cnJlbnRTdGF0ZSh7Li4uYXBwLmdldEN1cnJlbnRTdGF0ZSgpLCBbc3RhdGVJZF06IGUudGFyZ2V0LnZhbHVlfSlcclxuICAgICAgICByZW5kZXIoKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQ0hBTkdFX0NVUlJFTlRfU1RBVEVfTlVNQkVSX1ZBTFVFKHN0YXRlSWQsIGUpIHtcclxuICAgICAgICAvLyB0b2RvIGJpZyB0aHJvd3MgZXJyb3IgaW5zdGVhZCBvZiByZXR1cm5pbmcgTmFOLi4uIGZpeCwgcmV3cml0ZSBvciBoYWNrXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYoYmlnKGUudGFyZ2V0LnZhbHVlKS50b1N0cmluZygpICE9PSBhcHAuZ2V0Q3VycmVudFN0YXRlKClbc3RhdGVJZF0udG9TdHJpbmcoKSl7XHJcbiAgICAgICAgICAgICAgICBhcHAuc2V0Q3VycmVudFN0YXRlKHsuLi5hcHAuZ2V0Q3VycmVudFN0YXRlKCksIFtzdGF0ZUlkXTogYmlnKGUudGFyZ2V0LnZhbHVlKX0pXHJcbiAgICAgICAgICAgICAgICByZW5kZXIoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaChlcnIpIHtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBDSEFOR0VfU1RBVElDX1ZBTFVFKHJlZiwgcHJvcGVydHlOYW1lLCB0eXBlLCBlKSB7XHJcbiAgICAgICAgbGV0IHZhbHVlID0gZS50YXJnZXQudmFsdWVcclxuICAgICAgICBpZih0eXBlID09PSAnbnVtYmVyJyl7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGJpZyhlLnRhcmdldC52YWx1ZSlcclxuICAgICAgICAgICAgfSBjYXRjaChlcnIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0eXBlID09PSAnYm9vbGVhbicpe1xyXG4gICAgICAgICAgICB2YWx1ZSA9ICh2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gJ3RydWUnKSA/IHRydWUgOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246e1xyXG4gICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICBbcmVmLnJlZl06IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb25bcmVmLnJlZl0sXHJcbiAgICAgICAgICAgICAgICBbcmVmLmlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXSxcclxuICAgICAgICAgICAgICAgICAgICBbcHJvcGVydHlOYW1lXTogdmFsdWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH19KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQUREX0VWRU5UKHByb3BlcnR5TmFtZSwgbm9kZSkge1xyXG4gICAgICAgIGNvbnN0IHJlZiA9IHN0YXRlLnNlbGVjdGVkVmlld05vZGVcclxuICAgICAgICBjb25zdCBldmVudElkID0gdXVpZCgpO1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjp7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIFtyZWYucmVmXToge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbltyZWYucmVmXSxcclxuICAgICAgICAgICAgICAgIFtyZWYuaWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdLFxyXG4gICAgICAgICAgICAgICAgICAgIFtwcm9wZXJ0eU5hbWVdOiB7cmVmOiAnZXZlbnQnLCBpZDogZXZlbnRJZH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXZlbnQ6IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24uZXZlbnQsXHJcbiAgICAgICAgICAgICAgICBbZXZlbnRJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBwcm9wZXJ0eU5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgZW1pdHRlcjogbm9kZSxcclxuICAgICAgICAgICAgICAgICAgICBtdXRhdG9yczogW10sXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogW11cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH19KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gU0VMRUNUX1BJUEUocGlwZUlkKSB7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBzZWxlY3RlZFBpcGVJZDpwaXBlSWR9KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQ0hBTkdFX1BJUEVfVkFMVUVfVE9fU1RBVEUocGlwZUlkKSB7XHJcbiAgICAgICAgaWYoIXN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgfHwgc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0udmFsdWUuaWQgKXtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgcGlwZToge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLFxyXG4gICAgICAgICAgICAgICAgW3BpcGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXSxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZToge3JlZjogJ3N0YXRlJywgaWQ6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWR9LFxyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogW11cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH19KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQUREX1RSQU5TRk9STUFUSU9OKHBpcGVJZCwgdHJhbnNmb3JtYXRpb24pIHtcclxuICAgICAgICBpZih0cmFuc2Zvcm1hdGlvbiA9PT0gJ2pvaW4nKXtcclxuICAgICAgICAgICAgY29uc3QgbmV3UGlwZUlkID0gdXVpZCgpO1xyXG4gICAgICAgICAgICBjb25zdCBqb2luSWQgPSB1dWlkKCk7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgIGpvaW46IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLmpvaW4sXHJcbiAgICAgICAgICAgICAgICAgICAgW2pvaW5JZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6ICdwaXBlJywgaWQ6bmV3UGlwZUlkfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwaXBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIFtuZXdQaXBlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdEZWZhdWx0IHRleHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBbcGlwZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBzdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXS50cmFuc2Zvcm1hdGlvbnMuY29uY2F0KHtyZWY6ICdqb2luJywgaWQ6am9pbklkfSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH19KVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0cmFuc2Zvcm1hdGlvbiA9PT0gJ3RvVXBwZXJDYXNlJyl7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld0lkID0gdXVpZCgpO1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICB0b1VwcGVyQ2FzZToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24udG9VcHBlckNhc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgW25ld0lkXToge31cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwaXBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIFtwaXBlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IHN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLnRyYW5zZm9ybWF0aW9ucy5jb25jYXQoe3JlZjogJ3RvVXBwZXJDYXNlJywgaWQ6bmV3SWR9KVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfX0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRyYW5zZm9ybWF0aW9uID09PSAndG9Mb3dlckNhc2UnKXtcclxuICAgICAgICAgICAgY29uc3QgbmV3SWQgPSB1dWlkKCk7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgIHRvTG93ZXJDYXNlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi50b0xvd2VyQ2FzZSxcclxuICAgICAgICAgICAgICAgICAgICBbbmV3SWRdOiB7fVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHBpcGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsXHJcbiAgICAgICAgICAgICAgICAgICAgW3BpcGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0udHJhbnNmb3JtYXRpb25zLmNvbmNhdCh7cmVmOiAndG9Mb3dlckNhc2UnLCBpZDpuZXdJZH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9fSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHJhbnNmb3JtYXRpb24gPT09ICd0b1RleHQnKXtcclxuICAgICAgICAgICAgY29uc3QgbmV3SWQgPSB1dWlkKCk7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgIHRvVGV4dDoge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24udG9UZXh0LFxyXG4gICAgICAgICAgICAgICAgICAgIFtuZXdJZF06IHt9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcGlwZToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZSxcclxuICAgICAgICAgICAgICAgICAgICBbcGlwZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBzdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXS50cmFuc2Zvcm1hdGlvbnMuY29uY2F0KHtyZWY6ICd0b1RleHQnLCBpZDpuZXdJZH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9fSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHJhbnNmb3JtYXRpb24gPT09ICdhZGQnKXtcclxuICAgICAgICAgICAgY29uc3QgbmV3UGlwZUlkID0gdXVpZCgpO1xyXG4gICAgICAgICAgICBjb25zdCBhZGRJZCA9IHV1aWQoKTtcclxuICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgYWRkOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5hZGQsXHJcbiAgICAgICAgICAgICAgICAgICAgW2FkZElkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToge3JlZjogJ3BpcGUnLCBpZDpuZXdQaXBlSWR9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHBpcGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsXHJcbiAgICAgICAgICAgICAgICAgICAgW25ld1BpcGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ251bWJlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBbcGlwZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBzdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXS50cmFuc2Zvcm1hdGlvbnMuY29uY2F0KHtyZWY6ICdhZGQnLCBpZDphZGRJZH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9fSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHJhbnNmb3JtYXRpb24gPT09ICdzdWJ0cmFjdCcpe1xyXG4gICAgICAgICAgICBjb25zdCBuZXdQaXBlSWQgPSB1dWlkKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHN1YnRyYWN0SWQgPSB1dWlkKCk7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgIHN1YnRyYWN0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5zdWJ0cmFjdCxcclxuICAgICAgICAgICAgICAgICAgICBbc3VidHJhY3RJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6ICdwaXBlJywgaWQ6bmV3UGlwZUlkfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwaXBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIFtuZXdQaXBlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgW3BpcGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0udHJhbnNmb3JtYXRpb25zLmNvbmNhdCh7cmVmOiAnc3VidHJhY3QnLCBpZDpzdWJ0cmFjdElkfSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH19KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFJFU0VUX0FQUF9TVEFURSgpIHtcclxuICAgICAgICBhcHAuc2V0Q3VycmVudFN0YXRlKGFwcC5jcmVhdGVEZWZhdWx0U3RhdGUoKSlcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGV2ZW50U3RhY2s6IFtdfSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFJFU0VUX0FQUF9ERUZJTklUSU9OKCkge1xyXG4gICAgICAgIGlmKHN0YXRlLmRlZmluaXRpb24gIT09IGFwcERlZmluaXRpb24pe1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHsuLi5hcHBEZWZpbml0aW9ufX0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gRlVMTF9TQ1JFRU5fQ0xJQ0tFRCh2YWx1ZSkge1xyXG4gICAgICAgIGlmKHZhbHVlICE9PSBzdGF0ZS5mdWxsU2NyZWVuKXtcclxuICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBmdWxsU2NyZWVuOiB2YWx1ZX0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGJveEljb24gPSAoKSA9PiBoKCdpJywge2F0dHJzOiB7Y2xhc3M6ICdtYXRlcmlhbC1pY29ucyd9fSwgJ2Nyb3Bfc3F1YXJlJykgLy8gZGFzaGJvYXJkID9cclxuICAgIGNvbnN0IGlmSWNvbiA9ICgpID0+IGgoJ2knLCB7YXR0cnM6IHtjbGFzczogJ21hdGVyaWFsLWljb25zJ319LCAnZG9uZScpXHJcbiAgICBjb25zdCBudW1iZXJJY29uID0gKCkgPT4gaCgnaScsIHthdHRyczoge2NsYXNzOiAnbWF0ZXJpYWwtaWNvbnMnfX0sICdsb29rc19vbmUnKVxyXG4gICAgY29uc3QgbGlzdEljb24gPSAoKSA9PiBoKCdpJywge2F0dHJzOiB7Y2xhc3M6ICdtYXRlcmlhbC1pY29ucyd9fSwgJ3ZpZXdfbGlzdCcpXHJcbiAgICBjb25zdCBpbnB1dEljb24gPSAoKSA9PiBoKCdpJywge2F0dHJzOiB7Y2xhc3M6ICdtYXRlcmlhbC1pY29ucyd9fSwgJ2lucHV0JylcclxuICAgIGNvbnN0IHRleHRJY29uID0gKCkgPT4gaCgnaScsIHthdHRyczoge2NsYXNzOiAnbWF0ZXJpYWwtaWNvbnMnfX0sICd0ZXh0X2ZpZWxkcycpXHJcbiAgICBjb25zdCBkZWxldGVJY29uID0gKCkgPT4gaCgnaScsIHthdHRyczoge2NsYXNzOiAnbWF0ZXJpYWwtaWNvbnMnfX0sICdkZWxldGVfZm9yZXZlcicpXHJcbiAgICBjb25zdCBjbGVhckljb24gPSAoKSA9PiBoKCdpJywge2F0dHJzOiB7Y2xhc3M6ICdtYXRlcmlhbC1pY29ucyd9fSwgJ2NsZWFyJylcclxuICAgIGNvbnN0IGZvbGRlckljb24gPSAoKSA9PiBoKCdpJywge2F0dHJzOiB7Y2xhc3M6ICdtYXRlcmlhbC1pY29ucyd9fSwgJ2ZvbGRlcicpXHJcbiAgICBjb25zdCBhcHBJY29uID0gKCkgPT4gaCgnaScsIHthdHRyczoge2NsYXNzOiAnbWF0ZXJpYWwtaWNvbnMnfSwgc3R5bGU6IHsgZm9udFNpemU6ICcxOHB4J319LCAnZGVzY3JpcHRpb24nKVxyXG4gICAgY29uc3QgYXJyb3dJY29uID0gKHJvdGF0ZSkgPT4gaCgnaScsIHthdHRyczoge2NsYXNzOiAnbWF0ZXJpYWwtaWNvbnMnLCAnZGF0YS1jbG9zZWFycm93JzogdHJ1ZX0sIHN0eWxlOiB7dHJhbnNpdGlvbjogJ2FsbCAwLjJzJywgdHJhbnNmb3JtOiByb3RhdGUgPyAncm90YXRlKC05MGRlZyknIDogJ3JvdGF0ZSgwZGVnKScsIGN1cnNvcjogJ3BvaW50ZXInfX0sICdleHBhbmRfbW9yZScpXHJcblxyXG4gICAgZnVuY3Rpb24gcmVuZGVyKCkge1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRSdW5uaW5nU3RhdGUgPSBhcHAuZ2V0Q3VycmVudFN0YXRlKClcclxuICAgICAgICBjb25zdCBkcmFnQ29tcG9uZW50TGVmdCA9IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgIG1vdXNlZG93bjogW1dJRFRIX0RSQUdHRUQsICdlZGl0b3JMZWZ0V2lkdGgnXSxcclxuICAgICAgICAgICAgICAgIHRvdWNoc3RhcnQ6IFtXSURUSF9EUkFHR0VELCAnZWRpdG9yTGVmdFdpZHRoJ10sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgICAgIHJpZ2h0OiAnMCcsXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGVYKDEwMCUpJyxcclxuICAgICAgICAgICAgICAgIHRvcDogJzAnLFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6ICcxMHB4JyxcclxuICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMWVtJyxcclxuICAgICAgICAgICAgICAgIG9wYWNpdHk6ICcwJyxcclxuICAgICAgICAgICAgICAgIGN1cnNvcjogJ2NvbC1yZXNpemUnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgY29uc3QgZHJhZ0NvbXBvbmVudFJpZ2h0ID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgbW91c2Vkb3duOiBbV0lEVEhfRFJBR0dFRCwgJ2VkaXRvclJpZ2h0V2lkdGgnXSxcclxuICAgICAgICAgICAgICAgIHRvdWNoc3RhcnQ6IFtXSURUSF9EUkFHR0VELCAnZWRpdG9yUmlnaHRXaWR0aCddLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICBsZWZ0OiAnMCcsXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGVYKC0xMDAlKScsXHJcbiAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAnMTBweCcsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogJzFlbScsXHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAnMCcsXHJcbiAgICAgICAgICAgICAgICBjdXJzb3I6ICdjb2wtcmVzaXplJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KVxyXG4gICAgICAgIGNvbnN0IGRyYWdTdWJDb21wb25lbnQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICBtb3VzZWRvd246IFtXSURUSF9EUkFHR0VELCAnc3ViRWRpdG9yV2lkdGgnXSxcclxuICAgICAgICAgICAgICAgIHRvdWNoc3RhcnQ6IFtXSURUSF9EUkFHR0VELCAnc3ViRWRpdG9yV2lkdGgnXSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICAgICAgbGVmdDogJzJweCcsXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGVYKC0xMDAlKScsXHJcbiAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAnMTBweCcsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogJzFlbScsXHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICAgICAgY3Vyc29yOiAnY29sLXJlc2l6ZScsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZW1iZXJFZGl0b3IocmVmLCB0eXBlKXtcclxuICAgICAgICAgICAgY29uc3QgcGlwZSA9IHN0YXRlLmRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gbGlzdFRyYW5zZm9ybWF0aW9ucyh0cmFuc2Zvcm1hdGlvbnMsIHRyYW5zVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybWF0aW9ucy5tYXAoKHRyYW5zUmVmLCBpbmRleCk9PntcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1lciA9IHN0YXRlLmRlZmluaXRpb25bdHJhbnNSZWYucmVmXVt0cmFuc1JlZi5pZF1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNSZWYucmVmID09PSAnZXF1YWwnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge2tleTogaW5kZXgsIHN0eWxlOiB7Y29sb3I6ICcjYmRiZGJkJywgY3Vyc29yOiAnZGVmYXVsdCcsIGRpc3BsYXk6J2ZsZXgnfX0sIFtoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnfX0sIHRyYW5zUmVmLnJlZiksIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCcsIGNvbG9yOiB0cmFuc2Zvcm1hdGlvbnMubGVuZ3RoLTEgIT09IGluZGV4ID8gJyNiZGJkYmQnOiB0cmFuc1R5cGUgPT09IHR5cGUgPyAnZ3JlZW4nOiAncmVkJ319LCAndHJ1ZS9mYWxzZScpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nTGVmdDogJzE1cHgnfX0sIFtlbWJlckVkaXRvcih0cmFuc2Zvcm1lci52YWx1ZSwgdHlwZSldKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNSZWYucmVmID09PSAnYWRkJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge30sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtrZXk6IGluZGV4LCBzdHlsZToge2NvbG9yOiAnI2JkYmRiZCcsIGN1cnNvcjogJ2RlZmF1bHQnLCBkaXNwbGF5OidmbGV4J319LCBbaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJ319LCB0cmFuc1JlZi5yZWYpLCBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAnLCBjb2xvcjogdHJhbnNmb3JtYXRpb25zLmxlbmd0aC0xICE9PSBpbmRleCA/ICcjYmRiZGJkJzogdHJhbnNUeXBlID09PSB0eXBlID8gJ2dyZWVuJzogJ3JlZCd9fSwgJ251bWJlcicpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nTGVmdDogJzE1cHgnfX0sIFtlbWJlckVkaXRvcih0cmFuc2Zvcm1lci52YWx1ZSwgJ251bWJlcicpXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zUmVmLnJlZiA9PT0gJ3N1YnRyYWN0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge30sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtrZXk6IGluZGV4LCBzdHlsZToge2NvbG9yOiAnI2JkYmRiZCcsIGN1cnNvcjogJ2RlZmF1bHQnLCBkaXNwbGF5OidmbGV4J319LCBbaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJ319LCB0cmFuc1JlZi5yZWYpLCBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAnLCBjb2xvcjogdHJhbnNmb3JtYXRpb25zLmxlbmd0aC0xICE9PSBpbmRleCA/ICcjYmRiZGJkJzogdHJhbnNUeXBlID09PSB0eXBlID8gJ2dyZWVuJzogJ3JlZCd9fSwgJ251bWJlcicpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nTGVmdDogJzE1cHgnfX0sIFtlbWJlckVkaXRvcih0cmFuc2Zvcm1lci52YWx1ZSwgJ251bWJlcicpXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zUmVmLnJlZiA9PT0gJ211bHRpcGx5Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge30sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtrZXk6IGluZGV4LCBzdHlsZToge2NvbG9yOiAnI2JkYmRiZCcsIGN1cnNvcjogJ2RlZmF1bHQnLCBkaXNwbGF5OidmbGV4J319LCBbaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJ319LCB0cmFuc1JlZi5yZWYpLCBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAnLCBjb2xvcjogdHJhbnNmb3JtYXRpb25zLmxlbmd0aC0xICE9PSBpbmRleCA/ICcjYmRiZGJkJzogdHJhbnNUeXBlID09PSB0eXBlID8gJ2dyZWVuJzogJ3JlZCd9fSwgJ251bWJlcicpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nTGVmdDogJzE1cHgnfX0sIFtlbWJlckVkaXRvcih0cmFuc2Zvcm1lci52YWx1ZSwgJ251bWJlcicpXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zUmVmLnJlZiA9PT0gJ2RpdmlkZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHt9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7a2V5OiBpbmRleCwgc3R5bGU6IHtjb2xvcjogJyNiZGJkYmQnLCBjdXJzb3I6ICdkZWZhdWx0JywgZGlzcGxheTonZmxleCd9fSwgW2goJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMSd9fSwgdHJhbnNSZWYucmVmKSwgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwJywgY29sb3I6IHRyYW5zZm9ybWF0aW9ucy5sZW5ndGgtMSAhPT0gaW5kZXggPyAnI2JkYmRiZCc6IHRyYW5zVHlwZSA9PT0gdHlwZSA/ICdncmVlbic6ICdyZWQnfX0sICdudW1iZXInKV0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ0xlZnQ6ICcxNXB4J319LCBbZW1iZXJFZGl0b3IodHJhbnNmb3JtZXIudmFsdWUsICdudW1iZXInKV0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc1JlZi5yZWYgPT09ICdyZW1haW5kZXInKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge2tleTogaW5kZXgsIHN0eWxlOiB7Y29sb3I6ICcjYmRiZGJkJywgY3Vyc29yOiAnZGVmYXVsdCcsIGRpc3BsYXk6J2ZsZXgnfX0sIFtoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnfX0sIHRyYW5zUmVmLnJlZiksIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCcsIGNvbG9yOiB0cmFuc2Zvcm1hdGlvbnMubGVuZ3RoLTEgIT09IGluZGV4ID8gJyNiZGJkYmQnOiB0cmFuc1R5cGUgPT09IHR5cGUgPyAnZ3JlZW4nOiAncmVkJ319LCAnbnVtYmVyJyldKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmdMZWZ0OiAnMTVweCd9fSwgW2VtYmVyRWRpdG9yKHRyYW5zZm9ybWVyLnZhbHVlLCAnbnVtYmVyJyldKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyBpZiAodHJhbnNSZWYucmVmID09PSAnYnJhbmNoJykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICBpZihyZXNvbHZlKHRyYW5zZm9ybWVyLnByZWRpY2F0ZSkpe1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgdmFsdWUgPSB0cmFuc2Zvcm1WYWx1ZSh2YWx1ZSwgdHJhbnNmb3JtZXIudGhlbilcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIHZhbHVlID0gdHJhbnNmb3JtVmFsdWUodmFsdWUsIHRyYW5zZm9ybWVyLmVsc2UpXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zUmVmLnJlZiA9PT0gJ2pvaW4nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7Y29sb3I6ICcjYmRiZGJkJywgY3Vyc29yOiAnZGVmYXVsdCcsIGRpc3BsYXk6J2ZsZXgnfX0sIFtoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnfX0sIHRyYW5zUmVmLnJlZiksIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCcsIGNvbG9yOiB0cmFuc2Zvcm1hdGlvbnMubGVuZ3RoLTEgIT09IGluZGV4ID8gJyNiZGJkYmQnOiB0cmFuc1R5cGUgPT09IHR5cGUgPyAnZ3JlZW4nOiAncmVkJ319LCAndGV4dCcpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nTGVmdDogJzE1cHgnfX0sIFtlbWJlckVkaXRvcih0cmFuc2Zvcm1lci52YWx1ZSwgdHJhbnNUeXBlKV0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc1JlZi5yZWYgPT09ICd0b1VwcGVyQ2FzZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHt9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtjdXJzb3I6ICdkZWZhdWx0JywgZGlzcGxheTonZmxleCd9fSwgW2goJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMScsIGNvbG9yOiAnI2JkYmRiZCd9fSwgdHJhbnNSZWYucmVmKSwgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwJywgY29sb3I6IHRyYW5zZm9ybWF0aW9ucy5sZW5ndGgtMSAhPT0gaW5kZXggPyAnI2JkYmRiZCc6IHRyYW5zVHlwZSA9PT0gdHlwZSA/ICdncmVlbic6ICdyZWQnfX0sICd0ZXh0JyldKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zUmVmLnJlZiA9PT0gJ3RvTG93ZXJDYXNlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge30sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2N1cnNvcjogJ2RlZmF1bHQnLCBkaXNwbGF5OidmbGV4J319LCBbaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJywgY29sb3I6ICcjYmRiZGJkJ319LCB0cmFuc1JlZi5yZWYpLCBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAnLCBjb2xvcjogdHJhbnNmb3JtYXRpb25zLmxlbmd0aC0xICE9PSBpbmRleCA/ICcjYmRiZGJkJzogdHJhbnNUeXBlID09PSB0eXBlID8gJ2dyZWVuJzogJ3JlZCd9fSwgJ3RleHQnKV0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNSZWYucmVmID09PSAndG9UZXh0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge30sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2N1cnNvcjogJ2RlZmF1bHQnLCBkaXNwbGF5OidmbGV4J319LCBbaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJywgY29sb3I6ICcjYmRiZGJkJ319LCB0cmFuc1JlZi5yZWYpLCBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAnLCBjb2xvcjogdHJhbnNmb3JtYXRpb25zLmxlbmd0aC0xICE9PSBpbmRleCA/ICcjYmRiZGJkJzogdHJhbnNUeXBlID09PSB0eXBlID8gJ2dyZWVuJzogJ3JlZCd9fSwgJ3RleHQnKV0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGdlblRyYW5zZm9ybWF0b3JzKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRQaXBlID0gc3RhdGUuZGVmaW5pdGlvbi5waXBlW3N0YXRlLnNlbGVjdGVkUGlwZUlkXVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFtoKCdkaXYnLCB7c3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2ZpeGVkJyxcclxuICAgICAgICAgICAgICAgICAgICB0b3A6ICcwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6ICctMzA3cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMzAwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgIH19LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jyx7c3R5bGU6IHtib3JkZXI6ICczcHggc29saWQgIzIyMicsIGZsZXg6ICcxIDEgMCUnLCBiYWNrZ3JvdW5kOiAnIzRkNGQ0ZCcsIG1hcmdpbkJvdHRvbTogJzEwcHgnfX0sIFtzZWxlY3RlZFBpcGUudHlwZV0pXHJcbiAgICAgICAgICAgICAgICBdKV1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHBpcGUudmFsdWUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge3N0eWxlOiB7cG9zaXRpb246ICdyZWxhdGl2ZSd9fSwgW2goJ2RpdicsIHtzdHlsZTp7ZGlzcGxheTonZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInfSwgb246IHtjbGljazogW1NFTEVDVF9QSVBFLCByZWYuaWRdfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICBoKCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAgJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dERlY29yYXRpb246ICd1bmRlcmxpbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IFtDSEFOR0VfU1RBVElDX1ZBTFVFLCByZWYsICd2YWx1ZScsICd0ZXh0J10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGl2ZVByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHBpcGUudmFsdWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtmbGV4OiAnMCcsIGN1cnNvcjogJ2RlZmF1bHQnLCBjb2xvcjogcGlwZS50cmFuc2Zvcm1hdGlvbnMubGVuZ3RoID4gMCA/ICcjYmRiZGJkJzogdHlwZSA9PT0gJ3RleHQnID8gJ2dyZWVuJzogJ3JlZCd9fSwgJ3RleHQnKVxyXG4gICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ0xlZnQ6ICcxNXB4J319LCBsaXN0VHJhbnNmb3JtYXRpb25zKHBpcGUudHJhbnNmb3JtYXRpb25zLCBwaXBlLnR5cGUpKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCBzdGF0ZS5zZWxlY3RlZFBpcGVJZCA9PT0gcmVmLmlkID8gZ2VuVHJhbnNmb3JtYXRvcnMoKTogW10pXHJcbiAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAocGlwZS52YWx1ZSA9PT0gdHJ1ZSB8fCBwaXBlLnZhbHVlID09PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGgoJ3NlbGVjdCcsIHtsaXZlUHJvcHM6IHt2YWx1ZTogIHBpcGUudmFsdWUudG9TdHJpbmcoKX0sIHN0eWxlOiB7fSwgIG9uOiB7aW5wdXQ6ICBbQ0hBTkdFX1NUQVRJQ19WQUxVRSwgcmVmLCAndmFsdWUnLCAnYm9vbGVhbiddfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICBoKCdvcHRpb24nLCB7YXR0cnM6IHt2YWx1ZTogJ3RydWUnfSwgc3R5bGU6IHtjb2xvcjogJ2JsYWNrJ319LCBbJ3RydWUnXSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnb3B0aW9uJywge2F0dHJzOiB7dmFsdWU6ICdmYWxzZSd9LCBzdHlsZToge2NvbG9yOiAnYmxhY2snfX0sIFsnZmFsc2UnXSksXHJcbiAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIWlzTmFOKHBhcnNlRmxvYXQoTnVtYmVyKHBpcGUudmFsdWUpKSkgJiYgaXNGaW5pdGUoTnVtYmVyKHBpcGUudmFsdWUpKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtzdHlsZToge3Bvc2l0aW9uOiAncmVsYXRpdmUnfX0sIFtoKCdkaXYnLCB7c3R5bGU6e2Rpc3BsYXk6J2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJ30sIG9uOiB7Y2xpY2s6IFtTRUxFQ1RfUElQRSwgcmVmLmlkXX19LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnaW5wdXQnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRyczoge3R5cGU6J251bWJlcid9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZTogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW46ICAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0RGVjb3JhdGlvbjogJ3VuZGVybGluZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogW0NIQU5HRV9TVEFUSUNfVkFMVUUsIHJlZiwgJ3ZhbHVlJywgJ251bWJlciddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpdmVQcm9wczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBOdW1iZXIocGlwZS52YWx1ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtmbGV4OiAnMCcsIGN1cnNvcjogJ2RlZmF1bHQnLCBjb2xvcjogcGlwZS50cmFuc2Zvcm1hdGlvbnMubGVuZ3RoID4gMCA/ICcjYmRiZGJkJzogdHlwZSA9PT0gJ251bWJlcicgPyAnZ3JlZW4nOiAncmVkJ319LCAnbnVtYmVyJylcclxuICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmdMZWZ0OiAnMTVweCd9fSwgbGlzdFRyYW5zZm9ybWF0aW9ucyhwaXBlLnRyYW5zZm9ybWF0aW9ucywgcGlwZS50eXBlKSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywgc3RhdGUuc2VsZWN0ZWRQaXBlSWQgPT09IHJlZi5pZCA/IGdlblRyYW5zZm9ybWF0b3JzKCk6IFtdKVxyXG4gICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYocGlwZS52YWx1ZS5yZWYgPT09ICdzdGF0ZScpe1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZGlzcGxTdGF0ZSA9IHN0YXRlLmRlZmluaXRpb25bcGlwZS52YWx1ZS5yZWZdW3BpcGUudmFsdWUuaWRdXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge3N0eWxlOiB7cG9zaXRpb246ICdyZWxhdGl2ZSd9fSwgW2goJ2RpdicsIHtzdHlsZTp7ZGlzcGxheTonZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInfSwgb246IHtjbGljazogW1NFTEVDVF9QSVBFLCByZWYuaWRdfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtmbGV4OiAnMSd9fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwIDAgYXV0bycsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCBwb3NpdGlvbjogJ3JlbGF0aXZlJywgdHJhbnNmb3JtOiAndHJhbnNsYXRlWigwKScsIGJveFNoYWRvdzogJ2luc2V0IDAgMCAwIDJweCAnICsgKHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHBpcGUudmFsdWUuaWQ/ICcjZWFiNjVjJzogJyM4MjgyODInKSAsIGJhY2tncm91bmQ6ICcjNDQ0JywgcGFkZGluZzogJzRweCA3cHgnLH19LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2NvbG9yOiAnd2hpdGUnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJ30sIG9uOiB7Y2xpY2s6IFtTVEFURV9OT0RFX1NFTEVDVEVELCBwaXBlLnZhbHVlLmlkXX19LCBkaXNwbFN0YXRlLnRpdGxlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtmbGV4OiAnMCcsIGN1cnNvcjogJ2RlZmF1bHQnLCBjb2xvcjogcGlwZS50cmFuc2Zvcm1hdGlvbnMubGVuZ3RoID4gMCA/ICcjYmRiZGJkJzogZGlzcGxTdGF0ZS50eXBlID09PSB0eXBlID8gJ2dyZWVuJzogJ3JlZCd9fSwgZGlzcGxTdGF0ZS50eXBlKVxyXG4gICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ0xlZnQ6ICcxNXB4J319LCBsaXN0VHJhbnNmb3JtYXRpb25zKHBpcGUudHJhbnNmb3JtYXRpb25zLCBwaXBlLnR5cGUpKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCBzdGF0ZS5zZWxlY3RlZFBpcGVJZCA9PT0gcmVmLmlkID8gZ2VuVHJhbnNmb3JtYXRvcnMoKTogW10pXHJcbiAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHBpcGUudmFsdWUucmVmID09PSAnbGlzdFZhbHVlJyl7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2JywgJ1RPRE8nKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHBpcGUudmFsdWUucmVmID09PSAnZXZlbnREYXRhJyl7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudERhdGEgPSBzdGF0ZS5kZWZpbml0aW9uW3BpcGUudmFsdWUucmVmXVtwaXBlLnZhbHVlLmlkXVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIFtoKCdkaXYnLCB7c3R5bGU6e2Rpc3BsYXk6J2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJ30sIG9uOiB7Y2xpY2s6IFtTRUxFQ1RfUElQRSwgcmVmLmlkXX19LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzEnfX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtoKCdkaXYnLHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJywgY29sb3I6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHBpcGUudmFsdWUuaWQgPyAnI2VhYjY1Yyc6ICd3aGl0ZScsIHBhZGRpbmc6ICcycHggNXB4JywgbWFyZ2luOiAnM3B4IDNweCAwIDAnLCBib3JkZXI6ICcycHggc29saWQgJyArIChzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBwaXBlLnZhbHVlLmlkID8gJyNlYWI2NWMnOiAnd2hpdGUnKSwgZGlzcGxheTogJ2lubGluZS1ibG9jayd9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7Y2xpY2s6IFtTVEFURV9OT0RFX1NFTEVDVEVELCBwaXBlLnZhbHVlLmlkXX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbZXZlbnREYXRhLnRpdGxlXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzAnLCBjdXJzb3I6ICdkZWZhdWx0JywgY29sb3I6IHBpcGUudHJhbnNmb3JtYXRpb25zLmxlbmd0aCA+IDAgPyAnI2JkYmRiZCc6IGV2ZW50RGF0YS50eXBlID09PSB0eXBlID8gJ2dyZWVuJzogJ3JlZCd9fSwgZXZlbnREYXRhLnR5cGUpXHJcbiAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nTGVmdDogJzE1cHgnfX0sIGxpc3RUcmFuc2Zvcm1hdGlvbnMocGlwZS50cmFuc2Zvcm1hdGlvbnMsIHBpcGUudHlwZSkpLFxyXG4gICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbGlzdFN0YXRlKHN0YXRlSWQpIHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudFN0YXRlID0gc3RhdGUuZGVmaW5pdGlvbi5zdGF0ZVtzdGF0ZUlkXVxyXG4gICAgICAgICAgICBmdW5jdGlvbiBlZGl0aW5nTm9kZSgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBoKCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZTogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnNHB4IDdweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udDogJ2luaGVyaXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmxleDogJzAgMCBhdXRvJyxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBbQ0hBTkdFX1NUQVRFX05PREVfVElUTEUsIHN0YXRlSWRdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbGl2ZVByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdXJyZW50U3RhdGUudGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBhdHRyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pc3RpdGxlZWRpdG9yJzogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTRweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2Rpc3BsYXk6ICdmbGV4JywgZmxleFdyYXA6ICd3cmFwJ319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCAwIGF1dG8nLCAgcG9zaXRpb246ICdyZWxhdGl2ZScsIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVooMCknLCBtYXJnaW46ICc3cHggN3B4IDAgMCcsICBib3hTaGFkb3c6ICdpbnNldCAwIDAgMCAycHggJyArIChzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBzdGF0ZUlkID8gJyNlYWI2NWMnOiAnIzgyODI4MicpICwgYmFja2dyb3VuZDogJyM0NDQnLCBwYWRkaW5nOiAnNHB4IDdweCcsfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtvcGFjaXR5OiBzdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQgPT09IHN0YXRlSWQgPyAnMCc6ICcxJywgY29sb3I6ICd3aGl0ZScsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snfSwgb246IHtjbGljazogW1NUQVRFX05PREVfU0VMRUNURUQsIHN0YXRlSWRdLCBkYmxjbGljazogW0VESVRfVklFV19OT0RFX1RJVExFLCBzdGF0ZUlkXX19LCBjdXJyZW50U3RhdGUudGl0bGUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuZWRpdGluZ1RpdGxlTm9kZUlkID09PSBzdGF0ZUlkID8gZWRpdGluZ05vZGUoKTogaCgnc3BhbicpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgKCgpPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm9TdHlsZUlucHV0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBjdXJyZW50UnVubmluZ1N0YXRlW3N0YXRlSWRdICE9PSBzdGF0ZS5kZWZpbml0aW9uLnN0YXRlW3N0YXRlSWRdLmRlZmF1bHRWYWx1ZSA/ICdyZ2IoOTEsIDIwNCwgOTEpJyA6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbGV4OiAnMScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluV2lkdGg6ICc1MHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW5Ub3A6ICc2cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJ2luc2V0IDAgLTJweCAwIDAgJyArIChzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBzdGF0ZUlkID8gJyNlYWI2NWMnOiAnIzgyODI4MicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihjdXJyZW50U3RhdGUudHlwZSA9PT0gJ3RleHQnKSByZXR1cm4gaCgnaW5wdXQnLCB7YXR0cnM6IHt0eXBlOiAndGV4dCd9LCBsaXZlUHJvcHM6IHt2YWx1ZTogY3VycmVudFJ1bm5pbmdTdGF0ZVtzdGF0ZUlkXX0sIHN0eWxlOiBub1N0eWxlSW5wdXQsIG9uOiB7aW5wdXQ6IFtDSEFOR0VfQ1VSUkVOVF9TVEFURV9URVhUX1ZBTFVFLCBzdGF0ZUlkXX19KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoY3VycmVudFN0YXRlLnR5cGUgPT09ICdudW1iZXInKSByZXR1cm4gaCgnaW5wdXQnLCB7YXR0cnM6IHt0eXBlOiAnbnVtYmVyJ30sIGxpdmVQcm9wczoge3ZhbHVlOiBjdXJyZW50UnVubmluZ1N0YXRlW3N0YXRlSWRdfSwgc3R5bGU6IG5vU3R5bGVJbnB1dCwgIG9uOiB7aW5wdXQ6IFtDSEFOR0VfQ1VSUkVOVF9TVEFURV9OVU1CRVJfVkFMVUUsIHN0YXRlSWRdfX0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihjdXJyZW50U3RhdGUudHlwZSA9PT0gJ2Jvb2xlYW4nKSByZXR1cm4gaCgnc2VsZWN0Jywge2xpdmVQcm9wczoge3ZhbHVlOiBjdXJyZW50UnVubmluZ1N0YXRlW3N0YXRlSWRdLnRvU3RyaW5nKCl9LCBzdHlsZTogbm9TdHlsZUlucHV0LCAgb246IHtpbnB1dDogW0NIQU5HRV9DVVJSRU5UX1NUQVRFX05VTUJFUl9WQUxVRSwgc3RhdGVJZF19fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ29wdGlvbicsIHthdHRyczoge3ZhbHVlOiAndHJ1ZSd9LCBzdHlsZToge2NvbG9yOiAnYmxhY2snfX0sIFsndHJ1ZSddKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdvcHRpb24nLCB7YXR0cnM6IHt2YWx1ZTogJ2ZhbHNlJ30sIHN0eWxlOiB7Y29sb3I6ICdibGFjayd9fSwgWydmYWxzZSddKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihjdXJyZW50U3RhdGUudHlwZSA9PT0gJ3RhYmxlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgIT09IHN0YXRlSWQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge2tleTogJ2ljb24nLG9uOiB7Y2xpY2s6IFtTVEFURV9OT0RFX1NFTEVDVEVELCBzdGF0ZUlkXX0sIHN0eWxlOiB7ZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgbWFyZ2luVG9wOiAnN3B4J319LCBbbGlzdEljb24oKV0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhYmxlID0gY3VycmVudFJ1bm5pbmdTdGF0ZVtzdGF0ZUlkXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiAndGFibGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzgyODE4MycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbGV4OiAnMCAwIDEwMCUnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZGlzcGxheTogJ2ZsZXgnfX0sICBPYmplY3Qua2V5cyhjdXJyZW50U3RhdGUuZGVmaW5pdGlvbikubWFwKGtleSA9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtmbGV4OiAnMScsIHBhZGRpbmc6ICcycHggNXB4JywgYm9yZGVyQm90dG9tOiAnMnB4IHNvbGlkIHdoaXRlJ319LCBrZXkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLk9iamVjdC5rZXlzKHRhYmxlKS5tYXAoaWQgPT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtkaXNwbGF5OiAnZmxleCd9fSwgT2JqZWN0LmtleXModGFibGVbaWRdKS5tYXAoa2V5ID0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcxJywgcGFkZGluZzogJzJweCA1cHgnfX0sIHRhYmxlW2lkXVtrZXldKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKCksXHJcbiAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gc3RhdGVJZCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFN0YXRlLm11dGF0b3JzLm1hcChtdXRhdG9yUmVmID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbXV0YXRvciA9IHN0YXRlLmRlZmluaXRpb25bbXV0YXRvclJlZi5yZWZdW211dGF0b3JSZWYuaWRdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gc3RhdGUuZGVmaW5pdGlvblttdXRhdG9yLmV2ZW50LnJlZl1bbXV0YXRvci5ldmVudC5pZF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZW1pdHRlciA9IHN0YXRlLmRlZmluaXRpb25bZXZlbnQuZW1pdHRlci5yZWZdW2V2ZW50LmVtaXR0ZXIuaWRdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7c3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzQ0NCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nVG9wOiAnM3B4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdCb3R0b206ICczcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IGV2ZW50LmVtaXR0ZXIuaWQgPyAnIzUzQjJFRCc6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnMC4ycyBhbGwnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluV2lkdGg6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgb246IHtjbGljazogW1ZJRVdfTk9ERV9TRUxFQ1RFRCwgZXZlbnQuZW1pdHRlcl19fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwIDAgYXV0bycsIG1hcmdpbjogJzAgMCAwIDVweCd9fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LmVtaXR0ZXIucmVmID09PSAndk5vZGVCb3gnID8gYm94SWNvbigpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuZW1pdHRlci5yZWYgPT09ICd2Tm9kZUxpc3QnID8gbGlzdEljb24oKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudC5lbWl0dGVyLnJlZiA9PT0gJ3ZOb2RlTGlzdCcgPyBpZkljb24oKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuZW1pdHRlci5yZWYgPT09ICd2Tm9kZUlucHV0JyA/IGlucHV0SWNvbigpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dEljb24oKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICc1IDUgYXV0bycsIG1hcmdpbjogJzAgNXB4IDAgMCcsIG1pbldpZHRoOiAnMCcsIG92ZXJmbG93OiAnaGlkZGVuJywgd2hpdGVTcGFjZTogJ25vd3JhcCcsIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJ319LCBlbWl0dGVyLnRpdGxlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCAwIGF1dG8nLCBtYXJnaW5MZWZ0OiAnYXV0bycsIG1hcmdpblJpZ2h0OiAnNXB4JywgY29sb3I6ICcjNWJjYzViJ319LCBldmVudC50eXBlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nKSxcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgc3RhdGVDb21wb25lbnQgPSBoKCdkaXYnLCB7IGF0dHJzOiB7Y2xhc3M6ICdiZXR0ZXItc2Nyb2xsYmFyJ30sIHN0eWxlOiB7b3ZlcmZsb3c6ICdhdXRvJywgZmxleDogJzEnLCBwYWRkaW5nOiAnMCAxMHB4J30sIG9uOiB7Y2xpY2s6IFtVTlNFTEVDVF9TVEFURV9OT0RFXX19LCBzdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZVsnX3Jvb3ROYW1lU3BhY2UnXS5jaGlsZHJlbi5tYXAoKHJlZik9PiBsaXN0U3RhdGUocmVmLmlkKSkpXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxpc3ROb2RlKG5vZGVSZWYsIHBhcmVudFJlZiwgZGVwdGgpe1xyXG4gICAgICAgICAgICBpZihub2RlUmVmLmlkID09PSAnX3Jvb3ROb2RlJykgcmV0dXJuIGxpc3RSb290Tm9kZShub2RlUmVmKVxyXG4gICAgICAgICAgICBpZihub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlVGV4dCcpIHJldHVybiBzaW1wbGVOb2RlKG5vZGVSZWYsIHBhcmVudFJlZiwgZGVwdGgpXHJcbiAgICAgICAgICAgIGlmKG5vZGVSZWYucmVmID09PSAndk5vZGVCb3gnIHx8IG5vZGVSZWYucmVmID09PSAndk5vZGVMaXN0JyB8fCBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlSWYnKSByZXR1cm4gbGlzdEJveE5vZGUobm9kZVJlZiwgcGFyZW50UmVmLCBkZXB0aClcclxuICAgICAgICAgICAgaWYobm9kZVJlZi5yZWYgPT09ICd2Tm9kZUlucHV0JykgcmV0dXJuIHNpbXBsZU5vZGUobm9kZVJlZiwgcGFyZW50UmVmLCBkZXB0aClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHByZXZlbnRfYnViYmxpbmcoZSkge1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGVkaXRpbmdOb2RlKG5vZGVSZWYpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2lucHV0Jywge1xyXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcyNnB4JyxcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICcjNTNCMkVEJyxcclxuICAgICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgZmxleDogJzEnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICdpbnNldCAwIC0xcHggMCAwICM1M0IyRUQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnQ6ICdpbmhlcml0JyxcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nTGVmdDogJzJweCcsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZWRvd246IHByZXZlbnRfYnViYmxpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IFtDSEFOR0VfVklFV19OT0RFX1RJVExFLCBub2RlUmVmXSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBsaXZlUHJvcHM6IHtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZVJlZi5pZF0udGl0bGUsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgYXR0cnM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhdXRvZm9jdXM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgJ2RhdGEtaXN0aXRsZWVkaXRvcic6IHRydWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxpc3RSb290Tm9kZShub2RlUmVmKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGVJZCA9IG5vZGVSZWYuaWRcclxuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVJZF1cclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nTGVmdDogJzhweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdSaWdodDogJzhweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNDQ0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyVG9wOiAnMnB4IHNvbGlkICM0ZDRkNGQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJCb3R0b206ICcycHggc29saWQgIzMzMycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzI2cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGl0ZVNwYWNlOiAnbm93cmFwJyxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbjoge21vdXNlbW92ZTogW1ZJRVdfSE9WRVJFRCwgbm9kZVJlZiwge30sIDFdLCB0b3VjaG1vdmU6IFtWSUVXX0hPVkVSX01PQklMRV19XHJcbiAgICAgICAgICAgICAgICAgICAgfSwgIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtrZXk6IG5vZGVJZCwgc3R5bGU6IHtjb2xvcjogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJyM1M0IyRUQnOiAnI2JkYmRiZCcsIGRpc3BsYXk6ICdpbmxpbmUtZmxleCd9LCBvbjoge2NsaWNrOiBbVklFV19OT0RFX1NFTEVDVEVELCBub2RlUmVmXX19LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBJY29uKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLmVkaXRpbmdUaXRsZU5vZGVJZCA9PT0gbm9kZUlkID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVkaXRpbmdOb2RlKG5vZGVSZWYpOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHsgc3R5bGU6IHtmbGV4OiAnMScsIGN1cnNvcjogJ3BvaW50ZXInLCBjb2xvcjogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJyM1M0IyRUQnOiAnd2hpdGUnLCB0cmFuc2l0aW9uOiAnY29sb3IgMC4ycycsIHBhZGRpbmdMZWZ0OiAnMnB4J30sIG9uOiB7Y2xpY2s6IFtWSUVXX05PREVfU0VMRUNURUQsIG5vZGVSZWZdLCBkYmxjbGljazogW0VESVRfVklFV19OT0RFX1RJVExFLCBub2RlSWRdfX0sIG5vZGUudGl0bGUpLFxyXG4gICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHN0YXRlLmhvdmVyZWRWaWV3Tm9kZSAmJiBzdGF0ZS5ob3ZlcmVkVmlld05vZGUucGFyZW50LmlkID09PSBub2RlSWQgJiYgIShub2RlLmNoaWxkcmVuLmZpbmRJbmRleCgocmVmKT0+IHJlZi5pZCA9PT0gc3RhdGUuZHJhZ2dlZENvbXBvbmVudFZpZXcuaWQpID09PSBzdGF0ZS5ob3ZlcmVkVmlld05vZGUucG9zaXRpb24pID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgKCgpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjb3B5IHBhc3RlZCBmcm9tIGxpc3RCb3hOb2RlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvbGRQb3NpdGlvbiA9IG5vZGUuY2hpbGRyZW4uZmluZEluZGV4KChyZWYpPT4gcmVmLmlkID09PSBzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50Vmlldy5pZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1Bvc2l0aW9uID0gb2xkUG9zaXRpb24gPT09IC0xIHx8IHN0YXRlLmhvdmVyZWRWaWV3Tm9kZS5wb3NpdGlvbiA8IG9sZFBvc2l0aW9uID8gc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBvc2l0aW9uIDogc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBvc2l0aW9uICsgMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuLm1hcCgocmVmKT0+bGlzdE5vZGUocmVmLCBub2RlUmVmLCAxKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjaGlsZHJlbi5zbGljZSgwLCBuZXdQb3NpdGlvbikuY29uY2F0KHNwYWNlckNvbXBvbmVudCgpLCBjaGlsZHJlbi5zbGljZShuZXdQb3NpdGlvbikpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pKCk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuY2hpbGRyZW4ubWFwKChyZWYpPT5saXN0Tm9kZShyZWYsIG5vZGVSZWYsIDEpKVxyXG4gICAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxpc3RCb3hOb2RlKG5vZGVSZWYsIHBhcmVudFJlZiwgZGVwdGgpIHtcclxuICAgICAgICAgICAgY29uc3Qgbm9kZUlkID0gbm9kZVJlZi5pZFxyXG4gICAgICAgICAgICBjb25zdCBub2RlID0gc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZUlkXVxyXG4gICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge3N0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogc3RhdGUuZHJhZ2dlZENvbXBvbmVudFZpZXcgJiYgc3RhdGUuZHJhZ2dlZENvbXBvbmVudFZpZXcuaWQgPT09IG5vZGVJZCA/ICcwLjUnIDogJzEuMCcsXHJcbiAgICAgICAgICAgICAgICB9fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBub2RlSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcyNnB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nTGVmdDogKGRlcHRoIC0gKG5vZGUuY2hpbGRyZW4ubGVuZ3RoID4gMCB8fCAoc3RhdGUuaG92ZXJlZFZpZXdOb2RlICYmIHN0YXRlLmhvdmVyZWRWaWV3Tm9kZS5wYXJlbnQuaWQgPT09IG5vZGVJZCkgPyAxOiAwKSkgKjIwICsgOCsgJ3B4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdSaWdodDogJzhweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzQ0NCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJUb3A6ICcycHggc29saWQgIzRkNGQ0ZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJCb3R0b206ICcycHggc29saWQgIzMzMycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGl0ZVNwYWNlOiAnbm93cmFwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnIzUzQjJFRCc6ICd3aGl0ZSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb246IHttb3VzZWRvd246IFtWSUVXX0RSQUdHRUQsIG5vZGVSZWYsIHBhcmVudFJlZiwgZGVwdGhdLCB0b3VjaHN0YXJ0OiBbVklFV19EUkFHR0VELCBub2RlUmVmLCBwYXJlbnRSZWYsIGRlcHRoXSwgbW91c2Vtb3ZlOiBbVklFV19IT1ZFUkVELCBub2RlUmVmLCBwYXJlbnRSZWYsIGRlcHRoXSwgdG91Y2htb3ZlOiBbVklFV19IT1ZFUl9NT0JJTEVdfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5jaGlsZHJlbi5sZW5ndGggPiAwIHx8IChzdGF0ZS5ob3ZlcmVkVmlld05vZGUgJiYgc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBhcmVudC5pZCA9PT0gbm9kZUlkKSA/IGgoJ3NwYW4nLCB7c3R5bGU6IHtkaXNwbGF5OiAnaW5saW5lLWZsZXgnfX0sIFthcnJvd0ljb24oc3RhdGUudmlld0ZvbGRlcnNDbG9zZWRbbm9kZUlkXSB8fCAoc3RhdGUuZHJhZ2dlZENvbXBvbmVudFZpZXcgJiYgbm9kZUlkID09PSBzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50Vmlldy5pZCkpXSk6IGgoJ3NwYW4nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtrZXk6IG5vZGVJZCwgc3R5bGU6IHtkaXNwbGF5OiAnaW5saW5lLWZsZXgnLCBjb2xvcjogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJyM1M0IyRUQnOiAnI2JkYmRiZCcsIHRyYW5zaXRpb246ICdjb2xvciAwLjJzJ319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlQm94JyA/IGJveEljb24oKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVJlZi5yZWYgPT09ICd2Tm9kZUxpc3QnID8gbGlzdEljb24oKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmSWNvbigpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQgPT09IG5vZGVJZCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZGl0aW5nTm9kZShub2RlUmVmKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7IHN0eWxlOiB7ZmxleDogJzEnLCBjdXJzb3I6ICdwb2ludGVyJywgdHJhbnNpdGlvbjogJ2NvbG9yIDAuMnMnLCBwYWRkaW5nTGVmdDogJzJweCcsIG92ZXJmbG93OiAnaGlkZGVuJywgd2hpdGVTcGFjZTogJ25vd3JhcCcsIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJ30sIG9uOiB7ZGJsY2xpY2s6IFtFRElUX1ZJRVdfTk9ERV9USVRMRSwgbm9kZUlkXX19LCBub2RlLnRpdGxlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7Y29sb3I6ICcjNTNCMkVEJywgY3Vyc29yOiAncG9pbnRlcicsIGRpc3BsYXk6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICdpbmxpbmUtZmxleCc6ICdub25lJywgZmxleDogJzAgMCBhdXRvJ30sIG9uOiB7Y2xpY2s6IFtERUxFVEVfU0VMRUNURURfVklFVywgbm9kZVJlZiwgcGFyZW50UmVmXX19LCBbZGVsZXRlSWNvbigpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgZGlzcGxheTogc3RhdGUudmlld0ZvbGRlcnNDbG9zZWRbbm9kZUlkXSB8fCAoc3RhdGUuZHJhZ2dlZENvbXBvbmVudFZpZXcgJiYgbm9kZUlkID09PSBzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50Vmlldy5pZCkgPyAnbm9uZSc6ICdibG9jayd9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBzdGF0ZS5ob3ZlcmVkVmlld05vZGUgJiYgc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBhcmVudC5pZCA9PT0gbm9kZUlkICYmICEobm9kZS5jaGlsZHJlbi5maW5kSW5kZXgoKHJlZik9PiByZWYuaWQgPT09IHN0YXRlLmRyYWdnZWRDb21wb25lbnRWaWV3LmlkKSA9PT0gc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBvc2l0aW9uKSA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKCk9PntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGRzIGEgZmFrZSBjb21wb25lbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvbGRQb3NpdGlvbiA9IG5vZGUuY2hpbGRyZW4uZmluZEluZGV4KChyZWYpPT4gcmVmLmlkID09PSBzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50Vmlldy5pZCkgLy8gdGhpcyBpcyBuZWVkZWQgYmVjYXVzZSB3ZSBzdGlsbCBzaG93IHRoZSBvbGQgbm9kZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1Bvc2l0aW9uID0gb2xkUG9zaXRpb24gPT09IC0xIHx8IHN0YXRlLmhvdmVyZWRWaWV3Tm9kZS5wb3NpdGlvbiA8IG9sZFBvc2l0aW9uID8gc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBvc2l0aW9uIDogc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBvc2l0aW9uICsgMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbi5tYXAoKHJlZik9Pmxpc3ROb2RlKHJlZiwgbm9kZVJlZiwgZGVwdGgrMSkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkcmVuLnNsaWNlKDAsIG5ld1Bvc2l0aW9uKS5jb25jYXQoc3BhY2VyQ29tcG9uZW50KCksIGNoaWxkcmVuLnNsaWNlKG5ld1Bvc2l0aW9uKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKCk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLmNoaWxkcmVuLm1hcCgocmVmKT0+bGlzdE5vZGUocmVmLCBub2RlUmVmLCBkZXB0aCsxKSlcclxuICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIHNpbXBsZU5vZGUobm9kZVJlZiwgcGFyZW50UmVmLCBkZXB0aCkge1xyXG4gICAgICAgICAgICBjb25zdCBub2RlSWQgPSBub2RlUmVmLmlkXHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBzdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlSWRdXHJcbiAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5OiBub2RlSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IHN0YXRlLmRyYWdnZWRDb21wb25lbnRWaWV3ICYmIHN0YXRlLmRyYWdnZWRDb21wb25lbnRWaWV3LmlkID09PSBub2RlSWQgPyAnMC41JyA6ICcxLjAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMjZweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdMZWZ0OiBkZXB0aCAqMjAgKyA4ICsncHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nUmlnaHQ6ICc4cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzQ0NCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclRvcDogJzJweCBzb2xpZCAjNGQ0ZDRkJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiAnMnB4IHNvbGlkICMzMzMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGl0ZVNwYWNlOiAnbm93cmFwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJyNiZGJkYmQnLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb246IHttb3VzZWRvd246IFtWSUVXX0RSQUdHRUQsIG5vZGVSZWYsIHBhcmVudFJlZiwgZGVwdGhdLCB0b3VjaHN0YXJ0OiBbVklFV19EUkFHR0VELCBub2RlUmVmLCBwYXJlbnRSZWYsIGRlcHRoXSwgZGJsY2xpY2s6IFtFRElUX1ZJRVdfTk9ERV9USVRMRSwgbm9kZUlkXSwgbW91c2Vtb3ZlOiBbVklFV19IT1ZFUkVELCBub2RlUmVmLCBwYXJlbnRSZWYsIGRlcHRoXSwgdG91Y2htb3ZlOiBbVklFV19IT1ZFUl9NT0JJTEVdfVxyXG4gICAgICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGVSZWYucmVmID09PSAndk5vZGVJbnB1dCcgPyBpbnB1dEljb24oKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHRJY29uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUuZWRpdGluZ1RpdGxlTm9kZUlkID09PSBub2RlSWQgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlZGl0aW5nTm9kZShub2RlUmVmKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJywgY29sb3I6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJ3doaXRlJywgdHJhbnNpdGlvbjogJ2NvbG9yIDAuMnMnLCBwYWRkaW5nTGVmdDogJzJweCcsIG92ZXJmbG93OiAnaGlkZGVuJywgd2hpdGVTcGFjZTogJ25vd3JhcCcsIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJ319LCBub2RlLnRpdGxlKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtjb2xvcjogJyM1M0IyRUQnLCBjdXJzb3I6ICdwb2ludGVyJywgZGlzcGxheTogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJ2lubGluZS1mbGV4JzogJ25vbmUnLCBmbGV4OiAnMCAwIGF1dG8nfSwgb246IHtjbGljazogW0RFTEVURV9TRUxFQ1RFRF9WSUVXLCBub2RlUmVmLCBwYXJlbnRSZWZdfX0sIFtkZWxldGVJY29uKCldKSxcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc3BhY2VyQ29tcG9uZW50KCl7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICBrZXk6ICdzcGFjZXInLFxyXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICc2cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJ2luc2V0IDAgMCAxcHggMXB4ICM1M0IyRUQnLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gZmFrZUNvbXBvbmVudChub2RlUmVmLCBkZXB0aCwpIHtcclxuICAgICAgICAgICAgY29uc3Qgbm9kZUlkID0gbm9kZVJlZi5pZFxyXG4gICAgICAgICAgICBjb25zdCBub2RlID0gc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZUlkXVxyXG4gICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgIGtleTogJ19mYWtlJytub2RlSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICdwYWRkaW5nLWxlZnQgMC4ycycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzI2cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nTGVmdDogKGRlcHRoIC0gKG5vZGUuY2hpbGRyZW4gJiYgbm9kZS5jaGlsZHJlbi5sZW5ndGggPiAwID8gMTogMCkpICoyMCArIDggKydweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdSaWdodDogJzhweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICdyZ2JhKDY4LDY4LDY4LDAuOCknLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJUb3A6ICcycHggc29saWQgIzRkNGQ0ZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTogJzJweCBzb2xpZCAjMzMzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpdGVTcGFjZTogJ25vd3JhcCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnIzUzQjJFRCc6ICcjYmRiZGJkJyxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIChub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlQm94JyB8fCBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlTGlzdCcgfHwgbm9kZVJlZi5yZWYgPT09ICd2Tm9kZUlmJykgJiYgbm9kZS5jaGlsZHJlbi5sZW5ndGggPiAwICA/IGFycm93SWNvbih0cnVlKTogaCgnc3BhbicsIHtrZXk6ICdfZmFrZVNwYW4nK25vZGVJZH0pLFxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGVSZWYucmVmID09PSAndk5vZGVCb3gnID8gYm94SWNvbigpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVJlZi5yZWYgPT09ICd2Tm9kZUxpc3QnID8gbGlzdEljb24oKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlSWYnID8gaWZJY29uKCk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVJlZi5yZWYgPT09ICd2Tm9kZUlucHV0JyA/IGlucHV0SWNvbigpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dEljb24oKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnLCBjb2xvcjogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJyM1M0IyRUQnOiAnd2hpdGUnLCB0cmFuc2l0aW9uOiAnY29sb3IgMC4ycycsIHBhZGRpbmdMZWZ0OiAnMnB4Jywgb3ZlcmZsb3c6ICdoaWRkZW4nLCB3aGl0ZVNwYWNlOiAnbm93cmFwJywgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnfX0sIG5vZGUudGl0bGUpLFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZW5lcmF0ZUVkaXROb2RlQ29tcG9uZW50KCkge1xyXG4gICAgICAgICAgICBjb25zdCBzdHlsZXMgPSBbJ2JhY2tncm91bmQnLCAnYm9yZGVyJywgJ291dGxpbmUnLCAnY3Vyc29yJywgJ2NvbG9yJywgJ2Rpc3BsYXknLCAndG9wJywgJ2JvdHRvbScsICdsZWZ0JywgJ3dpZHRoJywgJ2hlaWdodCcsICdtYXhXaWR0aCcsICdtYXhIZWlnaHQnLCAnbWluV2lkdGgnLCAnbWluSGVpZ2h0JywgJ3JpZ2h0JywgJ3Bvc2l0aW9uJywgJ292ZXJmbG93JywgJ2ZvbnQnLCAnbWFyZ2luJywgJ3BhZGRpbmcnXVxyXG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZE5vZGUgPSBzdGF0ZS5kZWZpbml0aW9uW3N0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmXVtzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkXVxyXG5cclxuICAgICAgICAgICAgY29uc3QgcHJvcHNDb21wb25lbnQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IHN0YXRlLnNlbGVjdGVkVmlld1N1Yk1lbnUgPT09ICdwcm9wcycgPyAnIzRkNGQ0ZCc6ICcjM2QzZDNkJyxcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTBweCAwJyxcclxuICAgICAgICAgICAgICAgICAgICBmbGV4OiAnMScsXHJcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBbU0VMRUNUX1ZJRVdfU1VCTUVOVSwgJ3Byb3BzJ11cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgJ2RhdGEnKVxyXG4gICAgICAgICAgICBjb25zdCBzdHlsZUNvbXBvbmVudCA9IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogc3RhdGUuc2VsZWN0ZWRWaWV3U3ViTWVudSA9PT0gJ3N0eWxlJyA/ICcjNGQ0ZDRkJzogJyMzZDNkM2QnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMHB4IDAnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZsZXg6ICcxJyxcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXJSaWdodDogJzFweCBzb2xpZCAjMjIyJyxcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXJMZWZ0OiAnMXB4IHNvbGlkICMyMjInLFxyXG4gICAgICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICBjbGljazogW1NFTEVDVF9WSUVXX1NVQk1FTlUsICdzdHlsZSddXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sICdzdHlsZScpXHJcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50c0NvbXBvbmVudCA9IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogc3RhdGUuc2VsZWN0ZWRWaWV3U3ViTWVudSA9PT0gJ2V2ZW50cycgPyAnIzRkNGQ0ZCc6ICcjM2QzZDNkJyxcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTBweCAwJyxcclxuICAgICAgICAgICAgICAgICAgICBmbGV4OiAnMScsXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBbU0VMRUNUX1ZJRVdfU1VCTUVOVSwgJ2V2ZW50cyddXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sICdldmVudHMnKVxyXG5cclxuICAgICAgICAgICAgY29uc3QgZ2VucHJvcHNTdWJtZW51Q29tcG9uZW50ID0gKCkgPT4gaCgnZGl2JywgWygoKT0+e1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmID09PSAndk5vZGVCb3gnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW5Ub3A6ICcxMDBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyNiZGJkYmQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LCAnbm8gZGF0YSByZXF1aXJlZCcpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZVRleHQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM2NzY3NjcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc1cHggMTBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMTBweCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJ319LCAndGV4dCB2YWx1ZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzAnLCBjdXJzb3I6ICdkZWZhdWx0JywgY29sb3I6ICcjYmRiZGJkJ319LCAndGV4dCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nOiAnNXB4IDEwcHgnfX0sIFtlbWJlckVkaXRvcihzZWxlY3RlZE5vZGUudmFsdWUsICd0ZXh0JyldKVxyXG4gICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZUlucHV0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM2NzY3NjcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc1cHggMTBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMTBweCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJ319LCAnaW5wdXQgdmFsdWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcwJywgY3Vyc29yOiAnZGVmYXVsdCcsIGNvbG9yOiAnI2JkYmRiZCd9fSwgJ3RleHQnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZzogJzVweCAxMHB4J319LCBbZW1iZXJFZGl0b3Ioc2VsZWN0ZWROb2RlLnZhbHVlLCAndGV4dCcpXSlcclxuICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmID09PSAndk5vZGVMaXN0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM2NzY3NjcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc1cHggMTBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMTBweCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJ319LCAndGFibGUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcwJywgY3Vyc29yOiAnZGVmYXVsdCcsIGNvbG9yOiAnI2JkYmRiZCd9fSwgJ3RhYmxlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmc6ICc1cHggMTBweCd9fSwgW2VtYmVyRWRpdG9yKHNlbGVjdGVkTm9kZS52YWx1ZSwgJ3RhYmxlJyldKVxyXG4gICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZUlmJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM2NzY3NjcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc1cHggMTBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMTBweCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJ319LCAncHJlZGljYXRlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtmbGV4OiAnMCcsIGN1cnNvcjogJ2RlZmF1bHQnLCBjb2xvcjogJyNiZGJkYmQnfX0sICd0cnVlL2ZhbHNlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmc6ICc1cHggMTBweCd9fSwgW2VtYmVyRWRpdG9yKHNlbGVjdGVkTm9kZS52YWx1ZSwgJ2Jvb2xlYW4nKV0pXHJcbiAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkoKV0pXHJcbiAgICAgICAgICAgIGNvbnN0IGdlbnN0eWxlU3VibWVudUNvbXBvbmVudCA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkU3R5bGUgPSBzdGF0ZS5kZWZpbml0aW9uLnN0eWxlW3NlbGVjdGVkTm9kZS5zdHlsZS5pZF1cclxuICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7YXR0cnM6IHtjbGFzczogJ2JldHRlci1zY3JvbGxiYXInfSwgc3R5bGU6IHtvdmVyZmxvdzogJ2F1dG8nfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLHsgc3R5bGU6IHtwYWRkaW5nOiAnMTBweCcsIGZvbnRGYW1pbHk6IFwiJ0NvbWZvcnRhYScsIHNhbnMtc2VyaWZcIiwgIGNvbG9yOiAnI2JkYmRiZCd9fSwgJ3N0eWxlIHBhbmVsIHdpbGwgY2hhbmdlIGEgbG90IGluIDEuMHYsIHJpZ2h0IG5vdyBpdFxcJ3MganVzdCBDU1MnKSxcclxuICAgICAgICAgICAgICAgICAgICAuLi5PYmplY3Qua2V5cyhzZWxlY3RlZFN0eWxlKS5tYXAoKGtleSkgPT4gaCgnZGl2Jywge3N0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM2NzY3NjcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc1cHggMTBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMTBweCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJ319LCBrZXkpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzAnLCBjdXJzb3I6ICdkZWZhdWx0JywgY29sb3I6ICcjYmRiZGJkJ319LCAndGV4dCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nOiAnNXB4IDEwcHgnfX0sIFtlbWJlckVkaXRvcihzZWxlY3RlZFN0eWxlW2tleV0sICd0ZXh0JyldKSxcclxuICAgICAgICAgICAgICAgICAgICBdKSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7IHBhZGRpbmc6ICc1cHggMTBweCcsIGZvbnRGYW1pbHk6IFwiJ0NvbWZvcnRhYScsIHNhbnMtc2VyaWZcIiwgIGNvbG9yOiAnI2JkYmRiZCd9fSwgJ2FkZCBTdHlsZTonKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHsgcGFkZGluZzogJzVweCAwIDVweCAxMHB4J319LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKGtleSkgPT4gIU9iamVjdC5rZXlzKHNlbGVjdGVkU3R5bGUpLmluY2x1ZGVzKGtleSkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAubWFwKChrZXkpID0+IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbjoge2NsaWNrOiBbQUREX0RFRkFVTFRfU1RZTEUsIHNlbGVjdGVkTm9kZS5zdHlsZS5pZCwga2V5XX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJzNweCBzb2xpZCB3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc1cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW5Ub3A6ICc1cHgnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgJysgJyArIGtleSkpXHJcbiAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBnZW5ldmVudHNTdWJtZW51Q29tcG9uZW50ID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IGF2YWlsYWJsZUV2ZW50cyA9IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnb24gY2xpY2snLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWU6ICdjbGljaydcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdkb3VibGUgY2xpY2tlZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZTogJ2RibGNsaWNrJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ21vdXNlIG92ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWU6ICdtb3VzZW92ZXInXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnbW91c2Ugb3V0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lOiAnbW91c2VvdXQnXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZiA9PT0gJ3ZOb2RlSW5wdXQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlRXZlbnRzID0gYXZhaWxhYmxlRXZlbnRzLmNvbmNhdChbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnaW5wdXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lOiAnaW5wdXQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnZm9jdXMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lOiAnZm9jdXMnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnYmx1cicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWU6ICdibHVyJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50RXZlbnRzID0gYXZhaWxhYmxlRXZlbnRzLmZpbHRlcigoZXZlbnQpID0+IHNlbGVjdGVkTm9kZVtldmVudC5wcm9wZXJ0eU5hbWVdKVxyXG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnRzTGVmdCA9IGF2YWlsYWJsZUV2ZW50cy5maWx0ZXIoKGV2ZW50KSA9PiAhc2VsZWN0ZWROb2RlW2V2ZW50LnByb3BlcnR5TmFtZV0pXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ1RvcDogJzIwcHgnfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uKGN1cnJlbnRFdmVudHMubGVuZ3RoID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRFdmVudHMubWFwKChldmVudERlc2MpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBldmVudCA9IHN0YXRlLmRlZmluaXRpb25bc2VsZWN0ZWROb2RlW2V2ZW50RGVzYy5wcm9wZXJ0eU5hbWVdLnJlZl1bc2VsZWN0ZWROb2RlW2V2ZW50RGVzYy5wcm9wZXJ0eU5hbWVdLmlkXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2JhY2tncm91bmQ6ICcjNjc2NzY3JywgcGFkZGluZzogJzVweCAxMHB4J319LCBldmVudC50eXBlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICdjb2xvciAwLjJzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzE0cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc1cHggMTBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZXZlbnQubXV0YXRvcnMubWFwKG11dGF0b3JSZWYgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG11dGF0b3IgPSBzdGF0ZS5kZWZpbml0aW9uW211dGF0b3JSZWYucmVmXVttdXRhdG9yUmVmLmlkXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRlRGVmID0gc3RhdGUuZGVmaW5pdGlvblttdXRhdG9yLnN0YXRlLnJlZl1bbXV0YXRvci5zdGF0ZS5pZF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge3N0eWxlOiB7bWFyZ2luVG9wOiAnMTBweCd9fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAgMCBhdXRvJywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsIHBvc2l0aW9uOiAncmVsYXRpdmUnLCB0cmFuc2Zvcm06ICd0cmFuc2xhdGVaKDApJywgYm94U2hhZG93OiAnaW5zZXQgMCAwIDAgMnB4ICcgKyAoc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gbXV0YXRvci5zdGF0ZS5pZCA/ICcjZWFiNjVjJzogJyM4MjgyODInKSAsIGJhY2tncm91bmQ6ICcjNDQ0JywgcGFkZGluZzogJzRweCA3cHgnLH19LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7Y29sb3I6ICd3aGl0ZScsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snfSwgb246IHtjbGljazogW1NUQVRFX05PREVfU0VMRUNURUQsIG11dGF0b3Iuc3RhdGUuaWRdfX0sIHN0YXRlRGVmLnRpdGxlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVtYmVyRWRpdG9yKG11dGF0b3IubXV0YXRpb24sIHN0YXRlRGVmLnR5cGUpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW10pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHsgcGFkZGluZzogJzVweCAxMHB4JywgZm9udEZhbWlseTogXCInQ29tZm9ydGFhJywgc2Fucy1zZXJpZlwiLCAgY29sb3I6ICcjYmRiZGJkJ319LCAnYWRkIEV2ZW50OicpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCAge3N0eWxlOiB7IHBhZGRpbmc6ICc1cHggMCA1cHggMTBweCd9fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uZXZlbnRzTGVmdC5tYXAoKGV2ZW50KSA9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJzNweCBzb2xpZCAjNWJjYzViJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzVweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW46ICcxMHB4J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBvbjoge2NsaWNrOiBbQUREX0VWRU5ULCBldmVudC5wcm9wZXJ0eU5hbWUsIHN0YXRlLnNlbGVjdGVkVmlld05vZGVdfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICcrICcgKyBldmVudC5kZXNjcmlwdGlvbiksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnN0IGZ1bGxWTm9kZSA9IHN0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmID09PSAndk5vZGVCb3gnIHx8IHN0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmID09PSAndk5vZGVUZXh0JyB8fCBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZiA9PT0gJ3ZOb2RlSW5wdXQnXHJcblxyXG4gICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiAnLTE1cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZSgtMTAwJSwgMCknLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpblJpZ2h0OiAnOHB4JyxcclxuICAgICAgICAgICAgICAgICAgICB0b3A6ICc1MCUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzUwJScsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtmbGV4OiAnMScsIGRpc3BsYXk6ICdmbGV4JywgbWFyZ2luQm90dG9tOiAnMTBweCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBiYWNrZ3JvdW5kOiAnIzRkNGQ0ZCcsIHdpZHRoOiBzdGF0ZS5zdWJFZGl0b3JXaWR0aCArICdweCcsIGJvcmRlcjogJzNweCBzb2xpZCAjMjIyJ319LFtcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtmbGV4OiAnMCAwIGF1dG8nLH19LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAnZGVmYXVsdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjMjIyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdUb3A6ICcycHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0JvdHRvbTogJzVweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyM1M0IyRUQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluV2lkdGg6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCAwIGF1dG8nLCBtYXJnaW46ICcwIDAgMCA1cHgnLCBkaXNwbGF5OiAnaW5saW5lLWZsZXgnfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSAnX3Jvb3ROb2RlJyA/IGFwcEljb24oKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmID09PSAndk5vZGVCb3gnID8gYm94SWNvbigpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmID09PSAndk5vZGVMaXN0JyA/IGxpc3RJY29uKCkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmID09PSAndk5vZGVMaXN0JyA/IGlmSWNvbigpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZUlucHV0JyA/IGlucHV0SWNvbigpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRJY29uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnNSA1IGF1dG8nLCBtYXJnaW46ICcwIDVweCAwIDAnLCBtaW5XaWR0aDogJzAnLCBvdmVyZmxvdzogJ2hpZGRlbicsIHdoaXRlU3BhY2U6ICdub3dyYXAnLCB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcyd9fSwgc2VsZWN0ZWROb2RlLnRpdGxlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCAwIGF1dG8nLCBtYXJnaW5MZWZ0OiAnYXV0bycsIGN1cnNvcjogJ3BvaW50ZXInLCBtYXJnaW5SaWdodDogJzVweCcsIGNvbG9yOiAnd2hpdGUnLCBkaXNwbGF5OiAnaW5saW5lLWZsZXgnfSwgb246IHtjbGljazogW1VOU0VMRUNUX1ZJRVdfTk9ERSwgZmFsc2VdfX0sIFtjbGVhckljb24oKV0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxWTm9kZSA/IGgoJ2RpdicsIHtzdHlsZTogeyBkaXNwbGF5OiAnZmxleCcsIGZsZXg6ICcwIDAgYXV0bycsIGZvbnRGYW1pbHk6IFwiJ0NvbWZvcnRhYScsIHNhbnMtc2VyaWZcIn19LCBbcHJvcHNDb21wb25lbnQsIHN0eWxlQ29tcG9uZW50LCBldmVudHNDb21wb25lbnRdKSA6IGgoJ3NwYW4nKSxcclxuICAgICAgICAgICAgICAgICAgICBkcmFnU3ViQ29tcG9uZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLnNlbGVjdGVkVmlld1N1Yk1lbnUgPT09ICdwcm9wcycgfHwgIWZ1bGxWTm9kZSA/IGdlbnByb3BzU3VibWVudUNvbXBvbmVudCgpOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5zZWxlY3RlZFZpZXdTdWJNZW51ID09PSAnc3R5bGUnID8gZ2Vuc3R5bGVTdWJtZW51Q29tcG9uZW50KCk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5zZWxlY3RlZFZpZXdTdWJNZW51ID09PSAnZXZlbnRzJyA/IGdlbmV2ZW50c1N1Ym1lbnVDb21wb25lbnQoKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywgJ0Vycm9yLCBubyBzdWNoIG1lbnUnKVxyXG4gICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgXSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGFkZFN0YXRlQ29tcG9uZW50ID0gaCgnZGl2Jywge3N0eWxlOiB7IGZsZXg6ICcwIGF1dG8nLCBtYXJnaW5MZWZ0OiBzdGF0ZS5yaWdodE9wZW4gPyAnLTEwcHgnOiAnMCcsIGJvcmRlcjogJzNweCBzb2xpZCAjMjIyJywgYm9yZGVyUmlnaHQ6ICdub25lJywgYmFja2dyb3VuZDogJyMzMzMnLCBoZWlnaHQ6ICc0MHB4JywgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJ319LCBbXHJcbiAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHsgZm9udEZhbWlseTogXCInQ29tZm9ydGFhJywgc2Fucy1zZXJpZlwiLCBmb250U2l6ZTogJzAuOWVtJywgY3Vyc29yOiAncG9pbnRlcicsIHBhZGRpbmc6ICcwIDVweCd9fSwgJ2FkZCBzdGF0ZTogJyksXHJcbiAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtkaXNwbGF5OiAnaW5saW5lLWJsb2NrJ30sIG9uOiB7Y2xpY2s6IFtBRERfU1RBVEUsICdfcm9vdE5hbWVTcGFjZScsICd0ZXh0J119fSwgW3RleHRJY29uKCldKSxcclxuICAgICAgICAgICAgaCgnc3BhbicsIHtvbjoge2NsaWNrOiBbQUREX1NUQVRFLCAnX3Jvb3ROYW1lU3BhY2UnLCAnbnVtYmVyJ119fSwgW251bWJlckljb24oKV0pLFxyXG4gICAgICAgICAgICBoKCdzcGFuJywge29uOiB7Y2xpY2s6IFtBRERfU1RBVEUsICdfcm9vdE5hbWVTcGFjZScsICdib29sZWFuJ119fSwgW2lmSWNvbigpXSksXHJcbiAgICAgICAgICAgIGgoJ3NwYW4nLCB7b246IHtjbGljazogW0FERF9TVEFURSwgJ19yb290TmFtZVNwYWNlJywgJ3RhYmxlJ119fSwgW2xpc3RJY29uKCldKSxcclxuICAgICAgICBdKVxyXG5cclxuXHJcbiAgICAgICAgY29uc3QgYWRkVmlld05vZGVDb21wb25lbnQgPSBoKCdkaXYnLCB7c3R5bGU6IHsgZmxleDogJzAgYXV0bycsIG1hcmdpbkxlZnQ6IHN0YXRlLnJpZ2h0T3BlbiA/ICctMTBweCc6ICcwJywgYm9yZGVyOiAnM3B4IHNvbGlkICMyMjInLCBib3JkZXJSaWdodDogJ25vbmUnLCBiYWNrZ3JvdW5kOiAnIzMzMycsIGhlaWdodDogJzQwcHgnLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInfX0sIFtcclxuICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZTogeyBmb250RmFtaWx5OiBcIidDb21mb3J0YWEnLCBzYW5zLXNlcmlmXCIsIGZvbnRTaXplOiAnMC45ZW0nLCBwYWRkaW5nOiAnMCAxMHB4J319LCAnYWRkIGNvbXBvbmVudDogJyksXHJcbiAgICAgICAgICAgIGgoJ3NwYW4nLCB7b246IHtjbGljazogW0FERF9OT0RFLCBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLCAnYm94J119fSwgW2JveEljb24oKV0pLFxyXG4gICAgICAgICAgICBoKCdzcGFuJywge29uOiB7Y2xpY2s6IFtBRERfTk9ERSwgc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZSwgJ2lucHV0J119fSwgW2lucHV0SWNvbigpXSksXHJcbiAgICAgICAgICAgIGgoJ3NwYW4nLCB7b246IHtjbGljazogW0FERF9OT0RFLCBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLCAndGV4dCddfX0sIFt0ZXh0SWNvbigpXSksXHJcbiAgICAgICAgICAgIGgoJ3NwYW4nLCB7b246IHtjbGljazogW0FERF9OT0RFLCBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLCAnaWYnXX19LCBbaWZJY29uKCldKSxcclxuICAgICAgICBdKVxyXG5cclxuICAgICAgICBjb25zdCB2aWV3Q29tcG9uZW50ID0gaCgnZGl2Jywge2F0dHJzOiB7Y2xhc3M6ICdiZXR0ZXItc2Nyb2xsYmFyJ30sIHN0eWxlOiB7b3ZlcmZsb3c6ICdhdXRvJywgcG9zaXRpb246ICdyZWxhdGl2ZScsIGZsZXg6ICcxJywgZm9udFNpemU6ICcwLjhlbSd9LCBvbjoge2NsaWNrOiBbVU5TRUxFQ1RfVklFV19OT0RFLCB0cnVlXX19LCBbXHJcbiAgICAgICAgICAgIGxpc3ROb2RlKHtyZWY6ICd2Tm9kZUJveCcsIGlkOidfcm9vdE5vZGUnfSwge30sIDApLFxyXG4gICAgICAgIF0pXHJcblxyXG4gICAgICAgIGNvbnN0IHJpZ2h0Q29tcG9uZW50ID1cclxuICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgcmlnaHQ6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgICAgICBmb250OiBcIjMwMCAxLjJlbSAnT3BlbiBTYW5zJ1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6ICcxLjJlbScsXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHN0YXRlLmVkaXRvclJpZ2h0V2lkdGggKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNGQ0ZDRkJyxcclxuICAgICAgICAgICAgICAgICAgICBib3hTaXppbmc6IFwiYm9yZGVyLWJveFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlckxlZnQ6ICczcHggc29saWQgIzIyMicsXHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJzAuNXMgdHJhbnNmb3JtJyxcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm06IHN0YXRlLnJpZ2h0T3BlbiA/ICd0cmFuc2xhdGVaKDApIHRyYW5zbGF0ZVgoMCUpJzogJ3RyYW5zbGF0ZVooMCkgdHJhbnNsYXRlWCgxMDAlKScsXHJcbiAgICAgICAgICAgICAgICAgICAgdXNlclNlbGVjdDogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgZHJhZ0NvbXBvbmVudFJpZ2h0LFxyXG4gICAgICAgICAgICAgICAgYWRkU3RhdGVDb21wb25lbnQsXHJcbiAgICAgICAgICAgICAgICBzdGF0ZUNvbXBvbmVudCxcclxuICAgICAgICAgICAgICAgIGFkZFZpZXdOb2RlQ29tcG9uZW50LFxyXG4gICAgICAgICAgICAgICAgdmlld0NvbXBvbmVudCxcclxuICAgICAgICAgICAgICAgIHN0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmID8gZ2VuZXJhdGVFZGl0Tm9kZUNvbXBvbmVudCgpOiBoKCdzcGFuJylcclxuICAgICAgICAgICAgXSlcclxuXHJcblxyXG4gICAgICAgIGNvbnN0IHRvcENvbXBvbmVudCA9IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgIGZsZXg6ICcxIGF1dG8nLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnNzVweCcsXHJcbiAgICAgICAgICAgICAgICBtYXhIZWlnaHQ6ICc3NXB4JyxcclxuICAgICAgICAgICAgICAgIG1pbkhlaWdodDogJzc1cHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyMyMjInLFxyXG4gICAgICAgICAgICAgICAgZGlzcGxheTonZmxleCcsXHJcbiAgICAgICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICBmb250RmFtaWx5OiBcIidDb21mb3J0YWEnLCBzYW5zLXNlcmlmXCIsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgIGgoJ2EnLCB7c3R5bGU6IHtmbGV4OiAnMCBhdXRvJywgd2lkdGg6ICcxOTBweCcsIHRleHREZWNvcmF0aW9uOiAnaW5oZXJpdCcsIHVzZXJTZWxlY3Q6ICdub25lJ30sIGF0dHJzOiB7aHJlZjonL19kZXYnfX0sIFtcclxuICAgICAgICAgICAgICAgIGgoJ2ltZycse3N0eWxlOiB7IG1hcmdpbjogJzdweCAtMnB4IC0zcHggNXB4JywgZGlzcGxheTogJ2lubGluZS1ibG9jayd9LCBhdHRyczoge3NyYzogJy9pbWFnZXMvbG9nbzI1NngyNTYucG5nJywgaGVpZ2h0OiAnNTcnfX0pLFxyXG4gICAgICAgICAgICAgICAgaCgnc3Bhbicse3N0eWxlOiB7IGZvbnRTaXplOic0NHB4JywgIHZlcnRpY2FsQWxpZ246ICdib3R0b20nLCBjb2xvcjogJyNmZmYnfX0sICd1Z25pcycpXHJcbiAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICAgICAgdG9wOiAnMCcsXHJcbiAgICAgICAgICAgICAgICByaWdodDogJzAnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiJ0NvbWZvcnRhYScsIHNhbnMtc2VyaWZcIixcclxuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTZweCcsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sIFtcclxuICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNDQ0NDQ0JyxcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTVweCAyMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW46ICcxM3B4IDEzcHggMCAwJyxcclxuICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xpY2s6IFtGVUxMX1NDUkVFTl9DTElDS0VELCB0cnVlXVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sICdmdWxsIHNjcmVlbicpLFxyXG4gICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM0NDQ0NDQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxNXB4IDIwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbjogJzEzcHggMTNweCAwIDAnLFxyXG4gICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGljazogUkVTRVRfQVBQX1NUQVRFXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgJ3Jlc2V0IHN0YXRlJyksXHJcbiAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzQ0NDQ0NCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzE1cHggMjBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAnMTNweCAxM3B4IDAgMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsaWNrOiBSRVNFVF9BUFBfREVGSU5JVElPTlxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sICdyZXNldCBkZW1vJylcclxuICAgICAgICAgICAgXSlcclxuICAgICAgICBdKVxyXG4gICAgICAgIGNvbnN0IGxlZnRDb21wb25lbnQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICAgICAgdG9wOiAnMCcsXHJcbiAgICAgICAgICAgICAgICBsZWZ0OiAnMCcsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgZm9udDogXCIzMDAgMS4yZW0gJ09wZW4gU2FucydcIixcclxuICAgICAgICAgICAgICAgIHdpZHRoOiBzdGF0ZS5lZGl0b3JMZWZ0V2lkdGggKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM0ZDRkNGQnLFxyXG4gICAgICAgICAgICAgICAgYm94U2l6aW5nOiBcImJvcmRlci1ib3hcIixcclxuICAgICAgICAgICAgICAgIGJvcmRlclJpZ2h0OiAnM3B4IHNvbGlkICMyMjInLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJzAuNXMgdHJhbnNmb3JtJyxcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogc3RhdGUubGVmdE9wZW4gPyAndHJhbnNsYXRlWigwKSB0cmFuc2xhdGVYKDAlKSc6ICd0cmFuc2xhdGVaKDApIHRyYW5zbGF0ZVgoLTEwMCUpJyxcclxuICAgICAgICAgICAgICAgIHVzZXJTZWxlY3Q6ICdub25lJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgIGRyYWdDb21wb25lbnRMZWZ0LFxyXG4gICAgICAgICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBGUkVFWkVSX0NMSUNLRURcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGZsZXg6ICcwIGF1dG8nLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjMzMzJyxcclxuICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sIFtcclxuICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHsgcGFkZGluZzogJzE1cHggMTVweCAxMHB4IDE1cHgnLCBjb2xvcjogc3RhdGUuYXBwSXNGcm96ZW4gPyAncmdiKDkxLCAyMDQsIDkxKScgOiAncmdiKDIwNCwgOTEsIDkxKSd9fSwgc3RhdGUuYXBwSXNGcm96ZW4gPyAn4pa6JyA6ICfinZrinZonKSxcclxuICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICBhdHRyczoge2NsYXNzOiAnYmV0dGVyLXNjcm9sbGJhcid9LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsZXg6ICcxIGF1dG8nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdzogJ2F1dG8nXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHN0YXRlLmV2ZW50U3RhY2tcclxuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChldmVudERhdGEpPT5zdGF0ZS5kZWZpbml0aW9uLmV2ZW50W2V2ZW50RGF0YS5ldmVudElkXSAhPT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICAgICAgICAgIC5yZXZlcnNlKCkgLy8gbXV0YXRlcyB0aGUgYXJyYXksIGJ1dCBpdCB3YXMgYWxyZWFkeSBjb3BpZWQgd2l0aCBmaWx0ZXJcclxuICAgICAgICAgICAgICAgICAgICAubWFwKChldmVudERhdGEsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gc3RhdGUuZGVmaW5pdGlvbi5ldmVudFtldmVudERhdGEuZXZlbnRJZF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZW1pdHRlciA9IHN0YXRlLmRlZmluaXRpb25bZXZlbnQuZW1pdHRlci5yZWZdW2V2ZW50LmVtaXR0ZXIuaWRdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vIGlkZWEgd2h5IHRoaXMga2V5IHdvcmtzLCBkb24ndCB0b3VjaCBpdCwgcHJvYmFibHkgcmVyZW5kZXJzIG1vcmUgdGhhbiBuZWVkZWQsIGJ1dCB3aG8gY2FyZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtrZXk6IGV2ZW50LmVtaXR0ZXIuaWQgKyBpbmRleCwgc3R5bGU6IHttYXJnaW5Cb3R0b206ICcxMHB4J319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMTBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM0NDQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdUb3A6ICczcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdCb3R0b206ICczcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBldmVudC5lbWl0dGVyLmlkID8gJyM1M0IyRUQnOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICcwLjJzIGFsbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluV2lkdGg6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIG9uOiB7Y2xpY2s6IFtWSUVXX05PREVfU0VMRUNURUQsIGV2ZW50LmVtaXR0ZXJdfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAgMCBhdXRvJywgbWFyZ2luOiAnMCAwIDAgNXB4J319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LmVtaXR0ZXIucmVmID09PSAndk5vZGVCb3gnID8gYm94SWNvbigpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LmVtaXR0ZXIucmVmID09PSAndk5vZGVMaXN0JyA/IGxpc3RJY29uKCkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LmVtaXR0ZXIucmVmID09PSAndk5vZGVMaXN0JyA/IGlmSWNvbigpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuZW1pdHRlci5yZWYgPT09ICd2Tm9kZUlucHV0JyA/IGlucHV0SWNvbigpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRJY29uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICc1IDUgYXV0bycsIG1hcmdpbjogJzAgNXB4IDAgMCcsIG1pbldpZHRoOiAnMCcsIG92ZXJmbG93OiAnaGlkZGVuJywgd2hpdGVTcGFjZTogJ25vd3JhcCcsICB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcyd9fSwgZW1pdHRlci50aXRsZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwIDAgYXV0bycsIGZvbnRGYW1pbHk6IFwiJ0NvbWZvcnRhYScsIHNhbnMtc2VyaWZcIiwgZm9udFNpemU6ICcwLjllbScsIG1hcmdpbkxlZnQ6ICdhdXRvJywgbWFyZ2luUmlnaHQ6ICc1cHgnLCBjb2xvcjogJyM1YmNjNWInfX0sIGV2ZW50LnR5cGUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhldmVudERhdGEubXV0YXRpb25zKS5sZW5ndGggPT09IDAgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZTogeyBwYWRkaW5nOiAnNXB4IDEwcHgnLCBmb250RmFtaWx5OiBcIidDb21mb3J0YWEnLCBzYW5zLXNlcmlmXCIsICBjb2xvcjogJyNiZGJkYmQnfX0sICdub3RoaW5nIGhhcyBjaGFuZ2VkJyk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ0xlZnQ6ICcxMHB4Jywgd2hpdGVTcGFjZTogJ25vd3JhcCd9fSwgT2JqZWN0LmtleXMoZXZlbnREYXRhLm11dGF0aW9ucylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihzdGF0ZUlkID0+IHN0YXRlLmRlZmluaXRpb24uc3RhdGVbc3RhdGVJZF0gIT09IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChzdGF0ZUlkID0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7b246IHtjbGljazogW1NUQVRFX05PREVfU0VMRUNURUQsIHN0YXRlSWRdfSwgc3R5bGU6IHtjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICd3aGl0ZScsIGJveFNoYWRvdzogJ2luc2V0IDAgMCAwIDJweCAnICsgKHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHN0YXRlSWQgPyAnI2VhYjY1Yyc6ICcjODI4MjgyJykgLCBiYWNrZ3JvdW5kOiAnIzQ0NCcsIHBhZGRpbmc6ICcycHggNXB4JywgbWFyZ2luUmlnaHQ6ICc1cHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgdHJhbnNpdGlvbjogJ2FsbCAwLjJzJ319LCBzdGF0ZS5kZWZpbml0aW9uLnN0YXRlW3N0YXRlSWRdLnRpdGxlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7Y29sb3I6ICcjOGU4ZThlJ319LCBldmVudERhdGEucHJldmlvdXNTdGF0ZVtzdGF0ZUlkXS50b1N0cmluZygpICsgJyDigJPigLogJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIGV2ZW50RGF0YS5tdXRhdGlvbnNbc3RhdGVJZF0udG9TdHJpbmcoKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICBdKVxyXG4gICAgICAgIGNvbnN0IHJlbmRlclZpZXdDb21wb25lbnQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBmbGV4OiAnMSBhdXRvJyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IGBcclxuICAgICAgICAgICAgICAgICAgICByYWRpYWwtZ3JhZGllbnQoYmxhY2sgNSUsIHRyYW5zcGFyZW50IDE2JSkgMCAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHJhZGlhbC1ncmFkaWVudChibGFjayA1JSwgdHJhbnNwYXJlbnQgMTYlKSA4cHggOHB4LFxyXG4gICAgICAgICAgICAgICAgICAgIHJhZGlhbC1ncmFkaWVudChyZ2JhKDI1NSwyNTUsMjU1LC4xKSA1JSwgdHJhbnNwYXJlbnQgMjAlKSAwIDFweCxcclxuICAgICAgICAgICAgICAgICAgICByYWRpYWwtZ3JhZGllbnQocmdiYSgyNTUsMjU1LDI1NSwuMSkgNSUsIHRyYW5zcGFyZW50IDIwJSkgOHB4IDlweGAsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6JyMzMzMnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZFNpemU6JzE2cHggMTZweCcsXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OidyZWxhdGl2ZScsXHJcbiAgICAgICAgICAgICAgICBvdmVyZmxvdzogJ2F1dG8nLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sIFtcclxuICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiAoKCk9PntcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRvcE1lbnVIZWlnaHQgPSA3NVxyXG4gICAgICAgICAgICAgICAgY29uc3Qgd2lkdGhMZWZ0ID0gd2luZG93LmlubmVyV2lkdGggLSAoKHN0YXRlLmxlZnRPcGVuID8gc3RhdGUuZWRpdG9yTGVmdFdpZHRoOiAwKSArIChzdGF0ZS5yaWdodE9wZW4gPyBzdGF0ZS5lZGl0b3JSaWdodFdpZHRoIDogMCkpXHJcbiAgICAgICAgICAgICAgICBjb25zdCBoZWlnaHRMZWZ0ID0gd2luZG93LmlubmVySGVpZ2h0IC0gdG9wTWVudUhlaWdodFxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogc3RhdGUuZnVsbFNjcmVlbiA/ICcxMDB2dycgOiB3aWR0aExlZnQgLSA0MCArJ3B4JyxcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHN0YXRlLmZ1bGxTY3JlZW4gPyAnMTAwdmgnIDogaGVpZ2h0TGVmdCAtIDQwICsgJ3B4JyxcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2ZmZmZmZicsXHJcbiAgICAgICAgICAgICAgICAgICAgekluZGV4OiBzdGF0ZS5mdWxsU2NyZWVuID8gJzk5OTk5JyA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICdyZ2JhKDAsIDAsIDAsIDAuMjQ3MDU5KSAwcHggMTRweCA0NXB4LCByZ2JhKDAsIDAsIDAsIDAuMjE5NjA4KSAwcHggMTBweCAxOHB4JyxcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2ZpeGVkJyxcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiBzdGF0ZS5mdWxsU2NyZWVuID8gICdhbGwgMC4zcyc6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICB0b3A6IHN0YXRlLmZ1bGxTY3JlZW4gPyAnMHB4JyA6IDIwICsgNzUgKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IHN0YXRlLmZ1bGxTY3JlZW4gPyAnMHB4JyA6IChzdGF0ZS5sZWZ0T3BlbiA/c3RhdGUuZWRpdG9yTGVmdFdpZHRoIDogMCkgKyAyMCArICdweCcsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKCl9LCBbXHJcbiAgICAgICAgICAgICAgICBzdGF0ZS5mdWxsU2NyZWVuID9cclxuICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7cG9zaXRpb246ICdmaXhlZCcsIHBhZGRpbmc6ICcxMnB4IDEwcHgnLCB0b3A6ICcwJywgcmlnaHQ6ICcyMHB4JywgYm9yZGVyOiAnMnB4IHNvbGlkICMzMzMnLCBib3JkZXJUb3A6ICdub25lJywgYmFja2dyb3VuZDogJyM0NDQnLCBjb2xvcjogJ3doaXRlJywgb3BhY2l0eTogJzAuOCcsIGN1cnNvcjogJ3BvaW50ZXInfSwgb246IHtjbGljazogW0ZVTExfU0NSRUVOX0NMSUNLRUQsIGZhbHNlXX19LCAnZXhpdCBmdWxsIHNjcmVlbicpOlxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nKSxcclxuICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge292ZXJmbG93OiAnYXV0bycsIHdpZHRoOiAnMTAwJScsIGhlaWdodDogJzEwMCUnfX0sIFthcHAudmRvbV0pXHJcbiAgICAgICAgICAgIF0pXHJcbiAgICAgICAgXSlcclxuICAgICAgICBjb25zdCBtYWluUm93Q29tcG9uZW50ID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgZmxleDogJzEnLFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICByZW5kZXJWaWV3Q29tcG9uZW50LFxyXG4gICAgICAgICAgICBsZWZ0Q29tcG9uZW50LFxyXG4gICAgICAgICAgICByaWdodENvbXBvbmVudFxyXG4gICAgICAgIF0pXHJcbiAgICAgICAgY29uc3Qgdm5vZGUgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnZml4ZWQnLFxyXG4gICAgICAgICAgICAgICAgdG9wOiAnMCcsXHJcbiAgICAgICAgICAgICAgICByaWdodDogJzAnLFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6ICcxMDB2dycsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDB2aCcsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICB0b3BDb21wb25lbnQsXHJcbiAgICAgICAgICAgIG1haW5Sb3dDb21wb25lbnQsXHJcbiAgICAgICAgICAgIHN0YXRlLmRyYWdnZWRDb21wb25lbnRWaWV3ID8gaCgnZGl2Jywge3N0eWxlOiB7Zm9udEZhbWlseTogXCJPcGVuIFNhbnNcIiwgcG9pbnRlckV2ZW50czogJ25vbmUnLCBwb3NpdGlvbjogJ2ZpeGVkJywgdG9wOiBzdGF0ZS5tb3VzZVBvc2l0aW9uLnkgKyAncHgnLCBsZWZ0OiBzdGF0ZS5tb3VzZVBvc2l0aW9uLnggKyAncHgnLCBsaW5lSGVpZ2h0OiAnMS4yZW0nLCBmb250U2l6ZTogJzEuMmVtJywgekluZGV4OiAnOTk5OTknLCB3aWR0aDogc3RhdGUuZWRpdG9yUmlnaHRXaWR0aCArICdweCd9fSwgW2goJ2RpdicsIHtzdHlsZToge292ZXJmbG93OiAnYXV0bycsIHBvc2l0aW9uOiAncmVsYXRpdmUnLCBmbGV4OiAnMScsIGZvbnRTaXplOiAnMC44ZW0nfX0sIFtmYWtlQ29tcG9uZW50KHN0YXRlLmRyYWdnZWRDb21wb25lbnRWaWV3LCBzdGF0ZS5ob3ZlcmVkVmlld05vZGUgPyBzdGF0ZS5ob3ZlcmVkVmlld05vZGUuZGVwdGggOiBzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50Vmlldy5kZXB0aCldKV0pOiBoKCdzcGFuJyksXHJcbiAgICAgICAgXSlcclxuXHJcbiAgICAgICAgbm9kZSA9IHBhdGNoKG5vZGUsIHZub2RlKVxyXG4gICAgICAgIGN1cnJlbnRBbmltYXRpb25GcmFtZVJlcXVlc3QgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbmRlcigpXHJcbn0iLCJmdW5jdGlvbiB1cGRhdGVQcm9wcyhvbGRWbm9kZSwgdm5vZGUpIHtcclxuICAgIHZhciBrZXksIGN1ciwgb2xkLCBlbG0gPSB2bm9kZS5lbG0sXHJcbiAgICAgICAgcHJvcHMgPSB2bm9kZS5kYXRhLmxpdmVQcm9wcyB8fCB7fTtcclxuICAgIGZvciAoa2V5IGluIHByb3BzKSB7XHJcbiAgICAgICAgY3VyID0gcHJvcHNba2V5XTtcclxuICAgICAgICBvbGQgPSBlbG1ba2V5XTtcclxuICAgICAgICBpZiAob2xkICE9PSBjdXIpIGVsbVtrZXldID0gY3VyO1xyXG4gICAgfVxyXG59XHJcbmNvbnN0IGxpdmVQcm9wc1BsdWdpbiA9IHtjcmVhdGU6IHVwZGF0ZVByb3BzLCB1cGRhdGU6IHVwZGF0ZVByb3BzfTtcclxuaW1wb3J0IHNuYWJiZG9tIGZyb20gJ3NuYWJiZG9tJ1xyXG5jb25zdCBwYXRjaCA9IHNuYWJiZG9tLmluaXQoW1xyXG4gICAgcmVxdWlyZSgnc25hYmJkb20vbW9kdWxlcy9jbGFzcycpLFxyXG4gICAgcmVxdWlyZSgnc25hYmJkb20vbW9kdWxlcy9wcm9wcycpLFxyXG4gICAgcmVxdWlyZSgnc25hYmJkb20vbW9kdWxlcy9zdHlsZScpLFxyXG4gICAgcmVxdWlyZSgnc25hYmJkb20vbW9kdWxlcy9ldmVudGxpc3RlbmVycycpLFxyXG4gICAgcmVxdWlyZSgnc25hYmJkb20vbW9kdWxlcy9hdHRyaWJ1dGVzJyksXHJcbiAgICBsaXZlUHJvcHNQbHVnaW5cclxuXSk7XHJcbmltcG9ydCBoIGZyb20gJ3NuYWJiZG9tL2gnO1xyXG5pbXBvcnQgYmlnIGZyb20gJ2JpZy5qcyc7XHJcblxyXG5mdW5jdGlvbiBmbGF0dGVuKGFycikge1xyXG4gICAgcmV0dXJuIGFyci5yZWR1Y2UoZnVuY3Rpb24gKGZsYXQsIHRvRmxhdHRlbikge1xyXG4gICAgICAgIHJldHVybiBmbGF0LmNvbmNhdChBcnJheS5pc0FycmF5KHRvRmxhdHRlbikgPyBmbGF0dGVuKHRvRmxhdHRlbikgOiB0b0ZsYXR0ZW4pO1xyXG4gICAgfSwgW10pO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCAoZGVmaW5pdGlvbikgPT4ge1xyXG5cclxuICAgIGxldCBjdXJyZW50U3RhdGUgPSBjcmVhdGVEZWZhdWx0U3RhdGUoKVxyXG5cclxuICAgIC8vIEFsbG93cyBzdG9waW5nIGFwcGxpY2F0aW9uIGluIGRldmVsb3BtZW50LiBUaGlzIGlzIG5vdCBhbiBhcHBsaWNhdGlvbiBzdGF0ZVxyXG4gICAgbGV0IGZyb3plbiA9IGZhbHNlXHJcbiAgICBsZXQgZnJvemVuQ2FsbGJhY2sgPSBudWxsXHJcbiAgICBsZXQgc2VsZWN0SG92ZXJBY3RpdmUgPSBmYWxzZVxyXG4gICAgbGV0IHNlbGVjdGVkTm9kZUluRGV2ZWxvcG1lbnQgPSB7fVxyXG5cclxuICAgIGZ1bmN0aW9uIHNlbGVjdE5vZGVIb3ZlcihyZWYsIGUpIHtcclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgc2VsZWN0ZWROb2RlSW5EZXZlbG9wbWVudCA9IHJlZlxyXG4gICAgICAgIGZyb3plbkNhbGxiYWNrKHJlZilcclxuICAgICAgICByZW5kZXIoKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gc2VsZWN0Tm9kZUNsaWNrKHJlZiwgZSkge1xyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICBzZWxlY3RIb3ZlckFjdGl2ZSA9IGZhbHNlXHJcbiAgICAgICAgc2VsZWN0ZWROb2RlSW5EZXZlbG9wbWVudCA9IHJlZlxyXG4gICAgICAgIGZyb3plbkNhbGxiYWNrKHJlZilcclxuICAgICAgICByZW5kZXIoKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGdsb2JhbCBzdGF0ZSBmb3IgcmVzb2x2ZXJcclxuICAgIGxldCBjdXJyZW50RXZlbnQgPSBudWxsXHJcbiAgICBsZXQgY3VycmVudE1hcFZhbHVlID0ge31cclxuICAgIGxldCBjdXJyZW50TWFwSW5kZXggPSB7fVxyXG4gICAgbGV0IGV2ZW50RGF0YSA9IHt9XHJcbiAgICBmdW5jdGlvbiByZXNvbHZlKHJlZil7XHJcbiAgICAgICAgaWYocmVmID09PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gc3RhdGljIHZhbHVlIChzdHJpbmcvbnVtYmVyKVxyXG4gICAgICAgIGlmKHJlZi5yZWYgPT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHJldHVybiByZWZcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZGVmID0gZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdXHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdwaXBlJykge1xyXG4gICAgICAgICAgICByZXR1cm4gcGlwZShyZWYpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWYucmVmID09PSAnY29uZGl0aW9uYWwnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKGRlZi5wcmVkaWNhdGUpID8gcmVzb2x2ZShkZWYudGhlbikgOiByZXNvbHZlKGRlZi5lbHNlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3N0YXRlJykge1xyXG4gICAgICAgICAgICByZXR1cm4gY3VycmVudFN0YXRlW3JlZi5pZF1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICd2Tm9kZUJveCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGJveE5vZGUocmVmKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3ZOb2RlVGV4dCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRleHROb2RlKHJlZilcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICd2Tm9kZUlucHV0Jykge1xyXG4gICAgICAgICAgICByZXR1cm4gaW5wdXROb2RlKHJlZilcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICd2Tm9kZUxpc3QnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBsaXN0Tm9kZShyZWYpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWYucmVmID09PSAndk5vZGVJZicpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGlmTm9kZShyZWYpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWYucmVmID09PSAnc3R5bGUnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhkZWYpLnJlZHVjZSgoYWNjLCB2YWwpPT4ge1xyXG4gICAgICAgICAgICAgICAgYWNjW3ZhbF0gPSByZXNvbHZlKGRlZlt2YWxdKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjY1xyXG4gICAgICAgICAgICB9LCB7fSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdldmVudERhdGEnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBldmVudERhdGFbcmVmLmlkXVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ2xpc3RWYWx1ZScpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRNYXBWYWx1ZVtkZWYubGlzdC5pZF1bZGVmLnByb3BlcnR5XVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aHJvdyBFcnJvcihyZWYpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdHJhbnNmb3JtVmFsdWUodmFsdWUsIHRyYW5zZm9ybWF0aW9ucyl7XHJcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRyYW5zZm9ybWF0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCByZWYgPSB0cmFuc2Zvcm1hdGlvbnNbaV07XHJcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybWVyID0gZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdXHJcbiAgICAgICAgICAgIGlmIChyZWYucmVmID09PSAnZXF1YWwnKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wYXJlVmFsdWUgPSByZXNvbHZlKHRyYW5zZm9ybWVyLnZhbHVlKVxyXG4gICAgICAgICAgICAgICAgaWYodmFsdWUgaW5zdGFuY2VvZiBiaWcgfHwgY29tcGFyZVZhbHVlIGluc3RhbmNlb2YgYmlnKXtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGJpZyh2YWx1ZSkuZXEoY29tcGFyZVZhbHVlKVxyXG4gICAgICAgICAgICAgICAgfSBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgPT09IGNvbXBhcmVWYWx1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZWYucmVmID09PSAnYWRkJykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBiaWcodmFsdWUpLnBsdXMocmVzb2x2ZSh0cmFuc2Zvcm1lci52YWx1ZSkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdzdWJ0cmFjdCcpIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gYmlnKHZhbHVlKS5taW51cyhyZXNvbHZlKHRyYW5zZm9ybWVyLnZhbHVlKSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ211bHRpcGx5Jykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBiaWcodmFsdWUpLnRpbWVzKHJlc29sdmUodHJhbnNmb3JtZXIudmFsdWUpKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZWYucmVmID09PSAnZGl2aWRlJykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBiaWcodmFsdWUpLmRpdihyZXNvbHZlKHRyYW5zZm9ybWVyLnZhbHVlKSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3JlbWFpbmRlcicpIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gYmlnKHZhbHVlKS5tb2QocmVzb2x2ZSh0cmFuc2Zvcm1lci52YWx1ZSkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdicmFuY2gnKSB7XHJcbiAgICAgICAgICAgICAgICBpZihyZXNvbHZlKHRyYW5zZm9ybWVyLnByZWRpY2F0ZSkpe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdHJhbnNmb3JtVmFsdWUodmFsdWUsIHRyYW5zZm9ybWVyLnRoZW4pXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdHJhbnNmb3JtVmFsdWUodmFsdWUsIHRyYW5zZm9ybWVyLmVsc2UpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdqb2luJykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5jb25jYXQocmVzb2x2ZSh0cmFuc2Zvcm1lci52YWx1ZSkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlZi5yZWYgPT09ICd0b1VwcGVyQ2FzZScpIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9VcHBlckNhc2UoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZWYucmVmID09PSAndG9Mb3dlckNhc2UnKSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3RvVGV4dCcpIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9TdHJpbmcoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwaXBlKHJlZikge1xyXG4gICAgICAgIGNvbnN0IGRlZiA9IGRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXVxyXG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm1WYWx1ZShyZXNvbHZlKGRlZi52YWx1ZSksIGRlZi50cmFuc2Zvcm1hdGlvbnMpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZnJvemVuU2hhZG93ID0gJ2luc2V0IDAgMCAwIDNweCAjMzU5MGRmJ1xyXG5cclxuICAgIGZ1bmN0aW9uIGJveE5vZGUocmVmKSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IGRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXVxyXG4gICAgICAgIGNvbnN0IHN0eWxlID0gcmVzb2x2ZShub2RlLnN0eWxlKVxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSB7XHJcbiAgICAgICAgICAgIHN0eWxlOiBmcm96ZW4gJiYgc2VsZWN0ZWROb2RlSW5EZXZlbG9wbWVudC5pZCA9PT0gcmVmLmlkID8gey4uLnN0eWxlLCB0cmFuc2l0aW9uOidib3gtc2hhZG93IDAuMnMnLCBib3hTaGFkb3c6IHN0eWxlLmJveFNoYWRvdyA/IHN0eWxlLmJveFNoYWRvdyArICcgLCAnICsgZnJvemVuU2hhZG93OiBmcm96ZW5TaGFkb3cgfSA6IHN0eWxlLFxyXG4gICAgICAgICAgICBvbjogZnJvemVuID9cclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZW92ZXI6IHNlbGVjdEhvdmVyQWN0aXZlID8gW3NlbGVjdE5vZGVIb3ZlciwgcmVmXTogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBbc2VsZWN0Tm9kZUNsaWNrLCByZWZdXHJcbiAgICAgICAgICAgICAgICB9OntcclxuICAgICAgICAgICAgICAgICAgICBjbGljazogbm9kZS5jbGljayA/IFtlbWl0RXZlbnQsIG5vZGUuY2xpY2tdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGRibGNsaWNrOiBub2RlLmRibGNsaWNrID8gW2VtaXRFdmVudCwgbm9kZS5kYmxjbGlja10gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VvdmVyOiBub2RlLm1vdXNlb3ZlciA/IFtlbWl0RXZlbnQsIG5vZGUubW91c2VvdmVyXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZW91dDogbm9kZS5tb3VzZW91dCA/IFtlbWl0RXZlbnQsIG5vZGUubW91c2VvdXRdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGgoJ2RpdicsIGRhdGEsIGZsYXR0ZW4obm9kZS5jaGlsZHJlbi5tYXAocmVzb2x2ZSkpKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGlmTm9kZShyZWYpIHtcclxuICAgICAgICBjb25zdCBub2RlID0gZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdXHJcbiAgICAgICAgcmV0dXJuIHJlc29sdmUobm9kZS52YWx1ZSkgPyBub2RlLmNoaWxkcmVuLm1hcChyZXNvbHZlKTogW11cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB0ZXh0Tm9kZShyZWYpIHtcclxuICAgICAgICBjb25zdCBub2RlID0gZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdXHJcbiAgICAgICAgY29uc3Qgc3R5bGUgPSByZXNvbHZlKG5vZGUuc3R5bGUpXHJcbiAgICAgICAgY29uc3QgZGF0YSA9IHtcclxuICAgICAgICAgICAgc3R5bGU6IGZyb3plbiAmJiBzZWxlY3RlZE5vZGVJbkRldmVsb3BtZW50LmlkID09PSByZWYuaWQgPyB7Li4uc3R5bGUsIHRyYW5zaXRpb246J2JveC1zaGFkb3cgMC4ycycsIGJveFNoYWRvdzogc3R5bGUuYm94U2hhZG93ID8gc3R5bGUuYm94U2hhZG93ICsgJyAsICcgKyBmcm96ZW5TaGFkb3c6IGZyb3plblNoYWRvdyB9IDogc3R5bGUsXHJcbiAgICAgICAgICAgIG9uOiBmcm96ZW4gP1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlb3Zlcjogc2VsZWN0SG92ZXJBY3RpdmUgPyBbc2VsZWN0Tm9kZUhvdmVyLCByZWZdOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xpY2s6IFtzZWxlY3ROb2RlQ2xpY2ssIHJlZl1cclxuICAgICAgICAgICAgICAgIH06e1xyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBub2RlLmNsaWNrID8gW2VtaXRFdmVudCwgbm9kZS5jbGlja10gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgZGJsY2xpY2s6IG5vZGUuZGJsY2xpY2sgPyBbZW1pdEV2ZW50LCBub2RlLmRibGNsaWNrXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZW92ZXI6IG5vZGUubW91c2VvdmVyID8gW2VtaXRFdmVudCwgbm9kZS5tb3VzZW92ZXJdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlb3V0OiBub2RlLm1vdXNlb3V0ID8gW2VtaXRFdmVudCwgbm9kZS5tb3VzZW91dF0gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaCgnc3BhbicsIGRhdGEsIHJlc29sdmUobm9kZS52YWx1ZSkpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5wdXROb2RlKHJlZikge1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBkZWZpbml0aW9uW3JlZi5yZWZdW3JlZi5pZF1cclxuICAgICAgICBjb25zdCBzdHlsZSA9IHJlc29sdmUobm9kZS5zdHlsZSlcclxuICAgICAgICBjb25zdCBkYXRhID0ge1xyXG4gICAgICAgICAgICBzdHlsZTogZnJvemVuICYmIHNlbGVjdGVkTm9kZUluRGV2ZWxvcG1lbnQuaWQgPT09IHJlZi5pZCA/IHsuLi5zdHlsZSwgdHJhbnNpdGlvbjonYm94LXNoYWRvdyAwLjJzJywgYm94U2hhZG93OiBzdHlsZS5ib3hTaGFkb3cgPyBzdHlsZS5ib3hTaGFkb3cgKyAnICwgJyArIGZyb3plblNoYWRvdzogZnJvemVuU2hhZG93IH0gOiBzdHlsZSxcclxuICAgICAgICAgICAgb246IGZyb3plbiA/XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VvdmVyOiBzZWxlY3RIb3ZlckFjdGl2ZSA/IFtzZWxlY3ROb2RlSG92ZXIsIHJlZl06IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBjbGljazogW3NlbGVjdE5vZGVDbGljaywgcmVmXVxyXG4gICAgICAgICAgICAgICAgfTp7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xpY2s6IG5vZGUuY2xpY2sgPyBbZW1pdEV2ZW50LCBub2RlLmNsaWNrXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dDogbm9kZS5pbnB1dCA/IFtlbWl0RXZlbnQsIG5vZGUuaW5wdXRdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGRibGNsaWNrOiBub2RlLmRibGNsaWNrID8gW2VtaXRFdmVudCwgbm9kZS5kYmxjbGlja10gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VvdmVyOiBub2RlLm1vdXNlb3ZlciA/IFtlbWl0RXZlbnQsIG5vZGUubW91c2VvdmVyXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZW91dDogbm9kZS5tb3VzZW91dCA/IFtlbWl0RXZlbnQsIG5vZGUubW91c2VvdXRdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvY3VzOiBub2RlLmZvY3VzID8gW2VtaXRFdmVudCwgbm9kZS5mb2N1c10gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgYmx1cjogbm9kZS5ibHVyID8gW2VtaXRFdmVudCwgbm9kZS5ibHVyXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogcmVzb2x2ZShub2RlLnZhbHVlKSxcclxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiBub2RlLnBsYWNlaG9sZGVyXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGgoJ2lucHV0JywgZGF0YSlcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBsaXN0Tm9kZShyZWYpIHtcclxuICAgICAgICBjb25zdCBub2RlID0gZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdXHJcbiAgICAgICAgY29uc3QgbGlzdCA9IHJlc29sdmUobm9kZS52YWx1ZSlcclxuXHJcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBPYmplY3Qua2V5cyhsaXN0KS5tYXAoa2V5PT5saXN0W2tleV0pLm1hcCgodmFsdWUsIGluZGV4KT0+IHtcclxuICAgICAgICAgICAgY3VycmVudE1hcFZhbHVlW3JlZi5pZF0gPSB2YWx1ZVxyXG4gICAgICAgICAgICBjdXJyZW50TWFwSW5kZXhbcmVmLmlkXSA9IGluZGV4XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbm9kZS5jaGlsZHJlbi5tYXAocmVzb2x2ZSlcclxuICAgICAgICB9KVxyXG4gICAgICAgIGRlbGV0ZSBjdXJyZW50TWFwVmFsdWVbcmVmLmlkXTtcclxuICAgICAgICBkZWxldGUgY3VycmVudE1hcEluZGV4W3JlZi5pZF07XHJcblxyXG4gICAgICAgIHJldHVybiBjaGlsZHJlblxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGxpc3RlbmVycyA9IFtdXHJcblxyXG4gICAgZnVuY3Rpb24gYWRkTGlzdGVuZXIoY2FsbGJhY2spIHtcclxuICAgICAgICBjb25zdCBsZW5ndGggPSBsaXN0ZW5lcnMucHVzaChjYWxsYmFjaylcclxuXHJcbiAgICAgICAgLy8gZm9yIHVuc3Vic2NyaWJpbmdcclxuICAgICAgICByZXR1cm4gKCkgPT4gbGlzdGVuZXJzLnNwbGljZShsZW5ndGggLSAxLCAxKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGVtaXRFdmVudChldmVudFJlZiwgZSkge1xyXG4gICAgICAgIGNvbnN0IGV2ZW50SWQgPSBldmVudFJlZi5pZFxyXG4gICAgICAgIGNvbnN0IGV2ZW50ID0gZGVmaW5pdGlvbi5ldmVudFtldmVudElkXVxyXG4gICAgICAgIGN1cnJlbnRFdmVudCA9IGVcclxuICAgICAgICBldmVudC5kYXRhLmZvckVhY2goKHJlZik9PntcclxuICAgICAgICAgICAgaWYocmVmLmlkID09PSAnX2lucHV0Jyl7XHJcbiAgICAgICAgICAgICAgICBldmVudERhdGFbcmVmLmlkXSA9IGUudGFyZ2V0LnZhbHVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIGNvbnN0IHByZXZpb3VzU3RhdGUgPSBjdXJyZW50U3RhdGVcclxuICAgICAgICBsZXQgbXV0YXRpb25zID0ge31cclxuICAgICAgICBkZWZpbml0aW9uLmV2ZW50W2V2ZW50SWRdLm11dGF0b3JzLmZvckVhY2goKHJlZik9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG11dGF0b3IgPSBkZWZpbml0aW9uLm11dGF0b3JbcmVmLmlkXVxyXG4gICAgICAgICAgICBjb25zdCBzdGF0ZSA9IG11dGF0b3Iuc3RhdGVcclxuICAgICAgICAgICAgbXV0YXRpb25zW3N0YXRlLmlkXSA9IHJlc29sdmUobXV0YXRvci5tdXRhdGlvbilcclxuICAgICAgICB9KVxyXG4gICAgICAgIGN1cnJlbnRTdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIGN1cnJlbnRTdGF0ZSwgbXV0YXRpb25zKVxyXG4gICAgICAgIGxpc3RlbmVycy5mb3JFYWNoKGNhbGxiYWNrID0+IGNhbGxiYWNrKGV2ZW50SWQsIGV2ZW50RGF0YSwgZSwgcHJldmlvdXNTdGF0ZSwgY3VycmVudFN0YXRlLCBtdXRhdGlvbnMpKVxyXG4gICAgICAgIGN1cnJlbnRFdmVudCA9IHt9XHJcbiAgICAgICAgZXZlbnREYXRhID0ge31cclxuICAgICAgICBpZihPYmplY3Qua2V5cyhtdXRhdGlvbnMpLmxlbmd0aCl7XHJcbiAgICAgICAgICAgIHJlbmRlcigpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxldCB2ZG9tID0gcmVzb2x2ZSh7cmVmOid2Tm9kZUJveCcsIGlkOidfcm9vdE5vZGUnfSlcclxuICAgIGZ1bmN0aW9uIHJlbmRlcihuZXdEZWZpbml0aW9uKSB7XHJcbiAgICAgICAgaWYobmV3RGVmaW5pdGlvbil7XHJcbiAgICAgICAgICAgIGlmKGRlZmluaXRpb24uc3RhdGUgIT09IG5ld0RlZmluaXRpb24uc3RhdGUpe1xyXG4gICAgICAgICAgICAgICAgZGVmaW5pdGlvbiA9IG5ld0RlZmluaXRpb25cclxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1N0YXRlID0gT2JqZWN0LmtleXMoZGVmaW5pdGlvbi5zdGF0ZSkubWFwKGtleT0+ZGVmaW5pdGlvbi5zdGF0ZVtrZXldKS5yZWR1Y2UoKGFjYywgZGVmKT0+IHtcclxuICAgICAgICAgICAgICAgICAgICBhY2NbZGVmLnJlZl0gPSBkZWYuZGVmYXVsdFZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFjY1xyXG4gICAgICAgICAgICAgICAgfSwge30pXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50U3RhdGUgPSB7Li4ubmV3U3RhdGUsIC4uLmN1cnJlbnRTdGF0ZX1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGRlZmluaXRpb24gPSBuZXdEZWZpbml0aW9uXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbmV3dmRvbSA9IHJlc29sdmUoe3JlZjondk5vZGVCb3gnLCBpZDonX3Jvb3ROb2RlJ30pXHJcbiAgICAgICAgcGF0Y2godmRvbSwgbmV3dmRvbSlcclxuICAgICAgICB2ZG9tID0gbmV3dmRvbVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIF9mcmVlemUoaXNGcm96ZW4sIGNhbGxiYWNrLCBub2RlSWQpIHtcclxuICAgICAgICBmcm96ZW5DYWxsYmFjayA9IGNhbGxiYWNrXHJcbiAgICAgICAgc2VsZWN0ZWROb2RlSW5EZXZlbG9wbWVudCA9IG5vZGVJZFxyXG4gICAgICAgIGlmKGZyb3plbiA9PT0gZmFsc2UgJiYgaXNGcm96ZW4gPT09IHRydWUpe1xyXG4gICAgICAgICAgICBzZWxlY3RIb3ZlckFjdGl2ZSA9IHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoZnJvemVuIHx8IGZyb3plbiAhPT0gaXNGcm96ZW4pe1xyXG4gICAgICAgICAgICBmcm96ZW4gPSBpc0Zyb3plblxyXG4gICAgICAgICAgICByZW5kZXIoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50U3RhdGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRTdGF0ZVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNldEN1cnJlbnRTdGF0ZShuZXdTdGF0ZSkge1xyXG4gICAgICAgIGN1cnJlbnRTdGF0ZSA9IG5ld1N0YXRlXHJcbiAgICAgICAgcmVuZGVyKClcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVEZWZhdWx0U3RhdGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGRlZmluaXRpb24uc3RhdGUpLm1hcChrZXk9PmRlZmluaXRpb24uc3RhdGVba2V5XSkucmVkdWNlKChhY2MsIGRlZik9PiB7XHJcbiAgICAgICAgICAgIGFjY1tkZWYucmVmXSA9IGRlZi5kZWZhdWx0VmFsdWVcclxuICAgICAgICAgICAgcmV0dXJuIGFjY1xyXG4gICAgICAgIH0sIHt9KVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZGVmaW5pdGlvbixcclxuICAgICAgICB2ZG9tLFxyXG4gICAgICAgIGdldEN1cnJlbnRTdGF0ZSxcclxuICAgICAgICBzZXRDdXJyZW50U3RhdGUsXHJcbiAgICAgICAgcmVuZGVyLFxyXG4gICAgICAgIGVtaXRFdmVudCxcclxuICAgICAgICBhZGRMaXN0ZW5lcixcclxuICAgICAgICBfZnJlZXplLFxyXG4gICAgICAgIF9yZXNvbHZlOiByZXNvbHZlLFxyXG4gICAgICAgIGNyZWF0ZURlZmF1bHRTdGF0ZVxyXG4gICAgfVxyXG59IiwibW9kdWxlLmV4cG9ydHM9e1xyXG4gIFwiZXZlbnREYXRhXCI6IHtcclxuICAgIFwiX2lucHV0XCI6IHtcclxuICAgICAgXCJ0aXRsZVwiOiBcImlucHV0IHZhbHVlXCIsXHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIlxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCJ0b0xvd2VyQ2FzZVwiOiB7fSxcclxuICBcInRvVXBwZXJDYXNlXCI6IHt9LFxyXG4gIFwiY29uZGl0aW9uYWxcIjoge30sXHJcbiAgXCJlcXVhbFwiOiB7XHJcbiAgICBcImE3MjUxYWYwLTUwYTctNDgyMy04NWEwLTY2Y2UwOWQ4YTNjY1wiOiB7XHJcbiAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJlZTI0MjNlNi01YjQ4LTQxYWUtOGNjZi02YTJjN2I0NmQyZjhcIlxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICBcIm5vdFwiOiB7fSxcclxuICBcImxpc3RcIjoge30sXHJcbiAgXCJ0b1RleHRcIjoge1xyXG4gICAgXCI3YnM5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge31cclxuICB9LFxyXG4gIFwibGlzdFZhbHVlXCI6IHtcclxuICAgIFwicHo3aGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwibnVtYmVyXCIsXHJcbiAgICAgIFwibGlzdFwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZUxpc3RcIixcclxuICAgICAgICBcImlkXCI6IFwiZmw4OWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCJcclxuICAgICAgfSxcclxuICAgICAgXCJwcm9wZXJ0eVwiOiBcInhcIlxyXG4gICAgfSxcclxuICAgIFwiaGo5d2Q2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwibnVtYmVyXCIsXHJcbiAgICAgIFwibGlzdFwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZUxpc3RcIixcclxuICAgICAgICBcImlkXCI6IFwiZmw4OWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCJcclxuICAgICAgfSxcclxuICAgICAgXCJwcm9wZXJ0eVwiOiBcInlcIlxyXG4gICAgfSxcclxuICAgIFwiaGhyOGI2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcImxpc3RcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwidk5vZGVMaXN0XCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImZsODlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwicHJvcGVydHlcIjogXCJjb2xvclwiXHJcbiAgICB9XHJcbiAgfSxcclxuICBcInBpcGVcIjoge1xyXG4gICAgXCJmdzhqZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCJOdW1iZXIgY3VycmVudGx5IGlzOiBcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwicmVmXCI6IFwiam9pblwiLFxyXG4gICAgICAgICAgXCJpZFwiOiBcInA5czNkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgXCJ1bTVlZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwic3RhdGVcIixcclxuICAgICAgICBcImlkXCI6IFwiNDZ2ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfSxcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwicmVmXCI6IFwidG9UZXh0XCIsXHJcbiAgICAgICAgICBcImlkXCI6IFwiN2JzOWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICBcInVpOGpkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIitcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcImM4d2VkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIi1cIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcInBkcTZkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcIm51bWJlclwiLFxyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInN0YXRlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjQ2dmRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcImFkZFwiLFxyXG4gICAgICAgICAgXCJpZFwiOiBcInc4NmZkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgXCI0NTJxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJudW1iZXJcIixcclxuICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJzdGF0ZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgXCJyZWZcIjogXCJzdWJ0cmFjdFwiLFxyXG4gICAgICAgICAgXCJpZFwiOiBcInU0M3dkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgXCJldzgzZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJudW1iZXJcIixcclxuICAgICAgXCJ2YWx1ZVwiOiAxLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwidzNlOWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwibnVtYmVyXCIsXHJcbiAgICAgIFwidmFsdWVcIjogMSxcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcIjNxa2lkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiAwLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgXCJyZWZcIjogXCJhZGRcIixcclxuICAgICAgICAgIFwiaWRcIjogXCJ3YnI3ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgXCJyZWZcIjogXCJ0b1RleHRcIixcclxuICAgICAgICAgIFwiaWRcIjogXCJub29wXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwicmVmXCI6IFwiam9pblwiLFxyXG4gICAgICAgICAgXCJpZFwiOiBcInMyNThkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgXCJ0N3ZxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogMCxcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwicmVmXCI6IFwiYWRkXCIsXHJcbiAgICAgICAgICBcImlkXCI6IFwidnE4ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwicmVmXCI6IFwidG9UZXh0XCIsXHJcbiAgICAgICAgICBcImlkXCI6IFwibm9vcFwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcImpvaW5cIixcclxuICAgICAgICAgIFwiaWRcIjogXCJ3ZjlhZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIFwiN2RidmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcImxpc3RWYWx1ZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJoajl3ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiOGQ0dmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcImxpc3RWYWx1ZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJwejdoZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiOGNxNmI2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcImxpc3RWYWx1ZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJoaHI4YjZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiZjlxeGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGFibGVcIixcclxuICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJzdGF0ZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJjOHE5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwicXd3OWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwicHhcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcInFkdzdjNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcInB4XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCI4NDM2OWFiYS00YTRkLTQ5MzItOGE5YS04ZjljYTk0OGI2YTJcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCJUaGUgbnVtYmVyIGlzIGV2ZW4g8J+OiVwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiYzJmYjlhOWItMjViYi00ZThiLTgwYzAtY2Y1MWI4NTA2MDcwXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwiYm9vbGVhblwiLFxyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInN0YXRlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjQ2dmRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcInJlbWFpbmRlclwiLFxyXG4gICAgICAgICAgXCJpZFwiOiBcIjM0NzgwZDIyLWY1MjEtNGMzMC04OWE1LTNlN2Y1YjVhZjdjMlwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcImVxdWFsXCIsXHJcbiAgICAgICAgICBcImlkXCI6IFwiYTcyNTFhZjAtNTBhNy00ODIzLTg1YTAtNjZjZTA5ZDhhM2NjXCJcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICBcIjEyMjlkNDc4LWJjMjUtNDQwMS04YTg5LTc0ZmM2Y2ZlODk5NlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcIm51bWJlclwiLFxyXG4gICAgICBcInZhbHVlXCI6IDIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJlZTI0MjNlNi01YjQ4LTQxYWUtOGNjZi02YTJjN2I0NmQyZjhcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJudW1iZXJcIixcclxuICAgICAgXCJ2YWx1ZVwiOiAwLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiOTQ1ZjA4MTgtNzc0My00ZWRkLThjNzYtM2RkNWE4YmE3ZmE5XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiXFwnQ29tZm9ydGFhXFwnLCBjdXJzaXZlXCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJhNjA4OTllZS05OTI1LTRlMDUtODkwZS1iOTQyOGIwMmRiZjlcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCIjZjVmNWY1XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCIxZTQ2NTQwMy01MzgyLTRhNDUtODlkYS04ZDg4ZTJlYjJmYjlcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCIxMDAlXCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJlZjJlYzE4NC0xOTlmLTRlZTgtOGUzMC1iOTlkYmMxZGY1ZGJcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCIxMHB4XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJmYWIyODZjNC1kZWQzLTRhNWUtODc0OS03Njc4YWJjYmIxMjVcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCIxMHB4IDVweFwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiNzAzZjhlMDItYzVjMy00ZDI3LThjYTItNzIyYzRkMGQxZWEwXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiMTBweCAxNXB4XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCI4ZjNjNjYzMC1kOGQ5LTRiYzEtOGEzZC1iYTRkYWQzMDkxZjBcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCIjYWFhYWFhXCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJkMzFjNDc0Ni0yMzI5LTQ0MDQtODY4OS1mYmYyMzkzZWZkNDRcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCJpbmxpbmUtYmxvY2tcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcIjQxNjg1YWRjLTM3OTMtNDU2Ni04ZjYxLTJjMmE0MmZkZjg2ZVwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIjVweFwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiZDU3NTRmZGItNDY4OS00Zjg3LTg3ZmMtNTFkNjAwMjJiMzJjXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiM3B4XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCIwYmM2YTE4Yy0xNzY2LTQyYmQtOGI0YS0yMDJhMmIwYzM0ZmVcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCJwb2ludGVyXCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCI5YjI1MGVmOC1jMWJlLTQ3MDYtOGE3MS1mNDQ0ZjE4ZjBmODJcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCJub25lXCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJiMGExMDQ5Ny1lYzI2LTRmZjctODczOS1hMTkzNzU1Y2JjYWVcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCIxMHB4IDVweFwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiODc2NGUyNTgtNTk5ZC00MjUyLTgxMTItZDA2ZmNkMGQ1ZTJhXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiMTBweCAxNXB4XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCI4Y2FhZjg3Ni0xMGJjLTQ3ZGUtODlkOS04NjljODkyY2Q0Y2VcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCIjOTk5OTk5XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJhZTk4N2JiYS03MzRhLTQ2YWUtOGM4Mi1jMDQ4OTYyMjExNzlcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCJpbmxpbmUtYmxvY2tcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcImYwMDkwZjhkLTg3YjQtNGQ4My04YTUzLTAzOWIyMWUyYjU5NFwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIjVweFwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiYjdjNzkxYTYtMmM5MS00YjYyLTg4MjAtZGJhYWY5ZDVjMTc5XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiM3B4XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJkNzk1YTUxMC1jY2Y5LTRkOTItODFlZS01ZTUxMmI4MWVlNThcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCJwb2ludGVyXCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCI3NTE4NTI0YS0wYmMyLTQ2NWMtODE0ZS0wYTVkMzlkZTI1ZTNcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCIxMHB4IDVweFwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiYjI0YjFjMTgtOGE4Mi00YzhmLTgxODAtNmQwNjJjNzhjOWQ5XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwibm9uZVwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiNjdmNzBkOTctYTM0Ni00MmU0LTgzM2YtNmVhZWFlZWQ0ZmVmXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiMTBweCAxMHB4IDEwcHggMFwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiOTgyNTc0NjEtOTI4ZS00ZmY5LThhYzUtMGI4OTI5OGU0ZWYxXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiMTBweCAxMHB4IDEwcHggMFwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiOTkzMWZlNmEtMDc0ZS00Y2I3LTgzNTUtYzE4ZDgxODY3OWE3XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiMTBweFwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiNzJiNTU5ZTktMjU0Ni00YmFlLThhNjEtNTU1NTY3MzYzYjExXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwicmlnaHRcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcIjMwZjhjNzAxLTdhZGYtNDM5OC04NjJlLTU1MzcyZTI5YzE0ZFwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIjUwcHhcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcIjY2MzVkYmIyLWIzNjQtNGVmZC04MDYxLTI2NDMyMDA3ZWIxYVwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcInJpZ2h0XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCIwNDJjY2Y3ZC04MTliLTRmYWMtODI4Mi0yZjE5MDY5YjUzODZcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCI1MDBweFwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiZTdiYzZlMjAtMTUxMC00YmFjLTg1OWYtMDRlYzNkY2RhNjZiXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiMS41XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJlZjhkYzljNi1mMzMzLTRiNjEtOGQyNS1kMzZhZmU1MTc1MjBcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCIxMHB4XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCI3NTVhNzBhMi1kMTgxLTRmYWYtODU5My01YWI3NjAxMTU4ZjlcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCJibG9ja1wiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiOWY1MDFjMzUtNTRiMy00YzYwLThmYzQtZDZhNDVlNzc2ZWIzXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiMTBweFwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiZThhY2M2YjAtZDFkZS00NDNiLTgxMjgtZGY2YjUxODZmNzBjXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiYmxvY2tcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcIjcxNzY0MzYyLWUwOWEtNDQxMi04ZmJjLWVkM2NiNGQ0Yzk1NFwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIjEwcHhcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcImMxOTliMTkxLTg4ZDItNDYzZC04NTY0LTFjZTFhMTYzMWIyZFwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcImJsb2NrXCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJiMjExN2U2Yi1hY2U3LTRlNzUtOGU3ZC0zMjM2NjhkMWIxOWRcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCIxMHB4XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCI4YTUzODQ4ZC04YzdkLTQ0ZGMtOGQxMy1hZTA2MDEwN2M4MGJcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCJibG9ja1wiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiMTkwNmI1YjQtNjAyNC00OGYxLTg0ZGEtYzMzMmU1NTVhZmIzXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiMTBweFwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiYTU2NTY5NmQtOGE2MC00MTZlLTg0NGEtNjBjOGYyZmU4YzVhXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiYmxvY2tcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcIjE1ZDQ3YjA3LTM5NmMtNGMwMy04NTkxLWY0NzI1OThmMTVlMlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIjEwcHhcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcImE4ZjVjMWNlLTc4M2ItNDYyNi04MjZhLTQ3M2FiNDM0YzBiMlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIjEwcHhcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH1cclxuICB9LFxyXG4gIFwiam9pblwiOiB7XHJcbiAgICBcInA5czNkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJ1bTVlZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJ3ZjlhZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwicXd3OWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiczI1OGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcInFkdzdjNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIFwiYWRkXCI6IHtcclxuICAgIFwidzg2ZmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImV3ODNkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcIndicjdkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI4ZDR2ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJ2cThkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiN2RidmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCJzdWJ0cmFjdFwiOiB7XHJcbiAgICBcInU0M3dkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJ3M2U5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICBcInJlbWFpbmRlclwiOiB7XHJcbiAgICBcIjM0NzgwZDIyLWY1MjEtNGMzMC04OWE1LTNlN2Y1YjVhZjdjMlwiOiB7XHJcbiAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCIxMjI5ZDQ3OC1iYzI1LTQ0MDEtOGE4OS03NGZjNmNmZTg5OTZcIlxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICBcInZOb2RlQm94XCI6IHtcclxuICAgIFwiX3Jvb3ROb2RlXCI6IHtcclxuICAgICAgXCJ0aXRsZVwiOiBcImFwcFwiLFxyXG4gICAgICBcInN0eWxlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInN0eWxlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIl9yb290U3R5bGVcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImNoaWxkcmVuXCI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcInZOb2RlVGV4dFwiLFxyXG4gICAgICAgICAgXCJpZFwiOiBcIjI0NzFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcInZOb2RlVGV4dFwiLFxyXG4gICAgICAgICAgXCJpZFwiOiBcIjE0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcInZOb2RlVGV4dFwiLFxyXG4gICAgICAgICAgXCJpZFwiOiBcIjM0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcInZOb2RlSWZcIixcclxuICAgICAgICAgIFwiaWRcIjogXCI1Nzg3YzE1YS00MjZiLTQxZWItODMxZC1lM2UwNzQxNTk1ODJcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZUxpc3RcIixcclxuICAgICAgICAgIFwiaWRcIjogXCJmbDg5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjVcIlxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIFwiZ3c5ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0aXRsZVwiOiBcImJveFwiLFxyXG4gICAgICBcInN0eWxlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInN0eWxlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImZxOWRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiY2hpbGRyZW5cIjogW11cclxuICAgIH1cclxuICB9LFxyXG4gIFwidk5vZGVUZXh0XCI6IHtcclxuICAgIFwiMjQ3MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCI6IHtcclxuICAgICAgXCJ0aXRsZVwiOiBcIk51bWJlciBjdXJyZW50bHlcIixcclxuICAgICAgXCJzdHlsZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJzdHlsZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI4NDgxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiZnc4amQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiMTQ4MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCI6IHtcclxuICAgICAgXCJ0aXRsZVwiOiBcIisgYnV0dG9uXCIsXHJcbiAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJ1aThqZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInN0eWxlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInN0eWxlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjk0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiY2xpY2tcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwiZXZlbnRcIixcclxuICAgICAgICBcImlkXCI6IFwiZDQ4cmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiMzQ4MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCI6IHtcclxuICAgICAgXCJ0aXRsZVwiOiBcIi0gYnV0dG9uXCIsXHJcbiAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJjOHdlZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInN0eWxlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInN0eWxlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjc0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiY2xpY2tcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwiZXZlbnRcIixcclxuICAgICAgICBcImlkXCI6IFwiM2E1NGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiZThhZGQxYzctOGEwMS00MTY0LTg2MDQtNzIyZDhhYjUyOWYxXCI6IHtcclxuICAgICAgXCJ0aXRsZVwiOiBcImlzIGV2ZW5cIixcclxuICAgICAgXCJzdHlsZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJzdHlsZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI0ZGNhNzNiMy05MGViLTQxZTctODY1MS0yYmRjYzkzZjM4NzFcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiODQzNjlhYmEtNGE0ZC00OTMyLThhOWEtOGY5Y2E5NDhiNmEyXCJcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCJ2Tm9kZUlucHV0XCI6IHt9LFxyXG4gIFwidk5vZGVMaXN0XCI6IHtcclxuICAgIFwiZmw4OWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCI6IHtcclxuICAgICAgXCJ0aXRsZVwiOiBcImxpc3Qgb2YgYm94ZXNcIixcclxuICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImY5cXhkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiY2hpbGRyZW5cIjogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwicmVmXCI6IFwidk5vZGVCb3hcIixcclxuICAgICAgICAgIFwiaWRcIjogXCJndzlkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCJ2Tm9kZUlmXCI6IHtcclxuICAgIFwiNTc4N2MxNWEtNDI2Yi00MWViLTgzMWQtZTNlMDc0MTU5NTgyXCI6IHtcclxuICAgICAgXCJ0aXRsZVwiOiBcImlzIG51bWJlciBldmVuXCIsXHJcbiAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJjMmZiOWE5Yi0yNWJiLTRlOGItODBjMC1jZjUxYjg1MDYwNzBcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImNoaWxkcmVuXCI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcInZOb2RlVGV4dFwiLFxyXG4gICAgICAgICAgXCJpZFwiOiBcImU4YWRkMWM3LThhMDEtNDE2NC04NjA0LTcyMmQ4YWI1MjlmMVwiXHJcbiAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9XHJcbiAgfSxcclxuICBcInN0eWxlXCI6IHtcclxuICAgIFwiX3Jvb3RTdHlsZVwiOiB7XHJcbiAgICAgIFwiZm9udEZhbWlseVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjk0NWYwODE4LTc3NDMtNGVkZC04Yzc2LTNkZDVhOGJhN2ZhOVwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiYmFja2dyb3VuZFwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImE2MDg5OWVlLTk5MjUtNGUwNS04OTBlLWI5NDI4YjAyZGJmOVwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwibWluSGVpZ2h0XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiMWU0NjU0MDMtNTM4Mi00YTQ1LTg5ZGEtOGQ4OGUyZWIyZmI5XCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiODQ4MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJwYWRkaW5nXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiZWYyZWMxODQtMTk5Zi00ZWU4LThlMzAtYjk5ZGJjMWRmNWRiXCJcclxuICAgICAgfSxcclxuICAgICAgXCJtYXJnaW5cIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJmYWIyODZjNC1kZWQzLTRhNWUtODc0OS03Njc4YWJjYmIxMjVcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCI5NDgxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInBhZGRpbmdcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI3MDNmOGUwMi1jNWMzLTRkMjctOGNhMi03MjJjNGQwZDFlYTBcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImJhY2tncm91bmRcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI4ZjNjNjYzMC1kOGQ5LTRiYzEtOGEzZC1iYTRkYWQzMDkxZjBcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImRpc3BsYXlcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJkMzFjNDc0Ni0yMzI5LTQ0MDQtODY4OS1mYmYyMzkzZWZkNDRcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImJvcmRlclJhZGl1c1wiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImQ1NzU0ZmRiLTQ2ODktNGY4Ny04N2ZjLTUxZDYwMDIyYjMyY1wiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiY3Vyc29yXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiMGJjNmExOGMtMTc2Ni00MmJkLThiNGEtMjAyYTJiMGMzNGZlXCJcclxuICAgICAgfSxcclxuICAgICAgXCJ1c2VyU2VsZWN0XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiOWIyNTBlZjgtYzFiZS00NzA2LThhNzEtZjQ0NGYxOGYwZjgyXCJcclxuICAgICAgfSxcclxuICAgICAgXCJtYXJnaW5cIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJiMGExMDQ5Ny1lYzI2LTRmZjctODczOS1hMTkzNzU1Y2JjYWVcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCI3NDgxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInBhZGRpbmdcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI4NzY0ZTI1OC01OTlkLTQyNTItODExMi1kMDZmY2QwZDVlMmFcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImJhY2tncm91bmRcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI4Y2FhZjg3Ni0xMGJjLTQ3ZGUtODlkOS04NjljODkyY2Q0Y2VcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImRpc3BsYXlcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJhZTk4N2JiYS03MzRhLTQ2YWUtOGM4Mi1jMDQ4OTYyMjExNzlcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImJvcmRlclJhZGl1c1wiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImI3Yzc5MWE2LTJjOTEtNGI2Mi04ODIwLWRiYWFmOWQ1YzE3OVwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiY3Vyc29yXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiZDc5NWE1MTAtY2NmOS00ZDkyLTgxZWUtNWU1MTJiODFlZTU4XCJcclxuICAgICAgfSxcclxuICAgICAgXCJtYXJnaW5cIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI3NTE4NTI0YS0wYmMyLTQ2NWMtODE0ZS0wYTVkMzlkZTI1ZTNcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCI4MDkyYWM1ZS1kZmQwLTQ0OTItYTY1ZC04YWMzZWVjMzI1ZTBcIjoge1xyXG4gICAgICBcInBhZGRpbmdcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI2N2Y3MGQ5Ny1hMzQ2LTQyZTQtODMzZi02ZWFlYWVlZDRmZWZcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJhOTQ2MWUyOC03ZDkyLTQ5YTAtOTAwMS0yM2Q3NGU0YjM4MmRcIjoge1xyXG4gICAgICBcInBhZGRpbmdcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI5ODI1NzQ2MS05MjhlLTRmZjktOGFjNS0wYjg5Mjk4ZTRlZjFcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCI3NjZiMTFlYy1kYTI3LTQ5NGMtYjI3Mi1jMjZmZWMzZjY0NzVcIjoge1xyXG4gICAgICBcInBhZGRpbmdcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI5OTMxZmU2YS0wNzRlLTRjYjctODM1NS1jMThkODE4Njc5YTdcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImZsb2F0XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiNzJiNTU5ZTktMjU0Ni00YmFlLThhNjEtNTU1NTY3MzYzYjExXCJcclxuICAgICAgfSxcclxuICAgICAgXCJ0ZXh0QWxpZ25cIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI2NjM1ZGJiMi1iMzY0LTRlZmQtODA2MS0yNjQzMjAwN2ViMWFcIlxyXG4gICAgICB9LFxyXG4gICAgICBcIm1heFdpZHRoXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiMDQyY2NmN2QtODE5Yi00ZmFjLTgyODItMmYxOTA2OWI1Mzg2XCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiY2JjZDhlZGItNGFhMi00M2ZlLWFkMzktY2VlNzliNDkwMjk1XCI6IHtcclxuICAgICAgXCJwYWRkaW5nXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiZWY4ZGM5YzYtZjMzMy00YjYxLThkMjUtZDM2YWZlNTE3NTIwXCJcclxuICAgICAgfSxcclxuICAgICAgXCJkaXNwbGF5XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiNzU1YTcwYTItZDE4MS00ZmFmLTg1OTMtNWFiNzYwMTE1OGY5XCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiNjc2M2YxMDItMjNmNy00MzkwLWI0NjMtNGUxYjE0ZTg2NmM5XCI6IHtcclxuICAgICAgXCJwYWRkaW5nXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiOWY1MDFjMzUtNTRiMy00YzYwLThmYzQtZDZhNDVlNzc2ZWIzXCJcclxuICAgICAgfSxcclxuICAgICAgXCJkaXNwbGF5XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiZThhY2M2YjAtZDFkZS00NDNiLTgxMjgtZGY2YjUxODZmNzBjXCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiOTFjOWFkZjAtZDYyZS00NTgwLTkzZTctZjM5NTk0YWU1ZTdkXCI6IHtcclxuICAgICAgXCJwYWRkaW5nXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiNzE3NjQzNjItZTA5YS00NDEyLThmYmMtZWQzY2I0ZDRjOTU0XCJcclxuICAgICAgfSxcclxuICAgICAgXCJkaXNwbGF5XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiYzE5OWIxOTEtODhkMi00NjNkLTg1NjQtMWNlMWExNjMxYjJkXCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiZTlmYmViMzktNzE5My00NTIyLTkxYjMtNzYxYmQzNTYzOWQzXCI6IHtcclxuICAgICAgXCJwYWRkaW5nXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiYjIxMTdlNmItYWNlNy00ZTc1LThlN2QtMzIzNjY4ZDFiMTlkXCJcclxuICAgICAgfSxcclxuICAgICAgXCJkaXNwbGF5XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiOGE1Mzg0OGQtOGM3ZC00NGRjLThkMTMtYWUwNjAxMDdjODBiXCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiM2NmNWQ4OWQtMzcwMy00ODNlLWFiNjQtNWE1Yjc4MGFlYzI3XCI6IHtcclxuICAgICAgXCJwYWRkaW5nXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiMTkwNmI1YjQtNjAyNC00OGYxLTg0ZGEtYzMzMmU1NTVhZmIzXCJcclxuICAgICAgfSxcclxuICAgICAgXCJkaXNwbGF5XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiYTU2NTY5NmQtOGE2MC00MTZlLTg0NGEtNjBjOGYyZmU4YzVhXCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiZnE5ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJwYWRkaW5nXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiMTVkNDdiMDctMzk2Yy00YzAzLTg1OTEtZjQ3MjU5OGYxNWUyXCJcclxuICAgICAgfSxcclxuICAgICAgXCJ3aWR0aFwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjNxa2lkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiaGVpZ2h0XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwidDd2cWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfSxcclxuICAgICAgXCJiYWNrZ3JvdW5kXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiOGNxNmI2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiNGRjYTczYjMtOTBlYi00MWU3LTg2NTEtMmJkY2M5M2YzODcxXCI6IHtcclxuICAgICAgXCJwYWRkaW5nXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiYThmNWMxY2UtNzgzYi00NjI2LTgyNmEtNDczYWI0MzRjMGIyXCJcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCJuYW1lU3BhY2VcIjoge1xyXG4gICAgXCJfcm9vdE5hbWVTcGFjZVwiOiB7XHJcbiAgICAgIFwidGl0bGVcIjogXCJzdGF0ZVwiLFxyXG4gICAgICBcImNoaWxkcmVuXCI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcInN0YXRlXCIsXHJcbiAgICAgICAgICBcImlkXCI6IFwiNDZ2ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwicmVmXCI6IFwic3RhdGVcIixcclxuICAgICAgICAgIFwiaWRcIjogXCJjOHE5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCJzdGF0ZVwiOiB7XHJcbiAgICBcIjQ2dmRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidGl0bGVcIjogXCJudW1iZXJcIixcclxuICAgICAgXCJyZWZcIjogXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIixcclxuICAgICAgXCJ0eXBlXCI6IFwibnVtYmVyXCIsXHJcbiAgICAgIFwiZGVmYXVsdFZhbHVlXCI6IDAsXHJcbiAgICAgIFwibXV0YXRvcnNcIjogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwicmVmXCI6IFwibXV0YXRvclwiLFxyXG4gICAgICAgICAgXCJpZFwiOiBcImFzNTVkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcIm11dGF0b3JcIixcclxuICAgICAgICAgIFwiaWRcIjogXCI5ZHE4ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIFwiYzhxOWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0aXRsZVwiOiBcInRpbGVzXCIsXHJcbiAgICAgIFwicmVmXCI6IFwiYzhxOWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCIsXHJcbiAgICAgIFwidHlwZVwiOiBcInRhYmxlXCIsXHJcbiAgICAgIFwiZGVmaW5pdGlvblwiOiB7XHJcbiAgICAgICAgXCJ4XCI6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgXCJ5XCI6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgXCJjb2xvclwiOiBcInRleHRcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImRlZmF1bHRWYWx1ZVwiOiB7XHJcbiAgICAgICAgXCJvcHM2ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgXCJ4XCI6IDEyMCxcclxuICAgICAgICAgIFwieVwiOiAxMDAsXHJcbiAgICAgICAgICBcImNvbG9yXCI6IFwiI2VhYjY1Y1wiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIndwdjVkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICBcInhcIjogMjAwLFxyXG4gICAgICAgICAgXCJ5XCI6IDEyMCxcclxuICAgICAgICAgIFwiY29sb3JcIjogXCIjNTNCMkVEXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwicW4yN2Q2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgIFwieFwiOiAxMzAsXHJcbiAgICAgICAgICBcInlcIjogMjAwLFxyXG4gICAgICAgICAgXCJjb2xvclwiOiBcIiM1YmNjNWJcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJjYTlyZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgXCJ4XCI6IDE1MCxcclxuICAgICAgICAgIFwieVwiOiAxNTAsXHJcbiAgICAgICAgICBcImNvbG9yXCI6IFwiIzRkNGQ0ZFwiXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBcIm11dGF0b3JzXCI6IFtdXHJcbiAgICB9XHJcbiAgfSxcclxuICBcIm11dGF0b3JcIjoge1xyXG4gICAgXCJhczU1ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcImV2ZW50XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcImV2ZW50XCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImQ0OHJkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwic3RhdGVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwic3RhdGVcIixcclxuICAgICAgICBcImlkXCI6IFwiNDZ2ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfSxcclxuICAgICAgXCJtdXRhdGlvblwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcInBkcTZkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcIjlkcThkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwiZXZlbnRcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwiZXZlbnRcIixcclxuICAgICAgICBcImlkXCI6IFwiM2E1NGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfSxcclxuICAgICAgXCJzdGF0ZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJzdGF0ZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9LFxyXG4gICAgICBcIm11dGF0aW9uXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiNDUycWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCJldmVudFwiOiB7XHJcbiAgICBcImQ0OHJkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcImNsaWNrXCIsXHJcbiAgICAgIFwibXV0YXRvcnNcIjogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwicmVmXCI6IFwibXV0YXRvclwiLFxyXG4gICAgICAgICAgXCJpZFwiOiBcImFzNTVkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgfVxyXG4gICAgICBdLFxyXG4gICAgICBcImVtaXR0ZXJcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwidk5vZGVUZXh0XCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjE0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiZGF0YVwiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiM2E1NGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwiY2xpY2tcIixcclxuICAgICAgXCJtdXRhdG9yc1wiOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgXCJyZWZcIjogXCJtdXRhdG9yXCIsXHJcbiAgICAgICAgICBcImlkXCI6IFwiOWRxOGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICB9XHJcbiAgICAgIF0sXHJcbiAgICAgIFwiZW1pdHRlclwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZVRleHRcIixcclxuICAgICAgICBcImlkXCI6IFwiMzQ4MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCJcclxuICAgICAgfSxcclxuICAgICAgXCJkYXRhXCI6IFtdXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiJdfQ==
