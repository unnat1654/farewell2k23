import React from 'react'
import { useNavigate } from "react-router-dom";
import '../styles/splash.css'
import ncsLogo from '../assets/ncs-logo.png'
import {toastif} from "../../firebase"
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'alertifyjs/build/css/alertify.css';
// import {reset, addUsers} from '../database/dbOps'

export default function Splash(){
    // reset()
    const audio = new Audio(
        "/award.mp3"
    );

    audio.addEventListener('ended', function () {
        audio.currentTime = 0;
        audio.play();
    }, false);

    function start(){
        audio.play();
    }
    
    toast.info('Click anywhere to continue', {
        ...toastif, autoClose: 2000, position: "bottom-center"
    });
    const navigate = useNavigate();
    React.useEffect(() => {
        console.log("Finisged Loading page")
    }, [])
    function handleClick(){
        start()
        toast.dismiss();
        navigate("/login"); 
    }
    return(

/*
-----------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------------
*/

            <div className = "splashContainer" onClick={handleClick}>
                <ToastContainer
                    limit={1}
                    transition={Slide}
                    position="top-center"
                    autoClose={4000}
                    hideProgressBar
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                />
            <div className='upperHalf'>
                <a href="https://hackncs.in/">
                    <img className="ncsLogo" src={ncsLogo} alt="Nibble Computer Society Logo"/>
                </a>
                <div className='greetings-container'>
                    <h1 className='welcomeText'>Welcome</h1>
                    <h2 className='farewellText'>Farewell 2k23</h2>
                </div>
            </div>
        </div>
    )
}