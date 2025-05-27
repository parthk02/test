import { CircularProgress } from "@mui/material";
import React from "react";
import styled from "styled-components";

// filter props so that they don't get passed to the DOM node
const ButtonStyled = styled.div.withConfig({
  shouldForwardProp: (prop) =>
    !["isDisabled", "isLoading", "flex", "type"].includes(prop),
})`
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: min-content;
  padding: 10px 24px;
  @media (max-width: 600px) {
    padding: 8px 12px;
  }

  ${({ type, theme }) =>
    type === "secondary"
      ? `
  background: ${theme.secondary};
  `
      : `
  background: ${theme.primary};
`}

  ${({ isDisabled }) =>
    isDisabled &&
    `
  opacity: 0.4;
  cursor: not-allowed;
`}

  ${({ isLoading }) =>
    isLoading &&
    `
    opacity: 0.8;
    cursor: not-allowed;
`}

  ${({ flex }) =>
    flex &&
    `
    flex: 1;
`}
`;

const Button = ({
  text,
  isLoading = false,
  isDisabled = false,
  rightIcon,
  leftIcon,
  type = "primary",
  onClick,
  flex = false,
  ...rest
}) => {
  const handleClick = () => {
    if (!isDisabled && !isLoading && onClick) {
      onClick();
    }
  };

  return (
    <ButtonStyled
      onClick={handleClick}
      isDisabled={isDisabled}
      type={type}
      isLoading={isLoading}
      flex={flex}
      {...rest}
    >
      {isLoading && (
        <CircularProgress
          size={18}
          style={{ color: "inherit" }}
          thickness={4}
        />
      )}
      {leftIcon}
      {text}
      {rightIcon}
    </ButtonStyled>
  );
};

export default Button;
