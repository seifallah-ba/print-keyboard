import React, { useState } from "react";
import { useDispatch } from "react-redux";
import * as THREE from "three";
import { setKeycapTexture } from "../../store/slices/textureSlice";

const TextureUploader = ({ onApplyTexture }) => {
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PNG or JPEG image.");
      return;
    }

    // Read the image file
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        // Create a Three.js texture from the image
        const texture = new THREE.Texture(img);
        texture.needsUpdate = true; // Required for canvas-based textures
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1); // Adjust repeat for texture scaling if needed

        // Dispatch texture to Redux store
        dispatch(setKeycapTexture(texture));

        // Pass texture to parent component for applying to keycaps
        if (onApplyTexture) {
          onApplyTexture(texture);
        }

        setError(null);
      };

      img.onerror = () => {
        setError("Failed to load the image. Please try another file.");
      };
    };

    reader.onerror = () => {
      setError("Error reading the file. Please try again.");
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="image-upload">
      <h3>Upload Keycap Image</h3>
      <input
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleImageUpload}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>Upload a PNG or JPEG image to apply as a texture to keycaps.</p>
    </div>
  );
};

export default TextureUploader;
