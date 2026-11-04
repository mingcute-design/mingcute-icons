export type AttributeValue = string | number;
export interface IconElementData { tag: string; attributes: Record<string, AttributeValue>; }
export interface IconGradientStopData { offset: string | number; color: string; opacity?: string | number; }
export interface IconGradientData { id: string; type: 'linear' | 'radial' | 'angular'; attributes: Record<string, AttributeValue>; stops: IconGradientStopData[]; }
export interface IconResourceData { id: string; attributes: Record<string, AttributeValue>; elements: IconElementData[]; }
export interface IconPatternData { id: string; attributes: Record<string, AttributeValue>; image: { mimeType: string; data: string; attributes: Record<string, AttributeValue>; transform?: string }; }
export interface IconDefinitionData {
  viewBox: string; elements: IconElementData[]; groupMask?: string; gradients?: IconGradientData[];
  masks?: IconResourceData[]; clipPaths?: IconResourceData[]; patterns?: IconPatternData[];
}
export interface MingcuteIconConstructor extends CustomElementConstructor {
  readonly source: IconDefinitionData;
  readonly iconName: string;
}
