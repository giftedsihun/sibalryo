import React from 'react'
import { motion } from 'framer-motion'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'choice'
  color?: string
  disabled?: boolean
  className?: string
  id?: string
}

export const Button: React.FC<ButtonProps> = ({
  children, onClick, variant = 'primary', color = '#FF6B9D',
  disabled, className = '', id
}) => {
  const base = 'relative font-korean font-medium rounded-xl transition-all duration-200 select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'

  const variants = {
    primary: `px-8 py-3 text-white shadow-lg`,
    ghost: `px-6 py-2 border border-white/20 text-white/80 hover:bg-white/10`,
    choice: `w-full px-6 py-4 text-left text-white border border-white/20 hover:border-white/50 backdrop-blur-md bg-white/5 hover:bg-white/10`
  }

  return (
    <motion.button
      id={id}
      whileHover={disabled ? {} : { scale: 1.03, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
      style={variant === 'primary' ? {
        background: `linear-gradient(135deg, ${color}cc, ${color})`,
        boxShadow: `0 4px 24px ${color}44`
      } : {}}
    >
      {children}
    </motion.button>
  )
}
