(function(){
var harvest = d3.select('#harvest svg');
var constructor = d3.select('#picker svg');

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
 * Names for each attribute is the "label". The whole of the
 * processed data is the "graph".
 **************
 * Visual components are described metaphorically:
 * source -> farm
 * controls -> picker
 * vertices -> fruits
 * edges -> vines
 * attributes -> tag
 * label -> property
 * group -> basket
 * graph -> harvest
 */

function Graph(vertices, edges, groups) {
  if (typeof(vertices) === undefined)
    vertices = [];
  if (typeof(edges) === undefined)
    edges = [];
  if (typeof(groups) === undefined)
    groups = [];
  this.vertices = vertices;
  this.edges = edges;
  this.groups = groups;
}

/* TODO: integrate source data model with selections */
function Source() {}
function Attribute() {}

function Vertex(attributes, color) {
  if (typeof(attributes) === undefined)
    attributes = [""];
  if (typeof(color) === undefined) {
    // TODO: set random color
  }
  this.attributes = attributes;
  this.color = color;
}

function Edge(from, to, bidirectional) {
  if (typeof(bidirectional) === undefined)
    bidirectional = true;
  this.from = from;
  this.to = to;
  this.bidirectional = bidirectional;
}

function Group(vertices, labels) {
  if (typeof(vertices) === undefined)
    vertices = [];
  if (typeof(labels) === undefined)
    labels = [];
  this.vertices = vertices;
  this.labels = labels;
}

/* TODO: integrate fruits with d3 force model */
function Fruit() {}
function Vine() {}
function Basket() {}

function showVertex(vertex) {
  // TODO: Set picker viewer to display title/attributes of the
  // selected vertex
}
