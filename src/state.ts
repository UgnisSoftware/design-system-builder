import {
  observable,
  constructObjectWithPath,
  mergeIntoObservable,
} from "@legendapp/state";

const defaultState = {
  Alert: { borderRadius: "4" },
  Button: { borderRadius: "8" },
};

export const state$ = observable(defaultState);

const history = observable({
  stack: [] as any[],
  currentIndex: 0,
});

export function trackChanges<T>(callback: () => void, incrementIndex = true) {
  let obj = {};
  const dispose = state$.onChange(({ changes }) => {
    for (let i = 0; i < changes.length; i++) {
      const { path, prevAtPath, pathTypes } = changes[i];

      // TODO track multiple changes as a single
      obj = constructObjectWithPath(path, pathTypes, prevAtPath);
    }
  });

  callback();

  const index = history.currentIndex.get();
  history.stack.set([
    ...history.stack.get().slice(0, index),
    obj,
  ]);
  history.currentIndex.set(index + 1);

  dispose();
}

export const undo = () => {
  const index = history.currentIndex.get();
  const stack = history.stack.get();
  if (index === 0) {
    return;
  }
  if (index === stack.length) {
    // save changes for redo
    trackChanges(() => {
      mergeIntoObservable(state$, stack[index - 1]);
    }, false);
  } else {
    mergeIntoObservable(state$, stack[index - 1]);
  }

  history.currentIndex.set(index - 1);
};

export const redo = () => {
  const index = history.currentIndex.get();
  const stack = history.stack.get();
  console.log(stack, index);
  if (index === stack.length) {
    return;
  }

  mergeIntoObservable(state$, stack[index + 1]);
  // remove saved stack from undo
  if (index + 2 === stack.length) {
    history.stack.set([...stack.slice(0, stack.length - 1)]);
  }

  history.currentIndex.set(index + 1);
};

// Initial
//   stack [a, a]
//   index 2
// click undo - adds current state to stack (b)
//   stack [a, a, b]
//   index 1
// click undo
//   stack [a, a, b]
//   index 0
// click redo
//   stack [a, a, b]
//   index 1
// click redo - applies and then deletes the last stack that was added in undo
//   stack [a, a]
//   index 2
