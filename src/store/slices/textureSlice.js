import { createSlice } from "@reduxjs/toolkit";
import initial_settings from "../../config/settings_user_default.json";

const textureSlice = createSlice({
  name: "texture",
  initialState: initial_settings.texture,
  reducers: {
    setKeycapTexture: (state, action) => {
      state.keycapTexture = action.payload;
    },
  },
});

export const { setKeycapTexture } = textureSlice.actions;

export const selectUploadedTexture = (state) => state.texture.keycapTexture;

export default textureSlice.reducer;
