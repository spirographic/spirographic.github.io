var my_canvas = document.getElementById('canvas'),
    context = my_canvas.getContext("2d");

var c_nodes = 3;
var c_circ = 10
var c_radius = c_circ / 2*Math.PI;
var e_circ = 80
var e_radius = e_circ / 2*Math.PI;
var g_radius = c_radius / Math.cos(Math.PI / (c_nodes * 2));
var teeth = 12345;
var b_radius = 0;

var p_offset_x = 15;
var p_offset_y = 0;

var h_circ = 96;
var h_radius = h_circ / 2*Math.PI;
var o_radius = 240;
var p_radius = 20;
var eff_radius = 0;
var eff_x = 0;
var eff_y = 0;

var rotate = Math.PI / 180 * 0;
var orbit = 0;

var h = 0;
var i = 0;
var j = 0;
const c_x = [];
const c_y = [];
const e_x = [];
const e_y = [];

const breakpoints = [];

var x = 250;
var y = 200;

var tx = 0;
var ty = 0;

var debug_txt = '';

function init() {

// Set calculation stroke color to gray
context.strokeStyle = 'black';

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
  if (b_radius == 0) { b_radius = Math.hypot(b_x - x, b_y - y); }
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
window.requestAnimationFrame(draw);
}

function trig(s1,s2,a) {
	return Math.sqrt(Math.pow(s1,2) + Math.pow(s2,2) - 2 * s1 * s2 * Math.cos(a));
}

let trace = new Path2D();
var tpen_x = x;
var tpen_y = y;

var path_complete = false;
var path_start_x = 0;
var path_start_y = 0;

