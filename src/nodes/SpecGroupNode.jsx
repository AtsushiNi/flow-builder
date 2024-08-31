import { Handle, Position } from "@xyflow/react";
import { Input, Popover } from 'antd';

const SpecGroupNode = ({ data }) => {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
      />
      {data.label}
      <Handle
        type="source"
        position={Position.Right}
      />
    </>
  )
}

export default SpecGroupNode