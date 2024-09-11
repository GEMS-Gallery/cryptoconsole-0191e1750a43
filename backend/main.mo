import Bool "mo:base/Bool";
import Nat "mo:base/Nat";

import Array "mo:base/Array";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Iter "mo:base/Iter";

actor {
  type Post = {
    id: Nat;
    title: Text;
    content: Text;
    timestamp: Int;
  };

  type PostInfo = {
    id: Nat;
    title: Text;
    timestamp: Int;
  };

  stable var nextPostId: Nat = 0;
  stable var posts: [(Nat, Post)] = [];

  public func createPost(title: Text, content: Text) : async Nat {
    let id = nextPostId;
    let timestamp = Time.now();
    let post: Post = {
      id;
      title;
      content;
      timestamp;
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
}
