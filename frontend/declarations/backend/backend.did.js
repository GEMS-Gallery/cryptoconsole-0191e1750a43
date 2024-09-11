export const idlFactory = ({ IDL }) => {
  const PostInfo = IDL.Record({
    'id' : IDL.Nat,
    'title' : IDL.Text,
    'author' : IDL.Principal,
    'timestamp' : IDL.Int,
  });
  const Post = IDL.Record({
    'id' : IDL.Nat,
    'title' : IDL.Text,
    'content' : IDL.Text,
    'author' : IDL.Principal,
    'timestamp' : IDL.Int,
  });
  return IDL.Service({
    'createPost' : IDL.Func([IDL.Text, IDL.Text], [IDL.Nat], []),
    'getMyPosts' : IDL.Func([], [IDL.Vec(PostInfo)], ['query']),
    'getPost' : IDL.Func([IDL.Nat], [IDL.Opt(Post)], ['query']),
    'getPosts' : IDL.Func([], [IDL.Vec(PostInfo)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
