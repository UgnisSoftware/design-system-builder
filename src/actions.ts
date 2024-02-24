import { state$, trackChanges } from "@/state";

export const changeAlertBorder = (border: string) => {
  trackChanges(() => {
    state$.Alert.borderRadius.set(border);
  });
};
