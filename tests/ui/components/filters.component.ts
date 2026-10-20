import type { Locator, Page } from '@playwright/test';

const PAGE_STEP = 20;
const MAX_KEY_PRESSES = 300;

export class Filters {
  readonly minPriceSlider: Locator;
  readonly maxPriceSlider: Locator;

  private readonly root: Locator;

  constructor(page: Page) {
    this.root = page.getByTestId('filters');
    this.minPriceSlider = this.root.getByRole('slider', {
      name: 'ngx-slider',
      exact: true,
    });
    this.maxPriceSlider = this.root.getByRole('slider', {
      name: 'ngx-slider-max',
    });
  }

  async check(label: string): Promise<void> {
    await this.root.getByRole('checkbox', { name: label, exact: true }).check();
  }

  async setPriceRange(min: number, max: number): Promise<void> {
    if (max >= (await sliderValue(this.minPriceSlider))) {
      await moveSlider(this.maxPriceSlider, max);
      await moveSlider(this.minPriceSlider, min);
    } else {
      await moveSlider(this.minPriceSlider, min);
      await moveSlider(this.maxPriceSlider, max);
    }
  }
}

async function sliderValue(slider: Locator): Promise<number> {
  return Number(await slider.getAttribute('aria-valuenow'));
}

async function moveSlider(slider: Locator, target: number): Promise<void> {
  for (let i = 0; i < MAX_KEY_PRESSES; i++) {
    const diff = target - (await sliderValue(slider));
    if (diff === 0) return;
    if (Math.abs(diff) >= PAGE_STEP) {
      await slider.press(diff > 0 ? 'PageUp' : 'PageDown');
    } else {
      await slider.press(diff > 0 ? 'ArrowRight' : 'ArrowLeft');
    }
  }
  throw new Error(`Price slider did not reach ${target}`);
}
