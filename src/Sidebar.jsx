import React, { useCallback, useRef, useState } from "react";
import { useDnD } from "./DnDContext";
import { Button, Upload } from "antd";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";

const Sidebar = ({ nodes, setNodes, edges, setEdges }) => {
  const [_, setType] = useDnD();
  const anchorRef = useRef(null);
  const [file, setFile] = useState(null);

  let selectedNode = nodes.find((node) => node.selected);

  const updateNodes = useCallback((newNodes, newEdges) => {
    setNodes((nds) => newNodes);
    setEdges((edg) => newEdges);
  });

  const onDragStart = (event, nodeType) => {
    setType(nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const onChangeLabel = useCallback(
    (event) => {
      const newValue = event.target.value;
      let newLabel = newValue;
      if (selectedNode.type === "spec") {
        const parts = newValue.split(".");
        newLabel = parts[parts.length - 1];
      }
      setNodes((nds) =>
        nds.map((node) => {
          if (node.selected === true) {
            return {
              ...node,
              data: {
                ...node.data,
                value: newValue,
                label: newLabel,
              },
            };
          }
          return node;
        })
      );
    },
    [selectedNode, setNodes]
  );

  const handleBeforeUpload = file => {
    setFile(file);
    return false;
  }
  const handleFileChange = () => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      const { nodes, edges } = parseSQLToReactFlow(content);
      updateNodes(nodes, edges);
    };
    reader.readAsText(file);
  };

  const onClickOutput = () => {
    const elementNodes = nodes.filter((node) => node.type === "element");
    const elements = elementNodes.map((node, index) => {
      return { id: index + 1, value: node.data.value };
    });
    const specGroups = [];
    const specs = [];
    const specOptions = [];
    elementNodes.forEach((elementNode, elementIndex) => {
      const specGroupNodeIds = edges
        .filter((edge) => edge.source === elementNode.id)
        .map((edge) => edge.target);
      const specGroupNodes = nodes.filter((node) =>
        specGroupNodeIds.includes(node.id)
      );
      specGroupNodes.forEach((specGroupNode) => {
        specGroups.push({
          id: specGroups.length + 1,
          elementId: elementIndex + 1,
        });
        const specNodeIds = edges
          .filter((edge) => edge.source === specGroupNode.id)
          .map((edge) => edge.target);
        const specNodes = nodes.filter((node) => specNodeIds.includes(node.id));
        specNodes.forEach((specNode) => {
          specs.push({
            id: specs.length + 1,
            specGroupId: specGroups.length,
            fqcn: specNode.data.value,
          });
          const specOptionNodeIds = edges
            .filter((edge) => edge.source == specNode.id)
            .map((edge) => edge.target);
          const specOptionNodes = nodes.filter((node) =>
            specOptionNodeIds.includes(node.id)
          );
          specOptionNodes.forEach((specOption) => {
            specOptions.push({
              id: specOptions.length + 1,
              specId: specs.length,
              value: specOption.data.value,
            });
          });
        });
      });
    });

    const elementSQL = elements
      .map(
        (element) =>
          "INSERT INTO ELEMENT(id, value) VALUES(" +
          element.id +
          ", '" +
          element.value +
          "');"
      )
      .join("\n");
    const specGroupSQL = specGroups
      .map(
        (specGroup) =>
          "INSERT INTO SPEC_GROUP(id, element_id) VALUES(" +
          specGroup.id +
          ", " +
          specGroup.elementId +
          ");"
      )
      .join("\n");
    const specSQL = specs
      .map(
        (spec) =>
          "INSERT INTO SPEC(id, spec_group_id, fqcn) VALUES(" +
          spec.id +
          ", " +
          spec.specGroupId +
          ", '" +
          spec.fqcn +
          "');"
      )
      .join("\n");
    const specOptionSQL = specOptions
      .map(
        (option) =>
          "INSERT INTO SPEC_OPTION(id, spec_id, value) VALUES(" +
          option.id +
          ", " +
          option.specId +
          ", '" +
          option.value +
          "');"
      )
      .join("\n");
    const sql = [elementSQL, specGroupSQL, specSQL, specOptionSQL].join("\n\n");

    const blob = new Blob([sql], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = anchorRef.current;
    link.setAttribute("href", url);
    link.setAttribute("download", "insert.sql");
    link.click();
  };

  // 文字列を処理してノードとエッジを生成する関数
  function parseSQLToReactFlow(sql) {
    const nodes = [];
    const edges = [];

    // SQL文を行に分割
    const statements = sql.trim().split("\n");

    // データを処理
    statements.forEach((statement) => {
      if (statement.includes("INSERT INTO ELEMENT")) {
        const matches = statement.match(/VALUES\((\d+), '([^']+)'\)/);
        if (matches) {
          nodes.push({
            id: matches[1],
            type: "element",
            data: { value: matches[2], label: matches[2] },
            position: { x: 400 * 1, y: Math.random() * 400 }, // ランダム位置
          });
        }
      } else if (statement.includes("INSERT INTO SPEC_GROUP")) {
        const matches = statement.match(/VALUES\((\d+), (\d+)\)/);
        if (matches) {
          nodes.push({
            id: `group-${matches[1]}`,
            type: "specGroup",
            data: { value: matches[2], label: "Spec Group" },
            position: { x: 400 * 2, y: Math.random() * 400 }, // ランダム位置
          });
          edges.push({
            id: `e-group-${matches[1]}`,
            source: matches[2],
            target: `group-${matches[1]}`,
          });
        }
      } else if (statement.includes("INSERT INTO SPEC_OPTION")) {
        const matches = statement.match(/VALUES\((\d+), (\d+), '([^']+)'\)/);
        if (matches) {
          nodes.push({
            id: `option-${matches[1]}`,
            type: "specOption",
            data: { value: matches[3], label: matches[3] },
            position: {
              x: 400 * 4,
              y: 100 * Number(matches[1].match(/\d+/)[0]),
            }, // ランダム位置
          });
          edges.push({
            id: `e-option-${matches[1]}`,
            source: `spec-${matches[2]}`,
            target: `option-${matches[1]}`,
          });
        }
      } else if (statement.includes("INSERT INTO SPEC")) {
        const matches = statement.match(/VALUES\((\d+), (\d+), '([^']+)'\)/);
        if (matches) {
          const parts = matches[3].split(".");
          nodes.push({
            id: `spec-${matches[1]}`,
            type: "spec",
            data: { value: matches[3], label: parts[parts.length - 1] },
            position: { x: 400 * 3, y: Math.random() * 400 }, // ランダム位置
          });
          edges.push({
            id: `e-spec-${matches[1]}`,
            source: `group-${matches[2]}`,
            target: `spec-${matches[1]}`,
          });
        }
      }
    });

    // 縦軸の高さ計算
    const specNodes = nodes.filter((node) => node.type === "spec");
    specNodes.forEach((node) => {
      const optionIDs = edges
        .filter((edge) => edge.source === node.id)
        .map((edge) => edge.target);
      const optionPositions = optionIDs
        .map((id) => nodes.find((node) => node.id === id))
        .map((node) => node.position.y);
      if (optionPositions.length > 0) {
        node.position.y = Math.min(...optionPositions);
      }
    });
    const groupNodes = nodes.filter((node) => node.type === "specGroup");
    groupNodes.forEach((node) => {
      const specIds = edges
        .filter((edge) => edge.source === node.id)
        .map((edge) => edge.target);
      const specPositions = specIds
        .map((id) => nodes.find((node) => node.id === id))
        .map((node) => node.position.y);
      if (specPositions.length > 0) {
        node.position.y = Math.min(...specPositions);
      }
    });
    const elementNodes = nodes.filter((node) => node.type === "element");
    elementNodes.forEach((node) => {
      const groupIds = edges
        .filter((edge) => edge.source === node.id)
        .map((edge) => edge.target);
      const groupPositions = groupIds
        .map((id) => nodes.find((node) => node.id === id))
        .map((node) => node.position.y);
      if (groupPositions.length > 0) {
        node.position.y = Math.min(...groupPositions);
      }
    });

    return { nodes, edges };
  }

  return (
    <aside>
      <div style={{ marginBottom: 10 }}>
        {/* <Upload maxCount={1} onChange={handleFileChange}> */}
        <Upload maxCount={1} onChange={handleFileChange} beforeUpload={handleBeforeUpload}>
            <Button icon={<UploadOutlined />}>Upload Data</Button>
        </Upload>
      </div>
      <Button icon={<DownloadOutlined/>}>Output Data</Button>
      {/* <div
        className="dndnode element"
        onDragStart={(event) => onDragStart(event, "element")}
        draggable
      >
        Element
      </div>
      <div
        className="dndnode spec-group"
        onDragStart={(event) => onDragStart(event, "specGroup")}
        draggable
      >
        SpecGroup
      </div>
      <div
        className="dndnode spec"
        onDragStart={(event) => onDragStart(event, "spec")}
        draggable
      >
        Spec
      </div>
      <div
        className="dndnode spec-option"
        onDragStart={(event) => onDragStart(event, "specOption")}
        draggable
      >
        SpecOption
      </div> */}
      <div>
        {selectedNode ? (
          selectedNode.type === "specGroup" ? (
            <input value="SpecGroup" disabled />
          ) : (
            <input value={selectedNode?.data.value} onChange={onChangeLabel} />
          )
        ) : (
          <></>
        )}
      </div>
      <div>
        {/* <button onClick={onClickOutput}>出力</button> */}
        {/* <a ref={anchorRef}></a> */}
      </div>
    </aside>
  );
};

export default Sidebar;
