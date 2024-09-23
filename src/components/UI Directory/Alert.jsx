import React from 'react';
import PropTypes from 'prop-types';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

const AlertComponent = ({ type, message, onClose }) => {
  return (
    <Alert severity={type} onClose={onClose}>
      <AlertTitle>{type.charAt(0).toUpperCase() + type.slice(1)}</AlertTitle>
      {message}
    </Alert>
  );
};

AlertComponent.propTypes = {
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']).isRequired,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func,
};

AlertComponent.defaultProps = {
  onClose: null,
};

export default AlertComponent;