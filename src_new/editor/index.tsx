import * as React from 'react';
import store from '@state';

const changeRoute = () => {
  store.evolveState({
    router: {
      path: () => 'fonts',
    },
  });
};

const Editor = () => {
  return <div onClick={changeRoute}>{store.state.router.path}</div>;
};
export default Editor;
