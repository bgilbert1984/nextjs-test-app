// components/components.tsx
import React from 'react';
import { useSlate } from 'slate-react';

export const Button = React.forwardRef<
  HTMLButtonElement,
  {
    active: boolean;
    reversed?: boolean;
    [key: string]: any;
  }
>(
  (
    {
      active,
      reversed,
      ...props
    },
    ref
  ) => (
    <span
      {...props}
      ref={ref}
      className='slateButton' //Add your classnames here.
    />
  )
)
Button.displayName = 'Button';

export const Icon = React.forwardRef<
HTMLElement,
{
    [key: string]: any;
}
>(
    (
    {
        ...props
    },
    ref
    ) => (
        <span
        {...props}
        ref={ref}
        />
    )
)
Icon.displayName = 'Icon';

// This just renders the children, with no wrapper.
export const Toolbar = React.forwardRef<
  HTMLDivElement,
  {
    [key: string]: any;
  }
    >(({ ...props }, ref) => <div {...props} ref={ref} className="toolbar" />); // Add the "toolbar" className
Toolbar.displayName = 'Toolbar';