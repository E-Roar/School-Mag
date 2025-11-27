import { useCursor, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useAtom } from "jotai";
import { easing } from "maath";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bone,
  BoxGeometry,
  Color,
  Float32BufferAttribute,
  MathUtils,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
  Uint16BufferAttribute,
  Vector3,
} from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { pageAtom } from "../store";
import { useBookData } from "../context/BookDataContext";

const easingFactor = 0.5; // Controls the speed of the easing
const easingFactorFold = 0.3; // Controls the speed of the easing
const insideCurveStrength = 0.18; // Controls the strength of the curve
const outsideCurveStrength = 0.05; // Controls the strength of the curve
const turningCurveStrength = 0.09; // Controls the strength of the curve

const PAGE_HEIGHT = 1.71; // keeps similar physical height
const PAGE_WIDTH = PAGE_HEIGHT * (210 / 297); // A4 aspect ratio (~0.707:1)
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

const pageGeometry = new BoxGeometry(
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  2
);

pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);

const position = pageGeometry.attributes.position;
const vertex = new Vector3();
const skinIndexes = [];
const skinWeights = [];

for (let i = 0; i < position.count; i++) {
  // ALL VERTICES
  vertex.fromBufferAttribute(position, i); // get the vertex
  const x = vertex.x; // get the x position of the vertex

  const rawIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH)); // calculate the skin index
  const skinIndex = Math.min(PAGE_SEGMENTS - 1, rawIndex);
  let skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH; // calculate the skin weight
  const nextIndex = Math.min(PAGE_SEGMENTS, skinIndex + 1);

  skinIndexes.push(skinIndex, nextIndex, 0, 0); // set the skin indexes
  skinWeights.push(1 - skinWeight, skinWeight, 0, 0); // set the skin weights
}

pageGeometry.setAttribute(
  "skinIndex",
  new Uint16BufferAttribute(skinIndexes, 4)
);
pageGeometry.setAttribute(
  "skinWeight",
  new Float32BufferAttribute(skinWeights, 4)
);

const whiteColor = new Color("white");
const emissiveColor = new Color("orange");

const pageMaterials = [
  new MeshStandardMaterial({
    color: whiteColor,
  }),
  new MeshStandardMaterial({
    color: "#111",
  }),
  new MeshStandardMaterial({
    color: whiteColor,
  }),
  new MeshStandardMaterial({
    color: whiteColor,
  }),
];

