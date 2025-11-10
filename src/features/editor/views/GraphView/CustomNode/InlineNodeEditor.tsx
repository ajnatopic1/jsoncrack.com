import React, { useState } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Input = styled.input`
  flex: 1;
  font-family: monospace;
  font-size: 12px;
  padding: 2px 4px;
  border: 1px solid ${({ theme }) => theme.NODE_COLORS.DIVIDER};
  background: ${({ theme }) => theme.BACKGROUND_MODIFIER_ACCENT};
  color: ${({ theme }) => theme.NODE_COLORS.TEXT};
  border-radius: 2px;
  outline: none;
  &:focus {
    border-color: ${({ theme }) => theme.INTERACTIVE_ACTIVE};
  }
`;

const Button = styled.button`
  font-family: monospace;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 2px;
  cursor: pointer;
`;

interface Props {
  initialValue: string;
  onSave: (newValue: string) => void;
  onCancel: () => void;
}

export const InlineNodeEditor: React.FC<Props> = ({ initialValue, onSave, onCancel }) => {
  const [value, setValue] = useState(initialValue);

  return (
    <Wrapper>
      <Input
        value={value}
        onChange={e => setValue(e.target.value)}
        autoFocus
        onKeyDown={e => {
          if (e.key === "Enter") onSave(value);
          if (e.key === "Escape") onCancel();
        }}
      />
      <Button onClick={() => onSave(value)}>Save</Button>
      <Button onClick={onCancel}>Cancel</Button>
    </Wrapper>
  );
};
