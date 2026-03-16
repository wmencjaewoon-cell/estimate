"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SelectedMaterial, ScopeItem, HousingType } from "@/types";

type ProjectState = {
  address: string;
  detailAddress: string;
  housingType: HousingType;
  areaPyeong: number;
  scope: ScopeItem[];
  notes: string;
  selections: SelectedMaterial[];

  setBasicInfo: (payload: {
    address: string;
    detailAddress: string;
    housingType: HousingType;
    areaPyeong: number;
    scope: ScopeItem[];
    notes: string;
  }) => void;

  setSelection: (item: SelectedMaterial) => void;
  clearAll: () => void;
};

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      address: "",
      detailAddress: "",
      housingType: "apartment",
      areaPyeong: 24,
      scope: ["living_room", "kitchen", "bathroom"],
      notes: "",
      selections: [],

      setBasicInfo: (payload) =>
        set({
          address: payload.address,
          detailAddress: payload.detailAddress,
          housingType: payload.housingType,
          areaPyeong: payload.areaPyeong,
          scope: payload.scope,
          notes: payload.notes,
        }),

      setSelection: (item) =>
        set((state) => {
          const filtered = state.selections.filter(
            (s) => !(s.roomType === item.roomType && s.category === item.category)
          );
          return { selections: [...filtered, item] };
        }),

      clearAll: () =>
        set({
          address: "",
          detailAddress: "",
          housingType: "apartment",
          areaPyeong: 24,
          scope: ["living_room", "kitchen", "bathroom"],
          notes: "",
          selections: [],
        }),
    }),
    {
      name: "interior-project-store",
    }
  )
);