import React from 'react';
import NativeSelect from '@material-ui/core/NativeSelect';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { capitalize } from '../../utils';
import { useStyles } from './styles';

export default function CellColorEncodingOption(props) {
  const {
    observationsLabel,
    cellColorEncoding,
    setCellColorEncoding,
  } = props;

  const classes = useStyles();

  const observationsLabelNice = capitalize(observationsLabel);

  function handleColorEncodingChange(event) {
    setCellColorEncoding(event.target.value);
  }

  return (
    <TableRow>
      <TableCell className={classes.labelCell} htmlFor="cell-color-encoding-select">
        {observationsLabelNice} Color Encoding
      </TableCell>
      <TableCell className={classes.inputCell}>
        <NativeSelect
          className={classes.select}
          value={cellColorEncoding}
          onChange={handleColorEncodingChange}
          inputProps={{
            id: 'cell-color-encoding-select',
          }}
        >
          <option value="cellSetSelection">Cell Sets</option>
          <option value="geneSelection">Gene Expression</option>
        </NativeSelect>
      </TableCell>
    </TableRow>
  );
}
