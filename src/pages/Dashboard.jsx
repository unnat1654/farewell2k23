import React from 'react'
import { useNavigate } from "react-router-dom";
import { auth, db, logout} from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, addDoc, getDocs, updateDoc, collection } from 'firebase/firestore'
import '../styles/dashboard.css'
import alertify from 'alertifyjs';
import 'alertifyjs/build/css/alertify.css';

alertify.set('notifier','position', 'top-center');

export default function Dashboard(){
    async function reset(){
        const dbUserRef = collection(db, "userData")
        const uData = await getDocs(dbUserRef)
        let usersId = []
        // console.log(uData)
        uData.forEach(doc => {
            usersId.push(doc.id)
        })
        usersId.forEach(async (id) => {
            // const [user] = useAuthState(auth);
            // logInWithEmailAndPassword(`user${counter}@gmail.com`, `password${counter}`)
            try {
                const userD = doc(db, "userData", id);
                await updateDoc(userD, {
                    "choose" : 0,
                    "guessMssg1" : "",
                    "guessUser1" : "",
                    "myMssg1" : "",
                    "myUser1" : "",
                    "guessed1" : false,
                    "numGuess1" : 3
                });
            } catch (err) {
                console.log(err);
            }
            // logout()
        })
    }
    // reset()

    // async function addUsers(){
    //     const dbUserRef = collection(db, "userData")
    //     for(let i=1; i<=5; ++i){
    //         try {
    //             await addDoc(dbUserRef, {
    //                 "choose" : 0,
    //                 "guessMssg1" : "",
    //                 "guessUser1" : "",
    //                 "myMssg1" : "",
    //                 "myUser1" : "",
    //                 "guessed1" : false,
    //                 "numGuess1" : 3,
    //                 "uid":"",
    //                 "username" : `user ${i}`
    //             })
    //           } catch (err) {
    //             console.log(err);
    //           }
    //     }
    // }

    const [user, loading] = useAuthState(auth);
    const [userData, setUserData] = React.useState(
        {
            "username" : "loading...",
            "choose" : 0,
            "guessMssg1" : "loading...",
            "guessUser1" : "loading...",
            "myMssg1" : "loading...",
            "myUser1" : "",
            "uid" : "",
            "id" : "",
            "guessed1" : false,
            "numGuess1" : "loading...",
            "guess1id" : "",
            "localGuess1" : "",
        }
    )
    const [allUsers, setAllUsers] = React.useState([["--choose--", true]])
    
    const navigate = useNavigate();

    //If the user logs out redirect to login page
    React.useEffect(() => {
        if(loading){
            return;
        }
        if (!user){
            navigate("/login")
            alertify.notify('Logout Successful', 'success', 2, function(){  console.log('dismissed'); });
        }
    }, [user]);

    // Get data from firebase
    React.useEffect(() => {
        if(loading){
            return;
        }
        async function getUserData(){
            const dbUserRef = collection(db, "userData")
            // for (let i=1; i<6; i++){
            //     try {
            //         await addDoc(dbUserRef, {
            //           "username" : `user ${i}`,
            //           "choose" : 0,
            //           "guessMssg1" : "",
            //           "guessMssg2" : "",
            //           "guessUser1" : "",
            //           "guessUser2" : "",
            //           "myMssg1" : "",
            //           "myMssg2" : "",
            //           "myUser1" : "",
            //           "myUser2" : "",
            //           "uid" : ""
            //         })
            //     } catch (err) {
            //         console.log(err);
            //     }
            // }
            const uData = await getDocs(dbUserRef)
            // console.log(uData)
            uData.forEach(doc => {
                if(doc.data().uid === user.uid){
                    setUserData({...doc.data(), "id" : doc.id})
                    // console.log(doc.id)
                }
                else{
                    if(allUsers.indexOf(doc.data().username) === -1){
                        setAllUsers(prev => (
                         [...prev, [doc.data().username, !doc.data().myUser1]]
                        ))
                    }
                }
            })
        }
        getUserData()
    }, [user])

    function handleLogout(){
        logout();
    }

    // Handle submission of first message
    async function handleMsg1(e){
        e.preventDefault()
        if(userData.guessUser1 === ""){
            alertify.notify('Choose a User', 'warning', 2, function(){  console.log('dismissed'); });
            return
        }
        else if(userData.guessMssg1 === ""){
            alertify.notify('Empty Message', 'warning', 2, function(){  console.log('dismissed'); });
            return
        }

        // update first user assigned and sent message and choice value
        try {
            const userD = doc(db, "userData", userData.id);
            setUserData(prev => (
                {...prev, "choose" : userData.choose + 1,
                "guessMssg1" : userData.guessMssg1,
                "guessUser1" : userData.guessUser1}
            ))
            await updateDoc(userD, {
              "choose" : userData.choose + 1,
              "guessMssg1" : userData.guessMssg1,
              "guessUser1" : userData.guessUser1
            });
          } catch (err) {
            console.log(err);
        }
        // Update message of the other user
        let id
        try{
            const UserRef = collection(db, "userData")
            const uD = await getDocs(UserRef)
            uD.forEach((doc) => {
                if(doc.data().username === userData.guessUser1){
                    id = doc.id
                }
            })
        } catch (err) {
            console.log(err);
        }
        const userG = doc(db, "userData", id);
        await updateDoc(userG, {
            "myMssg1" : userData.guessMssg1,
            "myUser1" : userData.username
        });
        // window.location.reload();
        alertify.notify('Message Sent', 'success', 2, function(){});
    }

    // Handle submission of first guess
    async function handleGuess1(e){
        e.preventDefault()
        if(userData.myUser1 === userData.localGuess1){
            alert("correct guess")
            try {
                const userD = doc(db, "userData", userData.id);
                await updateDoc(userD, {
                  "guessed1" : true
                });
                window.location.reload();
              } catch (err) {
                console.log(err);
            }
        }
        else{
            alert("wrong guess")
            setUserData(prev => (
                {...prev, "numGuess1" : prev.numGuess1 - 1}
            ))
            try {
                const userD = doc(db, "userData", userData.id);
                await updateDoc(userD, {
                  "numGuess1" : userData.numGuess1 - 1
                });
              } catch (err) {
                console.log(err);
            }
        }
    }

    function handleChange(event) {
        const {name, value} = event.target
        setUserData(prev => ({
            ...prev,
            [name] : value
        }))
    }

    function getInvitation(){
        if(userData.guessed1){
            alert("you are invited")
        }
        else{
            window.location.reload();
        }
    }

    // map available users to display as a dropdown disable unavailable users
    const allOptionUsers = allUsers.map(u => {
        return (u[1] ? <option key={u[0]} value={u[0]}>{u[0]}</option> : 
        <option disabled key={u[0]} value={u[0]}>{u[0]}</option>)
    })

    const allSelectUsers = allUsers.map(u => {
        return <option key={u[0]} value={u[0]}>{u[0]}</option>
    })
    /*
    88888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
    88                                                                                              88
    88                                                                                              88
    88                                                                                              88
    88888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
    */
    return(
        <div className='dashboardContainer'>
            <h1 className='dashHeading'>Dashboard</h1>
            <div className='container'>
                <img 
                    src="https://vignette.wikia.nocookie.net/roblox-pet-ranch-simulator/images/a/a9/Coinss.png/revision/latest?cb=20190307131955" 
                    alt="champion profile"
                    width="100px"
                    className='avatar'
                />
                <div>
                    <p className='username'>{userData.username}</p>
                    <button className="logoutButton button" onClick={handleLogout}>logout</button>
                </div>
                <form onSubmit={handleMsg1} className='sendMessageContainer'>
                    {(userData.choose < 1) && <div className='recieverChoiceContainer'>
                        <label htmlFor="guessUser1">Choose the person to message</label>
                        <select 
                            id="guessUser1"
                            value={userData.guessUser1}
                            onChange={handleChange}
                            name="guessUser1"
                            className='selectReciever'
                        >
                            {allOptionUsers}
                        </select>
                    </div>}
                    <div>
                        <label htmlFor="guessMssg1">
                            {(userData.choose >= 1) ? `Update Message to ${userData.guessUser1}`:
                            (userData.guessUser1 ? `Send message to ${userData.guessUser1}` : "Select a User")}
                        </label>
                    </div>
                    <div>
                        <textarea
                            id="guessMssg1" 
                            name="guessMssg1"
                            value={userData.guessMssg1}
                            onChange={handleChange}
                            className="textArea"
                            placeholder={`Write a Message to ${userData.username} That helps him Guess your name, make sure not to reveal too much`}
                        />
                    </div>
                    <button className='button'>Send</button>
                </form>
            </div>
            <div className='container'>
                <h2>Recieved Message</h2>
                {userData.myMssg1 ? <p>{userData.myMssg1}</p> : <p>No messages recieved yet</p>}
                {(!userData.guessed1 && userData.myMssg1 && userData.numGuess1 != 0)  && 
                <form onSubmit={handleGuess1}>
                    <label htmlFor="guessMy1">Guess The sender</label>
                    <select
                        id="localGuess1"
                        value={userData.localGuess1}
                        onChange={handleChange}
                        name="localGuess1"
                    >
                        {allSelectUsers}
                    </select>
                    <p>{userData.numGuess1} tries remaining</p>
                    <button className='button'>Guess</button>
                </form>}
            </div>
            <div className='inviteContainer'>
                {userData.guessed1 && <button className="button inviteButton" onClick={getInvitation}>Invitation</button>}
                {userData.numGuess1 === 0 && <p className="container notInvited">You are not invited as you failed to guess the sender</p>}
            </div>
        </div>
    )
}