import { Handle, Position } from "@xyflow/react";
import { Popover, Input, Form, Flex, Button } from "antd";

const SpecOptionNode = ({ id, data }) => {
  const onChangeValue = event => {
    data.label = event.target.value
    data.value = event.target.value
    data.onNodeUpdate(id, data)
  }
  const popover = (
    <Form>
      <Form.Item layout="vertical" label="value">
        <Input value={data.value} onChange={onChangeValue} />
      </Form.Item>
      <Form.Item style={{marginTop: 50, marginBottom: 0}}>
        <Form.Item style={{ display: "inline-block", width: "calc(50% - 8px)"}}>
          <Button onClick={() => data.onNodeDelete(id)}>Delete</Button>
        </Form.Item>
        <Form.Item style={{ display: "inline-block", width: "calc(50% - 8px)"}}>
          <Button onClick={() => data.onNodeDelete(id)}>Delete</Button>
        </Form.Item>
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