const Page = ({
  number,
  frontSrc,
  backSrc,
  page,
  opened,
  bookClosed,
  pageCount,
  ...props
}) => {
  // Validate image URLs - fall back to white pixel if invalid
  // 1x1 white pixel data URI
  const defaultTexture = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';
  const safeFrontSrc = (frontSrc && typeof frontSrc === 'string' && frontSrc.length > 0)
    ? frontSrc
    : defaultTexture;
  const safeBackSrc = (backSrc && typeof backSrc === 'string' && backSrc.length > 0)
    ? backSrc
    : defaultTexture;

  const [picture, picture2] = useTexture([safeFrontSrc, safeBackSrc]);
  // const pictureRoughness = useTexture(`/textures/book-cover-roughness.jpg`);
  picture.colorSpace = picture2.colorSpace = SRGBColorSpace;
  const group = useRef();
  const turnedAt = useRef(0);
  const lastOpened = useRef(opened);

  const skinnedMeshRef = useRef();

  const isCover = number === 0;

  const manualSkinnedMesh = useMemo(() => {
    const bones = [];
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      let bone = new Bone();
      bones.push(bone);
      if (i === 0) {
        bone.position.x = 0;
      } else {
        bone.position.x = SEGMENT_WIDTH;
      }
      if (i > 0) {
        bones[i - 1].add(bone); // attach the new bone to the previous bone
      }
    }
    const skeleton = new Skeleton(bones);

    const materials = [
      ...pageMaterials,
      new MeshStandardMaterial({
        color: whiteColor,
        map: picture,
        ...(isCover
          ? {
            roughness: 0.5,
          }
          : {
            roughness: 0.4,
          }),
        emissive: emissiveColor,
        emissiveIntensity: 0,
      }),
      new MeshStandardMaterial({
        color: whiteColor,
        map: picture2,
        roughness: 0.4,
        emissive: emissiveColor,
        emissiveIntensity: 0,
      }),
    ];
    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, []);

  useEffect(() => {
    const frontMaterial = manualSkinnedMesh.material[4];
    const backMaterial = manualSkinnedMesh.material[5];

    frontMaterial.map = picture;
    backMaterial.map = picture2;

    if (isCover) {
      frontMaterial.roughnessMap = null;
      frontMaterial.roughness = 0.5;
    } else {
      frontMaterial.roughnessMap = null;
      frontMaterial.roughness = 0.4;
    }

    backMaterial.roughnessMap = null;
    backMaterial.roughness = 0.4;

    frontMaterial.needsUpdate = true;
    backMaterial.needsUpdate = true;
  }, [isCover, manualSkinnedMesh, picture, picture2]);

  // useHelper(skinnedMeshRef, SkeletonHelper, "red");

  useFrame((_, delta) => {
    if (!skinnedMeshRef.current) {
      return;
    }

    const emissiveIntensity = highlighted ? 0.22 : 0;
    skinnedMeshRef.current.material[4].emissiveIntensity =
      skinnedMeshRef.current.material[5].emissiveIntensity = MathUtils.lerp(
        skinnedMeshRef.current.material[4].emissiveIntensity,
        emissiveIntensity,
        0.1
      );

    if (lastOpened.current !== opened) {
      turnedAt.current = +new Date();
      lastOpened.current = opened;
    }
    let turningTime = Math.min(400, new Date() - turnedAt.current) / 400;
    turningTime = Math.sin(turningTime * Math.PI);

    let targetRotation = opened ? -Math.PI / 2 : Math.PI / 2;
    if (!bookClosed) {
      targetRotation += degToRad(number * 0.8);
    }

    const bones = skinnedMeshRef.current.skeleton.bones;
    for (let i = 0; i < bones.length; i++) {
      const target = i === 0 ? group.current : bones[i];

      const insideCurveIntensity = i < 8 ? Math.sin(i * 0.2 + 0.25) : 0;
      const outsideCurveIntensity = i >= 8 ? Math.cos(i * 0.3 + 0.09) : 0;
      const turningIntensity =
        Math.sin(i * Math.PI * (1 / bones.length)) * turningTime;
      let rotationAngle =
        insideCurveStrength * insideCurveIntensity * targetRotation -
        outsideCurveStrength * outsideCurveIntensity * targetRotation +
        turningCurveStrength * turningIntensity * targetRotation;
      let foldRotationAngle = degToRad(Math.sign(targetRotation) * 2);
      if (bookClosed) {
        if (i === 0) {
          rotationAngle = targetRotation;
          foldRotationAngle = 0;
        } else {
          rotationAngle = 0;
          foldRotationAngle = 0;
        }
      }
      easing.dampAngle(
        target.rotation,
        "y",
        rotationAngle,
        easingFactor,
        delta
      );

      const foldIntensity =
        i > 8
          ? Math.sin(i * Math.PI * (1 / bones.length) - 0.5) * turningTime
          : 0;
      easing.dampAngle(
        target.rotation,
        "x",
        foldRotationAngle * foldIntensity,
        easingFactorFold,
        delta
      );
    }
  });

  const [_, setPage] = useAtom(pageAtom);
  const [highlighted, setHighlighted] = useState(false);
  useCursor(highlighted);

  return (
    <group
      {...props}
      ref={group}
      onPointerEnter={(e) => {
        e.stopPropagation();
        setHighlighted(true);
      }}
      onPointerLeave={(e) => {
        e.stopPropagation();
        setHighlighted(false);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setPage(opened ? number : number + 1);
        setHighlighted(false);
      }}
      onClick={(e) => {
        // Allow click to propagate for camera controls
        // e.stopPropagation(); 
      }}
    >
      <primitive
        object={manualSkinnedMesh}
        ref={skinnedMeshRef}
        position-z={-number * PAGE_DEPTH + page * PAGE_DEPTH}
      />
    </group>
  );
};

export const Book = ({ ...props }) => {
  const { selectedBook } = useBookData();
  const pages = selectedBook?.pages ?? [];
  const pageCount = pages.length;
  const [page] = useAtom(pageAtom);
  const [delayedPage, setDelayedPage] = useState(page);
  const targetPage = Math.min(page, pageCount);

  useEffect(() => {
    pages.forEach((pageData) => {
      if (pageData.frontSrc) {
        useTexture.preload(pageData.frontSrc);
      }
      if (pageData.backSrc) {
        useTexture.preload(pageData.backSrc);
      }
    });
    // useTexture.preload(`/textures/book-cover-roughness.jpg`);
  }, [pages]);

  useEffect(() => {
    let timeout;
    const goToPage = () => {
      setDelayedPage((current) => {
        if (targetPage === current) {
          return current;
        } else {
          timeout = setTimeout(
            goToPage,
            Math.abs(targetPage - current) > 2 ? 50 : 150
          );
          if (targetPage > current) {
            return current + 1;
          }
          if (targetPage < current) {
            return current - 1;
          }
        }
        return current;
      });
    };
    goToPage();
    return () => {
      clearTimeout(timeout);
    };
  }, [targetPage]);

  if (!pageCount) {
    return null;
  }

  return (
    <group {...props} rotation-y={-Math.PI / 2}>
      {pages.map((pageData, index) => (
        <Page
          key={`${selectedBook.id}-${index}`}
          page={delayedPage}
          number={index}
          opened={delayedPage > index}
          bookClosed={delayedPage === 0 || delayedPage === pageCount}
          pageCount={pageCount}
          {...pageData}
        />
      ))}
    </group>
  );
};
