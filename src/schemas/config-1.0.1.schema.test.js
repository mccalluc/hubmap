import expect from 'expect';
import { CoordinationType } from '../app/constants';
import viewConfigSchema from './config-1.0.1.schema.json';

describe('view config schema', () => {
  describe('coordination types', () => {
    it('defines schema for all valid coordination types', () => {
      const allCoordinationTypes = Object.values(CoordinationType);
      const inCoordinationSpace = Object.keys(
        viewConfigSchema.properties.coordinationSpace.properties,
      );
      const inCoordinationScopes = Object.keys(
        viewConfigSchema.definitions.components.items.properties
          .coordinationScopes.properties,
      );

      expect(inCoordinationSpace).toEqual(expect.arrayContaining(allCoordinationTypes));
      expect(inCoordinationScopes).toEqual(expect.arrayContaining(allCoordinationTypes));
    });

    it('defines schema for only valid coordination types (does not have extra)', () => {
      const allCoordinationTypes = Object.values(CoordinationType);
      const inCoordinationSpace = Object.keys(
        viewConfigSchema.properties.coordinationSpace.properties,
      );
      const inCoordinationScopes = Object.keys(
        viewConfigSchema.definitions.components.items.properties
          .coordinationScopes.properties,
      );

      expect(allCoordinationTypes).toEqual(expect.arrayContaining(inCoordinationSpace));
      expect(allCoordinationTypes).toEqual(expect.arrayContaining(inCoordinationScopes));
    });
  });
});
