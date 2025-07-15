import * as THREE from "three";
import { keyTexture } from "./texture";
import { initial_settings } from "../../store/startup";
import { TextureLoader } from "three/src/loaders/TextureLoader.js";
import ambiantOcclusionPath from "../../assets/dist/shadow-key-noise.png";
import lightMapPath from "../../assets/materials/white.png";
import asset from "../../assets/bg2.jpg";

const loader = new TextureLoader();
const ambiantOcclusionMap = loader.load(ambiantOcclusionPath);
ambiantOcclusionMap.wrapS = THREE.RepeatWrapping;
ambiantOcclusionMap.wrapT = THREE.RepeatWrapping;

const lightMap = loader.load(lightMapPath);
lightMap.wrapS = THREE.RepeatWrapping;
lightMap.wrapT = THREE.RepeatWrapping;

var computed_materials = {};

export const KEY_MATERIAL_STATES = {
  DEFAULT: 0,
  ACTIVE: 1,
  HIGHLIGHTED: 2,
};

export const setKeyMaterialState = (mesh, state, isoent) => {
  if (state === KEY_MATERIAL_STATES.DEFAULT) {
    setMaterialIndexes(mesh, 2, 3, isoent);
  }
  if (state === KEY_MATERIAL_STATES.ACTIVE) {
    setMaterialIndexes(mesh, 0, 1, isoent);
  }
  if (state === KEY_MATERIAL_STATES.HIGHLIGHTED) {
    setMaterialIndexes(mesh, 0, 1, isoent);
  }
};

const setMaterialIndexes = (mesh, side, top, isoent) => {
  let threshold = isoent ? 10 : 6;
  mesh.geometry.faces.forEach((f, i) => {
    let isTop = i < threshold || i === 8;
    f.materialIndex = isTop ? top : side;
  });
  mesh.geometry.groupsNeedUpdate = true;
};

//generate top and side materials for a single color set
// Create gradient texture
function createGradientTexture(
  greenIntensity = 100,
  yellowIntensity = 200,
  direction = "horizontal"
) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");

  // Create gradient
  let gradient;
  if (direction === "horizontal") {
    gradient = context.createLinearGradient(0, 0, size, 0);
  } else if (direction === "vertical") {
    gradient = context.createLinearGradient(0, 0, 0, size);
  } else {
    // diagonal
    gradient = context.createLinearGradient(0, 0, size, size);
  }

  gradient.addColorStop(
    0,
    `rgb(${greenIntensity}, 255, ${greenIntensity / 2})`
  );
  gradient.addColorStop(1, `rgb(255, 255, ${yellowIntensity / 3})`);

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// let  currentTexture = createGradientTexture();

const imgUrl = asset;
let currentTexture = loader.load(
  imgUrl,
  (texture) => {
    texture.needsUpdate = true;
  },
  undefined,
  (error) => {
    console.error("Error loading texture:", error);
  }
);
const getMaterialSet = (opts, offset) => {
  let key = `mat${opts.background}`;

  let legendTexture = keyTexture(opts);
  let top = new THREE.MeshLambertMaterial({
    map: legendTexture,
    lightMap: lightMap,
    lightMapIntensity: 0,
  });
  top.map.minFilter = THREE.LinearFilter;

  if (computed_materials[key]) {
    return [computed_materials[key].clone(), top];
  }

  let side = new THREE.MeshStandardMaterial({
    aoMap: ambiantOcclusionMap,
    // color: '#f83c03',
    aoMapIntensity: 0.4,
    lightMap: lightMap,
    lightMapIntensity: 0,
    map: currentTexture, // Use uploaded texture if available
  });
  computed_materials[key] = side;
  return [side, top];
};

export const keyMaterials = (opts) => {
  let base = getMaterialSet(opts);
  opts.color = initial_settings.keys.activeColor;
  opts.background = initial_settings.keys.activeBackground;
  let active = getMaterialSet(opts);
  let materials = [...active, ...base];
  return materials;
};

export const updateMaterials = (mesh, opts) => {
  let base = getMaterialSet(opts);
  mesh.material[2] = base[0];
  mesh.material[3] = base[1];
  setKeyMaterialState(mesh, KEY_MATERIAL_STATES.DEFAULT, opts.isIsoEnt);
};

export const updateActiveMaterials = (mesh, opts) => {
  opts.color = initial_settings.keys.activeColor;
  opts.background = initial_settings.keys.activeBackground;
  let active = getMaterialSet(opts);
  mesh.material[0] = active[0];
  mesh.material[1] = active[1];
  setKeyMaterialState(mesh, KEY_MATERIAL_STATES.DEFAULT, opts.isIsoEnt);
};

//simulate highlighting by toggling lightmap intensity
export const enableHighlight = (key_mesh, layer) => {
  key_mesh.material.forEach((m) => (m.lightMapIntensity = 0.2));
};
export const disableHighlight = (key_mesh, layer) => {
  key_mesh.material.forEach((m) => (m.lightMapIntensity = 0));
};
