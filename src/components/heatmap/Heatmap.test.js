
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { configure, mount } from 'enzyme';
import expect from 'expect';
import Heatmap from './Heatmap';
import { clusters, cellColors } from './Heatmap.test.fixtures';

configure({ adapter: new Adapter() });

describe('<Heatmap/>', () => {
  it('renders a DeckGL element', () => {
    const wrapper = mount(
      <Heatmap
        uuid="heatmap-0"
        theme="dark"
        width={100}
        height={100}
        clusters={clusters}
        cellColors={cellColors}
        transpose
      />,
    );
    expect(wrapper.find('#deckgl-wrapper').length).toEqual(1);
  });
});