import '../src/editor/state'
import {state, listen, setState, _reset} from 'lape'

const defaultState = state

// https://facebook.github.io/jest/docs/en/expect.html#content

afterEach(() => {
    _reset()
    setState(defaultState)
})

test('SetState sets the state', done => {
    done()
});