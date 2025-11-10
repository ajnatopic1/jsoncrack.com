import React, { useState } from "react";
import styled from "styled-components";
import type { CustomNodeProps } from ".";
import useConfig from "../../../../../store/useConfig";
import { isContentImage } from "../lib/utils/calculateNodeSize";
import { TextRenderer } from "./TextRenderer";
import { InlineNodeEditor } from "./InlineNodeEditor";
import * as Styled from "./styles";

const StyledTextNodeWrapper = styled.span<{ $isParent: boolean }>`
  display: flex;
  justify-content: ${({ $isParent }) => ($isParent ? "center" : "flex-start")};
  align-items: center;
  height: 100%;
  width: 100%;
  overflow: hidden;
  padding: 0 10px;
`;

const Node = ({ node, x, y }: CustomNodeProps) => {
  const { text, width, height } = node;
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(text[0].value);
  const imagePreviewEnabled = useConfig(state => state.imagePreviewEnabled);
  const isImage = imagePreviewEnabled && isContentImage(JSON.stringify(text[0].value));

  const handleSave = (newValue: string) => {
    setValue(newValue);
    setIsEditing(false);
  };

  const handleCancel = () => setIsEditing(false);

  return (
    <Styled.StyledForeignObject
      data-id={`node-${node.id}`}
      width={width}
      height={height}
      x={0}
      y={0}
      onClick={() => setIsEditing(true)}
    >
      {isImage ? (
        <div>Image Preview Disabled for Edit</div>
      ) : (
        <StyledTextNodeWrapper data-x={x} data-y={y} data-key={JSON.stringify(text)} $isParent={false}>
          {isEditing ? (
            <InlineNodeEditor
              initialValue={String(value)}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <Styled.StyledKey $value={value} $type={typeof value}>
              <TextRenderer>{value}</TextRenderer>
            </Styled.StyledKey>
          )}
        </StyledTextNodeWrapper>
      )}
    </Styled.StyledForeignObject>
  );
};

function propsAreEqual(prev: CustomNodeProps, next: CustomNodeProps) {
  return prev.node.text === next.node.text && prev.node.width === next.node.width;
}

export const TextNode = React.memo(Node, propsAreEqual);
