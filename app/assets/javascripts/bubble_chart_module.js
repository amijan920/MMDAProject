var BubbleChart, 
	__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

BubbleChart = (function() {
	function BubbleChart(data) {
		this.charge = __bind(this.charge, this);
		this.display_group_all = __bind(this.display_group_all, this);
		this.start = __bind(this.start, this);
		this.move_towards_center = __bind(this.move_towards_center, this);
		this.create_nodes = __bind(this.create_nodes, this);
		this.create_vis = __bind(this.create_vis, this);

		this.context = $("#bubble-chart");
		this.width = this.context.width();
		this.height = this.context.height();
		this.data = data;

		this.fill_color = d3.scale.ordinal()
			.domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
			.range(["#e25b83", "#ec7735", "#70c49b", "#f6c14f", 
				"#8d5641", "#2e91cb", "#53c4c8", "#b193c0", "#c6c6c0"]);

		this.center = {
			x: this.width/2,
			y: this.height/2
		};

		this.damper = 0.1;
		this.force = null;
		this.circles = null;
		this.nodes = [];

		this.create_nodes();
		this.create_vis();
	}

	BubbleChart.prototype.create_nodes = function() {
		this.data.forEach((function(_this) {
			return function(d) {
				var node;
				node = {
					id: (d.lineID + "S" + d.stationID),
					line_id: d.lineID,
					station_id: d.stationID,
					station_name: d.stationName,
					x: Math.random() * _this.width ((d.lineID % 5) * (_this.width/5)),
					y: Math.random() * _this.height,
					radius: ((Math.random() * 20) + 5),
					value: 10
				}
				return _this.nodes.push(node);
			};
		})(this));
		return this.nodes.sort(function(a, b) {
			return b.value - a.value;
		})
	}

	BubbleChart.prototype.create_vis = function() {
		var that;
		this.vis = d3.select("#bubble-chart")
			.append("svg")
			.attr("width", this.width)
			.attr("height", this.height)
			.attr("id", "svg_vis");

		this.circles = this.vis.selectAll("circle")
			.data(this.nodes, function(d) {
				console.log(d.id);
				return d.id;
			});

		this.circles
			.enter()
			.append("circle")
			.attr("r", 0)
			.attr("fill", (function(_this) {
				return function(d) {
					return _this.fill_color(d.line_id);
				};
			})(this))
			.attr("stroke-width", 2)
			.attr("stroke", (function(_this) {
				return function(d) {
					return d3.rgb(_this.fill_color(d.line_id)).darker();
				}
			})(this))
			.attr("id", function(d) {
				return "bubble-" + d.station_id;
			}).on("mouseover", function(d, i) {
				$("#testp").text(d.station_name);
			}).on("mouseout", function(d, i) {
				$("#testp").text("None");
			});

			return this.circles
				.transition()
				.duration(500)
				.attr("r", function(d) {
					return d.radius;
				});

	}

	BubbleChart.prototype.charge = function(d) {
		return -Math.pow(d.radius, 2.0)/7.8;
	}

	BubbleChart.prototype.start = function() {
		return this.force = d3.layout.force().nodes(this.nodes).size([this.width, this.height]);
	}

	BubbleChart.prototype.display_group_all = function() {
		this.force.gravity(-0.01)
		.charge(this.charge)
		.friction(0.9)
		.on("tick", (function(_this) {
			return function(e) {
				return _this.circles.each(_this.move_towards_center(e.alpha))
					.attr("cx", function(d) { return d.x })
					.attr("cy", function(d) { return d.y });
			}
		})(this));
		this.force.start();
		// return this.hide_years();
	};

	BubbleChart.prototype.move_towards_center = function(alpha) {
		return ((function(_this) { 
			return function(d) {
				d.x = d.x + (_this.center.x - d.x) * (_this.damper + 0.02) * alpha;
				d.y = d.y + (_this.center.y - d.y) * (_this.damper + 0.02) * alpha;
			}
		})(this));
	}

	return BubbleChart;
})();

var root;
root = typeof exports !== "undefined" && exports !== null ? exports : this;

function createChart() {
	var chart, render_vis;
	chart = null;

	render_vis = function(csv) {
		chart = new BubbleChart(csv);
		chart.start();
		return root.display_all();
	}
	root.display_all = (function(_this) {
		return function() {
			return chart.display_group_all();
		}
	})(this);

	return d3.csv("assets/line_stations.csv", render_vis);
}