import React from 'react';
import { useEffect, useState } from 'react'

import '../css/App.css'
import { getSongs } from '../hooks/getSongs';
import Song from '../interfaces/Song';

import { createSong } from '../hooks/createSong';
import { Link, useNavigate } from 'react-router-dom';
import { getReviewsBySong } from '../hooks/getReviewsBySong';
import moment from 'moment';
import Review from '../interfaces/Review';


const SearchBar = (props: any ) => {
  return (
    <div>
      <form className="col-20 col-lg-auto mb-3 mb-lg-0 me-lg-3" role="search" id="search-form" onSubmit={props.handleSearchSubmit}>
        <div className="d-flex">
          <input type="search" value={props.searchQuery} className="form-control form-control-dark text-bg-dark" placeholder="Search..."
          aria-label="Search" id="search-input" onChange={props.handleSearchChange}/> 
          <span className="material-symbols-outlined mt-2 ms-3" role="button" onClick={props.handleSearchSubmit}>search</span>
        </div>
      </form>
    </div>
  );
}
interface SongCardProps {
  title: string;
  picture: string;
  artist: string;
  album: string;
  api_id: string;
  genres: string[];
  databaseSongs: Song[];
}
const SongCard: React.FC<SongCardProps> = (props) => {
  const { title, picture, artist, album, api_id, databaseSongs } = props;
  const [reviewCount, setReviewCount] = useState<number | null>(null);
  const [mostRecentReview, setMostRecentReview] = useState<Review | null>(null);
  const navigate = useNavigate();

  const songExistsInDatabase = (apiId: string, songs: Song[]) => {
    return songs.some((song) => song.api_id === apiId);
  };

  const getDatabaseSongId = (apiId: string, songs: Song[]) => {
    const foundSong = songs.find((song) => song.api_id === apiId);
    return foundSong ? foundSong.id : null;
  };


useEffect(() => {
  if (songExistsInDatabase(api_id, databaseSongs)) {
    const songId = getDatabaseSongId(api_id, databaseSongs);
    if (songId) {
      fetchReviewsForSong(songId);
    }
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [api_id, databaseSongs]);

  const handleSongCardClick = () => {
    if (songExistsInDatabase(api_id, databaseSongs)) {
      const songId = getDatabaseSongId(api_id, databaseSongs);
      if (songId) {
        // Use the navigate function to navigate to the song page
        navigate(`/song/${songId}`);
      }
    } else {
      createSongAndRedirect();
    }
  };

  const createSongAndRedirect = async () => {
    try {
      const response = await createSong(title, picture, artist, album, ["Test"], api_id);

      if (response.id) {
        // Use the navigate function to navigate to the newly created song
        navigate(`/song/${response.id}`);
      } else {
        console.error('Failed to create the song in the database.');
      }
    } catch (error) {
      console.error('Error creating the song:', error);
    }
  };

  const fetchReviewsForSong = async (songId: string) => {
    try {
      const reviews = await getReviewsBySong(songId);
      setReviewCount(reviews.length);
      setMostRecentReview(getMostRecentReview(reviews));
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const getMostRecentReview = (reviews: Review[]): Review | null => {
    if (reviews.length === 0) {
      return null;
    }
    const sortedReviews = [...reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return sortedReviews[0];
  };

  return (
    <div className="song-card" >
      <h3 onClick={handleSongCardClick} >{title}</h3>
      <div className="d-flex">
      <img src={picture} alt={title} onClick={handleSongCardClick} className="cursor-pointer" />
        <div className="ms-3 mt-3">
        <p>Artist: {artist}</p>
        {reviewCount !== null && reviewCount > 0 ? (
          <div className="mt-1">
            <p>{reviewCount} Reviews</p>
            {mostRecentReview && (
              <div>
                <p className="mb-0">Review by <Link to={'/user/' + mostRecentReview.user.id} style={{ textDecoration: 'none' }}>{mostRecentReview.user.username}</Link></p>
                <p className="mb-0">{mostRecentReview.title}</p>
                <p>{mostRecentReview.rating}/5</p>
                <p>{moment(mostRecentReview.createdAt).fromNow()}</p>
              </div>
            )}
          </div>
        ) : (
          <p>No reviews posted yet</p>
        )}
        </div>
      </div>
    </div>
  );
};

export type DeezerSong = {
  id: string;
  title: string;
  picture: string;
  artist: string;
  album: string;
  api_id: string;
  genres: string[];
};




const SongSearch = () => {


  const [searchQuery, setSearchQuery] = useState("");
  const [songList, setSongList] = useState<DeezerSong[]>([]);
  const [databaseSongs, setDatabaseSongs] = useState<Song[]>([]);
 
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }
  


  const sortSongsByReviews = async (songs: Song[]) => {
    const songsWithReviewCounts = [];

    for (const song of songs) {
      const reviews = await getReviewsBySong(song.id);
      const reviewCount = reviews.length;
      songsWithReviewCounts.push({ song, reviewCount });
    }

    songsWithReviewCounts.sort((a, b) => b.reviewCount - a.reviewCount);

    const sortedSongs = songsWithReviewCounts.map((item) => item.song);

    return sortedSongs;
  };
  useEffect(() => {
    async function fetchAndSortSongs() {
      try {
        const songs = await getSongs();
        const sortedSongs = await sortSongsByReviews(songs);
        setDatabaseSongs(sortedSongs);
      } catch (error) {
        console.error('Error fetching and sorting songs:', error);
      }
    }

    fetchAndSortSongs();
  }, []);
  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetch(`${process.env.REACT_APP_DEEZER_URL}/deezer/${searchQuery}`)
      .then((res) => res.json())
      .then((response) => {
        const result = response.data.map((song: any) => ({
          id: song.id.toString(),
          title: song.title,
          picture: song.album.cover_medium,
          artist: song.artist.name,
          album: song.album.title,
        }));
        setSongList(result);
        setSearchQuery('');
        
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  };
  return (
    <div className="App">
      <div className="row">
        <div className="col-md-6">
          <div className="left-panel">
            <h2>Top rated</h2>
            <div className="song-list">
              <ul className="list-unstyled">
                {
                  databaseSongs.slice(0, 5).map((song) => (
                    <div className="mb-5">
                      <li key={song.id}>
                        <SongCard
                          title={song.song_name}
                          picture={song.thumbnail}
                          album={song.album}
                          artist={song.artist}
                          api_id={song.api_id}
                          genres={song.genres}
                          databaseSongs={databaseSongs}
                        />
                      </li>
                    </div>
                  ))
                }
              </ul>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="right-panel">
            <div className="d-flex">
              <h2>Search</h2>
              <div className="ms-3">
              <SearchBar
                handleSearchSubmit={handleSearchSubmit}
                handleSearchChange={handleSearchChange}
              />
              </div>
            </div>
            <ul className="list-unstyled">
            {songList.map((song) => (
                      <li key={song.id}>
                        <SongCard
                          title={song.title}
                          picture={song.picture}
                          album={song.album}
                          artist={song.artist}
                          api_id={song.id}
                          genres={song.genres}
                          databaseSongs={databaseSongs}
                        />
                      </li>
                    ))}
              </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongSearch;
