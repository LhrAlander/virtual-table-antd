import {TableProps} from 'antd/es/table';
import {TableProps as RcTableProps} from 'rc-table/lib/Table';
import {
  ColumnsType,
  FilterValue, GetPopupContainer,
  SorterResult, SortOrder,
  TableCurrentDataSource,
  TableLocale,
  TablePaginationConfig, TableRowSelection
} from 'antd/es/table/interface';
import {SpinProps} from 'antd/es/spin';
import {SizeType} from 'antd/es/config-provider/SizeContext';
import {TooltipProps} from 'antd/es/tooltip';
import * as React from 'react';

export declare type CustomizeScrollBody<RecordType> = (data: readonly RecordType[], info: {
  scrollbarSize: number;
  ref: React.Ref<{
    scrollLeft: number;
  }>;
  onScroll: (info: {
    currentTarget?: HTMLElement;
    scrollLeft?: number;
  }) => void;
}) => React.ReactNode;

export interface IVirtualTableProps<RecordType> extends Omit<RcTableProps<RecordType>, 'transformColumns' | 'internalHooks' | 'internalRefs' | 'data' | 'columns' | 'scroll' | 'emptyText'> {
  // ant-design table props
  dropdownPrefixCls?: string;
  dataSource?: RcTableProps<RecordType>['data'];
  columns?: ColumnsType<RecordType>;
  pagination?: false | TablePaginationConfig;
  loading?: boolean | SpinProps;
  size?: SizeType;
  bordered?: boolean;
  locale?: TableLocale;
  onChange?: (pagination: TablePaginationConfig, filters: Record<string, FilterValue | null>, sorter: SorterResult<RecordType> | SorterResult<RecordType>[], extra: TableCurrentDataSource<RecordType>) => void;
  rowSelection?: TableRowSelection<RecordType>;
  getPopupContainer?: GetPopupContainer;
  scroll?: RcTableProps<RecordType>['scroll'] & {
    scrollToFirstRowOnChange?: boolean;
  };
  sortDirections?: SortOrder[];
  showSorterTooltip?: boolean | TooltipProps;

  // custom options
  minWidth: number;
  rowHeight: number;
}
