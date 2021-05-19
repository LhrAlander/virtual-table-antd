import React, {useState} from 'react'
import './App.css'
import VirtualTable from './components/virtualTable'

function App() {
  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      fixed: 'left',
      width: 200
    },
    {
      fixed: 'left',
      title: 'Age',
      dataIndex: 'age',
      width: 300,
      sorter: (a: any, b: any) => {
        return a.rowKey - b.rowKey
      }
    },
    {
      title: 'Address',
      dataIndex: 'address',
      width: 100,
      render: (val: any) => {
        return (
          <span style={{color: 'red'}}>{val}</span>
        )
      }
    },
    {
      title: 'Address2',
      dataIndex: 'address2',
      width: 100,
    }
  ]

  for (let i = 3; i < 9; i++) {
    columns.push({
      title: `Address${i}`,
      dataIndex: `address${i}`,
      width: 150
    })
  }

  const data = []
  for (let i = 0; i < 460; i++) {
    const s = {
      key: i,
      rowKey: i,
      name: `Edward King ${i}`,
      age: 32,
      address: `London, Park Lane no. ${i}`,
      address2: `London, Park Lane no. ${i}`,
    }
    for (let j = 3; j < 9; j++) {
      s[`address${j}`] = `London, Park Lane no. ${i} - ${j}`
    }
    data.push(s)
  }

  const [selections, setSelections] = useState<any[]>([])

  return (
    <div className="App">
      <VirtualTable
        minWidth={500}
        rowHeight={52}
        columns={columns}
        dataSource={data}
        rowKey='rowKey'
        scroll={{
          x: 1300
        }}
        rowSelection={
          {
            type: 'checkbox',
            selectedRowKeys: selections,
            fixed: true,
            columnWidth: 32,
            onChange: (selectedRowKeys, selectedRows) => {
              setSelections(selectedRowKeys)
            }
          }
        }
      />
    </div>
  )
}

export default App
