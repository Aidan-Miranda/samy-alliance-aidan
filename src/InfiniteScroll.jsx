import React, { useState, useEffect } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import "./infiniteScroll.css"

export const IMAGES_QUERY = gql`
  query Images($after: String, $title: String) {
    images(after: $after, title: $title) {
      edges {
        cursor
        node {
          id
          author
          picture
          title
          price
          likesCount
          createdAt
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

const LIKE_IMAGE_MUTATION = gql`
  mutation LikeImage($imageId: ID!) {
    likeImage(input: { imageId: $imageId, clientMutationId: "Aidan" }) {
      clientMutationId
      image {
        id
        liked
        likesCount
      }
    }
  }
`;

const InfiniteScroll = () => {
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState("");
  const [query, setQuery] = useState("");

  const { data, fetchMore, loading, error, refetch } = useQuery(IMAGES_QUERY, {
    variables: { after: null, title: query },
    notifyOnNetworkStatusChange: true
  });

  const [prevQuery, setPrevQuery] = useState("");

  const [likeImageMutation] = useMutation(LIKE_IMAGE_MUTATION);

  useEffect(() => {
    if (query !== prevQuery) {
      setImages([]);
      setPrevQuery(query);
      refetch({ after: null, title: query || "" });
    }
  }, [query, prevQuery, refetch]);

  useEffect(() => {
    if (data) {
      const newImages = data.images.edges.map((edge) => edge.node);

      if (query) {
        setImages(newImages);
      } else {
        setImages((prev) => [...prev, ...newImages]);
      }
    }
  }, [data, query]);

  const loadMore = () => {
    if (!data?.images.pageInfo.hasNextPage) return;
    fetchMore({
      variables: { after: data.images.pageInfo.endCursor },
    });
  };

  const handleSearch = (event) => {
    setTitle(event.target.value);
  };

  const executeSearch = () => {
    setQuery(title || "");
  };

  const likeImage = async (imageId, currentLiked, currentLikesCount) => {
    try {
      setImages((prevImages) =>
        prevImages.map((image) =>
          image.id === imageId
            ? {
              ...image,
              liked: !currentLiked,
              likesCount: currentLiked ? currentLikesCount - 1 : currentLikesCount + 1,
            }
            : image
        )
      );

      await likeImageMutation({
        variables: {
          imageId,
        },
      });

    } catch (error) {
      console.error("Error liking/unliking the image:", error);
      setImages((prevImages) =>
        prevImages.map((image) =>
          image.id === imageId
            ? {
              ...image,
              liked: currentLiked,
              likesCount: currentLiked ? currentLikesCount + 1 : currentLikesCount - 1,
            }
            : image
        )
      );
    }
  };

  useEffect(() => {
    executeSearch();
  }, [title]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 200
      ) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [data]);

  if (error) return <p>Error loading images</p>;

  return (
    <>
      <div className="header">
        <div className="logo">
          <img src="/samy-s.svg" alt="S" />
          <img src="/samy-a.svg" alt="A" />
          <img src="/samy-m.svg" alt="M" />
          <img src="/samy-y.svg" alt="Y" />
        </div>
        <input
          className="searchbar"
          type="text"
          value={title}
          onChange={handleSearch}
          placeholder="You're looking for something?"
        />
      </div>
      <div className="infinite-scroll">
        <div className="gallery">
          {images.map((image) => (
            <div key={image.id} className="image-card">
              <div className="price-tag">
                <svg viewBox="0 0 100 50" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="grayGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#e4e4e7', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  <polygon points="0,0 100,0 0,50" fill="white" />
                </svg>
                <span>{image.price.toFixed(2)}<span className="euro-span">€</span></span>
              </div>
              <img src={`${image.picture}?random=${image.id}`} alt={image.title} />
              <div className="card-info">
                <p className="title">
                  {image.title.length > 18 ? `${image.title.slice(0, 18)}...` : image.title}</p>
                <p><span className="gray-text">by</span> {image.author}</p>
              </div>
              <div className="icons">
                <div>
                  <button onClick={() => likeImage(image.id, image.liked, image.likesCount)} className="icon-button">
                    <img src="/heart-icon.svg" alt="heart icon" />
                  </button>
                  <p>{image.likesCount}</p>
                </div>
                <div>
                  <div class="icon-wrapper">
                    <img src="/share-icon.svg" alt="share icon" />
                  </div>
                  <p>0</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default InfiniteScroll;