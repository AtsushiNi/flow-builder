import { Background, Position, ReactFlow, ReactFlowProvider, addEdge, useEdgesState, useNodesState, useReactFlow, Handle } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useRef } from 'react';

import './App.css';
import { DnDProvider, useDnD } from './DnDContext';
import Sidebar from './Sidebar';

const initialNodes = [];
const initialEdges = []

const ElementNode = ({ data }) => {
  return (
    <>
      {data.label}
      <Handle
        type="source"
        position={Position.Right}
      />
    </>
  )
}

const SpecGroupNode = ({ data }) => {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
      />
      {data.label}
      <Handle
        type="source"
        position={Position.Right}
      />
    </>
  )
}
const SpecNode = ({ data }) => {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
      />
      {data.label}
      <Handle
        type="source"
        position={Position.Right}
      />
    </>
  )
}
const SpecOptionNode = ({ data }) => {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
      />
      {data.label}
    </>
  )
}

const nodeTypes = {
  element: ElementNode,
  specGroup: SpecGroupNode,
  spec: SpecNode,
  specOption: SpecOptionNode
}

let id = 0;
const getId = () => `dndnode_${id++}`;

function App() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition } = useReactFlow();
  const [type, setType] = useDnD();

  const onConnect = useCallback(
    params => setEdges(eds => addEdge(params, eds)),
    []
  );

  const onNodeClick = useCallback((event, node) => {
    console.log(node.data)
  }, [])

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

  return (
    <div class="dndflow">
      <div ref={reactFlowWrapper} style={{ height: '100vh', width: '100vw' }}>
        <ReactFlow
          nodeTypes={nodeTypes}
          nodes={nodes}
          onNodesChange={onNodesChange}
          edges={edges}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
        >
          <Background />
        </ReactFlow>
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
