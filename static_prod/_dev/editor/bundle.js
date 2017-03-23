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

var version = '0.0.24v';
editor(_app2.default);

function editor(appDefinition) {

    var savedDefinition = JSON.parse(localStorage.getItem('saved_app_' + version));
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
        viewFoldersClosed: {},
        dragMouseLocation: null,
        currentlyDragging: '',
        eventStack: [],
        definition: savedDefinition || app.definition
    };
    // undo/redo
    var stateStack = [state.definition];
    function setState(newState) {
        if (newState === state) {
            console.warn('state was mutated, search for a bug');
        }
        if (state.appIsFrozen !== newState.appIsFrozen || state.selectedViewNode !== newState.selectedViewNode) {
            app._freeze(newState.appIsFrozen, VIEW_NODE_SELECTED, newState.selectedViewNode);
        }
        if (state.definition !== newState.definition) {
            // undo/redo then render then save
            var currentIndex = stateStack.findIndex(function (a) {
                return a === state.definition;
            });
            stateStack = stateStack.slice(0, currentIndex + 1).concat(newState.definition);
            // TODO add garbage collection?
            app.render(newState.definition);
            localStorage.setItem('saved_app_' + version, JSON.stringify(newState.definition));
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
        if (type === 'namespace') {
            var _extends26;

            newState = {
                title: 'new namespace',
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
        setState(_extends({}, state, { definition: _extends({}, state.definition, _defineProperty({}, ref.ref, _extends({}, state.definition[ref.ref], _defineProperty({}, ref.id, _extends({}, state.definition[ref.ref][ref.id], _defineProperty({}, propertyName, value)))))) }));
    }
    function ADD_EVENT(propertyName) {
        var _extends48;

        var ref = state.selectedViewNode;
        var eventId = uuid();
        setState(_extends({}, state, { definition: _extends({}, state.definition, (_extends48 = {}, _defineProperty(_extends48, ref.ref, _extends({}, state.definition[ref.ref], _defineProperty({}, ref.id, _extends({}, state.definition[ref.ref][ref.id], _defineProperty({}, propertyName, { ref: 'event', id: eventId }))))), _defineProperty(_extends48, "event", _extends({}, state.definition.event, _defineProperty({}, eventId, {
                title: 'On ' + propertyName,
                mutators: []
            }))), _extends48)) }));
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
            }) }));
    }
    function MOVE_VIEW_NODE(parentRef, position, amount, e) {
        e.preventDefault();
        e.stopPropagation();
        setState(_extends({}, state, { definition: _extends({}, state.definition, _defineProperty({}, parentRef.ref, _extends({}, state.definition[parentRef.ref], _defineProperty({}, parentRef.id, _extends({}, state.definition[parentRef.ref][parentRef.id], {
                children: state.definition[parentRef.ref][parentRef.id].children.map( // functional swap
                function (child, index) {
                    return index === position + amount ? state.definition[parentRef.ref][parentRef.id].children[position] : index === position ? state.definition[parentRef.ref][parentRef.id].children[position + amount] : state.definition[parentRef.ref][parentRef.id].children[index];
                })
            }))))) }));
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
                }) }));
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
                }) }));
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

    var boxIcon = (0, _h2.default)('svg', {
        attrs: { width: 14, height: 15 },
        style: { cursor: 'pointer', padding: '0 7px 0 0' }
    }, [(0, _h2.default)('rect', { attrs: { x: 2, y: 2, width: 12, height: 12, fill: 'none', transition: 'all 0.2s', stroke: '#bdbdbd', 'stroke-width': '2' } })]);
    var ifIcon = (0, _h2.default)('svg', {
        attrs: { width: 14, height: 14 },
        style: { cursor: 'pointer', padding: '0 7px 0 0' }
    }, [(0, _h2.default)('text', { attrs: { x: 3, y: 14, fill: '#bdbdbd' } }, '?')]);
    var listIcon = (0, _h2.default)('svg', {
        attrs: { width: 14, height: 14 },
        style: { cursor: 'pointer', padding: '0 7px 0 0' }
    }, [(0, _h2.default)('circle', { attrs: { r: 2, cx: 2, cy: 2, transition: 'all 0.2s', fill: '#bdbdbd' } }), (0, _h2.default)('rect', { attrs: { x: 6, y: 1, width: 8, transition: 'all 0.2s', height: 2, fill: '#bdbdbd' } }), (0, _h2.default)('circle', { attrs: { r: 2, cx: 2, cy: 7, transition: 'all 0.2s', fill: '#bdbdbd' } }), (0, _h2.default)('rect', { attrs: { x: 6, y: 6, width: 8, transition: 'all 0.2s', height: 2, fill: '#bdbdbd' } }), (0, _h2.default)('circle', { attrs: { r: 2, cx: 2, cy: 12, transition: 'all 0.2s', fill: '#bdbdbd' } }), (0, _h2.default)('rect', { attrs: { x: 6, y: 11, width: 8, transition: 'all 0.2s', height: 2, fill: '#bdbdbd' } })]);
    var inputIcon = (0, _h2.default)('svg', {
        attrs: { viewBox: '0 0 16 16', width: 14, height: 14 },
        style: { cursor: 'pointer', padding: '0 7px 0 0' }
    }, [(0, _h2.default)('path', { attrs: { d: 'M 15,2 11,2 C 10.447,2 10,1.552 10,1 10,0.448 10.447,0 11,0 l 4,0 c 0.553,0 1,0.448 1,1 0,0.552 -0.447,1 -1,1 z m -2,14 c -0.553,0 -1,-0.447 -1,-1 L 12,1 c 0,-0.552 0.447,-1 1,-1 0.553,0 1,0.448 1,1 l 0,14 c 0,0.553 -0.447,1 -1,1 z m 2,0 -4,0 c -0.553,0 -1,-0.447 -1,-1 0,-0.553 0.447,-1 1,-1 l 4,0 c 0.553,0 1,0.447 1,1 0,0.553 -0.447,1 -1,1 z', fill: '#bdbdbd' } }), (0, _h2.default)('path', { attrs: { d: 'M 9.8114827,4.2360393 C 9.6547357,4.5865906 9.3039933,4.8295854 8.8957233,4.8288684 L 1.2968926,4.8115404 1.3169436,2.806447 8.9006377,2.828642 c 0.552448,0.00165 0.9993074,0.4501223 0.9976564,1.0025698 -2.1e-5,0.1445856 -0.0313,0.2806734 -0.08681,0.404827 z', fill: '#bdbdbd' } }), (0, _h2.default)('path', { attrs: { d: 'm 9.8114827,11.738562 c -0.156747,0.350551 -0.5074894,0.593546 -0.9157594,0.592829 l -7.5988307,-0.01733 0.020051,-2.005093 7.5836941,0.02219 c 0.552448,0.0016 0.9993074,0.450122 0.9976564,1.00257 -2.1e-5,0.144585 -0.0313,0.280673 -0.08681,0.404827 z', fill: '#bdbdbd' } }), (0, _h2.default)('path', { attrs: { d: 'm 1.2940583,12.239836 0.01704,-9.4450947 1.9714852,0.024923 -0.021818,9.4262797 z', fill: '#bdbdbd' } })]);
    var textIcon = (0, _h2.default)('svg', {
        attrs: { viewBox: '0 0 300 300', width: 14, height: 14 },
        style: { cursor: 'pointer', padding: '0 7px 0 0' }
    }, [(0, _h2.default)('path', { attrs: { d: 'M 0 0 L 0 85.8125 L 27.03125 85.8125 C 36.617786 44.346316 67.876579 42.179793 106.90625 42.59375 L 106.90625 228.375 C 107.31101 279.09641 98.908386 277.33602 62.125 277.5 L 62.125 299.5625 L 149 299.5625 L 150.03125 299.5625 L 236.90625 299.5625 L 236.90625 277.5 C 200.12286 277.336 191.72024 279.09639 192.125 228.375 L 192.125 42.59375 C 231.15467 42.17975 262.41346 44.346304 272 85.8125 L 299.03125 85.8125 L 299.03125 0 L 150.03125 0 L 149 0 L 0 0 z', fill: '#bdbdbd' } })]);

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
            }, [(0, _h2.default)('polygon', { attrs: { points: '12,8 0,1 3,8 0,15' }, style: { fill: state.selectedStateNodeId === stateId ? '#eab65c' : 'white', transition: 'fill 0.2s' } })]), state.editingTitleNodeId === stateId ? editingNode() : (0, _h2.default)('span', { style: { cursor: 'pointer' }, on: { dblclick: [EDIT_VIEW_NODE_TITLE, stateId] } }, [(0, _h2.default)('span', { style: { color: state.selectedStateNodeId === stateId ? '#eab65c' : 'white', transition: 'color 0.2s' } }, currentNameSpace.title)])]), (0, _h2.default)('div', { style: { display: closed ? 'none' : 'block', paddingLeft: '10px', paddingBottom: '5px', transition: 'border-color 0.2s' } }, [].concat(_toConsumableArray(currentNameSpace.children.map(function (ref) {
                return ref.ref === 'state' ? listState(ref.id) : listNameSpace(ref.id);
            }))))]);
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
                    color: currentRunningState[stateId] !== state.definition.state[stateId].defaultValue ? 'rgb(91, 204, 91)' : 'white',
                    background: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    display: 'inline',
                    border: 'none',
                    maxWidth: '50%'
                };
                if (currentState.type === 'text') return (0, _h2.default)('input', { attrs: { type: 'text' }, liveProps: { value: currentRunningState[stateId] }, style: noStyleInput, on: { input: [CHANGE_CURRENT_STATE_TEXT_VALUE, stateId] } });
                if (currentState.type === 'number') return (0, _h2.default)('span', { style: { position: 'relative' } }, [(0, _h2.default)('input', { attrs: { type: 'number' }, liveProps: { value: currentRunningState[stateId] }, style: _extends({}, noStyleInput, { width: 9 * currentRunningState[stateId].toString().length + 'px' }), on: { input: [CHANGE_CURRENT_STATE_NUMBER_VALUE, stateId] } })]);
                if (currentState.type === 'table') {
                    var _ret = function () {
                        var table = currentRunningState[stateId];
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
                    style: { color: 'white', transition: 'all 0.2s', boxShadow: state.selectedEventId === state.definition.mutator[ref.id].event.id ? '#5bcc5b 5px 0 0px 0px inset' : 'none', padding: '0 0 0 7px' },
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
                    borderTop: depth === 0 ? '2px solid #333' : undefined,
                    boxShadow: depth === 0 ? 'inset 0 2px 0 0 #4d4d4d' : undefined,
                    borderBottom: '2px solid #333',
                    marginBottom: '2px',
                    paddingTop: depth === 0 ? '3px' : '1px',
                    paddingBottom: '3px'
                } }, [nodeRef.ref === 'vNodeBox' && node.children.length > 0 ? (0, _h2.default)('svg', {
                attrs: { width: 12, height: 16 },
                style: { cursor: 'pointer', padding: '0 5px', transform: closed ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'all 0.2s', marginLeft: '-3px' },
                on: {
                    click: [VIEW_FOLDER_CLICKED, nodeId]
                }
            }, [(0, _h2.default)('polygon', { attrs: { points: '12,8 0,1 3,8 0,15' }, style: { fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white', transition: 'fill 0.2s' } })]) : (0, _h2.default)('span'), (0, _h2.default)('svg', {
                attrs: { width: 14, height: 15 },
                style: { cursor: 'pointer', padding: '0 7px 0 0' },
                on: { click: [VIEW_NODE_SELECTED, nodeRef] }
            }, nodeRef.ref === 'vNodeBox' ? [(0, _h2.default)('rect', { attrs: { x: 2, y: 2, width: 12, height: 12, fill: 'none', transition: 'all 0.2s', stroke: state.selectedViewNode.id === nodeId ? '#53B2ED' : '#bdbdbd', 'stroke-width': '2' } })] : nodeRef.ref === 'vNodeList' ? [(0, _h2.default)('circle', { attrs: { r: 2, cx: 2, cy: 2, transition: 'all 0.2s', fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : '#bdbdbd' } }), (0, _h2.default)('rect', { attrs: { x: 6, y: 1, width: 8, transition: 'all 0.2s', height: 2, fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : '#bdbdbd' } }), (0, _h2.default)('circle', { attrs: { r: 2, cx: 2, cy: 7, transition: 'all 0.2s', fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : '#bdbdbd' } }), (0, _h2.default)('rect', { attrs: { x: 6, y: 6, width: 8, transition: 'all 0.2s', height: 2, fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : '#bdbdbd' } }), (0, _h2.default)('circle', { attrs: { r: 2, cx: 2, cy: 12, transition: 'all 0.2s', fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : '#bdbdbd' } }), (0, _h2.default)('rect', { attrs: { x: 6, y: 11, width: 8, transition: 'all 0.2s', height: 2, fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : '#bdbdbd' } })] : [(0, _h2.default)('text', { attrs: { x: 3, y: 14, fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : '#bdbdbd' } }, '?')]), state.editingTitleNodeId === nodeId ? editingNode() : (0, _h2.default)('span', { style: { flex: '1', cursor: 'pointer', color: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white', transition: 'color 0.2s' }, on: { click: [VIEW_NODE_SELECTED, nodeRef], dblclick: [EDIT_VIEW_NODE_TITLE, nodeId] } }, node.title)]), (0, _h2.default)('div', {
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
                    marginBottom: '2px',
                    borderBottom: '2px solid #333',
                    paddingTop: '1px',
                    paddingBottom: '3px'
                },
                on: { click: [VIEW_NODE_SELECTED, nodeRef], dblclick: [EDIT_VIEW_NODE_TITLE, nodeId] }
            }, [nodeRef.ref === 'vNodeInput' ? (0, _h2.default)('svg', {
                attrs: { viewBox: '0 0 16 16', width: 14, height: 14 },
                style: { cursor: 'pointer', padding: '0 7px 0 0' }
            }, [(0, _h2.default)('path', { attrs: { d: 'M 15,2 11,2 C 10.447,2 10,1.552 10,1 10,0.448 10.447,0 11,0 l 4,0 c 0.553,0 1,0.448 1,1 0,0.552 -0.447,1 -1,1 z m -2,14 c -0.553,0 -1,-0.447 -1,-1 L 12,1 c 0,-0.552 0.447,-1 1,-1 0.553,0 1,0.448 1,1 l 0,14 c 0,0.553 -0.447,1 -1,1 z m 2,0 -4,0 c -0.553,0 -1,-0.447 -1,-1 0,-0.553 0.447,-1 1,-1 l 4,0 c 0.553,0 1,0.447 1,1 0,0.553 -0.447,1 -1,1 z', fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white' } }), (0, _h2.default)('path', { attrs: { d: 'M 9.8114827,4.2360393 C 9.6547357,4.5865906 9.3039933,4.8295854 8.8957233,4.8288684 L 1.2968926,4.8115404 1.3169436,2.806447 8.9006377,2.828642 c 0.552448,0.00165 0.9993074,0.4501223 0.9976564,1.0025698 -2.1e-5,0.1445856 -0.0313,0.2806734 -0.08681,0.404827 z', fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white' } }), (0, _h2.default)('path', { attrs: { d: 'm 9.8114827,11.738562 c -0.156747,0.350551 -0.5074894,0.593546 -0.9157594,0.592829 l -7.5988307,-0.01733 0.020051,-2.005093 7.5836941,0.02219 c 0.552448,0.0016 0.9993074,0.450122 0.9976564,1.00257 -2.1e-5,0.144585 -0.0313,0.280673 -0.08681,0.404827 z', fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white' } }), (0, _h2.default)('path', { attrs: { d: 'm 1.2940583,12.239836 0.01704,-9.4450947 1.9714852,0.024923 -0.021818,9.4262797 z', fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white' } })]) : (0, _h2.default)('svg', {
                attrs: { viewBox: '0 0 300 300', width: 14, height: 14 },
                style: { cursor: 'pointer', padding: '0 7px 0 0' }
            }, [(0, _h2.default)('path', { attrs: { d: 'M 0 0 L 0 85.8125 L 27.03125 85.8125 C 36.617786 44.346316 67.876579 42.179793 106.90625 42.59375 L 106.90625 228.375 C 107.31101 279.09641 98.908386 277.33602 62.125 277.5 L 62.125 299.5625 L 149 299.5625 L 150.03125 299.5625 L 236.90625 299.5625 L 236.90625 277.5 C 200.12286 277.336 191.72024 279.09639 192.125 228.375 L 192.125 42.59375 C 231.15467 42.17975 262.41346 44.346304 272 85.8125 L 299.03125 85.8125 L 299.03125 0 L 150.03125 0 L 149 0 L 0 0 z', fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : '#bdbdbd' } })]), state.editingTitleNodeId === nodeId ? editingNode() : (0, _h2.default)('span', { style: { color: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white', transition: 'color 0.2s' } }, node.title)]);
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
                            color: 'white',
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

        // function generateSelectViewNodeComponent() {
        //     return h('div', {
        //         style: {
        //             position: 'absolute',
        //             left: '0px',
        //             bottom: '0px',
        //             height: '50%',
        //             display: 'flex',
        //             flexDirection: 'column',
        //         }
        //     }, [
        //         h('div', {attrs: {class: 'better-scrollbar'}, style: {margin: '49px 3px 0 0', flex: '1', overflow: 'auto', background: '#333', width: state.editorRightWidth + 'px'}},[
        //             h('div', {style: {padding: '5px', margin: '5px'}}, 'drag and drop components into the component tree or into live application'),
        //             h('div', {style: {cursor: 'pointer', borderRadius: '5px', border: '3px solid #53B2ED', padding: '5px', margin: '5px'}, on: {
        //                     mousedown: [NODE_DRAGGED, 'box'],
        //                     touchstart: [NODE_DRAGGED, 'box'],
        //                 }},
        //                 '+ box'
        //             ),
        //             h('div', {style: {cursor: 'pointer', borderRadius: '5px', border: '3px solid #53B2ED', padding: '5px', margin: '5px'}, on: {
        //                     mousedown: [NODE_DRAGGED, 'text'],
        //                     touchstart: [NODE_DRAGGED, 'text'],
        //                 }},
        //                 '+ text'
        //             ),
        //             h('div', {style: {cursor: 'pointer', borderRadius: '5px', border: '3px solid #53B2ED', padding: '5px', margin: '5px'}, on: {
        //                     mousedown: [NODE_DRAGGED, 'input'],
        //                     touchstart: [NODE_DRAGGED, 'input'],
        //                 }},
        //                 '+ input'
        //             ),
        //         ])
        //     ])
        // }

        var addViewNodeComponent = (0, _h2.default)('div', { style: { flex: '0 auto', marginLeft: state.rightOpen ? '-10px' : '0', border: '3px solid #222', borderRight: 'none', background: '#333', height: '40px', display: 'flex', alignItems: 'center' }, on: { click: [SHOW_VIEW_NODES] } }, [(0, _h2.default)('span', { style: { padding: '0 10px' } }, 'add component: '), (0, _h2.default)('span', { on: { click: [ADD_NODE, state.selectedViewNode, 'box'] } }, [boxIcon]), (0, _h2.default)('span', { on: { click: [ADD_NODE, state.selectedViewNode, 'input'] } }, [inputIcon]), (0, _h2.default)('span', { on: { click: [ADD_NODE, state.selectedViewNode, 'text'] } }, [textIcon])]);

        var viewComponent = (0, _h2.default)('div', { attrs: { class: 'better-scrollbar' }, style: { overflow: 'auto', position: 'relative', flex: '1' }, on: { click: [UNSELECT_VIEW_NODE] } }, [listBoxNode({ ref: 'vNodeBox', id: '_rootNode' }, 0)]);

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
        }, state.eventStack.map(function (a) {
            return a;
        }).reverse().map(function (eventData) {
            var event = state.definition.event[eventData.eventId];
            var emitter = state.definition[event.emitter.ref][event.emitter.id];
            return (0, _h2.default)('div', { style: { padding: '5px', color: '#ffffff' } }, [(0, _h2.default)('div', { style: { cursor: 'pointer', background: '#333', borderRadius: '10px', padding: '5px' }, on: { click: [VIEW_NODE_SELECTED, event.emitter] } }, [emitter.title + ': ' + event.type]), (0, _h2.default)('div', Object.keys(eventData.mutations).map(function (stateId) {
                return state.definition.state[stateId].title + ': ' + eventData.mutations[stateId].toString();
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
            "value": "The number now is even 🎉",
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
            "type": "click",
            "title": "increment",
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
            "title": "decrement",
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
},{}]},{},[12])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmlnLmpzL2JpZy5qcyIsIm5vZGVfbW9kdWxlcy9zbmFiYmRvbS9oLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL2h0bWxkb21hcGkuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vaXMuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vbW9kdWxlcy9hdHRyaWJ1dGVzLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvY2xhc3MuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vbW9kdWxlcy9ldmVudGxpc3RlbmVycy5qcyIsIm5vZGVfbW9kdWxlcy9zbmFiYmRvbS9tb2R1bGVzL3Byb3BzLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvc3R5bGUuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vc25hYmJkb20uanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vdm5vZGUuanMiLCJzcmNcXGluZGV4LmpzIiwic3JjXFx1Z25pcy5qcyIsInVnbmlzX2NvbXBvbmVudHMvYXBwLmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdG5DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyogYmlnLmpzIHYzLjEuMyBodHRwczovL2dpdGh1Yi5jb20vTWlrZU1jbC9iaWcuanMvTElDRU5DRSAqL1xyXG47KGZ1bmN0aW9uIChnbG9iYWwpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbi8qXHJcbiAgYmlnLmpzIHYzLjEuM1xyXG4gIEEgc21hbGwsIGZhc3QsIGVhc3ktdG8tdXNlIGxpYnJhcnkgZm9yIGFyYml0cmFyeS1wcmVjaXNpb24gZGVjaW1hbCBhcml0aG1ldGljLlxyXG4gIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWtlTWNsL2JpZy5qcy9cclxuICBDb3B5cmlnaHQgKGMpIDIwMTQgTWljaGFlbCBNY2xhdWdobGluIDxNOGNoODhsQGdtYWlsLmNvbT5cclxuICBNSVQgRXhwYXQgTGljZW5jZVxyXG4qL1xyXG5cclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqIEVESVRBQkxFIERFRkFVTFRTICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuXHJcbiAgICAvLyBUaGUgZGVmYXVsdCB2YWx1ZXMgYmVsb3cgbXVzdCBiZSBpbnRlZ2VycyB3aXRoaW4gdGhlIHN0YXRlZCByYW5nZXMuXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBtYXhpbXVtIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyBvZiB0aGUgcmVzdWx0cyBvZiBvcGVyYXRpb25zXHJcbiAgICAgKiBpbnZvbHZpbmcgZGl2aXNpb246IGRpdiBhbmQgc3FydCwgYW5kIHBvdyB3aXRoIG5lZ2F0aXZlIGV4cG9uZW50cy5cclxuICAgICAqL1xyXG4gICAgdmFyIERQID0gMjAsICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMCB0byBNQVhfRFBcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgcm91bmRpbmcgbW9kZSB1c2VkIHdoZW4gcm91bmRpbmcgdG8gdGhlIGFib3ZlIGRlY2ltYWwgcGxhY2VzLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogMCBUb3dhcmRzIHplcm8gKGkuZS4gdHJ1bmNhdGUsIG5vIHJvdW5kaW5nKS4gICAgICAgKFJPVU5EX0RPV04pXHJcbiAgICAgICAgICogMSBUbyBuZWFyZXN0IG5laWdoYm91ci4gSWYgZXF1aWRpc3RhbnQsIHJvdW5kIHVwLiAgKFJPVU5EX0hBTEZfVVApXHJcbiAgICAgICAgICogMiBUbyBuZWFyZXN0IG5laWdoYm91ci4gSWYgZXF1aWRpc3RhbnQsIHRvIGV2ZW4uICAgKFJPVU5EX0hBTEZfRVZFTilcclxuICAgICAgICAgKiAzIEF3YXkgZnJvbSB6ZXJvLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoUk9VTkRfVVApXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUk0gPSAxLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwLCAxLCAyIG9yIDNcclxuXHJcbiAgICAgICAgLy8gVGhlIG1heGltdW0gdmFsdWUgb2YgRFAgYW5kIEJpZy5EUC5cclxuICAgICAgICBNQVhfRFAgPSAxRTYsICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gMTAwMDAwMFxyXG5cclxuICAgICAgICAvLyBUaGUgbWF4aW11bSBtYWduaXR1ZGUgb2YgdGhlIGV4cG9uZW50IGFyZ3VtZW50IHRvIHRoZSBwb3cgbWV0aG9kLlxyXG4gICAgICAgIE1BWF9QT1dFUiA9IDFFNiwgICAgICAgICAgICAgICAgICAgLy8gMSB0byAxMDAwMDAwXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVGhlIGV4cG9uZW50IHZhbHVlIGF0IGFuZCBiZW5lYXRoIHdoaWNoIHRvU3RyaW5nIHJldHVybnMgZXhwb25lbnRpYWxcclxuICAgICAgICAgKiBub3RhdGlvbi5cclxuICAgICAgICAgKiBKYXZhU2NyaXB0J3MgTnVtYmVyIHR5cGU6IC03XHJcbiAgICAgICAgICogLTEwMDAwMDAgaXMgdGhlIG1pbmltdW0gcmVjb21tZW5kZWQgZXhwb25lbnQgdmFsdWUgb2YgYSBCaWcuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgRV9ORUcgPSAtNywgICAgICAgICAgICAgICAgICAgLy8gMCB0byAtMTAwMDAwMFxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSBleHBvbmVudCB2YWx1ZSBhdCBhbmQgYWJvdmUgd2hpY2ggdG9TdHJpbmcgcmV0dXJucyBleHBvbmVudGlhbFxyXG4gICAgICAgICAqIG5vdGF0aW9uLlxyXG4gICAgICAgICAqIEphdmFTY3JpcHQncyBOdW1iZXIgdHlwZTogMjFcclxuICAgICAgICAgKiAxMDAwMDAwIGlzIHRoZSBtYXhpbXVtIHJlY29tbWVuZGVkIGV4cG9uZW50IHZhbHVlIG9mIGEgQmlnLlxyXG4gICAgICAgICAqIChUaGlzIGxpbWl0IGlzIG5vdCBlbmZvcmNlZCBvciBjaGVja2VkLilcclxuICAgICAgICAgKi9cclxuICAgICAgICBFX1BPUyA9IDIxLCAgICAgICAgICAgICAgICAgICAvLyAwIHRvIDEwMDAwMDBcclxuXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcblxyXG4gICAgICAgIC8vIFRoZSBzaGFyZWQgcHJvdG90eXBlIG9iamVjdC5cclxuICAgICAgICBQID0ge30sXHJcbiAgICAgICAgaXNWYWxpZCA9IC9eLT8oXFxkKyhcXC5cXGQqKT98XFwuXFxkKykoZVsrLV0/XFxkKyk/JC9pLFxyXG4gICAgICAgIEJpZztcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIENyZWF0ZSBhbmQgcmV0dXJuIGEgQmlnIGNvbnN0cnVjdG9yLlxyXG4gICAgICpcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gYmlnRmFjdG9yeSgpIHtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgQmlnIGNvbnN0cnVjdG9yIGFuZCBleHBvcnRlZCBmdW5jdGlvbi5cclxuICAgICAgICAgKiBDcmVhdGUgYW5kIHJldHVybiBhIG5ldyBpbnN0YW5jZSBvZiBhIEJpZyBudW1iZXIgb2JqZWN0LlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogbiB7bnVtYmVyfHN0cmluZ3xCaWd9IEEgbnVtZXJpYyB2YWx1ZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBCaWcobikge1xyXG4gICAgICAgICAgICB2YXIgeCA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICAvLyBFbmFibGUgY29uc3RydWN0b3IgdXNhZ2Ugd2l0aG91dCBuZXcuXHJcbiAgICAgICAgICAgIGlmICghKHggaW5zdGFuY2VvZiBCaWcpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbiA9PT0gdm9pZCAwID8gYmlnRmFjdG9yeSgpIDogbmV3IEJpZyhuKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRHVwbGljYXRlLlxyXG4gICAgICAgICAgICBpZiAobiBpbnN0YW5jZW9mIEJpZykge1xyXG4gICAgICAgICAgICAgICAgeC5zID0gbi5zO1xyXG4gICAgICAgICAgICAgICAgeC5lID0gbi5lO1xyXG4gICAgICAgICAgICAgICAgeC5jID0gbi5jLnNsaWNlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwYXJzZSh4LCBuKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogUmV0YWluIGEgcmVmZXJlbmNlIHRvIHRoaXMgQmlnIGNvbnN0cnVjdG9yLCBhbmQgc2hhZG93XHJcbiAgICAgICAgICAgICAqIEJpZy5wcm90b3R5cGUuY29uc3RydWN0b3Igd2hpY2ggcG9pbnRzIHRvIE9iamVjdC5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIHguY29uc3RydWN0b3IgPSBCaWc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBCaWcucHJvdG90eXBlID0gUDtcclxuICAgICAgICBCaWcuRFAgPSBEUDtcclxuICAgICAgICBCaWcuUk0gPSBSTTtcclxuICAgICAgICBCaWcuRV9ORUcgPSBFX05FRztcclxuICAgICAgICBCaWcuRV9QT1MgPSBFX1BPUztcclxuXHJcbiAgICAgICAgcmV0dXJuIEJpZztcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gUHJpdmF0ZSBmdW5jdGlvbnNcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIEJpZyB4IGluIG5vcm1hbCBvciBleHBvbmVudGlhbFxyXG4gICAgICogbm90YXRpb24gdG8gZHAgZml4ZWQgZGVjaW1hbCBwbGFjZXMgb3Igc2lnbmlmaWNhbnQgZGlnaXRzLlxyXG4gICAgICpcclxuICAgICAqIHgge0JpZ30gVGhlIEJpZyB0byBmb3JtYXQuXHJcbiAgICAgKiBkcCB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKiB0b0Uge251bWJlcn0gMSAodG9FeHBvbmVudGlhbCksIDIgKHRvUHJlY2lzaW9uKSBvciB1bmRlZmluZWQgKHRvRml4ZWQpLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBmb3JtYXQoeCwgZHAsIHRvRSkge1xyXG4gICAgICAgIHZhciBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG5cclxuICAgICAgICAgICAgLy8gVGhlIGluZGV4IChub3JtYWwgbm90YXRpb24pIG9mIHRoZSBkaWdpdCB0aGF0IG1heSBiZSByb3VuZGVkIHVwLlxyXG4gICAgICAgICAgICBpID0gZHAgLSAoeCA9IG5ldyBCaWcoeCkpLmUsXHJcbiAgICAgICAgICAgIGMgPSB4LmM7XHJcblxyXG4gICAgICAgIC8vIFJvdW5kP1xyXG4gICAgICAgIGlmIChjLmxlbmd0aCA+ICsrZHApIHtcclxuICAgICAgICAgICAgcm5kKHgsIGksIEJpZy5STSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWNbMF0pIHtcclxuICAgICAgICAgICAgKytpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodG9FKSB7XHJcbiAgICAgICAgICAgIGkgPSBkcDtcclxuXHJcbiAgICAgICAgLy8gdG9GaXhlZFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGMgPSB4LmM7XHJcblxyXG4gICAgICAgICAgICAvLyBSZWNhbGN1bGF0ZSBpIGFzIHguZSBtYXkgaGF2ZSBjaGFuZ2VkIGlmIHZhbHVlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgIGkgPSB4LmUgKyBpICsgMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFwcGVuZCB6ZXJvcz9cclxuICAgICAgICBmb3IgKDsgYy5sZW5ndGggPCBpOyBjLnB1c2goMCkpIHtcclxuICAgICAgICB9XHJcbiAgICAgICAgaSA9IHguZTtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiB0b1ByZWNpc2lvbiByZXR1cm5zIGV4cG9uZW50aWFsIG5vdGF0aW9uIGlmIHRoZSBudW1iZXIgb2ZcclxuICAgICAgICAgKiBzaWduaWZpY2FudCBkaWdpdHMgc3BlY2lmaWVkIGlzIGxlc3MgdGhhbiB0aGUgbnVtYmVyIG9mIGRpZ2l0c1xyXG4gICAgICAgICAqIG5lY2Vzc2FyeSB0byByZXByZXNlbnQgdGhlIGludGVnZXIgcGFydCBvZiB0aGUgdmFsdWUgaW4gbm9ybWFsXHJcbiAgICAgICAgICogbm90YXRpb24uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcmV0dXJuIHRvRSA9PT0gMSB8fCB0b0UgJiYgKGRwIDw9IGkgfHwgaSA8PSBCaWcuRV9ORUcpID9cclxuXHJcbiAgICAgICAgICAvLyBFeHBvbmVudGlhbCBub3RhdGlvbi5cclxuICAgICAgICAgICh4LnMgPCAwICYmIGNbMF0gPyAnLScgOiAnJykgK1xyXG4gICAgICAgICAgICAoYy5sZW5ndGggPiAxID8gY1swXSArICcuJyArIGMuam9pbignJykuc2xpY2UoMSkgOiBjWzBdKSArXHJcbiAgICAgICAgICAgICAgKGkgPCAwID8gJ2UnIDogJ2UrJykgKyBpXHJcblxyXG4gICAgICAgICAgLy8gTm9ybWFsIG5vdGF0aW9uLlxyXG4gICAgICAgICAgOiB4LnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBQYXJzZSB0aGUgbnVtYmVyIG9yIHN0cmluZyB2YWx1ZSBwYXNzZWQgdG8gYSBCaWcgY29uc3RydWN0b3IuXHJcbiAgICAgKlxyXG4gICAgICogeCB7QmlnfSBBIEJpZyBudW1iZXIgaW5zdGFuY2UuXHJcbiAgICAgKiBuIHtudW1iZXJ8c3RyaW5nfSBBIG51bWVyaWMgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHBhcnNlKHgsIG4pIHtcclxuICAgICAgICB2YXIgZSwgaSwgbkw7XHJcblxyXG4gICAgICAgIC8vIE1pbnVzIHplcm8/XHJcbiAgICAgICAgaWYgKG4gPT09IDAgJiYgMSAvIG4gPCAwKSB7XHJcbiAgICAgICAgICAgIG4gPSAnLTAnO1xyXG5cclxuICAgICAgICAvLyBFbnN1cmUgbiBpcyBzdHJpbmcgYW5kIGNoZWNrIHZhbGlkaXR5LlxyXG4gICAgICAgIH0gZWxzZSBpZiAoIWlzVmFsaWQudGVzdChuICs9ICcnKSkge1xyXG4gICAgICAgICAgICB0aHJvd0VycihOYU4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHNpZ24uXHJcbiAgICAgICAgeC5zID0gbi5jaGFyQXQoMCkgPT0gJy0nID8gKG4gPSBuLnNsaWNlKDEpLCAtMSkgOiAxO1xyXG5cclxuICAgICAgICAvLyBEZWNpbWFsIHBvaW50P1xyXG4gICAgICAgIGlmICgoZSA9IG4uaW5kZXhPZignLicpKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIG4gPSBuLnJlcGxhY2UoJy4nLCAnJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFeHBvbmVudGlhbCBmb3JtP1xyXG4gICAgICAgIGlmICgoaSA9IG4uc2VhcmNoKC9lL2kpKSA+IDApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIERldGVybWluZSBleHBvbmVudC5cclxuICAgICAgICAgICAgaWYgKGUgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBlID0gaTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlICs9ICtuLnNsaWNlKGkgKyAxKTtcclxuICAgICAgICAgICAgbiA9IG4uc3Vic3RyaW5nKDAsIGkpO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKGUgPCAwKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBJbnRlZ2VyLlxyXG4gICAgICAgICAgICBlID0gbi5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgbGVhZGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKGkgPSAwOyBuLmNoYXJBdChpKSA9PSAnMCc7IGkrKykge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGkgPT0gKG5MID0gbi5sZW5ndGgpKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBaZXJvLlxyXG4gICAgICAgICAgICB4LmMgPSBbIHguZSA9IDAgXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKDsgbi5jaGFyQXQoLS1uTCkgPT0gJzAnOykge1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB4LmUgPSBlIC0gaSAtIDE7XHJcbiAgICAgICAgICAgIHguYyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgLy8gQ29udmVydCBzdHJpbmcgdG8gYXJyYXkgb2YgZGlnaXRzIHdpdGhvdXQgbGVhZGluZy90cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yIChlID0gMDsgaSA8PSBuTDsgeC5jW2UrK10gPSArbi5jaGFyQXQoaSsrKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4geDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJvdW5kIEJpZyB4IHRvIGEgbWF4aW11bSBvZiBkcCBkZWNpbWFsIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIHJtLlxyXG4gICAgICogQ2FsbGVkIGJ5IGRpdiwgc3FydCBhbmQgcm91bmQuXHJcbiAgICAgKlxyXG4gICAgICogeCB7QmlnfSBUaGUgQmlnIHRvIHJvdW5kLlxyXG4gICAgICogZHAge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICogcm0ge251bWJlcn0gMCwgMSwgMiBvciAzIChET1dOLCBIQUxGX1VQLCBIQUxGX0VWRU4sIFVQKVxyXG4gICAgICogW21vcmVdIHtib29sZWFufSBXaGV0aGVyIHRoZSByZXN1bHQgb2YgZGl2aXNpb24gd2FzIHRydW5jYXRlZC5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcm5kKHgsIGRwLCBybSwgbW9yZSkge1xyXG4gICAgICAgIHZhciB1LFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgaSA9IHguZSArIGRwICsgMTtcclxuXHJcbiAgICAgICAgaWYgKHJtID09PSAxKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB4Y1tpXSBpcyB0aGUgZGlnaXQgYWZ0ZXIgdGhlIGRpZ2l0IHRoYXQgbWF5IGJlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgIG1vcmUgPSB4Y1tpXSA+PSA1O1xyXG4gICAgICAgIH0gZWxzZSBpZiAocm0gPT09IDIpIHtcclxuICAgICAgICAgICAgbW9yZSA9IHhjW2ldID4gNSB8fCB4Y1tpXSA9PSA1ICYmXHJcbiAgICAgICAgICAgICAgKG1vcmUgfHwgaSA8IDAgfHwgeGNbaSArIDFdICE9PSB1IHx8IHhjW2kgLSAxXSAmIDEpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAocm0gPT09IDMpIHtcclxuICAgICAgICAgICAgbW9yZSA9IG1vcmUgfHwgeGNbaV0gIT09IHUgfHwgaSA8IDA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbW9yZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJtICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvd0VycignIUJpZy5STSEnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGkgPCAxIHx8ICF4Y1swXSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKG1vcmUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyAxLCAwLjEsIDAuMDEsIDAuMDAxLCAwLjAwMDEgZXRjLlxyXG4gICAgICAgICAgICAgICAgeC5lID0gLWRwO1xyXG4gICAgICAgICAgICAgICAgeC5jID0gWzFdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFplcm8uXHJcbiAgICAgICAgICAgICAgICB4LmMgPSBbeC5lID0gMF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlIGFueSBkaWdpdHMgYWZ0ZXIgdGhlIHJlcXVpcmVkIGRlY2ltYWwgcGxhY2VzLlxyXG4gICAgICAgICAgICB4Yy5sZW5ndGggPSBpLS07XHJcblxyXG4gICAgICAgICAgICAvLyBSb3VuZCB1cD9cclxuICAgICAgICAgICAgaWYgKG1vcmUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBSb3VuZGluZyB1cCBtYXkgbWVhbiB0aGUgcHJldmlvdXMgZGlnaXQgaGFzIHRvIGJlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgICAgICBmb3IgKDsgKyt4Y1tpXSA+IDk7KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeGNbaV0gPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWktLSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICArK3guZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGMudW5zaGlmdCgxKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yIChpID0geGMubGVuZ3RoOyAheGNbLS1pXTsgeGMucG9wKCkpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaHJvdyBhIEJpZ0Vycm9yLlxyXG4gICAgICpcclxuICAgICAqIG1lc3NhZ2Uge3N0cmluZ30gVGhlIGVycm9yIG1lc3NhZ2UuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHRocm93RXJyKG1lc3NhZ2UpIHtcclxuICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG4gICAgICAgIGVyci5uYW1lID0gJ0JpZ0Vycm9yJztcclxuXHJcbiAgICAgICAgdGhyb3cgZXJyO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBQcm90b3R5cGUvaW5zdGFuY2UgbWV0aG9kc1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgdGhpcyBCaWcuXHJcbiAgICAgKi9cclxuICAgIFAuYWJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciB4ID0gbmV3IHRoaXMuY29uc3RydWN0b3IodGhpcyk7XHJcbiAgICAgICAgeC5zID0gMTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuXHJcbiAgICAgKiAxIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBncmVhdGVyIHRoYW4gdGhlIHZhbHVlIG9mIEJpZyB5LFxyXG4gICAgICogLTEgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGxlc3MgdGhhbiB0aGUgdmFsdWUgb2YgQmlnIHksIG9yXHJcbiAgICAgKiAwIGlmIHRoZXkgaGF2ZSB0aGUgc2FtZSB2YWx1ZS5cclxuICAgICovXHJcbiAgICBQLmNtcCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIHhOZWcsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgeWMgPSAoeSA9IG5ldyB4LmNvbnN0cnVjdG9yKHkpKS5jLFxyXG4gICAgICAgICAgICBpID0geC5zLFxyXG4gICAgICAgICAgICBqID0geS5zLFxyXG4gICAgICAgICAgICBrID0geC5lLFxyXG4gICAgICAgICAgICBsID0geS5lO1xyXG5cclxuICAgICAgICAvLyBFaXRoZXIgemVybz9cclxuICAgICAgICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gIXhjWzBdID8gIXljWzBdID8gMCA6IC1qIDogaTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNpZ25zIGRpZmZlcj9cclxuICAgICAgICBpZiAoaSAhPSBqKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB4TmVnID0gaSA8IDA7XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgZXhwb25lbnRzLlxyXG4gICAgICAgIGlmIChrICE9IGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGsgPiBsIF4geE5lZyA/IDEgOiAtMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGkgPSAtMTtcclxuICAgICAgICBqID0gKGsgPSB4Yy5sZW5ndGgpIDwgKGwgPSB5Yy5sZW5ndGgpID8gayA6IGw7XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgZGlnaXQgYnkgZGlnaXQuXHJcbiAgICAgICAgZm9yICg7ICsraSA8IGo7KSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoeGNbaV0gIT0geWNbaV0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB4Y1tpXSA+IHljW2ldIF4geE5lZyA/IDEgOiAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ29tcGFyZSBsZW5ndGhzLlxyXG4gICAgICAgIHJldHVybiBrID09IGwgPyAwIDogayA+IGwgXiB4TmVnID8gMSA6IC0xO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGRpdmlkZWQgYnkgdGhlXHJcbiAgICAgKiB2YWx1ZSBvZiBCaWcgeSwgcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB0byBhIG1heGltdW0gb2YgQmlnLkRQIGRlY2ltYWxcclxuICAgICAqIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIEJpZy5STS5cclxuICAgICAqL1xyXG4gICAgUC5kaXYgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgLy8gZGl2aWRlbmRcclxuICAgICAgICAgICAgZHZkID0geC5jLFxyXG4gICAgICAgICAgICAvL2Rpdmlzb3JcclxuICAgICAgICAgICAgZHZzID0gKHkgPSBuZXcgQmlnKHkpKS5jLFxyXG4gICAgICAgICAgICBzID0geC5zID09IHkucyA/IDEgOiAtMSxcclxuICAgICAgICAgICAgZHAgPSBCaWcuRFA7XHJcblxyXG4gICAgICAgIGlmIChkcCAhPT0gfn5kcCB8fCBkcCA8IDAgfHwgZHAgPiBNQVhfRFApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyFCaWcuRFAhJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFaXRoZXIgMD9cclxuICAgICAgICBpZiAoIWR2ZFswXSB8fCAhZHZzWzBdKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBib3RoIGFyZSAwLCB0aHJvdyBOYU5cclxuICAgICAgICAgICAgaWYgKGR2ZFswXSA9PSBkdnNbMF0pIHtcclxuICAgICAgICAgICAgICAgIHRocm93RXJyKE5hTik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIElmIGR2cyBpcyAwLCB0aHJvdyArLUluZmluaXR5LlxyXG4gICAgICAgICAgICBpZiAoIWR2c1swXSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3dFcnIocyAvIDApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBkdmQgaXMgMCwgcmV0dXJuICstMC5cclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWcocyAqIDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGR2c0wsIGR2c1QsIG5leHQsIGNtcCwgcmVtSSwgdSxcclxuICAgICAgICAgICAgZHZzWiA9IGR2cy5zbGljZSgpLFxyXG4gICAgICAgICAgICBkdmRJID0gZHZzTCA9IGR2cy5sZW5ndGgsXHJcbiAgICAgICAgICAgIGR2ZEwgPSBkdmQubGVuZ3RoLFxyXG4gICAgICAgICAgICAvLyByZW1haW5kZXJcclxuICAgICAgICAgICAgcmVtID0gZHZkLnNsaWNlKDAsIGR2c0wpLFxyXG4gICAgICAgICAgICByZW1MID0gcmVtLmxlbmd0aCxcclxuICAgICAgICAgICAgLy8gcXVvdGllbnRcclxuICAgICAgICAgICAgcSA9IHksXHJcbiAgICAgICAgICAgIHFjID0gcS5jID0gW10sXHJcbiAgICAgICAgICAgIHFpID0gMCxcclxuICAgICAgICAgICAgZGlnaXRzID0gZHAgKyAocS5lID0geC5lIC0geS5lKSArIDE7XHJcblxyXG4gICAgICAgIHEucyA9IHM7XHJcbiAgICAgICAgcyA9IGRpZ2l0cyA8IDAgPyAwIDogZGlnaXRzO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgdmVyc2lvbiBvZiBkaXZpc29yIHdpdGggbGVhZGluZyB6ZXJvLlxyXG4gICAgICAgIGR2c1oudW5zaGlmdCgwKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIHplcm9zIHRvIG1ha2UgcmVtYWluZGVyIGFzIGxvbmcgYXMgZGl2aXNvci5cclxuICAgICAgICBmb3IgKDsgcmVtTCsrIDwgZHZzTDsgcmVtLnB1c2goMCkpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRvIHtcclxuXHJcbiAgICAgICAgICAgIC8vICduZXh0JyBpcyBob3cgbWFueSB0aW1lcyB0aGUgZGl2aXNvciBnb2VzIGludG8gY3VycmVudCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgIGZvciAobmV4dCA9IDA7IG5leHQgPCAxMDsgbmV4dCsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ29tcGFyZSBkaXZpc29yIGFuZCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICBpZiAoZHZzTCAhPSAocmVtTCA9IHJlbS5sZW5ndGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY21wID0gZHZzTCA+IHJlbUwgPyAxIDogLTE7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHJlbUkgPSAtMSwgY21wID0gMDsgKytyZW1JIDwgZHZzTDspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkdnNbcmVtSV0gIT0gcmVtW3JlbUldKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbXAgPSBkdnNbcmVtSV0gPiByZW1bcmVtSV0gPyAxIDogLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBJZiBkaXZpc29yIDwgcmVtYWluZGVyLCBzdWJ0cmFjdCBkaXZpc29yIGZyb20gcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgaWYgKGNtcCA8IDApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVtYWluZGVyIGNhbid0IGJlIG1vcmUgdGhhbiAxIGRpZ2l0IGxvbmdlciB0aGFuIGRpdmlzb3IuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRXF1YWxpc2UgbGVuZ3RocyB1c2luZyBkaXZpc29yIHdpdGggZXh0cmEgbGVhZGluZyB6ZXJvP1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoZHZzVCA9IHJlbUwgPT0gZHZzTCA/IGR2cyA6IGR2c1o7IHJlbUw7KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVtWy0tcmVtTF0gPCBkdnNUW3JlbUxdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1JID0gcmVtTDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKDsgcmVtSSAmJiAhcmVtWy0tcmVtSV07IHJlbVtyZW1JXSA9IDkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0tcmVtW3JlbUldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtW3JlbUxdICs9IDEwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbVtyZW1MXSAtPSBkdnNUW3JlbUxdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKDsgIXJlbVswXTsgcmVtLnNoaWZ0KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgdGhlICduZXh0JyBkaWdpdCB0byB0aGUgcmVzdWx0IGFycmF5LlxyXG4gICAgICAgICAgICBxY1txaSsrXSA9IGNtcCA/IG5leHQgOiArK25leHQ7XHJcblxyXG4gICAgICAgICAgICAvLyBVcGRhdGUgdGhlIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgaWYgKHJlbVswXSAmJiBjbXApIHtcclxuICAgICAgICAgICAgICAgIHJlbVtyZW1MXSA9IGR2ZFtkdmRJXSB8fCAwO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVtID0gWyBkdmRbZHZkSV0gXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IHdoaWxlICgoZHZkSSsrIDwgZHZkTCB8fCByZW1bMF0gIT09IHUpICYmIHMtLSk7XHJcblxyXG4gICAgICAgIC8vIExlYWRpbmcgemVybz8gRG8gbm90IHJlbW92ZSBpZiByZXN1bHQgaXMgc2ltcGx5IHplcm8gKHFpID09IDEpLlxyXG4gICAgICAgIGlmICghcWNbMF0gJiYgcWkgIT0gMSkge1xyXG5cclxuICAgICAgICAgICAgLy8gVGhlcmUgY2FuJ3QgYmUgbW9yZSB0aGFuIG9uZSB6ZXJvLlxyXG4gICAgICAgICAgICBxYy5zaGlmdCgpO1xyXG4gICAgICAgICAgICBxLmUtLTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJvdW5kP1xyXG4gICAgICAgIGlmIChxaSA+IGRpZ2l0cykge1xyXG4gICAgICAgICAgICBybmQocSwgZHAsIEJpZy5STSwgcmVtWzBdICE9PSB1KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBxO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBlcXVhbCB0byB0aGUgdmFsdWUgb2YgQmlnIHksXHJcbiAgICAgKiBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5lcSA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgcmV0dXJuICF0aGlzLmNtcCh5KTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZ3JlYXRlciB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSxcclxuICAgICAqIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmd0ID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jbXAoeSkgPiAwO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gdGhlXHJcbiAgICAgKiB2YWx1ZSBvZiBCaWcgeSwgb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAuZ3RlID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jbXAoeSkgPiAtMTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgbGVzcyB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSxcclxuICAgICAqIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmx0ID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jbXAoeSkgPCAwO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHZhbHVlXHJcbiAgICAgKiBvZiBCaWcgeSwgb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAubHRlID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICAgcmV0dXJuIHRoaXMuY21wKHkpIDwgMTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBtaW51cyB0aGUgdmFsdWVcclxuICAgICAqIG9mIEJpZyB5LlxyXG4gICAgICovXHJcbiAgICBQLnN1YiA9IFAubWludXMgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciBpLCBqLCB0LCB4TFR5LFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgYSA9IHgucyxcclxuICAgICAgICAgICAgYiA9ICh5ID0gbmV3IEJpZyh5KSkucztcclxuXHJcbiAgICAgICAgLy8gU2lnbnMgZGlmZmVyP1xyXG4gICAgICAgIGlmIChhICE9IGIpIHtcclxuICAgICAgICAgICAgeS5zID0gLWI7XHJcbiAgICAgICAgICAgIHJldHVybiB4LnBsdXMoeSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgeGMgPSB4LmMuc2xpY2UoKSxcclxuICAgICAgICAgICAgeGUgPSB4LmUsXHJcbiAgICAgICAgICAgIHljID0geS5jLFxyXG4gICAgICAgICAgICB5ZSA9IHkuZTtcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHkgaXMgbm9uLXplcm8/IHggaXMgbm9uLXplcm8/IE9yIGJvdGggYXJlIHplcm8uXHJcbiAgICAgICAgICAgIHJldHVybiB5Y1swXSA/ICh5LnMgPSAtYiwgeSkgOiBuZXcgQmlnKHhjWzBdID8geCA6IDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoaWNoIGlzIHRoZSBiaWdnZXIgbnVtYmVyLlxyXG4gICAgICAgIC8vIFByZXBlbmQgemVyb3MgdG8gZXF1YWxpc2UgZXhwb25lbnRzLlxyXG4gICAgICAgIGlmIChhID0geGUgLSB5ZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKHhMVHkgPSBhIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgYSA9IC1hO1xyXG4gICAgICAgICAgICAgICAgdCA9IHhjO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgeWUgPSB4ZTtcclxuICAgICAgICAgICAgICAgIHQgPSB5YztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgIGZvciAoYiA9IGE7IGItLTsgdC5wdXNoKDApKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIEV4cG9uZW50cyBlcXVhbC4gQ2hlY2sgZGlnaXQgYnkgZGlnaXQuXHJcbiAgICAgICAgICAgIGogPSAoKHhMVHkgPSB4Yy5sZW5ndGggPCB5Yy5sZW5ndGgpID8geGMgOiB5YykubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgZm9yIChhID0gYiA9IDA7IGIgPCBqOyBiKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoeGNbYl0gIT0geWNbYl0pIHtcclxuICAgICAgICAgICAgICAgICAgICB4TFR5ID0geGNbYl0gPCB5Y1tiXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8geCA8IHk/IFBvaW50IHhjIHRvIHRoZSBhcnJheSBvZiB0aGUgYmlnZ2VyIG51bWJlci5cclxuICAgICAgICBpZiAoeExUeSkge1xyXG4gICAgICAgICAgICB0ID0geGM7XHJcbiAgICAgICAgICAgIHhjID0geWM7XHJcbiAgICAgICAgICAgIHljID0gdDtcclxuICAgICAgICAgICAgeS5zID0gLXkucztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogQXBwZW5kIHplcm9zIHRvIHhjIGlmIHNob3J0ZXIuIE5vIG5lZWQgdG8gYWRkIHplcm9zIHRvIHljIGlmIHNob3J0ZXJcclxuICAgICAgICAgKiBhcyBzdWJ0cmFjdGlvbiBvbmx5IG5lZWRzIHRvIHN0YXJ0IGF0IHljLmxlbmd0aC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBpZiAoKCBiID0gKGogPSB5Yy5sZW5ndGgpIC0gKGkgPSB4Yy5sZW5ndGgpICkgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKDsgYi0tOyB4Y1tpKytdID0gMCkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTdWJ0cmFjdCB5YyBmcm9tIHhjLlxyXG4gICAgICAgIGZvciAoYiA9IGk7IGogPiBhOyl7XHJcblxyXG4gICAgICAgICAgICBpZiAoeGNbLS1qXSA8IHljW2pdKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gajsgaSAmJiAheGNbLS1pXTsgeGNbaV0gPSA5KSB7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAtLXhjW2ldO1xyXG4gICAgICAgICAgICAgICAgeGNbal0gKz0gMTA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgeGNbal0gLT0geWNbal07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yICg7IHhjWy0tYl0gPT09IDA7IHhjLnBvcCgpKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgbGVhZGluZyB6ZXJvcyBhbmQgYWRqdXN0IGV4cG9uZW50IGFjY29yZGluZ2x5LlxyXG4gICAgICAgIGZvciAoOyB4Y1swXSA9PT0gMDspIHtcclxuICAgICAgICAgICAgeGMuc2hpZnQoKTtcclxuICAgICAgICAgICAgLS15ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICgheGNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIG4gLSBuID0gKzBcclxuICAgICAgICAgICAgeS5zID0gMTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlc3VsdCBtdXN0IGJlIHplcm8uXHJcbiAgICAgICAgICAgIHhjID0gW3llID0gMF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB5LmMgPSB4YztcclxuICAgICAgICB5LmUgPSB5ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgbW9kdWxvIHRoZVxyXG4gICAgICogdmFsdWUgb2YgQmlnIHkuXHJcbiAgICAgKi9cclxuICAgIFAubW9kID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgeUdUeCxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIGEgPSB4LnMsXHJcbiAgICAgICAgICAgIGIgPSAoeSA9IG5ldyBCaWcoeSkpLnM7XHJcblxyXG4gICAgICAgIGlmICgheS5jWzBdKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKE5hTik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB4LnMgPSB5LnMgPSAxO1xyXG4gICAgICAgIHlHVHggPSB5LmNtcCh4KSA9PSAxO1xyXG4gICAgICAgIHgucyA9IGE7XHJcbiAgICAgICAgeS5zID0gYjtcclxuXHJcbiAgICAgICAgaWYgKHlHVHgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWcoeCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhID0gQmlnLkRQO1xyXG4gICAgICAgIGIgPSBCaWcuUk07XHJcbiAgICAgICAgQmlnLkRQID0gQmlnLlJNID0gMDtcclxuICAgICAgICB4ID0geC5kaXYoeSk7XHJcbiAgICAgICAgQmlnLkRQID0gYTtcclxuICAgICAgICBCaWcuUk0gPSBiO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5taW51cyggeC50aW1lcyh5KSApO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHBsdXMgdGhlIHZhbHVlXHJcbiAgICAgKiBvZiBCaWcgeS5cclxuICAgICAqL1xyXG4gICAgUC5hZGQgPSBQLnBsdXMgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciB0LFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgYSA9IHgucyxcclxuICAgICAgICAgICAgYiA9ICh5ID0gbmV3IEJpZyh5KSkucztcclxuXHJcbiAgICAgICAgLy8gU2lnbnMgZGlmZmVyP1xyXG4gICAgICAgIGlmIChhICE9IGIpIHtcclxuICAgICAgICAgICAgeS5zID0gLWI7XHJcbiAgICAgICAgICAgIHJldHVybiB4Lm1pbnVzKHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHhlID0geC5lLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgeWUgPSB5LmUsXHJcbiAgICAgICAgICAgIHljID0geS5jO1xyXG5cclxuICAgICAgICAvLyBFaXRoZXIgemVybz9cclxuICAgICAgICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xyXG5cclxuICAgICAgICAgICAgLy8geSBpcyBub24temVybz8geCBpcyBub24temVybz8gT3IgYm90aCBhcmUgemVyby5cclxuICAgICAgICAgICAgcmV0dXJuIHljWzBdID8geSA6IG5ldyBCaWcoeGNbMF0gPyB4IDogYSAqIDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB4YyA9IHhjLnNsaWNlKCk7XHJcblxyXG4gICAgICAgIC8vIFByZXBlbmQgemVyb3MgdG8gZXF1YWxpc2UgZXhwb25lbnRzLlxyXG4gICAgICAgIC8vIE5vdGU6IEZhc3RlciB0byB1c2UgcmV2ZXJzZSB0aGVuIGRvIHVuc2hpZnRzLlxyXG4gICAgICAgIGlmIChhID0geGUgLSB5ZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKGEgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB5ZSA9IHhlO1xyXG4gICAgICAgICAgICAgICAgdCA9IHljO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYSA9IC1hO1xyXG4gICAgICAgICAgICAgICAgdCA9IHhjO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgICAgICAgZm9yICg7IGEtLTsgdC5wdXNoKDApKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBQb2ludCB4YyB0byB0aGUgbG9uZ2VyIGFycmF5LlxyXG4gICAgICAgIGlmICh4Yy5sZW5ndGggLSB5Yy5sZW5ndGggPCAwKSB7XHJcbiAgICAgICAgICAgIHQgPSB5YztcclxuICAgICAgICAgICAgeWMgPSB4YztcclxuICAgICAgICAgICAgeGMgPSB0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBhID0geWMubGVuZ3RoO1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIE9ubHkgc3RhcnQgYWRkaW5nIGF0IHljLmxlbmd0aCAtIDEgYXMgdGhlIGZ1cnRoZXIgZGlnaXRzIG9mIHhjIGNhbiBiZVxyXG4gICAgICAgICAqIGxlZnQgYXMgdGhleSBhcmUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZm9yIChiID0gMDsgYTspIHtcclxuICAgICAgICAgICAgYiA9ICh4Y1stLWFdID0geGNbYV0gKyB5Y1thXSArIGIpIC8gMTAgfCAwO1xyXG4gICAgICAgICAgICB4Y1thXSAlPSAxMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE5vIG5lZWQgdG8gY2hlY2sgZm9yIHplcm8sIGFzICt4ICsgK3kgIT0gMCAmJiAteCArIC15ICE9IDBcclxuXHJcbiAgICAgICAgaWYgKGIpIHtcclxuICAgICAgICAgICAgeGMudW5zaGlmdChiKTtcclxuICAgICAgICAgICAgKyt5ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yIChhID0geGMubGVuZ3RoOyB4Y1stLWFdID09PSAwOyB4Yy5wb3AoKSkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgeS5jID0geGM7XHJcbiAgICAgICAgeS5lID0geWU7XHJcblxyXG4gICAgICAgIHJldHVybiB5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgcmFpc2VkIHRvIHRoZSBwb3dlciBuLlxyXG4gICAgICogSWYgbiBpcyBuZWdhdGl2ZSwgcm91bmQsIGlmIG5lY2Vzc2FyeSwgdG8gYSBtYXhpbXVtIG9mIEJpZy5EUCBkZWNpbWFsXHJcbiAgICAgKiBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBCaWcuUk0uXHJcbiAgICAgKlxyXG4gICAgICogbiB7bnVtYmVyfSBJbnRlZ2VyLCAtTUFYX1BPV0VSIHRvIE1BWF9QT1dFUiBpbmNsdXNpdmUuXHJcbiAgICAgKi9cclxuICAgIFAucG93ID0gZnVuY3Rpb24gKG4pIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIG9uZSA9IG5ldyB4LmNvbnN0cnVjdG9yKDEpLFxyXG4gICAgICAgICAgICB5ID0gb25lLFxyXG4gICAgICAgICAgICBpc05lZyA9IG4gPCAwO1xyXG5cclxuICAgICAgICBpZiAobiAhPT0gfn5uIHx8IG4gPCAtTUFYX1BPV0VSIHx8IG4gPiBNQVhfUE9XRVIpIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyFwb3chJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuID0gaXNOZWcgPyAtbiA6IG47XHJcblxyXG4gICAgICAgIGZvciAoOzspIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChuICYgMSkge1xyXG4gICAgICAgICAgICAgICAgeSA9IHkudGltZXMoeCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbiA+Pj0gMTtcclxuXHJcbiAgICAgICAgICAgIGlmICghbikge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgeCA9IHgudGltZXMoeCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaXNOZWcgPyBvbmUuZGl2KHkpIDogeTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyByb3VuZGVkIHRvIGFcclxuICAgICAqIG1heGltdW0gb2YgZHAgZGVjaW1hbCBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBybS5cclxuICAgICAqIElmIGRwIGlzIG5vdCBzcGVjaWZpZWQsIHJvdW5kIHRvIDAgZGVjaW1hbCBwbGFjZXMuXHJcbiAgICAgKiBJZiBybSBpcyBub3Qgc3BlY2lmaWVkLCB1c2UgQmlnLlJNLlxyXG4gICAgICpcclxuICAgICAqIFtkcF0ge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICogW3JtXSAwLCAxLCAyIG9yIDMgKFJPVU5EX0RPV04sIFJPVU5EX0hBTEZfVVAsIFJPVU5EX0hBTEZfRVZFTiwgUk9VTkRfVVApXHJcbiAgICAgKi9cclxuICAgIFAucm91bmQgPSBmdW5jdGlvbiAoZHAsIHJtKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yO1xyXG5cclxuICAgICAgICBpZiAoZHAgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBkcCA9IDA7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkcCAhPT0gfn5kcCB8fCBkcCA8IDAgfHwgZHAgPiBNQVhfRFApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyFyb3VuZCEnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcm5kKHggPSBuZXcgQmlnKHgpLCBkcCwgcm0gPT0gbnVsbCA/IEJpZy5STSA6IHJtKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgc3F1YXJlIHJvb3Qgb2YgdGhlIHZhbHVlIG9mIHRoaXMgQmlnLFxyXG4gICAgICogcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB0byBhIG1heGltdW0gb2YgQmlnLkRQIGRlY2ltYWwgcGxhY2VzIHVzaW5nXHJcbiAgICAgKiByb3VuZGluZyBtb2RlIEJpZy5STS5cclxuICAgICAqL1xyXG4gICAgUC5zcXJ0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBlc3RpbWF0ZSwgciwgYXBwcm94LFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIGkgPSB4LnMsXHJcbiAgICAgICAgICAgIGUgPSB4LmUsXHJcbiAgICAgICAgICAgIGhhbGYgPSBuZXcgQmlnKCcwLjUnKTtcclxuXHJcbiAgICAgICAgLy8gWmVybz9cclxuICAgICAgICBpZiAoIXhjWzBdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnKHgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgbmVnYXRpdmUsIHRocm93IE5hTi5cclxuICAgICAgICBpZiAoaSA8IDApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoTmFOKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEVzdGltYXRlLlxyXG4gICAgICAgIGkgPSBNYXRoLnNxcnQoeC50b1N0cmluZygpKTtcclxuXHJcbiAgICAgICAgLy8gTWF0aC5zcXJ0IHVuZGVyZmxvdy9vdmVyZmxvdz9cclxuICAgICAgICAvLyBQYXNzIHggdG8gTWF0aC5zcXJ0IGFzIGludGVnZXIsIHRoZW4gYWRqdXN0IHRoZSByZXN1bHQgZXhwb25lbnQuXHJcbiAgICAgICAgaWYgKGkgPT09IDAgfHwgaSA9PT0gMSAvIDApIHtcclxuICAgICAgICAgICAgZXN0aW1hdGUgPSB4Yy5qb2luKCcnKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghKGVzdGltYXRlLmxlbmd0aCArIGUgJiAxKSkge1xyXG4gICAgICAgICAgICAgICAgZXN0aW1hdGUgKz0gJzAnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByID0gbmV3IEJpZyggTWF0aC5zcXJ0KGVzdGltYXRlKS50b1N0cmluZygpICk7XHJcbiAgICAgICAgICAgIHIuZSA9ICgoZSArIDEpIC8gMiB8IDApIC0gKGUgPCAwIHx8IGUgJiAxKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByID0gbmV3IEJpZyhpLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaSA9IHIuZSArIChCaWcuRFAgKz0gNCk7XHJcblxyXG4gICAgICAgIC8vIE5ld3Rvbi1SYXBoc29uIGl0ZXJhdGlvbi5cclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIGFwcHJveCA9IHI7XHJcbiAgICAgICAgICAgIHIgPSBoYWxmLnRpbWVzKCBhcHByb3gucGx1cyggeC5kaXYoYXBwcm94KSApICk7XHJcbiAgICAgICAgfSB3aGlsZSAoIGFwcHJveC5jLnNsaWNlKDAsIGkpLmpvaW4oJycpICE9PVxyXG4gICAgICAgICAgICAgICAgICAgICAgIHIuYy5zbGljZSgwLCBpKS5qb2luKCcnKSApO1xyXG5cclxuICAgICAgICBybmQociwgQmlnLkRQIC09IDQsIEJpZy5STSk7XHJcblxyXG4gICAgICAgIHJldHVybiByO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHRpbWVzIHRoZSB2YWx1ZSBvZlxyXG4gICAgICogQmlnIHkuXHJcbiAgICAgKi9cclxuICAgIFAubXVsID0gUC50aW1lcyA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIGMsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgeWMgPSAoeSA9IG5ldyBCaWcoeSkpLmMsXHJcbiAgICAgICAgICAgIGEgPSB4Yy5sZW5ndGgsXHJcbiAgICAgICAgICAgIGIgPSB5Yy5sZW5ndGgsXHJcbiAgICAgICAgICAgIGkgPSB4LmUsXHJcbiAgICAgICAgICAgIGogPSB5LmU7XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSBzaWduIG9mIHJlc3VsdC5cclxuICAgICAgICB5LnMgPSB4LnMgPT0geS5zID8gMSA6IC0xO1xyXG5cclxuICAgICAgICAvLyBSZXR1cm4gc2lnbmVkIDAgaWYgZWl0aGVyIDAuXHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWcoeS5zICogMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXNlIGV4cG9uZW50IG9mIHJlc3VsdCBhcyB4LmUgKyB5LmUuXHJcbiAgICAgICAgeS5lID0gaSArIGo7XHJcblxyXG4gICAgICAgIC8vIElmIGFycmF5IHhjIGhhcyBmZXdlciBkaWdpdHMgdGhhbiB5Yywgc3dhcCB4YyBhbmQgeWMsIGFuZCBsZW5ndGhzLlxyXG4gICAgICAgIGlmIChhIDwgYikge1xyXG4gICAgICAgICAgICBjID0geGM7XHJcbiAgICAgICAgICAgIHhjID0geWM7XHJcbiAgICAgICAgICAgIHljID0gYztcclxuICAgICAgICAgICAgaiA9IGE7XHJcbiAgICAgICAgICAgIGEgPSBiO1xyXG4gICAgICAgICAgICBiID0gajtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpc2UgY29lZmZpY2llbnQgYXJyYXkgb2YgcmVzdWx0IHdpdGggemVyb3MuXHJcbiAgICAgICAgZm9yIChjID0gbmV3IEFycmF5KGogPSBhICsgYik7IGotLTsgY1tqXSA9IDApIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE11bHRpcGx5LlxyXG5cclxuICAgICAgICAvLyBpIGlzIGluaXRpYWxseSB4Yy5sZW5ndGguXHJcbiAgICAgICAgZm9yIChpID0gYjsgaS0tOykge1xyXG4gICAgICAgICAgICBiID0gMDtcclxuXHJcbiAgICAgICAgICAgIC8vIGEgaXMgeWMubGVuZ3RoLlxyXG4gICAgICAgICAgICBmb3IgKGogPSBhICsgaTsgaiA+IGk7KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3VycmVudCBzdW0gb2YgcHJvZHVjdHMgYXQgdGhpcyBkaWdpdCBwb3NpdGlvbiwgcGx1cyBjYXJyeS5cclxuICAgICAgICAgICAgICAgIGIgPSBjW2pdICsgeWNbaV0gKiB4Y1tqIC0gaSAtIDFdICsgYjtcclxuICAgICAgICAgICAgICAgIGNbai0tXSA9IGIgJSAxMDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBjYXJyeVxyXG4gICAgICAgICAgICAgICAgYiA9IGIgLyAxMCB8IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY1tqXSA9IChjW2pdICsgYikgJSAxMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluY3JlbWVudCByZXN1bHQgZXhwb25lbnQgaWYgdGhlcmUgaXMgYSBmaW5hbCBjYXJyeS5cclxuICAgICAgICBpZiAoYikge1xyXG4gICAgICAgICAgICArK3kuZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBhbnkgbGVhZGluZyB6ZXJvLlxyXG4gICAgICAgIGlmICghY1swXSkge1xyXG4gICAgICAgICAgICBjLnNoaWZ0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yIChpID0gYy5sZW5ndGg7ICFjWy0taV07IGMucG9wKCkpIHtcclxuICAgICAgICB9XHJcbiAgICAgICAgeS5jID0gYztcclxuXHJcbiAgICAgICAgcmV0dXJuIHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcuXHJcbiAgICAgKiBSZXR1cm4gZXhwb25lbnRpYWwgbm90YXRpb24gaWYgdGhpcyBCaWcgaGFzIGEgcG9zaXRpdmUgZXhwb25lbnQgZXF1YWwgdG9cclxuICAgICAqIG9yIGdyZWF0ZXIgdGhhbiBCaWcuRV9QT1MsIG9yIGEgbmVnYXRpdmUgZXhwb25lbnQgZXF1YWwgdG8gb3IgbGVzcyB0aGFuXHJcbiAgICAgKiBCaWcuRV9ORUcuXHJcbiAgICAgKi9cclxuICAgIFAudG9TdHJpbmcgPSBQLnZhbHVlT2YgPSBQLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIGUgPSB4LmUsXHJcbiAgICAgICAgICAgIHN0ciA9IHguYy5qb2luKCcnKSxcclxuICAgICAgICAgICAgc3RyTCA9IHN0ci5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8vIEV4cG9uZW50aWFsIG5vdGF0aW9uP1xyXG4gICAgICAgIGlmIChlIDw9IEJpZy5FX05FRyB8fCBlID49IEJpZy5FX1BPUykge1xyXG4gICAgICAgICAgICBzdHIgPSBzdHIuY2hhckF0KDApICsgKHN0ckwgPiAxID8gJy4nICsgc3RyLnNsaWNlKDEpIDogJycpICtcclxuICAgICAgICAgICAgICAoZSA8IDAgPyAnZScgOiAnZSsnKSArIGU7XHJcblxyXG4gICAgICAgIC8vIE5lZ2F0aXZlIGV4cG9uZW50P1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZSA8IDApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFByZXBlbmQgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoOyArK2U7IHN0ciA9ICcwJyArIHN0cikge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN0ciA9ICcwLicgKyBzdHI7XHJcblxyXG4gICAgICAgIC8vIFBvc2l0aXZlIGV4cG9uZW50P1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZSA+IDApIHtcclxuXHJcbiAgICAgICAgICAgIGlmICgrK2UgPiBzdHJMKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQXBwZW5kIHplcm9zLlxyXG4gICAgICAgICAgICAgICAgZm9yIChlIC09IHN0ckw7IGUtLSA7IHN0ciArPSAnMCcpIHtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChlIDwgc3RyTCkge1xyXG4gICAgICAgICAgICAgICAgc3RyID0gc3RyLnNsaWNlKDAsIGUpICsgJy4nICsgc3RyLnNsaWNlKGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEV4cG9uZW50IHplcm8uXHJcbiAgICAgICAgfSBlbHNlIGlmIChzdHJMID4gMSkge1xyXG4gICAgICAgICAgICBzdHIgPSBzdHIuY2hhckF0KDApICsgJy4nICsgc3RyLnNsaWNlKDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQXZvaWQgJy0wJ1xyXG4gICAgICAgIHJldHVybiB4LnMgPCAwICYmIHguY1swXSA/ICctJyArIHN0ciA6IHN0cjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgKiBJZiB0b0V4cG9uZW50aWFsLCB0b0ZpeGVkLCB0b1ByZWNpc2lvbiBhbmQgZm9ybWF0IGFyZSBub3QgcmVxdWlyZWQgdGhleVxyXG4gICAgICogY2FuIHNhZmVseSBiZSBjb21tZW50ZWQtb3V0IG9yIGRlbGV0ZWQuIE5vIHJlZHVuZGFudCBjb2RlIHdpbGwgYmUgbGVmdC5cclxuICAgICAqIGZvcm1hdCBpcyB1c2VkIG9ubHkgYnkgdG9FeHBvbmVudGlhbCwgdG9GaXhlZCBhbmQgdG9QcmVjaXNpb24uXHJcbiAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgKi9cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGluIGV4cG9uZW50aWFsXHJcbiAgICAgKiBub3RhdGlvbiB0byBkcCBmaXhlZCBkZWNpbWFsIHBsYWNlcyBhbmQgcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB1c2luZ1xyXG4gICAgICogQmlnLlJNLlxyXG4gICAgICpcclxuICAgICAqIFtkcF0ge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBQLnRvRXhwb25lbnRpYWwgPSBmdW5jdGlvbiAoZHApIHtcclxuXHJcbiAgICAgICAgaWYgKGRwID09IG51bGwpIHtcclxuICAgICAgICAgICAgZHAgPSB0aGlzLmMubGVuZ3RoIC0gMTtcclxuICAgICAgICB9IGVsc2UgaWYgKGRwICE9PSB+fmRwIHx8IGRwIDwgMCB8fCBkcCA+IE1BWF9EUCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXRvRXhwIScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZvcm1hdCh0aGlzLCBkcCwgMSk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaW4gbm9ybWFsIG5vdGF0aW9uXHJcbiAgICAgKiB0byBkcCBmaXhlZCBkZWNpbWFsIHBsYWNlcyBhbmQgcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB1c2luZyBCaWcuUk0uXHJcbiAgICAgKlxyXG4gICAgICogW2RwXSB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKi9cclxuICAgIFAudG9GaXhlZCA9IGZ1bmN0aW9uIChkcCkge1xyXG4gICAgICAgIHZhciBzdHIsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBuZWcgPSBCaWcuRV9ORUcsXHJcbiAgICAgICAgICAgIHBvcyA9IEJpZy5FX1BPUztcclxuXHJcbiAgICAgICAgLy8gUHJldmVudCB0aGUgcG9zc2liaWxpdHkgb2YgZXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICAgICAgQmlnLkVfTkVHID0gLShCaWcuRV9QT1MgPSAxIC8gMCk7XHJcblxyXG4gICAgICAgIGlmIChkcCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IHgudG9TdHJpbmcoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGRwID09PSB+fmRwICYmIGRwID49IDAgJiYgZHAgPD0gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IGZvcm1hdCh4LCB4LmUgKyBkcCk7XHJcblxyXG4gICAgICAgICAgICAvLyAoLTApLnRvRml4ZWQoKSBpcyAnMCcsIGJ1dCAoLTAuMSkudG9GaXhlZCgpIGlzICctMCcuXHJcbiAgICAgICAgICAgIC8vICgtMCkudG9GaXhlZCgxKSBpcyAnMC4wJywgYnV0ICgtMC4wMSkudG9GaXhlZCgxKSBpcyAnLTAuMCcuXHJcbiAgICAgICAgICAgIGlmICh4LnMgPCAwICYmIHguY1swXSAmJiBzdHIuaW5kZXhPZignLScpIDwgMCkge1xyXG4gICAgICAgIC8vRS5nLiAtMC41IGlmIHJvdW5kZWQgdG8gLTAgd2lsbCBjYXVzZSB0b1N0cmluZyB0byBvbWl0IHRoZSBtaW51cyBzaWduLlxyXG4gICAgICAgICAgICAgICAgc3RyID0gJy0nICsgc3RyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEJpZy5FX05FRyA9IG5lZztcclxuICAgICAgICBCaWcuRV9QT1MgPSBwb3M7XHJcblxyXG4gICAgICAgIGlmICghc3RyKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchdG9GaXghJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHJvdW5kZWQgdG8gc2RcclxuICAgICAqIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyBCaWcuUk0uIFVzZSBleHBvbmVudGlhbCBub3RhdGlvbiBpZiBzZCBpcyBsZXNzXHJcbiAgICAgKiB0aGFuIHRoZSBudW1iZXIgb2YgZGlnaXRzIG5lY2Vzc2FyeSB0byByZXByZXNlbnQgdGhlIGludGVnZXIgcGFydCBvZiB0aGVcclxuICAgICAqIHZhbHVlIGluIG5vcm1hbCBub3RhdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBzZCB7bnVtYmVyfSBJbnRlZ2VyLCAxIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKi9cclxuICAgIFAudG9QcmVjaXNpb24gPSBmdW5jdGlvbiAoc2QpIHtcclxuXHJcbiAgICAgICAgaWYgKHNkID09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9TdHJpbmcoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHNkICE9PSB+fnNkIHx8IHNkIDwgMSB8fCBzZCA+IE1BWF9EUCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXRvUHJlIScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZvcm1hdCh0aGlzLCBzZCAtIDEsIDIpO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLy8gRXhwb3J0XHJcblxyXG5cclxuICAgIEJpZyA9IGJpZ0ZhY3RvcnkoKTtcclxuXHJcbiAgICAvL0FNRC5cclxuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcclxuICAgICAgICBkZWZpbmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gQmlnO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIC8vIE5vZGUgYW5kIG90aGVyIENvbW1vbkpTLWxpa2UgZW52aXJvbm1lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cy5cclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcclxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IEJpZztcclxuXHJcbiAgICAvL0Jyb3dzZXIuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGdsb2JhbC5CaWcgPSBCaWc7XHJcbiAgICB9XHJcbn0pKHRoaXMpO1xyXG4iLCJ2YXIgVk5vZGUgPSByZXF1aXJlKCcuL3Zub2RlJyk7XG52YXIgaXMgPSByZXF1aXJlKCcuL2lzJyk7XG5cbmZ1bmN0aW9uIGFkZE5TKGRhdGEsIGNoaWxkcmVuLCBzZWwpIHtcbiAgZGF0YS5ucyA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc7XG5cbiAgaWYgKHNlbCAhPT0gJ2ZvcmVpZ25PYmplY3QnICYmIGNoaWxkcmVuICE9PSB1bmRlZmluZWQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICBhZGROUyhjaGlsZHJlbltpXS5kYXRhLCBjaGlsZHJlbltpXS5jaGlsZHJlbiwgY2hpbGRyZW5baV0uc2VsKTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBoKHNlbCwgYiwgYykge1xuICB2YXIgZGF0YSA9IHt9LCBjaGlsZHJlbiwgdGV4dCwgaTtcbiAgaWYgKGMgIT09IHVuZGVmaW5lZCkge1xuICAgIGRhdGEgPSBiO1xuICAgIGlmIChpcy5hcnJheShjKSkgeyBjaGlsZHJlbiA9IGM7IH1cbiAgICBlbHNlIGlmIChpcy5wcmltaXRpdmUoYykpIHsgdGV4dCA9IGM7IH1cbiAgfSBlbHNlIGlmIChiICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAoaXMuYXJyYXkoYikpIHsgY2hpbGRyZW4gPSBiOyB9XG4gICAgZWxzZSBpZiAoaXMucHJpbWl0aXZlKGIpKSB7IHRleHQgPSBiOyB9XG4gICAgZWxzZSB7IGRhdGEgPSBiOyB9XG4gIH1cbiAgaWYgKGlzLmFycmF5KGNoaWxkcmVuKSkge1xuICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgaWYgKGlzLnByaW1pdGl2ZShjaGlsZHJlbltpXSkpIGNoaWxkcmVuW2ldID0gVk5vZGUodW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgY2hpbGRyZW5baV0pO1xuICAgIH1cbiAgfVxuICBpZiAoc2VsWzBdID09PSAncycgJiYgc2VsWzFdID09PSAndicgJiYgc2VsWzJdID09PSAnZycpIHtcbiAgICBhZGROUyhkYXRhLCBjaGlsZHJlbiwgc2VsKTtcbiAgfVxuICByZXR1cm4gVk5vZGUoc2VsLCBkYXRhLCBjaGlsZHJlbiwgdGV4dCwgdW5kZWZpbmVkKTtcbn07XG4iLCJmdW5jdGlvbiBjcmVhdGVFbGVtZW50KHRhZ05hbWUpe1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSwgcXVhbGlmaWVkTmFtZSl7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlVVJJLCBxdWFsaWZpZWROYW1lKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlVGV4dE5vZGUodGV4dCl7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0KTtcbn1cblxuXG5mdW5jdGlvbiBpbnNlcnRCZWZvcmUocGFyZW50Tm9kZSwgbmV3Tm9kZSwgcmVmZXJlbmNlTm9kZSl7XG4gIHBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5ld05vZGUsIHJlZmVyZW5jZU5vZGUpO1xufVxuXG5cbmZ1bmN0aW9uIHJlbW92ZUNoaWxkKG5vZGUsIGNoaWxkKXtcbiAgbm9kZS5yZW1vdmVDaGlsZChjaGlsZCk7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZENoaWxkKG5vZGUsIGNoaWxkKXtcbiAgbm9kZS5hcHBlbmRDaGlsZChjaGlsZCk7XG59XG5cbmZ1bmN0aW9uIHBhcmVudE5vZGUobm9kZSl7XG4gIHJldHVybiBub2RlLnBhcmVudEVsZW1lbnQ7XG59XG5cbmZ1bmN0aW9uIG5leHRTaWJsaW5nKG5vZGUpe1xuICByZXR1cm4gbm9kZS5uZXh0U2libGluZztcbn1cblxuZnVuY3Rpb24gdGFnTmFtZShub2RlKXtcbiAgcmV0dXJuIG5vZGUudGFnTmFtZTtcbn1cblxuZnVuY3Rpb24gc2V0VGV4dENvbnRlbnQobm9kZSwgdGV4dCl7XG4gIG5vZGUudGV4dENvbnRlbnQgPSB0ZXh0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlRWxlbWVudDogY3JlYXRlRWxlbWVudCxcbiAgY3JlYXRlRWxlbWVudE5TOiBjcmVhdGVFbGVtZW50TlMsXG4gIGNyZWF0ZVRleHROb2RlOiBjcmVhdGVUZXh0Tm9kZSxcbiAgYXBwZW5kQ2hpbGQ6IGFwcGVuZENoaWxkLFxuICByZW1vdmVDaGlsZDogcmVtb3ZlQ2hpbGQsXG4gIGluc2VydEJlZm9yZTogaW5zZXJ0QmVmb3JlLFxuICBwYXJlbnROb2RlOiBwYXJlbnROb2RlLFxuICBuZXh0U2libGluZzogbmV4dFNpYmxpbmcsXG4gIHRhZ05hbWU6IHRhZ05hbWUsXG4gIHNldFRleHRDb250ZW50OiBzZXRUZXh0Q29udGVudFxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBhcnJheTogQXJyYXkuaXNBcnJheSxcbiAgcHJpbWl0aXZlOiBmdW5jdGlvbihzKSB7IHJldHVybiB0eXBlb2YgcyA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHMgPT09ICdudW1iZXInOyB9LFxufTtcbiIsInZhciBOYW1lc3BhY2VVUklzID0ge1xuICBcInhsaW5rXCI6IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiXG59O1xuXG52YXIgYm9vbGVhbkF0dHJzID0gW1wiYWxsb3dmdWxsc2NyZWVuXCIsIFwiYXN5bmNcIiwgXCJhdXRvZm9jdXNcIiwgXCJhdXRvcGxheVwiLCBcImNoZWNrZWRcIiwgXCJjb21wYWN0XCIsIFwiY29udHJvbHNcIiwgXCJkZWNsYXJlXCIsXG4gICAgICAgICAgICAgICAgXCJkZWZhdWx0XCIsIFwiZGVmYXVsdGNoZWNrZWRcIiwgXCJkZWZhdWx0bXV0ZWRcIiwgXCJkZWZhdWx0c2VsZWN0ZWRcIiwgXCJkZWZlclwiLCBcImRpc2FibGVkXCIsIFwiZHJhZ2dhYmxlXCIsXG4gICAgICAgICAgICAgICAgXCJlbmFibGVkXCIsIFwiZm9ybW5vdmFsaWRhdGVcIiwgXCJoaWRkZW5cIiwgXCJpbmRldGVybWluYXRlXCIsIFwiaW5lcnRcIiwgXCJpc21hcFwiLCBcIml0ZW1zY29wZVwiLCBcImxvb3BcIiwgXCJtdWx0aXBsZVwiLFxuICAgICAgICAgICAgICAgIFwibXV0ZWRcIiwgXCJub2hyZWZcIiwgXCJub3Jlc2l6ZVwiLCBcIm5vc2hhZGVcIiwgXCJub3ZhbGlkYXRlXCIsIFwibm93cmFwXCIsIFwib3BlblwiLCBcInBhdXNlb25leGl0XCIsIFwicmVhZG9ubHlcIixcbiAgICAgICAgICAgICAgICBcInJlcXVpcmVkXCIsIFwicmV2ZXJzZWRcIiwgXCJzY29wZWRcIiwgXCJzZWFtbGVzc1wiLCBcInNlbGVjdGVkXCIsIFwic29ydGFibGVcIiwgXCJzcGVsbGNoZWNrXCIsIFwidHJhbnNsYXRlXCIsXG4gICAgICAgICAgICAgICAgXCJ0cnVlc3BlZWRcIiwgXCJ0eXBlbXVzdG1hdGNoXCIsIFwidmlzaWJsZVwiXTtcblxudmFyIGJvb2xlYW5BdHRyc0RpY3QgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuZm9yKHZhciBpPTAsIGxlbiA9IGJvb2xlYW5BdHRycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICBib29sZWFuQXR0cnNEaWN0W2Jvb2xlYW5BdHRyc1tpXV0gPSB0cnVlO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVBdHRycyhvbGRWbm9kZSwgdm5vZGUpIHtcbiAgdmFyIGtleSwgY3VyLCBvbGQsIGVsbSA9IHZub2RlLmVsbSxcbiAgICAgIG9sZEF0dHJzID0gb2xkVm5vZGUuZGF0YS5hdHRycywgYXR0cnMgPSB2bm9kZS5kYXRhLmF0dHJzLCBuYW1lc3BhY2VTcGxpdDtcblxuICBpZiAoIW9sZEF0dHJzICYmICFhdHRycykgcmV0dXJuO1xuICBvbGRBdHRycyA9IG9sZEF0dHJzIHx8IHt9O1xuICBhdHRycyA9IGF0dHJzIHx8IHt9O1xuXG4gIC8vIHVwZGF0ZSBtb2RpZmllZCBhdHRyaWJ1dGVzLCBhZGQgbmV3IGF0dHJpYnV0ZXNcbiAgZm9yIChrZXkgaW4gYXR0cnMpIHtcbiAgICBjdXIgPSBhdHRyc1trZXldO1xuICAgIG9sZCA9IG9sZEF0dHJzW2tleV07XG4gICAgaWYgKG9sZCAhPT0gY3VyKSB7XG4gICAgICBpZighY3VyICYmIGJvb2xlYW5BdHRyc0RpY3Rba2V5XSlcbiAgICAgICAgZWxtLnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICAgICAgZWxzZSB7XG4gICAgICAgIG5hbWVzcGFjZVNwbGl0ID0ga2V5LnNwbGl0KFwiOlwiKTtcbiAgICAgICAgaWYobmFtZXNwYWNlU3BsaXQubGVuZ3RoID4gMSAmJiBOYW1lc3BhY2VVUklzLmhhc093blByb3BlcnR5KG5hbWVzcGFjZVNwbGl0WzBdKSlcbiAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlTlMoTmFtZXNwYWNlVVJJc1tuYW1lc3BhY2VTcGxpdFswXV0sIGtleSwgY3VyKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGVsbS5zZXRBdHRyaWJ1dGUoa2V5LCBjdXIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvL3JlbW92ZSByZW1vdmVkIGF0dHJpYnV0ZXNcbiAgLy8gdXNlIGBpbmAgb3BlcmF0b3Igc2luY2UgdGhlIHByZXZpb3VzIGBmb3JgIGl0ZXJhdGlvbiB1c2VzIGl0ICguaS5lLiBhZGQgZXZlbiBhdHRyaWJ1dGVzIHdpdGggdW5kZWZpbmVkIHZhbHVlKVxuICAvLyB0aGUgb3RoZXIgb3B0aW9uIGlzIHRvIHJlbW92ZSBhbGwgYXR0cmlidXRlcyB3aXRoIHZhbHVlID09IHVuZGVmaW5lZFxuICBmb3IgKGtleSBpbiBvbGRBdHRycykge1xuICAgIGlmICghKGtleSBpbiBhdHRycykpIHtcbiAgICAgIGVsbS5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7Y3JlYXRlOiB1cGRhdGVBdHRycywgdXBkYXRlOiB1cGRhdGVBdHRyc307XG4iLCJmdW5jdGlvbiB1cGRhdGVDbGFzcyhvbGRWbm9kZSwgdm5vZGUpIHtcbiAgdmFyIGN1ciwgbmFtZSwgZWxtID0gdm5vZGUuZWxtLFxuICAgICAgb2xkQ2xhc3MgPSBvbGRWbm9kZS5kYXRhLmNsYXNzLFxuICAgICAga2xhc3MgPSB2bm9kZS5kYXRhLmNsYXNzO1xuXG4gIGlmICghb2xkQ2xhc3MgJiYgIWtsYXNzKSByZXR1cm47XG4gIG9sZENsYXNzID0gb2xkQ2xhc3MgfHwge307XG4gIGtsYXNzID0ga2xhc3MgfHwge307XG5cbiAgZm9yIChuYW1lIGluIG9sZENsYXNzKSB7XG4gICAgaWYgKCFrbGFzc1tuYW1lXSkge1xuICAgICAgZWxtLmNsYXNzTGlzdC5yZW1vdmUobmFtZSk7XG4gICAgfVxuICB9XG4gIGZvciAobmFtZSBpbiBrbGFzcykge1xuICAgIGN1ciA9IGtsYXNzW25hbWVdO1xuICAgIGlmIChjdXIgIT09IG9sZENsYXNzW25hbWVdKSB7XG4gICAgICBlbG0uY2xhc3NMaXN0W2N1ciA/ICdhZGQnIDogJ3JlbW92ZSddKG5hbWUpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtjcmVhdGU6IHVwZGF0ZUNsYXNzLCB1cGRhdGU6IHVwZGF0ZUNsYXNzfTtcbiIsImZ1bmN0aW9uIGludm9rZUhhbmRsZXIoaGFuZGxlciwgdm5vZGUsIGV2ZW50KSB7XG4gIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgLy8gY2FsbCBmdW5jdGlvbiBoYW5kbGVyXG4gICAgaGFuZGxlci5jYWxsKHZub2RlLCBldmVudCwgdm5vZGUpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiKSB7XG4gICAgLy8gY2FsbCBoYW5kbGVyIHdpdGggYXJndW1lbnRzXG4gICAgaWYgKHR5cGVvZiBoYW5kbGVyWzBdID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIC8vIHNwZWNpYWwgY2FzZSBmb3Igc2luZ2xlIGFyZ3VtZW50IGZvciBwZXJmb3JtYW5jZVxuICAgICAgaWYgKGhhbmRsZXIubGVuZ3RoID09PSAyKSB7XG4gICAgICAgIGhhbmRsZXJbMF0uY2FsbCh2bm9kZSwgaGFuZGxlclsxXSwgZXZlbnQsIHZub2RlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBhcmdzID0gaGFuZGxlci5zbGljZSgxKTtcbiAgICAgICAgYXJncy5wdXNoKGV2ZW50KTtcbiAgICAgICAgYXJncy5wdXNoKHZub2RlKTtcbiAgICAgICAgaGFuZGxlclswXS5hcHBseSh2bm9kZSwgYXJncyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGNhbGwgbXVsdGlwbGUgaGFuZGxlcnNcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGFuZGxlci5sZW5ndGg7IGkrKykge1xuICAgICAgICBpbnZva2VIYW5kbGVyKGhhbmRsZXJbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBoYW5kbGVFdmVudChldmVudCwgdm5vZGUpIHtcbiAgdmFyIG5hbWUgPSBldmVudC50eXBlLFxuICAgICAgb24gPSB2bm9kZS5kYXRhLm9uO1xuXG4gIC8vIGNhbGwgZXZlbnQgaGFuZGxlcihzKSBpZiBleGlzdHNcbiAgaWYgKG9uICYmIG9uW25hbWVdKSB7XG4gICAgaW52b2tlSGFuZGxlcihvbltuYW1lXSwgdm5vZGUsIGV2ZW50KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVMaXN0ZW5lcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGhhbmRsZXIoZXZlbnQpIHtcbiAgICBoYW5kbGVFdmVudChldmVudCwgaGFuZGxlci52bm9kZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlRXZlbnRMaXN0ZW5lcnMob2xkVm5vZGUsIHZub2RlKSB7XG4gIHZhciBvbGRPbiA9IG9sZFZub2RlLmRhdGEub24sXG4gICAgICBvbGRMaXN0ZW5lciA9IG9sZFZub2RlLmxpc3RlbmVyLFxuICAgICAgb2xkRWxtID0gb2xkVm5vZGUuZWxtLFxuICAgICAgb24gPSB2bm9kZSAmJiB2bm9kZS5kYXRhLm9uLFxuICAgICAgZWxtID0gdm5vZGUgJiYgdm5vZGUuZWxtLFxuICAgICAgbmFtZTtcblxuICAvLyBvcHRpbWl6YXRpb24gZm9yIHJldXNlZCBpbW11dGFibGUgaGFuZGxlcnNcbiAgaWYgKG9sZE9uID09PSBvbikge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIHJlbW92ZSBleGlzdGluZyBsaXN0ZW5lcnMgd2hpY2ggbm8gbG9uZ2VyIHVzZWRcbiAgaWYgKG9sZE9uICYmIG9sZExpc3RlbmVyKSB7XG4gICAgLy8gaWYgZWxlbWVudCBjaGFuZ2VkIG9yIGRlbGV0ZWQgd2UgcmVtb3ZlIGFsbCBleGlzdGluZyBsaXN0ZW5lcnMgdW5jb25kaXRpb25hbGx5XG4gICAgaWYgKCFvbikge1xuICAgICAgZm9yIChuYW1lIGluIG9sZE9uKSB7XG4gICAgICAgIC8vIHJlbW92ZSBsaXN0ZW5lciBpZiBlbGVtZW50IHdhcyBjaGFuZ2VkIG9yIGV4aXN0aW5nIGxpc3RlbmVycyByZW1vdmVkXG4gICAgICAgIG9sZEVsbS5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIG9sZExpc3RlbmVyLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAobmFtZSBpbiBvbGRPbikge1xuICAgICAgICAvLyByZW1vdmUgbGlzdGVuZXIgaWYgZXhpc3RpbmcgbGlzdGVuZXIgcmVtb3ZlZFxuICAgICAgICBpZiAoIW9uW25hbWVdKSB7XG4gICAgICAgICAgb2xkRWxtLnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgb2xkTGlzdGVuZXIsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIGFkZCBuZXcgbGlzdGVuZXJzIHdoaWNoIGhhcyBub3QgYWxyZWFkeSBhdHRhY2hlZFxuICBpZiAob24pIHtcbiAgICAvLyByZXVzZSBleGlzdGluZyBsaXN0ZW5lciBvciBjcmVhdGUgbmV3XG4gICAgdmFyIGxpc3RlbmVyID0gdm5vZGUubGlzdGVuZXIgPSBvbGRWbm9kZS5saXN0ZW5lciB8fCBjcmVhdGVMaXN0ZW5lcigpO1xuICAgIC8vIHVwZGF0ZSB2bm9kZSBmb3IgbGlzdGVuZXJcbiAgICBsaXN0ZW5lci52bm9kZSA9IHZub2RlO1xuXG4gICAgLy8gaWYgZWxlbWVudCBjaGFuZ2VkIG9yIGFkZGVkIHdlIGFkZCBhbGwgbmVlZGVkIGxpc3RlbmVycyB1bmNvbmRpdGlvbmFsbHlcbiAgICBpZiAoIW9sZE9uKSB7XG4gICAgICBmb3IgKG5hbWUgaW4gb24pIHtcbiAgICAgICAgLy8gYWRkIGxpc3RlbmVyIGlmIGVsZW1lbnQgd2FzIGNoYW5nZWQgb3IgbmV3IGxpc3RlbmVycyBhZGRlZFxuICAgICAgICBlbG0uYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBsaXN0ZW5lciwgZmFsc2UpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKG5hbWUgaW4gb24pIHtcbiAgICAgICAgLy8gYWRkIGxpc3RlbmVyIGlmIG5ldyBsaXN0ZW5lciBhZGRlZFxuICAgICAgICBpZiAoIW9sZE9uW25hbWVdKSB7XG4gICAgICAgICAgZWxtLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgbGlzdGVuZXIsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiB1cGRhdGVFdmVudExpc3RlbmVycyxcbiAgdXBkYXRlOiB1cGRhdGVFdmVudExpc3RlbmVycyxcbiAgZGVzdHJveTogdXBkYXRlRXZlbnRMaXN0ZW5lcnNcbn07XG4iLCJmdW5jdGlvbiB1cGRhdGVQcm9wcyhvbGRWbm9kZSwgdm5vZGUpIHtcbiAgdmFyIGtleSwgY3VyLCBvbGQsIGVsbSA9IHZub2RlLmVsbSxcbiAgICAgIG9sZFByb3BzID0gb2xkVm5vZGUuZGF0YS5wcm9wcywgcHJvcHMgPSB2bm9kZS5kYXRhLnByb3BzO1xuXG4gIGlmICghb2xkUHJvcHMgJiYgIXByb3BzKSByZXR1cm47XG4gIG9sZFByb3BzID0gb2xkUHJvcHMgfHwge307XG4gIHByb3BzID0gcHJvcHMgfHwge307XG5cbiAgZm9yIChrZXkgaW4gb2xkUHJvcHMpIHtcbiAgICBpZiAoIXByb3BzW2tleV0pIHtcbiAgICAgIGRlbGV0ZSBlbG1ba2V5XTtcbiAgICB9XG4gIH1cbiAgZm9yIChrZXkgaW4gcHJvcHMpIHtcbiAgICBjdXIgPSBwcm9wc1trZXldO1xuICAgIG9sZCA9IG9sZFByb3BzW2tleV07XG4gICAgaWYgKG9sZCAhPT0gY3VyICYmIChrZXkgIT09ICd2YWx1ZScgfHwgZWxtW2tleV0gIT09IGN1cikpIHtcbiAgICAgIGVsbVtrZXldID0gY3VyO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtjcmVhdGU6IHVwZGF0ZVByb3BzLCB1cGRhdGU6IHVwZGF0ZVByb3BzfTtcbiIsInZhciByYWYgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkgfHwgc2V0VGltZW91dDtcbnZhciBuZXh0RnJhbWUgPSBmdW5jdGlvbihmbikgeyByYWYoZnVuY3Rpb24oKSB7IHJhZihmbik7IH0pOyB9O1xuXG5mdW5jdGlvbiBzZXROZXh0RnJhbWUob2JqLCBwcm9wLCB2YWwpIHtcbiAgbmV4dEZyYW1lKGZ1bmN0aW9uKCkgeyBvYmpbcHJvcF0gPSB2YWw7IH0pO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVTdHlsZShvbGRWbm9kZSwgdm5vZGUpIHtcbiAgdmFyIGN1ciwgbmFtZSwgZWxtID0gdm5vZGUuZWxtLFxuICAgICAgb2xkU3R5bGUgPSBvbGRWbm9kZS5kYXRhLnN0eWxlLFxuICAgICAgc3R5bGUgPSB2bm9kZS5kYXRhLnN0eWxlO1xuXG4gIGlmICghb2xkU3R5bGUgJiYgIXN0eWxlKSByZXR1cm47XG4gIG9sZFN0eWxlID0gb2xkU3R5bGUgfHwge307XG4gIHN0eWxlID0gc3R5bGUgfHwge307XG4gIHZhciBvbGRIYXNEZWwgPSAnZGVsYXllZCcgaW4gb2xkU3R5bGU7XG5cbiAgZm9yIChuYW1lIGluIG9sZFN0eWxlKSB7XG4gICAgaWYgKCFzdHlsZVtuYW1lXSkge1xuICAgICAgZWxtLnN0eWxlW25hbWVdID0gJyc7XG4gICAgfVxuICB9XG4gIGZvciAobmFtZSBpbiBzdHlsZSkge1xuICAgIGN1ciA9IHN0eWxlW25hbWVdO1xuICAgIGlmIChuYW1lID09PSAnZGVsYXllZCcpIHtcbiAgICAgIGZvciAobmFtZSBpbiBzdHlsZS5kZWxheWVkKSB7XG4gICAgICAgIGN1ciA9IHN0eWxlLmRlbGF5ZWRbbmFtZV07XG4gICAgICAgIGlmICghb2xkSGFzRGVsIHx8IGN1ciAhPT0gb2xkU3R5bGUuZGVsYXllZFtuYW1lXSkge1xuICAgICAgICAgIHNldE5leHRGcmFtZShlbG0uc3R5bGUsIG5hbWUsIGN1cik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG5hbWUgIT09ICdyZW1vdmUnICYmIGN1ciAhPT0gb2xkU3R5bGVbbmFtZV0pIHtcbiAgICAgIGVsbS5zdHlsZVtuYW1lXSA9IGN1cjtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYXBwbHlEZXN0cm95U3R5bGUodm5vZGUpIHtcbiAgdmFyIHN0eWxlLCBuYW1lLCBlbG0gPSB2bm9kZS5lbG0sIHMgPSB2bm9kZS5kYXRhLnN0eWxlO1xuICBpZiAoIXMgfHwgIShzdHlsZSA9IHMuZGVzdHJveSkpIHJldHVybjtcbiAgZm9yIChuYW1lIGluIHN0eWxlKSB7XG4gICAgZWxtLnN0eWxlW25hbWVdID0gc3R5bGVbbmFtZV07XG4gIH1cbn1cblxuZnVuY3Rpb24gYXBwbHlSZW1vdmVTdHlsZSh2bm9kZSwgcm0pIHtcbiAgdmFyIHMgPSB2bm9kZS5kYXRhLnN0eWxlO1xuICBpZiAoIXMgfHwgIXMucmVtb3ZlKSB7XG4gICAgcm0oKTtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG5hbWUsIGVsbSA9IHZub2RlLmVsbSwgaWR4LCBpID0gMCwgbWF4RHVyID0gMCxcbiAgICAgIGNvbXBTdHlsZSwgc3R5bGUgPSBzLnJlbW92ZSwgYW1vdW50ID0gMCwgYXBwbGllZCA9IFtdO1xuICBmb3IgKG5hbWUgaW4gc3R5bGUpIHtcbiAgICBhcHBsaWVkLnB1c2gobmFtZSk7XG4gICAgZWxtLnN0eWxlW25hbWVdID0gc3R5bGVbbmFtZV07XG4gIH1cbiAgY29tcFN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbG0pO1xuICB2YXIgcHJvcHMgPSBjb21wU3R5bGVbJ3RyYW5zaXRpb24tcHJvcGVydHknXS5zcGxpdCgnLCAnKTtcbiAgZm9yICg7IGkgPCBwcm9wcy5sZW5ndGg7ICsraSkge1xuICAgIGlmKGFwcGxpZWQuaW5kZXhPZihwcm9wc1tpXSkgIT09IC0xKSBhbW91bnQrKztcbiAgfVxuICBlbG0uYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIGZ1bmN0aW9uKGV2KSB7XG4gICAgaWYgKGV2LnRhcmdldCA9PT0gZWxtKSAtLWFtb3VudDtcbiAgICBpZiAoYW1vdW50ID09PSAwKSBybSgpO1xuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7Y3JlYXRlOiB1cGRhdGVTdHlsZSwgdXBkYXRlOiB1cGRhdGVTdHlsZSwgZGVzdHJveTogYXBwbHlEZXN0cm95U3R5bGUsIHJlbW92ZTogYXBwbHlSZW1vdmVTdHlsZX07XG4iLCIvLyBqc2hpbnQgbmV3Y2FwOiBmYWxzZVxuLyogZ2xvYmFsIHJlcXVpcmUsIG1vZHVsZSwgZG9jdW1lbnQsIE5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFZOb2RlID0gcmVxdWlyZSgnLi92bm9kZScpO1xudmFyIGlzID0gcmVxdWlyZSgnLi9pcycpO1xudmFyIGRvbUFwaSA9IHJlcXVpcmUoJy4vaHRtbGRvbWFwaScpO1xuXG5mdW5jdGlvbiBpc1VuZGVmKHMpIHsgcmV0dXJuIHMgPT09IHVuZGVmaW5lZDsgfVxuZnVuY3Rpb24gaXNEZWYocykgeyByZXR1cm4gcyAhPT0gdW5kZWZpbmVkOyB9XG5cbnZhciBlbXB0eU5vZGUgPSBWTm9kZSgnJywge30sIFtdLCB1bmRlZmluZWQsIHVuZGVmaW5lZCk7XG5cbmZ1bmN0aW9uIHNhbWVWbm9kZSh2bm9kZTEsIHZub2RlMikge1xuICByZXR1cm4gdm5vZGUxLmtleSA9PT0gdm5vZGUyLmtleSAmJiB2bm9kZTEuc2VsID09PSB2bm9kZTIuc2VsO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVLZXlUb09sZElkeChjaGlsZHJlbiwgYmVnaW5JZHgsIGVuZElkeCkge1xuICB2YXIgaSwgbWFwID0ge30sIGtleTtcbiAgZm9yIChpID0gYmVnaW5JZHg7IGkgPD0gZW5kSWR4OyArK2kpIHtcbiAgICBrZXkgPSBjaGlsZHJlbltpXS5rZXk7XG4gICAgaWYgKGlzRGVmKGtleSkpIG1hcFtrZXldID0gaTtcbiAgfVxuICByZXR1cm4gbWFwO1xufVxuXG52YXIgaG9va3MgPSBbJ2NyZWF0ZScsICd1cGRhdGUnLCAncmVtb3ZlJywgJ2Rlc3Ryb3knLCAncHJlJywgJ3Bvc3QnXTtcblxuZnVuY3Rpb24gaW5pdChtb2R1bGVzLCBhcGkpIHtcbiAgdmFyIGksIGosIGNicyA9IHt9O1xuXG4gIGlmIChpc1VuZGVmKGFwaSkpIGFwaSA9IGRvbUFwaTtcblxuICBmb3IgKGkgPSAwOyBpIDwgaG9va3MubGVuZ3RoOyArK2kpIHtcbiAgICBjYnNbaG9va3NbaV1dID0gW107XG4gICAgZm9yIChqID0gMDsgaiA8IG1vZHVsZXMubGVuZ3RoOyArK2opIHtcbiAgICAgIGlmIChtb2R1bGVzW2pdW2hvb2tzW2ldXSAhPT0gdW5kZWZpbmVkKSBjYnNbaG9va3NbaV1dLnB1c2gobW9kdWxlc1tqXVtob29rc1tpXV0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGVtcHR5Tm9kZUF0KGVsbSkge1xuICAgIHZhciBpZCA9IGVsbS5pZCA/ICcjJyArIGVsbS5pZCA6ICcnO1xuICAgIHZhciBjID0gZWxtLmNsYXNzTmFtZSA/ICcuJyArIGVsbS5jbGFzc05hbWUuc3BsaXQoJyAnKS5qb2luKCcuJykgOiAnJztcbiAgICByZXR1cm4gVk5vZGUoYXBpLnRhZ05hbWUoZWxtKS50b0xvd2VyQ2FzZSgpICsgaWQgKyBjLCB7fSwgW10sIHVuZGVmaW5lZCwgZWxtKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVJtQ2IoY2hpbGRFbG0sIGxpc3RlbmVycykge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgtLWxpc3RlbmVycyA9PT0gMCkge1xuICAgICAgICB2YXIgcGFyZW50ID0gYXBpLnBhcmVudE5vZGUoY2hpbGRFbG0pO1xuICAgICAgICBhcGkucmVtb3ZlQ2hpbGQocGFyZW50LCBjaGlsZEVsbSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUVsbSh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgdmFyIGksIGRhdGEgPSB2bm9kZS5kYXRhO1xuICAgIGlmIChpc0RlZihkYXRhKSkge1xuICAgICAgaWYgKGlzRGVmKGkgPSBkYXRhLmhvb2spICYmIGlzRGVmKGkgPSBpLmluaXQpKSB7XG4gICAgICAgIGkodm5vZGUpO1xuICAgICAgICBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIGVsbSwgY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbiwgc2VsID0gdm5vZGUuc2VsO1xuICAgIGlmIChpc0RlZihzZWwpKSB7XG4gICAgICAvLyBQYXJzZSBzZWxlY3RvclxuICAgICAgdmFyIGhhc2hJZHggPSBzZWwuaW5kZXhPZignIycpO1xuICAgICAgdmFyIGRvdElkeCA9IHNlbC5pbmRleE9mKCcuJywgaGFzaElkeCk7XG4gICAgICB2YXIgaGFzaCA9IGhhc2hJZHggPiAwID8gaGFzaElkeCA6IHNlbC5sZW5ndGg7XG4gICAgICB2YXIgZG90ID0gZG90SWR4ID4gMCA/IGRvdElkeCA6IHNlbC5sZW5ndGg7XG4gICAgICB2YXIgdGFnID0gaGFzaElkeCAhPT0gLTEgfHwgZG90SWR4ICE9PSAtMSA/IHNlbC5zbGljZSgwLCBNYXRoLm1pbihoYXNoLCBkb3QpKSA6IHNlbDtcbiAgICAgIGVsbSA9IHZub2RlLmVsbSA9IGlzRGVmKGRhdGEpICYmIGlzRGVmKGkgPSBkYXRhLm5zKSA/IGFwaS5jcmVhdGVFbGVtZW50TlMoaSwgdGFnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogYXBpLmNyZWF0ZUVsZW1lbnQodGFnKTtcbiAgICAgIGlmIChoYXNoIDwgZG90KSBlbG0uaWQgPSBzZWwuc2xpY2UoaGFzaCArIDEsIGRvdCk7XG4gICAgICBpZiAoZG90SWR4ID4gMCkgZWxtLmNsYXNzTmFtZSA9IHNlbC5zbGljZShkb3QgKyAxKS5yZXBsYWNlKC9cXC4vZywgJyAnKTtcbiAgICAgIGlmIChpcy5hcnJheShjaGlsZHJlbikpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgYXBpLmFwcGVuZENoaWxkKGVsbSwgY3JlYXRlRWxtKGNoaWxkcmVuW2ldLCBpbnNlcnRlZFZub2RlUXVldWUpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChpcy5wcmltaXRpdmUodm5vZGUudGV4dCkpIHtcbiAgICAgICAgYXBpLmFwcGVuZENoaWxkKGVsbSwgYXBpLmNyZWF0ZVRleHROb2RlKHZub2RlLnRleHQpKTtcbiAgICAgIH1cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMuY3JlYXRlLmxlbmd0aDsgKytpKSBjYnMuY3JlYXRlW2ldKGVtcHR5Tm9kZSwgdm5vZGUpO1xuICAgICAgaSA9IHZub2RlLmRhdGEuaG9vazsgLy8gUmV1c2UgdmFyaWFibGVcbiAgICAgIGlmIChpc0RlZihpKSkge1xuICAgICAgICBpZiAoaS5jcmVhdGUpIGkuY3JlYXRlKGVtcHR5Tm9kZSwgdm5vZGUpO1xuICAgICAgICBpZiAoaS5pbnNlcnQpIGluc2VydGVkVm5vZGVRdWV1ZS5wdXNoKHZub2RlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZWxtID0gdm5vZGUuZWxtID0gYXBpLmNyZWF0ZVRleHROb2RlKHZub2RlLnRleHQpO1xuICAgIH1cbiAgICByZXR1cm4gdm5vZGUuZWxtO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkVm5vZGVzKHBhcmVudEVsbSwgYmVmb3JlLCB2bm9kZXMsIHN0YXJ0SWR4LCBlbmRJZHgsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgIGZvciAoOyBzdGFydElkeCA8PSBlbmRJZHg7ICsrc3RhcnRJZHgpIHtcbiAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBjcmVhdGVFbG0odm5vZGVzW3N0YXJ0SWR4XSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSwgYmVmb3JlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbnZva2VEZXN0cm95SG9vayh2bm9kZSkge1xuICAgIHZhciBpLCBqLCBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICBpZiAoaXNEZWYoZGF0YSkpIHtcbiAgICAgIGlmIChpc0RlZihpID0gZGF0YS5ob29rKSAmJiBpc0RlZihpID0gaS5kZXN0cm95KSkgaSh2bm9kZSk7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLmRlc3Ryb3kubGVuZ3RoOyArK2kpIGNicy5kZXN0cm95W2ldKHZub2RlKTtcbiAgICAgIGlmIChpc0RlZihpID0gdm5vZGUuY2hpbGRyZW4pKSB7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCB2bm9kZS5jaGlsZHJlbi5sZW5ndGg7ICsraikge1xuICAgICAgICAgIGludm9rZURlc3Ryb3lIb29rKHZub2RlLmNoaWxkcmVuW2pdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZVZub2RlcyhwYXJlbnRFbG0sIHZub2Rlcywgc3RhcnRJZHgsIGVuZElkeCkge1xuICAgIGZvciAoOyBzdGFydElkeCA8PSBlbmRJZHg7ICsrc3RhcnRJZHgpIHtcbiAgICAgIHZhciBpLCBsaXN0ZW5lcnMsIHJtLCBjaCA9IHZub2Rlc1tzdGFydElkeF07XG4gICAgICBpZiAoaXNEZWYoY2gpKSB7XG4gICAgICAgIGlmIChpc0RlZihjaC5zZWwpKSB7XG4gICAgICAgICAgaW52b2tlRGVzdHJveUhvb2soY2gpO1xuICAgICAgICAgIGxpc3RlbmVycyA9IGNicy5yZW1vdmUubGVuZ3RoICsgMTtcbiAgICAgICAgICBybSA9IGNyZWF0ZVJtQ2IoY2guZWxtLCBsaXN0ZW5lcnMpO1xuICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMucmVtb3ZlLmxlbmd0aDsgKytpKSBjYnMucmVtb3ZlW2ldKGNoLCBybSk7XG4gICAgICAgICAgaWYgKGlzRGVmKGkgPSBjaC5kYXRhKSAmJiBpc0RlZihpID0gaS5ob29rKSAmJiBpc0RlZihpID0gaS5yZW1vdmUpKSB7XG4gICAgICAgICAgICBpKGNoLCBybSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJtKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgeyAvLyBUZXh0IG5vZGVcbiAgICAgICAgICBhcGkucmVtb3ZlQ2hpbGQocGFyZW50RWxtLCBjaC5lbG0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlQ2hpbGRyZW4ocGFyZW50RWxtLCBvbGRDaCwgbmV3Q2gsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgIHZhciBvbGRTdGFydElkeCA9IDAsIG5ld1N0YXJ0SWR4ID0gMDtcbiAgICB2YXIgb2xkRW5kSWR4ID0gb2xkQ2gubGVuZ3RoIC0gMTtcbiAgICB2YXIgb2xkU3RhcnRWbm9kZSA9IG9sZENoWzBdO1xuICAgIHZhciBvbGRFbmRWbm9kZSA9IG9sZENoW29sZEVuZElkeF07XG4gICAgdmFyIG5ld0VuZElkeCA9IG5ld0NoLmxlbmd0aCAtIDE7XG4gICAgdmFyIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFswXTtcbiAgICB2YXIgbmV3RW5kVm5vZGUgPSBuZXdDaFtuZXdFbmRJZHhdO1xuICAgIHZhciBvbGRLZXlUb0lkeCwgaWR4SW5PbGQsIGVsbVRvTW92ZSwgYmVmb3JlO1xuXG4gICAgd2hpbGUgKG9sZFN0YXJ0SWR4IDw9IG9sZEVuZElkeCAmJiBuZXdTdGFydElkeCA8PSBuZXdFbmRJZHgpIHtcbiAgICAgIGlmIChpc1VuZGVmKG9sZFN0YXJ0Vm5vZGUpKSB7XG4gICAgICAgIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFsrK29sZFN0YXJ0SWR4XTsgLy8gVm5vZGUgaGFzIGJlZW4gbW92ZWQgbGVmdFxuICAgICAgfSBlbHNlIGlmIChpc1VuZGVmKG9sZEVuZFZub2RlKSkge1xuICAgICAgICBvbGRFbmRWbm9kZSA9IG9sZENoWy0tb2xkRW5kSWR4XTtcbiAgICAgIH0gZWxzZSBpZiAoc2FtZVZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld1N0YXJ0Vm5vZGUpKSB7XG4gICAgICAgIHBhdGNoVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdO1xuICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICB9IGVsc2UgaWYgKHNhbWVWbm9kZShvbGRFbmRWbm9kZSwgbmV3RW5kVm5vZGUpKSB7XG4gICAgICAgIHBhdGNoVm5vZGUob2xkRW5kVm5vZGUsIG5ld0VuZFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICBvbGRFbmRWbm9kZSA9IG9sZENoWy0tb2xkRW5kSWR4XTtcbiAgICAgICAgbmV3RW5kVm5vZGUgPSBuZXdDaFstLW5ld0VuZElkeF07XG4gICAgICB9IGVsc2UgaWYgKHNhbWVWbm9kZShvbGRTdGFydFZub2RlLCBuZXdFbmRWbm9kZSkpIHsgLy8gVm5vZGUgbW92ZWQgcmlnaHRcbiAgICAgICAgcGF0Y2hWbm9kZShvbGRTdGFydFZub2RlLCBuZXdFbmRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtLCBhcGkubmV4dFNpYmxpbmcob2xkRW5kVm5vZGUuZWxtKSk7XG4gICAgICAgIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFsrK29sZFN0YXJ0SWR4XTtcbiAgICAgICAgbmV3RW5kVm5vZGUgPSBuZXdDaFstLW5ld0VuZElkeF07XG4gICAgICB9IGVsc2UgaWYgKHNhbWVWbm9kZShvbGRFbmRWbm9kZSwgbmV3U3RhcnRWbm9kZSkpIHsgLy8gVm5vZGUgbW92ZWQgbGVmdFxuICAgICAgICBwYXRjaFZub2RlKG9sZEVuZFZub2RlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgb2xkRW5kVm5vZGUuZWxtLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaXNVbmRlZihvbGRLZXlUb0lkeCkpIG9sZEtleVRvSWR4ID0gY3JlYXRlS2V5VG9PbGRJZHgob2xkQ2gsIG9sZFN0YXJ0SWR4LCBvbGRFbmRJZHgpO1xuICAgICAgICBpZHhJbk9sZCA9IG9sZEtleVRvSWR4W25ld1N0YXJ0Vm5vZGUua2V5XTtcbiAgICAgICAgaWYgKGlzVW5kZWYoaWR4SW5PbGQpKSB7IC8vIE5ldyBlbGVtZW50XG4gICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGNyZWF0ZUVsbShuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsbVRvTW92ZSA9IG9sZENoW2lkeEluT2xkXTtcbiAgICAgICAgICBwYXRjaFZub2RlKGVsbVRvTW92ZSwgbmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICBvbGRDaFtpZHhJbk9sZF0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGVsbVRvTW92ZS5lbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9sZFN0YXJ0SWR4ID4gb2xkRW5kSWR4KSB7XG4gICAgICBiZWZvcmUgPSBpc1VuZGVmKG5ld0NoW25ld0VuZElkeCsxXSkgPyBudWxsIDogbmV3Q2hbbmV3RW5kSWR4KzFdLmVsbTtcbiAgICAgIGFkZFZub2RlcyhwYXJlbnRFbG0sIGJlZm9yZSwgbmV3Q2gsIG5ld1N0YXJ0SWR4LCBuZXdFbmRJZHgsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgfSBlbHNlIGlmIChuZXdTdGFydElkeCA+IG5ld0VuZElkeCkge1xuICAgICAgcmVtb3ZlVm5vZGVzKHBhcmVudEVsbSwgb2xkQ2gsIG9sZFN0YXJ0SWR4LCBvbGRFbmRJZHgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBhdGNoVm5vZGUob2xkVm5vZGUsIHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpIHtcbiAgICB2YXIgaSwgaG9vaztcbiAgICBpZiAoaXNEZWYoaSA9IHZub2RlLmRhdGEpICYmIGlzRGVmKGhvb2sgPSBpLmhvb2spICYmIGlzRGVmKGkgPSBob29rLnByZXBhdGNoKSkge1xuICAgICAgaShvbGRWbm9kZSwgdm5vZGUpO1xuICAgIH1cbiAgICB2YXIgZWxtID0gdm5vZGUuZWxtID0gb2xkVm5vZGUuZWxtLCBvbGRDaCA9IG9sZFZub2RlLmNoaWxkcmVuLCBjaCA9IHZub2RlLmNoaWxkcmVuO1xuICAgIGlmIChvbGRWbm9kZSA9PT0gdm5vZGUpIHJldHVybjtcbiAgICBpZiAoIXNhbWVWbm9kZShvbGRWbm9kZSwgdm5vZGUpKSB7XG4gICAgICB2YXIgcGFyZW50RWxtID0gYXBpLnBhcmVudE5vZGUob2xkVm5vZGUuZWxtKTtcbiAgICAgIGVsbSA9IGNyZWF0ZUVsbSh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBlbG0sIG9sZFZub2RlLmVsbSk7XG4gICAgICByZW1vdmVWbm9kZXMocGFyZW50RWxtLCBbb2xkVm5vZGVdLCAwLCAwKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGlzRGVmKHZub2RlLmRhdGEpKSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLnVwZGF0ZS5sZW5ndGg7ICsraSkgY2JzLnVwZGF0ZVtpXShvbGRWbm9kZSwgdm5vZGUpO1xuICAgICAgaSA9IHZub2RlLmRhdGEuaG9vaztcbiAgICAgIGlmIChpc0RlZihpKSAmJiBpc0RlZihpID0gaS51cGRhdGUpKSBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgfVxuICAgIGlmIChpc1VuZGVmKHZub2RlLnRleHQpKSB7XG4gICAgICBpZiAoaXNEZWYob2xkQ2gpICYmIGlzRGVmKGNoKSkge1xuICAgICAgICBpZiAob2xkQ2ggIT09IGNoKSB1cGRhdGVDaGlsZHJlbihlbG0sIG9sZENoLCBjaCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNEZWYoY2gpKSB7XG4gICAgICAgIGlmIChpc0RlZihvbGRWbm9kZS50ZXh0KSkgYXBpLnNldFRleHRDb250ZW50KGVsbSwgJycpO1xuICAgICAgICBhZGRWbm9kZXMoZWxtLCBudWxsLCBjaCwgMCwgY2gubGVuZ3RoIC0gMSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNEZWYob2xkQ2gpKSB7XG4gICAgICAgIHJlbW92ZVZub2RlcyhlbG0sIG9sZENoLCAwLCBvbGRDaC5sZW5ndGggLSAxKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNEZWYob2xkVm5vZGUudGV4dCkpIHtcbiAgICAgICAgYXBpLnNldFRleHRDb250ZW50KGVsbSwgJycpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAob2xkVm5vZGUudGV4dCAhPT0gdm5vZGUudGV4dCkge1xuICAgICAgYXBpLnNldFRleHRDb250ZW50KGVsbSwgdm5vZGUudGV4dCk7XG4gICAgfVxuICAgIGlmIChpc0RlZihob29rKSAmJiBpc0RlZihpID0gaG9vay5wb3N0cGF0Y2gpKSB7XG4gICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG9sZFZub2RlLCB2bm9kZSkge1xuICAgIHZhciBpLCBlbG0sIHBhcmVudDtcbiAgICB2YXIgaW5zZXJ0ZWRWbm9kZVF1ZXVlID0gW107XG4gICAgZm9yIChpID0gMDsgaSA8IGNicy5wcmUubGVuZ3RoOyArK2kpIGNicy5wcmVbaV0oKTtcblxuICAgIGlmIChpc1VuZGVmKG9sZFZub2RlLnNlbCkpIHtcbiAgICAgIG9sZFZub2RlID0gZW1wdHlOb2RlQXQob2xkVm5vZGUpO1xuICAgIH1cblxuICAgIGlmIChzYW1lVm5vZGUob2xkVm5vZGUsIHZub2RlKSkge1xuICAgICAgcGF0Y2hWbm9kZShvbGRWbm9kZSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsbSA9IG9sZFZub2RlLmVsbTtcbiAgICAgIHBhcmVudCA9IGFwaS5wYXJlbnROb2RlKGVsbSk7XG5cbiAgICAgIGNyZWF0ZUVsbSh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcblxuICAgICAgaWYgKHBhcmVudCAhPT0gbnVsbCkge1xuICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudCwgdm5vZGUuZWxtLCBhcGkubmV4dFNpYmxpbmcoZWxtKSk7XG4gICAgICAgIHJlbW92ZVZub2RlcyhwYXJlbnQsIFtvbGRWbm9kZV0sIDAsIDApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoaSA9IDA7IGkgPCBpbnNlcnRlZFZub2RlUXVldWUubGVuZ3RoOyArK2kpIHtcbiAgICAgIGluc2VydGVkVm5vZGVRdWV1ZVtpXS5kYXRhLmhvb2suaW5zZXJ0KGluc2VydGVkVm5vZGVRdWV1ZVtpXSk7XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCBjYnMucG9zdC5sZW5ndGg7ICsraSkgY2JzLnBvc3RbaV0oKTtcbiAgICByZXR1cm4gdm5vZGU7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge2luaXQ6IGluaXR9O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzZWwsIGRhdGEsIGNoaWxkcmVuLCB0ZXh0LCBlbG0pIHtcbiAgdmFyIGtleSA9IGRhdGEgPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6IGRhdGEua2V5O1xuICByZXR1cm4ge3NlbDogc2VsLCBkYXRhOiBkYXRhLCBjaGlsZHJlbjogY2hpbGRyZW4sXG4gICAgICAgICAgdGV4dDogdGV4dCwgZWxtOiBlbG0sIGtleToga2V5fTtcbn07XG4iLCJmdW5jdGlvbiB1cGRhdGVQcm9wcyhvbGRWbm9kZSwgdm5vZGUpIHtcclxuICAgIHZhciBrZXksIGN1ciwgb2xkLCBlbG0gPSB2bm9kZS5lbG0sXHJcbiAgICAgICAgcHJvcHMgPSB2bm9kZS5kYXRhLmxpdmVQcm9wcyB8fCB7fTtcclxuICAgIGZvciAoa2V5IGluIHByb3BzKSB7XHJcbiAgICAgICAgY3VyID0gcHJvcHNba2V5XTtcclxuICAgICAgICBvbGQgPSBlbG1ba2V5XTtcclxuICAgICAgICBpZiAob2xkICE9PSBjdXIpIGVsbVtrZXldID0gY3VyO1xyXG4gICAgfVxyXG59XHJcbmNvbnN0IGxpdmVQcm9wc1BsdWdpbiA9IHtjcmVhdGU6IHVwZGF0ZVByb3BzLCB1cGRhdGU6IHVwZGF0ZVByb3BzfTtcclxuaW1wb3J0IHNuYWJiZG9tIGZyb20gXCJzbmFiYmRvbVwiXHJcbmltcG9ydCBoIGZyb20gXCJzbmFiYmRvbS9oXCJcclxuY29uc3QgcGF0Y2ggPSBzbmFiYmRvbS5pbml0KFtcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvY2xhc3MnKSxcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvcHJvcHMnKSxcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvc3R5bGUnKSxcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvZXZlbnRsaXN0ZW5lcnMnKSxcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvYXR0cmlidXRlcycpLFxyXG4gICAgbGl2ZVByb3BzUGx1Z2luXHJcbl0pO1xyXG5cclxuZnVuY3Rpb24gdXVpZCgpe3JldHVybihcIlwiKzFlNystMWUzKy00ZTMrLThlMystMWUxMSkucmVwbGFjZSgvMXwwL2csZnVuY3Rpb24oKXtyZXR1cm4oMHxNYXRoLnJhbmRvbSgpKjE2KS50b1N0cmluZygxNil9KX1cclxuaW1wb3J0IGJpZyBmcm9tICdiaWcuanMnXHJcbmJpZy5FX1BPUyA9IDFlKzZcclxuXHJcbmltcG9ydCB1Z25pcyBmcm9tICcuL3VnbmlzJ1xyXG5pbXBvcnQgc2F2ZWRBcHAgZnJvbSAnLi4vdWduaXNfY29tcG9uZW50cy9hcHAuanNvbidcclxuXHJcbmNvbnN0IHZlcnNpb24gPSAnMC4wLjI0didcclxuZWRpdG9yKHNhdmVkQXBwKVxyXG5cclxuZnVuY3Rpb24gZWRpdG9yKGFwcERlZmluaXRpb24pe1xyXG5cclxuICAgIGNvbnN0IHNhdmVkRGVmaW5pdGlvbiA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3NhdmVkX2FwcF8nICsgdmVyc2lvbikpXHJcbiAgICBjb25zdCBhcHAgPSB1Z25pcyhzYXZlZERlZmluaXRpb24gfHwgYXBwRGVmaW5pdGlvbilcclxuXHJcbiAgICBsZXQgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKG5vZGUpXHJcblxyXG4gICAgLy8gU3RhdGVcclxuICAgIGxldCBzdGF0ZSA9IHtcclxuICAgICAgICBsZWZ0T3BlbjogdHJ1ZSxcclxuICAgICAgICByaWdodE9wZW46IHRydWUsXHJcbiAgICAgICAgZWRpdG9yUmlnaHRXaWR0aDogMzUwLFxyXG4gICAgICAgIGVkaXRvckxlZnRXaWR0aDogMzUwLFxyXG4gICAgICAgIHN1YkVkaXRvcldpZHRoOiAzNTAsXHJcbiAgICAgICAgYXBwSXNGcm96ZW46IGZhbHNlLFxyXG4gICAgICAgIHNob3dpbmdWaWV3Tm9kZXM6IGZhbHNlLFxyXG4gICAgICAgIHNlbGVjdGVkVmlld05vZGU6IHt9LFxyXG4gICAgICAgIHNlbGVjdGVkRXZlbnRJZDogJycsXHJcbiAgICAgICAgc2VsZWN0ZWRQaXBlSWQ6ICcnLFxyXG4gICAgICAgIHNlbGVjdGVkU3RhdGVOb2RlSWQ6ICcnLFxyXG4gICAgICAgIHNlbGVjdGVkVmlld1N1Yk1lbnU6ICdwcm9wcycsXHJcbiAgICAgICAgZWRpdGluZ1RpdGxlTm9kZUlkOiAnJyxcclxuICAgICAgICB2aWV3Rm9sZGVyc0Nsb3NlZDoge30sXHJcbiAgICAgICAgZHJhZ01vdXNlTG9jYXRpb246IG51bGwsXHJcbiAgICAgICAgY3VycmVudGx5RHJhZ2dpbmc6ICcnLFxyXG4gICAgICAgIGV2ZW50U3RhY2s6IFtdLFxyXG4gICAgICAgIGRlZmluaXRpb246IHNhdmVkRGVmaW5pdGlvbiB8fCBhcHAuZGVmaW5pdGlvbixcclxuICAgIH1cclxuICAgIC8vIHVuZG8vcmVkb1xyXG4gICAgbGV0IHN0YXRlU3RhY2sgPSBbc3RhdGUuZGVmaW5pdGlvbl1cclxuICAgIGZ1bmN0aW9uIHNldFN0YXRlKG5ld1N0YXRlKXtcclxuICAgICAgICBpZihuZXdTdGF0ZSA9PT0gc3RhdGUpe1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ3N0YXRlIHdhcyBtdXRhdGVkLCBzZWFyY2ggZm9yIGEgYnVnJylcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoc3RhdGUuYXBwSXNGcm96ZW4gIT09IG5ld1N0YXRlLmFwcElzRnJvemVuIHx8IHN0YXRlLnNlbGVjdGVkVmlld05vZGUgIT09IG5ld1N0YXRlLnNlbGVjdGVkVmlld05vZGUgKXtcclxuICAgICAgICAgICAgYXBwLl9mcmVlemUobmV3U3RhdGUuYXBwSXNGcm96ZW4sIFZJRVdfTk9ERV9TRUxFQ1RFRCwgbmV3U3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoc3RhdGUuZGVmaW5pdGlvbiAhPT0gbmV3U3RhdGUuZGVmaW5pdGlvbil7XHJcbiAgICAgICAgICAgIC8vIHVuZG8vcmVkbyB0aGVuIHJlbmRlciB0aGVuIHNhdmVcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudEluZGV4ID0gc3RhdGVTdGFjay5maW5kSW5kZXgoKGEpPT5hPT09c3RhdGUuZGVmaW5pdGlvbilcclxuICAgICAgICAgICAgc3RhdGVTdGFjayA9IHN0YXRlU3RhY2suc2xpY2UoMCwgY3VycmVudEluZGV4KzEpLmNvbmNhdChuZXdTdGF0ZS5kZWZpbml0aW9uKTtcclxuICAgICAgICAgICAgLy8gVE9ETyBhZGQgZ2FyYmFnZSBjb2xsZWN0aW9uP1xyXG4gICAgICAgICAgICBhcHAucmVuZGVyKG5ld1N0YXRlLmRlZmluaXRpb24pXHJcbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdzYXZlZF9hcHBfJyt2ZXJzaW9uLCBKU09OLnN0cmluZ2lmeShuZXdTdGF0ZS5kZWZpbml0aW9uKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0YXRlID0gbmV3U3RhdGVcclxuICAgICAgICByZW5kZXIoKVxyXG4gICAgfVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSk9PiB7XHJcbiAgICAgICAgLy8gY2xpY2tlZCBvdXRzaWRlXHJcbiAgICAgICAgaWYoc3RhdGUuZWRpdGluZ1RpdGxlTm9kZUlkICYmICFlLnRhcmdldC5kYXRhc2V0LmlzdGl0bGVlZGl0b3Ipe1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGVkaXRpbmdUaXRsZU5vZGVJZDogJyd9KVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpPT57XHJcbiAgICAgICAgLy8gODMgLSBzXHJcbiAgICAgICAgLy8gOTAgLSB6XHJcbiAgICAgICAgLy8gODkgLSB5XHJcbiAgICAgICAgLy8gMzIgLSBzcGFjZVxyXG4gICAgICAgIC8vIDEzIC0gZW50ZXJcclxuICAgICAgICBpZihlLndoaWNoID09PSA4MyAmJiAobmF2aWdhdG9yLnBsYXRmb3JtLm1hdGNoKFwiTWFjXCIpID8gZS5tZXRhS2V5IDogZS5jdHJsS2V5KSkge1xyXG4gICAgICAgICAgICAvLyBUT0RPIGdhcmJhZ2UgY29sbGVjdFxyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGZldGNoKCcvc2F2ZScsIHttZXRob2Q6ICdQT1NUJywgYm9keTogSlNPTi5zdHJpbmdpZnkoc3RhdGUuZGVmaW5pdGlvbiksIGhlYWRlcnM6IHtcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIn19KVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKGUud2hpY2ggPT09IDMyICYmIChuYXZpZ2F0b3IucGxhdGZvcm0ubWF0Y2goXCJNYWNcIikgPyBlLm1ldGFLZXkgOiBlLmN0cmxLZXkpKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICBGUkVFWkVSX0NMSUNLRUQoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZighZS5zaGlmdEtleSAmJiBlLndoaWNoID09PSA5MCAmJiAobmF2aWdhdG9yLnBsYXRmb3JtLm1hdGNoKFwiTWFjXCIpID8gZS5tZXRhS2V5IDogZS5jdHJsS2V5KSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRJbmRleCA9IHN0YXRlU3RhY2suZmluZEluZGV4KChhKT0+YT09PXN0YXRlLmRlZmluaXRpb24pXHJcbiAgICAgICAgICAgIGlmKGN1cnJlbnRJbmRleCA+IDApe1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3RGVmaW5pdGlvbiA9IHN0YXRlU3RhY2tbY3VycmVudEluZGV4LTFdXHJcbiAgICAgICAgICAgICAgICBhcHAucmVuZGVyKG5ld0RlZmluaXRpb24pXHJcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjogbmV3RGVmaW5pdGlvbn1cclxuICAgICAgICAgICAgICAgIHJlbmRlcigpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoKGUud2hpY2ggPT09IDg5ICYmIChuYXZpZ2F0b3IucGxhdGZvcm0ubWF0Y2goXCJNYWNcIikgPyBlLm1ldGFLZXkgOiBlLmN0cmxLZXkpKSB8fCAoZS5zaGlmdEtleSAmJiBlLndoaWNoID09PSA5MCAmJiAobmF2aWdhdG9yLnBsYXRmb3JtLm1hdGNoKFwiTWFjXCIpID8gZS5tZXRhS2V5IDogZS5jdHJsS2V5KSkpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50SW5kZXggPSBzdGF0ZVN0YWNrLmZpbmRJbmRleCgoYSk9PmE9PT1zdGF0ZS5kZWZpbml0aW9uKVxyXG4gICAgICAgICAgICBpZihjdXJyZW50SW5kZXggPCBzdGF0ZVN0YWNrLmxlbmd0aC0xKXtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0RlZmluaXRpb24gPSBzdGF0ZVN0YWNrW2N1cnJlbnRJbmRleCsxXVxyXG4gICAgICAgICAgICAgICAgYXBwLnJlbmRlcihuZXdEZWZpbml0aW9uKVxyXG4gICAgICAgICAgICAgICAgc3RhdGUgPSB7Li4uc3RhdGUsIGRlZmluaXRpb246IG5ld0RlZmluaXRpb259XHJcbiAgICAgICAgICAgICAgICByZW5kZXIoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKGUud2hpY2ggPT09IDEzKSB7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZWRpdGluZ1RpdGxlTm9kZUlkOiAnJ30pXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICAvLyBMaXN0ZW4gdG8gYXBwXHJcbiAgICBhcHAuYWRkTGlzdGVuZXIoKGV2ZW50SWQsIGRhdGEsIGUsIHByZXZpb3VzU3RhdGUsIGN1cnJlbnRTdGF0ZSwgbXV0YXRpb25zKT0+e1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZXZlbnRTdGFjazogc3RhdGUuZXZlbnRTdGFjay5jb25jYXQoe2V2ZW50SWQsIGRhdGEsIGUsIHByZXZpb3VzU3RhdGUsIGN1cnJlbnRTdGF0ZSwgbXV0YXRpb25zfSl9KVxyXG4gICAgfSlcclxuXHJcbiAgICAvLyBBY3Rpb25zXHJcbiAgICBmdW5jdGlvbiBXSURUSF9EUkFHR0VEKHdpZHRoTmFtZSwgZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIGZ1bmN0aW9uIHJlc2l6ZShlKXtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIGxldCBuZXdXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoIC0gKGUudG91Y2hlcz8gZS50b3VjaGVzWzBdLnBhZ2VYOiBlLnBhZ2VYKVxyXG4gICAgICAgICAgICBpZih3aWR0aE5hbWUgPT09ICdlZGl0b3JMZWZ0V2lkdGgnKXtcclxuICAgICAgICAgICAgICAgIG5ld1dpZHRoID0gZS50b3VjaGVzPyBlLnRvdWNoZXNbMF0ucGFnZVg6IGUucGFnZVhcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZih3aWR0aE5hbWUgPT09ICdzdWJFZGl0b3JXaWR0aCcpe1xyXG4gICAgICAgICAgICAgICAgbmV3V2lkdGggPSBuZXdXaWR0aCAtIHN0YXRlLmVkaXRvclJpZ2h0V2lkdGggLSAxMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIEkgcHJvYmFibHkgd2FzIGRydW5rXHJcbiAgICAgICAgICAgIGlmKHdpZHRoTmFtZSAhPT0gJ3N1YkVkaXRvcldpZHRoJyAmJiAoICh3aWR0aE5hbWUgPT09ICdlZGl0b3JMZWZ0V2lkdGgnID8gc3RhdGUubGVmdE9wZW46IHN0YXRlLnJpZ2h0T3BlbikgPyBuZXdXaWR0aCA8IDE4MDogbmV3V2lkdGggPiAxODApKXtcclxuICAgICAgICAgICAgICAgIGlmKHdpZHRoTmFtZSA9PT0gJ2VkaXRvckxlZnRXaWR0aCcpe1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRTdGF0ZSh7Li4uc3RhdGUsIGxlZnRPcGVuOiAhc3RhdGUubGVmdE9wZW59KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNldFN0YXRlKHsuLi5zdGF0ZSwgcmlnaHRPcGVuOiAhc3RhdGUucmlnaHRPcGVufSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihuZXdXaWR0aCA8IDI1MCl7XHJcbiAgICAgICAgICAgICAgICBuZXdXaWR0aCA9IDI1MFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgW3dpZHRoTmFtZV06IG5ld1dpZHRofSlcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCByZXNpemUpXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHJlc2l6ZSlcclxuICAgICAgICBmdW5jdGlvbiBzdG9wRHJhZ2dpbmcoZSl7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgcmVzaXplKVxyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgcmVzaXplKVxyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHN0b3BEcmFnZ2luZylcclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgc3RvcERyYWdnaW5nKVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBzdG9wRHJhZ2dpbmcpXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgc3RvcERyYWdnaW5nKVxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gRlJFRVpFUl9DTElDS0VEKCkge1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgYXBwSXNGcm96ZW46ICFzdGF0ZS5hcHBJc0Zyb3plbn0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBWSUVXX0ZPTERFUl9DTElDS0VEKG5vZGVJZCkge1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgdmlld0ZvbGRlcnNDbG9zZWQ6ey4uLnN0YXRlLnZpZXdGb2xkZXJzQ2xvc2VkLCBbbm9kZUlkXTogIXN0YXRlLnZpZXdGb2xkZXJzQ2xvc2VkW25vZGVJZF19fSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFZJRVdfTk9ERV9TRUxFQ1RFRChyZWYpIHtcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIHNlbGVjdGVkVmlld05vZGU6cmVmfSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFVOU0VMRUNUX1ZJRVdfTk9ERShlKSB7XHJcbiAgICAgICAgaWYoZS50YXJnZXQgPT09IHRoaXMuZWxtKXtcclxuICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBzZWxlY3RlZFZpZXdOb2RlOnt9fSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBTVEFURV9OT0RFX1NFTEVDVEVEKG5vZGVJZCkge1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgc2VsZWN0ZWRTdGF0ZU5vZGVJZDpub2RlSWR9KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gVU5TRUxFQ1RfU1RBVEVfTk9ERShlKSB7XHJcbiAgICAgICAgaWYoZS50YXJnZXQgPT09IHRoaXMuZWxtKXtcclxuICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBzZWxlY3RlZFN0YXRlTm9kZUlkOicnLCBzZWxlY3RlZEV2ZW50SWQ6Jyd9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIERFTEVURV9TRUxFQ1RFRF9WSUVXKG5vZGVSZWYsIHBhcmVudFJlZiwgZSkge1xyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICBpZihub2RlUmVmLmlkID09PSAnX3Jvb3ROb2RlJyl7XHJcbiAgICAgICAgICAgIC8vIGltbXV0YWJseSByZW1vdmUgYWxsIG5vZGVzIGV4Y2VwdCByb290Tm9kZVxyXG4gICAgICAgICAgICByZXR1cm4gc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgdk5vZGVCb3g6IHsnX3Jvb3ROb2RlJzogey4uLnN0YXRlLmRlZmluaXRpb24udk5vZGVCb3hbJ19yb290Tm9kZSddLCBjaGlsZHJlbjogW119fSxcclxuICAgICAgICAgICAgfSwgc2VsZWN0ZWRWaWV3Tm9kZToge319KVxyXG4gICAgICAgIH1cclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgW3BhcmVudFJlZi5yZWZdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXSwgW3BhcmVudFJlZi5pZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdW3BhcmVudFJlZi5pZF0sIGNoaWxkcmVuOnN0YXRlLmRlZmluaXRpb25bcGFyZW50UmVmLnJlZl1bcGFyZW50UmVmLmlkXS5jaGlsZHJlbi5maWx0ZXIoKHJlZik9PnJlZi5pZCAhPT0gbm9kZVJlZi5pZCl9fSxcclxuICAgICAgICB9LCBzZWxlY3RlZFZpZXdOb2RlOiB7fX0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBOT0RFX0RSQUdHRUQodHlwZSwgZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIGZ1bmN0aW9uIHNob3dDb21wb25lbnQoZSl7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICBjb25zdCB4ID0gZS50b3VjaGVzPyBlLnRvdWNoZXNbMF0ucGFnZVg6IGUucGFnZVhcclxuICAgICAgICAgICAgY29uc3QgeSA9IGUudG91Y2hlcz8gZS50b3VjaGVzWzBdLnBhZ2VZOiBlLnBhZ2VZXHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZHJhZ01vdXNlTG9jYXRpb246IHt4LCB5fX0pXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgc2hvd0NvbXBvbmVudClcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgc2hvd0NvbXBvbmVudClcclxuICAgICAgICBmdW5jdGlvbiBzdG9wRHJhZ2dpbmcoZSl7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgc2hvd0NvbXBvbmVudClcclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHNob3dDb21wb25lbnQpXHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgc3RvcERyYWdnaW5nKVxyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBzdG9wRHJhZ2dpbmcpXHJcblxyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRyYWdNb3VzZUxvY2F0aW9uOiBudWxsLCBjdXJyZW50bHlEcmFnZ2luZzogJyd9KVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBzdG9wRHJhZ2dpbmcpXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgc3RvcERyYWdnaW5nKVxyXG4gICAgICAgIGNvbnN0IHggPSBlLnRvdWNoZXM/IGUudG91Y2hlc1swXS5wYWdlWDogZS5wYWdlWFxyXG4gICAgICAgIGNvbnN0IHkgPSBlLnRvdWNoZXM/IGUudG91Y2hlc1swXS5wYWdlWTogZS5wYWdlWVxyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZHJhZ01vdXNlTG9jYXRpb246IHt4LCB5fSwgY3VycmVudGx5RHJhZ2dpbmc6IHR5cGUsIHNob3dpbmdWaWV3Tm9kZXM6IGZhbHNlfSlcclxuICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIERSQUdHRURfT1ZFUl9NRShub2RlUmVmKSB7XHJcbiAgICAgICAgQUREX05PREUobm9kZVJlZiwgc3RhdGUuY3VycmVudGx5RHJhZ2dpbmcpXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBBRERfTk9ERShub2RlUmVmLCB0eXBlKSB7XHJcbiAgICAgICAgLy8gVE9ETyByZW1vdmUgd2hlbiBkcmFnZ2luZyB3b3Jrc1xyXG4gICAgICAgIGlmKCFub2RlUmVmLnJlZiB8fCAhc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZVJlZi5pZF0gfHwgIXN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVSZWYuaWRdLmNoaWxkcmVuKXtcclxuICAgICAgICAgICAgbm9kZVJlZiA9IHtyZWY6ICd2Tm9kZUJveCcsIGlkOiAnX3Jvb3ROb2RlJ31cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3Qgbm9kZUlkID0gbm9kZVJlZi5pZFxyXG4gICAgICAgIGNvbnN0IG5ld05vZGVJZCA9IHV1aWQoKVxyXG4gICAgICAgIGNvbnN0IG5ld1N0eWxlSWQgPSB1dWlkKClcclxuICAgICAgICBjb25zdCBuZXdTdHlsZSA9IHtcclxuICAgICAgICAgICAgcGFkZGluZzogJzEwcHgnLFxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0eXBlID09PSAnYm94Jykge1xyXG4gICAgICAgICAgICBjb25zdCBuZXdOb2RlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdib3gnLFxyXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtyZWY6J3N0eWxlJywgaWQ6bmV3U3R5bGVJZH0sXHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjogW10sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNldFN0YXRlKHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRWaWV3Tm9kZToge3JlZjondk5vZGVCb3gnLCBpZDogbmV3Tm9kZUlkfSxcclxuICAgICAgICAgICAgICAgIGRlZmluaXRpb246IG5vZGVSZWYucmVmID09PSAndk5vZGVCb3gnID8ge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgdk5vZGVCb3g6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnZOb2RlQm94LCBbbm9kZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb24udk5vZGVCb3hbbm9kZUlkXSwgY2hpbGRyZW46IHN0YXRlLmRlZmluaXRpb24udk5vZGVCb3hbbm9kZUlkXS5jaGlsZHJlbi5jb25jYXQoe3JlZjondk5vZGVCb3gnLCBpZDpuZXdOb2RlSWR9KX0sIFtuZXdOb2RlSWRdOiBuZXdOb2RlfSxcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogey4uLnN0YXRlLmRlZmluaXRpb24uc3R5bGUsIFtuZXdTdHlsZUlkXTogbmV3U3R5bGV9LFxyXG4gICAgICAgICAgICAgICAgfSA6IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIFtub2RlUmVmLnJlZl06IHsuLi5zdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXSwgW25vZGVJZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlSWRdLCBjaGlsZHJlbjogc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZUlkXS5jaGlsZHJlbi5jb25jYXQoe3JlZjondk5vZGVCb3gnLCBpZDpuZXdOb2RlSWR9KX19LFxyXG4gICAgICAgICAgICAgICAgICAgIHZOb2RlQm94OiB7Li4uc3RhdGUuZGVmaW5pdGlvbi52Tm9kZUJveCwgW25ld05vZGVJZF06IG5ld05vZGV9LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5zdHlsZSwgW25ld1N0eWxlSWRdOiBuZXdTdHlsZX0sXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHR5cGUgPT09ICd0ZXh0Jyl7XHJcbiAgICAgICAgICAgIGNvbnN0IHBpcGVJZCA9IHV1aWQoKVxyXG4gICAgICAgICAgICBjb25zdCBuZXdOb2RlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgIHN0eWxlOiB7cmVmOidzdHlsZScsIGlkOm5ld1N0eWxlSWR9LFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6J3BpcGUnLCBpZDpwaXBlSWR9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbmV3UGlwZSA9IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiAnRGVmYXVsdCBUZXh0JyxcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogW11cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc2V0U3RhdGUoe1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFZpZXdOb2RlOiB7cmVmOid2Tm9kZVRleHQnLCBpZDogbmV3Tm9kZUlkfSxcclxuICAgICAgICAgICAgICAgIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsIFtwaXBlSWRdOiBuZXdQaXBlfSxcclxuICAgICAgICAgICAgICAgICAgICBbbm9kZVJlZi5yZWZdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl0sIFtub2RlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZUlkXSwgY2hpbGRyZW46IHN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVJZF0uY2hpbGRyZW4uY29uY2F0KHtyZWY6J3ZOb2RlVGV4dCcsIGlkOm5ld05vZGVJZH0pfX0sXHJcbiAgICAgICAgICAgICAgICAgICAgdk5vZGVUZXh0OiB7Li4uc3RhdGUuZGVmaW5pdGlvbi52Tm9kZVRleHQsIFtuZXdOb2RlSWRdOiBuZXdOb2RlfSxcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogey4uLnN0YXRlLmRlZmluaXRpb24uc3R5bGUsIFtuZXdTdHlsZUlkXTogbmV3U3R5bGV9LFxyXG4gICAgICAgICAgICAgICAgfX0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHR5cGUgPT09ICdpbnB1dCcpIHtcclxuICAgICAgICAgICAgY29uc3Qgc3RhdGVJZCA9IHV1aWQoKVxyXG4gICAgICAgICAgICBjb25zdCBldmVudElkID0gdXVpZCgpXHJcbiAgICAgICAgICAgIGNvbnN0IG11dGF0b3JJZCA9IHV1aWQoKVxyXG4gICAgICAgICAgICBjb25zdCBwaXBlSW5wdXRJZCA9IHV1aWQoKVxyXG4gICAgICAgICAgICBjb25zdCBwaXBlTXV0YXRvcklkID0gdXVpZCgpXHJcbiAgICAgICAgICAgIGNvbnN0IG5ld05vZGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ2lucHV0JyxcclxuICAgICAgICAgICAgICAgIHN0eWxlOiB7cmVmOidzdHlsZScsIGlkOm5ld1N0eWxlSWR9LFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6J3BpcGUnLCBpZDpwaXBlSW5wdXRJZH0sXHJcbiAgICAgICAgICAgICAgICBpbnB1dDoge3JlZjonZXZlbnQnLCBpZDpldmVudElkfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1BpcGVJbnB1dCA9IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB7cmVmOiAnc3RhdGUnLCBpZDogc3RhdGVJZH0sXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFtdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbmV3UGlwZU11dGF0b3IgPSB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZToge3JlZjogJ2V2ZW50RGF0YScsIGlkOiAnX2lucHV0J30sXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFtdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbmV3U3RhdGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ2lucHV0IHZhbHVlJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgIHJlZjogc3RhdGVJZCxcclxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogJ0RlZmF1bHQgdGV4dCcsXHJcbiAgICAgICAgICAgICAgICBtdXRhdG9yczogW3sgcmVmOidtdXRhdG9yJywgaWQ6bXV0YXRvcklkfV0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbmV3TXV0YXRvciA9IHtcclxuICAgICAgICAgICAgICAgIGV2ZW50OiB7IHJlZjogJ2V2ZW50JywgaWQ6ZXZlbnRJZH0sXHJcbiAgICAgICAgICAgICAgICBzdGF0ZTogeyByZWY6ICdzdGF0ZScsIGlkOnN0YXRlSWR9LFxyXG4gICAgICAgICAgICAgICAgbXV0YXRpb246IHsgcmVmOiAncGlwZScsIGlkOiBwaXBlTXV0YXRvcklkfSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBuZXdFdmVudCA9IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdpbnB1dCcsXHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ3VwZGF0ZSBpbnB1dCcsXHJcbiAgICAgICAgICAgICAgICBtdXRhdG9yczogW1xyXG4gICAgICAgICAgICAgICAgICAgIHsgcmVmOiAnbXV0YXRvcicsIGlkOiBtdXRhdG9ySWR9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgIGVtaXR0ZXI6IHtcclxuICAgICAgICAgICAgICAgICAgICByZWY6ICd2Tm9kZUlucHV0JyxcclxuICAgICAgICAgICAgICAgICAgICBpZDogbmV3Tm9kZUlkLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IFtcclxuICAgICAgICAgICAgICAgICAgICB7cmVmOiAnZXZlbnREYXRhJywgaWQ6ICdfaW5wdXQnfVxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc2V0U3RhdGUoe1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFZpZXdOb2RlOiB7cmVmOid2Tm9kZUlucHV0JywgaWQ6IG5ld05vZGVJZH0sXHJcbiAgICAgICAgICAgICAgICBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBwaXBlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLCBbcGlwZUlucHV0SWRdOiBuZXdQaXBlSW5wdXQsIFtwaXBlTXV0YXRvcklkXTogbmV3UGlwZU11dGF0b3J9LFxyXG4gICAgICAgICAgICAgICAgICAgIFtub2RlUmVmLnJlZl06IHsuLi5zdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXSwgW25vZGVJZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlSWRdLCBjaGlsZHJlbjogc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZUlkXS5jaGlsZHJlbi5jb25jYXQoe3JlZjondk5vZGVJbnB1dCcsIGlkOm5ld05vZGVJZH0pfX0sXHJcbiAgICAgICAgICAgICAgICAgICAgdk5vZGVJbnB1dDogey4uLnN0YXRlLmRlZmluaXRpb24udk5vZGVJbnB1dCwgW25ld05vZGVJZF06IG5ld05vZGV9LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5zdHlsZSwgW25ld1N0eWxlSWRdOiBuZXdTdHlsZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZVNwYWNlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5uYW1lU3BhY2UsIFsnX3Jvb3ROYW1lU3BhY2UnXTogey4uLnN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlWydfcm9vdE5hbWVTcGFjZSddLCBjaGlsZHJlbjogc3RhdGUuZGVmaW5pdGlvbi5uYW1lU3BhY2VbJ19yb290TmFtZVNwYWNlJ10uY2hpbGRyZW4uY29uY2F0KHtyZWY6J3N0YXRlJywgaWQ6c3RhdGVJZH0pfX0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnN0YXRlLCBbc3RhdGVJZF06IG5ld1N0YXRlfSxcclxuICAgICAgICAgICAgICAgICAgICBtdXRhdG9yOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5tdXRhdG9yLCBbbXV0YXRvcklkXTogbmV3TXV0YXRvcn0sXHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLmV2ZW50LCBbZXZlbnRJZF06IG5ld0V2ZW50fSxcclxuICAgICAgICAgICAgICAgIH19KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIEFERF9TVEFURShuYW1lc3BhY2VJZCwgdHlwZSkge1xyXG4gICAgICAgIGNvbnN0IG5ld1N0YXRlSWQgPSB1dWlkKClcclxuICAgICAgICBsZXQgbmV3U3RhdGVcclxuICAgICAgICBpZih0eXBlID09PSAndGV4dCcpIHtcclxuICAgICAgICAgICAgbmV3U3RhdGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ25ldyB0ZXh0JyxcclxuICAgICAgICAgICAgICAgIHJlZjogbmV3U3RhdGVJZCxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogJ0RlZmF1bHQgdGV4dCcsXHJcbiAgICAgICAgICAgICAgICBtdXRhdG9yczogW10sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHlwZSA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgbmV3U3RhdGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ25ldyBudW1iZXInLFxyXG4gICAgICAgICAgICAgICAgcmVmOiBuZXdTdGF0ZUlkLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ251bWJlcicsXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU6IDAsXHJcbiAgICAgICAgICAgICAgICBtdXRhdG9yczogW10sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHlwZSA9PT0gJ2Jvb2xlYW4nKSB7XHJcbiAgICAgICAgICAgIG5ld1N0YXRlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICduZXcgYm9vbGVhbicsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXHJcbiAgICAgICAgICAgICAgICByZWY6IG5ld1N0YXRlSWQsXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBtdXRhdG9yczogW10sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHlwZSA9PT0gJ3RhYmxlJykge1xyXG4gICAgICAgICAgICBuZXdTdGF0ZSA9IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnbmV3IHRhYmxlJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICd0YWJsZScsXHJcbiAgICAgICAgICAgICAgICByZWY6IG5ld1N0YXRlSWQsXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU6IHt9LFxyXG4gICAgICAgICAgICAgICAgbXV0YXRvcnM6IFtdLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHR5cGUgPT09ICduYW1lc3BhY2UnKSB7XHJcbiAgICAgICAgICAgIG5ld1N0YXRlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICduZXcgbmFtZXNwYWNlJyxcclxuICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBbXSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgbmFtZVNwYWNlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5uYW1lU3BhY2UsIFtuYW1lc3BhY2VJZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZVtuYW1lc3BhY2VJZF0sIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZVtuYW1lc3BhY2VJZF0uY2hpbGRyZW4uY29uY2F0KHtyZWY6J25hbWVTcGFjZScsIGlkOm5ld1N0YXRlSWR9KX0sIFtuZXdTdGF0ZUlkXTogbmV3U3RhdGV9LFxyXG4gICAgICAgICAgICB9fSlcclxuICAgICAgICB9XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIG5hbWVTcGFjZTogey4uLnN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlLCBbbmFtZXNwYWNlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5uYW1lU3BhY2VbbmFtZXNwYWNlSWRdLCBjaGlsZHJlbjogc3RhdGUuZGVmaW5pdGlvbi5uYW1lU3BhY2VbbmFtZXNwYWNlSWRdLmNoaWxkcmVuLmNvbmNhdCh7cmVmOidzdGF0ZScsIGlkOm5ld1N0YXRlSWR9KX19LFxyXG4gICAgICAgICAgICBzdGF0ZTogey4uLnN0YXRlLmRlZmluaXRpb24uc3RhdGUsIFtuZXdTdGF0ZUlkXTogbmV3U3RhdGV9LFxyXG4gICAgICAgIH19KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQ0hBTkdFX1NUWUxFKHN0eWxlSWQsIGtleSwgZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIC8vIGFuZCBub3cgSSByZWFsbHkgcmVncmV0IG5vdCB1c2luZyBpbW11dGFibGUgb3IgcmFtZGEgbGVuc2VzXHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7Li4uc3RhdGUuZGVmaW5pdGlvbiwgc3R5bGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnN0eWxlLCBbc3R5bGVJZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnN0eWxlW3N0eWxlSWRdLCBba2V5XTogZS50YXJnZXQudmFsdWV9fX19KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQUREX0RFRkFVTFRfU1RZTEUoc3R5bGVJZCwga2V5KSB7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7Li4uc3RhdGUuZGVmaW5pdGlvbiwgc3R5bGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnN0eWxlLCBbc3R5bGVJZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnN0eWxlW3N0eWxlSWRdLCBba2V5XTogJ2RlZmF1bHQnfX19fSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFNFTEVDVF9WSUVXX1NVQk1FTlUobmV3SWQpIHtcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIHNlbGVjdGVkVmlld1N1Yk1lbnU6bmV3SWR9KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gRURJVF9WSUVXX05PREVfVElUTEUobm9kZUlkKSB7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBlZGl0aW5nVGl0bGVOb2RlSWQ6bm9kZUlkfSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIEVESVRfRVZFTlRfVElUTEUobm9kZUlkKSB7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBlZGl0aW5nVGl0bGVOb2RlSWQ6bm9kZUlkfSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIENIQU5HRV9FVkVOVF9USVRMRShub2RlSWQsIGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIGV2ZW50OiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLmV2ZW50LFxyXG4gICAgICAgICAgICAgICAgW25vZGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLmV2ZW50W25vZGVJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGUudGFyZ2V0LnZhbHVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfX0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBDSEFOR0VfVklFV19OT0RFX1RJVExFKG5vZGVSZWYsIGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgY29uc3Qgbm9kZUlkID0gbm9kZVJlZi5pZFxyXG4gICAgICAgIGNvbnN0IG5vZGVUeXBlID0gbm9kZVJlZi5yZWZcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgW25vZGVUeXBlXTogey4uLnN0YXRlLmRlZmluaXRpb25bbm9kZVR5cGVdLCBbbm9kZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb25bbm9kZVR5cGVdW25vZGVJZF0sIHRpdGxlOiBlLnRhcmdldC52YWx1ZX19LFxyXG4gICAgICAgIH19KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQ0hBTkdFX1NUQVRFX05PREVfVElUTEUobm9kZUlkLCBlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICBzdGF0ZTogey4uLnN0YXRlLmRlZmluaXRpb24uc3RhdGUsIFtub2RlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5zdGF0ZVtub2RlSWRdLCB0aXRsZTogZS50YXJnZXQudmFsdWV9fSxcclxuICAgICAgICB9fSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIENIQU5HRV9OQU1FU1BBQ0VfVElUTEUobm9kZUlkLCBlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICBuYW1lU3BhY2U6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZSwgW25vZGVJZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZVtub2RlSWRdLCB0aXRsZTogZS50YXJnZXQudmFsdWV9fSxcclxuICAgICAgICB9fSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIENIQU5HRV9DVVJSRU5UX1NUQVRFX1RFWFRfVkFMVUUoc3RhdGVJZCwgZSkge1xyXG4gICAgICAgIGFwcC5zZXRDdXJyZW50U3RhdGUoey4uLmFwcC5nZXRDdXJyZW50U3RhdGUoKSwgW3N0YXRlSWRdOiBlLnRhcmdldC52YWx1ZX0pXHJcbiAgICAgICAgcmVuZGVyKClcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIENIQU5HRV9DVVJSRU5UX1NUQVRFX05VTUJFUl9WQUxVRShzdGF0ZUlkLCBlKSB7XHJcbiAgICAgICAgLy8gdG9kbyBiaWcgdGhyb3dzIGVycm9yIGluc3RlYWQgb2YgcmV0dXJuaW5nIE5hTi4uLiBmaXgsIHJld3JpdGUgb3IgaGFja1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmKGJpZyhlLnRhcmdldC52YWx1ZSkudG9TdHJpbmcoKSAhPT0gYXBwLmdldEN1cnJlbnRTdGF0ZSgpW3N0YXRlSWRdLnRvU3RyaW5nKCkpe1xyXG4gICAgICAgICAgICAgICAgYXBwLnNldEN1cnJlbnRTdGF0ZSh7Li4uYXBwLmdldEN1cnJlbnRTdGF0ZSgpLCBbc3RhdGVJZF06IGJpZyhlLnRhcmdldC52YWx1ZSl9KVxyXG4gICAgICAgICAgICAgICAgcmVuZGVyKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2goZXJyKSB7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gSU5DUkVNRU5UX0NVUlJFTlRfU1RBVEVfTlVNQkVSX1ZBTFVFKHN0YXRlSWQpIHtcclxuICAgICAgICBhcHAuc2V0Q3VycmVudFN0YXRlKHsuLi5hcHAuZ2V0Q3VycmVudFN0YXRlKCksIFtzdGF0ZUlkXTogYmlnKGFwcC5nZXRDdXJyZW50U3RhdGUoKVtzdGF0ZUlkXSkuYWRkKDEpfSlcclxuICAgICAgICByZW5kZXIoKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gREVDUkVNRU5UX0NVUlJFTlRfU1RBVEVfTlVNQkVSX1ZBTFVFKHN0YXRlSWQpIHtcclxuICAgICAgICBhcHAuc2V0Q3VycmVudFN0YXRlKHsuLi5hcHAuZ2V0Q3VycmVudFN0YXRlKCksIFtzdGF0ZUlkXTogYmlnKGFwcC5nZXRDdXJyZW50U3RhdGUoKVtzdGF0ZUlkXSkuYWRkKC0xKX0pXHJcbiAgICAgICAgcmVuZGVyKClcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFNFTEVDVF9FVkVOVChldmVudElkKSB7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBzZWxlY3RlZEV2ZW50SWQ6ZXZlbnRJZH0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBDSEFOR0VfU1RBVElDX1ZBTFVFKHJlZiwgcHJvcGVydHlOYW1lLCB0eXBlLCBlKSB7XHJcbiAgICAgICAgbGV0IHZhbHVlID0gZS50YXJnZXQudmFsdWVcclxuICAgICAgICBpZih0eXBlID09PSAnbnVtYmVyJyl7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGJpZyhlLnRhcmdldC52YWx1ZSlcclxuICAgICAgICAgICAgfSBjYXRjaChlcnIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246e1xyXG4gICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICBbcmVmLnJlZl06IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb25bcmVmLnJlZl0sXHJcbiAgICAgICAgICAgICAgICBbcmVmLmlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXSxcclxuICAgICAgICAgICAgICAgICAgICBbcHJvcGVydHlOYW1lXTogdmFsdWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH19KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQUREX0VWRU5UKHByb3BlcnR5TmFtZSkge1xyXG4gICAgICAgIGNvbnN0IHJlZiA9IHN0YXRlLnNlbGVjdGVkVmlld05vZGVcclxuICAgICAgICBjb25zdCBldmVudElkID0gdXVpZCgpO1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjp7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIFtyZWYucmVmXToge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbltyZWYucmVmXSxcclxuICAgICAgICAgICAgICAgIFtyZWYuaWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdLFxyXG4gICAgICAgICAgICAgICAgICAgIFtwcm9wZXJ0eU5hbWVdOiB7cmVmOiAnZXZlbnQnLCBpZDogZXZlbnRJZH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXZlbnQ6IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24uZXZlbnQsXHJcbiAgICAgICAgICAgICAgICBbZXZlbnRJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ09uICcgKyBwcm9wZXJ0eU5hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgbXV0YXRvcnM6IFtdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9fSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIEFERF9NVVRBVE9SKHN0YXRlSWQsIGV2ZW50SWQpIHtcclxuICAgICAgICBjb25zdCBtdXRhdG9ySWQgPSB1dWlkKCk7XHJcbiAgICAgICAgY29uc3QgcGlwZUlkID0gdXVpZCgpO1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjp7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIHBpcGU6e1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLFxyXG4gICAgICAgICAgICAgICAgW3BpcGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBzdGF0ZS5kZWZpbml0aW9uLnN0YXRlW3N0YXRlSWRdLnR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHN0YXRlLmRlZmluaXRpb24uc3RhdGVbc3RhdGVJZF0uZGVmYXVsdFZhbHVlLFxyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogW11cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc3RhdGU6IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24uc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBbc3RhdGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnN0YXRlW3N0YXRlSWRdLFxyXG4gICAgICAgICAgICAgICAgICAgIG11dGF0b3JzOiBzdGF0ZS5kZWZpbml0aW9uLnN0YXRlW3N0YXRlSWRdLm11dGF0b3JzLmNvbmNhdCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogJ211dGF0b3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogbXV0YXRvcklkXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbXV0YXRvcjoge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5tdXRhdG9yLFxyXG4gICAgICAgICAgICAgICAgW211dGF0b3JJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICBldmVudDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWY6IFwiZXZlbnRcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IGV2ZW50SWRcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogXCJzdGF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogc3RhdGVJZFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbXV0YXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IHBpcGVJZFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXZlbnQ6IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24uZXZlbnQsXHJcbiAgICAgICAgICAgICAgICBbZXZlbnRJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLmV2ZW50W2V2ZW50SWRdLFxyXG4gICAgICAgICAgICAgICAgICAgIG11dGF0b3JzOiBzdGF0ZS5kZWZpbml0aW9uLmV2ZW50W2V2ZW50SWRdLm11dGF0b3JzLmNvbmNhdCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogJ211dGF0b3InLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogbXV0YXRvcklkXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH19KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gTU9WRV9WSUVXX05PREUocGFyZW50UmVmLCBwb3NpdGlvbiwgYW1vdW50LCBlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjp7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIFtwYXJlbnRSZWYucmVmXToge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXSxcclxuICAgICAgICAgICAgICAgIFtwYXJlbnRSZWYuaWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXVtwYXJlbnRSZWYuaWRdLFxyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdW3BhcmVudFJlZi5pZF0uY2hpbGRyZW4ubWFwKCAvLyBmdW5jdGlvbmFsIHN3YXBcclxuICAgICAgICAgICAgICAgICAgICAgICAgKGNoaWxkLGluZGV4KT0+IGluZGV4ID09PSBwb3NpdGlvbiArIGFtb3VudCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdW3BhcmVudFJlZi5pZF0uY2hpbGRyZW5bcG9zaXRpb25dOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggPT09IHBvc2l0aW9uID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdW3BhcmVudFJlZi5pZF0uY2hpbGRyZW5bcG9zaXRpb24gKyBhbW91bnRdOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLmRlZmluaXRpb25bcGFyZW50UmVmLnJlZl1bcGFyZW50UmVmLmlkXS5jaGlsZHJlbltpbmRleF1cclxuICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9fSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFNFTEVDVF9QSVBFKHBpcGVJZCkge1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgc2VsZWN0ZWRQaXBlSWQ6cGlwZUlkfSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIENIQU5HRV9QSVBFX1ZBTFVFX1RPX1NUQVRFKHBpcGVJZCkge1xyXG4gICAgICAgIGlmKCFzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkIHx8IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLnZhbHVlLmlkICl7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIHBpcGU6IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZSxcclxuICAgICAgICAgICAgICAgIFtwaXBlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6ICdzdGF0ZScsIGlkOiBzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkfSxcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFtdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9fSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIEFERF9UUkFOU0ZPUk1BVElPTihwaXBlSWQsIHRyYW5zZm9ybWF0aW9uKSB7XHJcbiAgICAgICAgaWYodHJhbnNmb3JtYXRpb24gPT09ICdqb2luJyl7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1BpcGVJZCA9IHV1aWQoKTtcclxuICAgICAgICAgICAgY29uc3Qgam9pbklkID0gdXVpZCgpO1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICBqb2luOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5qb2luLFxyXG4gICAgICAgICAgICAgICAgICAgIFtqb2luSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7cmVmOiAncGlwZScsIGlkOm5ld1BpcGVJZH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcGlwZToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZSxcclxuICAgICAgICAgICAgICAgICAgICBbbmV3UGlwZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAnRGVmYXVsdCB0ZXh0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgW3BpcGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0udHJhbnNmb3JtYXRpb25zLmNvbmNhdCh7cmVmOiAnam9pbicsIGlkOmpvaW5JZH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9fSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHJhbnNmb3JtYXRpb24gPT09ICd0b1VwcGVyQ2FzZScpe1xyXG4gICAgICAgICAgICBjb25zdCBuZXdJZCA9IHV1aWQoKTtcclxuICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgdG9VcHBlckNhc2U6IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnRvVXBwZXJDYXNlLFxyXG4gICAgICAgICAgICAgICAgICAgIFtuZXdJZF06IHt9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcGlwZToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZSxcclxuICAgICAgICAgICAgICAgICAgICBbcGlwZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBzdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXS50cmFuc2Zvcm1hdGlvbnMuY29uY2F0KHtyZWY6ICd0b1VwcGVyQ2FzZScsIGlkOm5ld0lkfSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH19KVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0cmFuc2Zvcm1hdGlvbiA9PT0gJ3RvTG93ZXJDYXNlJyl7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld0lkID0gdXVpZCgpO1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICB0b0xvd2VyQ2FzZToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24udG9Mb3dlckNhc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgW25ld0lkXToge31cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwaXBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIFtwaXBlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IHN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLnRyYW5zZm9ybWF0aW9ucy5jb25jYXQoe3JlZjogJ3RvTG93ZXJDYXNlJywgaWQ6bmV3SWR9KVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfX0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRyYW5zZm9ybWF0aW9uID09PSAndG9UZXh0Jyl7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld0lkID0gdXVpZCgpO1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICB0b1RleHQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnRvVGV4dCxcclxuICAgICAgICAgICAgICAgICAgICBbbmV3SWRdOiB7fVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHBpcGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsXHJcbiAgICAgICAgICAgICAgICAgICAgW3BpcGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0udHJhbnNmb3JtYXRpb25zLmNvbmNhdCh7cmVmOiAndG9UZXh0JywgaWQ6bmV3SWR9KVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfX0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRyYW5zZm9ybWF0aW9uID09PSAnYWRkJyl7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1BpcGVJZCA9IHV1aWQoKTtcclxuICAgICAgICAgICAgY29uc3QgYWRkSWQgPSB1dWlkKCk7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgIGFkZDoge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24uYWRkLFxyXG4gICAgICAgICAgICAgICAgICAgIFthZGRJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6ICdwaXBlJywgaWQ6bmV3UGlwZUlkfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwaXBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIFtuZXdQaXBlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgW3BpcGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0udHJhbnNmb3JtYXRpb25zLmNvbmNhdCh7cmVmOiAnYWRkJywgaWQ6YWRkSWR9KVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfX0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRyYW5zZm9ybWF0aW9uID09PSAnc3VidHJhY3QnKXtcclxuICAgICAgICAgICAgY29uc3QgbmV3UGlwZUlkID0gdXVpZCgpO1xyXG4gICAgICAgICAgICBjb25zdCBzdWJ0cmFjdElkID0gdXVpZCgpO1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICBzdWJ0cmFjdDoge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24uc3VidHJhY3QsXHJcbiAgICAgICAgICAgICAgICAgICAgW3N1YnRyYWN0SWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiB7cmVmOiAncGlwZScsIGlkOm5ld1BpcGVJZH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcGlwZToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZSxcclxuICAgICAgICAgICAgICAgICAgICBbbmV3UGlwZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogW11cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIFtwaXBlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IHN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLnRyYW5zZm9ybWF0aW9ucy5jb25jYXQoe3JlZjogJ3N1YnRyYWN0JywgaWQ6c3VidHJhY3RJZH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9fSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBTSE9XX1ZJRVdfTk9ERVMoZSl7XHJcbiAgICAgICAgc2V0U3RhdGUoe1xyXG4gICAgICAgICAgICAuLi5zdGF0ZSxcclxuICAgICAgICAgICAgc2hvd2luZ1ZpZXdOb2RlczogdHJ1ZVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBSRVNFVF9BUFAoKSB7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiBhcHBEZWZpbml0aW9ufSlcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBib3hJY29uID0gaCgnc3ZnJywge1xyXG4gICAgICAgICAgICBhdHRyczoge3dpZHRoOiAxNCwgaGVpZ2h0OiAxNX0sXHJcbiAgICAgICAgICAgIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInLCBwYWRkaW5nOiAnMCA3cHggMCAwJ30sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIGgoJ3JlY3QnLCB7YXR0cnM6IHt4OiAyLCB5OiAyLCB3aWR0aDogMTIsIGhlaWdodDogMTIsIGZpbGw6ICdub25lJywgdHJhbnNpdGlvbjogJ2FsbCAwLjJzJyxzdHJva2U6ICcjYmRiZGJkJywgJ3N0cm9rZS13aWR0aCc6ICcyJ319KSxcclxuICAgICAgICBdKVxyXG4gICAgY29uc3QgaWZJY29uID0gaCgnc3ZnJywge1xyXG4gICAgICAgICAgICBhdHRyczoge3dpZHRoOiAxNCwgaGVpZ2h0OiAxNH0sXHJcbiAgICAgICAgICAgIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInLCBwYWRkaW5nOiAnMCA3cHggMCAwJ30sXHJcbiAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICBoKCd0ZXh0Jywge2F0dHJzOiB7IHg6MywgeToxNCwgZmlsbDogJyNiZGJkYmQnfX0sICc/JyksXHJcbiAgICAgICAgXSlcclxuICAgIGNvbnN0IGxpc3RJY29uID0gaCgnc3ZnJywge1xyXG4gICAgICAgICAgICBhdHRyczoge3dpZHRoOiAxNCwgaGVpZ2h0OiAxNH0sXHJcbiAgICAgICAgICAgIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInLCBwYWRkaW5nOiAnMCA3cHggMCAwJ30sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIGgoJ2NpcmNsZScsIHthdHRyczoge3I6IDIsIGN4OiAyLCBjeTogMiwgdHJhbnNpdGlvbjogJ2FsbCAwLjJzJywgZmlsbDogJyNiZGJkYmQnLH19KSxcclxuICAgICAgICAgICAgaCgncmVjdCcsIHthdHRyczoge3g6IDYsIHk6IDEsIHdpZHRoOiA4LCB0cmFuc2l0aW9uOiAnYWxsIDAuMnMnLCBoZWlnaHQ6IDIsIGZpbGw6ICcjYmRiZGJkJyx9fSksXHJcbiAgICAgICAgICAgIGgoJ2NpcmNsZScsIHthdHRyczoge3I6IDIsIGN4OiAyLCBjeTogNywgdHJhbnNpdGlvbjogJ2FsbCAwLjJzJywgZmlsbDogJyNiZGJkYmQnLH19KSxcclxuICAgICAgICAgICAgaCgncmVjdCcsIHthdHRyczoge3g6IDYsIHk6IDYsIHdpZHRoOiA4LCB0cmFuc2l0aW9uOiAnYWxsIDAuMnMnLCBoZWlnaHQ6IDIsIGZpbGw6ICcjYmRiZGJkJyx9fSksXHJcbiAgICAgICAgICAgIGgoJ2NpcmNsZScsIHthdHRyczoge3I6IDIsIGN4OiAyLCBjeTogMTIsIHRyYW5zaXRpb246ICdhbGwgMC4ycycsIGZpbGw6ICcjYmRiZGJkJyx9fSksXHJcbiAgICAgICAgICAgIGgoJ3JlY3QnLCB7YXR0cnM6IHt4OiA2LCB5OiAxMSwgd2lkdGg6IDgsIHRyYW5zaXRpb246ICdhbGwgMC4ycycsIGhlaWdodDogMiwgZmlsbDonI2JkYmRiZCcsfX0pLFxyXG4gICAgICAgIF0pXHJcbiAgICBjb25zdCBpbnB1dEljb24gPSBoKCdzdmcnLCB7XHJcbiAgICAgICAgICAgIGF0dHJzOiB7dmlld0JveDogJzAgMCAxNiAxNicsIHdpZHRoOiAxNCwgaGVpZ2h0OiAxNH0sXHJcbiAgICAgICAgICAgIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInLCBwYWRkaW5nOiAnMCA3cHggMCAwJ30sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIGgoJ3BhdGgnLCB7YXR0cnM6IHtkOiAnTSAxNSwyIDExLDIgQyAxMC40NDcsMiAxMCwxLjU1MiAxMCwxIDEwLDAuNDQ4IDEwLjQ0NywwIDExLDAgbCA0LDAgYyAwLjU1MywwIDEsMC40NDggMSwxIDAsMC41NTIgLTAuNDQ3LDEgLTEsMSB6IG0gLTIsMTQgYyAtMC41NTMsMCAtMSwtMC40NDcgLTEsLTEgTCAxMiwxIGMgMCwtMC41NTIgMC40NDcsLTEgMSwtMSAwLjU1MywwIDEsMC40NDggMSwxIGwgMCwxNCBjIDAsMC41NTMgLTAuNDQ3LDEgLTEsMSB6IG0gMiwwIC00LDAgYyAtMC41NTMsMCAtMSwtMC40NDcgLTEsLTEgMCwtMC41NTMgMC40NDcsLTEgMSwtMSBsIDQsMCBjIDAuNTUzLDAgMSwwLjQ0NyAxLDEgMCwwLjU1MyAtMC40NDcsMSAtMSwxIHonLCBmaWxsOicjYmRiZGJkJ319KSxcclxuICAgICAgICAgICAgaCgncGF0aCcsIHthdHRyczoge2Q6ICdNIDkuODExNDgyNyw0LjIzNjAzOTMgQyA5LjY1NDczNTcsNC41ODY1OTA2IDkuMzAzOTkzMyw0LjgyOTU4NTQgOC44OTU3MjMzLDQuODI4ODY4NCBMIDEuMjk2ODkyNiw0LjgxMTU0MDQgMS4zMTY5NDM2LDIuODA2NDQ3IDguOTAwNjM3NywyLjgyODY0MiBjIDAuNTUyNDQ4LDAuMDAxNjUgMC45OTkzMDc0LDAuNDUwMTIyMyAwLjk5NzY1NjQsMS4wMDI1Njk4IC0yLjFlLTUsMC4xNDQ1ODU2IC0wLjAzMTMsMC4yODA2NzM0IC0wLjA4NjgxLDAuNDA0ODI3IHonLCBmaWxsOiAnI2JkYmRiZCd9fSksXHJcbiAgICAgICAgICAgIGgoJ3BhdGgnLCB7YXR0cnM6IHtkOiAnbSA5LjgxMTQ4MjcsMTEuNzM4NTYyIGMgLTAuMTU2NzQ3LDAuMzUwNTUxIC0wLjUwNzQ4OTQsMC41OTM1NDYgLTAuOTE1NzU5NCwwLjU5MjgyOSBsIC03LjU5ODgzMDcsLTAuMDE3MzMgMC4wMjAwNTEsLTIuMDA1MDkzIDcuNTgzNjk0MSwwLjAyMjE5IGMgMC41NTI0NDgsMC4wMDE2IDAuOTk5MzA3NCwwLjQ1MDEyMiAwLjk5NzY1NjQsMS4wMDI1NyAtMi4xZS01LDAuMTQ0NTg1IC0wLjAzMTMsMC4yODA2NzMgLTAuMDg2ODEsMC40MDQ4MjcgeicsIGZpbGw6ICcjYmRiZGJkJ319KSxcclxuICAgICAgICAgICAgaCgncGF0aCcsIHthdHRyczoge2Q6ICdtIDEuMjk0MDU4MywxMi4yMzk4MzYgMC4wMTcwNCwtOS40NDUwOTQ3IDEuOTcxNDg1MiwwLjAyNDkyMyAtMC4wMjE4MTgsOS40MjYyNzk3IHonLCBmaWxsOiAnI2JkYmRiZCd9fSksXHJcbiAgICAgICAgXSlcclxuICAgIGNvbnN0IHRleHRJY29uID0gaCgnc3ZnJywge1xyXG4gICAgICAgICAgICBhdHRyczoge3ZpZXdCb3g6ICcwIDAgMzAwIDMwMCcsIHdpZHRoOiAxNCwgaGVpZ2h0OiAxNH0sXHJcbiAgICAgICAgICAgIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInLCBwYWRkaW5nOiAnMCA3cHggMCAwJ30sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBbXHJcbiAgICAgICAgICAgIGgoJ3BhdGgnLCB7YXR0cnM6IHtkOiAnTSAwIDAgTCAwIDg1LjgxMjUgTCAyNy4wMzEyNSA4NS44MTI1IEMgMzYuNjE3Nzg2IDQ0LjM0NjMxNiA2Ny44NzY1NzkgNDIuMTc5NzkzIDEwNi45MDYyNSA0Mi41OTM3NSBMIDEwNi45MDYyNSAyMjguMzc1IEMgMTA3LjMxMTAxIDI3OS4wOTY0MSA5OC45MDgzODYgMjc3LjMzNjAyIDYyLjEyNSAyNzcuNSBMIDYyLjEyNSAyOTkuNTYyNSBMIDE0OSAyOTkuNTYyNSBMIDE1MC4wMzEyNSAyOTkuNTYyNSBMIDIzNi45MDYyNSAyOTkuNTYyNSBMIDIzNi45MDYyNSAyNzcuNSBDIDIwMC4xMjI4NiAyNzcuMzM2IDE5MS43MjAyNCAyNzkuMDk2MzkgMTkyLjEyNSAyMjguMzc1IEwgMTkyLjEyNSA0Mi41OTM3NSBDIDIzMS4xNTQ2NyA0Mi4xNzk3NSAyNjIuNDEzNDYgNDQuMzQ2MzA0IDI3MiA4NS44MTI1IEwgMjk5LjAzMTI1IDg1LjgxMjUgTCAyOTkuMDMxMjUgMCBMIDE1MC4wMzEyNSAwIEwgMTQ5IDAgTCAwIDAgeicsIGZpbGw6ICcjYmRiZGJkJ319KVxyXG4gICAgICAgIF0pXHJcblxyXG4gICAgZnVuY3Rpb24gcmVuZGVyKCkge1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRSdW5uaW5nU3RhdGUgPSBhcHAuZ2V0Q3VycmVudFN0YXRlKClcclxuICAgICAgICBjb25zdCBkcmFnQ29tcG9uZW50TGVmdCA9IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgIG1vdXNlZG93bjogW1dJRFRIX0RSQUdHRUQsICdlZGl0b3JMZWZ0V2lkdGgnXSxcclxuICAgICAgICAgICAgICAgIHRvdWNoc3RhcnQ6IFtXSURUSF9EUkFHR0VELCAnZWRpdG9yTGVmdFdpZHRoJ10sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgICAgIHJpZ2h0OiAnMCcsXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGVYKDEwMCUpJyxcclxuICAgICAgICAgICAgICAgIHRvcDogJzAnLFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6ICcxMHB4JyxcclxuICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMWVtJyxcclxuICAgICAgICAgICAgICAgIG9wYWNpdHk6ICcwJyxcclxuICAgICAgICAgICAgICAgIGN1cnNvcjogJ2NvbC1yZXNpemUnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgY29uc3QgZHJhZ0NvbXBvbmVudFJpZ2h0ID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgbW91c2Vkb3duOiBbV0lEVEhfRFJBR0dFRCwgJ2VkaXRvclJpZ2h0V2lkdGgnXSxcclxuICAgICAgICAgICAgICAgIHRvdWNoc3RhcnQ6IFtXSURUSF9EUkFHR0VELCAnZWRpdG9yUmlnaHRXaWR0aCddLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICBsZWZ0OiAnMCcsXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGVYKC0xMDAlKScsXHJcbiAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAnMTBweCcsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogJzFlbScsXHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAnMCcsXHJcbiAgICAgICAgICAgICAgICBjdXJzb3I6ICdjb2wtcmVzaXplJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KVxyXG4gICAgICAgIGNvbnN0IGRyYWdTdWJDb21wb25lbnQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICBtb3VzZWRvd246IFtXSURUSF9EUkFHR0VELCAnc3ViRWRpdG9yV2lkdGgnXSxcclxuICAgICAgICAgICAgICAgIHRvdWNoc3RhcnQ6IFtXSURUSF9EUkFHR0VELCAnc3ViRWRpdG9yV2lkdGgnXSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICAgICAgbGVmdDogJzJweCcsXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGVYKC0xMDAlKScsXHJcbiAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAnMTBweCcsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogJzFlbScsXHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICAgICAgY3Vyc29yOiAnY29sLXJlc2l6ZScsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZW1iZXJFZGl0b3IocmVmLCB0eXBlKXtcclxuICAgICAgICAgICAgY29uc3QgcGlwZSA9IHN0YXRlLmRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gbGlzdFRyYW5zZm9ybWF0aW9ucyh0cmFuc2Zvcm1hdGlvbnMsIHRyYW5zVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybWF0aW9ucy5tYXAoKHRyYW5zUmVmLCBpbmRleCk9PntcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1lciA9IHN0YXRlLmRlZmluaXRpb25bdHJhbnNSZWYucmVmXVt0cmFuc1JlZi5pZF1cclxuICAgICAgICAgICAgICAgICAgICAvLyBpZiAodHJhbnNSZWYucmVmID09PSAnZXF1YWwnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIHJldHVybiBoKCdkaXYnLCB7fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7Y29sb3I6ICcjYmRiZGJkJywgY3Vyc29yOiAnZGVmYXVsdCcsIGRpc3BsYXk6J2ZsZXgnfX0sIFtoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnfX0sIHRyYW5zUmVmLnJlZiksIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCd9fSwgdHJhbnNUeXBlKV0pLFxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgZW1iZXJFZGl0b3IodHJhbnNmb3JtZXIudmFsdWUsIHR5cGUpXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc1JlZi5yZWYgPT09ICdhZGQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge2tleTogaW5kZXgsIHN0eWxlOiB7Y29sb3I6ICcjYmRiZGJkJywgY3Vyc29yOiAnZGVmYXVsdCcsIGRpc3BsYXk6J2ZsZXgnfX0sIFtoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnfX0sIHRyYW5zUmVmLnJlZiksIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCcsIGNvbG9yOiB0cmFuc2Zvcm1hdGlvbnMubGVuZ3RoLTEgIT09IGluZGV4ID8gJyNiZGJkYmQnOiB0cmFuc1R5cGUgPT09IHR5cGUgPyAnZ3JlZW4nOiAncmVkJ319LCAnbnVtYmVyJyldKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmdMZWZ0OiAnMTVweCd9fSwgW2VtYmVyRWRpdG9yKHRyYW5zZm9ybWVyLnZhbHVlLCB0cmFuc1R5cGUpXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zUmVmLnJlZiA9PT0gJ3N1YnRyYWN0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge30sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtrZXk6IGluZGV4LCBzdHlsZToge2NvbG9yOiAnI2JkYmRiZCcsIGN1cnNvcjogJ2RlZmF1bHQnLCBkaXNwbGF5OidmbGV4J319LCBbaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJ319LCB0cmFuc1JlZi5yZWYpLCBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAnLCBjb2xvcjogdHJhbnNmb3JtYXRpb25zLmxlbmd0aC0xICE9PSBpbmRleCA/ICcjYmRiZGJkJzogdHJhbnNUeXBlID09PSB0eXBlID8gJ2dyZWVuJzogJ3JlZCd9fSwgJ251bWJlcicpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nTGVmdDogJzE1cHgnfX0sIFtlbWJlckVkaXRvcih0cmFuc2Zvcm1lci52YWx1ZSwgdHJhbnNUeXBlKV0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmICh0cmFuc1JlZi5yZWYgPT09ICdicmFuY2gnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIGlmKHJlc29sdmUodHJhbnNmb3JtZXIucHJlZGljYXRlKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICB2YWx1ZSA9IHRyYW5zZm9ybVZhbHVlKHZhbHVlLCB0cmFuc2Zvcm1lci50aGVuKVxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgdmFsdWUgPSB0cmFuc2Zvcm1WYWx1ZSh2YWx1ZSwgdHJhbnNmb3JtZXIuZWxzZSlcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNSZWYucmVmID09PSAnam9pbicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHt9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtjb2xvcjogJyNiZGJkYmQnLCBjdXJzb3I6ICdkZWZhdWx0JywgZGlzcGxheTonZmxleCd9fSwgW2goJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMSd9fSwgdHJhbnNSZWYucmVmKSwgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwJywgY29sb3I6IHRyYW5zZm9ybWF0aW9ucy5sZW5ndGgtMSAhPT0gaW5kZXggPyAnI2JkYmRiZCc6IHRyYW5zVHlwZSA9PT0gdHlwZSA/ICdncmVlbic6ICdyZWQnfX0sICd0ZXh0JyldKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmdMZWZ0OiAnMTVweCd9fSwgW2VtYmVyRWRpdG9yKHRyYW5zZm9ybWVyLnZhbHVlLCB0cmFuc1R5cGUpXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zUmVmLnJlZiA9PT0gJ3RvVXBwZXJDYXNlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge30sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2N1cnNvcjogJ2RlZmF1bHQnLCBkaXNwbGF5OidmbGV4J319LCBbaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJywgY29sb3I6ICcjYmRiZGJkJ319LCB0cmFuc1JlZi5yZWYpLCBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAnLCBjb2xvcjogdHJhbnNmb3JtYXRpb25zLmxlbmd0aC0xICE9PSBpbmRleCA/ICcjYmRiZGJkJzogdHJhbnNUeXBlID09PSB0eXBlID8gJ2dyZWVuJzogJ3JlZCd9fSwgJ3RleHQnKV0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNSZWYucmVmID09PSAndG9Mb3dlckNhc2UnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7Y3Vyc29yOiAnZGVmYXVsdCcsIGRpc3BsYXk6J2ZsZXgnfX0sIFtoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnLCBjb2xvcjogJyNiZGJkYmQnfX0sIHRyYW5zUmVmLnJlZiksIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCcsIGNvbG9yOiB0cmFuc2Zvcm1hdGlvbnMubGVuZ3RoLTEgIT09IGluZGV4ID8gJyNiZGJkYmQnOiB0cmFuc1R5cGUgPT09IHR5cGUgPyAnZ3JlZW4nOiAncmVkJ319LCAndGV4dCcpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc1JlZi5yZWYgPT09ICd0b1RleHQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7Y3Vyc29yOiAnZGVmYXVsdCcsIGRpc3BsYXk6J2ZsZXgnfX0sIFtoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnLCBjb2xvcjogJyNiZGJkYmQnfX0sIHRyYW5zUmVmLnJlZiksIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCcsIGNvbG9yOiB0cmFuc2Zvcm1hdGlvbnMubGVuZ3RoLTEgIT09IGluZGV4ID8gJyNiZGJkYmQnOiB0cmFuc1R5cGUgPT09IHR5cGUgPyAnZ3JlZW4nOiAncmVkJ319LCAndGV4dCcpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gZ2VuVHJhbnNmb3JtYXRvcnModHlwZSkge1xyXG4gICAgICAgICAgICAgICAgaWYodHlwZSA9PT0gJ3RleHQnKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nOiAnNXB4IDEwcHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgYm9yZGVyUmFkaXVzOiAnMTBweCcsIG1hcmdpbjogJzVweCcsIGN1cnNvcjogJ3BvaW50ZXInLCBib3JkZXI6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPyAnMnB4IHNvbGlkIHdoaXRlJyA6ICcycHggc29saWQgI2JkYmRiZCcsIGNvbG9yOiBzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID8gJ3doaXRlJyA6ICcjYmRiZGJkJyx9LCBvbjoge2NsaWNrOiBbQ0hBTkdFX1BJUEVfVkFMVUVfVE9fU1RBVEUsIHJlZi5pZF19fSwgJ2NoYW5nZSB0byBzdGF0ZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nOiAnNXB4IDEwcHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgYm9yZGVyUmFkaXVzOiAnMTBweCcsIG1hcmdpbjogJzVweCcsIGN1cnNvcjogJ3BvaW50ZXInLCBib3JkZXI6ICcycHggc29saWQgd2hpdGUnfSwgb246IHtjbGljazogW0FERF9UUkFOU0ZPUk1BVElPTiwgcmVmLmlkLCAnam9pbiddfX0sICdqb2luJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmc6ICc1cHggMTBweCcsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCBib3JkZXJSYWRpdXM6ICcxMHB4JywgbWFyZ2luOiAnNXB4JywgY3Vyc29yOiAncG9pbnRlcicsIGJvcmRlcjogJzJweCBzb2xpZCB3aGl0ZSd9LCBvbjoge2NsaWNrOiBbQUREX1RSQU5TRk9STUFUSU9OLCByZWYuaWQsICd0b1VwcGVyQ2FzZSddfX0sICd0byBVcHBlciBjYXNlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmc6ICc1cHggMTBweCcsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCBib3JkZXJSYWRpdXM6ICcxMHB4JywgbWFyZ2luOiAnNXB4JywgY3Vyc29yOiAncG9pbnRlcicsIGJvcmRlcjogJzJweCBzb2xpZCB3aGl0ZSd9LCBvbjoge2NsaWNrOiBbQUREX1RSQU5TRk9STUFUSU9OLCByZWYuaWQsICd0b0xvd2VyQ2FzZSddfX0sICd0byBMb3dlciBjYXNlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYodHlwZSA9PT0gJ251bWJlcicpe1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmc6ICc1cHggMTBweCcsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCBib3JkZXJSYWRpdXM6ICcxMHB4JywgbWFyZ2luOiAnNXB4JywgY3Vyc29yOiAncG9pbnRlcicsIGJvcmRlcjogc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA/ICcycHggc29saWQgd2hpdGUnIDogJzJweCBzb2xpZCAjYmRiZGJkJywgY29sb3I6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgID8gJ3doaXRlJyA6ICcjYmRiZGJkJyx9LCBvbjoge2NsaWNrOiBbQ0hBTkdFX1BJUEVfVkFMVUVfVE9fU1RBVEUsIHJlZi5pZF19fSwgJ2NoYW5nZSB0byBzdGF0ZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nOiAnNXB4IDEwcHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgYm9yZGVyUmFkaXVzOiAnMTBweCcsIG1hcmdpbjogJzVweCcsIGN1cnNvcjogJ3BvaW50ZXInLCBib3JkZXI6ICcycHggc29saWQgd2hpdGUnfSwgb246IHtjbGljazogW0FERF9UUkFOU0ZPUk1BVElPTiwgcmVmLmlkLCAndG9UZXh0J119fSwgJ3RvIHRleHQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZzogJzVweCAxMHB4JywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsIGJvcmRlclJhZGl1czogJzEwcHgnLCBtYXJnaW46ICc1cHgnLCBjdXJzb3I6ICdwb2ludGVyJywgYm9yZGVyOiAnMnB4IHNvbGlkIHdoaXRlJ30sIG9uOiB7Y2xpY2s6IFtBRERfVFJBTlNGT1JNQVRJT04sIHJlZi5pZCwgJ2FkZCddfX0sICdhZGQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZzogJzVweCAxMHB4JywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsIGJvcmRlclJhZGl1czogJzEwcHgnLCBtYXJnaW46ICc1cHgnLCBjdXJzb3I6ICdwb2ludGVyJywgYm9yZGVyOiAnMnB4IHNvbGlkIHdoaXRlJ30sIG9uOiB7Y2xpY2s6IFtBRERfVFJBTlNGT1JNQVRJT04sIHJlZi5pZCwgJ3N1YnRyYWN0J119fSwgJ3N1YnRyYWN0JyksXHJcbiAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcGlwZS52YWx1ZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCBbaCgnZGl2Jywge3N0eWxlOntkaXNwbGF5OidmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcid9LCBvbjoge2NsaWNrOiBbU0VMRUNUX1BJUEUsIHJlZi5pZF19fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2lucHV0Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZTogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW46ICAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0RGVjb3JhdGlvbjogJ3VuZGVybGluZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogW0NIQU5HRV9TVEFUSUNfVkFMVUUsIHJlZiwgJ3ZhbHVlJywgJ3RleHQnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXZlUHJvcHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcGlwZS52YWx1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcwJywgY3Vyc29yOiAnZGVmYXVsdCcsIGNvbG9yOiBwaXBlLnRyYW5zZm9ybWF0aW9ucy5sZW5ndGggPiAwID8gJyNiZGJkYmQnOiB0eXBlID09PSAndGV4dCcgPyAnZ3JlZW4nOiAncmVkJ319LCAndGV4dCcpXHJcbiAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nTGVmdDogJzE1cHgnfX0sIGxpc3RUcmFuc2Zvcm1hdGlvbnMocGlwZS50cmFuc2Zvcm1hdGlvbnMsIHBpcGUudHlwZSkpLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHN0YXRlLnNlbGVjdGVkUGlwZUlkID09PSByZWYuaWQgPyBnZW5UcmFuc2Zvcm1hdG9ycygndGV4dCcpOiBbXSlcclxuICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghaXNOYU4ocGFyc2VGbG9hdChOdW1iZXIocGlwZS52YWx1ZSkpKSAmJiBpc0Zpbml0ZShOdW1iZXIocGlwZS52YWx1ZSkpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2JywgW2goJ2RpdicsIHtzdHlsZTp7ZGlzcGxheTonZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInfSwgb246IHtjbGljazogW1NFTEVDVF9QSVBFLCByZWYuaWRdfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICBoKCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzOiB7dHlwZTonbnVtYmVyJ30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbjogICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHREZWNvcmF0aW9uOiAndW5kZXJsaW5lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBbQ0hBTkdFX1NUQVRJQ19WQUxVRSwgcmVmLCAndmFsdWUnLCAnbnVtYmVyJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGl2ZVByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IE51bWJlcihwaXBlLnZhbHVlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcwJywgY3Vyc29yOiAnZGVmYXVsdCcsIGNvbG9yOiBwaXBlLnRyYW5zZm9ybWF0aW9ucy5sZW5ndGggPiAwID8gJyNiZGJkYmQnOiB0eXBlID09PSAnbnVtYmVyJyA/ICdncmVlbic6ICdyZWQnfX0sICdudW1iZXInKVxyXG4gICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ0xlZnQ6ICcxNXB4J319LCBsaXN0VHJhbnNmb3JtYXRpb25zKHBpcGUudHJhbnNmb3JtYXRpb25zLCBwaXBlLnR5cGUpKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCBzdGF0ZS5zZWxlY3RlZFBpcGVJZCA9PT0gcmVmLmlkID8gZ2VuVHJhbnNmb3JtYXRvcnMoJ251bWJlcicpOiBbXSlcclxuICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmKHBpcGUudmFsdWUucmVmID09PSAnc3RhdGUnKXtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRpc3BsU3RhdGUgPSBzdGF0ZS5kZWZpbml0aW9uW3BpcGUudmFsdWUucmVmXVtwaXBlLnZhbHVlLmlkXVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIFtoKCdkaXYnLCB7c3R5bGU6e2Rpc3BsYXk6J2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJ30sIG9uOiB7Y2xpY2s6IFtTRUxFQ1RfUElQRSwgcmVmLmlkXX19LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzEnfX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtoKCdkaXYnLHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJywgY29sb3I6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHBpcGUudmFsdWUuaWQgPyAnI2VhYjY1Yyc6ICd3aGl0ZScsIHBhZGRpbmc6ICcycHggNXB4JywgbWFyZ2luOiAnM3B4IDNweCAwIDAnLCBib3JkZXI6ICcycHggc29saWQgJyArIChzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBwaXBlLnZhbHVlLmlkID8gJyNlYWI2NWMnOiAnd2hpdGUnKSwgYm9yZGVyUmFkaXVzOiAnMTBweCcsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbjoge2NsaWNrOiBbU1RBVEVfTk9ERV9TRUxFQ1RFRCwgcGlwZS52YWx1ZS5pZF19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW2Rpc3BsU3RhdGUudGl0bGVdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtmbGV4OiAnMCcsIGN1cnNvcjogJ2RlZmF1bHQnLCBjb2xvcjogcGlwZS50cmFuc2Zvcm1hdGlvbnMubGVuZ3RoID4gMCA/ICcjYmRiZGJkJzogZGlzcGxTdGF0ZS50eXBlID09PSB0eXBlID8gJ2dyZWVuJzogJ3JlZCd9fSwgZGlzcGxTdGF0ZS50eXBlKVxyXG4gICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ0xlZnQ6ICcxNXB4J319LCBsaXN0VHJhbnNmb3JtYXRpb25zKHBpcGUudHJhbnNmb3JtYXRpb25zLCBwaXBlLnR5cGUpKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCBzdGF0ZS5zZWxlY3RlZFBpcGVJZCA9PT0gcmVmLmlkID8gcGlwZS50cmFuc2Zvcm1hdGlvbnMubGVuZ3RoID09PSAwID8gZ2VuVHJhbnNmb3JtYXRvcnMoZGlzcGxTdGF0ZS50eXBlKTogcGlwZS50cmFuc2Zvcm1hdGlvbnNbcGlwZS50cmFuc2Zvcm1hdGlvbnMubGVuZ3RoLTFdLnJlZiA9PT0gJ2FkZCcgfHwgcGlwZS50cmFuc2Zvcm1hdGlvbnNbcGlwZS50cmFuc2Zvcm1hdGlvbnMubGVuZ3RoLTFdLnJlZiA9PT0gJ3N1YnRyYWN0Jz8gZ2VuVHJhbnNmb3JtYXRvcnMoJ251bWJlcicpIDogZ2VuVHJhbnNmb3JtYXRvcnMoJ3RleHQnKTogW10pXHJcbiAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHBpcGUudmFsdWUucmVmID09PSAnZXZlbnREYXRhJyl7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudERhdGEgPSBzdGF0ZS5kZWZpbml0aW9uW3BpcGUudmFsdWUucmVmXVtwaXBlLnZhbHVlLmlkXVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIFtoKCdkaXYnLCB7c3R5bGU6e2Rpc3BsYXk6J2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJ30sIG9uOiB7Y2xpY2s6IFtTRUxFQ1RfUElQRSwgcmVmLmlkXX19LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzEnfX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtoKCdkaXYnLHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJywgY29sb3I6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHBpcGUudmFsdWUuaWQgPyAnI2VhYjY1Yyc6ICd3aGl0ZScsIHBhZGRpbmc6ICcycHggNXB4JywgbWFyZ2luOiAnM3B4IDNweCAwIDAnLCBib3JkZXI6ICcycHggc29saWQgJyArIChzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBwaXBlLnZhbHVlLmlkID8gJyNlYWI2NWMnOiAnd2hpdGUnKSwgZGlzcGxheTogJ2lubGluZS1ibG9jayd9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7Y2xpY2s6IFtTVEFURV9OT0RFX1NFTEVDVEVELCBwaXBlLnZhbHVlLmlkXX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbZXZlbnREYXRhLnRpdGxlXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzAnLCBjdXJzb3I6ICdkZWZhdWx0JywgY29sb3I6IHBpcGUudHJhbnNmb3JtYXRpb25zLmxlbmd0aCA+IDAgPyAnI2JkYmRiZCc6IGV2ZW50RGF0YS50eXBlID09PSB0eXBlID8gJ2dyZWVuJzogJ3JlZCd9fSwgZXZlbnREYXRhLnR5cGUpXHJcbiAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nTGVmdDogJzE1cHgnfX0sIGxpc3RUcmFuc2Zvcm1hdGlvbnMocGlwZS50cmFuc2Zvcm1hdGlvbnMsIHBpcGUudHlwZSkpLFxyXG4gICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbGlzdE5hbWVTcGFjZShzdGF0ZUlkKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnROYW1lU3BhY2UgPSBzdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZVtzdGF0ZUlkXVxyXG4gICAgICAgICAgICBmdW5jdGlvbiBlZGl0aW5nTm9kZSgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBoKCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBzdGF0ZUlkID8gJyNlYWI2NWMnOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJ2luc2V0IDAgLTFweCAwIDAgd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbjogICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udDogJ2luaGVyaXQnXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogW0NIQU5HRV9OQU1FU1BBQ0VfVElUTEUsIHN0YXRlSWRdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbGl2ZVByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdXJyZW50TmFtZVNwYWNlLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b2ZvY3VzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pc3RpdGxlZWRpdG9yJzogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgY2xvc2VkID0gc3RhdGUudmlld0ZvbGRlcnNDbG9zZWRbc3RhdGVJZF0gfHwgKHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgIT09IHN0YXRlSWQgJiYgY3VycmVudE5hbWVTcGFjZS5jaGlsZHJlbi5sZW5ndGggPT09IDApXHJcbiAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3ZnJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzOiB7d2lkdGg6IDEyLCBoZWlnaHQ6IDE2fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJywgcGFkZGluZzogJzAgNXB4JywgdHJhbnNmb3JtOiBjbG9zZWQgPyAncm90YXRlKDBkZWcpJzogJ3JvdGF0ZSg5MGRlZyknLCB0cmFuc2l0aW9uOiAnYWxsIDAuMnMnLCBtYXJnaW5MZWZ0OiAnLTEwcHgnfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGljazogW1ZJRVdfRk9MREVSX0NMSUNLRUQsIHN0YXRlSWRdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbaCgncG9seWdvbicsIHthdHRyczoge3BvaW50czogJzEyLDggMCwxIDMsOCAwLDE1J30sIHN0eWxlOiB7ZmlsbDogc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gc3RhdGVJZCA/ICcjZWFiNjVjJzogJ3doaXRlJywgdHJhbnNpdGlvbjogJ2ZpbGwgMC4ycyd9fSldKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuZWRpdGluZ1RpdGxlTm9kZUlkID09PSBzdGF0ZUlkID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVkaXRpbmdOb2RlKCk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywgeyBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJ30sIG9uOiB7ZGJsY2xpY2s6IFtFRElUX1ZJRVdfTk9ERV9USVRMRSwgc3RhdGVJZF19fSwgW2goJ3NwYW4nLCB7c3R5bGU6IHtjb2xvcjogc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gc3RhdGVJZCA/ICcjZWFiNjVjJzogJ3doaXRlJywgdHJhbnNpdGlvbjogJ2NvbG9yIDAuMnMnfX0sIGN1cnJlbnROYW1lU3BhY2UudGl0bGUpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7IGRpc3BsYXk6IGNsb3NlZCA/ICdub25lJzogJ2Jsb2NrJywgcGFkZGluZ0xlZnQ6ICcxMHB4JywgcGFkZGluZ0JvdHRvbTogJzVweCcsIHRyYW5zaXRpb246ICdib3JkZXItY29sb3IgMC4ycyd9fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5jdXJyZW50TmFtZVNwYWNlLmNoaWxkcmVuLm1hcCgocmVmKT0+IHJlZi5yZWYgPT09ICdzdGF0ZScgPyBsaXN0U3RhdGUocmVmLmlkKTogbGlzdE5hbWVTcGFjZShyZWYuaWQpKSxcclxuICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBsaXN0U3RhdGUoc3RhdGVJZCkge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50U3RhdGUgPSBzdGF0ZS5kZWZpbml0aW9uLnN0YXRlW3N0YXRlSWRdXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGVkaXRpbmdOb2RlKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2lucHV0Jywge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHN0YXRlSWQgPyAnI2VhYjY1Yyc6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm94U2hhZG93OiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcycHggNXB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAnM3B4IDNweCAwIDAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICcycHggc29saWQgJyArIChzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBzdGF0ZUlkID8gJyNlYWI2NWMnOiAnI2JkYmRiZCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnQ6ICdpbmhlcml0J1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IFtDSEFOR0VfU1RBVEVfTk9ERV9USVRMRSwgc3RhdGVJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBsaXZlUHJvcHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IGN1cnJlbnRTdGF0ZS50aXRsZSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGF0dHJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9mb2N1czogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGEtaXN0aXRsZWVkaXRvcic6IHRydWVcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZTogJzAuOGVtJyxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge29uOiB7Y2xpY2s6IFtTVEFURV9OT0RFX1NFTEVDVEVELCBzdGF0ZUlkXSwgZGJsY2xpY2s6IFtFRElUX1ZJRVdfTk9ERV9USVRMRSwgc3RhdGVJZF19fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQgPT09IHN0YXRlSWQgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWRpdGluZ05vZGUoKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtjb2xvcjogc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gc3RhdGVJZCA/ICcjZWFiNjVjJzogJ3doaXRlJywgcGFkZGluZzogJzJweCA1cHgnLCBtYXJnaW46ICc3cHggM3B4IDJweCAwJywgYm9yZGVyOiAnMnB4IHNvbGlkICcgKyAoc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gc3RhdGVJZCA/ICcjZWFiNjVjJzogJyNiZGJkYmQnKSwgYm9yZGVyUmFkaXVzOiAnMTBweCcsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCB0cmFuc2l0aW9uOiAnYWxsIDAuMnMnfX0sIGN1cnJlbnRTdGF0ZS50aXRsZSksXHJcbiAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsICc6ICcpLFxyXG4gICAgICAgICAgICAgICAgICAgICgoKT0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm9TdHlsZUlucHV0ID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IGN1cnJlbnRSdW5uaW5nU3RhdGVbc3RhdGVJZF0gIT09IHN0YXRlLmRlZmluaXRpb24uc3RhdGVbc3RhdGVJZF0uZGVmYXVsdFZhbHVlID8gJ3JnYig5MSwgMjA0LCA5MSknIDogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1heFdpZHRoOiAnNTAlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihjdXJyZW50U3RhdGUudHlwZSA9PT0gJ3RleHQnKSByZXR1cm4gaCgnaW5wdXQnLCB7YXR0cnM6IHt0eXBlOiAndGV4dCd9LCBsaXZlUHJvcHM6IHt2YWx1ZTogY3VycmVudFJ1bm5pbmdTdGF0ZVtzdGF0ZUlkXX0sIHN0eWxlOiBub1N0eWxlSW5wdXQsIG9uOiB7aW5wdXQ6IFtDSEFOR0VfQ1VSUkVOVF9TVEFURV9URVhUX1ZBTFVFLCBzdGF0ZUlkXX19KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihjdXJyZW50U3RhdGUudHlwZSA9PT0gJ251bWJlcicpIHJldHVybiBoKCdzcGFuJywge3N0eWxlOiB7cG9zaXRpb246ICdyZWxhdGl2ZSd9fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnaW5wdXQnLCB7YXR0cnM6IHt0eXBlOiAnbnVtYmVyJ30sIGxpdmVQcm9wczoge3ZhbHVlOiBjdXJyZW50UnVubmluZ1N0YXRlW3N0YXRlSWRdfSwgc3R5bGU6IHsuLi5ub1N0eWxlSW5wdXQsIHdpZHRoOiA5KmN1cnJlbnRSdW5uaW5nU3RhdGVbc3RhdGVJZF0udG9TdHJpbmcoKS5sZW5ndGggKyAncHgnfSwgb246IHtpbnB1dDogW0NIQU5HRV9DVVJSRU5UX1NUQVRFX05VTUJFUl9WQUxVRSwgc3RhdGVJZF19fSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGN1cnJlbnRTdGF0ZS50eXBlID09PSAndGFibGUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0YWJsZSA9IGN1cnJlbnRSdW5uaW5nU3RhdGVbc3RhdGVJZF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luVG9wOiAnM3B4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjODI4MTgzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZGlzcGxheTogJ2ZsZXgnfX0sICBPYmplY3Qua2V5cyhjdXJyZW50U3RhdGUuZGVmaW5pdGlvbikubWFwKGtleSA9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcxJywgcGFkZGluZzogJzJweCA1cHgnLCBib3JkZXJCb3R0b206ICcycHggc29saWQgd2hpdGUnfX0sIGtleSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLi4uT2JqZWN0LmtleXModGFibGUpLm1hcChpZCA9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZGlzcGxheTogJ2ZsZXgnfX0sIE9iamVjdC5rZXlzKHRhYmxlW2lkXSkubWFwKGtleSA9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcxJywgcGFkZGluZzogJzJweCA1cHgnfX0sIHRhYmxlW2lkXVtrZXldKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pKCksXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gc3RhdGVJZCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCBjdXJyZW50U3RhdGUubXV0YXRvcnMubWFwKHJlZiA9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge2NvbG9yOiAnd2hpdGUnLCB0cmFuc2l0aW9uOiAnYWxsIDAuMnMnLCBib3hTaGFkb3c6IHN0YXRlLnNlbGVjdGVkRXZlbnRJZCA9PT0gc3RhdGUuZGVmaW5pdGlvbi5tdXRhdG9yW3JlZi5pZF0uZXZlbnQuaWQgPyAnIzViY2M1YiA1cHggMCAwcHggMHB4IGluc2V0JzogJ25vbmUnLCBwYWRkaW5nOiAnMCAwIDAgN3B4J30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGljazogW1NFTEVDVF9FVkVOVCwgc3RhdGUuZGVmaW5pdGlvbi5tdXRhdG9yW3JlZi5pZF0uZXZlbnQuaWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGJsY2xpY2s6IFtFRElUX0VWRU5UX1RJVExFLCBzdGF0ZS5kZWZpbml0aW9uLm11dGF0b3JbcmVmLmlkXS5ldmVudC5pZF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICfigKIgJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQgPT09IHN0YXRlLmRlZmluaXRpb24ubXV0YXRvcltyZWYuaWRdLmV2ZW50LmlkID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnaW5wdXQnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm94U2hhZG93OiAnaW5zZXQgMCAtMXB4IDAgMCB3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbjogICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250OiAnaW5oZXJpdCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBbQ0hBTkdFX0VWRU5UX1RJVExFLCBzdGF0ZS5kZWZpbml0aW9uLm11dGF0b3JbcmVmLmlkXS5ldmVudC5pZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGl2ZVByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHN0YXRlLmRlZmluaXRpb24uZXZlbnRbc3RhdGUuZGVmaW5pdGlvbi5tdXRhdG9yW3JlZi5pZF0uZXZlbnQuaWRdLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b2ZvY3VzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLWlzdGl0bGVlZGl0b3InOiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogc3RhdGUuZGVmaW5pdGlvbi5ldmVudFtzdGF0ZS5kZWZpbml0aW9uLm11dGF0b3JbcmVmLmlkXS5ldmVudC5pZF0udGl0bGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRFdmVudElkID09PSBzdGF0ZS5kZWZpbml0aW9uLm11dGF0b3JbcmVmLmlkXS5ldmVudC5pZCA/IGgoJ2RpdicsIHtzdHlsZToge21hcmdpbkxlZnQ6ICcxMHB4J319LCBbZW1iZXJFZGl0b3Ioc3RhdGUuZGVmaW5pdGlvbi5tdXRhdG9yW3JlZi5pZF0ubXV0YXRpb24sIGN1cnJlbnRTdGF0ZS50eXBlKV0pOiBoKCdkaXYnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicpLFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzdGF0ZUNvbXBvbmVudCA9IGgoJ2RpdicsIHsgYXR0cnM6IHtjbGFzczogJ2JldHRlci1zY3JvbGxiYXInfSwgc3R5bGU6IHtvdmVyZmxvdzogJ2F1dG8nLCBmbGV4OiAnMScsIHBhZGRpbmc6ICc2cHggMTVweCd9LCBvbjoge2NsaWNrOiBbVU5TRUxFQ1RfU1RBVEVfTk9ERV19fSwgW2xpc3ROYW1lU3BhY2UoJ19yb290TmFtZVNwYWNlJyldKVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBsaXN0Qm94Tm9kZShub2RlUmVmLCBkZXB0aCkge1xyXG4gICAgICAgICAgICBjb25zdCBub2RlSWQgPSBub2RlUmVmLmlkXHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBzdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlSWRdXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGVkaXRpbmdOb2RlKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2lucHV0Jywge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzUzQjJFRCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICdpbnNldCAwIC0xcHggMCAwICM1M0IyRUQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250OiAnaW5oZXJpdCdcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBbQ0hBTkdFX1ZJRVdfTk9ERV9USVRMRSwgbm9kZVJlZl0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBsaXZlUHJvcHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG5vZGUudGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBhdHRyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvZm9jdXM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLWlzdGl0bGVlZGl0b3InOiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBjbG9zZWQgPSBzdGF0ZS52aWV3Rm9sZGVyc0Nsb3NlZFtub2RlSWRdXHJcbiAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nTGVmdDogZGVwdGggKjIwICsgOCsgJ3B4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM0NDQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJUb3A6IGRlcHRoID09PSAwID8gJzJweCBzb2xpZCAjMzMzJzogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3hTaGFkb3c6IGRlcHRoID09PSAwID8naW5zZXQgMCAycHggMCAwICM0ZDRkNGQnOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTogJzJweCBzb2xpZCAjMzMzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMnB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ1RvcDogZGVwdGggPT09IDAgPyAnM3B4JyA6ICcxcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nQm90dG9tOiAnM3B4JyxcclxuICAgICAgICAgICAgICAgICAgICB9fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlQm94JyAmJiBub2RlLmNoaWxkcmVuLmxlbmd0aCA+IDAgPyBoKCdzdmcnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHt3aWR0aDogMTIsIGhlaWdodDogMTZ9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInLCBwYWRkaW5nOiAnMCA1cHgnLCB0cmFuc2Zvcm06IGNsb3NlZCA/ICdyb3RhdGUoMGRlZyknOiAncm90YXRlKDkwZGVnKScsIHRyYW5zaXRpb246ICdhbGwgMC4ycycsIG1hcmdpbkxlZnQ6ICctM3B4J30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpY2s6IFtWSUVXX0ZPTERFUl9DTElDS0VELCBub2RlSWRdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbaCgncG9seWdvbicsIHthdHRyczoge3BvaW50czogJzEyLDggMCwxIDMsOCAwLDE1J30sIHN0eWxlOiB7ZmlsbDogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJyM1M0IyRUQnOiAnd2hpdGUnLCB0cmFuc2l0aW9uOiAnZmlsbCAwLjJzJ319KV0pOiBoKCdzcGFuJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3N2ZycsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRyczoge3dpZHRoOiAxNCwgaGVpZ2h0OiAxNX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcicsIHBhZGRpbmc6ICcwIDdweCAwIDAnfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbjoge2NsaWNrOiBbVklFV19OT0RFX1NFTEVDVEVELCBub2RlUmVmXX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlQm94JyA/IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdyZWN0Jywge2F0dHJzOiB7eDogMiwgeTogMiwgd2lkdGg6IDEyLCBoZWlnaHQ6IDEyLCBmaWxsOiAnbm9uZScsIHRyYW5zaXRpb246ICdhbGwgMC4ycycsc3Ryb2tlOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnIzUzQjJFRCc6ICcjYmRiZGJkJywgJ3N0cm9rZS13aWR0aCc6ICcyJ319KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF06XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZVJlZi5yZWYgPT09ICd2Tm9kZUxpc3QnID8gW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdjaXJjbGUnLCB7YXR0cnM6IHtyOiAyLCBjeDogMiwgY3k6IDIsIHRyYW5zaXRpb246ICdhbGwgMC4ycycsIGZpbGw6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJyNiZGJkYmQnLH19KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgncmVjdCcsIHthdHRyczoge3g6IDYsIHk6IDEsIHdpZHRoOiA4LCB0cmFuc2l0aW9uOiAnYWxsIDAuMnMnLCBoZWlnaHQ6IDIsIGZpbGw6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJyNiZGJkYmQnLH19KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnY2lyY2xlJywge2F0dHJzOiB7cjogMiwgY3g6IDIsIGN5OiA3LCB0cmFuc2l0aW9uOiAnYWxsIDAuMnMnLCBmaWxsOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnIzUzQjJFRCc6ICcjYmRiZGJkJyx9fSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3JlY3QnLCB7YXR0cnM6IHt4OiA2LCB5OiA2LCB3aWR0aDogOCwgdHJhbnNpdGlvbjogJ2FsbCAwLjJzJywgaGVpZ2h0OiAyLCBmaWxsOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnIzUzQjJFRCc6ICcjYmRiZGJkJyx9fSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2NpcmNsZScsIHthdHRyczoge3I6IDIsIGN4OiAyLCBjeTogMTIsIHRyYW5zaXRpb246ICdhbGwgMC4ycycsIGZpbGw6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJyNiZGJkYmQnLH19KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgncmVjdCcsIHthdHRyczoge3g6IDYsIHk6IDExLCB3aWR0aDogOCwgdHJhbnNpdGlvbjogJ2FsbCAwLjJzJywgaGVpZ2h0OiAyLCBmaWxsOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnIzUzQjJFRCc6ICcjYmRiZGJkJyx9fSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgndGV4dCcsIHthdHRyczogeyB4OjMsIHk6MTQsIGZpbGw6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJyNiZGJkYmQnfX0sICc/JyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQgPT09IG5vZGVJZCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlZGl0aW5nTm9kZSgpOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHsgc3R5bGU6IHtmbGV4OiAnMScsIGN1cnNvcjogJ3BvaW50ZXInLCBjb2xvcjogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJyM1M0IyRUQnOiAnd2hpdGUnLCB0cmFuc2l0aW9uOiAnY29sb3IgMC4ycyd9LCBvbjoge2NsaWNrOiBbVklFV19OT0RFX1NFTEVDVEVELCBub2RlUmVmXSwgZGJsY2xpY2s6IFtFRElUX1ZJRVdfTk9ERV9USVRMRSwgbm9kZUlkXX19LCBub2RlLnRpdGxlKSxcclxuICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IGRpc3BsYXk6IGNsb3NlZCA/ICdub25lJzogJ2Jsb2NrJywgdHJhbnNpdGlvbjogJ2JvcmRlci1jb2xvciAwLjJzJ30sXHJcbiAgICAgICAgICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5ub2RlLmNoaWxkcmVuLm1hcCgocmVmKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVmLnJlZiA9PT0gJ3ZOb2RlVGV4dCcpIHJldHVybiBzaW1wbGVOb2RlKHJlZiwgZGVwdGgrMSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmKHJlZi5yZWYgPT09ICd2Tm9kZUJveCcgfHwgcmVmLnJlZiA9PT0gJ3ZOb2RlTGlzdCcgfHwgcmVmLnJlZiA9PT0gJ3ZOb2RlSWYnKSByZXR1cm4gbGlzdEJveE5vZGUocmVmLCBkZXB0aCsxKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVmLnJlZiA9PT0gJ3ZOb2RlSW5wdXQnKSByZXR1cm4gc2ltcGxlTm9kZShyZWYsIGRlcHRoKzEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIHNpbXBsZU5vZGUobm9kZVJlZiwgZGVwdGgpIHtcclxuICAgICAgICAgICAgY29uc3Qgbm9kZUlkID0gbm9kZVJlZi5pZFxyXG4gICAgICAgICAgICBjb25zdCBub2RlID0gc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZUlkXVxyXG4gICAgICAgICAgICBmdW5jdGlvbiBlZGl0aW5nTm9kZSgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBoKCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyM1M0IyRUQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm94U2hhZG93OiAnaW5zZXQgMCAtMXB4IDAgMCAjNTNCMkVEJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udDogJ2luaGVyaXQnXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogW0NIQU5HRV9WSUVXX05PREVfVElUTEUsIG5vZGVSZWZdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbGl2ZVByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBub2RlLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b2ZvY3VzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pc3RpdGxlZWRpdG9yJzogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdMZWZ0OiBkZXB0aCAqMjAgKyA4ICsncHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzQ0NCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbkJvdHRvbTogJzJweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlckJvdHRvbTogJzJweCBzb2xpZCAjMzMzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZ1RvcDogJzFweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmdCb3R0b206ICczcHgnXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvbjoge2NsaWNrOiBbVklFV19OT0RFX1NFTEVDVEVELCBub2RlUmVmXSwgZGJsY2xpY2s6IFtFRElUX1ZJRVdfTk9ERV9USVRMRSwgbm9kZUlkXX1cclxuICAgICAgICAgICAgICAgIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlSW5wdXQnID8gaCgnc3ZnJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHt2aWV3Qm94OiAnMCAwIDE2IDE2Jywgd2lkdGg6IDE0LCBoZWlnaHQ6IDE0fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInLCBwYWRkaW5nOiAnMCA3cHggMCAwJ30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3BhdGgnLCB7YXR0cnM6IHtkOiAnTSAxNSwyIDExLDIgQyAxMC40NDcsMiAxMCwxLjU1MiAxMCwxIDEwLDAuNDQ4IDEwLjQ0NywwIDExLDAgbCA0LDAgYyAwLjU1MywwIDEsMC40NDggMSwxIDAsMC41NTIgLTAuNDQ3LDEgLTEsMSB6IG0gLTIsMTQgYyAtMC41NTMsMCAtMSwtMC40NDcgLTEsLTEgTCAxMiwxIGMgMCwtMC41NTIgMC40NDcsLTEgMSwtMSAwLjU1MywwIDEsMC40NDggMSwxIGwgMCwxNCBjIDAsMC41NTMgLTAuNDQ3LDEgLTEsMSB6IG0gMiwwIC00LDAgYyAtMC41NTMsMCAtMSwtMC40NDcgLTEsLTEgMCwtMC41NTMgMC40NDcsLTEgMSwtMSBsIDQsMCBjIDAuNTUzLDAgMSwwLjQ0NyAxLDEgMCwwLjU1MyAtMC40NDcsMSAtMSwxIHonLCBmaWxsOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnIzUzQjJFRCc6ICd3aGl0ZSd9fSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdwYXRoJywge2F0dHJzOiB7ZDogJ00gOS44MTE0ODI3LDQuMjM2MDM5MyBDIDkuNjU0NzM1Nyw0LjU4NjU5MDYgOS4zMDM5OTMzLDQuODI5NTg1NCA4Ljg5NTcyMzMsNC44Mjg4Njg0IEwgMS4yOTY4OTI2LDQuODExNTQwNCAxLjMxNjk0MzYsMi44MDY0NDcgOC45MDA2Mzc3LDIuODI4NjQyIGMgMC41NTI0NDgsMC4wMDE2NSAwLjk5OTMwNzQsMC40NTAxMjIzIDAuOTk3NjU2NCwxLjAwMjU2OTggLTIuMWUtNSwwLjE0NDU4NTYgLTAuMDMxMywwLjI4MDY3MzQgLTAuMDg2ODEsMC40MDQ4MjcgeicsIGZpbGw6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJ3doaXRlJ319KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3BhdGgnLCB7YXR0cnM6IHtkOiAnbSA5LjgxMTQ4MjcsMTEuNzM4NTYyIGMgLTAuMTU2NzQ3LDAuMzUwNTUxIC0wLjUwNzQ4OTQsMC41OTM1NDYgLTAuOTE1NzU5NCwwLjU5MjgyOSBsIC03LjU5ODgzMDcsLTAuMDE3MzMgMC4wMjAwNTEsLTIuMDA1MDkzIDcuNTgzNjk0MSwwLjAyMjE5IGMgMC41NTI0NDgsMC4wMDE2IDAuOTk5MzA3NCwwLjQ1MDEyMiAwLjk5NzY1NjQsMS4wMDI1NyAtMi4xZS01LDAuMTQ0NTg1IC0wLjAzMTMsMC4yODA2NzMgLTAuMDg2ODEsMC40MDQ4MjcgeicsIGZpbGw6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJ3doaXRlJ319KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3BhdGgnLCB7YXR0cnM6IHtkOiAnbSAxLjI5NDA1ODMsMTIuMjM5ODM2IDAuMDE3MDQsLTkuNDQ1MDk0NyAxLjk3MTQ4NTIsMC4wMjQ5MjMgLTAuMDIxODE4LDkuNDI2Mjc5NyB6JywgZmlsbDogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJyM1M0IyRUQnOiAnd2hpdGUnfX0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3ZnJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzOiB7dmlld0JveDogJzAgMCAzMDAgMzAwJywgd2lkdGg6IDE0LCBoZWlnaHQ6IDE0fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJywgcGFkZGluZzogJzAgN3B4IDAgMCd9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdwYXRoJywge2F0dHJzOiB7ZDogJ00gMCAwIEwgMCA4NS44MTI1IEwgMjcuMDMxMjUgODUuODEyNSBDIDM2LjYxNzc4NiA0NC4zNDYzMTYgNjcuODc2NTc5IDQyLjE3OTc5MyAxMDYuOTA2MjUgNDIuNTkzNzUgTCAxMDYuOTA2MjUgMjI4LjM3NSBDIDEwNy4zMTEwMSAyNzkuMDk2NDEgOTguOTA4Mzg2IDI3Ny4zMzYwMiA2Mi4xMjUgMjc3LjUgTCA2Mi4xMjUgMjk5LjU2MjUgTCAxNDkgMjk5LjU2MjUgTCAxNTAuMDMxMjUgMjk5LjU2MjUgTCAyMzYuOTA2MjUgMjk5LjU2MjUgTCAyMzYuOTA2MjUgMjc3LjUgQyAyMDAuMTIyODYgMjc3LjMzNiAxOTEuNzIwMjQgMjc5LjA5NjM5IDE5Mi4xMjUgMjI4LjM3NSBMIDE5Mi4xMjUgNDIuNTkzNzUgQyAyMzEuMTU0NjcgNDIuMTc5NzUgMjYyLjQxMzQ2IDQ0LjM0NjMwNCAyNzIgODUuODEyNSBMIDI5OS4wMzEyNSA4NS44MTI1IEwgMjk5LjAzMTI1IDAgTCAxNTAuMDMxMjUgMCBMIDE0OSAwIEwgMCAwIHonLCBmaWxsOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnIzUzQjJFRCc6ICcjYmRiZGJkJ319KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUuZWRpdGluZ1RpdGxlTm9kZUlkID09PSBub2RlSWQgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlZGl0aW5nTm9kZSgpOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7Y29sb3I6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJ3doaXRlJywgdHJhbnNpdGlvbjogJ2NvbG9yIDAuMnMnfX0sIG5vZGUudGl0bGUpLFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwcm9wc0NvbXBvbmVudCA9IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IHN0YXRlLnNlbGVjdGVkVmlld1N1Yk1lbnUgPT09ICdwcm9wcycgPyAnIzRkNGQ0ZCc6ICcjM2QzZDNkJyxcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMnB4IDE1cHggOHB4JyxcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICAgICAgdG9wOiAnMCcsXHJcbiAgICAgICAgICAgICAgICBsZWZ0OiAnNnB4JyxcclxuICAgICAgICAgICAgICAgIHpJbmRleDogc3RhdGUuc2VsZWN0ZWRWaWV3U3ViTWVudSA9PT0gJ3Byb3BzJyA/ICc1MDAnOiAnMCcsXHJcbiAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzE1cHggMTVweCAwIDAnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjMjIyJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclN0eWxlOiAnc29saWQnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6ICczcHggM3B4IDAgM3B4JyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgIGNsaWNrOiBbU0VMRUNUX1ZJRVdfU1VCTUVOVSwgJ3Byb3BzJ11cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sICdwcm9wcycpXHJcbiAgICAgICAgY29uc3Qgc3R5bGVDb21wb25lbnQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBzdGF0ZS5zZWxlY3RlZFZpZXdTdWJNZW51ID09PSAnc3R5bGUnID8gJyM0ZDRkNGQnOiAnIzNkM2QzZCcsXHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTJweCAxNXB4IDhweCcsXHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgICAgIHRvcDogJzAnLFxyXG4gICAgICAgICAgICAgICAgbGVmdDogJzkxcHgnLFxyXG4gICAgICAgICAgICAgICAgekluZGV4OiBzdGF0ZS5zZWxlY3RlZFZpZXdTdWJNZW51ID09PSAnc3R5bGUnID8gJzUwMCc6ICcwJyxcclxuICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTVweCAxNXB4IDAgMCcsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyMyMjInLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyU3R5bGU6ICdzb2xpZCcsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogJzNweCAzcHggMCAzcHgnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgY2xpY2s6IFtTRUxFQ1RfVklFV19TVUJNRU5VLCAnc3R5bGUnXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgJ3N0eWxlJylcclxuICAgICAgICBjb25zdCBldmVudHNDb21wb25lbnQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBzdGF0ZS5zZWxlY3RlZFZpZXdTdWJNZW51ID09PSAnZXZlbnRzJyA/ICcjNGQ0ZDRkJzogJyMzZDNkM2QnLFxyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzEycHggMTVweCA4cHgnLFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgIGxlZnQ6ICcxNjVweCcsXHJcbiAgICAgICAgICAgICAgICB6SW5kZXg6IHN0YXRlLnNlbGVjdGVkVmlld1N1Yk1lbnUgPT09ICdldmVudHMnID8gJzUwMCc6ICcwJyxcclxuICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTVweCAxNXB4IDAgMCcsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyMyMjInLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyU3R5bGU6ICdzb2xpZCcsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogJzNweCAzcHggMCAzcHgnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgY2xpY2s6IFtTRUxFQ1RfVklFV19TVUJNRU5VLCAnZXZlbnRzJ11cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sICdldmVudHMnKVxyXG4gICAgICAgIGNvbnN0IHVuc2VsZWN0Q29tcG9uZW50ID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM0ZDRkNGQnLFxyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzE1cHggMjNweCA1cHgnLFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgIHJpZ2h0OiAnMTZweCcsXHJcbiAgICAgICAgICAgICAgICB6SW5kZXg6ICcxMDAnLFxyXG4gICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxNXB4IDE1cHggMCAwJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiAnIzIyMicsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJTdHlsZTogJ3NvbGlkJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcldpZHRoOiAnM3B4IDNweCAwIDNweCcsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICBjbGljazogW1VOU0VMRUNUX1ZJRVdfTk9ERV1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sICd4JylcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2VuZXJhdGVFZGl0Tm9kZUNvbXBvbmVudCgpIHtcclxuICAgICAgICAgICAgY29uc3Qgc3R5bGVzID0gWydiYWNrZ3JvdW5kJywgJ2JvcmRlcicsICdvdXRsaW5lJywgJ2N1cnNvcicsICdjb2xvcicsICdkaXNwbGF5JywgJ3RvcCcsICdib3R0b20nLCAnbGVmdCcsICdyaWdodCcsICdwb3NpdGlvbicsICdvdmVyZmxvdycsICdoZWlnaHQnLCAnd2lkdGgnLCAnZm9udCcsICdmb250JywgJ21hcmdpbicsICdwYWRkaW5nJywgJ3VzZXJTZWxlY3QnXVxyXG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZE5vZGUgPSBzdGF0ZS5kZWZpbml0aW9uW3N0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmXVtzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkXVxyXG4gICAgICAgICAgICBjb25zdCBnZW5wcm9wc1N1Ym1lbnVDb21wb25lbnQgPSAoKSA9PiBoKCdkaXYnLCBbKCgpPT57XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZUJveCcpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpblRvcDogJzEwMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnI2JkYmRiZCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sICdDb21wb25lbnQgaGFzIG5vIHByb3BzJylcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZiA9PT0gJ3ZOb2RlVGV4dCcpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ1RvcDogJzIwcHgnfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWxpZ25JdGVtczogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM2NzY3NjcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICc1cHggMTBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luQm90dG9tOiAnMTBweCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJ319LCAndGV4dCB2YWx1ZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzAnLCBjdXJzb3I6ICdkZWZhdWx0JywgY29sb3I6ICcjYmRiZGJkJ319LCAndGV4dCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nOiAnNXB4IDEwcHgnfX0sIFtlbWJlckVkaXRvcihzZWxlY3RlZE5vZGUudmFsdWUsICd0ZXh0JyldKVxyXG4gICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZUlucHV0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nVG9wOiAnMjBweCd9fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzY3Njc2NycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzVweCAxMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW5Cb3R0b206ICcxMHB4J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnfX0sICdpbnB1dCB2YWx1ZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzAnLCBjdXJzb3I6ICdkZWZhdWx0JywgY29sb3I6ICcjYmRiZGJkJ319LCAndGV4dCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nOiAnNXB4IDEwcHgnfX0sIFtlbWJlckVkaXRvcihzZWxlY3RlZE5vZGUudmFsdWUsICd0ZXh0JyldKVxyXG4gICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZUxpc3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW5Ub3A6ICcxMDBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyNiZGJkYmQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LCAnVE9ETyBBREQgUFJPUFMnKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmID09PSAndk5vZGVJZicpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpblRvcDogJzEwMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnI2JkYmRiZCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sICdUT0RPIEFERCBQUk9QUycpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKCldKVxyXG4gICAgICAgICAgICBjb25zdCBnZW5zdHlsZVN1Ym1lbnVDb21wb25lbnQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RlZFN0eWxlID0gc3RhdGUuZGVmaW5pdGlvbi5zdHlsZVtzZWxlY3RlZE5vZGUuc3R5bGUuaWRdXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2JywgW1xyXG4gICAgICAgICAgICAgICAgICAgICgoKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge3N0eWxlOiB7fX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhzZWxlY3RlZFN0eWxlKS5tYXAoKGtleSkgPT4gaCgnZGl2JywgW2goJ2lucHV0Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm94U2hhZG93OiAnaW5zZXQgMCAtMXB4IDAgMCB3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzE2MHB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAnMTBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wczoge3ZhbHVlOiBzZWxlY3RlZFN0eWxlW2tleV19LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7aW5wdXQ6IFtDSEFOR0VfU1RZTEUsIHNlbGVjdGVkTm9kZS5zdHlsZS5pZCwga2V5XX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCBrZXkpXSkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICB9KSgpLFxyXG4gICAgICAgICAgICAgICAgICAgICgoKT0+e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge3N0eWxlOiB7fX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZXNcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKChrZXkpID0+ICFPYmplY3Qua2V5cyhzZWxlY3RlZFN0eWxlKS5pbmNsdWRlcyhrZXkpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKGtleSkgPT4gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbjoge2NsaWNrOiBbQUREX0RFRkFVTFRfU1RZTEUsIHNlbGVjdGVkTm9kZS5zdHlsZS5pZCwga2V5XX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNXB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJzNweCBzb2xpZCB3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnNXB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbjogJzVweCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sICcrICcgKyBrZXkpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgfSkoKSxcclxuICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgZ2VuZXZlbnRzU3VibWVudUNvbXBvbmVudCA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBhdmFpbGFibGVFdmVudHMgPSBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ29uIGNsaWNrJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lOiAnY2xpY2snXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnZG91YmxlIGNsaWNrZWQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eU5hbWU6ICdkYmxjbGljaydcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdtb3VzZSBvdmVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lOiAnbW91c2VvdmVyJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ21vdXNlIG91dCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZTogJ21vdXNlb3V0J1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZUlucHV0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIGF2YWlsYWJsZUV2ZW50cyA9IGF2YWlsYWJsZUV2ZW50cy5jb25jYXQoW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2lucHV0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZTogJ2lucHV0J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2ZvY3VzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZTogJ2ZvY3VzJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2JsdXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lOiAnYmx1cidcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudEV2ZW50cyA9IGF2YWlsYWJsZUV2ZW50cy5maWx0ZXIoKGV2ZW50KSA9PiBzZWxlY3RlZE5vZGVbZXZlbnQucHJvcGVydHlOYW1lXSlcclxuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50c0xlZnQgPSBhdmFpbGFibGVFdmVudHMuZmlsdGVyKChldmVudCkgPT4gIXNlbGVjdGVkTm9kZVtldmVudC5wcm9wZXJ0eU5hbWVdKVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nVG9wOiAnMjBweCd9fSwgZXZlbnRzTGVmdC5tYXAoKGV2ZW50KSA9PlxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnM3B4IHNvbGlkICM1YmNjNWInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnNXB4JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzVweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW46ICcxMHB4J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBvbjoge2NsaWNrOiBbQUREX0VWRU5ULCBldmVudC5wcm9wZXJ0eU5hbWVdfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sICcrICcgKyBldmVudC5kZXNjcmlwdGlvbiksXHJcbiAgICAgICAgICAgICAgICApLmNvbmNhdChjdXJyZW50RXZlbnRzLmxlbmd0aCA/XHJcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudEV2ZW50cy5tYXAoKGV2ZW50KSA9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtiYWNrZ3JvdW5kOiAnIzY3Njc2NycsIHBhZGRpbmc6ICc1cHggMTBweCd9fSwgZXZlbnQuZGVzY3JpcHRpb24pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICdjb2xvciAwLjJzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMC44ZW0nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnNXB4IDEwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm94U2hhZG93OiBzdGF0ZS5zZWxlY3RlZEV2ZW50SWQgPT09IHNlbGVjdGVkTm9kZVtldmVudC5wcm9wZXJ0eU5hbWVdLmlkID8gJyM1YmNjNWIgNXB4IDAgMHB4IDBweCBpbnNldCcgOiAnbm9uZSdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsaWNrOiBbU0VMRUNUX0VWRU5ULCBzZWxlY3RlZE5vZGVbZXZlbnQucHJvcGVydHlOYW1lXS5pZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYmxjbGljazogW0VESVRfRVZFTlRfVElUTEUsIHNlbGVjdGVkTm9kZVtldmVudC5wcm9wZXJ0eU5hbWVdLmlkXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge30sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICfigKIgJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLmVkaXRpbmdUaXRsZU5vZGVJZCA9PT0gc2VsZWN0ZWROb2RlW2V2ZW50LnByb3BlcnR5TmFtZV0uaWQgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2lucHV0Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICdpbnNldCAwIC0xcHggMCAwIHdoaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbjogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9udDogJ2luaGVyaXQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogW0NIQU5HRV9FVkVOVF9USVRMRSwgc2VsZWN0ZWROb2RlW2V2ZW50LnByb3BlcnR5TmFtZV0uaWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXZlUHJvcHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBzdGF0ZS5kZWZpbml0aW9uLmV2ZW50W3NlbGVjdGVkTm9kZVtldmVudC5wcm9wZXJ0eU5hbWVdLmlkXS50aXRsZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9mb2N1czogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLWlzdGl0bGVlZGl0b3InOiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogc3RhdGUuZGVmaW5pdGlvbi5ldmVudFtzZWxlY3RlZE5vZGVbZXZlbnQucHJvcGVydHlOYW1lXS5pZF0udGl0bGVdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pKSA6XHJcbiAgICAgICAgICAgICAgICAgICAgW10pKVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25zdCBmdWxsVk5vZGUgPSBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZiA9PT0gJ3ZOb2RlQm94JyB8fCBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZiA9PT0gJ3ZOb2RlVGV4dCcgfHwgc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZUlucHV0J1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogJy04cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZSgtMTAwJSwgMCknLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcmdpblJpZ2h0OiAnOHB4JyxcclxuICAgICAgICAgICAgICAgICAgICBib3R0b206ICc2cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzUwJScsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtmbGV4OiAnMScsIG1heEhlaWdodDogJzQzcHgnLCBtaW5IZWlnaHQ6ICc0M3B4JywgcG9zaXRpb246ICdyZWxhdGl2ZScsIG1hcmdpblRvcDogJzZweCd9fSwgZnVsbFZOb2RlID8gW2V2ZW50c0NvbXBvbmVudCwgc3R5bGVDb21wb25lbnQsIHByb3BzQ29tcG9uZW50LCB1bnNlbGVjdENvbXBvbmVudF06IFt1bnNlbGVjdENvbXBvbmVudF0pLFxyXG4gICAgICAgICAgICAgICAgaCgnZGl2Jywge2F0dHJzOiB7Y2xhc3M6ICdiZXR0ZXItc2Nyb2xsYmFyJ30sIHN0eWxlOiB7ZmxleDogJzEnLCBvdmVyZmxvdzogJ2F1dG8nLCBiYWNrZ3JvdW5kOiAnIzRkNGQ0ZCcsIGJvcmRlclJhZGl1czogJzEwcHgnLCB3aWR0aDogc3RhdGUuc3ViRWRpdG9yV2lkdGggKyAncHgnLCBib3JkZXI6ICczcHggc29saWQgIzIyMid9fSxbXHJcbiAgICAgICAgICAgICAgICAgICAgZHJhZ1N1YkNvbXBvbmVudCxcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5zZWxlY3RlZFZpZXdTdWJNZW51ID09PSAncHJvcHMnIHx8ICFmdWxsVk5vZGUgPyBnZW5wcm9wc1N1Ym1lbnVDb21wb25lbnQoKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRWaWV3U3ViTWVudSA9PT0gJ3N0eWxlJyA/IGdlbnN0eWxlU3VibWVudUNvbXBvbmVudCgpOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRWaWV3U3ViTWVudSA9PT0gJ2V2ZW50cycgPyBnZW5ldmVudHNTdWJtZW51Q29tcG9uZW50KCk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsICdFcnJvciwgbm8gc3VjaCBtZW51JylcclxuICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgIF0pXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBhZGRTdGF0ZUNvbXBvbmVudCA9IGgoJ2RpdicsIHtzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJywgZmxleDogJzAgYXV0bycsIGJhY2tncm91bmQ6ICcjMzMzJywgaGVpZ2h0OiAnNDBweCcsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcid9fSwgW1xyXG4gICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInLCBwYWRkaW5nOiAnMCA1cHgnfX0sICdhZGQgc3RhdGUnKVxyXG4gICAgICAgIF0pXHJcblxyXG4gICAgICAgIC8vIGZ1bmN0aW9uIGdlbmVyYXRlU2VsZWN0Vmlld05vZGVDb21wb25lbnQoKSB7XHJcbiAgICAgICAgLy8gICAgIHJldHVybiBoKCdkaXYnLCB7XHJcbiAgICAgICAgLy8gICAgICAgICBzdHlsZToge1xyXG4gICAgICAgIC8vICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgIC8vICAgICAgICAgICAgIGxlZnQ6ICcwcHgnLFxyXG4gICAgICAgIC8vICAgICAgICAgICAgIGJvdHRvbTogJzBweCcsXHJcbiAgICAgICAgLy8gICAgICAgICAgICAgaGVpZ2h0OiAnNTAlJyxcclxuICAgICAgICAvLyAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgLy8gICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXHJcbiAgICAgICAgLy8gICAgICAgICB9XHJcbiAgICAgICAgLy8gICAgIH0sIFtcclxuICAgICAgICAvLyAgICAgICAgIGgoJ2RpdicsIHthdHRyczoge2NsYXNzOiAnYmV0dGVyLXNjcm9sbGJhcid9LCBzdHlsZToge21hcmdpbjogJzQ5cHggM3B4IDAgMCcsIGZsZXg6ICcxJywgb3ZlcmZsb3c6ICdhdXRvJywgYmFja2dyb3VuZDogJyMzMzMnLCB3aWR0aDogc3RhdGUuZWRpdG9yUmlnaHRXaWR0aCArICdweCd9fSxbXHJcbiAgICAgICAgLy8gICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZzogJzVweCcsIG1hcmdpbjogJzVweCd9fSwgJ2RyYWcgYW5kIGRyb3AgY29tcG9uZW50cyBpbnRvIHRoZSBjb21wb25lbnQgdHJlZSBvciBpbnRvIGxpdmUgYXBwbGljYXRpb24nKSxcclxuICAgICAgICAvLyAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtjdXJzb3I6ICdwb2ludGVyJywgYm9yZGVyUmFkaXVzOiAnNXB4JywgYm9yZGVyOiAnM3B4IHNvbGlkICM1M0IyRUQnLCBwYWRkaW5nOiAnNXB4JywgbWFyZ2luOiAnNXB4J30sIG9uOiB7XHJcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICBtb3VzZWRvd246IFtOT0RFX0RSQUdHRUQsICdib3gnXSxcclxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgIHRvdWNoc3RhcnQ6IFtOT0RFX0RSQUdHRUQsICdib3gnXSxcclxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgfX0sXHJcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICcrIGJveCdcclxuICAgICAgICAvLyAgICAgICAgICAgICApLFxyXG4gICAgICAgIC8vICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2N1cnNvcjogJ3BvaW50ZXInLCBib3JkZXJSYWRpdXM6ICc1cHgnLCBib3JkZXI6ICczcHggc29saWQgIzUzQjJFRCcsIHBhZGRpbmc6ICc1cHgnLCBtYXJnaW46ICc1cHgnfSwgb246IHtcclxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgIG1vdXNlZG93bjogW05PREVfRFJBR0dFRCwgJ3RleHQnXSxcclxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgIHRvdWNoc3RhcnQ6IFtOT0RFX0RSQUdHRUQsICd0ZXh0J10sXHJcbiAgICAgICAgLy8gICAgICAgICAgICAgICAgIH19LFxyXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAnKyB0ZXh0J1xyXG4gICAgICAgIC8vICAgICAgICAgICAgICksXHJcbiAgICAgICAgLy8gICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7Y3Vyc29yOiAncG9pbnRlcicsIGJvcmRlclJhZGl1czogJzVweCcsIGJvcmRlcjogJzNweCBzb2xpZCAjNTNCMkVEJywgcGFkZGluZzogJzVweCcsIG1hcmdpbjogJzVweCd9LCBvbjoge1xyXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgbW91c2Vkb3duOiBbTk9ERV9EUkFHR0VELCAnaW5wdXQnXSxcclxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgIHRvdWNoc3RhcnQ6IFtOT0RFX0RSQUdHRUQsICdpbnB1dCddLFxyXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICB9fSxcclxuICAgICAgICAvLyAgICAgICAgICAgICAgICAgJysgaW5wdXQnXHJcbiAgICAgICAgLy8gICAgICAgICAgICAgKSxcclxuICAgICAgICAvLyAgICAgICAgIF0pXHJcbiAgICAgICAgLy8gICAgIF0pXHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICBjb25zdCBhZGRWaWV3Tm9kZUNvbXBvbmVudCA9IGgoJ2RpdicsIHtzdHlsZTogeyBmbGV4OiAnMCBhdXRvJywgbWFyZ2luTGVmdDogc3RhdGUucmlnaHRPcGVuID8gJy0xMHB4JzogJzAnLCBib3JkZXI6ICczcHggc29saWQgIzIyMicsIGJvcmRlclJpZ2h0OiAnbm9uZScsIGJhY2tncm91bmQ6ICcjMzMzJywgaGVpZ2h0OiAnNDBweCcsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcid9LCBvbjoge2NsaWNrOiBbU0hPV19WSUVXX05PREVTXX19LCBbXHJcbiAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHsgcGFkZGluZzogJzAgMTBweCd9fSwgJ2FkZCBjb21wb25lbnQ6ICcpLFxyXG4gICAgICAgICAgICBoKCdzcGFuJywge29uOiB7Y2xpY2s6IFtBRERfTk9ERSwgc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZSwgJ2JveCddfX0sIFtib3hJY29uXSksXHJcbiAgICAgICAgICAgIGgoJ3NwYW4nLCB7b246IHtjbGljazogW0FERF9OT0RFLCBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLCAnaW5wdXQnXX19LCBbaW5wdXRJY29uXSksXHJcbiAgICAgICAgICAgIGgoJ3NwYW4nLCB7b246IHtjbGljazogW0FERF9OT0RFLCBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLCAndGV4dCddfX0sIFt0ZXh0SWNvbl0pXHJcbiAgICAgICAgXSlcclxuXHJcbiAgICAgICAgY29uc3Qgdmlld0NvbXBvbmVudCA9IGgoJ2RpdicsIHthdHRyczoge2NsYXNzOiAnYmV0dGVyLXNjcm9sbGJhcid9LCBzdHlsZToge292ZXJmbG93OiAnYXV0bycsIHBvc2l0aW9uOiAncmVsYXRpdmUnLCBmbGV4OiAnMSd9LCBvbjoge2NsaWNrOiBbVU5TRUxFQ1RfVklFV19OT0RFXX19LCBbXHJcbiAgICAgICAgICAgIGxpc3RCb3hOb2RlKHtyZWY6ICd2Tm9kZUJveCcsIGlkOidfcm9vdE5vZGUnfSwgMCksXHJcbiAgICAgICAgXSlcclxuXHJcbiAgICAgICAgY29uc3QgcmlnaHRDb21wb25lbnQgPVxyXG4gICAgICAgICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2ZpeGVkJyxcclxuICAgICAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICByaWdodDogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvbnQ6IFwiMzAwIDEuMmVtICdPcGVuIFNhbnMnXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgbGluZUhlaWdodDogJzEuMmVtJyxcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogc3RhdGUuZWRpdG9yUmlnaHRXaWR0aCArICdweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM0ZDRkNGQnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJveFNpemluZzogXCJib3JkZXItYm94XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgYm9yZGVyTGVmdDogJzNweCBzb2xpZCAjMjIyJyxcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnMC41cyB0cmFuc2Zvcm0nLFxyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogc3RhdGUucmlnaHRPcGVuID8gJ3RyYW5zbGF0ZVooMCkgdHJhbnNsYXRlWCgwJSknOiAndHJhbnNsYXRlWigwKSB0cmFuc2xhdGVYKDEwMCUpJyxcclxuICAgICAgICAgICAgICAgICAgICB1c2VyU2VsZWN0OiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgICAgICBkcmFnQ29tcG9uZW50UmlnaHQsXHJcbiAgICAgICAgICAgICAgICBhZGRTdGF0ZUNvbXBvbmVudCxcclxuICAgICAgICAgICAgICAgIHN0YXRlQ29tcG9uZW50LFxyXG4gICAgICAgICAgICAgICAgYWRkVmlld05vZGVDb21wb25lbnQsXHJcbiAgICAgICAgICAgICAgICB2aWV3Q29tcG9uZW50LFxyXG4gICAgICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPyBnZW5lcmF0ZUVkaXROb2RlQ29tcG9uZW50KCk6IGgoJ3NwYW4nKVxyXG4gICAgICAgICAgICBdKVxyXG5cclxuXHJcbiAgICAgICAgY29uc3QgdG9wQ29tcG9uZW50ID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgZmxleDogJzEgYXV0bycsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICc3NXB4JyxcclxuICAgICAgICAgICAgICAgIG1heEhlaWdodDogJzc1cHgnLFxyXG4gICAgICAgICAgICAgICAgbWluSGVpZ2h0OiAnNzVweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzIyMicsXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OidmbGV4JyxcclxuICAgICAgICAgICAgICAgIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiJ0NvbWZvcnRhYScsIHNhbnMtc2VyaWZcIixcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIFtcclxuICAgICAgICAgICAgaCgnYScsIHtzdHlsZToge2ZsZXg6ICcwIGF1dG8nLCB3aWR0aDogJzE5MHB4JywgdGV4dERlY29yYXRpb246ICdpbmhlcml0JywgdXNlclNlbGVjdDogJ25vbmUnfSwgYXR0cnM6IHtocmVmOicvX2Rldid9fSwgW1xyXG4gICAgICAgICAgICAgICAgaCgnaW1nJyx7c3R5bGU6IHsgbWFyZ2luOiAnN3B4IC0ycHggLTNweCA1cHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJ30sIGF0dHJzOiB7c3JjOiAnL2ltYWdlcy9sb2dvMjU2eDI1Ni5wbmcnLCBoZWlnaHQ6ICc1Nyd9fSksXHJcbiAgICAgICAgICAgICAgICBoKCdzcGFuJyx7c3R5bGU6IHsgZm9udFNpemU6JzQ0cHgnLCAgdmVydGljYWxBbGlnbjogJ2JvdHRvbScsIGNvbG9yOiAnI2ZmZid9fSwgJ3VnbmlzJylcclxuICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgIHJpZ2h0OiAnMCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzljNDg0OCcsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMHB4JyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxNXB4IDIwcHgnLFxyXG4gICAgICAgICAgICAgICAgbWFyZ2luOiAnMTNweCcsXHJcbiAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICBjbGljazogUkVTRVRfQVBQXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sICdyZXNldCBkZW1vJylcclxuICAgICAgICBdKVxyXG4gICAgICAgIGNvbnN0IGxlZnRDb21wb25lbnQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnZml4ZWQnLFxyXG4gICAgICAgICAgICAgICAgdG9wOiAnMCcsXHJcbiAgICAgICAgICAgICAgICBsZWZ0OiAnMCcsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgZm9udDogXCIzMDAgMS4yZW0gJ09wZW4gU2FucydcIixcclxuICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6ICcxLjJlbScsXHJcbiAgICAgICAgICAgICAgICB3aWR0aDogc3RhdGUuZWRpdG9yTGVmdFdpZHRoICsgJ3B4JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNGQ0ZDRkJyxcclxuICAgICAgICAgICAgICAgIGJveFNpemluZzogXCJib3JkZXItYm94XCIsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSaWdodDogJzNweCBzb2xpZCAjMjIyJyxcclxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb246ICcwLjVzIHRyYW5zZm9ybScsXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06IHN0YXRlLmxlZnRPcGVuID8gJ3RyYW5zbGF0ZVooMCkgdHJhbnNsYXRlWCgwJSknOiAndHJhbnNsYXRlWigwKSB0cmFuc2xhdGVYKC0xMDAlKScsXHJcbiAgICAgICAgICAgICAgICB1c2VyU2VsZWN0OiAnbm9uZScsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICBkcmFnQ29tcG9uZW50TGVmdCxcclxuICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICBjbGljazogRlJFRVpFUl9DTElDS0VEXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBmbGV4OiAnMCBhdXRvJyxcclxuICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzMzMycsXHJcbiAgICAgICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7IHBhZGRpbmc6ICcxNXB4IDE1cHggMTBweCAxNXB4JywgY29sb3I6IHN0YXRlLmFwcElzRnJvemVuID8gJ3JnYig5MSwgMjA0LCA5MSknIDogJ3JnYigyMDQsIDkxLCA5MSknfX0sIHN0YXRlLmFwcElzRnJvemVuID8gJ+KWuicgOiAn4p2a4p2aJyksXHJcbiAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHtjbGFzczogJ2JldHRlci1zY3JvbGxiYXInfSxcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmbGV4OiAnMSBhdXRvJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdmVyZmxvdzogJ2F1dG8nXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHN0YXRlLmV2ZW50U3RhY2tcclxuICAgICAgICAgICAgICAgICAgICAubWFwKChhKT0+YSlcclxuICAgICAgICAgICAgICAgICAgICAucmV2ZXJzZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgLm1hcChldmVudERhdGEgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBldmVudCA9IHN0YXRlLmRlZmluaXRpb24uZXZlbnRbZXZlbnREYXRhLmV2ZW50SWRdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVtaXR0ZXIgPSBzdGF0ZS5kZWZpbml0aW9uW2V2ZW50LmVtaXR0ZXIucmVmXVtldmVudC5lbWl0dGVyLmlkXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZzogJzVweCcsIGNvbG9yOiAnI2ZmZmZmZid9fSwgW1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2N1cnNvcjogJ3BvaW50ZXInLCBiYWNrZ3JvdW5kOiAnIzMzMycsIGJvcmRlclJhZGl1czogJzEwcHgnLCBwYWRkaW5nOiAnNXB4J30sIG9uOiB7Y2xpY2s6IFtWSUVXX05PREVfU0VMRUNURUQsIGV2ZW50LmVtaXR0ZXJdfX0sIFtlbWl0dGVyLnRpdGxlICsgJzogJyArIGV2ZW50LnR5cGVdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIE9iamVjdC5rZXlzKGV2ZW50RGF0YS5tdXRhdGlvbnMpLm1hcChzdGF0ZUlkID0+IHN0YXRlLmRlZmluaXRpb24uc3RhdGVbc3RhdGVJZF0udGl0bGUgKyAnOiAnICsgZXZlbnREYXRhLm11dGF0aW9uc1tzdGF0ZUlkXS50b1N0cmluZygpKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgXSlcclxuICAgICAgICBjb25zdCByZW5kZXJWaWV3Q29tcG9uZW50ID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgZmxleDogJzEgYXV0bycsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBgXHJcbiAgICAgICAgICAgICAgICAgICAgcmFkaWFsLWdyYWRpZW50KGJsYWNrIDUlLCB0cmFuc3BhcmVudCAxNiUpIDAgMCxcclxuICAgICAgICAgICAgICAgICAgICByYWRpYWwtZ3JhZGllbnQoYmxhY2sgNSUsIHRyYW5zcGFyZW50IDE2JSkgOHB4IDhweCxcclxuICAgICAgICAgICAgICAgICAgICByYWRpYWwtZ3JhZGllbnQocmdiYSgyNTUsMjU1LDI1NSwuMSkgNSUsIHRyYW5zcGFyZW50IDIwJSkgMCAxcHgsXHJcbiAgICAgICAgICAgICAgICAgICAgcmFkaWFsLWdyYWRpZW50KHJnYmEoMjU1LDI1NSwyNTUsLjEpIDUlLCB0cmFuc3BhcmVudCAyMCUpIDhweCA5cHhgLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOicjMzMzJyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRTaXplOicxNnB4IDE2cHgnLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlWigwKScsXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OidyZWxhdGl2ZScsXHJcbiAgICAgICAgICAgICAgICBvdmVyZmxvdzogJ2F1dG8nLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sIFtcclxuICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiAoKCk9PntcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRlc2lyZWRXaWR0aCA9IDE5MjBcclxuICAgICAgICAgICAgICAgIGNvbnN0IGRlc2lyZWRIZWlnaHQgPSAxMDgwXHJcbiAgICAgICAgICAgICAgICBjb25zdCB0b3BNZW51SGVpZ2h0ID0gNzVcclxuICAgICAgICAgICAgICAgIGNvbnN0IHdpZHRoTGVmdCA9IHdpbmRvdy5pbm5lcldpZHRoIC0gKHN0YXRlLmVkaXRvckxlZnRXaWR0aCArIHN0YXRlLmVkaXRvclJpZ2h0V2lkdGgpXHJcbiAgICAgICAgICAgICAgICBjb25zdCBoZWlnaHRMZWZ0ID0gd2luZG93LmlubmVySGVpZ2h0IC0gdG9wTWVudUhlaWdodFxyXG4gICAgICAgICAgICAgICAgbGV0IHNjYWxlWCA9IHdpZHRoTGVmdCA8IGRlc2lyZWRXaWR0aCA/IHdpZHRoTGVmdC9kZXNpcmVkV2lkdGg6IDFcclxuICAgICAgICAgICAgICAgIGxldCBzY2FsZVkgPSBoZWlnaHRMZWZ0IDwgZGVzaXJlZEhlaWdodCA/IGhlaWdodExlZnQvZGVzaXJlZEhlaWdodDogMVxyXG4gICAgICAgICAgICAgICAgaWYoc2NhbGVYID4gc2NhbGVZKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NhbGVYID0gc2NhbGVZXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlWSA9IHNjYWxlWFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aDogZGVzaXJlZFdpZHRoICsncHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogZGVzaXJlZEhlaWdodCArICdweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyNmZmZmZmYnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJ3JnYmEoMCwgMCwgMCwgMC4yNDcwNTkpIDBweCAxNHB4IDQ1cHgsIHJnYmEoMCwgMCwgMCwgMC4yMTk2MDgpIDBweCAxMHB4IDE4cHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVooMCkgc2NhbGUoJysgc2NhbGVYICsgJywnKyBzY2FsZVkgKycpJyxcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgICAgICAgICB0b3A6IChoZWlnaHRMZWZ0LWRlc2lyZWRIZWlnaHQpLzIgKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6ICh3aWR0aExlZnQtZGVzaXJlZFdpZHRoKS8yK3N0YXRlLmVkaXRvckxlZnRXaWR0aCArICdweCcsXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pKCl9LCBbXHJcbiAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtiYWNrZ3JvdW5kOiAnIzkzZDFmNycsIHdpZHRoOiAnMTAwJScsIGhlaWdodDogJzQwcHgnLCBwb3NpdGlvbjonYWJzb2x1dGUnLCB0b3A6ICctNDBweCcsIGRpc3BsYXk6ICdmbGV4JywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgbGVmdDogJzAnLCBib3JkZXJSYWRpdXM6ICc1cHggNXB4IDAgMCcsIGJveFNoYWRvdzogJ2luc2V0IDAgLTNweCAwIDAgI2I3YjdiNyd9fSwgJ3RvZG86IHVybCwgd2lkdGggYW5kIGhlaWdodCwgY2xvc2UgYnV0dG9uJyksXHJcbiAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtvdmVyZmxvdzogJ2F1dG8nLCB3aWR0aDogJzEwMCUnLCBoZWlnaHQ6ICcxMDAlJ319LCBbYXBwLnZkb21dKVxyXG4gICAgICAgICAgICBdKVxyXG4gICAgICAgIF0pXHJcbiAgICAgICAgY29uc3QgbWFpblJvd0NvbXBvbmVudCA9IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgIGZsZXg6ICcxJyxcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlWigwKScsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICByZW5kZXJWaWV3Q29tcG9uZW50LFxyXG4gICAgICAgICAgICBsZWZ0Q29tcG9uZW50LFxyXG4gICAgICAgICAgICByaWdodENvbXBvbmVudFxyXG4gICAgICAgIF0pXHJcbiAgICAgICAgY29uc3Qgdm5vZGUgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnZml4ZWQnLFxyXG4gICAgICAgICAgICAgICAgdG9wOiAnMCcsXHJcbiAgICAgICAgICAgICAgICByaWdodDogJzAnLFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6ICcxMDB2dycsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDB2aCcsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICB0b3BDb21wb25lbnQsXHJcbiAgICAgICAgICAgIG1haW5Sb3dDb21wb25lbnQsXHJcbiAgICAgICAgXSlcclxuXHJcbiAgICAgICAgbm9kZSA9IHBhdGNoKG5vZGUsIHZub2RlKVxyXG4gICAgfVxyXG5cclxuICAgIHJlbmRlcigpXHJcbn0iLCJmdW5jdGlvbiB1cGRhdGVQcm9wcyhvbGRWbm9kZSwgdm5vZGUpIHtcclxuICAgIHZhciBrZXksIGN1ciwgb2xkLCBlbG0gPSB2bm9kZS5lbG0sXHJcbiAgICAgICAgcHJvcHMgPSB2bm9kZS5kYXRhLmxpdmVQcm9wcyB8fCB7fTtcclxuICAgIGZvciAoa2V5IGluIHByb3BzKSB7XHJcbiAgICAgICAgY3VyID0gcHJvcHNba2V5XTtcclxuICAgICAgICBvbGQgPSBlbG1ba2V5XTtcclxuICAgICAgICBpZiAob2xkICE9PSBjdXIpIGVsbVtrZXldID0gY3VyO1xyXG4gICAgfVxyXG59XHJcbmNvbnN0IGxpdmVQcm9wc1BsdWdpbiA9IHtjcmVhdGU6IHVwZGF0ZVByb3BzLCB1cGRhdGU6IHVwZGF0ZVByb3BzfTtcclxuaW1wb3J0IHNuYWJiZG9tIGZyb20gJ3NuYWJiZG9tJ1xyXG5jb25zdCBwYXRjaCA9IHNuYWJiZG9tLmluaXQoW1xyXG4gICAgcmVxdWlyZSgnc25hYmJkb20vbW9kdWxlcy9jbGFzcycpLFxyXG4gICAgcmVxdWlyZSgnc25hYmJkb20vbW9kdWxlcy9wcm9wcycpLFxyXG4gICAgcmVxdWlyZSgnc25hYmJkb20vbW9kdWxlcy9zdHlsZScpLFxyXG4gICAgcmVxdWlyZSgnc25hYmJkb20vbW9kdWxlcy9ldmVudGxpc3RlbmVycycpLFxyXG4gICAgcmVxdWlyZSgnc25hYmJkb20vbW9kdWxlcy9hdHRyaWJ1dGVzJyksXHJcbiAgICBsaXZlUHJvcHNQbHVnaW5cclxuXSk7XHJcbmltcG9ydCBoIGZyb20gJ3NuYWJiZG9tL2gnO1xyXG5pbXBvcnQgYmlnIGZyb20gJ2JpZy5qcyc7XHJcblxyXG5mdW5jdGlvbiBmbGF0dGVuKGFycikge1xyXG4gICAgcmV0dXJuIGFyci5yZWR1Y2UoZnVuY3Rpb24gKGZsYXQsIHRvRmxhdHRlbikge1xyXG4gICAgICAgIHJldHVybiBmbGF0LmNvbmNhdChBcnJheS5pc0FycmF5KHRvRmxhdHRlbikgPyBmbGF0dGVuKHRvRmxhdHRlbikgOiB0b0ZsYXR0ZW4pO1xyXG4gICAgfSwgW10pO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCAoZGVmaW5pdGlvbikgPT4ge1xyXG5cclxuICAgIGxldCBjdXJyZW50U3RhdGUgPSBPYmplY3Qua2V5cyhkZWZpbml0aW9uLnN0YXRlKS5tYXAoa2V5PT5kZWZpbml0aW9uLnN0YXRlW2tleV0pLnJlZHVjZSgoYWNjLCBkZWYpPT4ge1xyXG4gICAgICAgIGFjY1tkZWYucmVmXSA9IGRlZi5kZWZhdWx0VmFsdWVcclxuICAgICAgICByZXR1cm4gYWNjXHJcbiAgICB9LCB7fSlcclxuXHJcbiAgICAvLyBBbGxvd3Mgc3RvcGluZyBhcHBsaWNhdGlvbiBpbiBkZXZlbG9wbWVudC4gVGhpcyBpcyBub3QgYW4gYXBwbGljYXRpb24gc3RhdGVcclxuICAgIGxldCBmcm96ZW4gPSBmYWxzZVxyXG4gICAgbGV0IGZyb3plbkNhbGxiYWNrID0gbnVsbFxyXG4gICAgbGV0IHNlbGVjdEhvdmVyQWN0aXZlID0gZmFsc2VcclxuICAgIGxldCBzZWxlY3RlZE5vZGVJbkRldmVsb3BtZW50ID0ge31cclxuXHJcbiAgICBmdW5jdGlvbiBzZWxlY3ROb2RlSG92ZXIocmVmLCBlKSB7XHJcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIHNlbGVjdGVkTm9kZUluRGV2ZWxvcG1lbnQgPSByZWZcclxuICAgICAgICBmcm96ZW5DYWxsYmFjayhyZWYpXHJcbiAgICAgICAgcmVuZGVyKClcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHNlbGVjdE5vZGVDbGljayhyZWYsIGUpIHtcclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgc2VsZWN0SG92ZXJBY3RpdmUgPSBmYWxzZVxyXG4gICAgICAgIHNlbGVjdGVkTm9kZUluRGV2ZWxvcG1lbnQgPSByZWZcclxuICAgICAgICBmcm96ZW5DYWxsYmFjayhyZWYpXHJcbiAgICAgICAgcmVuZGVyKClcclxuICAgIH1cclxuXHJcbiAgICAvLyBnbG9iYWwgc3RhdGUgZm9yIHJlc29sdmVyXHJcbiAgICBsZXQgY3VycmVudEV2ZW50ID0gbnVsbFxyXG4gICAgbGV0IGN1cnJlbnRNYXBWYWx1ZSA9IHt9XHJcbiAgICBsZXQgY3VycmVudE1hcEluZGV4ID0ge31cclxuICAgIGxldCBldmVudERhdGEgPSB7fVxyXG4gICAgZnVuY3Rpb24gcmVzb2x2ZShyZWYpe1xyXG4gICAgICAgIGlmKHJlZiA9PT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHN0YXRpYyB2YWx1ZSAoc3RyaW5nL251bWJlcilcclxuICAgICAgICBpZihyZWYucmVmID09PSB1bmRlZmluZWQpe1xyXG4gICAgICAgICAgICByZXR1cm4gcmVmXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGRlZiA9IGRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXVxyXG4gICAgICAgIGlmIChyZWYucmVmID09PSAncGlwZScpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBpcGUocmVmKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ2NvbmRpdGlvbmFsJykge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzb2x2ZShkZWYucHJlZGljYXRlKSA/IHJlc29sdmUoZGVmLnRoZW4pIDogcmVzb2x2ZShkZWYuZWxzZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdzdGF0ZScpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRTdGF0ZVtyZWYuaWRdXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWYucmVmID09PSAndk5vZGVCb3gnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBib3hOb2RlKHJlZilcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICd2Tm9kZVRleHQnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0ZXh0Tm9kZShyZWYpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWYucmVmID09PSAndk5vZGVJbnB1dCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGlucHV0Tm9kZShyZWYpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWYucmVmID09PSAndk5vZGVMaXN0Jykge1xyXG4gICAgICAgICAgICByZXR1cm4gbGlzdE5vZGUocmVmKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3ZOb2RlSWYnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpZk5vZGUocmVmKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3N0eWxlJykge1xyXG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMoZGVmKS5yZWR1Y2UoKGFjYywgdmFsKT0+IHtcclxuICAgICAgICAgICAgICAgIGFjY1t2YWxdID0gcmVzb2x2ZShkZWZbdmFsXSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBhY2NcclxuICAgICAgICAgICAgfSwge30pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWYucmVmID09PSAnZXZlbnREYXRhJykge1xyXG4gICAgICAgICAgICByZXR1cm4gZXZlbnREYXRhW3JlZi5pZF1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdsaXN0VmFsdWUnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50TWFwVmFsdWVbZGVmLmxpc3QuaWRdW2RlZi5wcm9wZXJ0eV1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhyb3cgRXJyb3IocmVmKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHRyYW5zZm9ybVZhbHVlKHZhbHVlLCB0cmFuc2Zvcm1hdGlvbnMpe1xyXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0cmFuc2Zvcm1hdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgcmVmID0gdHJhbnNmb3JtYXRpb25zW2ldO1xyXG4gICAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1lciA9IGRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXVxyXG4gICAgICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ2VxdWFsJykge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY29tcGFyZVZhbHVlID0gcmVzb2x2ZSh0cmFuc2Zvcm1lci52YWx1ZSlcclxuICAgICAgICAgICAgICAgIGlmKHZhbHVlIGluc3RhbmNlb2YgYmlnIHx8IGNvbXBhcmVWYWx1ZSBpbnN0YW5jZW9mIGJpZyl7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBiaWcodmFsdWUpLmVxKGNvbXBhcmVWYWx1ZSlcclxuICAgICAgICAgICAgICAgIH0gZWxzZXtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlID09PSBjb21wYXJlVmFsdWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ2FkZCcpIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gYmlnKHZhbHVlKS5wbHVzKHJlc29sdmUodHJhbnNmb3JtZXIudmFsdWUpKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZWYucmVmID09PSAnc3VidHJhY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGJpZyh2YWx1ZSkubWludXMocmVzb2x2ZSh0cmFuc2Zvcm1lci52YWx1ZSkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdtdWx0aXBseScpIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gYmlnKHZhbHVlKS50aW1lcyhyZXNvbHZlKHRyYW5zZm9ybWVyLnZhbHVlKSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ2RpdmlkZScpIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gYmlnKHZhbHVlKS5kaXYocmVzb2x2ZSh0cmFuc2Zvcm1lci52YWx1ZSkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdyZW1haW5kZXInKSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGJpZyh2YWx1ZSkubW9kKHJlc29sdmUodHJhbnNmb3JtZXIudmFsdWUpKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZWYucmVmID09PSAnYnJhbmNoJykge1xyXG4gICAgICAgICAgICAgICAgaWYocmVzb2x2ZSh0cmFuc2Zvcm1lci5wcmVkaWNhdGUpKXtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHRyYW5zZm9ybVZhbHVlKHZhbHVlLCB0cmFuc2Zvcm1lci50aGVuKVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHRyYW5zZm9ybVZhbHVlKHZhbHVlLCB0cmFuc2Zvcm1lci5lbHNlKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZWYucmVmID09PSAnam9pbicpIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuY29uY2F0KHJlc29sdmUodHJhbnNmb3JtZXIudmFsdWUpKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZWYucmVmID09PSAndG9VcHBlckNhc2UnKSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvVXBwZXJDYXNlKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3RvTG93ZXJDYXNlJykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b0xvd2VyQ2FzZSgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlZi5yZWYgPT09ICd0b1RleHQnKSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcGlwZShyZWYpIHtcclxuICAgICAgICBjb25zdCBkZWYgPSBkZWZpbml0aW9uW3JlZi5yZWZdW3JlZi5pZF1cclxuICAgICAgICByZXR1cm4gdHJhbnNmb3JtVmFsdWUocmVzb2x2ZShkZWYudmFsdWUpLCBkZWYudHJhbnNmb3JtYXRpb25zKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGJveE5vZGUocmVmKSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IGRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXVxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSB7XHJcbiAgICAgICAgICAgIHN0eWxlOiBmcm96ZW4gJiYgc2VsZWN0ZWROb2RlSW5EZXZlbG9wbWVudC5pZCA9PT0gcmVmLmlkID8gey4uLnJlc29sdmUobm9kZS5zdHlsZSksIHRyYW5zaXRpb246J291dGxpbmUgMC4xcycsb3V0bGluZTogJzNweCBzb2xpZCAjMzU5MGRmJ30gOiByZXNvbHZlKG5vZGUuc3R5bGUpLFxyXG4gICAgICAgICAgICBvbjogZnJvemVuID9cclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZW92ZXI6IHNlbGVjdEhvdmVyQWN0aXZlID8gW3NlbGVjdE5vZGVIb3ZlciwgcmVmXTogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBbc2VsZWN0Tm9kZUNsaWNrLCByZWZdXHJcbiAgICAgICAgICAgICAgICB9OntcclxuICAgICAgICAgICAgICAgICAgICBjbGljazogbm9kZS5jbGljayA/IFtlbWl0RXZlbnQsIG5vZGUuY2xpY2tdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGRibGNsaWNrOiBub2RlLmRibGNsaWNrID8gW2VtaXRFdmVudCwgbm9kZS5kYmxjbGlja10gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VvdmVyOiBub2RlLm1vdXNlb3ZlciA/IFtlbWl0RXZlbnQsIG5vZGUubW91c2VvdmVyXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZW91dDogbm9kZS5tb3VzZW91dCA/IFtlbWl0RXZlbnQsIG5vZGUubW91c2VvdXRdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGgoJ2RpdicsIGRhdGEsIGZsYXR0ZW4obm9kZS5jaGlsZHJlbi5tYXAocmVzb2x2ZSkpKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGlmTm9kZShyZWYpIHtcclxuICAgICAgICBjb25zdCBub2RlID0gZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdXHJcbiAgICAgICAgcmV0dXJuIHJlc29sdmUobm9kZS52YWx1ZSkgPyBub2RlLmNoaWxkcmVuLm1hcChyZXNvbHZlKTogW11cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB0ZXh0Tm9kZShyZWYpIHtcclxuICAgICAgICBjb25zdCBub2RlID0gZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdXHJcbiAgICAgICAgY29uc3QgZGF0YSA9IHtcclxuICAgICAgICAgICAgc3R5bGU6IGZyb3plbiAmJiBzZWxlY3RlZE5vZGVJbkRldmVsb3BtZW50LmlkID09PSByZWYuaWQgPyB7Li4ucmVzb2x2ZShub2RlLnN0eWxlKSwgdHJhbnNpdGlvbjonb3V0bGluZSAwLjFzJyxvdXRsaW5lOiAnM3B4IHNvbGlkICMzNTkwZGYnfSA6IHJlc29sdmUobm9kZS5zdHlsZSksXHJcbiAgICAgICAgICAgIG9uOiBmcm96ZW4gP1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlb3Zlcjogc2VsZWN0SG92ZXJBY3RpdmUgPyBbc2VsZWN0Tm9kZUhvdmVyLCByZWZdOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xpY2s6IFtzZWxlY3ROb2RlQ2xpY2ssIHJlZl1cclxuICAgICAgICAgICAgICAgIH06e1xyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBub2RlLmNsaWNrID8gW2VtaXRFdmVudCwgbm9kZS5jbGlja10gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgZGJsY2xpY2s6IG5vZGUuZGJsY2xpY2sgPyBbZW1pdEV2ZW50LCBub2RlLmRibGNsaWNrXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZW92ZXI6IG5vZGUubW91c2VvdmVyID8gW2VtaXRFdmVudCwgbm9kZS5tb3VzZW92ZXJdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlb3V0OiBub2RlLm1vdXNlb3V0ID8gW2VtaXRFdmVudCwgbm9kZS5tb3VzZW91dF0gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaCgnc3BhbicsIGRhdGEsIHJlc29sdmUobm9kZS52YWx1ZSkpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5wdXROb2RlKHJlZikge1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBkZWZpbml0aW9uW3JlZi5yZWZdW3JlZi5pZF1cclxuICAgICAgICBjb25zdCBkYXRhID0ge1xyXG4gICAgICAgICAgICBzdHlsZTogZnJvemVuICYmIHNlbGVjdGVkTm9kZUluRGV2ZWxvcG1lbnQuaWQgPT09IHJlZi5pZCA/IHsuLi5yZXNvbHZlKG5vZGUuc3R5bGUpLCB0cmFuc2l0aW9uOidvdXRsaW5lIDAuMXMnLG91dGxpbmU6ICczcHggc29saWQgIzM1OTBkZid9IDogcmVzb2x2ZShub2RlLnN0eWxlKSxcclxuICAgICAgICAgICAgb246IGZyb3plbiA/XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VvdmVyOiBzZWxlY3RIb3ZlckFjdGl2ZSA/IFtzZWxlY3ROb2RlSG92ZXIsIHJlZl06IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBjbGljazogW3NlbGVjdE5vZGVDbGljaywgcmVmXVxyXG4gICAgICAgICAgICAgICAgfTp7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xpY2s6IG5vZGUuY2xpY2sgPyBbZW1pdEV2ZW50LCBub2RlLmNsaWNrXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBpbnB1dDogbm9kZS5pbnB1dCA/IFtlbWl0RXZlbnQsIG5vZGUuaW5wdXRdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGRibGNsaWNrOiBub2RlLmRibGNsaWNrID8gW2VtaXRFdmVudCwgbm9kZS5kYmxjbGlja10gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VvdmVyOiBub2RlLm1vdXNlb3ZlciA/IFtlbWl0RXZlbnQsIG5vZGUubW91c2VvdmVyXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZW91dDogbm9kZS5tb3VzZW91dCA/IFtlbWl0RXZlbnQsIG5vZGUubW91c2VvdXRdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGZvY3VzOiBub2RlLmZvY3VzID8gW2VtaXRFdmVudCwgbm9kZS5mb2N1c10gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgYmx1cjogbm9kZS5ibHVyID8gW2VtaXRFdmVudCwgbm9kZS5ibHVyXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogcmVzb2x2ZShub2RlLnZhbHVlKSxcclxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiBub2RlLnBsYWNlaG9sZGVyXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGgoJ2lucHV0JywgZGF0YSlcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBsaXN0Tm9kZShyZWYpIHtcclxuICAgICAgICBjb25zdCBub2RlID0gZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdXHJcbiAgICAgICAgY29uc3QgbGlzdCA9IHJlc29sdmUobm9kZS52YWx1ZSlcclxuXHJcbiAgICAgICAgY29uc3QgY2hpbGRyZW4gPSBPYmplY3Qua2V5cyhsaXN0KS5tYXAoa2V5PT5saXN0W2tleV0pLm1hcCgodmFsdWUsIGluZGV4KT0+IHtcclxuICAgICAgICAgICAgY3VycmVudE1hcFZhbHVlW3JlZi5pZF0gPSB2YWx1ZVxyXG4gICAgICAgICAgICBjdXJyZW50TWFwSW5kZXhbcmVmLmlkXSA9IGluZGV4XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbm9kZS5jaGlsZHJlbi5tYXAocmVzb2x2ZSlcclxuICAgICAgICB9KVxyXG4gICAgICAgIGRlbGV0ZSBjdXJyZW50TWFwVmFsdWVbcmVmLmlkXTtcclxuICAgICAgICBkZWxldGUgY3VycmVudE1hcEluZGV4W3JlZi5pZF07XHJcblxyXG4gICAgICAgIHJldHVybiBjaGlsZHJlblxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGxpc3RlbmVycyA9IFtdXHJcblxyXG4gICAgZnVuY3Rpb24gYWRkTGlzdGVuZXIoY2FsbGJhY2spIHtcclxuICAgICAgICBjb25zdCBsZW5ndGggPSBsaXN0ZW5lcnMucHVzaChjYWxsYmFjaylcclxuXHJcbiAgICAgICAgLy8gZm9yIHVuc3Vic2NyaWJpbmdcclxuICAgICAgICByZXR1cm4gKCkgPT4gbGlzdGVuZXJzLnNwbGljZShsZW5ndGggLSAxLCAxKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGVtaXRFdmVudChldmVudFJlZiwgZSkge1xyXG4gICAgICAgIGNvbnN0IGV2ZW50SWQgPSBldmVudFJlZi5pZFxyXG4gICAgICAgIGNvbnN0IGV2ZW50ID0gZGVmaW5pdGlvbi5ldmVudFtldmVudElkXVxyXG4gICAgICAgIGN1cnJlbnRFdmVudCA9IGVcclxuICAgICAgICBldmVudC5kYXRhLmZvckVhY2goKHJlZik9PntcclxuICAgICAgICAgICAgaWYocmVmLmlkID09PSAnX2lucHV0Jyl7XHJcbiAgICAgICAgICAgICAgICBldmVudERhdGFbcmVmLmlkXSA9IGUudGFyZ2V0LnZhbHVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIGNvbnN0IHByZXZpb3VzU3RhdGUgPSBjdXJyZW50U3RhdGVcclxuICAgICAgICBsZXQgbXV0YXRpb25zID0ge31cclxuICAgICAgICBkZWZpbml0aW9uLmV2ZW50W2V2ZW50SWRdLm11dGF0b3JzLmZvckVhY2goKHJlZik9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG11dGF0b3IgPSBkZWZpbml0aW9uLm11dGF0b3JbcmVmLmlkXVxyXG4gICAgICAgICAgICBjb25zdCBzdGF0ZSA9IG11dGF0b3Iuc3RhdGVcclxuICAgICAgICAgICAgbXV0YXRpb25zW3N0YXRlLmlkXSA9IHJlc29sdmUobXV0YXRvci5tdXRhdGlvbilcclxuICAgICAgICB9KVxyXG4gICAgICAgIGN1cnJlbnRTdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIGN1cnJlbnRTdGF0ZSwgbXV0YXRpb25zKVxyXG4gICAgICAgIGxpc3RlbmVycy5mb3JFYWNoKGNhbGxiYWNrID0+IGNhbGxiYWNrKGV2ZW50SWQsIGV2ZW50RGF0YSwgZSwgcHJldmlvdXNTdGF0ZSwgY3VycmVudFN0YXRlLCBtdXRhdGlvbnMpKVxyXG4gICAgICAgIGN1cnJlbnRFdmVudCA9IHt9XHJcbiAgICAgICAgZXZlbnREYXRhID0ge31cclxuICAgICAgICBpZihPYmplY3Qua2V5cyhtdXRhdGlvbnMpLmxlbmd0aCl7XHJcbiAgICAgICAgICAgIHJlbmRlcigpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxldCB2ZG9tID0gcmVzb2x2ZSh7cmVmOid2Tm9kZUJveCcsIGlkOidfcm9vdE5vZGUnfSlcclxuICAgIGZ1bmN0aW9uIHJlbmRlcihuZXdEZWZpbml0aW9uKSB7XHJcbiAgICAgICAgaWYobmV3RGVmaW5pdGlvbil7XHJcbiAgICAgICAgICAgIGlmKGRlZmluaXRpb24uc3RhdGUgIT09IG5ld0RlZmluaXRpb24uc3RhdGUpe1xyXG4gICAgICAgICAgICAgICAgZGVmaW5pdGlvbiA9IG5ld0RlZmluaXRpb25cclxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1N0YXRlID0gT2JqZWN0LmtleXMoZGVmaW5pdGlvbi5zdGF0ZSkubWFwKGtleT0+ZGVmaW5pdGlvbi5zdGF0ZVtrZXldKS5yZWR1Y2UoKGFjYywgZGVmKT0+IHtcclxuICAgICAgICAgICAgICAgICAgICBhY2NbZGVmLnJlZl0gPSBkZWYuZGVmYXVsdFZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFjY1xyXG4gICAgICAgICAgICAgICAgfSwge30pXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50U3RhdGUgPSB7Li4ubmV3U3RhdGUsIC4uLmN1cnJlbnRTdGF0ZX1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGRlZmluaXRpb24gPSBuZXdEZWZpbml0aW9uXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbmV3dmRvbSA9IHJlc29sdmUoe3JlZjondk5vZGVCb3gnLCBpZDonX3Jvb3ROb2RlJ30pXHJcbiAgICAgICAgcGF0Y2godmRvbSwgbmV3dmRvbSlcclxuICAgICAgICB2ZG9tID0gbmV3dmRvbVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIF9mcmVlemUoaXNGcm96ZW4sIGNhbGxiYWNrLCBub2RlSWQpIHtcclxuICAgICAgICBmcm96ZW5DYWxsYmFjayA9IGNhbGxiYWNrXHJcbiAgICAgICAgc2VsZWN0ZWROb2RlSW5EZXZlbG9wbWVudCA9IG5vZGVJZFxyXG4gICAgICAgIGlmKGZyb3plbiA9PT0gZmFsc2UgJiYgaXNGcm96ZW4gPT09IHRydWUpe1xyXG4gICAgICAgICAgICBzZWxlY3RIb3ZlckFjdGl2ZSA9IHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoZnJvemVuIHx8IGZyb3plbiAhPT0gaXNGcm96ZW4pe1xyXG4gICAgICAgICAgICBmcm96ZW4gPSBpc0Zyb3plblxyXG4gICAgICAgICAgICByZW5kZXIoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50U3RhdGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRTdGF0ZVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNldEN1cnJlbnRTdGF0ZShuZXdTdGF0ZSkge1xyXG4gICAgICAgIGN1cnJlbnRTdGF0ZSA9IG5ld1N0YXRlXHJcbiAgICAgICAgcmVuZGVyKClcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGRlZmluaXRpb24sXHJcbiAgICAgICAgdmRvbSxcclxuICAgICAgICBnZXRDdXJyZW50U3RhdGUsXHJcbiAgICAgICAgc2V0Q3VycmVudFN0YXRlLFxyXG4gICAgICAgIHJlbmRlcixcclxuICAgICAgICBlbWl0RXZlbnQsXHJcbiAgICAgICAgYWRkTGlzdGVuZXIsXHJcbiAgICAgICAgX2ZyZWV6ZSxcclxuICAgICAgICBfcmVzb2x2ZTogcmVzb2x2ZSxcclxuICAgIH1cclxufSIsIm1vZHVsZS5leHBvcnRzPXtcclxuICAgIFwiZXZlbnREYXRhXCI6IHtcclxuICAgICAgICBcIl9pbnB1dFwiOiB7XHJcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJpbnB1dCB2YWx1ZVwiLFxyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJ0ZXh0XCJcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJ0b0xvd2VyQ2FzZVwiOiB7fSxcclxuICAgIFwidG9VcHBlckNhc2VcIjoge30sXHJcbiAgICBcImNvbmRpdGlvbmFsXCI6IHt9LFxyXG4gICAgXCJlcXVhbFwiOiB7XHJcbiAgICAgICAgXCJhNzI1MWFmMC01MGE3LTQ4MjMtODVhMC02NmNlMDlkOGEzY2NcIjoge1xyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcImVlMjQyM2U2LTViNDgtNDFhZS04Y2NmLTZhMmM3YjQ2ZDJmOFwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJub3RcIjoge30sXHJcbiAgICBcImxpc3RcIjoge30sXHJcbiAgICBcInRvVGV4dFwiOiB7XHJcbiAgICAgICAgXCI3YnM5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge31cclxuICAgIH0sXHJcbiAgICBcImxpc3RWYWx1ZVwiOiB7XHJcbiAgICAgICAgXCJwejdoZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgXCJsaXN0XCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwidk5vZGVMaXN0XCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiZmw4OWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJwcm9wZXJ0eVwiOiBcInhcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJoajl3ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgXCJsaXN0XCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwidk5vZGVMaXN0XCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiZmw4OWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJwcm9wZXJ0eVwiOiBcInlcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJoaHI4YjZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgIFwibGlzdFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInZOb2RlTGlzdFwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcImZsODlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwicHJvcGVydHlcIjogXCJjb2xvclwiXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwicGlwZVwiOiB7XHJcbiAgICAgICAgXCJmdzhqZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjogXCJDdXJyZW50IHZhbHVlOiBcIixcclxuICAgICAgICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwiam9pblwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJwOXMzZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInVtNWVkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInN0YXRlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiNDZ2ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwidG9UZXh0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIjdiczlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwidWk4amQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IFwiK1wiLFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJjOHdlZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjogXCItXCIsXHJcbiAgICAgICAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInBkcTZkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcIm51bWJlclwiLFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwic3RhdGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJhZGRcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwidzg2ZmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCI0NTJxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInN0YXRlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiNDZ2ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwic3VidHJhY3RcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwidTQzd2Q2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJldzgzZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJ3M2U5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCIzcWtpZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjogMCxcclxuICAgICAgICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwiYWRkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIndicjdkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwidG9UZXh0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIm5vb3BcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcImpvaW5cIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwiczI1OGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJ0N3ZxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjogMCxcclxuICAgICAgICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwiYWRkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcInZxOGRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwidG9UZXh0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIm5vb3BcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcImpvaW5cIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwid2Y5YWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCI4Y3E2YjZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJsaXN0VmFsdWVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJoaHI4YjZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJmOXF4ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJ0YWJsZVwiLFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwic3RhdGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJjOHE5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJxd3c5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjogXCJweFwiLFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJxZHc3YzZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjogXCJweFwiLFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCI4NDM2OWFiYS00YTRkLTQ5MzItOGE5YS04ZjljYTk0OGI2YTJcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjogXCJUaGUgbnVtYmVyIG5vdyBpcyBldmVuIPCfjolcIixcclxuICAgICAgICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW11cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiYzJmYjlhOWItMjViYi00ZThiLTgwYzAtY2Y1MWI4NTA2MDcwXCI6IHtcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwiYm9vbGVhblwiLFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwic3RhdGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJyZW1haW5kZXJcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwiMzQ3ODBkMjItZjUyMS00YzMwLTg5YTUtM2U3ZjViNWFmN2MyXCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJlcXVhbFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJhNzI1MWFmMC01MGE3LTQ4MjMtODVhMC02NmNlMDlkOGEzY2NcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIjEyMjlkNDc4LWJjMjUtNDQwMS04YTg5LTc0ZmM2Y2ZlODk5NlwiOiB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcIm51bWJlclwiLFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IDIsXHJcbiAgICAgICAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImVlMjQyM2U2LTViNDgtNDFhZS04Y2NmLTZhMmM3YjQ2ZDJmOFwiOiB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcIm51bWJlclwiLFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IDAsXHJcbiAgICAgICAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiam9pblwiOiB7XHJcbiAgICAgICAgXCJwOXMzZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcInVtNWVkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwid2Y5YWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJxd3c5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInMyNThkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwicWR3N2M2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcImFkZFwiOiB7XHJcbiAgICAgICAgXCJ3ODZmZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcImV3ODNkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwid2JyN2Q2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcImxpc3RWYWx1ZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcInB6N2hkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwidnE4ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcImxpc3RWYWx1ZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcImhqOXdkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJzdWJ0cmFjdFwiOiB7XHJcbiAgICAgICAgXCJ1NDN3ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcInczZTlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJyZW1haW5kZXJcIjoge1xyXG4gICAgICAgIFwiMzQ3ODBkMjItZjUyMS00YzMwLTg5YTUtM2U3ZjViNWFmN2MyXCI6IHtcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCIxMjI5ZDQ3OC1iYzI1LTQ0MDEtOGE4OS03NGZjNmNmZTg5OTZcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwidk5vZGVCb3hcIjoge1xyXG4gICAgICAgIFwiX3Jvb3ROb2RlXCI6IHtcclxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcImJveFwiLFxyXG4gICAgICAgICAgICBcInN0eWxlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwic3R5bGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJfcm9vdFN0eWxlXCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJjaGlsZHJlblwiOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZVRleHRcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwiMjQ3MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZVRleHRcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwiMTQ4MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZVRleHRcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwiMzQ4MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZUlmXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIjU3ODdjMTVhLTQyNmItNDFlYi04MzFkLWUzZTA3NDE1OTU4MlwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwidk5vZGVMaXN0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcImZsODlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiZ3c5ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcImJveFwiLFxyXG4gICAgICAgICAgICBcInN0eWxlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwic3R5bGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJmcTlkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcImNoaWxkcmVuXCI6IFtdXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwidk5vZGVUZXh0XCI6IHtcclxuICAgICAgICBcIjI0NzFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiOiB7XHJcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgIFwic3R5bGVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJzdHlsZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcIjg0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiZnc4amQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCIxNDgxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjVcIjoge1xyXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcInVpOGpkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwic3R5bGVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJzdHlsZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcIjk0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwiY2xpY2tcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJldmVudFwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcImQ0OHJkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiMzQ4MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCI6IHtcclxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcInRleHRcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJjOHdlZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInN0eWxlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwic3R5bGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCI3NDgxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcImNsaWNrXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwiZXZlbnRcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCIzYTU0ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImU4YWRkMWM3LThhMDEtNDE2NC04NjA0LTcyMmQ4YWI1MjlmMVwiOiB7XHJcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgIFwic3R5bGVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJzdHlsZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcIjRkY2E3M2IzLTkwZWItNDFlNy04NjUxLTJiZGNjOTNmMzg3MVwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiODQzNjlhYmEtNGE0ZC00OTMyLThhOWEtOGY5Y2E5NDhiNmEyXCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcInZOb2RlSW5wdXRcIjoge30sXHJcbiAgICBcInZOb2RlTGlzdFwiOiB7XHJcbiAgICAgICAgXCJmbDg5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjVcIjoge1xyXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwibGlzdFwiLFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcImY5cXhkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwiY2hpbGRyZW5cIjogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwidk5vZGVCb3hcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwiZ3c5ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcInZOb2RlSWZcIjoge1xyXG4gICAgICAgIFwiNTc4N2MxNWEtNDI2Yi00MWViLTgzMWQtZTNlMDc0MTU5NTgyXCI6IHtcclxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcImlmXCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiYzJmYjlhOWItMjViYi00ZThiLTgwYzAtY2Y1MWI4NTA2MDcwXCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJjaGlsZHJlblwiOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJ2Tm9kZVRleHRcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwiZThhZGQxYzctOGEwMS00MTY0LTg2MDQtNzIyZDhhYjUyOWYxXCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcInN0eWxlXCI6IHtcclxuICAgICAgICBcIl9yb290U3R5bGVcIjoge1xyXG4gICAgICAgICAgICBcImZvbnRGYW1pbHlcIjogXCInQ29tZm9ydGFhJywgY3Vyc2l2ZVwiLFxyXG4gICAgICAgICAgICBcImJhY2tncm91bmRcIjogXCIjZjVmNWY1XCIsXHJcbiAgICAgICAgICAgIFwibWluSGVpZ2h0XCI6IFwiMTAwJVwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIjg0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwicGFkZGluZ1wiOiBcIjEwcHhcIixcclxuICAgICAgICAgICAgXCJtYXJnaW5cIjogXCIxMHB4IDVweFwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIjk0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwicGFkZGluZ1wiOiBcIjEwcHggMTVweFwiLFxyXG4gICAgICAgICAgICBcImJhY2tncm91bmRcIjogXCIjYWFhYWFhXCIsXHJcbiAgICAgICAgICAgIFwiZGlzcGxheVwiOiBcImlubGluZS1ibG9ja1wiLFxyXG4gICAgICAgICAgICBcIm1hcmdpbkxlZnRcIjogXCI1cHhcIixcclxuICAgICAgICAgICAgXCJib3JkZXJSYWRpdXNcIjogXCIzcHhcIixcclxuICAgICAgICAgICAgXCJjdXJzb3JcIjogXCJwb2ludGVyXCIsXHJcbiAgICAgICAgICAgIFwidXNlclNlbGVjdFwiOiBcIm5vbmVcIixcclxuICAgICAgICAgICAgXCJtYXJnaW5cIjogXCIxMHB4IDVweFwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIjc0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwicGFkZGluZ1wiOiBcIjEwcHggMTVweFwiLFxyXG4gICAgICAgICAgICBcImJhY2tncm91bmRcIjogXCIjOTk5OTk5XCIsXHJcbiAgICAgICAgICAgIFwiZGlzcGxheVwiOiBcImlubGluZS1ibG9ja1wiLFxyXG4gICAgICAgICAgICBcIm1hcmdpbkxlZnRcIjogXCI1cHhcIixcclxuICAgICAgICAgICAgXCJib3JkZXJSYWRpdXNcIjogXCIzcHhcIixcclxuICAgICAgICAgICAgXCJjdXJzb3JcIjogXCJwb2ludGVyXCIsXHJcbiAgICAgICAgICAgIFwibWFyZ2luXCI6IFwiMTBweCA1cHhcIixcclxuICAgICAgICAgICAgXCJ1c2VyU2VsZWN0XCI6IFwibm9uZVwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIjgwOTJhYzVlLWRmZDAtNDQ5Mi1hNjVkLThhYzNlZWMzMjVlMFwiOiB7XHJcbiAgICAgICAgICAgIFwicGFkZGluZ1wiOiBcIjEwcHggMTBweCAxMHB4IDBcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJhOTQ2MWUyOC03ZDkyLTQ5YTAtOTAwMS0yM2Q3NGU0YjM4MmRcIjoge1xyXG4gICAgICAgICAgICBcInBhZGRpbmdcIjogXCIxMHB4IDEwcHggMTBweCAwXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiNzY2YjExZWMtZGEyNy00OTRjLWIyNzItYzI2ZmVjM2Y2NDc1XCI6IHtcclxuICAgICAgICAgICAgXCJwYWRkaW5nXCI6IFwiMTBweFwiLFxyXG4gICAgICAgICAgICBcImZsb2F0XCI6IFwicmlnaHRcIixcclxuICAgICAgICAgICAgXCJwYWRkaW5nUmlnaHRcIjogXCI1MHB4XCIsXHJcbiAgICAgICAgICAgIFwidGV4dEFsaWduXCI6IFwicmlnaHRcIixcclxuICAgICAgICAgICAgXCJtYXhXaWR0aFwiOiBcIjUwMHB4XCIsXHJcbiAgICAgICAgICAgIFwibGluZS1oZWlnaHRcIjogXCIxLjVcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJjYmNkOGVkYi00YWEyLTQzZmUtYWQzOS1jZWU3OWI0OTAyOTVcIjoge1xyXG4gICAgICAgICAgICBcInBhZGRpbmdcIjogXCIxMHB4XCIsXHJcbiAgICAgICAgICAgIFwiZGlzcGxheVwiOiBcImJsb2NrXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiNjc2M2YxMDItMjNmNy00MzkwLWI0NjMtNGUxYjE0ZTg2NmM5XCI6IHtcclxuICAgICAgICAgICAgXCJwYWRkaW5nXCI6IFwiMTBweFwiLFxyXG4gICAgICAgICAgICBcImRpc3BsYXlcIjogXCJibG9ja1wiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIjkxYzlhZGYwLWQ2MmUtNDU4MC05M2U3LWYzOTU5NGFlNWU3ZFwiOiB7XHJcbiAgICAgICAgICAgIFwicGFkZGluZ1wiOiBcIjEwcHhcIixcclxuICAgICAgICAgICAgXCJkaXNwbGF5XCI6IFwiYmxvY2tcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJlOWZiZWIzOS03MTkzLTQ1MjItOTFiMy03NjFiZDM1NjM5ZDNcIjoge1xyXG4gICAgICAgICAgICBcInBhZGRpbmdcIjogXCIxMHB4XCIsXHJcbiAgICAgICAgICAgIFwiZGlzcGxheVwiOiBcImJsb2NrXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiM2NmNWQ4OWQtMzcwMy00ODNlLWFiNjQtNWE1Yjc4MGFlYzI3XCI6IHtcclxuICAgICAgICAgICAgXCJwYWRkaW5nXCI6IFwiMTBweFwiLFxyXG4gICAgICAgICAgICBcImRpc3BsYXlcIjogXCJibG9ja1wiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImZxOWRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwicGFkZGluZ1wiOiBcIjEwcHhcIixcclxuICAgICAgICAgICAgXCJ3aWR0aFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCIzcWtpZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcImhlaWdodFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJ0N3ZxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcImJhY2tncm91bmRcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiOGNxNmI2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCI0ZGNhNzNiMy05MGViLTQxZTctODY1MS0yYmRjYzkzZjM4NzFcIjoge1xyXG4gICAgICAgICAgICBcInBhZGRpbmdcIjogXCIxMHB4XCJcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJuYW1lU3BhY2VcIjoge1xyXG4gICAgICAgIFwiX3Jvb3ROYW1lU3BhY2VcIjoge1xyXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwic3RhdGVcIixcclxuICAgICAgICAgICAgXCJjaGlsZHJlblwiOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJzdGF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcInN0YXRlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcImM4cTlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJzdGF0ZVwiOiB7XHJcbiAgICAgICAgXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwiY291bnRcIixcclxuICAgICAgICAgICAgXCJyZWZcIjogXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIixcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgICAgIFwiZGVmYXVsdFZhbHVlXCI6IDAsXHJcbiAgICAgICAgICAgIFwibXV0YXRvcnNcIjogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwibXV0YXRvclwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJhczU1ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcIm11dGF0b3JcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwiOWRxOGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJjOHE5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwidGlsZXNcIixcclxuICAgICAgICAgICAgXCJyZWZcIjogXCJjOHE5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIixcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwidGFibGVcIixcclxuICAgICAgICAgICAgXCJkZWZpbml0aW9uXCI6IHtcclxuICAgICAgICAgICAgICAgIFwieFwiOiBcIm51bWJlclwiLFxyXG4gICAgICAgICAgICAgICAgXCJ5XCI6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgICAgICAgICBcImNvbG9yXCI6IFwidGV4dFwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwiZGVmYXVsdFZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwib3BzNmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInhcIjogMTIwLFxyXG4gICAgICAgICAgICAgICAgICAgIFwieVwiOiAxMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb2xvclwiOiBcIiNlYWI2NWNcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwid3B2NWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInhcIjogMjAwLFxyXG4gICAgICAgICAgICAgICAgICAgIFwieVwiOiAxMjAsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb2xvclwiOiBcIiM1M0IyRURcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwicW4yN2Q2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInhcIjogMTMwLFxyXG4gICAgICAgICAgICAgICAgICAgIFwieVwiOiAyMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb2xvclwiOiBcIiM1YmNjNWJcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwiY2E5cmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInhcIjogMTUwLFxyXG4gICAgICAgICAgICAgICAgICAgIFwieVwiOiAxNTAsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb2xvclwiOiBcIiM0ZDRkNGRcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIm11dGF0b3JzXCI6IFtdXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwibXV0YXRvclwiOiB7XHJcbiAgICAgICAgXCJhczU1ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcImV2ZW50XCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwiZXZlbnRcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJkNDhyZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInN0YXRlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwic3RhdGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIm11dGF0aW9uXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcInBkcTZkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiOWRxOGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJldmVudFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcImV2ZW50XCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiM2E1NGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJzdGF0ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInN0YXRlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiNDZ2ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJtdXRhdGlvblwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCI0NTJxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiZXZlbnRcIjoge1xyXG4gICAgICAgIFwiZDQ4cmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwiY2xpY2tcIixcclxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcImluY3JlbWVudFwiLFxyXG4gICAgICAgICAgICBcIm11dGF0b3JzXCI6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcIm11dGF0b3JcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwiYXM1NWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgXCJlbWl0dGVyXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwidk5vZGVUZXh0XCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiMTQ4MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJkYXRhXCI6IFtdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIjNhNTRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcImNsaWNrXCIsXHJcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJkZWNyZW1lbnRcIixcclxuICAgICAgICAgICAgXCJtdXRhdG9yc1wiOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJtdXRhdG9yXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIjlkcThkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIFwiZW1pdHRlclwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInZOb2RlVGV4dFwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcIjM0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==
