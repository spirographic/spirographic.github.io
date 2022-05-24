var my_canvas = document.getElementById('canvas'),
    context = my_canvas.getContext("2d");

const c_nodes = [];
const c_circ = [];
const c_radius = [];
const e_circ = [];
const e_radius = [];
const g_radius = [];
const teeth = [];

const cut_c_nodes = [];
const cut_c_circ = [];
const cut_c_radius = [];
const cut_e_circ = [];
const cut_e_radius = [];
const cut_g_radius = [];
const cut_teeth = [];
const cut_offset_x = [];
const cut_offset_y = [];

var p_offset_x;
var p_offset_y;

var rotate;
var sp_count;

var trace;
var tpen_x;
var tpen_y;
var path_complete;
var path_start_x;
var path_start_y;

var side_length;
var mid_displace;
const ec_offset = [];
const seg_break = [];

var cut_side_length;
var cut_mid_displace;
const cut_ec_offset = [];
const cut_seg_break = [];

var resolution;

var h = 0;
var i = 0;
var j = 0;
const c_x = [];
const c_y = [];
const e_x = [];
const e_y = [];

const breakpoints = [];

const gear_shapes = [];
const cutout_shapes = [];

const gearFactors = [];
const cutFactors = [];

let gearboxes = [];

const gearList = document.getElementById('gearList');

let currentGears = [
	{ gear_mode: 'simple', c_nodes: 3, c_circ: 199, e_circ: 200, balance: 99, cut_mode: 'simple', cut_c_nodes: 3, cut_c_circ: 159, cut_e_circ: 160, cut_balance: 99, x_offset: 0, y_offset: 0 },
	{ gear_mode: 'polygon', c_nodes: 3, c_circ: 30, e_circ: 90, balance: 58, cut_mode: 'simple', cut_c_nodes: 3, cut_c_circ: 159, cut_e_circ: 160, cut_balance: 99, x_offset: 0, y_offset: 0 }
];

const gearSetup = [
	{ type: 'number', id: 'nodes_', func: function() {redraw();}, value: '3', label: 'Corner count:' },
	{ type: 'number', id: 'c_size_', func: function() {redraw();}, value: '30', label: 'Corner size:' },
	{ type: 'number', id: 'e_size_', func: function() {redraw();}, value: '90', label: 'Edge size:' },
	{ type: 'range', id: 'ratio_', func: function() {redraw();}, value: '58', label: 'Tooth balance:' }
];

const cutoutSetup = [
	{ type: 'number', id: 'cut_nodes_', func: function() {redraw();}, value: '3', label: 'Corner count:' },
	{ type: 'number', id: 'cut_c_size_', func: function() {redraw();}, value: '30', label: 'Corner size:' },
	{ type: 'number', id: 'cut_e_size_', func: function() {redraw();}, value: '90', label: 'Edge size:' },
	{ type: 'range', id: 'cut_ratio_', func: function() {redraw();}, value: '58', label: 'Tooth balance:' },
	{ type: 'number', id: 'cut_x_offset_', func: function() {redraw();}, value: '0', label: 'X-axis offset:' },
	{ type: 'number', id: 'cut_y_offset_', func: function() {redraw();}, value: '0', label: 'Y-axis offset:' }
];

var x = window.innerWidth/2;
var y = window.innerHeight/2;

var tx = 0;
var ty = 0;

var debug_txt = '';

