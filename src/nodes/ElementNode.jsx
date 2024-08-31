import { Handle, Position } from "@xyflow/react";
import { Form, Input, Popover } from 'antd';

const ElementNode = ({ data }) => {
  const popover = (
    <Form layout ="vertical">
      <Form.Item label="app">
        <Input/>
      </Form.Item>
      <Form.Item label="element">
        <Input/>
      </Form.Item>
    </Form>
  )
  return (
    <Popover content={popover}>
      {data.label}
      <Handle
        type="source"
        position={Position.Right}
      />
    </Popover>
  )
}

export default ElementNode