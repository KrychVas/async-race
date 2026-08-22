import bgMusic1 from '../assets/audio/desifreemusic-royalty-free-background-music-audio-tracks-no-copyright-406801.mp3';
import bgMusic2 from '../assets/audio/alex-morgan-car-car-music-545487.mp3';
import bgMusic3 from '../assets/audio/kontraa-unlock-me-amapiano-music-149058.mp3';
import bgMusic4 from '../assets/audio/nastelbom-royalty-free-music-501720.mp3';

import startSoundUrl from '../assets/audio/dragon-studio-car-engine-372477.mp3';
import policeSoundUrl from '../assets/audio/dragon-studio-police-siren-397963.mp3';
import crashSoundUrl from '../assets/audio/dragon-studio-car-crash-sound-376882.mp3';
import honkSoundUrl from '../assets/audio/dragon-studio-car-honk-386166.mp3';

export type SoundKey = 'start' | 'police' | 'crash' | 'honk';

export interface TrackOption {
  id: string;
  name: string;
  url: string;
}

export const TRACK_OPTIONS: TrackOption[] = [
  { id: 'synthwave', name: 'Synthwave Drive', url: bgMusic1 },
  { id: 'cyberpunk', name: 'Cyberpunk Beat', url: bgMusic2 },
  { id: 'amapiano', name: 'Amapiano Groove', url: bgMusic3 },
  { id: 'energetic', name: 'Night Racer', url: bgMusic4 },
];

class AudioManager {
  private isMuted: boolean = false;
  private currentTrackId: string = 'synthwave';
  private bgMusic: HTMLAudioElement;
  private soundUrls: Map<SoundKey, string> = new Map();

  constructor() {
    this.bgMusic = new Audio(bgMusic1);
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.3;

    this.soundUrls.set('start', startSoundUrl);
    this.soundUrls.set('police', policeSoundUrl);
    this.soundUrls.set('crash', crashSoundUrl);
    this.soundUrls.set('honk', honkSoundUrl);
  }

  get isMutedState(): boolean {
    return this.isMuted;
  }

  get currentTrack(): string {
    return this.currentTrackId;
  }

  setTrack(trackId: string): void {
    const selected = TRACK_OPTIONS.find((t) => t.id === trackId);
    if (!selected) return;

    this.currentTrackId = trackId;
    const wasPlaying = !this.bgMusic.paused;
    this.bgMusic.pause();
    this.bgMusic = new Audio(selected.url);
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.3;

    if (wasPlaying && !this.isMuted) {
      void this.bgMusic.play();
    }
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;

    if (this.isMuted) {
      this.bgMusic.pause();
    } else {
      void this.bgMusic.play();
    }

    return this.isMuted;
  }

  playBgMusic(): void {
    if (!this.isMuted) {
      void this.bgMusic.play();
    }
  }

  playSound(key: SoundKey): void {
    if (this.isMuted) return;

    const url = this.soundUrls.get(key);
    if (!url) return;

    const audio = new Audio(url);
    const SOUND_VOLUME = 0.5;
    audio.volume = SOUND_VOLUME;
    void audio.play();
  }
}

export const audioManager = new AudioManager();
