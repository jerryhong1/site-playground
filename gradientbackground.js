
var c = document.getElementById('canv');
var $ = c.getContext('2d');


var col = function(x, y, h, s, l) {
  // $.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
  $.fillStyle = "hsl(" + h + "," + s + "," + l + ")";
  $.fillRect(x, y, 1,1);
}
var R = function(x, y, t) {
  return( Math.abs(100 + 200*Math.sin( (x*x*Math.cos(t/40)+y*y*Math.sin(t/30))/300 )) );
}

var G = function(x, y, t) {
  return( Math.ceil(50 + 64*Math.sin( (x*x*Math.cos(t/40)+y*y*Math.sin(t/30))/300 ) ) );
}

var B = function(x, y, t) {
  return( Math.ceil(50 + 64*Math.sin( 5*Math.sin(t/90) + ((x-100)*(x-100)+(y-100)*(y-100))/1100) ));
}

var t = 0;

var run = function() {
  for(x=0;x<=35;x++) {
    for(y=0;y<=35;y++) {
      col(x, y, R(x,y,t), "25%", "85%");
    }
  }
  t = t + 0.120;
  window.requestAnimationFrame(run);
}

run();





