import { useEffect, useState, useMemo } from "react";
import {
  useParams,
  NavLink,
  useLocation,
  useNavigate,
  Outlet,
} from "react-router-dom";
import {
  followUserService,
  getSingleUserService,
  unfollowUserService,
} from "../services/userServices";
import { useAuth } from "../contexts/AuthProvider";
import { getUserPostsService } from "../services/postServices";
import UserPost from "../components/UserPost";
import { AUTH } from "../common/reducerTypes";
import Button from "../components/Button";
import Modal from "../components/Modal";
import EditProfile from "../components/EditProfile";
import { usePosts } from "../contexts/PostsProvider";
import { faLink, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme } from "../contexts/ThemeProvider";
import Avatar from "../components/Avatar";
import ClipLoader from "react-spinners/ClipLoader";
import { formatPostDate } from "../common/formatPostDate";
import { faCalendar } from "@fortawesome/free-regular-svg-icons";

export function UserProfile() {
  const {
    userData: {
      user: { userDetails, token },
    },
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { userId } = useParams();
  const [userProfile, setUserProfile] = useState({});
  const [loading, setLoading] = useState(true);

  const getUserProfile = async (id) => {
    try {
      const { data, status } = await getSingleUserService(id, token);
      if (status === 200) {
        setUserProfile(data);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserProfile(userId);
  }, [userId, userDetails]);

  return !loading ? (
    <section>
      <header>
        {location?.pathname === `/${userId}` ? (
          <div className="flex items-center gap-4 border-b p-2">
            <button
              className={`h-6 w-6 ${
                theme === "dark" ? "hover:bg-mineShaft" : "hover:bg-gray-100"
              } rounded-full`}
              onClick={() => navigate(-1)}
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <div>
              <h3 className="text-lg font-semibold capitalize">
                {userProfile?.firstName} {userProfile?.lastName}
              </h3>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4 p-2">
              <button
                className={`h-6 w-6 ${
                  theme === "dark" ? "hover:bg-mineShaft" : "hover:bg-gray-100"
                } rounded-full`}
                onClick={() => navigate(`/${userProfile?._id}`)}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold capitalize">
                  {userProfile?.firstName} {userProfile?.lastName}
                </h3>
                <p className="text-xs">@{userProfile?.username}</p>
              </div>
            </div>
            <div className="flex justify-evenly border-b p-2 pb-0">
              <NavLink
                style={({ isActive }) => ({
                  borderBottom: isActive ? "2px solid" : "",
                })}
                className="w-full text-center"
                to={`/${userProfile?._id}/followers`}
              >
                Followers
              </NavLink>
              <NavLink
                style={({ isActive }) => ({
                  borderBottom: isActive ? "2px solid" : "",
                })}
                className="w-full text-center"
                to={`/${userProfile?._id}/following`}
              >
                Following
              </NavLink>
            </div>
          </div>
        )}
      </header>
      <Outlet />
    </section>
  ) : (
    <section className="grid h-full w-full place-items-center">
      <ClipLoader
        color={"#E7846D"}
        loading={loading}
        size={100}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </section>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const {
    userData: {
      user: { userDetails, token },
    },
    authDispatch,
  } = useAuth();
  const {
    postsData: { posts },
  } = usePosts();
  const { theme } = useTheme();
  const [userProfile, setUserProfile] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [open, setOpen] = useState(false);

  const { userId } = useParams();

  const isUserProfile = useMemo(
    () => userDetails._id === userId,
    [userDetails, userId]
  );

  const getUserProfile = async (id) => {
    try {
      const { data, status } = await getSingleUserService(id, token);
      if (status === 200) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getAllUserPosts = async (userId) => {
    try {
      const {
        data: { posts },
      } = await getUserPostsService(userId, token);
        setUserPosts(posts);
    } catch (error) {
      console.error(error);
    }
  };

  const followUnfollowHandler = async (serviceFn, id, token) => {
    try {
      const { data, status } = await serviceFn(id, token);
      if (status === 200) {
        authDispatch({ type: AUTH.USER_FOLLOW, payload: data.user });
        setUserProfile(data.followUser);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getUserProfile(userId);
  }, [userId, userDetails]);

  useEffect(() => {
    if (userProfile?._id) {
      getAllUserPosts(userProfile._id);
    }
  }, [userProfile?._id, posts]);

  return (
    <section className="py-2">
      <section>
        <section className="relative">
          <img
            src={userProfile?.profileBg}
            alt=""
            className="h-[150px] w-full rounded-md object-cover"
          />
          <div
            className={`absolute -bottom-[30px] left-4 h-[100px] w-[100px] cursor-pointer overflow-hidden rounded-full border-2`}
          >
            <img
              src={userProfile?.profileImg}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        </section>
        <section className="flex flex-col items-start gap-1 p-2">
          {isUserProfile ? (
            <Modal
              className="self-end rounded-full border border-mineShaftLight px-2 py-1"
              open={open}
              setOpen={setOpen}
              modalFor={"Edit Profile"}
            >
              {<EditProfile setOpen={setOpen} />}
            </Modal>
          ) : 
            <Button
              onClick={() =>
                followUnfollowHandler(
                  followUserService,
                  userProfile?._id,
                  token
                )
              }
              className={
                "self-end rounded-full border border-mineShaftLight px-2 py-1"
              }
            >
              {userDetails?.followings?.find(
              ( _id ) => _id === userProfile?._id
            ) ? "Following" : "Follow" }
            </Button>
          }
          <div>
            <p>
              {userProfile?.firstName} {userProfile?.lastName}
            </p>
            <h3 className="text-sm">@{userProfile?.username}</h3>
          </div>
          <div className={`flex flex-col gap-1 text-gray-400`}>
            {userProfile?.bio && (
              <p className={` text-xs`}>{userProfile?.bio}</p>
            )}
            {userProfile?.portfolio && (
              <a
                href={userProfile?.portfolio}
                target="_blank"
                className="flex items-center gap-1"
              >
                <FontAwesomeIcon icon={faLink} className="text-xs" />
                <p className="text-xs hover:underline">
                  {userProfile?.portfolio}
                </p>
              </a>
            )}
            <p className="flex items-center gap-2 text-xs hover:underline">
              <FontAwesomeIcon icon={faCalendar} className="text-xs" />
              {formatPostDate(userProfile?.createdAt)}
            </p>
          </div>
          <div className="flex gap-4 text-sm">
            <p
              className="cursor-pointer"
              onClick={() => navigate(`/${userProfile?._id}/following`)}
            >
              {userProfile?.followings?.length}{" "}
              <span className="hover:underline">Following</span>
            </p>
            <p
              className="cursor-pointer"
              onClick={() => navigate(`/${userProfile?._id}/followers`)}
            >
              {userProfile?.followers?.length}{" "}
              <span className="hover:underline">Followers</span>
            </p>
          </div>
        </section>
      </section>
      <section className="flex flex-col gap-2 border-t border-mineShaftLight pt-2">
        {userPosts?.length ? (
          userPosts?.map((post) => <UserPost key={post._id} userPost={post} />)
        ) : (
          <h4 className="mt-4 w-full text-center">No Posts.</h4>
        )}
      </section>
    </section>
  );
}

export function UserFollowing() {
  const {
    userData: {
      user: { userDetails, token },
    },
  } = useAuth();
  const { followUnfollowHandler } = usePosts();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({});
  const { userId } = useParams();

  const getUserProfile = async (id) => {
    try {
      const { data, status } = await getSingleUserService(id, token);
      if (status === 200) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getUserProfile(userId);
  }, [userId, userDetails]);

  return userProfile?.followings?.length ? (
    <section className="flex flex-col gap-2">
      {userProfile?.followings?.map((us) => (
        <section
          key={us?._id}
          onClick={() => navigate(`/${us?._id}`)}
          className="grid w-full cursor-pointer grid-cols-[1fr_auto] items-center gap-2 border-b border-mineShaftLighter p-2 last:border-b-0"
        >
          <div className="flex items-center gap-2">
            <Avatar onClick={() => {}} profileUrl={us?.profileImg} />
            <div className="leading-5">
              <p className="line-clamp-1 text-sm">
                {us?.firstName} {us?.lastName}
              </p>
              <p className="line-clamp-1 text-xs">@{us?.username}</p>
              <small>{us?.bio}</small>
            </div>
          </div>
            <Button
              onClick={(e) => {
                e.stopPropagation()
                followUnfollowHandler(
                  followUserService,
                  us?._id,
                  token
                )
              }}
              className={
                "self-end rounded-full border border-mineShaftLight px-2 py-1"
              }
            >
              {userDetails?.followings?.find(( _id ) => _id === us?._id) ? "Following" : "Follow"}
            </Button>
        </section>
      ))}
    </section>
  ) : (
    <p className="w-full p-4 text-center">No following yet.</p>
  );
}

export function UserFollowers() {
  const {
    userData: {
      user: { userDetails, token },
    },
  } = useAuth();
  const { followUnfollowHandler } = usePosts();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({});
  const { userId } = useParams();

  const getUserProfile = async (id, token) => {
    try {
      const { data, status } = await getSingleUserService(id, token);
      if (status === 200) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getUserProfile(userId, token);
  }, [userId, userDetails]);

  return userProfile?.followers?.length ? (
    <section className="flex flex-col gap-2">
      {userProfile?.followers?.map((us) => (
        <section
          key={us?._id}
          onClick={() => navigate(`/${us?._id}`)}
          className="grid w-full cursor-pointer grid-cols-[1fr_auto] items-center gap-2 border-b border-mineShaftLighter p-2 last:border-b-0"
        >
          <div className="flex items-center gap-2">
            <Avatar onClick={() => {}} profileUrl={us?.profileImg} />
            <div className="leading-5">
              <p className="line-clamp-1 text-sm">
                {us?.firstName} {us?.lastName}
              </p>
              <p className="line-clamp-1 text-xs">@{us?.username}</p>
              <small>{us?.bio}</small>
            </div>
          </div>
          {userDetails?.followers?.find(({ _id }) => _id === us?._id) ? (
            <Button
              onClick={() =>
                followUnfollowHandler(
                  unfollowUserService,
                  userProfile?._id,
                  token
                )
              }
              className={
                "self-end rounded-full border border-mineShaftLight px-2 py-1"
              }
            >
              Following
            </Button>
          ) : (
            <Button
              onClick={() =>
                followUnfollowHandler(
                  followUserService,
                  userProfile?._id,
                  token
                )
              }
              className={
                "self-end rounded-full border border-mineShaftLight px-2 py-1"
              }
            >
              Follow
            </Button>
          )}
        </section>
      ))}
    </section>
  ) : (
    <p className="w-full p-4 text-center">No followers yet.</p>
  );
}
