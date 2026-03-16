import type {
  EstimateItem,
  EstimateTotals,
  EstimateResult,
  SelectedMaterial,
} from "../types";

function getBaseQuantities(areaPyeong: number) {
  const areaM2 = areaPyeong * 3.3058;

  return {
    floorQty: areaM2,
    wallQty: areaM2 * 2.2,
    kitchenLength: Math.max(2.4, areaPyeong * 0.08),
    bathroomQty: areaPyeong >= 30 ? 2 : 1,
    bathroomTileQty: areaPyeong >= 30 ? 24 : 12,
    lightingQty: Math.ceil(areaPyeong / 3),
  };
}

export function calcUnitPrice(params: {
  material_unit_price?: number;
  labor_unit_price?: number;
  install_unit_price?: number;
}) {
  const material = Number(params.material_unit_price) || 0;
  const labor = Number(params.labor_unit_price) || 0;
  const install = Number(params.install_unit_price) || 0;

  return material + labor + install;
}


export function calculateEstimate(
  areaPyeong: number,
  selections: SelectedMaterial[]
): EstimateResult {
  const areaM2 = areaPyeong * 3.3058;

  const lineItems = [];
  let materialTotal = 0;
  let laborTotal = 0;

  selections.forEach((item) => {
    let quantity = 1;
    let unit = item.unit || "ea";

    switch (item.category) {
      case "floor":
        quantity = areaM2;
        unit = "m2";
        break;
      case "wall":
        quantity = areaM2 * 2.2;
        unit = "m2";
        break;
      case "kitchen_top":
        quantity = Math.max(2.4, areaPyeong * 0.08);
        unit = "m";
        break;
      case "kitchen_door":
        quantity = Math.max(10, areaPyeong * 0.35);
        unit = "m2";
        break;
      case "kitchen_faucet":
        quantity = 1;
        unit = "ea";
        break;
      case "bath_tile":
        quantity = areaPyeong >= 30 ? 24 : 12;
        unit = "m2";
        break;
      case "bath_sink":
      case "bath_shower":
        quantity = areaPyeong >= 30 ? 2 : 1;
        unit = "ea";
        break;
      case "lighting":
        quantity = Math.ceil(areaPyeong / 3);
        unit = "ea";
        break;
      default:
        quantity = 1;
        unit = item.unit || "ea";
    }

    const materialUnitPrice = Number(item.unitPrice) || 0;
    const laborUnitPrice = Math.round(materialUnitPrice * 0.35);
    const materialAmount = Math.round(quantity * materialUnitPrice);
    const laborAmount = Math.round(quantity * laborUnitPrice);

    materialTotal += materialAmount;
    laborTotal += laborAmount;

    lineItems.push({
      label: item.productName,
      category: item.category,
      quantity,
      unit,
      unitPrice: materialUnitPrice,
      totalPrice: materialAmount,
      lineType: "자재",
    });

    lineItems.push({
      label: `${item.productName} 시공비`,
      category: item.category,
      quantity,
      unit,
      unitPrice: laborUnitPrice,
      totalPrice: laborAmount,
      lineType: "시공",
    });
  });

  const demolitionTotal = areaPyeong > 0 ? Math.round(areaM2 * 20000) : 0;
  const etcTotal = Math.round(areaM2 * 10000);

  if (demolitionTotal > 0) {
    lineItems.push({
      label: "철거 / 폐기물 처리",
      category: "demolition",
      quantity: areaM2,
      unit: "m2",
      unitPrice: 20000,
      totalPrice: demolitionTotal,
      lineType: "철거",
    });
  }

  lineItems.push({
    label: "기타 비용",
    category: "etc",
    quantity: areaM2,
    unit: "m2",
    unitPrice: 10000,
    totalPrice: etcTotal,
    lineType: "기타",
  });

  const total =
    materialTotal +
    laborTotal +
    demolitionTotal +
    etcTotal;

  return {
    materialTotal,
    laborTotal,
    demolitionTotal,
    etcTotal,
    total,
    lineItems,
  };
}

export function calcItemAmount(params: {
  quantity?: number;
  unit_price?: number;
}) {
  const quantity = Number(params.quantity) || 0;
  const unitPrice = Number(params.unit_price) || 0;

  return Math.round(quantity * unitPrice);
}

export function normalizeEstimateItem(item: Partial<EstimateItem>): EstimateItem {
  const quantity = Number(item.quantity) || 0;
  const materialUnitPrice = Number(item.material_unit_price) || 0;
  const laborUnitPrice = Number(item.labor_unit_price) || 0;
  const installUnitPrice = Number(item.install_unit_price) || 0;

  const unitPrice = calcUnitPrice({
    material_unit_price: materialUnitPrice,
    labor_unit_price: laborUnitPrice,
    install_unit_price: installUnitPrice,
  });

  const amount = calcItemAmount({
    quantity,
    unit_price: unitPrice,
  });

  return {
    id: item.id,
    material_id: item.material_id ?? null,
    work_name: item.work_name ?? "",
    detail_name: item.detail_name ?? "",
    product_name: item.product_name ?? "",
    unit: item.unit ?? "ea",
    quantity,
    material_unit_price: materialUnitPrice,
    labor_unit_price: laborUnitPrice,
    install_unit_price: installUnitPrice,
    unit_price: unitPrice,
    amount,
    note: item.note ?? "",
  };
}

export function calcEstimateTotals(params: {
  items: EstimateItem[];
  profitRate?: number;
  discountAmount?: number;
}): EstimateTotals {
  const subtotal = params.items.reduce((sum, item) => {
    return sum + (Number(item.amount) || 0);
  }, 0);

  const profitRate = Number(params.profitRate) || 0;
  const discountAmount = Number(params.discountAmount) || 0;
  const profitAmount = Math.round(subtotal * (profitRate / 100));
  const total = subtotal + profitAmount - discountAmount;

  return {
    subtotal,
    profitAmount,
    total,
  };
}