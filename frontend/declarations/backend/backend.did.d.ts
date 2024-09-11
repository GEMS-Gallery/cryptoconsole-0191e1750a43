import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Post {
  'id' : bigint,
  'title' : string,
  'content' : string,
  'timestamp' : bigint,
}
export interface PostInfo {
  'id' : bigint,
  'title' : string,
  'timestamp' : bigint,
}
export interface _SERVICE {
  'createPost' : ActorMethod<[string, string], bigint>,
  'getPost' : ActorMethod<[bigint], [] | [Post]>,
  'getPosts' : ActorMethod<[], Array<PostInfo>>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
