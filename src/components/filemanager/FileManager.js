import React from 'react';
import FileDrop from 'react-file-drop';


export default class FileManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileNames: [],
    };

    this.handleDrop = this.handleDrop.bind(this);
  }

  handleDrop(files) {
    const { fileNames } = this.state;
    const { onAddFile } = this.props;
    const fileNamesCopy = fileNames.slice();
    Array.from(files).forEach((f) => {
      if (!fileNamesCopy.includes(f.name)) {
        // Do not add duplicate entries to list...
        fileNamesCopy.push(f.name);
      }
      // ... but we do update the data.
      // This is easy, and good enough for now.
      onAddFile(f);
    });
    this.setState({ fileNames: fileNamesCopy });
  }

  render() {
    const { fileNames } = this.state;
    const fileList = fileNames.map(
      fileName => <li className="list-group-item" key={fileName}>{fileName}</li>,
    );

    const message = fileList.length
      ? <ul className="list-group">{fileList}</ul>
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
