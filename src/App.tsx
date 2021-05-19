import React, {useState} from 'react';
import './App.css';
import VirtualTable from './components/virtualTable';

function App() {
  const columns: any[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      fixed: 'left',
    },
    {
      title: 'Age',
      dataIndex: 'age',
      sorter: (a: any, b: any) => {
        return a.rowKey - b.rowKey;
      }
    },
    {
      title: 'Address',
      dataIndex: 'address',
      render: (val: any) => {
        return (
          <span style={{color: 'red'}}>{val}</span>
        );
      }
    }
  ];

  const data = [];
  for (let i = 0; i < 46; i++) {
    data.push({
      key: i,
      rowKey: i,
      name: `Edward King ${i}`,
      age: 32,
      address: `London, Park Lane no. ${i}`
    });
  }

  const [selections, setSelections] = useState<any[]>([]);

  return (
    <div className="App">
      <VirtualTable
        minWidth={500}
        rowHeight={52}
        columns={columns}
        dataSource={data}
        rowKey='rowKey'
        rowSelection={
          {
            type: 'checkbox',
            selectedRowKeys: selections,
            onChange: (selectedRowKeys, selectedRows) => {
              setSelections(selectedRowKeys);
            }
          }
        }
      />
    </div>
  );
}

export default App;
