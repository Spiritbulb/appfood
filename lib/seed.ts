import { ID } from "react-native-appwrite";
import { databases, config } from "./appwrite";
import {
  hostImages,
  gallaryImages,
  fooditemsImages,
  reviewImages,
} from "./data";

const COLLECTIONS = {
  HOST: config.hostCollectionId,
  REVIEWS: config.reviewsCollectionId,
  GALLARIES: config.gallariesCollectionId,
  FOODITEMS: config.fooditemsCollectionId, 
};

function getRandomSubset<T>(
  array: T[],
  minItems: number,
  maxItems: number
): T[] {
  if (minItems > maxItems) {
    throw new Error("minItems cannot be greater than maxItems");
  }
  if (minItems < 0 || maxItems > array.length) {
    throw new Error(
      "minItems or maxItems are out of valid range for the array"
    );
  }

  // Generate a random size for the subset within the range [minItems, maxItems]
  const subsetSize =
    Math.floor(Math.random() * (maxItems - minItems + 1)) + minItems;

  // Create a copy of the array to avoid modifying the original
  const arrayCopy = [...array];

  // Shuffle the array copy using Fisher-Yates algorithm
  for (let i = arrayCopy.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [arrayCopy[i], arrayCopy[randomIndex]] = [
      arrayCopy[randomIndex],
      arrayCopy[i],
    ];
  }

  // Return the first `subsetSize` elements of the shuffled array
  return arrayCopy.slice(0, subsetSize);
}

async function seed() {
  try {
    // Clear existing data from all collections
    for (const key in COLLECTIONS) {
      const collectionId = COLLECTIONS[key as keyof typeof COLLECTIONS];
      const documents = await databases.listDocuments(
        config.databaseId!,
        collectionId!
      );
      for (const doc of documents.documents) {
        await databases.deleteDocument(
          config.databaseId!,
          collectionId!,
          doc.$id
        );
      }
    }

    console.log("Cleared all existing data.");

    // Seed Hosts
    const hosts = []; // Changed to lowercase for consistency
    for (let i = 1; i <= 5; i++) {
      const host = await databases.createDocument(
        config.databaseId!,
        COLLECTIONS.HOST!,
        ID.unique(),
        {
          name: `Host ${i}`,
          email: `host${i}@example.com`,
          avatar: hostImages[Math.floor(Math.random() * hostImages.length)],
        }
      );
      hosts.push(host); // Fixed typo: changed `host.push(host)` to `hosts.push(host)`
    }
    console.log(`Seeded ${hosts.length} hosts.`);

    // Seed Reviews
    const reviews = [];
    for (let i = 1; i <= 20; i++) {
      const review = await databases.createDocument(
        config.databaseId!,
        COLLECTIONS.REVIEWS!,
        ID.unique(),
        {
          name: `Reviewer ${i}`,
          avatar: reviewImages[Math.floor(Math.random() * reviewImages.length)],
          review: `This is a review by Reviewer ${i}.`,
          rating: Math.floor(Math.random() * 5) + 1, // Rating between 1 and 5
        }
      );
      reviews.push(review);
    }
    console.log(`Seeded ${reviews.length} reviews.`);

    // Seed Galleries
    const gallaries = [];
    for (const image of gallaryImages) {
      const gallary = await databases.createDocument(
        config.databaseId!,
        COLLECTIONS.GALLARIES!,
        ID.unique(),
        { image }
      );
      gallaries.push(gallary);
    }

    console.log(`Seeded ${gallaries.length} galleries.`);

    // Seed Food Items
    for (let i = 1; i <= 20; i++) {
      const assignedhost = hosts[Math.floor(Math.random() * hosts.length)]; // Fixed reference to `hosts`

      const assignedReviews = getRandomSubset(reviews, 5, 7); // 5 to 7 reviews
      const assignedGallaries = getRandomSubset(gallaries, 3, 8); // 3 to 8 galleries

      const image =
        fooditemsImages.length - 1 >= i
          ? fooditemsImages[i]
          : fooditemsImages[
              Math.floor(Math.random() * fooditemsImages.length)
            ];

            const nationalities = ["Italian", "French", "Mexican", "Indian", "Chinese"];

      const fooditem = await databases.createDocument(
        config.databaseId!,
        COLLECTIONS.FOODITEMS!,
        ID.unique(),
        {
          image: image,
          title: `Food Item ${i}`,
          ingredients:`This is the description for Food Item ${i}.`,
          nationality: nationalities[Math.floor(Math.random() * nationalities.length)],
          portions:Math.floor(Math.random() * 5) + 1, // Assign default portion size if undefined,
          rating: Math.floor(Math.random() * 5) + 1,
          price: Math.floor(Math.random() * 9000) + 1000,
          geolocation: `192.168.1.${i}, 192.168.1.${i}`,
          reviews: assignedReviews.map((review) => review.$id),
          host: assignedhost.$id,
          
        }
      );

      console.log(`Seeded food item: ${fooditem.title}`);
    }

    console.log("Data seeding completed.");
  } catch (error) {
    console.error("Error seeding data:", error);
  }
}

export default seed;