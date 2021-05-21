import {VariableSizeGrid as Grid} from 'react-window';
import {VariableSizeList as List} from 'react-window';
import ResizeObserver from 'rc-resize-observer';
import {Checkbox, Table, TableProps} from 'antd';
import {CustomizeScrollBody, IVirtualTableProps} from './types';
import {CSSProperties, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import './style.css';
import * as React from 'react';
import {ColumnProps} from 'antd/es/table';

const ListRow = React.memo((props: {
  style: CSSProperties;
  columns: ColumnProps<any>[];
  data: any;
  rowWidth: number;
  rowSelection: TableProps<any>['rowSelection'];
  rowKey: string;
  dataSource: any[];
}) => {
  const {
    style,
    data,
    columns,
    rowWidth,
    rowSelection,
    rowKey,
    dataSource
  } = props;

  const wrapStyle: CSSProperties = {
    ...style,
    display: 'flex',
    width: rowWidth
  };

  return (
    <div
      style={wrapStyle}
      className='hello'
    >
      {
        columns.map((column, index) => {
          const itemStyle: CSSProperties = {
            width: column.width!,
            height: style.height,
            background: 'white',
            flexShrink: 0,
            flexGrow: 1
          };

          if (column.fixed === 'left') {
            Object.assign(itemStyle, {
              position: 'sticky',
              zIndex: 1,
              left: columns.slice(0, index).reduce<number>((l, item) => {
                return l + parseInt(item.width! + '');
              }, 0)
            });
          }

          if (column.type === 'select') {
            return <div style={itemStyle}>
              <Checkbox
                checked={rowSelection.selectedRowKeys.includes(data[rowKey])}
                onChange={e => {
                  let keys = [...rowSelection.selectedRowKeys];
                  const key = data[rowKey];
                  if (keys.includes(key)) {
                    keys = keys.filter(_ => _ !== key);
                  } else {
                    keys = [...keys, key];
                  }
                  rowSelection.onChange(keys, dataSource.map(item => {
                    return keys.includes(item[rowKey]);
                  }));
                }}
              />
            </div>;
          }

          return (
            <div
              style={itemStyle}
              key={column.dataIndex}
            >
              {
                column.render ? column.render(data[column.dataIndex], data, index) : <div>{data[column.dataIndex]}</div>
              }
            </div>
          );
        })
      }
    </div>
  );
});


export default function VirtualTable<T>(props: IVirtualTableProps<T>) {
  const {
    minWidth = 100,
    rowHeight = 54,
    scroll,
    rowSelection
  } = props;

  const [dataSource, setDataSource] = useState<readonly T[]>([]);
  const [displayData, setDisplayData] = useState<T[]>([]);
  const [tableWidth, setTableWidth] = useState<number>(0);
  const [tableHeight, setTableHeight] = useState<number>(scroll && scroll.y ? +scroll.y || document.body.clientHeight : document.body.clientHeight);

  const trRef = useRef<HTMLElement>(null);

  const gridRef = useRef<any>();
  const bodyRef = useRef<any>();
  const [connectObject] = useState<any>(() => {
    const obj = {};
    Object.defineProperty(obj, 'scrollLeft', {
      get: () => null,
      set: (scrollLeft: number) => {
        if (gridRef.current) {
          gridRef.current.scrollTo({scrollLeft});
        }
      }
    });

    return obj;
  });

  const columns = useMemo(() => {
    const _columns = [...(props.columns || [])];
    if (rowSelection) {
      _columns.unshift({
        fixed: 'left',
        type: 'select',
        width: rowSelection.columnWidth || 32,
        title: <Checkbox
          indeterminate={
            rowSelection.selectedRowKeys.length !== dataSource.length && rowSelection.selectedRowKeys.length > 0
          }
          checked={rowSelection.selectedRowKeys.length === dataSource.length && rowSelection.selectedRowKeys.length > 0}
          onChange={e => {
            const checked = e.target.checked;
            if (!checked) {
              rowSelection.onChange([], []);
            } else {
              rowSelection.onChange(dataSource.map((item) => item[props.rowKey]), dataSource);
            }
          }
          }
        />
      });
    }
    const widthColumnCount = _columns.filter(({width}) => !width).length - (rowSelection ? 1 : 0);
    const alreadyWidth = _columns.map(({width}) => width || 0)
      .reduce<number>((res, width) => res + parseInt(width as string), 0);
    const reserveWidth = tableWidth - alreadyWidth - (rowSelection && rowSelection.columnWidth ? parseInt(rowSelection.columnWidth + '') || 32 : 0);
    const autoWidth = Math.floor(reserveWidth / widthColumnCount);

    return _columns.map(c => {
      if (typeof c.width === 'number') {
        return c;
      }
      return {
        ...c,
        width: autoWidth
      };
    });

  }, [props.columns, minWidth, tableWidth]);

  const Wrapper = props => {
    useLayoutEffect(() => {
      const handleScroll = e => {
        const left = e.target.scrollLeft;
        if (bodyRef.current.scrollLeft === left) {
          return;
        }
        bodyRef.current.scrollLeft = left;
      };

      trRef.current.addEventListener('scroll', handleScroll);
      return () => {
        trRef.current.removeEventListener('scroll', handleScroll);
      };
    }, []);
    return <thead
      className='hello-wrapper ant-table-thead'

      ref={el => {
        if (el) {
          trRef.current = el.parentElement.parentElement;
        }
      }}
    >
    {
      props.children
    }
    </thead>;
  };

  const HeaderRow = props => {
    const styleObj: CSSProperties = {
      display: 'flex',
      width: scroll.x > tableWidth ? scroll.x : tableWidth
    };

    return <tr
      className='hello-row'
      style={styleObj}
    >
      {props.children.map((item, index) => {
        const column = columns.find(({dataIndex}) => dataIndex === item.props.column.dataIndex);
        const columnStyle: CSSProperties = {
          width: column.width,
          flexShrink: 0,
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box'
        };
        if (column.fixed === 'left') {
          Object.assign(columnStyle, {
            position: 'sticky',
            zIndex: 1,
            left: columns.slice(0, index).reduce<number>((l, item) => {
              return l + parseInt(item.width! + '');
            }, 0)
          });
        }
        return <th
          style={columnStyle}
          className='ant-table-cell'
        >{column.title}</th>;
      })}
    </tr>;
  };

  const renderVirtualRows = (rawData, {scrollbarSize, ref, onScroll}: any) => {
    ref.current = connectObject;
    if (!rawData.length) {
      return null;
    }

    return (
      <List
        itemSize={() => rowHeight}
        height={tableHeight}
        itemCount={rawData.length}
        width={tableWidth}
        outerRef={bodyRef}
      >
        {
          ({index, style}) => {
            return <ListRow
              style={style}
              columns={columns}
              data={rawData[index]}
              key={index}
              rowSelection={rowSelection}
              dataSource={dataSource}
              rowKey={props.rowKey}
              rowWidth={scroll.x > tableWidth ? scroll.x : tableWidth}
            />;
          }
        }
      </List>
    );
  };

  useLayoutEffect(() => {
    if (!bodyRef.current || bodyRef.current.hasScrollListener) {
      return;
    }

    bodyRef.current.addEventListener('scroll', e => {
      const left = e.target.scrollLeft;
      if (trRef.current.scrollLeft !== left) {
        trRef.current.scrollLeft = left;
      }
    });
    bodyRef.current.hasScrollListener = true;
  });

  useEffect(() => {
    setDataSource(props.dataSource || []);
  }, [props.dataSource]);

  useEffect(() => {
    function resizeTable() {
      const viewPortHeight: number = document.body.clientHeight;
      const customHeight = scroll && scroll.y ? +scroll.y || Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
      const setHeight = viewPortHeight <= customHeight
        ? viewPortHeight
        : customHeight;

      if (setHeight !== tableHeight) {
        setTableHeight(setHeight);
      }
    }

    window.addEventListener('resize', resizeTable);
    return () => window.removeEventListener('resize', resizeTable);
  }, []);

  return (
    <ResizeObserver
      onResize={({width, height}) => {
        setTableWidth(width);
      }}
    >
      <Table<any>
        {...props}
        scroll={{
          ...scroll,
          y: tableHeight - 100
        }}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        components={{
          body: renderVirtualRows,
          header: {
            wrapper: Wrapper,
            row: HeaderRow
          }
        }}
        rowSelection={undefined}
      />
    </ResizeObserver>
  );
}
