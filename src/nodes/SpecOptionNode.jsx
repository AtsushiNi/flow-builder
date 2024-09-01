import { Handle, Position } from "@xyflow/react";
import { Popover, Input, Form } from "antd";

const SpecOptionNode = ({ data }) => {
  const popover = (
    <Form>
      <Form.Item layout="vertical" label="value">
        <Input/>
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
    </Popover>
  )
}

export default SpecOptionNode