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
if(widthName!=='subEditorWidth'&&widthName!=='subEditorWidth'&&((widthName==='editorLeftWidth'?state.leftOpen:state.rightOpen)?newWidth<180:newWidth>180)){if(widthName==='editorLeftWidth'){return setState(_extends({},state,{leftOpen:!state.leftOpen}));}return setState(_extends({},state,{rightOpen:!state.rightOpen}));}if(newWidth<250){newWidth=250;}setState(_extends({},state,_defineProperty({},widthName,newWidth)));return false;}window.addEventListener('mousemove',resize);window.addEventListener('touchmove',resize);function stopDragging(e){e.preventDefault();window.removeEventListener('mousemove',resize);window.removeEventListener('touchmove',resize);window.removeEventListener('mouseup',stopDragging);window.removeEventListener('touchend',stopDragging);return false;}window.addEventListener('mouseup',stopDragging);window.addEventListener('touchend',stopDragging);return false;}function STATE_DRAGGED(stateId,e){e.preventDefault();var initialX=e.touches?e.touches[0].pageX:e.pageX;var initialY=e.touches?e.touches[0].pageY:e.pageY;var position=this.elm.getBoundingClientRect();var offsetX=initialX-position.left;var offsetY=initialY-position.top;function drag(e){e.preventDefault();var x=e.touches?e.touches[0].pageX:e.pageX;var y=e.touches?e.touches[0].pageY:e.pageY;if(!state.draggedComponentView){if(Math.abs(initialY-y)>3){setState(_extends({},state,{draggedComponentStateId:stateId,mousePosition:{x:x-offsetX,y:y-offsetY}}));}}else{setState(_extends({},state,{mousePosition:{x:x-offsetX,y:y-offsetY}}));}return false;}window.addEventListener('mousemove',drag);window.addEventListener('touchmove',drag);function stopDragging(event){var _extends12,_extends13;event.preventDefault();window.removeEventListener('mousemove',drag);window.removeEventListener('touchmove',drag);window.removeEventListener('mouseup',stopDragging);window.removeEventListener('touchend',stopDragging);if(!state.draggedComponentStateId){return STATE_NODE_SELECTED(stateId);}if(!state.hoveredPipe){return setState(_extends({},state,{draggedComponentStateId:null,hoveredPipe:null}));}var joinIdState=uuid();var joinIdText=uuid();var pipeIdState=uuid();var pipeIdText=uuid();setState(_extends({},state,{draggedComponentStateId:null,hoveredPipe:null,definition:_extends({},state.definition,{pipe:_extends({},state.definition.pipe,(_extends12={},_defineProperty(_extends12,state.hoveredPipe.id,_extends({},state.definition.pipe[state.hoveredPipe.id],{transformations:[{ref:'join',id:joinIdState},{ref:'join',id:joinIdText}].concat(state.definition.pipe[state.hoveredPipe.id].transformations)})),_defineProperty(_extends12,pipeIdState,{type:'text',value:{ref:'state',id:state.draggedComponentStateId},transformations:[{ref:'toText',id:'noop'}]}),_defineProperty(_extends12,pipeIdText,{type:'text',value:'',transformations:[]}),_extends12)),join:_extends({},state.definition.join,(_extends13={},_defineProperty(_extends13,joinIdState,{value:{ref:'pipe',id:pipeIdState}}),_defineProperty(_extends13,joinIdText,{value:{ref:'pipe',id:pipeIdText}}),_extends13))})}));}window.addEventListener('mouseup',stopDragging);window.addEventListener('touchend',stopDragging);}function OPEN_SIDEBAR(side){if(side==='left'){return setState(_extends({},state,{leftOpen:!state.leftOpen}));}if(side==='right'){return setState(_extends({},state,{rightOpen:!state.rightOpen}));}}function FREEZER_CLICKED(){setState(_extends({},state,{appIsFrozen:!state.appIsFrozen}));}function VIEW_FOLDER_CLICKED(nodeId,forcedValue){setState(_extends({},state,{viewFoldersClosed:_extends({},state.viewFoldersClosed,_defineProperty({},nodeId,forcedValue!==undefined?forcedValue:!state.viewFoldersClosed[nodeId]))}));}function VIEW_NODE_SELECTED(ref){setState(_extends({},state,{selectedViewNode:ref}));}function UNSELECT_VIEW_NODE(selfOnly,e){e.stopPropagation();if(selfOnly&&e.target!==this.elm){return;}setState(_extends({},state,{selectedViewNode:{}}));}function STATE_NODE_SELECTED(nodeId){setState(_extends({},state,{selectedStateNodeId:nodeId}));}function UNSELECT_STATE_NODE(e){if(e.target===this.elm){setState(_extends({},state,{selectedStateNodeId:''}));}}function ADD_NODE(nodeRef,type){if(!nodeRef.ref||!state.definition[nodeRef.ref][nodeRef.id]||!state.definition[nodeRef.ref][nodeRef.id].children){if(state.selectedViewNode.id&&state.selectedViewNode.id!=='_rootNode'){nodeRef=state.definition[state.selectedViewNode.ref][state.selectedViewNode.id].parent;}else{nodeRef={ref:'vNodeBox',id:'_rootNode'};}}var nodeId=nodeRef.id;var newNodeId=uuid();var newStyleId=uuid();var newStyle={};if(type==='box'){var _extends15,_extends20;var newNode={title:'box',parent:nodeRef,style:{ref:'style',id:newStyleId},children:[]};return setState(_extends({},state,{selectedViewNode:{ref:'vNodeBox',id:newNodeId},definition:nodeRef.ref==='vNodeBox'?_extends({},state.definition,{vNodeBox:_extends({},state.definition.vNodeBox,(_extends15={},_defineProperty(_extends15,nodeId,_extends({},state.definition.vNodeBox[nodeId],{children:state.definition.vNodeBox[nodeId].children.concat({ref:'vNodeBox',id:newNodeId})})),_defineProperty(_extends15,newNodeId,newNode),_extends15)),style:_extends({},state.definition.style,_defineProperty({},newStyleId,newStyle))}):_extends({},state.definition,(_extends20={},_defineProperty(_extends20,nodeRef.ref,_extends({},state.definition[nodeRef.ref],_defineProperty({},nodeId,_extends({},state.definition[nodeRef.ref][nodeId],{children:state.definition[nodeRef.ref][nodeId].children.concat({ref:'vNodeBox',id:newNodeId})})))),_defineProperty(_extends20,"vNodeBox",_extends({},state.definition.vNodeBox,_defineProperty({},newNodeId,newNode))),_defineProperty(_extends20,"style",_extends({},state.definition.style,_defineProperty({},newStyleId,newStyle))),_extends20))}));}if(type==='text'){var _extends25;var pipeId=uuid();var _newNode={title:'text',parent:nodeRef,style:{ref:'style',id:newStyleId},value:{ref:'pipe',id:pipeId}};var newPipe={type:'text',value:'Default Text',transformations:[]};return setState(_extends({},state,{selectedViewNode:{ref:'vNodeText',id:newNodeId},definition:_extends({},state.definition,(_extends25={pipe:_extends({},state.definition.pipe,_defineProperty({},pipeId,newPipe))},_defineProperty(_extends25,nodeRef.ref,_extends({},state.definition[nodeRef.ref],_defineProperty({},nodeId,_extends({},state.definition[nodeRef.ref][nodeId],{children:state.definition[nodeRef.ref][nodeId].children.concat({ref:'vNodeText',id:newNodeId})})))),_defineProperty(_extends25,"vNodeText",_extends({},state.definition.vNodeText,_defineProperty({},newNodeId,_newNode))),_defineProperty(_extends25,"style",_extends({},state.definition.style,_defineProperty({},newStyleId,newStyle))),_extends25))}));}if(type==='image'){var _extends30;var _pipeId=uuid();var _newNode2={title:'image',parent:nodeRef,style:{ref:'style',id:newStyleId},src:{ref:'pipe',id:_pipeId}};var _newPipe={type:'text',value:'https://www.ugnis.com/images/logo256x256.png',transformations:[]};return setState(_extends({},state,{selectedViewNode:{ref:'vNodeImage',id:newNodeId},definition:_extends({},state.definition,(_extends30={pipe:_extends({},state.definition.pipe,_defineProperty({},_pipeId,_newPipe))},_defineProperty(_extends30,nodeRef.ref,_extends({},state.definition[nodeRef.ref],_defineProperty({},nodeId,_extends({},state.definition[nodeRef.ref][nodeId],{children:state.definition[nodeRef.ref][nodeId].children.concat({ref:'vNodeImage',id:newNodeId})})))),_defineProperty(_extends30,"vNodeImage",_extends({},state.definition.vNodeImage,_defineProperty({},newNodeId,_newNode2))),_defineProperty(_extends30,"style",_extends({},state.definition.style,_defineProperty({},newStyleId,newStyle))),_extends30))}));}if(type==='if'){var _extends32,_extends36;var _pipeId2=uuid();var _newNode3={title:'conditional',parent:nodeRef,value:{ref:'pipe',id:_pipeId2},children:[]};var _newPipe2={type:'boolean',value:true,transformations:[]};return setState(_extends({},state,{selectedViewNode:{ref:'vNodeIf',id:newNodeId},definition:nodeRef.ref==='vNodeIf'?_extends({},state.definition,{pipe:_extends({},state.definition.pipe,_defineProperty({},_pipeId2,_newPipe2)),vNodeIf:_extends({},state.definition.vNodeIf,(_extends32={},_defineProperty(_extends32,nodeId,_extends({},state.definition.vNodeIf[nodeId],{children:state.definition.vNodeIf[nodeId].children.concat({ref:'vNodeIf',id:newNodeId})})),_defineProperty(_extends32,newNodeId,_newNode3),_extends32))}):_extends({},state.definition,(_extends36={pipe:_extends({},state.definition.pipe,_defineProperty({},_pipeId2,_newPipe2))},_defineProperty(_extends36,nodeRef.ref,_extends({},state.definition[nodeRef.ref],_defineProperty({},nodeId,_extends({},state.definition[nodeRef.ref][nodeId],{children:state.definition[nodeRef.ref][nodeId].children.concat({ref:'vNodeIf',id:newNodeId})})))),_defineProperty(_extends36,"vNodeIf",_extends({},state.definition.vNodeIf,_defineProperty({},newNodeId,_newNode3))),_extends36))}));}if(type==='input'){var _extends37,_extends45;var stateId=uuid();var eventId=uuid();var mutatorId=uuid();var pipeInputId=uuid();var pipeMutatorId=uuid();var _newNode4={title:'input',parent:nodeRef,style:{ref:'style',id:newStyleId},value:{ref:'pipe',id:pipeInputId},input:{ref:'event',id:eventId}};var newPipeInput={type:'text',value:{ref:'state',id:stateId},transformations:[]};var newPipeMutator={type:'text',value:{ref:'eventData',id:'_input'},transformations:[]};var newState={title:'input value',type:'text',ref:stateId,defaultValue:'Default text',mutators:[{ref:'mutator',id:mutatorId}]};var newMutator={event:{ref:'event',id:eventId},state:{ref:'state',id:stateId},mutation:{ref:'pipe',id:pipeMutatorId}};var newEvent={type:'input',title:'update input',mutators:[{ref:'mutator',id:mutatorId}],emitter:{ref:'vNodeInput',id:newNodeId},data:[{ref:'eventData',id:'_input'}]};return setState(_extends({},state,{selectedViewNode:{ref:'vNodeInput',id:newNodeId},definition:_extends({},state.definition,(_extends45={pipe:_extends({},state.definition.pipe,(_extends37={},_defineProperty(_extends37,pipeInputId,newPipeInput),_defineProperty(_extends37,pipeMutatorId,newPipeMutator),_extends37))},_defineProperty(_extends45,nodeRef.ref,_extends({},state.definition[nodeRef.ref],_defineProperty({},nodeId,_extends({},state.definition[nodeRef.ref][nodeId],{children:state.definition[nodeRef.ref][nodeId].children.concat({ref:'vNodeInput',id:newNodeId})})))),_defineProperty(_extends45,"vNodeInput",_extends({},state.definition.vNodeInput,_defineProperty({},newNodeId,_newNode4))),_defineProperty(_extends45,"style",_extends({},state.definition.style,_defineProperty({},newStyleId,newStyle))),_defineProperty(_extends45,"nameSpace",_extends({},state.definition.nameSpace,_defineProperty({},'_rootNameSpace',_extends({},state.definition.nameSpace['_rootNameSpace'],{children:state.definition.nameSpace['_rootNameSpace'].children.concat({ref:'state',id:stateId})})))),_defineProperty(_extends45,"state",_extends({},state.definition.state,_defineProperty({},stateId,newState))),_defineProperty(_extends45,"mutator",_extends({},state.definition.mutator,_defineProperty({},mutatorId,newMutator))),_defineProperty(_extends45,"event",_extends({},state.definition.event,_defineProperty({},eventId,newEvent))),_extends45))}));}}function ADD_STATE(namespaceId,type){var newStateId=uuid();var newState=void 0;if(type==='text'){newState={title:'new text',ref:newStateId,type:'text',defaultValue:'Default text',mutators:[]};}if(type==='number'){newState={title:'new number',ref:newStateId,type:'number',defaultValue:0,mutators:[]};}if(type==='boolean'){newState={title:'new boolean',type:'boolean',ref:newStateId,defaultValue:true,mutators:[]};}if(type==='table'){newState={title:'new table',type:'table',ref:newStateId,defaultValue:{},mutators:[]};}if(type==='folder'){var _extends46;newState={title:'new folder',children:[]};return setState(_extends({},state,{definition:_extends({},state.definition,{nameSpace:_extends({},state.definition.nameSpace,(_extends46={},_defineProperty(_extends46,namespaceId,_extends({},state.definition.nameSpace[namespaceId],{children:state.definition.nameSpace[namespaceId].children.concat({ref:'nameSpace',id:newStateId})})),_defineProperty(_extends46,newStateId,newState),_extends46))})}));}setState(_extends({},state,{definition:_extends({},state.definition,{nameSpace:_extends({},state.definition.nameSpace,_defineProperty({},namespaceId,_extends({},state.definition.nameSpace[namespaceId],{children:state.definition.nameSpace[namespaceId].children.concat({ref:'state',id:newStateId})}))),state:_extends({},state.definition.state,_defineProperty({},newStateId,newState))})}));}function ADD_DEFAULT_STYLE(styleId,key){var pipeId=uuid();var defaults={'background':'white','border':'1px solid black','outline':'1px solid black','cursor':'pointer','color':'black','display':'block','top':'0px','bottom':'0px','left':'0px','right':'0px','flex':'1 1 auto','justifyContent':'center','alignItems':'center','maxWidth':'100%','maxHeight':'100%','minWidth':'100%','minHeight':'100%','position':'absolute','overflow':'auto','height':'500px','width':'500px','font':'italic 2em "Comic Sans MS", cursive, sans-serif','margin':'10px','padding':'10px'};setState(_extends({},state,{definition:_extends({},state.definition,{pipe:_extends({},state.definition.pipe,_defineProperty({},pipeId,{type:'text',value:defaults[key],transformations:[]})),style:_extends({},state.definition.style,_defineProperty({},styleId,_extends({},state.definition.style[styleId],_defineProperty({},key,{ref:'pipe',id:pipeId}))))})}));}function SELECT_VIEW_SUBMENU(newId){setState(_extends({},state,{selectedViewSubMenu:newId}));}function EDIT_VIEW_NODE_TITLE(nodeId){setState(_extends({},state,{editingTitleNodeId:nodeId}));}function DELETE_SELECTED_VIEW(nodeRef,parentRef){if(nodeRef.id==='_rootNode'){if(state.definition.vNodeBox['_rootNode'].children.length===0){return;}// immutably remove all nodes except rootNode
return setState(_extends({},state,{definition:_extends({},state.definition,{vNodeBox:{'_rootNode':_extends({},state.definition.vNodeBox['_rootNode'],{children:[]})}}),selectedViewNode:{}}));}setState(_extends({},state,{definition:_extends({},state.definition,_defineProperty({},parentRef.ref,_extends({},state.definition[parentRef.ref],_defineProperty({},parentRef.id,_extends({},state.definition[parentRef.ref][parentRef.id],{children:state.definition[parentRef.ref][parentRef.id].children.filter(function(ref){return ref.id!==nodeRef.id;})}))))),selectedViewNode:{}}));}function CHANGE_VIEW_NODE_TITLE(nodeRef,e){e.preventDefault();var nodeId=nodeRef.id;var nodeType=nodeRef.ref;setState(_extends({},state,{definition:_extends({},state.definition,_defineProperty({},nodeType,_extends({},state.definition[nodeType],_defineProperty({},nodeId,_extends({},state.definition[nodeType][nodeId],{title:e.target.value})))))}));}function CHANGE_STATE_NODE_TITLE(nodeId,e){e.preventDefault();setState(_extends({},state,{definition:_extends({},state.definition,{state:_extends({},state.definition.state,_defineProperty({},nodeId,_extends({},state.definition.state[nodeId],{title:e.target.value})))})}));}function CHANGE_NAMESPACE_TITLE(nodeId,e){e.preventDefault();setState(_extends({},state,{definition:_extends({},state.definition,{nameSpace:_extends({},state.definition.nameSpace,_defineProperty({},nodeId,_extends({},state.definition.nameSpace[nodeId],{title:e.target.value})))})}));}function CHANGE_CURRENT_STATE_TEXT_VALUE(stateId,e){app.setCurrentState(_extends({},app.getCurrentState(),_defineProperty({},stateId,e.target.value)));render();}function CHANGE_CURRENT_STATE_NUMBER_VALUE(stateId,e){// todo big throws error instead of returning NaN... fix, rewrite or hack
try{if((0,_big2.default)(e.target.value).toString()!==app.getCurrentState()[stateId].toString()){app.setCurrentState(_extends({},app.getCurrentState(),_defineProperty({},stateId,(0,_big2.default)(e.target.value))));render();}}catch(err){}}function CHANGE_STATIC_VALUE(ref,propertyName,type,e){var value=e.target.value;if(type==='number'){try{value=(0,_big2.default)(e.target.value);}catch(err){return;}}if(type==='boolean'){value=value===true||value==='true'?true:false;}setState(_extends({},state,{definition:_extends({},state.definition,_defineProperty({},ref.ref,_extends({},state.definition[ref.ref],_defineProperty({},ref.id,_extends({},state.definition[ref.ref][ref.id],_defineProperty({},propertyName,value))))))}));}function ADD_EVENT(propertyName,node){var _extends66;var ref=state.selectedViewNode;var eventId=uuid();setState(_extends({},state,{definition:_extends({},state.definition,(_extends66={},_defineProperty(_extends66,ref.ref,_extends({},state.definition[ref.ref],_defineProperty({},ref.id,_extends({},state.definition[ref.ref][ref.id],_defineProperty({},propertyName,{ref:'event',id:eventId}))))),_defineProperty(_extends66,"event",_extends({},state.definition.event,_defineProperty({},eventId,{type:propertyName,emitter:node,mutators:[],data:[]}))),_extends66))}));}function SELECT_PIPE(pipeId,e){e.stopPropagation();setState(_extends({},state,{selectedPipeId:pipeId}));}function CHANGE_PIPE_VALUE_TO_STATE(pipeId){if(!state.selectedStateNodeId||state.selectedStateNodeId===state.definition.pipe[pipeId].value.id){return;}setState(_extends({},state,{definition:_extends({},state.definition,{pipe:_extends({},state.definition.pipe,_defineProperty({},pipeId,_extends({},state.definition.pipe[pipeId],{value:{ref:'state',id:state.selectedStateNodeId},transformations:[]})))})}));}function ADD_TRANSFORMATION(pipeId,transformation){if(transformation==='join'){var _extends69;var newPipeId=uuid();var joinId=uuid();setState(_extends({},state,{definition:_extends({},state.definition,{join:_extends({},state.definition.join,_defineProperty({},joinId,{value:{ref:'pipe',id:newPipeId}})),pipe:_extends({},state.definition.pipe,(_extends69={},_defineProperty(_extends69,newPipeId,{type:'text',value:'Default text',transformations:[]}),_defineProperty(_extends69,pipeId,_extends({},state.definition.pipe[pipeId],{transformations:state.definition.pipe[pipeId].transformations.concat({ref:'join',id:joinId})})),_extends69))})}));}if(transformation==='toUpperCase'){var newId=uuid();setState(_extends({},state,{definition:_extends({},state.definition,{toUpperCase:_extends({},state.definition.toUpperCase,_defineProperty({},newId,{})),pipe:_extends({},state.definition.pipe,_defineProperty({},pipeId,_extends({},state.definition.pipe[pipeId],{transformations:state.definition.pipe[pipeId].transformations.concat({ref:'toUpperCase',id:newId})})))})}));}if(transformation==='toLowerCase'){var _newId=uuid();setState(_extends({},state,{definition:_extends({},state.definition,{toLowerCase:_extends({},state.definition.toLowerCase,_defineProperty({},_newId,{})),pipe:_extends({},state.definition.pipe,_defineProperty({},pipeId,_extends({},state.definition.pipe[pipeId],{transformations:state.definition.pipe[pipeId].transformations.concat({ref:'toLowerCase',id:_newId})})))})}));}if(transformation==='toText'){var _newId2=uuid();setState(_extends({},state,{definition:_extends({},state.definition,{toText:_extends({},state.definition.toText,_defineProperty({},_newId2,{})),pipe:_extends({},state.definition.pipe,_defineProperty({},pipeId,_extends({},state.definition.pipe[pipeId],{transformations:state.definition.pipe[pipeId].transformations.concat({ref:'toText',id:_newId2})})))})}));}if(transformation==='add'){var _extends77;var _newPipeId=uuid();var addId=uuid();setState(_extends({},state,{definition:_extends({},state.definition,{add:_extends({},state.definition.add,_defineProperty({},addId,{value:{ref:'pipe',id:_newPipeId}})),pipe:_extends({},state.definition.pipe,(_extends77={},_defineProperty(_extends77,_newPipeId,{type:'number',value:0,transformations:[]}),_defineProperty(_extends77,pipeId,_extends({},state.definition.pipe[pipeId],{transformations:state.definition.pipe[pipeId].transformations.concat({ref:'add',id:addId})})),_extends77))})}));}if(transformation==='subtract'){var _extends79;var _newPipeId2=uuid();var subtractId=uuid();setState(_extends({},state,{definition:_extends({},state.definition,{subtract:_extends({},state.definition.subtract,_defineProperty({},subtractId,{value:{ref:'pipe',id:_newPipeId2}})),pipe:_extends({},state.definition.pipe,(_extends79={},_defineProperty(_extends79,_newPipeId2,{type:'number',value:0,transformations:[]}),_defineProperty(_extends79,pipeId,_extends({},state.definition.pipe[pipeId],{transformations:state.definition.pipe[pipeId].transformations.concat({ref:'subtract',id:subtractId})})),_extends79))})}));}}function RESET_APP_STATE(){app.setCurrentState(app.createDefaultState());setState(_extends({},state,{eventStack:[]}));}function RESET_APP_DEFINITION(){if(state.definition!==appDefinition){setState(_extends({},state,{definition:_extends({},appDefinition)}));}}function FULL_SCREEN_CLICKED(value){if(value!==state.fullScreen){setState(_extends({},state,{fullScreen:value}));}}function SAVE_DEFAULT(stateId){setState(_extends({},state,{definition:_extends({},state.definition,{state:_extends({},state.definition.state,_defineProperty({},stateId,_extends({},state.definition.state[stateId],{defaultValue:app.getCurrentState()[stateId]})))})}));}function DELETE_STATE(stateId){var _state$definition$sta=state.definition.state,deletedState=_state$definition$sta[stateId],newState=_objectWithoutProperties(_state$definition$sta,[stateId]);setState(_extends({},state,{definition:_extends({},state.definition,{state:newState,nameSpace:_extends({},state.definition.nameSpace,{'_rootNameSpace':_extends({},state.definition.nameSpace['_rootNameSpace'],{children:state.definition.nameSpace['_rootNameSpace'].children.filter(function(ref){return ref.id!==stateId;})})})})}));}var boxIcon=function boxIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'layers');};var ifIcon=function ifIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'},style:{transform:'rotate(90deg)'}},'call_split');};var numberIcon=function numberIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'looks_one');};var listIcon=function listIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'view_list');};var inputIcon=function inputIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'input');};var textIcon=function textIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'text_fields');};var deleteIcon=function deleteIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons','data-trashcan':true}},'delete_forever');};var clearIcon=function clearIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'clear');};var folderIcon=function folderIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'folder');};var saveIcon=function saveIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'check');};var imageIcon=function imageIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'}},'image');};var appIcon=function appIcon(){return(0,_h2.default)('i',{attrs:{class:'material-icons'},style:{fontSize:'18px'}},'description');};var arrowIcon=function arrowIcon(rotate){return(0,_h2.default)('i',{attrs:{class:'material-icons','data-closearrow':true},style:{transition:'all 0.2s',transform:rotate?'rotate(-90deg)':'rotate(0deg)',cursor:'pointer'}},'expand_more');};function render(){var currentRunningState=app.getCurrentState();var dragComponentLeft=(0,_h2.default)('div',{on:{mousedown:[WIDTH_DRAGGED,'editorLeftWidth'],touchstart:[WIDTH_DRAGGED,'editorLeftWidth']},style:{position:'absolute',right:'0',transform:'translateX(100%)',top:'0',width:'10px',height:'100%',textAlign:'center',fontSize:'1em',opacity:'0',cursor:'col-resize'}});var openComponentLeft=(0,_h2.default)('div',{on:{mousedown:[OPEN_SIDEBAR,'left'],touchstart:[OPEN_SIDEBAR,'left']},style:{position:'absolute',right:'-3px',top:'50%',transform:'translateZ(0) translateX(100%) translateY(-50%)',width:'15px',height:'10%',textAlign:'center',fontSize:'1em',borderRadius:'0 5px 5px 0',background:'#5d5d5d',boxShadow:'inset 0 0 2px 7px #222',cursor:'pointer'}});var openComponentRight=(0,_h2.default)('div',{on:{mousedown:[OPEN_SIDEBAR,'right'],touchstart:[OPEN_SIDEBAR,'right']},style:{position:'absolute',left:'-3px',top:'50%',transform:'translateZ(0) translateX(-100%) translateY(-50%)',width:'15px',height:'10%',textAlign:'center',fontSize:'1em',borderRadius:'5px 0 0 5px',background:'#5d5d5d',boxShadow:'inset 0 0 2px 7px #222',cursor:'pointer'}});var dragComponentRight=(0,_h2.default)('div',{on:{mousedown:[WIDTH_DRAGGED,'editorRightWidth'],touchstart:[WIDTH_DRAGGED,'editorRightWidth']},style:{position:'absolute',left:'0',transform:'translateX(-100%)',top:'0',width:'10px',height:'100%',textAlign:'center',fontSize:'1em',opacity:'0',cursor:'col-resize'}});var dragSubComponentRight=(0,_h2.default)('div',{on:{mousedown:[WIDTH_DRAGGED,'subEditorWidth'],touchstart:[WIDTH_DRAGGED,'subEditorWidth']},style:{position:'absolute',right:'2px',transform:'translateX(100%)',top:'0',width:'10px',height:'100%',textAlign:'center',fontSize:'1em',opacity:0,cursor:'col-resize'}});var dragSubComponentLeft=(0,_h2.default)('div',{on:{mousedown:[WIDTH_DRAGGED,'subEditorWidthLeft'],touchstart:[WIDTH_DRAGGED,'subEditorWidthLeft']},style:{position:'absolute',left:'2px',transform:'translateX(-100%)',top:'0',width:'10px',height:'100%',textAlign:'center',fontSize:'1em',opacity:0,cursor:'col-resize'}});function emberEditor(ref,type){var pipe=state.definition[ref.ref][ref.id];function listTransformations(transformations,transType){return transformations.map(function(transRef,index){var transformer=state.definition[transRef.ref][transRef.id];if(transRef.ref==='equal'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{key:index,style:{color:'#bdbdbd',cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1'}},transRef.ref),(0,_h2.default)('span',{style:{flex:'0',color:transformations.length-1!==index?'#bdbdbd':transType===type?'green':'red'}},'true/false')]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},[emberEditor(transformer.value,type)])]);}if(transRef.ref==='add'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{key:index,style:{color:'#bdbdbd',cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1'}},transRef.ref),(0,_h2.default)('span',{style:{flex:'0',color:transformations.length-1!==index?'#bdbdbd':transType===type?'green':'red'}},'number')]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},[emberEditor(transformer.value,'number')])]);}if(transRef.ref==='subtract'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{key:index,style:{color:'#bdbdbd',cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1'}},transRef.ref),(0,_h2.default)('span',{style:{flex:'0',color:transformations.length-1!==index?'#bdbdbd':transType===type?'green':'red'}},'number')]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},[emberEditor(transformer.value,'number')])]);}if(transRef.ref==='multiply'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{key:index,style:{color:'#bdbdbd',cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1'}},transRef.ref),(0,_h2.default)('span',{style:{flex:'0',color:transformations.length-1!==index?'#bdbdbd':transType===type?'green':'red'}},'number')]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},[emberEditor(transformer.value,'number')])]);}if(transRef.ref==='divide'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{key:index,style:{color:'#bdbdbd',cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1'}},transRef.ref),(0,_h2.default)('span',{style:{flex:'0',color:transformations.length-1!==index?'#bdbdbd':transType===type?'green':'red'}},'number')]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},[emberEditor(transformer.value,'number')])]);}if(transRef.ref==='remainder'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{key:index,style:{color:'#bdbdbd',cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1'}},transRef.ref),(0,_h2.default)('span',{style:{flex:'0',color:transformations.length-1!==index?'#bdbdbd':transType===type?'green':'red'}},'number')]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},[emberEditor(transformer.value,'number')])]);}// if (transRef.ref === 'branch') {
//     if(resolve(transformer.predicate)){
//         value = transformValue(value, transformer.then)
//     } else {
//         value = transformValue(value, transformer.else)
//     }
// }
if(transRef.ref==='join'){return(0,_h2.default)('span',{},[emberEditor(transformer.value,transType)]);}if(transRef.ref==='toUpperCase'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{style:{cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1',color:'#bdbdbd'}},transRef.ref)])]);}if(transRef.ref==='toLowerCase'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{style:{cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1',color:'#bdbdbd'}},transRef.ref)])]);}if(transRef.ref==='toText'){return(0,_h2.default)('div',{},[(0,_h2.default)('div',{style:{cursor:'default',display:'flex'}},[(0,_h2.default)('span',{style:{flex:'1',color:'#bdbdbd'}},transRef.ref)])]);}});}function genTransformators(){var selectedPipe=state.definition.pipe[state.selectedPipeId];return[(0,_h2.default)('div',{style:{position:'fixed',top:state.componentEditorPosition.y+'px',left:state.componentEditorPosition.x-307+'px',height:'50%',width:'300px',display:'flex'}},[(0,_h2.default)('div',{style:{border:'3px solid #222',flex:'1 1 0%',background:'#4d4d4d',marginBottom:'10px'}},[(0,_h2.default)('div',{style:{display:'flex',cursor:'default',alignItems:'center',background:'#222',paddingTop:'2px',paddingBottom:'5px',color:'#53B2ED',minWidth:'100%'}},[(0,_h2.default)('span',{style:{flex:'5 5 auto',margin:'0 5px',minWidth:'0',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',fontSize:'0.8em'}},'Ugnis Toolbox'),(0,_h2.default)('span',{style:{flex:'0 0 auto',marginLeft:'auto',cursor:'pointer',marginRight:'5px',color:'white',display:'inline-flex'},on:{mousedown:[SELECT_PIPE,''],touchstart:[SELECT_PIPE,'']}},[clearIcon()])])])])];}if(typeof pipe.value==='string'){return(0,_h2.default)('div',{style:{position:'relative'}},[(0,_h2.default)('div',{style:{display:'flex',alignItems:'baseline'},on:{click:[SELECT_PIPE,ref.id]}},[(0,_h2.default)('span',{style:{flex:'0 0 auto',position:'relative',transform:'translateZ(0)'}},[(0,_h2.default)('span',{style:{opacity:'0',display:'inline-block',whiteSpace:'pre',padding:'0 5px 2px 5px',borderBottom:'2px solid white'}},pipe.value),(0,_h2.default)('input',{attrs:{type:'text'},style:{color:'white',outline:'none',boxShadow:'none',textAlign:'center',display:'inline',border:'none',borderBottom:'2px solid white',background:'none',font:'inherit',position:'absolute',top:'0',left:'0',width:'100%',flex:'0 0 auto'},on:{input:[CHANGE_STATIC_VALUE,ref,'value','text'],mousemove:[PIPE_HOVERED,ref]},liveProps:{value:pipe.value}})])].concat(_toConsumableArray(listTransformations(pipe.transformations,pipe.type)))),(0,_h2.default)('div',state.selectedPipeId===ref.id?genTransformators():[])]);}if(pipe.value===true||pipe.value===false){return(0,_h2.default)('select',{liveProps:{value:pipe.value.toString()},style:{},on:{input:[CHANGE_STATIC_VALUE,ref,'value','boolean']}},[(0,_h2.default)('option',{attrs:{value:'true'},style:{color:'black'}},['true']),(0,_h2.default)('option',{attrs:{value:'false'},style:{color:'black'}},['false'])]);}if(!isNaN(parseFloat(Number(pipe.value)))&&isFinite(Number(pipe.value))){return(0,_h2.default)('div',{style:{position:'relative'}},[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center'},on:{click:[SELECT_PIPE,ref.id]}},[(0,_h2.default)('input',{attrs:{type:'number'},style:{background:'none',outline:'none',padding:'0',margin:'0',border:'none',borderRadius:'0',display:'inline-block',width:'100%',color:'white',textDecoration:'underline'},on:{input:[CHANGE_STATIC_VALUE,ref,'value','number']},liveProps:{value:Number(pipe.value)}}),(0,_h2.default)('div',{style:{flex:'0',cursor:'default',color:pipe.transformations.length>0?'#bdbdbd':type==='number'?'green':'red'}},'number')]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},listTransformations(pipe.transformations,pipe.type)),(0,_h2.default)('div',state.selectedPipeId===ref.id?genTransformators():[])]);}if(pipe.value.ref==='state'){var displState=state.definition[pipe.value.ref][pipe.value.id];return(0,_h2.default)('div',{style:{position:'relative',cursor:'pointer'}},[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center'},on:{click:[SELECT_PIPE,ref.id]}},[(0,_h2.default)('div',{style:{flex:'1'}},[(0,_h2.default)('span',{style:{flex:'0 0 auto',display:'inline-block',position:'relative',transform:'translateZ(0)',boxShadow:'inset 0 0 0 2px '+(state.selectedStateNodeId===pipe.value.id?'#eab65c':'#828282'),background:'#444',padding:'4px 7px'}},[(0,_h2.default)('span',{style:{color:'white',display:'inline-block'},on:{click:[STATE_NODE_SELECTED,pipe.value.id]}},displState.title)])])]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},listTransformations(pipe.transformations,pipe.type)),(0,_h2.default)('div',state.selectedPipeId===ref.id?genTransformators():[])]);}if(pipe.value.ref==='listValue'){return(0,_h2.default)('div','TODO');}if(pipe.value.ref==='eventData'){var eventData=state.definition[pipe.value.ref][pipe.value.id];return(0,_h2.default)('div',[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center'},on:{click:[SELECT_PIPE,ref.id]}},[(0,_h2.default)('div',{style:{flex:'1'}},[(0,_h2.default)('div',{style:{cursor:'pointer',color:state.selectedStateNodeId===pipe.value.id?'#eab65c':'white',padding:'2px 5px',margin:'3px 3px 0 0',border:'2px solid '+(state.selectedStateNodeId===pipe.value.id?'#eab65c':'white'),display:'inline-block'},on:{click:[STATE_NODE_SELECTED,pipe.value.id]}},[eventData.title])]),(0,_h2.default)('div',{style:{flex:'0',cursor:'default',color:pipe.transformations.length>0?'#bdbdbd':eventData.type===type?'green':'red'}},eventData.type)]),(0,_h2.default)('div',{style:{paddingLeft:'15px'}},listTransformations(pipe.transformations,pipe.type))]);}}function listState(stateId){var currentState=state.definition.state[stateId];function editingNode(){return(0,_h2.default)('input',{style:{color:'white',outline:'none',padding:'4px 7px',boxShadow:'none',display:'inline',border:'none',background:'none',font:'inherit',position:'absolute',top:'0',left:'0',width:'100%',flex:'0 0 auto'},on:{input:[CHANGE_STATE_NODE_TITLE,stateId]},liveProps:{value:currentState.title},attrs:{'data-istitleeditor':true}});}return(0,_h2.default)('div',{style:{cursor:'pointer',position:'relative',fontSize:'14px'}},[(0,_h2.default)('span',{style:{display:'flex',flexWrap:'wrap',marginTop:'6px'}},[(0,_h2.default)('span',{style:{flex:'0 0 auto',position:'relative',transform:'translateZ(0)',margin:'0 7px 0 0',boxShadow:'inset 0 0 0 2px '+(state.selectedStateNodeId===stateId?'#eab65c':'#828282'),background:'#444',padding:'4px 7px'}},[(0,_h2.default)('span',{style:{opacity:state.editingTitleNodeId===stateId?'0':'1',color:'white',display:'inline-block'},on:{mousedown:[STATE_DRAGGED,stateId],touchstart:[STATE_DRAGGED,stateId],touchmove:[HOVER_MOBILE],dblclick:[EDIT_VIEW_NODE_TITLE,stateId]}},currentState.title),state.editingTitleNodeId===stateId?editingNode():(0,_h2.default)('span')]),function(){var noStyleInput={color:currentRunningState[stateId]!==state.definition.state[stateId].defaultValue?'rgb(91, 204, 91)':'white',background:'none',outline:'none',display:'inline',flex:'1',minWidth:'50px',border:'none',boxShadow:'inset 0 -2px 0 0 '+(state.selectedStateNodeId===stateId?'#eab65c':'#828282')};if(currentState.type==='text')return(0,_h2.default)('input',{attrs:{type:'text'},liveProps:{value:currentRunningState[stateId]},style:noStyleInput,on:{input:[CHANGE_CURRENT_STATE_TEXT_VALUE,stateId]}});if(currentState.type==='number')return(0,_h2.default)('input',{attrs:{type:'number'},liveProps:{value:currentRunningState[stateId]},style:noStyleInput,on:{input:[CHANGE_CURRENT_STATE_NUMBER_VALUE,stateId]}});if(currentState.type==='boolean')return(0,_h2.default)('select',{liveProps:{value:currentRunningState[stateId].toString()},style:noStyleInput,on:{input:[CHANGE_CURRENT_STATE_TEXT_VALUE,stateId]}},[(0,_h2.default)('option',{attrs:{value:'true'},style:{color:'black'}},['true']),(0,_h2.default)('option',{attrs:{value:'false'},style:{color:'black'}},['false'])]);if(currentState.type==='table'){var _ret=function(){if(state.selectedStateNodeId!==stateId){return{v:(0,_h2.default)('div',{key:'icon',on:{click:[STATE_NODE_SELECTED,stateId]},style:{display:'flex',alignItems:'center',marginTop:'7px'}},[listIcon()])};}var table=currentRunningState[stateId];return{v:(0,_h2.default)('div',{key:'table',style:{background:'#828183',width:'100%',flex:'0 0 100%'}},[(0,_h2.default)('div',{style:{display:'flex'}},Object.keys(currentState.definition).map(function(key){return(0,_h2.default)('div',{style:{flex:'1',padding:'2px 5px',borderBottom:'2px solid white'}},key);}))].concat(_toConsumableArray(Object.keys(table).map(function(id){return(0,_h2.default)('div',{style:{display:'flex'}},Object.keys(table[id]).map(function(key){return(0,_h2.default)('div',{style:{flex:'1',padding:'2px 5px'}},table[id][key]);}));}))))};}();if((typeof _ret==="undefined"?"undefined":_typeof(_ret))==="object")return _ret.v;}}(),currentState.type!=='table'&&currentRunningState[stateId]!==state.definition.state[stateId].defaultValue?(0,_h2.default)('div',{style:{display:'inline-flex',alignSelf:'center'},on:{click:[SAVE_DEFAULT,stateId]}},[saveIcon()]):(0,_h2.default)('span'),state.selectedStateNodeId===stateId&&currentState.type!=='table'?(0,_h2.default)('div',{style:{display:'inline-flex',alignSelf:'center'},on:{click:[DELETE_STATE,stateId]}},[deleteIcon()]):(0,_h2.default)('span')]),state.selectedStateNodeId===stateId?(0,_h2.default)('span',currentState.mutators.map(function(mutatorRef){var mutator=state.definition[mutatorRef.ref][mutatorRef.id];var event=state.definition[mutator.event.ref][mutator.event.id];var emitter=state.definition[event.emitter.ref][event.emitter.id];return(0,_h2.default)('div',{style:{display:'flex',cursor:'pointer',alignItems:'center',background:'#444',paddingTop:'3px',paddingBottom:'3px',color:state.selectedViewNode.id===event.emitter.id?'#53B2ED':'white',transition:'0.2s all',minWidth:'100%'},on:{click:[VIEW_NODE_SELECTED,event.emitter]}},[(0,_h2.default)('span',{style:{flex:'0 0 auto',margin:'0 3px 0 5px',display:'inline-flex'}},[event.emitter.ref==='vNodeBox'?boxIcon():event.emitter.ref==='vNodeList'?listIcon():event.emitter.ref==='vNodeList'?ifIcon():event.emitter.ref==='vNodeInput'?inputIcon():textIcon()]),(0,_h2.default)('span',{style:{flex:'5 5 auto',margin:'0 5px 0 0',minWidth:'0',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}},emitter.title),(0,_h2.default)('span',{style:{flex:'0 0 auto',marginLeft:'auto',marginRight:'5px',color:'#5bcc5b'}},event.type)]);})):(0,_h2.default)('span')]);}function fakeState(stateId){var currentState=state.definition.state[stateId];return(0,_h2.default)('span',{style:{flex:'0 0 auto',position:'relative',transform:'translateZ(0)',margin:'7px 7px 0 0',boxShadow:'inset 0 0 0 2px '+(state.selectedStateNodeId===stateId?'#eab65c':'#828282'),background:'#444',padding:'4px 7px'}},[(0,_h2.default)('span',{style:{color:'white',display:'inline-block'}},currentState.title)]);}var stateComponent=(0,_h2.default)('div',{attrs:{class:'better-scrollbar'},style:{overflow:'auto',flex:'1',padding:'0 10px'},on:{click:[UNSELECT_STATE_NODE]}},state.definition.nameSpace['_rootNameSpace'].children.map(function(ref){return listState(ref.id);}));function listNode(nodeRef,parentRef,depth){if(nodeRef.id==='_rootNode')return listRootNode(nodeRef);if(nodeRef.ref==='vNodeText')return simpleNode(nodeRef,parentRef,depth);if(nodeRef.ref==='vNodeImage')return simpleNode(nodeRef,parentRef,depth);if(nodeRef.ref==='vNodeBox'||nodeRef.ref==='vNodeList'||nodeRef.ref==='vNodeIf')return listBoxNode(nodeRef,parentRef,depth);if(nodeRef.ref==='vNodeInput')return simpleNode(nodeRef,parentRef,depth);}function prevent_bubbling(e){e.stopPropagation();}function editingNode(nodeRef){return(0,_h2.default)('input',{style:{border:'none',height:'26px',background:'none',color:'#53B2ED',outline:'none',flex:'1',padding:'0',boxShadow:'inset 0 -1px 0 0 #53B2ED',font:'inherit',paddingLeft:'2px'},on:{mousedown:prevent_bubbling,input:[CHANGE_VIEW_NODE_TITLE,nodeRef]},liveProps:{value:state.definition[nodeRef.ref][nodeRef.id].title},attrs:{autofocus:true,'data-istitleeditor':true}});}function listRootNode(nodeRef){var nodeId=nodeRef.id;var node=state.definition[nodeRef.ref][nodeId];return(0,_h2.default)('div',{style:{position:'relative'}},[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center',paddingLeft:'8px',paddingRight:'8px',background:'#444',borderTop:'2px solid #4d4d4d',borderBottom:'2px solid #333',height:'26px',whiteSpace:'nowrap'},on:{mousemove:[VIEW_HOVERED,nodeRef,{},1],touchmove:[HOVER_MOBILE]}},[(0,_h2.default)('span',{key:nodeId,style:{color:state.selectedViewNode.id===nodeId?'#53B2ED':'#bdbdbd',display:'inline-flex'},on:{click:[VIEW_NODE_SELECTED,nodeRef]}},[appIcon()]),state.editingTitleNodeId===nodeId?editingNode(nodeRef):(0,_h2.default)('span',{style:{flex:'1',cursor:'pointer',color:state.selectedViewNode.id===nodeId?'#53B2ED':'white',transition:'color 0.2s',paddingLeft:'2px'},on:{click:[VIEW_NODE_SELECTED,nodeRef],dblclick:[EDIT_VIEW_NODE_TITLE,nodeId]}},node.title)]),(0,_h2.default)('div',state.hoveredViewNode&&state.hoveredViewNode.parent.id===nodeId&&!(node.children.findIndex(function(ref){return ref.id===state.draggedComponentView.id;})===state.hoveredViewNode.position)?function(){// copy pasted from listBoxNode
var oldPosition=node.children.findIndex(function(ref){return ref.id===state.draggedComponentView.id;});var newPosition=oldPosition===-1||state.hoveredViewNode.position<oldPosition?state.hoveredViewNode.position:state.hoveredViewNode.position+1;var children=node.children.map(function(ref){return listNode(ref,nodeRef,1);});return children.slice(0,newPosition).concat(spacerComponent(),children.slice(newPosition));}():node.children.map(function(ref){return listNode(ref,nodeRef,1);})),(0,_h2.default)('div',{style:{display:'flex',alignItems:'center',paddingLeft:'8px',paddingRight:'8px',height:'15px'},on:{mousemove:[VIEW_HOVERED,{id:'_lastNode'},{},1],touchmove:[HOVER_MOBILE]}})]);}function listBoxNode(nodeRef,parentRef,depth){var nodeId=nodeRef.id;var node=state.definition[nodeRef.ref][nodeId];return(0,_h2.default)('div',{style:{opacity:state.draggedComponentView&&state.draggedComponentView.id===nodeId?'0.5':'1.0'}},[(0,_h2.default)('div',{key:nodeId,style:{display:'flex',height:'26px',position:'relative',alignItems:'center',paddingLeft:(depth-(node.children.length>0||state.hoveredViewNode&&state.hoveredViewNode.parent.id===nodeId?1:0))*20+8+'px',paddingRight:'8px',background:'#444',borderTop:'2px solid #4d4d4d',borderBottom:'2px solid #333',whiteSpace:'nowrap',color:state.selectedViewNode.id===nodeId?'#53B2ED':'white'},on:{mousedown:[VIEW_DRAGGED,nodeRef,parentRef,depth],touchstart:[VIEW_DRAGGED,nodeRef,parentRef,depth],mousemove:[VIEW_HOVERED,nodeRef,parentRef,depth],touchmove:[HOVER_MOBILE]}},[node.children.length>0||state.hoveredViewNode&&state.hoveredViewNode.parent.id===nodeId?(0,_h2.default)('span',{style:{display:'inline-flex'}},[arrowIcon(state.viewFoldersClosed[nodeId]||state.draggedComponentView&&nodeId===state.draggedComponentView.id)]):(0,_h2.default)('span'),(0,_h2.default)('span',{key:nodeId,style:{display:'inline-flex',color:state.selectedViewNode.id===nodeId?'#53B2ED':'#bdbdbd',transition:'color 0.2s'}},[nodeRef.ref==='vNodeBox'?boxIcon():nodeRef.ref==='vNodeList'?listIcon():ifIcon()]),state.editingTitleNodeId===nodeId?editingNode(nodeRef):(0,_h2.default)('span',{style:{flex:'1',cursor:'pointer',transition:'color 0.2s',paddingLeft:'2px',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'},on:{dblclick:[EDIT_VIEW_NODE_TITLE,nodeId]}},node.title),(0,_h2.default)('div',{style:{color:'#53B2ED',cursor:'pointer',display:state.selectedViewNode.id===nodeId?'inline-flex':'none',flex:'0 0 auto'}},[deleteIcon()])]),(0,_h2.default)('div',{style:{display:state.viewFoldersClosed[nodeId]||state.draggedComponentView&&nodeId===state.draggedComponentView.id?'none':'block'}},state.hoveredViewNode&&state.hoveredViewNode.parent.id===nodeId&&!(node.children.findIndex(function(ref){return ref.id===state.draggedComponentView.id;})===state.hoveredViewNode.position)?function(){// adds a fake component
var oldPosition=node.children.findIndex(function(ref){return ref.id===state.draggedComponentView.id;});// this is needed because we still show the old node
var newPosition=oldPosition===-1||state.hoveredViewNode.position<oldPosition?state.hoveredViewNode.position:state.hoveredViewNode.position+1;var children=node.children.map(function(ref){return listNode(ref,nodeRef,depth+1);});return children.slice(0,newPosition).concat(spacerComponent(),children.slice(newPosition));}():node.children.map(function(ref){return listNode(ref,nodeRef,depth+1);}))]);}function simpleNode(nodeRef,parentRef,depth){var nodeId=nodeRef.id;var node=state.definition[nodeRef.ref][nodeId];return(0,_h2.default)('div',{key:nodeId,style:{cursor:'pointer',opacity:state.draggedComponentView&&state.draggedComponentView.id===nodeId?'0.5':'1.0',position:'relative',height:'26px',paddingLeft:depth*20+8+'px',paddingRight:'8px',background:'#444',borderTop:'2px solid #4d4d4d',borderBottom:'2px solid #333',whiteSpace:'nowrap',display:'flex',alignItems:'center',color:state.selectedViewNode.id===nodeId?'#53B2ED':'#bdbdbd'},on:{mousedown:[VIEW_DRAGGED,nodeRef,parentRef,depth],touchstart:[VIEW_DRAGGED,nodeRef,parentRef,depth],dblclick:[EDIT_VIEW_NODE_TITLE,nodeId],mousemove:[VIEW_HOVERED,nodeRef,parentRef,depth],touchmove:[HOVER_MOBILE]}},[nodeRef.ref==='vNodeInput'?inputIcon():nodeRef.ref==='vNodeImage'?imageIcon():textIcon(),state.editingTitleNodeId===nodeId?editingNode(nodeRef):(0,_h2.default)('span',{style:{flex:'1',color:state.selectedViewNode.id===nodeId?'#53B2ED':'white',transition:'color 0.2s',paddingLeft:'2px',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}},node.title),(0,_h2.default)('div',{style:{color:'#53B2ED',cursor:'pointer',display:state.selectedViewNode.id===nodeId?'inline-flex':'none',flex:'0 0 auto'}},[deleteIcon()])]);}function spacerComponent(){return(0,_h2.default)('div',{key:'spacer',style:{cursor:'pointer',height:'6px',boxShadow:'inset 0 0 1px 1px #53B2ED'}});}function fakeComponent(nodeRef,depth){var nodeId=nodeRef.id;var node=state.definition[nodeRef.ref][nodeId];return(0,_h2.default)('div',{key:'_fake'+nodeId,style:{cursor:'pointer',transition:'padding-left 0.2s',height:'26px',paddingLeft:(depth-(node.children&&node.children.length>0?1:0))*20+8+'px',paddingRight:'8px',background:'rgba(68,68,68,0.8)',borderTop:'2px solid #4d4d4d',borderBottom:'2px solid #333',whiteSpace:'nowrap',display:'flex',alignItems:'center',color:state.selectedViewNode.id===nodeId?'#53B2ED':'#bdbdbd'}},[(nodeRef.ref==='vNodeBox'||nodeRef.ref==='vNodeList'||nodeRef.ref==='vNodeIf')&&node.children.length>0?arrowIcon(true):(0,_h2.default)('span',{key:'_fakeSpan'+nodeId}),nodeRef.ref==='vNodeBox'?boxIcon():nodeRef.ref==='vNodeList'?listIcon():nodeRef.ref==='vNodeIf'?ifIcon():nodeRef.ref==='vNodeInput'?inputIcon():textIcon(),(0,_h2.default)('span',{style:{flex:'1',color:state.selectedViewNode.id===nodeId?'#53B2ED':'white',transition:'color 0.2s',paddingLeft:'2px',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}},node.title)]);}function generateEditNodeComponent(){var styles=['background','border','outline','cursor','color','display','top','bottom','left','flex','justifyContent','alignItems','width','height','maxWidth','maxHeight','minWidth','minHeight','right','position','overflow','font','margin','padding'];var selectedNode=state.definition[state.selectedViewNode.ref][state.selectedViewNode.id];var propsComponent=(0,_h2.default)('div',{style:{background:state.selectedViewSubMenu==='props'?'#4d4d4d':'#3d3d3d',padding:'10px 0',flex:'1',cursor:'pointer',textAlign:'center'},on:{click:[SELECT_VIEW_SUBMENU,'props']}},'data');var styleComponent=(0,_h2.default)('div',{style:{background:state.selectedViewSubMenu==='style'?'#4d4d4d':'#3d3d3d',padding:'10px 0',flex:'1',borderRight:'1px solid #222',borderLeft:'1px solid #222',textAlign:'center',cursor:'pointer'},on:{click:[SELECT_VIEW_SUBMENU,'style']}},'style');var eventsComponent=(0,_h2.default)('div',{style:{background:state.selectedViewSubMenu==='events'?'#4d4d4d':'#3d3d3d',padding:'10px 0',flex:'1',textAlign:'center',cursor:'pointer'},on:{click:[SELECT_VIEW_SUBMENU,'events']}},'events');var genpropsSubmenuComponent=function genpropsSubmenuComponent(){return(0,_h2.default)('div',[function(){if(state.selectedViewNode.ref==='vNodeBox'){return(0,_h2.default)('div',{style:{textAlign:'center',marginTop:'100px',color:'#bdbdbd'}},'no data required');}if(state.selectedViewNode.ref==='vNodeText'){return(0,_h2.default)('div',{style:{overflow:'auto'},attrs:{"class":'better-scrollbar'}},[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center',background:'#676767',padding:'5px 10px',marginBottom:'10px'}},[(0,_h2.default)('span',{style:{flex:'1'}},'text value'),(0,_h2.default)('div',{style:{flex:'0',cursor:'default',color:'#bdbdbd'}},'text')]),(0,_h2.default)('div',{style:{padding:'5px 10px'}},[emberEditor(selectedNode.value,'text')])]);}if(state.selectedViewNode.ref==='vNodeImage'){return(0,_h2.default)('div',{style:{overflow:'auto'},attrs:{"class":'better-scrollbar'}},[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center',background:'#676767',padding:'5px 10px',marginBottom:'10px'}},[(0,_h2.default)('span',{style:{flex:'1'}},'source (url)'),(0,_h2.default)('div',{style:{flex:'0',cursor:'default',color:'#bdbdbd'}},'text')]),(0,_h2.default)('div',{style:{padding:'5px 10px'}},[emberEditor(selectedNode.src,'text')])]);}if(state.selectedViewNode.ref==='vNodeInput'){return(0,_h2.default)('div',{style:{overflow:'auto'},attrs:{"class":'better-scrollbar'}},[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center',background:'#676767',padding:'5px 10px',marginBottom:'10px'}},[(0,_h2.default)('span',{style:{flex:'1'}},'input value'),(0,_h2.default)('div',{style:{flex:'0',cursor:'default',color:'#bdbdbd'}},'text')]),(0,_h2.default)('div',{style:{padding:'5px 10px'}},[emberEditor(selectedNode.value,'text')])]);}if(state.selectedViewNode.ref==='vNodeList'){return(0,_h2.default)('div',{style:{overflow:'auto'},attrs:{"class":'better-scrollbar'}},[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center',background:'#676767',padding:'5px 10px',marginBottom:'10px'}},[(0,_h2.default)('span',{style:{flex:'1'}},'table'),(0,_h2.default)('div',{style:{flex:'0',cursor:'default',color:'#bdbdbd'}},'table')]),(0,_h2.default)('div',{style:{padding:'5px 10px'}},[emberEditor(selectedNode.value,'table')])]);}if(state.selectedViewNode.ref==='vNodeIf'){return(0,_h2.default)('div',{style:{overflow:'auto'},attrs:{"class":'better-scrollbar'}},[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center',background:'#676767',padding:'5px 10px',marginBottom:'10px'}},[(0,_h2.default)('span',{style:{flex:'1'}},'predicate'),(0,_h2.default)('div',{style:{flex:'0',cursor:'default',color:'#bdbdbd'}},'true/false')]),(0,_h2.default)('div',{style:{padding:'5px 10px'}},[emberEditor(selectedNode.value,'boolean')])]);}}()]);};var genstyleSubmenuComponent=function genstyleSubmenuComponent(){var selectedStyle=state.definition.style[selectedNode.style.id];return(0,_h2.default)('div',{attrs:{class:'better-scrollbar'},style:{overflow:'auto'}},[(0,_h2.default)('div',{style:{padding:'10px',fontFamily:"'Comfortaa', sans-serif",color:'#bdbdbd'}},'style panel will change a lot in 1.0v, right now it\'s just CSS')].concat(_toConsumableArray(Object.keys(selectedStyle).map(function(key){return(0,_h2.default)('div',{style:{}},[(0,_h2.default)('div',{style:{display:'flex',alignItems:'center',background:'#676767',padding:'5px 10px',marginBottom:'10px'}},[(0,_h2.default)('span',{style:{flex:'1'}},key),(0,_h2.default)('div',{style:{flex:'0',cursor:'default',color:'#bdbdbd'}},'text')]),(0,_h2.default)('div',{style:{padding:'5px 10px'}},[emberEditor(selectedStyle[key],'text')])]);})),[(0,_h2.default)('div',{style:{padding:'5px 10px',fontFamily:"'Comfortaa', sans-serif",color:'#bdbdbd'}},'add Style:'),(0,_h2.default)('div',{style:{padding:'5px 0 5px 10px'}},styles.filter(function(key){return!Object.keys(selectedStyle).includes(key);}).map(function(key){return(0,_h2.default)('div',{on:{click:[ADD_DEFAULT_STYLE,selectedNode.style.id,key]},style:{cursor:'pointer',border:'3px solid white',padding:'5px',marginTop:'5px'}},'+ '+key);}))]));};var geneventsSubmenuComponent=function geneventsSubmenuComponent(){var availableEvents=[{description:'on click',propertyName:'click'},{description:'double clicked',propertyName:'dblclick'},{description:'mouse over',propertyName:'mouseover'},{description:'mouse out',propertyName:'mouseout'}];if(state.selectedViewNode.ref==='vNodeInput'){availableEvents=availableEvents.concat([{description:'input',propertyName:'input'},{description:'focus',propertyName:'focus'},{description:'blur',propertyName:'blur'}]);}var currentEvents=availableEvents.filter(function(event){return selectedNode[event.propertyName];});var eventsLeft=availableEvents.filter(function(event){return!selectedNode[event.propertyName];});return(0,_h2.default)('div',{style:{paddingTop:'20px'}},[].concat(_toConsumableArray(currentEvents.length?currentEvents.map(function(eventDesc){var event=state.definition[selectedNode[eventDesc.propertyName].ref][selectedNode[eventDesc.propertyName].id];return(0,_h2.default)('div',[(0,_h2.default)('div',{style:{background:'#676767',padding:'5px 10px'}},event.type),(0,_h2.default)('div',{style:{color:'white',transition:'color 0.2s',fontSize:'14px',cursor:'pointer',padding:'5px 10px'}},event.mutators.map(function(mutatorRef){var mutator=state.definition[mutatorRef.ref][mutatorRef.id];var stateDef=state.definition[mutator.state.ref][mutator.state.id];return(0,_h2.default)('div',{style:{marginTop:'10px'}},[(0,_h2.default)('span',{style:{flex:'0 0 auto',display:'inline-block',position:'relative',transform:'translateZ(0)',boxShadow:'inset 0 0 0 2px '+(state.selectedStateNodeId===mutator.state.id?'#eab65c':'#828282'),background:'#444',padding:'4px 7px'}},[(0,_h2.default)('span',{style:{color:'white',display:'inline-block'},on:{click:[STATE_NODE_SELECTED,mutator.state.id]}},stateDef.title)]),emberEditor(mutator.mutation,stateDef.type)]);}))]);}):[]),[(0,_h2.default)('div',{style:{padding:'5px 10px',fontFamily:"'Comfortaa', sans-serif",color:'#bdbdbd'}},'add Event:'),(0,_h2.default)('div',{style:{padding:'5px 0 5px 10px'}},[].concat(_toConsumableArray(eventsLeft.map(function(event){return(0,_h2.default)('div',{style:{border:'3px solid #5bcc5b',cursor:'pointer',padding:'5px',margin:'10px'},on:{click:[ADD_EVENT,event.propertyName,state.selectedViewNode]}},'+ '+event.description);}))))]));};var fullVNode=['vNodeBox','vNodeText','vNodeImage','vNodeInput'].includes(state.selectedViewNode.ref);return(0,_h2.default)('div',{style:{position:'fixed',font:"300 1.2em 'Open Sans'",lineHeight:'1.2em',color:'white',left:state.componentEditorPosition.x+'px',top:state.componentEditorPosition.y+'px',height:'50%',display:'flex',zIndex:'3000'}},[(0,_h2.default)('div',{style:{flex:'1',display:'flex',marginBottom:'10px',flexDirection:'column',background:'#4d4d4d',width:state.subEditorWidth+'px',border:'3px solid #222'}},[(0,_h2.default)('div',{style:{flex:'0 0 auto'}},[(0,_h2.default)('div',{style:{display:'flex',cursor:'default',alignItems:'center',background:'#222',paddingTop:'2px',paddingBottom:'5px',color:'#53B2ED',minWidth:'100%'},on:{mousedown:[COMPONENT_VIEW_DRAGGED],touchstart:[COMPONENT_VIEW_DRAGGED]}},[(0,_h2.default)('span',{style:{flex:'0 0 auto',margin:'0 2px 0 5px',display:'inline-flex'}},[state.selectedViewNode.id==='_rootNode'?appIcon():state.selectedViewNode.ref==='vNodeBox'?boxIcon():state.selectedViewNode.ref==='vNodeList'?listIcon():state.selectedViewNode.ref==='vNodeList'?ifIcon():state.selectedViewNode.ref==='vNodeInput'?inputIcon():textIcon()]),(0,_h2.default)('span',{style:{flex:'5 5 auto',margin:'0 5px 0 0',minWidth:'0',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis',fontSize:'0.8em'}},selectedNode.title),(0,_h2.default)('span',{style:{flex:'0 0 auto',marginLeft:'auto',cursor:'pointer',marginRight:'5px',color:'white',display:'inline-flex'},on:{mousedown:[UNSELECT_VIEW_NODE,false],touchstart:[UNSELECT_VIEW_NODE,false]}},[clearIcon()])])]),fullVNode?(0,_h2.default)('div',{style:{display:'flex',flex:'0 0 auto',fontFamily:"'Comfortaa', sans-serif"}},[propsComponent,styleComponent,eventsComponent]):(0,_h2.default)('span'),dragSubComponentRight,dragSubComponentLeft,state.selectedViewSubMenu==='props'||!fullVNode?genpropsSubmenuComponent():state.selectedViewSubMenu==='style'?genstyleSubmenuComponent():state.selectedViewSubMenu==='events'?geneventsSubmenuComponent():(0,_h2.default)('span','Error, no such menu')])]);}var addStateComponent=(0,_h2.default)('div',{style:{flex:'0 auto',marginLeft:state.rightOpen?'-10px':'0',border:'3px solid #222',borderRight:'none',background:'#333',height:'40px',display:'flex',alignItems:'center'}},[(0,_h2.default)('span',{style:{fontFamily:"'Comfortaa', sans-serif",fontSize:'0.9em',cursor:'pointer',padding:'0 5px'}},'add state: '),(0,_h2.default)('span',{style:{display:'inline-block'},on:{click:[ADD_STATE,'_rootNameSpace','text']}},[textIcon()]),(0,_h2.default)('span',{on:{click:[ADD_STATE,'_rootNameSpace','number']}},[numberIcon()]),(0,_h2.default)('span',{on:{click:[ADD_STATE,'_rootNameSpace','boolean']}},[ifIcon()]),(0,_h2.default)('span',{on:{click:[ADD_STATE,'_rootNameSpace','table']}},[listIcon()])]);var addViewNodeComponent=(0,_h2.default)('div',{style:{flex:'0 auto',marginLeft:state.rightOpen?'-10px':'0',border:'3px solid #222',borderRight:'none',background:'#333',height:'40px',display:'flex',alignItems:'center'}},[(0,_h2.default)('span',{style:{fontFamily:"'Comfortaa', sans-serif",fontSize:'0.9em',padding:'0 10px'}},'add component: '),(0,_h2.default)('span',{on:{click:[ADD_NODE,state.selectedViewNode,'box']}},[boxIcon()]),(0,_h2.default)('span',{on:{click:[ADD_NODE,state.selectedViewNode,'input']}},[inputIcon()]),(0,_h2.default)('span',{on:{click:[ADD_NODE,state.selectedViewNode,'text']}},[textIcon()]),(0,_h2.default)('span',{on:{click:[ADD_NODE,state.selectedViewNode,'image']}},[imageIcon()]),(0,_h2.default)('span',{on:{click:[ADD_NODE,state.selectedViewNode,'if']}},[ifIcon()])]);var viewComponent=(0,_h2.default)('div',{attrs:{class:'better-scrollbar'},style:{overflow:'auto',position:'relative',flex:'1',fontSize:'0.8em'},on:{click:[UNSELECT_VIEW_NODE,true]}},[listNode({ref:'vNodeBox',id:'_rootNode'},{},0)]);var rightComponent=(0,_h2.default)('div',{style:{display:'flex',flexDirection:'column',position:'absolute',top:'0',right:'0',color:'white',height:'100%',font:"300 1.2em 'Open Sans'",lineHeight:'1.2em',width:state.editorRightWidth+'px',background:'#4d4d4d',boxSizing:"border-box",borderLeft:'3px solid #222',transition:'0.5s transform',transform:state.rightOpen?'translateZ(0) translateX(0%)':'translateZ(0) translateX(100%)',userSelect:'none'}},[dragComponentRight,openComponentRight,addStateComponent,stateComponent,addViewNodeComponent,viewComponent]);var topComponent=(0,_h2.default)('div',{style:{flex:'1 auto',height:'75px',maxHeight:'75px',minHeight:'75px',background:'#222',display:'flex',justifyContent:'center',fontFamily:"'Comfortaa', sans-serif"}},[(0,_h2.default)('a',{style:{flex:'0 auto',width:'190px',textDecoration:'inherit',userSelect:'none'},attrs:{href:'/_dev'}},[(0,_h2.default)('img',{style:{margin:'7px -2px -3px 5px',display:'inline-block'},attrs:{src:'/images/logo256x256.png',height:'57'}}),(0,_h2.default)('span',{style:{fontSize:'44px',verticalAlign:'bottom',color:'#fff'}},'ugnis')]),(0,_h2.default)('div',{style:{position:'absolute',top:'0',right:'0',border:'none',color:'white',fontFamily:"'Comfortaa', sans-serif",fontSize:'16px'}},[(0,_h2.default)('div',{style:{background:'#444444',border:'none',color:'white',display:'inline-block',padding:'15px 20px',margin:'13px 13px 0 0',cursor:'pointer'},on:{click:[FULL_SCREEN_CLICKED,true]}},'full screen'),(0,_h2.default)('div',{style:{background:'#444444',border:'none',color:'white',display:'inline-block',padding:'15px 20px',margin:'13px 13px 0 0',cursor:'pointer'},on:{click:RESET_APP_STATE}},'reset state'),(0,_h2.default)('div',{style:{background:'#444444',border:'none',color:'white',display:'inline-block',padding:'15px 20px',margin:'13px 13px 0 0',cursor:'pointer'},on:{click:RESET_APP_DEFINITION}},'reset demo')])]);var leftComponent=(0,_h2.default)('div',{style:{display:'flex',flexDirection:'column',position:'absolute',top:'0',left:'0',height:'100%',color:'white',font:"300 1.2em 'Open Sans'",width:state.editorLeftWidth+'px',background:'#4d4d4d',boxSizing:"border-box",borderRight:'3px solid #222',transition:'0.5s transform',transform:state.leftOpen?'translateZ(0) translateX(0%)':'translateZ(0) translateX(-100%)',userSelect:'none'}},[dragComponentLeft,openComponentLeft,(0,_h2.default)('div',{on:{click:FREEZER_CLICKED},style:{flex:'0 auto',padding:'10px',textAlign:'center',background:'#333',cursor:'pointer'}},[(0,_h2.default)('span',{style:{padding:'15px 15px 10px 15px',color:state.appIsFrozen?'rgb(91, 204, 91)':'rgb(204, 91, 91)'}},state.appIsFrozen?'►':'❚❚')]),(0,_h2.default)('div',{attrs:{class:'better-scrollbar'},style:{flex:'1 auto',overflow:'auto'}},state.eventStack.filter(function(eventData){return state.definition.event[eventData.eventId]!==undefined;}).reverse()// mutates the array, but it was already copied with filter
.map(function(eventData,index){var event=state.definition.event[eventData.eventId];var emitter=state.definition[event.emitter.ref][event.emitter.id];// no idea why this key works, don't touch it, probably rerenders more than needed, but who cares
return(0,_h2.default)('div',{key:event.emitter.id+index,style:{marginBottom:'10px'}},[(0,_h2.default)('div',{style:{display:'flex',marginBottom:'10px',cursor:'pointer',alignItems:'center',background:'#444',paddingTop:'3px',paddingBottom:'3px',color:state.selectedViewNode.id===event.emitter.id?'#53B2ED':'white',transition:'0.2s all',minWidth:'100%'},on:{click:[VIEW_NODE_SELECTED,event.emitter]}},[(0,_h2.default)('span',{style:{flex:'0 0 auto',margin:'0 0 0 5px'}},[event.emitter.ref==='vNodeBox'?boxIcon():event.emitter.ref==='vNodeList'?listIcon():event.emitter.ref==='vNodeList'?ifIcon():event.emitter.ref==='vNodeInput'?inputIcon():textIcon()]),(0,_h2.default)('span',{style:{flex:'5 5 auto',margin:'0 5px 0 0',minWidth:'0',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}},emitter.title),(0,_h2.default)('span',{style:{flex:'0 0 auto',fontFamily:"'Comfortaa', sans-serif",fontSize:'0.9em',marginLeft:'auto',marginRight:'5px',color:'#5bcc5b'}},event.type)]),Object.keys(eventData.mutations).length===0?(0,_h2.default)('div',{style:{padding:'5px 10px',fontFamily:"'Comfortaa', sans-serif",color:'#bdbdbd'}},'nothing has changed'):(0,_h2.default)('div',{style:{paddingLeft:'10px',whiteSpace:'nowrap'}},Object.keys(eventData.mutations).filter(function(stateId){return state.definition.state[stateId]!==undefined;}).map(function(stateId){return(0,_h2.default)('span',[(0,_h2.default)('span',{on:{click:[STATE_NODE_SELECTED,stateId]},style:{cursor:'pointer',fontSize:'14px',color:'white',boxShadow:'inset 0 0 0 2px '+(state.selectedStateNodeId===stateId?'#eab65c':'#828282'),background:'#444',padding:'2px 5px',marginRight:'5px',display:'inline-block',transition:'all 0.2s'}},state.definition.state[stateId].title),(0,_h2.default)('span',{style:{color:'#8e8e8e'}},eventData.previousState[stateId].toString()+' –› '),(0,_h2.default)('span',eventData.mutations[stateId].toString())]);}))]);}))]);var renderViewComponent=(0,_h2.default)('div',{style:{flex:'1 auto',//backgroundImage: 'radial-gradient(black 15%, transparent 16%), radial-gradient(black 15%, transparent 16%), radial-gradient(rgba(255, 255, 255, 0.0980392) 15%, transparent 20%), radial-gradient(rgba(255, 255, 255, 0.0980392) 15%, transparent 20%)',
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmlnLmpzL2JpZy5qcyIsIm5vZGVfbW9kdWxlcy9mYXN0Y2xpY2svbGliL2Zhc3RjbGljay5qcyIsIm5vZGVfbW9kdWxlcy9zbmFiYmRvbS9oLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL2h0bWxkb21hcGkuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vaXMuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vbW9kdWxlcy9hdHRyaWJ1dGVzLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvY2xhc3MuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vbW9kdWxlcy9ldmVudGxpc3RlbmVycy5qcyIsIm5vZGVfbW9kdWxlcy9zbmFiYmRvbS9tb2R1bGVzL3Byb3BzLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvc3R5bGUuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vc25hYmJkb20uanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vdm5vZGUuanMiLCJzcmNcXGluZGV4LmpzIiwic3JjXFx1Z25pcy5qcyIsInVnbmlzX2NvbXBvbmVudHMvYXBwLmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdG5DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3owQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGJpZy5qcyB2My4xLjMgaHR0cHM6Ly9naXRodWIuY29tL01pa2VNY2wvYmlnLmpzL0xJQ0VOQ0UgKi9cclxuOyhmdW5jdGlvbiAoZ2xvYmFsKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4vKlxyXG4gIGJpZy5qcyB2My4xLjNcclxuICBBIHNtYWxsLCBmYXN0LCBlYXN5LXRvLXVzZSBsaWJyYXJ5IGZvciBhcmJpdHJhcnktcHJlY2lzaW9uIGRlY2ltYWwgYXJpdGhtZXRpYy5cclxuICBodHRwczovL2dpdGh1Yi5jb20vTWlrZU1jbC9iaWcuanMvXHJcbiAgQ29weXJpZ2h0IChjKSAyMDE0IE1pY2hhZWwgTWNsYXVnaGxpbiA8TThjaDg4bEBnbWFpbC5jb20+XHJcbiAgTUlUIEV4cGF0IExpY2VuY2VcclxuKi9cclxuXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBFRElUQUJMRSBERUZBVUxUUyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcblxyXG4gICAgLy8gVGhlIGRlZmF1bHQgdmFsdWVzIGJlbG93IG11c3QgYmUgaW50ZWdlcnMgd2l0aGluIHRoZSBzdGF0ZWQgcmFuZ2VzLlxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgbWF4aW11bSBudW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMgb2YgdGhlIHJlc3VsdHMgb2Ygb3BlcmF0aW9uc1xyXG4gICAgICogaW52b2x2aW5nIGRpdmlzaW9uOiBkaXYgYW5kIHNxcnQsIGFuZCBwb3cgd2l0aCBuZWdhdGl2ZSBleHBvbmVudHMuXHJcbiAgICAgKi9cclxuICAgIHZhciBEUCA9IDIwLCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gTUFYX0RQXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVGhlIHJvdW5kaW5nIG1vZGUgdXNlZCB3aGVuIHJvdW5kaW5nIHRvIHRoZSBhYm92ZSBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIDAgVG93YXJkcyB6ZXJvIChpLmUuIHRydW5jYXRlLCBubyByb3VuZGluZykuICAgICAgIChST1VORF9ET1dOKVxyXG4gICAgICAgICAqIDEgVG8gbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCByb3VuZCB1cC4gIChST1VORF9IQUxGX1VQKVxyXG4gICAgICAgICAqIDIgVG8gbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCB0byBldmVuLiAgIChST1VORF9IQUxGX0VWRU4pXHJcbiAgICAgICAgICogMyBBd2F5IGZyb20gemVyby4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKFJPVU5EX1VQKVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFJNID0gMSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMCwgMSwgMiBvciAzXHJcblxyXG4gICAgICAgIC8vIFRoZSBtYXhpbXVtIHZhbHVlIG9mIERQIGFuZCBCaWcuRFAuXHJcbiAgICAgICAgTUFYX0RQID0gMUU2LCAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIDEwMDAwMDBcclxuXHJcbiAgICAgICAgLy8gVGhlIG1heGltdW0gbWFnbml0dWRlIG9mIHRoZSBleHBvbmVudCBhcmd1bWVudCB0byB0aGUgcG93IG1ldGhvZC5cclxuICAgICAgICBNQVhfUE9XRVIgPSAxRTYsICAgICAgICAgICAgICAgICAgIC8vIDEgdG8gMTAwMDAwMFxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSBleHBvbmVudCB2YWx1ZSBhdCBhbmQgYmVuZWF0aCB3aGljaCB0b1N0cmluZyByZXR1cm5zIGV4cG9uZW50aWFsXHJcbiAgICAgICAgICogbm90YXRpb24uXHJcbiAgICAgICAgICogSmF2YVNjcmlwdCdzIE51bWJlciB0eXBlOiAtN1xyXG4gICAgICAgICAqIC0xMDAwMDAwIGlzIHRoZSBtaW5pbXVtIHJlY29tbWVuZGVkIGV4cG9uZW50IHZhbHVlIG9mIGEgQmlnLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIEVfTkVHID0gLTcsICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gLTEwMDAwMDBcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgZXhwb25lbnQgdmFsdWUgYXQgYW5kIGFib3ZlIHdoaWNoIHRvU3RyaW5nIHJldHVybnMgZXhwb25lbnRpYWxcclxuICAgICAgICAgKiBub3RhdGlvbi5cclxuICAgICAgICAgKiBKYXZhU2NyaXB0J3MgTnVtYmVyIHR5cGU6IDIxXHJcbiAgICAgICAgICogMTAwMDAwMCBpcyB0aGUgbWF4aW11bSByZWNvbW1lbmRlZCBleHBvbmVudCB2YWx1ZSBvZiBhIEJpZy5cclxuICAgICAgICAgKiAoVGhpcyBsaW1pdCBpcyBub3QgZW5mb3JjZWQgb3IgY2hlY2tlZC4pXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgRV9QT1MgPSAyMSwgICAgICAgICAgICAgICAgICAgLy8gMCB0byAxMDAwMDAwXHJcblxyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuICAgICAgICAvLyBUaGUgc2hhcmVkIHByb3RvdHlwZSBvYmplY3QuXHJcbiAgICAgICAgUCA9IHt9LFxyXG4gICAgICAgIGlzVmFsaWQgPSAvXi0/KFxcZCsoXFwuXFxkKik/fFxcLlxcZCspKGVbKy1dP1xcZCspPyQvaSxcclxuICAgICAgICBCaWc7XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBDcmVhdGUgYW5kIHJldHVybiBhIEJpZyBjb25zdHJ1Y3Rvci5cclxuICAgICAqXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGJpZ0ZhY3RvcnkoKSB7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVGhlIEJpZyBjb25zdHJ1Y3RvciBhbmQgZXhwb3J0ZWQgZnVuY3Rpb24uXHJcbiAgICAgICAgICogQ3JlYXRlIGFuZCByZXR1cm4gYSBuZXcgaW5zdGFuY2Ugb2YgYSBCaWcgbnVtYmVyIG9iamVjdC5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIG4ge251bWJlcnxzdHJpbmd8QmlnfSBBIG51bWVyaWMgdmFsdWUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gQmlnKG4pIHtcclxuICAgICAgICAgICAgdmFyIHggPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgLy8gRW5hYmxlIGNvbnN0cnVjdG9yIHVzYWdlIHdpdGhvdXQgbmV3LlxyXG4gICAgICAgICAgICBpZiAoISh4IGluc3RhbmNlb2YgQmlnKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG4gPT09IHZvaWQgMCA/IGJpZ0ZhY3RvcnkoKSA6IG5ldyBCaWcobik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIER1cGxpY2F0ZS5cclxuICAgICAgICAgICAgaWYgKG4gaW5zdGFuY2VvZiBCaWcpIHtcclxuICAgICAgICAgICAgICAgIHgucyA9IG4ucztcclxuICAgICAgICAgICAgICAgIHguZSA9IG4uZTtcclxuICAgICAgICAgICAgICAgIHguYyA9IG4uYy5zbGljZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGFyc2UoeCwgbik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIFJldGFpbiBhIHJlZmVyZW5jZSB0byB0aGlzIEJpZyBjb25zdHJ1Y3RvciwgYW5kIHNoYWRvd1xyXG4gICAgICAgICAgICAgKiBCaWcucHJvdG90eXBlLmNvbnN0cnVjdG9yIHdoaWNoIHBvaW50cyB0byBPYmplY3QuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICB4LmNvbnN0cnVjdG9yID0gQmlnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQmlnLnByb3RvdHlwZSA9IFA7XHJcbiAgICAgICAgQmlnLkRQID0gRFA7XHJcbiAgICAgICAgQmlnLlJNID0gUk07XHJcbiAgICAgICAgQmlnLkVfTkVHID0gRV9ORUc7XHJcbiAgICAgICAgQmlnLkVfUE9TID0gRV9QT1M7XHJcblxyXG4gICAgICAgIHJldHVybiBCaWc7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIFByaXZhdGUgZnVuY3Rpb25zXHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiBCaWcgeCBpbiBub3JtYWwgb3IgZXhwb25lbnRpYWxcclxuICAgICAqIG5vdGF0aW9uIHRvIGRwIGZpeGVkIGRlY2ltYWwgcGxhY2VzIG9yIHNpZ25pZmljYW50IGRpZ2l0cy5cclxuICAgICAqXHJcbiAgICAgKiB4IHtCaWd9IFRoZSBCaWcgdG8gZm9ybWF0LlxyXG4gICAgICogZHAge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICogdG9FIHtudW1iZXJ9IDEgKHRvRXhwb25lbnRpYWwpLCAyICh0b1ByZWNpc2lvbikgb3IgdW5kZWZpbmVkICh0b0ZpeGVkKS5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZm9ybWF0KHgsIGRwLCB0b0UpIHtcclxuICAgICAgICB2YXIgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBpbmRleCAobm9ybWFsIG5vdGF0aW9uKSBvZiB0aGUgZGlnaXQgdGhhdCBtYXkgYmUgcm91bmRlZCB1cC5cclxuICAgICAgICAgICAgaSA9IGRwIC0gKHggPSBuZXcgQmlnKHgpKS5lLFxyXG4gICAgICAgICAgICBjID0geC5jO1xyXG5cclxuICAgICAgICAvLyBSb3VuZD9cclxuICAgICAgICBpZiAoYy5sZW5ndGggPiArK2RwKSB7XHJcbiAgICAgICAgICAgIHJuZCh4LCBpLCBCaWcuUk0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFjWzBdKSB7XHJcbiAgICAgICAgICAgICsraTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRvRSkge1xyXG4gICAgICAgICAgICBpID0gZHA7XHJcblxyXG4gICAgICAgIC8vIHRvRml4ZWRcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjID0geC5jO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVjYWxjdWxhdGUgaSBhcyB4LmUgbWF5IGhhdmUgY2hhbmdlZCBpZiB2YWx1ZSByb3VuZGVkIHVwLlxyXG4gICAgICAgICAgICBpID0geC5lICsgaSArIDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBcHBlbmQgemVyb3M/XHJcbiAgICAgICAgZm9yICg7IGMubGVuZ3RoIDwgaTsgYy5wdXNoKDApKSB7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGkgPSB4LmU7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogdG9QcmVjaXNpb24gcmV0dXJucyBleHBvbmVudGlhbCBub3RhdGlvbiBpZiB0aGUgbnVtYmVyIG9mXHJcbiAgICAgICAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHNwZWNpZmllZCBpcyBsZXNzIHRoYW4gdGhlIG51bWJlciBvZiBkaWdpdHNcclxuICAgICAgICAgKiBuZWNlc3NhcnkgdG8gcmVwcmVzZW50IHRoZSBpbnRlZ2VyIHBhcnQgb2YgdGhlIHZhbHVlIGluIG5vcm1hbFxyXG4gICAgICAgICAqIG5vdGF0aW9uLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHJldHVybiB0b0UgPT09IDEgfHwgdG9FICYmIChkcCA8PSBpIHx8IGkgPD0gQmlnLkVfTkVHKSA/XHJcblxyXG4gICAgICAgICAgLy8gRXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICAgICAgICAoeC5zIDwgMCAmJiBjWzBdID8gJy0nIDogJycpICtcclxuICAgICAgICAgICAgKGMubGVuZ3RoID4gMSA/IGNbMF0gKyAnLicgKyBjLmpvaW4oJycpLnNsaWNlKDEpIDogY1swXSkgK1xyXG4gICAgICAgICAgICAgIChpIDwgMCA/ICdlJyA6ICdlKycpICsgaVxyXG5cclxuICAgICAgICAgIC8vIE5vcm1hbCBub3RhdGlvbi5cclxuICAgICAgICAgIDogeC50b1N0cmluZygpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUGFyc2UgdGhlIG51bWJlciBvciBzdHJpbmcgdmFsdWUgcGFzc2VkIHRvIGEgQmlnIGNvbnN0cnVjdG9yLlxyXG4gICAgICpcclxuICAgICAqIHgge0JpZ30gQSBCaWcgbnVtYmVyIGluc3RhbmNlLlxyXG4gICAgICogbiB7bnVtYmVyfHN0cmluZ30gQSBudW1lcmljIHZhbHVlLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBwYXJzZSh4LCBuKSB7XHJcbiAgICAgICAgdmFyIGUsIGksIG5MO1xyXG5cclxuICAgICAgICAvLyBNaW51cyB6ZXJvP1xyXG4gICAgICAgIGlmIChuID09PSAwICYmIDEgLyBuIDwgMCkge1xyXG4gICAgICAgICAgICBuID0gJy0wJztcclxuXHJcbiAgICAgICAgLy8gRW5zdXJlIG4gaXMgc3RyaW5nIGFuZCBjaGVjayB2YWxpZGl0eS5cclxuICAgICAgICB9IGVsc2UgaWYgKCFpc1ZhbGlkLnRlc3QobiArPSAnJykpIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoTmFOKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSBzaWduLlxyXG4gICAgICAgIHgucyA9IG4uY2hhckF0KDApID09ICctJyA/IChuID0gbi5zbGljZSgxKSwgLTEpIDogMTtcclxuXHJcbiAgICAgICAgLy8gRGVjaW1hbCBwb2ludD9cclxuICAgICAgICBpZiAoKGUgPSBuLmluZGV4T2YoJy4nKSkgPiAtMSkge1xyXG4gICAgICAgICAgICBuID0gbi5yZXBsYWNlKCcuJywgJycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRXhwb25lbnRpYWwgZm9ybT9cclxuICAgICAgICBpZiAoKGkgPSBuLnNlYXJjaCgvZS9pKSkgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgZXhwb25lbnQuXHJcbiAgICAgICAgICAgIGlmIChlIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgZSA9IGk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZSArPSArbi5zbGljZShpICsgMSk7XHJcbiAgICAgICAgICAgIG4gPSBuLnN1YnN0cmluZygwLCBpKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChlIDwgMCkge1xyXG5cclxuICAgICAgICAgICAgLy8gSW50ZWdlci5cclxuICAgICAgICAgICAgZSA9IG4ubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIGxlYWRpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yIChpID0gMDsgbi5jaGFyQXQoaSkgPT0gJzAnOyBpKyspIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpID09IChuTCA9IG4ubGVuZ3RoKSkge1xyXG5cclxuICAgICAgICAgICAgLy8gWmVyby5cclxuICAgICAgICAgICAgeC5jID0gWyB4LmUgPSAwIF07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIERldGVybWluZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yICg7IG4uY2hhckF0KC0tbkwpID09ICcwJzspIHtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgeC5lID0gZSAtIGkgLSAxO1xyXG4gICAgICAgICAgICB4LmMgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIC8vIENvbnZlcnQgc3RyaW5nIHRvIGFycmF5IG9mIGRpZ2l0cyB3aXRob3V0IGxlYWRpbmcvdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoZSA9IDA7IGkgPD0gbkw7IHguY1tlKytdID0gK24uY2hhckF0KGkrKykpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSb3VuZCBCaWcgeCB0byBhIG1heGltdW0gb2YgZHAgZGVjaW1hbCBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBybS5cclxuICAgICAqIENhbGxlZCBieSBkaXYsIHNxcnQgYW5kIHJvdW5kLlxyXG4gICAgICpcclxuICAgICAqIHgge0JpZ30gVGhlIEJpZyB0byByb3VuZC5cclxuICAgICAqIGRwIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqIHJtIHtudW1iZXJ9IDAsIDEsIDIgb3IgMyAoRE9XTiwgSEFMRl9VUCwgSEFMRl9FVkVOLCBVUClcclxuICAgICAqIFttb3JlXSB7Ym9vbGVhbn0gV2hldGhlciB0aGUgcmVzdWx0IG9mIGRpdmlzaW9uIHdhcyB0cnVuY2F0ZWQuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHJuZCh4LCBkcCwgcm0sIG1vcmUpIHtcclxuICAgICAgICB2YXIgdSxcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIGkgPSB4LmUgKyBkcCArIDE7XHJcblxyXG4gICAgICAgIGlmIChybSA9PT0gMSkge1xyXG5cclxuICAgICAgICAgICAgLy8geGNbaV0gaXMgdGhlIGRpZ2l0IGFmdGVyIHRoZSBkaWdpdCB0aGF0IG1heSBiZSByb3VuZGVkIHVwLlxyXG4gICAgICAgICAgICBtb3JlID0geGNbaV0gPj0gNTtcclxuICAgICAgICB9IGVsc2UgaWYgKHJtID09PSAyKSB7XHJcbiAgICAgICAgICAgIG1vcmUgPSB4Y1tpXSA+IDUgfHwgeGNbaV0gPT0gNSAmJlxyXG4gICAgICAgICAgICAgIChtb3JlIHx8IGkgPCAwIHx8IHhjW2kgKyAxXSAhPT0gdSB8fCB4Y1tpIC0gMV0gJiAxKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHJtID09PSAzKSB7XHJcbiAgICAgICAgICAgIG1vcmUgPSBtb3JlIHx8IHhjW2ldICE9PSB1IHx8IGkgPCAwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG1vcmUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIGlmIChybSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3dFcnIoJyFCaWcuUk0hJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpIDwgMSB8fCAheGNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChtb3JlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gMSwgMC4xLCAwLjAxLCAwLjAwMSwgMC4wMDAxIGV0Yy5cclxuICAgICAgICAgICAgICAgIHguZSA9IC1kcDtcclxuICAgICAgICAgICAgICAgIHguYyA9IFsxXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBaZXJvLlxyXG4gICAgICAgICAgICAgICAgeC5jID0gW3guZSA9IDBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSBhbnkgZGlnaXRzIGFmdGVyIHRoZSByZXF1aXJlZCBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAgICAgICAgeGMubGVuZ3RoID0gaS0tO1xyXG5cclxuICAgICAgICAgICAgLy8gUm91bmQgdXA/XHJcbiAgICAgICAgICAgIGlmIChtb3JlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gUm91bmRpbmcgdXAgbWF5IG1lYW4gdGhlIHByZXZpb3VzIGRpZ2l0IGhhcyB0byBiZSByb3VuZGVkIHVwLlxyXG4gICAgICAgICAgICAgICAgZm9yICg7ICsreGNbaV0gPiA5Oykge1xyXG4gICAgICAgICAgICAgICAgICAgIHhjW2ldID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpLS0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyt4LmU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhjLnVuc2hpZnQoMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoaSA9IHhjLmxlbmd0aDsgIXhjWy0taV07IHhjLnBvcCgpKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhyb3cgYSBCaWdFcnJvci5cclxuICAgICAqXHJcbiAgICAgKiBtZXNzYWdlIHtzdHJpbmd9IFRoZSBlcnJvciBtZXNzYWdlLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiB0aHJvd0VycihtZXNzYWdlKSB7XHJcbiAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcclxuICAgICAgICBlcnIubmFtZSA9ICdCaWdFcnJvcic7XHJcblxyXG4gICAgICAgIHRocm93IGVycjtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gUHJvdG90eXBlL2luc3RhbmNlIG1ldGhvZHNcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIGFic29sdXRlIHZhbHVlIG9mIHRoaXMgQmlnLlxyXG4gICAgICovXHJcbiAgICBQLmFicyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgeCA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKHRoaXMpO1xyXG4gICAgICAgIHgucyA9IDE7XHJcblxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVyblxyXG4gICAgICogMSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZ3JlYXRlciB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSxcclxuICAgICAqIC0xIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBsZXNzIHRoYW4gdGhlIHZhbHVlIG9mIEJpZyB5LCBvclxyXG4gICAgICogMCBpZiB0aGV5IGhhdmUgdGhlIHNhbWUgdmFsdWUuXHJcbiAgICAqL1xyXG4gICAgUC5jbXAgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciB4TmVnLFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIHljID0gKHkgPSBuZXcgeC5jb25zdHJ1Y3Rvcih5KSkuYyxcclxuICAgICAgICAgICAgaSA9IHgucyxcclxuICAgICAgICAgICAgaiA9IHkucyxcclxuICAgICAgICAgICAgayA9IHguZSxcclxuICAgICAgICAgICAgbCA9IHkuZTtcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuICF4Y1swXSA/ICF5Y1swXSA/IDAgOiAtaiA6IGk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTaWducyBkaWZmZXI/XHJcbiAgICAgICAgaWYgKGkgIT0gaikge1xyXG4gICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICB9XHJcbiAgICAgICAgeE5lZyA9IGkgPCAwO1xyXG5cclxuICAgICAgICAvLyBDb21wYXJlIGV4cG9uZW50cy5cclxuICAgICAgICBpZiAoayAhPSBsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBrID4gbCBeIHhOZWcgPyAxIDogLTE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpID0gLTE7XHJcbiAgICAgICAgaiA9IChrID0geGMubGVuZ3RoKSA8IChsID0geWMubGVuZ3RoKSA/IGsgOiBsO1xyXG5cclxuICAgICAgICAvLyBDb21wYXJlIGRpZ2l0IGJ5IGRpZ2l0LlxyXG4gICAgICAgIGZvciAoOyArK2kgPCBqOykge1xyXG5cclxuICAgICAgICAgICAgaWYgKHhjW2ldICE9IHljW2ldKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geGNbaV0gPiB5Y1tpXSBeIHhOZWcgPyAxIDogLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgbGVuZ3Rocy5cclxuICAgICAgICByZXR1cm4gayA9PSBsID8gMCA6IGsgPiBsIF4geE5lZyA/IDEgOiAtMTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBkaXZpZGVkIGJ5IHRoZVxyXG4gICAgICogdmFsdWUgb2YgQmlnIHksIHJvdW5kZWQsIGlmIG5lY2Vzc2FyeSwgdG8gYSBtYXhpbXVtIG9mIEJpZy5EUCBkZWNpbWFsXHJcbiAgICAgKiBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBCaWcuUk0uXHJcbiAgICAgKi9cclxuICAgIFAuZGl2ID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIC8vIGRpdmlkZW5kXHJcbiAgICAgICAgICAgIGR2ZCA9IHguYyxcclxuICAgICAgICAgICAgLy9kaXZpc29yXHJcbiAgICAgICAgICAgIGR2cyA9ICh5ID0gbmV3IEJpZyh5KSkuYyxcclxuICAgICAgICAgICAgcyA9IHgucyA9PSB5LnMgPyAxIDogLTEsXHJcbiAgICAgICAgICAgIGRwID0gQmlnLkRQO1xyXG5cclxuICAgICAgICBpZiAoZHAgIT09IH5+ZHAgfHwgZHAgPCAwIHx8IGRwID4gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchQmlnLkRQIScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIDA/XHJcbiAgICAgICAgaWYgKCFkdmRbMF0gfHwgIWR2c1swXSkge1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgYm90aCBhcmUgMCwgdGhyb3cgTmFOXHJcbiAgICAgICAgICAgIGlmIChkdmRbMF0gPT0gZHZzWzBdKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvd0VycihOYU4pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBkdnMgaXMgMCwgdGhyb3cgKy1JbmZpbml0eS5cclxuICAgICAgICAgICAgaWYgKCFkdnNbMF0pIHtcclxuICAgICAgICAgICAgICAgIHRocm93RXJyKHMgLyAwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gZHZkIGlzIDAsIHJldHVybiArLTAuXHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnKHMgKiAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBkdnNMLCBkdnNULCBuZXh0LCBjbXAsIHJlbUksIHUsXHJcbiAgICAgICAgICAgIGR2c1ogPSBkdnMuc2xpY2UoKSxcclxuICAgICAgICAgICAgZHZkSSA9IGR2c0wgPSBkdnMubGVuZ3RoLFxyXG4gICAgICAgICAgICBkdmRMID0gZHZkLmxlbmd0aCxcclxuICAgICAgICAgICAgLy8gcmVtYWluZGVyXHJcbiAgICAgICAgICAgIHJlbSA9IGR2ZC5zbGljZSgwLCBkdnNMKSxcclxuICAgICAgICAgICAgcmVtTCA9IHJlbS5sZW5ndGgsXHJcbiAgICAgICAgICAgIC8vIHF1b3RpZW50XHJcbiAgICAgICAgICAgIHEgPSB5LFxyXG4gICAgICAgICAgICBxYyA9IHEuYyA9IFtdLFxyXG4gICAgICAgICAgICBxaSA9IDAsXHJcbiAgICAgICAgICAgIGRpZ2l0cyA9IGRwICsgKHEuZSA9IHguZSAtIHkuZSkgKyAxO1xyXG5cclxuICAgICAgICBxLnMgPSBzO1xyXG4gICAgICAgIHMgPSBkaWdpdHMgPCAwID8gMCA6IGRpZ2l0cztcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIHZlcnNpb24gb2YgZGl2aXNvciB3aXRoIGxlYWRpbmcgemVyby5cclxuICAgICAgICBkdnNaLnVuc2hpZnQoMCk7XHJcblxyXG4gICAgICAgIC8vIEFkZCB6ZXJvcyB0byBtYWtlIHJlbWFpbmRlciBhcyBsb25nIGFzIGRpdmlzb3IuXHJcbiAgICAgICAgZm9yICg7IHJlbUwrKyA8IGR2c0w7IHJlbS5wdXNoKDApKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkbyB7XHJcblxyXG4gICAgICAgICAgICAvLyAnbmV4dCcgaXMgaG93IG1hbnkgdGltZXMgdGhlIGRpdmlzb3IgZ29lcyBpbnRvIGN1cnJlbnQgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICBmb3IgKG5leHQgPSAwOyBuZXh0IDwgMTA7IG5leHQrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENvbXBhcmUgZGl2aXNvciBhbmQgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgaWYgKGR2c0wgIT0gKHJlbUwgPSByZW0ubGVuZ3RoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNtcCA9IGR2c0wgPiByZW1MID8gMSA6IC0xO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChyZW1JID0gLTEsIGNtcCA9IDA7ICsrcmVtSSA8IGR2c0w7KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZHZzW3JlbUldICE9IHJlbVtyZW1JXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY21wID0gZHZzW3JlbUldID4gcmVtW3JlbUldID8gMSA6IC0xO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gSWYgZGl2aXNvciA8IHJlbWFpbmRlciwgc3VidHJhY3QgZGl2aXNvciBmcm9tIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgIGlmIChjbXAgPCAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlbWFpbmRlciBjYW4ndCBiZSBtb3JlIHRoYW4gMSBkaWdpdCBsb25nZXIgdGhhbiBkaXZpc29yLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEVxdWFsaXNlIGxlbmd0aHMgdXNpbmcgZGl2aXNvciB3aXRoIGV4dHJhIGxlYWRpbmcgemVybz9cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGR2c1QgPSByZW1MID09IGR2c0wgPyBkdnMgOiBkdnNaOyByZW1MOykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlbVstLXJlbUxdIDwgZHZzVFtyZW1MXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtSSA9IHJlbUw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICg7IHJlbUkgJiYgIXJlbVstLXJlbUldOyByZW1bcmVtSV0gPSA5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAtLXJlbVtyZW1JXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbVtyZW1MXSArPSAxMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1bcmVtTF0gLT0gZHZzVFtyZW1MXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICg7ICFyZW1bMF07IHJlbS5zaGlmdCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQWRkIHRoZSAnbmV4dCcgZGlnaXQgdG8gdGhlIHJlc3VsdCBhcnJheS5cclxuICAgICAgICAgICAgcWNbcWkrK10gPSBjbXAgPyBuZXh0IDogKytuZXh0O1xyXG5cclxuICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSByZW1haW5kZXIuXHJcbiAgICAgICAgICAgIGlmIChyZW1bMF0gJiYgY21wKSB7XHJcbiAgICAgICAgICAgICAgICByZW1bcmVtTF0gPSBkdmRbZHZkSV0gfHwgMDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlbSA9IFsgZHZkW2R2ZEldIF07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSB3aGlsZSAoKGR2ZEkrKyA8IGR2ZEwgfHwgcmVtWzBdICE9PSB1KSAmJiBzLS0pO1xyXG5cclxuICAgICAgICAvLyBMZWFkaW5nIHplcm8/IERvIG5vdCByZW1vdmUgaWYgcmVzdWx0IGlzIHNpbXBseSB6ZXJvIChxaSA9PSAxKS5cclxuICAgICAgICBpZiAoIXFjWzBdICYmIHFpICE9IDEpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZXJlIGNhbid0IGJlIG1vcmUgdGhhbiBvbmUgemVyby5cclxuICAgICAgICAgICAgcWMuc2hpZnQoKTtcclxuICAgICAgICAgICAgcS5lLS07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSb3VuZD9cclxuICAgICAgICBpZiAocWkgPiBkaWdpdHMpIHtcclxuICAgICAgICAgICAgcm5kKHEsIGRwLCBCaWcuUk0sIHJlbVswXSAhPT0gdSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZXF1YWwgdG8gdGhlIHZhbHVlIG9mIEJpZyB5LFxyXG4gICAgICogb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAuZXEgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHJldHVybiAhdGhpcy5jbXAoeSk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGdyZWF0ZXIgdGhhbiB0aGUgdmFsdWUgb2YgQmlnIHksXHJcbiAgICAgKiBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5ndCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY21wKHkpID4gMDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIHRoZVxyXG4gICAgICogdmFsdWUgb2YgQmlnIHksIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmd0ZSA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY21wKHkpID4gLTE7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGxlc3MgdGhhbiB0aGUgdmFsdWUgb2YgQmlnIHksXHJcbiAgICAgKiBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5sdCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY21wKHkpIDwgMDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIHRoZSB2YWx1ZVxyXG4gICAgICogb2YgQmlnIHksIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmx0ZSA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgIHJldHVybiB0aGlzLmNtcCh5KSA8IDE7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgbWludXMgdGhlIHZhbHVlXHJcbiAgICAgKiBvZiBCaWcgeS5cclxuICAgICAqL1xyXG4gICAgUC5zdWIgPSBQLm1pbnVzID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgaSwgaiwgdCwgeExUeSxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIGEgPSB4LnMsXHJcbiAgICAgICAgICAgIGIgPSAoeSA9IG5ldyBCaWcoeSkpLnM7XHJcblxyXG4gICAgICAgIC8vIFNpZ25zIGRpZmZlcj9cclxuICAgICAgICBpZiAoYSAhPSBiKSB7XHJcbiAgICAgICAgICAgIHkucyA9IC1iO1xyXG4gICAgICAgICAgICByZXR1cm4geC5wbHVzKHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHhjID0geC5jLnNsaWNlKCksXHJcbiAgICAgICAgICAgIHhlID0geC5lLFxyXG4gICAgICAgICAgICB5YyA9IHkuYyxcclxuICAgICAgICAgICAgeWUgPSB5LmU7XHJcblxyXG4gICAgICAgIC8vIEVpdGhlciB6ZXJvP1xyXG4gICAgICAgIGlmICgheGNbMF0gfHwgIXljWzBdKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB5IGlzIG5vbi16ZXJvPyB4IGlzIG5vbi16ZXJvPyBPciBib3RoIGFyZSB6ZXJvLlxyXG4gICAgICAgICAgICByZXR1cm4geWNbMF0gPyAoeS5zID0gLWIsIHkpIDogbmV3IEJpZyh4Y1swXSA/IHggOiAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSB3aGljaCBpcyB0aGUgYmlnZ2VyIG51bWJlci5cclxuICAgICAgICAvLyBQcmVwZW5kIHplcm9zIHRvIGVxdWFsaXNlIGV4cG9uZW50cy5cclxuICAgICAgICBpZiAoYSA9IHhlIC0geWUpIHtcclxuXHJcbiAgICAgICAgICAgIGlmICh4TFR5ID0gYSA8IDApIHtcclxuICAgICAgICAgICAgICAgIGEgPSAtYTtcclxuICAgICAgICAgICAgICAgIHQgPSB4YztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHllID0geGU7XHJcbiAgICAgICAgICAgICAgICB0ID0geWM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG4gICAgICAgICAgICBmb3IgKGIgPSBhOyBiLS07IHQucHVzaCgwKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBFeHBvbmVudHMgZXF1YWwuIENoZWNrIGRpZ2l0IGJ5IGRpZ2l0LlxyXG4gICAgICAgICAgICBqID0gKCh4TFR5ID0geGMubGVuZ3RoIDwgeWMubGVuZ3RoKSA/IHhjIDogeWMpLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIGZvciAoYSA9IGIgPSAwOyBiIDwgajsgYisrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHhjW2JdICE9IHljW2JdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeExUeSA9IHhjW2JdIDwgeWNbYl07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHggPCB5PyBQb2ludCB4YyB0byB0aGUgYXJyYXkgb2YgdGhlIGJpZ2dlciBudW1iZXIuXHJcbiAgICAgICAgaWYgKHhMVHkpIHtcclxuICAgICAgICAgICAgdCA9IHhjO1xyXG4gICAgICAgICAgICB4YyA9IHljO1xyXG4gICAgICAgICAgICB5YyA9IHQ7XHJcbiAgICAgICAgICAgIHkucyA9IC15LnM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIEFwcGVuZCB6ZXJvcyB0byB4YyBpZiBzaG9ydGVyLiBObyBuZWVkIHRvIGFkZCB6ZXJvcyB0byB5YyBpZiBzaG9ydGVyXHJcbiAgICAgICAgICogYXMgc3VidHJhY3Rpb24gb25seSBuZWVkcyB0byBzdGFydCBhdCB5Yy5sZW5ndGguXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaWYgKCggYiA9IChqID0geWMubGVuZ3RoKSAtIChpID0geGMubGVuZ3RoKSApID4gMCkge1xyXG5cclxuICAgICAgICAgICAgZm9yICg7IGItLTsgeGNbaSsrXSA9IDApIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU3VidHJhY3QgeWMgZnJvbSB4Yy5cclxuICAgICAgICBmb3IgKGIgPSBpOyBqID4gYTspe1xyXG5cclxuICAgICAgICAgICAgaWYgKHhjWy0tal0gPCB5Y1tqXSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IGo7IGkgJiYgIXhjWy0taV07IHhjW2ldID0gOSkge1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLS14Y1tpXTtcclxuICAgICAgICAgICAgICAgIHhjW2pdICs9IDEwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHhjW2pdIC09IHljW2pdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgIGZvciAoOyB4Y1stLWJdID09PSAwOyB4Yy5wb3AoKSkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIGxlYWRpbmcgemVyb3MgYW5kIGFkanVzdCBleHBvbmVudCBhY2NvcmRpbmdseS5cclxuICAgICAgICBmb3IgKDsgeGNbMF0gPT09IDA7KSB7XHJcbiAgICAgICAgICAgIHhjLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIC0teWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXhjWzBdKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBuIC0gbiA9ICswXHJcbiAgICAgICAgICAgIHkucyA9IDE7XHJcblxyXG4gICAgICAgICAgICAvLyBSZXN1bHQgbXVzdCBiZSB6ZXJvLlxyXG4gICAgICAgICAgICB4YyA9IFt5ZSA9IDBdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgeS5jID0geGM7XHJcbiAgICAgICAgeS5lID0geWU7XHJcblxyXG4gICAgICAgIHJldHVybiB5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIG1vZHVsbyB0aGVcclxuICAgICAqIHZhbHVlIG9mIEJpZyB5LlxyXG4gICAgICovXHJcbiAgICBQLm1vZCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIHlHVHgsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBhID0geC5zLFxyXG4gICAgICAgICAgICBiID0gKHkgPSBuZXcgQmlnKHkpKS5zO1xyXG5cclxuICAgICAgICBpZiAoIXkuY1swXSkge1xyXG4gICAgICAgICAgICB0aHJvd0VycihOYU4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgeC5zID0geS5zID0gMTtcclxuICAgICAgICB5R1R4ID0geS5jbXAoeCkgPT0gMTtcclxuICAgICAgICB4LnMgPSBhO1xyXG4gICAgICAgIHkucyA9IGI7XHJcblxyXG4gICAgICAgIGlmICh5R1R4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnKHgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYSA9IEJpZy5EUDtcclxuICAgICAgICBiID0gQmlnLlJNO1xyXG4gICAgICAgIEJpZy5EUCA9IEJpZy5STSA9IDA7XHJcbiAgICAgICAgeCA9IHguZGl2KHkpO1xyXG4gICAgICAgIEJpZy5EUCA9IGE7XHJcbiAgICAgICAgQmlnLlJNID0gYjtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWludXMoIHgudGltZXMoeSkgKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBwbHVzIHRoZSB2YWx1ZVxyXG4gICAgICogb2YgQmlnIHkuXHJcbiAgICAgKi9cclxuICAgIFAuYWRkID0gUC5wbHVzID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgdCxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIGEgPSB4LnMsXHJcbiAgICAgICAgICAgIGIgPSAoeSA9IG5ldyBCaWcoeSkpLnM7XHJcblxyXG4gICAgICAgIC8vIFNpZ25zIGRpZmZlcj9cclxuICAgICAgICBpZiAoYSAhPSBiKSB7XHJcbiAgICAgICAgICAgIHkucyA9IC1iO1xyXG4gICAgICAgICAgICByZXR1cm4geC5taW51cyh5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciB4ZSA9IHguZSxcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIHllID0geS5lLFxyXG4gICAgICAgICAgICB5YyA9IHkuYztcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHkgaXMgbm9uLXplcm8/IHggaXMgbm9uLXplcm8/IE9yIGJvdGggYXJlIHplcm8uXHJcbiAgICAgICAgICAgIHJldHVybiB5Y1swXSA/IHkgOiBuZXcgQmlnKHhjWzBdID8geCA6IGEgKiAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgeGMgPSB4Yy5zbGljZSgpO1xyXG5cclxuICAgICAgICAvLyBQcmVwZW5kIHplcm9zIHRvIGVxdWFsaXNlIGV4cG9uZW50cy5cclxuICAgICAgICAvLyBOb3RlOiBGYXN0ZXIgdG8gdXNlIHJldmVyc2UgdGhlbiBkbyB1bnNoaWZ0cy5cclxuICAgICAgICBpZiAoYSA9IHhlIC0geWUpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChhID4gMCkge1xyXG4gICAgICAgICAgICAgICAgeWUgPSB4ZTtcclxuICAgICAgICAgICAgICAgIHQgPSB5YztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGEgPSAtYTtcclxuICAgICAgICAgICAgICAgIHQgPSB4YztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgIGZvciAoOyBhLS07IHQucHVzaCgwKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUG9pbnQgeGMgdG8gdGhlIGxvbmdlciBhcnJheS5cclxuICAgICAgICBpZiAoeGMubGVuZ3RoIC0geWMubGVuZ3RoIDwgMCkge1xyXG4gICAgICAgICAgICB0ID0geWM7XHJcbiAgICAgICAgICAgIHljID0geGM7XHJcbiAgICAgICAgICAgIHhjID0gdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgYSA9IHljLmxlbmd0aDtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBPbmx5IHN0YXJ0IGFkZGluZyBhdCB5Yy5sZW5ndGggLSAxIGFzIHRoZSBmdXJ0aGVyIGRpZ2l0cyBvZiB4YyBjYW4gYmVcclxuICAgICAgICAgKiBsZWZ0IGFzIHRoZXkgYXJlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZvciAoYiA9IDA7IGE7KSB7XHJcbiAgICAgICAgICAgIGIgPSAoeGNbLS1hXSA9IHhjW2FdICsgeWNbYV0gKyBiKSAvIDEwIHwgMDtcclxuICAgICAgICAgICAgeGNbYV0gJT0gMTA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBObyBuZWVkIHRvIGNoZWNrIGZvciB6ZXJvLCBhcyAreCArICt5ICE9IDAgJiYgLXggKyAteSAhPSAwXHJcblxyXG4gICAgICAgIGlmIChiKSB7XHJcbiAgICAgICAgICAgIHhjLnVuc2hpZnQoYik7XHJcbiAgICAgICAgICAgICsreWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgIGZvciAoYSA9IHhjLmxlbmd0aDsgeGNbLS1hXSA9PT0gMDsgeGMucG9wKCkpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHkuYyA9IHhjO1xyXG4gICAgICAgIHkuZSA9IHllO1xyXG5cclxuICAgICAgICByZXR1cm4geTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHJhaXNlZCB0byB0aGUgcG93ZXIgbi5cclxuICAgICAqIElmIG4gaXMgbmVnYXRpdmUsIHJvdW5kLCBpZiBuZWNlc3NhcnksIHRvIGEgbWF4aW11bSBvZiBCaWcuRFAgZGVjaW1hbFxyXG4gICAgICogcGxhY2VzIHVzaW5nIHJvdW5kaW5nIG1vZGUgQmlnLlJNLlxyXG4gICAgICpcclxuICAgICAqIG4ge251bWJlcn0gSW50ZWdlciwgLU1BWF9QT1dFUiB0byBNQVhfUE9XRVIgaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBQLnBvdyA9IGZ1bmN0aW9uIChuKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBvbmUgPSBuZXcgeC5jb25zdHJ1Y3RvcigxKSxcclxuICAgICAgICAgICAgeSA9IG9uZSxcclxuICAgICAgICAgICAgaXNOZWcgPSBuIDwgMDtcclxuXHJcbiAgICAgICAgaWYgKG4gIT09IH5+biB8fCBuIDwgLU1BWF9QT1dFUiB8fCBuID4gTUFYX1BPV0VSKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchcG93IScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbiA9IGlzTmVnID8gLW4gOiBuO1xyXG5cclxuICAgICAgICBmb3IgKDs7KSB7XHJcblxyXG4gICAgICAgICAgICBpZiAobiAmIDEpIHtcclxuICAgICAgICAgICAgICAgIHkgPSB5LnRpbWVzKHgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG4gPj49IDE7XHJcblxyXG4gICAgICAgICAgICBpZiAoIW4pIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHggPSB4LnRpbWVzKHgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGlzTmVnID8gb25lLmRpdih5KSA6IHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgcm91bmRlZCB0byBhXHJcbiAgICAgKiBtYXhpbXVtIG9mIGRwIGRlY2ltYWwgcGxhY2VzIHVzaW5nIHJvdW5kaW5nIG1vZGUgcm0uXHJcbiAgICAgKiBJZiBkcCBpcyBub3Qgc3BlY2lmaWVkLCByb3VuZCB0byAwIGRlY2ltYWwgcGxhY2VzLlxyXG4gICAgICogSWYgcm0gaXMgbm90IHNwZWNpZmllZCwgdXNlIEJpZy5STS5cclxuICAgICAqXHJcbiAgICAgKiBbZHBdIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqIFtybV0gMCwgMSwgMiBvciAzIChST1VORF9ET1dOLCBST1VORF9IQUxGX1VQLCBST1VORF9IQUxGX0VWRU4sIFJPVU5EX1VQKVxyXG4gICAgICovXHJcbiAgICBQLnJvdW5kID0gZnVuY3Rpb24gKGRwLCBybSkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcjtcclxuXHJcbiAgICAgICAgaWYgKGRwID09IG51bGwpIHtcclxuICAgICAgICAgICAgZHAgPSAwO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZHAgIT09IH5+ZHAgfHwgZHAgPCAwIHx8IGRwID4gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchcm91bmQhJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJuZCh4ID0gbmV3IEJpZyh4KSwgZHAsIHJtID09IG51bGwgPyBCaWcuUk0gOiBybSk7XHJcblxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHNxdWFyZSByb290IG9mIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyxcclxuICAgICAqIHJvdW5kZWQsIGlmIG5lY2Vzc2FyeSwgdG8gYSBtYXhpbXVtIG9mIEJpZy5EUCBkZWNpbWFsIHBsYWNlcyB1c2luZ1xyXG4gICAgICogcm91bmRpbmcgbW9kZSBCaWcuUk0uXHJcbiAgICAgKi9cclxuICAgIFAuc3FydCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgZXN0aW1hdGUsIHIsIGFwcHJveCxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICBpID0geC5zLFxyXG4gICAgICAgICAgICBlID0geC5lLFxyXG4gICAgICAgICAgICBoYWxmID0gbmV3IEJpZygnMC41Jyk7XHJcblxyXG4gICAgICAgIC8vIFplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEJpZyh4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIG5lZ2F0aXZlLCB0aHJvdyBOYU4uXHJcbiAgICAgICAgaWYgKGkgPCAwKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKE5hTik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFc3RpbWF0ZS5cclxuICAgICAgICBpID0gTWF0aC5zcXJ0KHgudG9TdHJpbmcoKSk7XHJcblxyXG4gICAgICAgIC8vIE1hdGguc3FydCB1bmRlcmZsb3cvb3ZlcmZsb3c/XHJcbiAgICAgICAgLy8gUGFzcyB4IHRvIE1hdGguc3FydCBhcyBpbnRlZ2VyLCB0aGVuIGFkanVzdCB0aGUgcmVzdWx0IGV4cG9uZW50LlxyXG4gICAgICAgIGlmIChpID09PSAwIHx8IGkgPT09IDEgLyAwKSB7XHJcbiAgICAgICAgICAgIGVzdGltYXRlID0geGMuam9pbignJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIShlc3RpbWF0ZS5sZW5ndGggKyBlICYgMSkpIHtcclxuICAgICAgICAgICAgICAgIGVzdGltYXRlICs9ICcwJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgciA9IG5ldyBCaWcoIE1hdGguc3FydChlc3RpbWF0ZSkudG9TdHJpbmcoKSApO1xyXG4gICAgICAgICAgICByLmUgPSAoKGUgKyAxKSAvIDIgfCAwKSAtIChlIDwgMCB8fCBlICYgMSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgciA9IG5ldyBCaWcoaS50b1N0cmluZygpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGkgPSByLmUgKyAoQmlnLkRQICs9IDQpO1xyXG5cclxuICAgICAgICAvLyBOZXd0b24tUmFwaHNvbiBpdGVyYXRpb24uXHJcbiAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICBhcHByb3ggPSByO1xyXG4gICAgICAgICAgICByID0gaGFsZi50aW1lcyggYXBwcm94LnBsdXMoIHguZGl2KGFwcHJveCkgKSApO1xyXG4gICAgICAgIH0gd2hpbGUgKCBhcHByb3guYy5zbGljZSgwLCBpKS5qb2luKCcnKSAhPT1cclxuICAgICAgICAgICAgICAgICAgICAgICByLmMuc2xpY2UoMCwgaSkuam9pbignJykgKTtcclxuXHJcbiAgICAgICAgcm5kKHIsIEJpZy5EUCAtPSA0LCBCaWcuUk0pO1xyXG5cclxuICAgICAgICByZXR1cm4gcjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyB0aW1lcyB0aGUgdmFsdWUgb2ZcclxuICAgICAqIEJpZyB5LlxyXG4gICAgICovXHJcbiAgICBQLm11bCA9IFAudGltZXMgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciBjLFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIHljID0gKHkgPSBuZXcgQmlnKHkpKS5jLFxyXG4gICAgICAgICAgICBhID0geGMubGVuZ3RoLFxyXG4gICAgICAgICAgICBiID0geWMubGVuZ3RoLFxyXG4gICAgICAgICAgICBpID0geC5lLFxyXG4gICAgICAgICAgICBqID0geS5lO1xyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgc2lnbiBvZiByZXN1bHQuXHJcbiAgICAgICAgeS5zID0geC5zID09IHkucyA/IDEgOiAtMTtcclxuXHJcbiAgICAgICAgLy8gUmV0dXJuIHNpZ25lZCAwIGlmIGVpdGhlciAwLlxyXG4gICAgICAgIGlmICgheGNbMF0gfHwgIXljWzBdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnKHkucyAqIDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGlzZSBleHBvbmVudCBvZiByZXN1bHQgYXMgeC5lICsgeS5lLlxyXG4gICAgICAgIHkuZSA9IGkgKyBqO1xyXG5cclxuICAgICAgICAvLyBJZiBhcnJheSB4YyBoYXMgZmV3ZXIgZGlnaXRzIHRoYW4geWMsIHN3YXAgeGMgYW5kIHljLCBhbmQgbGVuZ3Rocy5cclxuICAgICAgICBpZiAoYSA8IGIpIHtcclxuICAgICAgICAgICAgYyA9IHhjO1xyXG4gICAgICAgICAgICB4YyA9IHljO1xyXG4gICAgICAgICAgICB5YyA9IGM7XHJcbiAgICAgICAgICAgIGogPSBhO1xyXG4gICAgICAgICAgICBhID0gYjtcclxuICAgICAgICAgICAgYiA9IGo7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXNlIGNvZWZmaWNpZW50IGFycmF5IG9mIHJlc3VsdCB3aXRoIHplcm9zLlxyXG4gICAgICAgIGZvciAoYyA9IG5ldyBBcnJheShqID0gYSArIGIpOyBqLS07IGNbal0gPSAwKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBNdWx0aXBseS5cclxuXHJcbiAgICAgICAgLy8gaSBpcyBpbml0aWFsbHkgeGMubGVuZ3RoLlxyXG4gICAgICAgIGZvciAoaSA9IGI7IGktLTspIHtcclxuICAgICAgICAgICAgYiA9IDA7XHJcblxyXG4gICAgICAgICAgICAvLyBhIGlzIHljLmxlbmd0aC5cclxuICAgICAgICAgICAgZm9yIChqID0gYSArIGk7IGogPiBpOykge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEN1cnJlbnQgc3VtIG9mIHByb2R1Y3RzIGF0IHRoaXMgZGlnaXQgcG9zaXRpb24sIHBsdXMgY2FycnkuXHJcbiAgICAgICAgICAgICAgICBiID0gY1tqXSArIHljW2ldICogeGNbaiAtIGkgLSAxXSArIGI7XHJcbiAgICAgICAgICAgICAgICBjW2otLV0gPSBiICUgMTA7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gY2FycnlcclxuICAgICAgICAgICAgICAgIGIgPSBiIC8gMTAgfCAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNbal0gPSAoY1tqXSArIGIpICUgMTA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJbmNyZW1lbnQgcmVzdWx0IGV4cG9uZW50IGlmIHRoZXJlIGlzIGEgZmluYWwgY2FycnkuXHJcbiAgICAgICAgaWYgKGIpIHtcclxuICAgICAgICAgICAgKyt5LmU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgYW55IGxlYWRpbmcgemVyby5cclxuICAgICAgICBpZiAoIWNbMF0pIHtcclxuICAgICAgICAgICAgYy5zaGlmdCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgIGZvciAoaSA9IGMubGVuZ3RoOyAhY1stLWldOyBjLnBvcCgpKSB7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHkuYyA9IGM7XHJcblxyXG4gICAgICAgIHJldHVybiB5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnLlxyXG4gICAgICogUmV0dXJuIGV4cG9uZW50aWFsIG5vdGF0aW9uIGlmIHRoaXMgQmlnIGhhcyBhIHBvc2l0aXZlIGV4cG9uZW50IGVxdWFsIHRvXHJcbiAgICAgKiBvciBncmVhdGVyIHRoYW4gQmlnLkVfUE9TLCBvciBhIG5lZ2F0aXZlIGV4cG9uZW50IGVxdWFsIHRvIG9yIGxlc3MgdGhhblxyXG4gICAgICogQmlnLkVfTkVHLlxyXG4gICAgICovXHJcbiAgICBQLnRvU3RyaW5nID0gUC52YWx1ZU9mID0gUC50b0pTT04gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBlID0geC5lLFxyXG4gICAgICAgICAgICBzdHIgPSB4LmMuam9pbignJyksXHJcbiAgICAgICAgICAgIHN0ckwgPSBzdHIubGVuZ3RoO1xyXG5cclxuICAgICAgICAvLyBFeHBvbmVudGlhbCBub3RhdGlvbj9cclxuICAgICAgICBpZiAoZSA8PSBCaWcuRV9ORUcgfHwgZSA+PSBCaWcuRV9QT1MpIHtcclxuICAgICAgICAgICAgc3RyID0gc3RyLmNoYXJBdCgwKSArIChzdHJMID4gMSA/ICcuJyArIHN0ci5zbGljZSgxKSA6ICcnKSArXHJcbiAgICAgICAgICAgICAgKGUgPCAwID8gJ2UnIDogJ2UrJykgKyBlO1xyXG5cclxuICAgICAgICAvLyBOZWdhdGl2ZSBleHBvbmVudD9cclxuICAgICAgICB9IGVsc2UgaWYgKGUgPCAwKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBQcmVwZW5kIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKDsgKytlOyBzdHIgPSAnMCcgKyBzdHIpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdHIgPSAnMC4nICsgc3RyO1xyXG5cclxuICAgICAgICAvLyBQb3NpdGl2ZSBleHBvbmVudD9cclxuICAgICAgICB9IGVsc2UgaWYgKGUgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoKytlID4gc3RyTCkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEFwcGVuZCB6ZXJvcy5cclxuICAgICAgICAgICAgICAgIGZvciAoZSAtPSBzdHJMOyBlLS0gOyBzdHIgKz0gJzAnKSB7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZSA8IHN0ckwpIHtcclxuICAgICAgICAgICAgICAgIHN0ciA9IHN0ci5zbGljZSgwLCBlKSArICcuJyArIHN0ci5zbGljZShlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFeHBvbmVudCB6ZXJvLlxyXG4gICAgICAgIH0gZWxzZSBpZiAoc3RyTCA+IDEpIHtcclxuICAgICAgICAgICAgc3RyID0gc3RyLmNoYXJBdCgwKSArICcuJyArIHN0ci5zbGljZSgxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEF2b2lkICctMCdcclxuICAgICAgICByZXR1cm4geC5zIDwgMCAmJiB4LmNbMF0gPyAnLScgKyBzdHIgOiBzdHI7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICogSWYgdG9FeHBvbmVudGlhbCwgdG9GaXhlZCwgdG9QcmVjaXNpb24gYW5kIGZvcm1hdCBhcmUgbm90IHJlcXVpcmVkIHRoZXlcclxuICAgICAqIGNhbiBzYWZlbHkgYmUgY29tbWVudGVkLW91dCBvciBkZWxldGVkLiBObyByZWR1bmRhbnQgY29kZSB3aWxsIGJlIGxlZnQuXHJcbiAgICAgKiBmb3JtYXQgaXMgdXNlZCBvbmx5IGJ5IHRvRXhwb25lbnRpYWwsIHRvRml4ZWQgYW5kIHRvUHJlY2lzaW9uLlxyXG4gICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICovXHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpbiBleHBvbmVudGlhbFxyXG4gICAgICogbm90YXRpb24gdG8gZHAgZml4ZWQgZGVjaW1hbCBwbGFjZXMgYW5kIHJvdW5kZWQsIGlmIG5lY2Vzc2FyeSwgdXNpbmdcclxuICAgICAqIEJpZy5STS5cclxuICAgICAqXHJcbiAgICAgKiBbZHBdIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqL1xyXG4gICAgUC50b0V4cG9uZW50aWFsID0gZnVuY3Rpb24gKGRwKSB7XHJcblxyXG4gICAgICAgIGlmIChkcCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGRwID0gdGhpcy5jLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkcCAhPT0gfn5kcCB8fCBkcCA8IDAgfHwgZHAgPiBNQVhfRFApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyF0b0V4cCEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmb3JtYXQodGhpcywgZHAsIDEpO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGluIG5vcm1hbCBub3RhdGlvblxyXG4gICAgICogdG8gZHAgZml4ZWQgZGVjaW1hbCBwbGFjZXMgYW5kIHJvdW5kZWQsIGlmIG5lY2Vzc2FyeSwgdXNpbmcgQmlnLlJNLlxyXG4gICAgICpcclxuICAgICAqIFtkcF0ge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBQLnRvRml4ZWQgPSBmdW5jdGlvbiAoZHApIHtcclxuICAgICAgICB2YXIgc3RyLFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgbmVnID0gQmlnLkVfTkVHLFxyXG4gICAgICAgICAgICBwb3MgPSBCaWcuRV9QT1M7XHJcblxyXG4gICAgICAgIC8vIFByZXZlbnQgdGhlIHBvc3NpYmlsaXR5IG9mIGV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAgICAgIEJpZy5FX05FRyA9IC0oQmlnLkVfUE9TID0gMSAvIDApO1xyXG5cclxuICAgICAgICBpZiAoZHAgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBzdHIgPSB4LnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkcCA9PT0gfn5kcCAmJiBkcCA+PSAwICYmIGRwIDw9IE1BWF9EUCkge1xyXG4gICAgICAgICAgICBzdHIgPSBmb3JtYXQoeCwgeC5lICsgZHApO1xyXG5cclxuICAgICAgICAgICAgLy8gKC0wKS50b0ZpeGVkKCkgaXMgJzAnLCBidXQgKC0wLjEpLnRvRml4ZWQoKSBpcyAnLTAnLlxyXG4gICAgICAgICAgICAvLyAoLTApLnRvRml4ZWQoMSkgaXMgJzAuMCcsIGJ1dCAoLTAuMDEpLnRvRml4ZWQoMSkgaXMgJy0wLjAnLlxyXG4gICAgICAgICAgICBpZiAoeC5zIDwgMCAmJiB4LmNbMF0gJiYgc3RyLmluZGV4T2YoJy0nKSA8IDApIHtcclxuICAgICAgICAvL0UuZy4gLTAuNSBpZiByb3VuZGVkIHRvIC0wIHdpbGwgY2F1c2UgdG9TdHJpbmcgdG8gb21pdCB0aGUgbWludXMgc2lnbi5cclxuICAgICAgICAgICAgICAgIHN0ciA9ICctJyArIHN0cjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBCaWcuRV9ORUcgPSBuZWc7XHJcbiAgICAgICAgQmlnLkVfUE9TID0gcG9zO1xyXG5cclxuICAgICAgICBpZiAoIXN0cikge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXRvRml4IScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHN0cjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyByb3VuZGVkIHRvIHNkXHJcbiAgICAgKiBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgQmlnLlJNLiBVc2UgZXhwb25lbnRpYWwgbm90YXRpb24gaWYgc2QgaXMgbGVzc1xyXG4gICAgICogdGhhbiB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBuZWNlc3NhcnkgdG8gcmVwcmVzZW50IHRoZSBpbnRlZ2VyIHBhcnQgb2YgdGhlXHJcbiAgICAgKiB2YWx1ZSBpbiBub3JtYWwgbm90YXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogc2Qge251bWJlcn0gSW50ZWdlciwgMSB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBQLnRvUHJlY2lzaW9uID0gZnVuY3Rpb24gKHNkKSB7XHJcblxyXG4gICAgICAgIGlmIChzZCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzZCAhPT0gfn5zZCB8fCBzZCA8IDEgfHwgc2QgPiBNQVhfRFApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyF0b1ByZSEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmb3JtYXQodGhpcywgc2QgLSAxLCAyKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8vIEV4cG9ydFxyXG5cclxuXHJcbiAgICBCaWcgPSBiaWdGYWN0b3J5KCk7XHJcblxyXG4gICAgLy9BTUQuXHJcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcbiAgICAgICAgZGVmaW5lKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEJpZztcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAvLyBOb2RlIGFuZCBvdGhlciBDb21tb25KUy1saWtlIGVudmlyb25tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMuXHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XHJcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBCaWc7XHJcblxyXG4gICAgLy9Ccm93c2VyLlxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBnbG9iYWwuQmlnID0gQmlnO1xyXG4gICAgfVxyXG59KSh0aGlzKTtcclxuIiwiOyhmdW5jdGlvbiAoKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHQvKipcblx0ICogQHByZXNlcnZlIEZhc3RDbGljazogcG9seWZpbGwgdG8gcmVtb3ZlIGNsaWNrIGRlbGF5cyBvbiBicm93c2VycyB3aXRoIHRvdWNoIFVJcy5cblx0ICpcblx0ICogQGNvZGluZ3N0YW5kYXJkIGZ0bGFicy1qc3YyXG5cdCAqIEBjb3B5cmlnaHQgVGhlIEZpbmFuY2lhbCBUaW1lcyBMaW1pdGVkIFtBbGwgUmlnaHRzIFJlc2VydmVkXVxuXHQgKiBAbGljZW5zZSBNSVQgTGljZW5zZSAoc2VlIExJQ0VOU0UudHh0KVxuXHQgKi9cblxuXHQvKmpzbGludCBicm93c2VyOnRydWUsIG5vZGU6dHJ1ZSovXG5cdC8qZ2xvYmFsIGRlZmluZSwgRXZlbnQsIE5vZGUqL1xuXG5cblx0LyoqXG5cdCAqIEluc3RhbnRpYXRlIGZhc3QtY2xpY2tpbmcgbGlzdGVuZXJzIG9uIHRoZSBzcGVjaWZpZWQgbGF5ZXIuXG5cdCAqXG5cdCAqIEBjb25zdHJ1Y3RvclxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IGxheWVyIFRoZSBsYXllciB0byBsaXN0ZW4gb25cblx0ICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XSBUaGUgb3B0aW9ucyB0byBvdmVycmlkZSB0aGUgZGVmYXVsdHNcblx0ICovXG5cdGZ1bmN0aW9uIEZhc3RDbGljayhsYXllciwgb3B0aW9ucykge1xuXHRcdHZhciBvbGRPbkNsaWNrO1xuXG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cblx0XHQvKipcblx0XHQgKiBXaGV0aGVyIGEgY2xpY2sgaXMgY3VycmVudGx5IGJlaW5nIHRyYWNrZWQuXG5cdFx0ICpcblx0XHQgKiBAdHlwZSBib29sZWFuXG5cdFx0ICovXG5cdFx0dGhpcy50cmFja2luZ0NsaWNrID0gZmFsc2U7XG5cblxuXHRcdC8qKlxuXHRcdCAqIFRpbWVzdGFtcCBmb3Igd2hlbiBjbGljayB0cmFja2luZyBzdGFydGVkLlxuXHRcdCAqXG5cdFx0ICogQHR5cGUgbnVtYmVyXG5cdFx0ICovXG5cdFx0dGhpcy50cmFja2luZ0NsaWNrU3RhcnQgPSAwO1xuXG5cblx0XHQvKipcblx0XHQgKiBUaGUgZWxlbWVudCBiZWluZyB0cmFja2VkIGZvciBhIGNsaWNrLlxuXHRcdCAqXG5cdFx0ICogQHR5cGUgRXZlbnRUYXJnZXRcblx0XHQgKi9cblx0XHR0aGlzLnRhcmdldEVsZW1lbnQgPSBudWxsO1xuXG5cblx0XHQvKipcblx0XHQgKiBYLWNvb3JkaW5hdGUgb2YgdG91Y2ggc3RhcnQgZXZlbnQuXG5cdFx0ICpcblx0XHQgKiBAdHlwZSBudW1iZXJcblx0XHQgKi9cblx0XHR0aGlzLnRvdWNoU3RhcnRYID0gMDtcblxuXG5cdFx0LyoqXG5cdFx0ICogWS1jb29yZGluYXRlIG9mIHRvdWNoIHN0YXJ0IGV2ZW50LlxuXHRcdCAqXG5cdFx0ICogQHR5cGUgbnVtYmVyXG5cdFx0ICovXG5cdFx0dGhpcy50b3VjaFN0YXJ0WSA9IDA7XG5cblxuXHRcdC8qKlxuXHRcdCAqIElEIG9mIHRoZSBsYXN0IHRvdWNoLCByZXRyaWV2ZWQgZnJvbSBUb3VjaC5pZGVudGlmaWVyLlxuXHRcdCAqXG5cdFx0ICogQHR5cGUgbnVtYmVyXG5cdFx0ICovXG5cdFx0dGhpcy5sYXN0VG91Y2hJZGVudGlmaWVyID0gMDtcblxuXG5cdFx0LyoqXG5cdFx0ICogVG91Y2htb3ZlIGJvdW5kYXJ5LCBiZXlvbmQgd2hpY2ggYSBjbGljayB3aWxsIGJlIGNhbmNlbGxlZC5cblx0XHQgKlxuXHRcdCAqIEB0eXBlIG51bWJlclxuXHRcdCAqL1xuXHRcdHRoaXMudG91Y2hCb3VuZGFyeSA9IG9wdGlvbnMudG91Y2hCb3VuZGFyeSB8fCAxMDtcblxuXG5cdFx0LyoqXG5cdFx0ICogVGhlIEZhc3RDbGljayBsYXllci5cblx0XHQgKlxuXHRcdCAqIEB0eXBlIEVsZW1lbnRcblx0XHQgKi9cblx0XHR0aGlzLmxheWVyID0gbGF5ZXI7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgbWluaW11bSB0aW1lIGJldHdlZW4gdGFwKHRvdWNoc3RhcnQgYW5kIHRvdWNoZW5kKSBldmVudHNcblx0XHQgKlxuXHRcdCAqIEB0eXBlIG51bWJlclxuXHRcdCAqL1xuXHRcdHRoaXMudGFwRGVsYXkgPSBvcHRpb25zLnRhcERlbGF5IHx8IDIwMDtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBtYXhpbXVtIHRpbWUgZm9yIGEgdGFwXG5cdFx0ICpcblx0XHQgKiBAdHlwZSBudW1iZXJcblx0XHQgKi9cblx0XHR0aGlzLnRhcFRpbWVvdXQgPSBvcHRpb25zLnRhcFRpbWVvdXQgfHwgNzAwO1xuXG5cdFx0aWYgKEZhc3RDbGljay5ub3ROZWVkZWQobGF5ZXIpKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gU29tZSBvbGQgdmVyc2lvbnMgb2YgQW5kcm9pZCBkb24ndCBoYXZlIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kXG5cdFx0ZnVuY3Rpb24gYmluZChtZXRob2QsIGNvbnRleHQpIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ldGhvZC5hcHBseShjb250ZXh0LCBhcmd1bWVudHMpOyB9O1xuXHRcdH1cblxuXG5cdFx0dmFyIG1ldGhvZHMgPSBbJ29uTW91c2UnLCAnb25DbGljaycsICdvblRvdWNoU3RhcnQnLCAnb25Ub3VjaE1vdmUnLCAnb25Ub3VjaEVuZCcsICdvblRvdWNoQ2FuY2VsJ107XG5cdFx0dmFyIGNvbnRleHQgPSB0aGlzO1xuXHRcdGZvciAodmFyIGkgPSAwLCBsID0gbWV0aG9kcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0XHRcdGNvbnRleHRbbWV0aG9kc1tpXV0gPSBiaW5kKGNvbnRleHRbbWV0aG9kc1tpXV0sIGNvbnRleHQpO1xuXHRcdH1cblxuXHRcdC8vIFNldCB1cCBldmVudCBoYW5kbGVycyBhcyByZXF1aXJlZFxuXHRcdGlmIChkZXZpY2VJc0FuZHJvaWQpIHtcblx0XHRcdGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlb3ZlcicsIHRoaXMub25Nb3VzZSwgdHJ1ZSk7XG5cdFx0XHRsYXllci5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uTW91c2UsIHRydWUpO1xuXHRcdFx0bGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25Nb3VzZSwgdHJ1ZSk7XG5cdFx0fVxuXG5cdFx0bGF5ZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLm9uQ2xpY2ssIHRydWUpO1xuXHRcdGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0aGlzLm9uVG91Y2hTdGFydCwgZmFsc2UpO1xuXHRcdGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHRoaXMub25Ub3VjaE1vdmUsIGZhbHNlKTtcblx0XHRsYXllci5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHRoaXMub25Ub3VjaEVuZCwgZmFsc2UpO1xuXHRcdGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoY2FuY2VsJywgdGhpcy5vblRvdWNoQ2FuY2VsLCBmYWxzZSk7XG5cblx0XHQvLyBIYWNrIGlzIHJlcXVpcmVkIGZvciBicm93c2VycyB0aGF0IGRvbid0IHN1cHBvcnQgRXZlbnQjc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uIChlLmcuIEFuZHJvaWQgMilcblx0XHQvLyB3aGljaCBpcyBob3cgRmFzdENsaWNrIG5vcm1hbGx5IHN0b3BzIGNsaWNrIGV2ZW50cyBidWJibGluZyB0byBjYWxsYmFja3MgcmVnaXN0ZXJlZCBvbiB0aGUgRmFzdENsaWNrXG5cdFx0Ly8gbGF5ZXIgd2hlbiB0aGV5IGFyZSBjYW5jZWxsZWQuXG5cdFx0aWYgKCFFdmVudC5wcm90b3R5cGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKSB7XG5cdFx0XHRsYXllci5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgY2FsbGJhY2ssIGNhcHR1cmUpIHtcblx0XHRcdFx0dmFyIHJtdiA9IE5vZGUucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXI7XG5cdFx0XHRcdGlmICh0eXBlID09PSAnY2xpY2snKSB7XG5cdFx0XHRcdFx0cm12LmNhbGwobGF5ZXIsIHR5cGUsIGNhbGxiYWNrLmhpamFja2VkIHx8IGNhbGxiYWNrLCBjYXB0dXJlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRybXYuY2FsbChsYXllciwgdHlwZSwgY2FsbGJhY2ssIGNhcHR1cmUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHRsYXllci5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgY2FsbGJhY2ssIGNhcHR1cmUpIHtcblx0XHRcdFx0dmFyIGFkdiA9IE5vZGUucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXI7XG5cdFx0XHRcdGlmICh0eXBlID09PSAnY2xpY2snKSB7XG5cdFx0XHRcdFx0YWR2LmNhbGwobGF5ZXIsIHR5cGUsIGNhbGxiYWNrLmhpamFja2VkIHx8IChjYWxsYmFjay5oaWphY2tlZCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRcdFx0XHRpZiAoIWV2ZW50LnByb3BhZ2F0aW9uU3RvcHBlZCkge1xuXHRcdFx0XHRcdFx0XHRjYWxsYmFjayhldmVudCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSksIGNhcHR1cmUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGFkdi5jYWxsKGxheWVyLCB0eXBlLCBjYWxsYmFjaywgY2FwdHVyZSk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0Ly8gSWYgYSBoYW5kbGVyIGlzIGFscmVhZHkgZGVjbGFyZWQgaW4gdGhlIGVsZW1lbnQncyBvbmNsaWNrIGF0dHJpYnV0ZSwgaXQgd2lsbCBiZSBmaXJlZCBiZWZvcmVcblx0XHQvLyBGYXN0Q2xpY2sncyBvbkNsaWNrIGhhbmRsZXIuIEZpeCB0aGlzIGJ5IHB1bGxpbmcgb3V0IHRoZSB1c2VyLWRlZmluZWQgaGFuZGxlciBmdW5jdGlvbiBhbmRcblx0XHQvLyBhZGRpbmcgaXQgYXMgbGlzdGVuZXIuXG5cdFx0aWYgKHR5cGVvZiBsYXllci5vbmNsaWNrID09PSAnZnVuY3Rpb24nKSB7XG5cblx0XHRcdC8vIEFuZHJvaWQgYnJvd3NlciBvbiBhdCBsZWFzdCAzLjIgcmVxdWlyZXMgYSBuZXcgcmVmZXJlbmNlIHRvIHRoZSBmdW5jdGlvbiBpbiBsYXllci5vbmNsaWNrXG5cdFx0XHQvLyAtIHRoZSBvbGQgb25lIHdvbid0IHdvcmsgaWYgcGFzc2VkIHRvIGFkZEV2ZW50TGlzdGVuZXIgZGlyZWN0bHkuXG5cdFx0XHRvbGRPbkNsaWNrID0gbGF5ZXIub25jbGljaztcblx0XHRcdGxheWVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdFx0b2xkT25DbGljayhldmVudCk7XG5cdFx0XHR9LCBmYWxzZSk7XG5cdFx0XHRsYXllci5vbmNsaWNrID0gbnVsbDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0KiBXaW5kb3dzIFBob25lIDguMSBmYWtlcyB1c2VyIGFnZW50IHN0cmluZyB0byBsb29rIGxpa2UgQW5kcm9pZCBhbmQgaVBob25lLlxuXHQqXG5cdCogQHR5cGUgYm9vbGVhblxuXHQqL1xuXHR2YXIgZGV2aWNlSXNXaW5kb3dzUGhvbmUgPSBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoXCJXaW5kb3dzIFBob25lXCIpID49IDA7XG5cblx0LyoqXG5cdCAqIEFuZHJvaWQgcmVxdWlyZXMgZXhjZXB0aW9ucy5cblx0ICpcblx0ICogQHR5cGUgYm9vbGVhblxuXHQgKi9cblx0dmFyIGRldmljZUlzQW5kcm9pZCA9IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignQW5kcm9pZCcpID4gMCAmJiAhZGV2aWNlSXNXaW5kb3dzUGhvbmU7XG5cblxuXHQvKipcblx0ICogaU9TIHJlcXVpcmVzIGV4Y2VwdGlvbnMuXG5cdCAqXG5cdCAqIEB0eXBlIGJvb2xlYW5cblx0ICovXG5cdHZhciBkZXZpY2VJc0lPUyA9IC9pUChhZHxob25lfG9kKS8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KSAmJiAhZGV2aWNlSXNXaW5kb3dzUGhvbmU7XG5cblxuXHQvKipcblx0ICogaU9TIDQgcmVxdWlyZXMgYW4gZXhjZXB0aW9uIGZvciBzZWxlY3QgZWxlbWVudHMuXG5cdCAqXG5cdCAqIEB0eXBlIGJvb2xlYW5cblx0ICovXG5cdHZhciBkZXZpY2VJc0lPUzQgPSBkZXZpY2VJc0lPUyAmJiAoL09TIDRfXFxkKF9cXGQpPy8pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG5cblxuXHQvKipcblx0ICogaU9TIDYuMC03LiogcmVxdWlyZXMgdGhlIHRhcmdldCBlbGVtZW50IHRvIGJlIG1hbnVhbGx5IGRlcml2ZWRcblx0ICpcblx0ICogQHR5cGUgYm9vbGVhblxuXHQgKi9cblx0dmFyIGRldmljZUlzSU9TV2l0aEJhZFRhcmdldCA9IGRldmljZUlzSU9TICYmICgvT1MgWzYtN11fXFxkLykudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcblxuXHQvKipcblx0ICogQmxhY2tCZXJyeSByZXF1aXJlcyBleGNlcHRpb25zLlxuXHQgKlxuXHQgKiBAdHlwZSBib29sZWFuXG5cdCAqL1xuXHR2YXIgZGV2aWNlSXNCbGFja0JlcnJ5MTAgPSBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ0JCMTAnKSA+IDA7XG5cblx0LyoqXG5cdCAqIERldGVybWluZSB3aGV0aGVyIGEgZ2l2ZW4gZWxlbWVudCByZXF1aXJlcyBhIG5hdGl2ZSBjbGljay5cblx0ICpcblx0ICogQHBhcmFtIHtFdmVudFRhcmdldHxFbGVtZW50fSB0YXJnZXQgVGFyZ2V0IERPTSBlbGVtZW50XG5cdCAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIHRydWUgaWYgdGhlIGVsZW1lbnQgbmVlZHMgYSBuYXRpdmUgY2xpY2tcblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUubmVlZHNDbGljayA9IGZ1bmN0aW9uKHRhcmdldCkge1xuXHRcdHN3aXRjaCAodGFyZ2V0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpIHtcblxuXHRcdC8vIERvbid0IHNlbmQgYSBzeW50aGV0aWMgY2xpY2sgdG8gZGlzYWJsZWQgaW5wdXRzIChpc3N1ZSAjNjIpXG5cdFx0Y2FzZSAnYnV0dG9uJzpcblx0XHRjYXNlICdzZWxlY3QnOlxuXHRcdGNhc2UgJ3RleHRhcmVhJzpcblx0XHRcdGlmICh0YXJnZXQuZGlzYWJsZWQpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJ2lucHV0JzpcblxuXHRcdFx0Ly8gRmlsZSBpbnB1dHMgbmVlZCByZWFsIGNsaWNrcyBvbiBpT1MgNiBkdWUgdG8gYSBicm93c2VyIGJ1ZyAoaXNzdWUgIzY4KVxuXHRcdFx0aWYgKChkZXZpY2VJc0lPUyAmJiB0YXJnZXQudHlwZSA9PT0gJ2ZpbGUnKSB8fCB0YXJnZXQuZGlzYWJsZWQpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgJ2xhYmVsJzpcblx0XHRjYXNlICdpZnJhbWUnOiAvLyBpT1M4IGhvbWVzY3JlZW4gYXBwcyBjYW4gcHJldmVudCBldmVudHMgYnViYmxpbmcgaW50byBmcmFtZXNcblx0XHRjYXNlICd2aWRlbyc6XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gKC9cXGJuZWVkc2NsaWNrXFxiLykudGVzdCh0YXJnZXQuY2xhc3NOYW1lKTtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBEZXRlcm1pbmUgd2hldGhlciBhIGdpdmVuIGVsZW1lbnQgcmVxdWlyZXMgYSBjYWxsIHRvIGZvY3VzIHRvIHNpbXVsYXRlIGNsaWNrIGludG8gZWxlbWVudC5cblx0ICpcblx0ICogQHBhcmFtIHtFdmVudFRhcmdldHxFbGVtZW50fSB0YXJnZXQgVGFyZ2V0IERPTSBlbGVtZW50XG5cdCAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIHRydWUgaWYgdGhlIGVsZW1lbnQgcmVxdWlyZXMgYSBjYWxsIHRvIGZvY3VzIHRvIHNpbXVsYXRlIG5hdGl2ZSBjbGljay5cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUubmVlZHNGb2N1cyA9IGZ1bmN0aW9uKHRhcmdldCkge1xuXHRcdHN3aXRjaCAodGFyZ2V0Lm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkpIHtcblx0XHRjYXNlICd0ZXh0YXJlYSc6XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRjYXNlICdzZWxlY3QnOlxuXHRcdFx0cmV0dXJuICFkZXZpY2VJc0FuZHJvaWQ7XG5cdFx0Y2FzZSAnaW5wdXQnOlxuXHRcdFx0c3dpdGNoICh0YXJnZXQudHlwZSkge1xuXHRcdFx0Y2FzZSAnYnV0dG9uJzpcblx0XHRcdGNhc2UgJ2NoZWNrYm94Jzpcblx0XHRcdGNhc2UgJ2ZpbGUnOlxuXHRcdFx0Y2FzZSAnaW1hZ2UnOlxuXHRcdFx0Y2FzZSAncmFkaW8nOlxuXHRcdFx0Y2FzZSAnc3VibWl0Jzpcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBObyBwb2ludCBpbiBhdHRlbXB0aW5nIHRvIGZvY3VzIGRpc2FibGVkIGlucHV0c1xuXHRcdFx0cmV0dXJuICF0YXJnZXQuZGlzYWJsZWQgJiYgIXRhcmdldC5yZWFkT25seTtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuICgvXFxibmVlZHNmb2N1c1xcYi8pLnRlc3QodGFyZ2V0LmNsYXNzTmFtZSk7XG5cdFx0fVxuXHR9O1xuXG5cblx0LyoqXG5cdCAqIFNlbmQgYSBjbGljayBldmVudCB0byB0aGUgc3BlY2lmaWVkIGVsZW1lbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RXZlbnRUYXJnZXR8RWxlbWVudH0gdGFyZ2V0RWxlbWVudFxuXHQgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5zZW5kQ2xpY2sgPSBmdW5jdGlvbih0YXJnZXRFbGVtZW50LCBldmVudCkge1xuXHRcdHZhciBjbGlja0V2ZW50LCB0b3VjaDtcblxuXHRcdC8vIE9uIHNvbWUgQW5kcm9pZCBkZXZpY2VzIGFjdGl2ZUVsZW1lbnQgbmVlZHMgdG8gYmUgYmx1cnJlZCBvdGhlcndpc2UgdGhlIHN5bnRoZXRpYyBjbGljayB3aWxsIGhhdmUgbm8gZWZmZWN0ICgjMjQpXG5cdFx0aWYgKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgJiYgZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gdGFyZ2V0RWxlbWVudCkge1xuXHRcdFx0ZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5ibHVyKCk7XG5cdFx0fVxuXG5cdFx0dG91Y2ggPSBldmVudC5jaGFuZ2VkVG91Y2hlc1swXTtcblxuXHRcdC8vIFN5bnRoZXNpc2UgYSBjbGljayBldmVudCwgd2l0aCBhbiBleHRyYSBhdHRyaWJ1dGUgc28gaXQgY2FuIGJlIHRyYWNrZWRcblx0XHRjbGlja0V2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnRzJyk7XG5cdFx0Y2xpY2tFdmVudC5pbml0TW91c2VFdmVudCh0aGlzLmRldGVybWluZUV2ZW50VHlwZSh0YXJnZXRFbGVtZW50KSwgdHJ1ZSwgdHJ1ZSwgd2luZG93LCAxLCB0b3VjaC5zY3JlZW5YLCB0b3VjaC5zY3JlZW5ZLCB0b3VjaC5jbGllbnRYLCB0b3VjaC5jbGllbnRZLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgMCwgbnVsbCk7XG5cdFx0Y2xpY2tFdmVudC5mb3J3YXJkZWRUb3VjaEV2ZW50ID0gdHJ1ZTtcblx0XHR0YXJnZXRFbGVtZW50LmRpc3BhdGNoRXZlbnQoY2xpY2tFdmVudCk7XG5cdH07XG5cblx0RmFzdENsaWNrLnByb3RvdHlwZS5kZXRlcm1pbmVFdmVudFR5cGUgPSBmdW5jdGlvbih0YXJnZXRFbGVtZW50KSB7XG5cblx0XHQvL0lzc3VlICMxNTk6IEFuZHJvaWQgQ2hyb21lIFNlbGVjdCBCb3ggZG9lcyBub3Qgb3BlbiB3aXRoIGEgc3ludGhldGljIGNsaWNrIGV2ZW50XG5cdFx0aWYgKGRldmljZUlzQW5kcm9pZCAmJiB0YXJnZXRFbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ3NlbGVjdCcpIHtcblx0XHRcdHJldHVybiAnbW91c2Vkb3duJztcblx0XHR9XG5cblx0XHRyZXR1cm4gJ2NsaWNrJztcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fEVsZW1lbnR9IHRhcmdldEVsZW1lbnRcblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUuZm9jdXMgPSBmdW5jdGlvbih0YXJnZXRFbGVtZW50KSB7XG5cdFx0dmFyIGxlbmd0aDtcblxuXHRcdC8vIElzc3VlICMxNjA6IG9uIGlPUyA3LCBzb21lIGlucHV0IGVsZW1lbnRzIChlLmcuIGRhdGUgZGF0ZXRpbWUgbW9udGgpIHRocm93IGEgdmFndWUgVHlwZUVycm9yIG9uIHNldFNlbGVjdGlvblJhbmdlLiBUaGVzZSBlbGVtZW50cyBkb24ndCBoYXZlIGFuIGludGVnZXIgdmFsdWUgZm9yIHRoZSBzZWxlY3Rpb25TdGFydCBhbmQgc2VsZWN0aW9uRW5kIHByb3BlcnRpZXMsIGJ1dCB1bmZvcnR1bmF0ZWx5IHRoYXQgY2FuJ3QgYmUgdXNlZCBmb3IgZGV0ZWN0aW9uIGJlY2F1c2UgYWNjZXNzaW5nIHRoZSBwcm9wZXJ0aWVzIGFsc28gdGhyb3dzIGEgVHlwZUVycm9yLiBKdXN0IGNoZWNrIHRoZSB0eXBlIGluc3RlYWQuIEZpbGVkIGFzIEFwcGxlIGJ1ZyAjMTUxMjI3MjQuXG5cdFx0aWYgKGRldmljZUlzSU9TICYmIHRhcmdldEVsZW1lbnQuc2V0U2VsZWN0aW9uUmFuZ2UgJiYgdGFyZ2V0RWxlbWVudC50eXBlLmluZGV4T2YoJ2RhdGUnKSAhPT0gMCAmJiB0YXJnZXRFbGVtZW50LnR5cGUgIT09ICd0aW1lJyAmJiB0YXJnZXRFbGVtZW50LnR5cGUgIT09ICdtb250aCcpIHtcblx0XHRcdGxlbmd0aCA9IHRhcmdldEVsZW1lbnQudmFsdWUubGVuZ3RoO1xuXHRcdFx0dGFyZ2V0RWxlbWVudC5zZXRTZWxlY3Rpb25SYW5nZShsZW5ndGgsIGxlbmd0aCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRhcmdldEVsZW1lbnQuZm9jdXMoKTtcblx0XHR9XG5cdH07XG5cblxuXHQvKipcblx0ICogQ2hlY2sgd2hldGhlciB0aGUgZ2l2ZW4gdGFyZ2V0IGVsZW1lbnQgaXMgYSBjaGlsZCBvZiBhIHNjcm9sbGFibGUgbGF5ZXIgYW5kIGlmIHNvLCBzZXQgYSBmbGFnIG9uIGl0LlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fEVsZW1lbnR9IHRhcmdldEVsZW1lbnRcblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUudXBkYXRlU2Nyb2xsUGFyZW50ID0gZnVuY3Rpb24odGFyZ2V0RWxlbWVudCkge1xuXHRcdHZhciBzY3JvbGxQYXJlbnQsIHBhcmVudEVsZW1lbnQ7XG5cblx0XHRzY3JvbGxQYXJlbnQgPSB0YXJnZXRFbGVtZW50LmZhc3RDbGlja1Njcm9sbFBhcmVudDtcblxuXHRcdC8vIEF0dGVtcHQgdG8gZGlzY292ZXIgd2hldGhlciB0aGUgdGFyZ2V0IGVsZW1lbnQgaXMgY29udGFpbmVkIHdpdGhpbiBhIHNjcm9sbGFibGUgbGF5ZXIuIFJlLWNoZWNrIGlmIHRoZVxuXHRcdC8vIHRhcmdldCBlbGVtZW50IHdhcyBtb3ZlZCB0byBhbm90aGVyIHBhcmVudC5cblx0XHRpZiAoIXNjcm9sbFBhcmVudCB8fCAhc2Nyb2xsUGFyZW50LmNvbnRhaW5zKHRhcmdldEVsZW1lbnQpKSB7XG5cdFx0XHRwYXJlbnRFbGVtZW50ID0gdGFyZ2V0RWxlbWVudDtcblx0XHRcdGRvIHtcblx0XHRcdFx0aWYgKHBhcmVudEVsZW1lbnQuc2Nyb2xsSGVpZ2h0ID4gcGFyZW50RWxlbWVudC5vZmZzZXRIZWlnaHQpIHtcblx0XHRcdFx0XHRzY3JvbGxQYXJlbnQgPSBwYXJlbnRFbGVtZW50O1xuXHRcdFx0XHRcdHRhcmdldEVsZW1lbnQuZmFzdENsaWNrU2Nyb2xsUGFyZW50ID0gcGFyZW50RWxlbWVudDtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHBhcmVudEVsZW1lbnQgPSBwYXJlbnRFbGVtZW50LnBhcmVudEVsZW1lbnQ7XG5cdFx0XHR9IHdoaWxlIChwYXJlbnRFbGVtZW50KTtcblx0XHR9XG5cblx0XHQvLyBBbHdheXMgdXBkYXRlIHRoZSBzY3JvbGwgdG9wIHRyYWNrZXIgaWYgcG9zc2libGUuXG5cdFx0aWYgKHNjcm9sbFBhcmVudCkge1xuXHRcdFx0c2Nyb2xsUGFyZW50LmZhc3RDbGlja0xhc3RTY3JvbGxUb3AgPSBzY3JvbGxQYXJlbnQuc2Nyb2xsVG9wO1xuXHRcdH1cblx0fTtcblxuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fSB0YXJnZXRFbGVtZW50XG5cdCAqIEByZXR1cm5zIHtFbGVtZW50fEV2ZW50VGFyZ2V0fVxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5nZXRUYXJnZXRFbGVtZW50RnJvbUV2ZW50VGFyZ2V0ID0gZnVuY3Rpb24oZXZlbnRUYXJnZXQpIHtcblxuXHRcdC8vIE9uIHNvbWUgb2xkZXIgYnJvd3NlcnMgKG5vdGFibHkgU2FmYXJpIG9uIGlPUyA0LjEgLSBzZWUgaXNzdWUgIzU2KSB0aGUgZXZlbnQgdGFyZ2V0IG1heSBiZSBhIHRleHQgbm9kZS5cblx0XHRpZiAoZXZlbnRUYXJnZXQubm9kZVR5cGUgPT09IE5vZGUuVEVYVF9OT0RFKSB7XG5cdFx0XHRyZXR1cm4gZXZlbnRUYXJnZXQucGFyZW50Tm9kZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZXZlbnRUYXJnZXQ7XG5cdH07XG5cblxuXHQvKipcblx0ICogT24gdG91Y2ggc3RhcnQsIHJlY29yZCB0aGUgcG9zaXRpb24gYW5kIHNjcm9sbCBvZmZzZXQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5vblRvdWNoU3RhcnQgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdHZhciB0YXJnZXRFbGVtZW50LCB0b3VjaCwgc2VsZWN0aW9uO1xuXG5cdFx0Ly8gSWdub3JlIG11bHRpcGxlIHRvdWNoZXMsIG90aGVyd2lzZSBwaW5jaC10by16b29tIGlzIHByZXZlbnRlZCBpZiBib3RoIGZpbmdlcnMgYXJlIG9uIHRoZSBGYXN0Q2xpY2sgZWxlbWVudCAoaXNzdWUgIzExMSkuXG5cdFx0aWYgKGV2ZW50LnRhcmdldFRvdWNoZXMubGVuZ3RoID4gMSkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0dGFyZ2V0RWxlbWVudCA9IHRoaXMuZ2V0VGFyZ2V0RWxlbWVudEZyb21FdmVudFRhcmdldChldmVudC50YXJnZXQpO1xuXHRcdHRvdWNoID0gZXZlbnQudGFyZ2V0VG91Y2hlc1swXTtcblxuXHRcdGlmIChkZXZpY2VJc0lPUykge1xuXG5cdFx0XHQvLyBPbmx5IHRydXN0ZWQgZXZlbnRzIHdpbGwgZGVzZWxlY3QgdGV4dCBvbiBpT1MgKGlzc3VlICM0OSlcblx0XHRcdHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcblx0XHRcdGlmIChzZWxlY3Rpb24ucmFuZ2VDb3VudCAmJiAhc2VsZWN0aW9uLmlzQ29sbGFwc2VkKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIWRldmljZUlzSU9TNCkge1xuXG5cdFx0XHRcdC8vIFdlaXJkIHRoaW5ncyBoYXBwZW4gb24gaU9TIHdoZW4gYW4gYWxlcnQgb3IgY29uZmlybSBkaWFsb2cgaXMgb3BlbmVkIGZyb20gYSBjbGljayBldmVudCBjYWxsYmFjayAoaXNzdWUgIzIzKTpcblx0XHRcdFx0Ly8gd2hlbiB0aGUgdXNlciBuZXh0IHRhcHMgYW55d2hlcmUgZWxzZSBvbiB0aGUgcGFnZSwgbmV3IHRvdWNoc3RhcnQgYW5kIHRvdWNoZW5kIGV2ZW50cyBhcmUgZGlzcGF0Y2hlZFxuXHRcdFx0XHQvLyB3aXRoIHRoZSBzYW1lIGlkZW50aWZpZXIgYXMgdGhlIHRvdWNoIGV2ZW50IHRoYXQgcHJldmlvdXNseSB0cmlnZ2VyZWQgdGhlIGNsaWNrIHRoYXQgdHJpZ2dlcmVkIHRoZSBhbGVydC5cblx0XHRcdFx0Ly8gU2FkbHksIHRoZXJlIGlzIGFuIGlzc3VlIG9uIGlPUyA0IHRoYXQgY2F1c2VzIHNvbWUgbm9ybWFsIHRvdWNoIGV2ZW50cyB0byBoYXZlIHRoZSBzYW1lIGlkZW50aWZpZXIgYXMgYW5cblx0XHRcdFx0Ly8gaW1tZWRpYXRlbHkgcHJlY2VlZGluZyB0b3VjaCBldmVudCAoaXNzdWUgIzUyKSwgc28gdGhpcyBmaXggaXMgdW5hdmFpbGFibGUgb24gdGhhdCBwbGF0Zm9ybS5cblx0XHRcdFx0Ly8gSXNzdWUgMTIwOiB0b3VjaC5pZGVudGlmaWVyIGlzIDAgd2hlbiBDaHJvbWUgZGV2IHRvb2xzICdFbXVsYXRlIHRvdWNoIGV2ZW50cycgaXMgc2V0IHdpdGggYW4gaU9TIGRldmljZSBVQSBzdHJpbmcsXG5cdFx0XHRcdC8vIHdoaWNoIGNhdXNlcyBhbGwgdG91Y2ggZXZlbnRzIHRvIGJlIGlnbm9yZWQuIEFzIHRoaXMgYmxvY2sgb25seSBhcHBsaWVzIHRvIGlPUywgYW5kIGlPUyBpZGVudGlmaWVycyBhcmUgYWx3YXlzIGxvbmcsXG5cdFx0XHRcdC8vIHJhbmRvbSBpbnRlZ2VycywgaXQncyBzYWZlIHRvIHRvIGNvbnRpbnVlIGlmIHRoZSBpZGVudGlmaWVyIGlzIDAgaGVyZS5cblx0XHRcdFx0aWYgKHRvdWNoLmlkZW50aWZpZXIgJiYgdG91Y2guaWRlbnRpZmllciA9PT0gdGhpcy5sYXN0VG91Y2hJZGVudGlmaWVyKSB7XG5cdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLmxhc3RUb3VjaElkZW50aWZpZXIgPSB0b3VjaC5pZGVudGlmaWVyO1xuXG5cdFx0XHRcdC8vIElmIHRoZSB0YXJnZXQgZWxlbWVudCBpcyBhIGNoaWxkIG9mIGEgc2Nyb2xsYWJsZSBsYXllciAodXNpbmcgLXdlYmtpdC1vdmVyZmxvdy1zY3JvbGxpbmc6IHRvdWNoKSBhbmQ6XG5cdFx0XHRcdC8vIDEpIHRoZSB1c2VyIGRvZXMgYSBmbGluZyBzY3JvbGwgb24gdGhlIHNjcm9sbGFibGUgbGF5ZXJcblx0XHRcdFx0Ly8gMikgdGhlIHVzZXIgc3RvcHMgdGhlIGZsaW5nIHNjcm9sbCB3aXRoIGFub3RoZXIgdGFwXG5cdFx0XHRcdC8vIHRoZW4gdGhlIGV2ZW50LnRhcmdldCBvZiB0aGUgbGFzdCAndG91Y2hlbmQnIGV2ZW50IHdpbGwgYmUgdGhlIGVsZW1lbnQgdGhhdCB3YXMgdW5kZXIgdGhlIHVzZXIncyBmaW5nZXJcblx0XHRcdFx0Ly8gd2hlbiB0aGUgZmxpbmcgc2Nyb2xsIHdhcyBzdGFydGVkLCBjYXVzaW5nIEZhc3RDbGljayB0byBzZW5kIGEgY2xpY2sgZXZlbnQgdG8gdGhhdCBsYXllciAtIHVubGVzcyBhIGNoZWNrXG5cdFx0XHRcdC8vIGlzIG1hZGUgdG8gZW5zdXJlIHRoYXQgYSBwYXJlbnQgbGF5ZXIgd2FzIG5vdCBzY3JvbGxlZCBiZWZvcmUgc2VuZGluZyBhIHN5bnRoZXRpYyBjbGljayAoaXNzdWUgIzQyKS5cblx0XHRcdFx0dGhpcy51cGRhdGVTY3JvbGxQYXJlbnQodGFyZ2V0RWxlbWVudCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy50cmFja2luZ0NsaWNrID0gdHJ1ZTtcblx0XHR0aGlzLnRyYWNraW5nQ2xpY2tTdGFydCA9IGV2ZW50LnRpbWVTdGFtcDtcblx0XHR0aGlzLnRhcmdldEVsZW1lbnQgPSB0YXJnZXRFbGVtZW50O1xuXG5cdFx0dGhpcy50b3VjaFN0YXJ0WCA9IHRvdWNoLnBhZ2VYO1xuXHRcdHRoaXMudG91Y2hTdGFydFkgPSB0b3VjaC5wYWdlWTtcblxuXHRcdC8vIFByZXZlbnQgcGhhbnRvbSBjbGlja3Mgb24gZmFzdCBkb3VibGUtdGFwIChpc3N1ZSAjMzYpXG5cdFx0aWYgKChldmVudC50aW1lU3RhbXAgLSB0aGlzLmxhc3RDbGlja1RpbWUpIDwgdGhpcy50YXBEZWxheSkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBCYXNlZCBvbiBhIHRvdWNobW92ZSBldmVudCBvYmplY3QsIGNoZWNrIHdoZXRoZXIgdGhlIHRvdWNoIGhhcyBtb3ZlZCBwYXN0IGEgYm91bmRhcnkgc2luY2UgaXQgc3RhcnRlZC5cblx0ICpcblx0ICogQHBhcmFtIHtFdmVudH0gZXZlbnRcblx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLnRvdWNoSGFzTW92ZWQgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdHZhciB0b3VjaCA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdLCBib3VuZGFyeSA9IHRoaXMudG91Y2hCb3VuZGFyeTtcblxuXHRcdGlmIChNYXRoLmFicyh0b3VjaC5wYWdlWCAtIHRoaXMudG91Y2hTdGFydFgpID4gYm91bmRhcnkgfHwgTWF0aC5hYnModG91Y2gucGFnZVkgLSB0aGlzLnRvdWNoU3RhcnRZKSA+IGJvdW5kYXJ5KSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH07XG5cblxuXHQvKipcblx0ICogVXBkYXRlIHRoZSBsYXN0IHBvc2l0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUub25Ub3VjaE1vdmUgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdGlmICghdGhpcy50cmFja2luZ0NsaWNrKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyBJZiB0aGUgdG91Y2ggaGFzIG1vdmVkLCBjYW5jZWwgdGhlIGNsaWNrIHRyYWNraW5nXG5cdFx0aWYgKHRoaXMudGFyZ2V0RWxlbWVudCAhPT0gdGhpcy5nZXRUYXJnZXRFbGVtZW50RnJvbUV2ZW50VGFyZ2V0KGV2ZW50LnRhcmdldCkgfHwgdGhpcy50b3VjaEhhc01vdmVkKGV2ZW50KSkge1xuXHRcdFx0dGhpcy50cmFja2luZ0NsaWNrID0gZmFsc2U7XG5cdFx0XHR0aGlzLnRhcmdldEVsZW1lbnQgPSBudWxsO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIEF0dGVtcHQgdG8gZmluZCB0aGUgbGFiZWxsZWQgY29udHJvbCBmb3IgdGhlIGdpdmVuIGxhYmVsIGVsZW1lbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RXZlbnRUYXJnZXR8SFRNTExhYmVsRWxlbWVudH0gbGFiZWxFbGVtZW50XG5cdCAqIEByZXR1cm5zIHtFbGVtZW50fG51bGx9XG5cdCAqL1xuXHRGYXN0Q2xpY2sucHJvdG90eXBlLmZpbmRDb250cm9sID0gZnVuY3Rpb24obGFiZWxFbGVtZW50KSB7XG5cblx0XHQvLyBGYXN0IHBhdGggZm9yIG5ld2VyIGJyb3dzZXJzIHN1cHBvcnRpbmcgdGhlIEhUTUw1IGNvbnRyb2wgYXR0cmlidXRlXG5cdFx0aWYgKGxhYmVsRWxlbWVudC5jb250cm9sICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHJldHVybiBsYWJlbEVsZW1lbnQuY29udHJvbDtcblx0XHR9XG5cblx0XHQvLyBBbGwgYnJvd3NlcnMgdW5kZXIgdGVzdCB0aGF0IHN1cHBvcnQgdG91Y2ggZXZlbnRzIGFsc28gc3VwcG9ydCB0aGUgSFRNTDUgaHRtbEZvciBhdHRyaWJ1dGVcblx0XHRpZiAobGFiZWxFbGVtZW50Lmh0bWxGb3IpIHtcblx0XHRcdHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChsYWJlbEVsZW1lbnQuaHRtbEZvcik7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgbm8gZm9yIGF0dHJpYnV0ZSBleGlzdHMsIGF0dGVtcHQgdG8gcmV0cmlldmUgdGhlIGZpcnN0IGxhYmVsbGFibGUgZGVzY2VuZGFudCBlbGVtZW50XG5cdFx0Ly8gdGhlIGxpc3Qgb2Ygd2hpY2ggaXMgZGVmaW5lZCBoZXJlOiBodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sNS9mb3Jtcy5odG1sI2NhdGVnb3J5LWxhYmVsXG5cdFx0cmV0dXJuIGxhYmVsRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdidXR0b24sIGlucHV0Om5vdChbdHlwZT1oaWRkZW5dKSwga2V5Z2VuLCBtZXRlciwgb3V0cHV0LCBwcm9ncmVzcywgc2VsZWN0LCB0ZXh0YXJlYScpO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIE9uIHRvdWNoIGVuZCwgZGV0ZXJtaW5lIHdoZXRoZXIgdG8gc2VuZCBhIGNsaWNrIGV2ZW50IGF0IG9uY2UuXG5cdCAqXG5cdCAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHQgKi9cblx0RmFzdENsaWNrLnByb3RvdHlwZS5vblRvdWNoRW5kID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHR2YXIgZm9yRWxlbWVudCwgdHJhY2tpbmdDbGlja1N0YXJ0LCB0YXJnZXRUYWdOYW1lLCBzY3JvbGxQYXJlbnQsIHRvdWNoLCB0YXJnZXRFbGVtZW50ID0gdGhpcy50YXJnZXRFbGVtZW50O1xuXG5cdFx0aWYgKCF0aGlzLnRyYWNraW5nQ2xpY2spIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIFByZXZlbnQgcGhhbnRvbSBjbGlja3Mgb24gZmFzdCBkb3VibGUtdGFwIChpc3N1ZSAjMzYpXG5cdFx0aWYgKChldmVudC50aW1lU3RhbXAgLSB0aGlzLmxhc3RDbGlja1RpbWUpIDwgdGhpcy50YXBEZWxheSkge1xuXHRcdFx0dGhpcy5jYW5jZWxOZXh0Q2xpY2sgPSB0cnVlO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKChldmVudC50aW1lU3RhbXAgLSB0aGlzLnRyYWNraW5nQ2xpY2tTdGFydCkgPiB0aGlzLnRhcFRpbWVvdXQpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIFJlc2V0IHRvIHByZXZlbnQgd3JvbmcgY2xpY2sgY2FuY2VsIG9uIGlucHV0IChpc3N1ZSAjMTU2KS5cblx0XHR0aGlzLmNhbmNlbE5leHRDbGljayA9IGZhbHNlO1xuXG5cdFx0dGhpcy5sYXN0Q2xpY2tUaW1lID0gZXZlbnQudGltZVN0YW1wO1xuXG5cdFx0dHJhY2tpbmdDbGlja1N0YXJ0ID0gdGhpcy50cmFja2luZ0NsaWNrU3RhcnQ7XG5cdFx0dGhpcy50cmFja2luZ0NsaWNrID0gZmFsc2U7XG5cdFx0dGhpcy50cmFja2luZ0NsaWNrU3RhcnQgPSAwO1xuXG5cdFx0Ly8gT24gc29tZSBpT1MgZGV2aWNlcywgdGhlIHRhcmdldEVsZW1lbnQgc3VwcGxpZWQgd2l0aCB0aGUgZXZlbnQgaXMgaW52YWxpZCBpZiB0aGUgbGF5ZXJcblx0XHQvLyBpcyBwZXJmb3JtaW5nIGEgdHJhbnNpdGlvbiBvciBzY3JvbGwsIGFuZCBoYXMgdG8gYmUgcmUtZGV0ZWN0ZWQgbWFudWFsbHkuIE5vdGUgdGhhdFxuXHRcdC8vIGZvciB0aGlzIHRvIGZ1bmN0aW9uIGNvcnJlY3RseSwgaXQgbXVzdCBiZSBjYWxsZWQgKmFmdGVyKiB0aGUgZXZlbnQgdGFyZ2V0IGlzIGNoZWNrZWQhXG5cdFx0Ly8gU2VlIGlzc3VlICM1NzsgYWxzbyBmaWxlZCBhcyByZGFyOi8vMTMwNDg1ODkgLlxuXHRcdGlmIChkZXZpY2VJc0lPU1dpdGhCYWRUYXJnZXQpIHtcblx0XHRcdHRvdWNoID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF07XG5cblx0XHRcdC8vIEluIGNlcnRhaW4gY2FzZXMgYXJndW1lbnRzIG9mIGVsZW1lbnRGcm9tUG9pbnQgY2FuIGJlIG5lZ2F0aXZlLCBzbyBwcmV2ZW50IHNldHRpbmcgdGFyZ2V0RWxlbWVudCB0byBudWxsXG5cdFx0XHR0YXJnZXRFbGVtZW50ID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludCh0b3VjaC5wYWdlWCAtIHdpbmRvdy5wYWdlWE9mZnNldCwgdG91Y2gucGFnZVkgLSB3aW5kb3cucGFnZVlPZmZzZXQpIHx8IHRhcmdldEVsZW1lbnQ7XG5cdFx0XHR0YXJnZXRFbGVtZW50LmZhc3RDbGlja1Njcm9sbFBhcmVudCA9IHRoaXMudGFyZ2V0RWxlbWVudC5mYXN0Q2xpY2tTY3JvbGxQYXJlbnQ7XG5cdFx0fVxuXG5cdFx0dGFyZ2V0VGFnTmFtZSA9IHRhcmdldEVsZW1lbnQudGFnTmFtZS50b0xvd2VyQ2FzZSgpO1xuXHRcdGlmICh0YXJnZXRUYWdOYW1lID09PSAnbGFiZWwnKSB7XG5cdFx0XHRmb3JFbGVtZW50ID0gdGhpcy5maW5kQ29udHJvbCh0YXJnZXRFbGVtZW50KTtcblx0XHRcdGlmIChmb3JFbGVtZW50KSB7XG5cdFx0XHRcdHRoaXMuZm9jdXModGFyZ2V0RWxlbWVudCk7XG5cdFx0XHRcdGlmIChkZXZpY2VJc0FuZHJvaWQpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0YXJnZXRFbGVtZW50ID0gZm9yRWxlbWVudDtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKHRoaXMubmVlZHNGb2N1cyh0YXJnZXRFbGVtZW50KSkge1xuXG5cdFx0XHQvLyBDYXNlIDE6IElmIHRoZSB0b3VjaCBzdGFydGVkIGEgd2hpbGUgYWdvIChiZXN0IGd1ZXNzIGlzIDEwMG1zIGJhc2VkIG9uIHRlc3RzIGZvciBpc3N1ZSAjMzYpIHRoZW4gZm9jdXMgd2lsbCBiZSB0cmlnZ2VyZWQgYW55d2F5LiBSZXR1cm4gZWFybHkgYW5kIHVuc2V0IHRoZSB0YXJnZXQgZWxlbWVudCByZWZlcmVuY2Ugc28gdGhhdCB0aGUgc3Vic2VxdWVudCBjbGljayB3aWxsIGJlIGFsbG93ZWQgdGhyb3VnaC5cblx0XHRcdC8vIENhc2UgMjogV2l0aG91dCB0aGlzIGV4Y2VwdGlvbiBmb3IgaW5wdXQgZWxlbWVudHMgdGFwcGVkIHdoZW4gdGhlIGRvY3VtZW50IGlzIGNvbnRhaW5lZCBpbiBhbiBpZnJhbWUsIHRoZW4gYW55IGlucHV0dGVkIHRleHQgd29uJ3QgYmUgdmlzaWJsZSBldmVuIHRob3VnaCB0aGUgdmFsdWUgYXR0cmlidXRlIGlzIHVwZGF0ZWQgYXMgdGhlIHVzZXIgdHlwZXMgKGlzc3VlICMzNykuXG5cdFx0XHRpZiAoKGV2ZW50LnRpbWVTdGFtcCAtIHRyYWNraW5nQ2xpY2tTdGFydCkgPiAxMDAgfHwgKGRldmljZUlzSU9TICYmIHdpbmRvdy50b3AgIT09IHdpbmRvdyAmJiB0YXJnZXRUYWdOYW1lID09PSAnaW5wdXQnKSkge1xuXHRcdFx0XHR0aGlzLnRhcmdldEVsZW1lbnQgPSBudWxsO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuZm9jdXModGFyZ2V0RWxlbWVudCk7XG5cdFx0XHR0aGlzLnNlbmRDbGljayh0YXJnZXRFbGVtZW50LCBldmVudCk7XG5cblx0XHRcdC8vIFNlbGVjdCBlbGVtZW50cyBuZWVkIHRoZSBldmVudCB0byBnbyB0aHJvdWdoIG9uIGlPUyA0LCBvdGhlcndpc2UgdGhlIHNlbGVjdG9yIG1lbnUgd29uJ3Qgb3Blbi5cblx0XHRcdC8vIEFsc28gdGhpcyBicmVha3Mgb3BlbmluZyBzZWxlY3RzIHdoZW4gVm9pY2VPdmVyIGlzIGFjdGl2ZSBvbiBpT1M2LCBpT1M3IChhbmQgcG9zc2libHkgb3RoZXJzKVxuXHRcdFx0aWYgKCFkZXZpY2VJc0lPUyB8fCB0YXJnZXRUYWdOYW1lICE9PSAnc2VsZWN0Jykge1xuXHRcdFx0XHR0aGlzLnRhcmdldEVsZW1lbnQgPSBudWxsO1xuXHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0aWYgKGRldmljZUlzSU9TICYmICFkZXZpY2VJc0lPUzQpIHtcblxuXHRcdFx0Ly8gRG9uJ3Qgc2VuZCBhIHN5bnRoZXRpYyBjbGljayBldmVudCBpZiB0aGUgdGFyZ2V0IGVsZW1lbnQgaXMgY29udGFpbmVkIHdpdGhpbiBhIHBhcmVudCBsYXllciB0aGF0IHdhcyBzY3JvbGxlZFxuXHRcdFx0Ly8gYW5kIHRoaXMgdGFwIGlzIGJlaW5nIHVzZWQgdG8gc3RvcCB0aGUgc2Nyb2xsaW5nICh1c3VhbGx5IGluaXRpYXRlZCBieSBhIGZsaW5nIC0gaXNzdWUgIzQyKS5cblx0XHRcdHNjcm9sbFBhcmVudCA9IHRhcmdldEVsZW1lbnQuZmFzdENsaWNrU2Nyb2xsUGFyZW50O1xuXHRcdFx0aWYgKHNjcm9sbFBhcmVudCAmJiBzY3JvbGxQYXJlbnQuZmFzdENsaWNrTGFzdFNjcm9sbFRvcCAhPT0gc2Nyb2xsUGFyZW50LnNjcm9sbFRvcCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBQcmV2ZW50IHRoZSBhY3R1YWwgY2xpY2sgZnJvbSBnb2luZyB0aG91Z2ggLSB1bmxlc3MgdGhlIHRhcmdldCBub2RlIGlzIG1hcmtlZCBhcyByZXF1aXJpbmdcblx0XHQvLyByZWFsIGNsaWNrcyBvciBpZiBpdCBpcyBpbiB0aGUgd2hpdGVsaXN0IGluIHdoaWNoIGNhc2Ugb25seSBub24tcHJvZ3JhbW1hdGljIGNsaWNrcyBhcmUgcGVybWl0dGVkLlxuXHRcdGlmICghdGhpcy5uZWVkc0NsaWNrKHRhcmdldEVsZW1lbnQpKSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0dGhpcy5zZW5kQ2xpY2sodGFyZ2V0RWxlbWVudCwgZXZlbnQpO1xuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBPbiB0b3VjaCBjYW5jZWwsIHN0b3AgdHJhY2tpbmcgdGhlIGNsaWNrLlxuXHQgKlxuXHQgKiBAcmV0dXJucyB7dm9pZH1cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUub25Ub3VjaENhbmNlbCA9IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMudHJhY2tpbmdDbGljayA9IGZhbHNlO1xuXHRcdHRoaXMudGFyZ2V0RWxlbWVudCA9IG51bGw7XG5cdH07XG5cblxuXHQvKipcblx0ICogRGV0ZXJtaW5lIG1vdXNlIGV2ZW50cyB3aGljaCBzaG91bGQgYmUgcGVybWl0dGVkLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUub25Nb3VzZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cblx0XHQvLyBJZiBhIHRhcmdldCBlbGVtZW50IHdhcyBuZXZlciBzZXQgKGJlY2F1c2UgYSB0b3VjaCBldmVudCB3YXMgbmV2ZXIgZmlyZWQpIGFsbG93IHRoZSBldmVudFxuXHRcdGlmICghdGhpcy50YXJnZXRFbGVtZW50KSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAoZXZlbnQuZm9yd2FyZGVkVG91Y2hFdmVudCkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gUHJvZ3JhbW1hdGljYWxseSBnZW5lcmF0ZWQgZXZlbnRzIHRhcmdldGluZyBhIHNwZWNpZmljIGVsZW1lbnQgc2hvdWxkIGJlIHBlcm1pdHRlZFxuXHRcdGlmICghZXZlbnQuY2FuY2VsYWJsZSkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gRGVyaXZlIGFuZCBjaGVjayB0aGUgdGFyZ2V0IGVsZW1lbnQgdG8gc2VlIHdoZXRoZXIgdGhlIG1vdXNlIGV2ZW50IG5lZWRzIHRvIGJlIHBlcm1pdHRlZDtcblx0XHQvLyB1bmxlc3MgZXhwbGljaXRseSBlbmFibGVkLCBwcmV2ZW50IG5vbi10b3VjaCBjbGljayBldmVudHMgZnJvbSB0cmlnZ2VyaW5nIGFjdGlvbnMsXG5cdFx0Ly8gdG8gcHJldmVudCBnaG9zdC9kb3VibGVjbGlja3MuXG5cdFx0aWYgKCF0aGlzLm5lZWRzQ2xpY2sodGhpcy50YXJnZXRFbGVtZW50KSB8fCB0aGlzLmNhbmNlbE5leHRDbGljaykge1xuXG5cdFx0XHQvLyBQcmV2ZW50IGFueSB1c2VyLWFkZGVkIGxpc3RlbmVycyBkZWNsYXJlZCBvbiBGYXN0Q2xpY2sgZWxlbWVudCBmcm9tIGJlaW5nIGZpcmVkLlxuXHRcdFx0aWYgKGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbikge1xuXHRcdFx0XHRldmVudC5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0Ly8gUGFydCBvZiB0aGUgaGFjayBmb3IgYnJvd3NlcnMgdGhhdCBkb24ndCBzdXBwb3J0IEV2ZW50I3N0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbiAoZS5nLiBBbmRyb2lkIDIpXG5cdFx0XHRcdGV2ZW50LnByb3BhZ2F0aW9uU3RvcHBlZCA9IHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdC8vIENhbmNlbCB0aGUgZXZlbnRcblx0XHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIElmIHRoZSBtb3VzZSBldmVudCBpcyBwZXJtaXR0ZWQsIHJldHVybiB0cnVlIGZvciB0aGUgYWN0aW9uIHRvIGdvIHRocm91Z2guXG5cdFx0cmV0dXJuIHRydWU7XG5cdH07XG5cblxuXHQvKipcblx0ICogT24gYWN0dWFsIGNsaWNrcywgZGV0ZXJtaW5lIHdoZXRoZXIgdGhpcyBpcyBhIHRvdWNoLWdlbmVyYXRlZCBjbGljaywgYSBjbGljayBhY3Rpb24gb2NjdXJyaW5nXG5cdCAqIG5hdHVyYWxseSBhZnRlciBhIGRlbGF5IGFmdGVyIGEgdG91Y2ggKHdoaWNoIG5lZWRzIHRvIGJlIGNhbmNlbGxlZCB0byBhdm9pZCBkdXBsaWNhdGlvbiksIG9yXG5cdCAqIGFuIGFjdHVhbCBjbGljayB3aGljaCBzaG91bGQgYmUgcGVybWl0dGVkLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuXHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUub25DbGljayA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0dmFyIHBlcm1pdHRlZDtcblxuXHRcdC8vIEl0J3MgcG9zc2libGUgZm9yIGFub3RoZXIgRmFzdENsaWNrLWxpa2UgbGlicmFyeSBkZWxpdmVyZWQgd2l0aCB0aGlyZC1wYXJ0eSBjb2RlIHRvIGZpcmUgYSBjbGljayBldmVudCBiZWZvcmUgRmFzdENsaWNrIGRvZXMgKGlzc3VlICM0NCkuIEluIHRoYXQgY2FzZSwgc2V0IHRoZSBjbGljay10cmFja2luZyBmbGFnIGJhY2sgdG8gZmFsc2UgYW5kIHJldHVybiBlYXJseS4gVGhpcyB3aWxsIGNhdXNlIG9uVG91Y2hFbmQgdG8gcmV0dXJuIGVhcmx5LlxuXHRcdGlmICh0aGlzLnRyYWNraW5nQ2xpY2spIHtcblx0XHRcdHRoaXMudGFyZ2V0RWxlbWVudCA9IG51bGw7XG5cdFx0XHR0aGlzLnRyYWNraW5nQ2xpY2sgPSBmYWxzZTtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIFZlcnkgb2RkIGJlaGF2aW91ciBvbiBpT1MgKGlzc3VlICMxOCk6IGlmIGEgc3VibWl0IGVsZW1lbnQgaXMgcHJlc2VudCBpbnNpZGUgYSBmb3JtIGFuZCB0aGUgdXNlciBoaXRzIGVudGVyIGluIHRoZSBpT1Mgc2ltdWxhdG9yIG9yIGNsaWNrcyB0aGUgR28gYnV0dG9uIG9uIHRoZSBwb3AtdXAgT1Mga2V5Ym9hcmQgdGhlIGEga2luZCBvZiAnZmFrZScgY2xpY2sgZXZlbnQgd2lsbCBiZSB0cmlnZ2VyZWQgd2l0aCB0aGUgc3VibWl0LXR5cGUgaW5wdXQgZWxlbWVudCBhcyB0aGUgdGFyZ2V0LlxuXHRcdGlmIChldmVudC50YXJnZXQudHlwZSA9PT0gJ3N1Ym1pdCcgJiYgZXZlbnQuZGV0YWlsID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHRwZXJtaXR0ZWQgPSB0aGlzLm9uTW91c2UoZXZlbnQpO1xuXG5cdFx0Ly8gT25seSB1bnNldCB0YXJnZXRFbGVtZW50IGlmIHRoZSBjbGljayBpcyBub3QgcGVybWl0dGVkLiBUaGlzIHdpbGwgZW5zdXJlIHRoYXQgdGhlIGNoZWNrIGZvciAhdGFyZ2V0RWxlbWVudCBpbiBvbk1vdXNlIGZhaWxzIGFuZCB0aGUgYnJvd3NlcidzIGNsaWNrIGRvZXNuJ3QgZ28gdGhyb3VnaC5cblx0XHRpZiAoIXBlcm1pdHRlZCkge1xuXHRcdFx0dGhpcy50YXJnZXRFbGVtZW50ID0gbnVsbDtcblx0XHR9XG5cblx0XHQvLyBJZiBjbGlja3MgYXJlIHBlcm1pdHRlZCwgcmV0dXJuIHRydWUgZm9yIHRoZSBhY3Rpb24gdG8gZ28gdGhyb3VnaC5cblx0XHRyZXR1cm4gcGVybWl0dGVkO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIFJlbW92ZSBhbGwgRmFzdENsaWNrJ3MgZXZlbnQgbGlzdGVuZXJzLlxuXHQgKlxuXHQgKiBAcmV0dXJucyB7dm9pZH1cblx0ICovXG5cdEZhc3RDbGljay5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBsYXllciA9IHRoaXMubGF5ZXI7XG5cblx0XHRpZiAoZGV2aWNlSXNBbmRyb2lkKSB7XG5cdFx0XHRsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCB0aGlzLm9uTW91c2UsIHRydWUpO1xuXHRcdFx0bGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5vbk1vdXNlLCB0cnVlKTtcblx0XHRcdGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLm9uTW91c2UsIHRydWUpO1xuXHRcdH1cblxuXHRcdGxheWVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5vbkNsaWNrLCB0cnVlKTtcblx0XHRsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdGhpcy5vblRvdWNoU3RhcnQsIGZhbHNlKTtcblx0XHRsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLm9uVG91Y2hNb3ZlLCBmYWxzZSk7XG5cdFx0bGF5ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB0aGlzLm9uVG91Y2hFbmQsIGZhbHNlKTtcblx0XHRsYXllci5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGNhbmNlbCcsIHRoaXMub25Ub3VjaENhbmNlbCwgZmFsc2UpO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIENoZWNrIHdoZXRoZXIgRmFzdENsaWNrIGlzIG5lZWRlZC5cblx0ICpcblx0ICogQHBhcmFtIHtFbGVtZW50fSBsYXllciBUaGUgbGF5ZXIgdG8gbGlzdGVuIG9uXG5cdCAqL1xuXHRGYXN0Q2xpY2subm90TmVlZGVkID0gZnVuY3Rpb24obGF5ZXIpIHtcblx0XHR2YXIgbWV0YVZpZXdwb3J0O1xuXHRcdHZhciBjaHJvbWVWZXJzaW9uO1xuXHRcdHZhciBibGFja2JlcnJ5VmVyc2lvbjtcblx0XHR2YXIgZmlyZWZveFZlcnNpb247XG5cblx0XHQvLyBEZXZpY2VzIHRoYXQgZG9uJ3Qgc3VwcG9ydCB0b3VjaCBkb24ndCBuZWVkIEZhc3RDbGlja1xuXHRcdGlmICh0eXBlb2Ygd2luZG93Lm9udG91Y2hzdGFydCA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIENocm9tZSB2ZXJzaW9uIC0gemVybyBmb3Igb3RoZXIgYnJvd3NlcnNcblx0XHRjaHJvbWVWZXJzaW9uID0gKygvQ2hyb21lXFwvKFswLTldKykvLmV4ZWMobmF2aWdhdG9yLnVzZXJBZ2VudCkgfHwgWywwXSlbMV07XG5cblx0XHRpZiAoY2hyb21lVmVyc2lvbikge1xuXG5cdFx0XHRpZiAoZGV2aWNlSXNBbmRyb2lkKSB7XG5cdFx0XHRcdG1ldGFWaWV3cG9ydCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ21ldGFbbmFtZT12aWV3cG9ydF0nKTtcblxuXHRcdFx0XHRpZiAobWV0YVZpZXdwb3J0KSB7XG5cdFx0XHRcdFx0Ly8gQ2hyb21lIG9uIEFuZHJvaWQgd2l0aCB1c2VyLXNjYWxhYmxlPVwibm9cIiBkb2Vzbid0IG5lZWQgRmFzdENsaWNrIChpc3N1ZSAjODkpXG5cdFx0XHRcdFx0aWYgKG1ldGFWaWV3cG9ydC5jb250ZW50LmluZGV4T2YoJ3VzZXItc2NhbGFibGU9bm8nKSAhPT0gLTEpIHtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBDaHJvbWUgMzIgYW5kIGFib3ZlIHdpdGggd2lkdGg9ZGV2aWNlLXdpZHRoIG9yIGxlc3MgZG9uJ3QgbmVlZCBGYXN0Q2xpY2tcblx0XHRcdFx0XHRpZiAoY2hyb21lVmVyc2lvbiA+IDMxICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxXaWR0aCA8PSB3aW5kb3cub3V0ZXJXaWR0aCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdC8vIENocm9tZSBkZXNrdG9wIGRvZXNuJ3QgbmVlZCBGYXN0Q2xpY2sgKGlzc3VlICMxNSlcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChkZXZpY2VJc0JsYWNrQmVycnkxMCkge1xuXHRcdFx0YmxhY2tiZXJyeVZlcnNpb24gPSBuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9WZXJzaW9uXFwvKFswLTldKilcXC4oWzAtOV0qKS8pO1xuXG5cdFx0XHQvLyBCbGFja0JlcnJ5IDEwLjMrIGRvZXMgbm90IHJlcXVpcmUgRmFzdGNsaWNrIGxpYnJhcnkuXG5cdFx0XHQvLyBodHRwczovL2dpdGh1Yi5jb20vZnRsYWJzL2Zhc3RjbGljay9pc3N1ZXMvMjUxXG5cdFx0XHRpZiAoYmxhY2tiZXJyeVZlcnNpb25bMV0gPj0gMTAgJiYgYmxhY2tiZXJyeVZlcnNpb25bMl0gPj0gMykge1xuXHRcdFx0XHRtZXRhVmlld3BvcnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdtZXRhW25hbWU9dmlld3BvcnRdJyk7XG5cblx0XHRcdFx0aWYgKG1ldGFWaWV3cG9ydCkge1xuXHRcdFx0XHRcdC8vIHVzZXItc2NhbGFibGU9bm8gZWxpbWluYXRlcyBjbGljayBkZWxheS5cblx0XHRcdFx0XHRpZiAobWV0YVZpZXdwb3J0LmNvbnRlbnQuaW5kZXhPZigndXNlci1zY2FsYWJsZT1ubycpICE9PSAtMSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIHdpZHRoPWRldmljZS13aWR0aCAob3IgbGVzcyB0aGFuIGRldmljZS13aWR0aCkgZWxpbWluYXRlcyBjbGljayBkZWxheS5cblx0XHRcdFx0XHRpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFdpZHRoIDw9IHdpbmRvdy5vdXRlcldpZHRoKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBJRTEwIHdpdGggLW1zLXRvdWNoLWFjdGlvbjogbm9uZSBvciBtYW5pcHVsYXRpb24sIHdoaWNoIGRpc2FibGVzIGRvdWJsZS10YXAtdG8tem9vbSAoaXNzdWUgIzk3KVxuXHRcdGlmIChsYXllci5zdHlsZS5tc1RvdWNoQWN0aW9uID09PSAnbm9uZScgfHwgbGF5ZXIuc3R5bGUudG91Y2hBY3Rpb24gPT09ICdtYW5pcHVsYXRpb24nKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyBGaXJlZm94IHZlcnNpb24gLSB6ZXJvIGZvciBvdGhlciBicm93c2Vyc1xuXHRcdGZpcmVmb3hWZXJzaW9uID0gKygvRmlyZWZveFxcLyhbMC05XSspLy5leGVjKG5hdmlnYXRvci51c2VyQWdlbnQpIHx8IFssMF0pWzFdO1xuXG5cdFx0aWYgKGZpcmVmb3hWZXJzaW9uID49IDI3KSB7XG5cdFx0XHQvLyBGaXJlZm94IDI3KyBkb2VzIG5vdCBoYXZlIHRhcCBkZWxheSBpZiB0aGUgY29udGVudCBpcyBub3Qgem9vbWFibGUgLSBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD05MjI4OTZcblxuXHRcdFx0bWV0YVZpZXdwb3J0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbWV0YVtuYW1lPXZpZXdwb3J0XScpO1xuXHRcdFx0aWYgKG1ldGFWaWV3cG9ydCAmJiAobWV0YVZpZXdwb3J0LmNvbnRlbnQuaW5kZXhPZigndXNlci1zY2FsYWJsZT1ubycpICE9PSAtMSB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsV2lkdGggPD0gd2luZG93Lm91dGVyV2lkdGgpKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIElFMTE6IHByZWZpeGVkIC1tcy10b3VjaC1hY3Rpb24gaXMgbm8gbG9uZ2VyIHN1cHBvcnRlZCBhbmQgaXQncyByZWNvbWVuZGVkIHRvIHVzZSBub24tcHJlZml4ZWQgdmVyc2lvblxuXHRcdC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS93aW5kb3dzL2FwcHMvSGg3NjczMTMuYXNweFxuXHRcdGlmIChsYXllci5zdHlsZS50b3VjaEFjdGlvbiA9PT0gJ25vbmUnIHx8IGxheWVyLnN0eWxlLnRvdWNoQWN0aW9uID09PSAnbWFuaXB1bGF0aW9uJykge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9O1xuXG5cblx0LyoqXG5cdCAqIEZhY3RvcnkgbWV0aG9kIGZvciBjcmVhdGluZyBhIEZhc3RDbGljayBvYmplY3Rcblx0ICpcblx0ICogQHBhcmFtIHtFbGVtZW50fSBsYXllciBUaGUgbGF5ZXIgdG8gbGlzdGVuIG9uXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gVGhlIG9wdGlvbnMgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHRzXG5cdCAqL1xuXHRGYXN0Q2xpY2suYXR0YWNoID0gZnVuY3Rpb24obGF5ZXIsIG9wdGlvbnMpIHtcblx0XHRyZXR1cm4gbmV3IEZhc3RDbGljayhsYXllciwgb3B0aW9ucyk7XG5cdH07XG5cblxuXHRpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PT0gJ29iamVjdCcgJiYgZGVmaW5lLmFtZCkge1xuXG5cdFx0Ly8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuXHRcdGRlZmluZShmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBGYXN0Q2xpY2s7XG5cdFx0fSk7XG5cdH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0XHRtb2R1bGUuZXhwb3J0cyA9IEZhc3RDbGljay5hdHRhY2g7XG5cdFx0bW9kdWxlLmV4cG9ydHMuRmFzdENsaWNrID0gRmFzdENsaWNrO1xuXHR9IGVsc2Uge1xuXHRcdHdpbmRvdy5GYXN0Q2xpY2sgPSBGYXN0Q2xpY2s7XG5cdH1cbn0oKSk7XG4iLCJ2YXIgVk5vZGUgPSByZXF1aXJlKCcuL3Zub2RlJyk7XG52YXIgaXMgPSByZXF1aXJlKCcuL2lzJyk7XG5cbmZ1bmN0aW9uIGFkZE5TKGRhdGEsIGNoaWxkcmVuLCBzZWwpIHtcbiAgZGF0YS5ucyA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc7XG5cbiAgaWYgKHNlbCAhPT0gJ2ZvcmVpZ25PYmplY3QnICYmIGNoaWxkcmVuICE9PSB1bmRlZmluZWQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICBhZGROUyhjaGlsZHJlbltpXS5kYXRhLCBjaGlsZHJlbltpXS5jaGlsZHJlbiwgY2hpbGRyZW5baV0uc2VsKTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBoKHNlbCwgYiwgYykge1xuICB2YXIgZGF0YSA9IHt9LCBjaGlsZHJlbiwgdGV4dCwgaTtcbiAgaWYgKGMgIT09IHVuZGVmaW5lZCkge1xuICAgIGRhdGEgPSBiO1xuICAgIGlmIChpcy5hcnJheShjKSkgeyBjaGlsZHJlbiA9IGM7IH1cbiAgICBlbHNlIGlmIChpcy5wcmltaXRpdmUoYykpIHsgdGV4dCA9IGM7IH1cbiAgfSBlbHNlIGlmIChiICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAoaXMuYXJyYXkoYikpIHsgY2hpbGRyZW4gPSBiOyB9XG4gICAgZWxzZSBpZiAoaXMucHJpbWl0aXZlKGIpKSB7IHRleHQgPSBiOyB9XG4gICAgZWxzZSB7IGRhdGEgPSBiOyB9XG4gIH1cbiAgaWYgKGlzLmFycmF5KGNoaWxkcmVuKSkge1xuICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgaWYgKGlzLnByaW1pdGl2ZShjaGlsZHJlbltpXSkpIGNoaWxkcmVuW2ldID0gVk5vZGUodW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgY2hpbGRyZW5baV0pO1xuICAgIH1cbiAgfVxuICBpZiAoc2VsWzBdID09PSAncycgJiYgc2VsWzFdID09PSAndicgJiYgc2VsWzJdID09PSAnZycpIHtcbiAgICBhZGROUyhkYXRhLCBjaGlsZHJlbiwgc2VsKTtcbiAgfVxuICByZXR1cm4gVk5vZGUoc2VsLCBkYXRhLCBjaGlsZHJlbiwgdGV4dCwgdW5kZWZpbmVkKTtcbn07XG4iLCJmdW5jdGlvbiBjcmVhdGVFbGVtZW50KHRhZ05hbWUpe1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSwgcXVhbGlmaWVkTmFtZSl7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlVVJJLCBxdWFsaWZpZWROYW1lKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlVGV4dE5vZGUodGV4dCl7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0KTtcbn1cblxuXG5mdW5jdGlvbiBpbnNlcnRCZWZvcmUocGFyZW50Tm9kZSwgbmV3Tm9kZSwgcmVmZXJlbmNlTm9kZSl7XG4gIHBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5ld05vZGUsIHJlZmVyZW5jZU5vZGUpO1xufVxuXG5cbmZ1bmN0aW9uIHJlbW92ZUNoaWxkKG5vZGUsIGNoaWxkKXtcbiAgbm9kZS5yZW1vdmVDaGlsZChjaGlsZCk7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZENoaWxkKG5vZGUsIGNoaWxkKXtcbiAgbm9kZS5hcHBlbmRDaGlsZChjaGlsZCk7XG59XG5cbmZ1bmN0aW9uIHBhcmVudE5vZGUobm9kZSl7XG4gIHJldHVybiBub2RlLnBhcmVudEVsZW1lbnQ7XG59XG5cbmZ1bmN0aW9uIG5leHRTaWJsaW5nKG5vZGUpe1xuICByZXR1cm4gbm9kZS5uZXh0U2libGluZztcbn1cblxuZnVuY3Rpb24gdGFnTmFtZShub2RlKXtcbiAgcmV0dXJuIG5vZGUudGFnTmFtZTtcbn1cblxuZnVuY3Rpb24gc2V0VGV4dENvbnRlbnQobm9kZSwgdGV4dCl7XG4gIG5vZGUudGV4dENvbnRlbnQgPSB0ZXh0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlRWxlbWVudDogY3JlYXRlRWxlbWVudCxcbiAgY3JlYXRlRWxlbWVudE5TOiBjcmVhdGVFbGVtZW50TlMsXG4gIGNyZWF0ZVRleHROb2RlOiBjcmVhdGVUZXh0Tm9kZSxcbiAgYXBwZW5kQ2hpbGQ6IGFwcGVuZENoaWxkLFxuICByZW1vdmVDaGlsZDogcmVtb3ZlQ2hpbGQsXG4gIGluc2VydEJlZm9yZTogaW5zZXJ0QmVmb3JlLFxuICBwYXJlbnROb2RlOiBwYXJlbnROb2RlLFxuICBuZXh0U2libGluZzogbmV4dFNpYmxpbmcsXG4gIHRhZ05hbWU6IHRhZ05hbWUsXG4gIHNldFRleHRDb250ZW50OiBzZXRUZXh0Q29udGVudFxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBhcnJheTogQXJyYXkuaXNBcnJheSxcbiAgcHJpbWl0aXZlOiBmdW5jdGlvbihzKSB7IHJldHVybiB0eXBlb2YgcyA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHMgPT09ICdudW1iZXInOyB9LFxufTtcbiIsInZhciBOYW1lc3BhY2VVUklzID0ge1xuICBcInhsaW5rXCI6IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiXG59O1xuXG52YXIgYm9vbGVhbkF0dHJzID0gW1wiYWxsb3dmdWxsc2NyZWVuXCIsIFwiYXN5bmNcIiwgXCJhdXRvZm9jdXNcIiwgXCJhdXRvcGxheVwiLCBcImNoZWNrZWRcIiwgXCJjb21wYWN0XCIsIFwiY29udHJvbHNcIiwgXCJkZWNsYXJlXCIsXG4gICAgICAgICAgICAgICAgXCJkZWZhdWx0XCIsIFwiZGVmYXVsdGNoZWNrZWRcIiwgXCJkZWZhdWx0bXV0ZWRcIiwgXCJkZWZhdWx0c2VsZWN0ZWRcIiwgXCJkZWZlclwiLCBcImRpc2FibGVkXCIsIFwiZHJhZ2dhYmxlXCIsXG4gICAgICAgICAgICAgICAgXCJlbmFibGVkXCIsIFwiZm9ybW5vdmFsaWRhdGVcIiwgXCJoaWRkZW5cIiwgXCJpbmRldGVybWluYXRlXCIsIFwiaW5lcnRcIiwgXCJpc21hcFwiLCBcIml0ZW1zY29wZVwiLCBcImxvb3BcIiwgXCJtdWx0aXBsZVwiLFxuICAgICAgICAgICAgICAgIFwibXV0ZWRcIiwgXCJub2hyZWZcIiwgXCJub3Jlc2l6ZVwiLCBcIm5vc2hhZGVcIiwgXCJub3ZhbGlkYXRlXCIsIFwibm93cmFwXCIsIFwib3BlblwiLCBcInBhdXNlb25leGl0XCIsIFwicmVhZG9ubHlcIixcbiAgICAgICAgICAgICAgICBcInJlcXVpcmVkXCIsIFwicmV2ZXJzZWRcIiwgXCJzY29wZWRcIiwgXCJzZWFtbGVzc1wiLCBcInNlbGVjdGVkXCIsIFwic29ydGFibGVcIiwgXCJzcGVsbGNoZWNrXCIsIFwidHJhbnNsYXRlXCIsXG4gICAgICAgICAgICAgICAgXCJ0cnVlc3BlZWRcIiwgXCJ0eXBlbXVzdG1hdGNoXCIsIFwidmlzaWJsZVwiXTtcblxudmFyIGJvb2xlYW5BdHRyc0RpY3QgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuZm9yKHZhciBpPTAsIGxlbiA9IGJvb2xlYW5BdHRycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICBib29sZWFuQXR0cnNEaWN0W2Jvb2xlYW5BdHRyc1tpXV0gPSB0cnVlO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVBdHRycyhvbGRWbm9kZSwgdm5vZGUpIHtcbiAgdmFyIGtleSwgY3VyLCBvbGQsIGVsbSA9IHZub2RlLmVsbSxcbiAgICAgIG9sZEF0dHJzID0gb2xkVm5vZGUuZGF0YS5hdHRycywgYXR0cnMgPSB2bm9kZS5kYXRhLmF0dHJzLCBuYW1lc3BhY2VTcGxpdDtcblxuICBpZiAoIW9sZEF0dHJzICYmICFhdHRycykgcmV0dXJuO1xuICBvbGRBdHRycyA9IG9sZEF0dHJzIHx8IHt9O1xuICBhdHRycyA9IGF0dHJzIHx8IHt9O1xuXG4gIC8vIHVwZGF0ZSBtb2RpZmllZCBhdHRyaWJ1dGVzLCBhZGQgbmV3IGF0dHJpYnV0ZXNcbiAgZm9yIChrZXkgaW4gYXR0cnMpIHtcbiAgICBjdXIgPSBhdHRyc1trZXldO1xuICAgIG9sZCA9IG9sZEF0dHJzW2tleV07XG4gICAgaWYgKG9sZCAhPT0gY3VyKSB7XG4gICAgICBpZighY3VyICYmIGJvb2xlYW5BdHRyc0RpY3Rba2V5XSlcbiAgICAgICAgZWxtLnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICAgICAgZWxzZSB7XG4gICAgICAgIG5hbWVzcGFjZVNwbGl0ID0ga2V5LnNwbGl0KFwiOlwiKTtcbiAgICAgICAgaWYobmFtZXNwYWNlU3BsaXQubGVuZ3RoID4gMSAmJiBOYW1lc3BhY2VVUklzLmhhc093blByb3BlcnR5KG5hbWVzcGFjZVNwbGl0WzBdKSlcbiAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlTlMoTmFtZXNwYWNlVVJJc1tuYW1lc3BhY2VTcGxpdFswXV0sIGtleSwgY3VyKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGVsbS5zZXRBdHRyaWJ1dGUoa2V5LCBjdXIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvL3JlbW92ZSByZW1vdmVkIGF0dHJpYnV0ZXNcbiAgLy8gdXNlIGBpbmAgb3BlcmF0b3Igc2luY2UgdGhlIHByZXZpb3VzIGBmb3JgIGl0ZXJhdGlvbiB1c2VzIGl0ICguaS5lLiBhZGQgZXZlbiBhdHRyaWJ1dGVzIHdpdGggdW5kZWZpbmVkIHZhbHVlKVxuICAvLyB0aGUgb3RoZXIgb3B0aW9uIGlzIHRvIHJlbW92ZSBhbGwgYXR0cmlidXRlcyB3aXRoIHZhbHVlID09IHVuZGVmaW5lZFxuICBmb3IgKGtleSBpbiBvbGRBdHRycykge1xuICAgIGlmICghKGtleSBpbiBhdHRycykpIHtcbiAgICAgIGVsbS5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7Y3JlYXRlOiB1cGRhdGVBdHRycywgdXBkYXRlOiB1cGRhdGVBdHRyc307XG4iLCJmdW5jdGlvbiB1cGRhdGVDbGFzcyhvbGRWbm9kZSwgdm5vZGUpIHtcbiAgdmFyIGN1ciwgbmFtZSwgZWxtID0gdm5vZGUuZWxtLFxuICAgICAgb2xkQ2xhc3MgPSBvbGRWbm9kZS5kYXRhLmNsYXNzLFxuICAgICAga2xhc3MgPSB2bm9kZS5kYXRhLmNsYXNzO1xuXG4gIGlmICghb2xkQ2xhc3MgJiYgIWtsYXNzKSByZXR1cm47XG4gIG9sZENsYXNzID0gb2xkQ2xhc3MgfHwge307XG4gIGtsYXNzID0ga2xhc3MgfHwge307XG5cbiAgZm9yIChuYW1lIGluIG9sZENsYXNzKSB7XG4gICAgaWYgKCFrbGFzc1tuYW1lXSkge1xuICAgICAgZWxtLmNsYXNzTGlzdC5yZW1vdmUobmFtZSk7XG4gICAgfVxuICB9XG4gIGZvciAobmFtZSBpbiBrbGFzcykge1xuICAgIGN1ciA9IGtsYXNzW25hbWVdO1xuICAgIGlmIChjdXIgIT09IG9sZENsYXNzW25hbWVdKSB7XG4gICAgICBlbG0uY2xhc3NMaXN0W2N1ciA/ICdhZGQnIDogJ3JlbW92ZSddKG5hbWUpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtjcmVhdGU6IHVwZGF0ZUNsYXNzLCB1cGRhdGU6IHVwZGF0ZUNsYXNzfTtcbiIsImZ1bmN0aW9uIGludm9rZUhhbmRsZXIoaGFuZGxlciwgdm5vZGUsIGV2ZW50KSB7XG4gIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgLy8gY2FsbCBmdW5jdGlvbiBoYW5kbGVyXG4gICAgaGFuZGxlci5jYWxsKHZub2RlLCBldmVudCwgdm5vZGUpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiKSB7XG4gICAgLy8gY2FsbCBoYW5kbGVyIHdpdGggYXJndW1lbnRzXG4gICAgaWYgKHR5cGVvZiBoYW5kbGVyWzBdID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIC8vIHNwZWNpYWwgY2FzZSBmb3Igc2luZ2xlIGFyZ3VtZW50IGZvciBwZXJmb3JtYW5jZVxuICAgICAgaWYgKGhhbmRsZXIubGVuZ3RoID09PSAyKSB7XG4gICAgICAgIGhhbmRsZXJbMF0uY2FsbCh2bm9kZSwgaGFuZGxlclsxXSwgZXZlbnQsIHZub2RlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBhcmdzID0gaGFuZGxlci5zbGljZSgxKTtcbiAgICAgICAgYXJncy5wdXNoKGV2ZW50KTtcbiAgICAgICAgYXJncy5wdXNoKHZub2RlKTtcbiAgICAgICAgaGFuZGxlclswXS5hcHBseSh2bm9kZSwgYXJncyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGNhbGwgbXVsdGlwbGUgaGFuZGxlcnNcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGFuZGxlci5sZW5ndGg7IGkrKykge1xuICAgICAgICBpbnZva2VIYW5kbGVyKGhhbmRsZXJbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBoYW5kbGVFdmVudChldmVudCwgdm5vZGUpIHtcbiAgdmFyIG5hbWUgPSBldmVudC50eXBlLFxuICAgICAgb24gPSB2bm9kZS5kYXRhLm9uO1xuXG4gIC8vIGNhbGwgZXZlbnQgaGFuZGxlcihzKSBpZiBleGlzdHNcbiAgaWYgKG9uICYmIG9uW25hbWVdKSB7XG4gICAgaW52b2tlSGFuZGxlcihvbltuYW1lXSwgdm5vZGUsIGV2ZW50KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVMaXN0ZW5lcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGhhbmRsZXIoZXZlbnQpIHtcbiAgICBoYW5kbGVFdmVudChldmVudCwgaGFuZGxlci52bm9kZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlRXZlbnRMaXN0ZW5lcnMob2xkVm5vZGUsIHZub2RlKSB7XG4gIHZhciBvbGRPbiA9IG9sZFZub2RlLmRhdGEub24sXG4gICAgICBvbGRMaXN0ZW5lciA9IG9sZFZub2RlLmxpc3RlbmVyLFxuICAgICAgb2xkRWxtID0gb2xkVm5vZGUuZWxtLFxuICAgICAgb24gPSB2bm9kZSAmJiB2bm9kZS5kYXRhLm9uLFxuICAgICAgZWxtID0gdm5vZGUgJiYgdm5vZGUuZWxtLFxuICAgICAgbmFtZTtcblxuICAvLyBvcHRpbWl6YXRpb24gZm9yIHJldXNlZCBpbW11dGFibGUgaGFuZGxlcnNcbiAgaWYgKG9sZE9uID09PSBvbikge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIHJlbW92ZSBleGlzdGluZyBsaXN0ZW5lcnMgd2hpY2ggbm8gbG9uZ2VyIHVzZWRcbiAgaWYgKG9sZE9uICYmIG9sZExpc3RlbmVyKSB7XG4gICAgLy8gaWYgZWxlbWVudCBjaGFuZ2VkIG9yIGRlbGV0ZWQgd2UgcmVtb3ZlIGFsbCBleGlzdGluZyBsaXN0ZW5lcnMgdW5jb25kaXRpb25hbGx5XG4gICAgaWYgKCFvbikge1xuICAgICAgZm9yIChuYW1lIGluIG9sZE9uKSB7XG4gICAgICAgIC8vIHJlbW92ZSBsaXN0ZW5lciBpZiBlbGVtZW50IHdhcyBjaGFuZ2VkIG9yIGV4aXN0aW5nIGxpc3RlbmVycyByZW1vdmVkXG4gICAgICAgIG9sZEVsbS5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIG9sZExpc3RlbmVyLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAobmFtZSBpbiBvbGRPbikge1xuICAgICAgICAvLyByZW1vdmUgbGlzdGVuZXIgaWYgZXhpc3RpbmcgbGlzdGVuZXIgcmVtb3ZlZFxuICAgICAgICBpZiAoIW9uW25hbWVdKSB7XG4gICAgICAgICAgb2xkRWxtLnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgb2xkTGlzdGVuZXIsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIGFkZCBuZXcgbGlzdGVuZXJzIHdoaWNoIGhhcyBub3QgYWxyZWFkeSBhdHRhY2hlZFxuICBpZiAob24pIHtcbiAgICAvLyByZXVzZSBleGlzdGluZyBsaXN0ZW5lciBvciBjcmVhdGUgbmV3XG4gICAgdmFyIGxpc3RlbmVyID0gdm5vZGUubGlzdGVuZXIgPSBvbGRWbm9kZS5saXN0ZW5lciB8fCBjcmVhdGVMaXN0ZW5lcigpO1xuICAgIC8vIHVwZGF0ZSB2bm9kZSBmb3IgbGlzdGVuZXJcbiAgICBsaXN0ZW5lci52bm9kZSA9IHZub2RlO1xuXG4gICAgLy8gaWYgZWxlbWVudCBjaGFuZ2VkIG9yIGFkZGVkIHdlIGFkZCBhbGwgbmVlZGVkIGxpc3RlbmVycyB1bmNvbmRpdGlvbmFsbHlcbiAgICBpZiAoIW9sZE9uKSB7XG4gICAgICBmb3IgKG5hbWUgaW4gb24pIHtcbiAgICAgICAgLy8gYWRkIGxpc3RlbmVyIGlmIGVsZW1lbnQgd2FzIGNoYW5nZWQgb3IgbmV3IGxpc3RlbmVycyBhZGRlZFxuICAgICAgICBlbG0uYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBsaXN0ZW5lciwgZmFsc2UpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKG5hbWUgaW4gb24pIHtcbiAgICAgICAgLy8gYWRkIGxpc3RlbmVyIGlmIG5ldyBsaXN0ZW5lciBhZGRlZFxuICAgICAgICBpZiAoIW9sZE9uW25hbWVdKSB7XG4gICAgICAgICAgZWxtLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgbGlzdGVuZXIsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiB1cGRhdGVFdmVudExpc3RlbmVycyxcbiAgdXBkYXRlOiB1cGRhdGVFdmVudExpc3RlbmVycyxcbiAgZGVzdHJveTogdXBkYXRlRXZlbnRMaXN0ZW5lcnNcbn07XG4iLCJmdW5jdGlvbiB1cGRhdGVQcm9wcyhvbGRWbm9kZSwgdm5vZGUpIHtcbiAgdmFyIGtleSwgY3VyLCBvbGQsIGVsbSA9IHZub2RlLmVsbSxcbiAgICAgIG9sZFByb3BzID0gb2xkVm5vZGUuZGF0YS5wcm9wcywgcHJvcHMgPSB2bm9kZS5kYXRhLnByb3BzO1xuXG4gIGlmICghb2xkUHJvcHMgJiYgIXByb3BzKSByZXR1cm47XG4gIG9sZFByb3BzID0gb2xkUHJvcHMgfHwge307XG4gIHByb3BzID0gcHJvcHMgfHwge307XG5cbiAgZm9yIChrZXkgaW4gb2xkUHJvcHMpIHtcbiAgICBpZiAoIXByb3BzW2tleV0pIHtcbiAgICAgIGRlbGV0ZSBlbG1ba2V5XTtcbiAgICB9XG4gIH1cbiAgZm9yIChrZXkgaW4gcHJvcHMpIHtcbiAgICBjdXIgPSBwcm9wc1trZXldO1xuICAgIG9sZCA9IG9sZFByb3BzW2tleV07XG4gICAgaWYgKG9sZCAhPT0gY3VyICYmIChrZXkgIT09ICd2YWx1ZScgfHwgZWxtW2tleV0gIT09IGN1cikpIHtcbiAgICAgIGVsbVtrZXldID0gY3VyO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtjcmVhdGU6IHVwZGF0ZVByb3BzLCB1cGRhdGU6IHVwZGF0ZVByb3BzfTtcbiIsInZhciByYWYgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkgfHwgc2V0VGltZW91dDtcbnZhciBuZXh0RnJhbWUgPSBmdW5jdGlvbihmbikgeyByYWYoZnVuY3Rpb24oKSB7IHJhZihmbik7IH0pOyB9O1xuXG5mdW5jdGlvbiBzZXROZXh0RnJhbWUob2JqLCBwcm9wLCB2YWwpIHtcbiAgbmV4dEZyYW1lKGZ1bmN0aW9uKCkgeyBvYmpbcHJvcF0gPSB2YWw7IH0pO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVTdHlsZShvbGRWbm9kZSwgdm5vZGUpIHtcbiAgdmFyIGN1ciwgbmFtZSwgZWxtID0gdm5vZGUuZWxtLFxuICAgICAgb2xkU3R5bGUgPSBvbGRWbm9kZS5kYXRhLnN0eWxlLFxuICAgICAgc3R5bGUgPSB2bm9kZS5kYXRhLnN0eWxlO1xuXG4gIGlmICghb2xkU3R5bGUgJiYgIXN0eWxlKSByZXR1cm47XG4gIG9sZFN0eWxlID0gb2xkU3R5bGUgfHwge307XG4gIHN0eWxlID0gc3R5bGUgfHwge307XG4gIHZhciBvbGRIYXNEZWwgPSAnZGVsYXllZCcgaW4gb2xkU3R5bGU7XG5cbiAgZm9yIChuYW1lIGluIG9sZFN0eWxlKSB7XG4gICAgaWYgKCFzdHlsZVtuYW1lXSkge1xuICAgICAgZWxtLnN0eWxlW25hbWVdID0gJyc7XG4gICAgfVxuICB9XG4gIGZvciAobmFtZSBpbiBzdHlsZSkge1xuICAgIGN1ciA9IHN0eWxlW25hbWVdO1xuICAgIGlmIChuYW1lID09PSAnZGVsYXllZCcpIHtcbiAgICAgIGZvciAobmFtZSBpbiBzdHlsZS5kZWxheWVkKSB7XG4gICAgICAgIGN1ciA9IHN0eWxlLmRlbGF5ZWRbbmFtZV07XG4gICAgICAgIGlmICghb2xkSGFzRGVsIHx8IGN1ciAhPT0gb2xkU3R5bGUuZGVsYXllZFtuYW1lXSkge1xuICAgICAgICAgIHNldE5leHRGcmFtZShlbG0uc3R5bGUsIG5hbWUsIGN1cik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG5hbWUgIT09ICdyZW1vdmUnICYmIGN1ciAhPT0gb2xkU3R5bGVbbmFtZV0pIHtcbiAgICAgIGVsbS5zdHlsZVtuYW1lXSA9IGN1cjtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYXBwbHlEZXN0cm95U3R5bGUodm5vZGUpIHtcbiAgdmFyIHN0eWxlLCBuYW1lLCBlbG0gPSB2bm9kZS5lbG0sIHMgPSB2bm9kZS5kYXRhLnN0eWxlO1xuICBpZiAoIXMgfHwgIShzdHlsZSA9IHMuZGVzdHJveSkpIHJldHVybjtcbiAgZm9yIChuYW1lIGluIHN0eWxlKSB7XG4gICAgZWxtLnN0eWxlW25hbWVdID0gc3R5bGVbbmFtZV07XG4gIH1cbn1cblxuZnVuY3Rpb24gYXBwbHlSZW1vdmVTdHlsZSh2bm9kZSwgcm0pIHtcbiAgdmFyIHMgPSB2bm9kZS5kYXRhLnN0eWxlO1xuICBpZiAoIXMgfHwgIXMucmVtb3ZlKSB7XG4gICAgcm0oKTtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG5hbWUsIGVsbSA9IHZub2RlLmVsbSwgaWR4LCBpID0gMCwgbWF4RHVyID0gMCxcbiAgICAgIGNvbXBTdHlsZSwgc3R5bGUgPSBzLnJlbW92ZSwgYW1vdW50ID0gMCwgYXBwbGllZCA9IFtdO1xuICBmb3IgKG5hbWUgaW4gc3R5bGUpIHtcbiAgICBhcHBsaWVkLnB1c2gobmFtZSk7XG4gICAgZWxtLnN0eWxlW25hbWVdID0gc3R5bGVbbmFtZV07XG4gIH1cbiAgY29tcFN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbG0pO1xuICB2YXIgcHJvcHMgPSBjb21wU3R5bGVbJ3RyYW5zaXRpb24tcHJvcGVydHknXS5zcGxpdCgnLCAnKTtcbiAgZm9yICg7IGkgPCBwcm9wcy5sZW5ndGg7ICsraSkge1xuICAgIGlmKGFwcGxpZWQuaW5kZXhPZihwcm9wc1tpXSkgIT09IC0xKSBhbW91bnQrKztcbiAgfVxuICBlbG0uYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIGZ1bmN0aW9uKGV2KSB7XG4gICAgaWYgKGV2LnRhcmdldCA9PT0gZWxtKSAtLWFtb3VudDtcbiAgICBpZiAoYW1vdW50ID09PSAwKSBybSgpO1xuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7Y3JlYXRlOiB1cGRhdGVTdHlsZSwgdXBkYXRlOiB1cGRhdGVTdHlsZSwgZGVzdHJveTogYXBwbHlEZXN0cm95U3R5bGUsIHJlbW92ZTogYXBwbHlSZW1vdmVTdHlsZX07XG4iLCIvLyBqc2hpbnQgbmV3Y2FwOiBmYWxzZVxuLyogZ2xvYmFsIHJlcXVpcmUsIG1vZHVsZSwgZG9jdW1lbnQsIE5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFZOb2RlID0gcmVxdWlyZSgnLi92bm9kZScpO1xudmFyIGlzID0gcmVxdWlyZSgnLi9pcycpO1xudmFyIGRvbUFwaSA9IHJlcXVpcmUoJy4vaHRtbGRvbWFwaScpO1xuXG5mdW5jdGlvbiBpc1VuZGVmKHMpIHsgcmV0dXJuIHMgPT09IHVuZGVmaW5lZDsgfVxuZnVuY3Rpb24gaXNEZWYocykgeyByZXR1cm4gcyAhPT0gdW5kZWZpbmVkOyB9XG5cbnZhciBlbXB0eU5vZGUgPSBWTm9kZSgnJywge30sIFtdLCB1bmRlZmluZWQsIHVuZGVmaW5lZCk7XG5cbmZ1bmN0aW9uIHNhbWVWbm9kZSh2bm9kZTEsIHZub2RlMikge1xuICByZXR1cm4gdm5vZGUxLmtleSA9PT0gdm5vZGUyLmtleSAmJiB2bm9kZTEuc2VsID09PSB2bm9kZTIuc2VsO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVLZXlUb09sZElkeChjaGlsZHJlbiwgYmVnaW5JZHgsIGVuZElkeCkge1xuICB2YXIgaSwgbWFwID0ge30sIGtleTtcbiAgZm9yIChpID0gYmVnaW5JZHg7IGkgPD0gZW5kSWR4OyArK2kpIHtcbiAgICBrZXkgPSBjaGlsZHJlbltpXS5rZXk7XG4gICAgaWYgKGlzRGVmKGtleSkpIG1hcFtrZXldID0gaTtcbiAgfVxuICByZXR1cm4gbWFwO1xufVxuXG52YXIgaG9va3MgPSBbJ2NyZWF0ZScsICd1cGRhdGUnLCAncmVtb3ZlJywgJ2Rlc3Ryb3knLCAncHJlJywgJ3Bvc3QnXTtcblxuZnVuY3Rpb24gaW5pdChtb2R1bGVzLCBhcGkpIHtcbiAgdmFyIGksIGosIGNicyA9IHt9O1xuXG4gIGlmIChpc1VuZGVmKGFwaSkpIGFwaSA9IGRvbUFwaTtcblxuICBmb3IgKGkgPSAwOyBpIDwgaG9va3MubGVuZ3RoOyArK2kpIHtcbiAgICBjYnNbaG9va3NbaV1dID0gW107XG4gICAgZm9yIChqID0gMDsgaiA8IG1vZHVsZXMubGVuZ3RoOyArK2opIHtcbiAgICAgIGlmIChtb2R1bGVzW2pdW2hvb2tzW2ldXSAhPT0gdW5kZWZpbmVkKSBjYnNbaG9va3NbaV1dLnB1c2gobW9kdWxlc1tqXVtob29rc1tpXV0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGVtcHR5Tm9kZUF0KGVsbSkge1xuICAgIHZhciBpZCA9IGVsbS5pZCA/ICcjJyArIGVsbS5pZCA6ICcnO1xuICAgIHZhciBjID0gZWxtLmNsYXNzTmFtZSA/ICcuJyArIGVsbS5jbGFzc05hbWUuc3BsaXQoJyAnKS5qb2luKCcuJykgOiAnJztcbiAgICByZXR1cm4gVk5vZGUoYXBpLnRhZ05hbWUoZWxtKS50b0xvd2VyQ2FzZSgpICsgaWQgKyBjLCB7fSwgW10sIHVuZGVmaW5lZCwgZWxtKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVJtQ2IoY2hpbGRFbG0sIGxpc3RlbmVycykge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgtLWxpc3RlbmVycyA9PT0gMCkge1xuICAgICAgICB2YXIgcGFyZW50ID0gYXBpLnBhcmVudE5vZGUoY2hpbGRFbG0pO1xuICAgICAgICBhcGkucmVtb3ZlQ2hpbGQocGFyZW50LCBjaGlsZEVsbSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUVsbSh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgdmFyIGksIGRhdGEgPSB2bm9kZS5kYXRhO1xuICAgIGlmIChpc0RlZihkYXRhKSkge1xuICAgICAgaWYgKGlzRGVmKGkgPSBkYXRhLmhvb2spICYmIGlzRGVmKGkgPSBpLmluaXQpKSB7XG4gICAgICAgIGkodm5vZGUpO1xuICAgICAgICBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIGVsbSwgY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbiwgc2VsID0gdm5vZGUuc2VsO1xuICAgIGlmIChpc0RlZihzZWwpKSB7XG4gICAgICAvLyBQYXJzZSBzZWxlY3RvclxuICAgICAgdmFyIGhhc2hJZHggPSBzZWwuaW5kZXhPZignIycpO1xuICAgICAgdmFyIGRvdElkeCA9IHNlbC5pbmRleE9mKCcuJywgaGFzaElkeCk7XG4gICAgICB2YXIgaGFzaCA9IGhhc2hJZHggPiAwID8gaGFzaElkeCA6IHNlbC5sZW5ndGg7XG4gICAgICB2YXIgZG90ID0gZG90SWR4ID4gMCA/IGRvdElkeCA6IHNlbC5sZW5ndGg7XG4gICAgICB2YXIgdGFnID0gaGFzaElkeCAhPT0gLTEgfHwgZG90SWR4ICE9PSAtMSA/IHNlbC5zbGljZSgwLCBNYXRoLm1pbihoYXNoLCBkb3QpKSA6IHNlbDtcbiAgICAgIGVsbSA9IHZub2RlLmVsbSA9IGlzRGVmKGRhdGEpICYmIGlzRGVmKGkgPSBkYXRhLm5zKSA/IGFwaS5jcmVhdGVFbGVtZW50TlMoaSwgdGFnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogYXBpLmNyZWF0ZUVsZW1lbnQodGFnKTtcbiAgICAgIGlmIChoYXNoIDwgZG90KSBlbG0uaWQgPSBzZWwuc2xpY2UoaGFzaCArIDEsIGRvdCk7XG4gICAgICBpZiAoZG90SWR4ID4gMCkgZWxtLmNsYXNzTmFtZSA9IHNlbC5zbGljZShkb3QgKyAxKS5yZXBsYWNlKC9cXC4vZywgJyAnKTtcbiAgICAgIGlmIChpcy5hcnJheShjaGlsZHJlbikpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgYXBpLmFwcGVuZENoaWxkKGVsbSwgY3JlYXRlRWxtKGNoaWxkcmVuW2ldLCBpbnNlcnRlZFZub2RlUXVldWUpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChpcy5wcmltaXRpdmUodm5vZGUudGV4dCkpIHtcbiAgICAgICAgYXBpLmFwcGVuZENoaWxkKGVsbSwgYXBpLmNyZWF0ZVRleHROb2RlKHZub2RlLnRleHQpKTtcbiAgICAgIH1cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMuY3JlYXRlLmxlbmd0aDsgKytpKSBjYnMuY3JlYXRlW2ldKGVtcHR5Tm9kZSwgdm5vZGUpO1xuICAgICAgaSA9IHZub2RlLmRhdGEuaG9vazsgLy8gUmV1c2UgdmFyaWFibGVcbiAgICAgIGlmIChpc0RlZihpKSkge1xuICAgICAgICBpZiAoaS5jcmVhdGUpIGkuY3JlYXRlKGVtcHR5Tm9kZSwgdm5vZGUpO1xuICAgICAgICBpZiAoaS5pbnNlcnQpIGluc2VydGVkVm5vZGVRdWV1ZS5wdXNoKHZub2RlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZWxtID0gdm5vZGUuZWxtID0gYXBpLmNyZWF0ZVRleHROb2RlKHZub2RlLnRleHQpO1xuICAgIH1cbiAgICByZXR1cm4gdm5vZGUuZWxtO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkVm5vZGVzKHBhcmVudEVsbSwgYmVmb3JlLCB2bm9kZXMsIHN0YXJ0SWR4LCBlbmRJZHgsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgIGZvciAoOyBzdGFydElkeCA8PSBlbmRJZHg7ICsrc3RhcnRJZHgpIHtcbiAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBjcmVhdGVFbG0odm5vZGVzW3N0YXJ0SWR4XSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSwgYmVmb3JlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbnZva2VEZXN0cm95SG9vayh2bm9kZSkge1xuICAgIHZhciBpLCBqLCBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICBpZiAoaXNEZWYoZGF0YSkpIHtcbiAgICAgIGlmIChpc0RlZihpID0gZGF0YS5ob29rKSAmJiBpc0RlZihpID0gaS5kZXN0cm95KSkgaSh2bm9kZSk7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLmRlc3Ryb3kubGVuZ3RoOyArK2kpIGNicy5kZXN0cm95W2ldKHZub2RlKTtcbiAgICAgIGlmIChpc0RlZihpID0gdm5vZGUuY2hpbGRyZW4pKSB7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCB2bm9kZS5jaGlsZHJlbi5sZW5ndGg7ICsraikge1xuICAgICAgICAgIGludm9rZURlc3Ryb3lIb29rKHZub2RlLmNoaWxkcmVuW2pdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZVZub2RlcyhwYXJlbnRFbG0sIHZub2Rlcywgc3RhcnRJZHgsIGVuZElkeCkge1xuICAgIGZvciAoOyBzdGFydElkeCA8PSBlbmRJZHg7ICsrc3RhcnRJZHgpIHtcbiAgICAgIHZhciBpLCBsaXN0ZW5lcnMsIHJtLCBjaCA9IHZub2Rlc1tzdGFydElkeF07XG4gICAgICBpZiAoaXNEZWYoY2gpKSB7XG4gICAgICAgIGlmIChpc0RlZihjaC5zZWwpKSB7XG4gICAgICAgICAgaW52b2tlRGVzdHJveUhvb2soY2gpO1xuICAgICAgICAgIGxpc3RlbmVycyA9IGNicy5yZW1vdmUubGVuZ3RoICsgMTtcbiAgICAgICAgICBybSA9IGNyZWF0ZVJtQ2IoY2guZWxtLCBsaXN0ZW5lcnMpO1xuICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMucmVtb3ZlLmxlbmd0aDsgKytpKSBjYnMucmVtb3ZlW2ldKGNoLCBybSk7XG4gICAgICAgICAgaWYgKGlzRGVmKGkgPSBjaC5kYXRhKSAmJiBpc0RlZihpID0gaS5ob29rKSAmJiBpc0RlZihpID0gaS5yZW1vdmUpKSB7XG4gICAgICAgICAgICBpKGNoLCBybSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJtKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgeyAvLyBUZXh0IG5vZGVcbiAgICAgICAgICBhcGkucmVtb3ZlQ2hpbGQocGFyZW50RWxtLCBjaC5lbG0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlQ2hpbGRyZW4ocGFyZW50RWxtLCBvbGRDaCwgbmV3Q2gsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgIHZhciBvbGRTdGFydElkeCA9IDAsIG5ld1N0YXJ0SWR4ID0gMDtcbiAgICB2YXIgb2xkRW5kSWR4ID0gb2xkQ2gubGVuZ3RoIC0gMTtcbiAgICB2YXIgb2xkU3RhcnRWbm9kZSA9IG9sZENoWzBdO1xuICAgIHZhciBvbGRFbmRWbm9kZSA9IG9sZENoW29sZEVuZElkeF07XG4gICAgdmFyIG5ld0VuZElkeCA9IG5ld0NoLmxlbmd0aCAtIDE7XG4gICAgdmFyIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFswXTtcbiAgICB2YXIgbmV3RW5kVm5vZGUgPSBuZXdDaFtuZXdFbmRJZHhdO1xuICAgIHZhciBvbGRLZXlUb0lkeCwgaWR4SW5PbGQsIGVsbVRvTW92ZSwgYmVmb3JlO1xuXG4gICAgd2hpbGUgKG9sZFN0YXJ0SWR4IDw9IG9sZEVuZElkeCAmJiBuZXdTdGFydElkeCA8PSBuZXdFbmRJZHgpIHtcbiAgICAgIGlmIChpc1VuZGVmKG9sZFN0YXJ0Vm5vZGUpKSB7XG4gICAgICAgIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFsrK29sZFN0YXJ0SWR4XTsgLy8gVm5vZGUgaGFzIGJlZW4gbW92ZWQgbGVmdFxuICAgICAgfSBlbHNlIGlmIChpc1VuZGVmKG9sZEVuZFZub2RlKSkge1xuICAgICAgICBvbGRFbmRWbm9kZSA9IG9sZENoWy0tb2xkRW5kSWR4XTtcbiAgICAgIH0gZWxzZSBpZiAoc2FtZVZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld1N0YXJ0Vm5vZGUpKSB7XG4gICAgICAgIHBhdGNoVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdO1xuICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICB9IGVsc2UgaWYgKHNhbWVWbm9kZShvbGRFbmRWbm9kZSwgbmV3RW5kVm5vZGUpKSB7XG4gICAgICAgIHBhdGNoVm5vZGUob2xkRW5kVm5vZGUsIG5ld0VuZFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICBvbGRFbmRWbm9kZSA9IG9sZENoWy0tb2xkRW5kSWR4XTtcbiAgICAgICAgbmV3RW5kVm5vZGUgPSBuZXdDaFstLW5ld0VuZElkeF07XG4gICAgICB9IGVsc2UgaWYgKHNhbWVWbm9kZShvbGRTdGFydFZub2RlLCBuZXdFbmRWbm9kZSkpIHsgLy8gVm5vZGUgbW92ZWQgcmlnaHRcbiAgICAgICAgcGF0Y2hWbm9kZShvbGRTdGFydFZub2RlLCBuZXdFbmRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtLCBhcGkubmV4dFNpYmxpbmcob2xkRW5kVm5vZGUuZWxtKSk7XG4gICAgICAgIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFsrK29sZFN0YXJ0SWR4XTtcbiAgICAgICAgbmV3RW5kVm5vZGUgPSBuZXdDaFstLW5ld0VuZElkeF07XG4gICAgICB9IGVsc2UgaWYgKHNhbWVWbm9kZShvbGRFbmRWbm9kZSwgbmV3U3RhcnRWbm9kZSkpIHsgLy8gVm5vZGUgbW92ZWQgbGVmdFxuICAgICAgICBwYXRjaFZub2RlKG9sZEVuZFZub2RlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgb2xkRW5kVm5vZGUuZWxtLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaXNVbmRlZihvbGRLZXlUb0lkeCkpIG9sZEtleVRvSWR4ID0gY3JlYXRlS2V5VG9PbGRJZHgob2xkQ2gsIG9sZFN0YXJ0SWR4LCBvbGRFbmRJZHgpO1xuICAgICAgICBpZHhJbk9sZCA9IG9sZEtleVRvSWR4W25ld1N0YXJ0Vm5vZGUua2V5XTtcbiAgICAgICAgaWYgKGlzVW5kZWYoaWR4SW5PbGQpKSB7IC8vIE5ldyBlbGVtZW50XG4gICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGNyZWF0ZUVsbShuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsbVRvTW92ZSA9IG9sZENoW2lkeEluT2xkXTtcbiAgICAgICAgICBwYXRjaFZub2RlKGVsbVRvTW92ZSwgbmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICBvbGRDaFtpZHhJbk9sZF0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGVsbVRvTW92ZS5lbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9sZFN0YXJ0SWR4ID4gb2xkRW5kSWR4KSB7XG4gICAgICBiZWZvcmUgPSBpc1VuZGVmKG5ld0NoW25ld0VuZElkeCsxXSkgPyBudWxsIDogbmV3Q2hbbmV3RW5kSWR4KzFdLmVsbTtcbiAgICAgIGFkZFZub2RlcyhwYXJlbnRFbG0sIGJlZm9yZSwgbmV3Q2gsIG5ld1N0YXJ0SWR4LCBuZXdFbmRJZHgsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgfSBlbHNlIGlmIChuZXdTdGFydElkeCA+IG5ld0VuZElkeCkge1xuICAgICAgcmVtb3ZlVm5vZGVzKHBhcmVudEVsbSwgb2xkQ2gsIG9sZFN0YXJ0SWR4LCBvbGRFbmRJZHgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBhdGNoVm5vZGUob2xkVm5vZGUsIHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpIHtcbiAgICB2YXIgaSwgaG9vaztcbiAgICBpZiAoaXNEZWYoaSA9IHZub2RlLmRhdGEpICYmIGlzRGVmKGhvb2sgPSBpLmhvb2spICYmIGlzRGVmKGkgPSBob29rLnByZXBhdGNoKSkge1xuICAgICAgaShvbGRWbm9kZSwgdm5vZGUpO1xuICAgIH1cbiAgICB2YXIgZWxtID0gdm5vZGUuZWxtID0gb2xkVm5vZGUuZWxtLCBvbGRDaCA9IG9sZFZub2RlLmNoaWxkcmVuLCBjaCA9IHZub2RlLmNoaWxkcmVuO1xuICAgIGlmIChvbGRWbm9kZSA9PT0gdm5vZGUpIHJldHVybjtcbiAgICBpZiAoIXNhbWVWbm9kZShvbGRWbm9kZSwgdm5vZGUpKSB7XG4gICAgICB2YXIgcGFyZW50RWxtID0gYXBpLnBhcmVudE5vZGUob2xkVm5vZGUuZWxtKTtcbiAgICAgIGVsbSA9IGNyZWF0ZUVsbSh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBlbG0sIG9sZFZub2RlLmVsbSk7XG4gICAgICByZW1vdmVWbm9kZXMocGFyZW50RWxtLCBbb2xkVm5vZGVdLCAwLCAwKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGlzRGVmKHZub2RlLmRhdGEpKSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLnVwZGF0ZS5sZW5ndGg7ICsraSkgY2JzLnVwZGF0ZVtpXShvbGRWbm9kZSwgdm5vZGUpO1xuICAgICAgaSA9IHZub2RlLmRhdGEuaG9vaztcbiAgICAgIGlmIChpc0RlZihpKSAmJiBpc0RlZihpID0gaS51cGRhdGUpKSBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgfVxuICAgIGlmIChpc1VuZGVmKHZub2RlLnRleHQpKSB7XG4gICAgICBpZiAoaXNEZWYob2xkQ2gpICYmIGlzRGVmKGNoKSkge1xuICAgICAgICBpZiAob2xkQ2ggIT09IGNoKSB1cGRhdGVDaGlsZHJlbihlbG0sIG9sZENoLCBjaCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNEZWYoY2gpKSB7XG4gICAgICAgIGlmIChpc0RlZihvbGRWbm9kZS50ZXh0KSkgYXBpLnNldFRleHRDb250ZW50KGVsbSwgJycpO1xuICAgICAgICBhZGRWbm9kZXMoZWxtLCBudWxsLCBjaCwgMCwgY2gubGVuZ3RoIC0gMSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNEZWYob2xkQ2gpKSB7XG4gICAgICAgIHJlbW92ZVZub2RlcyhlbG0sIG9sZENoLCAwLCBvbGRDaC5sZW5ndGggLSAxKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNEZWYob2xkVm5vZGUudGV4dCkpIHtcbiAgICAgICAgYXBpLnNldFRleHRDb250ZW50KGVsbSwgJycpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAob2xkVm5vZGUudGV4dCAhPT0gdm5vZGUudGV4dCkge1xuICAgICAgYXBpLnNldFRleHRDb250ZW50KGVsbSwgdm5vZGUudGV4dCk7XG4gICAgfVxuICAgIGlmIChpc0RlZihob29rKSAmJiBpc0RlZihpID0gaG9vay5wb3N0cGF0Y2gpKSB7XG4gICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG9sZFZub2RlLCB2bm9kZSkge1xuICAgIHZhciBpLCBlbG0sIHBhcmVudDtcbiAgICB2YXIgaW5zZXJ0ZWRWbm9kZVF1ZXVlID0gW107XG4gICAgZm9yIChpID0gMDsgaSA8IGNicy5wcmUubGVuZ3RoOyArK2kpIGNicy5wcmVbaV0oKTtcblxuICAgIGlmIChpc1VuZGVmKG9sZFZub2RlLnNlbCkpIHtcbiAgICAgIG9sZFZub2RlID0gZW1wdHlOb2RlQXQob2xkVm5vZGUpO1xuICAgIH1cblxuICAgIGlmIChzYW1lVm5vZGUob2xkVm5vZGUsIHZub2RlKSkge1xuICAgICAgcGF0Y2hWbm9kZShvbGRWbm9kZSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsbSA9IG9sZFZub2RlLmVsbTtcbiAgICAgIHBhcmVudCA9IGFwaS5wYXJlbnROb2RlKGVsbSk7XG5cbiAgICAgIGNyZWF0ZUVsbSh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcblxuICAgICAgaWYgKHBhcmVudCAhPT0gbnVsbCkge1xuICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudCwgdm5vZGUuZWxtLCBhcGkubmV4dFNpYmxpbmcoZWxtKSk7XG4gICAgICAgIHJlbW92ZVZub2RlcyhwYXJlbnQsIFtvbGRWbm9kZV0sIDAsIDApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoaSA9IDA7IGkgPCBpbnNlcnRlZFZub2RlUXVldWUubGVuZ3RoOyArK2kpIHtcbiAgICAgIGluc2VydGVkVm5vZGVRdWV1ZVtpXS5kYXRhLmhvb2suaW5zZXJ0KGluc2VydGVkVm5vZGVRdWV1ZVtpXSk7XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCBjYnMucG9zdC5sZW5ndGg7ICsraSkgY2JzLnBvc3RbaV0oKTtcbiAgICByZXR1cm4gdm5vZGU7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge2luaXQ6IGluaXR9O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzZWwsIGRhdGEsIGNoaWxkcmVuLCB0ZXh0LCBlbG0pIHtcbiAgdmFyIGtleSA9IGRhdGEgPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6IGRhdGEua2V5O1xuICByZXR1cm4ge3NlbDogc2VsLCBkYXRhOiBkYXRhLCBjaGlsZHJlbjogY2hpbGRyZW4sXG4gICAgICAgICAgdGV4dDogdGV4dCwgZWxtOiBlbG0sIGtleToga2V5fTtcbn07XG4iLCJmdW5jdGlvbiB1cGRhdGVQcm9wcyhvbGRWbm9kZSwgdm5vZGUpIHtcclxuICAgIGxldCBrZXksIGN1ciwgb2xkLCBlbG0gPSB2bm9kZS5lbG0sXHJcbiAgICAgICAgcHJvcHMgPSB2bm9kZS5kYXRhLmxpdmVQcm9wcyB8fCB7fTtcclxuICAgIGZvciAoa2V5IGluIHByb3BzKSB7XHJcbiAgICAgICAgY3VyID0gcHJvcHNba2V5XTtcclxuICAgICAgICBvbGQgPSBlbG1ba2V5XTtcclxuICAgICAgICBpZiAob2xkICE9PSBjdXIpIGVsbVtrZXldID0gY3VyO1xyXG4gICAgfVxyXG59XHJcbmNvbnN0IGxpdmVQcm9wc1BsdWdpbiA9IHtjcmVhdGU6IHVwZGF0ZVByb3BzLCB1cGRhdGU6IHVwZGF0ZVByb3BzfTtcclxuaW1wb3J0IHNuYWJiZG9tIGZyb20gXCJzbmFiYmRvbVwiXHJcbmltcG9ydCBoIGZyb20gXCJzbmFiYmRvbS9oXCJcclxuY29uc3QgcGF0Y2ggPSBzbmFiYmRvbS5pbml0KFtcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvY2xhc3MnKSxcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvcHJvcHMnKSxcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvc3R5bGUnKSxcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvZXZlbnRsaXN0ZW5lcnMnKSxcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvYXR0cmlidXRlcycpLFxyXG4gICAgbGl2ZVByb3BzUGx1Z2luXHJcbl0pO1xyXG5cclxuZnVuY3Rpb24gdXVpZCgpe3JldHVybihcIlwiKzFlNystMWUzKy00ZTMrLThlMystMWUxMSkucmVwbGFjZSgvWzEwXS9nLGZ1bmN0aW9uKCl7cmV0dXJuKDB8TWF0aC5yYW5kb20oKSoxNikudG9TdHJpbmcoMTYpfSl9XHJcbmltcG9ydCBiaWcgZnJvbSAnLi4vbm9kZV9tb2R1bGVzL2JpZy5qcydcclxuYmlnLkVfUE9TID0gMWUrNlxyXG5cclxuaW1wb3J0IHVnbmlzIGZyb20gJy4vdWduaXMnXHJcbmltcG9ydCBzYXZlZEFwcCBmcm9tICcuLi91Z25pc19jb21wb25lbnRzL2FwcC5qc29uJ1xyXG5cclxuZnVuY3Rpb24gbW92ZUluQXJyYXkgKGFycmF5LCBtb3ZlSW5kZXgsIHRvSW5kZXgpIHtcclxuICAgIGxldCBpdGVtID0gYXJyYXlbbW92ZUluZGV4XTtcclxuICAgIGxldCBsZW5ndGggPSBhcnJheS5sZW5ndGg7XHJcbiAgICBsZXQgZGlmZiA9IG1vdmVJbmRleCAtIHRvSW5kZXg7XHJcblxyXG4gICAgaWYgKGRpZmYgPiAwKSB7XHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgLi4uYXJyYXkuc2xpY2UoMCwgdG9JbmRleCksXHJcbiAgICAgICAgICAgIGl0ZW0sXHJcbiAgICAgICAgICAgIC4uLmFycmF5LnNsaWNlKHRvSW5kZXgsIG1vdmVJbmRleCksXHJcbiAgICAgICAgICAgIC4uLmFycmF5LnNsaWNlKG1vdmVJbmRleCArIDEsIGxlbmd0aClcclxuICAgICAgICBdO1xyXG4gICAgfSBlbHNlIGlmIChkaWZmIDwgMCkge1xyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgIC4uLmFycmF5LnNsaWNlKDAsIG1vdmVJbmRleCksXHJcbiAgICAgICAgICAgIC4uLmFycmF5LnNsaWNlKG1vdmVJbmRleCArIDEsIHRvSW5kZXggKyAxKSxcclxuICAgICAgICAgICAgaXRlbSxcclxuICAgICAgICAgICAgLi4uYXJyYXkuc2xpY2UodG9JbmRleCArIDEsIGxlbmd0aClcclxuICAgICAgICBdO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFycmF5O1xyXG59XHJcblxyXG5jb25zdCBhdHRhY2hGYXN0Q2xpY2sgPSByZXF1aXJlKCdmYXN0Y2xpY2snKVxyXG5hdHRhY2hGYXN0Q2xpY2soZG9jdW1lbnQuYm9keSlcclxuXHJcbmNvbnN0IHZlcnNpb24gPSAnMC4wLjMxdidcclxuZWRpdG9yKHNhdmVkQXBwKVxyXG5cclxuZnVuY3Rpb24gZWRpdG9yKGFwcERlZmluaXRpb24pe1xyXG5cclxuICAgIGNvbnN0IHNhdmVkRGVmaW5pdGlvbiA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2FwcF9rZXlfJyArIHZlcnNpb24pKVxyXG4gICAgY29uc3QgYXBwID0gdWduaXMoc2F2ZWREZWZpbml0aW9uIHx8IGFwcERlZmluaXRpb24pXHJcblxyXG4gICAgbGV0IG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChub2RlKVxyXG5cclxuICAgIC8vIFN0YXRlXHJcbiAgICBsZXQgc3RhdGUgPSB7XHJcbiAgICAgICAgbGVmdE9wZW46IGZhbHNlLFxyXG4gICAgICAgIHJpZ2h0T3BlbjogdHJ1ZSxcclxuICAgICAgICBmdWxsU2NyZWVuOiBmYWxzZSxcclxuICAgICAgICBlZGl0b3JSaWdodFdpZHRoOiAzNTAsXHJcbiAgICAgICAgZWRpdG9yTGVmdFdpZHRoOiAzNTAsXHJcbiAgICAgICAgc3ViRWRpdG9yV2lkdGg6IDM1MCxcclxuICAgICAgICBjb21wb25lbnRFZGl0b3JQb3NpdGlvbjoge3g6IHdpbmRvdy5pbm5lcldpZHRoIC0gNzEwLCB5OiB3aW5kb3cuaW5uZXJIZWlnaHQgLyAyfSAsXHJcbiAgICAgICAgYXBwSXNGcm96ZW46IGZhbHNlLFxyXG4gICAgICAgIHNlbGVjdGVkVmlld05vZGU6IHt9LFxyXG4gICAgICAgIHNlbGVjdGVkUGlwZUlkOiAnJyxcclxuICAgICAgICBzZWxlY3RlZFN0YXRlTm9kZUlkOiAnJyxcclxuICAgICAgICBzZWxlY3RlZFZpZXdTdWJNZW51OiAncHJvcHMnLFxyXG4gICAgICAgIGVkaXRpbmdUaXRsZU5vZGVJZDogJycsXHJcbiAgICAgICAgdmlld0ZvbGRlcnNDbG9zZWQ6IHt9LFxyXG4gICAgICAgIGRyYWdnZWRDb21wb25lbnRWaWV3OiBudWxsLFxyXG4gICAgICAgIGRyYWdnZWRDb21wb25lbnRTdGF0ZUlkOiBudWxsLFxyXG4gICAgICAgIGhvdmVyZWRQaXBlOiBudWxsLFxyXG4gICAgICAgIGhvdmVyZWRWaWV3Tm9kZTogbnVsbCxcclxuICAgICAgICBtb3VzZVBvc2l0aW9uOiB7fSxcclxuICAgICAgICBldmVudFN0YWNrOiBbXSxcclxuICAgICAgICBkZWZpbml0aW9uOiBzYXZlZERlZmluaXRpb24gfHwgYXBwLmRlZmluaXRpb24sXHJcbiAgICB9XHJcbiAgICAvLyB1bmRvL3JlZG9cclxuICAgIGxldCBzdGF0ZVN0YWNrID0gW3N0YXRlLmRlZmluaXRpb25dXHJcbiAgICBsZXQgY3VycmVudEFuaW1hdGlvbkZyYW1lUmVxdWVzdCA9IG51bGw7XHJcbiAgICBmdW5jdGlvbiBzZXRTdGF0ZShuZXdTdGF0ZSwgdGltZVRyYXZlbGluZyl7XHJcbiAgICAgICAgaWYobmV3U3RhdGUgPT09IHN0YXRlKXtcclxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdzdGF0ZSB3YXMgbXV0YXRlZCwgc2VhcmNoIGZvciBhIGJ1ZycpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHN0YXRlLmRlZmluaXRpb24gIT09IG5ld1N0YXRlLmRlZmluaXRpb24pe1xyXG4gICAgICAgICAgICAvLyB1bnNlbGVjdCBkZWxldGVkIGNvbXBvbmVudHMgYW5kIHN0YXRlXHJcbiAgICAgICAgICAgIGlmKG5ld1N0YXRlLmRlZmluaXRpb24uc3RhdGVbbmV3U3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZF0gPT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgICAgICBuZXdTdGF0ZSA9IHsuLi5uZXdTdGF0ZSwgc2VsZWN0ZWRTdGF0ZU5vZGVJZDogJyd9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYobmV3U3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgIT09IHVuZGVmaW5lZCAmJiBuZXdTdGF0ZS5kZWZpbml0aW9uW25ld1N0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmXVtuZXdTdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkXSA9PT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgICAgIG5ld1N0YXRlID0gey4uLm5ld1N0YXRlLCBzZWxlY3RlZFZpZXdOb2RlOiB7fX1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyB1bmRvL3JlZG8gdGhlbiByZW5kZXIgdGhlbiBzYXZlXHJcbiAgICAgICAgICAgIGlmKCF0aW1lVHJhdmVsaW5nKXtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRJbmRleCA9IHN0YXRlU3RhY2suZmluZEluZGV4KChhKT0+YT09PXN0YXRlLmRlZmluaXRpb24pXHJcbiAgICAgICAgICAgICAgICBzdGF0ZVN0YWNrID0gc3RhdGVTdGFjay5zbGljZSgwLCBjdXJyZW50SW5kZXgrMSkuY29uY2F0KG5ld1N0YXRlLmRlZmluaXRpb24pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYXBwLnJlbmRlcihuZXdTdGF0ZS5kZWZpbml0aW9uKVxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpPT5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYXBwX2tleV8nK3ZlcnNpb24sIEpTT04uc3RyaW5naWZ5KG5ld1N0YXRlLmRlZmluaXRpb24pKSwgMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHN0YXRlLmFwcElzRnJvemVuICE9PSBuZXdTdGF0ZS5hcHBJc0Zyb3plbiB8fCBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlICE9PSBuZXdTdGF0ZS5zZWxlY3RlZFZpZXdOb2RlICl7XHJcbiAgICAgICAgICAgIGFwcC5fZnJlZXplKG5ld1N0YXRlLmFwcElzRnJvemVuLCBWSUVXX05PREVfU0VMRUNURUQsIG5ld1N0YXRlLnNlbGVjdGVkVmlld05vZGUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKG5ld1N0YXRlLmVkaXRpbmdUaXRsZU5vZGVJZCAmJiBzdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQgIT09IG5ld1N0YXRlLmVkaXRpbmdUaXRsZU5vZGVJZCl7XHJcbiAgICAgICAgICAgIC8vIHF1ZSBhdXRvIGZvY3VzXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCk9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBub2RlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtaXN0aXRsZWVkaXRvcl0nKVswXVxyXG4gICAgICAgICAgICAgICAgaWYobm9kZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5mb2N1cygpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIDApXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0YXRlID0gbmV3U3RhdGVcclxuICAgICAgICBpZighY3VycmVudEFuaW1hdGlvbkZyYW1lUmVxdWVzdCl7XHJcbiAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpPT4ge1xyXG4gICAgICAgIC8vIGNsaWNrZWQgb3V0c2lkZVxyXG4gICAgICAgIGlmKHN0YXRlLmVkaXRpbmdUaXRsZU5vZGVJZCAmJiAhZS50YXJnZXQuZGF0YXNldC5pc3RpdGxlZWRpdG9yKXtcclxuICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBlZGl0aW5nVGl0bGVOb2RlSWQ6ICcnfSlcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmVuZGVyKClcclxuICAgIH0sIGZhbHNlKVxyXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJvcmllbnRhdGlvbmNoYW5nZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICByZW5kZXIoKVxyXG4gICAgfSwgZmFsc2UpXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpPT57XHJcbiAgICAgICAgLy8gODMgLSBzXHJcbiAgICAgICAgLy8gOTAgLSB6XHJcbiAgICAgICAgLy8gODkgLSB5XHJcbiAgICAgICAgLy8gMzIgLSBzcGFjZVxyXG4gICAgICAgIC8vIDEzIC0gZW50ZXJcclxuICAgICAgICAvLyAyNyAtIGVzY2FwZVxyXG4gICAgICAgIGlmKGUud2hpY2ggPT09IDgzICYmIChuYXZpZ2F0b3IucGxhdGZvcm0ubWF0Y2goXCJNYWNcIikgPyBlLm1ldGFLZXkgOiBlLmN0cmxLZXkpKSB7XHJcbiAgICAgICAgICAgIC8vIFRPRE8gZ2FyYmFnZSBjb2xsZWN0XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgZmV0Y2goJy9zYXZlJywge21ldGhvZDogJ1BPU1QnLCBib2R5OiBKU09OLnN0cmluZ2lmeShzdGF0ZS5kZWZpbml0aW9uKSwgaGVhZGVyczoge1wiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwifX0pXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoZS53aGljaCA9PT0gMzIgJiYgKG5hdmlnYXRvci5wbGF0Zm9ybS5tYXRjaChcIk1hY1wiKSA/IGUubWV0YUtleSA6IGUuY3RybEtleSkpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIEZSRUVaRVJfQ0xJQ0tFRCgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKCFlLnNoaWZ0S2V5ICYmIGUud2hpY2ggPT09IDkwICYmIChuYXZpZ2F0b3IucGxhdGZvcm0ubWF0Y2goXCJNYWNcIikgPyBlLm1ldGFLZXkgOiBlLmN0cmxLZXkpKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudEluZGV4ID0gc3RhdGVTdGFjay5maW5kSW5kZXgoKGEpPT5hPT09c3RhdGUuZGVmaW5pdGlvbilcclxuICAgICAgICAgICAgaWYoY3VycmVudEluZGV4ID4gMCl7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdEZWZpbml0aW9uID0gc3RhdGVTdGFja1tjdXJyZW50SW5kZXgtMV1cclxuICAgICAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjogbmV3RGVmaW5pdGlvbn0sIHRydWUpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoKGUud2hpY2ggPT09IDg5ICYmIChuYXZpZ2F0b3IucGxhdGZvcm0ubWF0Y2goXCJNYWNcIikgPyBlLm1ldGFLZXkgOiBlLmN0cmxLZXkpKSB8fCAoZS5zaGlmdEtleSAmJiBlLndoaWNoID09PSA5MCAmJiAobmF2aWdhdG9yLnBsYXRmb3JtLm1hdGNoKFwiTWFjXCIpID8gZS5tZXRhS2V5IDogZS5jdHJsS2V5KSkpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50SW5kZXggPSBzdGF0ZVN0YWNrLmZpbmRJbmRleCgoYSk9PmE9PT1zdGF0ZS5kZWZpbml0aW9uKVxyXG4gICAgICAgICAgICBpZihjdXJyZW50SW5kZXggPCBzdGF0ZVN0YWNrLmxlbmd0aC0xKXtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0RlZmluaXRpb24gPSBzdGF0ZVN0YWNrW2N1cnJlbnRJbmRleCsxXVxyXG4gICAgICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiBuZXdEZWZpbml0aW9ufSwgdHJ1ZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZihlLndoaWNoID09PSAxMykge1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGVkaXRpbmdUaXRsZU5vZGVJZDogJyd9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZihlLndoaWNoID09PSAyNykge1xyXG4gICAgICAgICAgICBGVUxMX1NDUkVFTl9DTElDS0VEKGZhbHNlKVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgLy8gTGlzdGVuIHRvIGFwcFxyXG4gICAgYXBwLmFkZExpc3RlbmVyKChldmVudElkLCBkYXRhLCBlLCBwcmV2aW91c1N0YXRlLCBjdXJyZW50U3RhdGUsIG11dGF0aW9ucyk9PntcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGV2ZW50U3RhY2s6IHN0YXRlLmV2ZW50U3RhY2suY29uY2F0KHtldmVudElkLCBkYXRhLCBlLCBwcmV2aW91c1N0YXRlLCBjdXJyZW50U3RhdGUsIG11dGF0aW9uc30pfSlcclxuICAgIH0pXHJcblxyXG4gICAgLy8gQWN0aW9uc1xyXG4gICAgbGV0IG9wZW5Cb3hUaW1lb3V0ID0gbnVsbFxyXG4gICAgZnVuY3Rpb24gVklFV19EUkFHR0VEKG5vZGVSZWYsIHBhcmVudFJlZiwgaW5pdGlhbERlcHRoLCBlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgY29uc3QgaXNBcnJvdyA9IGUudGFyZ2V0LmRhdGFzZXQuY2xvc2VhcnJvd1xyXG4gICAgICAgIGNvbnN0IGlzVHJhc2hjYW4gPSBlLnRhcmdldC5kYXRhc2V0LnRyYXNoY2FuXHJcbiAgICAgICAgY29uc3QgaW5pdGlhbFggPSBlLnRvdWNoZXM/IGUudG91Y2hlc1swXS5wYWdlWDogZS5wYWdlWFxyXG4gICAgICAgIGNvbnN0IGluaXRpYWxZID0gZS50b3VjaGVzPyBlLnRvdWNoZXNbMF0ucGFnZVk6IGUucGFnZVlcclxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuZWxtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXHJcbiAgICAgICAgY29uc3Qgb2Zmc2V0WCA9IGluaXRpYWxYIC0gcG9zaXRpb24ubGVmdFxyXG4gICAgICAgIGNvbnN0IG9mZnNldFkgPSBpbml0aWFsWSAtIHBvc2l0aW9uLnRvcFxyXG4gICAgICAgIGZ1bmN0aW9uIGRyYWcoZSl7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICBjb25zdCB4ID0gZS50b3VjaGVzPyBlLnRvdWNoZXNbMF0ucGFnZVg6IGUucGFnZVhcclxuICAgICAgICAgICAgY29uc3QgeSA9IGUudG91Y2hlcz8gZS50b3VjaGVzWzBdLnBhZ2VZOiBlLnBhZ2VZXHJcbiAgICAgICAgICAgIGlmKCFzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50Vmlldyl7XHJcbiAgICAgICAgICAgICAgICBpZihNYXRoLmFicyhpbml0aWFsWS15KSA+IDMpe1xyXG4gICAgICAgICAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZHJhZ2dlZENvbXBvbmVudFZpZXc6IHsuLi5ub2RlUmVmLCBkZXB0aDogaW5pdGlhbERlcHRofSwgbW91c2VQb3NpdGlvbjoge3g6IHggLSBvZmZzZXRYLCB5OiB5IC0gb2Zmc2V0WX19KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBtb3VzZVBvc2l0aW9uOiB7eDogeCAtIG9mZnNldFgsIHk6IHkgLSBvZmZzZXRZfX0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBkcmFnKVxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBkcmFnKVxyXG4gICAgICAgIGZ1bmN0aW9uIHN0b3BEcmFnZ2luZyhldmVudCl7XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGRyYWcpXHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBkcmFnKVxyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHN0b3BEcmFnZ2luZylcclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgc3RvcERyYWdnaW5nKVxyXG4gICAgICAgICAgICBpZihvcGVuQm94VGltZW91dCl7XHJcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQob3BlbkJveFRpbWVvdXQpXHJcbiAgICAgICAgICAgICAgICBvcGVuQm94VGltZW91dCA9IG51bGxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZighc3RhdGUuZHJhZ2dlZENvbXBvbmVudFZpZXcpe1xyXG4gICAgICAgICAgICAgICAgaWYoZXZlbnQudGFyZ2V0ID09PSBlLnRhcmdldCAmJiBpc0Fycm93KXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gVklFV19GT0xERVJfQ0xJQ0tFRChub2RlUmVmLmlkKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYoZXZlbnQudGFyZ2V0ID09PSBlLnRhcmdldCAmJiBpc1RyYXNoY2FuKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gREVMRVRFX1NFTEVDVEVEX1ZJRVcobm9kZVJlZiwgcGFyZW50UmVmKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFZJRVdfTk9ERV9TRUxFQ1RFRChub2RlUmVmKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKCFzdGF0ZS5ob3ZlcmVkVmlld05vZGUpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNldFN0YXRlKHsuLi5zdGF0ZSwgZHJhZ2dlZENvbXBvbmVudFZpZXc6IG51bGwsfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBuZXdQYXJlbnRSZWYgPSBzdGF0ZS5ob3ZlcmVkVmlld05vZGUucGFyZW50XHJcbiAgICAgICAgICAgIC8vIGZyYW1lIHRoaXMgc29tZXdoZXJlIG9uIGhvdyBub3QgdG8gd3JpdGUgY29kZVxyXG4gICAgICAgICAgICBjb25zdCBmaXhlZFBhcmVudHMgPSB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZSxcclxuICAgICAgICAgICAgICAgIGRyYWdnZWRDb21wb25lbnRWaWV3OiBudWxsLFxyXG4gICAgICAgICAgICAgICAgaG92ZXJlZFZpZXdOb2RlOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgZGVmaW5pdGlvbjogcGFyZW50UmVmLmlkID09PSBuZXdQYXJlbnRSZWYuaWQgPyB7IC8vIG1vdmluZyBpbiB0aGUgc2FtZSBwYXJlbnRcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIFtwYXJlbnRSZWYucmVmXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBbcGFyZW50UmVmLmlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXVtwYXJlbnRSZWYuaWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IG1vdmVJbkFycmF5KHN0YXRlLmRlZmluaXRpb25bcGFyZW50UmVmLnJlZl1bcGFyZW50UmVmLmlkXS5jaGlsZHJlbiwgc3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXVtwYXJlbnRSZWYuaWRdLmNoaWxkcmVuLmZpbmRJbmRleCgocmVmKT0+IHJlZi5pZCA9PT0gbm9kZVJlZi5pZCksIHN0YXRlLmhvdmVyZWRWaWV3Tm9kZS5wb3NpdGlvbilcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gOiBwYXJlbnRSZWYucmVmID09PSBuZXdQYXJlbnRSZWYucmVmID8geyAvLyBtb3ZpbmcgaW4gdGhlIHNpbWlsYXIgcGFyZW50IChzYW1lIHR5cGUpXHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBbcGFyZW50UmVmLnJlZl06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgW3BhcmVudFJlZi5pZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb25bcGFyZW50UmVmLnJlZl1bcGFyZW50UmVmLmlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdW3BhcmVudFJlZi5pZF0uY2hpbGRyZW4uZmlsdGVyKChyZWYpPT4gcmVmLmlkICE9PSBub2RlUmVmLmlkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBbbmV3UGFyZW50UmVmLmlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbltuZXdQYXJlbnRSZWYucmVmXVtuZXdQYXJlbnRSZWYuaWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IHN0YXRlLmRlZmluaXRpb25bbmV3UGFyZW50UmVmLnJlZl1bbmV3UGFyZW50UmVmLmlkXS5jaGlsZHJlbi5zbGljZSgwLCBzdGF0ZS5ob3ZlcmVkVmlld05vZGUucG9zaXRpb24pLmNvbmNhdChub2RlUmVmLCBzdGF0ZS5kZWZpbml0aW9uW25ld1BhcmVudFJlZi5yZWZdW25ld1BhcmVudFJlZi5pZF0uY2hpbGRyZW4uc2xpY2Uoc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBvc2l0aW9uKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9IDogeyAvLyBtb3ZpbmcgdG8gYSBuZXcgdHlwZSBwYXJlbnRcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIFtwYXJlbnRSZWYucmVmXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBbcGFyZW50UmVmLmlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXVtwYXJlbnRSZWYuaWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IHN0YXRlLmRlZmluaXRpb25bcGFyZW50UmVmLnJlZl1bcGFyZW50UmVmLmlkXS5jaGlsZHJlbi5maWx0ZXIoKHJlZik9PiByZWYuaWQgIT09IG5vZGVSZWYuaWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBbbmV3UGFyZW50UmVmLnJlZl06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbltuZXdQYXJlbnRSZWYucmVmXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgW25ld1BhcmVudFJlZi5pZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb25bbmV3UGFyZW50UmVmLnJlZl1bbmV3UGFyZW50UmVmLmlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uW25ld1BhcmVudFJlZi5yZWZdW25ld1BhcmVudFJlZi5pZF0uY2hpbGRyZW4uc2xpY2UoMCwgc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBvc2l0aW9uKS5jb25jYXQobm9kZVJlZiwgc3RhdGUuZGVmaW5pdGlvbltuZXdQYXJlbnRSZWYucmVmXVtuZXdQYXJlbnRSZWYuaWRdLmNoaWxkcmVuLnNsaWNlKHN0YXRlLmhvdmVyZWRWaWV3Tm9kZS5wb3NpdGlvbikpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7XHJcbiAgICAgICAgICAgICAgICAuLi5maXhlZFBhcmVudHMsXHJcbiAgICAgICAgICAgICAgICBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uZml4ZWRQYXJlbnRzLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgW25vZGVSZWYucmVmXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5maXhlZFBhcmVudHMuZGVmaW5pdGlvbltub2RlUmVmLnJlZl0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtub2RlUmVmLmlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uZml4ZWRQYXJlbnRzLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVSZWYuaWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50OiBuZXdQYXJlbnRSZWZcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHN0b3BEcmFnZ2luZylcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBzdG9wRHJhZ2dpbmcpXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gSE9WRVJfTU9CSUxFKGUpIHtcclxuICAgICAgICBjb25zdCBlbGVtID0gZG9jdW1lbnQuZWxlbWVudEZyb21Qb2ludChlLnRvdWNoZXNbMF0uY2xpZW50WCwgZS50b3VjaGVzWzBdLmNsaWVudFkpXHJcbiAgICAgICAgY29uc3QgbW92ZUV2ZW50ID0gbmV3IE1vdXNlRXZlbnQoJ21vdXNlbW92ZScsIHtcclxuICAgICAgICAgICAgYnViYmxlczogdHJ1ZSxcclxuICAgICAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgdmlldzogd2luZG93LFxyXG4gICAgICAgICAgICBjbGllbnRYOiBlLnRvdWNoZXNbMF0uY2xpZW50WCxcclxuICAgICAgICAgICAgY2xpZW50WTogZS50b3VjaGVzWzBdLmNsaWVudFksXHJcbiAgICAgICAgICAgIHNjcmVlblg6IGUudG91Y2hlc1swXS5zY3JlZW5YLFxyXG4gICAgICAgICAgICBzY3JlZW5ZOiBlLnRvdWNoZXNbMF0uc2NyZWVuWSxcclxuICAgICAgICB9KVxyXG4gICAgICAgIGVsZW0uZGlzcGF0Y2hFdmVudChtb3ZlRXZlbnQpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gVklFV19IT1ZFUkVEKG5vZGVSZWYsIHBhcmVudFJlZiwgZGVwdGgsIGUpIHtcclxuICAgICAgICBpZighc3RhdGUuZHJhZ2dlZENvbXBvbmVudFZpZXcpe1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGhpdFBvc2l0aW9uID0gKGUudG91Y2hlcz8gMjg6IGUubGF5ZXJZKSAvIDI4XHJcbiAgICAgICAgY29uc3QgaW5zZXJ0QmVmb3JlICA9ICgpPT4gc2V0U3RhdGUoey4uLnN0YXRlLCBob3ZlcmVkVmlld05vZGU6IHtwYXJlbnQ6IHBhcmVudFJlZiwgZGVwdGgsIHBvc2l0aW9uOiBzdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdW3BhcmVudFJlZi5pZF0uY2hpbGRyZW4uZmlsdGVyKChyZWYpPT4gcmVmLmlkICE9PSBzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50Vmlldy5pZCkuZmluZEluZGV4KChyZWYpPT5yZWYuaWQgPT09IG5vZGVSZWYuaWQpfX0pXHJcbiAgICAgICAgY29uc3QgaW5zZXJ0QWZ0ZXIgICA9ICgpPT4gc2V0U3RhdGUoey4uLnN0YXRlLCBob3ZlcmVkVmlld05vZGU6IHtwYXJlbnQ6IHBhcmVudFJlZiwgZGVwdGgsIHBvc2l0aW9uOiBzdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdW3BhcmVudFJlZi5pZF0uY2hpbGRyZW4uZmlsdGVyKChyZWYpPT4gcmVmLmlkICE9PSBzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50Vmlldy5pZCkuZmluZEluZGV4KChyZWYpPT5yZWYuaWQgPT09IG5vZGVSZWYuaWQpICsgMX19KVxyXG4gICAgICAgIGNvbnN0IGluc2VydEFzRmlyc3QgPSAoKT0+IHNldFN0YXRlKHsuLi5zdGF0ZSwgaG92ZXJlZFZpZXdOb2RlOiB7cGFyZW50OiBub2RlUmVmLCBkZXB0aDogZGVwdGgrMSwgcG9zaXRpb246IDB9fSlcclxuICAgICAgICBjb25zdCBpbnNlcnRBc0xhc3QgPSAoKT0+IHNldFN0YXRlKHsuLi5zdGF0ZSwgaG92ZXJlZFZpZXdOb2RlOiB7cGFyZW50OiB7cmVmOiAndk5vZGVCb3gnLCBpZDogJ19yb290Tm9kZSd9LCBkZXB0aDogMSwgcG9zaXRpb246IHN0YXRlLmRlZmluaXRpb25bJ3ZOb2RlQm94J11bJ19yb290Tm9kZSddLmNoaWxkcmVuLmxlbmd0aH19KVxyXG4gICAgICAgIGNvbnN0IGluc2VydEF0ID0gKHRvUHV0UmVmLCBpbmRleCk9PiBzZXRTdGF0ZSh7Li4uc3RhdGUsIGhvdmVyZWRWaWV3Tm9kZToge3BhcmVudDogdG9QdXRSZWYsIGRlcHRoOiBkZXB0aC0xLCBwb3NpdGlvbjogaW5kZXgrMX19KVxyXG5cclxuICAgICAgICBpZihub2RlUmVmLmlkID09PSBzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50Vmlldy5pZCl7XHJcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudCA9IHN0YXRlLmRlZmluaXRpb25bcGFyZW50UmVmLnJlZl1bcGFyZW50UmVmLmlkXVxyXG4gICAgICAgICAgICAvLyBjaGVjayBpZiB0aGUgbGFzdCBjaGlsZCwgaWYgeWVzLCBnbyB0byBncmFuZHBhcmVudCBhbmQgZHJvcCB0aGVyZSBhZnRlciBwYXJlbnRcclxuICAgICAgICAgICAgaWYocGFyZW50LmNoaWxkcmVuW3BhcmVudC5jaGlsZHJlbi5sZW5ndGggLSAxXS5pZCA9PT0gbm9kZVJlZi5pZCl7XHJcbiAgICAgICAgICAgICAgICBpZihwYXJlbnRSZWYuaWQgIT09ICdfcm9vdE5vZGUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZ3JhbmRwYXJlbnQgPSBzdGF0ZS5kZWZpbml0aW9uW3BhcmVudC5wYXJlbnQucmVmXVtwYXJlbnQucGFyZW50LmlkXVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudFBvc2l0aW9uID0gZ3JhbmRwYXJlbnQuY2hpbGRyZW4uZmluZEluZGV4KChjaGlsZFJlZik9PiBjaGlsZFJlZi5pZCA9PT0gcGFyZW50UmVmLmlkKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpbnNlcnRBdChwYXJlbnQucGFyZW50LCBwYXJlbnRQb3NpdGlvbilcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc2V0U3RhdGUoey4uLnN0YXRlLCBob3ZlcmVkVmlld05vZGU6IG51bGwsfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYobm9kZVJlZi5pZCA9PT0gJ19yb290Tm9kZScpe1xyXG4gICAgICAgICAgICByZXR1cm4gaW5zZXJ0QXNGaXJzdCgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKG5vZGVSZWYuaWQgPT09ICdfbGFzdE5vZGUnKXtcclxuICAgICAgICAgICAgcmV0dXJuIGluc2VydEFzTGFzdCgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHByYXkgdG8gZ29kIHRoYXQgeW91IGRpZCBub3QgbWFrZSBhIG1pc3Rha2UgaGVyZVxyXG4gICAgICAgIGlmKHN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVSZWYuaWRdLmNoaWxkcmVuKXsgLy8gaWYgYm94XHJcbiAgICAgICAgICAgIGlmKHN0YXRlLnZpZXdGb2xkZXJzQ2xvc2VkW25vZGVSZWYuaWRdIHx8IHN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVSZWYuaWRdLmNoaWxkcmVuLmxlbmd0aCA9PT0gMCl7IC8vIGlmIGNsb3NlZCBvciBlbXB0eSBib3hcclxuICAgICAgICAgICAgICAgIGlmKGhpdFBvc2l0aW9uIDwgMC4zKXtcclxuICAgICAgICAgICAgICAgICAgICBpbnNlcnRCZWZvcmUoKVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZighb3BlbkJveFRpbWVvdXQpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVuQm94VGltZW91dCA9IHNldFRpbWVvdXQoKCk9PlZJRVdfRk9MREVSX0NMSUNLRUQobm9kZVJlZi5pZCwgZmFsc2UpLCA1MDApXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGluc2VydEFzRmlyc3QoKVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgeyAvLyBvcGVuIGJveFxyXG4gICAgICAgICAgICAgICAgaWYoaGl0UG9zaXRpb24gPCAwLjUpe1xyXG4gICAgICAgICAgICAgICAgICAgIGluc2VydEJlZm9yZSgpXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGluc2VydEFzRmlyc3QoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHsgLy8gc2ltcGxlIG5vZGVcclxuICAgICAgICAgICAgaWYoaGl0UG9zaXRpb24gPCAwLjUpe1xyXG4gICAgICAgICAgICAgICAgaW5zZXJ0QmVmb3JlKClcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGluc2VydEFmdGVyKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZihvcGVuQm94VGltZW91dCl7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dChvcGVuQm94VGltZW91dClcclxuICAgICAgICAgICAgb3BlbkJveFRpbWVvdXQgPSBudWxsXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIFBJUEVfSE9WRVJFRChwaXBlUmVmLCBlKSB7XHJcbiAgICAgICAgaWYoIXN0YXRlLmRyYWdnZWRDb21wb25lbnRTdGF0ZUlkKXtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGhvdmVyZWRQaXBlOiBwaXBlUmVmfSlcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBDT01QT05FTlRfVklFV19EUkFHR0VEKGUpIHtcclxuICAgICAgICBjb25zdCBpbml0aWFsWCA9IGUudG91Y2hlcyA/IGUudG91Y2hlc1swXS5wYWdlWCA6IGUucGFnZVhcclxuICAgICAgICBjb25zdCBpbml0aWFsWSA9IGUudG91Y2hlcyA/IGUudG91Y2hlc1swXS5wYWdlWSA6IGUucGFnZVlcclxuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuZWxtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXHJcbiAgICAgICAgY29uc3Qgb2Zmc2V0WCA9IGluaXRpYWxYIC0gcG9zaXRpb24ubGVmdFxyXG4gICAgICAgIGNvbnN0IG9mZnNldFkgPSBpbml0aWFsWSAtIHBvc2l0aW9uLnRvcFxyXG5cclxuICAgICAgICBmdW5jdGlvbiBkcmFnKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIGNvbnN0IHggPSBlLnRvdWNoZXMgPyBlLnRvdWNoZXNbMF0ucGFnZVggOiBlLnBhZ2VYXHJcbiAgICAgICAgICAgIGNvbnN0IHkgPSBlLnRvdWNoZXMgPyBlLnRvdWNoZXNbMF0ucGFnZVkgOiBlLnBhZ2VZXHJcbiAgICAgICAgICAgIHNldFN0YXRlKHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLFxyXG4gICAgICAgICAgICAgICAgY29tcG9uZW50RWRpdG9yUG9zaXRpb246IHt4OiB4IC0gb2Zmc2V0WCwgeTogeSAtIG9mZnNldFl9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBkcmFnKVxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBkcmFnKVxyXG4gICAgICAgIGZ1bmN0aW9uIHN0b3BEcmFnZ2luZyhldmVudCkge1xyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBkcmFnKVxyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZHJhZylcclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBzdG9wRHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHN0b3BEcmFnZ2luZylcclxuICAgICAgICB9XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBzdG9wRHJhZ2dpbmcpXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgc3RvcERyYWdnaW5nKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gV0lEVEhfRFJBR0dFRCh3aWR0aE5hbWUsIGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICBmdW5jdGlvbiByZXNpemUoZSl7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICAvLyBUT0RPIHJlZmFjdG9yXHJcbiAgICAgICAgICAgIGxldCBuZXdXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoIC0gKGUudG91Y2hlcz8gZS50b3VjaGVzWzBdLnBhZ2VYOiBlLnBhZ2VYKVxyXG4gICAgICAgICAgICBpZih3aWR0aE5hbWUgPT09ICdlZGl0b3JMZWZ0V2lkdGgnKXtcclxuICAgICAgICAgICAgICAgIG5ld1dpZHRoID0gZS50b3VjaGVzPyBlLnRvdWNoZXNbMF0ucGFnZVg6IGUucGFnZVhcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZih3aWR0aE5hbWUgPT09ICdzdWJFZGl0b3JXaWR0aCcpe1xyXG4gICAgICAgICAgICAgICAgbmV3V2lkdGggPSAoZS50b3VjaGVzPyBlLnRvdWNoZXNbMF0ucGFnZVg6IGUucGFnZVgpIC0gc3RhdGUuY29tcG9uZW50RWRpdG9yUG9zaXRpb24ueFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHdpZHRoTmFtZSA9PT0gJ3N1YkVkaXRvcldpZHRoTGVmdCcpe1xyXG4gICAgICAgICAgICAgICAgbmV3V2lkdGggPSBzdGF0ZS5jb21wb25lbnRFZGl0b3JQb3NpdGlvbi54ICsgc3RhdGUuc3ViRWRpdG9yV2lkdGggLSAoZS50b3VjaGVzPyBlLnRvdWNoZXNbMF0ucGFnZVg6IGUucGFnZVgpXHJcbiAgICAgICAgICAgICAgICBpZihuZXdXaWR0aCA8IDI1MCl7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc2V0U3RhdGUoey4uLnN0YXRlLCBzdWJFZGl0b3JXaWR0aDogbmV3V2lkdGgsIGNvbXBvbmVudEVkaXRvclBvc2l0aW9uOiB7Li4uc3RhdGUuY29tcG9uZW50RWRpdG9yUG9zaXRpb24sIHg6IGUudG91Y2hlcz8gZS50b3VjaGVzWzBdLnBhZ2VYOiBlLnBhZ2VYfX0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gSSBwcm9iYWJseSB3YXMgZHJ1bmtcclxuICAgICAgICAgICAgaWYod2lkdGhOYW1lICE9PSAnc3ViRWRpdG9yV2lkdGgnICYmIHdpZHRoTmFtZSAhPT0gJ3N1YkVkaXRvcldpZHRoJyAmJiAoICh3aWR0aE5hbWUgPT09ICdlZGl0b3JMZWZ0V2lkdGgnID8gc3RhdGUubGVmdE9wZW46IHN0YXRlLnJpZ2h0T3BlbikgPyBuZXdXaWR0aCA8IDE4MDogbmV3V2lkdGggPiAxODApKXtcclxuICAgICAgICAgICAgICAgIGlmKHdpZHRoTmFtZSA9PT0gJ2VkaXRvckxlZnRXaWR0aCcpe1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRTdGF0ZSh7Li4uc3RhdGUsIGxlZnRPcGVuOiAhc3RhdGUubGVmdE9wZW59KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNldFN0YXRlKHsuLi5zdGF0ZSwgcmlnaHRPcGVuOiAhc3RhdGUucmlnaHRPcGVufSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihuZXdXaWR0aCA8IDI1MCl7XHJcbiAgICAgICAgICAgICAgICBuZXdXaWR0aCA9IDI1MFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgW3dpZHRoTmFtZV06IG5ld1dpZHRofSlcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCByZXNpemUpXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHJlc2l6ZSlcclxuICAgICAgICBmdW5jdGlvbiBzdG9wRHJhZ2dpbmcoZSl7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgcmVzaXplKVxyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgcmVzaXplKVxyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHN0b3BEcmFnZ2luZylcclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgc3RvcERyYWdnaW5nKVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBzdG9wRHJhZ2dpbmcpXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgc3RvcERyYWdnaW5nKVxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIFNUQVRFX0RSQUdHRUQoc3RhdGVJZCwgZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIGNvbnN0IGluaXRpYWxYID0gZS50b3VjaGVzPyBlLnRvdWNoZXNbMF0ucGFnZVg6IGUucGFnZVhcclxuICAgICAgICBjb25zdCBpbml0aWFsWSA9IGUudG91Y2hlcz8gZS50b3VjaGVzWzBdLnBhZ2VZOiBlLnBhZ2VZXHJcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLmVsbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxyXG4gICAgICAgIGNvbnN0IG9mZnNldFggPSBpbml0aWFsWCAtIHBvc2l0aW9uLmxlZnRcclxuICAgICAgICBjb25zdCBvZmZzZXRZID0gaW5pdGlhbFkgLSBwb3NpdGlvbi50b3BcclxuICAgICAgICBmdW5jdGlvbiBkcmFnKGUpe1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgY29uc3QgeCA9IGUudG91Y2hlcz8gZS50b3VjaGVzWzBdLnBhZ2VYOiBlLnBhZ2VYXHJcbiAgICAgICAgICAgIGNvbnN0IHkgPSBlLnRvdWNoZXM/IGUudG91Y2hlc1swXS5wYWdlWTogZS5wYWdlWVxyXG4gICAgICAgICAgICBpZighc3RhdGUuZHJhZ2dlZENvbXBvbmVudFZpZXcpe1xyXG4gICAgICAgICAgICAgICAgaWYoTWF0aC5hYnMoaW5pdGlhbFkteSkgPiAzKXtcclxuICAgICAgICAgICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRyYWdnZWRDb21wb25lbnRTdGF0ZUlkOiBzdGF0ZUlkLCBtb3VzZVBvc2l0aW9uOiB7eDogeCAtIG9mZnNldFgsIHk6IHkgLSBvZmZzZXRZfX0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIG1vdXNlUG9zaXRpb246IHt4OiB4IC0gb2Zmc2V0WCwgeTogeSAtIG9mZnNldFl9fSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGRyYWcpXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGRyYWcpXHJcbiAgICAgICAgZnVuY3Rpb24gc3RvcERyYWdnaW5nKGV2ZW50KXtcclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZHJhZylcclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGRyYWcpXHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgc3RvcERyYWdnaW5nKVxyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBzdG9wRHJhZ2dpbmcpXHJcbiAgICAgICAgICAgIGlmKCFzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50U3RhdGVJZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFNUQVRFX05PREVfU0VMRUNURUQoc3RhdGVJZClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZighc3RhdGUuaG92ZXJlZFBpcGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzZXRTdGF0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUsXHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ2dlZENvbXBvbmVudFN0YXRlSWQ6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgaG92ZXJlZFBpcGU6IG51bGwsXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IGpvaW5JZFN0YXRlID0gdXVpZCgpXHJcbiAgICAgICAgICAgIGNvbnN0IGpvaW5JZFRleHQgPSB1dWlkKClcclxuICAgICAgICAgICAgY29uc3QgcGlwZUlkU3RhdGUgPSB1dWlkKClcclxuICAgICAgICAgICAgY29uc3QgcGlwZUlkVGV4dCA9IHV1aWQoKVxyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZSxcclxuICAgICAgICAgICAgICAgIGRyYWdnZWRDb21wb25lbnRTdGF0ZUlkOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgaG92ZXJlZFBpcGU6IG51bGwsXHJcbiAgICAgICAgICAgICAgICBkZWZpbml0aW9uIDoge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgcGlwZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtzdGF0ZS5ob3ZlcmVkUGlwZS5pZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZVtzdGF0ZS5ob3ZlcmVkUGlwZS5pZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFt7cmVmOiAnam9pbicsIGlkOiBqb2luSWRTdGF0ZX0sIHtyZWY6ICdqb2luJywgaWQ6IGpvaW5JZFRleHR9XS5jb25jYXQoc3RhdGUuZGVmaW5pdGlvbi5waXBlW3N0YXRlLmhvdmVyZWRQaXBlLmlkXS50cmFuc2Zvcm1hdGlvbnMpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtwaXBlSWRTdGF0ZV06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7cmVmOiAnc3RhdGUnLCBpZDpzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50U3RhdGVJZH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFt7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiAndG9UZXh0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZDogJ25vb3AnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBbcGlwZUlkVGV4dF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogW11cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGpvaW46IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5qb2luLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBbam9pbklkU3RhdGVdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToge3JlZjogJ3BpcGUnLCBpZDogcGlwZUlkU3RhdGV9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtqb2luSWRUZXh0XToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6ICdwaXBlJywgaWQ6IHBpcGVJZFRleHR9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBzdG9wRHJhZ2dpbmcpXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgc3RvcERyYWdnaW5nKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gT1BFTl9TSURFQkFSKHNpZGUpIHtcclxuICAgICAgICBpZihzaWRlID09PSAnbGVmdCcpe1xyXG4gICAgICAgICAgICByZXR1cm4gc2V0U3RhdGUoey4uLnN0YXRlLCBsZWZ0T3BlbjogIXN0YXRlLmxlZnRPcGVufSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoc2lkZSA9PT0gJ3JpZ2h0Jyl7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXRTdGF0ZSh7Li4uc3RhdGUsIHJpZ2h0T3BlbjogIXN0YXRlLnJpZ2h0T3Blbn0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gRlJFRVpFUl9DTElDS0VEKCkge1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgYXBwSXNGcm96ZW46ICFzdGF0ZS5hcHBJc0Zyb3plbn0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBWSUVXX0ZPTERFUl9DTElDS0VEKG5vZGVJZCwgZm9yY2VkVmFsdWUpIHtcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIHZpZXdGb2xkZXJzQ2xvc2VkOnsuLi5zdGF0ZS52aWV3Rm9sZGVyc0Nsb3NlZCwgW25vZGVJZF06IGZvcmNlZFZhbHVlICE9PSB1bmRlZmluZWQgPyBmb3JjZWRWYWx1ZSA6ICFzdGF0ZS52aWV3Rm9sZGVyc0Nsb3NlZFtub2RlSWRdfX0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBWSUVXX05PREVfU0VMRUNURUQocmVmKSB7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBzZWxlY3RlZFZpZXdOb2RlOnJlZn0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBVTlNFTEVDVF9WSUVXX05PREUoc2VsZk9ubHksIGUpIHtcclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgaWYoc2VsZk9ubHkgJiYgZS50YXJnZXQgIT09IHRoaXMuZWxtKXtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgc2VsZWN0ZWRWaWV3Tm9kZTp7fX0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBTVEFURV9OT0RFX1NFTEVDVEVEKG5vZGVJZCkge1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgc2VsZWN0ZWRTdGF0ZU5vZGVJZDpub2RlSWR9KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gVU5TRUxFQ1RfU1RBVEVfTk9ERShlKSB7XHJcbiAgICAgICAgaWYoZS50YXJnZXQgPT09IHRoaXMuZWxtKXtcclxuICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBzZWxlY3RlZFN0YXRlTm9kZUlkOicnfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBBRERfTk9ERShub2RlUmVmLCB0eXBlKSB7XHJcbiAgICAgICAgaWYoIW5vZGVSZWYucmVmIHx8ICFzdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlUmVmLmlkXSB8fCAhc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZVJlZi5pZF0uY2hpbGRyZW4pe1xyXG4gICAgICAgICAgICBpZihzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkICYmIHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgIT09ICdfcm9vdE5vZGUnKXtcclxuICAgICAgICAgICAgICAgIG5vZGVSZWYgPSBzdGF0ZS5kZWZpbml0aW9uW3N0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmXVtzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkXS5wYXJlbnRcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG5vZGVSZWYgPSB7cmVmOiAndk5vZGVCb3gnLCBpZDogJ19yb290Tm9kZSd9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgbm9kZUlkID0gbm9kZVJlZi5pZFxyXG4gICAgICAgIGNvbnN0IG5ld05vZGVJZCA9IHV1aWQoKVxyXG4gICAgICAgIGNvbnN0IG5ld1N0eWxlSWQgPSB1dWlkKClcclxuICAgICAgICBjb25zdCBuZXdTdHlsZSA9IHtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHlwZSA9PT0gJ2JveCcpIHtcclxuICAgICAgICAgICAgY29uc3QgbmV3Tm9kZSA9IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnYm94JyxcclxuICAgICAgICAgICAgICAgIHBhcmVudDogbm9kZVJlZixcclxuICAgICAgICAgICAgICAgIHN0eWxlOiB7cmVmOidzdHlsZScsIGlkOm5ld1N0eWxlSWR9LFxyXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzZXRTdGF0ZSh7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZSxcclxuICAgICAgICAgICAgICAgIHNlbGVjdGVkVmlld05vZGU6IHtyZWY6J3ZOb2RlQm94JywgaWQ6IG5ld05vZGVJZH0sXHJcbiAgICAgICAgICAgICAgICBkZWZpbml0aW9uOiBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlQm94JyA/IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIHZOb2RlQm94OiB7Li4uc3RhdGUuZGVmaW5pdGlvbi52Tm9kZUJveCwgW25vZGVJZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnZOb2RlQm94W25vZGVJZF0sIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uLnZOb2RlQm94W25vZGVJZF0uY2hpbGRyZW4uY29uY2F0KHtyZWY6J3ZOb2RlQm94JywgaWQ6bmV3Tm9kZUlkfSl9LCBbbmV3Tm9kZUlkXTogbmV3Tm9kZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnN0eWxlLCBbbmV3U3R5bGVJZF06IG5ld1N0eWxlfSxcclxuICAgICAgICAgICAgICAgIH0gOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBbbm9kZVJlZi5yZWZdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl0sIFtub2RlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZUlkXSwgY2hpbGRyZW46IHN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVJZF0uY2hpbGRyZW4uY29uY2F0KHtyZWY6J3ZOb2RlQm94JywgaWQ6bmV3Tm9kZUlkfSl9fSxcclxuICAgICAgICAgICAgICAgICAgICB2Tm9kZUJveDogey4uLnN0YXRlLmRlZmluaXRpb24udk5vZGVCb3gsIFtuZXdOb2RlSWRdOiBuZXdOb2RlfSxcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogey4uLnN0YXRlLmRlZmluaXRpb24uc3R5bGUsIFtuZXdTdHlsZUlkXTogbmV3U3R5bGV9LFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0eXBlID09PSAndGV4dCcpe1xyXG4gICAgICAgICAgICBjb25zdCBwaXBlSWQgPSB1dWlkKClcclxuICAgICAgICAgICAgY29uc3QgbmV3Tm9kZSA9IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IG5vZGVSZWYsXHJcbiAgICAgICAgICAgICAgICBzdHlsZToge3JlZjonc3R5bGUnLCBpZDpuZXdTdHlsZUlkfSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB7cmVmOidwaXBlJywgaWQ6cGlwZUlkfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1BpcGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogJ0RlZmF1bHQgVGV4dCcsXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFtdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNldFN0YXRlKHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRWaWV3Tm9kZToge3JlZjondk5vZGVUZXh0JywgaWQ6IG5ld05vZGVJZH0sXHJcbiAgICAgICAgICAgICAgICBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBwaXBlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLCBbcGlwZUlkXTogbmV3UGlwZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgW25vZGVSZWYucmVmXTogey4uLnN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdLCBbbm9kZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVJZF0sIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlSWRdLmNoaWxkcmVuLmNvbmNhdCh7cmVmOid2Tm9kZVRleHQnLCBpZDpuZXdOb2RlSWR9KX19LFxyXG4gICAgICAgICAgICAgICAgICAgIHZOb2RlVGV4dDogey4uLnN0YXRlLmRlZmluaXRpb24udk5vZGVUZXh0LCBbbmV3Tm9kZUlkXTogbmV3Tm9kZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnN0eWxlLCBbbmV3U3R5bGVJZF06IG5ld1N0eWxlfSxcclxuICAgICAgICAgICAgICAgIH19KVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0eXBlID09PSAnaW1hZ2UnKXtcclxuICAgICAgICAgICAgY29uc3QgcGlwZUlkID0gdXVpZCgpXHJcbiAgICAgICAgICAgIGNvbnN0IG5ld05vZGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ2ltYWdlJyxcclxuICAgICAgICAgICAgICAgIHBhcmVudDogbm9kZVJlZixcclxuICAgICAgICAgICAgICAgIHN0eWxlOiB7cmVmOidzdHlsZScsIGlkOm5ld1N0eWxlSWR9LFxyXG4gICAgICAgICAgICAgICAgc3JjOiB7cmVmOidwaXBlJywgaWQ6cGlwZUlkfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1BpcGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogJ2h0dHBzOi8vd3d3LnVnbmlzLmNvbS9pbWFnZXMvbG9nbzI1NngyNTYucG5nJyxcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogW11cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc2V0U3RhdGUoe1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFZpZXdOb2RlOiB7cmVmOid2Tm9kZUltYWdlJywgaWQ6IG5ld05vZGVJZH0sXHJcbiAgICAgICAgICAgICAgICBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBwaXBlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLCBbcGlwZUlkXTogbmV3UGlwZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgW25vZGVSZWYucmVmXTogey4uLnN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdLCBbbm9kZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVJZF0sIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlSWRdLmNoaWxkcmVuLmNvbmNhdCh7cmVmOid2Tm9kZUltYWdlJywgaWQ6bmV3Tm9kZUlkfSl9fSxcclxuICAgICAgICAgICAgICAgICAgICB2Tm9kZUltYWdlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi52Tm9kZUltYWdlLCBbbmV3Tm9kZUlkXTogbmV3Tm9kZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnN0eWxlLCBbbmV3U3R5bGVJZF06IG5ld1N0eWxlfSxcclxuICAgICAgICAgICAgICAgIH19KVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0eXBlID09PSAnaWYnKXtcclxuICAgICAgICAgICAgY29uc3QgcGlwZUlkID0gdXVpZCgpXHJcbiAgICAgICAgICAgIGNvbnN0IG5ld05vZGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ2NvbmRpdGlvbmFsJyxcclxuICAgICAgICAgICAgICAgIHBhcmVudDogbm9kZVJlZixcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB7cmVmOidwaXBlJywgaWQ6cGlwZUlkfSxcclxuICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBbXSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBuZXdQaXBlID0ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFtdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNldFN0YXRlKHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRWaWV3Tm9kZToge3JlZjondk5vZGVJZicsIGlkOiBuZXdOb2RlSWR9LFxyXG4gICAgICAgICAgICAgICAgZGVmaW5pdGlvbjogbm9kZVJlZi5yZWYgPT09ICd2Tm9kZUlmJyA/IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsIFtwaXBlSWRdOiBuZXdQaXBlfSxcclxuICAgICAgICAgICAgICAgICAgICB2Tm9kZUlmOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi52Tm9kZUlmLCBbbm9kZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb24udk5vZGVJZltub2RlSWRdLCBjaGlsZHJlbjogc3RhdGUuZGVmaW5pdGlvbi52Tm9kZUlmW25vZGVJZF0uY2hpbGRyZW4uY29uY2F0KHtyZWY6J3ZOb2RlSWYnLCBpZDpuZXdOb2RlSWR9KX0sIFtuZXdOb2RlSWRdOiBuZXdOb2RlfSxcclxuICAgICAgICAgICAgICAgIH0gOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBwaXBlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLCBbcGlwZUlkXTogbmV3UGlwZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgW25vZGVSZWYucmVmXTogey4uLnN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdLCBbbm9kZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVJZF0sIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlSWRdLmNoaWxkcmVuLmNvbmNhdCh7cmVmOid2Tm9kZUlmJywgaWQ6bmV3Tm9kZUlkfSl9fSxcclxuICAgICAgICAgICAgICAgICAgICB2Tm9kZUlmOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi52Tm9kZUlmLCBbbmV3Tm9kZUlkXTogbmV3Tm9kZX0sXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHR5cGUgPT09ICdpbnB1dCcpIHtcclxuICAgICAgICAgICAgY29uc3Qgc3RhdGVJZCA9IHV1aWQoKVxyXG4gICAgICAgICAgICBjb25zdCBldmVudElkID0gdXVpZCgpXHJcbiAgICAgICAgICAgIGNvbnN0IG11dGF0b3JJZCA9IHV1aWQoKVxyXG4gICAgICAgICAgICBjb25zdCBwaXBlSW5wdXRJZCA9IHV1aWQoKVxyXG4gICAgICAgICAgICBjb25zdCBwaXBlTXV0YXRvcklkID0gdXVpZCgpXHJcbiAgICAgICAgICAgIGNvbnN0IG5ld05vZGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ2lucHV0JyxcclxuICAgICAgICAgICAgICAgIHBhcmVudDogbm9kZVJlZixcclxuICAgICAgICAgICAgICAgIHN0eWxlOiB7cmVmOidzdHlsZScsIGlkOm5ld1N0eWxlSWR9LFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6J3BpcGUnLCBpZDpwaXBlSW5wdXRJZH0sXHJcbiAgICAgICAgICAgICAgICBpbnB1dDoge3JlZjonZXZlbnQnLCBpZDpldmVudElkfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1BpcGVJbnB1dCA9IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB7cmVmOiAnc3RhdGUnLCBpZDogc3RhdGVJZH0sXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFtdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbmV3UGlwZU11dGF0b3IgPSB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZToge3JlZjogJ2V2ZW50RGF0YScsIGlkOiAnX2lucHV0J30sXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFtdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbmV3U3RhdGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ2lucHV0IHZhbHVlJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgIHJlZjogc3RhdGVJZCxcclxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogJ0RlZmF1bHQgdGV4dCcsXHJcbiAgICAgICAgICAgICAgICBtdXRhdG9yczogW3sgcmVmOidtdXRhdG9yJywgaWQ6bXV0YXRvcklkfV0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbmV3TXV0YXRvciA9IHtcclxuICAgICAgICAgICAgICAgIGV2ZW50OiB7IHJlZjogJ2V2ZW50JywgaWQ6ZXZlbnRJZH0sXHJcbiAgICAgICAgICAgICAgICBzdGF0ZTogeyByZWY6ICdzdGF0ZScsIGlkOnN0YXRlSWR9LFxyXG4gICAgICAgICAgICAgICAgbXV0YXRpb246IHsgcmVmOiAncGlwZScsIGlkOiBwaXBlTXV0YXRvcklkfSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBuZXdFdmVudCA9IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdpbnB1dCcsXHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ3VwZGF0ZSBpbnB1dCcsXHJcbiAgICAgICAgICAgICAgICBtdXRhdG9yczogW1xyXG4gICAgICAgICAgICAgICAgICAgIHsgcmVmOiAnbXV0YXRvcicsIGlkOiBtdXRhdG9ySWR9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgIGVtaXR0ZXI6IHtcclxuICAgICAgICAgICAgICAgICAgICByZWY6ICd2Tm9kZUlucHV0JyxcclxuICAgICAgICAgICAgICAgICAgICBpZDogbmV3Tm9kZUlkLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IFtcclxuICAgICAgICAgICAgICAgICAgICB7cmVmOiAnZXZlbnREYXRhJywgaWQ6ICdfaW5wdXQnfVxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc2V0U3RhdGUoe1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFZpZXdOb2RlOiB7cmVmOid2Tm9kZUlucHV0JywgaWQ6IG5ld05vZGVJZH0sXHJcbiAgICAgICAgICAgICAgICBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBwaXBlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLCBbcGlwZUlucHV0SWRdOiBuZXdQaXBlSW5wdXQsIFtwaXBlTXV0YXRvcklkXTogbmV3UGlwZU11dGF0b3J9LFxyXG4gICAgICAgICAgICAgICAgICAgIFtub2RlUmVmLnJlZl06IHsuLi5zdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXSwgW25vZGVJZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlSWRdLCBjaGlsZHJlbjogc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZUlkXS5jaGlsZHJlbi5jb25jYXQoe3JlZjondk5vZGVJbnB1dCcsIGlkOm5ld05vZGVJZH0pfX0sXHJcbiAgICAgICAgICAgICAgICAgICAgdk5vZGVJbnB1dDogey4uLnN0YXRlLmRlZmluaXRpb24udk5vZGVJbnB1dCwgW25ld05vZGVJZF06IG5ld05vZGV9LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5zdHlsZSwgW25ld1N0eWxlSWRdOiBuZXdTdHlsZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZVNwYWNlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5uYW1lU3BhY2UsIFsnX3Jvb3ROYW1lU3BhY2UnXTogey4uLnN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlWydfcm9vdE5hbWVTcGFjZSddLCBjaGlsZHJlbjogc3RhdGUuZGVmaW5pdGlvbi5uYW1lU3BhY2VbJ19yb290TmFtZVNwYWNlJ10uY2hpbGRyZW4uY29uY2F0KHtyZWY6J3N0YXRlJywgaWQ6c3RhdGVJZH0pfX0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnN0YXRlLCBbc3RhdGVJZF06IG5ld1N0YXRlfSxcclxuICAgICAgICAgICAgICAgICAgICBtdXRhdG9yOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5tdXRhdG9yLCBbbXV0YXRvcklkXTogbmV3TXV0YXRvcn0sXHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLmV2ZW50LCBbZXZlbnRJZF06IG5ld0V2ZW50fSxcclxuICAgICAgICAgICAgICAgIH19KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIEFERF9TVEFURShuYW1lc3BhY2VJZCwgdHlwZSkge1xyXG4gICAgICAgIGNvbnN0IG5ld1N0YXRlSWQgPSB1dWlkKClcclxuICAgICAgICBsZXQgbmV3U3RhdGVcclxuICAgICAgICBpZih0eXBlID09PSAndGV4dCcpIHtcclxuICAgICAgICAgICAgbmV3U3RhdGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ25ldyB0ZXh0JyxcclxuICAgICAgICAgICAgICAgIHJlZjogbmV3U3RhdGVJZCxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogJ0RlZmF1bHQgdGV4dCcsXHJcbiAgICAgICAgICAgICAgICBtdXRhdG9yczogW10sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHlwZSA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgbmV3U3RhdGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ25ldyBudW1iZXInLFxyXG4gICAgICAgICAgICAgICAgcmVmOiBuZXdTdGF0ZUlkLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ251bWJlcicsXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU6IDAsXHJcbiAgICAgICAgICAgICAgICBtdXRhdG9yczogW10sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHlwZSA9PT0gJ2Jvb2xlYW4nKSB7XHJcbiAgICAgICAgICAgIG5ld1N0YXRlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICduZXcgYm9vbGVhbicsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgICAgICAgICByZWY6IG5ld1N0YXRlSWQsXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBtdXRhdG9yczogW10sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHlwZSA9PT0gJ3RhYmxlJykge1xyXG4gICAgICAgICAgICBuZXdTdGF0ZSA9IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnbmV3IHRhYmxlJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICd0YWJsZScsXHJcbiAgICAgICAgICAgICAgICByZWY6IG5ld1N0YXRlSWQsXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU6IHt9LFxyXG4gICAgICAgICAgICAgICAgbXV0YXRvcnM6IFtdLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHR5cGUgPT09ICdmb2xkZXInKSB7XHJcbiAgICAgICAgICAgIG5ld1N0YXRlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICduZXcgZm9sZGVyJyxcclxuICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBbXSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgbmFtZVNwYWNlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5uYW1lU3BhY2UsIFtuYW1lc3BhY2VJZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZVtuYW1lc3BhY2VJZF0sIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZVtuYW1lc3BhY2VJZF0uY2hpbGRyZW4uY29uY2F0KHtyZWY6J25hbWVTcGFjZScsIGlkOm5ld1N0YXRlSWR9KX0sIFtuZXdTdGF0ZUlkXTogbmV3U3RhdGV9LFxyXG4gICAgICAgICAgICB9fSlcclxuICAgICAgICB9XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIG5hbWVTcGFjZTogey4uLnN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlLCBbbmFtZXNwYWNlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5uYW1lU3BhY2VbbmFtZXNwYWNlSWRdLCBjaGlsZHJlbjogc3RhdGUuZGVmaW5pdGlvbi5uYW1lU3BhY2VbbmFtZXNwYWNlSWRdLmNoaWxkcmVuLmNvbmNhdCh7cmVmOidzdGF0ZScsIGlkOm5ld1N0YXRlSWR9KX19LFxyXG4gICAgICAgICAgICBzdGF0ZTogey4uLnN0YXRlLmRlZmluaXRpb24uc3RhdGUsIFtuZXdTdGF0ZUlkXTogbmV3U3RhdGV9LFxyXG4gICAgICAgIH19KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQUREX0RFRkFVTFRfU1RZTEUoc3R5bGVJZCwga2V5KSB7XHJcbiAgICAgICAgY29uc3QgcGlwZUlkID0gdXVpZCgpXHJcbiAgICAgICAgY29uc3QgZGVmYXVsdHMgPSB7XHJcbiAgICAgICAgICAgICdiYWNrZ3JvdW5kJzogJ3doaXRlJyxcclxuICAgICAgICAgICAgJ2JvcmRlcic6ICcxcHggc29saWQgYmxhY2snLFxyXG4gICAgICAgICAgICAnb3V0bGluZSc6ICcxcHggc29saWQgYmxhY2snLFxyXG4gICAgICAgICAgICAnY3Vyc29yJzogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAnY29sb3InOiAnYmxhY2snLFxyXG4gICAgICAgICAgICAnZGlzcGxheSc6ICdibG9jaycsXHJcbiAgICAgICAgICAgICd0b3AnOiAnMHB4JyxcclxuICAgICAgICAgICAgJ2JvdHRvbSc6ICcwcHgnLFxyXG4gICAgICAgICAgICAnbGVmdCc6ICcwcHgnLFxyXG4gICAgICAgICAgICAncmlnaHQnOiAnMHB4JyxcclxuICAgICAgICAgICAgJ2ZsZXgnOiAnMSAxIGF1dG8nLFxyXG4gICAgICAgICAgICAnanVzdGlmeUNvbnRlbnQnOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgJ2FsaWduSXRlbXMnOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgJ21heFdpZHRoJzogJzEwMCUnLFxyXG4gICAgICAgICAgICAnbWF4SGVpZ2h0JzogJzEwMCUnLFxyXG4gICAgICAgICAgICAnbWluV2lkdGgnOiAnMTAwJScsXHJcbiAgICAgICAgICAgICdtaW5IZWlnaHQnOiAnMTAwJScsXHJcbiAgICAgICAgICAgICdwb3NpdGlvbic6ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICdvdmVyZmxvdyc6ICdhdXRvJyxcclxuICAgICAgICAgICAgJ2hlaWdodCc6ICc1MDBweCcsXHJcbiAgICAgICAgICAgICd3aWR0aCc6ICc1MDBweCcsXHJcbiAgICAgICAgICAgICdmb250JzogJ2l0YWxpYyAyZW0gXCJDb21pYyBTYW5zIE1TXCIsIGN1cnNpdmUsIHNhbnMtc2VyaWYnLFxyXG4gICAgICAgICAgICAnbWFyZ2luJzogJzEwcHgnLFxyXG4gICAgICAgICAgICAncGFkZGluZyc6ICcxMHB4JyxcclxuICAgICAgICB9XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIHBpcGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsIFtwaXBlSWRdOiB7dHlwZTogJ3RleHQnLCB2YWx1ZTogZGVmYXVsdHNba2V5XSwgdHJhbnNmb3JtYXRpb25zOltdfX0sXHJcbiAgICAgICAgICAgIHN0eWxlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5zdHlsZSwgW3N0eWxlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5zdHlsZVtzdHlsZUlkXSwgW2tleV06IHtyZWY6ICdwaXBlJywgaWQ6IHBpcGVJZH19fX19KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gU0VMRUNUX1ZJRVdfU1VCTUVOVShuZXdJZCkge1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgc2VsZWN0ZWRWaWV3U3ViTWVudTpuZXdJZH0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBFRElUX1ZJRVdfTk9ERV9USVRMRShub2RlSWQpIHtcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGVkaXRpbmdUaXRsZU5vZGVJZDpub2RlSWR9KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gREVMRVRFX1NFTEVDVEVEX1ZJRVcobm9kZVJlZiwgcGFyZW50UmVmKSB7XHJcbiAgICAgICAgaWYobm9kZVJlZi5pZCA9PT0gJ19yb290Tm9kZScpe1xyXG4gICAgICAgICAgICBpZihzdGF0ZS5kZWZpbml0aW9uLnZOb2RlQm94Wydfcm9vdE5vZGUnXS5jaGlsZHJlbi5sZW5ndGggPT09IDApe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGltbXV0YWJseSByZW1vdmUgYWxsIG5vZGVzIGV4Y2VwdCByb290Tm9kZVxyXG4gICAgICAgICAgICByZXR1cm4gc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgdk5vZGVCb3g6IHsnX3Jvb3ROb2RlJzogey4uLnN0YXRlLmRlZmluaXRpb24udk5vZGVCb3hbJ19yb290Tm9kZSddLCBjaGlsZHJlbjogW119fSxcclxuICAgICAgICAgICAgfSwgc2VsZWN0ZWRWaWV3Tm9kZToge319KVxyXG4gICAgICAgIH1cclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgW3BhcmVudFJlZi5yZWZdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXSwgW3BhcmVudFJlZi5pZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdW3BhcmVudFJlZi5pZF0sIGNoaWxkcmVuOnN0YXRlLmRlZmluaXRpb25bcGFyZW50UmVmLnJlZl1bcGFyZW50UmVmLmlkXS5jaGlsZHJlbi5maWx0ZXIoKHJlZik9PnJlZi5pZCAhPT0gbm9kZVJlZi5pZCl9fSxcclxuICAgICAgICB9LCBzZWxlY3RlZFZpZXdOb2RlOiB7fX0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBDSEFOR0VfVklFV19OT0RFX1RJVExFKG5vZGVSZWYsIGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgY29uc3Qgbm9kZUlkID0gbm9kZVJlZi5pZFxyXG4gICAgICAgIGNvbnN0IG5vZGVUeXBlID0gbm9kZVJlZi5yZWZcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgW25vZGVUeXBlXTogey4uLnN0YXRlLmRlZmluaXRpb25bbm9kZVR5cGVdLCBbbm9kZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb25bbm9kZVR5cGVdW25vZGVJZF0sIHRpdGxlOiBlLnRhcmdldC52YWx1ZX19LFxyXG4gICAgICAgIH19KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQ0hBTkdFX1NUQVRFX05PREVfVElUTEUobm9kZUlkLCBlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICBzdGF0ZTogey4uLnN0YXRlLmRlZmluaXRpb24uc3RhdGUsIFtub2RlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5zdGF0ZVtub2RlSWRdLCB0aXRsZTogZS50YXJnZXQudmFsdWV9fSxcclxuICAgICAgICB9fSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIENIQU5HRV9OQU1FU1BBQ0VfVElUTEUobm9kZUlkLCBlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICBuYW1lU3BhY2U6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZSwgW25vZGVJZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZVtub2RlSWRdLCB0aXRsZTogZS50YXJnZXQudmFsdWV9fSxcclxuICAgICAgICB9fSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIENIQU5HRV9DVVJSRU5UX1NUQVRFX1RFWFRfVkFMVUUoc3RhdGVJZCwgZSkge1xyXG4gICAgICAgIGFwcC5zZXRDdXJyZW50U3RhdGUoey4uLmFwcC5nZXRDdXJyZW50U3RhdGUoKSwgW3N0YXRlSWRdOiBlLnRhcmdldC52YWx1ZX0pXHJcbiAgICAgICAgcmVuZGVyKClcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIENIQU5HRV9DVVJSRU5UX1NUQVRFX05VTUJFUl9WQUxVRShzdGF0ZUlkLCBlKSB7XHJcbiAgICAgICAgLy8gdG9kbyBiaWcgdGhyb3dzIGVycm9yIGluc3RlYWQgb2YgcmV0dXJuaW5nIE5hTi4uLiBmaXgsIHJld3JpdGUgb3IgaGFja1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmKGJpZyhlLnRhcmdldC52YWx1ZSkudG9TdHJpbmcoKSAhPT0gYXBwLmdldEN1cnJlbnRTdGF0ZSgpW3N0YXRlSWRdLnRvU3RyaW5nKCkpe1xyXG4gICAgICAgICAgICAgICAgYXBwLnNldEN1cnJlbnRTdGF0ZSh7Li4uYXBwLmdldEN1cnJlbnRTdGF0ZSgpLCBbc3RhdGVJZF06IGJpZyhlLnRhcmdldC52YWx1ZSl9KVxyXG4gICAgICAgICAgICAgICAgcmVuZGVyKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2goZXJyKSB7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQ0hBTkdFX1NUQVRJQ19WQUxVRShyZWYsIHByb3BlcnR5TmFtZSwgdHlwZSwgZSkge1xyXG4gICAgICAgIGxldCB2YWx1ZSA9IGUudGFyZ2V0LnZhbHVlXHJcbiAgICAgICAgaWYodHlwZSA9PT0gJ251bWJlcicpe1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBiaWcoZS50YXJnZXQudmFsdWUpXHJcbiAgICAgICAgICAgIH0gY2F0Y2goZXJyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHlwZSA9PT0gJ2Jvb2xlYW4nKXtcclxuICAgICAgICAgICAgdmFsdWUgPSAodmFsdWUgPT09IHRydWUgfHwgdmFsdWUgPT09ICd0cnVlJykgPyB0cnVlIDogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOntcclxuICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgW3JlZi5yZWZdOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uW3JlZi5yZWZdLFxyXG4gICAgICAgICAgICAgICAgW3JlZi5pZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uW3JlZi5yZWZdW3JlZi5pZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgW3Byb3BlcnR5TmFtZV06IHZhbHVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9fSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIEFERF9FVkVOVChwcm9wZXJ0eU5hbWUsIG5vZGUpIHtcclxuICAgICAgICBjb25zdCByZWYgPSBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlXHJcbiAgICAgICAgY29uc3QgZXZlbnRJZCA9IHV1aWQoKTtcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246e1xyXG4gICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICBbcmVmLnJlZl06IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb25bcmVmLnJlZl0sXHJcbiAgICAgICAgICAgICAgICBbcmVmLmlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXSxcclxuICAgICAgICAgICAgICAgICAgICBbcHJvcGVydHlOYW1lXToge3JlZjogJ2V2ZW50JywgaWQ6IGV2ZW50SWR9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGV2ZW50OiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLmV2ZW50LFxyXG4gICAgICAgICAgICAgICAgW2V2ZW50SWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogcHJvcGVydHlOYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIGVtaXR0ZXI6IG5vZGUsXHJcbiAgICAgICAgICAgICAgICAgICAgbXV0YXRvcnM6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IFtdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9fSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFNFTEVDVF9QSVBFKHBpcGVJZCwgZSkge1xyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIHNlbGVjdGVkUGlwZUlkOnBpcGVJZH0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBDSEFOR0VfUElQRV9WQUxVRV9UT19TVEFURShwaXBlSWQpIHtcclxuICAgICAgICBpZighc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCB8fCBzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBzdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXS52YWx1ZS5pZCApe1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICBwaXBlOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsXHJcbiAgICAgICAgICAgICAgICBbcGlwZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLFxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7cmVmOiAnc3RhdGUnLCBpZDogc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZH0sXHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBbXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfX0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBBRERfVFJBTlNGT1JNQVRJT04ocGlwZUlkLCB0cmFuc2Zvcm1hdGlvbikge1xyXG4gICAgICAgIGlmKHRyYW5zZm9ybWF0aW9uID09PSAnam9pbicpe1xyXG4gICAgICAgICAgICBjb25zdCBuZXdQaXBlSWQgPSB1dWlkKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGpvaW5JZCA9IHV1aWQoKTtcclxuICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgam9pbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24uam9pbixcclxuICAgICAgICAgICAgICAgICAgICBbam9pbklkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToge3JlZjogJ3BpcGUnLCBpZDpuZXdQaXBlSWR9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHBpcGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsXHJcbiAgICAgICAgICAgICAgICAgICAgW25ld1BpcGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ0RlZmF1bHQgdGV4dCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogW11cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFtwaXBlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IHN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLnRyYW5zZm9ybWF0aW9ucy5jb25jYXQoe3JlZjogJ2pvaW4nLCBpZDpqb2luSWR9KVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfX0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRyYW5zZm9ybWF0aW9uID09PSAndG9VcHBlckNhc2UnKXtcclxuICAgICAgICAgICAgY29uc3QgbmV3SWQgPSB1dWlkKCk7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgIHRvVXBwZXJDYXNlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi50b1VwcGVyQ2FzZSxcclxuICAgICAgICAgICAgICAgICAgICBbbmV3SWRdOiB7fVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHBpcGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsXHJcbiAgICAgICAgICAgICAgICAgICAgW3BpcGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0udHJhbnNmb3JtYXRpb25zLmNvbmNhdCh7cmVmOiAndG9VcHBlckNhc2UnLCBpZDpuZXdJZH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9fSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHJhbnNmb3JtYXRpb24gPT09ICd0b0xvd2VyQ2FzZScpe1xyXG4gICAgICAgICAgICBjb25zdCBuZXdJZCA9IHV1aWQoKTtcclxuICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgdG9Mb3dlckNhc2U6IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnRvTG93ZXJDYXNlLFxyXG4gICAgICAgICAgICAgICAgICAgIFtuZXdJZF06IHt9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcGlwZToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZSxcclxuICAgICAgICAgICAgICAgICAgICBbcGlwZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBzdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXS50cmFuc2Zvcm1hdGlvbnMuY29uY2F0KHtyZWY6ICd0b0xvd2VyQ2FzZScsIGlkOm5ld0lkfSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH19KVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0cmFuc2Zvcm1hdGlvbiA9PT0gJ3RvVGV4dCcpe1xyXG4gICAgICAgICAgICBjb25zdCBuZXdJZCA9IHV1aWQoKTtcclxuICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgdG9UZXh0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi50b1RleHQsXHJcbiAgICAgICAgICAgICAgICAgICAgW25ld0lkXToge31cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwaXBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIFtwaXBlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IHN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLnRyYW5zZm9ybWF0aW9ucy5jb25jYXQoe3JlZjogJ3RvVGV4dCcsIGlkOm5ld0lkfSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH19KVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0cmFuc2Zvcm1hdGlvbiA9PT0gJ2FkZCcpe1xyXG4gICAgICAgICAgICBjb25zdCBuZXdQaXBlSWQgPSB1dWlkKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGFkZElkID0gdXVpZCgpO1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICBhZGQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLmFkZCxcclxuICAgICAgICAgICAgICAgICAgICBbYWRkSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7cmVmOiAncGlwZScsIGlkOm5ld1BpcGVJZH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcGlwZToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZSxcclxuICAgICAgICAgICAgICAgICAgICBbbmV3UGlwZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogW11cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFtwaXBlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IHN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLnRyYW5zZm9ybWF0aW9ucy5jb25jYXQoe3JlZjogJ2FkZCcsIGlkOmFkZElkfSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH19KVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0cmFuc2Zvcm1hdGlvbiA9PT0gJ3N1YnRyYWN0Jyl7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1BpcGVJZCA9IHV1aWQoKTtcclxuICAgICAgICAgICAgY29uc3Qgc3VidHJhY3RJZCA9IHV1aWQoKTtcclxuICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgc3VidHJhY3Q6IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnN1YnRyYWN0LFxyXG4gICAgICAgICAgICAgICAgICAgIFtzdWJ0cmFjdElkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToge3JlZjogJ3BpcGUnLCBpZDpuZXdQaXBlSWR9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHBpcGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsXHJcbiAgICAgICAgICAgICAgICAgICAgW25ld1BpcGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ251bWJlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBbcGlwZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBzdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXS50cmFuc2Zvcm1hdGlvbnMuY29uY2F0KHtyZWY6ICdzdWJ0cmFjdCcsIGlkOnN1YnRyYWN0SWR9KVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfX0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gUkVTRVRfQVBQX1NUQVRFKCkge1xyXG4gICAgICAgIGFwcC5zZXRDdXJyZW50U3RhdGUoYXBwLmNyZWF0ZURlZmF1bHRTdGF0ZSgpKVxyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZXZlbnRTdGFjazogW119KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gUkVTRVRfQVBQX0RFRklOSVRJT04oKSB7XHJcbiAgICAgICAgaWYoc3RhdGUuZGVmaW5pdGlvbiAhPT0gYXBwRGVmaW5pdGlvbil7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjogey4uLmFwcERlZmluaXRpb259fSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBGVUxMX1NDUkVFTl9DTElDS0VEKHZhbHVlKSB7XHJcbiAgICAgICAgaWYodmFsdWUgIT09IHN0YXRlLmZ1bGxTY3JlZW4pe1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGZ1bGxTY3JlZW46IHZhbHVlfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBTQVZFX0RFRkFVTFQoc3RhdGVJZCkge1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjp7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIHN0YXRlOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnN0YXRlLFxyXG4gICAgICAgICAgICAgICAgW3N0YXRlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5zdGF0ZVtzdGF0ZUlkXSxcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU6IGFwcC5nZXRDdXJyZW50U3RhdGUoKVtzdGF0ZUlkXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfX0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBERUxFVEVfU1RBVEUoc3RhdGVJZCkge1xyXG4gICAgICAgIGNvbnN0IHtbc3RhdGVJZF06IGRlbGV0ZWRTdGF0ZSwgLi4ubmV3U3RhdGV9ID0gc3RhdGUuZGVmaW5pdGlvbi5zdGF0ZVxyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjp7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIHN0YXRlOiBuZXdTdGF0ZSxcclxuICAgICAgICAgICAgbmFtZVNwYWNlOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZSxcclxuICAgICAgICAgICAgICAgICdfcm9vdE5hbWVTcGFjZSc6IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZVsnX3Jvb3ROYW1lU3BhY2UnXSxcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbjogc3RhdGUuZGVmaW5pdGlvbi5uYW1lU3BhY2VbJ19yb290TmFtZVNwYWNlJ10uY2hpbGRyZW4uZmlsdGVyKChyZWYpPT4gcmVmLmlkICE9PSBzdGF0ZUlkKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfX0pXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYm94SWNvbiA9ICgpID0+IGgoJ2knLCB7YXR0cnM6IHtjbGFzczogJ21hdGVyaWFsLWljb25zJ319LCAnbGF5ZXJzJylcclxuICAgIGNvbnN0IGlmSWNvbiA9ICgpID0+IGgoJ2knLCB7YXR0cnM6IHtjbGFzczogJ21hdGVyaWFsLWljb25zJ30sIHN0eWxlOiB7dHJhbnNmb3JtOiAncm90YXRlKDkwZGVnKSd9fSwgJ2NhbGxfc3BsaXQnKVxyXG4gICAgY29uc3QgbnVtYmVySWNvbiA9ICgpID0+IGgoJ2knLCB7YXR0cnM6IHtjbGFzczogJ21hdGVyaWFsLWljb25zJ319LCAnbG9va3Nfb25lJylcclxuICAgIGNvbnN0IGxpc3RJY29uID0gKCkgPT4gaCgnaScsIHthdHRyczoge2NsYXNzOiAnbWF0ZXJpYWwtaWNvbnMnfX0sICd2aWV3X2xpc3QnKVxyXG4gICAgY29uc3QgaW5wdXRJY29uID0gKCkgPT4gaCgnaScsIHthdHRyczoge2NsYXNzOiAnbWF0ZXJpYWwtaWNvbnMnfX0sICdpbnB1dCcpXHJcbiAgICBjb25zdCB0ZXh0SWNvbiA9ICgpID0+IGgoJ2knLCB7YXR0cnM6IHtjbGFzczogJ21hdGVyaWFsLWljb25zJ319LCAndGV4dF9maWVsZHMnKVxyXG4gICAgY29uc3QgZGVsZXRlSWNvbiA9ICgpID0+IGgoJ2knLCB7YXR0cnM6IHtjbGFzczogJ21hdGVyaWFsLWljb25zJywgJ2RhdGEtdHJhc2hjYW4nOiB0cnVlfX0sICdkZWxldGVfZm9yZXZlcicpXHJcbiAgICBjb25zdCBjbGVhckljb24gPSAoKSA9PiBoKCdpJywge2F0dHJzOiB7Y2xhc3M6ICdtYXRlcmlhbC1pY29ucyd9fSwgJ2NsZWFyJylcclxuICAgIGNvbnN0IGZvbGRlckljb24gPSAoKSA9PiBoKCdpJywge2F0dHJzOiB7Y2xhc3M6ICdtYXRlcmlhbC1pY29ucyd9fSwgJ2ZvbGRlcicpXHJcbiAgICBjb25zdCBzYXZlSWNvbiA9ICgpID0+IGgoJ2knLCB7YXR0cnM6IHtjbGFzczogJ21hdGVyaWFsLWljb25zJ319LCAnY2hlY2snKVxyXG4gICAgY29uc3QgaW1hZ2VJY29uID0gKCkgPT4gaCgnaScsIHthdHRyczoge2NsYXNzOiAnbWF0ZXJpYWwtaWNvbnMnfX0sICdpbWFnZScpXHJcbiAgICBjb25zdCBhcHBJY29uID0gKCkgPT4gaCgnaScsIHthdHRyczoge2NsYXNzOiAnbWF0ZXJpYWwtaWNvbnMnfSwgc3R5bGU6IHsgZm9udFNpemU6ICcxOHB4J319LCAnZGVzY3JpcHRpb24nKVxyXG4gICAgY29uc3QgYXJyb3dJY29uID0gKHJvdGF0ZSkgPT4gaCgnaScsIHthdHRyczoge2NsYXNzOiAnbWF0ZXJpYWwtaWNvbnMnLCAnZGF0YS1jbG9zZWFycm93JzogdHJ1ZX0sIHN0eWxlOiB7dHJhbnNpdGlvbjogJ2FsbCAwLjJzJywgdHJhbnNmb3JtOiByb3RhdGUgPyAncm90YXRlKC05MGRlZyknIDogJ3JvdGF0ZSgwZGVnKScsIGN1cnNvcjogJ3BvaW50ZXInfX0sICdleHBhbmRfbW9yZScpXHJcblxyXG4gICAgZnVuY3Rpb24gcmVuZGVyKCkge1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRSdW5uaW5nU3RhdGUgPSBhcHAuZ2V0Q3VycmVudFN0YXRlKClcclxuICAgICAgICBjb25zdCBkcmFnQ29tcG9uZW50TGVmdCA9IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgIG1vdXNlZG93bjogW1dJRFRIX0RSQUdHRUQsICdlZGl0b3JMZWZ0V2lkdGgnXSxcclxuICAgICAgICAgICAgICAgIHRvdWNoc3RhcnQ6IFtXSURUSF9EUkFHR0VELCAnZWRpdG9yTGVmdFdpZHRoJ10sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgICAgIHJpZ2h0OiAnMCcsXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGVYKDEwMCUpJyxcclxuICAgICAgICAgICAgICAgIHRvcDogJzAnLFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6ICcxMHB4JyxcclxuICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMWVtJyxcclxuICAgICAgICAgICAgICAgIG9wYWNpdHk6ICcwJyxcclxuICAgICAgICAgICAgICAgIGN1cnNvcjogJ2NvbC1yZXNpemUnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgY29uc3Qgb3BlbkNvbXBvbmVudExlZnQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICBtb3VzZWRvd246IFtPUEVOX1NJREVCQVIsICdsZWZ0J10sXHJcbiAgICAgICAgICAgICAgICB0b3VjaHN0YXJ0OiBbT1BFTl9TSURFQkFSLCAnbGVmdCddLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICByaWdodDogJy0zcHgnLFxyXG4gICAgICAgICAgICAgICAgdG9wOiAnNTAlJyxcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVooMCkgdHJhbnNsYXRlWCgxMDAlKSB0cmFuc2xhdGVZKC01MCUpJyxcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAnMTVweCcsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMCUnLFxyXG4gICAgICAgICAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMWVtJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzAgNXB4IDVweCAwJyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNWQ1ZDVkJyxcclxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJ2luc2V0IDAgMCAycHggN3B4ICMyMjInLFxyXG4gICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSlcclxuICAgICAgICBjb25zdCBvcGVuQ29tcG9uZW50UmlnaHQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICBtb3VzZWRvd246IFtPUEVOX1NJREVCQVIsICdyaWdodCddLFxyXG4gICAgICAgICAgICAgICAgdG91Y2hzdGFydDogW09QRU5fU0lERUJBUiwgJ3JpZ2h0J10sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgICAgIGxlZnQ6ICctM3B4JyxcclxuICAgICAgICAgICAgICAgIHRvcDogJzUwJScsXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGVaKDApIHRyYW5zbGF0ZVgoLTEwMCUpIHRyYW5zbGF0ZVkoLTUwJSknLFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6ICcxNXB4JyxcclxuICAgICAgICAgICAgICAgIGhlaWdodDogJzEwJScsXHJcbiAgICAgICAgICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgZm9udFNpemU6ICcxZW0nLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNXB4IDAgMCA1cHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM1ZDVkNWQnLFxyXG4gICAgICAgICAgICAgICAgYm94U2hhZG93OiAnaW5zZXQgMCAwIDJweCA3cHggIzIyMicsXHJcbiAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KVxyXG4gICAgICAgIGNvbnN0IGRyYWdDb21wb25lbnRSaWdodCA9IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgIG1vdXNlZG93bjogW1dJRFRIX0RSQUdHRUQsICdlZGl0b3JSaWdodFdpZHRoJ10sXHJcbiAgICAgICAgICAgICAgICB0b3VjaHN0YXJ0OiBbV0lEVEhfRFJBR0dFRCwgJ2VkaXRvclJpZ2h0V2lkdGgnXSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICAgICAgbGVmdDogJzAnLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlWCgtMTAwJSknLFxyXG4gICAgICAgICAgICAgICAgdG9wOiAnMCcsXHJcbiAgICAgICAgICAgICAgICB3aWR0aDogJzEwcHgnLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXHJcbiAgICAgICAgICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgZm9udFNpemU6ICcxZW0nLFxyXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogJzAnLFxyXG4gICAgICAgICAgICAgICAgY3Vyc29yOiAnY29sLXJlc2l6ZScsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSlcclxuICAgICAgICBjb25zdCBkcmFnU3ViQ29tcG9uZW50UmlnaHQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICBtb3VzZWRvd246IFtXSURUSF9EUkFHR0VELCAnc3ViRWRpdG9yV2lkdGgnXSxcclxuICAgICAgICAgICAgICAgIHRvdWNoc3RhcnQ6IFtXSURUSF9EUkFHR0VELCAnc3ViRWRpdG9yV2lkdGgnXSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICAgICAgcmlnaHQ6ICcycHgnLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlWCgxMDAlKScsXHJcbiAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAnMTBweCcsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogJzFlbScsXHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICAgICAgY3Vyc29yOiAnY29sLXJlc2l6ZScsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSlcclxuICAgICAgICBjb25zdCBkcmFnU3ViQ29tcG9uZW50TGVmdCA9IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgIG1vdXNlZG93bjogW1dJRFRIX0RSQUdHRUQsICdzdWJFZGl0b3JXaWR0aExlZnQnXSxcclxuICAgICAgICAgICAgICAgIHRvdWNoc3RhcnQ6IFtXSURUSF9EUkFHR0VELCAnc3ViRWRpdG9yV2lkdGhMZWZ0J10sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgICAgIGxlZnQ6ICcycHgnLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlWCgtMTAwJSknLFxyXG4gICAgICAgICAgICAgICAgdG9wOiAnMCcsXHJcbiAgICAgICAgICAgICAgICB3aWR0aDogJzEwcHgnLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXHJcbiAgICAgICAgICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgZm9udFNpemU6ICcxZW0nLFxyXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgICAgIGN1cnNvcjogJ2NvbC1yZXNpemUnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGVtYmVyRWRpdG9yKHJlZiwgdHlwZSl7XHJcbiAgICAgICAgICAgIGNvbnN0IHBpcGUgPSBzdGF0ZS5kZWZpbml0aW9uW3JlZi5yZWZdW3JlZi5pZF1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGxpc3RUcmFuc2Zvcm1hdGlvbnModHJhbnNmb3JtYXRpb25zLCB0cmFuc1R5cGUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1hdGlvbnMubWFwKCh0cmFuc1JlZiwgaW5kZXgpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdHJhbnNmb3JtZXIgPSBzdGF0ZS5kZWZpbml0aW9uW3RyYW5zUmVmLnJlZl1bdHJhbnNSZWYuaWRdXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zUmVmLnJlZiA9PT0gJ2VxdWFsJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge30sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtrZXk6IGluZGV4LCBzdHlsZToge2NvbG9yOiAnI2JkYmRiZCcsIGN1cnNvcjogJ2RlZmF1bHQnLCBkaXNwbGF5OidmbGV4J319LCBbaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJ319LCB0cmFuc1JlZi5yZWYpLCBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAnLCBjb2xvcjogdHJhbnNmb3JtYXRpb25zLmxlbmd0aC0xICE9PSBpbmRleCA/ICcjYmRiZGJkJzogdHJhbnNUeXBlID09PSB0eXBlID8gJ2dyZWVuJzogJ3JlZCd9fSwgJ3RydWUvZmFsc2UnKV0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ0xlZnQ6ICcxNXB4J319LCBbZW1iZXJFZGl0b3IodHJhbnNmb3JtZXIudmFsdWUsIHR5cGUpXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zUmVmLnJlZiA9PT0gJ2FkZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHt9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7a2V5OiBpbmRleCwgc3R5bGU6IHtjb2xvcjogJyNiZGJkYmQnLCBjdXJzb3I6ICdkZWZhdWx0JywgZGlzcGxheTonZmxleCd9fSwgW2goJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMSd9fSwgdHJhbnNSZWYucmVmKSwgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwJywgY29sb3I6IHRyYW5zZm9ybWF0aW9ucy5sZW5ndGgtMSAhPT0gaW5kZXggPyAnI2JkYmRiZCc6IHRyYW5zVHlwZSA9PT0gdHlwZSA/ICdncmVlbic6ICdyZWQnfX0sICdudW1iZXInKV0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ0xlZnQ6ICcxNXB4J319LCBbZW1iZXJFZGl0b3IodHJhbnNmb3JtZXIudmFsdWUsICdudW1iZXInKV0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc1JlZi5yZWYgPT09ICdzdWJ0cmFjdCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHt9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7a2V5OiBpbmRleCwgc3R5bGU6IHtjb2xvcjogJyNiZGJkYmQnLCBjdXJzb3I6ICdkZWZhdWx0JywgZGlzcGxheTonZmxleCd9fSwgW2goJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMSd9fSwgdHJhbnNSZWYucmVmKSwgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwJywgY29sb3I6IHRyYW5zZm9ybWF0aW9ucy5sZW5ndGgtMSAhPT0gaW5kZXggPyAnI2JkYmRiZCc6IHRyYW5zVHlwZSA9PT0gdHlwZSA/ICdncmVlbic6ICdyZWQnfX0sICdudW1iZXInKV0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ0xlZnQ6ICcxNXB4J319LCBbZW1iZXJFZGl0b3IodHJhbnNmb3JtZXIudmFsdWUsICdudW1iZXInKV0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc1JlZi5yZWYgPT09ICdtdWx0aXBseScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHt9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7a2V5OiBpbmRleCwgc3R5bGU6IHtjb2xvcjogJyNiZGJkYmQnLCBjdXJzb3I6ICdkZWZhdWx0JywgZGlzcGxheTonZmxleCd9fSwgW2goJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMSd9fSwgdHJhbnNSZWYucmVmKSwgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwJywgY29sb3I6IHRyYW5zZm9ybWF0aW9ucy5sZW5ndGgtMSAhPT0gaW5kZXggPyAnI2JkYmRiZCc6IHRyYW5zVHlwZSA9PT0gdHlwZSA/ICdncmVlbic6ICdyZWQnfX0sICdudW1iZXInKV0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ0xlZnQ6ICcxNXB4J319LCBbZW1iZXJFZGl0b3IodHJhbnNmb3JtZXIudmFsdWUsICdudW1iZXInKV0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc1JlZi5yZWYgPT09ICdkaXZpZGUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge2tleTogaW5kZXgsIHN0eWxlOiB7Y29sb3I6ICcjYmRiZGJkJywgY3Vyc29yOiAnZGVmYXVsdCcsIGRpc3BsYXk6J2ZsZXgnfX0sIFtoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnfX0sIHRyYW5zUmVmLnJlZiksIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCcsIGNvbG9yOiB0cmFuc2Zvcm1hdGlvbnMubGVuZ3RoLTEgIT09IGluZGV4ID8gJyNiZGJkYmQnOiB0cmFuc1R5cGUgPT09IHR5cGUgPyAnZ3JlZW4nOiAncmVkJ319LCAnbnVtYmVyJyldKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmdMZWZ0OiAnMTVweCd9fSwgW2VtYmVyRWRpdG9yKHRyYW5zZm9ybWVyLnZhbHVlLCAnbnVtYmVyJyldKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNSZWYucmVmID09PSAncmVtYWluZGVyJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge30sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtrZXk6IGluZGV4LCBzdHlsZToge2NvbG9yOiAnI2JkYmRiZCcsIGN1cnNvcjogJ2RlZmF1bHQnLCBkaXNwbGF5OidmbGV4J319LCBbaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJ319LCB0cmFuc1JlZi5yZWYpLCBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAnLCBjb2xvcjogdHJhbnNmb3JtYXRpb25zLmxlbmd0aC0xICE9PSBpbmRleCA/ICcjYmRiZGJkJzogdHJhbnNUeXBlID09PSB0eXBlID8gJ2dyZWVuJzogJ3JlZCd9fSwgJ251bWJlcicpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nTGVmdDogJzE1cHgnfX0sIFtlbWJlckVkaXRvcih0cmFuc2Zvcm1lci52YWx1ZSwgJ251bWJlcicpXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgKHRyYW5zUmVmLnJlZiA9PT0gJ2JyYW5jaCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgaWYocmVzb2x2ZSh0cmFuc2Zvcm1lci5wcmVkaWNhdGUpKXtcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIHZhbHVlID0gdHJhbnNmb3JtVmFsdWUodmFsdWUsIHRyYW5zZm9ybWVyLnRoZW4pXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICB2YWx1ZSA9IHRyYW5zZm9ybVZhbHVlKHZhbHVlLCB0cmFuc2Zvcm1lci5lbHNlKVxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc1JlZi5yZWYgPT09ICdqb2luJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnc3BhbicsIHt9LCBbZW1iZXJFZGl0b3IodHJhbnNmb3JtZXIudmFsdWUsIHRyYW5zVHlwZSldKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNSZWYucmVmID09PSAndG9VcHBlckNhc2UnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7Y3Vyc29yOiAnZGVmYXVsdCcsIGRpc3BsYXk6J2ZsZXgnfX0sIFtoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnLCBjb2xvcjogJyNiZGJkYmQnfX0sIHRyYW5zUmVmLnJlZildKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zUmVmLnJlZiA9PT0gJ3RvTG93ZXJDYXNlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge30sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2N1cnNvcjogJ2RlZmF1bHQnLCBkaXNwbGF5OidmbGV4J319LCBbaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJywgY29sb3I6ICcjYmRiZGJkJ319LCB0cmFuc1JlZi5yZWYpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc1JlZi5yZWYgPT09ICd0b1RleHQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7Y3Vyc29yOiAnZGVmYXVsdCcsIGRpc3BsYXk6J2ZsZXgnfX0sIFtoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnLCBjb2xvcjogJyNiZGJkYmQnfX0sIHRyYW5zUmVmLnJlZildKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBnZW5UcmFuc2Zvcm1hdG9ycygpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkUGlwZSA9IHN0YXRlLmRlZmluaXRpb24ucGlwZVtzdGF0ZS5zZWxlY3RlZFBpcGVJZF1cclxuICAgICAgICAgICAgICAgIHJldHVybiBbaCgnZGl2Jywge3N0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdmaXhlZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9wOiBzdGF0ZS5jb21wb25lbnRFZGl0b3JQb3NpdGlvbi55ICsgJ3B4JyxcclxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiBzdGF0ZS5jb21wb25lbnRFZGl0b3JQb3NpdGlvbi54IC0gMzA3ICsgJ3B4JyxcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICc1MCUnLFxyXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMzAwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgIH19LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jyx7c3R5bGU6IHtib3JkZXI6ICczcHggc29saWQgIzIyMicsIGZsZXg6ICcxIDEgMCUnLCBiYWNrZ3JvdW5kOiAnIzRkNGQ0ZCcsIG1hcmdpbkJvdHRvbTogJzEwcHgnfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdkZWZhdWx0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyMyMjInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ1RvcDogJzJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nQm90dG9tOiAnNXB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzUzQjJFRCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW5XaWR0aDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LH0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnNSA1IGF1dG8nLCBtYXJnaW46ICcwIDVweCcsIG1pbldpZHRoOiAnMCcsIG92ZXJmbG93OiAnaGlkZGVuJywgd2hpdGVTcGFjZTogJ25vd3JhcCcsIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJywgZm9udFNpemU6ICcwLjhlbSd9fSwgJ1VnbmlzIFRvb2xib3gnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCAwIGF1dG8nLCBtYXJnaW5MZWZ0OiAnYXV0bycsIGN1cnNvcjogJ3BvaW50ZXInLCBtYXJnaW5SaWdodDogJzVweCcsIGNvbG9yOiAnd2hpdGUnLCBkaXNwbGF5OiAnaW5saW5lLWZsZXgnfSwgb246IHttb3VzZWRvd246IFtTRUxFQ1RfUElQRSwgJyddLCB0b3VjaHN0YXJ0OiBbU0VMRUNUX1BJUEUsICcnXX19LCBbY2xlYXJJY29uKCldKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgXSldXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBwaXBlLnZhbHVlID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtzdHlsZToge3Bvc2l0aW9uOiAncmVsYXRpdmUnfX0sIFtoKCdkaXYnLCB7c3R5bGU6e2Rpc3BsYXk6J2ZsZXgnLCBhbGlnbkl0ZW1zOiAnYmFzZWxpbmUnfSwgb246IHtjbGljazogW1NFTEVDVF9QSVBFLCByZWYuaWRdfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAgMCBhdXRvJywgcG9zaXRpb246ICdyZWxhdGl2ZScsIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVooMCknfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge29wYWNpdHk6ICcwJywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsIHdoaXRlU3BhY2U6ICdwcmUnLCBwYWRkaW5nOiAnMCA1cHggMnB4IDVweCcsIGJvcmRlckJvdHRvbTogJzJweCBzb2xpZCB3aGl0ZSd9fSwgcGlwZS52YWx1ZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2lucHV0Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAndGV4dCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTogJzJweCBzb2xpZCB3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnQ6ICdpbmhlcml0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbGV4OiAnMCAwIGF1dG8nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IFtDSEFOR0VfU1RBVElDX1ZBTFVFLCByZWYsICd2YWx1ZScsICd0ZXh0J10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW91c2Vtb3ZlOiBbUElQRV9IT1ZFUkVELCByZWZdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpdmVQcm9wczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBwaXBlLnZhbHVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgLi4ubGlzdFRyYW5zZm9ybWF0aW9ucyhwaXBlLnRyYW5zZm9ybWF0aW9ucywgcGlwZS50eXBlKSxcclxuICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHN0YXRlLnNlbGVjdGVkUGlwZUlkID09PSByZWYuaWQgPyBnZW5UcmFuc2Zvcm1hdG9ycygpOiBbXSlcclxuICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChwaXBlLnZhbHVlID09PSB0cnVlIHx8IHBpcGUudmFsdWUgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaCgnc2VsZWN0Jywge2xpdmVQcm9wczoge3ZhbHVlOiAgcGlwZS52YWx1ZS50b1N0cmluZygpfSwgc3R5bGU6IHt9LCAgb246IHtpbnB1dDogIFtDSEFOR0VfU1RBVElDX1ZBTFVFLCByZWYsICd2YWx1ZScsICdib29sZWFuJ119fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIGgoJ29wdGlvbicsIHthdHRyczoge3ZhbHVlOiAndHJ1ZSd9LCBzdHlsZToge2NvbG9yOiAnYmxhY2snfX0sIFsndHJ1ZSddKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdvcHRpb24nLCB7YXR0cnM6IHt2YWx1ZTogJ2ZhbHNlJ30sIHN0eWxlOiB7Y29sb3I6ICdibGFjayd9fSwgWydmYWxzZSddKSxcclxuICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghaXNOYU4ocGFyc2VGbG9hdChOdW1iZXIocGlwZS52YWx1ZSkpKSAmJiBpc0Zpbml0ZShOdW1iZXIocGlwZS52YWx1ZSkpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge3N0eWxlOiB7cG9zaXRpb246ICdyZWxhdGl2ZSd9fSwgW2goJ2RpdicsIHtzdHlsZTp7ZGlzcGxheTonZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInfSwgb246IHtjbGljazogW1NFTEVDVF9QSVBFLCByZWYuaWRdfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICBoKCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzOiB7dHlwZTonbnVtYmVyJ30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbjogICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHREZWNvcmF0aW9uOiAndW5kZXJsaW5lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBbQ0hBTkdFX1NUQVRJQ19WQUxVRSwgcmVmLCAndmFsdWUnLCAnbnVtYmVyJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGl2ZVByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IE51bWJlcihwaXBlLnZhbHVlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcwJywgY3Vyc29yOiAnZGVmYXVsdCcsIGNvbG9yOiBwaXBlLnRyYW5zZm9ybWF0aW9ucy5sZW5ndGggPiAwID8gJyNiZGJkYmQnOiB0eXBlID09PSAnbnVtYmVyJyA/ICdncmVlbic6ICdyZWQnfX0sICdudW1iZXInKVxyXG4gICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ0xlZnQ6ICcxNXB4J319LCBsaXN0VHJhbnNmb3JtYXRpb25zKHBpcGUudHJhbnNmb3JtYXRpb25zLCBwaXBlLnR5cGUpKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCBzdGF0ZS5zZWxlY3RlZFBpcGVJZCA9PT0gcmVmLmlkID8gZ2VuVHJhbnNmb3JtYXRvcnMoKTogW10pXHJcbiAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZihwaXBlLnZhbHVlLnJlZiA9PT0gJ3N0YXRlJyl7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkaXNwbFN0YXRlID0gc3RhdGUuZGVmaW5pdGlvbltwaXBlLnZhbHVlLnJlZl1bcGlwZS52YWx1ZS5pZF1cclxuICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7c3R5bGU6IHtwb3NpdGlvbjogJ3JlbGF0aXZlJywgY3Vyc29yOiAncG9pbnRlcid9fSwgW2goJ2RpdicsIHtzdHlsZTp7ZGlzcGxheTonZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInfSwgb246IHtjbGljazogW1NFTEVDVF9QSVBFLCByZWYuaWRdfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtmbGV4OiAnMSd9fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwIDAgYXV0bycsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCBwb3NpdGlvbjogJ3JlbGF0aXZlJywgdHJhbnNmb3JtOiAndHJhbnNsYXRlWigwKScsIGJveFNoYWRvdzogJ2luc2V0IDAgMCAwIDJweCAnICsgKHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHBpcGUudmFsdWUuaWQ/ICcjZWFiNjVjJzogJyM4MjgyODInKSAsIGJhY2tncm91bmQ6ICcjNDQ0JywgcGFkZGluZzogJzRweCA3cHgnLH19LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2NvbG9yOiAnd2hpdGUnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJ30sIG9uOiB7Y2xpY2s6IFtTVEFURV9OT0RFX1NFTEVDVEVELCBwaXBlLnZhbHVlLmlkXX19LCBkaXNwbFN0YXRlLnRpdGxlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmdMZWZ0OiAnMTVweCd9fSwgbGlzdFRyYW5zZm9ybWF0aW9ucyhwaXBlLnRyYW5zZm9ybWF0aW9ucywgcGlwZS50eXBlKSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywgc3RhdGUuc2VsZWN0ZWRQaXBlSWQgPT09IHJlZi5pZCA/IGdlblRyYW5zZm9ybWF0b3JzKCk6IFtdKVxyXG4gICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihwaXBlLnZhbHVlLnJlZiA9PT0gJ2xpc3RWYWx1ZScpe1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsICdUT0RPJylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihwaXBlLnZhbHVlLnJlZiA9PT0gJ2V2ZW50RGF0YScpe1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnREYXRhID0gc3RhdGUuZGVmaW5pdGlvbltwaXBlLnZhbHVlLnJlZl1bcGlwZS52YWx1ZS5pZF1cclxuICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCBbaCgnZGl2Jywge3N0eWxlOntkaXNwbGF5OidmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcid9LCBvbjoge2NsaWNrOiBbU0VMRUNUX1BJUEUsIHJlZi5pZF19fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcxJ319LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBbaCgnZGl2Jyx7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcicsIGNvbG9yOiBzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBwaXBlLnZhbHVlLmlkID8gJyNlYWI2NWMnOiAnd2hpdGUnLCBwYWRkaW5nOiAnMnB4IDVweCcsIG1hcmdpbjogJzNweCAzcHggMCAwJywgYm9yZGVyOiAnMnB4IHNvbGlkICcgKyAoc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gcGlwZS52YWx1ZS5pZCA/ICcjZWFiNjVjJzogJ3doaXRlJyksIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbjoge2NsaWNrOiBbU1RBVEVfTk9ERV9TRUxFQ1RFRCwgcGlwZS52YWx1ZS5pZF19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW2V2ZW50RGF0YS50aXRsZV0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcwJywgY3Vyc29yOiAnZGVmYXVsdCcsIGNvbG9yOiBwaXBlLnRyYW5zZm9ybWF0aW9ucy5sZW5ndGggPiAwID8gJyNiZGJkYmQnOiBldmVudERhdGEudHlwZSA9PT0gdHlwZSA/ICdncmVlbic6ICdyZWQnfX0sIGV2ZW50RGF0YS50eXBlKVxyXG4gICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ0xlZnQ6ICcxNXB4J319LCBsaXN0VHJhbnNmb3JtYXRpb25zKHBpcGUudHJhbnNmb3JtYXRpb25zLCBwaXBlLnR5cGUpKSxcclxuICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxpc3RTdGF0ZShzdGF0ZUlkKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRTdGF0ZSA9IHN0YXRlLmRlZmluaXRpb24uc3RhdGVbc3RhdGVJZF1cclxuICAgICAgICAgICAgZnVuY3Rpb24gZWRpdGluZ05vZGUoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaCgnaW5wdXQnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzRweCA3cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnQ6ICdpbmhlcml0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsZXg6ICcwIDAgYXV0bycsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogW0NIQU5HRV9TVEFURV9OT0RFX1RJVExFLCBzdGF0ZUlkXSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGxpdmVQcm9wczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogY3VycmVudFN0YXRlLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGEtaXN0aXRsZWVkaXRvcic6IHRydWVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzE0cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtkaXNwbGF5OiAnZmxleCcsIGZsZXhXcmFwOiAnd3JhcCcsIG1hcmdpblRvcDogJzZweCd9fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAgMCBhdXRvJywgIHBvc2l0aW9uOiAncmVsYXRpdmUnLCB0cmFuc2Zvcm06ICd0cmFuc2xhdGVaKDApJywgbWFyZ2luOiAnMCA3cHggMCAwJywgIGJveFNoYWRvdzogJ2luc2V0IDAgMCAwIDJweCAnICsgKHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHN0YXRlSWQgPyAnI2VhYjY1Yyc6ICcjODI4MjgyJykgLCBiYWNrZ3JvdW5kOiAnIzQ0NCcsIHBhZGRpbmc6ICc0cHggN3B4Jyx9fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge29wYWNpdHk6IHN0YXRlLmVkaXRpbmdUaXRsZU5vZGVJZCA9PT0gc3RhdGVJZCA/ICcwJzogJzEnLCBjb2xvcjogJ3doaXRlJywgZGlzcGxheTogJ2lubGluZS1ibG9jayd9LCBvbjoge21vdXNlZG93bjogW1NUQVRFX0RSQUdHRUQsIHN0YXRlSWRdLCB0b3VjaHN0YXJ0OiBbU1RBVEVfRFJBR0dFRCwgc3RhdGVJZF0sIHRvdWNobW92ZTogW0hPVkVSX01PQklMRV0sIGRibGNsaWNrOiBbRURJVF9WSUVXX05PREVfVElUTEUsIHN0YXRlSWRdfX0sIGN1cnJlbnRTdGF0ZS50aXRsZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQgPT09IHN0YXRlSWQgPyBlZGl0aW5nTm9kZSgpOiBoKCdzcGFuJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoKCk9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBub1N0eWxlSW5wdXQgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IGN1cnJlbnRSdW5uaW5nU3RhdGVbc3RhdGVJZF0gIT09IHN0YXRlLmRlZmluaXRpb24uc3RhdGVbc3RhdGVJZF0uZGVmYXVsdFZhbHVlID8gJ3JnYig5MSwgMjA0LCA5MSknIDogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZTogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZsZXg6ICcxJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW5XaWR0aDogJzUwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJ2luc2V0IDAgLTJweCAwIDAgJyArIChzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBzdGF0ZUlkID8gJyNlYWI2NWMnOiAnIzgyODI4MicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihjdXJyZW50U3RhdGUudHlwZSA9PT0gJ3RleHQnKSByZXR1cm4gaCgnaW5wdXQnLCB7YXR0cnM6IHt0eXBlOiAndGV4dCd9LCBsaXZlUHJvcHM6IHt2YWx1ZTogY3VycmVudFJ1bm5pbmdTdGF0ZVtzdGF0ZUlkXX0sIHN0eWxlOiBub1N0eWxlSW5wdXQsIG9uOiB7aW5wdXQ6IFtDSEFOR0VfQ1VSUkVOVF9TVEFURV9URVhUX1ZBTFVFLCBzdGF0ZUlkXX19KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoY3VycmVudFN0YXRlLnR5cGUgPT09ICdudW1iZXInKSByZXR1cm4gaCgnaW5wdXQnLCB7YXR0cnM6IHt0eXBlOiAnbnVtYmVyJ30sIGxpdmVQcm9wczoge3ZhbHVlOiBjdXJyZW50UnVubmluZ1N0YXRlW3N0YXRlSWRdfSwgc3R5bGU6IG5vU3R5bGVJbnB1dCwgIG9uOiB7aW5wdXQ6IFtDSEFOR0VfQ1VSUkVOVF9TVEFURV9OVU1CRVJfVkFMVUUsIHN0YXRlSWRdfX0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihjdXJyZW50U3RhdGUudHlwZSA9PT0gJ2Jvb2xlYW4nKSByZXR1cm4gaCgnc2VsZWN0Jywge2xpdmVQcm9wczoge3ZhbHVlOiBjdXJyZW50UnVubmluZ1N0YXRlW3N0YXRlSWRdLnRvU3RyaW5nKCl9LCBzdHlsZTogbm9TdHlsZUlucHV0LCAgb246IHtpbnB1dDogW0NIQU5HRV9DVVJSRU5UX1NUQVRFX1RFWFRfVkFMVUUsIHN0YXRlSWRdfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdvcHRpb24nLCB7YXR0cnM6IHt2YWx1ZTogJ3RydWUnfSwgc3R5bGU6IHtjb2xvcjogJ2JsYWNrJ319LCBbJ3RydWUnXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnb3B0aW9uJywge2F0dHJzOiB7dmFsdWU6ICdmYWxzZSd9LCBzdHlsZToge2NvbG9yOiAnYmxhY2snfX0sIFsnZmFsc2UnXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYoY3VycmVudFN0YXRlLnR5cGUgPT09ICd0YWJsZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkICE9PSBzdGF0ZUlkKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtrZXk6ICdpY29uJyxvbjoge2NsaWNrOiBbU1RBVEVfTk9ERV9TRUxFQ1RFRCwgc3RhdGVJZF19LCBzdHlsZToge2Rpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIG1hcmdpblRvcDogJzdweCd9fSwgW2xpc3RJY29uKCldKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0YWJsZSA9IGN1cnJlbnRSdW5uaW5nU3RhdGVbc3RhdGVJZF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogJ3RhYmxlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM4MjgxODMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmxleDogJzAgMCAxMDAlJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2Rpc3BsYXk6ICdmbGV4J319LCAgT2JqZWN0LmtleXMoY3VycmVudFN0YXRlLmRlZmluaXRpb24pLm1hcChrZXkgPT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzEnLCBwYWRkaW5nOiAnMnB4IDVweCcsIGJvcmRlckJvdHRvbTogJzJweCBzb2xpZCB3aGl0ZSd9fSwga2V5KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuLi5PYmplY3Qua2V5cyh0YWJsZSkubWFwKGlkID0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZGlzcGxheTogJ2ZsZXgnfX0sIE9iamVjdC5rZXlzKHRhYmxlW2lkXSkubWFwKGtleSA9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtmbGV4OiAnMScsIHBhZGRpbmc6ICcycHggNXB4J319LCB0YWJsZVtpZF1ba2V5XSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RhdGUudHlwZSAhPT0gJ3RhYmxlJyAmJiBjdXJyZW50UnVubmluZ1N0YXRlW3N0YXRlSWRdICE9PSBzdGF0ZS5kZWZpbml0aW9uLnN0YXRlW3N0YXRlSWRdLmRlZmF1bHRWYWx1ZSA/IGgoJ2RpdicsIHtzdHlsZToge2Rpc3BsYXk6ICdpbmxpbmUtZmxleCcsIGFsaWduU2VsZjogJ2NlbnRlcid9LCBvbjoge2NsaWNrOiBbU0FWRV9ERUZBVUxULCBzdGF0ZUlkXX19LCBbc2F2ZUljb24oKV0pOiBoKCdzcGFuJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHN0YXRlSWQgJiYgY3VycmVudFN0YXRlLnR5cGUgIT09ICd0YWJsZScgPyBoKCdkaXYnLCB7c3R5bGU6IHtkaXNwbGF5OiAnaW5saW5lLWZsZXgnLCBhbGlnblNlbGY6ICdjZW50ZXInfSwgb246IHtjbGljazogW0RFTEVURV9TVEFURSwgc3RhdGVJZF19fSwgW2RlbGV0ZUljb24oKV0pOiBoKCdzcGFuJylcclxuICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBzdGF0ZUlkID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50U3RhdGUubXV0YXRvcnMubWFwKG11dGF0b3JSZWYgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtdXRhdG9yID0gc3RhdGUuZGVmaW5pdGlvblttdXRhdG9yUmVmLnJlZl1bbXV0YXRvclJlZi5pZF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBzdGF0ZS5kZWZpbml0aW9uW211dGF0b3IuZXZlbnQucmVmXVttdXRhdG9yLmV2ZW50LmlkXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBlbWl0dGVyID0gc3RhdGUuZGVmaW5pdGlvbltldmVudC5lbWl0dGVyLnJlZl1bZXZlbnQuZW1pdHRlci5pZF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNDQ0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdUb3A6ICczcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0JvdHRvbTogJzNweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gZXZlbnQuZW1pdHRlci5pZCA/ICcjNTNCMkVEJzogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICcwLjJzIGFsbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW5XaWR0aDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBvbjoge2NsaWNrOiBbVklFV19OT0RFX1NFTEVDVEVELCBldmVudC5lbWl0dGVyXX19LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAgMCBhdXRvJywgbWFyZ2luOiAnMCAzcHggMCA1cHgnLCBkaXNwbGF5OiAnaW5saW5lLWZsZXgnfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudC5lbWl0dGVyLnJlZiA9PT0gJ3ZOb2RlQm94JyA/IGJveEljb24oKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LmVtaXR0ZXIucmVmID09PSAndk5vZGVMaXN0JyA/IGxpc3RJY29uKCkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuZW1pdHRlci5yZWYgPT09ICd2Tm9kZUxpc3QnID8gaWZJY29uKCkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LmVtaXR0ZXIucmVmID09PSAndk5vZGVJbnB1dCcgPyBpbnB1dEljb24oKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRJY29uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnNSA1IGF1dG8nLCBtYXJnaW46ICcwIDVweCAwIDAnLCBtaW5XaWR0aDogJzAnLCBvdmVyZmxvdzogJ2hpZGRlbicsIHdoaXRlU3BhY2U6ICdub3dyYXAnLCB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcyd9fSwgZW1pdHRlci50aXRsZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAgMCBhdXRvJywgbWFyZ2luTGVmdDogJ2F1dG8nLCBtYXJnaW5SaWdodDogJzVweCcsIGNvbG9yOiAnIzViY2M1Yid9fSwgZXZlbnQudHlwZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJyksXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGZha2VTdGF0ZShzdGF0ZUlkKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRTdGF0ZSA9IHN0YXRlLmRlZmluaXRpb24uc3RhdGVbc3RhdGVJZF1cclxuICAgICAgICAgICAgcmV0dXJuIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCAwIGF1dG8nLCAgcG9zaXRpb246ICdyZWxhdGl2ZScsIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVooMCknLCBtYXJnaW46ICc3cHggN3B4IDAgMCcsICBib3hTaGFkb3c6ICdpbnNldCAwIDAgMCAycHggJyArIChzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBzdGF0ZUlkID8gJyNlYWI2NWMnOiAnIzgyODI4MicpICwgYmFja2dyb3VuZDogJyM0NDQnLCBwYWRkaW5nOiAnNHB4IDdweCcsfX0sIFtcclxuICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtjb2xvcjogJ3doaXRlJywgZGlzcGxheTogJ2lubGluZS1ibG9jayd9fSwgY3VycmVudFN0YXRlLnRpdGxlKSxcclxuICAgICAgICAgICAgXSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHN0YXRlQ29tcG9uZW50ID0gaCgnZGl2JywgeyBhdHRyczoge2NsYXNzOiAnYmV0dGVyLXNjcm9sbGJhcid9LCBzdHlsZToge292ZXJmbG93OiAnYXV0bycsIGZsZXg6ICcxJywgcGFkZGluZzogJzAgMTBweCd9LCBvbjoge2NsaWNrOiBbVU5TRUxFQ1RfU1RBVEVfTk9ERV19fSwgc3RhdGUuZGVmaW5pdGlvbi5uYW1lU3BhY2VbJ19yb290TmFtZVNwYWNlJ10uY2hpbGRyZW4ubWFwKChyZWYpPT4gbGlzdFN0YXRlKHJlZi5pZCkpKVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBsaXN0Tm9kZShub2RlUmVmLCBwYXJlbnRSZWYsIGRlcHRoKXtcclxuICAgICAgICAgICAgaWYobm9kZVJlZi5pZCA9PT0gJ19yb290Tm9kZScpIHJldHVybiBsaXN0Um9vdE5vZGUobm9kZVJlZilcclxuICAgICAgICAgICAgaWYobm9kZVJlZi5yZWYgPT09ICd2Tm9kZVRleHQnKSByZXR1cm4gc2ltcGxlTm9kZShub2RlUmVmLCBwYXJlbnRSZWYsIGRlcHRoKVxyXG4gICAgICAgICAgICBpZihub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlSW1hZ2UnKSByZXR1cm4gc2ltcGxlTm9kZShub2RlUmVmLCBwYXJlbnRSZWYsIGRlcHRoKVxyXG4gICAgICAgICAgICBpZihub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlQm94JyB8fCBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlTGlzdCcgfHwgbm9kZVJlZi5yZWYgPT09ICd2Tm9kZUlmJykgcmV0dXJuIGxpc3RCb3hOb2RlKG5vZGVSZWYsIHBhcmVudFJlZiwgZGVwdGgpXHJcbiAgICAgICAgICAgIGlmKG5vZGVSZWYucmVmID09PSAndk5vZGVJbnB1dCcpIHJldHVybiBzaW1wbGVOb2RlKG5vZGVSZWYsIHBhcmVudFJlZiwgZGVwdGgpXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBwcmV2ZW50X2J1YmJsaW5nKGUpIHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBlZGl0aW5nTm9kZShub2RlUmVmKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMjZweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzUzQjJFRCcsXHJcbiAgICAgICAgICAgICAgICAgICAgb3V0bGluZTogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZsZXg6ICcxJyxcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYm94U2hhZG93OiAnaW5zZXQgMCAtMXB4IDAgMCAjNTNCMkVEJyxcclxuICAgICAgICAgICAgICAgICAgICBmb250OiAnaW5oZXJpdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0xlZnQ6ICcycHgnLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2Vkb3duOiBwcmV2ZW50X2J1YmJsaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgIGlucHV0OiBbQ0hBTkdFX1ZJRVdfTk9ERV9USVRMRSwgbm9kZVJlZl0sXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgbGl2ZVByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVSZWYuaWRdLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGF0dHJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXV0b2ZvY3VzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICdkYXRhLWlzdGl0bGVlZGl0b3InOiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBsaXN0Um9vdE5vZGUobm9kZVJlZikge1xyXG4gICAgICAgICAgICBjb25zdCBub2RlSWQgPSBub2RlUmVmLmlkXHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBzdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlSWRdXHJcbiAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0xlZnQ6ICc4cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nUmlnaHQ6ICc4cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzQ0NCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclRvcDogJzJweCBzb2xpZCAjNGQ0ZDRkJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiAnMnB4IHNvbGlkICMzMzMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcyNnB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpdGVTcGFjZTogJ25vd3JhcCcsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb246IHttb3VzZW1vdmU6IFtWSUVXX0hPVkVSRUQsIG5vZGVSZWYsIHt9LCAxXSwgdG91Y2htb3ZlOiBbSE9WRVJfTU9CSUxFXX1cclxuICAgICAgICAgICAgICAgICAgICB9LCAgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge2tleTogbm9kZUlkLCBzdHlsZToge2NvbG9yOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnIzUzQjJFRCc6ICcjYmRiZGJkJywgZGlzcGxheTogJ2lubGluZS1mbGV4J30sIG9uOiB7Y2xpY2s6IFtWSUVXX05PREVfU0VMRUNURUQsIG5vZGVSZWZdfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcEljb24oKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuZWRpdGluZ1RpdGxlTm9kZUlkID09PSBub2RlSWQgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWRpdGluZ05vZGUobm9kZVJlZik6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywgeyBzdHlsZToge2ZsZXg6ICcxJywgY3Vyc29yOiAncG9pbnRlcicsIGNvbG9yOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnIzUzQjJFRCc6ICd3aGl0ZScsIHRyYW5zaXRpb246ICdjb2xvciAwLjJzJywgcGFkZGluZ0xlZnQ6ICcycHgnfSwgb246IHtjbGljazogW1ZJRVdfTk9ERV9TRUxFQ1RFRCwgbm9kZVJlZl0sIGRibGNsaWNrOiBbRURJVF9WSUVXX05PREVfVElUTEUsIG5vZGVJZF19fSwgbm9kZS50aXRsZSksXHJcbiAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywgc3RhdGUuaG92ZXJlZFZpZXdOb2RlICYmIHN0YXRlLmhvdmVyZWRWaWV3Tm9kZS5wYXJlbnQuaWQgPT09IG5vZGVJZCAmJiAhKG5vZGUuY2hpbGRyZW4uZmluZEluZGV4KChyZWYpPT4gcmVmLmlkID09PSBzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50Vmlldy5pZCkgPT09IHN0YXRlLmhvdmVyZWRWaWV3Tm9kZS5wb3NpdGlvbikgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAoKCk9PntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGNvcHkgcGFzdGVkIGZyb20gbGlzdEJveE5vZGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9sZFBvc2l0aW9uID0gbm9kZS5jaGlsZHJlbi5maW5kSW5kZXgoKHJlZik9PiByZWYuaWQgPT09IHN0YXRlLmRyYWdnZWRDb21wb25lbnRWaWV3LmlkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmV3UG9zaXRpb24gPSBvbGRQb3NpdGlvbiA9PT0gLTEgfHwgc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBvc2l0aW9uIDwgb2xkUG9zaXRpb24gPyBzdGF0ZS5ob3ZlcmVkVmlld05vZGUucG9zaXRpb24gOiBzdGF0ZS5ob3ZlcmVkVmlld05vZGUucG9zaXRpb24gKyAxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW4ubWFwKChyZWYpPT5saXN0Tm9kZShyZWYsIG5vZGVSZWYsIDEpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkcmVuLnNsaWNlKDAsIG5ld1Bvc2l0aW9uKS5jb25jYXQoc3BhY2VyQ29tcG9uZW50KCksIGNoaWxkcmVuLnNsaWNlKG5ld1Bvc2l0aW9uKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSkoKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5jaGlsZHJlbi5tYXAoKHJlZik9Pmxpc3ROb2RlKHJlZiwgbm9kZVJlZiwgMSkpXHJcbiAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ0xlZnQ6ICc4cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nUmlnaHQ6ICc4cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxNXB4JyxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbjoge21vdXNlbW92ZTogW1ZJRVdfSE9WRVJFRCwge2lkOiAnX2xhc3ROb2RlJ30sIHt9LCAxXSwgdG91Y2htb3ZlOiBbSE9WRVJfTU9CSUxFXX19XHJcbiAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbGlzdEJveE5vZGUobm9kZVJlZiwgcGFyZW50UmVmLCBkZXB0aCkge1xyXG4gICAgICAgICAgICBjb25zdCBub2RlSWQgPSBub2RlUmVmLmlkXHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBzdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlSWRdXHJcbiAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7c3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiBzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50VmlldyAmJiBzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50Vmlldy5pZCA9PT0gbm9kZUlkID8gJzAuNScgOiAnMS4wJyxcclxuICAgICAgICAgICAgICAgIH19LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk6IG5vZGVJZCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzI2cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdMZWZ0OiAoZGVwdGggLSAobm9kZS5jaGlsZHJlbi5sZW5ndGggPiAwIHx8IChzdGF0ZS5ob3ZlcmVkVmlld05vZGUgJiYgc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBhcmVudC5pZCA9PT0gbm9kZUlkKSA/IDE6IDApKSAqMjAgKyA4KyAncHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ1JpZ2h0OiAnOHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNDQ0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclRvcDogJzJweCBzb2xpZCAjNGQ0ZDRkJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTogJzJweCBzb2xpZCAjMzMzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoaXRlU3BhY2U6ICdub3dyYXAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJ3doaXRlJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbjoge21vdXNlZG93bjogW1ZJRVdfRFJBR0dFRCwgbm9kZVJlZiwgcGFyZW50UmVmLCBkZXB0aF0sIHRvdWNoc3RhcnQ6IFtWSUVXX0RSQUdHRUQsIG5vZGVSZWYsIHBhcmVudFJlZiwgZGVwdGhdLCBtb3VzZW1vdmU6IFtWSUVXX0hPVkVSRUQsIG5vZGVSZWYsIHBhcmVudFJlZiwgZGVwdGhdLCB0b3VjaG1vdmU6IFtIT1ZFUl9NT0JJTEVdfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5jaGlsZHJlbi5sZW5ndGggPiAwIHx8IChzdGF0ZS5ob3ZlcmVkVmlld05vZGUgJiYgc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBhcmVudC5pZCA9PT0gbm9kZUlkKSA/IGgoJ3NwYW4nLCB7c3R5bGU6IHtkaXNwbGF5OiAnaW5saW5lLWZsZXgnfX0sIFthcnJvd0ljb24oc3RhdGUudmlld0ZvbGRlcnNDbG9zZWRbbm9kZUlkXSB8fCAoc3RhdGUuZHJhZ2dlZENvbXBvbmVudFZpZXcgJiYgbm9kZUlkID09PSBzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50Vmlldy5pZCkpXSk6IGgoJ3NwYW4nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtrZXk6IG5vZGVJZCwgc3R5bGU6IHtkaXNwbGF5OiAnaW5saW5lLWZsZXgnLCBjb2xvcjogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJyM1M0IyRUQnOiAnI2JkYmRiZCcsIHRyYW5zaXRpb246ICdjb2xvciAwLjJzJ319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlQm94JyA/IGJveEljb24oKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVJlZi5yZWYgPT09ICd2Tm9kZUxpc3QnID8gbGlzdEljb24oKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmSWNvbigpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQgPT09IG5vZGVJZCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZGl0aW5nTm9kZShub2RlUmVmKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7IHN0eWxlOiB7ZmxleDogJzEnLCBjdXJzb3I6ICdwb2ludGVyJywgdHJhbnNpdGlvbjogJ2NvbG9yIDAuMnMnLCBwYWRkaW5nTGVmdDogJzJweCcsIG92ZXJmbG93OiAnaGlkZGVuJywgd2hpdGVTcGFjZTogJ25vd3JhcCcsIHRleHRPdmVyZmxvdzogJ2VsbGlwc2lzJ30sIG9uOiB7ZGJsY2xpY2s6IFtFRElUX1ZJRVdfTk9ERV9USVRMRSwgbm9kZUlkXX19LCBub2RlLnRpdGxlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7Y29sb3I6ICcjNTNCMkVEJywgY3Vyc29yOiAncG9pbnRlcicsIGRpc3BsYXk6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICdpbmxpbmUtZmxleCc6ICdub25lJywgZmxleDogJzAgMCBhdXRvJ319LCBbZGVsZXRlSWNvbigpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgZGlzcGxheTogc3RhdGUudmlld0ZvbGRlcnNDbG9zZWRbbm9kZUlkXSB8fCAoc3RhdGUuZHJhZ2dlZENvbXBvbmVudFZpZXcgJiYgbm9kZUlkID09PSBzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50Vmlldy5pZCkgPyAnbm9uZSc6ICdibG9jayd9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBzdGF0ZS5ob3ZlcmVkVmlld05vZGUgJiYgc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBhcmVudC5pZCA9PT0gbm9kZUlkICYmICEobm9kZS5jaGlsZHJlbi5maW5kSW5kZXgoKHJlZik9PiByZWYuaWQgPT09IHN0YXRlLmRyYWdnZWRDb21wb25lbnRWaWV3LmlkKSA9PT0gc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBvc2l0aW9uKSA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKCk9PntcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGRzIGEgZmFrZSBjb21wb25lbnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBvbGRQb3NpdGlvbiA9IG5vZGUuY2hpbGRyZW4uZmluZEluZGV4KChyZWYpPT4gcmVmLmlkID09PSBzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50Vmlldy5pZCkgLy8gdGhpcyBpcyBuZWVkZWQgYmVjYXVzZSB3ZSBzdGlsbCBzaG93IHRoZSBvbGQgbm9kZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld1Bvc2l0aW9uID0gb2xkUG9zaXRpb24gPT09IC0xIHx8IHN0YXRlLmhvdmVyZWRWaWV3Tm9kZS5wb3NpdGlvbiA8IG9sZFBvc2l0aW9uID8gc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBvc2l0aW9uIDogc3RhdGUuaG92ZXJlZFZpZXdOb2RlLnBvc2l0aW9uICsgMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbi5tYXAoKHJlZik9Pmxpc3ROb2RlKHJlZiwgbm9kZVJlZiwgZGVwdGgrMSkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkcmVuLnNsaWNlKDAsIG5ld1Bvc2l0aW9uKS5jb25jYXQoc3BhY2VyQ29tcG9uZW50KCksIGNoaWxkcmVuLnNsaWNlKG5ld1Bvc2l0aW9uKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKCk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLmNoaWxkcmVuLm1hcCgocmVmKT0+bGlzdE5vZGUocmVmLCBub2RlUmVmLCBkZXB0aCsxKSlcclxuICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIHNpbXBsZU5vZGUobm9kZVJlZiwgcGFyZW50UmVmLCBkZXB0aCkge1xyXG4gICAgICAgICAgICBjb25zdCBub2RlSWQgPSBub2RlUmVmLmlkXHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBzdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlSWRdXHJcbiAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5OiBub2RlSWQsXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IHN0YXRlLmRyYWdnZWRDb21wb25lbnRWaWV3ICYmIHN0YXRlLmRyYWdnZWRDb21wb25lbnRWaWV3LmlkID09PSBub2RlSWQgPyAnMC41JyA6ICcxLjAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMjZweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdMZWZ0OiBkZXB0aCAqMjAgKyA4ICsncHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nUmlnaHQ6ICc4cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzQ0NCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclRvcDogJzJweCBzb2xpZCAjNGQ0ZDRkJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiAnMnB4IHNvbGlkICMzMzMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGl0ZVNwYWNlOiAnbm93cmFwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJyNiZGJkYmQnLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb246IHttb3VzZWRvd246IFtWSUVXX0RSQUdHRUQsIG5vZGVSZWYsIHBhcmVudFJlZiwgZGVwdGhdLCB0b3VjaHN0YXJ0OiBbVklFV19EUkFHR0VELCBub2RlUmVmLCBwYXJlbnRSZWYsIGRlcHRoXSwgZGJsY2xpY2s6IFtFRElUX1ZJRVdfTk9ERV9USVRMRSwgbm9kZUlkXSwgbW91c2Vtb3ZlOiBbVklFV19IT1ZFUkVELCBub2RlUmVmLCBwYXJlbnRSZWYsIGRlcHRoXSwgdG91Y2htb3ZlOiBbSE9WRVJfTU9CSUxFXX1cclxuICAgICAgICAgICAgICAgIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlSW5wdXQnID8gaW5wdXRJY29uKCkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlSW1hZ2UnID8gaW1hZ2VJY29uKCkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dEljb24oKSxcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQgPT09IG5vZGVJZCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVkaXRpbmdOb2RlKG5vZGVSZWYpOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnLCBjb2xvcjogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJyM1M0IyRUQnOiAnd2hpdGUnLCB0cmFuc2l0aW9uOiAnY29sb3IgMC4ycycsIHBhZGRpbmdMZWZ0OiAnMnB4Jywgb3ZlcmZsb3c6ICdoaWRkZW4nLCB3aGl0ZVNwYWNlOiAnbm93cmFwJywgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnfX0sIG5vZGUudGl0bGUpLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2NvbG9yOiAnIzUzQjJFRCcsIGN1cnNvcjogJ3BvaW50ZXInLCBkaXNwbGF5OiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnaW5saW5lLWZsZXgnOiAnbm9uZScsIGZsZXg6ICcwIDAgYXV0byd9fSwgW2RlbGV0ZUljb24oKV0pLFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzcGFjZXJDb21wb25lbnQoKXtcclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgIGtleTogJ3NwYWNlcicsXHJcbiAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzZweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYm94U2hhZG93OiAnaW5zZXQgMCAwIDFweCAxcHggIzUzQjJFRCcsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBmYWtlQ29tcG9uZW50KG5vZGVSZWYsIGRlcHRoLCkge1xyXG4gICAgICAgICAgICBjb25zdCBub2RlSWQgPSBub2RlUmVmLmlkXHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBzdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlSWRdXHJcbiAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5OiAnX2Zha2UnK25vZGVJZCxcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ3BhZGRpbmctbGVmdCAwLjJzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnMjZweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdMZWZ0OiAoZGVwdGggLSAobm9kZS5jaGlsZHJlbiAmJiBub2RlLmNoaWxkcmVuLmxlbmd0aCA+IDAgPyAxOiAwKSkgKjIwICsgOCArJ3B4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ1JpZ2h0OiAnOHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJ3JnYmEoNjgsNjgsNjgsMC44KScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclRvcDogJzJweCBzb2xpZCAjNGQ0ZDRkJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyQm90dG9tOiAnMnB4IHNvbGlkICMzMzMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGl0ZVNwYWNlOiAnbm93cmFwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJyNiZGJkYmQnLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgKG5vZGVSZWYucmVmID09PSAndk5vZGVCb3gnIHx8IG5vZGVSZWYucmVmID09PSAndk5vZGVMaXN0JyB8fCBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlSWYnKSAmJiBub2RlLmNoaWxkcmVuLmxlbmd0aCA+IDAgID8gYXJyb3dJY29uKHRydWUpOiBoKCdzcGFuJywge2tleTogJ19mYWtlU3Bhbicrbm9kZUlkfSksXHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZVJlZi5yZWYgPT09ICd2Tm9kZUJveCcgPyBib3hJY29uKCkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlTGlzdCcgPyBsaXN0SWNvbigpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVSZWYucmVmID09PSAndk5vZGVJZicgPyBpZkljb24oKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlSW5wdXQnID8gaW5wdXRJY29uKCkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0SWNvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMScsIGNvbG9yOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnIzUzQjJFRCc6ICd3aGl0ZScsIHRyYW5zaXRpb246ICdjb2xvciAwLjJzJywgcGFkZGluZ0xlZnQ6ICcycHgnLCBvdmVyZmxvdzogJ2hpZGRlbicsIHdoaXRlU3BhY2U6ICdub3dyYXAnLCB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcyd9fSwgbm9kZS50aXRsZSksXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdlbmVyYXRlRWRpdE5vZGVDb21wb25lbnQoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHN0eWxlcyA9IFsnYmFja2dyb3VuZCcsICdib3JkZXInLCAnb3V0bGluZScsICdjdXJzb3InLCAnY29sb3InLCAnZGlzcGxheScsICd0b3AnLCAnYm90dG9tJywgJ2xlZnQnLCAnZmxleCcsICdqdXN0aWZ5Q29udGVudCcsICdhbGlnbkl0ZW1zJywgJ3dpZHRoJywgJ2hlaWdodCcsICdtYXhXaWR0aCcsICdtYXhIZWlnaHQnLCAnbWluV2lkdGgnLCAnbWluSGVpZ2h0JywgJ3JpZ2h0JywgJ3Bvc2l0aW9uJywgJ292ZXJmbG93JywgJ2ZvbnQnLCAnbWFyZ2luJywgJ3BhZGRpbmcnXVxyXG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZE5vZGUgPSBzdGF0ZS5kZWZpbml0aW9uW3N0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmXVtzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkXVxyXG5cclxuICAgICAgICAgICAgY29uc3QgcHJvcHNDb21wb25lbnQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IHN0YXRlLnNlbGVjdGVkVmlld1N1Yk1lbnUgPT09ICdwcm9wcycgPyAnIzRkNGQ0ZCc6ICcjM2QzZDNkJyxcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTBweCAwJyxcclxuICAgICAgICAgICAgICAgICAgICBmbGV4OiAnMScsXHJcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBbU0VMRUNUX1ZJRVdfU1VCTUVOVSwgJ3Byb3BzJ11cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgJ2RhdGEnKVxyXG4gICAgICAgICAgICBjb25zdCBzdHlsZUNvbXBvbmVudCA9IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogc3RhdGUuc2VsZWN0ZWRWaWV3U3ViTWVudSA9PT0gJ3N0eWxlJyA/ICcjNGQ0ZDRkJzogJyMzZDNkM2QnLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMHB4IDAnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZsZXg6ICcxJyxcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXJSaWdodDogJzFweCBzb2xpZCAjMjIyJyxcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXJMZWZ0OiAnMXB4IHNvbGlkICMyMjInLFxyXG4gICAgICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICBjbGljazogW1NFTEVDVF9WSUVXX1NVQk1FTlUsICdzdHlsZSddXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sICdzdHlsZScpXHJcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50c0NvbXBvbmVudCA9IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogc3RhdGUuc2VsZWN0ZWRWaWV3U3ViTWVudSA9PT0gJ2V2ZW50cycgPyAnIzRkNGQ0ZCc6ICcjM2QzZDNkJyxcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTBweCAwJyxcclxuICAgICAgICAgICAgICAgICAgICBmbGV4OiAnMScsXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBbU0VMRUNUX1ZJRVdfU1VCTUVOVSwgJ2V2ZW50cyddXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sICdldmVudHMnKVxyXG5cclxuICAgICAgICAgICAgY29uc3QgZ2VucHJvcHNTdWJtZW51Q29tcG9uZW50ID0gKCkgPT4gaCgnZGl2JywgWygoKT0+e1xyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmID09PSAndk5vZGVCb3gnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW5Ub3A6ICcxMDBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyNiZGJkYmQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LCAnbm8gZGF0YSByZXF1aXJlZCcpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZVRleHQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtzdHlsZToge292ZXJmbG93OiAnYXV0byd9LCBhdHRyczoge1wiY2xhc3NcIjogJ2JldHRlci1zY3JvbGxiYXInfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM2NzY3NjcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc1cHggMTBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMTBweCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJ319LCAndGV4dCB2YWx1ZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzAnLCBjdXJzb3I6ICdkZWZhdWx0JywgY29sb3I6ICcjYmRiZGJkJ319LCAndGV4dCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nOiAnNXB4IDEwcHgnfX0sIFtlbWJlckVkaXRvcihzZWxlY3RlZE5vZGUudmFsdWUsICd0ZXh0JyldKVxyXG4gICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZUltYWdlJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7c3R5bGU6IHtvdmVyZmxvdzogJ2F1dG8nfSwgYXR0cnM6IHtcImNsYXNzXCI6ICdiZXR0ZXItc2Nyb2xsYmFyJ319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNjc2NzY3JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnNXB4IDEwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbkJvdHRvbTogJzEwcHgnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMSd9fSwgJ3NvdXJjZSAodXJsKScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzAnLCBjdXJzb3I6ICdkZWZhdWx0JywgY29sb3I6ICcjYmRiZGJkJ319LCAndGV4dCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nOiAnNXB4IDEwcHgnfX0sIFtlbWJlckVkaXRvcihzZWxlY3RlZE5vZGUuc3JjLCAndGV4dCcpXSlcclxuICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmID09PSAndk5vZGVJbnB1dCcpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge3N0eWxlOiB7b3ZlcmZsb3c6ICdhdXRvJ30sIGF0dHJzOiB7XCJjbGFzc1wiOiAnYmV0dGVyLXNjcm9sbGJhcid9fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzY3Njc2NycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzVweCAxMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW5Cb3R0b206ICcxMHB4J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnfX0sICdpbnB1dCB2YWx1ZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzAnLCBjdXJzb3I6ICdkZWZhdWx0JywgY29sb3I6ICcjYmRiZGJkJ319LCAndGV4dCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nOiAnNXB4IDEwcHgnfX0sIFtlbWJlckVkaXRvcihzZWxlY3RlZE5vZGUudmFsdWUsICd0ZXh0JyldKVxyXG4gICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZUxpc3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtzdHlsZToge292ZXJmbG93OiAnYXV0byd9LCBhdHRyczoge1wiY2xhc3NcIjogJ2JldHRlci1zY3JvbGxiYXInfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM2NzY3NjcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc1cHggMTBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMTBweCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJ319LCAndGFibGUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcwJywgY3Vyc29yOiAnZGVmYXVsdCcsIGNvbG9yOiAnI2JkYmRiZCd9fSwgJ3RhYmxlJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmc6ICc1cHggMTBweCd9fSwgW2VtYmVyRWRpdG9yKHNlbGVjdGVkTm9kZS52YWx1ZSwgJ3RhYmxlJyldKVxyXG4gICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZUlmJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7c3R5bGU6IHtvdmVyZmxvdzogJ2F1dG8nfSwgYXR0cnM6IHtcImNsYXNzXCI6ICdiZXR0ZXItc2Nyb2xsYmFyJ319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNjc2NzY3JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnNXB4IDEwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbkJvdHRvbTogJzEwcHgnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMSd9fSwgJ3ByZWRpY2F0ZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzAnLCBjdXJzb3I6ICdkZWZhdWx0JywgY29sb3I6ICcjYmRiZGJkJ319LCAndHJ1ZS9mYWxzZScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nOiAnNXB4IDEwcHgnfX0sIFtlbWJlckVkaXRvcihzZWxlY3RlZE5vZGUudmFsdWUsICdib29sZWFuJyldKVxyXG4gICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKCldKVxyXG4gICAgICAgICAgICBjb25zdCBnZW5zdHlsZVN1Ym1lbnVDb21wb25lbnQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RlZFN0eWxlID0gc3RhdGUuZGVmaW5pdGlvbi5zdHlsZVtzZWxlY3RlZE5vZGUuc3R5bGUuaWRdXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge2F0dHJzOiB7Y2xhc3M6ICdiZXR0ZXItc2Nyb2xsYmFyJ30sIHN0eWxlOiB7b3ZlcmZsb3c6ICdhdXRvJ319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jyx7IHN0eWxlOiB7cGFkZGluZzogJzEwcHgnLCBmb250RmFtaWx5OiBcIidDb21mb3J0YWEnLCBzYW5zLXNlcmlmXCIsICBjb2xvcjogJyNiZGJkYmQnfX0sICdzdHlsZSBwYW5lbCB3aWxsIGNoYW5nZSBhIGxvdCBpbiAxLjB2LCByaWdodCBub3cgaXRcXCdzIGp1c3QgQ1NTJyksXHJcbiAgICAgICAgICAgICAgICAgICAgLi4uT2JqZWN0LmtleXMoc2VsZWN0ZWRTdHlsZSkubWFwKChrZXkpID0+IGgoJ2RpdicsIHtzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIH19LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNjc2NzY3JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnNXB4IDEwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbkJvdHRvbTogJzEwcHgnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMSd9fSwga2V5KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcwJywgY3Vyc29yOiAnZGVmYXVsdCcsIGNvbG9yOiAnI2JkYmRiZCd9fSwgJ3RleHQnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZzogJzVweCAxMHB4J319LCBbZW1iZXJFZGl0b3Ioc2VsZWN0ZWRTdHlsZVtrZXldLCAndGV4dCcpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgXSkpLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZTogeyBwYWRkaW5nOiAnNXB4IDEwcHgnLCBmb250RmFtaWx5OiBcIidDb21mb3J0YWEnLCBzYW5zLXNlcmlmXCIsICBjb2xvcjogJyNiZGJkYmQnfX0sICdhZGQgU3R5bGU6JyksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7IHBhZGRpbmc6ICc1cHggMCA1cHggMTBweCd9fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGVzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChrZXkpID0+ICFPYmplY3Qua2V5cyhzZWxlY3RlZFN0eWxlKS5pbmNsdWRlcyhrZXkpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCgoa2V5KSA9PiBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb246IHtjbGljazogW0FERF9ERUZBVUxUX1NUWUxFLCBzZWxlY3RlZE5vZGUuc3R5bGUuaWQsIGtleV19LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICczcHggc29saWQgd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnNXB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luVG9wOiAnNXB4J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICcrICcgKyBrZXkpKVxyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgZ2VuZXZlbnRzU3VibWVudUNvbXBvbmVudCA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBhdmFpbGFibGVFdmVudHMgPSBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ29uIGNsaWNrJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lOiAnY2xpY2snXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnZG91YmxlIGNsaWNrZWQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWU6ICdkYmxjbGljaydcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdtb3VzZSBvdmVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lOiAnbW91c2VvdmVyJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ21vdXNlIG91dCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZTogJ21vdXNlb3V0J1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZUlucHV0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIGF2YWlsYWJsZUV2ZW50cyA9IGF2YWlsYWJsZUV2ZW50cy5jb25jYXQoW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2lucHV0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZTogJ2lucHV0J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2ZvY3VzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZTogJ2ZvY3VzJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2JsdXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lOiAnYmx1cidcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudEV2ZW50cyA9IGF2YWlsYWJsZUV2ZW50cy5maWx0ZXIoKGV2ZW50KSA9PiBzZWxlY3RlZE5vZGVbZXZlbnQucHJvcGVydHlOYW1lXSlcclxuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50c0xlZnQgPSBhdmFpbGFibGVFdmVudHMuZmlsdGVyKChldmVudCkgPT4gIXNlbGVjdGVkTm9kZVtldmVudC5wcm9wZXJ0eU5hbWVdKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmdUb3A6ICcyMHB4J319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLihjdXJyZW50RXZlbnRzLmxlbmd0aCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50RXZlbnRzLm1hcCgoZXZlbnREZXNjKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBzdGF0ZS5kZWZpbml0aW9uW3NlbGVjdGVkTm9kZVtldmVudERlc2MucHJvcGVydHlOYW1lXS5yZWZdW3NlbGVjdGVkTm9kZVtldmVudERlc2MucHJvcGVydHlOYW1lXS5pZF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2JywgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtiYWNrZ3JvdW5kOiAnIzY3Njc2NycsIHBhZGRpbmc6ICc1cHggMTBweCd9fSwgZXZlbnQudHlwZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7c3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnY29sb3IgMC4ycycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcxNHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnNXB4IDEwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGV2ZW50Lm11dGF0b3JzLm1hcChtdXRhdG9yUmVmID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtdXRhdG9yID0gc3RhdGUuZGVmaW5pdGlvblttdXRhdG9yUmVmLnJlZl1bbXV0YXRvclJlZi5pZF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdGF0ZURlZiA9IHN0YXRlLmRlZmluaXRpb25bbXV0YXRvci5zdGF0ZS5yZWZdW211dGF0b3Iuc3RhdGUuaWRdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtzdHlsZToge21hcmdpblRvcDogJzEwcHgnfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwIDAgYXV0bycsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCBwb3NpdGlvbjogJ3JlbGF0aXZlJywgdHJhbnNmb3JtOiAndHJhbnNsYXRlWigwKScsIGJveFNoYWRvdzogJ2luc2V0IDAgMCAwIDJweCAnICsgKHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IG11dGF0b3Iuc3RhdGUuaWQgPyAnI2VhYjY1Yyc6ICcjODI4MjgyJykgLCBiYWNrZ3JvdW5kOiAnIzQ0NCcsIHBhZGRpbmc6ICc0cHggN3B4Jyx9fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2NvbG9yOiAnd2hpdGUnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJ30sIG9uOiB7Y2xpY2s6IFtTVEFURV9OT0RFX1NFTEVDVEVELCBtdXRhdG9yLnN0YXRlLmlkXX19LCBzdGF0ZURlZi50aXRsZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbWJlckVkaXRvcihtdXRhdG9yLm11dGF0aW9uLCBzdGF0ZURlZi50eXBlKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7IHBhZGRpbmc6ICc1cHggMTBweCcsIGZvbnRGYW1pbHk6IFwiJ0NvbWZvcnRhYScsIHNhbnMtc2VyaWZcIiwgIGNvbG9yOiAnI2JkYmRiZCd9fSwgJ2FkZCBFdmVudDonKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2JywgIHtzdHlsZTogeyBwYWRkaW5nOiAnNXB4IDAgNXB4IDEwcHgnfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLmV2ZW50c0xlZnQubWFwKChldmVudCkgPT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICczcHggc29saWQgIzViY2M1YicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc1cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAnMTBweCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgb246IHtjbGljazogW0FERF9FVkVOVCwgZXZlbnQucHJvcGVydHlOYW1lLCBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlXX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAnKyAnICsgZXZlbnQuZGVzY3JpcHRpb24pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBmdWxsVk5vZGUgPSBbJ3ZOb2RlQm94Jywndk5vZGVUZXh0JywgJ3ZOb2RlSW1hZ2UnLCAndk5vZGVJbnB1dCddLmluY2x1ZGVzKHN0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmKVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdmaXhlZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZm9udDogXCIzMDAgMS4yZW0gJ09wZW4gU2FucydcIixcclxuICAgICAgICAgICAgICAgICAgICBsaW5lSGVpZ2h0OiAnMS4yZW0nLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IHN0YXRlLmNvbXBvbmVudEVkaXRvclBvc2l0aW9uLnggKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvcDogc3RhdGUuY29tcG9uZW50RWRpdG9yUG9zaXRpb24ueSArICdweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAnNTAlJyxcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgekluZGV4OiAnMzAwMCcsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIFtcclxuICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcxJywgZGlzcGxheTogJ2ZsZXgnLCBtYXJnaW5Cb3R0b206ICcxMHB4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGJhY2tncm91bmQ6ICcjNGQ0ZDRkJywgd2lkdGg6IHN0YXRlLnN1YkVkaXRvcldpZHRoICsgJ3B4JywgYm9yZGVyOiAnM3B4IHNvbGlkICMyMjInfX0sW1xyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcwIDAgYXV0bycsfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdkZWZhdWx0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyMyMjInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ1RvcDogJzJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nQm90dG9tOiAnNXB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzUzQjJFRCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtaW5XaWR0aDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbW91c2Vkb3duOiBbQ09NUE9ORU5UX1ZJRVdfRFJBR0dFRF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b3VjaHN0YXJ0OiBbQ09NUE9ORU5UX1ZJRVdfRFJBR0dFRF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwIDAgYXV0bycsIG1hcmdpbjogJzAgMnB4IDAgNXB4JywgZGlzcGxheTogJ2lubGluZS1mbGV4J319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gJ19yb290Tm9kZScgPyBhcHBJY29uKCkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZiA9PT0gJ3ZOb2RlQm94JyA/IGJveEljb24oKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZiA9PT0gJ3ZOb2RlTGlzdCcgPyBsaXN0SWNvbigpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZiA9PT0gJ3ZOb2RlTGlzdCcgPyBpZkljb24oKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmID09PSAndk5vZGVJbnB1dCcgPyBpbnB1dEljb24oKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0SWNvbigpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzUgNSBhdXRvJywgbWFyZ2luOiAnMCA1cHggMCAwJywgbWluV2lkdGg6ICcwJywgb3ZlcmZsb3c6ICdoaWRkZW4nLCB3aGl0ZVNwYWNlOiAnbm93cmFwJywgdGV4dE92ZXJmbG93OiAnZWxsaXBzaXMnLCBmb250U2l6ZTogJzAuOGVtJ319LCBzZWxlY3RlZE5vZGUudGl0bGUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwIDAgYXV0bycsIG1hcmdpbkxlZnQ6ICdhdXRvJywgY3Vyc29yOiAncG9pbnRlcicsIG1hcmdpblJpZ2h0OiAnNXB4JywgY29sb3I6ICd3aGl0ZScsIGRpc3BsYXk6ICdpbmxpbmUtZmxleCd9LCBvbjoge21vdXNlZG93bjogW1VOU0VMRUNUX1ZJRVdfTk9ERSwgZmFsc2VdLCB0b3VjaHN0YXJ0OiBbVU5TRUxFQ1RfVklFV19OT0RFLCBmYWxzZV19fSwgW2NsZWFySWNvbigpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgZnVsbFZOb2RlID8gaCgnZGl2Jywge3N0eWxlOiB7IGRpc3BsYXk6ICdmbGV4JywgZmxleDogJzAgMCBhdXRvJywgZm9udEZhbWlseTogXCInQ29tZm9ydGFhJywgc2Fucy1zZXJpZlwifX0sIFtwcm9wc0NvbXBvbmVudCwgc3R5bGVDb21wb25lbnQsIGV2ZW50c0NvbXBvbmVudF0pIDogaCgnc3BhbicpLFxyXG4gICAgICAgICAgICAgICAgICAgIGRyYWdTdWJDb21wb25lbnRSaWdodCxcclxuICAgICAgICAgICAgICAgICAgICBkcmFnU3ViQ29tcG9uZW50TGVmdCxcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5zZWxlY3RlZFZpZXdTdWJNZW51ID09PSAncHJvcHMnIHx8ICFmdWxsVk5vZGUgPyBnZW5wcm9wc1N1Ym1lbnVDb21wb25lbnQoKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRWaWV3U3ViTWVudSA9PT0gJ3N0eWxlJyA/IGdlbnN0eWxlU3VibWVudUNvbXBvbmVudCgpOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRWaWV3U3ViTWVudSA9PT0gJ2V2ZW50cycgPyBnZW5ldmVudHNTdWJtZW51Q29tcG9uZW50KCk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsICdFcnJvciwgbm8gc3VjaCBtZW51JylcclxuICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgIF0pXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBhZGRTdGF0ZUNvbXBvbmVudCA9IGgoJ2RpdicsIHtzdHlsZTogeyBmbGV4OiAnMCBhdXRvJywgbWFyZ2luTGVmdDogc3RhdGUucmlnaHRPcGVuID8gJy0xMHB4JzogJzAnLCBib3JkZXI6ICczcHggc29saWQgIzIyMicsIGJvcmRlclJpZ2h0OiAnbm9uZScsIGJhY2tncm91bmQ6ICcjMzMzJywgaGVpZ2h0OiAnNDBweCcsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcid9fSwgW1xyXG4gICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7IGZvbnRGYW1pbHk6IFwiJ0NvbWZvcnRhYScsIHNhbnMtc2VyaWZcIiwgZm9udFNpemU6ICcwLjllbScsIGN1cnNvcjogJ3BvaW50ZXInLCBwYWRkaW5nOiAnMCA1cHgnfX0sICdhZGQgc3RhdGU6ICcpLFxyXG4gICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZGlzcGxheTogJ2lubGluZS1ibG9jayd9LCBvbjoge2NsaWNrOiBbQUREX1NUQVRFLCAnX3Jvb3ROYW1lU3BhY2UnLCAndGV4dCddfX0sIFt0ZXh0SWNvbigpXSksXHJcbiAgICAgICAgICAgIGgoJ3NwYW4nLCB7b246IHtjbGljazogW0FERF9TVEFURSwgJ19yb290TmFtZVNwYWNlJywgJ251bWJlciddfX0sIFtudW1iZXJJY29uKCldKSxcclxuICAgICAgICAgICAgaCgnc3BhbicsIHtvbjoge2NsaWNrOiBbQUREX1NUQVRFLCAnX3Jvb3ROYW1lU3BhY2UnLCAnYm9vbGVhbiddfX0sIFtpZkljb24oKV0pLFxyXG4gICAgICAgICAgICBoKCdzcGFuJywge29uOiB7Y2xpY2s6IFtBRERfU1RBVEUsICdfcm9vdE5hbWVTcGFjZScsICd0YWJsZSddfX0sIFtsaXN0SWNvbigpXSksXHJcbiAgICAgICAgXSlcclxuXHJcblxyXG4gICAgICAgIGNvbnN0IGFkZFZpZXdOb2RlQ29tcG9uZW50ID0gaCgnZGl2Jywge3N0eWxlOiB7IGZsZXg6ICcwIGF1dG8nLCBtYXJnaW5MZWZ0OiBzdGF0ZS5yaWdodE9wZW4gPyAnLTEwcHgnOiAnMCcsIGJvcmRlcjogJzNweCBzb2xpZCAjMjIyJywgYm9yZGVyUmlnaHQ6ICdub25lJywgYmFja2dyb3VuZDogJyMzMzMnLCBoZWlnaHQ6ICc0MHB4JywgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJ319LCBbXHJcbiAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHsgZm9udEZhbWlseTogXCInQ29tZm9ydGFhJywgc2Fucy1zZXJpZlwiLCBmb250U2l6ZTogJzAuOWVtJywgcGFkZGluZzogJzAgMTBweCd9fSwgJ2FkZCBjb21wb25lbnQ6ICcpLFxyXG4gICAgICAgICAgICBoKCdzcGFuJywge29uOiB7Y2xpY2s6IFtBRERfTk9ERSwgc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZSwgJ2JveCddfX0sIFtib3hJY29uKCldKSxcclxuICAgICAgICAgICAgaCgnc3BhbicsIHtvbjoge2NsaWNrOiBbQUREX05PREUsIHN0YXRlLnNlbGVjdGVkVmlld05vZGUsICdpbnB1dCddfX0sIFtpbnB1dEljb24oKV0pLFxyXG4gICAgICAgICAgICBoKCdzcGFuJywge29uOiB7Y2xpY2s6IFtBRERfTk9ERSwgc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZSwgJ3RleHQnXX19LCBbdGV4dEljb24oKV0pLFxyXG4gICAgICAgICAgICBoKCdzcGFuJywge29uOiB7Y2xpY2s6IFtBRERfTk9ERSwgc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZSwgJ2ltYWdlJ119fSwgW2ltYWdlSWNvbigpXSksXHJcbiAgICAgICAgICAgIGgoJ3NwYW4nLCB7b246IHtjbGljazogW0FERF9OT0RFLCBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLCAnaWYnXX19LCBbaWZJY29uKCldKSxcclxuICAgICAgICBdKVxyXG5cclxuICAgICAgICBjb25zdCB2aWV3Q29tcG9uZW50ID0gaCgnZGl2Jywge2F0dHJzOiB7Y2xhc3M6ICdiZXR0ZXItc2Nyb2xsYmFyJ30sIHN0eWxlOiB7b3ZlcmZsb3c6ICdhdXRvJywgcG9zaXRpb246ICdyZWxhdGl2ZScsIGZsZXg6ICcxJywgZm9udFNpemU6ICcwLjhlbSd9LCBvbjoge2NsaWNrOiBbVU5TRUxFQ1RfVklFV19OT0RFLCB0cnVlXX19LCBbXHJcbiAgICAgICAgICAgIGxpc3ROb2RlKHtyZWY6ICd2Tm9kZUJveCcsIGlkOidfcm9vdE5vZGUnfSwge30sIDApLFxyXG4gICAgICAgIF0pXHJcblxyXG4gICAgICAgIGNvbnN0IHJpZ2h0Q29tcG9uZW50ID1cclxuICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgcmlnaHQ6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgICAgICBmb250OiBcIjMwMCAxLjJlbSAnT3BlbiBTYW5zJ1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6ICcxLjJlbScsXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHN0YXRlLmVkaXRvclJpZ2h0V2lkdGggKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNGQ0ZDRkJyxcclxuICAgICAgICAgICAgICAgICAgICBib3hTaXppbmc6IFwiYm9yZGVyLWJveFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlckxlZnQ6ICczcHggc29saWQgIzIyMicsXHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJzAuNXMgdHJhbnNmb3JtJyxcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm06IHN0YXRlLnJpZ2h0T3BlbiA/ICd0cmFuc2xhdGVaKDApIHRyYW5zbGF0ZVgoMCUpJzogJ3RyYW5zbGF0ZVooMCkgdHJhbnNsYXRlWCgxMDAlKScsXHJcbiAgICAgICAgICAgICAgICAgICAgdXNlclNlbGVjdDogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgZHJhZ0NvbXBvbmVudFJpZ2h0LFxyXG4gICAgICAgICAgICAgICAgb3BlbkNvbXBvbmVudFJpZ2h0LFxyXG4gICAgICAgICAgICAgICAgYWRkU3RhdGVDb21wb25lbnQsXHJcbiAgICAgICAgICAgICAgICBzdGF0ZUNvbXBvbmVudCxcclxuICAgICAgICAgICAgICAgIGFkZFZpZXdOb2RlQ29tcG9uZW50LFxyXG4gICAgICAgICAgICAgICAgdmlld0NvbXBvbmVudCxcclxuICAgICAgICAgICAgXSlcclxuXHJcbiAgICAgICAgY29uc3QgdG9wQ29tcG9uZW50ID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgZmxleDogJzEgYXV0bycsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICc3NXB4JyxcclxuICAgICAgICAgICAgICAgIG1heEhlaWdodDogJzc1cHgnLFxyXG4gICAgICAgICAgICAgICAgbWluSGVpZ2h0OiAnNzVweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzIyMicsXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OidmbGV4JyxcclxuICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiJ0NvbWZvcnRhYScsIHNhbnMtc2VyaWZcIixcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIFtcclxuICAgICAgICAgICAgaCgnYScsIHtzdHlsZToge2ZsZXg6ICcwIGF1dG8nLCB3aWR0aDogJzE5MHB4JywgdGV4dERlY29yYXRpb246ICdpbmhlcml0JywgdXNlclNlbGVjdDogJ25vbmUnfSwgYXR0cnM6IHtocmVmOicvX2Rldid9fSwgW1xyXG4gICAgICAgICAgICAgICAgaCgnaW1nJyx7c3R5bGU6IHsgbWFyZ2luOiAnN3B4IC0ycHggLTNweCA1cHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJ30sIGF0dHJzOiB7c3JjOiAnL2ltYWdlcy9sb2dvMjU2eDI1Ni5wbmcnLCBoZWlnaHQ6ICc1Nyd9fSksXHJcbiAgICAgICAgICAgICAgICBoKCdzcGFuJyx7c3R5bGU6IHsgZm9udFNpemU6JzQ0cHgnLCAgdmVydGljYWxBbGlnbjogJ2JvdHRvbScsIGNvbG9yOiAnI2ZmZid9fSwgJ3VnbmlzJylcclxuICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgIHJpZ2h0OiAnMCcsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgZm9udEZhbWlseTogXCInQ29tZm9ydGFhJywgc2Fucy1zZXJpZlwiLFxyXG4gICAgICAgICAgICAgICAgZm9udFNpemU6ICcxNnB4JyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM0NDQ0NDQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxNXB4IDIwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpbjogJzEzcHggMTNweCAwIDAnLFxyXG4gICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGljazogW0ZVTExfU0NSRUVOX0NMSUNLRUQsIHRydWVdXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgJ2Z1bGwgc2NyZWVuJyksXHJcbiAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzQ0NDQ0NCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzE1cHggMjBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAnMTNweCAxM3B4IDAgMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsaWNrOiBSRVNFVF9BUFBfU1RBVEVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LCAncmVzZXQgc3RhdGUnKSxcclxuICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNDQ0NDQ0JyxcclxuICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTVweCAyMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW46ICcxM3B4IDEzcHggMCAwJyxcclxuICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xpY2s6IFJFU0VUX0FQUF9ERUZJTklUSU9OXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgJ3Jlc2V0IGRlbW8nKVxyXG4gICAgICAgICAgICBdKVxyXG4gICAgICAgIF0pXHJcbiAgICAgICAgY29uc3QgbGVmdENvbXBvbmVudCA9IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgIGxlZnQ6ICcwJyxcclxuICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBmb250OiBcIjMwMCAxLjJlbSAnT3BlbiBTYW5zJ1wiLFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6IHN0YXRlLmVkaXRvckxlZnRXaWR0aCArICdweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzRkNGQ0ZCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaXppbmc6IFwiYm9yZGVyLWJveFwiLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmlnaHQ6ICczcHggc29saWQgIzIyMicsXHJcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnMC41cyB0cmFuc2Zvcm0nLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiBzdGF0ZS5sZWZ0T3BlbiA/ICd0cmFuc2xhdGVaKDApIHRyYW5zbGF0ZVgoMCUpJzogJ3RyYW5zbGF0ZVooMCkgdHJhbnNsYXRlWCgtMTAwJSknLFxyXG4gICAgICAgICAgICAgICAgdXNlclNlbGVjdDogJ25vbmUnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sIFtcclxuICAgICAgICAgICAgZHJhZ0NvbXBvbmVudExlZnQsXHJcbiAgICAgICAgICAgIG9wZW5Db21wb25lbnRMZWZ0LFxyXG4gICAgICAgICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBGUkVFWkVSX0NMSUNLRURcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGZsZXg6ICcwIGF1dG8nLFxyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjMzMzJyxcclxuICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sIFtcclxuICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHsgcGFkZGluZzogJzE1cHggMTVweCAxMHB4IDE1cHgnLCBjb2xvcjogc3RhdGUuYXBwSXNGcm96ZW4gPyAncmdiKDkxLCAyMDQsIDkxKScgOiAncmdiKDIwNCwgOTEsIDkxKSd9fSwgc3RhdGUuYXBwSXNGcm96ZW4gPyAn4pa6JyA6ICfinZrinZonKSxcclxuICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICBhdHRyczoge2NsYXNzOiAnYmV0dGVyLXNjcm9sbGJhcid9LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsZXg6ICcxIGF1dG8nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdzogJ2F1dG8nXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHN0YXRlLmV2ZW50U3RhY2tcclxuICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChldmVudERhdGEpPT5zdGF0ZS5kZWZpbml0aW9uLmV2ZW50W2V2ZW50RGF0YS5ldmVudElkXSAhPT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICAgICAgICAgIC5yZXZlcnNlKCkgLy8gbXV0YXRlcyB0aGUgYXJyYXksIGJ1dCBpdCB3YXMgYWxyZWFkeSBjb3BpZWQgd2l0aCBmaWx0ZXJcclxuICAgICAgICAgICAgICAgICAgICAubWFwKChldmVudERhdGEsIGluZGV4KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gc3RhdGUuZGVmaW5pdGlvbi5ldmVudFtldmVudERhdGEuZXZlbnRJZF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZW1pdHRlciA9IHN0YXRlLmRlZmluaXRpb25bZXZlbnQuZW1pdHRlci5yZWZdW2V2ZW50LmVtaXR0ZXIuaWRdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vIGlkZWEgd2h5IHRoaXMga2V5IHdvcmtzLCBkb24ndCB0b3VjaCBpdCwgcHJvYmFibHkgcmVyZW5kZXJzIG1vcmUgdGhhbiBuZWVkZWQsIGJ1dCB3aG8gY2FyZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtrZXk6IGV2ZW50LmVtaXR0ZXIuaWQgKyBpbmRleCwgc3R5bGU6IHttYXJnaW5Cb3R0b206ICcxMHB4J319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMTBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM0NDQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdUb3A6ICczcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdCb3R0b206ICczcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBldmVudC5lbWl0dGVyLmlkID8gJyM1M0IyRUQnOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICcwLjJzIGFsbCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWluV2lkdGg6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIG9uOiB7Y2xpY2s6IFtWSUVXX05PREVfU0VMRUNURUQsIGV2ZW50LmVtaXR0ZXJdfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAgMCBhdXRvJywgbWFyZ2luOiAnMCAwIDAgNXB4J319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LmVtaXR0ZXIucmVmID09PSAndk5vZGVCb3gnID8gYm94SWNvbigpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LmVtaXR0ZXIucmVmID09PSAndk5vZGVMaXN0JyA/IGxpc3RJY29uKCkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LmVtaXR0ZXIucmVmID09PSAndk5vZGVMaXN0JyA/IGlmSWNvbigpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQuZW1pdHRlci5yZWYgPT09ICd2Tm9kZUlucHV0JyA/IGlucHV0SWNvbigpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRJY29uKCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICc1IDUgYXV0bycsIG1hcmdpbjogJzAgNXB4IDAgMCcsIG1pbldpZHRoOiAnMCcsIG92ZXJmbG93OiAnaGlkZGVuJywgd2hpdGVTcGFjZTogJ25vd3JhcCcsICB0ZXh0T3ZlcmZsb3c6ICdlbGxpcHNpcyd9fSwgZW1pdHRlci50aXRsZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwIDAgYXV0bycsIGZvbnRGYW1pbHk6IFwiJ0NvbWZvcnRhYScsIHNhbnMtc2VyaWZcIiwgZm9udFNpemU6ICcwLjllbScsIG1hcmdpbkxlZnQ6ICdhdXRvJywgbWFyZ2luUmlnaHQ6ICc1cHgnLCBjb2xvcjogJyM1YmNjNWInfX0sIGV2ZW50LnR5cGUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhldmVudERhdGEubXV0YXRpb25zKS5sZW5ndGggPT09IDAgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZTogeyBwYWRkaW5nOiAnNXB4IDEwcHgnLCBmb250RmFtaWx5OiBcIidDb21mb3J0YWEnLCBzYW5zLXNlcmlmXCIsICBjb2xvcjogJyNiZGJkYmQnfX0sICdub3RoaW5nIGhhcyBjaGFuZ2VkJyk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ0xlZnQ6ICcxMHB4Jywgd2hpdGVTcGFjZTogJ25vd3JhcCd9fSwgT2JqZWN0LmtleXMoZXZlbnREYXRhLm11dGF0aW9ucylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZpbHRlcihzdGF0ZUlkID0+IHN0YXRlLmRlZmluaXRpb24uc3RhdGVbc3RhdGVJZF0gIT09IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChzdGF0ZUlkID0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7b246IHtjbGljazogW1NUQVRFX05PREVfU0VMRUNURUQsIHN0YXRlSWRdfSwgc3R5bGU6IHtjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxNHB4JywgY29sb3I6ICd3aGl0ZScsIGJveFNoYWRvdzogJ2luc2V0IDAgMCAwIDJweCAnICsgKHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHN0YXRlSWQgPyAnI2VhYjY1Yyc6ICcjODI4MjgyJykgLCBiYWNrZ3JvdW5kOiAnIzQ0NCcsIHBhZGRpbmc6ICcycHggNXB4JywgbWFyZ2luUmlnaHQ6ICc1cHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgdHJhbnNpdGlvbjogJ2FsbCAwLjJzJ319LCBzdGF0ZS5kZWZpbml0aW9uLnN0YXRlW3N0YXRlSWRdLnRpdGxlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7Y29sb3I6ICcjOGU4ZThlJ319LCBldmVudERhdGEucHJldmlvdXNTdGF0ZVtzdGF0ZUlkXS50b1N0cmluZygpICsgJyDigJPigLogJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIGV2ZW50RGF0YS5tdXRhdGlvbnNbc3RhdGVJZF0udG9TdHJpbmcoKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICBdKVxyXG4gICAgICAgIGNvbnN0IHJlbmRlclZpZXdDb21wb25lbnQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBmbGV4OiAnMSBhdXRvJyxcclxuICAgICAgICAgICAgICAgIC8vYmFja2dyb3VuZEltYWdlOiAncmFkaWFsLWdyYWRpZW50KGJsYWNrIDE1JSwgdHJhbnNwYXJlbnQgMTYlKSwgcmFkaWFsLWdyYWRpZW50KGJsYWNrIDE1JSwgdHJhbnNwYXJlbnQgMTYlKSwgcmFkaWFsLWdyYWRpZW50KHJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wOTgwMzkyKSAxNSUsIHRyYW5zcGFyZW50IDIwJSksIHJhZGlhbC1ncmFkaWVudChyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDk4MDM5MikgMTUlLCB0cmFuc3BhcmVudCAyMCUpJyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRQb3NpdGlvblg6ICcwcHgsIDhweCwgMHB4LCA4cHgnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZFBvc2l0aW9uWTogJzBweCwgOHB4LCAxcHgsIDlweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6JyMzMzMnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZFNpemU6JzE2cHggMTZweCcsXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OidyZWxhdGl2ZScsXHJcbiAgICAgICAgICAgICAgICBvdmVyZmxvdzogJ2F1dG8nLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sIFtcclxuICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiAoKCk9PntcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRvcE1lbnVIZWlnaHQgPSA3NVxyXG4gICAgICAgICAgICAgICAgY29uc3Qgd2lkdGhMZWZ0ID0gd2luZG93LmlubmVyV2lkdGggLSAoKHN0YXRlLmxlZnRPcGVuID8gc3RhdGUuZWRpdG9yTGVmdFdpZHRoOiAwKSArIChzdGF0ZS5yaWdodE9wZW4gPyBzdGF0ZS5lZGl0b3JSaWdodFdpZHRoIDogMCkpXHJcbiAgICAgICAgICAgICAgICBjb25zdCBoZWlnaHRMZWZ0ID0gd2luZG93LmlubmVySGVpZ2h0IC0gdG9wTWVudUhlaWdodFxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogc3RhdGUuZnVsbFNjcmVlbiA/ICcxMDB2dycgOiB3aWR0aExlZnQgLSA0MCArJ3B4JyxcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHN0YXRlLmZ1bGxTY3JlZW4gPyAnMTAwdmgnIDogaGVpZ2h0TGVmdCAtIDQwICsgJ3B4JyxcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnI2ZmZmZmZicsXHJcbiAgICAgICAgICAgICAgICAgICAgekluZGV4OiBzdGF0ZS5mdWxsU2NyZWVuID8gJzIwMDAnIDogJzEwMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYm94U2hhZG93OiAncmdiYSgwLCAwLCAwLCAwLjI0NzA1OSkgMHB4IDE0cHggNDVweCwgcmdiYSgwLCAwLCAwLCAwLjIxOTYwOCkgMHB4IDEwcHggMThweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdmaXhlZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJ2FsbCAwLjVzJyxcclxuICAgICAgICAgICAgICAgICAgICB0b3A6IHN0YXRlLmZ1bGxTY3JlZW4gPyAnMHB4JyA6IDIwICsgNzUgKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6IHN0YXRlLmZ1bGxTY3JlZW4gPyAnMHB4JyA6IChzdGF0ZS5sZWZ0T3BlbiA/c3RhdGUuZWRpdG9yTGVmdFdpZHRoIDogMCkgKyAyMCArICdweCcsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKCl9LCBbXHJcbiAgICAgICAgICAgICAgICBzdGF0ZS5mdWxsU2NyZWVuID9cclxuICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7cG9zaXRpb246ICdmaXhlZCcsIHBhZGRpbmc6ICcxMnB4IDEwcHgnLCB0b3A6ICcwJywgcmlnaHQ6ICcyMHB4JywgYm9yZGVyOiAnMnB4IHNvbGlkICMzMzMnLCBib3JkZXJUb3A6ICdub25lJywgYmFja2dyb3VuZDogJyM0NDQnLCBjb2xvcjogJ3doaXRlJywgb3BhY2l0eTogJzAuOCcsIGN1cnNvcjogJ3BvaW50ZXInfSwgb246IHtjbGljazogW0ZVTExfU0NSRUVOX0NMSUNLRUQsIGZhbHNlXX19LCAnZXhpdCBmdWxsIHNjcmVlbicpOlxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nKSxcclxuICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge292ZXJmbG93OiAnYXV0bycsIHdpZHRoOiAnMTAwJScsIGhlaWdodDogJzEwMCUnfX0sIFthcHAudmRvbV0pXHJcbiAgICAgICAgICAgIF0pXHJcbiAgICAgICAgXSlcclxuICAgICAgICBjb25zdCBtYWluUm93Q29tcG9uZW50ID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgZmxleDogJzEnLFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICByZW5kZXJWaWV3Q29tcG9uZW50LFxyXG4gICAgICAgICAgICBsZWZ0Q29tcG9uZW50LFxyXG4gICAgICAgICAgICByaWdodENvbXBvbmVudCxcclxuICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPyBnZW5lcmF0ZUVkaXROb2RlQ29tcG9uZW50KCk6IGgoJ3NwYW4nKVxyXG4gICAgICAgIF0pXHJcbiAgICAgICAgY29uc3Qgdm5vZGUgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnZml4ZWQnLFxyXG4gICAgICAgICAgICAgICAgdG9wOiAnMCcsXHJcbiAgICAgICAgICAgICAgICByaWdodDogJzAnLFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6ICcxMDB2dycsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDB2aCcsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICB0b3BDb21wb25lbnQsXHJcbiAgICAgICAgICAgIG1haW5Sb3dDb21wb25lbnQsXHJcbiAgICAgICAgICAgIHN0YXRlLmRyYWdnZWRDb21wb25lbnRWaWV3ID8gaCgnZGl2Jywge3N0eWxlOiB7Zm9udEZhbWlseTogXCJPcGVuIFNhbnNcIiwgcG9pbnRlckV2ZW50czogJ25vbmUnLCBwb3NpdGlvbjogJ2ZpeGVkJywgdG9wOiBzdGF0ZS5tb3VzZVBvc2l0aW9uLnkgKyAncHgnLCBsZWZ0OiBzdGF0ZS5tb3VzZVBvc2l0aW9uLnggKyAncHgnLCBsaW5lSGVpZ2h0OiAnMS4yZW0nLCBmb250U2l6ZTogJzEuMmVtJywgekluZGV4OiAnOTk5OTknLCB3aWR0aDogc3RhdGUuZWRpdG9yUmlnaHRXaWR0aCArICdweCd9fSwgW2goJ2RpdicsIHtzdHlsZToge292ZXJmbG93OiAnYXV0bycsIHBvc2l0aW9uOiAncmVsYXRpdmUnLCBmbGV4OiAnMScsIGZvbnRTaXplOiAnMC44ZW0nfX0sIFtmYWtlQ29tcG9uZW50KHN0YXRlLmRyYWdnZWRDb21wb25lbnRWaWV3LCBzdGF0ZS5ob3ZlcmVkVmlld05vZGUgPyBzdGF0ZS5ob3ZlcmVkVmlld05vZGUuZGVwdGggOiBzdGF0ZS5kcmFnZ2VkQ29tcG9uZW50Vmlldy5kZXB0aCldKV0pOiBoKCdzcGFuJyksXHJcbiAgICAgICAgICAgIHN0YXRlLmRyYWdnZWRDb21wb25lbnRTdGF0ZUlkID8gaCgnZGl2Jywge3N0eWxlOiB7Zm9udEZhbWlseTogXCJPcGVuIFNhbnNcIiwgcG9pbnRlckV2ZW50czogJ25vbmUnLCBwb3NpdGlvbjogJ2ZpeGVkJywgdG9wOiBzdGF0ZS5tb3VzZVBvc2l0aW9uLnkgKyAncHgnLCBsZWZ0OiBzdGF0ZS5tb3VzZVBvc2l0aW9uLnggKyAncHgnLCBsaW5lSGVpZ2h0OiAnMS4yZW0nLCBmb250U2l6ZTogJzE2cHgnLCB6SW5kZXg6ICc5OTk5OScsIHdpZHRoOiBzdGF0ZS5lZGl0b3JSaWdodFdpZHRoICsgJ3B4J319LCBbZmFrZVN0YXRlKHN0YXRlLmRyYWdnZWRDb21wb25lbnRTdGF0ZUlkKV0pOiBoKCdzcGFuJyksXHJcbiAgICAgICAgXSlcclxuXHJcbiAgICAgICAgbm9kZSA9IHBhdGNoKG5vZGUsIHZub2RlKVxyXG4gICAgICAgIGN1cnJlbnRBbmltYXRpb25GcmFtZVJlcXVlc3QgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbmRlcigpXHJcbn0iLCJmdW5jdGlvbiB1cGRhdGVQcm9wcyhvbGRWbm9kZSwgdm5vZGUpIHtcclxuICAgIHZhciBrZXksIGN1ciwgb2xkLCBlbG0gPSB2bm9kZS5lbG0sXHJcbiAgICAgICAgcHJvcHMgPSB2bm9kZS5kYXRhLmxpdmVQcm9wcyB8fCB7fTtcclxuICAgIGZvciAoa2V5IGluIHByb3BzKSB7XHJcbiAgICAgICAgY3VyID0gcHJvcHNba2V5XTtcclxuICAgICAgICBvbGQgPSBlbG1ba2V5XTtcclxuICAgICAgICBpZiAob2xkICE9PSBjdXIpIGVsbVtrZXldID0gY3VyO1xyXG4gICAgfVxyXG59XHJcbmNvbnN0IGxpdmVQcm9wc1BsdWdpbiA9IHtjcmVhdGU6IHVwZGF0ZVByb3BzLCB1cGRhdGU6IHVwZGF0ZVByb3BzfTtcclxuaW1wb3J0IHNuYWJiZG9tIGZyb20gJ3NuYWJiZG9tJ1xyXG5jb25zdCBwYXRjaCA9IHNuYWJiZG9tLmluaXQoW1xyXG4gICAgcmVxdWlyZSgnc25hYmJkb20vbW9kdWxlcy9jbGFzcycpLFxyXG4gICAgcmVxdWlyZSgnc25hYmJkb20vbW9kdWxlcy9wcm9wcycpLFxyXG4gICAgcmVxdWlyZSgnc25hYmJkb20vbW9kdWxlcy9zdHlsZScpLFxyXG4gICAgcmVxdWlyZSgnc25hYmJkb20vbW9kdWxlcy9ldmVudGxpc3RlbmVycycpLFxyXG4gICAgcmVxdWlyZSgnc25hYmJkb20vbW9kdWxlcy9hdHRyaWJ1dGVzJyksXHJcbiAgICBsaXZlUHJvcHNQbHVnaW5cclxuXSk7XHJcbmltcG9ydCBoIGZyb20gJ3NuYWJiZG9tL2gnO1xyXG5pbXBvcnQgYmlnIGZyb20gJ2JpZy5qcyc7XHJcblxyXG5mdW5jdGlvbiBmbGF0dGVuKGFycikge1xyXG4gICAgcmV0dXJuIGFyci5yZWR1Y2UoZnVuY3Rpb24gKGZsYXQsIHRvRmxhdHRlbikge1xyXG4gICAgICAgIHJldHVybiBmbGF0LmNvbmNhdChBcnJheS5pc0FycmF5KHRvRmxhdHRlbikgPyBmbGF0dGVuKHRvRmxhdHRlbikgOiB0b0ZsYXR0ZW4pO1xyXG4gICAgfSwgW10pO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCAoZGVmaW5pdGlvbikgPT4ge1xyXG5cclxuICAgIGxldCBjdXJyZW50U3RhdGUgPSBjcmVhdGVEZWZhdWx0U3RhdGUoKVxyXG5cclxuICAgIC8vIEFsbG93cyBzdG9waW5nIGFwcGxpY2F0aW9uIGluIGRldmVsb3BtZW50LiBUaGlzIGlzIG5vdCBhbiBhcHBsaWNhdGlvbiBzdGF0ZVxyXG4gICAgbGV0IGZyb3plbiA9IGZhbHNlXHJcbiAgICBsZXQgZnJvemVuQ2FsbGJhY2sgPSBudWxsXHJcbiAgICBsZXQgc2VsZWN0SG92ZXJBY3RpdmUgPSBmYWxzZVxyXG4gICAgbGV0IHNlbGVjdGVkTm9kZUluRGV2ZWxvcG1lbnQgPSB7fVxyXG5cclxuICAgIGZ1bmN0aW9uIHNlbGVjdE5vZGVIb3ZlcihyZWYsIGUpIHtcclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgc2VsZWN0ZWROb2RlSW5EZXZlbG9wbWVudCA9IHJlZlxyXG4gICAgICAgIGZyb3plbkNhbGxiYWNrKHJlZilcclxuICAgICAgICByZW5kZXIoKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gc2VsZWN0Tm9kZUNsaWNrKHJlZiwgZSkge1xyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICBzZWxlY3RIb3ZlckFjdGl2ZSA9IGZhbHNlXHJcbiAgICAgICAgc2VsZWN0ZWROb2RlSW5EZXZlbG9wbWVudCA9IHJlZlxyXG4gICAgICAgIGZyb3plbkNhbGxiYWNrKHJlZilcclxuICAgICAgICByZW5kZXIoKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGdsb2JhbCBzdGF0ZSBmb3IgcmVzb2x2ZXJcclxuICAgIGxldCBjdXJyZW50RXZlbnQgPSBudWxsXHJcbiAgICBsZXQgY3VycmVudE1hcFZhbHVlID0ge31cclxuICAgIGxldCBjdXJyZW50TWFwSW5kZXggPSB7fVxyXG4gICAgbGV0IGV2ZW50RGF0YSA9IHt9XHJcbiAgICBmdW5jdGlvbiByZXNvbHZlKHJlZil7XHJcbiAgICAgICAgaWYocmVmID09PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gc3RhdGljIHZhbHVlIChzdHJpbmcvbnVtYmVyKVxyXG4gICAgICAgIGlmKHJlZi5yZWYgPT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHJldHVybiByZWZcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZGVmID0gZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdXHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdwaXBlJykge1xyXG4gICAgICAgICAgICByZXR1cm4gcGlwZShyZWYpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWYucmVmID09PSAnY29uZGl0aW9uYWwnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlKGRlZi5wcmVkaWNhdGUpID8gcmVzb2x2ZShkZWYudGhlbikgOiByZXNvbHZlKGRlZi5lbHNlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3N0YXRlJykge1xyXG4gICAgICAgICAgICByZXR1cm4gY3VycmVudFN0YXRlW3JlZi5pZF1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICd2Tm9kZUJveCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGJveE5vZGUocmVmKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3ZOb2RlVGV4dCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRleHROb2RlKHJlZilcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICd2Tm9kZUlucHV0Jykge1xyXG4gICAgICAgICAgICByZXR1cm4gaW5wdXROb2RlKHJlZilcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICd2Tm9kZUxpc3QnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBsaXN0Tm9kZShyZWYpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWYucmVmID09PSAndk5vZGVJZicpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGlmTm9kZShyZWYpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWYucmVmID09PSAndk5vZGVJbWFnZScpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGltYWdlTm9kZShyZWYpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWYucmVmID09PSAnc3R5bGUnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhkZWYpLnJlZHVjZSgoYWNjLCB2YWwpPT4ge1xyXG4gICAgICAgICAgICAgICAgYWNjW3ZhbF0gPSByZXNvbHZlKGRlZlt2YWxdKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjY1xyXG4gICAgICAgICAgICB9LCB7fSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdldmVudERhdGEnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBldmVudERhdGFbcmVmLmlkXVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ2xpc3RWYWx1ZScpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRNYXBWYWx1ZVtkZWYubGlzdC5pZF1bZGVmLnByb3BlcnR5XVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aHJvdyBFcnJvcihyZWYpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdHJhbnNmb3JtVmFsdWUodmFsdWUsIHRyYW5zZm9ybWF0aW9ucyl7XHJcbiAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRyYW5zZm9ybWF0aW9ucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCByZWYgPSB0cmFuc2Zvcm1hdGlvbnNbaV07XHJcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybWVyID0gZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdXHJcbiAgICAgICAgICAgIGlmIChyZWYucmVmID09PSAnZXF1YWwnKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wYXJlVmFsdWUgPSByZXNvbHZlKHRyYW5zZm9ybWVyLnZhbHVlKVxyXG4gICAgICAgICAgICAgICAgaWYodmFsdWUgaW5zdGFuY2VvZiBiaWcgfHwgY29tcGFyZVZhbHVlIGluc3RhbmNlb2YgYmlnKXtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGJpZyh2YWx1ZSkuZXEoY29tcGFyZVZhbHVlKVxyXG4gICAgICAgICAgICAgICAgfSBlbHNle1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgPT09IGNvbXBhcmVWYWx1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZWYucmVmID09PSAnYWRkJykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBiaWcodmFsdWUpLnBsdXMocmVzb2x2ZSh0cmFuc2Zvcm1lci52YWx1ZSkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdzdWJ0cmFjdCcpIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gYmlnKHZhbHVlKS5taW51cyhyZXNvbHZlKHRyYW5zZm9ybWVyLnZhbHVlKSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ211bHRpcGx5Jykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBiaWcodmFsdWUpLnRpbWVzKHJlc29sdmUodHJhbnNmb3JtZXIudmFsdWUpKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZWYucmVmID09PSAnZGl2aWRlJykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBiaWcodmFsdWUpLmRpdihyZXNvbHZlKHRyYW5zZm9ybWVyLnZhbHVlKSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3JlbWFpbmRlcicpIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gYmlnKHZhbHVlKS5tb2QocmVzb2x2ZSh0cmFuc2Zvcm1lci52YWx1ZSkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdicmFuY2gnKSB7XHJcbiAgICAgICAgICAgICAgICBpZihyZXNvbHZlKHRyYW5zZm9ybWVyLnByZWRpY2F0ZSkpe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdHJhbnNmb3JtVmFsdWUodmFsdWUsIHRyYW5zZm9ybWVyLnRoZW4pXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdHJhbnNmb3JtVmFsdWUodmFsdWUsIHRyYW5zZm9ybWVyLmVsc2UpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdqb2luJykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5jb25jYXQocmVzb2x2ZSh0cmFuc2Zvcm1lci52YWx1ZSkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlZi5yZWYgPT09ICd0b1VwcGVyQ2FzZScpIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9VcHBlckNhc2UoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZWYucmVmID09PSAndG9Mb3dlckNhc2UnKSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvTG93ZXJDYXNlKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3RvVGV4dCcpIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9TdHJpbmcoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBwaXBlKHJlZikge1xyXG4gICAgICAgIGNvbnN0IGRlZiA9IGRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXVxyXG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm1WYWx1ZShyZXNvbHZlKGRlZi52YWx1ZSksIGRlZi50cmFuc2Zvcm1hdGlvbnMpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZnJvemVuU2hhZG93ID0gJ2luc2V0IDAgMCAwIDNweCAjMzU5MGRmJ1xyXG5cclxuICAgIGZ1bmN0aW9uIGJveE5vZGUocmVmKSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IGRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXVxyXG4gICAgICAgIGNvbnN0IHN0eWxlID0gcmVzb2x2ZShub2RlLnN0eWxlKVxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSB7XHJcbiAgICAgICAgICAgIHN0eWxlOiBmcm96ZW4gJiYgc2VsZWN0ZWROb2RlSW5EZXZlbG9wbWVudC5pZCA9PT0gcmVmLmlkID8gey4uLnN0eWxlLCB0cmFuc2l0aW9uOidib3gtc2hhZG93IDAuMnMnLCBib3hTaGFkb3c6IHN0eWxlLmJveFNoYWRvdyA/IHN0eWxlLmJveFNoYWRvdyArICcgLCAnICsgZnJvemVuU2hhZG93OiBmcm96ZW5TaGFkb3cgfSA6IHN0eWxlLFxyXG4gICAgICAgICAgICBvbjogZnJvemVuID9cclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZW92ZXI6IHNlbGVjdEhvdmVyQWN0aXZlID8gW3NlbGVjdE5vZGVIb3ZlciwgcmVmXTogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBbc2VsZWN0Tm9kZUNsaWNrLCByZWZdXHJcbiAgICAgICAgICAgICAgICB9OntcclxuICAgICAgICAgICAgICAgICAgICBjbGljazogbm9kZS5jbGljayA/IFtlbWl0RXZlbnQsIG5vZGUuY2xpY2tdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGRibGNsaWNrOiBub2RlLmRibGNsaWNrID8gW2VtaXRFdmVudCwgbm9kZS5kYmxjbGlja10gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VvdmVyOiBub2RlLm1vdXNlb3ZlciA/IFtlbWl0RXZlbnQsIG5vZGUubW91c2VvdmVyXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZW91dDogbm9kZS5tb3VzZW91dCA/IFtlbWl0RXZlbnQsIG5vZGUubW91c2VvdXRdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGgoJ2RpdicsIGRhdGEsIGZsYXR0ZW4obm9kZS5jaGlsZHJlbi5tYXAocmVzb2x2ZSkpKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGlmTm9kZShyZWYpIHtcclxuICAgICAgICBjb25zdCBub2RlID0gZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdXHJcbiAgICAgICAgcmV0dXJuIHJlc29sdmUobm9kZS52YWx1ZSkgPyBub2RlLmNoaWxkcmVuLm1hcChyZXNvbHZlKTogW11cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB0ZXh0Tm9kZShyZWYpIHtcclxuICAgICAgICBjb25zdCBub2RlID0gZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdXHJcbiAgICAgICAgY29uc3Qgc3R5bGUgPSByZXNvbHZlKG5vZGUuc3R5bGUpXHJcbiAgICAgICAgY29uc3QgZGF0YSA9IHtcclxuICAgICAgICAgICAgc3R5bGU6IGZyb3plbiAmJiBzZWxlY3RlZE5vZGVJbkRldmVsb3BtZW50LmlkID09PSByZWYuaWQgPyB7Li4uc3R5bGUsIHRyYW5zaXRpb246J2JveC1zaGFkb3cgMC4ycycsIGJveFNoYWRvdzogc3R5bGUuYm94U2hhZG93ID8gc3R5bGUuYm94U2hhZG93ICsgJyAsICcgKyBmcm96ZW5TaGFkb3c6IGZyb3plblNoYWRvdyB9IDogc3R5bGUsXHJcbiAgICAgICAgICAgIG9uOiBmcm96ZW4gP1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlb3Zlcjogc2VsZWN0SG92ZXJBY3RpdmUgPyBbc2VsZWN0Tm9kZUhvdmVyLCByZWZdOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xpY2s6IFtzZWxlY3ROb2RlQ2xpY2ssIHJlZl1cclxuICAgICAgICAgICAgICAgIH06e1xyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBub2RlLmNsaWNrID8gW2VtaXRFdmVudCwgbm9kZS5jbGlja10gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgZGJsY2xpY2s6IG5vZGUuZGJsY2xpY2sgPyBbZW1pdEV2ZW50LCBub2RlLmRibGNsaWNrXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZW92ZXI6IG5vZGUubW91c2VvdmVyID8gW2VtaXRFdmVudCwgbm9kZS5tb3VzZW92ZXJdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlb3V0OiBub2RlLm1vdXNlb3V0ID8gW2VtaXRFdmVudCwgbm9kZS5tb3VzZW91dF0gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaCgnc3BhbicsIGRhdGEsIHJlc29sdmUobm9kZS52YWx1ZSkpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW1hZ2VOb2RlKHJlZikge1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBkZWZpbml0aW9uW3JlZi5yZWZdW3JlZi5pZF1cclxuICAgICAgICBjb25zdCBzdHlsZSA9IHJlc29sdmUobm9kZS5zdHlsZSlcclxuICAgICAgICBjb25zdCBkYXRhID0ge1xyXG4gICAgICAgICAgICBhdHRyczoge1xyXG4gICAgICAgICAgICAgICAgc3JjOiByZXNvbHZlKG5vZGUuc3JjKVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzdHlsZTogZnJvemVuICYmIHNlbGVjdGVkTm9kZUluRGV2ZWxvcG1lbnQuaWQgPT09IHJlZi5pZCA/IHsuLi5zdHlsZSwgdHJhbnNpdGlvbjonYm94LXNoYWRvdyAwLjJzJywgYm94U2hhZG93OiBzdHlsZS5ib3hTaGFkb3cgPyBzdHlsZS5ib3hTaGFkb3cgKyAnICwgJyArIGZyb3plblNoYWRvdzogZnJvemVuU2hhZG93IH0gOiBzdHlsZSxcclxuICAgICAgICAgICAgb246IGZyb3plbiA/XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VvdmVyOiBzZWxlY3RIb3ZlckFjdGl2ZSA/IFtzZWxlY3ROb2RlSG92ZXIsIHJlZl06IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBjbGljazogW3NlbGVjdE5vZGVDbGljaywgcmVmXVxyXG4gICAgICAgICAgICAgICAgfTp7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xpY2s6IG5vZGUuY2xpY2sgPyBbZW1pdEV2ZW50LCBub2RlLmNsaWNrXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBkYmxjbGljazogbm9kZS5kYmxjbGljayA/IFtlbWl0RXZlbnQsIG5vZGUuZGJsY2xpY2tdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlb3Zlcjogbm9kZS5tb3VzZW92ZXIgPyBbZW1pdEV2ZW50LCBub2RlLm1vdXNlb3Zlcl0gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VvdXQ6IG5vZGUubW91c2VvdXQgPyBbZW1pdEV2ZW50LCBub2RlLm1vdXNlb3V0XSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBoKCdpbWcnLCBkYXRhKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGlucHV0Tm9kZShyZWYpIHtcclxuICAgICAgICBjb25zdCBub2RlID0gZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdXHJcbiAgICAgICAgY29uc3Qgc3R5bGUgPSByZXNvbHZlKG5vZGUuc3R5bGUpXHJcbiAgICAgICAgY29uc3QgZGF0YSA9IHtcclxuICAgICAgICAgICAgc3R5bGU6IGZyb3plbiAmJiBzZWxlY3RlZE5vZGVJbkRldmVsb3BtZW50LmlkID09PSByZWYuaWQgPyB7Li4uc3R5bGUsIHRyYW5zaXRpb246J2JveC1zaGFkb3cgMC4ycycsIGJveFNoYWRvdzogc3R5bGUuYm94U2hhZG93ID8gc3R5bGUuYm94U2hhZG93ICsgJyAsICcgKyBmcm96ZW5TaGFkb3c6IGZyb3plblNoYWRvdyB9IDogc3R5bGUsXHJcbiAgICAgICAgICAgIG9uOiBmcm96ZW4gP1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlb3Zlcjogc2VsZWN0SG92ZXJBY3RpdmUgPyBbc2VsZWN0Tm9kZUhvdmVyLCByZWZdOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xpY2s6IFtzZWxlY3ROb2RlQ2xpY2ssIHJlZl1cclxuICAgICAgICAgICAgICAgIH06e1xyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBub2RlLmNsaWNrID8gW2VtaXRFdmVudCwgbm9kZS5jbGlja10gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IG5vZGUuaW5wdXQgPyBbZW1pdEV2ZW50LCBub2RlLmlucHV0XSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBkYmxjbGljazogbm9kZS5kYmxjbGljayA/IFtlbWl0RXZlbnQsIG5vZGUuZGJsY2xpY2tdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlb3Zlcjogbm9kZS5tb3VzZW92ZXIgPyBbZW1pdEV2ZW50LCBub2RlLm1vdXNlb3Zlcl0gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VvdXQ6IG5vZGUubW91c2VvdXQgPyBbZW1pdEV2ZW50LCBub2RlLm1vdXNlb3V0XSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBmb2N1czogbm9kZS5mb2N1cyA/IFtlbWl0RXZlbnQsIG5vZGUuZm9jdXNdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGJsdXI6IG5vZGUuYmx1ciA/IFtlbWl0RXZlbnQsIG5vZGUuYmx1cl0gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHJlc29sdmUobm9kZS52YWx1ZSksXHJcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogbm9kZS5wbGFjZWhvbGRlclxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBoKCdpbnB1dCcsIGRhdGEpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbGlzdE5vZGUocmVmKSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IGRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXVxyXG4gICAgICAgIGNvbnN0IGxpc3QgPSByZXNvbHZlKG5vZGUudmFsdWUpXHJcblxyXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gT2JqZWN0LmtleXMobGlzdCkubWFwKGtleT0+bGlzdFtrZXldKS5tYXAoKHZhbHVlLCBpbmRleCk9PiB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRNYXBWYWx1ZVtyZWYuaWRdID0gdmFsdWVcclxuICAgICAgICAgICAgY3VycmVudE1hcEluZGV4W3JlZi5pZF0gPSBpbmRleFxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG5vZGUuY2hpbGRyZW4ubWFwKHJlc29sdmUpXHJcbiAgICAgICAgfSlcclxuICAgICAgICBkZWxldGUgY3VycmVudE1hcFZhbHVlW3JlZi5pZF07XHJcbiAgICAgICAgZGVsZXRlIGN1cnJlbnRNYXBJbmRleFtyZWYuaWRdO1xyXG5cclxuICAgICAgICByZXR1cm4gY2hpbGRyZW5cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBsaXN0ZW5lcnMgPSBbXVxyXG5cclxuICAgIGZ1bmN0aW9uIGFkZExpc3RlbmVyKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gbGlzdGVuZXJzLnB1c2goY2FsbGJhY2spXHJcblxyXG4gICAgICAgIC8vIGZvciB1bnN1YnNjcmliaW5nXHJcbiAgICAgICAgcmV0dXJuICgpID0+IGxpc3RlbmVycy5zcGxpY2UobGVuZ3RoIC0gMSwgMSlcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBlbWl0RXZlbnQoZXZlbnRSZWYsIGUpIHtcclxuICAgICAgICBjb25zdCBldmVudElkID0gZXZlbnRSZWYuaWRcclxuICAgICAgICBjb25zdCBldmVudCA9IGRlZmluaXRpb24uZXZlbnRbZXZlbnRJZF1cclxuICAgICAgICBjdXJyZW50RXZlbnQgPSBlXHJcbiAgICAgICAgZXZlbnQuZGF0YS5mb3JFYWNoKChyZWYpPT57XHJcbiAgICAgICAgICAgIGlmKHJlZi5pZCA9PT0gJ19pbnB1dCcpe1xyXG4gICAgICAgICAgICAgICAgZXZlbnREYXRhW3JlZi5pZF0gPSBlLnRhcmdldC52YWx1ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICBjb25zdCBwcmV2aW91c1N0YXRlID0gY3VycmVudFN0YXRlXHJcbiAgICAgICAgbGV0IG11dGF0aW9ucyA9IHt9XHJcbiAgICAgICAgZGVmaW5pdGlvbi5ldmVudFtldmVudElkXS5tdXRhdG9ycy5mb3JFYWNoKChyZWYpPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBtdXRhdG9yID0gZGVmaW5pdGlvbi5tdXRhdG9yW3JlZi5pZF1cclxuICAgICAgICAgICAgY29uc3Qgc3RhdGUgPSBtdXRhdG9yLnN0YXRlXHJcbiAgICAgICAgICAgIG11dGF0aW9uc1tzdGF0ZS5pZF0gPSByZXNvbHZlKG11dGF0b3IubXV0YXRpb24pXHJcbiAgICAgICAgfSlcclxuICAgICAgICBjdXJyZW50U3RhdGUgPSBPYmplY3QuYXNzaWduKHt9LCBjdXJyZW50U3RhdGUsIG11dGF0aW9ucylcclxuICAgICAgICBsaXN0ZW5lcnMuZm9yRWFjaChjYWxsYmFjayA9PiBjYWxsYmFjayhldmVudElkLCBldmVudERhdGEsIGUsIHByZXZpb3VzU3RhdGUsIGN1cnJlbnRTdGF0ZSwgbXV0YXRpb25zKSlcclxuICAgICAgICBjdXJyZW50RXZlbnQgPSB7fVxyXG4gICAgICAgIGV2ZW50RGF0YSA9IHt9XHJcbiAgICAgICAgaWYoT2JqZWN0LmtleXMobXV0YXRpb25zKS5sZW5ndGgpe1xyXG4gICAgICAgICAgICByZW5kZXIoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBsZXQgdmRvbSA9IHJlc29sdmUoe3JlZjondk5vZGVCb3gnLCBpZDonX3Jvb3ROb2RlJ30pXHJcbiAgICBmdW5jdGlvbiByZW5kZXIobmV3RGVmaW5pdGlvbikge1xyXG4gICAgICAgIGlmKG5ld0RlZmluaXRpb24pe1xyXG4gICAgICAgICAgICBpZihkZWZpbml0aW9uLnN0YXRlICE9PSBuZXdEZWZpbml0aW9uLnN0YXRlKXtcclxuICAgICAgICAgICAgICAgIGRlZmluaXRpb24gPSBuZXdEZWZpbml0aW9uXHJcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdTdGF0ZSA9IE9iamVjdC5rZXlzKGRlZmluaXRpb24uc3RhdGUpLm1hcChrZXk9PmRlZmluaXRpb24uc3RhdGVba2V5XSkucmVkdWNlKChhY2MsIGRlZik9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWNjW2RlZi5yZWZdID0gZGVmLmRlZmF1bHRWYWx1ZVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhY2NcclxuICAgICAgICAgICAgICAgIH0sIHt9KVxyXG4gICAgICAgICAgICAgICAgY3VycmVudFN0YXRlID0gey4uLm5ld1N0YXRlLCAuLi5jdXJyZW50U3RhdGV9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkZWZpbml0aW9uID0gbmV3RGVmaW5pdGlvblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IG5ld3Zkb20gPSByZXNvbHZlKHtyZWY6J3ZOb2RlQm94JywgaWQ6J19yb290Tm9kZSd9KVxyXG4gICAgICAgIHBhdGNoKHZkb20sIG5ld3Zkb20pXHJcbiAgICAgICAgdmRvbSA9IG5ld3Zkb21cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBfZnJlZXplKGlzRnJvemVuLCBjYWxsYmFjaywgbm9kZUlkKSB7XHJcbiAgICAgICAgZnJvemVuQ2FsbGJhY2sgPSBjYWxsYmFja1xyXG4gICAgICAgIHNlbGVjdGVkTm9kZUluRGV2ZWxvcG1lbnQgPSBub2RlSWRcclxuICAgICAgICBpZihmcm96ZW4gPT09IGZhbHNlICYmIGlzRnJvemVuID09PSB0cnVlKXtcclxuICAgICAgICAgICAgc2VsZWN0SG92ZXJBY3RpdmUgPSB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKGZyb3plbiB8fCBmcm96ZW4gIT09IGlzRnJvemVuKXtcclxuICAgICAgICAgICAgZnJvemVuID0gaXNGcm96ZW5cclxuICAgICAgICAgICAgcmVuZGVyKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0Q3VycmVudFN0YXRlKCkge1xyXG4gICAgICAgIHJldHVybiBjdXJyZW50U3RhdGVcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzZXRDdXJyZW50U3RhdGUobmV3U3RhdGUpIHtcclxuICAgICAgICBjdXJyZW50U3RhdGUgPSBuZXdTdGF0ZVxyXG4gICAgICAgIHJlbmRlcigpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY3JlYXRlRGVmYXVsdFN0YXRlKCkge1xyXG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyhkZWZpbml0aW9uLnN0YXRlKS5tYXAoa2V5PT5kZWZpbml0aW9uLnN0YXRlW2tleV0pLnJlZHVjZSgoYWNjLCBkZWYpPT4ge1xyXG4gICAgICAgICAgICBhY2NbZGVmLnJlZl0gPSBkZWYuZGVmYXVsdFZhbHVlXHJcbiAgICAgICAgICAgIHJldHVybiBhY2NcclxuICAgICAgICB9LCB7fSlcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGRlZmluaXRpb24sXHJcbiAgICAgICAgdmRvbSxcclxuICAgICAgICBnZXRDdXJyZW50U3RhdGUsXHJcbiAgICAgICAgc2V0Q3VycmVudFN0YXRlLFxyXG4gICAgICAgIHJlbmRlcixcclxuICAgICAgICBlbWl0RXZlbnQsXHJcbiAgICAgICAgYWRkTGlzdGVuZXIsXHJcbiAgICAgICAgX2ZyZWV6ZSxcclxuICAgICAgICBfcmVzb2x2ZTogcmVzb2x2ZSxcclxuICAgICAgICBjcmVhdGVEZWZhdWx0U3RhdGVcclxuICAgIH1cclxufSIsIm1vZHVsZS5leHBvcnRzPXtcclxuICBcImV2ZW50RGF0YVwiOiB7XHJcbiAgICBcIl9pbnB1dFwiOiB7XHJcbiAgICAgIFwidGl0bGVcIjogXCJpbnB1dCB2YWx1ZVwiLFxyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCJcclxuICAgIH1cclxuICB9LFxyXG4gIFwidG9Mb3dlckNhc2VcIjoge30sXHJcbiAgXCJ0b1VwcGVyQ2FzZVwiOiB7fSxcclxuICBcImNvbmRpdGlvbmFsXCI6IHt9LFxyXG4gIFwiZXF1YWxcIjoge1xyXG4gICAgXCJhNzI1MWFmMC01MGE3LTQ4MjMtODVhMC02NmNlMDlkOGEzY2NcIjoge1xyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiZWUyNDIzZTYtNWI0OC00MWFlLThjY2YtNmEyYzdiNDZkMmY4XCJcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCJub3RcIjoge30sXHJcbiAgXCJsaXN0XCI6IHt9LFxyXG4gIFwidG9UZXh0XCI6IHtcclxuICAgIFwiN2JzOWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHt9XHJcbiAgfSxcclxuICBcImxpc3RWYWx1ZVwiOiB7XHJcbiAgICBcInB6N2hkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcIm51bWJlclwiLFxyXG4gICAgICBcImxpc3RcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwidk5vZGVMaXN0XCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImZsODlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwicHJvcGVydHlcIjogXCJ4XCJcclxuICAgIH0sXHJcbiAgICBcImhqOXdkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcIm51bWJlclwiLFxyXG4gICAgICBcImxpc3RcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwidk5vZGVMaXN0XCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImZsODlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwicHJvcGVydHlcIjogXCJ5XCJcclxuICAgIH0sXHJcbiAgICBcImhocjhiNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJsaXN0XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInZOb2RlTGlzdFwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJmbDg5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjVcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInByb3BlcnR5XCI6IFwiY29sb3JcIlxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCJwaXBlXCI6IHtcclxuICAgIFwiZnc4amQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiTnVtYmVyIGN1cnJlbnRseSBpczogXCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcImpvaW5cIixcclxuICAgICAgICAgIFwiaWRcIjogXCJwOXMzZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgXCJyZWZcIjogXCJqb2luXCIsXHJcbiAgICAgICAgICBcImlkXCI6IFwiOGE2Y2Q2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICBcInVtNWVkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJzdGF0ZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgXCJyZWZcIjogXCJ0b1RleHRcIixcclxuICAgICAgICAgIFwiaWRcIjogXCI3YnM5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIFwidWk4amQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiK1wiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiYzh3ZWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiLVwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwicGRxNmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwibnVtYmVyXCIsXHJcbiAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwic3RhdGVcIixcclxuICAgICAgICBcImlkXCI6IFwiNDZ2ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfSxcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwicmVmXCI6IFwiYWRkXCIsXHJcbiAgICAgICAgICBcImlkXCI6IFwidzg2ZmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICBcIjQ1MnFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcIm51bWJlclwiLFxyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInN0YXRlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjQ2dmRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcInN1YnRyYWN0XCIsXHJcbiAgICAgICAgICBcImlkXCI6IFwidTQzd2Q2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICBcImV3ODNkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcIm51bWJlclwiLFxyXG4gICAgICBcInZhbHVlXCI6IDEsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJ3M2U5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJudW1iZXJcIixcclxuICAgICAgXCJ2YWx1ZVwiOiAxLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiM3FraWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IDAsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcImFkZFwiLFxyXG4gICAgICAgICAgXCJpZFwiOiBcIndicjdkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcInRvVGV4dFwiLFxyXG4gICAgICAgICAgXCJpZFwiOiBcIm5vb3BcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgXCJyZWZcIjogXCJqb2luXCIsXHJcbiAgICAgICAgICBcImlkXCI6IFwiczI1OGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICB9XHJcbiAgICAgIF1cclxuICAgIH0sXHJcbiAgICBcInQ3dnFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiAwLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgXCJyZWZcIjogXCJhZGRcIixcclxuICAgICAgICAgIFwiaWRcIjogXCJ2cThkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgXCJyZWZcIjogXCJ0b1RleHRcIixcclxuICAgICAgICAgIFwiaWRcIjogXCJub29wXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwicmVmXCI6IFwiam9pblwiLFxyXG4gICAgICAgICAgXCJpZFwiOiBcIndmOWFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgXCI3ZGJ2ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwibGlzdFZhbHVlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImhqOXdkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCI4ZDR2ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwibGlzdFZhbHVlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcInB6N2hkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCI4Y3E2YjZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwibGlzdFZhbHVlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImhocjhiNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJmOXF4ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0YWJsZVwiLFxyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInN0YXRlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImM4cTlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJxd3c5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCJweFwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwicWR3N2M2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwicHhcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcIjg0MzY5YWJhLTRhNGQtNDkzMi04YTlhLThmOWNhOTQ4YjZhMlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIlRoZSBudW1iZXIgaXMgZXZlbiDwn46JXCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJjMmZiOWE5Yi0yNWJiLTRlOGItODBjMC1jZjUxYjg1MDYwNzBcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJib29sZWFuXCIsXHJcbiAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwic3RhdGVcIixcclxuICAgICAgICBcImlkXCI6IFwiNDZ2ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfSxcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwicmVmXCI6IFwicmVtYWluZGVyXCIsXHJcbiAgICAgICAgICBcImlkXCI6IFwiMzQ3ODBkMjItZjUyMS00YzMwLTg5YTUtM2U3ZjViNWFmN2MyXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwicmVmXCI6IFwiZXF1YWxcIixcclxuICAgICAgICAgIFwiaWRcIjogXCJhNzI1MWFmMC01MGE3LTQ4MjMtODVhMC02NmNlMDlkOGEzY2NcIlxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIFwiMTIyOWQ0NzgtYmMyNS00NDAxLThhODktNzRmYzZjZmU4OTk2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwibnVtYmVyXCIsXHJcbiAgICAgIFwidmFsdWVcIjogMixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcImVlMjQyM2U2LTViNDgtNDFhZS04Y2NmLTZhMmM3YjQ2ZDJmOFwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcIm51bWJlclwiLFxyXG4gICAgICBcInZhbHVlXCI6IDAsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCI5NDVmMDgxOC03NzQzLTRlZGQtOGM3Ni0zZGQ1YThiYTdmYTlcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCInQ29tZm9ydGFhJywgY3Vyc2l2ZVwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiYTYwODk5ZWUtOTkyNS00ZTA1LTg5MGUtYjk0MjhiMDJkYmY5XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiI2Y1ZjVmNVwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiMWU0NjU0MDMtNTM4Mi00YTQ1LTg5ZGEtOGQ4OGUyZWIyZmI5XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiMTAwJVwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiZWYyZWMxODQtMTk5Zi00ZWU4LThlMzAtYjk5ZGJjMWRmNWRiXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiMTBweFwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiZmFiMjg2YzQtZGVkMy00YTVlLTg3NDktNzY3OGFiY2JiMTI1XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiMTBweCA1cHhcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcIjcwM2Y4ZTAyLWM1YzMtNGQyNy04Y2EyLTcyMmM0ZDBkMWVhMFwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIjEwcHggMTVweFwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiOGYzYzY2MzAtZDhkOS00YmMxLThhM2QtYmE0ZGFkMzA5MWYwXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiI2FhYWFhYVwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiZDMxYzQ3NDYtMjMyOS00NDA0LTg2ODktZmJmMjM5M2VmZDQ0XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiaW5saW5lLWJsb2NrXCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCI0MTY4NWFkYy0zNzkzLTQ1NjYtOGY2MS0yYzJhNDJmZGY4NmVcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCI1cHhcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcImQ1NzU0ZmRiLTQ2ODktNGY4Ny04N2ZjLTUxZDYwMDIyYjMyY1wiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIjNweFwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiMGJjNmExOGMtMTc2Ni00MmJkLThiNGEtMjAyYTJiMGMzNGZlXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwicG9pbnRlclwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiOWIyNTBlZjgtYzFiZS00NzA2LThhNzEtZjQ0NGYxOGYwZjgyXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwibm9uZVwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiYjBhMTA0OTctZWMyNi00ZmY3LTg3MzktYTE5Mzc1NWNiY2FlXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiMTBweCA1cHhcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcIjg3NjRlMjU4LTU5OWQtNDI1Mi04MTEyLWQwNmZjZDBkNWUyYVwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIjEwcHggMTVweFwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiOGNhYWY4NzYtMTBiYy00N2RlLTg5ZDktODY5Yzg5MmNkNGNlXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiIzk5OTk5OVwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiYWU5ODdiYmEtNzM0YS00NmFlLThjODItYzA0ODk2MjIxMTc5XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiaW5saW5lLWJsb2NrXCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJmMDA5MGY4ZC04N2I0LTRkODMtOGE1My0wMzliMjFlMmI1OTRcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCI1cHhcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcImI3Yzc5MWE2LTJjOTEtNGI2Mi04ODIwLWRiYWFmOWQ1YzE3OVwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIjNweFwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiZDc5NWE1MTAtY2NmOS00ZDkyLTgxZWUtNWU1MTJiODFlZTU4XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwicG9pbnRlclwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiNzUxODUyNGEtMGJjMi00NjVjLTgxNGUtMGE1ZDM5ZGUyNWUzXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiMTBweCA1cHhcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcImIyNGIxYzE4LThhODItNGM4Zi04MTgwLTZkMDYyYzc4YzlkOVwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIm5vbmVcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcIjY3ZjcwZDk3LWEzNDYtNDJlNC04MzNmLTZlYWVhZWVkNGZlZlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIjEwcHggMTBweCAxMHB4IDBcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcIjk4MjU3NDYxLTkyOGUtNGZmOS04YWM1LTBiODkyOThlNGVmMVwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIjEwcHggMTBweCAxMHB4IDBcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcIjk5MzFmZTZhLTA3NGUtNGNiNy04MzU1LWMxOGQ4MTg2NzlhN1wiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIjEwcHhcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcIjcyYjU1OWU5LTI1NDYtNGJhZS04YTYxLTU1NTU2NzM2M2IxMVwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcInJpZ2h0XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCIzMGY4YzcwMS03YWRmLTQzOTgtODYyZS01NTM3MmUyOWMxNGRcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCI1MHB4XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCI2NjM1ZGJiMi1iMzY0LTRlZmQtODA2MS0yNjQzMjAwN2ViMWFcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCJyaWdodFwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiMDQyY2NmN2QtODE5Yi00ZmFjLTgyODItMmYxOTA2OWI1Mzg2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiNTAwcHhcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcImU3YmM2ZTIwLTE1MTAtNGJhYy04NTlmLTA0ZWMzZGNkYTY2YlwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIjEuNVwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiZWY4ZGM5YzYtZjMzMy00YjYxLThkMjUtZDM2YWZlNTE3NTIwXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiMTBweFwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiNzU1YTcwYTItZDE4MS00ZmFmLTg1OTMtNWFiNzYwMTE1OGY5XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiYmxvY2tcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcIjlmNTAxYzM1LTU0YjMtNGM2MC04ZmM0LWQ2YTQ1ZTc3NmViM1wiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIjEwcHhcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcImU4YWNjNmIwLWQxZGUtNDQzYi04MTI4LWRmNmI1MTg2ZjcwY1wiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcImJsb2NrXCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCI3MTc2NDM2Mi1lMDlhLTQ0MTItOGZiYy1lZDNjYjRkNGM5NTRcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCIxMHB4XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJjMTk5YjE5MS04OGQyLTQ2M2QtODU2NC0xY2UxYTE2MzFiMmRcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCJibG9ja1wiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiYjIxMTdlNmItYWNlNy00ZTc1LThlN2QtMzIzNjY4ZDFiMTlkXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiMTBweFwiLFxyXG4gICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgfSxcclxuICAgIFwiOGE1Mzg0OGQtOGM3ZC00NGRjLThkMTMtYWUwNjAxMDdjODBiXCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICBcInZhbHVlXCI6IFwiYmxvY2tcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcIjE5MDZiNWI0LTYwMjQtNDhmMS04NGRhLWMzMzJlNTU1YWZiM1wiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcIjEwcHhcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcImE1NjU2OTZkLThhNjAtNDE2ZS04NDRhLTYwYzhmMmZlOGM1YVwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcImJsb2NrXCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCIxNWQ0N2IwNy0zOTZjLTRjMDMtODU5MS1mNDcyNTk4ZjE1ZTJcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCIxMHB4XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJhOGY1YzFjZS03ODNiLTQ2MjYtODI2YS00NzNhYjQzNGMwYjJcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCIxMHB4XCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCJhOWN3OWE5Yi0yNWJiLTRlOGItODBjMC1jZjUxYjg1MDYwNzBcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCJodHRwczovL3VwbG9hZC53aWtpbWVkaWEub3JnL3dpa2lwZWRpYS9jb21tb25zL3RodW1iLzkvOWEvU2Nob25hY2hfLV9QYXJhZGllc18tX1Nvbm5lbmF1ZmdhbmcuanBnLzEyODBweC1TY2hvbmFjaF8tX1BhcmFkaWVzXy1fU29ubmVuYXVmZ2FuZy5qcGdcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH0sXHJcbiAgICBcImQxMzE0Mjc0LTVlZmMtNGJlMS04MzBiLTBmZjhjOTJiNTAyOVwiOiB7XHJcbiAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgXCJ2YWx1ZVwiOiBcImJsb2NrXCIsXHJcbiAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCI5cWM4NDI3NC01ZWZjLTRiZTEtODMwYi0wZmY4YzkyYjUwMjlcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgIFwidmFsdWVcIjogXCJcIixcclxuICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgIH1cclxuICB9LFxyXG4gIFwiam9pblwiOiB7XHJcbiAgICBcInA5czNkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJ1bTVlZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJ3ZjlhZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwicXd3OWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiczI1OGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcInFkdzdjNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcIjhhNmNkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI5cWM4NDI3NC01ZWZjLTRiZTEtODMwYi0wZmY4YzkyYjUwMjlcIlxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICBcImFkZFwiOiB7XHJcbiAgICBcInc4NmZkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJldzgzZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJ3YnI3ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiOGQ0dmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwidnE4ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjdkYnZkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIFwic3VidHJhY3RcIjoge1xyXG4gICAgXCJ1NDN3ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwidzNlOWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCJyZW1haW5kZXJcIjoge1xyXG4gICAgXCIzNDc4MGQyMi1mNTIxLTRjMzAtODlhNS0zZTdmNWI1YWY3YzJcIjoge1xyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiMTIyOWQ0NzgtYmMyNS00NDAxLThhODktNzRmYzZjZmU4OTk2XCJcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCJ2Tm9kZUJveFwiOiB7XHJcbiAgICBcIl9yb290Tm9kZVwiOiB7XHJcbiAgICAgIFwidGl0bGVcIjogXCJhcHBcIixcclxuICAgICAgXCJzdHlsZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJzdHlsZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJfcm9vdFN0eWxlXCJcclxuICAgICAgfSxcclxuICAgICAgXCJwYXJlbnRcIjoge30sXHJcbiAgICAgIFwiY2hpbGRyZW5cIjogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwicmVmXCI6IFwidk5vZGVUZXh0XCIsXHJcbiAgICAgICAgICBcImlkXCI6IFwiMjQ3MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwicmVmXCI6IFwidk5vZGVUZXh0XCIsXHJcbiAgICAgICAgICBcImlkXCI6IFwiMTQ4MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwicmVmXCI6IFwidk5vZGVUZXh0XCIsXHJcbiAgICAgICAgICBcImlkXCI6IFwiMzQ4MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwicmVmXCI6IFwidk5vZGVJZlwiLFxyXG4gICAgICAgICAgXCJpZFwiOiBcIjU3ODdjMTVhLTQyNmItNDFlYi04MzFkLWUzZTA3NDE1OTU4MlwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcInZOb2RlSW1hZ2VcIixcclxuICAgICAgICAgIFwiaWRcIjogXCJzZDh2YzE1YS00MjZiLTQxZWItODMxZC1lM2UwNzQxNTk1ODJcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZUxpc3RcIixcclxuICAgICAgICAgIFwiaWRcIjogXCJmbDg5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjVcIlxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgfSxcclxuICAgIFwiZ3c5ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0aXRsZVwiOiBcImJveFwiLFxyXG4gICAgICBcInN0eWxlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInN0eWxlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImZxOWRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwicGFyZW50XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInZOb2RlTGlzdFwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJmbDg5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjVcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImNoaWxkcmVuXCI6IFtdXHJcbiAgICB9XHJcbiAgfSxcclxuICBcInZOb2RlVGV4dFwiOiB7XHJcbiAgICBcIjI0NzFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiOiB7XHJcbiAgICAgIFwidGl0bGVcIjogXCJOdW1iZXIgY3VycmVudGx5XCIsXHJcbiAgICAgIFwic3R5bGVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwic3R5bGVcIixcclxuICAgICAgICBcImlkXCI6IFwiODQ4MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfSxcclxuICAgICAgXCJwYXJlbnRcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwidk5vZGVCb3hcIixcclxuICAgICAgICBcImlkXCI6IFwiX3Jvb3ROb2RlXCJcclxuICAgICAgfSxcclxuICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImZ3OGpkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcIjE0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiOiB7XHJcbiAgICAgIFwidGl0bGVcIjogXCIrIGJ1dHRvblwiLFxyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwidWk4amQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfSxcclxuICAgICAgXCJzdHlsZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJzdHlsZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI5NDgxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInBhcmVudFwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZUJveFwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJfcm9vdE5vZGVcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImNsaWNrXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcImV2ZW50XCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImQ0OHJkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcIjM0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiOiB7XHJcbiAgICAgIFwidGl0bGVcIjogXCItIGJ1dHRvblwiLFxyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiYzh3ZWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfSxcclxuICAgICAgXCJzdHlsZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJzdHlsZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI3NDgxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInBhcmVudFwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZUJveFwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJfcm9vdE5vZGVcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImNsaWNrXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcImV2ZW50XCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjNhNTRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcImU4YWRkMWM3LThhMDEtNDE2NC04NjA0LTcyMmQ4YWI1MjlmMVwiOiB7XHJcbiAgICAgIFwidGl0bGVcIjogXCJpcyBldmVuXCIsXHJcbiAgICAgIFwic3R5bGVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwic3R5bGVcIixcclxuICAgICAgICBcImlkXCI6IFwiNGRjYTczYjMtOTBlYi00MWU3LTg2NTEtMmJkY2M5M2YzODcxXCJcclxuICAgICAgfSxcclxuICAgICAgXCJwYXJlbnRcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwidk5vZGVJZlwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI1Nzg3YzE1YS00MjZiLTQxZWItODMxZC1lM2UwNzQxNTk1ODJcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiODQzNjlhYmEtNGE0ZC00OTMyLThhOWEtOGY5Y2E5NDhiNmEyXCJcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCJ2Tm9kZUlucHV0XCI6IHt9LFxyXG4gIFwidk5vZGVMaXN0XCI6IHtcclxuICAgIFwiZmw4OWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCI6IHtcclxuICAgICAgXCJ0aXRsZVwiOiBcImxpc3Qgb2YgYm94ZXNcIixcclxuICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImY5cXhkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwicGFyZW50XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInZOb2RlQm94XCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIl9yb290Tm9kZVwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiY2hpbGRyZW5cIjogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwicmVmXCI6IFwidk5vZGVCb3hcIixcclxuICAgICAgICAgIFwiaWRcIjogXCJndzlkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgIH1cclxuICAgICAgXVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgXCJ2Tm9kZUlmXCI6IHtcclxuICAgIFwiNTc4N2MxNWEtNDI2Yi00MWViLTgzMWQtZTNlMDc0MTU5NTgyXCI6IHtcclxuICAgICAgXCJ0aXRsZVwiOiBcImlzIG51bWJlciBldmVuXCIsXHJcbiAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJjMmZiOWE5Yi0yNWJiLTRlOGItODBjMC1jZjUxYjg1MDYwNzBcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInBhcmVudFwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZUJveFwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJfcm9vdE5vZGVcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImNoaWxkcmVuXCI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcInZOb2RlVGV4dFwiLFxyXG4gICAgICAgICAgXCJpZFwiOiBcImU4YWRkMWM3LThhMDEtNDE2NC04NjA0LTcyMmQ4YWI1MjlmMVwiXHJcbiAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9XHJcbiAgfSxcclxuICBcInZOb2RlSW1hZ2VcIjoge1xyXG4gICAgXCJzZDh2YzE1YS00MjZiLTQxZWItODMxZC1lM2UwNzQxNTk1ODJcIjoge1xyXG4gICAgICBcInRpdGxlXCI6IFwiaGlsbHNcIixcclxuICAgICAgXCJzcmNcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJhOWN3OWE5Yi0yNWJiLTRlOGItODBjMC1jZjUxYjg1MDYwNzBcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInBhcmVudFwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZUJveFwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJfcm9vdE5vZGVcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInN0eWxlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInN0eWxlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIndmOGQ3M2IzLTkwZWItNDFlNy04NjUxLTJiZGNjOTNmMzg3MVwiXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIFwic3R5bGVcIjoge1xyXG4gICAgXCJfcm9vdFN0eWxlXCI6IHtcclxuICAgICAgXCJmb250RmFtaWx5XCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiOTQ1ZjA4MTgtNzc0My00ZWRkLThjNzYtM2RkNWE4YmE3ZmE5XCJcclxuICAgICAgfSxcclxuICAgICAgXCJiYWNrZ3JvdW5kXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiYTYwODk5ZWUtOTkyNS00ZTA1LTg5MGUtYjk0MjhiMDJkYmY5XCJcclxuICAgICAgfSxcclxuICAgICAgXCJtaW5IZWlnaHRcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCIxZTQ2NTQwMy01MzgyLTRhNDUtODlkYS04ZDg4ZTJlYjJmYjlcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCI4NDgxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInBhZGRpbmdcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJlZjJlYzE4NC0xOTlmLTRlZTgtOGUzMC1iOTlkYmMxZGY1ZGJcIlxyXG4gICAgICB9LFxyXG4gICAgICBcIm1hcmdpblwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImZhYjI4NmM0LWRlZDMtNGE1ZS04NzQ5LTc2NzhhYmNiYjEyNVwiXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcIjk0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwicGFkZGluZ1wiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjcwM2Y4ZTAyLWM1YzMtNGQyNy04Y2EyLTcyMmM0ZDBkMWVhMFwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiYmFja2dyb3VuZFwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjhmM2M2NjMwLWQ4ZDktNGJjMS04YTNkLWJhNGRhZDMwOTFmMFwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiZGlzcGxheVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImQzMWM0NzQ2LTIzMjktNDQwNC04Njg5LWZiZjIzOTNlZmQ0NFwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiYm9yZGVyUmFkaXVzXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiZDU3NTRmZGItNDY4OS00Zjg3LTg3ZmMtNTFkNjAwMjJiMzJjXCJcclxuICAgICAgfSxcclxuICAgICAgXCJjdXJzb3JcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCIwYmM2YTE4Yy0xNzY2LTQyYmQtOGI0YS0yMDJhMmIwYzM0ZmVcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInVzZXJTZWxlY3RcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI5YjI1MGVmOC1jMWJlLTQ3MDYtOGE3MS1mNDQ0ZjE4ZjBmODJcIlxyXG4gICAgICB9LFxyXG4gICAgICBcIm1hcmdpblwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImIwYTEwNDk3LWVjMjYtNGZmNy04NzM5LWExOTM3NTVjYmNhZVwiXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcIjc0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwicGFkZGluZ1wiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjg3NjRlMjU4LTU5OWQtNDI1Mi04MTEyLWQwNmZjZDBkNWUyYVwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiYmFja2dyb3VuZFwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjhjYWFmODc2LTEwYmMtNDdkZS04OWQ5LTg2OWM4OTJjZDRjZVwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiZGlzcGxheVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcImFlOTg3YmJhLTczNGEtNDZhZS04YzgyLWMwNDg5NjIyMTE3OVwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiYm9yZGVyUmFkaXVzXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiYjdjNzkxYTYtMmM5MS00YjYyLTg4MjAtZGJhYWY5ZDVjMTc5XCJcclxuICAgICAgfSxcclxuICAgICAgXCJjdXJzb3JcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJkNzk1YTUxMC1jY2Y5LTRkOTItODFlZS01ZTUxMmI4MWVlNThcIlxyXG4gICAgICB9LFxyXG4gICAgICBcIm1hcmdpblwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjc1MTg1MjRhLTBiYzItNDY1Yy04MTRlLTBhNWQzOWRlMjVlM1wiXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcIjgwOTJhYzVlLWRmZDAtNDQ5Mi1hNjVkLThhYzNlZWMzMjVlMFwiOiB7XHJcbiAgICAgIFwicGFkZGluZ1wiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjY3ZjcwZDk3LWEzNDYtNDJlNC04MzNmLTZlYWVhZWVkNGZlZlwiXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcImE5NDYxZTI4LTdkOTItNDlhMC05MDAxLTIzZDc0ZTRiMzgyZFwiOiB7XHJcbiAgICAgIFwicGFkZGluZ1wiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjk4MjU3NDYxLTkyOGUtNGZmOS04YWM1LTBiODkyOThlNGVmMVwiXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcIjc2NmIxMWVjLWRhMjctNDk0Yy1iMjcyLWMyNmZlYzNmNjQ3NVwiOiB7XHJcbiAgICAgIFwicGFkZGluZ1wiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjk5MzFmZTZhLTA3NGUtNGNiNy04MzU1LWMxOGQ4MTg2NzlhN1wiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiZmxvYXRcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI3MmI1NTllOS0yNTQ2LTRiYWUtOGE2MS01NTU1NjczNjNiMTFcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInRleHRBbGlnblwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjY2MzVkYmIyLWIzNjQtNGVmZC04MDYxLTI2NDMyMDA3ZWIxYVwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwibWF4V2lkdGhcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCIwNDJjY2Y3ZC04MTliLTRmYWMtODI4Mi0yZjE5MDY5YjUzODZcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJjYmNkOGVkYi00YWEyLTQzZmUtYWQzOS1jZWU3OWI0OTAyOTVcIjoge1xyXG4gICAgICBcInBhZGRpbmdcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJlZjhkYzljNi1mMzMzLTRiNjEtOGQyNS1kMzZhZmU1MTc1MjBcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImRpc3BsYXlcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI3NTVhNzBhMi1kMTgxLTRmYWYtODU5My01YWI3NjAxMTU4ZjlcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCI2NzYzZjEwMi0yM2Y3LTQzOTAtYjQ2My00ZTFiMTRlODY2YzlcIjoge1xyXG4gICAgICBcInBhZGRpbmdcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI5ZjUwMWMzNS01NGIzLTRjNjAtOGZjNC1kNmE0NWU3NzZlYjNcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImRpc3BsYXlcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJlOGFjYzZiMC1kMWRlLTQ0M2ItODEyOC1kZjZiNTE4NmY3MGNcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCI5MWM5YWRmMC1kNjJlLTQ1ODAtOTNlNy1mMzk1OTRhZTVlN2RcIjoge1xyXG4gICAgICBcInBhZGRpbmdcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI3MTc2NDM2Mi1lMDlhLTQ0MTItOGZiYy1lZDNjYjRkNGM5NTRcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImRpc3BsYXlcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJjMTk5YjE5MS04OGQyLTQ2M2QtODU2NC0xY2UxYTE2MzFiMmRcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJlOWZiZWIzOS03MTkzLTQ1MjItOTFiMy03NjFiZDM1NjM5ZDNcIjoge1xyXG4gICAgICBcInBhZGRpbmdcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJiMjExN2U2Yi1hY2U3LTRlNzUtOGU3ZC0zMjM2NjhkMWIxOWRcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImRpc3BsYXlcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI4YTUzODQ4ZC04YzdkLTQ0ZGMtOGQxMy1hZTA2MDEwN2M4MGJcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCIzY2Y1ZDg5ZC0zNzAzLTQ4M2UtYWI2NC01YTViNzgwYWVjMjdcIjoge1xyXG4gICAgICBcInBhZGRpbmdcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCIxOTA2YjViNC02MDI0LTQ4ZjEtODRkYS1jMzMyZTU1NWFmYjNcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImRpc3BsYXlcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJhNTY1Njk2ZC04YTYwLTQxNmUtODQ0YS02MGM4ZjJmZThjNWFcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJmcTlkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInBhZGRpbmdcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCIxNWQ0N2IwNy0zOTZjLTRjMDMtODU5MS1mNDcyNTk4ZjE1ZTJcIlxyXG4gICAgICB9LFxyXG4gICAgICBcIndpZHRoXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwiM3FraWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfSxcclxuICAgICAgXCJoZWlnaHRcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJ0N3ZxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImJhY2tncm91bmRcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI4Y3E2YjZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCI0ZGNhNzNiMy05MGViLTQxZTctODY1MS0yYmRjYzkzZjM4NzFcIjoge1xyXG4gICAgICBcInBhZGRpbmdcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJhOGY1YzFjZS03ODNiLTQ2MjYtODI2YS00NzNhYjQzNGMwYjJcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJ3ZjhkNzNiMy05MGViLTQxZTctODY1MS0yYmRjYzkzZjM4NzFcIjoge1xyXG4gICAgICBcImRpc3BsYXlcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCJkMTMxNDI3NC01ZWZjLTRiZTEtODMwYi0wZmY4YzkyYjUwMjlcIlxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICBcIm5hbWVTcGFjZVwiOiB7XHJcbiAgICBcIl9yb290TmFtZVNwYWNlXCI6IHtcclxuICAgICAgXCJ0aXRsZVwiOiBcInN0YXRlXCIsXHJcbiAgICAgIFwiY2hpbGRyZW5cIjogW1xyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwicmVmXCI6IFwic3RhdGVcIixcclxuICAgICAgICAgIFwiaWRcIjogXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgXCJyZWZcIjogXCJzdGF0ZVwiLFxyXG4gICAgICAgICAgXCJpZFwiOiBcImM4cTlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9XHJcbiAgfSxcclxuICBcInN0YXRlXCI6IHtcclxuICAgIFwiNDZ2ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0aXRsZVwiOiBcIm51bWJlclwiLFxyXG4gICAgICBcInJlZlwiOiBcIjQ2dmRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiLFxyXG4gICAgICBcInR5cGVcIjogXCJudW1iZXJcIixcclxuICAgICAgXCJkZWZhdWx0VmFsdWVcIjogMCxcclxuICAgICAgXCJtdXRhdG9yc1wiOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgXCJyZWZcIjogXCJtdXRhdG9yXCIsXHJcbiAgICAgICAgICBcImlkXCI6IFwiYXM1NWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIFwicmVmXCI6IFwibXV0YXRvclwiLFxyXG4gICAgICAgICAgXCJpZFwiOiBcIjlkcThkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgfVxyXG4gICAgICBdXHJcbiAgICB9LFxyXG4gICAgXCJjOHE5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInRpdGxlXCI6IFwidGlsZXNcIixcclxuICAgICAgXCJyZWZcIjogXCJjOHE5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIixcclxuICAgICAgXCJ0eXBlXCI6IFwidGFibGVcIixcclxuICAgICAgXCJkZWZpbml0aW9uXCI6IHtcclxuICAgICAgICBcInhcIjogXCJudW1iZXJcIixcclxuICAgICAgICBcInlcIjogXCJudW1iZXJcIixcclxuICAgICAgICBcImNvbG9yXCI6IFwidGV4dFwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwiZGVmYXVsdFZhbHVlXCI6IHtcclxuICAgICAgICBcIm9wczZkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICBcInhcIjogMTIwLFxyXG4gICAgICAgICAgXCJ5XCI6IDEwMCxcclxuICAgICAgICAgIFwiY29sb3JcIjogXCIjZWFiNjVjXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwid3B2NWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgIFwieFwiOiAyMDAsXHJcbiAgICAgICAgICBcInlcIjogMTIwLFxyXG4gICAgICAgICAgXCJjb2xvclwiOiBcIiM1M0IyRURcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJxbjI3ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgXCJ4XCI6IDEzMCxcclxuICAgICAgICAgIFwieVwiOiAyMDAsXHJcbiAgICAgICAgICBcImNvbG9yXCI6IFwiIzViY2M1YlwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImNhOXJkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICBcInhcIjogMTUwLFxyXG4gICAgICAgICAgXCJ5XCI6IDE1MCxcclxuICAgICAgICAgIFwiY29sb3JcIjogXCIjNGQ0ZDRkXCJcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIFwibXV0YXRvcnNcIjogW11cclxuICAgIH1cclxuICB9LFxyXG4gIFwibXV0YXRvclwiOiB7XHJcbiAgICBcImFzNTVkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgIFwiZXZlbnRcIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwiZXZlbnRcIixcclxuICAgICAgICBcImlkXCI6IFwiZDQ4cmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfSxcclxuICAgICAgXCJzdGF0ZVwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJzdGF0ZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9LFxyXG4gICAgICBcIm11dGF0aW9uXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICBcImlkXCI6IFwicGRxNmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiOWRxOGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJldmVudFwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJldmVudFwiLFxyXG4gICAgICAgIFwiaWRcIjogXCIzYTU0ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9LFxyXG4gICAgICBcInN0YXRlXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInN0YXRlXCIsXHJcbiAgICAgICAgXCJpZFwiOiBcIjQ2dmRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgIH0sXHJcbiAgICAgIFwibXV0YXRpb25cIjoge1xyXG4gICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgIFwiaWRcIjogXCI0NTJxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICBcImV2ZW50XCI6IHtcclxuICAgIFwiZDQ4cmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgXCJ0eXBlXCI6IFwiY2xpY2tcIixcclxuICAgICAgXCJtdXRhdG9yc1wiOiBbXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgXCJyZWZcIjogXCJtdXRhdG9yXCIsXHJcbiAgICAgICAgICBcImlkXCI6IFwiYXM1NWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICB9XHJcbiAgICAgIF0sXHJcbiAgICAgIFwiZW1pdHRlclwiOiB7XHJcbiAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZVRleHRcIixcclxuICAgICAgICBcImlkXCI6IFwiMTQ4MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCJcclxuICAgICAgfSxcclxuICAgICAgXCJkYXRhXCI6IFtdXHJcbiAgICB9LFxyXG4gICAgXCIzYTU0ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICBcInR5cGVcIjogXCJjbGlja1wiLFxyXG4gICAgICBcIm11dGF0b3JzXCI6IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBcInJlZlwiOiBcIm11dGF0b3JcIixcclxuICAgICAgICAgIFwiaWRcIjogXCI5ZHE4ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgIH1cclxuICAgICAgXSxcclxuICAgICAgXCJlbWl0dGVyXCI6IHtcclxuICAgICAgICBcInJlZlwiOiBcInZOb2RlVGV4dFwiLFxyXG4gICAgICAgIFwiaWRcIjogXCIzNDgxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjVcIlxyXG4gICAgICB9LFxyXG4gICAgICBcImRhdGFcIjogW11cclxuICAgIH1cclxuICB9XHJcbn0iXX0=
