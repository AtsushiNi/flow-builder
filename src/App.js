import { Background, Position, ReactFlow, ReactFlowProvider, addEdge, reconnectEdge, useEdgesState, useNodesState, useReactFlow, Handle, NodeToolbar, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useRef, useState } from 'react';

import './App.css';
import { DnDProvider, useDnD } from './DnDContext';
import Sidebar from './Sidebar';
import { FloatButton, Popover, Input } from 'antd';
import { PlusCircleFilled, PlusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import ElementNode from "./nodes/ElementNode";
import SpecGroupNode from "./nodes/SpecGroupNode";
import SpecNode from "./nodes/SpecNode";
import SpecOptionNode from "./nodes/SpecOptionNode";
import { getChildren, getAllChildElements } from "./nodeUtil";

const nodeTypes = {
  element: ElementNode,
  specGroup: SpecGroupNode,
  spec: SpecNode,
  specOption: SpecOptionNode
}

let id = 0;
const getId = () => `dndnode_${id++}`;
let edgeId = 0;
const getEdgeId = () => `copyedge_${edgeId++}`

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [copyingNodeId, setCopyingNodeId] = useState(null);
  const { screenToFlowPosition } = useReactFlow();
  const [type, setType] = useDnD();
  const reactFlowWrapper = useRef(null);
  const connectingNodeId = useRef(null);
  const connectingNodeType = useRef(null);
  const edgeReconnectSuccessful = useRef(true);

  useEffect(() => {
    if (copyingNodeId === null) return

    const targetNode = nodes.find(node => node.id === copyingNodeId)
    const { allChildNodes, allChildEdges } = getAllChildElements(targetNode, nodes, edges);
    const newNodes = JSON.parse(JSON.stringify(allChildNodes))
    newNodes.forEach(node => {
      node.data.onNodeUpdate = onNodeUpdate
      node.data.onNodeCopy = onNodeCopy
    })
    const newEdges = JSON.parse(JSON.stringify(allChildEdges))
    // idを振る
    newNodes.forEach(node => {
      const sourceEdges = newEdges.filter(edge => edge.source === node.id)
      const targetEdges = newEdges.filter(edge => edge.target === node.id)
      node.id = getId();
      sourceEdges.forEach(edge => edge.source = node.id)
      targetEdges.forEach(edge => edge.target = node.id)
    })
    newEdges.forEach(edge => {
      edge.id = getEdgeId();
    })
    // 位置をずらす
    newNodes.forEach(node => {
      node.position.x += 200;
      node.position.y += 200;
    })

    setNodes(nds => nds.concat(newNodes))
    setEdges(eds => eds.concat(newEdges))

    setCopyingNodeId(null);
  }, [copyingNodeId])

  const onConnect = useCallback(params => {
    connectingNodeId.current = null;
    setEdges(eds => addEdge(params, eds))
  }, []);

  const onConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
    connectingNodeType.current = nodes.find(n => n.id === nodeId).type;
  }, [nodes]);

  const onConnectEnd = useCallback(
    (event) => {
      if (!connectingNodeId.current) return;
      if (!edgeReconnectSuccessful.current) return;

      const targetIsPane = event.target.classList.contains('react-flow__pane');
      if (!targetIsPane) return;

      const id = getId();
      let type;
      switch (connectingNodeType.current) {
        case "element":
          type = "specGroup";
          break;
        case "specGroup":
          type = "spec";
          break;
        default:
          type = "specOption";
          break;
      }
      const newNode = {
        id,
        type,
        position: screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        }),
        data: { label: type, onNodeUpdate, onNodeCopy },
        origin: [0.5, 0.0],
      };

      setNodes((nds) => nds.concat(newNode));
      setEdges((eds) =>
        eds.concat({ id, source: connectingNodeId.current, target: id }),
      );
    },
    [screenToFlowPosition],
  );

  const onReconnectStart = useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, [])

  const onReconnect = useCallback((oldEdge, newConnection) => {
    edgeReconnectSuccessful.current = true;
    setEdges(els => reconnectEdge(oldEdge, newConnection, els));
  }, [])

  const onReconnectEnd = useCallback((_, edge) => {
    if (!edgeReconnectSuccessful.current) {
      setEdges(eds => eds.filter(e => e.id !== edge.id));
    }
    edgeReconnectSuccessful.current = true;
  }, [])

  const onNodeClick = useCallback((event, targetNode) => {
    const childNodes = getChildren(targetNode, nodes, edges)
    const hideNodeIds = []
    const hideEdgeIds = []
    childNodes.forEach(node => {
      const {allChildNodes, allChildEdges} = getAllChildElements(node, nodes, edges)
      hideNodeIds.push(...allChildNodes.map(n => n.id))
      hideEdgeIds.push(...allChildEdges.map(e => e.id))
    })

    // トグル
    const collapse = targetNode.data.collapsed ? !targetNode.data.collapsed : true

    setNodes(nds => nds.map(node => {
      if (targetNode.id === node.id) {
        return {...node, data: {...node.data, collapsed: collapse}}
      }
      if (hideNodeIds.includes(node.id)) {
        return {...node, hidden: collapse}
      } else {
        return node
      }
    }));
    setEdges(eds => eds.map(edge => {
      if (hideEdgeIds.includes(edge.id)) {
        return {...edge, hidden: collapse}
      } else {
        return edge
      }
    }))
  }, [nodes, edges])

  const onNodeMouseEnter = useCallback((_, node) => {
    setNodes(nds => nds.map(n =>
      n.id === node.id
        ? { ...n, data: { ...n.data, isShowToolbar: true } }
        : n))
  }, [setNodes])

  const onNodeMouseLeave = useCallback((_, node) => {
    setNodes(nds => nds.map(n =>
      n.id === node.id
        ? { ...n, data: { ...n.data, isShowToolbar: false } }
        : n))
  }, [setNodes])

  const onDragOver = useCallback(event => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(event => {
    event.preventDefault();

    if (!type) {
      return;
    }

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    const newNode = {
      id: getId(),
      type,
      position,
      data: { label: `${type} node` },
    };
    if (type === "element") {
      newNode.data.label = "Element"
      newNode.data.value = "Element"
    } else if (type === "specGroup") {
      newNode.data.label = "SpecGroup"
      newNode.data.value = "SpecGroup"
    } else if (type === "spec") {
      newNode.data.label = "Spec"
      newNode.data.value = "Spec"
    } else {
      newNode.data.label = "SpecOption"
      newNode.data.value = "SpecOption"
    }

    setNodes(nds => nds.concat(newNode));
  }, [screenToFlowPosition, type]);

  const addElement = useCallback(() => {
    const newNode = {
      id: getId(),
      type: "element",
      position: screenToFlowPosition({ x: 400, y: 400 }),
      data: { label: "Element", onNodeUpdate, onNodeCopy }
    }
    setNodes(nds => nds.concat(newNode));
  }, [screenToFlowPosition])

  const onNodeUpdate = (id, data) => {
    setNodes(nds =>
      nds.map(node => {
        if (node.id === id) {
          return { ...node, data };
        } else {
          return node;
        }
      })
    )
  }

  const onNodeCopy = (id) => {
    setCopyingNodeId(id);
  }

  return (
    <div class="dndflow">
      <div ref={reactFlowWrapper} style={{ height: '100vh', width: '100vw' }}>
        <ReactFlow
          nodeTypes={nodeTypes}
          nodes={nodes}
          onNodesChange={onNodesChange}
          edges={edges}
          onEdgesChange={onEdgesChange}
          onConnectStart={onConnectStart}
          onConnect={onConnect}
          onConnectEnd={onConnectEnd}
          onReconnectStart={onReconnectStart}
          onReconnect={onReconnect}
          onReconnectEnd={onReconnectEnd}
          onNodeClick={onNodeClick}
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
        >
          <Background />
        </ReactFlow>
        <FloatButton onClick={addElement} type="primary" icon={<PlusOutlined />} style={{ insetInlineEnd: 350 }} />
        <MiniMap/>
      </div>
      <Sidebar nodes={nodes} setNodes={setNodes} edges={edges} setEdges={setEdges} />
    </div>
  );
}

export default () => (
  <ReactFlowProvider>
    <DnDProvider>
      <App />
    </DnDProvider>
  </ReactFlowProvider>
);
