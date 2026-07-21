import { redirect } from "next/navigation";

export default function TrackRedirectPage({ params }: { params: { slug: string } }) {
  redirect(`/track/${params.slug}/beginner`);
}
