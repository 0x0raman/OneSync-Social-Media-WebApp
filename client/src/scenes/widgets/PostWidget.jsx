import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost } from "state";
import {
  Box,
  Divider,
  IconButton,
  Typography,
  useTheme,
  InputBase,
} from "@mui/material";
import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
} from "@mui/icons-material";
import Avatar from "@mui/material/Avatar";
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import SendIcon from "@mui/icons-material/Send";

const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userPicturePath,
  likes,
  comments: originalComments,
}) => {
  const [isComments, setIsComments] = useState(false);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;

  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;

  const [comment, setComment] = useState("");

  const patchLike = async () => {
    const response = await fetch(`http://localhost:3001/posts/${postId}/like`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: loggedInUserId }),
    });
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
  };

  const handleCommentSubmit = async () => {
    if (comment.trim() === "") {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/posts/${postId}/comment`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: loggedInUserId, comment }),
        }
      );

      const updatedPost = await response.json();
      dispatch(setPost({ post: updatedPost }));

      setComment(""); // Clear the comment input
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleCommentSubmit();
    }
  };

  const comments = originalComments.map((comment) => ({
    ...comment,
    userPicturePath: comment.userPicturePath, // Add the userPicturePath property from the original comment
    name: comment.name, // Add the name property from the original comment
  }));
  const loggedInUserPicturePath = useSelector((state) => state.user.picturePath);
  return (
    <WidgetWrapper m="2rem 0">
      <Friend
        friendId={loggedInUserId} // Update to use the loggedInUserId
        name={name}
        subtitle={location}
        userPicturePath={userPicturePath} // Use the userPicturePath of the logged-in user
      />
      <Typography color={main} sx={{ mt: "1rem" }}>
        {description}
      </Typography>
      {picturePath && (
        <img
          width="100%"
          height="auto"
          alt="post"
          style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
          src={`http://localhost:3001/assets/${picturePath}`}
        />
      )}
      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          <FlexBetween gap="0.3rem">
            <IconButton onClick={patchLike}>
              {isLiked ? (
                <FavoriteOutlined sx={{ color: primary }} />
              ) : (
                <FavoriteBorderOutlined />
              )}
            </IconButton>
            <Typography>{likeCount}</Typography>
          </FlexBetween>

          <FlexBetween gap="0.3rem">
            <IconButton onClick={() => setIsComments(!isComments)}>
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{comments.length}</Typography>
          </FlexBetween>
        </FlexBetween>

        <IconButton>
          <ShareOutlined />
        </IconButton>
      </FlexBetween>
      {isComments && (
        <Box mt="0.5rem">
          {comments.map((comment, i) => (
            <Box
              key={`${name}-${i}`}
              display="flex"
              alignItems="flex-start"
              sx={{ m: "0.5rem 0", pl: "1rem" }}
            >
              <Avatar
                sx={{ width: 32, height: 32, mr: "0.5rem" }}
                src={`http://localhost:3001/assets/${comment.userPicturePath}`}
              />
              <Box>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  {comment.name}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: main,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {comment.comment}
                </Typography>
              </Box>
            </Box>
          ))}

          <Divider />
          <Box display="flex" alignItems="center" mt="0.5rem" sx={{ pl: "1rem" }}>
          <Avatar
            sx={{ width: 32, height: 32, mr: "0.5rem" }}
            src={`http://localhost:3001/assets/${loggedInUserPicturePath}`}
          />
            <InputBase
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a comment..."
              fullWidth
              sx={{
                borderRadius: "2rem",
                backgroundColor: palette.neutral.light,
                py: "0.5rem",
                pl: "1rem",
                flexGrow: 1,
                fontSize: "0.875rem",
                lineHeight: "1.3",
                overflowWrap: "break-word",
                wordWrap: "break-word",
                wordBreak: "break-word",
              }}
            />

            <IconButton onClick={handleCommentSubmit}>
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      )}
    </WidgetWrapper>
  );
};

export default PostWidget;