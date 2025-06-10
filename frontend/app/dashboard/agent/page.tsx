'use client';
import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { auriClient } from '../../../lib/index';
export default function AgentPage() {
  const [listening, setListening] = useState(false);
  const [conversation, setConversation] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

  const speak = (text: string) => {
    if (!synth) return;
    synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    
    utterance.onstart = () => setIsProcessing(true);
    utterance.onend = () => setIsProcessing(false);
    
    synth.speak(utterance);
  };

  const processUserInput = async (userInput: string) => {
    setIsProcessing(true);
    try {
     
      const response = await auriClient.sendToAuri(userInput);
      
      setConversation(prev => [
        ...prev,
        `You: ${userInput}`,
        `Auri: ${response.text}`
      ]);
      speak(response.text);
      
      if (response.audio) {
        const audioContext = new AudioContext();
        const buffer = await audioContext.decodeAudioData(response.audio);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
      }
    } catch (error) {
      console.error('Error processing input:', error);
      setConversation(prev => [
        ...prev,
        `You: ${userInput}`,
        `Auri: Sorry, I encountered an error processing your request.`
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const startListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in your browser. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onresult = (event: any) => {
      const userSpeech = event.results[0][0].transcript;
      processUserInput(userSpeech);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setListening(false);
    };

    recognition.onend = () => {
      if (listening) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleClick = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      startListening();
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synth) {
        synth.cancel();
      }
    };
  }, [synth]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-start pt-12 px-4 pb-8">
     
      <div className="flex flex-col items-center mb-8">
        <div className="relative h-24 w-24 mb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full shadow-lg animate-pulse opacity-75"></div>
          <div className="relative h-full w-full bg-gray-800 rounded-full flex items-center justify-center border-2 border-purple-500/50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          Auri Voice Agent
        </h1>
        <p className="text-gray-400 mt-2">Your personal voice assistant</p>
      </div>

      <div className="w-full max-w-md flex flex-col items-center">
  
        <button
          onClick={handleClick}
          disabled={isProcessing}
          className={`relative h-24 w-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
            listening
              ? 'bg-gradient-to-br from-red-600 to-pink-600 transform scale-110'
              : 'bg-gradient-to-br from-purple-600 to-blue-600 hover:scale-105'
          } ${isProcessing ? 'opacity-90' : ''}`}
        >
          {isProcessing ? (
            <Loader2 className="h-12 w-12 animate-spin" />
          ) : listening ? (
            <MicOff className="h-12 w-12" />
          ) : (
            <Mic className="h-12 w-12" />
          )}
          {listening && (
            <div className="absolute inset-0 rounded-full border-4 border-red-400/50 animate-ping opacity-75"></div>
          )}
        </button>

        <p className="mt-4 text-sm text-gray-400">
          {isProcessing
            ? listening
              ? 'Listening...'
              : 'Processing...'
            : listening
            ? 'Listening for your voice'
            : 'Tap to speak with Auri'}
        </p>
        <button
          onClick={handleClick}
          className={`mt-6 px-6 py-3 rounded-full font-medium transition-colors ${
            listening
              ? 'bg-red-600/90 hover:bg-red-700/90'
              : 'bg-purple-600/90 hover:bg-purple-700/90'
          }`}
        >
          {listening ? 'Stop Listening' : 'Start Conversation'}
        </button>
      </div>
      <div className="w-full max-w-2xl mt-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 overflow-y-auto max-h-80 border border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-purple-300 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
              clipRule="evenodd"
            />
          </svg>
          Conversation History
        </h2>
        <div className="space-y-3">
          {conversation.length > 0 ? (
            conversation.map((line, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg ${
                  line.startsWith('Auri:')
                    ? 'bg-purple-900/30 border-l-4 border-purple-500'
                    : 'bg-gray-700/50 border-l-4 border-gray-500'
                }`}
              >
                <p className="font-medium">
                  {line.startsWith('Auri:') ? (
                    <span className="text-purple-300">Auri</span>
                  ) : (
                    <span className="text-blue-300">You</span>
                  )}
                  : <span className="text-gray-100">{line.split(':')[1]}</span>
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              Your conversation with Auri will appear here...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}