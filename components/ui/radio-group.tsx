import * as React from "react"

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: string; onValueChange?: (value: string) => void; disabled?: boolean }
>(({ className, value, onValueChange, disabled, children, ...props }, ref) => {
  return (
    <div ref={ref} className={className} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, { groupValue: value, onGroupChange: onValueChange, groupDisabled: disabled })
        }
        return child
      })}
    </div>
  )
})
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  {
    className?: string;
    value?: string;
    id?: string;
    groupValue?: string;
    onGroupChange?: (value: string) => void;
    groupDisabled?: boolean;
    disabled?: boolean;
  }
>(({ className = '', value, groupValue, onGroupChange, disabled, groupDisabled, id }, ref) => {
  return (
    <input
      type="radio"
      ref={ref}
      id={id}
      className={`h-4 w-4 ${className}`}
      checked={value === groupValue}
      onChange={() => onGroupChange?.(value as string)}
      disabled={disabled || groupDisabled}
    />
  )
})
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
