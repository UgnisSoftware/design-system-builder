import faker from "faker"
import { useState } from "react"
import { Table } from "../src"
import { useLape } from "lape"
import type { Column } from "react-data-grid"

interface Data {
  id: string
  email: string
  title: string
  name: string
  street: string
  zipCode: string
  date: string
  catchPhrase: string
  companyName: string
  words: string
  sentence: string
}

faker.locale = "en_GB"

const columns: Column<Data>[] = [
  {
    key: "name",
    name: "Name",
    width: 200,
  },
  {
    key: "email",
    name: "Email",
    width: 200,
  },
  {
    key: "street",
    name: "Street",
    width: 200,
  },
  {
    key: "zipCode",
    name: "ZipCode",
    width: 200,
  },
  {
    key: "date",
    name: "Date",
    width: 200,
  },
  {
    key: "catchPhrase",
    name: "Catch Phrase",
    width: 200,
  },
  {
    key: "companyName",
    name: "Company Name",
    width: 200,
  },
  {
    key: "sentence",
    name: "Sentence",
    width: 200,
  },
]

function createFakeRowObjectData(index: number): Data {
  return {
    id: `id_${index}`,
    email: faker.internet.email(),
    title: faker.name.prefix(),
    name: faker.name.firstName() + " " + faker.name.lastName(),
    street: faker.address.streetName(),
    zipCode: faker.address.zipCode(),
    date: faker.date.past().toLocaleDateString(),
    catchPhrase: faker.company.catchPhrase(),
    companyName: faker.company.companyName(),
    words: faker.lorem.words(),
    sentence: faker.lorem.sentence(),
  }
}

function createRows(numberOfRows: number): Data[] {
  const rows: Data[] = []

  for (let i = 0; i < numberOfRows; i++) {
    rows[i] = createFakeRowObjectData(i)
  }

  return rows
}

export const Borderless = () => {
  const [data, setData] = useState(() => createRows(200))

  return <Table columns={columns} rows={data} />
}
export const FewRows = () => {
  const [data, setData] = useState(() => createRows(3))

  return <Table columns={columns} rows={data} />
}

export const OnRowClick = () => {
  const [data, setData] = useState(() => createRows(200))

  return <Table columns={columns} rows={data} onRowClick={(data) => alert(JSON.stringify(data))} />
}

export const WithSurroundingContent = () => {
  const [data, setData] = useState(() => createRows(200))
  const state = useLape({ count: 0 })

  return (
    <div>
      Hello
      <button
        type="button"
        onClick={() => {
          state.count++
        }}
      >
        {state.count}
      </button>
      <Table columns={columns} rows={data} />
    </div>
  )
}

export const Empty = () => {
  return <Table columns={columns} rows={[]} />
}
