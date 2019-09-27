import { proxify } from 'lape'

/*
XS @media all and (max-width: 479px) { ... }
S  @media all and (max-width: 767px) { ... }
M  @media all and (max-width: 991px) { ... }
L  @media all and (max-width: 1199px) { ... }
XL @media all and (max-width: 1800px) { ... }
 */

interface Window {
  size: 'XS' | 'S' | 'M' | 'L' | 'XL'
  width: number
  height: number
}

const calculateSize = () => {
  if (window.innerWidth <= 479) {
    return 'XS'
  }
  if (window.innerWidth <= 767) {
    return 'S'
  }
  if (window.innerWidth <= 991) {
    return 'M'
  }
  if (window.innerWidth <= 1199) {
    return 'L'
  }
  if (window.innerWidth <= 1199) {
    return 'XS'
  }
}

const screen: Window = proxify({
  size: calculateSize(),
  width: window.innerWidth,
  height: window.innerHeight,
})

window.addEventListener('resize', () => {
  screen.size = calculateSize()
  screen.width = window.innerWidth
  screen.height = window.innerHeight
})

export default screen
