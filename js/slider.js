var slider = (function() {
    var setAllowMap = function(allowMap) {
        return function(obj) {
            return function(option) {
                for (var key in allowMap) {
                    obj[key] = option[key] || obj[key];
                }
            }
        }
    };
    var sliderObj = {
        $container: null,
        $next: null,
        $prev: null,
        $pageWrapper: null,
        pageArr: [],
        buttonArr: [],
        pageLen: 0,
        timer: 0,
        currentNum: 1,
        timerSpan: 5000,
        slideSpan: 500,
        pageW: 0,
        supportTransform: false,
        init: function($container) {
            $container = $container.find("#slider");
            // 没有元素 直接退出
            if ($container.attr("id") !== "slider") {
                return;
            }
            this.$container = $container;
            this.$pageWrapper = $container.find("#pageWrapper");
            this.pageArr = $container.find(".page");
            this.pageLen = this.pageArr.length;
            this.pageW = $(this.pageArr[0]).width();
            this.addSliderBtn();
            this.addNextPrevBtn();
            this.clonePage();
            this.$pageWrapper.width(this.pageLen * this.pageW);
            this.buttonArr = $container.find(".slider-btn");
            this.$next = $container.find(".next");
            this.$prev = $container.find(".prev");
            this.setFadeSpan();
            this.setInitLeft();
            this.bindEvent();
            this.startTimer();
        },
        addSliderBtn: function() {
            var $ul = $("<ul></ul>");
            for (var i = 0; i < this.pageLen; i++) {
                if (i === 0) {
                    $ul.append($("<li class='slider-btn current-btn'></li>"));
                    continue;
                }
                $ul.append($("<li class='slider-btn'></li>"))
            }
            this.$container.append($ul);
        },
        addNextPrevBtn: function() {
            this.$container.append($("<span class='prev'></span>"));
            this.$container.append($("<span class='next'></span>"));
        },
        bindEvent: function() {
            var slider = this;
            this.$container.on("click", "span", function() {
                // 点击时 next 和 prev 按钮同时还具备show的class
                var type = this.className.replace(/\s*show\s*/, "");
                slider.clickHandler(type).call(this, null);
            }).on("click", ".slider-btn", function() {
                var type = this.className;
                slider.clickHandler(type).call(this, null);
            }).on("mouseover", function() {
                slider.mouseoverHandler();
            }).on("mouseleave", function() {
                slider.mouseleaveHandler();
            });
        },
        startTimer: function() {
            var slider = this;
            slider.timer = setTimeout(function delay() {
                slider.$next.trigger("click");
                slider.timer = setTimeout(delay, slider.timerSpan);
            }, slider.timerSpan);
        },
        clickHandler: function(type) {
            var slider = this;
            var isTransform = this.supportTransform;
            switch (type) {
                case "next":
                    return function() {
                        if (slider.isThereAnimating()) {
                            return;
                        }
                        slider.$pageWrapper.animate(slider.getNextAnimation(), {
                            duration: slider.slideSpan,
                            complete: function() {
                                slider.currentNum++;
                                if (slider.currentNum === slider.pageLen - 1) {
                                    slider.reachEnd();
                                }
                            }
                        });
                        slider.bindBtnWithNextPrev();
                    };
                case "prev":
                    return function() {
                        if (slider.isThereAnimating()) {
                            return;
                        }
                        var getAnimateObj = function() {
                            return { "left": -slider.pageW * (slider.currentNum - 1) };
                        };
                        slider.$pageWrapper.animate(slider.getPrevAnimation(), {
                            duration: slider.slideSpan,
                            complete: function() {
                                slider.currentNum--;
                                if (slider.currentNum === 0) {
                                    slider.reachStart();
                                }
                            }
                        });
                        slider.bindBtnWithNextPrev();
                    };
                case "slider-btn":
                    return function() {
                        var i = slider.buttonArr.index(this);
                        slider.$pageWrapper.animate(slider.getBtnAnimation(i));
                        slider.currentNum = i + 1; 
                        $(this).addClass("current-btn").siblings().removeClass("current-btn");
                    };
                default:
                    throw new Error("这类点击事件未注册");
            }
        },
        mouseoverHandler: function() {
            var slider = this;
            slider.$next.addClass("show");
            slider.$prev.addClass("show");
            clearTimeout(slider.timer);
        },
        mouseleaveHandler: function() {
            var slider = this;
            slider.$next.removeClass("show");
            slider.$prev.removeClass("show");
            slider.startTimer();
        },
        setFadeSpan: function() {
            this.buttonArr.css("transition", "all " + this.slideSpan + "ms");
        },
        clonePage: function() {
            this.$pageWrapper.prepend($(this.pageArr[this.pageLen - 1]).clone())
                .append($(this.pageArr[0]).clone());
            this.pageLen += 2;
        },
        setInitLeft: function() {
            this.$pageWrapper.css("left", -this.pageW);
        },
        isThereAnimating: function() {
            return !!this.$container.find(":animated").length;
        },
        reachStart: function() {
            this.$pageWrapper.css("left", -(this.pageLen - 2) * this.pageW);
            this.currentNum = this.pageLen - 2;
        },
        reachEnd: function() {
            this.$pageWrapper.css("left", -this.pageW);
            this.currentNum = 1;
        },
        getNextAnimation: function() {
            return { "left": -this.pageW * (this.currentNum + 1) };
        },
        getPrevAnimation: function() {
            return { "left": -this.pageW * (this.currentNum - 1) };
        },
        getBtnAnimation: function(index) {
            return { "left": -this.pageW * (index + 1)};
        },
        bindBtnWithNextPrev: function() {
            $(this.buttonArr[this.currentNum - 1]).addClass("current-btn").siblings().removeClass("current-btn");
        }
    };
    var initModule = function($container) {
        sliderObj.init($container);
        return this;
    };

    var setConfig = function(option) {
        setAllowMap({
            timerSpan: true,
            slideSpan: true
        })(sliderObj)(option);
        return this;
    };

    return {
        initModule: initModule,
        setConfig: setConfig
    };
})();