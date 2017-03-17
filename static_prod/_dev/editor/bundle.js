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

    //app.vdom.elm.parentNode

    var app = (0, _ugnis2.default)(appDefinition);

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
        selectedViewNode: {},
        selectedEventId: '',
        selectedPipeId: '',
        selectedStateNodeId: '',
        selectedViewSubMenu: 'props',
        editingTitleNodeId: '',
        activeEvent: '',
        viewFoldersClosed: {},
        definition: app.definition
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
            attrs: {},
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
            attrs: {},
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
            attrs: {},
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
                if (currentState.type === 'number') return (0, _h2.default)('span', { style: { position: 'relative' } }, [(0, _h2.default)('input', { attrs: { type: 'number' }, liveProps: { value: app.getCurrentState()[stateId] }, style: _extends({}, noStyleInput, { width: 9 * app.getCurrentState()[stateId].toString().length + 'px' }), on: { input: [CHANGE_CURRENT_STATE_NUMBER_VALUE, stateId] } }), (0, _h2.default)('svg', {
                    attrs: { width: 6, height: 8 },
                    style: { cursor: 'pointer', position: 'absolute', top: '0', right: '-12px', padding: '1px 2px 3px 2px', transform: 'rotate(-90deg)' },
                    on: {
                        click: [INCREMENT_CURRENT_STATE_NUMBER_VALUE, stateId]
                    }
                }, [(0, _h2.default)('polygon', { attrs: { points: '6,4 0,0 2,4 0,8', fill: 'white' } })]), (0, _h2.default)('svg', {
                    attrs: { width: 6, height: 8 },
                    style: { cursor: 'pointer', position: 'absolute', bottom: '0', right: '-12px', padding: '3px 2px 1px 2px', transform: 'rotate(90deg)' },
                    on: {
                        click: [DECREMENT_CURRENT_STATE_NUMBER_VALUE, stateId]
                    }
                }, [(0, _h2.default)('polygon', { attrs: { points: '6,4 0,0 2,4 0,8', fill: 'white' } })])]);
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

        var stateComponent = (0, _h2.default)('div', { style: { overflow: 'auto', flex: '1', padding: '6px 15px' }, on: { click: [UNSELECT_STATE_NODE] } }, [listNameSpace('_rootNameSpace')]);

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
            }, [(0, _h2.default)('div', { style: { display: 'flex', alignItems: 'center' } }, [(0, _h2.default)('svg', {
                attrs: { width: 12, height: 16 },
                style: { cursor: 'pointer', padding: '0 5px', transform: closed ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'all 0.2s', marginLeft: '-3px' },
                on: {
                    click: [VIEW_FOLDER_CLICKED, nodeId]
                }
            }, [(0, _h2.default)('polygon', { attrs: { points: '12,8 0,1 3,8 0,15' }, style: { fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white', transition: 'fill 0.2s' } })]), (0, _h2.default)('svg', {
                attrs: { width: 14, height: 14 },
                style: { cursor: 'pointer', padding: '0 5px 0 0' },
                on: { click: [VIEW_NODE_SELECTED, nodeRef] }
            }, nodeRef.ref === 'vNodeBox' ? [(0, _h2.default)('rect', { attrs: { x: 1, y: 1, width: 12, height: 12, fill: 'none', transition: 'all 0.2s', stroke: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white', 'stroke-width': '2' } })] : nodeRef.ref === 'vNodeList' ? [(0, _h2.default)('circle', { attrs: { r: 2, cx: 2, cy: 2, transition: 'all 0.2s', fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white' } }), (0, _h2.default)('rect', { attrs: { x: 6, y: 1, width: 10, transition: 'all 0.2s', height: 2, fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white' } }), (0, _h2.default)('circle', { attrs: { r: 2, cx: 2, cy: 7, transition: 'all 0.2s', fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white' } }), (0, _h2.default)('rect', { attrs: { x: 6, y: 6, width: 10, transition: 'all 0.2s', height: 2, fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white' } }), (0, _h2.default)('circle', { attrs: { r: 2, cx: 2, cy: 12, transition: 'all 0.2s', fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white' } }), (0, _h2.default)('rect', { attrs: { x: 6, y: 11, width: 10, transition: 'all 0.2s', height: 2, fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white' } })] : [(0, _h2.default)('text', { attrs: { x: 2, y: 14, fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white' } }, 'if')]), state.editingTitleNodeId === nodeId ? editingNode() : (0, _h2.default)('span', { style: { flex: '1', cursor: 'pointer', color: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white', transition: 'color 0.2s' }, on: { click: [VIEW_NODE_SELECTED, nodeRef], dblclick: [EDIT_VIEW_NODE_TITLE, nodeId] } }, node.title)]), (0, _h2.default)('div', { style: { display: closed ? 'none' : 'block', marginLeft: '7px', paddingLeft: '10px', borderLeft: state.selectedViewNode.id === nodeId ? '2px solid #53B2ED' : '2px solid #bdbdbd', transition: 'border-color 0.2s' } }, [].concat(_toConsumableArray(node.children.map(function (ref, index) {
                if (ref.ref === 'vNodeText') return listTextNode(ref, nodeRef, index);
                if (ref.ref === 'vNodeBox' || ref.ref === 'vNodeList' || ref.ref === 'vNodeIf') return listBoxNode(ref, nodeRef, index);
                if (ref.ref === 'vNodeInput') return listInputNode(ref, nodeRef, index);
            })), [(0, _h2.default)('span', { style: { display: state.selectedViewNode.id === nodeId ? 'inline-block' : 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #53B2ED', padding: '5px', margin: '5px' }, on: { click: [ADD_NODE, nodeRef, 'box'] } }, '+ box'), (0, _h2.default)('span', { style: { display: state.selectedViewNode.id === nodeId ? 'inline-block' : 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #53B2ED', padding: '5px', margin: '5px' }, on: { click: [ADD_NODE, nodeRef, 'text'] } }, '+ text'), (0, _h2.default)('span', { style: { display: state.selectedViewNode.id === nodeId ? 'inline-block' : 'none', cursor: 'pointer', borderRadius: '5px', border: '3px solid #53B2ED', padding: '5px', margin: '5px' }, on: { click: [ADD_NODE, nodeRef, 'input'] } }, '+ input')])), position > 0 ? (0, _h2.default)('svg', {
                attrs: { width: 6, height: 8 },
                style: { display: state.selectedViewNode.id === nodeId ? 'block' : 'none', cursor: 'pointer', position: 'absolute', top: '0', right: '25px', padding: '1px 2px 3px 2px', transform: 'rotate(-90deg)' },
                on: {
                    click: [MOVE_VIEW_NODE, parentRef, position, -1]
                }
            }, [(0, _h2.default)('polygon', { attrs: { points: '6,4 0,0 2,4 0,8', fill: 'white' } })]) : (0, _h2.default)('span'), parentId && position < state.definition[parentRef.ref][parentId].children.length - 1 ? (0, _h2.default)('svg', {
                attrs: { width: 6, height: 8 },
                style: { display: state.selectedViewNode.id === nodeId ? 'block' : 'none', cursor: 'pointer', position: 'absolute', bottom: '0', right: '25px', padding: '3px 2px 1px 2px', transform: 'rotate(90deg)' },
                on: {
                    click: [MOVE_VIEW_NODE, parentRef, position, 1]
                }
            }, [(0, _h2.default)('polygon', { attrs: { points: '6,4 0,0 2,4 0,8', fill: 'white' } })]) : (0, _h2.default)('span'), (0, _h2.default)('div', { style: { cursor: 'pointer', display: state.selectedViewNode.id === nodeId ? 'block' : 'none', position: 'absolute', right: '5px', top: '0' }, on: { click: [DELETE_SELECTED_VIEW, nodeRef, parentRef] } }, 'x')]);
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
            }, [(0, _h2.default)('path', { attrs: { d: 'M 0 0 L 0 85.8125 L 27.03125 85.8125 C 36.617786 44.346316 67.876579 42.179793 106.90625 42.59375 L 106.90625 228.375 C 107.31101 279.09641 98.908386 277.33602 62.125 277.5 L 62.125 299.5625 L 149 299.5625 L 150.03125 299.5625 L 236.90625 299.5625 L 236.90625 277.5 C 200.12286 277.336 191.72024 279.09639 192.125 228.375 L 192.125 42.59375 C 231.15467 42.17975 262.41346 44.346304 272 85.8125 L 299.03125 85.8125 L 299.03125 0 L 150.03125 0 L 149 0 L 0 0 z', fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white' } })]), state.editingTitleNodeId === nodeId ? editingNode() : (0, _h2.default)('span', { style: { color: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white', transition: 'color 0.2s' } }, node.title), position > 0 ? (0, _h2.default)('svg', {
                attrs: { width: 6, height: 8 },
                style: { display: state.selectedViewNode.id === nodeId ? 'block' : 'none', cursor: 'pointer', position: 'absolute', top: '0', right: '25px', padding: '1px 2px 3px 2px', transform: 'rotate(-90deg)' },
                on: {
                    click: [MOVE_VIEW_NODE, parentRef, position, -1]
                }
            }, [(0, _h2.default)('polygon', { attrs: { points: '6,4 0,0 2,4 0,8', fill: 'white' } })]) : (0, _h2.default)('span'), position < state.definition[parentRef.ref][parentId].children.length - 1 ? (0, _h2.default)('svg', {
                attrs: { width: 6, height: 8 },
                style: { display: state.selectedViewNode.id === nodeId ? 'block' : 'none', cursor: 'pointer', position: 'absolute', bottom: '0', right: '25px', padding: '3px 2px 1px 2px', transform: 'rotate(90deg)' },
                on: {
                    click: [MOVE_VIEW_NODE, parentRef, position, 1]
                }
            }, [(0, _h2.default)('polygon', { attrs: { points: '6,4 0,0 2,4 0,8', fill: 'white' } })]) : (0, _h2.default)('span'), (0, _h2.default)('div', { style: { display: state.selectedViewNode.id === nodeId ? 'block' : 'none', position: 'absolute', right: '5px', top: '0' }, on: { click: [DELETE_SELECTED_VIEW, nodeRef, parentRef] } }, 'x')]);
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
            }, [(0, _h2.default)('path', { attrs: { d: 'M 15,2 11,2 C 10.447,2 10,1.552 10,1 10,0.448 10.447,0 11,0 l 4,0 c 0.553,0 1,0.448 1,1 0,0.552 -0.447,1 -1,1 z m -2,14 c -0.553,0 -1,-0.447 -1,-1 L 12,1 c 0,-0.552 0.447,-1 1,-1 0.553,0 1,0.448 1,1 l 0,14 c 0,0.553 -0.447,1 -1,1 z m 2,0 -4,0 c -0.553,0 -1,-0.447 -1,-1 0,-0.553 0.447,-1 1,-1 l 4,0 c 0.553,0 1,0.447 1,1 0,0.553 -0.447,1 -1,1 z', fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white' } }), (0, _h2.default)('path', { attrs: { d: 'M 9.8114827,4.2360393 C 9.6547357,4.5865906 9.3039933,4.8295854 8.8957233,4.8288684 L 1.2968926,4.8115404 1.3169436,2.806447 8.9006377,2.828642 c 0.552448,0.00165 0.9993074,0.4501223 0.9976564,1.0025698 -2.1e-5,0.1445856 -0.0313,0.2806734 -0.08681,0.404827 z', fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white' } }), (0, _h2.default)('path', { attrs: { d: 'm 9.8114827,11.738562 c -0.156747,0.350551 -0.5074894,0.593546 -0.9157594,0.592829 l -7.5988307,-0.01733 0.020051,-2.005093 7.5836941,0.02219 c 0.552448,0.0016 0.9993074,0.450122 0.9976564,1.00257 -2.1e-5,0.144585 -0.0313,0.280673 -0.08681,0.404827 z', fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white' } }), (0, _h2.default)('path', { attrs: { d: 'm 1.2940583,12.239836 0.01704,-9.4450947 1.9714852,0.024923 -0.021818,9.4262797 z', fill: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white' } })]), state.editingTitleNodeId === nodeId ? editingNode() : (0, _h2.default)('span', { style: { color: state.selectedViewNode.id === nodeId ? '#53B2ED' : 'white', transition: 'color 0.2s' } }, node.title), position > 0 ? (0, _h2.default)('svg', {
                attrs: { width: 6, height: 8 },
                style: { display: state.selectedViewNode.id === nodeId ? 'block' : 'none', cursor: 'pointer', position: 'absolute', top: '0', right: '25px', padding: '1px 2px 3px 2px', transform: 'rotate(-90deg)' },
                on: {
                    click: [MOVE_VIEW_NODE, parentRef, position, -1]
                }
            }, [(0, _h2.default)('polygon', { attrs: { points: '6,4 0,0 2,4 0,8', fill: 'white' } })]) : (0, _h2.default)('span'), position < state.definition[parentRef.ref][parentId].children.length - 1 ? (0, _h2.default)('svg', {
                attrs: { width: 6, height: 8 },
                style: { display: state.selectedViewNode.id === nodeId ? 'block' : 'none', cursor: 'pointer', position: 'absolute', bottom: '0', right: '25px', padding: '3px 2px 1px 2px', transform: 'rotate(90deg)' },
                on: {
                    click: [MOVE_VIEW_NODE, parentRef, position, 1]
                }
            }, [(0, _h2.default)('polygon', { attrs: { points: '6,4 0,0 2,4 0,8', fill: 'white' } })]) : (0, _h2.default)('span'), (0, _h2.default)('div', { style: { display: state.selectedViewNode.id === nodeId ? 'block' : 'none', position: 'absolute', right: '5px', top: '0' }, on: { click: [DELETE_SELECTED_VIEW, nodeRef, parentRef] } }, 'x')]);
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
            var selectedStyle = state.definition.style[selectedNode.style.id];
            var styleEditorComponent = (0, _h2.default)('div', { style: {} }, Object.keys(selectedStyle).map(function (key) {
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
                    on: { input: [CHANGE_STYLE, selectedNode.style.id, key] } }), (0, _h2.default)('span', key)]);
            }));
            var addStyleComponent = (0, _h2.default)('div', { style: {} }, styles.filter(function (key) {
                return !Object.keys(selectedStyle).includes(key);
            }).map(function (key) {
                return (0, _h2.default)('div', { on: { click: [ADD_DEFAULT_STYLE, selectedNode.style.id, key] }, style: { display: 'inline-block', cursor: 'pointer', borderRadius: '5px', border: '3px solid white', padding: '5px', margin: '5px' } }, '+ ' + key);
            }));
            function generatePropsMenu() {
                if (state.selectedViewNode.ref === 'vNodeBox') {
                    return (0, _h2.default)('div', { style: { textAlign: 'center', marginTop: '100px', color: '#bdbdbd' } }, 'Component has no props');
                }
                if (state.selectedViewNode.ref === 'vNodeText') {
                    return (0, _h2.default)('div', { style: { paddingTop: '20px' } }, [(0, _h2.default)('div', { style: { display: 'flex', alignItems: 'center', background: '#676767', padding: '5px 10px', marginBottom: '10px' } }, [(0, _h2.default)('span', { style: { flex: '1' } }, 'text value'), (0, _h2.default)('div', { style: { flex: '0', cursor: 'default', color: '#bdbdbd' } }, 'text')]), (0, _h2.default)('div', { style: { padding: '5px 10px' } }, [emberEditor(selectedNode.value, 'text')])]);
                }
                if (state.selectedViewNode.ref === 'vNodeInput') {
                    return (0, _h2.default)('div', { style: { paddingTop: '20px' } }, [(0, _h2.default)('div', { style: { display: 'flex', alignItems: 'center', background: '#676767', padding: '5px 10px', marginBottom: '10px' } }, [(0, _h2.default)('span', { style: { flex: '1' } }, 'input value'), (0, _h2.default)('div', { style: { flex: '0', cursor: 'default', color: '#bdbdbd' } }, 'text')]), (0, _h2.default)('div', { style: { padding: '5px 10px' } }, [emberEditor(selectedNode.value, 'text')])]);
                }
                if (state.selectedViewNode.ref === 'vNodeList') {
                    return (0, _h2.default)('div', { style: { textAlign: 'center', marginTop: '100px', color: '#bdbdbd' } }, 'TODO ADD PROPS');
                }
                if (state.selectedViewNode.ref === 'vNodeIf') {
                    return (0, _h2.default)('div', { style: { textAlign: 'center', marginTop: '100px', color: '#bdbdbd' } }, 'TODO ADD PROPS');
                }
            }
            var propsSubmenuComponent = (0, _h2.default)('div', [generatePropsMenu()]);
            var styleSubmenuComponent = (0, _h2.default)('div', [styleEditorComponent, addStyleComponent]);
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
            var eventsSubmenuComponent = (0, _h2.default)('div', { style: { paddingTop: '20px' } }, eventsLeft.map(function (event) {
                return (0, _h2.default)('div', { style: { display: 'inline-block', border: '3px solid #5bcc5b', borderRadius: '5px', cursor: 'pointer', padding: '5px', margin: '10px' }, on: { click: [ADD_EVENT, event.propertyName] } }, '+ ' + event.description);
            }).concat(currentEvents.length ? currentEvents.map(function (event) {
                return (0, _h2.default)('div', [(0, _h2.default)('div', { style: { background: '#676767', padding: '5px 10px' } }, event.description), (0, _h2.default)('div', {
                    style: { color: state.activeEvent === selectedNode[event.propertyName].id ? '#5bcc5b' : 'white', transition: 'color 0.2s', fontSize: '0.8em', cursor: 'pointer', padding: '5px 10px', boxShadow: state.selectedEventId === selectedNode[event.propertyName].id ? '#5bcc5b 5px 0 0px 0px inset' : 'none' },
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
            }, [(0, _h2.default)('div', { style: { flex: '1', maxHeight: '43px', minHeight: '43px', position: 'relative', marginTop: '6px' } }, [eventsComponent, styleComponent, propsComponent, unselectComponent]), (0, _h2.default)('div', { style: { flex: '1', overflow: 'auto', background: '#4d4d4d', borderRadius: '10px', width: state.subEditorWidth + 'px', border: '3px solid #222' } }, [dragSubComponent, state.selectedViewSubMenu === 'props' ? propsSubmenuComponent : state.selectedViewSubMenu === 'style' ? styleSubmenuComponent : state.selectedViewSubMenu === 'events' ? eventsSubmenuComponent : (0, _h2.default)('span', 'Error, no such menu')])]);
        }

        var viewComponent = (0, _h2.default)('div', { style: { overflow: 'auto', position: 'relative', flex: '1', borderTop: '3px solid #222', padding: '6px 8px' }, on: { click: [UNSELECT_VIEW_NODE] } }, [listBoxNode({ ref: 'vNodeBox', id: '_rootNode' }, {})]);

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
        }, [dragComponentRight, stateComponent, viewComponent, state.selectedViewNode.ref ? generateEditNodeComponent() : (0, _h2.default)('span')]);

        var topComponent = (0, _h2.default)('div', {
            style: {
                flex: '1 auto',
                height: '75px',
                maxHeight: '75px',
                minHeight: '75px',
                background: '#222',
                display: 'flex'
            }
        }, [(0, _h2.default)('a', { style: { flex: '0 auto', width: '190px', textDecoration: 'inherit', userSelect: 'none' }, attrs: { href: '/_dev' } }, [(0, _h2.default)('img', { style: { margin: '7px -2px -3px 5px', display: 'inline-block' }, attrs: { src: '/images/logo256x256.png', height: '57' } }), (0, _h2.default)('span', { style: { fontSize: '44px', fontFamily: "'Comfortaa', sans-serif", verticalAlign: 'bottom', color: '#fff' } }, 'ugnis')])]);
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

        var data = {
            style: frozen && selectedNodeInDevelopment.id === ref.id ? _extends({}, resolve(node.style), { transition: 'outline 0.1s', outline: '3px solid #3590df' }) : resolve(node.style),
            on: frozen ? {
                mouseover: selectHoverActive ? [selectNodeHover, ref] : undefined,
                click: [selectNodeClick, ref]
            } : {
                click: node.click ? [emitEvent, node.click.id, undefined] : undefined,
                dblclick: node.dblclick ? [emitEvent, node.dblclick.id, undefined] : undefined,
                mouseover: node.mouseover ? [emitEvent, node.mouseover.id, undefined] : undefined,
                mouseout: node.mouseout ? [emitEvent, node.mouseout.id, undefined] : undefined
            }
        };
        return (0, _h2.default)('div', data, flatten(children));
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
            "style": {
                "ref": "style",
                "id": "q86sd89d-3703-483e-ab64-5a5b780aec27"
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
            "style": {
                "ref": "style",
                "id": "a1a8c5b9-a7d1-416b-8e76-eac96fb273c9"
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
        "q86sd89d-3703-483e-ab64-5a5b780aec27": {
            "padding": "20px"
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
        "a1a8c5b9-a7d1-416b-8e76-eac96fb273c9": {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmlnLmpzL2JpZy5qcyIsIm5vZGVfbW9kdWxlcy9zbmFiYmRvbS9oLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL2h0bWxkb21hcGkuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vaXMuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vbW9kdWxlcy9hdHRyaWJ1dGVzLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvY2xhc3MuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vbW9kdWxlcy9ldmVudGxpc3RlbmVycy5qcyIsIm5vZGVfbW9kdWxlcy9zbmFiYmRvbS9tb2R1bGVzL3Byb3BzLmpzIiwibm9kZV9tb2R1bGVzL3NuYWJiZG9tL21vZHVsZXMvc3R5bGUuanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vc25hYmJkb20uanMiLCJub2RlX21vZHVsZXMvc25hYmJkb20vdm5vZGUuanMiLCJzcmNcXGluZGV4LmpzIiwic3JjXFx1Z25pcy5qcyIsInVnbmlzX2NvbXBvbmVudHMvYXBwLmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdG5DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyogYmlnLmpzIHYzLjEuMyBodHRwczovL2dpdGh1Yi5jb20vTWlrZU1jbC9iaWcuanMvTElDRU5DRSAqL1xyXG47KGZ1bmN0aW9uIChnbG9iYWwpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbi8qXHJcbiAgYmlnLmpzIHYzLjEuM1xyXG4gIEEgc21hbGwsIGZhc3QsIGVhc3ktdG8tdXNlIGxpYnJhcnkgZm9yIGFyYml0cmFyeS1wcmVjaXNpb24gZGVjaW1hbCBhcml0aG1ldGljLlxyXG4gIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWtlTWNsL2JpZy5qcy9cclxuICBDb3B5cmlnaHQgKGMpIDIwMTQgTWljaGFlbCBNY2xhdWdobGluIDxNOGNoODhsQGdtYWlsLmNvbT5cclxuICBNSVQgRXhwYXQgTGljZW5jZVxyXG4qL1xyXG5cclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqIEVESVRBQkxFIERFRkFVTFRTICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuXHJcbiAgICAvLyBUaGUgZGVmYXVsdCB2YWx1ZXMgYmVsb3cgbXVzdCBiZSBpbnRlZ2VycyB3aXRoaW4gdGhlIHN0YXRlZCByYW5nZXMuXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBtYXhpbXVtIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyBvZiB0aGUgcmVzdWx0cyBvZiBvcGVyYXRpb25zXHJcbiAgICAgKiBpbnZvbHZpbmcgZGl2aXNpb246IGRpdiBhbmQgc3FydCwgYW5kIHBvdyB3aXRoIG5lZ2F0aXZlIGV4cG9uZW50cy5cclxuICAgICAqL1xyXG4gICAgdmFyIERQID0gMjAsICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMCB0byBNQVhfRFBcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgcm91bmRpbmcgbW9kZSB1c2VkIHdoZW4gcm91bmRpbmcgdG8gdGhlIGFib3ZlIGRlY2ltYWwgcGxhY2VzLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogMCBUb3dhcmRzIHplcm8gKGkuZS4gdHJ1bmNhdGUsIG5vIHJvdW5kaW5nKS4gICAgICAgKFJPVU5EX0RPV04pXHJcbiAgICAgICAgICogMSBUbyBuZWFyZXN0IG5laWdoYm91ci4gSWYgZXF1aWRpc3RhbnQsIHJvdW5kIHVwLiAgKFJPVU5EX0hBTEZfVVApXHJcbiAgICAgICAgICogMiBUbyBuZWFyZXN0IG5laWdoYm91ci4gSWYgZXF1aWRpc3RhbnQsIHRvIGV2ZW4uICAgKFJPVU5EX0hBTEZfRVZFTilcclxuICAgICAgICAgKiAzIEF3YXkgZnJvbSB6ZXJvLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoUk9VTkRfVVApXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUk0gPSAxLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwLCAxLCAyIG9yIDNcclxuXHJcbiAgICAgICAgLy8gVGhlIG1heGltdW0gdmFsdWUgb2YgRFAgYW5kIEJpZy5EUC5cclxuICAgICAgICBNQVhfRFAgPSAxRTYsICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gMTAwMDAwMFxyXG5cclxuICAgICAgICAvLyBUaGUgbWF4aW11bSBtYWduaXR1ZGUgb2YgdGhlIGV4cG9uZW50IGFyZ3VtZW50IHRvIHRoZSBwb3cgbWV0aG9kLlxyXG4gICAgICAgIE1BWF9QT1dFUiA9IDFFNiwgICAgICAgICAgICAgICAgICAgLy8gMSB0byAxMDAwMDAwXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVGhlIGV4cG9uZW50IHZhbHVlIGF0IGFuZCBiZW5lYXRoIHdoaWNoIHRvU3RyaW5nIHJldHVybnMgZXhwb25lbnRpYWxcclxuICAgICAgICAgKiBub3RhdGlvbi5cclxuICAgICAgICAgKiBKYXZhU2NyaXB0J3MgTnVtYmVyIHR5cGU6IC03XHJcbiAgICAgICAgICogLTEwMDAwMDAgaXMgdGhlIG1pbmltdW0gcmVjb21tZW5kZWQgZXhwb25lbnQgdmFsdWUgb2YgYSBCaWcuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgRV9ORUcgPSAtNywgICAgICAgICAgICAgICAgICAgLy8gMCB0byAtMTAwMDAwMFxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSBleHBvbmVudCB2YWx1ZSBhdCBhbmQgYWJvdmUgd2hpY2ggdG9TdHJpbmcgcmV0dXJucyBleHBvbmVudGlhbFxyXG4gICAgICAgICAqIG5vdGF0aW9uLlxyXG4gICAgICAgICAqIEphdmFTY3JpcHQncyBOdW1iZXIgdHlwZTogMjFcclxuICAgICAgICAgKiAxMDAwMDAwIGlzIHRoZSBtYXhpbXVtIHJlY29tbWVuZGVkIGV4cG9uZW50IHZhbHVlIG9mIGEgQmlnLlxyXG4gICAgICAgICAqIChUaGlzIGxpbWl0IGlzIG5vdCBlbmZvcmNlZCBvciBjaGVja2VkLilcclxuICAgICAgICAgKi9cclxuICAgICAgICBFX1BPUyA9IDIxLCAgICAgICAgICAgICAgICAgICAvLyAwIHRvIDEwMDAwMDBcclxuXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcblxyXG4gICAgICAgIC8vIFRoZSBzaGFyZWQgcHJvdG90eXBlIG9iamVjdC5cclxuICAgICAgICBQID0ge30sXHJcbiAgICAgICAgaXNWYWxpZCA9IC9eLT8oXFxkKyhcXC5cXGQqKT98XFwuXFxkKykoZVsrLV0/XFxkKyk/JC9pLFxyXG4gICAgICAgIEJpZztcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIENyZWF0ZSBhbmQgcmV0dXJuIGEgQmlnIGNvbnN0cnVjdG9yLlxyXG4gICAgICpcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gYmlnRmFjdG9yeSgpIHtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgQmlnIGNvbnN0cnVjdG9yIGFuZCBleHBvcnRlZCBmdW5jdGlvbi5cclxuICAgICAgICAgKiBDcmVhdGUgYW5kIHJldHVybiBhIG5ldyBpbnN0YW5jZSBvZiBhIEJpZyBudW1iZXIgb2JqZWN0LlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogbiB7bnVtYmVyfHN0cmluZ3xCaWd9IEEgbnVtZXJpYyB2YWx1ZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBmdW5jdGlvbiBCaWcobikge1xyXG4gICAgICAgICAgICB2YXIgeCA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICAvLyBFbmFibGUgY29uc3RydWN0b3IgdXNhZ2Ugd2l0aG91dCBuZXcuXHJcbiAgICAgICAgICAgIGlmICghKHggaW5zdGFuY2VvZiBCaWcpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbiA9PT0gdm9pZCAwID8gYmlnRmFjdG9yeSgpIDogbmV3IEJpZyhuKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRHVwbGljYXRlLlxyXG4gICAgICAgICAgICBpZiAobiBpbnN0YW5jZW9mIEJpZykge1xyXG4gICAgICAgICAgICAgICAgeC5zID0gbi5zO1xyXG4gICAgICAgICAgICAgICAgeC5lID0gbi5lO1xyXG4gICAgICAgICAgICAgICAgeC5jID0gbi5jLnNsaWNlKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwYXJzZSh4LCBuKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogUmV0YWluIGEgcmVmZXJlbmNlIHRvIHRoaXMgQmlnIGNvbnN0cnVjdG9yLCBhbmQgc2hhZG93XHJcbiAgICAgICAgICAgICAqIEJpZy5wcm90b3R5cGUuY29uc3RydWN0b3Igd2hpY2ggcG9pbnRzIHRvIE9iamVjdC5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIHguY29uc3RydWN0b3IgPSBCaWc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBCaWcucHJvdG90eXBlID0gUDtcclxuICAgICAgICBCaWcuRFAgPSBEUDtcclxuICAgICAgICBCaWcuUk0gPSBSTTtcclxuICAgICAgICBCaWcuRV9ORUcgPSBFX05FRztcclxuICAgICAgICBCaWcuRV9QT1MgPSBFX1BPUztcclxuXHJcbiAgICAgICAgcmV0dXJuIEJpZztcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gUHJpdmF0ZSBmdW5jdGlvbnNcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIEJpZyB4IGluIG5vcm1hbCBvciBleHBvbmVudGlhbFxyXG4gICAgICogbm90YXRpb24gdG8gZHAgZml4ZWQgZGVjaW1hbCBwbGFjZXMgb3Igc2lnbmlmaWNhbnQgZGlnaXRzLlxyXG4gICAgICpcclxuICAgICAqIHgge0JpZ30gVGhlIEJpZyB0byBmb3JtYXQuXHJcbiAgICAgKiBkcCB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKiB0b0Uge251bWJlcn0gMSAodG9FeHBvbmVudGlhbCksIDIgKHRvUHJlY2lzaW9uKSBvciB1bmRlZmluZWQgKHRvRml4ZWQpLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBmb3JtYXQoeCwgZHAsIHRvRSkge1xyXG4gICAgICAgIHZhciBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG5cclxuICAgICAgICAgICAgLy8gVGhlIGluZGV4IChub3JtYWwgbm90YXRpb24pIG9mIHRoZSBkaWdpdCB0aGF0IG1heSBiZSByb3VuZGVkIHVwLlxyXG4gICAgICAgICAgICBpID0gZHAgLSAoeCA9IG5ldyBCaWcoeCkpLmUsXHJcbiAgICAgICAgICAgIGMgPSB4LmM7XHJcblxyXG4gICAgICAgIC8vIFJvdW5kP1xyXG4gICAgICAgIGlmIChjLmxlbmd0aCA+ICsrZHApIHtcclxuICAgICAgICAgICAgcm5kKHgsIGksIEJpZy5STSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWNbMF0pIHtcclxuICAgICAgICAgICAgKytpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodG9FKSB7XHJcbiAgICAgICAgICAgIGkgPSBkcDtcclxuXHJcbiAgICAgICAgLy8gdG9GaXhlZFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGMgPSB4LmM7XHJcblxyXG4gICAgICAgICAgICAvLyBSZWNhbGN1bGF0ZSBpIGFzIHguZSBtYXkgaGF2ZSBjaGFuZ2VkIGlmIHZhbHVlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgIGkgPSB4LmUgKyBpICsgMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFwcGVuZCB6ZXJvcz9cclxuICAgICAgICBmb3IgKDsgYy5sZW5ndGggPCBpOyBjLnB1c2goMCkpIHtcclxuICAgICAgICB9XHJcbiAgICAgICAgaSA9IHguZTtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiB0b1ByZWNpc2lvbiByZXR1cm5zIGV4cG9uZW50aWFsIG5vdGF0aW9uIGlmIHRoZSBudW1iZXIgb2ZcclxuICAgICAgICAgKiBzaWduaWZpY2FudCBkaWdpdHMgc3BlY2lmaWVkIGlzIGxlc3MgdGhhbiB0aGUgbnVtYmVyIG9mIGRpZ2l0c1xyXG4gICAgICAgICAqIG5lY2Vzc2FyeSB0byByZXByZXNlbnQgdGhlIGludGVnZXIgcGFydCBvZiB0aGUgdmFsdWUgaW4gbm9ybWFsXHJcbiAgICAgICAgICogbm90YXRpb24uXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcmV0dXJuIHRvRSA9PT0gMSB8fCB0b0UgJiYgKGRwIDw9IGkgfHwgaSA8PSBCaWcuRV9ORUcpID9cclxuXHJcbiAgICAgICAgICAvLyBFeHBvbmVudGlhbCBub3RhdGlvbi5cclxuICAgICAgICAgICh4LnMgPCAwICYmIGNbMF0gPyAnLScgOiAnJykgK1xyXG4gICAgICAgICAgICAoYy5sZW5ndGggPiAxID8gY1swXSArICcuJyArIGMuam9pbignJykuc2xpY2UoMSkgOiBjWzBdKSArXHJcbiAgICAgICAgICAgICAgKGkgPCAwID8gJ2UnIDogJ2UrJykgKyBpXHJcblxyXG4gICAgICAgICAgLy8gTm9ybWFsIG5vdGF0aW9uLlxyXG4gICAgICAgICAgOiB4LnRvU3RyaW5nKCk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBQYXJzZSB0aGUgbnVtYmVyIG9yIHN0cmluZyB2YWx1ZSBwYXNzZWQgdG8gYSBCaWcgY29uc3RydWN0b3IuXHJcbiAgICAgKlxyXG4gICAgICogeCB7QmlnfSBBIEJpZyBudW1iZXIgaW5zdGFuY2UuXHJcbiAgICAgKiBuIHtudW1iZXJ8c3RyaW5nfSBBIG51bWVyaWMgdmFsdWUuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHBhcnNlKHgsIG4pIHtcclxuICAgICAgICB2YXIgZSwgaSwgbkw7XHJcblxyXG4gICAgICAgIC8vIE1pbnVzIHplcm8/XHJcbiAgICAgICAgaWYgKG4gPT09IDAgJiYgMSAvIG4gPCAwKSB7XHJcbiAgICAgICAgICAgIG4gPSAnLTAnO1xyXG5cclxuICAgICAgICAvLyBFbnN1cmUgbiBpcyBzdHJpbmcgYW5kIGNoZWNrIHZhbGlkaXR5LlxyXG4gICAgICAgIH0gZWxzZSBpZiAoIWlzVmFsaWQudGVzdChuICs9ICcnKSkge1xyXG4gICAgICAgICAgICB0aHJvd0VycihOYU4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHNpZ24uXHJcbiAgICAgICAgeC5zID0gbi5jaGFyQXQoMCkgPT0gJy0nID8gKG4gPSBuLnNsaWNlKDEpLCAtMSkgOiAxO1xyXG5cclxuICAgICAgICAvLyBEZWNpbWFsIHBvaW50P1xyXG4gICAgICAgIGlmICgoZSA9IG4uaW5kZXhPZignLicpKSA+IC0xKSB7XHJcbiAgICAgICAgICAgIG4gPSBuLnJlcGxhY2UoJy4nLCAnJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFeHBvbmVudGlhbCBmb3JtP1xyXG4gICAgICAgIGlmICgoaSA9IG4uc2VhcmNoKC9lL2kpKSA+IDApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIERldGVybWluZSBleHBvbmVudC5cclxuICAgICAgICAgICAgaWYgKGUgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBlID0gaTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlICs9ICtuLnNsaWNlKGkgKyAxKTtcclxuICAgICAgICAgICAgbiA9IG4uc3Vic3RyaW5nKDAsIGkpO1xyXG5cclxuICAgICAgICB9IGVsc2UgaWYgKGUgPCAwKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBJbnRlZ2VyLlxyXG4gICAgICAgICAgICBlID0gbi5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgbGVhZGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKGkgPSAwOyBuLmNoYXJBdChpKSA9PSAnMCc7IGkrKykge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGkgPT0gKG5MID0gbi5sZW5ndGgpKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBaZXJvLlxyXG4gICAgICAgICAgICB4LmMgPSBbIHguZSA9IDAgXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKDsgbi5jaGFyQXQoLS1uTCkgPT0gJzAnOykge1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB4LmUgPSBlIC0gaSAtIDE7XHJcbiAgICAgICAgICAgIHguYyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgLy8gQ29udmVydCBzdHJpbmcgdG8gYXJyYXkgb2YgZGlnaXRzIHdpdGhvdXQgbGVhZGluZy90cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yIChlID0gMDsgaSA8PSBuTDsgeC5jW2UrK10gPSArbi5jaGFyQXQoaSsrKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4geDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJvdW5kIEJpZyB4IHRvIGEgbWF4aW11bSBvZiBkcCBkZWNpbWFsIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIHJtLlxyXG4gICAgICogQ2FsbGVkIGJ5IGRpdiwgc3FydCBhbmQgcm91bmQuXHJcbiAgICAgKlxyXG4gICAgICogeCB7QmlnfSBUaGUgQmlnIHRvIHJvdW5kLlxyXG4gICAgICogZHAge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICogcm0ge251bWJlcn0gMCwgMSwgMiBvciAzIChET1dOLCBIQUxGX1VQLCBIQUxGX0VWRU4sIFVQKVxyXG4gICAgICogW21vcmVdIHtib29sZWFufSBXaGV0aGVyIHRoZSByZXN1bHQgb2YgZGl2aXNpb24gd2FzIHRydW5jYXRlZC5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcm5kKHgsIGRwLCBybSwgbW9yZSkge1xyXG4gICAgICAgIHZhciB1LFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgaSA9IHguZSArIGRwICsgMTtcclxuXHJcbiAgICAgICAgaWYgKHJtID09PSAxKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB4Y1tpXSBpcyB0aGUgZGlnaXQgYWZ0ZXIgdGhlIGRpZ2l0IHRoYXQgbWF5IGJlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgIG1vcmUgPSB4Y1tpXSA+PSA1O1xyXG4gICAgICAgIH0gZWxzZSBpZiAocm0gPT09IDIpIHtcclxuICAgICAgICAgICAgbW9yZSA9IHhjW2ldID4gNSB8fCB4Y1tpXSA9PSA1ICYmXHJcbiAgICAgICAgICAgICAgKG1vcmUgfHwgaSA8IDAgfHwgeGNbaSArIDFdICE9PSB1IHx8IHhjW2kgLSAxXSAmIDEpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAocm0gPT09IDMpIHtcclxuICAgICAgICAgICAgbW9yZSA9IG1vcmUgfHwgeGNbaV0gIT09IHUgfHwgaSA8IDA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbW9yZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJtICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvd0VycignIUJpZy5STSEnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGkgPCAxIHx8ICF4Y1swXSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKG1vcmUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyAxLCAwLjEsIDAuMDEsIDAuMDAxLCAwLjAwMDEgZXRjLlxyXG4gICAgICAgICAgICAgICAgeC5lID0gLWRwO1xyXG4gICAgICAgICAgICAgICAgeC5jID0gWzFdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFplcm8uXHJcbiAgICAgICAgICAgICAgICB4LmMgPSBbeC5lID0gMF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlIGFueSBkaWdpdHMgYWZ0ZXIgdGhlIHJlcXVpcmVkIGRlY2ltYWwgcGxhY2VzLlxyXG4gICAgICAgICAgICB4Yy5sZW5ndGggPSBpLS07XHJcblxyXG4gICAgICAgICAgICAvLyBSb3VuZCB1cD9cclxuICAgICAgICAgICAgaWYgKG1vcmUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBSb3VuZGluZyB1cCBtYXkgbWVhbiB0aGUgcHJldmlvdXMgZGlnaXQgaGFzIHRvIGJlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgICAgICBmb3IgKDsgKyt4Y1tpXSA+IDk7KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeGNbaV0gPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWktLSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICArK3guZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGMudW5zaGlmdCgxKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yIChpID0geGMubGVuZ3RoOyAheGNbLS1pXTsgeGMucG9wKCkpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaHJvdyBhIEJpZ0Vycm9yLlxyXG4gICAgICpcclxuICAgICAqIG1lc3NhZ2Uge3N0cmluZ30gVGhlIGVycm9yIG1lc3NhZ2UuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHRocm93RXJyKG1lc3NhZ2UpIHtcclxuICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG4gICAgICAgIGVyci5uYW1lID0gJ0JpZ0Vycm9yJztcclxuXHJcbiAgICAgICAgdGhyb3cgZXJyO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBQcm90b3R5cGUvaW5zdGFuY2UgbWV0aG9kc1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgdGhpcyBCaWcuXHJcbiAgICAgKi9cclxuICAgIFAuYWJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciB4ID0gbmV3IHRoaXMuY29uc3RydWN0b3IodGhpcyk7XHJcbiAgICAgICAgeC5zID0gMTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuXHJcbiAgICAgKiAxIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBncmVhdGVyIHRoYW4gdGhlIHZhbHVlIG9mIEJpZyB5LFxyXG4gICAgICogLTEgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGxlc3MgdGhhbiB0aGUgdmFsdWUgb2YgQmlnIHksIG9yXHJcbiAgICAgKiAwIGlmIHRoZXkgaGF2ZSB0aGUgc2FtZSB2YWx1ZS5cclxuICAgICovXHJcbiAgICBQLmNtcCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIHhOZWcsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgeWMgPSAoeSA9IG5ldyB4LmNvbnN0cnVjdG9yKHkpKS5jLFxyXG4gICAgICAgICAgICBpID0geC5zLFxyXG4gICAgICAgICAgICBqID0geS5zLFxyXG4gICAgICAgICAgICBrID0geC5lLFxyXG4gICAgICAgICAgICBsID0geS5lO1xyXG5cclxuICAgICAgICAvLyBFaXRoZXIgemVybz9cclxuICAgICAgICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gIXhjWzBdID8gIXljWzBdID8gMCA6IC1qIDogaTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNpZ25zIGRpZmZlcj9cclxuICAgICAgICBpZiAoaSAhPSBqKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB4TmVnID0gaSA8IDA7XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgZXhwb25lbnRzLlxyXG4gICAgICAgIGlmIChrICE9IGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGsgPiBsIF4geE5lZyA/IDEgOiAtMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGkgPSAtMTtcclxuICAgICAgICBqID0gKGsgPSB4Yy5sZW5ndGgpIDwgKGwgPSB5Yy5sZW5ndGgpID8gayA6IGw7XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgZGlnaXQgYnkgZGlnaXQuXHJcbiAgICAgICAgZm9yICg7ICsraSA8IGo7KSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoeGNbaV0gIT0geWNbaV0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB4Y1tpXSA+IHljW2ldIF4geE5lZyA/IDEgOiAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ29tcGFyZSBsZW5ndGhzLlxyXG4gICAgICAgIHJldHVybiBrID09IGwgPyAwIDogayA+IGwgXiB4TmVnID8gMSA6IC0xO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGRpdmlkZWQgYnkgdGhlXHJcbiAgICAgKiB2YWx1ZSBvZiBCaWcgeSwgcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB0byBhIG1heGltdW0gb2YgQmlnLkRQIGRlY2ltYWxcclxuICAgICAqIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIEJpZy5STS5cclxuICAgICAqL1xyXG4gICAgUC5kaXYgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgLy8gZGl2aWRlbmRcclxuICAgICAgICAgICAgZHZkID0geC5jLFxyXG4gICAgICAgICAgICAvL2Rpdmlzb3JcclxuICAgICAgICAgICAgZHZzID0gKHkgPSBuZXcgQmlnKHkpKS5jLFxyXG4gICAgICAgICAgICBzID0geC5zID09IHkucyA/IDEgOiAtMSxcclxuICAgICAgICAgICAgZHAgPSBCaWcuRFA7XHJcblxyXG4gICAgICAgIGlmIChkcCAhPT0gfn5kcCB8fCBkcCA8IDAgfHwgZHAgPiBNQVhfRFApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyFCaWcuRFAhJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFaXRoZXIgMD9cclxuICAgICAgICBpZiAoIWR2ZFswXSB8fCAhZHZzWzBdKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBib3RoIGFyZSAwLCB0aHJvdyBOYU5cclxuICAgICAgICAgICAgaWYgKGR2ZFswXSA9PSBkdnNbMF0pIHtcclxuICAgICAgICAgICAgICAgIHRocm93RXJyKE5hTik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIElmIGR2cyBpcyAwLCB0aHJvdyArLUluZmluaXR5LlxyXG4gICAgICAgICAgICBpZiAoIWR2c1swXSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3dFcnIocyAvIDApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBkdmQgaXMgMCwgcmV0dXJuICstMC5cclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWcocyAqIDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGR2c0wsIGR2c1QsIG5leHQsIGNtcCwgcmVtSSwgdSxcclxuICAgICAgICAgICAgZHZzWiA9IGR2cy5zbGljZSgpLFxyXG4gICAgICAgICAgICBkdmRJID0gZHZzTCA9IGR2cy5sZW5ndGgsXHJcbiAgICAgICAgICAgIGR2ZEwgPSBkdmQubGVuZ3RoLFxyXG4gICAgICAgICAgICAvLyByZW1haW5kZXJcclxuICAgICAgICAgICAgcmVtID0gZHZkLnNsaWNlKDAsIGR2c0wpLFxyXG4gICAgICAgICAgICByZW1MID0gcmVtLmxlbmd0aCxcclxuICAgICAgICAgICAgLy8gcXVvdGllbnRcclxuICAgICAgICAgICAgcSA9IHksXHJcbiAgICAgICAgICAgIHFjID0gcS5jID0gW10sXHJcbiAgICAgICAgICAgIHFpID0gMCxcclxuICAgICAgICAgICAgZGlnaXRzID0gZHAgKyAocS5lID0geC5lIC0geS5lKSArIDE7XHJcblxyXG4gICAgICAgIHEucyA9IHM7XHJcbiAgICAgICAgcyA9IGRpZ2l0cyA8IDAgPyAwIDogZGlnaXRzO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgdmVyc2lvbiBvZiBkaXZpc29yIHdpdGggbGVhZGluZyB6ZXJvLlxyXG4gICAgICAgIGR2c1oudW5zaGlmdCgwKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIHplcm9zIHRvIG1ha2UgcmVtYWluZGVyIGFzIGxvbmcgYXMgZGl2aXNvci5cclxuICAgICAgICBmb3IgKDsgcmVtTCsrIDwgZHZzTDsgcmVtLnB1c2goMCkpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRvIHtcclxuXHJcbiAgICAgICAgICAgIC8vICduZXh0JyBpcyBob3cgbWFueSB0aW1lcyB0aGUgZGl2aXNvciBnb2VzIGludG8gY3VycmVudCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgIGZvciAobmV4dCA9IDA7IG5leHQgPCAxMDsgbmV4dCsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ29tcGFyZSBkaXZpc29yIGFuZCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICBpZiAoZHZzTCAhPSAocmVtTCA9IHJlbS5sZW5ndGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY21wID0gZHZzTCA+IHJlbUwgPyAxIDogLTE7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHJlbUkgPSAtMSwgY21wID0gMDsgKytyZW1JIDwgZHZzTDspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkdnNbcmVtSV0gIT0gcmVtW3JlbUldKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbXAgPSBkdnNbcmVtSV0gPiByZW1bcmVtSV0gPyAxIDogLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBJZiBkaXZpc29yIDwgcmVtYWluZGVyLCBzdWJ0cmFjdCBkaXZpc29yIGZyb20gcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgaWYgKGNtcCA8IDApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVtYWluZGVyIGNhbid0IGJlIG1vcmUgdGhhbiAxIGRpZ2l0IGxvbmdlciB0aGFuIGRpdmlzb3IuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRXF1YWxpc2UgbGVuZ3RocyB1c2luZyBkaXZpc29yIHdpdGggZXh0cmEgbGVhZGluZyB6ZXJvP1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoZHZzVCA9IHJlbUwgPT0gZHZzTCA/IGR2cyA6IGR2c1o7IHJlbUw7KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVtWy0tcmVtTF0gPCBkdnNUW3JlbUxdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1JID0gcmVtTDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKDsgcmVtSSAmJiAhcmVtWy0tcmVtSV07IHJlbVtyZW1JXSA9IDkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0tcmVtW3JlbUldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtW3JlbUxdICs9IDEwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbVtyZW1MXSAtPSBkdnNUW3JlbUxdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKDsgIXJlbVswXTsgcmVtLnNoaWZ0KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgdGhlICduZXh0JyBkaWdpdCB0byB0aGUgcmVzdWx0IGFycmF5LlxyXG4gICAgICAgICAgICBxY1txaSsrXSA9IGNtcCA/IG5leHQgOiArK25leHQ7XHJcblxyXG4gICAgICAgICAgICAvLyBVcGRhdGUgdGhlIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgaWYgKHJlbVswXSAmJiBjbXApIHtcclxuICAgICAgICAgICAgICAgIHJlbVtyZW1MXSA9IGR2ZFtkdmRJXSB8fCAwO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVtID0gWyBkdmRbZHZkSV0gXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IHdoaWxlICgoZHZkSSsrIDwgZHZkTCB8fCByZW1bMF0gIT09IHUpICYmIHMtLSk7XHJcblxyXG4gICAgICAgIC8vIExlYWRpbmcgemVybz8gRG8gbm90IHJlbW92ZSBpZiByZXN1bHQgaXMgc2ltcGx5IHplcm8gKHFpID09IDEpLlxyXG4gICAgICAgIGlmICghcWNbMF0gJiYgcWkgIT0gMSkge1xyXG5cclxuICAgICAgICAgICAgLy8gVGhlcmUgY2FuJ3QgYmUgbW9yZSB0aGFuIG9uZSB6ZXJvLlxyXG4gICAgICAgICAgICBxYy5zaGlmdCgpO1xyXG4gICAgICAgICAgICBxLmUtLTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJvdW5kP1xyXG4gICAgICAgIGlmIChxaSA+IGRpZ2l0cykge1xyXG4gICAgICAgICAgICBybmQocSwgZHAsIEJpZy5STSwgcmVtWzBdICE9PSB1KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBxO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBlcXVhbCB0byB0aGUgdmFsdWUgb2YgQmlnIHksXHJcbiAgICAgKiBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5lcSA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgcmV0dXJuICF0aGlzLmNtcCh5KTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZ3JlYXRlciB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSxcclxuICAgICAqIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmd0ID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jbXAoeSkgPiAwO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gdGhlXHJcbiAgICAgKiB2YWx1ZSBvZiBCaWcgeSwgb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAuZ3RlID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jbXAoeSkgPiAtMTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgbGVzcyB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSxcclxuICAgICAqIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmx0ID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jbXAoeSkgPCAwO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHZhbHVlXHJcbiAgICAgKiBvZiBCaWcgeSwgb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAubHRlID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICAgcmV0dXJuIHRoaXMuY21wKHkpIDwgMTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBtaW51cyB0aGUgdmFsdWVcclxuICAgICAqIG9mIEJpZyB5LlxyXG4gICAgICovXHJcbiAgICBQLnN1YiA9IFAubWludXMgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciBpLCBqLCB0LCB4TFR5LFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgYSA9IHgucyxcclxuICAgICAgICAgICAgYiA9ICh5ID0gbmV3IEJpZyh5KSkucztcclxuXHJcbiAgICAgICAgLy8gU2lnbnMgZGlmZmVyP1xyXG4gICAgICAgIGlmIChhICE9IGIpIHtcclxuICAgICAgICAgICAgeS5zID0gLWI7XHJcbiAgICAgICAgICAgIHJldHVybiB4LnBsdXMoeSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgeGMgPSB4LmMuc2xpY2UoKSxcclxuICAgICAgICAgICAgeGUgPSB4LmUsXHJcbiAgICAgICAgICAgIHljID0geS5jLFxyXG4gICAgICAgICAgICB5ZSA9IHkuZTtcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHkgaXMgbm9uLXplcm8/IHggaXMgbm9uLXplcm8/IE9yIGJvdGggYXJlIHplcm8uXHJcbiAgICAgICAgICAgIHJldHVybiB5Y1swXSA/ICh5LnMgPSAtYiwgeSkgOiBuZXcgQmlnKHhjWzBdID8geCA6IDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoaWNoIGlzIHRoZSBiaWdnZXIgbnVtYmVyLlxyXG4gICAgICAgIC8vIFByZXBlbmQgemVyb3MgdG8gZXF1YWxpc2UgZXhwb25lbnRzLlxyXG4gICAgICAgIGlmIChhID0geGUgLSB5ZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKHhMVHkgPSBhIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgYSA9IC1hO1xyXG4gICAgICAgICAgICAgICAgdCA9IHhjO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgeWUgPSB4ZTtcclxuICAgICAgICAgICAgICAgIHQgPSB5YztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgIGZvciAoYiA9IGE7IGItLTsgdC5wdXNoKDApKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIEV4cG9uZW50cyBlcXVhbC4gQ2hlY2sgZGlnaXQgYnkgZGlnaXQuXHJcbiAgICAgICAgICAgIGogPSAoKHhMVHkgPSB4Yy5sZW5ndGggPCB5Yy5sZW5ndGgpID8geGMgOiB5YykubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgZm9yIChhID0gYiA9IDA7IGIgPCBqOyBiKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoeGNbYl0gIT0geWNbYl0pIHtcclxuICAgICAgICAgICAgICAgICAgICB4TFR5ID0geGNbYl0gPCB5Y1tiXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8geCA8IHk/IFBvaW50IHhjIHRvIHRoZSBhcnJheSBvZiB0aGUgYmlnZ2VyIG51bWJlci5cclxuICAgICAgICBpZiAoeExUeSkge1xyXG4gICAgICAgICAgICB0ID0geGM7XHJcbiAgICAgICAgICAgIHhjID0geWM7XHJcbiAgICAgICAgICAgIHljID0gdDtcclxuICAgICAgICAgICAgeS5zID0gLXkucztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogQXBwZW5kIHplcm9zIHRvIHhjIGlmIHNob3J0ZXIuIE5vIG5lZWQgdG8gYWRkIHplcm9zIHRvIHljIGlmIHNob3J0ZXJcclxuICAgICAgICAgKiBhcyBzdWJ0cmFjdGlvbiBvbmx5IG5lZWRzIHRvIHN0YXJ0IGF0IHljLmxlbmd0aC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBpZiAoKCBiID0gKGogPSB5Yy5sZW5ndGgpIC0gKGkgPSB4Yy5sZW5ndGgpICkgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKDsgYi0tOyB4Y1tpKytdID0gMCkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTdWJ0cmFjdCB5YyBmcm9tIHhjLlxyXG4gICAgICAgIGZvciAoYiA9IGk7IGogPiBhOyl7XHJcblxyXG4gICAgICAgICAgICBpZiAoeGNbLS1qXSA8IHljW2pdKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gajsgaSAmJiAheGNbLS1pXTsgeGNbaV0gPSA5KSB7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAtLXhjW2ldO1xyXG4gICAgICAgICAgICAgICAgeGNbal0gKz0gMTA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgeGNbal0gLT0geWNbal07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yICg7IHhjWy0tYl0gPT09IDA7IHhjLnBvcCgpKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgbGVhZGluZyB6ZXJvcyBhbmQgYWRqdXN0IGV4cG9uZW50IGFjY29yZGluZ2x5LlxyXG4gICAgICAgIGZvciAoOyB4Y1swXSA9PT0gMDspIHtcclxuICAgICAgICAgICAgeGMuc2hpZnQoKTtcclxuICAgICAgICAgICAgLS15ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICgheGNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIG4gLSBuID0gKzBcclxuICAgICAgICAgICAgeS5zID0gMTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlc3VsdCBtdXN0IGJlIHplcm8uXHJcbiAgICAgICAgICAgIHhjID0gW3llID0gMF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB5LmMgPSB4YztcclxuICAgICAgICB5LmUgPSB5ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgbW9kdWxvIHRoZVxyXG4gICAgICogdmFsdWUgb2YgQmlnIHkuXHJcbiAgICAgKi9cclxuICAgIFAubW9kID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgeUdUeCxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIGEgPSB4LnMsXHJcbiAgICAgICAgICAgIGIgPSAoeSA9IG5ldyBCaWcoeSkpLnM7XHJcblxyXG4gICAgICAgIGlmICgheS5jWzBdKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKE5hTik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB4LnMgPSB5LnMgPSAxO1xyXG4gICAgICAgIHlHVHggPSB5LmNtcCh4KSA9PSAxO1xyXG4gICAgICAgIHgucyA9IGE7XHJcbiAgICAgICAgeS5zID0gYjtcclxuXHJcbiAgICAgICAgaWYgKHlHVHgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWcoeCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhID0gQmlnLkRQO1xyXG4gICAgICAgIGIgPSBCaWcuUk07XHJcbiAgICAgICAgQmlnLkRQID0gQmlnLlJNID0gMDtcclxuICAgICAgICB4ID0geC5kaXYoeSk7XHJcbiAgICAgICAgQmlnLkRQID0gYTtcclxuICAgICAgICBCaWcuUk0gPSBiO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5taW51cyggeC50aW1lcyh5KSApO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHBsdXMgdGhlIHZhbHVlXHJcbiAgICAgKiBvZiBCaWcgeS5cclxuICAgICAqL1xyXG4gICAgUC5hZGQgPSBQLnBsdXMgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciB0LFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgYSA9IHgucyxcclxuICAgICAgICAgICAgYiA9ICh5ID0gbmV3IEJpZyh5KSkucztcclxuXHJcbiAgICAgICAgLy8gU2lnbnMgZGlmZmVyP1xyXG4gICAgICAgIGlmIChhICE9IGIpIHtcclxuICAgICAgICAgICAgeS5zID0gLWI7XHJcbiAgICAgICAgICAgIHJldHVybiB4Lm1pbnVzKHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHhlID0geC5lLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgeWUgPSB5LmUsXHJcbiAgICAgICAgICAgIHljID0geS5jO1xyXG5cclxuICAgICAgICAvLyBFaXRoZXIgemVybz9cclxuICAgICAgICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xyXG5cclxuICAgICAgICAgICAgLy8geSBpcyBub24temVybz8geCBpcyBub24temVybz8gT3IgYm90aCBhcmUgemVyby5cclxuICAgICAgICAgICAgcmV0dXJuIHljWzBdID8geSA6IG5ldyBCaWcoeGNbMF0gPyB4IDogYSAqIDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB4YyA9IHhjLnNsaWNlKCk7XHJcblxyXG4gICAgICAgIC8vIFByZXBlbmQgemVyb3MgdG8gZXF1YWxpc2UgZXhwb25lbnRzLlxyXG4gICAgICAgIC8vIE5vdGU6IEZhc3RlciB0byB1c2UgcmV2ZXJzZSB0aGVuIGRvIHVuc2hpZnRzLlxyXG4gICAgICAgIGlmIChhID0geGUgLSB5ZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKGEgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB5ZSA9IHhlO1xyXG4gICAgICAgICAgICAgICAgdCA9IHljO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYSA9IC1hO1xyXG4gICAgICAgICAgICAgICAgdCA9IHhjO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgICAgICAgZm9yICg7IGEtLTsgdC5wdXNoKDApKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBQb2ludCB4YyB0byB0aGUgbG9uZ2VyIGFycmF5LlxyXG4gICAgICAgIGlmICh4Yy5sZW5ndGggLSB5Yy5sZW5ndGggPCAwKSB7XHJcbiAgICAgICAgICAgIHQgPSB5YztcclxuICAgICAgICAgICAgeWMgPSB4YztcclxuICAgICAgICAgICAgeGMgPSB0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBhID0geWMubGVuZ3RoO1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIE9ubHkgc3RhcnQgYWRkaW5nIGF0IHljLmxlbmd0aCAtIDEgYXMgdGhlIGZ1cnRoZXIgZGlnaXRzIG9mIHhjIGNhbiBiZVxyXG4gICAgICAgICAqIGxlZnQgYXMgdGhleSBhcmUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZm9yIChiID0gMDsgYTspIHtcclxuICAgICAgICAgICAgYiA9ICh4Y1stLWFdID0geGNbYV0gKyB5Y1thXSArIGIpIC8gMTAgfCAwO1xyXG4gICAgICAgICAgICB4Y1thXSAlPSAxMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE5vIG5lZWQgdG8gY2hlY2sgZm9yIHplcm8sIGFzICt4ICsgK3kgIT0gMCAmJiAteCArIC15ICE9IDBcclxuXHJcbiAgICAgICAgaWYgKGIpIHtcclxuICAgICAgICAgICAgeGMudW5zaGlmdChiKTtcclxuICAgICAgICAgICAgKyt5ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yIChhID0geGMubGVuZ3RoOyB4Y1stLWFdID09PSAwOyB4Yy5wb3AoKSkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgeS5jID0geGM7XHJcbiAgICAgICAgeS5lID0geWU7XHJcblxyXG4gICAgICAgIHJldHVybiB5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgcmFpc2VkIHRvIHRoZSBwb3dlciBuLlxyXG4gICAgICogSWYgbiBpcyBuZWdhdGl2ZSwgcm91bmQsIGlmIG5lY2Vzc2FyeSwgdG8gYSBtYXhpbXVtIG9mIEJpZy5EUCBkZWNpbWFsXHJcbiAgICAgKiBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBCaWcuUk0uXHJcbiAgICAgKlxyXG4gICAgICogbiB7bnVtYmVyfSBJbnRlZ2VyLCAtTUFYX1BPV0VSIHRvIE1BWF9QT1dFUiBpbmNsdXNpdmUuXHJcbiAgICAgKi9cclxuICAgIFAucG93ID0gZnVuY3Rpb24gKG4pIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIG9uZSA9IG5ldyB4LmNvbnN0cnVjdG9yKDEpLFxyXG4gICAgICAgICAgICB5ID0gb25lLFxyXG4gICAgICAgICAgICBpc05lZyA9IG4gPCAwO1xyXG5cclxuICAgICAgICBpZiAobiAhPT0gfn5uIHx8IG4gPCAtTUFYX1BPV0VSIHx8IG4gPiBNQVhfUE9XRVIpIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyFwb3chJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuID0gaXNOZWcgPyAtbiA6IG47XHJcblxyXG4gICAgICAgIGZvciAoOzspIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChuICYgMSkge1xyXG4gICAgICAgICAgICAgICAgeSA9IHkudGltZXMoeCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbiA+Pj0gMTtcclxuXHJcbiAgICAgICAgICAgIGlmICghbikge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgeCA9IHgudGltZXMoeCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaXNOZWcgPyBvbmUuZGl2KHkpIDogeTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyByb3VuZGVkIHRvIGFcclxuICAgICAqIG1heGltdW0gb2YgZHAgZGVjaW1hbCBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBybS5cclxuICAgICAqIElmIGRwIGlzIG5vdCBzcGVjaWZpZWQsIHJvdW5kIHRvIDAgZGVjaW1hbCBwbGFjZXMuXHJcbiAgICAgKiBJZiBybSBpcyBub3Qgc3BlY2lmaWVkLCB1c2UgQmlnLlJNLlxyXG4gICAgICpcclxuICAgICAqIFtkcF0ge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICogW3JtXSAwLCAxLCAyIG9yIDMgKFJPVU5EX0RPV04sIFJPVU5EX0hBTEZfVVAsIFJPVU5EX0hBTEZfRVZFTiwgUk9VTkRfVVApXHJcbiAgICAgKi9cclxuICAgIFAucm91bmQgPSBmdW5jdGlvbiAoZHAsIHJtKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yO1xyXG5cclxuICAgICAgICBpZiAoZHAgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBkcCA9IDA7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkcCAhPT0gfn5kcCB8fCBkcCA8IDAgfHwgZHAgPiBNQVhfRFApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyFyb3VuZCEnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcm5kKHggPSBuZXcgQmlnKHgpLCBkcCwgcm0gPT0gbnVsbCA/IEJpZy5STSA6IHJtKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgc3F1YXJlIHJvb3Qgb2YgdGhlIHZhbHVlIG9mIHRoaXMgQmlnLFxyXG4gICAgICogcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB0byBhIG1heGltdW0gb2YgQmlnLkRQIGRlY2ltYWwgcGxhY2VzIHVzaW5nXHJcbiAgICAgKiByb3VuZGluZyBtb2RlIEJpZy5STS5cclxuICAgICAqL1xyXG4gICAgUC5zcXJ0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBlc3RpbWF0ZSwgciwgYXBwcm94LFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIGkgPSB4LnMsXHJcbiAgICAgICAgICAgIGUgPSB4LmUsXHJcbiAgICAgICAgICAgIGhhbGYgPSBuZXcgQmlnKCcwLjUnKTtcclxuXHJcbiAgICAgICAgLy8gWmVybz9cclxuICAgICAgICBpZiAoIXhjWzBdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnKHgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgbmVnYXRpdmUsIHRocm93IE5hTi5cclxuICAgICAgICBpZiAoaSA8IDApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoTmFOKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEVzdGltYXRlLlxyXG4gICAgICAgIGkgPSBNYXRoLnNxcnQoeC50b1N0cmluZygpKTtcclxuXHJcbiAgICAgICAgLy8gTWF0aC5zcXJ0IHVuZGVyZmxvdy9vdmVyZmxvdz9cclxuICAgICAgICAvLyBQYXNzIHggdG8gTWF0aC5zcXJ0IGFzIGludGVnZXIsIHRoZW4gYWRqdXN0IHRoZSByZXN1bHQgZXhwb25lbnQuXHJcbiAgICAgICAgaWYgKGkgPT09IDAgfHwgaSA9PT0gMSAvIDApIHtcclxuICAgICAgICAgICAgZXN0aW1hdGUgPSB4Yy5qb2luKCcnKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghKGVzdGltYXRlLmxlbmd0aCArIGUgJiAxKSkge1xyXG4gICAgICAgICAgICAgICAgZXN0aW1hdGUgKz0gJzAnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByID0gbmV3IEJpZyggTWF0aC5zcXJ0KGVzdGltYXRlKS50b1N0cmluZygpICk7XHJcbiAgICAgICAgICAgIHIuZSA9ICgoZSArIDEpIC8gMiB8IDApIC0gKGUgPCAwIHx8IGUgJiAxKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByID0gbmV3IEJpZyhpLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaSA9IHIuZSArIChCaWcuRFAgKz0gNCk7XHJcblxyXG4gICAgICAgIC8vIE5ld3Rvbi1SYXBoc29uIGl0ZXJhdGlvbi5cclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIGFwcHJveCA9IHI7XHJcbiAgICAgICAgICAgIHIgPSBoYWxmLnRpbWVzKCBhcHByb3gucGx1cyggeC5kaXYoYXBwcm94KSApICk7XHJcbiAgICAgICAgfSB3aGlsZSAoIGFwcHJveC5jLnNsaWNlKDAsIGkpLmpvaW4oJycpICE9PVxyXG4gICAgICAgICAgICAgICAgICAgICAgIHIuYy5zbGljZSgwLCBpKS5qb2luKCcnKSApO1xyXG5cclxuICAgICAgICBybmQociwgQmlnLkRQIC09IDQsIEJpZy5STSk7XHJcblxyXG4gICAgICAgIHJldHVybiByO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHRpbWVzIHRoZSB2YWx1ZSBvZlxyXG4gICAgICogQmlnIHkuXHJcbiAgICAgKi9cclxuICAgIFAubXVsID0gUC50aW1lcyA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIGMsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgeWMgPSAoeSA9IG5ldyBCaWcoeSkpLmMsXHJcbiAgICAgICAgICAgIGEgPSB4Yy5sZW5ndGgsXHJcbiAgICAgICAgICAgIGIgPSB5Yy5sZW5ndGgsXHJcbiAgICAgICAgICAgIGkgPSB4LmUsXHJcbiAgICAgICAgICAgIGogPSB5LmU7XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSBzaWduIG9mIHJlc3VsdC5cclxuICAgICAgICB5LnMgPSB4LnMgPT0geS5zID8gMSA6IC0xO1xyXG5cclxuICAgICAgICAvLyBSZXR1cm4gc2lnbmVkIDAgaWYgZWl0aGVyIDAuXHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWcoeS5zICogMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXNlIGV4cG9uZW50IG9mIHJlc3VsdCBhcyB4LmUgKyB5LmUuXHJcbiAgICAgICAgeS5lID0gaSArIGo7XHJcblxyXG4gICAgICAgIC8vIElmIGFycmF5IHhjIGhhcyBmZXdlciBkaWdpdHMgdGhhbiB5Yywgc3dhcCB4YyBhbmQgeWMsIGFuZCBsZW5ndGhzLlxyXG4gICAgICAgIGlmIChhIDwgYikge1xyXG4gICAgICAgICAgICBjID0geGM7XHJcbiAgICAgICAgICAgIHhjID0geWM7XHJcbiAgICAgICAgICAgIHljID0gYztcclxuICAgICAgICAgICAgaiA9IGE7XHJcbiAgICAgICAgICAgIGEgPSBiO1xyXG4gICAgICAgICAgICBiID0gajtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpc2UgY29lZmZpY2llbnQgYXJyYXkgb2YgcmVzdWx0IHdpdGggemVyb3MuXHJcbiAgICAgICAgZm9yIChjID0gbmV3IEFycmF5KGogPSBhICsgYik7IGotLTsgY1tqXSA9IDApIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE11bHRpcGx5LlxyXG5cclxuICAgICAgICAvLyBpIGlzIGluaXRpYWxseSB4Yy5sZW5ndGguXHJcbiAgICAgICAgZm9yIChpID0gYjsgaS0tOykge1xyXG4gICAgICAgICAgICBiID0gMDtcclxuXHJcbiAgICAgICAgICAgIC8vIGEgaXMgeWMubGVuZ3RoLlxyXG4gICAgICAgICAgICBmb3IgKGogPSBhICsgaTsgaiA+IGk7KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3VycmVudCBzdW0gb2YgcHJvZHVjdHMgYXQgdGhpcyBkaWdpdCBwb3NpdGlvbiwgcGx1cyBjYXJyeS5cclxuICAgICAgICAgICAgICAgIGIgPSBjW2pdICsgeWNbaV0gKiB4Y1tqIC0gaSAtIDFdICsgYjtcclxuICAgICAgICAgICAgICAgIGNbai0tXSA9IGIgJSAxMDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBjYXJyeVxyXG4gICAgICAgICAgICAgICAgYiA9IGIgLyAxMCB8IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY1tqXSA9IChjW2pdICsgYikgJSAxMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluY3JlbWVudCByZXN1bHQgZXhwb25lbnQgaWYgdGhlcmUgaXMgYSBmaW5hbCBjYXJyeS5cclxuICAgICAgICBpZiAoYikge1xyXG4gICAgICAgICAgICArK3kuZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBhbnkgbGVhZGluZyB6ZXJvLlxyXG4gICAgICAgIGlmICghY1swXSkge1xyXG4gICAgICAgICAgICBjLnNoaWZ0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yIChpID0gYy5sZW5ndGg7ICFjWy0taV07IGMucG9wKCkpIHtcclxuICAgICAgICB9XHJcbiAgICAgICAgeS5jID0gYztcclxuXHJcbiAgICAgICAgcmV0dXJuIHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcuXHJcbiAgICAgKiBSZXR1cm4gZXhwb25lbnRpYWwgbm90YXRpb24gaWYgdGhpcyBCaWcgaGFzIGEgcG9zaXRpdmUgZXhwb25lbnQgZXF1YWwgdG9cclxuICAgICAqIG9yIGdyZWF0ZXIgdGhhbiBCaWcuRV9QT1MsIG9yIGEgbmVnYXRpdmUgZXhwb25lbnQgZXF1YWwgdG8gb3IgbGVzcyB0aGFuXHJcbiAgICAgKiBCaWcuRV9ORUcuXHJcbiAgICAgKi9cclxuICAgIFAudG9TdHJpbmcgPSBQLnZhbHVlT2YgPSBQLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIGUgPSB4LmUsXHJcbiAgICAgICAgICAgIHN0ciA9IHguYy5qb2luKCcnKSxcclxuICAgICAgICAgICAgc3RyTCA9IHN0ci5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8vIEV4cG9uZW50aWFsIG5vdGF0aW9uP1xyXG4gICAgICAgIGlmIChlIDw9IEJpZy5FX05FRyB8fCBlID49IEJpZy5FX1BPUykge1xyXG4gICAgICAgICAgICBzdHIgPSBzdHIuY2hhckF0KDApICsgKHN0ckwgPiAxID8gJy4nICsgc3RyLnNsaWNlKDEpIDogJycpICtcclxuICAgICAgICAgICAgICAoZSA8IDAgPyAnZScgOiAnZSsnKSArIGU7XHJcblxyXG4gICAgICAgIC8vIE5lZ2F0aXZlIGV4cG9uZW50P1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZSA8IDApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFByZXBlbmQgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoOyArK2U7IHN0ciA9ICcwJyArIHN0cikge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN0ciA9ICcwLicgKyBzdHI7XHJcblxyXG4gICAgICAgIC8vIFBvc2l0aXZlIGV4cG9uZW50P1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZSA+IDApIHtcclxuXHJcbiAgICAgICAgICAgIGlmICgrK2UgPiBzdHJMKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQXBwZW5kIHplcm9zLlxyXG4gICAgICAgICAgICAgICAgZm9yIChlIC09IHN0ckw7IGUtLSA7IHN0ciArPSAnMCcpIHtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChlIDwgc3RyTCkge1xyXG4gICAgICAgICAgICAgICAgc3RyID0gc3RyLnNsaWNlKDAsIGUpICsgJy4nICsgc3RyLnNsaWNlKGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEV4cG9uZW50IHplcm8uXHJcbiAgICAgICAgfSBlbHNlIGlmIChzdHJMID4gMSkge1xyXG4gICAgICAgICAgICBzdHIgPSBzdHIuY2hhckF0KDApICsgJy4nICsgc3RyLnNsaWNlKDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQXZvaWQgJy0wJ1xyXG4gICAgICAgIHJldHVybiB4LnMgPCAwICYmIHguY1swXSA/ICctJyArIHN0ciA6IHN0cjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgKiBJZiB0b0V4cG9uZW50aWFsLCB0b0ZpeGVkLCB0b1ByZWNpc2lvbiBhbmQgZm9ybWF0IGFyZSBub3QgcmVxdWlyZWQgdGhleVxyXG4gICAgICogY2FuIHNhZmVseSBiZSBjb21tZW50ZWQtb3V0IG9yIGRlbGV0ZWQuIE5vIHJlZHVuZGFudCBjb2RlIHdpbGwgYmUgbGVmdC5cclxuICAgICAqIGZvcm1hdCBpcyB1c2VkIG9ubHkgYnkgdG9FeHBvbmVudGlhbCwgdG9GaXhlZCBhbmQgdG9QcmVjaXNpb24uXHJcbiAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgKi9cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGluIGV4cG9uZW50aWFsXHJcbiAgICAgKiBub3RhdGlvbiB0byBkcCBmaXhlZCBkZWNpbWFsIHBsYWNlcyBhbmQgcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB1c2luZ1xyXG4gICAgICogQmlnLlJNLlxyXG4gICAgICpcclxuICAgICAqIFtkcF0ge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBQLnRvRXhwb25lbnRpYWwgPSBmdW5jdGlvbiAoZHApIHtcclxuXHJcbiAgICAgICAgaWYgKGRwID09IG51bGwpIHtcclxuICAgICAgICAgICAgZHAgPSB0aGlzLmMubGVuZ3RoIC0gMTtcclxuICAgICAgICB9IGVsc2UgaWYgKGRwICE9PSB+fmRwIHx8IGRwIDwgMCB8fCBkcCA+IE1BWF9EUCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXRvRXhwIScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZvcm1hdCh0aGlzLCBkcCwgMSk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaW4gbm9ybWFsIG5vdGF0aW9uXHJcbiAgICAgKiB0byBkcCBmaXhlZCBkZWNpbWFsIHBsYWNlcyBhbmQgcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB1c2luZyBCaWcuUk0uXHJcbiAgICAgKlxyXG4gICAgICogW2RwXSB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKi9cclxuICAgIFAudG9GaXhlZCA9IGZ1bmN0aW9uIChkcCkge1xyXG4gICAgICAgIHZhciBzdHIsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBuZWcgPSBCaWcuRV9ORUcsXHJcbiAgICAgICAgICAgIHBvcyA9IEJpZy5FX1BPUztcclxuXHJcbiAgICAgICAgLy8gUHJldmVudCB0aGUgcG9zc2liaWxpdHkgb2YgZXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICAgICAgQmlnLkVfTkVHID0gLShCaWcuRV9QT1MgPSAxIC8gMCk7XHJcblxyXG4gICAgICAgIGlmIChkcCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IHgudG9TdHJpbmcoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGRwID09PSB+fmRwICYmIGRwID49IDAgJiYgZHAgPD0gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IGZvcm1hdCh4LCB4LmUgKyBkcCk7XHJcblxyXG4gICAgICAgICAgICAvLyAoLTApLnRvRml4ZWQoKSBpcyAnMCcsIGJ1dCAoLTAuMSkudG9GaXhlZCgpIGlzICctMCcuXHJcbiAgICAgICAgICAgIC8vICgtMCkudG9GaXhlZCgxKSBpcyAnMC4wJywgYnV0ICgtMC4wMSkudG9GaXhlZCgxKSBpcyAnLTAuMCcuXHJcbiAgICAgICAgICAgIGlmICh4LnMgPCAwICYmIHguY1swXSAmJiBzdHIuaW5kZXhPZignLScpIDwgMCkge1xyXG4gICAgICAgIC8vRS5nLiAtMC41IGlmIHJvdW5kZWQgdG8gLTAgd2lsbCBjYXVzZSB0b1N0cmluZyB0byBvbWl0IHRoZSBtaW51cyBzaWduLlxyXG4gICAgICAgICAgICAgICAgc3RyID0gJy0nICsgc3RyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEJpZy5FX05FRyA9IG5lZztcclxuICAgICAgICBCaWcuRV9QT1MgPSBwb3M7XHJcblxyXG4gICAgICAgIGlmICghc3RyKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchdG9GaXghJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHJvdW5kZWQgdG8gc2RcclxuICAgICAqIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyBCaWcuUk0uIFVzZSBleHBvbmVudGlhbCBub3RhdGlvbiBpZiBzZCBpcyBsZXNzXHJcbiAgICAgKiB0aGFuIHRoZSBudW1iZXIgb2YgZGlnaXRzIG5lY2Vzc2FyeSB0byByZXByZXNlbnQgdGhlIGludGVnZXIgcGFydCBvZiB0aGVcclxuICAgICAqIHZhbHVlIGluIG5vcm1hbCBub3RhdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBzZCB7bnVtYmVyfSBJbnRlZ2VyLCAxIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKi9cclxuICAgIFAudG9QcmVjaXNpb24gPSBmdW5jdGlvbiAoc2QpIHtcclxuXHJcbiAgICAgICAgaWYgKHNkID09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9TdHJpbmcoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHNkICE9PSB+fnNkIHx8IHNkIDwgMSB8fCBzZCA+IE1BWF9EUCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXRvUHJlIScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZvcm1hdCh0aGlzLCBzZCAtIDEsIDIpO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLy8gRXhwb3J0XHJcblxyXG5cclxuICAgIEJpZyA9IGJpZ0ZhY3RvcnkoKTtcclxuXHJcbiAgICAvL0FNRC5cclxuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcclxuICAgICAgICBkZWZpbmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gQmlnO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIC8vIE5vZGUgYW5kIG90aGVyIENvbW1vbkpTLWxpa2UgZW52aXJvbm1lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cy5cclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcclxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IEJpZztcclxuXHJcbiAgICAvL0Jyb3dzZXIuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGdsb2JhbC5CaWcgPSBCaWc7XHJcbiAgICB9XHJcbn0pKHRoaXMpO1xyXG4iLCJ2YXIgVk5vZGUgPSByZXF1aXJlKCcuL3Zub2RlJyk7XG52YXIgaXMgPSByZXF1aXJlKCcuL2lzJyk7XG5cbmZ1bmN0aW9uIGFkZE5TKGRhdGEsIGNoaWxkcmVuLCBzZWwpIHtcbiAgZGF0YS5ucyA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc7XG5cbiAgaWYgKHNlbCAhPT0gJ2ZvcmVpZ25PYmplY3QnICYmIGNoaWxkcmVuICE9PSB1bmRlZmluZWQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICBhZGROUyhjaGlsZHJlbltpXS5kYXRhLCBjaGlsZHJlbltpXS5jaGlsZHJlbiwgY2hpbGRyZW5baV0uc2VsKTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBoKHNlbCwgYiwgYykge1xuICB2YXIgZGF0YSA9IHt9LCBjaGlsZHJlbiwgdGV4dCwgaTtcbiAgaWYgKGMgIT09IHVuZGVmaW5lZCkge1xuICAgIGRhdGEgPSBiO1xuICAgIGlmIChpcy5hcnJheShjKSkgeyBjaGlsZHJlbiA9IGM7IH1cbiAgICBlbHNlIGlmIChpcy5wcmltaXRpdmUoYykpIHsgdGV4dCA9IGM7IH1cbiAgfSBlbHNlIGlmIChiICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAoaXMuYXJyYXkoYikpIHsgY2hpbGRyZW4gPSBiOyB9XG4gICAgZWxzZSBpZiAoaXMucHJpbWl0aXZlKGIpKSB7IHRleHQgPSBiOyB9XG4gICAgZWxzZSB7IGRhdGEgPSBiOyB9XG4gIH1cbiAgaWYgKGlzLmFycmF5KGNoaWxkcmVuKSkge1xuICAgIGZvciAoaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgaWYgKGlzLnByaW1pdGl2ZShjaGlsZHJlbltpXSkpIGNoaWxkcmVuW2ldID0gVk5vZGUodW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgY2hpbGRyZW5baV0pO1xuICAgIH1cbiAgfVxuICBpZiAoc2VsWzBdID09PSAncycgJiYgc2VsWzFdID09PSAndicgJiYgc2VsWzJdID09PSAnZycpIHtcbiAgICBhZGROUyhkYXRhLCBjaGlsZHJlbiwgc2VsKTtcbiAgfVxuICByZXR1cm4gVk5vZGUoc2VsLCBkYXRhLCBjaGlsZHJlbiwgdGV4dCwgdW5kZWZpbmVkKTtcbn07XG4iLCJmdW5jdGlvbiBjcmVhdGVFbGVtZW50KHRhZ05hbWUpe1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWdOYW1lKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlRWxlbWVudE5TKG5hbWVzcGFjZVVSSSwgcXVhbGlmaWVkTmFtZSl7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmFtZXNwYWNlVVJJLCBxdWFsaWZpZWROYW1lKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlVGV4dE5vZGUodGV4dCl7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0KTtcbn1cblxuXG5mdW5jdGlvbiBpbnNlcnRCZWZvcmUocGFyZW50Tm9kZSwgbmV3Tm9kZSwgcmVmZXJlbmNlTm9kZSl7XG4gIHBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5ld05vZGUsIHJlZmVyZW5jZU5vZGUpO1xufVxuXG5cbmZ1bmN0aW9uIHJlbW92ZUNoaWxkKG5vZGUsIGNoaWxkKXtcbiAgbm9kZS5yZW1vdmVDaGlsZChjaGlsZCk7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZENoaWxkKG5vZGUsIGNoaWxkKXtcbiAgbm9kZS5hcHBlbmRDaGlsZChjaGlsZCk7XG59XG5cbmZ1bmN0aW9uIHBhcmVudE5vZGUobm9kZSl7XG4gIHJldHVybiBub2RlLnBhcmVudEVsZW1lbnQ7XG59XG5cbmZ1bmN0aW9uIG5leHRTaWJsaW5nKG5vZGUpe1xuICByZXR1cm4gbm9kZS5uZXh0U2libGluZztcbn1cblxuZnVuY3Rpb24gdGFnTmFtZShub2RlKXtcbiAgcmV0dXJuIG5vZGUudGFnTmFtZTtcbn1cblxuZnVuY3Rpb24gc2V0VGV4dENvbnRlbnQobm9kZSwgdGV4dCl7XG4gIG5vZGUudGV4dENvbnRlbnQgPSB0ZXh0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlRWxlbWVudDogY3JlYXRlRWxlbWVudCxcbiAgY3JlYXRlRWxlbWVudE5TOiBjcmVhdGVFbGVtZW50TlMsXG4gIGNyZWF0ZVRleHROb2RlOiBjcmVhdGVUZXh0Tm9kZSxcbiAgYXBwZW5kQ2hpbGQ6IGFwcGVuZENoaWxkLFxuICByZW1vdmVDaGlsZDogcmVtb3ZlQ2hpbGQsXG4gIGluc2VydEJlZm9yZTogaW5zZXJ0QmVmb3JlLFxuICBwYXJlbnROb2RlOiBwYXJlbnROb2RlLFxuICBuZXh0U2libGluZzogbmV4dFNpYmxpbmcsXG4gIHRhZ05hbWU6IHRhZ05hbWUsXG4gIHNldFRleHRDb250ZW50OiBzZXRUZXh0Q29udGVudFxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBhcnJheTogQXJyYXkuaXNBcnJheSxcbiAgcHJpbWl0aXZlOiBmdW5jdGlvbihzKSB7IHJldHVybiB0eXBlb2YgcyA9PT0gJ3N0cmluZycgfHwgdHlwZW9mIHMgPT09ICdudW1iZXInOyB9LFxufTtcbiIsInZhciBOYW1lc3BhY2VVUklzID0ge1xuICBcInhsaW5rXCI6IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiXG59O1xuXG52YXIgYm9vbGVhbkF0dHJzID0gW1wiYWxsb3dmdWxsc2NyZWVuXCIsIFwiYXN5bmNcIiwgXCJhdXRvZm9jdXNcIiwgXCJhdXRvcGxheVwiLCBcImNoZWNrZWRcIiwgXCJjb21wYWN0XCIsIFwiY29udHJvbHNcIiwgXCJkZWNsYXJlXCIsXG4gICAgICAgICAgICAgICAgXCJkZWZhdWx0XCIsIFwiZGVmYXVsdGNoZWNrZWRcIiwgXCJkZWZhdWx0bXV0ZWRcIiwgXCJkZWZhdWx0c2VsZWN0ZWRcIiwgXCJkZWZlclwiLCBcImRpc2FibGVkXCIsIFwiZHJhZ2dhYmxlXCIsXG4gICAgICAgICAgICAgICAgXCJlbmFibGVkXCIsIFwiZm9ybW5vdmFsaWRhdGVcIiwgXCJoaWRkZW5cIiwgXCJpbmRldGVybWluYXRlXCIsIFwiaW5lcnRcIiwgXCJpc21hcFwiLCBcIml0ZW1zY29wZVwiLCBcImxvb3BcIiwgXCJtdWx0aXBsZVwiLFxuICAgICAgICAgICAgICAgIFwibXV0ZWRcIiwgXCJub2hyZWZcIiwgXCJub3Jlc2l6ZVwiLCBcIm5vc2hhZGVcIiwgXCJub3ZhbGlkYXRlXCIsIFwibm93cmFwXCIsIFwib3BlblwiLCBcInBhdXNlb25leGl0XCIsIFwicmVhZG9ubHlcIixcbiAgICAgICAgICAgICAgICBcInJlcXVpcmVkXCIsIFwicmV2ZXJzZWRcIiwgXCJzY29wZWRcIiwgXCJzZWFtbGVzc1wiLCBcInNlbGVjdGVkXCIsIFwic29ydGFibGVcIiwgXCJzcGVsbGNoZWNrXCIsIFwidHJhbnNsYXRlXCIsXG4gICAgICAgICAgICAgICAgXCJ0cnVlc3BlZWRcIiwgXCJ0eXBlbXVzdG1hdGNoXCIsIFwidmlzaWJsZVwiXTtcblxudmFyIGJvb2xlYW5BdHRyc0RpY3QgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuZm9yKHZhciBpPTAsIGxlbiA9IGJvb2xlYW5BdHRycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICBib29sZWFuQXR0cnNEaWN0W2Jvb2xlYW5BdHRyc1tpXV0gPSB0cnVlO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVBdHRycyhvbGRWbm9kZSwgdm5vZGUpIHtcbiAgdmFyIGtleSwgY3VyLCBvbGQsIGVsbSA9IHZub2RlLmVsbSxcbiAgICAgIG9sZEF0dHJzID0gb2xkVm5vZGUuZGF0YS5hdHRycywgYXR0cnMgPSB2bm9kZS5kYXRhLmF0dHJzLCBuYW1lc3BhY2VTcGxpdDtcblxuICBpZiAoIW9sZEF0dHJzICYmICFhdHRycykgcmV0dXJuO1xuICBvbGRBdHRycyA9IG9sZEF0dHJzIHx8IHt9O1xuICBhdHRycyA9IGF0dHJzIHx8IHt9O1xuXG4gIC8vIHVwZGF0ZSBtb2RpZmllZCBhdHRyaWJ1dGVzLCBhZGQgbmV3IGF0dHJpYnV0ZXNcbiAgZm9yIChrZXkgaW4gYXR0cnMpIHtcbiAgICBjdXIgPSBhdHRyc1trZXldO1xuICAgIG9sZCA9IG9sZEF0dHJzW2tleV07XG4gICAgaWYgKG9sZCAhPT0gY3VyKSB7XG4gICAgICBpZighY3VyICYmIGJvb2xlYW5BdHRyc0RpY3Rba2V5XSlcbiAgICAgICAgZWxtLnJlbW92ZUF0dHJpYnV0ZShrZXkpO1xuICAgICAgZWxzZSB7XG4gICAgICAgIG5hbWVzcGFjZVNwbGl0ID0ga2V5LnNwbGl0KFwiOlwiKTtcbiAgICAgICAgaWYobmFtZXNwYWNlU3BsaXQubGVuZ3RoID4gMSAmJiBOYW1lc3BhY2VVUklzLmhhc093blByb3BlcnR5KG5hbWVzcGFjZVNwbGl0WzBdKSlcbiAgICAgICAgICBlbG0uc2V0QXR0cmlidXRlTlMoTmFtZXNwYWNlVVJJc1tuYW1lc3BhY2VTcGxpdFswXV0sIGtleSwgY3VyKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGVsbS5zZXRBdHRyaWJ1dGUoa2V5LCBjdXIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAvL3JlbW92ZSByZW1vdmVkIGF0dHJpYnV0ZXNcbiAgLy8gdXNlIGBpbmAgb3BlcmF0b3Igc2luY2UgdGhlIHByZXZpb3VzIGBmb3JgIGl0ZXJhdGlvbiB1c2VzIGl0ICguaS5lLiBhZGQgZXZlbiBhdHRyaWJ1dGVzIHdpdGggdW5kZWZpbmVkIHZhbHVlKVxuICAvLyB0aGUgb3RoZXIgb3B0aW9uIGlzIHRvIHJlbW92ZSBhbGwgYXR0cmlidXRlcyB3aXRoIHZhbHVlID09IHVuZGVmaW5lZFxuICBmb3IgKGtleSBpbiBvbGRBdHRycykge1xuICAgIGlmICghKGtleSBpbiBhdHRycykpIHtcbiAgICAgIGVsbS5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7Y3JlYXRlOiB1cGRhdGVBdHRycywgdXBkYXRlOiB1cGRhdGVBdHRyc307XG4iLCJmdW5jdGlvbiB1cGRhdGVDbGFzcyhvbGRWbm9kZSwgdm5vZGUpIHtcbiAgdmFyIGN1ciwgbmFtZSwgZWxtID0gdm5vZGUuZWxtLFxuICAgICAgb2xkQ2xhc3MgPSBvbGRWbm9kZS5kYXRhLmNsYXNzLFxuICAgICAga2xhc3MgPSB2bm9kZS5kYXRhLmNsYXNzO1xuXG4gIGlmICghb2xkQ2xhc3MgJiYgIWtsYXNzKSByZXR1cm47XG4gIG9sZENsYXNzID0gb2xkQ2xhc3MgfHwge307XG4gIGtsYXNzID0ga2xhc3MgfHwge307XG5cbiAgZm9yIChuYW1lIGluIG9sZENsYXNzKSB7XG4gICAgaWYgKCFrbGFzc1tuYW1lXSkge1xuICAgICAgZWxtLmNsYXNzTGlzdC5yZW1vdmUobmFtZSk7XG4gICAgfVxuICB9XG4gIGZvciAobmFtZSBpbiBrbGFzcykge1xuICAgIGN1ciA9IGtsYXNzW25hbWVdO1xuICAgIGlmIChjdXIgIT09IG9sZENsYXNzW25hbWVdKSB7XG4gICAgICBlbG0uY2xhc3NMaXN0W2N1ciA/ICdhZGQnIDogJ3JlbW92ZSddKG5hbWUpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtjcmVhdGU6IHVwZGF0ZUNsYXNzLCB1cGRhdGU6IHVwZGF0ZUNsYXNzfTtcbiIsImZ1bmN0aW9uIGludm9rZUhhbmRsZXIoaGFuZGxlciwgdm5vZGUsIGV2ZW50KSB7XG4gIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgLy8gY2FsbCBmdW5jdGlvbiBoYW5kbGVyXG4gICAgaGFuZGxlci5jYWxsKHZub2RlLCBldmVudCwgdm5vZGUpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcIm9iamVjdFwiKSB7XG4gICAgLy8gY2FsbCBoYW5kbGVyIHdpdGggYXJndW1lbnRzXG4gICAgaWYgKHR5cGVvZiBoYW5kbGVyWzBdID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIC8vIHNwZWNpYWwgY2FzZSBmb3Igc2luZ2xlIGFyZ3VtZW50IGZvciBwZXJmb3JtYW5jZVxuICAgICAgaWYgKGhhbmRsZXIubGVuZ3RoID09PSAyKSB7XG4gICAgICAgIGhhbmRsZXJbMF0uY2FsbCh2bm9kZSwgaGFuZGxlclsxXSwgZXZlbnQsIHZub2RlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBhcmdzID0gaGFuZGxlci5zbGljZSgxKTtcbiAgICAgICAgYXJncy5wdXNoKGV2ZW50KTtcbiAgICAgICAgYXJncy5wdXNoKHZub2RlKTtcbiAgICAgICAgaGFuZGxlclswXS5hcHBseSh2bm9kZSwgYXJncyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGNhbGwgbXVsdGlwbGUgaGFuZGxlcnNcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaGFuZGxlci5sZW5ndGg7IGkrKykge1xuICAgICAgICBpbnZva2VIYW5kbGVyKGhhbmRsZXJbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBoYW5kbGVFdmVudChldmVudCwgdm5vZGUpIHtcbiAgdmFyIG5hbWUgPSBldmVudC50eXBlLFxuICAgICAgb24gPSB2bm9kZS5kYXRhLm9uO1xuXG4gIC8vIGNhbGwgZXZlbnQgaGFuZGxlcihzKSBpZiBleGlzdHNcbiAgaWYgKG9uICYmIG9uW25hbWVdKSB7XG4gICAgaW52b2tlSGFuZGxlcihvbltuYW1lXSwgdm5vZGUsIGV2ZW50KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVMaXN0ZW5lcigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIGhhbmRsZXIoZXZlbnQpIHtcbiAgICBoYW5kbGVFdmVudChldmVudCwgaGFuZGxlci52bm9kZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlRXZlbnRMaXN0ZW5lcnMob2xkVm5vZGUsIHZub2RlKSB7XG4gIHZhciBvbGRPbiA9IG9sZFZub2RlLmRhdGEub24sXG4gICAgICBvbGRMaXN0ZW5lciA9IG9sZFZub2RlLmxpc3RlbmVyLFxuICAgICAgb2xkRWxtID0gb2xkVm5vZGUuZWxtLFxuICAgICAgb24gPSB2bm9kZSAmJiB2bm9kZS5kYXRhLm9uLFxuICAgICAgZWxtID0gdm5vZGUgJiYgdm5vZGUuZWxtLFxuICAgICAgbmFtZTtcblxuICAvLyBvcHRpbWl6YXRpb24gZm9yIHJldXNlZCBpbW11dGFibGUgaGFuZGxlcnNcbiAgaWYgKG9sZE9uID09PSBvbikge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIHJlbW92ZSBleGlzdGluZyBsaXN0ZW5lcnMgd2hpY2ggbm8gbG9uZ2VyIHVzZWRcbiAgaWYgKG9sZE9uICYmIG9sZExpc3RlbmVyKSB7XG4gICAgLy8gaWYgZWxlbWVudCBjaGFuZ2VkIG9yIGRlbGV0ZWQgd2UgcmVtb3ZlIGFsbCBleGlzdGluZyBsaXN0ZW5lcnMgdW5jb25kaXRpb25hbGx5XG4gICAgaWYgKCFvbikge1xuICAgICAgZm9yIChuYW1lIGluIG9sZE9uKSB7XG4gICAgICAgIC8vIHJlbW92ZSBsaXN0ZW5lciBpZiBlbGVtZW50IHdhcyBjaGFuZ2VkIG9yIGV4aXN0aW5nIGxpc3RlbmVycyByZW1vdmVkXG4gICAgICAgIG9sZEVsbS5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIG9sZExpc3RlbmVyLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAobmFtZSBpbiBvbGRPbikge1xuICAgICAgICAvLyByZW1vdmUgbGlzdGVuZXIgaWYgZXhpc3RpbmcgbGlzdGVuZXIgcmVtb3ZlZFxuICAgICAgICBpZiAoIW9uW25hbWVdKSB7XG4gICAgICAgICAgb2xkRWxtLnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgb2xkTGlzdGVuZXIsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIGFkZCBuZXcgbGlzdGVuZXJzIHdoaWNoIGhhcyBub3QgYWxyZWFkeSBhdHRhY2hlZFxuICBpZiAob24pIHtcbiAgICAvLyByZXVzZSBleGlzdGluZyBsaXN0ZW5lciBvciBjcmVhdGUgbmV3XG4gICAgdmFyIGxpc3RlbmVyID0gdm5vZGUubGlzdGVuZXIgPSBvbGRWbm9kZS5saXN0ZW5lciB8fCBjcmVhdGVMaXN0ZW5lcigpO1xuICAgIC8vIHVwZGF0ZSB2bm9kZSBmb3IgbGlzdGVuZXJcbiAgICBsaXN0ZW5lci52bm9kZSA9IHZub2RlO1xuXG4gICAgLy8gaWYgZWxlbWVudCBjaGFuZ2VkIG9yIGFkZGVkIHdlIGFkZCBhbGwgbmVlZGVkIGxpc3RlbmVycyB1bmNvbmRpdGlvbmFsbHlcbiAgICBpZiAoIW9sZE9uKSB7XG4gICAgICBmb3IgKG5hbWUgaW4gb24pIHtcbiAgICAgICAgLy8gYWRkIGxpc3RlbmVyIGlmIGVsZW1lbnQgd2FzIGNoYW5nZWQgb3IgbmV3IGxpc3RlbmVycyBhZGRlZFxuICAgICAgICBlbG0uYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBsaXN0ZW5lciwgZmFsc2UpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKG5hbWUgaW4gb24pIHtcbiAgICAgICAgLy8gYWRkIGxpc3RlbmVyIGlmIG5ldyBsaXN0ZW5lciBhZGRlZFxuICAgICAgICBpZiAoIW9sZE9uW25hbWVdKSB7XG4gICAgICAgICAgZWxtLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgbGlzdGVuZXIsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiB1cGRhdGVFdmVudExpc3RlbmVycyxcbiAgdXBkYXRlOiB1cGRhdGVFdmVudExpc3RlbmVycyxcbiAgZGVzdHJveTogdXBkYXRlRXZlbnRMaXN0ZW5lcnNcbn07XG4iLCJmdW5jdGlvbiB1cGRhdGVQcm9wcyhvbGRWbm9kZSwgdm5vZGUpIHtcbiAgdmFyIGtleSwgY3VyLCBvbGQsIGVsbSA9IHZub2RlLmVsbSxcbiAgICAgIG9sZFByb3BzID0gb2xkVm5vZGUuZGF0YS5wcm9wcywgcHJvcHMgPSB2bm9kZS5kYXRhLnByb3BzO1xuXG4gIGlmICghb2xkUHJvcHMgJiYgIXByb3BzKSByZXR1cm47XG4gIG9sZFByb3BzID0gb2xkUHJvcHMgfHwge307XG4gIHByb3BzID0gcHJvcHMgfHwge307XG5cbiAgZm9yIChrZXkgaW4gb2xkUHJvcHMpIHtcbiAgICBpZiAoIXByb3BzW2tleV0pIHtcbiAgICAgIGRlbGV0ZSBlbG1ba2V5XTtcbiAgICB9XG4gIH1cbiAgZm9yIChrZXkgaW4gcHJvcHMpIHtcbiAgICBjdXIgPSBwcm9wc1trZXldO1xuICAgIG9sZCA9IG9sZFByb3BzW2tleV07XG4gICAgaWYgKG9sZCAhPT0gY3VyICYmIChrZXkgIT09ICd2YWx1ZScgfHwgZWxtW2tleV0gIT09IGN1cikpIHtcbiAgICAgIGVsbVtrZXldID0gY3VyO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtjcmVhdGU6IHVwZGF0ZVByb3BzLCB1cGRhdGU6IHVwZGF0ZVByb3BzfTtcbiIsInZhciByYWYgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkgfHwgc2V0VGltZW91dDtcbnZhciBuZXh0RnJhbWUgPSBmdW5jdGlvbihmbikgeyByYWYoZnVuY3Rpb24oKSB7IHJhZihmbik7IH0pOyB9O1xuXG5mdW5jdGlvbiBzZXROZXh0RnJhbWUob2JqLCBwcm9wLCB2YWwpIHtcbiAgbmV4dEZyYW1lKGZ1bmN0aW9uKCkgeyBvYmpbcHJvcF0gPSB2YWw7IH0pO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVTdHlsZShvbGRWbm9kZSwgdm5vZGUpIHtcbiAgdmFyIGN1ciwgbmFtZSwgZWxtID0gdm5vZGUuZWxtLFxuICAgICAgb2xkU3R5bGUgPSBvbGRWbm9kZS5kYXRhLnN0eWxlLFxuICAgICAgc3R5bGUgPSB2bm9kZS5kYXRhLnN0eWxlO1xuXG4gIGlmICghb2xkU3R5bGUgJiYgIXN0eWxlKSByZXR1cm47XG4gIG9sZFN0eWxlID0gb2xkU3R5bGUgfHwge307XG4gIHN0eWxlID0gc3R5bGUgfHwge307XG4gIHZhciBvbGRIYXNEZWwgPSAnZGVsYXllZCcgaW4gb2xkU3R5bGU7XG5cbiAgZm9yIChuYW1lIGluIG9sZFN0eWxlKSB7XG4gICAgaWYgKCFzdHlsZVtuYW1lXSkge1xuICAgICAgZWxtLnN0eWxlW25hbWVdID0gJyc7XG4gICAgfVxuICB9XG4gIGZvciAobmFtZSBpbiBzdHlsZSkge1xuICAgIGN1ciA9IHN0eWxlW25hbWVdO1xuICAgIGlmIChuYW1lID09PSAnZGVsYXllZCcpIHtcbiAgICAgIGZvciAobmFtZSBpbiBzdHlsZS5kZWxheWVkKSB7XG4gICAgICAgIGN1ciA9IHN0eWxlLmRlbGF5ZWRbbmFtZV07XG4gICAgICAgIGlmICghb2xkSGFzRGVsIHx8IGN1ciAhPT0gb2xkU3R5bGUuZGVsYXllZFtuYW1lXSkge1xuICAgICAgICAgIHNldE5leHRGcmFtZShlbG0uc3R5bGUsIG5hbWUsIGN1cik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG5hbWUgIT09ICdyZW1vdmUnICYmIGN1ciAhPT0gb2xkU3R5bGVbbmFtZV0pIHtcbiAgICAgIGVsbS5zdHlsZVtuYW1lXSA9IGN1cjtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYXBwbHlEZXN0cm95U3R5bGUodm5vZGUpIHtcbiAgdmFyIHN0eWxlLCBuYW1lLCBlbG0gPSB2bm9kZS5lbG0sIHMgPSB2bm9kZS5kYXRhLnN0eWxlO1xuICBpZiAoIXMgfHwgIShzdHlsZSA9IHMuZGVzdHJveSkpIHJldHVybjtcbiAgZm9yIChuYW1lIGluIHN0eWxlKSB7XG4gICAgZWxtLnN0eWxlW25hbWVdID0gc3R5bGVbbmFtZV07XG4gIH1cbn1cblxuZnVuY3Rpb24gYXBwbHlSZW1vdmVTdHlsZSh2bm9kZSwgcm0pIHtcbiAgdmFyIHMgPSB2bm9kZS5kYXRhLnN0eWxlO1xuICBpZiAoIXMgfHwgIXMucmVtb3ZlKSB7XG4gICAgcm0oKTtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG5hbWUsIGVsbSA9IHZub2RlLmVsbSwgaWR4LCBpID0gMCwgbWF4RHVyID0gMCxcbiAgICAgIGNvbXBTdHlsZSwgc3R5bGUgPSBzLnJlbW92ZSwgYW1vdW50ID0gMCwgYXBwbGllZCA9IFtdO1xuICBmb3IgKG5hbWUgaW4gc3R5bGUpIHtcbiAgICBhcHBsaWVkLnB1c2gobmFtZSk7XG4gICAgZWxtLnN0eWxlW25hbWVdID0gc3R5bGVbbmFtZV07XG4gIH1cbiAgY29tcFN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbG0pO1xuICB2YXIgcHJvcHMgPSBjb21wU3R5bGVbJ3RyYW5zaXRpb24tcHJvcGVydHknXS5zcGxpdCgnLCAnKTtcbiAgZm9yICg7IGkgPCBwcm9wcy5sZW5ndGg7ICsraSkge1xuICAgIGlmKGFwcGxpZWQuaW5kZXhPZihwcm9wc1tpXSkgIT09IC0xKSBhbW91bnQrKztcbiAgfVxuICBlbG0uYWRkRXZlbnRMaXN0ZW5lcigndHJhbnNpdGlvbmVuZCcsIGZ1bmN0aW9uKGV2KSB7XG4gICAgaWYgKGV2LnRhcmdldCA9PT0gZWxtKSAtLWFtb3VudDtcbiAgICBpZiAoYW1vdW50ID09PSAwKSBybSgpO1xuICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7Y3JlYXRlOiB1cGRhdGVTdHlsZSwgdXBkYXRlOiB1cGRhdGVTdHlsZSwgZGVzdHJveTogYXBwbHlEZXN0cm95U3R5bGUsIHJlbW92ZTogYXBwbHlSZW1vdmVTdHlsZX07XG4iLCIvLyBqc2hpbnQgbmV3Y2FwOiBmYWxzZVxuLyogZ2xvYmFsIHJlcXVpcmUsIG1vZHVsZSwgZG9jdW1lbnQsIE5vZGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIFZOb2RlID0gcmVxdWlyZSgnLi92bm9kZScpO1xudmFyIGlzID0gcmVxdWlyZSgnLi9pcycpO1xudmFyIGRvbUFwaSA9IHJlcXVpcmUoJy4vaHRtbGRvbWFwaScpO1xuXG5mdW5jdGlvbiBpc1VuZGVmKHMpIHsgcmV0dXJuIHMgPT09IHVuZGVmaW5lZDsgfVxuZnVuY3Rpb24gaXNEZWYocykgeyByZXR1cm4gcyAhPT0gdW5kZWZpbmVkOyB9XG5cbnZhciBlbXB0eU5vZGUgPSBWTm9kZSgnJywge30sIFtdLCB1bmRlZmluZWQsIHVuZGVmaW5lZCk7XG5cbmZ1bmN0aW9uIHNhbWVWbm9kZSh2bm9kZTEsIHZub2RlMikge1xuICByZXR1cm4gdm5vZGUxLmtleSA9PT0gdm5vZGUyLmtleSAmJiB2bm9kZTEuc2VsID09PSB2bm9kZTIuc2VsO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVLZXlUb09sZElkeChjaGlsZHJlbiwgYmVnaW5JZHgsIGVuZElkeCkge1xuICB2YXIgaSwgbWFwID0ge30sIGtleTtcbiAgZm9yIChpID0gYmVnaW5JZHg7IGkgPD0gZW5kSWR4OyArK2kpIHtcbiAgICBrZXkgPSBjaGlsZHJlbltpXS5rZXk7XG4gICAgaWYgKGlzRGVmKGtleSkpIG1hcFtrZXldID0gaTtcbiAgfVxuICByZXR1cm4gbWFwO1xufVxuXG52YXIgaG9va3MgPSBbJ2NyZWF0ZScsICd1cGRhdGUnLCAncmVtb3ZlJywgJ2Rlc3Ryb3knLCAncHJlJywgJ3Bvc3QnXTtcblxuZnVuY3Rpb24gaW5pdChtb2R1bGVzLCBhcGkpIHtcbiAgdmFyIGksIGosIGNicyA9IHt9O1xuXG4gIGlmIChpc1VuZGVmKGFwaSkpIGFwaSA9IGRvbUFwaTtcblxuICBmb3IgKGkgPSAwOyBpIDwgaG9va3MubGVuZ3RoOyArK2kpIHtcbiAgICBjYnNbaG9va3NbaV1dID0gW107XG4gICAgZm9yIChqID0gMDsgaiA8IG1vZHVsZXMubGVuZ3RoOyArK2opIHtcbiAgICAgIGlmIChtb2R1bGVzW2pdW2hvb2tzW2ldXSAhPT0gdW5kZWZpbmVkKSBjYnNbaG9va3NbaV1dLnB1c2gobW9kdWxlc1tqXVtob29rc1tpXV0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGVtcHR5Tm9kZUF0KGVsbSkge1xuICAgIHZhciBpZCA9IGVsbS5pZCA/ICcjJyArIGVsbS5pZCA6ICcnO1xuICAgIHZhciBjID0gZWxtLmNsYXNzTmFtZSA/ICcuJyArIGVsbS5jbGFzc05hbWUuc3BsaXQoJyAnKS5qb2luKCcuJykgOiAnJztcbiAgICByZXR1cm4gVk5vZGUoYXBpLnRhZ05hbWUoZWxtKS50b0xvd2VyQ2FzZSgpICsgaWQgKyBjLCB7fSwgW10sIHVuZGVmaW5lZCwgZWxtKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVJtQ2IoY2hpbGRFbG0sIGxpc3RlbmVycykge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgtLWxpc3RlbmVycyA9PT0gMCkge1xuICAgICAgICB2YXIgcGFyZW50ID0gYXBpLnBhcmVudE5vZGUoY2hpbGRFbG0pO1xuICAgICAgICBhcGkucmVtb3ZlQ2hpbGQocGFyZW50LCBjaGlsZEVsbSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUVsbSh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSB7XG4gICAgdmFyIGksIGRhdGEgPSB2bm9kZS5kYXRhO1xuICAgIGlmIChpc0RlZihkYXRhKSkge1xuICAgICAgaWYgKGlzRGVmKGkgPSBkYXRhLmhvb2spICYmIGlzRGVmKGkgPSBpLmluaXQpKSB7XG4gICAgICAgIGkodm5vZGUpO1xuICAgICAgICBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIGVsbSwgY2hpbGRyZW4gPSB2bm9kZS5jaGlsZHJlbiwgc2VsID0gdm5vZGUuc2VsO1xuICAgIGlmIChpc0RlZihzZWwpKSB7XG4gICAgICAvLyBQYXJzZSBzZWxlY3RvclxuICAgICAgdmFyIGhhc2hJZHggPSBzZWwuaW5kZXhPZignIycpO1xuICAgICAgdmFyIGRvdElkeCA9IHNlbC5pbmRleE9mKCcuJywgaGFzaElkeCk7XG4gICAgICB2YXIgaGFzaCA9IGhhc2hJZHggPiAwID8gaGFzaElkeCA6IHNlbC5sZW5ndGg7XG4gICAgICB2YXIgZG90ID0gZG90SWR4ID4gMCA/IGRvdElkeCA6IHNlbC5sZW5ndGg7XG4gICAgICB2YXIgdGFnID0gaGFzaElkeCAhPT0gLTEgfHwgZG90SWR4ICE9PSAtMSA/IHNlbC5zbGljZSgwLCBNYXRoLm1pbihoYXNoLCBkb3QpKSA6IHNlbDtcbiAgICAgIGVsbSA9IHZub2RlLmVsbSA9IGlzRGVmKGRhdGEpICYmIGlzRGVmKGkgPSBkYXRhLm5zKSA/IGFwaS5jcmVhdGVFbGVtZW50TlMoaSwgdGFnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogYXBpLmNyZWF0ZUVsZW1lbnQodGFnKTtcbiAgICAgIGlmIChoYXNoIDwgZG90KSBlbG0uaWQgPSBzZWwuc2xpY2UoaGFzaCArIDEsIGRvdCk7XG4gICAgICBpZiAoZG90SWR4ID4gMCkgZWxtLmNsYXNzTmFtZSA9IHNlbC5zbGljZShkb3QgKyAxKS5yZXBsYWNlKC9cXC4vZywgJyAnKTtcbiAgICAgIGlmIChpcy5hcnJheShjaGlsZHJlbikpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgYXBpLmFwcGVuZENoaWxkKGVsbSwgY3JlYXRlRWxtKGNoaWxkcmVuW2ldLCBpbnNlcnRlZFZub2RlUXVldWUpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChpcy5wcmltaXRpdmUodm5vZGUudGV4dCkpIHtcbiAgICAgICAgYXBpLmFwcGVuZENoaWxkKGVsbSwgYXBpLmNyZWF0ZVRleHROb2RlKHZub2RlLnRleHQpKTtcbiAgICAgIH1cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMuY3JlYXRlLmxlbmd0aDsgKytpKSBjYnMuY3JlYXRlW2ldKGVtcHR5Tm9kZSwgdm5vZGUpO1xuICAgICAgaSA9IHZub2RlLmRhdGEuaG9vazsgLy8gUmV1c2UgdmFyaWFibGVcbiAgICAgIGlmIChpc0RlZihpKSkge1xuICAgICAgICBpZiAoaS5jcmVhdGUpIGkuY3JlYXRlKGVtcHR5Tm9kZSwgdm5vZGUpO1xuICAgICAgICBpZiAoaS5pbnNlcnQpIGluc2VydGVkVm5vZGVRdWV1ZS5wdXNoKHZub2RlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZWxtID0gdm5vZGUuZWxtID0gYXBpLmNyZWF0ZVRleHROb2RlKHZub2RlLnRleHQpO1xuICAgIH1cbiAgICByZXR1cm4gdm5vZGUuZWxtO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkVm5vZGVzKHBhcmVudEVsbSwgYmVmb3JlLCB2bm9kZXMsIHN0YXJ0SWR4LCBlbmRJZHgsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgIGZvciAoOyBzdGFydElkeCA8PSBlbmRJZHg7ICsrc3RhcnRJZHgpIHtcbiAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBjcmVhdGVFbG0odm5vZGVzW3N0YXJ0SWR4XSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKSwgYmVmb3JlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbnZva2VEZXN0cm95SG9vayh2bm9kZSkge1xuICAgIHZhciBpLCBqLCBkYXRhID0gdm5vZGUuZGF0YTtcbiAgICBpZiAoaXNEZWYoZGF0YSkpIHtcbiAgICAgIGlmIChpc0RlZihpID0gZGF0YS5ob29rKSAmJiBpc0RlZihpID0gaS5kZXN0cm95KSkgaSh2bm9kZSk7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLmRlc3Ryb3kubGVuZ3RoOyArK2kpIGNicy5kZXN0cm95W2ldKHZub2RlKTtcbiAgICAgIGlmIChpc0RlZihpID0gdm5vZGUuY2hpbGRyZW4pKSB7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCB2bm9kZS5jaGlsZHJlbi5sZW5ndGg7ICsraikge1xuICAgICAgICAgIGludm9rZURlc3Ryb3lIb29rKHZub2RlLmNoaWxkcmVuW2pdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbW92ZVZub2RlcyhwYXJlbnRFbG0sIHZub2Rlcywgc3RhcnRJZHgsIGVuZElkeCkge1xuICAgIGZvciAoOyBzdGFydElkeCA8PSBlbmRJZHg7ICsrc3RhcnRJZHgpIHtcbiAgICAgIHZhciBpLCBsaXN0ZW5lcnMsIHJtLCBjaCA9IHZub2Rlc1tzdGFydElkeF07XG4gICAgICBpZiAoaXNEZWYoY2gpKSB7XG4gICAgICAgIGlmIChpc0RlZihjaC5zZWwpKSB7XG4gICAgICAgICAgaW52b2tlRGVzdHJveUhvb2soY2gpO1xuICAgICAgICAgIGxpc3RlbmVycyA9IGNicy5yZW1vdmUubGVuZ3RoICsgMTtcbiAgICAgICAgICBybSA9IGNyZWF0ZVJtQ2IoY2guZWxtLCBsaXN0ZW5lcnMpO1xuICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBjYnMucmVtb3ZlLmxlbmd0aDsgKytpKSBjYnMucmVtb3ZlW2ldKGNoLCBybSk7XG4gICAgICAgICAgaWYgKGlzRGVmKGkgPSBjaC5kYXRhKSAmJiBpc0RlZihpID0gaS5ob29rKSAmJiBpc0RlZihpID0gaS5yZW1vdmUpKSB7XG4gICAgICAgICAgICBpKGNoLCBybSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJtKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgeyAvLyBUZXh0IG5vZGVcbiAgICAgICAgICBhcGkucmVtb3ZlQ2hpbGQocGFyZW50RWxtLCBjaC5lbG0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlQ2hpbGRyZW4ocGFyZW50RWxtLCBvbGRDaCwgbmV3Q2gsIGluc2VydGVkVm5vZGVRdWV1ZSkge1xuICAgIHZhciBvbGRTdGFydElkeCA9IDAsIG5ld1N0YXJ0SWR4ID0gMDtcbiAgICB2YXIgb2xkRW5kSWR4ID0gb2xkQ2gubGVuZ3RoIC0gMTtcbiAgICB2YXIgb2xkU3RhcnRWbm9kZSA9IG9sZENoWzBdO1xuICAgIHZhciBvbGRFbmRWbm9kZSA9IG9sZENoW29sZEVuZElkeF07XG4gICAgdmFyIG5ld0VuZElkeCA9IG5ld0NoLmxlbmd0aCAtIDE7XG4gICAgdmFyIG5ld1N0YXJ0Vm5vZGUgPSBuZXdDaFswXTtcbiAgICB2YXIgbmV3RW5kVm5vZGUgPSBuZXdDaFtuZXdFbmRJZHhdO1xuICAgIHZhciBvbGRLZXlUb0lkeCwgaWR4SW5PbGQsIGVsbVRvTW92ZSwgYmVmb3JlO1xuXG4gICAgd2hpbGUgKG9sZFN0YXJ0SWR4IDw9IG9sZEVuZElkeCAmJiBuZXdTdGFydElkeCA8PSBuZXdFbmRJZHgpIHtcbiAgICAgIGlmIChpc1VuZGVmKG9sZFN0YXJ0Vm5vZGUpKSB7XG4gICAgICAgIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFsrK29sZFN0YXJ0SWR4XTsgLy8gVm5vZGUgaGFzIGJlZW4gbW92ZWQgbGVmdFxuICAgICAgfSBlbHNlIGlmIChpc1VuZGVmKG9sZEVuZFZub2RlKSkge1xuICAgICAgICBvbGRFbmRWbm9kZSA9IG9sZENoWy0tb2xkRW5kSWR4XTtcbiAgICAgIH0gZWxzZSBpZiAoc2FtZVZub2RlKG9sZFN0YXJ0Vm5vZGUsIG5ld1N0YXJ0Vm5vZGUpKSB7XG4gICAgICAgIHBhdGNoVm5vZGUob2xkU3RhcnRWbm9kZSwgbmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgb2xkU3RhcnRWbm9kZSA9IG9sZENoWysrb2xkU3RhcnRJZHhdO1xuICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICB9IGVsc2UgaWYgKHNhbWVWbm9kZShvbGRFbmRWbm9kZSwgbmV3RW5kVm5vZGUpKSB7XG4gICAgICAgIHBhdGNoVm5vZGUob2xkRW5kVm5vZGUsIG5ld0VuZFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICBvbGRFbmRWbm9kZSA9IG9sZENoWy0tb2xkRW5kSWR4XTtcbiAgICAgICAgbmV3RW5kVm5vZGUgPSBuZXdDaFstLW5ld0VuZElkeF07XG4gICAgICB9IGVsc2UgaWYgKHNhbWVWbm9kZShvbGRTdGFydFZub2RlLCBuZXdFbmRWbm9kZSkpIHsgLy8gVm5vZGUgbW92ZWQgcmlnaHRcbiAgICAgICAgcGF0Y2hWbm9kZShvbGRTdGFydFZub2RlLCBuZXdFbmRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtLCBhcGkubmV4dFNpYmxpbmcob2xkRW5kVm5vZGUuZWxtKSk7XG4gICAgICAgIG9sZFN0YXJ0Vm5vZGUgPSBvbGRDaFsrK29sZFN0YXJ0SWR4XTtcbiAgICAgICAgbmV3RW5kVm5vZGUgPSBuZXdDaFstLW5ld0VuZElkeF07XG4gICAgICB9IGVsc2UgaWYgKHNhbWVWbm9kZShvbGRFbmRWbm9kZSwgbmV3U3RhcnRWbm9kZSkpIHsgLy8gVm5vZGUgbW92ZWQgbGVmdFxuICAgICAgICBwYXRjaFZub2RlKG9sZEVuZFZub2RlLCBuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpO1xuICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudEVsbSwgb2xkRW5kVm5vZGUuZWxtLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgIG9sZEVuZFZub2RlID0gb2xkQ2hbLS1vbGRFbmRJZHhdO1xuICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaXNVbmRlZihvbGRLZXlUb0lkeCkpIG9sZEtleVRvSWR4ID0gY3JlYXRlS2V5VG9PbGRJZHgob2xkQ2gsIG9sZFN0YXJ0SWR4LCBvbGRFbmRJZHgpO1xuICAgICAgICBpZHhJbk9sZCA9IG9sZEtleVRvSWR4W25ld1N0YXJ0Vm5vZGUua2V5XTtcbiAgICAgICAgaWYgKGlzVW5kZWYoaWR4SW5PbGQpKSB7IC8vIE5ldyBlbGVtZW50XG4gICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGNyZWF0ZUVsbShuZXdTdGFydFZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpLCBvbGRTdGFydFZub2RlLmVsbSk7XG4gICAgICAgICAgbmV3U3RhcnRWbm9kZSA9IG5ld0NoWysrbmV3U3RhcnRJZHhdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsbVRvTW92ZSA9IG9sZENoW2lkeEluT2xkXTtcbiAgICAgICAgICBwYXRjaFZub2RlKGVsbVRvTW92ZSwgbmV3U3RhcnRWbm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgICAgICBvbGRDaFtpZHhJbk9sZF0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgYXBpLmluc2VydEJlZm9yZShwYXJlbnRFbG0sIGVsbVRvTW92ZS5lbG0sIG9sZFN0YXJ0Vm5vZGUuZWxtKTtcbiAgICAgICAgICBuZXdTdGFydFZub2RlID0gbmV3Q2hbKytuZXdTdGFydElkeF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG9sZFN0YXJ0SWR4ID4gb2xkRW5kSWR4KSB7XG4gICAgICBiZWZvcmUgPSBpc1VuZGVmKG5ld0NoW25ld0VuZElkeCsxXSkgPyBudWxsIDogbmV3Q2hbbmV3RW5kSWR4KzFdLmVsbTtcbiAgICAgIGFkZFZub2RlcyhwYXJlbnRFbG0sIGJlZm9yZSwgbmV3Q2gsIG5ld1N0YXJ0SWR4LCBuZXdFbmRJZHgsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgfSBlbHNlIGlmIChuZXdTdGFydElkeCA+IG5ld0VuZElkeCkge1xuICAgICAgcmVtb3ZlVm5vZGVzKHBhcmVudEVsbSwgb2xkQ2gsIG9sZFN0YXJ0SWR4LCBvbGRFbmRJZHgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBhdGNoVm5vZGUob2xkVm5vZGUsIHZub2RlLCBpbnNlcnRlZFZub2RlUXVldWUpIHtcbiAgICB2YXIgaSwgaG9vaztcbiAgICBpZiAoaXNEZWYoaSA9IHZub2RlLmRhdGEpICYmIGlzRGVmKGhvb2sgPSBpLmhvb2spICYmIGlzRGVmKGkgPSBob29rLnByZXBhdGNoKSkge1xuICAgICAgaShvbGRWbm9kZSwgdm5vZGUpO1xuICAgIH1cbiAgICB2YXIgZWxtID0gdm5vZGUuZWxtID0gb2xkVm5vZGUuZWxtLCBvbGRDaCA9IG9sZFZub2RlLmNoaWxkcmVuLCBjaCA9IHZub2RlLmNoaWxkcmVuO1xuICAgIGlmIChvbGRWbm9kZSA9PT0gdm5vZGUpIHJldHVybjtcbiAgICBpZiAoIXNhbWVWbm9kZShvbGRWbm9kZSwgdm5vZGUpKSB7XG4gICAgICB2YXIgcGFyZW50RWxtID0gYXBpLnBhcmVudE5vZGUob2xkVm5vZGUuZWxtKTtcbiAgICAgIGVsbSA9IGNyZWF0ZUVsbSh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgIGFwaS5pbnNlcnRCZWZvcmUocGFyZW50RWxtLCBlbG0sIG9sZFZub2RlLmVsbSk7XG4gICAgICByZW1vdmVWbm9kZXMocGFyZW50RWxtLCBbb2xkVm5vZGVdLCAwLCAwKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGlzRGVmKHZub2RlLmRhdGEpKSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgY2JzLnVwZGF0ZS5sZW5ndGg7ICsraSkgY2JzLnVwZGF0ZVtpXShvbGRWbm9kZSwgdm5vZGUpO1xuICAgICAgaSA9IHZub2RlLmRhdGEuaG9vaztcbiAgICAgIGlmIChpc0RlZihpKSAmJiBpc0RlZihpID0gaS51cGRhdGUpKSBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgfVxuICAgIGlmIChpc1VuZGVmKHZub2RlLnRleHQpKSB7XG4gICAgICBpZiAoaXNEZWYob2xkQ2gpICYmIGlzRGVmKGNoKSkge1xuICAgICAgICBpZiAob2xkQ2ggIT09IGNoKSB1cGRhdGVDaGlsZHJlbihlbG0sIG9sZENoLCBjaCwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNEZWYoY2gpKSB7XG4gICAgICAgIGlmIChpc0RlZihvbGRWbm9kZS50ZXh0KSkgYXBpLnNldFRleHRDb250ZW50KGVsbSwgJycpO1xuICAgICAgICBhZGRWbm9kZXMoZWxtLCBudWxsLCBjaCwgMCwgY2gubGVuZ3RoIC0gMSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNEZWYob2xkQ2gpKSB7XG4gICAgICAgIHJlbW92ZVZub2RlcyhlbG0sIG9sZENoLCAwLCBvbGRDaC5sZW5ndGggLSAxKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNEZWYob2xkVm5vZGUudGV4dCkpIHtcbiAgICAgICAgYXBpLnNldFRleHRDb250ZW50KGVsbSwgJycpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAob2xkVm5vZGUudGV4dCAhPT0gdm5vZGUudGV4dCkge1xuICAgICAgYXBpLnNldFRleHRDb250ZW50KGVsbSwgdm5vZGUudGV4dCk7XG4gICAgfVxuICAgIGlmIChpc0RlZihob29rKSAmJiBpc0RlZihpID0gaG9vay5wb3N0cGF0Y2gpKSB7XG4gICAgICBpKG9sZFZub2RlLCB2bm9kZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG9sZFZub2RlLCB2bm9kZSkge1xuICAgIHZhciBpLCBlbG0sIHBhcmVudDtcbiAgICB2YXIgaW5zZXJ0ZWRWbm9kZVF1ZXVlID0gW107XG4gICAgZm9yIChpID0gMDsgaSA8IGNicy5wcmUubGVuZ3RoOyArK2kpIGNicy5wcmVbaV0oKTtcblxuICAgIGlmIChpc1VuZGVmKG9sZFZub2RlLnNlbCkpIHtcbiAgICAgIG9sZFZub2RlID0gZW1wdHlOb2RlQXQob2xkVm5vZGUpO1xuICAgIH1cblxuICAgIGlmIChzYW1lVm5vZGUob2xkVm5vZGUsIHZub2RlKSkge1xuICAgICAgcGF0Y2hWbm9kZShvbGRWbm9kZSwgdm5vZGUsIGluc2VydGVkVm5vZGVRdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVsbSA9IG9sZFZub2RlLmVsbTtcbiAgICAgIHBhcmVudCA9IGFwaS5wYXJlbnROb2RlKGVsbSk7XG5cbiAgICAgIGNyZWF0ZUVsbSh2bm9kZSwgaW5zZXJ0ZWRWbm9kZVF1ZXVlKTtcblxuICAgICAgaWYgKHBhcmVudCAhPT0gbnVsbCkge1xuICAgICAgICBhcGkuaW5zZXJ0QmVmb3JlKHBhcmVudCwgdm5vZGUuZWxtLCBhcGkubmV4dFNpYmxpbmcoZWxtKSk7XG4gICAgICAgIHJlbW92ZVZub2RlcyhwYXJlbnQsIFtvbGRWbm9kZV0sIDAsIDApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoaSA9IDA7IGkgPCBpbnNlcnRlZFZub2RlUXVldWUubGVuZ3RoOyArK2kpIHtcbiAgICAgIGluc2VydGVkVm5vZGVRdWV1ZVtpXS5kYXRhLmhvb2suaW5zZXJ0KGluc2VydGVkVm5vZGVRdWV1ZVtpXSk7XG4gICAgfVxuICAgIGZvciAoaSA9IDA7IGkgPCBjYnMucG9zdC5sZW5ndGg7ICsraSkgY2JzLnBvc3RbaV0oKTtcbiAgICByZXR1cm4gdm5vZGU7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge2luaXQ6IGluaXR9O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzZWwsIGRhdGEsIGNoaWxkcmVuLCB0ZXh0LCBlbG0pIHtcbiAgdmFyIGtleSA9IGRhdGEgPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6IGRhdGEua2V5O1xuICByZXR1cm4ge3NlbDogc2VsLCBkYXRhOiBkYXRhLCBjaGlsZHJlbjogY2hpbGRyZW4sXG4gICAgICAgICAgdGV4dDogdGV4dCwgZWxtOiBlbG0sIGtleToga2V5fTtcbn07XG4iLCJmdW5jdGlvbiB1cGRhdGVQcm9wcyhvbGRWbm9kZSwgdm5vZGUpIHtcclxuICAgIHZhciBrZXksIGN1ciwgb2xkLCBlbG0gPSB2bm9kZS5lbG0sXHJcbiAgICAgICAgcHJvcHMgPSB2bm9kZS5kYXRhLmxpdmVQcm9wcyB8fCB7fTtcclxuICAgIGZvciAoa2V5IGluIHByb3BzKSB7XHJcbiAgICAgICAgY3VyID0gcHJvcHNba2V5XTtcclxuICAgICAgICBvbGQgPSBlbG1ba2V5XTtcclxuICAgICAgICBpZiAob2xkICE9PSBjdXIpIGVsbVtrZXldID0gY3VyO1xyXG4gICAgfVxyXG59XHJcbmNvbnN0IGxpdmVQcm9wc1BsdWdpbiA9IHtjcmVhdGU6IHVwZGF0ZVByb3BzLCB1cGRhdGU6IHVwZGF0ZVByb3BzfTtcclxuaW1wb3J0IHNuYWJiZG9tIGZyb20gXCJzbmFiYmRvbVwiXHJcbmltcG9ydCBoIGZyb20gXCJzbmFiYmRvbS9oXCJcclxuY29uc3QgcGF0Y2ggPSBzbmFiYmRvbS5pbml0KFtcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvY2xhc3MnKSxcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvcHJvcHMnKSxcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvc3R5bGUnKSxcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvZXZlbnRsaXN0ZW5lcnMnKSxcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvYXR0cmlidXRlcycpLFxyXG4gICAgbGl2ZVByb3BzUGx1Z2luXHJcbl0pO1xyXG5cclxuZnVuY3Rpb24gdXVpZCgpe3JldHVybihcIlwiKzFlNystMWUzKy00ZTMrLThlMystMWUxMSkucmVwbGFjZSgvMXwwL2csZnVuY3Rpb24oKXtyZXR1cm4oMHxNYXRoLnJhbmRvbSgpKjE2KS50b1N0cmluZygxNil9KX1cclxuaW1wb3J0IGJpZyBmcm9tICdiaWcuanMnXHJcbmJpZy5FX1BPUyA9IDFlKzZcclxuXHJcbmltcG9ydCB1Z25pcyBmcm9tICcuL3VnbmlzJ1xyXG5cclxuaW1wb3J0IHNhdmVkQXBwIGZyb20gJy4uL3VnbmlzX2NvbXBvbmVudHMvYXBwLmpzb24nXHJcblxyXG5lZGl0b3Ioc2F2ZWRBcHApXHJcblxyXG5mdW5jdGlvbiBlZGl0b3IoYXBwRGVmaW5pdGlvbil7XHJcblxyXG4gICAgLy9hcHAudmRvbS5lbG0ucGFyZW50Tm9kZVxyXG5cclxuICAgIGNvbnN0IGFwcCA9IHVnbmlzKGFwcERlZmluaXRpb24pXHJcblxyXG4gICAgbGV0IG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChub2RlKVxyXG5cclxuICAgIC8vIFN0YXRlXHJcbiAgICBsZXQgc3RhdGUgPSB7XHJcbiAgICAgICAgbGVmdE9wZW46IHRydWUsXHJcbiAgICAgICAgcmlnaHRPcGVuOiB0cnVlLFxyXG4gICAgICAgIGVkaXRvclJpZ2h0V2lkdGg6IDM1MCxcclxuICAgICAgICBlZGl0b3JMZWZ0V2lkdGg6IDM1MCxcclxuICAgICAgICBzdWJFZGl0b3JXaWR0aDogMzUwLFxyXG4gICAgICAgIGFwcElzRnJvemVuOiBmYWxzZSxcclxuICAgICAgICBzZWxlY3RlZFZpZXdOb2RlOiB7fSxcclxuICAgICAgICBzZWxlY3RlZEV2ZW50SWQ6ICcnLFxyXG4gICAgICAgIHNlbGVjdGVkUGlwZUlkOiAnJyxcclxuICAgICAgICBzZWxlY3RlZFN0YXRlTm9kZUlkOiAnJyxcclxuICAgICAgICBzZWxlY3RlZFZpZXdTdWJNZW51OiAncHJvcHMnLFxyXG4gICAgICAgIGVkaXRpbmdUaXRsZU5vZGVJZDogJycsXHJcbiAgICAgICAgYWN0aXZlRXZlbnQ6ICcnLFxyXG4gICAgICAgIHZpZXdGb2xkZXJzQ2xvc2VkOiB7fSxcclxuICAgICAgICBkZWZpbml0aW9uOiBhcHAuZGVmaW5pdGlvbixcclxuICAgIH1cclxuICAgIC8vIHVuZG8vcmVkb1xyXG4gICAgbGV0IHN0YXRlU3RhY2sgPSBbc3RhdGVdXHJcbiAgICBmdW5jdGlvbiBzZXRTdGF0ZShuZXdTdGF0ZSwgcHVzaFRvU3RhY2spe1xyXG4gICAgICAgIGlmKG5ld1N0YXRlID09PSBzdGF0ZSl7XHJcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybignc3RhdGUgd2FzIG11dGF0ZWQsIHNlYXJjaCBmb3IgYSBidWcnKVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBzb21lIGFjdGlvbnMgc2hvdWxkIG5vdCBiZSByZWNvcmRlZCBhbmQgY29udHJvbGxlZCB0aHJvdWdoIHVuZG8vcmVkb1xyXG4gICAgICAgIGlmKHB1c2hUb1N0YWNrKXtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudEluZGV4ID0gc3RhdGVTdGFjay5maW5kSW5kZXgoKGEpPT5hPT09c3RhdGUpXHJcbiAgICAgICAgICAgIHN0YXRlU3RhY2sgPSBzdGF0ZVN0YWNrLnNsaWNlKDAsIGN1cnJlbnRJbmRleCsxKS5jb25jYXQobmV3U3RhdGUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIG92ZXJ3cml0ZSBjdXJyZW50XHJcbiAgICAgICAgICAgIHN0YXRlU3RhY2tbc3RhdGVTdGFjay5maW5kSW5kZXgoKGEpPT5hPT09c3RhdGUpXSA9IG5ld1N0YXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZihzdGF0ZS5hcHBJc0Zyb3plbiAhPT0gbmV3U3RhdGUuYXBwSXNGcm96ZW4gfHwgc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZSAhPT0gbmV3U3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZSApe1xyXG4gICAgICAgICAgICBhcHAuX2ZyZWV6ZShuZXdTdGF0ZS5hcHBJc0Zyb3plbiwgVklFV19OT0RFX1NFTEVDVEVELCBuZXdTdGF0ZS5zZWxlY3RlZFZpZXdOb2RlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZihzdGF0ZS5kZWZpbml0aW9uICE9PSBuZXdTdGF0ZS5kZWZpbml0aW9uKXtcclxuICAgICAgICAgICAgLy8gVE9ETyBhZGQgZ2FyYmFnZSBjb2xsZWN0aW9uP1xyXG4gICAgICAgICAgICBhcHAucmVuZGVyKG5ld1N0YXRlLmRlZmluaXRpb24pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHN0YXRlID0gbmV3U3RhdGVcclxuICAgICAgICByZW5kZXIoKVxyXG4gICAgfVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSk9PiB7XHJcbiAgICAgICAgLy8gY2xpY2tlZCBvdXRzaWRlXHJcbiAgICAgICAgaWYoc3RhdGUuZWRpdGluZ1RpdGxlTm9kZUlkICYmICFlLnRhcmdldC5kYXRhc2V0LmlzdGl0bGVlZGl0b3Ipe1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGVkaXRpbmdUaXRsZU5vZGVJZDogJyd9KVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpPT57XHJcbiAgICAgICAgLy8gODMgLSBzXHJcbiAgICAgICAgLy8gOTAgLSB6XHJcbiAgICAgICAgLy8gODkgLSB5XHJcbiAgICAgICAgLy8gMzIgLSBzcGFjZVxyXG4gICAgICAgIC8vIDEzIC0gZW50ZXJcclxuICAgICAgICBpZihlLndoaWNoID09IDgzICYmIChuYXZpZ2F0b3IucGxhdGZvcm0ubWF0Y2goXCJNYWNcIikgPyBlLm1ldGFLZXkgOiBlLmN0cmxLZXkpKSB7XHJcbiAgICAgICAgICAgIC8vIFRPRE8gZ2FyYmFnZSBjb2xsZWN0XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgZmV0Y2goJy9zYXZlJywge21ldGhvZDogJ1BPU1QnLCBib2R5OiBKU09OLnN0cmluZ2lmeShzdGF0ZS5kZWZpbml0aW9uKSwgaGVhZGVyczoge1wiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwifX0pXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoZS53aGljaCA9PSAzMiAmJiAobmF2aWdhdG9yLnBsYXRmb3JtLm1hdGNoKFwiTWFjXCIpID8gZS5tZXRhS2V5IDogZS5jdHJsS2V5KSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICAgICAgRlJFRVpFUl9DTElDS0VEKClcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoIWUuc2hpZnRLZXkgJiYgZS53aGljaCA9PSA5MCAmJiAobmF2aWdhdG9yLnBsYXRmb3JtLm1hdGNoKFwiTWFjXCIpID8gZS5tZXRhS2V5IDogZS5jdHJsS2V5KSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRJbmRleCA9IHN0YXRlU3RhY2suZmluZEluZGV4KChhKT0+YT09PXN0YXRlKVxyXG4gICAgICAgICAgICBpZihjdXJyZW50SW5kZXggPiAwKXtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1N0YXRlID0gc3RhdGVTdGFja1tjdXJyZW50SW5kZXgtMV1cclxuICAgICAgICAgICAgICAgIGlmKHN0YXRlLmRlZmluaXRpb24gIT09IG5ld1N0YXRlLmRlZmluaXRpb24pe1xyXG4gICAgICAgICAgICAgICAgICAgIGFwcC5yZW5kZXIobmV3U3RhdGUuZGVmaW5pdGlvbilcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHN0YXRlID0gbmV3U3RhdGVcclxuICAgICAgICAgICAgICAgIHJlbmRlcigpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoKGUud2hpY2ggPT0gODkgJiYgKG5hdmlnYXRvci5wbGF0Zm9ybS5tYXRjaChcIk1hY1wiKSA/IGUubWV0YUtleSA6IGUuY3RybEtleSkpIHx8IChlLnNoaWZ0S2V5ICYmIGUud2hpY2ggPT0gOTAgJiYgKG5hdmlnYXRvci5wbGF0Zm9ybS5tYXRjaChcIk1hY1wiKSA/IGUubWV0YUtleSA6IGUuY3RybEtleSkpKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudEluZGV4ID0gc3RhdGVTdGFjay5maW5kSW5kZXgoKGEpPT5hPT09c3RhdGUpXHJcbiAgICAgICAgICAgIGlmKGN1cnJlbnRJbmRleCA8IHN0YXRlU3RhY2subGVuZ3RoLTEpe1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbmV3U3RhdGUgPSBzdGF0ZVN0YWNrW2N1cnJlbnRJbmRleCsxXVxyXG4gICAgICAgICAgICAgICAgaWYoc3RhdGUuZGVmaW5pdGlvbiAhPT0gbmV3U3RhdGUuZGVmaW5pdGlvbil7XHJcbiAgICAgICAgICAgICAgICAgICAgYXBwLnJlbmRlcihuZXdTdGF0ZS5kZWZpbml0aW9uKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc3RhdGUgPSBuZXdTdGF0ZVxyXG4gICAgICAgICAgICAgICAgcmVuZGVyKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZihlLndoaWNoID09IDEzKSB7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZWRpdGluZ1RpdGxlTm9kZUlkOiAnJ30pXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICAvLyBBY3Rpb25zXHJcbiAgICBmdW5jdGlvbiBXSURUSF9EUkFHR0VEKHdpZHRoTmFtZSwgZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgIGZ1bmN0aW9uIHJlc2l6ZShlKXtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgICAgIGxldCBuZXdXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoIC0gKGUudG91Y2hlcz8gZS50b3VjaGVzWzBdLnBhZ2VYOiBlLnBhZ2VYKVxyXG4gICAgICAgICAgICBpZih3aWR0aE5hbWUgPT09ICdlZGl0b3JMZWZ0V2lkdGgnKXtcclxuICAgICAgICAgICAgICAgIG5ld1dpZHRoID0gZS50b3VjaGVzPyBlLnRvdWNoZXNbMF0ucGFnZVg6IGUucGFnZVhcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZih3aWR0aE5hbWUgPT09ICdzdWJFZGl0b3JXaWR0aCcpe1xyXG4gICAgICAgICAgICAgICAgbmV3V2lkdGggPSBuZXdXaWR0aCAtIHN0YXRlLmVkaXRvclJpZ2h0V2lkdGggLSAxMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIEkgcHJvYmFibHkgd2FzIGRydW5rXHJcbiAgICAgICAgICAgIGlmKHdpZHRoTmFtZSAhPT0gJ3N1YkVkaXRvcldpZHRoJyAmJiAoICh3aWR0aE5hbWUgPT09ICdlZGl0b3JMZWZ0V2lkdGgnID8gc3RhdGUubGVmdE9wZW46IHN0YXRlLnJpZ2h0T3BlbikgPyBuZXdXaWR0aCA8IDE4MDogbmV3V2lkdGggPiAxODApKXtcclxuICAgICAgICAgICAgICAgIGlmKHdpZHRoTmFtZSA9PT0gJ2VkaXRvckxlZnRXaWR0aCcpe1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZXRTdGF0ZSh7Li4uc3RhdGUsIGxlZnRPcGVuOiAhc3RhdGUubGVmdE9wZW59KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNldFN0YXRlKHsuLi5zdGF0ZSwgcmlnaHRPcGVuOiAhc3RhdGUucmlnaHRPcGVufSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZihuZXdXaWR0aCA8IDI1MCl7XHJcbiAgICAgICAgICAgICAgICBuZXdXaWR0aCA9IDI1MFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgW3dpZHRoTmFtZV06IG5ld1dpZHRofSlcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCByZXNpemUpXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHJlc2l6ZSlcclxuICAgICAgICBmdW5jdGlvbiBzdG9wRHJhZ2dpbmcoZSl7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgcmVzaXplKVxyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgcmVzaXplKVxyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHN0b3BEcmFnZ2luZylcclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgc3RvcERyYWdnaW5nKVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBzdG9wRHJhZ2dpbmcpXHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgc3RvcERyYWdnaW5nKVxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gRlJFRVpFUl9DTElDS0VEKCkge1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgYXBwSXNGcm96ZW46ICFzdGF0ZS5hcHBJc0Zyb3plbn0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBWSUVXX0ZPTERFUl9DTElDS0VEKG5vZGVJZCkge1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgdmlld0ZvbGRlcnNDbG9zZWQ6ey4uLnN0YXRlLnZpZXdGb2xkZXJzQ2xvc2VkLCBbbm9kZUlkXTogIXN0YXRlLnZpZXdGb2xkZXJzQ2xvc2VkW25vZGVJZF19fSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFZJRVdfTk9ERV9TRUxFQ1RFRChyZWYpIHtcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIHNlbGVjdGVkVmlld05vZGU6cmVmfSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIFVOU0VMRUNUX1ZJRVdfTk9ERShlKSB7XHJcbiAgICAgICAgaWYoZS50YXJnZXQgPT09IHRoaXMuZWxtKXtcclxuICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBzZWxlY3RlZFZpZXdOb2RlOnt9fSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBTVEFURV9OT0RFX1NFTEVDVEVEKG5vZGVJZCkge1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgc2VsZWN0ZWRTdGF0ZU5vZGVJZDpub2RlSWR9KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gVU5TRUxFQ1RfU1RBVEVfTk9ERShlKSB7XHJcbiAgICAgICAgaWYoZS50YXJnZXQgPT09IHRoaXMuZWxtKXtcclxuICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBzZWxlY3RlZFN0YXRlTm9kZUlkOicnLCBzZWxlY3RlZEV2ZW50SWQ6Jyd9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIERFTEVURV9TRUxFQ1RFRF9WSUVXKG5vZGVSZWYsIHBhcmVudFJlZiwgZSkge1xyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICBpZihub2RlUmVmLmlkID09PSAnX3Jvb3ROb2RlJyl7XHJcbiAgICAgICAgICAgIC8vIGltbXV0YWJseSByZW1vdmUgYWxsIG5vZGVzIGV4Y2VwdCByb290Tm9kZVxyXG4gICAgICAgICAgICByZXR1cm4gc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgdk5vZGVCb3g6IHsnX3Jvb3ROb2RlJzogey4uLnN0YXRlLmRlZmluaXRpb24udk5vZGVCb3hbJ19yb290Tm9kZSddLCBjaGlsZHJlbjogW119fSxcclxuICAgICAgICAgICAgfSwgc2VsZWN0ZWRWaWV3Tm9kZToge319LCB0cnVlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgW3BhcmVudFJlZi5yZWZdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXSwgW3BhcmVudFJlZi5pZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdW3BhcmVudFJlZi5pZF0sIGNoaWxkcmVuOnN0YXRlLmRlZmluaXRpb25bcGFyZW50UmVmLnJlZl1bcGFyZW50UmVmLmlkXS5jaGlsZHJlbi5maWx0ZXIoKHJlZik9PnJlZi5pZCAhPT0gbm9kZVJlZi5pZCl9fSxcclxuICAgICAgICB9LCBzZWxlY3RlZFZpZXdOb2RlOiB7fX0sIHRydWUpXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBBRERfTk9ERShub2RlUmVmLCB0eXBlKSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZUlkID0gbm9kZVJlZi5pZFxyXG4gICAgICAgIGNvbnN0IG5ld05vZGVJZCA9IHV1aWQoKVxyXG4gICAgICAgIGNvbnN0IG5ld1N0eWxlSWQgPSB1dWlkKClcclxuICAgICAgICBjb25zdCBuZXdTdHlsZSA9IHtcclxuICAgICAgICAgICAgcGFkZGluZzogJzEwcHgnLFxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0eXBlID09PSAnYm94Jykge1xyXG4gICAgICAgICAgICBjb25zdCBuZXdOb2RlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdib3gnLFxyXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtyZWY6J3N0eWxlJywgaWQ6bmV3U3R5bGVJZH0sXHJcbiAgICAgICAgICAgICAgICBjaGlsZHJlbjogW10sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNldFN0YXRlKHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRWaWV3Tm9kZToge3JlZjondk5vZGVCb3gnLCBpZDogbmV3Tm9kZUlkfSxcclxuICAgICAgICAgICAgICAgIGRlZmluaXRpb246IG5vZGVSZWYucmVmID09PSAndk5vZGVCb3gnID8ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2Tm9kZUJveDogey4uLnN0YXRlLmRlZmluaXRpb24udk5vZGVCb3gsIFtub2RlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi52Tm9kZUJveFtub2RlSWRdLCBjaGlsZHJlbjogc3RhdGUuZGVmaW5pdGlvbi52Tm9kZUJveFtub2RlSWRdLmNoaWxkcmVuLmNvbmNhdCh7cmVmOid2Tm9kZUJveCcsIGlkOm5ld05vZGVJZH0pfSwgW25ld05vZGVJZF06IG5ld05vZGV9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogey4uLnN0YXRlLmRlZmluaXRpb24uc3R5bGUsIFtuZXdTdHlsZUlkXTogbmV3U3R5bGV9LFxyXG4gICAgICAgICAgICAgICAgICAgIH0gOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtub2RlUmVmLnJlZl06IHsuLi5zdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXSwgW25vZGVJZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlSWRdLCBjaGlsZHJlbjogc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZUlkXS5jaGlsZHJlbi5jb25jYXQoe3JlZjondk5vZGVCb3gnLCBpZDpuZXdOb2RlSWR9KX19LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2Tm9kZUJveDogey4uLnN0YXRlLmRlZmluaXRpb24udk5vZGVCb3gsIFtuZXdOb2RlSWRdOiBuZXdOb2RlfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnN0eWxlLCBbbmV3U3R5bGVJZF06IG5ld1N0eWxlfSxcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIHRydWUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHR5cGUgPT09ICd0ZXh0Jyl7XHJcbiAgICAgICAgICAgIGNvbnN0IHBpcGVJZCA9IHV1aWQoKVxyXG4gICAgICAgICAgICBjb25zdCBuZXdOb2RlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgIHN0eWxlOiB7cmVmOidzdHlsZScsIGlkOm5ld1N0eWxlSWR9LFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6J3BpcGUnLCBpZDpwaXBlSWR9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbmV3UGlwZSA9IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiAnRGVmYXVsdCBUZXh0JyxcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogW11cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc2V0U3RhdGUoe1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUsXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZFZpZXdOb2RlOiB7cmVmOid2Tm9kZVRleHQnLCBpZDogbmV3Tm9kZUlkfSxcclxuICAgICAgICAgICAgICAgIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsIFtwaXBlSWRdOiBuZXdQaXBlfSxcclxuICAgICAgICAgICAgICAgICAgICBbbm9kZVJlZi5yZWZdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl0sIFtub2RlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZUlkXSwgY2hpbGRyZW46IHN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVJZF0uY2hpbGRyZW4uY29uY2F0KHtyZWY6J3ZOb2RlVGV4dCcsIGlkOm5ld05vZGVJZH0pfX0sXHJcbiAgICAgICAgICAgICAgICAgICAgdk5vZGVUZXh0OiB7Li4uc3RhdGUuZGVmaW5pdGlvbi52Tm9kZVRleHQsIFtuZXdOb2RlSWRdOiBuZXdOb2RlfSxcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZTogey4uLnN0YXRlLmRlZmluaXRpb24uc3R5bGUsIFtuZXdTdHlsZUlkXTogbmV3U3R5bGV9LFxyXG4gICAgICAgICAgICAgICAgfX0sIHRydWUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHR5cGUgPT09ICdpbnB1dCcpIHtcclxuICAgICAgICAgICAgY29uc3Qgc3RhdGVJZCA9IHV1aWQoKVxyXG4gICAgICAgICAgICBjb25zdCBldmVudElkID0gdXVpZCgpXHJcbiAgICAgICAgICAgIGNvbnN0IG11dGF0b3JJZCA9IHV1aWQoKVxyXG4gICAgICAgICAgICBjb25zdCBwaXBlSW5wdXRJZCA9IHV1aWQoKVxyXG4gICAgICAgICAgICBjb25zdCBwaXBlTXV0YXRvcklkID0gdXVpZCgpXHJcbiAgICAgICAgICAgIGNvbnN0IG5ld05vZGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ2lucHV0JyxcclxuICAgICAgICAgICAgICAgIHN0eWxlOiB7cmVmOidzdHlsZScsIGlkOm5ld1N0eWxlSWR9LFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6J3BpcGUnLCBpZDpwaXBlSW5wdXRJZH0sXHJcbiAgICAgICAgICAgICAgICBpbnB1dDoge3JlZjonZXZlbnQnLCBpZDpldmVudElkfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld1BpcGVJbnB1dCA9IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiB7cmVmOiAnc3RhdGUnLCBpZDogc3RhdGVJZH0sXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFtdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbmV3UGlwZU11dGF0b3IgPSB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZToge3JlZjogJ2V2ZW50RGF0YScsIGlkOiAnX2lucHV0J30sXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFtdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbmV3U3RhdGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ2lucHV0IHZhbHVlJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgIHJlZjogc3RhdGVJZCxcclxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogJ0RlZmF1bHQgdGV4dCcsXHJcbiAgICAgICAgICAgICAgICBtdXRhdG9yczogW3sgcmVmOidtdXRhdG9yJywgaWQ6bXV0YXRvcklkfV0sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbmV3TXV0YXRvciA9IHtcclxuICAgICAgICAgICAgICAgIGV2ZW50OiB7IHJlZjogJ2V2ZW50JywgaWQ6ZXZlbnRJZH0sXHJcbiAgICAgICAgICAgICAgICBzdGF0ZTogeyByZWY6ICdzdGF0ZScsIGlkOnN0YXRlSWR9LFxyXG4gICAgICAgICAgICAgICAgbXV0YXRpb246IHsgcmVmOiAncGlwZScsIGlkOiBwaXBlTXV0YXRvcklkfSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBuZXdFdmVudCA9IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAndXBkYXRlIGlucHV0JyxcclxuICAgICAgICAgICAgICAgIG11dGF0b3JzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgeyByZWY6ICdtdXRhdG9yJywgaWQ6IG11dGF0b3JJZH0sXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogW1xyXG4gICAgICAgICAgICAgICAgICAgIHtyZWY6ICdldmVudERhdGEnLCBpZDogJ19pbnB1dCd9XHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzZXRTdGF0ZSh7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZSxcclxuICAgICAgICAgICAgICAgIHNlbGVjdGVkVmlld05vZGU6IHtyZWY6J3ZOb2RlSW5wdXQnLCBpZDogbmV3Tm9kZUlkfSxcclxuICAgICAgICAgICAgICAgIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpcGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsIFtwaXBlSW5wdXRJZF06IG5ld1BpcGVJbnB1dCwgW3BpcGVNdXRhdG9ySWRdOiBuZXdQaXBlTXV0YXRvcn0sXHJcbiAgICAgICAgICAgICAgICAgICAgW25vZGVSZWYucmVmXTogey4uLnN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdLCBbbm9kZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb25bbm9kZVJlZi5yZWZdW25vZGVJZF0sIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uW25vZGVSZWYucmVmXVtub2RlSWRdLmNoaWxkcmVuLmNvbmNhdCh7cmVmOid2Tm9kZUlucHV0JywgaWQ6bmV3Tm9kZUlkfSl9fSxcclxuICAgICAgICAgICAgICAgICAgICB2Tm9kZUlucHV0OiB7Li4uc3RhdGUuZGVmaW5pdGlvbi52Tm9kZUlucHV0LCBbbmV3Tm9kZUlkXTogbmV3Tm9kZX0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnN0eWxlLCBbbmV3U3R5bGVJZF06IG5ld1N0eWxlfSxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lU3BhY2U6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZSwgWydfcm9vdE5hbWVTcGFjZSddOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5uYW1lU3BhY2VbJ19yb290TmFtZVNwYWNlJ10sIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZVsnX3Jvb3ROYW1lU3BhY2UnXS5jaGlsZHJlbi5jb25jYXQoe3JlZjonc3RhdGUnLCBpZDpzdGF0ZUlkfSl9fSxcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZTogey4uLnN0YXRlLmRlZmluaXRpb24uc3RhdGUsIFtzdGF0ZUlkXTogbmV3U3RhdGV9LFxyXG4gICAgICAgICAgICAgICAgICAgIG11dGF0b3I6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLm11dGF0b3IsIFttdXRhdG9ySWRdOiBuZXdNdXRhdG9yfSxcclxuICAgICAgICAgICAgICAgICAgICBldmVudDogey4uLnN0YXRlLmRlZmluaXRpb24uZXZlbnQsIFtldmVudElkXTogbmV3RXZlbnR9LFxyXG4gICAgICAgICAgICAgICAgfX0sIHRydWUpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQUREX1NUQVRFKG5hbWVzcGFjZUlkLCB0eXBlKSB7XHJcbiAgICAgICAgY29uc3QgbmV3U3RhdGVJZCA9IHV1aWQoKVxyXG4gICAgICAgIGxldCBuZXdTdGF0ZVxyXG4gICAgICAgIGlmKHR5cGUgPT09ICd0ZXh0Jykge1xyXG4gICAgICAgICAgICBuZXdTdGF0ZSA9IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnbmV3IHRleHQnLFxyXG4gICAgICAgICAgICAgICAgcmVmOiBuZXdTdGF0ZUlkLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlOiAnRGVmYXVsdCB0ZXh0JyxcclxuICAgICAgICAgICAgICAgIG11dGF0b3JzOiBbXSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0eXBlID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICBuZXdTdGF0ZSA9IHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnbmV3IG51bWJlcicsXHJcbiAgICAgICAgICAgICAgICByZWY6IG5ld1N0YXRlSWQsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAnbnVtYmVyJyxcclxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogMCxcclxuICAgICAgICAgICAgICAgIG11dGF0b3JzOiBbXSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0eXBlID09PSAnYm9vbGVhbicpIHtcclxuICAgICAgICAgICAgbmV3U3RhdGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ25ldyBib29sZWFuJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdib29sZWFuJyxcclxuICAgICAgICAgICAgICAgIHJlZjogbmV3U3RhdGVJZCxcclxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIG11dGF0b3JzOiBbXSxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0eXBlID09PSAndGFibGUnKSB7XHJcbiAgICAgICAgICAgIG5ld1N0YXRlID0ge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICduZXcgdGFibGUnLFxyXG4gICAgICAgICAgICAgICAgdHlwZTogJ3RhYmxlJyxcclxuICAgICAgICAgICAgICAgIHJlZjogbmV3U3RhdGVJZCxcclxuICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZToge30sXHJcbiAgICAgICAgICAgICAgICBtdXRhdG9yczogW10sXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHlwZSA9PT0gJ25hbWVzcGFjZScpIHtcclxuICAgICAgICAgICAgbmV3U3RhdGUgPSB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ25ldyBuYW1lc3BhY2UnLFxyXG4gICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICBuYW1lU3BhY2U6IHsuLi5zdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZSwgW25hbWVzcGFjZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlW25hbWVzcGFjZUlkXSwgY2hpbGRyZW46IHN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlW25hbWVzcGFjZUlkXS5jaGlsZHJlbi5jb25jYXQoe3JlZjonbmFtZVNwYWNlJywgaWQ6bmV3U3RhdGVJZH0pfSwgW25ld1N0YXRlSWRdOiBuZXdTdGF0ZX0sXHJcbiAgICAgICAgICAgIH19LCB0cnVlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgbmFtZVNwYWNlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5uYW1lU3BhY2UsIFtuYW1lc3BhY2VJZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZVtuYW1lc3BhY2VJZF0sIGNoaWxkcmVuOiBzdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZVtuYW1lc3BhY2VJZF0uY2hpbGRyZW4uY29uY2F0KHtyZWY6J3N0YXRlJywgaWQ6bmV3U3RhdGVJZH0pfX0sXHJcbiAgICAgICAgICAgIHN0YXRlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5zdGF0ZSwgW25ld1N0YXRlSWRdOiBuZXdTdGF0ZX0sXHJcbiAgICAgICAgfX0sIHRydWUpXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBDSEFOR0VfU1RZTEUoc3R5bGVJZCwga2V5LCBlKSB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgICAgLy8gYW5kIG5vdyBJIHJlYWxseSByZWdyZXQgbm90IHVzaW5nIGltbXV0YWJsZSBvciByYW1kYSBsZW5zZXNcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHsuLi5zdGF0ZS5kZWZpbml0aW9uLCBzdHlsZTogey4uLnN0YXRlLmRlZmluaXRpb24uc3R5bGUsIFtzdHlsZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb24uc3R5bGVbc3R5bGVJZF0sIFtrZXldOiBlLnRhcmdldC52YWx1ZX19fX0sIHRydWUpXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBBRERfREVGQVVMVF9TVFlMRShzdHlsZUlkLCBrZXkpIHtcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHsuLi5zdGF0ZS5kZWZpbml0aW9uLCBzdHlsZTogey4uLnN0YXRlLmRlZmluaXRpb24uc3R5bGUsIFtzdHlsZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb24uc3R5bGVbc3R5bGVJZF0sIFtrZXldOiAnZGVmYXVsdCd9fX19LCB0cnVlKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gU0VMRUNUX1ZJRVdfU1VCTUVOVShuZXdJZCkge1xyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgc2VsZWN0ZWRWaWV3U3ViTWVudTpuZXdJZH0pXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBFRElUX1ZJRVdfTk9ERV9USVRMRShub2RlSWQpIHtcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGVkaXRpbmdUaXRsZU5vZGVJZDpub2RlSWR9KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gRURJVF9FVkVOVF9USVRMRShub2RlSWQpIHtcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGVkaXRpbmdUaXRsZU5vZGVJZDpub2RlSWR9KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQ0hBTkdFX0VWRU5UX1RJVExFKG5vZGVJZCwgZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgZXZlbnQ6IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24uZXZlbnQsXHJcbiAgICAgICAgICAgICAgICBbbm9kZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24uZXZlbnRbbm9kZUlkXSxcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogZS50YXJnZXQudmFsdWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9fSwgdHJ1ZSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIENIQU5HRV9WSUVXX05PREVfVElUTEUobm9kZVJlZiwgZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBjb25zdCBub2RlSWQgPSBub2RlUmVmLmlkXHJcbiAgICAgICAgY29uc3Qgbm9kZVR5cGUgPSBub2RlUmVmLnJlZlxyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICBbbm9kZVR5cGVdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlVHlwZV0sIFtub2RlSWRdOiB7Li4uc3RhdGUuZGVmaW5pdGlvbltub2RlVHlwZV1bbm9kZUlkXSwgdGl0bGU6IGUudGFyZ2V0LnZhbHVlfX0sXHJcbiAgICAgICAgfX0sIHRydWUpXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBDSEFOR0VfU1RBVEVfTk9ERV9USVRMRShub2RlSWQsIGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIHN0YXRlOiB7Li4uc3RhdGUuZGVmaW5pdGlvbi5zdGF0ZSwgW25vZGVJZF06IHsuLi5zdGF0ZS5kZWZpbml0aW9uLnN0YXRlW25vZGVJZF0sIHRpdGxlOiBlLnRhcmdldC52YWx1ZX19LFxyXG4gICAgICAgIH19LCB0cnVlKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQ0hBTkdFX05BTUVTUEFDRV9USVRMRShub2RlSWQsIGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIG5hbWVTcGFjZTogey4uLnN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlLCBbbm9kZUlkXTogey4uLnN0YXRlLmRlZmluaXRpb24ubmFtZVNwYWNlW25vZGVJZF0sIHRpdGxlOiBlLnRhcmdldC52YWx1ZX19LFxyXG4gICAgICAgIH19LCB0cnVlKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQ0hBTkdFX0NVUlJFTlRfU1RBVEVfVEVYVF9WQUxVRShzdGF0ZUlkLCBlKSB7XHJcbiAgICAgICAgYXBwLnNldEN1cnJlbnRTdGF0ZSh7Li4uYXBwLmdldEN1cnJlbnRTdGF0ZSgpLCBbc3RhdGVJZF06IGUudGFyZ2V0LnZhbHVlfSlcclxuICAgICAgICByZW5kZXIoKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQ0hBTkdFX0NVUlJFTlRfU1RBVEVfTlVNQkVSX1ZBTFVFKHN0YXRlSWQsIGUpIHtcclxuICAgICAgICAvLyB0b2RvIGJpZyB0aHJvd3MgZXJyb3IgaW5zdGVhZCBvZiByZXR1cm5pbmcgTmFOLi4uIGZpeCwgcmV3cml0ZSBvciBoYWNrXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYoYmlnKGUudGFyZ2V0LnZhbHVlKS50b1N0cmluZygpICE9PSBhcHAuZ2V0Q3VycmVudFN0YXRlKClbc3RhdGVJZF0udG9TdHJpbmcoKSl7XHJcbiAgICAgICAgICAgICAgICBhcHAuc2V0Q3VycmVudFN0YXRlKHsuLi5hcHAuZ2V0Q3VycmVudFN0YXRlKCksIFtzdGF0ZUlkXTogYmlnKGUudGFyZ2V0LnZhbHVlKX0pXHJcbiAgICAgICAgICAgICAgICByZW5kZXIoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaChlcnIpIHtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBJTkNSRU1FTlRfQ1VSUkVOVF9TVEFURV9OVU1CRVJfVkFMVUUoc3RhdGVJZCkge1xyXG4gICAgICAgIGFwcC5zZXRDdXJyZW50U3RhdGUoey4uLmFwcC5nZXRDdXJyZW50U3RhdGUoKSwgW3N0YXRlSWRdOiBiaWcoYXBwLmdldEN1cnJlbnRTdGF0ZSgpW3N0YXRlSWRdKS5hZGQoMSl9KVxyXG4gICAgICAgIHJlbmRlcigpXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBERUNSRU1FTlRfQ1VSUkVOVF9TVEFURV9OVU1CRVJfVkFMVUUoc3RhdGVJZCkge1xyXG4gICAgICAgIGFwcC5zZXRDdXJyZW50U3RhdGUoey4uLmFwcC5nZXRDdXJyZW50U3RhdGUoKSwgW3N0YXRlSWRdOiBiaWcoYXBwLmdldEN1cnJlbnRTdGF0ZSgpW3N0YXRlSWRdKS5hZGQoLTEpfSlcclxuICAgICAgICByZW5kZXIoKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gU0VMRUNUX0VWRU5UKGV2ZW50SWQpIHtcclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIHNlbGVjdGVkRXZlbnRJZDpldmVudElkfSlcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIENIQU5HRV9TVEFUSUNfVkFMVUUocmVmLCBwcm9wZXJ0eU5hbWUsIHR5cGUsIGUpIHtcclxuICAgICAgICBsZXQgdmFsdWUgPSBlLnRhcmdldC52YWx1ZVxyXG4gICAgICAgIGlmKHR5cGUgPT09ICdudW1iZXInKXtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gYmlnKGUudGFyZ2V0LnZhbHVlKVxyXG4gICAgICAgICAgICB9IGNhdGNoKGVycikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjp7XHJcbiAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgIFtyZWYucmVmXToge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbltyZWYucmVmXSxcclxuICAgICAgICAgICAgICAgIFtyZWYuaWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdLFxyXG4gICAgICAgICAgICAgICAgICAgIFtwcm9wZXJ0eU5hbWVdOiB2YWx1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfX0sIHRydWUpXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBBRERfRVZFTlQocHJvcGVydHlOYW1lKSB7XHJcbiAgICAgICAgY29uc3QgcmVmID0gc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZVxyXG4gICAgICAgIGNvbnN0IGV2ZW50SWQgPSB1dWlkKCk7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOntcclxuICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgW3JlZi5yZWZdOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uW3JlZi5yZWZdLFxyXG4gICAgICAgICAgICAgICAgW3JlZi5pZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uW3JlZi5yZWZdW3JlZi5pZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgW3Byb3BlcnR5TmFtZV06IHtyZWY6ICdldmVudCcsIGlkOiBldmVudElkfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBldmVudDoge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5ldmVudCxcclxuICAgICAgICAgICAgICAgIFtldmVudElkXToge1xyXG4gICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnT24gJyArIHByb3BlcnR5TmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBtdXRhdG9yczogW11cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH19LCB0cnVlKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQUREX01VVEFUT1Ioc3RhdGVJZCwgZXZlbnRJZCkge1xyXG4gICAgICAgIGNvbnN0IG11dGF0b3JJZCA9IHV1aWQoKTtcclxuICAgICAgICBjb25zdCBwaXBlSWQgPSB1dWlkKCk7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOntcclxuICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgcGlwZTp7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsXHJcbiAgICAgICAgICAgICAgICBbcGlwZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHN0YXRlLmRlZmluaXRpb24uc3RhdGVbc3RhdGVJZF0udHlwZSxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogc3RhdGUuZGVmaW5pdGlvbi5zdGF0ZVtzdGF0ZUlkXS5kZWZhdWx0VmFsdWUsXHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBbXVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzdGF0ZToge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5zdGF0ZSxcclxuICAgICAgICAgICAgICAgIFtzdGF0ZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24uc3RhdGVbc3RhdGVJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgbXV0YXRvcnM6IHN0YXRlLmRlZmluaXRpb24uc3RhdGVbc3RhdGVJZF0ubXV0YXRvcnMuY29uY2F0KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiAnbXV0YXRvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBtdXRhdG9ySWRcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtdXRhdG9yOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLm11dGF0b3IsXHJcbiAgICAgICAgICAgICAgICBbbXV0YXRvcklkXToge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogXCJldmVudFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogZXZlbnRJZFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiBcInN0YXRlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBzdGF0ZUlkXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBtdXRhdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWY6IFwicGlwZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogcGlwZUlkXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBldmVudDoge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5ldmVudCxcclxuICAgICAgICAgICAgICAgIFtldmVudElkXToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24uZXZlbnRbZXZlbnRJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgbXV0YXRvcnM6IHN0YXRlLmRlZmluaXRpb24uZXZlbnRbZXZlbnRJZF0ubXV0YXRvcnMuY29uY2F0KHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVmOiAnbXV0YXRvcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBtdXRhdG9ySWRcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfX0sIHRydWUpXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBNT1ZFX1ZJRVdfTk9ERShwYXJlbnRSZWYsIHBvc2l0aW9uLCBhbW91bnQsIGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KClcclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOntcclxuICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgW3BhcmVudFJlZi5yZWZdOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdLFxyXG4gICAgICAgICAgICAgICAgW3BhcmVudFJlZi5pZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdW3BhcmVudFJlZi5pZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IHN0YXRlLmRlZmluaXRpb25bcGFyZW50UmVmLnJlZl1bcGFyZW50UmVmLmlkXS5jaGlsZHJlbi5tYXAoIC8vIGZ1bmN0aW9uYWwgc3dhcFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoY2hpbGQsaW5kZXgpPT4gaW5kZXggPT09IHBvc2l0aW9uICsgYW1vdW50ID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLmRlZmluaXRpb25bcGFyZW50UmVmLnJlZl1bcGFyZW50UmVmLmlkXS5jaGlsZHJlbltwb3NpdGlvbl06XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleCA9PT0gcG9zaXRpb24gP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLmRlZmluaXRpb25bcGFyZW50UmVmLnJlZl1bcGFyZW50UmVmLmlkXS5jaGlsZHJlbltwb3NpdGlvbiArIGFtb3VudF06XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXVtwYXJlbnRSZWYuaWRdLmNoaWxkcmVuW2luZGV4XVxyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH19LCB0cnVlKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gU0VMRUNUX1BJUEUocGlwZUlkKSB7XHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBzZWxlY3RlZFBpcGVJZDpwaXBlSWR9KVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQ0hBTkdFX1BJUEVfVkFMVUVfVE9fU1RBVEUocGlwZUlkKSB7XHJcbiAgICAgICAgaWYoIXN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgfHwgc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0udmFsdWUuaWQgKXtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgcGlwZToge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLFxyXG4gICAgICAgICAgICAgICAgW3BpcGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXSxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZToge3JlZjogJ3N0YXRlJywgaWQ6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWR9LFxyXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogW11cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH19LCB0cnVlKVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gQUREX1RSQU5TRk9STUFUSU9OKHBpcGVJZCwgdHJhbnNmb3JtYXRpb24pIHtcclxuICAgICAgICBpZih0cmFuc2Zvcm1hdGlvbiA9PT0gJ2pvaW4nKXtcclxuICAgICAgICAgICAgY29uc3QgbmV3UGlwZUlkID0gdXVpZCgpO1xyXG4gICAgICAgICAgICBjb25zdCBqb2luSWQgPSB1dWlkKCk7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgIGpvaW46IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLmpvaW4sXHJcbiAgICAgICAgICAgICAgICAgICAgW2pvaW5JZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6ICdwaXBlJywgaWQ6bmV3UGlwZUlkfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwaXBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIFtuZXdQaXBlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdEZWZhdWx0IHRleHQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBbcGlwZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBzdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXS50cmFuc2Zvcm1hdGlvbnMuY29uY2F0KHtyZWY6ICdqb2luJywgaWQ6am9pbklkfSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH19LCB0cnVlKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0cmFuc2Zvcm1hdGlvbiA9PT0gJ3RvVXBwZXJDYXNlJyl7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld0lkID0gdXVpZCgpO1xyXG4gICAgICAgICAgICBzZXRTdGF0ZSh7Li4uc3RhdGUsIGRlZmluaXRpb246IHtcclxuICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24sXHJcbiAgICAgICAgICAgICAgICB0b1VwcGVyQ2FzZToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24udG9VcHBlckNhc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgW25ld0lkXToge31cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwaXBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIFtwaXBlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IHN0YXRlLmRlZmluaXRpb24ucGlwZVtwaXBlSWRdLnRyYW5zZm9ybWF0aW9ucy5jb25jYXQoe3JlZjogJ3RvVXBwZXJDYXNlJywgaWQ6bmV3SWR9KVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfX0sIHRydWUpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmKHRyYW5zZm9ybWF0aW9uID09PSAndG9Mb3dlckNhc2UnKXtcclxuICAgICAgICAgICAgY29uc3QgbmV3SWQgPSB1dWlkKCk7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgIHRvTG93ZXJDYXNlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi50b0xvd2VyQ2FzZSxcclxuICAgICAgICAgICAgICAgICAgICBbbmV3SWRdOiB7fVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHBpcGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsXHJcbiAgICAgICAgICAgICAgICAgICAgW3BpcGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0udHJhbnNmb3JtYXRpb25zLmNvbmNhdCh7cmVmOiAndG9Mb3dlckNhc2UnLCBpZDpuZXdJZH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9fSwgdHJ1ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHJhbnNmb3JtYXRpb24gPT09ICd0b1RleHQnKXtcclxuICAgICAgICAgICAgY29uc3QgbmV3SWQgPSB1dWlkKCk7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgIHRvVGV4dDoge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24udG9UZXh0LFxyXG4gICAgICAgICAgICAgICAgICAgIFtuZXdJZF06IHt9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcGlwZToge1xyXG4gICAgICAgICAgICAgICAgICAgIC4uLnN0YXRlLmRlZmluaXRpb24ucGlwZSxcclxuICAgICAgICAgICAgICAgICAgICBbcGlwZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBzdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXS50cmFuc2Zvcm1hdGlvbnMuY29uY2F0KHtyZWY6ICd0b1RleHQnLCBpZDpuZXdJZH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9fSwgdHJ1ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHJhbnNmb3JtYXRpb24gPT09ICdhZGQnKXtcclxuICAgICAgICAgICAgY29uc3QgbmV3UGlwZUlkID0gdXVpZCgpO1xyXG4gICAgICAgICAgICBjb25zdCBhZGRJZCA9IHV1aWQoKTtcclxuICAgICAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBkZWZpbml0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLFxyXG4gICAgICAgICAgICAgICAgYWRkOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5hZGQsXHJcbiAgICAgICAgICAgICAgICAgICAgW2FkZElkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZToge3JlZjogJ3BpcGUnLCBpZDpuZXdQaXBlSWR9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHBpcGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGUsXHJcbiAgICAgICAgICAgICAgICAgICAgW25ld1BpcGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ251bWJlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm1hdGlvbnM6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBbcGlwZUlkXToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuLi5zdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBzdGF0ZS5kZWZpbml0aW9uLnBpcGVbcGlwZUlkXS50cmFuc2Zvcm1hdGlvbnMuY29uY2F0KHtyZWY6ICdhZGQnLCBpZDphZGRJZH0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9fSwgdHJ1ZSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYodHJhbnNmb3JtYXRpb24gPT09ICdzdWJ0cmFjdCcpe1xyXG4gICAgICAgICAgICBjb25zdCBuZXdQaXBlSWQgPSB1dWlkKCk7XHJcbiAgICAgICAgICAgIGNvbnN0IHN1YnRyYWN0SWQgPSB1dWlkKCk7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgZGVmaW5pdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbixcclxuICAgICAgICAgICAgICAgIHN1YnRyYWN0OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5zdWJ0cmFjdCxcclxuICAgICAgICAgICAgICAgICAgICBbc3VidHJhY3RJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHtyZWY6ICdwaXBlJywgaWQ6bmV3UGlwZUlkfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBwaXBlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIFtuZXdQaXBlSWRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdudW1iZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtYXRpb25zOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgW3BpcGVJZF06IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybWF0aW9uczogc3RhdGUuZGVmaW5pdGlvbi5waXBlW3BpcGVJZF0udHJhbnNmb3JtYXRpb25zLmNvbmNhdCh7cmVmOiAnc3VidHJhY3QnLCBpZDpzdWJ0cmFjdElkfSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH19LCB0cnVlKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBMaXN0ZW4gdG8gYXBwIGFuZCBibGluayBldmVyeSBhY3Rpb25cclxuICAgIGxldCB0aW1lciA9IG51bGxcclxuICAgIGNvbnN0IGV2ZW50U3RhY2sgPSBbXVxyXG4gICAgYXBwLmFkZExpc3RlbmVyKChldmVudE5hbWUsIGRhdGEsIGUsIHByZXZpb3VzU3RhdGUsIGN1cnJlbnRTdGF0ZSwgbXV0YXRpb25zKT0+e1xyXG4gICAgICAgIGV2ZW50U3RhY2sucHVzaCh7ZXZlbnROYW1lLCBkYXRhLCBlLCBwcmV2aW91c1N0YXRlLCBjdXJyZW50U3RhdGUsIG11dGF0aW9uc30pXHJcbiAgICAgICAgc2V0U3RhdGUoey4uLnN0YXRlLCBhY3RpdmVFdmVudDogZXZlbnROYW1lfSlcclxuICAgICAgICAvLyB5ZWFoLCBJIHByb2JhYmx5IG5lZWRlZCBzb21lIG9ic2VydmFibGVzIHRvb1xyXG4gICAgICAgIGlmKHRpbWVyKXtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoKCk9PiB7XHJcbiAgICAgICAgICAgIHNldFN0YXRlKHsuLi5zdGF0ZSwgYWN0aXZlRXZlbnQ6ICcnfSlcclxuICAgICAgICB9LCA1MDApXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIFJlbmRlclxyXG4gICAgZnVuY3Rpb24gcmVuZGVyKCkge1xyXG4gICAgICAgIGNvbnN0IGN1cnJlbnRTdGF0ZSA9IGFwcC5nZXRDdXJyZW50U3RhdGUoKVxyXG4gICAgICAgIGNvbnN0IGRyYWdDb21wb25lbnRMZWZ0ID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgbW91c2Vkb3duOiBbV0lEVEhfRFJBR0dFRCwgJ2VkaXRvckxlZnRXaWR0aCddLFxyXG4gICAgICAgICAgICAgICAgdG91Y2hzdGFydDogW1dJRFRIX0RSQUdHRUQsICdlZGl0b3JMZWZ0V2lkdGgnXSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYXR0cnM6IHtcclxuXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgICAgIHJpZ2h0OiAnMCcsXHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGVYKDEwMCUpJyxcclxuICAgICAgICAgICAgICAgIHRvcDogJzAnLFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6ICcxMHB4JyxcclxuICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMWVtJyxcclxuICAgICAgICAgICAgICAgIG9wYWNpdHk6ICcwJyxcclxuICAgICAgICAgICAgICAgIGN1cnNvcjogJ2NvbC1yZXNpemUnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgY29uc3QgZHJhZ0NvbXBvbmVudFJpZ2h0ID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgbW91c2Vkb3duOiBbV0lEVEhfRFJBR0dFRCwgJ2VkaXRvclJpZ2h0V2lkdGgnXSxcclxuICAgICAgICAgICAgICAgIHRvdWNoc3RhcnQ6IFtXSURUSF9EUkFHR0VELCAnZWRpdG9yUmlnaHRXaWR0aCddLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhdHRyczoge1xyXG5cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICAgICAgbGVmdDogJzAnLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlWCgtMTAwJSknLFxyXG4gICAgICAgICAgICAgICAgdG9wOiAnMCcsXHJcbiAgICAgICAgICAgICAgICB3aWR0aDogJzEwcHgnLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXHJcbiAgICAgICAgICAgICAgICB0ZXh0QWxpZ246ICdjZW50ZXInLFxyXG4gICAgICAgICAgICAgICAgZm9udFNpemU6ICcxZW0nLFxyXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogJzAnLFxyXG4gICAgICAgICAgICAgICAgY3Vyc29yOiAnY29sLXJlc2l6ZScsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSlcclxuICAgICAgICBjb25zdCBkcmFnU3ViQ29tcG9uZW50ID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgbW91c2Vkb3duOiBbV0lEVEhfRFJBR0dFRCwgJ3N1YkVkaXRvcldpZHRoJ10sXHJcbiAgICAgICAgICAgICAgICB0b3VjaHN0YXJ0OiBbV0lEVEhfRFJBR0dFRCwgJ3N1YkVkaXRvcldpZHRoJ10sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGF0dHJzOiB7XHJcblxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICBsZWZ0OiAnMnB4JyxcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVgoLTEwMCUpJyxcclxuICAgICAgICAgICAgICAgIHRvcDogJzAnLFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6ICcxMHB4JyxcclxuICAgICAgICAgICAgICAgIGhlaWdodDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgdGV4dEFsaWduOiAnY2VudGVyJyxcclxuICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMWVtJyxcclxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgICAgICBjdXJzb3I6ICdjb2wtcmVzaXplJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBlbWJlckVkaXRvcihyZWYsIHR5cGUpe1xyXG4gICAgICAgICAgICBjb25zdCBwaXBlID0gc3RhdGUuZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdXHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBsaXN0VHJhbnNmb3JtYXRpb25zKHRyYW5zZm9ybWF0aW9ucywgdHJhbnNUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJhbnNmb3JtYXRpb25zLm1hcCgodHJhbnNSZWYsIGluZGV4KT0+e1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zZm9ybWVyID0gc3RhdGUuZGVmaW5pdGlvblt0cmFuc1JlZi5yZWZdW3RyYW5zUmVmLmlkXVxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmICh0cmFuc1JlZi5yZWYgPT09ICdlcXVhbCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgcmV0dXJuIGgoJ2RpdicsIHt9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtjb2xvcjogJyNiZGJkYmQnLCBjdXJzb3I6ICdkZWZhdWx0JywgZGlzcGxheTonZmxleCd9fSwgW2goJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMSd9fSwgdHJhbnNSZWYucmVmKSwgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwJ319LCB0cmFuc1R5cGUpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICBlbWJlckVkaXRvcih0cmFuc2Zvcm1lci52YWx1ZSwgdHlwZSlcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICAvLyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zUmVmLnJlZiA9PT0gJ2FkZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHt9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7a2V5OiBpbmRleCwgc3R5bGU6IHtjb2xvcjogJyNiZGJkYmQnLCBjdXJzb3I6ICdkZWZhdWx0JywgZGlzcGxheTonZmxleCd9fSwgW2goJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMSd9fSwgdHJhbnNSZWYucmVmKSwgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwJywgY29sb3I6IHRyYW5zZm9ybWF0aW9ucy5sZW5ndGgtMSAhPT0gaW5kZXggPyAnI2JkYmRiZCc6IHRyYW5zVHlwZSA9PT0gdHlwZSA/ICdncmVlbic6ICdyZWQnfX0sICdudW1iZXInKV0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ0xlZnQ6ICcxNXB4J319LCBbZW1iZXJFZGl0b3IodHJhbnNmb3JtZXIudmFsdWUsIHRyYW5zVHlwZSldKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNSZWYucmVmID09PSAnc3VidHJhY3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge2tleTogaW5kZXgsIHN0eWxlOiB7Y29sb3I6ICcjYmRiZGJkJywgY3Vyc29yOiAnZGVmYXVsdCcsIGRpc3BsYXk6J2ZsZXgnfX0sIFtoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnfX0sIHRyYW5zUmVmLnJlZiksIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCcsIGNvbG9yOiB0cmFuc2Zvcm1hdGlvbnMubGVuZ3RoLTEgIT09IGluZGV4ID8gJyNiZGJkYmQnOiB0cmFuc1R5cGUgPT09IHR5cGUgPyAnZ3JlZW4nOiAncmVkJ319LCAnbnVtYmVyJyldKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmdMZWZ0OiAnMTVweCd9fSwgW2VtYmVyRWRpdG9yKHRyYW5zZm9ybWVyLnZhbHVlLCB0cmFuc1R5cGUpXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaWYgKHRyYW5zUmVmLnJlZiA9PT0gJ2JyYW5jaCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgaWYocmVzb2x2ZSh0cmFuc2Zvcm1lci5wcmVkaWNhdGUpKXtcclxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgIHZhbHVlID0gdHJhbnNmb3JtVmFsdWUodmFsdWUsIHRyYW5zZm9ybWVyLnRoZW4pXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgICB2YWx1ZSA9IHRyYW5zZm9ybVZhbHVlKHZhbHVlLCB0cmFuc2Zvcm1lci5lbHNlKVxyXG4gICAgICAgICAgICAgICAgICAgIC8vICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc1JlZi5yZWYgPT09ICdqb2luJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge30sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2NvbG9yOiAnI2JkYmRiZCcsIGN1cnNvcjogJ2RlZmF1bHQnLCBkaXNwbGF5OidmbGV4J319LCBbaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcxJ319LCB0cmFuc1JlZi5yZWYpLCBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzAnLCBjb2xvcjogdHJhbnNmb3JtYXRpb25zLmxlbmd0aC0xICE9PSBpbmRleCA/ICcjYmRiZGJkJzogdHJhbnNUeXBlID09PSB0eXBlID8gJ2dyZWVuJzogJ3JlZCd9fSwgJ3RleHQnKV0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ0xlZnQ6ICcxNXB4J319LCBbZW1iZXJFZGl0b3IodHJhbnNmb3JtZXIudmFsdWUsIHRyYW5zVHlwZSldKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodHJhbnNSZWYucmVmID09PSAndG9VcHBlckNhc2UnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7Y3Vyc29yOiAnZGVmYXVsdCcsIGRpc3BsYXk6J2ZsZXgnfX0sIFtoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnLCBjb2xvcjogJyNiZGJkYmQnfX0sIHRyYW5zUmVmLnJlZiksIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMCcsIGNvbG9yOiB0cmFuc2Zvcm1hdGlvbnMubGVuZ3RoLTEgIT09IGluZGV4ID8gJyNiZGJkYmQnOiB0cmFuc1R5cGUgPT09IHR5cGUgPyAnZ3JlZW4nOiAncmVkJ319LCAndGV4dCcpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0cmFuc1JlZi5yZWYgPT09ICd0b0xvd2VyQ2FzZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHt9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtjdXJzb3I6ICdkZWZhdWx0JywgZGlzcGxheTonZmxleCd9fSwgW2goJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMScsIGNvbG9yOiAnI2JkYmRiZCd9fSwgdHJhbnNSZWYucmVmKSwgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwJywgY29sb3I6IHRyYW5zZm9ybWF0aW9ucy5sZW5ndGgtMSAhPT0gaW5kZXggPyAnI2JkYmRiZCc6IHRyYW5zVHlwZSA9PT0gdHlwZSA/ICdncmVlbic6ICdyZWQnfX0sICd0ZXh0JyldKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyYW5zUmVmLnJlZiA9PT0gJ3RvVGV4dCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHt9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtjdXJzb3I6ICdkZWZhdWx0JywgZGlzcGxheTonZmxleCd9fSwgW2goJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMScsIGNvbG9yOiAnI2JkYmRiZCd9fSwgdHJhbnNSZWYucmVmKSwgaCgnc3BhbicsIHtzdHlsZToge2ZsZXg6ICcwJywgY29sb3I6IHRyYW5zZm9ybWF0aW9ucy5sZW5ndGgtMSAhPT0gaW5kZXggPyAnI2JkYmRiZCc6IHRyYW5zVHlwZSA9PT0gdHlwZSA/ICdncmVlbic6ICdyZWQnfX0sICd0ZXh0JyldKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBnZW5UcmFuc2Zvcm1hdG9ycyh0eXBlKSB7XHJcbiAgICAgICAgICAgICAgICBpZih0eXBlID09PSAndGV4dCcpe1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmc6ICc1cHggMTBweCcsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCBib3JkZXJSYWRpdXM6ICcxMHB4JywgbWFyZ2luOiAnNXB4JywgY3Vyc29yOiAncG9pbnRlcicsIGJvcmRlcjogc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA/ICcycHggc29saWQgd2hpdGUnIDogJzJweCBzb2xpZCAjYmRiZGJkJywgY29sb3I6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPyAnd2hpdGUnIDogJyNiZGJkYmQnLH0sIG9uOiB7Y2xpY2s6IFtDSEFOR0VfUElQRV9WQUxVRV9UT19TVEFURSwgcmVmLmlkXX19LCAnY2hhbmdlIHRvIHN0YXRlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmc6ICc1cHggMTBweCcsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCBib3JkZXJSYWRpdXM6ICcxMHB4JywgbWFyZ2luOiAnNXB4JywgY3Vyc29yOiAncG9pbnRlcicsIGJvcmRlcjogJzJweCBzb2xpZCB3aGl0ZSd9LCBvbjoge2NsaWNrOiBbQUREX1RSQU5TRk9STUFUSU9OLCByZWYuaWQsICdqb2luJ119fSwgJ2pvaW4nKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZzogJzVweCAxMHB4JywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsIGJvcmRlclJhZGl1czogJzEwcHgnLCBtYXJnaW46ICc1cHgnLCBjdXJzb3I6ICdwb2ludGVyJywgYm9yZGVyOiAnMnB4IHNvbGlkIHdoaXRlJ30sIG9uOiB7Y2xpY2s6IFtBRERfVFJBTlNGT1JNQVRJT04sIHJlZi5pZCwgJ3RvVXBwZXJDYXNlJ119fSwgJ3RvIFVwcGVyIGNhc2UnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZzogJzVweCAxMHB4JywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsIGJvcmRlclJhZGl1czogJzEwcHgnLCBtYXJnaW46ICc1cHgnLCBjdXJzb3I6ICdwb2ludGVyJywgYm9yZGVyOiAnMnB4IHNvbGlkIHdoaXRlJ30sIG9uOiB7Y2xpY2s6IFtBRERfVFJBTlNGT1JNQVRJT04sIHJlZi5pZCwgJ3RvTG93ZXJDYXNlJ119fSwgJ3RvIExvd2VyIGNhc2UnKSxcclxuICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZih0eXBlID09PSAnbnVtYmVyJyl7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZzogJzVweCAxMHB4JywgZGlzcGxheTogJ2lubGluZS1ibG9jaycsIGJvcmRlclJhZGl1czogJzEwcHgnLCBtYXJnaW46ICc1cHgnLCBjdXJzb3I6ICdwb2ludGVyJywgYm9yZGVyOiBzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID8gJzJweCBzb2xpZCB3aGl0ZScgOiAnMnB4IHNvbGlkICNiZGJkYmQnLCBjb2xvcjogc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCAgPyAnd2hpdGUnIDogJyNiZGJkYmQnLH0sIG9uOiB7Y2xpY2s6IFtDSEFOR0VfUElQRV9WQUxVRV9UT19TVEFURSwgcmVmLmlkXX19LCAnY2hhbmdlIHRvIHN0YXRlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmc6ICc1cHggMTBweCcsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCBib3JkZXJSYWRpdXM6ICcxMHB4JywgbWFyZ2luOiAnNXB4JywgY3Vyc29yOiAncG9pbnRlcicsIGJvcmRlcjogJzJweCBzb2xpZCB3aGl0ZSd9LCBvbjoge2NsaWNrOiBbQUREX1RSQU5TRk9STUFUSU9OLCByZWYuaWQsICd0b1RleHQnXX19LCAndG8gdGV4dCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nOiAnNXB4IDEwcHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgYm9yZGVyUmFkaXVzOiAnMTBweCcsIG1hcmdpbjogJzVweCcsIGN1cnNvcjogJ3BvaW50ZXInLCBib3JkZXI6ICcycHggc29saWQgd2hpdGUnfSwgb246IHtjbGljazogW0FERF9UUkFOU0ZPUk1BVElPTiwgcmVmLmlkLCAnYWRkJ119fSwgJ2FkZCcpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nOiAnNXB4IDEwcHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgYm9yZGVyUmFkaXVzOiAnMTBweCcsIG1hcmdpbjogJzVweCcsIGN1cnNvcjogJ3BvaW50ZXInLCBib3JkZXI6ICcycHggc29saWQgd2hpdGUnfSwgb246IHtjbGljazogW0FERF9UUkFOU0ZPUk1BVElPTiwgcmVmLmlkLCAnc3VidHJhY3QnXX19LCAnc3VidHJhY3QnKSxcclxuICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBwaXBlLnZhbHVlID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIFtoKCdkaXYnLCB7c3R5bGU6e2Rpc3BsYXk6J2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJ30sIG9uOiB7Y2xpY2s6IFtTRUxFQ1RfUElQRSwgcmVmLmlkXX19LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnaW5wdXQnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbjogICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHREZWNvcmF0aW9uOiAndW5kZXJsaW5lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBbQ0hBTkdFX1NUQVRJQ19WQUxVRSwgcmVmLCAndmFsdWUnLCAndGV4dCddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpdmVQcm9wczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBwaXBlLnZhbHVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzAnLCBjdXJzb3I6ICdkZWZhdWx0JywgY29sb3I6IHBpcGUudHJhbnNmb3JtYXRpb25zLmxlbmd0aCA+IDAgPyAnI2JkYmRiZCc6IHR5cGUgPT09ICd0ZXh0JyA/ICdncmVlbic6ICdyZWQnfX0sICd0ZXh0JylcclxuICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmdMZWZ0OiAnMTVweCd9fSwgbGlzdFRyYW5zZm9ybWF0aW9ucyhwaXBlLnRyYW5zZm9ybWF0aW9ucywgcGlwZS50eXBlKSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywgc3RhdGUuc2VsZWN0ZWRQaXBlSWQgPT09IHJlZi5pZCA/IGdlblRyYW5zZm9ybWF0b3JzKCd0ZXh0Jyk6IFtdKVxyXG4gICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFpc05hTihwYXJzZUZsb2F0KE51bWJlcihwaXBlLnZhbHVlKSkpICYmIGlzRmluaXRlKE51bWJlcihwaXBlLnZhbHVlKSkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCBbaCgnZGl2Jywge3N0eWxlOntkaXNwbGF5OidmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcid9LCBvbjoge2NsaWNrOiBbU0VMRUNUX1BJUEUsIHJlZi5pZF19fSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2lucHV0Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHt0eXBlOidudW1iZXInfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAgJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwJScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dERlY29yYXRpb246ICd1bmRlcmxpbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IFtDSEFOR0VfU1RBVElDX1ZBTFVFLCByZWYsICd2YWx1ZScsICdudW1iZXInXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXZlUHJvcHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogTnVtYmVyKHBpcGUudmFsdWUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzAnLCBjdXJzb3I6ICdkZWZhdWx0JywgY29sb3I6IHBpcGUudHJhbnNmb3JtYXRpb25zLmxlbmd0aCA+IDAgPyAnI2JkYmRiZCc6IHR5cGUgPT09ICdudW1iZXInID8gJ2dyZWVuJzogJ3JlZCd9fSwgJ251bWJlcicpXHJcbiAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nTGVmdDogJzE1cHgnfX0sIGxpc3RUcmFuc2Zvcm1hdGlvbnMocGlwZS50cmFuc2Zvcm1hdGlvbnMsIHBpcGUudHlwZSkpLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHN0YXRlLnNlbGVjdGVkUGlwZUlkID09PSByZWYuaWQgPyBnZW5UcmFuc2Zvcm1hdG9ycygnbnVtYmVyJyk6IFtdKVxyXG4gICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYocGlwZS52YWx1ZS5yZWYgPT09ICdzdGF0ZScpe1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZGlzcGxTdGF0ZSA9IHN0YXRlLmRlZmluaXRpb25bcGlwZS52YWx1ZS5yZWZdW3BpcGUudmFsdWUuaWRdXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2JywgW2goJ2RpdicsIHtzdHlsZTp7ZGlzcGxheTonZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInfSwgb246IHtjbGljazogW1NFTEVDVF9QSVBFLCByZWYuaWRdfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtmbGV4OiAnMSd9fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgW2goJ2Rpdicse1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInLCBjb2xvcjogc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gcGlwZS52YWx1ZS5pZCA/ICcjZWFiNjVjJzogJ3doaXRlJywgcGFkZGluZzogJzJweCA1cHgnLCBtYXJnaW46ICczcHggM3B4IDAgMCcsIGJvcmRlcjogJzJweCBzb2xpZCAnICsgKHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHBpcGUudmFsdWUuaWQgPyAnI2VhYjY1Yyc6ICd3aGl0ZScpLCBib3JkZXJSYWRpdXM6ICcxMHB4JywgZGlzcGxheTogJ2lubGluZS1ibG9jayd9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7Y2xpY2s6IFtTVEFURV9OT0RFX1NFTEVDVEVELCBwaXBlLnZhbHVlLmlkXX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbZGlzcGxTdGF0ZS50aXRsZV0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICApLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcwJywgY3Vyc29yOiAnZGVmYXVsdCcsIGNvbG9yOiBwaXBlLnRyYW5zZm9ybWF0aW9ucy5sZW5ndGggPiAwID8gJyNiZGJkYmQnOiBkaXNwbFN0YXRlLnR5cGUgPT09IHR5cGUgPyAnZ3JlZW4nOiAncmVkJ319LCBkaXNwbFN0YXRlLnR5cGUpXHJcbiAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nTGVmdDogJzE1cHgnfX0sIGxpc3RUcmFuc2Zvcm1hdGlvbnMocGlwZS50cmFuc2Zvcm1hdGlvbnMsIHBpcGUudHlwZSkpLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHN0YXRlLnNlbGVjdGVkUGlwZUlkID09PSByZWYuaWQgPyBwaXBlLnRyYW5zZm9ybWF0aW9ucy5sZW5ndGggPT09IDAgPyBnZW5UcmFuc2Zvcm1hdG9ycyhkaXNwbFN0YXRlLnR5cGUpOiBwaXBlLnRyYW5zZm9ybWF0aW9uc1twaXBlLnRyYW5zZm9ybWF0aW9ucy5sZW5ndGgtMV0ucmVmID09PSAnYWRkJyB8fCBwaXBlLnRyYW5zZm9ybWF0aW9uc1twaXBlLnRyYW5zZm9ybWF0aW9ucy5sZW5ndGgtMV0ucmVmID09PSAnc3VidHJhY3QnPyBnZW5UcmFuc2Zvcm1hdG9ycygnbnVtYmVyJykgOiBnZW5UcmFuc2Zvcm1hdG9ycygndGV4dCcpOiBbXSkgLy8gVE9ETyBmaXgsIGEgaGFjayBmb3IgZGVtbywgdHlwZSBzaG91bGQgYmUgbGFzdCB0cmFuc2Zvcm1hdGlvbiBub3QganVzdCB0ZXh0XHJcbiAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmKHBpcGUudmFsdWUucmVmID09PSAnZXZlbnREYXRhJyl7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudERhdGEgPSBzdGF0ZS5kZWZpbml0aW9uW3BpcGUudmFsdWUucmVmXVtwaXBlLnZhbHVlLmlkXVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIFtoKCdkaXYnLCB7c3R5bGU6e2Rpc3BsYXk6J2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJ30sIG9uOiB7Y2xpY2s6IFtTRUxFQ1RfUElQRSwgcmVmLmlkXX19LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzEnfX0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtoKCdkaXYnLHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJywgY29sb3I6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHBpcGUudmFsdWUuaWQgPyAnI2VhYjY1Yyc6ICd3aGl0ZScsIHBhZGRpbmc6ICcycHggNXB4JywgbWFyZ2luOiAnM3B4IDNweCAwIDAnLCBib3JkZXI6ICcycHggc29saWQgJyArIChzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBwaXBlLnZhbHVlLmlkID8gJyNlYWI2NWMnOiAnd2hpdGUnKSwgZGlzcGxheTogJ2lubGluZS1ibG9jayd9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7Y2xpY2s6IFtTVEFURV9OT0RFX1NFTEVDVEVELCBwaXBlLnZhbHVlLmlkXX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbZXZlbnREYXRhLnRpdGxlXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzAnLCBjdXJzb3I6ICdkZWZhdWx0JywgY29sb3I6IHBpcGUudHJhbnNmb3JtYXRpb25zLmxlbmd0aCA+IDAgPyAnI2JkYmRiZCc6IGV2ZW50RGF0YS50eXBlID09PSB0eXBlID8gJ2dyZWVuJzogJ3JlZCd9fSwgZXZlbnREYXRhLnR5cGUpXHJcbiAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nTGVmdDogJzE1cHgnfX0sIGxpc3RUcmFuc2Zvcm1hdGlvbnMocGlwZS50cmFuc2Zvcm1hdGlvbnMsIHBpcGUudHlwZSkpLFxyXG4gICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbGlzdE5hbWVTcGFjZShzdGF0ZUlkKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnROYW1lU3BhY2UgPSBzdGF0ZS5kZWZpbml0aW9uLm5hbWVTcGFjZVtzdGF0ZUlkXVxyXG4gICAgICAgICAgICBmdW5jdGlvbiBlZGl0aW5nTm9kZSgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBoKCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBzdGF0ZUlkID8gJyNlYWI2NWMnOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJ2luc2V0IDAgLTFweCAwIDAgd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbjogICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udDogJ2luaGVyaXQnXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogW0NIQU5HRV9OQU1FU1BBQ0VfVElUTEUsIHN0YXRlSWRdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbGl2ZVByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdXJyZW50TmFtZVNwYWNlLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b2ZvY3VzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pc3RpdGxlZWRpdG9yJzogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgY2xvc2VkID0gc3RhdGUudmlld0ZvbGRlcnNDbG9zZWRbc3RhdGVJZF0gfHwgKHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgIT09IHN0YXRlSWQgJiYgY3VycmVudE5hbWVTcGFjZS5jaGlsZHJlbi5sZW5ndGggPT09IDApXHJcbiAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdyZWxhdGl2ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3ZnJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzOiB7d2lkdGg6IDEyLCBoZWlnaHQ6IDE2fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJywgcGFkZGluZzogJzAgNXB4JywgdHJhbnNmb3JtOiBjbG9zZWQgPyAncm90YXRlKDBkZWcpJzogJ3JvdGF0ZSg5MGRlZyknLCB0cmFuc2l0aW9uOiAnYWxsIDAuMnMnLCBtYXJnaW5MZWZ0OiAnLTEwcHgnfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGljazogW1ZJRVdfRk9MREVSX0NMSUNLRUQsIHN0YXRlSWRdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbaCgncG9seWdvbicsIHthdHRyczoge3BvaW50czogJzEyLDggMCwxIDMsOCAwLDE1J30sIHN0eWxlOiB7ZmlsbDogc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gc3RhdGVJZCA/ICcjZWFiNjVjJzogJ3doaXRlJywgdHJhbnNpdGlvbjogJ2ZpbGwgMC4ycyd9fSldKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuZWRpdGluZ1RpdGxlTm9kZUlkID09PSBzdGF0ZUlkID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVkaXRpbmdOb2RlKCk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywgeyBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJ30sIG9uOiB7Y2xpY2s6IFtTVEFURV9OT0RFX1NFTEVDVEVELCBzdGF0ZUlkXSwgZGJsY2xpY2s6IFtFRElUX1ZJRVdfTk9ERV9USVRMRSwgc3RhdGVJZF19fSwgW2goJ3NwYW4nLCB7c3R5bGU6IHtjb2xvcjogc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gc3RhdGVJZCA/ICcjZWFiNjVjJzogJ3doaXRlJywgdHJhbnNpdGlvbjogJ2NvbG9yIDAuMnMnfX0sIGN1cnJlbnROYW1lU3BhY2UudGl0bGUpXSksXHJcbiAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7IGRpc3BsYXk6IGNsb3NlZCA/ICdub25lJzogJ2Jsb2NrJywgcGFkZGluZ0xlZnQ6ICcxMHB4JywgcGFkZGluZ0JvdHRvbTogJzVweCcsIGJvcmRlckxlZnQ6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHN0YXRlSWQgPyAnMnB4IHNvbGlkICNlYWI2NWMnIDonMnB4IHNvbGlkICNiZGJkYmQnLCB0cmFuc2l0aW9uOiAnYm9yZGVyLWNvbG9yIDAuMnMnfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4uY3VycmVudE5hbWVTcGFjZS5jaGlsZHJlbi5tYXAoKHJlZik9PiByZWYucmVmID09PSAnc3RhdGUnID8gbGlzdFN0YXRlKHJlZi5pZCk6IGxpc3ROYW1lU3BhY2UocmVmLmlkKSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtkaXNwbGF5OiBzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBzdGF0ZUlkID8gJ2lubGluZS1ibG9jayc6ICdub25lJywgY3Vyc29yOiAncG9pbnRlcicsIGJvcmRlclJhZGl1czogJzVweCcsIGJvcmRlcjogJzNweCBzb2xpZCAjZWFiNjVjJywgcGFkZGluZzogJzVweCcsIG1hcmdpbjogJzVweCd9LCBvbjoge2NsaWNrOiBbQUREX1NUQVRFLCBzdGF0ZUlkLCAndGV4dCddfX0sICcrIHRleHQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2Rpc3BsYXk6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHN0YXRlSWQgPyAnaW5saW5lLWJsb2NrJzogJ25vbmUnLCBjdXJzb3I6ICdwb2ludGVyJywgYm9yZGVyUmFkaXVzOiAnNXB4JywgYm9yZGVyOiAnM3B4IHNvbGlkICNlYWI2NWMnLCBwYWRkaW5nOiAnNXB4JywgbWFyZ2luOiAnNXB4J30sIG9uOiB7Y2xpY2s6IFtBRERfU1RBVEUsIHN0YXRlSWQsICdudW1iZXInXX19LCAnKyBudW1iZXInKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9oKCdzcGFuJywge3N0eWxlOiB7ZGlzcGxheTogc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gc3RhdGVJZCA/ICdpbmxpbmUtYmxvY2snOiAnbm9uZScsIGN1cnNvcjogJ3BvaW50ZXInLCBib3JkZXJSYWRpdXM6ICc1cHgnLCBib3JkZXI6ICczcHggc29saWQgI2VhYjY1YycsIHBhZGRpbmc6ICc1cHgnLCBtYXJnaW46ICc1cHgnfSwgb246IHtjbGljazogW0FERF9TVEFURSwgc3RhdGVJZCwgJ2Jvb2xlYW4nXX19LCAnKyB2YXJpYW50JyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vaCgnc3BhbicsIHtzdHlsZToge2Rpc3BsYXk6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHN0YXRlSWQgPyAnaW5saW5lLWJsb2NrJzogJ25vbmUnLCBjdXJzb3I6ICdwb2ludGVyJywgYm9yZGVyUmFkaXVzOiAnNXB4JywgYm9yZGVyOiAnM3B4IHNvbGlkICNlYWI2NWMnLCBwYWRkaW5nOiAnNXB4JywgbWFyZ2luOiAnNXB4J30sIG9uOiB7Y2xpY2s6IFtBRERfU1RBVEUsIHN0YXRlSWQsICd0YWJsZSddfX0sICcrIHRhYmxlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtkaXNwbGF5OiBzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBzdGF0ZUlkID8gJ2lubGluZS1ibG9jayc6ICdub25lJywgY3Vyc29yOiAncG9pbnRlcicsIGJvcmRlclJhZGl1czogJzVweCcsIGJvcmRlcjogJzNweCBzb2xpZCAjZWFiNjVjJywgcGFkZGluZzogJzVweCcsIG1hcmdpbjogJzVweCd9LCBvbjoge2NsaWNrOiBbQUREX1NUQVRFLCBzdGF0ZUlkLCAnbmFtZXNwYWNlJ119fSwgJysgZm9sZGVyJyksXHJcbiAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gbGlzdFN0YXRlKHN0YXRlSWQpIHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudFN0YXRlID0gc3RhdGUuZGVmaW5pdGlvbi5zdGF0ZVtzdGF0ZUlkXVxyXG4gICAgICAgICAgICBmdW5jdGlvbiBlZGl0aW5nTm9kZSgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBoKCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBzdGF0ZS5zZWxlY3RlZFN0YXRlTm9kZUlkID09PSBzdGF0ZUlkID8gJyNlYWI2NWMnOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJveFNoYWRvdzogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMnB4IDVweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbjogJzNweCAzcHggMCAwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiAnMnB4IHNvbGlkICcgKyAoc3RhdGUuc2VsZWN0ZWRTdGF0ZU5vZGVJZCA9PT0gc3RhdGVJZCA/ICcjZWFiNjVjJzogJyNiZGJkYmQnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250OiAnaW5oZXJpdCdcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBbQ0hBTkdFX1NUQVRFX05PREVfVElUTEUsIHN0YXRlSWRdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbGl2ZVByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBjdXJyZW50U3RhdGUudGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBhdHRyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvZm9jdXM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLWlzdGl0bGVlZGl0b3InOiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udFNpemU6ICcwLjhlbScsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBbXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtvbjoge2NsaWNrOiBbU1RBVEVfTk9ERV9TRUxFQ1RFRCwgc3RhdGVJZF0sIGRibGNsaWNrOiBbRURJVF9WSUVXX05PREVfVElUTEUsIHN0YXRlSWRdfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuZWRpdGluZ1RpdGxlTm9kZUlkID09PSBzdGF0ZUlkID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVkaXRpbmdOb2RlKCk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7Y29sb3I6IHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHN0YXRlSWQgPyAnI2VhYjY1Yyc6ICd3aGl0ZScsIHBhZGRpbmc6ICcycHggNXB4JywgbWFyZ2luOiAnN3B4IDNweCAycHggMCcsIGJvcmRlcjogJzJweCBzb2xpZCAnICsgKHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHN0YXRlSWQgPyAnI2VhYjY1Yyc6ICcjYmRiZGJkJyksIGJvcmRlclJhZGl1czogJzEwcHgnLCBkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgdHJhbnNpdGlvbjogJ2FsbCAwLjJzJ319LCBjdXJyZW50U3RhdGUudGl0bGUpLFxyXG4gICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCAnOiAnKSxcclxuICAgICAgICAgICAgICAgICAgICAoKCk9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5vU3R5bGVJbnB1dCA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBhcHAuZ2V0Q3VycmVudFN0YXRlKClbc3RhdGVJZF0gIT0gc3RhdGUuZGVmaW5pdGlvbi5zdGF0ZVtzdGF0ZUlkXS5kZWZhdWx0VmFsdWUgPyAncmdiKDkxLCAyMDQsIDkxKScgOiAnd2hpdGUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0bGluZTogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYm94U2hhZG93OiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWF4V2lkdGg6ICc1MCUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmKGN1cnJlbnRTdGF0ZS50eXBlID09PSAndGV4dCcpIHJldHVybiBoKCdpbnB1dCcsIHthdHRyczoge3R5cGU6ICd0ZXh0J30sIGxpdmVQcm9wczoge3ZhbHVlOiBhcHAuZ2V0Q3VycmVudFN0YXRlKClbc3RhdGVJZF19LCBzdHlsZTogbm9TdHlsZUlucHV0LCBvbjoge2lucHV0OiBbQ0hBTkdFX0NVUlJFTlRfU1RBVEVfVEVYVF9WQUxVRSwgc3RhdGVJZF19fSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoY3VycmVudFN0YXRlLnR5cGUgPT09ICdudW1iZXInKSByZXR1cm4gaCgnc3BhbicsIHtzdHlsZToge3Bvc2l0aW9uOiAncmVsYXRpdmUnfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2lucHV0Jywge2F0dHJzOiB7dHlwZTogJ251bWJlcid9LCBsaXZlUHJvcHM6IHt2YWx1ZTogYXBwLmdldEN1cnJlbnRTdGF0ZSgpW3N0YXRlSWRdfSwgc3R5bGU6IHsuLi5ub1N0eWxlSW5wdXQsIHdpZHRoOiA5KmFwcC5nZXRDdXJyZW50U3RhdGUoKVtzdGF0ZUlkXS50b1N0cmluZygpLmxlbmd0aCArICdweCd9LCBvbjoge2lucHV0OiBbQ0hBTkdFX0NVUlJFTlRfU1RBVEVfTlVNQkVSX1ZBTFVFLCBzdGF0ZUlkXX19KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3N2ZycsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHt3aWR0aDogNiwgaGVpZ2h0OiA4fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcicsIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6ICcwJywgcmlnaHQ6ICctMTJweCcsIHBhZGRpbmc6ICcxcHggMnB4IDNweCAycHgnLCB0cmFuc2Zvcm06J3JvdGF0ZSgtOTBkZWcpJ30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGljazogW0lOQ1JFTUVOVF9DVVJSRU5UX1NUQVRFX05VTUJFUl9WQUxVRSwgc3RhdGVJZF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtoKCdwb2x5Z29uJywge2F0dHJzOiB7cG9pbnRzOiAnNiw0IDAsMCAyLDQgMCw4JywgZmlsbDogJ3doaXRlJ319KV0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3ZnJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRyczoge3dpZHRoOiA2LCBoZWlnaHQ6IDh9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJywgcG9zaXRpb246ICdhYnNvbHV0ZScsIGJvdHRvbTogJzAnLCByaWdodDogJy0xMnB4JywgcGFkZGluZzogJzNweCAycHggMXB4IDJweCcsIHRyYW5zZm9ybToncm90YXRlKDkwZGVnKSd9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpY2s6IFtERUNSRU1FTlRfQ1VSUkVOVF9TVEFURV9OVU1CRVJfVkFMVUUsIHN0YXRlSWRdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbaCgncG9seWdvbicsIHthdHRyczoge3BvaW50czogJzYsNCAwLDAgMiw0IDAsOCcsIGZpbGw6ICd3aGl0ZSd9fSldKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoY3VycmVudFN0YXRlLnR5cGUgPT09ICd0YWJsZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhYmxlID0gYXBwLmdldEN1cnJlbnRTdGF0ZSgpW3N0YXRlSWRdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpblRvcDogJzNweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzgyODE4MycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogJzEwMCUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2Rpc3BsYXk6ICdmbGV4J319LCAgT2JqZWN0LmtleXMoY3VycmVudFN0YXRlLmRlZmluaXRpb24pLm1hcChrZXkgPT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtmbGV4OiAnMScsIHBhZGRpbmc6ICcycHggNXB4JywgYm9yZGVyQm90dG9tOiAnMnB4IHNvbGlkIHdoaXRlJ319LCBrZXkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC4uLk9iamVjdC5rZXlzKHRhYmxlKS5tYXAoaWQgPT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2Rpc3BsYXk6ICdmbGV4J319LCBPYmplY3Qua2V5cyh0YWJsZVtpZF0pLm1hcChrZXkgPT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtmbGV4OiAnMScsIHBhZGRpbmc6ICcycHggNXB4J319LCB0YWJsZVtpZF1ba2V5XSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KSgpLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLnNlbGVjdGVkU3RhdGVOb2RlSWQgPT09IHN0YXRlSWQgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywgY3VycmVudFN0YXRlLm11dGF0b3JzLm1hcChyZWYgPT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtjb2xvcjogc3RhdGUuYWN0aXZlRXZlbnQgPT09IHN0YXRlLmRlZmluaXRpb24ubXV0YXRvcltyZWYuaWRdLmV2ZW50LmlkID8gJyM1YmNjNWInOiAnd2hpdGUnLCB0cmFuc2l0aW9uOiAnYWxsIDAuMnMnLCBib3hTaGFkb3c6IHN0YXRlLnNlbGVjdGVkRXZlbnRJZCA9PT0gc3RhdGUuZGVmaW5pdGlvbi5tdXRhdG9yW3JlZi5pZF0uZXZlbnQuaWQgPyAnIzViY2M1YiA1cHggMCAwcHggMHB4IGluc2V0JzogJ25vbmUnLCBwYWRkaW5nOiAnMCAwIDAgN3B4J30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGljazogW1NFTEVDVF9FVkVOVCwgc3RhdGUuZGVmaW5pdGlvbi5tdXRhdG9yW3JlZi5pZF0uZXZlbnQuaWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGJsY2xpY2s6IFtFRElUX0VWRU5UX1RJVExFLCBzdGF0ZS5kZWZpbml0aW9uLm11dGF0b3JbcmVmLmlkXS5ldmVudC5pZF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICfigKIgJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQgPT09IHN0YXRlLmRlZmluaXRpb24ubXV0YXRvcltyZWYuaWRdLmV2ZW50LmlkID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnaW5wdXQnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm94U2hhZG93OiAnaW5zZXQgMCAtMXB4IDAgMCB3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcmdpbjogICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnaW5saW5lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250OiAnaW5oZXJpdCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBbQ0hBTkdFX0VWRU5UX1RJVExFLCBzdGF0ZS5kZWZpbml0aW9uLm11dGF0b3JbcmVmLmlkXS5ldmVudC5pZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGl2ZVByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHN0YXRlLmRlZmluaXRpb24uZXZlbnRbc3RhdGUuZGVmaW5pdGlvbi5tdXRhdG9yW3JlZi5pZF0uZXZlbnQuaWRdLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b2ZvY3VzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLWlzdGl0bGVlZGl0b3InOiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogc3RhdGUuZGVmaW5pdGlvbi5ldmVudFtzdGF0ZS5kZWZpbml0aW9uLm11dGF0b3JbcmVmLmlkXS5ldmVudC5pZF0udGl0bGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRFdmVudElkID09PSBzdGF0ZS5kZWZpbml0aW9uLm11dGF0b3JbcmVmLmlkXS5ldmVudC5pZCA/IGgoJ2RpdicsIHtzdHlsZToge21hcmdpbkxlZnQ6ICcxMHB4J319LCBbZW1iZXJFZGl0b3Ioc3RhdGUuZGVmaW5pdGlvbi5tdXRhdG9yW3JlZi5pZF0ubXV0YXRpb24sIGN1cnJlbnRTdGF0ZS50eXBlKV0pOiBoKCdkaXYnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICkpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicpLFxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzdGF0ZUNvbXBvbmVudCA9IGgoJ2RpdicsIHtzdHlsZToge292ZXJmbG93OiAnYXV0bycsIGZsZXg6ICcxJywgcGFkZGluZzogJzZweCAxNXB4J30sIG9uOiB7Y2xpY2s6IFtVTlNFTEVDVF9TVEFURV9OT0RFXX19LCBbbGlzdE5hbWVTcGFjZSgnX3Jvb3ROYW1lU3BhY2UnKV0pXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxpc3RCb3hOb2RlKG5vZGVSZWYsIHBhcmVudFJlZiwgcG9zaXRpb24pIHtcclxuICAgICAgICAgICAgY29uc3Qgbm9kZUlkID0gbm9kZVJlZi5pZFxyXG4gICAgICAgICAgICBjb25zdCBwYXJlbnRJZCA9IHBhcmVudFJlZi5pZFxyXG4gICAgICAgICAgICBjb25zdCBub2RlID0gc3RhdGUuZGVmaW5pdGlvbltub2RlUmVmLnJlZl1bbm9kZUlkXVxyXG4gICAgICAgICAgICBmdW5jdGlvbiBlZGl0aW5nTm9kZSgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBoKCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyM1M0IyRUQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRsaW5lOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYm94U2hhZG93OiAnaW5zZXQgMCAtMXB4IDAgMCAjNTNCMkVEJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9udDogJ2luaGVyaXQnXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnB1dDogW0NIQU5HRV9WSUVXX05PREVfVElUTEUsIG5vZGVSZWZdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbGl2ZVByb3BzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBub2RlLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b2ZvY3VzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pc3RpdGxlZWRpdG9yJzogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgY2xvc2VkID0gc3RhdGUudmlld0ZvbGRlcnNDbG9zZWRbbm9kZUlkXVxyXG4gICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3ZnJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzOiB7d2lkdGg6IDEyLCBoZWlnaHQ6IDE2fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJywgcGFkZGluZzogJzAgNXB4JywgdHJhbnNmb3JtOiBjbG9zZWQgPyAncm90YXRlKDBkZWcpJzogJ3JvdGF0ZSg5MGRlZyknLCB0cmFuc2l0aW9uOiAnYWxsIDAuMnMnLCBtYXJnaW5MZWZ0OiAnLTNweCd9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsaWNrOiBbVklFV19GT0xERVJfQ0xJQ0tFRCwgbm9kZUlkXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW2goJ3BvbHlnb24nLCB7YXR0cnM6IHtwb2ludHM6ICcxMiw4IDAsMSAzLDggMCwxNSd9LCBzdHlsZToge2ZpbGw6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJ3doaXRlJywgdHJhbnNpdGlvbjogJ2ZpbGwgMC4ycyd9fSldKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3ZnJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzOiB7d2lkdGg6IDE0LCBoZWlnaHQ6IDE0fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogeyBjdXJzb3I6ICdwb2ludGVyJywgcGFkZGluZzogJzAgNXB4IDAgMCd9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7Y2xpY2s6IFtWSUVXX05PREVfU0VMRUNURUQsIG5vZGVSZWZdfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVSZWYucmVmID09PSAndk5vZGVCb3gnID8gW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdyZWN0Jywge2F0dHJzOiB7eDogMSwgeTogMSwgd2lkdGg6IDEyLCBoZWlnaHQ6IDEyLCBmaWxsOiAnbm9uZScsIHRyYW5zaXRpb246ICdhbGwgMC4ycycsc3Ryb2tlOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnIzUzQjJFRCc6ICd3aGl0ZScsICdzdHJva2Utd2lkdGgnOiAnMid9fSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlUmVmLnJlZiA9PT0gJ3ZOb2RlTGlzdCcgPyBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdjaXJjbGUnLCB7YXR0cnM6IHtyOiAyLCBjeDogMiwgY3k6IDIsIHRyYW5zaXRpb246ICdhbGwgMC4ycycsIGZpbGw6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJ3doaXRlJyx9fSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdyZWN0Jywge2F0dHJzOiB7eDogNiwgeTogMSwgd2lkdGg6IDEwLCB0cmFuc2l0aW9uOiAnYWxsIDAuMnMnLCBoZWlnaHQ6IDIsIGZpbGw6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJ3doaXRlJyx9fSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdjaXJjbGUnLCB7YXR0cnM6IHtyOiAyLCBjeDogMiwgY3k6IDcsIHRyYW5zaXRpb246ICdhbGwgMC4ycycsIGZpbGw6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJ3doaXRlJyx9fSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdyZWN0Jywge2F0dHJzOiB7eDogNiwgeTogNiwgd2lkdGg6IDEwLCB0cmFuc2l0aW9uOiAnYWxsIDAuMnMnLCBoZWlnaHQ6IDIsIGZpbGw6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJ3doaXRlJyx9fSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdjaXJjbGUnLCB7YXR0cnM6IHtyOiAyLCBjeDogMiwgY3k6IDEyLCB0cmFuc2l0aW9uOiAnYWxsIDAuMnMnLCBmaWxsOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnIzUzQjJFRCc6ICd3aGl0ZScsfX0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgncmVjdCcsIHthdHRyczoge3g6IDYsIHk6IDExLCB3aWR0aDogMTAsIHRyYW5zaXRpb246ICdhbGwgMC4ycycsIGhlaWdodDogMiwgZmlsbDogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJyM1M0IyRUQnOiAnd2hpdGUnLH19KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXSA6IFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3RleHQnLCB7YXR0cnM6IHsgeDoyLCB5OjE0LCBmaWxsOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnIzUzQjJFRCc6ICd3aGl0ZSd9fSwgJ2lmJyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuZWRpdGluZ1RpdGxlTm9kZUlkID09PSBub2RlSWQgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWRpdGluZ05vZGUoKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7IHN0eWxlOiB7ZmxleDogJzEnLCBjdXJzb3I6ICdwb2ludGVyJywgY29sb3I6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJ3doaXRlJywgdHJhbnNpdGlvbjogJ2NvbG9yIDAuMnMnfSwgb246IHtjbGljazogW1ZJRVdfTk9ERV9TRUxFQ1RFRCwgbm9kZVJlZl0sIGRibGNsaWNrOiBbRURJVF9WSUVXX05PREVfVElUTEUsIG5vZGVJZF19fSwgbm9kZS50aXRsZSksXHJcbiAgICAgICAgICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7IGRpc3BsYXk6IGNsb3NlZCA/ICdub25lJzogJ2Jsb2NrJywgbWFyZ2luTGVmdDogJzdweCcsIHBhZGRpbmdMZWZ0OiAnMTBweCcsIGJvcmRlckxlZnQ6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcycHggc29saWQgIzUzQjJFRCcgOiAnMnB4IHNvbGlkICNiZGJkYmQnLCB0cmFuc2l0aW9uOiAnYm9yZGVyLWNvbG9yIDAuMnMnfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4ubm9kZS5jaGlsZHJlbi5tYXAoKHJlZiwgaW5kZXgpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZihyZWYucmVmID09PSAndk5vZGVUZXh0JykgcmV0dXJuIGxpc3RUZXh0Tm9kZShyZWYsIG5vZGVSZWYsIGluZGV4KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVmLnJlZiA9PT0gJ3ZOb2RlQm94JyB8fCByZWYucmVmID09PSAndk5vZGVMaXN0JyB8fCByZWYucmVmID09PSAndk5vZGVJZicpIHJldHVybiBsaXN0Qm94Tm9kZShyZWYsIG5vZGVSZWYsIGluZGV4KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYocmVmLnJlZiA9PT0gJ3ZOb2RlSW5wdXQnKSByZXR1cm4gbGlzdElucHV0Tm9kZShyZWYsIG5vZGVSZWYsIGluZGV4KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2Rpc3BsYXk6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICdpbmxpbmUtYmxvY2snOiAnbm9uZScsIGN1cnNvcjogJ3BvaW50ZXInLCBib3JkZXJSYWRpdXM6ICc1cHgnLCBib3JkZXI6ICczcHggc29saWQgIzUzQjJFRCcsIHBhZGRpbmc6ICc1cHgnLCBtYXJnaW46ICc1cHgnfSwgb246IHtjbGljazogW0FERF9OT0RFLCBub2RlUmVmLCAnYm94J119fSwgJysgYm94JyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtkaXNwbGF5OiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnaW5saW5lLWJsb2NrJzogJ25vbmUnLCBjdXJzb3I6ICdwb2ludGVyJywgYm9yZGVyUmFkaXVzOiAnNXB4JywgYm9yZGVyOiAnM3B4IHNvbGlkICM1M0IyRUQnLCBwYWRkaW5nOiAnNXB4JywgbWFyZ2luOiAnNXB4J30sIG9uOiB7Y2xpY2s6IFtBRERfTk9ERSwgbm9kZVJlZiwgJ3RleHQnXX19LCAnKyB0ZXh0JyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtkaXNwbGF5OiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnaW5saW5lLWJsb2NrJzogJ25vbmUnLCBjdXJzb3I6ICdwb2ludGVyJywgYm9yZGVyUmFkaXVzOiAnNXB4JywgYm9yZGVyOiAnM3B4IHNvbGlkICM1M0IyRUQnLCBwYWRkaW5nOiAnNXB4JywgbWFyZ2luOiAnNXB4J30sIG9uOiB7Y2xpY2s6IFtBRERfTk9ERSwgbm9kZVJlZiwgJ2lucHV0J119fSwgJysgaW5wdXQnKSxcclxuICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbiA+IDAgPyBoKCdzdmcnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHt3aWR0aDogNiwgaGVpZ2h0OiA4fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge2Rpc3BsYXk6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICdibG9jayc6ICdub25lJywgY3Vyc29yOiAncG9pbnRlcicsIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6ICcwJywgcmlnaHQ6ICcyNXB4JywgcGFkZGluZzogJzFweCAycHggM3B4IDJweCcsIHRyYW5zZm9ybToncm90YXRlKC05MGRlZyknfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGljazogW01PVkVfVklFV19OT0RFLCBwYXJlbnRSZWYsIHBvc2l0aW9uLCAtMV1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtoKCdwb2x5Z29uJywge2F0dHJzOiB7cG9pbnRzOiAnNiw0IDAsMCAyLDQgMCw4JywgZmlsbDogJ3doaXRlJ319KV0pOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJyksXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50SWQgJiYgcG9zaXRpb24gPCBzdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdW3BhcmVudElkXS5jaGlsZHJlbi5sZW5ndGgtMSA/IGgoJ3N2ZycsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRyczoge3dpZHRoOiA2LCBoZWlnaHQ6IDh9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7ZGlzcGxheTogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJ2Jsb2NrJzogJ25vbmUnLCBjdXJzb3I6ICdwb2ludGVyJywgcG9zaXRpb246ICdhYnNvbHV0ZScsIGJvdHRvbTogJzAnLCByaWdodDogJzI1cHgnLCBwYWRkaW5nOiAnM3B4IDJweCAxcHggMnB4JywgdHJhbnNmb3JtOidyb3RhdGUoOTBkZWcpJ30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpY2s6IFtNT1ZFX1ZJRVdfTk9ERSwgcGFyZW50UmVmLCBwb3NpdGlvbiwgMV1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtoKCdwb2x5Z29uJywge2F0dHJzOiB7cG9pbnRzOiAnNiw0IDAsMCAyLDQgMCw4JywgZmlsbDogJ3doaXRlJ319KV0pOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJyksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7Y3Vyc29yOiAncG9pbnRlcicsIGRpc3BsYXk6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICdibG9jayc6ICdub25lJywgcG9zaXRpb246ICdhYnNvbHV0ZScsIHJpZ2h0OiAnNXB4JywgdG9wOiAnMCd9LCBvbjoge2NsaWNrOiBbREVMRVRFX1NFTEVDVEVEX1ZJRVcsIG5vZGVSZWYsIHBhcmVudFJlZl19fSwgJ3gnKSxcclxuICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBsaXN0VGV4dE5vZGUobm9kZVJlZiwgcGFyZW50UmVmLCBwb3NpdGlvbikge1xyXG4gICAgICAgICAgICBjb25zdCBub2RlSWQgPSBub2RlUmVmLmlkXHJcbiAgICAgICAgICAgIGNvbnN0IHBhcmVudElkID0gcGFyZW50UmVmLmlkXHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBzdGF0ZS5kZWZpbml0aW9uLnZOb2RlVGV4dFtub2RlSWRdXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGVkaXRpbmdOb2RlKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2lucHV0Jywge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzUzQjJFRCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICdpbnNldCAwIC0xcHggMCAwICM1M0IyRUQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250OiAnaW5oZXJpdCdcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBbQ0hBTkdFX1ZJRVdfTk9ERV9USVRMRSwgbm9kZVJlZl0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBsaXZlUHJvcHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG5vZGUudGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBhdHRyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvZm9jdXM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLWlzdGl0bGVlZGl0b3InOiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb246IHtjbGljazogW1ZJRVdfTk9ERV9TRUxFQ1RFRCwgbm9kZVJlZl0sIGRibGNsaWNrOiBbRURJVF9WSUVXX05PREVfVElUTEUsIG5vZGVJZF19XHJcbiAgICAgICAgICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnc3ZnJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHt2aWV3Qm94OiAnMCAwIDMwMCAzMDAnLCB3aWR0aDogMTQsIGhlaWdodDogMTR9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHsgY3Vyc29yOiAncG9pbnRlcicsIHBhZGRpbmc6ICcwIDdweCAwIDAnfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgncGF0aCcsIHthdHRyczoge2Q6ICdNIDAgMCBMIDAgODUuODEyNSBMIDI3LjAzMTI1IDg1LjgxMjUgQyAzNi42MTc3ODYgNDQuMzQ2MzE2IDY3Ljg3NjU3OSA0Mi4xNzk3OTMgMTA2LjkwNjI1IDQyLjU5Mzc1IEwgMTA2LjkwNjI1IDIyOC4zNzUgQyAxMDcuMzExMDEgMjc5LjA5NjQxIDk4LjkwODM4NiAyNzcuMzM2MDIgNjIuMTI1IDI3Ny41IEwgNjIuMTI1IDI5OS41NjI1IEwgMTQ5IDI5OS41NjI1IEwgMTUwLjAzMTI1IDI5OS41NjI1IEwgMjM2LjkwNjI1IDI5OS41NjI1IEwgMjM2LjkwNjI1IDI3Ny41IEMgMjAwLjEyMjg2IDI3Ny4zMzYgMTkxLjcyMDI0IDI3OS4wOTYzOSAxOTIuMTI1IDIyOC4zNzUgTCAxOTIuMTI1IDQyLjU5Mzc1IEMgMjMxLjE1NDY3IDQyLjE3OTc1IDI2Mi40MTM0NiA0NC4zNDYzMDQgMjcyIDg1LjgxMjUgTCAyOTkuMDMxMjUgODUuODEyNSBMIDI5OS4wMzEyNSAwIEwgMTUwLjAzMTI1IDAgTCAxNDkgMCBMIDAgMCB6JywgZmlsbDogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJyM1M0IyRUQnOiAnd2hpdGUnfX0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmVkaXRpbmdUaXRsZU5vZGVJZCA9PT0gbm9kZUlkID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgZWRpdGluZ05vZGUoKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZToge2NvbG9yOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnIzUzQjJFRCc6ICd3aGl0ZScsIHRyYW5zaXRpb246ICdjb2xvciAwLjJzJ319LCBub2RlLnRpdGxlKSxcclxuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbiA+IDAgPyBoKCdzdmcnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHt3aWR0aDogNiwgaGVpZ2h0OiA4fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge2Rpc3BsYXk6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICdibG9jayc6ICdub25lJywgY3Vyc29yOiAncG9pbnRlcicsIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCB0b3A6ICcwJywgcmlnaHQ6ICcyNXB4JywgcGFkZGluZzogJzFweCAycHggM3B4IDJweCcsIHRyYW5zZm9ybToncm90YXRlKC05MGRlZyknfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGljazogW01PVkVfVklFV19OT0RFLCBwYXJlbnRSZWYsIHBvc2l0aW9uLCAtMV1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtoKCdwb2x5Z29uJywge2F0dHJzOiB7cG9pbnRzOiAnNiw0IDAsMCAyLDQgMCw4JywgZmlsbDogJ3doaXRlJ319KV0pOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJyksXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24gPCBzdGF0ZS5kZWZpbml0aW9uW3BhcmVudFJlZi5yZWZdW3BhcmVudElkXS5jaGlsZHJlbi5sZW5ndGgtMSA/IGgoJ3N2ZycsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRyczoge3dpZHRoOiA2LCBoZWlnaHQ6IDh9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7ZGlzcGxheTogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJ2Jsb2NrJzogJ25vbmUnLCBjdXJzb3I6ICdwb2ludGVyJywgcG9zaXRpb246ICdhYnNvbHV0ZScsIGJvdHRvbTogJzAnLCByaWdodDogJzI1cHgnLCBwYWRkaW5nOiAnM3B4IDJweCAxcHggMnB4JywgdHJhbnNmb3JtOidyb3RhdGUoOTBkZWcpJ30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpY2s6IFtNT1ZFX1ZJRVdfTk9ERSwgcGFyZW50UmVmLCBwb3NpdGlvbiwgMV1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtoKCdwb2x5Z29uJywge2F0dHJzOiB7cG9pbnRzOiAnNiw0IDAsMCAyLDQgMCw4JywgZmlsbDogJ3doaXRlJ319KV0pOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJyksXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZGlzcGxheTogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJ2Jsb2NrJzogJ25vbmUnLCBwb3NpdGlvbjogJ2Fic29sdXRlJywgcmlnaHQ6ICc1cHgnLCB0b3A6ICcwJ30sIG9uOiB7Y2xpY2s6IFtERUxFVEVfU0VMRUNURURfVklFVywgbm9kZVJlZiwgcGFyZW50UmVmXX19LCAneCcpXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gbGlzdElucHV0Tm9kZShub2RlUmVmLCBwYXJlbnRSZWYsIHBvc2l0aW9uKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5vZGVJZCA9IG5vZGVSZWYuaWRcclxuICAgICAgICAgICAgY29uc3QgcGFyZW50SWQgPSBwYXJlbnRSZWYuaWRcclxuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IHN0YXRlLmRlZmluaXRpb24udk5vZGVJbnB1dFtub2RlSWRdXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGVkaXRpbmdOb2RlKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2lucHV0Jywge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAnIzUzQjJFRCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICdpbnNldCAwIC0xcHggMCAwICM1M0IyRUQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb250OiAnaW5oZXJpdCdcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBbQ0hBTkdFX1ZJRVdfTk9ERV9USVRMRSwgbm9kZVJlZl0sXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBsaXZlUHJvcHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IG5vZGUudGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBhdHRyczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvZm9jdXM6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLWlzdGl0bGVlZGl0b3InOiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb246IHtjbGljazogW1ZJRVdfTk9ERV9TRUxFQ1RFRCwgbm9kZVJlZl0sIGRibGNsaWNrOiBbRURJVF9WSUVXX05PREVfVElUTEUsIG5vZGVJZF19XHJcbiAgICAgICAgICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgaCgnc3ZnJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHt2aWV3Qm94OiAnMCAwIDE2IDE2Jywgd2lkdGg6IDE0LCBoZWlnaHQ6IDE0fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7IGN1cnNvcjogJ3BvaW50ZXInLCBwYWRkaW5nOiAnMCA3cHggMCAwJ30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3BhdGgnLCB7YXR0cnM6IHtkOiAnTSAxNSwyIDExLDIgQyAxMC40NDcsMiAxMCwxLjU1MiAxMCwxIDEwLDAuNDQ4IDEwLjQ0NywwIDExLDAgbCA0LDAgYyAwLjU1MywwIDEsMC40NDggMSwxIDAsMC41NTIgLTAuNDQ3LDEgLTEsMSB6IG0gLTIsMTQgYyAtMC41NTMsMCAtMSwtMC40NDcgLTEsLTEgTCAxMiwxIGMgMCwtMC41NTIgMC40NDcsLTEgMSwtMSAwLjU1MywwIDEsMC40NDggMSwxIGwgMCwxNCBjIDAsMC41NTMgLTAuNDQ3LDEgLTEsMSB6IG0gMiwwIC00LDAgYyAtMC41NTMsMCAtMSwtMC40NDcgLTEsLTEgMCwtMC41NTMgMC40NDcsLTEgMSwtMSBsIDQsMCBjIDAuNTUzLDAgMSwwLjQ0NyAxLDEgMCwwLjU1MyAtMC40NDcsMSAtMSwxIHonLCBmaWxsOiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnIzUzQjJFRCc6ICd3aGl0ZSd9fSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdwYXRoJywge2F0dHJzOiB7ZDogJ00gOS44MTE0ODI3LDQuMjM2MDM5MyBDIDkuNjU0NzM1Nyw0LjU4NjU5MDYgOS4zMDM5OTMzLDQuODI5NTg1NCA4Ljg5NTcyMzMsNC44Mjg4Njg0IEwgMS4yOTY4OTI2LDQuODExNTQwNCAxLjMxNjk0MzYsMi44MDY0NDcgOC45MDA2Mzc3LDIuODI4NjQyIGMgMC41NTI0NDgsMC4wMDE2NSAwLjk5OTMwNzQsMC40NTAxMjIzIDAuOTk3NjU2NCwxLjAwMjU2OTggLTIuMWUtNSwwLjE0NDU4NTYgLTAuMDMxMywwLjI4MDY3MzQgLTAuMDg2ODEsMC40MDQ4MjcgeicsIGZpbGw6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJ3doaXRlJ319KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3BhdGgnLCB7YXR0cnM6IHtkOiAnbSA5LjgxMTQ4MjcsMTEuNzM4NTYyIGMgLTAuMTU2NzQ3LDAuMzUwNTUxIC0wLjUwNzQ4OTQsMC41OTM1NDYgLTAuOTE1NzU5NCwwLjU5MjgyOSBsIC03LjU5ODgzMDcsLTAuMDE3MzMgMC4wMjAwNTEsLTIuMDA1MDkzIDcuNTgzNjk0MSwwLjAyMjE5IGMgMC41NTI0NDgsMC4wMDE2IDAuOTk5MzA3NCwwLjQ1MDEyMiAwLjk5NzY1NjQsMS4wMDI1NyAtMi4xZS01LDAuMTQ0NTg1IC0wLjAzMTMsMC4yODA2NzMgLTAuMDg2ODEsMC40MDQ4MjcgeicsIGZpbGw6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICcjNTNCMkVEJzogJ3doaXRlJ319KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3BhdGgnLCB7YXR0cnM6IHtkOiAnbSAxLjI5NDA1ODMsMTIuMjM5ODM2IDAuMDE3MDQsLTkuNDQ1MDk0NyAxLjk3MTQ4NTIsMC4wMjQ5MjMgLTAuMDIxODE4LDkuNDI2Mjc5NyB6JywgZmlsbDogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJyM1M0IyRUQnOiAnd2hpdGUnfX0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQgPT09IG5vZGVJZCA/XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVkaXRpbmdOb2RlKCk6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtjb2xvcjogc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5pZCA9PT0gbm9kZUlkID8gJyM1M0IyRUQnOiAnd2hpdGUnLCB0cmFuc2l0aW9uOiAnY29sb3IgMC4ycyd9fSwgbm9kZS50aXRsZSksXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb24gPiAwID8gaCgnc3ZnJywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzOiB7d2lkdGg6IDYsIGhlaWdodDogOH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtkaXNwbGF5OiBzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkID09PSBub2RlSWQgPyAnYmxvY2snOiAnbm9uZScsIGN1cnNvcjogJ3BvaW50ZXInLCBwb3NpdGlvbjogJ2Fic29sdXRlJywgdG9wOiAnMCcsIHJpZ2h0OiAnMjVweCcsIHBhZGRpbmc6ICcxcHggMnB4IDNweCAycHgnLCB0cmFuc2Zvcm06J3JvdGF0ZSgtOTBkZWcpJ30sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xpY2s6IFtNT1ZFX1ZJRVdfTk9ERSwgcGFyZW50UmVmLCBwb3NpdGlvbiwgLTFdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbaCgncG9seWdvbicsIHthdHRyczoge3BvaW50czogJzYsNCAwLDAgMiw0IDAsOCcsIGZpbGw6ICd3aGl0ZSd9fSldKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicpLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uIDwgc3RhdGUuZGVmaW5pdGlvbltwYXJlbnRSZWYucmVmXVtwYXJlbnRJZF0uY2hpbGRyZW4ubGVuZ3RoLTEgPyBoKCdzdmcnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHt3aWR0aDogNiwgaGVpZ2h0OiA4fSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZToge2Rpc3BsYXk6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICdibG9jayc6ICdub25lJywgY3Vyc29yOiAncG9pbnRlcicsIHBvc2l0aW9uOiAnYWJzb2x1dGUnLCBib3R0b206ICcwJywgcmlnaHQ6ICcyNXB4JywgcGFkZGluZzogJzNweCAycHggMXB4IDJweCcsIHRyYW5zZm9ybToncm90YXRlKDkwZGVnKSd9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsaWNrOiBbTU9WRV9WSUVXX05PREUsIHBhcmVudFJlZiwgcG9zaXRpb24sIDFdXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbaCgncG9seWdvbicsIHthdHRyczoge3BvaW50czogJzYsNCAwLDAgMiw0IDAsOCcsIGZpbGw6ICd3aGl0ZSd9fSldKTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicpLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2Rpc3BsYXk6IHN0YXRlLnNlbGVjdGVkVmlld05vZGUuaWQgPT09IG5vZGVJZCA/ICdibG9jayc6ICdub25lJywgcG9zaXRpb246ICdhYnNvbHV0ZScsIHJpZ2h0OiAnNXB4JywgdG9wOiAnMCd9LCBvbjoge2NsaWNrOiBbREVMRVRFX1NFTEVDVEVEX1ZJRVcsIG5vZGVSZWYsIHBhcmVudFJlZl19fSwgJ3gnKVxyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICApXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBwcm9wc0NvbXBvbmVudCA9IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IHN0YXRlLnNlbGVjdGVkVmlld1N1Yk1lbnUgPT09ICdwcm9wcycgPyAnIzRkNGQ0ZCc6ICcjM2QzZDNkJyxcclxuICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcxMnB4IDE1cHggOHB4JyxcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICAgICAgdG9wOiAnMCcsXHJcbiAgICAgICAgICAgICAgICBsZWZ0OiAnNnB4JyxcclxuICAgICAgICAgICAgICAgIHpJbmRleDogc3RhdGUuc2VsZWN0ZWRWaWV3U3ViTWVudSA9PT0gJ3Byb3BzJyA/ICc1MDAnOiAnMCcsXHJcbiAgICAgICAgICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclJhZGl1czogJzE1cHggMTVweCAwIDAnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjMjIyJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlclN0eWxlOiAnc29saWQnLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyV2lkdGg6ICczcHggM3B4IDAgM3B4JyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb246IHtcclxuICAgICAgICAgICAgICAgIGNsaWNrOiBbU0VMRUNUX1ZJRVdfU1VCTUVOVSwgJ3Byb3BzJ11cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sICdwcm9wcycpXHJcbiAgICAgICAgY29uc3Qgc3R5bGVDb21wb25lbnQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBzdGF0ZS5zZWxlY3RlZFZpZXdTdWJNZW51ID09PSAnc3R5bGUnID8gJyM0ZDRkNGQnOiAnIzNkM2QzZCcsXHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTJweCAxNXB4IDhweCcsXHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcclxuICAgICAgICAgICAgICAgIHRvcDogJzAnLFxyXG4gICAgICAgICAgICAgICAgbGVmdDogJzkxcHgnLFxyXG4gICAgICAgICAgICAgICAgekluZGV4OiBzdGF0ZS5zZWxlY3RlZFZpZXdTdWJNZW51ID09PSAnc3R5bGUnID8gJzUwMCc6ICcwJyxcclxuICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTVweCAxNXB4IDAgMCcsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyMyMjInLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyU3R5bGU6ICdzb2xpZCcsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogJzNweCAzcHggMCAzcHgnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgY2xpY2s6IFtTRUxFQ1RfVklFV19TVUJNRU5VLCAnc3R5bGUnXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgJ3N0eWxlJylcclxuICAgICAgICBjb25zdCBldmVudHNDb21wb25lbnQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBzdGF0ZS5zZWxlY3RlZFZpZXdTdWJNZW51ID09PSAnZXZlbnRzJyA/ICcjNGQ0ZDRkJzogJyMzZDNkM2QnLFxyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzEycHggMTVweCA4cHgnLFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgIGxlZnQ6ICcxNjVweCcsXHJcbiAgICAgICAgICAgICAgICB6SW5kZXg6IHN0YXRlLnNlbGVjdGVkVmlld1N1Yk1lbnUgPT09ICdldmVudHMnID8gJzUwMCc6ICcwJyxcclxuICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMTVweCAxNXB4IDAgMCcsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyMyMjInLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyU3R5bGU6ICdzb2xpZCcsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJXaWR0aDogJzNweCAzcHggMCAzcHgnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgY2xpY2s6IFtTRUxFQ1RfVklFV19TVUJNRU5VLCAnZXZlbnRzJ11cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sICdldmVudHMnKVxyXG4gICAgICAgIGNvbnN0IHVuc2VsZWN0Q29tcG9uZW50ID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyM0ZDRkNGQnLFxyXG4gICAgICAgICAgICAgICAgcGFkZGluZzogJzE1cHggMjNweCA1cHgnLFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICB0b3A6ICcwJyxcclxuICAgICAgICAgICAgICAgIHJpZ2h0OiAnMTZweCcsXHJcbiAgICAgICAgICAgICAgICB6SW5kZXg6ICcxMDAnLFxyXG4gICAgICAgICAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxNXB4IDE1cHggMCAwJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiAnIzIyMicsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJTdHlsZTogJ3NvbGlkJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcldpZHRoOiAnM3B4IDNweCAwIDNweCcsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICBjbGljazogW1VOU0VMRUNUX1ZJRVdfTk9ERV1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sICd4JylcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2VuZXJhdGVFZGl0Tm9kZUNvbXBvbmVudCgpIHtcclxuICAgICAgICAgICAgY29uc3Qgc3R5bGVzID0gWydiYWNrZ3JvdW5kJywgJ2JvcmRlcicsICdvdXRsaW5lJywgJ2N1cnNvcicsICdjb2xvcicsICdkaXNwbGF5JywgJ3RvcCcsICdib3R0b20nLCAnbGVmdCcsICdyaWdodCcsICdwb3NpdGlvbicsICdvdmVyZmxvdycsICdoZWlnaHQnLCAnd2lkdGgnLCAnZm9udCcsICdmb250JywgJ21hcmdpbicsICdwYWRkaW5nJywgJ3VzZXJTZWxlY3QnXVxyXG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZE5vZGUgPSBzdGF0ZS5kZWZpbml0aW9uW3N0YXRlLnNlbGVjdGVkVmlld05vZGUucmVmXVtzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLmlkXVxyXG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZFN0eWxlID0gc3RhdGUuZGVmaW5pdGlvbi5zdHlsZVtzZWxlY3RlZE5vZGUuc3R5bGUuaWRdXHJcbiAgICAgICAgICAgIGNvbnN0IHN0eWxlRWRpdG9yQ29tcG9uZW50ID0gaCgnZGl2Jywge3N0eWxlOiB7fX0sXHJcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhzZWxlY3RlZFN0eWxlKS5tYXAoKGtleSk9PmgoJ2RpdicsIFtoKCdpbnB1dCcsIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICdpbnNldCAwIC0xcHggMCAwIHdoaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheTogJ2lubGluZS1ibG9jaycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnMTYwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW46ICcxMHB4JyxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHByb3BzOiB7dmFsdWU6IHNlbGVjdGVkU3R5bGVba2V5XX0sXHJcbiAgICAgICAgICAgICAgICAgICAgb246IHtpbnB1dDogW0NIQU5HRV9TVFlMRSwgc2VsZWN0ZWROb2RlLnN0eWxlLmlkLCBrZXldfX0pLFxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCBrZXkpXSkpXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICAgY29uc3QgYWRkU3R5bGVDb21wb25lbnQgPSBoKCdkaXYnLCB7c3R5bGU6IHt9fSxcclxuICAgICAgICAgICAgICAgIHN0eWxlc1xyXG4gICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoKGtleSk9PiFPYmplY3Qua2V5cyhzZWxlY3RlZFN0eWxlKS5pbmNsdWRlcyhrZXkpKVxyXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoKGtleSk9PmgoJ2RpdicsIHtvbjoge2NsaWNrOiBbQUREX0RFRkFVTFRfU1RZTEUsIHNlbGVjdGVkTm9kZS5zdHlsZS5pZCwga2V5XX0sc3R5bGU6e2Rpc3BsYXk6ICdpbmxpbmUtYmxvY2snLCBjdXJzb3I6ICdwb2ludGVyJywgYm9yZGVyUmFkaXVzOiAnNXB4JywgYm9yZGVyOiAnM3B4IHNvbGlkIHdoaXRlJywgcGFkZGluZzogJzVweCcsIG1hcmdpbjogJzVweCd9fSwgJysgJyArIGtleSkpXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICAgICAgZnVuY3Rpb24gZ2VuZXJhdGVQcm9wc01lbnUoKSB7XHJcbiAgICAgICAgICAgICAgICBpZihzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZiA9PT0gJ3ZOb2RlQm94Jyl7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtzdHlsZToge3RleHRBbGlnbjogJ2NlbnRlcicsIG1hcmdpblRvcDogJzEwMHB4JywgY29sb3I6ICcjYmRiZGJkJyB9fSwgJ0NvbXBvbmVudCBoYXMgbm8gcHJvcHMnKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYoc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZVRleHQnKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZ1RvcDogJzIwcHgnfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZGlzcGxheTonZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBiYWNrZ3JvdW5kOiAnIzY3Njc2NycsIHBhZGRpbmc6ICc1cHggMTBweCcsIG1hcmdpbkJvdHRvbTogJzEwcHgnfX0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3NwYW4nLCB7c3R5bGU6IHtmbGV4OiAnMSd9fSwgJ3RleHQgdmFsdWUnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2ZsZXg6ICcwJywgY3Vyc29yOiAnZGVmYXVsdCcsIGNvbG9yOiAnI2JkYmRiZCd9fSwgJ3RleHQnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7cGFkZGluZzogJzVweCAxMHB4J319LCBbZW1iZXJFZGl0b3Ioc2VsZWN0ZWROb2RlLnZhbHVlLCAndGV4dCcpXSlcclxuICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYoc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPT09ICd2Tm9kZUlucHV0Jyl7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtzdHlsZToge3BhZGRpbmdUb3A6ICcyMHB4J319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZToge2Rpc3BsYXk6J2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgYmFja2dyb3VuZDogJyM2NzY3NjcnLCBwYWRkaW5nOiAnNXB4IDEwcHgnLCBtYXJnaW5Cb3R0b206ICcxMHB4J319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge3N0eWxlOiB7ZmxleDogJzEnfX0sICdpbnB1dCB2YWx1ZScpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzAnLCBjdXJzb3I6ICdkZWZhdWx0JywgY29sb3I6ICcjYmRiZGJkJ319LCAndGV4dCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtwYWRkaW5nOiAnNXB4IDEwcHgnfX0sIFtlbWJlckVkaXRvcihzZWxlY3RlZE5vZGUudmFsdWUsICd0ZXh0JyldKVxyXG4gICAgICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZihzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZiA9PT0gJ3ZOb2RlTGlzdCcpe1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7c3R5bGU6IHt0ZXh0QWxpZ246ICdjZW50ZXInLCBtYXJnaW5Ub3A6ICcxMDBweCcsIGNvbG9yOiAnI2JkYmRiZCcgfX0sICdUT0RPIEFERCBQUk9QUycpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZihzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZiA9PT0gJ3ZOb2RlSWYnKXtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaCgnZGl2Jywge3N0eWxlOiB7dGV4dEFsaWduOiAnY2VudGVyJywgbWFyZ2luVG9wOiAnMTAwcHgnLCBjb2xvcjogJyNiZGJkYmQnIH19LCAnVE9ETyBBREQgUFJPUFMnKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHByb3BzU3VibWVudUNvbXBvbmVudCA9IGgoJ2RpdicsIFtnZW5lcmF0ZVByb3BzTWVudSgpXSlcclxuICAgICAgICAgICAgY29uc3Qgc3R5bGVTdWJtZW51Q29tcG9uZW50ID0gaCgnZGl2JywgW3N0eWxlRWRpdG9yQ29tcG9uZW50LCBhZGRTdHlsZUNvbXBvbmVudF0pXHJcbiAgICAgICAgICAgIGxldCBhdmFpbGFibGVFdmVudHMgPSBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdvbiBjbGljaycsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lOiAnY2xpY2snXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnZG91YmxlIGNsaWNrZWQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZTogJ2RibGNsaWNrJ1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ21vdXNlIG92ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZTogJ21vdXNlb3ZlcidcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdtb3VzZSBvdXQnLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZTogJ21vdXNlb3V0J1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICBpZihzdGF0ZS5zZWxlY3RlZFZpZXdOb2RlLnJlZiA9PT0gJ3ZOb2RlSW5wdXQnKXtcclxuICAgICAgICAgICAgICAgIGF2YWlsYWJsZUV2ZW50cyA9IGF2YWlsYWJsZUV2ZW50cy5jb25jYXQoW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdpbnB1dCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZTogJ2lucHV0J1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ2ZvY3VzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHlOYW1lOiAnZm9jdXMnXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnYmx1cicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5TmFtZTogJ2JsdXInXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgY3VycmVudEV2ZW50cyA9IGF2YWlsYWJsZUV2ZW50cy5maWx0ZXIoKGV2ZW50KT0+c2VsZWN0ZWROb2RlW2V2ZW50LnByb3BlcnR5TmFtZV0pXHJcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50c0xlZnQgPSBhdmFpbGFibGVFdmVudHMuZmlsdGVyKChldmVudCk9PiFzZWxlY3RlZE5vZGVbZXZlbnQucHJvcGVydHlOYW1lXSlcclxuICAgICAgICAgICAgY29uc3QgZXZlbnRzU3VibWVudUNvbXBvbmVudCA9IGgoJ2RpdicsIHsgc3R5bGU6IHtwYWRkaW5nVG9wOiAnMjBweCd9fSwgZXZlbnRzTGVmdC5tYXAoKGV2ZW50KT0+XHJcbiAgICAgICAgICAgICAgICBoKCdkaXYnLCB7c3R5bGU6IHtkaXNwbGF5OiAnaW5saW5lLWJsb2NrJywgYm9yZGVyOiAnM3B4IHNvbGlkICM1YmNjNWInLCBib3JkZXJSYWRpdXM6ICc1cHgnLCBjdXJzb3I6ICdwb2ludGVyJywgcGFkZGluZzogJzVweCcsIG1hcmdpbjogJzEwcHgnfSwgb246e2NsaWNrOiBbQUREX0VWRU5ULCBldmVudC5wcm9wZXJ0eU5hbWVdfX0sICcrICcgKyBldmVudC5kZXNjcmlwdGlvbiksXHJcbiAgICAgICAgICAgICkuY29uY2F0KGN1cnJlbnRFdmVudHMubGVuZ3RoID9cclxuICAgICAgICAgICAgICAgIGN1cnJlbnRFdmVudHMubWFwKChldmVudCk9PlxyXG4gICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7YmFja2dyb3VuZDogJyM2NzY3NjcnLCBwYWRkaW5nOiAnNXB4IDEwcHgnfX0sIGV2ZW50LmRlc2NyaXB0aW9uKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaCgnZGl2JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NvbG9yOiBzdGF0ZS5hY3RpdmVFdmVudCA9PT0gc2VsZWN0ZWROb2RlW2V2ZW50LnByb3BlcnR5TmFtZV0uaWQgPyAnIzViY2M1Yic6ICd3aGl0ZScsIHRyYW5zaXRpb246ICdjb2xvciAwLjJzJywgZm9udFNpemU6ICcwLjhlbScsIGN1cnNvcjogJ3BvaW50ZXInLCBwYWRkaW5nOiAnNXB4IDEwcHgnLCBib3hTaGFkb3c6IHN0YXRlLnNlbGVjdGVkRXZlbnRJZCA9PT0gc2VsZWN0ZWROb2RlW2V2ZW50LnByb3BlcnR5TmFtZV0uaWQgPyAnIzViY2M1YiA1cHggMCAwcHggMHB4IGluc2V0JzogJ25vbmUnfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGljazogW1NFTEVDVF9FVkVOVCwgc2VsZWN0ZWROb2RlW2V2ZW50LnByb3BlcnR5TmFtZV0uaWRdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYmxjbGljazogW0VESVRfRVZFTlRfVElUTEUsIHNlbGVjdGVkTm9kZVtldmVudC5wcm9wZXJ0eU5hbWVdLmlkXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdzcGFuJywge30sIFtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ+KAoiAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5lZGl0aW5nVGl0bGVOb2RlSWQgPT09IHNlbGVjdGVkTm9kZVtldmVudC5wcm9wZXJ0eU5hbWVdLmlkID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2lucHV0Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICd3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dGxpbmU6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm94U2hhZG93OiAnaW5zZXQgMCAtMXB4IDAgMCB3aGl0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luOiAgJzAnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXI6ICdub25lJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdpbmxpbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb250OiAnaW5oZXJpdCdcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlucHV0OiBbQ0hBTkdFX0VWRU5UX1RJVExFLCBzZWxlY3RlZE5vZGVbZXZlbnQucHJvcGVydHlOYW1lXS5pZF0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsaXZlUHJvcHM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHN0YXRlLmRlZmluaXRpb24uZXZlbnRbc2VsZWN0ZWROb2RlW2V2ZW50LnByb3BlcnR5TmFtZV0uaWRdLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXR0cnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b2ZvY3VzOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1pc3RpdGxlZWRpdG9yJzogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IHN0YXRlLmRlZmluaXRpb24uZXZlbnRbc2VsZWN0ZWROb2RlW2V2ZW50LnByb3BlcnR5TmFtZV0uaWRdLnRpdGxlXVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cclxuICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgIF0pKSA6XHJcbiAgICAgICAgICAgICAgICBbXSkpXHJcbiAgICAgICAgICAgIHJldHVybiBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGxlZnQ6ICctOHB4JyxcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUoLTEwMCUsIDApJyxcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW5SaWdodDogJzhweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgYm90dG9tOiAnNnB4JyxcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICc1MCUnLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXk6ICdmbGV4JyxcclxuICAgICAgICAgICAgICAgICAgICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7ZmxleDogJzEnLCBtYXhIZWlnaHQ6ICc0M3B4JywgbWluSGVpZ2h0OiAnNDNweCcsIHBvc2l0aW9uOiAncmVsYXRpdmUnLCBtYXJnaW5Ub3A6ICc2cHgnfX0sIFtldmVudHNDb21wb25lbnQsIHN0eWxlQ29tcG9uZW50LCBwcm9wc0NvbXBvbmVudCwgdW5zZWxlY3RDb21wb25lbnRdKSxcclxuICAgICAgICAgICAgICAgIGgoJ2RpdicsIHsgc3R5bGU6IHtmbGV4OiAnMScsIG92ZXJmbG93OiAnYXV0bycsIGJhY2tncm91bmQ6ICcjNGQ0ZDRkJywgYm9yZGVyUmFkaXVzOiAnMTBweCcsIHdpZHRoOiBzdGF0ZS5zdWJFZGl0b3JXaWR0aCArICdweCcsIGJvcmRlcjogJzNweCBzb2xpZCAjMjIyJ319LFtcclxuICAgICAgICAgICAgICAgICAgICBkcmFnU3ViQ29tcG9uZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLnNlbGVjdGVkVmlld1N1Yk1lbnUgPT09ICdwcm9wcycgPyBwcm9wc1N1Ym1lbnVDb21wb25lbnQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLnNlbGVjdGVkVmlld1N1Yk1lbnUgPT09ICdzdHlsZScgPyBzdHlsZVN1Ym1lbnVDb21wb25lbnQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5zZWxlY3RlZFZpZXdTdWJNZW51ID09PSAnZXZlbnRzJyA/IGV2ZW50c1N1Ym1lbnVDb21wb25lbnQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaCgnc3BhbicsICdFcnJvciwgbm8gc3VjaCBtZW51JylcclxuICAgICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgIF0pXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCB2aWV3Q29tcG9uZW50ID0gaCgnZGl2Jywge3N0eWxlOiB7b3ZlcmZsb3c6ICdhdXRvJywgcG9zaXRpb246ICdyZWxhdGl2ZScsIGZsZXg6ICcxJywgYm9yZGVyVG9wOiAnM3B4IHNvbGlkICMyMjInLCBwYWRkaW5nOiAnNnB4IDhweCd9LCBvbjoge2NsaWNrOiBbVU5TRUxFQ1RfVklFV19OT0RFXX19LCBbXHJcbiAgICAgICAgICAgIGxpc3RCb3hOb2RlKHtyZWY6ICd2Tm9kZUJveCcsIGlkOidfcm9vdE5vZGUnfSwge30pLFxyXG4gICAgICAgIF0pXHJcblxyXG4gICAgICAgIGNvbnN0IHJpZ2h0Q29tcG9uZW50ID1cclxuICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdmaXhlZCcsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAnMCcsXHJcbiAgICAgICAgICAgICAgICAgICAgcmlnaHQ6ICcwJyxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6ICcxMDAlJyxcclxuICAgICAgICAgICAgICAgICAgICBmb250OiBcIjMwMCAxLjJlbSAnT3BlbiBTYW5zJ1wiLFxyXG4gICAgICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6ICcxLjJlbScsXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHN0YXRlLmVkaXRvclJpZ2h0V2lkdGggKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjNGQ0ZDRkJyxcclxuICAgICAgICAgICAgICAgICAgICBib3hTaXppbmc6IFwiYm9yZGVyLWJveFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGJvcmRlckxlZnQ6ICczcHggc29saWQgIzIyMicsXHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjogJzAuNXMgdHJhbnNmb3JtJyxcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm06IHN0YXRlLnJpZ2h0T3BlbiA/ICd0cmFuc2xhdGVaKDApIHRyYW5zbGF0ZVgoMCUpJzogJ3RyYW5zbGF0ZVooMCkgdHJhbnNsYXRlWCgxMDAlKScsXHJcbiAgICAgICAgICAgICAgICAgICAgdXNlclNlbGVjdDogJ25vbmUnLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgZHJhZ0NvbXBvbmVudFJpZ2h0LFxyXG4gICAgICAgICAgICAgICAgc3RhdGVDb21wb25lbnQsXHJcbiAgICAgICAgICAgICAgICB2aWV3Q29tcG9uZW50LFxyXG4gICAgICAgICAgICAgICAgc3RhdGUuc2VsZWN0ZWRWaWV3Tm9kZS5yZWYgPyBnZW5lcmF0ZUVkaXROb2RlQ29tcG9uZW50KCk6IGgoJ3NwYW4nKVxyXG4gICAgICAgICAgICBdKVxyXG5cclxuXHJcbiAgICAgICAgY29uc3QgdG9wQ29tcG9uZW50ID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgZmxleDogJzEgYXV0bycsXHJcbiAgICAgICAgICAgICAgICBoZWlnaHQ6ICc3NXB4JyxcclxuICAgICAgICAgICAgICAgIG1heEhlaWdodDogJzc1cHgnLFxyXG4gICAgICAgICAgICAgICAgbWluSGVpZ2h0OiAnNzVweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzIyMicsXHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OidmbGV4J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICBoKCdhJywge3N0eWxlOiB7ZmxleDogJzAgYXV0bycsIHdpZHRoOiAnMTkwcHgnLCB0ZXh0RGVjb3JhdGlvbjogJ2luaGVyaXQnLCB1c2VyU2VsZWN0OiAnbm9uZSd9LCBhdHRyczoge2hyZWY6Jy9fZGV2J319LCBbXHJcbiAgICAgICAgICAgICAgICBoKCdpbWcnLHtzdHlsZTogeyBtYXJnaW46ICc3cHggLTJweCAtM3B4IDVweCcsIGRpc3BsYXk6ICdpbmxpbmUtYmxvY2snfSwgYXR0cnM6IHtzcmM6ICcvaW1hZ2VzL2xvZ28yNTZ4MjU2LnBuZycsIGhlaWdodDogJzU3J319KSxcclxuICAgICAgICAgICAgICAgIGgoJ3NwYW4nLHtzdHlsZTogeyBmb250U2l6ZTonNDRweCcsIGZvbnRGYW1pbHk6IFwiJ0NvbWZvcnRhYScsIHNhbnMtc2VyaWZcIiwgdmVydGljYWxBbGlnbjogJ2JvdHRvbScsIGNvbG9yOiAnI2ZmZid9fSwgJ3VnbmlzJylcclxuICAgICAgICAgICAgXSksXHJcbiAgICAgICAgXSlcclxuICAgICAgICBjb25zdCBsZWZ0Q29tcG9uZW50ID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2ZpeGVkJyxcclxuICAgICAgICAgICAgICAgIHRvcDogJzAnLFxyXG4gICAgICAgICAgICAgICAgbGVmdDogJzAnLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwJScsXHJcbiAgICAgICAgICAgICAgICBjb2xvcjogJ3doaXRlJyxcclxuICAgICAgICAgICAgICAgIGZvbnQ6IFwiMzAwIDEuMmVtICdPcGVuIFNhbnMnXCIsXHJcbiAgICAgICAgICAgICAgICBsaW5lSGVpZ2h0OiAnMS4yZW0nLFxyXG4gICAgICAgICAgICAgICAgd2lkdGg6IHN0YXRlLmVkaXRvckxlZnRXaWR0aCArICdweCcsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiAnIzRkNGQ0ZCcsXHJcbiAgICAgICAgICAgICAgICBib3hTaXppbmc6IFwiYm9yZGVyLWJveFwiLFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyUmlnaHQ6ICczcHggc29saWQgIzIyMicsXHJcbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiAnMC41cyB0cmFuc2Zvcm0nLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiBzdGF0ZS5sZWZ0T3BlbiA/ICd0cmFuc2xhdGVaKDApIHRyYW5zbGF0ZVgoMCUpJzogJ3RyYW5zbGF0ZVooMCkgdHJhbnNsYXRlWCgtMTAwJSknLFxyXG4gICAgICAgICAgICAgICAgdXNlclNlbGVjdDogJ25vbmUnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sIFtcclxuICAgICAgICAgICAgZHJhZ0NvbXBvbmVudExlZnQsXHJcbiAgICAgICAgICAgIGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgICAgIG9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xpY2s6IEZSRUVaRVJfQ0xJQ0tFRFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmxleDogJzAgYXV0bycsXHJcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogJzEwcHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJyMzMzMnLFxyXG4gICAgICAgICAgICAgICAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgW1xyXG4gICAgICAgICAgICAgICAgaCgnc3BhbicsIHtzdHlsZTogeyBwYWRkaW5nOiAnMTVweCAxNXB4IDEwcHggMTVweCcsIGNvbG9yOiBzdGF0ZS5hcHBJc0Zyb3plbiA/ICdyZ2IoOTEsIDIwNCwgOTEpJyA6ICdyZ2IoMjA0LCA5MSwgOTEpJ319LCBzdGF0ZS5hcHBJc0Zyb3plbiA/ICfilronIDogJ+KdmuKdmicpLFxyXG4gICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgaCgnZGl2Jywge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsZXg6ICcxIGF1dG8nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiAnMTBweCcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJmbG93OiAnYXV0bydcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgZXZlbnRTdGFja1xyXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoKGEpPT5hKVxyXG4gICAgICAgICAgICAgICAgICAgIC5yZXZlcnNlKClcclxuICAgICAgICAgICAgICAgICAgICAubWFwKGV2ZW50ID0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZTogeyBwYWRkaW5nOiAnNXB4JywgY29sb3I6ICcjZmZmZmZmJ319LCBbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5kZWZpbml0aW9uLmV2ZW50W2V2ZW50LmV2ZW50TmFtZV0udGl0bGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCBPYmplY3Qua2V5cyhldmVudC5tdXRhdGlvbnMpLm1hcChzdGF0ZUlkID0+IHN0YXRlLmRlZmluaXRpb24uc3RhdGVbc3RhdGVJZF0udGl0bGUgKyAnOiAnICsgZXZlbnQubXV0YXRpb25zW3N0YXRlSWRdLnRvU3RyaW5nKCkpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxyXG4gICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIF0pXHJcbiAgICAgICAgY29uc3QgcmVuZGVyVmlld0NvbXBvbmVudCA9IGgoJ2RpdicsIHtcclxuICAgICAgICAgICAgc3R5bGU6IHtcclxuICAgICAgICAgICAgICAgIGZsZXg6ICcxIGF1dG8nLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZDogYFxyXG4gICAgICAgICAgICAgICAgICAgIHJhZGlhbC1ncmFkaWVudChibGFjayA1JSwgdHJhbnNwYXJlbnQgMTYlKSAwIDAsXHJcbiAgICAgICAgICAgICAgICAgICAgcmFkaWFsLWdyYWRpZW50KGJsYWNrIDUlLCB0cmFuc3BhcmVudCAxNiUpIDhweCA4cHgsXHJcbiAgICAgICAgICAgICAgICAgICAgcmFkaWFsLWdyYWRpZW50KHJnYmEoMjU1LDI1NSwyNTUsLjEpIDUlLCB0cmFuc3BhcmVudCAyMCUpIDAgMXB4LFxyXG4gICAgICAgICAgICAgICAgICAgIHJhZGlhbC1ncmFkaWVudChyZ2JhKDI1NSwyNTUsMjU1LC4xKSA1JSwgdHJhbnNwYXJlbnQgMjAlKSA4cHggOXB4YCxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjonIzMzMycsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kU2l6ZTonMTZweCAxNnB4JyxcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVooMCknLFxyXG4gICAgICAgICAgICAgICAgZGlzcGxheToncmVsYXRpdmUnLFxyXG4gICAgICAgICAgICAgICAgb3ZlcmZsb3c6ICdhdXRvJyxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9LCBbXHJcbiAgICAgICAgICAgIGgoJ2RpdicsIHtzdHlsZTogKCgpPT57XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkZXNpcmVkV2lkdGggPSAxOTIwXHJcbiAgICAgICAgICAgICAgICBjb25zdCBkZXNpcmVkSGVpZ2h0ID0gMTA4MFxyXG4gICAgICAgICAgICAgICAgY29uc3QgdG9wTWVudUhlaWdodCA9IDc1XHJcbiAgICAgICAgICAgICAgICBjb25zdCB3aWR0aExlZnQgPSB3aW5kb3cuaW5uZXJXaWR0aCAtIChzdGF0ZS5lZGl0b3JMZWZ0V2lkdGggKyBzdGF0ZS5lZGl0b3JSaWdodFdpZHRoKVxyXG4gICAgICAgICAgICAgICAgY29uc3QgaGVpZ2h0TGVmdCA9IHdpbmRvdy5pbm5lckhlaWdodCAtIHRvcE1lbnVIZWlnaHRcclxuICAgICAgICAgICAgICAgIGxldCBzY2FsZVggPSB3aWR0aExlZnQgPCBkZXNpcmVkV2lkdGggPyB3aWR0aExlZnQvZGVzaXJlZFdpZHRoOiAxXHJcbiAgICAgICAgICAgICAgICBsZXQgc2NhbGVZID0gaGVpZ2h0TGVmdCA8IGRlc2lyZWRIZWlnaHQgPyBoZWlnaHRMZWZ0L2Rlc2lyZWRIZWlnaHQ6IDFcclxuICAgICAgICAgICAgICAgIGlmKHNjYWxlWCA+IHNjYWxlWSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlWCA9IHNjYWxlWVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBzY2FsZVkgPSBzY2FsZVhcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IGRlc2lyZWRXaWR0aCArJ3B4JyxcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGRlc2lyZWRIZWlnaHQgKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICcjZmZmZmZmJyxcclxuICAgICAgICAgICAgICAgICAgICBib3hTaGFkb3c6ICdyZ2JhKDAsIDAsIDAsIDAuMjQ3MDU5KSAwcHggMTRweCA0NXB4LCByZ2JhKDAsIDAsIDAsIDAuMjE5NjA4KSAwcHggMTBweCAxOHB4JyxcclxuICAgICAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGVaKDApIHNjYWxlKCcrIHNjYWxlWCArICcsJysgc2NhbGVZICsnKScsXHJcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAoaGVpZ2h0TGVmdC1kZXNpcmVkSGVpZ2h0KS8yICsgJ3B4JyxcclxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiAod2lkdGhMZWZ0LWRlc2lyZWRXaWR0aCkvMitzdGF0ZS5lZGl0b3JMZWZ0V2lkdGggKyAncHgnLFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KSgpfSwgW1xyXG4gICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7YmFja2dyb3VuZDogJyM5M2QxZjcnLCB3aWR0aDogJzEwMCUnLCBoZWlnaHQ6ICc0MHB4JywgcG9zaXRpb246J2Fic29sdXRlJywgdG9wOiAnLTQwcHgnLCBkaXNwbGF5OiAnZmxleCcsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGxlZnQ6ICcwJywgYm9yZGVyUmFkaXVzOiAnNXB4IDVweCAwIDAnLCBib3hTaGFkb3c6ICdpbnNldCAwIC0zcHggMCAwICNiN2I3YjcnfX0sICd0b2RvOiB1cmwsIHdpZHRoIGFuZCBoZWlnaHQsIGNsb3NlIGJ1dHRvbicpLFxyXG4gICAgICAgICAgICAgICAgaCgnZGl2Jywge3N0eWxlOiB7b3ZlcmZsb3c6ICdhdXRvJywgd2lkdGg6ICcxMDAlJywgaGVpZ2h0OiAnMTAwJSd9fSwgW2FwcC52ZG9tXSlcclxuICAgICAgICAgICAgXSlcclxuICAgICAgICBdKVxyXG4gICAgICAgIGNvbnN0IG1haW5Sb3dDb21wb25lbnQgPSBoKCdkaXYnLCB7XHJcbiAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiAnZmxleCcsXHJcbiAgICAgICAgICAgICAgICBmbGV4OiAnMScsXHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcclxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVooMCknLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sIFtcclxuICAgICAgICAgICAgcmVuZGVyVmlld0NvbXBvbmVudCxcclxuICAgICAgICAgICAgbGVmdENvbXBvbmVudCxcclxuICAgICAgICAgICAgcmlnaHRDb21wb25lbnRcclxuICAgICAgICBdKVxyXG4gICAgICAgIGNvbnN0IHZub2RlID0gaCgnZGl2Jywge1xyXG4gICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheTogJ2ZsZXgnLFxyXG4gICAgICAgICAgICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2ZpeGVkJyxcclxuICAgICAgICAgICAgICAgIHRvcDogJzAnLFxyXG4gICAgICAgICAgICAgICAgcmlnaHQ6ICcwJyxcclxuICAgICAgICAgICAgICAgIHdpZHRoOiAnMTAwdncnLFxyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAnMTAwdmgnLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0sIFtcclxuICAgICAgICAgICAgdG9wQ29tcG9uZW50LFxyXG4gICAgICAgICAgICBtYWluUm93Q29tcG9uZW50LFxyXG4gICAgICAgIF0pXHJcblxyXG4gICAgICAgIG5vZGUgPSBwYXRjaChub2RlLCB2bm9kZSlcclxuICAgIH1cclxuXHJcbiAgICByZW5kZXIoKVxyXG59IiwiZnVuY3Rpb24gdXBkYXRlUHJvcHMob2xkVm5vZGUsIHZub2RlKSB7XHJcbiAgICB2YXIga2V5LCBjdXIsIG9sZCwgZWxtID0gdm5vZGUuZWxtLFxyXG4gICAgICAgIHByb3BzID0gdm5vZGUuZGF0YS5saXZlUHJvcHMgfHwge307XHJcbiAgICBmb3IgKGtleSBpbiBwcm9wcykge1xyXG4gICAgICAgIGN1ciA9IHByb3BzW2tleV07XHJcbiAgICAgICAgb2xkID0gZWxtW2tleV07XHJcbiAgICAgICAgaWYgKG9sZCAhPT0gY3VyKSBlbG1ba2V5XSA9IGN1cjtcclxuICAgIH1cclxufVxyXG5jb25zdCBsaXZlUHJvcHNQbHVnaW4gPSB7Y3JlYXRlOiB1cGRhdGVQcm9wcywgdXBkYXRlOiB1cGRhdGVQcm9wc307XHJcbmltcG9ydCBzbmFiYmRvbSBmcm9tICdzbmFiYmRvbSdcclxuY29uc3QgcGF0Y2ggPSBzbmFiYmRvbS5pbml0KFtcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvY2xhc3MnKSxcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvcHJvcHMnKSxcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvc3R5bGUnKSxcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvZXZlbnRsaXN0ZW5lcnMnKSxcclxuICAgIHJlcXVpcmUoJ3NuYWJiZG9tL21vZHVsZXMvYXR0cmlidXRlcycpLFxyXG4gICAgbGl2ZVByb3BzUGx1Z2luXHJcbl0pO1xyXG5pbXBvcnQgaCBmcm9tICdzbmFiYmRvbS9oJztcclxuaW1wb3J0IGJpZyBmcm9tICdiaWcuanMnO1xyXG5cclxuZnVuY3Rpb24gZmxhdHRlbihhcnIpIHtcclxuICAgIHJldHVybiBhcnIucmVkdWNlKGZ1bmN0aW9uIChmbGF0LCB0b0ZsYXR0ZW4pIHtcclxuICAgICAgICByZXR1cm4gZmxhdC5jb25jYXQoQXJyYXkuaXNBcnJheSh0b0ZsYXR0ZW4pID8gZmxhdHRlbih0b0ZsYXR0ZW4pIDogdG9GbGF0dGVuKTtcclxuICAgIH0sIFtdKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgKGRlZmluaXRpb24pID0+IHtcclxuXHJcbiAgICBsZXQgY3VycmVudFN0YXRlID0gT2JqZWN0LmtleXMoZGVmaW5pdGlvbi5zdGF0ZSkubWFwKGtleT0+ZGVmaW5pdGlvbi5zdGF0ZVtrZXldKS5yZWR1Y2UoKGFjYywgZGVmKT0+IHtcclxuICAgICAgICBhY2NbZGVmLnJlZl0gPSBkZWYuZGVmYXVsdFZhbHVlXHJcbiAgICAgICAgcmV0dXJuIGFjY1xyXG4gICAgfSwge30pXHJcblxyXG4gICAgLy8gQWxsb3dzIHN0b3BpbmcgYXBwbGljYXRpb24gaW4gZGV2ZWxvcG1lbnQuIFRoaXMgaXMgbm90IGFuIGFwcGxpY2F0aW9uIHN0YXRlXHJcbiAgICBsZXQgZnJvemVuID0gZmFsc2VcclxuICAgIGxldCBmcm96ZW5DYWxsYmFjayA9IG51bGxcclxuICAgIGxldCBzZWxlY3RIb3ZlckFjdGl2ZSA9IGZhbHNlXHJcbiAgICBsZXQgc2VsZWN0ZWROb2RlSW5EZXZlbG9wbWVudCA9IHt9XHJcblxyXG4gICAgZnVuY3Rpb24gc2VsZWN0Tm9kZUhvdmVyKHJlZiwgZSkge1xyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKClcclxuICAgICAgICBzZWxlY3RlZE5vZGVJbkRldmVsb3BtZW50ID0gcmVmXHJcbiAgICAgICAgZnJvemVuQ2FsbGJhY2socmVmKVxyXG4gICAgICAgIHJlbmRlcigpXHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBzZWxlY3ROb2RlQ2xpY2socmVmLCBlKSB7XHJcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgICAgIHNlbGVjdEhvdmVyQWN0aXZlID0gZmFsc2VcclxuICAgICAgICBzZWxlY3RlZE5vZGVJbkRldmVsb3BtZW50ID0gcmVmXHJcbiAgICAgICAgZnJvemVuQ2FsbGJhY2socmVmKVxyXG4gICAgICAgIHJlbmRlcigpXHJcbiAgICB9XHJcblxyXG4gICAgLy8gZ2xvYmFsIHN0YXRlIGZvciByZXNvbHZlclxyXG4gICAgbGV0IGN1cnJlbnRFdmVudCA9IG51bGxcclxuICAgIGxldCBjdXJyZW50TWFwVmFsdWUgPSB7fVxyXG4gICAgbGV0IGN1cnJlbnRNYXBJbmRleCA9IHt9XHJcbiAgICBsZXQgZXZlbnREYXRhID0ge31cclxuICAgIGZ1bmN0aW9uIHJlc29sdmUocmVmKXtcclxuICAgICAgICBpZihyZWYgPT09IHVuZGVmaW5lZCl7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBzdGF0aWMgdmFsdWUgKHN0cmluZy9udW1iZXIpXHJcbiAgICAgICAgaWYocmVmLnJlZiA9PT0gdW5kZWZpbmVkKXtcclxuICAgICAgICAgICAgcmV0dXJuIHJlZlxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBkZWYgPSBkZWZpbml0aW9uW3JlZi5yZWZdW3JlZi5pZF1cclxuICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3BpcGUnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwaXBlKHJlZilcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdjb25kaXRpb25hbCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmUoZGVmLnByZWRpY2F0ZSkgPyByZXNvbHZlKGRlZi50aGVuKSA6IHJlc29sdmUoZGVmLmVsc2UpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWYucmVmID09PSAnc3RhdGUnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50U3RhdGVbcmVmLmlkXVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3ZOb2RlQm94Jykge1xyXG4gICAgICAgICAgICByZXR1cm4gYm94Tm9kZShyZWYpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWYucmVmID09PSAndk5vZGVUZXh0Jykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGV4dE5vZGUocmVmKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3ZOb2RlSW5wdXQnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpbnB1dE5vZGUocmVmKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3ZOb2RlTGlzdCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGxpc3ROb2RlKHJlZilcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICd2Tm9kZUlmJykge1xyXG4gICAgICAgICAgICByZXR1cm4gaWZOb2RlKHJlZilcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdzdHlsZScpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGRlZikucmVkdWNlKChhY2MsIHZhbCk9PiB7XHJcbiAgICAgICAgICAgICAgICBhY2NbdmFsXSA9IHJlc29sdmUoZGVmW3ZhbF0pXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYWNjXHJcbiAgICAgICAgICAgIH0sIHt9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ2V2ZW50RGF0YScpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGV2ZW50RGF0YVtyZWYuaWRdXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZWYucmVmID09PSAnbGlzdFZhbHVlJykge1xyXG4gICAgICAgICAgICByZXR1cm4gY3VycmVudE1hcFZhbHVlW2RlZi5saXN0LmlkXVtkZWYucHJvcGVydHldXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRocm93IEVycm9yKHJlZilcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB0cmFuc2Zvcm1WYWx1ZSh2YWx1ZSwgdHJhbnNmb3JtYXRpb25zKXtcclxuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdHJhbnNmb3JtYXRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlZiA9IHRyYW5zZm9ybWF0aW9uc1tpXTtcclxuICAgICAgICAgICAgY29uc3QgdHJhbnNmb3JtZXIgPSBkZWZpbml0aW9uW3JlZi5yZWZdW3JlZi5pZF1cclxuICAgICAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdlcXVhbCcpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBhcmVWYWx1ZSA9IHJlc29sdmUodHJhbnNmb3JtZXIudmFsdWUpXHJcbiAgICAgICAgICAgICAgICBpZih2YWx1ZSBpbnN0YW5jZW9mIGJpZyB8fCBjb21wYXJlVmFsdWUgaW5zdGFuY2VvZiBiaWcpe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gYmlnKHZhbHVlKS5lcShjb21wYXJlVmFsdWUpXHJcbiAgICAgICAgICAgICAgICB9IGVsc2V7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PT0gY29tcGFyZVZhbHVlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdhZGQnKSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGJpZyh2YWx1ZSkucGx1cyhyZXNvbHZlKHRyYW5zZm9ybWVyLnZhbHVlKSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3N1YnRyYWN0Jykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBiaWcodmFsdWUpLm1pbnVzKHJlc29sdmUodHJhbnNmb3JtZXIudmFsdWUpKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZWYucmVmID09PSAnbXVsdGlwbHknKSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGJpZyh2YWx1ZSkudGltZXMocmVzb2x2ZSh0cmFuc2Zvcm1lci52YWx1ZSkpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlZi5yZWYgPT09ICdkaXZpZGUnKSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGJpZyh2YWx1ZSkuZGl2KHJlc29sdmUodHJhbnNmb3JtZXIudmFsdWUpKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZWYucmVmID09PSAncmVtYWluZGVyJykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSBiaWcodmFsdWUpLm1vZChyZXNvbHZlKHRyYW5zZm9ybWVyLnZhbHVlKSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ2JyYW5jaCcpIHtcclxuICAgICAgICAgICAgICAgIGlmKHJlc29sdmUodHJhbnNmb3JtZXIucHJlZGljYXRlKSl7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB0cmFuc2Zvcm1WYWx1ZSh2YWx1ZSwgdHJhbnNmb3JtZXIudGhlbilcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB0cmFuc2Zvcm1WYWx1ZSh2YWx1ZSwgdHJhbnNmb3JtZXIuZWxzZSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ2pvaW4nKSB7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLmNvbmNhdChyZXNvbHZlKHRyYW5zZm9ybWVyLnZhbHVlKSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVmLnJlZiA9PT0gJ3RvVXBwZXJDYXNlJykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1VwcGVyQ2FzZSgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHJlZi5yZWYgPT09ICd0b0xvd2VyQ2FzZScpIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChyZWYucmVmID09PSAndG9UZXh0Jykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS50b1N0cmluZygpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBpcGUocmVmKSB7XHJcbiAgICAgICAgY29uc3QgZGVmID0gZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdXHJcbiAgICAgICAgcmV0dXJuIHRyYW5zZm9ybVZhbHVlKHJlc29sdmUoZGVmLnZhbHVlKSwgZGVmLnRyYW5zZm9ybWF0aW9ucylcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBib3hOb2RlKHJlZikge1xyXG4gICAgICAgIGNvbnN0IG5vZGUgPSBkZWZpbml0aW9uW3JlZi5yZWZdW3JlZi5pZF1cclxuICAgICAgICBjb25zdCBkYXRhID0ge1xyXG4gICAgICAgICAgICBzdHlsZTogZnJvemVuICYmIHNlbGVjdGVkTm9kZUluRGV2ZWxvcG1lbnQuaWQgPT09IHJlZi5pZCA/IHsuLi5yZXNvbHZlKG5vZGUuc3R5bGUpLCB0cmFuc2l0aW9uOidvdXRsaW5lIDAuMXMnLG91dGxpbmU6ICczcHggc29saWQgIzM1OTBkZid9IDogcmVzb2x2ZShub2RlLnN0eWxlKSxcclxuICAgICAgICAgICAgb246IGZyb3plbiA/XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VvdmVyOiBzZWxlY3RIb3ZlckFjdGl2ZSA/IFtzZWxlY3ROb2RlSG92ZXIsIHJlZl06IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBjbGljazogW3NlbGVjdE5vZGVDbGljaywgcmVmXVxyXG4gICAgICAgICAgICAgICAgfTp7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xpY2s6IG5vZGUuY2xpY2sgPyBbZW1pdEV2ZW50LCBub2RlLmNsaWNrXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBkYmxjbGljazogbm9kZS5kYmxjbGljayA/IFtlbWl0RXZlbnQsIG5vZGUuZGJsY2xpY2tdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlb3Zlcjogbm9kZS5tb3VzZW92ZXIgPyBbZW1pdEV2ZW50LCBub2RlLm1vdXNlb3Zlcl0gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VvdXQ6IG5vZGUubW91c2VvdXQgPyBbZW1pdEV2ZW50LCBub2RlLm1vdXNlb3V0XSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBoKCdkaXYnLCBkYXRhLCBmbGF0dGVuKG5vZGUuY2hpbGRyZW4ubWFwKHJlc29sdmUpKSlcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpZk5vZGUocmVmKSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IGRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXVxyXG4gICAgICAgIHJldHVybiByZXNvbHZlKG5vZGUudmFsdWUpID8gbm9kZS5jaGlsZHJlbi5tYXAocmVzb2x2ZSk6IFtdXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdGV4dE5vZGUocmVmKSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IGRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXVxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSB7XHJcbiAgICAgICAgICAgIHN0eWxlOiBmcm96ZW4gJiYgc2VsZWN0ZWROb2RlSW5EZXZlbG9wbWVudC5pZCA9PT0gcmVmLmlkID8gey4uLnJlc29sdmUobm9kZS5zdHlsZSksIHRyYW5zaXRpb246J291dGxpbmUgMC4xcycsb3V0bGluZTogJzNweCBzb2xpZCAjMzU5MGRmJ30gOiByZXNvbHZlKG5vZGUuc3R5bGUpLFxyXG4gICAgICAgICAgICBvbjogZnJvemVuID9cclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZW92ZXI6IHNlbGVjdEhvdmVyQWN0aXZlID8gW3NlbGVjdE5vZGVIb3ZlciwgcmVmXTogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBbc2VsZWN0Tm9kZUNsaWNrLCByZWZdXHJcbiAgICAgICAgICAgICAgICB9OntcclxuICAgICAgICAgICAgICAgICAgICBjbGljazogbm9kZS5jbGljayA/IFtlbWl0RXZlbnQsIG5vZGUuY2xpY2tdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGRibGNsaWNrOiBub2RlLmRibGNsaWNrID8gW2VtaXRFdmVudCwgbm9kZS5kYmxjbGlja10gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VvdmVyOiBub2RlLm1vdXNlb3ZlciA/IFtlbWl0RXZlbnQsIG5vZGUubW91c2VvdmVyXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZW91dDogbm9kZS5tb3VzZW91dCA/IFtlbWl0RXZlbnQsIG5vZGUubW91c2VvdXRdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGgoJ3NwYW4nLCBkYXRhLCByZXNvbHZlKG5vZGUudmFsdWUpKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGlucHV0Tm9kZShyZWYpIHtcclxuICAgICAgICBjb25zdCBub2RlID0gZGVmaW5pdGlvbltyZWYucmVmXVtyZWYuaWRdXHJcbiAgICAgICAgY29uc3QgZGF0YSA9IHtcclxuICAgICAgICAgICAgc3R5bGU6IGZyb3plbiAmJiBzZWxlY3RlZE5vZGVJbkRldmVsb3BtZW50LmlkID09PSByZWYuaWQgPyB7Li4ucmVzb2x2ZShub2RlLnN0eWxlKSwgdHJhbnNpdGlvbjonb3V0bGluZSAwLjFzJyxvdXRsaW5lOiAnM3B4IHNvbGlkICMzNTkwZGYnfSA6IHJlc29sdmUobm9kZS5zdHlsZSksXHJcbiAgICAgICAgICAgIG9uOiBmcm96ZW4gP1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlb3Zlcjogc2VsZWN0SG92ZXJBY3RpdmUgPyBbc2VsZWN0Tm9kZUhvdmVyLCByZWZdOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xpY2s6IFtzZWxlY3ROb2RlQ2xpY2ssIHJlZl1cclxuICAgICAgICAgICAgICAgIH06e1xyXG4gICAgICAgICAgICAgICAgICAgIGNsaWNrOiBub2RlLmNsaWNrID8gW2VtaXRFdmVudCwgbm9kZS5jbGlja10gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgaW5wdXQ6IG5vZGUuaW5wdXQgPyBbZW1pdEV2ZW50LCBub2RlLmlucHV0XSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBkYmxjbGljazogbm9kZS5kYmxjbGljayA/IFtlbWl0RXZlbnQsIG5vZGUuZGJsY2xpY2tdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vdXNlb3Zlcjogbm9kZS5tb3VzZW92ZXIgPyBbZW1pdEV2ZW50LCBub2RlLm1vdXNlb3Zlcl0gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VvdXQ6IG5vZGUubW91c2VvdXQgPyBbZW1pdEV2ZW50LCBub2RlLm1vdXNlb3V0XSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBmb2N1czogbm9kZS5mb2N1cyA/IFtlbWl0RXZlbnQsIG5vZGUuZm9jdXNdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGJsdXI6IG5vZGUuYmx1ciA/IFtlbWl0RXZlbnQsIG5vZGUuYmx1cl0gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBwcm9wczoge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6IHJlc29sdmUobm9kZS52YWx1ZSksXHJcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogbm9kZS5wbGFjZWhvbGRlclxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBoKCdpbnB1dCcsIGRhdGEpXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbGlzdE5vZGUocmVmKSB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IGRlZmluaXRpb25bcmVmLnJlZl1bcmVmLmlkXVxyXG4gICAgICAgIGNvbnN0IGxpc3QgPSByZXNvbHZlKG5vZGUudmFsdWUpXHJcblxyXG4gICAgICAgIGNvbnN0IGNoaWxkcmVuID0gT2JqZWN0LmtleXMobGlzdCkubWFwKGtleT0+bGlzdFtrZXldKS5tYXAoKHZhbHVlLCBpbmRleCk9PiB7XHJcbiAgICAgICAgICAgIGN1cnJlbnRNYXBWYWx1ZVtyZWYuaWRdID0gdmFsdWVcclxuICAgICAgICAgICAgY3VycmVudE1hcEluZGV4W3JlZi5pZF0gPSBpbmRleFxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG5vZGUuY2hpbGRyZW4ubWFwKHJlc29sdmUpXHJcbiAgICAgICAgfSlcclxuICAgICAgICBkZWxldGUgY3VycmVudE1hcFZhbHVlW3JlZi5pZF07XHJcbiAgICAgICAgZGVsZXRlIGN1cnJlbnRNYXBJbmRleFtyZWYuaWRdO1xyXG5cclxuICAgICAgICBjb25zdCBkYXRhID0ge1xyXG4gICAgICAgICAgICBzdHlsZTogZnJvemVuICYmIHNlbGVjdGVkTm9kZUluRGV2ZWxvcG1lbnQuaWQgPT09IHJlZi5pZCA/IHsuLi5yZXNvbHZlKG5vZGUuc3R5bGUpLCB0cmFuc2l0aW9uOidvdXRsaW5lIDAuMXMnLG91dGxpbmU6ICczcHggc29saWQgIzM1OTBkZid9IDogcmVzb2x2ZShub2RlLnN0eWxlKSxcclxuICAgICAgICAgICAgb246IGZyb3plbiA/XHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VvdmVyOiBzZWxlY3RIb3ZlckFjdGl2ZSA/IFtzZWxlY3ROb2RlSG92ZXIsIHJlZl06IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBjbGljazogW3NlbGVjdE5vZGVDbGljaywgcmVmXVxyXG4gICAgICAgICAgICAgICAgfTp7XHJcbiAgICAgICAgICAgICAgICAgICAgY2xpY2s6IG5vZGUuY2xpY2sgPyBbZW1pdEV2ZW50LCBub2RlLmNsaWNrLmlkLCB1bmRlZmluZWRdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgICAgIGRibGNsaWNrOiBub2RlLmRibGNsaWNrID8gW2VtaXRFdmVudCwgbm9kZS5kYmxjbGljay5pZCwgdW5kZWZpbmVkXSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgICAgICBtb3VzZW92ZXI6IG5vZGUubW91c2VvdmVyID8gW2VtaXRFdmVudCwgbm9kZS5tb3VzZW92ZXIuaWQsIHVuZGVmaW5lZF0gOiB1bmRlZmluZWQsXHJcbiAgICAgICAgICAgICAgICAgICAgbW91c2VvdXQ6IG5vZGUubW91c2VvdXQgPyBbZW1pdEV2ZW50LCBub2RlLm1vdXNlb3V0LmlkLCB1bmRlZmluZWRdIDogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGgoJ2RpdicsIGRhdGEsIGZsYXR0ZW4oY2hpbGRyZW4pKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGxpc3RlbmVycyA9IFtdXHJcblxyXG4gICAgZnVuY3Rpb24gYWRkTGlzdGVuZXIoY2FsbGJhY2spIHtcclxuICAgICAgICBjb25zdCBsZW5ndGggPSBsaXN0ZW5lcnMucHVzaChjYWxsYmFjaylcclxuXHJcbiAgICAgICAgLy8gZm9yIHVuc3Vic2NyaWJpbmdcclxuICAgICAgICByZXR1cm4gKCkgPT4gbGlzdGVuZXJzLnNwbGljZShsZW5ndGggLSAxLCAxKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGVtaXRFdmVudChldmVudFJlZiwgZSkge1xyXG4gICAgICAgIGNvbnN0IGV2ZW50SWQgPSBldmVudFJlZi5pZFxyXG4gICAgICAgIGNvbnN0IGV2ZW50ID0gZGVmaW5pdGlvbi5ldmVudFtldmVudElkXVxyXG4gICAgICAgIGN1cnJlbnRFdmVudCA9IGVcclxuICAgICAgICBldmVudC5kYXRhLmZvckVhY2goKHJlZik9PntcclxuICAgICAgICAgICAgaWYocmVmLmlkID09PSAnX2lucHV0Jyl7XHJcbiAgICAgICAgICAgICAgICBldmVudERhdGFbcmVmLmlkXSA9IGUudGFyZ2V0LnZhbHVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIGNvbnN0IHByZXZpb3VzU3RhdGUgPSBjdXJyZW50U3RhdGVcclxuICAgICAgICBsZXQgbXV0YXRpb25zID0ge31cclxuICAgICAgICBkZWZpbml0aW9uLmV2ZW50W2V2ZW50SWRdLm11dGF0b3JzLmZvckVhY2goKHJlZik9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IG11dGF0b3IgPSBkZWZpbml0aW9uLm11dGF0b3JbcmVmLmlkXVxyXG4gICAgICAgICAgICBjb25zdCBzdGF0ZSA9IG11dGF0b3Iuc3RhdGVcclxuICAgICAgICAgICAgbXV0YXRpb25zW3N0YXRlLmlkXSA9IHJlc29sdmUobXV0YXRvci5tdXRhdGlvbilcclxuICAgICAgICB9KVxyXG4gICAgICAgIGN1cnJlbnRTdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIGN1cnJlbnRTdGF0ZSwgbXV0YXRpb25zKVxyXG4gICAgICAgIGxpc3RlbmVycy5mb3JFYWNoKGNhbGxiYWNrID0+IGNhbGxiYWNrKGV2ZW50SWQsIGV2ZW50RGF0YSwgZSwgcHJldmlvdXNTdGF0ZSwgY3VycmVudFN0YXRlLCBtdXRhdGlvbnMpKVxyXG4gICAgICAgIGN1cnJlbnRFdmVudCA9IHt9XHJcbiAgICAgICAgZXZlbnREYXRhID0ge31cclxuICAgICAgICBpZihPYmplY3Qua2V5cyhtdXRhdGlvbnMpLmxlbmd0aCl7XHJcbiAgICAgICAgICAgIHJlbmRlcigpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxldCB2ZG9tID0gcmVzb2x2ZSh7cmVmOid2Tm9kZUJveCcsIGlkOidfcm9vdE5vZGUnfSlcclxuICAgIGZ1bmN0aW9uIHJlbmRlcihuZXdEZWZpbml0aW9uKSB7XHJcbiAgICAgICAgaWYobmV3RGVmaW5pdGlvbil7XHJcbiAgICAgICAgICAgIGlmKGRlZmluaXRpb24uc3RhdGUgIT09IG5ld0RlZmluaXRpb24uc3RhdGUpe1xyXG4gICAgICAgICAgICAgICAgZGVmaW5pdGlvbiA9IG5ld0RlZmluaXRpb25cclxuICAgICAgICAgICAgICAgIGNvbnN0IG5ld1N0YXRlID0gT2JqZWN0LmtleXMoZGVmaW5pdGlvbi5zdGF0ZSkubWFwKGtleT0+ZGVmaW5pdGlvbi5zdGF0ZVtrZXldKS5yZWR1Y2UoKGFjYywgZGVmKT0+IHtcclxuICAgICAgICAgICAgICAgICAgICBhY2NbZGVmLnJlZl0gPSBkZWYuZGVmYXVsdFZhbHVlXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFjY1xyXG4gICAgICAgICAgICAgICAgfSwge30pXHJcbiAgICAgICAgICAgICAgICBjdXJyZW50U3RhdGUgPSB7Li4ubmV3U3RhdGUsIC4uLmN1cnJlbnRTdGF0ZX1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGRlZmluaXRpb24gPSBuZXdEZWZpbml0aW9uXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgbmV3dmRvbSA9IHJlc29sdmUoe3JlZjondk5vZGVCb3gnLCBpZDonX3Jvb3ROb2RlJ30pXHJcbiAgICAgICAgcGF0Y2godmRvbSwgbmV3dmRvbSlcclxuICAgICAgICB2ZG9tID0gbmV3dmRvbVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIF9mcmVlemUoaXNGcm96ZW4sIGNhbGxiYWNrLCBub2RlSWQpIHtcclxuICAgICAgICBmcm96ZW5DYWxsYmFjayA9IGNhbGxiYWNrXHJcbiAgICAgICAgc2VsZWN0ZWROb2RlSW5EZXZlbG9wbWVudCA9IG5vZGVJZFxyXG4gICAgICAgIGlmKGZyb3plbiA9PT0gZmFsc2UgJiYgaXNGcm96ZW4gPT09IHRydWUpe1xyXG4gICAgICAgICAgICBzZWxlY3RIb3ZlckFjdGl2ZSA9IHRydWVcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYoZnJvemVuIHx8IGZyb3plbiAhPT0gaXNGcm96ZW4pe1xyXG4gICAgICAgICAgICBmcm96ZW4gPSBpc0Zyb3plblxyXG4gICAgICAgICAgICByZW5kZXIoKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRDdXJyZW50U3RhdGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRTdGF0ZVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNldEN1cnJlbnRTdGF0ZShuZXdTdGF0ZSkge1xyXG4gICAgICAgIGN1cnJlbnRTdGF0ZSA9IG5ld1N0YXRlXHJcbiAgICAgICAgcmVuZGVyKClcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGRlZmluaXRpb24sXHJcbiAgICAgICAgdmRvbSxcclxuICAgICAgICBnZXRDdXJyZW50U3RhdGUsXHJcbiAgICAgICAgc2V0Q3VycmVudFN0YXRlLFxyXG4gICAgICAgIHJlbmRlcixcclxuICAgICAgICBlbWl0RXZlbnQsXHJcbiAgICAgICAgYWRkTGlzdGVuZXIsXHJcbiAgICAgICAgX2ZyZWV6ZSxcclxuICAgICAgICBfcmVzb2x2ZTogcmVzb2x2ZSxcclxuICAgIH1cclxufSIsIm1vZHVsZS5leHBvcnRzPXtcclxuICAgIFwiZXZlbnREYXRhXCI6IHtcclxuICAgICAgICBcIl9pbnB1dFwiOiB7XHJcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJpbnB1dCB2YWx1ZVwiLFxyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJ0ZXh0XCJcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJ0b0xvd2VyQ2FzZVwiOiB7fSxcclxuICAgIFwidG9VcHBlckNhc2VcIjoge30sXHJcbiAgICBcImNvbmRpdGlvbmFsXCI6IHt9LFxyXG4gICAgXCJlcXVhbFwiOiB7XHJcbiAgICAgICAgXCJhNzI1MWFmMC01MGE3LTQ4MjMtODVhMC02NmNlMDlkOGEzY2NcIjoge1xyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcImVlMjQyM2U2LTViNDgtNDFhZS04Y2NmLTZhMmM3YjQ2ZDJmOFwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJub3RcIjoge30sXHJcbiAgICBcImxpc3RcIjoge30sXHJcbiAgICBcInRvVGV4dFwiOiB7XHJcbiAgICAgICAgXCI3YnM5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge31cclxuICAgIH0sXHJcbiAgICBcImxpc3RWYWx1ZVwiOiB7XHJcbiAgICAgICAgXCJwejdoZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgXCJsaXN0XCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwidk5vZGVMaXN0XCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiZmw4OWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJwcm9wZXJ0eVwiOiBcInhcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJoajl3ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgXCJsaXN0XCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwidk5vZGVMaXN0XCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiZmw4OWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJwcm9wZXJ0eVwiOiBcInlcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJoaHI4YjZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgIFwibGlzdFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInZOb2RlTGlzdFwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcImZsODlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwicHJvcGVydHlcIjogXCJjb2xvclwiXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwicGlwZVwiOiB7XHJcbiAgICAgICAgXCJmdzhqZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjogXCJDdXJyZW50IHZhbHVlOiBcIixcclxuICAgICAgICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwiam9pblwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJwOXMzZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInVtNWVkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcInRleHRcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInN0YXRlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiNDZ2ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwidG9UZXh0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIjdiczlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwidWk4amQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IFwiK1wiLFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJjOHdlZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjogXCItXCIsXHJcbiAgICAgICAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInBkcTZkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcIm51bWJlclwiLFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwic3RhdGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJhZGRcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwidzg2ZmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCI0NTJxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInN0YXRlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiNDZ2ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwic3VidHJhY3RcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwidTQzd2Q2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJldzgzZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJ3M2U5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiAxLFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCIzcWtpZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjogMCxcclxuICAgICAgICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwiYWRkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIndicjdkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwidG9UZXh0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIm5vb3BcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcImpvaW5cIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwiczI1OGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJ0N3ZxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjogMCxcclxuICAgICAgICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwiYWRkXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcInZxOGRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwidG9UZXh0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIm5vb3BcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcImpvaW5cIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwid2Y5YWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCI4Y3E2YjZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJsaXN0VmFsdWVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJoaHI4YjZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJmOXF4ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJ0YWJsZVwiLFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwic3RhdGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJjOHE5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJxd3c5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjogXCJweFwiLFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJxZHc3YzZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjogXCJweFwiLFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCI4NDM2OWFiYS00YTRkLTQ5MzItOGE5YS04ZjljYTk0OGI2YTJcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjogXCJUaGUgbnVtYmVyIG5vdyBpcyBldmVuXCIsXHJcbiAgICAgICAgICAgIFwidHJhbnNmb3JtYXRpb25zXCI6IFtdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImMyZmI5YTliLTI1YmItNGU4Yi04MGMwLWNmNTFiODUwNjA3MFwiOiB7XHJcbiAgICAgICAgICAgIFwidHlwZVwiOiBcImJvb2xlYW5cIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInN0YXRlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiNDZ2ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJ0cmFuc2Zvcm1hdGlvbnNcIjogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwicmVtYWluZGVyXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIjM0NzgwZDIyLWY1MjEtNGMzMC04OWE1LTNlN2Y1YjVhZjdjMlwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwiZXF1YWxcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwiYTcyNTFhZjAtNTBhNy00ODIzLTg1YTAtNjZjZTA5ZDhhM2NjXCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCIxMjI5ZDQ3OC1iYzI1LTQ0MDEtOGE4OS03NGZjNmNmZTg5OTZcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiAyLFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJlZTI0MjNlNi01YjQ4LTQxYWUtOGNjZi02YTJjN2I0NmQyZjhcIjoge1xyXG4gICAgICAgICAgICBcInR5cGVcIjogXCJudW1iZXJcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiAwLFxyXG4gICAgICAgICAgICBcInRyYW5zZm9ybWF0aW9uc1wiOiBbXVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcImpvaW5cIjoge1xyXG4gICAgICAgIFwicDlzM2Q2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJ1bTVlZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIndmOWFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwicXd3OWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJzMjU4ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcInFkdzdjNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJhZGRcIjoge1xyXG4gICAgICAgIFwidzg2ZmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJldzgzZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIndicjdkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJsaXN0VmFsdWVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJwejdoZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInZxOGRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJsaXN0VmFsdWVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJoajl3ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwic3VidHJhY3RcIjoge1xyXG4gICAgICAgIFwidTQzd2Q2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJ3M2U5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwicmVtYWluZGVyXCI6IHtcclxuICAgICAgICBcIjM0NzgwZDIyLWY1MjEtNGMzMC04OWE1LTNlN2Y1YjVhZjdjMlwiOiB7XHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiMTIyOWQ0NzgtYmMyNS00NDAxLThhODktNzRmYzZjZmU4OTk2XCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcInZOb2RlQm94XCI6IHtcclxuICAgICAgICBcIl9yb290Tm9kZVwiOiB7XHJcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJib3hcIixcclxuICAgICAgICAgICAgXCJzdHlsZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInN0eWxlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiX3Jvb3RTdHlsZVwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwiY2hpbGRyZW5cIjogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwidk5vZGVUZXh0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIjI0NzFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwidk5vZGVUZXh0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIjE0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwidk5vZGVUZXh0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIjM0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwidk5vZGVJZlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCI1Nzg3YzE1YS00MjZiLTQxZWItODMxZC1lM2UwNzQxNTk1ODJcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcInZOb2RlTGlzdFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJmbDg5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjVcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcImd3OWRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJib3hcIixcclxuICAgICAgICAgICAgXCJzdHlsZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInN0eWxlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiZnE5ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJjaGlsZHJlblwiOiBbXVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcInZOb2RlVGV4dFwiOiB7XHJcbiAgICAgICAgXCIyNDcxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjVcIjoge1xyXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICBcInN0eWxlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwic3R5bGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCI4NDgxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcImZ3OGpkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiMTQ4MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCI6IHtcclxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcInRleHRcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJ1aThqZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInN0eWxlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwic3R5bGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCI5NDgxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcImNsaWNrXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwiZXZlbnRcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJkNDhyZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIjM0ODFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNVwiOiB7XHJcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJ0ZXh0XCIsXHJcbiAgICAgICAgICAgIFwidmFsdWVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJwaXBlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiYzh3ZWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJzdHlsZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInN0eWxlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiNzQ4MWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJjbGlja1wiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcImV2ZW50XCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiM2E1NGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJlOGFkZDFjNy04YTAxLTQxNjQtODYwNC03MjJkOGFiNTI5ZjFcIjoge1xyXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwidGV4dFwiLFxyXG4gICAgICAgICAgICBcInN0eWxlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwic3R5bGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCI0ZGNhNzNiMy05MGViLTQxZTctODY1MS0yYmRjYzkzZjM4NzFcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcIjg0MzY5YWJhLTRhNGQtNDkzMi04YTlhLThmOWNhOTQ4YjZhMlwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJ2Tm9kZUlucHV0XCI6IHt9LFxyXG4gICAgXCJ2Tm9kZUxpc3RcIjoge1xyXG4gICAgICAgIFwiZmw4OWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI1XCI6IHtcclxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcImxpc3RcIixcclxuICAgICAgICAgICAgXCJ2YWx1ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJmOXF4ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInN0eWxlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwic3R5bGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJxODZzZDg5ZC0zNzAzLTQ4M2UtYWI2NC01YTViNzgwYWVjMjdcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcImNoaWxkcmVuXCI6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcInZOb2RlQm94XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcImd3OWRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJ2Tm9kZUlmXCI6IHtcclxuICAgICAgICBcIjU3ODdjMTVhLTQyNmItNDFlYi04MzFkLWUzZTA3NDE1OTU4MlwiOiB7XHJcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJpZlwiLFxyXG4gICAgICAgICAgICBcInZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcImMyZmI5YTliLTI1YmItNGU4Yi04MGMwLWNmNTFiODUwNjA3MFwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwic3R5bGVcIjoge1xyXG4gICAgICAgICAgICAgICAgXCJyZWZcIjogXCJzdHlsZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcImExYThjNWI5LWE3ZDEtNDE2Yi04ZTc2LWVhYzk2ZmIyNzNjOVwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwiY2hpbGRyZW5cIjogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwidk5vZGVUZXh0XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcImU4YWRkMWM3LThhMDEtNDE2NC04NjA0LTcyMmQ4YWI1MjlmMVwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJzdHlsZVwiOiB7XHJcbiAgICAgICAgXCJfcm9vdFN0eWxlXCI6IHtcclxuICAgICAgICAgICAgXCJmb250RmFtaWx5XCI6IFwiJ0NvbWZvcnRhYScsIGN1cnNpdmVcIixcclxuICAgICAgICAgICAgXCJiYWNrZ3JvdW5kXCI6IFwiI2Y1ZjVmNVwiLFxyXG4gICAgICAgICAgICBcIm1pbkhlaWdodFwiOiBcIjEwMCVcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCI4NDgxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInBhZGRpbmdcIjogXCIxMHB4XCIsXHJcbiAgICAgICAgICAgIFwibWFyZ2luXCI6IFwiMTBweCA1cHhcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCI5NDgxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInBhZGRpbmdcIjogXCIxMHB4IDE1cHhcIixcclxuICAgICAgICAgICAgXCJiYWNrZ3JvdW5kXCI6IFwiI2FhYWFhYVwiLFxyXG4gICAgICAgICAgICBcImRpc3BsYXlcIjogXCJpbmxpbmUtYmxvY2tcIixcclxuICAgICAgICAgICAgXCJtYXJnaW5MZWZ0XCI6IFwiNXB4XCIsXHJcbiAgICAgICAgICAgIFwiYm9yZGVyUmFkaXVzXCI6IFwiM3B4XCIsXHJcbiAgICAgICAgICAgIFwiY3Vyc29yXCI6IFwicG9pbnRlclwiLFxyXG4gICAgICAgICAgICBcInVzZXJTZWxlY3RcIjogXCJub25lXCIsXHJcbiAgICAgICAgICAgIFwibWFyZ2luXCI6IFwiMTBweCA1cHhcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCI3NDgxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInBhZGRpbmdcIjogXCIxMHB4IDE1cHhcIixcclxuICAgICAgICAgICAgXCJiYWNrZ3JvdW5kXCI6IFwiIzk5OTk5OVwiLFxyXG4gICAgICAgICAgICBcImRpc3BsYXlcIjogXCJpbmxpbmUtYmxvY2tcIixcclxuICAgICAgICAgICAgXCJtYXJnaW5MZWZ0XCI6IFwiNXB4XCIsXHJcbiAgICAgICAgICAgIFwiYm9yZGVyUmFkaXVzXCI6IFwiM3B4XCIsXHJcbiAgICAgICAgICAgIFwiY3Vyc29yXCI6IFwicG9pbnRlclwiLFxyXG4gICAgICAgICAgICBcIm1hcmdpblwiOiBcIjEwcHggNXB4XCIsXHJcbiAgICAgICAgICAgIFwidXNlclNlbGVjdFwiOiBcIm5vbmVcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCI4MDkyYWM1ZS1kZmQwLTQ0OTItYTY1ZC04YWMzZWVjMzI1ZTBcIjoge1xyXG4gICAgICAgICAgICBcInBhZGRpbmdcIjogXCIxMHB4IDEwcHggMTBweCAwXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiYTk0NjFlMjgtN2Q5Mi00OWEwLTkwMDEtMjNkNzRlNGIzODJkXCI6IHtcclxuICAgICAgICAgICAgXCJwYWRkaW5nXCI6IFwiMTBweCAxMHB4IDEwcHggMFwiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIjc2NmIxMWVjLWRhMjctNDk0Yy1iMjcyLWMyNmZlYzNmNjQ3NVwiOiB7XHJcbiAgICAgICAgICAgIFwicGFkZGluZ1wiOiBcIjEwcHhcIixcclxuICAgICAgICAgICAgXCJmbG9hdFwiOiBcInJpZ2h0XCIsXHJcbiAgICAgICAgICAgIFwicGFkZGluZ1JpZ2h0XCI6IFwiNTBweFwiLFxyXG4gICAgICAgICAgICBcInRleHRBbGlnblwiOiBcInJpZ2h0XCIsXHJcbiAgICAgICAgICAgIFwibWF4V2lkdGhcIjogXCI1MDBweFwiLFxyXG4gICAgICAgICAgICBcImxpbmUtaGVpZ2h0XCI6IFwiMS41XCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiY2JjZDhlZGItNGFhMi00M2ZlLWFkMzktY2VlNzliNDkwMjk1XCI6IHtcclxuICAgICAgICAgICAgXCJwYWRkaW5nXCI6IFwiMTBweFwiLFxyXG4gICAgICAgICAgICBcImRpc3BsYXlcIjogXCJibG9ja1wiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIjY3NjNmMTAyLTIzZjctNDM5MC1iNDYzLTRlMWIxNGU4NjZjOVwiOiB7XHJcbiAgICAgICAgICAgIFwicGFkZGluZ1wiOiBcIjEwcHhcIixcclxuICAgICAgICAgICAgXCJkaXNwbGF5XCI6IFwiYmxvY2tcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCI5MWM5YWRmMC1kNjJlLTQ1ODAtOTNlNy1mMzk1OTRhZTVlN2RcIjoge1xyXG4gICAgICAgICAgICBcInBhZGRpbmdcIjogXCIxMHB4XCIsXHJcbiAgICAgICAgICAgIFwiZGlzcGxheVwiOiBcImJsb2NrXCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiZTlmYmViMzktNzE5My00NTIyLTkxYjMtNzYxYmQzNTYzOWQzXCI6IHtcclxuICAgICAgICAgICAgXCJwYWRkaW5nXCI6IFwiMTBweFwiLFxyXG4gICAgICAgICAgICBcImRpc3BsYXlcIjogXCJibG9ja1wiXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIjNjZjVkODlkLTM3MDMtNDgzZS1hYjY0LTVhNWI3ODBhZWMyN1wiOiB7XHJcbiAgICAgICAgICAgIFwicGFkZGluZ1wiOiBcIjEwcHhcIixcclxuICAgICAgICAgICAgXCJkaXNwbGF5XCI6IFwiYmxvY2tcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJxODZzZDg5ZC0zNzAzLTQ4M2UtYWI2NC01YTViNzgwYWVjMjdcIjoge1xyXG4gICAgICAgICAgICBcInBhZGRpbmdcIjogXCIyMHB4XCJcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiZnE5ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJwYWRkaW5nXCI6IFwiMTBweFwiLFxyXG4gICAgICAgICAgICBcIndpZHRoXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcIjNxa2lkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwiaGVpZ2h0XCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcInQ3dnFkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwiYmFja2dyb3VuZFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCI4Y3E2YjZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIjRkY2E3M2IzLTkwZWItNDFlNy04NjUxLTJiZGNjOTNmMzg3MVwiOiB7XHJcbiAgICAgICAgICAgIFwicGFkZGluZ1wiOiBcIjEwcHhcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJhMWE4YzViOS1hN2QxLTQxNmItOGU3Ni1lYWM5NmZiMjczYzlcIjoge1xyXG4gICAgICAgICAgICBcInBhZGRpbmdcIjogXCIxMHB4XCJcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJuYW1lU3BhY2VcIjoge1xyXG4gICAgICAgIFwiX3Jvb3ROYW1lU3BhY2VcIjoge1xyXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwic3RhdGVcIixcclxuICAgICAgICAgICAgXCJjaGlsZHJlblwiOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJzdGF0ZVwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcInN0YXRlXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcImM4cTlkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJzdGF0ZVwiOiB7XHJcbiAgICAgICAgXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwiY291bnRcIixcclxuICAgICAgICAgICAgXCJyZWZcIjogXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIixcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgICAgIFwiZGVmYXVsdFZhbHVlXCI6IDAsXHJcbiAgICAgICAgICAgIFwibXV0YXRvcnNcIjogW1xyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgIFwicmVmXCI6IFwibXV0YXRvclwiLFxyXG4gICAgICAgICAgICAgICAgICAgIFwiaWRcIjogXCJhczU1ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcIm11dGF0b3JcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwiOWRxOGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJjOHE5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwidGlsZXNcIixcclxuICAgICAgICAgICAgXCJyZWZcIjogXCJjOHE5ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIixcclxuICAgICAgICAgICAgXCJ0eXBlXCI6IFwidGFibGVcIixcclxuICAgICAgICAgICAgXCJkZWZpbml0aW9uXCI6IHtcclxuICAgICAgICAgICAgICAgIFwieFwiOiBcIm51bWJlclwiLFxyXG4gICAgICAgICAgICAgICAgXCJ5XCI6IFwibnVtYmVyXCIsXHJcbiAgICAgICAgICAgICAgICBcImNvbG9yXCI6IFwidGV4dFwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIFwiZGVmYXVsdFZhbHVlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwib3BzNmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInhcIjogMTIwLFxyXG4gICAgICAgICAgICAgICAgICAgIFwieVwiOiAxMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb2xvclwiOiBcIiNlYWI2NWNcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwid3B2NWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInhcIjogMjAwLFxyXG4gICAgICAgICAgICAgICAgICAgIFwieVwiOiAxMjAsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb2xvclwiOiBcIiM1M0IyRURcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwicW4yN2Q2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInhcIjogMTMwLFxyXG4gICAgICAgICAgICAgICAgICAgIFwieVwiOiAyMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb2xvclwiOiBcIiM1YmNjNWJcIlxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIFwiY2E5cmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgICAgICAgICBcInhcIjogMTUwLFxyXG4gICAgICAgICAgICAgICAgICAgIFwieVwiOiAxNTAsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJjb2xvclwiOiBcIiM0ZDRkNGRcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIm11dGF0b3JzXCI6IFtdXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwibXV0YXRvclwiOiB7XHJcbiAgICAgICAgXCJhczU1ZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIjoge1xyXG4gICAgICAgICAgICBcImV2ZW50XCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwiZXZlbnRcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCJkNDhyZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcInN0YXRlXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwic3RhdGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCI0NnZkZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBcIm11dGF0aW9uXCI6IHtcclxuICAgICAgICAgICAgICAgIFwicmVmXCI6IFwicGlwZVwiLFxyXG4gICAgICAgICAgICAgICAgXCJpZFwiOiBcInBkcTZkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiOWRxOGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJldmVudFwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcImV2ZW50XCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiM2E1NGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJzdGF0ZVwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInN0YXRlXCIsXHJcbiAgICAgICAgICAgICAgICBcImlkXCI6IFwiNDZ2ZGQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXCJtdXRhdGlvblwiOiB7XHJcbiAgICAgICAgICAgICAgICBcInJlZlwiOiBcInBpcGVcIixcclxuICAgICAgICAgICAgICAgIFwiaWRcIjogXCI0NTJxZDZkMi0wMGRiLThhYjUtYzMzMi04ODI1NzVmMjU0MjZcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiZXZlbnRcIjoge1xyXG4gICAgICAgIFwiZDQ4cmQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCI6IHtcclxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcImluY3JlbWVudFwiLFxyXG4gICAgICAgICAgICBcIm11dGF0b3JzXCI6IFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICBcInJlZlwiOiBcIm11dGF0b3JcIixcclxuICAgICAgICAgICAgICAgICAgICBcImlkXCI6IFwiYXM1NWQ2ZDItMDBkYi04YWI1LWMzMzItODgyNTc1ZjI1NDI2XCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgXCJkYXRhXCI6IFtdXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIjNhNTRkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiOiB7XHJcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJkZWNyZW1lbnRcIixcclxuICAgICAgICAgICAgXCJtdXRhdG9yc1wiOiBbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgXCJyZWZcIjogXCJtdXRhdG9yXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgXCJpZFwiOiBcIjlkcThkNmQyLTAwZGItOGFiNS1jMzMyLTg4MjU3NWYyNTQyNlwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdfQ==
