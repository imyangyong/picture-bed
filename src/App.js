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
import Tooltip from '@material-ui/core/Tooltip';
import GitHubIcon from '@material-ui/icons/GitHub';
import {blobTobase64, copy} from 'deft-utils'

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
      auth: '',
      member: [{
        code: 'angus',
        name: '杨勇'
      }, {
        code: 'dxhy',
        name: '大象慧云'
      }],
      certified: false,
      message: {
        type: 'error',
        content: '',
        visible: false,
      }
    }
    
    this.dropRef = React.createRef()
  }
  
  componentDidMount() {
    const word = window.localStorage.getItem('member') || '';
    if (word && /^([A-Z]|[a-z]|\d|_)+$/.test(word) && word.length <= 10) {
      this.setState({
        auth: word,
        certified: true
      })
    }
  }
  
  componentDidUpdate(prevProps, prevState) {
    if (!prevState.certified && this.state.certified) {
      let div = this.dropRef.current;
      
      if (div) {
        div.addEventListener('dragover', e => {
          e.preventDefault()
          e.stopPropagation()
        })
        div.addEventListener('drop', this.droped)
        div.addEventListener('paste', this.pasted)
      }
    }
  }
  
  droped = event => {
    event.stopPropagation();
    event.preventDefault();
    this.setFileInfo(event.dataTransfer.files[0])
  }
  
  pasted = event => {
    event.stopPropagation();
    event.preventDefault();
    this.setFileInfo(event.clipboardData.files[0], true);
  }
  
  setFileInfo = (file, isPasted) => {
    if (!file || !file.type.includes('image')) {
      this.setState({
        message: {type: 'error', content: '文件类型错误！🙅', visible: true}
      });
      setTimeout(() => {
        this.closeMessage();
      }, 1000)
      return;
    }
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() >= 9 ? now.getMonth() + 1 : `0${now.getMonth() + 1}`;
    const date = now.getDate() > 9 ? now.getDate() : `0${now.getDate()}`;
    const hour = now.getHours() > 9 ? now.getHours() : `0${now.getHours()}`;
    const minutes = now.getMinutes() > 9 ? now.getMinutes() : `0${now.getMinutes()}`;
    const seconds = now.getSeconds() > 9 ? now.getSeconds() : `0${now.getSeconds()}`;
    const fileSuffix = file.type.match(/\/.*$/)[0].slice(1);
    this.setState({
      file,
      filename: isPasted ? `${year}-${month}-${date} ${hour}-${minutes}-${seconds}.${fileSuffix}` : file.name,
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
    form.append('auth', this.state.auth)
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
          if (res.url) {
            this.setState({
              imageUrl: res.url,
              processValue: 100
            })
          } else {
            this.setState({
              message: {type: 'error', content: res.message + '！🙅', visible: true}
            });
            setTimeout(() => {
              this.closeMessage();
            }, 1000)
          }
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
    this.setState({
      file: null,
      processValue: 0,
      imageUrl: '',
      copied: false
    })
    this.state.fileDom.setAttribute('value', '');
    if (this.state.timer) {
      clearInterval(this.state.timer);
      this.setState({
        timer: null,
      })
    }
  }
  
  setAuth = event => {
    this.setState({
      auth: event.target.value
    })
  }
  
  comfirm = () => {
    if (!/^([A-Z]|[a-z]|\d|_)+$/.test(this.state.auth)) {
      this.setState({
        message: {type: 'error', content: '格式错误！🙅', visible: true}
      });
      setTimeout(() => {
        this.closeMessage();
      }, 1000)
      return;
    }
    if (this.state.auth.length > 10) {
      this.setState({
        message: {type: 'error', content: '长度不能超过10！🙅', visible: true}
      });
      setTimeout(() => {
        this.closeMessage();
      }, 1000)
      return;
    }
    window.localStorage.setItem('member', this.state.auth)
    this.setState({
      certified: true
    })
    // if (this.state.member.map(m => m.code).includes(this.state.auth)) {
    //   window.localStorage.setItem('member', this.state.auth)
    //   this.setState({
    //     certified: true
    //   })
    // } else {
    //   this.setState({
    //     message: {type: 'error', content: '口令错误！🙅', visible: true}
    //   });
    //   setTimeout(() => {
    //     this.closeMessage();
    //   }, 1000)
    // }
  }
  
  render() {
    function Alert(props) {
      return <MuiAlert elevation={6} variant="filled" {...props} />;
    }
    
    return (
      <>
        {
          this.state.certified
            ? <div className='App' ref={this.dropRef}>
              <GitHubIcon className='github' onClick={() => window.open('https://github.com/imyangyong/picture-bed')}/>
              <div className='title-wrapper'>
                <h1>Image Upload</h1>
                <span className='auth'>{this.state.auth}</span>
              </div>
              <div className='file-preview'>
                <div className='file-drop-zone'>
                  {
                    this.state.file ?
                      <div className="file-preview-thumbnails">
                        <div className='file-content'>
                          <Card>
                            <CardContent className='img-content'>
                              <img className='img' alt={this.state.filename} src={this.state.imageDataURI}/>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                      :
                      <div className="file-drop-zone-title">
                        Drag &amp; drop file here ...
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
                  {!this.state.copied && <FileCopyOutlined
                    className='icon-copy cursor'
                    onClick={this.copyAction}
                  ></FileCopyOutlined>}
                  {this.state.copied && <FileCopy className='icon-copy'></FileCopy>}
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
            
            
            : <>
              <div className='enter-container'>
                <h3>请输入你的名字：</h3>
                <Tooltip title="支持字母,数字,下划线" aria-label="add">
                  <Input value={this.state.auth} onChange={this.setAuth}></Input>
                </Tooltip>
                <Button variant="contained" color="primary" onClick={this.comfirm}>确定</Button>
              </div>
              <Snackbar className='message' open={this.state.message.visible} autoHideDuration={6000}
                        onClose={this.closeMessage}>
                <Alert severity={this.state.message.type} onClose={this.closeMessage}>
                  {this.state.message.content}
                </Alert>
              </Snackbar>
            </>
        }
      </>
    )
  }
}

export default App;
