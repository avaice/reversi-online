import { useState, useEffect } from 'react';

const useAudioPlayer = (audioFileUrl: string, volume: number = 1) => {
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioBufferNode, setAudioBufferNode] = useState<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const fetchAudioData = async () => {
      try {
        const audioContext = new AudioContext();
        setAudioCtx(audioContext);

        const response = await fetch(audioFileUrl);
        const responseBuffer = await response.arrayBuffer();
        const decodedBuffer = await audioContext.decodeAudioData(responseBuffer);
        setAudioBuffer(decodedBuffer);
      } catch (error) {
        console.error('Error fetching or decoding audio:', error);
      }
    };

    fetchAudioData();

    return () => {
      // Clean up the AudioContext when the component unmounts
      if (audioCtx) {
        audioCtx.close().catch((error) => console.error('Error closing AudioContext:', error));
      }
    };
  }, [audioFileUrl]);

  useEffect(() => {
    if (audioCtx && audioBuffer) {
      prepareAudioBufferNode();
    }
  }, [audioCtx, audioBuffer]);

  const prepareAudioBufferNode = () => {
    if (audioCtx && audioBuffer) {
      const bufferNode = audioCtx.createBufferSource();
      bufferNode.buffer = audioBuffer;
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = volume;
      bufferNode.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      setAudioBufferNode(bufferNode);
    }
  };

  const playAudio = () => {
    if (audioBufferNode) {
      audioBufferNode.start(0);
      prepareAudioBufferNode();
    }
  };

  return { playAudio };
};

export default useAudioPlayer;
