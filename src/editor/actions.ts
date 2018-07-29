import state from '@state';

export const route = (path, componentId?) => () => {
  state.evolveState({
    router: {
      path: () => path,
      componentId: () => componentId,
    },
  });
};
