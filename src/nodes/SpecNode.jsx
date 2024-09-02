import { Handle, Position, useReactFlow } from "@xyflow/react";
import { Form, Input, Popover, Flex, Button } from "antd";
import styled from "styled-components";

const Node = styled.div`
  color: ${(props) => (props.collapsed ? "gray" : "#1a192b")};
  border: var(--xy-node-border, var(--xy-node-border-default));
  border-color: ${(props) => (props.collapsed ? "gray" : "#ff0072")};
  .react-flow__handle {
    background-color: ${(props) => (props.collapsed ? "gray" : "#ff0072")};
  }
`;

const SpecNode = ({ id, data }) => {
  const { deleteElements } = useReactFlow();

  const onChangeFqcn = (event) => {
    data.fqcn = event.target.value;
    const parts = event.target.value.split(".");
    data.label = parts[parts.length - 1];
    data.onNodeUpdate(id, data);
  };

  const onCopyClick = () => {
    data.onNodeCopy(id);
  };

  const popover = (
    <Form>
      <Form.Item layout="vertical" label="FQCN">
        <Input value={data.fqcn} onChange={onChangeFqcn} />
      </Form.Item>
      <Form.Item style={{ marginTop: 50, marginBottom: 0 }}>
        <Form.Item
          style={{ display: "inline-block", width: "calc(50% - 8px)" }}
        >
          <Button onClick={() => deleteElements({ nodes: [{ id: id }] })}>
            Delete
          </Button>
        </Form.Item>
        <Form.Item
          style={{ display: "inline-block", width: "calc(50% - 8px)" }}
        >
          <Button onClick={onCopyClick}>Copy</Button>
        </Form.Item>
      </Form.Item>
    </Form>
  );
  return (
    <Node collapsed={data.collapsed} className="node">
      <Popover content={popover}>
        <Handle type="target" position={Position.Left} />
        {data.label}
        <Handle type="source" position={Position.Right} />
      </Popover>
    </Node>
  );
};

export default SpecNode;
