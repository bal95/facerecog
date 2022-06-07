import React, {Component} from 'react'
import './App.css';
import Navigation from './components/Navigation/Navigation'
import Logo from './components/Logo/Logo'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank'
import Signin from './components/Signin/Signin'
import Register from './components/Register/Register'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'

const USER_ID = 'bal95';
const PAT = 'ddc34060d7024141a7b146aea29d23e0';
const APP_ID = 'f72258ad3e344ef488530c0764ded98b';
const MODEL_ID = 'face-detection';
const MODEL_VERSION_ID = '45fb9a671625463fa646c3523a3087d5';

const initialState={
  imageUrl:'',
  box:{},
  route:'signin',
  isSignedIn:false,
  user:{
    id:'',
    name: '',
    email:'',
    password:'',
    entries:0,
    joined:'',
  }
}

class App extends Component{
  constructor(){
    super()
    this.state=initialState
  }

  loadUser=(data)=>{
    this.setState({user:{
      id:data.id,
      name: data.name,
      email:data.email,
      password:data.password,
      entries:data.entries,
      joined:data.joined,
    }})
  }

  componentDidMount(){
    fetch('http://localhost:4000')
      .then(res=>res.json())
      .then(data=>console.log(data))
  }

  calculateFaceLocation=(faceData)=>{
    const image=document.getElementById('inputImage')
    const width=Number(image.width)
    const height=Number(image.height)
    return {
      leftCol:faceData.left_col*width,
      topRow:faceData.top_row*height,
      rightCol:width-faceData.right_col*width,
      bottomRow:height-faceData.bottom_row*height,
    }
  }

  displayFaceBox=(box)=>{
    this.setState({box:box})
  }

  onInputChange=(event)=>{
    this.setState({imageUrl:event.target.value})
  }

  onSubmit=()=>{
    const raw = JSON.stringify({
        "user_app_id": {
            "user_id": USER_ID,
            "app_id": APP_ID
        },
        "inputs": [
            {
                "data": {
                    "image": {
                        "url": this.state.imageUrl
                    }
                }
            }
        ]
    })
    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Key ' + PAT
        },
        body: raw
    }
    
    fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/versions/" + MODEL_VERSION_ID + "/outputs", requestOptions)
      .then(response => {
        if(response){
          fetch('http://localhost:4000/image',{
            method:'put',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({
              id:this.state.user.id,
            })
            }
          )
            .then(res => res.json())
            .then(count => {
              this.setState(Object.assign(this.state.user,{entries:count}))
            })
            .catch(err=>console.log("error in route"))
        }
        return response.json()
      })
      .then(result => this.displayFaceBox(this.calculateFaceLocation(result.outputs[0].data.regions[0].region_info.bounding_box)))
      .catch(error => console.log('error', error));
  }

  onRouteChange=(route)=>{
    if(route==='signout') this.setState(initialState)
    else if(route==='home') this.setState({isSignedIn:true})
    this.setState({route:route})
  }

  render(){
    const {imageUrl,box,route,isSignedIn}=this.state
    return(
      <div className="App">
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        {route==='home'?
          <div>
            <Logo/>
            <Rank name={this.state.user.name} entries={this.state.user.entries}/>
            <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onSubmit}/>
            <FaceRecognition imageUrl={imageUrl} box={box}/>
          </div>:(
            route==='signin'?<Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            :<Register onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
          )
        }
      </div>
    )
  }
}

export default App;
