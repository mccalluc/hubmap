import React from 'react';

import DemoList from './_DemoList';

import { configs } from '../../../src/demo/configs';

export default function Demos() {
  return (
    <DemoList configs={configs} />
  );
}