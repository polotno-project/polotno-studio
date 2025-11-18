import React from 'react';
import { Spinner } from '@blueprintjs/core';
import styled from 'polotno/utils/styled';

const Overlay = styled('div')`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
  backdrop-filter: blur(2px);
`;

const Content = styled('div')`
  background: #fff;
  padding: 30px 40px;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  text-align: center;
  min-width: 300px;
`;

const Message = styled('div')`
  margin-top: 16px;
  font-size: 16px;
  font-weight: 500;
  color: #182026;
`;

const Submessage = styled('div')`
  margin-top: 8px;
  font-size: 13px;
  color: #5c7080;
`;

export const LoadingOverlay = ({ message, submessage }) => {
  return (
    <Overlay role="alert" aria-live="polite" aria-busy="true">
      <Content>
        <Spinner size={50} />
        {message && <Message>{message}</Message>}
        {submessage && <Submessage>{submessage}</Submessage>}
      </Content>
    </Overlay>
  );
};

export default LoadingOverlay;
