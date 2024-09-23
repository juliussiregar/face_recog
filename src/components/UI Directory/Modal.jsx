import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {title}
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {children}
      </DialogContent>
      {footer && (
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
          {footer}
        </DialogActions>
      )}
    </Dialog>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
};

Modal.defaultProps = {
  footer: null,
};

export default Modal;