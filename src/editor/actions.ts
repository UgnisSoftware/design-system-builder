import state from '@state';

export const route = (path, componentId?) => () => {
  state.router.path = path;
  state.router.componentId = componentId;
};
