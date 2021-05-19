import {VariableSizeGrid as Grid} from 'react-window'
import ResizeObserver from 'rc-resize-observer'
import {Checkbox, Table} from 'antd'
import {CustomizeScrollBody, IVirtualTableProps} from './types'
import {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react'
import './style.css'

export default function VirtualTable<T>(props: IVirtualTableProps<T>) {
  const {
    minWidth = 100,
    rowHeight = 54,
    scroll,
    rowSelection,
  } = props

  const [dataSource, setDataSource] = useState<readonly T[]>([])
  const [displayData, setDisplayData] = useState<T[]>([])
  const [tableWidth, setTableWidth] = useState<number>(0)
  const [tableHeight, setTableHeight] = useState<number>(scroll && scroll.y ? +scroll.y || document.body.clientHeight : document.body.clientHeight)

  const scrollTopRef = useRef<number>(0)

  const gridRef = useRef<any>()
  const [connectObject] = useState<any>(() => {
    const obj = {}
    Object.defineProperty(obj, 'scrollLeft', {
      get: () => null,
      set: (scrollLeft: number) => {
        if (gridRef.current) {
          gridRef.current.scrollTo({scrollLeft})
        }
      }
    })

    return obj
  })

  const resetVirtualGrid = () => {
    if (gridRef.current) {
      gridRef.current.resetAfterIndices({
        columnIndex: 0,
        shouldForceUpdate: true
      })
    }
  }

  const columns = useMemo(() => {
    const _columns = [...(props.columns || [])]
    if (rowSelection) {
      _columns.unshift({
        width: 0,
        // width: rowSelection.columnWidth || 32,
        className: 'checkbox-th',
        fixed: 'left'
      })
    }
    const widthColumnCount = _columns.filter(({width}) => !width).length - (rowSelection ? 1 : 0)
    const alreadyWidth = _columns.map(({width}) => width || 0).reduce<number>((res, width) => res + parseInt(width as string), 0)
    const reserveWidth = tableWidth - alreadyWidth - (rowSelection && rowSelection.columnWidth ? parseInt(rowSelection.columnWidth + '') || 32 : 0)
    const autoWidth = Math.floor(reserveWidth / widthColumnCount)

    return _columns.map(c => {
      if (typeof c.width === 'number') {
        return c
      }
      return {
        ...c,
        width: autoWidth
      }
    })

  }, [props.columns, minWidth, tableWidth])

  const renderVirtualList = (rawData: readonly any[], {scrollbarSize, ref, onScroll}: any) => {
    ref.current = connectObject
    const totalHeight = rawData.length * rowHeight
    return (
      <Grid
        ref={gridRef}
        overscanColumnCount={columns.length}
        columnCount={columns.length}
        columnWidth={(index: number) => {
          if (rowSelection && index === 0) {
            return Number(rowSelection.columnWidth || '32')
          }
          const {width} = columns[index]
          return totalHeight > tableHeight && index === columns.length - 1
            ? width as number - scrollbarSize - 1
            : width as number
        }}
        height={tableHeight - 100}
        rowCount={dataSource.length}
        rowHeight={() => rowHeight}
        width={tableWidth}
        onScroll={({scrollLeft, scrollTop}) => {
          scrollTopRef.current = scrollLeft
          onScroll({scrollLeft})
        }}
      >
        {({
            columnIndex,
            rowIndex,
            style
          }: {
          columnIndex: number;
          rowIndex: number;
          style: React.CSSProperties;
        }) => {
          // 计算sticky后需要位移
          const transformY = parseInt(style.top as string) - scrollTopRef.current

          const row = rawData[rowIndex]
          const column: any = columns[columnIndex]
          const styleObj = {...style, textAlign: column.align || 'left', padding: '16px'}
          if (rowSelection && columnIndex === 0) {
            const rowKey = row[props.rowKey as string]
            return <div
              style={{
                ...styleObj,
                left: scrollTopRef.current,
                zIndex: 1
              }}
            >
              <Checkbox
                checked={rowSelection.selectedRowKeys!.includes(rowKey)}
                onChange={() => {
                  const selections = [...rowSelection!.selectedRowKeys!]
                  let newSelections: any[] = []
                  if (selections.includes(rowKey)) {
                    newSelections = selections.filter(key => key !== rowKey)
                  } else {
                    newSelections = [...selections, rowKey]
                  }
                  const selectedRows = dataSource.filter((item: any) => {
                    const key = item[props.rowKey as string]
                    return newSelections.includes(key)
                  })
                  if (rowSelection && rowSelection.onChange) {
                    rowSelection.onChange(newSelections, selectedRows)
                  }
                }}
              />
            </div>
          }
          let ele: any = null
          if (column.render) {
            ele = column.render(row[column.dataIndex], row, rowIndex)
          } else {
            ele = (rawData[rowIndex] as any)[(columns as any)[columnIndex].dataIndex]
          }

          if (column.fixed === 'left') {
            Object.assign(styleObj, {
              left: parseInt(style.left as string) + scrollTopRef.current,
              zIndex: 1
            })
          }

          return (
            <div style={{...styleObj}}>
              {ele}
            </div>
          )
        }
        }
      </Grid>
    )
  }

  useEffect(() => {
    setDataSource(props.dataSource || [])
  }, [props.dataSource])
  useEffect(() => resetVirtualGrid, [tableWidth, tableHeight])
  useEffect(() => {
    function resizeTable() {
      const viewPortHeight: number = document.body.clientHeight
      const customHeight = scroll && scroll.y ? +scroll.y || Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER
      const setHeight = viewPortHeight <= customHeight
        ? viewPortHeight
        : customHeight

      if (setHeight !== tableHeight) {
        setTableHeight(setHeight)
      }
    }

    window.addEventListener('resize', resizeTable)
    return () => window.removeEventListener('resize', resizeTable)
  }, [])

  return (
    <ResizeObserver
      onResize={({width, height}) => {
        setTableWidth(width)
      }}
    >
      <Table<any>
        {...props}
        scroll={{
          ...scroll,
          y: tableHeight - 100,
        }}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        components={{
          body: renderVirtualList
        }}
      />
    </ResizeObserver>
  )
}
