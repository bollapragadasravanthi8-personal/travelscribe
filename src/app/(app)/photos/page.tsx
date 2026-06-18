import type { Metadata } from "next";
import { Camera } from "lucide-react";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import { PhotoListGrouped } from "@/components/photos/photo-list-grouped";
import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { listAllPhotosForUser } from "@/services/photo-service";

export const metadata: Metadata = {
  title: "Photos",
};

export default async function PhotosPage() {
  const user = await getCurrentUser();
  const photos = await listAllPhotosForUser(user.id);

  return (
    <>
      <PageHeader
        title="Photos"
        description="All photos across your trips."
      />

      {photos.length === 0 ? (
        <EmptyState
          icon={Camera}
          title="No photos yet"
          description="Upload photos from a travel day to see them here."
        />
      ) : (
        <PhotoListGrouped photos={photos} />
      )}
    </>
  );
}
