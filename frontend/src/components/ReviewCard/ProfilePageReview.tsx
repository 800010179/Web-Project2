import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { likeReview } from '../../hooks/likeReview';
import { editReview } from '../../hooks/editReview';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

interface ProfilePageReviewProps {
  id: string;
  song_name: string;
  song_genres: string[];
  song_artist: string;
  song_thumbnail: string;
  rating: number;
  title: string;
  comment: string;
  username: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  likes: string[];
  index: number;
  loggedUserId: string;
  handleReviewDeletion: (reviewId: string) => void; 
}

const ProfilePageReview: React.FC<ProfilePageReviewProps> = (props) => {
  const {
    id,
    song_name,
    song_genres,
    song_artist,
    song_thumbnail,
    rating,
    title,
    comment,
    username,
    userId,
    createdAt,
    updatedAt,
    likes,
    index,
    loggedUserId,
    handleReviewDeletion,
  } = props;
  const createdAtDate = new Date(createdAt);
  const updatedAtDate = new Date(updatedAt);
  const editedString = (updatedAtDate > createdAtDate ? '(edited)' : '');
  const [likesOfReview, setLikesOfReview] = useState(likes);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLiked, setHasLiked] = useState(likes.includes(loggedUserId));
  const [isEditing, setIsEditing] = useState(false);
  const [editedRating, setEditedRating] = useState(rating);
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedComment, setEditedComment] = useState(comment);
  const [originalRating] = useState(rating); 
  const [editedText, setEditedText] = useState(editedString);
  const [validated, setValidated] = useState(false);

  const handleToggleLikeReview = async (reviewId: string) => {
    setIsLoading(true);
    const token = localStorage.getItem("token") || "";
    const newLikes = await likeReview(reviewId, token);

    setLikesOfReview(newLikes);
    setIsLoading(false);
    setHasLiked(newLikes.includes(loggedUserId));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    if(form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
    }else {
    const isRatingEdited = editedRating !== originalRating;
    const isTitleEdited = editedTitle !== title;
    const isCommentEdited = editedComment !== comment;

    if (!isRatingEdited && !isTitleEdited && !isCommentEdited) {
      setIsEditing(false);
      return;
    }

    const token = localStorage.getItem("token") || "";
    await editReview(
      token,
      id,
      isRatingEdited ? editedRating : undefined,
      isCommentEdited ? editedComment : undefined, 
      isTitleEdited ? editedTitle : undefined 
    );

    setEditedRating(editedRating);
    if(editedText !== '(edited)'){
        setEditedText('(edited)');
    }
    
    setEditedTitle(editedTitle);
    setEditedComment(editedComment);

    setIsEditing(false);
    }

    setValidated(true);
  };

  const handleCancelEdit = () => {
    setEditedRating(originalRating);
    setEditedTitle(title);
    setEditedComment(comment);

    setIsEditing(false);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this review?");

    if (confirmed) {
      handleReviewDeletion(id); 
    }
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRating = parseInt(e.target.value);
    if (newRating >= 1 && newRating <= 5) {
      setEditedRating(newRating);
    }
  };

  const maxCharacters = 100; 
  const [showFullText, setShowFullText] = useState(false);

  return (
    <div key={index} className="col-md-5 mb-3">
      <div className="card">
        <div className="card-body card-min-height">
          <div className="d-flex justify-content-end">
          {userId === loggedUserId && !isEditing && (
                <span role="button" className="material-symbols-outlined" onClick={handleEdit}>edit</span>
              )}
              {userId === loggedUserId && !isEditing && (
                <span role="button" className="material-symbols-outlined ms-3" onClick={handleDelete}>delete</span>
              )}
              {isEditing ? (
                <div>
                  <span role="button" className="material-symbols-outlined" onClick={handleCancelEdit}>close</span>
                </div>
              ): null}
          </div>
          <h4 className="card-text">By: <Link key={index} to={'/user/' + userId} style={{ textDecoration: 'none' }}>{username}</Link></h4>
          {isEditing ? (
            <div>
              <Form noValidate validated={validated} onSubmit={handleSaveEdit}>
                <Form.Group className="card-text mt-2" controlId="review-title">
                  <Form.Label><h5>Title</h5></Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Title"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    minLength={5}
                    maxLength={50}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a valid title.
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="card-text mt-2" controlId="review-rating">
                  <Form.Label><h5>Rating</h5></Form.Label>
                  <Form.Control
                    required
                    type="number"
                    placeholder="Rating"
                    value={editedRating}
                    onChange={handleRatingChange}
                    min={1}
                    max={5}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a rating between 1 and 5.
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="card-text mt-2" controlId="review-comment">
                  <Form.Label><h5>Comment</h5></Form.Label>
                  <Form.Control as ="textarea" rows={5}
                    required
                    placeholder="Comment"
                    value={editedComment}
                    onChange={(e) => setEditedComment(e.target.value)}
                    minLength={10}
                    maxLength={500}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a valid comment.
                  </Form.Control.Feedback>
                  <Button variant="primary" type="submit" className="mt-2">
                    Save
                  </Button>
                  <Button
                    variant="danger"
                    className="mt-2 ms-2"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                </Form.Group>
              </Form>
            </div>
          ) : (
            
            <div>
                <img
                    src={song_thumbnail}
                    className="card-img-top mb-3"
                    alt={song_name}
                    style={{ width: '100%', height: '250px', objectFit: 'cover' }}
                    onError={({currentTarget}) => {
                        currentTarget.onerror = null;
                        currentTarget.src = "not_found.png"
                    }}
                />
                <h4 className="card-title">{song_name}</h4>
                <p className="card-text mb-1">{song_artist}</p>
                <div className="d-flex gap-2">
                    {song_genres.map((genre, genreIndex) => (
                        <p key={genreIndex} className="card-text mr-3">{genre}</p>
                    ))}
                </div>
              <h4 className="card-text mt-4">
                {title}
              </h4>
              <p className="card-text">
            {showFullText ? editedComment : editedComment.slice(0, maxCharacters)}
            {editedComment.length > maxCharacters && (
            <button
              onClick={() => setShowFullText(!showFullText)}
              className="btn btn-link"
            >
              {showFullText ? 'Read less' : 'Read more'}
            </button>
          )}
            </p>

              <div className="d-flex">
              <h4 className="card-text">{editedRating}/5</h4>
              <button className="ms-2"
                onClick={() => handleToggleLikeReview(id)}
                disabled={isLoading}
                style={{
                  textShadow: hasLiked ? "0px 0px 15px #FF0000" : "none",
                  fontSize: "20px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                💖
                <span className="ms-1 shadow-none">
                  {likesOfReview.length}
                </span>
              </button>
              
              </div>
            </div>
          )}
          <div className="d-flex">
            <h4 className="card-text">
              {moment(createdAtDate).fromNow()}
            </h4>
            <p className="text-muted ms-1 mt-1"><small>{editedText}</small></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePageReview;
