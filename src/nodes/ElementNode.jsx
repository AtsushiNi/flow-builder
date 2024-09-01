import { Handle, Position } from "@xyflow/react";
import { Flex, Form, Input, Popover, Button } from 'antd';

const ElementNode = ({ id, data }) => {

  const onChangeAppName = event => {
    data.app = event.target.value
    data.onNodeUpdate(id, data)
  }
  const onChangeElementName = event => {
    data.label = event.target.value
    data.value = event.target.value
    data.onNodeUpdate(id, data)
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
      {data.label}
      <Handle
        type="source"
        position={Position.Right}
      />
    </Popover>
  )
}

export default ElementNode