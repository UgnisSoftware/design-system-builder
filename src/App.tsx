import { Box, ChakraProvider, extendTheme, Flex } from "@chakra-ui/react";
import Template from "@/Template/Template";
import Editor, { SIDEBAR_SIZE } from "@/Editor/Editor";
import React from "react";
import { state } from "@/state";
import { lapeSyncInternalUseState } from "lape";

function App() {
  lapeSyncInternalUseState();

  const customTheme = extendTheme({
    components: {
      Alert: {
        baseStyle: {
          container: {
            ...state.Alert,
          },
        },
      },
    },
  });

  return (
    <ChakraProvider theme={customTheme}>
      <Flex minHeight={"100vh"} overflow="hidden">
        <Box flex="1" pr={SIDEBAR_SIZE}>
          <Template />
        </Box>
        <Editor />
      </Flex>
    </ChakraProvider>
  );
}

export default App;
