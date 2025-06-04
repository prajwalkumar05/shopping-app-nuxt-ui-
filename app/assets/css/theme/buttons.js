export const buttonTheme = {
  slots: {
    base: [
      "font-medium inline-flex items-center disabled:cursor-not-allowed ",
      "transition-all duration-300 transform hover:scale-101",
    ],
    label: "truncate",
    leadingIcon: "shrink-0",
    trailingIcon: "shrink-0",
  },
  variants: {
    size: {
      md: {
        base: "px-2.5 py-1.5 text-sm gap-1.5",
        leadingIcon: "size-5",
        trailingIcon: "size-5",
      },
      lg: {
        base: "px-3 py-2 text-sm gap-2",
        leadingIcon: "size-5",
        trailingIcon: "size-5",
      },
    },
  },
  compoundVariants: [
    {
      color: "primary",
      variant: "ghost",
      class:
        "text-white bg-theme transition-colors duration-200 rounded-lg",
    },
    {
      color: "success",
      variant: "outline",
      class:
        "text-green-600 border-green-500 hover:bg-green-50 disabled:text-green-300 disabled:border-green-300 mx-2",
    },
    {
      color: "error",
      variant: "solid",
      class: "text-white bg-error hover:bg-red-700 disabled:bg-red-400",
    },
  ],
  defaultVariants: {
    color: "primary",
    variant: "ghost",
    size: "md",
  },
};
