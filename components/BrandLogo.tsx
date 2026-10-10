import Image from 'next/image'

interface BrandLogoProps {
  className?: string
  height?: number
  priority?: boolean
  variant?: 'light' | 'dark'
  width?: number
}

export default function BrandLogo({
  className,
  height = 80,
  priority = false,
  variant = 'light',
  width = 240,
}: BrandLogoProps) {
  const src = variant === 'dark'
    ? '/images/ekofreecbthub_logo_dark.svg'
    : '/images/ekofreecbthub_logo.svg'

  return (
    <Image
      src={src}
      alt="Eko Free CBT Hub"
      width={width}
      height={height}
      priority={priority}
      className={className ?? 'h-auto w-full object-contain'}
    />
  )
}