import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

// material-ui
import MuiIconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

// project imports
import getColors from 'utils/getColors';
import getShadow from 'utils/getShadow';
import { withAlpha } from 'utils/colorUtils';

function getColorStyle({ variant, theme, color }) {
  const colors = getColors(theme, color);
  const { lighter, light, dark, main, contrastText } = colors;

  const buttonShadow = `${color}Button`;
  const shadows = getShadow(theme, buttonShadow);

  const commonShadow = {
    '&::after': {
      boxShadow: `0 0 6px 6px ${withAlpha(main, 0.9)}`
    },
    '&:active::after': {
      boxShadow: `0 0 0 0 ${withAlpha(main, 0.9)}`
    },
    '&:focus-visible': {
      outline: `2px solid ${dark}`,
      outlineOffset: 2
    }
  };

  switch (variant) {
    case 'contained':
      return {
        color: contrastText,
        background: main,
        '&:hover': {
          background: dark
        },
        ...commonShadow
      };
    case 'light':
      return {
        color: main,
        background: lighter,
        '&:hover': {
          background: withAlpha(light, 0.5)
        },
        ...commonShadow
      };
    case 'shadow':
      return {
        boxShadow: shadows,
        color: contrastText,
        background: main,
        '&:hover': {
          boxShadow: 'none',
          background: dark
        },
        ...commonShadow
      };
    case 'outlined':
      return {
        '&:hover': {
          background: 'transparent',
          color: dark,
          borderColor: dark
        },
        ...commonShadow
      };
    case 'dashed':
      return {
        background: lighter,
        '&:hover': {
          color: dark,
          borderColor: dark
        },
        ...commonShadow
      };
    case 'text':
    default:
      return {
        '&:hover': {
          color: dark,
          background: color === 'secondary' ? withAlpha(light, 0.1) : lighter
        },
        ...commonShadow
      };
  }
}

const shouldForwardProp = (prop) => !['color', 'variant', 'shape'].includes(prop);

const IconButtonRoot = styled(MuiIconButton, { shouldForwardProp })(
  ({ theme, color, variant }) => ({
    position: 'relative',
    '::after': {
      content: '""',
      display: 'block',
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      opacity: 0,
      borderRadius: '4px',
      ...getColorStyle({ variant, theme, color })
    },
    '&:hover::after': {
      opacity: 0.1
    },
    '&:focus-visible': {
      outline: '2px solid #94A3B8',
      outlineOffset: 2
    },
    ...(variant === 'contained' && {
      '&:hover': {
        boxShadow: 'none',
        '&::after': {
          opacity: 0.2
        }
      }
    }),
    ...(variant === 'outlined' && {
      '&:hover': {
        borderColor: 'transparent',
        '&::after': {
          opacity: 0.2
        }
      }
    }),
    '&.Mui-disabled': {
      '&::after': {
        opacity: 0
      }
    },
    '& .MuiTouchRipple-root': {
      opacity: 0.3
    },
    '&.Mui-focusVisible': {
      '&::after': {
        opacity: 0.1
      }
    },
    '&.MuiIconButton-sizeLarge': {
      width: 40,
      height: 40,
      '& svg': {
        fontSize: '1.5rem'
      }
    },
    '&.MuiIconButton-sizeMedium': {
      width: 36,
      height: 36,
      '& svg': {
        fontSize: '1.25rem'
      }
    },
    '&.MuiIconButton-sizeSmall': {
      width: 32,
      height: 32,
      '& svg': {
        fontSize: '1rem'
      }
    },
    '&.MuiIconButton-colorInherit': {
      color: 'inherit',
      '&:hover': {
        backgroundColor: 'transparent',
        '&::after': {
          opacity: 0.1
        }
      }
    },
    '&.MuiIconButton-colorPrimary': getColorStyle({ variant, theme, color: 'primary' }),
    '&.MuiIconButton-colorSecondary': getColorStyle({ variant, theme, color: 'secondary' }),
    '&.MuiIconButton-colorSuccess': getColorStyle({ variant, theme, color: 'success' }),
    '&.MuiIconButton-colorError': getColorStyle({ variant, theme, color: 'error' }),
    '&.MuiIconButton-colorWarning': getColorStyle({ variant, theme, color: 'warning' }),
    '&.MuiIconButton-colorInfo': getColorStyle({ variant, theme, color: 'info' }),
    '&.MuiIconButton-colorDefault': getColorStyle({ variant, theme, color: 'default' }),
    variants: [
      {
        props: { variant: 'text' },
        style: {
          '&:hover': {
            backgroundColor: 'transparent',
            '&::after': {
              opacity: 0.1
            }
          },
          '&.Mui-disabled': {
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'transparent',
              color: theme.vars.palette.text.disabled
            }
          },
          '&.MuiIconButton-colorInherit': {
            color: 'inherit',
            '&:hover': {
              backgroundColor: 'transparent',
              '&::after': {
                opacity: 0.1
              }
            }
          }
        }
      },
      {
        props: { variant: 'outlined' },
        style: {
          border: '1px solid',
          borderColor: 'inherit'
        }
      },
      {
        props: ({ variant }) => variant !== 'text',
        style: {
          '&.Mui-disabled': {
            background: theme.vars.palette.grey[200],
            '&:hover': {
              background: theme.vars.palette.grey[200],
              color: theme.vars.palette.grey[300],
              borderColor: 'inherit'
            }
          }
        }
      }
    ]
  })
);

const IconButton = forwardRef(({
  children,
  color = 'primary',
  variant = 'text',
  shape = 'circular',
  size = 'medium',
  sx = {},
  ...others
}, ref) => {
  return (
    <IconButtonRoot
      ref={ref}
      variant={variant}
      color={color}
      shape={shape}
      size={size}
      sx={sx}
      {...others}
    >
      {children}
    </IconButtonRoot>
  );
});

IconButton.displayName = 'IconButton';

export default IconButton;

getColorStyle.propTypes = { variant: PropTypes.any, theme: PropTypes.any, color: PropTypes.any };

IconButton.propTypes = {
  variant: PropTypes.string,
  shape: PropTypes.string,
  children: PropTypes.node,
  color: PropTypes.string,
  ref: PropTypes.any,
  others: PropTypes.any
};
