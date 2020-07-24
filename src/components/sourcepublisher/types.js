import {
  CELLS_ADD, EXPRESSION_MATRIX_ADD, FACTORS_ADD, MOLECULES_ADD, NEIGHBORHOODS_ADD,
  RASTER_ADD, CELL_SETS_ADD,
} from '../../events';

export const typeToEvent = {
  CELLS: CELLS_ADD,
  FACTORS: FACTORS_ADD,
  MOLECULES: MOLECULES_ADD,
  NEIGHBORHOODS: NEIGHBORHOODS_ADD,
  RASTER: RASTER_ADD,
  'CELL-SETS': CELL_SETS_ADD,
  'EXPRESSION-MATRIX': EXPRESSION_MATRIX_ADD,
};