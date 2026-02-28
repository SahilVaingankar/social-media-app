// import {
//   Avatar,
//   AvatarBadge,
//   AvatarFallback,
//   AvatarImage,
// } from "@/components/ui/avatar";
// import { CameraIcon, PlusIcon } from "lucide-react";
// import { useState } from "react";

// export function UploadProfilePic({
//   type = "form",
// }: {
//   type: "form" | "profile";
// }) {
//   const [image, setImage] = useState<string>("vercel.svg");

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (!file.type.startsWith("image/")) {
//       alert("Please upload a valid image");
//       return;
//     }

//     const imageUrl = URL.createObjectURL(file);
//     setImage(imageUrl);
//   };

//   return (
//     <>
//       {type === "form" ? (
//         <div className="relative inline-block">
//           <Avatar className="h-24 w-24">
//             <AvatarImage src={image} />
//             <AvatarFallback>PP</AvatarFallback>
//           </Avatar>
//           <label htmlFor="addprofile" className="cursor-pointer">
//             <AvatarBadge className="absolute bottom-0 right-0 h-6 w-6">
//               <input
//                 type="file"
//                 id="addprofile"
//                 accept="image/*"
//                 className="hidden"
//                 onChange={handleImageChange}
//               />

//               <CameraIcon className="h-4 w-4 text-white" />
//             </AvatarBadge>
//           </label>
//         </div>
//       ) : (
//         <div className="relative inline-block">
//           <Avatar className="h-24 w-24">
//             <AvatarImage src="https://github.com/pranathip.png" />
//             <AvatarFallback>PP</AvatarFallback>
//           </Avatar>
//           <AvatarBadge className="absolute bottom-0 right-0 h-6 w-6">
//             <PlusIcon />
//           </AvatarBadge>
//         </div>
//       )}
//     </>
//   );
// }

// ok i remmember it now, selectedImage is selected image on childern its cleanup is handled on child the cropped image is handled by react-easy-crop the we pass that croped image to parent handle creation and deletion and cleanup on parent as we need to clean it up onSubmit which exixsts on the parent  and pass the blob to child then i set its returned value to setDisplayImage state to use it on children for UI

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { CameraIcon } from "lucide-react";
import Cropper from "react-easy-crop";
import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

type Props = {
  initialImage?: string;
  onImageSelect?: (file: File) => Promise<string>;
  size?: number;
  // register: any;
};

export function UploadProfilePic({
  initialImage = "/vercel.svg",
  onImageSelect,
  size = 96,
}: Props) {
  const { register, setValue } = useFormContext();
  const avatarInput = register("avatarUrl" as const);
  const [displayImage, setDisplayImage] = useState<string>(initialImage);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [open, setOpen] = useState(false);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Cleanup displayImage URLs
  useEffect(() => {
    return () => {
      if (selectedImage.startsWith("blob:")) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [displayImage, selectedImage]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    avatarInput.onChange(e);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Invalid file type");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedImage(objectUrl);
    setOpen(true);
  };

  const onCropComplete = (_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const getCroppedImage = async () => {
    if (!selectedImage || !croppedAreaPixels) return;

    const image = new Image();
    image.src = selectedImage;

    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx?.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
    );

    return new Promise<File | null>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return resolve(null);

        const file = new File([blob], "profile.jpg", {
          type: "image/jpeg",
        });

        resolve(file);
      }, "image/jpeg");
    });
  };

  const handleCropConfirm = async () => {
    const croppedFile = await getCroppedImage();
    if (!croppedFile) return;

    // Keep the cropped file in react-hook-form submit payload
    setValue("avatarUrl", croppedFile, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    if (onImageSelect) {
      const objectUrl = await onImageSelect(croppedFile);
      setDisplayImage(objectUrl);
    } else {
      const objectUrl = URL.createObjectURL(croppedFile);
      setDisplayImage(objectUrl);
    }
    setOpen(false);
  };

  return (
    <>
      {/* Avatar */}
      <div className="relative inline-block">
        <Avatar
          className="overflow-hidden"
          style={{ width: size, height: size }}>
          <AvatarImage src={displayImage} />
          <AvatarFallback>PP</AvatarFallback>
        </Avatar>

        <AvatarBadge
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 h-7 w-7 cursor-pointer">
          <CameraIcon className="h-4 w-4 text-white" />
        </AvatarBadge>

        <input
          {...avatarInput}
          ref={(e) => {
            avatarInput.ref(e);
            fileInputRef.current = e;
          }}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </div>

      {/* Crop Modal */}
      {open && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white p-4 rounded-xl w-100">
            <div className="relative h-75 w-full">
              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Zoom Slider */}
            <div className="mt-4">
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1 bg-gray-300 rounded">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropConfirm}
                className="px-3 py-1 bg-black text-white rounded">
                Save
              </button>{" "}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
