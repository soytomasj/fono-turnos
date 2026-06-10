const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const Svg = ({ size = 20, children, ...props }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...base} {...props}>
    {children}
  </svg>
)

export const IconCalendar = (p) => (
  <Svg {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
    <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" />
  </Svg>
)

export const IconUsers = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="8.5" r="3.2" />
    <path d="M3.5 19.5c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8" />
    <path d="M15.5 5.7a3.2 3.2 0 0 1 0 5.6M17.6 14.9c1.6.7 2.6 2.3 3 4.6" />
  </Svg>
)

export const IconReceipt = (p) => (
  <Svg {...p}>
    <path d="M6 3.5h12v17l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4z" />
    <path d="M9 8.5h6M9 12h6M9 15.5h3.5" />
  </Svg>
)

export const IconCheck = (p) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
)

export const IconSlash = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M6.2 17.8L17.8 6.2" />
  </Svg>
)

export const IconPlus = (p) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)

export const IconChevronLeft = (p) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M14.5 5.5L8 12l6.5 6.5" />
  </Svg>
)

export const IconChevronRight = (p) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M9.5 5.5L16 12l-6.5 6.5" />
  </Svg>
)

export const IconShare = (p) => (
  <Svg {...p}>
    <path d="M12 3.5v10.5M8.5 6.5L12 3l3.5 3.5" />
    <path d="M8 10.5H6.5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H16" />
  </Svg>
)

export const IconCopy = (p) => (
  <Svg {...p}>
    <rect x="8.5" y="8.5" width="12" height="12" rx="2.5" />
    <path d="M15.5 5.5v-.5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h.5" />
  </Svg>
)

export const IconPencil = (p) => (
  <Svg {...p}>
    <path d="M4 20l.9-3.4L15.6 5.9a2.1 2.1 0 0 1 3-.1l-.4-.3a2.1 2.1 0 0 1 0 3L7.4 19.1 4 20z" />
    <path d="M13.6 8l2.9 2.9" />
  </Svg>
)

export const IconClock = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
)

export const IconX = (p) => (
  <Svg strokeWidth={2} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
)

/* marcas "a mano", estilo tilde de cuaderno */
export const MarcaCheck = (p) => (
  <Svg strokeWidth={2.6} {...p}>
    <path d="M4.5 13.5c1.9 1 3.2 2.5 4 4.4C10.2 13 13.8 8 19.5 4.5" />
  </Svg>
)

export const MarcaCruz = (p) => (
  <Svg strokeWidth={2.4} {...p}>
    <path d="M6 5.5c3.3 3.8 6.7 7.8 11.5 13" />
    <path d="M18.5 5C14 9.6 9.8 14 5.5 18.5" />
  </Svg>
)

export const MarcaOnda = (p) => (
  <Svg strokeWidth={2.2} {...p}>
    <path d="M3.5 13.5c1.6-2.6 3.4-3.4 4.4-2s-.6 4.4 1.2 4.8 3.4-1.8 4.4-3.8 2.8-2.6 3.8-1.2.6 3.2 2.2 3.4" />
  </Svg>
)
