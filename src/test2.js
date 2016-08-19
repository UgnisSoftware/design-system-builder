const render = (id, dom) => {
    document.getElementById(id).innerHTML = dom
}

const state = (state, action) => {
    abc: 'abcd'
}

const dom = (state) =>
   '<div onclick="">' + state.abc + '</div>'
