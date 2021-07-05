import { testA11y } from "../../../test-utils"
import { Button, ButtonGroup } from "../src"

it("passes a11y test", async () => {
  await testA11y(
    <ButtonGroup>
      <Button>Button 1</Button>
      <Button>Button 2</Button>
      <Button>Button 3</Button>
      <Button>Button 4</Button>
    </ButtonGroup>,
  )
})