function setVariables() {
	context.setTransform(1,0,0,1,x,y);
	
	gearboxes = document.getElementsByClassName('gearBox');
	
	for (let i = 0; i < gearboxes.length; i++){
		c_nodes[i] = Number(document.getElementById('nodes_'+i).value);
		c_circ[i] = Number(document.getElementById('c_size_'+i).value);
		c_radius[i] = c_circ[i] / 2*Math.PI;
		e_circ[i] = Number(document.getElementById('e_size_'+i).value);
		e_radius[i] = e_circ[i] / 2*Math.PI;
		g_radius[i] = (e_radius[i] - c_radius[i]) * (Number(document.getElementById('ratio_'+i).value)/100);
	}
	
	for (let i = 0; i < (gearboxes.length - 1); i++){
		cut_c_nodes[i] = Number(document.getElementById('cut_nodes_'+i).value);
		cut_c_circ[i] = Number(document.getElementById('cut_c_size_'+i).value);
		cut_c_radius[i] = cut_c_circ[i] / 2*Math.PI;
		cut_e_circ[i] = Number(document.getElementById('cut_e_size_'+i).value);
		cut_e_radius[i] = cut_e_circ[i] / 2*Math.PI;
		cut_g_radius[i] = (cut_e_radius[i] - cut_c_radius[i]) * (Number(document.getElementById('cut_ratio_'+i).value)/100);
		cut_offset_x[i] = Number(document.getElementById('cut_x_offset_'+i).value);
		cut_offset_y[i] = Number(document.getElementById('cut_y_offset_'+i).value);
	}
	
	p_offset_x = Number(document.getElementById('poff_x').value);
	p_offset_y = Number(document.getElementById('poff_y').value);

	rotate = 0;
	sp_count = 0;
	
	trace = new Path2D();
	tpen_x = x;
	tpen_y = y;
	path_complete = false;
	path_start_x = 0;
	path_start_y = 0;
	
	resolution = Number(document.getElementById('speed').value);
}

function redraw() {
	setVariables();
	path_complete = true;
	init();
}

function addGear() {
	///////////////////////////////////////////////////////////
	// Create labels and inputs for cutout on preceding gear //
	///////////////////////////////////////////////////////////
	
	// Set gear numbers
	let gear_n = gearboxes.length;
	let cut_n = gear_n - 1;
	
	// Select preceding gear and create div for cutout controls
	let lastGear = document.getElementById('gear_' + cut_n);
	let newCutout = document.createElement('div');
	newCutout.className = 'cutout';
	newCutout.id = 'cutout_' + cut_n;
	
	// Define cutout labels and inputs
	let newRadio = document.createElement('input');
	newRadio.type = 'radio';
	newRadio.id = 'simple_cut_mode_' + cut_n;
	newRadio.name = 'cut_mode_' + cut_n;
	newRadio.value = 'Simple';
	let newRLabel = document.createElement('label');
	let newRLText = document.createTextNode('Simple Mode');
	newRLabel.appendChild(newRLText);
	
	newCutout.appendChild(newRadio);
	newCutout.appendChild(newRLabel);
	
	newRadio = document.createElement('input');
	newRadio.type = 'radio';
	newRadio.id = 'polygon_cut_mode_' + cut_n;
	newRadio.name = 'cut_mode_' + cut_n;
	newRadio.value = 'Polygon';
	newRLabel = document.createElement('label');
	newRLText = document.createTextNode('Polygon Mode');
	newRLabel.appendChild(newRLText);
	
	newCutout.appendChild(newRadio);
	newCutout.appendChild(newRLabel);
	newCutout.appendChild(document.createElement('br'));
	
	for (let i = 0; i < cutoutSetup.length; i++) {
		let newLabel = document.createElement('label');
		newLabel.htmlFor = cutoutSetup[i].id + cut_n;
		let newLabelText = document.createTextNode(cutoutSetup[i].label);
		newLabel.appendChild(newLabelText);
		let newInput = document.createElement('input');
		newInput.type = cutoutSetup[i].type;
		newInput.id = cutoutSetup[i].id + cut_n;
		newInput.name = cutoutSetup[i].id + cut_n;
		newInput.value = cutoutSetup[i].value;
		if (cutoutSetup[i].type == 'range') {
			newInput.min = '1';
			newInput.max = '100';
			newInput.addEventListener('input', cutoutSetup[i].func);
		}
		newInput.addEventListener('change', cutoutSetup[i].func);
		newCutout.appendChild(newLabel);
		newCutout.appendChild(newInput);
		if (cutoutSetup[i].type == 'range') {
			let newSpan = document.createElement('span');
			newSpan.id = 'cut_gearTeeth_' + cut_n;
			newCutout.appendChild(newSpan);
			newCutout.appendChild(document.createElement('br'));
			let cfactorSpan = document.createElement('span');
			cfactorSpan.id = 'cutFactors_' + cut_n;
			newCutout.appendChild(cfactorSpan);
		}
		newCutout.appendChild(document.createElement('br'));
	}
	newCutout.appendChild(document.createElement('br'));
	lastGear.appendChild(newCutout);
	
	/////////////////////////////////////////
	// Create div for new gear information //
	/////////////////////////////////////////
	
	// Create DOM element
	const newGear = document.createElement('div');
	
	// Set class and ID
	newGear.className = 'gearBox';
	newGear.id = 'gear_' + gearboxes.length;
	
	///////////////////////////////////////////
	// Create labels and inputs for new gear //
	///////////////////////////////////////////
	
	// Define new labels and inputs
	newRadio = document.createElement('input');
	newRadio.type = 'radio';
	newRadio.id = 'simple_cut_mode_' + cut_n;
	newRadio.name = 'cut_mode_' + cut_n;
	newRadio.value = 'Simple';
	newRLabel = document.createElement('label');
	newRLText = document.createTextNode('Simple Mode');
	newRLabel.appendChild(newRLText);
	
	newGear.appendChild(newRadio);
	newGear.appendChild(newRLabel);
	
	newRadio = document.createElement('input');
	newRadio.type = 'radio';
	newRadio.id = 'polygon_cut_mode_' + cut_n;
	newRadio.name = 'cut_mode_' + cut_n;
	newRadio.value = 'Polygon';
	newRLabel = document.createElement('label');
	newRLText = document.createTextNode('Polygon Mode');
	newRLabel.appendChild(newRLText);
	
	newGear.appendChild(newRadio);
	newGear.appendChild(newRLabel);
	newGear.appendChild(document.createElement('br'));
	
	for (let i = 0; i < gearSetup.length; i++) {
		let newLabel = document.createElement('label');
		newLabel.htmlFor = gearSetup[i].id + gear_n;
		let newLabelText = document.createTextNode(gearSetup[i].label);
		newLabel.appendChild(newLabelText);
		let newInput = document.createElement('input');
		newInput.type = gearSetup[i].type;
		newInput.id = gearSetup[i].id + gear_n;
		newInput.name = gearSetup[i].id + gear_n;
		newInput.value = gearSetup[i].value;
		if (gearSetup[i].type == 'range') {
			newInput.min = '1';
			newInput.max = '100';
			newInput.addEventListener('input', gearSetup[i].func);
		}
		newInput.addEventListener('change', gearSetup[i].func);
		newGear.appendChild(newLabel);
		newGear.appendChild(newInput);
		if (gearSetup[i].type == 'range') {
			let newSpan = document.createElement('span');
			newSpan.id = 'gearTeeth_' + gear_n;
			newGear.appendChild(newSpan);
		}
		newGear.appendChild(document.createElement('br'));
	}
	let gfactorSpan = document.createElement('span');
	gfactorSpan.id = 'gearFactors_' + gear_n;
	newGear.appendChild(gfactorSpan);
	newGear.appendChild(document.createElement('br'));
	newGear.appendChild(document.createElement('br'));
	gearList.appendChild(newGear);
	
	////////////////////////
	// Redraw gear system //
	////////////////////////
	
	redraw();
}

