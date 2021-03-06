;$(window).load(function() {
    solarSystemContainer = $('.solar-system');

    var solarSystem = new System(solarSystemContainer);
    solarSystem.start();

    var body = document.body,
        dragArea = $('#drag-area'),
        droppableArr = [];

    // initialize droppables
    $('.drop-area').each( function(i, el) {
        droppableArr.push( new Droppable( el, {
            onDrop:function( instance, draggableEl ) {
                // show checkmark inside the droppabe element
                $(instance.el).append(draggableEl);
                solarSystem.setSpeed(1);
            }
        }));
    });

    // initialize draggable(s)
    $('.draggable').each( function(i, el) {
        new Draggable( el, droppableArr, {
            onStart:function() {
                solarSystem.setSpeed(0.3);
                // add class 'drag-active' to body
                classie.add( body, 'drag-active' );
            },
            onEnd:function( instance, wasDropped ) {
                classie.remove( body, 'drag-active' );
                if(!wasDropped) {
                    solarSystem.setSpeed(1);
                    dragArea.append(el);
                }
                instance.moveBack( false );
            }
        });
    });

    $('.post').each(function(i, el) {
        var url = "http://lorempixel.com/600/600/?" + Math.floor(Math.random() * 10000);
        $(el).css('background-image', "url('" + url + "')");
    });

    $('.splash').each(function(i, el) {
        var url = "http://lorempixel.com/1200/600/?" + Math.floor(Math.random() * 10000);
        $(el).css('background-image', "url('" + url + "')");
    });

    $('.profile-picture').each(function(i, el) {
        var url = "http://lorempixel.com/100/100/?" + Math.floor(Math.random() * 10000);
        $(el).css('background-image', "url('" + url + "')");
    });
});