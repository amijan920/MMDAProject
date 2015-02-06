function init_lineFilter(data) {
	var $line_filter = d3.select("#line-filter");

	var i = 1;
	var $line_divs = $line_filter.selectAll("div")
		.data(data)
		.enter()
		.append("div")
			.attr("class", function(d){ return "line-item"})
			.attr("id", function(d){ return "line-item-"+d.lineID});

	$line_divs.append("div")
		.attr('id', function(d) { return "line-square-" + d.lineID})
		.attr('class', function(d) { return "line-square line-" + d.lineID + " "})
		.attr("data-toggled", 1)
		.attr("data-id", function(d) { return d.lineID} );

	$line_divs.append("div")
		.text( function(d) { return d.lineName;})
		.attr('class', function(d) { return "line-label"});

	d3.selectAll('.line-item').on('click', toggle_lineFilter);

	$line_filter.insert("div",":first-child")
		.attr('id', "line-item-a")
		.attr('class', "line-item");

	$line_filter.select("#line-item-a").append("div")
		.attr('id', "line-square-a")
		.attr('class', "line-square")
		.attr('data-toggle', 1);

	$line_filter.select("#line-item-a").append("div")
		.attr('class', "line-label")
		.text("Show/Hide all");

	$line_filter.select("#line-item-a").on("click", toggle_all);
}

function toggle_lineFilter(d, i) {
	var $line_square = $("#line-item-"+d.lineID).find(".line-square");
	if( $line_square.data("toggled") === 0) {
		$line_square.data("toggled", 1);
		$line_square.removeClass("unselected");
		$(".circle-line-"+d.lineID).each ( function(e) {
			$(this).fadeIn();
		});
		$(".edge-line-"+d.lineID).each ( function(e) {
			$(this).fadeIn();
		});
	}
	else {
		$line_square.data("toggled", 0);
		$line_square.addClass("unselected");
		$(".circle-line-"+d.lineID).each ( function(e) {
			$(this).fadeOut();
		});
		$(".edge-line-"+d.lineID).each ( function(e) {
			$(this).fadeOut();
		})
	}
}

function toggle_all() {
	console.log("clicked");
	var $line_square = $("#line-item-a").find(".line-square");
	if( $line_square.data("toggled") === 0) {
		$line_square.data("toggled", 1);
		$line_square.removeClass("unselected");

		$(".line-square").each(function(e, i) {
			id = $(this).data("id");
			$(this).data("toggled", 1);
			$(this).removeClass("unselected");
			$(".circle-line-"+id).each ( function(e) {
				$(this).fadeIn();
			})
			$(".edge-line-"+id).each ( function(e) {
				$(this).fadeIn();
			})
		})
	}
	else {
		$line_square.data("toggled", 0);
		$line_square.addClass("unselected");

		$(".line-square").each(function(e, i) {
			id = $(this).data("id");
			$(this).data("toggled", 0);
			$(this).addClass("unselected");
			$(".circle-line-"+id).each ( function(e) {
				$(this).fadeOut();
			})
			$(".edge-line-"+id).each ( function(e) {
				$(this).fadeOut();
			})
		})
	}
}


function ready() {
	d3.csv("assets/line_names.csv", init_lineFilter);
	createChart();

	// $("#line-item-a").click(function(e){console.log("wut")});
}

$(document).ready(ready);