function debug() {

// Set calculation stroke color to gray
context.strokeStyle = 'gray';

// Draw core geometry circle
context.beginPath();
context.arc(x,y,g_radius,0,2*Math.PI);
//context.stroke();

// Find corner centers
for (let i = 0; i < c_nodes; i++){
	// Store corner centers in array
  c_x.push(Math.cos(Math.PI * 2 * i / c_nodes) * g_radius + x);
  c_y.push(Math.sin(Math.PI * 2 * i / c_nodes) * g_radius + y);
  // Draw lines to corner centers
	context.beginPath();
	//context.moveTo(x,y);
  //context.lineTo(c_x[i],c_y[i]);
  context.stroke();
  // Test draw corner circles
  context.beginPath();
	context.arc(c_x[i],c_y[i],c_radius,0,2*Math.PI);
  context.stroke();
  context.beginPath();
  context.arc(c_x[i],c_y[i],4,0,2*Math.PI);
	context.stroke();
  //Test draw node lines
  for (let nl = 0; nl < c_nodes * 4; nl++) {
  	context.beginPath();
    context.moveTo(c_x[i],c_y[i]);
    var na = 2 * Math.PI / (c_nodes * 4) * nl;
		var nx = c_x[i] + Math.cos(na) * c_radius;
    var ny = c_y[i] + Math.sin(na) * c_radius;
    context.lineTo(nx,ny);
		//context.stroke();
  }
}

// Find edge centers
for (let i = 0; i < c_x.length; i++) {
	j = i + 1;
  if (j == c_x.length) { j = 0; }
  // Draw intercept calculation circle
  context.beginPath();
	//context.arc(c_x[i],c_y[i],e_radius-c_radius,0,2*Math.PI);
	context.stroke();
  // Calculate midpoint of corner centers
  var x_offset = (c_x[i] - c_x[j])/2 + c_x[j];
  var y_offset = (c_y[i] - c_y[j])/2 + c_y[j];
  var a_offset = Math.atan((y_offset - y)/(x_offset - x));
  // Calculate intercept distance
  var d_offset = Math.sqrt(Math.pow(e_radius - c_radius,2) - (Math.pow(c_x[i] - x_offset,2) + Math.pow(c_y[i] - y_offset,2)));
  // Test draw corner center join line
  context.beginPath();
	//context.moveTo(c_x[i],c_y[i]);
  //context.lineTo(c_x[j],c_y[j]);
	context.stroke();
  // Test draw mark at midpoints
  context.beginPath();
	//context.arc(x_offset,y_offset,2,0,2*Math.PI);
	context.stroke();
  // Store edge centers in array
  e_x.push(x_offset - ((Math.abs(Math.cos(a_offset) * d_offset)) * Math.sign(x_offset - x)));
  e_y.push(y_offset - ((Math.abs(Math.sin(a_offset) * d_offset)) * Math.sign(y_offset - y)));
  // Test draw edge circle
  context.strokeStyle = 'lightgray';
  context.beginPath();
	context.arc(e_x[i],e_y[i],e_radius,0,2*Math.PI);
  context.stroke();
  context.beginPath();
  context.arc(e_x[i],e_y[i],4,0,2*Math.PI);
	context.stroke();
}

// Final construction
for (let i = 0; i < c_x.length; i++) {
	h = i - 1;
  j = i + 1;
  if (h < 0) { h = c_x.length - 1; }
  if (j == c_x.length) { j = 0; }
  // Calculate corner start/stop angles
  var c_start = Math.atan((c_y[i] - e_y[h])/(c_x[i] - e_x[h]));
  if (c_x[i] - e_x[h] < 0) { c_start = c_start + Math.PI; }
  var c_stop = Math.atan((c_y[i] - e_y[i])/(c_x[i] - e_x[i]));
  if (c_x[i] - e_x[i] < 0) { c_stop = c_stop + Math.PI; }
  // Draw corner arc
  context.beginPath();
	//context.arc(c_x[i],c_y[i],c_radius,c_start,c_stop);
	context.stroke();
  // Calculate & draw breakpoint marks
 	var b_x = c_x[i] + (Math.cos(c_start) * c_radius);
  var b_y = c_y[i] + (Math.sin(c_start) * c_radius);
  var b_a = Math.atan((b_y - y)/(b_x - x));
  if (b_x - x < 0) { b_a = b_a + Math.PI; }
  context.beginPath();
  context.moveTo(x,y);
  context.lineTo(x + Math.cos(b_a) * 200, y + Math.sin(b_a) * 200);
  if (b_a < 0) { b_a = Math.PI * 2 + b_a; }
  breakpoints.push(b_a);
  b_x = c_x[i] + (Math.cos(c_stop) * c_radius);
  b_y = c_y[i] + (Math.sin(c_stop) * c_radius);
  b_a = Math.atan((b_y - y)/(b_x - x));
  if (b_x - x < 0) { b_a = b_a + Math.PI; }
  context.moveTo(x,y);
  context.lineTo(x + Math.cos(b_a) * 200, y + Math.sin(b_a) * 200);
  if (b_a < 0) { b_a = Math.PI * 2 + b_a; }
  breakpoints.push(b_a);
  //context.stroke();
  // Calculate edge start/stop angles
  var e_start = Math.atan((c_y[i] - e_y[i])/(c_x[i] - e_x[i]));
  if (c_x[i] - e_x[i] < 0) { e_start = e_start + Math.PI; }
  var e_stop = Math.atan((c_y[j] - e_y[i])/(c_x[j] - e_x[i]));
  if (c_x[j] - e_x[i] < 0) { e_stop = e_stop + Math.PI; }
  // Draw edge arc
  context.beginPath();
	//context.arc(e_x[i],e_y[i],e_radius,e_start,e_stop);
	context.stroke();
}

}

