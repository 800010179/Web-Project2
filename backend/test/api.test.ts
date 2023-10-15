import mongoose from "mongoose";
import randomstring from "randomstring";
import app from '../src/app';
import { UserTest } from "../src/interfaces/user";
import { deleteUser, getUserById, getUserList, loginUser, postUser, putUser } from "./userFunctions";
import LoginMessageResponse from "../src/interfaces/LoginMessageResponse";
import { deleteSong, getSongById, getSongList, postSong, updateSong } from "./songFunctions";
import { SongTest } from "../src/interfaces/song";
import { ReviewTest } from "../src/interfaces/review";
import { deleteReview, getReviewById, likeReview, postReview, updateReview } from "./reviewFunctions";


describe('Testing api', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.DATABASE_URL as string);
    });
    
    afterAll(async () => {
        await mongoose.connection.close();
    });
    let userData: LoginMessageResponse;

 
    let songData: SongTest;
    let reviewData: ReviewTest;
    const testUser: UserTest = {
        username: 'Tester ' + randomstring.generate(5),
        email: randomstring.generate(7) + '@tester.fi',
        password: 'testpassword',
    };

    const testSong: SongTest = {
        song_name: 'Test Song ' + randomstring.generate(7),
        thumbnail: 'testthumbnail',
        artist: 'Test Artist ' + randomstring.generate(7),
        album: 'Test Album ' + randomstring.generate(7),
        genres: ['Test Genre ' + randomstring.generate(7)],
        api_id: 'testapiid',
    };


    /* USER FUNCTIONS */

    it('should create a new user', async () => {
        await postUser(app, testUser);
    });
    
    it('should login user', async () => {
        userData = await loginUser(app, testUser);
    });



    it('should return array of users', async () => {
        await getUserList(app);
    });
    
    it('should return single user', async () => {
        await getUserById(app, userData.user.id!);
    });

    it('should update user', async () => {
        await putUser(app, userData.token!);
    });


    /* Song functions */

    it('should create a new song', async () => {
        songData = await postSong(app, testSong);
    });

    it('should return array of songs', async () => {
        await getSongList(app);
    });

    it('should return single song', async () => {
        await getSongById(app, songData.id!);
    });

    it('should update song', async () => {
        await updateSong(app, songData.id!);
    });

    /* Review functions */
    
    
    it('should create a new review', async () => {
        const title = 'Test Review ' + randomstring.generate(7);
        const comment = 'Test Comment ' + randomstring.generate(7);
        const rating = 3;
       reviewData = await postReview(app, title, comment, rating, songData.id!, userData.token!);
    });

    it('should return array of reviews', async () => {
        await getSongList(app);
    });

    it('should return single review', async () => {
        await getReviewById(app, reviewData.id!);
    });

    it('should update review', async () => {
        await updateReview(app, reviewData.id!, 4, "new title", "new comment", userData.token!);
    });

    it('should like review', async () => {
        await likeReview(app, reviewData.id!, userData.token!);
    });

    /* Delete functions */

    it('should delete current review', async () => {
        await deleteReview(app, reviewData.id!, userData.token!);
    });

    it('should delete current user', async () => {
        await deleteUser(app, userData.token!);
    });

    it('should delete current song', async () => {
        await deleteSong(app, songData.id!);
    });

});


