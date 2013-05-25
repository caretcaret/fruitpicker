(function(){
var harvest = d3.select('#harvest svg');
// hack to get the dynamic dimensions of the svg
var harvest_rect = harvest[0][0].getBoundingClientRect();
var harvest_w = harvest_rect.width;
var harvest_h = harvest_rect.height;
var constructor = d3.select('#picker svg');

function rand(min, max) {
  return (Math.random() * (max - min)) + min;
}

function random_color() {
  // We want to randomize the just the hue for now
  var h = rand(0, 360);
  return d3.hsl(h, 0.5, 0.5);
}

/* The distinction between data and visual presentation
 * is made through the naming of the objects:
 **************
 * Data components use the technical terms:
 * Data text that the user inputs is called the "source".
 * By using the "controls", the user encapsulates the data
 * into "vertices" and "edges". Each vertex and edge consists
 * of a (possibly empty) list of "attributes"; the first one
 * is the "title" and may be empty. A "group" groups similar
 * vertices and provides a common interface for the attributes.
 * Names for each attribute is the "property". The whole of the
 * processed data is the "graph".
 **************
 * Visual components are described metaphorically:
 * source -> farm
 * controls -> picker
 * vertices -> fruits
 * edges -> vines
 * attributes -> tag
 * property -> label
 * group -> basket
 * graph -> harvest
 */

function Graph(vertices, edges, groups, selection) {
  if (typeof(vertices) === 'undefined')
    vertices = [];
  if (typeof(edges) === 'undefined')
    edges = [];
  if (typeof(groups) === 'undefined')
    groups = [];
  if (typeof(selection) === 'undefined')
    selection = [];
  this.vertices = vertices;
  this.edges = edges;
  this.groups = groups;
  this.selection = selection;
}

/* TODO: integrate source data model with source selections */
function Source() {}
function Attribute() {}

function Vertex(attributes, color) {
  if (typeof(attributes) === 'undefined')
    // maintain the invariant that attributes[0]
    // will always be the title
    attributes = [""];
  if (typeof(color) === 'undefined') {
    // set random color
    color = random_color();
  }
  this.attributes = attributes;
  this.color = color;
}

function Edge(from, to, bidirectional) {
  if (typeof(bidirectional) === 'undefined')
    bidirectional = true;
  this.from = from;
  this.to = to;
  this.bidirectional = bidirectional;
}

function Group(vertices, labels) {
  if (typeof(vertices) === 'undefined')
    vertices = [];
  if (typeof(labels) === 'undefined')
    labels = [];
  this.vertices = vertices;
  this.labels = labels;
}

function showVertex(vertex) {
  // TODO: Set picker viewer to display title/attributes of the
  // selected vertex
}

var G = new Graph();

var force = d3.layout.force()
  .size([harvest_w, harvest_h])
  .nodes(G.vertices)
  .links(G.edges)
  .charge(-50)
  .on('tick', tick);

var fruits = harvest.selectAll('.fruit');
var vines = harvest.selectAll('.vine');

force.start();

function tick() {
  vines.attr('x1', function(d) { return d.source.x; })
    .attr('y1', function(d) { return d.source.y; })
    .attr('x2', function(d) { return d.target.x; })
    .attr('y2', function(d) { return d.target.y; });

  fruits.attr('cx', function(d) { return d.x; })
    .attr('cy', function(d) { return d.y; });
}

// when user clicks the vertex button
function addVertex(attribute, color) {
  if (typeof(attribute) === 'undefined')
    attribute = "";
  // create vertex and add it to the graph/harvest
  var v = new Vertex([attribute], color);
  force.nodes().push(v);
  fruits = fruits.data(force.nodes());

  // add the corresponding circle
  fruits.enter().insert('circle')
    .attr('class', 'fruit')
    .attr('r', 7.5)
    .attr('fill', function(d) { return d3.hsl(d.color).toString(); })
    .attr('stroke', '#ffffff')
    .attr('stroke-width', 2)
    .call(force.drag);

  force.start();

  return v;
}

// TODO: vertex should be selected for editing
d3.select('#btn_vertex')
  .on('mouseup', function(e) {
    var v = addVertex();
    showVertex(v);
  });

// set the caret inside the farm on page load
document.getElementById('farm').focus();

// on resize, recalculate dimensions of the harvest
window.onresize = function() {
  var rect = harvest[0][0].getBoundingClientRect();
  harvest_w = rect.width;
  harvest_h = rect.height;
  force.size([harvest_w, harvest_h])
    .start();
};

})();