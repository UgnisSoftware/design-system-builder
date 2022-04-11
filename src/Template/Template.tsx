import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  CloseButton,
} from "@chakra-ui/react";

function Template() {
  return (
    <Box overflow="auto" height={"2000px"}>
      <Box p={8}>
        <Alert>
          <AlertIcon />
          <AlertTitle mr={2}>Hello</AlertTitle>
          <AlertDescription>Welcome</AlertDescription>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      </Box>
    </Box>
  );
}

export default Template;
