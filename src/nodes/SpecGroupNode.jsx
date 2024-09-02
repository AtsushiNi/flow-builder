import { Handle, Position, useReactFlow } from "@xyflow/react";
import { Popover, Form, Flex, Button } from 'antd';
import styled from 'styled-components';

const Node = styled.div`
  color: ${(props) => props.collapsed ? "gray": "#1a192b"};
  border: var(--xy-node-border, var(--xy-node-border-default));
  border-color: ${(props) => props.collapsed ? "gray": "#0041d0"};
  .react-flow__handle {
    background-color: ${(props) => props.collapsed ? "gray": "#0041d0"};
  }
`

const SpecGroupNode = ({ id, data }) => {
  const { deleteElements } = useReactFlow();

  const onCopyClick = () => {
    data.onNodeCopy(id)
  }

  const popover = (
    <Form>
      <Form.Item style={{marginTop: 50, marginBottom: 0}}>
        <Form.Item style={{ display: "inline-block", width: "calc(50% - 8px)"}}>
          <Button onClick={() => deleteElements({ nodes: [{ id: id }] })}>Delete</Button>
        </Form.Item>
        <Form.Item style={{ display: "inline-block", width: "calc(50% - 8px)"}}>
          <Button onClick={onCopyClick}>Copy</Button>
        </Form.Item>
      </Form.Item>
    </Form>
  )
  return (
    <Node collapsed={data.collapsed} className="node spec-group">
      <Popover content={popover}>
        <Handle
          type="target"
          position={Position.Left}
        />
        {data.label}
        <Handle
          type="source"
          position={Position.Right}
        />
      </Popover>
    </Node>
  )
}

export default SpecGroupNode