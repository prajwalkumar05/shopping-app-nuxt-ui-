export const paginationTheme = {

  variants: {
    color: {
      primary: '',
      custom: ''
    },
    variant: {
      solid: '',
      outline: ''
    },
    size: {
      sm: {
        first: 'w-8 h-8 text-sm',
        prev: 'w-8 h-8 text-sm',
        item: 'w-8 h-8 text-sm',
        next: 'w-8 h-8 text-sm',
        last: 'w-8 h-8 text-sm',
        label: 'text-md'
      },
      md: {
        first: 'w-10 h-10 text-sm',
        prev: 'w-10 h-10 text-sm',
        item: 'w-10 h-10 text-sm',
        next: 'w-10 h-10 text-sm',
        last: 'w-10 h-10 text-sm',
        label: 'text-sm'
      }
    }
  },
  compoundVariants: [
    {
      color: 'primary',
      variant: 'outline',
      class: {
        first: 'bg-transparent text-secondary hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed border border-gray-300 rounded-md transition-colors duration-200',
        prev: 'bg-transparent text-gray-600 hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed border border-gray-300 rounded-md transition-colors duration-200',
        item: 'bg-white text-gray-600 hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed border border-gray-300 rounded-md transition-colors duration-200 [&[aria-current=page]]:bg-primary [&[aria-current=page]]:text-white cursor-pointer',
        next: 'bg-transparent text-gray-600 hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed border border-gray-300 rounded-md transition-colors duration-200',
        last: 'bg-transparent text-secondary  hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed border border-gray-300 rounded-md transition-colors duration-200'
      }
    },
  ],
  defaultVariants: {
    color: 'primary',
    variant: 'outline',
    size: 'sm'
  }
}