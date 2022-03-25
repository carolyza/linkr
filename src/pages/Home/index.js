import { useEffect, useState } from "react";
import api from "../../services/api";
import TopBar from "./TopBar";
import useAuth from "../../hooks/useAuth";
import {
  Metainfo,
  LoadContainer,
  Metadata,
  PostContainer,
  Feed,
  NewPost,
  Posts,
  Post,
  Photo,
  PostInfo,
  InputUrl,
  Description,
  Button,
  PostContent,
  Link,
  Img,
  Container,
} from "./style.js";
import { ThreeDots } from "react-loader-spinner";
import Like from "../../components/like/Like"

export default function Home() {
  const { auth } = useAuth();
  const [user, setUser] = useState("");
  const [posts, setPosts] = useState([]);
  const [formData, setFormData] = useState({ link: "", description: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    renderPage();
  }, []);

  function renderPage() {
    renderPosts();
    handleUser();
  }

  async function handleUser() {
    try {
      const { data: userData } = await api.getUser(auth);
      setUser(userData);
      console.log(user);
    } catch (error) {
      console.log(error);
      alert("Erro, tente novamente");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.link) {
      return;
    }
    setIsLoading(true);
    setLoadingPosts(true);

    try {
      await api.sendPost(formData, auth);
      setFormData({ link: "", description: "" });
    } catch (error) {
      console.log(error);
      alert("Houve um erro ao publicar seu link");
    }
    setIsLoading(false);
    renderPosts();
  }

  function handleInputChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function renderPosts() {
    try {
      const { data: postData } = await api.getPosts(auth);

      setPosts(postData);
      setLoadingPosts(false);
    } catch (error) {
      console.log(error);
      if (posts.length !== 0) {
        alert(
          "An error occured while trying to fetch the posts, please refresh the page"
        );
      }
    }
  }

  return (
    <>
      <TopBar {...user} />
      <Feed>
        <PostContainer>
          <h1 className="head">timeline</h1>
          <form onSubmit={handleSubmit}>
            <NewPost>
              <Photo className="hidden" src={user.img} alt="userPhoto" />

              <PostContent>
                <h1>What are you going to share today?</h1>
                <InputUrl
                  type="text"
                  name="link"
                  value={formData.link}
                  placeholder="    http://..."
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
                <Description
                  type="textarea"
                  name="description"
                  value={formData.description}
                  placeholder="Awesome article about #javascript"
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Publishing..." : "Publish"}
                </Button>
              </PostContent>
            </NewPost>
          </form>
          <Posts>
            {loadingPosts ? (
              <LoadContainer>
                <ThreeDots color="#ffffff" height={100} width={100} />
              </LoadContainer>
            ) : posts.length === 0 ? (
              <h1>There are no posts yet</h1>
            ) : (
              posts.map((p, i) => (
                <Post key={i}>
                  <Container>
                    <Photo src={p.img} alt="userPhoto" />
                    <Like id = {p.id} />
                  </Container>

                  <PostInfo>
                    <h2>{p.name}</h2>
                    <h5>{p.description}</h5>
                    <Metadata>
                      <Metainfo>
                        <h4>{p.metadataTitle}</h4>
                        <p>{p.metadataDescription}</p>
                        <Link href={p.link} target="_blank">
                          {p.link}
                        </Link>
                      </Metainfo>
                      <Img src={p.metadataImg}></Img>
                    </Metadata>
                  </PostInfo>
                </Post>
              ))
            )}
          </Posts>
        </PostContainer>
      </Feed>
    </>
  );
}
