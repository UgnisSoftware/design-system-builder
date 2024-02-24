import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  CloseButton,
  Flex,
  Icon,
  IconButton,
  Input,
  Text,
} from "@chakra-ui/react";
import { changeAlertBorder } from "@/actions";
import { CgUndo, CgRedo } from "react-icons/cg";
import { redo, state$, undo } from "@/state";
import { useSelector } from "@legendapp/state/react";

export const SIDEBAR_SIZE = 580;

function Editor() {
  const state = useSelector(state$);

  return (
    <Flex p={4} w={SIDEBAR_SIZE} position="fixed" right={0} top={0} bottom={0}>
      <Box flex={1} height="100%" shadow="lg" bg="gray.50" borderRadius="sm">
        <Flex bg="gray.100" p={4} alignItems="center">
          <Text fontSize="lg" fontWeight="semibold">
            Alert
          </Text>
          <IconButton
            aria-label="undo"
            icon={<Icon as={CgUndo} />}
            onClick={() => undo()}
          />
          <IconButton
            aria-label="redo"
            icon={<Icon as={CgRedo} />}
            onClick={() => redo()}
          />
        </Flex>
        <Flex gap="16px" flexDirection="column" p={4}>
          <Alert>
            <AlertIcon />
            <AlertTitle mr={2}>Hello</AlertTitle>
            <AlertDescription>Welcome</AlertDescription>
            <CloseButton position="absolute" right="8px" top="8px" />
          </Alert>
          Border Radius
          <Input
            p={4}
            onChange={(e) => {
              changeAlertBorder(e.target.value);
            }}
            value={state.Alert.borderRadius}
          />
        </Flex>
      </Box>
    </Flex>
  );
}

export default Editor;
