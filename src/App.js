import React, {Component} from 'react'
import './App.css';
import Navigation from './components/Navigation/Navigation'
import Logo from './components/Logo/Logo'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank'
import Signin from './components/Signin/Signin'
import Register from './components/Register/Register'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const USER_ID = 'bal95';
const PAT = 'ddc34060d7024141a7b146aea29d23e0';
const APP_ID = 'f72258ad3e344ef488530c0764ded98b';
const MODEL_ID = 'face-detection';
const MODEL_VERSION_ID = '45fb9a671625463fa646c3523a3087d5';

const particlesInit = async (main) => {
  console.log(main);
  await loadFull(main);
}

const particlesLoaded = (container) => {
  console.log(container);
}

const particlesOptions={
  fpsLimit: 60,
  interactivity: {
    events: {
      onClick: {
        enable: true,
        mode: "push",
      },
      onHover: {
        enable: true,
        mode: "repulse",
      },
      resize: true,
    },
    modes: {
      push: {
        quantity: 4,
      },
      repulse: {
        distance: 200,
        duration: 0.4,
      },
    },
  },
  particles: {
    color: {
      value: "#ffffff",
    },
    links: {
      color: "#ffffff",
      distance: 150,
      enable: true,
      opacity: 0.5,
      width: 1,
    },
    collisions: {
      enable: true,
    },
    move: {
      direction: "none",
      enable: true,
      outModes: {
        default: "bounce",
      },
      random: false,
      speed: 6,
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 30,
    },
    opacity: {
      value: 0.5,
    },
    shape: {
      type: "circle",
    },
    size: {
      value: { min: 1, max: 5 },
    },
  },
  detectRetina: true,
}

class App extends Component{
  constructor(){
    super()
    this.state={
      imageUrl:'',
      box:{},
      route:'signin',
      isSignedIn:false,
    }
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
      .then(response => response.json())
      .then(result => this.displayFaceBox(this.calculateFaceLocation(result.outputs[0].data.regions[0].region_info.bounding_box)))
      .catch(error => console.log('error', error));
  }

  onRouteChange=(route)=>{
    if(route==='signout') this.setState({isSignedIn:false})
    else if(route==='home') this.setState({isSignedIn:true})
    this.setState({route:route})
  }

  render(){
    const {imageUrl,box,route,isSignedIn}=this.state
    return(
      <div className="App">
        <Particles className='particles' id="tsparticles" init={particlesInit} loaded={particlesLoaded} options={particlesOptions}/>
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        {route==='home'?
          <div>
            <Logo/>
            <Rank/>
            <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onSubmit}/>
            <FaceRecognition imageUrl={imageUrl} box={box}/>
          </div>:(
            route==='signin'?<Signin onRouteChange={this.onRouteChange}/>
            :<Register onRouteChange={this.onRouteChange}/>
          )
        }
      </div>
    )
  }
}

export default App;
