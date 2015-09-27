;(function () {

    var $root;

    function log (arg) {
        console.log(arg);
    }

    // util extend function
    function extend( a, b ) {
        for( var key in b ) { 
            if( b.hasOwnProperty( key ) ) {
                a[key] = b[key];
            }
        }
        return a;
    }

    function System( $el, options ) {
        this.$el = $root = $el;
        this.planets = [];

        // extend the options
        this.options = extend( {}, this.options );
        extend( this.options, options );
    }

    System.prototype.options = {}

    // start up!
    // ===========================================
    System.prototype.start = function () {
        var self = this;

        self.$el.children('.planet').each(function() {
            self.addPlanet(this);
        });

        self.startLoop();
    }

    // main loop config
    // ===========================================
    System.prototype.startLoop = function () {
        var self = this;
        var last = Date.now();
        function step(now) {
            self.update(now - last, last* 0.001);
            last = now;
            window.requestAnimationFrame(step);
        }
        window.requestAnimationFrame(step);
    }

    // update
    // ===========================================
    System.prototype.update = function (dt, now) {
        $.each(this.planets, function (i, planet) {
            planet.update(dt, now);
        });
    }

    System.prototype.addPlanet = function (el) {
        this.planets.push(new Planet(el));
    }

    function Planet(el, parent, options) {
        this.$el = $(el);

        // extend the options
        this.options = extend( {}, this.options );
        extend( this.options, options );

        this.parent = parent;
        this.top = this.left = 0;
        this.angle = this.options.angle || Math.random() * Math.PI * 2;
        this.speed = this.options.speed || Math.random() * 4 - 2;
        this.distanceMultiplierReduction = this.options.distanceMultiplierReduction || 4;
        this.distanceMultiplier = this.options.distanceMultiplier;

        this.radius = this.$el.outerHeight(true) / 2;

        var self = this;
        this.children = this.$el.children('.planet').map(function(i, planetEl) { 
            return new Planet(planetEl, self, {
                distanceMultiplier: self.distanceMultiplier / self.distanceMultiplierReduction
            });
        });

        this.trails = this.$el.children('.trail').map(function(i, trailEl) { 
            var $trail = $(trailEl);
            $trail.hide();
            self.$el.parent().prepend($trail);
            return $trail;
        });

        this.lastTrailDistance = null;
        this.distanceToNextTrail = 20;
        this.currentTrail = 0;
        this.maxTrails = this.trails.length;
        this.enableTrails = !!this.trails.length;
    }

    Planet.prototype.options = {
        // angle:1,
        // speed: 1,
        distanceMultiplier: 400,
        distanceMultiplierReduction: 10,
    }

    Planet.prototype.update = function(dt, now, index) {
        var i = index || 0;
        var tmp1 = this.distanceMultiplier * i + this.radius * 4;
        var newAngle = now * this.speed + this.angle;

        if(this.parent) {
            this.lastTop = this.top;
            this.lastLeft = this.left;
            this.top = Math.sin(newAngle) * tmp1 + this.radius;
            this.left = Math.cos(newAngle) * tmp1 + this.radius;
            this.$el.css({'top': this.top + 'px'});
            this.$el.css({'left': this.left + 'px'});

            this.lastTrailDistance += Math.abs(this.lastTop - this.top) + Math.abs(this.lastLeft - this.left);
            this.enableTrails && this.showNextTrail();
        }

        $.each(this.children, function(i, planet) {
            planet.update(dt, now, i);
        });
    };

    Planet.prototype.showNextTrail = function() {
        if(this.lastTrailDistance < this.distanceToNextTrail) return;

        this.lastTrailDistance -= this.distanceToNextTrail;

        var top = this.$el.offset().top;
        var left = this.$el.offset().left;

        this.currentTrail = (++this.currentTrail) % this.maxTrails;
        var $trail = this.trails[this.currentTrail];

        $trail.css({top: top + this.radius, left: left + this.radius});
        $trail.show();
    };

    window.System = System;
})();


