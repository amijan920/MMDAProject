function createTimeSlider() {
	d3.select("#time-bar").call(
		d3.slider()
		.axis(true)
		.value(50)
		.orientation("vertical")
		.on("slide", function(event, value) {
			// console.log(value);
			var val = 100 - value;
			val = Math.floor(val * 95 / 100);
			console.log(Math.floor(val/4) + " " + val%4);
			root.switchData("overall", val);
		})
	);
}

var TimeSlider;

TimeSlider = (function() {
	function TimeSlider(data, callback) {
		// console.log(data);
		this.data = data;
		this.context = $("#time-slider");
		this.callback = callback;

		this.draggerHeight = 20;
		this.draggerWidth = 100;
		this.width = this.context.width();
		this.height = this.context.height();

		this.bound_height = this.height - this.draggerHeight

		this.dragger = null
		this.vis = null;
		this.rects = null;
		this.colors = ['rgb(255,255,178)','rgb(254,217,118)','rgb(254,178,76)','rgb(253,141,60)','rgb(252,78,42)','rgb(227,26,28)','rgb(177,0,38)'];

		this.collateData();
		this.create_vis();
	}

	TimeSlider.prototype.collateData = function() {
		this.colData = [];
		for(var i = 0; i < 24; i++) {
			this.colData[i] = 0;
			for(var j = 0; j < 4; j++) {
				this.colData[i] += this.data[i*4 + j];
			}
			this.colData[i] /= 4;
		}
	}

	TimeSlider.prototype.create_vis = function() {
		this.vis = d3.select("#time-slider")
			.append("svg")
			.attr("width", this.width)
			.attr("height", this.height)
			.attr("id", "svg_time");

		var dragOffset = this.width - this.draggerWidth - 32;

		this.g = this.vis.selectAll("g")
			.data([{x:dragOffset, y:0}])
			.enter()
				.append("g")
				.attr("height", this.height)
				.attr("width", this.width);

		var dragMove = (function(_this){
			return function(d) {
				// console.log(_this);
				// console.log("well");
		    d3.select(this)
		      // .attr("opacity", 0.6)
		      .attr("x", d.x = dragOffset)
		      .attr("y", d.y = Math.max(0, Math.min(_this.height-_this.draggerHeight, d3.event.y)));
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
			.attr("width", 100)
			.call((function(_this) {
				return d3.behavior.drag()
		      .origin(Object)
		      .on("drag", dragMove)
		      .on('dragend', _this.dragEnd);
			})(this));

		this.scale = this.vis.append("g")
			.attr("height", this.height)
			.attr("width", this.width);

		this.rects = this.scale.selectAll("rect")
			.data(this.colData);

		// this.rects = this.vis.selectAll("rect")
		// 	.data(this.data);

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

		// console.log(this.drag);

	}

	TimeSlider.prototype.dragEnd = function(d) {
	    d3.select(this)
        .attr('opacity', 1)
	}

	return TimeSlider;
})();

function createTimeFilter() {
	var data = [];
	for(var i = 0; i < 96; i++) {
		data[i] = ((Math.random() * 3));
	}
	var slider = new TimeSlider(data, function(val) {
		// console.log(value);
		val = Math.floor(val);
		console.log(Math.floor(val/4) + " " + val%4);
		root.switchData("overall", val);

		// console.log("called");
		// console.log(val);
	});
}