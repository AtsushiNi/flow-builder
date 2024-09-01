import { Handle, Position, useReactFlow } from "@xyflow/react";
import { Form, Input, Popover, Flex, Button } from "antd";

const SpecNode = ({ id, data }) => {
  const { deleteElements } = useReactFlow();

  const onChangeFqcn = (event) => {
    data.fqcn = event.target.value;
    const parts = event.target.value.split(".");
    data.label = parts[parts.length - 1];
    data.onNodeUpdate(id, data);
  };

  const popover = (
    <Form>
      <Form.Item layout="vertical" label="FQCN">
        <Input value={data.fqcn} onChange={onChangeFqcn} />
      </Form.Item>
      <Form.Item style={{marginTop: 50, marginBottom: 0}}>
        <Form.Item style={{ display: "inline-block", width: "calc(50% - 8px)"}}>
          <Button onClick={() => deleteElements({ nodes: [{ id: id }] })}>Delete</Button>
        </Form.Item>
        <Form.Item style={{ display: "inline-block", width: "calc(50% - 8px)"}}>
          <Button onClick={() => data.onNodeDelete(id)}>Delete</Button>
        </Form.Item>
      </Form.Item>
    </Form>
  );
  return (
    <Popover content={popover} open>
      <Handle type="target" position={Position.Left} />
      {data.label}
      <Handle type="source" position={Position.Right} />
    </Popover>
  );
};

export default SpecNode;
