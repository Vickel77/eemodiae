export type PlatformAudioTrack = {
  /** Stable id so the same source can be toggled from multiple buttons. */
  id: string;
  src: string;
  title: string;
  subtitle?: string;
};

export type PlatformAudioStatus = {
  track: PlatformAudioTrack | null;
  playing: boolean;
  /** True while a track is loaded and not fully stopped (playing or paused mid-session). */
  active: boolean;
  currentTime: number;
  duration: number;
  /** Whether the ListenButton / anchor for the active track is in the viewport. */
  anchorInView: boolean;
};
