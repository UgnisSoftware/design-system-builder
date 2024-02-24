import { state$ } from "@/state";

export const changeAlertBorder = (border: string) => {
  state$.Alert.borderRadius.set(border);
};
