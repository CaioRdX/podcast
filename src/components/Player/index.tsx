import Image from 'next/image';
import {  useRef, useEffect, useState } from 'react';
import Slider from 'rc-slider';

import 'rc-slider/assets/index.css';

import { usePlayer } from '../../contexts/PlayerContext';
import styles from './styles.module.scss';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export default function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [ progress, setProgress ] = useState(0);

  const { episodeList,
     currentEpisodeIndex,
      isPlaying, 
      isLooping,
      isShuffling,
      togglePlay, 
      toggleLoop,
      toggleShuffle,
      hasPrevious,
      hasNext, 
      setPlayingState, 
      playNext,
      playPrevious,
      clearPlayerState,
     } = usePlayer();

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

  if (isPlaying) {
    audioRef.current.play();
  } else {
    audioRef.current.pause();
  }

  }, [isPlaying] )

  function setupProgressListener(){
    audioRef.current.currentTime = 0;

    audioRef.current.addEventListener('timeupdate', () => {
      setProgress(Math.floor(audioRef.current.currentTime));
    });
  }

function handleEpisodeEnded() {
  if (hasNext) {
    playNext()
  } else {
    clearPlayerState()
  }
}

function  handleSeek(amount: number) {
  audioRef.current.currentTime = amount;
  setProgress(amount);

}
  
  const episode = episodeList[currentEpisodeIndex]

  return(
   <div className={styles.playerContainer}>
     <header>
    <img src="/playing.svg" alt="tocando agora" />
    <strong>Tocando agora</strong>
     </header>

    { episode ? (
      <div className={styles.currentEpisode}>
        <Image
          width={592}
          height={592} 
          src={episode.thumbnail} 
          objectFit="cover" 
          />

          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
                </div>

    ) : (
      <div className={styles.emptyPlayer}>
      <strong>Selecione um Podcast para ouvir</strong>
      </div>
 
    ) }

     <footer className={! episode ? styles.empty: ''}>
       <div className={styles.progress}>
       <span>{convertDurationToTimeString(progress)}</span> 


       <div className={styles.slider}>
        {episode ? (
         <Slider 
         max={episode.duration} //retonar o numero de seg q tem no episodio
         value={progress} // o tanto q o ep progrediu
         onChange={handleSeek} // oq acontece quando arrasta a bolinha
         trackStyle={{backgroundColor: '#04d361'}} //mudar a cor do progresso da musica
         railStyle={{ backgroundColor: '#9f75ff'}} //mudar a cor do progresso da musica q ainda n passou
         handleStyle={{ borderColor:'#04d361', borderWidth: 4}}
          />
        ) : (
           <div className={styles.emptySlider}/>
        )}

       </div> 
         <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span> 
       </div>

       { episode && (
         <audio
         src={episode.url} //sempre q o src mudar
         ref={audioRef} // a musica
         loop={isLooping}
         autoPlay // vai tocar sozinha por causa do autoPlay
         onEnded={handleEpisodeEnded}
         onPlay={() => setPlayingState(true)} //testar o botao de play e pause do teclado, pois o meu n da 
         onPause={() => setPlayingState(false)} // testar pq nao tem esses botoes
         onLoadedMetadata= {setupProgressListener}
         />
          )}
       
       <div className={styles.buttons}>
         <button 
         type="button" 
         disabled={!episode || episodeList.length === 1} 
         onClick={toggleShuffle} 
         className={isShuffling ? styles.isActive : ''}
         >

           <img src="/shuffle.svg" alt="embaralhar"/>
         </button>

         <button type="button" onClick={playPrevious} disabled={!episode || !hasPrevious}>
           <img src="/play-previous.svg" alt="tocar a anterior"/>
         </button>

         <button type="button" className={styles.playButton} disabled={!episode} onClick={togglePlay}>
          { isPlaying 
          ? <img src="/pause.svg" alt="Tocar"/>
          : <img src="/play.svg" alt="Tocar" />
        }
         </button>

         <button type="button" onClick={playNext} disabled={!episode || !hasNext}>
           <img src="/play-next.svg" alt="Tocar a Próxima"/>
         </button>

         <button type="button" disabled={!episode} onClick={toggleLoop} className={isLooping ? styles.isActive : ''}>
           
           <img src="/repeat.svg" alt="Repetir"/>
         </button>

         </div>
     </footer>
   </div>
  );
}