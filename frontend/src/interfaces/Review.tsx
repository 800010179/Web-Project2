interface Review {
    id: string,
    title: string,
    comment: string
    rating: number,
    song : {
        song_name: string,
        thumbnail: string,
        genres: string[],
        album: string,
        artist: string
    }
    likes: string[],
    user: {
        id: string,
        username: string,
        email: string
    }
    createdAt: string,
    updatedAt: string
}

export default Review;