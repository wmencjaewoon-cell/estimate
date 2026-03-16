"use client";

import { SelectedMaterial } from "../types";

type Props = {
  selections: SelectedMaterial[];
};

function getWallStyle(selections: SelectedMaterial[]) {
  const wall = selections.find((s) => s.category === "wall");
  switch (wall?.previewStyleKey) {
    case "wall_ivory_soft":
      return "linear-gradient(to bottom, #f8f1e6, #efe4d1)";
    case "wall_white_clean":
    default:
      return "linear-gradient(to bottom, #ffffff, #f3f4f6)";
  }
}

function getFloorStyle(selections: SelectedMaterial[]) {
  const floor = selections.find((s) => s.category === "floor");
  switch (floor?.previewStyleKey) {
    case "floor_gray_modern":
      return "repeating-linear-gradient(90deg, #b9bec6 0px, #b9bec6 80px, #a7adb6 80px, #a7adb6 84px)";
    case "wood_oak_light":
    default:
      return "repeating-linear-gradient(90deg, #d8bc96 0px, #d8bc96 90px, #c99f6a 90px, #c99f6a 94px)";
  }
}

function getKitchenDoorStyle(selections: SelectedMaterial[]) {
  const door = selections.find((s) => s.category === "kitchen_door");
  switch (door?.previewStyleKey) {
    case "kitchen_beige_soft":
      return "#d8c3a5";
    case "kitchen_white_modern":
    default:
      return "#f3f4f6";
  }
}

function getKitchenTopStyle(selections: SelectedMaterial[]) {
  const top = selections.find((s) => s.category === "kitchen_top");
  switch (top?.previewStyleKey) {
    case "kitchen_top_gray_stone":
      return "linear-gradient(135deg, #9ca3af, #6b7280)";
    case "kitchen_top_white_marble":
    default:
      return "linear-gradient(135deg, #ffffff, #e5e7eb)";
  }
}

function getBathTileStyle(selections: SelectedMaterial[]) {
  const tile = selections.find((s) => s.category === "bath_tile");
  switch (tile?.previewStyleKey) {
    case "tile_gray_matte":
      return "repeating-linear-gradient(0deg, #c7ccd3 0px, #c7ccd3 58px, #f9fafb 58px, #f9fafb 60px), repeating-linear-gradient(90deg, #c7ccd3 0px, #c7ccd3 58px, #f9fafb 58px, #f9fafb 60px)";
    case "tile_ivory_matte":
    default:
      return "repeating-linear-gradient(0deg, #ece0cf 0px, #ece0cf 58px, #ffffff 58px, #ffffff 60px), repeating-linear-gradient(90deg, #ece0cf 0px, #ece0cf 58px, #ffffff 58px, #ffffff 60px)";
  }
}

function getShowerStyle(selections: SelectedMaterial[]) {
  const shower = selections.find((s) => s.category === "bath_shower");
  switch (shower?.previewStyleKey) {
    case "shower_black_modern":
      return "#111827";
    case "shower_chrome_basic":
    default:
      return "#6b7280";
  }
}

export default function PreviewCard({ selections }: Props) {
  const wallStyle = getWallStyle(selections);
  const floorStyle = getFloorStyle(selections);
  const kitchenDoorStyle = getKitchenDoorStyle(selections);
  const kitchenTopStyle = getKitchenTopStyle(selections);
  const bathTileStyle = getBathTileStyle(selections);
  const showerStyle = getShowerStyle(selections);

  return (
    <div className="room-preview-box">
      <div className="room-preview-top">
        <h3 style={{ fontWeight: 800, fontSize: 18 }}>샘플 미리보기</h3>
        <p className="small-muted" style={{ marginTop: 6 }}>
          현재 화면은 실제 단지 도면이 아닌, 유사 평형 샘플 공간에 선택 자재
          분위기를 적용한 예시입니다.
        </p>
      </div>

      <div className="room-scene">
        <div className="scene-room">
          <div className="scene-wall" style={{ background: wallStyle }}>
            <div className="scene-kitchen">
              <div
                className="scene-counter"
                style={{ background: kitchenTopStyle }}
              />
              <div
                className="scene-cabinet"
                style={{ background: kitchenDoorStyle }}
              />
            </div>
          </div>
          <div className="scene-floor" style={{ background: floorStyle }} />
        </div>

        <div className="scene-bath-card">
          <div className="scene-bath-wall" style={{ background: bathTileStyle }} />
          <div className="scene-sink" />
          <div className="scene-shower" style={{ background: showerStyle }} />
        </div>
      </div>
    </div>
  );
}