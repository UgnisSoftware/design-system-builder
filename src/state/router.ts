import { lape } from 'lape'
import { compile, pathToRegexp } from 'path-to-regexp'
import stateUi from '@state/ui'

export interface Router {
  url: string
  query: string
}

const router: Router = lape({
  url: window.location.pathname,
  query: window.location.search,
})

export const paths = {
  homepage: '/',
  docs: '/docs',
  color: '/colors',
  font: '/fonts',
  export: '/export',
  assets: '/assets',
  element: '/component/:componentId',
}

export const navigate = (url) => {
  stateUi.selectedNode = null
  stateUi.stateManager = null
  router.url = url
  history.pushState(null, '', url)
}

export const matches = (path) => {
  return pathToRegexp(path).test(router.url)
}

export const pathToUrl = (path, params?) => {
  return compile(path)(params)
}

export const pathToParams = (path) => {
  let keys = []
  const regexp = pathToRegexp(path, keys)
  const match = regexp.exec(router.url)
  if (!match) {
    return {}
  }
  const [_, ...values] = match
  return keys.reduce((acc, key, index) => {
    acc[key.name] = values[index]
    return acc
  }, {})
}

export default router

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

  e.preventDefault()
  const href = anchor.getAttribute('href')
  navigate(href)
}

document.addEventListener('click', interceptClickEvent)
