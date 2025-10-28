export interface IGDBGame {
  id: number;
  name: string;
  summary?: string;
  storyline?: string;
  cover?: IGDBCover;
  artworks?: IGDBArtwork[];
  screenshots?: IGDBScreenshot[];
  genres?: IGDBGenre[];
  platforms?: IGDBPlatform[];
  release_dates?: IGDBReleaseDate[];
  involved_companies?: IGDBInvolvedCompany[];
  rating?: number;
  rating_count?: number;
  aggregated_rating?: number;
  aggregated_rating_count?: number;
  game_modes?: IGDBGameMode[];
  themes?: IGDBTheme[];
  first_release_date?: number;
  url?: string;
}

export interface IGDBCover {
  id: number;
  url: string;
  image_id: string;
}

export interface IGDBArtwork {
  id: number;
  url: string;
  image_id: string;
}

export interface IGDBScreenshot {
  id: number;
  url: string;
  image_id: string;
}

export interface IGDBGenre {
  id: number;
  name: string;
}

export interface IGDBPlatform {
  id: number;
  name: string;
  abbreviation?: string;
}

export interface IGDBReleaseDate {
  id: number;
  date: number;
  human: string;
  platform?: IGDBPlatform;
  region?: number;
}

export interface IGDBInvolvedCompany {
  id: number;
  company: IGDBCompany;
  developer: boolean;
  publisher: boolean;
}

export interface IGDBCompany {
  id: number;
  name: string;
}

export interface IGDBGameMode {
  id: number;
  name: string;
}

export interface IGDBTheme {
  id: number;
  name: string;
}

export interface IGDBAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export enum IGDBCategory {
  MAIN_GAME = 0,
  DLC_ADDON = 1,
  EXPANSION = 2,
  BUNDLE = 3,
  STANDALONE_EXPANSION = 4,
  MOD = 5,
  EPISODE = 6,
  SEASON = 7,
  REMAKE = 8,
  REMASTER = 9,
  EXPANDED_GAME = 10,
  PORT = 11,
  FORK = 12,
}
