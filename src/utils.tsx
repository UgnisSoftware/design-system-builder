export const parseUrl = () => {
  return window.location.pathname.split('/').filter(a => a)
}

export function uuid() {
  // return ('' + 1e7 + -1e3 + -4e3 + -8e3 + -1e11).replace(/[10]/g, function() {
  return ('' + 1e7).replace(/[10]/g, function() {
    return (0 | (Math.random() * 16)).toString(16)
  })
}

export function toCamelCase(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return '' // or if (/\s+/.test(match)) for white spaces
    return match.toUpperCase()
  })
}
