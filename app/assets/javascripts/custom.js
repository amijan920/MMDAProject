function init_lineFilter(data) {
	var $line_filter = d3.select("#line-filter");

	var i = 1;
	var $line_divs = $line_filter.selectAll("div")
		.data(data)
		.enter()
		.append("div")
			.attr("class", function(d){return "line-item"})
			.attr("id", function(d){return "line-item-"+d.lineID});

	$line_divs.append("div")
		.attr('id', function(d) {return "line-square-" + d.lineID})
		.attr('class', function(d) {return "line-square line-" + d.lineID + " "})
		.attr("data-toggled", 1);

	$line_divs.append("div")
		.text( function(d) { return d.lineName;})
		.attr('class', function(d) { return "line-label"});

	d3.selectAll('.line-item').on('click', toggle_lineFilter);
}

function toggle_lineFilter(d, i) {
	var $line_square = $("#line-item-"+d.lineID).find(".line-square");
	if( $line_square.data("toggled") === 0) {
		$line_square.data("toggled", 1);
		$line_square.removeClass("unselected");
	}
	else {
		$line_square.data("toggled", 0);
		$line_square.addClass("unselected");
	}
}


function ready() {
	
	var lines;
	var menu = d3.select("#menu select").on("change", change);
	var line_filter = d3.select("#line-filter");

	d3.csv("assets/line_names.csv", init_lineFilter);
	//d3.csv("assets/line_names.csv", draw);

	function draw(data){
	// your visualization code goes here
		lines = data;
		// set size of SVG viewport
		var margin = 50,
			width = 700,
			height = 300;

//  		var svg = d3.select("body")
//  				.append("svg")
//  			 	.attr("width",width)
//  			 	.attr("height",height);

		menu.selectAll("option")
			.data(data)
			.enter().append("option")
			.text(function(d){ return d.lineName; })
			.attr("value", function(d){ return d.lineID; });
		
		menu.property("value",4); //set option to C5

		
		//d3.select("body").append("p")
		//	.text("You have selected line index: "+ this_lineID);				
		
		//var filtered_data=data.filter(function(d){return d.lineID === this_lineID;});
		
		//d3.select("body").append("p")
		//	.text("You have selected "+ this_lineName);				
		
		redraw();
	}

	function change(){
		d3.select("#info ul").remove();
		redraw();
	}

	function redraw(){
		var this_lineID = menu.property("value");
		var this_line = lines.filter(function(d){return d.lineID===this_lineID;});

		d3.select("#info").append("ul")
			.selectAll("li")
			.data(this_line)
			.enter()
			.append("li")
			.text(function(d){return d.lineName;});
	}

	createChart();
}

$(document).ready(ready);