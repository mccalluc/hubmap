import PubSub from 'pubsub-js';
import React from 'react';
import FileDrop from 'react-file-drop';

import { IMAGE_ADD, WARNING_ADD } from '../events'

export class FileManagerPublisher extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.onAddFile = this.onAddFile.bind(this);
  }

  onAddFile(file) {
    const extension = file.name.match(/\..*/)[0];
    switch (extension) {
      case '.png':
        PubSub.publish(IMAGE_ADD, file);
        break;
      default:
        PubSub.publish(WARNING_ADD, `File extension "${extension}" is not recognized.`);
    }
  }

  render() {
    return (
      <FileManager onAddFile={this.onAddFile} value={this.state.value}></FileManager>
    );
  }
}

export class FileManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: []
    };

    this.handleDrop = this.handleDrop.bind(this);
  }

  handleDrop(files, event) {
    var filesCopy = this.state.files.slice();
    for (const f of files) {
      filesCopy.push(f.name);
      this.props.onAddFile(f);
    }
    var newState = {files: filesCopy};
    this.setState(newState);
  }

  render() {
    const files = this.state.files.map(
      file => <li className="list-group-item" key={file}>{file}</li>
    );

    const message = files.length
      ? <ul className="list-group">{files}</ul>
      : 'Drop files here';
    return (
      <div>
        <FileDrop onDrop={this.handleDrop}>
          {message}
        </FileDrop>
      </div>
    );
  }
}
