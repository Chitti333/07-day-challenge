import { useState, useRef } from 'react'

export function useVoiceInput(onTranscript) {
    const [isListening, setIsListening] = useState(false)
    const [error, setError] = useState('')
    const recognitionRef = useRef(null)

    const startListening = () => {
        setError('')

        // Check browser support
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition

        if (!SpeechRecognition) {
            setError('Voice input not supported in this browser. Try Chrome.')
            return
        }

        const recognition = new SpeechRecognition()
        recognitionRef.current = recognition

        recognition.continuous = true       // keep listening until stopped
        recognition.interimResults = true   // show words as they're spoken
        recognition.lang = 'en-US'

        recognition.onstart = () => setIsListening(true)

        recognition.onresult = (event) => {
            // Combine all results into one transcript string
            let transcript = ''
            for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript
            }
            onTranscript(transcript)
        }

        recognition.onerror = (event) => {
            setError(`Mic error: ${event.error}. Please allow microphone access.`)
            setIsListening(false)
        }

        recognition.onend = () => setIsListening(false)

        recognition.start()
    }

    const stopListening = () => {
        recognitionRef.current?.stop()
        setIsListening(false)
    }

    const toggleListening = () => {
        isListening ? stopListening() : startListening()
    }

    return { isListening, toggleListening, error }
}