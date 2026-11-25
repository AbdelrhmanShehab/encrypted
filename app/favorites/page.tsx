import type { Metadata } from "next";
import FavoritesClient from "./FavoritesClient";

export const metadata: Metadata = {
  title: "Your Favorites",
  description: "View your saved menswear picks from Encrypted and add them to your bag.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
