/**
 * Mobile Carousel
 */

if (window.NVS === undefined) { window.NVS = {}; }

(function(document, window, NVS) {
    'use strict';

    var each = []['forEach']

    NVS.Carousel = function (context) {
        this._carousel = context;
        this._items = this._carousel.getElementsByClassName('items')[0];
        this._controls = this._carousel.getElementsByClassName('controls')[0];
        this._bubbles = this._controls.getElementsByClassName('bubbles')[0];
        this._bubbleNodeList = Array.prototype.slice.call(this._bubbles.children);
        this._itemsLength = this._items.length;
        this._timeout = 0;
        this.touchStart = {
            x: 0,
            y: 0
        }
        this.touchEnd = {
            x: 0,
            y: 0
        }

        this.autoplay = (this._carousel.hasAttribute('data-autoplay') && this._carousel.getAttribute('data-autoplay') !== 'false');

        this.delay = this._carousel.getAttribute('data-delay');

    };

    NVS.Carousel.prototype.afterTransition = function() {
        var oldCurrent = this._items.getElementsByClassName('old-current')[0],
            gotoElement = this._items.getElementsByClassName('current')[0];

        if (oldCurrent) {
            oldCurrent.classList.remove('old-current');
        }

        if (window.transitionEnd) {
            gotoElement.removeEventListener(window.transitionEnd, this.afterTransition, false);
        }

        if (this.autoplay) {
            window.clearTimeout(this._timeout);
            this._timeout = window.setTimeout(this.next.bind(this), this.delay);
        }
    };

    NVS.Carousel.prototype.goTo = function (gotoElement, gotoBubble) {
        var current = this._items.getElementsByClassName('current')[0];

        window.clearTimeout(this._timeout);
        if (!(this._items.getElementsByClassName('old-current').length &&
                (this._items.getElementsByClassName('old-current').length == 1 ||
                 typeof this._items.getElementsByClassName('old-current')[0].id !== 'undefined')
            )) {

            current.classList.add('old-current');
            current.classList.remove('current');

            this._bubbles.getElementsByClassName('current')[0].classList.remove('current');

            if (window.transitionEnd) {
                gotoElement.addEventListener(window.transitionEnd, this.afterTransition.bind(this));
            }

            gotoElement.classList.add('current');
            gotoBubble.classList.add('current');

        }
    }

    NVS.Carousel.prototype.next = function () {
        if (this._items.getElementsByClassName('current')[0].nextElementSibling) {
            this.goTo(this._items.getElementsByClassName('current')[0].nextElementSibling, this._bubbles.getElementsByClassName('current')[0].nextElementSibling);
        } else {
            this.goTo(this._items.children[0], this._bubbles.children[0])
        }
    };

    NVS.Carousel.prototype.previous = function () {
        if (this._items.getElementsByClassName('current')[0].previousElementSibling) {
            this.goTo(this._items.getElementsByClassName('current')[0].previousElementSibling, this._bubbles.getElementsByClassName('current')[0].previousElementSibling);
        } else {
            this.goTo(this._items.children[this._items.children.length - 1], this._bubbles.children[this._bubbles.children.length - 1])
        }
    };

    NVS.Carousel.prototype.goToIndex = function (index) {
        this.goTo(this._items.children[index], this._bubbles.children[index]);
    };

    NVS.Carousel.prototype.setTouchHandlers = function () {
        var self = this;

        this._carousel.addEventListener('touchstart', function (e) {
            self.touchStart.x = e.touches[0].pageX;
            self.touchStart.y = e.touches[0].pageY;
        }, false);

        this._carousel.addEventListener('touchmove', function (e) {
            var xDiff, yDiff;
            self.touchEnd.x = e.touches[0].pageX;
            self.touchEnd.y = e.touches[0].pageY;

            xDiff = self.touchStart.x - self.touchEnd.x;
            yDiff = self.touchStart.y - self.touchEnd.y;

            if (xDiff < 0) xDiff = -xDiff;
            if (yDiff < 0) yDiff = -yDiff;

            if (xDiff > yDiff) {
                e.preventDefault();
                if (xDiff > 20) {
                    e.stopPropagation();
                }
            }
        }, false);

        this._carousel.addEventListener('touchend', function (e) {
            var xDiff, yDiff, xDiffCompare, yDiffCompare;
            xDiff = xDiffCompare = self.touchStart.x - self.touchEnd.x;
            yDiff = yDiffCompare = self.touchStart.y - self.touchEnd.y;

            if (xDiff < 0) xDiffCompare = -xDiff;
            if (yDiff < 0) yDiffCompare = -yDiff;

            if (xDiffCompare > yDiffCompare) {
                if (xDiff > 20) {
                    self.next();
                } else if (xDiff < 20) {
                    self.previous();
                }
            }

        }, false);

    };

    NVS.Carousel.prototype.setHandlers = function () {
        var bubbles = this._bubbles.children,
            i,
            self = this;

        each.call(bubbles, function (el) {
            el.addEventListener('click', function (e) {
                self.goToIndex(self._bubbleNodeList.indexOf(this));
                e.stopPropagation();
            }, false);
        });

        this._controls.getElementsByClassName('next')[0].addEventListener('click', function (e) {
            self.next();
        }, false);

        this._controls.getElementsByClassName('previous')[0].addEventListener('click', function (e) {
            self.previous();
        }, false);

        if ('ontouchstart' in document.documentElement) {
            this.setTouchHandlers();
        }

    };

    NVS.Carousel.prototype.init = function () {

        this.setHandlers();

        if (this.autoplay) {
            window.clearTimeout(this._timeout);
            this._timeout = window.setTimeout(this.next.bind(this), this.delay);
        }
    };

})(document, window, window.NVS);
