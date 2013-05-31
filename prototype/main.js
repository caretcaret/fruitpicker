(function(){

function rand(min, max) {
  return (Math.random() * (max - min)) + min;
}

function random_color() {
  // We want to randomize just the hue for now
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

function State(json) {
  if (typeof(json) === 'undefined') {
    this.init();
  } else {
    // load a new state from the saved state json
    this.load(json);
  }
  this.setupUI();
}

State.prototype = {
  init: function() {
    this.vertices = [];
    this.edges = [];
    this.groups = [];
    this.selection = [];
  },
  loadData: function(json) {
    try {
      var obj = JSON.parse(json);
      this.vertices = obj.vertices;
      this.edges = obj.vertices;
      this.groups = [];
      this.selection = [];
    } catch(e) {
      console.log(e);
      // fall back to loading new page
      this.init();
    }
  },
  setupUI: function() {
    var state = this;
    this.farm = d3.select('#farm');
    this.harvest = d3.select('#harvest svg');
    this.fruit_picker = d3.select('#fruit_picker');
    this.vine_picker = d3.select('#vine_picker');
    this.basket_picker = d3.select('#basket_picker');
    this.fruits = harvest.selectAll('.fruit');
    this.vines = harvest.selectAll('.vine');

    this.force = d3.layout.force()
      .size(this.getHarvestDimensions())
      .nodes(this.vertices)
      .links(this.edges)
      .charge(-50)
      .on('tick', function() {
        state.tick();
      });

    d3.select('#btn_vertex')
      .on('mouseup', function(e) {
        var sel = rangy.getSelection();
        var attr = new Attribute(sel);
        var v = state.addVertex(attr);
        state.selectVertex(v);
      });

    d3.select('#btn_edge')
      .on('mouseup', function(e) {
        var e = new Edge();
        state.selectEdge(e);
      });
  },
  start: function() {
    var state = this;
    this.force.start();
    document.getElementById('farm').focus();
    window.onresize = function() {
      state.resize();
    };
  },
  selectVertex: function(vertex) {
    // generate strings to display in the picker
    var toShow = vertex.attributes.map(function(attr) {
      if (attr.text === "")
        return "+";
      return attr.text;
    });
    // deselect others from picker
    this.vine_picker.style('display', 'none');
    this.basket_picker.style('display', 'none');
    this.fruit_picker.style('display', 'inherit');

    // remove other fruits
    this.fruit_picker.selectAll('button').remove();

    // colors
    var orig = vertex.color.toString();
    var brighter = vertex.color.brighter(0.6).toString();
    var darker = vertex.color.darker(0.6).toString();
    var gradient = 'linear-gradient(' + brighter + ',' + orig + ')';

    // deselect other vertices and select this one
    this.selection = [vertex];
    this.fruits.attr('stroke', function(d) {
      if (state.selection.indexOf(d) === -1)
        return '#ffffff';
      return darker;
    });

    var onClickAttribute = function(d, i) {
      // if user clicked an attribute, update it with the new selection
      var sel = rangy.getSelection();
      var attr = new Attribute(sel);
      // if selection is empty, scroll source to prior selection
      if (attr.text === "") {
        // TODO
      } else {
        vertex.updateAttribute(i, attr);
        state.selectVertex(vertex);
      }
    };

    // add each attribute
    this.fruit_picker.selectAll('button')
      .data(toShow)
      .enter().insert('button')
      .text(function(d) { return d; })
      .attr('style', 'background:' + gradient + '; background: -webkit-' + gradient + ';')
      // support both vendor prefixes
      .style('border', '1px solid ' + darker)
      .on('mouseup', onClickAttribute);

    // add 'add attribute' button
    this.fruit_picker.insert('button')
      .text('+')
      .attr('style', 'background:' + gradient + '; background: -webkit-' + gradient + ';')
      .style('border', '1px solid ' + darker)
      .style('border-bottom-left-radius', '5px')
      .style('border-bottom-right-radius', '5px')
      // add new attribute on click
      .on('mouseup', function(d) { onClickAttribute(d, -1); });

    // TODO: hover styles
  },
  addVertex: function(title, color) {
    var state = this;
    if (typeof(title) === 'undefined')
      title = new Attribute();
    // create vertex and add it to the graph/harvest
    var v = new Vertex([title], color);
    this.vertices.push(v);
    
    this.fruits = this.fruits.data(this.vertices);
    this.fruits.enter().insert('circle')
      .classed('fruit', true)
      .attr('r', 7.5)
      .attr('fill', function(d) { return d3.hsl(d.color).toString(); })
      .attr('stroke-width', 2)
      .call(this.force.drag)
      .on('mouseup', function(d) {
        state.selectVertex(d);
      });

    this.force.start();

    return v;
  },
  selectEdge: function(edge) {
    // picker for edges requires 2 buttons for each vertex and
    // a toggle button for the directionality.
    // first, remove everything in the picker
    this.fruit_picker.style('display', 'none');
    this.basket_picker.style('display', 'none');

    // select this edge
    this.vine_picker.style('display', 'inherit');
    this.selection = [edge];

    // remove other edge
    this.vine_picker.selectAll('button').remove();

    // add edge picker ui
    this.vine_picker.append('button')
      .text(function(d) {
        if (typeof(edge.from) === 'undefined')
          return "+";
        return edge.from.attributes[0].text;
      });
    this.vine_picker.append('button')
      .text(function(d) {
        if (edge.bidirectional)
          return '\u2194'; // horizontal double arrow
        return '\u2192'; // right arrow
      });
    this.vine_picker.append('button')
      .text(function(d) {
        if (typeof(edge.to) === 'undefined')
          return "+";
        return edge.to.attributes[0].text;
      });
  },
  addEdge: function() {
    var e = new Edge(from, to, bidirectional);
    this.edges.push(e);
    return e;
  },
  tick: function() {
    this.vines.attr('x1', function(d) { return d.source.x; })
      .attr('y1', function(d) { return d.source.y; })
      .attr('x2', function(d) { return d.target.x; })
      .attr('y2', function(d) { return d.target.y; });

    this.fruits.attr('cx', function(d) { return d.x; })
      .attr('cy', function(d) { return d.y; });
  },
  getHarvestDimensions: function() {
    var rect = document.getElementById('harvest').getBoundingClientRect();
    return [rect.width, rect.height];
  },
  resize: function() {
    this.force.size(this.getHarvestDimensions())
      .start();
  }
};

/* TODO: integrate source data model with source selections */
function Attribute(selection) {
  // range can be undefined
  this.selection = selection;
  if (typeof(selection) === 'undefined')
    this.text = "";
  else
    this.text = selection.toString();
}

function Vertex(attributes, color) {
  if (typeof(attributes) === 'undefined')
    // maintain the invariant that attributes[0]
    // will always be the title
    attributes = [new Attribute()];
  if (typeof(color) === 'undefined') {
    // set random color
    color = random_color();
  }
  this.attributes = attributes;
  this.color = color;
  this.selected = false;
}

Vertex.prototype.updateAttribute = function(index, attr) {
  if (typeof(attr) === 'undefined' || attr.text === "")
    return false;
  // if attr already exists, just update it
  if (0 <= index && index < this.attributes.length)
      this.attributes[index] = attr;
  // otherwise add a new attribute
  else
    this.attributes.push(attr);
  return true;
};

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

var state = new State();
state.start();

})();