function init() {
	my_canvas.width = window.innerWidth;
    my_canvas.height = window.innerHeight;
	beginDraw();
}

function buttonDraw() {
	setVariables();
	init();
}

function buttonStop() {
	path_complete = true;
}

function primeFactors(array,gear,n) {
	if (array[gear] == undefined) {
		array.push([]);
	} else {
		array[gear] = [];
	}
	let c = 2;
	while (n > 1) {
		if (n % c == 0) {
			n /= c;
			array[gear].push(c);
		} else {
			c++;
		}
	}
	return array[gear].join();
}

function beginDraw() {
	////////////////////////////
	// Loop through all gears //
	////////////////////////////
	
	for (let g = 0; g < gearboxes.length; g++) {

		//////////////////////////////////////////////
		// Calculate displacement of corner centers //
		//////////////////////////////////////////////

		// Side length of polygon inscribed in circle (halved)
		side_length = g_radius[g] * Math.sin(Math.PI/c_nodes[g]);
		// Pythagorean theorem to get third side of right triangle
		mid_displace = Math.sqrt(Math.pow(g_radius[g],2) - Math.pow(side_length,2));
		// Pythagoras again to find displacement from corner-corner line
		ec_offset[g] = Math.sqrt(Math.pow(e_radius[g] - c_radius[g],2) - Math.pow(side_length,2)) - mid_displace;

		////////////////////////////////////
		// Calculate segment break angles //
		////////////////////////////////////

		// Trig to find angle of corner arc from edge arc center
		seg_break[g] = Math.PI / c_nodes[g] - Math.asin(side_length / (e_radius[g] - c_radius[g]));

		///////////////////////////////////////
		// Calculate number of teeth on gear //
		///////////////////////////////////////

		// Use calculated angle to find number of teeth on gear
		teeth[g] = Math.round(c_nodes[g] * (seg_break[g] / Math.PI * c_circ[g] + ((2 * Math.PI / c_nodes[g]) - 2 * seg_break[g]) / (2 * Math.PI) * e_circ[g]));

		// Update gearTeeth span with calculated teeth value
		document.getElementById('gearTeeth_'+g).innerHTML = teeth[g];
		document.getElementById('gearFactors_'+g).innerHTML = primeFactors(gearFactors,g,teeth[g]);

		////////////////////////////////////////
		// Calculate and save gear shape path //
		////////////////////////////////////////

		// Set new path into gear shape array
		gear_shapes[g] = new Path2D();

		// Loop through 360 degrees to outline gear
		for (let i = 0; i <= 360; i++) {
			// Convert i degrees to j radians
			j = i * Math.PI / 180;
  
			// Calculate closest segment break using same method
			// as used to find intercept
			var broad_seg = Math.floor(c_nodes[g] / 360 * i);
			var broad_prog = (c_nodes[g] / 360 * i - broad_seg) * (2 * Math.PI / c_nodes[g]);
			var seg = broad_seg;
			if (broad_prog <= seg_break[g]) {
				seg = broad_seg * 2;
			} else if (broad_prog >= (2 * Math.PI / c_nodes[g]) - seg_break[g]) {
				seg = broad_seg * 2 + 2;
			} else {
				seg = broad_seg * 2 + 1;
			}
			var seg_a = Math.PI * 2 / (c_nodes[g] * 2) * seg;
  
			// Calculate rotation center
			var r_x = x;
			var r_y = y;
			if ((seg) % 2 == 0) {
				r_x = Math.cos(seg_a) * g_radius[g];
				r_y = Math.sin(seg_a) * g_radius[g];
				tx = r_x + Math.cos(j) * c_radius[g];
				ty = r_y + Math.sin(j) * c_radius[g];
			} else {
				r_x = Math.cos(seg_a) * (-ec_offset[g]);
				r_y = Math.sin(seg_a) * (-ec_offset[g]);
				tx = r_x + Math.cos(j) * e_radius[g];
				ty = r_y + Math.sin(j) * e_radius[g];
			}
  
			// Add line segment to shape path
			gear_shapes[g].lineTo(tx,ty);		
		}
		
		/////////////////////////////////////////////////
		// If gear has a cutout, calculate cutout path //
		/////////////////////////////////////////////////
		
		if (g < gearboxes.length - 1) {
			
			//////////////////////////////////////////////
			// Calculate displacement of corner centers //
			//////////////////////////////////////////////

			// Side length of polygon inscribed in circle (halved)
			cut_side_length = cut_g_radius[g] * Math.sin(Math.PI/cut_c_nodes[g]);
			// Pythagorean theorem to get third side of right triangle
			cut_mid_displace = Math.sqrt(Math.pow(cut_g_radius[g],2) - Math.pow(cut_side_length,2));
			// Pythagoras again to find displacement from corner-corner line
			cut_ec_offset[g] = Math.sqrt(Math.pow(cut_e_radius[g] - cut_c_radius[g],2) - Math.pow(cut_side_length,2)) - cut_mid_displace;

		////////////////////////////////////
		// Calculate segment break angles //
		////////////////////////////////////

		// Trig to find angle of corner arc from edge arc center
		cut_seg_break[g] = Math.PI / cut_c_nodes[g] - Math.asin(cut_side_length / (cut_e_radius[g] - cut_c_radius[g]));

		///////////////////////////////////////
		// Calculate number of teeth on gear //
		///////////////////////////////////////

		// Use calculated angle to find number of teeth on gear
		cut_teeth[g] = Math.round(cut_c_nodes[g] * (cut_seg_break[g] / Math.PI * cut_c_circ[g] + ((2 * Math.PI / cut_c_nodes[g]) - 2 * cut_seg_break[g]) / (2 * Math.PI) * cut_e_circ[g]));

		// Update gearTeeth span with calculated teeth value
		document.getElementById('cut_gearTeeth_'+g).innerHTML = cut_teeth[g];
		document.getElementById('cutFactors_'+g).innerHTML = primeFactors(cutFactors,g,cut_teeth[g]);

		////////////////////////////////////////
		// Calculate and save gear shape path //
		////////////////////////////////////////

		// Set new path into gear shape array
		cutout_shapes[g] = new Path2D();

		// Loop through 360 degrees to outline gear
		for (let i = 0; i <= 360; i++) {
			// Convert i degrees to j radians
			j = i * Math.PI / 180;
  
			// Calculate closest segment break using same method
			// as used to find intercept
			var broad_seg = Math.floor(cut_c_nodes[g] / 360 * i);
			var broad_prog = (cut_c_nodes[g] / 360 * i - broad_seg) * (2 * Math.PI / cut_c_nodes[g]);
			var seg = broad_seg;
			if (broad_prog <= cut_seg_break[g]) {
				seg = broad_seg * 2;
			} else if (broad_prog >= (2 * Math.PI / cut_c_nodes[g]) - cut_seg_break[g]) {
				seg = broad_seg * 2 + 2;
			} else {
				seg = broad_seg * 2 + 1;
			}
			var seg_a = Math.PI * 2 / (cut_c_nodes[g] * 2) * seg;
  
			// Calculate rotation center
			var r_x = x;
			var r_y = y;
			if ((seg) % 2 == 0) {
				r_x = Math.cos(seg_a) * cut_g_radius[g];
				r_y = Math.sin(seg_a) * cut_g_radius[g];
				tx = r_x + Math.cos(j) * cut_c_radius[g];
				ty = r_y + Math.sin(j) * cut_c_radius[g];
			} else {
				r_x = Math.cos(seg_a) * (-cut_ec_offset[g]);
				r_y = Math.sin(seg_a) * (-cut_ec_offset[g]);
				tx = r_x + Math.cos(j) * cut_e_radius[g];
				ty = r_y + Math.sin(j) * cut_e_radius[g];
			}
  
			// Add line segment to shape path
			cutout_shapes[g].lineTo(tx,ty);		
		}
		}	
	}

window.requestAnimationFrame(loopDraw);
}

