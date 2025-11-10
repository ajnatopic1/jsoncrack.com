import React, { useState, useEffect } from "react";
import type { ModalProps } from "@mantine/core";
import {
  Modal,
  Stack,
  Text,
  ScrollArea,
  Flex,
  CloseButton,
  Button,
  Textarea,
} from "@mantine/core";
import { CodeHighlight } from "@mantine/code-highlight";
import type { NodeData } from "../../../types/graph";
import useGraph from "../../editor/views/GraphView/stores/useGraph";
import useJson from "../../../store/useJson";
import toast from "react-hot-toast";

const normalizeNodeData = (nodeRows: NodeData["text"]) => {
  if (!nodeRows || nodeRows.length === 0) return "{}";
  if (nodeRows.length === 1 && !nodeRows[0].key) return `${nodeRows[0].value}`;

  const obj: Record<string, unknown> = {};
  nodeRows.forEach(row => {
    if (row.type !== "array" && row.type !== "object") {
      if (row.key) obj[row.key] = row.value;
    }
  });
  return JSON.stringify(obj, null, 2);
};

const jsonPathToString = (path?: NodeData["path"]) => {
  if (!path || path.length === 0) return "$";
  const segments = path.map(seg => (typeof seg === "number" ? seg : `"${seg}"`));
  return `$[${segments.join("][")}]`;
};

export const NodeModal = ({ opened, onClose }: ModalProps) => {
  const nodeData = useGraph(state => state.selectedNode);
  const jsonStore = useJson();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(normalizeNodeData(nodeData?.text ?? []));

React.useEffect(() => {
  if (nodeData) {
    setEditValue(normalizeNodeData(nodeData.text ?? []));
  }
}, [nodeData]);

  const json = useJson(state => state.json);
  useEffect(() => {
    if (!isEditing && nodeData) {
      setEditValue(normalizeNodeData(nodeData?.text ?? []));
    }
  }, [json, nodeData, isEditing]);

  const handleEdit = () => {
    setEditValue(normalizeNodeData(nodeData?.text ?? []));
    setIsEditing(true);
  };

 const handleSave = () => {
  try {
    const parsed = JSON.parse(editValue);
    const path = nodeData?.path;

    if (!path) {
      toast.error("Path not found");
      return;
    }

    const currentJson = JSON.parse(jsonStore.getJson());
    let target: any = currentJson;

    for (let i = 0; i < path.length - 1; i++) {
      const seg = path[i];
      target = typeof seg === "number" ? target[seg] : target[seg as keyof typeof target];
    }

    const lastSeg = path[path.length - 1];
    const existingValue =
      typeof lastSeg === "number" ? target[lastSeg] : target[lastSeg as keyof typeof target];

    const mergedValue =
      typeof parsed === "object" && typeof existingValue === "object"
        ? { ...existingValue, ...parsed }
        : parsed;

    if (typeof lastSeg === "number") target[lastSeg] = mergedValue;
    else target[lastSeg as keyof typeof target] = mergedValue;

    const newJson = JSON.stringify(currentJson, null, 2);
    jsonStore.setJson(newJson);

    const graphStore = useGraph.getState();
    if (graphStore.selectedNode) {
      graphStore.setSelectedNode({
        ...graphStore.selectedNode,
        text: Object.entries(mergedValue).map(([key, value]) => ({
          key,
          value: typeof value === "object" ? JSON.stringify(value, null, 2) : String(value),
          type: typeof value === "object" ? "object" : "string",
        })),
      });
    }

    setEditValue(JSON.stringify(mergedValue, null, 2));
    toast.success("Changes saved!");
    setIsEditing(false);
  } catch (err) {
    toast.error("Invalid JSON format");
    console.error("Save error:", err);
  }
};




  const handleCancel = () => {
    setEditValue(normalizeNodeData(nodeData?.text ?? []));
    setIsEditing(false);
  };

  return (
    <Modal size="auto" opened={opened} onClose={onClose} centered withCloseButton={false}>
      <Stack pb="sm" gap="sm">
        <Stack gap="xs">
          <Flex justify="space-between" align="center">
            <Text fz="xs" fw={500}>
              Content
            </Text>
            <Flex gap="xs" align="center">
              {!isEditing && (
                <Button size="xs" variant="light" onClick={handleEdit}>
                  Edit
                </Button>
              )}
              {isEditing && (
                <>
                  <Button size="xs" color="green" onClick={handleSave}>
                    Save
                  </Button>
                  <Button size="xs" color="gray" onClick={handleCancel}>
                    Cancel
                  </Button>
                </>
              )}
              <CloseButton onClick={onClose} />
            </Flex>
          </Flex>

          <ScrollArea.Autosize mah={250} maw={600}>
            {isEditing ? (
              <Textarea
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                autosize
                minRows={6}
                styles={{ input: { fontFamily: "monospace" } }}
              />
            ) : (
              <CodeHighlight
                code={editValue}
                miw={350}
                maw={600}
                language="json"
                withCopyButton
              />
            )}
          </ScrollArea.Autosize>
        </Stack>

        <Text fz="xs" fw={500}>
          JSON Path
        </Text>
        <ScrollArea.Autosize maw={600}>
          <CodeHighlight
            code={jsonPathToString(nodeData?.path)}
            miw={350}
            mah={250}
            language="json"
            copyLabel="Copy to clipboard"
            copiedLabel="Copied to clipboard"
            withCopyButton
          />
        </ScrollArea.Autosize>
      </Stack>
    </Modal>
  );
};
