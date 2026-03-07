import { 
  collection, getDocs, query, orderBy, addDoc, 
  serverTimestamp, doc, updateDoc, increment, 
  arrayUnion, arrayRemove, getDoc, deleteDoc, where 
} from "firebase/firestore";
import { db } from "../firebase";
import { Post, Comment } from "../types";

const postsCollection = collection(db, "posts");

/**
 * Fetches all scrolls from the Great Hall
 * @param sortBy 'created_at' for Newest or 'likes' for Top
 * @param tagFilter Optional tag string to filter results
 */
export const getPosts = async (sortBy: 'created_at' | 'likes' = 'created_at', tagFilter: string | null = null): Promise<Post[]> => {
  try {
    let q;
    
    if (tagFilter) {
      q = query(
        postsCollection, 
        where("tags", "array-contains", tagFilter.toLowerCase()), 
        orderBy(sortBy, "desc")
      );
    } else {
      q = query(postsCollection, orderBy(sortBy, "desc"));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      // FIX: Tell TypeScript to treat 'data' as any so we can access properties
      const data = doc.data() as any;
      
      let dateString = "Ancient Times";
      if (data.created_at) {
        dateString = data.created_at.toDate().toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric'
        });
      }

      return { 
        id: doc.id, 
        title: data.title || "Untitled Decree",
        content: data.content || "",
        author: data.author || "Unknown Knight",
        likes: data.likes || 0,
        commentsCount: data.commentsCount || 0,
        liked_by: data.liked_by || [],
        date: dateString,
        tags: Array.isArray(data.tags) ? data.tags : [] 
      } as Post;
    });
  } catch (error) {
    console.error("The librarian failed to retrieve the scrolls:", error);
    return [];
  }
};

/**
 * Scribes a new decree into the collection
 */
export const createPost = async (title: string, content: string, authorName: string, tags: string[] = []) => {
  try {
    const cleanTags = tags.map(t => t.toLowerCase().trim());
    
    await addDoc(postsCollection, {
      title, 
      content, 
      author: authorName,
      likes: 0, 
      commentsCount: 0, 
      tags: cleanTags, 
      liked_by: [],
      created_at: serverTimestamp()
    });
  } catch (error) {
    console.error("The quill broke while scribing:", error);
    throw error;
  }
};

/**
 * Toggles a user's fealty (like) on a post
 */
export const toggleFealty = async (postId: string, userId: string, isAdding: boolean) => {
  const postRef = doc(db, "posts", postId);
  await updateDoc(postRef, {
    likes: increment(isAdding ? 1 : -1),
    liked_by: isAdding ? arrayUnion(userId) : arrayRemove(userId)
  });
};

/**
 * Removes a post from the database
 */
export const banishPost = async (postId: string) => {
  const postRef = doc(db, "posts", postId);
  await deleteDoc(postRef);
};

/**
 * Retrieves a single post by ID
 */
export const getPostById = async (postId: string): Promise<Post | null> => {
  try {
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      // FIX: Tell TypeScript to treat 'data' as any here as well
      const data = postSnap.data() as any;
      let dateString = "Ancient Times";
      if (data.created_at) {
        dateString = data.created_at.toDate().toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric'
        });
      }
      return { 
        id: postSnap.id, 
        ...data, 
        date: dateString,
        tags: Array.isArray(data.tags) ? data.tags : [] 
      } as Post;
    }
    return null;
  } catch (error) {
    console.error("The post has been lost to time:", error);
    return null;
  }
};

/**
 * Fetches all comments for a specific post
 */
export const getComments = async (postId: string): Promise<Comment[]> => {
  const commentsRef = collection(db, "posts", postId, "comments");
  const q = query(commentsRef, orderBy("created_at", "asc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    // FIX: Apply 'as any' to comment data retrieval
    const data = doc.data() as any;
    return {
      id: doc.id,
      author: data.author,
      text: data.text,
      parent_id: data.parent_id || null,
      timestamp: data.created_at?.toDate()?.toLocaleString() || "Just now"
    } as any;
  });
};

/**
 * Adds a new voice (comment) to a post
 */
export const addComment = async (postId: string, author: string, text: string, parentId: string | null = null) => {
  const commentsRef = collection(db, "posts", postId, "comments");
  const postRef = doc(db, "posts", postId);
  await addDoc(commentsRef, { author, text, parent_id: parentId, created_at: serverTimestamp() });
  await updateDoc(postRef, { commentsCount: increment(1) });
};