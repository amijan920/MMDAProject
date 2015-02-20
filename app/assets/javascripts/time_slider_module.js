var TimeSlider;

TimeSlider = (function() {
	function TimeSlider(data, callback) {
		// console.log(data);
		this.dataset = {};
		this.active_data = null;
		this.colData = [];

		this.add_dataset("overall", data);
		this.active_dataset = "overall-a";
		this.active_data = this.dataset[this.active_dataset];
		this.collate_data();

		this.context = $("#time-slider");
		this.callback = callback;

		this.draggerHeight = 20;
		this.draggerWidth = 70;
		this.width = this.context.width();
		this.height = this.context.height();

		this.bound_height = this.height - this.draggerHeight

		this.dragger = null
		this.vis = null;
		this.rects = null;
		this.colors = ['rgb(255,255,178)','rgb(254,217,118)','rgb(254,178,76)','rgb(253,141,60)','rgb(240,59,32)','rgb(189,0,38)'];
		//['rgb(254,217,118)','rgb(254,178,76)','rgb(253,141,60)','rgb(252,78,42)','rgb(227,26,28)','rgb(189,0,38)','rgb(128,0,38)'];
		//['rgb(228,26,28)','rgb(55,126,184)','rgb(77,175,74)','rgb(152,78,163)','rgb(255,127,0)','rgb(255,255,51)','rgb(166,86,40)'];
		//['rgb(255,255,178)','rgb(254,217,118)','rgb(254,178,76)','rgb(253,141,60)','rgb(252,78,42)','rgb(227,26,28)','rgb(177,0,38)'];

		this.create_vis();
	}

	TimeSlider.prototype.add_dataset= function(dataName, data) {
		var north = [];
		var south = [];
		var ave = [];
		var count = 0;

		for(var i = 0; i < 96; i++) {
			north[i] = 0; 
			south[i] = 0; 
			ave[i] = 0;
		}
		
		for(var i = 0; i < data.length; i++) {
			for(var j = 0; j < 96; j++) {
				north[j] = Math.max(data[i][j+3], north[j]);
				south[j] = Math.max(data[i][j+100], south[j]);
			}
		}

		for(var i = 0; i < 96; i++) {
			ave[i] = (north[i] + south[i])/2;
		}

		this.dataset[dataName + "-n"] = north;
		this.dataset[dataName + "-s"] = south;
		this.dataset[dataName + "-a"] = ave;
	}

	TimeSlider.prototype.refresh_data = function() {
		this.rects
			.transition()
			.duration(500)
			.attr("fill", (function(_this) {
				return function(d, i) {
					d = _this.colData[i];
					var val = Math.floor(d / 3 * 6);
					return _this.colors[val];
				}
			})(this));
	}

	TimeSlider.prototype.switch_data = function(data_name) {
		// console.log(data_name);

		this.active_dataset = data_name;
		this.active_data = this.dataset[data_name];
		this.collate_data();
		this.refresh_data();
	}

	TimeSlider.prototype.collate_data = function() {
		for(var i = 0; i < 24; i++) {
			this.colData[i] = 0;
			for(var j = 0; j < 4; j++) {
				this.colData[i] = Math.max(this.active_data[i*4 + j], this.colData[i]);
			}
			// this.colData[i] /= 4;
		}
	}

	TimeSlider.prototype.create_vis = function() {
		this.vis = d3.select("#time-slider")
			.append("svg")
			.attr("width", this.width)
			.attr("height", this.height)
			.attr("id", "svg_time");

		this.scale = this.vis.append("g")
			.attr("height", this.height)
			.attr("width", this.width);

		this.rects = this.scale.selectAll("rect")
			.data(this.colData);

		this.rects
			.enter()
			.append("rect")
			.attr("fill", (function(_this) {
				return function(d) {
					var val = Math.floor(d / 3 * 6);
					return _this.colors[val];
				}
			})(this))
			.attr("width", 30)
			.attr("height", this.height/this.colData.length - 3)
			.attr("x", this.width - 30)
			.attr("y", (function(_this) {
				return function(d, i) {
					return i*_this.bound_height/_this.colData.length + _this.draggerHeight/2;
				}
			})(this));

		this.texts = this.scale.selectAll("text")
			.data(this.colData);

		this.texts
			.enter()
			.append("text")
			.text(function(d, i) {
				var a = "";
				a += i;
				if(a.length < 2)
					a = "0" + a;
				return a + ":00";
			})
			.attr("x", this.width - 75)
			.attr("y", (function(_this) {
				return function(d, i) {
					return i*_this.bound_height/_this.colData.length + _this.draggerHeight/2 + 14;
				}
			})(this))
			.attr("fill", "#888888");

		var dragOffset = this.width - this.draggerWidth - 32;

		this.g = this.vis.selectAll("g")
			.data([{x:dragOffset, y:0}, {x:dragOffset, y:0}])
			.enter()
				.append("g")
				.attr("height", this.height)
				.attr("width", this.width);

		var dragMove = (function(_this){
			return function(d) {
		    d3.select(this)
		      .attr("x", d.x = dragOffset)
		      .attr("y", d.y = Math.max(0, Math.min(_this.height-_this.draggerHeight, d3.event.y)));

		    val = (d.y / (_this.height-_this.draggerHeight) * 95);
		    val = Math.floor(val);

				var text = "" + (Math.floor(val/4));
				if(text.length < 2)
					text = "0"+text;

				switch(val%4) {
					case 0:
						text+=":00"; break;
					case 1:
						text+=":15"; break;
					case 2:
						text+=":30"; break;
					case 3:
						text+=":45"; break;
				}

				_this.draggerText
		      .attr("x", d.x + 26)
		      .attr("y", d.y + 15)
		      .text(text);

		   	_this.callback(d.y / (_this.height-_this.draggerHeight) * 95);

			}
		})(this);


		this.bar = this.vis.append("g")
			.attr("height", this.height)
			.attr("width", this.width);

		this.bar.append("rect")
			.attr("height", this.bound_height)
			.attr("width", 4)
			.attr("y", this.draggerHeight/2)
			.attr("x", this.width - 36)
			.attr("fill", "#222222");

		this.dragger = this.g
			.append("rect")
			.attr("x", function(d) { return d.x; })
			.attr("y", function(d) { return d.y; })
			.attr("fill", "#222222")
			.attr("height", this.draggerHeight)
			.attr("width", this.draggerWidth)
			.call((function(_this) {
				return d3.behavior.drag()
		      .origin(Object)
		      .on("drag", dragMove)
		      .on('dragend', _this.drag_end);
			})(this));

		this.draggerText = this.g
			.append("text")
			.attr("class", "unselectable")
			.attr("x", function(d) { return d.x + 26; })
			.attr("y", function(d) { return d.y + 15; })
			.attr("fill", "#FFFFFF")
			.text("00:00");
	}

	TimeSlider.prototype.drag_end = function(d) {
	    d3.select(this)
        .attr('opacity', 1)
	}

	return TimeSlider;
})();


function createTimeFilter(csv) {
	// console.log(csv);
	var slider, render_vis;
	slider = null;

	render_vis = function(data) {
		slider = new TimeSlider(data, function(val) {
			val = Math.floor(val);
			root.switch_time(val);
		});
	}

	root.switch_slider_dataset = (function(_this) {
		return function(data_name) {
			return slider.switch_data(data_name);
		}
	})(this);

	root.add_slider_dataset = (function(_this) {
		return function(filtername, data) {
			return slider.add_dataset(filtername, data);
		}
	})(this);



	render_vis(csv);

	// var data = [];
	// for(var i = 0; i < 96; i++) {
	// 	data[i] = ((Math.random() * 3));
	// }
	// var 
}