/*	
 *	Tutorial by: Jim Vallandingham
 *	reference: http://vallandingham.me/bubble_charts_in_d3.html
 */

var BubbleChart, 
	__bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };


var root = typeof exports !== "undefined" && exports !== null ? exports : this;
var c_view_type = 'all';
var c_line = 2;

BubbleChart = (function() {
	function BubbleChart(data) {
		this.charge = __bind(this.charge, this);
		this.display_group_all = __bind(this.display_group_all, this);
		this.start = __bind(this.start, this);
		this.move_towards_center = __bind(this.move_towards_center, this);
		this.create_nodes = __bind(this.create_nodes, this);
		this.create_edges = __bind(this.create_edges, this);
		this.create_vis = __bind(this.create_vis, this);

		this.context = $("#bubble-chart");
		this.width = this.context.width();
		this.bound_width = this.width - this.width/4;
		this.height = this.context.height();
		this.bound_height = this.height - this.height/4;
		this.data = data;

		// this.colors = ["#8dd3c7", "#ffffb3",
		// 	"#bebada", "#fb8072", "#80b1d3",
		// 	"#fdb462", "#b3de69", "#fccde5", "#d9d9d9"];

		this.colors = ["#e25b83", "#ec7735", "#70c49b", "#f6c14f", 
		 		"#8d5641", "#2e91cb", "#53c4c8", "#b193c0", "#c6c6c0"]
		
		this.fill_color = d3.scale.ordinal()
			.domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
			.range(this.colors);

		this.line_centers = {};
		for(var i = 0; i < data.length; i++) {
			this.line_centers[data[i].lineID] = {};
			this.line_centers[data[i].lineID].x = this.width/8 + (data[i].lineID % 5) * (this.bound_width/5) + this.bound_width/10;
	 		this.line_centers[data[i].lineID].y = this.height/8 + Math.floor(data[i].lineID / 5) * (this.bound_height/2) + this.bound_height/4;
		}

		this.station_count = {};

		this.center = {
			x: this.width/2,
			y: this.height/2
		};

		this.line_outside = {};
		for(var i = 0; i < data.length; i++) {
			this.line_outside[data[i].lineID] = {};
			this.line_outside[data[i].lineID].x = (((this.center.x) + Math.cos(data[i].lineID*Math.PI*2/9 + Math.PI)*this.width));
	 		this.line_outside[data[i].lineID].y = (((this.center.y) + Math.sin(data[i].lineID*Math.PI*2/9 + Math.PI)*this.width));
		}

		this.damper = 0.1;
		this.force = null;
		this.circles = null;
		this.lines = null;
		this.nodes = [];
		this.edges = [];

		this.create_nodes();
		this.create_edges();
		this.create_vis();

		this.vis.call(this.tip);
	}

	BubbleChart.prototype.tip = d3.tip()
	  .offset([-10, 0])
	  .html(function(d) {
	    return "<span>" + d.station_name + "</span>";
  	})
  	.attr("class", "d3-tip");

	BubbleChart.prototype.create_nodes = function() {
		this.data.forEach((function(_this) {
			return function(d) {
				var node;
				node = {
					id: (d.lineID + "S" + d.stationID),
					line_id: d.lineID,
					station_id: d.stationID,
					station_name: d.stationName,
					x: (((_this.width/2) + Math.cos(d.lineID*Math.PI*2/9 + Math.PI)*200) + ((Math.random()*20) -10)),
					y: (((_this.height/2) + Math.sin(d.lineID*Math.PI*2/9 + Math.PI)*200) + ((Math.random()*20) -10)),
					radius: ((Math.random() * 20) + 5),
					value: 10
				}
				if(!_this.station_count[d.lineID])
					_this.station_count[d.lineID] = 0;
				_this.station_count[d.lineID]++;
				return _this.nodes.push(node);
			};
		})(this));
	}

	BubbleChart.prototype.create_edges = function() {
		for(var i = 0; i < this.nodes.length-1; i++) {
			if( this.nodes[i].line_id != this.nodes[i+1].line_id )
				continue;
			var edge;
			edge = {
				p1: i,
				p2: (i+1),
				id: (i + "-" + (i+1)),
				line_id: this.nodes[i].line_id
			}
			this.edges.push(edge);
		}
	}

	BubbleChart.prototype.create_vis = function() {
		var that;
		this.vis = d3.select("#bubble-chart")
			.append("svg")
			.attr("width", this.width)
			.attr("height", this.height)
			.attr("id", "svg_vis");

		this.lines = this.vis.selectAll("line")
			.data(this.edges, function(d) {
				return d.id;
			})

		this.lines
			.enter()
			.append("line")
			.attr("stroke-width", 3)
			.attr("stroke", (function(_this) {
				return function(d) {
					return d3.rgb(_this.fill_color(d.line_id)).darker();
				}
			})(this))
			.attr("x1", (function(_this) {
				return function(d) {
					return _this.nodes[d.p1].x
				}
			})(this))
			.attr("x2", (function(_this) {
				return function(d) {
					return _this.nodes[d.p2].x
				}
			})(this))
			.attr("y1", (function(_this) {
				return function(d) {
					return _this.nodes[d.p1].y
				}
			})(this))
			.attr("y2", (function(_this) {
				return function(d) {
					return _this.nodes[d.p2].y
				}
			})(this))
			.attr("class", function(d) {
				return "edge-line edge-line-" + d.line_id;
			});

		this.circles = this.vis.selectAll("circle")
			.data(this.nodes, function(d) {
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
			.attr("stroke-width", 1.5)
			.attr("stroke", (function(_this) {
				return function(d) {
					return d3.rgb(_this.fill_color(d.line_id)).darker();
				}
			})(this))
			.attr("id", function(d) {
				return "bubble-" + d.station_id;
			})
			.on('mouseover', (function(_this){
				return function(d) {
					_this.tip.attr("class", "d3-tip line-text-" + d.line_id);
					_this.tip.show(d);
					$(this).attr("stroke-width", 4);
				}
			})(this))
      .on('mouseout', (function(_this){
				return function(d) {
					_this.tip.hide(d);
					$(this).attr("stroke-width", 1.5);
				}
			})(this))
			// .on("mouseover", function(d, i) {
			// 	$("#testp").text(d.station_name);
			// 	$(this).attr("stroke-width", 4);
			// })
			// .on("mouseout", function(d, i) {
			// 	$("#testp").text("");
			// 	$(this).attr("stroke-width", 1.5);
			// })
			.on("click", function(d) {
				var c = {};
				c.lineID = d.line_id;
				zoom_line(c);
			})
			.attr("cx", function(d) {
				return d.x;
			})
			.attr("cy", function(d) {
				return d.y;
			})
			.attr("class", function(d) {
				return "circle-line circle-line-" + d.line_id;
			});

		return this.circles
			.transition()
			.duration(500)
			.attr("r", function(d) {
				return d.radius;
			});

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
				_this.circles.each(_this.move_towards_center(e.alpha))
					.attr("cx", function(d) { return d.x })
					.attr("cy", function(d) { return d.y });
				_this.lines.each(function(d){})
					.attr("x1", (function(__this) {
						return function(d) {
							return __this.nodes[d.p1].x
						}
					})(_this))
					.attr("x2", (function(__this) {
						return function(d) {
							return __this.nodes[d.p2].x
						}
					})(_this))
					.attr("y1", (function(__this) {
						return function(d) {
							return __this.nodes[d.p1].y
						}
					})(_this))
					.attr("y2", (function(__this) {
						return function(d) {
							return __this.nodes[d.p2].y
						}
					})(_this));
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

	BubbleChart.prototype.display_by_line = function() {
		this.force.gravity(this.layout_gravity)
			.charge(this.charge)
			.friction(0.9)
			.on("tick", (function(_this) {
				return function(e) {
					_this.circles.each(_this.move_towards_line(e.alpha))
						.attr("cx", function(d) { return d.x; })
						.attr("cy", function(d) { return d.y; });
					_this.lines.each(function(d){})
						.attr("x1", (function(__this) {
							return function(d) {
								return __this.nodes[d.p1].x
							}
						})(_this))
						.attr("x2", (function(__this) {
							return function(d) {
								return __this.nodes[d.p2].x
							}
						})(_this))
						.attr("y1", (function(__this) {
							return function(d) {
								return __this.nodes[d.p1].y
							}
						})(_this))
						.attr("y2", (function(__this) {
							return function(d) {
								return __this.nodes[d.p2].y
							}
						})(_this));
				}
			})(this));
			this.force.start();
	}

	BubbleChart.prototype.move_towards_line = function(alpha) {
		return (function(_this) {
			return function(d) {
				var target;
				target = _this.line_centers[d.line_id];
				d.x = d.x + (target.x - d.x) * (_this.damper + 0.02) * alpha * 1.1;
				d.y = d.y + (target.y - d.y) * (_this.damper + 0.02) * alpha * 1.1;
			}
		})(this);
	};

	BubbleChart.prototype.display_by_rect = function(line_id) {
		this.force.gravity(this.layout_gravity)
			.charge(this.charge)
			.friction(0.9)
			.on("tick", (function(_this) {
				return function(e) {
					_this.circles.each(_this.move_towards_rect(e.alpha, line_id))
						.attr("cx", function(d) { return d.x; })
						.attr("cy", function(d) { return d.y; });
					_this.lines.each(function(d){})
						.attr("x1", (function(__this) {
							return function(d) {
								return __this.nodes[d.p1].x
							}
						})(_this))
						.attr("x2", (function(__this) {
							return function(d) {
								return __this.nodes[d.p2].x
							}
						})(_this))
						.attr("y1", (function(__this) {
							return function(d) {
								return __this.nodes[d.p1].y
							}
						})(_this))
						.attr("y2", (function(__this) {
							return function(d) {
								return __this.nodes[d.p2].y
							}
						})(_this));
				}
			})(this));
			this.force.start();
	}

	BubbleChart.prototype.move_towards_rect = function(alpha, line_id) {
		return (function(_this) {
			return function(d) {
				//TODO stations
				var stations = _this.station_count[d.line_id];
				var rot = (Math.PI*2/stations)*d.station_id + Math.PI;
				var target = {};

				if(d.line_id == line_id) {
					target.x = Math.min(_this.center.x + _this.width/3, Math.cos(rot)*300 + _this.center.x);
					target.x = Math.max(_this.center.x - _this.width/3, target.x);
					target.y = Math.min(_this.center.y + _this.height/3, Math.sin(rot)*300 + _this.center.y);
					target.y = Math.max(_this.center.y - _this.height/3, target.y);
				}
				else {
					target = _this.line_outside[d.line_id];
				}

				d.x = d.x + (target.x - d.x) * (_this.damper + 0.02) * alpha * 1.1;
				d.y = d.y + (target.y - d.y) * (_this.damper + 0.02) * alpha * 1.1;
			};
		})(this);
	};

	return BubbleChart;
})();


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

	root.display_line = (function(_this) {
		return function() {
			return chart.display_by_line();
		};
	})(this);

	root.display_rect = (function(_this) {
		return function(line_id) {
			return chart.display_by_rect(line_id);
		};
	})(this);

	root.toggle_view = (function(_this) {
		return function(view_type, line_id) {
			c_view_type = view_type;
			if(view_type === 'line') {
				root.display_line();
			}
			else if(view_type === 'ind-line') {
				root.display_rect(line_id);
			}
			else {
				root.display_all();
			}
		};
	})(this);

	$("#view-by-lines").click(function(e) {
		root.toggle_view('line');
		$(".vis-btn").toggleClass("active", false);
		$("#view-by-lines").toggleClass("active", true);
	});

	$("#view-all").click(function(e) {
		root.toggle_view('all');
		$(".vis-btn").toggleClass("active", false);
		$("#view-all").toggleClass("active", true);
	});

	return d3.csv("assets/line_stations.csv", render_vis);
}