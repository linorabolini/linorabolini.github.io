;(function () {
    var $root;

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
        this.$el = $el;
        this.planets = [];
        this.isRunning = true;

        // extend the options
        this.options = extend( {}, this.options );
        extend( this.options, options );
    }

    System.prototype.options = {}

    // start up!
    // ===========================================
    System.prototype.start = function () {
        var self = this;

        self.$el.children('.planet').each(function () {
            self.addRootPlanet(this);
        });

        self.startLoop();
    }

    // main loop config
    // ===========================================
    System.prototype.startLoop = function () {
        var self = this;
        var last = Date.now();
        var elapsed = 0;
        var dt;
        function step(now) {
            if(self.isRunning) {
                dt = now - last;
                elapsed += dt;
                self.update(dt, elapsed * 0.001);
            }
            last = now;
            window.requestAnimationFrame(step);
        }
        window.requestAnimationFrame(step);
    }

    // resume
    // ===========================================
    System.prototype.resume = function () {
        this.isRunning = true;
    }

    // pause
    // ===========================================
    System.prototype.pause = function () {
        this.isRunning = false;
    }

    // update
    // ===========================================
    System.prototype.update = function (dt, now) {
        $.each(this.planets, function (i, planet) {
            planet.update(dt, now, 0);
        });
    }

    System.prototype.addRootPlanet = function (el) {
        $root = $(el);
        this.planets.push(new Planet(el, null,{
            speed: 0
        }));
    }

    function Planet(el, parent, options) {
        this.$el = $(el);

        // extend the options
        this.options = extend( {}, this.options );
        extend( this.options, options );

        this.parent = parent;
        this.xx = this.yy = this.y = this.x = 0;
        this.angle = this.options.angle || Math.random() * Math.PI * 2;

        this.direction = this.options.direction || Math.random() > 0.5 ? 1 : -1;
        this.speed = undefined === this.options.speed ? (Math.random() + 1) : this.options.speed;
        this.speed *= this.direction;
        this.distance = this.options.distance || 40;
        this.radius = this.$el.width() / 2;

        var self = this;
        this.children = this.$el.children('.planet').map(function (i, planetEl) { 
            return new Planet(planetEl, self, $(planetEl).data());
        });

        this.trails = this.$el.children('.trail').map(function (i, trailEl) { 
            var $trail = $(trailEl);
            $trail.hide();
            $root.prepend($trail);
            return $trail;
        });

        this.lastTrailDistance = 0;
        this.distanceToNextTrail = 30;
        this.currentTrail = 0;
        this.maxTrails = this.trails.length;
        this.enableTrails = !!this.trails.length;
    }

    Planet.prototype.options = {
        // angle:1,
        // speed: 1,
    }

    Planet.prototype.update = function (dt, now) {
        if(this.speed != 0) {
            this.updatePosition(now);
            this.$el.css({'top': this.y + 'px'});
            this.$el.css({'left': this.x + 'px'});

            if (this.enableTrails) {
                this.lastTrailDistance += Math.abs(this.yy - this.y) + Math.abs(this.xx - this.x);
                this.showNextTrail(this);
             }
        }

        $.each(this.children, function (i, planet) {
            planet.update(dt, now);
        });
    };

    Planet.prototype.updatePosition= function (now) {
        var constant = this.distance;
        var newAngle = now * this.speed + this.angle;


        this.xx = this.x;
        this.yy = this.y;
        this.y = Math.sin(newAngle) * constant - this.radius + this.parent.radius;
        this.x = Math.cos(newAngle) * constant - this.radius + this.parent.radius;
    }

    Planet.prototype.showNextTrail = function () {
        while(this.lastTrailDistance > this.distanceToNextTrail) {
            this.lastTrailDistance -= this.distanceToNextTrail;

            var top = this.y;
            var left = this.x;

            this.currentTrail = (++this.currentTrail) % this.maxTrails;
            var $trail = this.trails[this.currentTrail];

            $trail.css({top: top + this.radius, left: left + this.radius});
            $trail.show();
        }
    };

    window.System = System;
})();


