import React from "react";
import * as THREE from "three";
import { useDispatch } from "react-redux";

import ColorwayList from "../colorway/ColorwayList";
import BoardOptions from "./BoardOptions";
import About from "./About";
import { setKeycapTexture } from "../../store/slices/textureSlice";
import TextureUploader from "./TextureUploader";

export default function OptionsPane(props) {
  const applyTextureToKeycaps = (texture) => {
    // Logic to apply texture to keycaps (see below)
    console.log("apply texture", texture);
  };

  return (
    <>
      <TextureUploader onApplyTexture={applyTextureToKeycaps} />
      <BoardOptions />
      <ColorwayList setTab={props.setTab} />
      <About />
    </>
  );
}
