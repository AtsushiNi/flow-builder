import { Handle, Position } from "@xyflow/react";
import { Popover, Form, Flex, Button } from 'antd';

const SpecGroupNode = ({ id, data }) => {
  const popover = (
    <Form>
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
      <Handle
        type="source"
        position={Position.Right}
      />
    </Popover>
  )
}

export default SpecGroupNode