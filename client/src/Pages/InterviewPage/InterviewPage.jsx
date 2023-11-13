import { useNavigate } from "react-router-dom"
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { useEffect, useState } from "react"
import { ReactMediaRecorder } from "react-media-recorder";
import axios from "axios";

const reactQuestions = [
    "Explain the concept of Virtual DOM in React and how it helps in improving performance.",
    "What is JSX in React? How is it different from HTML?",
    // "Describe the lifecycle methods of a React component.",
    // "What are React Hooks? Provide examples of a few built-in hooks.",
];


export const InterviewPage = () => {
    let navigate = useNavigate()
    let [answers, setanswers] = useState([])
    const [text, settext] = useState(null);
    const [isSpeechEnded, setisSpeechEnded] = useState(null);
    const [utterance, setUtterance] = useState(null);
    const [isListening, setIsListening] = useState(false)
    const [count, setcount] = useState(null)
    let timeout1
    let timeout2
    let {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    useEffect(() => {
        SpeechRecognition.startListening()
    }, [])

    useEffect(() => {
        if (isListening == false) {
            const synth = window.speechSynthesis;
            const u = new SpeechSynthesisUtterance(text);

            const voices = synth.getVoices();
            const selectedVoice = voices.find((v) => v.name === "Google हिन्दी");

            if (selectedVoice) {
                u.voice = selectedVoice;
            }

            u.pitch = 1;
            u.rate = 1;
            u.volume = 1;

            u.onend = () => {
                if (text !== "Your interview has concluded. Please click the END button to conclude the session.") {
                    setisSpeechEnded(true);
                }
            };

            if (text !== null) {
                synth.speak(u);
            }

            return () => {
                synth.cancel();
            };
        }
    }, [text]);

    useEffect(() => {
        if (isSpeechEnded) {
            setisSpeechEnded(false)
            setIsListening(true)
            if (text == "Thank you for your response. Let's proceed to the next question.") {

                setIsListening(false)
                timeout2 = setTimeout(() => {
                    if (count < reactQuestions.length) {
                        setcount((prev) => { let newcount = prev + 1; return newcount })
                        settext(reactQuestions[count])
                        resetTranscript()
                    }
                    else {
                        settext("Your interview has concluded. Please click the END button to conclude the session.")
                    }
                }, 2000);
            }
            else {
                SpeechRecognition.startListening({ continuous: true })
                timeout1 = setTimeout(() => {
                    SpeechRecognition.stopListening()
                    setIsListening(false)
                    timeout2 = setTimeout(() => {
                        settext("Thank you for your response. Let's proceed to the next question.")
                        resetTranscript()

                    }, 2000);
                }, 5000);
            }
        }
    }, [isSpeechEnded])

    useEffect(() => {
        if (isListening == false && count !== null) {
            if (transcript == "") {
                setanswers([...answers, "Don't know the answer"])
            }
            else {
                setanswers([...answers, transcript])
            }
        }
    }, [isListening])


    if (!browserSupportsSpeechRecognition) {
        return <span>Browser doesn't support speech recognition.</span>;
    }





    const handleChange = () => {

        navigate("/feedback")
    }

    return (
        <div>
            {/* GIF Image */}
            <img></img>

            {/* ChatData */}
            {text && <div>
                {text == "Click END button to end this interview" ? text :
                    text == "Your interview has concluded. Please click the END button to conclude the session." ? `🎉${text}🎉` :
                        `Q.${text}`}
            </div>}
            {/* Video Recorder */}

            {/* <ReactMediaRecorder
                video
                render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
                    <div>
                        <p>{status}</p>
                        <button onClick={startRecording}>Start Recording</button>
                        <button onClick={stopRecording}>Stop Recording</button>
                        <video src={mediaBlobUrl} controls autoPlay loop />
                    </div>
                )}
            /> */}

            {/* EndButton */}

            {count == null && <button onClick={(e) => {
                setTimeout(() => {
                    settext(reactQuestions[0])
                    setcount(1)
                }, 1000);
            }}>Start</button>}

            {count !== null && <button onClick={handleChange}>End This Interview</button>}

        </div>
    )
}