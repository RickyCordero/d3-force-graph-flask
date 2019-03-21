from os import path
import networkx as nx
from networkx.readwrite import json_graph
import json

basepath = path.dirname(__file__)

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

def export_json(dictionary):
    '''
    Exports the given dictionary to a json file.
    '''
    filepath = path.abspath(path.join(basepath, "static", "json", "graph.json"))
    with open(filepath, 'w') as file:
        json.dump(dictionary, file, indent=4, default=lambda x: x.__dict__)

def random_graph(n):
    '''
    Returns a random binomial graph of n nodes, with the calculated edge creation probability.
    '''
    p = 4.0 / 30
    return nx.erdos_renyi_graph(n, p)


def random_connected_graph(n):
    '''
    Returns a fully connected random binomial graph of n nodes containing the degree, degree parity, and Katz centrality of each node in the graph.
    '''
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
