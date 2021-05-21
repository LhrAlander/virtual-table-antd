import React, {useState} from 'react';
import {CaretDownFilled, CaretUpFilled} from '@ant-design/icons';

export enum SortEnum {
  ASC,
  DESC,
  NORMAL
}

function HeadSorter(props: {
  onSort: Function;
  sortState: SortEnum
}) {
  const {
    sortState: state
  } = props;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column'
      }}
      onClick={() => {
        const status = state === SortEnum.ASC
          ? SortEnum.DESC
          : state === SortEnum.DESC
            ? SortEnum.NORMAL
            : SortEnum.ASC;
        if (props.onSort) {
          props.onSort(status);
        }
      }}
    >
      <CaretUpFilled style={{color: state === SortEnum.ASC ? '#1890ff' : '#bfbfbf', fontSize: 12}}/>
      <CaretDownFilled
        style={{
          color: state === SortEnum.DESC ? '#1890ff' : '#bfbfbf',
          fontSize: 12,
          marginTop: '-.3em'
        }}
      />
    </div>
  );
}

export default React.memo(HeadSorter, () => true)