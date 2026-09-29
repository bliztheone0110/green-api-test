import type { SVGProps } from 'react'

const paths = {
  chat: 'M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-2 2V11.5a9.5 9.5 0 0 1 19 0ZM7 10h8M7 14h5',
  plus: 'M12 5v14M5 12h14',
  search: 'm21 21-4.4-4.4M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  send: 'm22 2-7 20-4-9-9-4 20-7ZM22 2 11 13',
  back: 'm14 6-6 6 6 6',
  close: 'm6 6 12 12M6 18 18 6',
  logout: 'M9 4H4v16h5M10 12h11m-4-4 4 4-4 4',
  check: 'm5 12 4 4L19 6',
  lock: 'M6 10h12v11H6V10Zm3 0V6a3 3 0 0 1 6 0v4',
  arrow: 'M4 12h16m-6-6 6 6-6 6',
} as const

export type IconName = keyof typeof paths

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  )
}
