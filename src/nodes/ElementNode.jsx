import { Handle, Position, useReactFlow } from "@xyflow/react";
import { Flex, Form, Input, Popover, Button } from 'antd';
import styled from 'styled-components';
import '@xyflow/react/dist/style.css';

const Node = styled.div`
  color: ${(props) => props.collapsed ? "gray": "#1a192b"};
  border: var(--xy-node-border, var(--xy-node-border-default));
  border-color: ${(props) => props.collapsed ? "gray": "#1a192b"};
  .react-flow__handle {
    background-color: ${(props) => props.collapsed ? "gray": "#1a192b"};
  }
`
const ElementNode = ({ id, data }) => {

  const { deleteElements } = useReactFlow();

  const onChangeAppName = event => {
    data.app = event.target.value
    data.onNodeUpdate(id, data)
  }
  const onChangeElementName = event => {
    data.label = event.target.value
    data.value = event.target.value
    data.onNodeUpdate(id, data)
  }

  const onCopyClick = () => {
    data.onNodeCopy(id);
  }

  const popover = (
    <Form layout ="vertical">
      <Form.Item label="app">
        <Input value={data.app} onChange={onChangeAppName}/>
      </Form.Item>
      <Form.Item label="element">
        <Input value={data.value} onChange={onChangeElementName}/>
      </Form.Item>
      <Form.Item style={{marginTop: 50, marginBottom: 0}}>
        <Form.Item style={{ display: "inline-block", width: "calc(50% - 8px)"}}>
          <Button onClick={() => deleteElements({ nodes: [{id: id}]})}>Delete</Button>
        </Form.Item>
        <Form.Item style={{ display: "inline-block", width: "calc(50% - 8px)"}}>
          <Button onClick={onCopyClick}>Copy</Button>
        </Form.Item>
      </Form.Item>
    </Form>
  )
  return (
    <Node collapsed={data.collapsed} className="node">
    <Popover content={popover}>
      <div>
        {data.label}
        <Handle
          type="source"
          position={Position.Right}
        />
      </div>
    </Popover>
    </Node>
  )
}

export default ElementNode