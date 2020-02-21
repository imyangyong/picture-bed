import React, {Component} from 'react';
import './App.css';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import Link from '@material-ui/core/Link';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import FileCopy from '@material-ui/icons/FileCopy';
import FileCopyOutlined from '@material-ui/icons/FileCopyOutlined';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import LinearProgress from '@material-ui/core/LinearProgress';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { copy, blobTobase64 } from 'deft-utils'

class App extends Component {
  constructor(...args) {
    super(...args);
    
    this.state = {
      fileDom: null,
      file: null,
      filename: '',
      imageUrl: '',
      imageDataURI: '',
      copied: false,
      processValue: 0,
      timer: null,
      message: {
        type: 'error',
        content: '',
        visible: false,
      }
    }
  
    this.dropRef = React.createRef()
  }
  
  componentDidMount() {
    let div = this.dropRef.current;
    
    div.addEventListener('dragover', e => {
      e.preventDefault()
      e.stopPropagation()
    })
    div.addEventListener('drop', this.droped)
  }
  
  droped = event => {
    event.stopPropagation();
    event.preventDefault();
    this.setFileInfo(event.dataTransfer.files[0])
  }
  
  setFileInfo = file => {
    if (!file.type.includes('image')) {
      this.setState({
        message: {type: 'error', content: '文件类型错误！🙅', visible: true}
      });
      setTimeout(() => {
        this.closeMessage();
      }, 1000)
      return;
    }
    this.setState({
      file,
      filename: file.name,
      processValue: 0,
      imageUrl: '',
      copied: false,
    })
    blobTobase64(file).then(res => {
      this.setState({
        imageDataURI: res
      })
    })
    if (this.state.timer) {
      clearInterval(this.state.timer);
      this.setState({
        timer: null,
      })
    }
  }
  
  setFileDom = ref => {
    this.setState({
      fileDom: ref
    })
    ref.addEventListener('change', event => {
      this.setFileInfo(event.target.files[0])
    })
  }
  
  setDropZoneDom = ref => {
    this.setState({
      fileDropZoneDom: ref
    })
    ref.addEventListener('drop', event => {
      event.stopPropagation();
      event.preventDefault();
      console.log(event)
    });
  }
  
  closeMessage = () => {
    this.setState({
      message: {...this.state.message, visible: false}
    })
  }
  
  /**
   * method select image and reset the image that will be upload.
   */
  selectImage = () => {
    this.state.fileDom.click();
  }
  
  process = () => {
    var exec = function () {
      if (this.state.processValue === 100) {
        clearInterval(timer);
        return;
      }
      const diff = Math.random() * 10;
      this.setState({
        processValue: Math.min(this.state.processValue + diff, 95)
      });
    }
    const timer = setInterval(exec.bind(this), 500);
    this.setState({
      timer,
    })
  }
  
  upload = () => {
    this.process();
    let form = new FormData();
    form.append('file', this.state.file)
    form.append('filename', this.state.filename)
    fetch('/upload', {
      body: form, // must match 'Content-Type' header
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      // credentials: 'same-origin', // include, same-origin, *omit
      headers: {
        // 'content-type': 'multipart/form-data'
      },
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, cors, *same-origin
      redirect: 'follow', // manual, *follow, error
      referrer: 'no-referrer', // *client, no-referrer
    })
      .then(response => {
        response.json().then(res => {
         this.setState({
           imageUrl: res.url,
           processValue: 100
         })
        })
      })
  }
  
  copyAction = () => {
    copy(this.state.imageUrl, true);
    this.setState({
      copied: true
    })
  }
  
  setFileName = e => {
    this.setState({
      filename: e.target.value
    })
  }
  
  clear = () => {
    this.state.fileDom.value = '';
    this.setState({
      file: null,
      processValue: 0,
      imageUrl: '',
      copied: false,
    })
    if (this.state.timer) {
      clearInterval(this.state.timer);
      this.setState({
        timer: null,
      })
    }
  }
  
  render() {
    function Alert(props) {
      return <MuiAlert elevation={6} variant="filled" {...props} />;
    }
    
    return (
      <div className='App' ref={this.dropRef}>
        <h1>Image Upload</h1>
        <div className='file-preview'>
          <div className='file-drop-zone'>
            {
              this.state.file ?
                <div className="file-preview-thumbnails">
                  <div className='file-content'>
                    <Card>
                      <CardContent className='img-content'>
                        <img className='img' src={this.state.imageDataURI} />
                      </CardContent>
                    </Card>
                  </div>
                </div>
                :
                <div className="file-drop-zone-title">
                  Drag &amp; drop files here ...
                  <br></br>or<br></br>
                  Copy &amp; paste screenshots
                  here ...
                </div>
            }
          </div>
        </div>
        
        {
          this.state.processValue > 0 &&
          <div>
            <LinearProgress variant="determinate" value={this.state.processValue}></LinearProgress>
          </div>
        }
        
        <div className='file-caption-main'>
          <Input
            className='file-name'
            value={this.state.file ? this.state.filename : ''}
            onChange={this.setFileName}
          >
          </Input>
          {this.state.file && <Button
            variant="contained"
            color="secondary"
            startIcon={<DeleteIcon/>}
            onClick={this.clear}
          >
            Clear
          </Button>
          }
          {this.state.file && <Button
            variant="contained"
            color="inherit"
            startIcon={<CloudUploadIcon/>}
            onClick={this.upload}
          >
            Upload
          </Button>
          }
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon/>}
            onClick={this.selectImage}
          >
            Select Image
          </Button>
        </div>
        
        {
          this.state.imageUrl && <div className='url-container'>
          <Link href={this.state.imageUrl} target='_blank'>{this.state.imageUrl}</Link>
            { !this.state.copied && <FileCopyOutlined
              className='icon-copy cursor'
              onClick={this.copyAction}
            ></FileCopyOutlined>}
            { this.state.copied && <FileCopy className='icon-copy'></FileCopy>}
        </div>
        }
        
        <input type='file' ref={this.setFileDom} style={{display: 'none'}}></input>
        
        <Snackbar className='message' open={this.state.message.visible} autoHideDuration={6000}
                  onClose={this.closeMessage}>
          <Alert severity={this.state.message.type} onClose={this.closeMessage}>
            {this.state.message.content}
          </Alert>
        </Snackbar>
      </div>
    )
  }
}

export default App;
