import React from 'react'
import './FaceRecognition.css'

const FaceRecognition=({imageUrl,box})=>{
    return imageUrl===''? <div></div>:
    <div className='center ma'>
        <div className='absolute mt2'>
            <img id='inputImage' alt='' src={imageUrl} width='500px' height='500px'/>
            <div className='boundingBox' style={{top:box.topRow,right:box.rightCol,left:box.leftCol,bottom:box.bottomRow}}/>
        </div>
    </div>
}

export default FaceRecognition