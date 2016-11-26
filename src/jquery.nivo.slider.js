/*
 * @preserve
 * jQuery Nivo Slider v3.2
 * http://nivo.dev7studios.com
 *
 * @license
 * Copyright 2012, Dev7studios
 * Free to use and abuse under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

;(function ($, window, document, undefined) {
    function NivoSlider(element, options) {
        var defaults = {
            effect: 'random',
            slices: 15,
            boxCols: 8,
            boxRows: 4,
            animSpeed: 500,
            pauseTime: 3000,
            startSlide: 0,
            directionNav: true,
            controlNav: true,
            controlNavThumbs: false,
            pauseOnHover: true,
            manualAdvance: false,
            prevText: 'Prev',
            nextText: 'Next',
            randomStart: false,
            beforeChange: function () {
            },
            afterChange: function () {
            },
            slideshowEnd: function () {
            },
            lastSlide: function () {
            },
            afterLoad: function () {
            }
        };
        this.vars = {
            currentSlide: 0,
            currentImage: '',
            totalSlides: 0,
            running: false,
            paused: false,
            stop: false,
            controlNavEl: false
        };
        this.element = element;
        this.settings = $.extend({}, defaults, options);

        this.init();
    }

    NivoSlider.prototype = {
        init: init,
        setup: setup,
        processCaption: processCaption,
        run: run,
        animations: animations,
        resize: resize
    };

    function init() {
        this.setup();
        this.processCaption();
        this.run();
        this.resize();

        // Trigger the afterLoad callback
        this.settings.afterLoad.call(this);
    }

    function setup() {
        this.slider = $(this.element);
        this.slider.data('nivo:vars', this.vars).addClass('nivoSlider');
        this.slider.append($('<div class="nivo-caption"></div>'));
        this.children = this.slider.children();

        var self = this;
        this.children.each(function () {
            var child = $(this);
            var link = '';
            if (!child.is('img')) {
                if (child.is('a')) {
                    child.addClass('nivo-imageLink');
                    link = child;
                }
                child = child.find('img:first');
            }
            if (link !== '') {
                link.css('display', 'none');
            }
            child.css('display', 'none');
            self.vars.totalSlides++;
        });

        // Get initial image
        if ($(this.children[this.vars.currentSlide]).is('img')) {
            this.vars.currentImage = $(this.children[this.vars.currentSlide]);
        } else {
            this.vars.currentImage = $(this.children[this.vars.currentSlide]).find('img:first');
        }

        // Show initial link
        if ($(this.children[this.vars.currentSlide]).is('a')) {
            $(this.children[this.vars.currentSlide]).css('display', 'block');
        }

        // If randomStart
        if (this.settings.randomStart) {
            this.settings.startSlide = Math.floor(Math.random() * this.vars.totalSlides);
        }

        // Set startSlide
        if (this.settings.startSlide > 0) {
            if (this.settings.startSlide >= this.vars.totalSlides) {
                this.settings.startSlide = this.vars.totalSlides - 1;
            }
            this.vars.currentSlide = this.settings.startSlide;
        }

        // Set first background
        this.sliderImg = $('<img/>').addClass('nivo-main-image');
        this.sliderImg.attr('src', this.vars.currentImage.attr('src')).show();
        this.slider.append(this.sliderImg);
    }

    function processCaption() {
        this.slider.append($('<div class="nivo-caption"></div>'));

        var nivoCaption = $('.nivo-caption', this.slider);
        var self = this;

        if (self.vars.currentImage.attr('title') != '' && self.vars.currentImage.attr('title') != undefined) {
            var title = self.vars.currentImage.attr('title');
            if (title.substr(0, 1) == '#') title = $(title).html();

            if (nivoCaption.css('display') == 'block') {
                setTimeout(function () {
                    nivoCaption.html(title);
                }, self.settings.animSpeed);
            } else {
                nivoCaption.html(title);
                nivoCaption.stop().fadeIn(self.settings.animSpeed);
            }
        } else {
            nivoCaption.stop().fadeOut(self.settings.animSpeed);
        }
    }

    function run() {
        // In the words of Super Mario "let's a go!"
        this.timer = 0;
        var timer = this.timer;
        var self = this;

        if (!this.settings.manualAdvance && this.children.length > 1) {
            timer = setInterval(function () {
                nivoRun(false);
            }, self.settings.pauseTime);
        }

        // Add Direction nav
        if (this.settings.directionNav) {
            var tpl = [
                '<div class="nivo-directionNav">',
                '<a class="nivo-prevNav">',
                this.settings.prevText,
                '</a>',
                '<a class="nivo-nextNav">',
                this.settings.nextText,
                '</a>',
                '</div>'
            ].join('');

            this.slider.append(tpl);

            $(this.slider).on('click', 'a.nivo-prevNav', function () {
                if (self.vars.running) {
                    return false;
                }
                clearInterval(timer);
                timer = '';
                self.vars.currentSlide -= 2;
                nivoRun('prev');
            });

            $(this.slider).on('click', 'a.nivo-nextNav', function () {
                if (self.vars.running) {
                    return false;
                }
                clearInterval(timer);
                timer = '';
                nivoRun('next');
            });
        }

        // Add Control nav
        if (this.settings.controlNav) {
            this.vars.controlNavEl = $('<div class="nivo-controlNav"></div>');
            this.slider.after(this.vars.controlNavEl);
            for (var i = 0; i < this.children.length; i++) {
                if (this.settings.controlNavThumbs) {
                    this.vars.controlNavEl.addClass('nivo-thumbs-enabled');
                    var child = this.children.eq(i);
                    if (!child.is('img')) {
                        child = child.find('img:first');
                    }
                    if (child.attr('data-thumb')) this.vars.controlNavEl.append('<a class="nivo-control" rel="' + i + '"><img src="' + child.attr('data-thumb') + '" alt="" /></a>');
                } else {
                    this.vars.controlNavEl.append('<a class="nivo-control" rel="' + i + '">' + (i + 1) + '</a>');
                }
            }

            //Set initial active link
            $('a:eq(' + this.vars.currentSlide + ')', this.vars.controlNavEl).addClass('active');

            $('a', this.vars.controlNavEl).bind('click', function () {
                if (self.vars.running) return false;
                if ($(this).hasClass('active')) return false;
                clearInterval(timer);
                timer = '';
                self.sliderImg.attr('src', self.vars.currentImage.attr('src'));
                self.vars.currentSlide = $(this).attr('rel') - 1;
                nivoRun('control');
            });
        }

        //For pauseOnHover setting
        if (this.settings.pauseOnHover) {
            this.slider.hover(function () {
                self.vars.paused = true;
                clearInterval(timer);
                timer = '';
            }, function () {
                self.vars.paused = false;
                // Restart the timer
                if (timer === '' && !self.settings.manualAdvance) {
                    timer = setInterval(function () {
                        nivoRun(false);
                    }, self.settings.pauseTime);
                }
            });
        }

        // Private run method
        function nivoRun(nudge) {
            // Get our vars
            var vars = self.slider.data('nivo:vars');

            // Trigger the lastSlide callback
            if (vars && (vars.currentSlide === vars.totalSlides - 1)) {
                self.settings.lastSlide.call(this);
            }

            // Stop
            if ((!vars || vars.stop) && !nudge) {
                return false;
            }

            // Trigger the beforeChange callback
            self.settings.beforeChange.call(this);

            // Set current background before change
            if (!nudge) {
                self.sliderImg.attr('src', vars.currentImage.attr('src'));
            } else {
                if (nudge === 'prev') {
                    self.sliderImg.attr('src', vars.currentImage.attr('src'));
                }
                if (nudge === 'next') {
                    self.sliderImg.attr('src', vars.currentImage.attr('src'));
                }
            }

            vars.currentSlide++;
            // Trigger the slideshowEnd callback
            if (vars.currentSlide === vars.totalSlides) {
                vars.currentSlide = 0;
                self.settings.slideshowEnd.call(this);
            }
            if (vars.currentSlide < 0) {
                vars.currentSlide = (vars.totalSlides - 1);
            }
            // Set vars.currentImage
            if ($(self.children[vars.currentSlide]).is('img')) {
                vars.currentImage = $(self.children[vars.currentSlide]);
            } else {
                vars.currentImage = $(self.children[vars.currentSlide]).find('img:first');
            }

            // Set active links
            if (self.settings.controlNav) {
                $('a', vars.controlNavEl).removeClass('active');
                $('a:eq(' + vars.currentSlide + ')', vars.controlNavEl).addClass('active');
            }

            // Process caption
            self.processCaption();

            // Remove any slices from last transition
            $('.nivo-slice', self.slider).remove();

            // Remove any boxes from last transition
            $('.nivo-box', self.slider).remove();

            var currentEffect = self.settings.effect,
                anims = '';

            // Generate random effect
            if (self.settings.effect === 'random') {
                anims = [
                    'sliceDownRight',
                    'sliceDownLeft',
                    'sliceUpRight',
                    'sliceUpLeft',
                    'sliceUpDown',
                    'sliceUpDownLeft',
                    'fold',
                    'fade',
                    'boxRandom',
                    'boxRain',
                    'boxRainReverse',
                    'boxRainGrow',
                    'boxRainGrowReverse'
                ];
                currentEffect = anims[Math.floor(Math.random() * (anims.length + 1))];
                if (currentEffect === undefined) {
                    currentEffect = 'fade';
                }
            }

            // Run random effect from specified set (eg: effect:'fold,fade')
            if (self.settings.effect.indexOf(',') !== -1) {
                anims = self.settings.effect.split(',');
                currentEffect = anims[Math.floor(Math.random() * (anims.length))];
                if (currentEffect === undefined) {
                    currentEffect = 'fade';
                }
            }

            // Custom transition as defined by "data-transition" attribute
            if (vars.currentImage.attr('data-transition')) {
                currentEffect = vars.currentImage.attr('data-transition');
            }

            // Run effects
            vars.running = true;
            var timeBuff = 0,
                i = 0,
                slices = '',
                firstSlice = '',
                totalBoxes = '',
                boxes = '';

            if (currentEffect === 'sliceDown' ||
                currentEffect === 'sliceDownRight' ||
                currentEffect === 'sliceDownLeft') {
                console.log('sliceDownRight');
                createSlices(self.slider, self.settings, vars);
                timeBuff = 0;
                i = 0;
                slices = $('.nivo-slice', self.slider);
                if (currentEffect === 'sliceDownLeft') {
                    slices = $('.nivo-slice', self.slider);
                }

                slices.each(function () {
                    var slice = $(this);
                    slice.css({'top': '0px'});
                    if (i === self.settings.slices - 1) {
                        setTimeout(function () {
                            slice.animate({opacity: '1.0'}, self.settings.animSpeed, '', function () {
                                self.slider.trigger('nivo:animFinished');
                            });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function () {
                            slice.animate({opacity: '1.0'}, self.settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    i++;
                });
            } else if (currentEffect === 'sliceUp' ||
                currentEffect === 'sliceUpRight' ||
                currentEffect === 'sliceUpLeft') {
                createSlices(self.slider, self.settings, vars);
                timeBuff = 0;
                i = 0;
                slices = $('.nivo-slice', self.slider);
                if (currentEffect === 'sliceUpLeft') {
                    slices = $('.nivo-slice', self.slider);
                }

                slices.each(function () {
                    var slice = $(this);
                    slice.css({'bottom': '0px'});
                    if (i === self.settings.slices - 1) {
                        setTimeout(function () {
                            slice.animate({opacity: '1.0'}, self.settings.animSpeed, '', function () {
                                self.slider.trigger('nivo:animFinished');
                            });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function () {
                            slice.animate({opacity: '1.0'}, self.settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    i++;
                });
            } else if (currentEffect === 'sliceUpDown' ||
                currentEffect === 'sliceUpDownRight' ||
                currentEffect === 'sliceUpDownLeft') {
                createSlices(self.slider, self.settings, vars);
                timeBuff = 0;
                i = 0;
                var v = 0;
                slices = $('.nivo-slice', self.slider);
                if (currentEffect === 'sliceUpDownLeft') {
                    slices = $('.nivo-slice', self.slider);
                }

                slices.each(function () {
                    var slice = $(this);
                    if (i === 0) {
                        slice.css('top', '0px');
                        i++;
                    } else {
                        slice.css('bottom', '0px');
                        i = 0;
                    }

                    if (v === self.settings.slices - 1) {
                        setTimeout(function () {
                            slice.animate({opacity: '1.0'}, self.settings.animSpeed, '', function () {
                                self.slider.trigger('nivo:animFinished');
                            });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function () {
                            slice.animate({opacity: '1.0'}, self.settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    v++;
                });
            } else if (currentEffect === 'fold') {
                createSlices(self.slider, self.settings, vars);
                timeBuff = 0;
                i = 0;

                $('.nivo-slice', self.slider).each(function () {
                    var slice = $(this);
                    var origWidth = slice.width();
                    slice.css({top: '0px', width: '0px'});
                    if (i === self.settings.slices - 1) {
                        setTimeout(function () {
                            slice.animate({width: origWidth, opacity: '1.0'}, self.settings.animSpeed, '', function () {
                                self.slider.trigger('nivo:animFinished');
                            });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function () {
                            slice.animate({width: origWidth, opacity: '1.0'}, self.settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    i++;
                });
            } else if (currentEffect === 'fade') {
                createSlices(self.slider, self.settings, vars);

                firstSlice = $('.nivo-slice:first', self.slider);
                firstSlice.css({
                    'width': self.slider.width() + 'px'
                });

                firstSlice.animate({opacity: '1.0'}, (self.settings.animSpeed * 2), '', function () {
                    self.slider.trigger('nivo:animFinished');
                });
            } else if (currentEffect === 'slideInRight') {
                createSlices(self.slider, self.settings, vars);

                firstSlice = $('.nivo-slice:first', self.slider);
                firstSlice.css({
                    'width': '0px',
                    'opacity': '1'
                });

                firstSlice.animate({width: self.slider.width() + 'px'}, (self.settings.animSpeed * 2), '', function () {
                    self.slider.trigger('nivo:animFinished');
                });
            } else if (currentEffect === 'slideInLeft') {
                createSlices(self.slider, self.settings, vars);

                firstSlice = $('.nivo-slice:first', self.slider);
                firstSlice.css({
                    'width': '0px',
                    'opacity': '1',
                    'left': '',
                    'right': '0px'
                });

                firstSlice.animate({width: self.slider.width() + 'px'}, (self.settings.animSpeed * 2), '', function () {
                    // Reset positioning
                    firstSlice.css({
                        'left': '0px',
                        'right': ''
                    });
                    self.slider.trigger('nivo:animFinished');
                });
            } else if (currentEffect === 'boxRandom') {
                createBoxes(self.slider, self.settings, vars);

                totalBoxes = self.settings.boxCols * self.settings.boxRows;
                i = 0;
                timeBuff = 0;

                boxes = shuffle($('.nivo-box', self.slider));
                boxes.each(function () {
                    var box = $(this);
                    if (i === totalBoxes - 1) {
                        setTimeout(function () {
                            box.animate({opacity: '1'}, self.settings.animSpeed, '', function () {
                                self.slider.trigger('nivo:animFinished');
                            });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function () {
                            box.animate({opacity: '1'}, self.settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 20;
                    i++;
                });
            } else if (currentEffect === 'boxRain' ||
                currentEffect === 'boxRainReverse' ||
                currentEffect === 'boxRainGrow' ||
                currentEffect === 'boxRainGrowReverse') {
                createBoxes(self.slider, self.settings, vars);

                totalBoxes = self.settings.boxCols * self.settings.boxRows;
                i = 0;
                timeBuff = 0;

                // Split boxes into 2D array
                var rowIndex = 0;
                var colIndex = 0;
                var box2Darr = [];
                box2Darr[rowIndex] = [];
                boxes = $('.nivo-box', self.slider);
                if (currentEffect === 'boxRainReverse' ||
                    currentEffect === 'boxRainGrowReverse') {
                    boxes = $('.nivo-box', self.slider);
                }
                boxes.each(function () {
                    box2Darr[rowIndex][colIndex] = $(this);
                    colIndex++;
                    if (colIndex === self.settings.boxCols) {
                        rowIndex++;
                        colIndex = 0;
                        box2Darr[rowIndex] = [];
                    }
                });

                // Run animation
                for (var cols = 0; cols < (self.settings.boxCols * 2); cols++) {
                    var prevCol = cols;
                    for (var rows = 0; rows < self.settings.boxRows; rows++) {
                        if (prevCol >= 0 && prevCol < self.settings.boxCols) {
                            /* Due to some weird JS bug with loop vars
                             being used in setTimeout, this is wrapped
                             with an anonymous function call */
                            (function (row, col, time, i, totalBoxes) {
                                var box = $(box2Darr[row][col]);
                                var w = box.width();
                                var h = box.height();
                                if (currentEffect === 'boxRainGrow' || currentEffect === 'boxRainGrowReverse') {
                                    box.width(0).height(0);
                                }
                                if (i === totalBoxes - 1) {
                                    setTimeout(function () {
                                        box.animate({
                                            opacity: '1',
                                            width: w,
                                            height: h
                                        }, self.settings.animSpeed / 1.3, '', function () {
                                            self.slider.trigger('nivo:animFinished');
                                        });
                                    }, (100 + time));
                                } else {
                                    setTimeout(function () {
                                        box.animate({opacity: '1', width: w, height: h}, self.settings.animSpeed / 1.3);
                                    }, (100 + time));
                                }
                            })(rows, prevCol, timeBuff, i, totalBoxes);
                            i++;
                        }
                        prevCol--;
                    }
                    timeBuff += 100;
                }
            }
        }


        // Add slices for slice animations
        function createSlices(slider, settings, vars) {
            if ($(vars.currentImage).parent().is('a')) $(vars.currentImage).parent().css('display', 'block');
            $('img[src="' + vars.currentImage.attr('src') + '"]', slider).not('.nivo-main-image,.nivo-control img').width(slider.width()).css('visibility', 'hidden').show();
            var sliceHeight = ($('img[src="' + vars.currentImage.attr('src') + '"]', slider).not('.nivo-main-image,.nivo-control img').parent().is('a')) ? $('img[src="' + vars.currentImage.attr('src') + '"]', slider).not('.nivo-main-image,.nivo-control img').parent().height() : $('img[src="' + vars.currentImage.attr('src') + '"]', slider).not('.nivo-main-image,.nivo-control img').height();

            for (var i = 0; i < settings.slices; i++) {
                var sliceWidth = Math.round(slider.width() / settings.slices);

                if (i === settings.slices - 1) {
                    slider.append(
                        $('<div class="nivo-slice" name="' + i + '"><img src="' + vars.currentImage.attr('src') + '" style="position:absolute; width:' + slider.width() + 'px; height:auto; display:block !important; top:0; left:-' + ((sliceWidth + (i * sliceWidth)) - sliceWidth) + 'px;" /></div>').css({
                            left: (sliceWidth * i) + 'px',
                            width: (slider.width() - (sliceWidth * i)) + 'px',
                            height: sliceHeight + 'px',
                            opacity: '0',
                            overflow: 'hidden'
                        })
                    );
                } else {
                    slider.append(
                        $('<div class="nivo-slice" name="' + i + '"><img src="' + vars.currentImage.attr('src') + '" style="position:absolute; width:' + slider.width() + 'px; height:auto; display:block !important; top:0; left:-' + ((sliceWidth + (i * sliceWidth)) - sliceWidth) + 'px;" /></div>').css({
                            left: (sliceWidth * i) + 'px',
                            width: sliceWidth + 'px',
                            height: sliceHeight + 'px',
                            opacity: '0',
                            overflow: 'hidden'
                        })
                    );
                }
            }

            $('.nivo-slice', slider).height(sliceHeight);
            self.sliderImg.stop().animate({
                height: $(vars.currentImage).height()
            }, settings.animSpeed);
        }

        // Add boxes for box animations
        function createBoxes(slider, settings, vars) {
            if ($(vars.currentImage).parent().is('a')) $(vars.currentImage).parent().css('display', 'block');
            $('img[src="' + vars.currentImage.attr('src') + '"]', slider).not('.nivo-main-image,.nivo-control img').width(slider.width()).css('visibility', 'hidden').show();
            var boxWidth = Math.round(slider.width() / settings.boxCols),
                boxHeight = Math.round($('img[src="' + vars.currentImage.attr('src') + '"]', slider).not('.nivo-main-image,.nivo-control img').height() / settings.boxRows);


            for (var rows = 0; rows < settings.boxRows; rows++) {
                for (var cols = 0; cols < settings.boxCols; cols++) {
                    if (cols === settings.boxCols - 1) {
                        slider.append(
                            $('<div class="nivo-box" name="' + cols + '" rel="' + rows + '"><img src="' + vars.currentImage.attr('src') + '" style="position:absolute; width:' + slider.width() + 'px; height:auto; display:block; top:-' + (boxHeight * rows) + 'px; left:-' + (boxWidth * cols) + 'px;" /></div>').css({
                                opacity: 0,
                                left: (boxWidth * cols) + 'px',
                                top: (boxHeight * rows) + 'px',
                                width: (slider.width() - (boxWidth * cols)) + 'px'

                            })
                        );
                        $('.nivo-box[name="' + cols + '"]', slider).height($('.nivo-box[name="' + cols + '"] img', slider).height() + 'px');
                    } else {
                        slider.append(
                            $('<div class="nivo-box" name="' + cols + '" rel="' + rows + '"><img src="' + vars.currentImage.attr('src') + '" style="position:absolute; width:' + slider.width() + 'px; height:auto; display:block; top:-' + (boxHeight * rows) + 'px; left:-' + (boxWidth * cols) + 'px;" /></div>').css({
                                opacity: 0,
                                left: (boxWidth * cols) + 'px',
                                top: (boxHeight * rows) + 'px',
                                width: boxWidth + 'px'
                            })
                        );
                        $('.nivo-box[name="' + cols + '"]', slider).height($('.nivo-box[name="' + cols + '"] img', slider).height() + 'px');
                    }
                }
            }

            self.sliderImg.stop().animate({
                height: $(vars.currentImage).height()
            }, settings.animSpeed);
        }

        // Shuffle an array
        function shuffle(arr) {
            for (var j, x, i = arr.length; i; j = parseInt(Math.random() * i, 10), x = arr[--i], arr[i] = arr[j], arr[j] = x);
            return arr;
        }

        self.slider.bind('nivo:animFinished', function () {
            self.sliderImg.attr('src', self.vars.currentImage.attr('src'));
            self.vars.running = false;
            // Hide child links
            $(self.children).each(function () {
                if ($(this).is('a')) {
                    $(this).css('display', 'none');
                }
            });
            // Show current link
            if ($(self.children[self.vars.currentSlide]).is('a')) {
                $(self.children[self.vars.currentSlide]).css('display', 'block');
            }
            // Restart the timer
            if (self.timer === '' && !self.vars.paused && !self.settings.manualAdvance) {
                self.timer = setInterval(function () {
                    nivoRun(false);
                }, self.settings.pauseTime);
            }
            // Trigger the afterChange callback
            self.settings.afterChange.call(this);
        });

    }

    function animations() {

    }

    function resize() {
        var slider = $(this.element);
        var sliderImg = $('.nivo-main-image');
        var self = this;

        // Detect Window Resize
        $(window).resize(function () {
            slider.children('img').width(slider.width());
            sliderImg.attr('src', self.vars.currentImage.attr('src'));
            sliderImg.stop().height('auto');
            $('.nivo-slice').remove();
            $('.nivo-box').remove();
        });
    }


    $.fn.nivoSlider = function (options) {
        return this.each(function () {
            var element = $(this);
            // Return early if this element already has a plugin instance
            if (element.data('nivoslider')) {
                return element.data('nivoslider');
            }
            // Pass options to plugin constructor
            var nivoslider = new NivoSlider(this, options);
            // Store plugin object in this element's data
            element.data('nivoslider', nivoslider);
        });
    };

})(jQuery, window, document);
