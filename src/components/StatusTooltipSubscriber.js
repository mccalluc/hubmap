import React from 'react';
import PubSub from 'pubsub-js';

import { CELLS_HOVER } from '../events';
import StatusTooltip from './StatusTooltip';

export default class StatusTooltipSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hoveredCellInfo: null,
    };
  }

  componentWillMount() {
    this.cellsHoverToken = PubSub.subscribe(
      CELLS_HOVER, this.cellsHoverSubscriber.bind(this),
    );
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.cellsHoverToken);
  }

  cellsHoverSubscriber(msg, hoverInfo) {
    this.setState({ hoveredCellInfo: hoverInfo });
  }

  render() {
    const {
      mapping,
      viewInfo,
      uuid,
    } = this.props;
    const {
      hoveredCellInfo,
    } = this.state;
    return (
      <StatusTooltip
        hoveredCellInfo={hoveredCellInfo}
        mapping={mapping}
        viewInfo={viewInfo}
        uuid={uuid}
      />
    );
  }
}
