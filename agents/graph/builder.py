from langgraph.graph import StateGraph, START, END
from graph.state import AgentGraphState
from nodes.hunter import hunter_node
from nodes.digger import digger_node
from nodes.quant import quant_node
from nodes.skeptic import skeptic_node
from nodes.partner import partner_node


def build_graph():
    graph = StateGraph(AgentGraphState)

    graph.add_node("hunter", hunter_node)
    graph.add_node("digger", digger_node)
    graph.add_node("quant", quant_node)
    graph.add_node("skeptic", skeptic_node)
    graph.add_node("partner", partner_node)

    # START → Hunter → [Digger, Quant] (parallel) → Skeptic → Partner → END
    graph.add_edge(START, "hunter")
    graph.add_edge("hunter", "digger")
    graph.add_edge("hunter", "quant")
    graph.add_edge("digger", "skeptic")
    graph.add_edge("quant", "skeptic")
    graph.add_edge("skeptic", "partner")
    graph.add_edge("partner", END)

    return graph.compile()
