define('element_grid', function () {

    var BB = require('backbone'),
        _ = require('underscore'),
        $ = require('jquery');

    var wrapperTemplate = '<div></div>'; 
    var wrapperClass = 'eg-wrapper';

    var EG = BB.View.extend({


        initialize: function(params){
            
            params.showDelay = params.showDelay || 50;
            var count = 0;
            var factor = params.maxSize / params.minSize;
            var elems = _.reduce(params.elements, function(memo, elem){
                var wrapper = $(wrapperTemplate);
                wrapper.addClass(wrapperClass);
                wrapper.append(elem);
                params.el.append(wrapper);

                var size = count > 0 ? params.min : params.max;
                wrapper.css(size);

                var anim = _.bind($(elem).animate, $(elem));
                _.delay(anim, memo, {opacity:1}, 100);
                count++;
                return memo + params.showDelay;
            }, 0);

        },
        render: function() {

        }
    });

    return EG;

});