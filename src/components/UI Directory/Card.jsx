import React from 'react';
import PropTypes from 'prop-types';
import { Card as MUICard, CardContent, CardHeader, CardActions, Typography } from '@mui/material';

const CustomCard = ({ title, children, footer, className, ...rest }) => {
  return (
    <MUICard className={className} {...rest}>
      {title && (
        <CardHeader
          title={<Typography variant="h6" component="div">{title}</Typography>}
        />
      )}
      <CardContent>
        {children}
      </CardContent>
      {footer && (
        <CardActions>
          {footer}
        </CardActions>
      )}
    </MUICard>
  );
};

CustomCard.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  className: PropTypes.string,
};

CustomCard.defaultProps = {
  title: null,
  footer: null,
  className: '',
};

export default CustomCard;