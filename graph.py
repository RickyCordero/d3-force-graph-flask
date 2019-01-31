import networkx as nx
from networkx.readwrite import json_graph
import json


def pretty_print(dictionary):
    '''
    Prints the given dictionary in human readable format.
    '''
    print(dict_to_json_string(dictionary))

def dict_to_json_string(dictionary):
    '''
    Returns a json string representation of the given dictionary.
    '''
    return json.dumps(dictionary, indent=4, default=lambda x: x.__dict__)

def dict_to_json_obj(dictionary):
    '''
    Returns a json object representation of the given dictionary.
    '''
    return json.loads(dict_to_json_string(dictionary))

def graph_to_dict(graph):
    '''
    Returns a dictionary representation of the given graph.
    '''
    return json_graph.node_link_data(graph)

def d3_format(graph_dict):
    '''
    Formats a graph dictionary to d3 format.
    '''
    graph_dict.pop("multigraph")
    graph_dict.pop("directed")
    graph_dict.pop("graph")
    return graph_dict

def export_json(dictionary, filepath=None):
    '''
    Exports the given dictionary to a json file.
    '''
    path=filepath
    if not path:
        path = r'C:\Users\Ricky\Documents\Programming\Python\D3\static\graph.json'
    with open(path, 'w') as file:
        json.dump(dictionary, file, indent=4, default=lambda x: x.__dict__)

def random_graph(n):
    '''
    Returns a random graph of n nodes.
    '''
    p = 4.0 / 30
    return nx.erdos_renyi_graph(n, p)

def connected_random_graph():
    '''
    Returns a random fully connected graph of n nodes containing the degree, degree parity, and Katz centrality of each node in the graph.
    '''
    n = 10
    p = 4.0 / 30
    graph = nx.erdos_renyi_graph(n, p)

    while not nx.is_connected(graph):
        graph = nx.erdos_renyi_graph(n, p)

    for ix, deg in graph.degree():
        graph.node[ix]['degree'] = deg
        graph.node[ix]['parity'] = (1 - deg % 2)

    for ix, katz in nx.katz_centrality(graph).items():
        graph.node[ix]['katz'] = katz

    return graph


def render_graph(graph, dir=None):
    '''
    Renders the given graph to a matplotlib figure and exports the figure to a png file.
    '''
    import matplotlib.pyplot as plt
    dir = r'C:\Users\Ricky\Documents\Programming\Python\NetworkX\output.png'
    # plt.rcParams['font.family']='Uni Sans Light'
    fig = plt.figure(figsize=(6, 4))
    nx.draw(graph, with_labels=True)
    fig.savefig(dir)


if __name__ == "__main__":
    G = connected_random_graph()
    graph_dict = graph_to_dict(G)
    pretty_print(graph_dict)
    render_graph(G)