function loopDraw() {

//////////////////////////////////
// Clear canvas for new drawing //
//////////////////////////////////

	// Reset canvas transform
	context.setTransform(1,0,0,1,x,y);

	// Clear rectangle full height and width of canvas	
	context.clearRect(-my_canvas.width/2,-my_canvas.height/2,my_canvas.width,my_canvas.height);

////////////////////////////
// Loop through all gears //
////////////////////////////

	// Save canvas transformation state first
	context.save();

	for (let g = 0; g < gearboxes.length; g++) {
	
	////////////////////////////////////////////////////////////////
	// If gear is not first stationary hoop, apply transformation //
	////////////////////////////////////////////////////////////////

		if (g > 0) {

		//////////////////////////////////////////////////
		// Calculate closest segment break to intercept //
		//////////////////////////////////////////////////
	
			var rotseg = 0;
			var seg_prog = 0;
			var seg_angle = 0;
			var intercept_x = 0;
			var intercept_y = 0;
			var rot_x = 0;
			var rot_y = 0;
			
			// Intercept progress around circumference
			// Proportion of rotation by tooth count, modified by gear ratio
			var mod_rotate = rotate;
			for (let k = g; k > 1; k--) {
				mod_rotate = mod_rotate * cut_teeth[k-2] / teeth[k-1];
			}
			var circ_prog = mod_rotate / (Math.PI * 2) * teeth[g] * (cut_teeth[g-1] / teeth[g]);
			
			// Number of teeth on each 'side' of gear
			var seg_circ = teeth[g]/c_nodes[g];
		
			// Calculate which 'side' intercept lies on
			var side_seg = Math.floor(circ_prog / seg_circ);
		
			// Calculate how far along current side the intercept lies
			var side_prog = circ_prog - (seg_circ * side_seg);
		
			// Calculate number of teeth on each corner/edge arc
			var c_seg = c_circ[g] * (seg_break[g] / Math.PI);
			var e_seg = seg_circ - c_seg;
		
			// Determine whether intercept lies on corner or edge
			if (side_prog - (c_seg/2) <= 0) {
				rotseg = 2 * side_seg;
				seg_prog = side_prog;
			} else if (side_prog - (c_seg/2) - e_seg <= 0) {
				rotseg = 2 * side_seg + 1;
				seg_prog = side_prog - (c_seg/2);
			} else {
				rotseg = 2 * side_seg + 2;
				seg_prog = -(seg_circ - side_prog);
			}
			
			// Calculate angle to center of rotation
			var rotseg_a = (Math.PI * 2) / (c_nodes[g] * 2) * rotseg;
					
			if(rotseg % 2 == 0) {
				seg_angle = (2*rotseg) * (Math.PI / (2*c_nodes[g]));
				seg_angle = seg_angle + ((seg_prog / c_seg) * (2 * seg_break[g]));
				rot_x = Math.cos(rotseg_a) * g_radius[g];
				rot_y = Math.sin(rotseg_a) * g_radius[g];
				intercept_x = rot_x + Math.cos(seg_angle) * c_radius[g];
				intercept_y = rot_y + Math.sin(seg_angle) * c_radius[g];
			} else {
				seg_angle = (2*(rotseg-1)) * (Math.PI / (2*c_nodes[g])) + seg_break[g];
				seg_angle = seg_angle + ((seg_prog / e_seg) * (2 * Math.PI / c_nodes[g] - 2*seg_break[g]));
				rot_x = Math.cos(rotseg_a) * -ec_offset[g];
				rot_y = Math.sin(rotseg_a) * -ec_offset[g];
				intercept_x = rot_x + Math.cos(seg_angle) * e_radius[g];
				intercept_y = rot_y + Math.sin(seg_angle) * e_radius[g];
			}
			
			var x_focus = (Math.cos(mod_rotate)*(cut_teeth[g-1]/2*Math.PI));
			var y_focus = (Math.sin(mod_rotate)*(cut_teeth[g-1]/2*Math.PI));
			var x_displace = x_focus - intercept_x;
			var	y_displace = y_focus - intercept_y;
			var mod_dangle = Math.atan(y_displace/x_displace);
			if (x_displace < 0) { mod_dangle = mod_dangle + Math.PI; }
			var mod_displace = Math.hypot(x_displace, y_displace);			
		}
	
	//////////////////////////////////////////
	// Draw gear shape from intercept point //
	//////////////////////////////////////////

		// Translate canvas to intercept point
		context.translate(intercept_x, intercept_y);

		// Rotate shape around new origin and translate to origin
		context.rotate(mod_rotate-seg_angle);
		context.translate(-intercept_x, -intercept_y);
		
		// Translate shape to focus point after inverting rotation of context
		context.translate(Math.cos(mod_dangle - (mod_rotate-seg_angle)) * mod_displace,Math.sin(mod_dangle - (mod_rotate-seg_angle)) * mod_displace);
	
		// Draw shape at displacement coordinates
		context.lineWidth = 2;
		context.strokeStyle = 'blue';
		context.stroke(gear_shapes[g]);
		context.fillStyle = "rgba(0, 0, 255, 0.5)";
		context.fill(gear_shapes[g]);
		
		// If cutout path exists, change compositing mode to clear gear section
		// Then restore compositing to default and stroke cutout
		if (cutout_shapes[g] !== undefined) {
			context.translate(cut_offset_x[g],cut_offset_y[g]);
			context.globalCompositeOperation = 'destination-out';
			context.fillStyle = "rgba(0, 0, 255, 1)";
			context.fill(cutout_shapes[g]);
			context.globalCompositeOperation = 'source-over';
			context.stroke(cutout_shapes[g]);
		}
	}
	
////////////////////////////////////////////////////
// Add new trace point based on gear calculations //
////////////////////////////////////////////////////
	
	// Save current tranformation matrix
	let matrix = context.getTransform();
	
	// Restore canvas to saved state
	context.restore();
	
	// Calculate location of trace point relative to origin
	tpen_x = p_offset_x;
	tpen_y = p_offset_y;
	
	// Transform trace point coordinates through saved matrix
	const point = {x: tpen_x, y: tpen_y};
	const tpen_matrix = {
		x: matrix.a * point.x + matrix.c * point.y + matrix.e - x,
		y: matrix.b * point.x + matrix.d * point.y + matrix.f - y,
	};
	
	// Add transformed coordinate to trace path
	trace.lineTo(tpen_matrix.x,tpen_matrix.y);
	
	// Save pen coordinates if beginning new trace
	if (rotate == 0) {
		path_start_x = tpen_matrix.x;
		path_start_y = tpen_matrix.y;
	}

/////////////////////////////////////
// Draw recorded trace line in red //
/////////////////////////////////////

	context.strokeStyle = 'red';
	context.stroke(trace);

///////////////////////////
// Draw trace pen marker //
///////////////////////////
	
	context.beginPath();
	context.arc(tpen_matrix.x,tpen_matrix.y, 2, 0, 2*Math.PI, false);
	context.fillStyle = 'red';
	context.fill();
	context.closePath();
	
///////////////////////////////
// Increment rotate variable //
///////////////////////////////

	rotate = rotate + Math.PI / 720;

////////////////////////////////////////
// Populate dubug monitor if required //
////////////////////////////////////////

	context.fillText(debug_txt,-300,-300);

////////////////////////////////////////////////
// Check for trace path closure within 0.01px //
////////////////////////////////////////////////

	if (Math.abs(tpen_matrix.x - path_start_x) <= 0.01 && Math.abs(tpen_matrix.y - path_start_y) <= 0.01 && rotate > Math.PI) { path_complete = true; }

//////////////////////////////////////////////////////
// Loop drawing function if trace line remains open //
//////////////////////////////////////////////////////

	sp_count++;
	if (!path_complete && sp_count >= resolution) {
		sp_count = 0;
		window.requestAnimationFrame(loopDraw);
	} else if (!path_complete && sp_count < resolution) {
		loopDraw();
	}
}

let inputs = document.querySelectorAll('input');
inputs.forEach(el => el.addEventListener('change', redraw));
inputs = document.querySelectorAll('input[type="range"]');
inputs.forEach(el => el.addEventListener('input', redraw));
document.getElementById('drawButton').addEventListener('click', buttonDraw);
document.getElementById('stopButton').addEventListener('click', buttonStop);
document.getElementById('gearButton').addEventListener('click', addGear);

setVariables();
path_complete = true;
init();
