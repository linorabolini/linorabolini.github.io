require.config({
	paths: {
		'jquery':'jquery-2.1.0.min',
		'underscore':'underscore-min',
		'backbone':'backbone-min'
	}
});

require(['jquery','underscore','backbone', 'element_grid'], 
	function($, _, Backbone, Eg) {

	//======================
	// create the grid

	var grid = new Eg({
		el: $('.app-container'),
		elements: $('.grid-tile'),
		min: {width: 80, height: 80},
		max: {width: 160, height: 160}
	});
	


});