function interceptClickEvent(e) {
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.defaultPrevented) {
    return true
  }
  let anchor
  for (let n = e.target; n.parentNode; n = n.parentNode) {
    if (n.nodeName === 'A' && e.target.getAttribute('target') !== '_blank') {
      anchor = n
      break
    }
  }
  if (!anchor) return true

  // e.preventDefault()
  // const href = e.target.getAttribute('href')
  // console.log(href)
}

document.addEventListener('click', interceptClickEvent)
