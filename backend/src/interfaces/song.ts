import {Document} from 'mongoose';
// test
interface Song extends Document {
    song_name: string;
    thumbnail: string;
    artist: string;
    album: string;
    genres: string[];
    api_id: string;
}

interface SongTest {
    id?: string;
    song_name?: string;
    songName?: string;
    thumbnail?: string;
    artist?: string;
    album?: string;
    genres?: string[];
    api_id?: string;
}

export {Song, SongTest}
