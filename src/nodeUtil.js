const getChildren = (parentNode, nodes, edges) => {
    const childNodeIds = edges.filter(edge => edge.source === parentNode.id).map(edge => edge.target);
    return nodes.filter(node => childNodeIds.includes(node.id))
}

export { getChildren };