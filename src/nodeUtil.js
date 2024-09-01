const getChildren = (parentNode, nodes, edges) => {
    const childNodeIds = edges.filter(edge => edge.source === parentNode.id).map(edge => edge.target);
    return nodes.filter(node => childNodeIds.includes(node.id))
}

// 自信と子要素・孫要素を全て削除する
const deleteTree = (targetNode, nodes, edges) => {
    const {deleteNodes, deleteEdges } = getAllChildElements(targetNode, nodes, edges)
    const edge = edges.filter(edge => edge.source === targetNode.id)
    const children = nodes.filter(node => edge.map(edge => edge.target).includes(node.id))
    children.forEach(child => deleteTree(child, nodes, edges))
}

const getAllChildElements = (targetNode, nodes, edges) => {
    const allChildNodes = []
    const allChildEdges = []
    targetNode.getChildren().forEach(node => {
        const { allChildNodes: childNodes, childEdges } = getAllChildElements(node, nodes, edges);
        allChildNodes.concat(childNodes);
        allChildEdges.concat(childEdges);
    })
    allChildNodes.push(targetNode)
    const parentEdge = edges.find(edge => edge.target === targetNode.id)
    allChildEdges.push(parentEdge)
    return { allChildNodes, allChildEdges }
}

export { getChildren, getAllChildElements };