import { recordUndo } from "lape";
import { state } from "@/state";

export const changeAlertBorder = (border: string) => {
  recordUndo(() => {
    state.Alert.borderRadius = border;
  });
};
