function createTimeSlider() {
	d3.select("#time-bar").call(d3.slider().axis(true).value(50).orientation("vertical"));
}