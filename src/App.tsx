import { Box, ChakraProvider, extendTheme, Flex } from "@chakra-ui/react";
import Template from "@/Template/Template";
import Editor, { SIDEBAR_SIZE } from "@/Editor/Editor";

const theme = extendTheme({
  components: {
    Alert: {
      baseStyle: {
        container: {
          borderRadius: "lg",
        },
      },
    },
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
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
