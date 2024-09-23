import React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';

const CustomButton = ({
  htmlType = 'button',
  variant = 'contained', // Menggunakan "variant" untuk menggantikan tipe tombol
  color = 'primary',     // Warna tombol default
  children,
  onClick = null,
  disabled = false,
  className = '',
  ...rest
}) => {
  return (
    <Button
      type={htmlType}
      variant={variant}
      color={color}
      onClick={onClick}
      disabled={disabled}
      className={className}
      {...rest}
    >
      {children}
    </Button>
  );
};

CustomButton.propTypes = {
  htmlType: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(['text', 'contained', 'outlined']), // "variant" menggantikan "type"
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'error', 'info', 'warning']),
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default CustomButton;