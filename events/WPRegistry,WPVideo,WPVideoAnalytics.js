var _createClass = function() {
    function a(a, b) {
        for (var c, d = 0; d < b.length; d++) c = b[d], c.enumerable = c.enumerable || !1, c.configurable = !0, "value" in c && (c.writable = !0), Object.defineProperty(a, c.key, c)
    }
    return function(b, c, d) {
        return c && a(b.prototype, c), d && a(b, d), b
    }
}();

function _classCallCheck(a, b) {
    if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function")
}
var WPRegistry = function() {
        function a() {
            _classCallCheck(this, a), this.entries = [], this.lastID = 0, this.attrLoaded = "wp-loaded"
        }
        return _createClass(a, [{
            key: "add",
            value: function add(a, b) {
                var c = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : function(a) {
                    return a
                };
                if (2 > arguments.length) return 0;
                var d = "string" == typeof c ? function(a) {
                    return a[c]
                } : c;
                return this.entries[++this.lastID] = {
                    selector: a,
                    cb: b,
                    mapData: d
                }, this.lastID
            }
        }, {
            key: "remove",
            value: function remove(a) {
                this.entries[a] = void 0
            }
        }, {
            key: "query",
            value: function query(a, b) {
                return a.querySelectorAll(b + ":not([" + this.attrLoaded + "])")
            }
        }, {
            key: "run",
            value: function run(a, b) {
                var c = this,
                    d = [];
                this.entries.forEach(function(e) {
                    e && c.query(a, e.selector).forEach(function(a) {
                        d.push(a), e.cb(a, e.mapData(b))
                    })
                }), d.forEach(function(a) {
                    return a.setAttribute(c.attrLoaded, !0)
                })
            }
        }]), a
    }(),
    WPVideo = function() {
        function a(a, b, c) {
            a.muted = c, c ? b.classList.add(i.mutedClass) : b.classList.remove(i.mutedClass)
        }

        function b(a) {
            var b = a.requestFullscreen || a.mozRequestFullScreen || a.webkitRequestFullscreen;
            b && b()
        }

        function c(a) {
            a.currentTime = 0, !a.getAttribute("poster") && a.getAttribute("data-current-time") && (a.currentTime = a.getAttribute("data-current-time"))
        }

        function d(a, b, e) {
            if (e) {
                if (a.readyState === a.HAVE_NOTHING) return a.addEventListener("loadeddata", function c() {
                    d(a, b, e), a.removeEventListener("loaddeddata", c)
                }), void a.load();
                a.ended && c(a), a.paused && a.play(), a.setAttribute("playing", "true"), b.classList.add(i.playingClass)
            } else a.paused || a.pause(), a.removeAttribute("playing"), b.classList.remove(i.playingClass)
        }

        function e(b, c) {
            a(b, c, !b.muted)
        }

        function f(a, b) {
            d(a, b, a.paused)
        }

        function g(b, c) {
            var e = b.getAttribute("data-poster");
            e && b.setAttribute("poster", e);
            var f = b.getElementsByTagName("source")[0],
                g = f.getAttribute("data-src");
            g && f.setAttribute("src", g), b.addEventListener("ended", function() {
                d(b, c, !1)
            });
            var h = i.clickThruUrl || c.getAttribute(i.clickThruAttrName);
            h && b.addEventListener("play", function a() {
                b.addEventListener("click", function() {
                    window.open(h)
                }), b.removeEventListener("play", a)
            }), b.autoplay && (b.setAttribute("playsinline", ""), a(b, c, !0), d(b, c, !0)), i.plugins.forEach(function(a) {
                a(b, c)
            })
        }

        function h(a) {
            var d = Array.prototype.forEach,
                h = a.getElementsByTagName("video")[0],
                j = a.getElementsByClassName(i.togglePlayClass),
                k = a.getElementsByClassName(i.toggleMuteClass),
                l = a.getElementsByClassName(i.fullScreenClass);
            g(h, a), d.call(j, function(b) {
                b.addEventListener("click", function() {
                    f(h, a, this)
                })
            }), d.call(k, function(b) {
                b.addEventListener("click", function() {
                    e(h, a, this)
                })
            }), d.call(l, function(a) {
                a.addEventListener("click", function() {
                    b(h)
                })
            }), c(h)
        }
        var i;
        return {
            init: function(a, b) {
                b = b || {}, i = {
                    togglePlayClass: b.togglePlayClass || "js-toggle-play",
                    toggleMuteClass: b.toggleMuteClass || "js-toggle-mute",
                    toggleFullScreenClass: b.fullScreenClass || "js-toggle-full-screen",
                    playingClass: b.playingClass || "playing",
                    mutedClass: b.mutedClass || "muted",
                    clickThruAttrName: b.clickThruAttrName || "data-click-through",
                    clickThruUrl: b.clickThruUrl,
                    plugins: b.plugins || []
                }, h(a)
            }
        }
    }();

function WPVideoAnalytics(a) {
    function b(b) {
        a.push(b)
    }
    return function(a) {
        var c = a.getElementsByTagName("video")[0];
        c.addEventListener("play", b), c.addEventListener("pause", b), c.addEventListener("ended", b), c.addEventListener("loadeddata", b), c.addEventListener("loadedmetadata", b)
    }
}