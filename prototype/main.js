(function(){
var graph = d3.select('#graph');
var construction = d3.select('#construction');

/* vertex construction interface */
function new_vertex() {
  var x = 87.5;
  var y = 80;
  construction.append('circle')
    .attr('cx', x)
    .attr('cy', y)
    .attr('r', 75)
    .attr('fill', '#7fbc41')
    .attr('stroke', '#4d9221')
    .attr('stroke-width', 2);
  construction.append('text')
    .attr('x', x)
    .attr('y', y)
    .attr('fill', '#ffffff')
    .attr('font-size', '144px')
    .attr('style', 'text-anchor: middle; dominant-baseline: central;')
    .text('+');
}

d3.select('#btn_vertex')
  .on('click', new_vertex);

/* vertex examples */
graph.selectAll('circle')
  .data([20, 50, 120])
  .enter().append('circle')
  .attr('cy', 90)
  .attr('cx', String)
  .attr('r', 10)
  .attr('fill', '#7fbc41')
  .attr('stroke', '#4d9221')
  .attr('stroke-width', 2);
})();