import sys
# sys.path.insert(0, r'C:\Users\Ricky\Documents\Programming\Python\NetworkX')
from flask import Flask, render_template, jsonify
from graph import random_graph, connected_random_graph, graph_to_dict, d3_format, export_json, pretty_print

app = Flask(__name__)

@app.route('/data')
def get_data():
    G = random_graph(15)
    graph_dict = graph_to_dict(G)
    d3_graph_dict = d3_format(graph_dict)
    return jsonify(dict(data=d3_graph_dict))

@app.route('/')
def index():
    # return render_template("particles.html")
    # return render_template("gooey_force_graph.html")
    # return render_template("force_tree_1.html")
    return render_template("force_zoom_pan_particles.html")


if __name__ == '__main__':
    host_name = 'localhost'
    port_num = 5000
    app.run(debug=True, host=host_name, port=port_num)
