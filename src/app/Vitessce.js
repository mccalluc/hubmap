/* eslint-disable camelcase */
import React, { useEffect, useMemo } from 'react';
import Ajv from 'ajv';
import {
  ThemeProvider, StylesProvider,
  createGenerateClassName,
} from '@material-ui/core/styles';
import isEqual from 'lodash/isEqual';
import packageJson from '../../package.json';
import { muiTheme } from '../components/shared-mui/styles';
import configSchema from '../schemas/config-1.0.2.schema.json';
import configSchema1_0_1 from '../schemas/config-1.0.1.schema.json';
import configSchema1_0_0 from '../schemas/config-1.0.0.schema.json';
import configSchema0_1_0 from '../schemas/config-0.1.0.schema.json';
import cellSetsSchema from '../schemas/cell-sets.schema.json';
import rasterSchema from '../schemas/raster.schema.json';

import VitessceGrid from './VitessceGrid';
import Warning from './Warning';
import CallbackPublisher from './CallbackPublisher';
import { getComponent } from './component-registry';
import { initialize, upgrade } from './view-config-utils';

const generateClassName = createGenerateClassName({
  disableGlobal: true,
});

/**
 * The Vitessce component.
 * @param {object} props
 * @param {object} props.config A Vitessce view config.
 * If the config is valid, the VitessceGrid will be rendered as a child.
 * If the config is invalid, a Warning will be rendered instead.
 * @param {number} props.rowHeight Row height for grid layout. Optional.
 * @param {number} props.height Total height for grid layout. Optional.
 * @param {string} props.theme The theme, used for styling as
 * light or dark. Optional. By default, "dark"
 * @param {function} props.onWarn A callback for warning messages. Optional.
 * @param {function} props.onConfigChange A callback for view config
 * updates. Optional.
 * @param {function} props.onLoaderChange A callback for loader
 * updates. Optional.
 * @param {boolean} props.validateOnConfigChange Whether to validate
 * against the view config schema when publishing changes. Use for debugging
 * purposes, as this may have a performance impact. By default, false.
 */
export default function Vitessce(props) {
  const {
    config,
    rowHeight,
    height,
    theme,
    onWarn,
    onConfigChange,
    onLoaderChange,
    validateOnConfigChange = false,
  } = props;

  // Process the view config and memoize the result:
  // - Validate.
  // - Upgrade, if legacy schema.
  // - Validate after upgrade, if legacy schema.
  // - Initialize (based on initStrategy).
  const [configOrWarning, success] = useMemo(() => {
    // If the config value is undefined, show a warning message.
    if (!config) {
      return [{
        title: 'No such dataset',
        unformatted: 'The dataset configuration could not be found.',
      }, false];
    }
    // If the view config is missing a version, show a warning message.
    if (!config.version) {
      return [{
        title: 'Missing version',
        unformatted: 'The dataset configuration is missing a version, preventing validation.',
      }, false];
    }
    // Check if this is a "legacy" view config.
    let upgradedConfig = config;
    if (upgradedConfig.version === '0.1.0') {
      // Validate under the legacy schema first.
      const validateLegacy = new Ajv().compile(configSchema0_1_0);
      const validLegacy = validateLegacy(upgradedConfig);
      if (!validLegacy) {
        const failureReason = JSON.stringify(validateLegacy.errors, null, 2);
        return [{
          title: 'Config validation failed',
          preformatted: failureReason,
        }, false];
      }
      // Upgrade from v0.1.0 to v1.0.1 before v1.0.1 schema validation.
      upgradedConfig = upgrade('0.1.0', upgradedConfig);
    }
    if (upgradedConfig.version === '1.0.0') {
      // Validate under the legacy schema first.
      const validateLegacy = new Ajv()
        .addSchema(cellSetsSchema).addSchema(rasterSchema).compile(configSchema1_0_0);
      const validLegacy = validateLegacy(upgradedConfig);
      if (!validLegacy) {
        const failureReason = JSON.stringify(validateLegacy.errors, null, 2);
        return [{
          title: 'Config validation failed',
          preformatted: failureReason,
        }, false];
      }
      // Upgrade from v1.0.0 to v1.0.1 before v1.0.1 schema validation.
      upgradedConfig = upgrade('1.0.0', upgradedConfig);
    }
    if (upgradedConfig.version === '1.0.1') {
      console.log(upgradedConfig) // eslint-disable-line
      // Validate under the legacy schema first.
      const validateLegacy = new Ajv()
        .addSchema(cellSetsSchema).addSchema(rasterSchema).compile(configSchema1_0_1);
      const validLegacy = validateLegacy(upgradedConfig);
      if (!validLegacy) {
        const failureReason = JSON.stringify(validateLegacy.errors, null, 2);
        return [{
          title: 'Config validation failed',
          preformatted: failureReason,
        }, false];
      }
      // Upgrade from v1.0.0 to v1.0.1 before v1.0.1 schema validation.
      upgradedConfig = upgrade('1.0.1', upgradedConfig);
    }
    // NOTE: Remove when a view config viewer/editor is available in UI.
    console.groupCollapsed(`🚄 Vitessce (${packageJson.version}) view configuration`);
    console.info(`data:,${JSON.stringify(upgradedConfig)}`);
    console.info(JSON.stringify(upgradedConfig, null, 2));
    console.groupEnd();
    const validate = new Ajv()
      .addSchema(cellSetsSchema).addSchema(rasterSchema).compile(configSchema);
    const valid = validate(upgradedConfig);

    if (!valid) {
      const failureReason = JSON.stringify(validate.errors, null, 2);
      return [{
        title: 'Config validation failed',
        preformatted: failureReason,
      }, false];
    }
    // Initialize the view config according to the initStrategy.
    const initializedConfig = initialize(upgradedConfig);
    return [initializedConfig, true];
  }, [config]);

  // Emit the upgraded/initialized view config
  // to onConfigChange if necessary.
  useEffect(() => {
    if (success && !isEqual(configOrWarning, config) && onConfigChange) {
      onConfigChange(configOrWarning);
    }
  }, [success, config, configOrWarning, onConfigChange]);

  return success ? (
    <StylesProvider generateClassName={generateClassName}>
      <ThemeProvider theme={muiTheme[theme]}>
        <VitessceGrid
          config={configOrWarning}
          getComponent={getComponent}
          rowHeight={rowHeight}
          height={height}
          theme={theme}
        />
        <CallbackPublisher
          onWarn={onWarn}
          onConfigChange={onConfigChange}
          onLoaderChange={onLoaderChange}
          validateOnConfigChange={validateOnConfigChange}
        />
      </ThemeProvider>
    </StylesProvider>
  ) : (
    <Warning
      theme={theme}
      {...configOrWarning}
    />
  );
}