function draw() {
i = 0;
j = 0;

var sx = 0;
var sy = 0;
var dx = 0;
var dy = 0;
var da = 0;

var resolution = 1;

var k = 0;
var b_count = 1;
var bb_count = 0;

var ixd = 0;
var iyd = 0;

context.clearRect(0,0,800,800);

//////////////////////////////////////////////
// Calculate displacement of corner centers //
//////////////////////////////////////////////

// Side length of polygon inscribed in circle (halved)
var side_length = g_radius * Math.sin(Math.PI/c_nodes);
// Pythagorean theorem to get third side of right triangle
var mid_displace = Math.sqrt(Math.pow(g_radius,2) - Math.pow(side_length,2));
// Pythagoras again to find displacement from corner-corner line
var ec_offset = Math.sqrt(Math.pow(e_radius - c_radius,2) - Math.pow(side_length,2)) - mid_displace;

////////////////////////////////////
// Calculate segment break angles //
////////////////////////////////////

// Trig to find angle of corner arc from edge arc center
var seg_break = Math.PI / c_nodes - Math.asin(side_length / (e_radius - c_radius));

// Use calculated angle to find number of teeth on gear
teeth = Math.round(c_nodes * (seg_break / Math.PI * c_circ + ((2 * Math.PI / c_nodes) - 2 * seg_break) / (2 * Math.PI) * e_circ));

debug_txt = teeth;

// Calculate closest segment break to rotation displacement

var circ_prog = rotate / (Math.PI * 2) * teeth * (h_circ / teeth);
var seg_circ = teeth/c_nodes;
var side_seg = Math.floor(circ_prog / seg_circ);
var side_prog = circ_prog - (seg_circ * side_seg);
var rotseg = 0;
var seg_prog = 0;
var seg_angle = 0;
var tooth_ratio = teeth / (c_circ + e_circ);
var c_seg = c_circ * tooth_ratio * (2 * seg_break / Math.PI);
var e_seg = seg_circ - c_seg;
if (side_prog - (c_seg/2) <= 0) {
	rotseg = 2 * side_seg;
  seg_prog = side_prog;
} else if (side_prog - (c_seg/2) - e_seg <= 0)
{
	rotseg = 2 * side_seg + 1;
  seg_prog = side_prog - (c_seg/2);
} else {
	rotseg = 2 * side_seg + 2;
  seg_prog = -(seg_circ - side_prog);
}

var rotseg_a = (Math.PI * 2) / (c_nodes * 2) * rotseg;
var intercept_x = 0;
var intercept_y = 0;
var rot_x = 0;
var rot_y = 0;
var rot_angle = 0;
var invert_angle = 0;
var tinvert_angle = 0;

if(rotseg % 2 == 0) {
	eff_radius = c_radius;
  seg_angle = (2*rotseg) * (Math.PI / (2*c_nodes));
  seg_angle = seg_angle + ((seg_prog / c_seg) * (2 * seg_break));
  context.beginPath();
	context.moveTo(x,y);
	rot_x = x + Math.cos(rotseg_a) * g_radius;
	rot_y = y + Math.sin(rotseg_a) * g_radius;
	context.lineTo(rot_x,rot_y);
	intercept_x = rot_x + Math.cos(seg_angle) * c_radius;
	intercept_y = rot_y + Math.sin(seg_angle) * c_radius;
	context.lineTo(intercept_x,intercept_y);
  rot_angle = (Math.PI - rotseg_a) + (2*rotate);
  invert_angle = Math.asin(Math.sin(rot_angle) / Math.hypot(intercept_x-x,intercept_y-y) * g_radius);
  tinvert_angle = 2*rotate - Math.PI + invert_angle;
  //context.lineTo(intercept_x + Math.cos(tinvert_angle) * 80,intercept_y + Math.sin(tinvert_angle) * 80);
  //debug_txt = 'Corner intercept ' + seg_break / Math.PI * 180 + ' - ' + rotate / (2* Math.PI) * teeth;
} else {
	eff_radius = e_radius;
  seg_angle = (2*(rotseg-1)) * (Math.PI / (2*c_nodes)) + seg_break;
  seg_angle = seg_angle + ((seg_prog / e_seg) * (2 * Math.PI / c_nodes - 2*seg_break));
  context.beginPath();
	context.moveTo(x,y);
	rot_x = x + Math.cos(rotseg_a) * -ec_offset;
	rot_y = y + Math.sin(rotseg_a) * -ec_offset;
	context.lineTo(rot_x,rot_y);
	intercept_x = rot_x + Math.cos(seg_angle) * e_radius;
	intercept_y = rot_y + Math.sin(seg_angle) * e_radius;
	context.lineTo(intercept_x,intercept_y);
  rot_angle = rotseg_a - 2*rotate;
  invert_angle = Math.asin(Math.sin(rot_angle) / Math.hypot(intercept_x-x,intercept_y-y) * g_radius);
  tinvert_angle = 2*rotate - Math.PI - invert_angle;
  //context.lineTo(intercept_x + Math.cos(tinvert_angle) * 80,intercept_y + Math.sin(tinvert_angle) * 80);
  //debug_txt = 'Edge intercept ' + seg_break / Math.PI * 180 + ' - ' + rotate / (2* Math.PI) * teeth;
}
context.stroke();

var edge_displace = Math.hypot(intercept_x - x, intercept_y - y);

var x_displace = x + (Math.cos(rotate)*h_radius - intercept_x);
var y_displace = y + (Math.sin(rotate)*h_radius - intercept_y);
var x_focus = x + (Math.cos(rotate)*h_radius);
var y_focus = y + (Math.sin(rotate)*h_radius);

tpen_x = x + p_offset_x;
tpen_y = y + p_offset_y;
tpen_x = tpen_x + x_displace;
tpen_y = tpen_y + y_displace;
var rot_pen = Math.atan((y_focus - tpen_y)/(x_focus - tpen_x));
if (x_focus - tpen_x < 0) { rot_pen = rot_pen + Math.PI; }
var disp_pen = Math.hypot(x_focus - tpen_x, y_focus - tpen_y);
tpen_x = x_focus - Math.cos(rot_pen + rotate - seg_angle) * disp_pen;
tpen_y = y_focus - Math.sin(rot_pen + rotate - seg_angle) * disp_pen;

trace.lineTo(tpen_x,tpen_y);

if (rotate == 0) {
	path_start_x = tpen_x;
  path_start_y = tpen_y;
}

for (let i = 0; i <= 180; i++) {
	context.beginPath();
  context.lineWidth = 1;
  context.strokeStyle = 'blue';
  
  // If drawing already begun, initialise line at previous coordinates
  if(i > 0) { context.moveTo(tx,ty); }
  
  // Convert i degrees to j radians
  j = i * 2 * Math.PI / 180;
  
  // Calculate closest segment break
  var broad_seg = Math.floor(c_nodes / 180 * i);
  var broad_prog = (c_nodes / 180 * i - broad_seg) * (2 * Math.PI / c_nodes);
  var seg = broad_seg;
  if (broad_prog <= seg_break) {
  	seg = broad_seg * 2;
  } else if (broad_prog >= (2 * Math.PI / c_nodes) - seg_break) {
  	seg = broad_seg * 2 + 2;
  } else {
  	seg = broad_seg * 2 + 1;
  }
  var seg_a = Math.PI * 2 / (c_nodes * 2) * seg;
  
  // Calculate rotation center
  var r_x = x;
  var r_y = y;
  if ((seg) % 2 == 0) {
  	r_x = x + Math.cos(seg_a) * g_radius;
  	r_y = y + Math.sin(seg_a) * g_radius;
  	tx = r_x + Math.cos(j) * c_radius;
  	ty = r_y + Math.sin(j) * c_radius;
   } else {
   	r_x = x + Math.cos(seg_a) * (-ec_offset);
  	r_y = y + Math.sin(seg_a) * (-ec_offset);
  	tx = r_x + Math.cos(j) * e_radius;
  	ty = r_y + Math.sin(j) * e_radius;
   }
    
   // Add displacement around hoop circumference
   tx = tx + x_displace;
   ty = ty + y_displace;
   
   // Add shape rotation
   var rot_draw = Math.atan((y_focus - ty)/(x_focus - tx));
   if (x_focus - tx < 0) { rot_draw = rot_draw + Math.PI; }
   var disp_draw = Math.hypot(x_focus - tx, y_focus - ty);
   tx = x_focus - Math.cos(rot_draw + rotate - seg_angle) * disp_draw;
   ty = y_focus - Math.sin(rot_draw + rotate - seg_angle) * disp_draw;
  
  // Draw line segment
  context.lineTo(tx,ty);
  context.stroke();
}

context.beginPath();
context.strokeStyle = 'lightgrey';
context.arc(x,y,h_radius,0,2*Math.PI);
context.stroke();

context.strokeStyle = 'red';
context.stroke(trace);

context.beginPath();
context.moveTo(x,y);
context.lineTo(x_focus,y_focus);
//context.stroke();

rotate = rotate + Math.PI / 180 * resolution;
orbit = orbit + Math.PI / 180 / g_radius * h_radius * resolution;
if (orbit >= 2 * Math.PI) {
	orbit = orbit - 2 * Math.PI;
}

context.fillText(debug_txt,10,10);

if (Math.abs(tpen_x - path_start_x) <= 0.01 && Math.abs(tpen_y - path_start_y) <= 0.01 && rotate > Math.PI / c_nodes) { path_complete = true; }

if (!path_complete) { window.requestAnimationFrame(draw); }
}

init();