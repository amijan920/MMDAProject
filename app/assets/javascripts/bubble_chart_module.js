BubbleChart = (function() {
	function BubbleChart(data) {
		this.charge = __bind(this.charge, this);
		this.display_group_all = __bind(this.display_group_all, this);
		this.start = __bind(this.start, this);
		this.move_towards_center __bind(this.move_towards_center, this);


		this.context = $("#bubble-chart");
		this.width = this.context.width;
		this.height = this.context.height;
		this.data = data;

		this.center = {
			x: this.width/2,
			y: this.height/2
		};

		this.damper = 0.1;

		this.force = null;
		this.circles = null;
		this.nodes = [];
	}

	BubbleChart.prototype.charge = function(d) {
		return -Math.pow(d.radius, 2.0)/8;
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
