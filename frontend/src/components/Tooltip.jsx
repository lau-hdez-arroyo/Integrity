import React from 'react';
import {
  Tooltip as MuiTooltip,
  TooltipProps,
  styled,
} from '@mui/material';

/**
 * Advanced Tooltip Component
 * Enhanced MUI Tooltip with custom styling
 */
const StyledTooltip = styled(({ className, ...props }) => (
  <MuiTooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  '& .MuiTooltip-tooltip': {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: '0.875rem',
    padding: '8px 12px',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    fontWeight: 500,
    maxWidth: '300px',
    wordWrap: 'break-word',
  },
  '& .MuiTooltip-arrow': {
    color: '#0f172a',
  },
}));

export default function Tooltip({
  title,
  children,
  placement = 'top',
  arrow = true,
  enterDelay = 200,
  leaveDelay = 0,
  onClick,
}) {
  return (
    <StyledTooltip
      title={title}
      placement={placement}
      arrow={arrow}
      enterDelay={enterDelay}
      leaveDelay={leaveDelay}
    >
      <span onClick={onClick}>{children}</span>
    </StyledTooltip>
  );
}
