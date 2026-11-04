import { iconElementTags, type IconDefinition } from '@mingcute/core';

const tags = new Set<string>(iconElementTags);
const viewBoxPattern = /^-?(?:\d+\.?\d*|\.\d+)(?:\s+-?(?:\d+\.?\d*|\.\d+)){3}$/;
const dangerousValue = /(?:javascript:|data:text\/html|<script)/i;
const resourceIdPattern = /^[A-Za-z_][A-Za-z0-9_.:-]*$/;

export class IconValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IconValidationError';
  }
}

/**
 * Validates a complete framework-neutral icon definition.
 *
 * All renderable geometry, including mask and clip-path children, is checked
 * before a definition can cross into framework adapters.
 */
export function validateIconDefinition(definition: IconDefinition): IconDefinition {
  if (!definition.name.trim()) throw new IconValidationError('Icon name cannot be empty.');
  if (!definition.componentName.trim()) throw new IconValidationError('Component name cannot be empty.');
  if (!viewBoxPattern.test(definition.viewBox)) {
    throw new IconValidationError(`Invalid SVG viewBox: ${definition.viewBox}`);
  }
  const [, , width, height] = definition.viewBox.split(/\s+/).map(Number);
  if (!(width > 0 && height > 0)) throw new IconValidationError('SVG viewBox must have positive dimensions.');
  if (!definition.elements.length) throw new IconValidationError('Icon must contain at least one supported SVG element.');
  validateElements(definition.elements);
  const gradientIds = new Set<string>();
  for (const gradient of definition.gradients ?? []) {
    if (!resourceIdPattern.test(gradient.id) || gradientIds.has(gradient.id)) {
      throw new IconValidationError(`Invalid or duplicate gradient id: ${gradient.id}`);
    }
    gradientIds.add(gradient.id);
    if (!gradient.stops.length) throw new IconValidationError(`Gradient #${gradient.id} has no stops.`);
    for (const stop of gradient.stops) {
      if (/[;{}]|url\s*\(/i.test(stop.color)) {
        throw new IconValidationError(`Gradient #${gradient.id} contains an unsafe color value.`);
      }
    }
  }
  const resourceIds = new Set(gradientIds);
  for (const mask of definition.masks ?? []) {
    if (!resourceIdPattern.test(mask.id) || resourceIds.has(mask.id)) {
      throw new IconValidationError(`Invalid or duplicate resource id: ${mask.id}`);
    }
    if (!mask.elements.length) throw new IconValidationError(`Mask #${mask.id} has no elements.`);
    validateElements(mask.elements);
    resourceIds.add(mask.id);
  }
  for (const clipPath of definition.clipPaths ?? []) {
    if (!resourceIdPattern.test(clipPath.id) || resourceIds.has(clipPath.id)) {
      throw new IconValidationError(`Invalid or duplicate resource id: ${clipPath.id}`);
    }
    if (!clipPath.elements.length) throw new IconValidationError(`Clip path #${clipPath.id} has no elements.`);
    validateElements(clipPath.elements);
    resourceIds.add(clipPath.id);
  }
  for (const pattern of definition.patterns ?? []) {
    if (!resourceIdPattern.test(pattern.id) || resourceIds.has(pattern.id)) {
      throw new IconValidationError(`Invalid or duplicate resource id: ${pattern.id}`);
    }
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(pattern.image.data)) {
      throw new IconValidationError(`Pattern #${pattern.id} contains invalid base64 image data.`);
    }
    resourceIds.add(pattern.id);
  }
  if (definition.groupMask) {
    const match = definition.groupMask.match(/^url\(#([A-Za-z_][A-Za-z0-9_.:-]*)\)$/);
    if (!match || !(definition.masks ?? []).some((mask) => mask.id === match[1])) {
      throw new IconValidationError('Icon body references a missing or invalid group mask.');
    }
  }
  const referencedElements = [
    ...definition.elements,
    ...(definition.masks ?? []).flatMap(({ elements }) => elements),
    ...(definition.clipPaths ?? []).flatMap(({ elements }) => elements),
  ];
  for (const element of referencedElements) {
    for (const value of Object.values(element.attributes)) {
      for (const match of String(value).matchAll(/url\(#([^)]+)\)/g)) {
        if (!resourceIds.has(match[1])) {
          throw new IconValidationError(`Element references missing SVG resource #${match[1]}.`);
        }
      }
    }
  }
  return definition;
}

function validateElements(elements: IconDefinition['elements']): void {
  for (const element of elements) {
    if (!tags.has(element.tag)) throw new IconValidationError(`Unsupported icon element: ${element.tag}`);
    if (element.tag === 'path' && typeof element.attributes.d !== 'string') {
      throw new IconValidationError('Path elements must define a d attribute.');
    }
    for (const [name, value] of Object.entries(element.attributes)) {
      if (/^on/i.test(name) || dangerousValue.test(String(value))) {
        throw new IconValidationError(`Unsafe SVG attribute: ${name}`);
      }
    }
  }
}
