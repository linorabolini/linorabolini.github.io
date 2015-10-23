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
                solarSystem.resume();
            }
        }));
    });

    // initialize draggable(s)
    $('.draggable').each( function(i, el) {
        new Draggable( el, droppableArr, {
            onStart:function() {
                solarSystem.pause();
                // add class 'drag-active' to body
                classie.add( body, 'drag-active' );
            },
            onEnd:function( instance, wasDropped ) {
                classie.remove( body, 'drag-active' );
                if(!wasDropped) {
                    solarSystem.resume();
                    dragArea.append(el);
                }
                instance.moveBack( false );
            }
        });
    });
});