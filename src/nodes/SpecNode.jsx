import { Handle, Position } from "@xyflow/react";
import { Form, Input, Popover } from "antd";

const SpecNode = ({ id, data }) => {
  const onChangeFqcn = event => {
    data.fqcn = event.target.value
    const parts = event.target.value.split(".")
    data.label = parts[parts.length - 1]
    data.onNodeUpdate(id, data)
  }

  const popover = (
    <Form>
      <Form.Item layout="vertical" label="FQCN">
        <Input value={data.fqcn} onChange={onChangeFqcn}/>
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