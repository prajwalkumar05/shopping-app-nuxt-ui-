export const buttonTheme = {
  slots: {
    base: [
      'font-medium inline-flex items-center disabled:cursor-not-allowed',
      'transition-colors'
    ],
    label: 'truncate',
    leadingIcon: 'shrink-0',
    trailingIcon: 'shrink-0'
  },
  variants: {
    size: {
      md: {
        base: 'px-2.5 py-1.5 text-sm gap-1.5',
        leadingIcon: 'size-5',
        trailingIcon: 'size-5'
      },
      lg: {
        base: 'px-3 py-2 text-sm gap-2',
        leadingIcon: 'size-5',
        trailingIcon: 'size-5'
      }
    }
  },
  compoundVariants: [
    {
      color: 'primary',
      variant: 'ghost',
      class: 'text-theme bg-primary hover:bg-primary-100 transition-colors duration-200 cursor-pointer '
    }
  ],
  defaultVariants: {
    color: 'primary',
    variant: 'ghost',
    size: 'md'
  }
}