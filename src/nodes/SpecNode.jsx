import { Handle, Position } from "@xyflow/react";
import { Form, Input, Popover } from "antd";

const SpecNode = ({ data }) => {
  const popover = (
    <Form>
      <Form.Item layout="vertical" label="FQCN">
        <Input value={data.fqcn}/>
      </Form.Item>
    </Form>
  )
  return (
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
  )
}

export default SpecNode