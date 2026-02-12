/**
 * ClassName Utility (cn)
 * Conditionally join classNames together
 * Lightweight alternative to clsx/classnames
 */

/**
 * Merge multiple className strings, filtering out falsy values
 * @param {...(string|boolean|null|undefined)} classes - Class names or conditional expressions
 * @returns {string} - Merged className string
 * 
 * @example
 * cn('base-class', isActive && 'active', 'another-class')
 * // Returns: 'base-class active another-class' (if isActive is true)
 * 
 * @example
 * cn(
 *   'bg-white dark:bg-gray-900',
 *   isError ? 'border-red-500' : 'border-gray-200',
 *   disabled && 'opacity-50 cursor-not-allowed'
 * )
 */
export function cn(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default cn
