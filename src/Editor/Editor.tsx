import { Box, Flex, Text, useTheme } from "@chakra-ui/react";

export const SIDEBAR_SIZE = 580;

function Editor() {
  return (
    <Flex p={4} w={SIDEBAR_SIZE} position="fixed" right={0} top={0} bottom={0}>
      <Box flex={1} height="100%" shadow="lg" bg="gray.50" borderRadius="sm">
        <Box bg="gray.100" p={4}>
          <Text fontSize="lg" fontWeight="semibold">
            Alert
          </Text>
        </Box>
        <Box p={4}>hello world</Box>
      </Box>
    </Flex>
  );
}

export default Editor;
