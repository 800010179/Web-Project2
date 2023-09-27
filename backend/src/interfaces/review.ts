import {Document} from 'mongoose';
import {Song} from './song';
import {User} from './user';
interface Review extends Document {
    likes: number;
    song: Song;
    user: User;
    rating: number;
    comment: string;
    date: Date;
}

export {Review}