from flask import Flask, render_template, jsonify
from graph import random_graph, random_connected_graph, graph_to_dict, d3_format, export_json

app = Flask(__name__)


@app.route('/forcetree')
def get_force_tree():
    G = random_graph(15)
    graph_dict = graph_to_dict(G)
    d3_graph_dict = d3_format(graph_dict)
    export_json(d3_graph_dict)
    return render_template("force-tree.html")


@app.route('/forcezoompan')
def get_force_zoom_pan():
    G = random_connected_graph(15)
    graph_dict = graph_to_dict(G)
    d3_graph_dict = d3_format(graph_dict)
    export_json(d3_graph_dict)
    return render_template("force-zoom-pan.html")


@app.route('/forcezoompan2')
def get_force_zoom_pan_particles():
    return render_template("force-zoom-pan-2.html")


@app.route('/data')
def get_data():
    G = random_connected_graph(15)
    graph_dict = graph_to_dict(G)
    d3_graph_dict = d3_format(graph_dict)
    return jsonify(dict(data=d3_graph_dict))


@app.route('/')
def index():
    return render_template("index.html")


if __name__ == '__main__':
    host_name = 'localhost'
    port_num = 5000
    app.run(debug=True, host=host_name, port=port_num)
