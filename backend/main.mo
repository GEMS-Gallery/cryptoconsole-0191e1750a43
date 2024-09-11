import Bool "mo:base/Bool";
import Nat "mo:base/Nat";

import Array "mo:base/Array";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";

actor {
  type Post = {
    id: Nat;
    title: Text;
    content: Text;
    timestamp: Int;
    author: Principal;
  };

  type PostInfo = {
    id: Nat;
    title: Text;
    timestamp: Int;
    author: Principal;
  };

  stable var nextPostId: Nat = 0;
  stable var posts: [(Nat, Post)] = [];

  public shared(msg) func createPost(title: Text, content: Text) : async Nat {
    let id = nextPostId;
    let timestamp = Time.now();
    let author = msg.caller;
    let post: Post = {
      id;
      title;
      content;
      timestamp;
      author;
    };
    posts := Array.append(posts, [(id, post)]);
    nextPostId += 1;
    id
  };

  public query func getPosts() : async [PostInfo] {
    Array.map(posts, func((_, post): (Nat, Post)): PostInfo {
      {
        id = post.id;
        title = post.title;
        timestamp = post.timestamp;
        author = post.author;
      }
    })
  };

  public query func getPost(id: Nat) : async ?Post {
    let result = Array.find(posts, func((postId, _): (Nat, Post)): Bool { postId == id });
    switch (result) {
      case (null) { null };
      case (?(_, post)) { ?post };
    }
  };

  public shared query(msg) func getMyPosts() : async [PostInfo] {
    let userPosts = Array.filter(posts, func((_, post): (Nat, Post)): Bool {
      post.author == msg.caller
    });
    Array.map(userPosts, func((_, post): (Nat, Post)): PostInfo {
      {
        id = post.id;
        title = post.title;
        timestamp = post.timestamp;
        author = post.author;
      }
    })
  };
}
