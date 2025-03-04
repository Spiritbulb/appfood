import { Account, Avatars, Client, Databases, OAuthProvider, Query } from "react-native-appwrite";
import * as Linking from 'expo-linking';
import { useLocalSearchParams } from "expo-router/build/hooks";
import * as AuthSession from 'expo-auth-session';
import { openAuthSessionAsync } from "expo-web-browser";


export const config = {
  platform: 'com.jsm.platepals',
  endpoint: "https://cloud.appwrite.io/v1",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  hostCollectionId: process.env.EXPO_PUBLIC_APPWRITE_HOST_COLLECTION_ID,
  gallariesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_GALLARIES_COLLECTION_ID,
  reviewsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID,
  fooditemsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_FOODITEMS_COLLECTION_ID,
  foodimageCollectionId: process.env.EXPO_PUBLIC_APPWRITE_FOODIMAGE_COLLECTION_ID

}

export const client = new Client()

  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(config.platform!)


export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);


export async function login() {
  try {
    const redirectUri = Linking.createURL("/");

    const response = await account.createOAuth2Token(
      OAuthProvider.Google,
      redirectUri
    );
    if (!response) throw new Error("Create OAuth2 token failed");

    const browserResult = await openAuthSessionAsync(
      response.toString(),
      redirectUri
    );
    if (browserResult.type !== "success")
      throw new Error("Create OAuth2 token failed");

    const url = new URL(browserResult.url);
    const secret = url.searchParams.get("secret")?.toString();
    const userId = url.searchParams.get("userId")?.toString();
    if (!secret || !userId) throw new Error("Create OAuth2 token failed");

    const session = await account.createSession(userId, secret);
    if (!session) throw new Error("Failed to create session");

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}


export async function logout() {
  try {
    await account.deleteSession('current');
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
export async function getCurrentUser() {
  try {
    const response = await account.get(); //get user details

    //Initialize userAvatar with a default value
    let userAvatar = null;

    if (response.$id && response.name) {
      userAvatar = avatar.getInitials(response.name);
    }

    return {
      ...response,
      avatar: userAvatar ? userAvatar.toString() : null,
    }
  }
  catch (error) {
    console.error(error);
    return null;
  }
}

export async function checkAuth() {
  try {
    const session = await account.getSession("current");
    if (session) {
      console.log("User is logged in:", session);
    } else {
      console.log("Failed to login1");
    }
  } catch (error) {
    console.error("Error checking session:", error);
  }
}

export async function getLatestFooditems() {
  try {
    const result = await databases.listDocuments(
      config.databaseId!,
      config.fooditemsCollectionId!,
      [Query.orderAsc("$createdAt"), Query.limit(5)]
    )

    return result.documents;

  } catch (error) {
    console.error(error);
    return [];
  }


}

export async function getFooditems({ filter, query, limit }: {

  filter: string;
  query: string;
  limit?: number;
}) {
  try {
    const buildQuery = [Query.orderDesc("$createdAt")];

    if (filter && filter !== "All")
      buildQuery.push(Query.equal("type", filter));

    if (query)
      buildQuery.push(
        Query.or([
          Query.search("name", query),
          Query.search("address", query),
          Query.search("type", query),
        ])
      );

    if (limit) buildQuery.push(Query.limit(limit));

    const result = await databases.listDocuments(
      config.databaseId!,
      config.fooditemsCollectionId!,
      buildQuery
    );

    return result.documents;
  } catch (error) {
    console.error(error);
    return [];
  }
}

